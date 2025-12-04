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

  const layoutRole =
    profile?.activeRole === 'EVENT_MANAGER' || profile?.activeRole === 'ADMIN'
      ? 'manager'
      : 'volunteer';

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

    return rolesInfo.roles.map((role) => {
      const isActive =
        role === rolesInfo.activeRole || role === profile?.activeRole;
      return (
        <button
          key={role}
          className={`role-chip ${isActive ? 'active' : ''}`}
          onClick={() => handleSwitchRole(role)}
          disabled={switchingRole === role}
        >
          {role.replace('_', ' ')}
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
                      {profile?.activeRole
                        ? profile.activeRole.replace('_', ' ')
                        : 'N/A'}
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



