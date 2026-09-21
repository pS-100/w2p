 

// function QuestionCard({
//   question,
//   index,
//   selectedAnswer,
//   onAnswerSelect,
// }) {
//   return (
//     <div className="card mb-4">
//       <div className="card-body">
//         <h3 className="card-text">
//           {index + 1}. {question.question}
//         </h3>

//         <div className="btn-group-vertical w-100 mt-3">
//           {question.options?.map((option, i) => {
//             const isSelected = selectedAnswer === option;

//             return (
//               <button
//                 type="button"
//                 className={`btn ${
//                   isSelected
//                     ? "btn-primary"
//                     : "btn-outline-secondary"
//                 } text-start mb-2`}
//                 key={i}
//                 onClick={() =>
//                   onAnswerSelect(question._id, option)
//                 }
//               >
//                 <span className="option-label">
//                   {String.fromCharCode(65 + i)}.{" "}
//                 </span>

//                 <span>{option}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default QuestionCard;









import "./QuestionCard.css";

function QuestionCard({
  question,
  index,
  selectedAnswer,
  onAnswerSelect,
}) {
  return (
    <section className="question-card">
      {/* Question header */}
      <div className="question-card-header">
        <span className="question-number">
          Question {index + 1}
        </span>

        {question.difficulty && (
          <span className="question-difficulty">
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question */}
      <div className="question-content">
        <h2 className="question-text">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="question-options">
        {question.options?.map((option, i) => {
          const isSelected = selectedAnswer === option;

          return (
            <button
              type="button"
              className={`question-option ${
                isSelected ? "selected" : ""
              }`}
              key={i}
              onClick={() =>
                onAnswerSelect(question._id, option)
              }
              aria-pressed={isSelected}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + i)}
              </span>

              <span className="option-text">
                {option}
              </span>

              <span className="option-check">
                {isSelected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="question-card-footer">
        <span>
          Select one answer
        </span>

        {selectedAnswer && (
          <span className="answer-selected">
            Answer selected
          </span>
        )}
      </div>
    </section>
  );
}

export default QuestionCard;