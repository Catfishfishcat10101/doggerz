// src/components/ui/BarkStream.jsx

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * BarkStream Component
 * Tiny UI element streaming playful micro-events
 * Shows recent dog actions, thoughts, and discoveries
 */

const SAMPLE_EVENTS = [
  { icon: '🦴', text: 'Found a stick!', type: 'discovery' },
  { icon: '💭', text: 'Thinking about treats...', type: 'thought' },
  { icon: '🎾', text: 'Ball! Ball! Ball!', type: 'excited' },
  { icon: '😴', text: 'Yawn...', type: 'tired' },
  { icon: '👃', text: 'Sniffing something interesting', type: 'curious' },
  { icon: '🐿️', text: 'Squirrel spotted!', type: 'alert' },
  { icon: '💕', text: 'Happy to see you!', type: 'love' },
  { icon: '🌧️', text: 'Rain smells nice', type: 'weather' }
];

export function BarkStream({ events = [], compact = false, maxVisible = 3 }) {
  const [displayEvents, setDisplayEvents] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (events.length > 0) {
      // Use provided events
      setDisplayEvents(events.slice(-maxVisible));
    } else {
      // Demo mode - generate random events
      const interval = setInterval(() => {
        if (!isPaused) {
          const randomEvent = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
          setDisplayEvents(prev => {
            const newEvents = [...prev, { ...randomEvent, id: Date.now() }];
            return newEvents.slice(-maxVisible);
          });
        }
      }, 5000); // New event every 5 seconds

      return () => clearInterval(interval);
    }
  }, [events, isPaused, maxVisible]);

  const getEventColor = (type) => {
    const colors = {
      discovery: 'bg-amber-50 border-amber-200 text-amber-900',
      thought: 'bg-purple-50 border-purple-200 text-purple-900',
      excited: 'bg-pink-50 border-pink-200 text-pink-900',
      tired: 'bg-gray-50 border-gray-200 text-gray-700',
      curious: 'bg-blue-50 border-blue-200 text-blue-900',
      alert: 'bg-orange-50 border-orange-200 text-orange-900',
      love: 'bg-red-50 border-red-200 text-red-900',
      weather: 'bg-cyan-50 border-cyan-200 text-cyan-900'
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  if (compact) {
    return (
      <div 
        className="bark-stream-compact inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <span className="text-xs font-medium text-gray-500">🐾</span>
        {displayEvents.length > 0 && (
          <div className="flex items-center gap-1 animate-slide-in-right">
            <span className="text-sm">{displayEvents[displayEvents.length - 1].icon}</span>
            <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
              {displayEvents[displayEvents.length - 1].text}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="bark-stream w-full max-w-xs space-y-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-700">🐾 Activity Stream</span>
        {isPaused && (
          <span className="text-xs text-gray-400">(paused)</span>
        )}
      </div>
      
      <div className="space-y-2">
        {displayEvents.map((event, index) => (
          <div
            key={event.id || index}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 animate-slide-in-right ${getEventColor(event.type)}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-lg flex-shrink-0">{event.icon}</span>
            <span className="text-sm font-medium flex-1">{event.text}</span>
            {event.time && (
              <span className="text-xs opacity-60 flex-shrink-0">{event.time}</span>
            )}
          </div>
        ))}
      </div>

      {displayEvents.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Waiting for activity...
        </div>
      )}
    </div>
  );
}

BarkStream.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string,
    text: PropTypes.string,
    type: PropTypes.string,
    time: PropTypes.string,
    id: PropTypes.any
  })),
  compact: PropTypes.bool,
  maxVisible: PropTypes.number
};

export default BarkStream;
