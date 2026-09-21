const PERFORMANCE_CONFIG = {
  weights: {
    accuracy: 0.40,

    difficulty: 0.20,

    timeEfficiency: 0.15,

    consistency: 0.10,

    errorPattern: 0.15,
  },

  thresholds: {
    strong: 80,

    average: 50,

    weak: 50,
  },

  expectedResponseTime: {
    easy: 20,

    medium: 35,

    hard: 50,
  },

  slowMultiplier: 1.5,

  fastMultiplier: 0.4,
};

module.exports =
  PERFORMANCE_CONFIG;