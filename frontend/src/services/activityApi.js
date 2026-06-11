import apiClient from "./apiClient";

/**
 * Activity API service
 * Handles all activity-related API calls
 */

// Get workspace activities
export const getWorkspaceActivities = async (workspaceId) => {
  const response = await apiClient.get(`/activities/workspace/${workspaceId}`);
  return response.data;
};

// Get collection activities
export const getCollectionActivities = async (collectionId) => {
  const response = await apiClient.get(`/activities/collection/${collectionId}`);
  return response.data;
};

