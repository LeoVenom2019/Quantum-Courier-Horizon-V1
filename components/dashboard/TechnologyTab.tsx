'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Cpu, Lock, Check, Zap, Rocket, Search, ChevronRight, ChevronLeft, TrendingUp, Coins } from 'lucide-react';
import { TECHNOLOGIES, SHIPS, EXTRACTION_POINTS } from '@/lib/game-data';
import { EXTRACTION_PRODUCTION_COSTS, INTERSTELLAR_EXTRACTION_VALUE_MULTIPLIER } from '@/lib/game-constants';
import { INTERSTELLAR_EXTRACTION_POINT_BACKGROUNDS, INTERSTELLAR_TECHNOLOGY_BACKGROUNDS, SOLAR_TECHNOLOGY_BACKGROUNDS } from '@/lib/ui-backgrounds';
import { useDashboard } from './DashboardProvider';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

const formatCompactValue = (value: number) => {
  const safeValue = Math.max(0, Math.floor(value || 0));
  const absValue = Math.abs(safeValue);

  if (absValue >= 1000000000000) return `${(safeValue / 1000000000000).toFixed(1).replace(/\.0$/, '')}T`;
  if (absValue >= 1000000000) return `${(safeValue / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  if (absValue >= 1000000) return `${(safeValue / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (absValue >= 1000) return `${(safeValue / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(safeValue);
};

const TechnologyTab = memo(() => {
  const { 
    t, 
    progression, 
    economy, 
    mining, 
    language,
    formatValue, 
    playSfx, 
    addLog,
    buyTech,
    boostResearch,
    boostResearchExtractionPoint,
    techSubTab,
    setTechSubTab,
    extractionPageIndex,
    setExtractionPageIndex,
    getEconomicMultipliers,
    translateData,
    upgradeExtractionProduction,
    researchPoint,
    upgradeExtractionCompression,
    buyExtractionAutoSell,
    toggleExtractionAutoSell,
    sellExtractionPointPacks
  } = useDashboard();

  const { 
    routeTier,
    unlockedTechLevels, 
    researchingTech
  } = progression;
  const { qc } = economy;
  const { 
    extractionPacks, 
    extractionCycleProgress,
    researchingExtractionPoint,
    extractionProductionLevels,
    extractionCompressionLevels,
    unlockedExtractionPoints
  } = mining;
  const { extractionAutoSellUnlocked, extractionAutoSell } = mining;

  const isInterstellar = routeTier === 'Interstellar';
  const allTechUnlocked = (unlockedTechLevels[routeTier] || 0) >= 9;
  
  const getShipNeonBorder = (colorClass: string) => {
    if (colorClass.includes('cyan')) return 'neon-border-cyan';
    if (colorClass.includes('orange')) return 'neon-border-orange';
    if (colorClass.includes('pink')) return 'neon-border-pink';
    if (colorClass.includes('emerald')) return 'neon-border-emerald';
    if (colorClass.includes('blue')) return 'neon-border-blue';
    return 'neon-border-cyan';
  };

  const currentShips = SHIPS.filter(s => s.tier === routeTier);

  return (
    <motion.div
      key="technology"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col h-full space-y-4"
    >
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className={`text-lg lg:text-2xl font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} flex items-center gap-2`}>
            <Cpu className="w-5 h-5 lg:w-6 lg:h-6" />
            {t('technology')}
          </h2>
          <p className="text-slate-400 text-base lg:text-[14px]">
            {translateData(isInterstellar ? { pt: 'Pesquise novas tecnologias para expandir sua frota galáctica.', en: 'Research new technologies to expand your galactic fleet.' } : { pt: 'Pesquise novas tecnologias para expandir sua frota solar.', en: 'Research new technologies to expand your solar fleet.' })}
          </p>
        </div>

        {isInterstellar && (
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <PremiumCanvasButton
              onClick={() => {
                if (techSubTab !== 'ships') {
                  playSfx('tec_extract_change');
                  setTechSubTab('ships');
                }
              }}
              tone={techSubTab === 'ships' ? 'indigo' : 'steel'}
              className="h-9 px-4 text-[14px] font-bold"
              contentClassName={techSubTab === 'ships' ? 'text-white' : 'text-white/50'}
            >
              {t('research')}
            </PremiumCanvasButton>
            <PremiumCanvasButton
              onClick={() => {
                if (allTechUnlocked && techSubTab !== 'extraction') {
                  playSfx('tec_extract_change');
                  setTechSubTab('extraction');
                }
              }}
              disabled={!allTechUnlocked}
              tone={techSubTab === 'extraction' ? 'orange' : 'steel'}
              className="h-9 px-4 text-[14px] font-bold"
              contentClassName={techSubTab === 'extraction' ? 'text-orange-200' : allTechUnlocked ? 'text-white/50' : 'text-white/20'}
            >
              {language === 'pt' ? 'Extração' : 'Extraction'}
              {!allTechUnlocked && <Lock className="w-3 h-3 inline ml-1 mb-0.5" />}
            </PremiumCanvasButton>
          </div>
        )}
      </div>

      {techSubTab === 'extraction' ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXTRACTION_POINTS.filter(p => p.tier === routeTier).slice(extractionPageIndex * 5, (extractionPageIndex * 5) + 5).map((point, index) => {
              const absIndex = (extractionPageIndex * 5) + index;
              const isResearched = unlockedExtractionPoints?.includes(point.id);
              const packs = extractionPacks[point.id] || 0;
              const progressPercent = extractionCycleProgress[point.id] || 0;
              const prodLevel = extractionProductionLevels[point.id] || 0;
              const compLevel = extractionCompressionLevels[point.id] || 0;
              const isAutoSellUnlocked = extractionAutoSellUnlocked[point.id];
              const isAutoSell = extractionAutoSell[point.id];
              
              const picaretaCost = EXTRACTION_PRODUCTION_COSTS[prodLevel + 1] * Math.pow(1.1, absIndex);
              const compCost = Math.floor(100000000 * Math.pow(1.2, compLevel));
              const autoSellCost = 5000000000;
              const extractionResearchCost = point.cost;
              const extractionBoostCost = Math.floor(point.cost * 0.75);
              const extractionBackgroundImage = point.tier === 'Interstellar'
                ? INTERSTELLAR_EXTRACTION_POINT_BACKGROUNDS[point.id]
                : undefined;
              const salePreviewPacks = Math.max(packs, 100);
              const extractionCompressionMultiplier = 1 + compLevel * 0.4;
              const level40Multiplier = progression.battleLevel >= 40 && routeTier === 'Interstellar' ? 5 : 1;
              const extractionSaleValue = Math.floor(point.valuePerPack * salePreviewPacks * getEconomicMultipliers().profit * level40Multiplier * extractionCompressionMultiplier * INTERSTELLAR_EXTRACTION_VALUE_MULTIPLIER);
              const extractionSaleLabel = `${formatCompactValue(extractionSaleValue)} QC`;

              return (
                <div
                  key={point.id}
                  data-floating-reward-source={`extraction-${point.id}`}
                  className={`glass-panel p-4 rounded-2xl border transition-all duration-500 flex flex-col h-full relative overflow-hidden bg-cover bg-center bg-no-repeat ${isResearched ? 'neon-border-orange bg-orange-500/5' : 'border-white/10 bg-orange-900/5'}`}
                  style={extractionBackgroundImage ? { backgroundImage: `url('${extractionBackgroundImage}')` } : undefined}
                >
                  {extractionBackgroundImage && (
                    <>
                      <div className="absolute inset-0 bg-slate-950/50 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/20 to-slate-950/80 pointer-events-none" />
                    </>
                  )}
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white uppercase tracking-tight leading-none">{translateData(point.name)}</h4>
                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1 tracking-widest">{translateData(point.resourceName)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-orbitron font-bold text-orange-400 leading-none">{formatValue(packs)}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('packs')}</div>
                    </div>
                  </div>

                  {/* Production Status */}
                  <div className="relative z-10 space-y-1 mb-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('collection')}: {Math.floor((progressPercent / 100) * point.productionPerCycle)}/{point.productionPerCycle}</span>
                      <span className="text-[12px] font-orbitron font-bold text-orange-400">{Math.floor(progressPercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                        animate={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {isResearched ? (
                    <div className="relative z-10 space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/20 p-2 rounded-xl border border-white/5 flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{t('pickaxe')}</span>
                          <span className="text-[14px] font-mono text-orange-400">LVL {prodLevel}/6</span>
                        </div>
                        <div className="bg-black/20 p-2 rounded-xl border border-white/5 flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{t('compression')}</span>
                          <span className="text-[14px] font-mono text-orange-400">LVL {compLevel}/10</span>
                        </div>
                      </div>

                      {/* Action Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <PremiumCanvasButton
                          onClick={() => upgradeExtractionProduction(point.id)}
                          disabled={prodLevel >= 6 || qc < picaretaCost}
                          tone={prodLevel >= 6 || qc < picaretaCost ? 'steel' : 'orange'}
                          className="min-h-[64px] p-2"
                          contentClassName={`flex-col gap-1 ${prodLevel >= 6 || qc < picaretaCost ? 'text-slate-500' : 'text-orange-300'}`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{prodLevel >= 6 ? 'MAX' : formatValue(picaretaCost)}</span>
                        </PremiumCanvasButton>

                        <PremiumCanvasButton
                          onClick={() => upgradeExtractionCompression(point.id)}
                          disabled={compLevel >= 10 || qc < compCost}
                          tone={compLevel >= 10 || qc < compCost ? 'steel' : 'indigo'}
                          className="min-h-[64px] p-2"
                          contentClassName={`flex-col gap-1 ${compLevel >= 10 || qc < compCost ? 'text-slate-500' : 'text-indigo-300'}`}
                        >
                          <Zap className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{compLevel >= 10 ? 'MAX' : formatValue(compCost)}</span>
                        </PremiumCanvasButton>

                        <PremiumCanvasButton
                          onClick={() => isAutoSellUnlocked ? toggleExtractionAutoSell(point.id) : buyExtractionAutoSell(point.id)}
                          tone={isAutoSellUnlocked ? (isAutoSell ? 'green' : 'steel') : (qc >= autoSellCost ? 'amber' : 'steel')}
                          className="min-h-[64px] p-2"
                          contentClassName={`flex-col gap-1 ${
                            isAutoSellUnlocked
                              ? (isAutoSell ? 'text-emerald-300' : 'text-slate-400')
                              : (qc >= autoSellCost ? 'text-amber-300' : 'text-slate-500')
                          }`}
                        >
                          <Rocket className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{isAutoSellUnlocked ? (isAutoSell ? 'AUTO ON' : 'AUTO OFF') : formatValue(autoSellCost)}</span>
                        </PremiumCanvasButton>

                        <PremiumCanvasButton
                          onClick={(e) => sellExtractionPointPacks(point.id, e as any)}
                          disabled={packs < 100}
                          tone={packs >= 100 ? 'green' : 'steel'}
                          className="min-h-[64px] p-2"
                          contentClassName={`flex-col gap-1 ${packs >= 100 ? 'text-emerald-300' : 'text-slate-500'}`}
                        >
                          <Coins className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{extractionSaleLabel}</span>
                        </PremiumCanvasButton>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 space-y-3">
                      <PremiumCanvasButton
                        onClick={() => researchPoint(point.id)}
                        disabled={qc < extractionResearchCost || (!!researchingExtractionPoint && researchingExtractionPoint.id !== point.id)}
                        tone={(!!researchingExtractionPoint && researchingExtractionPoint.id === point.id) ? 'amber' : qc >= extractionResearchCost ? 'orange' : 'steel'}
                        className="w-full h-12 text-[14px] font-bold uppercase"
                        contentClassName={`gap-2 ${
                          (!!researchingExtractionPoint && researchingExtractionPoint.id === point.id) ? 'text-yellow-200' :
                          qc >= extractionResearchCost ? 'text-orange-100' : 'text-slate-500'
                        }`}
                      >
                        {(researchingExtractionPoint && researchingExtractionPoint.id === point.id) ? t('researching') : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>{t('researchPoint')}</span>
                            <span className="font-mono text-[11px] opacity-80">{formatValue(extractionResearchCost)} QC</span>
                          </>
                        )}
                      </PremiumCanvasButton>

                      {researchingExtractionPoint && researchingExtractionPoint.id === point.id && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-1.5 flex-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((Date.now() - researchingExtractionPoint.startTime) / (point.researchTime)) * 100)}%` }}
                              />
                            </div>
                            <PremiumCanvasButton
                              onClick={() => boostResearchExtractionPoint(point.id)}
                              tone="amber"
                              className="ml-3 h-9 min-w-[98px] px-2"
                              contentClassName="gap-2 text-yellow-200"
                            >
                              <Zap className="w-3 h-3 animate-pulse" />
                              <span className="text-[10px] font-bold font-mono">
                                {formatValue(extractionBoostCost)} QC
                              </span>
                            </PremiumCanvasButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex items-center justify-center">
              <PremiumCanvasButton
                onClick={() => {
                  playSfx('tec_extract_change');
                  setExtractionPageIndex(extractionPageIndex === 0 ? 1 : 0);
                }}
                tone="orange"
                className="min-h-[132px] max-w-[230px] p-0"
                contentClassName="relative h-full w-full items-center justify-center text-orange-300 overflow-hidden"
                aria-label={extractionPageIndex === 0 ? 'Ver outros pontos' : 'Voltar pontos'}
              >
                <div className="absolute inset-x-8 top-5 h-px bg-gradient-to-r from-transparent via-orange-200/70 to-transparent" />
                <div className="absolute inset-x-10 bottom-5 h-px bg-gradient-to-r from-transparent via-yellow-300/45 to-transparent" />
                <div className="absolute left-8 top-1/2 h-12 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-orange-400/45 to-transparent" />
                <div className="absolute right-8 top-1/2 h-12 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-orange-400/45 to-transparent" />
                <div className="relative flex h-[76px] w-[76px] items-center justify-center">
                  <div className="absolute inset-0 rotate-45 rounded-[14px] border border-orange-300/45 bg-orange-500/10 shadow-[0_0_24px_rgba(249,115,22,0.45)]" />
                  <div className="absolute inset-2 rotate-45 rounded-[10px] border border-yellow-200/35 bg-black/30" />
                  <div className="absolute inset-[-10px] rounded-full bg-orange-500/15 blur-xl" />
                  <div className="absolute h-[2px] w-16 bg-gradient-to-r from-transparent via-orange-200/80 to-transparent" />
                  {extractionPageIndex === 0 ? (
                    <>
                      <ChevronRight className="relative z-10 h-14 w-14 text-yellow-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]" strokeWidth={2.7} />
                      <ChevronRight className="absolute z-0 h-16 w-16 translate-x-2 text-orange-500/35 blur-[1px]" strokeWidth={2.7} />
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="relative z-10 h-14 w-14 text-yellow-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]" strokeWidth={2.7} />
                      <ChevronLeft className="absolute z-0 h-16 w-16 -translate-x-2 text-orange-500/35 blur-[1px]" strokeWidth={2.7} />
                    </>
                  )}
                </div>
              </PremiumCanvasButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
          {TECHNOLOGIES.filter(tech => tech.tier === routeTier).map((tech) => {
            const currentLevel = unlockedTechLevels[routeTier] || 0;
            const isUnlocked = currentLevel >= tech.level;
            const isResearching = researchingTech?.tier === routeTier && researchingTech?.level === tech.level;
            const isNext = tech.level === currentLevel + 1;
            const multipliers = getEconomicMultipliers();
            const cost = tech.cost * multipliers.cost;
            
            const shipForTech = SHIPS.find(s => s.tier === routeTier && s.level === tech.unlocksShipLevel);
            const shipColorClass = shipForTech?.color || 'text-cyan-400';
            const backgroundImage = tech.tier === 'Solar'
              ? SOLAR_TECHNOLOGY_BACKGROUNDS[tech.level]
              : tech.tier === 'Interstellar'
                ? INTERSTELLAR_TECHNOLOGY_BACKGROUNDS[tech.level]
                : undefined;

            return (
              <div
                key={tech.id}
                className={`glass-panel ${getShipNeonBorder(shipColorClass)} rounded-xl p-3 flex flex-col h-full relative overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-300 ${!isUnlocked && !isNext ? 'opacity-30' : 'opacity-100'}`}
                style={backgroundImage ? { backgroundImage: `url('${backgroundImage}')` } : undefined}
              >
                {backgroundImage && (
                  <>
                    <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-transparent to-slate-950/70 pointer-events-none" />
                  </>
                )}
                <div className="relative z-10 flex justify-between items-start mb-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className={`font-orbitron text-[14px] font-bold ${isUnlocked ? shipColorClass : 'text-slate-200'} uppercase tracking-tight`}>
                      {translateData(tech.name)}
                    </h3>
                    <p className="text-base text-slate-400 font-medium leading-tight mt-1 line-clamp-2">
                      {translateData(tech.description)}
                    </p>
                  </div>
                  {isUnlocked ? (
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-emerald-500/20 border-emerald-500/40 text-emerald-400">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : isResearching ? (
                    <PremiumCanvasButton
                      onClick={() => boostResearch()}
                      tone="amber"
                      className="shrink-0 h-8 px-3"
                      contentClassName="gap-2 text-yellow-200"
                    >
                      <Zap className="w-4 h-4 animate-pulse" />
                      <span className="text-[12px] font-bold font-mono">
                        {formatValue(Math.floor(tech.cost * multipliers.cost * 0.75))}
                      </span>
                    </PremiumCanvasButton>
                  ) : (
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-white/5 border-white/10 text-slate-600">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-auto space-y-2">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-slate-400 uppercase tracking-tighter">
                    <Rocket className={`w-3 h-3 ${isUnlocked ? shipColorClass : 'text-slate-600'}`} />
                    <span>{t('unlocksShip')} {tech.unlocksShipLevel}</span>
                  </div>

                  {isNext && !isResearching && (
                    <PremiumCanvasButton
                      onClick={() => buyTech(tech.level)}
                      disabled={qc < cost}
                      tone={qc >= cost ? 'indigo' : 'steel'}
                      className="w-full h-10 text-[14px] font-bold uppercase"
                      contentClassName={qc >= cost ? 'text-indigo-100' : 'text-slate-500'}
                    >
                      {t('research')} ({formatValue(cost)})
                    </PremiumCanvasButton>
                  )}
                  
                  {isResearching && researchingTech && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          className="h-full bg-indigo-500" 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((Date.now() - researchingTech.startTime) / (tech.researchTime * (routeTier === 'Interstellar' ? 0.5 : 1))) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[12px] text-indigo-400 font-mono text-center">PESQUISANDO...</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
});

TechnologyTab.displayName = 'TechnologyTab';

export default TechnologyTab;
