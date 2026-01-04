// src/components/narrative/GoodbyeLetter.jsx
// Emotional goodbye letter for runaway/neglect scenarios (narrative UX layer only)

import * as React from 'react';

/**
 * GoodbyeLetter - Displays a heartfelt goodbye letter from the dog
 * Used in runaway scenarios (narrative layer, no logic changes)
 * 
 * @param {Object} props
 * @param {string} props.dogName - The dog's name
 * @param {string} props.reason - Reason for leaving (e.g., "lonely", "neglected", "scared")
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onRedemption - Optional redemption callback (if dog can return)
 */
export default function GoodbyeLetter({ dogName = 'Pup', reason = 'lonely', onClose, onRedemption }) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const letterContent = React.useMemo(() => {
    const reasonLower = String(reason).toLowerCase();
    
    if (reasonLower.includes('lonely') || reasonLower.includes('neglect')) {
      return {
        opening: 'Dear Hooman,',
        body: `I waited and waited for you to come back. I watched the door every day, hoping to see you walk through it. I tried to be a good pup—I really did.\n\nBut the days felt so long without you. My food bowl got empty, and I started to feel... forgotten. I don't think you meant to hurt me, but I was so sad and scared.\n\nI found an open gate today, and my paws just... carried me away. Maybe I'll find someone who has more time for me. Or maybe I'll just keep wandering until I figure out what to do.\n\nI'll always remember the good times we had. The belly rubs, the treats, the games we played. I hope you're okay.\n\nI'm sorry I couldn't stay.`,
        closing: 'With a heavy heart,',
        hasRedemption: true,
      };
    }

    if (reasonLower.includes('scared') || reasonLower.includes('anxious')) {
      return {
        opening: 'Dear Hooman,',
        body: `I tried to be brave, I really did. But the loud noises and the chaos scared me so much. My heart was beating so fast, and I couldn't stop shaking.\n\nI know you were probably busy, but I needed you. I needed to feel safe, and I didn't know how to tell you.\n\nWhen the door opened, I just ran. I didn't mean to leave you, but my legs moved before I could think. Now I'm out here, and I don't know where to go.\n\nI hope one day I can be brave enough to come back. Or maybe I'll find a quiet place where I can feel safe again.`,
        closing: 'Missing you,',
        hasRedemption: true,
      };
    }

    // Default generic goodbye
    return {
      opening: 'Dear Hooman,',
      body: `I need to tell you something that's been on my mind.\n\nI've been feeling lost lately, and I think I need to go on a journey to figure things out. It's not your fault—you've been wonderful. But something in my heart is calling me to explore.\n\nI hope you understand. I might come back one day when I've found what I'm looking for. Or maybe I'll send you signs that I'm okay.\n\nThank you for all the love you gave me.`,
      closing: 'Always in your heart,',
      hasRedemption: false,
    };
  }, [reason]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handleRedemption = () => {
    setIsVisible(false);
    setTimeout(() => onRedemption?.(), 300);
  };

  return (
    <div 
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-500
        ${isVisible ? 'opacity-100 backdrop-blur-sm bg-black/60' : 'opacity-0 backdrop-blur-none bg-black/0'}
      `}
      onClick={handleClose}
    >
      <div 
        className={`
          relative max-w-2xl w-full rounded-3xl border border-amber-900/40
          bg-gradient-to-br from-amber-100/95 via-orange-50/95 to-amber-100/95
          shadow-[0_20px_60px_rgba(0,0,0,0.4)]
          transition-all duration-500 transform
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Torn paper edge effect at top */}
        <div 
          className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-amber-200/30 to-transparent"
          style={{
            clipPath: 'polygon(0 0, 2% 50%, 4% 0, 6% 40%, 8% 0, 10% 60%, 12% 0, 14% 30%, 16% 0, 18% 50%, 20% 0, 22% 40%, 24% 0, 26% 60%, 28% 0, 30% 30%, 32% 0, 34% 50%, 36% 0, 38% 40%, 40% 0, 42% 60%, 44% 0, 46% 30%, 48% 0, 50% 50%, 52% 0, 54% 40%, 56% 0, 58% 60%, 60% 0, 62% 30%, 64% 0, 66% 50%, 68% 0, 70% 40%, 72% 0, 74% 60%, 76% 0, 78% 30%, 80% 0, 82% 50%, 84% 0, 86% 40%, 88% 0, 90% 60%, 92% 0, 94% 30%, 96% 0, 98% 50%, 100% 0, 100% 100%, 0 100%)',
          }}
        />

        {/* Paper texture */}
        <div 
          className="absolute inset-0 opacity-[0.15] rounded-3xl pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-8 md:p-12">
          {/* Paw print watermark */}
          <div className="absolute top-12 right-12 text-9xl opacity-[0.04] select-none pointer-events-none">
            🐾
          </div>

          {/* Letter content */}
          <div className="relative space-y-6">
            {/* Opening salutation */}
            <div className="font-serif text-2xl text-amber-950 italic">
              {letterContent.opening}
            </div>

            {/* Body */}
            <div className="font-serif text-base text-amber-900/90 leading-relaxed whitespace-pre-line">
              {letterContent.body}
            </div>

            {/* Closing */}
            <div className="pt-4 text-right space-y-1">
              <div className="font-serif text-sm italic text-amber-800/80">
                {letterContent.closing}
              </div>
              <div className="font-serif text-xl font-semibold text-amber-950">
                {dogName} 🐾
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-amber-900/20 flex flex-col sm:flex-row gap-3">
            {letterContent.hasRedemption && onRedemption && (
              <button
                type="button"
                onClick={handleRedemption}
                className="flex-1 rounded-2xl border-2 border-emerald-600/40 bg-emerald-500/20 px-6 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-500/30 transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)]"
              >
                💚 Try to Bring Them Back
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-2xl border-2 border-amber-900/30 bg-amber-800/10 px-6 py-3 text-sm font-bold text-amber-900 hover:bg-amber-800/20 transition-all duration-300"
            >
              {letterContent.hasRedemption ? 'Let Them Go' : 'Say Goodbye'}
            </button>
          </div>

          {/* Stain/tear mark decoration */}
          <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-amber-900/5 blur-md" />
        </div>
      </div>
    </div>
  );
}
