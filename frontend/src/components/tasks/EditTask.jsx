import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaTasks,
  FaSave,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./EditTask.css";

export default function EditTask() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState("1");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // =============================
        // GET TASK
        // =============================

        const taskResponse = await fetch(
          `http://localhost:3000/tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!taskResponse.ok) {
          throw new Error("Failed to load task.");
        }

        const taskData = await taskResponse.json();

        setTask(taskData);

        setTitle(taskData.title || "");
        setDescription(taskData.description || "");
        setStatusId(String(taskData.status_id || 1));
        setAssignedTo(
          taskData.assigned_to
            ? String(taskData.assigned_to)
            : ""
        );

        // datetime-local expects YYYY-MM-DDTHH:mm
        if (taskData.due_date) {
          const date = new Date(taskData.due_date);

          const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16);

          setDueDate(localDate);
        }

        // =============================
        // GET PROJECT
        // =============================

        const projectResponse = await fetch(
          `http://localhost:3000/projects/${taskData.project_id}`,
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

        // =============================
        // GET USERS
        // =============================

        const usersResponse = await fetch(
          "http://localhost:3000/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!usersResponse.ok) {
          throw new Error("Failed to load users.");
        }

        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load task.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      loadData();
    }
  }, [token, id]);

  // =============================
  // SAVE CHANGES
  // =============================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Task description is required.");
      return;
    }

    if (!dueDate) {
      setError("Due date is required.");
      return;
    }

    if (!assignedTo) {
      setError("Please select a user.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:3000/tasks/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            status_id: Number(statusId),
            due_date: new Date(dueDate).toISOString(),
            assigned_to: Number(assignedTo),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update task."
        );
      }

      navigate(`/projects/${task.project_id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update task.");
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // LOADING
  // =============================

  if (loading) {
    return (
      <div className="create-task-page">
        <div className="create-task-loading">
          <FaTasks />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // =============================
  // ERROR
  // =============================

  if (!task || !project) {
    return (
      <div className="create-task-page">
        <div className="create-task-error-page">
          <FaTasks />

          <h2>Something went wrong</h2>

          <p>
            {error || "Task could not be loaded."}
          </p>

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

  // =============================
  // PAGE
  // =============================

  return (
    <div className="create-task-page">
      <Link
        to={`/projects/${task.project_id}`}
        className="create-task-back"
      >
        <FaArrowLeft />
        Back to Project
      </Link>

      <div className="create-task-header">
        <div className="create-task-header-left">
          <div className="create-task-icon">
            <FaTasks />
          </div>

          <div>
            <h1>Edit Task</h1>

            <p>
              Update task information for{" "}
              <strong>{project.project_name}</strong>
            </p>
          </div>
        </div>
      </div>

      <form
        className="create-task-card"
        onSubmit={handleSubmit}
      >
        <div className="create-task-card-header">
          <div>
            <h2>Task details</h2>

            <p>
              Update the information needed to organize
              this task.
            </p>
          </div>

          <div className="task-card-project">
            <FaTasks />
            <span>{project.project_name}</span>
          </div>
        </div>

        {error && (
          <div className="create-task-form-error">
            {error}
          </div>
        )}

        {/* TITLE */}

        <div className="task-field">
          <label htmlFor="title">
            Task title
          </label>

          <input
            id="title"
            type="text"
            placeholder="e.g. Implement login page"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            maxLength={255}
          />
        </div>

        {/* DESCRIPTION */}

        <div className="task-field">
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            placeholder="Describe what needs to be done..."
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={5}
          />
        </div>

        {/* STATUS + DATE */}

        <div className="task-details-grid">
          <div className="task-field">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              value={statusId}
              onChange={(event) =>
                setStatusId(event.target.value)
              }
            >
              <option value="1">
                To Do
              </option>

              <option value="2">
                In Progress
              </option>

              <option value="3">
                Done
              </option>
            </select>
          </div>

          <div className="task-field">
            <label htmlFor="dueDate">
              Due date
            </label>

            <div className="task-input-icon">
              <FaCalendarAlt />

              <input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* ASSIGNED USER */}

        <div className="task-field">
          <label htmlFor="assignedTo">
            Assign to
          </label>

          <div className="task-input-icon">
            <FaUser />

            <select
              id="assignedTo"
              value={assignedTo}
              onChange={(event) =>
                setAssignedTo(event.target.value)
              }
            >
              <option value="">
                Select team member
              </option>

              {users.map((user) => (
                <option
                  key={user.user_id}
                  value={user.user_id}
                >
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FOOTER */}

        <div className="create-task-footer">
          <Link
            to={`/projects/${task.project_id}`}
            className="cancel-task-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="save-task-btn"
            disabled={saving}
          >
            <FaSave />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}