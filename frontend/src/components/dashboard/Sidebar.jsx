import { useNavigate } from "react-router-dom";

function Sidebar({ activeItem = "Dashboard" }) {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { name: "Workspaces", icon: "workspaces", path: "/workspaces" },
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
      collections: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ),
      api: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      ),
      variables: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2-5.2l-4.2 4.2m0 6l4.2 4.2"></path>
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">API Platform</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${item.name === activeItem ? "active" : ""}`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.name === activeItem && <span className="active-indicator"></span>}
            <span className="sidebar-icon">{renderIcon(item.icon)}</span>
            <span className="sidebar-text">{item.name}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

