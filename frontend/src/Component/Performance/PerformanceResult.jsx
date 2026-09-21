import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
import "./PerformanceResult.css";
import api from "../../api/axios";

function PerformanceResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const attemptId = location.state?.attemptId;

  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!attemptId) {
        setError("No attempt was found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/performance/${attemptId}`);

        console.log("Performance response:", response.data);

        setPerformance(response.data.performance);
      } catch (error) {
        console.error("Performance fetch error:", error);

        const message =
          error.response?.data?.message ||
          "Failed to load performance analysis.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="performance-page">
        <div className="performance-loading">
          <div className="performance-spinner"></div>

          <h2>Analyzing your performance</h2>

          <p>We're analyzing your answers, response time and learning gaps.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-page">
        <div className="performance-error">
          <div className="error-icon">!</div>

          <h2>Unable to load performance</h2>

          <p>{error}</p>

          <button type="button" onClick={() => navigate("/")}>
            Create New Test
          </button>
        </div>
      </div>
    );
  }

  if (!performance) {
    return null;
  }

  const accuracy = Number(performance.overallAccuracy || 0);

  const learningGap = Number(performance.learningGapScore || 0);

  const timeEfficiency = Number(performance.timeEfficiencyScore || 0);

  const consistency = Number(performance.consistencyScore || 0);

  return (
    <div className="performance-page">
      {/* ================================
          Header
      ================================= */}

      <div className="performance-header">
        <div>
          <span className="performance-eyebrow">PERFORMANCE ANALYSIS</span>

          <h1>Your assessment results</h1>

          <p>Here's what we found from your latest assessment.</p>
        </div>

        <button
          type="button"
          className="new-test-button"
          onClick={() => navigate("/Home")}
        >
          + New Test
        </button>
      </div>

      {/* ================================
          Score Cards
      ================================= */}

      <div className="performance-summary">
        <div className="metric-card primary-metric">
          <span className="metric-label">Overall Accuracy</span>

          <strong className="metric-value">{accuracy.toFixed(1)}%</strong>

          <div className="metric-progress">
            <div
              style={{
                width: `${Math.min(accuracy, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Learning Gap</span>

          <strong className="metric-value">{learningGap.toFixed(1)}</strong>

          <span className="metric-description">Gap score</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Time Efficiency</span>

          <strong className="metric-value">{timeEfficiency.toFixed(1)}</strong>

          <span className="metric-description">Efficiency score</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Consistency</span>

          <strong className="metric-value">{consistency.toFixed(1)}</strong>

          <span className="metric-description">Consistency score</span>
        </div>
      </div>

      {/* ================================
          Analysis
      ================================= */}

      <div className="performance-grid">
        {/* Learning Gaps */}

        <section className="analysis-card">
          <div className="analysis-card-header">
            <div>
              <span className="analysis-label">AREAS TO IMPROVE</span>

              <h2>Learning Gaps</h2>
            </div>

            <span className="analysis-icon warning">!</span>
          </div>

          <div className="analysis-list">
            {performance.learningGaps?.length > 0 ? (
              performance.learningGaps.map((gap, index) => (
                <div className="analysis-item" key={index}>
                  <div className="item-marker warning-marker">!</div>

                  <div>
                    <strong>
                      {typeof gap === "string"
                        ? gap
                        : gap.topic || gap.subtopic || "Learning gap"}
                    </strong>

                    {typeof gap !== "string" && gap.score !== undefined && (
                      <span>Gap score: {gap.score}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-analysis">
                <span>✓</span>

                <p>No significant learning gaps were identified.</p>
              </div>
            )}
          </div>
        </section>

        {/* Strong Concepts */}

        <section className="analysis-card">
          <div className="analysis-card-header">
            <div>
              <span className="analysis-label">PERFORMING WELL</span>

              <h2>Strong Concepts</h2>
            </div>

            <span className="analysis-icon success">✓</span>
          </div>

          <div className="analysis-list">
            {performance.strongConcepts?.length > 0 ? (
              performance.strongConcepts.map((concept, index) => (
                <div className="analysis-item" key={index}>
                  <div className="item-marker success-marker">✓</div>

                  <div>
                    <strong>
                      {typeof concept === "string"
                        ? concept
                        : concept.topic || concept.subtopic || "Strong concept"}
                    </strong>

                    {typeof concept !== "string" &&
                      concept.accuracy !== undefined && (
                        <span>Accuracy: {concept.accuracy}%</span>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-analysis">
                <p>Strong concepts will appear here after analysis.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ================================
          Adaptive Re-test
      ================================= */}

      {performance.learningGaps?.length > 0 && (
        <section className="adaptive-card">
          <div className="adaptive-content">
            <span className="adaptive-label">PERSONALIZED PRACTICE</span>

            <h2>Strengthen your weak areas</h2>

            <p>
              WeakToPeak can generate a new assessment focused on the concepts
              where you need more practice.
            </p>
          </div>

          <button
            type="button"
            className="adaptive-button"
            // onClick={() =>
            //   navigate(
            //     `/adaptive-retest/${attemptId}`,
            //     {
            //       state: {
            //         attemptId,
            //         performance,
            //       },
            //     }
            //   )
            // }
            onClick={() => navigate(`/adaptive-retest/${attemptId}`)}
          >
            Generate Adaptive Re-Test
            <span>→</span>
          </button>
        </section>
      )}
    </div>
  );
}

export default PerformanceResult;
