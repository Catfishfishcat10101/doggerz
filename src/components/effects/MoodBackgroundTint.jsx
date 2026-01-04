// src/components/effects/MoodBackgroundTint.jsx
// Subtle background color shift based on dog's mood

import * as React from 'react';

/**
 * MoodBackgroundTint - Applies a subtle color overlay based on mood
 * 
 * @param {Object} props
 * @param {string} props.mood - Current mood ('happy', 'sad', 'anxious', 'content', 'playful', etc.)
 * @param {number} props.intensity - Tint intensity 0-1 (default: 0.15)
 */
export default function MoodBackgroundTint({ mood = 'content', intensity = 0.15 }) {
  const tintColor = React.useMemo(() => {
    const moodLower = String(mood || '').toLowerCase();
    
    if (moodLower.includes('happy') || moodLower.includes('joy')) {
      return 'rgba(251, 191, 36, INTENSITY)'; // warm amber
    }
    if (moodLower.includes('playful') || moodLower.includes('excit')) {
      return 'rgba(249, 115, 22, INTENSITY)'; // vibrant orange
    }
    if (moodLower.includes('sad') || moodLower.includes('lonely')) {
      return 'rgba(59, 130, 246, INTENSITY)'; // cool blue
    }
    if (moodLower.includes('anxious') || moodLower.includes('nervous') || moodLower.includes('worried')) {
      return 'rgba(139, 92, 246, INTENSITY)'; // purple
    }
    if (moodLower.includes('calm') || moodLower.includes('peaceful')) {
      return 'rgba(16, 185, 129, INTENSITY)'; // soft emerald
    }
    if (moodLower.includes('tired') || moodLower.includes('sleepy')) {
      return 'rgba(99, 102, 241, INTENSITY)'; // deep indigo
    }
    
    // Content/neutral: very subtle warm tone
    return 'rgba(245, 158, 11, INTENSITY)';
  }, [mood]);

  const finalColor = tintColor.replace('INTENSITY', String(Math.max(0, Math.min(1, intensity))));

  return (
    <div 
      className="absolute inset-0 pointer-events-none transition-colors duration-[3s] ease-in-out"
      style={{
        backgroundColor: finalColor,
      }}
      aria-hidden="true"
    />
  );
}
