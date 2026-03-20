import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ value = 0, onChange, size = 'md', readOnly = false }) => {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'sm' ? 'star-sm' : size === 'lg' ? 'star-lg' : 'star-md';

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            className={`star-btn ${sizeClass} ${filled ? 'star-filled' : 'star-empty'}`}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            {filled ? <FaStar /> : <FiStar />}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
