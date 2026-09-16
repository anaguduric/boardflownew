import { useEffect, useState } from "react";
import { FaTimes, FaEnvelope, FaUserPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./InviteMemberModal.css";

export default function InviteMemberModal({
  organizationId,
  onClose,
  onInvited,
}) {
  const { token } = useAuth();

  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        setError("");

        const response = await fetch(
          `http://localhost:3000/organizations/${organizationId}/roles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Nije moguće učitati organizacione uloge.");
        }

        const data = await response.json();

        setRoles(data);

        if (data.length > 0) {
          setRoleId(String(data[0].role_id));
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (organizationId && token) {
      fetchRoles();
    }
  }, [organizationId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Unesite email adresu.");
      return;
    }

    if (!roleId) {
      setError("Izaberite organizacionu ulogu.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch(
        `http://localhost:3000/organizations/${organizationId}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            roleId: Number(roleId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Greška prilikom slanja poziva."
        );
      }

      setSuccess("Poziv je uspešno poslat.");

      setEmail("");

      if (onInvited) {
        onInvited(data);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal">
        <button
          className="invite-modal-close"
          onClick={onClose}
          type="button"
        >
          <FaTimes />
        </button>

        <div className="invite-modal-header">
          <div className="invite-modal-icon">
            <FaUserPlus />
          </div>

          <div>
            <h2>Invite member</h2>
            <p>
              Pozovite korisnika da se pridruži organizaciji.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="invite-form-group">
            <label htmlFor="invite-email">
              Email address
            </label>

            <div className="invite-input-wrapper">
              <FaEnvelope />

              <input
                id="invite-email"
                type="email"
                placeholder="npr. korisnik@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
              />
            </div>
          </div>

          <div className="invite-form-group">
            <label htmlFor="invite-role">
              Organization role
            </label>

            <select
              id="invite-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={loadingRoles || sending}
            >
              {loadingRoles ? (
                <option value="">
                  Učitavanje uloga...
                </option>
              ) : roles.length === 0 ? (
                <option value="">
                  Nema dostupnih uloga
                </option>
              ) : (
                roles.map((role) => (
                  <option
                    key={role.role_id}
                    value={role.role_id}
                  >
                    {role.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {error && (
            <div className="invite-message invite-error">
              {error}
            </div>
          )}

          {success && (
            <div className="invite-message invite-success">
              {success}
            </div>
          )}

          <div className="invite-modal-actions">
            <button
              type="button"
              className="invite-cancel-btn"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="invite-submit-btn"
              disabled={sending || loadingRoles}
            >
              {sending ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}