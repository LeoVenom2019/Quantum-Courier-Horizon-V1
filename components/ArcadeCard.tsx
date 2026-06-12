'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Info, Play, ImageOff, LockKeyhole } from 'lucide-react';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';

interface ArcadeCardProps {
  titulo: string;
  descricao: string;
  corPrimaria: string;
  corSecundaria: string;
  temaVisual: 'sci-fi' | 'war' | 'puzzle' | 'nebula';
  status: string;
  onPlay: () => void;
  onLockedClick?: () => void;
  onInfo: () => void;
  screenshot?: string;
  cabinetImage?: string;
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
  onLockedClick,
  onInfo,
  screenshot,
  cabinetImage,
  language = 'pt',
}) => {
  const isVideoPreview = /\.(mp4|webm|ogg)$/i.test(screenshot || '');
  const [mediaError, setMediaError] = useState(!screenshot);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const isAvailable = status.toUpperCase().includes('DISPONÍVEL') || status.toUpperCase().includes('AVAILABLE');

  useEffect(() => {
    setMediaLoaded(false);
    setMediaError(!screenshot);

    if (!screenshot || isVideoPreview) return;
    const img = new Image();
    img.src = screenshot;
    img.onload = () => {
      setMediaLoaded(true);
      setMediaError(false);
    };
    img.onerror = () => {
      setMediaLoaded(false);
      setMediaError(true);
    };
  }, [screenshot, isVideoPreview]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={isAvailable ? { y: -10, rotateX: 1.5, rotateY: -2, scale: 1.02 } : { y: -4 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className={`group relative h-[560px] w-full select-none overflow-visible ${isAvailable ? '' : 'opacity-75 grayscale-[0.55]'}`}
      style={{ perspective: 1200 }}
    >
      <div
        className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-[55px] transition-opacity duration-500 group-hover:opacity-35"
        style={{ background: corPrimaria }}
      />

      <div className="absolute inset-x-4 bottom-0 h-16 rounded-[50%] bg-black/80 blur-xl" />

      <div className="relative mx-auto h-full w-full max-w-[280px]">
        <div className="absolute inset-0 overflow-hidden rounded-[1.25rem]">
          {cabinetImage ? (
            <img
              src={cabinetImage}
              alt=""
              className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_26px_34px_rgba(0,0,0,0.7)]"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 rounded-[1.25rem]" style={{ background: visualBackplates[temaVisual] }} />
          )}

          <div className="absolute left-[17.9%] top-[31.7%] aspect-[4/3] w-[63.2%] overflow-hidden rounded-[0.65rem] bg-black">
            {screenshot && isVideoPreview && !mediaError ? (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.035]"
                src={screenshot}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onCanPlay={() => setMediaLoaded(true)}
                onError={() => {
                  setMediaLoaded(false);
                  setMediaError(true);
                }}
              />
            ) : screenshot && mediaLoaded && !mediaError ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-95 transition-all duration-700 group-hover:scale-[1.035]"
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

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_50%,rgba(0,0,0,0.20)_50%)] bg-[length:100%_4px] opacity-55" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/14 to-transparent" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_34px_rgba(0,0,0,0.9)]" />
          </div>
        </div>

        <PremiumCanvasButton
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isAvailable) onPlay();
          }}
          disabled={!isAvailable}
          tone={isAvailable ? 'cyan' : 'steel'}
          className="absolute left-[24%] right-[24%] bottom-[13.5%] z-40 h-10 rounded-xl opacity-95 focus:opacity-100"
          contentClassName={`gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.28em] ${isAvailable ? 'text-white' : 'text-zinc-500'}`}
          style={isAvailable ? { boxShadow: `0 0 18px ${corPrimaria}88` } : undefined}
        >
          <Play className="h-4 w-4 fill-current" />
          {language === 'pt' ? 'Iniciar' : 'Play'}
        </PremiumCanvasButton>

        <PremiumCanvasButton
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onInfo();
          }}
          tone="steel"
          className="absolute right-3 top-3 z-50 h-9 w-9 rounded-full opacity-90 focus:opacity-100"
          contentClassName="text-cyan-100"
          aria-label={language === 'pt' ? 'Informações do fliperama' : 'Arcade information'}
        >
          <Info className="h-4 w-4" />
        </PremiumCanvasButton>

        {!isAvailable && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onLockedClick?.();
            }}
            className="absolute inset-0 z-50 flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] bg-black/65 px-5 text-center backdrop-blur-[2px] transition hover:bg-black/58"
            aria-label={language === 'pt' ? 'Fliperama bloqueado' : 'Locked arcade'}
          >
            <LockKeyhole className="mb-3 h-10 w-10 text-white/45" />
            <p className="font-orbitron text-[11px] font-black uppercase tracking-[0.28em] text-white/80">
              {language === 'pt' ? 'Carta necessária' : 'Card required'}
            </p>
          </button>
        )}

        <div className="absolute inset-x-8 bottom-3 h-6 rounded-full opacity-45 blur-xl" style={{ background: corPrimaria }} />
      </div>
    </motion.div>
  );
};

export default ArcadeCard;
