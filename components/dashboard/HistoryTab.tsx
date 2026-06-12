'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Upload, Target, Activity, TrendingUp, LogOut, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useDashboard } from './DashboardProvider';
import { GameStorage } from '@/lib/game-storage';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import { getOwnedArcadeIdsFromCards, normalizeOwnedColonyCardIds } from '@/lib/colony-cards';

const ROUTE4_DUST_PARTICLES = [
  { left: 72, top: 18, size: 1.3, delay: 0.1, duration: 8.5 },
  { left: 78, top: 25, size: 0.9, delay: 1.2, duration: 10.5 },
  { left: 84, top: 34, size: 1.1, delay: 2.1, duration: 9.2 },
  { left: 69, top: 42, size: 0.8, delay: 0.7, duration: 11.2 },
  { left: 91, top: 48, size: 1.2, delay: 1.8, duration: 8.8 },
  { left: 63, top: 56, size: 0.7, delay: 2.8, duration: 12.4 },
  { left: 75, top: 64, size: 1.0, delay: 3.1, duration: 10.1 },
  { left: 88, top: 70, size: 0.8, delay: 0.4, duration: 9.8 },
  { left: 57, top: 31, size: 0.7, delay: 1.5, duration: 12.0 },
  { left: 48, top: 39, size: 0.9, delay: 2.5, duration: 11.5 },
  { left: 36, top: 45, size: 0.8, delay: 1.1, duration: 13.2 },
  { left: 28, top: 53, size: 0.7, delay: 3.4, duration: 10.7 },
  { left: 18, top: 61, size: 1.0, delay: 0.9, duration: 12.6 },
  { left: 43, top: 22, size: 0.7, delay: 2.2, duration: 9.7 },
  { left: 54, top: 16, size: 0.8, delay: 4.0, duration: 11.8 },
  { left: 81, top: 12, size: 0.7, delay: 3.8, duration: 10.9 },
];
const ROUTE4_LOCKED_TV_SFX = [
  '/audio/sfx/bobby_blue/video tv/video_tv1.ogg',
  '/audio/sfx/bobby_blue/video tv/video_tv2.ogg',
  '/audio/sfx/bobby_blue/video tv/video_tv3.ogg',
];
const route4LockedTvSfxCache = new Map<string, HTMLAudioElement>();
let route4LockedTvSfxPlaying = false;

const playRandomRoute4LockedTvSfx = () => {
  if (typeof Audio === 'undefined' || route4LockedTvSfxPlaying) return;
  const src = ROUTE4_LOCKED_TV_SFX[Math.floor(Math.random() * ROUTE4_LOCKED_TV_SFX.length)];
  if (!src) return;

  let audio = route4LockedTvSfxCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    route4LockedTvSfxCache.set(src, audio);
  }

  route4LockedTvSfxPlaying = true;
  audio.currentTime = 0;
  audio.volume = 0.82;
  audio.onended = () => {
    route4LockedTvSfxPlaying = false;
  };
  audio.onerror = () => {
    route4LockedTvSfxPlaying = false;
  };
  audio.play().catch(() => {
    route4LockedTvSfxPlaying = false;
  });
};

