// src/components/effects/PawPrintTrail.jsx
// Animated paw print trail that follows the dog as it moves

import * as React from 'react';

/**
 * PawPrintTrail - Creates adorable paw print effects that fade out behind the dog
 * 
 * @param {Object} props
 * @param {boolean} props.isActive - Whether to spawn new paw prints
 */
export default function PawPrintTrail({ isActive = false }) {
  const [prints, setPrints] = React.useState([]);
  const printIdCounter = React.useRef(0);

  React.useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newPrint = {
        id: printIdCounter.current++,
        createdAt: Date.now(),
        left: `${40 + Math.random() * 20}%`,
        rotation: Math.random() * 40 - 20,
        size: 0.8 + Math.random() * 0.4,
        flip: Math.random() > 0.5,
      };

      setPrints(current => [...current, newPrint].slice(-8)); // Keep last 8 prints
    }, 300);

    return () => clearInterval(interval);
  }, [isActive]);

  // Cleanup old prints
  React.useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setPrints(current => current.filter(p => now - p.createdAt < 3000));
    }, 500);

    return () => clearInterval(cleanup);
  }, []);

  if (prints.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {prints.map(print => {
        const age = Date.now() - print.createdAt;
        const opacity = Math.max(0, 1 - (age / 3000));

        return (
          <div
            key={print.id}
            className="absolute bottom-24 transition-opacity duration-500"
            style={{
              left: print.left,
              opacity,
              transform: `rotate(${print.rotation}deg) scale(${print.size}) ${print.flip ? 'scaleX(-1)' : ''}`,
            }}
          >
            <div className="text-2xl text-amber-900/30 select-none">
              🐾
            </div>
          </div>
        );
      })}
    </div>
  );
}
