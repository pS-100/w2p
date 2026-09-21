// const Question = require("../models/Question");
// const questionInputSchema = require("../validators/questionInputValidator");
// const buildQuestionPrompt = require("../services/promptBuilder");
// const generateQuestions = require("../services/aiService");

// async function generateQuestionSet(req, res) {

//   try {

//      console.log("1. Controller reached");
//     console.log("2. Request body:", req.body);

//     // 1. Validate user input
//     const { error, value } =
//       questionInputSchema.validate(req.body)
//       // console.log();


//     if (error) {
//       return res.status(400).json({
//         message: error.details[0].message
//       });
//     }

//     // 2. Build prompt
//     const prompt = buildQuestionPrompt(value);
//     console.log("Prompt created successfully");

//     // 3. Call AI
//     //const aiResponse = await generateQuestions(prompt);

//     // 4. Parse JSON
//     let result;

//     try {
//       // result = JSON.parse(aiResponse);
//       result = await generateQuestions(prompt);
//     } catch (err) {
//       return res.status(500).json({
//         message: "AI returned invalid JSON"
//       });
//     }

//     console.log("4. Gemini returned questions");
//     console.log("5. Sending response to frontend");

//     // 5. Basic validation
//     if (
//       !result.questions ||
//       !Array.isArray(result.questions)
//     ) {
//       return res.status(500).json({
//         message: "Invalid question format"
//       });
//     }

//     // 6. Add metadata
//     const questions = result.questions.map(q => ({
//       ...q,
//       subject: value.subject,
//       topic: value.topic,
//       subtopic: value.subtopic,
//       difficulty: value.difficulty
//     }));

//     // 7. Save to MongoDB
//     const savedQuestions =
//       await Question.insertMany(questions);

//     // 8. Return
//     res.status(201).json({
//       message: "Questions generated successfully",
//       questions: savedQuestions
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Question generation failed"
//     });
//   }
// }

// module.exports = {
//   generateQuestionSet
// };



const Question = require("../models/Question");

const questionInputSchema =
  require("../validators/questionInputValidator");

const buildQuestionPrompt =
  require("../services/promptBuilder");

const generateQuestions =
  require("../services/aiService");

// const questionJsonSchema =
//   require("../schemas/questionSchema");


async function generateQuestionSet(req, res) {

  try {

    console.log("1. Controller reached");

    console.log(
      "2. Request body:",
      req.body
    );


    // 1. Validate input

    const { error, value } =
      questionInputSchema.validate(req.body);

    if (error) {

      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });

    }


    // 2. Build prompt

    const prompt =
      buildQuestionPrompt(value);

    console.log(
      "3. Prompt created successfully"
    );


    // 3. Generate questions

    const result =
      await generateQuestions(
        prompt
        // ,
        // questionJsonSchema
      );

    console.log(
      "4. Gemini returned questions"
    );


    // 4. Validate AI result

    if (
      !result ||
      !result.questions ||
      !Array.isArray(result.questions)
    ) {

      return res.status(500).json({
        success: false,
        message: "Invalid question format returned by AI"
      });

    }


    // 5. Add metadata

    const questions =
      result.questions.map((q) => ({

        ...q,

        subject: value.subject,
        topic: value.topic,
        subtopic: value.subtopic,
        difficulty: value.difficulty

      }));


    // 6. Save to MongoDB

    const savedQuestions =
      await Question.insertMany(questions);

    console.log(
      "5. Questions saved to MongoDB"
    );


    // 7. Send response

    return res.status(201).json({

      success: true,

      message:
        "Questions generated successfully",

      questions: savedQuestions

    });

  }

  catch (error) {

    console.error(
      "Question generation failed:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Question generation failed"

    });

  }

}


module.exports = {
  generateQuestionSet
};