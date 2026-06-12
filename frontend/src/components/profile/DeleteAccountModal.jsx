import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../../services/userApi";
import "../../styles/profile.css";

function DeleteAccountModal({ onClose }) {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deleteAccount(password);

      // Clear all local storage
      localStorage.clear();

      // Redirect to signup page
      navigate("/signup");
    } catch (err) {
      console.error("Delete account error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Status:", err.response?.status);

      // Extract error message from various possible formats
      let errorMessage = "Failed to delete account. Please check your password.";

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          // Convert object to readable string
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific status codes
      if (err.response?.status === 403) {
        errorMessage = "Access denied. Please log out and log back in, then try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid password. Please check and try again.";
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon danger">⚠️</span>
          <h3>Delete Account Permanently</h3>
        </div>

        <div className="modal-body">
          <p>
            This action <strong>cannot be undone</strong>. All your workspaces,
            collections, and API requests will be permanently deleted.
          </p>

          <div className="form-group">
            <label htmlFor="confirmText">Type "DELETE" to confirm:</label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              placeholder="DELETE"
              className={error && confirmText !== "DELETE" ? "error" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Enter your password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Your password"
              className={error && !password ? "error" : ""}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-modal-confirm danger"
            onClick={handleDelete}
            disabled={loading || confirmText !== "DELETE"}
          >
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;

