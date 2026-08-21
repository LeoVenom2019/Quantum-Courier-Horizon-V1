'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Music, Pause, Play, SkipForward } from 'lucide-react';
import { PremiumCanvasButton, PremiumCanvasButtonTone } from './ui/PremiumCanvasButton';
import { PremiumStaticCard } from './ui/PremiumStaticCard';

type DashboardMediaPlayerProps = {
  isPlaying: boolean;
  trackTitle?: string;
  language: 'en' | 'pt';
  tone: PremiumCanvasButtonTone;
  accentTextClass: string;
  onTogglePlay: () => void;
  onNext: () => void;
};

export function DashboardMediaPlayer({
  isPlaying,
  trackTitle,
  language,
  tone,
  accentTextClass,
  onTogglePlay,
  onNext,
}: DashboardMediaPlayerProps) {
  const resolvedTitle = trackTitle || (language === 'pt' ? 'Nenhuma faixa' : 'No track selected');
  const musicLabel = language === 'pt' ? 'MÚSICA' : 'MUSIC';

  return (
    <div
      className="flex h-9 min-w-0 items-stretch gap-1.5"
      role="group"
      aria-label={language === 'pt' ? 'Tocador de música' : 'Music player'}
    >
      <PremiumCanvasButton
        onClick={onTogglePlay}
        tone={tone}
        className="h-9 w-[104px] shrink-0 rounded-full"
        contentClassName={`gap-1.5 px-2.5 text-[10px] font-black uppercase tracking-[0.08em] ${accentTextClass}`}
        aria-pressed={isPlaying}
        title={isPlaying
          ? (language === 'pt' ? 'Pausar música' : 'Pause music')
          : (language === 'pt' ? 'Tocar música' : 'Play music')}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5 shrink-0" /> : <Play className="h-3.5 w-3.5 shrink-0" />}
        <span>{musicLabel} {isPlaying ? 'ON' : 'OFF'}</span>
      </PremiumCanvasButton>

      <PremiumCanvasButton
        onClick={onNext}
        tone={tone}
        className="h-9 w-10 shrink-0 rounded-full"
        contentClassName={accentTextClass}
        aria-label={language === 'pt' ? 'Próxima música' : 'Next track'}
        title={language === 'pt' ? 'Próxima música' : 'Next track'}
      >
        <SkipForward className="h-4 w-4" />
      </PremiumCanvasButton>

      <PremiumStaticCard
        tone={tone}
        density="compact"
        className="h-9 w-[190px] shrink-0 rounded-full"
        contentClassName="flex items-center gap-2 px-3"
      >
        <Music className={`h-3.5 w-3.5 shrink-0 ${accentTextClass}`} aria-hidden="true" />
        <div className="min-w-0 flex-1 overflow-hidden" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={resolvedTitle}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.16 }}
              className={`block truncate font-orbitron text-[10px] font-bold tracking-[0.04em] ${accentTextClass}`}
              title={resolvedTitle}
            >
              {resolvedTitle}
            </motion.span>
          </AnimatePresence>
        </div>
      </PremiumStaticCard>
    </div>
  );
}
