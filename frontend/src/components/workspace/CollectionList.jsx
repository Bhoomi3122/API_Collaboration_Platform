import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import CollectionCard from "./CollectionCard";
import EmptyCollectionsState from "./EmptyCollectionsState";
import "../../styles/workspace.css";
const CollectionList = ({
  collections = [],
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleCollectionClick = (collection) => {
    console.log("Collection clicked:", collection);
  };
  const handleCreateClick = () => {
    if (onCreateCollection) {
      onCreateCollection();
    }
  };
  return (
    <div className="workspace-collections-section">
      <div className="collections-section-header">
        <div className="collections-section-header-left">
          <h2 className="collections-section-title">
            Collections {collections.length > 0 && `(${collections.length})`}
          </h2>
          {collections.length > 0 && (
            <p className="collections-section-subtitle">
              {collections.length} collection{collections.length !== 1 ? "s" : ""} in this workspace
            </p>
          )}
        </div>
        <div className="collections-section-controls">
          <div className="collections-search-input">
            <Search />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="collections-create-btn" onClick={handleCreateClick}>
            <Plus />
            Create Collection
          </button>
        </div>
      </div>
      {filteredCollections.length === 0 && !searchQuery ? (
        <EmptyCollectionsState onCreateClick={handleCreateClick} />
      ) : filteredCollections.length === 0 ? (
        <div className="workspace-empty-state">
          <p className="workspace-empty-description">No collections match your search.</p>
        </div>
      ) : (
        <div className="workspace-collections-list">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => handleCollectionClick(collection)}
              onEdit={onEditCollection}
              onDelete={onDeleteCollection}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default CollectionList;
