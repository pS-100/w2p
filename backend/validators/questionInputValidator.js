const Joi = require("joi");

const questionInputSchema = Joi.object({
  subject: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  topic: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  subtopic: Joi.string()
    .trim()
    .min(2)
    .max(100)
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
    .default("understand"),

  questionCount: Joi.number()
    .integer()
    .min(10)
    .max(20)
    .required(),
});

module.exports = questionInputSchema;