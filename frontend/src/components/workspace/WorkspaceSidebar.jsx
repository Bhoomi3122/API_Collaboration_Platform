import { Folder, FolderKanban, Activity, Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/workspace.css";
const WorkspaceSidebar = ({
  workspaceName = "My Workspace",
  workspaceDescription = "",
  activeTab = "collections",
}) => {
  const navigate = useNavigate();
  const navItems = [
    { id: "collections", label: "Collections", icon: FolderKanban },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <aside className="workspace-sidebar">
      {/* Dashboard Navigation */}
      <button
        className="sidebar-dashboard-btn"
        onClick={() => navigate("/dashboard")}
        title="Back to Dashboard"
      >
        <ArrowLeft />
        <span>Dashboard</span>
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
              className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
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
