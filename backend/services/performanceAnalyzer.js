// const PERFORMANCE_CONFIG = require("./performanceConfig");

// /* =========================================================
//    BASIC UTILITIES
// ========================================================= */

// const round = (value, decimals = 2) => {
//   return Number(Number(value).toFixed(decimals));
// };

// const calculatePercentage = (correct, total) => {
//   if (!total) return 0;

//   return round((correct / total) * 100);
// };


// /* =========================================================
//    MEDIAN
// ========================================================= */

// const median = (values) => {
//   if (!values.length) return 0;

//   const sorted = [...values].sort((a, b) => a - b);

//   const middle = Math.floor(sorted.length / 2);

//   if (sorted.length % 2 === 0) {
//     return round(
//       (sorted[middle - 1] + sorted[middle]) / 2
//     );
//   }

//   return round(sorted[middle]);
// };


// /* =========================================================
//    STANDARD DEVIATION
// ========================================================= */

// const standardDeviation = (values) => {
//   if (values.length <= 1) return 0;

//   const mean =
//     values.reduce((sum, value) => sum + value, 0) /
//     values.length;

//   const variance =
//     values.reduce(
//       (sum, value) => sum + Math.pow(value - mean, 2),
//       0
//     ) / values.length;

//   return round(Math.sqrt(variance));
// };


// /* =========================================================
//    STATUS
// ========================================================= */

// const calculateStatus = (
//   gapScore,
//   attemptedQuestions = 0
// ) => {
//   /*
//     One question is not enough evidence to permanently
//     classify a concept as weak or strong.
//   */

//   if (attemptedQuestions < 2) {
//     return "insufficient-data";
//   }

//   if (gapScore < 20) {
//     return "strong";
//   }

//   if (gapScore < 50) {
//     return "average";
//   }

//   return "weak";
// };


// /* =========================================================
//    TIME METRICS
// ========================================================= */

// const calculateTimeMetrics = (responses) => {
//   const responseTimes = responses
//     .map((response) => Number(response.responseTime))
//     .filter((time) => time > 0);

//   if (!responseTimes.length) {
//     return {
//       averageResponseTime: 0,
//       medianResponseTime: 0,
//       responseTimeStdDev: 0,
//       consistency: 100,
//     };
//   }

//   const averageResponseTime =
//     responseTimes.reduce(
//       (sum, time) => sum + time,
//       0
//     ) / responseTimes.length;

//   const medianResponseTime =
//     median(responseTimes);

//   const responseTimeStdDev =
//     standardDeviation(responseTimes);

//   /*
//     Coefficient of variation.
//     Lower variation = higher consistency.
//   */

//   const coefficientOfVariation =
//     averageResponseTime > 0
//       ? responseTimeStdDev / averageResponseTime
//       : 0;

//   const consistency = Math.max(
//     0,
//     Math.min(
//       100,
//       100 - coefficientOfVariation * 100
//     )
//   );

//   return {
//     averageResponseTime: round(averageResponseTime),
//     medianResponseTime,
//     responseTimeStdDev,
//     consistency: round(consistency),
//   };
// };


// /* =========================================================
//    EXPECTED RESPONSE TIME
// ========================================================= */

// const getExpectedTime = (difficulty) => {
//   return (
//     PERFORMANCE_CONFIG.expectedResponseTime[
//       difficulty
//     ] || 35
//   );
// };


// /* =========================================================
//    TIME EFFICIENCY
// ========================================================= */

// const calculateTimeEfficiency = (responses) => {
//   if (!responses.length) return 0;

//   const efficiencyScores = responses.map(
//     (response) => {
//       const actualTime =
//         Number(response.responseTime);

//       if (actualTime <= 0) {
//         return 100;
//       }

//       const expectedTime =
//         getExpectedTime(response.difficulty);

//       /*
//         Speed is treated as efficiency,
//         but it is not used alone to determine mastery.
//       */

//       const score =
//         (expectedTime / actualTime) * 100;

//       return Math.max(
//         0,
//         Math.min(100, score)
//       );
//     }
//   );

//   const average =
//     efficiencyScores.reduce(
//       (sum, score) => sum + score,
//       0
//     ) / efficiencyScores.length;

//   return round(average);
// };


// /* =========================================================
//    DIFFICULTY ANALYSIS
// ========================================================= */

// const analyzeDifficulty = (responses) => {
//   const difficulties = [
//     "easy",
//     "medium",
//     "hard",
//   ];

//   return difficulties
//     .map((difficulty) => {
//       const items = responses.filter(
//         (response) =>
//           response.difficulty === difficulty
//       );

//       if (!items.length) {
//         return null;
//       }

//       const correctAnswers =
//         items.filter(
//           (item) => item.isCorrect
//         ).length;

//       const skippedQuestions =
//         items.filter(
//           (item) => item.isSkipped
//         ).length;

//       const attemptedQuestions =
//         items.length - skippedQuestions;

//       const wrongAnswers =
//         attemptedQuestions - correctAnswers;

//       const responseTime =
//         calculateTimeMetrics(items);

//       const timeEfficiencyScore =
//         calculateTimeEfficiency(items);

//       return {
//         difficulty,

//         totalQuestions: items.length,

//         attemptedQuestions,

//         correctAnswers,

//         wrongAnswers,

