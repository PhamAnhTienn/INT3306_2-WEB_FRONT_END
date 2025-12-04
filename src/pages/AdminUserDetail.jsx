import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { adminAPI } from '../services/admin/adminService';
import {
  FaUserCircle,
  FaEnvelope,
  FaIdBadge,
  FaCalendarAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaBan,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaKey,
  FaUserShield,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import './AdminUserDetail.css';

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const fetchUserDetail = async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUserDetail(parsedUserId);
      if (response.success && response.data) {
        setUserDetail(response.data);
      } else {
        throw new Error('Failed to load user detail');
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
      setError(err.response?.data?.message || 'Failed to load user detail');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    setShowModal(action);
    setModalData({});
  };

  const handleModalClose = () => {
    setShowModal(null);
    setModalData({});
  };

  const handleModalSubmit = async () => {
    const userId = userDetail?.userId || userDetail?.id;
    if (!userDetail || !userId) {
      alert('User ID is missing');
      return;
    }

    try {
      let response;
      switch (showModal) {
        case 'enable':
          response = await adminAPI.enableOrDisableUser(
            userId,
            modalData.enabled
          );
          break;
        case 'role':
          if (!modalData.role) {
            alert('Please select a role');
            return;
          }
          response = await adminAPI.changeUserRole(
            userId,
            modalData.role
          );
          break;
        case 'password':
          if (!modalData.newPassword) {
            alert('Please enter a new password');
            return;
          }
          response = await adminAPI.resetUserPassword(
            userId,
            modalData.newPassword
          );
          break;
        case 'delete':
          response = await adminAPI.deleteUser(
            userId,
            modalData.reason
          );
          break;
        case 'promote':
          response = await adminAPI.promoteToEventManager(userId);
          break;
        case 'demote':
          response = await adminAPI.demoteFromEventManager(userId);
          break;
        default:
          return;
      }

      if (response.success) {
        handleModalClose();
        if (showModal === 'delete') {
          navigate('/admin/users');
        } else {
          fetchUserDetail(); // Refresh detail
        }
      }
    } catch (err) {
      console.error('Error performing action:', err);
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return null;
    return roles.map((role, idx) => {
      // Handle both string and object formats
      let roleName;
      if (typeof role === 'string') {
        roleName = role;
      } else if (role && typeof role === 'object') {
        // Role object with 'name' field (e.g., {id: 1, name: "VOLUNTEER"})
        roleName = role.name || role.roleName || role.toString();
      } else {
        roleName = String(role);
      }
      
      const roleClass = roleName.toLowerCase().replace('_', '-');
      const displayName = roleName.replace('_', ' ');
      return (
        <span key={`${roleName}-${idx}`} className={`role-badge role-${roleClass}`}>
          {displayName}
        </span>
      );
    });
  };

  const renderModal = () => {
    if (!showModal || !userDetail) return null;

    return (
      <div className="modal-overlay" onClick={handleModalClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {showModal === 'enable' && (modalData.enabled ? 'Enable' : 'Disable')} User
              {showModal === 'role' && 'Change User Role'}
              {showModal === 'password' && 'Reset Password'}
              {showModal === 'delete' && 'Delete User'}
              {showModal === 'promote' && 'Promote to Event Manager'}
              {showModal === 'demote' && 'Demote from Event Manager'}
            </h3>
            <button className="modal-close" onClick={handleModalClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <p>
              <strong>User:</strong> {userDetail.fullName || userDetail.username} (
              {userDetail.email})
            </p>

            {showModal === 'enable' && (
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={modalData.enabled ?? userDetail.enabled}
                    onChange={(e) =>
                      setModalData({ ...modalData, enabled: e.target.checked })
                    }
                  />
                  Enable this user
                </label>
              </div>
            )}

            {showModal === 'role' && (
              <div className="form-group">
                <label>New Role:</label>
                <select
                  value={modalData.role || ''}
                  onChange={(e) =>
                    setModalData({ ...modalData, role: e.target.value })
                  }
                >
                  <option value="">Select role...</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="EVENT_MANAGER">Event Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}

            {showModal === 'password' && (
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={modalData.newPassword || ''}
                  onChange={(e) =>
                    setModalData({ ...modalData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                />
              </div>
            )}

            {showModal === 'delete' && (
              <div className="form-group">
                <label>Reason (optional):</label>
                <textarea
                  value={modalData.reason || ''}
                  onChange={(e) =>
                    setModalData({ ...modalData, reason: e.target.value })
                  }
                  placeholder="Enter reason for deletion"
                  rows="3"
                />
                <p className="form-hint">
                  This action cannot be undone. The user will be permanently deleted.
                </p>
              </div>
            )}

            {(showModal === 'promote' || showModal === 'demote') && (
              <p>
                Are you sure you want to{' '}
                {showModal === 'promote'
                  ? 'promote this user to Event Manager?'
                  : 'demote this user from Event Manager?'}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleModalClose}>
              Cancel
            </button>
            <button
              className={`btn ${
                showModal === 'delete' ? 'btn-danger' : 'btn-primary'
              }`}
              onClick={handleModalSubmit}
            >
              {showModal === 'delete' ? 'Delete' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        title="User Detail"
        breadcrumbs={['Admin', 'Users', 'Detail']}
      >
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading user detail...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        userRole="admin"
        title="User Detail"
        breadcrumbs={['Admin', 'Users', 'Detail']}
      >
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchUserDetail}>
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!userDetail) {
    return (
      <DashboardLayout
        userRole="admin"
        title="User Detail"
        breadcrumbs={['Admin', 'Users', 'Detail']}
      >
        <div className="error-container">
          <p>User not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
            Back to Users
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="admin"
      title="User Detail"
      breadcrumbs={['Admin', 'Users', userDetail.fullName || userDetail.username]}
    >
      <div className="admin-user-detail-page">
        <div className="detail-header">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
            <FaArrowLeft /> Back to Users
          </button>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => handleAction('enable')}
            >
              {userDetail.enabled ? <FaBan /> : <FaCheckCircle />}{' '}
              {userDetail.enabled ? 'Disable' : 'Enable'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleAction('role')}
            >
              <FaUserShield /> Change Role
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleAction('password')}
            >
              <FaKey /> Reset Password
            </button>
            {userDetail.roles?.some(r => {
              const roleName = typeof r === 'string' ? r : (r?.name || r?.roleName);
              return roleName === 'EVENT_MANAGER';
            }) ? (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('demote')}
              >
                <FaArrowDown /> Demote
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={() => handleAction('promote')}
              >
                <FaArrowUp /> Promote
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={() => handleAction('delete')}
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        <div className="detail-content-grid">
          <div className="detail-card">
            <div className="card-header">
              <h2>User Information</h2>
            </div>
            <div className="user-avatar-large">
              <FaUserCircle />
            </div>
            <div className="user-info-list">
              <div className="info-row">
                <div className="info-icon">
                  <FaIdBadge />
                </div>
                <div className="info-text">
                  <span className="info-label">Username</span>
                  <span className="info-value">{userDetail.username || 'N/A'}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <FaUserCircle />
                </div>
                <div className="info-text">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">
                    {userDetail.fullName || 'Not provided'}
                  </span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-text">
                  <span className="info-label">Email</span>
                  <span className="info-value">{userDetail.email || 'N/A'}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <FaShieldAlt />
                </div>
                <div className="info-text">
                  <span className="info-label">Status</span>
                  <span
                    className={`info-value ${
                      userDetail.enabled ? 'status-active' : 'status-disabled'
                    }`}
                  >
                    {userDetail.enabled ? (
                      <>
                        <FaCheckCircle /> Active
                      </>
                    ) : (
                      <>
                        <FaBan /> Disabled
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <FaCalendarAlt />
                </div>
                <div className="info-text">
                  <span className="info-label">Joined</span>
                  <span className="info-value">
                    {userDetail.createdAt
                      ? new Date(userDetail.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="card-header">
              <h2>Roles & Permissions</h2>
            </div>
            <div className="roles-section">
              <div className="roles-list">{getRoleBadge(userDetail.roles)}</div>
            </div>
          </div>

          {userDetail.eventsCreated !== undefined && (
            <div className="detail-card">
              <div className="card-header">
                <h2>Activity Statistics</h2>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Events Created</span>
                  <span className="stat-value">{userDetail.eventsCreated || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Registrations</span>
                  <span className="stat-value">
                    {userDetail.registrationsCount || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {renderModal()}
      </div>
    </DashboardLayout>
  );
};

export default AdminUserDetail;

