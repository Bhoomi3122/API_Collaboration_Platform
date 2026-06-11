import { Users, Folder, Zap } from "lucide-react";
import "../../styles/landing.css";

function HowItWorksSection() {
  const steps = [
    {
      icon: Users,
      title: "Step 1: Create Workspace",
      description: "Set up your workspace and invite team members via email to collaborate"
    },
    {
      icon: Folder,
      title: "Step 2: Build Collections",
      description: "Organize your endpoints by creating collections within your workspace"
    },
    {
      icon: Zap,
      title: "Step 3: Add API Requests",
      description: "Create and configure API requests with custom headers, body, and parameters"
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="step-wrapper">
                <div className="step-card">
                  <div className="step-icon-minimal">
                    <IconComponent size={20} strokeWidth={2} />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-arrow">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;

