// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// // import axios from "axios";
// import "./AdaptiveRetestPage.css";
// import api from "../../api/axios";

// export default function AdaptiveRetestPage() {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();

//   const [strategy, setStrategy] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const generateAdaptiveRetest = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await api.post(
//   `/adaptive-retest/generate/${attemptId}`
// );

//         console.log("Adaptive Retest:", response.data);

//         setQuestions(response.data.questions || []);
//         setStrategy(response.data.strategy || null);
//       } catch (err) {
//         console.error(
//           "Adaptive re-test generation error:",
//           err
//         );

//         setError(
//           err.response?.data?.message ||
//             "Failed to generate adaptive re-test."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (attemptId) {
//       generateAdaptiveRetest();
//     }
//   }, [attemptId]);

//   const handleStartRetest = () => {
//     navigate("/questions", {
//       state: {
//         questions,
//         attemptType: "adaptive-retest",
//         originalAttemptId: attemptId,
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="adaptive-page">
//         <div className="adaptive-loading">
//           <div className="adaptive-spinner"></div>

//           <h2>Building your adaptive re-test...</h2>

//           <p>
//             Analyzing your learning gaps and selecting
//             targeted questions.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="adaptive-page">
//         <div className="adaptive-error">
//           <div className="error-icon">!</div>

//           <h2>Unable to generate re-test</h2>

//           <p>{error}</p>

//           <button
//             type="button"
//             onClick={() =>
//               navigate(`/performance/${attemptId}`)
//             }
//           >
//             Back to Performance
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="adaptive-page">
//       <div className="adaptive-container">

//         <div className="adaptive-header">
//           <span className="adaptive-badge">
//             ADAPTIVE RE-TEST
//           </span>

//           <h1>Let's strengthen your weak areas</h1>

//           <p>
//             This re-test has been generated specifically
//             from your previous performance.
//           </p>
//         </div>

//         {strategy && (
//           <section className="strategy-card">

//             <div className="strategy-title">
//               <div className="strategy-icon">◎</div>

//               <div>
//                 <h2>Your Adaptive Plan</h2>
//                 <p>
//                   Questions are targeted at the areas
//                   that need improvement.
//                 </p>
//               </div>
//             </div>

//             <div className="strategy-grid">

//               <div className="strategy-item">
//                 <span className="strategy-label">
//                   Focus Topic
//                 </span>

//                 <strong>
//                   {strategy.targetTopic || "—"}
//                 </strong>
//               </div>

//               <div className="strategy-item">
//                 <span className="strategy-label">
//                   Subtopic
//                 </span>

//                 <strong>
//                   {strategy.targetSubtopic || "—"}
//                 </strong>
//               </div>

//               <div className="strategy-item">
//                 <span className="strategy-label">
//                   Difficulty
//                 </span>

//                 <strong className="capitalize">
//                   {strategy.selectedDifficulty || "—"}
//                 </strong>
//               </div>

//               <div className="strategy-item">
//                 <span className="strategy-label">
//                   Questions
//                 </span>

//                 <strong>
//                   {strategy.count || questions.length}
//                 </strong>
//               </div>

//             </div>

//             {strategy.focusAreas?.length > 0 && (
//               <div className="focus-section">
//                 <span className="strategy-label">
//                   Focus Areas
//                 </span>

//                 <div className="focus-tags">
//                   {strategy.focusAreas.map(
//                     (area, index) => (
//                       <span key={index}>
//                         {area}
//                       </span>
//                     )
//                   )}
//                 </div>
//               </div>
//             )}

//             {strategy.reasons?.length > 0 && (
//               <div className="reason-section">
//                 <span className="strategy-label">
//                   Why these questions?
//                 </span>

//                 <ul>
//                   {strategy.reasons.map(
//                     (reason, index) => (
//                       <li key={index}>{reason}</li>
//                     )
//                   )}
//                 </ul>
//               </div>
//             )}
//           </section>
//         )}

//         <section className="question-preview">

//           <div className="preview-header">
//             <div>
//               <span className="section-eyebrow">
//                 GENERATED ASSESSMENT
//               </span>

//               <h2>
//                 {questions.length} targeted questions
//               </h2>
//             </div>

//             <span className="preview-count">
//               {questions.length} Questions
//             </span>
//           </div>

//           <div className="preview-list">
//             {questions.map((question, index) => (
//               <div
//                 className="preview-question"
//                 key={question._id || index}
//               >
//                 <span className="preview-number">
//                   {String(index + 1).padStart(2, "0")}
//                 </span>

//                 <div>
//                   <p>{question.question}</p>

//                   <div className="preview-meta">
//                     {question.difficulty && (
//                       <span>
//                         {question.difficulty}
//                       </span>
//                     )}

//                     {question.bloomLevel && (
//                       <span>
//                         {question.bloomLevel}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//         </section>

