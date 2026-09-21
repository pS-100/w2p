const adaptiveQuestionSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          subject: {
            type: "string",
          },
          topic: {
            type: "string",
          },
          subtopic: {
            type: "string",
          },
          difficulty: {
            type: "string",
          },
          bloomLevel: {
            type: "string",
          },
          question: {
            type: "string",
          },
          options: {
            type: "array",
            items: {
              type: "string",
            },
          },
          correctAnswer: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
        },
        required: [
          "subject",
          "topic",
          "subtopic",
          "difficulty",
          "bloomLevel",
          "question",
          "options",
          "correctAnswer",
          "explanation",
        ],
      },
    },
  },
  required: ["questions"],
};

module.exports = adaptiveQuestionSchema;