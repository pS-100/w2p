const ai = require("../config/gemini");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


const generateQuestionsWithAI = async (
  prompt,
  questionJsonSchema
) => {

  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ];


  for (const model of models) {

    console.log(`Trying Gemini model: ${model}`);

    for (let attempt = 1; attempt <= 3; attempt++) {

      try {

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,

            config: {
              responseMimeType: "application/json",

              // Enable this after confirming your
              // current Gemini SDK/config supports it.
              // responseSchema: questionJsonSchema,
            },
          });


        if (!response.text) {
          throw new Error(
            "Gemini returned an empty response"
          );
        }


        const result =
          JSON.parse(response.text);


        console.log(
          `Questions generated successfully using ${model}`
        );


        return result;


      } catch (error) {

        const message =
          error.message || "";


        console.error(
          `${model} - Attempt ${attempt} failed:`,
          message
        );


        // ==========================================
        // 403 - PERMISSION PROBLEM
        // ==========================================

        if (
          message.includes("403") ||
          message.includes("PERMISSION_DENIED")
        ) {

          console.error(
            `${model} permission denied.`
          );

          // Try next model instead of
          // killing the complete fallback chain.
          break;
        }


        // ==========================================
        // 429 - QUOTA / RATE LIMIT
        // ==========================================

        if (
          message.includes("429") ||
          message.includes("RESOURCE_EXHAUSTED")
        ) {

          console.error(
            `${model} quota/rate limit reached.`
          );

          // Do not retry 3 times if the provider
          // has already told us the quota is exhausted.
          break;
        }


        // ==========================================
        // 503 - TEMPORARY SERVER PROBLEM
        // ==========================================

        if (
          message.includes("503") ||
          message.includes("UNAVAILABLE")
        ) {

          if (attempt < 3) {

            const delay =
              attempt * 3000;

            console.log(
              `Retrying ${model} in ${
                delay / 1000
              } seconds...`
            );

            await sleep(delay);

            continue;
          }

          // All retries failed.
          // Move to next model.
          break;
        }


        // ==========================================
        // JSON / OTHER TEMPORARY ERRORS
        // ==========================================

        if (
          message.includes("JSON") ||
          message.includes("empty response")
        ) {

          if (attempt < 3) {

            const delay =
              attempt * 1000;

            console.log(
              `Retrying ${model} in ${
                delay / 1000
              } seconds...`
            );

            await sleep(delay);

            continue;
          }

          break;
        }


        // ==========================================
        // UNKNOWN ERROR
        // ==========================================

        console.error(
          `${model} encountered an unexpected error.`
        );

        break;
      }
    }


    console.log(
      `Switching from ${model} to fallback Gemini model...`
    );
  }


  throw new Error(
    "All Gemini models are currently unavailable."
  );
};


module.exports = generateQuestionsWithAI;