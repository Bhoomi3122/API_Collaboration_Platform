import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";

function LandingNavbar({ showBackButton = false }) {
  const navigate = useNavigate();

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-container">
        <div className="landing-navbar-left">
          {showBackButton && (
            <button className="landing-navbar-back" onClick={() => navigate(-1)}>
              ←
            </button>
          )}
          <div className="landing-navbar-logo" onClick={() => navigate("/")}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#2F81F7" />
              <path
                d="M8 12h16M8 16h16M8 20h10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="landing-navbar-brand">Specify</span>
          </div>
        </div>

        <div className="landing-navbar-actions">
          <button className="landing-navbar-login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="landing-navbar-signup" onClick={() => navigate("/signup")}>
            Sign Up →
          </button>
        </div>
      </div>
    </nav>
  );
}

export default LandingNavbar;

