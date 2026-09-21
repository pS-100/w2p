import { useLocation, useNavigate } from "react-router-dom";

export default function ImprovementResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const improvement =
    location.state?.improvement || null;

  const performance =
    location.state?.performance || null;

  const strategy =
    location.state?.strategy || null;

  if (!improvement) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Improvement result not found.
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

  const before = improvement.before;
  const after = improvement.after;
  const change = improvement.change;

  return (
    <div className="container mt-5 mb-5">

      {/* -----------------------------------------
          Header
      ----------------------------------------- */}

      <div className="mb-4">
        <h2>Adaptive Re-Test Result</h2>

        <p className="text-muted">
          Comparison of your original test and
          adaptive re-test performance.
        </p>
      </div>

      {/* -----------------------------------------
          Target Area
      ----------------------------------------- */}

      {strategy && (
        <div className="alert alert-info">

          <strong>Target Learning Area:</strong>{" "}

          {strategy.targetTopic}
          {" → "}
          {strategy.targetSubtopic}

        </div>
      )}

      {/* -----------------------------------------
          Interpretation
      ----------------------------------------- */}

      <div className="card mb-4">
        <div className="card-body">

          <h5 className="card-title">
            Result Summary
          </h5>

          <p className="mb-0">
            {improvement.interpretation}
          </p>

        </div>
      </div>

      {/* -----------------------------------------
          Before / After Table
      ----------------------------------------- */}

      <div className="card mb-4">

        <div className="card-body">

          <h5 className="card-title mb-3">
            Before vs After
          </h5>

          <div className="table-responsive">

            <table className="table table-bordered">

              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Original Test</th>
                  <th>Adaptive Re-Test</th>
                  <th>Change</th>
                </tr>
              </thead>

              <tbody>

                {/* Accuracy */}

                <tr>
                  <td>
                    <strong>Accuracy</strong>
                  </td>

                  <td>
                    {before.accuracy}%
                  </td>

                  <td>
                    {after.accuracy}%
                  </td>

                  <td>
                    {change.accuracy >= 0
                      ? "+"
                      : ""}
                    {change.accuracy}%
                  </td>
                </tr>

                {/* Learning Gap */}

                <tr>
                  <td>
                    <strong>
                      Learning Gap Score
                    </strong>
                  </td>

                  <td>
                    {before.learningGapScore}
                  </td>

                  <td>
                    {after.learningGapScore}
                  </td>

                  <td>
                    {change.learningGapScore >= 0
                      ? "+"
                      : ""}
                    {change.learningGapScore}
                  </td>
                </tr>

                {/* Time Efficiency */}

                <tr>
                  <td>
                    <strong>
                      Time Efficiency
                    </strong>
                  </td>

                  <td>
                    {before.timeEfficiency}
                  </td>

                  <td>
                    {after.timeEfficiency}
                  </td>

                  <td>
                    {change.timeEfficiency >= 0
                      ? "+"
                      : ""}
                    {change.timeEfficiency}
                  </td>
                </tr>

                {/* Consistency */}

                <tr>
                  <td>
                    <strong>Consistency</strong>
                  </td>

                  <td>
                    {before.consistency}
                  </td>

                  <td>
                    {after.consistency}
                  </td>

                  <td>
                    {change.consistency >= 0
                      ? "+"
                      : ""}
                    {change.consistency}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* -----------------------------------------
          Learning Gap Improvement
      ----------------------------------------- */}

      <div className="card mb-4">

        <div className="card-body">

          <h5 className="card-title">
            Learning Gap Analysis
          </h5>

          <p className="mb-2">
            <strong>
              Gap Improvement:
            </strong>{" "}
            {change.gapImprovement}
          </p>

          <p className="mb-0">
            A positive value means the learning
            gap score decreased from the original
            assessment.
          </p>

        </div>

      </div>

      {/* -----------------------------------------
          Weak Area Improvement
      ----------------------------------------- */}

      {(change.weakAreaAccuracy !== null ||
        change.weakAreaGapScore !== null) && (
        <div className="card mb-4">

          <div className="card-body">

            <h5 className="card-title">
              Target Weak Area Improvement
            </h5>

            {change.weakAreaAccuracy !== null && (
              <p>
                <strong>
                  Accuracy Change:
                </strong>{" "}
                {change.weakAreaAccuracy >= 0
                  ? "+"
                  : ""}
                {change.weakAreaAccuracy}%
              </p>
            )}

            {change.weakAreaGapScore !== null && (
              <p className="mb-0">
                <strong>
                  Gap Score Change:
                </strong>{" "}
                {change.weakAreaGapScore >= 0
                  ? "+"
                  : ""}
                {change.weakAreaGapScore}
              </p>
            )}

          </div>

        </div>
      )}

      {/* -----------------------------------------
          Current Performance
      ----------------------------------------- */}

      {performance && (
        <div className="card mb-4">

          <div className="card-body">

            <h5 className="card-title">
              Re-Test Performance
            </h5>

            <p>
              <strong>
                Overall Accuracy:
              </strong>{" "}
              {performance.overallAccuracy}%
            </p>

            <p>
              <strong>
                Learning Gap Score:
              </strong>{" "}
              {performance.learningGapScore}
            </p>

            <p>
              <strong>
                Time Efficiency:
              </strong>{" "}
              {performance.timeEfficiencyScore}
            </p>

            <p className="mb-0">
              <strong>
                Consistency:
              </strong>{" "}
              {performance.consistencyScore}
            </p>

          </div>

        </div>
      )}

      {/* -----------------------------------------
          Actions
      ----------------------------------------- */}

      <div className="mt-4">

        <button
          className="btn btn-primary me-2"
          onClick={() => navigate("/")}
        >
          Generate Another Test
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-2)}
        >
          Back
        </button>

      </div>

    </div>
  );
}