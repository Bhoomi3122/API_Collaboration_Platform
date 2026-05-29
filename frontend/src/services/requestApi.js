/**
 * Request API service — Phase 1 (Mock placeholders only)
 * Backend integration will be added in Phase 2.
 */

// Get all API requests for a collection
export const getRequestsByCollection = async (collectionId) => {
  return Promise.resolve([
    { id: 1, name: "Login", method: "POST", url: "/api/auth/login", collectionId },
    { id: 2, name: "Signup", method: "POST", url: "/api/auth/signup", collectionId },
    { id: 3, name: "Get Profile", method: "GET", url: "/api/users/profile", collectionId },
  ]);
};

// Create a new API request in a collection
export const createRequest = async (requestData) => {
  return Promise.resolve({ id: Date.now(), ...requestData });
};

// Update an existing API request
export const updateRequest = async (requestId, requestData) => {
  return Promise.resolve({ id: requestId, ...requestData });
};

// Delete an API request
export const deleteRequest = async (requestId) => {
  return Promise.resolve({ success: true, id: requestId });
};

