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

function Dashboard() {
  const [workspaces, setWorkspaces]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [collectionCount, setCollectionCount] = useState(null);
  const [requestCount, setRequestCount]       = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      // 1. Load workspaces
      const ws = await getWorkspaces();
      setWorkspaces(ws || []);

      // 2. Load collections for every workspace in parallel
      const collectionArrays = await Promise.all(
        (ws || []).map((w) =>
          getCollectionsByWorkspace(w.id).catch(() => [])
        )
      );
      const allCollections = collectionArrays.flat();
      setCollectionCount(allCollections.length);

      // 3. Load requests for every collection in parallel
      const requestArrays = await Promise.all(
        allCollections.map((c) =>
          getRequestsByCollection(c.id).catch(() => [])
        )
      );
      setRequestCount(requestArrays.flat().length);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort by most visited (desc), then slice to top 4
  const recentWorkspaces = [...workspaces]
    .sort((a, b) => {
      const counts = getVisitCounts();
      return (counts[b.id] || 0) - (counts[a.id] || 0);
    })
    .slice(0, 4);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar />
        <div className="dashboard-content">

          {/* ── Welcome ── */}
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back!</h1>
            <p className="welcome-subtitle">
              Here's what's happening with your API projects today
            </p>
          </div>

          {/* ── Stats Row ── */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">
                {loading ? "—" : workspaces.length}
              </span>
              <span className="stat-label">Workspaces</span>
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

          {/* ── Recent Workspaces ── */}
          <div className="workspaces-section">
            <div className="section-header">
              <h3 className="section-title">Recent Workspaces</h3>
              {workspaces.length > 4 && (
                <button
                  className="view-all-btn"
                  onClick={() => navigate("/workspaces")}
                >
                  View all &rarr;
                </button>
              )}
            </div>

            <div className="workspaces-grid">
              {loading ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
                  Loading workspaces...
                </p>
              ) : recentWorkspaces.length > 0 ? (
                recentWorkspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">No workspaces yet</p>
                  <p className="empty-state-sub">
                    Create your first workspace to start organizing your API collections.
                  </p>
                  <button
                    className="empty-state-btn"
                    onClick={() => navigate("/workspaces")}
                  >
                    Create Workspace
                  </button>
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