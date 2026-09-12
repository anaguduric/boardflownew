import { useEffect, useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaClock,
  FaEye,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Registration.css";

export default function RegistrationRequests() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     UČITAVANJE ZAHTEVA
  ========================================================= */

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:3000/registration-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Greška pri učitavanju zahteva."
        );
      }

      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  /* =========================================================
     ODOBRAVANJE ZAHTEVA
  ========================================================= */

  const approveRequest = async (request) => {
    if (!request) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:3000/registration-requests/${request.request_id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Greška pri odobravanju zahteva."
        );
      }

      setShowApproveModal(false);
      setSelectedRequest(null);

      await fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     ODBIJANJE ZAHTEVA
  ========================================================= */

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const rejectRequest = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:3000/registration-requests/${selectedRequest.request_id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: rejectionReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Greška pri odbijanju zahteva."
        );
      }

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason("");

      await fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";

      case "APPROVED":
        return "status-approved";

      case "REJECTED":
        return "status-rejected";

      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Na čekanju";

      case "APPROVED":
        return "Odobreno";

      case "REJECTED":
        return "Odbijeno";

      default:
        return status;
    }
  };

  /* =========================================================
     DATUM
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="registration-requests-page">
        <div className="requests-loading">
          Učitavanje zahteva...
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="registration-requests-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="requests-header">

        <div>
          <h1>Zahtevi za registraciju</h1>

          <p>
            Pregled i upravljanje zahtevima za kreiranje organizacija.
          </p>
        </div>

        <div className="requests-counter">
          <span>
            {
              requests.filter(
                (request) => request.status === "PENDING"
              ).length
            }
          </span>

          <small>Na čekanju</small>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="requests-error">
          {error}
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {requests.length === 0 ? (
        <div className="empty-requests">

          <FaBuilding />

          <h2>Nema zahteva</h2>

          <p>
            Trenutno nema podnetih zahteva za registraciju.
          </p>

        </div>
      ) : (

        /* ===================================================
           TABLE
        =================================================== */

        <div className="requests-table-wrapper">

          <table className="requests-table">

            <thead>
              <tr>
                <th>Korisnik</th>
                <th>Organizacija</th>
                <th>Email</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Akcije</th>
              </tr>
            </thead>

            <tbody>

              {requests.map((request) => (

                <tr key={request.request_id}>

                  {/* USER */}

                  <td>
                    <div className="request-user">

                      <div className="request-avatar">
                        <FaUser />
                      </div>

                      <div>
                        <strong>
                          {request.first_name}{" "}
                          {request.last_name}
                        </strong>

                        <span>
                          @{request.username}
                        </span>
                      </div>

                    </div>
                  </td>

                  {/* ORGANIZATION */}

                  <td>
                    <div className="organization-info">

                      <FaBuilding />

                      <span>
                        {request.organization_name}
                      </span>

                    </div>
                  </td>

                  {/* EMAIL */}

                  <td>
                    <div className="email-info">

                      <FaEnvelope />

                      {request.email}

                    </div>
                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={`request-status ${getStatusClass(
                        request.status
                      )}`}
                    >

                      {request.status === "PENDING" && (
                        <FaClock />
                      )}

                      {request.status === "APPROVED" && (
                        <FaCheck />
                      )}

                      {request.status === "REJECTED" && (
                        <FaTimes />
                      )}

                      {getStatusText(request.status)}

                    </span>

                  </td>

                  {/* DATE */}

                  <td>
                    <span className="request-date">
                      {formatDate(request.created_at)}
                    </span>
                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="request-actions">

                      {/* VIEW */}

                      <button
                        className="view-request-button"
                        onClick={() =>
                          setSelectedRequest(request)
                        }
                        title="Pregledaj zahtev"
                      >
                        <FaEye />
                      </button>

                      {/* APPROVE */}

                      {request.status === "PENDING" && (
                        <>
                          <button
                            className="approve-button"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveModal(true);
                            }}
                            disabled={actionLoading}
                            title="Odobri zahtev"
                          >
                            <FaCheck />
                          </button>

                          {/* REJECT */}

                          <button
                            className="reject-button"
                            onClick={() =>
                              openRejectModal(request)
                            }
                            disabled={actionLoading}
                            title="Odbij zahtev"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedRequest &&
        !showApproveModal &&
        !showRejectModal && (

          <div
            className="admin-modal-overlay"
            onClick={() => setSelectedRequest(null)}
          >

            <div
              className="admin-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="admin-modal-header">

                <div>
                  <h2>Detalji zahteva</h2>

                  <p>
                    Pregled podataka koje je korisnik uneo.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedRequest(null)
                  }
                >
                  <FaTimes />
                </button>

              </div>

              <div className="request-details">

                {/* USER DETAILS */}

                <div className="detail-section">

                  <h3>
                    <FaUser />
                    Podaci korisnika
                  </h3>

                  <div className="details-grid">

                    <div>
                      <label>Ime</label>

                      <span>
                        {selectedRequest.first_name}
                      </span>
                    </div>

                    <div>
                      <label>Prezime</label>

                      <span>
                        {selectedRequest.last_name}
                      </span>
                    </div>

                    <div>
                      <label>Korisničko ime</label>

                      <span>
                        {selectedRequest.username}
                      </span>
                    </div>

                    <div>
                      <label>Email</label>

                      <span>
                        {selectedRequest.email}
                      </span>
                    </div>

                  </div>

                </div>

                {/* ORGANIZATION DETAILS */}

                <div className="detail-section">

                  <h3>
                    <FaBuilding />
                    Organizacija
                  </h3>

                  <div className="details-grid">

                    <div>
                      <label>Naziv</label>

                      <span>
                        {selectedRequest.organization_name}
                      </span>
                    </div>

                    <div className="full-detail">

                      <label>Opis</label>

                      <span>
                        {selectedRequest.organization_description ||
                          "Nije unet opis."}
                      </span>

                    </div>

                  </div>

                </div>

                {/* STATUS */}

                <div className="detail-section">

                  <h3>Status zahteva</h3>

                  <span
                    className={`request-status ${getStatusClass(
                      selectedRequest.status
                    )}`}
                  >
                    {getStatusText(
                      selectedRequest.status
                    )}
                  </span>

                </div>

              </div>

              {/* ACTIONS */}

              {selectedRequest.status === "PENDING" && (

                <div className="modal-actions">

                  <button
                    className="modal-approve"
                    onClick={() =>
                      setShowApproveModal(true)
                    }
                    disabled={actionLoading}
                  >
                    <FaCheck />
                    Odobri zahtev
                  </button>

                  <button
                    className="modal-reject"
                    onClick={() =>
                      openRejectModal(selectedRequest)
                    }
                    disabled={actionLoading}
                  >
                    <FaTimes />
                    Odbij zahtev
                  </button>

                </div>

              )}

            </div>

          </div>
        )}

      {/* =====================================================
          APPROVE MODAL
      ===================================================== */}

      {showApproveModal && selectedRequest && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setShowApproveModal(false)
          }
        >

          <div
            className="admin-modal approve-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-modal-header">

              <div>
                <h2>Odobri zahtev</h2>

                <p>
                  Da li ste sigurni da želite da odobrite
                  ovaj zahtev?
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowApproveModal(false)
                }
                disabled={actionLoading}
              >
                <FaTimes />
              </button>

            </div>

            <div className="approval-content">

              <div className="approval-icon">
                <FaCheck />
              </div>

              <h3>
                {selectedRequest.organization_name}
              </h3>

              <p>
                Korisnik{" "}
                <strong>
                  {selectedRequest.first_name}{" "}
                  {selectedRequest.last_name}
                </strong>{" "}
                biće kreiran kao vlasnik ove organizacije.
              </p>

              <div className="approval-summary">

                <div>
                  <span>Korisnik</span>

                  <strong>
                    @{selectedRequest.username}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedRequest.email}
                  </strong>
                </div>

                <div>
                  <span>Organizacija</span>

                  <strong>
                    {selectedRequest.organization_name}
                  </strong>
                </div>

                <div>
                  <span>Uloga</span>

                  <strong>
                    Organization Owner
                  </strong>
                </div>

              </div>

            </div>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setShowApproveModal(false)
                }
                disabled={actionLoading}
              >
                Otkaži
              </button>

              <button
                className="modal-approve"
                onClick={() =>
                  approveRequest(selectedRequest)
                }
                disabled={actionLoading}
              >
                <FaCheck />

                {actionLoading
                  ? "Odobravanje..."
                  : "Da, odobri zahtev"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {showRejectModal && selectedRequest && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setShowRejectModal(false)
          }
        >

          <div
            className="admin-modal reject-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-modal-header">

              <div>
                <h2>Odbij zahtev</h2>

                <p>
                  Zahtev korisnika{" "}
                  <strong>
                    {selectedRequest.username}
                  </strong>{" "}
                  biće označen kao odbijen.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowRejectModal(false)
                }
                disabled={actionLoading}
              >
                <FaTimes />
              </button>

            </div>

            <div className="reject-content">

              <label>
                Razlog odbijanja
              </label>

              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Unesite razlog odbijanja..."
                rows="5"
              />

            </div>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setShowRejectModal(false)
                }
                disabled={actionLoading}
              >
                Otkaži
              </button>

              <button
                className="modal-reject"
                onClick={rejectRequest}
                disabled={actionLoading}
              >
                <FaTimes />

                {actionLoading
                  ? "Obrada..."
                  : "Odbij zahtev"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
