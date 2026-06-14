'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Trees, 
  Factory, 
  School, 
  Music, 
  Shield, 
  Utensils, 
  Bot, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Sparkles,
  LockKeyhole,
  BadgeCheck,
  Activity,
  Gamepad2,
  X,
  Coins,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GameStorage } from '@/lib/game-storage';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import { preloadAssetGroupPassive } from '@/lib/asset-preloader';
import NewEarthDefenseBattle, { BattleResultSummary } from './NewEarthDefenseBattle';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';
import {
  BATTLE_CARD_SLOTS,
  BATTLE_STAT_CONFIG,
  BASE_HORIZON_LEVEL_CAP,
  BASE_BATTLE_SHIP_STATS,
  COLONY_CARD_CATALOG,
  ColonyCardLevels,
  DEFAULT_COLONY_SECTORS,
  DEFAULT_OWNED_COLONY_CARD_IDS,
  POLITICAL_CARD_SLOTS,
  SECTOR_CONFIG,
  BattleCardSlot,
  ColonyCard,
  ColonyCardSlot,
  ColonySectorId,
  getCardById,
  getBattleEffects,
  getBattleCardElementTypes,
  getCardBackgroundImage,
  getCardClass,
  getCardLevel,
  getCardModalBackgroundImage,
  getHorizonLevelFromXp,
  MAX_HORIZON_LEVEL,
  getCardStyle,
  getPoliticalEffects,
  getPoliticalPassiveBonuses,
  getOwnedArcadeIdsFromCards,
  calculateBattleShipStats,
  calculateBattleStatTotals,
  canEquipBattleCardWithElementRule,
  isBattleCard,
  isPoliticalCard,
  normalizeOwnedColonyCardIds,
  rollAnyMissingColonyCardReward,
  TRINITY_REACTOR_CARD_ID,
} from '@/lib/colony-cards';
import {
  NEW_EARTH_MISSIONS_STORAGE_KEY,
  NewEarthMissionState,
  createDefaultNewEarthMissionState,
  markNewEarthMissionCycleRewardClaimed,
  markNewEarthMissionClaimed,
  normalizeNewEarthMissionState,
  refreshNewEarthMissionBoard,
  recordNewEarthMissionEvent,
} from '@/lib/new-earth-missions';

// --- Types ---

export type ConstructionType = 'forest' | 'factory' | 'school' | 'culture' | 'defense' | 'restaurant';
type ColonySupplyId = 'materials' | 'biomass' | 'tech' | 'defense' | 'food' | 'meds';
type ColonySupplies = Record<ColonySupplyId, number>;
type ColonySearchId = 'land' | 'sea' | 'air';
type ColonyExpeditionId = Exclude<ColonySearchId, 'air'>;
type ActiveColonySearches = Record<string, ActiveColonySearch>;
type SearchThreatBonus = Record<ColonyExpeditionId, number>;
type SearchUpgradeLevels = Record<ColonyExpeditionId, number>;
type BattleLoadout = Partial<Record<BattleCardSlot, string>>;
type DefenseSpecialId = 'apocalypse-laser' | 'hellfire-barrage' | 'thor-oath' | 'special-slot-4';
type SearchBattleCycleState = {
  nextBattleIndex: number;
  cycle: number;
};
type ActiveSearchBattle = {
  battleIndex: number;
  searchId: ColonyExpeditionId;
  slotIndex: number;
  title: string;
};

const BATTLE_CARD_CODEX_PAGE_SIZE = 6;
const MAX_SEARCH_UPGRADE_LEVEL = 5;
const MAX_PARALLEL_SEARCHES_PER_TYPE = 3;
const SEARCH_BATTLE_TOTAL = 6;
const SEARCH_BATTLE_QC_REWARDS = [250000, 320000, 390000, 470000, 540000, 600000];
const SEARCH_BATTLE_FINAL_QC_REWARD = 5000000;
const SEARCH_BATTLE_CARD_CHANCE = 0.3;
const SEARCH_BATTLE_SENTIMENT_SECTORS: ColonySectorId[] = ['happiness', 'health', 'economy', 'security', 'technology', 'culture'];
const DEFAULT_SEARCH_BATTLE_CYCLE: SearchBattleCycleState = { nextBattleIndex: 0, cycle: 0 };
const SEARCH_THREAT_TRIGGER_MIN_PROGRESS = 0.2;
const SEARCH_THREAT_TRIGGER_MAX_PROGRESS = 0.9;
const SEARCH_UPGRADE_RESOURCE_BONUS = 15;
const SEARCH_UPGRADE_THREAT_BONUS = 5;
const DEFAULT_SEARCH_UPGRADE_LEVELS: SearchUpgradeLevels = { land: 0, sea: 0 };
const getSearchSlotKey = (id: ColonyExpeditionId, slotIndex: number) => `${id}-${slotIndex}`;
const getSearchBattleIndex = (id: ColonyExpeditionId, slotIndex: number) => (
  id === 'land' ? slotIndex : MAX_PARALLEL_SEARCHES_PER_TYPE + slotIndex
);
const normalizeSearchBattleCycle = (saved: any): SearchBattleCycleState => {
  const nextBattleIndex = Math.max(0, Math.min(SEARCH_BATTLE_TOTAL - 1, Math.floor(Number(saved?.nextBattleIndex) || 0)));
  const cycle = Math.max(0, Math.floor(Number(saved?.cycle) || 0));
  return { nextBattleIndex, cycle };
};
const SEARCH_SLOT_STYLES = [
  'border-cyan-300/35 bg-cyan-300/10 text-cyan-100 hover:border-cyan-200/70 hover:bg-cyan-300 hover:text-black',
  'border-emerald-300/35 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/70 hover:bg-emerald-300 hover:text-black',
  'border-amber-300/35 bg-amber-300/10 text-amber-100 hover:border-amber-200/70 hover:bg-amber-300 hover:text-black',
];
const ROUTE4_LAYOUT_BACKGROUNDS = {
  searchLand: '/assets/rota4/layout_cap4/searc_land_background.webp',
  searchSea: '/assets/rota4/layout_cap4/search_sea_background.webp',
  hangar: '/assets/rota4/layout_cap4/hangar_horizon.webp',
};
const BATTLE_SLOT_LABEL: Record<BattleCardSlot, Record<'en' | 'pt', string>> = {
  weapon: { en: 'Weapon', pt: 'Arma' },
  armor: { en: 'Armor', pt: 'Blindagem' },
  core: { en: 'Core', pt: 'Núcleo' },
  tactic: { en: 'Tactic', pt: 'Tática' },
  auxiliary: { en: 'Auxiliary', pt: 'Auxiliar' },
  protocol: { en: 'Protocol', pt: 'Protocolo' },
};

interface ActiveColonySearch {
  id: ColonyExpeditionId;
  searchKey: string;
  slotIndex: number;
  title: string;
  subtitle: string;
  rewards: Partial<ColonySupplies>;
  threatChance: number;
  startedAt: number;
  endsAt: number;
  threatCheckAt: number;
  threatCheckedAt?: number;
  threatTriggeredAt?: number;
  rewardResolved?: boolean;
}

interface ColonySearchOption {
  id: ColonyExpeditionId;
  title: string;
  subtitle: string;
  description: string;
  tone: string;
  icon: any;
  durationSeconds: number;
  threatChance: number;
  rewards: Partial<ColonySupplies>;
  upgradeLevel: number;
  upgradeCost: number;
  resourceBonusPercent: number;
  upgradeThreatBonus: number;
}

const getMiniBattleCardStyle = (card: ColonyCard, equipped: boolean) => {
  const styles: Record<string, string> = {
    common: equipped
      ? 'border-zinc-200/55 bg-zinc-200/12 shadow-[0_0_18px_rgba(228,228,231,0.08)]'
      : 'border-zinc-400/28 bg-zinc-500/10 hover:border-zinc-200/55',
    rare: equipped
      ? 'border-cyan-300/55 bg-cyan-300/12 shadow-[0_0_18px_rgba(34,211,238,0.12)]'
      : 'border-cyan-300/28 bg-cyan-300/10 hover:border-cyan-200/55',
    epic: equipped
      ? 'border-violet-300/60 bg-violet-300/14 shadow-[0_0_20px_rgba(167,139,250,0.15)]'
      : 'border-violet-300/30 bg-violet-400/10 hover:border-violet-200/60',
    legendary: equipped
      ? 'border-amber-300/60 bg-amber-300/14 shadow-[0_0_22px_rgba(251,191,36,0.16)]'
      : 'border-amber-300/32 bg-amber-300/10 hover:border-amber-200/60',
    mythic: equipped
      ? 'border-rose-200/70 bg-rose-300/16 shadow-[0_0_24px_rgba(244,114,182,0.2)]'
      : 'border-rose-200/40 bg-rose-300/12 hover:border-rose-100/70',
  };

  return styles[card.rarity] || styles.common;
};

const getBattleCardButtonTone = (card?: ColonyCard | null) => {
  if (!card) return 'steel';
  const tones: Record<string, 'steel' | 'cyan' | 'purple' | 'orange' | 'red'> = {
    common: 'steel',
    rare: 'cyan',
    epic: 'purple',
    legendary: 'orange',
    mythic: 'red',
  };
  return tones[card.rarity] || 'steel';
};

const getBattleCardTextTone = (card?: ColonyCard | null) => {
  if (!card) return 'text-zinc-500';
  const tones: Record<string, string> = {
    common: 'text-zinc-200/75',
    rare: 'text-cyan-100/80',
    epic: 'text-violet-100/80',
    legendary: 'text-orange-100/80',
    mythic: 'text-rose-100/80',
  };
  return tones[card.rarity] || 'text-zinc-200/75';
};

const DEFENSE_SPECIAL_BUTTON_SELECTED_CLASS = 'border-amber-400/80 bg-gradient-to-br from-amber-600/34 via-stone-950/92 to-yellow-800/22 shadow-[0_0_28px_rgba(217,119,6,0.42)] ring-1 ring-amber-200/75';
const DEFENSE_SPECIAL_BUTTON_UNSELECTED_CLASS = 'border-stone-500/35 bg-gradient-to-br from-stone-800/18 via-zinc-950/92 to-amber-950/10 opacity-70 saturate-50 shadow-[0_0_12px_rgba(68,64,60,0.24)]';

interface DefenseSpecial {
  id: DefenseSpecialId;
  name: Record<'en' | 'pt', string>;
  description: Record<'en' | 'pt', string>;
  implemented: boolean;
}

interface PendingDefenseThreat {
  id: string;
  sourceSearchId: ColonyExpeditionId;
  sourceSearchKey?: string;
  sourceTitle: string;
  rewards?: Partial<ColonySupplies>;
  threatChance: number;
  detectedAt: number;
  expiresAt?: number;
  openedAt?: number;
  status: 'pending';
}

const MAX_PENDING_DEFENSE_THREATS = 6;
const DEFENSE_THREAT_RESPONSE_SECONDS = 50;
const DEFENSE_VICTORY_REWARD_BONUS_PERCENT = 30;
const ROUTE4_SEARCH_SFX_BASE = '/assets/rota4/SFX_new_land';
const ROUTE4_COLONIES_TAB_SFX = `${ROUTE4_SEARCH_SFX_BASE}/aba_colonys_click.ogg`;
const ROUTE4_ROBOTS_50_SFX = `${ROUTE4_SEARCH_SFX_BASE}/50_robots.ogg`;
const ROUTE4_ROBOTS_250_SFX = `${ROUTE4_SEARCH_SFX_BASE}/250_robots.ogg`;
const ROUTE4_HANGAR_OPEN_SFX = `${ROUTE4_SEARCH_SFX_BASE}/hangar_open_door.ogg`;
const ROUTE4_HANGAR_CLOSE_SFX = `${ROUTE4_SEARCH_SFX_BASE}/hangar_close_door.ogg`;
const ROUTE4_QUEST_REWARD_SFX = `${ROUTE4_SEARCH_SFX_BASE}/quest_reward.ogg`;
const ROUTE4_QUESTS_RENEW_SFX = `${ROUTE4_SEARCH_SFX_BASE}/quests_renew.ogg`;
const ROUTE4_FINAL_MISSION_QC_BONUS_SFX = `${ROUTE4_SEARCH_SFX_BASE}/bonus_qc_final.ogg`;
const ROUTE4_SPECIAL_EQUIP_SFX = `${ROUTE4_SEARCH_SFX_BASE}/equip_special.ogg`;
const ROUTE4_SPECIAL_UNEQUIP_SFX = `${ROUTE4_SEARCH_SFX_BASE}/unequip_special.ogg`;
const ROUTE4_CANT_EQUIP_SFX = `${ROUTE4_SEARCH_SFX_BASE}/cant_equip.ogg`;
const NEW_EARTH_MISSION_COMPLETE_SFX_COUNT = 10;
const BOBBY_BLUE_WARNING_SFX_COUNT = 9;
const BOBBY_BLUE_PREPARE_FOR_BATTLE_SFX_COUNT = 7;
const HORIZON_LEVEL_UP_SFX = '/assets/rota4/battles/player/horizon/horizon_level_up.ogg';
const route4SearchSfxCache = new Map<string, HTMLAudioElement>();
const route4BattleSfxCache = new Map<string, HTMLAudioElement>();
let activePrepareForBattleSfx: HTMLAudioElement | null = null;

type NewEarthMissionCycleBonusAnimation = {
  cycle: number;
  bonus: number;
  displayBonus: number;
  draining: boolean;
  revealed: boolean;
} | null;

const playRoute4SearchSfx = (id: ColonyExpeditionId, slotIndex: number) => {
  if (typeof Audio === 'undefined') return;
  const prefix = id === 'land' ? 'start_truck' : 'start_airplane';
  const src = `${ROUTE4_SEARCH_SFX_BASE}/${prefix}_${slotIndex + 1}.ogg`;
  let audio = route4SearchSfxCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    route4SearchSfxCache.set(src, audio);
  }
  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.volume = 0.68;
  instance.play().catch(() => {});
};

const playRoute4UiSfx = (src: string, volume = 0.68) => {
  if (typeof Audio === 'undefined') return;
  let audio = route4SearchSfxCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    route4SearchSfxCache.set(src, audio);
  }
  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.volume = volume;
  instance.play().catch(() => {});
};

const playRandomBobbyBlueWarningSfx = () => {
  const randomWarningIndex = Math.floor(Math.random() * BOBBY_BLUE_WARNING_SFX_COUNT) + 1;
  playRoute4UiSfx(`/audio/sfx/bobby_blue/warnings/warning_${randomWarningIndex}.ogg`, 0.8);
};

const playRandomBobbyBluePrepareForBattleSfx = () => {
  if (typeof Audio === 'undefined') return;
  if (activePrepareForBattleSfx && !activePrepareForBattleSfx.paused) return;

  const randomIndex = Math.floor(Math.random() * BOBBY_BLUE_PREPARE_FOR_BATTLE_SFX_COUNT) + 1;
  const src = `/audio/sfx/bobby_blue/prepare_for_battle/${randomIndex}_prepare_for_battle.ogg`;
  let audio = route4BattleSfxCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    route4BattleSfxCache.set(src, audio);
  }

  audio.currentTime = 0;
  audio.volume = 0.82;
  activePrepareForBattleSfx = audio;
  audio.onended = () => {
    if (activePrepareForBattleSfx === audio) activePrepareForBattleSfx = null;
  };
  audio.onerror = () => {
    if (activePrepareForBattleSfx === audio) activePrepareForBattleSfx = null;
  };
  audio.play().catch(() => {
    if (activePrepareForBattleSfx === audio) activePrepareForBattleSfx = null;
  });
};

const playRoute4BattleSfx = (src: string, volume = 0.74) => {
  if (typeof Audio === 'undefined') return;
  let audio = route4BattleSfxCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    route4BattleSfxCache.set(src, audio);
  }
  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.volume = volume;
  instance.play().catch(() => {});
};

export interface Construction {
  id: string;
  type: ConstructionType;
  level: number;
  progress: number; // 0 to 100
  assignedConstructors: number;
  isComplete: boolean;
  order: number; // Track which one was built first
  lastProgressAt?: number;
}

export interface Colony {
  id: string;
  name: string;
  population: number;
  maxPopulation: number;
  constructors: number; // Total available constructors
  constructions: Construction[];
  sectors: Record<ColonySectorId, number>;
  equippedCards: Partial<Record<ColonyCardSlot, string>>;
  isHabitable: boolean;
  age: number; // Years passed
}

export interface ColonySystemProps {
  language: 'en' | 'pt';
  onAddYear: (years: number) => void;
  onTabStatusChange: (isOpen: boolean) => void;
  earthPopulation: number;
  setEarthPopulation: React.Dispatch<React.SetStateAction<number>>;
  colonies: Colony[];
  setColonies: React.Dispatch<React.SetStateAction<Colony[]>>;
  historyStats?: Record<string, any>;
  unlockedAchievements?: string[];
  playSfx?: (type: string, config?: any) => void;
  onBuildingComplete?: (type: ConstructionType, level: number) => void;
  qc?: number;
  onEarnQC?: (amount: number, source?: 'battle' | 'mission') => void;
  onSpendQC?: (amount: number) => void;
  onDefenseThreatAlertChange?: (alert: { title: string; remainingSeconds: number } | null) => void;
  openDefenseRequest?: number;
  abandonDefenseRequest?: number;
  defenseAlertsPaused?: boolean;
  formatValue?: (value: number) => string;
  selectedColonyId?: string;
  setSelectedColonyId?: (id: string) => void;
}

// --- Configuration ---

const CONSTRUCTION_CONFIG: Record<ConstructionType, { 
  label: Record<'en' | 'pt', string>, 
  icon: any, 
  maxUnits: number,
  baseTime: number, // Base seconds at 1 constructor
  color: string,
  shadowColor: string
}> = {
  forest: { 
    label: { en: 'Natural Forests', pt: 'Florestas Naturais' }, 
    icon: Trees, 
    maxUnits: 10, 
    baseTime: 400,
    color: 'emerald',
    shadowColor: 'rgba(16, 185, 129, 0.5)'
  },
  factory: { 
    label: { en: 'General Factories', pt: 'Fábricas Gerais' }, 
    icon: Factory, 
    maxUnits: 10, 
    baseTime: 600,
    color: 'zinc',
    shadowColor: 'rgba(161, 161, 170, 0.5)'
  },
  school: { 
    label: { en: 'Schools', pt: 'Escolas' }, 
    icon: School, 
    maxUnits: 10, 
    baseTime: 500,
    color: 'yellow',
    shadowColor: 'rgba(234, 179, 8, 0.5)'
  },
  culture: { 
    label: { en: 'Cultural Spaces', pt: 'Espaço Cultural' }, 
    icon: Music, 
    maxUnits: 10, 
    baseTime: 550,
    color: 'blue',
    shadowColor: 'rgba(59, 130, 246, 0.5)'
  },
  defense: { 
    label: { en: 'Public Defense', pt: 'Defensoria Pública' }, 
    icon: Shield, 
    maxUnits: 10, 
    baseTime: 700,
    color: 'red',
    shadowColor: 'rgba(239, 68, 68, 0.5)'
  },
  restaurant: { 
    label: { en: 'Restaurants', pt: 'Restaurantes' }, 
    icon: Utensils, 
    maxUnits: 10, 
    baseTime: 450,
    color: 'restaurant-mix',
    shadowColor: 'rgba(16, 185, 129, 0.5)'
  },
};

const INITIAL_CONSTRUCTORS = 500;
const INITIAL_POP_CAPACITY = 10000;

const DEFAULT_COLONY_SUPPLIES: ColonySupplies = {
  materials: 500,
  biomass: 500,
  tech: 500,
  defense: 500,
  food: 500,
  meds: 500,
};

const DEFAULT_SEARCH_THREAT_BONUS: SearchThreatBonus = {
  land: 0,
  sea: 0,
};

const SEARCH_THREAT_BONUS_STEP = 15;
const LEGENDARY_BATTLE_CARD_PITY_STEP = 3;
const getSearchUpgradeCost = (level: number) => (level >= MAX_SEARCH_UPGRADE_LEVEL ? 0 : 30000 * (level + 1));
const getSearchThreatCheckAt = (startedAt: number, endsAt: number, random = Math.random) => {
  const duration = Math.max(0, endsAt - startedAt);
  if (duration <= 0) return endsAt;
  const progress = SEARCH_THREAT_TRIGGER_MIN_PROGRESS + random() * (SEARCH_THREAT_TRIGGER_MAX_PROGRESS - SEARCH_THREAT_TRIGGER_MIN_PROGRESS);
  return Math.round(startedAt + duration * progress);
};
const applySearchUpgradeRewards = (rewards: Partial<ColonySupplies>, level: number): Partial<ColonySupplies> => {
  const multiplier = 1 + (Math.max(0, Math.min(MAX_SEARCH_UPGRADE_LEVEL, level)) * SEARCH_UPGRADE_RESOURCE_BONUS) / 100;
  return (Object.entries(rewards) as Array<[ColonySupplyId, number]>).reduce((acc, [key, value]) => {
    acc[key] = Math.max(1, Math.round(value * multiplier));
    return acc;
  }, {} as Partial<ColonySupplies>);
};
const scaleSupplyRewards = (rewards: Partial<ColonySupplies>, multiplier: number): Partial<ColonySupplies> => {
  return (Object.entries(rewards) as Array<[ColonySupplyId, number]>).reduce((acc, [key, value]) => {
    acc[key] = Math.max(1, Math.round(value * multiplier));
    return acc;
  }, {} as Partial<ColonySupplies>);
};

const getFreePoliticalSlot = (equippedCards: Partial<Record<ColonyCardSlot, string>> = {}) => (
  POLITICAL_CARD_SLOTS.find(slot => !equippedCards[slot])
);

const SUPPLY_CONFIG: Record<ColonySupplyId, {
  label: Record<'en' | 'pt', string>;
  color: string;
  border: string;
}> = {
  materials: { label: { en: 'Materials', pt: 'Materiais' }, color: 'text-zinc-200', border: 'border-zinc-400/30 bg-zinc-400/10' },
  biomass: { label: { en: 'Biomass', pt: 'Biomassa' }, color: 'text-emerald-300', border: 'border-emerald-400/30 bg-emerald-400/10' },
  tech: { label: { en: 'Tech Parts', pt: 'Peças Tec.' }, color: 'text-cyan-300', border: 'border-cyan-400/30 bg-cyan-400/10' },
  defense: { label: { en: 'Defense Cores', pt: 'Núcleos Def.' }, color: 'text-red-300', border: 'border-red-400/30 bg-red-400/10' },
  food: { label: { en: 'Food', pt: 'Comida' }, color: 'text-lime-300', border: 'border-lime-400/30 bg-lime-400/10' },
  meds: { label: { en: 'Medical Inputs', pt: 'Insumos Méd.' }, color: 'text-pink-300', border: 'border-pink-400/30 bg-pink-400/10' },
};

const CONSTRUCTION_SUPPLY_COST: Record<ConstructionType, Partial<ColonySupplies>> = {
  forest: { biomass: 4, materials: 2 },
  factory: { materials: 6, tech: 2 },
  school: { materials: 4, tech: 3 },
  culture: { materials: 3, biomass: 2, tech: 2 },
  defense: { materials: 4, tech: 2, defense: 3 },
  restaurant: { biomass: 5, materials: 2 },
};

