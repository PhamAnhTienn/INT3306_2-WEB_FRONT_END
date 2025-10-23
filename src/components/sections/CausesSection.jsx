import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { FaCalendar, FaUser } from 'react-icons/fa';
import './CausesSection.css';

const CausesSection = () => {
  const causes = [
    {
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500',
      category: 'Food & water',
      title: 'Collect fund for drinking water & healthy food',
      description: 'Lorem ipsum dolor sit amet, consectetur notted adipisicing elit sed do eiusmod tempor.',
      goal: '$10,000',
      raised: 75,
      date: '20 Dec, 2021',
      author: 'Admin',
    },
    {
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500',
      category: 'Food & water',
      title: 'Collect fund for drinking water & healthy food',
      description: 'Lorem ipsum dolor sit amet, consectetur notted adipisicing elit sed do eiusmod tempor.',
      goal: '$10,000',
      raised: 75,
      date: '20 Dec, 2021',
      author: 'Admin',
    },
    {
      image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500',
      category: 'Food & water',
      title: 'Collect fund for drinking water & healthy food',
      description: 'Lorem ipsum dolor sit amet, consectetur notted adipisicing elit sed do eiusmod tempor.',
      goal: '$10,000',
      raised: 75,
      date: '20 Dec, 2021',
      author: 'Admin',
    },
  ];

  return (
    <section className="causes-section section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">We are here to stop poverty</span>
          <h2 className="section-title">
            We are always where other people<span className="highlight">need</span> help
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
                    <span className="stat-label">Goal: <strong>{cause.goal}</strong></span>
                    <span className="stat-percentage">{cause.raised}%</span>
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
                  <span>By: {cause.author}</span>
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
