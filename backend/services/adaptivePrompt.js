const buildAdaptivePrompt = (strategy) => {
  const {
    subject,
    targetConcept,
    targetTopic,
    targetSubtopic,
    gapScore,
    currentAccuracy,
    selectedDifficulty,
    focusAreas,
    questionMix,
    questionCount,
  } = strategy;

  return `
You are an adaptive assessment question generator.

Generate exactly ${questionCount} multiple-choice questions
for a student's adaptive re-test.

TARGET LEARNING AREA

Subject: ${subject}
Topic: ${targetTopic}
Subtopic: ${targetSubtopic}
Concept: ${targetConcept || "Concept reinforcement"}

STUDENT PERFORMANCE

Learning Gap Score: ${gapScore}
Current Accuracy: ${currentAccuracy}%

ADAPTIVE STRATEGY

Primary Difficulty: ${selectedDifficulty}

Focus Areas:
${focusAreas.map((item) => `- ${item}`).join("\n")}

QUESTION DIFFICULTY MIX

Easy: ${questionMix.easy}
Medium: ${questionMix.medium}
Hard: ${questionMix.hard}

IMPORTANT RULES

1. Every question MUST directly test the target concept:
   "${targetConcept || "the specified learning area"}"

2. Every question MUST remain within:
   Topic: "${targetTopic}"
   Subtopic: "${targetSubtopic}"

3. Do not generate questions from unrelated concepts.

4. Questions should test understanding, application,
   reasoning, or problem solving where appropriate.

5. Avoid repeating the same question pattern.

6. Each question must have exactly 4 options.

7. Only one option must be correct.

8. correctAnswer must exactly match one of the options.

9. Include a concise explanation.

10. Assign a valid Bloom's taxonomy level.

11. Respect the requested difficulty distribution.

12. Every question MUST contain ALL of these fields:

    subject
    topic
    subtopic
    concept
    difficulty
    bloomLevel
    question
    options
    correctAnswer
    explanation

13. The subject field MUST be exactly:
    "${subject}"

14. The topic field MUST be exactly:
    "${targetTopic}"

15. The subtopic field MUST be exactly:
    "${targetSubtopic}"

16. The concept field MUST be exactly:
    "${targetConcept || "Concept reinforcement"}"

17. difficulty MUST be one of:
    easy
    medium
    hard

18. bloomLevel MUST be one of:
    remember
    understand
    apply
    analyze
    evaluate
    create

19. Return ONLY valid JSON.

20. Do NOT add markdown code fences.

RETURN FORMAT:

{
  "questions": [
    {
      "subject": "${subject}",
      "topic": "${targetTopic}",
      "subtopic": "${targetSubtopic}",
      "concept": "${targetConcept || "Concept reinforcement"}",
      "difficulty": "easy",
      "bloomLevel": "understand",
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Option A",
      "explanation": "Explanation"
    }
  ]
}
`;
};

module.exports = {
  buildAdaptivePrompt,
};