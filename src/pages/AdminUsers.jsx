import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { adminAPI } from '../services/admin/adminService';
import {
  FaUsers,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaKey,
  FaUserShield,
  FaUserTie,
  FaArrowUp,
  FaArrowDown,
  FaFileExport,
  FaEye,
  FaFilter,
} from 'react-icons/fa';
import './AdminUsers.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    enabled: null, // null = all, true = enabled, false = disabled
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'id',
    sortDir: 'asc',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'enable', 'role', 'password', 'delete', 'promote', 'demote'
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.size, sortConfig, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: sortConfig.sortBy,
        sortDir: sortConfig.sortDir,
      };

      if (filters.search) {
        response = await adminAPI.searchUsers(filters.search, params);
      } else if (filters.enabled !== null) {
        response = await adminAPI.getUsersByEnabled(filters.enabled, params);
      } else {
        response = await adminAPI.getAllUsers(params);
      }

      if (response.success && response.data) {
        setUsers(response.data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setShowModal(action);
    // For enable/disable, set initial modal data based on current user state
    if (action === 'enable') {
      setModalData({ enabled: !user.enabled }); // Toggle: if enabled, we'll disable, so set to false
    } else {
      setModalData({});
    }
  };

  const handleModalClose = () => {
    setShowModal(null);
    setSelectedUser(null);
    setModalData({});
  };

  const handleModalSubmit = async () => {
    const userId = selectedUser?.userId || selectedUser?.id;
    if (!selectedUser || !userId) {
      alert('User ID is missing');
      return;
    }

    try {
      let response;
      switch (showModal) {
        case 'enable':
          // Toggle: if currently enabled, disable it; if disabled, enable it
          response = await adminAPI.enableOrDisableUser(
            userId,
            !selectedUser.enabled
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
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error('Error performing action:', err);
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleExport = async (format) => {
    try {
      let blob;
      if (format === 'csv') {
        blob = await adminAPI.exportUsersToCSV({
          role: filters.role,
          enabled: filters.enabled,
        });
      } else {
        blob = await adminAPI.exportUsersToJSON();
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting users:', err);
      alert('Failed to export users');
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles) return null;
    
    // Convert to array if it's a Set or other iterable
    const rolesArray = Array.isArray(roles) ? roles : Array.from(roles || []);
    if (rolesArray.length === 0) return null;
    
    return rolesArray.map((role, idx) => {
      // Handle both string and object formats
      let roleName;
      if (typeof role === 'string') {
        roleName = role;
      } else if (role && typeof role === 'object') {
        // Role object with 'name' field (e.g., {id: 1, name: "VOLUNTEER"})
        roleName = role.name || role.roleName || role.value || role.role || String(role);
      } else {
        roleName = String(role);
      }
      
      // Normalize: remove ROLE_ prefix and convert to display format
      roleName = roleName.replace(/^ROLE_/, '').replace('_', ' ');
      
      const roleClass = roleName.toLowerCase().replace(/\s+/g, '-');
      return (
        <span key={`${roleName}-${idx}`} className={`role-badge role-${roleClass}`}>
          {roleName}
        </span>
      );
    });
  };

  const renderModal = () => {
    if (!showModal || !selectedUser) return null;

    return (
      <div className="modal-overlay" onClick={handleModalClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {showModal === 'enable' && (selectedUser.enabled ? 'Disable' : 'Enable')} User
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
              <strong>User:</strong> {selectedUser.fullName || selectedUser.username} (
              {selectedUser.email})
            </p>

            {showModal === 'enable' && (
              <div className="form-group">
                <p>
                  Current status: <strong>{selectedUser.enabled ? 'Enabled' : 'Disabled'}</strong>
                </p>
                <p>
                  This will {selectedUser.enabled ? 'disable' : 'enable'} the user account.
                </p>
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

  return (
    <DashboardLayout
      userRole="admin"
      title="User Management"
      breadcrumbs={['Admin', 'Users']}
    >
      <div className="admin-users-page">
        {/* Header with Actions */}
        <div className="page-header-actions">
          <div className="header-left">
            <h2>
              <FaUsers /> User Management
            </h2>
            <p className="page-subtitle">
              Manage all users in the system ({pagination.totalElements} total)
            </p>
          </div>
          <div className="header-right">
            <button
              className="btn btn-secondary"
              onClick={() => handleExport('csv')}
            >
              <FaFileExport /> Export CSV
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleExport('json')}
            >
              <FaFileExport /> Export JSON
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <FaSearch className="filter-icon" />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={filters.enabled === null ? 'all' : filters.enabled.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange(
                  'enabled',
                  value === 'all' ? null : value === 'true'
                );
              }}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="true">Enabled Only</option>
              <option value="false">Disabled Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchUsers}>
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <FaUsers />
            <h3>No users found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')}>
                      ID
                      {sortConfig.sortBy === 'id' && (
                        sortConfig.sortDir === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th onClick={() => handleSort('username')}>
                      User
                      {sortConfig.sortBy === 'username' && (
                        sortConfig.sortDir === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th onClick={() => handleSort('email')}>
                      Email
                      {sortConfig.sortBy === 'email' && (
                        sortConfig.sortDir === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th>Roles</th>
                    <th onClick={() => handleSort('enabled')}>
                      Status
                      {sortConfig.sortBy === 'enabled' && (
                        sortConfig.sortDir === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th onClick={() => handleSort('createdAt')}>
                      Joined
                      {sortConfig.sortBy === 'createdAt' && (
                        sortConfig.sortDir === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const userId = user.userId || user.id;
                    return (
                      <tr key={userId || `user-${index}`}>
                        <td>{userId}</td>
                        <td>
                          <div className="user-info">
                            <span className="user-name">
                              {user.fullName || user.username}
                            </span>
                            <span className="user-username">@{user.username}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <div className="user-roles">{getRoleBadge(user.roles)}</div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              user.enabled ? 'status-enabled' : 'status-disabled'
                            }`}
                          >
                            {user.enabled ? (
                              <>
                                <FaCheckCircle /> Active
                              </>
                            ) : (
                              <>
                                <FaBan /> Disabled
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => navigate(`/admin/users/${userId}`)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleAction(user, 'enable')}
                            title={user.enabled ? 'Disable User' : 'Enable User'}
                          >
                            {user.enabled ? <FaBan /> : <FaCheckCircle />}
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleAction(user, 'role')}
                            title="Change Role"
                          >
                            <FaUserShield />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleAction(user, 'password')}
                            title="Reset Password"
                          >
                            <FaKey />
                          </button>
                          {(() => {
                            // Normalize role name: handle string, object, or enum format
                            const normalizeRoleName = (role) => {
                              if (!role) return '';
                              
                              // Handle string
                              if (typeof role === 'string') {
                                return role.replace(/^ROLE_/, '').toUpperCase().trim();
                              }
                              
                              // Handle object (e.g., {id: 1, name: "EVENT_MANAGER"})
                              if (typeof role === 'object' && role !== null) {
                                // Try multiple possible property names
                                const name = role.name || role.roleName || role.value || role.role;
                                if (name) {
                                  return String(name).replace(/^ROLE_/, '').toUpperCase().trim();
                                }
                                // Fallback to toString
                                const str = role.toString();
                                if (str && str !== '[object Object]') {
                                  return str.replace(/^ROLE_/, '').toUpperCase().trim();
                                }
                              }
                              
                              // Fallback: convert to string
                              const str = String(role);
                              return str.replace(/^ROLE_/, '').toUpperCase().trim();
                            };
                            
                            // Convert roles to array if it's a Set or other iterable
                            const rolesArray = user.roles 
                              ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles || []))
                              : [];
                            
                            // Check if user has EVENT_MANAGER role
                            const hasEventManagerRole = rolesArray.length > 0 && rolesArray.some(r => {
                              const normalized = normalizeRoleName(r);
                              const isEventManager = normalized === 'EVENT_MANAGER';
                              return isEventManager;
                            });
                            
                            return hasEventManagerRole ? (
                              <button
                                className="btn-icon btn-warning"
                                onClick={() => handleAction(user, 'demote')}
                                title="Demote from Event Manager"
                              >
                                <FaArrowDown />
                              </button>
                            ) : (
                              <button
                                className="btn-icon btn-success"
                                onClick={() => handleAction(user, 'promote')}
                                title="Promote to Event Manager"
                              >
                                <FaArrowUp />
                              </button>
                            );
                          })()}
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleAction(user, 'delete')}
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {renderModal()}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;

