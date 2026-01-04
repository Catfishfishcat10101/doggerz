// src/features/companion/DogCompanion.jsx
/**
 * Dog Companion Component
 * Combines chat interface (when awake) and dream journal (when asleep)
 * into a single, streamlined component.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDog, addJournalEntry } from '@/redux/dogSlice.js';

/**
 * Shared utility: Pick random item from array
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate dog response based on current state (for chat)
 */
function generateDogResponse(dog) {
  const needs = dog?.needs || {};
  const hunger = needs.hunger || 100;
  const happiness = needs.happiness || 100;
  const energy = needs.energy || 100;
  const cleanliness = needs.cleanliness || 100;
  
  const mood = dog?.mood || 'content';
  
  // URGENT: Critical needs (< 20)
  if (hunger < 20) {
    return pickRandom([
      "My tummy is SO empty... I'm starving! 🦴🥺",
      "Please feed me! I haven't eaten in forever! 😢",
      "Woof woof! HUNGRY! Food please! 🍖",
    ]);
  }
  
  if (energy < 15) {
    return pickRandom([
      "I'm so sleepy... *yawn* Can I rest now? 😴",
      "Zzz... I need a nap... my paws are tired... 💤",
    ]);
  }
  
  if (cleanliness < 15) {
    return pickRandom([
      "I'm so dirty and itchy! Bath time? 🛁",
      "I smell bad... can you help me get clean? 🚿",
    ]);
  }
  
  // MEDIUM: Moderate needs (20-50)
  if (hunger < 50) {
    return pickRandom([
      "I'm getting hungry... treats soon? 🦴",
      "My tummy is empty... snack time? 🥩",
    ]);
  }
  
  if (happiness < 30) {
    return pickRandom([
      "I'm feeling sad... can we play? 🥺",
      "I miss playing with you... let's have fun! 🎾",
    ]);
  }
  
  // MOOD-BASED RESPONSES
  switch (mood) {
    case 'happy':
    case 'joyful':
      return pickRandom([
        "Woof woof! I LOVE YOU! This is the best day ever! 🎉",
        "YAY! You're here! Let's play! Let's play! 🎾",
        "Life is amazing when you're around! 💖",
      ]);
      
    case 'playful':
      return pickRandom([
        "Let's play fetch! I'll bring it back this time! Maybe! 🎾",
        "Bet you can't catch me! *zooms around* 🏃💨",
        "Want to play tug-of-war? I'm REALLY strong! 💪",
      ]);
      
    case 'sad':
    case 'lonely':
      return pickRandom([
        "I miss you when you're gone... 🥺",
        "Are you mad at me? I'll be good, I promise! 😢",
        "Can you stay a little longer this time? 🐾",
      ]);
      
    case 'anxious':
    case 'scared':
      return pickRandom([
        "What was that noise?! Did you hear it too? 😰",
        "I'm a little scared... can you stay close? 🥺",
      ]);
      
    case 'calm':
    case 'content':
      return pickRandom([
        "This is nice... just being here with you. 😌",
        "Life is good! I love our routine. 🏡",
        "You're the best human ever! 💙",
      ]);
      
    case 'tired':
      return pickRandom([
        "*yawn* Maybe nap time soon? 😴",
        "I'm getting sleepy... *rests head* 💤",
      ]);
      
    case 'angry':
    case 'grumpy':
      return pickRandom([
        "Hmph! I'm a little grumpy right now... 😤",
        "That squirrel was mocking me! Did you see?! 🐿️😠",
      ]);
      
    default:
      return pickRandom([
        "Woof! How are you today? 🐶",
        "What are we doing next? I'm ready! ✨",
        "I love spending time with you! 💖",
      ]);
  }
}

/**
 * Generate dream based on recent activities and dog state
 */
