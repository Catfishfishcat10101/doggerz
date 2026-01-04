// src/components/ui/MoodRingIndicator.jsx
/**
 * Mood Ring Indicator - Floating animated mood display
 * Whimsical, color-changing ring that shows dog's emotional state
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MoodRingIndicator({ mood = 'content', size = 'md', showLabel = true }) {
  const moodConfig = {
    happy: {
      color: 'from-yellow-400 via-orange-400 to-pink-400',
      glow: 'shadow-yellow-400/50',
      emoji: '😊',
      label: 'Happy',
      pulse: 'animate-pulse',
    },
    playful: {
      color: 'from-green-400 via-blue-400 to-purple-400',
      glow: 'shadow-green-400/50',
      emoji: '🎾',
      label: 'Playful',
      pulse: 'animate-bounce',
    },
    sad: {
      color: 'from-blue-400 via-indigo-400 to-gray-400',
      glow: 'shadow-blue-400/50',
      emoji: '😢',
      label: 'Sad',
      pulse: '',
    },
    anxious: {
      color: 'from-red-400 via-orange-400 to-yellow-400',
      glow: 'shadow-red-400/50',
      emoji: '😰',
      label: 'Anxious',
      pulse: 'animate-wiggle',
    },
    calm: {
      color: 'from-blue-300 via-cyan-300 to-teal-300',
      glow: 'shadow-blue-300/50',
      emoji: '😌',
      label: 'Calm',
      pulse: '',
    },
    tired: {
      color: 'from-purple-400 via-indigo-400 to-blue-400',
      glow: 'shadow-purple-400/50',
      emoji: '😴',
      label: 'Tired',
      pulse: '',
    },
    angry: {
      color: 'from-red-500 via-orange-500 to-yellow-500',
      glow: 'shadow-red-500/50',
      emoji: '😠',
      label: 'Angry',
      pulse: 'animate-shake',
    },
    content: {
      color: 'from-emerald-400 via-teal-400 to-cyan-400',
      glow: 'shadow-emerald-400/50',
      emoji: '🙂',
      label: 'Content',
      pulse: '',
    },
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const config = moodConfig[mood] || moodConfig.content;

  return (
    <div className="relative inline-block">
      {/* Outer glow ring */}
      <div className={`
        absolute inset-0 rounded-full
        bg-gradient-to-r ${config.color}
        blur-xl opacity-60 animate-pulse
        ${config.glow}
      `} />

      {/* Main ring */}
      <div className={`
        relative ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-r ${config.color}
        shadow-2xl ${config.glow}
        ${config.pulse}
        flex items-center justify-center
        transition-all duration-500 ease-out
        hover:scale-110
        cursor-pointer
      `}>
        {/* Inner circle */}
        <div className="absolute inset-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
          <span className="text-4xl animate-heartbeat">{config.emoji}</span>
        </div>

        {/* Sparkle effects */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-white animate-spin-slow opacity-80" />
        <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-white animate-spin-slow opacity-60" style={{ animationDelay: '1s' }} />

        {/* Rotating border accent */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin-slow" />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className={`
            px-3 py-1 rounded-full
            bg-gradient-to-r ${config.color}
            text-white text-sm font-semibold
            shadow-lg
            animate-slideInUp
          `}>
            {config.label}
          </div>
        </div>
      )}
    </div>
  );
}
