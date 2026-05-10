'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Cpu, Lock, Check, Zap, Rocket, Search, ChevronRight, ChevronLeft, TrendingUp, Coins } from 'lucide-react';
import { TECHNOLOGIES, SHIPS, EXTRACTION_POINTS } from '@/lib/game-data';
import { EXTRACTION_PRODUCTION_COSTS } from '@/lib/game-constants';
import { useDashboard } from './DashboardProvider';

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
  const allTechUnlocked = (unlockedTechLevels[routeTier] || 0) >= 10;
  
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
            <button
              onClick={() => setTechSubTab('ships')}
              className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                techSubTab === 'ships' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t('research')}
            </button>
            <button
              onClick={() => {
                if (allTechUnlocked) setTechSubTab('extraction');
              }}
              className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                techSubTab === 'extraction' ? 'bg-orange-500/20 text-orange-400' : 
                allTechUnlocked ? 'text-white/40 hover:text-white/60' : 'text-white/10 cursor-not-allowed'
              }`}
            >
              {language === 'pt' ? 'Extração' : 'Extraction'}
              {!allTechUnlocked && <Lock className="w-3 h-3 inline ml-1 mb-0.5" />}
            </button>
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

              return (
                <div key={point.id} className={`glass-panel p-4 rounded-2xl border transition-all duration-500 flex flex-col h-full relative overflow-hidden ${isResearched ? 'neon-border-orange bg-orange-500/5' : 'border-white/10 bg-orange-900/5'}`}>
                  <div className="flex justify-between items-start mb-4">
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
                  <div className="space-y-1 mb-4">
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
                    <div className="space-y-4">
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
                        <button
                          onClick={() => upgradeExtractionProduction(point.id)}
                          disabled={prodLevel >= 6 || qc < picaretaCost}
                          className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            prodLevel >= 6 ? 'opacity-40 border-white/5 bg-white/5 text-slate-500' :
                            qc >= picaretaCost ? 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'border-white/5 bg-white/5 text-slate-600'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{prodLevel >= 6 ? 'MAX' : formatValue(picaretaCost)}</span>
                        </button>

                        <button
                          onClick={() => upgradeExtractionCompression(point.id)}
                          disabled={compLevel >= 10 || qc < compCost}
                          className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            compLevel >= 10 ? 'opacity-40 border-white/5 bg-white/5 text-slate-500' :
                            qc >= compCost ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'border-white/5 bg-white/5 text-slate-600'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{compLevel >= 10 ? 'MAX' : formatValue(compCost)}</span>
                        </button>

                        <button
                          onClick={() => isAutoSellUnlocked ? toggleExtractionAutoSell(point.id) : buyExtractionAutoSell(point.id)}
                          className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            isAutoSellUnlocked 
                              ? (isAutoSell ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400' : 'border-white/10 bg-white/5 text-slate-500')
                              : (qc >= autoSellCost ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'border-white/5 bg-white/5 text-slate-600')
                          }`}
                        >
                          <Rocket className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{isAutoSellUnlocked ? (isAutoSell ? 'AUTO ON' : 'AUTO OFF') : formatValue(autoSellCost)}</span>
                        </button>

                        <button
                          onClick={(e) => sellExtractionPointPacks(point.id, e as any)}
                          disabled={packs < 1000}
                          className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            packs >= 1000 ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'border-white/5 bg-white/5 text-slate-700'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{packs >= 1000 ? t('sell') : 'MIN. 1000'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => researchPoint(point.id)}
                        disabled={qc < point.cost || (!!researchingExtractionPoint && researchingExtractionPoint.id !== point.id)}
                        className={`w-full py-3 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                          (!!researchingExtractionPoint && researchingExtractionPoint.id === point.id) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                          qc >= point.cost ? 'bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-slate-600'
                        }`}
                      >
                        {(researchingExtractionPoint && researchingExtractionPoint.id === point.id) ? t('researching') : (
                          <>
                            <Search className="w-4 h-4" />
                            {t('researchPoint')}
                          </>
                        )}
                      </button>

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
                            <button 
                              onClick={() => boostResearchExtractionPoint(point.id)}
                              className="ml-3 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-all"
                            >
                              <Zap className="w-3 h-3 animate-pulse" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setExtractionPageIndex(extractionPageIndex === 0 ? 1 : 0)}
                className="group relative flex flex-col items-center gap-2 p-6 rounded-2xl border border-orange-500/20 bg-orange-900/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative">
                  {extractionPageIndex === 0 ? <ChevronRight className="w-10 h-10 text-orange-400" /> : <ChevronLeft className="w-10 h-10 text-orange-400" />}
                </div>
                <span className="text-base font-orbitron font-bold text-orange-400 uppercase tracking-widest">
                  {extractionPageIndex === 0 ? (language === 'pt' ? 'Ver outros 4 pontos' : 'View other 4 points') : (language === 'pt' ? 'Voltar para os 5 pontos' : 'Back to 5 points')}
                </span>
              </button>
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

            return (
              <div
                key={tech.id}
                className={`glass-panel ${getShipNeonBorder(shipColorClass)} rounded-xl p-3 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${!isUnlocked && !isNext ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="flex justify-between items-start mb-2">
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
                    <button 
                      onClick={() => boostResearch()}
                      className="shrink-0 group relative h-8 px-3 rounded-lg flex items-center justify-center gap-2 border bg-yellow-500/20 border-yellow-500/40 text-yellow-400 overflow-hidden hover:bg-yellow-500/30 transition-all cursor-pointer active:scale-95"
                    >
                      <Zap className="w-4 h-4 animate-pulse" />
                      <span className="text-[12px] font-bold font-mono">
                        {formatValue(Math.floor(tech.cost * multipliers.cost * 0.75))}
                      </span>
                    </button>
                  ) : (
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-white/5 border-white/10 text-slate-600">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-slate-400 uppercase tracking-tighter">
                    <Rocket className={`w-3 h-3 ${isUnlocked ? shipColorClass : 'text-slate-600'}`} />
                    <span>{t('unlocksShip')} {tech.unlocksShipLevel}</span>
                  </div>

                  {isNext && !isResearching && (
                    <button
                      onClick={() => buyTech(tech.level)}
                      disabled={qc < cost}
                      className={`w-full py-2 rounded-lg font-orbitron font-bold text-[14px] transition-all uppercase ${
                        qc >= cost ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white/5 text-slate-600'
                      }`}
                    >
                      {t('research')} ({formatValue(cost)})
                    </button>
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

export default TechnologyTab;
