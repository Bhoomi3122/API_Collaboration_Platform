import { FolderOpen, MoreVertical, Link2, Users, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import "../../styles/workspace.css";
const CollectionCard = ({ collection, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);
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
    setShowMenu(!showMenu);
  };
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(collection);
    }
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(collection);
    }
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
            <div className="collection-menu-wrapper" ref={menuRef}>
              <button
                className="workspace-collection-menu"
                onClick={handleMenuClick}
                title="Collection options"
              >
                <MoreVertical />
              </button>
              {showMenu && (
                <div className="collection-menu-dropdown">
                  <button
                    className="menu-item menu-item-edit"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button
                    className="menu-item menu-item-delete"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
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
