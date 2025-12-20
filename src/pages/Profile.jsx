import { useState, useEffect } from 'react';
import {
  FaUserCircle,
  FaEnvelope,
  FaIdBadge,
  FaCalendarAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { userAPI } from '../services/user/userService';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [rolesInfo, setRolesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switchingRole, setSwitchingRole] = useState(null);

  // Normalize role name: handle string, object, or enum format
  const normalizeRoleName = (role) => {
    if (!role) return '';
    if (typeof role === 'string') {
      // Remove ROLE_ prefix if present, convert to uppercase
      return role.replace(/^ROLE_/, '').toUpperCase();
    }
    if (typeof role === 'object' && role !== null) {
      const name = role.name || role.roleName || role.toString();
      return name.replace(/^ROLE_/, '').toUpperCase();
    }
    return String(role).replace(/^ROLE_/, '').toUpperCase();
  };

  // Determine layout role based on active role OR available roles
  // Priority: activeRole (if set) > user context > roles list fallback
  const getLayoutRole = () => {
    // First, check activeRole from API - this is the CURRENT active role
    const activeRoleRaw = profile?.activeRole || rolesInfo?.activeRole || user?.activeRole;
    const activeRole = normalizeRoleName(activeRoleRaw);
    
    // If activeRole is explicitly set, use it (this respects the user's current role choice)
    if (activeRole === 'ADMIN') {
      return 'admin';
    } else if (activeRole === 'EVENT_MANAGER') {
      return 'manager';
    } else if (activeRole === 'VOLUNTEER') {
      return 'volunteer';
    }
    
    // If activeRole is not set, check user context (from localStorage) - fallback
    if (user) {
      const userRole = normalizeRoleName(user.role || user.activeRole);
      if (userRole === 'ADMIN') {
        return 'admin';
      } else if (userRole === 'EVENT_MANAGER') {
        return 'manager';
      } else if (userRole === 'VOLUNTEER') {
        return 'volunteer';
      }
    }
    
    // Last resort: check roles list to determine the highest privilege role available
    // Only use this if activeRole is truly not set
    const rolesList = rolesInfo?.roles || [];
    if (rolesList && rolesList.length > 0) {
      // Check if user has ADMIN role (highest priority)
      const hasAdmin = rolesList.some(r => {
        const roleName = normalizeRoleName(r);
        return roleName === 'ADMIN';
      });
      if (hasAdmin) {
        return 'admin';
      }
      
      // Check if user has EVENT_MANAGER role
      const hasEventManager = rolesList.some(r => {
        const roleName = normalizeRoleName(r);
        return roleName === 'EVENT_MANAGER';
      });
      if (hasEventManager) {
        return 'manager';
      }
    }
    
    // Default to volunteer
    return 'volunteer';
  };

  const layoutRole = getLayoutRole();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, rolesRes] = await Promise.all([
          userAPI.getCurrentUser(),
          userAPI.getMyRoles(),
        ]);

        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        } else {
          throw new Error(profileRes.message || 'Failed to load profile');
        }

        if (rolesRes.success && rolesRes.data) {
          setRolesInfo(rolesRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSwitchRole = async (role) => {
    if (!role || profile?.activeRole === role || switchingRole) return;

    try {
      setSwitchingRole(role);
      const response = await userAPI.switchRole(role);
      if (response.success && response.data) {
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setProfile((prev) =>
          prev ? { ...prev, activeRole: updatedUser.role } : prev
        );
        setRolesInfo((prev) =>
          prev ? { ...prev, activeRole: updatedUser.role } : prev
        );
        setUser?.(updatedUser);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setSwitchingRole(null);
    }
  };

  const renderRoleChips = () => {
    if (!rolesInfo?.roles || rolesInfo.roles.length === 0) {
      return <span className="empty-text">No roles assigned</span>;
    }

    return rolesInfo.roles.map((role, index) => {
      const roleName = normalizeRoleName(role);
      const activeRoleRaw = rolesInfo.activeRole || profile?.activeRole;
      const activeRoleName = normalizeRoleName(activeRoleRaw);
      const isActive = roleName === activeRoleName;
      
      return (
        <button
          key={roleName || index}
          className={`role-chip ${isActive ? 'active' : ''}`}
          onClick={() => handleSwitchRole(roleName)}
          disabled={switchingRole === roleName || isActive}
        >
          {roleName.replace('_', ' ')}
        </button>
      );
    });
  };

  const infoRows = [
    {
      icon: <FaIdBadge />,
      label: 'Username',
      value: profile?.username || 'N/A',
    },
    {
      icon: <FaEnvelope />,
      label: 'Email',
      value: profile?.email || 'N/A',
    },
    {
      icon: <FaShieldAlt />,
      label: 'Status',
      value: profile?.enabled ? 'Active' : 'Disabled',
      badgeClass: profile?.enabled ? 'status-active' : 'status-disabled',
    },
    {
      icon: <FaCalendarAlt />,
      label: 'Joined',
      value: profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString()
        : 'N/A',
    },
  ];

  return (
    <DashboardLayout
      userRole={layoutRole}
      title="Profile"
      breadcrumbs={['Account', 'Profile']}
    >
      <div className="profile-page">
        {loading ? (
          <div className="profile-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : error ? (
          <div className="profile-error">{error}</div>
        ) : (
          <>
            <div className="profile-header-card">
              <div className="profile-avatar">
                <FaUserCircle />
              </div>
              <div className="profile-header-info">
                <h1>{profile?.fullName || profile?.username || 'User'}</h1>
                <p>{profile?.email || 'No email available'}</p>
                <div className="profile-status-badges">
                  <span className="badge">
                    Active Role:{' '}
                    <strong>
                      {(() => {
                        const activeRoleRaw = profile?.activeRole || rolesInfo?.activeRole;
                        const activeRole = normalizeRoleName(activeRoleRaw);
                        return activeRole ? activeRole.replace('_', ' ') : 'N/A';
                      })()}
                    </strong>
                  </span>
                  <span
                    className={`badge ${
                      profile?.enabled ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {profile?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-content-grid">
              <div className="profile-card">
                <h2>Account Details</h2>
                <div className="profile-info-list">
                  {infoRows.map((row) => (
                    <div className="profile-info-row" key={row.label}>
                      <div className="info-icon">{row.icon}</div>
                      <div className="info-text">
                        <span className="info-label">{row.label}</span>
                        <span
                          className={`info-value ${row.badgeClass || ''}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-card">
                <h2>Roles & Access</h2>
                <p className="card-subtitle">
                  Click a role to make it your active role.
                </p>
                <div className="roles-container">{renderRoleChips()}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;






