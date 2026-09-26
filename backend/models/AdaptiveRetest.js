const mongoose = require("mongoose");

const adaptiveRetestSchema =
  new mongoose.Schema(
    {
      sourceAttemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attempt",
        required: true,
      },

      performanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Performance",
        required: true,
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      targetTopic: {
        type: String,
        required: true,
      },

      targetSubtopic: {
        type: String,
        required: true,
      },

      targetConcept: {
        type: String,
        required: true,
      },

      gapScore: {
        type: Number,
        required: true,
      },

      strategy: {
        type: Object,
        required: true,
      },

      questionIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      ],

      status: {
        type: String,
        enum: [
          "generated",
          "completed",
        ],
        default: "generated",
      },

      retestAttemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attempt",
        default: null,
      },

      improvement: {
        type: Object,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const AdaptiveRetest =
  mongoose.model(
    "AdaptiveRetest",
    adaptiveRetestSchema
  );

module.exports = AdaptiveRetest;