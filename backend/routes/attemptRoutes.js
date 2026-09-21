const express = require("express");

const router = express.Router();

const {
  submitAttempt,
} = require("../controllers/attemptController");

const protect = require("../middleware/authMiddleware");

router.post("/submit", protect, submitAttempt);
 
const {
  analyzeAttempt,
} = require("../controllers/performanceController");

router.get("/:attemptId", protect, analyzeAttempt);

module.exports = router;