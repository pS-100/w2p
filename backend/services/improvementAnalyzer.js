const round = (value, decimals = 2) => {
  return Number(Number(value || 0).toFixed(decimals));
};

const calculateChange = (before, after) => {
  return round(after - before);
};

const calculatePercentageChange = (before, after) => {
  if (before === 0) {
    return after > 0 ? 100 : 0;
  }

  return round(
    ((after - before) / Math.abs(before)) * 100
  );
};

const findConcept = (
  performance,
  topic,
  subtopic,
  concept
) => {
  if (!Array.isArray(performance.conceptPerformance)) {
    return null;
  }

  return performance.conceptPerformance.find(
    (item) =>
      String(item.topic || "").trim() ===
        String(topic || "").trim() &&
      String(item.subtopic || "").trim() ===
        String(subtopic || "").trim() &&
      String(item.concept || "").trim() ===
        String(concept || "").trim()
  );
};

const analyzeImprovement = (
  before,
  after,
  strategy = {}
) => {
  /*
    ----------------------------------------
    OVERALL PERFORMANCE CHANGE
    ----------------------------------------
  */

  const accuracyChange = calculateChange(
    before.overallAccuracy,
    after.overallAccuracy
  );

  const gapScoreChange = calculateChange(
    before.learningGapScore,
    after.learningGapScore
  );

  const timeEfficiencyChange = calculateChange(
    before.timeEfficiencyScore,
    after.timeEfficiencyScore
  );

  const consistencyChange = calculateChange(
    before.consistencyScore,
    after.consistencyScore
  );

  /*
    Learning Gap Score is better
    when it decreases.
  */

  const gapImprovement =
    before.learningGapScore -
    after.learningGapScore;

  /*
    ----------------------------------------
    TARGET CONCEPT
    ----------------------------------------
  */

  const targetConcept =
    strategy.targetConcept || null;

  const targetTopic =
    strategy.targetTopic || null;

  const targetSubtopic =
    strategy.targetSubtopic || null;

  const conceptBefore = findConcept(
    before,
    targetTopic,
    targetSubtopic,
    targetConcept
  );

  const conceptAfter = findConcept(
    after,
    targetTopic,
    targetSubtopic,
    targetConcept
  );

  let conceptAccuracyChange = null;
  let conceptGapChange = null;
  let conceptTimeEfficiencyChange = null;
  let conceptConsistencyChange = null;

  if (conceptBefore && conceptAfter) {
    conceptAccuracyChange =
      calculateChange(
        conceptBefore.accuracy,
        conceptAfter.accuracy
      );

    conceptGapChange =
      calculateChange(
        conceptBefore.gapScore,
        conceptAfter.gapScore
      );

    conceptTimeEfficiencyChange =
      calculateChange(
        conceptBefore.timeEfficiencyScore,
        conceptAfter.timeEfficiencyScore
      );

    conceptConsistencyChange =
      calculateChange(
        conceptBefore.consistencyScore,
        conceptAfter.consistencyScore
      );
  }

  /*
    ----------------------------------------
    CONCEPT STATUS
    ----------------------------------------
  */

  let conceptStatus = "insufficient-data";

  if (conceptBefore && conceptAfter) {
    if (
      conceptGapChange < 0 &&
      conceptAccuracyChange > 0
    ) {
      conceptStatus = "improved";
    } else if (
      conceptGapChange > 0 &&
      conceptAccuracyChange < 0
    ) {
      conceptStatus = "needs-more-practice";
    } else {
      conceptStatus = "stable";
    }
  }

  /*
    ----------------------------------------
    OVERALL INTERPRETATION
    ----------------------------------------
  */

  let interpretation =
    "Learning gap remained stable";

  if (gapImprovement > 0) {
    interpretation =
      "Learning gap decreased";
  } else if (gapImprovement < 0) {
    interpretation =
      "Learning gap increased";
  }

  return {
    target: {
      topic: targetTopic,
      subtopic: targetSubtopic,
      concept: targetConcept,
    },

    before: {
      accuracy: before.overallAccuracy,
      learningGapScore:
        before.learningGapScore,
      timeEfficiency:
        before.timeEfficiencyScore,
      consistency:
        before.consistencyScore,
    },

    after: {
      accuracy: after.overallAccuracy,
      learningGapScore:
        after.learningGapScore,
      timeEfficiency:
        after.timeEfficiencyScore,
      consistency:
        after.consistencyScore,
    },

    change: {
      accuracy: accuracyChange,

      accuracyPercentage:
        calculatePercentageChange(
          before.overallAccuracy,
          after.overallAccuracy
        ),

      learningGapScore:
        gapScoreChange,

      gapImprovement:
        round(gapImprovement),

      timeEfficiency:
        timeEfficiencyChange,

      consistency:
        consistencyChange,
    },

    targetConceptPerformance: {
      before: conceptBefore
        ? {
            accuracy:
              conceptBefore.accuracy,

            gapScore:
              conceptBefore.gapScore,

            timeEfficiency:
              conceptBefore.timeEfficiencyScore,

            consistency:
              conceptBefore.consistencyScore,
          }
        : null,

      after: conceptAfter
        ? {
            accuracy:
              conceptAfter.accuracy,

            gapScore:
              conceptAfter.gapScore,

            timeEfficiency:
              conceptAfter.timeEfficiencyScore,

            consistency:
              conceptAfter.consistencyScore,
          }
        : null,

      change: {
        accuracy:
          conceptAccuracyChange,

        gapScore:
          conceptGapChange,

        timeEfficiency:
          conceptTimeEfficiencyChange,

        consistency:
          conceptConsistencyChange,
      },

      status: conceptStatus,
    },

    interpretation,
  };
};

module.exports = {
  analyzeImprovement,
};