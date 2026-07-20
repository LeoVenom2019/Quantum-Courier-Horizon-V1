'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ChevronRight,
  Coins,
  Orbit,
  Radio,
  ShieldOff,
  Skull,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import VoidBattleArena, { type VoidBattleEnemy } from '../VoidBattleArena';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';
import { ROUTE_THEMES, type Track } from '@/lib/music-data';
import {
  getManualBattleResultAudio,
  pickManualBattleTheme,
} from '@/lib/solar-interstellar-battle-media.mjs';

type SolarInterstellarRouteTier = 'Solar' | 'Interstellar';

interface JukeboxController {
  volume?: number;
  stop: (options?: { rememberPreference?: boolean }) => void;
  playPlaylist: (
    playlist: Track[],
    options?: { loop?: boolean; rememberPreference?: boolean; restart?: boolean },
  ) => void;
}

interface SolarInterstellarBattleExperienceProps {
  activeBattle: any;
  routeTier: SolarInterstellarRouteTier;
  language: string;
  t: (key: string) => string;
  formatValue: (value: number) => string;
  finishBattle: () => void;
  resolveBattleVictory: (battle: any) => void;
  resolveBattleDefeat: (battle: any) => void;
  setActiveBattle: (battle: any) => void;
  playSfx: (id: string) => void;
  stopSfx: (id: string) => void;
  addLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  voidResources: any;
  battleLevel: number;
  meteoriteRewardValue?: number;
  musicOn: boolean;
  jukebox: JukeboxController;
}

const DECORATIVE_SIGNALS = [
  { left: '8%', top: '18%', delay: 0 },
  { left: '18%', top: '76%', delay: 0.4 },
  { left: '34%', top: '12%', delay: 0.8 },
  { left: '52%', top: '82%', delay: 1.2 },
  { left: '68%', top: '16%', delay: 1.6 },
  { left: '81%', top: '69%', delay: 2 },
  { left: '91%', top: '28%', delay: 2.4 },
  { left: '74%', top: '88%', delay: 2.8 },
] as const;

const stopAudio = (audio: HTMLAudioElement | null) => {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
};

const reportPlaybackError = (label: string, error: unknown) => {
  if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotAllowedError')) return;
  console.warn(`[SolarInterstellarBattle] ${label}:`, error);
};

