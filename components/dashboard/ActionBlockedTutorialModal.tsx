'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Check, ChevronRight, LockKeyhole, X, Zap } from 'lucide-react';

export type ActionTutorialChapter = 'Solar' | 'Interstellar' | 'Void' | 'Earth';

export interface ActionTutorialConfig {
  id: string;
  chapter: ActionTutorialChapter;
  title: string;
  reason: string;
  steps: string[];
  requirement?: string;
}

interface ActionBlockedTutorialModalProps {
  tutorial: ActionTutorialConfig | null;
  language: string;
  onClose: (doNotShowAgain: boolean) => void;
}

const chapterTheme: Record<ActionTutorialChapter, {
  eyebrowPt: string;
  eyebrowEn: string;
  accent: string;
  border: string;
  glow: string;
  wash: string;
}> = {
  Solar: {
    eyebrowPt: 'CAPÍTULO 01 · ORIENTAÇÃO DE BORDO',
    eyebrowEn: 'CHAPTER 01 · FLIGHT GUIDANCE',
    accent: 'text-cyan-300',
    border: 'border-cyan-400/45',
    glow: 'shadow-[0_0_70px_rgba(34,211,238,0.22)]',
    wash: 'from-cyan-500/22 via-sky-950/15 to-transparent',
  },
  Interstellar: {
    eyebrowPt: 'CAPÍTULO 02 · PROTOCOLO INTERESTELAR',
    eyebrowEn: 'CHAPTER 02 · INTERSTELLAR PROTOCOL',
    accent: 'text-orange-300',
    border: 'border-orange-400/45',
    glow: 'shadow-[0_0_70px_rgba(251,146,60,0.22)]',
    wash: 'from-orange-500/22 via-amber-950/15 to-transparent',
  },
  Void: {
    eyebrowPt: 'CAPÍTULO 03 · DIRETRIZ DO VAZIO',
    eyebrowEn: 'CHAPTER 03 · VOID DIRECTIVE',
    accent: 'text-fuchsia-300',
    border: 'border-fuchsia-400/45',
    glow: 'shadow-[0_0_70px_rgba(217,70,239,0.22)]',
    wash: 'from-fuchsia-500/20 via-purple-950/20 to-transparent',
  },
  Earth: {
    eyebrowPt: 'CAPÍTULO 04 · COMANDO NOVA TERRA',
    eyebrowEn: 'CHAPTER 04 · NEW EARTH COMMAND',
    accent: 'text-emerald-300',
    border: 'border-emerald-400/45',
    glow: 'shadow-[0_0_70px_rgba(52,211,153,0.22)]',
    wash: 'from-emerald-500/20 via-teal-950/20 to-transparent',
  },
};

export function ActionBlockedTutorialModal({ tutorial, language, onClose }: ActionBlockedTutorialModalProps) {
  const [doNotShowAgain, setDoNotShowAgain] = React.useState(false);


  React.useEffect(() => {
    if (!tutorial) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose(doNotShowAgain);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doNotShowAgain, onClose, tutorial]);

  const isPt = language === 'pt';
  const theme = tutorial ? chapterTheme[tutorial.chapter] : chapterTheme.Solar;

  return (
    <AnimatePresence>
      {tutorial && (
        <motion.div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) onClose(doNotShowAgain);
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-tutorial-title"
            initial={{ opacity: 0, scale: 0.92, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`relative w-full max-w-lg overflow-hidden rounded-[28px] border ${theme.border} bg-slate-950/96 ${theme.glow}`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.wash}`} />
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full border border-white/10 opacity-60" />
            <div className="pointer-events-none absolute -right-7 -top-10 h-32 w-32 rounded-full border border-white/10 opacity-50" />

            <div className="relative border-b border-white/10 px-6 pb-5 pt-6 sm:px-8">
              <button
                type="button"
                onClick={() => onClose(doNotShowAgain)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/30 text-slate-400 transition hover:border-white/25 hover:text-white"
                aria-label={isPt ? 'Fechar orientação' : 'Close guidance'}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex items-center gap-3 pr-10">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${theme.border} bg-black/35 ${theme.accent}`}>
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <div>
                  <p className={`font-mono text-[9px] font-bold uppercase tracking-[0.27em] ${theme.accent}`}>
                    {isPt ? theme.eyebrowPt : theme.eyebrowEn}
                  </p>
                  <h2 id="action-tutorial-title" className="mt-1 font-orbitron text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
                    {tutorial.title}
                  </h2>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/8 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p className="text-sm leading-relaxed text-slate-200">{tutorial.reason}</p>
              </div>
            </div>

            <div className="relative space-y-4 px-6 py-5 sm:px-8">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {isPt ? 'COMO LIBERAR ESTA AÇÃO' : 'HOW TO UNLOCK THIS ACTION'}
              </p>
              <ol className="space-y-3">
                {tutorial.steps.map((step, index) => (
                  <li key={`${tutorial.id}-${index}`} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${theme.border} bg-black/35 font-mono text-[10px] font-black ${theme.accent}`}>
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {tutorial.requirement && (
                <div className={`flex items-center gap-2 rounded-xl border ${theme.border} bg-black/30 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider ${theme.accent}`}>
                  <Zap className="h-4 w-4 shrink-0" />
                  {tutorial.requirement}
                </div>
              )}

              <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-xs text-slate-400 transition hover:border-white/15 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={doNotShowAgain}
                  onChange={(event) => setDoNotShowAgain(event.target.checked)}
                  className="peer sr-only"
                />
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${doNotShowAgain ? `${theme.border} bg-white/10 ${theme.accent}` : 'border-slate-600 bg-black/30'}`}>
                  {doNotShowAgain && <Check className="h-3.5 w-3.5" />}
                </span>
                {isPt ? 'Não mostrar novamente este aviso' : 'Do not show this guidance again'}
              </label>

              <button
                type="button"
                onClick={() => onClose(doNotShowAgain)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border ${theme.border} bg-white/8 px-5 py-3 font-orbitron text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/13`}
              >
                {isPt ? 'Entendi' : 'Understood'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
