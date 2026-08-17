import React, { useState } from "react";
import "./Login.css";
import { useAuth } from "./context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useAuth();      // 👈 GLOBALNI LOGIN
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Greška pri prijavi");
        return;
      }

      // ✅ čuvanje tokena + user-a GLOBALNO
      login(data.token, data.user);

      // ✅ redirekcija bez reload-a
      navigate("/");
    } catch (err) {
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
