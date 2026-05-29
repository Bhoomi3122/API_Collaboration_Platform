import { useState } from "react";
import { AlertCircle, X, Trash2 } from "lucide-react";
import { deleteCollection } from "../../services/workspaceApi";
import "../../styles/CreateCollection.css";

const DeleteConfirmation = ({ isOpen, onClose, collection, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleConfirmDelete = async () => {
    if (!collection || loading) return;

    setLoading(true);
    setApiError("");

    try {
      await deleteCollection(collection.id);

      // Success - close and notify parent
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 500);
    } catch (error) {
      console.error("Error deleting collection:", error);
      setApiError(
        error.response?.data?.message ||
          "Unable to delete collection. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setApiError("");
    onClose();
  };

  if (!isOpen || !collection) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="create-collection-overlay">
        {/* Modal */}
        <div className="create-collection-modal delete-confirmation-modal">
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="modal-accent-dot delete"></div>
              <div>
                <h2 className="modal-title">Delete Collection</h2>
                <p className="modal-subtitle">
                  This action cannot be undone.
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

          {/* Body */}
          <div className="modal-body">
            {/* Warning Icon */}
            <div className="delete-confirmation-warning">
              <div className="warning-icon">
                <AlertCircle />
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="delete-confirmation-content">
              <p className="delete-confirmation-message">
                Are you sure you want to delete <strong>{collection.name}</strong>?
              </p>
              <p className="delete-confirmation-submessage">
                All endpoints and data associated with this collection will be permanently deleted.
              </p>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="api-error-message">
                {apiError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer delete-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-delete"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete Collection
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmation;

