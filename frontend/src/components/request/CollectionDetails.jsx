import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Settings } from "lucide-react";
import AppNavbar from "../common/AppNavbar";
import ApiSidebar from "./ApiSidebar";
import RequestEditor from "./RequestEditor";
import ResponseViewer from "./ResponseViewer";
import DeleteRequestModal from "./DeleteRequestModal";
import NameRequestModal from "./NameRequestModal";
import RenameRequestModal from "./RenameRequestModal";
import Toast from "../common/Toast";
import {
  getRequestsByCollection,
  getRequestById,
  createRequest,
  updateRequest,
  renameRequest,
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
  const [executionError, setExecutionError]       = useState(null);
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [showNameModal, setShowNameModal]         = useState(false);
  const [showRenameModal, setShowRenameModal]     = useState(false);
  const [requestToDelete, setRequestToDelete]     = useState(null);
  const [requestToRename, setRequestToRename]     = useState(null);
  const [renaming, setRenaming]                   = useState(false);
  const [toast, setToast]                         = useState(null);

  // Get current user email for permission checks
  const currentUserEmail = localStorage.getItem("userEmail") || "";

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
              .then((ws) => {
                setWorkspace(ws);
              })
              .catch((err) => {});
          }
        })
        .catch((err) => {});
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

      // Route through the backend proxy — avoids browser CORS/origin restrictions
      // and ensures auth, activity tracking, and team consistency work correctly.
      // Backend returns ApiExecutionResponse: { statusCode, responseBody, responseTime, responseHeaders }
      const result = await executeDirectRequest(payload);
      setExecutionResponse(result);
    } catch (error) {
      // Axios throws for network-level failures (no response from our backend)
      if (error.response) {
        const errData = error.response.data;
        setExecutionResponse({
          statusCode:      error.response.status,
          responseBody:    typeof errData === "string" ? errData : JSON.stringify(errData, null, 2),
          responseTime:    null,
          responseHeaders: error.response.headers || {},
        });
      } else {
        setExecutionError(
          error.code === "ERR_NETWORK"
            ? "Network error — could not reach the Specify backend. Is it running?"
            : error.message || "Request failed. Please check your connection and try again."
        );
      }
    } finally {
      setExecuting(false);
    }
  };

  // ── Save and Send (save first, then execute via backend proxy) ───────────
  const handleSaveAndSend = async (editorState) => {
    // Check if request needs naming (new request or still unnamed)
    if (!selectedRequest?.id || !selectedRequest?.name || selectedRequest.name === "Untitled Request") {
      // Show naming modal
      setShowNameModal(true);
      // Store the editor state for later use after naming
      window.pendingSaveAction = { type: 'saveAndSend', editorState };
      return;
    }

    // First save the request
    setSaving(true);
    setSaveMessage(null);
    setExecutionError(null);
    setExecutionResponse(null);

    try {
      const savePayload = {
        name:            editorState.name || selectedRequest?.name || "Untitled Request",
        method:          editorState.method,
        url:             editorState.url,
        headers:         editorState.headers,
        body:            editorState.body,
        collectionId:    Number(collectionId),
        // Auth fields — persisted so the Auth tab is pre-filled when reopened
        authType:        editorState.authType,
        authToken:       editorState.authToken,
        authUsername:    editorState.authUsername,
        authPassword:    editorState.authPassword,
        authApiKeyName:  editorState.authApiKeyName,
        authApiKeyValue: editorState.authApiKeyValue,
      };

      let saved;
      if (selectedRequest?.id) {
        saved = await updateRequest(selectedRequest.id, savePayload);
      } else {
        saved = await createRequest(savePayload);
      }

      setSaveMessage({ type: "success", text: "Request saved successfully." });

      // Reload the request list to reflect the saved request in the sidebar
      await fetchRequests(saved.id);

      // Execute using current editor state (incl. auth) through backend proxy
      setExecuting(true);
      setSaving(false);

      try {
        // editorState includes auth fields from RequestEditor's buildExecutePayload()
        const result = await executeDirectRequest(editorState);
        setExecutionResponse(result);
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (execError) {
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
      setSaveMessage({ type: "error", text: "Failed to save request. Please try again." });
      setTimeout(() => setSaveMessage(null), 4000);
      setSaving(false);
    }
  };

  // ── Save (create or update) ──────────────────────────────────
  const handleSave = async (editorState) => {
    // Check if request needs naming (new request or still unnamed)
    if (!selectedRequest?.id || !selectedRequest?.name || selectedRequest.name === "Untitled Request") {
      // Show naming modal
      setShowNameModal(true);
      // Store the editor state for later use after naming
      window.pendingSaveAction = { type: 'save', editorState };
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        name:            editorState.name || selectedRequest?.name || "Untitled Request",
        method:          editorState.method,
        url:             editorState.url,
        headers:         editorState.headers,
        body:            editorState.body,
        collectionId:    Number(collectionId),
        // Auth fields — persisted so the Auth tab is pre-filled when reopened
        authType:        editorState.authType,
        authToken:       editorState.authToken,
        authUsername:    editorState.authUsername,
        authPassword:    editorState.authPassword,
        authApiKeyName:  editorState.authApiKeyName,
        authApiKeyValue: editorState.authApiKeyValue,
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
      setSaveMessage({ type: "error", text: "Failed to save request. Please try again." });
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = () => {
    if (!selectedRequest?.id) return;
    setRequestToDelete(selectedRequest);
    setShowDeleteModal(true);
  };

  const handleDeleteFromSidebar = (req) => {
    setRequestToDelete(req);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const data = await getRequestsByCollection(collectionId);
      setRequests(data);
      if (data.length > 0) await handleSelectRequest(data[0].id, false);
      else setSelectedRequest(null);
    } catch (error) {
      // Handle error silently
    }
  };

  // ── New (unsaved) request blank template ────────────────────
  const handleNewRequest = () => {
    // Simply create a blank template without showing the modal
    setSelectedRequest({
      id: null,
      name: "Untitled Request",
      method: "GET",
      url: "",
      headers: {},
      body: "",
    });
    setExecutionResponse(null);
    setExecutionError(null);
  };

  const handleNameRequestSubmit = async (name) => {
    // Check if there's a pending save action
    const pendingAction = window.pendingSaveAction;
    if (pendingAction) {
      // Clear the pending action
      window.pendingSaveAction = null;

      // Create/update request with the given name
      try {
        setSaving(true);
        const editorState = pendingAction.editorState;
        const payload = {
          name:            name,
          method:          editorState.method,
          url:             editorState.url,
          headers:         editorState.headers,
          body:            editorState.body,
          collectionId:    Number(collectionId),
          authType:        editorState.authType,
          authToken:       editorState.authToken,
          authUsername:    editorState.authUsername,
          authPassword:    editorState.authPassword,
          authApiKeyName:  editorState.authApiKeyName,
          authApiKeyValue: editorState.authApiKeyValue,
        };

        let saved;
        if (selectedRequest?.id) {
          saved = await updateRequest(selectedRequest.id, payload);
        } else {
          saved = await createRequest(payload);
        }

        await fetchRequests(saved.id);

        // If this was a saveAndSend action, execute the request
        if (pendingAction.type === 'saveAndSend') {
          setSaveMessage({ type: "success", text: "Request saved successfully." });
          setExecuting(true);
          setSaving(false);

          try {
            const result = await executeDirectRequest(editorState);
            setExecutionResponse(result);
            setTimeout(() => setSaveMessage(null), 3000);
          } catch (execError) {
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
        } else {
          setSaveMessage({ type: "success", text: "Request saved successfully." });
          setTimeout(() => setSaveMessage(null), 3000);
          setSaving(false);
        }
      } catch (error) {
        setSaveMessage({ type: "error", text: "Failed to save request. Please try again." });
        setTimeout(() => setSaveMessage(null), 4000);
        setSaving(false);
      }
    }
  };

  // ── Rename ───────────────────────────────────────────────────
  const handleRenameFromSidebar = (req) => {
    // Ensure workspace is loaded
    if (!workspace) {
      setToast({
        message: "Loading workspace data. Please try again in a moment.",
        type: "warning"
      });
      return;
    }

    // Check permissions - only OWNER and EDITOR can rename
    // The workspace.role field contains the current user's role in the workspace
    const userRole = workspace.role;


    if (userRole !== "OWNER" && userRole !== "EDITOR") {
      setToast({
        message: "You don't have permission to rename requests. Only workspace owners and editors can rename requests.",
        type: "error"
      });
      return;
    }

    setRequestToRename(req);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async (newName) => {
    if (!requestToRename) return;

    const oldName = requestToRename.name;
    const id = requestToRename.id;

    setRenaming(true);

    // Optimistically update the requests array
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id ? { ...req, name: newName } : req
      )
    );

    // Also update selectedRequest if it's the one being renamed
    if (selectedRequest?.id === id) {
      setSelectedRequest(prev => ({ ...prev, name: newName }));
    }

    try {
      await renameRequest(id, newName);
      // Fetch fresh data to ensure consistency
      await fetchRequests(id);
      setShowRenameModal(false);
      setRequestToRename(null);
      setToast({
        message: "Request renamed successfully!",
        type: "success"
      });
    } catch (error) {
      // Revert optimistic update on error
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, name: oldName } : req
        )
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ ...prev, name: oldName }));
      }

      // Check if it's a 403 error
      if (error.response?.status === 403) {
        setToast({
          message: "You don't have permission to rename this request. Only workspace owners and editors can rename requests.",
          type: "error"
        });
      } else {
        setToast({
          message: "Failed to rename request. Please try again.",
          type: "error"
        });
      }
    } finally {
      setRenaming(false);
    }
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

      {/* ── Global Nav Drawer is handled inside AppNavbar ── */}

      {/* ── Top Navbar ──────────────────────────── */}
      <AppNavbar subtitle="API Collections" activeItem="Workspaces" />

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
          onRename={handleRenameFromSidebar}
          onDelete={handleDeleteFromSidebar}
        />

        <div className="cd-main">
          {renderMain()}
        </div>

      </div>

      {/* ── Delete Request Modal ─────────────────── */}
      <DeleteRequestModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRequestToDelete(null);
        }}
        request={requestToDelete}
        onSuccess={handleDeleteSuccess}
      />

      {/* ── Name Request Modal ───────────────────── */}
      <NameRequestModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleNameRequestSubmit}
      />

      {/* ── Rename Request Modal ─────────────────── */}
      <RenameRequestModal
        isOpen={showRenameModal}
        onClose={() => {
          if (!renaming) {
            setShowRenameModal(false);
            setRequestToRename(null);
          }
        }}
        onSubmit={handleRenameSubmit}
        currentName={requestToRename?.name || ""}
        loading={renaming}
      />

      {/* ── Toast Notification ───────────────────── */}
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

export default CollectionDetails;
