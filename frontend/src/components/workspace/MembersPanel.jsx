import { useState, useEffect, useRef } from "react";
import { UserPlus, Crown, Pencil, Eye, MoreVertical, Trash2, RefreshCw, AlertCircle, X, Shield, CheckCircle } from "lucide-react";
import { getWorkspaceMembers, removeMember, changeMemberRole } from "../../services/collaborationApi";
import InviteMemberModal from "./InviteMemberModal";
import "../../styles/members.css";

// ── Toast ──────────────────────────────────────────────────────
const Toast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = {
    info:    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
    success: { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A" },
    error:   { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#D97706" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      fontSize: 13, fontWeight: 500, color: c.text,
      animation: "fadeIn 0.2s ease",
      maxWidth: 360,
    }}>
      {type === "warning" && <AlertCircle size={15} />}
      {type === "success" && <CheckCircle size={15} />}
      {type === "error"   && <X size={15} />}
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: c.text, display: "flex", padding: 0 }}>
        <X size={13} />
      </button>
    </div>
  );
};

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    OWNER:  { bg: "#FEF3C7", color: "#D97706", icon: Crown  },
    EDITOR: { bg: "#DBEAFE", color: "#2563EB", icon: Pencil },
    VIEWER: { bg: "#F3F4F6", color: "#6B7280", icon: Eye    },
  };
  const s   = styles[role] || styles.VIEWER;
  const Icon = s.icon;
  return (
    <span className="member-role-badge" style={{ background: s.bg, color: s.color }}>
      <Icon size={11} />
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => (
  <div className="member-avatar">
    {name?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

// ── Remove Confirm Modal ───────────────────────────────────────────────────────
const RemoveModal = ({ member, onConfirm, onClose, loading }) => (
  <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="invite-modal" style={{ maxWidth: 420 }}>
      <div className="invite-modal-header">
        <div className="invite-modal-title-group">
          <div className="invite-modal-icon" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <Trash2 size={18} />
          </div>
          <div>
            <p className="invite-modal-title">Remove Member</p>
            <p className="invite-modal-subtitle">This action cannot be undone.</p>
          </div>
        </div>
        <button className="invite-modal-close" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="invite-modal-body">
        <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>
          Are you sure you want to remove <strong>{member.name}</strong> ({member.email}) from this workspace?
          They will lose all access immediately.
        </p>
        <div className="invite-modal-footer">
          <button className="invite-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ padding: "8px 18px", background: loading ? "#F3F4F6" : "#DC2626", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, color: loading ? "#9CA3AF" : "#FFFFFF", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}
          >
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Change Role Modal ──────────────────────────────────────────────────────────
const ChangeRoleModal = ({ member, onConfirm, onClose, loading }) => {
  const [selectedRole, setSelectedRole] = useState(member.role);
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="invite-modal" style={{ maxWidth: 420 }}>
        <div className="invite-modal-header">
          <div className="invite-modal-title-group">
            <div className="invite-modal-icon">
              <Shield size={18} />
            </div>
            <div>
              <p className="invite-modal-title">Change Role</p>
              <p className="invite-modal-subtitle">{member.name} · {member.email}</p>
            </div>
          </div>
          <button className="invite-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="invite-modal-body">
          <div className="invite-form-group">
            <label className="invite-label">New Role</label>
            <div className="invite-select-wrap">
              <select
                className="invite-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="EDITOR">Editor — can create and edit</option>
                <option value="VIEWER">Viewer — read only</option>
              </select>
            </div>
            <p className="invite-role-hint">
              {selectedRole === "EDITOR"
                ? "Editors can create, edit, and delete collections and requests."
                : "Viewers can only view collections and requests."}
            </p>
          </div>
          <div className="invite-modal-footer">
            <button className="invite-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button
              className="invite-btn-send"
              onClick={() => onConfirm(selectedRole)}
              disabled={loading}
            >
              {loading ? "Saving…" : "Apply Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MembersPanel (main export) ────────────────────────────────────────────────
const MembersPanel = ({ workspaceId, currentUserRole = "OWNER" }) => {
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(null);
  const [members,       setMembers]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [removeTarget,  setRemoveTarget]  = useState(null);
  const [roleTarget,    setRoleTarget]    = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast,         setToast]         = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { loadMembers(); }, [workspaceId]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (message, type = "info") => setToast({ message, type });

  const loadMembers = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      setActionLoading(true);
      await removeMember(workspaceId, removeTarget.id);
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
      showToast(`${removeTarget.name} has been removed from the workspace.`, "success");
      setRemoveTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to remove member.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (newRole) => {
    if (!roleTarget) return;
    if (newRole === roleTarget.role) {
      showToast(`Role is already set to ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}.`, "warning");
      setRoleTarget(null);
      return;
    }
    try {
      setActionLoading(true);
      await changeMemberRole(workspaceId, roleTarget.id, newRole);
      setMembers((prev) =>
        prev.map((m) => m.id === roleTarget.id ? { ...m, role: newRole } : m)
      );
      showToast(`${roleTarget.name}'s role updated to ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}.`, "success");
      setRoleTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change role.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = currentUserRole === "OWNER";

  if (loading) {
    return (
      <div className="members-panel">
        <div className="members-panel-loading">
          <div className="spinner"></div>
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-panel">
        <div className="members-panel-error">
          <AlertCircle size={32} color="#DC2626" />
          <p className="error-title">Failed to load members</p>
          <p className="error-message">{error}</p>
          <button className="btn-retry" onClick={loadMembers}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="members-panel" ref={menuRef}>

      {/* Header */}
      <div className="members-panel-header">
        <div className="members-panel-title-group">
          <h3 className="members-panel-title">Members</h3>
          <span className="members-count-badge">{members.length}</span>
        </div>
      </div>

      {/* Members List */}
      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-row">
            <Avatar name={member.name} />
            <div className="member-info">
              <span className="member-name">{member.name}</span>
              <span className="member-email">{member.email}</span>
            </div>
            <RoleBadge role={member.role} />

            {/* Owner-only action menu */}
            {isOwner && member.role !== "OWNER" && (
              <div className="member-menu-wrap">
                <button
                  className="member-menu-trigger"
                  onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                >
                  <MoreVertical size={15} />
                </button>
                {menuOpen === member.id && (
                  <div className="member-menu-dropdown">
                    <button
                      className="member-menu-item"
                      onClick={() => { setRoleTarget(member); setMenuOpen(null); }}
                    >
                      <RefreshCw size={13} /> Change Role
                    </button>
                    <button
                      className="member-menu-item member-menu-item--danger"
                      onClick={() => { setRemoveTarget(member); setMenuOpen(null); }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceId={workspaceId}
        onInviteSuccess={() => {}}
      />

      {/* Remove Confirm Modal */}
      {removeTarget && (
        <RemoveModal
          member={removeTarget}
          onConfirm={handleRemove}
          onClose={() => setRemoveTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Change Role Modal */}
      {roleTarget && (
        <ChangeRoleModal
          member={roleTarget}
          onConfirm={handleChangeRole}
          onClose={() => setRoleTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MembersPanel;

