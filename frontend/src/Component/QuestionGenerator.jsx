import { useState } from "react";
import axios from "axios";
import "./QuestionGenerator.css";

import { useNavigate } from "react-router-dom";

function QuestionGenerator() {
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    subtopic: "",
    difficulty: "medium",
    questionCount: 5,
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const generateQuestions = async () => {
    if (loading) return;

    setError("");

    if (!form.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!form.topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    if (!form.subtopic.trim()) {
      setError("Please enter a subtopic.");
      return;
    }

    if (form.questionCount < 1 || form.questionCount > 20) {
      setError("Question count must be between 1 and 20.");
      return;
    }

    try {
      setLoading(true);

      setQuestions([]);

      console.log("Sending request:", form);

      const response = await axios.post(
        "http://localhost:5000/api/questions/generate",
        {
          subject: form.subject,
          topic: form.topic,
          subtopic: form.subtopic,
          difficulty: form.difficulty,
          questionCount: Number(form.questionCount),
        },
      );

      console.log("Backend response:", response.data);

      if (response.data.success === false) {
        throw new Error(
          response.data.message || "Failed to generate questions.",
        );
      }

      const generatedQuestions = response.data.questions || [];

      if (generatedQuestions.length === 0) {
        setError("No questions were generated.");
        return;
      }

      // Navigate to assessment page
      navigate("/questions", {
        state: {
          questions: generatedQuestions,
        },
      });
    } catch (error) {
      console.error("Question generation error:", error);

      const backendMessage = error.response?.data?.message;

      if (backendMessage) {
        setError(backendMessage);
      } else if (error.request) {
        setError(
          "Cannot connect to the server. Make sure the backend is running.",
        );
      } else {
        setError(error.message || "Failed to generate questions.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="generator-page">
    //   <div className="generator-card">
    //     {/* Header */}
    //     <div className="generator-header">
    //       <div>
    //         <span className="page-eyebrow">AI ASSESSMENT</span>

    //         <h2>Create a New Test</h2>

    //         <p>
    //           Generate an AI-powered assessment based on your subject, topic and
    //           difficulty.
    //         </p>
    //       </div>
    //     </div>

    //     {/* Form */}
    //     <div className="generator-form">
    //       {/* Subject */}
    //       <div className="form-group">
    //         <label htmlFor="subject">Subject</label>

    //         <input
    //           id="subject"
    //           name="subject"
    //           placeholder="e.g. Data Structures"
    //           value={form.subject}
    //           onChange={handleChange}
    //           disabled={loading}
    //         />

    //         <span className="input-hint">
    //           Enter the subject you want to practice.
    //         </span>
    //       </div>

    //       {/* Topic + Subtopic */}
    //       <div className="form-row">
    //         <div className="form-group">
    //           <label htmlFor="topic">Topic</label>

    //           <input
    //             id="topic"
    //             name="topic"
    //             placeholder="e.g. Arrays"
    //             value={form.topic}
    //             onChange={handleChange}
    //             disabled={loading}
    //           />
    //         </div>

    //         <div className="form-group">
    //           <label htmlFor="subtopic">Subtopic</label>

    //           <input
    //             id="subtopic"
    //             name="subtopic"
    //             placeholder="e.g. Searching"
    //             value={form.subtopic}
    //             onChange={handleChange}
    //             disabled={loading}
    //           />
    //         </div>
    //       </div>

    //       {/* Difficulty + Question Count */}
    //       <div className="form-row">
    //         <div className="form-group">
    //           <label htmlFor="difficulty">Difficulty</label>

    //           <select
    //             id="difficulty"
    //             name="difficulty"
    //             value={form.difficulty}
    //             onChange={handleChange}
    //             disabled={loading}
    //           >
    //             <option value="easy">Easy</option>

    //             <option value="medium">Medium</option>

    //             <option value="hard">Hard</option>
    //           </select>
    //         </div>

    //         <div className="form-group">
    //           <label htmlFor="questionCount">Number of Questions</label>

    //           <input
    //             id="questionCount"
    //             type="number"
    //             name="questionCount"
    //             min="1"
    //             max="20"
    //             value={form.questionCount}
    //             onChange={handleChange}
    //             disabled={loading}
    //           />

    //           <span className="input-hint">
    //             Choose between 1 and 20 questions.
    //           </span>
    //         </div>
    //       </div>

    //       {/* Error */}
    //       {error && (
    //         <div className="generator-error">
    //           <span className="error-icon">!</span>

    //           <div>
    //             <strong>Unable to generate test</strong>
    //             <p>{error}</p>
    //           </div>
    //         </div>
    //       )}

    //       {/* Generate Button */}
    //       <button
    //         className="generate-button"
    //         onClick={generateQuestions}
    //         disabled={loading}
    //       >
    //         {loading ? (
    //           <>
    //             <span className="button-spinner"></span>
    //             Generating...
    //           </>
    //         ) : (
    //           <>
    //             <span>✦</span>
    //             Generate Questions
    //           </>
    //         )}
    //       </button>

    //       {/* Loading */}
    //       {loading && (
    //         <div className="generation-status">
    //           <div className="status-spinner"></div>

    //           <div>
    //             <strong>Generating your assessment</strong>

    //             <p>AI is creating questions based on your selected topics.</p>
    //           </div>
    //         </div>
    //       )}

    //       {/* Empty State */}
    //       {!loading && !error && questions.length === 0 && (
    //         <div className="generator-empty">
    //           <div className="empty-icon">✦</div>

    //           <div>
    //             <strong>Ready when you are</strong>

    //             <p>
    //               Enter your assessment details above and generate your first
    //               test.
    //             </p>
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>

     <div className="generator-page">

      <div className="generator-card">

        {/* =========================
            HEADER
        ========================= */}

        <div className="generator-header">

          <div className="generator-title-area">

            <div className="ai-badge">
              <span className="ai-badge-dot"></span>
              AI POWERED
            </div>

            <h2>Create a New Assessment</h2>

            <p>
              Choose what you want to practice and let
              WeakToPeak generate a personalized assessment.
            </p>

          </div>

        </div>


        {/* =========================
            FORM
        ========================= */}

        <div className="generator-form">

          {/* Subject */}

          <div className="form-group">

            <label htmlFor="subject">
              Subject
              <span className="required">*</span>
            </label>

            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="e.g. Data Structures"
              value={form.subject}
              onChange={handleChange}
              disabled={loading}
              autoComplete="off"
            />

            <span className="input-hint">
              The main subject you want to assess.
            </span>

          </div>


          {/* Topic + Subtopic */}

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="topic">
                Topic
                <span className="required">*</span>
              </label>

              <input
                id="topic"
                name="topic"
                type="text"
                placeholder="e.g. Arrays"
                value={form.topic}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
              />

            </div>


            <div className="form-group">

              <label htmlFor="subtopic">
                Subtopic
                <span className="required">*</span>
              </label>

              <input
                id="subtopic"
                name="subtopic"
                type="text"
                placeholder="e.g. Searching"
                value={form.subtopic}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
              />

            </div>

          </div>


          {/* Difficulty + Question Count */}

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="difficulty">
                Difficulty
              </label>

              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>

              <span className="input-hint">
                Select the expected difficulty level.
              </span>

            </div>


            <div className="form-group">

              <label htmlFor="questionCount">
                Number of Questions
              </label>

              <input
                id="questionCount"
                type="number"
                name="questionCount"
                min="1"
                max="20"
                value={form.questionCount}
                onChange={handleChange}
                disabled={loading}
              />

              <span className="input-hint">
                Choose between 1 and 20 questions.
              </span>

            </div>

          </div>


          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div
              className="generator-error"
              role="alert"
            >

              <div className="error-icon">
                !
              </div>

              <div className="error-content">

                <strong>
                  Unable to generate assessment
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>
          )}


          {/* =========================
              GENERATE BUTTON
          ========================= */}

          <button
            type="button"
            className="generate-button"
            onClick={generateQuestions}
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="button-spinner"></span>

                <span>
                  Generating Assessment...
                </span>
              </>
            ) : (
              <>
                <span className="generate-icon">
                  ✦
                </span>

                <span>
                  Generate Assessment
                </span>
              </>
            )}

          </button>


          {/* =========================
              LOADING STATUS
          ========================= */}

          {loading && (
            <div className="generation-status">

              <div className="status-spinner"></div>

              <div>

                <strong>
                  Creating your assessment
                </strong>

                <p>
                  AI is generating questions based on
                  your selected subject and topic.
                </p>

              </div>

            </div>
          )}


          {/* =========================
              EMPTY STATE
          ========================= */}

          {!loading &&
            !error &&
            questions.length === 0 && (
              <div className="generator-empty">

                <div className="empty-icon">
                  ✦
                </div>

                <div>

                  <strong>
                    Ready to begin?
                  </strong>

                  <p>
                    Enter your assessment details and
                    generate your questions.
                  </p>

                </div>

              </div>
            )}

        </div>

      </div>

    </div>
  );
}

