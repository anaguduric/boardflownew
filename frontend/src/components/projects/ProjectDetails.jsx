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
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Projects.css";

export default function ProjectDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteModal, setDeleteModal] = useState({
  open: false,
  task: null,
});

  // =========================================================
  // LOAD PROJECT + TASKS
  // =========================================================

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        // GET PROJECT
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

        // GET PROJECT TASKS
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

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleDeleteTask = (task) => {
    setDeleteModal({
      open: true,
      task: task,
    });
  };

  const confirmDeleteTask = async () => {
  const task = deleteModal.task;

  if (!task) {
    return;
  }

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

    setDeleteModal({
      open: false,
      task: null,
    });

  } catch (err) {
    console.error(err);

    alert(
      err.message || "Unable to delete task."
    );
  }
};

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // ERROR
  // =========================================================

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

  // =========================================================
  // FILTER TASKS BY STATUS
  // =========================================================

  const todoTasks = tasks.filter(
    (task) => Number(task.status_id) === 1
  );

  const inProgressTasks = tasks.filter(
    (task) => Number(task.status_id) === 2
  );

  const doneTasks = tasks.filter(
    (task) => Number(task.status_id) === 3
  );

  // =========================================================
  // DRAG START
  // =========================================================

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  // =========================================================
  // DRAG END
  // =========================================================

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // =========================================================
  // DROP TASK
  // =========================================================

  const handleDrop = async (statusId) => {
    if (!draggedTask) {
      return;
    }

    const oldStatusId = draggedTask.status_id;

    // Ako je task već u toj koloni
    if (Number(oldStatusId) === Number(statusId)) {
      setDraggedTask(null);
      return;
    }

    // ---------------------------------------------------------
    // OPTIMISTIC UI UPDATE
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // SAVE TO BACKEND
    // ---------------------------------------------------------

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
    } catch (err) {
      console.error(err);

      // -------------------------------------------------------
      // ROLLBACK
      // -------------------------------------------------------

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

  // =========================================================
  // RENDER TASK
  // =========================================================

  const renderTask = (task) => {
    const dueDate = task.due_date
      ? new Date(task.due_date).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        )
      : null;

    return (
      <div
        className="kanban-task"
        key={task.task_id}
        draggable
        onDragStart={() =>
          handleDragStart(task)
        }
        onDragEnd={handleDragEnd}
      >

        {/* ===================================================
            TASK TOP
        =================================================== */}

        <div className="kanban-task-top">

          <span className="kanban-task-id">
            #{task.task_id}
          </span>

          <div className="kanban-task-actions">

            {/* EDIT */}

            <Link
              to={`/tasks/${task.task_id}/edit`}
              className="kanban-task-edit"
              onClick={(event) => {
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              title="Edit task"
              aria-label="Edit task"
            >
              <FaEdit />
            </Link>

            {/* DELETE */}

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

        {/* ===================================================
            TITLE
        =================================================== */}

        <h3>
          {task.title || "Untitled task"}
        </h3>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        {task.description && (
          <p className="kanban-task-description">
            {task.description}
          </p>
        )}

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="kanban-task-footer">

          {/* ASSIGNEE */}

          <div className="kanban-assignee">

            <FaUser />

            <span>
              {task.assignee?.username ||
                "Unassigned"}
            </span>

          </div>

          {/* DUE DATE */}

          {dueDate && (
            <div className="kanban-due-date">

              <FaCalendarAlt />

              <span>
                {dueDate}
              </span>

            </div>
          )}

        </div>

      </div>
    );
  };

  // =========================================================
  // RENDER COLUMN
  // =========================================================

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

        {/* COLUMN HEADER */}

        <div className="kanban-column-header">

          <div className="kanban-column-title">

            <span className="kanban-column-dot"></span>

            <h2>
              {title}
            </h2>

          </div>

          <span className="kanban-column-count">
            {columnTasks.length}
          </span>

        </div>

        {/* COLUMN BODY */}

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

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="projects-page project-details-page">

      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        to="/projects"
        className="back-project-btn"
      >
        <FaArrowLeft />
        Back to Projects
      </Link>

      {/* =====================================================
          PROJECT HEADER
      ===================================================== */}

      <div className="project-details-header">

        <div className="project-details-title">

          <div className="project-details-icon">
            <FaTasks />
          </div>

          <div>

            <h1>
              {project.project_name}
            </h1>

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

      {/* =====================================================
          KANBAN HEADER
      ===================================================== */}

      <div className="kanban-header">

        <div>

          <h2>
            Project Board
          </h2>

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
          KANBAN BOARD
      ===================================================== */}

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

      {deleteModal.open && deleteModal.task && (

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

            <h2>
              Delete task?
            </h2>

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

    </div>
  );
}