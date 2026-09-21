const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },

    topic: {
      type: String,
      required: true
    },

    subtopic: {
      type: String,
      required: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },

    bloomLevel: {
      type: String,
      required: true
    },

    question: {
      type: String,
      required: true
    },

    options: {
      type: [String],
      required: true
    },

    correctAnswer: {
      type: String,
      required: true
    },

    explanation: {
      type: String,
      required: true
    },

    // NEW
    generationType: {
      type: String,
      enum: [
        "standard",
        "adaptive-retest",
      ],
      default: "standard",
    },

    // NEW
    parentAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      default: null,
    },

  },

  {
    timestamps: true
  }
);
// const Question = mongoose.model("Question", questionSchema);

module.exports = mongoose.model("Question", questionSchema);