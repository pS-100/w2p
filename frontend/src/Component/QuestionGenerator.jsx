import { useState } from "react";
import api from "../api/axios";
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

    if (form.questionCount < 10 || form.questionCount > 20) {
      setError("Question count must be between 10 and 20.");
      return;
    }

    try {
      setLoading(true);
      setQuestions([]);

      console.log("Sending request:", form);

      const response = await api.post(
        "/questions/generate",
        {
          subject: form.subject.trim(),
          topic: form.topic.trim(),
          subtopic: form.subtopic.trim(),
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

      // Every question must have a concept.
      const questionsWithoutConcept = generatedQuestions.filter(
        (question) =>
          !question.concept ||
          typeof question.concept !== "string" ||
          !question.concept.trim(),
      );

      if (questionsWithoutConcept.length > 0) {
        setError(
          "Some generated questions could not be mapped to a learning concept. Please generate the assessment again.",
        );
        return;
      }

      const assessmentId = crypto.randomUUID();

      setQuestions(generatedQuestions);

      navigate("/questions", {
          // replace: true,
        state: {
          questions: generatedQuestions,
           assessmentId,

          assessmentContext: {
            subject: form.subject.trim(),
            topic: form.topic.trim(),
            subtopic: form.subtopic.trim(),
            difficulty: form.difficulty,
          },
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
              Choose what you want to practice and let WeakToPeak generate a
              personalized assessment.
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
              <label htmlFor="difficulty">Difficulty</label>

              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="easy">Easy</option>

                <option value="medium">Medium</option>

                <option value="hard">Hard</option>
              </select>

              <span className="input-hint">
                Select the expected difficulty level.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="questionCount">Number of Questions</label>

              <input
                id="questionCount"
                type="number"
                name="questionCount"
                min="10"
                max="20"
                value={form.questionCount}
                onChange={handleChange}
                disabled={loading}
              />

              <span className="input-hint">
                Choose between 10 and 20 questions.
              </span>
            </div>
          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="generator-error" role="alert">
              <div className="error-icon">!</div>

              <div className="error-content">
                <strong>Unable to generate assessment</strong>

                <p>{error}</p>
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

                <span>Generating Assessment...</span>
              </>
            ) : (
              <>
                <span className="generate-icon">✦</span>

                <span>Generate Assessment</span>
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
                <strong>Creating your assessment</strong>

                <p>
                  AI is generating questions based on your selected subject and
                  topic.
                </p>
              </div>
            </div>
          )}

          {/* =========================
              EMPTY STATE
          ========================= */}

          {!loading && !error && questions.length === 0 && (
            <div className="generator-empty">
              <div className="empty-icon">✦</div>

              <div>
                <strong>Ready to begin?</strong>

                <p>
                  Enter your assessment details and generate your questions.
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
