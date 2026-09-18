import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FaBuilding,
  FaUsers,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaEye,
  FaTimes,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";

import "./AdminOrganizations.css";

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrganization, setSelectedOrganization] =
    useState(null);

  // =====================================================
  // FETCH ORGANIZATIONS
  // =====================================================

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/organizations/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrganizations(response.data);
    } catch (err) {
      console.error(
        "Error loading admin organizations:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have administrator privileges."
        );
      } else if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else {
        setError("Unable to load organizations.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredOrganizations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return organizations.filter((organization) => {
      const matchesSearch =
        !searchValue ||
        organization.name
          ?.toLowerCase()
          .includes(searchValue) ||
        organization.owner?.username
          ?.toLowerCase()
          .includes(searchValue) ||
        organization.owner?.email
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        organization.status?.toLowerCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [organizations, search, statusFilter]);

  // =====================================================
  // STATS
  // =====================================================

  const activeCount = organizations.filter(
    (organization) =>
      organization.status === "ACTIVE"
  ).length;

  const inactiveCount = organizations.filter(
    (organization) =>
      organization.status === "INACTIVE"
  ).length;

  const suspendedCount = organizations.filter(
    (organization) =>
      organization.status === "SUSPENDED"
  ).length;

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "Active";

      case "INACTIVE":
        return "Inactive";

      case "SUSPENDED":
        return "Suspended";

      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "unknown";

    return status.toLowerCase();
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="admin-organizations-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-organizations-header">

        <div>
          <span className="admin-organizations-label">
            ADMINISTRATION
          </span>

          <h1>Organizations</h1>

          <p>
            View and manage organizations in BoardFlow.
          </p>
        </div>

        <div className="admin-organizations-counter">

          <FaBuilding />

          <div>
            <strong>
              {organizations.length}
            </strong>

            <span>
              Total Organizations
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="admin-organizations-error">
          {error}
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <section className="admin-organizations-stats">

        <div className="admin-organization-stat-card">

          <div className="admin-organization-stat-icon total">
            <FaBuilding />
          </div>

          <div>
            <span>Total Organizations</span>
            <strong>
              {organizations.length}
            </strong>
          </div>

        </div>

        <div className="admin-organization-stat-card">

          <div className="admin-organization-stat-icon active">
            <FaCheckCircle />
          </div>

          <div>
            <span>Active</span>
            <strong>
              {activeCount}
            </strong>
          </div>

        </div>

        <div className="admin-organization-stat-card">

          <div className="admin-organization-stat-icon inactive">
            <FaTimesCircle />
          </div>

          <div>
            <span>Inactive</span>
            <strong>
              {inactiveCount}
            </strong>
          </div>

        </div>

        <div className="admin-organization-stat-card">

          <div className="admin-organization-stat-icon suspended">
            <FaPauseCircle />
          </div>

          <div>
            <span>Suspended</span>
            <strong>
              {suspendedCount}
            </strong>
          </div>

        </div>

      </section>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="admin-organizations-toolbar">

        <div className="admin-organizations-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search by organization or owner..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="admin-organizations-filters">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="suspended">
              Suspended
            </option>
          </select>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      {loading ? (

        <div className="admin-organizations-loading">

          <FaBuilding />

          <span>
            Loading organizations...
          </span>

        </div>

      ) : filteredOrganizations.length === 0 ? (

        <div className="admin-organizations-empty">

          <FaBuilding />

          <h2>
            No Organizations Found
          </h2>

          <p>
            No organizations match the current
            search or filters.
          </p>

        </div>

      ) : (

        <div className="admin-organizations-table-wrapper">

          <table className="admin-organizations-table">

            <thead>
              <tr>
                <th>Organization</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrganizations.map(
                (organization) => (

                  <tr
                    key={
                      organization.organization_id
                    }
                  >

                    {/* ORGANIZATION */}

                    <td>

                      <div className="admin-organization-cell">

                        <div className="admin-organization-avatar">
                          <FaBuilding />
                        </div>

                        <div>
                          <strong>
                            {organization.name}
                          </strong>

                          <span>
                            ID #
                            {
                              organization.organization_id
                            }
                          </span>
                        </div>

                      </div>

                    </td>

                    {/* OWNER */}

                    <td>

                      {organization.owner ? (

                        <div className="admin-organization-owner">

                          <div className="admin-owner-avatar">
                            <FaUser />
                          </div>

                          <div>
                            <strong>
                              {
                                organization.owner
                                  .username
                              }
                            </strong>

                            <span>
                              {
                                organization.owner
                                  .email
                              }
                            </span>
                          </div>

                        </div>

                      ) : (

                        <span className="admin-no-owner">
                          No owner
                        </span>

                      )}

                    </td>

                    {/* MEMBERS */}

                    <td>

                      <div className="admin-organization-members">

                        <FaUsers />

                        <strong>
                          {
                            organization.member_count
                          }
                        </strong>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`admin-organization-status ${getStatusClass(
                          organization.status
                        )}`}
                      >

                        {organization.status ===
                          "ACTIVE" && (
                          <FaCheckCircle />
                        )}

                        {organization.status ===
                          "INACTIVE" && (
                          <FaTimesCircle />
                        )}

                        {organization.status ===
                          "SUSPENDED" && (
                          <FaPauseCircle />
                        )}

                        {getStatusLabel(
                          organization.status
                        )}

                      </span>

                    </td>

                    {/* CREATED */}

                    <td>

                      <div className="admin-organization-date">

                        <FaCalendarAlt />

                        <span>
                          {formatDate(
                            organization.created_at
                          )}
                        </span>

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="admin-organization-actions">

                        <button
                          type="button"
                          className="admin-organization-view-button"
                          onClick={() =>
                            setSelectedOrganization(
                              organization
                            )
                          }
                          title="View organization"
                          aria-label="View organization"
                        >
                          <FaEye />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedOrganization && (

        <div
          className="admin-organization-modal-overlay"
          onClick={() =>
            setSelectedOrganization(null)
          }
        >

          <div
            className="admin-organization-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-organization-modal-header">

              <div>

                <span>
                  ORGANIZATION
                </span>

                <h2>
                  Organization Details
                </h2>

                <p>
                  Information about the selected
                  BoardFlow organization.
                </p>

              </div>

              <button
                type="button"
                className="admin-organization-modal-close"
                onClick={() =>
                  setSelectedOrganization(null)
                }
                title="Close"
                aria-label="Close"
              >
                <FaTimes />
              </button>

            </div>

            {/* ORGANIZATION PREVIEW */}

            <div className="admin-organization-preview">

              <div className="admin-organization-large-avatar">
                <FaBuilding />
              </div>

              <div>

                <h3>
                  {selectedOrganization.name}
                </h3>

                <span>
                  Organization ID #
                  {
                    selectedOrganization.organization_id
                  }
                </span>

              </div>

            </div>

            {/* DETAILS */}

            <div className="admin-organization-detail-grid">

              <div className="admin-organization-detail-card">

                <span>Organization Name</span>

                <strong>
                  {selectedOrganization.name}
                </strong>

              </div>

              <div className="admin-organization-detail-card">

                <span>Status</span>

                <strong>

                  <span
                    className={`admin-organization-status ${getStatusClass(
                      selectedOrganization.status
                    )}`}
                  >

                    {selectedOrganization.status ===
                      "ACTIVE" && (
                      <FaCheckCircle />
                    )}

                    {selectedOrganization.status ===
                      "INACTIVE" && (
                      <FaTimesCircle />
                    )}

                    {selectedOrganization.status ===
                      "SUSPENDED" && (
                      <FaPauseCircle />
                    )}

                    {getStatusLabel(
                      selectedOrganization.status
                    )}

                  </span>

                </strong>

              </div>

              <div className="admin-organization-detail-card">

                <span>Total Members</span>

                <strong>
                  <FaUsers />
                  {
                    selectedOrganization.member_count
                  }
                </strong>

              </div>

              <div className="admin-organization-detail-card">

                <span>Created</span>

                <strong>
                  {formatDate(
                    selectedOrganization.created_at
                  )}
                </strong>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="admin-organization-description">

              <span>
                Description
              </span>

              <p>
                {selectedOrganization.description ||
                  "No description provided."}
              </p>

            </div>

            {/* OWNER */}

            <div className="admin-organization-owner-section">

              <div className="admin-organization-section-heading">

                <h3>
                  Owner
                </h3>

              </div>

              {selectedOrganization.owner ? (

                <div className="admin-organization-modal-owner">

                  <div className="admin-owner-large-avatar">
                    <FaUser />
                  </div>

                  <div>

                    <strong>
                      {
                        selectedOrganization.owner
                          .username
                      }
                    </strong>

                    <span>
                      <FaEnvelope />

                      {
                        selectedOrganization.owner
                          .email
                      }
                    </span>

                  </div>

                </div>

              ) : (

                <div className="admin-organization-no-owner">
                  No owner assigned.
                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </main>
  );
};

export default AdminOrganizations;