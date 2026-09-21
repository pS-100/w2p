import SideBar from "./SideBar";
import QuestionGenerator from "../QuestionGenerator";

import "./Home.css";

export default function Home() {
  return (
    <div className="app-layout">
      <SideBar />

      <main className="main-content">
        <div className="page-content">
          <QuestionGenerator />
        </div>
      </main>
    </div>
  );
}
