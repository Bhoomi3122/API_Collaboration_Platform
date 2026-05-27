import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import QuickActions from "../components/dashboard/QuickActions";
import WorkspaceCard from "../components/dashboard/WorkspaceCard";
import CollectionsList from "../components/dashboard/CollectionsList";
import ApiPreviewWidget from "../components/dashboard/ApiPreviewWidget";
import "../styles/dashboard.css";

function Dashboard() {
  const mockWorkspaces = [
    {
      title: "E-Commerce Platform",
      description: "Complete REST API for online shopping with payment integration and order management",
      apiCount: 24,
      lastUpdated: "2 hours ago",
      collaborators: ["Alice", "Bob", "Charlie"],
    },
    {
      title: "Social Media App",
      description: "User authentication, posts, comments, and real-time notifications",
      apiCount: 18,
      lastUpdated: "1 day ago",
      collaborators: ["David", "Emma"],
    },
    {
      title: "Analytics Dashboard",
      description: "Data collection APIs with real-time metrics and reporting endpoints",
      apiCount: 12,
      lastUpdated: "3 days ago",
      collaborators: ["Frank", "Grace", "Henry", "Ivy"],
    },
  ];

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
              {mockWorkspaces.map((workspace, index) => (
                <WorkspaceCard key={index} workspace={workspace} />
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