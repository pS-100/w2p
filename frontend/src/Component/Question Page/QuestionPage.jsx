// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";

// import QuestionCard from "./QuestionCard";

// function QuestionPage() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const questions = location.state?.questions || [];

//   const [answers, setAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState(null);

//   // --------------------------------
//   // Select an answer
//   // --------------------------------
//   const handleAnswerSelect = (questionId, selectedAnswer) => {
//     setAnswers((previousAnswers) => ({
//       ...previousAnswers,
//       [questionId]: selectedAnswer,
//     }));
//   };

//   // --------------------------------
//   // Submit test
//   // --------------------------------
//   const handleSubmit = async () => {
//     setError("");

//     // Check if every question is answered
//     const unansweredQuestions = questions.filter(
//       (question) => !answers[question._id]
//     );

//     if (unansweredQuestions.length > 0) {
//       setError(
//         `Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`
//       );
//       return;
//     }

//     try {
//       setSubmitting(true);

//       // Convert React answers into API format
//       const formattedAnswers = questions.map((question) => ({
//         questionId: question._id,
//         selectedAnswer: answers[question._id],
//         responseTime: 0,
//       }));

//       console.log("Submitting answers:", formattedAnswers);

//       const response = await axios.post(
//         "http://localhost:5000/api/attempts/submit",
//         {
//           // Temporary userId for testing
//           // Later this will come from JWT authentication
//         //   userId: "YOUR_USER_ID",

//           answers: formattedAnswers,
//         }
//       );

//       console.log("Submit response:", response.data);

//       setResult(response.data.result);
//     } catch (error) {
//       console.error("Submit test error:", error);

//       const backendMessage = error.response?.data?.message;

//       if (backendMessage) {
//         setError(backendMessage);
//       } else if (error.request) {
//         setError(
//           "Cannot connect to the server. Make sure the backend is running."
//         );
//       } else {
//         setError(
//           error.message || "Failed to submit test."
//         );
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // --------------------------------
//   // No questions
//   // --------------------------------
//   if (questions.length === 0) {
//     return (
//       <div className="container mt-5">
//         <h2>No questions found</h2>

//         <button
//           className="btn btn-primary mt-3"
//           onClick={() => navigate("/")}
//         >
//           Generate Questions
//         </button>
//       </div>
//     );
//   }

//   // --------------------------------
//   // Result
//   // --------------------------------
//   if (result) {
//     return (
//       <div className="container mt-5">
//         <div className="card">
//           <div className="card-body text-center">
//             <h2>Test Submitted Successfully 🎉</h2>

//             <h3 className="mt-4">
//               Score: {result.score} / {result.totalQuestions}
//             </h3>

//             <h4 className="mt-3">
//               Percentage: {result.percentage}%
//             </h4>

//             <button
//               className="btn btn-primary mt-4"
//               onClick={() => navigate("/")}
//             >
//               Generate Another Test
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --------------------------------
//   // Questions
//   // --------------------------------
//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">
//         Online Assessment
//       </h2>

//       <p className="text-muted">
//         Answer all questions and submit your test.
//       </p>

//       {questions.map((question, index) => (
//         <QuestionCard
//           key={question._id || index}
//           question={question}
//           index={index}
//           selectedAnswer={answers[question._id]}
//           onAnswerSelect={handleAnswerSelect}
//         />
//       ))}

//       {error && (
//         <div className="alert alert-danger mt-3">
//           {error}
//         </div>
//       )}

//       <button
//         type="button"
//         className="btn btn-success btn-lg mt-3 mb-5"
//         onClick={handleSubmit}
//         disabled={submitting}
//       >
//         {submitting
//           ? "Submitting..."
//           : "Submit Test"}
//       </button>
//     </div>
//   );
// }

// export default QuestionPage;

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/axios";

import QuestionCard from "./QuestionCard";

function QuestionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // const questions =
  //   location.state?.questions || [];

  const questions = location.state?.questions || [];

  const attemptType = location.state?.attemptType || "standard";

  const originalAttemptId = location.state?.originalAttemptId || null;

  // const retestId =
  //   location.state?.retestId || null;

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [responseTimes, setResponseTimes] = useState({});

  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // const [result, setResult] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  // --------------------------------
  // No questions
  // --------------------------------
  const handleGenerateRetest = async () => {
    if (!attemptId) {
      setError("Original attempt ID is not available.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(
        `http://localhost:5000/api/adaptive-retest/generate/${attemptId}`,
      );

      console.log("Adaptive re-test:", response.data);

      navigate("/adaptive-retest", {
        state: {
          questions: response.data.questions,

          attemptType: "adaptive-retest",

          originalAttemptId: response.data.sourceAttemptId,

          retestId: response.data.retestId,

          strategy: response.data.strategy,
        },
      });
    } catch (error) {
      console.error("Adaptive re-test generation error:", error);

      const message = error.response?.data?.message;

      setError(message || "Failed to generate adaptive re-test.");
    } finally {
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="container mt-5">
        <h2>No questions found</h2>

        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Generate Questions
        </button>

        <button className="btn btn-warning ms-2" onClick={handleGenerateRetest}>
          Take Adaptive Re-Test
        </button>
      </div>
    );
  }

  // --------------------------------
  // Current question
  // --------------------------------

  const currentQuestion = questions[currentIndex];

  // --------------------------------
  // Select answer
  // --------------------------------

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedAnswer,
    }));
  };

  // --------------------------------
  // Record time
  // --------------------------------

  const recordCurrentQuestionTime = () => {
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);

    setResponseTimes((previous) => ({
      ...previous,
      [currentQuestion._id]: elapsed,
    }));

    return elapsed;
  };

  // --------------------------------
  // Next question
  // --------------------------------

  const handleNext = () => {
    setError("");

    recordCurrentQuestionTime();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);

      // Start timer for the new question
      setQuestionStartTime(() => Date.now());
    }
  };

  // --------------------------------
  // Previous question
  // --------------------------------

  const handlePrevious = () => {
    recordCurrentQuestionTime();

    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);

      // Start timer for the new question
      setQuestionStartTime(() => Date.now());
    }
  };

  // --------------------------------
  // Submit
  // --------------------------------

  const handleSubmit = async () => {
    setError("");

    // Record final question time
    const finalElapsed = Math.floor((Date.now() - questionStartTime) / 1000);

    const finalResponseTimes = {
      ...responseTimes,
      [currentQuestion._id]: finalElapsed,
    };

    try {
      setSubmitting(true);

      // --------------------------------
      // Create formatted answers
      // --------------------------------

      const formattedAnswers = questions.map((question) => ({
        questionId: question._id,

        selectedAnswer: answers[question._id] || "",

        responseTime: finalResponseTimes[question._id] || 0,
      }));

      console.log("Submitting answers:", formattedAnswers);

      const response = await api.post(
        "/attempts/submit",
        {
          answers: formattedAnswers,
          attemptType: attemptType,
          parentAttemptId:
            attemptType === "adaptive-retest" ? originalAttemptId : undefined,
        },
        
      );
      

      const newAttemptId = response.data.result.attemptId;

      setAttemptId(newAttemptId);

      // Go to performance result page
      navigate(`/performance/${newAttemptId}`, {
        state: {
          attemptId: newAttemptId,
        },
      });
    } catch (error) {
      console.error("Assessment submission error:", error);

      const message = error.response?.data?.message;

      if (message) {
        setError(message);
      } else if (error.request) {
        setError("Cannot connect to the server.");
      } else {
        setError(error.message || "Failed to submit test.");
      }
    } finally {
      setSubmitting(false);
    }
  };


// --------------------------------
// Assessment UI
// --------------------------------

const selectedAnswer = answers[currentQuestion._id];

const isLastQuestion = currentIndex === questions.length - 1;

