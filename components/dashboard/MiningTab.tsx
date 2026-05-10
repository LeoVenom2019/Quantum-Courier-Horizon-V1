'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Lock, Cpu, TrendingUp, Coins, Zap } from 'lucide-react';
import { ORES, ROBOT_UPGRADES } from '@/lib/game-data';
import { ROBOT_UPGRADES_MAP } from '@/lib/game-constants';
import { useDashboard } from './DashboardProvider';

const MiningTab = memo(() => {
  const { 
    t, 
    progression, 
    economy, 
    mining, 
    combat,
    formatValue, 
    miningPageIndex, 
    setMiningPageIndex, 
    sellOrePack, 
    buyMiningRobot, 
    upgradeMiningRobot, 
    buyMiningCompression, 
    buyAutoSell,
    toggleAutoSell,
    getEconomicMultipliers 
  } = useDashboard();

  const { routeTier, ownedShips } = progression;
  const { qc } = economy;
  const { 
    miningRobots, 
    miningRobotLevels, 
    oresCollected, 
    autoSellByOre, 
    autoSellUnlockedByOre, 
    miningCompressionLevels 
  } = mining;

  const isInterstellar = routeTier === 'Interstellar';
  const currentOres = ORES.filter(o => o.tier === routeTier);

  const themeAccent = isInterstellar ? 'text-orange-400' : 'text-cyan-400';
  const themeBorder = isInterstellar ? 'border-orange-500/20' : 'border-cyan-500/20';
  const themeBg = isInterstellar ? 'bg-orange-500/5' : 'bg-cyan-500/5';
  const themeGlow = isInterstellar ? 'neon-border-orange' : 'neon-border-cyan';
  const themeBtn = isInterstellar ? 'hover:bg-orange-500/20 text-orange-400 border-orange-500/30' : 'hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30';

  const renderOreCard = (ore: any, isMainCard: boolean = false) => {
    const robots = miningRobots[ore.id] || 0;
    const level = miningRobotLevels[ore.id] || 1; // Correcting access to robot level
    const upgrade = ROBOT_UPGRADES_MAP.get(level) || ROBOT_UPGRADES[0];
    const nextUpgrade = ROBOT_UPGRADES_MAP.get(level + 1);
    const amount = oresCollected[ore.id] || 0;
    const packs = Math.floor(amount / ore.packSize);
    const isAutoSell = autoSellByOre[ore.id];
    const compressionLevel = miningCompressionLevels[ore.id] || 0;
    const isActive = robots > 0;
    
    const isUnlocked = Object.entries(ownedShips).some(([key, count]) => {
      const [tier, shipLevel] = key.split('-');
      return tier === ore.tier && parseInt(shipLevel) >= ore.requiredShipLevel && (count as number) > 0;
    });

    const multipliers = getEconomicMultipliers();
    const robotCost = Math.floor(ore.robotBaseCost * Math.pow(1.1, robots) * multipliers.cost * (isInterstellar ? 0.4 : 1));
    const upgradeCost = nextUpgrade ? Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * multipliers.cost * (isInterstellar ? 0.5 : 1)) : 0;
    const compressionCost = Math.floor(ore.robotBaseCost * Math.pow(1.6681, compressionLevel) * multipliers.cost * (isInterstellar ? 0.2 : 1));

    if (!isUnlocked) {
      return (
        <div key={ore.id} className={`glass-panel border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center opacity-30 grayscale p-12 ${isMainCard ? 'min-h-[450px]' : 'h-full'}`}>
          <Lock className="w-12 h-12 text-slate-500 mb-4" />
          <div className="text-xl font-orbitron text-slate-500 uppercase tracking-widest">{ore.name}</div>
          <div className="text-base text-slate-600 font-mono mt-2 uppercase tracking-widest">{t('requiresShipLevel')} {ore.requiredShipLevel}+</div>
        </div>
      );
    }

    return (
      <div 
        key={ore.id} 
        className={`glass-panel p-6 rounded-2xl border transition-all duration-500 flex flex-col h-full relative overflow-hidden ${isActive ? themeGlow + ' ' + themeBg : 'border-white/10'}`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2 lg:mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-slate-900 border ${themeBorder}`}>
                <Cpu className={`w-4 h-4 ${themeAccent}`} />
              </div>
              <h3 className="font-orbitron text-base lg:text-lg font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{ore.name}</h3>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('robots')}:</span>
                <span className={`text-[12px] font-mono font-bold ${robots >= 5 ? 'text-emerald-400' : themeAccent}`}>
                  {robots}/5
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('upgrade')}:</span>
                <span className={`text-[12px] font-mono font-bold ${level >= 5 ? 'text-emerald-400' : themeAccent}`}>
                  {level}/5
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('compression')}:</span>
                <span className={`text-[12px] font-mono font-bold ${compressionLevel >= 10 ? 'text-emerald-400' : themeAccent}`}>
                  {compressionLevel}/10
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1 opacity-80 uppercase leading-none px-1">
              {t('compressionEffect' as any)}: +{(compressionLevel * 20)}% {t('value')}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-xl lg:text-2xl font-orbitron font-bold tracking-tighter ${themeAccent}`}>{formatValue(packs)} <span className="text-[12px] opacity-60 font-mono">PKS</span></div>
            <div className="flex items-center justify-end gap-2 mt-1">
              {autoSellUnlockedByOre[ore.id] ? (
                <button 
                  onClick={() => toggleAutoSell(ore.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all border ${isAutoSell ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white'}`}
                >
                  {isAutoSell ? 'AUTO-SELL ON' : 'AUTO-SELL OFF'}
                </button>
              ) : (
                <button 
                  onClick={() => buyAutoSell(ore.id)}
                  className="text-[10px] font-bold bg-slate-900 border border-white/5 text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1.5"
                >
                  <Coins className="w-2.5 h-2.5" /> {formatValue(Math.floor(ore.autoSellCost * getEconomicMultipliers().cost))}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collection Status */}
        <div className="space-y-1 mb-2 lg:mb-4">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('collection')}: {(amount % ore.packSize).toFixed(0)}/{ore.packSize}</span>
            <span className={`text-[14px] font-orbitron font-bold ${themeAccent}`}>{Math.floor((amount % ore.packSize) / ore.packSize * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className={`h-full relative z-10 bg-gradient-to-r ${isInterstellar ? 'from-orange-600 to-orange-400' : 'from-cyan-600 to-cyan-400'}`} 
              animate={{ width: `${(amount % ore.packSize) / ore.packSize * 100}%` }} 
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
        </div>

        {/* Video Container (16:9) - Compacted */}
        <div className="flex-1 flex items-center justify-center min-h-[120px] mb-2 overflow-hidden">
          <div className={`w-[75%] aspect-video bg-black rounded-xl border ${themeBorder} relative overflow-hidden shadow-2xl flex items-center justify-center`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none z-10" />
            <video 
              key={`mining-video-${ore.id}`}
              src={`/videos/mining/${ore.id}.webm`}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <Cpu className={`w-16 h-16 ${themeAccent}`} />
            </div>
          </div>
        </div>

        {/* Interaction Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 shrink-0 mb-4">
          {/* Buy Robot */}
          <button 
            onClick={() => buyMiningRobot(ore.id)} 
            disabled={robots >= 5 || qc < robotCost} 
            className={`group relative p-2 lg:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
              robots >= 5 
                ? 'border-white/5 bg-slate-900/40 text-slate-600 opacity-60 cursor-not-allowed' 
                : qc >= robotCost 
                  ? `border-white/10 bg-slate-900/60 ${themeAccent} hover:scale-[1.02] active:scale-[0.98] hover:border-white/20`
                  : 'border-white/5 bg-slate-900/40 text-slate-700 cursor-not-allowed'
            }`}
          >
            <Cpu className="w-4 h-4 mb-1" />
            <div className="text-[10px] font-bold uppercase tracking-widest leading-none">{t('robot')}</div>
            <div className="text-[12px] font-mono font-bold leading-none">{robots >= 5 ? 'MAX' : formatValue(robotCost)}</div>
          </button>

          {/* Upgrade Robot */}
          <button 
            onClick={() => upgradeMiningRobot(ore.id, 'power')} 
            disabled={level >= 5 || qc < upgradeCost} 
            className={`group relative p-2 lg:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
              level >= 5 
                ? 'border-white/5 bg-slate-900/40 text-slate-600 opacity-60 cursor-not-allowed' 
                : qc >= upgradeCost 
                  ? 'border-white/10 bg-slate-900/60 text-emerald-400 hover:scale-[1.02] active:scale-[0.98] hover:border-white/20'
                  : 'border-white/5 bg-slate-900/40 text-slate-700 cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-1" />
            <div className="text-[10px] font-bold uppercase tracking-widest leading-none">{t('upgrade')}</div>
            <div className="text-[12px] font-mono font-bold leading-none">{level >= 5 ? 'MAX' : formatValue(upgradeCost)}</div>
          </button>

          {/* Compression */}
          <button 
            onClick={() => buyMiningCompression(ore.id)} 
            disabled={compressionLevel >= 10 || qc < compressionCost} 
            className={`group relative p-2 lg:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
              compressionLevel >= 10 
                ? 'border-white/5 bg-slate-900/40 text-slate-600 opacity-60 cursor-not-allowed' 
                : qc >= compressionCost 
                  ? 'border-white/10 bg-slate-900/60 text-indigo-400 hover:scale-[1.02] active:scale-[0.98] hover:border-white/20'
                  : 'border-white/5 bg-slate-900/40 text-slate-700 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4 mb-1" />
            <div className="text-[10px] font-bold uppercase tracking-widest leading-none">{t('compression')}</div>
            <div className="text-[12px] font-mono font-bold leading-none">{compressionLevel >= 10 ? 'MAX' : formatValue(compressionCost)}</div>
          </button>

          {/* Manual Sell */}
          <button 
            onClick={(e) => sellOrePack(ore.id, e)} 
            disabled={packs <= 0} 
            className={`group relative p-2 lg:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
              packs > 0 
                ? 'border-white/10 bg-slate-900/60 text-yellow-400 hover:scale-[1.02] active:scale-[0.98] hover:border-white/20'
                : 'border-white/5 bg-slate-900/40 text-slate-700 cursor-not-allowed'
            }`}
          >
            <Coins className="w-4 h-4 mb-1" />
            <div className="text-[10px] font-bold uppercase tracking-widest leading-none">{t('sell')}</div>
            <div className="text-[12px] font-mono font-bold leading-none">{packs > 0 ? `${packs} PKS` : '---'}</div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="mining"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col h-full min-h-0 gap-4"
    >
      <div className={`glass-panel ${themeGlow} p-4 rounded-xl flex justify-between items-center shrink-0`}>
        <div>
          <h2 className={`text-lg font-orbitron font-bold ${themeAccent} uppercase tracking-tighter`}>{t('mining')}</h2>
          <p className="text-base text-slate-500 font-mono uppercase tracking-widest">{t('manageInfrastructure')}</p>
        </div>
        
        {/* Universal Pager Logic */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMiningPageIndex(Math.max(0, miningPageIndex - 1))}
            disabled={miningPageIndex === 0}
            className={`p-2 rounded-lg border transition-all ${miningPageIndex === 0 ? 'opacity-20 cursor-not-allowed border-white/10' : themeBtn}`}
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex flex-col items-center">
            <span className={`text-xl font-orbitron font-bold ${themeAccent} leading-none`}>
              {miningPageIndex + 1}
            </span>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{t('of')} {currentOres.length}</span>
          </div>
          <button 
            onClick={() => setMiningPageIndex(Math.min(currentOres.length - 1, miningPageIndex + 1))}
            disabled={miningPageIndex === currentOres.length - 1}
            className={`p-2 rounded-lg border transition-all ${miningPageIndex === currentOres.length - 1 ? 'opacity-20 cursor-not-allowed border-white/10' : themeBtn}`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={miningPageIndex + (isInterstellar ? '-int' : '-sol')} 
          initial={{ opacity: 0, scale: 0.98, x: 20 }} 
          animate={{ opacity: 1, scale: 1, x: 0 }} 
          exit={{ opacity: 0, scale: 1.02, x: -20 }} 
          className="flex-1 min-h-0"
        >
          {currentOres[miningPageIndex] && renderOreCard(currentOres[miningPageIndex], true)}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});

export default MiningTab;
