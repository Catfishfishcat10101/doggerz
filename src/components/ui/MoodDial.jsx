// src/components/ui/MoodDial.jsx

import PropTypes from 'prop-types';

/**
 * MoodDial Component
 * Premium radial meter showing pup energy, hunger, and curiosity
 * Cozy storybook aesthetic with smooth animations
 */
export function MoodDial({ energy = 50, hunger = 50, curiosity = 50, size = 'md' }) {
  const sizes = {
    sm: { width: 120, stroke: 8, radius: 50 },
    md: { width: 180, stroke: 12, radius: 75 },
    lg: { width: 240, stroke: 16, radius: 100 }
  };

  const config = sizes[size] || sizes.md;
  const { width, stroke, radius } = config;
  const center = width / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate offsets for each stat (0-100)
  const energyOffset = circumference - (energy / 100) * circumference;
  const hungerOffset = circumference - (hunger / 100) * circumference;
  const curiosityOffset = circumference - (curiosity / 100) * circumference;

  // Color schemes
  const colors = {
    energy: {
      base: '#FF6B9D',
      glow: 'rgba(255, 107, 157, 0.3)'
    },
    hunger: {
      base: '#FFD93D',
      glow: 'rgba(255, 217, 61, 0.3)'
    },
    curiosity: {
      base: '#4ECDC4',
      glow: 'rgba(78, 205, 196, 0.3)'
    }
  };

  return (
    <div className="mood-dial relative inline-flex items-center justify-center">
      {/* SVG Radial Meters */}
      <svg 
        width={width} 
        height={width} 
        className="transform -rotate-90"
      >
        <defs>
          {/* Glows */}
          <filter id="glow-energy" height="200%" width="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter id="glow-hunger" height="200%" width="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter id="glow-curiosity" height="200%" width="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>

        {/* Background circles */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius - stroke - 4}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius - (stroke * 2) - 8}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Energy (outer ring) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.energy.base}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={energyOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: 'url(#glow-energy)' }}
        />

        {/* Hunger (middle ring) */}
        <circle
          cx={center}
          cy={center}
          r={radius - stroke - 4}
          stroke={colors.hunger.base}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={hungerOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out delay-100"
          style={{ filter: 'url(#glow-hunger)' }}
        />

        {/* Curiosity (inner ring) */}
        <circle
          cx={center}
          cy={center}
          r={radius - (stroke * 2) - 8}
          stroke={colors.curiosity.base}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={curiosityOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out delay-200"
          style={{ filter: 'url(#glow-curiosity)' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center space-y-1">
          {/* Emoji indicator */}
          <div className="text-4xl animate-bounce-gentle">
            {energy > 70 ? '🎾' : energy > 40 ? '😊' : '😴'}
          </div>
          
          {/* Stats text */}
          <div className="text-xs font-medium text-gray-600 space-y-0.5">
            <div className="flex items-center gap-1 justify-center">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.energy.base }}></span>
              <span>{energy}%</span>
            </div>
            <div className="flex items-center gap-1 justify-center">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.hunger.base }}></span>
              <span>{hunger}%</span>
            </div>
            <div className="flex items-center gap-1 justify-center">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.curiosity.base }}></span>
              <span>{curiosity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-xs font-semibold text-gray-700">
          Energy
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 text-xs font-semibold text-gray-700">
          Hunger
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 text-xs font-semibold text-gray-700">
          Curiosity
        </div>
      </div>
    </div>
  );
}

MoodDial.propTypes = {
  energy: PropTypes.number,
  hunger: PropTypes.number,
  curiosity: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default MoodDial;