return (
  <div className="container mt-4">
    <h2>Online Assessment</h2>

    <p className="text-muted">
      Question {currentIndex + 1} of {questions.length}
    </p>

    <div className="progress mb-4">
      <div
        className="progress-bar"
        style={{
          width: `${((currentIndex + 1) / questions.length) * 100}%`,
        }}
      >
        {currentIndex + 1}/{questions.length}
      </div>
    </div>

    <QuestionCard
      question={currentQuestion}
      index={currentIndex}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={handleAnswerSelect}
    />

    {error && <div className="alert alert-danger">{error}</div>}

    <div className="d-flex justify-content-between mt-4">
      <button
        className="btn btn-secondary"
        onClick={handlePrevious}
        disabled={currentIndex === 0 || submitting}
      >
        Previous
      </button>

      {!isLastQuestion ? (
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={submitting}
        >
          Next
        </button>
      ) : (
        <button
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Analyzing..." : "Submit Test"}
        </button>
      )}
    </div>
  </div>
);
}

export default QuestionPage;

// --------------------------------
// Result
// --------------------------------

// if (result) {
//   return (
//     <div className="container mt-5">
//       <div className="card">
//         <div className="card-body">
//           <h2>Performance Analysis</h2>

//           <hr />

//           <h4>
//             Score: {result.score}/{result.totalQuestions}
//           </h4>

//           <h4>Accuracy: {result.overallAccuracy}%</h4>

//           <h4>Learning Gap Score: {result.learningGapScore}</h4>

//           <hr />

//           <h5>Weak Areas</h5>

//           {result.weakAreas?.map((area, index) => (
//             <div key={index} className="alert alert-danger">
//               <strong>{area.topic}</strong>

//               {area.subtopic && <div>Subtopic: {area.subtopic}</div>}

//               <div>Gap Score: {area.gapScore}</div>
//             </div>
//           ))}

//           <h5>Strong Areas</h5>

//           {result.strongAreas?.map((area, index) => (
//             <div key={index} className="alert alert-success">
//               {area.topic}
//               {area.subtopic && ` → ${area.subtopic}`}
//             </div>
//           ))}

{
  /* <button className="btn btn-primary" onClick={() => navigate("/")}>
              Generate Another Test
            </button> */
}
//       <div className="mt-4">
//         <button
//           className="btn btn-warning me-2"
//           onClick={handleGenerateRetest}
//           disabled={submitting}
//         >
//           {submitting ? "Generating Re-Test..." : "Take Adaptive Re-Test"}
//         </button>

//         <button className="btn btn-primary" onClick={() => navigate("/")}>
//           Generate Another Test
//         </button>
//       </div>
//     </div>
//   </div>
// </div>
// );

// --------------------------------
// Submit attempt
// --------------------------------

//   const response =
//     await axios.post(
//       "http://localhost:5000/api/attempts/submit",
//       {
//         answers:
//           formattedAnswers,
//            attemptType: "adaptive-retest",
// // parentAttemptId: originalAttemptId,
//       }

//     );

//     const response = await axios.post(
//   "http://localhost:5000/api/attempts/submit",
//   {
//     answers: formattedAnswers,
//     attemptType: "standard",
//   }
// );

// const response = await axios.post(
//   "http://localhost:5000/api/attempts/submit",
//   {
//     answers: formattedAnswers,
//     attemptType: attemptType,
//     parentAttemptId:
//       attemptType === "adaptive-retest" ? originalAttemptId : undefined,
//   },
// );

// const attemptId =
//   response.data.result
//     .attemptId;

// const newAttemptId = response.data.result.attemptId;

// setAttemptId(newAttemptId);

// // --------------------------------
// // Performance analysis
// // --------------------------------

// const performanceResponse = await axios.get(
//   `http://localhost:5000/api/performance/${newAttemptId}`,
// );

// console.log("Performance:", performanceResponse.data);

// setResult(performanceResponse.data.performance);

// --------------------------------
// Reset timer when question changes
// --------------------------------

// useEffect(() => {
//   setQuestionStartTime(Date.now());
// }, [currentIndex]);

//   useEffect(() => {
//   setQuestionStartTime(() => Date.now());
// }, [currentIndex]);
