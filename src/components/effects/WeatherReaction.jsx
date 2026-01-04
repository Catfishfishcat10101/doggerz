// src/components/effects/WeatherReaction.jsx
// Dog reacts to weather conditions with cute animations

import * as React from 'react';

/**
 * WeatherReaction - Shows dog reacting to weather (shake off rain, snow on nose, etc.)
 * Pure visual/narrative layer - no logic changes
 * 
 * @param {Object} props
 * @param {string} props.weather - Current weather condition
 * @param {Function} props.onReactionComplete - Callback when reaction animation completes
 */
export default function WeatherReaction({ weather, onReactionComplete }) {
  const [showReaction, setShowReaction] = React.useState(false);
  const [reaction, setReaction] = React.useState(null);

  React.useEffect(() => {
    if (!weather) return;

    const weatherLower = String(weather).toLowerCase();
    let reactionType = null;

    if (weatherLower.includes('rain') || weatherLower.includes('drizzle')) {
      reactionType = 'shake';
    } else if (weatherLower.includes('snow')) {
      reactionType = 'sneeze';
    } else if (weatherLower.includes('thunder') || weatherLower.includes('storm')) {
      reactionType = 'scared';
    } else if (weatherLower.includes('sun') || weatherLower.includes('clear')) {
      reactionType = 'bask';
    }

    if (reactionType && Math.random() > 0.7) { // 30% chance to trigger
      setReaction(reactionType);
      setShowReaction(true);

      const timer = setTimeout(() => {
        setShowReaction(false);
        onReactionComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [weather, onReactionComplete]);

  if (!showReaction || !reaction) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      {reaction === 'shake' && (
        <div className="animate-wiggle">
          <div className="relative">
            <div className="text-6xl">🐕</div>
            {/* Water droplets flying off */}
            <div className="absolute top-0 left-0 text-2xl animate-[slideInUp_0.5s_ease-out] opacity-60">💧</div>
            <div className="absolute top-0 right-0 text-2xl animate-[slideInUp_0.6s_ease-out] opacity-60" style={{ animationDelay: '0.1s' }}>💧</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/60 text-white px-3 py-1 rounded-full whitespace-nowrap animate-fadeIn">
              *shake shake*
            </div>
          </div>
        </div>
      )}

      {reaction === 'sneeze' && (
        <div>
          <div className="relative">
            <div className="text-6xl animate-gentleBounce">🐕</div>
            <div className="absolute top-0 right-0 text-3xl animate-[slideInUp_0.4s_ease-out]">❄️</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/60 text-white px-3 py-1 rounded-full whitespace-nowrap animate-fadeIn">
              *achoo!*
            </div>
          </div>
        </div>
      )}

      {reaction === 'scared' && (
        <div>
          <div className="relative animate-wiggle">
            <div className="text-6xl">🐕</div>
            <div className="absolute -top-4 right-0 text-2xl animate-pulse">😰</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/60 text-white px-3 py-1 rounded-full whitespace-nowrap animate-fadeIn">
              *whimper*
            </div>
          </div>
        </div>
      )}

      {reaction === 'bask' && (
        <div>
          <div className="relative">
            <div className="text-6xl">🐕</div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl animate-pulse" style={{ animationDuration: '2s' }}>☀️</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/60 text-white px-3 py-1 rounded-full whitespace-nowrap animate-fadeIn">
              *soaking up sunshine*
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
