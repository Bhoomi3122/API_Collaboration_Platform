import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import QuickActions from "./QuickActions";
import WorkspaceCard, { getVisitCounts } from "./WorkspaceCard";
import {
  getWorkspaces,
  getCollectionsByWorkspace,
} from "../../services/workspaceApi";
import { getRequestsByCollection } from "../../services/requestApi";
import "../../styles/dashboard.css";

// Mock shared workspaces — will be replaced by API in Step 6
const MOCK_SHARED = [
  { id: "s1", name: "Bhoomi's API Project",   description: "Shared collaboration workspace.", createdAt: "2026-06-01T10:00:00", role: "EDITOR",  invitedBy: "Bhoomi Shah"   },
  { id: "s2", name: "Team Auth Service",       description: "Authentication microservice APIs.", createdAt: "2026-05-30T08:00:00", role: "VIEWER",  invitedBy: "Alice Johnson" },
];

const ROLE_STYLES = {
  OWNER:  { bg: "#DCFCE7", color: "#16A34A" },
  EDITOR: { bg: "#DBEAFE", color: "#2563EB" },
  VIEWER: { bg: "#EDE9FE", color: "#7C3AED" },
};

function Dashboard() {
  const [workspaces, setWorkspaces]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [collectionCount, setCollectionCount] = useState(null);
  const [requestCount, setRequestCount]       = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const ws = await getWorkspaces();
      setWorkspaces(ws || []);

      const collectionArrays = await Promise.all(
        (ws || []).map((w) => getCollectionsByWorkspace(w.id).catch(() => []))
      );
      const allCollections = collectionArrays.flat();
      setCollectionCount(allCollections.length);

      const requestArrays = await Promise.all(
        allCollections.map((c) => getRequestsByCollection(c.id).catch(() => []))
      );
      setRequestCount(requestArrays.flat().length);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort by most visited (desc), top 2
  const recentOwned = [...workspaces]
    .sort((a, b) => {
      const counts = getVisitCounts();
      return (counts[b.id] || 0) - (counts[a.id] || 0);
    })
    .slice(0, 2);

  // Top 2 most visited shared workspaces
  const recentShared = [...MOCK_SHARED]
    .sort((a, b) => {
      const counts = getVisitCounts();
      return (counts[b.id] || 0) - (counts[a.id] || 0);
    })
    .slice(0, 2);

  const formatDate = (d) => {
    if (!d) return "Recently";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar />
        <div className="dashboard-content">

          {/* ── Welcome ── */}
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back!</h1>
            <p className="welcome-subtitle">Here's what's happening with your API projects today</p>
          </div>

          {/* ── Stats Row ── */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{loading ? "—" : workspaces.length}</span>
              <span className="stat-label">My Workspaces</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{loading ? "—" : MOCK_SHARED.length}</span>
              <span className="stat-label">Shared With Me</span>
            </div>
            <div className="stat-card">
              <span className={`stat-value${collectionCount === null ? " stat-value--muted" : ""}`}>
                {loading || collectionCount === null ? "—" : collectionCount}
              </span>
              <span className="stat-label">Collections</span>
            </div>
            <div className="stat-card">
              <span className={`stat-value${requestCount === null ? " stat-value--muted" : ""}`}>
                {loading || requestCount === null ? "—" : requestCount}
              </span>
              <span className="stat-label">API Requests</span>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <QuickActions onWorkspaceCreated={loadAll} />

          {/* ── My Workspaces ── */}
          <div className="workspaces-section">
            <div className="section-header">
              <div className="section-title-group">
                <h3 className="section-title">My Workspaces</h3>
                <span className="section-count">{loading ? "" : workspaces.length}</span>
              </div>
              {workspaces.length > 2 && (
                <button className="view-all-btn" onClick={() => navigate("/workspaces")}>
                  View all &rarr;
                </button>
              )}
            </div>

            <div className="workspaces-grid">
              {loading ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1 / -1" }}>Loading workspaces...</p>
              ) : recentOwned.length > 0 ? (
                recentOwned.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} role="OWNER" />
                ))
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">No workspaces yet</p>
                  <p className="empty-state-sub">Create your first workspace to start organizing your API collections.</p>
                  <button className="empty-state-btn" onClick={() => navigate("/workspaces")}>Create Workspace</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Shared With Me ── */}
          <div className="workspaces-section">
            <div className="section-header">
              <div className="section-title-group">
                <h3 className="section-title">Shared With Me</h3>
                <span className="section-count">{MOCK_SHARED.length}</span>
              </div>
              <button className="view-all-btn" onClick={() => navigate("/workspaces?tab=shared")}>
                View all &rarr;
              </button>
            </div>

            <div className="workspaces-grid">
              {MOCK_SHARED.length > 0 ? (
                recentShared.map((ws) => {
                  const rs = ROLE_STYLES[ws.role] || ROLE_STYLES.VIEWER;
                  return (
                    <div
                      key={ws.id}
                      className="workspace-card shared-workspace-card"
                      onClick={() => navigate(`/workspace/${ws.id}`)}
                    >
                      <div className="workspace-header">
                        <h4 className="workspace-title-card">{ws.name}</h4>
                        <span className="ws-role-badge" style={{ background: rs.bg, color: rs.color }}>
                          {ws.role.charAt(0) + ws.role.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="workspace-description">{ws.description}</p>
                      <div className="workspace-footer">
                        <span className="workspace-time">Created {formatDate(ws.createdAt)}</span>
                        <span className="workspace-invited-by">by {ws.invitedBy}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">No shared workspaces</p>
                  <p className="empty-state-sub">Workspaces shared with you by teammates will appear here.</p>
                  <button className="empty-state-btn" onClick={() => navigate("/invitations")}>Check Invitations</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;