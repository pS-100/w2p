
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Hero from "./Component/Home/Hero";
import Home from "./Component/Home/Home";

import QuestionPage from "./Component/Question Page/QuestionPage";
import ImprovementResult from "./Component/Improvement/ImprovementResult";
import PerformanceResult from "./Component/Performance/PerformanceResult";
import AdaptiveRetestPage from "./Component/AdaptiveRetestPage/AdaptiveRetestPage";

import Signin from "./Component/Account/Signin";
import Signup from "./Component/Account/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={<Hero />}
        />

        <Route
          path="/Home"
          element={<Home />}
        />

        {/* =================================================
            ASSESSMENT
        ================================================= */}

        <Route
          path="/questions"
          element={<QuestionPage />}
        />

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <Route
          path="/performance/:attemptId"
          element={<PerformanceResult />}
        />

        {/* =================================================
            ADAPTIVE RETEST
        ================================================= */}

        <Route
          path="/adaptive-retest/:attemptId"
          element={<AdaptiveRetestPage />}
        />

        {/* =================================================
            IMPROVEMENT RESULT
        ================================================= */}

        <Route
          path="/improvement-result"
          element={<ImprovementResult />}
        />

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/signin"
          element={<Signin />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* =================================================
            FUTURE PAGES
        ================================================= */}

        <Route
          path="/history"
          // element={<TestHistory />}
        />

        <Route
          path="/profile"
          // element={<Profile />}
        />

        <Route
          path="/settings"
          // element={<Settings />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;