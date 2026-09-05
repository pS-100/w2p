const ai = require("../config/gemini");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateQuestionsWithAI = async (prompt, questionJsonSchema) => {
  // Primary model + fallback model
  const models = [
    "gemini-3.6-flash",
    "gemini-2.5-flash"
  ];

  try {
    for (const model of models) {
      console.log(`Trying Gemini model: ${model}`);

      // Retry up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: model,

            contents: prompt,

            config: {
              responseMimeType: "application/json",
              responseSchema: questionJsonSchema
            }
          });

          if (!response.text) {
            throw new Error("Gemini returned an empty response");
          }

          const questions = JSON.parse(response.text);

          console.log(
            `Questions generated successfully using ${model}`
          );

          return questions;

        } catch (error) {
          console.error(
            `${model} - Attempt ${attempt} failed:`,
            error.message
          );

          // Only retry temporary server errors
          if (
            error.message.includes("503") ||
            error.message.includes("UNAVAILABLE")
          ) {
            if (attempt < 3) {
              const delay = attempt * 3000;

              console.log(
                `Gemini temporarily unavailable. Retrying in ${
                  delay / 1000
                } seconds...`
              );

              await sleep(delay);
            }
          } else {
            // For errors other than 503, don't keep retrying
            throw error;
          }
        }
      }

      console.log(`Switching to fallback model...`);
    }

    throw new Error(
      "Gemini models are temporarily unavailable. Please try again later."
    );

  } catch (error) {
    console.error("Gemini API error:", error.message);

    throw new Error("Failed to generate questions using Gemini");
  }
};

module.exports = generateQuestionsWithAI;