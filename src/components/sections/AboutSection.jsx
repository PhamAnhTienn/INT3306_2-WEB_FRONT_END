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
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400" 
                alt="Helping hands" 
                className="about-img about-img-1"
              />
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400" 
                alt="Happy children" 
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
            <span className="section-label">Welcome to Jago</span>
            <h2 className="section-title">
              A world where <span className="highlight">poverty</span> will not exists
            </h2>
            <p className="section-tagline">We are the largest crowdfunding</p>
            
            <div className="about-description">
              <p>Lorem ipsum dolor sit amet, consectetur natted adipiscing elit sed do eiusmod tempor incididunt ut labore.</p>
              <p>Lorem ipsum dolor sit amet, consectetur natted adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua lonm andim.</p>
              <p>Lorem ipsum dolor sit amet, consectetur natted adipiscing elit sed do eiusmod tempor incididunt ut labore et simply.</p>
            </div>

            <div className="about-actions">
              <Button variant="primary" size="large">Learn more</Button>
              <button className="play-button">
                <div className="play-icon">
                  <FaPlay />
                </div>
                <span>How we work</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
