import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaHome,
  FaProjectDiagram,
  FaUsers,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { user, token, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // UČITAVANJE PROFILNE SLIKE
  // =========================================================

  useEffect(() => {
    if (!user || !token) {
      setProfilePic(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/user-profiles/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Greška pri učitavanju profila");
          return;
        }

        const data = await res.json();

        setProfilePic(data.profilePic || null);
      } catch (error) {
        console.error(
          "Greška pri učitavanju profilne slike:",
          error
        );
      }
    };

    loadProfile();
  }, [user, token]);

  // =========================================================
  // ZATVARANJE USER MENIJA
  // =========================================================

  useEffect(() => {
    const close = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    setProfilePic(null);
    setOpen(false);

    logout();

    navigate("/login");
  };

  // =========================================================
  // ACTIVE LINK
  // =========================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">

      {/* =====================================================
          LEFT
      ====================================================== */}

      <Link to="/" className="brand">

        <div className="brand-logo">
          <img
            src="/logo.png"
            alt="BoardFlow logo"
          />
        </div>

        <div className="brand-text">
          <span className="brand-name">
            BoardFlow
          </span>

          <span className="brand-subtitle">
            Workspace
          </span>
        </div>

      </Link>


      {/* =====================================================
          CENTER NAVIGATION
      ====================================================== */}

      {user && (
        <nav className="nav-links">

          <Link
            to="/"
            className={isActive("/") ? "active" : ""}
          >
            <FaHome />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/projects"
            className={
              isActive("/projects")
                ? "active"
                : ""
            }
          >
            <FaProjectDiagram />
            <span>Projects</span>
          </Link>

          <Link
            to="/teams"
            className={
              isActive("/teams")
                ? "active"
                : ""
            }
          >
            <FaUsers />
            <span>Teams</span>
          </Link>

        </nav>
      )}


      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div
        className="nav-right"
        ref={ref}
      >

        {!user ? (

          <>

            <Link
              to="/login"
              className="login-link"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="register-btn"
            >
              Get started
            </Link>

          </>

        ) : (

          <div className="user-wrapper">

            <button
              className={`user-info ${
                open ? "user-open" : ""
              }`}
              onClick={() => setOpen(!open)}
            >

              {profilePic ? (

                <img
                  src={profilePic}
                  alt="Profilna slika"
                  className="navbar-avatar"
                />

              ) : (

                <FaUserCircle className="avatar" />

              )}

              <div className="user-text">

                <span className="username">
                  {user.username}
                </span>

                <span className="user-role">
                  Account
                </span>

              </div>

              <FaChevronDown
                className={`user-arrow ${
                  open ? "rotate" : ""
                }`}
              />

            </button>


            {/* =================================================
                DROPDOWN
            ================================================== */}

            {open && (

              <div className="menu">

                <div className="menu-header">

                  <div className="menu-avatar">

                    {profilePic ? (

                      <img
                        src={profilePic}
                        alt="Profilna slika"
                      />

                    ) : (

                      <FaUserCircle />

                    )}

                  </div>

                  <div>

                    <strong>
                      {user.username}
                    </strong>

                    <span>
                      {user.email}
                    </span>

                  </div>

                </div>


                <div className="menu-divider" />


                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                >
                  <FaUser />

                  <span>
                    My profile
                  </span>
                </Link>


                <button
                  onClick={handleLogout}
                  className="logout-button"
                >
                  <FaSignOutAlt />

                  <span>
                    Log out
                  </span>
                </button>

              </div>

            )}

          </div>

        )}

      </div>

    </header>
  );
}