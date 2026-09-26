// import { useEffect, useState } from "react";
// import {
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import api from "../../api/axios";
// import "./PerformanceResult.css";

// const PerformanceResult = () => {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // =========================================================
//   // ASSESSMENT CONTEXT
//   // =========================================================

//   const attemptType =
//     location.state?.attemptType || "standard";

//   const retestId =
//     location.state?.retestId || null;

//   // =========================================================
//   // PERFORMANCE STATE
//   // =========================================================

//   const [performance, setPerformance] = useState(null);

//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState("");

//   // =========================================================
//   // ADAPTIVE IMPROVEMENT STATE
//   // =========================================================

//   const [improvementLoading, setImprovementLoading] =
//     useState(false);

//   const [improvementError, setImprovementError] =
//     useState("");

//   // =========================================================
//   // GENERATE MORE STATE
//   // =========================================================

//   const [moreLoading, setMoreLoading] = useState(false);

//   const [moreError, setMoreError] = useState("");

//   // =========================================================
//   // CONTINUE TOPIC STATE
//   // =========================================================

//   const [continueLoading, setContinueLoading] =
//     useState(false);

//   const [continueError, setContinueError] =
//     useState("");

//   // =========================================================
//   // FETCH PERFORMANCE
//   // =========================================================

//   useEffect(() => {
//     const fetchPerformance = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await api.get(
//           `/performance/${attemptId}`
//         );

//         console.log(
//           "Performance response:",
//           response.data
//         );

//         const currentPerformance =
//           response.data.performance;

//         setPerformance(currentPerformance);

//         // =====================================================
//         // ADAPTIVE RETEST
//         // =====================================================
//         //
//         // If this performance belongs to an adaptive retest,
//         // immediately calculate the improvement against the
//         // original performance.
//         //
//         // =====================================================

//         if (
//           attemptType === "adaptive-retest" &&
//           retestId
//         ) {
//           try {
//             setImprovementLoading(true);
//             setImprovementError("");

//             const improvementResponse =
//               await api.get(
//                 `/adaptive-retest/improvement/${retestId}`
//               );

//             console.log(
//               "Improvement response:",
//               improvementResponse.data
//             );

//             const improvement =
//               improvementResponse.data.improvement;

//             // =================================================
//             // GO TO IMPROVEMENT RESULT
//             // =================================================

//             navigate("/improvement-result", {
//               replace: true,
//               state: {
//                 improvement,

//                 performance:
//                   currentPerformance,

//                 strategy:
//                   improvement?.target || null,

//                 retestId,

//                 attemptId,

//                 attemptType,
//               },
//             });
//           } catch (improvementError) {
//             console.error(
//               "Improvement analysis error:",
//               improvementError
//             );

//             setImprovementError(
//               improvementError.response?.data?.message ||
//                 "Performance was calculated, but improvement analysis failed."
//             );
//           } finally {
//             setImprovementLoading(false);
//           }
//         }
//       } catch (error) {
//         console.error(
//           "Performance fetch error:",
//           error
//         );

//         setError(
//           error.response?.data?.message ||
//             "Failed to load performance."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (attemptId) {
//       fetchPerformance();
//     }
//   }, [
//     attemptId,
//     attemptType,
//     retestId,
//     navigate,
//   ]);

//   // =========================================================
//   // CONTINUE TOPIC
//   // =========================================================

//   const handleContinueTopic = async () => {
//     if (continueLoading) return;

//     if (!performance?.coverageId) {
//       setContinueError(
//         "Topic coverage information is not available."
//       );
//       return;
//     }

//     if (
//       !performance?.remainingConcepts ||
//       performance.remainingConcepts.length === 0
//     ) {
//       setContinueError(
//         "There are no remaining concepts to assess."
//       );
//       return;
//     }

//     try {
//       setContinueLoading(true);
//       setContinueError("");

//       const response = await api.post(
//         "/questions/continue",
//         {
//           coverageId: performance.coverageId,
//           difficulty: "medium",
//         }
//       );

//       console.log(
//         "Continue Topic response:",
//         response.data
//       );

//       const generatedQuestions =
//         response.data.questions || [];

//       if (generatedQuestions.length === 0) {
//         throw new Error(
//           "No questions were generated for the remaining concepts."
//         );
//       }

//       const assessmentId =
//         crypto.randomUUID();

//       navigate("/questions", {
//         state: {
//           assessmentId,

//           questions: generatedQuestions,

//           assessmentContext: {
//             subject:
//               generatedQuestions[0].subject,

//             topic:
//               generatedQuestions[0].topic,

