// const ai  = require(
//   "../config/gemini"
// );

// const {
//   buildAdaptivePrompt,
// } = require(
//   "./adaptivePrompt"
// );

// const generateAdaptiveQuestions =
//   async (strategy) => {
//     const prompt =
//       buildAdaptivePrompt(
//         strategy
//       );

//     const response =
//       await ai.models.generateContent(
//         {
//           model:
//             "gemini-3.6-flash",

//           contents: prompt,
//         }
//       );

//     let text =
//       response.text;

//     if (!text) {
//       throw new Error(
//         "Gemini returned empty response"
//       );
//     }

//     /*
//       Remove markdown JSON fences
//       if Gemini returns them.
//     */

//     text = text
//       .replace(
//         /^```json\s*/i,
//         ""
//       )
//       .replace(
//         /^```\s*/i,
//         ""
//       )
//       .replace(
//         /\s*```$/i,
//         ""
//       )
//       .trim();

//     let parsed;

//     try {
//       parsed =
//         JSON.parse(text);
//     } catch (error) {
//       console.error(
//         "Gemini raw response:",
//         text
//       );

//       throw new Error(
//         "Gemini returned invalid JSON"
//       );
//     }

//     if (
//       !parsed.questions ||
//       !Array.isArray(
//         parsed.questions
//       )
//     ) {
//       throw new Error(
//         "Invalid Gemini question format"
//       );
//     }

//     return parsed.questions;
//   };

// module.exports = {
//   generateAdaptiveQuestions,
// };



const adaptiveQuestionSchema = require(
  "./adaptiveQuestionSchema"
);

const ai = require("../config/gemini");

const {
  buildAdaptivePrompt,
} = require("./adaptivePrompt");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateAdaptiveQuestions = async (strategy) => {
  const prompt = buildAdaptivePrompt(strategy);

  const models = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
  ];

  for (const model of models) {
    console.log(`Trying adaptive Gemini model: ${model}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,

          config: {
            responseMimeType: "application/json",
            responseSchema: adaptiveQuestionSchema,
          },
        });


        let text = response.text;

        if (!text) {
          throw new Error(
            "Gemini returned empty response"
          );
        }

        /*
          Remove markdown JSON fences
          if Gemini returns them.
        */
        text = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        let parsed;

        try {
          parsed = JSON.parse(text);
        } catch (error) {
          console.error(
            "Gemini raw response:",
            text
          );

          throw new Error(
            "Gemini returned invalid JSON"
          );
        }

        if (
          !parsed.questions ||
          !Array.isArray(parsed.questions)
        ) {
          throw new Error(
            "Invalid Gemini question format"
          );
        }

        for (const question of parsed.questions) {
          if (
            !question.topic ||
            !question.subtopic ||
            !question.question ||
            !Array.isArray(question.options) ||
            !question.correctAnswer
          ) {
            console.error(
              "Invalid adaptive question:",
              question
            );

            throw new Error(
              "Gemini generated a question with missing required fields"
            );
          }
        }

        console.log(
          `Adaptive questions generated successfully using ${model}`
        );

        return parsed.questions;

      } catch (error) {
        const message = error.message || "";

        console.error(
          `${model} - Attempt ${attempt} failed:`,
          message
        );

        // 403 - Permission problem
        if (
          message.includes("403") ||
          message.includes("PERMISSION_DENIED")
        ) {
          throw new Error(
            "Gemini project access denied. Check your API key and project permissions."
          );
        }

        // 429 - Quota/rate limit
        if (
          message.includes("429") ||
          message.includes("RESOURCE_EXHAUSTED")
        ) {
          throw new Error(
            "Gemini API quota exceeded. Please try again later."
          );
        }

        // 503 - Temporary Gemini server problem
        if (
          message.includes("503") ||
          message.includes("UNAVAILABLE")
        ) {
          if (attempt < 3) {
            const delay = attempt * 3000;

            console.log(
              `Gemini temporarily unavailable. Retrying in ${delay / 1000
              } seconds...`
            );

            await sleep(delay);
          }

          continue;
        }

        // Invalid JSON / other errors
        throw error;
      }
    }

    console.log(
      `Switching adaptive generation from ${model} to fallback model...`
    );
  }

  throw new Error(
    "All Gemini models are temporarily unavailable."
  );
};

module.exports = {
  generateAdaptiveQuestions,
};