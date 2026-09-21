// // const mongoose = require("mongoose");

// // const Attempt = require("../models/Attempt");
// // const Question = require("../models/Question");

// // const { submitAttemptSchema } = require("../validators/attemptValidator");

// // const submitAttempt = async (req, res) => {
// //   try {
// //     // 1. Validate request
// //     const { error, value } = submitAttemptSchema.validate(req.body);

// //     if (error) {
// //       return res.status(400).json({
// //         message: error.details[0].message,
// //       });
// //     }

// //     const { userId, testId, answers } = value;

// //     // 2. Validate IDs
// //     if (!mongoose.Types.ObjectId.isValid(userId)) {
// //       return res.status(400).json({
// //         message: "Invalid userId",
// //       });
// //     }

// //     if (!mongoose.Types.ObjectId.isValid(testId)) {
// //       return res.status(400).json({
// //         message: "Invalid testId",
// //       });
// //     }
// // // 
// //     // 3. Get all question IDs
// //     const questionIds = answers.map((answer) => answer.questionId);

// //     // 4. Find questions in MongoDB
// //     const questions = await Question.find({
// //       _id: { $in: questionIds },
// //     });

// //     // 5. Create a lookup map
// //     const questionMap = new Map();

// //     questions.forEach((question) => {
// //       questionMap.set(question._id.toString(), question);
// //     });

// //     let score = 0;

// //     const processedAnswers = answers.map((answer) => {
// //       const question = questionMap.get(answer.questionId);

// //       if (!question) {
// //         throw new Error(
// //           `Question not found: ${answer.questionId}`
// //         );
// //       }

// //       const isCorrect =
// //         answer.selectedAnswer.trim().toLowerCase() ===
// //         question.correctAnswer.trim().toLowerCase();

// //       if (isCorrect) {
// //         score++;
// //       }

// //       return {
// //         questionId: question._id,
// //         selectedAnswer: answer.selectedAnswer,
// //         isCorrect,
// //         responseTime: answer.responseTime || 0,
// //       };
// //     });

// //     // 6. Calculate percentage
// //     const totalQuestions = processedAnswers.length;

// //     const percentage =
// //       totalQuestions === 0
// //         ? 0
// //         : Number(((score / totalQuestions) * 100).toFixed(2));

// //     // 7. Save attempt
// //     const attempt = await Attempt.create({
// //       userId,
// //       testId,
// //       answers: processedAnswers,
// //       score,
// //       totalQuestions,
// //       percentage,
// //     });

// //     // 8. Send response
// //     res.status(201).json({
// //       message: "Test submitted successfully",

// //       result: {
// //         attemptId: attempt._id,
// //         score,
// //         totalQuestions,
// //         percentage,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Submit Attempt Error:", error);

// //     res.status(500).json({
// //       message: "Failed to submit test",
// //       error: error.message,
// //     });
// //   }
// // };

// // module.exports = {
// //   submitAttempt,
// // };



// const mongoose = require("mongoose");

// const Attempt = require("../models/Attempt");
// const Question = require("../models/Question");

// const {
//   submitAttemptSchema,
// } = require("../validators/attemptValidator");

// const submitAttempt = async (req, res) => {
//   try {
//     // 1. Validate request body
//     const { error, value } = submitAttemptSchema.validate(req.body);

//     if (error) {
//       return res.status(400).json({
//         message: error.details[0].message,
//       });
//     }

//     const {
//       userId,
//       answers,
//     } = value;

//     // 2. Validate userId if provided
//     if (
//       userId &&
//       !mongoose.Types.ObjectId.isValid(userId)
//     ) {
//       return res.status(400).json({
//         message: "Invalid userId",
//       });
//     }

//     // 3. Extract question IDs
//     const questionIds = answers.map(
//       (answer) => answer.questionId
//     );

//     // 4. Validate question IDs
//     const invalidQuestionId = questionIds.find(
//       (id) => !mongoose.Types.ObjectId.isValid(id)
//     );

//     if (invalidQuestionId) {
//       return res.status(400).json({
//         message: `Invalid questionId: ${invalidQuestionId}`,
//       });
//     }

//     // 5. Get questions from MongoDB
//     const questions = await Question.find({
//       _id: {
//         $in: questionIds,
//       },
//     });

//     // 6. Check whether all questions exist
//     if (questions.length !== questionIds.length) {
//       return res.status(400).json({
//         message: "One or more questions were not found",
//       });
//     }

//     // 7. Create question lookup map
//     const questionMap = new Map();

//     questions.forEach((question) => {
//       questionMap.set(
//         question._id.toString(),
//         question
//       );
//     });

//     let score = 0;

//     // 8. Check each answer
//     const processedAnswers = answers.map((answer) => {
//       const question = questionMap.get(
//         answer.questionId
//       );

//       const selectedAnswer =
//         answer.selectedAnswer.trim();

//       const correctAnswer =
//         question.correctAnswer.trim();

//       const isCorrect =
//         selectedAnswer !== "" &&
//         selectedAnswer.toLowerCase() ===
//           correctAnswer.toLowerCase();

//       if (isCorrect) {
//         score++;
//       }

//       return {
//         questionId: question._id,
//         selectedAnswer,
//         isCorrect,
//         responseTime: answer.responseTime || 0,
//       };
//     });

//     // 9. Calculate total questions
//     const totalQuestions =
//       processedAnswers.length;

//     // 10. Calculate percentage
//     const percentage =
//       totalQuestions > 0
//         ? Number(
//             ((score / totalQuestions) * 100).toFixed(2)
//           )
//         : 0;

//     // 11. Save attempt
//     const attempt = await Attempt.create({
//       userId: userId || undefined,
//       answers: processedAnswers,
//       score,
//       totalQuestions,
//       percentage,
//     });

//     // 12. Send result
//     return res.status(201).json({
//       message: "Test submitted successfully",

//       result: {
//         attemptId: attempt._id,
//         score,
//         totalQuestions,
//         percentage,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Submit Attempt Error:",
//       error
//     );

//     return res.status(500).json({
//       message: "Failed to submit test",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   submitAttempt,
// };

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

    // const {
    //   userId,
    //   answers,
    // } = value;

    const {
      // userId,
      answers,
      attemptType,
      parentAttemptId,
    } = value;

    const userId = req.userId;

    console.log("AUTHENTICATED USER ID:", req.userId);

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
    // ----------------------------------
    // Validate question IDs
    // ----------------------------------

    const questionIds = answers.map(
      (answer) => answer.questionId
    );

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

    // const attempt =
    //   await Attempt.create({
    //     userId: userId || undefined,

    //     answers: processedAnswers,

    //     score,

    //     totalQuestions,

    //     attemptedQuestions,

    //     skippedQuestions,

    //     percentage,
    //   });

    const attempt =
  await Attempt.create({
    userId:
      userId || undefined,

    answers:
      processedAnswers,

    score,

    totalQuestions,

    attemptedQuestions,

    skippedQuestions,

    percentage,

    attemptType:
      attemptType ||
      "standard",

    parentAttemptId:
      parentAttemptId ||
      null,
  });

  if (
  attemptType ===
  "adaptive-retest" &&
  parentAttemptId
) {
  await AdaptiveRetest.findOneAndUpdate(
    {
      sourceAttemptId:
        parentAttemptId,

      status:
        "generated",
    },
    {
      retestAttemptId:
        attempt._id,

      status:
        "completed",
    },
    {
      sort: {
        createdAt: -1,
      },
    }
  );
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