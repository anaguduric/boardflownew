import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaFolderOpen } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useOrganization } from "../../context/OrganizationContext";
import ProjectCard from "./ProjectCard";
import "./Projects.css";

export default function Projects() {
  const { token } = useAuth();
  const { currentOrganization } = useOrganization();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token || !currentOrganization?.organization_id) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const organizationId = Number(
          currentOrganization.organization_id
        );

        const response = await fetch(
          `http://localhost:3000/projects?organizationId=${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load projects."
          );
        }

        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load projects error:", err);

        setError(
          err.message || "Unable to load projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [
    token,
    currentOrganization?.organization_id,
  ]);

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

      {!currentOrganization?.organization_id ? (
        <div className="projects-empty">

          <FaFolderOpen />

          <h2>No organization selected</h2>

          <p>
            Select an organization to view its projects.
          </p>

        </div>
      ) : loading ? (
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