//         skippedQuestions,

//         accuracy: calculatePercentage(
//           correctAnswers,
//           attemptedQuestions
//         ),

//         averageResponseTime:
//           responseTime.averageResponseTime,

//         timeEfficiencyScore,
//       };
//     })
//     .filter(Boolean);
// };


// /* =========================================================
//    DIFFICULTY HANDLING
// ========================================================= */

// const calculateDifficultyHandling = (
//   difficultyPerformance
// ) => {
//   if (!difficultyPerformance.length) {
//     return 0;
//   }

//   const weights = {
//     easy: 0.2,
//     medium: 0.3,
//     hard: 0.5,
//   };

//   let weightedScore = 0;
//   let totalWeight = 0;

//   difficultyPerformance.forEach(
//     (difficulty) => {
//       const weight =
//         weights[difficulty.difficulty] || 0;

//       weightedScore +=
//         difficulty.accuracy * weight;

//       totalWeight += weight;
//     }
//   );

//   if (!totalWeight) return 0;

//   return round(
//     weightedScore / totalWeight
//   );
// };


// /* =========================================================
//    ERROR PATTERN ANALYSIS
// ========================================================= */

// const analyzeErrorPatterns = (responses) => {
//   if (!responses.length) {
//     return {
//       fastWrongCount: 0,
//       slowCorrectCount: 0,
//       slowWrongCount: 0,
//     };
//   }

//   const validTimes = responses
//     .map((response) =>
//       Number(response.responseTime)
//     )
//     .filter((time) => time > 0);

//   const averageTime = validTimes.length
//     ? validTimes.reduce(
//         (sum, time) => sum + time,
//         0
//       ) / validTimes.length
//     : 0;

//   const fastThreshold =
//     averageTime *
//     PERFORMANCE_CONFIG.fastMultiplier;

//   const slowThreshold =
//     averageTime *
//     PERFORMANCE_CONFIG.slowMultiplier;

//   let fastWrongCount = 0;
//   let slowCorrectCount = 0;
//   let slowWrongCount = 0;

//   responses.forEach((response) => {
//     const time =
//       Number(response.responseTime);

//     if (time <= 0) return;

//     if (
//       !response.isCorrect &&
//       !response.isSkipped &&
//       time <= fastThreshold
//     ) {
//       fastWrongCount++;
//     }

//     if (
//       response.isCorrect &&
//       time >= slowThreshold
//     ) {
//       slowCorrectCount++;
//     }

//     if (
//       !response.isCorrect &&
//       !response.isSkipped &&
//       time >= slowThreshold
//     ) {
//       slowWrongCount++;
//     }
//   });

//   return {
//     fastWrongCount,
//     slowCorrectCount,
//     slowWrongCount,
//   };
// };


// /* =========================================================
//    GAP REASONS
// ========================================================= */

// const generateGapReasons = ({
//   accuracy,
//   skippedQuestions,
//   totalQuestions,
//   averageResponseTime,
//   difficultyHandlingScore,
//   consistencyScore,
//   fastWrongCount,
//   slowWrongCount,
//   slowCorrectCount,
// }) => {
//   const reasons = [];

//   if (accuracy < 50) {
//     reasons.push(
//       "Low accuracy indicates difficulty understanding the concept."
//     );
//   }

//   if (
//     skippedQuestions >
//     0
//   ) {
//     reasons.push(
//       "Skipped questions indicate uncertainty about the concept."
//     );
//   }

//   if (
//     totalQuestions > 0 &&
//     skippedQuestions / totalQuestions >= 0.3
//   ) {
//     reasons.push(
//       "A relatively high number of skipped questions was observed."
//     );
//   }

//   if (
//     averageResponseTime > 0 &&
//     averageResponseTime >
//       PERFORMANCE_CONFIG.expectedResponseTime.medium
//   ) {
//     reasons.push(
//       "Responses required relatively long reasoning time."
//     );
//   }

//   if (
//     difficultyHandlingScore < 50
//   ) {
//     reasons.push(
//       "Performance decreases when question difficulty increases."
//     );
//   }

//   if (
//     consistencyScore < 50
//   ) {
//     reasons.push(
//       "Response times were inconsistent."
//     );
//   }

//   if (fastWrongCount > 0) {
//     reasons.push(
//       "Some incorrect answers were selected unusually quickly."
//     );
//   }

//   if (slowWrongCount > 0) {
//     reasons.push(
//       "Some incorrect answers required relatively long reasoning time."
//     );
//   }

//   if (slowCorrectCount > 0) {
//     reasons.push(
//       "Some correct answers required relatively long reasoning time."
//     );
//   }

//   return reasons;
// };


// /* =========================================================
//    GROUP ANALYSIS
// ========================================================= */

// const analyzeGroups = (
//   responses,
//   groupBy
// ) => {
//   const groups = new Map();

//   responses.forEach((response) => {
//     let key;

//     if (groupBy === "concept") {
//       key =
//         `${response.topic}|||` +
//         `${response.subtopic}|||` +
//         `${response.concept}`;
//     } else {
//       key =
//         `${response.topic}|||` +
//         `${response.subtopic}`;
//     }

//     if (!groups.has(key)) {
//       groups.set(key, []);
//     }

//     groups.get(key).push(response);
//   });

