// src/features/dreams/DreamJournal.jsx
/**
 * Dream Journal Component
 * 
 * Generates whimsical dreams when dog sleeps based on recent activities.
 * Dreams appear as animated sequences with pastel colors.
 * Includes collectible dream cards, rare prophetic dreams, and anxiety-based nightmares.
 * 
 * Integration: Triggered in MainGame.jsx when dog is asleep
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDog, addJournalEntry } from '@/redux/dogSlice.js';

/**
 * Dream generator based on recent activities and dog state
 */
const generateDream = (dog, journal) => {
  const { mood, needs, lastAction, name } = dog;
  const recentEntries = journal?.slice(-10) || [];
  
  // Check for anxiety/neglect → nightmares
  if (mood === 'anxious' || needs?.happiness < 30 || needs?.hunger < 20) {
    return generateNightmare(dog, recentEntries);
  }
  
  // 5% chance for prophetic dream (rare)
  if (Math.random() < 0.05) {
    return generatePropheticDream(dog);
  }
  
  // Generate dream based on recent activities
  return generateActivityDream(dog, recentEntries, lastAction);
};

const generateNightmare = (dog, recentEntries) => {
  const nightmares = [
    {
      title: '😰 Lost in the Fog',
      description: `${dog.name} dreams of wandering through thick fog, unable to find their way home. Everything looks familiar but strange...`,
      color: 'from-gray-600 to-gray-800',
      icon: '🌫️',
      type: 'nightmare',
      message: `I couldn't find you anywhere... It was so scary! 😢`,
    },
    {
      title: '😱 The Empty Bowl',
      description: `${dog.name} dreams of an endless empty food bowl that never fills up, no matter how long they wait...`,
      color: 'from-zinc-700 to-zinc-900',
      icon: '🥣',
      type: 'nightmare',
      message: `My bowl was empty forever... I was so hungry! 🥺`,
    },
    {
      title: '💔 Alone Forever',
      description: `${dog.name} dreams of being in an empty house, calling out but hearing only echoes...`,
      color: 'from-slate-700 to-slate-900',
      icon: '🏠',
      type: 'nightmare',
      message: `Where did everyone go? I was all alone... 😢`,
    },
  ];
  
  return nightmares[Math.floor(Math.random() * nightmares.length)];
};

const generatePropheticDream = (dog) => {
  const prophecies = [
    {
      title: '🌟 The Golden Treat',
      description: `${dog.name} dreams of a shimmering golden treat that grants a wish. What could it mean?`,
      color: 'from-yellow-400 to-amber-600',
      icon: '✨',
      type: 'prophetic',
      message: `I saw something amazing coming... I can feel it! ✨`,
      prophecy: 'A special surprise is coming soon!',
    },
    {
      title: '🌈 Rainbow Path',
      description: `${dog.name} sees a rainbow path leading to new adventures and friends...`,
      color: 'from-pink-400 via-purple-400 to-blue-400',
      icon: '🌈',
      type: 'prophetic',
      message: `I dreamed of new friends and exciting places! 🌈`,
      prophecy: 'New experiences await!',
    },
    {
      title: '🌙 Moonlit Promise',
      description: `Under a full moon, ${dog.name} makes a wish that feels like it will come true...`,
      color: 'from-indigo-500 to-purple-700',
      icon: '🌙',
      type: 'prophetic',
      message: `The moon whispered secrets to me... 🌙✨`,
      prophecy: 'Your bond will grow stronger!',
    },
  ];
  
  return prophecies[Math.floor(Math.random() * prophecies.length)];
};

