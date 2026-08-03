'use client';

import { useCallback, useRef, useState } from 'react';
import { FastForward, Gamepad2, Music, Volume2, VolumeX, X } from 'lucide-react';
import type { MiniGameConfig } from '@/lib/mini-games-config';

interface ArcadeIntroOverlayProps {
  language: 'pt' | 'en';
  game: MiniGameConfig;
  initialMusicEnabled: boolean;
  onContinue: (musicEnabled: boolean) => void | Promise<void>;
  onClose: () => void;
}

const ARCADE_TUTORIALS: Record<string, {
  tutorial: { pt: string; en: string };
  controls: { pt: string[]; en: string[] };
}> = {
  'salto-espacial': {
    tutorial: {
      pt: 'Conduza a nave pelo campo, colete núcleos de energia para crescer e evite as bordas e o próprio rastro.',
      en: 'Guide the ship across the field, collect energy cores to grow, and avoid the edges and your own trail.',
    },
    controls: { pt: ['WASD ou setas: mudar direção'], en: ['WASD or arrows: change direction'] },
  },
  'ruptura-estelar': {
    tutorial: {
      pt: 'Desvie das ameaças, sobreviva às ondas e destrua inimigos para carregar o OVERDRIVE. O disparo é automático.',
      en: 'Dodge threats, survive each wave, and destroy enemies to charge OVERDRIVE. Firing is automatic.',
    },
    controls: { pt: ['WASD ou setas: mover a nave'], en: ['WASD or arrows: move the ship'] },
  },
  'danger-zoom-zones': {
    tutorial: {
      pt: 'Selecione uma zona e decida rapidamente: desarme se suspeitar de uma bomba ou faça um scan se acreditar que está segura.',
      en: 'Select a zone and decide quickly: disarm it if you suspect a bomb or scan it if you believe it is safe.',
    },
    controls: {
      pt: ['Clique: selecionar zona', 'S: desarmar', 'N: fazer scan'],
      en: ['Click: select zone', 'S: disarm', 'N: scan'],
    },
  },
  'grid-collapse': {
    tutorial: {
      pt: 'Encaixe as peças para completar linhas, limpar a grade e aproveitar bombas e multiplicadores especiais.',
      en: 'Fit pieces together to complete lines, clear the grid, and take advantage of special bombs and multipliers.',
    },
    controls: {
      pt: ['A/D: mover', 'W: girar', 'S: acelerar queda'],
      en: ['A/D: move', 'W: rotate', 'S: soft drop'],
    },
  },
  'robot-runner': {
    tutorial: {
      pt: 'Colete todas as esferas, use as vermelhas para enfrentar os fantasmas e ative o boost quando a barra estiver cheia.',
      en: 'Collect every orb, use red ones to fight ghosts, and activate boost when the meter is full.',
    },
    controls: {
      pt: ['WASD ou setas: mover', 'Espaço: ativar boost'],
      en: ['WASD or arrows: move', 'Space: activate boost'],
    },
  },
  'neo-catcher': {
    tutorial: {
      pt: 'Mova o coletor para capturar os objetos, encadear combos e alcançar a meta de cada uma das quatro fases.',
      en: 'Move the collector to catch objects, build combos, and reach the target in each of the four phases.',
    },
    controls: { pt: ['A/D ou setas: mover'], en: ['A/D or arrows: move'] },
  },
};

export function ArcadeIntroOverlay({
  language,
  game,
  initialMusicEnabled,
  onContinue,
  onClose,
}: ArcadeIntroOverlayProps) {
  const [musicEnabled, setMusicEnabled] = useState(initialMusicEnabled);
  const isCompletingRef = useRef(false);
  const tutorial = ARCADE_TUTORIALS[game.id];

  const handleContinue = useCallback(() => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    void onContinue(musicEnabled);
  }, [musicEnabled, onContinue]);

  return (
    <div
      className="absolute inset-0 z-[120] flex items-center justify-center overflow-y-auto rounded-2xl bg-black/95 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={language === 'pt' ? `Como jogar ${game.name.pt}` : `How to play ${game.name.en}`}
    >
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-cyan-300/35 bg-zinc-950 shadow-[0_0_60px_rgba(34,211,238,0.22)] lg:grid-cols-[1.05fr_0.95fr]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-zinc-200 backdrop-blur-md transition hover:border-rose-300/70 hover:bg-rose-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label={language === 'pt' ? 'Fechar prévia do fliperama' : 'Close arcade preview'}
          title={language === 'pt' ? 'Fechar' : 'Close'}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="relative min-h-64 overflow-hidden bg-black lg:min-h-[520px]">
          <video
            src={game.image}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/10 to-black/30" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/15 text-cyan-100 backdrop-blur-md">
              <Gamepad2 size={22} />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-200">
              {language === 'pt' ? 'Briefing do Fliperama' : 'Arcade Briefing'}
            </p>
            <h2 className="mt-2 font-orbitron text-3xl font-black uppercase leading-tight text-white">
              {game.name[language]}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-200">
              {game.description[language]}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 p-5 sm:p-7">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
              {language === 'pt' ? 'Como jogar' : 'How to play'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-200">
              {tutorial?.tutorial[language] || game.description[language]}
            </p>
            {tutorial && (
              <ul className="mt-4 space-y-2">
                {tutorial.controls[language].map(control => (
                  <li key={control} className="rounded-lg border border-cyan-300/15 bg-cyan-300/5 px-3 py-2 font-mono text-xs text-cyan-50">
                    {control}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-4">
            <div className="flex items-center gap-3">
              <Music className="text-fuchsia-200" size={20} />
              <div>
                <p className="font-orbitron text-xs font-black uppercase tracking-[0.18em] text-white">
                  {language === 'pt' ? 'Música deste jogo' : 'Music for this game'}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {language === 'pt' ? 'Esta escolha não altera a música do capítulo.' : 'This choice does not change chapter music.'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label={language === 'pt' ? 'Música do jogo' : 'Game music'}>
              <button
                type="button"
                aria-pressed={musicEnabled}
                onClick={() => setMusicEnabled(true)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border font-orbitron text-xs font-black uppercase tracking-[0.16em] transition ${musicEnabled ? 'border-emerald-300 bg-emerald-300/20 text-emerald-50 shadow-[0_0_22px_rgba(110,231,183,0.18)]' : 'border-white/10 bg-white/5 text-zinc-500 hover:text-zinc-200'}`}
              >
                <Volume2 size={17} /> Música ON
              </button>
              <button
                type="button"
                aria-pressed={!musicEnabled}
                onClick={() => setMusicEnabled(false)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border font-orbitron text-xs font-black uppercase tracking-[0.16em] transition ${!musicEnabled ? 'border-rose-300 bg-rose-300/20 text-rose-50 shadow-[0_0_22px_rgba(253,164,175,0.18)]' : 'border-white/10 bg-white/5 text-zinc-500 hover:text-zinc-200'}`}
              >
                <VolumeX size={17} /> Música OFF
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={handleContinue}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-300/15 px-5 font-orbitron text-xs font-black uppercase tracking-[0.18em] text-cyan-50 transition hover:border-cyan-200 hover:bg-cyan-300/25 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]"
          >
            <FastForward size={17} />
            {language === 'pt' ? 'Confirmar e jogar' : 'Confirm and play'}
          </button>
        </div>
      </div>
    </div>
  );
}
