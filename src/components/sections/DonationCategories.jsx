import Card from '../ui/Card';
import { FaBook, FaTint, FaHandHoldingMedical, FaUtensils } from 'react-icons/fa';
import './DonationCategories.css';

const DonationCategories = () => {
  const categories = [
    {
      icon: <FaBook />,
      title: 'Children education',
      bgColor: '#E3F2FD',
    },
    {
      icon: <FaTint />,
      title: 'Clean mineral water',
      bgColor: '#FFF3E0',
    },
    {
      icon: <FaHandHoldingMedical />,
      title: 'Surgery & treatment',
      bgColor: '#E0F2F1',
    },
    {
      icon: <FaUtensils />,
      title: 'Children education',
      bgColor: '#F3E5F5',
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
                <p className="category-label">Donate for</p>
                <h3 className="category-title">{category.title}</h3>
                <a href="#" className="category-link">More details...</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DonationCategories;
