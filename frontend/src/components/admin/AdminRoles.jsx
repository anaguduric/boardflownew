import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUserShield,
  FaBuilding,
  FaUsers,
  FaEye,
  FaTimes,
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

import "./AdminRoles.css";

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("ALL");

  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3000/organizations/admin/roles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching admin roles:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load organization roles."
      );
    } finally {
      setLoading(false);
    }
  };

  const organizations = useMemo(() => {
    const map = new Map();

    roles.forEach((role) => {
      if (role.organization) {
        map.set(
          role.organization.organization_id,
          role.organization.name
        );
      }
    });

    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [roles]);

  const stats = useMemo(() => {
    const totalRoles = roles.length;

    const defaultRoles = roles.filter(
      (role) => role.is_default
    ).length;

    const organizationCount = new Set(
      roles
        .map((role) => role.organization_id)
        .filter(Boolean)
    ).size;

    return {
      totalRoles,
      defaultRoles,
      organizationCount,
    };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !searchValue ||
        role.name?.toLowerCase().includes(searchValue) ||
        role.description
          ?.toLowerCase()
          .includes(searchValue) ||
        role.organization?.name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesOrganization =
        organizationFilter === "ALL" ||
        String(role.organization_id) ===
          String(organizationFilter);

      return (
        matchesSearch &&
        matchesOrganization
      );
    });
  }, [roles, search, organizationFilter]);

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

  const getOrganizationStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "active";

      case "INACTIVE":
        return "inactive";

      case "SUSPENDED":
        return "suspended";

      default:
        return "";
    }
  };

  return (
    <div className="admin-roles-page">

      {/* HEADER */}
      <div className="admin-roles-header">
        <div>
          <div className="admin-roles-breadcrumb">
            <span>Administration</span>
            <span>/</span>
            <strong>Roles</strong>
          </div>

          <h1>Organization Roles</h1>

          <p>
            View and manage roles across all BoardFlow
            organizations.
          </p>
        </div>

        <div className="admin-roles-header-icon">
          <FaUserShield />
        </div>
      </div>

      {/* STATS */}
      <div className="admin-roles-stats">

        <div className="admin-role-stat-card">
          <div className="admin-role-stat-icon total">
            <FaUserShield />
          </div>

          <div>
            <span>Total Roles</span>
            <strong>{stats.totalRoles}</strong>
          </div>
        </div>

        <div className="admin-role-stat-card">
          <div className="admin-role-stat-icon default">
            <FaStar />
          </div>

          <div>
            <span>Default Roles</span>
            <strong>{stats.defaultRoles}</strong>
          </div>
        </div>

        <div className="admin-role-stat-card">
          <div className="admin-role-stat-icon organizations">
            <FaBuilding />
          </div>

          <div>
            <span>Organizations</span>
            <strong>{stats.organizationCount}</strong>
          </div>
        </div>

      </div>

      {/* CONTENT */}
      <div className="admin-roles-card">

        {/* TOOLBAR */}
        <div className="admin-roles-toolbar">

          <div className="admin-roles-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search roles or organizations..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="admin-roles-filter">
            <FaBuilding />

            <select
              value={organizationFilter}
              onChange={(e) =>
                setOrganizationFilter(e.target.value)
              }
            >
              <option value="ALL">
                All organizations
              </option>

              {organizations.map(
                ([organizationId, organizationName]) => (
                  <option
                    key={organizationId}
                    value={organizationId}
                  >
                    {organizationName}
                  </option>
                )
              )}
            </select>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="admin-roles-error">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="admin-roles-loading">
            <div className="admin-roles-spinner"></div>
            <span>Loading roles...</span>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="admin-roles-empty">
            <FaUserShield />

            <h3>No roles found</h3>

            <p>
              No organization roles match your current
              search or filter.
            </p>
          </div>
        ) : (
          <div className="admin-roles-table-wrapper">
            <table className="admin-roles-table">

              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Organization</th>
                  <th>Description</th>
                  <th>Default</th>
                  <th>Members</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.role_id}>

                    {/* ROLE */}
                    <td>
                      <div className="admin-role-name">
                        <div className="admin-role-avatar">
                          <FaUserShield />
                        </div>

                        <div>
                          <strong>
                            {role.name || "Unnamed Role"}
                          </strong>

                          <span>
                            Role #{role.role_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ORGANIZATION */}
                    <td>
                      {role.organization ? (
                        <div className="admin-role-organization">
                          <div className="admin-role-org-icon">
                            <FaBuilding />
                          </div>

                          <div>
                            <strong>
                              {role.organization.name}
                            </strong>

                            <span
                              className={`admin-role-org-status ${getOrganizationStatusClass(
                                role.organization.status
                              )}`}
                            >
                              {role.organization.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="admin-role-muted">
                          No organization
                        </span>
                      )}
                    </td>

                    {/* DESCRIPTION */}
                    <td>
                      <span className="admin-role-description">
                        {role.description ||
                          "No description"}
                      </span>
                    </td>

                    {/* DEFAULT */}
                    <td>
                      {role.is_default ? (
                        <span className="admin-role-default">
                          <FaCheckCircle />
                          Default
                        </span>
                      ) : (
                        <span className="admin-role-not-default">
                          —
                        </span>
                      )}
                    </td>

                    {/* MEMBERS */}
                    <td>
                      <div className="admin-role-members">
                        <FaUsers />
                        <strong>
                          {role.member_count ?? 0}
                        </strong>
                      </div>
                    </td>

                    {/* CREATED */}
                    <td>
                      <div className="admin-role-date">
                        <FaCalendarAlt />
                        <span>
                          {formatDate(role.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td>
                      <button
                        type="button"
                        className="admin-role-view-button"
                        onClick={() =>
                          setSelectedRole(role)
                        }
                        title="View role"
                      >
                        <FaEye />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* ROLE DETAILS MODAL */}
      {selectedRole && (
        <div
          className="admin-role-modal-overlay"
          onClick={() =>
            setSelectedRole(null)
          }
        >
          <div
            className="admin-role-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="admin-role-modal-close"
              onClick={() =>
                setSelectedRole(null)
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="admin-role-modal-header">

              <div className="admin-role-modal-icon">
                <FaUserShield />
              </div>

              <div>
                <span>Role Details</span>
                <h2>
                  {selectedRole.name}
                </h2>
              </div>

            </div>

            <div className="admin-role-modal-content">

              <div className="admin-role-detail">
                <span>Role ID</span>
                <strong>
                  #{selectedRole.role_id}
                </strong>
              </div>

              <div className="admin-role-detail">
                <span>Organization</span>

                <strong>
                  {selectedRole.organization?.name ||
                    "No organization"}
                </strong>
              </div>

              <div className="admin-role-detail">
                <span>Organization Status</span>

                {selectedRole.organization ? (
                  <span
                    className={`admin-role-org-status modal-status ${getOrganizationStatusClass(
                      selectedRole.organization.status
                    )}`}
                  >
                    {selectedRole.organization.status}
                  </span>
                ) : (
                  <strong>—</strong>
                )}
              </div>

              <div className="admin-role-detail">
                <span>Members</span>

                <strong>
                  {selectedRole.member_count ?? 0}
                </strong>
              </div>

              <div className="admin-role-detail">
                <span>Default Role</span>

                <strong>
                  {selectedRole.is_default
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div className="admin-role-detail">
                <span>Created</span>

                <strong>
                  {formatDate(
                    selectedRole.created_at
                  )}
                </strong>
              </div>

              <div className="admin-role-detail">
                <span>Last Updated</span>

                <strong>
                  {formatDate(
                    selectedRole.updated_at
                  )}
                </strong>
              </div>

              <div className="admin-role-detail description">
                <span>Description</span>

                <p>
                  {selectedRole.description ||
                    "No description provided."}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRoles;