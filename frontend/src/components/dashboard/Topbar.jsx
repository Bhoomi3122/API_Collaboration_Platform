import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  // Read user info stored at login
  const userEmail = localStorage.getItem("userEmail") || "";
  const displayName =
    localStorage.getItem("userName") ||
    (userEmail ? userEmail.split("@")[0] : "User");
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <header className="topbar">
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
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;
