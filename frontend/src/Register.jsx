// src/Register.jsx
import React, { useState } from "react";
import "./Register.css";
import OtpVerify from "./OtpVerify";

function Register() {
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [userId, setUserId] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setStep("otp");
      } else {
        setMessage(data.message || "Greška pri registraciji");
      }
    } catch (error) {
      setMessage("Server greška");
    }
  };

  // OTP korak
  if (step === "otp") {
    return <OtpVerify userId={userId} />;
  }

  return (
    <div className="register-page">
      {/* LEVA STRANA */}
      <div className="register-left">
        <h1>Dobrodošla 👋</h1>
        <p>Kreiraj nalog i započni korišćenje aplikacije</p>
      </div>

      {/* DESNA STRANA */}
      <div className="register-right">
        <div className="register-form">
          <h2>Registracija</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Korisničko ime"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email adresa"
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

            <button type="submit">Registruj se</button>
          </form>

          {message && <span className="register-error">{message}</span>}
        </div>
      </div>
    </div>
  );
}

export default Register;
