import { useState, useEffect } from "react";
import { Edit2, X } from "lucide-react";
import "../../styles/CreateCollection.css";

const RenameRequestModal = ({ isOpen, onClose, onSubmit, currentName = "", loading = false }) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Request name is required");
      return;
    }

    if (trimmedName === currentName) {
      setError("Please enter a different name");
      return;
    }

    onSubmit(trimmedName);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-collection-overlay" onClick={onClose}>
      <div className="create-collection-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-accent-dot" style={{ background: "#3B82F6" }}></div>
            <div>
              <h2 className="modal-title">Rename Request</h2>
              <p className="modal-subtitle">Choose a new name for your API endpoint</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" disabled={loading}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="requestName" className="form-label">
                Request Name
              </label>
              <input
                id="requestName"
                type="text"
                className="form-input"
                placeholder="e.g., Get Users, Create Order, Update Profile"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={loading}
              />
              {error && <p className="form-error">{error}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Renaming..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameRequestModal;

