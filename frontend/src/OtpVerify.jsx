// src/OtpVerify.jsx
import React, { useState } from "react";

function OtpVerify({ userId }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: Number(otp) }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("🎉 Verifikacija uspešna! Sada se možete ulogovati.");
      } else {
        setMessage(data.message || "❌ Pogrešan OTP");
      }
    } catch (error) {
      setMessage("❌ Server greška");
    }
  };

  return (
    <div className="login-container">
      <h2>Verifikacija naloga</h2>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          maxLength={6}
          placeholder="OTP kod"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">Verifikuj</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default OtpVerify;
