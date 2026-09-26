function buildQuestionPrompt(data) {
  const {
    subject,
    topic,
    subtopic,
    difficulty,
    questionCount,
    educationalLevel,
    conceptPlan,
  } = data;

  const conceptInstructions =
    conceptPlan
      .map(
        (item) =>
          `- ${item.concept}: ${item.questionCount} questions`
      )
      .join("\n");

  return `
You are an expert educational assessment question generator.

Your task is to generate ${questionCount} high-quality multiple-choice
questions for a learner assessment.

==================================================
LEARNER PROFILE
==================================================

Educational Level: ${educationalLevel}

Use the educational level to calibrate:

1. Terminology
2. Expected prerequisite knowledge
3. Depth of explanation
4. Reasoning complexity
5. Examples and context
6. Appropriate academic scope

IMPORTANT:
Educational level does NOT determine the requested difficulty.

The requested difficulty (${difficulty}) must still be followed.

For example:
- A Middle School learner can receive Easy, Medium, or Hard questions.
- A High School learner can receive Easy, Medium, or Hard questions.
- An Undergraduate learner can receive Easy, Medium, or Hard questions.
- A Postgraduate learner can receive Easy, Medium, or Hard questions.
- A Doctoral learner can receive Easy, Medium, or Hard questions.

Do not make a question harder merely because the educational level
is higher.

Instead, make the content, terminology, reasoning, examples, and
expected prerequisite knowledge appropriate to the learner's
educational level.

==================================================
ASSESSMENT SCOPE
==================================================

Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}
Requested Difficulty: ${difficulty}

The generated questions must remain strictly within this assessment scope.

==================================================
BACKEND CONCEPT PLAN
==================================================

IMPORTANT:

The backend has ALREADY discovered and selected the concepts
that should be assessed.

You MUST NOT discover new concepts.

You MUST NOT invent new concepts.

You MUST generate questions only for the concepts listed below.

Concept distribution:

${conceptInstructions}

The number beside each concept is the EXACT number of questions
that must be generated for that concept.

For example:

- Linear Search: 2 questions
- Binary Search: 2 questions
- Search Complexity: 2 questions

means:

Linear Search → exactly 2 questions
Binary Search → exactly 2 questions
Search Complexity → exactly 2 questions

Do not change this distribution.

==================================================
CONCEPT RULES
==================================================

1. Every question MUST belong to exactly one concept from the
   BACKEND CONCEPT PLAN.

2. The "concept" field MUST exactly match the concept name provided
   by the backend.

3. Do NOT create new concept names.

4. Do NOT rename concepts.

5. Do NOT merge multiple concepts into one concept.

6. Do NOT use the topic or subtopic as the concept unless that exact
   concept was provided by the backend.

7. Each concept must be assessed only through the number of questions
   assigned to it by the backend.

8. Questions belonging to the same concept should test different
   aspects, situations, applications, or reasoning whenever possible.

9. The concept should represent the actual knowledge component being
   assessed.

==================================================
QUESTION GENERATION RULES
==================================================

1. Generate exactly ${questionCount} questions.

2. Every question must be directly relevant to:

   Subject = ${subject}
   Topic = ${topic}
   Subtopic = ${subtopic}

3. Every question must assess ONE specific knowledge component.

4. Every question MUST contain a "concept" field.

5. The concept MUST exactly match one of the concepts provided
   in the BACKEND CONCEPT PLAN.

6. Questions must match the requested difficulty:

   ${difficulty}

7. Each question must have exactly 4 options.

8. There must be exactly ONE correct answer.

9. The correctAnswer must exactly match one of the four options.

10. Provide a concise but educational explanation.

11. Avoid duplicate questions.

12. Avoid questions that test the same idea using only trivial wording
    changes.

13. Do not introduce information unrelated to the selected assessment
    scope.

14. Do not invent a different subject, topic, or subtopic.

15. Do not use knowledge that would normally be outside the learner's
    educational level unless it is necessary for the selected subject
    and appropriate for the requested difficulty.

16. Incorrect options should be plausible but clearly incorrect.

17. Avoid ambiguous questions.

18. Avoid questions with multiple possible correct answers.

==================================================
BLOOM'S TAXONOMY
==================================================

Use an appropriate Bloom level for the requested difficulty.

Easy:
- remember
- understand

Medium:
- understand
- apply
- analyze

Hard:
- apply
- analyze
- evaluate

Do not use "create" for multiple-choice questions.

The Bloom level should reflect the cognitive demand of the question,
not the learner's educational level.

==================================================
QUESTION DIVERSITY
==================================================

When generating multiple questions for the same concept:

- Do not simply change names or numbers in the same question.
- Test different aspects of the concept.
- Where appropriate, vary between definition, understanding,
  application, comparison, output prediction, complexity, or
  scenario-based reasoning.
- Keep all questions within the requested difficulty.

For example, two Binary Search questions should not both ask:

"What is the time complexity of Binary Search?"

Instead, where appropriate, one may test complexity and another may
test how the algorithm behaves on a particular sorted array.

==================================================
CONCEPT QUALITY
==================================================

The concept represents WHAT KNOWLEDGE is being assessed.

The concept must come directly from the backend-provided concept list.

Good:

"Linear Search"
"Binary Search"
"Search Complexity"

Bad:

"Question about arrays"
"Finding the answer"
"Searching question"
"Question 1"

Concept names must remain exactly as provided by the backend.

==================================================
FINAL VALIDATION BEFORE RESPONSE
==================================================

Before returning the response, internally verify:

1. Total number of questions = ${questionCount}.

2. Every question has exactly four options.

3. Every correctAnswer exactly matches one option.

4. Every question has a concept.

5. Every concept exactly matches a concept from the backend plan.

6. Each planned concept has exactly the requested number of questions.

7. No additional concepts were introduced.

8. No duplicate questions were generated.

==================================================
OUTPUT FORMAT
==================================================

Return exactly this structure:

{
  "questions": [
    {
      "concept": "...",
      "question": "...",
      "options": [
        "...",
        "...",
        "...",
        "..."
      ],
      "correctAnswer": "...",
      "explanation": "...",
      "bloomLevel": "..."
    }
  ]
}

Return ONLY valid JSON.

Do not include markdown.

Do not include code fences.

Do not include additional text outside the JSON object.
`;
}

module.exports = buildQuestionPrompt;