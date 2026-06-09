'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Cpu, TrendingUp, Coins, Zap, Package, BarChart3, Gauge } from 'lucide-react';
import { ORES, ROBOT_UPGRADES } from '@/lib/game-data';
import { ROBOT_UPGRADES_MAP } from '@/lib/game-constants';
import { useDashboard } from './DashboardProvider';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

const SOLAR_MINERAL_VIDEOS: Record<string, string> = {
  ferrita: '/videos/minerals/cap1/1_common_ferrite.webm',
  quartzo: '/videos/minerals/cap1/2_energized_quartz.webm',
  niquel: '/videos/minerals/cap1/3_space_nickel.webm',
  cobalto: '/videos/minerals/cap1/4_ionized_cobalt.webm',
  titanio: '/videos/minerals/cap1/5_refined_titanium.webm',
  plasma: '/videos/minerals/cap1/6_plasma_crystal.webm',
  eter: '/videos/minerals/cap1/7_condensed_aether.webm',
  materia: '/videos/minerals/cap1/8_exotic_matter.webm',
  nucleo: '/videos/minerals/cap1/9_quantum_core.webm',
};

const INTERSTELLAR_MINERAL_VIDEOS: Record<string, string> = {
  'ferro-estelar': '/videos/minerals/cap2/1_stellar_iron.webm',
  'cristal-fotonico': '/videos/minerals/cap2/2_photonic_crystal.webm',
  'liga-iridio': '/videos/minerals/cap2/3_iridium_alloy.webm',
  'plasma-solido': '/videos/minerals/cap2/4_solid_plasma.webm',
  'nucleo-radiante': '/videos/minerals/cap2/5_radiant_core.webm',
  'fragmento-anomalia': '/videos/minerals/cap2/6_anomaly_fragment.webm',
  'essencia-nebular': '/videos/minerals/cap2/7_nebular_essence.webm',
  'materia-instavel': '/videos/minerals/cap2/8_unstable_matter.webm',
  'singularidade-condensada': '/videos/minerals/cap2/9_condensed_singularity.webm',
};