//         <div className="adaptive-actions">

//           <button
//             type="button"
//             className="back-button"
//             onClick={() =>
//               navigate(`/performance/${attemptId}`)
//             }
//           >
//             Back
//           </button>

//           <button
//             type="button"
//             className="start-button"
//             disabled={questions.length === 0}
//             onClick={handleStartRetest}
//           >
//             Start Adaptive Re-Test
//             <span>→</span>
//           </button>

//         </div>

//       </div>
//     </div>
//   );
// }








import { useLocation, useNavigate } from "react-router-dom";
import "./AdaptiveRetestPreview.css";

export default function AdaptiveRetestPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  const questions = location.state?.questions || [];

  const originalAttemptId =
    location.state?.originalAttemptId || null;

  const retestId =
    location.state?.retestId || null;

  const strategy =
    location.state?.strategy || null;

  if (!questions.length) {
    return (
      <div className="adaptive-page">
        <div className="adaptive-error">
          <div className="error-icon">!</div>

          <h2>Adaptive re-test not available</h2>

          <p>
            No adaptive re-test questions were found.
          </p>

          <button
            type="button"
            onClick={() => navigate("/Home")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleStartRetest = () => {
    navigate("/adaptive-retest/test", {
      state: {
        questions,
        attemptType: "adaptive-retest",
        originalAttemptId,
        retestId,
        strategy,
      },
    });
  };

  return (
    <div className="adaptive-page">
      <div className="adaptive-container">

        {/* -----------------------------------------
            Header
        ----------------------------------------- */}

        <div className="adaptive-header">

          <span className="adaptive-badge">
            ADAPTIVE RE-TEST
          </span>

          <h1>
            Let's strengthen your weak areas
          </h1>

          <p>
            This re-test has been generated
            specifically from your previous
            performance.
          </p>

        </div>

        {/* -----------------------------------------
            Strategy
        ----------------------------------------- */}

        {strategy && (
          <section className="strategy-card">

            <div className="strategy-title">

              <div className="strategy-icon">
                ◎
              </div>

              <div>
                <h2>Your Adaptive Plan</h2>

                <p>
                  Questions are targeted at the
                  areas that need improvement.
                </p>
              </div>

            </div>

            <div className="strategy-grid">

              <div className="strategy-item">

                <span className="strategy-label">
                  Focus Topic
                </span>

                <strong>
                  {strategy.targetTopic || "—"}
                </strong>

              </div>

              <div className="strategy-item">

                <span className="strategy-label">
                  Subtopic
                </span>

                <strong>
                  {strategy.targetSubtopic || "—"}
                </strong>

              </div>

              <div className="strategy-item">

                <span className="strategy-label">
                  Difficulty
                </span>

                <strong className="capitalize">
                  {strategy.selectedDifficulty || "—"}
                </strong>

              </div>

              <div className="strategy-item">

                <span className="strategy-label">
                  Questions
                </span>

                <strong>
                  {strategy.questionCount ||
                    questions.length}
                </strong>

              </div>

            </div>

            {strategy.focusAreas?.length > 0 && (
              <div className="focus-section">

                <span className="strategy-label">
                  Focus Areas
                </span>

                <div className="focus-tags">

                  {strategy.focusAreas.map(
                    (area, index) => (
                      <span key={index}>
                        {area}
                      </span>
                    )
                  )}

                </div>

              </div>
            )}

            {strategy.reasons?.length > 0 && (
              <div className="reason-section">

                <span className="strategy-label">
                  Why these questions?
                </span>

                <ul>

                  {strategy.reasons.map(
                    (reason, index) => (
                      <li key={index}>
                        {reason}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

          </section>
        )}

        {/* -----------------------------------------
            Question Preview
        ----------------------------------------- */}

        <section className="question-preview">

          <div className="preview-header">

            <div>

              <span className="section-eyebrow">
                GENERATED ASSESSMENT
              </span>

              <h2>
                {questions.length} targeted questions
              </h2>

            </div>

            <span className="preview-count">
              {questions.length} Questions
            </span>

          </div>

          <div className="preview-list">

            {questions.map(
              (question, index) => (

                <div
                  className="preview-question"
                  key={question._id || index}
                >

                  <span className="preview-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>

                    <p>
                      {question.question}
                    </p>

                    <div className="preview-meta">

                      {question.difficulty && (
                        <span>
                          {question.difficulty}
                        </span>
                      )}

                      {question.bloomLevel && (
                        <span>
                          {question.bloomLevel}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* -----------------------------------------
            Actions
        ----------------------------------------- */}

        <div className="adaptive-actions">

          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <button
            type="button"
            className="start-button"
            onClick={handleStartRetest}
          >
            Start Adaptive Re-Test
            <span>→</span>
          </button>

        </div>

      </div>
    </div>
  );
}