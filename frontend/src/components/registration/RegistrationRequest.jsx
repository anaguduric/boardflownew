import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="registration-card">

        <div className="registration-header">
          <h1>Pridruži se BoardFlow-u</h1>
          <p>
            Pošaljite zahtev za kreiranje naloga i organizacije.
          </p>
        </div>

        {message && (
          <div className="registration-success">
            {message}
          </div>
        )}

        {error && (
          <div className="registration-error">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit}>

            <div className="form-row">
              <div className="form-group">
                <label>Ime</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Unesite ime"
                  required
                />
              </div>

              <div className="form-group">
                <label>Prezime</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Unesite prezime"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Korisničko ime</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Unesite korisničko ime"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Unesite email"
                required
              />
            </div>

            <div className="form-group">
              <label>Lozinka</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Unesite lozinku"
                minLength={6}
                required
              />
            </div>

            <div className="registration-divider">
              <span>Podaci o organizaciji</span>
            </div>

            <div className="form-group">
              <label>Naziv organizacije</label>
              <input
                type="text"
                name="organization_name"
                value={form.organization_name}
                onChange={handleChange}
                placeholder="Unesite naziv organizacije"
                required
              />
            </div>

            <div className="form-group">
              <label>Opis organizacije</label>
              <textarea
                name="organization_description"
                value={form.organization_description}
                onChange={handleChange}
                placeholder="Kratak opis organizacije (opciono)"
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="registration-button"
              disabled={loading}
            >
              {loading ? "Slanje..." : "Pošalji zahtev"}
            </button>

          </form>
        )}

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/login")}
        >
          ← Nazad na prijavu
        </button>

      </div>
    </div>
  );
}