'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Zap, ChevronUp, RefreshCw, ArrowRight, Settings, Activity, Coins } from 'lucide-react';
import { ROUTES, SHIPS, UPGRADES } from '@/lib/game-data';
import { ROUTES_MAP, DOUBLE_ROUTE_COSTS, DOOM_P_COSTS } from '@/lib/game-constants';
import { AETHERION_CHAMBER_BACKGROUND } from '@/lib/ui-backgrounds';
import { useDashboard } from './DashboardProvider';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

const HANGAR_VIDEO_IDS: Record<string, string> = {
  'Pulsar I': 'pulsar_I',
  'Pulsar II': 'pulsar_II',
  'Orion VX': 'orion_xv'
};

const getHangarVideoId = (shipName: string) => (
  HANGAR_VIDEO_IDS[shipName] || shipName.toLowerCase().replace(/\s+/g, '_')
);

const UpgradesTab = memo(function UpgradesTab() {
  const { 
    t, 
    progression, 
    economy, 
    language,
    formatValue, 
    playSfx, 
    addLog,
    buyUpgrade,
    buyAllUpgradesForShip,
    synthesizeAetherion,
    getLocationMultiplier,
    getEconomicMultipliers,
    setExtractionTechLevel,
    setSolarMappingLevel,
    setDoubleRouteLevel,
    setDoomPLevel
  } = useDashboard();

  const { 
    routeTier, 
    unlockedRouteIds, 
    techLevels, 
    extractionTechLevel,
    solarMappingLevel,
    doubleRouteLevel,
    doomPLevel
  } = progression;
  const { qc, miningWaste, solarEnergy, aetherion, aetherionTubes } = economy;

  const [selectedUpgradeLocation, setSelectedUpgradeLocation] = React.useState<string | null>(null);
  const [rhseLiquidPulse, setRhseLiquidPulse] = React.useState(0);
  const previousAetherionRef = React.useRef(aetherion);
  const previousAetherionTubesRef = React.useRef(aetherionTubes);
  const manualSynthesisPulseRef = React.useRef(false);

  const isInterstellar = routeTier === 'Interstellar';
  const tubeCapacity = isInterstellar ? 20 : 10;
  const canCreateAetherionTube = miningWaste >= 2500 && solarEnergy >= 2500 && aetherionTubes < tubeCapacity;
  const canConsumeAetherionTube = aetherionTubes > 0 && aetherion < 10000;
  const canSynthesizeAetherion = canCreateAetherionTube || canConsumeAetherionTube;
  const themeAccent = isInterstellar ? 'text-orange-400' : 'text-cyan-400';
  const themeBorder = isInterstellar ? 'border-orange-500/20' : 'border-cyan-500/20';
  const themeBg = isInterstellar ? 'bg-orange-500/5' : 'bg-cyan-500/5';

  const translateData = (data: any) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return data[language as keyof typeof data] || data['en'] || '';
  };

  const getShipNeonBorder = (color: string) => {
    if (color.includes('cyan')) return 'neon-border-cyan';
    if (color.includes('orange')) return 'neon-border-orange';
    if (color.includes('pink')) return 'neon-border-pink';
    if (color.includes('emerald')) return 'neon-border-emerald';
    if (color.includes('blue')) return 'neon-border-blue';
    return 'neon-border-cyan';
  };

  const triggerRhseLiquidMotion = React.useCallback(() => {
    setRhseLiquidPulse((pulse) => pulse + 1);
  }, []);

  const handleSynthesizeAetherion = React.useCallback(() => {
    if (canSynthesizeAetherion) {
      manualSynthesisPulseRef.current = true;
      triggerRhseLiquidMotion();
    }
    synthesizeAetherion();
  }, [canSynthesizeAetherion, synthesizeAetherion, triggerRhseLiquidMotion]);

  React.useEffect(() => {
    const consumedTube = aetherionTubes < previousAetherionTubesRef.current;
    const gainedAetherion = aetherion > previousAetherionRef.current;

    if (consumedTube && gainedAetherion) {
      if (manualSynthesisPulseRef.current) {
        manualSynthesisPulseRef.current = false;
      } else {
        triggerRhseLiquidMotion();
      }
    }

    previousAetherionRef.current = aetherion;
    previousAetherionTubesRef.current = aetherionTubes;
  }, [aetherion, aetherionTubes, triggerRhseLiquidMotion]);

  return (
    <motion.div 
      key="upgrades"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col h-full min-h-0 space-y-3"
    >
      {!selectedUpgradeLocation ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* RHSE (Always Open) */}
          <div
            className={`w-full glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-xl bg-white/5 relative overflow-hidden shrink-0`}
          >
            <div
              key={`rhse-liquid-${rhseLiquidPulse}`}
              aria-hidden="true"
              className={`absolute inset-0 scale-[1.04] bg-cover bg-center bg-no-repeat opacity-55 ${rhseLiquidPulse > 0 ? 'animate-aetherion-liquid-flow' : ''}`}
              style={{ backgroundImage: `url('${AETHERION_CHAMBER_BACKGROUND}')` }}
            />
            {rhseLiquidPulse > 0 && (
              <div
                key={`rhse-liquid-sheen-${rhseLiquidPulse}`}
                className={`absolute inset-0 ${isInterstellar ? 'bg-orange-300/15' : 'bg-cyan-300/15'} animate-aetherion-liquid-sheen pointer-events-none`}
              />
            )}
            <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/25 to-slate-950/70 pointer-events-none" />
            <div className="relative z-10 p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isInterstellar ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-white uppercase tracking-wider">{t('rhse')}</h3>
                    <p className={`text-[14px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest leading-none mt-0.5`}>{t('rhseConcept')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {aetherionTubes > 0 && <div className={`text-[14px] font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} border ${isInterstellar ? 'border-orange-500/30' : 'border-cyan-500/30'} px-2 py-0.5 rounded animate-pulse`}>{aetherionTubes} TUBES</div>}
                  <ChevronUp className={`w-4 h-4 ${isInterstellar ? 'text-orange-500/40' : 'text-cyan-500/40'}`} />
                </div>
              </div>
            </div>

            <div className="relative z-10 p-3 pt-4 space-y-4">
            {isInterstellar && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Extraction Technology Upgrade */}
                <PremiumCanvasButton
                  onClick={() => {
                    const cost = 10000 * Math.pow(2.5, extractionTechLevel);
                    if (qc >= cost && extractionTechLevel < 10) {
                      setExtractionTechLevel(extractionTechLevel + 1);
                      playSfx('level_up');
                      addLog(`${t('extractionTech')} UPGRADED: Level ${extractionTechLevel + 1}`, 'success');
                    }
                  }}
                  disabled={extractionTechLevel >= 10 || qc < (10000 * Math.pow(2.5, extractionTechLevel))}
                  tone={extractionTechLevel >= 10 ? 'green' : qc >= (10000 * Math.pow(2.5, extractionTechLevel)) ? 'orange' : 'steel'}
                  className="min-h-[94px] p-2.5"
                  contentClassName={`flex-col gap-1 items-stretch ${extractionTechLevel >= 10 ? 'text-emerald-300' : qc >= (10000 * Math.pow(2.5, extractionTechLevel)) ? 'text-orange-300' : 'text-slate-500'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('extractionTech')}</span>
                    <span className="text-base font-mono font-bold">{extractionTechLevel >= 10 ? 'MAX' : `LVL ${extractionTechLevel}`}</span>
                  </div>
                  {extractionTechLevel < 10 && (
                    <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                      {formatValue(10000 * Math.pow(2.5, extractionTechLevel))} QC
                    </div>
                  )}
                </PremiumCanvasButton>

                {/* Solar Mapping Upgrade */}
                <PremiumCanvasButton
                  onClick={() => {
                    const cost = 10000 * Math.pow(2.5, solarMappingLevel);
                    if (qc >= cost && solarMappingLevel < 10) {
                      setSolarMappingLevel(solarMappingLevel + 1);
                      playSfx('level_up');
                      addLog(`${t('solarMapping')} UPGRADED: Level ${solarMappingLevel + 1}`, 'success');
                    }
                  }}
                  disabled={solarMappingLevel >= 10 || qc < (10000 * Math.pow(2.5, solarMappingLevel))}
                  tone={solarMappingLevel >= 10 ? 'green' : qc >= (10000 * Math.pow(2.5, solarMappingLevel)) ? 'orange' : 'steel'}
                  className="min-h-[94px] p-2.5"
                  contentClassName={`flex-col gap-1 items-stretch ${solarMappingLevel >= 10 ? 'text-emerald-300' : qc >= (10000 * Math.pow(2.5, solarMappingLevel)) ? 'text-orange-300' : 'text-slate-500'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('solarMapping')}</span>
                    <span className="text-base font-mono font-bold">{solarMappingLevel >= 10 ? 'MAX' : `LVL ${solarMappingLevel}`}</span>
                  </div>
                  {solarMappingLevel < 10 && (
                    <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                      {formatValue(10000 * Math.pow(2.5, solarMappingLevel))} QC
                    </div>
                  )}
                </PremiumCanvasButton>

                {/* Double Route Upgrade (New) */}
                <PremiumCanvasButton
                  onClick={() => {
                    const cost = DOUBLE_ROUTE_COSTS[doubleRouteLevel];
                    if (qc >= cost && doubleRouteLevel < 5) {
                      setDoubleRouteLevel(doubleRouteLevel + 1);
                      playSfx('level_up');
                      addLog(`${t('doubleRoute')} UPGRADED: Level ${doubleRouteLevel + 1}`, 'success');
                    }
                  }}
                  disabled={doubleRouteLevel >= 5 || qc < (DOUBLE_ROUTE_COSTS[doubleRouteLevel] || 0)}
                  tone={doubleRouteLevel >= 5 ? 'green' : qc >= (DOUBLE_ROUTE_COSTS[doubleRouteLevel] || 0) ? 'orange' : 'steel'}
                  className="min-h-[94px] p-2.5"
                  contentClassName={`flex-col gap-1 items-stretch ${doubleRouteLevel >= 5 ? 'text-emerald-300' : qc >= (DOUBLE_ROUTE_COSTS[doubleRouteLevel] || 0) ? 'text-orange-300' : 'text-slate-500'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('doubleRoute')}</span>
                    <span className="text-base font-mono font-bold">{doubleRouteLevel >= 5 ? 'MAX' : `LVL ${doubleRouteLevel}`}</span>
                  </div>
                  {doubleRouteLevel < 5 && (
                    <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                      {formatValue(DOUBLE_ROUTE_COSTS[doubleRouteLevel])} QC
                    </div>
                  )}
                </PremiumCanvasButton>

                {/* Doom Protocol Upgrade (New) */}
                <PremiumCanvasButton
                  onClick={() => {
                    const cost = DOOM_P_COSTS[doomPLevel];
                    if (qc >= cost && doomPLevel < 10) {
                      setDoomPLevel(doomPLevel + 1);
                      playSfx('police_sirene_1');
                      addLog(`${t('doomP')} UPGRADED: Level ${doomPLevel + 1}`, 'success');
                    }
                  }}
                  disabled={doomPLevel >= 10 || qc < (DOOM_P_COSTS[doomPLevel] || 0)}
                  tone={doomPLevel >= 10 ? 'green' : qc >= (DOOM_P_COSTS[doomPLevel] || 0) ? 'orange' : 'steel'}
                  className="min-h-[94px] p-2.5"
                  contentClassName={`flex-col gap-1 items-stretch ${doomPLevel >= 10 ? 'text-emerald-300' : qc >= (DOOM_P_COSTS[doomPLevel] || 0) ? 'text-orange-300' : 'text-slate-500'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('doomP')}</span>
                    <span className="text-base font-mono font-bold">{doomPLevel >= 10 ? 'MAX' : `LVL ${doomPLevel}`}</span>
                  </div>
                  {doomPLevel < 10 && (
                    <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                      {formatValue(DOOM_P_COSTS[doomPLevel])} QC
                    </div>
                  )}
                </PremiumCanvasButton>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Mining Waste */}
              <div className="space-y-1.5 shadow-sm">
                <div className="flex justify-between items-end px-1">
                  <span className="text-[15px] font-orbitron text-slate-400 uppercase tracking-widest">♻️ {t('miningWaste')}</span>
                  <span className="text-base font-mono font-bold text-white">{formatValue(miningWaste)} / {formatValue(7500)}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    animate={{ width: `${(miningWaste / 7500) * 100}%` }}
                  />
                </div>
              </div>

              {/* Solar Energy */}
              <div className="space-y-1.5 shadow-sm">
                <div className="flex justify-between items-end px-1">
                  <span className="text-[15px] font-orbitron text-slate-400 uppercase tracking-widest">☀️ {t('solarEnergy')}</span>
                  <span className="text-base font-mono font-bold text-white">{solarEnergy} / 7500</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                    animate={{ width: `${(solarEnergy / 7500) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1 border-t border-white/5 mt-1">
              <div className="flex items-center gap-4">
                <div className="flex flex-col cursor-pointer group/tubes" onClick={handleSynthesizeAetherion}>
                  <span className="text-[15px] font-orbitron text-slate-500 uppercase tracking-widest group-hover/tubes:text-slate-400 transition-colors">{t('aetherionTubes')}</span>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const isOverfilled = isInterstellar && aetherionTubes > 10 && i < aetherionTubes - 10;
                      const isFilled = i < aetherionTubes;
                      
                      return (
                        <div 
                          key={i} 
                          className={`w-2 h-4 rounded-sm border transition-all ${
                            isOverfilled
                            ? 'bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.6)]'
                            : (isFilled 
                              ? (isInterstellar ? 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]')
                              : 'bg-white/5 border-white/10')
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="text-base font-mono font-bold text-white ml-2">
                  {aetherionTubes} / {tubeCapacity}
                </div>
              </div>

              <PremiumCanvasButton
                onClick={handleSynthesizeAetherion}
                tone={canSynthesizeAetherion ? (isInterstellar ? 'orange' : 'cyan') : 'steel'}
                className="h-11 min-w-[218px] px-5 text-[15px] font-bold uppercase tracking-widest"
                contentClassName={`gap-2 ${canSynthesizeAetherion ? (isInterstellar ? 'text-orange-100' : 'text-cyan-100') : 'text-slate-500'}`}
              >
                <RefreshCw className={`w-3 h-3 ${canSynthesizeAetherion ? 'animate-spin-slow' : ''}`} />
                {language === 'pt' ? 'SINTETIZAR ÉTERION' : 'SYNTHESIZE AETHERION'}
              </PremiumCanvasButton>
            </div>
            </div>
          </div>


          {/* Ships Grid 3x3 */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
            {ROUTES.filter(r => unlockedRouteIds.includes(r.id) && r.tier === routeTier).map(route => {
            const ship = SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === routeTier)!;
            const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
            const isMaxed = locationTech.engine >= 5 && locationTech.ai >= 6 && locationTech.value >= 5 && locationTech.rare >= 5;

            return (
              <PremiumCanvasButton
                key={route.id}
                onClick={() => {
                  setSelectedUpgradeLocation(route.id);
                  playSfx('hangar_open_door');
                }}
                tone={isMaxed ? 'green' : (isInterstellar ? 'orange' : 'cyan')}
                className={`p-4 text-left h-full min-h-[112px] ${isMaxed ? 'opacity-90' : 'opacity-100'}`}
                contentClassName="items-center justify-center"
              >
                {isMaxed && (
                  <div className={`absolute inset-0 bg-black/40 rounded-xl pointer-events-none -z-10`} />
                )}
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h3 className={`font-orbitron text-base md:text-lg font-black ${ship.color} uppercase tracking-tight leading-tight`}>{ship.name}</h3>
                    <p className={`text-[15px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest leading-none mt-1`}>{t('manageInfrastructure')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isMaxed && (
                      <div className={`text-[14px] md:text-base font-orbitron font-black ${ship.color} border-2 ${ship.color.replace('text-', 'border-').replace('-400', '-500/50')} px-3 py-1 rounded shadow-[0_0_15px_currentColor]`}>
                        MAX
                      </div>
                    )}
                    <ArrowRight className={`w-5 h-5 ${isInterstellar ? 'text-orange-500/40 group-hover:text-orange-400' : 'text-cyan-500/40 group-hover:text-cyan-400'} group-hover:translate-x-1 transition-all`} />
                  </div>
                </div>
              </PremiumCanvasButton>
            );
          })}
        </div>
      </div>
    ) : (
        <div className="flex flex-col h-full gap-4">
          {/* Back Button - Top Level */}
          <PremiumCanvasButton
            onClick={() => {
              setSelectedUpgradeLocation(null);
              playSfx('hangar_close_door');
            }}
            tone={isInterstellar ? 'orange' : 'cyan'}
            className="h-10 w-fit min-w-[112px] px-4 text-lg font-bold uppercase tracking-widest shrink-0"
            contentClassName={`gap-2 ${isInterstellar ? 'text-orange-200' : 'text-cyan-200'}`}
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> {t('back')}
          </PremiumCanvasButton>

          <div className="grid grid-cols-4 grid-rows-[auto_1fr_1fr] gap-6 flex-1 min-h-0">
            {/* ROW 1: Evolution Progress (Left 50%) + Title (Right 50%) */}
            <div className="col-span-2">
              <div className={`h-full glass-panel rounded-3xl border-2 ${themeBorder} bg-white/5 p-6 flex flex-col justify-center overflow-hidden relative`}>
                <div 
                  className="absolute inset-0 z-0 opacity-60 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url('/assets/melhorias/${isInterstellar ? 'bg_rota2_upgrade.webp' : 'bg_rota1_upgrade.webp'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent z-10" />
                <div className="flex justify-between items-center gap-8 relative z-10">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-orbitron font-bold text-white/40 uppercase tracking-[0.4em] flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Ship Evolution Status
                    </h3>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[13px]">Upgrades Completion</span>
                  </div>
                  {(() => {
                    const locationTech = techLevels[selectedUpgradeLocation] || { engine: 0, ai: 0, value: 0, rare: 0 };
                      const totalLevels = Object.values(locationTech).reduce((a, b) => a + (Number(b) || 0), 0);
                      const maxPossible = UPGRADES.reduce((acc, upg) => acc + (upg.tiers[upg.tiers.length - 1].level), 0);
                      const percent = Math.min(Math.floor((totalLevels / maxPossible) * 100), 100);
                      return (
                        <div className="flex items-center gap-6 flex-1">
                          <div className="h-3 flex-1 bg-black/60 rounded-full overflow-hidden p-[2px] border border-white/10 relative">
                            <motion.div 
                              className={`h-full rounded-full transition-all duration-1000 relative ${isInterstellar ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-pink-600 shadow-[0_0_15px_rgba(219,39,119,0.5)]'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                            >
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                            </motion.div>
                          </div>
                        <span className={`text-3xl font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} leading-none min-w-[80px] text-right`}>{percent}%</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className={`h-full glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-3xl p-6 bg-white/5 border-2 flex items-center justify-start px-10 relative overflow-hidden`}>
                <div 
                  className="absolute inset-0 z-0 opacity-60 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url('/assets/melhorias/${isInterstellar ? 'bg_rota2_title.webp' : 'bg_rota1_title.webp'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="flex items-center gap-8 relative z-10">
                  <h2 className={`text-xl font-orbitron font-bold ${SHIPS.find(s => s.level === (ROUTES_MAP.get(selectedUpgradeLocation!)?.requiredShipLevel || 1) && s.tier === (ROUTES_MAP.get(selectedUpgradeLocation!)?.tier || routeTier))?.color || (isInterstellar ? 'text-orange-400' : 'text-cyan-400')} uppercase tracking-widest flex items-center gap-4`}>
                    <Settings className="w-8 h-8 animate-spin-slow" /> {SHIPS.find(s => s.level === (ROUTES_MAP.get(selectedUpgradeLocation!)?.requiredShipLevel || 1) && s.tier === (ROUTES_MAP.get(selectedUpgradeLocation!)?.tier || routeTier))?.name} {t('upgrades')}
                  </h2>

                  {/* Bulk Upgrade Button */}
                  <PremiumCanvasButton
                    onClick={() => buyAllUpgradesForShip(selectedUpgradeLocation!)}
                    tone="green"
                    className="h-12 w-12"
                    contentClassName="text-emerald-200"
                    title={language === 'pt' ? 'Melhorar Tudo' : 'Upgrade All'}
                  >
                    <ChevronUp className="w-8 h-8" />
                  </PremiumCanvasButton>
                </div>
              </div>
            </div>

            {/* ROW 2 & 3: Video (Left Span 2x2) + Upgrades (Right 2x2) */}
            <div className="col-span-2 row-span-2">
              <div className={`h-full glass-panel rounded-3xl border-2 ${themeBorder} relative overflow-hidden flex items-center justify-center shadow-2xl shadow-black/50`}>
                <div className="absolute inset-0 opacity-20 star-grid pointer-events-none" />
                
                {/* Maintenance/Hangar Video */}
                {(() => {
                  const shipData = SHIPS.find(s => s.level === (ROUTES_MAP.get(selectedUpgradeLocation!)?.requiredShipLevel || 1) && s.tier === (ROUTES_MAP.get(selectedUpgradeLocation!)?.tier || routeTier));
                  const shipId = shipData ? getHangarVideoId(shipData.name) : 'atlas_courier';
                  return (
                    <video 
                      key={`h-${shipId}`}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      style={{ backgroundColor: 'black' }}
                    >
                      <source src={`/videos/hangar/${shipId}.mp4`} type="video/mp4" />
                    </video>
                  );
                })()}

                <div className={`absolute inset-0 bg-gradient-to-t from-${SHIPS.find(s => s.level === (ROUTES_MAP.get(selectedUpgradeLocation!)?.requiredShipLevel || 1) && s.tier === (ROUTES_MAP.get(selectedUpgradeLocation!)?.tier || routeTier))?.color.split('-')[1] || 'cyan'}-500/20 to-transparent pointer-events-none z-10`} />
                
                <div className="absolute bottom-6 right-6 flex flex-col items-end opacity-60 z-20 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10">
                  <span className="text-base font-mono font-bold whitespace-nowrap uppercase tracking-tighter text-white">Status: Maintenance</span>
                  <span className="text-base font-mono font-bold whitespace-nowrap uppercase tracking-tighter text-white">Hangar: SEC-0{ROUTES_MAP.get(selectedUpgradeLocation!)?.requiredShipLevel}</span>
                </div>
              </div>
            </div>

            {/* UPGRADE CARDS (4 units) */}
            {UPGRADES.map((upgrade, index) => {
              const locationTech = techLevels[selectedUpgradeLocation!] || { engine: 0, ai: 0, value: 0, rare: 0 };
              const level = locationTech[upgrade.id.toLowerCase()] || 0;
              const currentTier = upgrade.tiers.find(t => t.level === level) || { name: 'Base', bonus: 'Nenhum' };
              const nextTier = upgrade.tiers.find(t => t.level === level + 1);
              
              const multiplier = getLocationMultiplier(selectedUpgradeLocation);
              const multipliers = getEconomicMultipliers();
              const cost = nextTier ? Math.floor(nextTier.cost * multiplier * multipliers.cost * (isInterstellar ? 4.5 : 1)) : 0;
              const canAfford = qc >= cost;
              
              const maxLvl = upgrade.tiers[upgrade.tiers.length - 1].level;
              const progressPercent = Math.min((level / maxLvl) * 100, 100);

              const bgName = ['motor', 'ia', 'mercadoria', 'missao'][index % 4];

              return (
                <div key={upgrade.id} className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-3xl p-4 flex flex-col hover:bg-white/5 transition-all border-2 group h-full min-h-[240px] relative overflow-hidden`}>
                  <div 
                    className="absolute inset-0 z-0 opacity-60 mix-blend-overlay pointer-events-none group-hover:opacity-80 transition-opacity"
                    style={{
                      backgroundImage: `url('/assets/melhorias/${isInterstellar ? 'bg_rota2_' : 'bg_rota1_'}${bgName}.webp')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="grid grid-cols-[1fr_auto] items-start gap-3 mb-3 shrink-0">
                    <h3 className="font-orbitron text-[15px] xl:text-base font-bold text-white leading-tight uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                      {translateData(upgrade.name)}
                    </h3>
                    <div className={`text-[12px] font-orbitron font-bold ${isInterstellar ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'} px-2.5 py-1 rounded border whitespace-nowrap leading-tight`}>
                      {t('level').toUpperCase()} {level}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${isInterstellar ? 'text-orange-100' : 'text-cyan-100'} mb-1 leading-tight uppercase tracking-tight shrink-0`}>
                    {translateData(currentTier.name)}
                  </div>
                  <div className="mb-auto flex-1 space-y-2 min-h-0">
                    <p className={`text-[12px] font-mono ${isInterstellar ? 'text-orange-500/70' : 'text-cyan-500/70'} leading-snug uppercase tracking-tighter`}>
                      {t('bonus')}: {translateData(currentTier.bonus)}
                    </p>
                    {nextTier && (
                      <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                        <p className="text-[9px] font-orbitron font-black uppercase tracking-[0.18em] text-white/35 leading-none">
                          {language === 'pt' ? 'Próximo nível' : 'Next level'}
                        </p>
                        <p className="mt-1.5 text-[11px] font-mono uppercase tracking-tighter text-white/75 leading-tight">
                          <span className="block truncate">{translateData(nextTier.name)}</span>
                          <span className="block truncate">{translateData(nextTier.bonus)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 shrink-0">
                    <PremiumCanvasButton
                      disabled={!canAfford || !nextTier}
                      onClick={() => buyUpgrade(selectedUpgradeLocation!, upgrade)}
                      tone={canAfford && nextTier ? (isInterstellar ? 'orange' : 'purple') : 'steel'}
                      className="w-full h-[52px] text-base font-bold tracking-[0.18em] uppercase"
                      contentClassName={`gap-2 ${canAfford && nextTier ? (isInterstellar ? 'text-orange-200' : 'text-pink-200') : 'text-slate-500'}`}
                    >
                      <div 
                        className={`pointer-events-none absolute inset-y-0 left-0 z-[1] opacity-25 transition-all duration-500 ${isInterstellar ? 'bg-orange-500' : 'bg-pink-600'}`} 
                        style={{ width: `${progressPercent}%` }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        {nextTier ? formatValue(cost) : t('max').toUpperCase()}
                      </span>
                    </PremiumCanvasButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </motion.div>
  );
});

export default UpgradesTab;
