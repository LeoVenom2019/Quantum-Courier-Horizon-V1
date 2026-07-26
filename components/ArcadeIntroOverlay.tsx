'use client';

import { useCallback, useRef, useState } from 'react';
import { FastForward, Gamepad2 } from 'lucide-react';

export const ARCADE_INTRO_SKIP_STORAGE_KEY = 'qch_skip_arcade_intro';

interface ArcadeIntroOverlayProps {
  language: 'pt' | 'en';
  onContinue: (dontShowAgain: boolean) => void | Promise<void>;
}

export function ArcadeIntroOverlay({
  language,
  onContinue,
}: ArcadeIntroOverlayProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isCompletingRef = useRef(false);

  const handleContinue = useCallback(() => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    void onContinue(dontShowAgain);
  }, [dontShowAgain, onContinue]);

  return (
    <div
      className="absolute inset-0 z-[120] flex items-center justify-center overflow-hidden rounded-2xl bg-black p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={language === 'pt' ? 'Introdução do fliperama' : 'Arcade introduction'}
    >
      <div className="relative h-full w-full max-w-6xl overflow-hidden rounded-2xl border border-cyan-300/35 bg-black shadow-[0_0_60px_rgba(34,211,238,0.22)]">
        <video
          src="/assets/games/fliper_intro.webm"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleContinue}
          onError={handleContinue}
          className="h-full w-full object-contain"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 border-t border-cyan-200/15 bg-black/85 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
              <Gamepad2 size={20} />
            </div>
            <div>
              <p className="font-orbitron text-sm font-black uppercase tracking-[0.18em] text-white">
                {language === 'pt' ? 'Inicializando fliperama' : 'Initializing arcade'}
              </p>
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cyan-100/75">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={event => setDontShowAgain(event.target.checked)}
                  className="h-4 w-4 accent-cyan-400"
                />
                {language === 'pt' ? 'Não mostrar novamente' : 'Do not show again'}
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-300/15 px-5 font-orbitron text-xs font-black uppercase tracking-[0.18em] text-cyan-50 transition hover:border-cyan-200 hover:bg-cyan-300/25 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]"
          >
            <FastForward size={17} />
            {language === 'pt' ? 'Pular / Entrar no jogo' : 'Skip / Enter game'}
          </button>
        </div>
      </div>
    </div>
  );
}
