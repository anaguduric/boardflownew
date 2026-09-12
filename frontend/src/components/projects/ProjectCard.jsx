import { Link } from "react-router-dom";
import {
  FaFolder,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ProjectCard({ project }) {
  const createdDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )
    : "";

  return (
    <Link
      to={`/projects/${project.project_id}`}
      className="project-card"
    >

      <div className="project-card-top">

        <div className="project-icon">
          <FaFolder />
        </div>

        <span className="project-id">
          #{project.project_id}
        </span>

      </div>

      <h2>
        {project.project_name}
      </h2>

      <p className="project-description">
        {project.description ||
          "No description provided."}
      </p>

      <div className="project-card-footer">

        <div>
          <FaUser />

          <span>
            {project.creator?.username ||
              "Unknown user"}
          </span>
        </div>

        <div>
          <FaCalendarAlt />

          <span>
            {createdDate}
          </span>
        </div>

      </div>

    </Link>
  );
}