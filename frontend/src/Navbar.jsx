import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();   // 👈 GLOBALNO
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="navbar">
      {/* LOGO */}
      <Link to="/" className="brand">
        BoardFlow
      </Link>

      {/* LINKOVI */}
      <nav className="nav-links">
        {user && (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/teams">Teams</Link>
          </>
        )}
      </nav>

      {/* DESNO */}
      <div className="nav-right" ref={ref}>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </>
        ) : (
          <>
            {/* USER INFO */}
            <div className="user-info" onClick={() => setOpen(!open)}>
              {/* kasnije menjaš u <img /> */}
              <FaUserCircle size={32} className="avatar" />
              <span className="username">{user.username}</span>
            </div>

            {open && (
              <div className="menu">
                <Link to="/profile" onClick={() => setOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();       // 👈 GLOBALNI LOGOUT
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