//   const results = [];

//   groups.forEach((items) => {
//     const totalQuestions =
//       items.length;

//     const skippedQuestions =
//       items.filter(
//         (item) => item.isSkipped
//       ).length;

//     const attemptedQuestions =
//       totalQuestions -
//       skippedQuestions;

//     const correctAnswers =
//       items.filter(
//         (item) => item.isCorrect
//       ).length;

//     const wrongAnswers =
//       attemptedQuestions -
//       correctAnswers;

//     const accuracy =
//       calculatePercentage(
//         correctAnswers,
//         attemptedQuestions
//       );

//     const timeMetrics =
//       calculateTimeMetrics(items);

//     const timeEfficiencyScore =
//       calculateTimeEfficiency(items);

//     const difficultyPerformance =
//       analyzeDifficulty(items);

//     const difficultyHandlingScore =
//       calculateDifficultyHandling(
//         difficultyPerformance
//       );

//     const errorPatterns =
//       analyzeErrorPatterns(items);

//     /*
//       IMPORTANT:
//       Accuracy carries the largest weight.

//       Error patterns are used as explanations,
//       not as an additional independent score,
//       because wrong answers are already reflected
//       in accuracy.
//     */

//     const accuracyGap =
//       100 - accuracy;

//     const difficultyGap =
//       100 - difficultyHandlingScore;

//     const timeGap =
//       100 - timeEfficiencyScore;

//     const consistencyGap =
//       100 - timeMetrics.consistency;

//     const weights = {
//       accuracy: 0.60,
//       difficulty: 0.20,
//       timeEfficiency: 0.10,
//       consistency: 0.10,
//     };

//     const gapScore =
//       accuracyGap *
//         weights.accuracy +
//       difficultyGap *
//         weights.difficulty +
//       timeGap *
//         weights.timeEfficiency +
//       consistencyGap *
//         weights.consistency;

//     const status =
//       calculateStatus(
//         gapScore,
//         attemptedQuestions
//       );

//     const gapReasons =
//       generateGapReasons({
//         accuracy,
//         skippedQuestions,
//         totalQuestions,
//         averageResponseTime:
//           timeMetrics.averageResponseTime,
//         difficultyHandlingScore,
//         consistencyScore:
//           timeMetrics.consistency,
//         fastWrongCount:
//           errorPatterns.fastWrongCount,
//         slowWrongCount:
//           errorPatterns.slowWrongCount,
//         slowCorrectCount:
//           errorPatterns.slowCorrectCount,
//       });

//     const result = {
//       totalQuestions,
//       attemptedQuestions,
//       skippedQuestions,

//       correctAnswers,
//       wrongAnswers,

//       accuracy,

//       averageResponseTime:
//         timeMetrics.averageResponseTime,

//       medianResponseTime:
//         timeMetrics.medianResponseTime,

//       timeEfficiencyScore,

//       consistencyScore:
//         timeMetrics.consistency,

//       difficultyHandlingScore,

//       fastWrongCount:
//         errorPatterns.fastWrongCount,

//       slowCorrectCount:
//         errorPatterns.slowCorrectCount,

//       slowWrongCount:
//         errorPatterns.slowWrongCount,

//       gapScore: round(gapScore),

//       status,

//       gapReasons,
//     };

//     if (groupBy === "concept") {
//       result.concept =
//         items[0].concept;

//       result.topic =
//         items[0].topic;

//       result.subtopic =
//         items[0].subtopic;
//     } else {
//       result.topic =
//         items[0].topic;

//       result.subtopic =
//         items[0].subtopic;

//       result.difficultyAccuracy = {
//         easy:
//           difficultyPerformance.find(
//             (item) =>
//               item.difficulty === "easy"
//           )?.accuracy || 0,

//         medium:
//           difficultyPerformance.find(
//             (item) =>
//               item.difficulty === "medium"
//           )?.accuracy || 0,

//         hard:
//           difficultyPerformance.find(
//             (item) =>
//               item.difficulty === "hard"
//           )?.accuracy || 0,
//       };
//     }

//     results.push(result);
//   });

//   return results;
// };


// /* =========================================================
//    RECOMMENDATIONS
// ========================================================= */

// const generateRecommendations = ({
//   overallAccuracy,
//   difficultyHandlingScore,
//   consistencyScore,
//   learningGapScore,
//   conceptPerformance,
// }) => {
//   const recommendations = [];

//   if (overallAccuracy < 50) {
//     recommendations.push(
//       "Review fundamental concepts before attempting harder questions."
//     );
//   }

//   if (difficultyHandlingScore < 50) {
//     recommendations.push(
//       "Practice progressively harder questions instead of jumping directly to difficult questions."
//     );
//   }

//   if (consistencyScore < 50) {
//     recommendations.push(
//       "Work on maintaining consistent response performance."
//     );
//   }

//   const weakConcepts =
//     conceptPerformance.filter(
//       (concept) =>
//         concept.status === "weak"
//     );

//   weakConcepts
//     .sort(
//       (a, b) =>
//         b.gapScore - a.gapScore
//     )
//     .slice(0, 3)
//     .forEach((concept) => {
//       recommendations.push(
//         `Practice ${concept.topic} → ${concept.subtopic} → ${concept.concept} because it has a learning-gap score of ${concept.gapScore}.`
//       );
//     });

