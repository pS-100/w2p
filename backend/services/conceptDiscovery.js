const ai = require("../config/gemini");

const discoverConcepts = async ({
  subject,
  topic,
  subtopic,
  educationalLevel,
}) => {
  const prompt = `
You are an expert educational curriculum designer.

Identify the important, distinct learning concepts that a student
should understand within the requested scope.

Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}
Educational Level: ${educationalLevel}

Requirements:

1. Return only concepts directly related to the given subtopic.
2. Each concept must represent a distinct knowledge component.
3. Do not return broad topics.
4. Do not return duplicate or overlapping concepts.
5. Use concise academic names.
6. Prefer concepts that can each be assessed independently using MCQs.
7. Return between 5 and 15 concepts.
8. Do not generate questions.

Return ONLY valid JSON in this exact format:

{
  "concepts": [
    "Concept 1",
    "Concept 2",
    "Concept 3"
  ]
}
`;

  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ];

  for (const model of models) {
    console.log(
      `Trying concept discovery model: ${model}`
    );

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

        if (!response.text) {
          throw new Error(
            "Concept discovery returned an empty response."
          );
        }

        const result = JSON.parse(response.text);

        if (
          !result ||
          !Array.isArray(result.concepts)
        ) {
          throw new Error(
            "Invalid concept discovery response."
          );
        }

        const concepts = [
          ...new Set(
            result.concepts
              .filter(
                (concept) =>
                  typeof concept === "string"
              )
              .map((concept) =>
                concept.trim()
              )
              .filter(Boolean)
          ),
        ];

        if (concepts.length < 2) {
          throw new Error(
            "Not enough valid concepts discovered."
          );
        }

        console.log(
          `Concept discovery successful using ${model}`
        );

        return concepts;
      } catch (error) {
        const message =
          error.message || "";

        console.error(
          `${model} - Concept discovery attempt ${attempt} failed:`,
          message
        );

        if (
          message.includes("429") ||
          message.includes("RESOURCE_EXHAUSTED")
        ) {
          console.log(
            `${model} quota/rate limit reached.`
          );
          break;
        }

        if (
          message.includes("403") ||
          message.includes("PERMISSION_DENIED")
        ) {
          console.log(
            `${model} permission denied.`
          );
          break;
        }

        if (
          message.includes("503") ||
          message.includes("UNAVAILABLE")
        ) {
          if (attempt < 3) {
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                attempt * 3000
              )
            );

            continue;
          }

          break;
        }

        if (
          message.includes("JSON") ||
          message.includes("empty")
        ) {
          if (attempt < 3) {
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                attempt * 1000
              )
            );

            continue;
          }

          break;
        }

        break;
      }
    }
  }

  throw new Error(
    "Unable to discover concepts. All AI models are currently unavailable."
  );
};

module.exports = {
  discoverConcepts,
};