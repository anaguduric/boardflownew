import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaTimes,
} from "react-icons/fa";

import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (err) {
      console.error("Error loading admin users:", err);

      if (err.response?.status === 403) {
        setError("You do not have administrator privileges.");
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Unable to load users.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.username?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        user.status?.toLowerCase() === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        user.role?.name?.toLowerCase() === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [users, search, statusFilter, roleFilter]);

  const verifiedCount = users.filter(
    (user) => user.status === "verified"
  ).length;

  const unverifiedCount = users.filter(
    (user) => user.status === "unverified"
  ).length;

  const getRoleLabel = (roleName) => {
    if (!roleName) {
      return "No Role";
    }

    if (roleName.toUpperCase() === "SUPER_ADMIN") {
      return "Super Admin";
    }

    if (roleName.toUpperCase() === "USER") {
      return "User";
    }

    return roleName;
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    if (status.toLowerCase() === "verified") {
      return "Verified";
    }

    if (status.toLowerCase() === "unverified") {
      return "Unverified";
    }

    return status;
  };

  return (
    <main className="admin-users-page">
      {/* HEADER */}
      <div className="admin-users-header">
        <div>
          <span className="admin-users-label">
            ADMINISTRATION
          </span>

          <h1>Users</h1>

          <p>
            View and manage registered BoardFlow users.
          </p>
        </div>

        <div className="admin-users-counter">
          <FaUsers />

          <div>
            <strong>{users.length}</strong>
            <span>Total Users</span>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-users-error">
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <section className="admin-users-stats">
        <div className="admin-users-stat-card">
          <div className="admin-users-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Total Users</span>
            <strong>
              {loading ? "—" : users.length}
            </strong>
          </div>
        </div>

        <div className="admin-users-stat-card">
          <div className="admin-users-stat-icon verified">
            <FaCheckCircle />
          </div>

          <div>
            <span>Verified</span>
            <strong>
              {loading ? "—" : verifiedCount}
            </strong>
          </div>
        </div>

        <div className="admin-users-stat-card">
          <div className="admin-users-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Unverified</span>
            <strong>
              {loading ? "—" : unverifiedCount}
            </strong>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="admin-users-toolbar">
        <div className="admin-users-search">
          <FaUser />

          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-users-filters">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="all">All roles</option>
            <option value="super_admin">
              Super Admin
            </option>
            <option value="user">User</option>
          </select>
        </div>
      </section>

      {/* USERS TABLE */}
      {loading ? (
        <div className="admin-users-loading">
          <FaUsers />
          <span>Loading users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-users-empty">
          <FaUsers />

          <h2>No Users Found</h2>

          <p>
            No users match the current search or filters.
          </p>
        </div>
      ) : (
        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">
                        <FaUser />
                      </div>

                      <div>
                        <strong>
                          {user.username}
                        </strong>

                        <span>
                          ID #{user.user_id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="admin-user-email">
                      <FaEnvelope />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`admin-user-role ${
                        user.role?.name
                          ?.toLowerCase()
                          .replace("_", "-") || ""
                      }`}
                    >
                      <FaShieldAlt />

                      {getRoleLabel(
                        user.role?.name
                      )}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-user-status ${
                        user.status?.toLowerCase() || ""
                      }`}
                    >
                      {user.status === "verified" ? (
                        <FaCheckCircle />
                      ) : (
                        <FaClock />
                      )}

                      {getStatusLabel(
                        user.status
                      )}
                    </span>
                  </td>

                  <td>
                    <div className="admin-user-actions">
                      <button
                        type="button"
                        className="admin-user-view-button"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        title="View user"
                        aria-label="View user"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div
          className="admin-user-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-user-modal-header">
              <div>
                <h2>User Details</h2>

                <p>
                  Information about the selected
                  BoardFlow user.
                </p>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
                title="Close"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="admin-user-details">
              <div className="admin-user-profile-preview">
                <div className="admin-user-large-avatar">
                  <FaUser />
                </div>

                <div>
                  <h3>
                    {selectedUser.username}
                  </h3>

                  <span>
                    User ID #{selectedUser.user_id}
                  </span>
                </div>
              </div>

              <div className="admin-user-detail-grid">
                <div className="admin-user-detail-item">
                  <label>Username</label>
                  <span>
                    {selectedUser.username}
                  </span>
                </div>

                <div className="admin-user-detail-item">
                  <label>User ID</label>
                  <span>
                    #{selectedUser.user_id}
                  </span>
                </div>

                <div className="admin-user-detail-item full">
                  <label>Email</label>

                  <span>
                    {selectedUser.email}
                  </span>
                </div>

                <div className="admin-user-detail-item">
                  <label>Role</label>

                  <span>
                    {getRoleLabel(
                      selectedUser.role?.name
                    )}
                  </span>
                </div>

                <div className="admin-user-detail-item">
                  <label>Status</label>

                  <span>
                    {getStatusLabel(
                      selectedUser.status
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsers;