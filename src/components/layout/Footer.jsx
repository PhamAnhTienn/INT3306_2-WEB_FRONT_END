import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <span className="newsletter-label">Nhận thông báo mới</span>
              <h3>Đăng ký để không bỏ lỡ các <span className="highlight">sự kiện</span> ý nghĩa sắp tới.</h3>
            </div>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Nhập địa chỉ email của bạn..."
                className="newsletter-input"
              />
              <button className="btn btn-primary">Đăng ký ngay</button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
            <div className="footer-col">
              <div className="logo">
                <img src="/logo.svg" alt="Voluntarius" className="logo-img" />
                <span className="logo-text">Voluntarius</span>
              </div>
              <p className="footer-desc">
                Nền tảng kết nối tình nguyện viên và tổ chức xã hội hàng đầu. 
                Chúng tôi cam kết minh bạch hóa mọi hoạt động và tạo ra môi trường tương tác văn minh cho cộng đồng.
              </p>
              <div className="footer-contact">
                <p><strong>Địa chỉ:</strong> Tầng 5, Tòa nhà Innovation, Q. Cầu Giấy, Hà Nội</p>
                <p><strong>Hotline:</strong> 1900 1234 (8:00 - 17:00)</p>
                <p><strong>Email:</strong> hotro@voluntarius.vn</p>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Khám phá</h4>
              <ul className="footer-links">
                <li><a href="#">Về chúng mình</a></li>
                <li><a href="#">Danh sách sự kiện</a></li>
                <li><a href="#">Bảng vàng thành tích</a></li>
                <li><a href="#">Tin tức cộng đồng</a></li>
                <li><a href="#">Dành cho nhà tổ chức</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Hỗ trợ</h4>
              <ul className="footer-links">
                <li><a href="#">Trung tâm trợ giúp</a></li>
                <li><a href="#">Quy định người dùng</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
                <li><a href="#">Hướng dẫn đăng ký</a></li>
                <li><a href="#">Liên hệ hợp tác</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>© 2025 Voluntarius. Nền tảng phi lợi nhuận vì cộng đồng.</p>
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
