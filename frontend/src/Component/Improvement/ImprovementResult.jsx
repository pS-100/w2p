import { useLocation, useNavigate } from "react-router-dom";
import "./ImprovementResult.css";

export default function ImprovementResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const improvement = location.state?.improvement || null;

  const performance = location.state?.performance || null;

  const strategy = location.state?.strategy || null;

  if (!improvement) {
    return (
      <div className="improvement-page">
        <div className="improvement-error">
          <div className="improvement-error-icon">!</div>

          <h2>Improvement result not found</h2>

          <p>The adaptive re-test result could not be loaded.</p>

          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const before = improvement.before || {};
  const after = improvement.after || {};
  const change = improvement.change || {};

  const target = improvement.target || {};

  const conceptPerformance = improvement.targetConceptPerformance || {};

  const conceptBefore = conceptPerformance.before || null;

  const conceptAfter = conceptPerformance.after || null;

  const conceptChange = conceptPerformance.change || {};

  const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return `${value}${suffix}`;
  };

  const formatChange = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return `${value > 0 ? "+" : ""}${value}${suffix}`;
  };

  const getChangeClass = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (value > 0) return "positive";
    if (value < 0) return "negative";

    return "neutral";
  };

  const getStatusLabel = (status) => {
    if (status === "improved") {
      return "Improved";
    }

    if (status === "needs-more-practice") {
      return "Needs More Practice";
    }

    if (status === "stable") {
      return "Stable";
    }

    return "Insufficient Data";
  };

  return (
    <div className="improvement-page">
      <div className="improvement-container">
        {/* Header */}

        <header className="adaptive-header">
          <button className="home-link" onClick={() => navigate("/Home")}>
            <span>⌂</span>
            Home
          </button>

          <span className="adaptive-badge">ADAPTIVE ASSESSMENT</span>

          <h1>Adaptive Re-Test</h1>

          <p>
            This assessment is personalized from your previous performance and
            learning gaps.
          </p>
        </header>

        {/* Target */}

        <section className="improvement-target">
          <div className="target-icon">↗</div>

          <div>
            <span className="result-label">TARGET LEARNING AREA</span>

            <div className="result-target-path">
              <span>{target.topic || "—"}</span>

              <span>→</span>

              <span>{target.subtopic || "—"}</span>

              <span>→</span>

              <strong>{target.concept || "—"}</strong>
            </div>
          </div>
        </section>

        {/* Summary */}

        <section className="result-summary">
          <span className="result-label">RESULT SUMMARY</span>

          <h2>
            {improvement.interpretation ||
              "Learning progress analysis completed."}
          </h2>

          {strategy?.reasons?.length > 0 && (
            <p>
              The re-test was generated based on previously identified learning
              gaps.
            </p>
          )}
        </section>

        {/* Overall comparison */}

        <section className="result-card">
          <div className="result-card-header">
            <div>
              <span className="result-label">PERFORMANCE</span>

              <h2>Before vs After</h2>
            </div>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Original</th>
                  <th>Re-Test</th>
                  <th>Change</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Accuracy</td>

                  <td>{formatValue(before.accuracy, "%")}</td>

                  <td>{formatValue(after.accuracy, "%")}</td>

                  <td className={getChangeClass(change.accuracy)}>
                    {formatChange(change.accuracy, "%")}
                  </td>
                </tr>

                <tr>
                  <td>Learning Gap Score</td>

                  <td>{formatValue(before.learningGapScore)}</td>

                  <td>{formatValue(after.learningGapScore)}</td>

                  <td className={getChangeClass(change.learningGapScore)}>
                    {formatChange(change.learningGapScore)}
                  </td>
                </tr>

                <tr>
                  <td>Time Efficiency</td>

                  <td>{formatValue(before.timeEfficiency)}</td>

                  <td>{formatValue(after.timeEfficiency)}</td>

                  <td className={getChangeClass(change.timeEfficiency)}>
                    {formatChange(change.timeEfficiency)}
                  </td>
                </tr>

                <tr>
                  <td>Consistency</td>

                  <td>{formatValue(before.consistency)}</td>

                  <td>{formatValue(after.consistency)}</td>

                  <td className={getChangeClass(change.consistency)}>
                    {formatChange(change.consistency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Gap analysis */}

        <section className="result-card">
          <span className="result-label">LEARNING GAP</span>

          <h2>Gap Improvement</h2>

          <div className="gap-value">{formatValue(change.gapImprovement)}</div>

          <p className="result-description">
            A positive value means the learning gap score decreased after the
            adaptive re-test.
          </p>
        </section>

        {/* Target concept */}

        <section className="result-card">
          <div className="result-card-header">
            <div>
              <span className="result-label">TARGET CONCEPT</span>

              <h2>Concept-Level Progress</h2>
            </div>

            {conceptPerformance.status && (
              <span className={`status-pill ${conceptPerformance.status}`}>
                {getStatusLabel(conceptPerformance.status)}
              </span>
            )}
          </div>

          {!conceptBefore || !conceptAfter ? (
            <div className="insufficient-data">
              <span>i</span>

              <p>Concept-level before/after data is not available yet.</p>
            </div>
          ) : (
            <div className="concept-grid">
              <div className="concept-metric">
                <span>Accuracy</span>

                <strong>{formatValue(conceptBefore.accuracy, "%")}</strong>

                <small className={getChangeClass(conceptChange.accuracy)}>
                  {formatChange(conceptChange.accuracy, "%")}
                </small>
              </div>

              <div className="concept-metric">
                <span>Gap Score</span>

                <strong>{formatValue(conceptBefore.gapScore)}</strong>

                <small className={getChangeClass(conceptChange.gapScore)}>
                  {formatChange(conceptChange.gapScore)}
                </small>
              </div>

              <div className="concept-metric">
                <span>Time Efficiency</span>

                <strong>{formatValue(conceptBefore.timeEfficiency)}</strong>

                <small className={getChangeClass(conceptChange.timeEfficiency)}>
                  {formatChange(conceptChange.timeEfficiency)}
                </small>
              </div>

              <div className="concept-metric">
                <span>Consistency</span>

                <strong>{formatValue(conceptBefore.consistency)}</strong>

                <small className={getChangeClass(conceptChange.consistency)}>
                  {formatChange(conceptChange.consistency)}
                </small>
              </div>
            </div>
          )}
        </section>

        {/* Re-test performance */}

        {performance && (
          <section className="result-card">
            <span className="result-label">RE-TEST PERFORMANCE</span>

            <h2>Current Performance</h2>

            <div className="performance-grid">
              <div>
                <span>Accuracy</span>

                <strong>{formatValue(performance.overallAccuracy, "%")}</strong>
              </div>

              <div>
                <span>Learning Gap</span>

                <strong>{formatValue(performance.learningGapScore)}</strong>
              </div>

              <div>
                <span>Time Efficiency</span>

                <strong>{formatValue(performance.timeEfficiencyScore)}</strong>
              </div>

              <div>
                <span>Consistency</span>

                <strong>{formatValue(performance.consistencyScore)}</strong>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}

        <div className="result-actions">
          <button
            className="result-secondary-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <button
            className="result-primary-button"
            onClick={() => navigate("/")}
          >
            Generate Another Test
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