const HistoryTab = memo(function HistoryTab() {
  const { 
    t, 
    language, 
    economy, 
    missions,
    progression, 
    formatValue, 
    playSfx, 
    exportGameData, 
    importGameData, 
    pauseMusicForRoute4Credits,
    colonies,
    historyPage, 
    setHistoryPage,
    isRoute2Unlocked,
    isRoute3Unlocked,
    setShowRoute2Goals
  } = useDashboard();

  const { routeTier } = progression;
  const { historyStats } = missions;


  const isInterstellar = routeTier === 'Interstellar';
  const isVoid = routeTier === 'Void';
  const isEarth = routeTier === 'Earth';
  const route4Unlocked = progression.unlockedTechLevels['Void'] >= 10; // Simple check
  const creditsVideoRef = useRef<HTMLVideoElement | null>(null);
  const [creditsPlaying, setCreditsPlaying] = useState(false);
  const [ownedCardIds, setOwnedCardIds] = useState<string[]>([]);

  const allNewEarthConstructionsComplete = progression.routeTier === 'Earth'
    && colonies.length > 0
    && colonies.every(colony => (
      colony.constructions?.length > 0
      && colony.constructions.every((construction: any) => construction.isComplete)
    ));
  const unlockedArcadeIds = getOwnedArcadeIdsFromCards(ownedCardIds);
  const route4CreditsUnlocked = allNewEarthConstructionsComplete
    && MINI_GAMES_CONFIG.every(game => unlockedArcadeIds.has(game.id));

  useEffect(() => {
    return () => {
      creditsVideoRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!isEarth) return;
    let mounted = true;

    const loadOwnedCards = () => GameStorage.load('colony_cards_data').then(saved => {
      if (!mounted) return;
      setOwnedCardIds(normalizeOwnedColonyCardIds(Array.isArray(saved) ? saved : []));
    });

    const handleCardsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      setOwnedCardIds(normalizeOwnedColonyCardIds(Array.isArray(detail) ? detail : []));
    };

    loadOwnedCards();
    window.addEventListener('qch:colony-cards-updated', handleCardsUpdated);
    window.addEventListener('focus', loadOwnedCards);
    return () => {
      mounted = false;
      window.removeEventListener('qch:colony-cards-updated', handleCardsUpdated);
      window.removeEventListener('focus', loadOwnedCards);
    };
  }, [isEarth]);

  const toggleRoute4Credits = async () => {
    const video = creditsVideoRef.current;
    if (!video || !route4CreditsUnlocked) {
      playRandomRoute4LockedTvSfx();
      return;
    }

    if (creditsPlaying) {
      video.pause();
      setCreditsPlaying(false);
      return;
    }

    pauseMusicForRoute4Credits();
    video.currentTime = 0;
    video.volume = 0.9;

    try {
      await video.play();
      setCreditsPlaying(true);
    } catch (error) {
      video.pause();
      setCreditsPlaying(false);
    }
  };

  return (
    <motion.div 
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 flex-1 flex flex-col h-full"
    >
      {isEarth ? (
        <>
          <div
            className="glass-panel neon-border-emerald bg-cover bg-center p-4 rounded-xl flex justify-between items-center"
            style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.38)), url('/assets/texturas/textura_historic_cap4.webp')" }}
          >
            <div>
              <h2 className="text-lg font-orbitron font-bold text-emerald-400 uppercase tracking-tighter">{t('history')}</h2>
              <p className="text-base text-slate-500 font-mono uppercase tracking-widest">{t('gameStatsByRoute')}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportGameData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-white/5"
              >
                <Download size={12} />
                {t('export')}
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono uppercase tracking-widest transition-all cursor-pointer bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-white/5">
                <Upload size={12} />
                {t('import')}
                <input type="file" className="hidden" accept=".dat" onChange={importGameData} />
              </label>
            </div>
          </div>
          <div className="glass-panel neon-border-emerald bg-black rounded-3xl min-h-[600px] shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <style>{`
              @keyframes route4DustFloat {
                0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.28; }
                45% { transform: translate3d(-8px, -10px, 0); opacity: 0.74; }
                70% { transform: translate3d(-12px, -4px, 0); opacity: 0.44; }
              }
              @keyframes route4LampPulse {
                0%, 100% { opacity: 0.58; transform: scale(0.94); }
                50% { opacity: 1; transform: scale(1.08); }
              }
              @keyframes route4TvAura {
                0%, 100% { opacity: 0.52; filter: blur(14px); }
                50% { opacity: 0.78; filter: blur(22px); }
              }
              @keyframes route4WindowGlow {
                0%, 100% { opacity: 0.72; transform: translate3d(0, 0, 0) scale(1); }
                50% { opacity: 0.9; transform: translate3d(-0.3%, -0.2%, 0) scale(1.015); }
              }
            `}</style>
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/images/bobby_blue/bobby_blue_new_land.webp"
                alt=""
                fill
                sizes="100vw"
                priority={false}
                className="object-cover opacity-70 saturate-125"
              />
              <div className="absolute inset-0 bg-black/18" />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[8] overflow-hidden mix-blend-screen">
              <div
                className="absolute right-[-4%] top-[3%] h-[72%] w-[38%] bg-[radial-gradient(ellipse_at_92%_22%,rgba(255,232,180,0.34)_0%,rgba(255,201,128,0.17)_28%,rgba(255,184,105,0.07)_48%,transparent_72%)] blur-[10px]"
                style={{ animation: 'route4WindowGlow 6.4s ease-in-out infinite' }}
              />
              <div
                className="absolute right-[13%] top-[11%] h-[53%] w-[22%] bg-[radial-gradient(ellipse_at_80%_18%,rgba(255,245,212,0.22)_0%,rgba(255,199,122,0.09)_42%,transparent_74%)] blur-[14px]"
                style={{ animation: 'route4WindowGlow 7.8s ease-in-out 0.9s infinite' }}
              />
              <div className="absolute bottom-[16%] right-[16%] h-[19%] w-[34%] bg-[radial-gradient(ellipse_at_center,rgba(255,192,116,0.11)_0%,rgba(255,177,88,0.045)_38%,transparent_72%)] blur-[16px]" />
              <div
                className="absolute left-[86.4%] top-[52.1%] h-[12.5%] w-[5.8%] rounded-full bg-[radial-gradient(circle,rgba(255,231,158,0.9)_0%,rgba(255,176,76,0.36)_38%,transparent_74%)] blur-[2px]"
                style={{ animation: 'route4LampPulse 3.6s ease-in-out infinite' }}
              />
              <div
                className="absolute left-[27.5%] top-[29.5%] h-[8.6%] w-[3.9%] rounded-full bg-[radial-gradient(circle,rgba(255,231,158,0.86)_0%,rgba(255,176,76,0.38)_42%,transparent_76%)] blur-[1.6px]"
                style={{ animation: 'route4LampPulse 4.1s ease-in-out 0.45s infinite' }}
              />
              <div className="absolute left-[-0.9%] top-[22.8%] h-[22.2%] w-[6.4%] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.24)_0%,rgba(34,211,238,0.09)_46%,transparent_74%)] blur-[5px]" />
              <div className="absolute left-[33.0%] bottom-[20.8%] h-[5.2%] w-[35.2%] bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.08)_12%,rgba(34,211,238,0.28)_48%,rgba(34,211,238,0.12)_84%,transparent_100%)] blur-[6px]" />
              <div className="absolute left-[34.6%] bottom-[23.6%] h-[0.9%] w-[32.2%] bg-[linear-gradient(90deg,transparent_0%,rgba(103,232,249,0.16)_12%,rgba(103,232,249,0.55)_48%,rgba(103,232,249,0.18)_86%,transparent_100%)] blur-[0.8px]" />
              <div
                className="absolute left-[33.7%] top-[12.4%] h-[45.5%] w-[34.7%] rounded-[1.2rem] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.46)_0%,rgba(34,211,238,0.22)_40%,transparent_74%)]"
                style={{ animation: 'route4TvAura 4.5s ease-in-out infinite' }}
              />
              {ROUTE4_DUST_PARTICLES.map((particle, index) => (
                <span
                  key={`route4-dust-${index}`}
                  className="absolute rounded-full bg-amber-100 shadow-[0_0_7px_rgba(255,229,180,0.62)]"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size * 1.35}px`,
                    height: `${particle.size * 1.35}px`,
                    animation: `route4DustFloat ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="absolute left-[35.45%] top-[15.15%] z-10 h-[39.75%] w-[30.95%] overflow-hidden rounded-[0.28rem] bg-black">
              <video
                ref={creditsVideoRef}
                src="/assets/rota4/videos/quantum_courier_credits.webm"
                className={`h-full w-full object-cover transition ${route4CreditsUnlocked ? '' : 'opacity-20 grayscale'}`}
                preload="metadata"
                playsInline
                onEnded={() => {
                  if (creditsVideoRef.current) creditsVideoRef.current.currentTime = 0;
                  setCreditsPlaying(false);
                }}
              />
              <button
                type="button"
                onClick={toggleRoute4Credits}
                className={`absolute inset-0 flex items-center justify-center text-cyan-100 transition-all ${route4CreditsUnlocked ? `bg-black/20 hover:bg-black/10 ${creditsPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}` : 'bg-black/72 opacity-100'}`}
                aria-label={route4CreditsUnlocked ? (creditsPlaying ? 'Pausar créditos da TV' : 'Reproduzir créditos da TV') : 'Transmissão final indisponível'}
              >
                {route4CreditsUnlocked ? (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/50 bg-black/55 shadow-[0_0_22px_rgba(34,211,238,0.25)] backdrop-blur-sm">
                    {creditsPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
                  </span>
                ) : (
                  <span className="rounded-lg border border-cyan-200/20 bg-black/70 px-4 py-3 text-center font-mono text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/80 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                    {language === 'pt' ? 'Transmissão final indisponível' : 'Final transmission unavailable'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : isVoid ? 'neon-border-purple' : 'neon-border-cyan'} p-3 px-5 rounded-2xl flex justify-between items-center shadow-lg border-2 relative overflow-hidden`}>
            <div 
              className="absolute inset-0 z-0 opacity-65 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url(${isInterstellar ? '/assets/texturas/historic/cap2/bg_header.webp' : '/assets/texturas/historic/cap1/bg_header.webp'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isInterstellar ? 'bg-orange-500/20 text-orange-400' : isVoid ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'} border border-white/10`}>
                <Activity size={20} />
              </div>
              <div>
                <h2 className={`text-xl font-orbitron font-black ${isInterstellar ? 'text-orange-400' : isVoid ? 'text-purple-400' : 'text-cyan-400'} uppercase tracking-[0.1em]`}>{t('history')}</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] opacity-80">{t('gameStatsByRoute')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              {!isEarth && (
                <button 
                  onClick={() => {
                    setShowRoute2Goals(true);
                    playSfx('open_window');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-bold uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]`}
                >
                  <Target size={14} />
                  {isVoid ? t('projectEarthGoals') : (isInterstellar || routeTier === 'Solar') ? (isInterstellar ? t('route3Goals') : t('route2Goals')) : t('goals')}
                </button>
              )}
              <div className="h-8 w-px bg-white/10 mx-1" />
              <button 
                onClick={exportGameData}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest transition-all ${isInterstellar ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30'} border-2`}
              >
                <Download size={14} />
                {t('export')}
              </button>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest transition-all cursor-pointer ${isInterstellar ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30'} border-2`}>
                <Upload size={14} />
                {t('import')}
                <input type="file" className="hidden" accept=".dat" onChange={importGameData} />
              </label>
            </div>
          </div>

          <div className="relative flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {(() => {
                const currentTier = routeTier as string;
                const availableTiers = ['Solar'];
                if (['Interstellar', 'Void', 'Earth'].includes(currentTier)) availableTiers.push('Interstellar');
                if (['Void', 'Earth'].includes(currentTier)) availableTiers.push('Void');
                if (currentTier === 'Earth') availableTiers.push('Earth');
                
                const tier = availableTiers[historyPage] || 'Solar';
                const stats = historyStats[tier] || {};
                
                const tierColor = tier === 'Solar' ? 'text-cyan-400' : tier === 'Interstellar' ? 'text-orange-400' : tier === 'Void' ? 'text-purple-400' : 'text-emerald-400';
                const tierBorder = tier === 'Solar' ? 'neon-border-cyan' : tier === 'Interstellar' ? 'neon-border-orange' : tier === 'Void' ? 'neon-border-purple' : 'neon-border-emerald';
                const tierBg = tier === 'Solar' ? 'bg-cyan-500/5' : tier === 'Interstellar' ? 'bg-orange-500/5' : tier === 'Void' ? 'bg-purple-500/5' : 'bg-emerald-500/5';
                const tierLabel = tier === 'Solar'
                  ? t('routes1')
                  : tier === 'Interstellar'
                    ? t('routes2')
                    : tier === 'Void'
                      ? (language === 'pt' ? 'Capítulo 3 - Rotas do Vazio: Projeto Terra' : 'Chapter 3 - Void Routes: Project Earth')
                      : (language === 'pt' ? 'Capítulo 4 - Nova Terra' : 'Chapter 4 - New Earth');

                return (
                  <motion.div 
                    key={tier}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`glass-panel ${tierBorder} ${tierBg} p-4 rounded-3xl space-y-3 flex-1 flex flex-col border-2 shadow-2xl relative overflow-hidden`}
                  >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner relative overflow-hidden">
                      <div 
                        className="absolute inset-0 z-0 opacity-65 mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: `url(${tier === 'Interstellar' ? '/assets/texturas/historic/cap2/bg_repo.webp' : '/assets/texturas/historic/cap1/bg_repo.webp'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <button 
                        onClick={() => setHistoryPage(prev => Math.max(0, prev - 1))}
                        disabled={historyPage === 0}
                        className={`p-2 rounded-xl transition-all relative z-10 ${historyPage === 0 ? 'text-slate-800 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <div className="flex flex-col items-center relative z-10">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">DATA REPOSITORY</span>
                        <h3 className={`font-orbitron text-lg font-black ${tierColor} uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                          {tierLabel}
                        </h3>
                      </div>

                      <button 
                        onClick={() => setHistoryPage(prev => Math.min(availableTiers.length - 1, prev + 1))}
                        disabled={historyPage >= availableTiers.length - 1}
                        className={`p-2 rounded-xl transition-all relative z-10 ${historyPage >= availableTiers.length - 1 ? 'text-slate-800 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>

                    {tier === 'Void' ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12 relative">
                        {/* Glitch Background Elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] pointer-events-none" />
                        
                        <motion.div 
                          className="relative w-72 h-72"
                          animate={{ 
                            y: [0, -20, 0],
                            rotate: [-3, 3, -3],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-black to-black rounded-[3rem] border-4 border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.3)] overflow-hidden backdrop-blur-xl">
                            <Image
                              src="/images/bobby_blue/bobby_blue_sad.png" 
                              alt="Sad Bobby" 
                              fill
                              sizes="288px"
                              className="w-full h-full object-cover opacity-60 mix-blend-lighten scale-110"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0)_50%,rgba(168,85,247,0.15)_50%)] bg-[length:100%_8px] pointer-events-none animate-scan" />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent" />
                          </div>

                          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-purple-500/60 rounded-tl-2xl" />
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-purple-500/60 rounded-br-2xl" />
                        </motion.div>
                        
                        <div className="text-center space-y-6 relative z-10">
                          <div className="flex flex-col items-center">
                            <span className="text-purple-500/50 font-mono text-[10px] tracking-[1em] mb-2 uppercase">System Error 404</span>
                            <motion.h4 
                              className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-400 uppercase tracking-[0.3em] italic drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {t('dataLostInTime')}
                            </motion.h4>
                          </div>
                          <div className="flex items-center justify-center gap-6">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                            <div className="w-3 h-3 rounded-full bg-purple-500/50 animate-ping" />
                            <div className="h-px w-24 bg-gradient-to-l from-transparent via-purple-500/50 to-transparent" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
                        <div className="space-y-3 flex-1 flex flex-col min-h-0">
                          <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              {t('totalDeliveriesBattlesMining')}
                            </h4>
                            <div className="space-y-2 bg-black/40 p-4 rounded-[1.5rem] border-2 border-white/5 flex-1 shadow-inner relative overflow-hidden group min-h-0">
                              <div 
                                className="absolute inset-0 z-0 opacity-65 mix-blend-overlay pointer-events-none"
                                style={{
                                  backgroundImage: `url(${tier === 'Interstellar' ? '/assets/texturas/historic/cap2/bg_left.webp' : '/assets/texturas/historic/cap1/bg_left.webp'})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              />
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors z-10" />
                              
                              <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('randomBattlesFound')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.randomBattlesFound || 0)}</span>
                                </div>
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('radarBattlesFound')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.radarBattlesFound || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('manualDeliveries')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.manualDeliveries || 0)}</span>
                                </div>
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('autoDeliveries')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.autoDeliveries || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('totalMiningPacksSold')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue((stats.manualMiningPacksSold || 0) + (stats.autoMiningPacksSold || 0))}</span>
                                </div>
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('totalExplorationMiningPacksSold')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue((stats.manualExtractionPacksSold || 0) + (stats.autoExtractionPacksSold || 0))}</span>
                                </div>
                              </div>
                              
                              <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center relative z-10">
                                <span className="text-slate-300 uppercase font-orbitron text-[10px] font-bold truncate">{t('missionsCompleted')}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (stats.missionsCompleted || 0) / 5)}%` }} />
                                  </div>
                                  <span className="font-orbitron font-black text-2xl text-emerald-400">{formatValue(stats.missionsCompleted || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 flex flex-col min-h-0">
                          <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                <TrendingUp className="w-4 h-4 text-cyan-400" />
                              </div>
                              {t('totalQCAcquired')}
                            </h4>
                            <div className="space-y-2 bg-black/40 p-4 rounded-[1.5rem] border-2 border-white/5 flex-1 shadow-inner relative group min-h-0 overflow-hidden">
                              <div 
                                className="absolute inset-0 z-0 opacity-65 mix-blend-overlay pointer-events-none"
                                style={{
                                  backgroundImage: `url(${tier === 'Interstellar' ? '/assets/texturas/historic/cap2/bg_right1.webp' : '/assets/texturas/historic/cap1/bg_right1.webp'})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              />
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/20 group-hover:bg-cyan-500/40 transition-colors z-10" />
                              
                              <div className="flex flex-col gap-1 relative z-10">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromDeliveries')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromDeliveries || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromMining')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromMining || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromExplorationMining')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromExtraction || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromMissions')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue((stats.qcFromMissions || 0) + (stats.qcFromTutorial || 0))}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromAllBattles')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromBattles || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="mt-auto pt-3 border-t-2 border-white/10 flex flex-col gap-1 relative z-10">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em] text-center font-bold">NET ACQUISITION</span>
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                  <span className="text-xs font-black text-white uppercase font-orbitron">{t('totalQCAcquired')}</span>
                                  <span className={`text-xl font-orbitron font-black ${tierColor} drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]`}>{formatValue(stats.qcTotalAcquired || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                                <LogOut className="w-4 h-4 text-pink-400 rotate-90" />
                              </div>
                              {t('totalQCSpent')}
                            </h4>
                            <div className="bg-pink-500/5 p-4 rounded-[1.5rem] border-2 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.05)] flex flex-col gap-2 relative group overflow-hidden">
                              <div 
                                className="absolute inset-0 z-0 opacity-65 mix-blend-overlay pointer-events-none"
                                style={{
                                  backgroundImage: `url(${tier === 'Interstellar' ? '/assets/texturas/historic/cap2/bg_right2.webp' : '/assets/texturas/historic/cap1/bg_right2.webp'})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              />
                              <div className="flex justify-between items-center relative z-10">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">{t('fromAllSources')}</span>
                                  <span className="text-[8px] text-pink-400/50 uppercase font-mono">EXPENDITURE</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-2xl font-orbitron font-black text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                                    {formatValue(Math.abs(stats.qcSpent || 0))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
});

export default HistoryTab;
