'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Trophy, 
  Zap, 
  ShieldAlert, 
  Shield, 
  ZapOff, 
  MousePointer2, 
  Target, 
  Swords, 
  TrendingUp, 
  Skull, 
  ArrowRight, 
  Clock 
} from 'lucide-react';
import VoidBattleArena, { VoidBattleEnemy } from '../VoidBattleArena';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

interface BattleOverlayProps {
  activeBattle: any;
  routeTier: string;
  language: string;
  t: (key: string) => string;
  formatValue: (val: number) => string;
  finishBattle: () => void;
  resolveBattleVictory: (battle: any) => void;
  resolveBattleDefeat: (battle: any) => void;
  setActiveBattle: (battle: any) => void;
  playSfx: (id: string) => void;
  stopSfx: (id: string) => void;
  addLog: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  voidResources: any;
  shipLevel: number;
  battleLevel: number;
  privatePoliceLevel: number;
  getPoliceBonus: (level: number) => number;
  ROUTES_MAP: Map<string, any>;
  aetherion: number;
  autoSkipBattle: (battle: any, cost: number) => boolean;
  meteoriteRewardValue?: number;
}

const BattleOverlay = memo(({
  activeBattle,
  routeTier,
  language,
  t,
  formatValue,
  finishBattle,
  resolveBattleVictory,
  resolveBattleDefeat,
  setActiveBattle,
  playSfx,
  stopSfx,
  addLog,
  voidResources,
  shipLevel,
  battleLevel,
  privatePoliceLevel,
  getPoliceBonus,
  ROUTES_MAP,
  aetherion,
  autoSkipBattle,
  meteoriteRewardValue = 0
}: BattleOverlayProps) => {
  if (!activeBattle) return null;
  
  // Check if the battle belongs to the current route tier
  const battleRoute = ROUTES_MAP.get(activeBattle.routeId);
  if (battleRoute?.tier !== routeTier) return null;

  const cooldowns = {
    laser: 1000,
    plasma: 2000,
    special: 3000,
    shield: 3000
  };

  const getCooldownProgress = (type: 'laser' | 'plasma' | 'special' | 'shield') => {
    const last = activeBattle.lastPlayerAttack[type] || 0;
    const elapsed = Date.now() - last;
    return Math.min(100, (elapsed / cooldowns[type]) * 100);
  };

  const forceBattleDefeat = () => {
    const updated = { ...activeBattle, isDefeat: true, playerHp: 0 };
    setActiveBattle(updated);
    resolveBattleDefeat(updated);
  };

  if (activeBattle.isVictory || activeBattle.isDefeat) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl glass-panel border border-emerald-500/30 rounded-[2.5rem] p-10 relative shadow-[0_0_80px_rgba(16,185,129,0.15)] text-center space-y-8"
          >
            {/* Header Icon */}
            <div className="mx-auto w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-3xl animate-pulse" />
              {activeBattle.isVictory ? (
                <Trophy className="w-12 h-12 text-emerald-400 relative z-10 animate-bounce" />
              ) : (
                <ZapOff className="w-12 h-12 text-rose-400 relative z-10" />
              )}
            </div>

            <div className="space-y-2">
              <motion.h3 
                initial={{ letterSpacing: "0.2em" }}
                animate={{ letterSpacing: "0.5em" }}
                className={`text-5xl font-orbitron font-black uppercase ${activeBattle.isVictory ? 'text-emerald-400' : 'text-rose-500'}`}
              >
                {activeBattle.isVictory ? (language === 'pt' ? 'VITÓRIA' : 'VICTORY') : (language === 'pt' ? 'DERROTA' : 'DEFEAT')}
              </motion.h3>
              <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            </div>
            
            {activeBattle.isVictory ? (
              <div className="space-y-6">
                <p className="text-slate-400 font-orbitron text-[15px] tracking-[0.3em] uppercase font-bold">
                  {language === 'pt' ? 'RECOMPENSAS DE COMBATE' : 'COMBAT REWARDS'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Coins className="w-6 h-6" />, label: 'QC', value: `+${formatValue(activeBattle.reward)}`, color: 'emerald', delay: 0 },
                    { icon: <Trophy className="w-6 h-6" />, label: 'XP', value: `+${activeBattle.xpReward || 0}`, color: 'purple', delay: 0.1, show: (activeBattle.xpReward || 0) > 0 },
                    { icon: <Zap className="w-6 h-6" />, label: 'ET', value: `+${activeBattle.aetherionReward || 0}`, color: 'orange', delay: 0.2, show: (activeBattle.aetherionReward || 0) > 0 }
                  ].filter(r => r.show !== false).map((reward, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reward.delay }}
                      className={`bg-${reward.color}-500/5 border border-${reward.color}-500/20 p-5 rounded-2xl flex flex-col items-center gap-2 group hover:bg-${reward.color}-500/10 transition-all`}
                    >
                      <div className={`text-${reward.color}-400 group-hover:scale-110 transition-transform`}>
                        {reward.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[12px] font-orbitron text-${reward.color}-500/60 uppercase tracking-tighter font-black`}>{reward.label}</span>
                        <span className={`text-xl font-orbitron font-bold text-${reward.color}-400`}>{reward.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {(activeBattle.destroyedMeteors > 0 || activeBattle.destroyedMeteorites > 0) && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl mt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Meteoritos Destruídos' : 'Meteorites Destroyed'}</span>
                      <div className="text-xl font-orbitron text-orange-400">
                        {activeBattle.destroyedMeteorites || 0}
                      </div>
                      {activeBattle.meteoriteRewardTotal !== undefined && (
                        <div className="text-[12px] font-orbitron text-emerald-300">
                          {language === 'pt' ? 'Meteoritos' : 'Meteorites'} x {activeBattle.destroyedMeteorites || 0} = {formatValue(activeBattle.meteoriteRewardTotal || 0)} QC
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'pt' ? 'Meteoros Destruídos' : 'Meteors Destroyed'}</span>
                      <div className="text-xl font-orbitron text-red-500">
                        {activeBattle.destroyedMeteors || 0}
                      </div>
                      {activeBattle.meteorRewardTotal !== undefined && (
                        <div className="text-[12px] font-orbitron text-emerald-300">
                          {language === 'pt' ? 'Meteoros' : 'Meteors'} x {activeBattle.destroyedMeteors || 0} = {formatValue(activeBattle.meteorRewardTotal || 0)} QC
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 font-orbitron text-base tracking-widest uppercase leading-relaxed">
                {language === 'pt' ? 'Sua nave foi desmantelada e a carga interceptada.' : 'Your ship was dismantled and cargo intercepted.'}
              </p>
            )}

            <PremiumCanvasButton
              onClick={finishBattle}
              tone={activeBattle.isVictory ? 'green' : 'red'}
              className="w-full h-[68px] text-lg font-black tracking-[0.5em] uppercase"
              contentClassName="text-white"
            >
              {language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}
            </PremiumCanvasButton>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // For Solar and Interstellar, use VoidBattleArena instead of static UI
  if ((routeTier === 'Solar' || routeTier === 'Interstellar') && !activeBattle.isVictory && !activeBattle.isDefeat) {
    const stats = {
      hp: activeBattle.playerHp,
      maxHp: activeBattle.playerMaxHp,
      shield: 0,
      maxShield: 0,
      damage: (activeBattle.playerDps || 10) * 1.5, // Buffer for interactive feel
      critChance: 0,
      lootEfficiency: 1,
      rarity: 'common' as const,
      upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 }
    };

    const enemies: VoidBattleEnemy[] = [{
      id: `solar-enemy-${activeBattle.id}`,
      type: activeBattle.isBoss ? 'Boss' : 'Padrão',
      name: activeBattle.enemyName,
      hp: activeBattle.enemyHp,
      maxHp: activeBattle.enemyMaxHp,
      shield: 0,
      maxShield: 0,
      damage: activeBattle.enemyDps || 10,
      qc: activeBattle.reward,
      x: 85,
      y: 50,
      image: activeBattle.enemyImage || ''
    }];

    return (
      <div className="relative w-full h-full">
        <VoidBattleArena 
          initialEnemies={enemies}
        playerShipStats={stats}
        voidResources={voidResources} // Not used for Solar/Interstellar
        routeTier={routeTier}
        locationId={0}
        activeShipImage={activeBattle.playerImage}
        battleLevel={battleLevel}
        onBattleEnd={(status, result) => {
          if (status === 'won') {
            const updated = { 
              ...activeBattle, 
              isVictory: true, 
              enemyHp: 0,
              reward: result?.reward ?? activeBattle.reward,
              isMeteorEventReward: Boolean(result?.isMeteorEventReward),
              destroyedMeteors: result?.destroyedMeteors || 0,
              destroyedMeteorites: result?.destroyedMeteorites || 0,
              meteoriteRewardValue: result?.meteoriteRewardValue,
              meteorRewardValue: result?.meteorRewardValue,
              meteoriteRewardTotal: result?.meteoriteRewardTotal,
              meteorRewardTotal: result?.meteorRewardTotal
            };
            setActiveBattle(updated);
            resolveBattleVictory(updated);
          } else {
            const updated = { ...activeBattle, isDefeat: true, playerHp: 0 };
            setActiveBattle(updated);
            resolveBattleDefeat(updated);
          }
        }}
        onUpdateResources={() => {}}
        playSfx={playSfx}
        stopSfx={stopSfx}
        t={t}
        language={language}
        addLog={addLog}
        formatValue={formatValue}
        isGroupBattle={false}
        onExitBattle={forceBattleDefeat}
        meteoriteRewardValue={meteoriteRewardValue}
        disableMeteorEvent={String(activeBattle.deliveryId || '').startsWith('auto-')}
      />

        {/* Skip Button during active combat */}
        <div className="absolute top-6 right-6 z-[600]">
          <button
            onClick={() => {
              const skipCost = routeTier === 'Interstellar' ? 40 : 10;
              if (aetherion >= skipCost) {
                const victory = autoSkipBattle(activeBattle, skipCost);
                if (victory) {
                  setActiveBattle({ ...activeBattle, isVictory: true, enemyHp: 0 });
                } else {
                  setActiveBattle({ ...activeBattle, isDefeat: true, playerHp: 0 });
                }
              }
            }}
            disabled={aetherion < (routeTier === 'Interstellar' ? 40 : 10)}
            className={`px-6 py-3 rounded-xl border font-black transition-all uppercase text-[14px] flex flex-col items-center gap-1 shadow-2xl backdrop-blur-md ${
              aetherion >= (routeTier === 'Interstellar' ? 40 : 10)
              ? 'bg-orange-600/40 text-orange-400 border-orange-500/60 hover:bg-orange-600/60'
              : 'bg-black/60 border-white/10 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{t('skipBattle')}</span>
            </div>
            <span className="text-[10px] opacity-70">-{routeTier === 'Interstellar' ? 40 : 10} AE</span>
          </button>
        </div>
      </div>
    );
  }

  if (routeTier === 'Earth' && !activeBattle.isVictory && !activeBattle.isDefeat) {
    return (
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-hidden"
      >
        <button
          type="button"
          onClick={forceBattleDefeat}
          className="absolute top-6 right-6 z-[20010] flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-950/70 px-4 py-2 font-orbitron text-[12px] font-black uppercase tracking-widest text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.25)] backdrop-blur-md transition-all hover:border-red-400 hover:bg-red-900/90 hover:text-white"
        >
          <ZapOff className="h-4 w-4" />
          {language === 'pt' ? 'Sair da Batalha' : 'Exit Battle'}
        </button>

        {/* Space Background for Battle */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl glass-panel neon-border-cyan rounded-3xl p-8 relative z-10 flex flex-col h-[85vh] max-h-[800px]"
        >
          {/* Battle Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase neon-text-cyan">
                  {language === 'pt' ? 'COMBATE ESPACIAL' : 'SPACE COMBAT'}
                </h2>
                <p className="text-base font-orbitron text-cyan-400/60 tracking-[0.2em] uppercase">
                  {activeBattle.enemyName} detected - LVL {activeBattle.enemyTier || 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-orbitron text-slate-500 tracking-widest uppercase mb-1">
                {language === 'pt' ? 'Ní VEL DA FROTA' : 'FLEET LEVEL'}
              </div>
              <div className="text-xl font-orbitron font-bold text-white">
                LVL {shipLevel}
              </div>
            </div>
          </div>

          {/* Battle Arena */}
          <div className="flex-1 flex items-center justify-between px-12 relative overflow-hidden">
            {/* Visual Effects Layer */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Player Shots */}
              {['laser', 'plasma', 'special'].map(type => {
                const last = activeBattle.lastPlayerAttack[type] || 0;
                if (Date.now() - last < 500) {
                  return (
                    <motion.div
                      key={`${type}-${last}`}
                      initial={{ x: "20%", opacity: 1, scale: 1 }}
                      animate={{ x: "80%", opacity: 0, scale: 1.5 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] ${
                        type === 'laser' ? 'w-24 bg-cyan-400' : 
                        type === 'plasma' ? 'w-32 bg-orange-500' : 
                        'w-48 bg-purple-500 h-4'
                      }`}
                    />
                  );
                }
                return null;
              })}

              {/* Enemy Shots */}
              {Date.now() - activeBattle.lastEnemyAttack < 500 && (
                <motion.div
                  key={`enemy-${activeBattle.lastEnemyAttack}`}
                  initial={{ x: "80%", opacity: 1, scale: 1 }}
                  animate={{ x: "20%", opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute top-1/2 -translate-y-1/2 w-24 h-2 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                />
              )}
            </div>

            {/* Player Ship */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                x: activeBattle.playerHp < activeBattle.playerMaxHp * 0.3 ? [0, -2, 2, -2, 2, 0] : 0
              }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 0.1, repeat: Infinity }
              }}
              className="flex flex-col items-center gap-6 relative z-10"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                
                {/* Shield Visual Effect */}
                <AnimatePresence>
                  {activeBattle.shieldActive && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute -inset-8 border-4 border-cyan-400/50 rounded-full z-20 shadow-[0_0_40px_rgba(34,211,238,0.6)] flex items-center justify-center bg-cyan-400/10 backdrop-blur-[2px]"
                    >
                      <Shield className="w-12 h-12 text-cyan-400 animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative w-48 h-48 flex items-center justify-center">
                  <img 
                    src={activeBattle.playerImage || '/images/battle/skyring.png'} 
                    alt="Skyring"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]"
                  />
                  {/* Skyring Name Overlay (Aggressive Visual) */}
                  {battleLevel >= 25 && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-cyan-500/50 px-3 py-0.5 rounded skew-x-[-15deg] z-20">
                      <span className="text-[12px] font-orbitron font-black text-cyan-400 tracking-[0.2em]">SKYRING</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-base font-orbitron font-bold text-cyan-400 uppercase tracking-widest">
                  <span>{battleLevel >= 25 ? 'SKYRING' : (language === 'pt' ? 'NAVE DE BATALHA' : 'BATTLE SHIP')}</span>
                  <span>{Math.floor(activeBattle.playerHp)} HP</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    animate={{ width: `${(activeBattle.playerHp / activeBattle.playerMaxHp) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-orbitron font-bold text-white/20 text-xl">
                VS
              </div>
              <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>

            {/* Enemy Ship */}
            <motion.div 
              animate={{ 
                y: [0, 10, 0],
                x: activeBattle.enemyHp < activeBattle.enemyHp * 0.3 ? [0, -2, 2, -2, 2, 0] : 0
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 0.1, repeat: Infinity }
              }}
              className="flex flex-col items-center gap-6 relative z-10"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <img 
                    src={activeBattle.enemyImage || '/images/battle/enemy_alien.webp'} 
                    alt={activeBattle.enemyName}
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-x-[-1]"
                  />
                </div>
              </div>
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-base font-orbitron font-bold text-red-400 uppercase tracking-widest">
                  <span>{activeBattle.enemyName}</span>
                  <span>{Math.floor(activeBattle.enemyHp)} HP</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    animate={{ width: `${(activeBattle.enemyHp / activeBattle.enemyMaxHp) * 100}%` }}
                    style={{ background: `linear-gradient(to right, ${activeBattle.enemyColor || '#ef4444'}, #ff6666)` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cinematic Battle Status */}
          <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-red-500/5 opacity-50" />
            
            <AnimatePresence mode="wait">
              {!(activeBattle.isVictory || activeBattle.isDefeat) ? (
                <motion.div 
                  key="combat-status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2 relative z-10"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-xl font-orbitron font-bold text-white tracking-[0.3em] uppercase">
                      {language === 'pt' ? 'COMBATE EM ANDAMENTO' : 'COMBAT IN PROGRESS'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] font-mono text-cyan-400/60 uppercase">
                    <span className="animate-pulse">ââ€”Â </span>
                    <span>{language === 'pt' ? 'SISTEMAS AUTÃƒâ€ NOMOS ATIVOS' : 'AUTONOMOUS SYSTEMS ACTIVE'}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="result-status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-2 relative z-10"
                >
                  <span className={`text-xl font-orbitron font-bold tracking-[0.3em] uppercase ${activeBattle.isVictory ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {activeBattle.isVictory ? (language === 'pt' ? 'OBJETIVO CONCLUí DO' : 'OBJECTIVE COMPLETE') : (language === 'pt' ? 'MISSÃO FRACASSADA' : 'MISSION FAILED')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Scanline */}
            {!(activeBattle.isVictory || activeBattle.isDefeat) && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
              />
            )}
          </div>


          {/* Victory/Defeat Overlay */}
          <AnimatePresence>
            {(activeBattle.isVictory || activeBattle.isDefeat) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1],
                      rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-full max-w-xl glass-panel border border-emerald-500/30 rounded-[2.5rem] p-10 relative shadow-[0_0_80px_rgba(16,185,129,0.15)] text-center space-y-8"
                >
                  {/* Header Icon */}
                  <div className="mx-auto w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-3xl animate-pulse" />
                    {activeBattle.isVictory ? (
                      <Trophy className="w-12 h-12 text-emerald-400 relative z-10 animate-bounce" />
                    ) : (
                      <ZapOff className="w-12 h-12 text-rose-400 relative z-10" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <motion.h3 
                      initial={{ letterSpacing: "0.2em" }}
                      animate={{ letterSpacing: "0.5em" }}
                      className={`text-5xl font-orbitron font-black uppercase ${activeBattle.isVictory ? 'text-emerald-400' : 'text-rose-500'}`}
                    >
                      {activeBattle.isVictory ? (language === 'pt' ? 'VITÓRIA' : 'VICTORY') : (language === 'pt' ? 'DERROTA' : 'DEFEAT')}
                    </motion.h3>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  </div>
                  
                  {activeBattle.isVictory ? (
                    <div className="space-y-6">
                      <p className="text-slate-400 font-orbitron text-[15px] tracking-[0.3em] uppercase font-bold">
                        {language === 'pt' ? 'RECOMPENSAS DE COMBATE' : 'COMBAT REWARDS'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { icon: <Coins className="w-6 h-6" />, label: 'QC', value: `+${formatValue(activeBattle.reward)}`, color: 'emerald', delay: 0 },
                          { icon: <Trophy className="w-6 h-6" />, label: 'XP', value: `+${activeBattle.xpReward || 0}`, color: 'purple', delay: 0.1, show: (activeBattle.xpReward || 0) > 0 },
                          { icon: <Zap className="w-6 h-6" />, label: 'ET', value: `+${activeBattle.aetherionReward || 0}`, color: 'orange', delay: 0.2, show: (activeBattle.aetherionReward || 0) > 0 }
                        ].filter(r => r.show !== false).map((reward, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reward.delay }}
                            className={`bg-${reward.color}-500/5 border border-${reward.color}-500/20 p-5 rounded-2xl flex flex-col items-center gap-2 group hover:bg-${reward.color}-500/10 transition-all`}
                          >
                            <div className={`text-${reward.color}-400 group-hover:scale-110 transition-transform`}>
                              {reward.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[12px] font-orbitron text-${reward.color}-500/60 uppercase tracking-tighter font-black`}>{reward.label}</span>
                              <span className={`text-xl font-orbitron font-bold text-${reward.color}-400`}>{reward.value}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 font-orbitron text-base tracking-widest uppercase leading-relaxed">
                      {language === 'pt' ? 'Sua nave foi desmantelada e a carga interceptada.' : 'Your ship was dismantled and cargo intercepted.'}
                    </p>
                  )}

                  <button
                    onClick={finishBattle}
                    className={`w-full py-5 rounded-2xl font-orbitron font-black text-lg tracking-[0.5em] uppercase transition-all relative overflow-hidden group ${
                      activeBattle.isVictory 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                        : 'bg-rose-700 text-white hover:bg-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.3)]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">{language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}</span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      </AnimatePresence>
    );
  }

  return null;
});

export default BattleOverlay;
