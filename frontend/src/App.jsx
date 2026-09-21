import { BrowserRouter, Routes, Route } from "react-router-dom";

import Hero from "./Component/Home/Hero";
import Home from "./Component/Home/Home";

import QuestionPage from "./Component/Question Page/QuestionPage";
// import AdaptiveRetestPage from "./Component/Adaptive Retest/AdaptiveRetestPage";
import ImprovementResult from "./Component/Adaptive Retest/ImprovementResult";
import PerformanceResult from "./Component/Performance/PerformanceResult";
import AdaptiveRetestPage from "./Component/AdaptiveRetestPage/AdaptiveRetestPage";
import Signin from "./Component/Account/Signin";
import Signup from "./Component/Account/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/Home" element={<Home />} />

        
<Route path="/questions" element={<QuestionPage />} />
<Route
  path="/performance/:attemptId"
  element={<PerformanceResult />}
/>

<Route
  path="/adaptive-retest/:attemptId"
  element={<AdaptiveRetestPage />}
/>

<Route path="/signin" element={<Signin />} />
<Route path="/signup" element={<Signup />} />

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

        
        {/* <Route path="/adaptive-retest" element={<AdaptiveRetestPage />} /> */}

        <Route path="/improvement-result" element={<ImprovementResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
