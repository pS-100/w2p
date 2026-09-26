import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

import QuestionCard from "./QuestionCard";

function QuestionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // --------------------------------
  // Assessment data
  // --------------------------------

  const questions = location.state?.questions || [];

  const attemptType = location.state?.attemptType || "standard";

  const originalAttemptId = location.state?.originalAttemptId || null;

  const retestId = location.state?.retestId || null;

  const assessmentId = location.state?.assessmentId || null;

  // --------------------------------
  // Assessment completion key
  // --------------------------------

  const assessmentCompletedKey = assessmentId
    ? `assessment-completed-${assessmentId}`
    : null;

  // --------------------------------
  // State
  // --------------------------------

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [responseTimes, setResponseTimes] = useState({});

  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------
  // Detect already completed assessment
  // --------------------------------

  useEffect(() => {
    if (!assessmentCompletedKey) {
      return;
    }

    const completed = sessionStorage.getItem(assessmentCompletedKey);

    if (completed === "true") {
      navigate("/Home", {
        replace: true,
      });
    }
  }, [assessmentCompletedKey, navigate]);

  // --------------------------------
  // No active assessment
  // --------------------------------

  if (questions.length === 0) {
    return (
      <div className="container mt-5">
        <h2>No active assessment found</h2>

        <p className="text-muted">
          This assessment may have already been completed or the assessment
          session is no longer available.
        </p>

        <button
          className="btn btn-primary mt-3"
          onClick={() =>
            navigate("/Home", {
              replace: true,
            })
          }
        >
          Create New Assessment
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
  // Record question time
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

      setQuestionStartTime(() => Date.now());
    }
  };

  // --------------------------------
  // Submit assessment
  // --------------------------------

  const handleSubmit = async () => {
    setError("");

    // Prevent duplicate clicks
    if (submitting) {
      return;
    }

    if (attemptType === "adaptive-retest") {
      if (!originalAttemptId) {
        setError("Original attempt ID is missing for this adaptive re-test.");
        return;
      }

      if (!retestId) {
        setError("Adaptive re-test ID is missing.");
        return;
      }
    }

    // Check whether this assessment was already completed
    if (assessmentCompletedKey) {
      const alreadyCompleted = sessionStorage.getItem(assessmentCompletedKey);

      if (alreadyCompleted === "true") {
        navigate("/Home", {
          replace: true,
        });

        return;
      }
    }

    // --------------------------------
    // Record final question time
    // --------------------------------

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

      // --------------------------------
      // Submit attempt
      // --------------------------------

      const response = await api.post("/attempts/submit", {
        assessmentId,

        answers: formattedAnswers,

        attemptType: attemptType,

        parentAttemptId:
          attemptType === "adaptive-retest" ? originalAttemptId : undefined,

        retestId: attemptType === "adaptive-retest" ? retestId : undefined,
      });

      console.log("Submit response:", response.data);

      const newAttemptId = response.data.result.attemptId;

      // --------------------------------
      // Mark this assessment completed
      // --------------------------------

      if (assessmentCompletedKey) {
        sessionStorage.setItem(assessmentCompletedKey, "true");
      }

      // --------------------------------
      // Go to performance
      // --------------------------------

      navigate(`/performance/${newAttemptId}`, {
        replace: true,

        state: {
          attemptId: newAttemptId,
          attemptType,
          retestId,
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
  // Current question UI
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
