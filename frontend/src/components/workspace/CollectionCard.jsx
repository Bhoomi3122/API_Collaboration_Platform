import { FolderOpen, MoreVertical, Link2, Users, Clock } from "lucide-react";
import "../../styles/workspace.css";

const CollectionCard = ({ collection, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    // Handle menu actions
  };

  return (
    <div className="workspace-collection-card" onClick={onClick}>
      <div className="workspace-collection-card-top">
        <div className="workspace-collection-icon">
          <FolderOpen />
        </div>

        <div className="workspace-collection-header">
          <div className="workspace-collection-title-group">
            <h3 className="workspace-collection-title">{collection.name}</h3>
          </div>

          <div className="workspace-collection-actions">
            <span
              className={`workspace-collection-badge ${
                collection.status === "published" ? "published" : "draft"
              }`}
            >
              {collection.status === "published" ? "Published" : "Draft"}
            </span>
            <button className="workspace-collection-menu" onClick={handleMenuClick}>
              <MoreVertical />
            </button>
          </div>
        </div>
      </div>

      {collection.description && (
        <p className="workspace-collection-description">{collection.description}</p>
      )}

      <div className="workspace-collection-meta">
        <div className="workspace-collection-meta-item">
          <Link2 />
          <span>{collection.endpointCount || 0} endpoints</span>
        </div>
        <span className="workspace-collection-meta-separator">•</span>
        <div className="workspace-collection-meta-item">
          <Users />
          <span>{collection.collaboratorCount || 1} collaborators</span>
        </div>
        <span className="workspace-collection-meta-separator">•</span>
        <div className="workspace-collection-meta-item">
          <Clock />
          <span>Updated {formatDate(collection.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;

