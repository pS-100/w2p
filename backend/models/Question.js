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

     concept: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },

     bloomLevel: {
      type: String,
      enum: [
        "remember",
        "understand",
        "apply",
        "analyze",
        "evaluate",
        "create",
      ],
      required: true,
    },

    question: {
      type: String,
      required: true
    },

     options: {
      type: [String],
      required: true,
      validate: {
        validator: function (options) {
          return options.length === 4;
        },
        message: "A question must have exactly 4 options.",
      },
    },


     correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      required: true,
      trim: true,
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