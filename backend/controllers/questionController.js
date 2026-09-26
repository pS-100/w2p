const Question = require("../models/Question");
const User = require("../models/User");

const questionInputSchema =
  require("../validators/questionInputValidator");

const buildQuestionPrompt =
  require("../services/promptBuilder");

const generateQuestions =
  require("../services/aiService");

const {
  discoverConcepts,
} = require("../services/conceptDiscovery");

const {
  planConceptQuestions,
} = require("../services/conceptPlanner");

const {
  questionJsonSchema,
  validateQuestions,
  validateConceptDistribution,
} = require("../services/questionValidator");

const {
  removeDuplicates,
  checkDatabaseDuplicates,
} = require("../services/duplicateDetector");


const {
  createOrUpdateCoverage,
  markConceptsGenerated,
} = require("../services/topicCoverageService");


const TopicCoverage =
  require("../models/TopicCoverage");

const Attempt = require("../models/Attempt");


async function generateQuestionSet(req, res) {
  try {
    console.log("1. Controller reached");
    console.log("2. Request body:", req.body);


    // =========================================================
    // 1. Validate user input
    // =========================================================

    const { error, value } =
      questionInputSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }


    // =========================================================
    // 2. Get authenticated user's educational level
    // =========================================================

    const user =
      await User.findById(req.userId)
        .select("educationLevel");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log(
      "3. User education level:",
      user.educationLevel
    );


    // =========================================================
    // 3. Discover concepts for the selected scope
    // =========================================================

    const concepts =
      await discoverConcepts({
        subject: value.subject,
        topic: value.topic,
        subtopic: value.subtopic,
        educationalLevel:
          user.educationLevel,
      });

    console.log(
      "Discovered concepts:",
      concepts
    );


    


    // =========================================================
    // 4. Plan question distribution
    // =========================================================

    const conceptPlan =
      planConceptQuestions({
        concepts,
        requestedQuestionCount:
          value.questionCount,
      });

    console.log(
      "Concept plan:",
      conceptPlan
    );


    // =========================================================
    // 5. Build AI prompt
    // =========================================================

    const prompt =
      buildQuestionPrompt({
        ...value,

        // Educational level comes from MongoDB,
        // NOT from the frontend request.
        educationalLevel:
          user.educationLevel,

        // Backend-controlled concept plan.
        conceptPlan:
          conceptPlan.selectedConcepts,
      });

    console.log(
      "4. Prompt created successfully"
    );


    // =========================================================
    // 6. Generate questions using AI service
    // =========================================================

    const result =
      await generateQuestions(
        prompt,
        questionJsonSchema
      );

    console.log(
      "5. AI returned questions"
    );


    // =========================================================
    // 7. Basic response validation
    // =========================================================

    if (
      !result ||
      !Array.isArray(result.questions)
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Invalid question format returned by AI.",
      });
    }

    if (result.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message:
          "AI returned no questions.",
      });
    }


    // =========================================================
    // 8. Validate complete AI response using Zod
    // =========================================================

    let validatedQuestions;

    try {
      validatedQuestions =
        validateQuestions(result);

    } catch (validationError) {
      console.error(
        "AI question validation failed:",
        validationError.errors ||
        validationError
      );

      return res.status(422).json({
        success: false,
        message:
          "Generated questions failed validation. Please try again.",
      });
    }


    // =========================================================
    // 9. Validate concept distribution
    // =========================================================

    try {
      validateConceptDistribution(
        validatedQuestions.questions,
        conceptPlan.selectedConcepts
      );

    } catch (distributionError) {
      console.error(
        "Concept distribution validation failed:",
        distributionError
      );

      return res.status(422).json({
        success: false,
        message:
          "Generated questions did not follow the required concept distribution. Please generate the assessment again.",
      });
    }


    // =========================================================
    // 10. Add trusted assessment metadata
    // =========================================================

    let questions =
      validatedQuestions.questions.map(
        (q) => ({
          ...q,

          // These values come from the
          // validated assessment request.
          subject: value.subject,
          topic: value.topic,
          subtopic: value.subtopic,

          // Difficulty comes from the
          // assessment request.
          difficulty: value.difficulty,

          // Standard assessment.
          generationType: "standard",

          // No parent attempt for
          // first assessment.
          parentAttemptId: null,
        })
      );


    // =========================================================
    // 11. Remove duplicates inside generated batch
    // =========================================================

    const beforeBatchDuplicateCheck =
      questions.length;

    questions =
      removeDuplicates(questions);

    console.log(
      `6. Removed ${beforeBatchDuplicateCheck -
      questions.length
      } duplicate questions from generated batch`
    );


    if (questions.length === 0) {
      return res.status(422).json({
        success: false,
        message:
          "All generated questions were duplicates. Please generate the assessment again.",
      });
    }


    // =========================================================
    // 12. Check duplicates against MongoDB
    // =========================================================

    const beforeDatabaseDuplicateCheck =
      questions.length;

    questions =
      await checkDatabaseDuplicates(
        questions
      );

    console.log(
      `7. Removed ${beforeDatabaseDuplicateCheck -
      questions.length
      } questions already present in database`
    );


    if (questions.length === 0) {
      return res.status(422).json({
        success: false,
        message:
          "All generated questions already exist. Please generate the assessment again.",
      });
    }


    // =========================================================
    // 13. Check we still have enough questions
    // =========================================================

    if (
      questions.length <
      value.questionCount
    ) {
      return res.status(422).json({
        success: false,
        message:
          `Only ${questions.length} unique questions were available after validation and duplicate checking. Please generate the assessment again.`,
      });
    }


    // =========================================================
    // 14. Save questions
    // =========================================================

    const finalQuestions =
      questions.slice(
        0,
        value.questionCount
      );

    const savedQuestions =
      await Question.insertMany(
        finalQuestions
      );

      console.log(
      `8. ${savedQuestions.length} questions saved to MongoDB`
    );

      const coverage =
      await createOrUpdateCoverage({
        userId: req.userId,
        subject: value.subject,
        topic: value.topic,
        subtopic: value.subtopic,
        concepts,
      });

    

    await markConceptsGenerated({
      coverageId: coverage._id,
      conceptPlan:
        conceptPlan.selectedConcepts,
    });



    // =========================================================
    // 15. Send response
    // =========================================================

    return res.status(201).json({
      success: true,

      message:
        "Questions generated successfully",

      questions: savedQuestions,

      assessmentPlan: {
        coverageId:
          coverage._id,

        requestedQuestionCount:
          conceptPlan.requestedQuestionCount,

        totalQuestions:
          conceptPlan.totalQuestions,

        concepts:
          conceptPlan.selectedConcepts,

        remainingConcepts:
          conceptPlan.remainingConcepts,
      },
    });

  } catch (error) {

    console.error(
      "Question generation failed:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Question generation failed",
    });
  }
}


