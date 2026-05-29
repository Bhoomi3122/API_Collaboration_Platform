import { useNavigate } from "react-router-dom";

function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/workspace/${workspace.id}`);
  };

  return (
    <div className="workspace-card" onClick={handleClick}>
      <div className="workspace-header">
        <h4 className="workspace-title-card">{workspace.name}</h4>
        <span className="workspace-badge">{workspace.apiCount} APIs</span>
      </div>
      <p className="workspace-description">{workspace.description}</p>
      <div className="workspace-footer">
        <div className="collaborators">
          {workspace.collaborators.map((collab, index) => (
            <div key={index} className="collaborator-avatar" title={collab}>
              {collab.charAt(0)}
            </div>
          ))}
        </div>
        <span className="workspace-time">{workspace.lastUpdated}</span>
      </div>
    </div>
  );
}

export default WorkspaceCard;

