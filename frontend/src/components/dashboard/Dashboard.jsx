import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import QuickActions from "./QuickActions";
import WorkspaceCard from "./WorkspaceCard";
import CollectionsList from "./CollectionsList";
import ApiPreviewWidget from "./ApiPreviewWidget";
import { getWorkspaces } from "../../services/workspaceApi";
import "../../styles/dashboard.css";

function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data || []);
    } catch (err) {
      console.error("Error loading workspaces:", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back!</h1>
            <p className="welcome-subtitle">
              Here's what's happening with your API projects today
            </p>
          </div>

          <QuickActions />

          <div className="workspaces-section">
            <h3 className="section-title">Recent Workspaces</h3>
            <div className="workspaces-grid">
              {loading ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
                  Loading workspaces...
                </p>
              ) : workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))
              ) : (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
                  No workspaces yet. Create one to get started!
                </p>
              )}
            </div>
          </div>

          <div className="bottom-section">
            <CollectionsList />
            <ApiPreviewWidget />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;