import { useState } from "react";
import { UserPlus, Crown, Pencil, Eye, MoreVertical, Trash2, RefreshCw } from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import "../../styles/members.css";

// ── Role badge ────────────────────────────────────────────────
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

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ name, color }) => (
  <div className="member-avatar" style={{ background: color || "#E0E7FF", color: "#3730A3" }}>
    {name?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

const AVATAR_COLORS = ["#D1FAE5", "#DBEAFE", "#FEE2E2", "#FEF3C7", "#EDE9FE"];

// ── MembersPanel (main export) ────────────────────────────────
const MembersPanel = ({ workspaceId, currentUserRole = "OWNER" }) => {
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [menuOpen, setMenuOpen]       = useState(null); // member id with open menu

  // ── Mock members — will be replaced by API in Step 6 ────────
  const [members] = useState([
    { id: 1, name: "Rishita Gupta",  email: "rishita@example.com", role: "OWNER"  },
    { id: 2, name: "Bhoomi Shah",    email: "bhoomi@example.com",  role: "EDITOR" },
    { id: 3, name: "Alice Johnson",  email: "alice@example.com",   role: "VIEWER" },
  ]);

  const isOwner = currentUserRole === "OWNER";

  return (
    <div className="members-panel">

      {/* ── Header ── */}
      <div className="members-panel-header">
        <div className="members-panel-title-group">
          <h3 className="members-panel-title">Members</h3>
          <span className="members-count-badge">{members.length}</span>
        </div>
        {isOwner && (
          <button className="btn-invite" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} />
            Invite Member
          </button>
        )}
      </div>

      {/* ── Members List ── */}
      <div className="members-list">
        {members.map((member, idx) => (
          <div key={member.id} className="member-row">

            <Avatar name={member.name} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} />

            <div className="member-info">
              <span className="member-name">{member.name}</span>
              <span className="member-email">{member.email}</span>
            </div>

            <RoleBadge role={member.role} />

            {/* ── Owner-only action menu ── */}
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
                    <button className="member-menu-item">
                      <RefreshCw size={13} /> Change Role
                    </button>
                    <button className="member-menu-item member-menu-item--danger">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* ── Invite Modal ── */}
      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceId={workspaceId}
      />

    </div>
  );
};

export default MembersPanel;

