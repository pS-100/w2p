const mongoose = require("mongoose");

const conceptCoverageSchema = new mongoose.Schema(
  {
    concept: {
      type: String,
      required: true,
      trim: true,
    },

    questionCountGenerated: {
      type: Number,
      default: 0,
    },

    assessed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const topicCoverageSchema = new mongoose.Schema(
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

    concepts: {
      type: [conceptCoverageSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

topicCoverageSchema.index(
  {
    userId: 1,
    subject: 1,
    topic: 1,
    subtopic: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "TopicCoverage",
    topicCoverageSchema
  );