//             subtopic:
//               generatedQuestions[0].subtopic,

//             difficulty:
//               generatedQuestions[0].difficulty,
//           },
//         },
//       });
//     } catch (error) {
//       console.error(
//         "Continue Topic error:",
//         error
//       );

//       setContinueError(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to continue the topic."
//       );
//     } finally {
//       setContinueLoading(false);
//     }
//   };

//   // =========================================================
//   // GENERATE MORE QUESTIONS
//   // =========================================================

//   const handleGenerateMore = async () => {
//     if (moreLoading) return;

//     try {
//       setMoreLoading(true);
//       setMoreError("");

//       const response = await api.post(
//         "/questions/more",
//         {
//           sourceAttemptId: attemptId,
//         }
//       );

//       console.log(
//         "Generate More response:",
//         response.data
//       );

//       const generatedQuestions =
//         response.data.questions || [];

//       if (generatedQuestions.length === 0) {
//         throw new Error(
//           "No new questions were generated."
//         );
//       }

//       const newAssessmentId =
//         crypto.randomUUID();

//       navigate("/questions", {
//         state: {
//           questions: generatedQuestions,

//           assessmentId:
//             newAssessmentId,

//           assessmentContext: {
//             type: "generate-more",

//             sourceAttemptId:
//               attemptId,

//             difficulty:
//               response.data.assessmentPlan
//                 ?.difficulty || null,

//             concepts:
//               response.data.assessmentPlan
//                 ?.concepts || [],
//           },
//         },
//       });
//     } catch (error) {
//       console.error(
//         "Generate More failed:",
//         error
//       );

//       setMoreError(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to generate more questions. Please try again."
//       );
//     } finally {
//       setMoreLoading(false);
//     }
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="performance-loading">
//         <div className="performance-spinner"></div>

//         <h2>Analyzing your performance</h2>

//         <p>
//           Calculating accuracy, learning gaps,
//           response patterns, and concept
//           performance.
//         </p>
//       </div>
//     );
//   }

//   // =========================================================
//   // ADAPTIVE IMPROVEMENT LOADING
//   // =========================================================

//   if (improvementLoading) {
//     return (
//       <div className="performance-loading">
//         <div className="performance-spinner"></div>

//         <h2>
//           Analyzing your improvement
//         </h2>

//         <p>
//           Comparing your re-test performance
//           with the original assessment.
//         </p>
//       </div>
//     );
//   }

//   // =========================================================
//   // ERROR
//   // =========================================================

//   if (error) {
//     return (
//       <div className="performance-error">
//         <div className="error-icon">
//           !
//         </div>

//         <h2>
//           Unable to load performance
//         </h2>

//         <p>{error}</p>

//         <button
//           onClick={() =>
//             window.location.reload()
//           }
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   // =========================================================
//   // NO PERFORMANCE
//   // =========================================================

//   if (!performance) {
//     return (
//       <div className="performance-error">
//         <div className="error-icon">
//           !
//         </div>

//         <h2>
//           No performance data
//         </h2>

//         <p>
//           Performance information could not
//           be found.
//         </p>

//         <button
//           onClick={() =>
//             navigate("/Home")
//           }
//         >
//           Back Home
//         </button>
//       </div>
//     );
//   }

//   // =========================================================
//   // PERFORMANCE DATA
//   // =========================================================

//   const weakConcepts =
//     performance.weakConcepts || [];

//   const strongConcepts =
//     performance.strongConcepts || [];

//   const learningGaps =
//     performance.learningGaps || [];

//   const conceptPerformance =
//     performance.conceptPerformance || [];

//   const accuracy = Number(
//     performance.overallAccuracy || 0
//   );

//   const learningGap = Number(
//     performance.learningGapScore || 0
//   );

//   const timeEfficiency = Number(
//     performance.timeEfficiencyScore || 0
//   );

//   const consistency = Number(
//     performance.consistencyScore || 0
//   );

//   const confidence = Number(
//     performance.confidenceScore || 0
//   );

//   const remainingConcepts =
//     performance.remainingConcepts || [];

//   // =========================================================
//   // RENDER
//   // =========================================================

//   return (
//     <div className="performance-page">

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div className="performance-header">

//         <div>
//           <div className="performance-eyebrow">
//             ASSESSMENT ANALYSIS
//           </div>

//           <h1>
//             Performance Result
//           </h1>

//           <p>
//             A detailed analysis of your
//             assessment performance and
//             learning patterns.
//           </p>
//         </div>

//         <button
//           className="new-test-button"
//           onClick={() =>
//             navigate("/Home")
//           }
//         >
//           New Test
//         </button>

