import Button from '../ui/Button';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="highlight">Share</span> your love to make someone's life better
            </h1>
            <p className="hero-description">
              Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a type and scrambled.
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-info">
                  <p className="stat-label">Total donations</p>
                  <h3 className="stat-value">$1,980k</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-img-wrapper">
              <div className="decorative-shape shape-1"></div>
              <div className="decorative-shape shape-2"></div>
              <img 
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600" 
                alt="Helping people" 
                className="hero-img"
              />
              <div className="volunteer-badge">
                <div className="volunteer-icons">
                  <div className="avatar-group">
                    <div className="avatar"></div>
                    <div className="avatar"></div>
                    <div className="avatar"></div>
                    <div className="avatar"></div>
                  </div>
                </div>
                <p>Join our volunteer team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
