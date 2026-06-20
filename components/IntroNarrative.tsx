'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Language, t } from '@/lib/i18n';
import { Rocket, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';
import { SpaceAmbience } from './SpaceAmbience';
import { BobbyBlueCharacter, BobbyBlueVariant } from './BobbyBlueCharacter';
import { useSFX } from '@/hooks/useSFX';
import {
  getAssetGroupsSummary,
  getRecommendedAssetGroupsForRoute,
  preloadAssetGroups,
  subscribeAssetPreloader,
} from '@/lib/asset-preloader';

const STORY_TEXT = [
  {
    en: "[INCOMING SIGNAL DETECTED... NEURAL SYNC AT 99%]",
    pt: "[SINAL DE ENTRADA DETECTADO... SINCRONIZAÇÃO NEURAL EM 99%]"
  },
  {
    en: "Commander... You finally woke up. I am Bobby Blue, your quantum intelligence interface.",
    pt: "Comandante... Você finalmente acordou. Eu sou Bobby Blue, sua interface de inteligência quântica."
  },
  {
    en: "The year is 2978. Earth still exists, but it is no longer the living center of humanity. Too wounded to be home. Too important to be forgotten.",
    pt: "O ano é 2978. A Terra ainda existe, mas já não é o centro vivo da humanidade. Ferida demais para ser lar. Importante demais para ser esquecida."
  },
  {
    en: "After the climate collapse, the orbital exodus and the resource wars, its surface was sealed under preservation protocols. Few are allowed to touch the old world.",
    pt: "Após o colapso climático, o êxodo orbital e as guerras por recursos, sua superfície foi isolada por protocolos de preservação. Poucos têm permissão para tocar o velho mundo."
  },
  {
    en: "But look out there... From Mercury to the frozen edges of the Solar System, humanity learned to survive through routes, cargo and courage.",
    pt: "Mas olhe lá fora... De Mercúrio às bordas geladas do Sistema Solar, a humanidade aprendeu a sobreviver por meio de rotas, carga e coragem."
  },
  {
    en: "Chapter 1 - The Solar Routes begins now. The Quantum Courier Horizon awaits your first command.",
    pt: "Capítulo 1 - As Rotas Solares começa agora. O Quantum Courier Horizon aguarda seu primeiro comando."
  },
  {
    en: "Finalizing authority transfer... Show me who is in command this time.",
    pt: "Finalizando transferência de autoridade... Mostre-me quem está no comando desta vez."
  }
];

// RobotVisual was here, replaced by BobbyBlueCharacter

const StarBackground = () => {
  const [stars] = useState<{ id: number; x: number; y: number; size: number; speed: number; delay: number }[]>(() => 
    Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 10 + 2,
      delay: Math.random() * 10,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <motion.div
          key={star.id}
          initial={{ x: `${star.x}vw`, y: `${star.y}vh`, opacity: 0 }}
          animate={{ 
            x: [`${star.x}vw`, `${star.x - 120}vw`], // Fly from right to left
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: star.speed, 
            repeat: Infinity, 
            ease: "linear",
            delay: star.delay
          }}
          className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
          style={{ width: star.size, height: star.size }}
        />
      ))}
    </div>
  );
};

