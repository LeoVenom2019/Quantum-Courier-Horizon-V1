'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronRight, Radio, Volume2 } from 'lucide-react';
import type { Language } from '@/lib/i18n';
import type { ThemeColor } from '@/lib/game-data';

type TitleScreenProps = {
  language: Language;
  theme: ThemeColor;
  hasSave: boolean;
  musicOn: boolean;
  onEnter: () => void;
};

const titleMediaByTheme: Partial<Record<ThemeColor, string>> = {
  cyan: '/cinematic_earth_asset_qch_1777340390078.webp',
  orange: '/cinematic_saturn_asset_qch_1777340512619.webp',
  purple: '/cinematic_alien_asset_qch_1777340712376.webp',
  emerald: '/cinematic_earth_asset_qch_1777340390078.webp',
  neila: '/cinematic_earth_asset_qch_1777340390078.webp',
};

const accentByTheme: Partial<Record<ThemeColor, string>> = {
  cyan: '#22d3ee',
  orange: '#fb923c',
  purple: '#c084fc',
  emerald: '#34d399',
  neila: '#34d399',
};

export const TitleScreen = ({
  language,
  theme,
  hasSave,
  musicOn,
  onEnter,
}: TitleScreenProps) => {
  const reduceMotion = useReducedMotion();
  const enteredRef = useRef(false);
  const accent = accentByTheme[theme] || '#22d3ee';
  const media = titleMediaByTheme[theme] || '/cinematic_earth_asset_qch_1777340390078.webp';
  const copy = language === 'pt'
    ? {
      signal: 'Sinal Horizon estabelecido',
      prompt: hasSave ? 'Continuar transmissão' : 'Iniciar transmissão',
      keyboard: 'Pressione qualquer tecla',
      sound: musicOn ? 'Áudio ativo' : 'Áudio desativado',
    }
    : {
      signal: 'Horizon signal established',
      prompt: hasSave ? 'Resume transmission' : 'Begin transmission',
      keyboard: 'Press any key',
      sound: musicOn ? 'Audio active' : 'Audio disabled',
    };

  const enter = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    onEnter();
  }, [onEnter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      enter();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enter]);

  return (
    <motion.section
      role="dialog"
      aria-label="Quantum Courier Horizon"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduceMotion ? 'none' : 'blur(10px)' }}
      transition={{ duration: reduceMotion ? 0.15 : 0.8, ease: 'easeOut' }}
      className="fixed inset-0 z-[80] isolate overflow-hidden bg-[#01030a]"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at 72% 48%, ${accent}26 0%, transparent 34%), radial-gradient(circle at 50% 120%, ${accent}18 0%, transparent 42%), #01030a`,
        }}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 80, scale: 0.92 }}
        animate={{ opacity: 0.82, x: 0, scale: 1 }}
        transition={{ duration: 2.2, ease: 'easeOut' }}
        className="absolute inset-y-0 right-[-12%] w-[82%] sm:right-[-5%] sm:w-[70%]"
      >
        <Image
          unoptimized
          fill
          priority
          src={media}
          alt=""
          className="object-contain object-right"
          style={{ mixBlendMode: 'screen' }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,#01030a_0%,rgba(1,3,10,0.92)_30%,rgba(1,3,10,0.25)_70%,#01030a_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:100%_4px]" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.35, duration: 1.1, ease: 'easeOut' }}
        className="relative z-10 flex h-full max-w-5xl flex-col justify-center px-7 pb-20 sm:px-14 lg:px-24"
      >
        <div className="mb-7 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.38em] text-white/50 sm:text-[10px]">
          <Radio className="h-4 w-4" style={{ color: accent }} />
          <span>{copy.signal}</span>
          <span className="h-px w-16 bg-white/15" />
          <span className="hidden sm:inline">LX999 // QCH</span>
        </div>

        <h1 className="font-title uppercase leading-[0.82]">
          <span className="block text-[clamp(2.4rem,7.8vw,7.4rem)] tracking-[0.12em] text-white [text-shadow:0_0_42px_rgba(255,255,255,0.14)]">
            Quantum
          </span>
          <span className="block text-[clamp(2.4rem,7.8vw,7.4rem)] tracking-[0.12em] text-white">
            Courier
          </span>
          <span
            className="mt-4 block text-[clamp(1.8rem,5.4vw,5.2rem)] tracking-[0.42em]"
            style={{ color: accent, textShadow: `0 0 34px ${accent}66` }}
          >
            Horizon
          </span>
        </h1>

        <motion.button
          type="button"
          onClick={enter}
          animate={reduceMotion ? undefined : { opacity: [0.62, 1, 0.62] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="group mt-12 flex w-fit items-center gap-4 border-l-2 py-2 pl-5 pr-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          style={{ borderColor: accent }}
        >
          <span>
            <span className="block font-title text-sm uppercase tracking-[0.3em] text-white sm:text-base">
              {copy.prompt}
            </span>
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">
              {copy.keyboard}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: accent }} />
        </motion.button>
      </motion.div>

      <div className="absolute inset-x-6 bottom-6 z-10 flex items-end justify-between font-mono text-[8px] uppercase tracking-[0.28em] text-white/30 sm:inset-x-10 sm:text-[9px]">
        <span>QCH // BUILD 0.1.0</span>
        <span className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5" />
          {copy.sound}
        </span>
      </div>
    </motion.section>
  );
};
