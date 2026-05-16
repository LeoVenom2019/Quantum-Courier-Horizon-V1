'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, X, Radio, PlayCircle, Sliders } from 'lucide-react';
import { useSoundMaster } from '@/hooks/useSoundMaster';

interface HorizonRadioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJukebox: () => void;
  language: 'pt' | 'en';
}

export const HorizonRadioModal: React.FC<HorizonRadioModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenJukebox,
  language 
}) => {
  const master = useSoundMaster();
  const { masterMusicOn, masterMusicVolume, masterSfxOn, masterSfxVolume, updateSettings } = master;

  const tl = (en: string, pt: string) => language === 'pt' ? pt : en;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="w-full max-w-lg bg-slate-950/90 border-2 border-cyan-500/30 rounded-[2.5rem] p-1 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]"
          >
            {/* Animated background patterns */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,2px_100%] opacity-20" />
            </div>

            <div className="bg-slate-900/90 rounded-[2.3rem] p-8 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <Radio className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-black text-white tracking-[0.2em] uppercase neon-text-cyan">
                      Horizon Radio
                    </h2>
                    <p className="text-[10px] font-mono text-cyan-500/40 tracking-[0.2em] uppercase">
                      Audio Engine v3.0 // Ready
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Controls */}
              <div className="space-y-8">
                {/* Music Control */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Music className={`w-4 h-4 ${masterMusicOn ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-orbitron font-bold text-slate-300 uppercase tracking-widest">
                        {tl('MUSIC SYSTEM', 'SISTEMA DE MÚSICA')}
                      </span>
                    </div>
                    <button 
                      onClick={() => updateSettings({ masterMusicOn: !masterMusicOn })}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-orbitron font-bold transition-all border ${
                        masterMusicOn 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-500'
                      }`}
                    >
                      {masterMusicOn ? 'ONLINE' : 'OFFLINE'}
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-500 w-8">0%</span>
                    <div className="flex-1 relative h-6 flex items-center">
                      <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={masterMusicVolume}
                        onChange={(e) => updateSettings({ masterMusicVolume: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 w-10 text-right">
                      {Math.round(masterMusicVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* SFX Control */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${masterSfxOn ? 'text-orange-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-orbitron font-bold text-slate-300 uppercase tracking-widest">
                        {tl('SFX ENGINE', 'MOTOR DE SFX')}
                      </span>
                    </div>
                    <button 
                      onClick={() => updateSettings({ masterSfxOn: !masterSfxOn })}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-orbitron font-bold transition-all border ${
                        masterSfxOn 
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-500'
                      }`}
                    >
                      {masterSfxOn ? 'ACTIVE' : 'MUTED'}
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-500 w-8">0%</span>
                    <div className="flex-1 relative h-6 flex items-center">
                      <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={masterSfxVolume}
                        onChange={(e) => updateSettings({ masterSfxVolume: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 w-10 text-right">
                      {Math.round(masterSfxVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* Advanced SFX Mixer */}
                <div className="pt-6 border-t border-white/5 space-y-6">
                  <h3 className="text-[10px] font-orbitron font-black text-slate-500 uppercase tracking-[0.4em] mb-4">
                    {tl('ADVANCED MIXER', 'MIXER AVANÇADO')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* UI Volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-slate-400">
                        <span>{tl('INTERFACE', 'INTERFACE')}</span>
                        <span className="text-cyan-400">{Math.round((master.uiVolume || 0) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={master.uiVolume ?? 0.6}
                        onChange={(e) => master.updateSettings({ uiVolume: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>

                    {/* Player Volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-slate-400">
                        <span>{tl('PLAYER', 'JOGADOR')}</span>
                        <span className="text-purple-400">{Math.round((master.playerVolume || 0) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={master.playerVolume ?? 1.0}
                        onChange={(e) => master.updateSettings({ playerVolume: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Enemy Volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-slate-400">
                        <span>{tl('ENEMIES', 'INIMIGOS')}</span>
                        <span className="text-red-400">{Math.round((master.enemyVolume || 0) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={master.enemyVolume ?? 0.7}
                        onChange={(e) => master.updateSettings({ enemyVolume: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-500"
                      />
                    </div>

                    {/* Ambient Volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-slate-400">
                        <span>{tl('AMBIENT', 'AMBIENTE')}</span>
                        <span className="text-emerald-400">{Math.round((master.ambientVolume || 0) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={master.ambientVolume ?? 0.8}
                        onChange={(e) => master.updateSettings({ ambientVolume: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Jukebox Quick Access */}
                <button 
                  onClick={onOpenJukebox}
                  className="w-full group relative mt-4 py-4 bg-gradient-to-r from-cyan-600/10 via-cyan-500/5 to-transparent border border-cyan-500/20 rounded-2xl flex items-center justify-center gap-4 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <PlayCircle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-orbitron font-black text-white tracking-[0.3em] uppercase">
                    {tl('OPEN JUKEBOX', 'ABRIR JUKEBOX')}
                  </span>
                  <Sliders className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.5em]">
                  QUANTUM COURIER AUDIO ENGINE // HORIZON MODULE
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
