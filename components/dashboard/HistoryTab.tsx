'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Upload, Target, Activity, TrendingUp, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const HistoryTab = memo(() => {
  const { 
    t, 
    language, 
    economy, 
    missions,
    progression, 
    formatValue, 
    playSfx, 
    exportGameData, 
    importGameData, 
    historyPage, 
    setHistoryPage,
    isRoute2Unlocked,
    isRoute3Unlocked,
    setShowRoute2Goals
  } = useDashboard();

  const { routeTier } = progression;
  const { historyStats } = missions;


  const isInterstellar = routeTier === 'Interstellar';
  const isVoid = routeTier === 'Void';
  const isEarth = routeTier === 'Earth';
  const route4Unlocked = progression.unlockedTechLevels['Void'] >= 10; // Simple check

  return (
    <motion.div 
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 flex-1 flex flex-col h-full"
    >
      {isEarth ? (
        <>
          <div className="glass-panel neon-border-emerald p-4 rounded-xl flex justify-between items-center">
            <div>
              <h2 className="text-lg font-orbitron font-bold text-emerald-400 uppercase tracking-tighter">{t('history')}</h2>
              <p className="text-base text-slate-500 font-mono uppercase tracking-widest">{t('gameStatsByRoute')}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportGameData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-white/5"
              >
                <Download size={12} />
                {t('export')}
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono uppercase tracking-widest transition-all cursor-pointer bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-white/5">
                <Upload size={12} />
                {t('import')}
                <input type="file" className="hidden" accept=".dat" onChange={importGameData} />
              </label>
            </div>
          </div>
          <div className="glass-panel neon-border-emerald bg-emerald-500/5 p-8 rounded-3xl min-h-[600px] flex flex-col items-center justify-center space-y-12 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
              <div className="absolute top-0 left-0 w-full h-full opacity-10 " />
            </div>

            <motion.div 
              className="relative w-64 h-64 z-10"
              animate={{ 
                y: [0, -15, 0],
                rotate: [-1, 1, -1]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-900/40 to-black/60 rounded-[3rem] border-2 border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.2)] overflow-hidden backdrop-blur-md">
                <motion.div 
                  className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-emerald-400/10 to-transparent z-10"
                  animate={{ top: ["-50%", "100%", "-50%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="absolute top-1/3 left-0 right-0 flex justify-around px-12">
                  <motion.div 
                    className="w-8 h-8 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] relative"
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.92, 0.94, 1] }}
                  >
                    <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-90" />
                  </motion.div>
                  <motion.div 
                    className="w-8 h-8 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] relative"
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.92, 0.94, 1] }}
                  >
                    <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-90" />
                  </motion.div>
                </div>
                
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-20 h-10">
                  <svg viewBox="0 0 100 50" className="w-full h-full fill-none stroke-emerald-400 stroke-[6]">
                    <path d="M10,10 Q50,50 90,10" />
                  </svg>
                </div>

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
              </div>

              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-emerald-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    y: [-20, -100], 
                    x: [(i - 2.5) * 40, (i - 2.5) * 60],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    rotate: [0, 45, -45]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity, 
                    delay: i * 0.5 
                  }}
                  style={{ bottom: '20%', left: '50%' }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
            
            <div className="text-center space-y-6 relative z-10">
              <motion.h4 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-emerald-400 uppercase tracking-[0.2em]"
              >
                {language === 'pt' ? 'Obrigado por jogar' : 'Thanks for playing'}
              </motion.h4>
              <div className="flex items-center justify-center gap-6">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-emerald-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50 animate-ping" />
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-emerald-500/50" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : isVoid ? 'neon-border-purple' : 'neon-border-cyan'} p-3 px-5 rounded-2xl flex justify-between items-center shadow-lg border-2`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isInterstellar ? 'bg-orange-500/20 text-orange-400' : isVoid ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'} border border-white/10`}>
                <Activity size={20} />
              </div>
              <div>
                <h2 className={`text-xl font-orbitron font-black ${isInterstellar ? 'text-orange-400' : isVoid ? 'text-purple-400' : 'text-cyan-400'} uppercase tracking-[0.1em]`}>{t('history')}</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] opacity-80">{t('gameStatsByRoute')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isEarth && (
                <button 
                  onClick={() => {
                    setShowRoute2Goals(true);
                    playSfx('open_window');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-bold uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]`}
                >
                  <Target size={14} />
                  {isVoid ? (language === 'pt' ? 'PROJETO TERRA' : 'PROJECT EARTH') : (isInterstellar || routeTier === 'Solar') ? (language === 'pt' ? `METAS ROTA ${isInterstellar ? '2' : '1'}` : `ROUTE ${isInterstellar ? '2' : '1'} GOALS`) : (language === 'pt' ? 'METAS' : 'GOALS')}
                </button>
              )}
              <div className="h-8 w-px bg-white/10 mx-1" />
              <button 
                onClick={exportGameData}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest transition-all ${isInterstellar ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30'} border-2`}
              >
                <Download size={14} />
                {t('export')}
              </button>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest transition-all cursor-pointer ${isInterstellar ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30'} border-2`}>
                <Upload size={14} />
                {t('import')}
                <input type="file" className="hidden" accept=".dat" onChange={importGameData} />
              </label>
            </div>
          </div>

          <div className="relative flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {(() => {
                const tiers = Object.keys(historyStats || {});
                if (tiers.length === 0) return null;
                const tier = tiers[historyPage] || tiers[0];
                const stats = historyStats[tier] || {};
                
                const tierColor = tier === 'Solar' ? 'text-cyan-400' : tier === 'Interstellar' ? 'text-orange-400' : tier === 'Void' ? 'text-purple-400' : 'text-emerald-400';
                const tierBorder = tier === 'Solar' ? 'neon-border-cyan' : tier === 'Interstellar' ? 'neon-border-orange' : tier === 'Void' ? 'neon-border-purple' : 'neon-border-emerald';
                const tierBg = tier === 'Solar' ? 'bg-cyan-500/5' : tier === 'Interstellar' ? 'bg-orange-500/5' : tier === 'Void' ? 'bg-purple-500/5' : 'bg-emerald-500/5';
                const tierLabel = tier === 'Solar' ? t('routes1') : (tier === 'Interstellar' ? t('routes2') : tier === 'Void' ? 'Rota 3' : 'Rota 4');

                return (
                  <motion.div 
                    key={tier}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`glass-panel ${tierBorder} ${tierBg} p-4 rounded-3xl space-y-3 flex-1 flex flex-col border-2 shadow-2xl relative overflow-hidden`}
                  >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner">
                      <button 
                        onClick={() => setHistoryPage(prev => Math.max(0, prev - 1))}
                        disabled={historyPage === 0}
                        className={`p-2 rounded-xl transition-all ${historyPage === 0 ? 'text-slate-800 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">DATA REPOSITORY</span>
                        <h3 className={`font-orbitron text-lg font-black ${tierColor} uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                          {tierLabel}
                        </h3>
                      </div>

                      <button 
                        onClick={() => setHistoryPage(prev => Math.min(tiers.length - 1, prev + 1))}
                        disabled={historyPage === tiers.length - 1 || (historyPage === 0 && !isRoute2Unlocked()) || (historyPage === 1 && !isRoute3Unlocked()) || (historyPage === 2 && !route4Unlocked)}
                        className={`p-2 rounded-xl transition-all ${historyPage === tiers.length - 1 || (historyPage === 0 && !isRoute2Unlocked()) || (historyPage === 1 && !isRoute3Unlocked()) || (historyPage === 2 && !route4Unlocked) ? 'text-slate-800 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>

                    {tier === 'Void' ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12 relative">
                        {/* Glitch Background Elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] pointer-events-none" />
                        
                        <motion.div 
                          className="relative w-72 h-72"
                          animate={{ 
                            y: [0, -20, 0],
                            rotate: [-3, 3, -3],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-black to-black rounded-[3rem] border-4 border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.3)] overflow-hidden backdrop-blur-xl">
                            <img 
                              src="/images/bobby_blue/bobby_blue_sad.png" 
                              alt="Sad Bobby" 
                              className="w-full h-full object-cover opacity-60 mix-blend-lighten scale-110"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0)_50%,rgba(168,85,247,0.15)_50%)] bg-[length:100%_8px] pointer-events-none animate-scan" />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent" />
                          </div>

                          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-purple-500/60 rounded-tl-2xl" />
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-purple-500/60 rounded-br-2xl" />
                        </motion.div>
                        
                        <div className="text-center space-y-6 relative z-10">
                          <div className="flex flex-col items-center">
                            <span className="text-purple-500/50 font-mono text-[10px] tracking-[1em] mb-2 uppercase">System Error 404</span>
                            <motion.h4 
                              className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-400 uppercase tracking-[0.3em] italic drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {t('dataLostInTime')}
                            </motion.h4>
                          </div>
                          <div className="flex items-center justify-center gap-6">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                            <div className="w-3 h-3 rounded-full bg-purple-500/50 animate-ping" />
                            <div className="h-px w-24 bg-gradient-to-l from-transparent via-purple-500/50 to-transparent" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
                        <div className="space-y-3 flex-1 flex flex-col min-h-0">
                          <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              {t('totalDeliveriesBattlesMining')}
                            </h4>
                            <div className="space-y-2 bg-black/40 p-4 rounded-[1.5rem] border-2 border-white/5 flex-1 shadow-inner relative overflow-hidden group min-h-0">
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors" />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('randomBattlesFound')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.randomBattlesFound || 0)}</span>
                                </div>
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('radarBattlesFound')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.radarBattlesFound || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('manualDeliveries')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.manualDeliveries || 0)}</span>
                                </div>
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('autoDeliveries')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue(stats.autoDeliveries || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('totalMiningPacksSold')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue((stats.manualMiningPacksSold || 0) + (stats.autoMiningPacksSold || 0))}</span>
                                </div>
                                <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold truncate">{t('totalExplorationMiningPacksSold')}</span>
                                  <span className="font-orbitron font-black text-xl text-white">{formatValue((stats.manualExtractionPacksSold || 0) + (stats.autoExtractionPacksSold || 0))}</span>
                                </div>
                              </div>
                              
                              <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-slate-300 uppercase font-orbitron text-[10px] font-bold truncate">{t('missionsCompleted')}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (stats.missionsCompleted || 0) / 5)}%` }} />
                                  </div>
                                  <span className="font-orbitron font-black text-2xl text-emerald-400">{formatValue(stats.missionsCompleted || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 flex flex-col min-h-0">
                          <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                <TrendingUp className="w-4 h-4 text-cyan-400" />
                              </div>
                              {t('totalQCAcquired')}
                            </h4>
                            <div className="space-y-2 bg-black/40 p-4 rounded-[1.5rem] border-2 border-white/5 flex-1 shadow-inner relative group min-h-0">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/20 group-hover:bg-cyan-500/40 transition-colors" />
                              
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromDeliveries')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromDeliveries || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromMining')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromMining || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromExplorationMining')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromExtraction || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromMissions')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue((stats.qcFromMissions || 0) + (stats.qcFromTutorial || 0))}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">{t('fromAllBattles')}</span>
                                  <span className="font-mono text-emerald-400 font-black text-lg">+{formatValue(stats.qcFromBattles || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="mt-auto pt-3 border-t-2 border-white/10 flex flex-col gap-1">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em] text-center font-bold">NET ACQUISITION</span>
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                  <span className="text-xs font-black text-white uppercase font-orbitron">{t('totalQCAcquired')}</span>
                                  <span className={`text-xl font-orbitron font-black ${tierColor} drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]`}>{formatValue(stats.qcTotalAcquired || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                                <LogOut className="w-4 h-4 text-pink-400 rotate-90" />
                              </div>
                              {t('totalQCSpent')}
                            </h4>
                            <div className="bg-pink-500/5 p-4 rounded-[1.5rem] border-2 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.05)] flex flex-col gap-2 relative group overflow-hidden">
                              <div className="flex justify-between items-center relative z-10">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">{t('fromAllSources')}</span>
                                  <span className="text-[8px] text-pink-400/50 uppercase font-mono">EXPENDITURE</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-2xl font-orbitron font-black text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                                    {formatValue(Math.abs(stats.qcSpent || 0))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
});

export default HistoryTab;
