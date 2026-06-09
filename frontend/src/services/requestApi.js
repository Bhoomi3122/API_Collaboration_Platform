import apiClient from "./apiClient";

/**
 * Request API service
 */

// Get all API requests for a collection
export const getRequestsByCollection = async (collectionId) => {
  try {
    const response = await apiClient.get(`/requests/collection/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching requests by collection:", error);
    throw error;
  }
};

// Get a single API request by ID
export const getRequestById = async (id) => {
  try {
    const response = await apiClient.get(`/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching request by id:", error);
    throw error;
  }
};

// Create a new API request in a collection
export const createRequest = async (requestData) => {
  try {
    const response = await apiClient.post("/requests", requestData);
    return response.data;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

// Update an existing API request
export const updateRequest = async (id, requestData) => {
  try {
    const response = await apiClient.put(`/requests/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating request:", error);
    throw error;
  }
};

// Delete an API request
export const deleteRequest = async (id) => {
  try {
    const response = await apiClient.delete(`/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
};

// Execute an API request by ID (saved requests via backend)
export const executeRequest = async (id) => {
  try {
    const response = await apiClient.post(`/requests/${id}/execute`);
    return response.data;
  } catch (error) {
    console.error("Error executing request:", error);
    throw error;
  }
};

// Execute a request ad-hoc via the backend proxy (no save required).
// Payload shape matches AdHocExecuteRequest on the backend:
//   { method, url, headers, body, authType, authToken, authUsername,
//     authPassword, authApiKeyName, authApiKeyValue }
// Returns ApiExecutionResponse shape:
//   { statusCode, responseBody, responseTime, responseHeaders }
export const executeDirectRequest = async (payload) => {
  try {
    const response = await apiClient.post("/requests/execute", payload);
    return response.data;
  } catch (error) {
    console.error("Error executing request via backend:", error);
    throw error;
  }
};
