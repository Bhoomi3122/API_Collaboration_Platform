package com.apiplatform.api_platform.auth.dto.response;

public class UserStatsResponse {
    private int workspacesOwned;
    private int sharedWorkspaces;
    private int totalCollections;
    private int totalRequests;
    private int invitationsSent;
    private int invitationsReceived;

    public UserStatsResponse() {
    }

    public UserStatsResponse(int workspacesOwned, int sharedWorkspaces, int totalCollections,
                           int totalRequests, int invitationsSent, int invitationsReceived) {
        this.workspacesOwned = workspacesOwned;
        this.sharedWorkspaces = sharedWorkspaces;
        this.totalCollections = totalCollections;
        this.totalRequests = totalRequests;
        this.invitationsSent = invitationsSent;
        this.invitationsReceived = invitationsReceived;
    }

    public int getWorkspacesOwned() {
        return workspacesOwned;
    }

    public void setWorkspacesOwned(int workspacesOwned) {
        this.workspacesOwned = workspacesOwned;
    }

    public int getSharedWorkspaces() {
        return sharedWorkspaces;
    }

    public void setSharedWorkspaces(int sharedWorkspaces) {
        this.sharedWorkspaces = sharedWorkspaces;
    }

    public int getTotalCollections() {
        return totalCollections;
    }

    public void setTotalCollections(int totalCollections) {
        this.totalCollections = totalCollections;
    }

    public int getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(int totalRequests) {
        this.totalRequests = totalRequests;
    }

    public int getInvitationsSent() {
        return invitationsSent;
    }

    public void setInvitationsSent(int invitationsSent) {
        this.invitationsSent = invitationsSent;
    }

    public int getInvitationsReceived() {
        return invitationsReceived;
    }

    public void setInvitationsReceived(int invitationsReceived) {
        this.invitationsReceived = invitationsReceived;
    }
}

