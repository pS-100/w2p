const express = require("express");
const app = express();

const {
  generateQuestionSet
} = require("../controllers/questionController");

const router = express.Router();

router.post(
  "/generate",
  generateQuestionSet
);

module.exports = router;