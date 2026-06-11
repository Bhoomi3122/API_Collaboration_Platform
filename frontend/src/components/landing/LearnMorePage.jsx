import { useNavigate } from "react-router-dom";
import { Lock, Shield, Key, Mail, Database, CheckCircle } from "lucide-react";
import LandingNavbar from "./LandingNavbar";
import Footer from "./Footer";
import "../../styles/landing.css";

function LearnMorePage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <LandingNavbar showBackButton={true} />

      {/* Hero Section */}
      <section className="learn-hero-section">
        <div className="learn-hero-container">
          <h1 className="learn-hero-title">
            Everything You Need to Build, Test & Collaborate on APIs
          </h1>
          <p className="learn-hero-subtitle">
            Discover how Specify streamlines your API development workflow from testing to team collaboration
          </p>
        </div>
      </section>


      {/* Use Cases Section */}
      <section className="learn-usecases-section">
        <div className="learn-container">
          <h2 className="learn-section-title">Built for Teams of All Sizes</h2>

          <div className="learn-usecases-grid">
            <div className="learn-usecase-card">
              <h3 className="learn-usecase-title">For Developers</h3>
              <ul className="learn-usecase-list">
                <li>Test APIs quickly without switching tools</li>
                <li>Debug responses with clear formatting</li>
                <li>Save time with organized collections</li>
              </ul>
            </div>

            <div className="learn-usecase-card">
              <h3 className="learn-usecase-title">For QA Engineers</h3>
              <ul className="learn-usecase-list">
                <li>Create comprehensive test suites</li>
                <li>Share test cases with the team</li>
                <li>Track API behavior over time</li>
              </ul>
            </div>

            <div className="learn-usecase-card">
              <h3 className="learn-usecase-title">For Product Teams</h3>
              <ul className="learn-usecase-list">
                <li>Document API endpoints clearly</li>
                <li>Share API specs with developers</li>
                <li>Monitor project progress</li>
              </ul>
            </div>

            <div className="learn-usecase-card">
              <h3 className="learn-usecase-title">For Startups</h3>
              <ul className="learn-usecase-list">
                <li>Free collaboration for small teams</li>
                <li>Scale as you grow</li>
                <li>No complex setup required</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="learn-security-section">
        <div className="learn-container">
          <h2 className="learn-section-title">Your Data is Safe with Us</h2>

          <div className="learn-security-grid">
            <div className="learn-security-item">
              <div className="learn-security-icon-minimal">
                <Lock size={28} strokeWidth={2} />
              </div>
              <h4>Secure Authentication</h4>
              <p>JWT-based authentication with industry-standard security</p>
            </div>

            <div className="learn-security-item">
              <div className="learn-security-icon-minimal">
                <Shield size={28} strokeWidth={2} />
              </div>
              <h4>Password Encryption</h4>
              <p>All passwords are encrypted using bcrypt hashing</p>
            </div>

            <div className="learn-security-item">
              <div className="learn-security-icon-minimal">
                <Key size={28} strokeWidth={2} />
              </div>
              <h4>Access Control</h4>
              <p>Role-based permissions ensure data privacy</p>
            </div>

            <div className="learn-security-item">
              <div className="learn-security-icon-minimal">
                <Mail size={28} strokeWidth={2} />
              </div>
              <h4>Email Verification</h4>
              <p>Secure email-based team invitations</p>
            </div>

            <div className="learn-security-item">
              <div className="learn-security-icon-minimal">
                <Database size={28} strokeWidth={2} />
              </div>
              <h4>Secure Database</h4>
              <p>PostgreSQL database with encrypted connections</p>
            </div>

            <div className="learn-security-item">
              <div className="learn-security-icon-minimal">
                <CheckCircle size={28} strokeWidth={2} />
              </div>
              <h4>Data Privacy</h4>
              <p>Your API data is yours and only yours</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="learn-faq-section">
        <div className="learn-container">
          <h2 className="learn-section-title">Frequently Asked Questions</h2>

          <div className="learn-faq-list">
            <div className="learn-faq-item">
              <h3 className="learn-faq-question">Is Specify free to use?</h3>
              <p className="learn-faq-answer">
                Yes! Specify is currently free for all users with unlimited workspaces and team members.
              </p>
            </div>

            <div className="learn-faq-item">
              <h3 className="learn-faq-question">How many team members can I invite?</h3>
              <p className="learn-faq-answer">
                You can invite unlimited team members to your workspaces.
              </p>
            </div>

            <div className="learn-faq-item">
              <h3 className="learn-faq-question">What's the difference between Owner, Editor, and Viewer roles?</h3>
              <p className="learn-faq-answer">
                Owners have full control over the workspace including member management and deletion.
                Editors can create and modify API requests. Viewers have read-only access.
              </p>
            </div>

            <div className="learn-faq-item">
              <h3 className="learn-faq-question">Can I import my Postman collections?</h3>
              <p className="learn-faq-answer">
                This feature is coming soon! Currently, you can manually recreate collections in Specify.
              </p>
            </div>

            <div className="learn-faq-item">
              <h3 className="learn-faq-question">Is my data secure?</h3>
              <p className="learn-faq-answer">
                Yes! We use industry-standard encryption, JWT authentication, and secure password hashing
                to protect your data.
              </p>
            </div>

            <div className="learn-faq-item">
              <h3 className="learn-faq-question">Can I use Specify offline?</h3>
              <p className="learn-faq-answer">
                Currently, Specify requires an internet connection. Offline mode is planned for future releases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="learn-final-cta-section">
        <div className="learn-cta-container">
          <h2 className="learn-final-cta-title">Ready to Simplify Your API Development?</h2>
          <p className="learn-final-cta-subtitle">No credit card required. Start collaborating in minutes.</p>
          <button className="learn-final-cta-button" onClick={() => navigate("/signup")}>
            Get Started Free →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LearnMorePage;

