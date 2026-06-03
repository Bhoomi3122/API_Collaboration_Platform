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

function WorkspaceCard({ workspace, role = "OWNER" }) {
  const navigate = useNavigate();

  const ROLE_STYLES = {
    OWNER:  { bg: "#DCFCE7", color: "#16A34A" },
    EDITOR: { bg: "#DBEAFE", color: "#2563EB" },
    VIEWER: { bg: "#EDE9FE", color: "#7C3AED" },
  };
  const rs = ROLE_STYLES[role] || ROLE_STYLES.OWNER;

  const handleClick = () => {
    recordVisit(workspace.id);
    navigate(`/workspace/${workspace.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently created";
    const date = new Date(dateString);
    return "Created " + date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="workspace-card" onClick={handleClick}>
      <div className="workspace-header">
        <h4 className="workspace-title-card">{workspace.name}</h4>
        <span className="ws-role-badge" style={{ background: rs.bg, color: rs.color }}>
          {role.charAt(0) + role.slice(1).toLowerCase()}
        </span>
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
