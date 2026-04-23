'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Settings, Trophy, Play, Music, Volume2, Globe, X, Timer, Trash2, ShieldCheck, Clock, Navigation, Database, Coffee, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { IntroNarrative } from '@/components/IntroNarrative';
import { GameDashboard } from '@/components/GameDashboard';
import { AchievementsModal } from '@/components/AchievementsModal';
import { ThemeInfoWindow } from '@/components/ThemeInfoWindow';
import { GameStorage } from '@/lib/game-storage';
import { Language, t } from '@/lib/i18n';
import { ThemeColor, GAME_THEMES } from '@/lib/game-data';

// Helper for random positions
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const StarField = ({ theme = 'cyan' }: { theme?: ThemeColor }) => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);
  
  const colorMap: Record<ThemeColor, string> = {
    cyan: 'rgba(6,182,212,0.4)',
    orange: 'rgba(249,115,22,0.4)',
    neila: 'rgba(16,185,129,0.4)',
    pink: 'rgba(236,72,153,0.4)',
    violet: 'rgba(139,92,246,0.4)',
    amber: 'rgba(245,158,11,0.4)',
    emerald: 'rgba(16,185,129,0.4)',
    rose: 'rgba(244,63,94,0.4)',
    blue: 'rgba(59,130,246,0.4)',
  };

  const glowColor = colorMap[theme] || colorMap.cyan;

  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        x: getRandom(0, 100),
        y: getRandom(0, 100),
        size: getRandom(1, 3),
        duration: getRandom(2, 5),
      }));
    };
    requestAnimationFrame(() => {
      setStars(generateStars());
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Bright Star in Top-Left */}
      <motion.div 
        className="absolute top-[10%] left-[10%] w-4 h-4 bg-white rounded-full z-10"
        style={{ boxShadow: `0 0 30px 10px rgba(255,255,255,0.8), 0 0 60px 20px ${glowColor}` }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-[1px] bg-white/40 blur-[1px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/40 blur-[1px]" />
      </motion.div>

      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            boxShadow: '0 0 10px white',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const Meteor = ({ delay = 0, theme = 'cyan' }: { delay?: number; theme?: ThemeColor }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const startX = getRandom(20, 100);
  const duration = getRandom(1, 3);
  const repeatDelay = getRandom(5, 15);
  const startY = -20;
  
  const trailColorMap: Record<ThemeColor, string> = {
    cyan: 'via-cyan-400',
    orange: 'via-orange-400',
    neila: 'via-emerald-400',
    pink: 'via-pink-400',
    violet: 'via-violet-400',
    amber: 'via-amber-400',
    emerald: 'via-emerald-400',
    rose: 'via-rose-400',
    blue: 'via-blue-400',
  };

  const trailColor = trailColorMap[theme] || trailColorMap.cyan;
  
  return (
    <motion.div
      initial={{ x: `${startX}%`, y: `${startY}%`, opacity: 0 }}
      animate={{ 
        x: `${startX - 40}%`, 
        y: '120%',
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatDelay: repeatDelay,
        ease: "linear"
      }}
      className="absolute z-5 pointer-events-none"
    >
      <div className={`w-[2px] h-20 bg-gradient-to-b from-white ${trailColor} to-transparent rotate-[35deg] blur-[1px]`} />
    </motion.div>
  );
};

const SpaceShip = ({ 
  id,
  start,
  end,
  duration,
  scale,
  color,
  onComplete,
  isWarp = false
}: { 
  id: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  scale: number;
  color: 'cyan' | 'orange' | 'pink' | 'emerald' | 'violet' | 'amber';
  onComplete: (id: number) => void;
  isWarp?: boolean;
}) => {
  const colorMap = {
    cyan: { border: 'border-cyan-500', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', window: 'bg-cyan-300/30 border-cyan-400', engine: 'bg-cyan-500', trail: 'from-cyan-500/50' },
    orange: { border: 'border-orange-500', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', window: 'bg-orange-300/30 border-orange-400', engine: 'bg-orange-500', trail: 'from-orange-500/50' },
    pink: { border: 'border-pink-500', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]', window: 'bg-pink-300/30 border-pink-400', engine: 'bg-pink-500', trail: 'from-pink-500/50' },
    emerald: { border: 'border-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', window: 'bg-emerald-300/30 border-emerald-400', engine: 'bg-emerald-500', trail: 'from-emerald-500/50' },
    violet: { border: 'border-violet-500', shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]', window: 'bg-violet-300/30 border-violet-400', engine: 'bg-violet-500', trail: 'from-violet-500/50' },
    amber: { border: 'border-amber-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', window: 'bg-amber-300/30 border-amber-400', engine: 'bg-amber-500', trail: 'from-amber-500/50' },
  };

  const config = colorMap[color] || colorMap.cyan;
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

  return (
    <motion.div
      initial={{ 
        left: `${start.x}%`, 
        top: `${start.y}%`, 
        opacity: 0,
        scale: isWarp ? 0 : scale,
        rotate: angle
      }}
      animate={{ 
        left: `${end.x}%`, 
        top: `${end.y}%`,
        opacity: [0, 0.8, 0.8, 0],
        scale: isWarp ? [0, scale * 1.5, scale, scale, 0] : scale
      }}
      onAnimationComplete={() => onComplete(id)}
      transition={{
        duration: duration,
        ease: isWarp ? "anticipate" : "linear",
      }}
      className="absolute z-10 pointer-events-none"
    >
      <div className="relative">
        {/* Trail */}
        <div className={`absolute right-full top-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-l ${config.trail} to-transparent blur-sm opacity-50`} />
        
        <div className={`w-24 h-8 bg-slate-800 border-2 ${config.border} rounded-full relative ${config.shadow}`}>
          <div className={`absolute top-1 right-4 w-8 h-4 ${config.window} rounded-full border`} />
          <div className={`absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-4 ${config.engine} blur-md rounded-full animate-pulse`} />
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-2 bg-white rounded-full" />
        </div>
        <div className={`absolute -top-4 left-6 w-4 h-12 bg-slate-700 border-l-2 ${config.border} -skew-x-12`} />
        <div className={`absolute -bottom-4 left-6 w-4 h-12 bg-slate-700 border-l-2 ${config.border} skew-x-12`} />
      </div>
    </motion.div>
  );
};

const SpaceTraffic = () => {
  const [ships, setShips] = useState<any[]>([]);
  
  const generateShip = React.useCallback((id: number) => {
    const side = Math.floor(Math.random() * 4);
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    
    if (side === 0) { // Top
      start = { x: getRandom(-20, 120), y: -20 };
      end = { x: getRandom(-20, 120), y: 120 };
    } else if (side === 1) { // Right
      start = { x: 120, y: getRandom(-20, 120) };
      end = { x: -20, y: getRandom(-20, 120) };
    } else if (side === 2) { // Bottom
      start = { x: getRandom(-20, 120), y: 120 };
      end = { x: getRandom(-20, 120), y: -20 };
    } else { // Left
      start = { x: -20, y: getRandom(-20, 120) };
      end = { x: 120, y: getRandom(-20, 120) };
    }
    
    const scale = getRandom(0.2, 1.2);
    const isWarp = Math.random() > 0.95;
    
    return {
      id,
      start,
      end,
      duration: (getRandom(15, 35) / (scale * 1.5)) * (isWarp ? 0.2 : 1),
      scale,
      color: ['cyan', 'orange', 'pink', 'emerald', 'violet', 'amber'][Math.floor(Math.random() * 6)],
      isWarp,
      key: Math.random()
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShips(Array.from({ length: 8 }).map((_, i) => generateShip(i)));
  }, [generateShip]);

  const handleComplete = React.useCallback((id: number) => {
    setShips(prev => prev.map(s => s.id === id ? generateShip(id) : s));
  }, [generateShip]);

  return (
    <>
      {ships.map(({ key, ...shipProps }) => (
        <SpaceShip key={key} {...shipProps} onComplete={handleComplete} />
      ))}
    </>
  );
};

const MotherShip = () => (
  <motion.div
    initial={{ left: '-20%', top: '10%', opacity: 0 }}
    animate={{ 
      left: ['-20%', '40%', '-20%'],
      top: ['10%', '15%', '10%'],
      opacity: [0, 0.1, 0.1, 0]
    }}
    transition={{
      duration: 120,
      repeat: Infinity,
      ease: "linear",
    }}
    className="absolute z-0 pointer-events-none"
    style={{ scale: 5 }}
  >
    <div className="relative opacity-20 blur-[2px]">
      <div className="w-[500px] h-40 bg-slate-900 border-4 border-slate-700 rounded-full relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-20 bg-slate-800 border-x-4 border-t-4 border-slate-700 rounded-t-full" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-20 h-10 bg-cyan-500/20 blur-xl rounded-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-20 h-10 bg-cyan-500/20 blur-xl rounded-full" />
        <div className="absolute inset-0 flex items-center justify-around px-20">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="w-3 h-3 bg-cyan-400/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const Nebula = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
  </div>
);

const MoonVisual = () => {
  const stars = [
    { top: '15%', left: '10%', delay: 0.1 },
    { top: '25%', left: '90%', delay: 0.6 },
    { top: '60%', left: '5%', delay: 1.3 },
    { top: '80%', left: '80%', delay: 0.8 },
    { top: '10%', left: '50%', delay: 2.2 },
    { top: '75%', left: '30%', delay: 1.0 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-80 h-80 flex items-center justify-center"
    >
      {/* Background Stars */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: star.delay }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ top: star.top, left: star.left, filter: 'blur(0.5px)' }}
          />
        ))}
      </div>

      {/* Moon Sphere */}
      <div className="relative w-60 h-60 rounded-full bg-[#d1d5db] shadow-[inset_-30px_-30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.1)] overflow-hidden z-20">
        {/* Surface Texture / Maria (Dark Patches) */}
        <div className="absolute inset-0 opacity-40">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Large Maria */}
            <path d="M40,40 Q80,20 120,50 T160,80 T120,110 T60,90 Z" fill="#4b5563" filter="blur(15px)" />
            <path d="M100,120 Q140,130 150,160 T120,180 T80,150 Z" fill="#374151" filter="blur(12px)" />
            <path d="M30,110 Q50,130 40,160 T20,180 Z" fill="#4b5563" filter="blur(10px)" />
          </svg>
        </div>

        {/* Craters (Detailed Texture) */}
        <div className="absolute inset-0 z-10">
          {/* Large Crater with Ray System */}
          <div className="absolute top-[25%] left-[65%] w-12 h-12 rounded-full bg-slate-400/30 border border-white/10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
          </div>
          
          {/* Scattered Craters */}
          <div className="absolute top-[15%] left-[30%] w-6 h-6 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-[45%] left-[20%] w-8 h-8 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-[70%] left-[50%] w-10 h-10 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-[60%] left-[75%] w-5 h-5 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-[35%] left-[45%] w-4 h-4 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-[80%] left-[25%] w-7 h-7 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-[10%] left-[70%] w-4 h-4 rounded-full bg-slate-500/20 border border-black/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
        </div>

        {/* Directional Lighting (Terminator) */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/60 z-30" />
        
        {/* Rim Light */}
        <div className="absolute inset-0 rounded-full border border-white/10 z-40" />
      </div>

      {/* Outer Glow */}
      <div className="absolute w-60 h-60 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)] z-10" />
    </motion.div>
  );
};

const EarthVisual = () => {
  const stars = [
    { top: '10%', left: '20%', delay: 0 },
    { top: '30%', left: '80%', delay: 0.5 },
    { top: '50%', left: '10%', delay: 1.2 },
    { top: '70%', left: '90%', delay: 0.8 },
    { top: '20%', left: '50%', delay: 2.1 },
    { top: '85%', left: '30%', delay: 1.5 },
    { top: '15%', left: '75%', delay: 0.3 },
    { top: '45%', left: '65%', delay: 1.7 },
    { top: '60%', left: '40%', delay: 0.9 },
    { top: '90%', left: '70%', delay: 2.5 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-80 h-80 flex items-center justify-center"
    >
      {/* Background Stars & Backlight */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: star.delay }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ 
              top: star.top, 
              left: star.left,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Atmosphere Halo - Sharp outer rim */}
      <div className="absolute w-[242px] h-[242px] rounded-full border border-cyan-300/40 shadow-[0_0_15px_rgba(34,211,238,0.4)] z-10" />
      
      {/* Planet Sphere */}
      <div className="relative w-60 h-60 rounded-full bg-[#1a365d] shadow-[inset_-40px_-40px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(59,130,246,0.1)] overflow-hidden z-20">
        {/* Deep Ocean Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0]/30 via-transparent to-black/60" />
        
        {/* Landmasses (Inspired by the photo's tan/brownish land) */}
        <motion.div 
          animate={{ x: [-5, 5, -5], y: [-2, 2, -2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 opacity-70"
        >
          <svg viewBox="0 0 200 200" className="w-[150%] h-[150%] translate-x-[-10%] translate-y-[10%]">
            {/* Main Landmass - Tan/Brownish like Australia in the photo */}
            <path 
              d="M40,130 C60,110 90,120 110,140 C130,160 110,190 80,185 C50,180 30,150 40,130 Z" 
              fill="#a88a64" 
              filter="blur(8px)" 
            />
            {/* Smaller islands/details */}
            <circle cx="130" cy="150" r="8" fill="#8b7355" filter="blur(4px)" />
            <circle cx="30" cy="110" r="5" fill="#8b7355" filter="blur(3px)" />
          </svg>
        </motion.div>

        {/* Swirly Clouds Layer (Inspired by the photo's organic patterns) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-50%] z-30 pointer-events-none opacity-60"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path d="M100,100 Q200,50 300,100 T350,250 T200,350 T50,200 Z" fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" filter="blur(30px)" opacity="0.4" />
            <path d="M150,150 Q250,100 350,150" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" filter="blur(20px)" opacity="0.3" />
            <path d="M50,250 Q150,300 250,250" fill="none" stroke="white" strokeWidth="25" strokeLinecap="round" filter="blur(25px)" opacity="0.3" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="white" strokeWidth="15" strokeDasharray="50 100" filter="blur(15px)" opacity="0.2" />
          </svg>
        </motion.div>

        {/* Atmospheric Rim Light (Inside) */}
        <div className="absolute inset-0 rounded-full shadow-[inset_10px_10px_20px_rgba(255,255,255,0.15),inset_-2px_-2px_10px_rgba(0,0,0,0.5)] z-40" />
        
        {/* Specular Highlight on Water */}
        <div className="absolute top-[20%] left-[30%] w-32 h-16 bg-white/5 rounded-full blur-3xl rotate-[-30deg] z-50" />
      </div>

      {/* Atmosphere Outer Glow (Soft) */}
      <div className="absolute w-60 h-60 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.2)] z-10" />
    </motion.div>
  );
};

const SaturnVisual = () => {
  const stars = [
    { top: '15%', left: '15%', delay: 0.2 },
    { top: '25%', left: '85%', delay: 0.7 },
    { top: '65%', left: '10%', delay: 1.4 },
    { top: '80%', left: '90%', delay: 0.9 },
    { top: '10%', left: '45%', delay: 2.3 },
    { top: '75%', left: '25%', delay: 1.1 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-80 h-80 flex items-center justify-center"
    >
      {/* Background Stars */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: star.delay }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ top: star.top, left: star.left, filter: 'blur(0.5px)' }}
          />
        ))}
      </div>

      {/* Back Rings (Behind Planet) */}
      <div className="absolute w-[360px] h-[120px] rotate-[15deg] z-0 opacity-70">
        <svg viewBox="0 0 360 120" className="w-full h-full">
          <defs>
            <radialGradient id="saturnRingGradientBack" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="transparent" />
              <stop offset="58%" stopColor="#2d3748" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#718096" stopOpacity="0.6" />
              <stop offset="75%" stopColor="#cbd5e0" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#a0aec0" stopOpacity="0.7" />
              <stop offset="95%" stopColor="#4a5568" stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <mask id="backRingMask">
              <rect x="0" y="0" width="360" height="60" fill="white" />
            </mask>
          </defs>
          <ellipse cx="180" cy="60" rx="170" ry="50" fill="none" stroke="url(#saturnRingGradientBack)" strokeWidth="40" mask="url(#backRingMask)" />
        </svg>
      </div>

      {/* Planet Sphere */}
      <div className="relative w-44 h-44 rounded-full bg-[#d4b483] shadow-[inset_-25px_-25px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,180,131,0.2)] overflow-hidden z-10">
        {/* Atmospheric Bands (Inspired by photo) */}
        <div className="absolute inset-0 flex flex-col">
          <div className="h-[12%] bg-[#b08d5b] opacity-30" />
          <div className="h-[8%] bg-[#d4b483] opacity-50" />
          <div className="h-[15%] bg-[#e6cc9f] opacity-40" />
          <div className="h-[10%] bg-[#c5a372] opacity-60" />
          <div className="h-[20%] bg-[#d4b483] opacity-40" />
          <div className="h-[15%] bg-[#b08d5b] opacity-50" />
          <div className="h-[20%] bg-[#8b7355] opacity-30" />
        </div>
        {/* Soft Lighting & Volume */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/50" />
        {/* Subtle Rim Light */}
        <div className="absolute inset-0 rounded-full border border-white/5" />
      </div>

      {/* Front Rings (In front of Planet) */}
      <div className="absolute w-[360px] h-[120px] rotate-[15deg] z-20 pointer-events-none">
        <svg viewBox="0 0 360 120" className="w-full h-full opacity-90">
          <defs>
            <radialGradient id="saturnRingGradientFront" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="transparent" />
              <stop offset="58%" stopColor="#2d3748" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#718096" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#cbd5e0" stopOpacity="1" />
              <stop offset="85%" stopColor="#a0aec0" stopOpacity="0.8" />
              <stop offset="95%" stopColor="#4a5568" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <mask id="frontRingMask">
              <rect x="0" y="60" width="360" height="60" fill="white" />
            </mask>
          </defs>
          <ellipse cx="180" cy="60" rx="170" ry="50" fill="none" stroke="url(#saturnRingGradientFront)" strokeWidth="40" mask="url(#frontRingMask)" />
        </svg>
        
        {/* Shadow of the planet on the rings (Crucial for realism) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-black/70 blur-2xl rounded-full scale-x-[1.8] translate-x-14 translate-y-4 opacity-50 z-30" />
      </div>

      {/* Outer Glow */}
      <div className="absolute w-44 h-44 rounded-full shadow-[0_0_60px_rgba(212,180,131,0.1)] z-0" />
    </motion.div>
  );
};

const MuskVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-64 h-64 flex items-center justify-center"
    style={{ perspective: 1000 }}
  >
    <motion.div
      animate={{ rotateY: [0, 360], rotateX: [0, 10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      className="relative w-48 h-48 flex items-center justify-center preserve-3d"
    >
      {/* Modern X Design - Sleek and Minimalist */}
      <div className="absolute w-full h-1 bg-white shadow-[0_0_25px_rgba(255,255,255,1)] rotate-45" />
      <div className="absolute w-full h-1 bg-white shadow-[0_0_25px_rgba(255,255,255,1)] -rotate-45" />
      
      {/* Secondary lines for depth */}
      <div className="absolute w-full h-[1px] bg-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.5)] rotate-45 translate-z-4" />
      <div className="absolute w-full h-[1px] bg-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.5)] -rotate-45 translate-z-4" />
      
      {/* Core Glow */}
      <div className="absolute w-8 h-8 bg-white rounded-full blur-md opacity-50" />
    </motion.div>
    
    {/* Outer Ring */}
    <div className="absolute w-56 h-56 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
    <div className="absolute w-60 h-60 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
    
    <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl animate-pulse" />
  </motion.div>
);

const BlackHoleVisual = () => {
  const stars = [
    { top: '10%', left: '15%', delay: 0.1 },
    { top: '20%', left: '80%', delay: 0.6 },
    { top: '60%', left: '10%', delay: 1.3 },
    { top: '85%', left: '85%', delay: 0.8 },
    { top: '15%', left: '40%', delay: 2.2 },
    { top: '70%', left: '20%', delay: 1.0 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-96 h-96 flex items-center justify-center"
    >
      {/* Background Stars & Nebula Glow */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: star.delay }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ top: star.top, left: star.left, filter: 'blur(0.5px)' }}
          />
        ))}
        <div className="absolute inset-0 bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Gravitational Lensing / Accretion Disk (Back Part) */}
      <div className="absolute inset-0 z-10 opacity-80">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <radialGradient id="diskGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#60a5fa" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#7c2d12" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="diskBlur">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          
          {/* Lensed Disk (Top Halo) */}
          <ellipse 
            cx="200" cy="180" rx="140" ry="100" 
            fill="none" stroke="url(#diskGradient)" strokeWidth="30" 
            filter="url(#diskBlur)"
            className="opacity-60"
          />
          
          {/* Lensed Disk (Bottom Halo) */}
          <ellipse 
            cx="200" cy="220" rx="140" ry="100" 
            fill="none" stroke="#ea580c" strokeWidth="40" 
            filter="url(#diskBlur)"
            className="opacity-40"
          />
        </svg>
      </div>

      {/* Accretion Disk (Middle Layer - Horizontal) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-[450px] h-[100px] z-30 pointer-events-none opacity-90"
      >
        <svg viewBox="0 0 450 100" className="w-full h-full">
          <ellipse 
            cx="225" cy="50" rx="220" ry="20" 
            fill="none" stroke="url(#diskGradient)" strokeWidth="15" 
            filter="url(#diskBlur)"
          />
        </svg>
      </motion.div>

      {/* Event Horizon & Photon Sphere */}
      <div className="relative z-40 flex items-center justify-center">
        {/* Photon Sphere (Bright Blue Rim) */}
        <div className="absolute w-44 h-44 rounded-full border-4 border-blue-400 shadow-[0_0_40px_rgba(96,165,250,1),inset_0_0_20px_rgba(96,165,250,0.8)] blur-[2px]" />
        
        {/* Event Horizon (Pure Black) */}
        <div className="w-40 h-40 rounded-full bg-black shadow-[0_0_60px_rgba(0,0,0,1)]" />
      </div>

      {/* Accretion Disk (Front Part - Lensing effect) */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-70">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <path 
            d="M60,200 Q200,160 340,200" 
            fill="none" stroke="url(#diskGradient)" strokeWidth="25" 
            filter="url(#diskBlur)"
          />
        </svg>
      </div>

      {/* Core Glows */}
      <div className="absolute w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] z-0" />
      <div className="absolute w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] z-0" />
    </motion.div>
  );
};

const SunVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-64 h-64 flex items-center justify-center"
  >
    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_100px_rgba(251,191,36,0.8),inset_-10px_-10px_40px_rgba(0,0,0,0.4)] relative z-10 overflow-hidden">
      <motion.div 
        animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-50"
      />
    </div>
    <motion.div 
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl z-0"
    />
    <motion.div 
      animate={{ scale: [1.1, 1.2, 1.1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute w-80 h-80 bg-orange-500/20 rounded-full blur-[60px] z-0"
    />
  </motion.div>
);

const RobotVisual = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative w-64 h-64 flex flex-col items-center justify-center"
  >
    <div className="relative w-32 h-32 bg-slate-700 border-4 border-cyan-500 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center gap-4">
      <div className="flex gap-6">
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" 
        />
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" 
        />
      </div>
      <div className="w-16 h-2 bg-cyan-500/30 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-8 h-full bg-cyan-400" 
        />
      </div>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-slate-600">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </div>
    </div>
    <div className="w-40 h-12 bg-slate-800 border-x-4 border-b-4 border-cyan-500 rounded-b-3xl mt-[-4px] relative">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full border border-cyan-500/20" />
    </div>
  </motion.div>
);

const ChessBoardVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-80 h-80 flex items-center justify-center [perspective:1200px]"
  >
    <motion.div 
      animate={{ 
        rotateX: [55, 60, 55],
        rotateZ: [40, 45, 40],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-64 h-64 [transform-style:preserve-3d]"
    >
      {/* Board Base / Depth */}
      <div className="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-sm [transform:translateZ(-10px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
      <div className="absolute inset-0 bg-slate-900 border border-slate-700 rounded-sm [transform:translateZ(-20px)]" />
      
      {/* The Board Surface */}
      <div className="absolute inset-0 bg-slate-950 border-2 border-amber-500/30 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        {/* Grid Pattern */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {[...Array(64)].map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isDark = (row + col) % 2 === 1;
            return (
              <div 
                key={i} 
                className={`w-full h-full border-[0.5px] border-white/5 ${
                  isDark ? 'bg-black/40' : 'bg-gradient-to-br from-white/30 to-white/10 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.4)]'
                } relative group`}
              >
                {/* Random tech highlights - Glowing squares */}
                {((i * 17) % 9 === 0) && (
                  <motion.div 
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ 
                      duration: 4 + (i % 4), 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: (i % 7) * 0.5 
                    }}
                    className="absolute inset-0 bg-amber-500/30 blur-[2px]"
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Digital Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:12.5%_12.5%]" />
        </div>
      </div>
    </motion.div>

    {/* Floor Shadow / Reflection */}
    <div className="absolute bottom-0 w-64 h-32 bg-black/40 blur-3xl rounded-[100%] z-0" />
  </motion.div>
);

const AlienVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-64 h-64 flex items-center justify-center"
  >
    <div className="relative w-48 h-64 flex items-center justify-center">
      {/* Alien Head Shape */}
      <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">
        <defs>
          <linearGradient id="alienGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Head - More rounded and tapered like the image */}
        <path 
          d="M100,30 C155,30 185,80 185,135 C185,195 145,235 100,235 C55,235 15,195 15,135 C15,80 45,30 100,30 Z" 
          fill="url(#alienGradient)"
          stroke="#059669"
          strokeWidth="1"
        />
        
        {/* Eyes - Large, dark and glossy */}
        <g style={{ transform: 'rotate(-10deg)', transformOrigin: '70px 120px' }}>
          <ellipse 
            cx="70" cy="120" rx="28" ry="38" 
            fill="#111827" 
          />
          <circle cx="82" cy="105" r="5" fill="white" opacity="0.6" />
        </g>
        
        <g style={{ transform: 'rotate(10deg)', transformOrigin: '130px 120px' }}>
          <ellipse 
            cx="130" cy="120" rx="28" ry="38" 
            fill="#111827" 
          />
          <circle cx="142" cy="105" r="5" fill="white" opacity="0.6" />
        </g>
        
        {/* Smile - Small and subtle */}
        <path 
          d="M85,190 Q100,205 115,190" 
          fill="none" 
          stroke="#064e3b" 
          strokeWidth="3" 
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
      
      {/* Background Aura */}
      <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full z-[-1] animate-pulse" />
    </div>
  </motion.div>
);

const ThemeIconButton = ({ 
  children, 
  onClick, 
  themeId, 
  glowColor 
}: { 
  children: React.ReactNode; 
  onClick: (id: string) => void; 
  themeId: string;
  glowColor: string;
}) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.08,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(themeId)}
      className="relative cursor-pointer transition-all duration-300 pointer-events-auto group"
    >
      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 blur-3xl transition-opacity duration-300"
        style={{ backgroundColor: glowColor }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.button>
  );
};

