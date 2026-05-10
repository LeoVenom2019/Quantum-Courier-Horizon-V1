// lib/game-state/types.ts

export type RouteTier = 'Solar' | 'Interstellar' | 'Void' | 'Earth';
export type Language = 'pt' | 'en';

// ── Base Game Interfaces ──────────────────────────────────────────

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  rewardAetherion?: number;
  rewardXP?: number;
  type: 'delivery' | 'sell' | 'initial';
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  shipLevel?: number;
  oreId?: string;
  tier: RouteTier;
  rarity: 'common' | 'rare' | 'legendary' | 'mythic' | 'alien';
}

export interface RouteStats {
  deliveries: number;
  manualDeliveries: number;
  autoDeliveries: number;
  qcFromDeliveries: number;
  qcFromMining: number;
  qcFromExtraction: number;
  qcSpent: number;
  qcTotalAcquired: number;
  missionsCompleted: number;
  qcFromMissions: number;
  qcFromTutorial: number;
  randomBattlesFound: number;
  radarBattlesFound: number;
  manualMiningPacksSold: number;
  autoMiningPacksSold: number;
  manualExtractionPacksSold: number;
  autoExtractionPacksSold: number;
  qcFromBattles: number;
  battlesWon: number;
  perfectDeliveries: number;
  years?: number;
  population?: number;
  biodiversity?: number;
  events?: number;
  health?: number;
  happiness?: number;
  security?: number;
  qualityOfLife?: number;
}

export interface Battle {
  id: string;
  routeId: string;
  deliveryId: string;
  enemyName: string;
  enemyType: 'Pirate' | 'Alien' | 'Elite' | 'Boss';
  enemyColor: string;
  enemyMaxHp: number;
  enemyHp: number;
  playerMaxHp: number;
  playerHp: number;
  reward: number;
  xpReward?: number;
  aetherionReward?: number;
  startTime: number;
  lastPlayerAttack: { [key: string]: number };
  lastEnemyAttack: number;
  shieldActive?: boolean;
  lastShieldTime?: number;
  isVictory?: boolean;
  isDefeat?: boolean;
  winProbability?: number;
  enemyTier?: number;
  predeterminedResult?: 'victory' | 'defeat';
  isCinematicFinished?: boolean;
  isAutoSkipped?: boolean;
  playerImage?: string;
  enemyImage?: string;
  playerDps?: number;
  enemyDps?: number;
  isBoss?: boolean;
}

export interface BattleLogEntry {
  id: string;
  type: string;
  outcome: 'victory' | 'defeat';
  reward?: { qc: number, xp: number, aetherion: number };
  time: number;
  enemyName: string;
}

export interface ActiveDelivery {
  id: string;
  routeId: string;
  progress: number; // 0 to 100
  speed: number;
  startTime: number;
  shipLevel: number;
  distance: number;
  status: 'delivering' | 'queued' | 'combat';
  tier: RouteTier;
}

// ── Domínio: Economy ──────────────────────────────────────────────
export interface EconomyState {
  qc: number;
  aetherion: number;
  miningWaste: number;
  solarEnergy: number;
  aetherionTubes: number;
  totalExtractionProfit: number;
}

// ── Domínio: Progression ──────────────────────────────────────────
export interface ProgressionState {
  routeTier: RouteTier;
  unlockedRouteIds: string[];
  ownedShips: Record<string, number>;
  techLevels: Record<string, Record<string, number>>;
  unlockedTechLevels: Record<string, number>;
  autoTravelSlots: Record<string, number>;
  shipLevel: number;
  shipXP: number;
  battleLevel: number;
  radarLevel: number;
  privatePoliceLevel: number;
  doubleRouteLevel: number;
  doomPLevel: number;
  captureLevel: number;
  extractionTechLevel: number;
  solarMappingLevel: number;
  warCoreLevel: number;
  battleShipUpgradeLevel: number;
  route4Unlocked: boolean;
  gameTimeSeconds: number;
  autoSkipRandomBattles: boolean;
  researchingTech: {
    tier: RouteTier;
    level: number;
    startTime: number;
    endTime: number;
  } | null;
}

