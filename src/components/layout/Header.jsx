import { FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  const handleMouseEnter = (index) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms delay before hiding
    setDropdownTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  const navItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Causes', 
      path: '/causes',
      dropdown: ['All Causes', 'Education', 'Health', 'Food & Water']
    },
    { 
      name: 'Events', 
      path: '/events',
      dropdown: ['Upcoming Events', 'Past Events']
    },
    { name: 'Gallery', path: '/gallery' },
    { 
      name: 'News', 
      path: '/news',
      dropdown: ['Latest News', 'Blog']
    },
    { 
      name: 'Pages', 
      path: '/pages',
      dropdown: [
        { name: 'About Us', path: '/about' },
        { name: 'Our Team', path: '/team' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Testimonials', path: '/testimonials' },
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' }
      ]
    },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-contact">
              <a href="mailto:contact@domain.com" className="contact-item">
                <FaEnvelope /> contact@domain.com
              </a>
              <a href="tel:+01234567890" className="contact-item">
                <FaPhone /> +01 234 567 890
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
                  <li 
                    key={index}
                    className={`nav-item ${item.dropdown ? 'nav-item-dropdown' : ''}`}
                    onMouseEnter={() => item.dropdown && handleMouseEnter(index)}
                    onMouseLeave={() => item.dropdown && handleMouseLeave()}
                  >
                    <Link to={item.path} className="nav-link">
                      {item.name}
                      {item.dropdown && <FaChevronDown className="dropdown-icon" />}
                    </Link>
                    {item.dropdown && activeDropdown === index && (
                      <ul 
                        className="dropdown-menu"
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item.dropdown.map((subItem, subIndex) => (
                          <li key={subIndex} className="dropdown-item">
                            {typeof subItem === 'object' ? (
                              <Link to={subItem.path} className="dropdown-link">{subItem.name}</Link>
                            ) : (
                              <a href="#" className="dropdown-link">{subItem}</a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary">Donate now</button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
