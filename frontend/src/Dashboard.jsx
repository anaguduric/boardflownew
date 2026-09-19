import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaFolder,
  FaPlus,
  FaUsers,
  FaUser,
  FaExclamationTriangle,
  FaComments,
  FaUserFriends,
  FaProjectDiagram,
  FaEnvelope,
} from "react-icons/fa";

import { useAuth } from "./context/AuthContext";
import GoogleCalendar from "./GoogleCalendar";
import "./Dashboard.css";

const API_URL = "http://localhost:3000";

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
  CHAT
  ============================================================
  */

  const [chatConversations, setChatConversations] =
    useState([]);

  const [loadingChat, setLoadingChat] =
    useState(false);

  const [chatUnreadCount, setChatUnreadCount] =
    useState(0);

  const [chatNotification, setChatNotification] =
    useState(false);

  /*
  ============================================================
  CONNECT GOOGLE CALENDAR
  ============================================================
  */

  const connectGoogleCalendar = async () => {
    try {
      const response = await fetch(
        `${API_URL}/google-calendar/auth`,
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
        `${API_URL}/google-calendar/events`,
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
          `${API_URL}/google-calendar/status`,
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
  LOAD CHAT CONVERSATIONS
  ============================================================
  */

  const loadChatConversations = async () => {
    if (!token || !user) {
      return;
    }

    try {
      setLoadingChat(true);

      const response = await fetch(
        `${API_URL}/chat/conversations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load chat conversations"
        );
      }

      const data = await response.json();

      const conversations = Array.isArray(data)
        ? data
        : [];

      const normalizedConversations =
        conversations.map((conversation) => ({
          ...conversation,
          is_group: Boolean(
            Number(conversation.is_group)
          ),
        }));

      setChatConversations(
        normalizedConversations
      );

      /*
      ----------------------------------------------------------
      DETECT NEW MESSAGES
      ----------------------------------------------------------
      */

      const currentUserId =
        user?.id != null
          ? Number(user.id)
          : user?.user_id != null
            ? Number(user.user_id)
            : null;

      const conversationsWithMessages =
        normalizedConversations.filter(
          (conversation) =>
            conversation.last_message
        );

      const unreadConversations =
        conversationsWithMessages.filter(
          (conversation) => {
            const lastMessage =
              conversation.last_message;

            return (
              currentUserId !== null &&
              Number(lastMessage.user_id) !==
                currentUserId
            );
          }
        );

      setChatUnreadCount(
        unreadConversations.length
      );

      setChatNotification(
        unreadConversations.length > 0
      );
    } catch (error) {
      console.error(
        "Chat conversations error:",
        error
      );

      setChatConversations([]);
      setChatUnreadCount(0);
      setChatNotification(false);
    } finally {
      setLoadingChat(false);
    }
  };

  /*
  ============================================================
  LOAD CHAT DATA
  ============================================================
  */

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    loadChatConversations();

    /*
    ----------------------------------------------------------
    PERIODIC REFRESH
    ----------------------------------------------------------
    */

    const interval = setInterval(() => {
      loadChatConversations();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [user, token]);

  /*
  ============================================================
  CHAT SOCKET NOTIFICATIONS
  ============================================================
  */

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const socket = io(API_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log(
        "Dashboard chat socket connected:",
        socket.id
      );
    });

    socket.on("new_message", (data) => {
      const currentUserId =
        user?.id != null
          ? Number(user.id)
          : user?.user_id != null
            ? Number(user.user_id)
            : null;

      /*
      ----------------------------------------------------------
      IGNORE OUR OWN MESSAGES
      ----------------------------------------------------------
      */

      if (
        currentUserId !== null &&
        Number(data.user_id) === currentUserId
      ) {
        return;
      }

      /*
      ----------------------------------------------------------
      NEW MESSAGE NOTIFICATION
      ----------------------------------------------------------
      */

      setChatNotification(true);

      setChatUnreadCount((previous) => {
        return previous + 1;
      });

      /*
      ----------------------------------------------------------
      REFRESH CONVERSATIONS
      ----------------------------------------------------------
      */

      loadChatConversations();
    });

    socket.on("disconnect", () => {
      console.log(
        "Dashboard chat socket disconnected"
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Dashboard chat socket error:",
        error
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  /*
  ============================================================
  GET LATEST CHAT
  ============================================================
  */

  const latestChat =
    chatConversations
      .filter(
        (conversation) =>
          conversation.last_message
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.last_message?.timestamp || 0
        );

        const dateB = new Date(
          b.last_message?.timestamp || 0
        );

        return dateB - dateA;
      })[0] || null;

  /*
  ============================================================
  CHAT PREVIEW TEXT
  ============================================================
  */

  const getChatPreview = () => {
    if (loadingChat) {
      return "Loading messages...";
    }

    if (!latestChat) {
      return "No messages yet";
    }

    const lastMessage =
      latestChat.last_message;

    if (!lastMessage?.message) {
      return "No messages yet";
    }

    const currentUserId =
      user?.id != null
        ? Number(user.id)
        : user?.user_id != null
          ? Number(user.user_id)
          : null;

    const isMine =
      currentUserId !== null &&
      Number(lastMessage.user_id) ===
        currentUserId;

    if (isMine) {
      return `You: ${lastMessage.message}`;
    }

    return `${
      lastMessage.username || "New message"
    }: ${lastMessage.message}`;
  };

  /*
  ============================================================
  CHAT TIME
  ============================================================
  */

  const getChatTime = () => {
    if (!latestChat?.last_message?.timestamp) {
      return "";
    }

    return new Date(
      latestChat.last_message.timestamp
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  ============================================================
  GUEST / LANDING PAGE
  ============================================================
  */

  if (!user) {
    return (
      <main className="landing-page">

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
              BoardFlow helps teams organize projects,
              manage tasks, collaborate with teammates
              and keep everything in one place.
            </p>

            <div className="landing-buttons">

              <Link
                to="/register-organization"
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
  LOGGED-IN DASHBOARD
  ============================================================
  */

  return (
    <main className="dashboard">

      <section className="dashboard-header">

        <div className="dashboard-header-content">

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
          <FaPlus />
          <span>New Project</span>
        </Link>

      </section>


      <section className="cards-grid">

        <div className="card">

          <div className="card-top">

            <div className="card-icon purple">
              <FaFolder />
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
              <FaCheck />
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
              <FaUsers />
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
              <FaUser />
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


      <section className="dashboard-main-layout">

        <div className="dashboard-main-left">

          <div className="dashboard-widget task-progress-widget">

            <div className="widget-header">

              <div>
                <h2>
                  Task Progress
                </h2>

                <p>
                  Your current workload
                </p>
              </div>

              <span className="progress-percentage">
                68%
              </span>

            </div>

            <div className="task-progress-content">

              <div
                className="progress-ring"
                style={{
                  "--progress": "68%",
                }}
              >

                <div className="progress-ring-inner">

                  <strong>
                    68%
                  </strong>

                  <span>
                    completed
                  </span>

                </div>

              </div>


              <div className="progress-info">

                <h3>
                  You're doing great!
                </h3>

                <p>
                  <strong>19</strong> of{" "}
                  <strong>28</strong> tasks completed
                </p>

                <div className="progress-bar">

                  <div
                    className="progress-bar-value"
                    style={{
                      width: "68%",
                    }}
                  />

                </div>

                <div className="progress-meta">

                  <span>
                    19 completed
                  </span>

                  <span>
                    9 remaining
                  </span>

                </div>

              </div>

            </div>

          </div>


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

              <div className="widget-header-actions">

                {googleCalendarConnected && (
                  <span className="connected-badge">
                    Connected
                  </span>
                )}

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

            </div>

            {checkingCalendar ? (

              <div className="calendar-placeholder">

                <div className="calendar-placeholder-icon">
                  <FaCalendarAlt />
                </div>

                <h3>
                  Checking Google Calendar...
                </h3>

                <p>
                  Checking your Google Calendar connection.
                </p>

              </div>

            ) : googleCalendarConnected ? (

              <div className="calendar-content">
                <GoogleCalendar />
              </div>

            ) : (

              <div className="calendar-placeholder">

                <div className="calendar-placeholder-icon">
                  <FaCalendarAlt />
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


          <div className="dashboard-widget">

            <div className="widget-header">

              <div>
                <h2>
                  Project Overview
                </h2>

                <p>
                  Progress across your projects
                </p>
              </div>

              <Link
                to="/projects"
                className="widget-link"
              >
                View all
              </Link>

            </div>

            <div className="project-overview-list">

              <div className="project-row">

                <div className="project-row-top">

                  <div className="project-name">
                    Website Redesign
                  </div>

                  <span>
                    75%
                  </span>

                </div>

                <div className="project-progress">

                  <div
                    className="project-progress-value"
                    style={{ width: "75%" }}
                  />

                </div>

                <div className="project-meta">

                  <span>
                    18 of 24 tasks completed
                  </span>

                  <span>
                    Due Sep 24
                  </span>

                </div>

              </div>


              <div className="project-row">

                <div className="project-row-top">

                  <div className="project-name">
                    Mobile Application
                  </div>

                  <span>
                    45%
                  </span>

                </div>

                <div className="project-progress">

                  <div
                    className="project-progress-value"
                    style={{ width: "45%" }}
                  />

                </div>

                <div className="project-meta">

                  <span>
                    9 of 20 tasks completed
                  </span>

                  <span>
                    Due Sep 28
                  </span>

                </div>

              </div>


              <div className="project-row">

                <div className="project-row-top">

                  <div className="project-name">
                    Marketing Campaign
                  </div>

                  <span>
                    30%
                  </span>

                </div>

                <div className="project-progress">

                  <div
                    className="project-progress-value"
                    style={{ width: "30%" }}
                  />

                </div>

                <div className="project-meta">

                  <span>
                    6 of 20 tasks completed
                  </span>

                  <span>
                    Due Oct 02
                  </span>

                </div>

              </div>

            </div>

          </div>


          <div className="dashboard-widget">

            <div className="widget-header">

              <div>
                <h2>
                  My Tasks
                </h2>

                <p>
                  Tasks that need your attention
                </p>
              </div>

              <Link
                to="/projects"
                className="widget-link"
              >
                View all
              </Link>

            </div>

            <div className="task-overview-list">

              <div className="task-overview-item">

                <div className="task-status-dot in-progress" />

                <div className="task-overview-content">

                  <h3>
                    Finish homepage
                  </h3>

                  <span>
                    Website Redesign
                  </span>

                </div>

                <div className="task-due today">
                  Today
                </div>

              </div>


              <div className="task-overview-item">

                <div className="task-status-dot todo" />

                <div className="task-overview-content">

                  <h3>
                    Fix login bug
                  </h3>

                  <span>
                    Mobile Application
                  </span>

                </div>

                <div className="task-due">
                  Tomorrow
                </div>

              </div>


              <div className="task-overview-item">

                <div className="task-status-dot review" />

                <div className="task-overview-content">

                  <h3>
                    Prepare testing
                  </h3>

                  <span>
                    Website Redesign
                  </span>

                </div>

                <div className="task-due">
                  Sep 21
                </div>

              </div>


              <div className="task-overview-item">

                <div className="task-status-dot todo" />

                <div className="task-overview-content">

                  <h3>
                    Update documentation
                  </h3>

                  <span>
                    Marketing Campaign
                  </span>

                </div>

                <div className="task-due">
                  Sep 23
                </div>

              </div>

            </div>

          </div>


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

            <div className="recent-list">

              <Link
                to="/projects"
                className="recent-item"
              >

                <div className="recent-item-icon purple">
                  <FaFolder />
                </div>

                <div className="recent-item-content">

                  <h3>
                    Website Redesign
                  </h3>

                  <p>
                    Updated 2 hours ago
                  </p>

                </div>

                <FaArrowRight className="recent-item-arrow" />

              </Link>


              <Link
                to="/projects"
                className="recent-item"
              >

                <div className="recent-item-icon blue">
                  <FaFolder />
                </div>

                <div className="recent-item-content">

                  <h3>
                    Mobile Application
                  </h3>

                  <p>
                    Updated yesterday
                  </p>

                </div>

                <FaArrowRight className="recent-item-arrow" />

              </Link>


              <Link
                to="/projects"
                className="recent-item"
              >

                <div className="recent-item-icon green">
                  <FaFolder />
                </div>

                <div className="recent-item-content">

                  <h3>
                    Marketing Campaign
                  </h3>

                  <p>
                    Updated Sep 15
                  </p>

                </div>

                <FaArrowRight className="recent-item-arrow" />

              </Link>

            </div>

          </div>

        </div>


        <div className="dashboard-main-right">

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

              {googleCalendarConnected && (
                <span className="event-count">
                  {events.length}
                </span>
              )}

            </div>


            {loadingEvents ? (

              <div className="empty-widget">

                <div className="empty-icon">
                  <FaClock />
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

                <div className="empty-icon warning">
                  <FaExclamationTriangle />
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
                  <FaCalendarAlt />
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
                  <FaCalendarAlt />
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
                              <FaCalendarAlt />
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


          {/* ==================================================
              QUICK ACCESS
          ================================================== */}

          <div className="dashboard-widget quick-access-widget">

            <div className="widget-header">

              <div>
                <h2>
                  Quick Access
                </h2>

                <p>
                  Jump to your workspace
                </p>
              </div>

            </div>


            <div className="quick-access-grid">

              {/* CHAT */}

              <Link
                to="/chat"
                className={`quick-access-card ${
                  chatNotification
                    ? "has-notification"
                    : ""
                }`}
              >

                <div className="quick-access-icon purple">
                  <FaComments />
                </div>

                <div className="quick-access-card-content">

                  <div className="quick-access-title-row">

                    <strong>
                      Chat
                    </strong>

                    {chatNotification && (
                      <span className="quick-access-notification-dot">
                        <FaEnvelope />
                      </span>
                    )}

                  </div>

                  <span>
                    {chatNotification
                      ? `${chatUnreadCount} ${
                          chatUnreadCount === 1
                            ? "new message"
                            : "new messages"
                        }`
                      : getChatPreview()}
                  </span>

                </div>

                <div className="quick-access-card-meta">

                  {getChatTime() && (
                    <small>
                      {getChatTime()}
                    </small>
                  )}

                  <span className="quick-access-arrow">
                    <FaArrowRight />
                  </span>

                </div>

              </Link>


              {/* TEAMS */}

              <Link
                to="/teams"
                className="quick-access-card"
              >

                <div className="quick-access-icon blue">
                  <FaUsers />
                </div>

                <div className="quick-access-card-content">

                  <strong>
                    Teams
                  </strong>

                  <span>
                    Your teams
                  </span>

                </div>

                <span className="quick-access-arrow">
                  <FaArrowRight />
                </span>

              </Link>


              {/* PROJECTS */}

              <Link
                to="/projects"
                className="quick-access-card"
              >

                <div className="quick-access-icon green">
                  <FaProjectDiagram />
                </div>

                <div className="quick-access-card-content">

                  <strong>
                    Projects
                  </strong>

                  <span>
                    Your projects
                  </span>

                </div>

                <span className="quick-access-arrow">
                  <FaArrowRight />
                </span>

              </Link>


              {/* MEMBERS */}

              <Link
                to="/members"
                className="quick-access-card"
              >

                <div className="quick-access-icon orange">
                  <FaUserFriends />
                </div>

                <div className="quick-access-card-content">

                  <strong>
                    Members
                  </strong>

                  <span>
                    Organization
                  </span>

                </div>

                <span className="quick-access-arrow">
                  <FaArrowRight />
                </span>

              </Link>

            </div>

          </div>


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

            <div className="team-overview-list">

              <Link
                to="/teams"
                className="team-overview-item"
              >

                <div className="team-avatar purple">
                  F
                </div>

                <div className="team-overview-content">

                  <h3>
                    Frontend Team
                  </h3>

                  <span>
                    5 members
                  </span>

                </div>

                <FaArrowRight className="recent-item-arrow" />

              </Link>


              <Link
                to="/teams"
                className="team-overview-item"
              >

                <div className="team-avatar blue">
                  B
                </div>

                <div className="team-overview-content">

                  <h3>
                    Backend Team
                  </h3>

                  <span>
                    4 members
                  </span>

                </div>

                <FaArrowRight className="recent-item-arrow" />

              </Link>


              <Link
                to="/teams"
                className="team-overview-item"
              >

                <div className="team-avatar green">
                  D
                </div>

                <div className="team-overview-content">

                  <h3>
                    Design Team
                  </h3>

                  <span>
                    3 members
                  </span>

                </div>

                <FaArrowRight className="recent-item-arrow" />

              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}