const generateActivityDream = (dog, recentEntries, lastAction) => {
  // Check recent journal entries for activities
  const hasPlayedFetch = recentEntries.some(e => e.summary?.includes('fetch') || e.summary?.includes('play'));
  const hasBeenToVet = recentEntries.some(e => e.summary?.includes('vet') || e.summary?.includes('checkup'));
  const hasWalked = recentEntries.some(e => e.summary?.includes('walk'));
  const hasTrained = recentEntries.some(e => e.summary?.includes('train') || e.summary?.includes('trick'));
  
  const dreams = [];
  
  if (hasPlayedFetch || lastAction === 'play') {
    dreams.push({
      title: '🎾 Endless Fetch Field',
      description: `${dog.name} dreams of a magical field where balls multiply endlessly! Every throw brings more balls!`,
      color: 'from-green-300 to-emerald-500',
      icon: '🎾',
      type: 'happy',
      message: `The balls just kept coming! It was the best dream ever! 🎾✨`,
    });
  }
  
  if (hasBeenToVet) {
    dreams.push({
      title: '🏥 The Kind Vet',
      description: `${dog.name} dreams of the vet giving endless treats and belly rubs. Maybe vets aren't so scary after all!`,
      color: 'from-blue-300 to-cyan-500',
      icon: '💊',
      type: 'comforting',
      message: `The vet was so nice in my dream! They gave me treats! 🦴`,
    });
  }
  
  if (hasWalked) {
    dreams.push({
      title: '🚶 Adventure Trail',
      description: `${dog.name} dreams of discovering a secret trail with amazing smells and friendly squirrels!`,
      color: 'from-amber-300 to-orange-500',
      icon: '🌳',
      type: 'adventure',
      message: `I found the most amazing smells! And the squirrels were friendly! 🐿️`,
    });
  }
  
  if (hasTrained) {
    dreams.push({
      title: '🎪 Trick Champion',
      description: `${dog.name} dreams of performing tricks on a grand stage with everyone cheering!`,
      color: 'from-purple-300 to-pink-500',
      icon: '🏆',
      type: 'proud',
      message: `Everyone was clapping for me! I'm such a good dog! 🏆✨`,
    });
  }
  
  // Default peaceful dreams if no specific activities
  if (dreams.length === 0) {
    dreams.push(
      {
        title: '☀️ Sunny Nap Spot',
        description: `${dog.name} dreams of the perfect sunny spot, warm and cozy, with gentle breezes...`,
        color: 'from-yellow-200 to-orange-300',
        icon: '☀️',
        type: 'peaceful',
        message: `It was so warm and cozy... Perfect nap! ☀️😴`,
      },
      {
        title: '🦴 Treat Mountain',
        description: `${dog.name} dreams of climbing a mountain made entirely of delicious treats!`,
        color: 'from-orange-200 to-red-400',
        icon: '🦴',
        type: 'happy',
        message: `So many treats! I could eat forever! 🦴🦴🦴`,
      },
      {
        title: '🌸 Flower Garden',
        description: `${dog.name} dreams of running through fields of flowers, with butterflies dancing all around...`,
        color: 'from-pink-200 to-rose-400',
        icon: '🌸',
        type: 'peaceful',
        message: `The flowers smelled amazing! And butterflies everywhere! 🦋`,
      }
    );
  }
  
  return dreams[Math.floor(Math.random() * dreams.length)];
};

/**
 * Main Dream Journal Component
 */
export default function DreamJournal({ isAsleep, onClose }) {
  const [dream, setDream] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDream, setShowDream] = useState(false);
  const dog = useSelector(selectDog);
  const dispatch = useDispatch();
  
  // Get journal from dog state
  const journal = dog?.journal || [];
  
  // Generate dream when dog falls asleep
  useEffect(() => {
    if (isAsleep && !dream) {
      // Small delay before showing dream
      const dreamDelay = setTimeout(() => {
        const newDream = generateDream(dog, journal);
        setDream(newDream);
        setIsAnimating(true);
        setShowDream(true);
        
        // Auto-save dream to journal (70% chance)
        if (Math.random() < 0.7) {
          setTimeout(() => {
            dispatch(addJournalEntry({
              timestamp: Date.now(),
              type: 'dream',
              summary: `${dog.name} had a dream: ${newDream.title}`,
              body: newDream.description,
              moodTag: newDream.type,
              dreamData: newDream,
            }));
          }, 2000);
        }
      }, 3000); // Wait 3 seconds after falling asleep
      
      return () => clearTimeout(dreamDelay);
    }
    
    // Clear dream when waking up
    if (!isAsleep && dream) {
      setIsAnimating(false);
      setTimeout(() => {
        setShowDream(false);
        setDream(null);
      }, 500);
    }
  }, [isAsleep, dream, dog, journal, dispatch]);
  
  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowDream(false);
      setDream(null);
      onClose?.();
    }, 300);
  }, [onClose]);
  
  if (!showDream || !dream) return null;
  
  return (
    <div 
      className={`
        fixed inset-0 z-40 flex items-center justify-center
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-500
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleDismiss}
    >
      <div 
        className={`
          relative max-w-md w-full mx-4 p-6 rounded-2xl
          bg-gradient-to-br ${dream.color}
          shadow-2xl border-2 border-white/20
          transform transition-all duration-700
          ${isAnimating ? 'scale-100 rotate-0' : 'scale-75 rotate-3'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dream Type Badge */}
        <div className="absolute -top-3 -right-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-2xl">{dream.icon}</span>
        </div>
        
        {/* Prophetic indicator */}
        {dream.type === 'prophetic' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            ✨ RARE DREAM ✨
          </div>
        )}
        
        {/* Nightmare indicator */}
        {dream.type === 'nightmare' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            😰 Nightmare
          </div>
        )}
        
        {/* Content */}
        <div className="space-y-4 text-white">
          <h2 className="text-2xl font-bold text-center drop-shadow-lg">
            {dream.title}
          </h2>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <p className="text-sm leading-relaxed">
              {dream.description}
            </p>
          </div>
          
          {/* Dog's message */}
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border-2 border-white/40">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💭</span>
              <p className="text-sm italic flex-1">
                "{dream.message}"
              </p>
            </div>
          </div>
          
          {/* Prophecy (if applicable) */}
          {dream.prophecy && (
            <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/40">
              <p className="text-xs font-semibold text-center text-yellow-100">
                🔮 {dream.prophecy}
              </p>
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="
              w-full mt-4 py-3 px-4 rounded-lg
              bg-white/30 hover:bg-white/40
              border-2 border-white/50
              text-white font-semibold
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
            "
          >
            Sweet Dreams 💤
          </button>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
