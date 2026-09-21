import { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    educationLevel: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  //   const handleSubmit = (e) => {
  //     e.preventDefault();

  //     setError("");

  //     if (
  //       !form.name.trim() ||
  //       !form.email.trim() ||
  //       !form.educationLevel ||
  //       !form.password.trim()
  //     ) {
  //       setError("Please complete all fields.");
  //       return;
  //     }

  //     if (!/\S+@\S+\.\S+/.test(form.email)) {
  //       setError("Enter a valid email address.");
  //       return;
  //     }

  //     if (form.password.length < 6) {
  //       setError("Password must be at least 6 characters.");
  //       return;
  //     }

  //     // Backend registration will be connected here.
  //     console.log("Create account:", form);
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("SIGNUP SUBMITTED");

    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.educationLevel ||
      !form.password.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      console.log("SENDING REGISTER REQUEST");

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: form.name,
          email: form.email,
          educationLevel: form.educationLevel,
          password: form.password,
        },
      );

      // console.log("Registration successful:", response.data);

      console.log("REGISTER RESPONSE:", response.data);

      localStorage.setItem("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Account created → go to new test
      navigate("/Home");
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create account. Please try again.",
      );
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-brand">
          <div className="signup-brand-mark">W</div>

          <div className="signup-brand-name">WeakToPeak</div>
        </div>

        <div className="signup-heading">
          <h1>Create your account</h1>

          <p>Get started with personalized assessments.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="signup-field">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-email">Email</label>

            <input
              id="signup-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="educationLevel">Education level</label>

            <select
              id="educationLevel"
              name="educationLevel"
              value={form.educationLevel}
              onChange={handleChange}
            >
              <option value="">Select your education level</option>

              <optgroup label="School">
                <option value="middle-school">Middle School</option>

                <option value="high-school">High School</option>
              </optgroup>

              <optgroup label="Higher Education">
                <option value="undergraduate">
                  Undergraduate (Bachelor's)
                </option>

                <option value="postgraduate">Postgraduate (Master's)</option>

                <option value="doctoral">Doctoral (PhD)</option>
              </optgroup>
            </select>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-password">Password</label>

            <div className="signup-password-wrapper">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-confirm-password">Confirm password</label>

            <div className="signup-password-wrapper">
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="signup-error">{error}</div>}

          <button type="submit" className="signup-button">
            Create account
          </button>
        </form>

        <div className="signup-login">
          <span>Already have an account?</span>

          <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