// ── Domínio: Mining ───────────────────────────────────────────────
export interface MiningState {
  miningRobots: Record<string, number>;
  miningRobotLevels: Record<string, number>;
  oresCollected: Record<string, number>;
  autoSellByOre: Record<string, boolean>;
  autoSellUnlockedByOre: Record<string, boolean>;
  miningCompressionLevels: Record<string, number>;
  extractionPacks: Record<string, number>;
  extractionRobotLevels: Record<string, number>;
  extractionProductionLevels: Record<string, number>;
  extractionAutoSell: Record<string, boolean>;
  extractionAutoSellUnlocked: Record<string, boolean>;
  extractionCompressionLevels: Record<string, number>;
  unlockedExtractionPoints: string[];
  researchingExtractionPoint: {
    id: string;
    startTime: number;
    endTime: number;
  } | null;
  voidAutoShipmentUnlocked: boolean;
  voidAutoShipmentActive: boolean;
  extractionCycleProgress: Record<string, number>;
}

// ── Domínio: Combat ───────────────────────────────────────────────
export interface VoidBattleShipStats {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  damage: number;
  critChance: number;
  lootEfficiency: number;
  rarity: 'common' | 'rare' | 'elite' | 'legendary' | 'mythic';
  upgrades: { damage: number; shield: number; crit: number; loot: number };
}

export interface CombatState {
  activeBattle: Battle | null;
  foundBattle: Battle | null;
  voidBattleStatus: 'idle' | 'searching' | 'choosing' | 'fighting' | 'won' | 'lost';
  voidBattleShipStats: VoidBattleShipStats;
  isRetributionActive: boolean;
  isFatigueActive: boolean;
  voidResources: { minerals: number; energy: number; food: number; tech: number; meds: number };
  voidCompactedResources: Record<string, number>;
  voidPOIsInspiration: Record<string, Record<string, number>>;
  isVoidWarActive: boolean;
  voidWarProgress: { currentSector: number; currentBattle: number };
  robotRepairProgress: number;
  isRobotRepaired: boolean;
  underAttackBattle: Battle | null;
}

// ── Domínio: Missions ─────────────────────────────────────────────
export interface MissionsState {
  missions: Mission[];
  historyStats: Record<string, RouteStats>;
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  skillLendariaLevel: Record<string, number>;
  skillMiticaLevel: Record<string, number>;
  skillAlienLevel: Record<string, number>;
  skillTempoDinheiroLevel: Record<string, number>;
  skillRobosOlimpicosLevel: Record<string, number>;
  missionRewardLevel: Record<string, number>;
  missionMythicBonus: number;
  missionAlienBonus: number;
  missionLegendaryBonus: number;
  autoClaimMissions: boolean;
  radarUnlocked: Record<string, boolean>;
  completedInitialMissions: string[];
  lastScanTime: number;
}

// ── Domínio: Earth ────────────────────────────────────────────────
export interface EarthState {
  population: number;
  maleRatio: number;
  biodiversity: number;
  health: number;
  happiness: number;
  security: number;
  qualityOfLife: number;
  season: number;
  events: any[];
  reconstructionProgress: Record<string, number>;
  couples: number;
  birthRegistry: Record<string, number>;
  projectBoostCount: number;
}

// ── Domínio: Sistema ──────────────────────────────────────────────
export interface SystemState {
  seenTutorials: Record<string, boolean>;
  arcadeScores: Record<string, number>;
  localRecords: any[];
  hasSeenRoute2UnlockMessage: boolean;
  playerName: string;
}

// ── Root State ───────────────────────────────────────────────────
export interface GameState {
  economy: EconomyState;
  progression: ProgressionState;
  mining: MiningState;
  combat: CombatState;
  missions: MissionsState;
  earth: EarthState;
  system: SystemState;
}

// ── Actions ───────────────────────────────────────────────────────

