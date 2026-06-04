'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Lock, Cpu, Coins, Info } from 'lucide-react';
import ShipVisual from '@/components/ShipVisual';
import { SHIPS } from '@/lib/game-data';
import { useDashboard } from './DashboardProvider';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

const AircraftTab = memo(({ renderBattleLevelTab }: { renderBattleLevelTab: () => React.ReactNode }) => {
  const { 
    t, 
    progression, 
    economy, 
    language,
    formatValue, 
    playSfx, 
    addLog,
    aircraftSubTab,
    setAircraftSubTab,
    shipPageIndex,
    setShipPageIndex,
    getEconomicMultipliers,
    translateData,
    buyShip
  } = useDashboard();

  const { routeTier, unlockedTechLevels, ownedShips } = progression;
  const { qc } = economy;

  const isInterstellar = routeTier === 'Interstellar';
  const themeText = isInterstellar ? 'text-orange-400' : 'text-cyan-400';
  const themeBorder = isInterstellar ? 'border-orange-500/20' : 'border-cyan-500/20';
  const themeBg = isInterstellar ? 'bg-orange-500/5' : 'bg-cyan-500/5';
  const themeAccent = isInterstellar ? 'from-orange-600 to-orange-400' : 'from-cyan-600 to-cyan-400';
  const themeGlow = isInterstellar ? 'shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'shadow-[0_0_20px_rgba(6,182,212,0.2)]';

  const currentShips = SHIPS.filter(s => s.tier === routeTier);

  return (
    <motion.div
      key="aircraft"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col h-full space-y-6"
    >
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className={`text-lg lg:text-2xl font-bold ${themeText} flex items-center gap-2`}>
            <Rocket className="w-5 h-5 lg:w-6 lg:h-6" />
            {t('aircraft')}
          </h2>
          <p className="text-slate-400 text-base lg:text-[14px]">
            {translateData(isInterstellar ? { pt: 'Gerencie sua frota de naves interestelares.', en: 'Manage your interstellar fleet.' } : { pt: 'Gerencie sua frota de naves solares.', en: 'Manage your solar fleet.' })}
          </p>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          <PremiumCanvasButton
            onClick={() => {
              setAircraftSubTab('fleet');
              playSfx('laser_up');
            }}
            tone={aircraftSubTab === 'fleet' ? (isInterstellar ? 'orange' : 'cyan') : 'steel'}
            className={`h-10 min-w-[132px] px-3 text-[14px] font-bold lg:px-4 ${
              aircraftSubTab === 'fleet' ? 'text-white shadow-[0_4px_0_rgba(0,0,0,0.45),0_8px_12px_rgba(0,0,0,0.24)]' : 'text-white/55 hover:brightness-110'
            }`}
          >
            {t('fleet')}
          </PremiumCanvasButton>
          <PremiumCanvasButton
            onClick={() => {
              setAircraftSubTab('battle');
              playSfx('laser_up');
            }}
            tone={aircraftSubTab === 'battle' ? 'purple' : 'steel'}
            className={`h-10 min-w-[142px] px-3 text-[14px] font-bold lg:px-4 ${
              aircraftSubTab === 'battle' ? 'text-purple-100 shadow-[0_4px_0_rgba(0,0,0,0.45),0_8px_12px_rgba(0,0,0,0.24)]' : 'text-white/55 hover:brightness-110'
            }`}
          >
            {t('battleLevel')}
          </PremiumCanvasButton>
        </div>
      </div>

      {aircraftSubTab === 'battle' ? renderBattleLevelTab() : (
        <>
          <div className="flex gap-2 mb-6 w-full overflow-x-auto pb-2 scrollbar-hide">
            {currentShips.map((ship) => {
              const isUnlocked = (unlockedTechLevels[routeTier] || 0) >= ship.level;
              return (
                <PremiumCanvasButton
                  key={ship.level}
                  onClick={() => isUnlocked && setShipPageIndex(ship.level - 1)}
                  disabled={!isUnlocked}
                  tone={shipPageIndex === ship.level - 1 ? (isInterstellar ? 'orange' : 'cyan') : 'steel'}
                  className={`min-h-[72px] min-w-[120px] flex-1 px-2 py-3 font-bold ${
                    shipPageIndex === ship.level - 1
                      ? 'shadow-[0_5px_0_rgba(0,0,0,0.45),0_10px_14px_rgba(0,0,0,0.24)]'
                      : 'hover:brightness-110'
                  } ${!isUnlocked ? 'grayscale' : ''}`}
                  contentClassName="flex-col gap-1.5"
                >
                  <span className={`text-[11px] uppercase tracking-[0.2em] ${shipPageIndex === ship.level - 1 ? 'text-white' : 'text-slate-500'}`}>
                    Lvl {ship.level}
                  </span>
                  <span className={`w-full truncate text-center font-orbitron text-[15px] uppercase tracking-wider ${isUnlocked ? ship.color : 'text-slate-400'}`}>
                    {translateData(ship.name)}
                  </span>
                  {!isUnlocked && <Lock className="mt-0.5 h-3.5 w-3.5 text-slate-600" />}
                </PremiumCanvasButton>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={shipPageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-full"
            >
              {currentShips[shipPageIndex] && (
                <>
                  <div className={`p-6 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden group flex flex-col justify-between h-full`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isInterstellar ? 'from-orange-500' : 'from-cyan-500'} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-3xl lg:text-4xl font-bold ${currentShips[shipPageIndex].color} mb-2`}>
                            {translateData(currentShips[shipPageIndex].name)}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[14px] font-bold border border-slate-700">
                              {t('level')} {currentShips[shipPageIndex].level}
                            </span>
                            <span className="text-slate-400 text-[14px] flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5" />
                              {translateData(currentShips[shipPageIndex].technology)}
                            </span>
                          </div>
                        </div>
                        <div className={`p-4 rounded-2xl bg-slate-900/80 border ${themeBorder} ${themeGlow} flex items-center justify-center overflow-hidden`}>
                          <ShipVisual ship={currentShips[shipPageIndex]} className="w-12 h-12" />
                        </div>
                      </div>

                      <p className="text-slate-300 text-lg lg:text-[14px] leading-relaxed italic opacity-80 max-w-[95%]">
                        &quot;{translateData(currentShips[shipPageIndex].description)}&quot;
                      </p>
                    </div>

                    <div className="mt-auto space-y-6 pb-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 group/stat">
                          <div className="text-base lg:text-[14px] text-slate-500 uppercase font-bold mb-1 tracking-widest">{t('speed')}</div>
                          <div className={`text-xl font-bold font-orbitron ${themeText}`}>{currentShips[shipPageIndex].maxSpeed} <span className="text-base opacity-60 font-mono">km/s</span></div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 group/stat">
                          <div className="text-base lg:text-[14px] text-slate-500 uppercase font-bold mb-1 tracking-widest">{t('range')}</div>
                          <div className={`text-lg lg:text-xl font-bold font-orbitron ${themeText} whitespace-nowrap flex items-baseline gap-1`}>
                            <span>
                              {(() => {
                                const val = currentShips[shipPageIndex].range;
                                if (isInterstellar) return val;
                                if (val >= 1000000) return Math.floor(val / 1000000) + 'M';
                                if (val >= 1000) return Math.floor(val / 1000) + (val >= 100000 ? 'k' : 'K');
                                return val;
                              })()}
                            </span>
                            <span className="text-base opacity-60 font-mono uppercase">{isInterstellar ? 'LY' : 'Km'}</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 group/stat">
                          <div className="text-base lg:text-[14px] text-slate-500 uppercase font-bold mb-1 tracking-widest">{t('owned')}</div>
                          <div className={`text-xl font-bold font-orbitron ${themeText}`}>{ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0} <span className="text-base opacity-60">/ 5</span></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <PremiumCanvasButton
                          onClick={() => buyShip(currentShips[shipPageIndex].level)}
                          disabled={
                            (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5 || 
                            (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level ||
                            (qc < (currentShips[shipPageIndex].level === 1 && (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 1 ? 500 * getEconomicMultipliers().cost : currentShips[shipPageIndex].cost * getEconomicMultipliers().cost) && (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) > 0)
                          }
                          tone={
                            (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5
                              ? 'steel'
                              : (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level
                                ? 'steel'
                                : (isInterstellar ? 'orange' : 'cyan')
                          }
                          className={`h-14 flex-1 text-xl font-bold ${
                            (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5 || (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level
                              ? 'text-slate-500'
                              : `${isInterstellar ? 'text-orange-50 shadow-[0_7px_0_rgba(154,52,18,0.65),0_14px_18px_rgba(0,0,0,0.32)] active:shadow-[0_3px_0_rgba(154,52,18,0.72),0_7px_10px_rgba(0,0,0,0.3)]' : 'text-cyan-50 shadow-[0_7px_0_rgba(14,116,144,0.65),0_14px_18px_rgba(0,0,0,0.32)] active:shadow-[0_3px_0_rgba(14,116,144,0.72),0_7px_10px_rgba(0,0,0,0.3)]'} hover:brightness-110`
                          }`}
                          contentClassName="gap-2"
                        >
                          {(ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5 ? (
                            t('max')
                          ) : (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level ? (
                            <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> {t('locked')}</span>
                          ) : (
                            <>
                              <Coins className="w-6 h-6" />
                              {(ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) === 0 ? t('free') : (
                                currentShips[shipPageIndex].level === 1 ? formatValue(500 * getEconomicMultipliers().cost) : formatValue(currentShips[shipPageIndex].cost * getEconomicMultipliers().cost)
                              )}
                            </>
                          )}
                        </PremiumCanvasButton>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 h-full">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shrink-0">
                      <h4 className="text-base font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-cyan-400" />
                        {t('status')}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                          <span className="text-[14px] text-slate-400">{language === 'pt' ? 'Capacidade de Frota' : 'Fleet Capacity'}</span>
                          <span className="text-[14px] font-bold text-slate-200">{ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0} / 5</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                          <span className="text-[14px] text-slate-400">{language === 'pt' ? 'Tecnologia Requerida' : 'Required Technology'}</span>
                          <span className={`text-[14px] font-bold ${(unlockedTechLevels[routeTier] || 0) >= currentShips[shipPageIndex].level ? 'text-emerald-400' : 'text-red-400'}`}>
                            Lvl {currentShips[shipPageIndex].level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex-1 glass-panel rounded-2xl border ${themeBorder} relative overflow-hidden flex items-center justify-center`}>
                      <div className="absolute inset-0 opacity-10 star-grid pointer-events-none" />
                      
                      {(() => {
                        const shipId = currentShips[shipPageIndex].name.toLowerCase().replace(/[\s_]+/g, '-');
                        return (
                          <video 
                            key={`v-${shipId}`}
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover relative z-0"
                          >
                            <source src={`/videos/ships/${shipId}.webm`} type="video/webm" />
                          </video>
                        );
                      })()}

                      <div className={`absolute inset-0 bg-gradient-to-t from-${currentShips[shipPageIndex].color.split('-')[1] || 'cyan'}-500/10 to-transparent pointer-events-none z-10`} />
                      
                      <div className="absolute bottom-4 right-4 flex flex-col items-end opacity-40 z-20">
                        <span className="text-[14px] font-mono whitespace-nowrap">REF: {currentShips[shipPageIndex].name.substring(0, 3).toUpperCase()}</span>
                        <span className="text-[14px] font-mono whitespace-nowrap">X: {4.5 + shipPageIndex * 0.5}.00</span>
                        <span className="text-[14px] font-mono whitespace-nowrap">Y: {12.2 - shipPageIndex * 0.2}.00</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
});

export default AircraftTab;
