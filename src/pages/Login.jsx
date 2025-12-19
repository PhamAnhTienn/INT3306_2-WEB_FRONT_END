import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth/authService';
import '../styles/index.css';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.userResponse) {
        const user = response.userResponse;

        console.log('Logged in user:', user);
        console.log('User role:', user.role);

        if (user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else if (user.role === 'EVENT_MANAGER') {
          navigate('/dashboard/manager');
        } else if (user.role === 'VOLUNTEER') {
          navigate('/dashboard/volunteer');
        } else {
          navigate('/');
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);

      if (err.response?.userResponse?.message) {
        setError(err.response.userResponse.message);
      } else if (err.response?.status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
      } else if (err.response?.status === 500) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau ít phút.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    try {
      authAPI.initiateGoogleSignIn();
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-section">
        <div className="container">
          <div className="login-container">
            <div className="login-form-wrapper">
              <div className="login-header">
                <h2 className="login-subtitle">Chào mừng bạn quay trở lại với cộng đồng tình nguyện</h2>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="form-error" style={{
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    padding: '12px',
                    marginBottom: '20px',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder="Tên đăng nhập"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </form>

              <div className="login-divider">
                <span className="divider-line"></span>
                <span className="divider-text">hoặc</span>
                <span className="divider-line"></span>
              </div>

              <button type="button" className="google-signin-btn" onClick={handleGoogleSignIn}>
                <svg
                  className="google-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="google-text">Đăng nhập với Google</span>
              </button>

              <div className="login-footer">
                <p className="register-link" style={{ marginBottom: '8px' }}>
                  <Link to="/forgot-password">Quên mật khẩu?</Link>
                </p>
                <p className="register-link">
                  Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;