//   if (
//     learningGapScore < 20
//   ) {
//     recommendations.push(
//       "Performance indicates strong overall understanding. Continue practicing with varied difficulty levels."
//     );
//   }

//   return recommendations;
// };


// /* =========================================================
//    MAIN PERFORMANCE ANALYZER
// ========================================================= */

// const analyzePerformance = (
//   attempt,
//   questions
// ) => {
//   const questionMap = new Map();

//   questions.forEach((question) => {
//     questionMap.set(
//       question._id.toString(),
//       question
//     );
//   });


//   /*
//     Merge attempt answers with question metadata.

//     This is where CONCEPT enters the Performance Engine.
//   */

//   const responses =
//     attempt.answers.map((answer) => {
//       const question =
//         questionMap.get(
//           answer.questionId.toString()
//         );

//       return {
//         questionId:
//           answer.questionId,

//         topic:
//           question?.topic ||
//           "Unknown",

//         subtopic:
//           question?.subtopic ||
//           "Unknown",

//         concept:
//           question?.concept ||
//           "Unknown",

//         difficulty:
//           question?.difficulty ||
//           "medium",

//         isCorrect:
//           answer.isCorrect,

//         isSkipped:
//           answer.isSkipped,

//         responseTime:
//           Number(answer.responseTime) || 0,
//       };
//     });


//   /* =======================================================
//      OVERALL METRICS
//   ======================================================= */

//   const totalQuestions =
//     responses.length;

//   const skippedQuestions =
//     responses.filter(
//       (response) =>
//         response.isSkipped
//     ).length;

//   const attemptedQuestions =
//     totalQuestions -
//     skippedQuestions;

//   const correctAnswers =
//     responses.filter(
//       (response) =>
//         response.isCorrect
//     ).length;

//   const wrongAnswers =
//     attemptedQuestions -
//     correctAnswers;

//   const overallAccuracy =
//     calculatePercentage(
//       correctAnswers,
//       attemptedQuestions
//     );


//   /* =======================================================
//      TIME METRICS
//   ======================================================= */

//   const timeMetrics =
//     calculateTimeMetrics(
//       responses
//     );

//   const timeEfficiencyScore =
//     calculateTimeEfficiency(
//       responses
//     );


//   /* =======================================================
//      DIFFICULTY
//   ======================================================= */

//   const difficultyPerformance =
//     analyzeDifficulty(
//       responses
//     );

//   const difficultyHandlingScore =
//     calculateDifficultyHandling(
//       difficultyPerformance
//     );


//   /* =======================================================
//      ERROR PATTERNS
//   ======================================================= */

//   const errorPatterns =
//     analyzeErrorPatterns(
//       responses
//     );


//   /* =======================================================
//      TOPIC PERFORMANCE
//   ======================================================= */

//   const topicPerformance =
//     analyzeGroups(
//       responses,
//       "topic"
//     );


//   /* =======================================================
//      CONCEPT PERFORMANCE
//   ======================================================= */

//   const conceptPerformance =
//     analyzeGroups(
//       responses,
//       "concept"
//     );


//   /* =======================================================
//      WEAK / STRONG CONCEPTS
//   ======================================================= */

//   const weakConcepts =
//     conceptPerformance
//       .filter(
//         (concept) =>
//           concept.status === "weak"
//       )
//       .sort(
//         (a, b) =>
//           b.gapScore - a.gapScore
//       );


//   const strongConcepts =
//     conceptPerformance
//       .filter(
//         (concept) =>
//           concept.status === "strong"
//       )
//       .sort(
//         (a, b) =>
//           a.gapScore - b.gapScore
//       );


//   /* =======================================================
//      OVERALL CONSISTENCY
//   ======================================================= */

//   const consistencyScore =
//     timeMetrics.consistency;


//   /* =======================================================
//      OVERALL LEARNING GAP
//   ======================================================= */

//   const accuracyGap =
//     100 - overallAccuracy;

//   const difficultyGap =
//     100 - difficultyHandlingScore;

//   const timeGap =
//     100 - timeEfficiencyScore;

//   const consistencyGap =
//     100 - consistencyScore;


//   /*
//     Error patterns are NOT added again here.

//     Incorrect answers already reduce accuracy.
//     This prevents double-counting the same weakness.
//   */

//   const learningGapScore =
//     accuracyGap * 0.60 +
//     difficultyGap * 0.20 +
//     timeGap * 0.10 +
//     consistencyGap * 0.10;


//   /* =======================================================
//      WEAK / STRONG TOPIC AREAS
//   ======================================================= */

//   const weakAreas =
//     topicPerformance
//       .filter(
//         (topic) =>
//           topic.status === "weak"
//       )
//       .sort(
//         (a, b) =>
//           b.gapScore - a.gapScore
//       );


//   const strongAreas =
//     topicPerformance
//       .filter(
//         (topic) =>
//           topic.status === "strong"
//       )
//       .sort(
//         (a, b) =>
//           a.gapScore - b.gapScore
//       );


//   /* =======================================================
//      LEARNING GAPS
//   ======================================================= */

//   const learningGaps =
//     weakConcepts.map(
//       (concept) => ({
//         concept:
//           concept.concept,

//         topic:
//           concept.topic,

