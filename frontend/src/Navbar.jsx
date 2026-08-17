import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { user, token, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const ref = useRef(null);
  const navigate = useNavigate();


  // ==========================================
  // UČITAJ PROFILNU SLIKU LOGOVANOG KORISNIKA
  // ==========================================

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


  // ==========================================
  // ZATVARANJE MENIJA KLIKOM VAN NJEGA
  // ==========================================

  useEffect(() => {
    const close = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      close
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        close
      );
    };
  }, []);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    setProfilePic(null);
    setOpen(false);

    logout();

    navigate("/login");
  };


  return (
    <header className="navbar">

      {/* LOGO */}

      <Link
        to="/"
        className="brand"
      >
        BoardFlow
      </Link>


      {/* LINKOVI */}

      <nav className="nav-links">

        {user && (
          <>
            <Link to="/">
              Dashboard
            </Link>

            <Link to="/projects">
              Projects
            </Link>

            <Link to="/teams">
              Teams
            </Link>
          </>
        )}

      </nav>


      {/* DESNO */}

      <div
        className="nav-right"
        ref={ref}
      >

        {!user ? (

          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              to="/register"
              className="btn"
            >
              Register
            </Link>
          </>

        ) : (

          <>

            {/* USER INFO */}

            <div
              className="user-info"
              onClick={() => setOpen(!open)}
            >

              {profilePic ? (

                <img
                  src={profilePic}
                  alt="Profilna slika"
                  className="navbar-avatar"
                />

              ) : (

                <FaUserCircle
                  size={32}
                  className="avatar"
                />

              )}

              <span className="username">
                {user.username}
              </span>

            </div>


            {/* DROPDOWN */}

            {open && (

              <div className="menu">

                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
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