//       </div>

//       {/* =====================================================
//           ADAPTIVE IMPROVEMENT ERROR
//       ===================================================== */}

//       {improvementError && (
//         <div
//           className="continue-error"
//           style={{
//             marginBottom: "18px",
//           }}
//         >
//           {improvementError}
//         </div>
//       )}

//       {/* =====================================================
//           SUMMARY
//       ===================================================== */}

//       <div className="performance-summary">

//         {/* Accuracy */}

//         <div className="metric-card primary-metric">

//           <div className="metric-label">
//             OVERALL ACCURACY
//           </div>

//           <div className="metric-value">
//             {accuracy}%
//           </div>

//           <div className="metric-progress">

//             <div
//               style={{
//                 width: `${Math.min(
//                   Math.max(
//                     accuracy,
//                     0
//                   ),
//                   100
//                 )}%`,
//               }}
//             />

//           </div>

//         </div>

//         {/* Learning Gap */}

//         <div className="metric-card">

//           <div className="metric-label">
//             LEARNING GAP
//           </div>

//           <div className="metric-value">
//             {learningGap}
//           </div>

//           <div className="metric-description">
//             Lower indicates fewer
//             identified gaps
//           </div>

//         </div>

//         {/* Time Efficiency */}

//         <div className="metric-card">

//           <div className="metric-label">
//             TIME EFFICIENCY
//           </div>

//           <div className="metric-value">
//             {timeEfficiency}%
//           </div>

//           <div className="metric-description">
//             Based on response-time
//             patterns
//           </div>

//         </div>

//         {/* Confidence */}

//         <div className="metric-card">

//           <div className="metric-label">
//             CONFIDENCE
//           </div>

//           <div className="metric-value">
//             {confidence}%
//           </div>

//           <div className="metric-description">
//             Based on available
//             assessment evidence
//           </div>

//         </div>

//       </div>

//       {/* =====================================================
//           ANALYSIS GRID
//       ===================================================== */}

//       <div className="performance-grid">

//         {/* ===================================================
//             LEARNING GAPS
//         =================================================== */}

//         <div className="analysis-card">

//           <div className="analysis-card-header">

//             <div>

//               <div className="analysis-label">
//                 AREAS TO REVIEW
//               </div>

//               <h2>
//                 Learning Gaps
//               </h2>

//             </div>

//             <div className="analysis-icon warning">
//               !
//             </div>

//           </div>

//           {learningGaps.length === 0 ? (
//             <div className="empty-analysis">

//               <span>✓</span>

//               <p>
//                 No learning gaps identified
//                 from this assessment.
//               </p>

//             </div>
//           ) : (
//             <div className="analysis-list">

//               {learningGaps.map(
//                 (gap, index) => (

//                   <div
//                     className="analysis-item"
//                     key={`${gap.concept}-${index}`}
//                   >

//                     <div className="item-marker warning-marker">
//                       {index + 1}
//                     </div>

//                     <div>

//                       <strong>
//                         {gap.concept}
//                       </strong>

//                       <span>
//                         {gap.topic}

//                         {gap.subtopic
//                           ? ` · ${gap.subtopic}`
//                           : ""}

//                         {" · "}

//                         Gap {gap.gapScore}
//                       </span>

//                     </div>

//                   </div>

//                 )
//               )}

//             </div>
//           )}

//         </div>

//         {/* ===================================================
//             WEAK CONCEPTS
//         =================================================== */}

//         <div className="performance-card">

//           <h2>
//             Weak Concepts
//           </h2>

//           <p className="section-description">
//             Concepts where the current
//             evidence indicates difficulty.
//           </p>

//           {weakConcepts.length === 0 ? (
//             <p className="empty-state">
//               No confirmed weak concepts yet.
//               More assessment data is needed.
//             </p>
//           ) : (
//             <div className="concept-list">

//               {weakConcepts.map(
//                 (concept, index) => (

//                   <div
//                     className="concept-item"
//                     key={`${concept.concept}-${index}`}
//                   >

//                     <div className="concept-info">

//                       <h3>
//                         {concept.concept}
//                       </h3>

//                       <p>
//                         {concept.topic} →{" "}
//                         {concept.subtopic}
//                       </p>

//                       <span className="concept-status">
//                         {concept.status}
//                       </span>

//                     </div>

//                     <div className="gap-score">

//                       <span>
//                         Gap Score
//                       </span>

//                       <strong>
//                         {concept.gapScore}
//                       </strong>

//                     </div>

//                   </div>

