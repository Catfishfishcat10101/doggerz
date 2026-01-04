// src/components/features/DailySurprise.jsx
// Daily surprise mechanic for player engagement

import * as React from 'react';
import { useToast } from '@/components/ToastProvider.jsx';

/**
 * DailySurprise - Shows a daily surprise gift/event to keep players engaged
 * 
 * @param {Object} props
 * @param {string} props.dogName - The dog's name
 * @param {Function} props.onClaim - Callback when surprise is claimed
 */
export default function DailySurprise({ dogName = 'Pup', onClaim }) {
  const [showSurprise, setShowSurprise] = React.useState(false);
  const [surprise, setSurprise] = React.useState(null);
  const [claimed, setClaimed] = React.useState(false);
  const toast = useToast();

  // Check if daily surprise is available
  React.useEffect(() => {
    const lastClaimed = localStorage.getItem('doggerz:dailySurpriseClaimed');
    const today = new Date().toDateString();

    if (lastClaimed !== today) {
      // Generate random surprise
      const surprises = [
        {
          id: 'bonus_xp',
          emoji: '✨',
          title: 'Bonus Experience!',
          description: `${dogName} found a mysterious glowing bone that boosted their learning!`,
          reward: '+50 XP',
          color: 'from-purple-500/20 to-pink-500/20',
          borderColor: 'border-purple-400/40',
        },
        {
          id: 'extra_coins',
          emoji: '💰',
          title: 'Lucky Coins!',
          description: `${dogName} dug up a hidden treasure in the backyard!`,
          reward: '+100 Coins',
          color: 'from-amber-500/20 to-orange-500/20',
          borderColor: 'border-amber-400/40',
        },
        {
          id: 'surprise_treat',
          emoji: '🦴',
          title: 'Special Treat!',
          description: 'A neighbor left a delicious surprise at the gate!',
          reward: 'Premium Treat',
          color: 'from-emerald-500/20 to-teal-500/20',
          borderColor: 'border-emerald-400/40',
        },
        {
          id: 'mood_boost',
          emoji: '🌟',
          title: 'Perfect Day!',
          description: `${dogName} woke up in an amazing mood today!`,
          reward: 'Happiness Boost',
          color: 'from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-400/40',
        },
        {
          id: 'energy_surge',
          emoji: '⚡',
          title: 'Energy Surge!',
          description: `${dogName} feels extra energetic today!`,
          reward: 'Full Energy',
          color: 'from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-400/40',
        },
      ];

      const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
      setSurprise(randomSurprise);
      setShowSurprise(true);
    }
  }, [dogName]);

  const handleClaim = React.useCallback(() => {
    if (!surprise || claimed) return;

    // Mark as claimed
    const today = new Date().toDateString();
    localStorage.setItem('doggerz:dailySurpriseClaimed', today);
    
    setClaimed(true);
    
    toast.success(`Claimed: ${surprise.reward}!`, 2000);

    setTimeout(() => {
      setShowSurprise(false);
      onClaim?.(surprise);
    }, 1500);
  }, [surprise, claimed, toast, onClaim]);

  if (!showSurprise || !surprise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`
        relative max-w-md w-full rounded-3xl border-2 ${surprise.borderColor}
        bg-gradient-to-br ${surprise.color}
        p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        animate-scaleIn
      `}>
        {/* Sparkle effects */}
        <div className="absolute -top-4 -right-4 text-4xl animate-pulse" style={{ animationDuration: '2s' }}>
          ✨
        </div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          ✨
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          {/* Emoji icon */}
          <div className="text-7xl animate-gentleBounce mx-auto">
            {surprise.emoji}
          </div>

          {/* Title */}
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60 mb-1">
              Daily Surprise
            </div>
            <h2 className="text-2xl font-bold text-white">
              {surprise.title}
            </h2>
          </div>

          {/* Description */}
          <p className="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
            {surprise.description}
          </p>

          {/* Reward badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
            <span className="text-lg">{surprise.emoji}</span>
            <span className="text-sm font-bold text-white">{surprise.reward}</span>
          </div>

          {/* Claim button */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimed}
            className={`
              w-full mt-6 rounded-2xl border-2 border-white/40 
              bg-gradient-to-r from-white/20 to-white/10
              px-6 py-3 text-base font-bold text-white
              hover:from-white/30 hover:to-white/20
              transition-all duration-300
              shadow-[0_6px_20px_rgba(255,255,255,0.1)]
              hover:shadow-[0_8px_28px_rgba(255,255,255,0.2)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${claimed ? 'animate-pulse' : ''}
            `}
          >
            {claimed ? '✓ Claimed!' : '🎁 Claim Surprise'}
          </button>

          {/* Footer note */}
          <p className="text-xs text-white/50 pt-4">
            Come back tomorrow for another surprise!
          </p>
        </div>
      </div>
    </div>
  );
}
