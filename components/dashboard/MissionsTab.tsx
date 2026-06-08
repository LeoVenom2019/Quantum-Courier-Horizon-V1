'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, Cpu } from 'lucide-react';
import { Mission } from '@/lib/game-state/types';
import { useDashboard } from './DashboardProvider';

const MissionsTab = memo(() => {
  const { 
    missions: missionsState,
    progression,
    economy,
    t,
    language,
    formatValue,
    playSfx,
    addLog,
    updateHistoryStats,
    getMissionUpgradeCost,
    claimMission,
    showSkillMap,
    setShowSkillMap,
    missionRewardLevel,
    setMissionRewardLevel,
    radarUnlocked,
    setRadarUnlocked,
    autoClaimMissions,
    setAutoClaimMissions,
    dispatch
  } = useDashboard();

  const { missions } = missionsState;
  const { routeTier } = progression;
  const { qc } = economy;

  const isInterstellar = routeTier === 'Interstellar';
  const readyToClaimCount = missions.filter(m => m.completed && !m.claimed).length;

  const getRarityStyles = (rarity: Mission['rarity'], completed: boolean) => {
    if (completed) return isInterstellar ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
    
    switch (rarity) {
      case 'rare': return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
      case 'legendary': return 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
      case 'mythic': return 'border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.7)] animate-pulse';
      case 'alien': return 'border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.8)] animate-pulse';
      default: return 'border-white/20';
    }
  };

  const getRarityLabel = (rarity: Mission['rarity']) => {
    const isSolar = routeTier === 'Solar';
    switch (rarity) {
      case 'rare': return { label: t('rare'), color: 'text-blue-400', mult: '10x' };
      case 'legendary': return { label: t('legendary'), color: 'text-orange-400', mult: isSolar ? '25x' : '50x' };
      case 'mythic': return { label: t('mythic'), color: 'text-slate-300', mult: isSolar ? '35x' : '150x' };
      case 'alien': return { label: t('alien'), color: 'text-green-400', mult: isSolar ? '50x' : '150x' };
      default: return { label: t('common'), color: 'text-slate-400', mult: '1x' };
    }
  };

  return (
    <div className="space-y-3 lg:space-y-3 flex flex-col h-full min-h-0 overflow-hidden">
      <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} p-3 lg:py-4 lg:px-8 rounded-xl flex flex-row justify-between items-center gap-4 shrink-0 overflow-hidden relative`}>
        <div 
          className="absolute inset-0 z-0 opacity-60 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url('/assets/melhorias/${isInterstellar ? 'bg_rota2_missoes_header.webp' : 'bg_rota1_missoes_header.webp'}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="flex-1 relative z-10">
          <h2 className={`text-lg lg:text-2xl font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} uppercase tracking-tight`}>{t('missions')}</h2>
          <p className="text-base lg:text-[14px] text-slate-500 font-mono uppercase tracking-[0.2em]">
            {readyToClaimCount > 0 ? `${readyToClaimCount} ${t('readyToUnlock' as any)}` : t('gameStatsByRoute')}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              setShowSkillMap(true);
              playSfx('open_window');
            }}
            className="px-4 py-2 lg:py-3 lg:px-6 rounded-lg font-orbitron text-base tracking-widest transition-all uppercase flex flex-col items-center justify-center h-[64px] lg:h-[72px] w-[180px] lg:w-[220px] leading-snug bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            <span className="font-black text-[14px] lg:text-base">{t('skillMap')}</span>
            <span className="opacity-70 font-mono text-[14px] lg:text-[15px]">{t('upgradesCaps')}</span>
          </button>

          <button
            onClick={() => {
              if (missionRewardLevel[routeTier] < 10) {
                const cost = getMissionUpgradeCost(missionRewardLevel[routeTier], routeTier);
                if (qc >= cost) {
                  dispatch({ type: 'SPEND_QC', payload: { amount: cost } });
                  updateHistoryStats('spent', cost, routeTier);
                  setMissionRewardLevel((prev: any) => ({ ...prev, [routeTier]: prev[routeTier] + 1 }));
                  playSfx('level_up');
                  addLog(`${t('missionBaseValueIncreased')} ${missionRewardLevel[routeTier] + 1}!`, 'success');
                } else {
                  addLog(`${t('insufficientQC')}`, 'error');
                }
              }
            }}
            disabled={missionRewardLevel[routeTier] >= 10}
            className={`px-4 py-2 lg:py-3 lg:px-6 rounded-lg font-orbitron text-base tracking-widest transition-all uppercase flex flex-col items-center justify-center h-[64px] lg:h-[72px] leading-snug ${
              missionRewardLevel[routeTier] >= 10 
                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10' 
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
            }`}
          >
            <span className="font-black text-[14px] lg:text-base">{t('upgrade')}</span>
            <div className="flex flex-col items-center">
              <span className="opacity-70 font-mono text-[14px] lg:text-[15px]">LVL {missionRewardLevel[routeTier]}/10</span>
              {missionRewardLevel[routeTier] < 10 && (
                <span className="text-[14px] text-yellow-500 font-bold mt-0.5">
                  {formatValue(getMissionUpgradeCost(missionRewardLevel[routeTier], routeTier))} QC
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => {
              if (!radarUnlocked[routeTier]) {
                const unlockCost = isInterstellar ? 1000000 : 500000;
                if (qc >= unlockCost) {
                  dispatch({ type: 'SPEND_QC', payload: { amount: unlockCost } });
                  updateHistoryStats('spent', unlockCost, routeTier);
                  setRadarUnlocked((prev: any) => ({ ...prev, [routeTier]: true }));
                  setAutoClaimMissions(!autoClaimMissions);
                  playSfx('cash');
                  addLog(t('missionRadarUnlocked'), 'success');
                } else {
                  playSfx('error');
                  addLog(`${t('insufficientQCForRadar')} (${formatValue(unlockCost)} ${t('required')})`, 'error');
                }
                return;
              }
              
              setAutoClaimMissions(!autoClaimMissions);
              playSfx(autoClaimMissions ? 'close_window' : 'ask_window');
              if (!autoClaimMissions) {
                addLog(t('autoClaimMissionsActivated'), 'success');
              } else {
                addLog(t('autoClaimMissionsDeactivated'), 'info');
              }
            }}
            className={`px-4 py-2 lg:py-3 lg:px-6 rounded-lg text-base lg:text-[14px] font-bold font-orbitron transition-all flex items-center justify-center h-[64px] lg:h-[72px] w-[180px] lg:w-[220px] gap-2 ${
              !radarUnlocked[routeTier]
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20'
                : autoClaimMissions 
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
                  : (readyToClaimCount > 0 ? 'bg-green-500 text-black animate-pulse' : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/10')
            }`}
          >
            {!radarUnlocked[routeTier] ? (
              <>
                <Target className="w-4 h-4" />
                <div className="flex flex-col items-start leading-none">
                  <span>{t('buyRadar')}</span>
                  <span className="text-[14px] text-amber-500/70 font-mono mt-0.5">{formatValue(isInterstellar ? 1000000 : 500000)} QC</span>
                </div>
              </>
            ) : autoClaimMissions ? (
              <>
                <Cpu className="w-4 h-4 animate-spin-slow" />
                <span>RADAR ON</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-slate-500 rounded-full" />
                <span>{t('autoClaim')} {readyToClaimCount > 0 ? `(${readyToClaimCount})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="glass-panel border-white/5 p-12 rounded-2xl text-center">
          <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
          <p className="text-slate-500 font-mono text-base uppercase tracking-widest">{t('noMissions')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-2 flex-1 overflow-y-auto custom-scrollbar">
          {missions.map((mission, index) => {
            const rarityInfo = getRarityLabel(mission.rarity);
            
            const bgMap: Record<string, string> = {
              'common': '/assets/texturas/bg_card_comum.webp',
              'rare': '/assets/texturas/bg_card_rara.webp',
              'legendary': '/assets/texturas/bg_card_lendaria.webp',
              'mythic': '/assets/texturas/bg_card_mitica.webp',
              'alien': '/assets/texturas/bg_card_alien.webp'
            };
            const bgImage = bgMap[mission.rarity];

            return (
              <motion.div
                key={mission.id || `mission-${index}`}
                id={`mission-${mission.id}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className={`glass-panel rounded-xl p-3 lg:p-4 flex flex-col justify-between transition-all relative border-2 h-full overflow-hidden ${
                  mission.claimed 
                    ? 'opacity-40 grayscale border-white/5' 
                    : getRarityStyles(mission.rarity, mission.completed)
                }`}
              >
                {bgImage && (
                  <div 
                    className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none transition-opacity hover:opacity-60"
                    style={{ 
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
                
                {mission.completed && !mission.claimed && (
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${isInterstellar ? 'from-orange-500/20' : 'from-cyan-500/20'} to-transparent pointer-events-none z-10`} />
                )}
                
                <div className="relative z-10 flex justify-between items-start mb-1">
                  <div className="flex flex-col gap-1.5">
                    <div className={`p-2 w-fit rounded-lg ${mission.completed ? (isInterstellar ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400') : 'bg-white/5 text-slate-500'}`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-orbitron font-black tracking-widest ${rarityInfo.color}`}>
                      {rarityInfo.label} ({rarityInfo.mult})
                    </span>
                  </div>
                  {mission.completed && !mission.claimed && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-[10px] font-orbitron font-bold text-green-400 border border-green-400/30 px-2 py-0.5 rounded uppercase"
                    >
                      {t('completed')}
                    </motion.div>
                  )}
                </div>

                <div className="relative z-10 flex-1 mb-4">
                  <h3 className="text-white font-orbitron font-bold text-sm lg:text-base leading-tight mb-1">{mission.title}</h3>
                  <p className="text-slate-400 text-[14px] lg:text-[14px] leading-snug line-clamp-2">{mission.description}</p>
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between text-[14px] font-mono mb-1">
                    <span className="text-slate-500 uppercase tracking-wider">{t('status')}</span>
                    <span className="text-white">{mission.current} / {mission.target}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(mission.current / mission.target) * 100}%` }}
                      className={`h-full ${mission.completed ? (isInterstellar ? 'bg-orange-500' : 'bg-cyan-500') : 'bg-indigo-500/50'}`}
                    />
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">{t('reward')}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-orbitron font-bold text-base">{formatValue(mission.reward)}</span>
                        <span className="text-emerald-400/50 font-orbitron font-bold text-base">QC</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => claimMission(mission.id, e)}
                      disabled={!mission.completed || mission.claimed}
                      className={`px-4 py-2 rounded-lg font-orbitron text-base font-bold transition-all uppercase ${
                        mission.claimed
                          ? 'bg-white/5 text-slate-600 border border-white/10'
                          : mission.completed
                            ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                            : 'bg-white/5 text-slate-500 border border-white/10 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {mission.claimed ? t('claimed') : t('claim')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default MissionsTab;
