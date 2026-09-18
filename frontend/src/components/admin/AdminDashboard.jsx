import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaUsers,
  FaBuilding,
  FaUserClock,
  FaUserCheck,
  FaClipboardList,
  FaUserShield,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    pendingRequests: 0,
    verifiedUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Niste prijavljeni.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/registration-requests/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data);
      } catch (err) {
        console.error("Greška pri učitavanju admin statistike:", err);

        if (err.response?.status === 403) {
          setError("Nemate administratorske privilegije.");
        } else {
          setError("Nije moguće učitati statistiku.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="admin-dashboard-page">

      {/* HEADER */}
      <div className="admin-dashboard-header">
        <div>
          <span className="admin-dashboard-label">
            ADMINISTRATION
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Manage users, organizations and system activity.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-dashboard-error">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <section className="admin-stats">

        {/* USERS */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaUsers />
          </div>

          <div className="admin-stat-content">
            <span>Total Users</span>

            <strong>
              {loading ? "—" : stats.totalUsers}
            </strong>

            <small>
              Registered users
            </small>
          </div>
        </div>

        {/* ORGANIZATIONS */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaBuilding />
          </div>

          <div className="admin-stat-content">
            <span>Organizations</span>

            <strong>
              {loading ? "—" : stats.totalOrganizations}
            </strong>

            <small>
              Created organizations
            </small>
          </div>
        </div>

        {/* PENDING REQUESTS */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaUserClock />
          </div>

          <div className="admin-stat-content">
            <span>Pending Requests</span>

            <strong>
              {loading ? "—" : stats.pendingRequests}
            </strong>

            <small>
              Waiting for approval
            </small>
          </div>
        </div>

        {/* VERIFIED USERS */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaUserCheck />
          </div>

          <div className="admin-stat-content">
            <span>Verified Users</span>

            <strong>
              {loading ? "—" : stats.verifiedUsers}
            </strong>

            <small>
              Verified accounts
            </small>
          </div>
        </div>

      </section>

      {/* MAIN SECTIONS */}
      <section className="admin-dashboard-sections">

        {/* MANAGEMENT */}
        <div className="admin-panel">

          <div className="admin-panel-header">
            <div className="admin-panel-icon">
              <FaClipboardList />
            </div>

            <div>
              <h2>Management</h2>

              <p>
                Manage the main parts of your BoardFlow system.
              </p>
            </div>
          </div>

          <div className="admin-management-grid">

            <Link
            to="/admin/users"
            className="admin-management-card"
            >
            <div className="admin-management-card-icon">
                <FaUsers />
            </div>

            <div>
                <h3>Users</h3>
                <p>View and manage registered users.</p>
            </div>
            </Link>

            <Link
                to="/admin/organizations"
                className="admin-management-card"
                >
                <div className="admin-management-card-icon organizations">
                    <FaBuilding />
                </div>

                <div className="admin-management-card-content">
                    <h3>Organizations</h3>
                    <p>View and manage BoardFlow organizations.</p>
                </div>
                </Link>

            <Link
                to="/admin/registration"
                className="admin-management-card"
                >
                <div className="admin-management-card-icon">
                    <FaUserClock />
                </div>

                <div>
                    <h3>Registration Requests</h3>

                    <p>
                    Review pending organization registrations.
                    </p>
                </div>
            </Link>

            <Link
                to="/admin/roles"
                className="admin-management-card"
                >
                <div className="admin-management-card-icon roles">
                    <FaUserShield />
                </div>

                <div className="admin-management-card-content">
                    <h3>Roles</h3>
                    <p>View and manage organization roles.</p>
                </div>
                </Link>

          </div>
        </div>

        {/* ADMIN INFO */}
        <div className="admin-panel admin-quick-panel">

          <div className="admin-panel-header">
            <div className="admin-panel-icon">
              <FaUserShield />
            </div>

            <div>
              <h2>Administrator</h2>

              <p>
                You have full access to BoardFlow administration.
              </p>
            </div>
          </div>

          <div className="admin-info-list">

            <div className="admin-info-item">
              <span>Access level</span>

              <strong>
                Super Admin
              </strong>
            </div>

            <div className="admin-info-item">
              <span>System access</span>

              <strong>
                Full access
              </strong>
            </div>

            <div className="admin-info-item">
              <span>Organization scope</span>

              <strong>
                All organizations
              </strong>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}