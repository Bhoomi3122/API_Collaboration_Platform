import { FolderKanban, Activity, Settings, ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/workspace.css";
const WorkspaceSidebar = ({
  workspaceName = "My Workspace",
  workspaceDescription = "",
  activeTab = "collections",
  onTabChange = () => {},
}) => {
  const navigate = useNavigate();
  const navItems = [
    { id: "collections", label: "Collections", icon: FolderKanban },
    { id: "members", label: "Members", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <aside className="workspace-sidebar">
      {/* ── Workspace Header (back arrow + name) ── */}
      <div className="ws-sidebar-header">
        <button
          className="ws-sidebar-back-btn"
          onClick={() => navigate("/workspaces")}
          title="Back to Workspaces"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="ws-sidebar-title-group">
          <h2 className="ws-sidebar-workspace-name">{workspaceName}</h2>
          {workspaceDescription && (
            <p className="ws-sidebar-workspace-desc">{workspaceDescription}</p>
          )}
        </div>
      </div>
      {/* ── Navigation Items ── */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`sidebar-nav-item ${
                activeTab === item.id ? "active" : ""
              }`}
              onClick={() => onTabChange(item.id)}
              style={{ cursor: "pointer" }}
            >
              <Icon />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
export default WorkspaceSidebar;