function ResultScreen({
  activeBattle,
  routeTier,
  language,
  formatValue,
  finishBattle,
}: Pick<
  SolarInterstellarBattleExperienceProps,
  'activeBattle' | 'routeTier' | 'language' | 'formatValue' | 'finishBattle'
>) {
  const isVictory = Boolean(activeBattle.isVictory);
  const isSolar = routeTier === 'Solar';
  const chapterLabel = isSolar
    ? (language === 'pt' ? 'CAPÍTULO 01 · SETOR SOLAR' : 'CHAPTER 01 · SOLAR SECTOR')
    : (language === 'pt' ? 'CAPÍTULO 02 · ESPAÇO INTERESTELAR' : 'CHAPTER 02 · INTERSTELLAR SPACE');
  const palette = !isVictory
    ? {
        accent: 'text-rose-300',
        muted: 'text-rose-200/60',
        border: 'border-rose-500/45',
        softBorder: 'border-rose-400/20',
        panel: 'bg-rose-950/25',
        line: 'bg-rose-400',
        shadow: 'shadow-[0_0_70px_rgba(244,63,94,0.16)]',
        particle: 'bg-rose-300',
      }
    : isSolar
      ? {
          accent: 'text-amber-200',
          muted: 'text-amber-100/60',
          border: 'border-amber-400/45',
          softBorder: 'border-amber-300/20',
          panel: 'bg-amber-950/20',
          line: 'bg-amber-300',
          shadow: 'shadow-[0_0_70px_rgba(251,191,36,0.14)]',
          particle: 'bg-amber-200',
        }
      : {
          accent: 'text-cyan-200',
          muted: 'text-violet-200/60',
          border: 'border-cyan-400/45',
          softBorder: 'border-violet-300/20',
          panel: 'bg-indigo-950/25',
          line: 'bg-cyan-300',
          shadow: 'shadow-[0_0_70px_rgba(34,211,238,0.14)]',
          particle: 'bg-cyan-200',
        };

  const rewards = [
    { id: 'qc', icon: Coins, label: 'QC', value: `+${formatValue(activeBattle.reward || 0)}` },
    { id: 'xp', icon: Trophy, label: 'XP', value: `+${activeBattle.xpReward || 0}`, show: (activeBattle.xpReward || 0) > 0 },
    { id: 'et', icon: Zap, label: language === 'pt' ? 'ETÉRION' : 'AETHERION', value: `+${activeBattle.aetherionReward || 0}`, show: (activeBattle.aetherionReward || 0) > 0 },
  ].filter((reward) => reward.show !== false);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="battle-result-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[20000] flex items-center justify-center overflow-y-auto bg-slate-950/95 p-3 sm:p-6"
      style={{
        backgroundImage: isVictory
          ? isSolar
            ? 'radial-gradient(circle at 50% 12%, rgba(245,158,11,0.17), transparent 42%), linear-gradient(145deg, #020617 0%, #160d03 52%, #020617 100%)'
            : 'radial-gradient(circle at 50% 12%, rgba(34,211,238,0.14), transparent 38%), linear-gradient(145deg, #020617 0%, #10082c 55%, #020617 100%)'
          : 'radial-gradient(circle at 50% 10%, rgba(244,63,94,0.13), transparent 38%), linear-gradient(145deg, #020617 0%, #21060e 52%, #020617 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {DECORATIVE_SIGNALS.map((signal, index) => (
          <motion.span
            key={`${signal.left}-${signal.top}`}
            className={`absolute h-1 w-1 rounded-full ${palette.particle} motion-reduce:animate-none`}
            style={{ left: signal.left, top: signal.top }}
            animate={{ opacity: [0.15, 0.8, 0.15], y: [0, -6, 0] }}
            transition={{ duration: 3.2, delay: signal.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className={`absolute -inset-1 border ${palette.softBorder}`} />
            <span className="sr-only">signal {index + 1}</span>
          </motion.span>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`relative my-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border ${palette.border} bg-slate-950/95 ${palette.shadow}`}
      >
        <div className={`absolute inset-x-0 top-0 h-px ${palette.line}`} />
        <div className="absolute left-0 top-0 h-20 w-px bg-white/35" />
        <div className="absolute right-0 top-0 h-20 w-px bg-white/35" />

        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-8 lg:p-10">
          <header className={`flex flex-col gap-5 border-b ${palette.softBorder} pb-6 sm:flex-row sm:items-start sm:justify-between`}>
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className={`relative flex h-16 w-16 shrink-0 items-center justify-center border ${palette.border} ${palette.panel}`}
              >
                {isVictory ? <Trophy className={`h-8 w-8 ${palette.accent}`} /> : <ShieldOff className={`h-8 w-8 ${palette.accent}`} />}
                <span className={`absolute -bottom-1 -right-1 h-3 w-3 border ${palette.border} bg-slate-950`} />
              </motion.div>
              <div>
                <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.32em] ${palette.muted}`}>{chapterLabel}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${palette.line} motion-reduce:animate-none`} />
                  <span className={`font-mono text-[10px] uppercase tracking-[0.24em] ${palette.accent}`}>
                    {isVictory
                      ? (language === 'pt' ? 'TRANSMISSÃO CONFIRMADA' : 'TRANSMISSION CONFIRMED')
                      : (language === 'pt' ? 'SINAL DE EMERGÊNCIA' : 'EMERGENCY SIGNAL')}
                  </span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-3 border ${palette.softBorder} px-4 py-3 ${palette.panel}`}>
              <Radio className={`h-4 w-4 ${palette.accent}`} />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">HZN://AFTER-ACTION</p>
                <p className={`font-orbitron text-xs font-bold uppercase tracking-[0.16em] ${palette.accent}`}>
                  {isVictory ? 'STATUS 01' : 'STATUS 00'}
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-7 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className={`font-mono text-[11px] uppercase tracking-[0.34em] ${palette.muted}`}>
                {isVictory
                  ? (language === 'pt' ? 'RELATÓRIO DE MISSÃO · OBJETIVO CONCLUÍDO' : 'MISSION REPORT · OBJECTIVE COMPLETE')
                  : (language === 'pt' ? 'RELATÓRIO DE MISSÃO · OPERAÇÃO INTERROMPIDA' : 'MISSION REPORT · OPERATION INTERRUPTED')}
              </p>
              <h2 id="battle-result-title" className={`mt-3 font-orbitron text-5xl font-black uppercase leading-none tracking-[-0.04em] sm:text-7xl ${palette.accent}`}>
                {isVictory
                  ? (language === 'pt' ? 'VITÓRIA' : 'VICTORY')
                  : (language === 'pt' ? 'DERROTA' : 'DEFEAT')}
              </h2>
              <div className="mt-5 flex items-center gap-3">
                <div className={`h-px w-20 ${palette.line}`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">QCH // HORIZON COMMAND</span>
              </div>
            </div>

            <div className={`border ${palette.softBorder} ${palette.panel} p-4`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Target className={`h-5 w-5 ${palette.accent}`} />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
                      {language === 'pt' ? 'ALVO DO CONFRONTO' : 'COMBAT TARGET'}
                    </p>
                    <p className="mt-1 font-orbitron text-sm font-bold uppercase tracking-[0.12em] text-slate-100">
                      {activeBattle.enemyName || (language === 'pt' ? 'SINAL HOSTIL' : 'HOSTILE SIGNAL')}
                    </p>
                  </div>
                </div>
                {isVictory ? <Orbit className={`h-7 w-7 ${palette.accent}`} /> : <Skull className={`h-7 w-7 ${palette.accent}`} />}
              </div>
            </div>
          </div>

          {isVictory ? (
            <div className={`border-t ${palette.softBorder} pt-6`}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-4 w-4 ${palette.accent}`} />
                  <p className={`font-orbitron text-xs font-black uppercase tracking-[0.24em] ${palette.accent}`}>
                    {language === 'pt' ? 'RECURSOS RECUPERADOS' : 'RECOVERED RESOURCES'}
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">SYNC 100%</span>
              </div>

              <div className={`grid grid-cols-1 gap-px overflow-hidden border ${palette.softBorder} bg-white/10 sm:grid-cols-3`}>
                {rewards.map((reward, index) => {
                  const Icon = reward.icon;
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      className="flex items-center justify-between gap-4 bg-slate-950 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${palette.accent}`} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{reward.label}</span>
                      </div>
                      <span className={`font-orbitron text-xl font-black ${palette.accent}`}>{reward.value}</span>
                    </motion.div>
                  );
                })}
              </div>

              {(activeBattle.destroyedMeteors > 0 || activeBattle.destroyedMeteorites > 0) && (
                <div className={`mt-4 grid grid-cols-1 gap-3 border ${palette.softBorder} ${palette.panel} p-4 sm:grid-cols-2`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      {language === 'pt' ? 'METEORITOS DESTRUÍDOS' : 'METEORITES DESTROYED'}
                    </span>
                    <strong className={`font-orbitron ${palette.accent}`}>{activeBattle.destroyedMeteorites || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      {language === 'pt' ? 'METEOROS DESTRUÍDOS' : 'METEORS DESTROYED'}
                    </span>
                    <strong className={`font-orbitron ${palette.accent}`}>{activeBattle.destroyedMeteors || 0}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`border-l-2 ${palette.border} ${palette.panel} p-5`}>
              <div className="flex items-start gap-4">
                <Activity className={`mt-0.5 h-5 w-5 shrink-0 ${palette.accent}`} />
                <div>
                  <p className={`font-orbitron text-xs font-black uppercase tracking-[0.2em] ${palette.accent}`}>
                    {language === 'pt' ? 'TELEMETRIA INTERROMPIDA' : 'TELEMETRY INTERRUPTED'}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                    {language === 'pt'
                      ? 'A integridade da nave chegou ao limite crítico. A carga foi interceptada e a operação encerrada pelo comando Horizon.'
                      : 'Ship integrity reached the critical limit. The cargo was intercepted and Horizon command terminated the operation.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <footer className={`mt-7 flex flex-col gap-4 border-t ${palette.softBorder} pt-6 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex items-center gap-3 text-slate-600">
              <span className={`h-2 w-2 ${palette.line}`} />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
                {language === 'pt' ? 'REGISTRO DE COMBATE ARQUIVADO' : 'COMBAT RECORD ARCHIVED'}
              </span>
            </div>
            <PremiumCanvasButton
              onClick={finishBattle}
              tone={isVictory ? 'green' : 'red'}
              className="h-14 w-full sm:w-auto sm:min-w-64"
              contentClassName="gap-3 font-orbitron text-sm font-black uppercase tracking-[0.24em] text-white"
            >
              {language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}
              <ChevronRight className="h-4 w-4" />
            </PremiumCanvasButton>
          </footer>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default function SolarInterstellarBattleExperience({
  activeBattle,
  routeTier,
  language,
  t,
  formatValue,
  finishBattle,
  resolveBattleVictory,
  resolveBattleDefeat,
  setActiveBattle,
  playSfx,
  stopSfx,
  addLog,
  voidResources,
  battleLevel,
  meteoriteRewardValue = 0,
  musicOn,
  jukebox,
}: SolarInterstellarBattleExperienceProps) {
  const battleAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);
  const playedOutcomeRef = useRef<string>('');
  const musicOnRef = useRef(musicOn);
  const [battleTheme] = useState(() => pickManualBattleTheme(routeTier));
  const stopJukebox = jukebox.stop;
  const playJukeboxPlaylist = jukebox.playPlaylist;
  const outcome = activeBattle.isVictory ? 'victory' : activeBattle.isDefeat ? 'defeat' : '';
  const targetVolume = Math.min(0.8, Math.max(0.18, Number(jukebox.volume ?? 0.5) * 0.95));
  const targetVolumeRef = useRef(targetVolume);


  useEffect(() => {
    musicOnRef.current = musicOn;
    targetVolumeRef.current = targetVolume;
    const volume = musicOn ? targetVolume : 0;
    if (battleAudioRef.current) battleAudioRef.current.volume = volume;
    if (resultAudioRef.current) resultAudioRef.current.volume = volume;
  }, [musicOn, targetVolume]);

  useEffect(() => {
    stopJukebox({ rememberPreference: false });
    if (typeof window !== 'undefined' && battleTheme) {
      const audio = new Audio(battleTheme);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = musicOnRef.current ? targetVolumeRef.current : 0;
      battleAudioRef.current = audio;
      if (musicOnRef.current) audio.play().catch((error) => reportPlaybackError('battle theme playback failed', error));
    }

    return () => {
      stopAudio(battleAudioRef.current);
      stopAudio(resultAudioRef.current);
      battleAudioRef.current = null;
      resultAudioRef.current = null;
      const routePlaylist = ROUTE_THEMES[routeTier]?.playlist;
      if (musicOnRef.current && routePlaylist?.length) {
        playJukeboxPlaylist(routePlaylist, { loop: false, rememberPreference: false });
      }
    };
  }, [battleTheme, playJukeboxPlaylist, routeTier, stopJukebox]);

  useEffect(() => {
    if (!outcome || playedOutcomeRef.current === outcome) return;
    playedOutcomeRef.current = outcome;
    stopAudio(battleAudioRef.current);
    battleAudioRef.current = null;

    const resultTheme = getManualBattleResultAudio(routeTier, outcome);
    if (typeof window === 'undefined' || !resultTheme) return;
    const audio = new Audio(resultTheme);
    audio.loop = false;
    audio.preload = 'auto';
    audio.volume = musicOn ? targetVolume : 0;
    resultAudioRef.current = audio;
    if (musicOn) audio.play().catch((error) => reportPlaybackError('result theme playback failed', error));
  }, [musicOn, outcome, routeTier, targetVolume]);

  if (outcome) {
    return (
      <ResultScreen
        activeBattle={activeBattle}
        routeTier={routeTier}
        language={language}
        formatValue={formatValue}
        finishBattle={finishBattle}
      />
    );
  }

  const stats = {
    hp: activeBattle.playerHp,
    maxHp: activeBattle.playerMaxHp,
    shield: 0,
    maxShield: 0,
    damage: (activeBattle.playerDps || 10) * 1.5,
    critChance: 0,
    lootEfficiency: 1,
    rarity: 'common' as const,
    upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 },
  };
  const enemies: VoidBattleEnemy[] = [{
    id: `solar-enemy-${activeBattle.id}`,
    type: activeBattle.isBoss ? 'Boss' : (activeBattle.enemyType === 'Elite' ? 'Elite' : 'Padrão'),
    name: activeBattle.enemyName,
    hp: activeBattle.enemyHp,
    maxHp: activeBattle.enemyMaxHp,
    shield: 0,
    maxShield: 0,
    damage: activeBattle.enemyDps || 10,
    qc: activeBattle.reward,
    x: 85,
    y: 50,
    image: activeBattle.enemyImage || '',
    spriteSheet: activeBattle.enemySpriteSheet,
  }];

  const forceBattleDefeat = () => {
    const updated = { ...activeBattle, isDefeat: true, playerHp: 0 };
    setActiveBattle(updated);
    resolveBattleDefeat(updated);
  };

  return (
    <div className="relative h-full w-full">
      <VoidBattleArena
        initialEnemies={enemies}
        playerShipStats={stats}
        voidResources={voidResources}
        routeTier={routeTier}
        locationId={0}
        activeShipImage={activeBattle.playerImage}
        activeShipSpriteSheet={activeBattle.playerSpriteSheet}
        battleLevel={battleLevel}
        onBattleEnd={(status, result) => {
          if (status === 'won') {
            const updated = {
              ...activeBattle,
              isVictory: true,
              enemyHp: 0,
              reward: result?.reward ?? activeBattle.reward,
              isMeteorEventReward: Boolean(result?.isMeteorEventReward),
              destroyedMeteors: result?.destroyedMeteors || 0,
              destroyedMeteorites: result?.destroyedMeteorites || 0,
              meteoriteRewardValue: result?.meteoriteRewardValue,
              meteorRewardValue: result?.meteorRewardValue,
              meteoriteRewardTotal: result?.meteoriteRewardTotal,
              meteorRewardTotal: result?.meteorRewardTotal,
            };
            setActiveBattle(updated);
            resolveBattleVictory(updated);
            return;
          }

          const updated = { ...activeBattle, isDefeat: true, playerHp: 0 };
          setActiveBattle(updated);
          resolveBattleDefeat(updated);
        }}
        onUpdateResources={() => {}}
        playSfx={playSfx}
        stopSfx={stopSfx}
        t={t}
        language={language}
        addLog={addLog}
        formatValue={formatValue}
        isGroupBattle={false}
        onExitBattle={forceBattleDefeat}
        meteoriteRewardValue={meteoriteRewardValue}
        disableMeteorEvent={false}
      />
    </div>
  );
}
