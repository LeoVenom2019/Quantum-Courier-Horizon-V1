'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Globe, Zap, Cpu, Heart, Gem, Leaf } from 'lucide-react';
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
    earth,
    earthRestoration,
    setEarthRestoration,
    earthProjectBoostCount,
    earthPopulation,
    totalProjectTerra
  } = useDashboard();

  const isEarth = progression.routeTier === 'Earth';
  const isVoid = progression.routeTier === 'Void';

  if (isEarth || isVoid) {
    const stats = [
      { id: 'energy', name: 'Células Quânticas', icon: Zap, color: 'text-yellow-400', progress: earth.reconstructionProgress?.energy || 0, bgImage: '/assets/rota3/void/quantic_cels.webp' },
      { id: 'tech', name: 'Dados Multifatoriais', icon: Cpu, color: 'text-cyan-400', progress: earth.reconstructionProgress?.tech || 0, bgImage: '/assets/rota3/void/multifactorial_data.webp' },
      { id: 'meds', name: 'Kits Médicos Avançados', icon: Heart, color: 'text-red-400', progress: earth.reconstructionProgress?.meds || 0, bgImage: '/assets/rota3/void/medical_suplies.webp' },
      { id: 'minerals', name: 'Núcleos Minerais', icon: Gem, color: 'text-orange-400', progress: earth.reconstructionProgress?.minerals || 0, bgImage: '/assets/rota3/void/minerals_void.webp' },
      { id: 'food', name: 'Rações Coloniais', icon: Leaf, color: 'text-green-400', progress: earth.reconstructionProgress?.food || 0, bgImage: '/assets/rota3/void/colonies_food.webp' },
    ];

    const totalProgress = totalProjectTerra;

    return (
      <div className="h-full flex flex-col space-y-6 overflow-hidden">
        <div className="glass-panel border-2 border-emerald-500/30 rounded-[2.5rem] p-8 bg-gradient-to-br from-emerald-500/10 via-black to-black relative overflow-hidden flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
          </div>

          {/* Left: Earth Visualizer */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-6 relative shrink-0">
            <motion.div 
              className="relative w-48 h-48 lg:w-80 lg:h-80"
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
              <h3 className="text-3xl lg:text-5xl font-orbitron font-black text-white uppercase tracking-tighter">
                {totalProgress >= 100 ? t('terraRestored') : t('terraRestoration')}
              </h3>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/50" />
                <span className="text-2xl font-orbitron font-bold text-emerald-400">{totalProgress.toFixed(1)}%</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/50" />
              </div>
            </div>
          </div>

          {/* Right: Restoration Details */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              {stats.map(stat => (
                <div key={stat.id} className="glass-panel border border-white/5 rounded-3xl p-5 space-y-4 bg-black/40 group hover:border-white/20 transition-all overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${stat.bgImage})` }}
                  />
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-black/40 border border-white/10 ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-orbitron font-bold text-white/80 uppercase tracking-wider">{stat.name}</span>
                    </div>
                    <span className={`text-sm font-orbitron font-black ${stat.color}`}>{stat.progress.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Enviados do Núcleo de Colonização</span>
                    {stat.progress >= 100 && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto p-6 bg-black/40 border-2 border-emerald-500/20 rounded-3xl space-y-4 shrink-0">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <Globe className="w-6 h-6 text-emerald-400" />
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
                    <span className="text-sm font-orbitron text-emerald-400">+{totalProgress > 80 ? '2.4' : totalProgress > 50 ? '1.2' : '0.5'}% / Year</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 uppercase block mb-1">Boosters Active</span>
                    <span className="text-sm font-orbitron text-cyan-400">{earthProjectBoostCount}</span>
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
