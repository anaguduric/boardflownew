import React, { useState } from "react";
import "./Login.css";
import { useAuth } from "./context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Greška pri prijavi");
        return;
      }

      // Čuvanje tokena + korisnika
      login(data.token, data.user);

      // Redirekcija bez reload-a
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Greška servera");
    }
  };

  return (
    <div className="login-page">

      {/* =====================================================
          LEVA STRANA
      ====================================================== */}

      <div className="login-left">

        {/* Dekorativni krugovi */}
        <div className="login-shape login-shape-one"></div>
        <div className="login-shape login-shape-two"></div>

        <div className="login-left-content">

          {/* LOGO + NAZIV */}
          <a href="/" className="login-brand">

            <div className="login-brand-logo">
              <img
                src="/logo.png"
                alt="BoardFlow logo"
              />
            </div>

            <span>BoardFlow</span>

          </a>


          {/* UVODNI TEKST */}
          <div className="login-intro">

            <span className="login-small-title">
              PROJECT MANAGEMENT
            </span>

            <h1>
              Organizuj projekte.
              <br />
              Radi <span>pametnije.</span>
            </h1>

            <p>
              Jednostavno upravljaj projektima, timovima i
              zadacima na jednom mestu.
            </p>


            {/* FEATURES */}
            <div className="login-features">

              <div className="login-feature">

                <div className="login-feature-icon">
                  ✓
                </div>

                <span>
                  Organizacija projekata i zadataka
                </span>

              </div>


              <div className="login-feature">

                <div className="login-feature-icon">
                  ✓
                </div>

                <span>
                  Efikasan rad u timu
                </span>

              </div>


              <div className="login-feature">

                <div className="login-feature-icon">
                  ✓
                </div>

                <span>
                  Sve informacije na jednom mestu
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          DESNA STRANA
      ====================================================== */}

      <div className="login-right">

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* HEADER */}
          <div className="login-form-header">

            <h2>
              Dobro došla nazad
            </h2>

            <p>
              Prijavi se na svoj BoardFlow nalog
            </p>

          </div>


          {/* EMAIL */}
          <div className="login-form-group">

            <label htmlFor="email">
              Email
            </label>

            <div className="login-input-wrapper">

              <input
                id="email"
                type="email"
                placeholder="Unesite email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

          </div>


          {/* PASSWORD */}
          <div className="login-form-group">

            <label htmlFor="password">
              Lozinka
            </label>

            <div className="login-input-wrapper password-wrapper">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Unesite lozinku"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Sakrij lozinku"
                    : "Prikaži lozinku"
                }
              >
                {showPassword ? "◉" : "○"}
              </button>

            </div>

          </div>


          {/* OPCIJE */}
          <div className="login-options">

            <label className="remember-me">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              <span>
                Zapamti me
              </span>

            </label>


            <a
              href="#"
              className="forgot-password"
              onClick={(e) => e.preventDefault()}
            >
              Zaboravljena lozinka?
            </a>

          </div>


          {/* LOGIN BUTTON */}
          <button type="submit">
            Prijavi se
          </button>


          {/* ERROR */}
          {message && (
            <span className="error">
              {message}
            </span>
          )}


          {/* REGISTER */}
          <div className="login-register">

            Nemaš nalog?

            <a href="/register">
              Registruj se
            </a>

          </div>


          {/* SECURITY */}
          <div className="login-security">

            <span>🔒</span>

            <span>
              Tvoji podaci su sigurni
            </span>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Login;