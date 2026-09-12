import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaFolderOpen } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import ProjectCard from "./ProjectCard";
import "./Projects.css";

export default function Projects() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:3000/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load projects.");
        }

        const data = await response.json();

        setProjects(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  return (
    <div className="projects-page">

      <div className="projects-header">

        <div>
          <h1>Projects</h1>
          <p>
            Manage and organize your projects.
          </p>
        </div>

        <Link
          to="/projects/create"
          className="create-project-btn"
        >
          <FaPlus />
          <span>Create Project</span>
        </Link>

      </div>

      {loading ? (
        <div className="projects-empty">
          <FaFolderOpen />
          <h2>Loading projects...</h2>
          <p>
            Please wait while your projects are loading.
          </p>
        </div>
      ) : error ? (
        <div className="projects-empty">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <FaFolderOpen />
          <h2>No projects yet</h2>
          <p>
            Create your first project to get started.
          </p>

          <Link
            to="/projects/create"
            className="empty-create-btn"
          >
            <FaPlus />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="projects-grid">

          {projects.map((project) => (
            <ProjectCard
              key={project.project_id}
              project={project}
            />
          ))}

        </div>
      )}

    </div>
  );
}