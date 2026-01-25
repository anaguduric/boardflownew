// Login.jsx
import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        setMessage(data.message || "Greška pri prijavi");
      }
    } catch {
      setMessage("Greška servera");
    }
  };

  return (
    <div className="login-page">
      {/* LEVA STRANA */}
      <div className="login-left">
        <h1>BoardFlow</h1>
        <p>Organizuj projekte. Radi pametnije.</p>
      </div>

      {/* DESNA STRANA */}
      <div className="login-right">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Prijava</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Prijavi se</button>

          {message && <span className="error">{message}</span>}
        </form>
      </div>
    </div>
  );
}

export default Login;
