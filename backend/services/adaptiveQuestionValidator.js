const Joi = require("joi");

const adaptiveQuestionSchema = Joi.object({
  subject: Joi.string()
    .trim()
    .required(),

  topic: Joi.string()
    .trim()
    .required(),

  subtopic: Joi.string()
    .trim()
    .required(),

  concept: Joi.string()
    .trim()
    .required(),

  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .required(),

  bloomLevel: Joi.string()
    .valid(
      "remember",
      "understand",
      "apply",
      "analyze",
      "evaluate",
      "create"
    )
    .required(),

  question: Joi.string()
    .trim()
    .required(),

  options: Joi.array()
    .items(
      Joi.string()
        .trim()
        .required()
    )
    .length(4)
    .required(),

  correctAnswer: Joi.string()
    .trim()
    .required(),

  explanation: Joi.string()
    .trim()
    .required(),
});

const validateAdaptiveQuestions = (
  questions
) => {
  if (!Array.isArray(questions)) {
    throw new Error(
      "Adaptive questions must be an array"
    );
  }

  return questions.map(
    (question, index) => {
      const { error, value } =
        adaptiveQuestionSchema.validate(
          question,
          {
            abortEarly: false,
            stripUnknown: false,
          }
        );

      if (error) {
        throw new Error(
          `Adaptive question ${
            index + 1
          } validation failed: ${error.details
            .map(
              (detail) =>
                detail.message
            )
            .join(", ")}`
        );
      }

      return value;
    }
  );
};

module.exports = {
  validateAdaptiveQuestions,
};