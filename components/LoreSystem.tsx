'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export const RobotVisual = React.memo(({ theme = 'cyan' }: { theme?: 'cyan' | 'orange' | 'purple' }) => {
  const colorClass = theme === 'orange' ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : theme === 'purple' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]';
  const eyeClass = theme === 'orange' ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,1)]' : theme === 'purple' ? 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,1)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]';
  const mouthClass = theme === 'orange' ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : theme === 'purple' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]';
  const scanlineColor = theme === 'orange' ? 'rgba(249,115,22,0.05)' : theme === 'purple' ? 'rgba(168,85,247,0.05)' : 'rgba(6,182,212,0.05)';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-48 h-48 flex flex-col items-center justify-center mb-8"
    >
      <div className={`relative w-24 h-24 bg-slate-800 border-4 ${colorClass} rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden`}>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,var(--scanline-color)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_2s_linear_infinite]" style={{ '--scanline-color': scanlineColor } as any} />
        
        <div className="flex gap-4 relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 ${eyeClass} rounded-full`} 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className={`w-3 h-3 ${eyeClass} rounded-full`} 
          />
        </div>
        
        <div className="w-12 h-1.5 bg-slate-900/50 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            animate={{ width: ['20%', '80%', '40%', '90%', '30%'], x: ['-10%', '10%', '-5%', '5%', '0%'] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            className={`h-full ${mouthClass}`} 
          />
        </div>

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-slate-600">
          <motion.div 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
          />
        </div>
      </div>
      
      <div className={`w-32 h-8 bg-slate-900 border-x-4 border-b-4 ${colorClass.split(' ')[0]} rounded-b-3xl mt-[-4px] relative shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}>
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-950 rounded-full border border-white/5" />
      </div>

      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-4 border border-white/5 rounded-full z-[-1]"
      />
    </motion.div>
  );
});

RobotVisual.displayName = 'RobotVisual';

const LoreBackground = React.memo(() => {
  const stars = useMemo(() => {
    return [...Array(100)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
          }}
        />
      ))}
    </div>
  );
});

LoreBackground.displayName = 'LoreBackground';

interface LoreScreenProps {
  lines: string[];
  currentIndex: number;
  onNext: () => void;
  onComplete: () => void;
  language: 'pt' | 'en';
  theme: 'orange' | 'purple';
  completeText: string;
  videoSrc?: string;
  imageSrc?: string;
}

export const LoreScreen = React.memo(({ 
  lines, 
  currentIndex, 
  onNext, 
  onComplete, 
  language, 
  theme,
  completeText,
  videoSrc,
  imageSrc
}: LoreScreenProps) => {
  const isTitle = lines[currentIndex].startsWith('Ano') || lines[currentIndex].startsWith('Prólogo') || lines[currentIndex].startsWith('---');
  const accentClass = theme === 'purple' ? 'text-purple-400' : 'text-orange-400';
  const borderClass = theme === 'purple' ? 'border-purple-500/30' : 'border-orange-500/30';
  const bgClass = theme === 'purple' ? 'bg-purple-500/10 hover:bg-purple-500/20' : 'bg-orange-500/10 hover:bg-orange-500/20';
  const btnAccent = theme === 'purple' ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]';
  const textContainerClass = theme === 'purple' ? 'text-purple-100/90' : 'text-orange-100/90';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-8 overflow-hidden"
    >
      <LoreBackground />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className="flex flex-col items-center mb-4">
          {videoSrc ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative w-[300px] h-[300px] rounded-[3rem] overflow-hidden border-4 ${theme === 'purple' ? 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]' : 'border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.3)]'} bg-black mb-8`}
            >
              <video 
                src={videoSrc}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          ) : imageSrc ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative w-[300px] h-[300px] rounded-[3rem] overflow-hidden border-4 ${theme === 'purple' ? 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]' : 'border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.3)]'} bg-black mb-8`}
            >
              <img 
                src={imageSrc}
                alt="Narrative Visual"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          ) : (
            <RobotVisual theme={theme} />
          )}
          <div className={`h-px w-full bg-gradient-to-r from-transparent ${theme === 'purple' ? 'via-purple-500/50' : 'via-orange-500/50'} to-transparent`} />
        </div>

        <div className="min-h-[250px] space-y-6 font-mono text-lg lg:text-xl leading-relaxed text-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
              transition={{ duration: 0.6 }}
              className={`${textContainerClass} ${isTitle ? `text-2xl lg:text-3xl font-orbitron font-black ${accentClass} uppercase tracking-[0.3em]` : ""}`}
            >
              {lines[currentIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-white/10 px-4">
          <div className={`text-base font-orbitron ${accentClass}/50 uppercase tracking-[0.3em]`}>
            {currentIndex + 1} / {lines.length}
          </div>
          
          {currentIndex < lines.length - 1 ? (
            <button
              onClick={onNext}
              className={`px-8 py-3 ${bgClass} border ${borderClass} ${accentClass} font-orbitron text-[14px] tracking-widest rounded-lg transition-all flex items-center gap-2 group`}
            >
              {language === 'pt' ? 'PRÓXIMO' : 'NEXT'}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className={`px-10 py-4 ${btnAccent} text-white font-orbitron font-black text-lg tracking-[0.4em] rounded-xl transition-all uppercase animate-pulse-glow shadow-xl`}
            >
              {completeText}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

LoreScreen.displayName = 'LoreScreen';
