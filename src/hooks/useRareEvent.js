// src/hooks/useRareEvent.js

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { checkRareEvents, saveEventToHistory, getEventHistory } from '@/utils/rareEvents.js';

/**
 * useRareEvent Hook
 * Monitors for rare events (moon/howl surprises, etc.)
 * Provides event notifications and history
 * 
 * @returns {Object} - { activeEvent, eventHistory, dismissEvent, checkNow }
 */
export function useRareEvent() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Get game state
  const weather = useSelector((state) => state.weather?.condition || 'Clear');
  const streak = useSelector((state) => state.user?.streak || 0);
  const dog = useSelector((state) => state.dog);

  useEffect(() => {
    // Load event history on mount
    setEventHistory(getEventHistory());
  }, []);

  /**
   * Check for rare events
   */
  const checkForEvents = useCallback(() => {
    const now = new Date();
    const state = {
      hour: now.getHours(),
      weather,
      streak,
      dog,
      hasSeenSnowThisSeason: false, // TODO: Track this
      weatherJustChanged: false, // TODO: Track this
      previousWeather: null
    };

    const events = checkRareEvents(state);
    
    if (events.length > 0 && !activeEvent) {
      // Take first event (highest priority)
      const event = events[0];
      setActiveEvent(event);
      saveEventToHistory(event);
      setEventHistory(getEventHistory());
      
      // Auto-dismiss after 30 seconds if not manually dismissed
      setTimeout(() => {
        setActiveEvent(null);
      }, 30000);
    }

    setLastCheck(Date.now());
  }, [weather, streak, dog, activeEvent]);

  useEffect(() => {
    // Check on mount
    checkForEvents();

    // Check every 5 minutes
    const interval = setInterval(checkForEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkForEvents]);

  /**
   * Manually dismiss active event
   */
  const dismissEvent = useCallback(() => {
    setActiveEvent(null);
  }, []);

  /**
   * Force check now
   */
  const checkNow = useCallback(() => {
    checkForEvents();
  }, [checkForEvents]);

  return {
    activeEvent,
    eventHistory,
    dismissEvent,
    checkNow,
    lastCheck
  };
}

export default useRareEvent;
