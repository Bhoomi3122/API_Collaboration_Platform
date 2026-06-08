import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle, Users,
  UserPlus, Search, Plus, FolderKanban, Activity,
  Settings, RefreshCw, PlusCircle, Pencil, Trash2,
  FolderPlus, Mail, CheckCircle, ArrowLeft, MailCheck, X,
} from "lucide-react";
import GlobalNavDrawer from "../common/GlobalNavDrawer";
import CollectionCard from "./CollectionCard";
import EmptyCollectionsState from "./EmptyCollectionsState";
import MembersPanel from "./MembersPanel";
import InviteMemberModal from "./InviteMemberModal";
import CreateCollection from "../collection/CreateCollection";
import EditCollection from "../collection/EditCollection";
import DeleteConfirmation from "../collection/DeleteConfirmation";
import { getWorkspaceById, getCollectionsByWorkspace } from "../../services/workspaceApi";
import { getWorkspaceMembers, getPendingWorkspaceInvitations, cancelInvitation } from "../../services/collaborationApi";
import "../../styles/workspace.css";

// Activity icon map - consistent, never random
const ACTIVITY_ICON = {
  endpoint_created:    PlusCircle,
  endpoint_updated:    Pencil,
  endpoint_deleted:    Trash2,
  collection_created:  FolderPlus,
  collection_updated:  FolderPlus,
  member_joined:       UserPlus,
  invitation_sent:     Mail,
  invitation_accepted: CheckCircle,
};

const ACTIVITY = [
  { id: 1, type: "endpoint_created", text: "GET /users endpoint created", actor: "You", time: "2 min ago" },
  { id: 2, type: "collection_created", text: "User Management collection created", actor: "You", time: "1 hour ago" },
  { id: 3, type: "member_joined", text: "Rishita Gupta joined the workspace", actor: "Rishita", time: "3 hours ago" },
  { id: 4, type: "endpoint_updated", text: "POST /login endpoint updated", actor: "You", time: "Yesterday" },
  { id: 5, type: "collection_updated", text: "Auth collection description updated", actor: "You", time: "2 days ago" },
];

