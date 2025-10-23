import Button from '../ui/Button';
import './CallToAction.css';

const CallToAction = () => {
  return (
    <section className="cta-section">
      <div className="cta-overlay"></div>
      <div className="container">
        <div className="cta-content">
          <span className="cta-label">We are here to stop poverty</span>
          <h2 className="cta-title">
            We are fundraising for the <span className="highlight">people</span> who are fighting against poverty
          </h2>
          <Button variant="primary" size="large">Donate now</Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
