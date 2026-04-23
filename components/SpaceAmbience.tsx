'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SpaceAmbienceProps {
  isPlaying: boolean;
  volume?: number;
}

export const SpaceAmbience: React.FC<SpaceAmbienceProps> = ({ isPlaying, volume = 0.3 }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Create a series of low-frequency oscillators for a deep space pad
    const frequencies = [55, 110, 164.81, 220, 329.63]; // A1, A2, E3, A3, E4
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Add some slight detune for thickness
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + Math.random() * 400, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      gain.gain.setValueAtTime(0.05 / frequencies.length, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start();
      oscillatorsRef.current.push(osc);

      // LFO for volume movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
    });

    // Add some noise for texture
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    whiteNoise.start();

    setIsInitialized(true);
  };

  useEffect(() => {
    if (isPlaying && !isInitialized) {
      const handleInteraction = () => {
        initAudio();
        window.removeEventListener('click', handleInteraction);
      };
      window.addEventListener('click', handleInteraction);
      return () => window.removeEventListener('click', handleInteraction);
    }
  }, [isPlaying, isInitialized]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const targetVolume = isPlaying ? volume : 0;
      masterGainRef.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.5);
    }
  }, [isPlaying, volume]);

  return null;
};