//                 )
//               )}

//             </div>
//           )}

//         </div>

//         {/* ===================================================
//             STRONG CONCEPTS
//         =================================================== */}

//         <div className="analysis-card">

//           <div className="analysis-card-header">

//             <div>

//               <div className="analysis-label">
//                 AREAS PERFORMING WELL
//               </div>

//               <h2>
//                 Strong Concepts
//               </h2>

//             </div>

//             <div className="analysis-icon success">
//               ✓
//             </div>

//           </div>

//           {strongConcepts.length === 0 ? (
//             <div className="empty-analysis">

//               <span>—</span>

//               <p>
//                 No concepts have enough
//                 evidence to be classified
//                 as strong yet.
//               </p>

//             </div>
//           ) : (
//             <div className="analysis-list">

//               {strongConcepts.map(
//                 (concept, index) => (

//                   <div
//                     className="analysis-item"
//                     key={`${concept.concept}-${index}`}
//                   >

//                     <div className="item-marker success-marker">
//                       ✓
//                     </div>

//                     <div>

//                       <strong>
//                         {concept.concept}
//                       </strong>

//                       <span>
//                         {concept.topic}
//                         {" · "}
//                         Accuracy{" "}
//                         {concept.accuracy}%
//                       </span>

//                     </div>

//                   </div>

//                 )
//               )}

//             </div>
//           )}

//         </div>

//       </div>

//       {/* =====================================================
//           CONCEPT PERFORMANCE
//       ===================================================== */}

//       <div className="analysis-card">

//         <div className="analysis-card-header">

//           <div>

//             <div className="analysis-label">
//               CONCEPT-LEVEL ANALYSIS
//             </div>

//             <h2>
//               Concept Performance
//             </h2>

//           </div>

//           <div className="analysis-icon">
//             {conceptPerformance.length}
//           </div>

//         </div>

//         {conceptPerformance.length === 0 ? (
//           <div className="empty-analysis">

//             <span>—</span>

//             <p>
//               No concept-level performance
//               data is available.
//             </p>

//           </div>
//         ) : (
//           <div className="analysis-list">

//             {conceptPerformance.map(
//               (concept, index) => {

//                 const status =
//                   concept.status ||
//                   "insufficient-data";

//                 const statusText =
//                   status ===
//                   "insufficient-data"
//                     ? "Insufficient data"
//                     : status;

//                 return (
//                   <div
//                     className="analysis-item"
//                     key={`${concept.concept}-${index}`}
//                   >

//                     <div
//                       className={`item-marker ${
//                         status === "weak"
//                           ? "warning-marker"
//                           : "success-marker"
//                       }`}
//                     >
//                       {index + 1}
//                     </div>

//                     <div>

//                       <strong>
//                         {concept.concept}
//                       </strong>

//                       <span>

//                         {concept.topic}

//                         {concept.subtopic
//                           ? ` · ${concept.subtopic}`
//                           : ""}

//                         {" · "}

//                         Accuracy{" "}
//                         {concept.accuracy}%

//                         {" · "}

//                         {statusText}

//                       </span>

//                     </div>

//                   </div>
//                 );
//               }
//             )}

//           </div>
//         )}

//       </div>

//       {/* =====================================================
//           PERFORMANCE DETAILS
//       ===================================================== */}

//       <div
//         className="performance-grid"
//         style={{
//           marginTop: "18px",
//         }}
//       >

//         {/* Consistency */}

//         <div className="analysis-card">

//           <div className="analysis-card-header">

//             <div>

//               <div className="analysis-label">
//                 RESPONSE ANALYSIS
//               </div>

//               <h2>
//                 Consistency
//               </h2>

//             </div>

//             <div className="analysis-icon">
//               {Math.round(
//                 consistency
//               )}
//             </div>

//           </div>

//           <div className="metric-value">
//             {consistency}%
//           </div>

//           <div className="metric-description">
//             Response-time consistency
//             across the assessment.
//           </div>

//         </div>

//         {/* Attempt Details */}

//         <div className="analysis-card">

//           <div className="analysis-card-header">

//             <div>

//               <div className="analysis-label">
//                 ASSESSMENT SUMMARY
//               </div>

//               <h2>
//                 Attempt Details
//               </h2>

//             </div>

//             <div className="analysis-icon">
//               ✓
//             </div>

//           </div>

//           <div className="analysis-list">

//             <div className="analysis-item">

//               <div>

//                 <strong>
//                   Score
//                 </strong>

//                 <span>
//                   {performance.score} /{" "}
//                   {performance.totalQuestions}
//                 </span>