const DEFENSE_SPECIALS: DefenseSpecial[] = [
  {
    id: 'apocalypse-laser',
    name: { en: 'Horizon Laser', pt: 'Horizon Laser' },
    description: {
      en: 'Route 4 special: a sustained Horizon beam for deleting priority threats.',
      pt: 'Especial da Rota 4: feixe sustentado Horizon para apagar ameaças prioritárias.',
    },
    implemented: true,
  },
  {
    id: 'hellfire-barrage',
    name: { en: 'Horizon Barrage', pt: 'Horizon Barrage' },
    description: {
      en: 'Route 4 special: a heavy Horizon barrage for pressure windows.',
      pt: 'Especial da Rota 4: barragem pesada Horizon para janelas de pressão.',
    },
    implemented: true,
  },
  {
    id: 'thor-oath',
    name: { en: 'Thor Oath', pt: 'Juramento de Thor' },
    description: {
      en: 'Route 4 special: a divine storm with tornados, lightning strikes, and a final thunderbolt.',
      pt: 'Especial da Rota 4: tempestade divina com tornados, raios e um trovão final.',
    },
    implemented: true,
  },
  {
    id: 'special-slot-4',
    name: { en: 'Blizzard', pt: 'Blizzard' },
    description: {
      en: 'Route 4 special: an ice storm that freezes the right flank and drops explosive glacier blocks.',
      pt: 'Especial da Rota 4: nevasca que congela o flanco direito e derruba blocos glaciais explosivos.',
    },
    implemented: true,
  },
];

const canPaySupplies = (stock: ColonySupplies, cost: Partial<ColonySupplies>, batches = 1) => (
  (Object.entries(cost) as Array<[ColonySupplyId, number]>).every(([key, value]) => stock[key] >= value * batches)
);

const getAffordableBatches = (stock: ColonySupplies, cost: Partial<ColonySupplies>, requestedBatches: number) => {
  const limits = (Object.entries(cost) as Array<[ColonySupplyId, number]>)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => Math.floor(stock[key] / value));

  return Math.max(0, Math.min(requestedBatches, ...limits));
};

const applySupplyDelta = (stock: ColonySupplies, delta: Partial<ColonySupplies>, multiplier = 1): ColonySupplies => {
  const next = { ...stock };
  (Object.entries(delta) as Array<[ColonySupplyId, number]>).forEach(([key, value]) => {
    next[key] = Math.max(0, next[key] + value * multiplier);
  });
  return next;
};

const createInitialConstructions = () => (
  (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).map((type, idx) => ({
    id: `const-${type}`,
    type,
    level: 0,
    progress: 0,
    assignedConstructors: 0,
    isComplete: false,
    order: idx,
    lastProgressAt: undefined,
  }))
);

const isColonyReadyForPopulation = (constructions: Construction[] = []) => (
  (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).every(type => (
    constructions.some(construction => (
      construction.type === type &&
      (construction.isComplete || construction.level >= 10)
    ))
  ))
);

const COLONY_BLUEPRINTS: Array<{
  id: string;
  name: Record<'en' | 'pt', string>;
  sectors: Record<ColonySectorId, number>;
}> = [
  {
    id: 'colony-1',
    name: { en: 'Genesis', pt: 'Genesis' },
    sectors: DEFAULT_COLONY_SECTORS,
  },
  {
    id: 'colony-2',
    name: { en: 'Eden', pt: 'Eden' },
    sectors: { happiness: 42, health: 44, economy: 52, security: 48, technology: 38, culture: 36 },
  },
  {
    id: 'colony-3',
    name: { en: 'Elysium', pt: 'Elysium' },
    sectors: { happiness: 34, health: 50, economy: 40, security: 56, technology: 46, culture: 42 },
  },
  {
    id: 'colony-4',
    name: { en: 'Gaia', pt: 'Gaia' },
    sectors: { happiness: 48, health: 36, economy: 44, security: 40, technology: 58, culture: 50 },
  },
];

const COLONY_COMPLETION_BACKGROUNDS: Record<string, Partial<Record<ConstructionType, string>>> = {
  'colony-1': {
    forest: '/assets/rota4/colonys/genesis/genesis_forest.webp',
    factory: '/assets/rota4/colonys/genesis/genesis_factory.webp',
    school: '/assets/rota4/colonys/genesis/genesis_school.webp',
    culture: '/assets/rota4/colonys/genesis/genesis_theater.webp',
    defense: '/assets/rota4/colonys/genesis/genesis_police.webp',
    restaurant: '/assets/rota4/colonys/genesis/genesis_restaurant.webp',
  },
  'colony-2': {
    forest: '/assets/rota4/colonys/eden/eden_forest.webp',
    factory: '/assets/rota4/colonys/eden/eden_factory.webp',
    school: '/assets/rota4/colonys/eden/eden_school.webp',
    culture: '/assets/rota4/colonys/eden/eden_theater.webp',
    defense: '/assets/rota4/colonys/eden/eden_police.webp',
    restaurant: '/assets/rota4/colonys/eden/eden_restaurant.webp',
  },
  'colony-3': {
    forest: '/assets/rota4/colonys/elysium/elysium_forest.webp',
    factory: '/assets/rota4/colonys/elysium/elysium_factory.webp',
    school: '/assets/rota4/colonys/elysium/elysium_school.webp',
    culture: '/assets/rota4/colonys/elysium/elysium_theater.webp',
    defense: '/assets/rota4/colonys/elysium/elysium_police.webp',
    restaurant: '/assets/rota4/colonys/elysium/elysium_restaurant.webp',
  },
  'colony-4': {
    forest: '/assets/rota4/colonys/gaia/gaia_forest.webp',
    factory: '/assets/rota4/colonys/gaia/gaia_factory.webp',
    school: '/assets/rota4/colonys/gaia/gaia_school.webp',
    culture: '/assets/rota4/colonys/gaia/gaia_theater.webp',
    defense: '/assets/rota4/colonys/gaia/gaia_police.webp',
    restaurant: '/assets/rota4/colonys/gaia/gaia_restaurant.webp',
  },
};

const COLONY_STATUS_BACKGROUNDS: Record<string, { colony: string; constructors: string; population: string }> = {
  'colony-1': {
    colony: '/assets/rota4/colonys/genesis/1genesis_colony.webp',
    constructors: '/assets/rota4/colonys/genesis/2genesis_constructors.webp',
    population: '/assets/rota4/colonys/genesis/3genesis_population.webp',
  },
  'colony-2': {
    colony: '/assets/rota4/colonys/eden/1eden_colony.webp',
    constructors: '/assets/rota4/colonys/eden/2eden_constructors.webp',
    population: '/assets/rota4/colonys/eden/3eden_population.webp',
  },
  'colony-3': {
    colony: '/assets/rota4/colonys/elysium/1elysium_colony.webp',
    constructors: '/assets/rota4/colonys/elysium/2elysium_constructors.webp',
    population: '/assets/rota4/colonys/elysium/3elysium_population.webp',
  },
  'colony-4': {
    colony: '/assets/rota4/colonys/gaia/1gaia_colony.webp',
    constructors: '/assets/rota4/colonys/gaia/2gaia_constructors.webp',
    population: '/assets/rota4/colonys/gaia/3gaia_population.webp',
  },
};

const createColonyFromBlueprint = (blueprint: typeof COLONY_BLUEPRINTS[number], language: 'en' | 'pt'): Colony => ({
  id: blueprint.id,
  name: blueprint.name[language],
  population: 0,
  maxPopulation: INITIAL_POP_CAPACITY,
  constructors: INITIAL_CONSTRUCTORS,
  sectors: blueprint.sectors,
  equippedCards: {},
  constructions: createInitialConstructions(),
  isHabitable: false,
  age: 0,
});

const sanitizePoliticalEquippedCards = (equippedCards: Partial<Record<ColonyCardSlot, string>> = {}) => (
  POLITICAL_CARD_SLOTS.reduce((acc, slot) => {
    const card = getCardById(equippedCards[slot]);
    if (card && isPoliticalCard(card)) acc[slot] = card.id;
    return acc;
  }, {} as Partial<Record<ColonyCardSlot, string>>)
);

export const cleanColoniesData = (data: any, language: 'en' | 'pt'): Colony[] => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return COLONY_BLUEPRINTS.map(blueprint => createColonyFromBlueprint(blueprint, language));
  }

  const cleaned = data.map((col: Colony) => {
    const blueprint = COLONY_BLUEPRINTS.find(item => item.id === col.id);
    const uniqueTypes = new Set();
    const cleanConstructions: Construction[] = (col.constructions || []).filter(c => {
      if (CONSTRUCTION_CONFIG[c.type] && !uniqueTypes.has(c.type)) {
        uniqueTypes.add(c.type);
        return true;
      }
      return false;
    }).sort((a, b) => {
      const types = Object.keys(CONSTRUCTION_CONFIG);
      return types.indexOf(a.type) - types.indexOf(b.type);
    });
    
    // Ensure all 6 types are present
    const existingTypes = new Set(cleanConstructions.map(c => c.type));
    (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).forEach((type, idx) => {
       if (!existingTypes.has(type)) {
          cleanConstructions.push({
             id: `const-${type}`, // Stable ID
             type,
             level: 0,
             progress: 0,
             assignedConstructors: 0,
             isComplete: false,
             order: idx,
             lastProgressAt: undefined
          });
       }
    });

    // Final fix: Ensure isComplete reflects level >= 10
    const finalConstructions: Construction[] = cleanConstructions.map(c => ({
      ...c,
      isComplete: c.level >= 10,
      assignedConstructors: c.level >= 10 ? 0 : c.assignedConstructors,
      lastProgressAt: c.level >= 10 || c.assignedConstructors <= 0 ? undefined : (Number(c.lastProgressAt) || Date.now())
    }));

    const sectors = {
      ...DEFAULT_COLONY_SECTORS,
      ...(col.sectors || {}),
    };

    return {
      ...col,
      name: blueprint ? blueprint.name[language] : col.name,
      sectors,
      equippedCards: sanitizePoliticalEquippedCards(col.equippedCards || {}),
      constructions: finalConstructions.sort((a, b) => a.order - b.order),
      isHabitable: isColonyReadyForPopulation(finalConstructions),
    };
  });

  const existingIds = new Set(cleaned.map(col => col.id));
  COLONY_BLUEPRINTS.forEach(blueprint => {
    if (!existingIds.has(blueprint.id)) {
      cleaned.push(createColonyFromBlueprint(blueprint, language));
    }
  });

  return cleaned.sort((a, b) => {
    const orderA = COLONY_BLUEPRINTS.findIndex(blueprint => blueprint.id === a.id);
    const orderB = COLONY_BLUEPRINTS.findIndex(blueprint => blueprint.id === b.id);
    return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
  });
};

const RARITY_LABEL: Record<string, Record<'en' | 'pt', string>> = {
  common: { en: 'Common', pt: 'Comum' },
  rare: { en: 'Rare', pt: 'Rara' },
  epic: { en: 'Epic', pt: 'Épica' },
  legendary: { en: 'Legendary', pt: 'Lendária' },
  mythic: { en: 'Mythic', pt: 'Mítica' },
};

const PanelHeader = ({
  eyebrow,
  title,
  icon: Icon,
  tone = 'text-emerald-300',
}: {
  eyebrow: string;
  title: string;
  icon: any;
  tone?: string;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className={`text-[10px] font-mono uppercase tracking-[0.28em] ${tone}`}>{eyebrow}</p>
      <h4 className="text-lg font-orbitron font-black text-white uppercase tracking-tight">{title}</h4>
    </div>
    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
      <Icon size={16} className={tone} />
    </div>
  </div>
);

const CardEffectPills = ({ card, language, cardLevels = {} }: { card: ColonyCard; language: 'en' | 'pt'; cardLevels?: ColonyCardLevels }) => {
  const passiveBonuses = getPoliticalPassiveBonuses(card, cardLevels);

  return (
  <div className="mt-3 flex flex-wrap gap-1.5">
    {passiveBonuses.constructorsAllColonies ? (
      <span className="rounded-full border border-cyan-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-cyan-100 shadow-[0_0_10px_rgba(0,0,0,0.45)]">
        +{passiveBonuses.constructorsAllColonies} {language === 'pt' ? 'Robôs Construtores' : 'Builder Robots'}
      </span>
    ) : null}
    {passiveBonuses.allSectorBonus ? (
      <span className="rounded-full border border-emerald-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-emerald-200 shadow-[0_0_10px_rgba(0,0,0,0.45)]">
        +{passiveBonuses.allSectorBonus} {language === 'pt' ? 'Todas as Colônias' : 'All Colonies'}
      </span>
    ) : null}
    {passiveBonuses.constructionSpeedPercent ? (
      <span className="rounded-full border border-amber-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-amber-100 shadow-[0_0_10px_rgba(0,0,0,0.45)]">
        +{passiveBonuses.constructionSpeedPercent}% {language === 'pt' ? 'Velocidade de Construção' : 'Construction Speed'}
      </span>
    ) : null}
    {getPoliticalEffects(card, cardLevels).map(effect => (
      <span
        key={`${card.id}-${effect.sector}`}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
          effect.value >= 0
            ? 'border-emerald-300/60 text-emerald-200 bg-zinc-950/90 shadow-[0_0_10px_rgba(0,0,0,0.45)]'
            : 'border-red-300/60 text-red-200 bg-zinc-950/90 shadow-[0_0_10px_rgba(0,0,0,0.45)]'
        }`}
      >
        {effect.value > 0 ? '+' : ''}{effect.value} {SECTOR_CONFIG[effect.sector].label[language]}
      </span>
    ))}
  </div>
  );
};

const ColonyCardView = ({
  card,
  language,
  onClick,
  isEquipped = false,
  actionLabel,
  cardLevels = {},
}: {
  card: ColonyCard;
  language: 'en' | 'pt';
  onClick?: () => void;
  isEquipped?: boolean;
  actionLabel?: string;
  cardLevels?: ColonyCardLevels;
}) => {
  const cardClass = getCardClass(card);
  const backgroundImage = getCardBackgroundImage(card.rarity);
  const content = (
    <>
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.018]"
      />
      <div className="absolute inset-[8%] rounded-[8%] bg-gradient-to-b from-black/8 via-black/10 to-black/36" />
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover/card:opacity-100 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.16),transparent_36%)]" />
      <div className="absolute inset-x-[11%] top-[18%] z-10">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${
              cardClass === 'battle'
                ? 'border-red-300/45 bg-zinc-950/85 text-red-100'
                : 'border-cyan-300/45 bg-zinc-950/85 text-cyan-100'
            }`}>
              {cardClass === 'battle' ? (language === 'pt' ? 'Batalha' : 'Battle') : (language === 'pt' ? 'Política' : 'Political')}
            </span>
            <span className="rounded-full border border-white/20 bg-zinc-950/85 px-2 py-0.5 text-[9px] text-zinc-200 font-mono uppercase tracking-widest">
              {card.slot}
            </span>
          </div>
          <h5 className="line-clamp-3 rounded-lg bg-zinc-950/88 px-2 py-1.5 text-sm font-orbitron font-black text-white uppercase leading-tight shadow-[0_0_18px_rgba(0,0,0,0.45)]">{card.name[language]}</h5>
          <p className="line-clamp-3 rounded-lg bg-zinc-950/86 px-2 py-1.5 text-[11px] text-zinc-100 leading-snug shadow-[0_0_14px_rgba(0,0,0,0.35)]">{card.lore[language]}</p>
        </div>
      </div>
      <div className="absolute right-[11%] top-[18%] z-10">
        {isEquipped ? (
          <BadgeCheck size={18} className="shrink-0 text-emerald-300" />
        ) : (
          <Sparkles size={18} className="shrink-0 text-white/40" />
        )}
      </div>
      <div className="absolute inset-x-[11%] bottom-[11%] z-10 space-y-2">
        <div className="inline-flex rounded-full border border-white/20 bg-zinc-950/88 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
          LVL {getCardLevel(card.id, cardLevels)} / 10
        </div>
        {isBattleCard(card) ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {getBattleEffects(card, cardLevels).slice(0, 4).map(effect => (
              <span key={`${card.id}-${effect.stat}`} className="rounded-full border border-red-300/35 bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] text-red-100">
                +{effect.value}% {BATTLE_STAT_CONFIG[effect.stat].label[language]}
              </span>
            ))}
          </div>
        ) : (
          <CardEffectPills card={card} language={language} cardLevels={cardLevels} />
        )}
        {actionLabel && (
          <p className="rounded-lg bg-zinc-950/90 px-2 py-1 text-[10px] font-orbitron font-black uppercase tracking-[0.22em] text-white">{actionLabel}</p>
        )}
      </div>
    </>
  );

  const className = `group/card relative mx-auto aspect-[2/3] w-full max-w-[290px] overflow-hidden rounded-[3.8%] border text-left transition-all ${getCardStyle(card.rarity, cardClass)} ${
    onClick ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
  } ${isEquipped ? 'ring-1 ring-emerald-300/70' : ''}`;

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <PremiumCanvasButton
      onClick={onClick}
      tone={isEquipped ? 'green' : 'steel'}
      className={className}
      contentClassName="items-stretch"
    >
      {content}
    </PremiumCanvasButton>
  );
};

const ClaimCardView = ({
  card,
  language,
  requirement,
  onClaim,
  tone,
}: {
  card: ColonyCard;
  language: 'en' | 'pt';
  requirement: { met: boolean; label: string };
  onClaim: () => void;
  tone: 'emerald' | 'cyan';
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-3 ${requirement.met ? getCardStyle(card.rarity, getCardClass(card)) : 'border-zinc-800 bg-black/30 opacity-80'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {requirement.met ? <Sparkles size={14} className="text-emerald-300" /> : <LockKeyhole size={14} className="text-zinc-600" />}
            <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest">{RARITY_LABEL[card.rarity]?.[language] || card.rarity}</span>
          </div>
          <h5 className="text-sm font-orbitron font-black text-white uppercase leading-tight">{card.name[language]}</h5>
          <p className="mt-1 text-[11px] text-zinc-400 leading-snug">{card.role[language]}</p>
          <p className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${requirement.met ? 'text-emerald-300' : 'text-zinc-500'}`}>
            {requirement.label}
          </p>
        </div>
        <PremiumCanvasButton
          onClick={onClaim}
          disabled={!requirement.met}
          tone={requirement.met ? (tone === 'emerald' ? 'green' : 'cyan') : 'steel'}
          className="h-10 shrink-0 rounded-xl"
          contentClassName={`px-3 text-[10px] font-black uppercase tracking-widest ${requirement.met ? 'text-white' : 'text-zinc-500'}`}
        >
          {requirement.met ? (language === 'pt' ? 'Reivindicar' : 'Claim') : (language === 'pt' ? 'Bloqueada' : 'Locked')}
        </PremiumCanvasButton>
      </div>
    </div>
  );
};

const AcquisitionEventOverlay = ({
  card,
  language,
  onClose,
  cardLevels = {},
}: {
  card: ColonyCard | null;
  language: 'en' | 'pt';
  onClose: () => void;
  cardLevels?: ColonyCardLevels;
}) => {
  if (!card) return null;

  const arcade = card.unlocksArcadeId
    ? MINI_GAMES_CONFIG.find(game => game.id === card.unlocksArcadeId)
    : null;

  const rarityTone: Record<string, string> = {
    common: 'from-zinc-300/20 via-zinc-950 to-zinc-900',
    rare: 'from-cyan-300/25 via-zinc-950 to-blue-950/70',
    epic: 'from-violet-300/25 via-zinc-950 to-fuchsia-950/70',
    legendary: 'from-amber-300/30 via-zinc-950 to-emerald-950/70',
    mythic: 'from-rose-300/30 via-zinc-950 to-amber-950/70',
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -10 }}
        className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br ${rarityTone[card.rarity]} p-6 shadow-[0_0_80px_rgba(16,185,129,0.18)]`}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_45%)]" />
        <motion.div
          className="absolute -inset-24 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.35), transparent, rgba(16,185,129,0.25), transparent)',
          }}
        />

        <div className="relative z-10 text-center">
          <p className="text-[10px] text-emerald-300 font-mono uppercase tracking-[0.45em]">
            {language === 'pt' ? 'Carta adquirida' : 'Card acquired'}
          </p>
          <h3 className="mt-2 text-3xl font-orbitron font-black text-white uppercase tracking-tight">
            {RARITY_LABEL[card.rarity]?.[language] || card.rarity}
          </h3>
        </div>

        <div className="relative z-10 my-6">
          <ColonyCardView card={card} language={language} cardLevels={cardLevels} />
        </div>

        {arcade && (
          <div className="relative z-10 mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-center">
            <p className="text-[10px] text-cyan-200 font-mono uppercase tracking-[0.32em]">
              {language === 'pt' ? 'Novo Fliperama Desbloqueado' : 'New Arcade Unlocked'}
            </p>
            <p className="mt-2 text-xl font-orbitron font-black text-white uppercase">
              {arcade.name[language]}
            </p>
          </div>
        )}

        <PremiumCanvasButton
          onClick={onClose}
          tone="green"
          className="relative z-10 h-14 w-full rounded-2xl"
          contentClassName="px-5 text-[12px] font-black uppercase tracking-[0.24em] text-emerald-50"
        >
          {language === 'pt' ? 'Registrar no Conselho' : 'Register in Council'}
        </PremiumCanvasButton>
      </motion.div>
    </div>
  );
};

