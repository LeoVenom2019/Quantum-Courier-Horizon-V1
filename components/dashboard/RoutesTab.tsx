'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, ArrowRight, Package, Coins, Compass as CompassIcon, Rocket } from 'lucide-react';
import { ROUTES, SHIPS } from '@/lib/game-data';
import { UPGRADES_MAP, ROUTES_MAP } from '@/lib/game-constants';
import { useDashboard } from './DashboardProvider';

const RoutesTab = memo(() => {
  const { 
    activeTab, 
    t, 
    progression, 
    economy, 
    dispatch, 
    formatValue, 
    language,
    autoTravelActive,
    autoTravelProgress,
    activeDeliveries,
    buyRoute,
    launchRoute
  } = useDashboard();

  const { 
    routeTier, 
    unlockedRouteIds, 
    techLevels, 
    autoTravelSlots, 
    ownedShips 
  } = progression;

  const { qc } = economy;

  // Re-calculating or accessing derived state that was previously passed as props
  const isInterstellar = routeTier === 'Interstellar';
  const currentRoutes = ROUTES.filter(r => r.tier === routeTier);
  const themeText = isInterstellar ? 'text-orange-400' : 'text-cyan-400';
  
  // These need to be accessible from the context or re-implemented here
  // For now, I'll keep them as local helpers or move them to the provider later
  const isRouteUnlocked = (route: any) => {
    if (!route.unlockCondition) return true;
    if (route.unlockCondition.route2Unlocked && !unlockedRouteIds.includes('alpha-centauri')) return false;
    return true;
  };

  const isRoute2Unlocked = () => unlockedRouteIds.includes('alpha-centauri');


  const translateData = (data: any) => {
    if (typeof data === 'string') return t(data as any);
    return data[language] || data['en'] || '';
  };

  const getEconomicMultipliers = () => {
    // This logic should move to the provider/selectors
    return { profit: 1, cost: 1 };
  };

  const isSpeedMode = false;

  const getAutoTravelColor = (slots: number) => {
    if (slots >= 10) return 'text-purple-400';
    if (slots >= 5) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  // Note: autoTravelActive and autoTravelProgress are still in GameDashboard state.
  // I should move them to DashboardProvider too.
  return (
    <motion.div 
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col h-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-4 lg:gap-3 flex-1 h-full overflow-hidden">
        {currentRoutes.filter(route => {
          const isShipUnlocked = route.requiredShipLevel === 1 || (ownedShips[`${routeTier}-${route.requiredShipLevel}`] || 0) > 0;
          return isShipUnlocked;
        }).map(route => {
          const isPurchased = unlockedRouteIds.includes(route.id);
          const isAutoActive = autoTravelActive[route.id];
          const autoProgress = autoTravelProgress[route.id] || 0;
          
          const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
          const valueUpgrade = UPGRADES_MAP.get('value')!;
          const valueTier = valueUpgrade.tiers.find((t: any) => t.level === locationTech.value);
          const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
          const fuelCost = Math.floor(10 * costIncreaseMultiplier);
          const canAffordFuel = qc >= fuelCost;
          const conditionsMet = isRouteUnlocked(route);
          const canAffordUnlock = qc >= (route.unlockCost || 0);

          const requiredLevel = route.requiredShipLevel;
          const totalOwned = ownedShips[`${routeTier}-${requiredLevel}`] || 0;
          const routeUsesManualHangarLimit = route.tier === 'Solar' || route.tier === 'Interstellar';
          const activeManualDeliveriesInTier = activeDeliveries.filter(d => d.tier === routeTier);
          const activeManualByShipLevel = activeManualDeliveriesInTier.reduce((acc, delivery) => {
            acc[delivery.shipLevel] = (acc[delivery.shipLevel] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);
          const activeManualShipLevels = Object.keys(activeManualByShipLevel).length;
          const activeManualForShipLevel = activeManualByShipLevel[requiredLevel] || 0;
          const manualHangarLimitReached = routeUsesManualHangarLimit && (
            activeManualDeliveriesInTier.length >= 25 ||
            activeManualForShipLevel >= 5 ||
            (activeManualForShipLevel === 0 && activeManualShipLevels >= 5)
          );
          
          let currentlyInUse = activeManualForShipLevel;
          
          Object.keys(autoTravelActive).forEach(routeId => {
            if (autoTravelActive[routeId]) {
              const r = ROUTES_MAP.get(routeId);
              if (r && r.requiredShipLevel === requiredLevel && r.tier === routeTier) {
                currentlyInUse += (autoTravelSlots[routeId] || 0);
              }
            }
          });

          const shipAvailable = currentlyInUse < totalOwned && !manualHangarLimitReached;

          const routeBgMap: Record<string, string> = {
            'terra': '/assets/texturas/bg_route1_terra.webp',
            'lua': '/assets/texturas/bg_route1_lua.webp',
            'venus': '/assets/texturas/bg_route1_venus.webp',
            'marte': '/assets/texturas/bg_route1_marte.webp',
            'mercurio': '/assets/texturas/bg_route1_mercurio.webp',
            'jupiter': '/assets/texturas/bg_route1_jupiter.webp',
            'saturno': '/assets/texturas/bg_route1_saturno.webp',
            'urano': '/assets/texturas/bg_route1_urano.webp',
            'netuno': '/assets/texturas/bg_route1_netuno.webp',
            'alpha-centauri': '/assets/texturas/bg_route2_alpha_centauri.webp',
            'proxima-centauri': '/assets/texturas/bg_route2_proxima_centauri.webp',
            'barnards-star': '/assets/texturas/bg_route2_barnards_star.webp',
            'wolf-359': '/assets/texturas/bg_route2_wolf_359.webp',
            'lalande-21185': '/assets/texturas/bg_route2_lalande_21185.webp',
            'sirius': '/assets/texturas/bg_route2_sirius.webp',
            'luyten-726-8': '/assets/texturas/bg_route2_luyten_726_8.webp',
            'ross-154': '/assets/texturas/bg_route2_ross_154.webp',
            'epsilon-eridani': '/assets/texturas/bg_route2_epsilon_eridani.webp',
          };
          const bgImage = routeBgMap[route.id];

          return (
            <div 
              key={route.id}
              className={`group relative glass-panel rounded-xl transition-all flex flex-col h-full overflow-hidden ${
                isPurchased 
                ? `${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} bg-black/60 hover:border-white/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]` 
                : 'border-white/5 bg-black/40 opacity-50'
              }`}
            >
              {bgImage && isPurchased && (
                <div 
                  className="absolute inset-0 z-0 opacity-40 mix-blend-overlay group-hover:opacity-70 transition-opacity pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)'
                  }}
                />
              )}

              {!isPurchased && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-[2px] p-4 text-center">
                  {!conditionsMet ? (
                    <>
                      <Shield className="w-8 h-8 text-slate-600 mb-3" />
                      <div className="text-[14px] font-orbitron text-slate-500 uppercase tracking-widest mb-2 font-bold">{t('locked')}</div>
                      <div className="text-sm text-slate-600 leading-relaxed font-mono uppercase">
                        {route.unlockCondition?.route2Unlocked && !isRoute2Unlocked() ? t('route2UnlockDesc') : `${t('requiredShip')}: Lvl ${route.requiredShipLevel}`}
                      </div>
                    </>
                  ) : (
                    <>
                      <Zap className={`w-8 h-8 ${isInterstellar ? 'text-orange-500' : 'text-yellow-500'} mb-3 animate-pulse`} />
                      <div className={`text-[14px] font-orbitron ${themeText} uppercase tracking-[0.2em] mb-4 font-bold`}>{t('readyToUnlock')}</div>
                      <button
                        onClick={() => buyRoute(route)}
                        disabled={!canAffordUnlock}
                        className={`px-6 py-3 rounded-lg font-orbitron text-base font-bold tracking-[0.2em] transition-all w-full border-b-2 ${
                          canAffordUnlock 
                          ? `${isInterstellar ? 'bg-orange-500 text-black hover:bg-orange-400 border-orange-700 shadow-[0_0_25px_rgba(249,115,22,0.4)]' : 'bg-yellow-500 text-black hover:bg-yellow-400 border-yellow-700 shadow-[0_0_25px_rgba(234,179,8,0.4)]'}` 
                          : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed'
                        }`}
                      >
                        {t('unlock').toUpperCase()}: {formatValue(route.unlockCost || 0)} QC
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Card Content with Internal Padding */}
              <div className="relative z-10 p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-orbitron text-base font-black text-white ${isInterstellar ? 'group-hover:neon-text-orange text-orange-200' : 'group-hover:neon-text-cyan text-cyan-100'} transition-colors truncate leading-none uppercase tracking-[0.1em]`}>{t(route.name as any)}</h3>
                    <p className={`text-[13px] font-mono mt-2 flex items-center gap-2 ${isInterstellar ? 'text-orange-500/80' : 'text-cyan-500/80'} truncate leading-tight uppercase tracking-widest`}>
                      <span className="opacity-40">{t(route.origin as any)}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-40" />
                      <span>{t(route.destination as any)}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2">
                    <div className={`px-2 py-0.5 ${isInterstellar ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'} rounded text-[11px] font-black uppercase tracking-widest whitespace-nowrap border shadow-sm`}>
                      {route.tier}
                    </div>
                    <div className={`text-[12px] font-mono uppercase tracking-tighter font-bold ${shipAvailable ? (isInterstellar ? 'text-orange-400/80' : 'text-cyan-400/80') : 'text-pink-400'}`}>
                      <span className={SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === route.tier)?.color}>
                        Lvl {route.requiredShipLevel} • {translateData(SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === route.tier)?.name || '')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 flex-1 py-2 border-y border-white/5">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-slate-500 leading-none tracking-[0.2em] font-orbitron font-bold mb-1 opacity-70">{t('cargo')}</div>
                      <div className="text-[12px] font-mono flex items-center gap-2 leading-none text-white font-bold">
                        <Package className="w-3 h-3 text-pink-500" />
                        {t(route.cargoType as any)}
                      </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-slate-500 leading-none tracking-[0.2em] font-orbitron font-bold mb-1 opacity-70">{t('reward')}</div>
                    <div className="text-[12px] font-mono flex items-center gap-2 text-yellow-400 leading-none font-bold">
                      <Coins className="w-3 h-3" />
                      {Math.floor(route.reward * (1 + (valueTier?.value || 0)) * getEconomicMultipliers().profit)}
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <div className="text-[10px] uppercase text-slate-500 leading-none tracking-[0.2em] font-orbitron font-bold mb-1 opacity-70">{t('range')}</div>
                    <div className="text-[12px] font-mono flex items-center gap-2 text-slate-300 leading-none font-bold">
                      <CompassIcon className="w-3 h-3 text-cyan-500" />
                      {formatValue(route.distance)} {route.tier === 'Interstellar' ? 'LY' : 'km'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Launch Button - Perfectly fits the bottom */}
              <button
                disabled={!isPurchased || !canAffordFuel || !shipAvailable}
                onClick={() => launchRoute(route)}
                className={`w-full py-4 font-orbitron text-[14px] font-black tracking-[0.2em] transition-all flex items-center justify-center gap-3 uppercase border-t border-white/10 ${
                  isPurchased && canAffordFuel && shipAvailable
                  ? (isAutoActive 
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                      : (isInterstellar 
                          ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_-10px_20px_rgba(249,115,22,0.1)]' 
                          : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_-10px_20px_rgba(6,182,212,0.1)]'))
                  : 'bg-black/40 text-slate-700 cursor-not-allowed grayscale'
                }`}
              >
                {isAutoActive ? (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>AUTOMÁTICO {autoTravelSlots[route.id] || 1}X</span>
                    <span className="text-white/60 ml-1">({Math.floor(autoProgress)}%)</span>
                  </div>
                ) : totalOwned === 0 ? (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 opacity-50" />
                    <span className="text-slate-500 opacity-80">{language === 'pt' ? 'REQUER NAVE' : 'SHIP REQUIRED'}</span>
                  </div>
                ) : manualHangarLimitReached ? (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 opacity-50" />
                    <span className="text-pink-500 opacity-80">{language === 'pt' ? 'HANGAR CHEIO' : 'HANGAR FULL'}</span>
                  </div>
                ) : !shipAvailable ? (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 opacity-50" />
                    <span className="text-pink-500 opacity-80">{language === 'pt' ? 'EM VIAGEM' : 'ON TRAVEL'}</span>
                  </div>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>{t('launch').toUpperCase()} ({fuelCost} QC)</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

export default RoutesTab;
