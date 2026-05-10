'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Radar, Sword, Crosshair, Trophy, Database, X, Skull, Shield, Zap, Target, ArrowUpCircle, Bot, TrendingUp, Star } from 'lucide-react';
import VoidBattleArena from '../../VoidBattleArena';
import { useDashboard } from '../DashboardProvider';

interface VoidBattleTabProps {
  isVoid: boolean;
  isRobotRepaired: boolean;
  setShowBattleShipUpgradeModal: (show: boolean) => void;
  setShowRobotModal: (show: boolean) => void;
  isVoidWarActive: boolean;
  voidWarAlertActive: boolean;
  setHasWonEliminateEnemiesRoute3: (won: boolean) => void;
  setVoidWarAlertActive: (active: boolean) => void;
  setIsShaking: (shake: boolean) => void;
  setIsFlashingRed: (flash: boolean) => void;
  setVoidWarRobotSpeaking: (speaking: boolean) => void;
  setShowRoute3Ending: (show: boolean) => void;
  setVoidAircraftAutoToggles: (toggles: any) => void;
  setVoidWarProgress: (progress: any | ((p: any) => any)) => void;
  voidWarProgress: any;
  setShowVoidWarMap: (show: boolean) => void;
}

const VoidBattleTab = memo(({
  isVoid,
  isRobotRepaired,
  setShowBattleShipUpgradeModal,
  setShowRobotModal,
  isVoidWarActive,
  voidWarAlertActive,
  setHasWonEliminateEnemiesRoute3,
  setVoidWarAlertActive,
  setIsShaking,
  setIsFlashingRed,
  setVoidWarRobotSpeaking,
  setShowRoute3Ending,
  setVoidAircraftAutoToggles,
  setVoidWarProgress,
  voidWarProgress,
  setShowVoidWarMap
}: VoidBattleTabProps) => {
  const {
    progression,
    economy,
    dispatch,
    t,
    language,
    formatValue,
    playSfx,
    stopSfx,
    addLog,
    combat,
    voidBattleStatus,
    setVoidBattleStatus,
    voidBattleShipStats,
    setVoidBattleShipStats,
    voidBattleOptions,
    activeVoidBattle,
    voidBattleResult,
    setVoidBattleResult,
    getEffectiveVoidStats,
    selectVoidBattle,
    startVoidBattle,
    repairVoidBattleShip,
    upgradeVoidBattleShip,
    upgradeVoidBattleShipRarity
  } = useDashboard();

  const handleUpdateResources = (newResources: any) => {
    // Calculate deltas and dispatch
    const deltas: any = {};
    if (newResources.energy !== combat.voidResources.energy) deltas.energy = combat.voidResources.energy - newResources.energy;
    if (newResources.tech !== combat.voidResources.tech) deltas.tech = combat.voidResources.tech - newResources.tech;
    if (newResources.minerals !== combat.voidResources.minerals) deltas.minerals = combat.voidResources.minerals - newResources.minerals;
    
    if (Object.keys(deltas).length > 0) {
      dispatch({ type: 'SPEND_VOID_RESOURCES', payload: deltas });
    }
  };

  const { qc } = economy;
  const { routeTier, battleShipUpgradeLevel, battleLevel } = progression;
  const stats = voidBattleShipStats;
  
  const effectiveStats = getEffectiveVoidStats(voidBattleShipStats);

  const hpPercent = (stats.hp / effectiveStats.maxHp) * 100;
  const shieldPercent = (stats.shield / effectiveStats.maxShield) * 100;

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return {
          container: "bg-gradient-to-br from-blue-600/20 via-black/60 to-black border-blue-500/40",
          sword: "text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]",
          swordContainer: "border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.3)]",
          badge: "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]",
          text: "text-blue-100",
          subtext: "text-blue-400/60"
        };
      case 'elite':
        return {
          container: "bg-gradient-to-br from-purple-600/20 via-black/60 to-black border-purple-500/40",
          sword: "text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,1)]",
          swordContainer: "border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.4)]",
          badge: "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]",
          text: "text-purple-100",
          subtext: "text-purple-400/60"
        };
      case 'legendary':
        return {
          container: "bg-gradient-to-br from-orange-600/30 via-black/60 to-black border-orange-500/50",
          sword: "text-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,1)]",
          swordContainer: "border-orange-500/40 shadow-[0_0_60px_rgba(249,115,22,0.5)]",
          badge: "bg-orange-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.7)]",
          text: "text-orange-100",
          subtext: "text-orange-400/60"
        };
      case 'mythic':
        return {
          container: "bg-black border-slate-400/50 shadow-[inset_0_0_100px_rgba(255,0,0,0.3)]",
          sword: "text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]",
          swordContainer: "border-slate-400/40 shadow-[0_0_80px_rgba(255,0,0,0.5)]",
          badge: "bg-gradient-to-r from-red-600 via-slate-400 to-red-600 text-black font-black shadow-[0_0_30px_rgba(255,255,255,0.5)]",
          text: "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]",
          subtext: "text-red-500 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
        };
      default:
        return {
          container: "bg-gradient-to-br from-red-500/10 via-black/60 to-black border-red-500/30",
          sword: "text-red-500",
          swordContainer: "border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]",
          badge: "bg-red-500 text-black",
          text: "text-white",
          subtext: "text-red-400/60"
        };
    }
  };

  const rStyle = getRarityStyle(stats.rarity);

  if (voidBattleStatus === 'searching') {
    return (
      <div className="h-[450px] lg:h-[400px] glass-panel border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-6 bg-black/60">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-red-500/20 flex items-center justify-center animate-spin-slow">
            <Radar className="w-12 h-12 text-red-500" />
          </div>
          <div className="absolute inset-0 border-4 border-red-500/40 rounded-full animate-ping" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-orbitron font-black text-white tracking-widest uppercase">{t('scanningVoid')}</h3>
          <p className="text-base text-red-400/60 font-mono uppercase tracking-[0.2em] animate-pulse">{t('searchingEnemySignatures')}</p>
        </div>
      </div>
    );
  }

  if (voidBattleStatus === 'choosing') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-orbitron font-black text-white tracking-widest uppercase">{t('targetsDetected')}</h3>
          <button 
            onClick={() => setVoidBattleStatus('idle')}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[15px] font-orbitron text-white/60 hover:text-white transition-all uppercase tracking-widest"
          >
            {t('cancelSearch')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {voidBattleOptions.map(enemy => (
            <div key={enemy.id} className="glass-panel border border-white/10 rounded-2xl p-4 space-y-5 bg-gradient-to-br from-red-500/5 via-black to-black hover:border-red-500/40 transition-all group overflow-hidden relative">
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20 shrink-0 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-red-500/30 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src={enemy.image} 
                    alt={enemy.type}
                    className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-md text-[9px] font-orbitron font-black tracking-[0.2em] uppercase shadow-lg ${
                      enemy.type === 'Boss' ? 'bg-red-500 text-black' : enemy.type === 'Elite' ? 'bg-orange-500 text-black' : 'bg-white/10 text-white border border-white/10'
                    }`}>
                      {enemy.type}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] text-white/40 uppercase tracking-widest leading-none mb-1">{t('qcInPossession')}</p>
                    <p className="text-lg font-orbitron font-black text-yellow-400 leading-none">{formatValue(enemy.qc)} <span className="text-[10px] text-yellow-400/60 ml-0.5">QC</span></p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-white/5">
                 <div className="space-y-1.5">
                   <div className="flex justify-between text-[13px] font-orbitron font-bold leading-none">
                     <span className="text-white/30 uppercase tracking-tighter">Escudo</span>
                     <span className="text-cyan-400">{formatValue(enemy.maxShield)}</span>
                   </div>
                   <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-1.5">
                   <div className="flex justify-between text-[13px] font-orbitron font-bold leading-none">
                     <span className="text-white/30 uppercase tracking-tighter">Integridade</span>
                     <span className="text-red-400">{formatValue(enemy.maxHp)}</span>
                   </div>
                   <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                     />
                   </div>
                 </div>
              </div>

              <button 
                onClick={() => selectVoidBattle(enemy)}
                className="w-full py-3 bg-red-600 text-white font-orbitron font-black text-base rounded-xl hover:bg-red-500 transition-all uppercase tracking-[0.2em] shadow-[0_4px_15px_rgba(239,68,68,0.3)] group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Sword className="w-4 h-4" />
                {t('attackTarget')}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (voidBattleStatus === 'fighting' && activeVoidBattle) {
    const effectiveStats = getEffectiveVoidStats(voidBattleShipStats);
    return (
      <VoidBattleArena 
        initialEnemies={activeVoidBattle.enemies}
        playerShipStats={effectiveStats}
        voidResources={combat.voidResources}
        routeTier={routeTier}
        locationId={activeVoidBattle.locationId ?? 0}
        activeShipImage={battleLevel >= 25 ? '/images/battle/skyring.png' : '/images/battle/standard_ship.png'}
        onBattleEnd={(status, result) => {
           setVoidBattleShipStats((prev: any) => ({
             ...prev,
             hp: result?.playerHp ?? prev.hp,
             shield: result?.playerShield ?? prev.shield
           }));

           if (status === 'won') {
             setVoidBattleStatus('won');
             playSfx('bobby_blue_theme_victory');
             
             if (voidWarAlertActive) {
               setHasWonEliminateEnemiesRoute3(true);
               setVoidWarAlertActive(false);
               setIsShaking(false);
               setIsFlashingRed(false);
               setVoidWarRobotSpeaking(false);
               addLog(language === 'pt' ? 'Inimigos eliminados! A estrutura está segura.' : 'Enemies eliminated! The structure is safe.', 'success');
             }

             if (isVoidWarActive) {
               if (voidWarProgress.currentSector === 8 && voidWarProgress.currentBattle === 4) {
                 setShowRoute3Ending(true);
                 setVoidAircraftAutoToggles({ 'va-1': false, 'va-2': false, 'va-3': false });
               } else {
                 setVoidWarProgress((prev: any) => {
                   let nextBattle = prev.currentBattle + 1;
                   let nextSector = prev.currentSector;
                   if (nextBattle >= 5) { nextBattle = 0; nextSector = Math.min(8, nextSector + 1); }
                   return { currentSector: nextSector, currentBattle: nextBattle };
                 });
               }
             }
             
             const rarityQCBonus = { common: 1, rare: 1.3, elite: 1.4, legendary: 1.5, mythic: 1.6 }[voidBattleShipStats.rarity as 'common' | 'rare' | 'elite' | 'legendary' | 'mythic'] || 1;
             const finalReward = Math.floor((result?.reward || 0) * voidBattleShipStats.lootEfficiency * rarityQCBonus);
             const xpReward = Math.floor(finalReward * 0.05) + 10;
             const aetherionReward = Math.floor(finalReward * 0.01) + 2;

             setVoidBattleResult({ 
               reward: finalReward,
               xp: xpReward,
               aetherion: aetherionReward,
               destroyedMeteors: result?.destroyedMeteors || 0,
               destroyedMeteorites: result?.destroyedMeteorites || 0
             });

             dispatch({ type: 'EARN_QC', payload: { amount: finalReward, source: 'battle' } });
             dispatch({ type: 'ADD_SHIP_XP', payload: { amount: xpReward } });
             dispatch({ type: 'EARN_AETHERION', payload: { amount: aetherionReward } });

             addLog(`${t('victoryCaps')}! +${formatValue(finalReward)} QC, +${xpReward} XP, +${aetherionReward} Etérion.`, 'success');
             playSfx('success');
           } else {
             setVoidBattleStatus('lost');
             addLog(t('defeatShipDamaged'), 'error');
             playSfx('error');
           }
        }}
        onUpdateResources={handleUpdateResources}
        playSfx={playSfx as any}
        stopSfx={stopSfx as any}
        t={t as any}
        language={language}
        addLog={addLog as any}
        formatValue={formatValue as any}
        isGroupBattle={activeVoidBattle.isGroupBattle || false}
        enemyQueue={activeVoidBattle.enemyQueue}
      />
    );
  }

  if (voidBattleStatus === 'won') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] animate-float" />
        </div>

        <div className="relative w-full max-w-5xl glass-panel border-2 border-emerald-500/40 rounded-[2.5rem] p-8 lg:p-12 flex flex-col items-center gap-8 lg:gap-10 bg-gradient-to-br from-emerald-500/10 via-black/90 to-cyan-500/10 shadow-[0_0_100px_rgba(16,185,129,0.2)] overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-60 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
          />

          <button 
            onClick={() => {
              setVoidBattleStatus('idle');
              stopSfx('bobby_blue_theme_victory');
            }}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all z-30"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center space-y-2">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl lg:text-8xl font-orbitron font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-400 to-emerald-600 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] uppercase">
                {t('victory')}
              </h2>
              <p className="text-base lg:text-xl text-emerald-400/60 font-mono uppercase tracking-[0.5em] mt-2">
                {language === 'pt' ? 'Setor Neutralizado • Ameaça Eliminada' : 'Sector Neutralized • Threat Eliminated'}
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 w-full">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full lg:w-1/2 aspect-square glass-panel border-2 border-white/10 rounded-[2rem] relative overflow-hidden bg-black shadow-2xl group"
            >
              <video 
                src="/videos/bobby_blue/bobby_blue_victory.webm"
                autoPlay 
                loop 
                muted 
                playsInline
                poster="/images/bobby_blue/bobby_blue_victory_poster.png"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">BOBBY_LIVE_CAM • LIVE</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-xs text-emerald-400 font-orbitron font-bold tracking-widest block">{language === 'pt' ? 'NOSSO MASCOTE' : 'OUR MASCOT'}</span>
                  <span className="text-xl lg:text-2xl text-white font-black font-orbitron uppercase">Bobby Blue Dance</span>
                </div>
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
                  <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full lg:w-1/2 space-y-8"
            >
              <div className="glass-panel border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6 bg-white/5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center">
                    <Database className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">QC</span>
                    <div className="text-xl font-orbitron font-black text-white">
                      +{formatValue(voidBattleResult?.reward || 0)}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center">
                    <Star className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">XP</span>
                    <div className="text-xl font-orbitron font-black text-white">
                      +{voidBattleResult?.xp || 0}
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex flex-col items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-400 mb-1" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Etérion</span>
                    <div className="text-xl font-orbitron font-black text-white">
                      +{voidBattleResult?.aetherion || 0}
                    </div>
                  </div>
                </div>

                {(voidBattleResult?.destroyedMeteors > 0 || voidBattleResult?.destroyedMeteorites > 0) && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Meteoritos Destruídos' : 'Meteorites Destroyed'}</span>
                      <div className="text-xl font-orbitron text-orange-400">
                        {voidBattleResult?.destroyedMeteorites || 0}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Meteoros Destruídos' : 'Meteors Destroyed'}</span>
                      <div className="text-xl font-orbitron text-red-500">
                        {voidBattleResult?.destroyedMeteors || 0}
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Integridade da Nave' : 'Ship Integrity'}</span>
                    <div className="text-lg lg:text-xl font-orbitron text-emerald-400">100%</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Status da Defesa' : 'Defense Status'}</span>
                    <div className="text-lg lg:text-xl font-orbitron text-emerald-400 font-bold uppercase">{language === 'pt' ? 'Sucesso' : 'Success'}</div>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setVoidBattleStatus('idle');
                  stopSfx('bobby_blue_theme_victory');
                }}
                className="w-full py-5 lg:py-6 bg-white text-black font-orbitron font-black text-lg lg:text-xl rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all uppercase tracking-[0.3em]"
              >
                {t('backToRadar')}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (voidBattleStatus === 'lost') {
    return (
      <div className="h-[450px] lg:h-[400px] glass-panel border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-6 bg-black/60">
         <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 bg-red-500/10 border-red-500/40 text-red-400">
           <Skull className="w-10 h-10" />
         </div>
         <div className="text-center space-y-2">
           <h3 className="text-3xl font-orbitron font-black tracking-[0.2em] uppercase text-red-400">
             {t('defeat')}
           </h3>
         </div>
         <button 
           onClick={() => setVoidBattleStatus('idle')}
           className="px-12 py-4 bg-white/10 border border-white/20 rounded-xl text-base font-orbitron font-bold text-white hover:bg-white/20 transition-all uppercase tracking-widest"
         >
           {t('backToRadar')}
         </button>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col lg:flex-row gap-6 items-stretch overflow-hidden relative ${stats.rarity === 'mythic' ? 'bg-black' : ''}`}>
      {stats.rarity === 'mythic' && (
        <motion.div
          animate={{
            background: [
              "linear-gradient(45deg, #000000, #400000, #202020, #000000)",
              "linear-gradient(45deg, #000000, #202020, #400000, #000000)",
              "linear-gradient(45deg, #000000, #400000, #202020, #000000)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-40 pointer-events-none"
        />
      )}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/4 aspect-square glass-panel border-2 border-red-500/30 rounded-[2rem] relative overflow-hidden bg-black shadow-[0_0_50px_rgba(239,68,68,0.15)] group"
      >
        <video 
          src="/videos/bobby_blue/void_battle_preview.webm"
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-red-500/10" />
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-[10px] font-mono text-red-500/80 tracking-widest uppercase">BATTLE_STATE • LIVE</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className={`font-orbitron font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border transition-all duration-700 ${rStyle.badge}`}>
            {t('battleReady')}
          </div>
        </div>

        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/40 rounded-tl-[2rem]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/40 rounded-tr-[2rem]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/40 rounded-bl-[2rem]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/40 rounded-br-[2rem]" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-3/4 flex flex-col gap-4 overflow-hidden"
      >
        <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-4 bg-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl lg:text-3xl font-orbitron font-black tracking-widest uppercase transition-all duration-700 ${
                  stats.rarity === 'rare' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' :
                  stats.rarity === 'elite' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                  stats.rarity === 'legendary' ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                  stats.rarity === 'mythic' ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' :
                  'text-white'
                }`}>
                  {stats.rarity === 'mythic' ? 'ECLIPSE' : t('battleShip')} {
                    stats.rarity === 'rare' ? '(Rara)' :
                    stats.rarity === 'elite' ? '(Épica)' :
                    stats.rarity === 'legendary' ? '(Lendária)' :
                    stats.rarity === 'mythic' ? '(Mítica)' :
                    '(Comum)'
                  }
                </h2>
                
                {isVoid && isRobotRepaired && (
                  <button
                    onClick={() => {
                      setShowBattleShipUpgradeModal(true);
                      playSfx('ask_window');
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all group shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  >
                    <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">{t('upgradeBattleShip')}</span>
                  </button>
                )}

                {stats.upgrades.damage >= 5 && stats.upgrades.shield >= 5 && stats.upgrades.crit >= 5 && stats.upgrades.loot >= 5 && stats.rarity !== 'mythic' && (
                  <button
                    onClick={upgradeVoidBattleShipRarity}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-all group shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  >
                    <ArrowUpCircle className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[9px] font-orbitron font-black uppercase tracking-wider">UPGRADE RARITY</span>
                      <span className="text-[8px] font-mono opacity-60">
                        {stats.rarity === 'common' ? '5k T/E' : stats.rarity === 'rare' ? '10k T/E' : stats.rarity === 'elite' ? '15k T/E' : '20k T/E'}
                      </span>
                    </div>
                  </button>
                )}
              </div>
              <p className={`text-xs font-mono uppercase tracking-[0.3em] transition-all duration-700 opacity-60 ${rStyle.subtext}`}>{t('sovereignOfVoid')} • CLASSE DREADNOUGHT</p>
            </div>

            <div className="flex gap-8 text-right">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{t('quantumShield')}</span>
                <div className={`text-lg font-orbitron font-bold transition-all duration-700 ${stats.rarity === 'mythic' ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-cyan-400'}`}>
                  {(stats.shield || 0).toFixed(0)} <span className="text-xs opacity-50">/ {(effectiveStats.maxShield || 1000).toFixed(0)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{t('hullIntegrity')}</span>
                <div className={`text-lg font-orbitron font-bold transition-all duration-700 ${
                  hpPercent > 50 ? 'text-emerald-400' : hpPercent > 20 ? 'text-yellow-400' : 'text-red-500'
                }`}>
                  {(stats.hp || 0).toFixed(0)} <span className="text-xs opacity-50">/ {effectiveStats.maxHp.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {(voidWarAlertActive) && !isRobotRepaired && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowRobotModal(true)}
              className="w-full py-3 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center gap-4 group hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.1)]"
            >
              <div className="relative">
                <Bot className="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-yellow-400 font-orbitron text-xs font-black tracking-[0.2em] uppercase">{t('defectiveRobot')}</span>
                <span className="text-[9px] text-yellow-400/60 font-mono uppercase tracking-widest">{language === 'pt' ? 'REPARO DE EMERGÊNCIA DISPONÍVEL' : 'EMERGENCY REPAIR AVAILABLE'}</span>
              </div>
              <div className="ml-auto px-4 py-1 bg-yellow-500 text-black font-orbitron font-black text-[10px] rounded-lg tracking-widest group-hover:scale-105 transition-transform">
                FIX NOW
              </div>
            </motion.button>
          )}

          <div className="space-y-2 relative">
            <div className="h-2.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${shieldPercent}%` }}
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              />
            </div>
            <div className="h-2.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${hpPercent}%` }}
                className={`h-full bg-gradient-to-r ${hpPercent > 50 ? 'from-emerald-600 to-emerald-400' : hpPercent > 20 ? 'from-yellow-600 to-yellow-400' : 'from-red-600 to-red-400'} shadow-[0_0_15px_rgba(239,68,68,0.4)]`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'damage', name: t('weaponSystem'), value: (effectiveStats.damage || 100).toFixed(0), icon: Sword, color: 'text-orange-400' },
            { id: 'crit_dmg', name: t('criticalDamage'), value: ((effectiveStats.damage || 100) * 10).toFixed(0), icon: Zap, color: 'text-yellow-400' },
            { id: 'crit', name: t('weaknessScanner'), value: `${((effectiveStats.critChance || 0.1) * 100).toFixed(0)}%`, icon: Target, color: 'text-red-400' },
            { id: 'loot', name: t('avarice'), value: `${((stats.lootEfficiency || 0.8) * 100).toFixed(0)}%`, icon: TrendingUp, color: 'text-emerald-400' }
          ].map(s => (
            <div key={s.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2">
                <s.icon className={`w-3 h-3 ${s.color}`} />
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{s.name}</span>
              </div>
              <div className={`text-xl font-orbitron font-bold ${rStyle.text}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 overflow-hidden">
          {[
            { id: 'damage', name: t('weaponSystem'), desc: `+10% ${t('dmgBonus')}`, icon: Sword, max: 5 },
            { id: 'shield', name: t('reinforcedShields'), desc: `+15% ${t('shield')}`, icon: Shield, max: 5 },
            { id: 'crit', name: t('weaknessScanner'), desc: `+10% ${t('criticalChance')}`, icon: Target, max: 5 },
            { id: 'loot', name: t('avarice'), desc: `+25% Loot QC`, icon: TrendingUp, max: 5 }
          ].map(upg => {
            const maxLevel = upg.max + (battleShipUpgradeLevel * 10);
            const level = stats.upgrades[upg.id as keyof typeof stats.upgrades];
            const isMax = level >= maxLevel;
            const getUpgradeCost = (lvl: number) => {
              if (lvl < 5) {
                return [{ tech: 100, energy: 100, minerals: 100 }, { tech: 350, energy: 350, minerals: 350 }, { tech: 600, energy: 600, minerals: 600 }, { tech: 850, energy: 850, minerals: 850 }, { tech: 1150, energy: 1150, minerals: 1150 }][lvl];
              }
              const mult = lvl - 4;
              return { tech: 1150 + mult * 500, energy: 1150 + mult * 500, minerals: 1150 + mult * 500 };
            };
            const cost = !isMax ? getUpgradeCost(level) : null;
            const canAfford = cost && (combat.voidResources?.tech || 0) >= cost.tech && (combat.voidResources?.energy || 0) >= cost.energy && (combat.voidResources?.minerals || 0) >= cost.minerals;

            return (
              <button
                key={upg.id}
                onClick={() => upgradeVoidBattleShip(upg.id as any)}
                disabled={isMax || !canAfford || isVoidWarActive || voidWarAlertActive}
                className={`glass-panel border p-4 rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden text-left ${
                  isMax ? 'border-emerald-500/30 bg-emerald-500/5 opacity-80' : 
                  (canAfford && !isVoidWarActive && !voidWarAlertActive) ? 'border-red-500/20 hover:border-red-500/50 hover:bg-white/5' : 
                  'border-white/5 opacity-40 grayscale pointer-events-none'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <upg.icon className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-[10px] font-mono text-red-500/60 font-bold">LVL {level}/{maxLevel}</div>
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider line-clamp-1">{upg.name}</h4>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest">{upg.desc}</p>
                </div>
                {!isMax && cost && (
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 gap-1">
                    <div className="flex justify-between text-[8px] uppercase tracking-widest">
                      <span className={(combat.voidResources?.tech || 0) >= cost.tech ? 'text-cyan-400' : 'text-red-400'}>{cost.tech} Tech</span>
                      <span className={(combat.voidResources?.energy || 0) >= cost.energy ? 'text-yellow-400' : 'text-red-400'}>{cost.energy} En</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 items-center mt-auto">
          <button
            onClick={isVoidWarActive ? () => { playSfx('kill_enemys_botton'); setShowVoidWarMap(true); } : () => startVoidBattle()}
            disabled={stats.hp <= 0}
            className={`flex-[2] py-4 font-orbitron font-black rounded-2xl transition-all active:scale-95 uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed text-lg ${
              isVoidWarActive 
                ? 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse border-2 border-red-400' 
                : 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]'
            }`}
          >
            {isVoidWarActive ? <Skull className="w-6 h-6" /> : <Crosshair className="w-6 h-6" />}
            {isVoidWarActive || voidWarAlertActive ? t('eliminateEnemies') : t('searchCombat')}
          </button>

          <button
            onClick={repairVoidBattleShip}
            disabled={stats.hp >= getEffectiveVoidStats(stats).maxHp && (stats.shield || 0) >= (getEffectiveVoidStats(stats).maxShield || 1000)}
            className="flex-1 py-4 bg-white/10 text-white font-orbitron font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 active:scale-95 uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="flex flex-col items-center">
              <span className="text-[14px]">{t('repair')}</span>
              <span className="text-[8px] text-white/40 group-hover:text-white/60">
                {stats.hp < getEffectiveVoidStats(stats).maxHp ? '1.5k Ener | 1.5k Tech' : '1k Ener | 1k Tech'}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export default VoidBattleTab;
