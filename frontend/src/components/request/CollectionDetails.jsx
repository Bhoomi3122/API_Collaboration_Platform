import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ChevronDown, Share2, Settings, Layers } from "lucide-react";
import ApiSidebar from "./ApiSidebar";
import RequestEditor from "./RequestEditor";
import ResponseViewer from "./ResponseViewer";
import DeleteRequestModal from "./DeleteRequestModal";
import GlobalNavDrawer from "../common/GlobalNavDrawer";
import {
  getRequestsByCollection,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  executeRequest,
  executeDirectRequest,
} from "../../services/requestApi";
import { getCollectionById, getWorkspaceById } from "../../services/workspaceApi";
import "../../styles/collectionDetails.css";

// Mock collection data — will be replaced when collection API is connected
const MOCK_COLLECTION = {
  name: "User Authentication APIs",
  description:
    "A curated collection of authentication and authorization endpoints.",
  workspace: "Ecommerce",
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const CollectionDetails = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection]           = useState(null);
  const [workspace, setWorkspace]             = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [listError, setListError]             = useState(null);
  const [requestLoading, setRequestLoading]   = useState(false);
  const [requestError, setRequestError]       = useState(null);
  const [saving, setSaving]                   = useState(false);
  const [saveMessage, setSaveMessage]         = useState(null);
  const [executing, setExecuting]             = useState(false);
  const [executionResponse, setExecutionResponse] = useState(null);
  const [executionError, setExecutionError]   = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [drawerOpen, setDrawerOpen]           = useState(false);

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
    if (collectionId) {
      fetchRequests();
      getCollectionById(collectionId)
        .then((col) => {
          setCollection(col);
          if (col?.workspaceId) {
            getWorkspaceById(col.workspaceId)
              .then(setWorkspace)
              .catch((err) => console.error("Failed to load workspace:", err));
          }
        })
        .catch((err) => console.error("Failed to load collection:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  // ── Select a request — fetch full details from backend ───────
  const handleSelectRequest = async (id, showLoading = true) => {
    try {
      if (showLoading) setRequestLoading(true);
      setRequestError(null);
      setExecutionResponse(null);
      setExecutionError(null);
      const full = await getRequestById(id);
      setSelectedRequest(full);
    } catch (error) {
      console.error("Failed to load request details:", error);
      setRequestError("Failed to load request details.");
    } finally {
      if (showLoading) setRequestLoading(false);
    }
  };

  // ── Execute request ───────────────────────────────────────────
  const handleExecute = async (editorState) => {
    setExecuting(true);
    setExecutionError(null);
    setExecutionResponse(null);

    try {
      const payload = editorState || {
        method:  selectedRequest?.method  || "GET",
        url:     selectedRequest?.url     || "",
        headers: selectedRequest?.headers || {},
        body:    selectedRequest?.body    || "",
      };

      if (!payload.url?.trim()) {
        setExecutionError("Please enter a URL before sending.");
        return;
      }

      // Always execute directly from the browser (works for both saved and unsaved requests)
      const result = await executeDirectRequest(payload);

      // Normalize to the format ResponseViewer expects
      setExecutionResponse({
        statusCode:      result.status,
        responseBody:    typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2),
        responseTime:    result.duration,
        responseHeaders: result.headers,
      });
    } catch (error) {
      console.error("Execution failed:", error);
      // HTTP errors with a response body (safety fallback — shouldn't reach here with validateStatus:()=>true)
      if (error.response) {
        const errData = error.response.data;
        setExecutionResponse({
          statusCode:      error.response.status,
          responseBody:    typeof errData === "string" ? errData : JSON.stringify(errData, null, 2),
          responseTime:    null,
          responseHeaders: error.response.headers || {},
        });
      } else {
        // True network failure — no HTTP response at all (CORS block, DNS failure, timeout, etc.)
        setExecutionError(
          error.code === "ERR_NETWORK"
            ? "Network error — the request could not be sent. Check the URL, CORS policy, or your connection."
            : error.message || "Request failed. Please check your connection and try again."
        );
      }
    } finally {
      setExecuting(false);
    }
  };

  // ── Save and Send (save first, then execute) ──────────────────
  const handleSaveAndSend = async (editorState) => {
    // First save the request
    setSaving(true);
    setSaveMessage(null);
    setExecutionError(null);
    setExecutionResponse(null);

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

      // Reload the request list to get the updated request
      await fetchRequests(saved.id);

      // Now execute the saved request
      setExecuting(true);
      setSaving(false);

      try {
        const result = await executeRequest(saved.id);
        setExecutionResponse(result);
        // Keep the success message visible
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (execError) {
        console.error("Execution failed:", execError);
        // If the backend itself returned an HTTP error body, show it as a response
        if (execError.response) {
          const errData = execError.response.data;
          setExecutionResponse({
            statusCode:      execError.response.status,
            responseBody:    typeof errData === "string" ? errData : JSON.stringify(errData, null, 2),
            responseTime:    null,
            responseHeaders: execError.response.headers || {},
          });
          setSaveMessage({ type: "success", text: "Request saved." });
        } else {
          setExecutionError(
            execError.message || "Request saved but execution failed. Please try again."
          );
          setSaveMessage({ type: "success", text: "Request saved. Execution failed." });
        }
        setTimeout(() => setSaveMessage(null), 4000);
      } finally {
        setExecuting(false);
      }

    } catch (error) {
      console.error("Save failed:", error);
      setSaveMessage({ type: "error", text: "Failed to save request. Please try again." });
      setTimeout(() => setSaveMessage(null), 4000);
      setSaving(false);
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
  const handleDelete = () => {
    if (!selectedRequest?.id) return;
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const data = await getRequestsByCollection(collectionId);
      setRequests(data);
      if (data.length > 0) await handleSelectRequest(data[0].id, false);
      else setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to refresh requests after delete:", error);
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
    setExecutionResponse(null);
    setExecutionError(null);
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
            onExecute={handleExecute}
            onSaveAndSend={handleSaveAndSend}
            saving={saving}
            saveMessage={saveMessage}
            executing={executing}
          />
          <ResponseViewer
            response={executionResponse}
            loading={executing}
            error={executionError}
          />
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

      {/* ── Global Nav Drawer ────────────────────── */}
      <GlobalNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem=""
      />

      {/* ── Top Navbar ──────────────────────────── */}
      <nav className="cd-navbar">
        <div className="cd-navbar-left">
          {/* Hamburger toggle */}
          <button
            className="cd-navbar-hamburger"
            onClick={() => setDrawerOpen(true)}
            title="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
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
          <button
            className="cd-breadcrumb-link"
            onClick={() =>
              collection?.workspaceId
                ? navigate(`/workspace/${collection.workspaceId}`)
                : navigate(-1)
            }
          >
            <ArrowLeft size={12} />
            {collection?.workspaceName || workspace?.name || MOCK_COLLECTION.workspace}
          </button>
          <h1 className="cd-header-name">{collection?.name || MOCK_COLLECTION.name}</h1>
          <p className="cd-header-description">{collection?.description || MOCK_COLLECTION.description}</p>
          <div className="cd-header-meta">
            {formatDate(collection?.createdAt) && (
              <>
                <span>Created {formatDate(collection?.createdAt)}</span>
                <span className="cd-meta-dot">•</span>
              </>
            )}
            <span>{requests.length} {requests.length === 1 ? "API" : "APIs"}</span>
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

      {/* ── Delete Request Modal ─────────────────── */}
      <DeleteRequestModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        request={selectedRequest}
        onSuccess={handleDeleteSuccess}
      />

    </div>
  );
};

export default CollectionDetails;
