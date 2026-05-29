import { useState } from "react";
import { X, Check } from "lucide-react";
import { createCollection } from "../../services/workspaceApi";
import "../../styles/CreateCollection.css";

const CreateCollection = ({ isOpen, onClose, workspaceId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear API error when user makes changes
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Collection name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        workspaceId: Number(workspaceId),
      };

      await createCollection(workspaceId, payload);

      // Show success toast
      setShowToast(true);

      // Wait a bit then close modal and refresh
      setTimeout(() => {
        setShowToast(false);
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    } catch (error) {
      console.error("Error creating collection:", error);
      setApiError(
        error.response?.data?.message ||
          "Unable to create collection. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while creating

    setFormData({ name: "", description: "" });
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="create-collection-toast">
          <div className="toast-icon">
            <Check />
          </div>
          <span>Collection created successfully</span>
        </div>
      )}

      {/* Modal Overlay */}
      <div className="create-collection-overlay">
        {/* Modal */}
        <div className="create-collection-modal">
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="modal-accent-dot"></div>
              <div>
                <h2 className="modal-title">Create Collection</h2>
                <p className="modal-subtitle">
                  Organize related API requests into a collection.
                </p>
              </div>
            </div>
            <button
              className="modal-close-btn"
              onClick={handleClose}
              disabled={loading}
              type="button"
            >
              <X />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Collection Name */}
              <div className="form-field">
                <label htmlFor="name" className="form-label">
                  Collection Name
                  <span className="required-mark">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter collection name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoFocus
                />
                {errors.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="form-field">
                <label htmlFor="description" className="form-label">
                  Description
                  <span className="required-mark">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={`form-textarea ${errors.description ? "error" : ""}`}
                  placeholder="Describe the purpose of this collection"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={4}
                />
                {errors.description && (
                  <p className="form-error">{errors.description}</p>
                )}
              </div>

              {/* API Error */}
              {apiError && (
                <div className="api-error-message">
                  {apiError}
                </div>
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
                {loading ? "Creating..." : "Create Collection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateCollection;

