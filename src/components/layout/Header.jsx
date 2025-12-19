import { FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Về dự án', path: '/#about' }
  ];

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-contact">
              <a href="mailto:hotro@voluntarius.vn" className="contact-item">
                <FaEnvelope /> hotro@voluntarius.vn
              </a>
              <a href="tel:+84123456789" className="contact-item">
                <FaPhone /> 1900 1234
              </a>
            </div>
            <div className="header-social">
              <a href="#" className="social-link"><FaFacebookF /></a>
              <a href="#" className="social-link"><FaTwitter /></a>
              <a href="#" className="social-link"><FaInstagram /></a>
              <a href="#" className="social-link"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <Link to="/" className="logo">
              <img src="/logo.svg" alt="Voluntarius" className="logo-img" />
              <span className="logo-text">Voluntarius</span>
            </Link>

            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
              <ul className="nav-list">
                {navItems.map((item, index) => (
                  <li key={index} className="nav-item">
                    {/* Sử dụng a tag với href bắt đầu bằng # nếu muốn scroll trong trang Home */}
                    {item.path.startsWith('/#') ? (
                       <a href={item.path.substring(1)} className="nav-link">{item.name}</a>
                    ) : (
                       <Link to={item.path} className="nav-link">{item.name}</Link>
                    )}
                  </li>
                ))}
                
                {/* Link Đăng nhập tách riêng ra khỏi list để dễ style */}
                <li className="nav-item">
                    <Link to="/login" className="nav-link font-weight-bold">
                        Đăng nhập
                    </Link>
                </li>
              </ul>

              {/* Button Đăng ký nổi bật thay thế cho Donate */}
              <div className="header-actions">
                <Link to="/register" className="btn btn-primary">
                    Đăng ký ngay
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
