const Joi = require("joi");

const submitAttemptSchema = Joi.object({

  assessmentId: Joi.string()
    .trim()
    .required(),

  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string()
          .required(),

        selectedAnswer: Joi.string()
          .allow("")
          .required(),

        responseTime: Joi.number()
          .min(0)
          .required(),
      })
    )
    .min(1)
    .required(),

  attemptType: Joi.string()
    .valid(
      "standard",
      "adaptive-retest"
    )
    .default("standard"),

  parentAttemptId: Joi.string()
    .allow(null)
    .optional(),

  retestId: Joi.when("attemptType", {
    is: "adaptive-retest",
    then: Joi.string().trim().required(),
    otherwise: Joi.allow(null, ""),
  }),

});

module.exports = {
  submitAttemptSchema,
};