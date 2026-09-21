const express = require(
  "express"
);

const router =
  express.Router();

const {
  createAdaptiveRetest,
  analyzeRetestImprovement,
} = require(
  "../controllers/adaptiveRetestController"
);

// router.post(
//   "/generate/:attemptId",
//   createAdaptiveRetest
// );

const protect = require("../middleware/authMiddleware");

router.post(
  "/generate/:attemptId",
  protect,
  createAdaptiveRetest
);

router.get(
  "/improvement/:retestId",
  analyzeRetestImprovement
);

module.exports = router;