export default QuestionGenerator;















// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// import "./QuestionGenerator.css";

// function QuestionGenerator() {
//   const [form, setForm] = useState({
//     subject: "",
//     topic: "",
//     subtopic: "",
//     difficulty: "medium",
//     questionCount: 5,
//   });

//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prevForm) => ({
//       ...prevForm,
//       [name]: value,
//     }));

//     // Remove old error when user starts correcting the form
//     if (error) {
//       setError("");
//     }
//   };

//   const generateQuestions = async () => {
//     if (loading) return;

//     setError("");

//     if (!form.subject.trim()) {
//       setError("Please enter a subject.");
//       return;
//     }

//     if (!form.topic.trim()) {
//       setError("Please enter a topic.");
//       return;
//     }

//     if (!form.subtopic.trim()) {
//       setError("Please enter a subtopic.");
//       return;
//     }

//     if (
//       Number(form.questionCount) < 1 ||
//       Number(form.questionCount) > 20
//     ) {
//       setError("Question count must be between 1 and 20.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setQuestions([]);

//       console.log("Sending request:", form);

//       const response = await axios.post(
//         "http://localhost:5000/api/questions/generate",
//         {
//           subject: form.subject,
//           topic: form.topic,
//           subtopic: form.subtopic,
//           difficulty: form.difficulty,
//           questionCount: Number(form.questionCount),
//         }
//       );

