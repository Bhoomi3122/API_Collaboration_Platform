import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../common/AppNavbar";
import GlobalNavDrawer from "../common/GlobalNavDrawer";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";
import { getUserStats } from "../../services/userApi";
import "../../styles/profile.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User data
  const [userData, setUserData] = useState({
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "user@example.com",
    userId: localStorage.getItem("userId") || "",
    memberSince: "January 2026", // TODO: Get from backend
  });

  const [tempName, setTempName] = useState(userData.name);


  // Statistics
  const [stats, setStats] = useState({
    workspacesOwned: 0,
    sharedWorkspaces: 0,
    totalCollections: 0,
    totalRequests: 0,
    invitationsSent: 0,
    invitationsReceived: 0,
  });

  // Load user stats
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      // Keep stats at 0 on error
      setStats({
        workspacesOwned: 0,
        sharedWorkspaces: 0,
        totalCollections: 0,
        totalRequests: 0,
        invitationsSent: 0,
        invitationsReceived: 0,
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      try {
        // TODO: Connect to backend API
        // await updateUserProfile({ name: tempName });

        setUserData((prev) => ({ ...prev, name: tempName }));
        localStorage.setItem("userName", tempName);
        setEditingName(false);
      } catch (error) {
        // Handle error silently
      }
    }
  };

  const handleCancelEdit = () => {
    setTempName(userData.name);
    setEditingName(false);
  };

  return (
    <div className="profile-page">
      <AppNavbar subtitle="Profile" activeItem="Profile" />

      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        {/* Personal Information */}
        <div className="profile-card">
          <h2>Personal Information</h2>

          <div className="avatar-section">
            <div className="avatar-circle">{getInitials(userData.name)}</div>
            <div className="avatar-info">
              <h3>{userData.name}</h3>
              <p>{userData.email}</p>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name</span>
              {editingName ? (
                <>
                  <div className="info-value">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="info-actions">
                    <button className="btn-save" onClick={handleSaveName}>
                      Save
                    </button>
                    <button className="btn-cancel" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="info-value">{userData.name}</span>
                  <div className="info-actions">
                    <button className="btn-edit" onClick={() => setEditingName(true)}>
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{userData.email}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value">{userData.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="profile-card">
          <h2>Security</h2>
          <div className="security-section">
            <button
              className="btn-change-password"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>

            <div className="delete-account-link">
              <button
                className="btn-delete-link"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete my account
              </button>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="profile-card">
          <h2>Account Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Workspaces Owned</div>
              <div className="stat-value">{stats.workspacesOwned}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Shared Workspaces</div>
              <div className="stat-value">{stats.sharedWorkspaces}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Collections</div>
              <div className="stat-value">{stats.totalCollections}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total API Requests</div>
              <div className="stat-value">{stats.totalRequests}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Invitations Sent</div>
              <div className="stat-value">{stats.invitationsSent}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Invitations Received</div>
              <div className="stat-value">{stats.invitationsReceived}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}

export default ProfilePage;

