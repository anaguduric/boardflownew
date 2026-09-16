import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheck,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // ========================================================
    // PROVERA LOZINKE
    // ========================================================

    if (password !== confirmPassword) {
      setMessage("Lozinke se ne poklapaju.");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Lozinka mora imati najmanje 6 karaktera."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // ========================================================
      // PROVERA ODGOVORA SERVERA
      // ========================================================

      if (!response.ok) {
        throw new Error(
          data?.message || "Registracija nije uspela."
        );
      }

      console.log("REGISTER RESPONSE:", data);

      // ========================================================
      // BACKEND VRAĆA:
      //
      // {
      //   message: "...",
      //   userId: 7
      // }
      //
      // Zato ovde uzimamo direktno data.userId
      // ========================================================

      const userId = data?.userId;

      if (!userId) {
        console.error(
          "REGISTER RESPONSE - NEMA USER ID:",
          data
        );

        throw new Error(
          "Registracija je uspešna, ali server nije vratio ID korisnika."
        );
      }

      // ========================================================
      // PREUSMERAVANJE NA OTP
      // ========================================================

      let verifyUrl = `/verify-account?userId=${encodeURIComponent(
        userId
      )}`;

      // Ako je korisnik došao preko invitation linka,
      // sačuvaj redirect kroz OTP.

      if (redirect) {
        verifyUrl += `&redirect=${encodeURIComponent(
          redirect
        )}`;
      }

      console.log(
        "REDIRECT TO OTP:",
        verifyUrl
      );

      navigate(verifyUrl);
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setMessage(
        error.message ||
          "Došlo je do greške pri registraciji."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <section className="register-left">

        <div className="register-shape register-shape-one"></div>

        <div className="register-shape register-shape-two"></div>

        <div className="register-shape register-shape-three"></div>

        <div className="register-left-content">

          {/* BRAND */}

          <Link
            to="/"
            className="register-brand"
          >
            <div className="register-brand-logo">
              <img
                src="/logo.png"
                alt="BoardFlow"
              />
            </div>

            <span>BoardFlow</span>
          </Link>

          {/* INTRO */}

          <div className="register-intro">

            <span className="register-small-title">
              GET STARTED
            </span>

            <h1>
              Build better.
              <br />
              <span>Work smarter.</span>
            </h1>

            <p>
              Create your BoardFlow account and bring
              your projects, tasks and teams together
              in one simple workspace.
            </p>

          </div>

          {/* BENEFITS */}

          <div className="register-benefits">

            <div className="register-benefit">

              <span className="register-benefit-icon">
                <FaCheck />
              </span>

              <span>
                Organize projects and tasks easily
              </span>

            </div>

            <div className="register-benefit">

              <span className="register-benefit-icon">
                <FaCheck />
              </span>

              <span>
                Collaborate with your team
              </span>

            </div>

            <div className="register-benefit">

              <span className="register-benefit-icon">
                <FaCheck />
              </span>

              <span>
                Keep everything in one workspace
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <section className="register-right">

        <div className="register-form-card">

          {/* HEADER */}

          <div className="register-form-header">

            <div className="register-step">

              <span className="step-active">
                1
              </span>

              <div className="step-line"></div>

              <span>
                2
              </span>

            </div>

            <h2>
              Create your account
            </h2>

            <p>
              Enter your details to get started with
              BoardFlow.
            </p>

          </div>


          {/* FORM */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* USERNAME */}

            <div className="register-form-group">

              <label htmlFor="register-username">
                Username
              </label>

              <div className="register-input-wrapper">

                <FaUser />

                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-form-group">

              <label htmlFor="register-email">
                Email
              </label>

              <div className="register-input-wrapper">

                <FaEnvelope />

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-input-wrapper">

                <FaLock />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
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


            {/* CONFIRM PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="register-input-wrapper">

                <FaLock />

                <input
                  id="register-confirm-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />

              </div>

            </div>


            {/* ERROR */}

            {message && (
              <div className="register-error">
                {message}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>


          {/* LOGIN */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            {redirect ? (
              <Link
                to={`/login?redirect=${encodeURIComponent(
                  redirect
                )}`}
              >
                Log in
              </Link>
            ) : (
              <Link to="/login">
                Log in
              </Link>
            )}

          </div>


          {/* SECURITY */}

          <div className="register-security">

            <FaShieldAlt className="security-icon" />

            <span>
              Your information is securely protected
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}