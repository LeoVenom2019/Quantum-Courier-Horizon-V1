'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Flame, Coins } from 'lucide-react';
import { ROUTES, SHIPS } from '@/lib/game-data';
import { AETHERION_CHAMBER_BACKGROUND, INTERSTELLAR_AUTO_BACKGROUNDS, SOLAR_AUTO_BACKGROUNDS } from '@/lib/ui-backgrounds';
import { useDashboard } from './DashboardProvider';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

const AutoTab = memo(() => {
  const { 
    t, 
    progression, 
    economy, 
    formatValue, 
    autoTravelActive, 
    autoTravelDesired, 
    autoTravelProgress, 
    buyAutoTravelSlot, 
    getLocationMultiplier, 
    getEconomicMultipliers, 
    toggleAutoTravel,
    translateData,
    synthesizeAetherion,
    playSfx
  } = useDashboard();

  const { routeTier, unlockedRouteIds, autoTravelSlots, techLevels } = progression;
  const { aetherion } = economy;

  const isInterstellar = routeTier === 'Interstellar';
  const isSpeedMode = false;
  const aetherionFillRatio = Math.min(1, Math.max(0, aetherion / 10000));
  const chamberBackgroundOpacity = aetherionFillRatio;
  const chamberBackgroundBrightness = 0.85 + aetherionFillRatio * 0.55;

  const getAutoTravelColor = (slots: number) => {
    if (slots >= 10) return 'text-purple-400';
    if (slots >= 5) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  return (
    <motion.div 
      key="auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full min-h-0 gap-3 overflow-hidden"
    >
      {/* CCE - Câmara de Contenção de Etérion */}
      <div 
        onClick={synthesizeAetherion}
        className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} p-4 rounded-xl overflow-hidden relative group shrink-0 cursor-pointer hover:bg-white/5 transition-all`}
      >
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <Image unoptimized width={800} height={600}
            src={AETHERION_CHAMBER_BACKGROUND}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-[filter,opacity] duration-[1800ms] ease-in-out"
            style={{
              opacity: chamberBackgroundOpacity,
              filter: `brightness(${chamberBackgroundBrightness}) saturate(${1 + aetherionFillRatio * 0.45})`,
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${isInterstellar ? 'bg-orange-400/10' : 'bg-cyan-400/10'}`}
            style={{ opacity: aetherionFillRatio * 0.35 }}
          />
        </div>

        <div className="relative z-10 flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isInterstellar ? 'bg-orange-500/10 text-orange-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{t('cce')}</h2>
              <p className="text-[14px] text-slate-500 font-mono uppercase tracking-widest">{t('cceConcept')}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-orbitron text-slate-400 uppercase tracking-widest leading-none mb-1">{t('aetherion')}</span>
            <div className={`text-xl font-mono font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} leading-none`}>
              {Math.floor((aetherion / 10000) * 100)}%
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-center">
          <div className="space-y-1.5">
            <div className="h-2.5 bg-white/5 rounded-full border border-white/10 p-0.5 relative overflow-hidden">
              <motion.div 
                className={`h-full rounded-full bg-gradient-to-r ${isInterstellar ? 'from-orange-600 via-orange-400 to-orange-600' : 'from-cyan-600 via-cyan-400 to-cyan-600'} shadow-[0_0_15px_rgba(6,182,212,0.3)]`}
                animate={{ width: `${(aetherion / 10000) * 100}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 1 }}
              />
              <div className="absolute inset-0  opacity-20" />
            </div>
            <div className="flex justify-end text-[14px] font-mono text-slate-500 uppercase tracking-tighter">
              <span>{formatValue(aetherion)} / {formatValue(10000)} Units</span>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-[14px] text-slate-400 font-mono leading-tight italic border-l border-white/5 pl-4">
              &quot;{t('aetherionConcept')}&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {ROUTES.filter(r => unlockedRouteIds.includes(r.id)).map(route => {
        const slots = autoTravelSlots[route.id] || 0;
        const isActive = autoTravelActive[route.id];
        const isDesired = autoTravelDesired[route.id];
        const progress = autoTravelProgress[route.id] || 0;
        const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
        const ship = SHIPS.find((s: any) => s.level === route.requiredShipLevel && s.tier === route.tier);
        const backgroundImage = route.tier === 'Solar'
          ? SOLAR_AUTO_BACKGROUNDS[route.requiredShipLevel]
          : route.tier === 'Interstellar'
            ? INTERSTELLAR_AUTO_BACKGROUNDS[route.requiredShipLevel]
            : undefined;
        
        return (
          <div
            key={route.id}
            className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-lg p-3 flex flex-col gap-3 bg-cover bg-center bg-no-repeat hover:bg-white/5 transition-colors h-full min-h-[160px] justify-between relative overflow-hidden`}
            style={backgroundImage ? { backgroundImage: `url('${backgroundImage}')` } : undefined}
          >
            {backgroundImage && (
              <>
                <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-transparent to-slate-950/70 pointer-events-none" />
              </>
            )}
            <div className="relative z-10 space-y-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h3 className={`font-orbitron text-base font-bold ${ship?.color || 'text-white'} truncate leading-tight uppercase tracking-wider`}>{ship?.name || translateData(route.name)}</h3>
                  <p className={`text-[14px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} leading-tight uppercase`}>{translateData(route.name)}</p>
                </div>
                <div className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-tighter border ${slots > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                  {slots > 0 ? t('active') : t('locked')}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((slot) => (
                      <div 
                        key={slot} 
                        className={`w-2 h-2 rounded-sm border ${
                          slot <= slots 
                          ? (isSpeedMode ? 'bg-red-600 border-red-400 shadow-[0_0_5px_rgba(220,38,38,0.4)]' : (isInterstellar ? 'bg-orange-500 border-orange-400' : getAutoTravelColor(slot))) 
                          : 'bg-white/5 border-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">{t('autoTravelSlots')}</span>
                </div>
                
                {slots < 5 ? (
                  <div className="flex flex-col items-end gap-1">
                    <PremiumCanvasButton
                      onClick={() => buyAutoTravelSlot(route.id)}
                      tone={isInterstellar ? 'orange' : 'purple'}
                      className="h-8 min-w-[118px] px-2 text-[7px] font-bold uppercase tracking-widest"
                      contentClassName={`gap-1 ${isInterstellar ? 'text-orange-200' : 'text-pink-200'}`}
                    >
                      {t('buy').toUpperCase()} <Coins className="w-2 h-2" /> {formatValue([1000, 5000, 10000, 15000, 20000][slots] * getLocationMultiplier(route.id) * getEconomicMultipliers().cost * (route.tier === 'Interstellar' ? 2 : 1))}
                    </PremiumCanvasButton>
                  </div>
                ) : (
                  <div className="text-emerald-400 text-[7px] font-orbitron font-bold tracking-widest uppercase">{t('max')}</div>
                )}
              </div>
            </div>

            {slots > 0 && (
              <div className="relative z-10 pt-2 border-t border-white/5 flex flex-col gap-2 mt-auto">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <PremiumCanvasButton
                      onClick={() => toggleAutoTravel(route.id)}
                      tone={isDesired ? 'green' : 'steel'}
                      className="h-8 min-w-[74px] px-3 text-[14px] font-bold uppercase tracking-widest"
                      contentClassName={isDesired ? 'text-emerald-200' : 'text-slate-400'}
                    >
                      {isDesired ? t('on').toUpperCase() : t('off').toUpperCase()}
                    </PremiumCanvasButton>
                    {isDesired && !isActive && (
                      <span className="text-[6px] text-red-400 font-mono uppercase tracking-tighter">
                        {t('insufficientAetherion')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter">
                      {slots * 2} {t('aetherion')} / {t('trip')}
                    </span>
                    {isActive && (
                      <span className={`text-[14px] font-mono ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'}`}>{locationTech.engine >= 5 ? 'MAX' : `${Math.floor(progress)}%`}</span>
                    )}
                  </div>
                </div>
                
                {isDesired && (
                  <div className={`relative h-1 bg-white/5 rounded overflow-hidden ${locationTech.engine >= 5 ? 'shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500/20' : ''}`}>
                    <motion.div 
                      className={`h-full rounded-full ${locationTech.engine >= 5 ? 'bg-gradient-to-r from-purple-600 via-pink-400 to-purple-600' : (isInterstellar ? 'bg-orange-500' : getAutoTravelColor(slots))}`}
                      animate={locationTech.engine >= 5 ? { opacity: [0.6, 1, 0.6] } : { width: `${!isActive ? 0 : progress}%` }}
                      transition={locationTech.engine >= 5 ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { type: 'spring', bounce: 0, duration: 0.5 }}
                      style={locationTech.engine >= 5 ? { width: '100%' } : {}}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </motion.div>
  );
});

AutoTab.displayName = 'AutoTab';

export default AutoTab;
