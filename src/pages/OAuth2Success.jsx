import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth/authService';

const OAuth2Success = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuth2Success = async () => {
      try {
        // Get tokens from backend after successful Google authentication
        const authData = await authAPI.handleOAuth2Success();
        
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
        console.error('OAuth2 success handler error:', err);
        setError('Failed to complete sign-in. Please try again.');
        setLoading(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleOAuth2Success();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4285F4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          marginTop: '20px', 
          fontSize: '16px', 
          color: '#666',
          fontWeight: '500'
        }}>
          Completing Google sign-in...
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
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <svg 
            style={{ width: '48px', height: '48px', marginBottom: '16px' }}
            fill="#dc3545" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 style={{ 
            color: '#dc3545', 
            marginBottom: '12px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Authentication Error
          </h2>
          <p style={{ 
            color: '#721c24', 
            marginBottom: '24px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuth2Success;