//         subtopic:
//           concept.subtopic,

//         gapScore:
//           concept.gapScore,

//         reasons:
//           concept.gapReasons,
//       })
//     );


//   /* =======================================================
//      RECOMMENDATIONS
//   ======================================================= */

//   const recommendations =
//     generateRecommendations({
//       overallAccuracy,
//       difficultyHandlingScore,
//       consistencyScore,
//       learningGapScore,
//       conceptPerformance,
//     });


//   /* =======================================================
//      CONFIDENCE
//   ======================================================= */

//   /*
//     Confidence is about how much evidence we have,
//     NOT how well the student performed.

//     20 questions = full sample contribution.
//   */

//   const sampleFactor =
//     Math.min(
//       1,
//       totalQuestions / 20
//     );

//   const completionFactor =
//     totalQuestions > 0
//       ? attemptedQuestions /
//         totalQuestions
//       : 0;

//   const confidenceScore =
//     round(
//       sampleFactor * 70 +
//       completionFactor * 30
//     );


//   /* =======================================================
//      FINAL RESULT
//   ======================================================= */

//   return {
//     score:
//       attempt.score,

//     totalQuestions,

//     attemptedQuestions,

//     skippedQuestions,

//     percentage:
//       attempt.percentage,

//     overallAccuracy,

//     averageResponseTime:
//       timeMetrics.averageResponseTime,

//     medianResponseTime:
//       timeMetrics.medianResponseTime,

//     responseTimeStdDev:
//       timeMetrics.responseTimeStdDev,

//     responseTimeConsistency:
//       timeMetrics.consistency,

//     timeEfficiencyScore,

//     difficultyHandlingScore,

//     consistencyScore,

//     learningGapScore:
//       round(learningGapScore),

//     confidenceScore,

//     topicPerformance,

//     conceptPerformance,

//     difficultyPerformance,

//     weakAreas,

//     strongAreas,

//     weakConcepts,

//     strongConcepts,

//     learningGaps,

//     recommendations,

//     errorPatterns,
//   };
// };


// module.exports = {
//   analyzePerformance,
// };































const PERFORMANCE_CONFIG = require("./performanceConfig");

const round = (value, decimals = 2) =>
  Number(Number(value).toFixed(decimals));

const calculateAverage = (values) => {
  if (!values.length) return 0;

  return round(
    values.reduce((sum, value) => sum + value, 0) /
      values.length
  );
};

const calculateMedian = (values) => {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return round(
      (sorted[middle - 1] + sorted[middle]) / 2
    );
  }

  return round(sorted[middle]);
};

const calculateStandardDeviation = (values) => {
  if (values.length <= 1) return 0;

  const mean =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  const variance =
    values.reduce(
      (sum, value) =>
        sum + Math.pow(value - mean, 2),
      0
    ) / values.length;

  return round(Math.sqrt(variance));
};


/* =====================================
   STATUS
===================================== */

const calculateStatus = (
  gapScore,
  attemptedQuestions
) => {
  /*
    One question is not enough evidence to
    classify a concept as weak / average / strong.
  */

  if (attemptedQuestions < 2) {
    return "insufficient-data";
  }

  if (gapScore < 20) {
    return "strong";
  }

  if (gapScore < 50) {
    return "average";
  }

  return "weak";
};


/* =====================================
   TIME EFFICIENCY
===================================== */

const calculateTimeEfficiency = (
  responses
) => {
  const attempted = responses.filter(
    (response) => !response.isSkipped
  );

  if (!attempted.length) return 0;

  const scores = attempted.map((response) => {
    const expectedTime =
      PERFORMANCE_CONFIG.expectedResponseTime[
        response.difficulty
      ] || 35;

    const actualTime =
      Number(response.responseTime) || 0;

    if (actualTime <= 0) return 50;

    /*
      Very fast responses are not automatically
      considered better. Extremely fast responses
      receive only partial credit.
    */

    if (
      actualTime <
      expectedTime *
        PERFORMANCE_CONFIG.fastMultiplier
    ) {
      return 70;
    }

    if (actualTime <= expectedTime) {
      return 100;
    }

    if (
      actualTime <=
      expectedTime *
        PERFORMANCE_CONFIG.slowMultiplier
    ) {
      return 70;
    }

    return 40;
  });

  return calculateAverage(scores);
};


/* =====================================
   DIFFICULTY HANDLING
===================================== */

const calculateDifficultyHandling = (
  responses
) => {
  const difficulties = [
    "easy",
    "medium",
    "hard",
  ];

  const scores = [];

  difficulties.forEach((difficulty) => {
    const group = responses.filter(
      (response) =>
        response.difficulty === difficulty &&
        !response.isSkipped
    );

    if (!group.length) return;

    const correct = group.filter(
      (response) => response.isCorrect
    ).length;

    const accuracy =
      (correct / group.length) * 100;

    scores.push(accuracy);
  });

  if (!scores.length) return 0;

  return calculateAverage(scores);
};


/* =====================================
   CONSISTENCY
===================================== */

