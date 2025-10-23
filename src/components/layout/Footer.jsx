import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <span className="newsletter-label">Newsletter</span>
              <h3>To get weekly & monthly news, <span className="highlight">Subscribe</span> to our newsletter.</h3>
            </div>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your mail address" 
                className="newsletter-input"
              />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo">
                <img src="/logo.svg" alt="Jago Welfare" className="logo-img" />
                <span className="logo-text">Jago welfare</span>
              </div>
              <p className="footer-desc">
                Lorem ipsum dolor sit amet consectetur elit sed eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="footer-contact">
                <p><strong>Address:</strong> 958 Walnuswood Ave. Webster, NY 14580</p>
                <p><strong>Phone:</strong> +61 234-567-890</p>
                <p><strong>Email:</strong> info@example.com</p>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Quick links</h4>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Projects</a></li>
                <li><a href="#">News</a></li>
                <li><a href="#">Career</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#">Help & FAQ</a></li>
                <li><a href="#">Causes</a></li>
                <li><a href="#">Events</a></li>
                <li><a href="#">Contact us</a></li>
                <li><a href="#">terms-service</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Latest tweets</h4>
              <div className="twitter-feed">
                <p className="tweet-hashtag">#digitalmarketing</p>
                <p className="tweet-text">
                  Lorem ipsum dolor sit amet consectetur elit sed eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Sit amet consectetur elit sed eiusmod tempor
                </p>
                <a href="#" className="tweet-link">twitter.com//#puredrinkingwater</a>
                <p className="tweet-date">December 13, 2021 04:20 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>Copyright © 2024 All Rights Reserved</p>
            <div className="footer-social">
              <a href="#" className="social-link"><FaFacebookF /></a>
              <a href="#" className="social-link"><FaTwitter /></a>
              <a href="#" className="social-link"><FaInstagram /></a>
              <a href="#" className="social-link"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
