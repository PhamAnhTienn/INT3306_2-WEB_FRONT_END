import { useState, useEffect } from 'react';
import { userAPI } from '../../services/user/userService';
import { FaSync, FaSpinner } from 'react-icons/fa';
import './RoleSwitchButton.css';

const RoleSwitchButton = () => {
  const [userRoles, setUserRoles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Helper function to normalize role names
  const normalizeRole = (role) => {
    if (!role) return null;
    if (typeof role === 'string') return role.toUpperCase();
    if (role && typeof role === 'object' && role.name) return role.name.toUpperCase();
    return String(role).toUpperCase();
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getMyRoles();
      if (response.success && response.data) {
        // Normalize field names (handle both snake_case and camelCase)
        const normalizedData = {
          ...response.data,
          activeRole: response.data.active_role || response.data.activeRole,
          userId: response.data.user_id || response.data.userId,
        };
        setUserRoles(normalizedData);
      }
    } catch (error) {
      // Silently handle error - button won't show if roles can't be fetched
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async () => {
    if (!userRoles || switching) return;

    // Determine which role to switch to
    const currentRole = userRoles.activeRole;
    const availableRoles = Array.isArray(userRoles.roles) 
      ? userRoles.roles 
      : (userRoles.roles ? [userRoles.roles] : []);
    
    const currentRoleNormalized = normalizeRole(currentRole);
    const targetRole = availableRoles.find(role => {
      const normalized = normalizeRole(role);
      return normalized !== currentRoleNormalized && 
        (normalized === 'VOLUNTEER' || normalized === 'EVENT_MANAGER');
    });

    if (!targetRole) {
      return;
    }

    try {
      setSwitching(true);
      const roleToSwitch = normalizeRole(targetRole);
      const response = await userAPI.switchRole(roleToSwitch);
      
      if (response.success) {
        // Update user in localStorage
        const updatedUser = response.data;
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Reload page and redirect to appropriate dashboard
        const dashboardPath = roleToSwitch === 'VOLUNTEER' 
          ? '/dashboard/volunteer' 
          : '/dashboard/manager';
        
        // Force reload to refresh all data
        window.location.href = dashboardPath;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to switch role. Please try again.';
      alert(errorMessage);
    } finally {
      setSwitching(false);
    }
  };

  // Show loading state - return null to avoid flickering
  if (loading) {
    return null;
  }

  // If no user roles data, don't show button
  if (!userRoles) {
    return null;
  }

  const availableRoles = Array.isArray(userRoles.roles) 
    ? userRoles.roles 
    : (userRoles.roles ? [userRoles.roles] : []);
  
  const hasVolunteer = availableRoles.some(r => normalizeRole(r) === 'VOLUNTEER');
  const hasManager = availableRoles.some(r => normalizeRole(r) === 'EVENT_MANAGER');
  const currentRole = userRoles.activeRole;

  // Only show if user has both roles
  if (!hasVolunteer || !hasManager) {
    return null;
  }

  // Determine display text
  const currentRoleNormalized = normalizeRole(currentRole);
  
  // Find the target role (the one that's not the current one)
  const targetRole = availableRoles.find(role => {
    const normalized = normalizeRole(role);
    return normalized !== currentRoleNormalized && 
      (normalized === 'VOLUNTEER' || normalized === 'EVENT_MANAGER');
  });
  
  const targetRoleNormalized = normalizeRole(targetRole);
  const displayText = targetRoleNormalized === 'VOLUNTEER' 
    ? 'Switch to Volunteer' 
    : 'Switch to Manager';

  return (
    <button
      className="role-switch-button"
      onClick={handleSwitchRole}
      disabled={switching}
      title={displayText}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        zIndex: 1000 // Ensure it's visible
      }}
    >
      {switching ? (
        <>
          <FaSpinner className="spinning" />
          <span>Switching...</span>
        </>
      ) : (
        <>
          <FaSync />
          <span>{displayText}</span>
        </>
      )}
    </button>
  );
};

export default RoleSwitchButton;

