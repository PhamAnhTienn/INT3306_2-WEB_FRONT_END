import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth/authService';
import '../styles/index.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
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
      const response = await authAPI.register(formData);
 
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
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Registration error:', err);

      if (err.response?.userResponse?.message) {
        setError(err.response.userResponse.message);
      } else if (err.response?.status === 400) {
        setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.');
      } else if (err.response?.status === 409) {
        setError('Tên đăng nhập hoặc Email đã tồn tại trong hệ thống.');
      } else if (err.response?.status === 500) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra kết nối và thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign-in clicked');
    setError('Google sign-in is not yet implemented');
  };

  return (
    <div className="register-page">
      <div className="register-section">
        <div className="container">
          <div className="register-container">
            <div className="register-form-wrapper">
              <div className="register-header">
                <h3 className="register-title">Đăng ký tài khoản mới</h3>
                <h2 className="register-subtitle">Bắt đầu hành trình tình nguyện của bạn thôi nào</h2>
              </div>

              <form className="register-form" onSubmit={handleSubmit}>
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
                    name="fullName"
                    placeholder="Họ và tên của bạn"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Địa chỉ Email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

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
                    type="tel"
                    name="mobile"
                    placeholder="Số điện thoại"
                    className="form-input"
                    value={formData.mobile}
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

                <button type="submit" className="register-btn" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </form>

              <div className="register-divider">
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
                <span className="google-text">Đăng ký bằng Google</span>
              </button>

              <div className="register-footer">
                <p className="login-link">
                  Bạn đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;