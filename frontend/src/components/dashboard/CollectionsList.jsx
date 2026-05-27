function CollectionsList() {
  const collections = [
    { name: "User Authentication APIs", requests: 8, updated: "2 hours ago" },
    { name: "Payment Gateway", requests: 12, updated: "1 day ago" },
    { name: "Data Export Services", requests: 5, updated: "3 days ago" },
    { name: "Notification System", requests: 6, updated: "1 week ago" },
  ];

  return (
    <div className="collections-list">
      <h3 className="section-title">Recent Collections</h3>
      <div className="collections-container">
        {collections.map((collection, index) => (
          <div key={index} className="collection-item">
            <div className="collection-info">
              <span className="collection-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <div className="collection-details">
                <h4 className="collection-name">{collection.name}</h4>
                <span className="collection-meta">
                  {collection.requests} requests • {collection.updated}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollectionsList;

