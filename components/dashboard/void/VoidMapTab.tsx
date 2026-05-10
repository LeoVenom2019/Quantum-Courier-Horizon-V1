'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Info, Target, Zap, Activity } from 'lucide-react';
import { useDashboard } from '../DashboardProvider';
import { ROUTES } from '@/lib/game-data';

const VoidMapTab = memo(() => {
  const {
    currentLocationId,
    voidWarProgress,
    language,
    t,
    formatValue
  } = useDashboard();

  const voidLocations = useMemo(() => ROUTES.filter(r => r.tier === 'Void'), []);
  const currentLoc = voidLocations[currentLocationId] || voidLocations[0];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* Left: Map Visualization */}
      <div className="w-full lg:w-2/3 glass-panel border-2 border-purple-500/30 rounded-[2.5rem] relative overflow-hidden bg-black shadow-[0_0_50px_rgba(168,85,247,0.1)] group">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full  opacity-20" />
        </div>

        <video 
          src="/videos/bobby_blue/void_map_background.webm"
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen transition-opacity duration-1000"
        />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

        <div className="absolute inset-0 pointer-events-none">
          {voidLocations.map((loc, index) => {
            const isActive = index === currentLocationId;
            const isUnlocked = index <= voidWarProgress.currentSector;
            
            const left = 20 + (index * 157) % 60;
            const top = 20 + (index * 223) % 60;

            return (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isUnlocked ? 1 : 0.2, scale: 1 }}
                style={{ left: `${left}%`, top: `${top}%` }}
                className="absolute"
              >
                <div className="relative group/pin">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isActive ? 'bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,1)] scale-150' : isUnlocked ? 'bg-purple-600/40' : 'bg-white/5 border border-white/10'}`} />
                  {isActive && <div className="absolute -inset-2 border border-purple-500/40 rounded-full animate-ping" />}
                  
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-black/80 backdrop-blur-md border border-purple-500/20 rounded-md text-[8px] font-orbitron text-purple-200/60 uppercase tracking-widest opacity-0 group-hover/pin:opacity-100 transition-opacity">
                    {loc.name}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl">
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-purple-400/60 font-mono tracking-widest uppercase">NAV_SYSTEM • ACTIVE</span>
            <h4 className="text-lg font-orbitron font-black text-white uppercase tracking-tighter">Void Quadrant Explorer</h4>
          </div>
        </div>

        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent z-10"
        />
      </div>

      {/* Right: Location Details */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="glass-panel border border-white/10 rounded-[2rem] p-6 space-y-6 bg-purple-500/5 relative overflow-hidden flex-1">
          <div className="space-y-1">
            <span className="text-[10px] text-purple-400 font-mono tracking-[0.3em] uppercase">{t('currentSector')}</span>
            <h3 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter">{currentLoc.name}</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest">{t('sectorIntelligence')}</span>
              </div>
              <p className="text-[13px] text-white/60 font-mono leading-relaxed uppercase">
                {currentLoc.description || (language === 'pt' ? 'Setor instável com alta concentração de energia Void. Presença de naves hostis confirmada.' : 'Unstable sector with high concentration of Void energy. Presence of hostile ships confirmed.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-red-400" />
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">{t('threatLevel')}</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-red-400">
                  {currentLoc.difficulty === 'Easy' ? 'LOW' : currentLoc.difficulty === 'Medium' ? 'MODERATE' : 'CRITICAL'}
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">Resources</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-cyan-400">ABUNDANT</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest">Sector Rewards</span>
            </div>
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
              <span className="text-[11px] text-white/40 uppercase font-mono">Quantum Credits</span>
              <span className="text-lg font-orbitron font-black text-yellow-400">~{formatValue(currentLoc.reward)} <span className="text-[10px] opacity-60">QC</span></span>
            </div>
          </div>
        </div>

        <div className="glass-panel border-2 border-purple-500/30 rounded-[2rem] p-6 bg-gradient-to-br from-purple-900/20 to-black relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 space-y-4">
             <div className="flex justify-between items-end">
               <span className="text-[10px] text-purple-400 font-orbitron font-bold tracking-[0.2em] uppercase">{t('voidConquest')}</span>
               <span className="text-2xl font-orbitron font-black text-white">{Math.round(((voidWarProgress.currentSector * 5 + voidWarProgress.currentBattle) / 45) * 100)}%</span>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((voidWarProgress.currentSector * 5 + voidWarProgress.currentBattle) / 45) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VoidMapTab;
