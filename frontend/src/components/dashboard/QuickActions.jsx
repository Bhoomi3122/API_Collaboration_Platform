import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

function QuickActions({ onWorkspaceCreated }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const actions = [
    {
      title: "Create Workspace",
      description: "Start a new workspace to organise your API collections",
      icon: "create",
      onClick: () => setModalOpen(true),
    },
    {
      title: "Browse Workspaces",
      description: "View and open your existing workspaces",
      icon: "workspaces",
      onClick: () => navigate("/workspaces"),
    },
  ];

  const renderIcon = (iconName) => {
    const icons = {
      create: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
      workspaces: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    };
    return icons[iconName];
  };

  return (
    <>
      <CreateWorkspaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          if (onWorkspaceCreated) onWorkspaceCreated();
        }}
      />

      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          {actions.map((action, index) => (
            <button key={index} className="action-card" onClick={action.onClick}>
              <span className="action-icon">{renderIcon(action.icon)}</span>
              <h4 className="action-title">{action.title}</h4>
              <p className="action-description">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default QuickActions;

