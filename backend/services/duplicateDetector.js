const Question = require("../models/Question");


const normalizeText = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};


/*
==================================================
REMOVE DUPLICATES INSIDE GENERATED BATCH
==================================================
*/

const removeDuplicates = (questions) => {
  const seen = new Set();

  return questions.filter((item) => {
    const normalizedQuestion =
      normalizeText(item.question);

    if (seen.has(normalizedQuestion)) {
      return false;
    }

    seen.add(normalizedQuestion);

    return true;
  });
};


/*
==================================================
CHECK DUPLICATES AGAINST DATABASE
==================================================
*/

const checkDatabaseDuplicates = async (questions) => {
  const result = [];

  for (const question of questions) {
    const normalizedQuestion =
      normalizeText(question.question);

    const existingQuestions =
      await Question.find({
        subject: question.subject,
        topic: question.topic,
        subtopic: question.subtopic,
        concept: question.concept,
      }).select("question");

    const duplicate =
      existingQuestions.some(
        (existing) =>
          normalizeText(existing.question) ===
          normalizedQuestion
      );

    if (!duplicate) {
      result.push(question);
    }
  }

  return result;
};


module.exports = {
  normalizeText,
  removeDuplicates,
  checkDatabaseDuplicates,
};