const MiningTab = memo(() => {
  const {
    t,
    language,
    progression,
    economy,
    mining,
    formatValue,
    miningPageIndex,
    setMiningPageIndex,
    sellOrePack,
    buyMiningRobot,
    upgradeMiningRobot,
    buyMiningCompression,
    buyAutoSell,
    toggleAutoSell,
    sellExtractionPointPacks,
    getEconomicMultipliers
  } = useDashboard();

  const { routeTier, ownedShips, battleLevel } = progression;
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
  const themeTone = isInterstellar ? 'orange' : 'cyan';

  const isOreUnlocked = (ore: any) => (
    Object.entries(ownedShips).some(([key, count]) => {
      const [tier, shipLevel] = key.split('-');
      return tier === ore.tier && parseInt(shipLevel) >= ore.requiredShipLevel && (count as number) > 0;
    })
  );

  const getOreStats = (ore: any) => {
    const robots = miningRobots[ore.id] || 0;
    const level = miningRobotLevels[ore.id] || 1;
    const nextUpgrade = ROBOT_UPGRADES_MAP.get(level + 1);
    const amount = oresCollected[ore.id] || 0;
    const packs = Math.floor(amount / ore.packSize);
    const compressionLevel = miningCompressionLevels[ore.id] || 0;
    const multipliers = getEconomicMultipliers();

    return {
      robots,
      level,
      upgrade: ROBOT_UPGRADES_MAP.get(level) || ROBOT_UPGRADES[0],
      nextUpgrade,
      amount,
      packs,
      isAutoSell: autoSellByOre[ore.id],
      compressionLevel,
      robotCost: Math.floor(ore.robotBaseCost * Math.pow(1.1, robots) * multipliers.cost * (isInterstellar ? 0.4 : 1)),
      upgradeCost: nextUpgrade ? Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * multipliers.cost * (isInterstellar ? 0.5 : 1)) : 0,
      compressionCost: Math.floor(ore.robotBaseCost * Math.pow(1.6681, compressionLevel) * multipliers.cost * (isInterstellar ? 0.2 : 1)),
    };
  };

  const renderMetric = (
    icon: React.ReactNode,
    label: string,
    value: string,
    detail: string,
    isMax = false
  ) => (
    <div className="rounded-xl border border-white/10 bg-slate-950/65 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeBorder} bg-black/45 ${themeAccent}`}>
          {icon}
        </div>
        <span className={`font-mono text-[11px] font-black uppercase ${isMax ? 'text-emerald-400' : themeAccent}`}>
          {value}
        </span>
      </div>
      <p className="font-orbitron text-[12px] font-black uppercase tracking-[0.16em] text-slate-200">{label}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{detail}</p>
    </div>
  );

  const renderMarketPanel = (
    icon: React.ReactNode,
    title: string,
    value: string,
    detail: string,
    trend: string,
    tone: 'cyan' | 'green' | 'amber' = 'cyan'
  ) => {
    const toneClass = tone === 'green' ? 'text-emerald-300' : tone === 'amber' ? 'text-yellow-300' : themeAccent;
    const barClass = tone === 'green' ? 'bg-emerald-400' : tone === 'amber' ? 'bg-yellow-400' : (isInterstellar ? 'bg-orange-400' : 'bg-cyan-400');

    return (
      <div className="relative flex h-full min-h-[118px] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-px ${barClass}`} />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeBorder} bg-black/50 ${toneClass}`}>
            {icon}
          </div>
          <span className={`font-mono text-[10px] font-black uppercase tracking-[0.18em] ${toneClass}`}>{trend}</span>
        </div>
        <div className="mt-auto">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className={`mt-3 truncate font-orbitron text-2xl font-black uppercase tracking-tight ${toneClass}`}>{value}</p>
          <p className="mt-3 line-clamp-2 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-400">{detail}</p>
        </div>
      </div>
    );
  };

  const renderOreCard = (ore: any) => {
    const isUnlocked = isOreUnlocked(ore);
    const {
      robots,
      level,
      amount,
      packs,
      isAutoSell,
      compressionLevel,
      robotCost,
      upgradeCost,
      compressionCost,
      upgrade,
    } = getOreStats(ore);

    const packProgress = Math.min(ore.packSize, amount >= ore.packSize ? ore.packSize : (amount % ore.packSize));
    const packPercent = Math.floor(amount >= ore.packSize ? 100 : (packProgress / ore.packSize) * 100);
    const compressionBonus = compressionLevel * 20;
    const compressionMultiplier = 1 + compressionLevel * 0.2;
    const routeMiningScale = isInterstellar
      ? (3.75 + Math.min(battleLevel, 55) * 0.1) * (battleLevel >= 40 ? 5 : 1)
      : 1;
    const basePackValue = Math.floor(ore.baseValue * ore.rarity * ore.packSize * getEconomicMultipliers().profit * routeMiningScale);
    const finalPackValue = Math.floor(basePackValue * compressionMultiplier);
    const currentSellValue = finalPackValue * packs;
    const productionPerSecond = robots * (0.5 * upgrade.speedBonus * upgrade.efficiencyBonus * upgrade.productionBonus);
    const productionPerMinute = productionPerSecond * 60;
    const remainingToPack = Math.max(0, ore.packSize - packProgress);
    const secondsToNextPack = productionPerSecond > 0 ? Math.ceil(remainingToPack / productionPerSecond) : null;
    const canSell = isInterstellar ? packs >= 100 : packs > 0;
    const mineralVideoSrc = isInterstellar
      ? INTERSTELLAR_MINERAL_VIDEOS[ore.id] || `/videos/mining/${ore.id}.webm`
      : SOLAR_MINERAL_VIDEOS[ore.id] || `/videos/mining/${ore.id}.webm`;

    if (!isUnlocked) {
      return (
        <div key={ore.id} className="glass-panel flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-white/5 p-12 text-center opacity-40 grayscale">
          <Lock className="mb-4 h-12 w-12 text-slate-500" />
          <div className="font-orbitron text-xl uppercase tracking-widest text-slate-500">{ore.name}</div>
          <div className="mt-2 font-mono text-base uppercase tracking-widest text-slate-600">{t('requiresShipLevel')} {ore.requiredShipLevel}+</div>
        </div>
      );
    }

    return (
      <div
        key={ore.id}
        className={`glass-panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${themeGlow} ${themeBg}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/35" />

        <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_minmax(160px,0.6fr)] gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${themeBorder} bg-slate-950/75`}>
                  <Cpu className={`h-5 w-5 ${themeAccent}`} />
                </div>
                <div>
                  <h3 className="font-orbitron text-lg font-black uppercase tracking-tight text-white lg:text-xl">{ore.name}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    {language === 'pt'
                      ? (isInterstellar ? 'Grade de mineração interestelar' : 'Grade de mineração solar')
                      : (isInterstellar ? 'Interstellar mining grid' : 'Solar mining grid')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-right">
                <div className={`font-orbitron text-2xl font-black tracking-tighter ${themeAccent}`}>
                  {formatValue(packs)} <span className="font-mono text-[12px] opacity-60">PKS</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{t('collection')}: {packProgress.toFixed(0)}/{ore.packSize}</p>
              </div>
              {autoSellUnlockedByOre[ore.id] ? (
                <PremiumCanvasButton
                  onClick={() => toggleAutoSell(ore.id)}
                  tone={isAutoSell ? 'green' : 'steel'}
                  className="h-10 min-w-[132px] px-3 text-[10px] font-black uppercase"
                  contentClassName={isAutoSell ? 'text-emerald-100' : 'text-slate-400'}
                >
                  {isAutoSell ? 'AUTO-SELL ON' : 'AUTO-SELL OFF'}
                </PremiumCanvasButton>
              ) : (
                <PremiumCanvasButton
                  onClick={() => buyAutoSell(ore.id)}
                  tone="steel"
                  className="h-10 min-w-[126px] px-3 text-[10px] font-black uppercase"
                  contentClassName="gap-1.5 text-slate-300"
                >
                  <Coins className="h-3 w-3" /> {formatValue(Math.floor(ore.autoSellCost * getEconomicMultipliers().cost))}
                </PremiumCanvasButton>
              )}
            </div>
          </div>

          <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex min-h-[320px] flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {renderMetric(<Cpu className="h-4 w-4" />, t('robots'), `${robots}/5`, robots >= 5 ? 'MAX' : formatValue(robotCost), robots >= 5)}
                {renderMetric(<TrendingUp className="h-4 w-4" />, t('upgrade'), `${level}/5`, level >= 5 ? 'MAX' : formatValue(upgradeCost), level >= 5)}
                {renderMetric(<Zap className="h-4 w-4" />, t('compression'), `${compressionLevel}/10`, `+${compressionBonus}% ${t('value')}`, compressionLevel >= 10)}
              </div>

              <div className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border ${themeBorder} bg-black shadow-2xl`}>
                <video
                  key={`mining-video-${ore.id}`}
                  src={mineralVideoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover opacity-85"
                  onError={(e) => {
                    (e.target as HTMLVideoElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <Cpu className={`h-20 w-20 ${themeAccent}`} />
                </div>

                <div className="absolute inset-x-5 bottom-5">
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.24em] text-slate-300">{t('collection')}</span>
                    <span className={`font-orbitron text-lg font-black ${themeAccent}`}>{packPercent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-slate-950/80">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${packPercent}%` }}
                      className={`h-full ${isInterstellar ? 'bg-orange-400' : 'bg-cyan-400'}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <PremiumCanvasButton
                onClick={() => buyMiningRobot(ore.id)}
                disabled={robots >= 5 || qc < robotCost}
                tone={robots >= 5 || qc < robotCost ? 'steel' : themeTone}
                className="h-20 w-full px-4 text-left"
                contentClassName={`justify-between gap-3 ${robots >= 5 || qc < robotCost ? 'text-slate-500' : themeAccent}`}
              >
                <span className="flex items-center gap-3">
                  <Cpu className="h-5 w-5" />
                  <span className="font-orbitron text-[13px] font-black uppercase tracking-[0.18em]">{t('buyRobot')}</span>
                </span>
                <span className="font-mono text-[12px] font-black">{robots >= 5 ? 'MAX' : formatValue(robotCost)}</span>
              </PremiumCanvasButton>

              <PremiumCanvasButton
                onClick={() => upgradeMiningRobot(ore.id, 'power')}
                disabled={level >= 5 || qc < upgradeCost}
                tone={level >= 5 || qc < upgradeCost ? 'steel' : 'green'}
                className="h-20 w-full px-4 text-left"
                contentClassName={`justify-between gap-3 ${level >= 5 || qc < upgradeCost ? 'text-slate-500' : 'text-emerald-300'}`}
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-orbitron text-[13px] font-black uppercase tracking-[0.18em]">{t('upgradeRobot')}</span>
                </span>
                <span className="font-mono text-[12px] font-black">{level >= 5 ? 'MAX' : formatValue(upgradeCost)}</span>
              </PremiumCanvasButton>

              <PremiumCanvasButton
                onClick={() => buyMiningCompression(ore.id)}
                disabled={compressionLevel >= 10 || qc < compressionCost}
                tone={compressionLevel >= 10 || qc < compressionCost ? 'steel' : 'indigo'}
                className="h-20 w-full px-4 text-left"
                contentClassName={`justify-between gap-3 ${compressionLevel >= 10 || qc < compressionCost ? 'text-slate-500' : 'text-indigo-300'}`}
              >
                <span className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  <span className="font-orbitron text-[13px] font-black uppercase tracking-[0.18em]">{t('compression')}</span>
                </span>
                <span className="font-mono text-[12px] font-black">{compressionLevel >= 10 ? 'MAX' : formatValue(compressionCost)}</span>
              </PremiumCanvasButton>

              <PremiumCanvasButton
                onClick={(e) => isInterstellar ? sellExtractionPointPacks(ore.id, e) : sellOrePack(ore.id, e)}
                disabled={!canSell}
                tone={canSell ? 'amber' : 'steel'}
                className="mt-auto h-24 w-full px-4 text-left"
                contentClassName={`justify-between gap-3 ${canSell ? 'text-yellow-300' : 'text-slate-500'}`}
              >
                <span className="flex items-center gap-3">
                  <Coins className="h-6 w-6" />
                  <span className="font-orbitron text-[14px] font-black uppercase tracking-[0.22em]">{t('sellPacks')}</span>
                </span>
                <span className="font-mono text-[13px] font-black">
                  {isInterstellar ? (packs >= 100 ? `${packs} PKS` : 'MIN. 100') : (packs > 0 ? `${packs} PKS` : '---')}
                </span>
              </PremiumCanvasButton>
            </div>
          </div>

          <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-3">
            {renderMarketPanel(
              <BarChart3 className="h-4 w-4" />,
              language === 'pt' ? 'Receita estimada' : 'Estimated revenue',
              currentSellValue > 0 ? `${formatValue(currentSellValue)} QC` : `${formatValue(finalPackValue)} QC`,
              language === 'pt'
                ? (currentSellValue > 0 ? `Venda atual com ${packs} pack(s).` : `Valor do próximo pack completo.`)
                : (currentSellValue > 0 ? `Current sale with ${packs} pack(s).` : `Value of the next full pack.`),
              currentSellValue > 0 ? '+SELL' : 'WAIT',
              currentSellValue > 0 ? 'green' : 'cyan'
            )}
            {renderMarketPanel(
              <Gauge className="h-4 w-4" />,
              language === 'pt' ? 'Produção' : 'Production',
              `${productionPerMinute.toFixed(1)} / MIN`,
              language === 'pt'
                ? (secondsToNextPack === null ? 'Sem robôs ativos nesta mina.' : `Próximo pack em ~${secondsToNextPack}s.`)
                : (secondsToNextPack === null ? 'No active robots in this mine.' : `Next pack in ~${secondsToNextPack}s.`),
              robots > 0 ? 'LIVE' : 'IDLE',
              robots > 0 ? 'cyan' : 'amber'
            )}
            {renderMarketPanel(
              <Zap className="h-4 w-4" />,
              language === 'pt' ? 'Compressão' : 'Compression',
              `+${compressionBonus}%`,
              language === 'pt'
                ? `Base ${formatValue(basePackValue)} QC -> Final ${formatValue(finalPackValue)} QC.`
                : `Base ${formatValue(basePackValue)} QC -> Final ${formatValue(finalPackValue)} QC.`,
              compressionLevel >= 10 ? 'MAX' : `LV ${compressionLevel}/10`,
              compressionLevel >= 10 ? 'green' : 'amber'
            )}
          </div>
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
      className="flex h-full min-h-0 flex-1 flex-col gap-4"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="glass-panel flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2">
          <div className="grid h-full min-h-0 gap-2" style={{ gridTemplateRows: `repeat(${currentOres.length}, minmax(0, 1fr))` }}>
            {currentOres.map((ore, index) => {
              const stats = getOreStats(ore);
              const isSelected = index === miningPageIndex;
              const unlocked = isOreUnlocked(ore);
              const progress = Math.floor(stats.amount >= ore.packSize ? 100 : ((stats.amount % ore.packSize) / ore.packSize) * 100);

              return (
                <PremiumCanvasButton
                  key={ore.id}
                  onClick={() => setMiningPageIndex(index)}
                  tone={isSelected ? 'purple' : 'steel'}
                  disabled={!unlocked}
                  className={`min-h-0 w-full px-3 ${isSelected ? 'shadow-[0_0_24px_rgba(168,85,247,0.55)]' : ''} ${!unlocked ? 'grayscale' : ''}`}
                  contentClassName="justify-start gap-3"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isSelected ? 'border-purple-300/70 bg-purple-950/50 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.55)]' : `${themeBorder} bg-black/45 ${themeAccent}`}`}>
                    {unlocked ? <Package className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className={`truncate font-orbitron text-[10px] font-black uppercase ${isSelected ? 'text-purple-50 drop-shadow-[0_0_8px_rgba(216,180,254,0.65)]' : 'text-slate-300'}`}>{ore.name}</p>
                    <div className={`mt-0.5 flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-[0.08em] ${isSelected ? 'text-purple-200/80' : 'text-slate-500'}`}>
                      <span>{stats.packs} PKS</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-black/60">
                      <div className={`h-full ${isSelected ? 'bg-purple-300 shadow-[0_0_10px_rgba(216,180,254,0.9)]' : isInterstellar ? 'bg-orange-400' : 'bg-cyan-400'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </PremiumCanvasButton>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={miningPageIndex + (isInterstellar ? '-int' : '-sol')}
            initial={{ opacity: 0, scale: 0.98, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: -20 }}
            className="min-h-0"
          >
            {currentOres[miningPageIndex] && renderOreCard(currentOres[miningPageIndex])}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

MiningTab.displayName = 'MiningTab';

export default MiningTab;
