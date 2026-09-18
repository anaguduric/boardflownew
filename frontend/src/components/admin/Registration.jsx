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
     FETCH REQUESTS
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
            : data.message || "Failed to load registration requests."
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
     APPROVE REQUEST
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
            : data.message || "Failed to approve the request."
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
     REJECT REQUEST
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
            : data.message || "Failed to reject the request."
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
        return "Pending";

      case "APPROVED":
        return "Approved";

      case "REJECTED":
        return "Rejected";

      default:
        return status;
    }
  };

  /* =========================================================
     DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-US", {
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
          Loading registration requests...
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
          <h1>Registration Requests</h1>

          <p>
            Review and manage requests to create new organizations.
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

          <small>Pending</small>

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

          <h2>No Registration Requests</h2>

          <p>
            There are currently no registration requests.
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
                <th>User</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
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
                        title="View request"
                        aria-label="View request"
                      >
                        <FaEye />
                      </button>

                      {/* APPROVE / REJECT */}

                      {request.status === "PENDING" && (
                        <>

                          <button
                            className="approve-button"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveModal(true);
                            }}
                            disabled={actionLoading}
                            title="Approve request"
                            aria-label="Approve request"
                          >
                            <FaCheck />
                          </button>

                          <button
                            className="reject-button"
                            onClick={() =>
                              openRejectModal(request)
                            }
                            disabled={actionLoading}
                            title="Reject request"
                            aria-label="Reject request"
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

                  <h2>Request Details</h2>

                  <p>
                    Review the information submitted by the user.
                  </p>

                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedRequest(null)
                  }
                  title="Close"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>

              </div>

              <div className="request-details">

                {/* USER DETAILS */}

                <div className="detail-section">

                  <h3>
                    <FaUser />
                    User Information
                  </h3>

                  <div className="details-grid">

                    <div>
                      <label>First Name</label>

                      <span>
                        {selectedRequest.first_name}
                      </span>
                    </div>

                    <div>
                      <label>Last Name</label>

                      <span>
                        {selectedRequest.last_name}
                      </span>
                    </div>

                    <div>
                      <label>Username</label>

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
                    Organization
                  </h3>

                  <div className="details-grid">

                    <div>

                      <label>Name</label>

                      <span>
                        {selectedRequest.organization_name}
                      </span>

                    </div>

                    <div className="full-detail">

                      <label>Description</label>

                      <span>
                        {selectedRequest.organization_description ||
                          "No description provided."}
                      </span>

                    </div>

                  </div>

                </div>

                {/* STATUS */}

                <div className="detail-section">

                  <h3>Request Status</h3>

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
                    className="modal-icon-button modal-approve"
                    onClick={() =>
                      setShowApproveModal(true)
                    }
                    disabled={actionLoading}
                    title="Approve request"
                    aria-label="Approve request"
                  >
                    <FaCheck />
                  </button>

                  <button
                    className="modal-icon-button modal-reject"
                    onClick={() =>
                      openRejectModal(selectedRequest)
                    }
                    disabled={actionLoading}
                    title="Reject request"
                    aria-label="Reject request"
                  >
                    <FaTimes />
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

                <h2>Approve Request</h2>

                <p>
                  Are you sure you want to approve this request?
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowApproveModal(false)
                }
                disabled={actionLoading}
                title="Close"
                aria-label="Close"
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
                User{" "}
                <strong>
                  {selectedRequest.first_name}{" "}
                  {selectedRequest.last_name}
                </strong>{" "}
                will be created as the owner of this organization.
              </p>

              <div className="approval-summary">

                <div>

                  <span>User</span>

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

                  <span>Organization</span>

                  <strong>
                    {selectedRequest.organization_name}
                  </strong>

                </div>

                <div>

                  <span>Role</span>

                  <strong>
                    Organization Owner
                  </strong>

                </div>

              </div>

            </div>

            <div className="modal-actions">

              <button
                className="modal-icon-button modal-cancel"
                onClick={() =>
                  setShowApproveModal(false)
                }
                disabled={actionLoading}
                title="Cancel"
                aria-label="Cancel"
              >
                <FaTimes />
              </button>

              <button
                className="modal-icon-button modal-approve"
                onClick={() =>
                  approveRequest(selectedRequest)
                }
                disabled={actionLoading}
                title={
                  actionLoading
                    ? "Approving..."
                    : "Approve request"
                }
                aria-label={
                  actionLoading
                    ? "Approving..."
                    : "Approve request"
                }
              >
                <FaCheck />
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

                <h2>Reject Request</h2>

                <p>
                  The request from{" "}
                  <strong>
                    {selectedRequest.username}
                  </strong>{" "}
                  will be marked as rejected.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowRejectModal(false)
                }
                disabled={actionLoading}
                title="Close"
                aria-label="Close"
              >
                <FaTimes />
              </button>

            </div>

            <div className="reject-content">

              <label>
                Rejection Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Enter the reason for rejection..."
                rows="5"
              />

            </div>

            <div className="modal-actions">

              <button
                className="modal-icon-button modal-cancel"
                onClick={() =>
                  setShowRejectModal(false)
                }
                disabled={actionLoading}
                title="Cancel"
                aria-label="Cancel"
              >
                <FaTimes />
              </button>

              <button
                className="modal-icon-button modal-reject"
                onClick={rejectRequest}
                disabled={actionLoading}
                title={
                  actionLoading
                    ? "Processing..."
                    : "Reject request"
                }
                aria-label={
                  actionLoading
                    ? "Processing..."
                    : "Reject request"
                }
              >
                <FaTimes />
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}