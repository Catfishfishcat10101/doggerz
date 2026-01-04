// src/components/ui/AchievementUnlocked.jsx
/**
 * Achievement Unlocked - Full-screen celebration animation
 * Stunning visual feedback for achievements with confetti and particles
 */

import React from 'react';
import { Trophy, Star, Award, Sparkles, X } from 'lucide-react';

export default function AchievementUnlocked({ achievement, onClose }) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [confetti, setConfetti] = React.useState([]);

  React.useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][
        Math.floor(Math.random() * 6)
      ],
    }));
    setConfetti(particles);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 500);
  };

  if (!achievement) return null;

  const rarityConfig = {
    common: {
      gradient: 'from-gray-500 to-gray-600',
      glow: 'shadow-gray-500/50',
      icon: Award,
    },
    rare: {
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/50',
      icon: Star,
    },
    epic: {
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/50',
      icon: Sparkles,
    },
    legendary: {
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      glow: 'shadow-yellow-500/50',
      icon: Trophy,
    },
  };

  const rarity = achievement.rarity || 'common';
  const config = rarityConfig[rarity] || rarityConfig.common;
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/80 backdrop-blur-md
        transition-opacity duration-500
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleClose}
    >
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        />
      ))}

      {/* Achievement Card */}
      <div
        className={`
          relative max-w-2xl w-full mx-4
          transform transition-all duration-700
          ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-3xl
          bg-gradient-to-r ${config.gradient}
          blur-3xl opacity-60 animate-pulse
          ${config.glow}
        `} />

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top banner */}
          <div className={`
            relative h-32 bg-gradient-to-r ${config.gradient}
            flex items-center justify-center overflow-hidden
          `}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-float"
                  style={{
                    width: `${20 + Math.random() * 40}px`,
                    height: `${20 + Math.random() * 40}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center">
              <div className="text-6xl mb-2 animate-bounceIn">🎉</div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider animate-slideInUp">
                Achievement Unlocked!
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`
              inline-block p-6 rounded-full mb-6
              bg-gradient-to-r ${config.gradient}
              shadow-2xl ${config.glow}
              animate-spin-slow
            `}>
              <div className="p-4 bg-white rounded-full">
                <Icon className={`w-16 h-16 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`} />
              </div>
            </div>

            {/* Title */}
            <h2 className={`
              text-4xl font-bold mb-4
              bg-gradient-to-r ${config.gradient}
              bg-clip-text text-transparent
              animate-slideInUp
            `}>
              {achievement.title || 'Amazing Achievement!'}
            </h2>

            {/* Description */}
            <p className="text-gray-700 text-lg mb-6 max-w-lg mx-auto animate-slideInUp" style={{ animationDelay: '0.1s' }}>
              {achievement.description || 'You did something incredible!'}
            </p>

            {/* Rarity badge */}
            <div className="inline-block mb-6 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
              <div className={`
                px-6 py-2 rounded-full
                bg-gradient-to-r ${config.gradient}
                text-white font-bold uppercase text-sm tracking-wider
                shadow-lg ${config.glow}
              `}>
                {rarity}
              </div>
            </div>

            {/* Rewards */}
            {achievement.rewards && (
              <div className="flex items-center justify-center gap-4 mb-6 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                {achievement.rewards.xp && (
                  <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                    +{achievement.rewards.xp} XP
                  </div>
                )}
                {achievement.rewards.coins && (
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold">
                    +{achievement.rewards.coins} Coins
                  </div>
                )}
              </div>
            )}

            {/* Share button */}
            <button
              className={`
                px-8 py-3 rounded-xl
                bg-gradient-to-r ${config.gradient}
                text-white font-bold
                shadow-xl ${config.glow}
                hover:scale-105 transition-transform duration-200
                animate-slideInUp
              `}
              style={{ animationDelay: '0.4s' }}
              onClick={(e) => {
                e.stopPropagation();
                // Share logic here
                alert('Share functionality coming soon!');
              }}
            >
              Share Achievement 🎊
            </button>
          </div>
        </div>

        {/* Floating particles around card */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-yellow-400 animate-float"
            style={{
              width: `${16 + Math.random() * 16}px`,
              height: `${16 + Math.random() * 16}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Example usage component
export function AchievementTrigger() {
  const [showAchievement, setShowAchievement] = React.useState(false);

  const sampleAchievements = [
    {
      title: 'First Steps',
      description: 'Your puppy took their first steps in the yard!',
      rarity: 'common',
      rewards: { xp: 50, coins: 10 },
    },
    {
      title: 'Best Friends',
      description: 'You\'ve built an incredible bond with your dog!',
      rarity: 'rare',
      rewards: { xp: 200, coins: 50 },
    },
    {
      title: 'Master Trainer',
      description: 'Completed all advanced training techniques!',
      rarity: 'epic',
      rewards: { xp: 500, coins: 150 },
    },
    {
      title: 'Hall of Fame',
      description: 'Your dog is now legendary in the community!',
      rarity: 'legendary',
      rewards: { xp: 1000, coins: 500 },
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowAchievement(sampleAchievements[0])}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg"
      >
        Test Achievement
      </button>

      {showAchievement && (
        <AchievementUnlocked
          achievement={showAchievement}
          onClose={() => setShowAchievement(false)}
        />
      )}
    </>
  );
}
