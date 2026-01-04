// src/hooks/useVibeState.js

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { computeVibeState } from '@/utils/vibeEngine.js';

/**
 * useVibeState Hook
 * Computes and maintains current vibe state based on time, weather, and streak
 * Updates automatically when dependencies change
 * 
 * @returns {Object} vibeState - Current vibe configuration
 */
export function useVibeState() {
  const weather = useSelector((state) => state.weather?.condition || 'Clear');
  const streak = useSelector((state) => state.user?.streak || 0);
  
  const [vibeState, setVibeState] = useState(() => 
    computeVibeState({ weather, streak })
  );

  useEffect(() => {
    // Update vibe state
    const updateVibe = () => {
      const newVibe = computeVibeState({ weather, streak });
      setVibeState(newVibe);
    };

    updateVibe();

    // Update every minute to catch time changes
    const interval = setInterval(updateVibe, 60000);

    return () => clearInterval(interval);
  }, [weather, streak]);

  return vibeState;
}

export default useVibeState;
