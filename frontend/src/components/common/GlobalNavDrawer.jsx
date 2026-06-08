import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { clearAuth } from "../../utils/auth";
import "../../styles/globalNavDrawer.css";
import "../../styles/members.css";
const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    name: "Workspaces",
    path: "/workspaces",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
  {
    name: "Invitations",
    path: "/invitations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    name: "Settings",
    path: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6"></path>
        <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"></path>
        <path d="M1 12h6m6 0h6"></path>
        <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"></path>
      </svg>
    ),
  },
];
// ── Logout Confirmation Modal ─────────────────────────────────
const LogoutModal = ({ onConfirm, onClose }) => (
  <div
    className="modal-overlay"
    style={{ zIndex: 1100 }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="invite-modal" style={{ maxWidth: 440 }}>
      <div className="invite-modal-header">
        <div className="invite-modal-title-group">
          <div className="invite-modal-icon" style={{ background: "#FEF2F2", color: "#DC2626" }}>
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
      <div className="invite-modal-body">
        <p style={{ fontSize: 14, color: "#111827", margin: 0, lineHeight: 1.7, fontWeight: 700 }}>
          Are you sure you want to sign out?
        </p>
        <p style={{ fontSize: 14, color: "#111825", margin: 0, fontWeight: 400, lineHeight: 1.7 }}>
          Your work is automatically saved. You can pick up right where you left off anytime.
        </p>
        <div className="invite-modal-footer" style={{ paddingTop: 8 }}>
          <button className="invite-btn-cancel" onClick={onClose}>Stay Here</button>
          <button
            onClick={onConfirm}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 18px", background: "#DC2626", border: "none",
              borderRadius: 7, fontSize: 13, fontWeight: 500,
              color: "#FFFFFF", cursor: "pointer", transition: "background 0.15s",
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
// ── Global Nav Drawer ─────────────────────────────────────────
const GlobalNavDrawer = ({ isOpen, onClose, activeItem = "" }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };
  const confirmLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };
  return (
    <>
      {/* Backdrop */}
      <div
        className={`gnd-backdrop ${isOpen ? "gnd-backdrop--visible" : ""}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`gnd-drawer ${isOpen ? "gnd-drawer--open" : ""}`}>
        {/* Header */}
        <div className="gnd-header">
          <div className="gnd-logo-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span className="gnd-logo-text">Specify</span>
          </div>
          <button className="gnd-close-btn" onClick={onClose} title="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {/* Navigation items */}
        <nav className="gnd-nav">
          <p className="gnd-nav-label">Navigation</p>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`gnd-nav-item ${item.name === activeItem ? "gnd-nav-item--active" : ""}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="gnd-nav-icon">{item.icon}</span>
              <span className="gnd-nav-text">{item.name}</span>
              {item.name === activeItem && <span className="gnd-active-dot" />}
            </div>
          ))}
        </nav>
        {/* Logout button */}
        <div className="gnd-footer">
          <div
            className="gnd-nav-item gnd-logout-item"
            onClick={() => { onClose(); setShowLogoutModal(true); }}
          >
            <span className="gnd-nav-icon"><LogOut size={18} /></span>
            <span className="gnd-nav-text">Logout</span>
          </div>
        </div>
      </div>
      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};
export default GlobalNavDrawer;
