const fallbackQuestions = [
  {
    subject: "Computer Science",
    topic: "array",
    subtopic: "deletion",
    difficulty: "easy",
    bloomLevel: "Understand",
    question:
      "What happens to the elements after an element is deleted from the middle of an array?",
    options: [
      "Elements after it are shifted left",
      "Elements before it are shifted right",
      "The array automatically doubles in size",
      "Nothing happens to the remaining elements",
    ],
    correctAnswer: "Elements after it are shifted left",
    explanation:
      "When an element is deleted from the middle of an array, subsequent elements are shifted one position to the left.",
  },

  {
    subject: "Computer Science",
    topic: "array",
    subtopic: "deletion",
    difficulty: "easy",
    bloomLevel: "Understand",
    question:
      "What is the usual time complexity of deleting an element from the middle of an array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: "O(n)",
    explanation:
      "Deleting an element from the middle usually requires shifting subsequent elements, resulting in O(n) time.",
  },

  {
    subject: "Computer Science",
    topic: "array",
    subtopic: "deletion",
    difficulty: "easy",
    bloomLevel: "Apply",
    question:
      "If an element at index 2 is deleted from an array, what should happen to the element at index 3?",
    options: [
      "It moves to index 2",
      "It moves to index 4",
      "It is deleted automatically",
      "It remains at index 3",
    ],
    correctAnswer: "It moves to index 2",
    explanation:
      "Elements after the deleted position shift one position toward the beginning of the array.",
  },

  {
    subject: "Computer Science",
    topic: "array",
    subtopic: "deletion",
    difficulty: "easy",
    bloomLevel: "Understand",
    question:
      "Why must elements usually be shifted after deleting an array element?",
    options: [
      "To maintain contiguous storage",
      "To increase the array size",
      "To sort the array",
      "To change the data type",
    ],
    correctAnswer: "To maintain contiguous storage",
    explanation:
      "Arrays store elements in contiguous positions, so shifting maintains the sequence after deletion.",
  },

  {
    subject: "Computer Science",
    topic: "array",
    subtopic: "deletion",
    difficulty: "medium",
    bloomLevel: "Apply",
    question:
      "Deleting the first element of an array containing n elements usually requires how many elements to shift?",
    options: ["0", "1", "n - 1", "n²"],
    correctAnswer: "n - 1",
    explanation:
      "All remaining elements must shift one position toward the beginning of the array.",
  },
];

const getFallbackQuestions = ({
  targetTopic,
  targetSubtopic,
  questionCount = 5,
}) => {
  return fallbackQuestions
    .filter(
      (question) =>
        question.topic.trim().toLowerCase() ===
          targetTopic.trim().toLowerCase() &&
        question.subtopic.trim().toLowerCase() ===
          targetSubtopic.trim().toLowerCase()
    )
    .slice(0, questionCount);
};

module.exports = {
  getFallbackQuestions,
};