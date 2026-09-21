// const Joi = require("joi");

// const submitAttemptSchema = Joi.object({
// //   userId: Joi.string().required(),

// //   testId: Joi.string().required(),

//   answers: Joi.array()
//     .items(
//       Joi.object({
//         questionId: Joi.string().required(),

//         selectedAnswer: Joi.string().required(),

//         responseTime: Joi.number().min(0).default(0),
//       })
//     )
//     .min(1)
//     .required(),
// });

// module.exports = {
//   submitAttemptSchema,
// };


const Joi = require("joi");

const submitAttemptSchema = Joi.object({
  userId: Joi.string().optional(),

  answers: Joi.array()
    .items(
      Joi.object({
        questionId:
          Joi.string().required(),

        selectedAnswer:
          Joi.string()
            .allow("")
            .required(),

        responseTime:
          Joi.number()
            .min(0)
            .required(),
      })
    )
    .min(1)
    .required(),
    attemptType: Joi.string()
    .valid("standard", "adaptive-retest")
    .default("standard"),

  parentAttemptId: Joi.string().optional(),
});

module.exports = {
  submitAttemptSchema,
};