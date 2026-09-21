const PERFORMANCE_CONFIG =
  require("./performanceConfig");

// ========================================
// Utility functions
// ========================================

const round = (
  value,
  decimals = 2
) => {
  return Number(
    Number(value).toFixed(decimals)
  );
};

const calculatePercentage = (
  value,
  total
) => {
  if (!total) return 0;

  return round(
    (value / total) * 100
  );
};

const median = (values) => {
  if (!values.length) return 0;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return round(
      (sorted[middle - 1] +
        sorted[middle]) /
        2
    );
  }

  return sorted[middle];
};

const standardDeviation = (
  values
) => {
  if (values.length <= 1) {
    return 0;
  }

  const mean =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - mean,
          2
        ),
      0
    ) / values.length;

  return round(
    Math.sqrt(variance)
  );
};

const calculateStatus = (
  gapScore
) => {
  if (gapScore < 20) {
    return "strong";
  }

  if (gapScore < 50) {
    return "average";
  }

  return "weak";
};

// ========================================
// Response time analysis
// ========================================

const calculateTimeMetrics = (
  responses
) => {
  const times = responses
    .map(
      (answer) =>
        Number(
          answer.responseTime
        ) || 0
    )
    .filter(
      (time) => time > 0
    );

  if (!times.length) {
    return {
      average: 0,
      median: 0,
      stdDev: 0,
      consistency: 100,
    };
  }

  const average =
    times.reduce(
      (sum, time) =>
        sum + time,
      0
    ) / times.length;

  const medianTime =
    median(times);

  const stdDev =
    standardDeviation(times);

  // Coefficient of variation
  const coefficient =
    average > 0
      ? stdDev / average
      : 0;

  // Convert variation into a
  // consistency score.
  const consistency =
    Math.max(
      0,
      Math.min(
        100,
        100 -
          coefficient * 100
      )
    );

  return {
    average: round(average),

    median: medianTime,

    stdDev,

    consistency: round(
      consistency
    ),
  };
};

// ========================================
// Expected time
// ========================================

const getExpectedTime = (
  difficulty
) => {
  return (
    PERFORMANCE_CONFIG
      .expectedResponseTime[
      difficulty
    ] || 35
  );
};

// ========================================
// Time efficiency
// ========================================

const calculateTimeEfficiency = (
  responses
) => {
  if (!responses.length) {
    return 100;
  }

  const scores =
    responses.map((answer) => {
      const actual =
        Number(
          answer.responseTime
        ) || 0;

      if (actual <= 0) {
        return 100;
      }

      const expected =
        getExpectedTime(
          answer.difficulty
        );

      const score =
        (expected / actual) *
        100;

      return Math.max(
        0,
        Math.min(
          100,
          score
        )
      );
    });

  return round(
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    ) / scores.length
  );
};

// ========================================
// Difficulty analysis
// ========================================

const analyzeDifficulty = (
  responses
) => {
  const difficulties = [
    "easy",
    "medium",
    "hard",
  ];

  return difficulties
    .map((difficulty) => {
      const items =
        responses.filter(
          (item) =>
            item.difficulty ===
            difficulty
        );

      if (!items.length) {
        return {
          difficulty,

          totalQuestions: 0,

          attemptedQuestions: 0,

          correctAnswers: 0,

          wrongAnswers: 0,

          skippedQuestions: 0,

          accuracy: 0,

          averageResponseTime: 0,

          timeEfficiencyScore: 0,
        };
      }

      const attempted =
        items.filter(
          (item) =>
            !item.isSkipped
        );

      const correct =
        items.filter(
          (item) =>
            item.isCorrect
        );

      const skipped =
        items.filter(
          (item) =>
            item.isSkipped
        );

      const averageTime =
        calculateTimeMetrics(
          items
        ).average;

      return {
        difficulty,

        totalQuestions:
          items.length,

        attemptedQuestions:
          attempted.length,

        correctAnswers:
          correct.length,

        wrongAnswers:
          attempted.length -
          correct.length,

        skippedQuestions:
          skipped.length,

        accuracy:
          calculatePercentage(
            correct.length,
            items.length
          ),

        averageResponseTime:
          averageTime,

        timeEfficiencyScore:
          calculateTimeEfficiency(
            items
          ),
      };
    })
    .filter(
      (item) =>
        item.totalQuestions > 0
    );
};

