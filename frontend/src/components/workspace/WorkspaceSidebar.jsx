import { Folder, FolderKanban, Activity, Settings, ArrowLeft, Users } from "lucide-react";
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
      {/* Back Navigation */}
      <button
        className="sidebar-dashboard-btn"
        onClick={() => navigate("/workspaces")}
        title="Back to Workspaces"
      >
        <ArrowLeft />
        <span>Workspaces</span>
      </button>
      {/* Workspace Info Card */}
      <div className="sidebar-workspace-card">
        <div className="workspace-card-icon">
          <Folder />
        </div>
        <h3 className="workspace-card-name">{workspaceName}</h3>
        {workspaceDescription && (
          <p className="workspace-card-description">{workspaceDescription}</p>
        )}
      </div>
      {/* Navigation Items */}
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
