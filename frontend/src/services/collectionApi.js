import apiClient from "./apiClient";

export const createCollection = (data) => apiClient.post("/collections", data);

export const getCollectionsByWorkspace = (workspaceId) =>
  apiClient.get(`/collections/workspace/${workspaceId}`);

