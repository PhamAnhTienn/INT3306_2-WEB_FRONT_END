import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { FaCalendar, FaUser } from 'react-icons/fa';
import './CausesSection.css';

const CausesSection = () => {
  const causes = [
    {
      image: 'https://ktmt.vnmediacdn.com/images/2021/03/23/31-1616486317-z2392852860343-a1977a3620ec3c5ded3e09085b990fb8.jpg',
      category: 'Môi trường',
      title: 'Chiến dịch Làm sạch Bãi biển Vũng Tàu',
      description: 'Cùng chung tay thu gom rác thải nhựa, trả lại vẻ đẹp hoang sơ cho bờ biển và bảo vệ sinh vật biển.',
      goal: '50 TNV',
      raised: 80,
      date: '25 Th12, 2025',
      author: 'Ban QL Sự kiện',
    },
    {
      image: 'https://dxcenter.hochiminhcity.gov.vn/documents/20142/0/1757908048046buoi-dao-tao.jpg/6f9e7681-370e-cb83-4e3c-877f6086dd8b',
      category: 'Giáo dục',
      title: 'Lớp học bình dân học vụ số cho người cao tuổi',
      description: 'Hướng dẫn người cao tuổi sử dụng smartphone, truy cập internet an toàn và kết nối với con cháu.',
      goal: '20 TNV',
      raised: 45,
      date: '28 Th12, 2025',
      author: 'CLB Tin Học',
    },
    {
      image: 'https://thanhnien.mediacdn.vn/Uploaded/khanhhd/2022_11_12/trong-cay-1-3700.jpg',
      category: 'Thiên nhiên',
      title: 'Trồng 1000 cây xanh tại Vườn Quốc gia',
      description: 'Hoạt động trồng cây gây rừng, phủ xanh đồi trọc và góp phần chống biến đổi khí hậu.',
      goal: '100 TNV',
      raised: 60,
      date: '05 Th01, 2026',
      author: 'Green Life',
    },
  ];

  return (
    <section className="causes-section section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Chung tay vì cộng đồng</span>
          <h2 className="section-title">
            Các hoạt động đang <span className="highlight">tìm kiếm</span> tình nguyện viên
          </h2>
        </div>

        <div className="causes-grid">
          {causes.map((cause, index) => (
            <Card key={index} className="cause-card">
              <div className="card-header">
                <img src={cause.image} alt={cause.title} className="card-img" />
                <span className="card-badge">{cause.category}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{cause.title}</h3>
                <p className="card-text">{cause.description}</p>

                <div className="cause-progress">
                  <div className="cause-stats">
                    <span className="stat-label">Cần tuyển: <strong>{cause.goal}</strong></span>
                    <span className="stat-percentage">{cause.raised}% Đã đăng ký</span>
                  </div>
                  <ProgressBar percentage={cause.raised} showLabel={false} />
                </div>
              </div>
              <div className="card-footer">
                <div className="card-meta">
                  <FaCalendar />
                  <span>{cause.date}</span>
                </div>
                <div className="card-meta">
                  <FaUser />
                  <span>Đăng bởi: {cause.author}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CausesSection;
