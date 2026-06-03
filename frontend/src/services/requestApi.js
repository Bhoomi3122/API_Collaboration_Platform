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

// Execute a request directly (ad-hoc, unsaved) — calls the URL from the browser
export const executeDirectRequest = async ({ method, url, headers, body }) => {
  const axios = (await import("axios")).default;

  // Parse headers — accept object or JSON string
  let parsedHeaders = {};
  if (headers && typeof headers === "object") {
    parsedHeaders = headers;
  } else if (headers && typeof headers === "string" && headers.trim()) {
    try { parsedHeaders = JSON.parse(headers); } catch { /* ignore */ }
  }

  const config = {
    method: method || "GET",
    url,
    headers: parsedHeaders,
    // Never throw for any HTTP status — let the caller handle all responses uniformly
    validateStatus: () => true,
  };

  if (body && typeof body === "string" && body.trim() &&
      ["POST", "PUT", "PATCH"].includes((method || "").toUpperCase())) {
    try {
      config.data = JSON.parse(body);
      if (!parsedHeaders["Content-Type"] && !parsedHeaders["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    } catch {
      config.data = body;
    }
  }

  const start = Date.now();
  const response = await axios(config);
  const duration = Date.now() - start;

  return {
    status: response.status,
    statusText: response.statusText,
    duration,
    size: JSON.stringify(response.data).length,
    data: response.data,
    headers: response.headers,
  };
};