async function continueTopicAssessment(
  req,
  res
) {
  try {
    const {
      coverageId,
      questionCount = 10,
      difficulty = "medium",
    } = req.body;


    if (!coverageId) {
      return res.status(400).json({
        success: false,
        message:
          "coverageId is required.",
      });
    }


    const coverage =
      await TopicCoverage.findOne({
        _id: coverageId,
        userId: req.userId,
      });


    if (!coverage) {
      return res.status(404).json({
        success: false,
        message:
          "Topic coverage not found.",
      });
    }


   const QUESTIONS_PER_CONCEPT = 2;
const MAX_CONCEPTS_PER_CONTINUE = 10;

const remainingConcepts =
  coverage.concepts.filter(
    (item) => !item.assessed
  );

if (remainingConcepts.length === 0) {
  return res.status(400).json({
    success: false,
    message:
      "All discovered concepts have already been assessed.",
  });
}

/*
 * Continue Topic is coverage-driven.
 *
 * Every selected concept receives exactly
 * 2 questions.
 *
 * Maximum 10 concepts per Continue assessment.
 * Therefore maximum 20 questions per Continue.
 */

const conceptsToAssess =
  remainingConcepts.slice(
    0,
    MAX_CONCEPTS_PER_CONTINUE
  );

const conceptPlan =
  conceptsToAssess.map((item) => ({
    concept: item.concept,
    questionCount: QUESTIONS_PER_CONCEPT,
  }));

const requiredQuestions =
  conceptPlan.reduce(
    (total, item) =>
      total + item.questionCount,
    0
  );

console.log(
  "Continue Topic - remaining concepts:",
  remainingConcepts.length
);

console.log(
  "Continue Topic - concepts selected:",
  conceptsToAssess.length
);

console.log(
  "Continue Topic - required questions:",
  requiredQuestions
);


    const user =
      await User.findById(
        req.userId
      ).select(
        "educationLevel"
      );


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    const prompt =
      buildQuestionPrompt({
        subject:
          coverage.subject,

        topic:
          coverage.topic,

        subtopic:
          coverage.subtopic,

        difficulty,

        questionCount:
          requiredQuestions,

        educationalLevel:
          user.educationLevel,

        conceptPlan,
      });


    const result =
      await generateQuestions(
        prompt,
        questionJsonSchema
      );


    let validatedQuestions;

    try {
      validatedQuestions =
        validateQuestions(result);

    } catch (error) {
      console.error(
        "Continue Topic validation failed:",
        error
      );

      return res.status(422).json({
        success: false,
        message:
          "Generated questions failed validation.",
      });
    }


    try {
      validateConceptDistribution(
        validatedQuestions.questions,
        conceptPlan
      );

    } catch (error) {
      console.error(
        "Continue Topic distribution failed:",
        error
      );

      return res.status(422).json({
        success: false,
        message:
          "Generated questions did not follow the concept plan.",
      });
    }


    let questions =
      validatedQuestions.questions.map(
        (q) => ({
          ...q,

          subject:
            coverage.subject,

          topic:
            coverage.topic,

          subtopic:
            coverage.subtopic,

          difficulty,

          generationType:
            "standard",

          parentAttemptId:
            null,
        })
      );


    questions =
      removeDuplicates(
        questions
      );


    questions =
      await checkDatabaseDuplicates(
        questions
      );


    if (
      questions.length <
      requiredQuestions
    ) {
      return res.status(422).json({
        success: false,
        message:
          `Only ${questions.length} unique questions were available. Please try again.`,
      });
    }


    const finalQuestions =
      questions.slice(
        0,
        requiredQuestions
      );


    const savedQuestions =
      await Question.insertMany(
        finalQuestions
      );


    await markConceptsGenerated({
      coverageId,

      conceptPlan,
    });


    const updatedCoverage =
      await TopicCoverage.findById(
        coverageId
      );


    return res.status(201).json({
      success: true,

      message:
        "Remaining topic concepts generated successfully.",

      questions:
        savedQuestions,

      assessmentPlan: {
        coverageId,

        questionCount:
          savedQuestions.length,

        concepts:
          conceptPlan,

        remainingConcepts:
          updatedCoverage.concepts
            .filter(
              (item) =>
                !item.assessed
            )
            .map(
              (item) =>
                item.concept
            ),
      },
    });

  } catch (error) {
    console.error(
      "Continue Topic failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Continue Topic assessment failed.",
    });
  }
}


