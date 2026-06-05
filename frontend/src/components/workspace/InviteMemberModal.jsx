import { useState } from "react";
import { X, UserPlus, Mail, ChevronDown } from "lucide-react";
import { inviteMember } from "../../services/collaborationApi";
import "../../styles/members.css";

const InviteMemberModal = ({ isOpen, onClose, workspaceId, onInviteSuccess }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await inviteMember(workspaceId, email.trim());
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        setRole("VIEWER");
        onClose();

        // Notify parent to refresh members list if callback provided
        if (onInviteSuccess) {
          onInviteSuccess();
        }
      }, 1500);
    } catch (err) {
      console.error("Error inviting member:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to send invitation";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setEmail("");
    setRole("VIEWER");
    setError("");
    setSuccess(false);
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="invite-modal">
        <div className="invite-modal-header">
          <div className="invite-modal-title-group">
            <div className="invite-modal-icon"><UserPlus size={18} /></div>
            <div>
              <h2 className="invite-modal-title">Invite Member</h2>
              <p className="invite-modal-subtitle">Add someone to this workspace</p>
            </div>
          </div>
          <button className="invite-modal-close" onClick={handleClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleInvite} className="invite-modal-body">
          <div className="invite-form-group">
            <label className="invite-label">Email Address</label>
            <div className="invite-input-wrap">
              <Mail size={14} className="invite-input-icon" />
              <input
                className={`invite-input${error ? " invite-input--error" : ""}`}
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={loading}
                autoFocus
              />
            </div>
            {error && <span className="invite-error">{error}</span>}
          </div>
          <div className="invite-form-group">
            <label className="invite-label">Role</label>
            <div className="invite-select-wrap">
              <select className="invite-select" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                <option value="VIEWER">Viewer — Can view only</option>
                <option value="EDITOR">Editor — Can edit collections and requests</option>
              </select>
              <ChevronDown size={14} className="invite-select-icon" />
            </div>
            <p className="invite-role-hint">
              {role === "VIEWER" ? "Viewer can browse but cannot make changes." : "Editor can create, edit and delete collections and requests."}
            </p>
          </div>
          {success && <div className="invite-success">Invitation sent successfully!</div>}
          <div className="invite-modal-footer">
            <button type="button" className="invite-btn-cancel" onClick={handleClose} disabled={loading}>Cancel</button>
            <button type="submit" className="invite-btn-send" disabled={loading}>{loading ? "Sending..." : "Send Invite"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default InviteMemberModal;
