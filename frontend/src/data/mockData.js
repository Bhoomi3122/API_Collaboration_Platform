/**
 * Mock data for testing - unified structure for Dashboard and WorkspacePage
 * This can be used for development until backend is fully connected
 */

// Mock workspaces - used by Dashboard and WorkspacePage
export const mockWorkspaces = [
  {
    id: "ws-1",
    name: "Production API Workspace",
    description: "Main workspace for production API development and testing",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-05-20T14:22:00Z",
    // Dashboard display helpers
    apiCount: 24,
    lastUpdated: "2 hours ago",
    collaborators: ["Alice", "Bob", "Charlie"],
  },
];

// Single workspace backward compatibility
export const mockWorkspace = mockWorkspaces[0];

// Collections mapped by workspace ID
export const mockCollectionsByWorkspace = {
  "ws-1": [
    {
      id: "col-1",
      name: "User Authentication API",
      description: "Endpoints for user registration, login, and authentication",
      endpointCount: 8,
      collaboratorCount: 3,
      status: "published",
      createdAt: "2024-02-10T09:15:00Z",
      updatedAt: "2024-05-27T11:30:00Z",
    },
    {
      id: "col-2",
      name: "Payment Gateway Integration",
      description: "Payment processing and transaction management endpoints",
      endpointCount: 12,
      collaboratorCount: 2,
      status: "published",
      createdAt: "2024-03-05T14:20:00Z",
      updatedAt: "2024-05-26T16:45:00Z",
    },
    {
      id: "col-3",
      name: "Analytics Dashboard API",
      description: "Real-time analytics and reporting endpoints",
      endpointCount: 15,
      collaboratorCount: 4,
      status: "draft",
      createdAt: "2024-04-12T08:00:00Z",
      updatedAt: "2024-05-25T10:15:00Z",
    },
    {
      id: "col-4",
      name: "Notification Service",
      description: "Email, SMS, and push notification endpoints",
      endpointCount: 6,
      collaboratorCount: 2,
      status: "published",
      createdAt: "2024-05-01T12:30:00Z",
      updatedAt: "2024-05-20T09:20:00Z",
    },
    {
      id: "col-5",
      name: "File Storage API",
      description: "Document upload, download, and management",
      endpointCount: 10,
      collaboratorCount: 1,
      status: "draft",
      createdAt: "2024-05-15T15:45:00Z",
      updatedAt: "2024-05-15T15:45:00Z",
    },
  ],
};

// All collections (backward compatibility)
export const mockCollections = mockCollectionsByWorkspace["ws-1"];

export const mockEmptyCollections = [];

// Helper to simulate API delay
export const simulateApiDelay = (ms = 800) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper to get workspace by ID
export const getMockWorkspaceById = (workspaceId) => {
  return mockWorkspaces.find((ws) => ws.id === workspaceId);
};

// Helper to get collections by workspace ID
export const getMockCollectionsByWorkspace = (workspaceId) => {
  return mockCollectionsByWorkspace[workspaceId] || [];
};

