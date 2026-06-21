'use client';

import React from 'react';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';

interface BattlePauseDialogProps {
  language: 'pt' | 'en' | string;
  onContinue: () => void;
  onReturn: () => void;
}

export default function BattlePauseDialog({ language, onContinue, onReturn }: BattlePauseDialogProps) {
  const isPt = language === 'pt';

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-sm rounded-2xl border border-cyan-300/25 bg-slate-950/95 p-6 text-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-cyan-200/70">
          {isPt ? 'Pausa' : 'Pause'}
        </p>
        <h2 className="mt-2 font-orbitron text-4xl font-black uppercase tracking-widest text-white">
          {isPt ? 'Pausa' : 'Pause'}
        </h2>

        <div className="mt-7 grid gap-3">
          <PremiumCanvasButton
            type="button"
            tone="cyan"
            onClick={onContinue}
            className="h-12 rounded-xl"
            contentClassName="text-[12px] font-black uppercase tracking-[0.24em] text-white"
          >
            {isPt ? 'Continuar' : 'Continue'}
          </PremiumCanvasButton>
          <PremiumCanvasButton
            type="button"
            tone="red"
            onClick={onReturn}
            className="h-12 rounded-xl"
            contentClassName="text-[12px] font-black uppercase tracking-[0.24em] text-white"
          >
            {isPt ? 'Voltar' : 'Return'}
          </PremiumCanvasButton>
        </div>
      </div>
    </div>
  );
}
