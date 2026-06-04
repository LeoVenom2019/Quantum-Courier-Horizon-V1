'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type BobbyBlueVariant = 'idle' | 'speaking' | 'glitch' | 'victory' | 'warning' | 'intro';

interface BobbyBlueCharacterProps {
  variant?: BobbyBlueVariant;
  className?: string;
  isSpeaking?: boolean;
}

const VARIANT_VIDEOS: Record<BobbyBlueVariant, string> = {
  idle: '/videos/bobby_blue/bobby_blue_victory.webm', // Using victory as a happy idle for now
  speaking: '/videos/bobby_blue/bobby_blue_victory.webm',
  glitch: '/videos/bobby_blue/bobby_blue_game_intro_glitch.webm',
  victory: '/videos/bobby_blue/bobby_blue_victory.webm',
  warning: '/videos/bobby_blue/bobby_blue_in_trouble.webm',
  intro: '/videos/bobby_blue/bobby_blue_game_intro.webm',
};

export const BobbyBlueCharacter = ({ 
  variant = 'idle', 
  className = "", 
  isSpeaking = false 
}: BobbyBlueCharacterProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = VARIANT_VIDEOS[variant];
  const isGameIntro = variant === 'glitch' || variant === 'intro';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video play blocked or failed:", err));
    }
  }, [variant]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${className}`}
    >
      {/* Cinematic Frame */}
      <div className={`relative mx-auto ${isGameIntro ? 'w-[min(86vw,560px)] aspect-video' : 'w-64 h-64 md:w-80 md:h-80'}`}>
        {/* Outer Ring Decoration */}
        <div className="absolute -inset-4 border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" />
        <div className="absolute -inset-8 border border-cyan-500/5 rounded-full animate-[spin_30s_linear_infinite_reverse] pointer-events-none" />

        {/* Main Card Container */}
        <div className="relative w-full h-full bg-slate-900 border-2 border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20 opacity-30" />
          
          {/* Video Container */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={videoSrc}
              loop
              muted
              playsInline
              className={`w-full h-full object-cover ${variant === 'glitch' && !isGameIntro ? 'filter hue-rotate-90 contrast-125' : ''}`}
            />
          </div>

          {/* UI Overlays */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyan-400" />

            {/* Data Streams */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              <div className="w-8 h-1 bg-cyan-500/40 rounded-full animate-pulse" />
              <div className="w-12 h-1 bg-cyan-500/20 rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-6 h-1 bg-cyan-500/60 rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>

            {/* Speaking Indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-sm"
                >
                  <div className="flex gap-0.5 items-end h-3">
                    {[0.4, 0.8, 0.5, 0.9, 0.3].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-cyan-400 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-orbitron text-cyan-400 tracking-widest ml-1">VOICE ACTIVE</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Variant Badge */}
            <div className="absolute top-4 right-4 bg-black/40 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
              <span className="text-[6px] font-mono text-white/50 uppercase tracking-[0.2em]">
                {variant} | BB-UNIT.01
              </span>
            </div>
          </div>
        </div>

        {/* Glitch Overlay (Active during 'glitch' variant) */}
        {variant === 'glitch' && (
          <motion.div 
            animate={{ 
              opacity: [0, 0.3, 0, 0.5, 0],
              x: [-2, 2, -1, 3, 0]
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/20 z-40 pointer-events-none mix-blend-overlay"
          />
        )}
      </div>
    </motion.div>
  );
};
