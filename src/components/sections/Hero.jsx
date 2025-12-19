import Button from '../ui/Button';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="highlight">Kết nối</span> trái tim, lan tỏa hành động vì cộng đồng
            </h1>
            <p className="hero-description">
              Nền tảng hỗ trợ tổ chức và tham gia các hoạt động tình nguyện đa dạng, từ trồng cây, bảo vệ môi trường đến các chương trình thiện nguyện kết nối cộng đồng.
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-icon">🌟</div>
                <div className="stat-info">
                  <p className="stat-label">Sự kiện đã hoàn thành</p>
                  <h3 className="stat-value">1,250+</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-img-wrapper">
              <div className="decorative-shape shape-1"></div>
              <div className="decorative-shape shape-2"></div>
              <img 
                src="https://images2.thanhnien.vn/528068263637045248/2024/7/7/1-17203461144681960836779.jpg" 
                alt="Hoạt động tình nguyện cộng đồng" 
                className="hero-img"
              />
              <div className="volunteer-badge">
                <div className="volunteer-icons">
                  <div className="avatar-group">
                    <img 
                      className="avatar" 
                      src="https://images2.thanhnien.vn/528068263637045248/2024/6/22/anh-3-nguyen-tien-dat-sinh-vien-truong-dai-hoc-nguyen-tat-thanh-anh-luu-nguyen-phuong-1719041126018397811229.jpg" 
                      alt="Volunteer 1" 
                    />
                    <img 
                      className="avatar" 
                      src="https://images2.thanhnien.vn/528068263637045248/2024/6/22/anh-4-tu-thi-tu-uyen-sinh-vien-truong-dai-hoc-nguyen-tat-thanh-anh-luu-nguyen-phuong-1719041126042474693930.jpg" 
                      alt="Volunteer 2" 
                    />
                    <img 
                      className="avatar" 
                      src="https://images2.thanhnien.vn/528068263637045248/2024/6/22/anh-2-nguyen-hoang-phi-sinh-vien-truong-dai-hoc-nguyen-tat-thanh-anh-luu-nguyen-phuong-1719041125810525630836.jpg" 
                      alt="Volunteer 3" 
                    />
                    <img 
                      className="avatar" 
                      src="https://cdn.nhandan.vn/images/dff03bc8a13d05d2cdde0741def11dbad9a5aa63642097dfb10536426427f8f75b1e936572a4b30bf6554ec33f1a2cafb7ae13cda333b1a658a4aa09dbd85477/ndo_br_miu-4226.jpg" 
                      alt="Volunteer 4" 
                    />
                    <div className="avatar more-avatar">+5</div>
                  </div>
                </div>
                <p>Gia nhập cộng đồng ngay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
