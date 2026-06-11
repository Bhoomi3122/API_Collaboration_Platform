import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../../styles/CreateCollection.css";

const NameRequestModal = ({ isOpen, onClose, onSubmit, initialName = "" }) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError(null);
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Request name is required");
      return;
    }

    onSubmit(trimmedName);
    onClose();
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
            <div className="modal-accent-dot"></div>
            <div>
              <h2 className="modal-title">Name Your Request</h2>
              <p className="modal-subtitle">Choose a descriptive name for your API endpoint</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
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
              />
              {error && <p className="form-error">{error}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameRequestModal;

