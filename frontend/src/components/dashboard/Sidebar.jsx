import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { clearAuth } from "../../utils/auth";
import "../../styles/members.css";

// ── Logout Confirmation Modal ─────────────────────────────────────────────────
const LogoutModal = ({ onConfirm, onClose }) => (
  <div
    className="modal-overlay"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="invite-modal" style={{ maxWidth: 440 }}>

      {/* Header */}
      <div className="invite-modal-header">
        <div className="invite-modal-title-group">
          <div
            className="invite-modal-icon"
            style={{ background: "#FEF2F2", color: "#DC2626" }}
          >
            <LogOut size={18} />
          </div>
          <div>
            <p className="invite-modal-title">Sign Out</p>
          </div>
        </div>
        <button className="invite-modal-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="invite-modal-body">

        <p style={{
          fontSize: 14,
          color: "#111827",
          margin: 0,
          lineHeight: 1.7,
          fontWeight: 700,
        }}>
          Are you sure you want to sign out?
        </p>

        <p style={{
          fontSize: 14,
          color: "#111825",
          margin: 0,
          fontWeight:400,
          lineHeight: 1.7,
        }}>
          Your work is automatically saved. You can pick up right where you left off anytime.
        </p>

        {/* Footer */}
        <div className="invite-modal-footer" style={{ paddingTop: 8 }}>
          <button className="invite-btn-cancel" onClick={onClose}>
            Stay Here
          </button>
          <button
            onClick={onConfirm}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 18px",
              background: "#DC2626",
              border: "none",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              color: "#FFFFFF",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>

    </div>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeItem = "Dashboard" }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { name: "Workspaces", icon: "workspaces", path: "/workspaces" },
    { name: "Invitations", icon: "team", path: "/invitations" },
    { name: "Settings", icon: "settings", path: "/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
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
    <>
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
          {isOpen && <h2 className="sidebar-logo">Specify</h2>}
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

        {/* Logout button at bottom */}
        <div className="sidebar-footer">
          <div
            className="sidebar-item sidebar-logout-item"
            onClick={handleLogout}
            title={!isOpen ? "Logout" : ""}
          >
            <span className="sidebar-icon">
              <LogOut size={18} />
            </span>
            {isOpen && <span className="sidebar-text">Logout</span>}
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
