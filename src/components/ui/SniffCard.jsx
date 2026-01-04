// src/components/ui/SniffCard.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * SniffCard Component
 * Layered card with hover scent trails and tiny particle puffs
 * Premium cozy storybook aesthetic
 */
export function SniffCard({ 
  title, 
  description, 
  icon, 
  scent = 'vanilla',
  onClick,
  locked = false,
  children 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);

  const scentColors = {
    vanilla: { base: '#FFF4E6', trail: '#FFE4B5', particle: '#F4A460' },
    lavender: { base: '#F3E5F5', trail: '#E1BEE7', particle: '#BA68C8' },
    pine: { base: '#E8F5E9', trail: '#C8E6C9', particle: '#66BB6A' },
    ocean: { base: '#E3F2FD', trail: '#BBDEFB', particle: '#42A5F5' },
    rose: { base: '#FCE4EC', trail: '#F8BBD0', particle: '#EC407A' },
    mint: { base: '#E0F2F1', trail: '#B2DFDB', particle: '#26A69A' }
  };

  const colors = scentColors[scent] || scentColors.vanilla;

  const handleMouseMove = (e) => {
    if (!isHovered || locked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create particle
    const particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 1,
      life: 1
    };

    setParticles(prev => [...prev, particle].slice(-20)); // Keep last 20

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 1000);
  };

  return (
    <div
      className={`sniff-card relative group overflow-hidden rounded-2xl transition-all duration-300 ${
        locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'
      }`}
      style={{
        background: `linear-gradient(135deg, ${colors.base} 0%, white 100%)`
      }}
      onMouseEnter={() => !locked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={() => !locked && onClick?.()}
    >
      {/* Scent trail overlay */}
      {isHovered && !locked && (
        <div 
          className="absolute inset-0 pointer-events-none animate-pulse-slow"
          style={{
            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${colors.trail} 0%, transparent 60%)`
          }}
        />
      )}

      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none animate-float-up"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: colors.particle,
            opacity: 0.6
          }}
        />
      ))}

      {/* Card content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`text-4xl transform transition-transform duration-300 ${
                isHovered && !locked ? 'scale-110 rotate-6' : ''
              }`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {title}
                {locked && <span className="ml-2 text-gray-400">🔒</span>}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Children content */}
        {children && (
          <div className="pt-2 border-t border-gray-200">
            {children}
          </div>
        )}

        {/* Hover indicator */}
        {!locked && (
          <div className={`absolute bottom-4 right-4 text-xs font-medium text-gray-500 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            👃 Sniff detected!
          </div>
        )}
      </div>

      {/* Layered effect borders */}
      <div className={`absolute inset-0 border-2 rounded-2xl transition-all duration-300 ${
        isHovered && !locked 
          ? 'border-opacity-40' 
          : 'border-opacity-20'
      }`} 
      style={{ borderColor: colors.particle }}
      />
      
      <div className={`absolute inset-1 border rounded-2xl transition-all duration-300 ${
        isHovered && !locked 
          ? 'border-opacity-20' 
          : 'border-opacity-10'
      }`} 
      style={{ borderColor: colors.particle }}
      />
    </div>
  );
}

SniffCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  scent: PropTypes.oneOf(['vanilla', 'lavender', 'pine', 'ocean', 'rose', 'mint']),
  onClick: PropTypes.func,
  locked: PropTypes.bool,
  children: PropTypes.node
};

export default SniffCard;
