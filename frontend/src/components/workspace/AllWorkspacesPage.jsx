import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, FolderOpen, Calendar, AlertCircle,
  MoreVertical, Trash2, Pencil,
} from "lucide-react";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";
import CreateWorkspaceModal from "../dashboard/CreateWorkspaceModal";
import { getWorkspaces, deleteWorkspace, updateWorkspace } from "../../services/workspaceApi";
import "../../styles/AllWorkspacesPage.css";
import "../../styles/CreateCollection.css";

// ── Three-dot menu ────────────────────────────────────────────
function WorkspaceMenu({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="ws-menu-wrap" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="ws-menu-trigger" onClick={() => setOpen((p) => !p)} title="More options">
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="ws-menu-dropdown">
          <button className="ws-menu-item" onClick={(e) => { e.stopPropagation(); setOpen(false); onRename(); }}>
            <Pencil size={14} /> Rename
          </button>
          <button className="ws-menu-item ws-menu-item--danger" onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Rename modal ──────────────────────────────────────────────
function RenameWorkspaceModal({ workspace, onConfirm, onCancel, renaming }) {
  const [name, setName] = useState(workspace?.name || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (workspace) setName(workspace.name);
  }, [workspace]);

  if (!workspace) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    onConfirm(name.trim());
  };

  return (
    <div className="create-collection-overlay" onClick={(e) => { if (e.target === e.currentTarget && !renaming) onCancel(); }}>
      <div className="create-collection-modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-accent-dot"></div>
            <div>
              <h2 className="modal-title">Rename Workspace</h2>
              <p className="modal-subtitle">Enter a new name for this workspace.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Workspace Name</label>
              <input
                className={`form-input${error ? " input-error" : ""}`}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Enter workspace name"
                autoFocus
                disabled={renaming}
              />
              {error && <span className="form-error">{error}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={renaming}>Cancel</button>
            <button type="submit" className="btn-create" disabled={renaming}>
              {renaming ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────
function DeleteWorkspaceModal({ workspace, onConfirm, onCancel, deleting }) {
  if (!workspace) return null;
  return (
    <div className="create-collection-overlay" onClick={(e) => { if (e.target === e.currentTarget && !deleting) onCancel(); }}>
      <div className="create-collection-modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-accent-dot" style={{ background: "#D1242F" }}></div>
            <div>
              <h2 className="modal-title">Delete Workspace</h2>
              <p className="modal-subtitle">This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="modal-body" style={{ gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(209,36,47,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D1242F" }}>
              <Trash2 size={28} />
            </div>
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "#24292F", textAlign: "center", margin: 0 }}>
            Delete <strong style={{ color: "#D1242F" }}>{workspace.name}</strong>?
          </p>
          <p style={{ fontSize: 13, color: "#57606A", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            All collections and API requests inside this workspace will be permanently deleted.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn-create" style={{ background: "#D1242F", borderColor: "#D1242F" }} onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
function AllWorkspacesPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces]                 = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [searchQuery, setSearchQuery]               = useState("");
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState(null);
  const [modalOpen, setModalOpen]                   = useState(false);
  const [deleteTarget, setDeleteTarget]             = useState(null);
  const [deleting, setDeleting]                     = useState(false);
  const [renameTarget, setRenameTarget]             = useState(null);
  const [renaming, setRenaming]                     = useState(false);

  useEffect(() => { loadWorkspaces(); }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkspaces(workspaces);
    } else {
      setFilteredWorkspaces(
        workspaces.filter((w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, workspaces]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true); setError(null);
      const data = await getWorkspaces();
      setWorkspaces(data);
      setFilteredWorkspaces(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWorkspace(deleteTarget.id);
      setDeleteTarget(null);
      loadWorkspaces();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete workspace. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRenameConfirm = async (newName) => {
    if (!renameTarget) return;
    setRenaming(true);
    try {
      await updateWorkspace(renameTarget.id, { name: newName, description: renameTarget.description });
      setRenameTarget(null);
      loadWorkspaces();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename workspace. Please try again.");
    } finally {
      setRenaming(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="workspaces-grid">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="workspace-card-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="workspaces-error-state">
          <div className="error-icon"><AlertCircle /></div>
          <h3 className="error-title">Failed to Load Workspaces</h3>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={loadWorkspaces}>Try Again</button>
        </div>
      );
    }
    if (filteredWorkspaces.length === 0) {
      return searchQuery.trim() ? (
        <div className="workspaces-empty-state">
          <div className="empty-icon"><Search /></div>
          <h3 className="empty-title">No workspaces found</h3>
          <p className="empty-description">No workspaces match your search query.</p>
        </div>
      ) : (
        <div className="workspaces-empty-state">
          <div className="empty-icon"><FolderOpen /></div>
          <h3 className="empty-title">No workspaces yet</h3>
          <p className="empty-description">Create your first workspace to start organizing your APIs.</p>
          <button className="create-workspace-button" onClick={() => setModalOpen(true)}>
            <Plus /> Create Workspace
          </button>
        </div>
      );
    }
    return (
      <div className="workspaces-grid">
        {filteredWorkspaces.map((workspace) => (
          <div key={workspace.id} className="all-workspace-card" onClick={() => navigate(`/workspace/${workspace.id}`)}>
            <div className="workspace-card-icon"><FolderOpen /></div>
            <h3 className="workspace-card-title">{workspace.name}</h3>
            <p className="workspace-card-description">{workspace.description || "No description provided"}</p>
            <div className="workspace-card-footer">
              <div className="workspace-card-meta">
                <Calendar />
                <span>Created {formatDate(workspace.createdAt)}</span>
              </div>
              <WorkspaceMenu
                onRename={() => setRenameTarget(workspace)}
                onDelete={() => setDeleteTarget(workspace)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeItem="Workspaces" />
      <main className="dashboard-main">
        <Topbar />
        <div className="dashboard-content">

          <CreateWorkspaceModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={() => { setModalOpen(false); loadWorkspaces(); }}
          />

          <RenameWorkspaceModal
            workspace={renameTarget}
            onConfirm={handleRenameConfirm}
            onCancel={() => setRenameTarget(null)}
            renaming={renaming}
          />

          <DeleteWorkspaceModal
            workspace={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            deleting={deleting}
          />

          <div className="workspaces-page-header">
            <div className="header-content">
              <h1 className="page-title">Workspaces</h1>
              <p className="page-subtitle">Manage and organize all your API workspaces</p>
            </div>
          </div>

          <div className="workspaces-actions-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search workspaces..."
                className="workspaces-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="create-workspace-button" onClick={() => setModalOpen(true)}>
              <Plus /> Create Workspace
            </button>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AllWorkspacesPage;
