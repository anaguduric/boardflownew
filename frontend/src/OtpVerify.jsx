import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./OtpVerify.css";

function OtpVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const redirect = searchParams.get("redirect");

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  /*
  ============================================================
  FOCUS FIRST INPUT
  ============================================================
  */

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  /*
  ============================================================
  OTP INPUT
  ============================================================
  */

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");

    if (!val) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = val[0];

    setOtp(newOtp);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /*
  ============================================================
  BACKSPACE
  ============================================================
  */

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /*
  ============================================================
  PASTE OTP
  ============================================================
  */

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);

    inputRefs.current[nextIndex]?.focus();
  };

  /*
  ============================================================
  VERIFY OTP
  ============================================================
  */

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage(
        "❌ Link za aktivaciju naloga nije ispravan."
      );

      return;
    }

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setMessage("❌ Unesite svih 6 cifara.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch(
        "http://localhost:3000/auth/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: Number(userId),
            otp: otpCode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setSuccess(false);
        setCanResend(true);

        setMessage(
          data.message ||
            "❌ Pogrešan ili istekao OTP kod."
        );

        return;
      }

      /*
      ========================================================
      OTP SUCCESS
      ========================================================
      */

      setSuccess(true);
      setCanResend(false);

      setMessage(
        "Nalog je uspešno aktiviran! Sada možete da se prijavite."
      );

      /*
      ========================================================
      REDIRECT
      ========================================================
      */

      setTimeout(() => {
        if (redirect) {
          navigate(
            `/login?redirect=${encodeURIComponent(
              redirect
            )}`
          );
        } else {
          navigate("/login");
        }
      }, 2500);
    } catch (error) {
      console.error("OTP VERIFY ERROR:", error);

      setSuccess(false);
      setCanResend(true);

      setMessage(
        "❌ Došlo je do greške pri povezivanju sa serverom."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  RESEND OTP
  ============================================================
  */

  const handleResend = async () => {
    if (!userId) {
      setMessage(
        "❌ Link za aktivaciju naloga nije ispravan."
      );

      return;
    }

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch(
        "http://localhost:3000/auth/resend-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: Number(userId),
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(
          "Novi OTP kod je poslat na vaš email."
        );

        setCanResend(false);

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setMessage(
          data.message ||
            "❌ Nije moguće poslati novi kod."
        );
      }
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      setMessage(
        "❌ Došlo je do greške pri povezivanju sa serverom."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  INVALID LINK
  ============================================================
  */

  if (!userId) {
    return (
      <div className="otp-modal-overlay">
        <div className="otp-modal">
          <div className="otp-icon error">
            !
          </div>

          <h2>Neispravan link</h2>

          <p className="otp-description">
            Link za aktivaciju naloga nije ispravan
            ili je nepotpun.
          </p>

          <button
            className="otp-login-button"
            onClick={() => navigate("/login")}
          >
            Nazad na prijavu
          </button>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  MAIN OTP SCREEN
  ============================================================
  */

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <div
          className={`otp-icon ${
            success ? "success" : ""
          }`}
        >
          {success ? "✓" : "✉"}
        </div>

        <h2>Aktivacija naloga</h2>

        <p className="otp-description">
          Unesite 6-cifreni kod koji ste dobili
          na email.
        </p>

        <form
          onSubmit={handleVerify}
          className="otp-form"
        >
          <div
            className="otp-inputs"
            onPaste={handlePaste}
          >
            {otp.map((num, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={num}
                disabled={loading || success}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                onChange={(e) =>
                  handleChange(e, idx)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, idx)
                }
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || success}
          >
            {loading
              ? "Provera..."
              : "Aktiviraj nalog"}
          </button>
        </form>

        {canResend && !success && (
          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={loading}
          >
            Pošalji novi kod
          </button>
        )}

        {message && (
          <p
            className={`message ${
              success ? "success" : ""
            }`}
          >
            {message}
          </p>
        )}

        {success && (
          <p className="redirect-message">
            {redirect
              ? "Nalog je aktiviran. Preusmeravanje na prijavu..."
              : "Preusmeravanje na prijavu..."}
          </p>
        )}
      </div>
    </div>
  );
}

export default OtpVerify;