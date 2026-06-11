import {
  Send,
  Mail,
  Settings,
  Bell,
  FileText,
  Folder,
  Shield,
  Users
} from "lucide-react";
import "../../styles/landing.css";

function FeaturesSection() {
  const features = [
    {
      icon: Send,
      title: "API Requests",
      description: "Send HTTP requests with multiple methods - GET, POST, PUT, DELETE"
    },
    {
      icon: Mail,
      title: "Team Invitations",
      description: "Invite team members through email to collaborate on workspaces"
    },
    {
      icon: Settings,
      title: "Request Options",
      description: "Customize headers, body, params and authorization for each request"
    },
    {
      icon: Bell,
      title: "Recent Updates",
      description: "Track recent API requests and workspace changes in real-time"
    },
    {
      icon: FileText,
      title: "Request Bodies",
      description: "Send JSON, form data and other content types with ease"
    },
    {
      icon: Folder,
      title: "API Collections",
      description: "Organize related endpoints into collections for better management"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Control permissions with Owner, Editor and Viewer roles"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Work together with your team on shared workspaces and APIs"
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon-minimal">
                  <IconComponent size={20} strokeWidth={2} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;

