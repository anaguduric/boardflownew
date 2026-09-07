import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import GoogleCalendar from "./GoogleCalendar";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, token } = useAuth();

  /*
  ============================================================
  GOOGLE CALENDAR
  ============================================================
  */

  const [googleCalendarConnected, setGoogleCalendarConnected] =
    useState(false);

  const [checkingCalendar, setCheckingCalendar] =
    useState(true);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");

  /*
  ============================================================
  CONNECT GOOGLE CALENDAR
  ============================================================
  */

  const connectGoogleCalendar = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/google-calendar/auth",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to connect Google Calendar");
      }

      const data = await response.json();

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Google Calendar connection error:",
        error
      );

      alert("Failed to connect Google Calendar.");
    }
  };

  /*
  ============================================================
  GET GOOGLE CALENDAR EVENTS
  ============================================================
  */

  const loadGoogleCalendarEvents = async () => {
    if (!token) {
      return;
    }

    setLoadingEvents(true);
    setEventsError("");

    try {
      const response = await fetch(
        "http://localhost:3000/google-calendar/events",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load Google Calendar events");
      }

      const data = await response.json();

      const calendarEvents = Array.isArray(data.events)
        ? data.events
        : [];

      /*
      Only keep upcoming events.
      Google Calendar can return events without a dateTime
      because all-day events use "date" instead.
      */

      const now = new Date();

      const upcomingEvents = calendarEvents
        .filter((event) => {
          const startValue =
            event.start?.dateTime ||
            event.start?.date;

          if (!startValue) {
            return false;
          }

          const eventStart = new Date(startValue);

          return eventStart >= now;
        })
        .sort((a, b) => {
          const startA = new Date(
            a.start?.dateTime || a.start?.date
          );

          const startB = new Date(
            b.start?.dateTime || b.start?.date
          );

          return startA - startB;
        });

      setEvents(upcomingEvents);
    } catch (error) {
      console.error(
        "Google Calendar events error:",
        error
      );

      setEventsError(
        "Unable to load your Google Calendar events."
      );

      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  /*
  ============================================================
  CHECK GOOGLE CALENDAR CONNECTION
  ============================================================
  */

  useEffect(() => {
    if (!user || !token) {
      setCheckingCalendar(false);
      return;
    }

    const checkGoogleCalendar = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/google-calendar/status",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to check Google Calendar status"
          );
        }

        const data = await response.json();

        setGoogleCalendarConnected(data.connected);

        /*
        If Google Calendar is connected,
        immediately load the events.
        */

        if (data.connected) {
          await loadGoogleCalendarEvents();
        }
      } catch (error) {
        console.error(
          "Google Calendar status error:",
          error
        );
      } finally {
        setCheckingCalendar(false);
      }
    };

    checkGoogleCalendar();
  }, [user, token]);

  /*
  ============================================================
  EVENT DATE FORMAT
  ============================================================
  */

  const formatEventDate = (event) => {
    const startValue =
      event.start?.dateTime ||
      event.start?.date;

    if (!startValue) {
      return "";
    }

    const date = new Date(startValue);

    /*
    All-day event
    */

    if (event.start?.date && !event.start?.dateTime) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    /*
    Event with specific time
    */

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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

            {!checkingCalendar &&
              !googleCalendarConnected && (
                <button
                  className="widget-link"
                  type="button"
                  onClick={connectGoogleCalendar}
                >
                  Connect
                </button>
              )}

          </div>

          {checkingCalendar ? (
            <div className="calendar-placeholder">

              <div className="calendar-placeholder-icon">
                📅
              </div>

              <h3>
                Checking Google Calendar...
              </h3>

              <p>
                Checking your Google Calendar connection.
              </p>

            </div>
          ) : googleCalendarConnected ? (

            <GoogleCalendar />

          ) : (

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
                onClick={connectGoogleCalendar}
              >
                Connect Calendar
              </button>

            </div>

          )}

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
              {events.length}
            </span>

          </div>

          {loadingEvents ? (
            <div className="empty-widget">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                Loading events...
              </h3>

              <p>
                Getting your Google Calendar events.
              </p>

            </div>
          ) : eventsError ? (
            <div className="empty-widget">

              <div className="empty-icon">
                ⚠️
              </div>

              <h3>
                Unable to load events
              </h3>

              <p>
                {eventsError}
              </p>

            </div>
          ) : !googleCalendarConnected ? (
            <div className="empty-widget">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                Connect Google Calendar
              </h3>

              <p>
                Connect your Google Calendar to see
                your upcoming events here.
              </p>

            </div>
          ) : events.length === 0 ? (
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
          ) : (
            <div className="upcoming-events-list">

              {events.slice(0, 5).map((event) => {

                const startValue =
                  event.start?.dateTime ||
                  event.start?.date;

                const eventDate = startValue
                  ? new Date(startValue)
                  : null;

                const isAllDay =
                  event.start?.date &&
                  !event.start?.dateTime;

                return (
                  <div
                    className="upcoming-event"
                    key={event.id}
                  >

                    {/* DATE */}

                    <div className="upcoming-event-date">

                      <span className="upcoming-event-month">
                        {eventDate
                          ? eventDate.toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                              }
                            )
                          : ""}
                      </span>

                      <strong>
                        {eventDate
                          ? eventDate.getDate()
                          : ""}
                      </strong>

                    </div>

                    {/* CONTENT */}

                    <div className="upcoming-event-content">

                      <h3>
                        {event.summary ||
                          "Untitled event"}
                      </h3>

                      <div className="upcoming-event-time">

                        <span>
                          {eventDate
                            ? eventDate.toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                }
                              )
                            : ""}
                        </span>

                        <span className="upcoming-event-dot">
                          •
                        </span>

                        <span>
                          {isAllDay
                            ? "All day"
                            : eventDate
                            ? eventDate.toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </span>

                      </div>

                      {event.location && (
                        <div className="upcoming-event-location">

                          <span>
                            📍
                          </span>

                          <span>
                            {event.location}
                          </span>

                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

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