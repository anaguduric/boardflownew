import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaBuilding,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AcceptInvitation.css";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, token } = useAuth();

  const invitationToken = searchParams.get("token");

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [roleName, setRoleName] = useState("");

  /*
  ============================================================
  PROVERA INVITATION LINKA
  ============================================================
  */

  useEffect(() => {
    if (!invitationToken) {
      setStatus("error");
      setMessage(
        "Link za poziv nije ispravan ili poziv više nije dostupan."
      );
      return;
    }

    setStatus("ready");
  }, [invitationToken]);

  /*
  ============================================================
  REDIRECT NA LOGIN
  ============================================================
  */

  const handleLogin = () => {
    const redirectUrl = `/accept-invitation?token=${encodeURIComponent(
      invitationToken
    )}`;

    navigate(
      `/login?redirect=${encodeURIComponent(redirectUrl)}`
    );
  };

  /*
  ============================================================
  REDIRECT NA REGISTRACIJU
  ============================================================
  */

  const handleRegister = () => {
    const redirectUrl = `/accept-invitation?token=${encodeURIComponent(
      invitationToken
    )}`;

    navigate(
      `/register?redirect=${encodeURIComponent(redirectUrl)}`
    );
  };

  /*
  ============================================================
  PRIHVATANJE POZIVA
  ============================================================
  */

  const handleAcceptInvitation = async () => {
    if (!token) {
      handleLogin();
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch(
        "http://localhost:3000/organizations/invitations/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: invitationToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Nije moguće prihvatiti poziv."
        );
      }

      setRoleName(data.roleName || "");

      setMessage(
        data.message || "Poziv je uspešno prihvaćen."
      );

      setStatus("success");
    } catch (error) {
      console.error(
        "GREŠKA PRI PRIHVATANJU POZIVA:",
        error
      );

      setStatus("error");

      setMessage(
        error.message ||
          "Došlo je do greške prilikom prihvatanja poziva."
      );
    }
  };

  /*
  ============================================================
  CHECKING
  ============================================================
  */

  if (status === "checking") {
    return (
      <div className="accept-invitation-page">
        <div className="accept-invitation-card">
          <div className="accept-invitation-icon">
            <FaBuilding />
          </div>

          <h1>Organization invitation</h1>

          <p>Proveravanje poziva...</p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  SUCCESS
  ============================================================
  */

  if (status === "success") {
    return (
      <div className="accept-invitation-page">
        <div className="accept-invitation-card">
          <div className="accept-invitation-success-icon">
            <FaCheckCircle />
          </div>

          <h1>Invitation accepted</h1>

          <p className="accept-invitation-message">
            {message}
          </p>

          {roleName && (
            <div className="accept-invitation-role">
              <span>Organization role</span>
              <strong>{roleName}</strong>
            </div>
          )}

          <button
            type="button"
            className="accept-invitation-primary"
            onClick={() => navigate("/organizations")}
          >
            Go to organizations
          </button>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (status === "error") {
    return (
      <div className="accept-invitation-page">
        <div className="accept-invitation-card">
          <div className="accept-invitation-error-icon">
            <FaExclamationCircle />
          </div>

          <h1>Invitation problem</h1>

          <p className="accept-invitation-message">
            {message}
          </p>

          {!token && invitationToken && (
            <div className="accept-invitation-auth-actions">
              <button
                type="button"
                className="accept-invitation-primary"
                onClick={handleRegister}
              >
                Create account
              </button>

              <button
                type="button"
                className="accept-invitation-secondary"
                onClick={handleLogin}
              >
                Log in
              </button>
            </div>
          )}

          {token && (
            <button
              type="button"
              className="accept-invitation-secondary"
              onClick={() => navigate("/organizations")}
            >
              Back to organizations
            </button>
          )}
        </div>
      </div>
    );
  }

  /*
  ============================================================
  READY
  ============================================================
  */

  return (
    <div className="accept-invitation-page">
      <div className="accept-invitation-card">
        <div className="accept-invitation-icon">
          <FaBuilding />
        </div>

        <h1>Join organization</h1>

        <p className="accept-invitation-message">
          Pozvani ste da se pridružite organizaciji na
          BoardFlow platformi.
        </p>

        {user ? (
          <p className="accept-invitation-user">
            Prijavljeni ste kao{" "}
            <strong>{user.email}</strong>
          </p>
        ) : (
          <>
            <p className="accept-invitation-user">
              Da biste prihvatili poziv, potrebno je da
              imate BoardFlow nalog.
            </p>

            <div className="accept-invitation-auth-actions">
              <button
                type="button"
                className="accept-invitation-primary"
                onClick={handleRegister}
              >
                Create account
              </button>

              <button
                type="button"
                className="accept-invitation-secondary"
                onClick={handleLogin}
              >
                Log in
              </button>
            </div>
          </>
        )}

        {token && (
          <button
            type="button"
            className="accept-invitation-primary"
            onClick={handleAcceptInvitation}
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Accepting..."
              : "Accept invitation"}
          </button>
        )}
      </div>
    </div>
  );
}