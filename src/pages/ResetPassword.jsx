import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth/authService';
import '../styles/index.css';
import './Login.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPassword = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError('Token không hợp lệ hoặc đã hết hạn.');
        setLoading(false);
        return;
      }
      try {
        await authAPI.validateResetToken(token);
        setIsValid(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Token không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu quên mật khẩu.'
        );
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !token) return;
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Reset Password</h1>
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">»</span>
            <span className="breadcrumb-current">Reset Password</span>
          </nav>
        </div>
      </div>

      <div className="login-section">
        <div className="container">
          <div className="login-container">
            <div className="login-form-wrapper">
              <div className="login-header">
                <h3 className="login-title">Đặt lại mật khẩu</h3>
                <h2 className="login-subtitle">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </h2>
              </div>

              {loading ? (
                <p>Đang kiểm tra token...</p>
              ) : !isValid ? (
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
                  <div style={{ marginTop: '10px' }}>
                    <Link to="/forgot-password">Gửi lại yêu cầu quên mật khẩu</Link>
                  </div>
                </div>
              ) : (
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
                      type="password"
                      name="password"
                      placeholder="New password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                  </button>
                </form>
              )}

              <div className="login-footer">
                <p className="register-link">
                  Quay lại <Link to="/login">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
















