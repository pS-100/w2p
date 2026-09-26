const mongoose = require("mongoose");

const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const AdaptiveRetest =
  require(
    "../models/AdaptiveRetest"
  );

const {
  submitAttemptSchema,
} = require("../validators/attemptValidator");

const submitAttempt = async (req, res) => {
  try {
    const { error, value } =
      submitAttemptSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }


    const {
      assessmentId,
      answers,
      attemptType,
      parentAttemptId,
      retestId,
    } = value;

    const userId = req.userId;
    if (!assessmentId || !assessmentId.trim()) {
      return res.status(400).json({
        message: "assessmentId is required.",
      });
    }

    console.log("AUTHENTICATED USER ID:", req.userId);


    // ----------------------------------
    // Validate assessment ID
    // ----------------------------------

    if (!assessmentId || !assessmentId.trim()) {
      return res.status(400).json({
        message: "assessmentId is required.",
      });
    }

    // ----------------------------------
    // Prevent duplicate submission
    // ----------------------------------

    const existingAttempt =
      await Attempt.findOne({
        assessmentId: assessmentId.trim(),
      });

    if (existingAttempt) {
      return res.status(409).json({
        message:
          "This assessment has already been submitted.",
        alreadySubmitted: true,
        result: {
          attemptId: existingAttempt._id,
          score: existingAttempt.score,
          totalQuestions:
            existingAttempt.totalQuestions,
          attemptedQuestions:
            existingAttempt.attemptedQuestions,
          skippedQuestions:
            existingAttempt.skippedQuestions,
          percentage:
            existingAttempt.percentage,
        },
      });
    }



    // ----------------------------------
    // Validate user ID
    // ----------------------------------

    if (
      userId &&
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }
    if (
      parentAttemptId &&
      !mongoose.Types.ObjectId.isValid(
        parentAttemptId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid parentAttemptId",
      });
    }


    if (
      retestId &&
      !mongoose.Types.ObjectId.isValid(
        retestId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid retestId",
      });
    }

    let adaptiveRetest = null;

    if (attemptType === "adaptive-retest") {
      adaptiveRetest =
        await AdaptiveRetest.findById(retestId);

      if (!adaptiveRetest) {
        return res.status(404).json({
          message: "Adaptive re-test not found.",
        });
      }

      if (
        adaptiveRetest.userId.toString() !==
        req.userId.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to submit this adaptive re-test.",
        });
      }

      if (
        adaptiveRetest.sourceAttemptId.toString() !==
        parentAttemptId.toString()
      ) {
        return res.status(400).json({
          message:
            "Adaptive re-test does not belong to the specified parent attempt.",
        });
      }

      if (
        adaptiveRetest.status === "completed"
      ) {
        return res.status(409).json({
          message:
            "This adaptive re-test has already been completed.",
        });
      }
    }


    // ----------------------------------
    // Validate question IDs
    // ----------------------------------

    const questionIds = answers.map(
      (answer) => answer.questionId
    );

    const uniqueQuestionIds = new Set(questionIds);

    if (
      uniqueQuestionIds.size !== questionIds.length
    ) {
      return res.status(400).json({
        message:
          "Duplicate question IDs are not allowed.",
      });
    }

    const invalidQuestionId =
      questionIds.find(
        (id) =>
          !mongoose.Types.ObjectId.isValid(id)
      );

    if (invalidQuestionId) {
      return res.status(400).json({
        message: `Invalid questionId: ${invalidQuestionId}`,
      });
    }

    // ----------------------------------
    // Fetch questions
    // ----------------------------------

    const questions = await Question.find({
      _id: {
        $in: questionIds,
      },
    });

    if (
      questions.length !== questionIds.length
    ) {
      return res.status(400).json({
        message:
          "One or more questions were not found",
      });
    }

    // ----------------------------------
    // Question lookup
    // ----------------------------------

    const questionMap = new Map();

    questions.forEach((question) => {
      questionMap.set(
        question._id.toString(),
        question
      );
    });

    // ----------------------------------
    // Process answers
    // ----------------------------------

    let score = 0;
    let skippedQuestions = 0;

    const processedAnswers =
      answers.map((answer) => {
        const question =
          questionMap.get(
            answer.questionId
          );

        const selectedAnswer =
          answer.selectedAnswer.trim();

        const correctAnswer =
          question.correctAnswer.trim();

        const isSkipped =
          selectedAnswer === "";

        const isCorrect =
          !isSkipped &&
          selectedAnswer.toLowerCase() ===
          correctAnswer.toLowerCase();

        if (isCorrect) {
          score++;
        }

        if (isSkipped) {
          skippedQuestions++;
        }

        return {
          questionId: question._id,

          selectedAnswer,

          isCorrect,

          isSkipped,

          responseTime:
            answer.responseTime || 0,
        };
      });

    // ----------------------------------
    // Calculate totals
    // ----------------------------------

    const totalQuestions =
      processedAnswers.length;

    const attemptedQuestions =
      totalQuestions -
      skippedQuestions;

    const percentage =
      totalQuestions > 0
        ? Number(
          (
            (score / totalQuestions) *
            100
          ).toFixed(2)
        )
        : 0;



    
    // ----------------------------------
    // Save attempt
    // ----------------------------------



    const attempt = await Attempt.create({
      userId: userId || undefined,

      assessmentId: assessmentId.trim(),

      status: "submitted",

      answers: processedAnswers,

      score,

      totalQuestions,

      attemptedQuestions,

      skippedQuestions,

      percentage,

      attemptType:
        attemptType || "standard",

      parentAttemptId:
        parentAttemptId || null,

      retestId:
        attemptType === "adaptive-retest"
          ? retestId
          : null,
    }); 

    if (
      attemptType === "adaptive-retest" &&
      adaptiveRetest
    ) {
      adaptiveRetest.retestAttemptId =
        attempt._id;

      adaptiveRetest.status =
        "completed";

      await adaptiveRetest.save();
    }

    return res.status(201).json({
      message:
        "Test submitted successfully",

      result: {
        attemptId: attempt._id,

        score,

        totalQuestions,

        attemptedQuestions,

        skippedQuestions,

        percentage,
      },
    });
  } catch (error) {
    console.error(
      "Submit Attempt Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to submit test",

      error: error.message,
    });
  }
};

module.exports = {
  submitAttempt,
};