import { useState } from "react";
import { ArrowLeft, Bell, ChevronDown, Share2, Settings, Layers } from "lucide-react";
import ApiSidebar from "./ApiSidebar";
import RequestEditor from "./RequestEditor";
import ResponseViewer from "./ResponseViewer";
import "../../styles/collectionDetails.css";

// Mock collection data for Phase 1
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
  const [selectedRequest, setSelectedRequest] = useState(null);

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
            <span>{MOCK_COLLECTION.apiCount} APIs</span>
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
