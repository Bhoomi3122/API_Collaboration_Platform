import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Collaborative API Development & Testing Platform
          </h1>
          <p className="hero-subtitle">
            Simplify, test & secure collaborative API development & testing platform
          </p>

          <div className="hero-cta">
            <button className="hero-btn-primary" onClick={() => navigate("/signup")}>
              Get Started →
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate("/learn-more")}>
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
            </div>
            <div className="mockup-content">
              <div className="mockup-sidebar">
                <div className="mockup-item">
                  <span className="method-badge post">POST</span>
                  <span>Login</span>
                </div>
                <div className="mockup-item">
                  <span className="method-badge post">POST</span>
                  <span>Signup</span>
                </div>
                <div className="mockup-item">
                  <span className="method-badge get">GET</span>
                  <span>Profile</span>
                </div>
              </div>
              <div className="mockup-editor">
                <div className="mockup-url-bar">
                  <span className="method-tag">GET</span>
                  <span className="url-text">/api/workspaces</span>
                  <button className="send-btn-mockup">Send</button>
                </div>
                <div className="mockup-tabs">
                  <span className="tab active">Headers</span>
                  <span className="tab">Body</span>
                  <span className="tab">Params</span>
                </div>
                <div className="mockup-response">
                  <div className="response-line">
                    <span className="json-key">"status"</span>
                    <span>: </span>
                    <span className="json-string">"success"</span>
                  </div>
                  <div className="response-line">
                    <span className="json-key">"data"</span>
                    <span>: [...]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

