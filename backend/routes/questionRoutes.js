const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  generateQuestionSet,
  continueTopicAssessment,
  generateMoreQuestions,
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

const protect = require("../middleware/authMiddleware");

router.post(
  "/generate",
  questionGenerationLimiter,
  protect,
  generateQuestionSet
);

router.post(
  "/continue",
  questionGenerationLimiter,
  protect,
  continueTopicAssessment
);

router.post(
  "/more",
  questionGenerationLimiter,
  protect,
  generateMoreQuestions
);

module.exports = router;