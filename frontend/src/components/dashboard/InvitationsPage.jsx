import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Check, X, Mail } from "lucide-react";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";
import "../../styles/members.css";

// Mock invitations — will be replaced by API in Step 6
const MOCK_INVITATIONS = [
  { id: 1, workspaceName: "E-Commerce Platform",    invitedBy: "Bhoomi Shah",   role: "EDITOR", invitedAt: "2 hours ago"  },
  { id: 2, workspaceName: "Banking & Payments",     invitedBy: "Alice Johnson", role: "VIEWER", invitedAt: "1 day ago"    },
  { id: 3, workspaceName: "Hospital Management",    invitedBy: "Ravi Kumar",    role: "EDITOR", invitedAt: "2 days ago"   },
];

const ROLE_STYLES = {
  OWNER:  { bg: "#DCFCE7", color: "#16A34A" },
  EDITOR: { bg: "#DBEAFE", color: "#2563EB" },
  VIEWER: { bg: "#EDE9FE", color: "#7C3AED" },
};

const InvitationsPage = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState(MOCK_INVITATIONS);
  const [processing, setProcessing]   = useState(null); // invitation id being processed

  const handleAccept = (id) => {
    setProcessing(id);
    // Placeholder — API will be connected in Step 6
    setTimeout(() => {
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      setProcessing(null);
    }, 800);
  };

  const handleReject = (id) => {
    setProcessing(id);
    setTimeout(() => {
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      setProcessing(null);
    }, 600);
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeItem="Invitations" />
      <main className="dashboard-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="invitations-content">

            <h1 className="invitations-page-title">Invitations</h1>
            <p className="invitations-page-sub">
              Workspace invitations sent to you by other members.
            </p>

            {invitations.length === 0 ? (
              <div className="invitations-empty">
                <div className="invitations-empty-icon">
                  <Mail size={40} color="#D1D5DB" />
                </div>
                <p className="invitations-empty-title">No pending invitations</p>
                <p className="invitations-empty-sub">
                  You're all caught up! Invitations from teammates will appear here.
                </p>
              </div>
            ) : (
              <div className="invitations-list">
                {invitations.map((inv) => {
                  const roleStyle = ROLE_STYLES[inv.role] || ROLE_STYLES.VIEWER;
                  const busy = processing === inv.id;
                  return (
                    <div key={inv.id} className="invitation-card">

                      <div className="invitation-ws-icon">
                        <Folder size={20} />
                      </div>

                      <div className="invitation-info">
                        <p className="invitation-ws-name">{inv.workspaceName}</p>
                        <p className="invitation-meta">
                          Invited by <strong>{inv.invitedBy}</strong> &nbsp;·&nbsp; {inv.invitedAt}
                        </p>
                      </div>

                      <span
                        className="invitation-role-badge"
                        style={{ background: roleStyle.bg, color: roleStyle.color }}
                      >
                        {inv.role.charAt(0) + inv.role.slice(1).toLowerCase()}
                      </span>

                      <div className="invitation-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAccept(inv.id)}
                          disabled={busy}
                        >
                          {busy ? "…" : <><Check size={12} /> Accept</>}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(inv.id)}
                          disabled={busy}
                        >
                          {busy ? "…" : <><X size={12} /> Reject</>}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default InvitationsPage;

