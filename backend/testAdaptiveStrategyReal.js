const mongoose = require("mongoose");

const Performance = require("./models/Performance");

const {
  buildAdaptiveStrategy,
} = require("./services/adaptiveStrategy");

require("dotenv").config();

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected."
    );

    const performance =
      await Performance.findById(
        "6ab6518ceee51517e90b4214"
      ).lean();

    if (!performance) {
      throw new Error(
        "Performance not found."
      );
    }

    console.log(
      "\nWeak Concepts:"
    );

    console.dir(
      performance.weakConcepts,
      { depth: null }
    );

    const strategy =
      buildAdaptiveStrategy(
        performance
      );

    console.log(
      "\nAdaptive Strategy:"
    );

    console.dir(
      strategy,
      { depth: null }
    );

    await mongoose.disconnect();

  } catch (error) {
    console.error(
      "\nTest failed:",
      error
    );

    process.exit(1);
  }
};

run();