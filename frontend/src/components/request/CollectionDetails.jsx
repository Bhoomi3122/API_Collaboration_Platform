import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Bell, ChevronDown, Share2, Settings, Layers } from "lucide-react";
import ApiSidebar from "./ApiSidebar";
import RequestEditor from "./RequestEditor";
import ResponseViewer from "./ResponseViewer";
import {
  getRequestsByCollection,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} from "../../services/requestApi";
import "../../styles/collectionDetails.css";

// Mock collection data — will be replaced when collection API is connected
const MOCK_COLLECTION = {
  name: "User Authentication APIs",
  description:
    "A curated collection of authentication and authorization endpoints.",
  createdAt: "2 days ago",
  apiCount: 3,
  collaboratorCount: 2,
  workspace: "Ecommerce",
};

const CollectionDetails = () => {
  const { collectionId } = useParams();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [listError, setListError]             = useState(null);
  const [requestLoading, setRequestLoading]   = useState(false);
  const [requestError, setRequestError]       = useState(null);
  const [saving, setSaving]                   = useState(false);
  const [saveMessage, setSaveMessage]         = useState(null);

  // ── Load sidebar list ────────────────────────────────────────
  const fetchRequests = async (reselectId = null) => {
    try {
      setLoading(true);
      setListError(null);
      const data = await getRequestsByCollection(collectionId);
      setRequests(data);

      if (reselectId) {
        const match = data.find((r) => r.id === reselectId);
        // fetch full details for the reselected item
        if (match) await handleSelectRequest(match.id, false);
        else if (data.length > 0) await handleSelectRequest(data[0].id, false);
        else setSelectedRequest(null);
      } else if (!selectedRequest && data.length > 0) {
        // auto-select first on initial load only
        await handleSelectRequest(data[0].id, false);
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
      setListError("Failed to load requests. Please refresh.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  // ── Select a request — fetch full details from backend ───────
  const handleSelectRequest = async (id, showLoading = true) => {
    try {
      if (showLoading) setRequestLoading(true);
      setRequestError(null);
      const full = await getRequestById(id);
      setSelectedRequest(full);
    } catch (error) {
      console.error("Failed to load request details:", error);
      setRequestError("Failed to load request details.");
    } finally {
      if (showLoading) setRequestLoading(false);
    }
  };

  // ── Save (create or update) ──────────────────────────────────
  const handleSave = async (editorState) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        name:         editorState.name || selectedRequest?.name || "Untitled Request",
        method:       editorState.method,
        url:          editorState.url,
        headers:      editorState.headers,
        body:         editorState.body,
        collectionId: Number(collectionId),
      };

      let saved;
      if (selectedRequest?.id) {
        saved = await updateRequest(selectedRequest.id, payload);
      } else {
        saved = await createRequest(payload);
      }

      setSaveMessage({ type: "success", text: "Request saved successfully." });
      await fetchRequests(saved.id);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveMessage({ type: "error", text: "Failed to save request. Please try again." });
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedRequest?.id) return;
    const confirmed = window.confirm(
      `Delete "${selectedRequest.name || "this request"}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteRequest(selectedRequest.id);
      const data = await getRequestsByCollection(collectionId);
      setRequests(data);
      if (data.length > 0) await handleSelectRequest(data[0].id, false);
      else setSelectedRequest(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete request. Please try again.");
    }
  };

  // ── New (unsaved) request blank template ────────────────────
  const handleNewRequest = () => {
    setSelectedRequest({
      name:    "New Request",
      method:  "GET",
      url:     "",
      headers: {},
      body:    "",
    });
    setRequestError(null);
  };

  // ── Derive main panel content ────────────────────────────────
  const renderMain = () => {
    if (requestLoading) {
      return (
        <div className="cd-no-selection">
          <p className="cd-no-selection-title">Loading request…</p>
        </div>
      );
    }
    if (requestError) {
      return (
        <div className="cd-no-selection">
          <div className="cd-no-selection-icon">⚠️</div>
          <p className="cd-no-selection-title">{requestError}</p>
          <p className="cd-no-selection-sub">
            Try selecting another request or refreshing the page.
          </p>
        </div>
      );
    }
    if (selectedRequest) {
      return (
        <>
          <RequestEditor
            request={selectedRequest}
            onSave={handleSave}
            onDelete={handleDelete}
            saving={saving}
            saveMessage={saveMessage}
          />
          <ResponseViewer />
        </>
      );
    }
    return (
      <div className="cd-no-selection">
        <div className="cd-no-selection-icon">⚡</div>
        <p className="cd-no-selection-title">Select a request to get started</p>
        <p className="cd-no-selection-sub">
          Pick a request from the sidebar or create a new one.
        </p>
      </div>
    );
  };

  return (
    <div className="cd-shell">

      {/* ── Top Navbar ──────────────────────────── */}
      <nav className="cd-navbar">
        <div className="cd-navbar-left">
          <div className="cd-navbar-logo">
            <Layers size={14} />
          </div>
          <span className="cd-navbar-title">DevHub</span>
          <span className="cd-navbar-divider">|</span>
          <span className="cd-navbar-subtitle">API Platform</span>
        </div>
        <div className="cd-navbar-right">
          <button className="cd-navbar-icon-btn">
            <Bell size={16} />
          </button>
          <div className="cd-navbar-profile">
            <div className="cd-navbar-avatar">U</div>
            <ChevronDown size={14} />
          </div>
        </div>
      </nav>

      {/* ── Collection Header Card ───────────────── */}
      <header className="cd-header">
        <div className="cd-header-left">
          <button className="cd-breadcrumb-link">
            <ArrowLeft size={12} />
            {MOCK_COLLECTION.workspace}
          </button>
          <h1 className="cd-header-name">{MOCK_COLLECTION.name}</h1>
          <p className="cd-header-description">{MOCK_COLLECTION.description}</p>
          <div className="cd-header-meta">
            <span>Created {MOCK_COLLECTION.createdAt}</span>
            <span className="cd-meta-dot">•</span>
            <span>{requests.length} APIs</span>
            <span className="cd-meta-dot">•</span>
            <span>{MOCK_COLLECTION.collaboratorCount} collaborators</span>
          </div>
        </div>
        <div className="cd-header-actions">
          <button className="cd-btn-secondary">
            <Share2 size={14} />
            Share
          </button>
          <button className="cd-btn-secondary">
            <Settings size={14} />
            Settings
          </button>
        </div>
      </header>

      {/* ── List error banner ───────────────────── */}
      {listError && (
        <div style={{
          margin: "0 12px",
          padding: "10px 16px",
          background: "#FEE2E2",
          color: "#DC2626",
          border: "1px solid #FECACA",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 500,
          flexShrink: 0,
        }}>
          ⚠️ {listError}
        </div>
      )}

      {/* ── Workspace: Sidebar + Main ────────────── */}
      <div className="cd-workspace">

        <ApiSidebar
          requests={requests}
          loading={loading}
          selectedId={selectedRequest?.id}
          onSelect={(req) => handleSelectRequest(req.id)}
          onNewRequest={handleNewRequest}
        />

        <div className="cd-main">
          {renderMain()}
        </div>

      </div>
    </div>
  );
};

export default CollectionDetails;
