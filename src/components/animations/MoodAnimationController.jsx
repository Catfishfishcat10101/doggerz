// src/components/animations/MoodAnimationController.jsx
// Enhanced mood-based animation system with rich variants

import * as React from 'react';

/**
 * MoodAnimationController - Applies CSS classes based on detailed mood states
 * Enhances dog sprite animations with mood-specific behaviors
 * 
 * @param {Object} props
 * @param {string} props.mood - Current mood ('happy', 'sad', 'anxious', 'playful', etc.)
 * @param {string} props.intent - Current action intent ('idle', 'walk', 'play', etc.)
 * @param {boolean} props.isAsleep - Whether dog is sleeping
 * @param {React.ReactNode} props.children - Dog sprite component to wrap
 */
export default function MoodAnimationController({ mood = 'content', intent = 'idle', isAsleep = false, children }) {
  const [animationClass, setAnimationClass] = React.useState('');
  const [microAction, setMicroAction] = React.useState(null);

  // Map mood to animation variations
  const moodAnimations = React.useMemo(() => {
    const moodLower = String(mood || 'content').toLowerCase();

    // Happy moods - energetic, bouncy, tail wagging
    if (moodLower.includes('happy') || moodLower.includes('joy') || moodLower.includes('ecstatic')) {
      return {
        idle: 'dog-happy-idle',
        walk: 'dog-happy-walk',
        tail: 'dog-tail-wag',
        ears: 'dog-ears-perk',
        microActions: ['bounce', 'tail-wag-fast', 'play-bow'],
      };
    }

    // Playful mood - maximum energy, frequent movements
    if (moodLower.includes('playful') || moodLower.includes('excited') || moodLower.includes('energetic')) {
      return {
        idle: 'dog-playful-idle',
        walk: 'dog-playful-bounce',
        tail: 'dog-tail-wag-fast',
        ears: 'dog-ears-alert',
        microActions: ['zoom', 'spin', 'play-bow', 'pounce'],
      };
    }

    // Sad moods - slow movements, droopy
    if (moodLower.includes('sad') || moodLower.includes('lonely') || moodLower.includes('depressed')) {
      return {
        idle: 'dog-sad-idle',
        walk: 'dog-sad-walk',
        tail: 'dog-tail-droop',
        ears: 'dog-ears-down',
        microActions: ['sigh', 'whimper', 'droopy'],
      };
    }

    // Anxious/nervous moods - twitchy, alert
    if (moodLower.includes('anxious') || moodLower.includes('nervous') || moodLower.includes('worried') || moodLower.includes('scared')) {
      return {
        idle: 'dog-anxious-idle',
        walk: 'dog-anxious-walk',
        tail: 'dog-tail-tuck',
        ears: 'dog-ears-back',
        microActions: ['tremble', 'look-around', 'cower'],
      };
    }

    // Calm/peaceful moods - gentle, serene
    if (moodLower.includes('calm') || moodLower.includes('peaceful') || moodLower.includes('relaxed')) {
      return {
        idle: 'dog-calm-idle',
        walk: 'dog-calm-walk',
        tail: 'dog-tail-soft',
        ears: 'dog-ears-neutral',
        microActions: ['gentle-breath', 'yawn', 'stretch'],
      };
    }

    // Tired/sleepy moods - slow, lazy
    if (moodLower.includes('tired') || moodLower.includes('sleepy') || moodLower.includes('exhausted')) {
      return {
        idle: 'dog-tired-idle',
        walk: 'dog-tired-walk',
        tail: 'dog-tail-still',
        ears: 'dog-ears-relaxed',
        microActions: ['yawn', 'stretch', 'nod-off'],
      };
    }

    // Angry/aggressive moods - tense, stiff
    if (moodLower.includes('angry') || moodLower.includes('aggressive') || moodLower.includes('irritated')) {
      return {
        idle: 'dog-angry-idle',
        walk: 'dog-angry-walk',
        tail: 'dog-tail-stiff',
        ears: 'dog-ears-forward',
        microActions: ['growl', 'teeth-show', 'stiff'],
      };
    }

    // Content/neutral - default balanced state
    return {
      idle: 'dog-breathe',
      walk: 'dog-walk-bob',
      tail: 'dog-tail-soft',
      ears: 'dog-ears-neutral',
      microActions: ['blink', 'ear-twitch', 'sniff'],
    };
  }, [mood]);

  // Apply base animation based on intent and mood
  React.useEffect(() => {
    let baseClass = '';

    if (isAsleep) {
      baseClass = 'dog-sleeping';
    } else {
      switch (intent) {
        case 'walk':
        case 'play':
          baseClass = moodAnimations.walk;
          break;
        case 'idle':
        default:
          baseClass = moodAnimations.idle;
          break;
      }
    }

    setAnimationClass(baseClass);
  }, [intent, isAsleep, moodAnimations]);

  // Trigger random micro-actions periodically
  React.useEffect(() => {
    if (isAsleep || !moodAnimations.microActions.length) return;

    const triggerMicroAction = () => {
      const actions = moodAnimations.microActions;
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setMicroAction(randomAction);

      setTimeout(() => setMicroAction(null), 1500);
    };

    // Trigger micro-actions every 5-10 seconds
    const minDelay = 5000;
    const maxDelay = 10000;
    const scheduleNext = () => {
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      return setTimeout(triggerMicroAction, delay);
    };

    const timer = scheduleNext();

    return () => clearTimeout(timer);
  }, [isAsleep, moodAnimations.microActions]);

  // Combine classes
  const combinedClasses = React.useMemo(() => {
    const classes = [animationClass];
    
    if (moodAnimations.tail) classes.push(moodAnimations.tail);
    if (moodAnimations.ears) classes.push(moodAnimations.ears);
    if (microAction) classes.push(`dog-micro-${microAction}`);

    return classes.filter(Boolean).join(' ');
  }, [animationClass, moodAnimations.tail, moodAnimations.ears, microAction]);

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}