function generateDream(dog, journal) {
  const { mood, needs, lastAction, name } = dog;
  const recentEntries = journal?.slice(-10) || [];
  
  // Nightmares for anxiety/neglect
  if (mood === 'anxious' || needs?.happiness < 30 || needs?.hunger < 20) {
    const nightmares = [
      {
        title: '😰 Lost in the Fog',
        description: `${name} dreams of wandering through thick fog, unable to find their way home...`,
        color: 'from-gray-600 to-gray-800',
        icon: '🌫️',
        type: 'nightmare',
        message: `I couldn't find you anywhere... It was so scary! 😢`,
      },
      {
        title: '😱 The Empty Bowl',
        description: `${name} dreams of an endless empty food bowl that never fills up...`,
        color: 'from-zinc-700 to-zinc-900',
        icon: '🥣',
        type: 'nightmare',
        message: `My bowl was empty forever... I was so hungry! 🥺`,
      },
    ];
    return pickRandom(nightmares);
  }
  
  // 5% chance for prophetic dream
  if (Math.random() < 0.05) {
    const prophecies = [
      {
        title: '🌟 The Golden Treat',
        description: `${name} dreams of a shimmering golden treat that grants a wish...`,
        color: 'from-yellow-400 to-amber-600',
        icon: '✨',
        type: 'prophetic',
        message: `I saw something amazing coming... I can feel it! ✨`,
        prophecy: 'A special surprise is coming soon!',
      },
      {
        title: '🌈 Rainbow Path',
        description: `${name} sees a rainbow path leading to new adventures...`,
        color: 'from-pink-400 via-purple-400 to-blue-400',
        icon: '🌈',
        type: 'prophetic',
        message: `I dreamed of new friends and exciting places! 🌈`,
        prophecy: 'New experiences await!',
      },
    ];
    return pickRandom(prophecies);
  }
  
  // Activity-based dreams
  const hasPlayedFetch = recentEntries.some(e => e.summary?.includes('fetch') || e.summary?.includes('play'));
  const hasWalked = recentEntries.some(e => e.summary?.includes('walk'));
  const hasTrained = recentEntries.some(e => e.summary?.includes('train') || e.summary?.includes('trick'));
  
  const dreams = [];
  
  if (hasPlayedFetch || lastAction === 'play') {
    dreams.push({
      title: '🎾 Endless Fetch Field',
      description: `${name} dreams of a magical field where balls multiply endlessly!`,
      color: 'from-green-300 to-emerald-500',
      icon: '🎾',
      type: 'happy',
      message: `The balls just kept coming! It was the best dream ever! 🎾✨`,
    });
  }
  
  if (hasWalked) {
    dreams.push({
      title: '🚶 Adventure Trail',
      description: `${name} dreams of discovering a secret trail with amazing smells!`,
      color: 'from-amber-300 to-orange-500',
      icon: '🌳',
      type: 'adventure',
      message: `I found the most amazing smells! And the squirrels were friendly! 🐿️`,
    });
  }
  
  if (hasTrained) {
    dreams.push({
      title: '🎪 Trick Champion',
      description: `${name} dreams of performing tricks on a grand stage with everyone cheering!`,
      color: 'from-purple-300 to-pink-500',
      icon: '🏆',
      type: 'proud',
      message: `Everyone was clapping for me! I'm such a good dog! 🏆✨`,
    });
  }
  
  // Default peaceful dreams
  if (dreams.length === 0) {
    dreams.push(
      {
        title: '☀️ Sunny Nap Spot',
        description: `${name} dreams of the perfect sunny spot, warm and cozy...`,
        color: 'from-yellow-200 to-orange-300',
        icon: '☀️',
        type: 'peaceful',
        message: `It was so warm and cozy... Perfect nap! ☀️😴`,
      },
      {
        title: '🦴 Treat Mountain',
        description: `${name} dreams of climbing a mountain made entirely of treats!`,
        color: 'from-orange-200 to-red-400',
        icon: '🦴',
        type: 'happy',
        message: `So many treats! I could eat forever! 🦴🦴🦴`,
      }
    );
  }
  
  return pickRandom(dreams);
}

/**
 * Main Dog Companion Component
 * Shows chat when awake, dreams when asleep
 */
