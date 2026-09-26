const {
  validateAdaptiveQuestions,
} = require("./services/adaptivequestionValidator");

const questions = [
  {
    subject: "os",
    topic: "System Structures",
    subtopic: "Microkernel",
    concept: "Client-server OS structure",
    difficulty: "easy",
    bloomLevel: "remember",
    question:
      "What is the primary role of a client in a client-server operating system structure?",
    options: [
      "To request services from a server",
      "To manage hardware interrupts",
      "To schedule CPU processes",
      "To replace the operating system kernel",
    ],
    correctAnswer:
      "To request services from a server",
    explanation:
      "A client requests services or resources from a server in a client-server structure.",
  },

  {
    subject: "os",
    topic: "System Structures",
    subtopic: "Microkernel",
    concept: "Client-server OS structure",
    difficulty: "easy",
    bloomLevel: "understand",
    question:
      "How do clients and servers typically communicate in a microkernel-based client-server structure?",
    options: [
      "Through message passing",
      "Through shared CPU registers only",
      "Through direct kernel modification",
      "Through replacing the file system",
    ],
    correctAnswer: "Through message passing",
    explanation:
      "Microkernel-based systems commonly use message passing for communication between clients and servers.",
  },

  {
    subject: "os",
    topic: "System Structures",
    subtopic: "Microkernel",
    concept: "Client-server OS structure",
    difficulty: "easy",
    bloomLevel: "understand",
    question:
      "What is one advantage of using a client-server structure in an operating system?",
    options: [
      "Services can run as separate components",
      "All services must run inside the kernel",
      "Hardware becomes unnecessary",
      "Every process becomes a kernel process",
    ],
    correctAnswer:
      "Services can run as separate components",
    explanation:
      "Separating services into components can improve modularity and fault isolation.",
  },

  {
    subject: "os",
    topic: "System Structures",
    subtopic: "Microkernel",
    concept: "Client-server OS structure",
    difficulty: "easy",
    bloomLevel: "remember",
    question:
      "Where are many operating system services located in a microkernel-based client-server design?",
    options: [
      "In user-space servers",
      "Only inside CPU registers",
      "Only inside the BIOS",
      "Inside application source files",
    ],
    correctAnswer:
      "In user-space servers",
    explanation:
      "Many services are implemented as separate user-space servers in a microkernel architecture.",
  },

  {
    subject: "os",
    topic: "System Structures",
    subtopic: "Microkernel",
    concept: "Client-server OS structure",
    difficulty: "medium",
    bloomLevel: "apply",
    question:
      "An application needs a file service in a client-server operating system. What should the application typically do?",
    options: [
      "Send a request to the file server",
      "Modify the kernel directly",
      "Restart the CPU",
      "Replace the microkernel",
    ],
    correctAnswer:
      "Send a request to the file server",
    explanation:
      "The application acts as a client and requests the required service from the appropriate server.",
  },
];

try {
  const validatedQuestions =
    validateAdaptiveQuestions(questions);

  console.log(
    "\n✅ Adaptive question validation PASSED"
  );

  console.log(
    `Validated question count: ${validatedQuestions.length}`
  );

  validatedQuestions.forEach(
    (question, index) => {
      console.log(
        `\nQuestion ${index + 1}`
      );

      console.log(
        "Subject:",
        question.subject
      );

      console.log(
        "Topic:",
        question.topic
      );

      console.log(
        "Subtopic:",
        question.subtopic
      );

      console.log(
        "Concept:",
        question.concept
      );

      console.log(
        "Difficulty:",
        question.difficulty
      );

      console.log(
        "Bloom:",
        question.bloomLevel
      );

      console.log(
        "Options:",
        question.options.length
      );
    }
  );
} catch (error) {
  console.error(
    "\n❌ Adaptive question validation FAILED"
  );

  console.error(
    error.message
  );
}