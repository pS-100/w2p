// const express = require("express");
// const app = express();

// const {
//   generateQuestionSet
// } = require("../controllers/questionController");

// const router = express.Router();

// router.post(
//   "/generate",
//   generateQuestionSet
// );

// module.exports = router;

const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  generateQuestionSet
} = require("../controllers/questionController");


const router = express.Router();


const questionGenerationLimiter =
  rateLimit({

    windowMs: 60 * 1000,

    max: 5,

    message: {
      success: false,
      message:
        "Too many question generation requests. Please try again later."
    }

  });


router.post(
  "/generate",
  questionGenerationLimiter,
  generateQuestionSet
);


module.exports = router;