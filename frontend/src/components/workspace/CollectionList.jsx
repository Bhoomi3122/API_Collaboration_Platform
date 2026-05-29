import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import CollectionCard from "./CollectionCard";
import EmptyCollectionsState from "./EmptyCollectionsState";
import "../../styles/workspace.css";

const CollectionList = ({ collections = [], onCreateCollection }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCollectionClick = (collection) => {
    console.log("Collection clicked:", collection);
    // Navigate to collection detail page
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
          <h2 className="collections-section-title">Collections</h2>
          <p className="collections-section-subtitle">Organize and manage your API collections</p>
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

          <button className="collections-filter-btn">
            <SlidersHorizontal />
          </button>

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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionList;

