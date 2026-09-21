const express = require("express");

const router = express.Router();

const {
  analyzeAttempt,
} = require("../controllers/performanceController");

const protect = require("../middleware/authMiddleware");

router.get(
  "/:attemptId",
  protect,
  analyzeAttempt
);

module.exports = router;