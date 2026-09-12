import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Projects.css";

export default function CreateProject() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            project_name: projectName.trim(),
            description: description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      // Nakon uspešnog kreiranja
      navigate("/projects");

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="projects-page">

      <div className="create-project-page">

        <button
          type="button"
          className="back-project-btn"
          onClick={() => navigate("/projects")}
        >
          <FaArrowLeft />
          Back to Projects
        </button>

        <div className="create-project-card">

          <div className="create-project-heading">
            <div className="create-project-icon">
              <FaPlus />
            </div>

            <div>
              <h1>Create Project</h1>

              <p>
                Create a new project and start
                organizing your work.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="project-form-group">

              <label htmlFor="projectName">
                Project name
              </label>

              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
                placeholder="Enter project name"
                maxLength={100}
                disabled={loading}
              />

            </div>

            <div className="project-form-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe your project..."
                rows={5}
                disabled={loading}
              />

            </div>

            {error && (
              <div className="project-form-error">
                {error}
              </div>
            )}

            <div className="project-form-actions">

              <button
                type="button"
                className="cancel-project-btn"
                onClick={() =>
                  navigate("/projects")
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-project-btn"
                disabled={loading}
              >
                <FaPlus />

                {loading
                  ? "Creating..."
                  : "Create Project"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}