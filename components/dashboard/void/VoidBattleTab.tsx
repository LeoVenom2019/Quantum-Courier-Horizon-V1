'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Radar, Sword, Crosshair, Trophy, Database, X, Skull, Shield, Zap, Target, ArrowUpCircle, Bot, TrendingUp, Star } from 'lucide-react';
import VoidBattleArena from '../../VoidBattleArena';
import { useDashboard } from '../DashboardProvider';
import { PremiumCanvasButton } from '../../ui/PremiumCanvasButton';
import { PremiumStaticCard } from '../../ui/PremiumStaticCard';

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
  startVoidBattleOverride?: () => void;
}

const VoidBattleTab = memo(function VoidBattleTab({
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
  setShowVoidWarMap,
  startVoidBattleOverride
}: VoidBattleTabProps) {
  const isVoidBattleUrgent = isVoidWarActive || voidWarAlertActive;
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
    startVoidBattle: dashboardStartVoidBattle,
    repairVoidBattleShip,
    upgradeVoidBattleShip,
    upgradeVoidBattleShipRarity
  } = useDashboard();
  const startVoidBattle = startVoidBattleOverride || dashboardStartVoidBattle;

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
  const { routeTier, battleLevel } = progression;
  const stats = voidBattleShipStats;

  const effectiveStats = getEffectiveVoidStats(voidBattleShipStats);
  const activeBattleEnemies = React.useMemo(() => {
    if (!activeVoidBattle) return [];
    return Array.isArray(activeVoidBattle.enemies)
      ? activeVoidBattle.enemies
      : [activeVoidBattle];
  }, [activeVoidBattle]);
  const activeBattleEnemyQueue = React.useMemo(() => activeVoidBattle?.enemyQueue || [], [activeVoidBattle]);

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
  const rarityFrameStyle = {
    common: {
      label: language === 'pt' ? 'Comum' : 'Common',
      border: 'border-red-400/60',
      glow: 'shadow-[0_0_46px_rgba(248,113,113,0.24),inset_0_0_70px_rgba(127,29,29,0.28)]',
      accent: 'from-red-400/70 via-white/35 to-red-500/70',
      text: 'text-red-200',
      chip: 'border-red-400/40 bg-red-500/10 text-red-100',
    },
    rare: {
      label: language === 'pt' ? 'Rara' : 'Rare',
      border: 'border-blue-400/65',
      glow: 'shadow-[0_0_54px_rgba(96,165,250,0.32),inset_0_0_80px_rgba(30,64,175,0.28)]',
      accent: 'from-blue-300/80 via-cyan-100/45 to-blue-500/75',
      text: 'text-blue-100',
      chip: 'border-blue-300/45 bg-blue-500/12 text-blue-100',
    },
    elite: {
      label: language === 'pt' ? 'Épica' : 'Epic',
      border: 'border-purple-400/70',
      glow: 'shadow-[0_0_62px_rgba(168,85,247,0.34),inset_0_0_90px_rgba(88,28,135,0.3)]',
      accent: 'from-purple-300/80 via-fuchsia-100/45 to-purple-600/75',
      text: 'text-purple-100',
      chip: 'border-purple-300/45 bg-purple-500/12 text-purple-100',
    },
    legendary: {
      label: language === 'pt' ? 'Lendária' : 'Legendary',
      border: 'border-orange-300/75',
      glow: 'shadow-[0_0_68px_rgba(251,146,60,0.36),inset_0_0_95px_rgba(154,52,18,0.32)]',
      accent: 'from-orange-300/85 via-yellow-100/50 to-amber-500/80',
      text: 'text-orange-100',
      chip: 'border-orange-300/50 bg-orange-500/14 text-orange-100',
    },
    mythic: {
      label: language === 'pt' ? 'Mítica' : 'Mythic',
      border: 'border-white/75',
      glow: 'shadow-[0_0_80px_rgba(255,255,255,0.28),0_0_120px_rgba(239,68,68,0.24),inset_0_0_110px_rgba(127,29,29,0.34)]',
      accent: 'from-white/90 via-red-200/65 to-slate-300/85',
      text: 'text-white',
      chip: 'border-white/50 bg-white/12 text-white',
    },
  }[stats.rarity as 'common' | 'rare' | 'elite' | 'legendary' | 'mythic'] || {
    label: language === 'pt' ? 'Comum' : 'Common',
    border: 'border-red-400/60',
    glow: 'shadow-[0_0_46px_rgba(248,113,113,0.24),inset_0_0_70px_rgba(127,29,29,0.28)]',
    accent: 'from-red-400/70 via-white/35 to-red-500/70',
    text: 'text-red-200',
    chip: 'border-red-400/40 bg-red-500/10 text-red-100',
  };
  const battleShipShowcaseImage = stats.rarity === 'mythic'
    ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp'
    : '/images/ships/battle/player-battle.webp';

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
      <div className="space-y-4 relative min-h-full rounded-2xl overflow-hidden p-6 border border-white/5 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url('/assets/rota3/void/bg_void_battle_main.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90 pointer-events-none" />

        <div className="relative z-10 flex justify-between items-center">
          <h3 className="text-lg font-orbitron font-black text-white tracking-widest uppercase">{t('targetsDetected')}</h3>
          <PremiumCanvasButton
            onClick={() => setVoidBattleStatus('idle')}
            tone="steel"
            className="h-9 min-w-[124px] px-3 text-[13px] uppercase tracking-widest"
            contentClassName="text-white/70"
          >
            {t('cancelSearch')}
          </PremiumCanvasButton>
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {voidBattleOptions.map(enemy => (
            <div key={enemy.id} className="glass-panel border border-white/10 rounded-2xl p-4 space-y-5 hover:border-red-500/40 transition-all group overflow-hidden relative bg-black shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url('/assets/rota3/void/${
                    enemy.type === 'Boss' ? 'bg_void_battle_boss.webp' :
                    enemy.type === 'Elite' ? 'bg_void_battle_elite.webp' :
                    'bg_void_battle_common.webp'
                  }')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />

              <div className="relative z-10 flex gap-4 items-center">
                <div className="relative w-20 h-20 shrink-0 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-red-500/30 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Image
                    src={enemy.image}
                    alt={enemy.type}
                    width={64}
                    height={64}
                    className="object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform duration-500"
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

              <div className="relative z-10 space-y-3 pt-2 border-t border-white/5">
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

              <div className="relative z-10">
                <PremiumCanvasButton
                  onClick={() => selectVoidBattle(enemy)}
                  tone="red"
                  className="w-full h-12 text-base font-black uppercase tracking-[0.2em]"
                  contentClassName="gap-2 text-white"
                >
                  <Sword className="w-4 h-4" />
                  {t('attackTarget')}
                </PremiumCanvasButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (voidBattleStatus === 'fighting' && activeVoidBattle) {
    const effectiveStats = getEffectiveVoidStats(voidBattleShipStats);
    const isInvasionSectorBattle = (isVoidWarActive || voidWarAlertActive) && (activeVoidBattle.locationId ?? 0) > 0;

    return (
      <VoidBattleArena
        initialEnemies={activeBattleEnemies}
        playerShipStats={effectiveStats}
        voidResources={combat.voidResources}
        routeTier={routeTier}
        locationId={activeVoidBattle.locationId ?? 0}
        activeShipImage={battleLevel >= 25 ? '/images/battle/skyring.png' : '/images/battle/standard_ship.png'}
        battleLevel={battleLevel}
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

             const rawReward = result?.reward || 0;
             const rarityQCBonus = { common: 1, rare: 1.3, elite: 1.4, legendary: 1.5, mythic: 1.6 }[voidBattleShipStats.rarity as 'common' | 'rare' | 'elite' | 'legendary' | 'mythic'] || 1;
             const finalReward = result?.isMeteorEventReward
               ? Math.floor(rawReward)
               : Math.floor(rawReward * voidBattleShipStats.lootEfficiency * rarityQCBonus);

             setVoidBattleResult({
               reward: finalReward,
               destroyedMeteors: result?.destroyedMeteors || 0,
               destroyedMeteorites: result?.destroyedMeteorites || 0,
               meteoriteRewardValue: result?.meteoriteRewardValue,
               meteorRewardValue: result?.meteorRewardValue,
               meteoriteRewardTotal: result?.meteoriteRewardTotal,
               meteorRewardTotal: result?.meteorRewardTotal
             });

             dispatch({ type: 'EARN_QC', payload: { amount: finalReward, source: 'battle' } });

             addLog(`${t('victoryCaps')}! +${formatValue(finalReward)} QC.`, 'success');
             playSfx('success');
           } else {
             setVoidBattleStatus('lost');
             addLog(t('defeatShipDamaged'), 'error');
             playSfx('game_over');
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
        enemyQueue={activeBattleEnemyQueue}
        meteoriteRewardValue={Math.floor((activeVoidBattle.qc || 0) * 0.05)}
        disableMeteorEvent={isInvasionSectorBattle}
        onExitBattle={() => {
          setVoidBattleShipStats((prev: any) => ({
            ...prev,
            hp: 0
          }));
          setVoidBattleStatus('lost');
          addLog(t('defeatShipDamaged'), 'error');
          playSfx('game_over');
        }}
      />
    );
  }

  if (voidBattleStatus === 'won') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto"
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

          <PremiumCanvasButton
            onClick={() => {
              setVoidBattleStatus('idle');
              stopSfx('bobby_blue_theme_victory');
            }}
            tone="steel"
            className="absolute top-6 right-6 h-12 w-12 z-30"
            contentClassName="text-white/60"
          >
            <X className="w-6 h-6" />
          </PremiumCanvasButton>

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
                {language === 'pt' ? 'Setor Neutralizado • Ameaça Elimindada' : 'Sector Neutralized • Threat Eliminated'}
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
              <div className="absolute bottom-6 left-6 right-6 flex justify-end items-end">
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
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center col-span-3">
                    <Database className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">QC</span>
                    <div className="text-xl font-orbitron font-black text-white">
                      +{formatValue(voidBattleResult?.reward || 0)}
                    </div>
                  </div>

                {(voidBattleResult?.destroyedMeteors > 0 || voidBattleResult?.destroyedMeteorites > 0) && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Meteoritos Destruídos' : 'Meteorites Destroyed'}</span>
                      <div className="text-xl font-orbitron text-orange-400">
                        {voidBattleResult?.destroyedMeteorites || 0}
                      </div>
                      {voidBattleResult?.meteoriteRewardTotal !== undefined && (
                        <div className="text-[12px] font-orbitron text-emerald-300">
                          {language === 'pt' ? 'Meteoritos' : 'Meteorites'} x {voidBattleResult?.destroyedMeteorites || 0} = {formatValue(voidBattleResult?.meteoriteRewardTotal || 0)} QC
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Meteoros Destruídos' : 'Meteors Destroyed'}</span>
                      <div className="text-xl font-orbitron text-red-500">
                        {voidBattleResult?.destroyedMeteors || 0}
                      </div>
                      {voidBattleResult?.meteorRewardTotal !== undefined && (
                        <div className="text-[12px] font-orbitron text-emerald-300">
                          {language === 'pt' ? 'Meteoros' : 'Meteors'} x {voidBattleResult?.destroyedMeteors || 0} = {formatValue(voidBattleResult?.meteorRewardTotal || 0)} QC
                        </div>
                      )}
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

              <PremiumCanvasButton
                onClick={() => {
                  setVoidBattleStatus('idle');
                  stopSfx('bobby_blue_theme_victory');
                }}
                tone="green"
                className="w-full min-h-[64px] rounded-2xl text-lg lg:text-xl font-black uppercase tracking-[0.3em]"
                contentClassName="text-emerald-100"
              >
                {t('backToRadar')}
              </PremiumCanvasButton>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (voidBattleStatus === 'lost') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] animate-float" />
        </div>

        <div className="relative w-full max-w-5xl glass-panel border-2 border-red-500/40 rounded-[2.5rem] p-8 lg:p-12 flex flex-col items-center gap-8 lg:gap-10 bg-gradient-to-br from-red-500/10 via-black/90 to-red-950/20 shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-60 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
          />

          <PremiumCanvasButton
            onClick={() => {
              setVoidBattleStatus('idle');
              stopSfx('game_over');
            }}
            tone="steel"
            className="absolute top-6 right-6 h-12 w-12 z-30"
            contentClassName="text-white/60"
          >
            <X className="w-6 h-6" />
          </PremiumCanvasButton>

          <div className="text-center space-y-2">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl lg:text-8xl font-orbitron font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white via-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] uppercase">
                {t('defeat')}
              </h2>
              <p className="text-base lg:text-xl text-red-400/60 font-mono uppercase tracking-[0.5em] mt-2">
                {language === 'pt' ? 'Sistema Crítico • Nave Desativada' : 'Critical System • Vessel Disabled'}
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
                src="/videos/bobby_blue/bobby_game_over.webm"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">BOBBY_LIVE_CAM • OFFLINE</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-end items-end">
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                  <Skull className="w-6 h-6 lg:w-8 lg:h-8 text-red-400" />
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
                  <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center">
                    <Skull className="w-5 h-5 text-red-400 mb-1" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{t('status')}</span>
                    <div className="text-xl font-orbitron font-black text-red-500 uppercase">
                      {t('destroyed')}
                    </div>
                  </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Integridade da Nave' : 'Ship Integrity'}</span>
                    <div className="text-lg lg:text-xl font-orbitron text-red-600 font-black">0%</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Reparo Necessário' : 'Repair Required'}</span>
                    <div className="text-lg lg:text-xl font-orbitron text-red-400 font-bold uppercase">{language === 'pt' ? 'Crítico' : 'Critical'}</div>
                  </div>
                </div>
              </div>

              <PremiumCanvasButton
                onClick={() => {
                  setVoidBattleStatus('idle');
                  stopSfx('game_over');
                }}
                tone="red"
                className="w-full min-h-[64px] rounded-2xl text-lg lg:text-xl font-black uppercase tracking-[0.3em]"
                contentClassName="text-white"
              >
                {t('backToRadar')}
              </PremiumCanvasButton>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`h-full flex flex-col lg:flex-row gap-6 items-stretch overflow-hidden relative rounded-2xl ${stats.rarity === 'mythic' ? 'bg-black' : 'bg-black/60'} border border-white/5`}>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url('/assets/rota3/void/bg_void_battle_main.webp')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90 pointer-events-none" />

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

      <div className="w-full lg:w-[34%] flex flex-col gap-4 min-h-0 h-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square lg:aspect-auto lg:flex-1 glass-panel border-2 border-red-500/30 rounded-[2rem] relative overflow-hidden bg-black shadow-[0_0_50px_rgba(239,68,68,0.15)] group min-h-0"
        >
          <video
            src="/videos/bobby_blue/void_battle_preview.webm"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-contain opacity-80 group-hover:opacity-95 transition-opacity duration-700"
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

        {/* Action Buttons for Mobile/Small Screens moved here if needed, but for now we keep the layout */}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[66%] flex flex-col gap-3 overflow-hidden pr-2 min-h-0"
      >
        <PremiumStaticCard
          tone={stats.rarity === 'mythic' ? 'steel' : 'red'}
          density="standard"
          className="rounded-3xl shrink-0"
          contentClassName="p-5 space-y-3"
        >
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
                  <PremiumCanvasButton
                    onClick={() => {
                      setShowBattleShipUpgradeModal(true);
                      playSfx('ask_window');
                    }}
                    tone="green"
                    className="h-9 min-w-[158px] px-4 text-[10px] font-bold uppercase tracking-wider"
                    contentClassName="gap-2 text-emerald-200"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">{t('upgradeBattleShip')}</span>
                  </PremiumCanvasButton>
                )}

                {stats.upgrades.damage >= 5 && stats.upgrades.shield >= 5 && stats.upgrades.crit >= 5 && stats.upgrades.loot >= 5 && stats.rarity !== 'mythic' && (
                  <PremiumCanvasButton
                    onClick={upgradeVoidBattleShipRarity}
                    tone="blue"
                    className="h-10 min-w-[126px] px-4 text-[9px] font-black uppercase tracking-wider"
                    contentClassName="gap-2 text-blue-200"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[9px] font-orbitron font-black uppercase tracking-wider">{t('upgradeRarity')}</span>
                      <span className="text-[8px] font-mono opacity-60">
                        {stats.rarity === 'common' ? '5k T/E' : stats.rarity === 'rare' ? '10k T/E' : stats.rarity === 'elite' ? '15k T/E' : '20k T/E'}
                      </span>
                    </div>
                  </PremiumCanvasButton>
                )}
              </div>
              <p className={`text-xs font-mono uppercase tracking-[0.3em] transition-all duration-700 opacity-60 ${rStyle.subtext}`}>{t('sovereignOfVoid')}</p>
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
            <PremiumCanvasButton
              onClick={() => setShowRobotModal(true)}
              tone="amber"
              className="w-full min-h-[56px] rounded-2xl animate-pulse"
              contentClassName="gap-4 text-yellow-200"
            >
              <div className="relative">
                <Bot className="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-yellow-400 font-orbitron text-xs font-black tracking-[0.2em] uppercase">{t('defectiveRobot')}</span>
                <span className="text-[9px] text-yellow-400/60 font-mono uppercase tracking-widest">{language === 'pt' ? 'REPARO DE EMERGÊNCIA DISPONÍVEL' : 'EMERGENCY REPAIR AVAILABLE'}</span>
              </div>
              <div className="ml-auto px-4 py-1 bg-yellow-500/90 text-black font-orbitron font-black text-[10px] rounded-lg tracking-widest">
                FIX NOW
              </div>
            </PremiumCanvasButton>
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
        </PremiumStaticCard>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
          {[
            { id: 'damage', name: language === 'pt' ? 'Sistema de Armas' : t('weaponSystem'), value: (effectiveStats.damage || 100).toFixed(0), icon: Sword, color: 'text-orange-400', tone: 'orange' as const },
            { id: 'crit_dmg', name: language === 'pt' ? 'Dano Crítico' : t('criticalDamage'), value: (effectiveStats.criticalDamage || ((effectiveStats.damage || 100) * (effectiveStats.critDamageMultiplier || 2))).toFixed(0), icon: Zap, color: 'text-yellow-400', tone: 'amber' as const },
            { id: 'crit', name: language === 'pt' ? 'Scanner de Fraqueza' : t('weaknessScanner'), value: `${((effectiveStats.critChance || 0.1) * 100).toFixed(0)}%`, icon: Target, color: 'text-red-400', tone: 'red' as const },
            { id: 'loot', name: language === 'pt' ? 'Avarícia' : t('avarice'), value: `${((stats.lootEfficiency || 0.8) * 100).toFixed(0)}%`, icon: TrendingUp, color: 'text-emerald-400', tone: 'green' as const }
          ].map(s => (
            <PremiumStaticCard
              key={s.name}
              tone={s.tone}
              density="compact"
              className="rounded-2xl"
              contentClassName="p-3 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <s.icon className={`w-3 h-3 ${s.color}`} />
                <span className="truncate text-[10px] text-white/45 uppercase tracking-widest">{s.name}</span>
              </div>
              <div className={`text-xl font-orbitron font-bold ${rStyle.text}`}>{s.value}</div>
            </PremiumStaticCard>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,0.56fr)_minmax(420px,0.44fr)]">
          <div className="grid h-full min-h-0 grid-cols-2 grid-rows-3 gap-2.5">
              {[
                { id: 'damage', name: t('weaponSystem'), desc: `+10% ${t('dmgBonus')}`, icon: Sword, max: 5 },
                { id: 'shield', name: t('reinforcedShields'), desc: `+15% ${t('shield')}`, icon: Shield, max: 5 },
                { id: 'crit', name: language === 'pt' ? 'Scanner de Fraqueza' : t('weaknessScanner'), desc: language === 'pt' ? '+10% Chance Crítica' : `+10% ${t('criticalChance')}`, icon: Target, max: 5 },
                { id: 'loot', name: language === 'pt' ? 'Avarícia' : t('avarice'), desc: language === 'pt' ? '+25% Saque QC' : `+25% Loot QC`, icon: TrendingUp, max: 5 }
              ].map(upg => {
                const maxLevel = upg.max;
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
                  <PremiumCanvasButton
                    key={upg.id}
                    onClick={() => upgradeVoidBattleShip(upg.id as any)}
                    disabled={isMax || !canAfford || isVoidWarActive || voidWarAlertActive}
                    disabledVisual={isMax ? 'tone' : 'muted'}
                    tone={isMax ? 'green' : (canAfford && !isVoidWarActive && !voidWarAlertActive) ? 'red' : 'steel'}
                    className={`h-full min-h-[86px] p-2.5 text-left ${
                      isMax ? 'shadow-[0_0_24px_rgba(74,222,128,0.18),inset_0_0_18px_rgba(16,185,129,0.12)]' :
                      (canAfford && !isVoidWarActive && !voidWarAlertActive) ? '' :
                      'grayscale'
                    }`}
                    contentClassName="flex-col items-stretch justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-1.5 rounded-lg border ${isMax ? 'bg-emerald-400/10 border-emerald-300/30 shadow-[0_0_12px_rgba(52,211,153,0.25)]' : 'bg-red-500/10 border-red-500/20'}`}>
                        <upg.icon className={`w-3.5 h-3.5 ${isMax ? 'text-emerald-300' : 'text-red-400'}`} />
                      </div>
                      {isMax ? (
                        <div className="flex items-center gap-1.5 rounded-md border border-emerald-300/40 bg-emerald-300/10 px-2 py-1 shadow-[0_0_14px_rgba(74,222,128,0.22)]">
                          <Star className="h-3 w-3 fill-emerald-300 text-emerald-200" />
                          <span className="font-orbitron text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100 drop-shadow-[0_0_8px_rgba(110,231,183,0.8)]">MAX</span>
                        </div>
                      ) : (
                        <div className="text-[9px] font-mono text-red-500/60 font-bold">LVL {level}/{maxLevel}</div>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <h4 className={`text-[11px] font-orbitron font-bold uppercase tracking-wider line-clamp-1 ${isMax ? 'text-emerald-50 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]' : 'text-white'}`}>{upg.name}</h4>
                      <p className={`text-[9px] uppercase tracking-widest ${isMax ? 'text-emerald-200/60' : 'text-white/40'}`}>{upg.desc}</p>
                    </div>
                    {isMax ? (
                      <div className="mt-1.5 pt-1.5 border-t border-emerald-300/20">
                        <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.22em]">
                          <span className="text-emerald-200/70">{language === 'pt' ? 'Melhoria completa' : 'Upgrade complete'}</span>
                          <span className="text-emerald-300 font-orbitron font-black">5/5</span>
                        </div>
                      </div>
                    ) : cost && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/5 grid grid-cols-1 gap-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-widest">
                          <span className={(combat.voidResources?.tech || 0) >= cost.tech ? 'text-cyan-400' : 'text-red-400'}>{cost.tech} Tech</span>
                          <span className={(combat.voidResources?.energy || 0) >= cost.energy ? 'text-yellow-400' : 'text-red-400'}>{cost.energy} En</span>
                        </div>
                      </div>
                    )}
                  </PremiumCanvasButton>
                );
              })}
              <PremiumCanvasButton
                onClick={voidWarAlertActive ? () => startVoidBattle() : isVoidWarActive ? () => { playSfx('kill_enemys_botton'); setShowVoidWarMap(true); } : () => startVoidBattle()}
                disabled={stats.hp <= 0}
                tone="red"
                className={`h-full min-h-[86px] rounded-2xl text-sm lg:text-base font-black uppercase tracking-[0.26em] ${isVoidBattleUrgent ? 'animate-pulse shadow-[0_0_28px_rgba(239,68,68,0.42)]' : ''}`}
                contentClassName="gap-3 text-white"
              >
                {isVoidBattleUrgent ? <Skull className="w-5 h-5" /> : <Crosshair className="w-5 h-5" />}
                {isVoidBattleUrgent ? t('eliminateEnemies') : t('searchCombat')}
              </PremiumCanvasButton>

              <PremiumCanvasButton
                onClick={repairVoidBattleShip}
                disabled={stats.hp >= getEffectiveVoidStats(stats).maxHp && (stats.shield || 0) >= (getEffectiveVoidStats(stats).maxShield || 1000)}
                tone="steel"
                className="h-full min-h-[86px] rounded-2xl font-bold uppercase tracking-[0.2em]"
                contentClassName="text-white"
              >
                <div className="flex flex-col items-center">
                  <span className="text-[14px]">{t('repair')}</span>
                  <span className="text-[8px] text-white/40 group-hover:text-white/60">
                    {stats.hp < getEffectiveVoidStats(stats).maxHp ? '1.5k Ener | 1.5k Tech' : '1k Ener | 1k Tech'}
                  </span>
                </div>
              </PremiumCanvasButton>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className={`relative hidden h-full min-h-[292px] w-full self-stretch justify-self-end overflow-hidden rounded-[1.65rem] border-2 bg-black/80 xl:block ${rarityFrameStyle.border} ${rarityFrameStyle.glow}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%,rgba(255,255,255,0.04)_65%,transparent)]" />
            <div className={`absolute left-5 right-5 top-5 h-px bg-gradient-to-r ${rarityFrameStyle.accent}`} />
            <div className={`absolute bottom-5 left-5 right-5 h-px bg-gradient-to-r ${rarityFrameStyle.accent}`} />
            <div className="absolute inset-3 rounded-[1.2rem] border border-white/10" />
            <div className="absolute -left-16 top-1/4 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-12 bottom-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
            <div className={`absolute left-[14%] top-[18%] h-[58%] w-[72%] rounded-full bg-gradient-to-r ${rarityFrameStyle.accent} opacity-30 blur-3xl mix-blend-screen animate-[void-ship-aura_3.8s_ease-in-out_infinite]`} />
            <div className="absolute inset-0 z-[2] overflow-hidden rounded-[inherit] mix-blend-screen">
              <div className={`absolute left-0 top-0 h-[34%] w-[58%] bg-gradient-to-r ${rarityFrameStyle.accent} blur-md animate-[void-ship-sweep_4.2s_ease-in-out_infinite]`} />
            </div>
            <Image
              src={battleShipShowcaseImage}
              alt={stats.rarity === 'mythic' ? 'Eclipse' : t('battleShip')}
              fill
              sizes="520px"
              className="z-[1] object-contain px-7 py-12 drop-shadow-[0_0_24px_rgba(255,255,255,0.18)] animate-[void-ship-aura_5.2s_ease-in-out_infinite]"
            />
            <div className="absolute inset-0 z-[3] pointer-events-none">
              {[
                ['18%', '28%', '18px', '-12px', '0s'],
                ['72%', '30%', '-16px', '10px', '0.7s'],
                ['64%', '67%', '14px', '-16px', '1.25s'],
                ['32%', '70%', '-10px', '12px', '1.8s'],
                ['48%', '20%', '12px', '14px', '2.3s'],
              ].map(([left, top, sparkX, sparkY, delay], index) => (
                <span
                  key={`ship-spark-${index}`}
                  className={`absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-[void-ship-spark_2.8s_ease-in-out_infinite] ${rarityFrameStyle.text}`}
                  style={{
                    left,
                    top,
                    animationDelay: delay,
                    ['--spark-x' as any]: sparkX,
                    ['--spark-y' as any]: sparkY,
                  }}
                />
              ))}
            </div>
            <div className="absolute left-4 top-4 z-[4] flex items-center gap-2">
              <Star className={`h-4 w-4 ${rarityFrameStyle.text}`} />
              <span className={`rounded-lg border px-2.5 py-1 text-[9px] font-orbitron font-black uppercase tracking-[0.22em] ${rarityFrameStyle.chip}`}>
                {rarityFrameStyle.label}
              </span>
            </div>
            <div className={`absolute bottom-4 left-4 right-4 z-[4] text-center font-orbitron text-[10px] font-black uppercase tracking-[0.28em] ${rarityFrameStyle.text}`}>
              {stats.rarity === 'mythic' ? 'Eclipse Prime' : 'Battle Core'}
            </div>
            <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-white/30 rounded-tl-[1.55rem]" />
            <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-white/30 rounded-tr-[1.55rem]" />
            <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-white/30 rounded-bl-[1.55rem]" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-white/30 rounded-br-[1.55rem]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

export default VoidBattleTab;
