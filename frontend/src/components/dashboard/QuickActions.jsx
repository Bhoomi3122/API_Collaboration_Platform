function QuickActions() {
  const actions = [
    {
      title: "Create Workspace",
      description: "Start a new workspace for your APIs",
      icon: "create",
    },
    {
      title: "New Collection",
      description: "Organize your API requests",
      icon: "collection",
    },
    {
      title: "Send API Request",
      description: "Test your API endpoints",
      icon: "send",
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
      collection: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      send: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      ),
    };
    return icons[iconName];
  };

  return (
    <div className="quick-actions">
      <h3 className="section-title">Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <button key={index} className="action-card">
            <span className="action-icon">{renderIcon(action.icon)}</span>
            <h4 className="action-title">{action.title}</h4>
            <p className="action-description">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;

