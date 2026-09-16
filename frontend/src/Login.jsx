import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheck,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Neuspešna prijava."
        );
      }

      login(data.token, data.user);

      const redirect = searchParams.get("redirect");

      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setMessage(
        error.message ||
          "Došlo je do greške pri prijavljivanju."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    const redirect = searchParams.get("redirect");

    if (redirect) {
      navigate(
        `/register?redirect=${encodeURIComponent(
          redirect
        )}`
      );
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="login-page">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="login-left">

        <div className="login-shape login-shape-one"></div>
        <div className="login-shape login-shape-two"></div>

        <div className="login-left-content">

          <div className="login-brand">
            <div className="login-brand-logo">
              <img
                src="/logo.png"
                alt="BoardFlow"
              />
            </div>

            <span>BoardFlow</span>
          </div>

          <div className="login-intro">

            <span className="login-small-title">
              WORKSPACE MANAGEMENT
            </span>

            <h1>
              Welcome <span>back.</span>
            </h1>

            <p>
              Continue managing your projects,
              tasks and teams from one simple
              workspace.
            </p>

            <div className="login-features">

              <div className="login-feature">
                <span className="login-feature-icon">
                  <FaCheck />
                </span>

                <span>
                  Organize your projects easily
                </span>
              </div>

              <div className="login-feature">
                <span className="login-feature-icon">
                  <FaCheck />
                </span>

                <span>
                  Collaborate with your team
                </span>
              </div>

              <div className="login-feature">
                <span className="login-feature-icon">
                  <FaCheck />
                </span>

                <span>
                  Keep everything in one place
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="login-right">

        <div className="login-form">

          <div className="login-form-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Login to your BoardFlow account
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="login-form-group">

              <label>
                Email
              </label>

              <div className="login-input-wrapper">

                <FaEnvelope />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-form-group">

              <label>
                Password
              </label>

              <div className="login-input-wrapper password-wrapper">

                <FaLock />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>


            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* ERROR */}

            {message && (
              <div className="error">
                {message}
              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Log in"}
            </button>

          </form>


          {/* REGISTER */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={handleRegister}
            >
              Create account
            </button>

          </div>


          {/* SECURITY */}

          <div className="login-security">

            <FaShieldAlt className="security-icon" />

            <span>
              Your information is securely protected
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}