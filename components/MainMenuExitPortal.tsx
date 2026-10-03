'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Language } from '@/lib/i18n';
import { drawDeepPortal } from '@/components/NewEarthUnderwaterBattle';

export const MainMenuExitPortal = ({ language }: { language: Language }) => {
  const reduceMotion = useReducedMotion();
  const portalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const copy = language === 'pt'
    ? {
      exit: 'Sair',
      question: 'Você deseja voltar para a realidade?',
      yes: 'Sim',
      yesDetail: 'Sair do jogo',
      no: 'Não',
      noDetail: 'Continuar no menu inicial',
    }
    : {
      exit: 'Exit',
      question: 'Do you want to return to reality?',
      yes: 'Yes',
      yesDetail: 'Exit the game',
      no: 'No',
      noDetail: 'Stay on the main menu',
    };

  useEffect(() => {
    const canvas = portalCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let animationFrame = 0;
    const render = (time: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawDeepPortal(context, canvas.width, canvas.height, time, { portal: copy.exit });
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(render);
    };

    render(0);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [copy.exit, reduceMotion]);

  useEffect(() => {
    if (!showConfirmation) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowConfirmation(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showConfirmation]);

  const quitGame = useCallback(() => {
    if (window.qchDesktop?.app) {
      window.qchDesktop.app.quit();
      return;
    }
    window.close();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirmation(true)}
        aria-label={copy.exit}
        className="group fixed bottom-9 right-8 z-[60] flex w-[118px] flex-col items-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:bottom-12 md:right-12 md:w-[142px]"
      >
        <canvas
          ref={portalCanvasRef}
          width={300}
          height={360}
          aria-hidden="true"
          className="pointer-events-none h-[142px] w-[118px] transition-transform duration-300 group-hover:scale-105 md:h-[170px] md:w-[142px]"
        />
        <span className="-mt-3 font-title text-[11px] uppercase tracking-[0.36em] text-cyan-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] md:text-xs">
          {copy.exit}
        </span>
      </button>

      {showConfirmation && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="main-menu-exit-question"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowConfirmation(false)}
          className="fixed inset-0 z-[100] grid place-items-center bg-[#01030a]/80 px-5 backdrop-blur-md"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.24, ease: 'easeOut' }}
            onClick={event => event.stopPropagation()}
            className="w-full max-w-xl border border-cyan-300/35 bg-[#030713]/95 p-6 shadow-[0_0_70px_rgba(34,211,238,0.16)] sm:p-8"
          >
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.36em] text-cyan-300/70">
              QCH // {copy.exit}
            </div>
            <h2 id="main-menu-exit-question" className="font-title text-xl uppercase tracking-[0.08em] text-white sm:text-2xl">
              {copy.question}
            </h2>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={quitGame}
                className="border border-rose-400/45 bg-rose-950/25 px-5 py-4 text-left transition hover:border-rose-300 hover:bg-rose-950/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <span className="block font-title text-sm uppercase tracking-[0.22em] text-rose-200">{copy.yes}</span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">{copy.yesDetail}</span>
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setShowConfirmation(false)}
                className="border border-cyan-300/45 bg-cyan-950/25 px-5 py-4 text-left transition hover:border-cyan-200 hover:bg-cyan-950/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <span className="block font-title text-sm uppercase tracking-[0.22em] text-cyan-100">{copy.no}</span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">{copy.noDetail}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
