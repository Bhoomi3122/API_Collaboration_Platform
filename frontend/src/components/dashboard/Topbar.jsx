import { useNavigate } from "react-router-dom";
function Topbar({ onMenuOpen }) {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "";
  const displayName =
    localStorage.getItem("userName") ||
    (userEmail ? userEmail.split("@")[0] : "User");
  const avatarLetter = displayName.charAt(0).toUpperCase();
  return (
    <header className="topbar">
      {/* Hamburger — opens GlobalNavDrawer */}
      {onMenuOpen && (
        <button
          className="topbar-hamburger"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
      <div className="topbar-search">
        <input
          type="text"
          placeholder="Search workspaces, collections..."
          className="search-input"
        />
      </div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications">
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <div className="user-profile">
          <div className="avatar">{avatarLetter}</div>
          <span className="username">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
export default Topbar;
