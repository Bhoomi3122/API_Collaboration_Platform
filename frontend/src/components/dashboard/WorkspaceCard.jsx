import { useNavigate } from "react-router-dom";

// ── Helpers ──────────────────────────────────────────────────
export const getVisitCounts = () => {
  try {
    return JSON.parse(localStorage.getItem("wsVisits") || "{}");
  } catch {
    return {};
  }
};

const recordVisit = (id) => {
  const counts = getVisitCounts();
  counts[id] = (counts[id] || 0) + 1;
  localStorage.setItem("wsVisits", JSON.stringify(counts));
};

function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();

  const handleClick = () => {
    recordVisit(workspace.id);
    navigate(`/workspace/${workspace.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently created";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Created today";
    if (diffDays === 1) return "Created yesterday";
    if (diffDays < 7) return `Created ${diffDays} days ago`;
    if (diffDays < 30) return `Created ${Math.floor(diffDays / 7)} weeks ago`;
    return `Created ${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="workspace-card" onClick={handleClick}>
      <div className="workspace-header">
        <h4 className="workspace-title-card">{workspace.name}</h4>
      </div>
      <p className="workspace-description">
        {workspace.description || "No description provided"}
      </p>
      <div className="workspace-footer">
        <span className="workspace-time">{formatDate(workspace.createdAt)}</span>
      </div>
    </div>
  );
}

export default WorkspaceCard;
