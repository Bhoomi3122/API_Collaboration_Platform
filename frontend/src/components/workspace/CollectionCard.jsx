import { Folder, MoreVertical, Link2, Users, Clock, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import "../../styles/workspace.css";

const CollectionCard = ({ collection, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const diffDays = Math.floor((Date.now() - date) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)  return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleMenuClick = (e) => { e.stopPropagation(); setShowMenu(!showMenu); };
  const handleEdit      = (e) => { e.stopPropagation(); setShowMenu(false); if (onEdit)   onEdit(collection); };
  const handleDelete    = (e) => { e.stopPropagation(); setShowMenu(false); if (onDelete) onDelete(collection); };

  const isDraft = collection.status !== "published";

  return (
    <div className="workspace-collection-card" onClick={onClick}>
      {/* Top row: icon + name + badge + menu */}
      <div className="workspace-collection-card-top">
        <div className="workspace-collection-icon">
          <Folder size={16} strokeWidth={1.5} />
        </div>
        <div className="workspace-collection-header">
          <div className="workspace-collection-title-group">
            <h3 className="workspace-collection-title">{collection.name}</h3>
          </div>
          <div className="workspace-collection-actions">
            <span className={`workspace-collection-badge ${isDraft ? "draft" : "published"}`}>
              {isDraft ? "Draft" : "Published"}
            </span>
            <div className="collection-menu-wrapper" ref={menuRef}>
              <button className="workspace-collection-menu" onClick={handleMenuClick}>
                <MoreVertical size={15} />
              </button>
              {showMenu && (
                <div className="collection-menu-dropdown">
                  <button className="menu-item menu-item-edit" onClick={handleEdit}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="menu-item menu-item-delete" onClick={handleDelete}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {collection.description && (
        <p className="workspace-collection-description">{collection.description}</p>
      )}

      {/* Meta row */}
      <div className="workspace-collection-meta">
        <div className="workspace-collection-meta-item">
          <Link2 size={12} />
          <span>{collection.endpointCount || 0} endpoints</span>
        </div>
        <span className="workspace-collection-meta-separator">·</span>
        <div className="workspace-collection-meta-item">
          <Users size={12} />
          <span>{collection.collaboratorCount || 1} collaborators</span>
        </div>
        <span className="workspace-collection-meta-separator">·</span>
        <div className="workspace-collection-meta-item">
          <Clock size={12} />
          <span>Updated {formatDate(collection.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
