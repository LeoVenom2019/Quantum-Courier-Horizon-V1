'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, t } from '@/lib/i18n';
import { Rocket, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';
import { SpaceAmbience } from './SpaceAmbience';
import { BobbyBlueCharacter, BobbyBlueVariant } from './BobbyBlueCharacter';

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
    en: "The year is 2978. Earth... Ah, our old Earth. Now it's just a garden of memories protected by laws we cannot break.",
    pt: "O ano é 2978. A Terra... Ah, a nossa velha Terra. Agora é apenas um jardim de memórias protegido por leis que não podemos quebrar."
  },
  {
    en: "But look out there... From Mercury to the frozen depths of Pluto, humanity has not just survived. We have flourished.",
    pt: "Mas olhe lá fora... De Mercúrio às profundezas gélidas de Plutão, a humanidade não apenas sobreviveu. Nós florescemos."
  },
  {
    en: "A stellar empire is not made of weapons, Commander. It's made of flow. Of logistics. Of courage.",
    pt: "Um império estelar não é feito de armas, Comandante. É feito de fluxo. De logística. De coragem."
  },
  {
    en: "The quantum rift is open. The Quantum Courier Horizon awaits your orders for the first jump.",
    pt: "A fenda quântica está aberta. O Quantum Courier Horizon aguarda suas ordens para o primeiro salto."
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
    <div className="mt-8 p-4 bg-slate-900/80 border border-cyan-500/20 rounded-xl space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map(key => (
            <div key={key} className="w-6 h-6 bg-slate-800 border border-cyan-500/10 rounded flex items-center justify-center text-[8px] text-cyan-500/40 font-orbitron">
              {key}
            </div>
          ))}
        </div>
      ))}
      <div className="flex justify-center mt-2">
        <div className="w-32 h-6 bg-slate-800 border border-cyan-500/10 rounded" />
      </div>
    </div>
  );
};

export const IntroNarrative = ({ 
  onComplete, 
  onCancel,
  language,
  playerName,
  setPlayerName 
}: { 
  onComplete: () => void; 
  onCancel: () => void;
  language: Language;
  playerName: string;
  setPlayerName: (name: string) => void;
}) => {
  const [index, setIndex] = useState(0);
  const [showPlayerId, setShowPlayerId] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");

  const LOADING_STEPS = [
    { progress: 10, en: "Initializing systems...", pt: "Inicializando sistemas..." },
    { progress: 25, en: "Loading neural modules...", pt: "Carregando módulos neurais..." },
    { progress: 40, en: "Calibrating quantum engineering...", pt: "Calibrando engenharia quântica..." },
    { progress: 60, en: "Verifying security levels...", pt: "Verificando níveis de segurança..." },
    { progress: 80, en: "Scanning possible delivery routes...", pt: "Escaneando rotas de entrega..." },
    { progress: 95, en: "Establishing link...", pt: "Estabelecendo link..." },
    { progress: 100, en: "Ready.", pt: "Pronto." }
  ];

  const currentText = STORY_TEXT[index] ? t(language, STORY_TEXT[index].en, STORY_TEXT[index].pt) : "";
  const displayedText = currentText.slice(0, charCount);

  useEffect(() => {
    if (index < STORY_TEXT.length) {
      setIsTyping(true);
      setCharCount(0);
    }
  }, [index, language]);

  useEffect(() => {
    if (index < STORY_TEXT.length) {
      if (charCount < currentText.length) {
        const timer = setTimeout(() => {
          setCharCount(prev => prev + 1);
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        const nextTimer = setTimeout(() => {
          if (index < STORY_TEXT.length - 1) {
            setIndex(prev => prev + 1);
          } else {
            setShowPlayerId(true);
          }
        }, 3000);
        return () => clearTimeout(nextTimer);
      }
    }
  }, [index, charCount, currentText.length]);

  const handleSkip = () => {
    setShowPlayerId(true);
  };

  const handleConfirmName = () => {
    if (playerName.trim() && !isLoading) {
      setIsLoading(true);
      let stepIndex = 0;
      
      const updateLoading = () => {
        if (stepIndex < LOADING_STEPS.length) {
          const step = LOADING_STEPS[stepIndex];
          setLoadingProgress(step.progress);
          setLoadingStatus(t(language, step.en, step.pt));
          stepIndex++;
          setTimeout(updateLoading, 800 + Math.random() * 1200);
        } else {
          onComplete();
        }
      };
      
      updateLoading();
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
                onClick={handleSkip}
                className="mt-12 text-cyan-500 font-orbitron text-[10px] tracking-[0.3em] uppercase border border-cyan-500/30 px-6 py-2 rounded-full hover:bg-cyan-500/10 transition-all"
              >
                {t(language, "Skip Narrative", "Pular Narrativa")}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="player-id"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl relative"
            >
              {/* Notebook Frame */}
              <div className="bg-slate-900 border-x-8 border-t-8 border-slate-800 rounded-t-3xl p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="bg-[#0a0a1a] border-2 border-cyan-500/30 rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                  {/* Close Button */}
                  <button 
                    onClick={onCancel}
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
                            {t(language, "Pilot Name", "Nome do Piloto")}
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
              <div className="bg-slate-800 border-x-8 border-b-8 border-slate-700 rounded-b-3xl p-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
                <KeyboardVisual />
                
                {/* Trackpad area */}
                <div className="mt-6 flex justify-center">
                  <div className="w-40 h-24 bg-slate-900/50 border border-cyan-500/10 rounded-xl" />
                </div>

                {/* Status Lights */}
                <div className="absolute bottom-4 right-8 flex gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]" />
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
    </div>
  );
};
