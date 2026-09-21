const round = (
  value,
  decimals = 2
) => {
  return Number(
    Number(value).toFixed(decimals)
  );
};

const calculateChange = (
  before,
  after
) => {
  return round(
    after - before
  );
};

const calculatePercentageChange = (
  before,
  after
) => {
  if (before === 0) {
    return after > 0
      ? 100
      : 0;
  }

  return round(
    ((after - before) /
      Math.abs(before)) *
      100
  );
};

const analyzeImprovement = (
  before,
  after
) => {
  const accuracyChange =
    calculateChange(
      before.overallAccuracy,
      after.overallAccuracy
    );

  const gapScoreChange =
    calculateChange(
      before.learningGapScore,
      after.learningGapScore
    );

  const timeEfficiencyChange =
    calculateChange(
      before.timeEfficiencyScore,
      after.timeEfficiencyScore
    );

  const consistencyChange =
    calculateChange(
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

  const weakAreaBefore =
    before.weakAreas?.[0];

  const weakAreaAfter =
    after.topicPerformance?.find(
      (area) =>
        area.topic ===
          weakAreaBefore?.topic &&
        area.subtopic ===
          weakAreaBefore?.subtopic
    );

  let weakAreaAccuracyChange =
    null;

  let weakAreaGapChange =
    null;

  if (
    weakAreaBefore &&
    weakAreaAfter
  ) {
    weakAreaAccuracyChange =
      calculateChange(
        weakAreaBefore.accuracy,
        weakAreaAfter.accuracy
      );

    weakAreaGapChange =
      calculateChange(
        weakAreaBefore.gapScore,
        weakAreaAfter.gapScore
      );
  }

  return {
    before: {
      accuracy:
        before.overallAccuracy,

      learningGapScore:
        before.learningGapScore,

      timeEfficiency:
        before.timeEfficiencyScore,

      consistency:
        before.consistencyScore,
    },

    after: {
      accuracy:
        after.overallAccuracy,

      learningGapScore:
        after.learningGapScore,

      timeEfficiency:
        after.timeEfficiencyScore,

      consistency:
        after.consistencyScore,
    },

    change: {
      accuracy:
        accuracyChange,

      accuracyPercentage:
        calculatePercentageChange(
          before.overallAccuracy,
          after.overallAccuracy
        ),

      learningGapScore:
        gapScoreChange,

      gapImprovement:
        round(
          gapImprovement
        ),

      timeEfficiency:
        timeEfficiencyChange,

      consistency:
        consistencyChange,

      weakAreaAccuracy:
        weakAreaAccuracyChange,

      weakAreaGapScore:
        weakAreaGapChange,
    },

    interpretation:
      gapImprovement > 0
        ? "Learning gap decreased"
        : gapImprovement < 0
        ? "Learning gap increased"
        : "Learning gap remained stable",
  };
};

module.exports = {
  analyzeImprovement,
};