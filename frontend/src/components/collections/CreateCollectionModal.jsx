import { useState } from "react";
import { createCollection } from "../../services/collectionApi";
import "./CreateCollectionModal.css";

function CreateCollectionModal({ workspaceId, onClose, onCollectionCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Collection name is required";
    }
    return newErrors;
  };

  // ── Field blur validation ───────────────────────────────────────────────────
  const handleNameBlur = () => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Collection name is required" }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await createCollection({
        name: name.trim(),
        description: description.trim(),
        workspaceId: workspaceId,
      });
      onCollectionCreated(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      setApiError("Failed to create collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">New Collection</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="modal-field">
            <label className="modal-label">Collection Name <span className="required">*</span></label>
            <input
              type="text"
              className={`modal-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Auth APIs"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              onBlur={handleNameBlur}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="modal-field">
            <label className="modal-label">Description <span className="optional">(optional)</span></label>
            <textarea
              className="modal-textarea"
              placeholder="Brief description of this collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* API Error */}
          {apiError && <p className="api-error">{apiError}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreateCollectionModal;