export default function DogCompanion({ isAsleep }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dream, setDream] = useState(null);
  const [showDream, setShowDream] = useState(false);
  const messagesEndRef = useRef(null);
  
  const dogName = dog?.name || 'Pup';
  const journal = dog?.journal || [];
  
  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, scrollToBottom]);
  
  // Initial chat greeting
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const greeting = pickRandom([
        `Woof! Hi! I'm ${dogName}! 🐕`,
        `Hey there! It's me, ${dogName}! 👋`,
        `Bark bark! ${dogName} here! 🎉`,
      ]);
      
      setMessages([{
        sender: 'dog',
        text: greeting,
        timestamp: Date.now(),
      }]);
    }
  }, [isChatOpen, dogName, messages.length]);
  
  // Dream generation when asleep
  useEffect(() => {
    if (isAsleep && !dream) {
      const dreamDelay = setTimeout(() => {
        const newDream = generateDream(dog, journal);
        setDream(newDream);
        setShowDream(true);
        
        // Save dream to journal (70% chance)
        if (Math.random() < 0.7) {
          setTimeout(() => {
            dispatch(addJournalEntry({
              timestamp: Date.now(),
              type: 'dream',
              summary: `${dogName} had a dream: ${newDream.title}`,
              body: newDream.description,
              moodTag: newDream.type,
              dreamData: newDream,
            }));
          }, 2000);
        }
      }, 3000);
      
      return () => clearTimeout(dreamDelay);
    }
    
    // Clear dream when waking up
    if (!isAsleep && dream) {
      setTimeout(() => {
        setShowDream(false);
        setDream(null);
      }, 500);
    }
  }, [isAsleep, dream, dog, journal, dogName, dispatch]);
  
  // Handle sending chat message
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      sender: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Dog response with delay
    setTimeout(() => {
      const dogResponse = generateDogResponse(dog);
      setMessages(prev => [...prev, {
        sender: 'dog',
        text: dogResponse,
        timestamp: Date.now(),
      }]);
      
      // Save to journal (30% chance)
      if (Math.random() < 0.3) {
        dispatch(addJournalEntry({
          timestamp: Date.now(),
          type: 'conversation',
          summary: `Had a chat with ${dogName}`,
          body: `User: "${inputValue}"\n${dogName}: "${dogResponse}"`,
          moodTag: dog?.mood || 'content',
        }));
      }
    }, 800 + Math.random() * 1200);
  }, [inputValue, dog, dogName, dispatch]);
  
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  const quickActions = [
    { text: "How are you?", emoji: "❤️" },
    { text: "Want to play?", emoji: "🎾" },
    { text: "Good dog!", emoji: "⭐" },
    { text: "I love you!", emoji: "💕" },
  ];
  
  const handleQuickAction = useCallback((action) => {
    const userMessage = {
      sender: 'user',
      text: action.text,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const dogResponse = generateDogResponse(dog);
      setMessages(prev => [...prev, {
        sender: 'dog',
        text: dogResponse,
        timestamp: Date.now(),
      }]);
    }, 800);
  }, [dog]);
  
  const handleDismissDream = useCallback(() => {
    setShowDream(false);
    setTimeout(() => setDream(null), 300);
  }, []);
  
  return (
    <>
      {/* Floating Chat/Sleep Button - only show when awake */}
      {!isAsleep && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 active:scale-95"
          aria-label="Chat with your dog"
        >
          {isChatOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-2xl">💬</span>
          )}
        </button>
      )}
      
      {/* Chat Window */}
      {isChatOpen && !isAsleep && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-2xl animate-slideInUp">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐕</span>
              <div>
                <div className="text-sm font-bold text-white">{dogName}</div>
                <div className="text-xs text-emerald-300">
                  {dog?.mood ? `Feeling ${dog.mood}` : 'Your companion'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  } animate-fadeIn`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="border-t border-zinc-800 px-4 py-2">
              <div className="text-xs text-zinc-500 mb-2">Quick replies:</div>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white"
                  >
                    {action.emoji} {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="border-t border-emerald-500/20 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Talk to ${dogName}...`}
                className="flex-1 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="rounded-full bg-emerald-600 p-2 text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                aria-label="Send message"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dream Display */}
      {showDream && dream && isAsleep && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500"
          onClick={handleDismissDream}
        >
          <div 
            className={`relative max-w-md w-full mx-4 p-6 rounded-2xl bg-gradient-to-br ${dream.color} shadow-2xl border-2 border-white/20 transform transition-all duration-700 scale-100`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-3 -right-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <span className="text-2xl">{dream.icon}</span>
            </div>
            
            {dream.type === 'prophetic' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                ✨ RARE DREAM ✨
              </div>
            )}
            
            {dream.type === 'nightmare' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                😰 Nightmare
              </div>
            )}
            
            <div className="space-y-4 text-white">
              <h2 className="text-2xl font-bold text-center drop-shadow-lg">
                {dream.title}
              </h2>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <p className="text-sm leading-relaxed">
                  {dream.description}
                </p>
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border-2 border-white/40">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💭</span>
                  <p className="text-sm italic flex-1">
                    "{dream.message}"
                  </p>
                </div>
              </div>
              
              {dream.prophecy && (
                <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/40">
                  <p className="text-xs font-semibold text-center text-yellow-100">
                    🔮 {dream.prophecy}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleDismissDream}
                className="w-full mt-4 py-3 px-4 rounded-lg bg-white/30 hover:bg-white/40 border-2 border-white/50 text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
      )}
    </>
  );
}