//       console.log("Backend response:", response.data);

//       if (response.data.success === false) {
//         throw new Error(
//           response.data.message ||
//             "Failed to generate questions."
//         );
//       }

//       const generatedQuestions =
//         response.data.questions || [];

//       if (generatedQuestions.length === 0) {
//         setError("No questions were generated.");
//         return;
//       }

//       navigate("/questions", {
//         state: {
//           questions: generatedQuestions,
//         },
//       });
//     } catch (error) {
//       console.error(
//         "Question generation error:",
//         error
//       );

//       const backendMessage =
//         error.response?.data?.message;

//       if (backendMessage) {
//         setError(backendMessage);
//       } else if (error.request) {
//         setError(
//           "Cannot connect to the server. Make sure the backend is running."
//         );
//       } else {
//         setError(
//           error.message ||
//             "Failed to generate questions."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="generator-page">

//       <div className="generator-card">

//         {/* =========================
//             HEADER
//         ========================= */}

//         <div className="generator-header">

//           <div className="generator-title-area">

//             <div className="ai-badge">
//               <span className="ai-badge-dot"></span>
//               AI POWERED
//             </div>

//             <h2>Create a New Assessment</h2>

//             <p>
//               Choose what you want to practice and let
//               WeakToPeak generate a personalized assessment.
//             </p>

//           </div>

//         </div>


//         {/* =========================
//             FORM
//         ========================= */}

//         <div className="generator-form">

//           {/* Subject */}

//           <div className="form-group">

//             <label htmlFor="subject">
//               Subject
//               <span className="required">*</span>
//             </label>

//             <input
//               id="subject"
//               name="subject"
//               type="text"
//               placeholder="e.g. Data Structures"
//               value={form.subject}
//               onChange={handleChange}
//               disabled={loading}
//               autoComplete="off"
//             />