// Neutral avatar stack - no random colors
const AvatarStack = ({ members = [] }) => {
  const visible = members.slice(0, 4);
  const extra   = members.length - visible.length;
  return (
    <div className="ws-avatar-stack">
      {visible.map((m) => (
        <div key={m.id} className="ws-avatar-circle" title={m.name}>
          {m.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      ))}
      {extra > 0 && (
        <div className="ws-avatar-circle ws-avatar-extra" title={`${extra} more`}>
          +{extra}
        </div>
      )}
    </div>
  );
};

// Relative time helper
const relativeTime = (dateString) => {
  if (!dateString) return "Recently";
  const diffMs    = Date.now() - new Date(dateString).getTime();
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays  = Math.floor(diffMs / 86400000);
  if (diffMins  < 1)  return "Just now";
  if (diffMins  < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffDays  === 1) return "Yesterday";
  if (diffDays  < 7)  return `${diffDays} days ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Delete Confirmation Modal for pending invites
const DeleteInviteModal = ({ invite, onConfirm, onClose, loading, deleteError }) => (
  <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="invite-modal" style={{ maxWidth: 420 }}>
      <div className="invite-modal-header">
        <div className="invite-modal-title-group">
          <div className="invite-modal-icon" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <Trash2 size={18} />
          </div>
          <div>
            <p className="invite-modal-title">Delete Invitation</p>
            <p className="invite-modal-subtitle">This action cannot be undone.</p>
          </div>
        </div>
        <button className="invite-modal-close" onClick={onClose} disabled={loading}>
          <X size={16} />
        </button>
      </div>
      <div className="invite-modal-body">
        <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>
          Are you sure you want to delete the invitation sent to{" "}
          <strong>{invite.invitedEmail}</strong>? They will no longer be able to
          accept or see this invitation.
        </p>
        {deleteError && (
          <p style={{
            fontSize: 13, color: "#DC2626", margin: 0,
            padding: "8px 12px", background: "#FEF2F2",
            borderRadius: 6, border: "1px solid #FECACA",
          }}>
            {deleteError}
          </p>
        )}
        <div className="invite-modal-footer">
          <button className="invite-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 18px",
              background: loading ? "#F3F4F6" : "#DC2626",
              border: "none", borderRadius: 7,
              fontSize: 13, fontWeight: 500,
              color: loading ? "#9CA3AF" : "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Pending Invitations Panel - owner only, PENDING status only
const PendingInvitesPanel = ({ workspaceId }) => {
  const [invites,      setInvites]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // invite object awaiting confirmation
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,  setDeleteError]  = useState(null);

  useEffect(() => { load(); }, [workspaceId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingWorkspaceInvitations(workspaceId);
      setInvites((data || []).filter((inv) => inv.status === "PENDING"));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending invitations");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (inv) => {
    setDeleteTarget(inv);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await cancelInvitation(deleteTarget.id);
      setInvites((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete invitation. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="wp-pending-loading">
        <div className="wp-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wp-pending-error">
        <AlertCircle size={18} color="#DC2626" />
        <span>{error}</span>
        <button className="wp-btn-outline" onClick={load}>
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="wp-section-header">
          <div className="wp-section-header-left">
            <h2 className="wp-section-title">
              Pending Invitations {invites.length > 0 && `(${invites.length})`}
            </h2>
            <p className="wp-section-sub">Invitations waiting for a response.</p>
          </div>
        </div>

        {invites.length === 0 ? (
          <div className="wp-pending-empty">
            <MailCheck size={32} color="#D1D5DB" />
            <p className="wp-pending-empty-title">No pending invitations</p>
            <p className="wp-pending-empty-sub">Everyone you have invited has responded.</p>
          </div>
        ) : (
          <div className="wp-pending-list">
            {invites.map((inv) => (
              <div key={inv.id} className="wp-pending-card">
                <div className="wp-pending-avatar">
                  {inv.invitedEmail?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="wp-pending-info">
                  <p className="wp-pending-email">{inv.invitedEmail}</p>
                  <p className="wp-pending-meta">
                    Invited by <strong>{inv.invitedByName}</strong>
                    &nbsp;&middot;&nbsp;{relativeTime(inv.createdAt)}
                  </p>
                </div>
                <div className="wp-pending-actions">
                  <span className="wp-pending-status">Pending</span>
                  <button
                    className="wp-pending-cancel-btn"
                    onClick={() => openDeleteModal(inv)}
                    title="Delete invitation"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteInviteModal
          invite={deleteTarget}
          onConfirm={handleConfirmDelete}
          onClose={closeDeleteModal}
          loading={deleteLoading}
          deleteError={deleteError}
        />
      )}
    </>
  );
};

// Main WorkspacePage component
const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const navigate        = useNavigate();

  const [workspace,    setWorkspace]    = useState(null);
  const [collections,  setCollections]  = useState([]);
  const [members,      setMembers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("collections");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [inviteOpen,   setInviteOpen]   = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [selectedCol,  setSelectedCol]  = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentUserEmail = localStorage.getItem("userEmail") || "";
  const isOwner =
    workspace?.ownerEmail === currentUserEmail ||
    members.find((m) => m.email === currentUserEmail)?.role === "OWNER";

  useEffect(() => {
    loadAll();
  }, [workspaceId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ws, cols] = await Promise.all([
        getWorkspaceById(workspaceId),
        getCollectionsByWorkspace(workspaceId),
      ]);
      setWorkspace(ws);
      setCollections(cols || []);
      try {
        const mems = await getWorkspaceMembers(workspaceId);
        setMembers(mems || []);
      } catch (_e) {
        // non-critical
      }
      try {
        const pending = await getPendingWorkspaceInvitations(workspaceId);
        setPendingCount((pending || []).filter((i) => i.status === "PENDING").length);
      } catch (_e) {
        // 403 for non-owners is expected
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="wp-shell">
        <GlobalNavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} activeItem="Workspaces" />
        <div className="wp-body">
          <div className="wp-loading">
            <div className="wp-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wp-shell">
        <GlobalNavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} activeItem="Workspaces" />
        <div className="wp-body">
          <div className="wp-center">
            <div className="wp-error-card">
              <AlertCircle size={32} color="#DC2626" />
              <h3>Failed to Load Workspace</h3>
              <p>{error}</p>
              <div className="wp-error-btns">
                <button className="wp-btn-outline" onClick={loadAll}>
                  <RefreshCw size={14} /> Try Again
                </button>
                <button className="wp-btn-outline" onClick={() => navigate("/dashboard")}>
                  <ArrowLeft size={14} /> Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="wp-shell">
        <GlobalNavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} activeItem="Workspaces" />
        <div className="wp-body">
          <div className="wp-center">
            <div className="wp-error-card">
              <AlertCircle size={32} color="#6B7280" />
              <h3>Workspace Not Found</h3>
              <p>This workspace does not exist or you do not have access.</p>
              <button className="wp-btn-outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "collections",    label: "Collections",    icon: FolderKanban, count: collections.length },
    { id: "members",        label: "Members",        icon: Users,        count: members.length     },
    { id: "activity",       label: "Activity",       icon: Activity,     count: null               },
    ...(isOwner
      ? [{ id: "pending-invites", label: "Pending Invites", icon: Mail, count: pendingCount || null }]
      : []),
    { id: "settings",       label: "Settings",       icon: Settings,     count: null               },
  ];

  return (
    <div className="wp-shell">
      <GlobalNavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} activeItem="Workspaces" />

      <div className="wp-body">
        <div className="wp-container">

          {/* Workspace Header */}
          <div className="wp-header">
            {/* Hamburger to open GlobalNavDrawer */}
            <button
              className="wp-hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              title="Open menu"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "6px 8px", borderRadius: 6, color: "#6B7280",
                display: "flex", alignItems: "center", marginRight: 8,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6B7280"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="wp-header-main">
              <div className="wp-header-content">
                <h1 className="wp-header-title">{workspace.name}</h1>
                {workspace.description && (
                  <p className="wp-header-desc">{workspace.description}</p>
                )}
                <div className="wp-header-collab">
                  <AvatarStack members={members} />
                  {isOwner && <span className="wp-owner-badge">Owner</span>}
                </div>
              </div>
            </div>
            <button className="wp-btn-invite" onClick={() => setInviteOpen(true)}>
              <UserPlus size={14} />
              Invite Member
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="wp-tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`wp-tab ${activeTab === tab.id ? "wp-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={13} />
                  {tab.label}
                  {tab.count > 0 && <span className="wp-tab-count">{tab.count}</span>}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="wp-content-row">

            {/* Collections Tab */}
            {activeTab === "collections" && (
              <>
                <div className="wp-main-col">
                  <div className="wp-section-header">
                    <div className="wp-section-header-left">
                      <h2 className="wp-section-title">Collections</h2>
                      <p className="wp-section-sub">
                        {collections.length} collection{collections.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="wp-section-controls">
                      <div className="wp-search-box">
                        <Search size={13} className="wp-search-icon" />
                        <input
                          type="text"
                          placeholder="Search collections..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="wp-search-input"
                        />
                      </div>
                      <button className="wp-btn-create" onClick={() => setShowCreate(true)}>
                        <Plus size={13} /> New Collection
                      </button>
                    </div>
                  </div>

                  {filtered.length === 0 && !searchQuery ? (
                    <EmptyCollectionsState onCreateClick={() => setShowCreate(true)} />
                  ) : filtered.length === 0 ? (
                    <div className="wp-no-results">No collections match your search.</div>
                  ) : (
                    <div className="wp-collections-list">
                      {filtered.map((col) => (
                        <CollectionCard
                          key={col.id}
                          collection={col}
                          onClick={() => navigate(`/collection/${col.id}`)}
                          onEdit={(c)   => { setSelectedCol(c); setShowEdit(true);   }}
                          onDelete={(c) => { setSelectedCol(c); setShowDelete(true); }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity sidebar - 25% */}
                <div className="wp-activity-col">
                  <div className="wp-activity-header">
                    <h3 className="wp-activity-title">Recent Activity</h3>
                    <button
                      className="wp-activity-view-all"
                      onClick={() => setActiveTab("activity")}
                    >
                      View all
                    </button>
                  </div>
                  <div className="wp-activity-feed">
                    {ACTIVITY.map((item, idx) => {
                      const Icon = ACTIVITY_ICON[item.type] || PlusCircle;
                      return (
                        <div key={item.id} className="wp-activity-item">
                          <div className="wp-activity-icon-wrap">
                            <Icon size={14} />
                          </div>
                          {idx < ACTIVITY.length - 1 && (
                            <div className="wp-activity-line" />
                          )}
                          <div className="wp-activity-body">
                            <p className="wp-activity-text">{item.text}</p>
                            <p className="wp-activity-meta">
                              <span>{item.actor}</span> &middot; {item.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="wp-activity-bottom-link"
                    onClick={() => setActiveTab("activity")}
                  >
                    View all activity
                  </button>
                </div>
              </>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="wp-main-col">
                <MembersPanel
                  workspaceId={workspaceId}
                  currentUserRole={isOwner ? "OWNER" : "VIEWER"}
                />
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="wp-main-col">
                <div className="wp-section-header">
                  <div className="wp-section-header-left">
                    <h2 className="wp-section-title">Activity</h2>
                    <p className="wp-section-sub">Recent changes in this workspace</p>
                  </div>
                </div>
                <div className="wp-activity-page-feed">
                  {ACTIVITY.map((item) => {
                    const Icon = ACTIVITY_ICON[item.type] || PlusCircle;
                    return (
                      <div key={item.id} className="wp-activity-page-item">
                        <div className="wp-activity-page-icon">
                          <Icon size={14} />
                        </div>
                        <div className="wp-activity-body">
                          <p className="wp-activity-text">{item.text}</p>
                          <p className="wp-activity-meta">
                            <span>{item.actor}</span> &middot; {item.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending Invites Tab - owner only */}
            {activeTab === "pending-invites" && isOwner && (
              <div className="wp-main-col">
                <PendingInvitesPanel workspaceId={workspaceId} />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="wp-main-col">
                <div className="wp-section-header">
                  <div className="wp-section-header-left">
                    <h2 className="wp-section-title">Settings</h2>
                    <p className="wp-section-sub">Manage workspace preferences</p>
                  </div>
                </div>
                <div className="wp-settings-placeholder">
                  <Settings size={32} color="#D1D5DB" />
                  <p>Workspace settings coming soon.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceId={workspaceId}
        onInviteSuccess={loadAll}
      />
      <CreateCollection
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        workspaceId={workspaceId}
        onSuccess={loadAll}
      />
      <EditCollection
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        collection={selectedCol}
        onSuccess={loadAll}
      />
      <DeleteConfirmation
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        collection={selectedCol}
        onSuccess={() =>
          setCollections((prev) => prev.filter((c) => c.id !== selectedCol?.id))
        }
      />
    </div>
  );
};

export default WorkspacePage;