export type GameAction =
  // ── Economy ──────────────────────────────────────────────────────
  | { type: 'EARN_QC';        payload: { amount: number; source: 'delivery' | 'mining' | 'battle' | 'mission' | 'extraction' | 'tutorial' } }
  | { type: 'SPEND_QC';       payload: { amount: number } }
  | { type: 'SET_QC';         payload: { amount: number } }
  | { type: 'EARN_AETHERION'; payload: { amount: number } }
  | { type: 'SPEND_AETHERION';payload: { amount: number } }
  | { type: 'SET_AETHERION';  payload: { amount: number } }
  | { type: 'EARN_RESOURCES'; payload: { miningWaste?: number; solarEnergy?: number; aetherionTubes?: number; totalExtractionProfit?: number } }
  | { type: 'SET_RESOURCES';  payload: { miningWaste?: number; solarEnergy?: number; aetherionTubes?: number; totalExtractionProfit?: number } }
  | { type: 'SYNTHESIZE_AETHERION' }

  // ── Progression ───────────────────────────────────────────────────
  | { type: 'BUY_SHIP';           payload: { shipKey: string } }
  | { type: 'UNLOCK_ROUTE';       payload: { routeId: string } }
  | { type: 'ADVANCE_ROUTE_TIER';payload: { tier: RouteTier } }
  | { type: 'UPGRADE_TECH';      payload: { locationId: string; category: string } }
  | { type: 'UNLOCK_TECH_LEVEL';  payload: { tier: string; level: number } }
  | { type: 'BUY_AUTO_SLOT';      payload: { routeId: string } }
  | { type: 'SET_OWNED_SHIPS';    payload: { ownedShips: Record<string, number> } }
  | { type: 'SET_UNLOCKED_ROUTES';payload: { routeIds: string[] } }
  | { type: 'SET_AUTO_TRAVEL_SLOTS'; payload: { slots: Record<string, number> } }
  | { type: 'SET_TECH_LEVELS';       payload: { techLevels: Record<string, Record<string, number>> } }
  | { type: 'LEVEL_UP_SHIP' }
  | { type: 'ADD_SHIP_XP';       payload: { amount: number } }
  | { type: 'UPGRADE_BATTLE_LEVEL' }
  | { type: 'UPGRADE_RADAR' }
  | { type: 'UPGRADE_PRIVATE_POLICE' }
  | { type: 'UPGRADE_DOUBLE_ROUTE' }
  | { type: 'UPGRADE_DOOM_P' }
  | { type: 'UPGRADE_CAPTURE' }
  | { type: 'UPGRADE_WAR_CORE' }
  | { type: 'UNLOCK_ROUTE4' }
  | { type: 'SET_GAME_TIME';         payload: { seconds: number } }
  | { type: 'SET_RESEARCHING_TECH';   payload: { researchingTech: ProgressionState['researchingTech'] } }
  | { type: 'SET_UNLOCKED_TECH_LEVELS'; payload: { techLevels: Record<string, number> } }
  | { type: 'UPGRADE_EXTRACTION_TECH' }
  | { type: 'UPGRADE_SOLAR_MAPPING' }
  | { type: 'SET_PROGRESSION_DATA';    payload: Partial<ProgressionState> }
  | { type: 'UPGRADE_BATTLESHIP_LEVEL' }
  | { type: 'START_RESEARCH';    payload: { tier: RouteTier; level: number; duration: number } }
  | { type: 'BOOST_RESEARCH';    payload: { amount: number } }
  | { type: 'TOGGLE_AUTO_SKIP_RANDOM_BATTLES' }

  // ── Mining ────────────────────────────────────────────────────────
  | { type: 'BUY_MINING_ROBOT';          payload: { oreId: string } }
  | { type: 'UPGRADE_MINING_ROBOT';      payload: { oreId: string } }
  | { type: 'COLLECT_ORE';              payload: { oreId: string; amount: number } }
  | { type: 'SELL_ORE';                 payload: { oreId: string; packs: number; value: number } }
  | { type: 'TOGGLE_AUTO_SELL_ORE';     payload: { oreId: string } }
  | { type: 'UPGRADE_MINING_COMPRESSION';payload: { oreId: string } }
  | { type: 'UNLOCK_EXTRACTION_POINT';  payload: { pointId: string } }
  | { type: 'START_EXTRACTION_RESEARCH';payload: { pointId: string; endTime: number } }
  | { type: 'FINISH_EXTRACTION_RESEARCH';payload: { pointId: string } }
  | { type: 'SET_RESEARCHING_EXTRACTION_POINT'; payload: { research: MiningState['researchingExtractionPoint'] } }
  | { type: 'ADD_EXTRACTION_PACKS';     payload: { pointId: string; amount: number } }
  | { type: 'SELL_EXTRACTION_PACKS';    payload: { pointId: string; packs: number; value: number } }
  | { type: 'UPGRADE_EXTRACTION_ROBOT'; payload: { pointId: string } }
  | { type: 'UPGRADE_EXTRACTION_PRODUCTION'; payload: { pointId: string } }
  | { type: 'UPGRADE_EXTRACTION_COMPRESSION'; payload: { pointId: string } }
  | { type: 'TOGGLE_EXTRACTION_AUTO_SELL'; payload: { pointId: string } }
  | { type: 'UNLOCK_EXTRACTION_AUTO_SELL'; payload: { pointId: string } }
  | { type: 'BOOST_EXTRACTION_RESEARCH';    payload: { amount: number } }
  | { type: 'SET_MINING_ROBOTS';         payload: { robots: Record<string, number> } }
  | { type: 'SET_MINING_ROBOT_LEVELS';    payload: { levels: Record<string, number> } }
  | { type: 'SET_ORES_COLLECTED';        payload: { ores: Record<string, number> } }
  | { type: 'SET_AUTO_SELL_BY_ORE';      payload: { autoSell: Record<string, boolean> } }
  | { type: 'SET_AUTO_SELL_UNLOCKED_BY_ORE'; payload: { unlocked: Record<string, boolean> } }
  | { type: 'SET_MINING_COMPRESSION_LEVELS'; payload: { levels: Record<string, number> } }
  | { type: 'SET_EXTRACTION_DATA';       payload: { 
      packs?: Record<string, number>, 
      robots?: Record<string, number>, 
      production?: Record<string, number>, 
      compression?: Record<string, number>,
      autoSell?: Record<string, boolean>,
      autoSellUnlocked?: Record<string, boolean>
    } }
  | { type: 'SET_UNLOCKED_EXTRACTION_POINTS'; payload: { pointIds: string[] } }
  | { type: 'TOGGLE_VOID_AUTO_SHIPMENT' }
  | { type: 'SET_VOID_AUTO_SHIPMENT_UNLOCKED'; payload: { unlocked: boolean } }
  | { type: 'SET_EXTRACTION_PROGRESS';   payload: { progress: Record<string, number> } }

  // ── Combat ────────────────────────────────────────────────────────
  | { type: 'START_BATTLE';         payload: { battle: Battle } }
  | { type: 'BATTLE_PLAYER_ATTACK'; payload: { damage: number; ability: string } }
  | { type: 'BATTLE_ENEMY_ATTACK';  payload: { damage: number } }
  | { type: 'BATTLE_WON';           payload: { reward: number; xp: number; aetherion: number; tier: string } }
  | { type: 'BATTLE_LOST';          payload: { deliveryId: string } }
  | { type: 'FLEE_BATTLE' }
  | { type: 'SKIP_BATTLE';          payload: { battle: Battle; result: 'victory' | 'defeat' } }
  | { type: 'FIND_BATTLE';          payload: { battle: Battle } }
  | { type: 'DISMISS_FOUND_BATTLE' }
  | { type: 'SET_VOID_BATTLE_STATUS'; payload: { status: CombatState['voidBattleStatus'] } }
  | { type: 'UPGRADE_VOID_SHIP';    payload: { stat: 'damage' | 'shield' | 'crit' | 'loot' } }
  | { type: 'TOGGLE_RETRIBUTION' }
  | { type: 'TOGGLE_FATIGUE' }
  | { type: 'REPAIR_ROBOT';         payload: { amount: number } }
  | { type: 'START_VOID_WAR' }
  | { type: 'TOGGLE_VOID_WAR';      payload: { active: boolean } }
  | { type: 'ADVANCE_VOID_WAR';     payload: { sector: number; battle: number } }
  | { type: 'EARN_VOID_RESOURCES';  payload: Partial<CombatState['voidResources']> }
  | { type: 'COMPACT_VOID_RESOURCES'; payload: { key: string; amount: number } }
  | { type: 'SET_VOID_POI_INSPIRATION'; payload: { inspiration: CombatState['voidPOIsInspiration'] } }
  | { type: 'SET_VOID_BATTLE_SHIP_STATS'; payload: { stats: CombatState['voidBattleShipStats'] } }
  | { type: 'SET_UNDER_ATTACK_BATTLE'; payload: { battle: Battle | null } }
  | { type: 'SET_COMBAT_DATA'; payload: Partial<CombatState> }
  | { type: 'SPEND_VOID_RESOURCES'; payload: Partial<CombatState['voidResources']> }
  | { type: 'UPDATE_VOID_COMPACTED'; payload: { key: string; delta: number } }
  | { type: 'APPLY_VOID_SHIPMENT'; payload: { resourceKey: string } }

  // ── Missions ──────────────────────────────────────────────────────
  | { type: 'ADD_MISSION';        payload: { mission: Mission } }
  | { type: 'UPDATE_MISSION';     payload: { id: string; delta: number } }
  | { type: 'COMPLETE_MISSION';   payload: { id: string } }
  | { type: 'CLAIM_MISSION';      payload: { id: string } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { id: string } }
  | { type: 'UPDATE_HISTORY';     payload: { tier: string; field: keyof RouteStats; amount: number } }
  | { type: 'SET_HISTORY_STATS';   payload: { stats: Record<string, RouteStats> } }
  | { type: 'UPGRADE_SKILL';      payload: { skill: string; tier: string } }
  | { type: 'UPGRADE_MISSION_REWARD'; payload: { tier: string } }
  | { type: 'TOGGLE_AUTO_CLAIM' }
  | { type: 'SET_MISSIONS_DATA';   payload: Partial<MissionsState> }
  | { type: 'SET_ACHIEVEMENT_PROGRESS'; payload: { achievementId: string; progress: number } }
  | { type: 'UPDATE_ACHIEVEMENT_PROGRESS'; payload: { achievementId: string; progress: number; isAbsolute?: boolean } }
  | { type: 'SET_COMPLETED_INITIAL_MISSIONS'; payload: { missionIds: string[] } }
  | { type: 'SET_LAST_SCAN_TIME'; payload: { time: number } }
  | { type: 'UNLOCK_RADAR'; payload: { tier: string } }

  // ── Earth ─────────────────────────────────────────────────────────
  | { type: 'EARTH_TICK';         payload: { deltaSeconds: number } }
  | { type: 'EARTH_EVENT';        payload: { event: any } }
  | { type: 'EARTH_SEND_RESOURCES'; payload: Record<string, number> }
  | { type: 'SET_EARTH_DATA';     payload: Partial<EarthState> }
  | { type: 'UPDATE_EARTH_STATE';  payload: Partial<EarthState> }

  // ── Sistema ───────────────────────────────────────────────────────
  | { type: 'LOAD_SAVE';    payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'SAVE_SNAPSHOT' }
  | { type: 'COMPLETE_TUTORIAL'; payload: { tutorialId: string } }
  | { type: 'SET_ARCADE_SCORE';  payload: { gameId: string; score: number } }
  | { type: 'ADD_LOCAL_RECORD';  payload: { record: any } }
  | { type: 'SET_HAS_SEEN_ROUTE2_MESSAGE'; payload: { hasSeen: boolean } }
  | { type: 'SET_SYSTEM_DATA';    payload: Partial<SystemState> }
