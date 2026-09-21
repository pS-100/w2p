// const buildAdaptivePrompt = (
//   strategy
// ) => {
//   const {
//     targetTopic,
//     targetSubtopic,
//     gapScore,
//     currentAccuracy,
//     selectedDifficulty,
//     focusAreas,
//     questionMix,
//     questionCount,
//   } = strategy;

//   return `
// You are an adaptive assessment question generator.

// Generate ${questionCount} multiple-choice questions
// for a student's adaptive re-test.

// TARGET LEARNING AREA
// Subject: Computer Science
// Topic: ${targetTopic}
// Subtopic: ${targetSubtopic}

// STUDENT PERFORMANCE
// Learning Gap Score: ${gapScore}
// Current Accuracy: ${currentAccuracy}%

// ADAPTIVE STRATEGY
// Primary Difficulty: ${selectedDifficulty}

// Focus Areas:
// ${focusAreas
//   .map(
//     (item) => `- ${item}`
//   )
//   .join("\n")}

// QUESTION DIFFICULTY MIX
// Easy: ${questionMix.easy}
// Medium: ${questionMix.medium}
// Hard: ${questionMix.hard}

// IMPORTANT RULES

// 1. Questions must directly target:
//    ${targetTopic} → ${targetSubtopic}

// 2. Do not generate unrelated questions.

// 3. Questions should test understanding,
//    not merely memorization.

// 4. Avoid repeating the same question pattern.

// 5. Each question must have exactly 4 options.

// 6. Only one option must be correct.

// 7. correctAnswer must exactly match
//    one option.

// 8. Include a concise explanation.

// 9. Assign an appropriate Bloom's taxonomy level.

// 10. Respect the requested difficulty mix.

// 11. Return ONLY valid JSON.

// RETURN FORMAT:

// {
//   "questions": [
//     {
//       "subject": "Computer Science",
//       "topic": "${targetTopic}",
//       "subtopic": "${targetSubtopic}",
//       "difficulty": "easy",
//       "bloomLevel": "Understand",
//       "question": "Question text",
//       "options": [
//         "Option A",
//         "Option B",
//         "Option C",
//         "Option D"
//       ],
//       "correctAnswer": "Option A",
//       "explanation": "Explanation"
//     }
//   ]
// }
// `;

// };

// module.exports = {
//   buildAdaptivePrompt,
// };

const buildAdaptivePrompt = (strategy) => {
  const {
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

Generate ${questionCount} multiple-choice questions
for a student's adaptive re-test.

TARGET LEARNING AREA
Subject: Computer Science
Topic: ${targetTopic}
Subtopic: ${targetSubtopic}

STUDENT PERFORMANCE
Learning Gap Score: ${gapScore}
Current Accuracy: ${currentAccuracy}%

ADAPTIVE STRATEGY
Primary Difficulty: ${selectedDifficulty}

Focus Areas:
${focusAreas
  .map((item) => `- ${item}`)
  .join("\n")}

QUESTION DIFFICULTY MIX
Easy: ${questionMix.easy}
Medium: ${questionMix.medium}
Hard: ${questionMix.hard}

IMPORTANT RULES

1. Questions MUST directly target:
   ${targetTopic} → ${targetSubtopic}

2. Do not generate unrelated questions.

3. Questions should test understanding,
   not merely memorization.

4. Avoid repeating the same question pattern.

5. Each question must have exactly 4 options.

6. Only one option must be correct.

7. correctAnswer must exactly match one option.

8. Include a concise explanation.

9. Assign an appropriate Bloom's taxonomy level.

10. Respect the requested difficulty mix.

11. Every question MUST contain ALL of these fields:
    subject
    topic
    subtopic
    difficulty
    bloomLevel
    question
    options
    correctAnswer
    explanation

12. The topic field MUST be exactly:
    "${targetTopic}"

13. The subtopic field MUST be exactly:
    "${targetSubtopic}"

14. Return ONLY valid JSON.
15. Do NOT omit topic or subtopic.
16. Do NOT add markdown code fences.

RETURN FORMAT:

{
  "questions": [
    {
      "subject": "Computer Science",
      "topic": "${targetTopic}",
      "subtopic": "${targetSubtopic}",
      "difficulty": "easy",
      "bloomLevel": "Understand",
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