// ========================================
// Difficulty handling score
// ========================================

const calculateDifficultyHandling =
  (
    difficultyPerformance
  ) => {
    if (!difficultyPerformance.length) {
      return 100;
    }

    const weights = {
      easy: 0.2,
      medium: 0.3,
      hard: 0.5,
    };

    let totalWeight = 0;
    let score = 0;

    difficultyPerformance.forEach(
      (item) => {
        const weight =
          weights[
            item.difficulty
          ] || 0;

        score +=
          item.accuracy *
          weight;

        totalWeight += weight;
      }
    );

    if (!totalWeight) {
      return 0;
    }

    return round(
      score / totalWeight
    );
  };

// ========================================
// Error pattern analysis
// ========================================

const analyzeErrorPatterns = (
  responses
) => {
  const validTimes =
    responses
      .map(
        (item) =>
          Number(
            item.responseTime
          ) || 0
      )
      .filter(
        (time) => time > 0
      );

  const averageTime =
    validTimes.length
      ? validTimes.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        validTimes.length
      : 0;

  const fastThreshold =
    averageTime *
    PERFORMANCE_CONFIG
      .fastMultiplier;

  const slowThreshold =
    averageTime *
    PERFORMANCE_CONFIG
      .slowMultiplier;

  let fastWrongCount = 0;

  let slowCorrectCount = 0;

  let slowWrongCount = 0;

  responses.forEach(
    (item) => {
      const time =
        Number(
          item.responseTime
        ) || 0;

      if (item.isSkipped) {
        return;
      }

      if (
        !item.isCorrect &&
        time > 0 &&
        time <= fastThreshold
      ) {
        fastWrongCount++;
      }

      if (
        item.isCorrect &&
        time >= slowThreshold
      ) {
        slowCorrectCount++;
      }

      if (
        !item.isCorrect &&
        time >= slowThreshold
      ) {
        slowWrongCount++;
      }
    }
  );

  return {
    fastWrongCount,

    slowCorrectCount,

    slowWrongCount,

    averageTime:
      round(averageTime),

    fastThreshold:
      round(fastThreshold),

    slowThreshold:
      round(slowThreshold),
  };
};

// ========================================
// Build learning-gap reasons
// ========================================

const generateGapReasons = (
  data
) => {
  const reasons = [];

  if (data.accuracy < 50) {
    reasons.push(
      "Low accuracy"
    );
  }

  if (
    data.skippedQuestions >
    0
  ) {
    reasons.push(
      "Questions were skipped"
    );
  }

  if (
    data.averageResponseTime >
    data.expectedResponseTime
  ) {
    reasons.push(
      "Higher-than-expected response time"
    );
  }

  if (
    data.difficultyHandlingScore <
    50
  ) {
    reasons.push(
      "Difficulty handling needs improvement"
    );
  }

  if (
    data.consistencyScore <
    50
  ) {
    reasons.push(
      "Inconsistent performance"
    );
  }

  if (
    data.fastWrongCount > 0
  ) {
    reasons.push(
      "Fast incorrect responses detected"
    );
  }

  if (
    data.slowWrongCount > 0
  ) {
    reasons.push(
      "Slow incorrect responses detected"
    );
  }

  if (
    data.slowCorrectCount > 0
  ) {
    reasons.push(
      "Correct answers required relatively high response time"
    );
  }

  if (!reasons.length) {
    reasons.push(
      "Performance is relatively stable"
    );
  }

  return reasons;
};

// ========================================
// Topic/subtopic analysis
// ========================================

