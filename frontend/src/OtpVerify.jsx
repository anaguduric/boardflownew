import React, { useState, useRef } from "react";
import "./OtpVerify.css";

function OtpVerify({ userId }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // samo brojevi
    if (!val) return;

    const newOtp = [...otp];
    newOtp[index] = val[0]; // uzmi prvi broj
    setOtp(newOtp);

    // Automatski fokus na sledeće polje
    if (index < 5) inputRefs.current[index + 1].focus();
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    try {
      const res = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setCanResend(false);
      } else {
        setMessage(data.message || "❌ Pogrešan OTP");
        setCanResend(true);
      }
    } catch {
      setMessage("❌ Server greška");
      setCanResend(true);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setMessage(data.message);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } catch {
      setMessage("❌ Server greška");
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <h2>Verifikacija naloga</h2>
        <form onSubmit={handleVerify} className="otp-form">
          <div className="otp-inputs">
            {otp.map((num, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={num}
                ref={(el) => (inputRefs.current[idx] = el)}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleBackspace(e, idx)}
              />
            ))}
          </div>
          <button type="submit">Verifikuj</button>
        </form>

        {canResend && (
          <button className="resend-btn" onClick={handleResend}>
            Pošalji ponovo kod
          </button>
        )}

        {message && (
          <p className={`message ${message.includes("uspešno") ? "success" : ""}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default OtpVerify;
