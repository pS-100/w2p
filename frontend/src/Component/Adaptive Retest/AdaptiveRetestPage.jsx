import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/axios";

export default function AdaptiveRetestPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // -----------------------------------------
  // Data received from QuestionPage
  // -----------------------------------------

  const questions = location.state?.questions || [];

  const originalAttemptId =
    location.state?.originalAttemptId || null;

  const retestId =
    location.state?.retestId || null;

  const strategy =
    location.state?.strategy || null;

  // -----------------------------------------
  // State
  // -----------------------------------------

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [responseTimes, setResponseTimes] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // -----------------------------------------
  // Timer
  // -----------------------------------------

//   const questionStartTime = useRef(Date.now());
const questionStartTime = useRef(null);
useEffect(() => {
  questionStartTime.current = performance.now();
}, [currentIndex]);

  // -----------------------------------------
  // Current question
  // -----------------------------------------

  const currentQuestion =
    questions[currentIndex];

  // -----------------------------------------
  // Select answer
  // -----------------------------------------

  const handleAnswerSelect = (option) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: option,
    }));
  };

  // -----------------------------------------
  // Save current question time
  // -----------------------------------------

  const saveCurrentQuestionTime = () => {
    if (!currentQuestion) return;

    const elapsed = Math.floor(
  (performance.now() - questionStartTime.current) / 1000
);

    setResponseTimes((prev) => ({
      ...prev,
      [currentQuestion._id]: elapsed,
    }));
  };

  // -----------------------------------------
  // Next question
  // -----------------------------------------

  const handleNext = () => {
    saveCurrentQuestionTime();

    setCurrentIndex((prev) => prev + 1);

    // questionStartTime.current = Date.now();
  };

  // -----------------------------------------
  // Previous question
  // -----------------------------------------

  const handlePrevious = () => {
    saveCurrentQuestionTime();

    setCurrentIndex((prev) =>
      Math.max(prev - 1, 0)
    );

    // x    x   questionStartTime.current = Date.now();
  };

  // -----------------------------------------
  // Submit adaptive re-test
  // -----------------------------------------

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    setError("");

    // Save final question time
    const finalElapsed = Math.floor(
  (performance.now() - questionStartTime.current) / 1000
);

    const finalResponseTimes = {
      ...responseTimes,
      [currentQuestion._id]: finalElapsed,
    };

    try {
      setSubmitting(true);

      // -----------------------------------------
      // Format answers
      // -----------------------------------------

      const formattedAnswers = questions.map(
        (question) => ({
          questionId: question._id,

          selectedAnswer:
            answers[question._id] || "",

          responseTime:
            finalResponseTimes[question._id] || 0,
        })
      );

      console.log(
        "Adaptive Re-Test Answers:",
        formattedAnswers
      );

      // -----------------------------------------
      // 1. Submit adaptive re-test
      // -----------------------------------------

      const submitResponse =
        await api.post(
          "/attempts/submit",
          {
            answers: formattedAnswers,

            attemptType:
              "adaptive-retest",

            parentAttemptId:
              originalAttemptId,
          }
        );

      const newAttemptId =
        submitResponse.data.result.attemptId;

      console.log(
        "Adaptive Re-Test Attempt ID:",
        newAttemptId
      );

      // -----------------------------------------
      // 2. Run Performance Engine
      // -----------------------------------------

      const performanceResponse =
        await api.get(
          `performance/${newAttemptId}`
        );

      console.log(
        "Adaptive Performance:",
        performanceResponse.data
      );

      // -----------------------------------------
      // 3. Analyze improvement
      // -----------------------------------------

      const improvementResponse =
        await api.get(
          `adaptive-retest/improvement/${retestId}`
        );

      console.log(
        "Improvement:",
        improvementResponse.data
      );

      // -----------------------------------------
      // 4. Navigate to improvement result
      // -----------------------------------------

      navigate("/improvement-result", {
        state: {
          performance:
            performanceResponse.data.performance,

          improvement:
            improvementResponse.data.improvement,

          retestId,

          originalAttemptId,

          retestAttemptId:
            newAttemptId,

          strategy,
        },
      });
    } catch (error) {
      console.error(
        "Adaptive Re-Test submission error:",
        error
      );

      const message =
        error.response?.data?.message;

      if (message) {
        setError(message);
      } else if (error.request) {
        setError(
          "Cannot connect to the server."
        );
      } else {
        setError(
          error.message ||
            "Failed to submit adaptive re-test."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------
  // No questions
  // -----------------------------------------

  if (!questions.length) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          No adaptive re-test questions found.
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/Hpme")}
        >
          Go Home
        </button>
      </div>
    );
  }

  // -----------------------------------------
  // Missing required IDs
  // -----------------------------------------

  if (!originalAttemptId || !retestId) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Adaptive re-test information is missing.
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">

      {/* -----------------------------------------
          Header
      ----------------------------------------- */}

      <div className="mb-4">
        <h2>Adaptive Re-Test</h2>

        <p className="text-muted">
          This re-test focuses on your identified
          learning gap.
        </p>
      </div>

      {/* -----------------------------------------
          Strategy
      ----------------------------------------- */}

      {strategy && (
        <div className="card mb-4">
          <div className="card-body">

            <h5 className="card-title">
              Adaptive Strategy
            </h5>

            <p className="mb-2">
              <strong>Target Area:</strong>{" "}
              {strategy.targetTopic}
              {" → "}
              {strategy.targetSubtopic}
            </p>

            <p className="mb-2">
              <strong>
                Learning Gap Score:
              </strong>{" "}
              {strategy.gapScore}
            </p>

            <p className="mb-2">
              <strong>
                Current Accuracy:
              </strong>{" "}
              {strategy.currentAccuracy}%
            </p>

            <p className="mb-0">
              <strong>
                Selected Difficulty:
              </strong>{" "}
              {strategy.selectedDifficulty}
            </p>

          </div>
        </div>
      )}

      {/* -----------------------------------------
          Error
      ----------------------------------------- */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* -----------------------------------------
          Progress
      ----------------------------------------- */}

      <div className="mb-3">
        <strong>
          Question {currentIndex + 1} of{" "}
          {questions.length}
        </strong>
      </div>

      {/* -----------------------------------------
          Question Card
      ----------------------------------------- */}

      <div className="card">
        <div className="card-body">

          <h5 className="card-title">
            {currentQuestion.question}
          </h5>

          {/* Options */}

          <div className="mt-4">

            {currentQuestion.options.map(
              (option, index) => {
                const isSelected =
                  answers[
                    currentQuestion._id
                  ] === option;

                return (
                  <button
                    key={index}
                    type="button"
                    className={`btn w-100 text-start mb-2 ${
                      isSelected
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() =>
                      handleAnswerSelect(option)
                    }
                  >
                    {option}
                  </button>
                );
              }
            )}

          </div>

          {/* Navigation */}

          <div className="d-flex justify-content-between mt-4">

            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            {currentIndex <
            questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Re-Test"}
              </button>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}