import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaTasks,
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaComment,
  FaPaperPlane,
  FaCopy,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Projects.css";

export default function ProjectDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedTaskId, setCopiedTaskId] = useState(false);

  /* =========================================================
     TASK SEARCH
  ========================================================= */

  const [taskSearch, setTaskSearch] = useState("");

  /* =========================================================
     DELETE TASK MODAL
  ========================================================= */

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    task: null,
  });

  /* =========================================================
     COMMENTS
  ========================================================= */

  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  /* =========================================================
     DELETE COMMENT MODAL
  ========================================================= */

  const [deleteCommentModal, setDeleteCommentModal] = useState({
    open: false,
    comment: null,
    taskId: null,
  });

  /* =========================================================
     TASK DETAILS SIDE PANEL
  ========================================================= */

  const [taskDetailsPanel, setTaskDetailsPanel] = useState({
    open: false,
    task: null,
  });

  /* =========================================================
     LOAD PROJECT + TASKS
  ========================================================= */

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        const projectResponse = await fetch(
          `http://localhost:3000/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!projectResponse.ok) {
          throw new Error("Failed to load project.");
        }

        const projectData = await projectResponse.json();

        setProject(projectData);

        const tasksResponse = await fetch(
          `http://localhost:3000/projects/${id}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!tasksResponse.ok) {
          throw new Error("Failed to load project tasks.");
        }

        const tasksData = await tasksResponse.json();

        console.log("TASKS FROM BACKEND:", tasksData);

        setTasks(tasksData);
      } catch (err) {
        console.error(err);
        setError("Unable to load project.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchProjectData();
    }
  }, [token, id]);

  /* =========================================================
     FETCH COMMENTS
  ========================================================= */

  const fetchComments = async (taskId) => {
    if (!token || !taskId) return;

    try {
      setCommentsLoading((current) => ({
        ...current,
        [taskId]: true,
      }));

      setCommentErrors((current) => ({
        ...current,
        [taskId]: "",
      }));

      const response = await fetch(
        `http://localhost:3000/task-comments/task/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load comments.");
      }

      const data = await response.json();

      console.log(`COMMENTS FOR TASK ${taskId}:`, data);

      setComments((current) => ({
        ...current,
        [taskId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error(err);

      setCommentErrors((current) => ({
        ...current,
        [taskId]: "Unable to load comments.",
      }));
    } finally {
      setCommentsLoading((current) => ({
        ...current,
        [taskId]: false,
      }));
    }
  };

  /* =========================================================
     TOGGLE COMMENTS
  ========================================================= */

  const toggleComments = async (taskId) => {
    const isCurrentlyOpen = expandedComments[taskId];

    setExpandedComments((current) => ({
      ...current,
      [taskId]: !isCurrentlyOpen,
    }));

    if (isCurrentlyOpen) {
      return;
    }

    await fetchComments(taskId);
  };

  /* =========================================================
     COMMENT INPUT
  ========================================================= */

  const handleCommentChange = (taskId, value) => {
    setCommentInputs((current) => ({
      ...current,
      [taskId]: value,
    }));
  };

  /// Copy function
  const handleCopyTaskId = async (taskId) => {
    try {
      await navigator.clipboard.writeText(String(taskId));

      setCopiedTaskId(true);

      setTimeout(() => {
        setCopiedTaskId(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy task ID:", error);
    }
  };

  /* =========================================================
     ADD COMMENT
  ========================================================= */

  const handleAddComment = async (taskId) => {
    const commentText = commentInputs[taskId]?.trim() || "";

    if (!commentText) return;

    try {
      setCommentSubmitting((current) => ({
        ...current,
        [taskId]: true,
      }));

      setCommentErrors((current) => ({
        ...current,
        [taskId]: "",
      }));

      const response = await fetch(
        `http://localhost:3000/task-comments/task/${taskId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task_id: taskId,
            comment_text: commentText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add comment."
        );
      }

      console.log("COMMENT CREATED:", data);

      setCommentInputs((current) => ({
        ...current,
        [taskId]: "",
      }));

      await fetchComments(taskId);
    } catch (err) {
      console.error(err);

      setCommentErrors((current) => ({
        ...current,
        [taskId]: err.message || "Unable to add comment.",
      }));
    } finally {
      setCommentSubmitting((current) => ({
        ...current,
        [taskId]: false,
      }));
    }
  };

  /* =========================================================
     ENTER = ADD COMMENT
  ========================================================= */

  const handleCommentKeyDown = (event, taskId) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleAddComment(taskId);
    }
  };

  /* =========================================================
     DELETE COMMENT
  ========================================================= */

  const handleDeleteComment = (comment, taskId) => {
    setDeleteCommentModal({
      open: true,
      comment,
      taskId,
    });
  };

  const confirmDeleteComment = async () => {
    const comment = deleteCommentModal.comment;
    const taskId = deleteCommentModal.taskId;

    if (!comment || !taskId) return;

    try {
      const response = await fetch(
        `http://localhost:3000/task-comments/${comment.comment_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete comment."
        );
      }

      setComments((current) => ({
        ...current,
        [taskId]: (current[taskId] || []).filter(
          (item) => item.comment_id !== comment.comment_id
        ),
      }));

      setDeleteCommentModal({
        open: false,
        comment: null,
        taskId: null,
      });
    } catch (err) {
      console.error(err);

      setCommentErrors((current) => ({
        ...current,
        [taskId]: err.message || "Unable to delete comment.",
      }));
    }
  };

  /* =========================================================
     DELETE TASK
  ========================================================= */

  const handleDeleteTask = (task) => {
    setDeleteModal({
      open: true,
      task,
    });
  };

  const confirmDeleteTask = async () => {
    const task = deleteModal.task;

    if (!task) return;

    try {
      const response = await fetch(
        `http://localhost:3000/tasks/${task.task_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete task."
        );
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (item) => item.task_id !== task.task_id
        )
      );

      setComments((current) => {
        const updated = { ...current };

        delete updated[task.task_id];

        return updated;
      });

      setCommentInputs((current) => {
        const updated = { ...current };

        delete updated[task.task_id];

        return updated;
      });

      setExpandedComments((current) => {
        const updated = { ...current };

        delete updated[task.task_id];

        return updated;
      });

      setTaskDetailsPanel((current) => {
        if (current.task?.task_id === task.task_id) {
          return {
            open: false,
            task: null,
          };
        }

        return current;
      });

      setDeleteModal({
        open: false,
        task: null,
      });
    } catch (err) {
      console.error(err);

      alert(err.message || "Unable to delete task.");
    }
  };

  /* =========================================================
     TASK DETAILS PANEL
  ========================================================= */

  const openTaskDetails = async (task) => {
    setTaskDetailsPanel({
      open: true,
      task,
    });

    await fetchComments(task.task_id);
  };

  const closeTaskDetails = () => {
    setTaskDetailsPanel({
      open: false,
      task: null,
    });
  };

  /* =========================================================
     COMMENT HELPERS
  ========================================================= */

  const formatCommentDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCommentUsername = (comment) => {
    return (
      comment.user?.username ||
      comment.username ||
      comment.author?.username ||
      "User"
    );
  };

  const getCommentText = (comment) => {
    return (
      comment.comment ||
      comment.content ||
      comment.comment_text ||
      comment.text ||
      ""
    );
  };

  const canDeleteComment = (comment) => {
    const commentUserId =
      comment.user_id ||
      comment.user?.user_id ||
      comment.user?.id;

    const currentUserId =
      user?.user_id ||
      user?.id;

    if (commentUserId && currentUserId) {
      return (
        Number(commentUserId) === Number(currentUserId)
      );
    }

    return true;
  };

  /* =========================================================
     COMMENTS ON KANBAN CARD
  ========================================================= */

  const renderComments = (task) => {
    const taskId = task.task_id;

    const taskComments = comments[taskId] || [];

    const isExpanded = expandedComments[taskId];

    const isLoading = commentsLoading[taskId];

    const commentError = commentErrors[taskId];

    const commentValue = commentInputs[taskId] || "";

    const isSubmitting = commentSubmitting[taskId];

    return (
      <div className="task-comments">
        <button
          type="button"
          className={`task-comments-toggle ${
            isExpanded
              ? "task-comments-toggle-active"
              : ""
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            toggleComments(taskId);
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="task-comments-toggle-left">
            <FaComment />

            <span>Comments</span>

            <span className="task-comments-count">
              {taskComments.length}
            </span>
          </div>

          <span
            className={`task-comments-arrow ${
              isExpanded
                ? "task-comments-arrow-open"
                : ""
            }`}
          >
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="task-comments-content">
            <div className="task-comments-list">
              {isLoading ? (
                <div className="task-comments-loading">
                  Loading comments...
                </div>
              ) : taskComments.length === 0 ? (
                <div className="task-comments-empty">
                  No comments yet.
                </div>
              ) : (
                taskComments.map((comment) => (
                  <div
                    className="task-comment"
                    key={comment.comment_id}
                  >
                    <div className="task-comment-avatar">
                      <FaUser />
                    </div>

                    <div className="task-comment-content">
                      <div className="task-comment-top">
                        <div className="task-comment-author">
                          <strong>
                            {getCommentUsername(comment)}
                          </strong>

                          <span>
                            {formatCommentDate(
                              comment.created_at ||
                                comment.createdAt
                            )}
                          </span>
                        </div>

                        {canDeleteComment(comment) && (
                          <button
                            type="button"
                            className="task-comment-delete"
                            title="Delete comment"
                            aria-label="Delete comment"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              handleDeleteComment(
                                comment,
                                taskId
                              );
                            }}
                            onMouseDown={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <p>{getCommentText(comment)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {commentError && (
              <div className="task-comment-error">
                {commentError}
              </div>
            )}

            <div className="task-comment-form">
              <textarea
                value={commentValue}
                onChange={(event) =>
                  handleCommentChange(
                    taskId,
                    event.target.value
                  )
                }
                onKeyDown={(event) =>
                  handleCommentKeyDown(
                    event,
                    taskId
                  )
                }
                placeholder="Write a comment..."
                rows={2}
                disabled={isSubmitting}
                onClick={(event) =>
                  event.stopPropagation()
                }
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
              />

              <button
                type="button"
                className="task-comment-submit"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  handleAddComment(taskId);
                }}
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                disabled={
                  isSubmitting ||
                  !commentValue.trim()
                }
              >
                <FaPaperPlane />

                <span>
                  {isSubmitting
                    ? "Adding..."
                    : "Add Comment"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-empty">
          <FaTasks />

          <h2>Loading project...</h2>

          <p>
            Please wait while the project is loading.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !project) {
    return (
      <div className="projects-page">
        <div className="projects-empty">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <Link
            to="/projects"
            className="back-project-btn"
          >
            <FaArrowLeft />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     TASK SEARCH + COLUMNS
  ========================================================= */

  const normalizedSearch = taskSearch
    .trim()
    .toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    if (!normalizedSearch) {
      return true;
    }

    const title = String(
      task.title || ""
    ).toLowerCase();

    const description = String(
      task.description || ""
    ).toLowerCase();

    const taskId = String(
      task.task_id || ""
    ).toLowerCase();

    const assignee = String(
      task.assignee?.username || ""
    ).toLowerCase();

    return (
      title.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      taskId.includes(normalizedSearch) ||
      assignee.includes(normalizedSearch)
    );
  });

  const todoTasks = filteredTasks.filter(
    (task) => Number(task.status_id) === 1
  );

  const inProgressTasks = filteredTasks.filter(
    (task) => Number(task.status_id) === 2
  );

  const doneTasks = filteredTasks.filter(
    (task) => Number(task.status_id) === 3
  );

  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (statusId) => {
    if (!draggedTask) return;

    const oldStatusId = draggedTask.status_id;

    if (
      Number(oldStatusId) === Number(statusId)
    ) {
      setDraggedTask(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.task_id === draggedTask.task_id
          ? {
              ...task,
              status_id: statusId,
            }
          : task
      )
    );

    const taskId = draggedTask.task_id;

    setDraggedTask(null);

    try {
      const response = await fetch(
        `http://localhost:3000/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status_id: statusId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update task status."
        );
      }

      const updatedTask = await response.json();

      console.log(
        "TASK STATUS UPDATED:",
        updatedTask
      );

      /* Update task in details panel too */
      setTaskDetailsPanel((current) => {
        if (
          current.task?.task_id === taskId
        ) {
          return {
            ...current,
            task: {
              ...current.task,
              status_id: statusId,
            },
          };
        }

        return current;
      });
    } catch (err) {
      console.error(err);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.task_id === taskId
            ? {
                ...task,
                status_id: oldStatusId,
              }
            : task
        )
      );
    }
  };

  /* =========================================================
     RENDER TASK
  ========================================================= */

  const renderTask = (task) => {
    const dueDate = task.due_date
      ? new Date(
          task.due_date
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;

    return (
      <div
        className="kanban-task"
        key={task.task_id}
        draggable
        onClick={() => openTaskDetails(task)}
        onDragStart={() =>
          handleDragStart(task)
        }
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-task-top">
          <span className="kanban-task-id">
            #{task.task_id}
          </span>

          <div className="kanban-task-actions">
            <Link
              to={`/tasks/${task.task_id}/edit`}
              className="kanban-task-edit"
              onClick={(event) =>
                event.stopPropagation()
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              title="Edit task"
              aria-label="Edit task"
            >
              <FaEdit />
            </Link>

            <button
              type="button"
              className="kanban-task-delete"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                handleDeleteTask(task);
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onDragStart={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              title="Delete task"
              aria-label="Delete task"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        <h3>
          {task.title || "Untitled task"}
        </h3>

        {task.description && (
          <p className="kanban-task-description">
            {task.description}
          </p>
        )}

        <div className="kanban-task-footer">
          <div className="kanban-assignee">
            <FaUser />

            <span>
              {task.assignee?.username ||
                "Unassigned"}
            </span>
          </div>

          {dueDate && (
            <div className="kanban-due-date">
              <FaCalendarAlt />

              <span>{dueDate}</span>
            </div>
          )}
        </div>

        {renderComments(task)}
      </div>
    );
  };

  /* =========================================================
     RENDER COLUMN
  ========================================================= */

  const renderColumn = (
    title,
    columnClass,
    columnTasks,
    statusId
  ) => {
    return (
      <div
        className={`kanban-column ${columnClass} ${
          draggedTask
            ? "kanban-column-drag-active"
            : ""
        }`}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={() =>
          handleDrop(statusId)
        }
      >
        <div className="kanban-column-header">
          <div className="kanban-column-title">
            <span className="kanban-column-dot"></span>

            <h2>{title}</h2>
          </div>

          <span className="kanban-column-count">
            {columnTasks.length}
          </span>
        </div>

        <div className="kanban-column-body">
          {columnTasks.length === 0 ? (
            <div className="kanban-empty">
              <FaTasks />

              <span>
                {draggedTask
                  ? "Drop task here"
                  : "No tasks"}
              </span>
            </div>
          ) : (
            columnTasks.map(renderTask)
          )}
        </div>
      </div>
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="projects-page project-details-page">

      {/* BACK */}

      <Link
        to="/projects"
        className="back-project-btn"
      >
        <FaArrowLeft />
        Back to Projects
      </Link>

      {/* PROJECT HEADER */}

      <div className="project-details-header">
        <div className="project-details-title">
          <div className="project-details-icon">
            <FaTasks />
          </div>

          <div>
            <h1>{project.project_name}</h1>

            <p>
              {project.description ||
                "No description provided."}
            </p>
          </div>
        </div>

        <Link
          to={`/tasks/create?projectId=${project.project_id}`}
          className="create-project-btn"
        >
          <FaPlus />
          Create Task
        </Link>
      </div>

      {/* KANBAN HEADER */}

      <div className="kanban-header">
        <div>
          <h2>Project Board</h2>

          <p>
            Manage tasks and track project progress.
          </p>
        </div>

        <div className="kanban-total">
          <FaTasks />

          <span>
            {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* =====================================================
          TASK SEARCH
      ===================================================== */}

      <div className="task-search-wrapper">
        <div className="task-search-box">
          <svg
            className="task-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />

            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
            />
          </svg>

          <input
            type="text"
            value={taskSearch}
            onChange={(event) =>
              setTaskSearch(
                event.target.value
              )
            }
            placeholder="Search tasks..."
            className="task-search-input"
          />

          {taskSearch && (
            <button
              type="button"
              className="task-search-clear"
              onClick={() =>
                setTaskSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {taskSearch && (
          <span className="task-search-results">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1
              ? "task"
              : "tasks"}{" "}
            found
          </span>
        )}
      </div>

      {/* KANBAN */}

      <div className="kanban-board">
        {renderColumn(
          "To Do",
          "kanban-todo",
          todoTasks,
          1
        )}

        {renderColumn(
          "In Progress",
          "kanban-progress",
          inProgressTasks,
          2
        )}

        {renderColumn(
          "Done",
          "kanban-done",
          doneTasks,
          3
        )}
      </div>

      {/* =====================================================
          DELETE TASK MODAL
      ===================================================== */}

      {deleteModal.open &&
        deleteModal.task && (
          <div
            className="delete-modal-overlay"
            onClick={() =>
              setDeleteModal({
                open: false,
                task: null,
              })
            }
          >
            <div
              className="delete-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="delete-modal-icon">
                <FaTrash />
              </div>

              <h2>Delete task?</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  "{deleteModal.task.title}"
                </strong>
                ?
              </p>

              <span className="delete-modal-warning">
                This action cannot be undone.
              </span>

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  onClick={() =>
                    setDeleteModal({
                      open: false,
                      task: null,
                    })
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-modal-confirm"
                  onClick={confirmDeleteTask}
                >
                  <FaTrash />
                  Delete task
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          DELETE COMMENT MODAL
      ===================================================== */}

      {deleteCommentModal.open &&
        deleteCommentModal.comment && (
          <div
            className="delete-modal-overlay"
            onClick={() =>
              setDeleteCommentModal({
                open: false,
                comment: null,
                taskId: null,
              })
            }
          >
            <div
              className="delete-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="delete-modal-icon">
                <FaTrash />
              </div>

              <h2>Delete comment?</h2>

              <p>
                Are you sure you want to delete this
                comment?
              </p>

              <span className="delete-modal-warning">
                This action cannot be undone.
              </span>

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  onClick={() =>
                    setDeleteCommentModal({
                      open: false,
                      comment: null,
                      taskId: null,
                    })
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-modal-confirm"
                  onClick={confirmDeleteComment}
                >
                  <FaTrash />
                  Delete comment
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          TASK DETAILS SIDE PANEL
      ===================================================== */}

      {taskDetailsPanel.open &&
        taskDetailsPanel.task && (
          <>
            <div
              className="task-details-panel-backdrop"
              onClick={closeTaskDetails}
            />

            <aside
              className="task-details-panel"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* PANEL HEADER */}

              <div className="task-details-panel-header">
                <div>
                  <span className="task-details-panel-id">
                    TASK #{taskDetailsPanel.task.task_id}
                  </span>

                  <h2>
                    {taskDetailsPanel.task.title ||
                      "Untitled task"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="task-details-panel-close"
                  onClick={closeTaskDetails}
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="task-details-id">
                  <span>
                    #{taskDetailsPanel.task.task_id}
                  </span>

                  <button
                    type="button"
                    className={`copy-task-id-btn ${
                      copiedTaskId ? "copied" : ""
                    }`}
                    onClick={() =>
                      handleCopyTaskId(
                        taskDetailsPanel.task.task_id
                      )
                    }
                    title={
                      copiedTaskId
                        ? "Copied"
                        : "Copy Task ID"
                    }
                  >
                    <FaCopy />

                    <span>
                      {copiedTaskId
                        ? "Copied"
                        : "Copy ID"}
                    </span>
                  </button>
                </div>
              </div>

              {/* PANEL CONTENT */}

              <div className="task-details-panel-content">

                {/* STATUS */}

                <div className="task-details-panel-section">
                  <span className="task-details-panel-label">
                    Status
                  </span>

                  <span
                    className={`task-details-panel-status ${
                      Number(
                        taskDetailsPanel.task.status_id
                      ) === 1
                        ? "task-status-todo"
                        : Number(
                            taskDetailsPanel.task.status_id
                          ) === 2
                        ? "task-status-progress"
                        : "task-status-done"
                    }`}
                  >
                    {Number(
                      taskDetailsPanel.task.status_id
                    ) === 1
                      ? "To Do"
                      : Number(
                          taskDetailsPanel.task.status_id
                        ) === 2
                      ? "In Progress"
                      : "Done"}
                  </span>
                </div>

                {/* DESCRIPTION */}

                <div className="task-details-panel-section">
                  <span className="task-details-panel-label">
                    Description
                  </span>

                  <p className="task-details-panel-description">
                    {taskDetailsPanel.task.description ||
                      "No description provided."}
                  </p>
                </div>

                {/* INFO */}

                <div className="task-details-panel-info">

                  <div className="task-details-panel-info-item">
                    <FaUser />

                    <div>
                      <span>Assignee</span>

                      <strong>
                        {taskDetailsPanel.task.assignee
                          ?.username ||
                          "Unassigned"}
                      </strong>
                    </div>
                  </div>

                  <div className="task-details-panel-info-item">
                    <FaCalendarAlt />

                    <div>
                      <span>Due date</span>

                      <strong>
                        {taskDetailsPanel.task.due_date
                          ? new Date(
                              taskDetailsPanel.task.due_date
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "No due date"}
                      </strong>
                    </div>
                  </div>

                </div>

                {/* COMMENTS */}

                <div className="task-details-panel-comments">

                  <div className="task-details-panel-comments-header">
                    <h3>Comments</h3>

                    <span>
                      {(
                        comments[
                          taskDetailsPanel.task.task_id
                        ] || []
                      ).length}
                    </span>
                  </div>

                  {commentsLoading[
                    taskDetailsPanel.task.task_id
                  ] ? (
                    <div className="task-details-panel-loading">
                      Loading comments...
                    </div>
                  ) : (
                    <div className="task-details-panel-comments-list">

                      {(
                        comments[
                          taskDetailsPanel.task.task_id
                        ] || []
                      ).length === 0 ? (
                        <div className="task-details-panel-empty">
                          No comments yet.
                        </div>
                      ) : (
                        (
                          comments[
                            taskDetailsPanel.task.task_id
                          ] || []
                        ).map((comment) => (
                          <div
                            className="task-details-panel-comment"
                            key={comment.comment_id}
                          >
                            <div className="task-comment-avatar">
                              <FaUser />
                            </div>

                            <div className="task-details-panel-comment-body">

                              <div className="task-details-panel-comment-top">

                                <div>
                                  <strong>
                                    {getCommentUsername(
                                      comment
                                    )}
                                  </strong>

                                  <span>
                                    {formatCommentDate(
                                      comment.created_at ||
                                        comment.createdAt
                                    )}
                                  </span>
                                </div>

                                {canDeleteComment(
                                  comment
                                ) && (
                                  <button
                                    type="button"
                                    className="task-comment-delete"
                                    title="Delete comment"
                                    aria-label="Delete comment"
                                    onClick={() => {
                                      handleDeleteComment(
                                        comment,
                                        taskDetailsPanel
                                          .task
                                          .task_id
                                      );
                                    }}
                                  >
                                    <FaTrash />
                                  </button>
                                )}

                              </div>

                              <p>
                                {getCommentText(comment)}
                              </p>

                            </div>
                          </div>
                        ))
                      )}

                    </div>
                  )}

                  {/* ADD COMMENT INSIDE PANEL */}

                  <div className="task-details-panel-comment-form">

                    {commentErrors[
                      taskDetailsPanel.task.task_id
                    ] && (
                      <div className="task-comment-error">
                        {
                          commentErrors[
                            taskDetailsPanel.task.task_id
                          ]
                        }
                      </div>
                    )}

                    <textarea
                      value={
                        commentInputs[
                          taskDetailsPanel.task.task_id
                        ] || ""
                      }
                      onChange={(event) =>
                        handleCommentChange(
                          taskDetailsPanel.task.task_id,
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleCommentKeyDown(
                          event,
                          taskDetailsPanel.task.task_id
                        )
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      onMouseDown={(event) =>
                        event.stopPropagation()
                      }
                      placeholder="Write a comment..."
                      rows={3}
                      disabled={
                        commentSubmitting[
                          taskDetailsPanel.task.task_id
                        ]
                      }
                    />

                    <button
                      type="button"
                      className="task-comment-submit"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        handleAddComment(
                          taskDetailsPanel.task.task_id
                        );
                      }}
                      onMouseDown={(event) =>
                        event.stopPropagation()
                      }
                      disabled={
                        commentSubmitting[
                          taskDetailsPanel.task.task_id
                        ] ||
                        !(
                          commentInputs[
                            taskDetailsPanel.task.task_id
                          ] || ""
                        ).trim()
                      }
                    >
                      <FaPaperPlane />

                      <span>
                        {commentSubmitting[
                          taskDetailsPanel.task.task_id
                        ]
                          ? "Adding..."
                          : "Add Comment"}
                      </span>
                    </button>

                  </div>

                </div>
              </div>

              {/* PANEL FOOTER */}

              <div className="task-details-panel-footer">

                <Link
                  to={`/tasks/${taskDetailsPanel.task.task_id}/edit`}
                  className="task-details-panel-edit"
                  onClick={closeTaskDetails}
                >
                  <FaEdit />
                  Edit Task
                </Link>

                <button
                  type="button"
                  className="task-details-panel-close-button"
                  onClick={closeTaskDetails}
                >
                  Close
                </button>

              </div>
            </aside>
          </>
        )}

    </div>
  );
}