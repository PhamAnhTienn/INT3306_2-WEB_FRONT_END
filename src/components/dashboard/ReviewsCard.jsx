import React from 'react';
import './ReviewsCard.css';

const ReviewsCard = ({ reviews }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'info';
    if (percentage >= 20) return 'warning';
    return 'danger';
  };

  return (
    <div className="reviews-card">
      <div className="reviews-header">
        <h6 className="reviews-title">Reviews</h6>
      </div>
      
      <div className="reviews-body">
        {reviews.map((review, index) => (
          <div key={index} className="review-item">
            <div className="review-info">
              <span className="review-label">{review.label}</span>
              <span className="review-percentage">{review.percentage}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className={`progress-bar progress-bar-${getProgressColor(review.percentage)}`}
                style={{ width: `${review.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsCard;
