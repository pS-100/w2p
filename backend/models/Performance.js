const mongoose = require("mongoose");

const metricSchema =
  new mongoose.Schema(
    {
      value: Number,
      score: Number,
    },
    {
      _id: false,
    }
  );

const topicPerformanceSchema =
  new mongoose.Schema(
    {
      topic: String,
      subtopic: String,

      totalQuestions: Number,
      attemptedQuestions: Number,
      skippedQuestions: Number,

      correctAnswers: Number,
      wrongAnswers: Number,

      accuracy: Number,

      averageResponseTime: Number,
      medianResponseTime: Number,

      timeEfficiencyScore: Number,

      consistencyScore: Number,

      difficultyAccuracy: {
        easy: Number,
        medium: Number,
        hard: Number,
      },

      difficultyHandlingScore: Number,

      fastWrongCount: Number,
      slowCorrectCount: Number,
      slowWrongCount: Number,

      gapScore: Number,

      status: {
        type: String,
        enum: [
          "strong",
          "average",
          "weak",
        ],
      },

      gapReasons: [String],
    },
    {
      _id: false,
    }
  );

const difficultyPerformanceSchema =
  new mongoose.Schema(
    {
      difficulty: String,

      totalQuestions: Number,
      attemptedQuestions: Number,

      correctAnswers: Number,
      wrongAnswers: Number,
      skippedQuestions: Number,

      accuracy: Number,

      averageResponseTime: Number,

      timeEfficiencyScore: Number,
    },
    {
      _id: false,
    }
  );

const performanceSchema =
  new mongoose.Schema(
    {
      attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attempt",
        required: true,
        unique: true,
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      score: Number,

      totalQuestions: Number,

      attemptedQuestions: Number,

      skippedQuestions: Number,

      percentage: Number,

      overallAccuracy: Number,

      averageResponseTime: Number,

      medianResponseTime: Number,

      responseTimeStdDev: Number,

      responseTimeConsistency: Number,

      timeEfficiencyScore: Number,

      difficultyHandlingScore: Number,

      consistencyScore: Number,

      learningGapScore: Number,

      confidenceScore: Number,

      topicPerformance: [
        topicPerformanceSchema,
      ],

      difficultyPerformance: [
        difficultyPerformanceSchema,
      ],

      weakAreas: [
        topicPerformanceSchema,
      ],

      strongAreas: [
        topicPerformanceSchema,
      ],

      learningGaps: [
        {
          topic: String,
          subtopic: String,
          gapScore: Number,
          reasons: [String],
        },
      ],

      recommendations: [String],

      analysisVersion: {
        type: String,
        default: "1.0",
      },
    },
    {
      timestamps: true,
    }
  );

const Performance =
  mongoose.model(
    "Performance",
    performanceSchema
  );

module.exports = Performance;