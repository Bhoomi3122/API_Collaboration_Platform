import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCollectionsByWorkspace } from "../../services/collectionApi";
import CreateCollectionModal from "../../components/collections/CreateCollectionModal";
import "./workspaceDetails.css";

function WorkspaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCollectionsByWorkspace(id);
      setCollections(response.data);
    } catch (err) {
      setError("Failed to load collections. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCollections();
  }, [id]);

  const handleCollectionCreated = () => {
    fetchCollections();
  };

  return (
    <div className="workspace-details-page">
      <div className="workspace-details-container">

        {/* Header */}
        <div className="workspace-details-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <div className="workspace-details-title-row">
            <div>
              <h1 className="workspace-details-title">Workspace Collections</h1>
              <p className="workspace-details-subtitle">
                All API collections in this workspace
              </p>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Collection
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="workspace-loading">
            <p>Loading collections...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="workspace-error">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && collections.length === 0 && (
          <div className="workspace-empty">
            <p>No collections found in this workspace.</p>
          </div>
        )}

        {/* Collections Grid */}
        {!loading && !error && collections.length > 0 && (
          <div className="collections-grid">
            {collections.map((collection) => (
              <div key={collection.id} className="collection-card">
                <div className="collection-card-header">
                  <h3 className="collection-name">{collection.name}</h3>
                </div>
                {collection.description && (
                  <p className="collection-description">{collection.description}</p>
                )}
                <p className="collection-date">
                  Created: {new Date(collection.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Collection Modal */}
      {showModal && (
        <CreateCollectionModal
          workspaceId={id}
          onClose={() => setShowModal(false)}
          onCollectionCreated={handleCollectionCreated}
        />
      )}

    </div>
  );
}

export default WorkspaceDetails;

