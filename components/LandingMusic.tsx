'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LandingMusicProps {
  isPlaying: boolean;
  volume?: number;
}

export const LandingMusic: React.FC<LandingMusicProps> = ({ isPlaying, volume = 0.4 }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/audio/bgm_landing.ogg');
    audio.loop = true;
    audio.volume = 0; // Start at 0 for fade-in
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && isUnlocked) {
      audioRef.current.play().catch(err => {
        console.warn('Audio playback failed:', err);
      });
      
      // Fade in
      let vol = 0;
      const interval = setInterval(() => {
        vol += 0.02;
        if (vol >= volume) {
          vol = volume;
          clearInterval(interval);
        }
        if (audioRef.current) audioRef.current.volume = vol;
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      // Fade out
      let vol = audioRef.current.volume;
      const interval = setInterval(() => {
        vol -= 0.02;
        if (vol <= 0) {
          vol = 0;
          if (audioRef.current) audioRef.current.pause();
          clearInterval(interval);
        }
        if (audioRef.current) audioRef.current.volume = vol;
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isUnlocked, volume]);

  useEffect(() => {
    if (isUnlocked) return;

    const unlock = () => {
      setIsUnlocked(true);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [isUnlocked]);

  return null;
};
