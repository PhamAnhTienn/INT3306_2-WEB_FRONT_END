import { useState, useEffect } from 'react';
import { userAPI } from '../../services/user/userService';

const RoleDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await userAPI.getMyRoles();
        setDebugInfo({
          success: response.success,
          data: response.data,
          rawResponse: response
        });
      } catch (error) {
        setDebugInfo({
          error: error.message,
          errorResponse: error.response?.data
        });
      }
    };
    fetchDebugInfo();
  }, []);

  if (!debugInfo) {
    return <div style={{ padding: '10px', background: '#f0f0f0' }}>Loading debug info...</div>;
  }

  return (
    <div style={{ 
      padding: '10px', 
      background: '#fff3cd', 
      border: '1px solid #ffc107',
      margin: '10px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <strong>Role Debug Info:</strong>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default RoleDebugInfo;












