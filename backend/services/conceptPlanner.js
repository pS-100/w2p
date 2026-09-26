const QUESTIONS_PER_CONCEPT = 2;

const MIN_QUESTIONS = 10;

const MAX_QUESTIONS = 20;

const planConceptQuestions = ({
  concepts,
  requestedQuestionCount,
}) => {
  if (
    !Array.isArray(concepts) ||
    concepts.length === 0
  ) {
    throw new Error(
      "No concepts available for planning."
    );
  }

  const questionCount = Math.max(
    MIN_QUESTIONS,
    Math.min(
      Number(requestedQuestionCount),
      MAX_QUESTIONS
    )
  );

  const selectedConcepts = [];

  let remainingQuestions = questionCount;

  /*
   * First pass:
   * Give every selected concept exactly
   * two questions.
   */
  for (const concept of concepts) {
    if (
      remainingQuestions <
      QUESTIONS_PER_CONCEPT
    ) {
      break;
    }

    selectedConcepts.push({
      concept,
      questionCount:
        QUESTIONS_PER_CONCEPT,
    });

    remainingQuestions -=
      QUESTIONS_PER_CONCEPT;
  }

  /*
   * If some questions remain, distribute
   * them across already selected concepts.
   */
  let index = 0;

  while (
    remainingQuestions > 0 &&
    selectedConcepts.length > 0
  ) {
    selectedConcepts[index].questionCount += 1;

    remainingQuestions -= 1;

    index =
      (index + 1) %
      selectedConcepts.length;
  }

  const selectedConceptNames =
    new Set(
      selectedConcepts.map(
        (item) => item.concept
      )
    );

  const remainingConcepts =
    concepts.filter(
      (concept) =>
        !selectedConceptNames.has(concept)
    );

  return {
    requestedQuestionCount: questionCount,

    questionsPerConcept:
      QUESTIONS_PER_CONCEPT,

    selectedConcepts,

    remainingConcepts,

    totalQuestions: selectedConcepts.reduce(
      (total, item) =>
        total + item.questionCount,
      0
    ),
  };
};

module.exports = {
  QUESTIONS_PER_CONCEPT,
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  planConceptQuestions,
};