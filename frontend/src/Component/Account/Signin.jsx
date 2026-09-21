import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signin.css";
import axios from "axios";

export default function Signin() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
const navigate = useNavigate();

  const handleEmailNext = (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setStep("password");
  };

  const handleSignIn = async (e) => {

    e.preventDefault();

  setError("");

  if (!password.trim()) {
    setError("Enter your password.");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: email.trim(),
        password,
      }
    );

    console.log(
      "LOGIN RESPONSE:",
      response.data
    );

    // Store authentication data
    localStorage.setItem(
      "token",
      response.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    // Go to New Test
    navigate("/Home");
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    setError(
      error.response?.data?.message ||
        "Unable to sign in. Please try again."
    );
  }

     

    
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        {/* Brand */}
        <div className="signin-brand">
          <div className="signin-brand-mark">W</div>

          <div className="signin-brand-name">WeakToPeak</div>
        </div>

        {step === "email" ? (
          <>
            <div className="signin-heading">
              <h1>Sign in</h1>

              <p>Continue to your assessment</p>
            </div>

            <form onSubmit={handleEmailNext}>
              <div className="signin-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && <div className="signin-error">{error}</div>}

              <div className="signin-helper">
                <span>New to WeakToPeak?</span>

                <Link to="/signup">Create account</Link>
              </div>

              <div className="signin-actions signin-next-action">
                {/* <Link
                  to="/signup"
                  className="signin-secondary-button"
                >
                  Create account
                </Link> */}

                <button type="submit" className="signin-primary-button ">
                  Next
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <button
              type="button"
              className="signin-back"
              onClick={() => {
                setStep("email");
                setError("");
              }}
            >
              <span>←</span>

              <span>{email}</span>
            </button>

            <div className="signin-heading">
              <h1>Enter your password</h1>

              <p>Sign in to continue to WeakToPeak</p>
            </div>

            <form onSubmit={handleSignIn}>
              <div className="signin-field">
                <label htmlFor="password">Password</label>

                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    autoFocus
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && <div className="signin-error">{error}</div>}

              <div className="forgot-password">
                <button
                  type="button"
                  onClick={() => console.log("Forgot password")}
                >
                  Forgot password?
                </button>
              </div>

              <div className="signin-actions password-actions">
                <button
                  type="button"
                  className="signin-secondary-button"
                  onClick={() => {
                    setStep("email");
                    setPassword("");
                    setError("");
                  }}
                >
                  Back
                </button>

                <button type="submit" className="signin-primary-button">
                  Sign in
                </button>
              </div>
            </form>
          </>
        )}

        
      </div>
    </div>
  );
}
