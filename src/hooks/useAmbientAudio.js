// src/hooks/useAmbientAudio.js

import { useEffect, useRef, useState } from 'react';
import { getAmbientSound } from '@/utils/vibeEngine.js';

/**
 * useAmbientAudio Hook
 * Manages ambient background audio with soft crossfades by time-of-day
 * Respects user preferences and provides volume control
 * 
 * @param {Object} vibeState - Current vibe state from useVibeState
 * @param {Object} options - { enabled, volume, fadeTime }
 * @returns {Object} - { playing, toggle, setVolume, currentTrack }
 */
export function useAmbientAudio(vibeState, options = {}) {
  const {
    enabled: initialEnabled = false,
    volume: initialVolume = 0.3,
    fadeTime = 2000 // 2 seconds crossfade
  } = options;

  const [playing, setPlaying] = useState(initialEnabled);
  const [volume, setVolumeState] = useState(initialVolume);
  const [currentTrack, setCurrentTrack] = useState(null);
  
  const audioRef = useRef(null);
  const nextAudioRef = useRef(null);
  const fadingOut = useRef(false);

  useEffect(() => {
    // Check user preference from localStorage
    const storedPreference = localStorage.getItem('doggerz_ambient_audio');
    if (storedPreference !== null) {
      setPlaying(storedPreference === 'true');
    }
  }, []);

  useEffect(() => {
    if (!playing) {
      // Stop audio if not playing
      if (audioRef.current) {
        fadeOut(audioRef.current);
      }
      return;
    }

    const newTrack = getAmbientSound(vibeState);
    
    if (newTrack === currentTrack) {
      // Same track, just ensure it's playing
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    // Different track - crossfade
    setCurrentTrack(newTrack);
    crossfadeTo(newTrack);

  }, [vibeState, playing, currentTrack]);

  useEffect(() => {
    // Update volume on all audio elements
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * Crossfade to new track
   */
  const crossfadeTo = (newSrc) => {
    if (!newSrc) return;

    // Create new audio element
    const newAudio = new Audio(newSrc);
    newAudio.loop = true;
    newAudio.volume = 0; // Start silent

    newAudio.play().catch(err => {
      console.warn('Audio playback failed:', err);
      // Fallback: just switch
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    });

    // Fade in new audio
    fadeIn(newAudio, volume, fadeTime);

    // Fade out old audio
    if (audioRef.current && !fadingOut.current) {
      fadeOut(audioRef.current, fadeTime);
    }

    // Swap refs
    nextAudioRef.current = audioRef.current;
    audioRef.current = newAudio;
  };

  /**
   * Fade in audio element
   */
  const fadeIn = (audio, targetVolume, duration) => {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeIncrement = targetVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.volume = targetVolume;
        return;
      }
      
      audio.volume = Math.min(targetVolume, volumeIncrement * currentStep);
      currentStep++;
    }, stepDuration);
  };

  /**
   * Fade out audio element
   */
  const fadeOut = (audio, duration = fadeTime) => {
    if (!audio) return;
    
    fadingOut.current = true;
    const steps = 20;
    const stepDuration = duration / steps;
    const startVolume = audio.volume;
    const volumeDecrement = startVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.volume = 0;
        fadingOut.current = false;
        return;
      }
      
      audio.volume = Math.max(0, startVolume - (volumeDecrement * currentStep));
      currentStep++;
    }, stepDuration);
  };

  /**
   * Toggle playback
   */
  const toggle = () => {
    const newState = !playing;
    setPlaying(newState);
    localStorage.setItem('doggerz_ambient_audio', String(newState));
  };

  /**
   * Set volume
   */
  const setVolume = (newVolume) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    localStorage.setItem('doggerz_ambient_volume', String(clamped));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
    };
  }, []);

  return {
    playing,
    toggle,
    setVolume,
    volume,
    currentTrack
  };
}

export default useAmbientAudio;
