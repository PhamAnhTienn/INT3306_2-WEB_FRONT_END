import Card from '../ui/Card';
import { FaTree, FaBook, FaHandHoldingHeart, FaLaptop } from 'react-icons/fa';
import './DonationCategories.css';

const DonationCategories = () => {
  const categories = [
    {
      icon: <FaTree />,
      title: 'Bảo vệ Môi trường',
      bgColor: '#E8F5E9',
      description: 'Trồng cây, dọn rác, tái chế'
    },
    {
      icon: <FaBook />,
      title: 'Giáo dục & Đào tạo',
      bgColor: '#E3F2FD',
      description: 'Dạy học, gia sư, thư viện'
    },
    {
      icon: <FaHandHoldingHeart />,
      title: 'An sinh Xã hội',
      bgColor: '#FFF3E0',
      description: 'Giúp người già, người nghèo'
    },
    {
      icon: <FaLaptop />,
      title: 'Phổ cập Kỹ năng số',
      bgColor: '#F3E5F5',
      description: 'Lớp học internet cho cộng đồng'
    },
  ];

  return (
    <section className="donation-categories section">
      <div className="container">
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card" style={{ background: category.bgColor }}>
              <div className="category-icon-wrapper">
                <div className="category-icon">{category.icon}</div>
              </div>
              <div className="category-content">
                <p className="category-label">Hoạt động</p>
                <h3 className="category-title">{category.title}</h3>
                
                <a href="#" className="category-link">Xem các sự kiện...</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DonationCategories;
