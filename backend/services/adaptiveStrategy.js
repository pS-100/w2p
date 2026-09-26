const round = (value, decimals = 2) => {
  return Number(Number(value || 0).toFixed(decimals));
};

const selectDifficulty = (area) => {
  const accuracy = Number(area.accuracy || 0);

  const easyAccuracy = Number(
    area.difficultyAccuracy?.easy || 0
  );

  const mediumAccuracy = Number(
    area.difficultyAccuracy?.medium || 0
  );

  const hardAccuracy = Number(
    area.difficultyAccuracy?.hard || 0
  );

  /*
    Very weak performance:
    Start with easier questions so the student
    can rebuild the concept foundation.
  */
  if (accuracy < 40 || easyAccuracy < 50) {
    return "easy";
  }

  /*
    Moderate performance:
    Reinforce the concept at medium difficulty.
  */
  if (accuracy < 70) {
    return "medium";
  }

  /*
    Stronger performance:
    Move toward harder questions only when
    medium and hard performance supports it.
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
  const focus = [];

  if ((area.accuracy || 0) < 60) {
    focus.push("concept understanding");
  }

  if ((area.fastWrongCount || 0) > 0) {
    focus.push(
      "careful reasoning and avoiding rushed answers"
    );
  }

  if ((area.slowWrongCount || 0) > 0) {
    focus.push(
      "conceptual problem solving"
    );
  }

  if ((area.slowCorrectCount || 0) > 0) {
    focus.push(
      "solving efficiency"
    );
  }

  if ((area.consistencyScore || 0) < 50) {
    focus.push(
      "consistent problem solving"
    );
  }

  if ((area.skippedQuestions || 0) > 0) {
    focus.push(
      "confidence and question completion"
    );
  }

  if (focus.length === 0) {
    focus.push(
      "concept reinforcement"
    );
  }

  return focus;
};

const determineQuestionMix = (
  difficulty
) => {
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
  if (!performance) {
    return null;
  }

  let targetArea = null;
  let targetType = "concept";

  /*
    --------------------------------------------------
    1. Prefer weak concepts
    --------------------------------------------------
  */

  if (
    Array.isArray(
      performance.weakConcepts
    ) &&
    performance.weakConcepts.length > 0
  ) {
    targetArea = [
      ...performance.weakConcepts,
    ].sort(
      (a, b) =>
        (b.gapScore || 0) -
        (a.gapScore || 0)
    )[0];
  }

  /*
    --------------------------------------------------
    2. Fallback to weak topic/subtopic
    --------------------------------------------------
  */

  if (!targetArea) {
    if (
      Array.isArray(
        performance.weakAreas
      ) &&
      performance.weakAreas.length > 0
    ) {
      targetArea = [
        ...performance.weakAreas,
      ].sort(
        (a, b) =>
          (b.gapScore || 0) -
          (a.gapScore || 0)
      )[0];

      targetType = "area";
    }
  }

  if (!targetArea) {
    return null;
  }

  /*
    --------------------------------------------------
    3. Select adaptive difficulty
    --------------------------------------------------
  */

  const difficulty =
    selectDifficulty(
      targetArea
    );

  /*
    --------------------------------------------------
    4. Identify learning focus
    --------------------------------------------------
  */

  const focus =
    determineFocus(
      targetArea
    );

  /*
    --------------------------------------------------
    5. Build question distribution
    --------------------------------------------------
  */

  const questionMix =
    determineQuestionMix(
      difficulty
    );

  /*
    --------------------------------------------------
    6. Return complete strategy
    --------------------------------------------------
  */

  return {
    subject:
      performance.subject,

    targetType,

    targetConcept:
      targetArea.concept || null,

    targetTopic:
      targetArea.topic,

    targetSubtopic:
      targetArea.subtopic,

    gapScore:
      round(
        targetArea.gapScore || 0
      ),

    currentAccuracy:
      round(
        targetArea.accuracy || 0
      ),

    currentDifficultyHandling:
      round(
        targetArea.difficultyHandlingScore || 0
      ),

    currentTimeEfficiency:
      round(
        targetArea.timeEfficiencyScore || 0
      ),

    currentConsistency:
      round(
        targetArea.consistencyScore || 0
      ),

    selectedDifficulty:
      difficulty,

    focusAreas:
      focus,

    questionMix,

    questionCount: 5,

    reasons:
      targetArea.gapReasons || [],
  };
};

module.exports = {
  buildAdaptiveStrategy,
};