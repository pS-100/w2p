const mongoose = require("mongoose");

const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const Performance = require("../models/Performance");

const TopicCoverage = require("../models/TopicCoverage");

const {
  analyzePerformance,
} = require("../services/performanceAnalyzer");

const {
  updateConceptEvidence,
} = require("../services/conceptEvidenceService");

const analyzeAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    console.log("PERFORMANCE REQUEST");
    console.log("attemptId:", attemptId);
    console.log("req.userId:", req.userId);

    // 1. Validate attempt ID BEFORE querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      console.log("Invalid attemptId:", attemptId);

      return res.status(400).json({
        message: "Invalid attemptId",
      });
    }

    // 2. Find attempt
    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found.",
      });
    }

    // 3. Make sure the attempt belongs to logged-in user
    if (
      !attempt.userId ||
      attempt.userId.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this attempt.",
      });
    }

    // 4. Check whether performance was already analyzed
    const existingPerformance =
      await Performance.findOne({
        attemptId: attempt._id,
      });

    if (existingPerformance) {
  const existingQuestions = await Question.find({
    _id: {
      $in: attempt.answers.map(
        (answer) => answer.questionId
      ),
    },
  });

  const existingCoverage =
    existingQuestions.length > 0
      ? await TopicCoverage.findOne({
          userId: req.userId,
          subject: existingQuestions[0].subject,
          topic: existingQuestions[0].topic,
          subtopic: existingQuestions[0].subtopic,
        })
      : null;

  const existingRemainingConcepts =
    existingCoverage
      ? existingCoverage.concepts
          .filter((concept) => !concept.assessed)
          .map((concept) => concept.concept)
      : [];

  return res.status(200).json({
    message: "Performance already analyzed",
    performance: {
      ...existingPerformance.toObject(),
      coverageId:
    existingCoverage?._id || null,
      remainingConcepts:
        existingRemainingConcepts,
    },
  });
}

    // 5. Get question IDs
    const questionIds = attempt.answers.map(
      (answer) => answer.questionId
    );

    // 6. Get questions
    const questions = await Question.find({
      _id: {
        $in: questionIds,
      },
    });

    if (
      questions.length !==
      questionIds.length
    ) {
      return res.status(400).json({
        message:
          "Some questions from this attempt were not found",
      });
    }

    // Find topic coverage for this assessment
    const coverage = await TopicCoverage.findOne({
      userId: req.userId,
      subject: questions[0].subject,
      topic: questions[0].topic,
      subtopic: questions[0].subtopic,
    });

    const remainingConcepts = coverage
      ? coverage.concepts
        .filter((concept) => !concept.assessed)
        .map((concept) => concept.concept)
      : [];

    // 7. Analyze performance
    const analysis =
      analyzePerformance(
        attempt,
        questions
      );

    console.log(
      "Performance analysis completed"
    );


    // 8. Save performance
    const savedPerformance =
      await Performance.create({
        attemptId: attempt._id,

        userId: attempt.userId,

        subject: questions[0].subject,

        score: analysis.score,

        totalQuestions:
          analysis.totalQuestions,

        attemptedQuestions:
          analysis.attemptedQuestions,

        skippedQuestions:
          analysis.skippedQuestions,

        percentage:
          analysis.percentage,

        overallAccuracy:
          analysis.overallAccuracy,

        averageResponseTime:
          analysis.averageResponseTime,

        medianResponseTime:
          analysis.medianResponseTime,

        responseTimeStdDev:
          analysis.responseTimeStdDev,

        responseTimeConsistency:
          analysis.responseTimeConsistency,

        timeEfficiencyScore:
          analysis.timeEfficiencyScore,

        difficultyHandlingScore:
          analysis.difficultyHandlingScore,

        consistencyScore:
          analysis.consistencyScore,

        learningGapScore:
          analysis.learningGapScore,

        confidenceScore:
          analysis.confidenceScore,

        topicPerformance:
          analysis.topicPerformance,

        conceptPerformance:
          analysis.conceptPerformance,

        difficultyPerformance:
          analysis.difficultyPerformance,

        weakAreas:
          analysis.weakAreas,

        strongAreas:
          analysis.strongAreas,

        weakConcepts:
          analysis.weakConcepts,

        strongConcepts:
          analysis.strongConcepts,

        learningGaps:
          analysis.learningGaps,

        recommendations:
          analysis.recommendations,

        analysisVersion: "1.0",
      });

    await updateConceptEvidence({
      userId: req.userId,
      performance: savedPerformance,
      attemptId,
    });

    return res.status(201).json({
  message:
    "Performance analyzed successfully",

  performance: {
    ...savedPerformance.toObject(),
        coverageId: coverage?._id || null,

    remainingConcepts,
  },
});
  } catch (error) {
    console.error(
      "Performance Analysis Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to analyze performance",

      error: error.message,
    });
  }
};

module.exports = {
  analyzeAttempt,
};