const MenuButton = ({ label, icon: Icon, onClick, disabled = false, theme = 'cyan' }: { label: string; icon: any; onClick?: () => void; disabled?: boolean; theme?: ThemeColor }) => {
  const colorMap: Record<ThemeColor, string> = {
    cyan: '#06b6d4',
    orange: '#f97316',
    neila: '#10b981',
    pink: '#ec4899',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    emerald: '#10b981',
    rose: '#f43f5e',
    blue: '#3b82f6',
  };

  const lightningColor = colorMap[theme] || colorMap.cyan;
  
  const borderMap: Record<ThemeColor, string> = {
    cyan: 'border-cyan-500/10',
    orange: 'border-orange-500/10',
    neila: 'border-emerald-500/10',
    pink: 'border-pink-500/10',
    violet: 'border-violet-500/10',
    amber: 'border-amber-500/10',
    emerald: 'border-emerald-500/10',
    rose: 'border-rose-500/10',
    blue: 'border-blue-500/10',
  };
  const accentBorder = borderMap[theme] || borderMap.cyan;

  const textMap: Record<ThemeColor, string> = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    neila: 'text-emerald-400',
    pink: 'text-pink-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400',
  };
  const accentText = textMap[theme] || textMap.cyan;

  const hoverTextMap: Record<ThemeColor, string> = {
    cyan: 'text-cyan-300',
    orange: 'text-orange-300',
    neila: 'text-emerald-300',
    pink: 'text-pink-300',
    violet: 'text-violet-300',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
    blue: 'text-blue-300',
  };
  const accentHoverText = hoverTextMap[theme] || hoverTextMap.cyan;

  const hoverBgMap: Record<ThemeColor, string> = {
    cyan: 'rgba(6, 182, 212, 0.2)',
    orange: 'rgba(249, 115, 22, 0.2)',
    neila: 'rgba(16, 185, 129, 0.2)',
    pink: 'rgba(236, 72, 153, 0.2)',
    violet: 'rgba(139, 92, 246, 0.2)',
    amber: 'rgba(245, 158, 11, 0.2)',
    emerald: 'rgba(16, 185, 129, 0.2)',
    rose: 'rgba(244, 63, 94, 0.2)',
    blue: 'rgba(59, 130, 246, 0.2)',
  };
  const accentHoverBg = hoverBgMap[theme] || hoverBgMap.cyan;

  const glowMap: Record<ThemeColor, string> = {
    cyan: 'group-hover:text-cyan-100',
    orange: 'group-hover:text-orange-100',
    neila: 'group-hover:text-emerald-100',
    pink: 'group-hover:text-pink-100',
    violet: 'group-hover:text-violet-100',
    amber: 'group-hover:text-amber-100',
    emerald: 'group-hover:text-emerald-100',
    rose: 'group-hover:text-rose-100',
    blue: 'group-hover:text-blue-100',
  };
  const accentGlow = glowMap[theme] || glowMap.cyan;

  const cornerMap: Record<ThemeColor, string> = {
    cyan: 'border-cyan-400/40',
    orange: 'border-orange-400/40',
    neila: 'border-emerald-400/40',
    pink: 'border-pink-400/40',
    violet: 'border-violet-400/40',
    amber: 'border-amber-400/40',
    emerald: 'border-emerald-400/40',
    rose: 'border-rose-400/40',
    blue: 'border-blue-400/40',
  };
  const accentCorner = cornerMap[theme] || cornerMap.cyan;

  const gradientMap: Record<ThemeColor, string> = {
    cyan: 'from-cyan-500/0 via-cyan-500/10 to-cyan-500/0',
    orange: 'from-orange-500/0 via-orange-500/10 to-orange-500/0',
    neila: 'from-emerald-500/0 via-emerald-500/10 to-emerald-500/0',
    pink: 'from-pink-500/0 via-pink-500/10 to-pink-500/0',
    violet: 'from-violet-500/0 via-violet-500/10 to-violet-500/0',
    amber: 'from-amber-500/0 via-amber-500/10 to-amber-500/0',
    emerald: 'from-emerald-500/0 via-emerald-500/10 to-emerald-500/0',
    rose: 'from-rose-500/0 via-rose-500/10 to-rose-500/0',
    blue: 'from-blue-500/0 via-blue-500/10 to-blue-500/0',
  };
  const accentGradient = gradientMap[theme] || gradientMap.cyan;

  return (
    <motion.button
      whileHover={disabled ? {} : { 
        x: 12, 
        scale: 1.03, 
        backgroundColor: accentHoverBg,
        boxShadow: `0 0 50px ${lightningColor}33, inset 0 0 20px ${lightningColor}11`,
        borderColor: lightningColor
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 25,
        backgroundColor: { duration: 0.3 },
        boxShadow: { duration: 0.3 }
      }}
      whileTap={disabled ? {} : { scale: 0.97, x: 6 }}
      onClick={disabled ? undefined : onClick}
      className={`w-full group relative flex items-center justify-start gap-4 py-4 px-8 border ${accentBorder} rounded-xl overflow-hidden transition-all duration-500 ${
        disabled 
          ? 'bg-slate-900/5 border-slate-800/10 cursor-not-allowed opacity-30' 
          : 'bg-slate-900/20 backdrop-blur-md'
      }`}
    >
      {/* Lightning Border Effect - Electric Pulse */}
      {!disabled && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div 
            className="absolute inset-[-400%] animate-[spin_3s_linear_infinite] opacity-60 blur-[1px]" 
            style={{
              background: `conic-gradient(from_0deg,transparent_0%,transparent_49.5%,#fff_50%,${lightningColor}_50.5%,transparent_51%,transparent_100%)`
            }}
          />
          <div className="absolute inset-[1px] bg-slate-950/40 rounded-[11px] z-[-1]" />
        </div>
      )}

      {/* Internal Glow Pulse */}
      {!disabled && (
        <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl`} />
      )}

      <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out`} />
      
      <div className="relative z-10 flex items-center gap-4">
        <Icon className={`w-5 h-5 ${disabled ? 'text-slate-600' : `${accentText} group-hover:${accentHoverText}`} transition-all duration-300 group-hover:scale-125 group-hover:rotate-12`} />
        <span className={`text-sm font-orbitron tracking-[0.4em] ${disabled ? 'text-slate-500' : `text-white ${accentGlow}`} transition-all duration-300`}>
          {label}
        </span>
      </div>
      
      {/* HUD Corner accents */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
    </motion.button>
  );
};

