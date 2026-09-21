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
  validateQuestions,
} = require("../services/questionValidator");

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

    if (
      !performance.weakAreas ||
      performance.weakAreas.length === 0
    ) {
      return res.status(200).json({
        message:
          "No significant weak area found. Adaptive re-test is not required.",

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

    let generatedQuestions =
      await generateAdaptiveQuestions(
        strategy
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


    /*
    -----------------------------------------------
    7. Validate Generated Questions
    -----------------------------------------------
    
    validateQuestions expects:

    {
      questions: [...]
    }
    */

    const validation = validateQuestions({
      questions: generatedQuestions,
    });

    generatedQuestions =
      validation.questions;


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

    const invalidAdaptiveQuestions =
      generatedQuestions.filter(
        (question) =>
          question.topic  !==
            strategy.targetTopic
              .trim()
              .toLowerCase() ||
          question.subtopic
             .trim()
            .toLowerCase() !==
            strategy.targetSubtopic
                .trim()
              .toLowerCase()
      );
      

    if (
      invalidAdaptiveQuestions.length > 0
    ) {
      return res.status(400).json({
        message:
          "Gemini generated questions outside the target weak area.",
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

    const adaptiveRetest =
      await AdaptiveRetest.create({
        sourceAttemptId:
          attempt._id,

        performanceId:
          performance._id,

        userId:
          attempt.userId,

        targetTopic:
          strategy.targetTopic,

        targetSubtopic:
          strategy.targetSubtopic,

        gapScore:
          strategy.gapScore,

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

      const improvement =
        analyzeImprovement(
          before,
          after
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