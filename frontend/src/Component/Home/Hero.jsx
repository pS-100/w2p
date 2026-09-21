// import { Link } from "react-router-dom";
// export default function Hero() {
//     return(
//         <div className="hero container">
//             <div className="row">
//                 <p>Hello!!</p>
//                 <div className="col"><Link to="/Signin"></Link> Get Start </div>
//                 <div className="col"><button>About us</button></div>

//             </div>
//         </div>
//     );
// }

import { Link } from "react-router-dom";
import "./Hero.css";

export default function Hero() {
  return (
    <main className="hero-page">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Adaptive Assessment
        </div>

        <h1 className="hero-title">
          <span className="title-line">
            <span className="title-word">What</span>
            <span className="title-word">do</span>
            <span className="title-word">you</span>
            <span className="title-word">want</span>
            <span className="title-word">to</span>
          </span>

          <span className="title-line title-muted">
            <span className="title-word">work</span>
            <span className="title-word">on</span>
            <span className="title-word">today?</span>
          </span>
        </h1>

        <p className="hero-subtitle">
          Create an assessment, discover your{" "}
          <span className="subtitle-highlight">weak areas</span>
          ,
          <br />
          and improve with{" "}
          <span className="subtitle-highlight">adaptive practice</span>.
        </p>

        <div className="hero-actions">
          <Link to="/signin" className="hero-action primary">
            {/* <span className="action-icon">+</span> */}

            <strong>Start assessment</strong>

            <span className="action-arrow">→</span>
          </Link>

          <Link to="/about" className="hero-action secondary">
            <span className="action-icon about-icon">i</span>

            <strong>About WeakToPeak</strong>

            <span className="action-arrow">→</span>
          </Link>
        </div>
      </div>

      <div className="hero-footer">
        <span className="footer-item">Spot weakness.</span>
        <span className="footer-dot">·</span>
        <span className="footer-item">Re-test.</span>
        <span className="footer-dot">·</span>
        <span className="footer-item">Reach peak.</span>
      </div>
    </main>
  );
}