async function generateMoreQuestions(req, res) {
  try {
    const { sourceAttemptId } = req.body;

    if (!sourceAttemptId) {
      return res.status(400).json({
        success: false,
        message: "sourceAttemptId is required.",
      });
    }

    // --------------------------------------------------
    // 1. Find source attempt
    // --------------------------------------------------

    const sourceAttempt = await Attempt.findOne({
      _id: sourceAttemptId,
      userId: req.userId,
    });

    if (!sourceAttempt) {
      return res.status(404).json({
        success: false,
        message: "Source attempt not found.",
      });
    }

    // --------------------------------------------------
    // 2. Get questions from source attempt
    // --------------------------------------------------

    const questionIds = sourceAttempt.answers.map(
      (answer) => answer.questionId
    );

    if (questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "The source attempt does not contain any questions.",
      });
    }

    const sourceQuestions = await Question.find({
      _id: {
        $in: questionIds,
      },
    });

    if (
      sourceQuestions.length !==
      questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Some questions from the source attempt were not found.",
      });
    }

    // --------------------------------------------------
    // 3. Build concept distribution from source attempt
    // --------------------------------------------------

    const conceptMap = new Map();

    for (const question of sourceQuestions) {
      if (!question.concept) {
        return res.status(400).json({
          success: false,
          message:
            "Source assessment contains a question without a concept.",
        });
      }

      const existing =
        conceptMap.get(question.concept) || 0;

      conceptMap.set(
        question.concept,
        existing + 1
      );
    }

    const conceptPlan = Array.from(
      conceptMap.entries()
    ).map(
      ([concept, questionCount]) => ({
        concept,
        questionCount,
      })
    );

    const totalQuestions =
      conceptPlan.reduce(
        (total, item) =>
          total + item.questionCount,
        0
      );

    // --------------------------------------------------
    // 4. Determine original difficulty
    // --------------------------------------------------

    const difficulties = [
      ...new Set(
        sourceQuestions.map(
          (question) => question.difficulty
        )
      ),
    ];

    if (difficulties.length !== 1) {
      return res.status(400).json({
        success: false,
        message:
          "Generate More currently requires all questions in the source assessment to use the same difficulty.",
      });
    }

    const difficulty = difficulties[0];

    // --------------------------------------------------
    // 5. Get user's education level
    // --------------------------------------------------

    const user = await User.findById(
      req.userId
    ).select("educationLevel");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log(
      "Generate More - source attempt:",
      sourceAttemptId
    );

    console.log(
      "Generate More - concepts:",
      conceptPlan
    );

    console.log(
      "Generate More - difficulty:",
      difficulty
    );

    console.log(
      "Generate More - total questions:",
      totalQuestions
    );

    // --------------------------------------------------
    // 6. Build prompt
    // --------------------------------------------------

    const prompt = buildQuestionPrompt({
      subject: sourceQuestions[0].subject,
      topic: sourceQuestions[0].topic,
      subtopic: sourceQuestions[0].subtopic,
      difficulty,
      questionCount: totalQuestions,
      educationalLevel:
        user.educationLevel,
      conceptPlan,
    });

    // --------------------------------------------------
    // 7. Generate questions
    // --------------------------------------------------

    const result =
      await generateQuestions(
        prompt,
        questionJsonSchema
      );

    if (
      !result ||
      !Array.isArray(result.questions)
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Invalid question format returned by AI.",
      });
    }

    if (result.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message:
          "AI returned no questions.",
      });
    }

    // --------------------------------------------------
    // 8. Validate AI output
    // --------------------------------------------------

    let validatedQuestions;

    try {
      validatedQuestions =
        validateQuestions(result);
    } catch (validationError) {
      console.error(
        "Generate More validation failed:",
        validationError.errors ||
          validationError
      );

      return res.status(422).json({
        success: false,
        message:
          "Generated questions failed validation. Please try again.",
      });
    }

    // --------------------------------------------------
    // 9. Validate concept distribution
    // --------------------------------------------------

    try {
      validateConceptDistribution(
        validatedQuestions.questions,
        conceptPlan
      );
    } catch (distributionError) {
      console.error(
        "Generate More distribution failed:",
        distributionError
      );

      return res.status(422).json({
        success: false,
        message:
          "Generated questions did not follow the source assessment concept distribution.",
      });
    }

    // --------------------------------------------------
    // 10. Add assessment metadata
    // --------------------------------------------------

    let questions =
      validatedQuestions.questions.map(
        (question) => ({
          ...question,

          subject:
            sourceQuestions[0].subject,

          topic:
            sourceQuestions[0].topic,

          subtopic:
            sourceQuestions[0].subtopic,

          difficulty,

          generationType: "standard",

          parentAttemptId: null,
        })
      );

    // --------------------------------------------------
    // 11. Remove duplicates inside new batch
    // --------------------------------------------------

    const beforeBatchDuplicateCheck =
      questions.length;

    questions =
      removeDuplicates(questions);

    console.log(
      `Generate More - removed ${
        beforeBatchDuplicateCheck -
        questions.length
      } batch duplicates`
    );

    // --------------------------------------------------
    // 12. Remove questions already in database
    // --------------------------------------------------

    const beforeDatabaseDuplicateCheck =
      questions.length;

    questions =
      await checkDatabaseDuplicates(
        questions
      );

    console.log(
      `Generate More - removed ${
        beforeDatabaseDuplicateCheck -
        questions.length
      } database duplicates`
    );

    // --------------------------------------------------
    // 13. Ensure enough NEW questions exist
    // --------------------------------------------------

    if (
      questions.length <
      totalQuestions
    ) {
      return res.status(422).json({
        success: false,
        message:
          `Only ${questions.length} new unique questions were available out of ${totalQuestions} required. Please generate again.`,
      });
    }

    // --------------------------------------------------
    // 14. Save new questions
    // --------------------------------------------------

    const finalQuestions =
      questions.slice(
        0,
        totalQuestions
      );

    const savedQuestions =
      await Question.insertMany(
        finalQuestions
      );

    console.log(
      `Generate More - ${savedQuestions.length} new questions saved`
    );

    // --------------------------------------------------
    // 15. Return new questions
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "More questions generated successfully.",

      sourceAttemptId,

      questions:
        savedQuestions,

      assessmentPlan: {
        questionCount:
          savedQuestions.length,

        difficulty,

        concepts:
          conceptPlan,
      },
    });
  } catch (error) {
    console.error(
      "Generate More failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate more questions.",
    });
  }
}

module.exports = {
  generateQuestionSet,
  continueTopicAssessment,
  generateMoreQuestions,
};