import apiClient from "./apiClient";

/**
 * Workspace API service
 * Handles all workspace-related API calls
 */

// Get single collection by ID
export const getCollectionById = async (collectionId) => {
  const response = await apiClient.get(`/collections/${collectionId}`);
  return response.data;
};

// Get all workspaces for current user
export const getWorkspaces = async () => {
  const response = await apiClient.get("/workspaces");
  return response.data;
};

// Create a new workspace
export const createWorkspace = async (workspaceData) => {
  const response = await apiClient.post("/workspaces", workspaceData);
  return response.data;
};

// Get single workspace by ID
export const getWorkspaceById = async (workspaceId) => {
  const response = await apiClient.get(`/workspaces/${workspaceId}`);
  return response.data;
};

// Get collections for a workspace
export const getCollectionsByWorkspace = async (workspaceId) => {
  const response = await apiClient.get(`/collections/workspace/${workspaceId}`);
  return response.data;
};

// Create new collection in workspace
export const createCollection = async (workspaceId, collectionData) => {
  const response = await apiClient.post(
    `/collections`,
    collectionData
  );
  return response.data;
};

// Update collection
export const updateCollection = async (collectionId, collectionData) => {
  const response = await apiClient.put(`/collections/${collectionId}`, collectionData);
  return response.data;
};

// Delete collection
export const deleteCollection = async (collectionId) => {
  const response = await apiClient.delete(`/collections/${collectionId}`);
  return response.data;
};

