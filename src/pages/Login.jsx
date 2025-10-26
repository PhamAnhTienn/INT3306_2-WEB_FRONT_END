import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login data:', formData);
  };

  return (
    <div className="login-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Login</h1>
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">»</span>
            <span className="breadcrumb-current">Login</span>
          </nav>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="login-section">
        <div className="container">
          <div className="login-container">
            <div className="login-form-wrapper">
              <div className="login-header">
                <h3 className="login-title">Login your account</h3>
                <h2 className="login-subtitle">Join our community to help peoples</h2>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter user name"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Login
                </button>
              </form>

              <div className="login-footer">
                <p className="register-link">
                  Don't have an account? <Link to="/register">Register now</Link>
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