const mongoose = require("mongoose");

const Attempt = require("../models/Attempt");
const Performance = require("../models/Performance");
const Question = require("../models/Question");



const {
  analyzeImprovement,
} = require(
  "../services/improvementAnalyzer"
);

const {
  buildAdaptiveStrategy,
} = require("../services/adaptiveStrategy");

const {
  generateAdaptiveQuestions,
} = require("../services/adaptiveGemini");

const {
  validateAdaptiveQuestions,
} = require("../services/adaptivequestionValidator");

// const {
//   validateQuestions,
// } = require("../services/questionValidator");


const {
  removeDuplicates,
  checkDatabaseDuplicates,
} = require("../services/duplicateDetector");

const AdaptiveRetest = require("../models/AdaptiveRetest");

/*
==================================================
CREATE ADAPTIVE RETEST
==================================================
*/

const createAdaptiveRetest = async (req, res) => {
  try {
    const { attemptId } = req.params;

    /*
    -----------------------------------------------
    1. Validate Attempt ID
    -----------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        message: "Invalid attemptId",
      });
    }


    /*
    -----------------------------------------------
    2. Find Original Attempt
    -----------------------------------------------
    */

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found.",
      });
    }

    if (
      attempt.userId.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to generate a re-test for this attempt.",
      });
    }

    // -----------------------------------------------
    // 3. Check if adaptive re-test already exists
    // -----------------------------------------------

    const existingRetest = await AdaptiveRetest.findOne({
      sourceAttemptId: attempt._id,
      status: "generated",
    }).populate("questionIds");



    if (existingRetest) {
      console.log("Existing adaptive re-test found.");

      return res.status(200).json({
        message: "Existing adaptive re-test returned",
        retestId: existingRetest._id,
        sourceAttemptId: existingRetest.sourceAttemptId,
        performanceId: existingRetest.performanceId,
        strategy: existingRetest.strategy,
        questions: existingRetest.questionIds,
      });
    }


    /*
    -----------------------------------------------
    3. Find Performance Analysis
    -----------------------------------------------
    */

    const performance = await Performance.findOne({
      attemptId: attempt._id,
    });

    if (!performance) {
      return res.status(404).json({
        message:
          "Performance analysis not found. Analyze the attempt first.",
      });
    }


    /*
    -----------------------------------------------
    4. Check Weak Areas
    -----------------------------------------------
    */

    const hasWeakConcepts =
      Array.isArray(performance.weakConcepts) &&
      performance.weakConcepts.length > 0;

    const hasWeakAreas =
      Array.isArray(performance.weakAreas) &&
      performance.weakAreas.length > 0;

    if (!hasWeakConcepts && !hasWeakAreas) {
      return res.status(200).json({
        message:
          "No significant weak concept or weak area found. Adaptive re-test is not required.",
        performanceId: performance._id,
      });
    }




    /*
    -----------------------------------------------
    5. Build Adaptive Strategy
    -----------------------------------------------
    */

    const strategy = buildAdaptiveStrategy(
      performance
    );

    if (!strategy) {
      return res.status(400).json({
        message:
          "Unable to build adaptive strategy",
      });
    }

    console.log(
      "Adaptive Strategy:",
      strategy
    );


    /*
    -----------------------------------------------
    6. Generate Questions Using Gemini
    -----------------------------------------------
    */

    // let generatedQuestions =
    //   await generateAdaptiveQuestions(
    //     strategy
    //   );

    const generationResult =
      await generateAdaptiveQuestions(strategy);

    let generatedQuestions =
      generationResult.questions;

    console.log(
      `Adaptive questions source: ${generationResult.source}`
    );

    if (
      !Array.isArray(generatedQuestions) ||
      generatedQuestions.length === 0
    ) {
      return res.status(500).json({
        message:
          "Gemini generated no questions",
      });
    }


    console.log(
      "Generated adaptive questions before target validation:",
      JSON.stringify(generatedQuestions, null, 2)
    );

    console.log("Adaptive strategy:", strategy);


    /*
    -----------------------------------------------
    7. Validate Generated Questions
    -----------------------------------------------
    
    validateQuestions expects:

    {
      questions: [...]
    }
    */

    generatedQuestions =
  validateAdaptiveQuestions(
    generatedQuestions
  );

    /*
    -----------------------------------------------
    8. Adaptive-Specific Validation
    -----------------------------------------------

    Make sure Gemini did not generate questions
    outside the weak topic/subtopic.
    */

    console.log("Generated Questions:");
    console.dir(generatedQuestions, { depth: null });

    console.log("Adaptive Strategy:");
    console.dir(strategy, { depth: null });




    const targetTopic = String(
      strategy.targetTopic || ""
    )
      .trim()
      .toLowerCase();

    const targetSubtopic = String(
      strategy.targetSubtopic || ""
    )
      .trim()
      .toLowerCase();

    const targetConcept = String(
      strategy.targetConcept || ""
    )
      .trim()
      .toLowerCase();

    const invalidAdaptiveQuestions =
      generatedQuestions.filter((question) => {
        const questionTopic = String(
          question.topic || ""
        )
          .trim()
          .toLowerCase();

        const questionSubtopic = String(
          question.subtopic || ""
        )
          .trim()
          .toLowerCase();

        const questionConcept = String(
          question.concept || ""
        )
          .trim()
          .toLowerCase();

        return (
          !questionTopic ||
          !questionSubtopic ||
          !questionConcept ||
          questionTopic !== targetTopic ||
          questionSubtopic !== targetSubtopic ||
          questionConcept !== targetConcept
        );
      });

    if (invalidAdaptiveQuestions.length > 0) {
      return res.status(400).json({
        message:
          "Adaptive questions were generated outside the target weak concept.",
        target: {
          topic: strategy.targetTopic,
          subtopic: strategy.targetSubtopic,
          concept: strategy.targetConcept,
        },
      });
    }


    /*
    -----------------------------------------------
    9. Remove Duplicates Inside Gemini Response
    -----------------------------------------------
    */

    generatedQuestions =
      removeDuplicates(
        generatedQuestions
      );


    /*
    -----------------------------------------------
    10. Check Database Duplicates
    -----------------------------------------------
    */

    generatedQuestions =
      await checkDatabaseDuplicates(
        generatedQuestions
      );


    /*
    -----------------------------------------------
    11. Check Final Question Count
    -----------------------------------------------
    */

    if (
      generatedQuestions.length < 3
    ) {
      return res.status(500).json({
        message:
          "Too many duplicate questions were generated. Please try again.",

        generatedQuestionCount:
          generatedQuestions.length,
      });
    }


    /*
    -----------------------------------------------
    12. Save Adaptive Questions
    -----------------------------------------------
    */

    const savedQuestions =
      await Question.insertMany(
        generatedQuestions.map(
          (question) => ({
            ...question,

            generationType:
              "adaptive-retest",

            parentAttemptId:
              attempt._id,
          })
        )
      );


    /*
    -----------------------------------------------
    13. Save Adaptive Retest Record
    -----------------------------------------------
    */

    const adaptiveRetest = await AdaptiveRetest.create({
      sourceAttemptId: attempt._id,
      performanceId: performance._id,
      userId: attempt.userId,

      targetTopic: strategy.targetTopic,
      targetSubtopic: strategy.targetSubtopic,
      targetConcept: strategy.targetConcept,

      gapScore: strategy.gapScore,

      strategy,

      questionIds:
        savedQuestions.map(
          (question) =>
            question._id
        ),

      status:
        "generated",
    });


    /*
    -----------------------------------------------
    14. Return Response
    -----------------------------------------------
    */

    return res.status(201).json({
      message:
        "Adaptive re-test generated successfully",

      retestId:
        adaptiveRetest._id,

      sourceAttemptId:
        attempt._id,

      performanceId:
        performance._id,

      strategy,

      questions:
        savedQuestions,
    });

  } catch (error) {
    console.error(
      "Adaptive Retest Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate adaptive re-test",

      error:
        error.message,
    });
  }



};

