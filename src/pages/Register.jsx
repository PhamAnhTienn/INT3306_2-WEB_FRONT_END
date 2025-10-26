import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
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
    // Handle registration logic here
    console.log('Registration data:', formData);
  };

  return (
    <div className="register-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Register</h1>
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">»</span>
            <span className="breadcrumb-current">Register</span>
          </nav>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="register-section">
        <div className="container">
          <div className="register-container">
            <div className="register-form-wrapper">
              <div className="register-header">
                <h3 className="register-title">Register your account</h3>
                <h2 className="register-subtitle">Become a member and enhance your hand</h2>
              </div>

              <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Enter mobile number"
                    className="form-input"
                    value={formData.mobile}
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

                <button type="submit" className="register-btn">
                  Register
                </button>
              </form>

              <div className="register-footer">
                <p className="login-link">
                  Already have an account? <Link to="/login">Login here</Link>
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