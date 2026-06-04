import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ activeItem = "Dashboard" }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { name: "Workspaces", icon: "workspaces", path: "/workspaces" },
    { name: "Invitations", icon: "team", path: "/invitations" },
    { name: "Settings", icon: "settings", path: "/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const renderIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      workspaces: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      team: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      settings: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6"></path>
          <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"></path>
          <path d="M1 12h6m6 0h6"></path>
          <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"></path>
        </svg>
      ),
    };
    return icons[iconName];
  };

  // Home / hamburger icon for toggle
  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--collapsed"}`}>
      {/* Header with toggle button */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <HomeIcon />
        </button>
        {isOpen && <h2 className="sidebar-logo">API Platform</h2>}
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${item.name === activeItem ? "active" : ""}`}
            onClick={() => handleNavigation(item.path)}
            title={!isOpen ? item.name : ""}
          >
            {item.name === activeItem && <span className="active-indicator"></span>}
            <span className="sidebar-icon">{renderIcon(item.icon)}</span>
            {isOpen && <span className="sidebar-text">{item.name}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
