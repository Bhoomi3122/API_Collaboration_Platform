import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, User, Mail, Settings, LogOut } from "lucide-react";
import GlobalNavDrawer from "./GlobalNavDrawer";
import "../../styles/AppNavbar.css";

/**
 * Shared top navbar used on EVERY page.
 * Props:
 *   subtitle   {string} – page context after the divider (e.g. "Dashboard")
 *   activeItem {string} – passed to GlobalNavDrawer to highlight current section
 */
const AppNavbar = ({ subtitle = "", activeItem = "" }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fullName  = localStorage.getItem("userName")  || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  // First name only everywhere
  const userName = fullName
    ? fullName.trim().split(" ")[0]
    : (userEmail ? userEmail.split("@")[0] : "User");

  // Single initial — first letter of first name only (consistent across navbar + dropdown)
  const getInitial = (name) => name.charAt(0).toUpperCase();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    const handleKey = (e) => { if (e.key === "Escape") setDropdownOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const menuItem = (Icon, label, onClick, danger = false) => (
    <button
      className={`app-navbar-menu-item${danger ? " app-navbar-menu-item--danger" : ""}`}
      onClick={() => { setDropdownOpen(false); onClick(); }}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <GlobalNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem={activeItem}
      />

      <nav className="app-navbar">
        {/* ── Left ────────────────────────────── */}
        <div className="app-navbar-left">
          <button
            className="app-navbar-hamburger"
            onClick={() => setDrawerOpen(true)}
            title="Open navigation"
            aria-label="Open navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="app-navbar-logo-wrap" onClick={() => navigate("/dashboard")} title="Go to Dashboard">
            <div className="app-navbar-logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="app-navbar-logo-text">Specify</span>
          </div>

          {subtitle && (
            <>
              <span className="app-navbar-divider">|</span>
              <span className="app-navbar-subtitle">{subtitle}</span>
            </>
          )}
        </div>

        {/* ── Right ───────────────────────────── */}
        <div className="app-navbar-right">
          <button className="app-navbar-icon-btn" title="Notifications">
            <Bell size={16} />
          </button>

          {/* Profile trigger */}
          <div
            className={`app-navbar-profile${dropdownOpen ? " app-navbar-profile--open" : ""}`}
            onClick={() => setDropdownOpen((v) => !v)}
            ref={dropdownRef}
          >
            <div className="app-navbar-avatar">{getInitial(userName)}</div>
            <span className="app-navbar-username">{userName}</span>
            <ChevronDown
              size={13}
              className={`app-navbar-chevron${dropdownOpen ? " app-navbar-chevron--open" : ""}`}
            />

            {/* ── Dropdown ── */}
            {dropdownOpen && (
              <div className="app-navbar-dropdown" onClick={(e) => e.stopPropagation()}>

                {/* Header — name + email */}
                <div className="app-navbar-dropdown-header">
                  <div className="app-navbar-dropdown-avatar">{getInitial(userName)}</div>
                  <div className="app-navbar-dropdown-info">
                    <span className="app-navbar-dropdown-name">{userName}</span>
                    <span className="app-navbar-dropdown-email">{userEmail || "No email saved"}</span>
                  </div>
                </div>


                {/* Menu items */}
                {menuItem(User, "My Profile", () => navigate("/profile"))}
                {menuItem(Mail, "Invitations", () => navigate("/invitations"))}

                <div className="app-navbar-dropdown-divider" />

                {menuItem(LogOut, "Logout", handleLogout, true)}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default AppNavbar;

