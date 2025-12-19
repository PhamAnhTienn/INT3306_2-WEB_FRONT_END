import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/auth/authService';
import '../styles/index.css';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess('Nếu email tồn tại, đường dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gửi yêu cầu quên mật khẩu thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Forgot Password</h1>
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">»</span>
            <span className="breadcrumb-current">Forgot Password</span>
          </nav>
        </div>
      </div>

      <div className="login-section">
        <div className="container">
          <div className="login-container">
            <div className="login-form-wrapper">
              <div className="login-header">
                <h3 className="login-title">Quên mật khẩu</h3>
                <h2 className="login-subtitle">
                  Nhập email để nhận đường dẫn đặt lại mật khẩu
                </h2>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {error && (
                  <div
                    className="form-error"
                    style={{
                      color: '#dc3545',
                      backgroundColor: '#f8d7da',
                      border: '1px solid #f5c6cb',
                      borderRadius: '4px',
                      padding: '12px',
                      marginBottom: '20px',
                      fontSize: '14px',
                    }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="form-error"
                    style={{
                      color: '#0f5132',
                      backgroundColor: '#d1e7dd',
                      border: '1px solid #badbcc',
                      borderRadius: '4px',
                      padding: '12px',
                      marginBottom: '20px',
                      fontSize: '14px',
                    }}
                  >
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </form>

              <div className="login-footer">
                <p className="register-link">
                  Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
















