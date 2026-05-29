import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, FolderOpen } from "lucide-react";
import WorkspaceNavbar from "./WorkspaceNavbar";
import WorkspaceSidebar from "./WorkspaceSidebar";
import CollectionList from "./CollectionList";
import CreateCollection from "../collection/CreateCollection";
import EditCollection from "../collection/EditCollection";
import DeleteConfirmation from "../collection/DeleteConfirmation";
import { getWorkspaceById, getCollectionsByWorkspace } from "../../services/workspaceApi";
import "../../styles/workspace.css";
const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);
  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Workspace ID:", workspaceId);
      const workspaceData = await getWorkspaceById(workspaceId);
      const collectionsData = await getCollectionsByWorkspace(workspaceId);
      setWorkspace(workspaceData);
      setCollections(collectionsData || []);
    } catch (err) {
      console.error("Error loading workspace:", err);
      setError(err.response?.data?.message || err.message || "Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCollection = () => {
    setShowCreateModal(true);
  };
  const handleCollectionCreated = () => {
    loadWorkspaceData();
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setShowEditModal(true);
  };

  const handleCollectionUpdated = () => {
    loadWorkspaceData();
  };

  const handleDeleteCollection = (collection) => {
    setSelectedCollection(collection);
    setShowDeleteModal(true);
  };

  const handleCollectionDeleted = () => {
    setCollections((prevCollections) =>
      prevCollections.filter((c) => c.id !== selectedCollection.id)
    );
  };
  const renderContent = () => {
    // Loading State
    if (loading) {
      return (
        <div className="workspace-loading-state">
          <div className="workspace-loading-spinner"></div>
        </div>
      );
    }
    // Error State
    if (error) {
      return (
        <div className="workspace-error-state">
          <div className="error-state-card">
            <div className="error-state-icon">
              <AlertCircle />
            </div>
            <h3 className="error-state-title">Failed to Load Workspace</h3>
            <p className="error-state-message">{error}</p>
            <div className="error-state-actions">
              <button className="btn-secondary" onClick={loadWorkspaceData}>
                Try Again
              </button>
              <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Workspace Not Found State
    if (!workspace) {
      return (
        <div className="workspace-error-state">
          <div className="error-state-card">
            <div className="error-state-icon">
              <AlertCircle />
            </div>
            <h3 className="error-state-title">Workspace Not Found</h3>
            <p className="error-state-message">
              The workspace you're looking for doesn't exist or you don't have access to it.
            </p>
            <div className="error-state-actions">
              <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
     // Empty Collections State
     if (collections.length === 0) {
       return (
         <div className="workspace-main-content">
           <CollectionList
             collections={collections}
             onCreateCollection={handleCreateCollection}
             onEditCollection={handleEditCollection}
             onDeleteCollection={handleDeleteCollection}
           />
         </div>
       );
     }
     // Success State - Collections Exist
     return (
       <div className="workspace-main-content">
         <CollectionList
           collections={collections}
           onCreateCollection={handleCreateCollection}
           onEditCollection={handleEditCollection}
           onDeleteCollection={handleDeleteCollection}
         />
       </div>
     );
  };
  return (
    <div className="workspace-page">
      <WorkspaceNavbar />
      <WorkspaceSidebar
        workspaceName={workspace?.name}
        workspaceDescription={workspace?.description}
        activeTab="collections"
      />
      <main className="workspace-page-main">
        <div className="workspace-page-content">
          {renderContent()}
        </div>
      </main>
      {/* Create Collection Modal */}
      <CreateCollection
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        workspaceId={workspaceId}
        onSuccess={handleCollectionCreated}
      />

      {/* Edit Collection Modal */}
      <EditCollection
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        collection={selectedCollection}
        onSuccess={handleCollectionUpdated}
      />

      {/* Delete Collection Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        collection={selectedCollection}
        onSuccess={handleCollectionDeleted}
      />
    </div>
  );
};
export default WorkspacePage;
