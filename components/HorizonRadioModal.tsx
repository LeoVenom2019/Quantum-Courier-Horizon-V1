'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, X, Radio, PlayCircle, Power, Sliders } from 'lucide-react';
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
  const { 
    masterMusicOn, 
    masterMusicVolume, 
    masterSfxOn, 
    masterSfxVolume, 
    updateSettings 
  } = useSoundMaster();

  const tl = (en: string, pt: string) => language === 'pt' ? pt : en;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]"
        >
          {/* Animated Background Grids */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 mb-10 border-b border-cyan-500/20 pb-6">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
              <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-orbitron font-black text-white tracking-[0.2em] uppercase neon-text-cyan">
                {tl('HORIZON RADIO', 'HORIZON RADIO')}
              </h2>
              <p className="text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase">
                {tl('MASTER AUDIO CONTROL CENTER', 'CENTRO DE CONTROLE MESTRE')}
              </p>
            </div>
          </div>

          <div className="space-y-10 relative z-10">
            {/* Music Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-3">
                  <Music className="w-5 h-5" /> {tl('MUSIC SYSTEMS', 'SISTEMAS DE MÚSICA')}
                </h3>
                <button 
                  onClick={() => updateSettings({ masterMusicOn: !masterMusicOn })}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-orbitron transition-all ${
                    masterMusicOn 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {masterMusicOn ? tl('ONLINE', 'LIGADO') : tl('OFFLINE', 'DESLIGADO')}
                </button>
              </div>

              <div className="flex items-center gap-6 bg-black/30 rounded-2xl p-6 border border-white/5 group hover:border-cyan-500/30 transition-all">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{tl('VOLUME LEVEL', 'NÍVEL DE VOLUME')}</span>
                    <span className="text-xs font-mono text-cyan-400">{Math.round(masterMusicVolume * 100)}%</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={masterMusicVolume}
                      onChange={(e) => updateSettings({ masterMusicVolume: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500 relative z-10"
                    />
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full blur-[2px] opacity-40 transition-all"
                      style={{ width: `${masterMusicVolume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SFX Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-orbitron font-bold text-orange-400 uppercase tracking-widest flex items-center gap-3">
                  <Volume2 className="w-5 h-5" /> {tl('SOUND EFFECTS', 'EFEITOS SONOROS')}
                </h3>
                <button 
                  onClick={() => updateSettings({ masterSfxOn: !masterSfxOn })}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-orbitron transition-all ${
                    masterSfxOn 
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {masterSfxOn ? tl('ONLINE', 'LIGADO') : tl('OFFLINE', 'DESLIGADO')}
                </button>
              </div>

              <div className="flex items-center gap-6 bg-black/30 rounded-2xl p-6 border border-white/5 group hover:border-orange-500/30 transition-all">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{tl('GAIN CONTROL', 'CONTROLE DE GANHO')}</span>
                    <span className="text-xs font-mono text-orange-400">{Math.round(masterSfxVolume * 100)}%</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={masterSfxVolume}
                      onChange={(e) => updateSettings({ masterSfxVolume: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500 relative z-10"
                    />
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full blur-[2px] opacity-40 transition-all"
                      style={{ width: `${masterSfxVolume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Jukebox Launcher */}
            <div className="pt-6">
              <button 
                onClick={() => {
                  onOpenJukebox();
                  onClose();
                }}
                className="w-full group relative overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center gap-4 hover:border-cyan-500 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <PlayCircle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-orbitron font-black text-white tracking-[0.3em] uppercase">
                  {tl('OPEN JUKEBOX', 'ABRIR JUKEBOX')}
                </span>
                <Sliders className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.5em]">
              QUANTUM COURIER AUDIO ENGINE // HORIZON MODULE
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
