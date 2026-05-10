'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Globe, Wind, ThermometerSun, Droplets } from 'lucide-react';
import { useDashboard } from '../DashboardProvider';

const VoidEarthTab = memo(() => {
  const {
    progression,
    economy,
    t,
    language,
    formatValue,
    combat,
    dispatch,
    playSfx,
    earthRestoration,
    setEarthRestoration,
    earthProjectBoostCount,
    earthPopulation
  } = useDashboard();

  const isEarth = progression.routeTier === 'Earth';

  if (isEarth) {
    const stats = [
      { id: 'atmosphere', name: t('atmosphere'), icon: Wind, color: 'text-blue-400', progress: earthRestoration.atmosphere },
      { id: 'temperature', name: t('temperature'), icon: ThermometerSun, color: 'text-orange-400', progress: earthRestoration.temperature },
      { id: 'hydrosphere', name: t('hydrosphere'), icon: Droplets, color: 'text-cyan-400', progress: earthRestoration.hydrosphere },
      { id: 'biosphere', name: t('biosphere'), icon: Globe, color: 'text-emerald-400', progress: earthRestoration.biosphere }
    ];

    const totalProgress = stats.reduce((acc, curr) => acc + curr.progress, 0) / 4;

    return (
      <div className="h-full flex flex-col space-y-6">
        <div className="glass-panel border-2 border-emerald-500/30 rounded-[2.5rem] p-8 bg-gradient-to-br from-emerald-500/10 via-black to-black relative overflow-hidden flex-1 flex flex-col lg:flex-row gap-10">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-8 relative">
            <motion.div 
              className="relative w-64 h-64 lg:w-80 lg:h-80"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[60px]" />
              <img 
                src="/images/void_earth/earth_restored_preview.png" 
                alt="Earth Preview" 
                className={`w-full h-full object-contain transition-all duration-1000 ${totalProgress >= 100 ? 'brightness-110 drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'brightness-50 grayscale-[50%]'}`}
              />
              <div 
                className="absolute inset-0 rounded-full bg-emerald-500/20 mix-blend-overlay transition-opacity duration-1000"
                style={{ opacity: totalProgress / 100 }}
              />
            </motion.div>

            <div className="text-center space-y-2 relative z-10">
              <span className="text-[10px] text-emerald-400 font-orbitron font-bold tracking-[0.4em] uppercase">{t('planetStatus')}</span>
              <h3 className="text-4xl lg:text-5xl font-orbitron font-black text-white uppercase tracking-tighter">
                {totalProgress >= 100 ? t('terraRestored') : t('terraRestoration')}
              </h3>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/50" />
                <span className="text-2xl font-orbitron font-bold text-emerald-400">{totalProgress.toFixed(1)}%</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/50" />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map(stat => (
                <div key={stat.id} className="glass-panel border border-white/5 rounded-3xl p-5 space-y-4 bg-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-black/40 border border-white/10 ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-orbitron font-bold text-white/80 uppercase tracking-wider">{stat.name}</span>
                    </div>
                    <span className={`text-base font-orbitron font-bold ${stat.color}`}>{stat.progress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      className={`h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (stat.progress < 100 && (combat.voidResources.tech || 0) >= 5000 && (combat.voidResources.energy || 0) >= 5000) {
                        setEarthRestoration((prev: any) => ({ ...prev, [stat.id]: Math.min(100, prev[stat.id] + 5) }));
                        dispatch({ type: 'SPEND_VOID_RESOURCES', payload: { tech: 5000, energy: 5000 } });
                        playSfx('success');
                      }
                    }}
                    disabled={stat.progress >= 100 || (combat.voidResources.tech || 0) < 5000 || (combat.voidResources.energy || 0) < 5000}
                    className={`w-full py-2 rounded-xl text-[10px] font-orbitron font-black transition-all uppercase tracking-widest ${stat.progress >= 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : ((combat.voidResources.tech || 0) >= 5000 ? 'bg-emerald-500 text-black hover:scale-[1.02]' : 'bg-white/5 text-white/20 border border-white/5 opacity-50 cursor-not-allowed')}`}
                  >
                    {stat.progress >= 100 ? t('stabilized') : t('allocateResources')}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto p-6 bg-black/40 border-2 border-emerald-500/20 rounded-3xl space-y-4">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   < Globe className="w-6 h-6 text-emerald-400" />
                   <div>
                     <span className="text-[10px] text-white/40 uppercase tracking-widest">{t('currentPopulation')}</span>
                     <div className="text-2xl font-orbitron font-bold text-white">{formatValue(earthPopulation)}</div>
                   </div>
                 </div>
                 <div className="text-right">
                   <span className="text-[10px] text-white/40 uppercase tracking-widest">{t('habitability')}</span>
                   <div className="text-xl font-orbitron font-bold text-emerald-400">{totalProgress.toFixed(0)}%</div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 uppercase block mb-1">Growth Rate</span>
                    <span className="text-base font-orbitron text-emerald-400">+{totalProgress > 80 ? '2.4' : totalProgress > 50 ? '1.2' : '0.5'}% / Year</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 uppercase block mb-1">Boosters Active</span>
                    <span className="text-base font-orbitron text-cyan-400">{earthProjectBoostCount}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="glass-panel border-2 border-purple-500/30 rounded-[2.5rem] p-8 bg-gradient-to-br from-purple-500/10 via-black to-black relative overflow-hidden flex-1 flex flex-col items-center justify-center gap-8">
        <Globe className="w-20 h-20 text-purple-400 animate-pulse" />
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter">Void Earth Interface</h3>
          <p className="text-base text-purple-400/60 font-mono uppercase tracking-widest">{t('initializingNeuralLink')}</p>
        </div>
      </div>
    </div>
  );
});

export default VoidEarthTab;
