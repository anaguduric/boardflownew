import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTasks } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Tasks.css";

export default function Tasks() {
  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:3000/tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load tasks.");
        }

        const data = await response.json();

        setTasks(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  return (
    <div className="tasks-page">

      <div className="tasks-header">

        <div>
          <h1>Tasks</h1>
          <p>
            Manage and organize your tasks.
          </p>
        </div>

        <Link
          to="/tasks/create"
          className="create-task-btn"
        >
          <FaPlus />
          <span>Create Task</span>
        </Link>

      </div>


      {loading ? (
        <div className="tasks-empty">
          <FaTasks />
          <h2>Loading tasks...</h2>
          <p>
            Please wait while your tasks are loading.
          </p>
        </div>

      ) : error ? (
        <div className="tasks-empty">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>

      ) : tasks.length === 0 ? (
        <div className="tasks-empty">
          <FaTasks />

          <h2>No tasks yet</h2>

          <p>
            Create your first task to get started.
          </p>

          <Link
            to="/tasks/create"
            className="empty-create-task-btn"
          >
            <FaPlus />
            Create Task
          </Link>
        </div>

      ) : (
        <div className="tasks-list">

          {tasks.map((task) => (
            <div
              className="task-item"
              key={task.task_id}
            >
              <div>
                <h2>{task.title}</h2>

                <p>
                  {task.description}
                </p>
              </div>

              <div className="task-info">

                <span>
                  Status:{" "}
                  {task.status?.status_name ||
                    task.status_id}
                </span>

                <span>
                  Project:{" "}
                  {task.project?.project_name ||
                    task.project_id}
                </span>

                <span>
                  Assigned to:{" "}
                  {task.assignee?.username ||
                    task.assigned_to}
                </span>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}