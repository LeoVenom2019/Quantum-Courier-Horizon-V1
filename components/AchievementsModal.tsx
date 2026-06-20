'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  CheckCircle2, 
  Coins, 
  Sword, 
  Shield,
  Bot, 
  Globe, 
  Cpu, 
  Skull, 
  Rocket, 
  TrendingUp, 
  Zap, 
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ACHIEVEMENTS, ThemeColor } from '@/lib/game-data';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedAchievements: string[];
  achievementProgress: { [key: string]: number };
  language: 'pt' | 'en';
  theme?: ThemeColor;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  unlockedAchievements,
  achievementProgress,
  language,
  theme = 'cyan'
}) => {
  const [page, setPage] = useState(0);
  const isInterstellar = theme === 'orange';
  const isPortuguese = language === 'pt';

  const formatValue = (val: number) => {
    if (val >= 1e12) return (val / 1e12).toFixed(1) + ' TRI';
    if (val >= 1e9) return (val / 1e9).toFixed(1) + ' BI';
    if (val >= 1e6) return (val / 1e6).toFixed(1) + ' MI';
    if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return val.toString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} w-full max-w-4xl p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden`}
          >
            {/* Background Glow */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isInterstellar ? 'via-orange-500' : 'via-cyan-500'} to-transparent opacity-50`} />
            
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-3xl font-orbitron font-black ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} uppercase tracking-[0.3em]`}>
                  {isPortuguese ? 'Conquistas' : 'Achievements'}
                </h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] mt-1">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.length} {isPortuguese ? 'Desbloqueadas' : 'Unlocked'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white border border-white/5"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.slice(page * 9, (page + 1) * 9).map((achievement) => {
                if (!achievement || !achievement.id) return null;
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                const isHiddenSecret = Boolean(achievement.secret && !isUnlocked);
                const progress = achievementProgress[achievement.id] || 0;
                const target = achievement.target || 1;
                const percent = Math.min(100, (progress / target) * 100);
                
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                      isUnlocked 
                        ? (isInterstellar ? 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]')
                        : 'bg-white/5 border-white/10 grayscale opacity-60'
                    }`}
                  >
                    {/* Scan Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[scan_2s_infinite]" />
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                        isUnlocked 
                          ? (isInterstellar ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400')
                          : 'bg-white/5 border-white/10 text-slate-600'
                      }`}>
                        {(() => {
                          const icons: any = { CheckCircle2, Coins, Sword, Shield, Bot, Globe, Cpu, Skull, Rocket, TrendingUp, Zap, HistoryIcon };
                          const Icon = icons[achievement.icon] || Trophy;
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-orbitron font-bold uppercase truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                          {isHiddenSecret ? '?' : achievement.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mt-1 line-clamp-2 leading-relaxed">
                          {isHiddenSecret ? '?' : achievement.description}
                        </p>
                        
                        {!isUnlocked && !isHiddenSecret && achievement.type !== 'action' && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                              <span>{isPortuguese ? 'Progresso' : 'Progress'}</span>
                              <span>{formatValue(progress)} / {formatValue(achievement.target)}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className={`h-full ${isInterstellar ? 'bg-orange-500' : 'bg-cyan-500'}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className={isInterstellar ? 'text-orange-400' : 'text-cyan-400'} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`p-2 rounded-xl border border-white/10 transition-all ${page === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 text-white'}`}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.ceil(ACHIEVEMENTS.length / 9))].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${page === i ? (isInterstellar ? 'bg-orange-500 w-6' : 'bg-cyan-500 w-6') : 'bg-white/20'}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(Math.ceil(ACHIEVEMENTS.length / 9) - 1, p + 1))}
                disabled={page >= Math.ceil(ACHIEVEMENTS.length / 9) - 1}
                className={`p-2 rounded-xl border border-white/10 transition-all ${page >= Math.ceil(ACHIEVEMENTS.length / 9) - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 text-white'}`}
              >
                <ChevronRight size={24} />
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
