import Button from '../ui/Button';
import { FaPlay } from 'react-icons/fa';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section section">
      <div className="container">
        <div className="about-content">
          <div className="about-images">
            <div className="about-img-grid">
              <img 
                src="https://images2.thanhnien.vn/528068263637045248/2025/7/30/hinh-8-1753850551745403626451.jpg" 
                alt="Hoạt động trồng cây và bảo vệ môi trường" 
                className="about-img about-img-1"
              />
              <img 
                src="https://media.baobinhphuoc.com.vn/upload/news/4_2025/3_12370903042025.jpg" 
                alt="Hoạt động thiện nguyện bình dân học vụ số"
                className="about-img about-img-2"
              />
            </div>
            <div className="decorative-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>

          <div className="about-text">
            <span className="section-label">Về chúng mình</span>
            <h2 className="section-title">
              Kiến tạo thay đổi từ những <span className="highlight">hành động nhỏ</span>
            </h2>
            <p className="section-tagline">Nền tảng quản lý và kết nối tình nguyện viên toàn diện</p>
            
            <div className="about-description">
              <p>
                Chúng mình hỗ trợ không gian để tổ chức và tham gia các hoạt động xã hội đa dạng: từ trồng cây, dọn rác bảo vệ môi trường, từ thiện đến các lớp học bình dân học vụ số.
              </p>
              <p>
                Khác với các nền tảng thông thường, hệ thống tích hợp kênh thảo luận riêng cho từng sự kiện. Bạn có thể chia sẻ khoảnh khắc, bình luận và tương tác với cộng đồng ngay trên tường của sự kiện đó.
              </p>
              <p>
                Lịch sử tham gia và trạng thái hoàn thành đều được ghi nhận chi tiết trên Dashboard cá nhân, giúp tình nguyện viên dễ dàng quản lý sự kiện và theo dõi hành trình đóng góp của mình.
              </p>
            </div>

            <div className="about-actions">
              <Button variant="primary" size="large">Đăng ký tham gia</Button>
              <button className="play-button">
                <div className="play-icon">
                  <FaPlay />
                </div>
                <span>Quy trình hoạt động</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