const calculateConsistency = (
  responses
) => {
  const times = responses
    .filter(
      (response) =>
        !response.isSkipped &&
        Number(response.responseTime) > 0
    )
    .map(
      (response) =>
        Number(response.responseTime)
    );

  if (times.length <= 1) {
    return times.length === 1 ? 100 : 0;
  }

  const mean = calculateAverage(times);

  if (mean === 0) return 0;

  const standardDeviation =
    calculateStandardDeviation(times);

  const coefficient =
    standardDeviation / mean;

  /*
    Lower variation = higher consistency.
  */

  const score =
    100 -
    Math.min(coefficient * 100, 100);

  return round(Math.max(score, 0));
};


/* =====================================
   ERROR PATTERNS
===================================== */

const analyzeErrorPatterns = (
  responses
) => {
  let fastWrongCount = 0;
  let slowCorrectCount = 0;
  let slowWrongCount = 0;

  responses.forEach((response) => {
    if (response.isSkipped) return;

    const expectedTime =
      PERFORMANCE_CONFIG.expectedResponseTime[
        response.difficulty
      ] || 35;

    const actualTime =
      Number(response.responseTime) || 0;

    if (
      !response.isCorrect &&
      actualTime <
        expectedTime *
          PERFORMANCE_CONFIG.fastMultiplier
    ) {
      fastWrongCount++;
    }

    if (
      response.isCorrect &&
      actualTime >
        expectedTime *
          PERFORMANCE_CONFIG.slowMultiplier
    ) {
      slowCorrectCount++;
    }

    if (
      !response.isCorrect &&
      actualTime >
        expectedTime *
          PERFORMANCE_CONFIG.slowMultiplier
    ) {
      slowWrongCount++;
    }
  });

  return {
    fastWrongCount,
    slowCorrectCount,
    slowWrongCount,
  };
};


/* =====================================
   GAP REASONS
===================================== */

const getGapReasons = ({
  accuracy,
  difficultyHandlingScore,
  timeEfficiencyScore,
  consistencyScore,
  errorPatterns,
}) => {
  const reasons = [];

  if (accuracy < 50) {
    reasons.push("Low accuracy");
  }

  if (difficultyHandlingScore < 50) {
    reasons.push(
      "Difficulty handling needs improvement"
    );
  }

  if (timeEfficiencyScore < 50) {
    reasons.push(
      "Response time efficiency needs improvement"
    );
  }

  if (consistencyScore < 50) {
    reasons.push(
      "Inconsistent response performance"
    );
  }

  if (errorPatterns.fastWrongCount > 0) {
    reasons.push(
      "Fast incorrect responses detected"
    );
  }

  if (errorPatterns.slowWrongCount > 0) {
    reasons.push(
      "Slow incorrect responses detected"
    );
  }

  return reasons;
};


/* =====================================
   GROUP ANALYSIS
===================================== */

