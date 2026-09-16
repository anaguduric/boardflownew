import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaBuilding,
  FaCheck,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";
import "./RegistrationRequest.css";

export default function RegistrationRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    organization_name: "",
    organization_description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/registration-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Došlo je do greške."
        );
      }

      setMessage(
        "Zahtev je uspešno poslat. Administrator će pregledati vaš zahtev."
      );

      setForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        organization_name: "",
        organization_description: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">

      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header className="registration-navbar">

        <div className="registration-brand">
          <div className="registration-brand-logo">
            <img src="/logo.png" alt="BoardFlow" />
          </div>

          <div className="registration-brand-text">
            <strong>BoardFlow</strong>
            <span>WORKSPACE</span>
          </div>
        </div>

        <div className="registration-nav-actions">
          <button
            type="button"
            className="registration-login-link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            type="button"
            className="registration-nav-button"
            onClick={() => navigate("/login")}
          >
            Get started
          </button>
        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="registration-main">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <section className="registration-hero">

          <div className="hero-circle hero-circle-one"></div>
          <div className="hero-circle hero-circle-two"></div>

          <div className="registration-hero-content">

            <div className="registration-hero-brand">
              <div className="registration-hero-logo">
                <img src="/logo.png" alt="BoardFlow" />
              </div>

              <span>BoardFlow</span>
            </div>

            <div className="registration-hero-text">

              <div className="hero-label">
                WORKSPACE MANAGEMENT
              </div>

              <h1>
                Build your
                <br />
                <span>workspace.</span>
              </h1>

              <p>
                Create your BoardFlow workspace and bring
                your projects, tasks and team together in one
                simple place.
              </p>

            </div>

            <div className="registration-benefits">

              <div className="registration-benefit">
                <span className="benefit-icon">
                  <FaCheck />
                </span>
                <span>Organize your projects easily</span>
              </div>

              <div className="registration-benefit">
                <span className="benefit-icon">
                  <FaCheck />
                </span>
                <span>Collaborate with your team</span>
              </div>

              <div className="registration-benefit">
                <span className="benefit-icon">
                  <FaCheck />
                </span>
                <span>Keep everything in one place</span>
              </div>

            </div>

          </div>
        </section>


        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <section className="registration-form-area">

          <div className="registration-card">

            <div className="registration-header">

              <h2>Create your workspace</h2>

              <p>
                Send a request to create your BoardFlow account
                and organization.
              </p>

            </div>


            {/* SUCCESS */}

            {message && (
              <div className="registration-success">
                <div className="message-icon">
                  <FaCheck />
                </div>

                <div>
                  <strong>Zahtev je poslat</strong>
                  <p>{message}</p>
                </div>
              </div>
            )}


            {/* ERROR */}

            {error && (
              <div className="registration-error">
                {error}
              </div>
            )}


            {!message && (
              <form onSubmit={handleSubmit}>

                {/* =========================================
                    PERSONAL INFORMATION
                ========================================= */}

                <div className="registration-section-title">
                  Account information
                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="first_name">
                      First name
                    </label>

                    <div className="input-wrapper">
                      <FaUser className="input-icon" />

                      <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Your first name"
                        required
                      />
                    </div>

                  </div>


                  <div className="form-group">

                    <label htmlFor="last_name">
                      Last name
                    </label>

                    <div className="input-wrapper">
                      <FaUser className="input-icon" />

                      <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Your last name"
                        required
                      />
                    </div>

                  </div>

                </div>


                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="username">
                      Username
                    </label>

                    <div className="input-wrapper">
                      <FaUser className="input-icon" />

                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        required
                      />
                    </div>

                  </div>


                  <div className="form-group">

                    <label htmlFor="email">
                      Email
                    </label>

                    <div className="input-wrapper">
                      <FaEnvelope className="input-icon" />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                  </div>

                </div>


                <div className="form-group">

                  <label htmlFor="password">
                    Password
                  </label>

                  <div className="input-wrapper">
                    <FaLock className="input-icon" />

                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      minLength={6}
                      required
                    />
                  </div>

                  <span className="input-hint">
                    Password must contain at least 6 characters.
                  </span>

                </div>


                {/* =========================================
                    ORGANIZATION
                ========================================= */}

                <div className="registration-section-title organization-title">
                  Organization
                </div>


                <div className="form-group">

                  <label htmlFor="organization_name">
                    Organization name
                  </label>

                  <div className="input-wrapper">
                    <FaBuilding className="input-icon" />

                    <input
                      id="organization_name"
                      type="text"
                      name="organization_name"
                      value={form.organization_name}
                      onChange={handleChange}
                      placeholder="Enter your organization name"
                      required
                    />
                  </div>

                </div>


                <div className="form-group">

                  <label htmlFor="organization_description">
                    Organization description
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="organization_description"
                    name="organization_description"
                    value={form.organization_description}
                    onChange={handleChange}
                    placeholder="Tell us a little about your organization..."
                    rows="3"
                  />

                </div>


                {/* =========================================
                    SUBMIT
                ========================================= */}

                <button
                  type="submit"
                  className="registration-button"
                  disabled={loading}
                >
                  {loading ? "Sending request..." : "Send registration request"}
                </button>

              </form>
            )}


            {/* =============================================
                FOOTER
            ============================================= */}

            <div className="registration-footer">

              <div className="registration-login-text">
                Already have an account?
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </button>
              </div>

              <div className="registration-security">
                <FaShieldAlt />
                <span>Your information is securely protected</span>
              </div>

            </div>


            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/login")}
            >
              <FaArrowLeft />
              Back to login
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}