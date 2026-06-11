import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";

function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">"Start building and testing APIs today"</h2>
        <button className="cta-button" onClick={() => navigate("/signup")}>
          Get Started →
        </button>
      </div>
    </section>
  );
}

export default CTASection;

