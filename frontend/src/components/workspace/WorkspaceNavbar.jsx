import { useState } from "react";
import { Bell, Code2 } from "lucide-react";
import GlobalNavDrawer from "../common/GlobalNavDrawer";
import "../../styles/workspace.css";

const WorkspaceNavbar = () => {
  const userName = localStorage.getItem("userName") || "User";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <nav className="workspace-navbar">
        <div className="navbar-left">
          {/* Hamburger / home icon */}
          <button
            className="navbar-hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            title="Open navigation"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
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

      <GlobalNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="Workspaces"
      />
    </>
  );
};

export default WorkspaceNavbar;
