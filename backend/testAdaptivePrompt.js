const {
  buildAdaptivePrompt,
} = require("./services/adaptivePrompt");

const strategy = {
  subject: "os",

  targetType: "concept",

  targetConcept:
    "Client-server OS structure",

  targetTopic:
    "System Structures",

  targetSubtopic:
    "Microkernel",

  gapScore: 86.33,

  currentAccuracy: 0,

  currentDifficultyHandling: 0,

  currentTimeEfficiency: 70,

  currentConsistency: 66.67,

  selectedDifficulty: "easy",

  focusAreas: [
    "concept understanding",
  ],

  questionMix: {
    easy: 4,
    medium: 1,
    hard: 0,
  },

  questionCount: 5,

  reasons: [
    "Low accuracy",
    "Difficulty handling needs improvement",
    "Fast incorrect responses detected",
  ],
};

const prompt =
  buildAdaptivePrompt(strategy);

console.log("\n========== ADAPTIVE PROMPT ==========\n");

console.log(prompt);

console.log(
  "\n========== END PROMPT ==========\n"
);