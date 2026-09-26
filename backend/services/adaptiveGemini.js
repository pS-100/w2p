const adaptiveQuestionSchema = require("./adaptiveQuestionSchema");
const ai = require("../config/gemini");
const { buildAdaptivePrompt } = require("./adaptivePrompt");
const { getFallbackQuestions } = require("./fallbackQuestionBank");

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const generateAdaptiveQuestions = async (strategy) => {
  const prompt = buildAdaptivePrompt(strategy);

  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ];

  let lastGeminiError = null;

  /*
    --------------------------------------------------
    Try Gemini models one by one
    --------------------------------------------------
  */

  for (const model of models) {
    console.log(
      `Trying Gemini adaptive model: ${model}`
    );

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `${model} - Attempt ${attempt}`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,

            config: {
              responseMimeType:
                "application/json",

              responseSchema:
                adaptiveQuestionSchema,
            },
          });

        let text = response.text;

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        text = text
          .replace(
            /^```json\s*/i,
            ""
          )
          .replace(
            /^```\s*/i,
            ""
          )
          .replace(
            /\s*```$/i,
            ""
          )
          .trim();

        let parsed;

        try {
          parsed = JSON.parse(text);
        } catch (jsonError) {
          throw new Error(
            `Invalid JSON returned by Gemini: ${jsonError.message}`
          );
        }

        if (
          !parsed.questions ||
          !Array.isArray(
            parsed.questions
          )
        ) {
          throw new Error(
            "Gemini returned an invalid question format."
          );
        }

        if (
          parsed.questions.length === 0
        ) {
          throw new Error(
            "Gemini returned zero questions."
          );
        }

        /*
          Basic required-field validation
          before returning the result.
        */

        for (
          const question
          of parsed.questions
        ) {
          if (
            !question.subject ||
            !question.topic ||
            !question.subtopic ||
            !question.concept ||
            !question.difficulty ||
            !question.bloomLevel ||
            !question.question ||
            !Array.isArray(
              question.options
            ) ||
            question.options.length !== 4 ||
            !question.correctAnswer ||
            !question.explanation
          ) {
            throw new Error(
              "Gemini generated a question with missing or invalid required fields."
            );
          }
        }

        console.log(
          `${model} adaptive generation successful.`
        );

        return {
          questions:
            parsed.questions,

          source: "gemini",

          model,
        };
      } catch (error) {
        lastGeminiError =
          error;

        console.error(
          `${model} - Attempt ${attempt} failed:`,
          error.message
        );

        /*
          Small delay before retrying
          the same model.
        */

        if (attempt < 3) {
          await sleep(1000);
        }
      }
    }

    console.log(
      `${model} failed after all attempts. Trying next Gemini model...`
    );
  }

  /*
    --------------------------------------------------
    All Gemini models failed
    --------------------------------------------------
  */

  console.log(
    "All Gemini adaptive models failed."
  );

  console.log(
    "Switching to local adaptive fallback..."
  );

  const fallbackQuestions =
    getFallbackQuestions({
      targetTopic:
        strategy.targetTopic,

      targetSubtopic:
        strategy.targetSubtopic,

      questionCount:
        strategy.questionCount,
    });

  if (
    !Array.isArray(
      fallbackQuestions
    ) ||
    fallbackQuestions.length === 0
  ) {
    throw new Error(
      `Gemini adaptive generation failed and no fallback questions are available for ${strategy.targetTopic} → ${strategy.targetSubtopic}`
    );
  }

  console.log(
    `Using ${fallbackQuestions.length} local fallback questions.`
  );

  return {
    questions:
      fallbackQuestions,

    source: "fallback",

    model: null,

    geminiError:
      lastGeminiError?.message || null,
  };
};

module.exports = {
  generateAdaptiveQuestions,
};