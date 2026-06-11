import { useState } from "react";
import { X, Check } from "lucide-react";
import { createWorkspace } from "../../services/workspaceApi";
import "../../styles/CreateCollection.css"; // reuse same modal styles

const CreateWorkspaceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError)      setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Workspace name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    try {
      await createWorkspace({
        name:        formData.name.trim(),
        description: formData.description.trim(),
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        handleClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Unable to create workspace. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFormData({ name: "", description: "" });
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Success Toast ── */}
      {showToast && (
        <div className="create-collection-toast">
          <div className="toast-icon"><Check size={14} /></div>
          <span>Workspace created successfully</span>
        </div>
      )}

      {/* ── Modal Overlay ── */}
      <div className="create-collection-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="create-collection-modal">

          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="modal-accent-dot"></div>
              <div>
                <h2 className="modal-title">Create Workspace</h2>
                <p className="modal-subtitle">
                  A workspace holds collections of API requests for a project.
                </p>
              </div>
            </div>
            <button
              className="modal-close-btn"
              onClick={handleClose}
              disabled={loading}
              type="button"
              aria-label="Close"
            >
              <X />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              {/* Workspace Name */}
              <div className="form-field">
                <label htmlFor="ws-name" className="form-label">
                  Workspace Name <span className="required-mark">*</span>
                </label>
                <input
                  id="ws-name"
                  name="name"
                  type="text"
                  className={`form-input${errors.name ? " error" : ""}`}
                  placeholder="e.g. Payment Gateway, Auth Service…"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoFocus
                  maxLength={80}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="form-field">
                <label htmlFor="ws-desc" className="form-label">
                  Description
                  <span style={{ fontSize: 12, color: "#8C959F", fontWeight: 400 }}>
                    &nbsp;(optional)
                  </span>
                </label>
                <textarea
                  id="ws-desc"
                  name="description"
                  className="form-textarea"
                  placeholder="Briefly describe what this workspace is for…"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  maxLength={300}
                />
                <span style={{ fontSize: 12, color: "#8C959F", textAlign: "right" }}>
                  {formData.description.length}/300
                </span>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="api-error-message">{apiError}</div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-create"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create Workspace"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default CreateWorkspaceModal;