const CardDetailOverlay = ({
  selected,
  language,
  onClose,
  onConfirm,
  onNavigate,
  navigationLabel,
  cardLevels = {},
}: {
  selected: { card: ColonyCard; action: 'equip' | 'remove'; slot?: ColonyCardSlot | BattleCardSlot; blockedBy?: string } | null;
  language: 'en' | 'pt';
  onClose: () => void;
  onConfirm: () => void;
  onNavigate?: (direction: -1 | 1) => void;
  navigationLabel?: string;
  cardLevels?: ColonyCardLevels;
}) => {
  if (!selected) return null;

  const { card, action } = selected;
  const cardClass = getCardClass(card);
  const modalBackgroundImage = getCardModalBackgroundImage(card.rarity, cardClass);
  const arcade = card.unlocksArcadeId
    ? MINI_GAMES_CONFIG.find(game => game.id === card.unlocksArcadeId)
    : null;

  const confirmLabel = action === 'remove'
    ? (language === 'pt' ? 'Retirar carta' : 'Remove card')
    : (language === 'pt' ? 'Equipar carta' : 'Equip card');
  const isBlocked = action === 'equip' && Boolean(selected.blockedBy);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        className={`relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 shadow-[0_0_80px_rgba(34,211,238,0.12)] ${getCardStyle(card.rarity, cardClass)}`}
      >
        <img src={modalBackgroundImage} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-90" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/16" />
        <div className="pointer-events-none absolute inset-0 z-0 opacity-35 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.18),transparent_30%)]" />
        <PremiumCanvasButton
          onClick={onClose}
          tone="steel"
          className="absolute right-4 top-4 z-20 h-10 w-10 rounded-full"
          contentClassName="text-zinc-200"
          aria-label={language === 'pt' ? 'Fechar carta' : 'Close card'}
        >
          <X size={18} />
        </PremiumCanvasButton>
        {onNavigate && navigationLabel && (
          <div className="absolute left-5 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/65 p-1 shadow-[0_0_22px_rgba(0,0,0,0.35)]">
            <PremiumCanvasButton
              type="button"
              onClick={() => onNavigate(-1)}
              tone="steel"
              className="h-9 w-9 rounded-full"
              contentClassName="text-zinc-200"
              aria-label={language === 'pt' ? 'Carta anterior' : 'Previous card'}
            >
              <ChevronLeft size={18} />
            </PremiumCanvasButton>
            <span className="min-w-12 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {navigationLabel}
            </span>
            <PremiumCanvasButton
              type="button"
              onClick={() => onNavigate(1)}
              tone="steel"
              className="h-9 w-9 rounded-full"
              contentClassName="text-zinc-200"
              aria-label={language === 'pt' ? 'Próxima carta' : 'Next card'}
            >
              <ChevronRight size={18} />
            </PremiumCanvasButton>
          </div>
        )}

        <div className="relative z-10 grid gap-5 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-7">
          <div className="flex items-center pt-10 md:pt-9">
            <ColonyCardView card={card} language={language} isEquipped={action === 'remove'} cardLevels={cardLevels} />
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.42em] text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.55)]">
                {language === 'pt' ? 'Dossiê do Conselho' : 'Council Dossier'}
              </p>
              <h3 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]">
                {card.name[language]}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                  {RARITY_LABEL[card.rarity]?.[language] || card.rarity}
                </span>
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                  {card.slot}
                </span>
              </div>

              <p className="mt-5 text-sm font-semibold leading-relaxed text-zinc-50 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                {card.role[language]}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                {card.lore[language]}
              </p>

              <div className="mt-5 rounded-2xl border border-white/15 bg-black/55 p-4 shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-100/85">
                  {language === 'pt' ? 'Impacto direto' : 'Direct impact'}
                </p>
                {isBattleCard(card) ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {getBattleEffects(card, cardLevels).map(effect => (
                      <span key={`${card.id}-${effect.stat}`} className="rounded-full border border-red-300/35 bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] text-red-100">
                        +{effect.value}% {BATTLE_STAT_CONFIG[effect.stat].label[language]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <CardEffectPills card={card} language={language} cardLevels={cardLevels} />
                )}
              </div>

              {arcade && (
                <div className="mt-3 rounded-2xl border border-violet-300/30 bg-violet-300/10 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-violet-200">
                    {language === 'pt' ? 'Fliperama vinculado' : 'Linked arcade'}
                  </p>
                  <p className="mt-2 text-lg font-orbitron font-black uppercase text-white">
                    {arcade.name[language]}
                  </p>
                </div>
              )}

              {isBlocked && (
                <div className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-200">
                    {language === 'pt' ? 'Colônia cheia' : 'Colony full'}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-200">
                    {language === 'pt'
                      ? 'Retire uma das três cartas políticas antes de equipar outra nesta colônia.'
                      : 'Remove one of the three political cards before equipping another in this colony.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <PremiumCanvasButton
                onClick={onConfirm}
                disabled={isBlocked}
                tone={isBlocked ? 'steel' : action === 'remove' ? 'red' : 'green'}
                className="h-14 flex-1 rounded-2xl"
                contentClassName={`px-5 text-sm font-black uppercase tracking-[0.22em] ${isBlocked ? 'text-zinc-500' : 'text-white'}`}
              >
                {isBlocked ? (language === 'pt' ? 'Retire a carta atual' : 'Remove current card') : confirmLabel}
              </PremiumCanvasButton>
              <PremiumCanvasButton
                onClick={onClose}
                tone="steel"
                className="h-14 rounded-2xl"
                contentClassName="px-5 text-sm font-black uppercase tracking-[0.22em] text-zinc-200"
              >
                {language === 'pt' ? 'Voltar' : 'Back'}
              </PremiumCanvasButton>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Component ---

export const ColonySystem: React.FC<ColonySystemProps> = ({ 
  language, 
  onAddYear, 
  onTabStatusChange,
  earthPopulation,
  setEarthPopulation,
  colonies,
  setColonies,
  historyStats = {},
  unlockedAchievements = [],
  playSfx,
  onBuildingComplete,
  qc = 0,
  onEarnQC,
  onSpendQC,
  onDefenseThreatAlertChange,
  openDefenseRequest = 0,
  abandonDefenseRequest = 0,
  defenseAlertsPaused = false,
  formatValue = (value: number) => value.toLocaleString(),
  selectedColonyId,
  setSelectedColonyId,
}) => {
  const [activeColonyId, setActiveColonyId] = useState<string>('colony-1');

  useEffect(() => {
    if (selectedColonyId) {
      setActiveColonyId(selectedColonyId);
    }
  }, [selectedColonyId]);
  const [activeView, setActiveView] = useState<'colony' | 'searches' | 'missions'>('colony');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSuppliesLoaded, setIsSuppliesLoaded] = useState(false);
  const [isSearchLoaded, setIsSearchLoaded] = useState(false);
  const [isThreatsLoaded, setIsThreatsLoaded] = useState(false);
  const [colonySupplies, setColonySupplies] = useState<ColonySupplies>(DEFAULT_COLONY_SUPPLIES);
  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(DEFAULT_OWNED_COLONY_CARD_IDS);
  const [isOwnedCardsLoaded, setIsOwnedCardsLoaded] = useState(false);
  const [managementPanel, setManagementPanel] = useState<'status' | 'council' | 'claims'>('status');
  const [cardEvent, setCardEvent] = useState<ColonyCard | null>(null);
  const [cardFeedback, setCardFeedback] = useState<string | null>(null);
  const [activeSearches, setActiveSearches] = useState<ActiveColonySearches>({});
  const [searchRemainingSeconds, setSearchRemainingSeconds] = useState<Record<string, number>>({});
  const [searchThreatBonus, setSearchThreatBonus] = useState<SearchThreatBonus>(DEFAULT_SEARCH_THREAT_BONUS);
  const [isSearchThreatBonusLoaded, setIsSearchThreatBonusLoaded] = useState(false);
  const [searchUpgradeLevels, setSearchUpgradeLevels] = useState<SearchUpgradeLevels>(DEFAULT_SEARCH_UPGRADE_LEVELS);
  const [isSearchUpgradeLevelsLoaded, setIsSearchUpgradeLevelsLoaded] = useState(false);
  const [searchBattleCycle, setSearchBattleCycle] = useState<SearchBattleCycleState>(DEFAULT_SEARCH_BATTLE_CYCLE);
  const [isSearchBattleCycleLoaded, setIsSearchBattleCycleLoaded] = useState(false);
  const [activeSearchBattle, setActiveSearchBattle] = useState<ActiveSearchBattle | null>(null);
  const [legendaryBattleCardPity, setLegendaryBattleCardPity] = useState(0);
  const [isBattlePityLoaded, setIsBattlePityLoaded] = useState(false);
  const [cardLevels, setCardLevels] = useState<ColonyCardLevels>({});
  const [isCardLevelsLoaded, setIsCardLevelsLoaded] = useState(false);
  const [horizonXp, setHorizonXp] = useState(0);
  const [isHorizonXpLoaded, setIsHorizonXpLoaded] = useState(false);
  const [defenseBattleLevel, setDefenseBattleLevel] = useState(1);
  const [isDefenseBattleLevelLoaded, setIsDefenseBattleLevelLoaded] = useState(false);
  const [lastSearchReport, setLastSearchReport] = useState<string | null>(null);
  const [battleLoadout, setBattleLoadout] = useState<BattleLoadout>({});
  const [isBattleLoadoutLoaded, setIsBattleLoadoutLoaded] = useState(false);
  const [selectedSpecialIds, setSelectedSpecialIds] = useState<DefenseSpecialId[]>(['apocalypse-laser', 'hellfire-barrage']);
  const [isDefenseSpecialLoadoutLoaded, setIsDefenseSpecialLoadoutLoaded] = useState(false);
  const [pendingDefenseThreats, setPendingDefenseThreats] = useState<PendingDefenseThreat[]>([]);
  const [activeDefenseThreat, setActiveDefenseThreat] = useState<PendingDefenseThreat | null>(null);
  const [showDefenseHangar, setShowDefenseHangar] = useState(false);
  const [defenseAlertTick, setDefenseAlertTick] = useState(0);
  const [battleCardCodexPage, setBattleCardCodexPage] = useState(0);
  const [selectedCard, setSelectedCard] = useState<{ card: ColonyCard; action: 'equip' | 'remove'; slot?: ColonyCardSlot | BattleCardSlot; blockedBy?: string } | null>(null);
  const [newEarthMissions, setNewEarthMissions] = useState<NewEarthMissionState>(() => createDefaultNewEarthMissionState());
  const [isNewEarthMissionsLoaded, setIsNewEarthMissionsLoaded] = useState(false);
  const [newEarthMissionCycleBonusAnimation, setNewEarthMissionCycleBonusAnimation] = useState<NewEarthMissionCycleBonusAnimation>(null);
  const colonySuppliesRef = useRef<ColonySupplies>(DEFAULT_COLONY_SUPPLIES);
  const earthPopulationRef = useRef(earthPopulation);
  const setEarthPopulationRef = useRef(setEarthPopulation);
  const cardLevelsRef = useRef<ColonyCardLevels>({});
  const allSectorBonusRef = useRef(0);
  const horizonXpRef = useRef(0);
  const handledOpenDefenseRequestRef = useRef(0);
  const handledAbandonDefenseRequestRef = useRef(0);
  const defenseAlertsPausedAtRef = useRef<number | null>(null);
  const lastBuildingLevelsRef = useRef<Record<string, Record<string, number>>>({});
  const newEarthMissionCycleBonusTimeoutRef = useRef<number | null>(null);
  const newEarthMissionCycleBonusDrainIntervalRef = useRef<number | null>(null);
  const scheduledNewEarthMissionCycleBonusRef = useRef<number | null>(null);
  const paidNewEarthMissionCycleBonusRef = useRef<number | null>(null);
  const readyNewEarthMissionIdsRef = useRef<Set<string>>(new Set());
  const readyNewEarthMissionAudioInitializedRef = useRef(false);

  const t = useCallback((en: string, pt: string) => language === 'pt' ? pt : en, [language]);
  const effectiveActiveColonyId = activeColonyId ?? colonies[0]?.id ?? null;
  const newEarthMissionContext = useMemo(() => {
    const unlockedArcadeIds = Array.from(getOwnedArcadeIdsFromCards(ownedCardIds));
    const ownedCardIdSet = new Set(ownedCardIds);
    const hasMissingCards = COLONY_CARD_CATALOG.some(card => !ownedCardIdSet.has(card.id));
    const upgradeableCards = ownedCardIds
      .map(id => getCardById(id))
      .filter((card): card is ColonyCard => Boolean(card))
      .filter(card => isBattleCard(card) || isPoliticalCard(card))
      .map(card => ({
        id: card.id,
        name: card.name,
        level: getCardLevel(card.id, cardLevels),
      }));
    const submarineColoniesReady = colonies.some(colony => (
      (colony.id === 'colony-2' || colony.id === 'colony-4') &&
      isColonyReadyForPopulation(colony.constructions)
    ));
    const directBattlesUnlocked = colonies.length > 0 && colonies.every(colony => isColonyReadyForPopulation(colony.constructions));

    return {
      unlockedArcadeIds,
      hasMissingCards,
      canRunLandSearch: !directBattlesUnlocked,
      canRunSeaSearch: !directBattlesUnlocked,
      canDefendSearches: pendingDefenseThreats.length > 0 || Boolean(activeDefenseThreat),
      directBattlesUnlocked,
      canUseSubmarines: submarineColoniesReady,
      upgradeableCards,
      colonies: colonies.map(colony => ({
        id: colony.id,
        allBaseConstructionsComplete: isColonyReadyForPopulation(colony.constructions),
        completedConstructions: (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).reduce((acc, type) => ({
          ...acc,
          [type]: Math.max(0, ...colony.constructions
            .filter(construction => construction.type === type)
            .map(construction => Math.max(0, Math.floor(Number(construction.level) || 0)))),
        }), {} as Partial<Record<ConstructionType, number>>),
      })),
    };
  }, [activeDefenseThreat, cardLevels, colonies, ownedCardIds, pendingDefenseThreats.length]);

  const newEarthMissionCycleCompletedCount = useMemo(() => (
    newEarthMissions.missions.filter(mission => mission.completed).length
  ), [newEarthMissions.missions]);

  const newEarthMissionCycleBonusValue = useMemo(() => (
    newEarthMissions.missions.reduce((total, mission) => (
      mission.completed ? total + (Number(mission.reward.qc) || 0) : total
    ), 0)
  ), [newEarthMissions.missions]);

  const isNewEarthMissionCycleFullyClaimed = newEarthMissions.missions.length >= 4
    && newEarthMissions.missions.every(mission => mission.claimed);

  const newEarthMissionContextRef = useRef(newEarthMissionContext);
  const onEarnQCRef = useRef(onEarnQC);
  const tRef = useRef(t);

  useEffect(() => {
    newEarthMissionContextRef.current = newEarthMissionContext;
  }, [newEarthMissionContext]);

  useEffect(() => {
    onEarnQCRef.current = onEarnQC;
    tRef.current = t;
  }, [onEarnQC, t]);

  const formatSearchTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };
  const openDefenseHangar = useCallback(() => {
    playRoute4UiSfx(ROUTE4_HANGAR_OPEN_SFX, 0.72);
    setShowDefenseHangar(true);
  }, []);
  const closeDefenseHangar = useCallback(() => {
    playRoute4UiSfx(ROUTE4_HANGAR_CLOSE_SFX, 0.72);
    setShowDefenseHangar(false);
  }, []);

  // Load state
  useEffect(() => {
    preloadAssetGroupPassive('route4-colonies');
    preloadAssetGroupPassive('card-frames');
  }, []);

  useEffect(() => {
    if (showDefenseHangar || activeDefenseThreat || activeSearchBattle) {
      preloadAssetGroupPassive('route4-battle');
    }
  }, [showDefenseHangar, activeDefenseThreat, activeSearchBattle]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 0);
    onTabStatusChange(true);
    return () => {
      window.clearTimeout(timer);
      onTabStatusChange(false);
    };
  }, [onTabStatusChange]);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_cards_data').then(saved => {
      if (!mounted) return;
      const normalized = normalizeOwnedColonyCardIds(Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_OWNED_COLONY_CARD_IDS);
      setOwnedCardIds(normalized);
      GameStorage.save(normalized, 'colony_cards_data');
      setIsOwnedCardsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_supplies_data').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        setColonySupplies({
          ...DEFAULT_COLONY_SUPPLIES,
          ...saved,
        });
      }
      setIsSuppliesLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_active_search').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        const normalizeSearch = (search: any, fallbackId: ColonyExpeditionId, slotIndex: number): ActiveColonySearch | null => {
          if (!search?.endsAt || !search?.rewards) return null;
          const id = search.id === 'sea' ? 'sea' : fallbackId;
          const safeSlot = Math.max(0, Math.min(MAX_PARALLEL_SEARCHES_PER_TYPE - 1, Number(search.slotIndex ?? slotIndex) || 0));
          const startedAt = Number(search.startedAt) || Date.now();
          const endsAt = Number(search.endsAt) || startedAt;
          const latestThreatCheckAt = startedAt + Math.max(0, endsAt - startedAt) * SEARCH_THREAT_TRIGGER_MAX_PROGRESS;
          const threatCheckAt = Number(search.threatCheckAt) || (
            Date.now() >= latestThreatCheckAt
              ? latestThreatCheckAt
              : getSearchThreatCheckAt(startedAt, endsAt)
          );
          return {
            ...search,
            id,
            searchKey: search.searchKey || getSearchSlotKey(id, safeSlot),
            slotIndex: safeSlot,
            startedAt,
            endsAt,
            threatCheckAt,
            threatCheckedAt: search.threatCheckedAt || (Date.now() >= latestThreatCheckAt ? Date.now() : undefined),
          } as ActiveColonySearch;
        };

        if (saved.endsAt && saved.rewards && (saved.id === 'land' || saved.id === 'sea')) {
          const search = normalizeSearch(saved, saved.id, 0);
          setActiveSearches(search ? { [search.searchKey]: search } : {});
        } else {
          const next: ActiveColonySearches = {};
          (['land', 'sea'] as const).forEach(id => {
            const legacySearch = normalizeSearch(saved[id], id, 0);
            if (legacySearch) next[legacySearch.searchKey] = legacySearch;
            for (let slotIndex = 0; slotIndex < MAX_PARALLEL_SEARCHES_PER_TYPE; slotIndex++) {
              const key = getSearchSlotKey(id, slotIndex);
              const search = normalizeSearch(saved[key], id, slotIndex);
              if (search) next[key] = search;
            }
          });
          setActiveSearches(next);
        }
      }
      setIsSearchLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_search_threat_bonus').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        setSearchThreatBonus({
          land: Number.isFinite(saved.land) ? Math.max(0, saved.land) : 0,
          sea: Number.isFinite(saved.sea) ? Math.max(0, saved.sea) : 0,
        });
      }
      setIsSearchThreatBonusLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_search_upgrade_levels').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        setSearchUpgradeLevels({
          land: Math.max(0, Math.min(MAX_SEARCH_UPGRADE_LEVEL, Number(saved.land) || 0)),
          sea: Math.max(0, Math.min(MAX_SEARCH_UPGRADE_LEVEL, Number(saved.sea) || 0)),
        });
      }
      setIsSearchUpgradeLevelsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('route4_search_battle_cycle').then(saved => {
      if (!mounted) return;
      setSearchBattleCycle(normalizeSearchBattleCycle(saved));
      setIsSearchBattleCycleLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('battle_card_legendary_pity').then(saved => {
      if (!mounted) return;
      if (Number.isFinite(saved)) setLegendaryBattleCardPity(Math.max(0, saved));
      setIsBattlePityLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_card_levels').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') setCardLevels(saved);
      setIsCardLevelsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('horizon_ship_xp').then(saved => {
      if (!mounted) return;
      if (Number.isFinite(saved)) setHorizonXp(Math.max(0, saved));
      setIsHorizonXpLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('route4_defense_battle_level').then(saved => {
      if (!mounted) return;
      if (Number.isFinite(saved)) setDefenseBattleLevel(Math.max(1, Math.floor(saved)));
      setIsDefenseBattleLevelLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('battle_cards_loadout').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        const next: BattleLoadout = {};
        BATTLE_CARD_SLOTS.forEach(slot => {
          const card = getCardById(saved[slot]);
          if (card && isBattleCard(card)) next[slot] = card.id;
        });
        setBattleLoadout(next);
      }
      setIsBattleLoadoutLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('defense_special_loadout').then(saved => {
      if (!mounted) return;
      if (Array.isArray(saved)) {
        const valid = saved.filter(id => DEFENSE_SPECIALS.some(special => special.id === id)) as DefenseSpecialId[];
        setSelectedSpecialIds(valid.slice(0, 2));
      }
      setIsDefenseSpecialLoadoutLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_defense_threats').then(saved => {
      if (!mounted) return;
      if (Array.isArray(saved)) {
        setPendingDefenseThreats(saved
          .filter(threat => threat?.status === 'pending')
          .map((threat, index) => ({
            ...threat,
            id: `${threat.id || `threat-${threat.sourceSearchId || 'unknown'}-${threat.detectedAt || Date.now()}`}-${index}`,
            detectedAt: Number(threat.detectedAt) || Date.now(),
            expiresAt: threat.openedAt ? undefined : (Number(threat.expiresAt) || (Number(threat.detectedAt) || Date.now()) + DEFENSE_THREAT_RESPONSE_SECONDS * 1000),
          }))
          .slice(0, MAX_PENDING_DEFENSE_THREATS)
        );
      }
      setIsThreatsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load(NEW_EARTH_MISSIONS_STORAGE_KEY).then(saved => {
      if (!mounted) return;
      const context = newEarthMissionContextRef.current;
      setNewEarthMissions(refreshNewEarthMissionBoard(
        normalizeNewEarthMissionState(saved, context),
        context
      ));
      setIsNewEarthMissionsLoaded(true);
    });

    const handleMissionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<NewEarthMissionState>;
      if (customEvent.detail) {
        const context = newEarthMissionContextRef.current;
        setNewEarthMissions(refreshNewEarthMissionBoard(
          normalizeNewEarthMissionState(customEvent.detail, context),
          context
        ));
      }
    };

    window.addEventListener('qch:new-earth-missions-updated', handleMissionUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('qch:new-earth-missions-updated', handleMissionUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !isOwnedCardsLoaded) return;
    GameStorage.save(ownedCardIds, 'colony_cards_data');
  }, [ownedCardIds, isLoaded, isOwnedCardsLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSuppliesLoaded) return;
    GameStorage.save(colonySupplies, 'colony_supplies_data');
  }, [colonySupplies, isLoaded, isSuppliesLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSearchLoaded) return;
    GameStorage.save(activeSearches, 'colony_active_search');
  }, [activeSearches, isLoaded, isSearchLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSearchThreatBonusLoaded) return;
    GameStorage.save(searchThreatBonus, 'colony_search_threat_bonus');
  }, [searchThreatBonus, isLoaded, isSearchThreatBonusLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSearchUpgradeLevelsLoaded) return;
    GameStorage.save(searchUpgradeLevels, 'colony_search_upgrade_levels');
  }, [searchUpgradeLevels, isLoaded, isSearchUpgradeLevelsLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSearchBattleCycleLoaded) return;
    GameStorage.save(searchBattleCycle, 'route4_search_battle_cycle');
  }, [searchBattleCycle, isLoaded, isSearchBattleCycleLoaded]);

  useEffect(() => {
    if (!isLoaded || !isBattlePityLoaded) return;
    GameStorage.save(legendaryBattleCardPity, 'battle_card_legendary_pity');
  }, [legendaryBattleCardPity, isLoaded, isBattlePityLoaded]);

  useEffect(() => {
    if (!isLoaded || !isCardLevelsLoaded) return;
    GameStorage.save(cardLevels, 'colony_card_levels');
  }, [cardLevels, isLoaded, isCardLevelsLoaded]);

  useEffect(() => {
    if (!isLoaded || !isHorizonXpLoaded) return;
    GameStorage.save(horizonXp, 'horizon_ship_xp');
  }, [horizonXp, isLoaded, isHorizonXpLoaded]);

  useEffect(() => {
    if (!isLoaded || !isDefenseBattleLevelLoaded) return;
    GameStorage.save(Math.max(1, Math.floor(defenseBattleLevel)), 'route4_defense_battle_level');
  }, [defenseBattleLevel, isLoaded, isDefenseBattleLevelLoaded]);

  useEffect(() => {
    if (!isLoaded || !isBattleLoadoutLoaded) return;
    GameStorage.save(battleLoadout, 'battle_cards_loadout');
  }, [battleLoadout, isLoaded, isBattleLoadoutLoaded]);

  useEffect(() => {
    if (!isLoaded || !isDefenseSpecialLoadoutLoaded) return;
    GameStorage.save(selectedSpecialIds, 'defense_special_loadout');
  }, [selectedSpecialIds, isLoaded, isDefenseSpecialLoadoutLoaded]);

  useEffect(() => {
    if (!isLoaded || !isThreatsLoaded) return;
    GameStorage.save(pendingDefenseThreats.slice(0, MAX_PENDING_DEFENSE_THREATS), 'colony_defense_threats');
  }, [pendingDefenseThreats, isLoaded, isThreatsLoaded]);

  useEffect(() => {
    if (!isLoaded || !isNewEarthMissionsLoaded) return;
    GameStorage.save(newEarthMissions, NEW_EARTH_MISSIONS_STORAGE_KEY);
  }, [newEarthMissions, isLoaded, isNewEarthMissionsLoaded]);

  useEffect(() => () => {
    if (newEarthMissionCycleBonusTimeoutRef.current) {
      window.clearTimeout(newEarthMissionCycleBonusTimeoutRef.current);
    }
    if (newEarthMissionCycleBonusDrainIntervalRef.current) {
      window.clearInterval(newEarthMissionCycleBonusDrainIntervalRef.current);
    }
    scheduledNewEarthMissionCycleBonusRef.current = null;
  }, []);

  useEffect(() => {
    if (!isLoaded || !isNewEarthMissionsLoaded) return;
    if (!isNewEarthMissionCycleFullyClaimed || newEarthMissions.cycleRewardClaimed) return;

    const bonus = newEarthMissionCycleBonusValue;
    const cycle = newEarthMissions.cycle;

    if (
      paidNewEarthMissionCycleBonusRef.current === cycle
      || scheduledNewEarthMissionCycleBonusRef.current === cycle
    ) return;

    if (newEarthMissionCycleBonusTimeoutRef.current) {
      window.clearTimeout(newEarthMissionCycleBonusTimeoutRef.current);
    }

    scheduledNewEarthMissionCycleBonusRef.current = cycle;
    playRoute4UiSfx(ROUTE4_FINAL_MISSION_QC_BONUS_SFX, 0.82);
    setNewEarthMissionCycleBonusAnimation({ cycle, bonus, displayBonus: bonus, draining: true, revealed: false });

    const startedAt = Date.now();
    if (newEarthMissionCycleBonusDrainIntervalRef.current) {
      window.clearInterval(newEarthMissionCycleBonusDrainIntervalRef.current);
    }
    newEarthMissionCycleBonusDrainIntervalRef.current = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / 2000);
      const displayBonus = Math.max(0, Math.round(bonus * (1 - progress)));
      setNewEarthMissionCycleBonusAnimation(current => (
        current?.cycle === cycle && current.draining
          ? { ...current, displayBonus }
          : current
      ));
      if (progress >= 1 && newEarthMissionCycleBonusDrainIntervalRef.current) {
        window.clearInterval(newEarthMissionCycleBonusDrainIntervalRef.current);
        newEarthMissionCycleBonusDrainIntervalRef.current = null;
      }
    }, 50);

    newEarthMissionCycleBonusTimeoutRef.current = window.setTimeout(() => {
      if (paidNewEarthMissionCycleBonusRef.current === cycle) {
        scheduledNewEarthMissionCycleBonusRef.current = null;
        newEarthMissionCycleBonusTimeoutRef.current = null;
        return;
      }
      paidNewEarthMissionCycleBonusRef.current = cycle;

      if (bonus > 0) {
        onEarnQCRef.current?.(bonus, 'mission');
      }
      setNewEarthMissions(prev => {
        const isSameCompletedCycle = prev.cycle === cycle
          && !prev.cycleRewardClaimed
          && prev.missions.length >= 4
          && prev.missions.every(mission => mission.claimed);
        return isSameCompletedCycle ? markNewEarthMissionCycleRewardClaimed(prev) : prev;
      });
      if (newEarthMissionCycleBonusDrainIntervalRef.current) {
        window.clearInterval(newEarthMissionCycleBonusDrainIntervalRef.current);
        newEarthMissionCycleBonusDrainIntervalRef.current = null;
      }
      setNewEarthMissionCycleBonusAnimation({ cycle, bonus, displayBonus: 0, draining: false, revealed: true });
      setCardFeedback(
        tRef.current('New Earth mission board bonus credited.', 'Bônus final do painel de missões creditado.')
      );
      scheduledNewEarthMissionCycleBonusRef.current = null;
      newEarthMissionCycleBonusTimeoutRef.current = null;
    }, 2000);
  }, [
    isLoaded,
    isNewEarthMissionsLoaded,
    isNewEarthMissionCycleFullyClaimed,
    newEarthMissions.cycle,
    newEarthMissions.cycleRewardClaimed,
    newEarthMissionCycleBonusValue,
  ]);

  useEffect(() => {
    if (!isLoaded || !isNewEarthMissionsLoaded) return;
    if (isNewEarthMissionCycleFullyClaimed && !newEarthMissions.cycleRewardClaimed) return;
    setNewEarthMissions(prev => {
      const next = refreshNewEarthMissionBoard(prev, newEarthMissionContext);
      if (next.cycle !== prev.cycle && prev.cycle > 0) {
        playRoute4UiSfx(ROUTE4_QUESTS_RENEW_SFX);
      }
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [isLoaded, isNewEarthMissionsLoaded, isNewEarthMissionCycleFullyClaimed, newEarthMissions.cycleRewardClaimed, newEarthMissionContext]);

  useEffect(() => {
    if (!isLoaded || !isNewEarthMissionsLoaded) return;
    const timer = window.setInterval(() => {
      setNewEarthMissions(prev => {
        const waitingForCycleBonus = prev.missions.length >= 4
          && prev.missions.every(mission => mission.claimed)
          && !prev.cycleRewardClaimed;
        if (waitingForCycleBonus) return prev;
        const next = refreshNewEarthMissionBoard(prev, newEarthMissionContext);
        if (next.cycle !== prev.cycle && prev.cycle > 0) {
          playRoute4UiSfx(ROUTE4_QUESTS_RENEW_SFX);
        }
        return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
      });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [isLoaded, isNewEarthMissionsLoaded, newEarthMissionContext]);

  useEffect(() => {
    if (defenseAlertsPaused) {
      defenseAlertsPausedAtRef.current = defenseAlertsPausedAtRef.current || Date.now();
      onDefenseThreatAlertChange?.(null);
      return;
    }

    const pausedAt = defenseAlertsPausedAtRef.current;
    if (!pausedAt) return;
    defenseAlertsPausedAtRef.current = null;
    const nextExpiresAt = Date.now() + DEFENSE_THREAT_RESPONSE_SECONDS * 1000;

    setPendingDefenseThreats(prev => prev.map(threat => (
      threat.expiresAt && !threat.openedAt
        ? { ...threat, expiresAt: nextExpiresAt }
        : threat
    )));
  }, [defenseAlertsPaused, onDefenseThreatAlertChange]);

  useEffect(() => {
    colonySuppliesRef.current = colonySupplies;
  }, [colonySupplies]);

  useEffect(() => {
    const handleExternalSupplyAward = (event: Event) => {
      const supplies = (event as CustomEvent<Partial<ColonySupplies>>).detail;
      if (!supplies || typeof supplies !== 'object') return;
      const nextSupplies = applySupplyDelta(colonySuppliesRef.current, supplies);
      colonySuppliesRef.current = nextSupplies;
      setColonySupplies(nextSupplies);
      event.preventDefault();
    };

    window.addEventListener('qch:colony-supplies-awarded', handleExternalSupplyAward);
    return () => window.removeEventListener('qch:colony-supplies-awarded', handleExternalSupplyAward);
  }, []);

  useEffect(() => {
    earthPopulationRef.current = earthPopulation;
  }, [earthPopulation]);

  useEffect(() => {
    setEarthPopulationRef.current = setEarthPopulation;
  }, [setEarthPopulation]);

  useEffect(() => {
    cardLevelsRef.current = cardLevels;
  }, [cardLevels]);

  useEffect(() => {
    horizonXpRef.current = horizonXp;
  }, [horizonXp]);

  useEffect(() => {
    if (!isLoaded) return;
    setColonies(prev => {
      let changed = false;
      const nextColonies = prev.map(colony => {
        const sanitized = sanitizePoliticalEquippedCards(colony.equippedCards || {});
        const current = colony.equippedCards || {};
        const currentKeys = Object.keys(current);
        const sanitizedKeys = Object.keys(sanitized);
        const sameLength = currentKeys.length === sanitizedKeys.length;
        const sameValues = sameLength && currentKeys.every(slot => current[slot as ColonyCardSlot] === sanitized[slot as ColonyCardSlot]);
        if (sameValues) return colony;
        changed = true;
        return { ...colony, equippedCards: sanitized };
      });
      return changed ? nextColonies : prev;
    });
  }, [isLoaded, setColonies]);

  const playNewEarthMissionCompleteVoice = useCallback(() => {
    const randomMissionIndex = Math.floor(Math.random() * NEW_EARTH_MISSION_COMPLETE_SFX_COUNT) + 1;
    playSfx?.(`new_earth_mission_complete_${randomMissionIndex}`, {
      category: 'ui',
      exclusiveKey: 'new-earth-mission-complete',
    });
  }, [playSfx]);

  useEffect(() => {
    if (!isLoaded || !isNewEarthMissionsLoaded) return;

    const readyMissionIds = new Set(
      newEarthMissions.missions
        .filter(mission => mission.completed && !mission.claimed)
        .map(mission => mission.id)
    );

    if (!readyNewEarthMissionAudioInitializedRef.current) {
      readyNewEarthMissionIdsRef.current = readyMissionIds;
      readyNewEarthMissionAudioInitializedRef.current = true;
      return;
    }

    const hasNewReadyMission = [...readyMissionIds].some(id => !readyNewEarthMissionIdsRef.current.has(id));
    readyNewEarthMissionIdsRef.current = readyMissionIds;

    if (hasNewReadyMission) {
      setCardFeedback(t('New Earth mission completed', 'Missão da Nova Terra concluída'));
      playNewEarthMissionCompleteVoice();
    }
  }, [isLoaded, isNewEarthMissionsLoaded, newEarthMissions.missions, playNewEarthMissionCompleteVoice, t]);

  useEffect(() => {
    if (!isLoaded || !isNewEarthMissionsLoaded || !isCardLevelsLoaded) return;

    setNewEarthMissions(prev => {
      let changed = false;
      const missions = prev.missions.map(mission => {
        if (
          mission.eventType !== 'card-upgrade' ||
          mission.claimed ||
          !mission.cardId ||
          !mission.cardTargetLevel ||
          getCardLevel(mission.cardId, cardLevels) < mission.cardTargetLevel
        ) {
          return mission;
        }

        const completedMission = {
          ...mission,
          progress: mission.target,
          completed: true,
        };
        changed = changed || mission.progress !== completedMission.progress || !mission.completed;
        return completedMission;
      });

      if (!changed) return prev;

      return {
        ...prev,
        missions,
        completedMissionIds: missions.filter(mission => mission.completed).map(mission => mission.id),
        claimedMissionIds: missions.filter(mission => mission.claimed).map(mission => mission.id),
      };
    });
  }, [
    cardLevels,
    isCardLevelsLoaded,
    isLoaded,
    isNewEarthMissionsLoaded,
  ]);

  const recordNewEarthMissionProgress = useCallback((event: Parameters<typeof recordNewEarthMissionEvent>[1]) => {
    setNewEarthMissions(prev => {
      const baseContext = newEarthMissionContextRef.current;
      const eventResult = recordNewEarthMissionEvent(prev, event);
      let context = baseContext;
      if (event.type === 'card-upgrade' && event.cardId && event.level != null) {
        const upgradedLevel = Math.max(1, Math.floor(Number(event.level) || 1));
        context = {
          ...context,
          upgradeableCards: (context.upgradeableCards || []).map(card => (
            card.id === event.cardId ? { ...card, level: upgradedLevel } : card
          )),
        };
      }
      const normalized = normalizeNewEarthMissionState(
        eventResult.changed ? eventResult.state : prev,
        context
      );
      return JSON.stringify(normalized) === JSON.stringify(prev) ? prev : normalized;
    });
  }, []);

  useEffect(() => {
    const handleNewEarthMissionEvent = (event: Event) => {
      const detail = (event as CustomEvent<Parameters<typeof recordNewEarthMissionEvent>[1]>).detail;
      if (!detail?.type) return;
      recordNewEarthMissionProgress(detail);
    };

    window.addEventListener('qch:new-earth-mission-event', handleNewEarthMissionEvent);
    return () => window.removeEventListener('qch:new-earth-mission-event', handleNewEarthMissionEvent);
  }, [recordNewEarthMissionProgress]);

  const triggerSearchThreatCheck = useCallback((search: ActiveColonySearch) => {
    if (search.threatCheckedAt || Date.now() < search.threatCheckAt || Date.now() >= search.endsAt) return;
    const checkedAt = Date.now();
    const attacked = Math.random() * 100 < search.threatChance;

    setActiveSearches(prev => {
      const current = prev[search.searchKey];
      if (!current || current.threatCheckedAt) return prev;
      return {
        ...prev,
        [search.searchKey]: {
          ...current,
          threatCheckedAt: checkedAt,
          threatTriggeredAt: attacked ? checkedAt : current.threatTriggeredAt,
        },
      };
    });

    setSearchThreatBonus(prev => ({
      ...prev,
      [search.id]: attacked ? 0 : Math.min(100, (prev[search.id] || 0) + SEARCH_THREAT_BONUS_STEP),
    }));

    if (!attacked) return;

    playRandomBobbyBlueWarningSfx();

    const threat: PendingDefenseThreat = {
      id: `threat-${search.searchKey}-${checkedAt}-${Math.random().toString(36).slice(2, 8)}`,
      sourceSearchId: search.id,
      sourceSearchKey: search.searchKey,
      sourceTitle: search.title,
      rewards: search.rewards,
      threatChance: search.threatChance,
      detectedAt: checkedAt,
      expiresAt: checkedAt + DEFENSE_THREAT_RESPONSE_SECONDS * 1000,
      status: 'pending',
    };
    setPendingDefenseThreats(prev => [
      threat,
      ...prev,
    ].slice(0, MAX_PENDING_DEFENSE_THREATS));
    setCardFeedback(t('Hostile contact detected during search', 'Contato hostil detectado durante a busca'));
  }, [t]);

  const completeSearch = useCallback((search: ActiveColonySearch) => {
    const resourcesSettledByDefense = Boolean(search.threatTriggeredAt || search.rewardResolved);
    const rewardText = (Object.entries(search.rewards) as Array<[ColonySupplyId, number]>)
      .map(([key, value]) => `+${value} ${SUPPLY_CONFIG[key].label[language]}`)
      .join(' · ');

    if (!resourcesSettledByDefense) {
      const nextSupplies = applySupplyDelta(colonySuppliesRef.current, search.rewards);
      colonySuppliesRef.current = nextSupplies;
      setColonySupplies(nextSupplies);
    }
    setActiveSearches(prev => {
      const next = { ...prev };
      delete next[search.searchKey];
      return next;
    });
    setSearchRemainingSeconds(prev => ({ ...prev, [search.searchKey]: 0 }));
    recordNewEarthMissionProgress({ type: 'search-complete', searchId: search.id });
    setLastSearchReport(resourcesSettledByDefense
      ? t(`${search.title} returned after hostile contact. Resolve the defense to secure its resources.`, `${search.title} retornou após contato hostil. Resolva a defesa para garantir os recursos.`)
      : t(`${search.title} completed. ${rewardText}`, `${search.title} concluída. ${rewardText}`)
    );
    setCardFeedback(resourcesSettledByDefense
      ? t('Search completed with pending defense', 'Busca concluída com defesa pendente')
      : t('Search completed', 'Busca concluída')
    );
  }, [language, recordNewEarthMissionProgress, t]);

  useEffect(() => {
    const activeList = Object.values(activeSearches).filter(Boolean) as ActiveColonySearch[];
    if (activeList.length === 0) return;

    const updateSearchClock = () => {
      const nextRemaining: Record<string, number> = {};
      activeList.forEach(search => {
        triggerSearchThreatCheck(search);
        const remaining = Math.max(0, Math.ceil((search.endsAt - Date.now()) / 1000));
        nextRemaining[search.searchKey] = remaining;
        if (remaining <= 0) completeSearch(search);
      });
      setSearchRemainingSeconds(prev => {
        const changed = Object.entries(nextRemaining).some(([key, value]) => prev[key] !== value);
        return changed ? { ...prev, ...nextRemaining } : prev;
      });
    };

    updateSearchClock();
    const interval = window.setInterval(updateSearchClock, 1000);
    return () => window.clearInterval(interval);
  }, [activeSearches, completeSearch, triggerSearchThreatCheck]);

  useEffect(() => {
    if (defenseAlertsPaused) {
      onDefenseThreatAlertChange?.(null);
      return;
    }

    if (pendingDefenseThreats.length === 0) {
      onDefenseThreatAlertChange?.(null);
      return;
    }

    const updateDefenseThreatClock = () => {
      const now = Date.now();
      let expiredCount = 0;

      setPendingDefenseThreats(prev => {
        const next = prev.filter(threat => {
          if (threat.id === activeDefenseThreat?.id || threat.openedAt || !threat.expiresAt) return true;
          const expired = threat.expiresAt <= now;
          if (expired) expiredCount += 1;
          return !expired;
        });
        return next.length === prev.length ? prev : next;
      });

      if (expiredCount > 0) {
        setCardFeedback(language === 'pt'
          ? 'Janela de defesa encerrada. Os recursos da expedição foram perdidos.'
          : 'Defense window expired. Expedition resources were lost.'
        );
      }

      setDefenseAlertTick(now);
    };

    updateDefenseThreatClock();
    const interval = window.setInterval(updateDefenseThreatClock, 1000);
    return () => window.clearInterval(interval);
  }, [activeDefenseThreat?.id, defenseAlertsPaused, language, onDefenseThreatAlertChange, pendingDefenseThreats.length]);

  useEffect(() => {
    if (defenseAlertsPaused) {
      onDefenseThreatAlertChange?.(null);
      return;
    }

    const now = typeof defenseAlertTick === 'number' && defenseAlertTick > 0 ? defenseAlertTick : Date.now();
    const alertThreat = pendingDefenseThreats.find(threat => (
      threat.id !== activeDefenseThreat?.id &&
      !threat.openedAt &&
      Boolean(threat.expiresAt) &&
      (threat.expiresAt || 0) > now
    ));

    if (!alertThreat) {
      onDefenseThreatAlertChange?.(null);
      return;
    }

    onDefenseThreatAlertChange?.({
      title: alertThreat.sourceTitle,
      remainingSeconds: Math.max(0, Math.ceil(((alertThreat.expiresAt || now) - now) / 1000)),
    });
  }, [activeDefenseThreat?.id, defenseAlertTick, defenseAlertsPaused, onDefenseThreatAlertChange, pendingDefenseThreats]);

  useEffect(() => {
    if (!openDefenseRequest || handledOpenDefenseRequestRef.current === openDefenseRequest) return;
    handledOpenDefenseRequestRef.current = openDefenseRequest;
    if (activeDefenseThreat) return;

    const threat = pendingDefenseThreats.find(item => (
      !item.openedAt &&
      Boolean(item.expiresAt)
    ));
    if (!threat) return;

    const openedAt = Date.now();
    setShowDefenseHangar(false);
    setPendingDefenseThreats(prev => prev.map(item => (
      item.id === threat.id ? { ...item, openedAt, expiresAt: undefined } : item
    )));
    onDefenseThreatAlertChange?.(null);
    setActiveDefenseThreat({ ...threat, openedAt, expiresAt: undefined });
  }, [activeDefenseThreat, onDefenseThreatAlertChange, openDefenseRequest, pendingDefenseThreats]);

  useEffect(() => {
    if (!abandonDefenseRequest || handledAbandonDefenseRequestRef.current === abandonDefenseRequest) return;
    handledAbandonDefenseRequestRef.current = abandonDefenseRequest;

    const now = Date.now();
    const threat = pendingDefenseThreats.find(item => (
      !item.openedAt &&
      Boolean(item.expiresAt) &&
      (item.expiresAt || 0) > now
    ));
    if (!threat) return;

    setPendingDefenseThreats(prev => prev.filter(item => item.id !== threat.id));
    onDefenseThreatAlertChange?.(null);
    setCardFeedback(language === 'pt'
      ? 'Defesa abandonada. A equipe de busca foi derrotada.'
      : 'Defense abandoned. The search team was defeated.'
    );
  }, [abandonDefenseRequest, language, onDefenseThreatAlertChange, pendingDefenseThreats]);

  useEffect(() => {
    if (!cardFeedback) return;
    const timer = window.setTimeout(() => setCardFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [cardFeedback]);

  useEffect(() => {
    const handleLevelsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ColonyCardLevels>).detail;
      if (detail && typeof detail === 'object') setCardLevels(detail);
    };
    window.addEventListener('qch:colony-card-levels-updated', handleLevelsUpdated);
    return () => window.removeEventListener('qch:colony-card-levels-updated', handleLevelsUpdated);
  }, []);

  // Remove local growth logic to centralize it in GameDashboard
  // (Removed calculateGrowth and its useEffect)

  // Handle Year Addition and Building Completion on Level Up
  useEffect(() => {
    if (!isLoaded) return;
    
    let totalYearsToAdd = 0;
    
    colonies.forEach(colony => {
      const colonyPrevLevels = lastBuildingLevelsRef.current[colony.id] || {};
      const hasLevelBaseline = Object.prototype.hasOwnProperty.call(lastBuildingLevelsRef.current, colony.id);
      const newLevels: Record<string, number> = {};
      
      colony.constructions.forEach(con => {
        const prevLevel = colonyPrevLevels[con.type] || 0;
        if (con.level > prevLevel) {
          // If level increased, notify and count years
          if (hasLevelBaseline) {
            totalYearsToAdd += (con.level - prevLevel);
            // Notify for EACH level gained if multiple
            for (let l = prevLevel + 1; l <= con.level; l++) {
              if (onBuildingComplete) onBuildingComplete(con.type, l);
              let completedMission = false;
              setNewEarthMissions(prev => {
                const result = recordNewEarthMissionEvent(normalizeNewEarthMissionState(prev, newEarthMissionContext), {
                  type: 'construction-complete',
                  colonyId: colony.id,
                  constructionType: con.type,
                  completedCount: l,
                });
                completedMission = result.completedMissionIds.length > 0;
                return result.changed ? result.state : prev;
              });
              if (completedMission) {
                setCardFeedback(t('New Earth mission completed', 'Missão da Nova Terra concluída'));
                playNewEarthMissionCompleteVoice();
              }
            }
          }
        }
        newLevels[con.type] = con.level;
      });
      
      lastBuildingLevelsRef.current[colony.id] = newLevels;
    });

    if (totalYearsToAdd > 0) {
      onAddYear(totalYearsToAdd);
    }
  }, [colonies, onAddYear, onBuildingComplete, isLoaded, newEarthMissionContext, playNewEarthMissionCompleteVoice, t]);

  const activeColony = useMemo(() => 
    colonies.find(c => c.id === effectiveActiveColonyId) || null
  , [colonies, effectiveActiveColonyId]);

  const allColoniesFullyBuilt = useMemo(() => (
    colonies.length > 0 && colonies.every(colony => isColonyReadyForPopulation(colony.constructions))
  ), [colonies]);

  const ownedCards = useMemo(() =>
    ownedCardIds
      .map(id => getCardById(id))
      .filter(Boolean) as ColonyCard[]
  , [ownedCardIds]);

  const ownedBattleCards = useMemo(() =>
    ownedCards.filter(card => isBattleCard(card))
  , [ownedCards]);

  const battleLoadoutCards = useMemo(() =>
    BATTLE_CARD_SLOTS
      .map(slot => getCardById(battleLoadout[slot]))
      .filter(Boolean)
      .filter(card => card && isBattleCard(card)) as ColonyCard[]
  , [battleLoadout]);

  const horizonMaxLevel = allColoniesFullyBuilt ? MAX_HORIZON_LEVEL : BASE_HORIZON_LEVEL_CAP;
  const horizonProgress = useMemo(() => getHorizonLevelFromXp(horizonXp, horizonMaxLevel), [horizonMaxLevel, horizonXp]);
  const battleStatTotals = useMemo(() => calculateBattleStatTotals(battleLoadoutCards, cardLevels), [battleLoadoutCards, cardLevels]);
  const battleShipStats = useMemo(() => calculateBattleShipStats(battleLoadoutCards, BASE_BATTLE_SHIP_STATS, cardLevels, horizonProgress.level), [battleLoadoutCards, cardLevels, horizonProgress.level]);
  const trinityShotEnabled = useMemo(() => (
    battleLoadoutCards.some(card => card.id === TRINITY_REACTOR_CARD_ID)
  ), [battleLoadoutCards]);
  const latestActiveSearchesByType = useMemo(() => {
    const activeList = Object.values(activeSearches).filter(Boolean) as ActiveColonySearch[];
    return (['land', 'sea'] as const)
      .map(id => activeList
        .filter(search => search.id === id)
        .sort((a, b) => b.startedAt - a.startedAt)[0]
      )
      .filter(Boolean) as ActiveColonySearch[];
  }, [activeSearches]);
  const activeBattleStatTotals = useMemo(() => (
    Object.entries(battleStatTotals).filter(([, value]) => value !== 0)
  ), [battleStatTotals]);
  const battleCardCodexPageCount = Math.max(1, Math.ceil(ownedBattleCards.length / BATTLE_CARD_CODEX_PAGE_SIZE));
  const activeBattleCardCodexPage = Math.min(battleCardCodexPage, battleCardCodexPageCount - 1);
  const visibleBattleCodexCards = useMemo(() => (
    ownedBattleCards.slice(
      activeBattleCardCodexPage * BATTLE_CARD_CODEX_PAGE_SIZE,
      activeBattleCardCodexPage * BATTLE_CARD_CODEX_PAGE_SIZE + BATTLE_CARD_CODEX_PAGE_SIZE
    )
  ), [ownedBattleCards, activeBattleCardCodexPage]);
  const selectedCardNavigationList = selectedCard
    ? (isBattleCard(selectedCard.card) ? ownedBattleCards : ownedCards.filter(isPoliticalCard))
    : [];
  const selectedCardNavigationIndex = selectedCard
    ? selectedCardNavigationList.findIndex(card => card.id === selectedCard.card.id)
    : -1;
  const selectedCardNavigationLabel = selectedCardNavigationList.length > 1 && selectedCardNavigationIndex >= 0
    ? `${selectedCardNavigationIndex + 1}/${selectedCardNavigationList.length}`
    : undefined;
  const equippedPoliticalPassiveCards = useMemo(() => (
    colonies.flatMap(colony => (
      Object.values(colony.equippedCards || {})
        .map(id => getCardById(id))
        .filter(Boolean)
        .filter(card => card && isPoliticalCard(card)) as ColonyCard[]
    ))
  ), [colonies]);
  const ownedPassiveBonuses = useMemo(() => (
    equippedPoliticalPassiveCards.reduce((acc, card) => {
      const passiveBonuses = getPoliticalPassiveBonuses(card, cardLevels);
      acc.constructorsAllColonies += passiveBonuses.constructorsAllColonies || 0;
      acc.allSectorBonus += passiveBonuses.allSectorBonus || 0;
      acc.constructionSpeedPercent += passiveBonuses.constructionSpeedPercent || 0;
      return acc;
    }, { constructorsAllColonies: 0, allSectorBonus: 0, constructionSpeedPercent: 0 })
  ), [equippedPoliticalPassiveCards, cardLevels]);

  useEffect(() => {
    allSectorBonusRef.current = ownedPassiveBonuses.allSectorBonus;
  }, [ownedPassiveBonuses.allSectorBonus]);

  const getEffectiveConstructors = useCallback((colony: Colony) => (
    colony.constructors + ownedPassiveBonuses.constructorsAllColonies
  ), [ownedPassiveBonuses.constructorsAllColonies]);

  useEffect(() => {
    if (battleCardCodexPage < battleCardCodexPageCount) return;
    setBattleCardCodexPage(Math.max(0, battleCardCodexPageCount - 1));
  }, [battleCardCodexPage, battleCardCodexPageCount]);

  const equippedCards = useMemo(() => {
    if (!activeColony) return [];
    return (Object.values(activeColony.equippedCards || {})
      .map(id => getCardById(id))
      .filter(Boolean) as ColonyCard[]);
  }, [activeColony]);

  const effectiveSectors = useMemo(() => {
    if (!activeColony) return DEFAULT_COLONY_SECTORS;
    const next = { ...DEFAULT_COLONY_SECTORS, ...(activeColony.sectors || {}) };
    if (ownedPassiveBonuses.allSectorBonus > 0) {
      (Object.keys(next) as ColonySectorId[]).forEach(sector => {
        next[sector] = Math.min(100, Math.max(0, next[sector] + ownedPassiveBonuses.allSectorBonus));
      });
    }
    equippedCards.forEach(card => {
      if (!isPoliticalCard(card)) return;
      getPoliticalEffects(card, cardLevels).forEach(effect => {
        next[effect.sector] = Math.min(100, Math.max(0, next[effect.sector] + effect.value));
      });
    });
    return next;
  }, [activeColony, equippedCards, cardLevels, ownedPassiveBonuses.allSectorBonus]);

  const getColonyEffectiveSectorScore = useCallback((colony: Colony) => {
    const next = { ...DEFAULT_COLONY_SECTORS, ...(colony.sectors || {}) };
    const allSectorBonus = allSectorBonusRef.current;
    const currentCardLevels = cardLevelsRef.current;
    if (allSectorBonus > 0) {
      (Object.keys(next) as ColonySectorId[]).forEach(sector => {
        next[sector] = Math.min(100, Math.max(0, next[sector] + allSectorBonus));
      });
    }

    const colonyCards = (Object.values(colony.equippedCards || {})
      .map(id => getCardById(id))
      .filter(Boolean)
      .filter(card => card && isPoliticalCard(card)) as ColonyCard[]);

    colonyCards.forEach(card => {
      getPoliticalEffects(card, currentCardLevels).forEach(effect => {
        next[effect.sector] = Math.min(100, Math.max(0, next[effect.sector] + effect.value));
      });
    });

    return (Object.values(next) as number[]).reduce((sum, value) => sum + value, 0);
  }, []);

  // Construction Progress Logic
  useEffect(() => {
    if (!isLoaded) return;

    const updateConstructionProgress = () => {
      const now = Date.now();
      setColonies(prev => {
        let hasGlobalChanges = false;

        const updatedColonies = prev.map(colony => {
          let hasColonyChanges = false;

          const updatedConstructions = colony.constructions.map(con => {
            if (con.level >= 10) {
              if (con.assignedConstructors > 0 || !con.isComplete || con.lastProgressAt) {
                hasColonyChanges = true;
                return { ...con, assignedConstructors: 0, isComplete: true, progress: 100, lastProgressAt: undefined };
              }
              return con;
            }

            if (con.assignedConstructors === 0) {
              if (con.lastProgressAt) {
                hasColonyChanges = true;
                return { ...con, lastProgressAt: undefined };
              }
              return con;
            }

            const lastProgressAt = Number(con.lastProgressAt) || now;
            const elapsedSeconds = Math.max(0, (now - lastProgressAt) / 1000);
            if (elapsedSeconds <= 0) return con;

            const config = CONSTRUCTION_CONFIG[con.type];
            const speedFactor = con.assignedConstructors / 10;
            const passiveSpeedMultiplier = 1 + ownedPassiveBonuses.constructionSpeedPercent / 100;
            const increment = (100 / config.baseTime) * speedFactor * passiveSpeedMultiplier * elapsedSeconds;
            const newProgress = Math.min(100, con.progress + increment);
            const isNowAtLevelComplete = newProgress >= 100;

            if (isNowAtLevelComplete) {
              const nextLevel = con.level + 1;
              hasColonyChanges = true;
              return {
                ...con,
                progress: nextLevel >= 10 ? 100 : 0,
                level: nextLevel,
                assignedConstructors: 0,
                isComplete: nextLevel >= 10,
                lastProgressAt: undefined
              };
            }

            if (newProgress !== con.progress || con.lastProgressAt !== now) {
              hasColonyChanges = true;
            }

            return {
              ...con,
              progress: newProgress,
              lastProgressAt: now
            };
          });

          if (!hasColonyChanges) return colony;
          hasGlobalChanges = true;

          return {
            ...colony,
            constructions: updatedConstructions,
            isHabitable: isColonyReadyForPopulation(updatedConstructions)
          };
        });

        return hasGlobalChanges ? updatedColonies : prev;
      });
    };

    updateConstructionProgress();
    const interval = setInterval(updateConstructionProgress, 1000);
    return () => clearInterval(interval);
  }, [isLoaded, ownedPassiveBonuses.constructionSpeedPercent, setColonies]);

  useEffect(() => {
    if (!isLoaded) return;

    const syncAutomaticPopulation = () => {
      let nextEarthPopulation: number | null = null;
      setColonies(prevColonies => {
        const habitableColonies = prevColonies.filter(colony => (
          isColonyReadyForPopulation(colony.constructions)
        ));
        if (habitableColonies.length === 0) {
          const lockedPopulation = prevColonies.reduce((sum, colony) => (
            sum + Math.max(0, Math.floor(colony.population || 0))
          ), 0);
          if (lockedPopulation <= 0) return prevColonies;
          nextEarthPopulation = Math.max(0, Math.floor(earthPopulationRef.current + lockedPopulation));
          return prevColonies.map(colony => (
            colony.population > 0
              ? { ...colony, population: 0, isHabitable: isColonyReadyForPopulation(colony.constructions) }
              : colony
          ));
        }

        const currentColonyPopulation = prevColonies.reduce((sum, colony) => sum + Math.max(0, Math.floor(colony.population || 0)), 0);
        const totalPopulation = Math.max(0, Math.floor(earthPopulationRef.current + currentColonyPopulation));
        if (totalPopulation <= 0) return prevColonies;

        const ratioNoise = (Math.sin(totalPopulation * 0.00013 + habitableColonies.length * 7.17) + 1) / 2;
        const colonialRatio = 0.7 + ratioNoise * 0.1;
        const targetColonialPopulation = Math.floor(totalPopulation * colonialRatio);
        const baseShareTotal = Math.floor(targetColonialPopulation * 0.8);
        const bonusShareTotal = targetColonialPopulation - baseShareTotal;
        const basePerColony = Math.floor(baseShareTotal / habitableColonies.length);
        const scoreByColony = new Map(habitableColonies.map(colony => [
          colony.id,
          Math.max(1, getColonyEffectiveSectorScore(colony)),
        ]));
        const totalScore = Array.from(scoreByColony.values()).reduce((sum, score) => sum + score, 0) || 1;
        let assignedColonialPopulation = 0;
        let hasPopulationChanges = false;

        const nextColonies = prevColonies.map(colony => {
          const currentPopulation = Math.max(0, Math.floor(colony.population || 0));
          if (!scoreByColony.has(colony.id)) {
            if (currentPopulation <= 0 && colony.isHabitable === isColonyReadyForPopulation(colony.constructions)) return colony;
            hasPopulationChanges = true;
            return {
              ...colony,
              population: 0,
              isHabitable: isColonyReadyForPopulation(colony.constructions),
            };
          }

          const targetPopulation = basePerColony + Math.floor(bonusShareTotal * (scoreByColony.get(colony.id)! / totalScore));
          const delta = targetPopulation - currentPopulation;
          const migrationStep = Math.sign(delta) * Math.min(Math.abs(delta), Math.max(1, Math.ceil(Math.abs(delta) * 0.08)));
          const nextPopulation = Math.max(0, currentPopulation + migrationStep);
          assignedColonialPopulation += nextPopulation;
          const isHabitable = isColonyReadyForPopulation(colony.constructions);
          if (nextPopulation === colony.population && colony.isHabitable === isHabitable) return colony;
          hasPopulationChanges = true;
          return { ...colony, population: nextPopulation, isHabitable };
        });

        nextEarthPopulation = Math.max(0, totalPopulation - assignedColonialPopulation);
        return hasPopulationChanges ? nextColonies : prevColonies;
      });

      if (nextEarthPopulation !== null && nextEarthPopulation !== earthPopulationRef.current) {
        earthPopulationRef.current = nextEarthPopulation;
        setEarthPopulationRef.current(nextEarthPopulation);
      }
    };

    syncAutomaticPopulation();
    const interval = window.setInterval(syncAutomaticPopulation, 15000);
    return () => window.clearInterval(interval);
  }, [getColonyEffectiveSectorScore, isLoaded, setColonies]);

  // Actions
  const equipCard = (card: ColonyCard): boolean => {
    if (!isPoliticalCard(card)) return false;
    if (!effectiveActiveColonyId) return false;
    const currentSlot = POLITICAL_CARD_SLOTS.find(slot => activeColony?.equippedCards?.[slot] === card.id);
    const targetSlot = currentSlot || getFreePoliticalSlot(activeColony?.equippedCards);
    if (!targetSlot) {
      setCardFeedback(t('This colony already has three political cards equipped', 'Esta colônia já possui três cartas políticas equipadas'));
      return false;
    }

    setColonies(prev => prev.map(colony => {
      if (colony.id !== effectiveActiveColonyId) return colony;

      const equippedCards = { ...(colony.equippedCards || {}) };
      Object.keys(equippedCards).forEach(slot => {
        if (equippedCards[slot as ColonyCardSlot] === card.id) {
          delete equippedCards[slot as ColonyCardSlot];
        }
      });
      equippedCards[targetSlot] = card.id;

      return { ...colony, equippedCards };
    }));
    playSfx?.('equip_card');
    setCardFeedback(t('Card equipped', 'Carta equipada'));
    return true;
  };

  const unequipCard = (slot: ColonyCardSlot) => {
    if (!effectiveActiveColonyId) return;
    setColonies(prev => prev.map(colony => {
      if (colony.id !== effectiveActiveColonyId) return colony;
      const equippedCards = { ...(colony.equippedCards || {}) };
      delete equippedCards[slot];
      return { ...colony, equippedCards };
    }));
    playSfx?.('unequip_card');
    setCardFeedback(t('Card removed', 'Carta retirada'));
  };

  const openCardDetails = (card: ColonyCard, action: 'equip' | 'remove', slot?: ColonyCardSlot) => {
    if (!isPoliticalCard(card)) return;
    const currentSlot = POLITICAL_CARD_SLOTS.find(slotId => activeColony?.equippedCards?.[slotId] === card.id);
    const blockedBy = action === 'equip' && !currentSlot && !getFreePoliticalSlot(activeColony?.equippedCards)
      ? t('three active political cards', 'três cartas políticas ativas')
      : undefined;

    setSelectedCard({ card, action, slot, blockedBy });
    playSfx?.('view_card');
  };

  const openBattleCardDetails = (card: ColonyCard, action: 'equip' | 'remove' = 'equip', slot?: BattleCardSlot) => {
    if (!isBattleCard(card)) return;
    setSelectedCard({ card, action, slot });
    playSfx?.('view_card');
  };

  const navigateSelectedCard = (direction: -1 | 1) => {
    if (!selectedCard) return;
    const currentList = isBattleCard(selectedCard.card) ? ownedBattleCards : ownedCards.filter(isPoliticalCard);
    if (currentList.length <= 1) return;
    const currentIndex = currentList.findIndex(card => card.id === selectedCard.card.id);
    if (currentIndex < 0) return;
    const nextCard = currentList[(currentIndex + direction + currentList.length) % currentList.length];
    if (isBattleCard(nextCard)) {
      const slot = BATTLE_CARD_SLOTS.find(slotId => battleLoadout[slotId] === nextCard.id);
      setSelectedCard({ card: nextCard, action: slot ? 'remove' : 'equip', slot });
    } else {
      const slot = POLITICAL_CARD_SLOTS.find(slotId => activeColony?.equippedCards?.[slotId] === nextCard.id);
      const blockedBy = !slot && !getFreePoliticalSlot(activeColony?.equippedCards)
        ? t('three active political cards', 'três cartas políticas ativas')
        : undefined;
      setSelectedCard({ card: nextCard, action: slot ? 'remove' : 'equip', slot, blockedBy });
    }
    playSfx?.('view_card');
  };

  const confirmSelectedCardAction = () => {
    if (!selectedCard) return;
    if (selectedCard.action === 'remove' && selectedCard.slot) {
      if (isBattleCard(selectedCard.card)) {
        unequipBattleCard(selectedCard.slot as BattleCardSlot);
      } else {
        unequipCard(selectedCard.slot as ColonyCardSlot);
      }
    } else {
      if (isBattleCard(selectedCard.card)) {
        equipBattleCard(selectedCard.card);
      } else {
        equipCard(selectedCard.card);
      }
    }
  };

  const getCardUnlockRequirement = (card: ColonyCard) => {
    return {
      met: false,
      label: t(
        'Chapter 4 drops: defense battles or arcade score rewards',
        'Drops do Capítulo 4: batalhas de defesa ou prêmios de pontuação dos fliperamas'
      ),
    };
  };

  const claimCard = (cardId: string) => {
    const card = getCardById(cardId);
    if (!card || ownedCardIds.includes(cardId)) return;
    const requirement = getCardUnlockRequirement(card);
    if (!requirement.met) return;
    setOwnedCardIds(prev => [...prev, cardId]);
    setManagementPanel('council');
    setCardEvent(card);
    playSfx?.('claim_card');
  };

  const startConstruction = (type: ConstructionType) => {
    if (!activeColony) return;

    // Rule: Must build 1 of each type first before free construction
    const typesBuilt = new Set(activeColony.constructions.filter(c => c.isComplete).map(c => c.type));
    const allTypes = Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[];
    const hasAtLeastOneOfEach = allTypes.every(t => typesBuilt.has(t));

    if (!hasAtLeastOneOfEach) {
      const existing = activeColony.constructions.find(c => c.type === type);
      if (existing) return;
    }

    // Limit max units
    const count = activeColony.constructions.filter(c => c.type === type).length;
    if (count >= CONSTRUCTION_CONFIG[type].maxUnits) return;

    const newConstruction: Construction = {
      id: `const-${Date.now()}`,
      type,
      level: 1,
      progress: 0,
      assignedConstructors: 0,
      isComplete: false,
      order: activeColony.constructions.length,
      lastProgressAt: undefined
    };

    setColonies(prev => prev.map(c => 
      c.id === effectiveActiveColonyId 
        ? { ...c, constructions: [...c.constructions, newConstruction] }
        : c
    ));
  };

  const updateConstructors = (id: string, delta: number) => {
    if (!effectiveActiveColonyId) return false;
    
    // 1. Encontrar a colônia e construção no estado atual (prop) para cálculos prévios
    const colony = colonies.find(c => c.id === effectiveActiveColonyId);
    if (!colony) return false;
    
    const construction = colony.constructions.find(con => con.id === id);
    if (!construction || construction.level >= 10) return false;

    const totalAssigned = colony.constructions.reduce((sum, con) => sum + con.assignedConstructors, 0);
    const available = getEffectiveConstructors(colony) - totalAssigned;

    let finalDelta = delta;
    
    // Se for adicionar, respeitar limite disponível e suprimentos
    if (finalDelta > 0) {
      finalDelta = Math.min(finalDelta, available);
      const requestedBatches = Math.floor(finalDelta / 50);
      const supplyCost = CONSTRUCTION_SUPPLY_COST[construction.type];
      
      // Usar a Ref ou o Estado atual para checar suprimentos
      const currentSupplies = colonySuppliesRef.current;
      const affordableBatches = getAffordableBatches(currentSupplies, supplyCost, requestedBatches);

      if (affordableBatches <= 0) {
        setCardFeedback(t('Insufficient supplies', 'Suprimentos insuficientes'));
        return false;
      }

      finalDelta = Math.min(finalDelta, affordableBatches * 50);
      
      // Atualizar suprimentos FORA do setColonies
      const nextSupplies = applySupplyDelta(currentSupplies, supplyCost, -affordableBatches);
      colonySuppliesRef.current = nextSupplies;
      setColonySupplies(nextSupplies);
    } 
    // Se for remover, não pode remover mais do que tem alocado
    else if (finalDelta < 0) {
      finalDelta = Math.max(finalDelta, -construction.assignedConstructors);
    }

    if (finalDelta === 0) return false;

    // 2. Agora atualizar as colônias apenas com o delta já validado
    setColonies(prev => {
      const activeIdx = prev.findIndex(c => c.id === effectiveActiveColonyId);
      if (activeIdx === -1) return prev;

      const targetColony = prev[activeIdx];
      const now = Date.now();
      const updatedConstructions = targetColony.constructions.map(con => {
        if (con.id !== id) return con;
        const nextAssignedConstructors = con.assignedConstructors + finalDelta;
        return {
          ...con,
          assignedConstructors: nextAssignedConstructors,
          lastProgressAt: nextAssignedConstructors > 0 ? (con.lastProgressAt || now) : undefined
        };
      });

      const next = [...prev];
      next[activeIdx] = { ...targetColony, constructions: updatedConstructions };
      return next;
    });

    return true;
  };

  const claimNewEarthMission = useCallback((missionId: string) => {
    const mission = newEarthMissions.missions.find(item => item.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    const completesCycle = newEarthMissions.missions.length > 0
      && newEarthMissions.missions.every(item => item.claimed || item.id === missionId);
    const claimed = markNewEarthMissionClaimed(newEarthMissions, missionId);
    const claimedMissionState = completesCycle
      ? claimed
      : refreshNewEarthMissionBoard(claimed, newEarthMissionContext);

    setNewEarthMissions(claimedMissionState);
    GameStorage.save(claimedMissionState, NEW_EARTH_MISSIONS_STORAGE_KEY);

    playRoute4UiSfx(ROUTE4_QUEST_REWARD_SFX);
    if (claimedMissionState.cycle !== newEarthMissions.cycle) {
      setTimeout(() => playRoute4UiSfx(ROUTE4_QUESTS_RENEW_SFX), 800);
    }

    const reward = mission.reward;
    if (reward.qc) {
      onEarnQC?.(reward.qc, 'mission');
    }

    if (reward.supplies) {
      const nextSupplies = applySupplyDelta(colonySuppliesRef.current, reward.supplies);
      colonySuppliesRef.current = nextSupplies;
      setColonySupplies(nextSupplies);
    }

    if (reward.colonyBonus) {
      const targetColonyId = reward.colonyBonus.colonyId === 'active'
        ? effectiveActiveColonyId
        : reward.colonyBonus.colonyId;
      if (targetColonyId) {
        setColonies(prev => prev.map(colony => (
          colony.id === targetColonyId
            ? {
              ...colony,
              sectors: {
                ...DEFAULT_COLONY_SECTORS,
                ...(colony.sectors || {}),
                [reward.colonyBonus!.sector]: Math.min(
                  100,
                  Math.max(0, Number(colony.sectors?.[reward.colonyBonus!.sector] ?? DEFAULT_COLONY_SECTORS[reward.colonyBonus!.sector]) + reward.colonyBonus!.value)
                ),
              },
            }
            : colony
        )));
      }
    }

    if (reward.missingCard) {
      const card = rollAnyMissingColonyCardReward(ownedCardIds);
      if (card) {
        const nextOwned = normalizeOwnedColonyCardIds([...ownedCardIds, card.id]);
        setOwnedCardIds(nextOwned);
        GameStorage.save(nextOwned, 'colony_cards_data');
        setCardEvent(card);
        playSfx?.('claim_card');
      } else {
        onEarnQC?.(35000, 'mission');
      }
    }

    setCardFeedback(completesCycle
      ? t('Final mission bonus releasing.', 'Bonificação final das missões liberando.')
      : t('Mission reward claimed', 'Recompensa da missão resgatada')
    );
  }, [newEarthMissions, newEarthMissionContext, onEarnQC, effectiveActiveColonyId, setColonies, ownedCardIds, playSfx, t]);

  const renewNewEarthMissionsWithoutBonus = useCallback(() => {
    if (newEarthMissions.missions.some(mission => mission.completed && !mission.claimed)) {
      setCardFeedback(t(
        'Claim ready mission rewards before renewing.',
        'Resgate as missões prontas antes de renovar.'
      ));
      return;
    }

    if (newEarthMissionCycleBonusTimeoutRef.current) {
      window.clearTimeout(newEarthMissionCycleBonusTimeoutRef.current);
      newEarthMissionCycleBonusTimeoutRef.current = null;
    }
    if (newEarthMissionCycleBonusDrainIntervalRef.current) {
      window.clearInterval(newEarthMissionCycleBonusDrainIntervalRef.current);
      newEarthMissionCycleBonusDrainIntervalRef.current = null;
    }
    scheduledNewEarthMissionCycleBonusRef.current = null;
    paidNewEarthMissionCycleBonusRef.current = newEarthMissions.cycle;
    setNewEarthMissionCycleBonusAnimation(null);

    const resetBase = {
      ...newEarthMissions,
      missions: [],
      completedMissionIds: [],
      claimedMissionIds: [],
      renewAvailableAt: null,
      cycleRewardClaimed: true,
    };
    const next = refreshNewEarthMissionBoard(resetBase, newEarthMissionContext, Date.now(), true);
    setNewEarthMissions(next);
    GameStorage.save(next, NEW_EARTH_MISSIONS_STORAGE_KEY);
    playRoute4UiSfx(ROUTE4_QUESTS_RENEW_SFX);
    setCardFeedback(t(
      'Mission board renewed. Current bonus was forfeited.',
      'Painel de missões renovado. A bonificação atual foi perdida.'
    ));
  }, [newEarthMissions, newEarthMissionContext, t]);

  const resolveDefenseVictory = useCallback((summary?: BattleResultSummary) => {
    if (!activeDefenseThreat) return;
    const reward = rollAnyMissingColonyCardReward(ownedCardIds);
    const kills = summary?.kills || 18;
    const battleXp = summary?.xp || (kills * 45 + 450);
    const battleQc = summary?.qc || (kills * 4200 + 35000);
    const supplyReward: Partial<ColonySupplies> = {
      materials: 10 + kills,
      tech: 6 + Math.floor(kills / 3),
      defense: 3 + Math.floor(kills / 4),
    };
    const defendedSearchRewards = activeDefenseThreat.rewards || {};
    const defendedSearchBonus = scaleSupplyRewards(defendedSearchRewards, DEFENSE_VICTORY_REWARD_BONUS_PERCENT / 100);
    const nextSupplies = applySupplyDelta(
      applySupplyDelta(
        applySupplyDelta(colonySuppliesRef.current, defendedSearchRewards),
        defendedSearchBonus
      ),
      supplyReward
    );
    colonySuppliesRef.current = nextSupplies;
    setColonySupplies(nextSupplies);
    const previousHorizonXp = horizonXpRef.current;
    const nextHorizonXp = previousHorizonXp + battleXp;
    const previousHorizonLevel = getHorizonLevelFromXp(previousHorizonXp, horizonMaxLevel).level;
    const nextHorizonLevel = getHorizonLevelFromXp(nextHorizonXp, horizonMaxLevel).level;
    horizonXpRef.current = nextHorizonXp;
    setHorizonXp(nextHorizonXp);
    if (nextHorizonLevel > previousHorizonLevel && !summary?.levelUpSfxHandled) {
      playRoute4BattleSfx(HORIZON_LEVEL_UP_SFX, 0.78);
    }
    setDefenseBattleLevel(prev => Math.max(1, Math.floor(prev)) + 1);
    onEarnQC?.(battleQc, 'battle');
    if (activeDefenseThreat.sourceSearchKey) {
      setActiveSearches(prev => {
        const search = prev[activeDefenseThreat.sourceSearchKey || ''];
        if (!search) return prev;
        return {
          ...prev,
          [search.searchKey]: {
            ...search,
            rewardResolved: true,
          },
        };
      });
    }
    setPendingDefenseThreats(prev => prev.filter(threat => threat.id !== activeDefenseThreat.id));
    setActiveDefenseThreat(null);
    recordNewEarthMissionProgress({ type: 'defense-victory' });
    recordNewEarthMissionProgress({ type: 'defense-kills', amount: kills });
    recordNewEarthMissionProgress({ type: 'defense-bosses', amount: Math.max(1, Math.floor(Number(summary?.bossesDefeated) || 1)) });

    if (reward) {
      const nextOwned = normalizeOwnedColonyCardIds([...ownedCardIds, reward.id]);
      setOwnedCardIds(nextOwned);
      GameStorage.save(nextOwned, 'colony_cards_data');
      setLegendaryBattleCardPity(prev => (
        isBattleCard(reward) && reward.rarity !== 'legendary'
          ? prev + LEGENDARY_BATTLE_CARD_PITY_STEP
          : prev
      ));
      setCardEvent(reward);
      playSfx?.('claim_card');
      setCardFeedback(t(
        `Battle won: +${battleXp} XP, +${formatValue(battleQc)} QC and card acquired`,
        `Batalha vencida: +${battleXp} XP, +${formatValue(battleQc)} QC e carta adquirida`
      ));
      return;
    }

    setLegendaryBattleCardPity(prev => prev + LEGENDARY_BATTLE_CARD_PITY_STEP);
    setCardFeedback(t(
      `Threat neutralized: +${battleXp} XP and +${formatValue(battleQc)} QC`,
      `Ameaça neutralizada: +${battleXp} XP e +${formatValue(battleQc)} QC`
    ));
  }, [activeDefenseThreat, ownedCardIds, playSfx, onEarnQC, formatValue, horizonMaxLevel, recordNewEarthMissionProgress]);

  const resolveDefenseDefeat = useCallback(() => {
    const retryUntil = Date.now() + DEFENSE_THREAT_RESPONSE_SECONDS * 1000;
    if (activeDefenseThreat) {
      setPendingDefenseThreats(prev => prev.map(threat => (
        threat.id === activeDefenseThreat.id ? { ...threat, openedAt: undefined, expiresAt: retryUntil } : threat
      )));
    }
    setActiveDefenseThreat(null);
    setCardFeedback(language === 'pt' ? 'Defesa falhou. A ameaça permanece pendente.' : 'Defense failed. Threat remains pending.');
  }, [activeDefenseThreat, language]);

  const resolveSearchBattleVictory = useCallback((summary?: BattleResultSummary) => {
    if (!activeSearchBattle) return;

    const battleIndex = activeSearchBattle.battleIndex;
    const battleNumber = battleIndex + 1;
    const kills = summary?.kills || 20;
    const battleXp = summary?.xp || (kills * 45 + 550 + battleIndex * 80);
    const battleQc = SEARCH_BATTLE_QC_REWARDS[battleIndex] || SEARCH_BATTLE_QC_REWARDS[0];
    const targetColonyId = effectiveActiveColonyId || colonies[0]?.id || null;
    const targetColony = colonies.find(colony => colony.id === targetColonyId) || null;
    const availableSentimentSectors = SEARCH_BATTLE_SENTIMENT_SECTORS.filter(sector => (
      Number(targetColony?.sectors?.[sector] ?? DEFAULT_COLONY_SECTORS[sector]) < 100
    ));
    const sentimentPool = availableSentimentSectors.length > 0 ? availableSentimentSectors : SEARCH_BATTLE_SENTIMENT_SECTORS;
    const sentimentSector = sentimentPool[Math.floor(Math.random() * sentimentPool.length)] || 'happiness';
    const sentimentValue = 3 + Math.floor(Math.random() * 5);
    let nextOwned = normalizeOwnedColonyCardIds(ownedCardIds);
    const awardedCards: ColonyCard[] = [];

    const previousHorizonXp = horizonXpRef.current;
    const nextHorizonXp = previousHorizonXp + battleXp;
    const previousHorizonLevel = getHorizonLevelFromXp(previousHorizonXp, horizonMaxLevel).level;
    const nextHorizonLevel = getHorizonLevelFromXp(nextHorizonXp, horizonMaxLevel).level;
    horizonXpRef.current = nextHorizonXp;
    setHorizonXp(nextHorizonXp);
    if (nextHorizonLevel > previousHorizonLevel && !summary?.levelUpSfxHandled) {
      playRoute4BattleSfx(HORIZON_LEVEL_UP_SFX, 0.78);
    }

    if (targetColonyId) {
      setColonies(prev => prev.map(colony => (
        colony.id === targetColonyId
          ? {
              ...colony,
              sectors: {
                ...(colony.sectors || {}),
                [sentimentSector]: Math.min(
                  100,
                  Math.max(0, Number(colony.sectors?.[sentimentSector] ?? DEFAULT_COLONY_SECTORS[sentimentSector]) + sentimentValue)
                ),
              },
            }
          : colony
      )));
    }

    onEarnQC?.(battleQc, 'battle');
    if (Math.random() < SEARCH_BATTLE_CARD_CHANCE) {
      const card = rollAnyMissingColonyCardReward(nextOwned);
      if (card) {
        nextOwned = normalizeOwnedColonyCardIds([...nextOwned, card.id]);
        awardedCards.push(card);
      }
    }

    const completesCycle = battleIndex >= SEARCH_BATTLE_TOTAL - 1;
    if (completesCycle) {
      onEarnQC?.(SEARCH_BATTLE_FINAL_QC_REWARD, 'battle');
      const guaranteedCard = rollAnyMissingColonyCardReward(nextOwned);
      if (guaranteedCard) {
        nextOwned = normalizeOwnedColonyCardIds([...nextOwned, guaranteedCard.id]);
        awardedCards.push(guaranteedCard);
      }
    }

    if (awardedCards.length > 0) {
      setOwnedCardIds(nextOwned);
      GameStorage.save(nextOwned, 'colony_cards_data');
      setCardEvent(awardedCards[awardedCards.length - 1]);
      playSfx?.('claim_card');
    }

    setDefenseBattleLevel(prev => Math.max(1, Math.floor(prev)) + 1);
    setSearchBattleCycle(prev => (
      completesCycle
        ? { nextBattleIndex: 0, cycle: prev.cycle + 1 }
        : { ...prev, nextBattleIndex: Math.min(SEARCH_BATTLE_TOTAL - 1, battleIndex + 1) }
    ));
    setActiveSearchBattle(null);
    recordNewEarthMissionProgress({ type: 'defense-victory' });
    recordNewEarthMissionProgress({ type: 'defense-kills', amount: kills });
    recordNewEarthMissionProgress({ type: 'defense-bosses', amount: Math.max(1, Math.floor(Number(summary?.bossesDefeated) || 1)) });

    const sentimentLabel = SECTOR_CONFIG[sentimentSector].label[language];
    const cardText = awardedCards.length > 0
      ? t(' and card acquired', ' e carta adquirida')
      : '';
    const finalText = completesCycle
      ? t(` Final bonus: +${formatValue(SEARCH_BATTLE_FINAL_QC_REWARD)} QC.`, ` Bônus final: +${formatValue(SEARCH_BATTLE_FINAL_QC_REWARD)} QC.`)
      : '';
    setCardFeedback(t(
      `Battle ${battleNumber} won: +${formatValue(battleQc)} QC, +${sentimentValue} ${sentimentLabel}${cardText}.${finalText}`,
      `Batalha ${battleNumber} vencida: +${formatValue(battleQc)} QC, +${sentimentValue} ${sentimentLabel}${cardText}.${finalText}`
    ));
  }, [
    activeSearchBattle,
    colonies,
    effectiveActiveColonyId,
    formatValue,
    horizonMaxLevel,
    language,
    onEarnQC,
    ownedCardIds,
    playSfx,
    recordNewEarthMissionProgress,
    setColonies,
    t,
  ]);

  const resolveSearchBattleDefeat = useCallback(() => {
    setActiveSearchBattle(null);
    setCardFeedback(t('Battle failed. The same battle remains available.', 'Batalha falhou. A mesma batalha continua disponível.'));
  }, [t]);

  const handleRunSearch = useCallback((option: ColonySearchOption, slotIndex: number) => {
    const searchKey = getSearchSlotKey(option.id, slotIndex);
    if (activeSearches[searchKey]) {
      setCardFeedback(t('This search slot is already active', 'Este slot de busca já está ativo'));
      return;
    }

    const now = Date.now();
    const endsAt = now + option.durationSeconds * 1000;
    setLastSearchReport(null);
    playRoute4SearchSfx(option.id, slotIndex);
    setActiveSearches(prev => ({
      ...prev,
      [searchKey]: {
        id: option.id,
        searchKey,
        slotIndex,
        title: option.title,
        subtitle: option.subtitle,
        rewards: option.rewards,
        threatChance: option.threatChance,
        startedAt: now,
        endsAt,
        threatCheckAt: getSearchThreatCheckAt(now, endsAt),
      }
    }));
    setSearchRemainingSeconds(prev => ({ ...prev, [searchKey]: option.durationSeconds }));
    setCardFeedback(t('Search team deployed', 'Equipe de busca enviada'));
  }, [activeSearches, t]);

  const handleSearchSlotAction = useCallback((option: ColonySearchOption, slotIndex: number) => {
    if (!allColoniesFullyBuilt) {
      handleRunSearch(option, slotIndex);
      return;
    }

    const battleIndex = getSearchBattleIndex(option.id, slotIndex);
    if (activeSearchBattle) {
      setCardFeedback(t('Finish the active battle first', 'Finalize a batalha ativa primeiro'));
      return;
    }
    if (battleIndex !== searchBattleCycle.nextBattleIndex) {
      setCardFeedback(t('Win the previous battle to unlock this one', 'Vença a batalha anterior para liberar esta'));
      return;
    }

    playRandomBobbyBluePrepareForBattleSfx();
    setLastSearchReport(null);
    setActiveSearchBattle({
      battleIndex,
      searchId: option.id,
      slotIndex,
      title: t(`Battle ${battleIndex + 1}`, `Batalha ${battleIndex + 1}`),
    });
    setCardFeedback(t(`Battle ${battleIndex + 1} started`, `Batalha ${battleIndex + 1} iniciada`));
  }, [activeSearchBattle, allColoniesFullyBuilt, handleRunSearch, searchBattleCycle.nextBattleIndex, t]);

  const upgradeSearch = useCallback((id: ColonyExpeditionId) => {
    const currentLevel = searchUpgradeLevels[id] || 0;
    if (currentLevel >= MAX_SEARCH_UPGRADE_LEVEL) {
      setCardFeedback(t('Search already at maximum level', 'Busca já está no nível máximo'));
      return;
    }
    const cost = getSearchUpgradeCost(currentLevel);
    if (qc < cost) {
      setCardFeedback(t('Not enough QC for this search upgrade', 'QC insuficiente para esta melhoria de busca'));
      return;
    }

    onSpendQC?.(cost);
    setSearchUpgradeLevels(prev => ({
      ...prev,
      [id]: Math.min(MAX_SEARCH_UPGRADE_LEVEL, (prev[id] || 0) + 1),
    }));
    playSfx?.('equip_card');
    setCardFeedback(t('Search protocol upgraded', 'Protocolo de busca melhorado'));
  }, [searchUpgradeLevels, qc, onSpendQC, playSfx, t]);

  if (!activeColony) return null;

  const totalAssignedConstructors = activeColony.constructions.reduce((sum, c) => sum + c.assignedConstructors, 0);
  const effectiveConstructors = getEffectiveConstructors(activeColony);
  const availableConstructors = Math.max(0, effectiveConstructors - totalAssignedConstructors);
  const statusBackgrounds = COLONY_STATUS_BACKGROUNDS[activeColony.id];
  const landSearchLevel = searchUpgradeLevels.land || 0;
  const seaSearchLevel = searchUpgradeLevels.sea || 0;
  const landSearchRewards = applySearchUpgradeRewards({ materials: 27, food: 18, biomass: 9, meds: 5, tech: 3 }, landSearchLevel);
  const seaSearchRewards = applySearchUpgradeRewards({ biomass: 21, food: 15, meds: 11, materials: 9, tech: 6 }, seaSearchLevel);
  const activeColonyReadyForPopulation = isColonyReadyForPopulation(activeColony.constructions);
  const displayedActiveColonyPopulation = activeColonyReadyForPopulation
    ? Math.max(0, Math.floor(activeColony.population || 0))
    : 0;
  const searchOptions: ColonySearchOption[] = [
    {
      id: 'land',
      title: t('Land Search', 'Busca por Terra'),
      subtitle: t('Ground Vehicles', 'Veículos Terrestres'),
      description: t(
        'Ground convoys recover supplies across ruined roads and old farms.',
        'Comboios terrestres recuperam suprimentos em estradas e antigas fazendas.'
      ),
      tone: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
      icon: Bot,
      durationSeconds: 90,
      threatChance: Math.min(100, 18 + searchThreatBonus.land + landSearchLevel * SEARCH_UPGRADE_THREAT_BONUS),
      rewards: landSearchRewards,
      upgradeLevel: landSearchLevel,
      upgradeCost: getSearchUpgradeCost(landSearchLevel),
      resourceBonusPercent: landSearchLevel * SEARCH_UPGRADE_RESOURCE_BONUS,
      upgradeThreatBonus: landSearchLevel * SEARCH_UPGRADE_THREAT_BONUS,
    },
    {
      id: 'sea',
      title: t('Sea and Air Search', 'Buscas Marítimas e Aéreas'),
      subtitle: t('Aquatic and Air Vehicles', 'Veículos Aquáticos e Aéreos'),
      description: t(
        'Crews scan coastlines, air routes, wreckage, and submerged cargo.',
        'Equipes vasculham costas, rotas aéreas, destroços e cargas submersas.'
      ),
      tone: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
      icon: Activity,
      durationSeconds: 120,
      threatChance: Math.min(100, 24 + searchThreatBonus.sea + seaSearchLevel * SEARCH_UPGRADE_THREAT_BONUS),
      rewards: seaSearchRewards,
      upgradeLevel: seaSearchLevel,
      upgradeCost: getSearchUpgradeCost(seaSearchLevel),
      resourceBonusPercent: seaSearchLevel * SEARCH_UPGRADE_RESOURCE_BONUS,
      upgradeThreatBonus: seaSearchLevel * SEARCH_UPGRADE_THREAT_BONUS,
    },
  ];

  const equipBattleCard = (card: ColonyCard) => {
    if (!isBattleCard(card)) return;
    const currentSlot = BATTLE_CARD_SLOTS.find(slot => battleLoadout[slot] === card.id);
    const targetSlot = currentSlot || BATTLE_CARD_SLOTS.find(slot => !battleLoadout[slot]);
    if (!targetSlot) {
      setCardFeedback(t('Remove the equipped battle card first', 'Retire uma carta de batalha equipada primeiro'));
      return;
    }
    const equippedCardsForRule = BATTLE_CARD_SLOTS
      .map(slot => getCardById(battleLoadout[slot]))
      .filter(Boolean)
      .filter(equippedCard => equippedCard?.id !== card.id)
      .filter(equippedCard => equippedCard && isBattleCard(equippedCard)) as ColonyCard[];
    const elementRule = canEquipBattleCardWithElementRule(card, equippedCardsForRule);
    if (!elementRule.allowed) {
      setCardFeedback(t(
        'Only one elemental battle path can be active at a time',
        'Apenas um caminho elemental de batalha pode ficar ativo por vez'
      ));
      return;
    }

    setBattleLoadout(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(slot => {
        if (next[slot as BattleCardSlot] === card.id) delete next[slot as BattleCardSlot];
      });
      next[targetSlot] = card.id;
      return next;
    });
    playSfx?.('equip_card');
    setCardFeedback(t('Battle card equipped', 'Carta de batalha equipada'));
  };

  const unequipBattleCard = (slot: BattleCardSlot) => {
    setBattleLoadout(prev => {
      const next = { ...prev };
      const removedCard = getCardById(next[slot]);
      delete next[slot];

      if (removedCard?.id === TRINITY_REACTOR_CARD_ID) {
        BATTLE_CARD_SLOTS.forEach(slotId => {
          const card = getCardById(next[slotId]);
          if (card && isBattleCard(card) && getBattleCardElementTypes(card).length > 0) {
            delete next[slotId];
          }
        });
      }

      return next;
    });
    playSfx?.('unequip_card');
    const removedCard = getCardById(battleLoadout[slot]);
    setCardFeedback(removedCard?.id === TRINITY_REACTOR_CARD_ID
      ? t('Trina removed. Elemental battle cards were automatically unequipped.', 'Trina retirada. Cartas elementais foram removidas automaticamente.')
      : t('Battle card removed', 'Carta de batalha retirada')
    );
  };

  const toggleDefenseSpecial = (specialId: DefenseSpecialId) => {
    setSelectedSpecialIds(prev => {
      if (prev.includes(specialId)) {
        playRoute4UiSfx(ROUTE4_SPECIAL_UNEQUIP_SFX);
        return prev.filter(id => id !== specialId);
      }
      if (prev.length >= 2) {
        setCardFeedback(t('Only two specials can be equipped', 'Apenas dois especiais podem ser equipados'));
        playRoute4UiSfx(ROUTE4_CANT_EQUIP_SFX);
        return prev;
      }
      playRoute4UiSfx(ROUTE4_SPECIAL_EQUIP_SFX);
      return [...prev, specialId];
    });
  };

  const missionCycleDisplayTotal = Math.max(4, newEarthMissions.missions.length || 4);
  const missionCycleBaseProgress = Math.min(
    100,
    (Math.min(newEarthMissionCycleCompletedCount, missionCycleDisplayTotal) / missionCycleDisplayTotal) * 100
  );
  const missionCycleBonusIsDraining = Boolean(
    newEarthMissionCycleBonusAnimation?.draining
    && newEarthMissionCycleBonusAnimation.cycle === newEarthMissions.cycle
  );
  const missionCycleProgressDisplay = missionCycleBonusIsDraining ? 0 : missionCycleBaseProgress;
  const missionCycleBonusDisplayValue = missionCycleBonusIsDraining
    ? Math.max(0, Math.floor(newEarthMissionCycleBonusAnimation?.displayBonus || 0))
    : newEarthMissionCycleBonusValue;

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden">
      <AnimatePresence>
        {cardEvent && (
          <AcquisitionEventOverlay
            card={cardEvent}
            language={language}
            cardLevels={cardLevels}
            onClose={() => setCardEvent(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && (
          <CardDetailOverlay
            selected={selectedCard}
            language={language}
            cardLevels={cardLevels}
            onClose={() => setSelectedCard(null)}
            onConfirm={confirmSelectedCardAction}
            onNavigate={selectedCardNavigationLabel ? navigateSelectedCard : undefined}
            navigationLabel={selectedCardNavigationLabel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeDefenseThreat && !activeSearchBattle && (
          <NewEarthDefenseBattle
            language={language}
            shipStats={battleShipStats}
            horizonLevel={horizonProgress.level}
            horizonMaxLevel={horizonMaxLevel}
            defenseBattleLevel={defenseBattleLevel}
            horizonXp={horizonProgress.currentXp}
            horizonNextXp={horizonProgress.nextXp}
            specials={selectedSpecialIds}
            trinityShotEnabled={trinityShotEnabled}
            threatTitle={activeDefenseThreat.sourceTitle}
            onVictory={resolveDefenseVictory}
            onDefeat={resolveDefenseDefeat}
            onClose={() => setActiveDefenseThreat(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSearchBattle && (
          <NewEarthDefenseBattle
            language={language}
            shipStats={battleShipStats}
            horizonLevel={horizonProgress.level}
            horizonMaxLevel={horizonMaxLevel}
            defenseBattleLevel={defenseBattleLevel}
            horizonXp={horizonProgress.currentXp}
            horizonNextXp={horizonProgress.nextXp}
            specials={selectedSpecialIds}
            trinityShotEnabled={trinityShotEnabled}
            threatTitle={activeSearchBattle.title}
            onVictory={resolveSearchBattleVictory}
            onDefeat={resolveSearchBattleDefeat}
            onClose={() => setActiveSearchBattle(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDefenseHangar && (
          <div className="fixed inset-0 z-[135] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.75rem] border border-red-300/25 bg-zinc-950 shadow-[0_0_70px_rgba(239,68,68,0.18)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/45 px-6 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-red-200">{t('New Earth Aerial Defense', 'Defesa Aérea da Nova Terra')}</p>
                  <h3 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">{t('Horizon Defense Hangar', 'Hangar de Defesa Horizon')}</h3>
                </div>
                <PremiumCanvasButton
                  type="button"
                  onClick={closeDefenseHangar}
                  tone="steel"
                  className="h-11 w-11 rounded-2xl text-zinc-200"
                  contentClassName="text-zinc-200"
                >
                  <X size={18} />
                </PremiumCanvasButton>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-[1.05fr_1fr_1fr] gap-3 p-4">
                <section 
                  className="flex min-h-0 flex-col rounded-2xl border border-red-300/25 p-3 bg-cover bg-center"
                  style={{ backgroundImage: "linear-gradient(to bottom, rgba(15, 10, 10, 0.4), rgba(15, 10, 10, 0.6)), url('/assets/rota4/layout_cap4/hangar_bg_left.webp')" }}
                >
                  <div className="relative flex min-h-[210px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/45">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.18),transparent_58%)]" />
                    <img
                      src="/assets/rota4/battles/player/horizon/horizon.webp"
                      alt="Horizon"
                      className="relative z-10 max-h-[175px] w-auto object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.35)]"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="col-span-2 rounded-xl border border-amber-300/25 bg-amber-300/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-200">Horizon XP</p>
                          <p className="mt-0.5 font-orbitron text-base font-black text-white">LVL {horizonProgress.level} / {horizonMaxLevel}</p>
                        </div>
                        <span className="rounded-lg border border-yellow-300/25 bg-black/35 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-yellow-200">
                          <Coins size={11} className="mr-1 inline" />{formatValue(qc)} QC
                        </span>
                      </div>
                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-black/55">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-300 to-emerald-300"
                          style={{ width: `${horizonProgress.nextXp > 0 ? Math.min(100, (horizonProgress.currentXp / horizonProgress.nextXp) * 100) : 100}%` }}
                        />
                      </div>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                        {horizonProgress.nextXp > 0 ? `${horizonProgress.currentXp} / ${horizonProgress.nextXp} XP` : 'MAX'}
                      </p>
                    </div>
                    {[
                      { label: t('Damage', 'Dano'), value: battleShipStats.damage, base: BASE_BATTLE_SHIP_STATS.damage },
                      { label: t('Health', 'Vida'), value: battleShipStats.health, base: BASE_BATTLE_SHIP_STATS.health },
                      { label: t('Shield', 'Escudo'), value: battleShipStats.shield, base: BASE_BATTLE_SHIP_STATS.shield },
                      { label: t('Crit Chance', 'Chance Crítica'), value: `${battleShipStats.critChance}%`, base: `${BASE_BATTLE_SHIP_STATS.critChance}%` },
                      { label: t('Crit Damage', 'Dano Crítico'), value: `${battleShipStats.critMultiplier.toFixed(2)}x`, base: `${BASE_BATTLE_SHIP_STATS.critMultiplier.toFixed(2)}x` },
                      { label: t('Special Recharge', 'Recarga Especial'), value: `-${battleShipStats.specialCooldownReductionPercent}%`, base: '0%' },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-black/35 p-3">
                        <p className="truncate font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                        <div className="mt-1 flex items-end justify-between gap-2">
                          <span className="font-orbitron text-base font-black text-white">{item.value}</span>
                          <span className="font-mono text-[9px] text-zinc-600">{t('Base', 'Base')}: {item.base}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { id: 'ice', label: t('Ice', 'Gélido'), color: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100', value: battleShipStats.elementalDamage.ice, bonus: battleShipStats.elementalBonusPercent.ice },
                      { id: 'electric', label: t('Electric', 'Elétrico'), color: 'border-sky-300/30 bg-sky-300/10 text-sky-100', value: battleShipStats.elementalDamage.electric, bonus: battleShipStats.elementalBonusPercent.electric },
                      { id: 'fire', label: t('Fire', 'Fogo'), color: 'border-orange-300/30 bg-orange-300/10 text-orange-100', value: battleShipStats.elementalDamage.fire, bonus: battleShipStats.elementalBonusPercent.fire },
                    ].map(item => (
                      <div key={item.id} className={`rounded-xl border p-3 ${item.color}`}>
                        <p className="truncate font-mono text-[8px] uppercase tracking-[0.16em] opacity-75">{item.label}</p>
                        <p className="mt-0.5 font-orbitron text-base font-black">+{item.value}</p>
                        <p className="font-mono text-[9px] opacity-60">+{item.bonus}%</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section 
                  className="grid min-h-0 grid-rows-[auto_1.05fr_1.7fr_0.8fr] gap-3 rounded-2xl border border-white/10 p-3 bg-cover bg-center"
                  style={{ backgroundImage: "linear-gradient(to bottom, rgba(15, 10, 10, 0.4), rgba(15, 10, 10, 0.6)), url('/assets/rota4/layout_cap4/hangar_bg_center.webp')" }}
                >
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-200">{t('Battle Plan', 'Plano de Batalha')}</p>
                    <h4 className="font-orbitron text-base font-black uppercase text-white">{t('Specials and Cards', 'Especiais e Cartas')}</h4>
                  </div>

                  <div className="grid min-h-0 grid-cols-2 gap-2">
                    {DEFENSE_SPECIALS.map(special => {
                      const selected = selectedSpecialIds.includes(special.id);
                      const specialButtonLabel = special.id === 'thor-oath'
                        ? t('Thor\nOath', 'Juramento de\nThor')
                        : special.id === 'apocalypse-laser'
                          ? 'Horizon\nLaser'
                          : special.id === 'hellfire-barrage'
                            ? 'Horizon\nBarrage'
                            : 'Blizzard';
                      return (
                        <PremiumCanvasButton
                          key={special.id}
                          type="button"
                          onClick={() => toggleDefenseSpecial(special.id)}
                          tone={selected ? 'brown' : 'steel'}
                          className={`min-h-0 rounded-xl ${selected ? DEFENSE_SPECIAL_BUTTON_SELECTED_CLASS : DEFENSE_SPECIAL_BUTTON_UNSELECTED_CLASS}`}
                          contentClassName={`flex h-full items-center justify-center p-3 text-center ${selected ? 'text-white' : 'text-stone-300/72'}`}
                        >
                          <span className={`whitespace-pre-line font-orbitron text-[13px] font-black uppercase leading-tight tracking-tight ${selected ? 'text-amber-50' : 'text-stone-300/78'}`}>
                            {specialButtonLabel}
                          </span>
                        </PremiumCanvasButton>
                      );
                    })}
                  </div>

                  <div className="grid min-h-0 grid-cols-2 grid-rows-3 gap-2">
                    {BATTLE_CARD_SLOTS.map(slot => {
                      const card = getCardById(battleLoadout[slot]);
                      return (
                        <PremiumCanvasButton
                          key={slot}
                          type="button"
                          onClick={() => card && unequipBattleCard(slot)}
                          tone={getBattleCardButtonTone(card)}
                          className={`min-h-0 rounded-xl ${card ? getCardStyle(card.rarity, getCardClass(card)) : ''}`}
                          contentClassName="flex h-full flex-col items-stretch justify-between p-3 text-left"
                        >
                          <p className={`font-mono text-[8px] uppercase tracking-[0.2em] ${getBattleCardTextTone(card)}`}>{BATTLE_SLOT_LABEL[slot][language]}</p>
                          <p className={`mt-2 line-clamp-2 font-orbitron text-[10px] font-black uppercase leading-tight ${card ? 'text-white' : 'text-zinc-600'}`}>
                            {card ? card.name[language] : t('Empty slot', 'Slot vazio')}
                          </p>
                          <p className={`mt-2 font-mono text-[8px] uppercase tracking-widest ${card ? getBattleCardTextTone(card) : 'text-zinc-500'}`}>
                            {card ? t('Click to remove', 'Clique para retirar') : t('Battle card', 'Carta de batalha')}
                          </p>
                        </PremiumCanvasButton>
                      );
                    })}
                  </div>

                  <div className="flex min-h-0 flex-wrap content-start gap-1.5 rounded-2xl border border-red-300/10 bg-red-300/[0.03] p-3">
                    {activeBattleStatTotals.length > 0 ? activeBattleStatTotals.slice(0, 10).map(([stat, value]) => (
                      <span key={stat} className="rounded-lg border border-red-300/25 bg-black/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-red-100">
                        +{value}% {BATTLE_STAT_CONFIG[stat as keyof typeof BATTLE_STAT_CONFIG].label[language]}
                      </span>
                    )) : (
                      <span className="rounded-lg border border-zinc-700 bg-black/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                        {t('No battle modifiers', 'Sem modificadores de batalha')}
                      </span>
                    )}
                  </div>
                </section>

                <section 
                  className="flex min-h-0 flex-col rounded-2xl border border-white/10 p-4 bg-cover bg-center"
                  style={{ backgroundImage: "linear-gradient(to bottom, rgba(15, 10, 10, 0.4), rgba(15, 10, 10, 0.6)), url('/assets/rota4/layout_cap4/hangar_bg_right.webp')" }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-200">{t('Operational Board', 'Quadro Operacional')}</p>
                  <h4 className="font-orbitron text-lg font-black uppercase text-white">{t('Threats and Reserve', 'Ameaças e Reserva')}</h4>

                  <div className="mt-4 rounded-2xl border border-red-300/25 bg-red-300/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-red-200/70">{t('Pending Threats', 'Ameaças Pendentes')}</p>
                        <h5 className="font-orbitron text-xl font-black uppercase text-white">{pendingDefenseThreats.length}</h5>
                      </div>
                      <AlertTriangle size={18} className={pendingDefenseThreats.length > 0 ? 'text-red-300' : 'text-zinc-600'} />
                    </div>
                    <div className="mt-3 grid gap-2">
                      {pendingDefenseThreats.length > 0 ? pendingDefenseThreats.slice(0, MAX_PENDING_DEFENSE_THREATS).map((threat, index) => (
                        <div key={`${threat.id}-${index}`} className="rounded-xl border border-red-300/20 bg-black/35 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-orbitron text-[10px] font-black uppercase text-white">{threat.sourceTitle}</p>
                            <span className="rounded-full border border-red-300/25 bg-black/30 px-2 py-0.5 font-mono text-[9px] text-red-100">{threat.threatChance}%</span>
                          </div>
                          <PremiumCanvasButton
                            type="button"
                            onClick={() => {
                              closeDefenseHangar();
                              const openedAt = Date.now();
                              setPendingDefenseThreats(prev => prev.map(item => (
                                item.id === threat.id ? { ...item, openedAt, expiresAt: undefined } : item
                              )));
                              onDefenseThreatAlertChange?.(null);
                              setActiveDefenseThreat(threat);
                            }}
                            tone="red"
                            className="mt-3 h-9 w-full rounded-lg"
                            contentClassName="px-3 text-[10px] font-black uppercase tracking-widest text-white"
                          >
                            {t('Launch Defense', 'Iniciar Defesa')}
                          </PremiumCanvasButton>
                        </div>
                      )) : (
                        <p className="rounded-xl border border-dashed border-zinc-700 bg-black/20 p-3 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          {t('No attacks registered', 'Nenhum ataque registrado')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 min-h-0 flex-1 rounded-2xl border border-white/10 bg-black/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-500">{t('Battle Cards Codex', 'Codex de Batalha')}</p>
                        <h5 className="mt-1 font-orbitron text-[12px] font-black uppercase tracking-tight text-white">{t('Owned Battle Cards', 'Cartas de Batalha Obtidas')}</h5>
                      </div>
                      {battleCardCodexPageCount > 1 && (
                        <div className="flex items-center gap-1">
                          <PremiumCanvasButton
                            type="button"
                            onClick={() => {
                              playSfx?.('view_card');
                              setBattleCardCodexPage(prev => (prev - 1 + battleCardCodexPageCount) % battleCardCodexPageCount);
                            }}
                            tone="steel"
                            className="h-8 w-8 rounded-lg"
                            contentClassName="text-zinc-200"
                            aria-label={t('Previous battle card page', 'Página anterior de cartas de batalha')}
                          >
                            <ChevronLeft size={14} />
                          </PremiumCanvasButton>
                          <span className="min-w-9 text-center font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                            {activeBattleCardCodexPage + 1}/{battleCardCodexPageCount}
                          </span>
                          <PremiumCanvasButton
                            type="button"
                            onClick={() => {
                              playSfx?.('view_card');
                              setBattleCardCodexPage(prev => (prev + 1) % battleCardCodexPageCount);
                            }}
                            tone="steel"
                            className="h-8 w-8 rounded-lg"
                            contentClassName="text-zinc-200"
                            aria-label={t('Next battle card page', 'Próxima página de cartas de batalha')}
                          >
                            <ChevronRight size={14} />
                          </PremiumCanvasButton>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 grid min-h-0 grid-cols-2 grid-rows-3 gap-2 overflow-hidden">
                      {ownedBattleCards.length > 0 ? visibleBattleCodexCards.map(card => {
                        const equipped = BATTLE_CARD_SLOTS.some(slot => battleLoadout[slot] === card.id);
                        return (
                          <PremiumCanvasButton
                            key={card.id}
                            type="button"
                            onClick={() => openBattleCardDetails(card, equipped ? 'remove' : 'equip', BATTLE_CARD_SLOTS.find(slot => battleLoadout[slot] === card.id))}
                            tone={getBattleCardButtonTone(card)}
                            className={`min-h-[76px] rounded-xl ${getMiniBattleCardStyle(card, equipped)}`}
                            contentClassName="flex h-full flex-col items-stretch justify-center px-2.5 py-2 text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="line-clamp-2 font-orbitron text-[9px] font-black uppercase leading-tight text-white">{card.name[language]}</p>
                              <span className={`shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest ${
                                equipped ? `${getBattleCardTextTone(card)} border-white/25 bg-white/10` : 'border-white/20 text-zinc-200/80'
                              }`}>
                                {equipped ? 'ON' : RARITY_LABEL[card.rarity]?.[language] || card.rarity}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {getBattleEffects(card, cardLevels).slice(0, 2).map(effect => (
                                <span key={`${card.id}-${effect.stat}`} className="rounded-full border border-white/15 bg-black/35 px-1.5 py-0.5 font-mono text-[8px] text-zinc-100">
                                  +{effect.value}% {BATTLE_STAT_CONFIG[effect.stat].label[language]}
                                </span>
                              ))}
                            </div>
                          </PremiumCanvasButton>
                        );
                      }) : (
                        <p className="col-span-2 row-span-3 flex items-center justify-center rounded-xl border border-dashed border-red-300/20 bg-black/25 p-3 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          {t('No battle cards owned yet', 'Nenhuma carta de batalha obtida ainda')}
                        </p>
                      )}
                      {ownedBattleCards.length > 0 && visibleBattleCodexCards.length < BATTLE_CARD_CODEX_PAGE_SIZE && Array.from({ length: BATTLE_CARD_CODEX_PAGE_SIZE - visibleBattleCodexCards.length }).map((_, index) => (
                        <div key={`empty-battle-codex-${index}`} className="min-h-[76px] rounded-xl border border-dashed border-white/5 bg-black/20" />
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cardFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className="fixed top-6 left-1/2 z-[120] -translate-x-1/2 rounded-2xl border border-emerald-300/40 bg-zinc-950/90 px-5 py-3 text-sm text-emerald-200 font-orbitron font-black uppercase tracking-[0.22em] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            {cardFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative shrink-0 overflow-hidden rounded-2xl border border-emerald-400/20 bg-black/40 bg-cover bg-center p-3"
        style={{ backgroundImage: "url('/assets/texturas/textura_ficsi_2400x240.webp')" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/24" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.32),rgba(0,0,0,0.14)_48%,rgba(0,0,0,0.36))]" />
        <div className="relative z-10 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300">{t('Chapter 4 Habitat Network', 'Rede Habitacional do Capítulo 4')}</p>
            <h2 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">{t('Colonies', 'Colônias')}</h2>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/40 p-1 md:grid-cols-6 xl:w-[920px]">
            {colonies.map(colony => (
              <PremiumCanvasButton
                key={colony.id}
                type="button"
                onClick={() => {
                  playRoute4UiSfx(ROUTE4_COLONIES_TAB_SFX);
                  setActiveView('colony');
                  setActiveColonyId(colony.id);
                  if (setSelectedColonyId) {
                    setSelectedColonyId(colony.id);
                  }
                }}
                tone={activeView === 'colony' && effectiveActiveColonyId === colony.id ? 'green' : 'steel'}
                className="h-10 rounded-xl"
                contentClassName={`px-3 text-[10px] font-black uppercase tracking-widest ${
                  activeView === 'colony' && effectiveActiveColonyId === colony.id ? 'text-emerald-50' : 'text-zinc-300'
                }`}
              >
                {colony.name.replace('Colônia ', '').replace(' Colony', '')}
              </PremiumCanvasButton>
            ))}
            <PremiumCanvasButton
              type="button"
              onClick={() => {
                playRoute4UiSfx(ROUTE4_COLONIES_TAB_SFX);
                setActiveView('searches');
              }}
              tone={activeView === 'searches' ? 'cyan' : 'steel'}
              className="h-10 rounded-xl"
              contentClassName={`px-3 text-[10px] font-black uppercase tracking-widest ${activeView === 'searches' ? 'text-cyan-50' : 'text-zinc-300'}`}
            >
              {t('Searches', 'Buscas')}
            </PremiumCanvasButton>
            <PremiumCanvasButton
              type="button"
              onClick={() => {
                playRoute4UiSfx(ROUTE4_COLONIES_TAB_SFX);
                setActiveView('missions');
              }}
              tone={activeView === 'missions' ? 'amber' : 'steel'}
              className="h-10 rounded-xl"
              contentClassName={`px-3 text-[10px] font-black uppercase tracking-widest ${activeView === 'missions' ? 'text-amber-50' : 'text-zinc-300'}`}
            >
              {t('Missions', 'Missões')}
            </PremiumCanvasButton>
          </div>
        </div>
      </div>

      {activeView === 'missions' ? (
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-amber-300/20 bg-zinc-950/70 p-5">
          <div className="mb-4 flex shrink-0 items-center gap-4">
            <div className="w-[260px] shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-300">{t('New Earth Assignments', 'Designações da Nova Terra')}</p>
              <h3 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">{t('Mission Board', 'Painel de Missões')}</h3>
            </div>
            <div className="relative h-[58px] min-w-0 flex-1 overflow-hidden rounded-lg border border-cyan-300/25 bg-black/70 p-2 shadow-[inset_0_0_18px_rgba(34,211,238,0.13),0_0_16px_rgba(34,211,238,0.09)]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
              <div className="relative z-10 h-full">
                <div className="h-full overflow-hidden rounded-md border border-cyan-200/20 bg-black shadow-[inset_0_0_14px_rgba(0,0,0,0.9)]">
                  <div
                    className={`relative h-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-sky-100 to-emerald-300 shadow-[0_0_18px_rgba(34,211,238,0.65),inset_0_0_10px_rgba(255,255,255,0.35)] transition-[width] ${missionCycleBonusIsDraining ? 'duration-[2000ms] ease-in' : 'duration-700 ease-out'}`}
                    style={{ width: `${missionCycleProgressDisplay}%` }}
                  >
                    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.85)_45%,transparent_75%)] opacity-75 animate-pulse" />
                    <div aria-hidden="true" className="absolute inset-y-0 left-0 w-full bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.0)_0px,rgba(255,255,255,0.0)_14px,rgba(255,255,255,0.35)_15px,rgba(255,255,255,0.0)_18px)] opacity-55" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
                    <span className="rounded-full border border-cyan-100/25 bg-black/55 px-4 py-1 font-orbitron text-[11px] font-black uppercase tracking-[0.18em] text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.28)]">
                      {t('Extra bonus', 'Bonificação extra')} {formatValue(missionCycleBonusDisplayValue)} QC
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[72px] shrink-0 rounded-xl border border-amber-300/25 bg-amber-300/10 px-2 py-2 text-right">
              <p className="font-mono text-[9px] uppercase tracking-widest text-amber-200/80">{t('Ready', 'Prontas')}</p>
              <p className="font-orbitron text-lg font-black text-white">
                {newEarthMissions.missions.filter(mission => mission.completed && !mission.claimed).length}
              </p>
            </div>
            <PremiumCanvasButton
              type="button"
              onClick={renewNewEarthMissionsWithoutBonus}
              disabled={newEarthMissions.missions.some(mission => mission.completed && !mission.claimed)}
              tone="steel"
              className="h-[58px] w-[118px] shrink-0 rounded-xl"
              contentClassName={`px-3 text-center text-[10px] font-black uppercase tracking-[0.18em] ${newEarthMissions.missions.some(mission => mission.completed && !mission.claimed) ? 'text-zinc-500' : 'text-zinc-200'}`}
            >
              {t('Renew missions', 'Renovar missões')}
            </PremiumCanvasButton>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
            {newEarthMissions.missions.map(mission => {
              const getMissionBg = (m: any) => {
                if (m.eventType === 'search-complete') return m.searchId === 'sea' ? 'bg_sea_search.webp' : 'bg_land_search.webp';
                if (m.eventType === 'construction-complete') return 'bg_construction.webp';
                if (m.eventType.startsWith('submarine')) return 'bg_submarine.webp';
                if (m.eventType.startsWith('arcade')) return 'bg_arcade.webp';
                if (m.eventType === 'card-upgrade') return 'bg_card_upgrade.webp';
                if (m.eventType.startsWith('defense')) return 'bg_hangar_defense.webp';
                return 'bg_land_search.webp';
              };
              const bgUrl = `/assets/rota4/missions/${getMissionBg(mission)}`;
              const rewardParts = [
                mission.reward.qc ? `+${formatValue?.(mission.reward.qc) || mission.reward.qc} QC` : null,
                mission.reward.supplies ? Object.entries(mission.reward.supplies).map(([key, value]) => `+${value} ${SUPPLY_CONFIG[key as ColonySupplyId].label[language]}`).join(' · ') : null,
                mission.reward.missingCard ? t('Undiscovered card', 'Carta não descoberta') : null,
                mission.reward.colonyBonus ? `+${mission.reward.colonyBonus.value} ${SECTOR_CONFIG[mission.reward.colonyBonus.sector].label[language]}` : null,
              ].filter(Boolean).join(' · ');
              const progressPercent = Math.min(100, (mission.progress / mission.target) * 100);
              if (mission.claimed) {
                return (
                  <div
                    key={mission.id}
                    className="flex min-h-[188px] flex-col justify-between rounded-2xl border border-white/8 p-4 opacity-55 grayscale bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(to bottom, rgba(9, 9, 11, 0.8), rgba(9, 9, 11, 0.95)), url('${bgUrl}')` }}
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                        {t('Assignment completed', 'Designação concluída')}
                      </p>
                      <h4 className="mt-1 font-orbitron text-lg font-black uppercase text-zinc-500">
                        {t('Slot awaiting renewal', 'Slot aguardando renovação')}
                      </h4>
                    </div>
                    <div>
                      <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
                        <div className="h-full rounded-full bg-zinc-600" style={{ width: '100%' }} />
                      </div>
                      <PremiumCanvasButton
                        type="button"
                        disabled
                        tone="steel"
                        className="mt-4 h-10 rounded-xl"
                        contentClassName="px-3 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500"
                      >
                        {t('Reward claimed', 'Recompensa resgatada')}
                      </PremiumCanvasButton>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={mission.id}
                  className="flex min-h-[188px] flex-col rounded-2xl border border-white/10 p-4 bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('${bgUrl}')` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-200/70">{mission.objectiveLabel[language]}</p>
                      <h4 className="mt-1 font-orbitron text-lg font-black uppercase text-white">{mission.title[language]}</h4>
                    </div>
                    <span className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                      mission.claimed
                        ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200'
                        : mission.completed
                          ? 'border-amber-300/40 bg-amber-300/15 text-amber-100'
                          : 'border-cyan-300/25 bg-cyan-300/10 text-cyan-200'
                    }`}>
                      {mission.claimed ? t('Claimed', 'Resgatada') : mission.completed ? t('Ready', 'Pronta') : `${mission.progress}/${mission.target}`}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-snug text-zinc-400">{mission.description[language]}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
                    <div className="h-full rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.35)]" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{rewardParts}</p>

                  <PremiumCanvasButton
                    type="button"
                    onClick={() => claimNewEarthMission(mission.id)}
                    disabled={!mission.completed || mission.claimed}
                    tone={mission.completed && !mission.claimed ? 'green' : 'steel'}
                    className="mt-auto h-10 rounded-xl"
                    contentClassName={`px-3 text-[11px] font-black uppercase tracking-[0.2em] ${mission.completed && !mission.claimed ? 'text-emerald-50' : 'text-zinc-400'}`}
                  >
                    {mission.claimed ? t('Reward Claimed', 'Recompensa Resgatada') : t('Claim Reward', 'Resgatar Recompensa')}
                  </PremiumCanvasButton>
                </div>
              );
            })}
            {newEarthMissions.missions.length === 0 && (
              <div className="col-span-full flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/35 p-6 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/70">{t('No valid assignments', 'Sem designações válidas')}</p>
                <h4 className="mt-3 font-orbitron text-2xl font-black uppercase text-white">{t('Systems analyzing the colony', 'Sistemas analisando a colônia')}</h4>
                <p className="mt-3 max-w-lg text-sm text-zinc-400">
                  {t('New missions will appear when there are objectives the player can actually complete.', 'Novas missões aparecerão quando houver objetivos que o jogador realmente consiga concluir.')}
                </p>
              </div>
            )}
          </div>
          {newEarthMissions.renewAvailableAt && newEarthMissions.missions.every(mission => mission.claimed) && (
            <div className="mt-3 shrink-0 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-amber-100">
              {Date.now() >= newEarthMissions.renewAvailableAt
                ? t('Renewal available soon', 'Renovação disponível em instantes')
                : `${t('Next assignments in', 'Próximas designações em')} ${formatSearchTime((newEarthMissions.renewAvailableAt - Date.now()) / 1000)}`}
            </div>
          )}
        </div>
      ) : activeView === 'colony' ? (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-4">
          <div className="grid shrink-0 grid-cols-1 gap-2 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-blue-400/25 bg-black/45 p-3">
              {statusBackgrounds?.colony ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-95 saturate-125" style={{ backgroundImage: `url(${statusBackgrounds.colony})` }} /> : null}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/64 via-black/26 to-black/45" />
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(96,165,250,0.20),transparent_55%)]" />
              <div className="relative z-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-300/80">{t('Active Colony', 'Colônia Ativa')}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className="truncate font-orbitron text-base font-black uppercase text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{activeColony.name}</h3>
                  <Home className="h-5 w-5 shrink-0 text-blue-300/70" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-cyan-400/25 bg-black/45 p-3">
              {statusBackgrounds?.constructors ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-95 saturate-125" style={{ backgroundImage: `url(${statusBackgrounds.constructors})` }} /> : null}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/64 via-black/24 to-black/45" />
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_74%_35%,rgba(34,211,238,0.22),transparent_55%)]" />
              <div className="relative z-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">{t('Available Constructors', 'Construtores Disponíveis')}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className="font-orbitron text-base font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{availableConstructors} / {effectiveConstructors}</h3>
                  <Bot className="h-5 w-5 text-cyan-300/70" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-emerald-400/25 bg-black/45 p-3">
              {statusBackgrounds?.population ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-95 saturate-125" style={{ backgroundImage: `url(${statusBackgrounds.population})` }} /> : null}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/64 via-black/26 to-black/45" />
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_74%_35%,rgba(52,211,153,0.20),transparent_55%)]" />
              <div className="relative z-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300/80">{t('Population', 'População')}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className={`font-orbitron text-base font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${displayedActiveColonyPopulation > 0 ? 'text-emerald-300' : 'text-zinc-400'}`}>
                    {displayedActiveColonyPopulation.toLocaleString()}
                  </h3>
                  <Users className={`h-5 w-5 ${activeColonyReadyForPopulation ? 'text-emerald-300/70' : 'text-zinc-500/70'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between">
            <h4 className="text-base font-orbitron font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              {t('Infrastructure Nodes', 'Nódulos de Infraestrutura')}
            </h4>
            <div className="grid flex-1 grid-cols-2 gap-2 pl-4 sm:grid-cols-3 xl:grid-cols-6">
              {(Object.keys(SUPPLY_CONFIG) as ColonySupplyId[]).map(supplyId => (
                <div
                  key={supplyId}
                  className={`flex min-w-[118px] items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] ${SUPPLY_CONFIG[supplyId].border} ${SUPPLY_CONFIG[supplyId].color}`}
                >
                  <span className="truncate">{SUPPLY_CONFIG[supplyId].label[language]}</span>
                  <span className="shrink-0 font-orbitron text-[11px] font-black text-white">{colonySupplies[supplyId]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 min-h-0 auto-rows-fr">
            {activeColony.constructions.map((con) => {
              const config = CONSTRUCTION_CONFIG[con.type];
              const isMaxed = con.level >= 10;
              const isWorking = con.assignedConstructors > 0 && !isMaxed;
              const completedBackground = isMaxed ? COLONY_COMPLETION_BACKGROUNDS[activeColony.id]?.[con.type] : undefined;
              const supplyCost = CONSTRUCTION_SUPPLY_COST[con.type];
              const hasSuppliesFor50 = canPaySupplies(colonySupplies, supplyCost, 1);
              const hasSuppliesFor250 = canPaySupplies(colonySupplies, supplyCost, 5);
              const costLabel = (Object.entries(supplyCost) as Array<[ColonySupplyId, number]>)
                .map(([key, value]) => `${SUPPLY_CONFIG[key].label[language]} ${value}`)
                .join(' · ');
              
              // Custom colors mapping
              const colorClasses: Record<string, string> = {
                emerald: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500',
                zinc: 'border-zinc-500/60 shadow-[0_0_20px_rgba(161,161,170,0.15)] hover:border-zinc-400',
                yellow: 'border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:border-yellow-400',
                blue: 'border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-400',
                red: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-400',
                'restaurant-mix': 'border-l-emerald-400/60 border-t-emerald-400/60 border-r-red-400/60 border-b-red-400/60 shadow-[0_0_20px_rgba(16,185,129,0.1),0_0_20px_rgba(239,68,68,0.1)] hover:border-emerald-400'
              };

              const accentColor: Record<string, string> = {
                emerald: 'text-emerald-400 bg-emerald-500/15',
                zinc: 'text-zinc-300 bg-zinc-500/15',
                yellow: 'text-yellow-400 bg-yellow-500/15',
                blue: 'text-blue-400 bg-blue-500/15',
                red: 'text-red-400 bg-red-500/15',
                'restaurant-mix': 'text-emerald-300 bg-gradient-to-br from-emerald-500/15 via-zinc-800 to-red-500/15'
              };

              return (
                <motion.div
                  key={con.id}
                  layout
                  className={`relative p-3 rounded-2xl border-2 bg-black/60 flex flex-col transition-all duration-300 min-h-0 overflow-hidden ${colorClasses[config.color]} ${completedBackground ? 'colony-completion-card shadow-[inset_0_0_50px_rgba(0,0,0,0.65)]' : ''}`}
                >
                  {completedBackground && (
                    <>
                      <div
                        aria-hidden="true"
                        className="colony-completion-bg bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${completedBackground})` }}
                      />
                      <div aria-hidden="true" className="colony-completion-bg bg-gradient-to-br from-black/78 via-black/48 to-black/76" />
                      <div aria-hidden="true" className="colony-completion-bg bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.13),transparent_62%)]" />
                    </>
                  )}
                  <div className={`flex items-start justify-between gap-3 ${isMaxed ? '' : 'mb-2'}`}>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className={`shrink-0 rounded-xl p-2 ${accentColor[config.color]} shadow-inner ${isMaxed ? 'ring-1 ring-white/10' : ''}`}>
                        <config.icon size={18} />
                      </div>
                      <h5 className="truncate font-orbitron text-[12px] font-bold uppercase leading-tight tracking-widest text-white">{config.label[language]}</h5>
                    </div>
                    <div className="text-right leading-none">
                       <span className="text-[11px] font-orbitron font-bold text-zinc-500 block uppercase mb-1">{t('Units Built', 'Unidade')}</span>
                       <span className="text-xl font-orbitron font-black text-white tracking-widest">{con.level} {!isMaxed && <span className="text-[11px] text-zinc-600">/ 10</span>}</span>
                    </div>
                  </div>
                  
                  {!isMaxed && (
                    <div className="mb-1.5">
                      <p className="mb-1.5 truncate font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                        {t('Cost / 50:', 'Custo / 50:')} {costLabel}
                      </p>
                      <div className="flex items-center gap-2">
                         <div className="h-1 flex-1 rounded-full bg-zinc-800/50 overflow-hidden relative border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${con.progress}%` }}
                              className="h-full relative z-10 bg-blue-500"
                            />
                            {isWorking && (
                              <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20"
                              />
                            )}
                         </div>
                         <span className="text-[11px] font-mono text-zinc-500 w-7 text-right">{Math.floor(con.progress)}%</span>
                      </div>
                    </div>
                  )}

                  {!isMaxed && (
                    <div className="mt-auto">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[12px] font-orbitron font-bold text-zinc-400 px-1 leading-none uppercase tracking-widest">
                           <span>{t('Robots:', 'Robôs:')}</span>
                           <span className="text-white text-[12px]">{con.assignedConstructors.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                           <PremiumCanvasButton
                             onClick={() => {
                               if (updateConstructors(con.id, 50)) playRoute4UiSfx(ROUTE4_ROBOTS_50_SFX);
                             }}
                             disabled={!hasSuppliesFor50 || availableConstructors < 50}
                             tone="blue"
                             className="h-9 flex-1 rounded-xl"
                             contentClassName="text-[12px] font-black uppercase tracking-widest text-blue-50"
                           >
                              +50
                           </PremiumCanvasButton>
                           <PremiumCanvasButton
                             onClick={() => {
                               if (updateConstructors(con.id, 250)) playRoute4UiSfx(ROUTE4_ROBOTS_250_SFX);
                             }}
                             disabled={!hasSuppliesFor250 || availableConstructors < 50}
                             tone="steel"
                             className="h-9 flex-1 rounded-xl"
                             contentClassName="text-[12px] font-bold text-zinc-100"
                           >
                              +250
                           </PremiumCanvasButton>
                        </div>
                      </div>
                    </div>
                  )}

                  {isWorking && (
                     <div className="absolute top-2 right-12">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="text-blue-500/40"
                        >
                           <Cpu size={14} />
                        </motion.div>
                     </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-cyan-300/20 bg-zinc-950/70 p-5">
          <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                {allColoniesFullyBuilt ? t('Direct Combat Front', 'Frente de Combate Direto') : t('Supply Recon', 'Reconhecimento de Suprimentos')}
              </p>
              <h3 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">
                {allColoniesFullyBuilt ? t('Battle Operations', 'Operações de Batalha') : t('Search Operations', 'Operações de Busca')}
              </h3>
              <p className="mt-1 max-w-2xl text-xs text-zinc-500">
                {allColoniesFullyBuilt
                  ? t(
                    'All colonies are built. Search crews now open direct battle routes in sequence.',
                    'Todas as colônias foram construídas. As equipes de busca agora abrem rotas de batalha direta em sequência.'
                  )
                  : t(
                    'Land and sea expeditions can run at the same time. Aerial defense is configured separately.',
                    'Expedições por terra e mar podem rodar ao mesmo tempo. A defesa aérea é configurada separadamente.'
                  )}
              </p>
            </div>
            <div className="flex max-w-[48%] flex-wrap justify-end gap-2">
              {(Object.keys(SUPPLY_CONFIG) as ColonySupplyId[]).map(supplyId => (
                <span
                  key={supplyId}
                  className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${SUPPLY_CONFIG[supplyId].border} ${SUPPLY_CONFIG[supplyId].color}`}
                >
                  {SUPPLY_CONFIG[supplyId].label[language]}: {colonySupplies[supplyId]}
                </span>
              ))}
            </div>
          </div>

          {(latestActiveSearchesByType.length > 0 || lastSearchReport) && (
            <div className="mb-3 shrink-0 rounded-2xl border border-cyan-300/20 bg-black/45 px-3 py-2">
              {latestActiveSearchesByType.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {latestActiveSearchesByType.map(search => (
                    <div key={search.id} className="flex flex-wrap justify-end gap-2">
                      <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200">
                        {search.id === 'land' ? t('Land Return', 'Retorno por terra') : t('Sea Return', 'Retorno por mar')}: {formatSearchTime(searchRemainingSeconds[search.searchKey] || 0)}
                      </span>
                      <span className="rounded-lg border border-red-300/30 bg-red-300/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-red-200">
                        {t('Risk', 'Risco')}: {search.threatChance}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-200">{lastSearchReport}</p>
              )}
            </div>
          )}

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
            {searchOptions.map(option => {
              const directBattleMode = allColoniesFullyBuilt;
              const battleRewardRange = option.id === 'land'
                ? `${formatValue(SEARCH_BATTLE_QC_REWARDS[0])}-${formatValue(SEARCH_BATTLE_QC_REWARDS[2])}`
                : `${formatValue(SEARCH_BATTLE_QC_REWARDS[3])}-${formatValue(SEARCH_BATTLE_QC_REWARDS[5])}`;
              const optionTitle = directBattleMode
                ? option.id === 'land'
                  ? t('Land Battlefront', 'Frente de Batalha Terrestre')
                  : t('Sea and Air Battlefront', 'Frente de Batalha Marítima e Aérea')
                : option.title;
              const optionSubtitle = directBattleMode
                ? option.id === 'land'
                  ? t('Ground Combat Route', 'Rota de Combate Terrestre')
                  : t('Aquatic and Air Combat Route', 'Rota de Combate Aquática e Aérea')
                : option.subtitle;
              const optionDescription = directBattleMode
                ? option.id === 'land'
                  ? t(
                    'Horizon advances through fortified ground sectors to secure the finished colonies.',
                    'A Horizon avança por setores terrestres fortificados para proteger as colônias finalizadas.'
                  )
                  : t(
                    'Horizon intercepts hostile fleets across coastlines, air lanes, wreckage, and open sea.',
                    'A Horizon intercepta frotas hostis entre costas, rotas aéreas, destroços e mar aberto.'
                  )
                : option.description;
              const searchSlots = Array.from({ length: MAX_PARALLEL_SEARCHES_PER_TYPE }, (_, slotIndex) => {
                const searchKey = getSearchSlotKey(option.id, slotIndex);
                const battleIndex = getSearchBattleIndex(option.id, slotIndex);
                return {
                  slotIndex,
                  searchKey,
                  battleIndex,
                  activeSearch: activeSearches[searchKey],
                  style: SEARCH_SLOT_STYLES[slotIndex],
                };
              });
              return (
              <div
                key={option.id}
                className={`relative flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-cover bg-center p-4 ${option.tone}`}
                style={{
                  backgroundImage: `url(${option.id === 'land' ? ROUTE4_LAYOUT_BACKGROUNDS.searchLand : ROUTE4_LAYOUT_BACKGROUNDS.searchSea})`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-black/46" />
                <div className={`pointer-events-none absolute inset-0 ${option.id === 'land' ? 'bg-[radial-gradient(circle_at_24%_16%,rgba(16,185,129,0.22),transparent_42%),linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.36)_48%,rgba(0,0,0,0.68))]' : 'bg-[radial-gradient(circle_at_26%_14%,rgba(34,211,238,0.24),transparent_44%),linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.66))]'}`} />
                <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-80">{optionSubtitle}</p>
                    <h4 className="font-orbitron text-xl font-black uppercase leading-tight text-white">{optionTitle}</h4>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                    <option.icon size={24} />
                  </div>
                </div>

                <p className="line-clamp-2 text-sm leading-snug text-zinc-300">{optionDescription}</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                      {directBattleMode ? t('Battle Sequence', 'Sequência de Batalha') : t('Duration', 'Duração')}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      {searchSlots.map(slot => (
                        <span
                          key={`${option.id}-duration-${slot.slotIndex}`}
                          className={`rounded-lg border px-1.5 py-1 text-center font-orbitron text-[11px] font-black ${slot.style}`}
                        >
                          {allColoniesFullyBuilt
                            ? t('Battle', 'Batalha')
                            : formatSearchTime(slot.activeSearch ? searchRemainingSeconds[slot.searchKey] || 0 : option.durationSeconds)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                      {directBattleMode ? t('Victory Reward', 'Recompensa da Vitória') : t('Attack Risk', 'Risco de Ataque')}
                    </p>
                    {directBattleMode ? (
                      <p className="mt-1 font-orbitron text-sm font-black text-emerald-200">
                        {battleRewardRange} QC
                      </p>
                    ) : (
                      <p className="mt-1 font-orbitron text-sm font-black text-red-200">
                        {option.threatChance}%
                        {searchThreatBonus[option.id] > 0 && (
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-amber-200">
                            +{searchThreatBonus[option.id]}%
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                        {directBattleMode ? t('Battle Protocol', 'Protocolo de Batalha') : t('Search Protocol', 'Protocolo de Busca')}
                      </p>
                      <p className="mt-1 font-orbitron text-sm font-black uppercase text-white">
                        {directBattleMode ? `HORIZON LVL ${horizonProgress.level} / ${horizonMaxLevel}` : `LVL ${option.upgradeLevel} / ${MAX_SEARCH_UPGRADE_LEVEL}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {directBattleMode ? (
                        <>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-200">{t('Card chance', 'Chance de carta')}</p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cyan-200">{t('Random sentiment', 'Sentimento aleatório')}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-200">+{option.resourceBonusPercent}% {t('Resources', 'Recursos')}</p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-red-200">+{option.upgradeThreatBonus}% {t('Risk', 'Risco')}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {directBattleMode ? (
                    <div className="mt-3 h-10 rounded-xl border border-cyan-300/18 bg-cyan-300/8 px-3 py-2 text-center font-mono text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                      {t('Horizon level cap expanded to 100', 'Horizon liberada até o nível 100')}
                    </div>
                  ) : (
                    <PremiumCanvasButton
                      type="button"
                      onClick={() => upgradeSearch(option.id)}
                      disabled={option.upgradeLevel >= MAX_SEARCH_UPGRADE_LEVEL || qc < option.upgradeCost}
                      tone="green"
                      className="mt-3 h-10 w-full rounded-xl"
                      contentClassName="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-50"
                    >
                      {option.upgradeLevel >= MAX_SEARCH_UPGRADE_LEVEL
                        ? 'MAX'
                        : `${t('Upgrade', 'Melhorar')} · ${formatValue(option.upgradeCost)} QC`}
                    </PremiumCanvasButton>
                  )}
                </div>

                <div className="mt-2 rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    {directBattleMode ? t('Battle Spoils', 'Espólios da Batalha') : t('Recovered Supplies', 'Suprimentos Recuperados')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {directBattleMode ? (
                      <>
                        <span className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-200">
                          {battleRewardRange} QC
                        </span>
                        <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200">
                          {t('Sentiment', 'Sentimento')}
                        </span>
                        <span className="rounded-lg border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fuchsia-200">
                          {t('Card chance', 'Chance de carta')}
                        </span>
                      </>
                    ) : (
                      (Object.entries(option.rewards) as Array<[ColonySupplyId, number]>).map(([key, value]) => (
                        <span
                          key={`${option.id}-${key}`}
                          className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${SUPPLY_CONFIG[key].border} ${SUPPLY_CONFIG[key].color}`}
                        >
                          +{value} {SUPPLY_CONFIG[key].label[language]}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-1.5">
                  {searchSlots.map(slot => (
                    <PremiumCanvasButton
                      key={`${option.id}-start-${slot.slotIndex}`}
                      type="button"
                      onClick={() => handleSearchSlotAction(option, slot.slotIndex)}
                      disabled={allColoniesFullyBuilt
                        ? Boolean(activeSearchBattle) || slot.battleIndex !== searchBattleCycle.nextBattleIndex
                        : Boolean(slot.activeSearch)}
                      tone={option.id === 'sea' ? 'cyan' : 'green'}
                      className="h-12 rounded-2xl"
                      contentClassName="px-2 text-[11px] font-black uppercase tracking-[0.14em] text-white"
                    >
                      {allColoniesFullyBuilt
                        ? (slot.battleIndex < searchBattleCycle.nextBattleIndex
                            ? t('Won', 'Vencida')
                            : t(`Battle ${slot.battleIndex + 1}`, `Batalha ${slot.battleIndex + 1}`))
                        : (slot.activeSearch ? formatSearchTime(searchRemainingSeconds[slot.searchKey] || 0) : `Start ${slot.slotIndex + 1}`)}
                    </PremiumCanvasButton>
                  ))}
                </div>
                </div>
              </div>
            );})}

            <div
              className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-red-400/40 bg-cover bg-center p-5 text-red-300"
              style={{ backgroundImage: `url(${ROUTE4_LAYOUT_BACKGROUNDS.hangar})` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-black/48" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(248,113,113,0.24),transparent_42%),linear-gradient(to_bottom,rgba(127,29,29,0.2),rgba(0,0,0,0.36)_48%,rgba(0,0,0,0.7))]" />
              <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-80">{t('Aerial Defense', 'Defesa Aérea')}</p>
                  <h4 className="mt-2 font-orbitron text-xl font-black uppercase leading-tight text-white">{t('Defense Hangar', 'Hangar de Defesa')}</h4>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <Shield size={24} />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-zinc-300">
                {t(
                  'Open the Horizon hangar to configure battle cards, specials, ship attributes, and pending defenses.',
                  'Abra o hangar da Horizon para configurar cartas de batalha, especiais, atributos da nave e defesas pendentes.'
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-red-300/25 bg-black/35 p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-red-200/70">{t('Threats', 'Ameaças')}</p>
                  <p className="mt-1 font-orbitron text-xl font-black text-white">{pendingDefenseThreats.length}</p>
                </div>
                <div className="rounded-xl border border-red-300/25 bg-black/35 p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-red-200/70">{t('Battle Cards', 'Cartas')}</p>
                  <p className="mt-1 font-orbitron text-xl font-black text-white">{ownedBattleCards.length}</p>
                </div>
                <div className="rounded-xl border border-red-300/25 bg-black/35 p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-red-200/70">{t('Damage', 'Dano')}</p>
                  <p className="mt-1 font-orbitron text-xl font-black text-white">{battleShipStats.damage}</p>
                </div>
                <div className="rounded-xl border border-red-300/25 bg-black/35 p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-red-200/70">{t('Shield', 'Escudo')}</p>
                  <p className="mt-1 font-orbitron text-xl font-black text-white">{battleShipStats.shield}</p>
                </div>
              </div>

              <PremiumCanvasButton
                type="button"
                onClick={openDefenseHangar}
                tone="red"
                className="mt-auto h-12 rounded-2xl"
                contentClassName="px-4 text-[12px] font-black uppercase tracking-[0.22em] text-white"
              >
                {t('Open Hangar', 'Abrir Hangar')}
              </PremiumCanvasButton>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