//             <span className="input-hint">
//               The main subject you want to assess.
//             </span>

//           </div>


//           {/* Topic + Subtopic */}

//           <div className="form-row">

//             <div className="form-group">

//               <label htmlFor="topic">
//                 Topic
//                 <span className="required">*</span>
//               </label>

//               <input
//                 id="topic"
//                 name="topic"
//                 type="text"
//                 placeholder="e.g. Arrays"
//                 value={form.topic}
//                 onChange={handleChange}
//                 disabled={loading}
//                 autoComplete="off"
//               />

//             </div>


//             <div className="form-group">

//               <label htmlFor="subtopic">
//                 Subtopic
//                 <span className="required">*</span>
//               </label>

//               <input
//                 id="subtopic"
//                 name="subtopic"
//                 type="text"
//                 placeholder="e.g. Searching"
//                 value={form.subtopic}
//                 onChange={handleChange}
//                 disabled={loading}
//                 autoComplete="off"
//               />

//             </div>

//           </div>


//           {/* Difficulty + Question Count */}

//           <div className="form-row">

//             <div className="form-group">

//               <label htmlFor="difficulty">
//                 Difficulty
//               </label>

//               <select
//                 id="difficulty"
//                 name="difficulty"
//                 value={form.difficulty}
//                 onChange={handleChange}
//                 disabled={loading}
//               >
//                 <option value="easy">
//                   Easy
//                 </option>

//                 <option value="medium">
//                   Medium
//                 </option>

//                 <option value="hard">
//                   Hard
//                 </option>
//               </select>

//               <span className="input-hint">
//                 Select the expected difficulty level.
//               </span>

//             </div>


//             <div className="form-group">

//               <label htmlFor="questionCount">
//                 Number of Questions
//               </label>

//               <input
//                 id="questionCount"
//                 type="number"
//                 name="questionCount"
//                 min="1"
//                 max="20"
//                 value={form.questionCount}
//                 onChange={handleChange}
//                 disabled={loading}
//               />

//               <span className="input-hint">
//                 Choose between 1 and 20 questions.
//               </span>

//             </div>

//           </div>


//           {/* =========================
//               ERROR
//           ========================= */}

//           {error && (
//             <div
//               className="generator-error"
//               role="alert"
//             >

//               <div className="error-icon">
//                 !
//               </div>

//               <div className="error-content">

//                 <strong>
//                   Unable to generate assessment
//                 </strong>

//                 <p>
//                   {error}
//                 </p>

//               </div>

//             </div>
//           )}


//           {/* =========================
//               GENERATE BUTTON
//           ========================= */}

//           <button
//             type="button"
//             className="generate-button"
//             onClick={generateQuestions}
//             disabled={loading}
//           >

//             {loading ? (
//               <>
//                 <span className="button-spinner"></span>

//                 <span>
//                   Generating Assessment...
//                 </span>
//               </>
//             ) : (
//               <>
//                 <span className="generate-icon">
//                   ✦
//                 </span>

//                 <span>
//                   Generate Assessment
//                 </span>
//               </>
//             )}

//           </button>


//           {/* =========================
//               LOADING STATUS
//           ========================= */}

//           {loading && (
//             <div className="generation-status">

//               <div className="status-spinner"></div>

//               <div>

//                 <strong>
//                   Creating your assessment
//                 </strong>

//                 <p>
//                   AI is generating questions based on
//                   your selected subject and topic.
//                 </p>

//               </div>

//             </div>
//           )}


//           {/* =========================
//               EMPTY STATE
//           ========================= */}

//           {!loading &&
//             !error &&
//             questions.length === 0 && (
//               <div className="generator-empty">

//                 <div className="empty-icon">
//                   ✦
//                 </div>

//                 <div>

//                   <strong>
//                     Ready to begin?
//                   </strong>

//                   <p>
//                     Enter your assessment details and
//                     generate your questions.
//                   </p>

//                 </div>

//               </div>
//             )}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default QuestionGenerator;