const analyzeGroups = (
  responses
) => {
  const groupMap = new Map();

  responses.forEach(
    (item) => {
      const key =
        `${item.topic}|||${item.subtopic}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }

      groupMap
        .get(key)
        .push(item);
    }
  );

  const results = [];

  groupMap.forEach(
    (items) => {
      const topic =
        items[0].topic;

      const subtopic =
        items[0].subtopic;

      const correct =
        items.filter(
          (item) =>
            item.isCorrect
        ).length;

      const skipped =
        items.filter(
          (item) =>
            item.isSkipped
        ).length;

      const attempted =
        items.length -
        skipped;

      const wrong =
        attempted - correct;

      const accuracy =
        calculatePercentage(
          correct,
          items.length
        );

      const timeMetrics =
        calculateTimeMetrics(
          items
        );

      const timeEfficiency =
        calculateTimeEfficiency(
          items
        );

      const difficultyPerformance =
        analyzeDifficulty(
          items
        );

      const difficultyHandling =
        calculateDifficultyHandling(
          difficultyPerformance
        );

      const errorPatterns =
        analyzeErrorPatterns(
          items
        );

      // --------------------------------
      // Accuracy gap
      // --------------------------------

      const accuracyGap =
        100 - accuracy;

      // --------------------------------
      // Difficulty gap
      // --------------------------------

      const difficultyGap =
        100 -
        difficultyHandling;

      // --------------------------------
      // Time gap
      // --------------------------------

      const timeGap =
        100 -
        timeEfficiency;

      // --------------------------------
      // Consistency gap
      // --------------------------------

      const consistencyGap =
        100 -
        timeMetrics.consistency;

      // --------------------------------
      // Error pattern gap
      // --------------------------------

      const errorCount =
        errorPatterns.fastWrongCount +
        errorPatterns.slowWrongCount +
        skipped;

      const errorRate =
        items.length > 0
          ? (errorCount /
              items.length) *
            100
          : 0;

      // --------------------------------
      // Final learning gap
      // --------------------------------

      const gapScore =
        accuracyGap *
          PERFORMANCE_CONFIG
            .weights.accuracy +

        difficultyGap *
          PERFORMANCE_CONFIG
            .weights.difficulty +

        timeGap *
          PERFORMANCE_CONFIG
            .weights.timeEfficiency +

        consistencyGap *
          PERFORMANCE_CONFIG
            .weights.consistency +

        errorRate *
          PERFORMANCE_CONFIG
            .weights.errorPattern;

      const expectedTimes =
        items.map(
          (item) =>
            getExpectedTime(
              item.difficulty
            )
        );

      const expectedResponseTime =
        expectedTimes.length
          ? expectedTimes.reduce(
              (sum, value) =>
                sum + value,
                0
            ) /
            expectedTimes.length
          : 35;

      const gapReasons =
        generateGapReasons({
          accuracy,

          skippedQuestions:
            skipped,

          averageResponseTime:
            timeMetrics.average,

          expectedResponseTime,

          difficultyHandlingScore:
            difficultyHandling,

          consistencyScore:
            timeMetrics.consistency,

          fastWrongCount:
            errorPatterns.fastWrongCount,

          slowWrongCount:
            errorPatterns.slowWrongCount,

          slowCorrectCount:
            errorPatterns.slowCorrectCount,
        });

      results.push({
        topic,

        subtopic,

        totalQuestions:
          items.length,

        attemptedQuestions:
          attempted,

        skippedQuestions:
          skipped,

        correctAnswers:
          correct,

        wrongAnswers:
          wrong,

        accuracy,

        averageResponseTime:
          timeMetrics.average,

        medianResponseTime:
          timeMetrics.median,

        timeEfficiencyScore:
          timeEfficiency,

        consistencyScore:
          timeMetrics.consistency,

        difficultyAccuracy: {
          easy:
            difficultyPerformance.find(
              (item) =>
                item.difficulty ===
                "easy"
            )?.accuracy || 0,

          medium:
            difficultyPerformance.find(
              (item) =>
                item.difficulty ===
                "medium"
            )?.accuracy || 0,

          hard:
            difficultyPerformance.find(
              (item) =>
                item.difficulty ===
                "hard"
            )?.accuracy || 0,
        },

        difficultyHandlingScore:
          difficultyHandling,

        fastWrongCount:
          errorPatterns.fastWrongCount,

        slowCorrectCount:
          errorPatterns.slowCorrectCount,

        slowWrongCount:
          errorPatterns.slowWrongCount,

        gapScore:
          round(
            Math.max(
              0,
              Math.min(
                100,
                gapScore
              )
            )
          ),

        status:
          calculateStatus(
            gapScore
          ),

        gapReasons,
      });
    }
  );

  return results;
};

// ========================================
// Overall analysis
// ========================================

const analyzePerformance = (
  attempt,
  questions
) => {
  // --------------------------------
  // Question lookup
  // --------------------------------

  const questionMap =
    new Map();

  questions.forEach(
    (question) => {
      questionMap.set(
        question._id.toString(),
        question
      );
    }
  );

  // --------------------------------
  // Merge attempt + question data
  // --------------------------------

  const responses =
    attempt.answers.map(
      (answer) => {
        const question =
          questionMap.get(
            answer.questionId.toString()
          );

        return {
          questionId:
            answer.questionId,

          topic:
            question?.topic ||
            "Unknown",

          subtopic:
            question?.subtopic ||
            "Unknown",

          difficulty:
            question?.difficulty ||
            "medium",

          isCorrect:
            answer.isCorrect,

          isSkipped:
            answer.isSkipped,

          responseTime:
            answer.responseTime || 0,
        };
      }
    );

  // --------------------------------
  // Overall counts
  // --------------------------------

  const totalQuestions =
    responses.length;

  const skippedQuestions =
    responses.filter(
      (item) =>
        item.isSkipped
    ).length;

  const attemptedQuestions =
    totalQuestions -
    skippedQuestions;

  const correctAnswers =
    responses.filter(
      (item) =>
        item.isCorrect
    ).length;

  const wrongAnswers =
    attemptedQuestions -
    correctAnswers;

  const overallAccuracy =
    calculatePercentage(
      correctAnswers,
      totalQuestions
    );

  // --------------------------------
  // Time
  // --------------------------------

  const timeMetrics =
    calculateTimeMetrics(
      responses
    );

  const timeEfficiency =
    calculateTimeEfficiency(
      responses
    );

  // --------------------------------
  // Difficulty
  // --------------------------------

  const difficultyPerformance =
    analyzeDifficulty(
      responses
    );

  const difficultyHandling =
    calculateDifficultyHandling(
      difficultyPerformance
    );

  // --------------------------------
  // Error patterns
  // --------------------------------

  const errorPatterns =
    analyzeErrorPatterns(
      responses
    );

  // --------------------------------
  // Topic/subtopic
  // --------------------------------

  const topicPerformance =
    analyzeGroups(
      responses
    );

  // --------------------------------
  // Learning gap
  // --------------------------------

  const accuracyGap =
    100 - overallAccuracy;

  const difficultyGap =
    100 -
    difficultyHandling;

  const timeGap =
    100 -
    timeEfficiency;

  const consistencyGap =
    100 -
    timeMetrics.consistency;

  const errorRate =
    totalQuestions > 0
      ? ((wrongAnswers +
          skippedQuestions) /
          totalQuestions) *
        100
      : 0;

  const learningGapScore =
    accuracyGap *
      PERFORMANCE_CONFIG
        .weights.accuracy +

    difficultyGap *
      PERFORMANCE_CONFIG
        .weights.difficulty +

    timeGap *
      PERFORMANCE_CONFIG
        .weights.timeEfficiency +

    consistencyGap *
      PERFORMANCE_CONFIG
        .weights.consistency +

    errorRate *
      PERFORMANCE_CONFIG
        .weights.errorPattern;

  // --------------------------------
  // Strong / weak areas
  // --------------------------------

  const weakAreas =
    topicPerformance
      .filter(
        (item) =>
          item.status ===
          "weak"
      )
      .sort(
        (a, b) =>
          b.gapScore -
          a.gapScore
      );

  const strongAreas =
    topicPerformance
      .filter(
        (item) =>
          item.status ===
          "strong"
      )
      .sort(
        (a, b) =>
          a.gapScore -
          b.gapScore
      );

  // --------------------------------
  // Learning gaps
  // --------------------------------

  const learningGaps =
    weakAreas.map(
      (area) => ({
        topic:
          area.topic,

        subtopic:
          area.subtopic,

        gapScore:
          area.gapScore,

        reasons:
          area.gapReasons,
      })
    );

  // --------------------------------
  // Recommendations
  // --------------------------------

  const recommendations = [];

  if (overallAccuracy < 50) {
    recommendations.push(
      "Review fundamental concepts before attempting harder questions."
    );
  }

  if (
    difficultyHandling < 50
  ) {
    recommendations.push(
      "Practice progressively harder questions instead of jumping directly to difficult questions."
    );
  }

  if (
    timeEfficiency < 50
  ) {
    recommendations.push(
      "Practice timed questions to improve response efficiency."
    );
  }

  if (
    timeMetrics.consistency <
    50
  ) {
    recommendations.push(
      "Work on maintaining consistent performance across questions."
    );
  }

  if (
    errorPatterns.fastWrongCount >
    0
  ) {
    recommendations.push(
      "Review questions where incorrect answers were selected unusually quickly."
    );
  }

  if (
    errorPatterns.slowWrongCount >
    0
  ) {
    recommendations.push(
      "Review concepts associated with questions that required long reasoning time but were still incorrect."
    );
  }

  if (
    errorPatterns.slowCorrectCount >
    0
  ) {
    recommendations.push(
      "Practice similar questions under time limits to improve solving efficiency."
    );
  }

  weakAreas
    .slice(0, 3)
    .forEach((area) => {
      recommendations.push(
        `Practice ${area.topic}${
          area.subtopic
            ? ` → ${area.subtopic}`
            : ""
        } because it has a learning-gap score of ${area.gapScore}.`
      );
    });

  if (
    recommendations.length ===
    0
  ) {
    recommendations.push(
      "Performance is stable. Continue practicing with progressively challenging questions."
    );
  }

  // --------------------------------
  // Confidence / data quality
  // --------------------------------

  const sampleFactor =
    Math.min(
      1,
      totalQuestions / 20
    );

  const confidenceScore =
    round(
      (
        sampleFactor * 70 +
        (1 -
          Math.min(
            1,
            skippedQuestions /
              Math.max(
                1,
                totalQuestions
              )
          )) *
          30
      )
    );

  // --------------------------------
  // Return complete analysis
  // --------------------------------

  return {
    score:
      attempt.score,

    totalQuestions,

    attemptedQuestions,

    skippedQuestions,

    percentage:
      attempt.percentage,

    overallAccuracy,

    averageResponseTime:
      timeMetrics.average,

    medianResponseTime:
      timeMetrics.median,

    responseTimeStdDev:
      timeMetrics.stdDev,

    responseTimeConsistency:
      timeMetrics.consistency,

    timeEfficiencyScore:
      timeEfficiency,

    difficultyHandlingScore:
      difficultyHandling,

    consistencyScore:
      timeMetrics.consistency,

    learningGapScore:
      round(
        Math.max(
          0,
          Math.min(
            100,
            learningGapScore
          )
        )
      ),

    confidenceScore,

    topicPerformance,

    difficultyPerformance,

    weakAreas,

    strongAreas,

    learningGaps,

    recommendations,

    errorPatterns,
  };
};

module.exports = {
  analyzePerformance,
};