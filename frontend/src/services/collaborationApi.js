import apiClient from "./apiClient";

/**
 * Collaboration API service
 * Handles all workspace invitation and member-related API calls
 */

// ── Invitations ──────────────────────────────────────────────────────────────

// Invite a member to a workspace
export const inviteMember = async (workspaceId, email) => {
  const response = await apiClient.post(`/workspaces/${workspaceId}/invite`, { email });
  return response.data;
};

// Get all invitations for current user
export const getMyInvitations = async () => {
  const response = await apiClient.get("/invitations");
  return response.data;
};

// Accept an invitation
export const acceptInvitation = async (invitationId) => {
  await apiClient.post(`/invitations/${invitationId}/accept`);
};

// Reject an invitation
export const rejectInvitation = async (invitationId) => {
  await apiClient.post(`/invitations/${invitationId}/reject`);
};

// ── Members ──────────────────────────────────────────────────────────────────

// Get all members of a workspace
export const getWorkspaceMembers = async (workspaceId) => {
  const response = await apiClient.get(`/workspaces/${workspaceId}/members`);
  return response.data;
};

// Remove a member from a workspace (owner only)
export const removeMember = async (workspaceId, userId) => {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
};

// Change a member's role (owner only, EDITOR ↔ VIEWER)
export const changeMemberRole = async (workspaceId, userId, newRole) => {
  await apiClient.put(`/workspaces/${workspaceId}/members/${userId}/role`, { role: newRole });
};

// Get pending invitations sent BY this workspace (owner-only)
export const getPendingWorkspaceInvitations = async (workspaceId) => {
  const response = await apiClient.get(`/workspaces/${workspaceId}/pending-invitations`);
  return response.data;
};

// Cancel a pending invitation (owner only)
export const cancelInvitation = async (invitationId) => {
  await apiClient.delete(`/invitations/${invitationId}`);
};

