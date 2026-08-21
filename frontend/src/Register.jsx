import React, { useState } from "react";
import "./Register.css";
import OtpVerify from "./OtpVerify";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
} from "react-icons/fa";

function Register() {
  const [step, setStep] = useState("register");
  const [userId, setUserId] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
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

      if (response.ok) {
        setUserId(data.userId);
        setStep("otp");
      } else {
        setMessage(
          data.message || "Greška pri registraciji"
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Server greška");
    }
  };

  // =========================================================
  // OTP
  // =========================================================

  if (step === "otp") {
    return <OtpVerify userId={userId} />;
  }

  return (
    <div className="register-page">

      {/* =====================================================
          LEFT
      ====================================================== */}

      <section className="register-left">

        {/* Dekorativni elementi */}

        <div className="register-shape register-shape-one" />

        <div className="register-shape register-shape-two" />

        <div className="register-shape register-shape-three" />


        <div className="register-left-content">

          {/* BRAND */}

          <Link
            to="/"
            className="register-brand"
          >

            <div className="register-brand-logo">

              <img
                src="/logo.png"
                alt="BoardFlow logo"
              />

            </div>

            <span>
              BoardFlow
            </span>

          </Link>


          {/* INTRO */}

          <div className="register-intro">

            <span className="register-small-title">
              JOIN BOARDflow
            </span>

            <h1>
              Kreiraj nalog.
              <br />
              Počni da radiš <span>pametnije.</span>
            </h1>

            <p>
              Organizuj projekte, poveži svoj tim i
              imaj sve važne informacije na jednom mestu.
            </p>


            {/* BENEFITS */}

            <div className="register-benefits">

              <div className="register-benefit">

                <div className="register-benefit-icon">
                  <FaCheck />
                </div>

                <span>
                  Upravljanje projektima
                </span>

              </div>


              <div className="register-benefit">

                <div className="register-benefit-icon">
                  <FaCheck />
                </div>

                <span>
                  Jednostavna timska saradnja
                </span>

              </div>


              <div className="register-benefit">

                <div className="register-benefit-icon">
                  <FaCheck />
                </div>

                <span>
                  Sve na jednom mestu
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT
      ====================================================== */}

      <section className="register-right">

        <div className="register-form-card">

          {/* FORM HEADER */}

          <div className="register-form-header">

            <div className="register-step">

              <span className="step-active">
                01
              </span>

              <span className="step-line" />

              <span>
                02
              </span>

            </div>


            <h2>
              Kreiraj nalog
            </h2>

            <p>
              Unesi podatke kako bismo kreirali tvoj nalog.
            </p>

          </div>


          {/* FORM */}

          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* USERNAME */}

            <div className="register-form-group">

              <label htmlFor="username">
                Korisničko ime
              </label>

              <div className="register-input-wrapper">

                <FaUser />

                <input
                  id="username"
                  type="text"
                  placeholder="Unesite korisničko ime"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-form-group">

              <label htmlFor="email">
                Email adresa
              </label>

              <div className="register-input-wrapper">

                <FaEnvelope />

                <input
                  id="email"
                  type="email"
                  placeholder="Unesite email adresu"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="password">
                Lozinka
              </label>

              <div className="register-input-wrapper password-wrapper">

                <FaLock />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Kreirajte lozinku"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Sakrij lozinku"
                      : "Prikaži lozinku"
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


            {/* ERROR */}

            {message && (
              <span className="register-error">
                {message}
              </span>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
            >
              Kreiraj nalog
            </button>

          </form>


          {/* LOGIN */}

          <div className="register-login">

            <span>
              Već imaš nalog?
            </span>

            <Link to="/login">
              Prijavi se
            </Link>

          </div>


          {/* SECURITY */}

          <div className="register-security">

            <span className="security-icon">
              🔒
            </span>

            <span>
              Tvoji podaci su zaštićeni
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;