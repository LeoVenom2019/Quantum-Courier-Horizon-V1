'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { 
  Radar, 
  Clock, 
  ShieldAlert, 
  ZapOff, 
  Search, 
  ArrowUpCircle, 
  FastForward, 
  Trophy, 
  Star, 
  TrendingUp, 
  Sword, 
  Shield, 
  Zap 
} from 'lucide-react';
import { useDashboard } from './DashboardProvider';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';
import { getDoomPBonus, getPoliceBonus } from '@/lib/game-constants';

interface BattleLevelTabProps {
  setSelectedReward: (reward: any) => void;
  setShowDoomProtocolInfo: (val: boolean) => void;
  setShowCaptureInfo: (val: boolean) => void;
  themeBorder: string;
  themeBg: string;
  themeText: string;
  themeGlow: string;
  autoSkipRandomBattles: boolean;
  toggleAutoSkipRandomBattles: () => void;
}

const BattleLevelTab = memo(({
  setSelectedReward,
  setShowDoomProtocolInfo,
  setShowCaptureInfo,
  themeBorder,
  themeBg,
  themeText,
  themeGlow,
  autoSkipRandomBattles,
  toggleAutoSkipRandomBattles
}: BattleLevelTabProps) => {
  const { 
    progression, 
    economy, 
    t, 
    language, 
    formatValue, 
    playSfx, 
    addLog, 
    dispatch,
    isScanning,
    scanResult,
    lastScanTime,
    findBattle,
    upgradeRadar,
    upgradeBattleLevel
  } = useDashboard();

  const { battleLevel, radarLevel, privatePoliceLevel, routeTier, shipLevel, shipXP, captureLevel, doomPLevel } = progression;
  const { qc } = economy;

  const isInterstellar = routeTier === 'Interstellar';

  const maxLevel = routeTier === 'Solar' ? 25 : 55;
  const targetLevel = battleLevel + 1;
  let upgradeCost = targetLevel <= 25 
    ? Math.floor(1000 * Math.pow(50000, (targetLevel - 1) / 24))
    : Math.floor(2500000000 * Math.pow(20000, (targetLevel - 26) / 29));
  
  const canUpgrade = qc >= upgradeCost && battleLevel < maxLevel;
  
  const radarUpgradeCosts = [5000, 25000, 100000, 500000, 2500000, 10000000, 50000000, 250000000];
  let radarUpgradeCost = radarUpgradeCosts[radarLevel];
  const canUpgradeRadar = qc >= radarUpgradeCost && radarLevel < 8;

  const PRIVATE_POLICE_COSTS = [10000, 50000, 250000, 1250000, 6250000, 31250000];
  let privatePoliceCost = PRIVATE_POLICE_COSTS[privatePoliceLevel];
  const canUpgradePrivatePolice = qc >= privatePoliceCost && privatePoliceLevel < 6;

  const captureCosts = [100000000, 200000000, 300000000, 500000000, 750000000, 1000000000, 2000000000, 3000000000, 4000000000, 5000000000];
  const captureCost = captureCosts[captureLevel];
  const canUpgradeCapture = qc >= captureCost && captureLevel < 10;

  const estimatedEnemyTier = Math.max(1, battleLevel);
  const estimatedEnemyHp = 50 + (estimatedEnemyTier * 60) + 25;
  let estimatedPlayerHp = 100 + (battleLevel * 150);
  if (battleLevel >= 25) estimatedPlayerHp = Math.floor(estimatedPlayerHp * 1.25);
  let estimatedPlayerDps = (10 + battleLevel * 10) / 2;
  if (battleLevel >= 20) estimatedPlayerDps *= 1.5;
  if (battleLevel >= 25) estimatedPlayerDps *= 1.5;
  const estimatedEnemyDps = (8 + estimatedEnemyTier * 6) / 2.5;
  const estimatedPlayerTimeToKill = estimatedEnemyHp / Math.max(1, estimatedPlayerDps);
  const estimatedEnemyTimeToKill = estimatedPlayerHp / Math.max(1, estimatedEnemyDps);
  const estimatedBaseWinChance = Math.floor((estimatedEnemyTimeToKill / (estimatedPlayerTimeToKill + estimatedEnemyTimeToKill)) * 100);
  const autoSkipWinChance = Math.min(100, Math.max(0, estimatedBaseWinChance + getDoomPBonus(doomPLevel) + getPoliceBonus(privatePoliceLevel)));

  const baseCooldown = 60000;
  let currentCooldown = battleLevel >= 5 ? baseCooldown / 2 : baseCooldown;
  if (battleLevel >= 55 && routeTier === 'Interstellar') {
    currentCooldown = 0;
  }
  const isCooldownActive = Date.now() - lastScanTime < currentCooldown;
  const scanCooldownRemaining = Math.max(0, Math.ceil((currentCooldown - (Date.now() - lastScanTime)) / 1000));
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 h-full flex flex-col"
    >
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 grid-rows-[auto,1fr] gap-3 items-stretch">
        <div className="flex flex-col space-y-4 h-full">
          <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden flex flex-col items-center justify-center min-h-[180px]`}>
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <Radar className={`w-4 h-4 ${!isCooldownActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <h4 className="text-[14px] font-bold text-white uppercase tracking-widest">
                {language === 'pt' ? 'Radar de Busca de Setor' : 'Sector Radar'}
              </h4>
            </div>
            
            <div className="absolute top-3 right-4 flex items-center gap-3">
              <div className="text-base font-black text-cyan-400 uppercase tracking-wider">
                {language === 'pt' ? 'CHANCE:' : 'CHANCE:'} {50 + (radarLevel * 5)}%
              </div>
              {isCooldownActive && !isScanning && (
                <div className="flex items-center gap-1.5 text-base font-bold text-slate-500 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                  <Clock className="w-3 h-3" />
                  {scanCooldownRemaining}s
                </div>
              )}
            </div>

            <div className="relative w-24 h-24 mb-4 mt-6">
              <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${!isCooldownActive ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/5'}`} />
              {isScanning && !scanResult && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className={`absolute inset-2 rounded-full border flex flex-col items-center justify-center transition-all duration-500 ${
                isScanning ? (
                  scanResult === 'success' ? 'border-emerald-500/40 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.4)]' :
                  scanResult === 'failure' ? 'border-red-500/40 bg-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.4)]' :
                  'border-cyan-500/30 bg-cyan-500/10'
                ) : 
                !isCooldownActive ? 'border-cyan-500/50 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                'border-white/10 bg-white/5'
              }`}>
                {isScanning ? (
                  scanResult === 'success' ? (
                    <div className="text-center">
                      <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-bounce" />
                      <div className="text-base font-black text-emerald-400 uppercase tracking-tighter">TARGET FOUND</div>
                    </div>
                  ) : scanResult === 'failure' ? (
                    <div className="text-center">
                      <ZapOff className="w-8 h-8 text-red-400 mx-auto mb-1" />
                      <div className="text-base font-black text-red-400 uppercase tracking-tighter">NO SIGNAL</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Radar className="w-8 h-8 text-cyan-400 mx-auto mb-1 animate-spin" />
                      <div className="text-[15px] text-cyan-500 uppercase font-bold tracking-widest mt-1">SCANNING</div>
                    </div>
                  )
                ) : !isCooldownActive ? (
                  <div className="text-center">
                    <Radar className="w-8 h-8 text-cyan-400 mx-auto mb-1 animate-pulse" />
                    <div className="text-base text-cyan-400 uppercase font-black tracking-widest">READY</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Radar className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                    <div className="text-base text-slate-600 uppercase font-black tracking-widest">COOLDOWN</div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full px-4">
              <PremiumCanvasButton
                onClick={findBattle}
                disabled={battleLevel < 1 || isScanning || isCooldownActive}
                tone={battleLevel >= 1 && !isScanning && !isCooldownActive ? 'cyan' : 'steel'}
                className={`h-12 text-[14px] font-black uppercase tracking-widest ${
                  battleLevel >= 1 && !isScanning && !isCooldownActive
                  ? 'text-cyan-50 shadow-[0_7px_0_rgba(14,116,144,0.65),0_14px_18px_rgba(0,0,0,0.32)] hover:brightness-110 active:shadow-[0_3px_0_rgba(14,116,144,0.72),0_7px_10px_rgba(0,0,0,0.3)]'
                  : 'text-slate-500'
                }`}
                contentClassName="gap-2"
              >
                <Search className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? (language === 'pt' ? 'Buscando...' : 'Scanning...') : (language === 'pt' ? 'Escanear' : 'Scan')}
              </PremiumCanvasButton>
              
              <PremiumCanvasButton
                onClick={upgradeRadar}
                disabled={!canUpgradeRadar}
                tone={canUpgradeRadar ? 'orange' : 'steel'}
                className={`h-12 text-[14px] font-black uppercase tracking-widest ${
                  canUpgradeRadar
                  ? 'text-orange-50 shadow-[0_7px_0_rgba(154,52,18,0.65),0_14px_18px_rgba(0,0,0,0.32)] hover:brightness-110 active:shadow-[0_3px_0_rgba(154,52,18,0.72),0_7px_10px_rgba(0,0,0,0.3)]'
                  : 'text-slate-500'
                }`}
                contentClassName="gap-2"
              >
                <ArrowUpCircle className="w-4 h-4" />
                {radarLevel < 8 
                  ? (language === 'pt' ? `Melhorar (${formatValue(radarUpgradeCost)})` : `Upgrade (${formatValue(radarUpgradeCost)})`)
                  : t('max')}
              </PremiumCanvasButton>
            </div>
          </div>

          <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden space-y-3 flex-1 flex flex-col`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowDoomProtocolInfo(true)}
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 10px rgba(59, 130, 246, 0.4)", "0 0 0px rgba(59, 130, 246, 0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative isolate flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-blue-400/50 bg-blue-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_5px_0_rgba(30,64,175,0.7),0_10px_16px_rgba(0,0,0,0.35)] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_0_rgba(30,64,175,0.75),0_5px_10px_rgba(0,0,0,0.32)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-b from-blue-300/22 via-blue-500/10 to-black/35" />
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                </motion.button>
                <div>
                  <h4 className="text-[14px] font-bold text-white uppercase tracking-widest leading-tight">
                    DOOM PROTOCOL
                  </h4>
                  <p className="text-[15px] text-slate-500 font-mono">
                    {t('level')} {privatePoliceLevel} / 6
                  </p>
                </div>
              </div>
              <PremiumCanvasButton
                onClick={() => {
                  if (canUpgradePrivatePolice) {
                    dispatch({ type: 'SPEND_QC', payload: { amount: privatePoliceCost } });
                    dispatch({ type: 'UPGRADE_PRIVATE_POLICE' });
                    playSfx('police_sirene_1');
                    addLog(t('privatePoliceUpgraded'), 'success');
                  }
                }}
                disabled={!canUpgradePrivatePolice}
                tone={canUpgradePrivatePolice ? 'blue' : 'steel'}
                className={`h-10 min-w-[162px] px-5 text-[14px] font-bold ${
                  canUpgradePrivatePolice 
                  ? 'text-blue-50 shadow-[0_6px_0_rgba(30,64,175,0.65),0_12px_18px_rgba(0,0,0,0.3)] hover:brightness-110 active:shadow-[0_3px_0_rgba(30,64,175,0.72),0_6px_10px_rgba(0,0,0,0.28)]' 
                  : 'text-slate-500'
                }`}
              >
                {privatePoliceLevel < 6 
                  ? `${t('upgrade')} (${formatValue(privatePoliceCost)})`
                  : t('max')}
              </PremiumCanvasButton>
            </div>

          </div>

          {privatePoliceLevel > 0 && (
            <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden flex flex-col justify-center items-center`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center`}>
                    <FastForward className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white uppercase tracking-widest leading-tight">
                      {t('skipBattles')}
                    </h4>
                    <p className="text-[15px] text-slate-500 font-mono">
                      {t('skipRandomBattles')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleAutoSkipRandomBattles}
                  className={`relative h-6 w-12 rounded-full border transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),0_4px_0_rgba(0,0,0,0.35),0_8px_12px_rgba(0,0,0,0.25)] active:translate-y-[1px] ${autoSkipRandomBattles ? 'border-orange-300/70 bg-gradient-to-b from-orange-400 to-orange-700' : 'border-slate-400/25 bg-gradient-to-b from-slate-600 to-slate-900'}`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-gradient-to-b from-white to-slate-300 shadow-[0_1px_5px_rgba(0,0,0,0.55)] transition-all duration-300 ${autoSkipRandomBattles ? 'left-7' : 'left-1'}`} />
                </button>
                <div className="min-w-[86px] text-right">
                  <div className="text-[9px] font-orbitron font-bold uppercase tracking-widest text-slate-500">
                    {language === 'pt' ? 'Vitória' : 'Victory'}
                  </div>
                  <div className="text-[15px] font-mono font-black text-orange-300 leading-none">
                    {autoSkipWinChance}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4 h-full">
          <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden group`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center ${themeGlow}`}>
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${themeText} leading-tight`}>
                    {t('battleLevel')} {battleLevel}
                  </h3>
                  <p className="text-slate-400 text-[14px]">
                    {t('combatProficiency')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <div className="text-base font-bold text-slate-500 uppercase tracking-widest">
                    {t('nextLevel')}
                  </div>
                  <div className="text-base font-bold text-white">
                    {battleLevel < (routeTier === 'Solar' ? 25 : 55) ? `${formatValue(upgradeCost)} QC` : t('max')}
                  </div>
                </div>
                <PremiumCanvasButton
                  onClick={upgradeBattleLevel}
                  disabled={!canUpgrade}
                  tone={canUpgrade ? 'purple' : 'steel'}
                  className={`h-11 min-w-[142px] px-6 text-[14px] font-bold ${
                    canUpgrade 
                    ? 'text-purple-50 shadow-[0_6px_0_rgba(88,28,135,0.65),0_12px_18px_rgba(0,0,0,0.3)] hover:brightness-110 active:shadow-[0_3px_0_rgba(88,28,135,0.72),0_6px_10px_rgba(0,0,0,0.28)]' 
                    : 'text-slate-500'
                  }`}
                  contentClassName="gap-2"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  {language === 'pt' ? 'Melhorar' : 'Upgrade'}
                </PremiumCanvasButton>
              </div>
            </div>
          </div>

          <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden flex-1 flex flex-col`}>
            <h4 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              {language === 'pt' ? 'Recompensas de Nível' : 'Level Rewards'}
            </h4>
            
            <div className="grid grid-cols-3 gap-3 flex-1">
              {(routeTier === 'Solar' ? [
                { level: 1, title: language === 'pt' ? 'Busca' : 'Search', description: language === 'pt' ? 'Você desbloqueou o modo radar, vá buscar batalhas, receber recursos e QC em caso de vitória, mas cuidado, podem vir naves poderosas, esteja preparado!' : 'You unlocked radar mode, go search for battles, receive resources and QC in case of victory, but be careful, powerful ships may come, be prepared!', color: 'emerald' },
                { level: 5, title: language === 'pt' ? '-50% Rad' : '-50% Rad', description: language === 'pt' ? 'Parabéns, agora você pode procurar batalha de 30 em 30 segundos. -50% de tempo do radar!' : 'Congratulations, now you can search for battles every 30 seconds. -50% radar time!', color: 'emerald' },
                { level: 10, title: language === 'pt' ? '100% QC' : '100% QC', description: language === 'pt' ? 'Parabéns, você irá receber 100% a mais de QC como recompensa das batalhas vencidas! +100% de QC!' : 'Congratulations, you will receive 100% more QC as a reward for won battles! +100% QC!', color: 'emerald' },
                { level: 15, title: language === 'pt' ? '+10% Boss' : '+10% Boss', description: language === 'pt' ? 'Parabéns, agora você poderá encontrar batalhas de chefe mais facilmente! +10% de chance de encontrar Boss!' : 'Congratulations, now you can find boss battles more easily! +10% chance to find Boss!', color: 'emerald' },
                 { level: 20, title: language === 'pt' ? '+50% Dmg' : '+50% Dmg', description: language === 'pt' ? 'Parabéns, você ganhou um aumento de 50% total de dano! +50% de dano!' : 'Congratulations, you gained a 50% total damage increase in all skills! +50% damage!', color: 'emerald' },
                { level: 25, title: language === 'pt' ? 'Skyring' : 'Skyring', description: language === 'pt' ? 'Parabéns, você ganhou a nave "Skyring". Ela tem 25% a mais de dano, 25% a mais de vida e todas as recargas de habilidades são de 1 segundo!' : 'Congratulations, you gained the "Skyring" ship. It has 25% more damage, 25% more life and all skill cooldowns are 1 second!', color: 'emerald' }
              ] : [
                { level: 30, title: language === 'pt' ? 'Retribuição' : 'Retribution', description: language === 'pt' ? 'Parabéns! Suas habilidades de combate agora garantem 25% a mais de QC em todas as batalhas.' : 'Congratulations! Your combat skills now grant 25% more QC in all battles.', color: 'purple', toggleable: true },
                { level: 35, title: language === 'pt' ? 'Encrenqueiro' : 'Troublemaker', description: language === 'pt' ? 'Aumenta em 50% a frequência das batalhas aleatórias e em 100% o QC adquirido nas vitórias.' : 'Increases random battle frequency by 50% and QC acquired in victories by 100%.', color: 'purple' },
                { level: 40, title: 'Why, so?', description: language === 'pt' ? 'Aumenta em 5x o valor adquirido da aba Mineração no Capítulo 2.' : 'Increases the value acquired from the Mining tab in Chapter 2 by 5x.', color: 'purple' },
                { level: 45, title: language === 'pt' ? 'Missão Possível' : 'Mission Possible', description: language === 'pt' ? 'Aumenta a chance de vitória sobre BOSSES em 25% em todos os modos e aumenta em 50% todo os recursos da batalha contra os BOSSES.' : 'Increases win chance against BOSSES by 25% in all modes and increases all resources from BOSS battles by 50%.', color: 'purple' },
                { level: 50, title: language === 'pt' ? 'Fadiga' : 'Fatigue', description: language === 'pt' ? 'Sintetiza Etérion automaticamente no Reator Heliosingular quando a CCE estiver com nível crítico! Requer Tubos de Etérion Bruto. Pode ser desativado.' : 'Automatically synthesizes Etérion in the Heliosingular Reactor when CCE is at critical level! Requires Raw Etérion Tubes. Can be disabled.', color: 'purple', toggleable: true },
                { level: 55, title: 'Kombat Wortal', description: language === 'pt' ? 'Retira totalmente o tempo de espera do Radar, o jogador pode buscar batalhas sempre que quiser, porém deixará de ganhar Etérion nas recompensas, ganhando apenas QC.' : 'Completely removes Radar waiting time, the player can search for battles whenever they want, but will stop earning Etérion in rewards, earning only QC.', color: 'purple' }
              ]).map(reward => (
                <PremiumCanvasButton
                  key={reward.level} 
                  onClick={() => {
                    if (battleLevel >= reward.level) {
                      setSelectedReward(reward);
                      playSfx('ask_window');
                    }
                  }}
                  disabled={battleLevel < reward.level}
                  tone={battleLevel >= reward.level ? (routeTier === 'Solar' ? 'green' : 'purple') : 'steel'}
                  className={`h-full min-h-[100px] p-3 ${
                    battleLevel >= reward.level 
                    ? 'shadow-[0_5px_0_rgba(0,0,0,0.42),0_10px_14px_rgba(0,0,0,0.22)] hover:brightness-110 active:shadow-[0_2px_0_rgba(0,0,0,0.5),0_5px_9px_rgba(0,0,0,0.22)]' 
                    : 'text-slate-500'
                  }`}
                  contentClassName="flex-col gap-2"
                >
                  <div className={`text-base font-black ${battleLevel >= reward.level ? (routeTier === 'Solar' ? 'text-emerald-400' : 'text-purple-400') : 'text-slate-500'}`}>
                    LVL {reward.level}
                  </div>
                  <div className="text-[14px] font-bold text-white leading-tight text-center uppercase tracking-tighter h-6 flex items-center">
                    {reward.title}
                  </div>
                  {battleLevel >= reward.level && (
                    <div className={`w-2 h-2 rounded-full mt-1 shadow-lg ${routeTier === 'Solar' ? 'bg-emerald-400 shadow-emerald-500/50' : 'bg-purple-400 shadow-purple-500/50'}`} />
                  )}
                </PremiumCanvasButton>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-3 flex flex-col">
          <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden flex-1 flex flex-col`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md relative overflow-hidden group/title">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/title:translate-x-full transition-transform duration-1000" />
                    <h4 className="text-base font-bold text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      {language === 'pt' ? 'Status da Nave' : 'Ship Status'}
                    </h4>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-[15px] font-bold ${shipLevel >= (routeTier === 'Solar' ? 10 : 20) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/10 text-white border border-white/20'}`}>
                    {shipLevel >= (routeTier === 'Solar' ? 10 : 20) ? 'MAX LEVEL' : `LEVEL ${shipLevel}`}
                  </div>
                </div>
                
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="relative">
                    <div className="flex mb-1 items-center justify-between">
                      <span className="text-[15px] font-bold uppercase text-emerald-400">
                        {language === 'pt' ? 'Progresso de XP' : 'XP Progress'}
                      </span>
                      <span className="text-[15px] font-bold text-white">
                        {shipLevel >= (routeTier === 'Solar' ? 10 : 20) ? '---' : `${formatValue(shipXP)} / ${formatValue(shipLevel * 500)}`}
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 flex rounded-full bg-white/5 border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${shipLevel >= (routeTier === 'Solar' ? 10 : 20) ? 100 : (shipXP / (shipLevel * 500)) * 100}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                          shipLevel >= (routeTier === 'Solar' ? 10 : 20) ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center h-12">
                      <div className="text-[15px] font-bold text-slate-500 uppercase mb-0.5">{language === 'pt' ? 'Bônus QC' : 'QC Bonus'}</div>
                      <div className="text-base font-black text-emerald-400 leading-none">
                        +{shipLevel <= 10 ? shipLevel * 10 : 100 + (shipLevel - 10) * 20}%
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center h-12">
                      <div className="text-[15px] font-bold text-slate-500 uppercase mb-0.5">{language === 'pt' ? 'Bônus Etérion' : 'Aetherion Bonus'}</div>
                      <div className="text-base font-black text-orange-400 leading-none">
                        +{shipLevel <= 10 ? shipLevel * 5 : 50 + (shipLevel - 10) * 10}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex flex-col h-full">
                <div className="flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md self-start relative overflow-hidden group/title">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/title:translate-x-full transition-transform duration-1000" />
                  <h4 className="text-base font-bold text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
                    <Sword className="w-4 h-4 text-red-400" />
                    {language === 'pt' ? 'Status de Combate' : 'Combat Status'}
                  </h4>
                </div>
                
                <div className="flex-1 flex flex-col space-y-3">
                  {isInterstellar ? (
                    <>
                      <div className="mt-auto flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-3">
                          <motion.button
                            onClick={() => {
                              setShowCaptureInfo(true);
                              playSfx('open_window');
                            }}
                            animate={{ 
                              boxShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 10px rgba(249, 115, 22, 0.4)", "0 0 0px rgba(249, 115, 22, 0)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative isolate flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-orange-300/55 bg-orange-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_0_rgba(154,52,18,0.65),0_8px_12px_rgba(0,0,0,0.32)] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_0_rgba(154,52,18,0.72),0_4px_8px_rgba(0,0,0,0.3)]"
                          >
                            <span className="absolute inset-0 bg-gradient-to-b from-orange-300/24 via-orange-500/10 to-black/34" />
                            <Zap className="w-4 h-4 text-orange-400" />
                          </motion.button>
                          <div>
                            <span className="text-[15px] font-bold text-white uppercase tracking-wider block">{t('capture')}</span>
                            <span className="text-[14px] text-orange-400 font-mono">Lvl {captureLevel}/10</span>
                          </div>
                        </div>
                        <PremiumCanvasButton
                          onClick={() => {
                            if (canUpgradeCapture) {
                              dispatch({ type: 'SPEND_QC', payload: { amount: captureCost } });
                              dispatch({ type: 'UPGRADE_CAPTURE' });
                              playSfx('level_up');
                              addLog(t('captureUpgraded'), 'success');
                            }
                          }}
                          disabled={!canUpgradeCapture}
                          tone={canUpgradeCapture ? 'orange' : 'steel'}
                          className={`h-9 min-w-[112px] px-4 text-base font-bold ${
                            canUpgradeCapture 
                            ? 'text-orange-50 shadow-[0_5px_0_rgba(154,52,18,0.6),0_10px_14px_rgba(0,0,0,0.28)] hover:brightness-110 active:shadow-[0_2px_0_rgba(154,52,18,0.68),0_5px_8px_rgba(0,0,0,0.24)]' 
                            : 'text-slate-500'
                          }`}
                        >
                          {captureLevel < 10 ? `${formatValue(captureCost)} QC` : t('max')}
                        </PremiumCanvasButton>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center h-12">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[15px] font-bold uppercase mb-0.5">
                            <Shield className="w-3 h-3 text-blue-400" />
                            {language === 'pt' ? 'Vida' : 'HP'}
                          </div>
                          <div className="text-base font-black text-white leading-none">
                            {Math.floor((100 + (battleLevel * 150)) * (battleLevel >= 25 ? 1.25 : 1))}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center h-12">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[15px] font-bold uppercase mb-0.5">
                            <Sword className="w-3 h-3 text-red-400" />
                            {language === 'pt' ? 'Dano' : 'ATK'}
                          </div>
                          <div className="text-base font-black text-white leading-none">
                            {battleLevel >= 25 ? '+125%' : (battleLevel >= 20 ? '+50%' : `+${battleLevel * 5}%`)}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center h-12">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[15px] font-bold uppercase mb-0.5">
                          <Shield className="w-3 h-3 text-blue-400" />
                          {language === 'pt' ? 'Vida' : 'HP'}
                        </div>
                        <div className="text-base font-black text-white leading-none">
                          {Math.floor((100 + (battleLevel * 150)) * (battleLevel >= 25 ? 1.25 : 1))}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center h-12">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[15px] font-bold uppercase mb-0.5">
                          <Sword className="w-3 h-3 text-red-400" />
                          {language === 'pt' ? 'Dano' : 'ATK'}
                        </div>
                        <div className="text-base font-black text-white leading-none">
                          {battleLevel >= 25 ? '+125%' : (battleLevel >= 20 ? '+50%' : `+${battleLevel * 5}%`)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default BattleLevelTab;

