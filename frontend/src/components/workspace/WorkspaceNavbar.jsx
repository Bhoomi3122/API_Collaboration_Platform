import { Bell, Code2 } from "lucide-react";
import "../../styles/workspace.css";

const WorkspaceNavbar = () => {
  const userName = localStorage.getItem("userName") || "User";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="workspace-navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <Code2 />
        </div>
        <span className="navbar-title">API Platform</span>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn">
          <Bell />
        </button>

        <div className="navbar-profile">
          <div className="navbar-avatar">{getInitials(userName)}</div>
          <span className="navbar-username">{userName}</span>
        </div>
      </div>
    </nav>
  );
};

export default WorkspaceNavbar;

