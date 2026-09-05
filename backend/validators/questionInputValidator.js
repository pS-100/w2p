const Joi = require("joi");

const questionInputSchema = Joi.object({
  subject: Joi.string().trim().required(),

  topic: Joi.string().trim().required(),

  subtopic: Joi.string().trim().required(),

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
    .min(1)
    .max(20)
    .required()
});

module.exports = questionInputSchema;