'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Info, Play, ImageOff, LockKeyhole } from 'lucide-react';

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

const visualBackplates: Record<ArcadeCardProps['temaVisual'], string> = {
  'sci-fi': 'radial-gradient(circle at 50% 20%, rgba(34,211,238,0.22), transparent 36%), linear-gradient(180deg, rgba(8,13,22,0.95), rgba(0,0,0,0.98))',
  war: 'radial-gradient(circle at 50% 18%, rgba(239,68,68,0.24), transparent 38%), linear-gradient(180deg, rgba(23,7,7,0.95), rgba(0,0,0,0.98))',
  puzzle: 'radial-gradient(circle at 50% 18%, rgba(251,191,36,0.22), transparent 38%), linear-gradient(180deg, rgba(22,17,7,0.95), rgba(0,0,0,0.98))',
  nebula: 'radial-gradient(circle at 50% 18%, rgba(139,92,246,0.22), transparent 38%), linear-gradient(180deg, rgba(8,12,28,0.95), rgba(0,0,0,0.98))',
};

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
  language = 'pt',
}) => {
  const [imageError, setImageError] = useState(!screenshot);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isAvailable = status.toUpperCase().includes('DISPONÍVEL') || status.toUpperCase().includes('AVAILABLE');

  useEffect(() => {
    setImageLoaded(false);
    setImageError(!screenshot);

    if (!screenshot) return;
    const img = new Image();
    img.src = screenshot;
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageError(true);
    };
  }, [screenshot]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={isAvailable ? { y: -10, rotateX: 1.5, rotateY: -2, scale: 1.02 } : { y: -4 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className={`relative h-[500px] w-full select-none overflow-visible ${isAvailable ? '' : 'opacity-75 grayscale-[0.55]'}`}
      style={{ perspective: 1200 }}
    >
      <div
        className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-[55px] transition-opacity duration-500 group-hover:opacity-35"
        style={{ background: corPrimaria }}
      />

      <div className="absolute inset-x-4 bottom-0 h-16 rounded-[50%] bg-black/80 blur-xl" />

      <div className="relative mx-auto h-full w-full max-w-[238px]">
        <div
          className="absolute inset-x-4 top-20 bottom-12 rounded-b-[1.6rem] border-x-[14px] border-b-[18px] bg-[#05050a] shadow-[inset_0_0_45px_rgba(255,255,255,0.04),0_28px_44px_rgba(0,0,0,0.65)]"
          style={{ borderColor: `${corSecundaria}b8` }}
        />

        <div
          className="absolute left-0 top-28 bottom-16 w-3 rounded-r-xl opacity-85"
          style={{ background: corPrimaria, boxShadow: `0 0 18px ${corPrimaria}` }}
        />
        <div
          className="absolute right-0 top-28 bottom-16 w-3 rounded-l-xl opacity-85"
          style={{ background: corPrimaria, boxShadow: `0 0 18px ${corPrimaria}` }}
        />

        <div
          className="absolute inset-x-[-2px] top-0 z-20 h-[92px] overflow-hidden rounded-t-xl border-[3px] bg-black shadow-[0_14px_28px_rgba(0,0,0,0.65)]"
          style={{ borderColor: `${corPrimaria}b8` }}
        >
          <div className="absolute inset-0 opacity-80" style={{ background: visualBackplates[temaVisual] }} />
          <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${corPrimaria}55, transparent)` }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_7px] opacity-25" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.48em]" style={{ color: corPrimaria }}>
              {status}
            </p>
            <h3 className="mt-2 line-clamp-2 font-orbitron text-lg font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.22)]">
              {titulo}
            </h3>
          </div>
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/14 to-transparent" />
        </div>

        <div className="absolute inset-x-7 top-[104px] z-10 h-[238px] rounded-[1.4rem] border-[10px] border-[#11111a] bg-black shadow-[inset_0_0_55px_rgba(0,0,0,1),0_14px_24px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {screenshot && imageLoaded && !imageError ? (
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center opacity-90 transition-all duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${screenshot})` }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" style={{ background: visualBackplates[temaVisual] }}>
                <ImageOff className="mb-3 h-9 w-9 text-white/20" />
                <p className="rounded-md border border-white/10 bg-black/35 px-3 py-2 font-orbitron text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: corPrimaria }}>
                  {language === 'pt' ? 'Preview pendente' : 'Preview pending'}
                </p>
                <p className="mt-4 line-clamp-3 font-mono text-[8px] uppercase tracking-widest text-white/22">
                  {titulo}
                </p>
              </div>
            )}
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-5 text-center backdrop-blur-[2px]">
              <LockKeyhole className="mb-3 h-9 w-9 text-white/35" />
              <p className="font-orbitron text-[11px] font-black uppercase tracking-[0.28em] text-white/75">
                {language === 'pt' ? 'Carta necessária' : 'Card required'}
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-[linear-gradient(rgba(255,255,255,0.04)_50%,rgba(0,0,0,0.22)_50%)] bg-[length:100%_4px] opacity-55" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 rounded-t-xl bg-gradient-to-b from-white/16 to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-30 rounded-xl shadow-[inset_0_0_45px_rgba(0,0,0,0.9)]" />
        </div>

        <div
          className="absolute inset-x-5 top-[335px] z-30 h-[92px] rounded-xl border border-white/10 bg-[#0b0d14] shadow-[0_18px_24px_rgba(0,0,0,0.55)]"
          style={{ transform: 'perspective(900px) rotateX(16deg)', transformOrigin: 'top center' }}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/8 to-transparent" />
          <div className="absolute left-4 top-4 h-1.5 w-1.5 rounded-full bg-slate-600" />
          <div className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-slate-600" />

          <div className="relative z-10 flex h-full items-center justify-between gap-3 px-5">
            <div className="relative h-11 w-11">
              <div className="absolute inset-x-2 bottom-0 h-4 rounded-full bg-black/70" />
              <motion.div
                animate={isAvailable ? { rotateX: [0, -8, 7, 0], rotateY: [0, 8, -7, 0] } : {}}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border border-white/25 bg-red-600 shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
              />
            </div>

            <div className="flex flex-1 justify-center gap-2">
              {[corPrimaria, '#38bdf8', '#22c55e', '#fbbf24'].map((color, index) => (
                <div
                  key={`${titulo}-button-${index}`}
                  className="h-5 w-5 rounded-full border border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),0_4px_9px_rgba(0,0,0,0.45)]"
                  style={{ background: color, boxShadow: `0 0 ${index === 0 ? 14 : 4}px ${color}66` }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onInfo();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-white/25 hover:text-white"
              aria-label={language === 'pt' ? 'Informações do fliperama' : 'Arcade information'}
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isAvailable) onPlay();
          }}
          disabled={!isAvailable}
          className="absolute inset-x-9 bottom-[52px] z-40 rounded-xl border border-white/20 px-4 py-3 font-orbitron text-[12px] font-black uppercase tracking-[0.36em] text-white shadow-[0_7px_0_rgba(0,0,0,0.55)] transition-all hover:brightness-110 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-800 disabled:text-zinc-600"
          style={isAvailable ? { background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` } : undefined}
        >
          <span className="flex items-center justify-center gap-2">
            <Play className="h-4 w-4 fill-current" />
            {language === 'pt' ? 'Iniciar' : 'Play'}
          </span>
        </button>

        <div className="absolute inset-x-12 bottom-0 h-[58px] rounded-b-lg border-x-[8px] border-b-[10px] border-[#10131e] bg-black shadow-[0_20px_36px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-x-4 top-3 flex justify-between">
            <div className="h-8 w-8 rounded bg-slate-900 shadow-inner">
              <div className="mx-auto mt-1 h-6 w-1.5 rounded-full bg-black/80" />
            </div>
            <div className="h-8 w-8 rounded bg-slate-900/60 shadow-inner">
              <div className="mx-auto mt-1 h-6 w-1.5 rounded-full bg-black/80" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-10 bottom-0 h-5 rounded-full opacity-45 blur-xl" style={{ background: corPrimaria }} />
      </div>
    </motion.div>
  );
};

export default ArcadeCard;
