const z = require("zod");

const questionJsonSchema = {
  type: "object",

  properties: {
    questions: {
      type: "array",

      items: {
        type: "object",

        properties: {
          question: {
            type: "string",
            description: "The multiple-choice question"
          },

          options: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Exactly four answer options"
          },

          correctAnswer: {
            type: "string",
            description: "The correct answer and it must match one option"
          },

          explanation: {
            type: "string",
            description: "Short explanation of why the answer is correct"
          }
        },

        required: [
          "question",
          "options",
          "correctAnswer",
          "explanation"
        ]
      }
    }
  },

  required: ["questions"]
};

const questionZodSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),

      options: z
        .array(z.string().min(1))
        .length(4),

      correctAnswer: z.string().min(1),

      explanation: z.string().min(1)
    })
  )
});

const validateQuestions = (data) => {
  return questionZodSchema.parse(data);
};

module.exports = {
  questionJsonSchema,
  validateQuestions,
};