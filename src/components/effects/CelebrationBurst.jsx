// src/components/effects/CelebrationBurst.jsx
// Particle burst animation for achievements and celebrations

import * as React from 'react';

/**
 * CelebrationBurst - Confetti/particle burst for celebrations
 * 
 * @param {Object} props
 * @param {boolean} props.isActive - Trigger the celebration
 * @param {string} props.type - Celebration type ('confetti', 'hearts', 'stars', 'sparkles')
 */
export default function CelebrationBurst({ isActive = false, type = 'confetti' }) {
  const [particles, setParticles] = React.useState([]);
  const particleIdCounter = React.useRef(0);

  React.useEffect(() => {
    if (!isActive) return;

    // Create burst of particles
    const newParticles = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        createdAt: Date.now(),
        left: `${45 + Math.random() * 10}%`,
        bottom: '50%',
        angle: (Math.PI * 2 * i) / particleCount + (Math.random() * 0.5 - 0.25),
        speed: 100 + Math.random() * 150,
        rotation: Math.random() * 360,
        color: getParticleColor(type, i),
        emoji: getParticleEmoji(type),
        delay: Math.random() * 100,
      });
    }

    setParticles(current => [...current, ...newParticles]);

    // Clear after animation completes
    const timeout = setTimeout(() => {
      setParticles(current => 
        current.filter(p => Date.now() - p.createdAt < 2000)
      );
    }, 2500);

    return () => clearTimeout(timeout);
  }, [isActive, type]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => {
        const age = Date.now() - particle.createdAt;
        const progress = Math.min(1, age / 2000);
        
        const x = Math.cos(particle.angle) * particle.speed * progress;
        const y = Math.sin(particle.angle) * particle.speed * progress - (100 * progress * progress); // gravity
        const opacity = Math.max(0, 1 - progress);

        return (
          <div
            key={particle.id}
            className="absolute text-2xl animate-[confettiPop_2s_ease-out]"
            style={{
              left: particle.left,
              bottom: particle.bottom,
              transform: `translate(${x}px, ${-y}px) rotate(${particle.rotation + progress * 360}deg)`,
              opacity,
              color: particle.color,
              animationDelay: `${particle.delay}ms`,
            }}
          >
            {particle.emoji}
          </div>
        );
      })}
    </div>
  );
}

function getParticleColor(type, index) {
  if (type === 'hearts') return '#ec4899';
  if (type === 'stars') return '#fbbf24';
  if (type === 'sparkles') return '#a78bfa';
  
  // Confetti: random colors
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
}

function getParticleEmoji(type) {
  if (type === 'hearts') return '💖';
  if (type === 'stars') return '⭐';
  if (type === 'sparkles') return '✨';
  return '🎉'; // confetti
}
