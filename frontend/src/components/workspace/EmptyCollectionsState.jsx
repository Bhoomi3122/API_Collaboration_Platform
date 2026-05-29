import { FolderPlus } from "lucide-react";
import "../../styles/workspace.css";

const EmptyCollectionsState = ({ onCreateClick }) => {
  return (
    <div className="workspace-empty-state">
      <div className="workspace-empty-icon">
        <FolderPlus />
      </div>
      <h3 className="workspace-empty-title">No collections yet</h3>
      <p className="workspace-empty-description">
        Create your first collection to organize and manage your API endpoints effectively.
      </p>
      <button className="workspace-empty-action" onClick={onCreateClick}>
        <FolderPlus />
        Create Collection
      </button>
    </div>
  );
};

export default EmptyCollectionsState;