const KeyboardVisual = () => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="mt-8 p-6 bg-[#08080c] border border-white/5 rounded-xl space-y-3 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
      {/* Keyboard RGB Underglow Wave */}
      <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none">
        <motion.div 
          animate={{ 
            background: [
              'linear-gradient(90deg, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',
              'linear-gradient(90deg, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000, #ff00ff)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-[200%] h-full -ml-[50%]"
        />
      </div>

      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-2 relative z-10">
          {row.map((key, keyIdx) => (
            <motion.div 
              key={key}
              animate={{ 
                color: ['#ff4444', '#44ff44', '#4444ff', '#ff4444'],
                boxShadow: [
                  '0 0 10px rgba(255,68,68,0.2)',
                  '0 0 10px rgba(68,255,68,0.2)',
                  '0 0 10px rgba(68,68,255,0.2)',
                  '0 0 10px rgba(255,68,68,0.2)'
                ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: (i * 0.1) + (keyIdx * 0.05) 
              }}
              className="w-8 h-8 bg-[#121218] border border-white/10 rounded flex items-center justify-center text-[10px] font-orbitron font-bold relative shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]"
            >
              {key}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded pointer-events-none" />
            </motion.div>
          ))}
        </div>
      ))}
      <div className="flex justify-center mt-3 relative z-10">
        <motion.div 
          animate={{ 
            boxShadow: [
              '0 0 15px rgba(255,68,68,0.3)',
              '0 0 15px rgba(68,255,68,0.3)',
              '0 0 15px rgba(68,68,255,0.3)',
              '0 0 15px rgba(255,68,68,0.3)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-48 h-8 bg-[#121218] border border-white/10 rounded shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

export const IntroNarrative = ({ 
  onComplete, 
  onCancel,
  language,
  playerName,
  setPlayerName,
  sfxOn
}: { 
  onComplete: () => void | Promise<void>; 
  onCancel: () => void;
  language: Language;
  playerName: string;
  setPlayerName: (name: string) => void;
  sfxOn?: boolean;
}) => {
  const { playSfx } = useSFX(sfxOn);
  const [index, setIndex] = useState(0);
  const [showPlayerId, setShowPlayerId] = useState(false);
  const [typingState, setTypingState] = useState({ key: '', charCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [isAlienEggActive, setIsAlienEggActive] = useState(false);
  const [showAlienMessage, setShowAlienMessage] = useState(false);
  const [showFullAlienGlitch, setShowFullAlienGlitch] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRunRef = useRef(0);
  const loadingUnsubscribeRef = useRef<(() => void) | null>(null);

  const currentText = STORY_TEXT[index] ? t(language, STORY_TEXT[index].en, STORY_TEXT[index].pt) : "";
  const typingKey = `${index}:${language}`;
  const charCount = typingState.key === typingKey ? typingState.charCount : 0;
  const isTyping = index < STORY_TEXT.length && charCount < currentText.length;
  const displayedText = currentText.slice(0, charCount);

  useEffect(() => {
    if (index >= STORY_TEXT.length) return;

    if (charCount < currentText.length) {
      const timer = setTimeout(() => {
        setTypingState(prev => ({
          key: typingKey,
          charCount: prev.key === typingKey ? prev.charCount + 1 : 1,
        }));
      }, 30);
      return () => clearTimeout(timer);
    }

    const nextTimer = setTimeout(() => {
      if (index < STORY_TEXT.length - 1) {
        setIndex(prev => prev + 1);
      } else {
        setShowPlayerId(true);
      }
    }, 3000);
    return () => clearTimeout(nextTimer);
  }, [index, charCount, currentText.length, typingKey]);

  // Cleanup loading timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingUnsubscribeRef.current?.();
      loadingUnsubscribeRef.current = null;
      loadingRunRef.current += 1;
    };
  }, []);

  const handleSkip = () => {
    setShowPlayerId(true);
  };

  const triggerAlienEasterEgg = () => {
    playSfx('alert_alert');
    setIsAlienEggActive(true);
    setTimeout(() => {
      setShowAlienMessage(true);
    }, 800);
  };

  const closeAlienMessage = () => {
    setShowAlienMessage(false);
    setShowFullAlienGlitch(true);
    playSfx('error');
    setTimeout(() => {
      setShowFullAlienGlitch(false);
      setIsAlienEggActive(false);
      setPlayerName('');
    }, 2500);
  };

  const runRealIntroLoading = async () => {
    const runId = loadingRunRef.current + 1;
    loadingRunRef.current = runId;
    const groups = getRecommendedAssetGroupsForRoute('Solar');

    const updateLoadingState = () => {
      const summary = getAssetGroupsSummary(groups);
      const progress = Math.max(summary.total > 0 ? 4 : 100, Math.round(summary.progress * 100));
      setLoadingProgress(progress);
      setLoadingStatus(
        progress >= 100
          ? t(language, "Ready.", "Pronto.")
          : t(language, "Preparing Solar Route assets...", "Preparando assets das Rotas Solares...")
      );
    };

    updateLoadingState();
    loadingUnsubscribeRef.current?.();
    loadingUnsubscribeRef.current = subscribeAssetPreloader(updateLoadingState);

    try {
      await preloadAssetGroups(groups);
      if (loadingRunRef.current !== runId) return;
      updateLoadingState();
      await onComplete();
    } catch {
      if (loadingRunRef.current !== runId) return;
      setLoadingStatus(t(language, "Ready.", "Pronto."));
      setLoadingProgress(100);
      await onComplete();
    } finally {
      if (loadingRunRef.current === runId) {
        loadingUnsubscribeRef.current?.();
        loadingUnsubscribeRef.current = null;
      }
    }
  };

  const handleConfirmName = () => {
    if (playerName.toLowerCase().trim() === 'alien' && !isLoading) {
      setPlayerName(''); // Immediately clear the name to prevent bypass
      triggerAlienEasterEgg();
      return;
    }
    if (playerName.trim() && !isLoading) {
      playSfx('login_start', { volume: 0.8 });
      setIsLoading(true);
      runRealIntroLoading();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020208] flex items-center justify-center p-8 md:p-24 overflow-hidden">
      <SpaceAmbience isPlaying={true} volume={0.2} />
      <StarBackground />
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-10" />

      <div className="max-w-4xl w-full flex flex-col items-center relative z-20">
        <AnimatePresence mode="wait">
          {!showPlayerId ? (
            <motion.div 
              key="narrative"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                x: index === 0 || index === 6 ? [0, -2, 2, -1, 1, 0] : 0 
              }}
              transition={{ 
                duration: 0.5,
                x: { duration: 0.3, repeat: 1 }
              }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <BobbyBlueCharacter 
                variant={index === 0 ? 'glitch' : 'intro'} 
                isSpeaking={isTyping} 
                className="mb-8"
              />
              
              <div className="min-h-[120px] flex items-center justify-center px-8 w-full">
                <p className="text-xl md:text-2xl font-orbitron leading-relaxed text-cyan-100/90 tracking-wide drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {displayedText}
                  {isTyping && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-1 h-6 bg-cyan-400 ml-1 align-middle" />}
                </p>
              </div>

              {/* Skip Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                onClick={() => {
                  playSfx('aba_click');
                  handleSkip();
                }}
                className="mt-12 text-cyan-500 font-orbitron text-[10px] tracking-[0.3em] uppercase border border-cyan-500/30 px-6 py-2 rounded-full hover:bg-cyan-500/10 transition-all"
              >
                {t(language, "Skip Narrative", "Pular Narrativa")}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="player-id"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                x: isAlienEggActive ? [0, -4, 4, -4, 4, 0] : 0
              }}
              transition={{
                x: isAlienEggActive ? { duration: 0.2, repeat: Infinity } : { duration: 0.5 }
              }}
              className="w-full max-w-2xl relative"
            >
              {/* Notebook Frame */}
              <div className="bg-slate-900 border-x-8 border-t-8 border-slate-800 rounded-t-3xl p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="bg-[#0a0a1a] border-2 border-cyan-500/30 rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                  {/* Close Button */}
                  <button 
                    onClick={() => {
                      playSfx('aba_click');
                      if (loadingTimeoutRef.current) {
                        clearTimeout(loadingTimeoutRef.current);
                        loadingTimeoutRef.current = null;
                      }
                      loadingUnsubscribeRef.current?.();
                      loadingUnsubscribeRef.current = null;
                      loadingRunRef.current += 1;
                      setIsLoading(false);
                      onCancel();
                    }}
                    className="absolute top-4 right-4 text-cyan-500/50 hover:text-cyan-400 transition-colors z-30"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Decorative HUD corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-xl" />

                  <AnimatePresence mode="wait">
                    {!isLoading ? (
                      <motion.div
                        key="input-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                      >
                        <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-[0.2em] text-center uppercase">
                          {t(language, "Identification Required", "Identificação Necessária")}
                        </h2>

                        <div className="space-y-3 max-w-md mx-auto">
                          <label className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-[0.4em] block ml-1">
                            {t(language, "Master Key Name", "Master Key Name")}
                          </label>
                          <div className="relative">
                            <input 
                              type="text"
                              value={playerName}
                              onChange={(e) => setPlayerName(e.target.value)}
                              placeholder={t(language, "Enter your name...", "Digite seu nome...")}
                              className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg px-5 py-4 text-white font-orbitron text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-600"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleConfirmName()}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500/30">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        <div className="max-w-md mx-auto">
                          <motion.button 
                            whileHover={playerName.trim() ? { scale: 1.02, boxShadow: '0 0 20px rgba(6,182,212,0.4)' } : {}}
                            whileTap={playerName.trim() ? { scale: 0.98 } : {}}
                            onClick={handleConfirmName}
                            disabled={!playerName.trim()}
                            className={`w-full py-5 rounded-lg font-orbitron tracking-[0.3em] transition-all flex items-center justify-center gap-3 group ${
                              playerName.trim() 
                                ? 'bg-cyan-500 text-black font-bold hover:bg-cyan-400' 
                                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'
                            }`}
                          >
                            <span className={playerName.trim() ? 'opacity-100' : 'opacity-40'}>
                              {t(language, "INITIALIZE SYSTEMS", "INICIALIZAR SISTEMAS")}
                            </span>
                            {playerName.trim() && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="loading-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8 text-center"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                          <h3 className="text-xl font-orbitron text-white tracking-widest uppercase animate-pulse">
                            {loadingStatus}
                          </h3>
                        </div>

                        <div className="max-w-md mx-auto space-y-2">
                          <div className="flex justify-between text-[10px] font-orbitron text-cyan-500/60 tracking-widest uppercase">
                            <span>{t(language, "System Progress", "Progresso do Sistema")}</span>
                            <span>{loadingProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/20">
                            <motion.div 
                              className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${loadingProgress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-cyan-500/30 uppercase tracking-[0.3em]">
                          {t(language, "Neural link synchronization in progress...", "Sincronização de link neural em andamento...")}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Notebook Base / Keyboard */}
              <div className="bg-[#1a1c25] border-x-[12px] border-b-[12px] border-[#252836] rounded-b-[4rem] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
                {/* Brushed metal texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none " />
                
                {/* RGB Side Strips */}
                <motion.div 
                  animate={{ background: ['linear-gradient(to bottom, #ff0000, #00ff00, #0000ff, #ff0000)'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 top-0 w-1 h-full blur-[2px]" 
                />
                <motion.div 
                  animate={{ background: ['linear-gradient(to bottom, #ff0000, #00ff00, #0000ff, #ff0000)'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute right-0 top-0 w-1 h-full blur-[2px]" 
                />

                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0a0a0f] shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
                
                {/* Branding Section */}
                <div className="flex flex-col items-center mb-4 space-y-1 relative z-10">
                   <motion.div 
                    animate={{ filter: ['drop-shadow(0 0 5px #00ffff)', 'drop-shadow(0 0 15px #ff00ff)', 'drop-shadow(0 0 5px #00ffff)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                   >
                     <Sparkles className="w-8 h-8 text-white mb-1" />
                   </motion.div>
                   <h3 className="font-orbitron font-black text-white tracking-[0.5em] text-xs uppercase opacity-80">
                     ALIEN WAIT
                   </h3>
                </div>

                <KeyboardVisual />
                
                {/* Trackpad area */}
                <div className="mt-8 flex justify-center relative items-end">
                  {/* Alien Wait Sticker Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-8 bottom-2 w-24 h-16 bg-gradient-to-br from-[#1e1e26] to-[#0a0a0f] border border-white/10 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden hover:scale-105 transition-all duration-500 cursor-default z-20 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50" />
                    <Image unoptimized width={800} height={600} 
                      src="/images/ui/alien_wait.webp" 
                      alt="Alien Wait Badge" 
                      className="w-20 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-all"
                    />
                    {/* Holographic shine effect */}
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                    />
                  </motion.div>

                  <div className="w-48 h-28 bg-[#0a0a0f] border border-white/5 rounded-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent" />
                    <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Status Lights */}
                <div className="absolute bottom-6 right-10 flex gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      {!showPlayerId && (
        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500/10 w-full">
          <motion.div 
            className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]"
            initial={{ width: 0 }}
            animate={{ width: `${(index / STORY_TEXT.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      {/* Alien Easter Egg Modal */}
      <AnimatePresence>
        {showAlienMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border-2 border-rose-500/50 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.3)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/50">
                  <span className="text-2xl font-bold text-rose-500">!</span>
                </div>
                <h3 className="text-xl font-orbitron text-white uppercase tracking-widest">{language === 'pt' ? 'ERRO DE SISTEMA' : 'SYSTEM ERROR'}</h3>
              </div>
              <p className="text-slate-300 font-orbitron text-sm leading-relaxed mb-8">
                {language === 'pt' ? 'NOME DE USUÁRIO JÁ FOI USADO...' : 'USER NAME ALREADY IN USE...'}
              </p>
              <button
                onClick={closeAlienMessage}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-orbitron text-xs tracking-[0.3em] uppercase rounded-xl transition-all shadow-lg"
              >
                {language === 'pt' ? 'FECHAR' : 'CLOSE'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Alien Glitch Overlay */}
      <AnimatePresence>
        {showFullAlienGlitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 z-10 opacity-30">
               <div className="w-full h-full  bg-cover mix-blend-screen" />
            </div>
            
            <motion.div
              animate={{
                x: [0, -10, 10, -5, 5, 0],
                y: [0, 5, -5, 2, -2, 0],
                scale: [1, 1.1, 0.9, 1.05, 1],
                filter: [
                  'hue-rotate(0deg) brightness(1)',
                  'hue-rotate(90deg) brightness(2)',
                  'hue-rotate(180deg) brightness(0.5)',
                  'hue-rotate(270deg) brightness(1.5)',
                  'hue-rotate(360deg) brightness(1)'
                ]
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="relative w-96 h-96"
            >
              <Image unoptimized width={800} height={600} 
                src="/images/ui/alien_wait.webp" 
                alt="Alien Easter Egg" 
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]"
              />
              
              {/* RGB Split Effect Layers */}
              <motion.img 
                src="/images/ui/alien_wait.webp" 
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-50"
                animate={{ x: [-5, 5, -5], y: [2, -2, 2] }}
                transition={{ duration: 0.1, repeat: Infinity }}
                style={{ filter: 'invert(100%) sepia(100%) saturate(1000%) hue-rotate(0deg)' }}
              />
              <motion.img 
                src="/images/ui/alien_wait.webp" 
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-50"
                animate={{ x: [5, -5, 5], y: [-2, 2, -2] }}
                transition={{ duration: 0.1, repeat: Infinity }}
                style={{ filter: 'invert(100%) sepia(100%) saturate(1000%) hue-rotate(180deg)' }}
              />
            </motion.div>
            
            {/* Scanlines and Noise */}
            <div className="absolute inset-0 pointer-events-none  opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 bg-[length:100%_200%] animate-scan" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