export default function GameHome() {
  const [view, setView] = useState<'landing' | 'narrative' | 'game'>('landing');
  const [showOptions, setShowOptions] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isSpeedRun, setIsSpeedRun] = useState(false);
  const [isRoute2Unlocked, setIsRoute2Unlocked] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const theme = GAME_THEMES[currentThemeIndex].color;

  const setTheme = (color: ThemeColor | ((prev: ThemeColor) => ThemeColor)) => {
    const newColor = typeof color === 'function' ? color(theme) : color;
    const index = GAME_THEMES.findIndex(t => t.color === newColor);
    if (index !== -1) {
      setCurrentThemeIndex(index);
    }
  };

  useEffect(() => {
    const saveTheme = async () => {
      await GameStorage.save(currentThemeIndex, 'game_theme_index');
    };
    saveTheme();
  }, [currentThemeIndex]);

  const [showSpeedRunConfirm, setShowSpeedRunConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearRecordsConfirm, setShowClearRecordsConfirm] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  const [showSpeedRunMenu, setShowSpeedRunMenu] = useState(false);
  const [showLocalRecords, setShowLocalRecords] = useState(false);
  const [showOnlineRecords, setShowOnlineRecords] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<{ [key: string]: number }>({});
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>([]);
  const [activeCodes, setActiveCodes] = useState<{ [key: string]: boolean }>({});
  const [isShaking, setIsShaking] = useState(false);
  const [codesView, setCodesView] = useState<'input' | 'list'>('input');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [localRecords, setLocalRecords] = useState<{ name: string; time: number; date: string }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const getThemeGlowColor = (themeColor: ThemeColor) => {
    const colorMap: Record<ThemeColor, string> = {
      cyan: '#06b6d4',
      orange: '#f97316',
      neila: '#10b981',
      pink: '#ec4899',
      violet: '#8b5cf6',
      amber: '#f59e0b',
      emerald: '#10b981',
      rose: '#f43f5e',
      blue: '#3b82f6',
    };
    return colorMap[themeColor] || '#06b6d4';
  };

  // Hydration fix: Load from localStorage after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Use a small timeout to avoid synchronous setState in effect lint error
    const timer = setTimeout(() => {
      const loadAllData = async () => {
        const saved = await GameStorage.load('time_travel_save');
        if (saved) {
          try {
            const data = saved;
            setPlayerName(data.playerName || '');
            const unlocked = data.routeTier === 'Interstellar' || (data.unlockedTechLevels?.Solar >= 9);
            setIsRoute2Unlocked(unlocked);
            setHasSave(true);
            
            const savedThemeIndex = await GameStorage.load('game_theme_index');
            if (typeof savedThemeIndex === 'number' && savedThemeIndex >= 0 && savedThemeIndex < GAME_THEMES.length) {
              setCurrentThemeIndex(savedThemeIndex);
            } else {
              // Fallback to old theme system if exists
              const savedTheme = await GameStorage.load('game_theme');
              if (savedTheme === 'cyan') setCurrentThemeIndex(0);
              else if (savedTheme === 'orange') setCurrentThemeIndex(3); // Saturn is orange
              else if (savedTheme === 'neila') setCurrentThemeIndex(9); // Neila is emerald
              else if (unlocked) setCurrentThemeIndex(3);
            }

            if (data.unlockedAchievements) {
              setUnlockedAchievements(data.unlockedAchievements);
            }
            if (data.achievementProgress) {
              setAchievementProgress(data.achievementProgress);
            }
          } catch (e) {}
        }

        const savedCodes = await GameStorage.load('game_unlocked_codes');
        if (savedCodes) {
          try {
            setUnlockedCodes(savedCodes);
          } catch (e) {}
        }

        const savedActiveCodes = await GameStorage.load('game_active_codes');
        if (savedActiveCodes) {
          try {
            setActiveCodes(savedActiveCodes);
          } catch (e) {}
        }

        const savedRecords = await GameStorage.load('speed_run_records');
        if (savedRecords) {
          try {
            setLocalRecords(savedRecords);
          } catch (e) {}
        }
      };
      loadAllData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saveCodes = async () => {
      await GameStorage.save(unlockedCodes, 'game_unlocked_codes');
    };
    saveCodes();
  }, [unlockedCodes]);

  useEffect(() => {
    const saveActiveCodes = async () => {
      await GameStorage.save(activeCodes, 'game_active_codes');
    };
    saveActiveCodes();
  }, [activeCodes]);

  const AVAILABLE_CODES = [
    { 
      code: 'MONEY', 
      name: 'Quantum Wealth', 
      description: { 
        en: 'Start new games with 500,000 QC.', 
        pt: 'Comece novos jogos com 500.000 QC.' 
      } 
    },
    { 
      code: 'NEON', 
      name: 'Neon Horizon', 
      description: { 
        en: 'Unlocks a special visual theme (Visual only).', 
        pt: 'Desbloqueia um tema visual especial (Apenas visual).' 
      } 
    },
    { 
      code: 'EASY', 
      name: 'Easy Mode', 
      description: { 
        en: '-50% cost and +50% profit in mining for "Routes 1" and "Routes 2".', 
        pt: '-50% de custo e +50% de lucro em mineração "Rotas 1" e "Rotas 2".' 
      } 
    },
    { 
      code: 'SIGNAL', 
      name: 'Strange Signal', 
      description: { 
        en: 'Detects strange signals from space.', 
        pt: 'Detecta sinais estranhos vindo do espaço.' 
      } 
    },
    { 
      code: 'GLITCH', 
      name: 'Glitch Mode', 
      description: { 
        en: 'Visual glitches on the landing page (Visual only).', 
        pt: 'A tela inicial fica com glitchs visuais interessantes (Apenas Visual).' 
      } 
    },
    { 
      code: 'HARD', 
      name: 'Hard Mode', 
      description: { 
        en: '-50% profit in all routes. (New game only)', 
        pt: 'Diminui todo o lucro gerado em todas as Rotas em 50%. (Apenas novo jogo)' 
      } 
    },
    { 
      code: 'SPEED', 
      name: 'Speed Demon', 
      description: { 
        en: 'Changes Speed Run Mode colors to Red and Black.', 
        pt: 'Muda as cores do Modo Speed Run (e apenas ele).' 
      } 
    },
    { 
      code: 'SLIKE', 
      name: 'Impossible Mode', 
      description: { 
        en: 'No auto-deliveries, no auto-sell, 1h research. (New game only)', 
        pt: 'Ativa o Modo Impossível (?)! (Apenas jogo novo)' 
      } 
    },
    { 
      code: 'NEILA', 
      name: 'Emerald Theme', 
      description: { 
        en: 'Unlocks the Emerald theme.', 
        pt: 'Desbloqueia o tema Esmeralda.' 
      } 
    }
  ];

  const ECONOMIC_CODES = ['MONEY', 'EASY', 'HARD', 'SLIKE'];
  const VISUAL_CODES = ['NEON', 'SIGNAL', 'GLITCH', 'SPEED', 'NEILA'];
  const LANDING_CODES: string[] = [];

  const handleActivateCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;

    const found = AVAILABLE_CODES.find(c => c.code === code);
    if (!found) {
      setCodeError(tl('CODE NOT RECOGNIZED', 'CÓDIGO NÃO RECONHECIDO'));
      setTimeout(() => setCodeError(''), 3000);
      return;
    }

    if (unlockedCodes.includes(code)) {
      setCodeError(tl('CODE ALREADY ACTIVATED', 'CÓDIGO JÁ ATIVADO'));
      setTimeout(() => setCodeError(''), 3000);
      return;
    }

    setUnlockedCodes(prev => [...prev, code]);
    
    const next = { ...activeCodes };
    
    // Mutual Exclusivity
    if (ECONOMIC_CODES.includes(code)) {
      ECONOMIC_CODES.forEach(ec => { if (ec !== code) next[ec] = false; });
    }
    
    next[code] = true;

    // Save Invalidation
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if ((data.activeCodes?.HARD && !next.HARD) || (data.activeCodes?.SLIKE && !next.SLIKE)) {
          await GameStorage.remove('time_travel_save');
          setHasSave(false);
        }
      } catch (e) {}
    }

    setActiveCodes(next);
    if (code === 'SIGNAL') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000);
    }

    setCodeSuccess(tl('CODE ACTIVATED!', 'CÓDIGO ATIVADO!'));
    setCodeInput('');
    setTimeout(() => setCodeSuccess(''), 3000);
    
    if (sfxOn) {
      // Digital sound effect placeholder
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const toggleCode = async (code: string) => {
    const newState = !activeCodes[code];
    const next = { ...activeCodes };

    // Mutual Exclusivity
    if (newState) {
      if (ECONOMIC_CODES.includes(code)) {
        ECONOMIC_CODES.forEach(ec => { if (ec !== code) next[ec] = false; });
      }
      if (LANDING_CODES.includes(code)) {
        LANDING_CODES.forEach(lc => { if (lc !== code) next[lc] = false; });
      }
    }
    
    next[code] = newState;

    // Save Invalidation
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if ((data.activeCodes?.HARD && !next.HARD) || (data.activeCodes?.SLIKE && !next.SLIKE)) {
          await GameStorage.remove('time_travel_save');
          setHasSave(false);
        }
      } catch (e) {}
    }

    if (code === 'NEILA' && newState) {
      setTheme('neila');
    } else if (code === 'NEILA' && !newState) {
      if (theme === 'neila') setTheme('cyan');
    }

    if (code === 'SIGNAL' && newState) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000);
    }

    setActiveCodes(next);

    if (sfxOn) {
      const soundUrl = newState 
        ? 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3';
      const audio = new Audio(soundUrl);
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
  };

  const handleStartGame = (speedRun = false) => {
    setIsSpeedRun(speedRun);
    setView('narrative');
  };

  const handleClearRecords = async () => {
    await GameStorage.remove('speed_run_records');
    setLocalRecords([]);
    setShowClearRecordsConfirm(false);
  };

  const handleDeleteRecord = async (index: number) => {
    const updatedRecords = [...localRecords];
    updatedRecords.splice(index, 1);
    setLocalRecords(updatedRecords);
    await GameStorage.save(updatedRecords, 'speed_run_records');
  };

  const handleContinue = async () => {
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if (data.playerName) {
          setPlayerName(data.playerName);
        }
        setIsSpeedRun(false);
        setView('game');
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  };

  const confirmName = () => {
    if (playerName.trim()) {
      setShowNamePrompt(false);
      if (isSpeedRun) {
        setView('game');
      } else {
        setView('narrative');
      }
    }
  };

  const handleResetProgress = async () => {
    await GameStorage.remove('time_travel_save');
    setHasSave(false);
    setPlayerName('');
    setShowResetConfirm(false);
    setShowOptions(false);
  };

  if (view === 'narrative') {
    return (
      <IntroNarrative 
        onComplete={() => setView('game')} 
        onCancel={() => setView('landing')}
        language={language} 
        playerName={playerName}
        setPlayerName={setPlayerName}
      />
    );
  }

  if (view === 'game') {
    return (
      <GameDashboard 
        language={language} 
        musicOn={musicOn} 
        sfxOn={sfxOn} 
        setLanguage={setLanguage}
        setMusicOn={setMusicOn}
        setSfxOn={setSfxOn}
        playerName={playerName}
        isSpeedRun={isSpeedRun}
        activeCodes={activeCodes}
        setActiveCodes={setActiveCodes}
        unlockedCodes={unlockedCodes}
        setUnlockedCodes={setUnlockedCodes}
        localRecords={localRecords}
        setLocalRecords={setLocalRecords}
        onReturnToMenu={async () => {
          setView('landing');
          setIsSpeedRun(false);
          const hasSavedGame = await GameStorage.load('time_travel_save');
          setHasSave(!!hasSavedGame);
          
          // Refresh Route 2 status
          const saved = await GameStorage.load('time_travel_save');
          if (saved) {
            try {
              const data = saved;
              const unlocked = data.routeTier === 'Interstellar' || (data.unlockedTechLevels?.Solar >= 9);
              setIsRoute2Unlocked(unlocked);
              if (unlocked) {
                const savedThemeIndex = await GameStorage.load('game_theme_index');
                if (savedThemeIndex === null || savedThemeIndex === undefined) {
                  setCurrentThemeIndex(3); // Default to Saturn (orange) if unlocked
                }
              }
            } catch (e) {}
          }

          // Refresh local records when returning to menu
          const savedRecords = await GameStorage.load('speed_run_records');
          if (savedRecords) {
            try {
              setLocalRecords(savedRecords);
            } catch (e) {
              setLocalRecords([]);
            }
          }
        }}
      />
    );
  }

  const tl = (en: string, pt: string) => t(language, en, pt);

  return (
    <main className={`relative min-h-screen w-full flex flex-col items-start justify-center pl-12 md:pl-24 bg-[#050510] overflow-hidden ${isMounted && activeCodes['GLITCH'] ? 'animate-[glitch-bg_0.2s_infinite]' : ''}`}>
      {/* Glitch Overlay for Code */}
      {activeCodes['GLITCH'] && (
        <div className="fixed inset-0 z-[200] pointer-events-none opacity-30 overflow-hidden">
          <div className={`absolute inset-0 ${theme === 'cyan' ? 'bg-cyan-500/5' : theme === 'orange' ? 'bg-orange-500/5' : 'bg-emerald-500/5'} animate-pulse`} />
          <div className="absolute top-0 left-0 w-full h-1 bg-pink-500/50 animate-[glitch-line_2s_infinite]" />
          <div className={`absolute top-1/4 left-0 w-full h-2 ${theme === 'cyan' ? 'bg-cyan-500/30' : theme === 'orange' ? 'bg-orange-500/30' : 'bg-emerald-500/30'} animate-[glitch-line_3s_infinite_reverse]`} />
          <div className="absolute top-3/4 left-0 w-full h-1 bg-white/40 animate-[glitch-line_1.5s_infinite]" />
        </div>
      )}
      {/* Background Elements */}
      <div className={`absolute inset-0 ${theme === 'cyan' ? 'bg-[radial-gradient(circle_at_bottom_right,rgba(88,28,135,0.25)_0%,transparent_60%)]' : theme === 'orange' ? 'bg-[radial-gradient(circle_at_bottom_right,rgba(154,52,18,0.25)_0%,transparent_60%)]' : 'bg-[radial-gradient(circle_at_bottom_right,rgba(6,95,70,0.25)_0%,transparent_60%)]'}`} />
      <StarField theme={theme} />
      <Nebula />
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className={`absolute inset-0 ${theme === 'cyan' ? 'bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)]' : theme === 'orange' ? 'bg-[linear-gradient(rgba(249,115,22,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.1)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)]'} bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]`} />
      </div>

      {/* Meteors */}
      <Meteor delay={2} theme={theme} />
      <Meteor delay={7} theme={theme} />
      <Meteor delay={12} theme={theme} />
      
      {/* Animated Ships */}
      <MotherShip />
      <SpaceTraffic />

      {/* Futuristic Frame */}
      <div className={`absolute inset-4 border ${theme === 'cyan' ? 'border-cyan-500/20' : 'border-orange-500/20'} pointer-events-none z-50`}>
        <div className={`absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-tl-3xl`} />
        <div className={`absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-tr-3xl`} />
        <div className={`absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-bl-3xl`} />
        <div className={`absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-br-3xl`} />
        
        {/* HUD Elements */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-8">
          <div className={`h-1 w-24 ${theme === 'cyan' ? 'bg-cyan-500/30' : 'bg-orange-500/30'} rounded-full`} />
          <div className="h-1 w-48 bg-pink-500/30 rounded-full" />
          <div className={`h-1 w-24 ${theme === 'cyan' ? 'bg-cyan-500/30' : 'bg-orange-500/30'} rounded-full`} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-start gap-8 max-w-4xl w-full px-4">
        {/* Title Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-left relative"
        >
          {/* Decorative Circle behind title */}
          <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-[140%] aspect-square border-2 ${theme === 'cyan' ? 'border-cyan-500/10' : 'border-orange-500/10'} rounded-full animate-[spin_30s_linear_infinite]`} />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[120%] aspect-square border border-pink-500/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
          
          <motion.h1 
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="font-michroma tracking-tighter leading-tight flex flex-col items-start relative group cursor-default"
          >
            {/* Background Depth Layer */}
            <div className="absolute inset-0 blur-2xl opacity-20 pointer-events-none select-none">
              <span className="text-4xl md:text-6xl text-pink-500 block">
                {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
              </span>
              <span className={`text-3xl md:text-5xl ${theme === 'cyan' ? 'text-cyan-500' : 'text-orange-500'} block`}>
                {tl('HORIZON', 'HORIZON')}
              </span>
            </div>

            <span className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-200 to-pink-500 drop-shadow-[0_0_15px_rgba(219,39,119,0.6)] relative z-10">
              <span className="absolute inset-0 shimmer-text opacity-70 pointer-events-none">
                {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
              </span>
              {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
            </span>
            <span className={`text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-white ${theme === 'cyan' ? 'via-cyan-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'via-orange-200 to-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]'} relative z-10`}>
              <span className="absolute inset-0 shimmer-text opacity-70 pointer-events-none">
                {tl('HORIZON', 'HORIZON')}
              </span>
              {tl('HORIZON', 'HORIZON')}
            </span>
            
            {/* Decorative underline that glows */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.5, duration: 1 }}
              className={`h-0.5 mt-2 z-10 ${theme === 'cyan' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)]'}`}
            />
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={`mt-6 ${theme === 'cyan' ? 'text-cyan-400/60' : 'text-orange-400/60'} font-orbitron tracking-[0.8em] text-[10px] md:text-xs uppercase`}
          >
            {tl('Galactic Delivery Service', 'Serviço de Entrega Galáctica')}
          </motion.p>
        </motion.div>

        {/* Menu Section */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`w-full max-w-md flex flex-col gap-4 p-8 bg-transparent backdrop-blur-sm border ${theme === 'cyan' ? 'border-cyan-500/5' : 'border-orange-500/5'} rounded-2xl relative`}
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div className={`w-full h-1 ${theme === 'cyan' ? 'bg-cyan-500/10' : 'bg-orange-500/10'} absolute top-0 animate-[scan_4s_linear_infinite]`} />
          </div>

          <MenuButton 
            label={tl('CONTINUE', 'CONTINUAR')} 
            icon={Play} 
            onClick={handleContinue} 
            disabled={!hasSave}
            theme={theme}
          />
          <MenuButton label={tl('CAMPAIGN', 'CAMPANHA')} icon={Rocket} onClick={() => handleStartGame(false)} theme={theme} />
          <MenuButton label={tl('SPEED RUN', 'SPEED RUN')} icon={Timer} onClick={() => setShowSpeedRunMenu(true)} theme={theme} />
          <MenuButton label={tl('OPTIONS', 'OPÇÕES')} icon={Settings} onClick={() => setShowOptions(true)} theme={theme} />
          <MenuButton label={tl('ACHIEVEMENTS', 'CONQUISTAS')} icon={Trophy} onClick={() => setShowAchievements(true)} theme={theme} />
          
          <div className={`mt-4 flex flex-col gap-1 text-[9px] font-mono ${theme === 'cyan' ? 'text-cyan-500/40' : 'text-orange-500/40'} uppercase tracking-widest`}>
            <div className="flex justify-between">
              <span>{tl('System: Online', 'Sistema: Online')}</span>
              <span>{tl('Signal: Stable', 'Sinal: Estável')}</span>
            </div>
            <span>User: {playerName || 'venonleo@gmail.com'}</span>
          </div>
        </motion.div>
      </div>

      {/* Name Prompt Modal - Removed as it's now in IntroNarrative */}

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border-2 border-cyan-500 rounded-2xl p-8 relative overflow-hidden"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-1 bg-cyan-500/5 absolute top-0 animate-[scan_4s_linear_infinite]" />
              </div>

              <button 
                onClick={() => setShowOptions(false)}
                className="absolute top-4 right-4 text-cyan-500 hover:text-pink-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest border-b border-cyan-500/30 pb-4">
                {tl('OPTIONS', 'OPÇÕES')}
              </h2>

              <div className="space-y-8">
                {/* Music */}
                <div className="space-y-4">
                  <h3 className="text-xs font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Music className="w-4 h-4" /> {tl('MUSIC', 'MÚSICA')}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMusicOn(true)}
                      className={`flex-1 py-2 rounded font-orbitron text-[10px] border transition-all ${musicOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('ON', 'LIGADO')}
                    </button>
                    <button 
                      onClick={() => setMusicOn(false)}
                      className={`flex-1 py-2 rounded font-orbitron text-[10px] border transition-all ${!musicOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('OFF', 'DESLIGADO')}
                    </button>
                  </div>
                </div>

                {/* SFX */}
                <div className="space-y-4">
                  <h3 className="text-xs font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> {tl('SOUND EFFECTS', 'EFEITOS SONOROS')}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSfxOn(true)}
                      className={`flex-1 py-2 rounded font-orbitron text-[10px] border transition-all ${sfxOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('ON', 'LIGADO')}
                    </button>
                    <button 
                      onClick={() => setSfxOn(false)}
                      className={`flex-1 py-2 rounded font-orbitron text-[10px] border transition-all ${!sfxOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('OFF', 'DESLIGADO')}
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-4">
                  <h3 className="text-xs font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {tl('LANGUAGE', 'IDIOMA')}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setLanguage('pt')}
                      className={`w-full py-2 rounded font-orbitron text-[10px] border transition-all ${language === 'pt' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('PORTUGUESE', 'PORTUGUÊS')}
                    </button>
                    <button 
                      onClick={() => setLanguage('en')}
                      className={`w-full py-2 rounded font-orbitron text-[10px] border transition-all ${language === 'en' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('ENGLISH', 'INGLÊS')}
                    </button>
                  </div>
                </div>

                {/* Codes Button */}
                <div className="pt-4 border-t border-cyan-500/30">
                  <button 
                    onClick={() => setShowCodesModal(true)}
                    className="w-full py-4 bg-slate-800/40 border border-cyan-500/30 text-cyan-400 font-orbitron tracking-widest rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500 transition-all uppercase flex items-center justify-center gap-3 group"
                  >
                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" /> {tl('CODES', 'CÓDIGOS')}
                  </button>
                </div>

                {/* Reset Progress */}
                <div className="space-y-4 pt-4 border-t border-cyan-500/20">
                  <button 
                    onClick={() => {
                      setShowResetConfirm(true);
                    }}
                    className="w-full py-3 rounded font-orbitron text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/50 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> {tl('RESET PROGRESS', 'RESETAR PROGRESSO')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Run Menu Modal */}
      <AnimatePresence>
        {showSpeedRunMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-pink rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />
              
              <button 
                onClick={() => setShowSpeedRunMenu(false)}
                className="absolute top-4 right-4 text-pink-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest text-center neon-text-pink">
                {tl('SPEED RUN MODE', 'MODO SPEED RUN')}
              </h2>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowSpeedRunMenu(false);
                    setShowSpeedRunConfirm(true);
                  }}
                  className="w-full py-4 bg-pink-600/20 border border-pink-500 text-white font-orbitron tracking-widest rounded-lg hover:bg-pink-600 transition-all uppercase flex items-center justify-center gap-3"
                >
                  <Rocket className="w-5 h-5" /> {tl('NEW SPEED RUN', 'NOVA SPEED RUN')}
                </button>
                
                <button 
                  onClick={() => {
                    setShowLocalRecords(true);
                  }}
                  className="w-full py-4 bg-slate-800/40 border border-cyan-500/30 text-white font-orbitron tracking-widest rounded-lg hover:border-cyan-500 transition-all uppercase flex items-center justify-center gap-3"
                >
                  <Trophy className="w-5 h-5 text-yellow-400" /> {tl('LOCAL RECORDS', 'RECORDES LOCAIS')}
                </button>

                <button 
                  onClick={() => {
                    setShowOnlineRecords(true);
                  }}
                  className="w-full py-4 bg-slate-800/40 border border-cyan-500/30 text-white/50 font-orbitron tracking-widest rounded-lg transition-all uppercase flex items-center justify-center gap-3 cursor-not-allowed"
                >
                  <Globe className="w-5 h-5" /> {tl('ONLINE RECORDS (SOON)', 'RECORDES ONLINE (FUTURAMENTE)')}
                </button>

                <button 
                  onClick={() => {
                    setShowClearRecordsConfirm(true);
                  }}
                  className="w-full py-4 bg-rose-900/20 border border-rose-500/30 text-rose-400 font-orbitron tracking-widest rounded-lg hover:bg-rose-900/40 hover:border-rose-500 transition-all uppercase flex items-center justify-center gap-3"
                >
                  <Trash2 className="w-5 h-5" /> {tl('CLEAR LOCAL RECORDS', 'APAGAR RECORDES LOCAIS')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local Records Modal */}
      <AnimatePresence>
        {showLocalRecords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-panel neon-border-cyan rounded-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowLocalRecords(false)}
                className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest text-center neon-text-cyan">
                {tl('LOCAL RECORDS', 'RECORDES LOCAIS')}
              </h2>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                {localRecords.length === 0 ? (
                  <p className="text-center text-slate-500 font-orbitron py-8 uppercase tracking-widest">
                    {tl('No records found', 'Nenhum recorde encontrado')}
                  </p>
                ) : (
                  localRecords.slice(0, 10).map((record, index) => {
                    const isTop3 = index < 3;
                    const trophyColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : 'text-amber-600';
                    const glowClass = index === 0 ? 'shadow-[0_0_15px_rgba(250,204,21,0.4)] border-yellow-400/50' : 
                                     index === 1 ? 'shadow-[0_0_15px_rgba(203,213,225,0.3)] border-slate-300/50' : 
                                     index === 2 ? 'shadow-[0_0_15px_rgba(217,119,6,0.3)] border-amber-600/50' : 
                                     'border-white/5';
                    
                    return (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 bg-slate-800/40 border rounded-lg relative group transition-all duration-300 ${glowClass} ${isTop3 ? 'hover:scale-[1.02]' : ''}`}
                      >
                        {isTop3 && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${index === 0 ? 'from-yellow-400/5' : index === 1 ? 'from-slate-300/5' : 'from-amber-600/5'} to-transparent pointer-events-none rounded-lg`} />
                        )}
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="flex flex-col items-center justify-center w-10">
                            {isTop3 ? (
                              <motion.div
                                animate={{ 
                                  filter: ['drop-shadow(0 0 2px currentColor)', 'drop-shadow(0 0 8px currentColor)', 'drop-shadow(0 0 2px currentColor)'],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className={trophyColor}
                              >
                                <Trophy className="w-6 h-6" />
                              </motion.div>
                            ) : (
                              <span className="text-lg font-orbitron font-bold text-slate-500">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-orbitron text-sm uppercase tracking-wider flex items-center gap-2">
                              {record.name}
                              {index === 0 && <span className="text-[8px] bg-yellow-400 text-black px-1 rounded font-bold animate-pulse">CHAMPION</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{record.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <span className={`font-orbitron text-sm ${index === 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            {formatTime(record.time)}
                          </span>
                          <button 
                            onClick={() => handleDeleteRecord(index)}
                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-20 group-hover:opacity-100"
                            title={tl('Delete record', 'Apagar recorde')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Records Modal (Placeholder) */}
      <AnimatePresence>
        {showOnlineRecords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-pink rounded-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowOnlineRecords(false)}
                className="absolute top-4 right-4 text-pink-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-pink">
                {tl('ONLINE RECORDS', 'RECORDES ONLINE')}
              </h2>

              <div className="text-center py-12 space-y-4">
                <Globe className="w-16 h-16 text-pink-500/50 mx-auto animate-pulse" />
                <p className="text-pink-400 font-orbitron text-sm uppercase tracking-widest">
                  {tl('Coming Soon in v3.0', 'Em breve na v3.0')}
                </p>
                <p className="text-slate-500 text-xs font-orbitron">
                  {tl('Global leaderboards are under development.', 'Placares globais estão em desenvolvimento.')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Records Confirmation Modal */}
      <AnimatePresence>
        {showClearRecordsConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-rose rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-rose">
                {tl('CLEAR ALL RECORDS', 'APAGAR TODOS OS RECORDES')}
              </h2>

              <div className="space-y-4 text-center mb-8">
                <p className="text-rose-400 font-orbitron text-sm leading-relaxed">
                  {tl('This will permanently delete ALL your speed run records. This action cannot be undone.', 'Isso excluirá permanentemente TODOS os seus recordes de speed run. Esta ação não pode ser desfeita.')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleClearRecords}
                  className="w-full py-4 bg-rose-600 text-white font-orbitron font-bold tracking-widest rounded-lg hover:bg-white hover:text-rose-600 transition-all uppercase"
                >
                  {tl('CONFIRM & CLEAR', 'CONFIRMAR E APAGAR')}
                </button>
                <button 
                  onClick={() => setShowClearRecordsConfirm(false)}
                  className="w-full py-3 text-white/40 font-orbitron text-[10px] hover:text-white transition-colors uppercase"
                >
                  {tl('CANCEL', 'CANCELAR')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Progress Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-rose rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-rose">
                {tl('RESET PROGRESS', 'RESETAR PROGRESSO')}
              </h2>

              <div className="space-y-4 text-center mb-8">
                <p className="text-rose-400 font-orbitron text-sm leading-relaxed">
                  {tl('This will permanently delete all your progress, ships, and upgrades. This action cannot be undone.', 'Isso excluirá permanentemente todo o seu progresso, naves e melhorias. Esta ação não pode ser desfeita.')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleResetProgress}
                  className="w-full py-4 bg-rose-600 text-white font-orbitron font-bold tracking-widest rounded-lg hover:bg-white hover:text-rose-600 transition-all uppercase"
                >
                  {tl('CONFIRM & RESET', 'CONFIRMAR E RESETAR')}
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3 text-white/40 font-orbitron text-[10px] hover:text-white transition-colors uppercase"
                >
                  {tl('CANCEL', 'CANCELAR')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Run Confirmation Modal */}
      <AnimatePresence>
        {showSpeedRunConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-pink rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-pink">
                {tl('SPEED RUN MODE', 'MODO SPEED RUN')}
              </h2>

              <div className="space-y-4 text-center mb-8">
                <p className="text-cyan-400 font-orbitron text-sm leading-relaxed">
                  {tl('Start a new game focused on Route 1.', 'Inicie uma nova partida focada na Rota 1.')}
                </p>
                
                <div className="py-6 border-y border-white/5 space-y-4">
                  <p className="text-white/60 text-[10px] font-orbitron uppercase tracking-[0.2em]">{tl('OBJECTIVE:', 'OBJETIVO:')}</p>
                  <p className="text-white text-sm font-orbitron leading-relaxed uppercase tracking-wider">
                    {tl('Buy, Unlock, Upgrade, Automate...', 'Compre, Desbloqueie, Melhore, automatize...')}
                  </p>
                  <p className="text-cyan-400 text-xs font-orbitron font-bold uppercase tracking-widest animate-pulse">
                    {tl('Rule Route 1 as fast as you can.', 'Reine na Rota 1 o mais rápido que puder.')}
                  </p>
                </div>

                <p className="text-pink-400 font-orbitron text-xs">
                  ⏱️ {tl('The game ends when everything is completed.', 'O jogo termina ao completar tudo.')}
                </p>
                <p className="text-white font-orbitron text-xs italic">
                  {tl('Be fast. Every second counts.', 'Seja rápido. Cada segundo conta.')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowSpeedRunConfirm(false);
                    setShowOptions(false);
                    handleStartGame(true);
                  }}
                  className="w-full py-4 bg-pink-600 text-white font-orbitron font-bold tracking-widest rounded-lg hover:bg-white hover:text-pink-600 transition-all uppercase"
                >
                  {tl('CONFIRM & START', 'CONFIRMAR E INICIAR')}
                </button>
                <button 
                  onClick={() => setShowSpeedRunConfirm(false)}
                  className="w-full py-3 text-white/40 font-orbitron text-[10px] hover:text-white transition-colors uppercase"
                >
                  {tl('CANCEL', 'CANCELAR')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Codes Modal */}
      <AnimatePresence>
        {showCodesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                x: isShaking ? [0, -5, 5, -5, 5, 0] : 0
              }}
              transition={{ 
                x: isShaking ? { duration: 0.1, repeat: 10 } : { duration: 0.3 }
              }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full ${codesView === 'list' ? 'max-w-6xl' : 'max-w-lg'} glass-panel neon-border-cyan rounded-2xl p-8 relative overflow-hidden transition-all duration-500`}
            >
              <button 
                onClick={() => {
                  setShowCodesModal(false);
                  setCodesView('input');
                }}
                className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest text-center neon-text-cyan">
                {codesView === 'input' ? tl('CODES SYSTEM', 'SISTEMA DE CÓDIGOS') : tl('DISCOVERED CODES', 'CÓDIGOS DESCOBERTOS')}
              </h2>

              {isSpeedRun && (
                <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-lg text-center">
                  <p className="text-rose-500 font-orbitron text-[10px] uppercase tracking-widest">
                    {tl('CODES DISABLED IN SPEED RUN MODE', 'CÓDIGOS DESCOBERTOS DESATIVADOS NO MODO SPEED RUN')}
                  </p>
                </div>
              )}

              <div className="relative min-h-[250px]">
                <AnimatePresence mode="wait">
                  {codesView === 'input' ? (
                    <motion.div
                      key="input-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      {/* Input Section */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-widest block">
                          {tl('INSERT CODE', 'INSERIR CÓDIGO')}
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                            placeholder="********"
                            className="flex-1 bg-slate-800 border border-cyan-500/30 rounded px-4 py-3 text-white font-orbitron text-sm focus:outline-none focus:border-cyan-500 transition-colors uppercase"
                          />
                          <button 
                            onClick={handleActivateCode}
                            className="px-6 bg-cyan-500 text-black font-orbitron font-bold tracking-widest rounded hover:bg-white transition-all uppercase"
                          >
                            {tl('ACTIVATE', 'ATIVAR')}
                          </button>
                        </div>
                        <AnimatePresence mode="wait">
                          {codeError && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-rose-500 font-orbitron text-[10px] uppercase tracking-widest"
                            >
                              {codeError}
                            </motion.p>
                          )}
                          {codeSuccess && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-emerald-500 font-orbitron text-[10px] uppercase tracking-widest"
                            >
                              {codeSuccess}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Arrow to List View */}
                      {unlockedCodes.length > 0 && (
                        <div className="flex justify-end mt-8">
                          <button 
                            onClick={() => setCodesView('list')}
                            className="flex items-center gap-2 text-cyan-500 hover:text-white transition-all group"
                          >
                            <span className="text-[10px] font-orbitron uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              {tl('DISCOVERED', 'DESCOBERTOS')}
                            </span>
                            <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-500 group-hover:bg-cyan-500/10 transition-all">
                              <ChevronRight className="w-6 h-6" />
                            </div>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <button 
                          onClick={() => setCodesView('input')}
                          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-[10px] font-orbitron text-white/40 uppercase tracking-[0.3em]">
                          {tl('BACK TO INPUT', 'VOLTAR AO INÍCIO')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {unlockedCodes.map(code => {
                          const info = AVAILABLE_CODES.find(c => c.code === code);
                          const isActive = activeCodes[code];
                          
                          let colorClass = 'text-cyan-400';
                          let glowClass = 'shadow-[0_0_20px_rgba(6,182,212,0.1)]';
                          let borderClass = 'border-cyan-500/40';
                          let bgClass = 'bg-cyan-500/5';
                          let dotClass = 'bg-cyan-400';
                          let toggleBorderClass = 'border-cyan-500';
                          let toggleBgClass = 'bg-cyan-500/20';
                          let toggleThumbClass = 'bg-cyan-400';
                          let toggleShadowClass = 'shadow-[0_0_15px_rgba(6,182,212,0.5)]';

                          if (isActive) {
                            if (ECONOMIC_CODES.includes(code)) {
                              colorClass = 'text-green-400';
                              glowClass = 'shadow-[0_0_20px_rgba(74,222,128,0.1)]';
                              borderClass = 'border-green-500/40';
                              bgClass = 'bg-green-500/5';
                              dotClass = 'bg-green-400';
                              toggleBorderClass = 'border-green-500';
                              toggleBgClass = 'bg-green-500/20';
                              toggleThumbClass = 'bg-green-400';
                              toggleShadowClass = 'shadow-[0_0_15px_rgba(74,222,128,0.5)]';
                            } else if (VISUAL_CODES.includes(code)) {
                              colorClass = 'text-yellow-400';
                              glowClass = 'shadow-[0_0_20px_rgba(250,204,21,0.1)]';
                              borderClass = 'border-yellow-500/40';
                              bgClass = 'bg-yellow-500/5';
                              dotClass = 'bg-yellow-400';
                              toggleBorderClass = 'border-yellow-500';
                              toggleBgClass = 'bg-yellow-500/20';
                              toggleThumbClass = 'bg-yellow-400';
                              toggleShadowClass = 'shadow-[0_0_15px_rgba(250,204,21,0.5)]';
                            } else if (LANDING_CODES.includes(code)) {
                              colorClass = 'text-blue-400';
                              glowClass = 'shadow-[0_0_20px_rgba(96,165,250,0.1)]';
                              borderClass = 'border-blue-500/40';
                              bgClass = 'bg-blue-500/5';
                              dotClass = 'bg-blue-400';
                              toggleBorderClass = 'border-blue-500';
                              toggleBgClass = 'bg-blue-500/20';
                              toggleThumbClass = 'bg-blue-400';
                              toggleShadowClass = 'shadow-[0_0_15px_rgba(96,165,250,0.5)]';
                            }
                          } else {
                            colorClass = 'text-rose-400';
                            glowClass = 'shadow-[0_0_20px_rgba(244,63,94,0.1)]';
                            borderClass = 'border-rose-500/40';
                            bgClass = 'bg-rose-500/5';
                            dotClass = 'bg-rose-400';
                            toggleBorderClass = 'border-rose-500';
                            toggleBgClass = 'bg-rose-500/20';
                            toggleThumbClass = 'bg-rose-400';
                            toggleShadowClass = 'shadow-[0_0_15px_rgba(244,63,94,0.5)]';
                          }

                          return (
                            <div 
                              key={code} 
                              className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-500 group ${bgClass} ${borderClass} ${glowClass}`}
                            >
                              {/* Background Glow */}
                              <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${isActive ? (ECONOMIC_CODES.includes(code) ? 'bg-green-500' : VISUAL_CODES.includes(code) ? 'bg-yellow-500' : 'bg-blue-500') : 'bg-rose-500'}`} />
                              
                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`} />
                                    <p className={`font-orbitron text-sm uppercase tracking-wider transition-colors ${colorClass}`}>
                                      {info?.name || code}
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-orbitron uppercase tracking-widest mt-2 leading-relaxed">
                                    {tl(info?.description.en || '', info?.description.pt || '')}
                                  </p>
                                </div>

                                <button 
                                  onClick={() => toggleCode(code)}
                                  className={`relative w-20 h-10 rounded-full border-2 transition-all duration-500 flex items-center px-1 ${toggleBorderClass} ${toggleBgClass} ${toggleShadowClass}`}
                                >
                                  <motion.div 
                                    animate={{ x: isActive ? 40 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${toggleThumbClass}`}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-white/40" />
                                  </motion.div>
                                  <span className={`absolute ${isActive ? 'left-3' : 'right-3'} text-[9px] font-orbitron font-bold tracking-tighter`}>
                                    {isActive ? 'ON' : 'OFF'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AchievementsModal 
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlockedAchievements={unlockedAchievements}
        achievementProgress={achievementProgress}
        language={language}
        theme={theme}
      />

      {/* Footer Accents - Removed as per user request */}


      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes glitch-line {
          0% { top: -10%; transform: skewY(0deg); }
          50% { top: 110%; transform: skewY(2deg); }
          100% { top: -10%; transform: skewY(0deg); }
        }
        @keyframes glitch-bg {
          0% { background-color: #050510; }
          95% { background-color: #050510; }
          96% { background-color: #100510; }
          97% { background-color: #051010; }
          98% { background-color: #101005; }
          100% { background-color: #050510; }
        }
      `}</style>
    </main>
  );
}
