import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import './CallToAction.css';

const CallToAction = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <section className="cta-section">
      <div className="cta-overlay"></div>
      <div className="container">
        <div className="cta-content">
          <span className="cta-label">Bạn đã sẵn sàng tạo nên sự thay đổi?</span>
          <h2 className="cta-title">
            Đừng chờ đợi, hãy bắt đầu hành trình <span className="highlight">tình nguyện</span> của bạn ngay hôm nay
          </h2>
          <Button variant="primary" size="large" onClick={handleRegisterClick}>Đăng ký tài khoản ngay</Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