//               </div>

//             </div>

//             <div className="analysis-item">

//               <div>

//                 <strong>
//                   Average Response Time
//                 </strong>

//                 <span>
//                   {performance.averageResponseTime}s
//                 </span>

//               </div>

//             </div>

//             <div className="analysis-item">

//               <div>

//                 <strong>
//                   Attempted Questions
//                 </strong>

//                 <span>
//                   {performance.attemptedQuestions} /{" "}
//                   {performance.totalQuestions}
//                 </span>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//       {/* =====================================================
//           CONTINUE TOPIC
//       ===================================================== */}

//       {remainingConcepts.length > 0 && (
//         <div className="continue-card">

//           <div>

//             <div className="continue-label">
//               TOPIC COVERAGE
//             </div>

//             <h2>
//               Continue exploring this topic
//             </h2>

//             <p>
//               You have{" "}
//               {remainingConcepts.length}{" "}
//               concept
//               {remainingConcepts.length !== 1
//                 ? "s"
//                 : ""}{" "}
//               that have not been assessed
//               yet. Continue the assessment
//               to cover the remaining
//               concepts.
//             </p>

//             <div className="remaining-concepts">

//               {remainingConcepts.map(
//                 (concept, index) => (

//                   <span
//                     className="remaining-concept"
//                     key={`${concept}-${index}`}
//                   >
//                     {concept}
//                   </span>

//                 )
//               )}

//             </div>

//             {continueError && (
//               <p className="continue-error">
//                 {continueError}
//               </p>
//             )}

//           </div>

//           <button
//             className="continue-button"
//             onClick={
//               handleContinueTopic
//             }
//             disabled={
//               continueLoading
//             }
//           >

//             {continueLoading
//               ? "Generating..."
//               : "Continue Topic"}

//             {!continueLoading && (
//               <span>→</span>
//             )}

//           </button>

//         </div>
//       )}

//       {/* =====================================================
//           GENERATE MORE QUESTIONS
//       ===================================================== */}

//       <div className="adaptive-card">

//         <div>

//           <div className="adaptive-label">
//             MORE PRACTICE
//           </div>

//           <h2>
//             Generate More Questions
//           </h2>

//           <p>
//             Practice the same concepts again
//             with a new set of questions. The
//             concepts and difficulty are
//             preserved, but the questions are
//             newly generated.
//           </p>

//           {moreError && (
//             <p className="adaptive-error">
//               {moreError}
//             </p>
//           )}

//         </div>

//         <button
//           className="adaptive-button"
//           onClick={
//             handleGenerateMore
//           }
//           disabled={moreLoading}
//         >

//           {moreLoading
//             ? "Generating..."
//             : "Generate More Questions"}

//           {!moreLoading && (
//             <span>→</span>
//           )}

//         </button>

//       </div>

//       {/* =====================================================
//           ADAPTIVE RETEST
//       ===================================================== */}

//       {attemptType !==
//         "adaptive-retest" && (
//         <div className="adaptive-card">

//           <div>

//             <div className="adaptive-label">
//               NEXT STEP
//             </div>

//             <h2>
//               Strengthen your weaker
//               concepts
//             </h2>

//             <p>
//               Take an adaptive re-test
//               generated from the concepts
//               that need more evidence or
//               improvement. Your new
//               performance will be compared
//               with this assessment.
//             </p>

//           </div>

//           <button
//             className="adaptive-button"
//             onClick={() =>
//               navigate(
//                 `/adaptive-retest/${attemptId}`
//               )
//             }
//           >
//             Start Adaptive Retest

//             <span>→</span>
//           </button>

//         </div>
//       )}

//     </div>
//   );
// };

// export default PerformanceResult;

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import "./PerformanceResult.css";

const PerformanceResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const attemptType = location.state?.attemptType || "standard";

  const retestId = location.state?.retestId || null;

  const [performance, setPerformance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [improvementLoading, setImprovementLoading] = useState(false);

  const [improvementError, setImprovementError] = useState("");

  const [moreLoading, setMoreLoading] = useState(false);

  const [moreError, setMoreError] = useState("");

  const [continueLoading, setContinueLoading] = useState(false);

  const [continueError, setContinueError] = useState("");

  // =========================================================
  // FETCH PERFORMANCE
  // =========================================================

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/performance/${attemptId}`);

        console.log("Performance response:", response.data);

        const currentPerformance = response.data.performance;

        setPerformance(currentPerformance);

        // =====================================================
        // ADAPTIVE RETEST
        // =====================================================

        if (attemptType === "adaptive-retest" && retestId) {
          try {
            setImprovementLoading(true);
            setImprovementError("");

            const improvementResponse = await api.get(
              `/adaptive-retest/improvement/${retestId}`,
            );

            console.log("Improvement response:", improvementResponse.data);

            const improvement = improvementResponse.data.improvement;

            navigate("/improvement-result", {
              replace: true,
              state: {
                improvement,
                performance: currentPerformance,
                strategy: improvement?.target || null,
                retestId,
                attemptId,
                attemptType,
              },
            });
          } catch (improvementError) {
            console.error("Improvement analysis error:", improvementError);

            setImprovementError(
              improvementError.response?.data?.message ||
                "Performance was calculated, but improvement analysis failed.",
            );
          } finally {
            setImprovementLoading(false);
          }
        }
      } catch (error) {
        console.error("Performance fetch error:", error);

        setError(
          error.response?.data?.message || "Failed to load performance.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchPerformance();
    }
  }, [attemptId, attemptType, retestId, navigate]);

  // =========================================================
  // CONTINUE TOPIC
  // =========================================================

  const handleContinueTopic = async () => {
    if (continueLoading) return;

    if (!performance?.coverageId) {
      setContinueError("Topic coverage information is not available.");
      return;
    }

    if (
      !performance?.remainingConcepts ||
      performance.remainingConcepts.length === 0
    ) {
      setContinueError("There are no remaining concepts to assess.");
      return;
    }

    try {
      setContinueLoading(true);
      setContinueError("");

      const response = await api.post("/questions/continue", {
        coverageId: performance.coverageId,
        difficulty: "medium",
      });

      const generatedQuestions = response.data.questions || [];

      if (generatedQuestions.length === 0) {
        throw new Error(
          "No questions were generated for the remaining concepts.",
        );
      }

      const assessmentId = crypto.randomUUID();

      navigate("/questions", {
        state: {
          assessmentId,
          questions: generatedQuestions,

          assessmentContext: {
            subject: generatedQuestions[0].subject,

            topic: generatedQuestions[0].topic,

            subtopic: generatedQuestions[0].subtopic,

            difficulty: generatedQuestions[0].difficulty,
          },
        },
      });
    } catch (error) {
      console.error("Continue Topic error:", error);

      setContinueError(
        error.response?.data?.message ||
          error.message ||
          "Failed to continue the topic.",
      );
    } finally {
      setContinueLoading(false);
    }
  };

  // =========================================================
  // GENERATE MORE
  // =========================================================

  const handleGenerateMore = async () => {
    if (moreLoading) return;

    try {
      setMoreLoading(true);
      setMoreError("");

      const response = await api.post("/questions/more", {
        sourceAttemptId: attemptId,
      });

      const generatedQuestions = response.data.questions || [];

      if (generatedQuestions.length === 0) {
        throw new Error("No new questions were generated.");
      }

      const newAssessmentId = crypto.randomUUID();

      navigate("/questions", {
        state: {
          questions: generatedQuestions,

          assessmentId: newAssessmentId,

          assessmentContext: {
            type: "generate-more",

            sourceAttemptId: attemptId,

            difficulty: response.data.assessmentPlan?.difficulty || null,

            concepts: response.data.assessmentPlan?.concepts || [],
          },
        },
      });
    } catch (error) {
      console.error("Generate More failed:", error);

      setMoreError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate more questions. Please try again.",
      );
    } finally {
      setMoreLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="performance-loading">
        <div className="performance-spinner" />

        <h2>Analyzing your performance</h2>

        <p>Reviewing your answers, response patterns, and learning gaps.</p>
      </div>
    );
  }

  // =========================================================
  // IMPROVEMENT LOADING
  // =========================================================

  if (improvementLoading) {
    return (
      <div className="performance-loading">
        <div className="performance-spinner" />

        <h2>Analyzing your improvement</h2>

        <p>Comparing your re-test with your original assessment.</p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="performance-error">
        <div className="error-icon">!</div>

        <h2>Unable to load performance</h2>

        <p>{error}</p>

        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="performance-error">
        <div className="error-icon">!</div>

        <h2>No performance data</h2>

        <p>Performance information could not be found.</p>

        <button onClick={() => navigate("/Home")}>Back Home</button>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const weakConcepts = performance.weakConcepts || [];

  const strongConcepts = performance.strongConcepts || [];

  const learningGaps = performance.learningGaps || [];

  const conceptPerformance = performance.conceptPerformance || [];

  const remainingConcepts = performance.remainingConcepts || [];

  const accuracy = Number(performance.overallAccuracy || 0);

  const learningGap = Number(performance.learningGapScore || 0);

  const timeEfficiency = Number(performance.timeEfficiencyScore || 0);

  const consistency = Number(performance.consistencyScore || 0);

  const confidence = Number(performance.confidenceScore || 0);

  const accuracyMessage =
    accuracy >= 80
      ? "Strong overall understanding"
      : accuracy >= 60
        ? "Developing understanding"
        : "More practice recommended";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="performance-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="performance-header">
        <div>
          <div className="performance-eyebrow">ASSESSMENT ANALYSIS</div>

          <h1>Performance Result</h1>

          <p>Here's what your assessment performance tells you.</p>
        </div>
        <div>
          <button className="home-link" onClick={() => navigate("/Home")} style={{"font-size":"14px" }}>
            <span>⌂</span>
            Home
          </button>
        <button className="new-test-button" onClick={() => navigate("/Home")} style={{"margin-left":"15px"}}>
          New Test
        </button>

         
          </div>
      </header>

      {/* =====================================================
          ADAPTIVE ERROR
      ===================================================== */}

      {improvementError && (
        <div className="result-notice">
          <span>!</span>

          <div>
            <strong>Improvement analysis unavailable</strong>

            <p>{improvementError}</p>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN RESULT
      ===================================================== */}

      <section className="result-overview">
        <div className="result-main">
          <div className="result-eyebrow">YOUR OVERALL PERFORMANCE</div>

          <div className="result-score-row">
            <div className="result-score">
              {Math.round(accuracy)}
              <span>%</span>
            </div>

            <div className="result-score-info">
              <strong>{accuracyMessage}</strong>

              <p>
                {performance.score} correct out of {performance.totalQuestions}{" "}
                questions.
              </p>
            </div>
          </div>

          <div className="result-progress">
            <div
              style={{
                width: `${Math.min(Math.max(accuracy, 0), 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="result-side">
          <div className="mini-stat">
            <span>Learning gap</span>
            <strong>{learningGap}</strong>
            <small>Lower is better</small>
          </div>

          <div className="mini-stat">
            <span>Confidence</span>
            <strong>{confidence}%</strong>
            <small>Based on available evidence</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT THIS MEANS
      ===================================================== */}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-kicker">UNDERSTANDING YOUR RESULT</span>

            <h2>What needs your attention?</h2>
          </div>
        </div>

        <div className="attention-grid">
          <div className="attention-card">
            <div className="attention-number">{learningGaps.length}</div>

            <div>
              <span className="attention-label">LEARNING GAPS</span>

              <h3>Areas to review</h3>

              <p>These areas may need more practice based on your answers.</p>
            </div>
          </div>

          <div className="attention-card">
            <div className="attention-number">{weakConcepts.length}</div>

            <div>
              <span className="attention-label">NEEDS MORE PRACTICE</span>

              <h3>Concepts to practice</h3>

              <p>
                Your answers suggest that these concepts need more practice.
              </p>
            </div>
          </div>

          <div className="attention-card">
            <div className="attention-number">{strongConcepts.length}</div>

            <div>
              <span className="attention-label">DOING WELL</span>

              <h3>Concepts you understand well</h3>

              <p>Your answers show stronger understanding in these areas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING GAPS
      ===================================================== */}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PRIORITY REVIEW</span>

            <h2>Learning gaps</h2>

            <p>Start here if you want to improve your next attempt.</p>
          </div>

          <span className="section-count">{learningGaps.length}</span>
        </div>

        {learningGaps.length === 0 ? (
          <div className="clean-empty">
            <div className="empty-check">✓</div>

            <div>
              <strong>No significant learning gaps identified</strong>

              <p>
                Continue practicing to collect more evidence about your
                understanding.
              </p>
            </div>
          </div>
        ) : (
          <div className="gap-list">
            {learningGaps.map((gap, index) => (
              <div className="gap-row" key={`${gap.concept}-${index}`}>
                <div className="gap-index">{index + 1}</div>

                <div className="gap-content">
                  <strong>{gap.concept}</strong>

                  <span>
                    {gap.topic}
                    {gap.subtopic ? ` · ${gap.subtopic}` : ""}
                  </span>
                </div>

                <div className="gap-value">
                  <small>Gap</small>
                  <strong>{gap.gapScore}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          CONCEPT PERFORMANCE
      ===================================================== */}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-kicker">DETAILED BREAKDOWN</span>

            <h2>Concept performance</h2>

            <p>See how each assessed concept performed.</p>
          </div>

          <span className="section-count">{conceptPerformance.length}</span>
        </div>

        {conceptPerformance.length === 0 ? (
          <div className="clean-empty">
            <p>No concept-level data is available.</p>
          </div>
        ) : (
          <div className="concept-table">
            {conceptPerformance.map((concept, index) => {
              const conceptAccuracy = Number(concept.accuracy || 0);

              const status = concept.status || "insufficient-data";

              return (
                <div
                  className="concept-row"
                  key={`${concept.concept}-${index}`}
                >
                  <div className="concept-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="concept-main">
                    <strong>{concept.concept}</strong>

                    <span>
                      {concept.topic}
                      {concept.subtopic ? ` · ${concept.subtopic}` : ""}
                    </span>
                  </div>

                  <div className="concept-accuracy">
                    <div>
                      <span>Accuracy</span>

                      <strong>{conceptAccuracy}%</strong>
                    </div>

                    <div className="small-progress">
                      <div
                        style={{
                          width: `${Math.min(
                            Math.max(conceptAccuracy, 0),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={`concept-status ${
                      status === "weak"
                        ? "status-warning"
                        : status === "strong"
                          ? "status-success"
                          : ""
                    }`}
                  >
                    {status === "insufficient-data" ? "More evidence" : status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          SUPPORTING METRICS
      ===================================================== */}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SUPPORTING METRICS</span>

            <h2>How you performed</h2>
          </div>
        </div>

        <div className="support-grid">
          <div className="support-card">
            <span>TIME EFFICIENCY</span>
            <strong>{timeEfficiency}%</strong>
            <p>Based on response-time patterns.</p>
          </div>

          <div className="support-card">
            <span>CONSISTENCY</span>
            <strong>{Math.round(consistency)}%</strong>
            <p>How consistent your response times were.</p>
          </div>

          <div className="support-card">
            <span>AVERAGE RESPONSE</span>
            <strong>{performance.averageResponseTime}s</strong>
            <p>Average time spent per question.</p>
          </div>

          <div className="support-card">
            <span>ATTEMPTED</span>
            <strong>
              {performance.attemptedQuestions}/{performance.totalQuestions}
            </strong>
            <p>Questions answered in this assessment.</p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTINUE TOPIC
      ===================================================== */}

      {remainingConcepts.length > 0 && (
        <section className="next-action continue-action">
          <div className="next-action-content">
            <span className="section-kicker">TOPIC COVERAGE</span>

            <h2>Continue exploring this topic</h2>

            <p>
              {remainingConcepts.length} concept
              {remainingConcepts.length !== 1 ? "s remain" : " remains"}{" "}
              unassessed. Continue to discover how you perform across the full
              topic.
            </p>

            <div className="remaining-concepts">
              {remainingConcepts.map((concept, index) => (
                <span key={`${concept}-${index}`}>{concept}</span>
              ))}
            </div>

            {continueError && <p className="action-error">{continueError}</p>}
          </div>

          <button
            className="next-action-button"
            onClick={handleContinueTopic}
            disabled={continueLoading}
          >
            {continueLoading ? "Generating..." : "Continue Topic"}

            {!continueLoading && <span>→</span>}
          </button>
        </section>
      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <section className="section-block actions-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">NEXT STEPS</span>

            <h2>What would you like to do?</h2>

            <p>Choose based on what you want to practice next.</p>
          </div>
        </div>

        <div className="action-grid">
          {/* Generate More */}

          <div className="action-card">
            <div className="action-card-top">
              <span className="action-icon">+</span>

              <span className="action-tag">PRACTICE</span>
            </div>

            <h3>Generate more questions</h3>

            <p>
              Practice the same concepts again using a fresh set of questions.
            </p>

            {moreError && <p className="action-error">{moreError}</p>}

            <button
              className="secondary-action"
              onClick={handleGenerateMore}
              disabled={moreLoading}
            >
              {moreLoading ? "Generating..." : "Generate More"}
              {!moreLoading && <span>→</span>}
            </button>
          </div>

          {/* Adaptive Retest */}

          {attemptType !== "adaptive-retest" && (
            <div className="action-card action-card-dark">
              <div className="action-card-top">
                <span className="action-icon">↗</span>

                <span className="action-tag">ADAPTIVE</span>
              </div>

              <h3>Strengthen weak concepts</h3>

              <p>
                Take a focused re-test built around the concepts that need more
                evidence.
              </p>

              <button
                className="primary-action"
                onClick={() => navigate(`/adaptive-retest/${attemptId}`)}
              >
                Start Adaptive Retest
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PerformanceResult;