const analyzeGroups = (
  responses,
  groupBy
) => {
  const groups = new Map();

  responses.forEach((response) => {
    let key;

    if (groupBy === "concept") {
      key = [
        response.topic,
        response.subtopic,
        response.concept,
      ].join("|||");
    } else {
      key = [
        response.topic,
        response.subtopic,
      ].join("|||");
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(response);
  });

  const results = [];

  groups.forEach((groupResponses) => {
    const totalQuestions =
      groupResponses.length;

    const skippedQuestions =
      groupResponses.filter(
        (response) => response.isSkipped
      ).length;

    const attemptedResponses =
      groupResponses.filter(
        (response) => !response.isSkipped
      );

    const attemptedQuestions =
      attemptedResponses.length;

    const correctAnswers =
      attemptedResponses.filter(
        (response) => response.isCorrect
      ).length;

    const wrongAnswers =
      attemptedQuestions - correctAnswers;

    const accuracy =
      attemptedQuestions > 0
        ? round(
            (correctAnswers /
              attemptedQuestions) *
              100
          )
        : 0;

    const responseTimes =
      attemptedResponses
        .map(
          (response) =>
            Number(response.responseTime) || 0
        )
        .filter((time) => time > 0);

    const averageResponseTime =
      calculateAverage(responseTimes);

    const medianResponseTime =
      calculateMedian(responseTimes);

    const timeEfficiencyScore =
      calculateTimeEfficiency(
        groupResponses
      );

    const consistencyScore =
      calculateConsistency(
        groupResponses
      );

    const difficultyHandlingScore =
      calculateDifficultyHandling(
        groupResponses
      );

    const errorPatterns =
      analyzeErrorPatterns(
        groupResponses
      );

    /*
      Accuracy is the main indicator.

      Difficulty handling, time efficiency,
      and consistency provide supporting evidence.
    */

    const accuracyGap =
      100 - accuracy;

    const difficultyGap =
      100 - difficultyHandlingScore;

    const timeGap =
      100 - timeEfficiencyScore;

    const consistencyGap =
      100 - consistencyScore;

    const gapScore = round(
      accuracyGap * 0.60 +
        difficultyGap * 0.20 +
        timeGap * 0.10 +
        consistencyGap * 0.10
    );

    const status =
      calculateStatus(
        gapScore,
        attemptedQuestions
      );

    const gapReasons =
      getGapReasons({
        accuracy,
        difficultyHandlingScore,
        timeEfficiencyScore,
        consistencyScore,
        errorPatterns,
      });

    const result = {
      totalQuestions,
      attemptedQuestions,
      skippedQuestions,

      correctAnswers,
      wrongAnswers,

      accuracy,

      averageResponseTime,
      medianResponseTime,

      timeEfficiencyScore,
      consistencyScore,

      difficultyHandlingScore,

      fastWrongCount:
        errorPatterns.fastWrongCount,

      slowCorrectCount:
        errorPatterns.slowCorrectCount,

      slowWrongCount:
        errorPatterns.slowWrongCount,

      gapScore,

      status,

      gapReasons,
    };

    if (groupBy === "concept") {
      result.concept =
        groupResponses[0].concept;

      result.topic =
        groupResponses[0].topic;

      result.subtopic =
        groupResponses[0].subtopic;
    } else {
      result.topic =
        groupResponses[0].topic;

      result.subtopic =
        groupResponses[0].subtopic;
    }

    results.push(result);
  });

  return results;
};


/* =====================================
   DIFFICULTY PERFORMANCE
===================================== */

const analyzeDifficultyPerformance = (
  responses
) => {
  const difficulties = [
    "easy",
    "medium",
    "hard",
  ];

  return difficulties
    .map((difficulty) => {
      const group =
        responses.filter(
          (response) =>
            response.difficulty === difficulty
        );

      if (!group.length) {
        return null;
      }

      const attempted =
        group.filter(
          (response) => !response.isSkipped
        );

      const correct =
        attempted.filter(
          (response) => response.isCorrect
        );

      const responseTimes =
        attempted
          .map(
            (response) =>
              Number(response.responseTime) || 0
          )
          .filter((time) => time > 0);

      const accuracy =
        attempted.length > 0
          ? round(
              (correct.length /
                attempted.length) *
                100
            )
          : 0;

      return {
        difficulty,

        totalQuestions:
          group.length,

        attemptedQuestions:
          attempted.length,

        correctAnswers:
          correct.length,

        wrongAnswers:
          attempted.length -
          correct.length,

        skippedQuestions:
          group.length -
          attempted.length,

        accuracy,

        averageResponseTime:
          calculateAverage(responseTimes),

        timeEfficiencyScore:
          calculateTimeEfficiency(group),
      };
    })
    .filter(Boolean);
};


/* =====================================
   RECOMMENDATIONS
===================================== */

const generateRecommendations = ({
  overallAccuracy,
  difficultyHandlingScore,
  timeEfficiencyScore,
  consistencyScore,
  weakAreas,
  weakConcepts,
}) => {
  const recommendations = [];

  if (overallAccuracy < 50) {
    recommendations.push(
      "Review fundamental concepts before attempting harder questions."
    );
  }

  if (difficultyHandlingScore < 50) {
    recommendations.push(
      "Practice progressively harder questions instead of jumping directly into difficult questions."
    );
  }

  if (timeEfficiencyScore < 50) {
    recommendations.push(
      "Practice solving questions within an appropriate time limit."
    );
  }

  if (consistencyScore < 50) {
    recommendations.push(
      "Work on maintaining consistent response performance."
    );
  }

  /*
    Concept-level recommendations are used only
    when sufficient evidence exists.
  */

  weakConcepts
    .slice(0, 3)
    .forEach((concept) => {
      recommendations.push(
        `Review ${concept.concept} in ${concept.topic} → ${concept.subtopic}.`
      );
    });

  /*
    If there are no sufficiently evidenced weak
    concepts, recommend the weak topic/subtopic.
  */

  if (
    weakConcepts.length === 0 &&
    weakAreas.length > 0
  ) {
    weakAreas
      .slice(0, 2)
      .forEach((area) => {
        recommendations.push(
          `Practice more questions in ${area.topic} → ${area.subtopic}.`
        );
      });
  }

  return recommendations.slice(0, 5);
};


/* =====================================
   LEARNING GAPS
===================================== */

const buildLearningGaps = ({
  weakAreas,
  weakConcepts,
}) => {
  /*
    Priority 1:
    If a concept has enough evidence and is weak,
    use the concept as the learning gap.

    Priority 2:
    If concepts do not yet have enough evidence,
    use the weak topic/subtopic as the learning gap.
  */

  if (weakConcepts.length > 0) {
    return weakConcepts
      .slice(0, 5)
      .map((concept) => ({
        concept: concept.concept,
        topic: concept.topic,
        subtopic: concept.subtopic,
        gapScore: concept.gapScore,
        reasons: concept.gapReasons,
      }));
  }

  return weakAreas
    .slice(0, 5)
    .map((area) => ({
      concept: null,
      topic: area.topic,
      subtopic: area.subtopic,
      gapScore: area.gapScore,
      reasons: area.gapReasons,
    }));
};


/* =====================================
   MAIN PERFORMANCE ANALYZER
===================================== */

const analyzePerformance = (
  attempt,
  questions
) => {
  const questionMap = new Map();

  questions.forEach((question) => {
    questionMap.set(
      question._id.toString(),
      question
    );
  });

  /*
    Combine answer data with question metadata.
  */

  const responses =
    attempt.answers.map((answer) => {
      const question =
        questionMap.get(
          answer.questionId.toString()
        );

      return {
        questionId:
          answer.questionId,

        topic:
          question?.topic || "Unknown",

        subtopic:
          question?.subtopic || "Unknown",

        concept:
          question?.concept || "Unknown",

        difficulty:
          question?.difficulty || "medium",

        isCorrect:
          answer.isCorrect,

        isSkipped:
          answer.isSkipped,

        responseTime:
          Number(answer.responseTime) || 0,
      };
    });

    

  /* =====================================
     OVERALL
  ===================================== */

  const totalQuestions =
    responses.length;

  const skippedQuestions =
    responses.filter(
      (response) => response.isSkipped
    ).length;

  const attemptedResponses =
    responses.filter(
      (response) => !response.isSkipped
    );

  const attemptedQuestions =
    attemptedResponses.length;

  const correctAnswers =
    attemptedResponses.filter(
      (response) => response.isCorrect
    ).length;

  const overallAccuracy =
    attemptedQuestions > 0
      ? round(
          (correctAnswers /
            attemptedQuestions) *
            100
        )
      : 0;

  const percentage =
    totalQuestions > 0
      ? round(
          (correctAnswers /
            totalQuestions) *
            100
        )
      : 0;


  /* =====================================
     RESPONSE TIME
  ===================================== */

  const responseTimes =
    attemptedResponses
      .map(
        (response) =>
          Number(response.responseTime) || 0
      )
      .filter((time) => time > 0);

  const averageResponseTime =
    calculateAverage(responseTimes);

  const medianResponseTime =
    calculateMedian(responseTimes);

  const responseTimeStdDev =
    calculateStandardDeviation(
      responseTimes
    );

  const responseTimeConsistency =
    calculateConsistency(responses);

  const timeEfficiencyScore =
    calculateTimeEfficiency(responses);


  /* =====================================
     DIFFICULTY
  ===================================== */

  const difficultyHandlingScore =
    calculateDifficultyHandling(
      responses
    );

  const difficultyPerformance =
    analyzeDifficultyPerformance(
      responses
    );


  /* =====================================
     TOPIC PERFORMANCE
  ===================================== */

  const topicPerformance =
    analyzeGroups(
      responses,
      "topic"
    );


  /* =====================================
     CONCEPT PERFORMANCE
  ===================================== */

  const conceptPerformance =
    analyzeGroups(
      responses,
      "concept"
    );


  /* =====================================
     WEAK / STRONG AREAS
  ===================================== */

  const weakAreas =
    topicPerformance
      .filter(
        (area) =>
          area.status === "weak"
      )
      .sort(
        (a, b) =>
          b.gapScore - a.gapScore
      );

  const strongAreas =
    topicPerformance
      .filter(
        (area) =>
          area.status === "strong"
      )
      .sort(
        (a, b) =>
          a.gapScore - b.gapScore
      );


  /* =====================================
     WEAK / STRONG CONCEPTS
  ===================================== */

  const weakConcepts =
    conceptPerformance
      .filter(
        (concept) =>
          concept.status === "weak"
      )
      .sort(
        (a, b) =>
          b.gapScore - a.gapScore
      );

  const strongConcepts =
    conceptPerformance
      .filter(
        (concept) =>
          concept.status === "strong"
      )
      .sort(
        (a, b) =>
          a.gapScore - b.gapScore
      );


  /* =====================================
     LEARNING GAP
  ===================================== */

  const accuracyGap =
    100 - overallAccuracy;

  const difficultyGap =
    100 - difficultyHandlingScore;

  const timeGap =
    100 - timeEfficiencyScore;

  const consistencyGap =
    100 - responseTimeConsistency;

  const learningGapScore =
    round(
      accuracyGap * 0.60 +
        difficultyGap * 0.20 +
        timeGap * 0.10 +
        consistencyGap * 0.10
    );


  /* =====================================
     LEARNING GAPS
  ===================================== */

  const learningGaps =
    buildLearningGaps({
      weakAreas,
      weakConcepts,
    });


  /* =====================================
     CONFIDENCE
  ===================================== */

  const sampleFactor =
    Math.min(
      1,
      totalQuestions / 20
    );

  const completionFactor =
    totalQuestions > 0
      ? attemptedQuestions /
        totalQuestions
      : 0;

  const confidenceScore =
    round(
      sampleFactor * 70 +
        completionFactor * 30
    );


  /* =====================================
     RECOMMENDATIONS
  ===================================== */

  const recommendations =
    generateRecommendations({
      overallAccuracy,
      difficultyHandlingScore,
      timeEfficiencyScore,
      consistencyScore:
        responseTimeConsistency,
      weakAreas,
      weakConcepts,
    });


  /* =====================================
     ERROR PATTERNS
  ===================================== */

  const errorPatterns =
    analyzeErrorPatterns(
      responses
    );


  /* =====================================
     FINAL RESULT
  ===================================== */

  return {
    score: attempt.score,

    totalQuestions,

    attemptedQuestions,

    skippedQuestions,

    percentage,

    overallAccuracy,

    averageResponseTime,

    medianResponseTime,

    responseTimeStdDev,

    responseTimeConsistency,

    timeEfficiencyScore,

    difficultyHandlingScore,

    consistencyScore:
      responseTimeConsistency,

    learningGapScore,

    confidenceScore,

    topicPerformance,

    conceptPerformance,

    difficultyPerformance,

    weakAreas,

    strongAreas,

    weakConcepts,

    strongConcepts,

    learningGaps,

    recommendations,

    errorPatterns,
  };
};


module.exports = {
  analyzePerformance,
};