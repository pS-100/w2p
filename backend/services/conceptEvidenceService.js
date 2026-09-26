const ConceptEvidence =
  require("../models/ConceptEvidence");

const calculateStatus = (
  gapScore,
  attemptedQuestions
) => {
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


const updateConceptEvidence =
  async ({
    userId,
    performance,
    attemptId,
  }) => {
    if (
      !performance ||
      !Array.isArray(
        performance.conceptPerformance
      )
    ) {
      return [];
    }

    const updatedEvidence = [];

    for (
      const conceptData
      of performance.conceptPerformance
    ) {
      const {
        topic,
        subtopic,
        concept,
        totalQuestions,
        attemptedQuestions,
        skippedQuestions,
        correctAnswers,
        wrongAnswers,
        accuracy,
        averageResponseTime,
        timeEfficiencyScore,
        consistencyScore,
        difficultyHandlingScore,
        gapScore,
      } = conceptData;


      const existing =
        await ConceptEvidence.findOne({
          userId,
          subject: performance.subject,
          topic,
          subtopic,
          concept,
        });


      if (!existing) {
        const evidence =
          await ConceptEvidence.create({
            userId,

            subject:
              performance.subject,

            topic,
            subtopic,
            concept,

            totalQuestions:
              totalQuestions || 0,

            attemptedQuestions:
              attemptedQuestions || 0,

            skippedQuestions:
              skippedQuestions || 0,

            correctAnswers:
              correctAnswers || 0,

            wrongAnswers:
              wrongAnswers || 0,

            accuracy:
              accuracy || 0,

            averageResponseTime:
              averageResponseTime || 0,

            timeEfficiencyScore:
              timeEfficiencyScore || 0,

            consistencyScore:
              consistencyScore || 0,

            difficultyHandlingScore:
              difficultyHandlingScore || 0,

            learningGapScore:
              gapScore || 0,

            status: calculateStatus(
              gapScore || 0,
              attemptedQuestions || 0
            ),

            attemptsCount: 1,

            sourceAttemptIds: [
              attemptId,
            ],

            lastAttemptAt:
              new Date(),
          });

        updatedEvidence.push(evidence);

        continue;
      }
      else {

        const alreadyProcessed =
          existing.sourceAttemptIds.some(
            (id) =>
              id.toString() ===
              attemptId.toString()
          );

        if (alreadyProcessed) {
          updatedEvidence.push(existing);
          continue;
        }


        // ==========================================
        // CUMULATIVE EVIDENCE
        // ==========================================

        const oldAttempted =
          existing.attemptedQuestions;

        const newAttempted =
          attemptedQuestions || 0;

        const combinedAttempted =
          oldAttempted + newAttempted;


        const oldCorrect =
          existing.correctAnswers;

        const newCorrect =
          correctAnswers || 0;

        const combinedCorrect =
          oldCorrect + newCorrect;


        const oldTotal =
          existing.totalQuestions;

        const newTotal =
          totalQuestions || 0;

        const combinedTotal =
          oldTotal + newTotal;


        const oldSkipped =
          existing.skippedQuestions;

        const newSkipped =
          skippedQuestions || 0;


        // ==========================================
        // WEIGHTED RESPONSE TIME
        // ==========================================

        let combinedAverageTime = 0;

        if (combinedAttempted > 0) {
          combinedAverageTime =
            (
              existing.averageResponseTime *
              oldAttempted
              +
              (averageResponseTime || 0) *
              newAttempted
            ) /
            combinedAttempted;
        }


        // ==========================================
        // CUMULATIVE ACCURACY
        // ==========================================

        const combinedAccuracy =
          combinedAttempted > 0
            ? (
              combinedCorrect /
              combinedAttempted
            ) * 100
            : 0;


        // ==========================================
        // WEIGHTED PERFORMANCE SCORES
        // ==========================================

        const weightOld =
          oldAttempted;

        const weightNew =
          newAttempted;

        const totalWeight =
          weightOld + weightNew;


        const weightedScore = (
          oldValue,
          newValue
        ) => {
          if (totalWeight === 0) {
            return 0;
          }

          return (
            (
              oldValue * weightOld +
              newValue * weightNew
            ) /
            totalWeight
          );
        };


        const combinedTimeEfficiency =
          weightedScore(
            existing.timeEfficiencyScore,
            timeEfficiencyScore || 0
          );


        const combinedConsistency =
          weightedScore(
            existing.consistencyScore,
            consistencyScore || 0
          );


        const combinedDifficulty =
          weightedScore(
            existing.difficultyHandlingScore,
            difficultyHandlingScore || 0
          );


        /*
         * Learning gap is also accumulated using
         * attempted-question weighting.
         */
        const combinedGapScore =
          weightedScore(
            existing.learningGapScore,
            gapScore || 0
          );


        existing.totalQuestions =
          combinedTotal;

        existing.attemptedQuestions =
          combinedAttempted;

        existing.skippedQuestions =
          oldSkipped + newSkipped;

        existing.correctAnswers =
          combinedCorrect;

        existing.wrongAnswers =
          combinedAttempted -
          combinedCorrect;

        existing.accuracy =
          Number(
            combinedAccuracy.toFixed(2)
          );

        existing.averageResponseTime =
          Number(
            combinedAverageTime.toFixed(2)
          );

        existing.timeEfficiencyScore =
          Number(
            combinedTimeEfficiency.toFixed(2)
          );

        existing.consistencyScore =
          Number(
            combinedConsistency.toFixed(2)
          );

        existing.difficultyHandlingScore =
          Number(
            combinedDifficulty.toFixed(2)
          );

        existing.learningGapScore =
          Number(
            combinedGapScore.toFixed(2)
          );

        existing.status =
          calculateStatus(
            combinedGapScore,
            combinedAttempted
          );

        existing.attemptsCount += 1;

        existing.sourceAttemptIds.push(
          attemptId
        );

        existing.lastAttemptAt =
          new Date();

        await existing.save();

        updatedEvidence.push(existing);
      }
    }

    return updatedEvidence;
  };


module.exports = {
  updateConceptEvidence,
};