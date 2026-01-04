// src/components/ui/Tooltip.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Tooltip Component
 * Simple, accessible tooltip for displaying helpful hints
 * Premium cozy storybook aesthetic
 */
export function Tooltip({ children, content, position = 'top', delay = 200 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900';
    }
  };

  if (!content) {
    return children;
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 ${getPositionClasses()} animate-fade-in`}
          role="tooltip"
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs whitespace-nowrap">
            {content}
          </div>
          
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}
          />
        </div>
      )}
    </div>
  );
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number
};

export default Tooltip;
