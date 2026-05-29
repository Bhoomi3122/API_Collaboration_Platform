import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import QuickActions from "./QuickActions";
import WorkspaceCard from "./WorkspaceCard";
import CollectionsList from "./CollectionsList";
import ApiPreviewWidget from "./ApiPreviewWidget";
import { mockWorkspaces } from "../../data/mockData";
import "../../styles/dashboard.css";

function Dashboard() {
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
              {mockWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
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