const analyzeRetestImprovement =
  async (req, res) => {
    try {
      const {
        retestId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          retestId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid retestId",
        });
      }

      const retest =
        await AdaptiveRetest.findById(
          retestId
        );

      if (!retest) {
        return res.status(404).json({
          message:
            "Adaptive re-test not found",
        });
      }

      if (
        !retest.retestAttemptId
      ) {
        return res.status(400).json({
          message:
            "Re-test has not been completed yet",
        });
      }

      const before =
        await Performance.findOne({
          attemptId:
            retest.sourceAttemptId,
        });

      const after =
        await Performance.findOne({
          attemptId:
            retest.retestAttemptId,
        });

      if (!before) {
        return res.status(404).json({
          message:
            "Original performance analysis not found",
        });
      }

      if (!after) {
        return res.status(404).json({
          message:
            "Re-test performance analysis not found",
        });
      }

      const improvement = analyzeImprovement(
        before,
        after,
        retest.strategy
      );

      await AdaptiveRetest.findByIdAndUpdate(
        retestId,
        {
          improvement,
        }
      );

      return res.status(200).json({
        message:
          "Improvement analyzed successfully",

        retestId,

        improvement,
      });
    } catch (error) {
      console.error(
        "Improvement Analysis Error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to analyze improvement",

        error:
          error.message,
      });
    }
  };


module.exports = {
  createAdaptiveRetest,
  analyzeRetestImprovement,
};