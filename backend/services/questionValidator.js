const z = require("zod");

const questionJsonSchema = {
  type: "object",

  properties: {
    questions: {
      type: "array",

      items: {
        type: "object",

        properties: {
          concept: {
            type: "string",
            description:
              "The specific knowledge component being assessed"
          },

          question: {
            type: "string",
            description:
              "The multiple-choice question"
          },

          options: {
            type: "array",
            items: {
              type: "string"
            },
            description:
              "Exactly four answer options"
          },

          correctAnswer: {
            type: "string",
            description:
              "The correct answer and it must exactly match one option"
          },

          explanation: {
            type: "string",
            description:
              "Short explanation of why the answer is correct"
          },

          bloomLevel: {
            type: "string",
            enum: [
              "remember",
              "understand",
              "apply",
              "analyze",
              "evaluate"
            ],
            description:
              "Bloom's taxonomy level of the question"
          }
        },

        required: [
          "concept",
          "question",
          "options",
          "correctAnswer",
          "explanation",
          "bloomLevel"
        ]
      }
    }
  },

  required: ["questions"]
};


const questionZodSchema = z.object({
  questions: z.array(
    z.object({
      concept: z
        .string()
        .trim()
        .min(1),

      question: z
        .string()
        .trim()
        .min(1),

      options: z
        .array(
          z
            .string()
            .trim()
            .min(1)
        )
        .length(4),

      correctAnswer: z
        .string()
        .trim()
        .min(1),

      explanation: z
        .string()
        .trim()
        .min(1),

      bloomLevel: z.enum([
        "remember",
        "understand",
        "apply",
        "analyze",
        "evaluate"
      ])
    })
  )
});


const validateQuestions = (data) => {
  return questionZodSchema.parse(data);
};

const validateConceptDistribution = (
  questions,
  conceptPlan
) => {
  const counts = new Map();

  questions.forEach((question) => {
    const concept = question.concept;

    counts.set(
      concept,
      (counts.get(concept) || 0) + 1
    );
  });

  for (const planned of conceptPlan) {
    const actual =
      counts.get(planned.concept) || 0;

    if (actual !== planned.questionCount) {
      throw new Error(
        `Concept "${planned.concept}" expected ${planned.questionCount} questions but received ${actual}.`
      );
    }
  }

  return true;
};


module.exports = {
  questionJsonSchema,
  validateQuestions,
  validateConceptDistribution,
};