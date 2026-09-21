const round = (
  value,
  decimals = 2
) => {
  return Number(
    Number(value).toFixed(decimals)
  );
};

const selectDifficulty = (area) => {
  const accuracy =
    area.accuracy || 0;

  const easyAccuracy =
    area.difficultyAccuracy?.easy || 0;

  const mediumAccuracy =
    area.difficultyAccuracy?.medium || 0;

  const hardAccuracy =
    area.difficultyAccuracy?.hard || 0;

  /*
    If fundamentals are weak,
    start with easy questions.
  */

  if (
    accuracy < 40 ||
    easyAccuracy < 50
  ) {
    return "easy";
  }

  /*
    If student is moderately weak,
    use medium questions.
  */

  if (accuracy < 70) {
    return "medium";
  }

  /*
    If student can handle medium/hard,
    introduce harder questions.
  */

  if (
    mediumAccuracy >= 70 &&
    hardAccuracy >= 50
  ) {
    return "hard";
  }

  return "medium";
};

const determineFocus = (area) => {
  const reasons =
    area.gapReasons || [];

  const focus = [];

  if (
    area.accuracy < 60
  ) {
    focus.push(
      "concept understanding"
    );
  }

  if (
    area.fastWrongCount > 0
  ) {
    focus.push(
      "careful reasoning and avoiding rushed answers"
    );
  }

  if (
    area.slowWrongCount > 0
  ) {
    focus.push(
      "conceptual problem solving"
    );
  }

  if (
    area.slowCorrectCount > 0
  ) {
    focus.push(
      "solving efficiency"
    );
  }

  if (
    area.consistencyScore < 50
  ) {
    focus.push(
      "consistent problem solving"
    );
  }

  if (
    area.skippedQuestions > 0
  ) {
    focus.push(
      "confidence and question completion"
    );
  }

  /*
    If no specific pattern was found,
    use general conceptual reinforcement.
  */

  if (!focus.length) {
    focus.push(
      "concept reinforcement"
    );
  }

  return focus;
};

const determineQuestionMix = (
  difficulty,
  area
) => {
  /*
    We deliberately keep the re-test
    focused on the weak area.
  */

  if (difficulty === "easy") {
    return {
      easy: 4,
      medium: 1,
      hard: 0,
    };
  }

  if (difficulty === "medium") {
    return {
      easy: 1,
      medium: 3,
      hard: 1,
    };
  }

  return {
    easy: 0,
    medium: 2,
    hard: 3,
  };
};

const buildAdaptiveStrategy = (
  performance
) => {
  if (
    !performance ||
    !performance.weakAreas ||
    !performance.weakAreas.length
  ) {
    return null;
  }

  /*
    First weak area = highest gap score
    because Performance Engine already
    sorts weak areas by gap.
  */

  const targetArea =
    [...performance.weakAreas].sort(
      (a, b) =>
        b.gapScore - a.gapScore
    )[0];

  const difficulty =
    selectDifficulty(
      targetArea
    );

  const focus =
    determineFocus(
      targetArea
    );

  const questionMix =
    determineQuestionMix(
      difficulty,
      targetArea
    );

  const strategy = {
    targetTopic:
      targetArea.topic,

    targetSubtopic:
      targetArea.subtopic,

    gapScore:
      targetArea.gapScore,

    currentAccuracy:
      targetArea.accuracy,

    currentDifficultyHandling:
      targetArea.difficultyHandlingScore,

    currentTimeEfficiency:
      targetArea.timeEfficiencyScore,

    currentConsistency:
      targetArea.consistencyScore,

    selectedDifficulty:
      difficulty,

    focusAreas:
      focus,

    questionMix,

    questionCount: 5,

    reasons:
      targetArea.gapReasons || [],
  };

  return strategy;
};

module.exports = {
  buildAdaptiveStrategy,
};