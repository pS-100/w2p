const mongoose = require("mongoose");

const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const Performance = require("../models/Performance");

const {
  analyzePerformance,
} = require("../services/performanceAnalyzer");

const analyzeAttempt = async (
  req,
  res
) => {
  try {
    const { attemptId } =
      req.params;

    const attempt = await Attempt.findById(attemptId);


    // --------------------------------
    // Validate ID
    // --------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        attemptId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid attemptId",
      });
    }

    // --------------------------------
    // Find attempt
    // --------------------------------


    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found.",
      });
    }

    if (attempt.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to view this attempt.",
      });
    }

    // --------------------------------
    // Check existing analysis
    // --------------------------------

    const existingPerformance =
      await Performance.findOne({
        attemptId:
          attempt._id,
      });

    if (existingPerformance) {
      return res.status(200).json({
        message:
          "Performance already analyzed",

        performance:
          existingPerformance,
      });
    }

    // --------------------------------
    // Question IDs
    // --------------------------------

    const questionIds =
      attempt.answers.map(
        (answer) =>
          answer.questionId
      );

    // --------------------------------
    // Fetch questions
    // --------------------------------

    const questions =
      await Question.find({
        _id: {
          $in: questionIds,
        },
      });

    if (
      questions.length !==
      questionIds.length
    ) {
      return res.status(400).json({
        message:
          "Some questions from this attempt were not found",
      });
    }

    // --------------------------------
    // Analyze
    // --------------------------------

    const analysis =
      analyzePerformance(
        attempt,
        questions
      );

    // --------------------------------
    // Save
    // --------------------------------

    const performance =
      await Performance.create({
        attemptId:
          attempt._id,

        userId:
          attempt.userId,

        score:
          analysis.score,

        totalQuestions:
          analysis.totalQuestions,

        attemptedQuestions:
          analysis.attemptedQuestions,

        skippedQuestions:
          analysis.skippedQuestions,

        percentage:
          analysis.percentage,

        overallAccuracy:
          analysis.overallAccuracy,

        averageResponseTime:
          analysis.averageResponseTime,

        medianResponseTime:
          analysis.medianResponseTime,

        responseTimeStdDev:
          analysis.responseTimeStdDev,

        responseTimeConsistency:
          analysis.responseTimeConsistency,

        timeEfficiencyScore:
          analysis.timeEfficiencyScore,

        difficultyHandlingScore:
          analysis.difficultyHandlingScore,

        consistencyScore:
          analysis.consistencyScore,

        learningGapScore:
          analysis.learningGapScore,

        confidenceScore:
          analysis.confidenceScore,

        topicPerformance:
          analysis.topicPerformance,

        difficultyPerformance:
          analysis.difficultyPerformance,

        weakAreas:
          analysis.weakAreas,

        strongAreas:
          analysis.strongAreas,

        learningGaps:
          analysis.learningGaps,

        recommendations:
          analysis.recommendations,

        analysisVersion:
          "1.0",
      });

    return res.status(201).json({
      message:
        "Performance analyzed successfully",

      performance,
    });
  } catch (error) {
    console.error(
      "Performance Analysis Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to analyze performance",

      error: error.message,
    });
  }
};

module.exports = {
  analyzeAttempt,
};