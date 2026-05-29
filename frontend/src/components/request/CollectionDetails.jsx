import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ApiSidebar from "./ApiSidebar";
import RequestEditor from "./RequestEditor";
import ResponseViewer from "./ResponseViewer";
import "../../styles/collectionDetails.css";

// Mock collection data for Phase 1
const MOCK_COLLECTION = {
  name: "User Authentication APIs",
  description:
    "A curated collection of authentication and authorization endpoints for core platform services.",
  createdAt: "2 days ago",
  apiCount: 3,
  collaboratorCount: 2,
  workspace: "Acme Platform",
};

const CollectionDetails = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  return (
    <div className="cd-shell">

      {/* ── Breadcrumb ──────────────────────────── */}
      <nav className="cd-breadcrumb">
        <button className="cd-breadcrumb-link">
          <ArrowLeft size={13} />
          {MOCK_COLLECTION.workspace}
        </button>
      </nav>

      {/* ── Collection Header Card ───────────────── */}
      <header className="cd-header">
        <div className="cd-header-left">
          <h1 className="cd-header-name">{MOCK_COLLECTION.name}</h1>
          <p className="cd-header-description">{MOCK_COLLECTION.description}</p>
          <div className="cd-header-meta">
            <span>Created {MOCK_COLLECTION.createdAt}</span>
            <span className="cd-meta-dot" />
            <span>{MOCK_COLLECTION.apiCount} APIs</span>
            <span className="cd-meta-dot" />
            <span>{MOCK_COLLECTION.collaboratorCount} collaborators</span>
          </div>
        </div>
        <div className="cd-header-actions">
          <button className="cd-btn-ghost">Share</button>
          <button className="cd-btn-ghost">Settings</button>
        </div>
      </header>

      {/* ── Workspace: Sidebar + Main ────────────── */}
      <div className="cd-workspace">

        <ApiSidebar
          selectedId={selectedRequest?.id}
          onSelect={setSelectedRequest}
        />

        <div className="cd-main">
          {selectedRequest ? (
            <>
              <RequestEditor request={selectedRequest} />
              <ResponseViewer />
            </>
          ) : (
            <div className="cd-no-selection">
              <div className="cd-no-selection-icon">⚡</div>
              <p className="cd-no-selection-title">Select a request to get started</p>
              <p className="cd-no-selection-sub">
                Pick a request from the sidebar or create a new one.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CollectionDetails;
