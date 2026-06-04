'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Zap, Coins, Settings, Lock, Database, Star, Clock } from 'lucide-react';
import { useDashboard } from '../DashboardProvider';
import { VOID_AIRCRAFT } from '@/lib/game-data';
import { PremiumCanvasButton } from '../../ui/PremiumCanvasButton';

const formatVoidMissionTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VoidAircraftTab = memo(() => {
  const {
    t,
    language,
    showVoidAircraftTutorial,
    setShowVoidAircraftTutorial,
    voidAircraftTutorialStep,
    setVoidAircraftTutorialStep,
    unlockedVoidAircraft,
    voidAircraftMissions,
    voidAircraftUpgrades,
    voidAircraftConstruction,
    voidResources,
    economy,
    formatValue,
    claimVoidAircraftMission,
    speedUpVoidAircraft,
    buyVoidAircraft,
    startVoidMission,
    upgradeVoidAircraft,
    toggleVoidAircraftAuto,
    buyVoidAircraftAuto,
    voidAircraftAutoToggles
  } = useDashboard();

  const { qc } = economy;

  const voidAircraftBgMap: Record<string, string> = {
    'va-1': '/assets/texturas/bg_aircraft_seeker_alpha.webp',
    'va-2': '/assets/texturas/bg_aircraft_collector_beta.webp',
    'va-3': '/assets/texturas/bg_aircraft_ghost_gamma.webp',
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      <AnimatePresence>
        {showVoidAircraftTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl glass-panel border-2 border-cyan-500/30 p-8 rounded-3xl space-y-6 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto border border-cyan-500/20 animate-float">
                <Rocket className="w-10 h-10 text-cyan-400" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">
                  {voidAircraftTutorialStep === 0 ? t('theBeginning') : t('newPossibilities')}
                </h3>
                <p className="text-base text-cyan-100/80 font-mono leading-relaxed">
                  {voidAircraftTutorialStep === 0 
                    ? "Aqui é o seu recomeço, devagar, mas importante. Depois de tanta exploração pelo Cosmo afora, restaram poucas opções para seguir em frente, você manteve salvo o projeto: Naves de Buscas. Mas com um pouco de sorte, você foi além, mesmo sem querer... Buscando por restos, sobras, resquícios de minérios... Inúteis... Quase zero de esperança, você se lembrou delas, escondidas, protegidas... Suas naves de buscas, antes inúteis, agora salvação! Com elas você pode... DEVE, buscar recursos onde provavelmente não há, mas ainda há... Esperança!"
                    : "Elas irão procurar minérios diversos, recursos naturais, recursos tecnológicos, recursos biológicos, medicamentos. Você pode melhorar suas naves de buscas com tecnologia, estocagem e uso inteligente de energia."
                  }
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {voidAircraftTutorialStep === 0 ? (
                  <button 
                    onClick={() => setVoidAircraftTutorialStep(1)}
                    className="px-8 py-3 bg-cyan-500 text-black font-orbitron font-black text-[14px] rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-widest"
                  >
                    {t('next')}
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowVoidAircraftTutorial(false)}
                    className="px-8 py-3 bg-emerald-500 text-black font-orbitron font-black text-[14px] rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest"
                  >
                    {t('understood')}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        
        <div className="min-h-0 flex-1 overflow-hidden pr-2">
          <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-3 xl:auto-rows-fr">
            {VOID_AIRCRAFT.map(aircraft => {
              const isUnlocked = unlockedVoidAircraft.includes(aircraft.id);
              const mission = voidAircraftMissions[aircraft.id] || { status: 'idle' };
              const upgrades = voidAircraftUpgrades[aircraft.id] || { storage: 0, quality: 0, time: 0, auto: 0 };
              const isMission = mission.status === 'mission';
              const timeLeft = isMission && mission.endTime ? Math.max(0, mission.endTime - Date.now()) : 0;
              const currentMissionTime = aircraft.missionTime * (1 - upgrades.time * 0.1);
              const bgImage = voidAircraftBgMap[aircraft.id];

              if (!isUnlocked) {
                const construction = voidAircraftConstruction[aircraft.id];
                const isConstructing = !!construction;

                if (isConstructing) {
                  const totalTime = aircraft.id === 'va-2' ? 5 * 60 * 1000 : 10 * 60 * 1000;
                  const timeLeftConstruction = Math.max(0, construction.endTime - Date.now());
                  const progressConstruction = Math.min(100, ((totalTime - timeLeftConstruction) / totalTime) * 100);
                  const speedUpCost = aircraft.id === 'va-2' ? { energy: 10000, qc: 50000 } : { energy: 20000, qc: 100000 };
                  const canAffordSpeedUp = voidResources.energy >= speedUpCost.energy && qc >= speedUpCost.qc;

                  return (
                    <div key={aircraft.id} className="glass-panel border-2 border-cyan-500/30 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden h-full">
                      {bgImage && (
                        <div 
                          className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none"
                          style={{ 
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)'
                          }}
                        />
                      )}
                      <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-1">
                          <h3 className="text-lg font-orbitron font-black text-white tracking-tighter uppercase">{aircraft.name}</h3>
                          <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">{language === 'pt' ? 'EM CONSTRUÇÃO...' : 'UNDER CONSTRUCTION...'}</p>
                        </div>
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-spin-slow">
                          <Settings className="w-6 h-6 text-cyan-400" />
                        </div>
                      </div>

                      <div className="space-y-4 flex-1 flex flex-col justify-center">
                         <div className="flex justify-between text-xs font-orbitron text-cyan-400 uppercase tracking-widest">
                            <span>{language === 'pt' ? 'Progresso' : 'Progress'}</span>
                            <span>{formatVoidMissionTime(timeLeftConstruction)}</span>
                         </div>
                         <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-cyan-500/20">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progressConstruction}%` }}
                              className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            />
                         </div>

                         <button
                           onClick={() => speedUpVoidAircraft(aircraft.id)}
                           disabled={!canAffordSpeedUp}
                           className={`w-full py-3 rounded-xl font-orbitron font-black text-xs transition-all uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-1 ${canAffordSpeedUp ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-[1.02]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'}`}
                         >
                           <div className="flex items-center gap-2">
                             <Zap className="w-3 h-3" />
                             {language === 'pt' ? 'ACELERAR CONSTRUÇÃO' : 'SPEED UP CONSTRUCTION'}
                           </div>
                           <div className="flex gap-3 text-[10px] opacity-80">
                             <span className="flex items-center gap-1 font-mono"><Zap className="w-2 h-2" /> {formatValue(speedUpCost.energy)} EN</span>
                             <span className="flex items-center gap-1 font-mono"><Coins className="w-2 h-2" /> {formatValue(speedUpCost.qc)} QC</span>
                           </div>
                         </button>
                      </div>

                      <div className="h-32 glass-panel border border-white/5 rounded-2xl bg-black/20 flex items-center justify-center opacity-30">
                         <Rocket className="w-12 h-12 text-cyan-500/50 animate-pulse" />
                      </div>
                    </div>
                  );
                }

                const costs = {
                  'va-2': { minerals: 5000, tech: 5000, energy: 5000 },
                  'va-3': { minerals: 15000, tech: 15000, energy: 15000 }
                }[aircraft.id as 'va-2' | 'va-3'];

                const canAfford = costs && voidResources.minerals >= costs.minerals && voidResources.tech >= costs.tech && voidResources.energy >= costs.energy;
                const isLockedByPrev = aircraft.id === 'va-3' && !unlockedVoidAircraft.includes('va-2');

                return (
                  <div key={aircraft.id} className="glass-panel border-2 border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden h-full grayscale opacity-60">
                    {bgImage && (
                      <div 
                        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none"
                        style={{ 
                          backgroundImage: `url(${bgImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)'
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center p-6 text-center">
                      <Lock className="w-12 h-12 text-white/20 mb-4" />
                      <h3 className="text-lg font-orbitron font-black text-white/40 uppercase mb-4">{aircraft.name}</h3>
                      
                      {isLockedByPrev ? (
                        <p className="text-xs text-red-400 font-mono uppercase tracking-widest">
                          {language === 'pt' ? 'DESBLOQUEIE A COLLECTOR-BETA PRIMEIRO' : 'UNLOCK COLLECTOR-BETA FIRST'}
                        </p>
                      ) : (
                        <div className="space-y-4 w-full">
                          <div className="grid grid-cols-3 gap-2">
                            <div className={`p-2 rounded-lg border ${voidResources.minerals >= (costs?.minerals || 0) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                              <div className="text-[10px] text-white/40 uppercase">{t('minerals')}</div>
                              <div className={`text-xs font-bold ${voidResources.minerals >= (costs?.minerals || 0) ? 'text-emerald-400' : 'text-red-400'}`}>{formatValue(costs?.minerals || 0)}</div>
                            </div>
                            <div className={`p-2 rounded-lg border ${voidResources.tech >= (costs?.tech || 0) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                              <div className="text-[10px] text-white/40 uppercase">{t('tech')}</div>
                              <div className={`text-xs font-bold ${voidResources.tech >= (costs?.tech || 0) ? 'text-emerald-400' : 'text-red-400'}`}>{formatValue(costs?.tech || 0)}</div>
                            </div>
                            <div className={`p-2 rounded-lg border ${voidResources.energy >= (costs?.energy || 0) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                              <div className="text-[10px] text-white/40 uppercase">{t('energy')}</div>
                              <div className={`text-xs font-bold ${voidResources.energy >= (costs?.energy || 0) ? 'text-emerald-400' : 'text-red-400'}`}>{formatValue(costs?.energy || 0)}</div>
                            </div>
                          </div>
                          
                          <PremiumCanvasButton
                            onClick={() => buyVoidAircraft(aircraft.id)}
                            disabled={!canAfford}
                            tone={canAfford ? 'cyan' : 'steel'}
                            className="w-full h-12 text-base font-black uppercase tracking-widest"
                            contentClassName={canAfford ? 'text-cyan-100' : 'text-white/30'}
                          >
                            {t('build')}
                          </PremiumCanvasButton>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start blur-sm">
                      <div className="space-y-1">
                        <h3 className="text-lg font-orbitron font-black text-white tracking-tighter uppercase">{aircraft.name}</h3>
                        <p className="text-[13px] text-cyan-400/60 font-mono uppercase tracking-widest leading-tight">{aircraft.description}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={aircraft.id} className={`glass-panel border-2 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden h-full ${isMission ? 'neon-border-purple' : 'neon-border-cyan'}`}>
                  {bgImage && (
                    <div 
                      className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
                      style={{ 
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)'
                      }}
                    />
                  )}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-lg font-orbitron font-black text-white tracking-tighter uppercase">{aircraft.name}</h3>
                      <p className="text-[13px] text-cyan-400/60 font-mono uppercase tracking-widest leading-tight">{aircraft.description}</p>
                    </div>
                    <div className={`shrink-0 px-3 py-1 rounded-full text-[15px] font-orbitron font-bold tracking-widest uppercase ${isMission ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse-glow' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
                      {isMission ? t('inMission') : t('available')}
                    </div>
                  </div>

                  <div className="flex justify-between items-stretch gap-3 relative z-10">
                    <div className="flex-[0.82] space-y-4 py-1">
                      <div className="space-y-1.5">
                        <span className="text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">{t('capacity')}</span>
                        <div className="text-lg font-orbitron font-bold text-white">
                          {Math.floor(aircraft.capacity * (1 + upgrades.storage * 0.2))} <span className="text-sm text-cyan-500/60">un</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 group/eff relative cursor-help">
                        <span className="text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">{t('earlyReturnChance')}</span>
                        <div className="text-lg font-orbitron font-bold text-white">
                          {Math.min(aircraft.maxEfficiency, aircraft.efficiency + upgrades.quality * 5).toFixed(0)}%
                        </div>
                        
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black/90 border border-cyan-500/30 rounded-lg text-[10px] text-cyan-100 font-mono opacity-0 group-hover/eff:opacity-100 transition-opacity pointer-events-none z-50">
                          {t('earlyReturnDesc')}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">{t('searchTime')}</span>
                        <div className="text-lg font-orbitron font-bold text-white">
                          {formatVoidMissionTime(currentMissionTime)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-[1.18] h-[clamp(11rem,24vh,16.5rem)] glass-panel border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group/ship shrink-0 bg-black/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5" />
                      
                      <AnimatePresence mode="wait">
                        {isMission && aircraft.video ? (
                          <motion.video
                            key={`${aircraft.id}-video`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            src={aircraft.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-80"
                          />
                        ) : aircraft.image ? (
                          <motion.img 
                            key={`${aircraft.id}-image`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            src={aircraft.image} 
                            alt={aircraft.name} 
                            className="h-[82%] w-[82%] object-contain transition-all duration-700 group-hover/ship:scale-110 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] relative z-10" 
                          />
                        ) : (
                          <motion.div 
                            key={`${aircraft.id}-placeholder`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-3 opacity-20"
                          >
                            <Rocket className="w-12 h-12 text-cyan-400" />
                            <span className="text-[12px] font-mono tracking-widest">NO SIGNAL</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-sm z-20" />
                      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-sm z-20" />
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-sm z-20" />
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-tr-sm z-20" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] -top-full group-hover/ship:animate-scan opacity-0 group-hover/ship:opacity-100 pointer-events-none z-30" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-end gap-4 relative z-10">
                    {isMission ? (
                      timeLeft > 0 ? (
                        <div className="space-y-3">
                          <div className="flex justify-between text-lg font-orbitron text-purple-400 uppercase tracking-widest">
                            <span>{t('missionProgress')}</span>
                            <span>{formatVoidMissionTime(timeLeft)}</span>
                          </div>
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-purple-500/20">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((currentMissionTime - timeLeft) / currentMissionTime) * 100}%` }}
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            />
                          </div>
                        </div>
                      ) : (
                        <PremiumCanvasButton
                          onClick={() => claimVoidAircraftMission(aircraft.id)}
                          tone="green"
                          className="w-full h-12 text-sm font-black uppercase tracking-[0.2em] animate-pulse"
                          contentClassName="text-emerald-100"
                        >
                          {language === 'pt' ? 'RESGATAR RECOMPENSAS' : 'CLAIM REWARDS'}
                        </PremiumCanvasButton>
                      )
                    ) : (
                        <PremiumCanvasButton
                          onClick={() => startVoidMission(aircraft.id)}
                          tone="cyan"
                          className="w-full h-12 text-sm font-black uppercase tracking-[0.2em]"
                          contentClassName="text-cyan-100"
                        >
                          {language === 'pt' ? 'ENVIAR' : 'SEND'}
                        </PremiumCanvasButton>
                    )}

                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <h4 className="text-base font-orbitron font-bold text-white/60 uppercase tracking-widest">{t('aircraftUpgrades')}</h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'storage', name: t('storage'), icon: Database, max: 5 },
                          { id: 'quality', name: t('efficiency'), icon: Star, max: 5 },
                          { id: 'time', name: t('time'), icon: Clock, max: 5 },
                          { id: 'auto', name: t('automatic'), icon: Zap, max: 1 }
                        ].map(upg => {
                          if (upg.id === 'auto') {
                            const isUnlocked = upgrades.auto === 1;
                            const autoCost = { 'va-1': 50000, 'va-2': 75000, 'va-3': 100000 }[aircraft.id as 'va-1' | 'va-2' | 'va-3'] || 0;
                            return (
                              <button
                                key={upg.id}
                                onClick={() => isUnlocked ? toggleVoidAircraftAuto(aircraft.id) : buyVoidAircraftAuto(aircraft.id)}
                                disabled={!isUnlocked && qc < autoCost}
                                className={`flex min-h-[62px] flex-col p-3 rounded-lg border transition-all text-left group ${isUnlocked ? (voidAircraftAutoToggles[aircraft.id] ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30') : qc >= autoCost ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <upg.icon className={`w-3 h-3 ${isUnlocked ? (voidAircraftAutoToggles[aircraft.id] ? 'text-emerald-400' : 'text-red-400') : qc >= autoCost ? 'text-cyan-400' : 'text-slate-500'}`} />
                                  <span className="text-sm font-orbitron font-bold text-white/80 uppercase tracking-widest">{upg.name}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <span className={`text-base font-mono ${isUnlocked ? (voidAircraftAutoToggles[aircraft.id] ? t('active') : t('inactive')) : 'text-cyan-500/60'}`}>
                                    {isUnlocked ? (voidAircraftAutoToggles[aircraft.id] ? t('active') : t('inactive')) : '---'}
                                  </span>
                                  {!isUnlocked && <span className="text-sm font-orbitron font-bold text-white">{formatValue(autoCost)}</span>}
                                </div>
                              </button>
                            );
                          }

                          const level = upgrades[upg.id as keyof typeof upgrades] || 0;
                          const costsArray = [10000, 25000, 40000, 60000, 100000];
                          const costValue = costsArray[level] || 1000000;
                          const isMaxLevel = level >= upg.max;
                          return (
                            <button
                              key={upg.id}
                              onClick={() => upgradeVoidAircraft(aircraft.id, upg.id as any)}
                              disabled={qc < costValue || isMaxLevel}
                                className={`flex min-h-[62px] flex-col p-3 rounded-lg border transition-all text-left group ${isMaxLevel ? 'bg-emerald-500/10 border-emerald-500/20 cursor-default' : qc >= costValue ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <upg.icon className={`w-3 h-3 ${isMaxLevel ? 'text-emerald-400' : qc >= costValue ? 'text-cyan-400' : 'text-slate-500'}`} />
                                <span className="text-sm font-orbitron font-bold text-white/80 uppercase tracking-widest">{upg.name}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                  <span className={`text-base font-mono ${isMaxLevel ? 'text-emerald-500' : 'text-cyan-500/60'}`}>{isMaxLevel ? 'MAX' : `LVL ${level}`}</span>
                                  {!isMaxLevel && upg.id === 'quality' && (
                                    <span className="text-[9px] text-emerald-400/60 font-mono">+5% CHANCE</span>
                                  )}
                                  {!isMaxLevel && upg.id === 'storage' && (
                                    <span className="text-[9px] text-emerald-400/60 font-mono">+20% CAP</span>
                                  )}
                                  {!isMaxLevel && upg.id === 'time' && (
                                    <span className="text-[9px] text-emerald-400/60 font-mono">-10% TIME</span>
                                  )}
                                </div>
                                {!isMaxLevel && <span className="text-sm font-orbitron font-bold text-white">{formatValue(costValue)}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
});

export default VoidAircraftTab;
