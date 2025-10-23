import './ProgressBar.css';

const ProgressBar = ({ percentage, showLabel = true }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        >
          {showLabel && <span className="progress-label">{percentage}%</span>}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
