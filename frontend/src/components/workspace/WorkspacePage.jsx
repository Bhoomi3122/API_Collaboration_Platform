import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import WorkspaceNavbar from "./WorkspaceNavbar";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceHeader from "./WorkspaceHeader";
import CollectionList from "./CollectionList";
import { getWorkspaceById, getCollectionsByWorkspace } from "../../services/workspaceApi";
import { getMockWorkspaceById, getMockCollectionsByWorkspace, simulateApiDelay } from "../../data/mockData";
import "../../styles/workspace.css";

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockMode, setUseMockMode] = useState(false);

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const workspaceData = await getWorkspaceById(workspaceId);
        const collectionsData = await getCollectionsByWorkspace(workspaceId);
        setWorkspace(workspaceData);
        setCollections(collectionsData);
        setUseMockMode(false);
      } catch (apiError) {
        // API failed, fallback to mock data
        console.log("API unavailable, using mock data for workspace:", workspaceId);

        await simulateApiDelay(500);

        const mockWorkspace = getMockWorkspaceById(workspaceId);
        const mockCollections = getMockCollectionsByWorkspace(workspaceId);

        if (mockWorkspace) {
          setWorkspace(mockWorkspace);
          setCollections(mockCollections);
          setUseMockMode(true);
        } else {
          throw new Error("Workspace not found in backend or mock data");
        }
      }
    } catch (err) {
      console.error("Error loading workspace:", err);
      setError(err.message || "Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = () => {
    console.log("Create collection clicked");
    // TODO: Implement collection creation flow
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="workspace-page-loading">
          <div className="workspace-loading-spinner"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="workspace-page-error">
          <div className="workspace-error-icon">
            <AlertCircle />
          </div>
          <h3 className="workspace-error-title">Failed to Load Workspace</h3>
          <p className="workspace-error-message">{error}</p>
          <button className="workspace-error-retry" onClick={loadWorkspaceData}>
            Try Again
          </button>
        </div>
      );
    }

    if (!workspace) {
      return (
        <div className="workspace-page-error">
          <div className="workspace-error-icon">
            <AlertCircle />
          </div>
          <h3 className="workspace-error-title">Workspace Not Found</h3>
          <p className="workspace-error-message">
            The workspace you're looking for doesn't exist or you don't have access to it.
          </p>
          <button className="workspace-error-retry" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      );
    }

    return (
      <>
        <WorkspaceHeader workspace={workspace} />
        <CollectionList
          collections={collections}
          onCreateCollection={handleCreateCollection}
        />
      </>
    );
  };

  return (
    <div className="workspace-page">
      <WorkspaceNavbar />
      <WorkspaceSidebar workspaceName={workspace?.name} activeTab="collections" />

      <main className="workspace-page-main">
        <div className="workspace-page-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default WorkspacePage;

