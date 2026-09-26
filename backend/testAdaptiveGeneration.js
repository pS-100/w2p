require("dotenv").config();

const mongoose = require("mongoose");

const Performance = require("./models/Performance");

const {
  buildAdaptiveStrategy,
} = require("./services/adaptiveStrategy");

const {
  generateAdaptiveQuestions,
} = require("./services/adaptiveGemini");

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected.");

    const performance =
      await Performance.findById(
        "6ab6518ceee51517e90b4214"
      ).lean();

    if (!performance) {
      throw new Error(
        "Performance not found."
      );
    }

    console.log("\n========== PERFORMANCE ==========\n");

    console.dir(
      {
        subject: performance.subject,
        weakConcepts:
          performance.weakConcepts,
      },
      { depth: null }
    );

    const strategy =
      buildAdaptiveStrategy(
        performance
      );

    if (!strategy) {
      throw new Error(
        "Adaptive strategy could not be built."
      );
    }

    console.log(
      "\n========== STRATEGY ==========\n"
    );

    console.dir(
      strategy,
      { depth: null }
    );

    console.log(
      "\n========== GENERATING QUESTIONS ==========\n"
    );

    const result =
      await generateAdaptiveQuestions(
        strategy
      );

    console.log(
      "\n========== GENERATION RESULT ==========\n"
    );

    console.log(
      "Source:",
      result.source
    );

    console.log(
      "Question count:",
      result.questions.length
    );

    console.dir(
      result.questions,
      { depth: null }
    );

    console.log(
      "\n========== TARGET CHECK ==========\n"
    );

    result.questions.forEach(
      (question, index) => {
        console.log(
          `Question ${index + 1}:`
        );

        console.log(
          "Topic:",
          question.topic
        );

        console.log(
          "Subtopic:",
          question.subtopic
        );

        console.log(
          "Concept:",
          question.concept
        );

        console.log(
          "Difficulty:",
          question.difficulty
        );

        console.log(
          "Bloom:",
          question.bloomLevel
        );

        console.log(
          "Options:",
          question.options?.length
        );

        console.log(
          "Correct Answer:",
          question.correctAnswer
        );

        console.log("");
      }
    );

    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected."
    );
  } catch (error) {
    console.error(
      "\n========== TEST FAILED ==========\n"
    );

    console.error(
      error
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

run();  