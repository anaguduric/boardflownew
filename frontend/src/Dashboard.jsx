import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();

  /*
  ============================================================
  GUEST / INITIAL SCREEN
  ============================================================
  */

  if (!user) {
    return (
      <main className="landing-page">

        {/* HERO */}

        <section className="landing-hero">

          <div className="landing-content">

            <div className="landing-badge">
              ✦ Simple workspace management
            </div>

            <h1>
              Manage your work.
              <br />
              <span>Build better teams.</span>
            </h1>

            <p className="landing-description">
              BoardFlow helps teams organize projects, manage tasks,
              collaborate with teammates and keep everything
              in one place.
            </p>

            <div className="landing-buttons">

              <Link
                to="/register"
                className="landing-primary-btn"
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className="landing-secondary-btn"
              >
                Login
              </Link>

            </div>

          </div>


          {/* DASHBOARD PREVIEW */}

          <div className="landing-preview">

            <div className="preview-window">

              <div className="preview-topbar">

                <div className="preview-logo">
                  BoardFlow
                </div>

                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>


              <div className="preview-body">

                <div className="preview-sidebar">

                  <div className="preview-sidebar-title">
                    Workspace
                  </div>

                  <div className="preview-sidebar-item active">
                    Dashboard
                  </div>

                  <div className="preview-sidebar-item">
                    Projects
                  </div>

                  <div className="preview-sidebar-item">
                    Teams
                  </div>

                  <div className="preview-sidebar-item">
                    Calendar
                  </div>

                </div>


                <div className="preview-main">

                  <div className="preview-heading">

                    <div>

                      <div className="preview-title">
                        Dashboard
                      </div>

                      <div className="preview-subtitle">
                        Welcome back
                      </div>

                    </div>

                  </div>


                  <div className="preview-cards">

                    <div className="preview-card">
                      <span>Projects</span>
                      <strong>12</strong>
                    </div>

                    <div className="preview-card">
                      <span>Tasks</span>
                      <strong>28</strong>
                    </div>

                    <div className="preview-card">
                      <span>Teams</span>
                      <strong>4</strong>
                    </div>

                  </div>


                  <div className="preview-calendar">

                    <div className="preview-calendar-title">
                      Calendar
                    </div>

                    <div className="preview-calendar-grid">

                      {Array.from(
                        { length: 21 },
                        (_, index) => (
                          <div
                            key={index}
                            className={
                              index === 10
                                ? "calendar-day selected"
                                : "calendar-day"
                            }
                          >
                            {index + 1}
                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section className="landing-features">

          <div className="landing-section-header">

            <span>
              EVERYTHING IN ONE PLACE
            </span>

            <h2>
              Everything your team needs
            </h2>

            <p>
              Organize your work and keep your team
              connected without unnecessary complexity.
            </p>

          </div>


          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-icon">
                📁
              </div>

              <h3>
                Projects
              </h3>

              <p>
                Organize your projects, track progress
                and keep everything structured.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                👥
              </div>

              <h3>
                Teams
              </h3>

              <p>
                Collaborate with your teammates and
                manage your workspace together.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ✓
              </div>

              <h3>
                Tasks
              </h3>

              <p>
                Keep track of your tasks, deadlines
                and daily responsibilities.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                📅
              </div>

              <h3>
                Calendar
              </h3>

              <p>
                Connect your Google Calendar and
                manage your schedule from one place.
              </p>

            </div>

          </div>

        </section>


        {/* CTA */}

        <section className="landing-cta">

          <h2>
            Ready to organize your work?
          </h2>

          <p>
            Create your workspace and start working
            with your team.
          </p>

          <Link
            to="/register"
            className="landing-primary-btn"
          >
            Create your account
          </Link>

        </section>

      </main>
    );
  }


  /*
  ============================================================
  LOGGED IN DASHBOARD
  ============================================================
  */

  return (
    <main className="dashboard">

      {/* HEADER */}

      <section className="dashboard-header">

        <div>

          <span className="dashboard-greeting">
            DASHBOARD
          </span>

          <h1>
            Welcome back, {user.username}
          </h1>

          <p>
            Here's what's happening with your workspace today.
          </p>

        </div>


        <Link
          to="/projects"
          className="dashboard-action"
        >
          + New Project
        </Link>

      </section>


      {/* STATISTICS */}

      <section className="cards-grid">

        <div className="card">

          <div className="card-top">

            <div className="card-icon purple">
              📁
            </div>

            <span className="card-label">
              PROJECTS
            </span>

          </div>

          <span className="number">
            12
          </span>

          <p>
            Active projects
          </p>

        </div>


        <div className="card">

          <div className="card-top">

            <div className="card-icon blue">
              ✓
            </div>

            <span className="card-label">
              TASKS
            </span>

          </div>

          <span className="number">
            28
          </span>

          <p>
            Tasks in progress
          </p>

        </div>


        <div className="card">

          <div className="card-top">

            <div className="card-icon green">
              👥
            </div>

            <span className="card-label">
              TEAMS
            </span>

          </div>

          <span className="number">
            4
          </span>

          <p>
            Active teams
          </p>

        </div>


        <div className="card">

          <div className="card-top">

            <div className="card-icon orange">
              👤
            </div>

            <span className="card-label">
              MEMBERS
            </span>

          </div>

          <span className="number">
            16
          </span>

          <p>
            Team members
          </p>

        </div>

      </section>


      {/* MAIN CONTENT */}

      <section className="dashboard-grid">

        {/* CALENDAR */}

        <div className="dashboard-widget calendar-widget">

          <div className="widget-header">

            <div>

              <h2>
                Calendar
              </h2>

              <p>
                Your schedule
              </p>

            </div>

            <button
              className="widget-link"
              type="button"
            >
              Connect
            </button>

          </div>


          <div className="calendar-placeholder">

            <div className="calendar-placeholder-icon">
              📅
            </div>

            <h3>
              Connect Google Calendar
            </h3>

            <p>
              Connect your Google Calendar to see
              your events and meetings here.
            </p>

            <button
              className="connect-calendar-btn"
              type="button"
            >
              Connect Calendar
            </button>

          </div>

        </div>


        {/* UPCOMING EVENTS */}

        <div className="dashboard-widget events-widget">

          <div className="widget-header">

            <div>

              <h2>
                Upcoming Events
              </h2>

              <p>
                Your next events
              </p>

            </div>

            <span className="event-count">
              0
            </span>

          </div>


          <div className="empty-widget">

            <div className="empty-icon">
              📅
            </div>

            <h3>
              No upcoming events
            </h3>

            <p>
              Your upcoming Google Calendar events
              will appear here.
            </p>

          </div>

        </div>

      </section>


      {/* LOWER CONTENT */}

      <section className="dashboard-grid lower-grid">

        {/* PROJECTS */}

        <div className="dashboard-widget">

          <div className="widget-header">

            <div>

              <h2>
                Recent Projects
              </h2>

              <p>
                Your latest projects
              </p>

            </div>

            <Link
              to="/projects"
              className="widget-link"
            >
              View all
            </Link>

          </div>


          <div className="empty-widget small">

            <div className="empty-icon">
              📁
            </div>

            <h3>
              No projects yet
            </h3>

            <p>
              Create your first project to get started.
            </p>

            <Link
              to="/projects"
              className="small-action"
            >
              Create Project
            </Link>

          </div>

        </div>


        {/* TEAMS */}

        <div className="dashboard-widget">

          <div className="widget-header">

            <div>

              <h2>
                Team Overview
              </h2>

              <p>
                Your teams
              </p>

            </div>

            <Link
              to="/teams"
              className="widget-link"
            >
              View all
            </Link>

          </div>


          <div className="empty-widget small">

            <div className="empty-icon">
              👥
            </div>

            <h3>
              No teams yet
            </h3>

            <p>
              Create or join a team to collaborate.
            </p>

            <Link
              to="/teams"
              className="small-action"
            >
              Manage Teams
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}