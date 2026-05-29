import { Folder, FolderKanban, Activity, Settings } from "lucide-react";
import "../../styles/workspace.css";

const WorkspaceSidebar = ({ workspaceName = "My Workspace", activeTab = "collections" }) => {
  const navItems = [
    { id: "collections", label: "Collections", icon: FolderKanban },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-workspace-selector">
        <div className="workspace-selector-icon">
          <Folder />
        </div>
        <span className="workspace-selector-name">{workspaceName}</span>
      </div>

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

