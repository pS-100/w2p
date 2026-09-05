function buildQuestionPrompt(data) {
  const {
    subject,
    topic,
    subtopic,
    difficulty,
    questionCount
  } = data;

  return `
You are an expert educational question generator.

Generate ${questionCount} multiple-choice questions.

Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}
Difficulty: ${difficulty}

Rules:
1. Questions must be relevant to the given topic and subtopic.
2. Follow the requested difficulty level.
3. Each question must have exactly 4 options.
4. Only one option must be correct.
5. Provide the correct answer.
6. Provide a short explanation.
7. Avoid duplicate questions.
8. Questions should be educationally meaningful.
9. Return only the requested JSON structure.

Bloom's Taxonomy:
- Easy: Remember / Understand
- Medium: Apply / Analyze
- Hard: Analyze / Evaluate

Return:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "...",
      "bloomLevel": "..."
    }
  ]
}
`;

}

module.exports = buildQuestionPrompt;