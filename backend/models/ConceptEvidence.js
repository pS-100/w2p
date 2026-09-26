const mongoose = require("mongoose");

const conceptEvidenceSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      subject: {
        type: String,
        required: true,
        trim: true,
      },

      topic: {
        type: String,
        required: true,
        trim: true,
      },

      subtopic: {
        type: String,
        required: true,
        trim: true,
      },

      concept: {
        type: String,
        required: true,
        trim: true,
      },

      totalQuestions: {
        type: Number,
        default: 0,
      },

      attemptedQuestions: {
        type: Number,
        default: 0,
      },

      skippedQuestions: {
        type: Number,
        default: 0,
      },

      correctAnswers: {
        type: Number,
        default: 0,
      },

      wrongAnswers: {
        type: Number,
        default: 0,
      },

      accuracy: {
        type: Number,
        default: 0,
      },

      averageResponseTime: {
        type: Number,
        default: 0,
      },

      timeEfficiencyScore: {
        type: Number,
        default: 0,
      },

      consistencyScore: {
        type: Number,
        default: 0,
      },

      difficultyHandlingScore: {
        type: Number,
        default: 0,
      },

      learningGapScore: {
        type: Number,
        default: 0,
      },

      status: {
        type: String,
        enum: [
          "strong",
          "average",
          "weak",
          "insufficient-data",
        ],
        default: "insufficient-data",
      },

      attemptsCount: {
        type: Number,
        default: 0,
      },

      sourceAttemptIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attempt",
        },
      ],

      lastAttemptAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

conceptEvidenceSchema.index(
  {
    userId: 1,
    subject: 1,
    topic: 1,
    subtopic: 1,
    concept: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "ConceptEvidence",
    conceptEvidenceSchema
  );