import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth/authService';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from backend
        const authData = await authAPI.handleOAuth2Callback();
        
        if (authData?.userResponse) {
          const user = authData.userResponse;
          
          console.log('Google sign-in successful:', user);
          console.log('User role:', user.user_role);
          
          // Navigate based on user role
          if (user.user_role === 'EVENT_MANAGER') {
            navigate('/dashboard/manager', { replace: true });
          } else if (user.user_role === 'VOLUNTEER') {
            navigate('/dashboard/volunteer', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          setError('Authentication failed. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('OAuth2 callback error:', err);
        setError('Failed to complete sign-in. Please try again.');
        setLoading(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
          Completing sign-in...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>
            Authentication Error
          </h2>
          <p style={{ color: '#721c24', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuth2Callback;