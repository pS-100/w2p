const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    selectedAnswer: {
      type: String,
      default: "",
    },

    isCorrect: {
      type: Boolean,
      required: true,
    },

    isSkipped: {
      type: Boolean,
      default: false,
    },

    responseTime: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // NEW
    assessmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // NEW
    status: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
    },

    answers: {
      type: [answerSchema],
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    attemptedQuestions: {
      type: Number,
      required: true,
    },

    skippedQuestions: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    attemptType: {
      type: String,
      enum: [
        "standard",
        "adaptive-retest",
      ],
      default: "standard",
    },

    parentAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      default: null,
    },

    retestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdaptiveRetest",
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

const Attempt = mongoose.model(
  "Attempt",
  attemptSchema
);

module.exports = Attempt;