'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Info, Play, Circle, Disc, ImageOff } from 'lucide-react';

interface ArcadeCardProps {
  titulo: string;
  descricao: string;
  corPrimaria: string;
  corSecundaria: string;
  temaVisual: 'sci-fi' | 'war' | 'puzzle' | 'nebula';
  status: string;
  onPlay: () => void;
  onInfo: () => void;
  screenshot?: string;
  language?: 'pt' | 'en';
}

const ArcadeCard: React.FC<ArcadeCardProps> = ({
  titulo,
  descricao,
  corPrimaria,
  corSecundaria,
  temaVisual,
  status,
  onPlay,
  onInfo,
  screenshot,
  language = 'pt'
}) => {
  const [imageError, setImageError] = useState(!screenshot);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isAvailable = status.toUpperCase().includes('DISPONÍVEL') || status.toUpperCase().includes('AVAILABLE');

  useEffect(() => {
    if (screenshot) {
      const img = new Image();
      img.src = screenshot;
      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(false);
      };
    }
  }, [screenshot]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -15, scale: 1.02 }}
      className={`relative group h-[580px] w-full flex flex-col pt-12 pb-6 ${!isAvailable ? 'grayscale opacity-70' : ''}`}
    >
      {/* CABINET OUTER BODY (SIDE PANELS) */}
      <div 
        className="absolute inset-x-0 top-0 bottom-0 border-x-[16px] rounded-t-xl"
        style={{ 
          borderColor: `${corSecundaria}88`,
          backgroundColor: '#050508',
          boxShadow: `inset 0 0 60px ${corPrimaria}15`,
        }}
      >
        {/* SIDE NEON STRIPS - More industrial look */}
        <div className="absolute left-[-18px] top-24 bottom-16 w-3 rounded-r-lg blur-[1px] opacity-80" style={{ backgroundColor: corPrimaria, boxShadow: `0 0 20px ${corPrimaria}` }}>
          <div className="w-full h-full bg-gradient-to-r from-white/30 to-transparent" />
        </div>
        <div className="absolute right-[-18px] top-24 bottom-16 w-3 rounded-l-lg blur-[1px] opacity-80" style={{ backgroundColor: corPrimaria, boxShadow: `0 0 20px ${corPrimaria}` }}>
          <div className="w-full h-full bg-gradient-to-l from-white/30 to-transparent" />
        </div>
      </div>

      {/* TOP MARQUEE (ILLUMINATED TITLE) */}
      <div className="absolute top-0 inset-x-[-10px] h-24 z-20">
        {/* Marquee Box */}
        <div 
          className="h-full w-full border-4 border-white/20 bg-black/90 flex items-center justify-center relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          style={{ borderColor: `${corPrimaria}88` }}
        >
          {/* Marquee Backlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent animate-pulse" />
          <div className="absolute inset-0 blur-[30px] opacity-20" style={{ backgroundColor: corPrimaria }} />
          
          {/* Marquee Content */}
          <div className="relative px-6 py-1 flex flex-col items-center">
             <div className="text-[10px] font-orbitron font-black tracking-[0.5em] mb-1 opacity-60" style={{ color: corPrimaria }}>
               {status}
             </div>
             <h3 className="text-xl font-orbitron font-black text-white/90 uppercase tracking-tighter text-shadow-glow">
               {titulo}
             </h3>
          </div>

          {/* Marquee Glass Glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* MONITOR SECTION (CRN INSET) */}
      <div className="relative mt-16 px-6 flex-1 flex flex-col z-10">
        <div 
          className="relative flex-1 bg-black rounded-lg border-[10px] border-slate-900 shadow-[inset_0_0_60px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center"
          style={{ borderColor: '#15151f' }}
        >
          {/* Screen Content (Screenshot) */}
          {screenshot && imageLoaded && !imageError ? (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] group-hover:scale-110 opacity-70 group-hover:opacity-90"
              style={{ backgroundImage: `url(${screenshot})` }}
            />
          ) : (
            /* PIXEL ART FALLBACK / SEM IMAGEM */
            <div className="flex flex-col items-center justify-center p-4">
              <div className="mb-2 opacity-20">
                <ImageOff className="w-10 h-10 text-white" />
              </div>
              <div 
                className="text-center font-orbitron font-black uppercase text-[10px] tracking-[0.2em] opacity-40 px-4 py-2 border border-white/5 bg-white/5 rounded"
                style={{ color: corPrimaria }}
              >
                {language === 'pt' ? 'SEM IMAGEM' : 'NO IMAGE'}
              </div>
              <div className="mt-4 text-[8px] font-mono opacity-20 uppercase tracking-tighter">
                {titulo}
              </div>
            </div>
          )}

          {/* Monitor Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanlines */}
            <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_3px,3px_100%]" />
            {/* CRT Distortion / Curved Feel Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
            {/* Screen Glare */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
          </div>

          {/* Description Overlay (Only on hover or idle) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/60 backdrop-blur-sm opacity-100 group-hover:opacity-0 transition-opacity duration-500">
             <div className="mb-4">
               <Disc className="w-12 h-12 animate-spin-slow" style={{ color: corPrimaria }} />
             </div>
             <p className="text-xs text-white/80 font-medium leading-relaxed font-orbitron uppercase tracking-widest max-w-[200px]">
               {descricao}
             </p>
          </div>
        </div>
      </div>

      {/* CONTROL DECK (SLANTED AREA) */}
      <div className="relative z-10 px-4 mt-[-4px]">
        <div 
          className="h-32 bg-slate-900 border-x-4 border-b-8 border-t-[10px] border-slate-800 shadow-xl flex flex-col relative preserve-3d"
          style={{ 
            backgroundColor: '#0d0d14', 
            borderColor: '#1e1e2d',
            transform: 'perspective(1000px) rotateX(25deg)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.05)'
          }}
        >
          {/* Deck Texture / Screws */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner" />

          {/* Controls Container */}
          <div className="flex-1 flex items-center justify-between px-6 pt-2">
            {/* Joystick Simulation */}
            <div className="relative group/joy">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 shadow-inner" />
              <motion.div 
                animate={{ rotateY: [0, 10, -10, 0], rotateX: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-600 shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/20" 
              />
            </div>

            {/* Buttons UI */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 border border-white/20 shadow-md animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-emerald-500 border border-white/20 shadow-md" />
              <div className="w-6 h-6 rounded-full bg-yellow-500 border border-white/20 shadow-md" />
            </div>
            
            {/* Info Btn */}
            <button 
              onClick={(e) => { e.stopPropagation(); onInfo(); }}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Info className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* MAIN PLAY BUTTON (PHYSICAL ARCADE STYLE) */}
          <div className="px-6 pb-4">
            <button
               onClick={(e) => { e.stopPropagation(); isAvailable && onPlay(); }}
               disabled={!isAvailable}
               className={`w-full relative group/btn ${!isAvailable ? 'cursor-not-allowed grayscale' : ''}`}
            >
              <div 
                className="absolute inset-x-0 bottom-[-4px] h-full rounded-lg bg-black/40 blur-sm group-hover/btn:blur-md transition-all"
              />
              <div 
                className="relative py-3 rounded-lg font-orbitron font-black text-white uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 border-t-2 border-white/30 active:translate-y-1 active:shadow-none shadow-[0_6px_0_rgba(0,0,0,0.5)]"
                style={{ backgroundColor: corPrimaria }}
              >
                <Play className="w-5 h-5 fill-current" />
                {language === 'pt' ? 'INICIAR' : 'PLAY'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CABINET BASE / CHASSIS */}
      <div className="px-12 mt-[-12px]">
        <div className="h-16 bg-black border-x-8 border-slate-900 flex items-center justify-center relative shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Internal Bracing Visual */}
          <div className="absolute inset-x-2 top-0 h-[1px] bg-white/10" />
          
          {/* Coin Entry and Return */}
          <div className="absolute inset-x-0 bottom-2 flex justify-around px-8">
             <div className="flex gap-3">
               <div className="w-10 h-12 border border-white/5 bg-slate-900 rounded-sm flex items-center justify-center shadow-inner group/coin">
                  <div className="w-1.5 h-7 bg-black rounded-full border border-white/10 group-hover/coin:border-yellow-500/50 transition-colors" />
               </div>
               <div className="w-10 h-12 border border-white/5 bg-slate-900 rounded-sm flex items-center justify-center shadow-inner opacity-40">
                  <div className="w-1.5 h-7 bg-black rounded-full border border-white/10" />
               </div>
             </div>
             {/* Coin Return bin */}
             <div className="w-14 h-10 border-2 border-slate-800 bg-black/40 rounded shadow-inner self-end relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-white/5" />
                <div className="w-full h-full bg-gradient-to-b from-transparent to-black/60" />
             </div>
          </div>
          {/* Bottom Ground Glow Shadow */}
          <div className="absolute -bottom-4 inset-x-4 h-6 blur-2xl opacity-40" style={{ backgroundColor: corPrimaria }} />
        </div>
      </div>

      {/* EXTERNAL GLOW EFFECT */}
      <div className="absolute inset-0 -z-10 blur-[80px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: corPrimaria }} />
    </motion.div>
  );
};

export default ArcadeCard;
