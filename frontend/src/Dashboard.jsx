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
  DASHBOARD DATA
  ============================================================
  */

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loadingDashboardData, setLoadingDashboardData] =
    useState(true);

  const [dashboardDataError, setDashboardDataError] =
    useState("");

  /*
  ============================================================
  TEAMS
  ============================================================
  */

  const [teams, setTeams] = useState([]);

  const [teamMembers, setTeamMembers] = useState({});

  const [loadingTeams, setLoadingTeams] =
    useState(true);

  const [teamsError, setTeamsError] =
    useState("");

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
  USER ID
  ============================================================
  */

  const currentUserId =
    user?.id != null
      ? Number(user.id)
      : user?.user_id != null
        ? Number(user.user_id)
        : null;

  /*
  ============================================================
  LOAD PROJECTS + TASKS
  ============================================================
  */

  const loadDashboardData = async () => {
    if (!token || !user) {
      return;
    }

    try {
      setLoadingDashboardData(true);
      setDashboardDataError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [projectsResponse, tasksResponse] =
        await Promise.all([
          fetch(`${API_URL}/projects`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/tasks`, {
            method: "GET",
            headers,
          }),
        ]);

      if (!projectsResponse.ok) {
        throw new Error(
          "Failed to load projects"
        );
      }

      if (!tasksResponse.ok) {
        throw new Error(
          "Failed to load tasks"
        );
      }

      const projectsData =
        await projectsResponse.json();

      const tasksData =
        await tasksResponse.json();

      setProjects(
        Array.isArray(projectsData)
          ? projectsData
          : []
      );

      setTasks(
        Array.isArray(tasksData)
          ? tasksData
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      setDashboardDataError(
        "Unable to load dashboard data."
      );

      setProjects([]);
      setTasks([]);
    } finally {
      setLoadingDashboardData(false);
    }
  };

  /*
  ============================================================
  LOAD DASHBOARD DATA
  ============================================================
  */

  useEffect(() => {
    if (!user || !token) {
      setProjects([]);
      setTasks([]);
      setLoadingDashboardData(false);
      return;
    }

    loadDashboardData();
  }, [user, token]);

  /*
  ============================================================
  LOAD TEAMS + TEAM MEMBERS
  ============================================================
  */

  const loadTeamsData = async () => {
    if (!token || !user) {
      return;
    }

    try {
      setLoadingTeams(true);
      setTeamsError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const teamsResponse =
        await fetch(`${API_URL}/teams`, {
          method: "GET",
          headers,
        });

      if (!teamsResponse.ok) {
        throw new Error(
          "Failed to load teams"
        );
      }

      const teamsData =
        await teamsResponse.json();

      const loadedTeams =
        Array.isArray(teamsData)
          ? teamsData
          : [];

      setTeams(loadedTeams);

      /*
      ----------------------------------------------------------
      Load members for every team.

      The backend currently exposes:
      GET /team-members/team/:teamId

      so we load each team's members separately.
      ----------------------------------------------------------
      */

      if (loadedTeams.length === 0) {
        setTeamMembers({});
        return;
      }

      const memberResults =
        await Promise.allSettled(
          loadedTeams.map(async (team) => {
            const response =
              await fetch(
                `${API_URL}/team-members/team/${team.team_id}`,
                {
                  method: "GET",
                  headers,
                }
              );

            if (!response.ok) {
              throw new Error(
                `Failed to load members for team ${team.team_id}`
              );
            }

            const data =
              await response.json();

            return {
              teamId: team.team_id,
              members: Array.isArray(data)
                ? data
                : [],
            };
          })
        );

      const membersByTeam = {};

      memberResults.forEach(
        (result) => {
          if (
            result.status === "fulfilled"
          ) {
            membersByTeam[
              result.value.teamId
            ] = result.value.members;
          }
        }
      );

      setTeamMembers(
        membersByTeam
      );
    } catch (error) {
      console.error(
        "Teams data error:",
        error
      );

      setTeamsError(
        "Unable to load teams."
      );

      setTeams([]);
      setTeamMembers({});
    } finally {
      setLoadingTeams(false);
    }
  };

  /*
  ============================================================
  LOAD TEAMS
  ============================================================
  */

  useEffect(() => {
    if (!user || !token) {
      setTeams([]);
      setTeamMembers({});
      setLoadingTeams(false);
      return;
    }

    loadTeamsData();
  }, [user, token]);

  /*
  ============================================================
  TEAM MEMBER COUNT
  ============================================================
  */

  const allTeamMembers =
    Object.values(teamMembers)
      .flat();

  const uniqueMemberIds =
    new Set(
      allTeamMembers
        .map((member) =>
          Number(member.user_id)
        )
        .filter(
          (userId) =>
            !Number.isNaN(userId)
        )
    );

  const memberCount =
    uniqueMemberIds.size;

  /*
  ============================================================
  TEAM COUNT
  ============================================================
  */

  const teamCount =
    teams.length;

  /*
  ============================================================
  TEAM OVERVIEW
  ============================================================
  */

  const teamOverview =
    teams
      .map((team) => {
        const members =
          teamMembers[
            team.team_id
          ] || [];

        return {
          ...team,
          members,
          memberCount:
            members.length,
        };
      })
      .slice(0, 5);

  /*
  ============================================================
  TASK HELPERS
  ============================================================
  */

  const isCompletedTask = (task) => {
    if (!task) {
      return false;
    }

    /*
    ----------------------------------------------------------
    Current BoardFlow statuses:

    1 = To Do
    2 = In Progress
    3 = Done
    ----------------------------------------------------------
    */

    if (Number(task.status_id) === 3) {
      return true;
    }

    /*
    ----------------------------------------------------------
    Extra protection if backend later returns status object
    ----------------------------------------------------------
    */

    const statusName =
      task.status?.status_name ||
      task.status?.name ||
      "";

    return (
      statusName.toLowerCase() === "done" ||
      statusName.toLowerCase() === "completed"
    );
  };

  /*
  ============================================================
  USER TASKS
  ============================================================
  */

  const myTasks =
    currentUserId === null
      ? []
      : tasks.filter(
          (task) =>
            Number(task.assigned_to) ===
            currentUserId
        );

  /*
  ============================================================
  TASK PROGRESS
  ============================================================
  */

  const completedMyTasks =
    myTasks.filter(isCompletedTask);

  const totalMyTasks =
    myTasks.length;

  const completedMyTasksCount =
    completedMyTasks.length;

  const remainingMyTasksCount =
    Math.max(
      totalMyTasks -
        completedMyTasksCount,
      0
    );

  const taskProgress =
    totalMyTasks > 0
      ? Math.round(
          (completedMyTasksCount /
            totalMyTasks) *
            100
        )
      : 0;

  /*
  ============================================================
  PROJECT OVERVIEW
  ============================================================
  */

  const projectOverview =
    projects
      .map((project) => {
        const projectTasks =
          tasks.filter(
            (task) =>
              Number(task.project_id) ===
              Number(project.project_id)
          );

        const completedTasks =
          projectTasks.filter(
            isCompletedTask
          );

        const totalTasks =
          projectTasks.length;

        const completedCount =
          completedTasks.length;

        const progress =
          totalTasks > 0
            ? Math.round(
                (completedCount /
                  totalTasks) *
                  100
              )
            : 0;

        return {
          ...project,
          projectTasks,
          totalTasks,
          completedCount,
          progress,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || 0
        ).getTime();

        return dateB - dateA;
      });

  /*
  ============================================================
  RECENT PROJECTS
  ============================================================
  */

  const recentProjects =
    [...projects]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);

  /*
  ============================================================
  PROJECT COUNT
  ============================================================
  */

  const projectCount =
    projects.length;

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
        throw new Error(
          "Failed to connect Google Calendar"
        );
      }

      const data =
        await response.json();

      window.location.href =
        data.url;
    } catch (error) {
      console.error(
        "Google Calendar connection error:",
        error
      );

      alert(
        "Failed to connect Google Calendar."
      );
    }
  };

  /*
  ============================================================
  GET GOOGLE CALENDAR EVENTS
  ============================================================
  */

  const loadGoogleCalendarEvents =
    async () => {
      if (!token) {
        return;
      }

      setLoadingEvents(true);
      setEventsError("");

      try {
        const response =
          await fetch(
            `${API_URL}/google-calendar/events`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load Google Calendar events"
          );
        }

        const data =
          await response.json();

        const calendarEvents =
          Array.isArray(data.events)
            ? data.events
            : [];

        const now =
          new Date();

        const upcomingEvents =
          calendarEvents
            .filter((event) => {
              const startValue =
                event.start?.dateTime ||
                event.start?.date;

              if (!startValue) {
                return false;
              }

              const eventStart =
                new Date(
                  startValue
                );

              return (
                eventStart >= now
              );
            })
            .sort((a, b) => {
              const startA =
                new Date(
                  a.start?.dateTime ||
                    a.start?.date
                );

              const startB =
                new Date(
                  b.start?.dateTime ||
                    b.start?.date
                );

              return (
                startA - startB
              );
            });

        setEvents(
          upcomingEvents
        );
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

    const checkGoogleCalendar =
      async () => {
        try {
          const response =
            await fetch(
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

          const data =
            await response.json();

          setGoogleCalendarConnected(
            data.connected
          );

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

  const loadChatConversations =
    async () => {
      if (!token || !user) {
        return;
      }

      try {
        setLoadingChat(true);

        const response =
          await fetch(
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

        const data =
          await response.json();

        const conversations =
          Array.isArray(data)
            ? data
            : [];

        const normalizedConversations =
          conversations.map(
            (conversation) => ({
              ...conversation,
              is_group: Boolean(
                Number(
                  conversation.is_group
                )
              ),
            })
          );

        setChatConversations(
          normalizedConversations
        );

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
                currentUserId !==
                  null &&
                Number(
                  lastMessage.user_id
                ) !== currentUserId
              );
            }
          );

        setChatUnreadCount(
          unreadConversations.length
        );

        setChatNotification(
          unreadConversations.length >
            0
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

    const interval =
      setInterval(() => {
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

    socket.on(
      "connect",
      () => {
        console.log(
          "Dashboard chat socket connected:",
          socket.id
        );
      }
    );

    socket.on(
      "new_message",
      (data) => {
        if (
          currentUserId !== null &&
          Number(data.user_id) ===
            currentUserId
        ) {
          return;
        }

        setChatNotification(true);

        setChatUnreadCount(
          (previous) =>
            previous + 1
        );

        loadChatConversations();
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Dashboard chat socket disconnected"
        );
      }
    );

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Dashboard chat socket error:",
          error
        );
      }
    );

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
        const dateA =
          new Date(
            a.last_message?.timestamp ||
              0
          );

        const dateB =
          new Date(
            b.last_message?.timestamp ||
              0
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

    const isMine =
      currentUserId !== null &&
      Number(lastMessage.user_id) ===
        currentUserId;

    if (isMine) {
      return `You: ${lastMessage.message}`;
    }

    return `${
      lastMessage.username ||
      "New message"
    }: ${lastMessage.message}`;
  };

  /*
  ============================================================
  CHAT TIME
  ============================================================
  */

  const getChatTime = () => {
    if (
      !latestChat?.last_message
        ?.timestamp
    ) {
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
  DATE FORMAT
  ============================================================
  */

  const formatProjectDate = (
    date
  ) => {
    if (!date) {
      return "No date";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "No date";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /*
  ============================================================
  TASK STATUS CLASS
  ============================================================
  */

  const getTaskStatusClass = (
    task
  ) => {
    const statusId =
      Number(task.status_id);

    if (statusId === 3) {
      return "completed";
    }

    if (statusId === 2) {
      return "in-progress";
    }

    return "todo";
  };

  /*
  ============================================================
  TASK STATUS TEXT
  ============================================================
  */

  const getTaskStatusText = (
    task
  ) => {
    const statusId =
      Number(task.status_id);

    if (statusId === 3) {
      return "Completed";
    }

    if (statusId === 2) {
      return "In Progress";
    }

    return "To Do";
  };

  /*
  ============================================================
  TASK DUE TEXT
  ============================================================
  */

  const getTaskDueText = (
    task
  ) => {
    if (!task.due_date) {
      return "No due date";
    }

    const dueDate =
      new Date(task.due_date);

    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return "No due date";
    }

    if (
      isCompletedTask(task)
    ) {
      return "Completed";
    }

    const now =
      new Date();

    const today =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    const taskDay =
      new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate()
      );

    const difference =
      Math.round(
        (taskDay - today) /
          (1000 * 60 * 60 * 24)
      );

    if (difference === 0) {
      return "Today";
    }

    if (difference === 1) {
      return "Tomorrow";
    }

    if (difference === -1) {
      return "Yesterday";
    }

    return dueDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  /*
  ============================================================
  MY TASKS PREVIEW
  ============================================================
  */

  const myTasksPreview =
    [...myTasks]
      .sort((a, b) => {
        const dateA =
          new Date(
            a.due_date || 0
          ).getTime();

        const dateB =
          new Date(
            b.due_date || 0
          ).getTime();

        return dateA - dateB;
      })
      .slice(0, 4);

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
              <span>
                Build better teams.
              </span>
            </h1>

            <p className="landing-description">
              BoardFlow helps teams organize
              projects, manage tasks,
              collaborate with teammates
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
                      <span>
                        Projects
                      </span>

                      <strong>
                        12
                      </strong>
                    </div>

                    <div className="preview-card">
                      <span>
                        Tasks
                      </span>

                      <strong>
                        28
                      </strong>
                    </div>

                    <div className="preview-card">
                      <span>
                        Teams
                      </span>

                      <strong>
                        4
                      </strong>
                    </div>

                  </div>

                  <div className="preview-calendar">

                    <div className="preview-calendar-title">
                      Calendar
                    </div>

                    <div className="preview-calendar-grid">

                      {Array.from(
                        {
                          length: 21,
                        },
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
              Organize your work and keep
              your team connected without
              unnecessary complexity.
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
                Organize your projects,
                track progress and keep
                everything structured.
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
                Collaborate with your
                teammates and manage
                your workspace together.
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
                Keep track of your tasks,
                deadlines and daily
                responsibilities.
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
                Connect your Google Calendar
                and manage your schedule
                from one place.
              </p>

            </div>

          </div>

        </section>

        <section className="landing-cta">

          <h2>
            Ready to organize your work?
          </h2>

          <p>
            Create your workspace and
            start working with your team.
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
            Welcome back,{" "}
            {user.username}
          </h1>

          <p>
            Here's what's happening with
            your workspace today.
          </p>

        </div>

        <Link
          to="/projects"
          className="dashboard-action"
        >
          <FaPlus />
          <span>
            New Project
          </span>
        </Link>

      </section>

      {/* =====================================================
          TOP STAT CARDS
      ===================================================== */}

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
            {loadingDashboardData
              ? "—"
              : projectCount}
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
            {loadingDashboardData
              ? "—"
              : totalMyTasks}
          </span>

          <p>
            Assigned to you
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
            {loadingTeams
              ? "—"
              : teamCount}
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
            {loadingTeams
              ? "—"
              : memberCount}
          </span>

          <p>
            Team members
          </p>

        </div>

      </section>

      {dashboardDataError && (
        <div className="dashboard-data-error">
          {dashboardDataError}
        </div>
      )}

      {teamsError && (
        <div className="dashboard-data-error">
          {teamsError}
        </div>
      )}

      <section className="dashboard-main-layout">

        <div className="dashboard-main-left">

          {/* =================================================
              TASK PROGRESS
          ================================================= */}

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
                {loadingDashboardData
                  ? "—"
                  : `${taskProgress}%`}
              </span>

            </div>

            <div className="task-progress-content">

              <div
                className="progress-ring"
                style={{
                  "--progress": `${taskProgress}%`,
                }}
              >

                <div className="progress-ring-inner">

                  <strong>
                    {loadingDashboardData
                      ? "—"
                      : `${taskProgress}%`}
                  </strong>

                  <span>
                    completed
                  </span>

                </div>

              </div>

              <div className="progress-info">

                <h3>
                  {loadingDashboardData
                    ? "Loading tasks..."
                    : totalMyTasks === 0
                      ? "No tasks assigned"
                      : taskProgress >= 75
                        ? "You're doing great!"
                        : taskProgress >= 40
                          ? "You're making progress!"
                          : "Let's get started!"}
                </h3>

                <p>

                  <strong>
                    {loadingDashboardData
                      ? "—"
                      : completedMyTasksCount}
                  </strong>{" "}

                  of{" "}

                  <strong>
                    {loadingDashboardData
                      ? "—"
                      : totalMyTasks}
                  </strong>{" "}

                  tasks completed

                </p>

                <div className="progress-bar">

                  <div
                    className="progress-bar-value"
                    style={{
                      width: `${taskProgress}%`,
                    }}
                  />

                </div>

                <div className="progress-meta">

                  <span>
                    {loadingDashboardData
                      ? "—"
                      : completedMyTasksCount}{" "}
                    completed
                  </span>

                  <span>
                    {loadingDashboardData
                      ? "—"
                      : remainingMyTasksCount}{" "}
                    remaining
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              CALENDAR
          ================================================= */}

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
                      onClick={
                        connectGoogleCalendar
                      }
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
                  Connect your Google Calendar
                  to see your events and
                  meetings here.
                </p>

                <button
                  className="connect-calendar-btn"
                  type="button"
                  onClick={
                    connectGoogleCalendar
                  }
                >
                  Connect Calendar
                </button>

              </div>

            )}

          </div>

          {/* =================================================
              PROJECT OVERVIEW
          ================================================= */}

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

              {loadingDashboardData ? (

                <div className="dashboard-empty-state">
                  Loading projects...
                </div>

              ) : projectOverview.length === 0 ? (

                <div className="dashboard-empty-state">

                  <h3>
                    No projects yet
                  </h3>

                  <p>
                    Create your first project
                    to see its progress here.
                  </p>

                </div>

              ) : (

                projectOverview
                  .slice(0, 5)
                  .map((project) => (
                    <div
                      className="project-row"
                      key={
                        project.project_id
                      }
                    >

                      <div className="project-row-top">

                        <div className="project-name">

                          {project.project_name}

                        </div>

                        <span>
                          {project.progress}%
                        </span>

                      </div>

                      <div className="project-progress">

                        <div
                          className="project-progress-value"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />

                      </div>

                      <div className="project-meta">

                        <span>
                          {
                            project.completedCount
                          }{" "}
                          of{" "}
                          {
                            project.totalTasks
                          }{" "}
                          tasks completed
                        </span>

                        <span>
                          Created{" "}
                          {formatProjectDate(
                            project.created_at
                          )}
                        </span>

                      </div>

                    </div>
                  ))

              )}

            </div>

          </div>

          {/* =================================================
              MY TASKS
          ================================================= */}

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

              {loadingDashboardData ? (

                <div className="dashboard-empty-state">
                  Loading tasks...
                </div>

              ) : myTasksPreview.length === 0 ? (

                <div className="dashboard-empty-state">

                  <h3>
                    No tasks assigned
                  </h3>

                  <p>
                    Tasks assigned to you
                    will appear here.
                  </p>

                </div>

              ) : (

                myTasksPreview.map(
                  (task) => (
                    <div
                      className="task-overview-item"
                      key={
                        task.task_id
                      }
                    >

                      <div
                        className={`task-status-dot ${getTaskStatusClass(
                          task
                        )}`}
                      />

                      <div className="task-overview-content">

                        <h3>
                          {task.title}
                        </h3>

                        <span>
                          {task.project
                            ?.project_name ||
                            projects.find(
                              (project) =>
                                Number(
                                  project.project_id
                                ) ===
                                Number(
                                  task.project_id
                                )
                            )?.project_name ||
                            "Project"}
                        </span>

                      </div>

                      <div
                        className={`task-due ${
                          getTaskDueText(
                            task
                          ) === "Today"
                            ? "today"
                            : ""
                        }`}
                      >
                        {getTaskDueText(
                          task
                        )}
                      </div>

                    </div>
                  )
                )

              )}

            </div>

          </div>

          {/* =================================================
              RECENT PROJECTS
          ================================================= */}

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

              {loadingDashboardData ? (

                <div className="dashboard-empty-state">
                  Loading projects...
                </div>

              ) : recentProjects.length ===
                0 ? (

                <div className="dashboard-empty-state">

                  <h3>
                    No projects yet
                  </h3>

                  <p>
                    Your recent projects
                    will appear here.
                  </p>

                </div>

              ) : (

                recentProjects
                  .slice(0, 3)
                  .map(
                    (
                      project,
                      index
                    ) => (
                      <Link
                        to={`/projects/${project.project_id}`}
                        className="recent-item"
                        key={
                          project.project_id
                        }
                      >

                        <div
                          className={`recent-item-icon ${
                            index === 0
                              ? "purple"
                              : index === 1
                                ? "blue"
                                : "green"
                          }`}
                        >
                          <FaFolder />
                        </div>

                        <div className="recent-item-content">

                          <h3>
                            {
                              project.project_name
                            }
                          </h3>

                          <p>
                            Created{" "}
                            {formatProjectDate(
                              project.created_at
                            )}
                          </p>

                        </div>

                        <FaArrowRight className="recent-item-arrow" />

                      </Link>
                    )
                  )

              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="dashboard-main-right">

          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

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
                  Connect your Google Calendar
                  to see your upcoming events here.
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
                  Your upcoming Google Calendar
                  events will appear here.
                </p>

              </div>

            ) : (

              <div className="upcoming-events-list">

                {events
                  .slice(0, 5)
                  .map((event) => {

                    const startValue =
                      event.start?.dateTime ||
                      event.start?.date;

                    const eventDate =
                      startValue
                        ? new Date(
                            startValue
                          )
                        : null;

                    const isAllDay =
                      event.start?.date &&
                      !event.start
                        ?.dateTime;

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
                                    month:
                                      "short",
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
                                      weekday:
                                        "short",
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
                                        hour:
                                          "numeric",
                                        minute:
                                          "2-digit",
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

          {/* =================================================
              QUICK ACCESS
          ================================================= */}

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

              {/* =================================================
                  CHAT
              ================================================= */}

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

              {/* =================================================
                  MICROSOFT TEAMS
              ================================================= */}

              <a
                href="https://teams.cloud.microsoft/"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-access-card"
              >

                <div className="quick-access-icon blue">
                  <FaUsers />
                </div>

                <div className="quick-access-card-content">

                  <strong>
                    Microsoft Teams
                  </strong>

                  <span>
                    Open Microsoft Teams
                  </span>

                </div>

                <span className="quick-access-arrow">
                  <FaArrowRight />
                </span>

              </a>

              {/* =================================================
                  GITHUB
              ================================================= */}

              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-access-card"
              >

                <div className="quick-access-icon green">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.79 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02.01 2.04.14 3 .42 2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.69.83.57A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0Z" />
                  </svg>
                </div>

                <div className="quick-access-card-content">

                  <strong>
                    GitHub
                  </strong>

                  <span>
                    Open GitHub
                  </span>

                </div>

                <span className="quick-access-arrow">
                  <FaArrowRight />
                </span>

              </a>

            </div>

          </div>

          {/* =================================================
              TEAM OVERVIEW
          ================================================= */}

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

              {loadingTeams ? (

                <div className="dashboard-empty-state">

                  <h3>
                    Loading teams...
                  </h3>

                  <p>
                    Getting your teams and members.
                  </p>

                </div>

              ) : teams.length === 0 ? (

                <div className="dashboard-empty-state">

                  <h3>
                    No teams yet
                  </h3>

                  <p>
                    Create a team to see it
                    here.
                  </p>

                </div>

              ) : (

                teamOverview.map(
                  (team) => (
                    <div
                      className="team-overview-item"
                      key={team.team_id}
                    >

                      <div className="team-overview-icon">
                        <FaUsers />
                      </div>

                      <div className="team-overview-content">

                        <h3>
                          {team.team_name}
                        </h3>

                        <p>
                          {team.memberCount}{" "}
                          {team.memberCount === 1
                            ? "member"
                            : "members"}
                        </p>

                      </div>

                      <Link
                        to={`/teams/${team.team_id}`}
                        className="team-overview-arrow"
                        aria-label={`Open ${team.team_name}`}
                      >
                        <FaArrowRight />
                      </Link>

                    </div>
                  )
                )

              )}

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}