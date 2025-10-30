import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2Failure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Authentication failed';

  useEffect(() => {
    // Auto redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <svg 
          style={{ width: '48px', height: '48px', marginBottom: '16px' }}
          fill="#856404" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h2 style={{ 
          color: '#856404', 
          marginBottom: '12px',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Google Sign-In Failed
        </h2>
        <p style={{ 
          color: '#856404', 
          marginBottom: '16px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {error}
        </p>
        <p style={{
          color: '#666',
          fontSize: '13px',
          marginBottom: '24px'
        }}>
          Redirecting to login page in 5 seconds...
        </p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          style={{
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e0a800'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ffc107'}
        >
          Back to Login Now
        </button>
      </div>
    </div>
  );
};

export default OAuth2Failure;