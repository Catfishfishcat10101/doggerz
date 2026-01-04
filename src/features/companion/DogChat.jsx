// src/features/companion/DogChat.jsx
// Dog Companion Chat - AI-powered chatbot that speaks as your dog
// Rule-based responses based on personality, mood, needs, and recent actions

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDog } from '@/redux/dogSlice.js';
import { addJournalEntry } from '@/redux/dogSlice.js';

/**
 * Generate dog response based on current state
 * @param {Object} dog - Dog state from Redux
 * @returns {string} - Response text
 */
function generateDogResponse(dog) {
  const needs = dog?.needs || {};
  const hunger = needs.hunger || 100;
  const happiness = needs.happiness || 100;
  const energy = needs.energy || 100;
  const cleanliness = needs.cleanliness || 100;
  
  const mood = dog?.mood || 'content';
  const name = dog?.name || 'Pup';
  const lastAction = dog?.lastAction || 'idle';
  
  // Priority system: Urgent needs first, then mood-based responses
  
  // URGENT: Critical needs (< 20)
  if (hunger < 20) {
    return pickRandom([
      "My tummy is SO empty... I'm starving! 🦴🥺",
      "Please feed me! I haven't eaten in forever! 😢",
      "Woof woof! HUNGRY! Food please! 🍖",
      "My belly is rumbling so loud... can you hear it? 💔",
    ]);
  }
  
  if (energy < 15) {
    return pickRandom([
      "I'm so sleepy... *yawn* Can I rest now? 😴",
      "Zzz... I need a nap... my paws are tired... 💤",
      "Too tired to play... maybe later? 🥱",
    ]);
  }
  
  if (cleanliness < 15) {
    return pickRandom([
      "I'm so dirty and itchy! Bath time? 🛁",
      "I smell bad... can you help me get clean? 🚿",
      "*scratches* I really need a bath! 🧼",
    ]);
  }
  
  // MEDIUM: Moderate needs (20-50)
  if (hunger < 50) {
    return pickRandom([
      "I'm getting hungry... treats soon? 🦴",
      "My tummy is empty... snack time? 🥩",
      "Can we eat? I'd love some kibble! 😋",
    ]);
  }
  
  if (happiness < 30) {
    return pickRandom([
      "I'm feeling sad... can we play? 🥺",
      "I miss playing with you... let's have fun! 🎾",
      "Where have you been? I've been lonely... 😢",
      "I need some love and attention! 💕",
    ]);
  }
  
  if (energy < 40) {
    return pickRandom([
      "I'm a bit tired... maybe a short rest? 😌",
      "Could use a quick nap... *yawn* 🛌",
    ]);
  }
  
  if (cleanliness < 40) {
    return pickRandom([
      "I'm getting a bit smelly... bath soon? 🚿",
      "Could use a quick cleanup! 🧼",
    ]);
  }
  
  // MOOD-BASED RESPONSES (when needs are okay)
  switch (mood) {
    case 'happy':
    case 'joyful':
      return pickRandom([
        "Woof woof! I LOVE YOU! This is the best day ever! 🎉",
        "YAY! You're here! Let's play! Let's play! 🎾",
        "I'm SO happy! Tail wagging at maximum speed! 🐕💨",
        "Life is amazing when you're around! 💖",
        "Can we go for a walk? PLEASE? Pretty please?! 🚶",
      ]);
      
    case 'playful':
      return pickRandom([
        "Let's play fetch! I'll bring it back this time! Maybe! 🎾",
        "Bet you can't catch me! *zooms around* 🏃💨",
        "Want to play tug-of-war? I'm REALLY strong! 💪",
        "Chase me! Chase me! This is SO fun! 🐕",
        "I found a stick! Can we play with it?! 🌳",
      ]);
      
    case 'sad':
    case 'lonely':
      return pickRandom([
        "I miss you when you're gone... 🥺",
        "Are you mad at me? I'll be good, I promise! 😢",
        "I've been waiting here all day... 💔",
        "Can you stay a little longer this time? 🐾",
      ]);
      
    case 'anxious':
    case 'scared':
      return pickRandom([
        "What was that noise?! Did you hear it too? 😰",
        "I'm a little scared... can you stay close? 🥺",
        "Everything feels weird today... hold me? 💕",
        "Are we safe? You'll protect me, right? 🛡️",
      ]);
      
    case 'calm':
    case 'content':
      return pickRandom([
        "This is nice... just being here with you. 😌",
        "Life is good! I love our routine. 🏡",
        "You're the best human ever! 💙",
        "I'm so lucky to have you! 🐕💕",
        "Just a calm, happy pup! ☺️",
      ]);
      
    case 'tired':
      return pickRandom([
        "*yawn* Maybe nap time soon? 😴",
        "I'm getting sleepy... *rests head* 💤",
        "Can we cuddle? I'm so cozy... 🛋️",
      ]);
      
    case 'angry':
    case 'grumpy':
      return pickRandom([
        "Hmph! I'm a little grumpy right now... 😤",
        "That squirrel was mocking me! Did you see?! 🐿️😠",
        "I wanted to play but nobody listened! 😾",
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
 * Pick random item from array
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * DogChat Component
 * Floating chat interface that appears when clicked
 */
export default function DogChat() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const chatButtonRef = useRef(null);
  
  const dogName = dog?.name || 'Pup';
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);
  
  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
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
  }, [isOpen, dogName, messages.length]);
  
  // Handle sending user message
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      sender: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Generate dog response after short delay
    setTimeout(() => {
      const dogResponse = generateDogResponse(dog);
      const dogMessage = {
        sender: 'dog',
        text: dogResponse,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, dogMessage]);
      
      // Save significant conversations to journal
      if (Math.random() < 0.3) { // 30% chance to save to journal
        dispatch(addJournalEntry({
          timestamp: Date.now(),
          type: 'conversation',
          summary: `Had a chat with ${dogName}`,
          body: `User: "${inputValue}"\n${dogName}: "${dogResponse}"`,
          moodTag: dog?.mood || 'content',
        }));
      }
    }, 800 + Math.random() * 1200); // Random delay 800-2000ms
  }, [inputValue, dog, dogName, dispatch]);
  
  // Handle Enter key
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  // Quick action buttons
  const quickActions = [
    { text: "How are you?", emoji: "❤️" },
    { text: "Want to play?", emoji: "🎾" },
    { text: "Good dog!", emoji: "⭐" },
    { text: "I love you!", emoji: "💕" },
  ];
  
  const handleQuickAction = useCallback((action) => {
    setInputValue(action.text);
    // Auto-send after a brief moment
    setTimeout(() => {
      const userMessage = {
        sender: 'user',
        text: action.text,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // Generate response
      setTimeout(() => {
        const dogResponse = generateDogResponse(dog);
        setMessages(prev => [...prev, {
          sender: 'dog',
          text: dogResponse,
          timestamp: Date.now(),
        }]);
      }, 800);
    }, 100);
  }, [dog]);
  
  return (
    <>
      {/* Floating Chat Button */}
      <button
        ref={chatButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 active:scale-95"
        aria-label="Chat with your dog"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>
      
      {/* Chat Window */}
      {isOpen && (
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
              onClick={() => setIsOpen(false)}
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
    </>
  );
}
