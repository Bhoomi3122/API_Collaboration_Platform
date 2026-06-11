import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Check, X, Mail, RefreshCw, AlertCircle, Clock, Inbox } from "lucide-react";
import { getMyInvitations, acceptInvitation, rejectInvitation } from "../../services/collaborationApi";
import GlobalNavDrawer from "../common/GlobalNavDrawer";
import Topbar from "./Topbar";
import "../../styles/members.css";
const ROLE_STYLES = {
  OWNER: { bg: "#DCFCE7", color: "#16A34A" },
  EDITOR: { bg: "#DBEAFE", color: "#2563EB" },
  VIEWER: { bg: "#EDE9FE", color: "#7C3AED" },
};
const InvitationsPage = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    loadInvitations();
  }, []);
  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };
  const getFilteredInvitations = () => {
    if (activeTab === "all") return invitations;
    if (activeTab === "pending") return invitations.filter(inv => inv.status === "PENDING");
    if (activeTab === "expired") return invitations.filter(inv => inv.status === "EXPIRED");
    return invitations;
  };
  const filteredInvitations = getFilteredInvitations();
  const getTabCounts = () => ({
    all: invitations.length,
    pending: invitations.filter(inv => inv.status === "PENDING").length,
    expired: invitations.filter(inv => inv.status === "EXPIRED").length,
  });
  const tabCounts = getTabCounts();
  const handleAccept = async (id) => {
    setProcessing(id);
    try {
      await acceptInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to accept invitation");
    } finally {
      setProcessing(null);
    }
  };
  const handleReject = async (id) => {
    setProcessing(id);
    try {
      await rejectInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to reject invitation");
    } finally {
      setProcessing(null);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  return (
    <div className="dashboard-container">
      <GlobalNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="Invitations"
      />
      <main className="dashboard-main">
        <Topbar onMenuOpen={() => setDrawerOpen(true)} />
        <div className="dashboard-content">
          <div className="invitations-content">
            <h1 className="invitations-page-title">Invitations</h1>
            <p className="invitations-page-sub">
              Workspace invitations sent to you by other members.
            </p>
            <div className="invitations-tabs">
              <button
                className={`inv-tab ${activeTab === "pending" ? "inv-tab--active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                <Clock size={14} />
                Pending
                {tabCounts.pending > 0 && (
                  <span className="inv-tab-badge">{tabCounts.pending}</span>
                )}
              </button>
              <button
                className={`inv-tab ${activeTab === "expired" ? "inv-tab--active" : ""}`}
                onClick={() => setActiveTab("expired")}
              >
                <AlertCircle size={14} />
                Expired
                {tabCounts.expired > 0 && (
                  <span className="inv-tab-badge">{tabCounts.expired}</span>
                )}
              </button>
            </div>
            {loading ? (
              <div className="invitations-loading">
                <div className="spinner"></div>
                <p>Loading invitations...</p>
              </div>
            ) : error ? (
              <div className="invitations-error">
                <AlertCircle size={32} color="#DC2626" />
                <p className="error-title">Failed to load invitations</p>
                <p className="error-message">{error}</p>
                <button className="btn-retry" onClick={loadInvitations}>
                  <RefreshCw size={14} />
                  Try Again
                </button>
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="invitations-empty">
                <div className="invitations-empty-icon">
                  {activeTab === "pending" ? (
                    <Mail size={40} color="#D1D5DB" />
                  ) : activeTab === "expired" ? (
                    <Clock size={40} color="#D1D5DB" />
                  ) : (
                    <Inbox size={40} color="#D1D5DB" />
                  )}
                </div>
                <p className="invitations-empty-title">
                  {activeTab === "pending" && "No pending invitations"}
                  {activeTab === "expired" && "No expired invitations"}
                  {activeTab === "all" && "No invitations"}
                </p>
                <p className="invitations-empty-sub">
                  {activeTab === "pending" && "You're all caught up! Invitations from teammates will appear here."}
                  {activeTab === "expired" && "You don't have any expired invitations."}
                  {activeTab === "all" && "You don't have any workspace invitations yet."}
                </p>
              </div>
            ) : (
              <div className="invitations-list">
                {filteredInvitations.map((inv) => {
                  const roleStyle = ROLE_STYLES[inv.role] || ROLE_STYLES.VIEWER;
                  const busy = processing === inv.id;
                  const isExpired = inv.status === "EXPIRED";
                  const isPending = inv.status === "PENDING";
                  return (
                    <div key={inv.id} className={`invitation-card ${isExpired ? "invitation-card--expired" : ""}`}>
                      <div className="invitation-ws-icon"><Folder size={20} /></div>
                      <div className="invitation-info">
                        <p className="invitation-ws-name">{inv.workspaceName}</p>
                        <p className="invitation-meta">
                          Invited by <strong>{inv.invitedByName}</strong> &nbsp;&nbsp;{" "}
                          {formatDate(inv.createdAt)}
                        </p>
                      </div>
                      <span className="invitation-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                        {inv.role ? inv.role.charAt(0) + inv.role.slice(1).toLowerCase() : "Viewer"}
                      </span>
                      {isExpired && (
                        <span className="invitation-status-badge invitation-status-badge--expired">Expired</span>
                      )}
                      {isPending && (
                        <div className="invitation-actions">
                          <button className="btn-accept" onClick={() => handleAccept(inv.id)} disabled={busy}>
                            {busy ? "…" : (<><Check size={12} /> Accept</>)}
                          </button>
                          <button className="btn-reject" onClick={() => handleReject(inv.id)} disabled={busy}>
                            {busy ? "…" : (<><X size={12} /> Reject</>)}
                          </button>
                        </div>
                      )}
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
