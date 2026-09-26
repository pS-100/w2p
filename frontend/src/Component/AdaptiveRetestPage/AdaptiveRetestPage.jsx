import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./AdaptiveRetestPage.css";

export default function AdaptiveRetestPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [strategy, setStrategy] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [retestId, setRetestId] = useState(null);
  const [generationSource, setGenerationSource] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generationStarted = useRef(false);

  useEffect(() => {
    const loadAdaptiveRetest = async () => {
      if (!attemptId || generationStarted.current) return;

      generationStarted.current = true;

      try {
        setLoading(true);
        setError("");

        const response = await api.post(
          `/adaptive-retest/generate/${attemptId}`,
        );

        console.log("Adaptive Retest Response:", response.data);

        setQuestions(response.data.questions || []);
        setStrategy(response.data.strategy || null);
        setRetestId(response.data.retestId || null);
        setGenerationSource(response.data.generationSource || null);
      } catch (err) {
        console.error("Adaptive re-test generation error:", err);

        setError(
          err.response?.data?.message || "Failed to generate adaptive re-test.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdaptiveRetest();
  }, [attemptId]);

  const handleStartRetest = () => {
    if (!questions.length) {
      setError("No adaptive questions are available.");
      return;
    }

    if (!retestId) {
      setError("Adaptive re-test ID is missing.");
      return;
    }

    navigate("/questions", {
      state: {
        questions,
        assessmentId: crypto.randomUUID(),

        assessmentContext: {
          type: "adaptive-retest",
          sourceAttemptId: attemptId,
          retestId,
          strategy,
        },

        // Keep these for compatibility
        attemptType: "adaptive-retest",
        originalAttemptId: attemptId,
        retestId,
        strategy,
      },
    });
  };

  const handleBack = () => {
    navigate(`/performance/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="adaptive-page">
        <div className="adaptive-loading">
          <div className="adaptive-spinner" />

          <h2>Building your adaptive re-test</h2>

          <p>Analyzing your learning gaps and preparing targeted questions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adaptive-page">
        <div className="adaptive-error">
          <div className="error-icon">!</div>

          <h2>Adaptive Re-Test</h2>

          <p>{error}</p>

          <button className="error-back-button" onClick={handleBack}>
            Back to Performance
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="adaptive-page">
        <div className="adaptive-error">
          <div className="error-icon">!</div>

          <h2>No adaptive questions found</h2>

          <p>
            The system could not prepare questions for the identified learning
            gap.
          </p>

          <button className="error-back-button" onClick={handleBack}>
            Back to Performance
          </button>
        </div>
      </div>
    );
  }

  const targetTopic = strategy?.targetTopic || "—";
  const targetSubtopic = strategy?.targetSubtopic || "—";
  const targetConcept = strategy?.targetConcept || "—";

  const gapScore = strategy?.gapScore !== undefined ? strategy.gapScore : "—";

  const accuracy =
    strategy?.currentAccuracy !== undefined ? strategy.currentAccuracy : "—";

  const timeEfficiency =
    strategy?.currentTimeEfficiency !== undefined
      ? strategy.currentTimeEfficiency
      : "—";

  const consistency =
    strategy?.currentConsistency !== undefined
      ? strategy.currentConsistency
      : "—";

  const difficulty = strategy?.selectedDifficulty || "—";

  const focus = Array.isArray(strategy?.focus) ? strategy.focus : [];

  const reasons = Array.isArray(strategy?.reasons) ? strategy.reasons : [];

  const questionMix = strategy?.questionMix || {};

  return (
    <div className="adaptive-page">
      <div className="adaptive-container">
        {/* Header */}
       <header className="adaptive-header">

  <button
    className="home-link"
    onClick={() => navigate("/Home")}
  >
    <span>←</span>
    Home
  </button>

  <span className="adaptive-badge">
    ADAPTIVE ASSESSMENT
  </span>

  <h1>Adaptive Re-Test</h1>

  <p>
    This assessment is personalized from your previous
    performance and learning gaps.
  </p>

</header>

        {/* Strategy */}
        <section className="strategy-card">
          <div className="strategy-title">
            <div className="strategy-icon">↗</div>

            <div>
              <h2>Why this re-test was generated</h2>

              <p>
                The system identified an area that needs additional practice.
              </p>
            </div>
          </div>

          <div className="target-area">
            <span className="strategy-label">TARGET LEARNING AREA</span>

            <div className="target-path">
              <span>{targetTopic}</span>

              <span className="path-arrow">→</span>

              <span>{targetSubtopic}</span>

              <span className="path-arrow">→</span>

              <strong>{targetConcept}</strong>
            </div>
          </div>

          <div className="strategy-grid">
            <div className="strategy-item">
              <span className="strategy-label">Learning Gap</span>

              <strong>{gapScore}</strong>
            </div>

            <div className="strategy-item">
              <span className="strategy-label">Current Accuracy</span>

              <strong>{accuracy}%</strong>
            </div>

            <div className="strategy-item">
              <span className="strategy-label">Time Efficiency</span>

              <strong>{timeEfficiency}</strong>
            </div>

            <div className="strategy-item">
              <span className="strategy-label">Consistency</span>

              <strong>{consistency}</strong>
            </div>
          </div>

          <div className="strategy-secondary">
            <div>
              <span className="strategy-label">Recommended Difficulty</span>

              <span className="difficulty-pill">{difficulty}</span>
            </div>

            <div>
              <span className="strategy-label">Questions</span>

              <strong>{questions.length}</strong>
            </div>
          </div>

          {focus.length > 0 && (
            <div className="focus-section">
              <span className="strategy-label">PRACTICE FOCUS</span>

              <div className="focus-tags">
                {focus.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>
            </div>
          )}

          {reasons.length > 0 && (
            <div className="reason-section">
              <span className="strategy-label">ADAPTATION REASONS</span>

              <ul>
                {reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Question Preview */}
        <section className="question-preview">
          <div className="preview-header">
            <div>
              <span className="section-eyebrow">PREPARED ASSESSMENT</span>

              <h2>Targeted Questions</h2>
            </div>

            <span className="preview-count">{questions.length} questions</span>
          </div>

          <div className="preview-list">
            {questions.map((question, index) => (
              <div className="preview-question" key={question._id || index}>
                <span className="preview-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <p>{question.question}</p>

                  <div className="preview-meta">
                    {question.difficulty && <span>{question.difficulty}</span>}

                    {question.bloomLevel && <span>{question.bloomLevel}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Question Mix */}
        {(questionMix.easy !== undefined ||
          questionMix.medium !== undefined ||
          questionMix.hard !== undefined) && (
          <section className="mix-card">
            <div>
              <span className="strategy-label">QUESTION MIX</span>

              <div className="mix-items">
                {questionMix.easy !== undefined && (
                  <span>
                    Easy <strong>{questionMix.easy}</strong>
                  </span>
                )}

                {questionMix.medium !== undefined && (
                  <span>
                    Medium <strong>{questionMix.medium}</strong>
                  </span>
                )}

                {questionMix.hard !== undefined && (
                  <span>
                    Hard <strong>{questionMix.hard}</strong>
                  </span>
                )}
              </div>
            </div>

            {generationSource && (
              <span className="generation-source">
                Source: {generationSource}
              </span>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="adaptive-actions">
          <button className="back-button" onClick={handleBack}>
            ← Back to Performance
          </button>

          <button
            className="start-button"
            onClick={handleStartRetest}
            disabled={!retestId}
          >
            Start Adaptive Re-Test
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
