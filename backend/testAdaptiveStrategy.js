const {
  buildAdaptiveStrategy,
} = require("./services/adaptiveStrategy");

const performance = {
  subject: "Computer Science",

  weakConcepts: [
    {
      concept: "Client-server OS structure",
      topic: "System Structures",
      subtopic: "Microkernel",
      accuracy: 0,
      gapScore: 86.48,
      difficultyHandlingScore: 20,
      timeEfficiencyScore: 70,
      consistencyScore: 65.2,
      skippedQuestions: 0,
      fastWrongCount: 0,
      slowWrongCount: 2,
      slowCorrectCount: 0,
      gapReasons: [
        "Low accuracy",
        "Difficulty handling needs improvement",
      ],
    },

    {
      concept: "Performance overhead of context switching",
      topic: "System Structures",
      subtopic: "Microkernel",
      accuracy: 0,
      gapScore: 80,
      difficultyHandlingScore: 30,
      timeEfficiencyScore: 70,
      consistencyScore: 60,
      skippedQuestions: 0,
      fastWrongCount: 0,
      slowWrongCount: 1,
      slowCorrectCount: 0,
      gapReasons: [
        "Low accuracy",
      ],
    },
  ],

  weakAreas: [],
};

const strategy =
  buildAdaptiveStrategy(performance);

console.log(
  JSON.stringify(
    strategy,
    null,
    2
  )
);