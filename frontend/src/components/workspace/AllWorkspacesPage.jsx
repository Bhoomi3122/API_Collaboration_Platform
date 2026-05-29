import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, FolderOpen, Calendar, AlertCircle } from "lucide-react";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";
import { getWorkspaces } from "../../services/workspaceApi";
import "../../styles/AllWorkspacesPage.css";

function AllWorkspacesPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkspaces(workspaces);
    } else {
      const filtered = workspaces.filter((workspace) =>
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWorkspaces(filtered);
    }
  }, [searchQuery, workspaces]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkspaces();
      setWorkspaces(data);
      setFilteredWorkspaces(data);
    } catch (err) {
      console.error("Error loading workspaces:", err);
      setError(err.response?.data?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceClick = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const handleCreateWorkspace = () => {
    console.log("Create workspace clicked");
    // TODO: Implement workspace creation modal/flow
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="workspaces-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="workspace-card-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="workspaces-error-state">
          <div className="error-icon">
            <AlertCircle />
          </div>
          <h3 className="error-title">Failed to Load Workspaces</h3>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={loadWorkspaces}>
            Try Again
          </button>
        </div>
      );
    }

    if (filteredWorkspaces.length === 0) {
      if (searchQuery.trim() !== "") {
        return (
          <div className="workspaces-empty-state">
            <div className="empty-icon">
              <Search />
            </div>
            <h3 className="empty-title">No workspaces found</h3>
            <p className="empty-description">
              No workspaces match your search query. Try a different search term.
            </p>
          </div>
        );
      }

      return (
        <div className="workspaces-empty-state">
          <div className="empty-icon">
            <FolderOpen />
          </div>
          <h3 className="empty-title">No workspaces yet</h3>
          <p className="empty-description">
            Create your first workspace to start organizing your APIs.
          </p>
          <button className="create-workspace-button" onClick={handleCreateWorkspace}>
            <Plus />
            Create Workspace
          </button>
        </div>
      );
    }

    return (
      <div className="workspaces-grid">
        {filteredWorkspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="all-workspace-card"
            onClick={() => handleWorkspaceClick(workspace.id)}
          >
            <div className="workspace-card-icon">
              <FolderOpen />
            </div>
            <h3 className="workspace-card-title">{workspace.name}</h3>
            <p className="workspace-card-description">
              {workspace.description || "No description provided"}
            </p>
            <div className="workspace-card-footer">
              <div className="workspace-card-meta">
                <Calendar />
                <span>Created {formatDate(workspace.createdAt)}</span>
              </div>
              <div className="workspace-accent-dot"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeItem="Workspaces" />
      <main className="dashboard-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="workspaces-page-header">
            <div className="header-content">
              <h1 className="page-title">Workspaces</h1>
              <p className="page-subtitle">Manage and organize all your API workspaces</p>
            </div>
          </div>

          <div className="workspaces-actions-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search workspaces..."
                className="workspaces-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="create-workspace-button" onClick={handleCreateWorkspace}>
              <Plus />
              Create Workspace
            </button>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AllWorkspacesPage;

