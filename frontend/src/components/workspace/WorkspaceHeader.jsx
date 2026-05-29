import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/workspace.css";

const WorkspaceHeader = ({ workspace }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="workspace-page-header">
      <Link to="/dashboard" className="workspace-back-link">
        <ArrowLeft />
        Dashboard
      </Link>

      <h1 className="workspace-page-title">{workspace.name || "Workspace"}</h1>

      {workspace.description && (
        <p className="workspace-page-description">{workspace.description}</p>
      )}

      <div className="workspace-page-meta">
        <Calendar />
        <span>Created {formatDate(workspace.createdAt)}</span>
      </div>
    </div>
  );
};

export default WorkspaceHeader;

