import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateCollection } from "../../services/workspaceApi";
import "../../styles/CreateCollection.css";
const EditCollection = ({ isOpen, onClose, collection, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  useEffect(() => {
    if (isOpen && collection) {
      const initialData = {
        name: collection.name || "",
        description: collection.description || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setHasChanged(false);
      setErrors({});
      setApiError("");
    }
  }, [isOpen, collection]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    // Check if form has changed from original
    const changed = JSON.stringify(updated) !== JSON.stringify(originalData);
    setHasChanged(changed);
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
    if (loading) return;
    if (!validateForm()) {
      return;
    }
    if (!hasChanged) {
      onClose();
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        workspaceId: collection.workspaceId,
      };
      await updateCollection(collection.id, payload);
      // Success - close and notify parent
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 500);
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Unable to update collection. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    if (loading) return;
    setFormData(originalData);
    setHasChanged(false);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <>
      {/* Modal Overlay */}
      <div className="create-collection-overlay">
        {/* Modal */}
        <div className="create-collection-modal">
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="modal-accent-dot"></div>
              <div>
                <h2 className="modal-title">Edit Collection</h2>
                <p className="modal-subtitle">
                  Update the collection details.
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
                disabled={loading || !hasChanged}
              >
                {loading ? "Updating..." : "Apply Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default EditCollection;
