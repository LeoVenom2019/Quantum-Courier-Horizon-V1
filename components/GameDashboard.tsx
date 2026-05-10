'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  TrendingUp, 
  Shield, 
  ShieldCheck,
  Zap, 
  Settings, 
  Music, 
  Volume2, 
  Globe,
  MapPin,
  Heart,
  Database, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Cpu,
  Coins,
  Coffee,
  Home,
  Trophy,
  Navigation,
  Package,
  Compass as CompassIcon,
  Map as MapIcon,
  Lock,
  Pickaxe,
  Info,
  Monitor,
  Maximize,
  LogOut,
  Download,
  Upload,
  Target,
  History as HistoryIcon,
  Flame,
  Crosshair,
  ShieldAlert,
  Search,
  Sword,
  ZapOff,
  Star,
  Radar,
  Bot,
  Skull,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Activity,
  RefreshCw,
  FastForward,
  ArrowUpCircle,
  Save,
  X,
  Users,
  Check,
  Wrench,
  Gamepad2,
  Building2,
  Plane,
  MousePointer2,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { 
  ROUTES, 
  UPGRADES, 
  SHIPS, 
  ORES, 
  ROBOT_UPGRADES, 
  TECHNOLOGIES,
  ACHIEVEMENTS,
  EXTRACTION_POINTS,
  VOID_AIRCRAFT,
  VOID_POIS,
  Route, 
  Upgrade, 
  CargoType, 
  Ship,
  Ore,
  MiningRobotUpgrade,
  Technology,
  Achievement,
  ExtractionPoint,
  VoidAircraft,
  VoidPOI,
  GAME_THEMES,
  ThemeColor
} from '@/lib/game-data';
import { useSFX } from '@/hooks/useSFX';
import { GameStorage } from '@/lib/game-storage';
import { SaveManager } from '@/lib/save-manager';
import { useEconomy, useDispatch, useProgression, useMining, useCombat, useMissions, useEarth, useGame, useSystem } from '@/lib/game-state/index';
import { 
  EarthState, 
  CombatState, 
  EconomyState, 
  ProgressionState, 
  MiningState, 
  MissionsState as MissionState,
  Battle as ReduxBattle
} from '@/lib/game-state/types';
import { calcExtractionSaleValue, canAfford } from '@/lib/game-state/selectors';
import { SpaceAmbience } from './SpaceAmbience';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import { MiniGames } from './MiniGames';
import { ColonySystem, Colony, cleanColoniesData } from './ColonySystem';
import { LoreScreen, RobotVisual } from './LoreSystem';
import Lottie from 'lottie-react';
import EconomicGoals from './dashboard/EconomicGoals';
import SkillMap from './dashboard/SkillMap';
import VoidEarth from './dashboard/VoidEarth';
import EarthSidebar from './dashboard/EarthSidebar';
import VoidWarCore from './dashboard/VoidWarCore';
import VoidMap from './dashboard/VoidMap';
import MissionsTab from './dashboard/MissionsTab';
import { ROUTE_THEMES, ARCADE_THEMES, getRandomTrackForRoute } from '@/lib/music-data';
import RoutesTab from './dashboard/RoutesTab';
import AutoTab from './dashboard/AutoTab';
import HistoryTab from './dashboard/HistoryTab';
import ColoniesTab from './dashboard/ColoniesTab';
import VoidAircraftTab from './dashboard/void/VoidAircraftTab';
import VoidBattleTab from './dashboard/void/VoidBattleTab';
import VoidMapTab from './dashboard/void/VoidMapTab';
import VoidEarthTab from './dashboard/void/VoidEarthTab';
import MiningTab from './dashboard/MiningTab';
import AircraftTab from './dashboard/AircraftTab';
import TechnologyTab from './dashboard/TechnologyTab';
import UpgradesTab from './dashboard/UpgradesTab';
import BattleOverlay from './dashboard/BattleOverlay';
import BattleLevelTab from './dashboard/BattleLevelTab';
import VoidBattleArena, { 
  VoidBattleEnemy, 
  VoidBattleProjectile, 
  VoidBattleParticle, 
  VoidBattleDamageNumber, 
  VoidBattleState 
} from './VoidBattleArena';
import ShipVisual from './ShipVisual';
import { dashboardTranslations as translations } from '@/lib/i18n/dashboard-translations';
import { DashboardProvider, useDashboard } from './dashboard/DashboardProvider';
import { 
  EXTRACTION_PRODUCTION_VALUES, 
  EXTRACTION_PRODUCTION_COSTS, 
  ROUTE_3_END_STEPS, 
  VOID_WAR_START_LORE, 
  SHIPS_ROUTE_3_STEPS, 
  MISSION_RARITY_UPGRADE_COSTS, 
  PRIVATE_POLICE_COSTS,
  getDoubleRouteMultiplier,
  getPoliceBonus,
  DOUBLE_ROUTE_COSTS,
  DOOM_P_COSTS,
  getDoomPBonus,
  VOID_LORE_LINES,
  ROUTE2_LORE_LINES,
  ROUTES_MAP,
  UPGRADES_MAP,
  ORES_MAP,
  ROBOT_UPGRADES_MAP,
  EXTRACTION_POINTS_MAP,
  TECHNOLOGIES_MAP
} from '@/lib/game-constants';
import { 
  RouteStats, 
  Mission, 
  BattleLogEntry, 
  ActiveDelivery, 
  Battle,
  Language
} from '@/lib/game-state/types';



const ColonyVideo = ({ src, isActive, color }: { src: string; isActive: boolean; color: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  return (
    <video 
      ref={videoRef}
      src={src}
      loop 
      muted 
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
    />
  );
};

const BattleStarField = memo(({ theme = 'cyan' }: { theme?: any }) => {
  const [stars] = useState(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.2
  })));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] star-animation"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: Math.max(1, star.size / 2),
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${-Math.random() * star.duration}s`
          }}
        />
      ))}
    </div>
  );
});

// Constants and Types moved to external files

// Translations and Constants moved to external files in @/lib

interface GameDashboardProps {
  language: Language;
  musicOn: boolean;
  sfxOn: boolean;
  setLanguage: (lang: Language) => void;
  setMusicOn: (on: boolean) => void;
  setSfxOn: (on: boolean) => void;
  playerName: string;
  localRecords?: { name: string; time: number; date: string }[];
  setLocalRecords?: (records: { name: string; time: number; date: string }[]) => void;
  onReturnToMenu: () => void;
  currentThemeIndex?: number;
  jukebox: any;
}

const GlitchText = ({ text, delay = 50, className = "" }: { text: string, delay?: number, className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay + (Math.random() * delay));
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return <p className={className}>{displayedText}</p>;
};

// --- Void Battle Arena Component (Isolated for Performance) ---





const DashboardContent = memo(({ 
  language, 
  musicOn, 
  sfxOn, 
  setLanguage, 
  setMusicOn, 
  setSfxOn,
  playerName,
  localRecords = [],
  setLocalRecords,
  onReturnToMenu,
  currentThemeIndex,
  jukebox
}: GameDashboardProps) => {
  const isSpeedRun = false;
  const dispatch = useDispatch();
  const progressionState = useProgression();
  const { 
    routeTier, 
    route4Unlocked, 
    gameTimeSeconds,
    doubleRouteLevel, 
    doomPLevel, 
    captureLevel, 
    battleLevel, 
    radarLevel, 
    privatePoliceLevel,
    warCoreLevel,
    unlockedTechLevels, 
    techLevels,
    autoTravelSlots,
    researchingTech,
    ownedShips,
    unlockedRouteIds,
    shipLevel,
    shipXP,
    battleShipUpgradeLevel,
    extractionTechLevel,
    solarMappingLevel
  } = progressionState;

  const economyState = useEconomy();
  const { 
    qc, 
    aetherion, 
    miningWaste, 
    solarEnergy, 
    aetherionTubes, 
    totalExtractionProfit 
  } = economyState;

  const missionsState = useMissions();
  const { 
    unlockedAchievements, 
    achievementProgress,
    historyStats,
    autoClaimMissions,
    completedInitialMissions,
    missionMythicBonus,
    missionAlienBonus,
    missionLegendaryBonus,
    missionRewardLevel,
    skillLendariaLevel,
    skillMiticaLevel,
    skillAlienLevel,
    skillTempoDinheiroLevel,
    skillRobosOlimpicosLevel,
    radarUnlocked,
    missions
  } = missionsState;

  const miningState = useMining();
  const { 
    miningRobots, 
    miningRobotLevels, 
    oresCollected, 
    autoSellByOre, 
    autoSellUnlockedByOre, 
    miningCompressionLevels,
    extractionPacks,
    extractionRobotLevels,
    extractionProductionLevels,
    extractionAutoSell,
    extractionAutoSellUnlocked,
    unlockedExtractionPoints,
    extractionCompressionLevels,
    researchingExtractionPoint,
    voidAutoShipmentUnlocked,
    voidAutoShipmentActive
  } = miningState;

  const combatState = useCombat();
  const { 
    activeBattle, 
    foundBattle, 
    isRetributionActive, 
    isFatigueActive,
    voidResources,
    voidCompactedResources,
    voidBattleShipStats,
    isVoidWarActive,
    voidWarProgress,
    voidPOIsInspiration,
    robotRepairProgress,
    isRobotRepaired,
    underAttackBattle
  } = combatState;

  const voidLocations = useMemo(() => ROUTES.filter(r => r.tier === 'Void'), []);
  const currentLocationId = useMemo(() => voidLocations[voidWarProgress.currentSector]?.id || voidLocations[0]?.id, [voidLocations, voidWarProgress.currentSector]);

  const { 
    population: earthPopulation,
    maleRatio: earthMaleRatio,
    biodiversity: earthBiodiversity,
    health: earthHealth,
    happiness: earthHappiness,
    security: earthSecurity,
    qualityOfLife: earthQualityOfLife,
    events: earthEvents,
    couples: earthCouples,
    birthRegistry: earthBirthRegistry,
    reconstructionProgress: earthReconstructionProgress,
    projectBoostCount: earthProjectBoostCount,
    season: earthSeason
  } = useEarth();
  
  const [formatNumbers, setFormatNumbers] = useState(false);
  const [arcadeScores, setArcadeScores] = useState<Record<string, number>>({});
  const [currentVoidLocationId, setCurrentVoidLocationId] = useState<number>(0);
  const { 
    activeTab, setActiveTab,
    autoTravelActive, setAutoTravelActive,
    autoTravelProgress, setAutoTravelProgress,
    autoTravelDesired, setAutoTravelDesired,
    activeDeliveries, setActiveDeliveries,
    totalDeliveries, setTotalDeliveries,
    deliveriesByLocation, setDeliveriesByLocation,
    voidAircraftMissions, setVoidAircraftMissions,
    voidAircraftUpgrades, setVoidAircraftUpgrades,
    voidAircraftAutoToggles, setVoidAircraftAutoToggles,
    voidAircraftConstruction, setVoidAircraftConstruction,
    unlockedVoidAircraft, setUnlockedVoidAircraft,
    voidBattleStatus, setVoidBattleStatus,
    voidBattleOptions, setVoidBattleOptions,
    activeVoidBattle, setActiveVoidBattle,
    voidBattleResult, setVoidBattleResult,
    aircraftSubTab, setAircraftSubTab,
    techSubTab, setTechSubTab,
    extractionPageIndex, setExtractionPageIndex,
    shipPageIndex, setShipPageIndex,
    historyPage, setHistoryPage,
    miningPageIndex, setMiningPageIndex,
    showVoidAircraftTutorial, setShowVoidAircraftTutorial,
    voidAircraftTutorialStep, setVoidAircraftTutorialStep,
    showSkillMap, setShowSkillMap,
    colonies, setColonies,
    isScanning, setIsScanning,
    scanProgress, setScanProgress,
    scanResult, setScanResult,
    lastScanTime, setLastScanTime,
    synthesizeAetherion,
    buyShip: buyShipAction, buyTech, researchPoint, buyAllUpgradesForShip,
    buyMiningRobot, upgradeMiningRobot, buyMiningCompression, buyAutoSell, sellOrePack,
    boostResearchExtractionPoint, upgradeExtractionRobot, upgradeExtractionProduction, upgradeExtractionCompression, buyExtractionAutoSell, toggleExtractionAutoSell, sellExtractionPointPacks,
    startVoidMission, claimVoidAircraftMission, upgradeVoidAircraft, buyVoidAircraft, speedUpVoidAircraft, toggleVoidAircraftAuto, buyVoidAircraftAuto,
    compactVoidResource, sendCompactedToEarth, buyVoidAutoShipment,
    battleNotification, setBattleNotification,
    findBattle, upgradeRadar, upgradeBattleLevel,
    exportGameData, importGameData,
    addLog, gameLogs,
    seenTutorials, completeTutorial,
    showRoute2Goals, setShowRoute2Goals,
    floatingRewards, setFloatingRewards,
    autoSkipRandomBattles, toggleAutoSkipRandomBattles
  } = useDashboard();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  const [activeMiniGameId, setActiveMiniGameId] = useState<string | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null);
  const [showRoute3Ending, setShowRoute3Ending] = useState(false);
  const [route3EndingStep, setRoute3EndingStep] = useState(0);
  const [showVoidLore, setShowVoidLore] = useState(false);
  const [showRoute2Lore, setShowRoute2Lore] = useState(false);
  const [voidWarRobotSpeaking, setVoidWarRobotSpeaking] = useState(false);
  const [voidWarAlertActive, setVoidWarAlertActive] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashingRed, setIsFlashingRed] = useState(false);
  const [showRoute3Confirm, setShowRoute3Confirm] = useState(false);
  const [loreLineIndex, setLoreLineIndex] = useState(0);
  const [isCCEOpen, setIsCCEOpen] = useState(false);
  const [isRHSEOpen, setIsRHSEOpen] = useState(false);
  const [showInvasionAlertOverlay, setShowInvasionAlertOverlay] = useState(false);
  const [showFliperamasTutorial, setShowFliperamasTutorial] = useState(false);
  const [showRestorationModal, setShowRestorationModal] = useState(false);
  const [showRobotModal, setShowRobotModal] = useState(false);
  const [showBattleShipUpgradeModal, setShowBattleShipUpgradeModal] = useState(false);
  const [showVoidWarMap, setShowVoidWarMap] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [showRoute2Info, setShowRoute2Info] = useState(false);
  const [showRoute3Info, setShowRoute3Info] = useState(false);
  const [showSpeedRunWinModal, setShowSpeedRunWinModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDoomProtocolInfo, setShowDoomProtocolInfo] = useState(false);
  const [showCaptureInfo, setShowCaptureInfo] = useState(false);
  const [showRoute2Confirm, setShowRoute2Confirm] = useState(false);
  const [isFirstInvasionBattle, setIsFirstInvasionBattle] = useState(false);

  const isInterstellar = useMemo(() => routeTier === 'Interstellar', [routeTier]);
  const isVoid = useMemo(() => routeTier === 'Void', [routeTier]);
  const isEarth = useMemo(() => routeTier === 'Earth', [routeTier]);

  const [selectedReward, setSelectedReward] = useState<{
    level: number;
    title: string;
    description: string;
    color: string;
    toggleable?: boolean;
  } | null>(null);

  // --- REFS BLOCK (Consolidated for Stability) ---
  const activeDeliveriesRef = React.useRef(activeDeliveries);
  const techLevelsRef = React.useRef(techLevels);
  const autoTravelActiveRef = React.useRef(autoTravelActive);
  const autoTravelDesiredRef = React.useRef(autoTravelDesired);
  const autoTravelProgressRef = React.useRef(autoTravelProgress);
  const autoTravelSlotsRef = React.useRef(autoTravelSlots);
  const totalDeliveriesRef = React.useRef(totalDeliveries);
  const deliveriesByLocationRef = React.useRef(deliveriesByLocation);
  const ownedShipsRef = React.useRef(ownedShips);
  const unlockedRouteIdsRef = React.useRef(unlockedRouteIds);
  const miningRobotsRef = React.useRef(miningRobots);
  const miningRobotLevelsRef = React.useRef(miningRobotLevels);
  const oresCollectedRef = React.useRef(oresCollected);
  const autoSellByOreRef = React.useRef(autoSellByOre);
  const autoSellUnlockedByOreRef = React.useRef(autoSellUnlockedByOre);
  const miningCompressionLevelsRef = React.useRef(miningCompressionLevels);
  const unlockedTechLevelsRef = React.useRef(unlockedTechLevels);
  const researchingTechRef = React.useRef(researchingTech);
  const route4UnlockedRef = React.useRef(route4Unlocked);
  const routeTierRef = React.useRef(routeTier);
  const isSpeedRunRef = React.useRef(isSpeedRun);
  const historyStatsRef = React.useRef(historyStats);
  const gameTimeSecondsRef = React.useRef(gameTimeSeconds);
  const earthPopulationRef = React.useRef(earthPopulation);
  const earthMaleRatioRef = React.useRef(earthMaleRatio);
  const earthBiodiversityRef = React.useRef(earthBiodiversity);
  const earthHealthRef = React.useRef(earthHealth);
  const earthHappinessRef = React.useRef(earthHappiness);
  const earthSecurityRef = React.useRef(earthSecurity);
  const earthQualityOfLifeRef = React.useRef(earthQualityOfLife);
  const earthEventsRef = React.useRef(earthEvents);
  const earthProjectBoostCountRef = React.useRef(earthProjectBoostCount);
  const activeMiniGameIdRef = React.useRef<string | null>(null);
  const voidAutoShipmentActiveRef = React.useRef(voidAutoShipmentActive);
  const voidAutoShipmentUnlockedRef = React.useRef(voidAutoShipmentUnlocked);
  const extractionPacksRef = React.useRef(extractionPacks);
  const extractionRobotLevelsRef = React.useRef(extractionRobotLevels);
  const extractionProductionLevelsRef = React.useRef(extractionProductionLevels);
  const extractionAutoSellRef = React.useRef(extractionAutoSell);
  const extractionCompressionLevelsRef = React.useRef(extractionCompressionLevels);
  const extractionAutoSellUnlockedRef = React.useRef(extractionAutoSellUnlocked);
  const totalExtractionProfitRef = React.useRef(totalExtractionProfit);
  const unlockedExtractionPointsRef = React.useRef(unlockedExtractionPoints);
  const shipXPRef = React.useRef(shipXP);
  const shipLevelRef = React.useRef(shipLevel);
  const extractionTechLevelRef = React.useRef(extractionTechLevel);
  const solarMappingLevelRef = React.useRef(solarMappingLevel);
  const doubleRouteLevelRef = React.useRef(doubleRouteLevel);
  const doomPLevelRef = React.useRef(doomPLevel);
  const captureLevelRef = React.useRef(captureLevel);
  const battleLevelRef = React.useRef(battleLevel);
  const radarLevelRef = React.useRef(radarLevel);
  const privatePoliceLevelRef = React.useRef(privatePoliceLevel);
  const activeBattleRef = React.useRef(activeBattle);
  const aetherionRef = React.useRef(aetherion);
  const miningWasteRef = React.useRef(miningWaste);
  const solarEnergyRef = React.useRef(solarEnergy);
  const aetherionTubesRef = React.useRef(aetherionTubes);
  const qcRef = React.useRef(qc);
  const isResettingRef = React.useRef(false);
  const pendingHistoryRef = React.useRef(false);
  const lastScanTimeRef = React.useRef(lastScanTime);
  const lastRandomBattleTimeRef = React.useRef(0);
  const unlockedAchievementsRef = React.useRef(unlockedAchievements);
  const achievementProgressRef = React.useRef(achievementProgress);
  const missionsRef = React.useRef<Mission[]>([]);
  const completedInitialMissionsRef = React.useRef<string[]>([]);
  const missionMythicBonusRef = React.useRef(missionMythicBonus);
  const missionAlienBonusRef = React.useRef(missionAlienBonus);
  const missionLegendaryBonusRef = React.useRef(missionLegendaryBonus);
  const missionRewardLevelRef = React.useRef(missionRewardLevel);
  const skillLendariaLevelRef = React.useRef(skillLendariaLevel);
  const skillMiticaLevelRef = React.useRef(skillMiticaLevel);
  const skillAlienLevelRef = React.useRef(skillAlienLevel);
  const skillTempoDinheiroLevelRef = React.useRef(skillTempoDinheiroLevel);
  const skillRobosOlimpicosLevelRef = React.useRef(skillRobosOlimpicosLevel);
  const warCoreLevelRef = React.useRef(warCoreLevel);
  const fleetPowerRef = React.useRef<number>(100);
  const earthReconstructionProgressRef = React.useRef(earthReconstructionProgress);
  const voidResourcesRef = React.useRef(voidResources);
  const voidCompactedResourcesRef = React.useRef(voidCompactedResources);
  const voidBattleShipStatsRef = React.useRef(voidBattleShipStats);
  const voidAircraftMissionsRef = React.useRef(voidAircraftMissions);
  const voidAircraftUpgradesRef = React.useRef(voidAircraftUpgrades);
  const voidAircraftAutoTogglesRef = React.useRef(voidAircraftAutoToggles);
  const voidPOIsInspirationRef = React.useRef(voidPOIsInspiration);
  const voidPOIQCDonationsRef = React.useRef<any>(null);
  const languageRef = React.useRef(language);
  const hasTriggeredVoidWarRef = React.useRef(false);
  const lastPregnancyYearRef = React.useRef(0);
  const isColoniesOpenRef = React.useRef(false);
  const earthEventTimerRef = React.useRef(Math.random() * 120 + 120);
  const extractionCycleProgressRef = React.useRef<any>(null);
  const hasWonEliminateEnemiesRoute3Ref = React.useRef(false);
  const robotRepairProgressRef = React.useRef(robotRepairProgress);
  const isRobotRepairedRef = React.useRef(isRobotRepaired);
  const underAttackBattleRef = React.useRef(underAttackBattle);
  const battleShipUpgradeLevelRef = React.useRef(battleShipUpgradeLevel);
  const isRetributionActiveRef = React.useRef(isRetributionActive);
  const isFatigueActiveRef = React.useRef(isFatigueActive);
  const unlockedVoidAircraftRef = React.useRef<string[]>([]);
  const voidAircraftConstructionRef = React.useRef<any>(null);
  const lastProcessedYearRef = React.useRef(-1);
  const autoClaimMissionsRef = React.useRef(autoClaimMissions);
  // Last-flushed baselines for the 500ms flush loop.
  // The flush loop must compare against these, NOT against the stale Redux state snapshot.
  const lastFlushedQcRef = React.useRef(qc);
  const lastFlushedAetherionRef = React.useRef(aetherion);
  const lastFlushedWasteRef = React.useRef(miningWaste);
  const lastFlushedSolarRef = React.useRef(solarEnergy);
  const lastFlushedTubesRef = React.useRef(aetherionTubes);

  // Optimization Refs
  const isLoadedRef = React.useRef(isLoaded);
  const pendingMissionProgressRef = React.useRef<Record<string, number>>({});
  const missionFlushCounterRef = React.useRef(0);
  const isTransitioningRef = React.useRef(isTransitioning);
  const showRoute2LoreRef = React.useRef(showRoute2Lore);
  const showVoidLoreRef = React.useRef(showVoidLore);
  const voidBattleStatusRef = React.useRef(voidBattleStatus);
  const activeTabRef = React.useRef(activeTab);


  // --- SYNC EFFECTS (Consolidated for Performance) ---

  // 1. Economy & Resources
  useEffect(() => {
    qcRef.current = qc;
    lastFlushedQcRef.current = qc;
    aetherionRef.current = aetherion;
    lastFlushedAetherionRef.current = aetherion;
    miningWasteRef.current = miningWaste;
    lastFlushedWasteRef.current = miningWaste;
    solarEnergyRef.current = solarEnergy;
    lastFlushedSolarRef.current = solarEnergy;
    aetherionTubesRef.current = aetherionTubes;
    lastFlushedTubesRef.current = aetherionTubes;
    voidResourcesRef.current = voidResources;
    voidCompactedResourcesRef.current = voidCompactedResources;
    totalExtractionProfitRef.current = totalExtractionProfit;
  }, [qc, aetherion, miningWaste, solarEnergy, aetherionTubes, voidResources, voidCompactedResources, totalExtractionProfit]);

  // 2. Progression & Technology
  useEffect(() => {
    routeTierRef.current = routeTier;
    unlockedRouteIdsRef.current = unlockedRouteIds;
    ownedShipsRef.current = ownedShips;
    techLevelsRef.current = techLevels;
    unlockedTechLevelsRef.current = unlockedTechLevels;
    autoTravelSlotsRef.current = autoTravelSlots;
    shipLevelRef.current = shipLevel;
    shipXPRef.current = shipXP;
    battleLevelRef.current = battleLevel;
    radarLevelRef.current = radarLevel;
    privatePoliceLevelRef.current = privatePoliceLevel;
    doubleRouteLevelRef.current = doubleRouteLevel;
    doomPLevelRef.current = doomPLevel;
    captureLevelRef.current = captureLevel;
    extractionTechLevelRef.current = extractionTechLevel;
    solarMappingLevelRef.current = solarMappingLevel;
    warCoreLevelRef.current = warCoreLevel;
    battleShipUpgradeLevelRef.current = battleShipUpgradeLevel;
    route4UnlockedRef.current = route4Unlocked;
    gameTimeSecondsRef.current = gameTimeSeconds;
    researchingTechRef.current = researchingTech;
  }, [
    routeTier, unlockedRouteIds, ownedShips, techLevels, unlockedTechLevels, 
    autoTravelSlots, shipLevel, shipXP, battleLevel, radarLevel, 
    privatePoliceLevel, doubleRouteLevel, doomPLevel, captureLevel, 
    extractionTechLevel, solarMappingLevel, warCoreLevel, battleShipUpgradeLevel, 
    route4Unlocked, gameTimeSeconds, researchingTech
  ]);

  // 3. Missions, Achievements & History
  useEffect(() => {
    activeDeliveriesRef.current = activeDeliveries;
    missionsRef.current = missions;
    completedInitialMissionsRef.current = completedInitialMissions;
    missionMythicBonusRef.current = missionMythicBonus;
    missionAlienBonusRef.current = missionAlienBonus;
    missionLegendaryBonusRef.current = missionLegendaryBonus;
    missionRewardLevelRef.current = missionRewardLevel;
    skillLendariaLevelRef.current = skillLendariaLevel;
    skillMiticaLevelRef.current = skillMiticaLevel;
    skillAlienLevelRef.current = skillAlienLevel;
    skillTempoDinheiroLevelRef.current = skillTempoDinheiroLevel;
    skillRobosOlimpicosLevelRef.current = skillRobosOlimpicosLevel;
    historyStatsRef.current = historyStats;
    lastScanTimeRef.current = lastScanTime;
    unlockedAchievementsRef.current = unlockedAchievements;
    achievementProgressRef.current = achievementProgress;
    autoClaimMissionsRef.current = autoClaimMissions;
  }, [
    activeDeliveries, missions, completedInitialMissions, missionMythicBonus, 
    missionAlienBonus, missionLegendaryBonus, missionRewardLevel, 
    skillLendariaLevel, skillMiticaLevel, skillAlienLevel, 
    skillTempoDinheiroLevel, skillRobosOlimpicosLevel, historyStats, lastScanTime,
    unlockedAchievements, achievementProgress, autoClaimMissions
  ]);

  // 4. Mining, Earth & Combat
  useEffect(() => {
    miningRobotsRef.current = miningRobots;
    miningRobotLevelsRef.current = miningRobotLevels;
    oresCollectedRef.current = oresCollected;
    autoSellByOreRef.current = autoSellByOre;
    autoSellUnlockedByOreRef.current = autoSellUnlockedByOre;
    miningCompressionLevelsRef.current = miningCompressionLevels;
    extractionPacksRef.current = extractionPacks;
    extractionRobotLevelsRef.current = extractionRobotLevels;
    extractionProductionLevelsRef.current = extractionProductionLevels;
    extractionAutoSellRef.current = extractionAutoSell;
    extractionAutoSellUnlockedRef.current = extractionAutoSellUnlocked;
    extractionCompressionLevelsRef.current = extractionCompressionLevels;
    voidAutoShipmentActiveRef.current = voidAutoShipmentActive;
    voidAutoShipmentUnlockedRef.current = voidAutoShipmentUnlocked;
    earthPopulationRef.current = earthPopulation;
    earthMaleRatioRef.current = earthMaleRatio;
    earthBiodiversityRef.current = earthBiodiversity;
    earthHealthRef.current = earthHealth;
    earthHappinessRef.current = earthHappiness;
    earthSecurityRef.current = earthSecurity;
    earthQualityOfLifeRef.current = earthQualityOfLife;
    earthEventsRef.current = earthEvents;
    earthProjectBoostCountRef.current = earthProjectBoostCount;
    earthReconstructionProgressRef.current = earthReconstructionProgress;
    voidPOIsInspirationRef.current = voidPOIsInspiration;
    robotRepairProgressRef.current = robotRepairProgress;
    isRobotRepairedRef.current = isRobotRepaired;
    activeBattleRef.current = activeBattle;
    isRetributionActiveRef.current = isRetributionActive;
    isFatigueActiveRef.current = isFatigueActive;
    underAttackBattleRef.current = underAttackBattle;
  }, [
    miningRobots, miningRobotLevels, oresCollected, autoSellByOre, 
    autoSellUnlockedByOre, miningCompressionLevels, extractionPacks, 
    extractionRobotLevels, extractionProductionLevels, extractionAutoSell, 
    extractionAutoSellUnlocked, extractionCompressionLevels, 
    voidAutoShipmentActive, voidAutoShipmentUnlocked,
    earthPopulation, earthMaleRatio, earthBiodiversity, earthHealth, 
    earthHappiness, earthSecurity, earthQualityOfLife, earthEvents, 
    earthProjectBoostCount, earthReconstructionProgress,
    voidPOIsInspiration, robotRepairProgress, isRobotRepaired, activeBattle,
    isRetributionActive, isFatigueActive, underAttackBattle
  ]);

  // 5. Misc & Global
  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  // 6. Void Aircraft & Battle
  useEffect(() => {
    voidAircraftMissionsRef.current = voidAircraftMissions;
    voidAircraftUpgradesRef.current = voidAircraftUpgrades;
    voidAircraftAutoTogglesRef.current = voidAircraftAutoToggles;
    voidBattleShipStatsRef.current = voidBattleShipStats;
  }, [voidAircraftMissions, voidAircraftUpgrades, voidAircraftAutoToggles, voidBattleShipStats]);

  useEffect(() => {
    isSpeedRunRef.current = isSpeedRun;
    autoTravelActiveRef.current = autoTravelActive;
    autoTravelProgressRef.current = autoTravelProgress;
    autoTravelDesiredRef.current = autoTravelDesired;
    languageRef.current = language;
    isTransitioningRef.current = isTransitioning;
    showRoute2LoreRef.current = showRoute2Lore;
    showVoidLoreRef.current = showVoidLore;
    voidBattleStatusRef.current = voidBattleStatus;
    activeTabRef.current = activeTab;
  }, [isSpeedRun, autoTravelActive, autoTravelProgress, autoTravelDesired, language, isTransitioning, showRoute2Lore, showVoidLore, voidBattleStatus, activeTab]);


  useEffect(() => {
    lastRandomBattleTimeRef.current = Date.now();
  }, []);


  const gameTime = useMemo(() => {
    const totalDays = Math.floor(gameTimeSeconds * 0.75);
    const years = Math.floor(totalDays / 360);
    const months = Math.floor((totalDays % 360) / 30);
    const days = totalDays % 30;
    return { years, months, days };
  }, [gameTimeSeconds]);
  
  const setRouteTier = useCallback((tier: 'Solar' | 'Interstellar' | 'Void' | 'Earth') => {
    dispatch({ type: 'ADVANCE_ROUTE_TIER', payload: { tier } });
  }, [dispatch]);

  const setRoute4Unlocked = useCallback((val: boolean) => {
    if (val) dispatch({ type: 'UNLOCK_ROUTE4' });
  }, [dispatch]);

  const setGameTimeSeconds = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(gameTimeSeconds) : val;
    dispatch({ type: 'SET_GAME_TIME', payload: { seconds: nextVal } });
  }, [gameTimeSeconds, dispatch]);

  const isArcadeUnlocked = routeTier === 'Earth';
  const isNeon = false;
  
  const currentTheme = typeof currentThemeIndex === 'number' ? GAME_THEMES[currentThemeIndex] : null;
  
  const themeColor = isNeon ? 'pink' : (currentTheme ? currentTheme.color : (isEarth ? 'emerald' : (isVoid ? 'purple' : (isInterstellar ? 'orange' : 'cyan'))));
  
  const themeText = themeColor === 'pink' ? 'text-pink-500' : 
                   themeColor === 'purple' ? 'text-purple-300' : 
                   themeColor === 'orange' ? 'text-orange-500' : 
                   themeColor === 'blue' ? 'text-blue-400' :
                   themeColor === 'neila' ? 'text-emerald-400' :
                   themeColor === 'violet' ? 'text-violet-400' :
                   themeColor === 'amber' ? 'text-amber-400' :
                   themeColor === 'emerald' ? 'text-emerald-400' :
                   themeColor === 'rose' ? 'text-rose-400' :
                   'text-cyan-400';

  const themeBorder = themeColor === 'pink' ? 'border-pink-500' : 
                     themeColor === 'purple' ? 'border-purple-500' : 
                     themeColor === 'orange' ? 'border-orange-600' : 
                     themeColor === 'blue' ? 'border-blue-500' :
                     themeColor === 'neila' ? 'border-emerald-500' :
                     themeColor === 'violet' ? 'border-violet-500' :
                     themeColor === 'amber' ? 'border-amber-500' :
                     themeColor === 'emerald' ? 'border-emerald-500' :
                     themeColor === 'rose' ? 'border-rose-500' :
                     'border-cyan-500';

  const themeBg = themeColor === 'pink' ? 'bg-pink-600/10' : 
                 themeColor === 'purple' ? 'bg-purple-600/10' : 
                 themeColor === 'orange' ? 'bg-orange-600/10' : 
                 themeColor === 'blue' ? 'bg-blue-600/10' :
                 themeColor === 'neila' ? 'bg-emerald-600/10' :
                 themeColor === 'violet' ? 'bg-violet-600/10' :
                 themeColor === 'amber' ? 'bg-amber-600/10' :
                 themeColor === 'emerald' ? 'bg-emerald-600/10' :
                 themeColor === 'rose' ? 'bg-rose-600/10' :
                 'bg-cyan-500/5';
  const themeGlow = isNeon ? 'shadow-[0_0_20px_rgba(219,39,119,0.6)]' : (isVoid ? 'shadow-[0_0_20px_rgba(168,85,247,0.6)]' : (isInterstellar ? 'shadow-[0_0_20px_rgba(234,88,12,0.6)]' : 'shadow-[0_0_15px_rgba(6,182,212,0.4)]'));
  const themeAccent = isNeon ? 'from-pink-600 to-purple-400' : (isVoid ? 'from-purple-600 to-fuchsia-400' : (isInterstellar ? 'from-red-600 via-orange-500 to-yellow-400' : 'from-cyan-600 to-cyan-400'));

  const { playSfx, stopSfx } = useSFX(sfxOn);


  const setQc = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(qcRef.current) : val;
    qcRef.current = nextVal;
    dispatch({ type: 'SET_QC', payload: { amount: nextVal } });
  }, [dispatch]);

  const setAetherion = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(aetherionRef.current) : val;
    aetherionRef.current = nextVal;
    dispatch({ type: 'SET_AETHERION', payload: { amount: nextVal } });
  }, [dispatch]);

  const setTotalExtractionProfit = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(totalExtractionProfitRef.current) : val;
    totalExtractionProfitRef.current = nextVal;
    dispatch({ type: 'SET_RESOURCES', payload: { totalExtractionProfit: nextVal } });
  }, [dispatch]);

  const setMiningWaste = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(miningWasteRef.current) : val;
    miningWasteRef.current = nextVal;
    dispatch({ type: 'SET_RESOURCES', payload: { miningWaste: nextVal } });
  }, [dispatch]);

  const setSolarEnergy = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(solarEnergyRef.current) : val;
    solarEnergyRef.current = nextVal;
    dispatch({ type: 'SET_RESOURCES', payload: { solarEnergy: nextVal } });
  }, [dispatch]);

  const setAetherionTubes = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(aetherionTubesRef.current) : val;
    aetherionTubesRef.current = nextVal;
    dispatch({ type: 'SET_RESOURCES', payload: { aetherionTubes: nextVal } });
  }, [dispatch]);

  
  // Grouped Deliveries Memoization for the new UI
  const groupedDeliveries = useMemo(() => {
    const groups: { [routeId: string]: {
      routeId: string;
      manualCount: number;
      autoActive: boolean;
      totalCount: number;
      avgProgress: number;
      status: string;
      tier: string;
      shipLevel: number;
    }} = {};

    // Process Manual Deliveries
    activeDeliveries.forEach(d => {
      if (!groups[d.routeId]) {
        groups[d.routeId] = {
          routeId: d.routeId,
          manualCount: 0,
          autoActive: false,
          totalCount: 0,
          avgProgress: 0,
          status: d.status,
          tier: d.tier,
          shipLevel: d.shipLevel
        };
      }
      groups[d.routeId].manualCount++;
      groups[d.routeId].totalCount++;
      groups[d.routeId].avgProgress += d.progress;
      // If any is combat, status is combat
      if (d.status === 'combat') groups[d.routeId].status = 'combat';
    });

    // Finalize averages
    Object.values(groups).forEach(g => {
      if (g.totalCount > 0) {
        g.avgProgress = g.avgProgress / g.totalCount;
      }
    });

    return Object.values(groups).sort((a, b) => b.totalCount - a.totalCount);
  }, [activeDeliveries]);





  // Achievement Refs are now handled in the consolidated Sync Effects above


  const updateAchievementProgress = useCallback((id: string, amount: number, isSet: boolean = false) => {
    dispatch({ type: 'UPDATE_ACHIEVEMENT_PROGRESS', payload: { achievementId: id, progress: amount, isAbsolute: isSet } });

    // Read from refs so this callback has a stable identity (no re-creation on every Redux update)
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    const currentProgress = achievementProgressRef.current[id] || 0;
    const nextProgress = isSet ? amount : currentProgress + amount;

    if (achievement && nextProgress >= achievement.target && !unlockedAchievementsRef.current.includes(id)) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { id } });
      setAchievementNotification(achievement);
      playSfx('success');
      setTimeout(() => setAchievementNotification(null), 5000);
    }
  }, [dispatch, playSfx]);

  // Route Music System
  useEffect(() => {
    // Only run when loaded and music is ON
    if (!isLoaded || !musicOn) {
      if (isLoaded && !musicOn) {
        console.log('[MusicEngine] Music is OFF, skipping route playlist');
      }
      return;
    }

    // Priority for Arcade Music
    if (activeMiniGameId) {
      const arcadeTheme = ARCADE_THEMES[activeMiniGameId];
      if (arcadeTheme && arcadeTheme.playlist.length > 0) {
        const currentUrl = jukebox.currentTrack?.url;
        const isArcadeTrack = currentUrl && arcadeTheme.playlist.some((t: any) => t.url === currentUrl);
        
        if (!isArcadeTrack) {
          console.log(`[MusicEngine] Arcade detected: ${activeMiniGameId}. Switching to arcade playlist...`);
          jukebox.playPlaylist(arcadeTheme.playlist);
        }
        return; // Stay in arcade music
      }
    }

    const theme = ROUTE_THEMES[routeTier];
    if (theme && theme.playlist.length > 0) {
      const currentUrl = jukebox.currentTrack?.url;
      const isThemeTrack = currentUrl && theme.playlist.some((t: any) => t.url === currentUrl);
      
      if (!isThemeTrack) {
        console.log(`[MusicEngine] Route detected: ${routeTier}. Switching to theme playlist...`);
        jukebox.playPlaylist(theme.playlist);
      }
    } else {
      console.warn(`[MusicEngine] No playlist found for route: ${routeTier}. Stopping playback.`);
      jukebox.stop();
    }
  }, [activeMiniGameId || routeTier, isLoaded, musicOn, jukebox.playPlaylist, jukebox.currentTrack?.url]);
  const setOresCollected = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(oresCollectedRef.current) : val;
    oresCollectedRef.current = nextVal;
    dispatch({ type: 'SET_ORES_COLLECTED', payload: { ores: nextVal } });
  }, [dispatch]);

  const setMiningCompressionLevels = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(miningCompressionLevels) : val;
    dispatch({ type: 'SET_MINING_COMPRESSION_LEVELS', payload: { levels: nextVal } });
  }, [miningCompressionLevels, dispatch]);

  const setAutoSellUnlockedByOre = useCallback((val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    const nextVal = typeof val === 'function' ? val(autoSellUnlockedByOre) : val;
    dispatch({ type: 'SET_AUTO_SELL_UNLOCKED_BY_ORE', payload: { unlocked: nextVal } });
  }, [autoSellUnlockedByOre, dispatch]);

  const setAutoClaimMissions = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(autoClaimMissions) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { autoClaimMissions: nextVal } });
  }, [autoClaimMissions, dispatch]);

  const setMissions = useCallback((val: Mission[] | ((prev: Mission[]) => Mission[])) => {
    const nextVal = typeof val === 'function' ? val(missionsRef.current) : val;
    missionsRef.current = nextVal;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { missions: nextVal } });
  }, [dispatch]);

  const setSkillLendariaLevel = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(skillLendariaLevel) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { skillLendariaLevel: nextVal } });
  }, [skillLendariaLevel, dispatch]);

  const setSkillMiticaLevel = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(skillMiticaLevelRef.current) : val;
    skillMiticaLevelRef.current = nextVal;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { skillMiticaLevel: nextVal } });
  }, [dispatch]);

  const setSkillAlienLevel = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(skillAlienLevel) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { skillAlienLevel: nextVal } });
  }, [skillAlienLevel, dispatch]);

  const setSkillTempoDinheiroLevel = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(skillTempoDinheiroLevel) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { skillTempoDinheiroLevel: nextVal } });
  }, [skillTempoDinheiroLevel, dispatch]);

  const setSkillRobosOlimpicosLevel = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(skillRobosOlimpicosLevel) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { skillRobosOlimpicosLevel: nextVal } });
  }, [skillRobosOlimpicosLevel, dispatch]);

  const setUnlockedAchievements = useCallback((val: string[] | ((prev: string[]) => string[])) => {
    const nextVal = typeof val === 'function' ? val(unlockedAchievements) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { unlockedAchievements: nextVal } });
  }, [unlockedAchievements, dispatch]);

  const setAchievementProgress = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(achievementProgress) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { achievementProgress: nextVal } });
  }, [achievementProgress, dispatch]);

  const setRadarUnlocked = useCallback((val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    const nextVal = typeof val === 'function' ? val(radarUnlocked) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { radarUnlocked: nextVal } });
  }, [radarUnlocked, dispatch]);

  const setMissionRewardLevel = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(missionRewardLevel) : val;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { missionRewardLevel: nextVal } });
  }, [missionRewardLevel, dispatch]);

  const setMissionMythicBonus = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(missionMythicBonusRef.current) : val;
    missionMythicBonusRef.current = nextVal;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { missionMythicBonus: nextVal } });
  }, [dispatch]);

  const setMissionAlienBonus = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(missionAlienBonusRef.current) : val;
    missionAlienBonusRef.current = nextVal;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { missionAlienBonus: nextVal } });
  }, [dispatch]);

  const setMissionLegendaryBonus = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(missionLegendaryBonusRef.current) : val;
    missionLegendaryBonusRef.current = nextVal;
    dispatch({ type: 'SET_MISSIONS_DATA', payload: { missionLegendaryBonus: nextVal } });
  }, [dispatch]);


  // Transition wrappers
  const setDoubleRouteLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(doubleRouteLevelRef.current) : val;
    doubleRouteLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { doubleRouteLevel: nextVal } });
  }, [dispatch]);

  const setDoomPLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(doomPLevelRef.current) : val;
    doomPLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { doomPLevel: nextVal } });
  }, [dispatch]);

  const setCaptureLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(captureLevelRef.current) : val;
    captureLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { captureLevel: nextVal } });
  }, [dispatch]);

  const setBattleLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(battleLevelRef.current) : val;
    battleLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { battleLevel: nextVal } });
  }, [dispatch]);

  const setRadarLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(radarLevelRef.current) : val;
    radarLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { radarLevel: nextVal } });
  }, [dispatch]);

  const setPrivatePoliceLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(privatePoliceLevelRef.current) : val;
    privatePoliceLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { privatePoliceLevel: nextVal } });
  }, [dispatch]);

  const setWarCoreLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(warCoreLevelRef.current) : val;
    warCoreLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { warCoreLevel: nextVal } });
  }, [dispatch]);

  const setResearchingTech = useCallback((val: ProgressionState['researchingTech'] | ((prev: ProgressionState['researchingTech']) => ProgressionState['researchingTech'])) => {
    const nextVal = typeof val === 'function' ? val(researchingTechRef.current) : val;
    researchingTechRef.current = nextVal;
    dispatch({ type: 'SET_RESEARCHING_TECH', payload: { researchingTech: nextVal } });
  }, [dispatch]);

  const setIsRetributionActive = useCallback((val: boolean | ((prev: boolean) => boolean)) => dispatch({ type: 'TOGGLE_RETRIBUTION' }), [dispatch]);
  const setIsFatigueActive = useCallback((val: boolean | ((prev: boolean) => boolean)) => dispatch({ type: 'TOGGLE_FATIGUE' }), [dispatch]);
  

  const setEarthPopulation = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthPopulation) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { population: nextVal } });
  }, [earthPopulation, dispatch]);

  const setEarthMaleRatio = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthMaleRatio) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { maleRatio: nextVal } });
  }, [earthMaleRatio, dispatch]);

  const setEarthBiodiversity = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthBiodiversity) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { biodiversity: nextVal } });
  }, [earthBiodiversity, dispatch]);

  const setEarthHealth = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthHealth) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { health: nextVal } });
  }, [earthHealth, dispatch]);

  const setEarthHappiness = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthHappiness) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { happiness: nextVal } });
  }, [earthHappiness, dispatch]);

  const setEarthSecurity = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthSecurity) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { security: nextVal } });
  }, [earthSecurity, dispatch]);

  const setEarthQualityOfLife = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthQualityOfLife) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { qualityOfLife: nextVal } });
  }, [earthQualityOfLife, dispatch]);

  const setEarthEvents = useCallback((val: any[] | ((prev: any[]) => any[])) => {
    const nextVal = typeof val === 'function' ? val(earthEvents) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { events: nextVal } });
  }, [earthEvents, dispatch]);

  const setActiveBattle = useCallback((val: Battle | null | ((prev: Battle | null) => Battle | null)) => {
    const nextVal = typeof val === 'function' ? val(activeBattle) : val;
    if (nextVal) {
      dispatch({ type: 'START_BATTLE', payload: { battle: nextVal } });
    } else {
      dispatch({ type: 'FLEE_BATTLE' });
    }
  }, [activeBattle, dispatch]);

  const setEarthCouples = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthCouples) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { couples: nextVal } });
  }, [earthCouples, dispatch]);

  const setEarthBirthRegistry = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(earthBirthRegistry) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { birthRegistry: nextVal } });
  }, [earthBirthRegistry, dispatch]);

  const setEarthReconstructionProgress = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(earthReconstructionProgress) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { reconstructionProgress: nextVal } });
  }, [earthReconstructionProgress, dispatch]);

  const setEarthProjectBoostCount = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(earthProjectBoostCount) : val;
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { projectBoostCount: nextVal } });
  }, [earthProjectBoostCount, dispatch]);

  const setRobotRepairProgress = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(robotRepairProgressRef.current) : val;
    robotRepairProgressRef.current = nextVal;
    dispatch({ type: 'SET_COMBAT_DATA', payload: { robotRepairProgress: nextVal } });
  }, [dispatch]);

  const setIsRobotRepaired = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isRobotRepairedRef.current) : val;
    isRobotRepairedRef.current = nextVal;
    dispatch({ type: 'SET_COMBAT_DATA', payload: { isRobotRepaired: nextVal } });
  }, [dispatch]);

  const setShipXP = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(shipXPRef.current) : val;
    shipXPRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { shipXP: nextVal } });
  }, [dispatch]);

  const setShipLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(shipLevelRef.current) : val;
    shipLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { shipLevel: nextVal } });
  }, [dispatch]);

  const setExtractionTechLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(extractionTechLevelRef.current) : val;
    extractionTechLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { extractionTechLevel: nextVal } });
  }, [dispatch]);

  const setSolarMappingLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(solarMappingLevelRef.current) : val;
    solarMappingLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { solarMappingLevel: nextVal } });
  }, [dispatch]);

  const setBattleShipUpgradeLevel = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(battleShipUpgradeLevelRef.current) : val;
    battleShipUpgradeLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { battleShipUpgradeLevel: nextVal } });
  }, [dispatch]);

  const setWarCoreLevelDirect = useCallback((val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(warCoreLevelRef.current) : val;
    warCoreLevelRef.current = nextVal;
    dispatch({ type: 'SET_PROGRESSION_DATA', payload: { warCoreLevel: nextVal } });
  }, [dispatch]);


  const setFoundBattle = useCallback((battle: Battle | null) => {
    if (battle) dispatch({ type: 'FIND_BATTLE', payload: { battle } });
    else dispatch({ type: 'DISMISS_FOUND_BATTLE' });
  }, [dispatch]);

  const setUnderAttackBattle = useCallback((battle: Battle | null) => {
    dispatch({ type: 'SET_UNDER_ATTACK_BATTLE', payload: { battle } });
    underAttackBattleRef.current = battle;
  }, [dispatch]);

  const setVoidBattleShipStats = useCallback((val: CombatState['voidBattleShipStats'] | ((prev: CombatState['voidBattleShipStats']) => CombatState['voidBattleShipStats'])) => {
    const nextVal = typeof val === 'function' ? val(voidBattleShipStats) : val;
    dispatch({ type: 'SET_VOID_BATTLE_SHIP_STATS', payload: { stats: nextVal } });
  }, [voidBattleShipStats, dispatch]);

  const setVoidPOIsInspiration = useCallback((val: CombatState['voidPOIsInspiration'] | ((prev: CombatState['voidPOIsInspiration']) => CombatState['voidPOIsInspiration'])) => {
    const nextVal = typeof val === 'function' ? val(voidPOIsInspiration) : val;
    dispatch({ type: 'SET_VOID_POI_INSPIRATION', payload: { inspiration: nextVal } });
  }, [voidPOIsInspiration, dispatch]);

  const [voidPOIQCDonations, setVoidPOIQCDonations] = useState<{ [poiId: string]: number }>({});
  const [voidDonationModes, setVoidDonationModes] = useState<{ [poiId: string]: '1x' | '10x' | 'max' }>({});

  const setIsVoidWarActive = useCallback((val: boolean) => dispatch({ type: 'TOGGLE_VOID_WAR', payload: { active: val } }), [dispatch]);
  const setVoidWarProgress = useCallback((val: CombatState['voidWarProgress'] | ((prev: CombatState['voidWarProgress']) => CombatState['voidWarProgress'])) => {
    const nextVal = typeof val === 'function' ? val(voidWarProgress) : val;
    dispatch({ type: 'SET_COMBAT_DATA', payload: { voidWarProgress: nextVal } });
  }, [voidWarProgress, dispatch]);

  const setVoidResources = useCallback((val: CombatState['voidResources'] | ((prev: CombatState['voidResources']) => CombatState['voidResources'])) => {
    const nextVal = typeof val === 'function' ? val(voidResources) : val;
    dispatch({ type: 'SET_COMBAT_DATA', payload: { voidResources: nextVal } });
  }, [voidResources, dispatch]);

  const setVoidCompactedResources = useCallback((val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const nextVal = typeof val === 'function' ? val(voidCompactedResources) : val;
    dispatch({ type: 'SET_COMBAT_DATA', payload: { voidCompactedResources: nextVal } });
  }, [voidCompactedResources, dispatch]);

  const setUnlockedExtractionPoints = useCallback((val: string[] | ((prev: string[]) => string[])) => {
    const nextVal = typeof val === 'function' ? val(unlockedExtractionPoints) : val;
    dispatch({ type: 'SET_UNLOCKED_EXTRACTION_POINTS', payload: { pointIds: nextVal } });
  }, [unlockedExtractionPoints, dispatch]);

  
  // Robot Event States
  const [hasWonEliminateEnemiesRoute3, setHasWonEliminateEnemiesRoute3] = useState(false);
  const [isRepairingRobot, setIsRepairingRobot] = useState(false);

  const setResearchingExtractionPoint = useCallback((val: any) => {
    dispatch({ type: 'SET_RESEARCHING_EXTRACTION_POINT', payload: { research: val } });
  }, [dispatch]);


  const [extractionCycleProgress, setExtractionCycleProgress] = useState<{ [id: string]: number }>({});
  

  
  const [isColoniesUnlocked, setIsColoniesUnlocked] = useState(true);
  
  const totalHumanPopulation = useMemo(() => {
    const colonyPop = (colonies || []).reduce((sum, c) => sum + (c.population || 0), 0);
    return earthPopulation + colonyPop;
  }, [earthPopulation, colonies]);

  // Persistent refs for Earth simulation to avoid resets on re-renders

  const generateEarthEvent = useCallback(() => {
    const totalDays = Math.floor(gameTimeSecondsRef.current * 0.75);
    const year = Math.floor(totalDays / 360);
    
    // Fixed Comic Events
    const fixedEvents = [
      { 
        year: 520, 
        name: { pt: 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â® Profecia do PÃƒÂ£o', en: 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â® Bread Prophecy' }, 
        desc: { 
          pt: '"Houve uma profecia dizendo que o mundo acabaria em 1524... SerÃƒÂ¡ que agora vai? Tem gente jÃƒÂ¡ vendendo tudo e comprando pÃƒÂ£o. Humanidade em leve desespero!"', 
          en: '"There was a prophecy saying the world would end in 1524... Could it be now? People are already selling everything and buying bread. Humanity in mild despair!"' 
        },
        isFixed: true,
        specialColor: 'text-purple-400',
        specialBg: 'bg-purple-500/10',
        specialBorder: 'border-purple-500/30'
      },
      { 
        year: 662, 
        name: { pt: 'ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â O NÃƒÂºmero da Besta?', en: 'ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â The Beast Number?' }, 
        desc: { 
          pt: '"Corre o boato de que o ano 1666 será o fim de tudo! Mas por quê 666? Alguém claramente levou esse nÃºmero a sério demais... clima de pÃ¢nico e teorias estranhas no ar."', 
          en: '"Rumor has it that the year 1666 will be the end of it all! But why 666? Someone clearly took that number too seriously... panic and strange theories in the air."' 
        },
        isFixed: true,
        specialColor: 'text-red-500',
        specialBg: 'bg-red-500/10',
        specialBorder: 'border-red-500/30'
      },
      { 
        year: 840, 
        name: { pt: 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â® O Sinal nas Nuvens', en: 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â® Cloud Signal' }, 
        desc: { 
          pt: '"Um grupo garante que em 1844 tudo acaba! Já tem gente olhando pro céu esperando algum sinal... até agora só nuvem mesmo."', 
          en: '"A group guarantees that in 1844 everything ends! People are already looking at the sky waiting for some sign... so far just clouds."' 
        },
        isFixed: true,
        specialColor: 'text-amber-400',
        specialBg: 'bg-amber-500/10',
        specialBorder: 'border-amber-500/30'
      },
      { 
        year: 906, 
        name: { pt: 'ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â MÃƒÂ¡scaras Anti-Cometa', en: 'ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Anti-Comet Masks' }, 
        desc: { 
          pt: "Descobriram que um cometa vai passar em 1910! Tem gente achando que é o fim... outros estão vendendo 'máscaras anti-cometa'. Negócio lucrativo!", 
          en: "They discovered that a comet will pass in 1910! Some people think it's the end... others are selling 'anti-comet masks'. Lucrative business!" 
        },
        isFixed: true,
        specialColor: 'text-red-400',
        specialBg: 'bg-red-400/10',
        specialBorder: 'border-red-400/30'
      },
      { 
        year: 995, 
        name: { pt: 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â® Bug do MilÃƒÂªnio Antecipado', en: 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â® Early Millennium Bug' }, 
        desc: { 
          pt: '"Segundo um tal de profeta antigo, 1999 será o fim do mundo! Enquanto isso, a humanidade segue normalmente... alguns já desistiram de fazer planos de longo prazo Ã°Å¸Ëœâ€¦"', 
          en: '"According to an old prophet, 1999 will be the end of the world! Meanwhile, humanity goes on normally... some have already given up on making long-term plans Ã°Å¸Ëœâ€¦"' 
        },
        isFixed: true,
        specialColor: 'text-purple-400',
        specialBg: 'bg-purple-400/10',
        specialBorder: 'border-purple-400/30'
      },
      { 
        year: 1008, 
        name: { pt: 'ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â CalendÃƒÂ¡rio Maia?', en: 'ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Mayan Calendar?' }, 
        desc: { 
          pt: '"Boatos dizem que 2012 será o fim de tudo! Uns estão preocupados... outros só querem saber se ainda dá tempo de terminar aquela série."', 
          en: '"Rumors say that 2012 will be the end of it all! Some are worried... others just want to know if there\'s still time to finish that series."' 
        },
        isFixed: true,
        specialColor: 'text-amber-500',
        specialBg: 'bg-amber-500/10',
        specialBorder: 'border-amber-500/30'
      }
    ];

    // Check for fixed event first
    const currentFixed = fixedEvents.find(fe => year >= fe.year && !earthEventsRef.current.some(ee => ee.isFixed && ee.year === fe.year));

    let eventSource;
    let isFixed = false;
    let specialStyles = {};

    if (currentFixed) {
      eventSource = currentFixed;
      isFixed = true;
      specialStyles = {
        color: currentFixed.specialColor,
        bg: currentFixed.specialBg,
        border: currentFixed.specialBorder
      };
    } else {
      // Define some types of events
      const eventPoolSource = [
        { name: { pt: 'Grande Floresta Descoberta', en: 'Great Forest Discovered' }, desc: { pt: 'Uma vasta ÃƒÂ¡rea verde se expandiu, trazendo novos habitats e biodiversidade.', en: 'A vast green area has expanded, bringing new habitats and biodiversity.' }, impactType: 'biodiversity', impact: 5 },
        { name: { pt: 'Grande Floresta Descoberta', en: 'Great Forest Discovered' }, desc: { pt: 'Uma vasta área verde se expandiu, trazendo novos habitats e biodiversidade.', en: 'A vast green area has expanded, bringing new habitats and biodiversity.' }, impactType: 'biodiversity', impact: 5 },
        { name: { pt: 'Avanço Agrícola Primordial', en: 'Primordial Agricultural Breakthrough' }, desc: { pt: 'Novas técnicas de colheita natural aumentam a oferta de subsistência.', en: 'New natural harvesting techniques increase subsistence supply.' }, impactType: 'health', impact: 4 },
        { name: { pt: 'Clima Estável Estelar', en: 'Stellar Stable Climate' }, desc: { pt: 'Um período de harmonia climática favorece a saÃºde e o bem-estar.', en: 'A period of climatic harmony favors health and well-being.' }, impactType: 'happiness', impact: 5 },
        { name: { pt: 'A Primeira Grande Migração', en: 'The First Great Migration' }, desc: { pt: 'A população se espalha por novos continentes férteis e seguros.', en: 'The population spreads across new fertile and safe continents.' }, impactType: 'security', impact: 3 },
        { name: { pt: 'Descoberta de Fontes Termais', en: 'Discovery of Hot Springs' }, desc: { pt: 'Fontes de energia natural melhoram a saÃºde e longevidade básica.', en: 'Natural energy sources improve basic health and longevity.' }, impactType: 'health', impact: 6 },
        { name: { pt: 'O Despertar da Fauna', en: 'The Awakening of Fauna' }, desc: { pt: 'Novas espécies animais surgem dos santuários ecológicos.', en: 'New animal species emerge from ecological sanctuaries.' }, impactType: 'biodiversity', impact: 8 },
        { name: { pt: 'Simbiose BotÃ¢nica', en: 'Botanical Symbiosis' }, desc: { pt: 'Plantas alienígenas adaptadas aceleram o oxigênio e a vida vegetal.', en: 'Adapted alien plants accelerate oxygen and plant life.' }, impactType: 'qualityOfLife', impact: 5 },
        { name: { pt: 'Era da AbundÃ¢ncia', en: 'Age of Abundance' }, desc: { pt: 'Recursos naturais brotam em todas as zonas de colonização.', en: 'Natural resources sprout in all colonization zones.' }, impactType: 'happiness', impact: 7 },
        { name: { pt: 'Sistema de Patrulha Iniciado', en: 'Patrol System Initiated' }, desc: { pt: 'Drones de vigilÃ¢ncia garantem a paz nas novas colÃ´nias.', en: 'Surveillance drones ensure peace in the new colonies.' }, impactType: 'security', impact: 10 },
        { name: { pt: 'Festival da Terra', en: 'Earth Festival' }, desc: { pt: 'Uma celebração global aumenta o moral e a união da população.', en: 'A global celebration boosts morale and population unity.' }, impactType: 'happiness', impact: 12 },
        { name: { pt: 'Otimização de Sanitarismo', en: 'Sanitation Optimization' }, desc: { pt: 'Novos sistemas de purificação de água reduzem doenças.', en: 'New water purification systems reduce diseases.' }, impactType: 'health', impact: 8 },
      ];
      eventSource = eventPoolSource[Math.floor(Math.random() * eventPoolSource.length)];
    }
    
    const source = eventSource as any;
    const newEvent = {
        id: `ev-${Date.now()}`,
        year: isFixed ? source.year : year,
        name: language === 'pt' ? source.name.pt : source.name.en,
        description: language === 'pt' ? source.desc.pt : source.desc.en,
        type: isFixed ? 'fixed' : source.impactType,
        isFixed,
        specialStyles,
        timestamp: Date.now()
    };

    setEarthEvents(prev => [newEvent, ...prev].slice(0, 50));
    dispatch({ type: 'UPDATE_EARTH_STATE', payload: { events: [newEvent, ...earthEventsRef.current].slice(0, 50) } });
    
    // Apply impacts if not fixed (or add minor boost if fixed)
    if (!isFixed) {
      const impact = source.impact;
      const updates: Partial<EarthState> = {};
      switch(source.impactType) {
        case 'biodiversity': updates.biodiversity = Math.min(100, Math.max(0, earthBiodiversityRef.current + impact)); break;
        case 'health': updates.health = Math.min(100, Math.max(0, earthHealthRef.current + impact)); break;
        case 'happiness': updates.happiness = Math.min(100, Math.max(0, earthHappinessRef.current + impact)); break;
        case 'security': updates.security = Math.min(100, Math.max(0, earthSecurityRef.current + impact)); break;
        case 'qualityOfLife': updates.qualityOfLife = Math.min(100, Math.max(0, earthQualityOfLifeRef.current + impact)); break;
      }
      dispatch({ type: 'UPDATE_EARTH_STATE', payload: updates });
    } else {
      // Fixed events give a small global boost
      dispatch({ type: 'UPDATE_EARTH_STATE', payload: { happiness: Math.min(100, earthHappinessRef.current + 2) } });
    }
  }, [language]);

  // Global Game Time & Earth Simulation Loop (Route 4)
  useEffect(() => {
    if (!isLoaded) return;

    const BASE_YEAR_SECONDS = 1200; // 20 minutes = 1200 seconds (Reduced speed by 60%)
    
    const interval = setInterval(() => {
      // 0. Time Acceleration Factor
      // If player is playing a mini-game, time passes 2x faster
      const isPlaying = isArcadeUnlocked && !!activeMiniGameIdRef.current;
      const isColoniesOpen = isColoniesUnlocked && isColoniesOpenRef.current;
      const timeFactor = (isPlaying || isColoniesOpen) ? 2 : 1;

      // 1. Time Progression (Global - Only in Route 4)
      if (routeTierRef.current === 'Earth') {
        setGameTimeSeconds(prev => prev + (timeFactor * 1)); 
      }

      // 2. Earth Specific Logic (Route 4)
      if (routeTierRef.current === 'Earth') {
        const nextYear = gameTimeSecondsRef.current / BASE_YEAR_SECONDS;
        // Calculate season (0-3)
        const seasonProgress = (nextYear % 1) * 4;
        
        const updates: Partial<EarthState> = {};
        updates.season = Math.floor(seasonProgress);
      
        // Population Growth (UI Update only)
        const currentPop = earthPopulationRef.current;
        const currentCouples = Math.floor(currentPop * 0.8 / 2);
        updates.couples = currentCouples;

        // Minor male/female ratio variation
        const ratioVariation = (Math.random() - 0.5) * 0.0001 * timeFactor;
        updates.maleRatio = Math.max(0.45, Math.min(0.55, earthMaleRatioRef.current + ratioVariation));

        // 3. Indicators Evolution (Natural growth)
        const yearFraction = timeFactor / BASE_YEAR_SECONDS;
        const boostPerYear = earthProjectBoostCountRef.current * 0.05; // 0.05% boost per year per 10k allocation
        const boostFraction = (boostPerYear * yearFraction) / 100;
        
        updates.biodiversity = Math.min(100, earthBiodiversityRef.current + (0.01 * (1 - (earthBiodiversityRef.current / 100)) * yearFraction + boostFraction));
        
        const healthBonus = isPlaying ? (0.01 * yearFraction) : 0;
        updates.health = Math.min(100, earthHealthRef.current + (0.005 * (1 - (earthHealthRef.current / 100)) * yearFraction + healthBonus + boostFraction));

        const happyBonus = isPlaying ? (0.02 * yearFraction) : 0;
        updates.happiness = Math.min(100, earthHappinessRef.current + (0.005 * (1 - (earthHappinessRef.current / 100)) * yearFraction + happyBonus + boostFraction));

        const secBonus = isPlaying ? (0.01 * yearFraction) : 0;
        updates.security = Math.min(100, earthSecurityRef.current + (0.005 * (1 - (earthSecurityRef.current / 100)) * yearFraction + secBonus + boostFraction));

        const qolBonus = isPlaying ? (0.015 * yearFraction) : 0;
        updates.qualityOfLife = Math.min(100, earthQualityOfLifeRef.current + (0.008 * (1 - (earthQualityOfLifeRef.current / 100)) * yearFraction + qolBonus + boostFraction));

        dispatch({ type: 'UPDATE_EARTH_STATE', payload: updates });

        // 4. Random Events (Route 4 Event frequency increased)
        earthEventTimerRef.current -= timeFactor;
        if (earthEventTimerRef.current <= 0) {
          generateEarthEvent();
          earthEventTimerRef.current = Math.random() * 40 + 40; // Increased frequency (was 120-240)
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, isArcadeUnlocked, isColoniesUnlocked, generateEarthEvent]);

  // Year Change Events (Population Growth & Events)
  useEffect(() => {
    if (!isLoaded || gameTime.years === 0 || lastProcessedYearRef.current === gameTime.years) return;
    lastProcessedYearRef.current = gameTime.years;
    
    // 1. Calculate Growth Rate based on current year
    // User asked for slower growth targeting 1M in 20 years from 500k.
    // Factor 2 over 20 years = ~3.5% annual growth.
    let minRate = 0.03;
    let maxRate = 0.04;
    
    if (gameTime.years > 15) {
      minRate = 0.025; // Slow down slightly
      maxRate = 0.035;
    } else if (gameTime.years > 10) {
      minRate = 0.032;
      maxRate = 0.038;
    }
    
    const rate = minRate + Math.random() * (maxRate - minRate);
    const colonyPop = (colonies || []).reduce((sum, c) => sum + (c.population || 0), 0);
    const totalPop = earthPopulationRef.current + colonyPop;
    const baseGrowth = totalPop * rate;
    
    // 2. Random Demographic Events
    let eventBonus = 0;
    if (Math.random() < 0.15) { // 15% chance of discovery
      eventBonus += 250;
      addLog(language === 'pt' ? 'Novas tribos foram descobertas e querem se filiar. +250 de população.' : 'New tribes were discovered and want to join. +250 population.', 'success');
    }
    
    // Migration Logic (above 10k/15k)
    let migrationPenalty = 0;
    if (totalPop > 10000 && Math.random() < 0.2) {
      migrationPenalty = 1500;
      addLog(language === 'pt' ? 'Várias pessoas resolveram se mudar para outros locais. -1500 pessoas.' : 'Several people decided to move elsewhere. -1500 people.', 'warning');
    }

    // 3. Update Population (Must be Integer, Round UP)
    setEarthPopulation(prev => Math.ceil(prev + baseGrowth + eventBonus - migrationPenalty));
    
    // Log the annual summary
    if (baseGrowth > 0) {
      addLog(`${language === 'pt' ? 'Ano' : 'Year'} ${gameTime.years}: +${Math.ceil(baseGrowth)} ${language === 'pt' ? 'novos habitantes' : 'new inhabitants'} (${(rate * 100).toFixed(1)}%)`, 'info');
    }
    
  }, [gameTime.years, isLoaded, language, colonies]);

  const [selectedUpgradePoint, setSelectedUpgradePoint] = useState<number | null>(null);

  const allTechUnlocked = (unlockedTechLevels['Interstellar'] || 0) >= 9;
  const isBattleTab = activeTab === 'aircraft' && aircraftSubTab === 'battle';

  const [, setTick] = useState(0);

  useEffect(() => {
    if (lastScanTime > 0) {
      const timer = setInterval(() => {
        setTick(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastScanTime]);



  // Void War Trigger Sequence
  useEffect(() => {
    const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + (b as number), 0) / 5;
    const isComplete = totalProgress >= 100;

    if (routeTier === 'Void' && isComplete && !isVoidWarActive && !voidWarRobotSpeaking && !voidWarAlertActive && !hasTriggeredVoidWarRef.current) {
      hasTriggeredVoidWarRef.current = true;
      setVoidWarRobotSpeaking(true);
      setLoreLineIndex(0); // Reset lore index for the new sequence
    }
  }, [earthReconstructionProgress, isVoidWarActive, voidWarRobotSpeaking, voidWarAlertActive, routeTier, playSfx]);




  const { hasSeenRoute2UnlockMessage } = useSystem();

  useEffect(() => {
    // Load arcade scores from localStorage initially
    const scores: { [key: string]: number } = {};
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith('_high_score')) {
          const gameId = key.replace(/_/g, '-').replace('-high-score', '');
          const saved = localStorage.getItem(key);
          if (saved) scores[gameId] = parseInt(saved);
        }
      }
    }
    setArcadeScores(scores);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'CLOSE_MINI_GAME') {
        const wasMiniGameActive = !!activeMiniGameIdRef.current;
        setActiveMiniGameId(null);
        
        // Boost Earth stats on game play/finish (Route 4 only)
        if (routeTierRef.current === 'Earth' && wasMiniGameActive) {
          const arcadeBoost = 0.15; // Immediate small boost
          setEarthHealth(prev => Math.min(100, prev + arcadeBoost * 0.8));
          setEarthHappiness(prev => Math.min(100, prev + arcadeBoost * 1.5));
          setEarthSecurity(prev => Math.min(100, prev + arcadeBoost * 0.5));
          setEarthQualityOfLife(prev => Math.min(100, prev + arcadeBoost));
        }
      }

      if (event.data.score !== undefined && event.data.gameId) {
        const gameId = event.data.gameId;
        const score = event.data.score;
        setArcadeScores(prev => {
          // Check if this game is time-based (where lower is better)
          // For now, all current games are "higher is better" either by points or remaining time
          if (!prev[gameId] || score > prev[gameId]) {
            const key = `${gameId.replace(/-/g, '_')}_high_score`;
            localStorage.setItem(key, String(score));
            return { ...prev, [gameId]: score };
          }
          return prev;
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  const updateHistoryStats = useCallback((
    type: 'acquired' | 'spent' | 'mission_complete' | 'battle_win' | 'manual_mining' | 'auto_mining' | 'manual_extraction' | 'auto_extraction' | 'perfect_delivery' | 'random_battle_found', 
    amount: number, 
    tier: string,
    source?: 'delivery' | 'mining' | 'battle' | 'mission' | 'extraction' | 'tutorial'
  ) => {
    const current = historyStatsRef.current[tier];
    if (!current) return;
    
    const next = { ...current };
    
    if (type === 'acquired') {
      next.qcTotalAcquired += amount;
      if (source === 'delivery') next.qcFromDeliveries += amount;
      if (source === 'mining') next.qcFromMining += amount;
      if (source === 'battle') next.qcFromBattles += amount;
      if (source === 'mission') next.qcFromMissions += amount;
      if (source === 'extraction') next.qcFromExtraction += amount;
      if (source === 'tutorial') next.qcFromTutorial += amount;
    } else if (type === 'spent') {
      next.qcSpent += amount;
    } else if (type === 'mission_complete') {
      next.missionsCompleted += 1;
    } else if (type === 'battle_win') {
      next.battlesWon += 1;
    } else if (type === 'manual_mining') {
      next.manualMiningPacksSold = (next.manualMiningPacksSold || 0) + amount;
    } else if (type === 'auto_mining') {
      next.autoMiningPacksSold = (next.autoMiningPacksSold || 0) + amount;
    } else if (type === 'manual_extraction') {
      next.manualExtractionPacksSold = (next.manualExtractionPacksSold || 0) + amount;
    } else if (type === 'auto_extraction') {
      next.autoExtractionPacksSold = (next.autoExtractionPacksSold || 0) + amount;
    } else if (type === 'perfect_delivery') {
      next.perfectDeliveries = (next.perfectDeliveries || 0) + amount;
    } else if (type === 'random_battle_found') {
      next.randomBattlesFound = (next.randomBattlesFound || 0) + amount;
    }
    
    historyStatsRef.current = { ...historyStatsRef.current, [tier]: next };
    pendingHistoryRef.current = true;
  }, []);

  // Bug #2: Throttled History Flush (3s)
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      if (pendingHistoryRef.current) {
        dispatch({ type: 'SET_HISTORY_STATS', payload: { stats: historyStatsRef.current } });
        pendingHistoryRef.current = false;
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoaded, dispatch]);

  const handleSkillUpgrade = (cost: number, setter: (val: number) => void, level: number, name: string) => {
    if (qc >= cost) {
      setQc(prev => prev - cost);
      setter(level + 1);
      playSfx('level_up');
      addLog(`${t('upgraded')} ${name} ${t('toLevel')} ${level + 1}`, 'success');
      
      // Background Log
      GameStorage.log('SKILL_UPGRADE', { skill: name, newLevel: level + 1, cost }, playerName);
      
      updateHistoryStats('spent', cost, routeTier);
      performSave();
    }
  };



  // Log Game Start
  useEffect(() => {
    if (isLoaded) {
      GameStorage.log('GAME_START', { 
        qc: qcRef.current, 
        tier: routeTierRef.current,
        platform: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      }, playerName);
    }
  }, [isLoaded]);


  // Centralized Save Function
  const performSave = useCallback(async () => {
    if (isSpeedRun || !isLoaded || isResettingRef.current) return;
    
    const saveData = {
      qc: qcRef.current,
      unlockedRouteIds: unlockedRouteIdsRef.current,
      ownedShips: ownedShipsRef.current,
      techLevels: techLevelsRef.current,
      autoTravelSlots: autoTravelSlotsRef.current,
      playerName,
      miningRobots: miningRobotsRef.current,
      miningRobotLevels: miningRobotLevelsRef.current,
      oresCollected: oresCollectedRef.current,
      autoSellByOre: autoSellByOreRef.current,
      autoSellUnlockedByOre: autoSellUnlockedByOreRef.current,
      unlockedTechLevels: unlockedTechLevelsRef.current,
      autoTravelActive: autoTravelActiveRef.current,
      autoTravelDesired: autoTravelDesiredRef.current,
      seenTutorials,
      aetherion: aetherionRef.current,
      aetherionTubes: aetherionTubesRef.current,
      miningWaste: miningWasteRef.current,
      solarEnergy: solarEnergyRef.current,
      routeTier: routeTierRef.current,
      totalDeliveries: totalDeliveriesRef.current,
      deliveriesByLocation: deliveriesByLocationRef.current,
      historyStats: historyStatsRef.current,
      missions: missionsRef.current,
      missionMythicBonus: missionMythicBonusRef.current,
      missionAlienBonus: missionAlienBonusRef.current,
      missionLegendaryBonus: missionLegendaryBonusRef.current,
      missionRewardLevel: missionRewardLevelRef.current,
      skillLendariaLevel: skillLendariaLevelRef.current,
      skillMiticaLevel: skillMiticaLevelRef.current,
      skillAlienLevel: skillAlienLevelRef.current,
      skillTempoDinheiroLevel: skillTempoDinheiroLevelRef.current,
      skillRobosOlimpicosLevel: skillRobosOlimpicosLevelRef.current,
      autoClaimMissions,
      radarUnlocked: radarUnlocked,
      completedInitialMissions: completedInitialMissionsRef.current,
      miningCompressionLevels: miningCompressionLevelsRef.current,
      shipXP: shipXPRef.current,
      shipLevel: shipLevelRef.current,
      extractionTechLevel: extractionTechLevelRef.current,
      solarMappingLevel: solarMappingLevelRef.current,
      doubleRouteLevel: doubleRouteLevelRef.current,
      doomPLevel: doomPLevelRef.current,
      privatePoliceLevel: privatePoliceLevelRef.current,
      captureLevel: captureLevelRef.current,
      battleLevel: battleLevelRef.current,
      radarLevel: radarLevelRef.current,
      isRetributionActive: isRetributionActiveRef.current,
      isFatigueActive: isFatigueActiveRef.current,
      unlockedExtractionPoints: unlockedExtractionPointsRef.current,
      extractionPacks: extractionPacksRef.current,
      extractionRobotLevels: extractionRobotLevelsRef.current,
      extractionProductionLevels: extractionProductionLevelsRef.current,
      extractionCompressionLevels: extractionCompressionLevelsRef.current,
      extractionAutoSell: extractionAutoSellRef.current,
      extractionAutoSellUnlocked: extractionAutoSellUnlockedRef.current,
      totalExtractionProfit: totalExtractionProfitRef.current,
      lastScanTime: lastScanTimeRef.current,
      warCoreLevel: warCoreLevelRef.current,
      fleetPower: fleetPowerRef.current,
      earthReconstructionProgress: earthReconstructionProgressRef.current,
      isVoidWarActive: isVoidWarActive,
      voidWarProgress: voidWarProgress,
      voidResources: voidResourcesRef.current,
      voidCompactedResources: voidCompactedResources,
      voidDonationModes: voidDonationModes,
      voidAircraftMissions: voidAircraftMissionsRef.current,
      voidAircraftUpgrades: voidAircraftUpgradesRef.current,
      voidAircraftAutoToggles: voidAircraftAutoTogglesRef.current,
      voidBattleShipStats: voidBattleShipStatsRef.current,
      voidPOIsInspiration: voidPOIsInspirationRef.current,
      voidPOIQCDonations: voidPOIQCDonationsRef.current,
      route4Unlocked: route4Unlocked,
      unlockedAchievements,
      achievementProgress,
      hasWonEliminateEnemiesRoute3: hasWonEliminateEnemiesRoute3Ref.current,
      robotRepairProgress: robotRepairProgressRef.current,
      isRobotRepaired: isRobotRepairedRef.current,
      battleShipUpgradeLevel: battleShipUpgradeLevelRef.current,
      gameTimeSeconds: gameTimeSecondsRef.current,
      earthPopulation: earthPopulationRef.current,
      earthMaleRatio: earthMaleRatioRef.current,
      earthBiodiversity: earthBiodiversityRef.current,
      earthEvents: earthEventsRef.current,
      unlockedVoidAircraft: unlockedVoidAircraftRef.current,
      voidAircraftConstruction: voidAircraftConstructionRef.current,
      voidAutoShipmentUnlocked: voidAutoShipmentUnlockedRef.current,
      voidAutoShipmentActive: voidAutoShipmentActiveRef.current,
    };

    const modularSave = SaveManager.createSave(saveData);
    await GameStorage.save(modularSave, 'time_travel_save');
  }, [isSpeedRun, isLoaded, playerName, seenTutorials, autoClaimMissions, isVoidWarActive, voidWarProgress, voidCompactedResources, voidDonationModes, route4Unlocked, unlockedAchievements, achievementProgress]);

  const t = useCallback((key: string) => {
    try {
      // Special case for Route 4 mini games name in PT
      if (key === 'mini_games' && routeTier === 'Earth' && language === 'pt') {
        return 'Fliperamas';
      }
      
      const langData = (translations as any)[language] || translations.en;
      const val = langData[key] || (translations.en as any)[key] || key;
      const text = Array.isArray(val) ? val[0] : val;
      
      return typeof text === 'string' ? text : String(text);
    } catch (e) {
      console.warn(`Translation error for key: ${key}`, e);
      return key;
    }
  }, [language, routeTier]);

  // Earth Simulation Functions
  const addEarthYears = useCallback((years: number) => {
    setGameTimeSeconds(prev => prev + (years * 1200));
    addLog(`${language === 'pt' ? 'História avançou ' : 'History advanced '}${years}${language === 'pt' ? ' anos devido ao progresso monumental!' : ' years due to monumental progress!'}`, 'success');
  }, [language, addLog]);

  const handleBuildingComplete = useCallback((type: string, level: number) => {
    // Permanent boost when building levels up
    const unit = 0.3; // 0.3% boost
    
    if (type === 'forest') {
      setEarthHealth(prev => Math.min(100, prev + unit));
      setEarthBiodiversity(prev => Math.min(100, prev + unit * 1.5));
    } else if (type === 'factory') {
      setEarthQualityOfLife(prev => Math.min(100, prev + unit));
    } else if (type === 'school') {
      setEarthHappiness(prev => Math.min(100, prev + unit));
      setEarthQualityOfLife(prev => Math.min(100, prev + unit));
    } else if (type === 'culture') {
      setEarthHappiness(prev => Math.min(100, prev + unit * 1.5));
    } else if (type === 'defense') {
      setEarthSecurity(prev => Math.min(100, prev + unit * 1.5));
    } else if (type === 'restaurant') {
      setEarthQualityOfLife(prev => Math.min(100, prev + unit));
      setEarthHappiness(prev => Math.min(100, prev + unit * 0.5));
    }
  }, []);

  const getEconomicMultipliers = useCallback(() => {
    const isEasy = false;
    const isHard = false;
    let costMult = 1;
    let profitMult = 1;

    if (routeTierRef.current === 'Interstellar') {
      costMult = 5;
      profitMult = 5;
    }

    if (isEasy) {
      costMult *= 0.5;
      profitMult *= 1.5;
    }

    if (isHard) {
      profitMult *= 0.5;
    }

    return { cost: costMult, profit: profitMult };
  }, []);

  const getMissionUpgradeCost = useCallback((level: number, tier: string) => {
    if (tier === 'Solar') {
      const costs = [2500, 15000, 100000, 500000, 2500000, 10000000, 40000000, 150000000, 500000000, 2000000000];
      return costs[level] || 2000000000;
    } else {
      const costs = [1000000, 10000000, 20000000, 30000000, 40000000, 75000000, 150000000, 200000000, 500000000, 1000000000];
      return costs[level] || 1000000000;
    }
  }, []);

  const formatValue = useCallback((value: number) => {
    if (value === undefined || value === null) return '0';
    if (!formatNumbers) return Math.floor(value).toLocaleString();
    
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1000000000000) return sign + (absValue / 1000000000000).toFixed(1).replace(/\.0$/, '') + 'T';
    if (absValue >= 1000000000) return sign + (absValue / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (absValue >= 1000000) return sign + (absValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (absValue >= 1000) return sign + (absValue / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    
    return value.toString();
  }, [formatNumbers]);

  // Extraction Points Logic
  const extractionTimersRef = useRef<{ [id: string]: number }>({});
  useEffect(() => {
    if (routeTier !== 'Interstellar' || unlockedExtractionPoints.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newProgress: { [id: string]: number } = {};
      let hasChanged = false;
      const uniquePoints = Array.from(new Set(unlockedExtractionPoints));

      const next = { ...extractionPacksRef.current };
      let localHasChanged = false;

      uniquePoints.forEach(id => {
        const point = EXTRACTION_POINTS_MAP.get(id);
        if (point) {
          const robotLevel = extractionRobotLevelsRef.current[id] || 0;
          const reductionFactor = Math.max(0.5, 1 - (robotLevel * 0.1));
          const cycleTime = point.cycleTime * reductionFactor;

          if (!extractionTimersRef.current[id] || isNaN(extractionTimersRef.current[id])) {
            extractionTimersRef.current[id] = now;
          }

          const lastTime = extractionTimersRef.current[id];
          const elapsed = now - lastTime;
          
          // Calculate progress for UI
          newProgress[id] = Math.min(100, (elapsed / cycleTime) * 100);

          if (elapsed >= cycleTime) {
            const prodLevel = extractionProductionLevelsRef.current[id] || 0;
            const productionPerCycle = EXTRACTION_PRODUCTION_VALUES[prodLevel] || 10;
            
            const currentPacks = next[id] || 0;
            const maxStock = 2000;
            
            if (currentPacks < maxStock) {
              const cycles = Math.floor(elapsed / cycleTime);
              const addedPacks = productionPerCycle * cycles;
              next[id] = Math.min(maxStock, currentPacks + addedPacks);
              extractionTimersRef.current[id] = now;
              newProgress[id] = 0;
              localHasChanged = true;
              hasChanged = true;
            } else {
              // Stock is full, keep progress at 100% and timer ready
              newProgress[id] = 100;
              extractionTimersRef.current[id] = now - cycleTime;
            }
          }
        }
      });
      
      if (localHasChanged) {
        extractionPacksRef.current = next;
      }

      // Update progress outside of the packs setter to avoid side-effect issues
      extractionCycleProgressRef.current = newProgress;
    }, 100);

    const throttleInterval = setInterval(() => {
      setExtractionCycleProgress(extractionCycleProgressRef.current);
      dispatch({ type: 'SET_EXTRACTION_PROGRESS', payload: { progress: extractionCycleProgressRef.current } });
      dispatch({ type: 'SET_EXTRACTION_DATA', payload: { packs: extractionPacksRef.current } });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(throttleInterval);
    };
  }, [unlockedExtractionPoints, routeTier]);

  // Automatic Sales Logic (RobÃƒÂ´s de Entrega)
  useEffect(() => {
    const interval = setInterval(() => {
      if (routeTierRef.current !== 'Interstellar') return;
      
      const unlockedPoints = unlockedExtractionPointsRef.current;
      if (unlockedPoints.length === 0) return;

      let totalQcGained = 0;
      let totalPacksSold = 0;
      let hasSold = false;
      const next = { ...extractionPacksRef.current };

      // Check each unlocked point for auto-sell
      unlockedPoints.forEach(id => {
        const point = EXTRACTION_POINTS_MAP.get(id);
        if (!point) return;

        const currentPacks = next[id] || 0;
        
        // Sell if auto-sell is active and 1000 or more packs accumulated
        if (extractionAutoSellRef.current[id] && currentPacks >= 1000) {
          let saleValue = point.valuePerPack * currentPacks;
          
          // Apply Level 40 reward: 10x mining value
          if (battleLevelRef.current >= 40 && routeTier === 'Interstellar') {
            saleValue *= 10;
          }

          // Apply Compactação multiplier (2x per level, max 20x at level 10)
          const compressionLevel = extractionCompressionLevelsRef.current[id] || 0;
          if (compressionLevel > 0) {
            const multiplier = compressionLevel * 2;
            saleValue *= multiplier;
          }

          totalQcGained += saleValue;
          totalPacksSold += currentPacks;
          next[id] = 0;
          hasSold = true;
        }
      });

      // Side effects outside of state setter
      if (hasSold) {
        extractionPacksRef.current = next;
        dispatch({ type: 'SET_EXTRACTION_DATA', payload: { packs: next } });
        
        dispatch({ type: 'EARN_QC', payload: { amount: totalQcGained, source: 'extraction' } });
        setTotalExtractionProfit(prev => prev + totalQcGained);
        
        // Update history stats
        dispatch({ type: 'UPDATE_HISTORY', payload: { tier: 'Interstellar', field: 'qcFromExtraction', amount: totalQcGained } });
        dispatch({ type: 'UPDATE_HISTORY', payload: { tier: 'Interstellar', field: 'qcTotalAcquired', amount: totalQcGained } });
        dispatch({ type: 'UPDATE_HISTORY', payload: { tier: 'Interstellar', field: 'autoExtractionPacksSold', amount: totalPacksSold } });

        playSfx('success');
      }
    }, 500); // Check every 500ms for more responsive automatic sales

    return () => clearInterval(interval);
  }, [setQc, playSfx, routeTier]);

  useEffect(() => {
    if (!researchingExtractionPoint) return;

    const timer = setInterval(() => {
      if (Date.now() >= researchingExtractionPoint.endTime) {
        setUnlockedExtractionPoints(prev => prev.includes(researchingExtractionPoint.id) ? prev : [...prev, researchingExtractionPoint.id]);
        setResearchingExtractionPoint(null);
        playSfx('tech_success');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [researchingExtractionPoint, playSfx]);

  const addXP = useCallback((amount: number) => {
    const maxLevel = routeTier === 'Solar' ? 10 : 20;
    if (shipLevelRef.current >= maxLevel) return;
    setShipXP(prev => {
      let newXP = prev + amount;
      let newLevel = shipLevelRef.current;
      const xpToNext = newLevel * 500;
      if (newLevel < maxLevel && newXP >= xpToNext) {
        newXP -= xpToNext;
        newLevel++;
        addLog(`${t('combatLevelIncreased')} ${newLevel}!`, 'success');
        playSfx('level_up');
        setShipLevel(newLevel);
      }
      return newLevel >= maxLevel ? 0 : newXP;
    });
  }, [language, playSfx, addLog, routeTier]);








  const resolveBattleVictory = useCallback((battle: Battle) => {
    const multipliers = getEconomicMultipliers();
    
    // Calculate total win probability for bonus (ONLY FOR AUTO-SKIPPED BATTLES)
    const policeBonus = getPoliceBonus(privatePoliceLevelRef.current);
    const doomPBonus = getDoomPBonus(doomPLevelRef.current);
    const totalWinProb = (battle.winProbability || 50) + policeBonus + doomPBonus;
    
    let bonusMultiplier = 1;
    // According to user request, Doom Protocol only makes sense for automatic/skipped battles
    if (battle.isAutoSkipped && totalWinProb > 100) {
      bonusMultiplier = 1 + (totalWinProb - 100) / 100;
    }

    // Ship Level Bonuses (Route 1 & 2)
    let shipQcBonus = 1;
    let shipAetherionBonus = 1;
    if (routeTierRef.current !== 'Void') {
      if (shipLevelRef.current <= 10) {
        shipQcBonus = 1 + (shipLevelRef.current * 0.1);
        shipAetherionBonus = 1 + (shipLevelRef.current * 0.05);
      } else {
        // Level 10 gives 100% QC and 50% Aetherion
        // Each level above 10 gives 20% QC and 10% Aetherion
        shipQcBonus = 1 + 1.0 + ((shipLevelRef.current - 10) * 0.2);
        shipAetherionBonus = 1 + 0.5 + ((shipLevelRef.current - 10) * 0.1);
      }
    }

    const isRandomBattle = battle.deliveryId !== 'manual-battle';
    const baseMult = 1;
    const winMult = totalWinProb > 100 ? (totalWinProb - 100) / 100 : 0;
    const lvlMult = battleLevelRef.current >= 10 ? 1 : 0;
    const shipMult = shipLevelRef.current >= 10 ? 1 : (shipLevelRef.current * 0.1);
    const randomMult = (shipLevelRef.current >= 10 && isRandomBattle) ? 1 : 0;
    const encrenMult = (battleLevelRef.current >= 35 && routeTierRef.current === 'Interstellar') ? 1 : 0;
    
    const totalMult = baseMult + winMult + lvlMult + shipMult + randomMult + encrenMult;
    
    const captureMultipliers = [1, 2, 4, 8, 12, 16, 20, 25, 30, 40, 50];
    const captureMultiplier = routeTierRef.current === 'Interstellar' ? (captureMultipliers[captureLevelRef.current] || 1) : 1;
    
    let qcReward = Math.floor(battle.reward * totalMult * captureMultiplier); 
    const xpReward = (routeTierRef.current === 'Solar' ? shipLevelRef.current >= 10 : shipLevelRef.current >= 20) ? 0 : Math.floor((100 + (shipLevelRef.current * 50)) * bonusMultiplier);
    
    let baseAetherion = 40;
    if (routeTierRef.current !== 'Void') {
      baseAetherion = Math.floor(Math.random() * (125 - 75 + 1)) + 75;
    }

    if (battle.enemyType === 'Elite') baseAetherion *= 2;
    if (battle.enemyType === 'Boss') {
      baseAetherion *= 4;
      // Level 45 reward: +50% resources from Bosses
      if (battleLevelRef.current >= 45 && routeTierRef.current === 'Interstellar') {
        baseAetherion *= 1.5;
        qcReward = Math.floor(qcReward * 1.5);
      }
    }
    
    let aetherionReward = Math.floor(baseAetherion * bonusMultiplier * shipAetherionBonus);
    
    // Assign rewards directly to the battle object so callers see them
    battle.reward = qcReward;
    battle.xpReward = xpReward;
    battle.aetherionReward = aetherionReward;

    setQc(prev => {
      const next = prev + qcReward;
      qcRef.current = next;
      return next;
    });
    setAetherion(prev => {
      const next = Math.min(10000, prev + aetherionReward);
      aetherionRef.current = next;
      return next;
    });
    addXP(xpReward);
    updateHistoryStats('acquired', qcReward, routeTierRef.current, 'battle');
    updateHistoryStats('battle_win', 1, routeTierRef.current);

    const xpText = xpReward > 0 ? `, +${formatValue(xpReward)} XP` : '';
    const bonusText = bonusMultiplier > 1 ? ` (+${Math.round((bonusMultiplier - 1) * 100)}% BONUS)` : '';

    addLog(language === 'pt' 
      ? `VITÃ“RIA: Inimigo destruído! +${formatValue(qcReward)} QC${xpText}, +${formatValue(aetherionReward)} Aetherion${bonusText}` 
      : `VICTORY: Enemy destroyed! +${formatValue(qcReward)} QC${xpText}, +${formatValue(aetherionReward)} Aetherion${bonusText}`, 
      'success'
    );

    return { qcReward, xpReward, aetherionReward };
  }, [language, formatValue, addXP, updateHistoryStats, addLog, getEconomicMultipliers, updateAchievementProgress, t, performSave]);
  const resolveBattleDefeat = useCallback((battle: Battle) => {
    addLog(t('defeatShipDestroyed'), 'error');
  }, [language, addLog]);


  const playerAttack = useCallback((type: 'laser' | 'plasma' | 'special' | 'shield') => {
    if (!activeBattleRef.current || activeBattleRef.current.isVictory || activeBattleRef.current.isDefeat) return;
    const now = Date.now();
    const battle = { ...activeBattleRef.current };
    
    // Cooldowns (fixed)
    const cooldowns = {
      laser: 1000,
      plasma: 2000,
      special: 3000,
      shield: 3000
    };
    
    if (now - (battle.lastPlayerAttack[type] || 0) < cooldowns[type]) return;
    
    if (type === 'shield') {
      battle.shieldActive = true;
      battle.lastShieldTime = now;
      battle.lastPlayerAttack = { ...battle.lastPlayerAttack, [type]: now };
      playSfx('shield');
      
      const shieldDuration = 2000; // Fixed 2 seconds
      const shieldDurationSec = shieldDuration / 1000;

      addLog(`${t('shieldActivated')} ${shieldDurationSec}s!`, 'info');
      setActiveBattle(battle);
      return;
    }
    
    // Damage - Exclusively based on battleLevel
    const baseDamage = 10 + (battleLevelRef.current * 10);
    let damage = 0;
    if (type === 'laser') damage = baseDamage;
    if (type === 'plasma') damage = baseDamage * 2;
    if (type === 'special') damage = baseDamage * 4;
    
    // Level 20 bonus: +50% damage
    if (battleLevelRef.current >= 20) {
      damage *= 1.5;
    }

    // Level 25 Skyring bonus: +50% damage
    if (battleLevelRef.current >= 25) {
      damage *= 1.5;
    }

    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
    
    battle.enemyHp = Math.max(0, battle.enemyHp - damage);
    battle.lastPlayerAttack = { ...battle.lastPlayerAttack, [type]: now };
    playSfx('shoot_player'); 
    
    if (battle.enemyHp <= 0) {
      battle.isVictory = true;
      resolveBattleVictory(battle);
    }
    
    setActiveBattle(battle);
  }, [language, playSfx, addLog, resolveBattleVictory]);

  const finishBattle = useCallback(() => {
    if (!activeBattleRef.current) return;
    const deliveryId = activeBattleRef.current.deliveryId;
    const isVictory = activeBattleRef.current.isVictory;
    
    if (deliveryId.startsWith('auto-')) {
      const routeId = deliveryId.replace('auto-', '');
      if (!isVictory) {
        setAutoTravelActive(prev => ({ ...prev, [routeId]: false }));
        setAutoTravelProgress(prev => ({ ...prev, [routeId]: 0 }));
        const route = ROUTES_MAP.get(routeId);
        addLog(`${t('autoDeliveryInterrupted')} ${route?.destination || routeId} ${t('interruptedByDefeat')}`, 'error');
      }
      setActiveBattle(null);
      return;
    }

    setActiveDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        if (isVictory) {
          return null; // Delivery completed by victory
        } else {
          return null; // Delivery failed
        }
      }
      return d;
    }).filter(d => d !== null) as ActiveDelivery[]);
    
    setActiveBattle(null);
  }, [language, addLog]);

  useEffect(() => {
    if (activeBattle && (activeBattle.isVictory || activeBattle.isDefeat)) {
      const battleRoute = ROUTES_MAP.get(activeBattle.routeId);
      if (battleRoute?.tier === 'Solar' || battleRoute?.tier === 'Interstellar') {
        const timer = setTimeout(() => {
          finishBattle();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeBattle?.isVictory, activeBattle?.isDefeat, finishBattle]);

  // Handle Radar Scan Success
  useEffect(() => {
    if (scanResult === 'success' && !activeBattle) {
      // Find a target ship or route
      const manualShips = activeDeliveries.filter(d => {
        const r = ROUTES_MAP.get(d.routeId);
        return d.status === 'delivering' && r?.tier === routeTier;
      });
      const autoRoutes = Object.keys(autoTravelActive).filter(rid => {
        const r = ROUTES_MAP.get(rid);
        return autoTravelActive[rid] && (autoTravelProgress[rid] || 0) > 0 && r?.tier === routeTier;
      });

      let targetId: string = 'radar-encounter';
      let routeId: string = '';

      if (manualShips.length > 0 || autoRoutes.length > 0) {
        const totalTargets = manualShips.length + autoRoutes.length;
        const targetIndex = Math.floor(Math.random() * totalTargets);
        
        if (targetIndex < manualShips.length) {
          const target = manualShips[targetIndex];
          targetId = target.id;
          routeId = target.routeId;
        } else {
          routeId = autoRoutes[targetIndex - manualShips.length];
          targetId = `auto-${routeId}`;
        }
      } else {
        // No active deliveries, find a random route of the current tier for the encounter
        const tierRoutes = Array.from(ROUTES_MAP.values()).filter(r => r.tier === routeTier);
        if (tierRoutes.length > 0) {
          routeId = tierRoutes[Math.floor(Math.random() * tierRoutes.length)].id;
        }
      }

      const route = routeId ? ROUTES_MAP.get(routeId) : null;
      if (route) {
        const enemyColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        const minLvl = Math.max(1, Math.floor(battleLevel * 0.9));
        const maxLvl = Math.max(1, Math.ceil(battleLevel * 1.1));
        const enemyTier = Math.min(20, Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl);
        
        let bossChance = 0.10 + (battleLevel >= 15 ? 0.10 : 0);
        if (battleLevel >= 45 && routeTier === 'Interstellar') bossChance += 0.25;
        
        const isBoss = Math.random() < bossChance;
        const isElite = !isBoss && enemyTier > 10;
        const enemyType = isBoss ? 'Boss' : (isElite ? 'Elite' : (enemyTier > 5 ? 'Alien' : (Math.random() > 0.5 ? 'Pirate' : 'Alien')));
        
        const enemyHp = (50 + (enemyTier * 60) + Math.floor(Math.random() * 50)) * (isBoss ? 10 : (isElite ? 5 : 1));
        let playerHp = 100 + (battleLevel * 150);
        if (battleLevel >= 25) playerHp += 500;

        const playerDps = (10 + battleLevel * 10) / 2;
        const enemyDps = ((8 + enemyTier * 6) / 2.5) * (isBoss ? 4 : (isElite ? 2 : 1));
        const playerTimeToKill = enemyHp / playerDps;
        const enemyTimeToKill = playerHp / enemyDps;
        let winProb = Math.min(100, Math.max(0, Math.floor((enemyTimeToKill / (playerTimeToKill + enemyTimeToKill)) * 100)));

        const totalWinProb = winProb + getDoomPBonus(doomPLevel) + getPoliceBonus(privatePoliceLevel);
        const multipliers = getEconomicMultipliers();
        const rewardMultiplier = isBoss ? 6 : (isElite ? 3 : 1);
        const result = (Math.random() * 100 < totalWinProb) ? 'victory' : 'defeat';
        
        const battle: Battle = {
          id: Math.random().toString(36).substr(2, 9),
          routeId: routeId,
          deliveryId: targetId,
          enemyName: isBoss ? (language === 'pt' ? 'Nave Mae (BOSS)' : 'MOTHER SHIP (BOSS)') : (isElite ? (language === 'pt' ? 'Cruzador de Elite' : 'Elite Cruiser') : enemyTier > 5 ? (language === 'pt' ? 'Cruzador Alienigena' : 'Alien Cruiser') : (enemyType === 'Pirate' ? (language === 'pt' ? 'Pirata Espacial' : 'Space Pirate') : (language === 'pt' ? 'Batedor Alienigena' : 'Alien Scout'))),
          enemyType: enemyType,
          enemyColor: isBoss ? '#ff0000' : (isElite ? '#f59e0b' : enemyTier > 5 ? '#a855f7' : enemyColors[Math.floor(Math.random() * enemyColors.length)]),
          enemyMaxHp: enemyHp,
          enemyHp: enemyHp,
          playerMaxHp: playerHp,
          playerHp: playerHp,
          reward: Math.floor(route.reward * (0.5 + enemyTier * 0.1) * (isBoss ? 5 : (isElite ? 2 : 1)) * multipliers.profit * rewardMultiplier),
          startTime: Date.now(),
          lastPlayerAttack: { laser: 0, plasma: 0, special: 0, shield: 0 },
          lastEnemyAttack: Date.now() + 1000, 
          shieldActive: false,
          lastShieldTime: 0,
          winProbability: winProb,
          enemyTier: enemyTier,
          predeterminedResult: result,
          isCinematicFinished: false,
          playerImage: battleLevel >= 25 ? '/images/battle/skyring.webp' : '/images/battle/standard_ship.webp',
          enemyImage: isBoss ? '/images/battle/enemy_boss.webp' : (isElite ? '/images/battle/enemy_elite.webp' : enemyTier > 15 ? '/images/battle/enemy_raider.webp' : enemyTier > 5 ? '/images/battle/enemy_alien.webp' : '/images/battle/enemy_scout.webp'),
          playerDps: playerDps,
          enemyDps: (10 + enemyTier * 5) / 2,
          isBoss: isBoss
        };

        setFoundBattle(battle);
        setScanResult(null);
      } else {
        setScanResult(null);
      }
    }
  }, [scanResult, activeBattle, activeDeliveries, autoTravelActive, autoTravelProgress, routeTier, battleLevel, doomPLevel, privatePoliceLevel, language, setFoundBattle, setScanResult, getEconomicMultipliers, getDoomPBonus, getPoliceBonus, playSfx, aetherion]);

const completeInitialMission = useCallback((missionId: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.completed) {
        addLog(`${t('missionReward' as any)}: ${m.title}`, 'success');
        playSfx('success');
        return { ...m, completed: true, current: 1 };
      }
      return m;
    }));
  }, [t, addLog, playSfx]);

  const generateMissions = useCallback(() => {
    const currentTier = routeTierRef.current;
    if (isSpeedRunRef.current) return;
    
    let currentMissions = [...missionsRef.current];
    
    if (currentMissions.length >= 6) return;

    const getMissionBaseValue = (level: number) => {
      const values = [15000, 50000, 250000, 1250000, 7500000, 40000000, 200000000, 1000000000, 4000000000, 10000000000];
      return values[Math.min(level - 1, 9)] || 15000;
    };

    const baseRewardValue = getMissionBaseValue(missionRewardLevelRef.current[currentTier] || 1) * (currentTier === 'Interstellar' ? 10 : 1);


    // Initial Missions for Route 1 Campaign only - Prioritized
    if (currentTier === 'Solar' && !isSpeedRunRef.current) {
      const initialMissions = [
        { id: 'init_1', titleKey: 'mission1Title', descKey: 'mission1Desc', type: 'initial' as const },
        { id: 'init_2', titleKey: 'mission2Title', descKey: 'mission2Desc', type: 'initial' as const },
        { id: 'init_3', titleKey: 'mission3Title', descKey: 'mission3Desc', type: 'initial' as const },
        { id: 'init_4', titleKey: 'mission4Title', descKey: 'mission4Desc', type: 'initial' as const },
        { id: 'init_5', titleKey: 'mission5Title', descKey: 'mission5Desc', type: 'initial' as const },
        { id: 'init_6', titleKey: 'mission6Title', descKey: 'mission6Desc', type: 'initial' as const },
      ];

      for (const initMission of initialMissions) {
        // Se a missão já foi completada/resgatada anteriormente, ignora para sempre
        if (completedInitialMissionsRef.current.includes(initMission.id)) continue;
        
        // Se a missão já está na lista atual, ignora
        if (currentMissions.some(m => m.id === initMission.id)) continue;

        // Adiciona a missão inicial (ignora o limite de 6 para garantir que todas as 6 iniciais apareçam)
        let isAlreadyDone = false;
        if (initMission.id === 'init_1') isAlreadyDone = (unlockedTechLevelsRef.current['Solar'] || 0) >= 1;
        if (initMission.id === 'init_2') isAlreadyDone = (ownedShipsRef.current['Solar-1'] || 0) > 0;
        if (initMission.id === 'init_3') {
          const terraTech = techLevelsRef.current['terra'] || { engine: 0 };
          isAlreadyDone = terraTech.engine >= 1;
        }
        if (initMission.id === 'init_4') {
          const solarStats = historyStatsRef.current.Solar || { manualDeliveries: 0 };
          isAlreadyDone = solarStats.manualDeliveries > 0;
        }
        if (initMission.id === 'init_5') {
          const terraSlots = autoTravelSlotsRef.current['terra'] || 0;
          isAlreadyDone = terraSlots > 0;
        }
        if (initMission.id === 'init_6') {
          const ferritaRobots = miningRobotsRef.current['ferrita'] || 0;
          isAlreadyDone = ferritaRobots > 0;
        }

        currentMissions.push({
          id: initMission.id,
          title: t(initMission.titleKey as any),
          description: t(initMission.descKey as any),
          reward: 1000,
          type: 'initial',
          target: 1,
          current: isAlreadyDone ? 1 : 0,
          completed: isAlreadyDone,
          claimed: false,
          tier: 'Solar',
          rarity: 'common'
        });
      }
    }

    if (currentMissions.length >= 6) {
      if (currentMissions.length !== missionsRef.current.length) {
        setMissions(currentMissions);
      }
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    while (currentMissions.length < 6 && attempts < maxAttempts) {
      attempts++;
      
      // Determine Rarity
      const roll = Math.random() * 100;
      
      let rarity: Mission['rarity'] = 'common';
      let multiplier = 1;
      
      // Probabilities based on upgrades (1% to 15% each)
      const mythicChance = missionMythicBonusRef.current + skillMiticaLevelRef.current[currentTier];
      const alienChance = missionAlienBonusRef.current + skillAlienLevelRef.current[currentTier];
      const legendaryChance = missionLegendaryBonusRef.current + skillLendariaLevelRef.current[currentTier];
      const rareChance = 30;
      const commonChance = 100 - (mythicChance + alienChance + legendaryChance + rareChance);

      if (roll < alienChance) {
        rarity = 'alien';
        multiplier = routeTier === 'Solar' ? 50 : 150;
      } else if (roll < alienChance + mythicChance) {
        rarity = 'mythic';
        multiplier = routeTier === 'Solar' ? 35 : 150;
      } else if (roll < alienChance + mythicChance + legendaryChance) {
        rarity = 'legendary';
        multiplier = routeTier === 'Solar' ? 25 : 50;
      } else if (roll < alienChance + mythicChance + legendaryChance + rareChance) {
        rarity = 'rare';
        multiplier = 10;
      } else {
        rarity = 'common';
        multiplier = 1;
      }

      const type = Math.random() > 0.5 ? 'delivery' : 'sell';

      if (type === 'delivery') {
        const unlockedShips = SHIPS.filter(s => s.tier === currentTier && (ownedShipsRef.current[`${currentTier}-${s.level}`] || 0) > 0)
          .sort((a, b) => b.level - a.level)
          .slice(0, 3);
        
        if (unlockedShips.length > 0) {
          const ship = unlockedShips[Math.floor(Math.random() * unlockedShips.length)];
          const exists = currentMissions.some(m => m.type === 'delivery' && m.shipLevel === ship.level && !m.completed);
          
          if (!exists) {
            const reward = Math.floor(baseRewardValue * multiplier * (0.8 + Math.random() * 0.4));
            
            // Rebalanced XP rewards based on rarity
            const rewardXP = rarity === 'mythic' ? (Math.floor(Math.random() * (40 - 20 + 1)) + 20) : 0;



            // Increased targets to ensure missions don't complete too fast
            const baseTarget = isSpeedRunRef.current ? (10 + Math.floor(Math.random() * 10)) : (currentTier === 'Interstellar' ? 100 : 40);
            const reduction = isSpeedRunRef.current ? 0 : skillTempoDinheiroLevelRef.current[routeTier];
            const target = Math.max(10, baseTarget - reduction);
            
            let rewardAetherion = 0;
            if (rarity === 'mythic') {
              rewardAetherion = Math.floor(Math.random() * (400 - 200 + 1)) + 200;
            }

            currentMissions.push({
              id: `delivery_${ship.level}_${Date.now()}_${currentMissions.length}`,
              title: languageRef.current === 'pt' ? `Entregas com ${ship.name}` : `Deliveries with ${ship.name}`,
              description: languageRef.current === 'pt' ? `Faça ${target} entregas com a ${ship.name}.` : `Make ${target} deliveries with the ${ship.name}.`,
              reward,
              rewardXP,
              rewardAetherion: rewardAetherion > 0 ? rewardAetherion : undefined,
              type: 'delivery',
              target,
              current: 0,
              completed: false,
              claimed: false,
              shipLevel: ship.level,
              tier: currentTier,
              rarity
            });
          }
        }
      } else {
        const unlockedOres = ORES.filter(o => o.tier === currentTier && (miningRobotsRef.current[o.id] || 0) > 0)
          .sort((a, b) => (b.baseValue * b.rarity) - (a.baseValue * a.rarity))
          .slice(0, 3);

        if (unlockedOres.length > 0) {
          const ore = unlockedOres[Math.floor(Math.random() * unlockedOres.length)];
          const exists = currentMissions.some(m => m.type === 'sell' && m.oreId === ore.id && !m.completed);
          
          if (!exists) {
            const reward = Math.floor(baseRewardValue * multiplier * (0.8 + Math.random() * 0.4));
            
            // Rebalanced XP rewards based on rarity
            const rewardXP = rarity === 'mythic' ? (Math.floor(Math.random() * (40 - 20 + 1)) + 20) : 0;



            // Increased targets to ensure missions don't complete too fast
            const baseTarget = isSpeedRunRef.current ? (10 + Math.floor(Math.random() * 5)) : (currentTier === 'Interstellar' ? 60 : 20);
            const reduction = isSpeedRunRef.current ? 0 : skillRobosOlimpicosLevelRef.current[routeTier];
            const target = Math.max(10, baseTarget - reduction);
            
            let rewardAetherion = 0;
            if (rarity === 'mythic') {
              rewardAetherion = Math.floor(Math.random() * (400 - 200 + 1)) + 200;
            }

            currentMissions.push({
              id: `sell_${ore.id}_${Date.now()}_${currentMissions.length}`,
              title: languageRef.current === 'pt' ? `Venda de ${ore.name}` : `Sell ${ore.name}`,
              description: languageRef.current === 'pt' ? `Venda ${target} PACKS de ${ore.name}.` : `Sell ${target} packs of ${ore.name}.`,
              reward,
              rewardXP,
              rewardAetherion: rewardAetherion > 0 ? rewardAetherion : undefined,
              type: 'sell',
              target,
              current: 0,
              completed: false,
              claimed: false,
              oreId: ore.id,
              tier: currentTier,
              rarity
            });
          }
        }
      }
    }

    if (currentMissions.length !== missionsRef.current.length) {
      setMissions(currentMissions);
    }
  }, [t, routeTier]);
  
  // Auto-Shipment Logic
  useEffect(() => {
    if (!voidAutoShipmentActive || routeTier !== 'Void') return;

    const interval = setInterval(() => {
      const resources = ['energy', 'minerals', 'food', 'meds', 'tech'] as const;
      const progress = earthReconstructionProgressRef.current;
      const vRes = voidResourcesRef.current;
      const vComp = voidCompactedResources; // This one is not in Ref yet, but changes less often

      resources.forEach(res => {
        if ((progress[res] || 0) < 100) {
          if ((vComp[res] || 0) > 0) {
            sendCompactedToEarth(res);
          } 
          else if ((vRes[res] || 0) >= 50000) {
            compactVoidResource(res);
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [voidAutoShipmentActive, routeTier]);

  const claimMission = useCallback((missionId: string, event?: React.MouseEvent, isAuto: boolean = false) => {
    const mission = missionsRef.current.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    if (isAuto) {
      const autoClaimCost = (routeTierRef.current === 'Interstellar') ? 2 : 1;
      if (aetherionRef.current < autoClaimCost) {
        dispatch({ type: 'TOGGLE_AUTO_CLAIM' });
        addLog(t('insufficientAetherion'), 'error');
        return;
      }
      dispatch({ type: 'SPEND_AETHERION', payload: { amount: autoClaimCost } });
    }

    // Trigger floating money animation if event provided or if on missions tab
    if (event || activeTabRef.current === 'missions') {
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      
      if (event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top;
      } else {
        const element = document.getElementById(`mission-${missionId}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top;
        }
      }

      const newFloatingReward = {
        id: Math.random().toString(36).substr(2, 9),
        amount: mission.reward,
        x,
        y
      };
      setFloatingRewards(prev => [...prev, newFloatingReward]);
      
      setTimeout(() => {
        setFloatingRewards(prev => prev.filter(r => r.id !== newFloatingReward.id));
      }, 1000);
    }

    if (mission.type === 'initial') {
      const newCompleted = [...completedInitialMissionsRef.current, missionId];
      completedInitialMissionsRef.current = newCompleted; // Update Ref immediately to prevent race conditions
      dispatch({ type: 'SET_COMPLETED_INITIAL_MISSIONS', payload: { missionIds: newCompleted } });
    }

    dispatch({ type: 'EARN_QC', payload: { amount: mission.reward, source: 'mission' } });
    if (mission.rewardAetherion) {
      dispatch({ type: 'EARN_AETHERION', payload: { amount: mission.rewardAetherion } });
    }
    if (mission.rewardXP) {
      dispatch({ type: 'ADD_SHIP_XP', payload: { amount: mission.rewardXP } });
    }

    dispatch({ type: 'UPDATE_HISTORY', payload: { tier: mission.tier, field: 'missionsCompleted', amount: 1 } });
    dispatch({ type: 'UPDATE_HISTORY', payload: { tier: mission.tier, field: 'qcFromMissions', amount: mission.reward } });
    dispatch({ type: 'UPDATE_HISTORY', payload: { tier: mission.tier, field: 'qcTotalAcquired', amount: mission.reward } });

    dispatch({ type: 'CLAIM_MISSION', payload: { id: missionId } });
    
    if (!isAuto) {
      playSfx('cash_register');
    }
    
    const xpText = mission.rewardXP ? `, +${mission.rewardXP} XP` : '';
    const aetherionText = mission.rewardAetherion ? `, +${mission.rewardAetherion} Aetherion` : '';
    addLog(`${t('missionReward')}: +${formatValue(mission.reward)} QC${xpText}${aetherionText}`, 'success');

    // Trigger mission generation after state update
    setTimeout(() => generateMissions(), 100);
  }, [dispatch, t, playSfx, addLog, generateMissions, formatValue]);


  useEffect(() => {
    if (!isLoaded || !autoClaimMissions) return;
    
    const completedMission = missions.find(m => m.completed && !m.claimed);
    if (completedMission) {
      claimMission(completedMission.id, undefined, true);
    }
  }, [missions, autoClaimMissions, isLoaded, claimMission]);

  useEffect(() => {
    if (!isLoaded) return;
    generateMissions();
    const interval = setInterval(() => {
      generateMissions();
    }, 60000); // Check for new missions every minute
    return () => clearInterval(interval);
  }, [isLoaded, generateMissions]);
  const [coffeePhraseIndex, setCoffeePhraseIndex] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [speedRunTime, setSpeedRunTime] = useState(0);
  const [isSpeedRunFinished, setIsSpeedRunFinished] = useState(false);


  // Speed Run Timer
  useEffect(() => {
    if (isSpeedRun && !isSpeedRunFinished) {
      const interval = setInterval(() => {
        setSpeedRunTime(Date.now() - startTime);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [isSpeedRun, isSpeedRunFinished, startTime]);

  // Speed Run Win Condition Check
  useEffect(() => {
    if (isSpeedRun && !isSpeedRunFinished) {
      const checkWin = () => {
        // 1. All Technologies (Solar 9)
        if ((unlockedTechLevels['Solar'] || 0) < 9) return false;

        // 2. All Ships (5 of each level 1-9)
        const allShips = [1, 2, 3, 4, 5, 6, 7, 8, 9].every(level => (ownedShips[`Solar-${level}`] || 0) >= 5);
        if (!allShips) return false;

        // 3. All Upgrades (4 categories maxed for all Solar routes)
        const solarRoutes = ROUTES.filter(r => r.tier === 'Solar');
        const allUpgrades = solarRoutes.every(route => {
          const routeTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
          return UPGRADES.every(upgrade => {
            const currentLevel = routeTech[upgrade.id.toLowerCase()] || 0;
            return currentLevel >= upgrade.tiers.length;
          });
        });
        if (!allUpgrades) return false;

        // 4. All Auto-travel Slots (5 per Solar route) AND Active
        const allSlots = solarRoutes.every(route => {
          const slots = autoTravelSlots[route.id] || 0;
          const isActive = autoTravelActive[route.id] === true;
          return slots >= 5 && isActive;
        });
        if (!allSlots) return false;

        // 5. All Mining Robots (All Solar ores, level 5, auto-sell active)
        const solarOres = ORES.filter(o => o.tier === 'Solar');
        const allMining = solarOres.every(ore => {
          const robots = miningRobots[ore.id] || 0;
          const level = miningRobotLevels[ore.id] || 0;
          const autoSell = autoSellByOre[ore.id] === true;
          return robots > 0 && level >= 5 && autoSell;
        });
        if (!allMining) return false;

        return true;
      };

      if (checkWin()) {
        setIsSpeedRunFinished(true);
        setShowSpeedRunWinModal(true);
        
        // Save record
        const newRecord = {
          name: playerName || 'Unknown Pilot',
          time: Date.now() - startTime,
          date: new Date().toLocaleDateString()
        };
        
        const saveRecord = async () => {
          try {
            const saved = await GameStorage.load('speed_run_records');
            let records = saved || [];
            if (!Array.isArray(records)) records = [];
            
            records.push(newRecord);
            records.sort((a: any, b: any) => a.time - b.time);
            records = records.slice(0, 10);
            await GameStorage.save(records, 'speed_run_records');
            addLog('Speed Run record saved!', 'success');
          } catch (e) {
            console.error("Failed to save speed run record", e);
            // Fallback: just save this one if everything else failed
            await GameStorage.save([newRecord], 'speed_run_records');
          }
        };
        saveRecord();
      }
    }
  }, [isSpeedRun, isSpeedRunFinished, ownedShips, unlockedTechLevels, techLevels, autoTravelSlots, autoTravelActive, miningRobots, miningRobotLevels, autoSellByOre, playerName, startTime, addLog]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  };

  const translateData = useCallback((text: string) => {
    return text;
  }, []);

  // Refs for loops to avoid dependency churn
  const [resolution, setResolution] = useState('Native');
  const [displayMode, setDisplayMode] = useState<'Fullscreen' | 'Windowed'>('Windowed');

  const [exportOptions, setExportOptions] = useState({
    campaign: true,
    speedRun: true,
    secretCodes: true,
    achievements: true,
    everything: true
  });

  const getSpeedRunProgress = () => {
    if (!isSpeedRun) return null;
    
    const ships = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(level => (ownedShips[`Solar-${level}`] || 0) >= 5).length;
    const tech = (unlockedTechLevels['Solar'] || 0);
    
    const solarRoutes = ROUTES.filter(r => r.tier === 'Solar');
    const upgrades = solarRoutes.filter(route => {
      const routeTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
      return UPGRADES.every(upgrade => {
        const currentLevel = routeTech[upgrade.id.toLowerCase()] || 0;
        return currentLevel >= upgrade.tiers.length;
      });
    }).length;
    
    const slots = solarRoutes.filter(route => (autoTravelSlots[route.id] || 0) >= 5 && autoTravelActive[route.id]).length;
    
    const solarOres = ORES.filter(o => o.tier === 'Solar');
    const robots = solarOres.filter(ore => (miningRobots[ore.id] || 0) > 0 && (miningRobotLevels[ore.id] || 0) >= 5 && autoSellByOre[ore.id]).length;

    return {
      ships: { current: ships, total: 9 },
      tech: { current: tech, total: 9 },
      upgrades: { current: upgrades, total: solarRoutes.length },
      slots: { current: slots, total: solarRoutes.length },
      robots: { current: robots, total: solarOres.length }
    };
  };

  const currentRoutes = ROUTES.filter(r => r.tier === routeTier);
  const currentShips = SHIPS.filter(s => s.tier === routeTier);
  const currentOres = ORES.filter(o => o.tier === routeTier);

  const getLocationMultiplier = useCallback((locationId: string) => {
    const routeIndex = ROUTES.findIndex(r => r.id === locationId);
    const base = routeTier === 'Interstellar' ? 1.5 : 1.1;
    return Math.pow(base, routeIndex >= 0 ? routeIndex % 9 : 0);
  }, [routeTier]);


  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const isSpeedMode = false;

  const incrementDeliveries = useCallback((source: 'manual' | 'auto', count: number = 1) => {
    const tier = routeTier;
    dispatch({ type: 'UPDATE_HISTORY', payload: { tier, field: 'deliveries', amount: count } });
    if (source === 'manual') dispatch({ type: 'UPDATE_HISTORY', payload: { tier, field: 'manualDeliveries', amount: count } });
    if (source === 'auto') dispatch({ type: 'UPDATE_HISTORY', payload: { tier, field: 'autoDeliveries', amount: count } });

    // RHSE Solar Energy
    const mappingBonus = 1 + (solarMappingLevel * 0.1);
    const energyToAdd = count * 50 * (routeTier === 'Interstellar' ? mappingBonus : 1);
    solarEnergyRef.current = Math.min(7500, solarEnergyRef.current + energyToAdd);
  }, [routeTier, solarMappingLevel]);

  
  // RHSE Tube Generation Logic: 2500 Waste + 2500 Solar = 1 Tube
  useEffect(() => {
    if (miningWasteRef.current >= 2500 && solarEnergyRef.current >= 2500) {
      miningWasteRef.current -= 2500;
      solarEnergyRef.current -= 2500;
      aetherionTubesRef.current = Math.min(isInterstellar ? 20 : 10, aetherionTubesRef.current + 1);
    }
  }, [miningWaste, solarEnergy, routeTier, isInterstellar]);

  const isRoute2Unlocked = useCallback(() => {
    if (isSpeedRun) return false;
    if (routeTier === 'Interstellar' || routeTier === 'Void') return true;

    const solarRoutes = ROUTES.filter(r => r.tier === 'Solar');
    const solarShips = SHIPS.filter(s => s.tier === 'Solar');
    const solarOres = ORES.filter(o => o.tier === 'Solar');

    // 1. Todas as tecnologias Solar (nÃ­vel 9)
    if ((unlockedTechLevels.Solar || 0) < 9) return false;

    // 2. Todas as naves Solar compradas (5 de cada)
    const allShipsOwned = solarShips.every(s => (ownedShips[`Solar-${s.level}`] || 0) >= 5);
    if (!allShipsOwned) return false;

    // 3. Todas as melhorias Solar no mÃ¡ximo
    const allUpgradesMaxed = solarRoutes.every(r => {
      const levels = techLevels[r.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
      return levels.engine >= 5 && levels.ai >= 6 && levels.value >= 5 && levels.rare >= 5;
    });
    if (!allUpgradesMaxed) return false;

    // 4. Todos robÃ´s de mineraÃ§Ã£o (5 por minÃ©rio) e melhorias (nÃ­vel 5)
    const allOresMaxed = solarOres.every(ore => {
      const robots = miningRobots[ore.id] || 0;
      const level = miningRobotLevels[ore.id] || 1;
      return robots >= 5 && level >= 5;
    });
    if (!allOresMaxed) return false;

    // 5. Todos os slots de todas as naves comprados
    const allSlotsMaxed = solarRoutes.every(r => {
      const slots = autoTravelSlots[r.id] || 0;
      return slots >= 5;
    });
    if (!allSlotsMaxed) return false;

    // 6. Fortuna acumulada de 1 TrilhÃ£o de QC (Total Acquired)
    const currentQC = historyStats['Solar']?.qcTotalAcquired || 0;
    if (currentQC < 1000000000000) return false;

    // 7. CompressÃ£o Refinada do primeiro minÃ©rio ao mÃ¡ximo (10)
    const firstOre = solarOres[0];
    if ((miningCompressionLevels[firstOre.id] || 0) < 10) return false;

    // 8. Total de entregas (3000)
    if (totalDeliveries < 3000) return false;

    // 9. 100 missÃµes concluídas
    if ((historyStats['Solar']?.missionsCompleted || 0) < 100) return false;

    return true;
  }, [isSpeedRun, routeTier, unlockedTechLevels, ownedShips, techLevels, miningRobots, miningRobotLevels, autoTravelSlots, autoTravelActive, historyStats, miningCompressionLevels, totalDeliveries]);

  const isRoute3Unlocked = useCallback(() => {
    if (isSpeedRun) return false;
    if (routeTier === 'Void') return true;
    if (routeTier === 'Solar') return false;
    // If we are in Interstellar, we need to check if we met the requirements to unlock Void
    const interstellarRoutes = ROUTES.filter(r => r.tier === 'Interstellar');
    const interstellarShips = SHIPS.filter(s => s.tier === 'Interstellar');
    const interstellarOres = ORES.filter(o => o.tier === 'Interstellar');

    // 1. Todas as tecnologias Interstellar (nÃ­vel 9)
    if ((unlockedTechLevels.Interstellar || 0) < 9) return false;

    // 2. Todas as naves Interstellar compradas (5 de cada)
    const allShipsOwned = interstellarShips.every(s => (ownedShips[`Interstellar-${s.level}`] || 0) >= 5);
    if (!allShipsOwned) return false;

    // 3. Todas as melhorias Interstellar no mÃ¡ximo
    const allUpgradesMaxed = interstellarRoutes.every(r => {
      const levels = techLevels[r.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
      return levels.engine >= 5 && levels.ai >= 6 && levels.value >= 5 && levels.rare >= 5;
    });
    if (!allUpgradesMaxed) return false;

    // 4. Todos robÃ´s de mineraÃ§Ã£o (5 por minÃ©rio) e melhorias (nÃ­vel 5)
    const allOresMaxed = interstellarOres.every(ore => {
      const robots = miningRobots[ore.id] || 0;
      const level = miningRobotLevels[ore.id] || 1;
      return robots >= 5 && level >= 5;
    });
    if (!allOresMaxed) return false;

    // 5. Todos os slots de todas as naves comprados
    const allSlotsMaxed = interstellarRoutes.every(r => {
      const slots = autoTravelSlots[r.id] || 0;
      return slots >= 5;
    });
    if (!allSlotsMaxed) return false;

    // 6. Fortuna acumulada de 999 TrilhÃµes de QC (Total Acquired)
    const currentQC = historyStats['Interstellar']?.qcTotalAcquired || 0;
    if (currentQC < 999000000000000) return false;

    // 7. CompressÃ£o Refinada do primeiro minÃ©rio ao mÃ¡ximo (10)
    const firstOre = interstellarOres[0];
    if (firstOre && (miningCompressionLevels[firstOre.id] || 0) < 10) return false;

    // 8. Total de entregas (9999)
    if (totalDeliveries < 9999) return false;

    // 9. 1000 missÃµes concluídas
    if ((historyStats['Interstellar']?.missionsCompleted || 0) < 1000) return false;

    return true;
  }, [isSpeedRun, routeTier, unlockedTechLevels, ownedShips, techLevels, miningRobots, miningRobotLevels, autoTravelSlots, autoTravelActive, historyStats, miningCompressionLevels, totalDeliveries]);

  const syncAchievements = useCallback(() => {
    // 1. First Delivery
    if (totalDeliveries >= 1) updateAchievementProgress('first_delivery', 1, true);

    // 2. QC Millionaire & Trillionaire
    const totalQC = Object.values(historyStats).reduce((acc, curr) => acc + (curr.qcTotalAcquired || 0), 0);
    if (totalQC >= 1000000) updateAchievementProgress('qc_millionaire', totalQC, true);
    if (totalQC >= 1000000000000) updateAchievementProgress('qc_trillionaire', totalQC, true);

    // 3. Battle Warrior & Pirate Slayer
    const totalBattlesWon = Object.values(historyStats).reduce((acc, curr) => acc + (curr.battlesWon || 0), 0);
    updateAchievementProgress('battle_warrior', totalBattlesWon, true);
    updateAchievementProgress('pirate_slayer', totalBattlesWon, true);

    // 4. Robot Owner (Total robots)
    const totalRobots = Object.values(miningRobots).reduce((a, b) => a + b, 0);
    updateAchievementProgress('robot_owner', totalRobots, true);

    // 5. Route Unlocks
    if (isRoute2Unlocked()) updateAchievementProgress('route_2_unlocked', 1, true);
    if (isRoute3Unlocked()) updateAchievementProgress('void_unlocked', 1, true);

    // 6. Tech Master (Sum of technology levels)
    const totalTechs = Object.values(unlockedTechLevels).reduce((a, b) => a + b, 0);
    updateAchievementProgress('tech_master', totalTechs, true);

    // 7. Ship Collector (Unique ships)
    const totalShips = Object.keys(ownedShips).length;
    updateAchievementProgress('ship_collector', totalShips, true);

    // 8. Max Upgrade
    const hasMaxUpgrade = Object.values(techLevels).some(loc => Object.values(loc).some(lvl => lvl >= 5));
    if (hasMaxUpgrade) updateAchievementProgress('max_upgrade', 5, true);

    // 9. Earth Restorer
    const earthProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + b, 0) / 5;
    if (earthProgress >= 50) updateAchievementProgress('earth_restorer', earthProgress, true);
    if (earthProgress >= 100) updateAchievementProgress('earth_restorer_100', earthProgress, true);

    // 10. Total Deliveries
    if (totalDeliveries >= 10000) updateAchievementProgress('total_deliveries_10k', totalDeliveries, true);

    // 11. All Ships R1 & R2
    const shipsR1R2 = Object.keys(ownedShips).filter(key => key.startsWith('Solar-') || key.startsWith('Interstellar-')).length;
    if (shipsR1R2 >= 18) updateAchievementProgress('all_ships_r1_r2', shipsR1R2, true);

    // 12. Total Missions
    const totalMissions = Object.values(historyStats).reduce((acc, curr) => acc + (curr.missionsCompleted || 0), 0);
    if (totalMissions >= 1000) updateAchievementProgress('total_missions_1k', totalMissions, true);

    // 13. Battle Level
    if (battleLevel >= 55) updateAchievementProgress('battle_level_55', battleLevel, true);

    // 14. Mining Tycoon
    const totalPacksSold = Object.values(historyStats).reduce((acc, curr) => 
      acc + (curr.manualMiningPacksSold || 0) + (curr.autoMiningPacksSold || 0), 0);
    updateAchievementProgress('mining_tycoon', totalPacksSold, true);

    // 15. Perfect Pilot
    const totalPerfects = Object.values(historyStats).reduce((acc, curr) => acc + (curr.perfectDeliveries || 0), 0);
    updateAchievementProgress('perfect_pilot', totalPerfects, true);

  }, [updateAchievementProgress]);

  useEffect(() => {
    if (!isLoaded) return;
    syncAchievements();
  // Deliberate: run once after load, then on key progression milestones only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, totalDeliveries, historyStats, battleLevel, earthReconstructionProgress]);

  const startVoidTransition = () => {
    if (isSpeedRun) return; 
    
    // Reset progress for Route 3
    setQc(0);
    setAetherion(0);
    setMiningWaste(0);
    setSolarEnergy(0);
    setAetherionTubes(0);
    setOresCollected({}); // Shim already handled in flush, but let's dispatch just in case or just let flush handle it.
    // Better to dispatch explicitly here to be immediate
    dispatch({ type: 'SET_ORES_COLLECTED', payload: { ores: {} } });
    dispatch({ type: 'SET_MINING_ROBOTS', payload: { robots: {} } });
    dispatch({ type: 'SET_MINING_ROBOT_LEVELS', payload: { levels: {} } });
    dispatch({ type: 'SET_AUTO_SELL_BY_ORE', payload: { autoSell: {} } });

    dispatch({ type: 'SET_TECH_LEVELS',     payload: { techLevels: { 'void-1': { engine: 0, ai: 0, value: 0, rare: 0 } } } });
    dispatch({ type: 'SET_UNLOCKED_ROUTES', payload: { routeIds: ['void-1'] } });
    dispatch({ type: 'SET_OWNED_SHIPS',     payload: { ownedShips: { 'Void-1': 1 } } });
    dispatch({ type: 'UNLOCK_TECH_LEVEL',   payload: { tier: 'Void', level: 1 } });
    dispatch({ type: 'SET_AUTO_TRAVEL_SLOTS', payload: { slots: {} } });

    setRouteTier('Void');
    setVoidResources({
      energy: 0,
      food: 0,
      tech: 0,
      meds: 0,
      minerals: 0
    });
    setShowVoidAircraftTutorial(true);
    setVoidAircraftTutorialStep(0);
    setVoidAircraftMissions({
      'va-1': { status: 'idle', endTime: null, rareFound: false, restartAt: null },
      'va-2': { status: 'idle', endTime: null, rareFound: false, restartAt: null },
      'va-3': { status: 'idle', endTime: null, rareFound: false, restartAt: null }
    });
    setUnlockedVoidAircraft(['va-1']);
    setVoidAircraftAutoToggles({
      'va-1': true,
      'va-2': true,
      'va-3': true
    });
    setVoidAircraftUpgrades({
      'va-1': { storage: 0, quality: 0, time: 0, energy: 0, auto: 0 },
      'va-2': { storage: 0, quality: 0, time: 0, energy: 0, auto: 0 },
      'va-3': { storage: 0, quality: 0, time: 0, energy: 0, auto: 0 }
    });
    setVoidBattleShipStats({
      hp: 1000,
      maxHp: 1000,
      shield: 1000,
      maxShield: 1000,
      damage: 100,
      critChance: 0.10,
      lootEfficiency: 0.25,
      rarity: 'common',
      upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 }
    });
    setVoidPOIsInspiration({
      'poi-1': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
      'poi-2': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
      'poi-3': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
      'poi-4': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 }
    });
    setVoidPOIQCDonations({
      'poi-1': 0,
      'poi-2': 0,
      'poi-3': 0,
      'poi-4': 0
    });
    setEarthReconstructionProgress({
      energy: 0,
      minerals: 0,
      tech: 0,
      food: 0,
      meds: 0
    });
    setAutoTravelActive({});
    setAutoTravelProgress({});
    setActiveDeliveries([]);
    setDeliveriesByLocation({});
    setActiveTab('void_aircraft');
    setShowVoidLore(false);
    setLoreLineIndex(0);
    addLog(t('route3UnlockedMessage'), 'success');
    playSfx('success');
  };

  const startRoute2Transition = () => {
    if (isSpeedRun) return; 
    
    setIsTransitioning(true);
    playSfx('charging');
    addLog(t('route2TransitionMessage'), 'warning');
    
    setTimeout(() => {
      playSfx('warp');
      setRouteTier('Interstellar');
      setQc(0); // Ensure QC starts at 0 for Route 2
      dispatch({ type: 'SET_TECH_LEVELS',     payload: { techLevels: { 'alpha-centauri': { engine: 0, ai: 0, value: 0, rare: 0 } } } });
      dispatch({ type: 'SET_UNLOCKED_ROUTES', payload: { routeIds: ['alpha-centauri'] } });
      dispatch({ type: 'SET_AUTO_TRAVEL_SLOTS', payload: { slots: {} } });
      dispatch({ type: 'UNLOCK_TECH_LEVEL',   payload: { tier: 'Interstellar', level: 1 } });
      setAutoTravelActive({});
      setAutoTravelProgress({});
      setActiveDeliveries([]);
      // setTotalDeliveries(0); // Removed to keep history
      setDeliveriesByLocation({});
      setMissions([]); // Clear missions for Route 2
      dispatch({ type: 'SET_SYSTEM_DATA', payload: { seenTutorials: {} } }); // Reset tutorials for Route 2 so they can be seen again
      setRadarUnlocked(prev => ({ ...prev, Interstellar: prev.Solar }));
      setMissionRewardLevel(prev => ({ ...prev, Interstellar: 1 }));
      setSkillLendariaLevel(prev => ({ ...prev, Interstellar: 0 }));
      setSkillMiticaLevel(prev => ({ ...prev, Interstellar: 0 }));
      setSkillAlienLevel(prev => ({ ...prev, Interstellar: 0 }));
      setSkillTempoDinheiroLevel(prev => ({ ...prev, Interstellar: 0 }));
      setSkillRobosOlimpicosLevel(prev => ({ ...prev, Interstellar: 0 }));
      setExtractionTechLevel(0);
      setSolarMappingLevel(0);
      setDoubleRouteLevel(0);
      setMiningCompressionLevels({});
      setAutoClaimMissions(false);
      setAutoSellUnlockedByOre({});
      dispatch({ type: 'SET_OWNED_SHIPS',      payload: { ownedShips: { 'Interstellar-1': 1 } } });
      setActiveTab('routes2');
      setIsTransitioning(false);
      dispatch({ type: 'SET_HAS_SEEN_ROUTE2_MESSAGE', payload: { hasSeen: true } });
      setShowRoute2Confirm(false);
      addLog('Ã°Å¸Å’Å’ PROTOCOLO INTERESTELAR INICIADO. BEM-VINDO Ãƒâ‚¬ NOVA ERA.', 'success');
    }, 5000);
  };

  const boostResearch = () => {
    if (!researchingTech || isSpeedRun) return;
    
    const tech = TECHNOLOGIES_MAP.get(`${researchingTech.tier}-${researchingTech.level}`);
    if (!tech) return;

    const multipliers = getEconomicMultipliers();
    let boostCost = 0;

    if (researchingTech.tier === 'Solar' || researchingTech.tier === 'Interstellar') {
      // Valor fixo de 75% do valor de pesquisa da tecnologia
      boostCost = Math.floor(tech.cost * multipliers.cost * 0.75);
    } else {
      let researchTime = tech.researchTime;
      // No more conditional for Interstellar here because it's handled in the if block above
      
      const elapsed = Date.now() - researchingTech.startTime;
      const remainingTime = Math.max(0, researchTime - elapsed);
      
      const boostRate = 500;
      boostCost = Math.floor((remainingTime / 1000) * boostRate);
    }

    if (qc < boostCost) {
      addLog(language === 'pt' ? `QC insuficiente para acelerar. Necessário ${formatValue(boostCost)} QC` : `Insufficient QC for boost. Need ${formatValue(boostCost)} QC`, 'error');
      return;
    }

    dispatch({ type: 'SPEND_QC', payload: { amount: boostCost } });
    updateHistoryStats('spent', boostCost, routeTier);
    dispatch({ type: 'UNLOCK_TECH_LEVEL', payload: { tier: researchingTech.tier, level: researchingTech.level } });
    
    if (isSpeedRun) {
      dispatch({ type: 'BUY_SHIP', payload: { shipKey: `${tech.tier}-${tech.unlocksShipLevel}` } });
    }
    
    setResearchingTech(null);
    playSfx('ask_window');
    if (researchingTech.tier === 'Solar' || researchingTech.tier === 'Interstellar') {
      playSfx('tech_success');
    } else {
      playSfx('success');
    }
    addLog(language === 'pt' ? `Pesquisa concluída com boost! (-${formatValue(boostCost)} QC)` : `Research completed with boost! (-${formatValue(boostCost)} QC)`, 'success');
    performSave();
  };

  // Effect to show Route 2 unlock message
  useEffect(() => {
    if (isTransitioning || showRoute2Lore || showVoidLore) return;
    if (isRoute2Unlocked() && !hasSeenRoute2UnlockMessage) {
      addLog(t('route2UnlockedMessage'), 'success');
      dispatch({ type: 'SET_HAS_SEEN_ROUTE2_MESSAGE', payload: { hasSeen: true } });
      playSfx('success');
    }
  }, [isRoute2Unlocked, hasSeenRoute2UnlockMessage, addLog, t, playSfx, isTransitioning, showRoute2Lore, showVoidLore]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoffeePhraseIndex(prev => {
        let next = Math.floor(Math.random() * 20);
        while (next === prev) next = Math.floor(Math.random() * 20);
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (isSpeedRun || !isLoaded) return;
    
    const saveInterval = setInterval(() => {
      performSave();
    }, 10000); // Auto-save every 10 seconds
    
    return () => clearInterval(saveInterval);
  }, [isSpeedRun, isLoaded, performSave]);

  // Load save logic
  useEffect(() => {
    if (isLoaded) return;

    if (isSpeedRun) {
      setIsLoaded(true);
      return;
    }

    const loadFromStorage = async () => {
      // GUARD: se estamos em processo de reset, não carregar nada
      if (isResettingRef.current) {
        setIsLoaded(true);
        return;
      }

      const saved = await GameStorage.load('time_travel_save');

      // GUARD: checar novamente após o await â€” o reset pode ter ocorrido
      // enquanto aguardávamos a resposta do servidor
      if (isResettingRef.current) {
        setIsLoaded(true);
        return;
      }

      if (saved) {
        try {
          const data = SaveManager.loadSave(saved);

          // CRÃ TICO: hidratar o Redux com o save completo
          // O GameProvider agora começa com INITIAL_STATE â€” precisamos fazer isso aqui
          dispatch({ type: 'LOAD_SAVE', payload: data });

          // Estado de UI não gerenciado pelo Redux (como arcade scores locais)
          if (data.arcadeScores) {
            setArcadeScores(data.arcadeScores);
            Object.entries(data.arcadeScores).forEach(([gameId, score]) => {
              const key = `${gameId.replace(/-/g, '_')}_high_score`;
              localStorage.setItem(key, String(score));
            });
          }
          
          if (data.speedRunRecords && setLocalRecords) {
            setLocalRecords(data.speedRunRecords);
          }
        } catch (e) {
          console.error('Failed to load save', e);
        }
      }
      // Sem save encontrado = novo jogo, INITIAL_STATE já está no Redux âœ…

      setIsLoaded(true);
    };

    loadFromStorage();
  }, [isLoaded, isSpeedRun, dispatch, setLocalRecords]);

  // Auto-Save and Load Colonies
  useEffect(() => {
    const loadColonies = async () => {
      const saved = await GameStorage.load('colonies_data');
      setColonies(cleanColoniesData(saved || [], language as any));
    };
    loadColonies();
  }, [language]);

  useEffect(() => {
    if (isLoaded && colonies.length > 0) {
      GameStorage.save(colonies, 'colonies_data');
    }
  }, [colonies, isLoaded]);

  const getCoffeePhrase = useCallback(() => {
    const phrases = translations[language].coffeeMessage;
    const text = phrases[coffeePhraseIndex];
    return text;
  }, [language, coffeePhraseIndex]);

  const launchRoute = useCallback((route: Route) => {
    if (route.tier === 'Interstellar') {
      playSfx('start_engine_2');
    } else {
      playSfx('start_engine_1');
    }
    const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
    const valueUpgrade = UPGRADES_MAP.get('value')!;
    const valueTier = valueUpgrade.tiers.find(t => t.level === locationTech.value);
    const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
    const fuelCost = (qcRef.current === 0 && route.requiredShipLevel === 1) || route.tier === 'Interstellar' ? 0 : Math.floor(10 * costIncreaseMultiplier);

    if (qcRef.current < fuelCost) {
      addLog(`Insufficient QC for fuel to ${route.name}`, 'error');
      return false;
    }
    
    // Earth-Earth random distance
    let distance = route.distance;
    if (route.id === 'terra') {
      distance = Math.floor(Math.random() * (5000 - 50 + 1)) + 50;
    }

    // Check ship availability
    const requiredLevel = route.requiredShipLevel;
    const totalOwned = ownedShipsRef.current[`${route.tier}-${requiredLevel}`] || 0;
    
    // Count ships in use by manual deliveries
    let currentlyInUse = activeDeliveriesRef.current.filter(d => d.shipLevel === requiredLevel && d.tier === route.tier && d.status === 'delivering').length;
    
    // Count ships in use by auto-travel
    Object.keys(autoTravelActiveRef.current).forEach(routeId => {
      if (autoTravelActiveRef.current[routeId]) {
        const r = ROUTES_MAP.get(routeId);
        if (r && r.requiredShipLevel === requiredLevel && r.tier === route.tier) {
          currentlyInUse += (autoTravelSlotsRef.current[routeId] || 0);
        }
      }
    });
    
    if (currentlyInUse >= totalOwned) {
      addLog(t('noShips'), 'error');
      return false;
    }

    const status = 'delivering';

    setQc(c => c - fuelCost);
    updateHistoryStats('spent', fuelCost, route.tier);
    performSave();
    completeInitialMission('init_4');
    setActiveDeliveries(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        routeId: route.id,
        progress: 0,
        speed: 0,
        startTime: Date.now(),
        shipLevel: requiredLevel,
        distance: distance,
        status: status,
        tier: route.tier
      }
    ]);
    addLog(`Ship launched to ${route.name}`, 'info');
    return true;
  }, [playSfx, addLog, updateHistoryStats, completeInitialMission, language]);



  const handleExit = async () => {
    setIsSaving(true);
    setSaveProgress(0);
    
    // Simulate real saving time (2.5 seconds)
    const duration = 2500;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      setSaveProgress(Math.min(Math.round(i * increment), 100));
    }
    
    // Final check to ensure 100%
    setSaveProgress(100);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Prepare save data - DISABLE ALL AUTO MODES
    const saveData = {
      qc: qcRef.current,
      aetherion: aetherionRef.current,
      miningWaste: miningWasteRef.current,
      solarEnergy: solarEnergyRef.current,
      aetherionTubes: aetherionTubesRef.current,
      unlockedRouteIds: unlockedRouteIdsRef.current,
      ownedShips: ownedShipsRef.current,
      techLevels: techLevelsRef.current,
      autoTravelSlots: autoTravelSlotsRef.current,
      autoTravelActive: Object.keys(autoTravelActiveRef.current).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      autoTravelDesired: Object.keys(autoTravelDesiredRef.current).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      playerName,
      miningRobots: miningRobotsRef.current,
      miningRobotLevels: miningRobotLevelsRef.current,
      oresCollected: oresCollectedRef.current,
      autoSellByOre: Object.keys(autoSellByOreRef.current).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      autoSellUnlockedByOre: autoSellUnlockedByOreRef.current,
      miningCompressionLevels: miningCompressionLevelsRef.current,
      unlockedTechLevels: unlockedTechLevelsRef.current,
      seenTutorials,
      routeTier: routeTierRef.current,
      totalDeliveries: totalDeliveriesRef.current,
      deliveriesByLocation: deliveriesByLocationRef.current,
      historyStats: historyStatsRef.current,
      missions: missionsRef.current,
      missionMythicBonus: missionMythicBonusRef.current,
      missionAlienBonus: missionAlienBonusRef.current,
      missionLegendaryBonus: missionLegendaryBonusRef.current,
      autoClaimMissions,
      radarUnlocked,
      completedInitialMissions: completedInitialMissionsRef.current,
      shipXP: shipXPRef.current,
      shipLevel: shipLevelRef.current,
      battleLevel: battleLevelRef.current,
      extractionTechLevel: extractionTechLevelRef.current,
      solarMappingLevel: solarMappingLevelRef.current,
      doubleRouteLevel: doubleRouteLevelRef.current,
      doomPLevel: doomPLevelRef.current,
      privatePoliceLevel: privatePoliceLevelRef.current,
      captureLevel: captureLevelRef.current,
      radarLevel: radarLevelRef.current,
      unlockedExtractionPoints: unlockedExtractionPointsRef.current,
      extractionPacks: extractionPacksRef.current,
      extractionRobotLevels: extractionRobotLevelsRef.current,
      extractionProductionLevels: extractionProductionLevelsRef.current,
      extractionCompressionLevels: extractionCompressionLevelsRef.current,
      extractionAutoSell: extractionAutoSellRef.current,
      extractionAutoSellUnlocked: extractionAutoSellUnlockedRef.current,
      route4Unlocked,
      totalExtractionProfit: totalExtractionProfitRef.current,
      lastScanTime: lastScanTimeRef.current,
      hasSeenRoute2UnlockMessage,
      speedRunTime,
      isSpeedRunFinished,
      resolution,
      displayMode,
      missionRewardLevel: missionRewardLevelRef.current,
      skillLendariaLevel: skillLendariaLevelRef.current,
      skillMiticaLevel: skillMiticaLevelRef.current,
      skillAlienLevel: skillAlienLevelRef.current,
      skillTempoDinheiroLevel: skillTempoDinheiroLevelRef.current,
      skillRobosOlimpicosLevel: skillRobosOlimpicosLevelRef.current,
      warCoreLevel: warCoreLevelRef.current,
      fleetPower: fleetPowerRef.current,
      earthReconstructionProgress: earthReconstructionProgressRef.current,
      voidResources: voidResourcesRef.current,
      voidCompactedResources,
      voidDonationModes,
      voidAircraftMissions: voidAircraftMissionsRef.current,
      voidAircraftUpgrades: voidAircraftUpgradesRef.current,
      voidAircraftAutoToggles: voidAircraftAutoTogglesRef.current,
      voidBattleShipStats: voidBattleShipStatsRef.current,
      voidPOIsInspiration: voidPOIsInspirationRef.current,
      voidPOIQCDonations: voidPOIQCDonationsRef.current,
      unlockedVoidAircraft: unlockedVoidAircraftRef.current,
      voidAircraftConstruction: voidAircraftConstructionRef.current,
      voidAutoShipmentUnlocked: voidAutoShipmentUnlockedRef.current,
      voidAutoShipmentActive: voidAutoShipmentActiveRef.current,
      gameTimeSeconds: gameTimeSecondsRef.current,
      earthPopulation: earthPopulationRef.current,
      earthMaleRatio: earthMaleRatioRef.current,
      earthBiodiversity: earthBiodiversityRef.current,
      earthEvents: earthEventsRef.current,
      unlockedAchievements,
      achievementProgress,
      robotRepairProgress: robotRepairProgressRef.current,
      isRobotRepaired: isRobotRepairedRef.current,
      battleShipUpgradeLevel: battleShipUpgradeLevelRef.current,
      colonies
    };

    try {
      const modularSave = SaveManager.createSave(saveData);
      await GameStorage.save(modularSave, 'time_travel_save');
      playSfx('success');
      onReturnToMenu();
    } catch (error) {
      console.error("Failed to save game", error);
      setIsSaving(false);
      addLog('Erro ao salvar progresso!', 'error');
    }
  };

  const getShipNeonBorder = (shipColor: string) => {
    if (shipColor.includes('cyan')) return 'neon-border-cyan';
    if (shipColor.includes('orange')) return 'neon-border-orange';
    if (shipColor.includes('pink')) return 'neon-border-pink';
    if (shipColor.includes('rose')) return 'neon-border-rose';
    if (shipColor.includes('purple') || shipColor.includes('violet') || shipColor.includes('fuchsia')) return 'neon-border-purple';
    if (shipColor.includes('yellow') || shipColor.includes('amber') || shipColor.includes('gold')) return 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    if (shipColor.includes('red')) return 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    if (shipColor.includes('blue') || shipColor.includes('indigo')) return 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
    if (shipColor.includes('emerald') || shipColor.includes('teal')) return 'border-emerald-500/50 shadow-[0_0_15px_rgba(10,185,129,0.3)]';
    return isInterstellar ? 'neon-border-orange' : 'neon-border-cyan';
  };



  // Game Loop
  useEffect(() => {
    const tick = setInterval(() => {
      const isInterstellarLoop = routeTierRef.current === 'Interstellar';
      const isVoidLoop = routeTierRef.current === 'Void';
      const isEarthLoop = routeTierRef.current === 'Earth';

      if (!isLoadedRef.current || isResettingRef.current || isTransitioningRef.current || showRoute2LoreRef.current || showVoidLoreRef.current || voidBattleStatusRef.current === 'fighting') return;

      // 1. Handle Manual Deliveries
      const prev = activeDeliveriesRef.current;
      const manualCompletions: { routeId: string, count: number }[] = [];
      let deliveriesStateChanged = false;
      
      let updatedDeliveries = [...prev];

      const shipsInUse: { [level: number]: number } = {};
      updatedDeliveries.forEach(d => {
        if (d.status === 'delivering') {
          shipsInUse[d.shipLevel] = (shipsInUse[d.shipLevel] || 0) + 1;
        }
      });

      Object.keys(autoTravelActiveRef.current).forEach(routeId => {
        if (autoTravelActiveRef.current[routeId]) {
          const route = ROUTES_MAP.get(routeId);
          if (route) {
            const numSlots = autoTravelSlotsRef.current[routeId] || 0;
            shipsInUse[route.requiredShipLevel] = (shipsInUse[route.requiredShipLevel] || 0) + numSlots;
          }
        }
      });

      updatedDeliveries = updatedDeliveries.map(d => {
        if (d.status === 'queued') {
          const totalOwned = ownedShipsRef.current[`${d.tier}-${d.shipLevel}`] || 0;
          const inUse = shipsInUse[d.shipLevel] || 0;
          if (inUse < totalOwned) {
            shipsInUse[d.shipLevel] = inUse + 1;
            deliveriesStateChanged = true;
            return { ...d, status: 'delivering', startTime: Date.now() };
          }
        }
        return d;
      });

      const nextManual = updatedDeliveries.map(d => {
        if (d.status === 'combat') return d;
        if (d.status !== 'delivering') return d;
        const route = ROUTES_MAP.get(d.routeId);
        if (!route) return d;

        const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
        const engineUpgrade = UPGRADES_MAP.get('engine')!;
        const engineTier = engineUpgrade.tiers.find(t => t.level === locationTech.engine);
        
        let progressIncrement = 0;
        if (engineTier?.level === 5) {
          progressIncrement = 3;
        } else {
          const speedMultiplier = engineTier ? 1 + engineTier.value : 1;
          progressIncrement = speedMultiplier / 4;
        }
        
        let newProgress = d.progress + progressIncrement;
        deliveriesStateChanged = true;
        
        if (newProgress >= 100) {
          manualCompletions.push({ routeId: d.routeId, count: 1 });
          return null;
        }

        return { ...d, progress: newProgress };
      }).filter(d => d !== null);

      if (nextManual.length !== updatedDeliveries.length) deliveriesStateChanged = true;

      // Random Combat Encounter
      const timeSinceLastBattle = Date.now() - lastRandomBattleTimeRef.current;
      const forcedBattle = timeSinceLastBattle > 180000;
      const battleFreqMultiplier = (battleLevelRef.current >= 35 && routeTierRef.current === 'Interstellar') ? 1.5 : 1;
      
      if (routeTierRef.current !== 'Void' && !activeBattleRef.current && !isSpeedRunRef.current && (Math.random() < (0.002 * battleFreqMultiplier) || forcedBattle)) {
        const manualShips = nextManual.filter(d => {
          const r = ROUTES_MAP.get(d.routeId);
          return d.status === 'delivering' && r?.tier === routeTierRef.current;
        });
        const autoRoutes = Object.keys(autoTravelActiveRef.current).filter(rid => {
          const r = ROUTES_MAP.get(rid);
          return autoTravelActiveRef.current[rid] && (autoTravelProgressRef.current[rid] || 0) > 0 && r?.tier === routeTierRef.current;
        });

        if (manualShips.length > 0 || autoRoutes.length > 0) {
          const totalTargets = manualShips.length + autoRoutes.length;
          const targetIndex = Math.floor(Math.random() * totalTargets);
          
          let targetId: string;
          let routeId: string;
          let isAuto = false;
          
          if (targetIndex < manualShips.length) {
            const target = manualShips[targetIndex];
            targetId = target.id;
            routeId = target.routeId;
            target.status = 'combat';
            deliveriesStateChanged = true;
          } else {
            routeId = autoRoutes[targetIndex - manualShips.length];
            targetId = `auto-${routeId}`;
            isAuto = true;
          }

          const route = ROUTES_MAP.get(routeId);
          if (route) {
            const enemyColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
            const minLvl = Math.max(1, Math.floor(battleLevelRef.current * 0.9));
            const maxLvl = Math.max(1, Math.ceil(battleLevelRef.current * 1.1));
            const enemyTier = Math.min(20, Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl);
            
            let bossChance = 0.10 + (battleLevelRef.current >= 15 ? 0.10 : 0);
            if (battleLevelRef.current >= 45 && routeTierRef.current === 'Interstellar') bossChance += 0.25;
            
            const isBoss = Math.random() < bossChance;
            const isElite = !isBoss && enemyTier > 10;
            const enemyType = isBoss ? 'Boss' : (isElite ? 'Elite' : (enemyTier > 5 ? 'Alien' : (Math.random() > 0.5 ? 'Pirate' : 'Alien')));
            
            const enemyHp = (50 + (enemyTier * 60) + Math.floor(Math.random() * 50)) * (isBoss ? 10 : (isElite ? 5 : 1));
            let playerHp = 100 + (battleLevelRef.current * 150);
            if (battleLevelRef.current >= 25) playerHp += 500;

            let playerDps = (10 + battleLevelRef.current * 10) / 2;
            if (battleLevelRef.current >= 20) playerDps *= 1.5;
            if (battleLevelRef.current >= 25) playerDps *= 1.5;

            const enemyDps = ((8 + enemyTier * 6) / 2.5) * (isBoss ? 4 : (isElite ? 2 : 1));
            const playerTimeToKill = enemyHp / playerDps;
            const enemyTimeToKill = playerHp / enemyDps;
            let winProb = Math.min(100, Math.max(0, Math.floor((enemyTimeToKill / (playerTimeToKill + enemyTimeToKill)) * 100)));

            if (isBoss && battleLevelRef.current >= 45 && routeTierRef.current === 'Interstellar') winProb = Math.min(100, winProb + 25);

            const totalWinProb = winProb + getDoomPBonus(doomPLevelRef.current) + getPoliceBonus(privatePoliceLevelRef.current);
            const multipliers = getEconomicMultipliers();
            const rewardMultiplier = isBoss ? 6 : (isElite ? 3 : 1);
            const result = (Math.random() * 100 < totalWinProb) ? 'victory' : 'defeat';
            
            const battle: Battle = {
              id: Math.random().toString(36).substr(2, 9),
              routeId: routeId,
              deliveryId: targetId,
              enemyName: isBoss ? (languageRef.current === 'pt' ? 'Nave MÃƒÆ’E (BOSS)' : 'MOTHER SHIP (BOSS)') : (isElite ? (languageRef.current === 'pt' ? 'Cruzador de Elite' : 'Elite Cruiser') : enemyTier > 5 ? (languageRef.current === 'pt' ? 'Cruzador AlienÃƒÂ­gena' : 'Alien Cruiser') : (enemyType === 'Pirate' ? (languageRef.current === 'pt' ? 'Pirata Espacial' : 'Space Pirate') : (languageRef.current === 'pt' ? 'Batedor AlienÃƒÂ­gena' : 'Alien Scout'))),
              enemyType: enemyType,
              enemyColor: isBoss ? '#ff0000' : (isElite ? '#f59e0b' : enemyTier > 5 ? '#a855f7' : enemyColors[Math.floor(Math.random() * enemyColors.length)]),
              enemyMaxHp: enemyHp,
              enemyHp: enemyHp,
              playerMaxHp: playerHp,
              playerHp: playerHp,
              reward: Math.floor(route.reward * (0.5 + enemyTier * 0.1) * (isBoss ? 5 : (isElite ? 2 : 1)) * multipliers.profit * rewardMultiplier),
              startTime: Date.now(),
              lastPlayerAttack: { laser: 0, plasma: 0, special: 0, shield: 0 },
              lastEnemyAttack: Date.now() + 1000, 
              shieldActive: false,
              lastShieldTime: 0,
              winProbability: winProb,
              enemyTier: enemyTier,
              predeterminedResult: result,
              isCinematicFinished: false,
              playerImage: battleLevelRef.current >= 25 ? '/images/battle/skyring.webp' : '/images/battle/standard_ship.webp',
              enemyImage: isBoss ? '/images/battle/enemy_boss.webp' : (isElite ? '/images/battle/enemy_elite.webp' : enemyTier > 15 ? '/images/battle/enemy_raider.webp' : enemyTier > 5 ? '/images/battle/enemy_alien.webp' : '/images/battle/enemy_scout.webp'),
              playerDps: playerDps,
              enemyDps: (10 + enemyTier * 5) / 2,
              isBoss: isBoss
            };

            lastRandomBattleTimeRef.current = Date.now();
            updateHistoryStats('random_battle_found', 1, routeTierRef.current);
            
            if (battleLevelRef.current >= 30 && routeTierRef.current === 'Interstellar') {
              const isVictory = Math.random() * 100 < winProb;
              if (isVictory) {
                const results = resolveBattleVictory(battle);
                if (isRetributionActiveRef.current) {
                  setBattleNotification({
                    message: languageRef.current === 'pt' ? `Batalha vencida: +${formatValue(results.qcReward)} QC!` : `Battle won: +${formatValue(results.qcReward)} QC!`,
                    type: 'success',
                    tier: routeTierRef.current
                  });
                }
                playSfx('open_window');
              } else {
                resolveBattleDefeat(battle);
                if (isRetributionActiveRef.current) {
                  setBattleNotification({
                    message: languageRef.current === 'pt' ? `Batalha perdida.` : `Battle lost.`,
                    type: 'error',
                    tier: routeTierRef.current
                  });
                }
                playSfx('open_window');
              }
              
              if (!isAuto) {
                const shipIndex = nextManual.findIndex(d => d.id === targetId);
                if (shipIndex !== -1) {
                  nextManual[shipIndex].status = 'delivering';
                  deliveriesStateChanged = true;
                }
              }
              if (isRetributionActiveRef.current) setTimeout(() => setBattleNotification(null), 2000);
            } else {
              if (routeTierRef.current === 'Solar' || routeTierRef.current === 'Interstellar') {
                setUnderAttackBattle(battle);
              } else {
                setFoundBattle(battle);
              }
              addLog(`${t('deliveryUnderAttack')} ${route.destination} ${t('underAttack')}`, 'error');
              playSfx('error');
            }
          }
        }
      }
      if (deliveriesStateChanged) {
        setActiveDeliveries(nextManual);
      }

      if (battleLevelRef.current >= 50 && isFatigueActiveRef.current && routeTierRef.current === 'Interstellar' && aetherionRef.current < 1000 && aetherionTubesRef.current > 0) {
        synthesizeAetherion();
      }

      Object.keys(autoTravelDesiredRef.current).forEach(routeId => {
        if (autoTravelDesiredRef.current[routeId] && !autoTravelActiveRef.current[routeId]) {
          const route = ROUTES_MAP.get(routeId);
          if (!route) return;
          const slots = autoTravelSlotsRef.current[routeId] || 0;
          const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
          const valueUpgrade = UPGRADES_MAP.get('value')!;
          const valueTier = valueUpgrade.tiers.find(v => v.level === locationTech.value);
          const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
          const fuelCost = Math.floor(10 * costIncreaseMultiplier);
          const attemptCost = fuelCost * slots;
          const aetherionTripCost = slots * (routeTierRef.current === 'Interstellar' ? 5 : 4);
          if (aetherionRef.current >= aetherionTripCost && qcRef.current >= attemptCost) setAutoTravelActive(prev => ({ ...prev, [routeId]: true }));
        }
      });

      const nextAutoProgress = { ...autoTravelProgressRef.current };
      const autoCompletedRoutes: { routeId: string, count: number }[] = [];

      Object.keys(autoTravelActiveRef.current).forEach(routeId => {
        if (autoTravelActiveRef.current[routeId]) {
          if (activeBattleRef.current?.deliveryId === `auto-${routeId}`) return;
          const route = ROUTES_MAP.get(routeId);
          if (route) {
            const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
            const currentProgress = nextAutoProgress[routeId] || 0;
            const numSlots = autoTravelSlotsRef.current[routeId] || 0;
            const valueUpgrade = UPGRADES_MAP.get('value')!;
            const valueTier = valueUpgrade.tiers.find(t => t.level === locationTech.value);
            const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
            const fuelCost = Math.floor(10 * costIncreaseMultiplier);

            if (currentProgress === 0) {
              const attemptCost = fuelCost * numSlots;
              const aetherionTripCost = numSlots * (routeTierRef.current === 'Interstellar' ? 5 : 4);
              const requiredLevel = route.requiredShipLevel;
              const totalOwned = ownedShipsRef.current[`${route.tier}-${requiredLevel}`] || 0;
              const manualInUse = activeDeliveriesRef.current.filter(d => d.shipLevel === requiredLevel && d.tier === route.tier && d.status === 'delivering').length;
              let otherAutoInUse = 0;
              Object.keys(autoTravelActiveRef.current).forEach(otherId => {
                if (otherId !== routeId && autoTravelActiveRef.current[otherId]) {
                  const otherRoute = ROUTES_MAP.get(otherId);
                  if (otherRoute && otherRoute.requiredShipLevel === requiredLevel && otherRoute.tier === route.tier) otherAutoInUse += (autoTravelSlotsRef.current[otherId] || 0);
                }
              });

              const canAfford = qcRef.current >= attemptCost && aetherionRef.current >= aetherionTripCost;
              const shipsAvailable = (manualInUse + otherAutoInUse + numSlots) <= totalOwned;

              if (canAfford && shipsAvailable) {
                qcRef.current -= attemptCost;
                aetherionRef.current = Math.max(0, aetherionRef.current - aetherionTripCost);
                updateHistoryStats('spent', attemptCost, routeTierRef.current);
                nextAutoProgress[routeId] = 0.01; 
              } else {
                if (!shipsAvailable && canAfford) return;
                setAutoTravelActive(prev => ({ ...prev, [routeId]: false }));
                if (aetherionRef.current < aetherionTripCost) addLog(t('insufficientAetherion'), 'error');
                return;
              }
            } else {
              const engineUpgrade = UPGRADES_MAP.get('engine')!;
              const engineTier = engineUpgrade.tiers.find(t => t.level === locationTech.engine);
              let progressIncrement = (engineTier?.level === 5 ? 3 : (engineTier ? 1 + engineTier.value : 1) / 4);
              let newProgress = currentProgress + progressIncrement;
              if (newProgress >= 100) {
                const aiUpgrade = UPGRADES_MAP.get('ai')!;
                const aiTier = aiUpgrade.tiers.find(t => t.level === locationTech.ai) || { value: 0.65 };
                let succeeded = 0;
                for (let i = 0; i < numSlots; i++) { if (Math.random() < aiTier.value) succeeded++; }
                if (succeeded > 0) autoCompletedRoutes.push({ routeId, count: succeeded });
                newProgress = 0; 
              }
              nextAutoProgress[routeId] = newProgress;
            }
          }
        }
      });

      const completions: { routeId: string, count: number, isManual: boolean }[] = [
        ...manualCompletions.map(d => ({ ...d, isManual: true })),
        ...autoCompletedRoutes.map(a => ({ ...a, isManual: false }))
      ];

      if (completions.length > 0) {
        let totalRewardBatch = 0;
        const locationUpdates: { [key: string]: number } = {};
        let totalCompletedCount = 0;
        
        completions.forEach(comp => {
          const route = ROUTES_MAP.get(comp.routeId)!;
          const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
          for (let i = 0; i < comp.count; i++) {
            const aiTier = UPGRADES_MAP.get('ai')!.tiers.find(t => t.level === locationTech.ai);
            const isPerfect = Math.random() < (aiTier?.level === 6 ? 0.5 : 0.1); 
            const valueTier = UPGRADES_MAP.get('value')!.tiers.find(t => t.level === locationTech.value);
            const rareTier = UPGRADES_MAP.get('rare')!.tiers.find(t => t.level === locationTech.rare);
            const isRare = Math.random() < (rareTier ? rareTier.value : 0.05);
            let reward = route.reward * (valueTier ? 1 + valueTier.value : 1) * getEconomicMultipliers().profit;
            if (isPerfect) reward *= 1.5;
            if (isRare) reward *= 5;
            if (route.tier === 'Interstellar') reward *= getDoubleRouteMultiplier(doubleRouteLevelRef.current);
            totalRewardBatch += Math.floor(reward);
            locationUpdates[route.destination] = (locationUpdates[route.destination] || 0) + 1;
            totalCompletedCount++;
            if (isPerfect) updateHistoryStats('perfect_delivery', 1, route.tier);
            updateHistoryStats('acquired', Math.floor(reward), route.tier, 'delivery');
          }
        });

        qcRef.current += totalRewardBatch;
        const manualCount = completions.filter(c => c.isManual).reduce((acc, curr) => acc + curr.count, 0);
        const autoCount = completions.filter(c => !c.isManual).reduce((acc, curr) => acc + curr.count, 0);
        if (manualCount > 0) incrementDeliveries('manual', manualCount);
        if (autoCount > 0) incrementDeliveries('auto', autoCount);
        setTotalDeliveries(td => td + totalCompletedCount);
        setDeliveriesByLocation(prevLocs => {
          const nextLocs = { ...prevLocs };
          Object.keys(locationUpdates).forEach(dest => { nextLocs[dest] = (nextLocs[dest] || 0) + locationUpdates[dest]; });
          return nextLocs;
        });

        completions.forEach(c => {
          const route = ROUTES_MAP.get(c.routeId);
          if (route) {
            const shipLevelKey = `delivery-${route.requiredShipLevel}`;
            pendingMissionProgressRef.current[shipLevelKey] = (pendingMissionProgressRef.current[shipLevelKey] || 0) + c.count;
          }
        });
      }

      const nextOres = { ...oresCollectedRef.current };
      let oresChanged = false;
      let miningQcBonus = 0;

      ORES.filter(o => o.tier === routeTierRef.current).forEach(ore => {
        const robots = miningRobotsRef.current[ore.id] || 0;
        if (robots > 0) {
          const level = miningRobotLevelsRef.current[ore.id] || 1;
          const upgrade = ROBOT_UPGRADES_MAP.get(level) || ROBOT_UPGRADES[0];
          const totalRate = robots * (0.5 * upgrade.speedBonus * upgrade.efficiencyBonus * upgrade.productionBonus);
          const currentAmount = nextOres[ore.id] || 0;
          if (currentAmount < ore.packSize) {
            const added = totalRate * 0.15;
            const newAmount = Math.min(ore.packSize, currentAmount + added);
            if (newAmount !== currentAmount) { nextOres[ore.id] = newAmount; oresChanged = true; }
          }

          const autoSellCostPerPack = (routeTierRef.current === 'Interstellar') ? 8 : 10;
          if (aetherionRef.current >= autoSellCostPerPack && autoSellByOreRef.current[ore.id] && nextOres[ore.id] >= ore.packSize) {
            let packs = Math.floor(nextOres[ore.id] / ore.packSize);
            if (packs > 0) {
              if (routeTierRef.current === 'Interstellar') packs = Math.min(5, packs);
              aetherionRef.current = Math.max(0, aetherionRef.current - (packs * autoSellCostPerPack));
              const compressionBonus = 1 + (miningCompressionLevelsRef.current[ore.id] || 0) * 0.5;
              let value = Math.floor(ore.baseValue * ore.rarity * ore.packSize * getEconomicMultipliers().profit * compressionBonus);
              if (routeTierRef.current === 'Interstellar') {
                const miningScale = 15 + Math.min(battleLevelRef.current, 55) * 0.4;
                value *= miningScale;
              }
              miningQcBonus += value * packs;
              const currentStats = historyStatsRef.current[routeTierRef.current];
              historyStatsRef.current = { ...historyStatsRef.current, [routeTierRef.current]: { ...currentStats, autoMiningPacksSold: (currentStats.autoMiningPacksSold || 0) + packs } };
              const wasteToAdd = packs * 300 * (routeTierRef.current === 'Interstellar' ? 1 + (extractionTechLevelRef.current * 0.1) : 1);
              miningWasteRef.current = Math.min(7500, miningWasteRef.current + wasteToAdd);
              nextOres[ore.id] -= packs * ore.packSize;
              oresChanged = true;
              if (activeTabRef.current === 'mining') {
                const rewardId = Math.random().toString(36).substr(2, 9);
                setFloatingRewards(prev => [...prev, { id: rewardId, amount: value * packs, x: window.innerWidth / 2, y: window.innerHeight / 2 }]);
                setTimeout(() => {
                   setFloatingRewards(p => p.filter(r => r.id !== rewardId));
                }, 1000);
              }
              const sellKey = `sell-${ore.id}`;
              pendingMissionProgressRef.current[sellKey] = (pendingMissionProgressRef.current[sellKey] || 0) + packs;
            }
          }
        }
      });

      if (oresChanged) oresCollectedRef.current = nextOres;
      if (miningQcBonus > 0) {
        qcRef.current += miningQcBonus;
        updateHistoryStats('acquired', miningQcBonus, routeTierRef.current, 'mining');
      }

      const researching = researchingTechRef.current;
      if (researching) {
        const tech = TECHNOLOGIES_MAP.get(`${researching.tier}-${researching.level}`);
        if (tech) {
          let researchTime = tech.researchTime * (researching.tier === 'Interstellar' ? 0.5 : 1);
          if (Date.now() - researching.startTime >= researchTime) {
            playSfx('tech_success');
            dispatch({ type: 'UNLOCK_TECH_LEVEL', payload: { tier: researching.tier, level: researching.level } });
            setResearchingTech(null);
            if (isSpeedRunRef.current) dispatch({ type: 'BUY_SHIP', payload: { shipKey: `${tech.tier}-${tech.unlocksShipLevel}` } });
            if (researching.tier === 'Solar' && researching.level === 1) {
              completeInitialMission('init_1');
            }
            addLog(`Technology ${tech.name} unlocked!`, 'success');
          }
        }
      }
      autoTravelProgressRef.current = nextAutoProgress;
    }, 150);

    const flushInterval = setInterval(() => {
      if (!isLoadedRef.current || isResettingRef.current) return;
      const currentQc = qcRef.current;
      if (Math.abs(currentQc - lastFlushedQcRef.current) > 0.01) { dispatch({ type: 'EARN_QC', payload: { amount: currentQc - lastFlushedQcRef.current, source: 'delivery' } }); lastFlushedQcRef.current = currentQc; }
      const currentAetherion = aetherionRef.current;
      if (Math.abs(currentAetherion - lastFlushedAetherionRef.current) > 0.01) { dispatch({ type: 'EARN_AETHERION', payload: { amount: currentAetherion - lastFlushedAetherionRef.current } }); lastFlushedAetherionRef.current = currentAetherion; }
      if (Math.abs(miningWasteRef.current - lastFlushedWasteRef.current) > 0.01) { dispatch({ type: 'EARN_RESOURCES', payload: { miningWaste: miningWasteRef.current - lastFlushedWasteRef.current } }); lastFlushedWasteRef.current = miningWasteRef.current; }
      if (Math.abs(solarEnergyRef.current - lastFlushedSolarRef.current) > 0.01) { dispatch({ type: 'EARN_RESOURCES', payload: { solarEnergy: solarEnergyRef.current - lastFlushedSolarRef.current } }); lastFlushedSolarRef.current = solarEnergyRef.current; }
      if (Math.abs(aetherionTubesRef.current - lastFlushedTubesRef.current) > 0.01) { dispatch({ type: 'EARN_RESOURCES', payload: { aetherionTubes: aetherionTubesRef.current - lastFlushedTubesRef.current } }); lastFlushedTubesRef.current = aetherionTubesRef.current; }
      dispatch({ type: 'SET_HISTORY_STATS', payload: { stats: historyStatsRef.current } });
      dispatch({ type: 'SET_ORES_COLLECTED', payload: { ores: oresCollectedRef.current } });
      setAutoTravelProgress({ ...autoTravelProgressRef.current });


      missionFlushCounterRef.current++;
      if (missionFlushCounterRef.current >= 4) {
        missionFlushCounterRef.current = 0;
        const progress = pendingMissionProgressRef.current;
        if (Object.keys(progress).length > 0) {
          pendingMissionProgressRef.current = {};
          setMissions(prev => prev.map(m => {
            if (m.completed) return m;
            let count = (m.type === 'delivery' ? progress[`delivery-${m.shipLevel}`] : (m.type === 'sell' ? progress[`sell-${m.oreId}`] : 0));
            if (count > 0) { const newCurrent = Math.min(m.target, m.current + count); return { ...m, current: newCurrent, completed: newCurrent >= m.target }; }
            return m;
          }));
        }
        if (autoClaimMissionsRef.current) {
          const completedMission = missionsRef.current.find(m => m.completed && !m.claimed);
          if (completedMission) claimMission(completedMission.id, undefined, true);
        }
      }
    }, 500);

    return () => { clearInterval(tick); clearInterval(flushInterval); };
  }, []);


  // Tutorial Trigger
  useEffect(() => {
    if (!isLoaded) return;
    
    // Small delay to ensure seenTutorials state is fully updated from localStorage
    const timeout = setTimeout(() => {
      if (['mining', 'aircraft', 'upgrades', 'auto', 'routes2', 'technology', 'missions', 'history'].includes(activeTab)) {
        if (!seenTutorials[activeTab]) {
          setActiveTutorial(activeTab);
          playSfx('tutorial_open');
        }
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [activeTab, seenTutorials, isLoaded]);

  // Fliperamas Tutorial Trigger
  useEffect(() => {
    if (activeTab === 'mini_games' && routeTier === 'Earth' && !seenTutorials['fliperamas']) {
      const timer = setTimeout(() => {
        setShowFliperamasTutorial(true);
        completeTutorial('fliperamas');
        playSfx('tutorial_open');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, routeTier, seenTutorials, completeTutorial, playSfx]);

  const closeTutorial = () => {
    if (activeTutorial) {
      completeTutorial(activeTutorial);
      setActiveTutorial(null);
    }
  };

  const isRouteUnlocked = (route: Route) => {
    const { unlockCondition } = route;
    if (!unlockCondition) return true;
    if (unlockCondition.initial) return true;

    if (unlockCondition.route2Unlocked && !isRoute2Unlocked()) return false;

    // Check if player has the required ship level
    const hasRequiredShip = (ownedShips[`${route.tier}-${route.requiredShipLevel}`] || 0) > 0;
    if (!hasRequiredShip) return false;

    return true;
  };

  const buyRoute = (route: Route) => {
    if (unlockedRouteIds.includes(route.id)) return;
    
    const conditionsMet = isRouteUnlocked(route);
    if (!conditionsMet) {
      addLog(`Route ${route.name} is still locked`, 'warning');
      return;
    }

    const cost = route.unlockCost || 0;
    if (qc >= cost) {
      dispatch({ type: 'SPEND_QC', payload: { amount: cost } });
      dispatch({ type: 'UNLOCK_ROUTE', payload: { routeId: route.id } });
      updateHistoryStats('spent', cost, route.tier);
      
      if (route.tier === 'Solar') playSfx('start_engine_1');
      else if (route.tier === 'Interstellar') playSfx('start_engine_2');
      else playSfx('buy');

      addLog(`Route ${route.name} unlocked!`, 'success');
    } else {
      addLog(`Not enough QC to unlock ${route.name}`, 'error');
    }
  };

  const buyUpgrade = (locationId: string, upgrade: Upgrade) => {
    const locationTech = techLevels[locationId] || { engine: 0, ai: 0, value: 0, rare: 0 };
    const currentLevel = locationTech[upgrade.id.toLowerCase()] || 0;
    const nextTier = upgrade.tiers.find(t => t.level === currentLevel + 1);

    if (!nextTier) return;

    // Engine Level 5 requirement: 5 auto slots
    if (upgrade.id === 'engine' && nextTier.level === 5) {
      const slots = autoTravelSlots[locationId] || 0;
      if (slots < 5) {
        addLog('Need 5 auto slots for Engine Level 5', 'warning');
        return;
      }
    }

    const multiplier = getLocationMultiplier(locationId);
    const multipliers = getEconomicMultipliers();
    let cost = Math.floor(nextTier.cost * multiplier * multipliers.cost);
    if (routeTier === 'Interstellar') cost = Math.floor(cost * 1.5);
    
    if (qc >= cost) {
      dispatch({ type: 'SPEND_QC', payload: { amount: cost } });
      dispatch({ type: 'UPGRADE_TECH', payload: { locationId, category: upgrade.id.toLowerCase() } });
      updateHistoryStats('spent', cost, routeTier);

      if (upgrade.id === 'engine' && currentLevel === 0) {
        completeInitialMission('init_3');
      }
      playSfx('level_up');
      addLog(`${upgrade.name} upgraded to Level ${currentLevel + 1}`, 'success');
    } else {
      addLog(`Not enough QC for ${upgrade.name} upgrade`, 'error');
    }
  };




  const toggleAutoTravel = (routeId: string) => {
    const isActivating = !autoTravelDesired[routeId];
    const slots = autoTravelSlots[routeId] || 0;
    
    if (isActivating && slots === 0) {
      return;
    }
    
    setAutoTravelDesired(prev => ({ ...prev, [routeId]: isActivating }));
    setAutoTravelActive(prev => ({ ...prev, [routeId]: isActivating }));
    playSfx(isActivating ? 'open_window' : 'close_window');
  };

  const buyAutoTravelSlot = useCallback((routeId: string) => {
    const currentSlots = autoTravelSlots[routeId] || 0;
    if (currentSlots >= 5) return;

    const route = ROUTES_MAP.get(routeId)!;
    const slotCosts = [1000, 5000, 10000, 15000, 20000];
    const multipliers = getEconomicMultipliers();
    const cost = Math.floor(
      slotCosts[currentSlots]
      * getLocationMultiplier(routeId)
      * multipliers.cost
      * (route.tier === 'Interstellar' ? 2 : 1)
    );

    if (qc < cost) {
      playSfx('error');
      addLog('Insufficient QC for auto-travel slot', 'error');
      return;
    }

    const aetherionRequired = (currentSlots + 1) * 2;
    if (aetherion < aetherionRequired && route.id !== 'speed_run') {
      playSfx('error');
      addLog(`Need ${aetherionRequired} Aetherion for this slot`, 'error');
      return;
    }

    // TransaÃƒÂ§ÃƒÂ£o atÃƒÂ´mica: gasta QC e adiciona slot
    dispatch({ type: 'SPEND_QC',    payload: { amount: cost } });
    dispatch({ type: 'BUY_AUTO_SLOT', payload: { routeId } });
    updateHistoryStats('spent', cost, routeTier);

    completeInitialMission('init_5');
    playSfx('buying_iten');
    addLog(`Auto-travel slot ${currentSlots + 1} purchased for ${route.name}`, 'success');
  }, [dispatch, qc, aetherion, autoTravelSlots,
      playSfx, addLog, getEconomicMultipliers, updateHistoryStats, routeTier, completeInitialMission]);

  const getAutoTravelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]';
      case 2: return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]';
      case 3: return 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]';
      case 4: return 'bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.6)]';
      case 5: return 'bg-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.8)]';
      default: return 'bg-slate-700';
    }
  };

  // Void Aircraft Mission Loop
  useEffect(() => {
    if (routeTier !== 'Void') return;

    const interval = setInterval(() => {
      const now = Date.now();
      setVoidAircraftMissions(prev => {
        let changed = false;
        const next = { ...prev };

        Object.entries(next).forEach(([id, mission]) => {
          if (mission.status === 'mission' && mission.endTime && now >= mission.endTime) {
            // Mission complete
            const upgrades = voidAircraftUpgrades[id];
            next[id] = { 
              status: 'idle', 
              endTime: null, 
              rareFound: mission.rareFound,
              restartAt: (upgrades.auto === 1 && voidAircraftAutoToggles[id]) ? Date.now() + 2000 : null
            };
            changed = true;

            const aircraft = VOID_AIRCRAFT.find(a => a.id === id)!;
            // Calculate rewards
            const baseCapacity = aircraft.capacity * (1 + upgrades.storage * 0.2); // 20% per level
            let amount = Math.floor(baseCapacity);

            // Aproveitamento (Quality) Logic: 35% base + 10% chance per level
            // If triggered, increases total resources by 20% to 80%
            const aproveitamentoChance = 0.35 + (upgrades.quality * 0.10);
            if (Math.random() < aproveitamentoChance) {
              const bonusPercent = 0.2 + (Math.random() * 0.6); // 20% to 80%
              amount = Math.floor(amount * (1 + bonusPercent));
              addLog(`${t('efficiencyCaps')}: ${aircraft.name} ${t('extraResourcesFound')} (+${Math.round(bonusPercent * 100)}%)!`, 'success');
            }

            // Distribute resources equally but with variation
            // Resources: minerals, energy, food, tech, meds
            const resourceTypes = ['minerals', 'energy', 'food', 'tech', 'meds'];
            let remainingAmount = amount;
            const rewards: { [key: string]: number } = {};

            resourceTypes.forEach((type, index) => {
              if (index === resourceTypes.length - 1) {
                rewards[type] = remainingAmount;
              } else {
                // Random portion of remaining, but trying to keep it somewhat balanced
                const average = amount / resourceTypes.length;
                const variation = average * 0.4; // 40% variation
                const portion = Math.max(1, Math.floor(average + (Math.random() * variation * 2 - variation)));
                const finalPortion = Math.min(remainingAmount - (resourceTypes.length - 1 - index), portion);
                rewards[type] = finalPortion;
                remainingAmount -= finalPortion;
              }
            });

            setVoidResources(prevRes => {
              const nextRes = { ...prevRes };
              Object.entries(rewards).forEach(([type, val]) => {
                nextRes[type as keyof typeof nextRes] = (nextRes[type as keyof typeof nextRes] || 0) + val;
              });
              return nextRes;
            });

            addLog(`${t('missionCompletedBy')} ${aircraft.name}: +${amount} ${t('totalResources')}`, 'success');
            playSfx('success');
          } else if (mission.status === 'idle' && mission.restartAt && now >= mission.restartAt) {
            // Auto-restart
            const aircraft = VOID_AIRCRAFT.find(a => a.id === id)!;
            const upgrades = voidAircraftUpgrades[id];
            const timeReduction = upgrades.time * 0.1;
            const actualTime = aircraft.missionTime * (1 - timeReduction);
            
            next[id] = {
              ...mission,
              status: 'mission',
              endTime: Date.now() + actualTime,
              restartAt: null
            };
            changed = true;
            addLog(`${t('autoRestarting')} ${aircraft.name}...`, 'info');
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [routeTier, voidAircraftUpgrades, voidAircraftAutoToggles, playSfx, addLog, t]);









  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      
      setVoidAircraftConstruction(prev => {
        if (Object.keys(prev).length === 0) return prev;
        
        const next = { ...prev };
        Object.entries(next).forEach(([id, construction]) => {
          if (now >= construction.endTime) {
            delete next[id];
            setUnlockedVoidAircraft(prevUnlocked => {
              if (prevUnlocked.includes(id)) return prevUnlocked;
              return [...prevUnlocked, id];
            });
            addLog(language === 'pt' ? `ConstruÃƒÂ§ÃƒÂ£o da ${id === 'va-2' ? 'Collector-Beta' : 'Ghost-Gamma'} concluÃƒÂ­da!` : `Construction of ${id === 'va-2' ? 'Collector-Beta' : 'Ghost-Gamma'} completed!`, 'success');
            playSfx('success');
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [language, playSfx, addLog]);



  const getEffectiveVoidStats = (stats: any) => {
    const rarityBonus = {
      common: 0,
      rare: 0.05,
      elite: 0.10,
      legendary: 0.15,
      mythic: 0.20
    }[stats.rarity as 'common' | 'rare' | 'elite' | 'legendary' | 'mythic'] || 0;

    const shipUpgradeDmgMult = 1 + (battleShipUpgradeLevelRef.current * 0.2); // +20% per level
    const shipUpgradeCritBonus = battleShipUpgradeLevelRef.current * 200; // +200 crit damage per level

    return {
      ...stats,
      damage: stats.damage * (1 + rarityBonus) * shipUpgradeDmgMult,
      maxHp: stats.maxHp * (1 + rarityBonus),
      maxShield: stats.maxShield * (1 + rarityBonus),
      critChance: stats.critChance * (1 + rarityBonus),
      critDamageBonus: shipUpgradeCritBonus
    };
  };

  const repairVoidBattleShip = () => {
    const effectiveStats = getEffectiveVoidStats(voidBattleShipStats);
    const missingHp = effectiveStats.maxHp - voidBattleShipStats.hp;
    const missingShield = effectiveStats.maxShield - voidBattleShipStats.shield;
    
    if (missingHp <= 0 && missingShield <= 0) return;

    // Base cost for shield repair: 1000 energy and 1000 tech
    // If hull also needs repair, cost increases by 50% (1500 total)
    let energyCost = 1000;
    let techCost = 1000;

    if (missingHp > 0) {
      energyCost = 1500;
      techCost = 1500;
    }

    if ((voidResources?.energy || 0) < energyCost || (voidResources?.tech || 0) < techCost) {
      addLog(t('insufficientResourcesForRepair'), 'error');
      return;
    }

    setVoidResources(prev => ({
      ...prev,
      energy: (prev?.energy || 0) - energyCost,
      tech: (prev?.tech || 0) - techCost
    }));

    setVoidBattleShipStats(prev => {
      const eff = getEffectiveVoidStats(prev);
      return {
        ...prev,
        shield: eff.maxShield,
        hp: eff.maxHp
      };
    });

    playSfx('heal_ship');
    addLog(t('shipRepaired'), 'success');
  };

  const upgradeVoidBattleShip = (type: 'damage' | 'shield' | 'crit' | 'loot') => {
    const getUpgradeCost = (level: number) => {
      if (level < 5) {
        return [
          { tech: 100, energy: 100, minerals: 100 },
          { tech: 350, energy: 350, minerals: 350 },
          { tech: 600, energy: 600, minerals: 600 },
          { tech: 850, energy: 850, minerals: 850 },
          { tech: 1150, energy: 1150, minerals: 1150 }
        ][level];
      }
      const mult = level - 4;
      return {
        tech: 1150 + mult * 500,
        energy: 1150 + mult * 500,
        minerals: 1150 + mult * 500
      };
    };

    const currentLevel = voidBattleShipStats.upgrades[type];
    const maxLevel = 5 + (battleShipUpgradeLevelRef.current * 10);

    if (isVoidWarActive || voidWarAlertActive) {
      addLog(t('cannotUpgradeDuringAttack' as any), 'error');
      playSfx('error');
      return;
    }

    if (currentLevel >= maxLevel) {
      addLog(t('maxLevelReached'), 'warning');
      return;
    }

    const cost = getUpgradeCost(currentLevel);
    if (!cost) return;
    
    if ((voidResources?.tech || 0) >= cost.tech && (voidResources?.energy || 0) >= cost.energy && (voidResources?.minerals || 0) >= cost.minerals) {
      setVoidResources(prev => ({
        ...prev,
        tech: (prev?.tech || 0) - cost.tech,
        energy: (prev?.energy || 0) - cost.energy,
        minerals: (prev?.minerals || 0) - cost.minerals
      }));

      setVoidBattleShipStats(prev => {
        const next = { ...prev };
        next.upgrades[type] = currentLevel + 1;
        
        if (type === 'damage') next.damage = 100 * (1 + next.upgrades.damage * 0.10);
        if (type === 'shield') {
          next.maxShield = 1000 * (1 + next.upgrades.shield * 0.15);
          next.shield = next.maxShield;
        }
        if (type === 'crit') next.critChance = 0.10 + (next.upgrades.crit * 0.10);
        if (type === 'loot') next.lootEfficiency = 0.8 + (next.upgrades.loot * 0.25);
        
        return next;
      });

      const sfxMap = {
        damage: 'laser_up',
        shield: 'shield_up',
        crit: 'target_up',
        loot: 'cash_register'
      };
      playSfx(sfxMap[type] as any || 'buy');
      const names = {
        damage: t('weaponSystem'),
        shield: t('reinforcedShields'),
        crit: t('weaknessScanner'),
        loot: t('avarice')
      };
      addLog(`${t('aircraftUpgradeComplete')} ${names[type]} ${t('completedExclamation')}`, 'success');
    } else {
      addLog(t('insufficientResourcesForCombatUpgrade'), 'error');
      playSfx('error');
    }
  };

  const handleRepairRobot = () => {
    if (isRobotRepaired || isRepairingRobot) return;

    const energyCost = 2500;
    const techCost = 2500;
    
    if (voidResources.energy < energyCost || voidResources.tech < techCost) {
      addLog(t('insufficientResourcesForRepair'), 'error');
      playSfx('error');
      return;
    }
    
    setVoidResources(prev => ({
      ...prev,
      energy: prev.energy - energyCost,
      tech: prev.tech - techCost
    }));
    
    setIsRepairingRobot(true);
    setRobotRepairProgress(0);
    playSfx('saving_robot_event');
    
    const duration = 21000; // 21 seconds
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setRobotRepairProgress(progress);
      
      if (progress >= 100) {
        setIsRobotRepaired(true);
        setIsRepairingRobot(false);
        playSfx('success');
        addLog(language === 'pt' ? 'Sistemas do RobÃ´ Restaurados!' : 'Robot systems fully restored!', 'success');
        clearInterval(interval);
      }
    }, 100);
  };

  const handleUpgradeRoute3BattleShip = () => {
    const level = battleShipUpgradeLevel;
    const energyCost = 1000 * (level + 1) * (level + 1);
    const techCost = 500 * (level + 1) * (level + 1);
    
    if (voidResources.energy < energyCost || voidResources.tech < techCost) {
      addLog(t('insufficientResourcesForCombatUpgrade'), 'error');
      playSfx('low_to_upgrade');
      return;
    }
    
    setVoidResources(prev => ({
      ...prev,
      energy: prev.energy - energyCost,
      tech: prev.tech - techCost
    }));
    
    setBattleShipUpgradeLevel(prev => prev + 1);
    playSfx('level_up');
    addLog(`${t('shipUpgradedTo')} Level ${level + 1}!`, 'success');
  };

  const upgradeVoidBattleShipRarity = () => {
    const rarities: ('common' | 'rare' | 'elite' | 'legendary' | 'mythic')[] = ['common', 'rare', 'elite', 'legendary', 'mythic'];
    const currentIndex = rarities.indexOf(voidBattleShipStats.rarity);
    if (currentIndex >= rarities.length - 1) return;
    
    const nextRarity = rarities[currentIndex + 1];
    const costs = {
      rare: { tech: 5000, energy: 5000 },
      elite: { tech: 10000, energy: 10000 },
      legendary: { tech: 15000, energy: 15000 },
      mythic: { tech: 20000, energy: 20000 }
    };
    
    const cost = costs[nextRarity as keyof typeof costs];
    if (!cost) return;

    if ((voidResources?.tech || 0) < cost.tech || (voidResources?.energy || 0) < cost.energy) {
      addLog(t('insufficientResourcesForCombatUpgrade'), 'error');
      return;
    }
    
    setVoidResources(prev => ({
      ...prev,
      tech: (prev?.tech || 0) - cost.tech,
      energy: (prev?.energy || 0) - cost.energy
    }));
    
    setVoidBattleShipStats(prev => ({
      ...prev,
      rarity: nextRarity
    }));
    
    playSfx('epic_battle_ship');
    addLog(`${t('shipUpgradedTo')} ${nextRarity.toUpperCase()}!`, 'success');
  };

  const startVoidBattle = (warType?: 'normal' | 'elite' | 'boss', forcedLocationId?: number) => {
    if (voidBattleShipStats.hp <= 0) {
      addLog(t('shipTooDamaged'), 'error');
      return;
    }

    const locId = forcedLocationId !== undefined 
      ? forcedLocationId 
      : (voidWarAlertActive ? (1 + Math.floor(Math.random() * 9)) : 0);
    const locKey = locId === 0 ? 'zero' : locId;
    setCurrentVoidLocationId(locId);

    if (warType || voidWarAlertActive) {
      playSfx('kill_enemys_botton');
    } else {
      playSfx('bip_scanner');
    }

    if (warType || isFirstInvasionBattle) {
      // Direct battle for Void War
      const actualWarType = isFirstInvasionBattle ? 'boss' : warType;
      if (isFirstInvasionBattle) setIsFirstInvasionBattle(false);

      const waveEnemies: VoidBattleEnemy[] = [];
      const numWaves = 5;

      for (let i = 0; i < numWaves; i++) {
        let type: 'Padrão' | 'Elite' | 'Boss';
        let stats;
        
        if (actualWarType === 'boss') {
          type = i < 4 ? 'Elite' : 'Boss';
        } else {
          type = i < 4 ? 'Padrão' : 'Elite';
        }

        if (type === 'Padrão') {
          const hp = 90000 * 0.375;
          stats = { hp: hp, maxHp: hp, shield: hp, maxShield: hp, damage: (30 + Math.random() * 20) * 2, qc: 50000 };
        } else if (type === 'Elite') {
          const hp = 225000 * 0.375;
          stats = { hp: hp, maxHp: hp, shield: hp, maxShield: hp, damage: (60 + Math.random() * 20) * 2, qc: 150000 };
        } else {
          let hp = 390000 * 0.375;
          let shield = hp;
          stats = { hp: hp, maxHp: hp, shield: shield, maxShield: shield, damage: (100 + Math.random() * 20) * 2, qc: 500000 };
        }

        const enemy: VoidBattleEnemy = {
          id: `war-enemy-${Date.now()}-${i}`,
          type,
          name: type === 'Padrão' ? 'Aberração' : type === 'Elite' ? 'Horror Dimensional' : 'Devorador de Estrelas',
          ...stats,
          x: 80,
          y: 50,
          image: routeTier === 'Void' 
            ? (type === 'Padrão' 
                ? `/assets/rota3/void/${locKey}/monster-common-${Math.floor(Math.random() * 4) + 1}_neutral.webp` 
                : type === 'Elite' 
                  ? `/assets/rota3/void/${locKey}/monster-elite_neutral.webp` 
                  : `/assets/rota3/void/${locKey}/boss_neutral.webp`)
            : (type === 'Padrão' 
                ? `/images/ships/battle/enemy-common-${Math.floor(Math.random() * 4) + 1}.webp` 
                : type === 'Elite' 
                  ? '/images/ships/battle/enemy-elite.webp' 
                  : '/images/ships/battle/enemy-boss.webp')
        };
        waveEnemies.push(enemy);
      }

      const initialEnemy = waveEnemies.shift();
      if (!initialEnemy) return;

      setVoidBattleOptions([initialEnemy]);
      setVoidBattleStatus('fighting');
      setActiveVoidBattle({
        enemies: [initialEnemy],
        enemyQueue: waveEnemies,
        projectiles: [],
        particles: [],
        damageNumbers: [],
        keysPressed: new Set<string>(),
        playerX: 10,
        playerY: 50,
        lastShot: 0,
        lastEnemyShot: 0,
        lastEnemyMove: Date.now(),
        lastEnemyAttack: Date.now(),
        isGroupBattle: false,
        playerImage: voidBattleShipStats.rarity === 'mythic' ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player-battle.webp',
        playerHp: voidBattleShipStats.hp,
        playerMaxHp: voidBattleShipStats.maxHp,
        playerShield: voidBattleShipStats.shield,
        playerMaxShield: voidBattleShipStats.maxShield,
        abilities: {
          dodge: { lastUsed: 0, cooldown: 3000 },
          shield: { lastUsed: 0, cooldown: 15000 },
          burst: { lastUsed: 0, cooldown: 8000 },
          special: { lastUsed: 0, cooldown: 15000, activeUntil: 0 }
        },
        locationId: locId,
        totalRewardAccumulated: 0,
        finishTimer: 0,
        zoomTarget: { x: 50, y: 50 },
        isSlowMo: false
      });
      
      const engagementMsg = language === 'pt'
        ? `Iniciando incursão no setor. Enfrente as 5 ondas de inimigos!`
        : `Starting sector incursion. Face all 5 enemy waves!`;
        
      addLog(engagementMsg, 'warning');
      return;
    }

    setVoidBattleStatus('searching');
    addLog(t('scanningForTargets'), 'info');

    setTimeout(() => {
      const numOptions = 2 + Math.floor(Math.random() * 4); // 2 to 5
      const options: VoidBattleEnemy[] = [];

      const rarityBossBonus = {
        common: 0,
        rare: 0.15,
        elite: 0.20,
        legendary: 0.25,
        mythic: 0.35
      }[voidBattleShipStats.rarity] || 0;

      for (let i = 0; i < numOptions; i++) {
        const roll = Math.random();
        let type: 'Padrão' | 'Elite' | 'Boss';
        let stats;

        const bossThreshold = 0.85 - rarityBossBonus;
        const eliteThreshold = 0.50 - (rarityBossBonus / 2);

        if (roll < eliteThreshold) {
          type = 'Padrão';
          stats = {
            hp: 9000 * 0.75,
            maxHp: 9000 * 0.75,
            shield: 400 * 0.75,
            maxShield: 400 * 0.75,
            damage: 30 + Math.random() * 20,
            qc: 5000 + Math.random() * 45000
          };
        } else if (roll < bossThreshold) {
          type = 'Elite';
          stats = {
            hp: 15000 * 0.75,
            maxHp: 15000 * 0.75,
            shield: 800 * 0.75,
            maxShield: 800 * 0.75,
            damage: 60 + Math.random() * 20,
            qc: 25000 + Math.random() * 75000
          };
        } else {
          type = 'Boss';
          stats = {
            hp: 19500 * 0.75,
            maxHp: 19500 * 0.75,
            shield: 1000 * 0.75,
            maxShield: 1000 * 0.75,
            damage: 100 + Math.random() * 20,
            qc: 150000 + Math.random() * 100000
          };
        }

        let monsterName: string = type;
        let imagePath = '';

        if (isVoid) {
          monsterName = type === 'Padrão' ? 'Aberração' : type === 'Elite' ? 'Horror Dimensional' : 'Devorador de Estrelas';
          imagePath = type === 'Padrão' 
            ? `/assets/rota3/void/${locKey}/monster-common-${Math.floor(Math.random() * 4) + 1}_neutral.webp` 
            : type === 'Elite' 
              ? `/assets/rota3/void/${locKey}/monster-elite_neutral.webp` 
              : `/assets/rota3/void/${locKey}/boss_neutral.webp`;
        } else {
          imagePath = type === 'Padrão' ? `/images/ships/battle/enemy-common-${Math.floor(Math.random() * 4) + 1}.webp` : type === 'Elite' ? '/images/ships/battle/enemy-elite.webp' : '/images/ships/battle/enemy-boss.webp';
        }

        options.push({
          id: `enemy-${Date.now()}-${i}`,
          type,
          name: monsterName,
          ...stats,
          x: 80,
          y: 20 + (i * 15), // Distribute them vertically
          image: imagePath
        });
      }

      setVoidBattleOptions(options);
      setVoidBattleStatus('choosing');
      addLog(`${numOptions} ${routeTier === 'Void' ? 'Criaturas detectadas no radar' : t('targetsDetectedOnRadar')}`, 'warning');
    }, 3000);
  };

  const selectVoidBattle = (enemy: VoidBattleEnemy) => {
    // Bosses always appear alone. Only Standard and Elite can be in groups.
    const isGroup = enemy.type !== 'Boss' && Math.random() < 0.15;
    const enemies: VoidBattleEnemy[] = [{ ...enemy, vx: 0, vy: 0 }];
    
    if (isGroup) {
      const extraCount = 1 + Math.floor(Math.random() * 2); // 1 or 2 extra (total 2 or 3)
      for (let i = 0; i < extraCount; i++) {
        enemies.push({
          ...enemy,
          id: `${enemy.id}-group-${i}`,
          y: enemy.y + (i + 1) * 15 // Offset them vertically from the lead enemy
        });
      }
    }

    setVoidBattleStatus('fighting');
    setActiveVoidBattle({
      enemies,
      playerX: 10,
      playerY: 50,
      projectiles: [],
      particles: [],
      damageNumbers: [],
      lastEnemyMove: Date.now(),
      lastEnemyAttack: Date.now(),
      isGroupBattle: isGroup,
      playerImage: voidBattleShipStats.rarity === 'mythic' ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player-battle.webp',
      playerHp: voidBattleShipStats.hp,
      playerMaxHp: voidBattleShipStats.maxHp,
      playerShield: voidBattleShipStats.shield,
      playerMaxShield: voidBattleShipStats.maxShield,
      abilities: {
        dodge: { lastUsed: 0, cooldown: 3000 },
        shield: { lastUsed: 0, cooldown: 15000 },
        burst: { lastUsed: 0, cooldown: 8000 },
        special: { lastUsed: 0, cooldown: 15000, activeUntil: 0 }
      },
      keysPressed: new Set(),
      // Use the locationId determined when searching started
      locationId: currentVoidLocationId,
      finishTimer: 0,
      zoomTarget: { x: 50, y: 50 },
      isSlowMo: false
    });
    
    const engagementMsg = routeTier === 'Void' 
      ? `Engajando Criatura: ${enemy.name}. Prepare-se!`
      : `${t('engagingShip')} ${enemy.type}. ${t('prepareForCombat')}`;
      
    addLog(isGroup ? (routeTier === 'Void' ? 'Emboscada detectada! Múltiplas criaturas!' : t('ambushDetected')) : engagementMsg, 'warning');
    playSfx('click');
  };

  // Note: Combat logic and keyboard listeners moved to isolated VoidBattleArena component for performance.


  // Void Passive Generation Loop
  useEffect(() => {
    if (routeTier !== 'Void') return;

    const interval = setInterval(() => {
      // 1. Resource Generation for Player
      setVoidResources(prev => {
        const next = { ...prev };
        let changed = false;
        
        VOID_POIS.forEach(poi => {
          // Standard Inspiration Generation
          const poiStats = voidPOIsInspiration[poi.id] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
          const totalProgress = Object.values(poiStats).reduce((a, b) => a + b, 0);
          if (totalProgress >= 100) {
            const gen = poi.passiveGeneration;
            const resourceKey = gen.resource === 'Energia' ? 'energy' : 
                               gen.resource === 'Alimentos' ? 'food' :
                               gen.resource === 'Tecnologia' ? 'tech' : 
                               gen.resource === 'Medicamentos' ? 'meds' : 'minerals';
            
            next[resourceKey] += gen.amount;
            changed = true;
          }

          // QC Donation Generation: 5 units per second per level (100k QC)
          // Interval is 5s, so 25 units per level every 5s
          const qcLevel = voidPOIQCDonations[poi.id] || 0;
          if (qcLevel > 0) {
            const resourceTypes: (keyof typeof voidResources)[] = ['minerals', 'energy', 'food', 'tech', 'meds'];
            const randomRes = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            const bonusAmount = qcLevel * 25;
            next[randomRes] += bonusAmount;
            changed = true;
          }
        });
        
        return changed ? next : prev;
      });

      // 2. Contribution to Earth Project
      setEarthReconstructionProgress(prev => {
        const next = { ...prev };
        let changed = false;
        
        VOID_POIS.forEach(poi => {
          const poiStats = voidPOIsInspiration[poi.id] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
          const totalProgress = Object.values(poiStats).reduce((a, b) => a + b, 0);
          if (totalProgress >= 100) {
            // Each inspired POI adds 0.1% to all Earth categories every 5s
            Object.keys(next).forEach(cat => {
              if (next[cat] < 100) {
                next[cat] = Math.min(100, next[cat] + 0.1);
                changed = true;
              }
            });
          }
        });
        
        return changed ? next : prev;
      });
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [routeTier, voidPOIsInspiration, voidPOIQCDonations]);

  const donateQCToPOI = (poiId: string) => {
    const cost = 10000;
    const currentDonations = voidPOIQCDonations[poiId] || 0;
    const maxDonations = 10;

    if (currentDonations >= maxDonations) {
      addLog(t('maxDonationReached'), 'warning');
      return;
    }

    if (qc < cost) {
      addLog(t('insufficientQCForDonation'), 'error');
      return;
    }

    setQc(prev => prev - cost);
    setVoidPOIQCDonations(prev => ({
      ...prev,
      [poiId]: currentDonations + 1
    }));

    playSfx('level_up');
    addLog(`${t('qcDonationSuccess')} ${VOID_POIS.find(p => p.id === poiId)?.name}.`, 'success');
  };

  const donateToPOI = (poiId: string, resourceName: string) => {
    const resourceMap: { [key: string]: keyof typeof voidResources } = {
      'MinÃƒÂ©rios': 'minerals',
      'Energia': 'energy',
      'Alimentos': 'food',
      'Tecnologia': 'tech',
      'Medicamentos': 'meds'
    };
    const resourceKey = resourceMap[resourceName];
    const amountToDonate = 10;
    
    const mode = voidDonationModes[poiId] || '1x';
    let multiplier = 1;
    if (mode === '10x') multiplier = 10;
    
    const poi = VOID_POIS.find(p => p.id === poiId)!;
    const incrementPerDonation = resourceName === poi.need ? 0.2 : 0.1;

    if (mode === 'max') {
      const currentPOIStats = voidPOIsInspiration[poiId] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
      const currentResProgress = currentPOIStats[resourceKey] || 0;
      const neededProgress = 20 - currentResProgress;
      if (neededProgress <= 0) {
        addLog(t('donationLimitReached'), 'warning');
        return;
      }
      const neededDonations = Math.ceil(neededProgress / incrementPerDonation);
      const affordableDonations = Math.floor(voidResources[resourceKey] / amountToDonate);
      multiplier = Math.min(neededDonations, affordableDonations);
      if (multiplier <= 0) {
        addLog(`${t('insufficientResourcesForDonation')}`, 'error');
        return;
      }
    }

    const totalCost = amountToDonate * multiplier;
    if (voidResources[resourceKey] < totalCost) {
      addLog(`${t('insufficientResourcesForDonation')}`, 'error');
      return;
    }

    const currentPOIStats = voidPOIsInspiration[poiId] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
    const currentResProgress = currentPOIStats[resourceKey] || 0;

    if (currentResProgress >= 20) {
      addLog(t('donationLimitReached'), 'warning');
      return;
    }

    setVoidResources(prev => ({
      ...prev,
      [resourceKey]: prev[resourceKey] - totalCost
    }));

    setVoidPOIsInspiration(prev => {
      const poiStats = prev[poiId] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
      const currentRes = poiStats[resourceKey] || 0;
      
      // Calculate total before update
      const totalBefore = Object.values(poiStats).reduce((a, b) => a + b, 0);
      
      const increment = incrementPerDonation * multiplier;
      const nextRes = Math.min(20, currentRes + increment);
      
      const nextPOIStats = { ...poiStats, [resourceKey]: nextRes };
      const totalAfter = Object.values(nextPOIStats).reduce((a, b) => a + b, 0);
      
      if (totalAfter >= 100 && totalBefore < 100) {
        addLog(`${poi.name} ${t('poiInspired')}`, 'success');
        playSfx('success');
      } else {
        addLog(`${t('donationSuccess')} ${resourceName} (+${increment.toFixed(1)}%)`, 'success');
        playSfx('click');
      }
      
      return { ...prev, [poiId]: nextPOIStats };
    });
  };



  const Route3EndingNarrativeModal = () => {
    const step = ROUTE_3_END_STEPS[route3EndingStep];
    if (!step) return null;

    const handleNext = () => {
      if (route3EndingStep < ROUTE_3_END_STEPS.length - 1) {
        setRoute3EndingStep(prev => prev + 1);
        playSfx('click');
      } else {
        setShowRoute3Ending(false);
        setRouteTier('Earth');
        setRoute4Unlocked(true);
        setGameTimeSeconds(0);
        setActiveTab('void_earth');
        playSfx('success');
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-8 overflow-hidden text-center"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={route3EndingStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl w-full space-y-12"
          >
            {step.type === 'robot' && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-x-0 inset-y-0 bg-purple-500 rounded-full blur-3xl -m-8"
                  />
                  <RobotVisual theme="purple" />
                </div>
                <div className="text-base font-orbitron text-purple-400 tracking-[0.4em] uppercase font-bold animate-pulse">Robot Restoration Complete</div>
              </div>
            )}

            {step.type === 'danger' && (
              <div className="relative py-8">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0, 0.2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-red-600 rounded-full blur-[100px]"
                />
                <div className="w-24 h-24 bg-red-600/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto relative z-10 animate-pulse">
                  <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
              </div>
            )}

            <div className="space-y-8">
              <h2 className={`font-orbitron font-black uppercase tracking-[0.3em] leading-relaxed px-4 ${
                step.type === 'danger' ? 'text-red-500 text-3xl md:text-4xl drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                step.type === 'success' ? 'text-emerald-400 text-3xl md:text-3xl' :
                step.type === 'robot' ? 'text-purple-300 text-2xl italic' :
                'text-purple-100 text-2xl md:text-3xl'
              }`}>
                {t(step.text as any)}
              </h2>
            </div>

            <button
              onClick={handleNext}
              className={`px-16 py-5 rounded-2xl font-orbitron font-black text-base tracking-[0.5em] transition-all hover:scale-105 active:scale-95 border-2 ${
                step.type === 'danger' ? 'bg-red-600 border-red-400 text-black shadow-[0_0_40px_rgba(239,68,68,0.5)]' :
                step.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-black shadow-[0_0_40px_rgba(16,185,129,0.5)]' :
                'bg-purple-600 border-purple-400 text-white shadow-[0_0_40px_rgba(168,85,247,0.4)]'
              }`}
            >
              {language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Background Particles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${step.type === 'danger' ? 'bg-red-500' : 'bg-purple-400'}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100 - Math.random() * 200],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  const FliperamasTutorialModal = () => (
    <AnimatePresence>
      {showFliperamasTutorial && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            className="relative max-w-lg w-full overflow-hidden rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-slate-900/90"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <div className="relative p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse">
                  <Gamepad2 className="w-10 h-10 text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-orbitron font-black text-white uppercase tracking-[0.1em] italic">
                    {language === 'pt' ? 'FLIPERAMAS' : 'ARCADES'}
                  </h2>
                  <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full mx-auto" />
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <p className="text-slate-200 text-lg leading-relaxed font-orbitron text-center italic tracking-tight">
                  &quot;OlÃƒÂ¡, esse ÃƒÂ© seu ponto de diversÃƒÂ£o, relembre clÃƒÂ¡ssicos com uma pitada de novidades. Ganhe conquistas, melhore suas pontuaÃƒÂ§ÃƒÂµes, aqui a diversÃƒÂ£o nÃƒÂ£o tem limites.&quot;
                </p>
                
                {/* Visual accents */}
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-500/30" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-500/30" />
              </div>

              <button
                onClick={() => {
                  setShowFliperamasTutorial(false);
                  playSfx('click');
                }}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-orbitron font-black text-base tracking-[0.3em] rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] uppercase active:scale-[0.98] border-t border-white/20"
              >
                {language === 'pt' ? 'VAMOS NESSA' : 'LET\'S GO'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const RestorationModal = () => {
    const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + b, 0) / 5;
    const isComplete = totalProgress >= 100;

    const resources = [
      { id: 'energy', label: t('voidQuantumCellsSent'), icon: Zap, color: 'text-yellow-400' },
      { id: 'minerals', label: t('voidMineralCoresSent'), icon: Database, color: 'text-orange-400' },
      { id: 'tech', label: t('voidDataCoresSent'), icon: Cpu, color: 'text-purple-400' },
      { id: 'food', label: t('voidRationsSent'), icon: Coffee, color: 'text-emerald-400' },
      { id: 'meds', label: t('voidMedicalKitsSent'), icon: Activity, color: 'text-red-400' }
    ];

    return (
      <AnimatePresence>
        {showRestorationModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl glass-panel border-4 border-emerald-900 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-black to-black shadow-[0_0_100px_rgba(16,185,129,0.2)]"
            >
              <div className="p-8 border-b border-emerald-500/20 flex justify-between items-center bg-emerald-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-emerald-500/40 flex items-center justify-center bg-black/40 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <img src="/images/ui/earth_card.webp" alt="Earth" className="w-full h-full object-contain p-1 animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">{t('restoration')}</h2>
                    <p className="text-[14px] text-emerald-400/60 font-mono uppercase tracking-widest">{t('projectEarthGoals')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowRestorationModal(false);
                    playSfx('close_window');
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Robot Section */}
                <div className="flex items-start gap-6 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shrink-0 animate-float overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <img src="/images/bobby_blue/bobby_blue_in_love.webp" alt="Bobby Blue" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-orbitron text-emerald-400 uppercase tracking-widest">Bobby Blue</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-base text-white/80 font-mono leading-relaxed italic">
                      &quot;{isComplete ? t('allResourcesReady') : t('restorationRobotMessage')}&quot;
                    </p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resources.map(res => {
                    const progress = earthReconstructionProgress[res.id];
                    return (
                      <div key={res.id} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                            <res.icon className={`w-4 h-4 ${res.color}`} />
                            <span className="text-base font-orbitron text-white/60 uppercase tracking-widest">{res.label}</span>
                          </div>
                          <span className={`text-base font-orbitron font-bold ${progress >= 100 ? 'text-emerald-400' : 'text-white'}`}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${progress >= 100 ? 'from-emerald-600 to-emerald-400' : 'from-white/10 to-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Global Progress */}
                <div className="pt-8 border-t border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[14px] font-orbitron text-emerald-400 uppercase tracking-[0.3em]">{t('globalReconstructionProgress')}</span>
                    <span className="text-3xl font-orbitron font-black text-white">{totalProgress.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-black/60 rounded-full border-2 border-emerald-500/20 overflow-hidden p-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-white shadow-[0_0_30px_rgba(16,185,129,0.4)] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const RobotRepairModal = () => {
    return (
      <AnimatePresence>
        {showRobotModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => !isRepairingRobot && setShowRobotModal(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-5xl glass-panel border-2 ${isRobotRepaired ? 'border-emerald-500/30' : 'border-red-500/30'} rounded-[2.5rem] p-0 overflow-hidden shadow-2xl`}
            >
              <div className="flex flex-col lg:flex-row h-full min-h-[500px]">
                {/* Left Side: Bobby Blue Video/Visual */}
                <div className="w-full lg:w-[450px] aspect-square lg:aspect-auto relative bg-black border-r border-white/10 overflow-hidden">
                   <video 
                     src={isRepairingRobot ? "/videos/bobby_blue/bobby_blue_in_trouble.webm" : "/videos/bobby_blue/bobby_blue_in_trouble.webm"}
                     autoPlay 
                     loop 
                     muted 
                     playsInline
                     className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isRobotRepaired ? 'opacity-40 grayscale' : 'opacity-100'}`}
                   />
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                   
                   {/* Diagnostic Overlay */}
                   <div className="absolute top-8 left-8 space-y-2">
                     <div className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full animate-ping ${isRobotRepaired ? 'bg-emerald-500' : 'bg-red-500'}`} />
                       <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">DIAGNOSTIC_CAM_{isRobotRepaired ? '01' : 'ERR'}</span>
                     </div>
                     <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-tight">
                       MODEL: B.B. UNIT-01<br/>
                       ID: RD-2024-X
                     </div>
                   </div>

                   {!isRobotRepaired && (
                     <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,0,0,0.1)_3px,transparent_4px)] animate-scanline" />
                     </div>
                   )}
                </div>

                {/* Right Side: Dialogue and Controls */}
                <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden">
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl lg:text-4xl font-orbitron font-black text-white tracking-widest uppercase mb-2">{t('robotRepairHeader')}</h2>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase ${isRobotRepaired ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isRobotRepaired ? 'STATUS: NOMINAL' : 'STATUS: CRITICAL FAILURE'}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => !isRepairingRobot && setShowRobotModal(false)}
                        disabled={isRepairingRobot}
                        className={`p-3 hover:bg-white/10 rounded-full transition-all ${isRepairingRobot ? 'opacity-0 cursor-default' : ''}`}
                      >
                        <X className="w-8 h-8 text-white/20" />
                      </button>
                    </div>

                    <div className={`p-8 rounded-[2rem] border min-h-[160px] flex items-center ${isRobotRepaired ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      {!isRobotRepaired ? (
                        <GlitchText 
                          key="glitch"
                          text={t('robotGlitchedDialogue')} 
                          className="text-red-200/90 font-mono text-lg lg:text-xl leading-relaxed italic"
                          delay={40}
                        />
                      ) : (
                        <GlitchText 
                          key="clean"
                          text={t('robotRepairedDialogue')} 
                          className="text-emerald-200/90 font-mono text-lg lg:text-xl leading-relaxed"
                          delay={20}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-8 pt-8 relative z-10">
                    {!isRobotRepaired && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <span className="text-xs font-orbitron text-white/40 uppercase tracking-widest block">{isRepairingRobot ? (language === 'pt' ? 'RESTAURANDO MEMÃƒâ€œRIA...' : 'RESTORING MEMORY...') : (language === 'pt' ? 'PROGRESSO DO REPARO' : 'REPAIR PROGRESS')}</span>
                             <div className="text-2xl font-orbitron font-black text-white tracking-widest">{Math.floor(robotRepairProgress)}%</div>
                          </div>
                          <div className="flex gap-4">
                             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                               <Zap className={`w-4 h-4 ${voidResources.energy >= 2500 ? 'text-yellow-400' : 'text-red-400'}`} />
                               <span className="text-sm font-mono font-bold text-white/80">2.5K</span>
                             </div>
                             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                               <Cpu className={`w-4 h-4 ${voidResources.tech >= 2500 ? 'text-cyan-400' : 'text-red-400'}`} />
                               <span className="text-sm font-mono font-bold text-white/80">2.5K</span>
                             </div>
                          </div>
                        </div>

                        <div className="h-4 bg-black/60 rounded-full border border-white/10 overflow-hidden relative shadow-inner">
                          <motion.div 
                            animate={{ width: `${robotRepairProgress}%` }}
                            className={`h-full bg-gradient-to-r ${isRepairingRobot ? 'from-orange-600 via-yellow-500 to-white animate-pulse' : 'from-red-600 to-red-400'}`}
                          />
                        </div>

                        <button
                          onClick={handleRepairRobot}
                          disabled={isRobotRepaired || isRepairingRobot || voidResources.energy < 2500 || voidResources.tech < 2500}
                          className={`w-full py-6 text-white font-orbitron font-black text-xl rounded-2xl transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4 ${
                            isRepairingRobot 
                              ? 'bg-orange-600/50 cursor-not-allowed border border-orange-500/50' 
                              : 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] active:scale-95 border-b-4 border-red-800'
                          }`}
                        >
                          {isRepairingRobot ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wrench className="w-6 h-6" />}
                          {isRepairingRobot ? (language === 'pt' ? 'REPARANDO...' : 'REPAIRING...') : (language === 'pt' ? 'CONSERTAR' : 'REPAIR')}
                        </button>
                      </div>
                    )}

                    {isRobotRepaired && (
                      <button
                        onClick={() => {
                          setShowRobotModal(false);
                          setShowBattleShipUpgradeModal(true);
                        }}
                        className="w-full py-6 bg-emerald-600 text-white font-orbitron font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] active:scale-95 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4 border-b-4 border-emerald-800"
                      >
                        <ArrowRight className="w-6 h-6" />
                        {language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}
                      </button>
                    )}
                  </div>

                  {/* Watermark Icons */}
                  {!isRobotRepaired && (
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                      <AlertTriangle className="w-80 h-80 text-red-500 rotate-12" />
                    </div>
                  )}
                  {isRobotRepaired && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.05 }}
                      className="absolute top-0 right-0 p-12 pointer-events-none"
                    >
                      <CheckCircle2 className="w-80 h-80 text-emerald-500 -rotate-12" />
                    </motion.div>
                  )}
                </div>
              </div>

              {!isRobotRepaired && (
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <AlertTriangle className="w-64 h-64 text-red-500 rotate-12" />
                </div>
              )}
              {isRobotRepaired && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  className="absolute top-0 right-0 p-8 pointer-events-none"
                >
                  <CheckCircle2 className="w-64 h-64 text-emerald-500 -rotate-12" />
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const BattleShipUpgradeModal = () => {
    const level = battleShipUpgradeLevel;
    const energyCost = 1000 * (level + 1) * (level + 1);
    const techCost = 500 * (level + 1) * (level + 1);

    return (
      <AnimatePresence>
        {showBattleShipUpgradeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={() => {
                setShowBattleShipUpgradeModal(false);
                playSfx('close_window');
              }}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-panel border-2 border-emerald-500/30 rounded-3xl p-10 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                    <Rocket className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-orbitron font-black text-white tracking-widest uppercase">{t('upgradeBattleShip')}</h2>
                    <p className="text-emerald-400/60 text-[14px] font-mono uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {t('upgradeBattleShipDesc')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                 setShowBattleShipUpgradeModal(false);
                 playSfx('close_window');
               }}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-emerald-400" />
                       {t('status')} Lvl {level}
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: t('baseDamage'), value: `+${(level * 20)}%`, bonus: t('baseDamageBonus') },
                        { label: t('criticalDamage'), value: `+${(level * 200)}`, bonus: t('critDamageBonus') },
                        { label: t('level'), value: `+${(level * 10)}`, bonus: t('upgradeLimitBonus') }
                      ].map(s => (
                        <div key={s.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <span className="text-base uppercase tracking-widest text-white/40">{s.label}</span>
                          <span className="text-base font-orbitron font-bold text-emerald-400">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl italic text-[14px] text-emerald-200/60 leading-relaxed font-mono">
                    &quot;O Projeto Terra comeÃƒÂ§a com a purificaÃƒÂ§ÃƒÂ£o do Vazio. Sua nave agora ÃƒÂ© um instrumento de justiÃƒÂ§a galÃƒÂ¡ctica.&quot;
                  </div>
                </div>

                <div className="space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-base font-mono uppercase tracking-widest text-white/40 mb-2">{t('upgradeCost')}</div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${voidResources.energy >= energyCost ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <Zap className={`w-5 h-5 ${voidResources.energy >= energyCost ? 'text-yellow-400' : 'text-red-400'}`} />
                          <span className="text-[14px] font-orbitron font-bold text-white uppercase">{t('energy')}</span>
                        </div>
                        <span className={`text-base font-mono font-bold ${voidResources.energy >= energyCost ? 'text-white' : 'text-red-400'}`}>{formatValue(energyCost)}</span>
                      </div>
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${voidResources.tech >= techCost ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <Cpu className={`w-5 h-5 ${voidResources.tech >= techCost ? 'text-cyan-400' : 'text-red-400'}`} />
                          <span className="text-[14px] font-orbitron font-bold text-white uppercase">{t('tech')}</span>
                        </div>
                        <span className={`text-base font-mono font-bold ${voidResources.tech >= techCost ? 'text-white' : 'text-red-400'}`}>{formatValue(techCost)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeRoute3BattleShip}
                    className="w-full py-5 bg-emerald-600 text-white font-orbitron font-black rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3 group"
                  >
                    <ArrowUpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    {t('upgrade')}
                  </button>
                </div>
              </div>

              {!isVoidWarActive && isRobotRepaired && (
                <div className="mt-8 pt-8 border-t border-red-500/20 relative z-10">
                   <button
                      onClick={() => {
                        setIsVoidWarActive(true);
                        setShowBattleShipUpgradeModal(false);
                        addLog(language === 'pt' ? 'GUERRA DO VAZIO INICIADA! O destino da Terra está em suas mãos.' : 'VOID WAR STARTED! The fate of Earth is in your hands.', 'error');
                        playSfx('warning');
                      }}
                      className="w-full py-5 bg-gradient-to-r from-red-700 to-red-500 text-white font-orbitron font-black text-xl rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_rgba(220,38,38,0.5)] active:scale-95 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4 animate-pulse-glow"
                   >
                      <Skull className="w-6 h-6 text-white" />
                      {language === 'pt' ? 'INICIAR GUERRA DO VAZIO' : 'START VOID WAR'}
                   </button>
                </div>
              )}

              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Rocket className="w-80 h-80 text-emerald-500 -rotate-12" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const VoidWarMap = () => {
    const VOID_SECTORS_DATA = [
      { name: { en: 'Epsilon Asteroid Belt', pt: 'CinturÃƒÂ£o de Asteroides de Ãƒâ€°psilon' }, zone: { en: 'Nursery of Horrors', pt: 'BerÃƒÂ§ÃƒÂ¡rio de Horrores' }, boss: 'Devorador Alpha' },
      { name: { en: 'Blood Nebula', pt: 'Nebulosa de Sangue' }, zone: { en: 'Haunted Gaseous Area', pt: 'ÃƒÂ­Ã‚Ârea Gasosa Assombrada' }, boss: 'Sanguessuga Estelar' },
      { name: { en: 'Debris Belt', pt: 'CinturÃƒÂ£o de DestroÃƒÂ§os' }, zone: { en: 'Organic Scrap Yard', pt: 'CemitÃƒÂ©rio OrgÃƒÂ¢nico' }, boss: 'Colosso Amalgamado' },
      { name: { en: 'Gravitational Abyss', pt: 'Abismo Gravitacional' }, zone: { en: 'Shadow Abyss', pt: 'Abismo das Sombras' }, boss: 'Kraken do Vazio' },
      { name: { en: 'Star Fortress', pt: 'Fortaleza Estelar' }, zone: { en: 'Ancient Nest', pt: 'Ninho Ancestral' }, boss: 'Besta-TitÃƒÂ­de Ferro' },
      { name: { en: 'Quantum Rift', pt: 'Fenda QuÃƒÂ¢ntica' }, zone: { en: 'Dimensional Mutation', pt: 'MutaÃƒÂ§ÃƒÂ£o Dimensional' }, boss: 'Horror Mutante' },
      { name: { en: 'Event Horizon', pt: 'Horizonte de Eventos' }, zone: { en: 'The Mouth of Terror', pt: 'A Boca do Terror' }, boss: 'Verme-Rei do Vazio' },
      { name: { en: 'Deep Void', pt: 'Vazio Profundo' }, zone: { en: 'Eternal Nightmare', pt: 'Pesadelo Eterno' }, boss: 'Predador Abissal' },
      { name: { en: 'The Heart of Darkness', pt: 'O CoraÃƒÂ§ÃƒÂ£o da EscuridÃƒÂ£o' }, zone: { en: 'The Eye of Singularity', pt: 'O Olho da Singularidade' }, boss: 'O Deus-Monstro do Vazio' },
    ];

    const sectors = VOID_SECTORS_DATA.map((data, i) => ({
      id: i,
      name: language === 'pt' ? data.name.pt : data.name.en,
      zone: language === 'pt' ? data.zone.pt : data.zone.en,
      boss: data.boss,
      locked: i > voidWarProgress.currentSector
    }));

    const startWarBattle = (sectorId: number) => {
      if (sectorId !== voidWarProgress.currentSector) return;
      
      // Determine battle type based on currentBattle in sector
      // 0-1: Normal, 2-3: Elite, 4: Boss (5 battles total)
      let type: 'normal' | 'elite' | 'boss' = 'normal';
      if (voidWarProgress.currentBattle >= 2 && voidWarProgress.currentBattle <= 3) type = 'elite';
      if (voidWarProgress.currentBattle === 4) type = 'boss';

      // Start battle with modified stats and explicit locationId
      startVoidBattle(type, sectorId + 1);
      setShowVoidWarMap(false);
    };

    return (
      <AnimatePresence>
        {showVoidWarMap && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl glass-panel border-4 border-red-900/40 rounded-3xl overflow-hidden bg-gradient-to-br from-red-950/20 via-black to-black shadow-[0_0_80px_rgba(220,38,38,0.1)]"
            >
              <div className="p-3 border-b border-red-500/20 flex justify-between items-center bg-red-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-500/20 rounded-xl border border-red-500/40 animate-pulse">
                    <Skull className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-orbitron font-black text-white tracking-widest uppercase leading-none">{t('voidWarMap')}</h2>
                    <p className="text-[14px] text-red-500/60 font-mono uppercase tracking-widest mt-0.5">{t('voidWarAlert')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVoidWarMap(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-8">
                {voidWarProgress.currentSector < sectors.length ? (() => {
                  const sector = sectors[voidWarProgress.currentSector];
                  const progress = (voidWarProgress.currentBattle / 5) * 100;
                  
                  return (
                    <div className="flex flex-col gap-8">
                      {/* Top Info: Sector Index & Status */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-500 font-orbitron text-xs font-bold tracking-widest uppercase">
                            {language === 'pt' ? `SETOR ${sector.id + 1} DE ${sectors.length}` : `SECTOR ${sector.id + 1} OF ${sectors.length}`}
                          </span>
                          <div className="flex gap-1">
                            {[...Array(sectors.length)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-2 rounded-full ${i < voidWarProgress.currentSector ? 'bg-emerald-500' : i === voidWarProgress.currentSector ? 'bg-red-500 animate-pulse' : 'bg-white/10'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-red-500/60 font-mono text-xs uppercase tracking-widest">
                          <Activity className="w-4 h-4 animate-pulse" />
                          {language === 'pt' ? 'ATIVIDADE HOSTIL DETECTADA' : 'HOSTILE ACTIVITY DETECTED'}
                        </div>
                      </div>

                      {/* Main Card Area */}
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-black border-2 border-red-500/30 rounded-3xl overflow-hidden">
                          {/* Background Decoration */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)] pointer-events-none" />
                          <div className="absolute inset-0 opacity-10  pointer-events-none" />
                          
                          <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                            {/* Visual Indicator */}
                            <div className="relative shrink-0">
                              <div className="w-32 h-32 rounded-full border-4 border-red-500/20 flex items-center justify-center relative">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-0 border-t-4 border-red-500 rounded-full"
                                />
                                <Crosshair className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                              </div>
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black px-4 py-1 rounded-lg text-xl font-orbitron shadow-lg border border-white/20">
                                {voidWarProgress.currentBattle + 1}/5
                              </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                              <div>
                                <h3 className="text-4xl font-orbitron font-black text-white uppercase tracking-tighter mb-2 drop-shadow-sm">{sector.name}</h3>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                  <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                    <Navigation className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[14px] font-mono text-cyan-400 uppercase tracking-widest">{sector.zone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                    <Skull className="w-4 h-4 text-rose-400" />
                                    <span className="text-[14px] font-mono text-rose-400 uppercase tracking-widest">BOSS: {sector.boss}</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-white/60 text-base font-mono leading-relaxed max-w-xl">
                                {language === 'pt' 
                                  ? `Uma atividade biolÃƒÂ³gica hostil de nÃƒÂ­vel ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Âmega foi detectada em ${sector.zone}. A criatura ${sector.boss} estÃƒÂ¡ consumindo a realidade local. NeutralizaÃƒÂ§ÃƒÂ£o imediata ÃƒÂ© mandatÃƒÂ³ria para evitar o colapso da reconstruÃƒÂ§ÃƒÂ£o da Terra.`
                                  : `Hostile biological activity of Omega level detected in ${sector.zone}. The creature ${sector.boss} is consuming local reality. Immediate neutralization is mandatory to prevent the collapse of Earth's reconstruction.`}
                              </p>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono uppercase tracking-[0.2em] text-white/40">
                                  <span>{t('zoneProgress')}</span>
                                  <span className="text-red-500">{Math.floor(progress)}%</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startWarBattle(sector.id)}
                        className="group relative w-full py-6 bg-red-600 hover:bg-red-500 text-white font-orbitron font-black text-2xl rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all active:scale-[0.98] uppercase tracking-[0.4em] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine pointer-events-none" />
                        <div className="relative flex items-center justify-center gap-4">
                          <Sword className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                          {t('launchDefenseMission')}
                        </div>
                      </button>
                    </div>
                  );
                })() : (
                  <div className="p-20 text-center space-y-6">
                    <div className="w-32 h-32 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-orbitron font-black text-white uppercase tracking-widest">{t('voidPacified')}</h3>
                      <p className="text-emerald-400/60 font-mono uppercase tracking-widest mt-2">{t('allThreatsNeutralized')}</p>
                    </div>
                    <button 
                      onClick={() => setShowVoidWarMap(false)}
                      className="px-12 py-4 bg-emerald-600 text-white font-orbitron font-black rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-widest"
                    >
                      {t('close')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };






  // VoidBattleArena logic moved to separate component for performance

  const route2CanvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!isInterstellar) return;
    const canvas = route2CanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Pre-compute 60 static particles (much lighter than 100 animated divs)
    const COLORS = ['rgba(239,68,68,VAL)', 'rgba(249,115,22,VAL)', 'rgba(250,204,21,VAL)'];
    const particles = Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.6 + 0.2,
      color: COLORS[i % 3]
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x -= p.speed;
        if (p.x < -2) {
          p.x = canvas.width + 2;
          p.y = Math.random() * canvas.height;
          p.alpha = Math.random() * 0.6 + 0.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('VAL', String(p.alpha));
        ctx.fill();
        // Soft glow: bigger transparent circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('VAL', String(p.alpha * 0.15));
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isInterstellar]);

  return (
    <div className={`min-h-screen ${isInterstellar ? 'bg-[#100505]' : 'bg-[#050510]'} text-slate-200 font-inter selection:bg-cyan-500/30 overflow-hidden relative`}>
      {/* Floating Rewards Animation */}
      <AnimatePresence>
        {floatingRewards.map(reward => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, scale: 0.5, x: reward.x - 20, y: reward.y }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1, 0.8],
              x: [reward.x - 20, reward.x - 20, typeof window !== 'undefined' ? window.innerWidth - 100 : 1000],
              y: [reward.y, reward.y - 100, 40]
            }}
            transition={{ duration: 1, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
            className="fixed z-[9999] pointer-events-none flex flex-col items-center"
          >
            <div className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1 rounded-full font-orbitron font-bold shadow-[0_0_20px_rgba(234,179,8,0.6)]">
              <Coins className="w-4 h-4" />
              <span>+{formatValue(reward.amount)}</span>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0], opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-yellow-400 text-[14px] font-mono font-bold mt-1"
            >
              $$$
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <SpaceAmbience isPlaying={musicOn} volume={0.2} />
      
      {/* Background Grid & Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0  opacity-20" />
        <div className={`absolute inset-0 ${isInterstellar ? 'bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.05)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]'}`} />
        <div className={`absolute inset-0 ${isInterstellar ? 'bg-[linear-gradient(to_right,rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)]'} bg-[size:40px_40px]`} />
      </div>

      {/* Background Particles for Route 2 Ã¢â‚¬â€ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Canvas-based for high FPS */}
      {isInterstellar && (
        <>
          {/* Nebula gradient overlay Ã¢â‚¬â€ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â pure CSS, zero JS cost */}
          <div className="fixed inset-0 pointer-events-none z-0" style={{
            background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(249,115,22,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 30%, rgba(239,68,68,0.03) 0%, transparent 70%)'
          }} />
          <canvas
            ref={route2CanvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.85 }}
          />
        </>
      )}

      {/* Transition Screen */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                rotate: [0, 360],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-48 rounded-full border-8 border-t-red-600 border-r-orange-500 border-b-yellow-400 border-l-transparent mb-12 shadow-[0_0_50px_rgba(220,38,38,0.5)]"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl md:text-6xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 mb-8 tracking-[0.2em] uppercase font-black">
                {t('routes2')}
              </h2>
              <p className="text-lg md:text-xl font-orbitron text-orange-200/80 leading-relaxed tracking-widest uppercase mb-12">
                {t('route2TransitionMessage')}
              </p>
              <div className="flex gap-4 justify-center">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping delay-100" />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-200" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signal Effect Overlay */}
      {false && (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full opacity-10  animate-[flicker_0.1s_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl md:text-6xl font-orbitron text-emerald-500/20 animate-pulse uppercase tracking-[0.5em] select-none">
              Try Alien
            </div>
          </div>
          <style jsx>{`
            @keyframes flicker {
              0% { opacity: 0.1; }
              50% { opacity: 0.15; }
              100% { opacity: 0.1; }
            }
          `}</style>
        </div>
      )}

      <motion.div 
        animate={isShaking ? { x: [-5, 5, -5, 5, 0], y: [-2, 2, -2, 2, 0] } : {}}
        transition={isShaking ? { duration: 0.1, repeat: Infinity } : {}}
        className={`relative z-10 w-full h-screen flex flex-col p-0 gap-4 ${isFlashingRed ? 'bg-red-900/20' : ''}`}
      >
        {isFlashingRed && (
          <motion.div 
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="fixed inset-0 z-[160] bg-red-600 pointer-events-none"
          />
        )}
        {showInvasionAlertOverlay && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[170] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-red-600 text-white font-orbitron font-black text-4xl md:text-6xl px-12 py-8 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.8)] border-4 border-white animate-pulse text-center">
              {t('voidWarAlert')}
            </div>
          </motion.div>
        )}
        {/* Header */}
        <header className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} p-4 flex justify-between items-center rounded-xl shrink-0`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${isInterstellar ? 'bg-orange-500/10 border-orange-500/30' : 'bg-cyan-500/10 border-cyan-500/30'} flex items-center justify-center border animate-pulse-glow`}>
              <Rocket className={`w-6 h-6 ${themeText}`} />
            </div>
            <div className="flex items-center gap-6">
              <div>
                <h1 className={`text-xl font-orbitron font-bold tracking-tighter ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'} leading-none`}>
                  {translateData('QUANTUM COURIER HORIZON')}
                </h1>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isInterstellar ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className={`text-base font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest`}>
                    {translateData('System Online')} • {playerName}
                  </span>
                </div>
              </div>

              {/* Transition Buttons Area */}
              <div className="flex items-center">
                {/* Route 2 Alert Button */}
                {routeTier === 'Solar' && isRoute2Unlocked() && !isSpeedRun && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRoute2Info(true)}
                    className="relative group flex items-center justify-center"
                  >
                    <div className="absolute -inset-2 bg-orange-500/20 blur-xl rounded-full animate-pulse group-hover:bg-orange-500/40 transition-all" />
                    <div className="relative w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] overflow-hidden">
                      <Rocket className="w-5 h-5 animate-bounce" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </div>
                    {/* Small dot notification */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-black animate-ping" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-black" />
                  </motion.button>
                )}

                {/* Route 3 Alert Button */}
                {routeTier === 'Interstellar' && isRoute3Unlocked() && !isSpeedRun && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRoute3Info(true)}
                    className="relative group flex items-center justify-center"
                  >
                    <div className="absolute -inset-2 bg-purple-500/20 blur-xl rounded-full animate-pulse group-hover:bg-purple-500/40 transition-all" />
                    <div className="relative w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] overflow-hidden">
                      <Rocket className="w-5 h-5 animate-bounce" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </div>
                    {/* Small dot notification */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-black animate-ping" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
                  </motion.button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {battleNotification && battleNotification.tier === routeTier && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className={`fixed right-4 top-24 z-[100] whitespace-nowrap px-6 py-3 rounded-xl border shadow-2xl font-orbitron text-[14px] font-bold flex items-center gap-4 backdrop-blur-md ${
                    battleNotification.type === 'success' 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20' 
                      : 'bg-red-500/20 border-red-500/40 text-red-400 shadow-red-500/20'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${battleNotification.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-base opacity-60 uppercase tracking-widest">{battleNotification.type === 'success' ? 'Auto-Combat Victory' : 'Auto-Combat Defeat'}</span>
                    {battleNotification.message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isSpeedRun && (
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative h-4 bg-slate-900/80 rounded-full border border-cyan-500/30 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                {(() => {
                  const p = getSpeedRunProgress();
                  if (!p) return null;
                  const total = p.ships.total + p.tech.total + p.upgrades.total + p.slots.total + p.robots.total;
                  const current = p.ships.current + p.tech.current + p.upgrades.current + p.slots.current + p.robots.current;
                  const percent = Math.floor((current / total) * 100);
                  return (
                    <>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 via-cyan-400 to-white shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-orbitron font-bold text-white drop-shadow-md tracking-widest">
                          {percent}% {t('complete').toUpperCase()}
                        </span>
                      </div>
                      {/* Shiny effect */}
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3">
                {isSpeedRun && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-emerald-500/30 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span className="text-[14px] font-mono font-bold text-emerald-400 tracking-wider">
                      {formatTime(speedRunTime)}
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => {
                    jukebox.togglePlay();
                    playSfx(jukebox.isPlaying ? 'close_window' : 'open_window');
                  }}
                  className={`relative px-4 py-1.5 rounded-full border text-base font-orbitron font-bold transition-all uppercase tracking-widest flex items-center gap-2 overflow-hidden group ${
                    jukebox.isPlaying 
                    ? (isInterstellar 
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                        : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]') 
                    : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                  title={jukebox.isPlaying ? t('pauseMusic') : t('playMusic')}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    jukebox.isPlaying 
                    ? (isInterstellar ? 'bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]') 
                    : 'bg-slate-600'
                  }`} />
                  {jukebox.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{jukebox.isPlaying ? 'MUSIC ON' : 'MUSIC OFF'}</span>
                </button>

                <button 
                  onClick={() => {
                    const next = !formatNumbers;
                    setFormatNumbers(next);
                    playSfx(next ? 'open_window' : 'close_window');
                  }}
                  className={`relative px-4 py-1.5 rounded-full border text-base font-orbitron font-bold transition-all uppercase tracking-widest flex items-center gap-2 overflow-hidden group ${
                    formatNumbers 
                    ? (isInterstellar 
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                        : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]') 
                    : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    formatNumbers 
                    ? (isInterstellar ? 'bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]') 
                    : 'bg-slate-600'
                  }`} />
                  <span>{formatNumbers ? 'NUM COMPACT' : 'NUM FULL'}</span>
                  {formatNumbers && (
                    <motion.div 
                      className={`absolute inset-0 opacity-20 bg-gradient-to-r ${isInterstellar ? 'from-orange-500 to-transparent' : 'from-cyan-500 to-transparent'}`}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </button>
                {isEarth && (
                  <div className="flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-full border border-emerald-500/30 ml-auto mr-4 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                    <div className="flex flex-col items-center relative z-10">
                      <span className="text-[14px] uppercase tracking-tighter opacity-50 font-bold leading-none mb-1 text-emerald-400">{t('day')}</span>
                      <span className="text-base font-orbitron font-bold text-white leading-none tabular-nums">{gameTime.days}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-emerald-500/20 relative z-10" />
                    <div className="flex flex-col items-center relative z-10">
                      <span className="text-[14px] uppercase tracking-tighter opacity-50 font-bold leading-none mb-1 text-emerald-400">{t('month')}</span>
                      <span className="text-base font-orbitron font-bold text-white leading-none tabular-nums">{gameTime.months}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-emerald-500/20 relative z-10" />
                    <div className="flex flex-col items-center relative z-10">
                      <span className="text-[14px] uppercase tracking-tighter opacity-50 font-bold leading-none mb-1 text-emerald-400">{t('year')}</span>
                      <span className="text-base font-orbitron font-bold text-white leading-none tabular-nums">{gameTime.years}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Database className={`w-4 h-4 ${themeText}`} />
                  <span className={`text-2xl font-orbitron font-bold ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                    {formatValue(qc)} <span className={`text-[14px] ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'}`}>QC</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
          {/* Sidebar - Active Deliveries / Project Earth */}
          <AnimatePresence mode="wait">
            {!isVoid && (
              <motion.aside 
                key={isEarth ? "sidebar-earth" : "sidebar-deliveries"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0"
              >
                {isEarth ? (
                  <EarthSidebar 
                    earthReconstructionProgress={earthReconstructionProgress}
                    language={language}
                    t={t}
                    gameTime={gameTime}
                    totalHumanPopulation={totalHumanPopulation}
                    earthBiodiversity={earthBiodiversity}
                    earthEvents={earthEvents}
                    formatValue={formatValue}
                  />
                ) : (
                  /* Active Deliveries */
                  <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-xl flex-1 flex flex-col overflow-hidden`}>
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h2 className={`text-[14px] font-orbitron font-bold tracking-widest ${themeText} uppercase flex items-center gap-2`}>
                        <Navigation className="w-4 h-4" /> {t('activeDeliveries')}
                      </h2>
                      <span className={`text-base font-mono ${isInterstellar ? 'text-orange-500/40' : 'text-cyan-500/40'}`}>
                        {groupedDeliveries.length} LOC / {activeDeliveries.filter(d => !d.id.startsWith('auto-')).length}/25 HANGARS
                      </span>
                    </div>
                  
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {groupedDeliveries.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-12 h-12 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center mb-4">
                          <Database className="w-6 h-6" />
                        </div>
                        <p className="text-[14px] font-orbitron uppercase tracking-widest">{t('noShips')}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-3 content-start">
                        {/* Coffee Message when fully automated */}
                        {activeDeliveries.length === 0 && Object.values(autoTravelActive).some(v => v) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center p-6 bg-cyan-500/5 rounded-xl border border-cyan-500/10 mb-2"
                          >
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20 animate-float">
                              <Coffee className="w-6 h-6 text-cyan-400" />
                            </div>
                            <AnimatePresence mode="wait">
                              <motion.p 
                                key={coffeePhraseIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-base font-orbitron text-cyan-300/80 leading-relaxed italic"
                              >
                                {translateData(translations[language].coffeeMessage[coffeePhraseIndex])}
                              </motion.p>
                            </AnimatePresence>
                          </motion.div>
                        )}

                          {groupedDeliveries.map((group) => {
                            const route = ROUTES_MAP.get(group.routeId);
                            if (!route) return null;
                            
                            const ship = SHIPS.find(s => s.level === group.shipLevel && s.tier === (group.tier as any || route.tier));
                            if (!ship) return null;

                            const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
                            const engineUpgrade = UPGRADES_MAP.get('engine')!;
                            const engineTier = engineUpgrade.tiers.find(t => t.level === locationTech.engine);
                            const isJumping = engineTier?.level === 5;
                            const isCombat = group.status === 'combat';

                            return (
                              <div key={group.routeId} className={`glass-panel border rounded-lg p-3 transition-all relative overflow-hidden group ${isCombat ? 'neon-border-red bg-red-500/5' : isInterstellar ? 'neon-border-orange hover:bg-white/5' : 'neon-border-cyan hover:bg-white/5'}`}>
                                <div className="flex gap-4 relative z-10">
                                  {/* Left Side: Ship PNG */}
                                  <div className="relative w-24 h-24 flex-shrink-0 bg-black/40 rounded-lg border border-white/5 overflow-hidden flex items-center justify-center p-2">
                                    <ShipVisual ship={ship} className="w-full h-full" />
                                    {group.totalCount > 1 && (
                                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-orbitron font-bold text-white border border-white/10">
                                        x{group.totalCount}
                                      </div>
                                    )}
                                  </div>

                                  {/* Center: Info */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-[14px] font-orbitron font-bold text-white truncate leading-tight uppercase tracking-wider">{translateData(route.name)}</div>
                                        <div className={`text-[13px] font-orbitron ${isCombat ? 'text-red-400' : isJumping ? 'text-pink-400 animate-pulse' : isInterstellar ? 'text-orange-400' : 'text-cyan-400'}`}>
                                          {isCombat ? 'COMBAT' : isJumping ? t('jump') : `${Math.floor(group.avgProgress)}%`}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[12px] font-mono truncate ${ship.color}`}>{ship.name}</span>
                                        {group.autoActive && (
                                          <div className="flex items-center gap-1 bg-cyan-500/10 px-1.5 rounded border border-cyan-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                            <span className="text-[9px] font-orbitron font-bold text-cyan-400">AUTO</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Aggregated Progress Bar */}
                                    <div className="space-y-1.5">
                                      <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                          className={`h-full rounded-full ${isCombat ? 'bg-red-500' : isJumping ? 'bg-gradient-to-r from-pink-600 to-pink-400' : isInterstellar ? 'bg-gradient-to-r from-orange-600 to-yellow-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${group.avgProgress}%` }}
                                          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                        />
                                        {isJumping && (
                                          <motion.div 
                                            className="absolute inset-0 bg-white/20"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                          />
                                        )}
                                      </div>
                                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter opacity-40">
                                        <span>{isCombat ? 'Action Required' : isJumping ? 'Warping...' : 'In Transit'}</span>
                                        <span>{route.reward} QC / Trip</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Decorative Background Glow */}
                                <div className={`absolute inset-0 transition-colors ${isCombat ? 'bg-red-500/5' : isInterstellar ? 'bg-orange-500/0 group-hover:bg-orange-500/5' : 'bg-cyan-500/0 group-hover:bg-cyan-500/5'}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Battle Alert Button */}
                    <AnimatePresence>
                      {underAttackBattle && (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          onClick={() => {
                            setActiveBattle(underAttackBattle);
                            setUnderAttackBattle(null);
                            playSfx('battle_click');
                          }}
                          className="mx-4 mb-4 p-4 rounded-xl border border-red-500/50 bg-red-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.3)] group hover:bg-red-500/30 transition-all shrink-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 group-hover:scale-110 transition-transform animate-pulse">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                              </div>
                              <div className="text-left">
                                <div className="text-[14px] font-orbitron font-black text-red-100 uppercase tracking-tighter leading-none">NAVE ATACADA</div>
                                <div className="text-[10px] font-mono text-red-400/80 uppercase mt-1">IntercepÃƒÂ§ÃƒÂ£o Hostil</div>
                              </div>
                            </div>
                            <Sword className="w-5 h-5 text-red-400 group-hover:rotate-12 transition-transform" />
                          </div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>

        {/* Main Content */}
        <main className={`${isVoid ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-4 h-full min-h-0`}>
          {/* Tabs - Desktop Only */}
          <div className="hidden lg:flex gap-1 w-full border-b border-white/5 mb-1">
            {(() => {
              const baseTabs = (isVoid || isEarth)
                ? ['void_aircraft', 'void_battle', 'void_map', 'void_war', 'colonies', 'void_earth', 'mini_games', 'history', 'exit']
                : ['routes', 'routes2', 'missions', 'aircraft', 'technology', 'upgrades', 'auto', 'mining', 'history', 'exit'];
              
              return baseTabs.map(tab => {
                if (tab === 'routes' && isInterstellar) return null;
                if (tab === 'routes2' && !isInterstellar) return null;

                if (tab === 'routes2' && isSpeedRun) return null;
                if (tab === 'missions' && isSpeedRun) return null;
                if (tab === 'history' && isSpeedRun) return null;
                
                // Route 4 (Earth) specific restrictions
                if (isEarth && !['colonies', 'void_earth', 'void_aircraft', 'void_map', 'mini_games', 'history', 'exit'].includes(tab)) return null;
                
                // Route 3 (Void) specific restrictions
                if (isVoid && tab === 'colonies') return null;
                if (isVoid && tab === 'mini_games') return null;

                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => {
                      playSfx('aba_click');
                      setActiveTab(tab as any);
                    }}
                    className={`flex-1 px-2 py-2.5 font-orbitron text-[15px] tracking-widest uppercase transition-all border-b-2 whitespace-nowrap relative ${
                      isActive 
                        ? `${themeBorder} ${isVoid ? 'text-purple-100 drop-shadow-[0_0_15px_rgba(192,132,252,1)]' : themeText} ${themeBg} ${isVoid ? 'neon-text-purple' : ''}` 
                        : `border-transparent ${isInterstellar ? 'text-orange-500/40 hover:text-orange-500/80' : isVoid ? 'text-purple-400/60 hover:text-purple-100 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]' : 'text-cyan-500/40 hover:text-cyan-500/80'}`
                    } ${tab === 'void_battle' && (typeof isVoidWarActive !== 'undefined' && isVoidWarActive) ? 'animate-pulse bg-red-600/20 border-red-500 text-red-400' : ''}`}
                  >
                    {t(tab)}
                    {tab === 'void_battle' && (typeof isVoidWarActive !== 'undefined' && isVoidWarActive) && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    )}
                    {tab === 'missions' && missions.some(m => m.completed && !m.claimed) && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    )}
                  </button>
                );
              });
            })()}
          </div>

          <div className={`flex-1 h-full min-h-0 overflow-y-auto pr-2 custom-scrollbar flex flex-col ${(activeTab === 'routes' || activeTab === 'routes2' || activeTab === 'aircraft' || activeTab === 'technology' || activeTab === 'upgrades' || activeTab === 'auto' || activeTab === 'battleLevel' || activeTab === 'mining' || activeTab === 'missions' || activeTab === 'void_aircraft' || activeTab === 'void_battle' || activeTab === 'void_map' || activeTab === 'void_war' || activeTab === 'colonies' || activeTab === 'void_earth' || activeTab === 'history') ? 'lg:overflow-hidden' : ''}`}>
            {isVoid && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2"
              >
                {[
                  { label: 'MinÃƒÂ©rios', value: voidResources.minerals, icon: Database, color: 'text-slate-400' },
                  { label: 'Energia', value: voidResources.energy, icon: Zap, color: 'text-yellow-400' },
                  { label: 'Alimentos', value: voidResources.food, icon: Heart, color: 'text-red-400' },
                  { label: 'Tecnologia', value: voidResources.tech, icon: Cpu, color: 'text-cyan-400' },
                  { label: 'Medicamentos', value: voidResources.meds, icon: Shield, color: 'text-emerald-400' }
                ].map(res => (
                  <div key={res.label} className="glass-panel border border-white/10 rounded-xl p-2.5 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-2">
                      <res.icon className={`w-3 h-3 ${res.color}`} />
                      <span className="text-[15px] text-white/40 uppercase tracking-widest">{res.label}</span>
                    </div>
                    <span className="text-base font-orbitron font-bold text-white">{formatValue(res.value || 0)}</span>
                  </div>
                ))}
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {activeTab === 'mini_games' && isArcadeUnlocked && (
                <motion.div
                  key="mini_games"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  {activeMiniGameId ? (
                    <div className="relative w-full h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4 p-2 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Gamepad2 size={20} className="text-cyan-400" />
                          <span className="font-orbitron font-bold text-white tracking-widest uppercase">
                            {MINI_GAMES_CONFIG.find(g => g.id === activeMiniGameId)?.name[language as 'pt' | 'en']}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveMiniGameId(null)}
                          className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded font-orbitron text-base tracking-widest transition-all"
                        >
                          {language === 'pt' ? 'SAIR' : 'EXIT'}
                        </button>
                      </div>
                      <div className="flex-1 bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
                        <iframe
                          src={MINI_GAMES_CONFIG.find(g => g.id === activeMiniGameId)?.path}
                          className="w-full h-full border-none"
                          title="Mini Game Player"
                        />
                      </div>
                    </div>
                  ) : (
                    <MiniGames 
                      onGameSelect={(id) => {
                        if (!isArcadeUnlocked) return;
                        setActiveMiniGameId(id);
                        addLog(`${language === 'pt' ? 'Iniciando' : 'Starting'} ${id}...`, 'info');
                      }} 
                      language={language as 'pt' | 'en'}
                    />
                  )}
                </motion.div>
              )}

              {(activeTab === 'routes' || activeTab === 'routes2') && (
                <RoutesTab />
              )}

              {activeTab === 'missions' && (
                <MissionsTab />
              )}

              {activeTab === 'auto' && (
                <AutoTab />
              )}

              {activeTab === 'mining' && (
                <MiningTab />
              )}

              {activeTab === 'aircraft' && (
                <AircraftTab 
                  renderBattleLevelTab={() => (
                    <BattleLevelTab
                      setSelectedReward={setSelectedReward}
                      setShowDoomProtocolInfo={setShowDoomProtocolInfo}
                      setShowCaptureInfo={setShowCaptureInfo}
                      themeBorder={themeBorder}
                      themeBg={themeBg}
                      themeText={themeText}
                      themeGlow={themeGlow}
                      autoSkipRandomBattles={autoSkipRandomBattles}
                      toggleAutoSkipRandomBattles={toggleAutoSkipRandomBattles}
                    />
                  )}
                />
              )}

              {activeTab === 'technology' && (
                <TechnologyTab />
              )}

              {activeTab === 'upgrades' && (
                <UpgradesTab />
              )}

              {activeTab === 'exit' && (
                <motion.div 
                  key="exit"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-md mx-auto space-y-4"
                >
                  <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-xl p-8 space-y-8 text-center`}>
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isInterstellar ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'} border-2`}>
                        <LogOut className="w-8 h-8" />
                      </div>
                      <h2 className={`text-xl font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} uppercase tracking-widest`}>
                        {language === 'pt' ? 'Sair do jogo' : 'Exit Game'}
                      </h2>
                      <p className="text-[14px] font-orbitron text-white/60 uppercase tracking-wider leading-relaxed">
                        {language === 'pt' 
                          ? 'Isso te levará ao menu inicial e salvará seu progresso automaticamente. Todo o modo automático será desabilitado, descansando e esfriando os motores.' 
                          : 'This will take you to the home menu and save your progress automatically. All automatic modes will be disabled, resting and cooling the engines.'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button
                        onClick={handleExit}
                        className={`w-full py-4 ${isInterstellar ? 'bg-orange-500 hover:bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'} text-black font-orbitron font-bold text-base tracking-widest rounded-lg transition-all uppercase`}
                      >
                        {language === 'pt' ? 'CONFIRMAR E SAIR' : 'CONFIRM AND EXIT'}
                      </button>
                      <button
                        onClick={() => {
                          playSfx('aba_click');
                          setActiveTab(isEarth ? 'colonies' : isVoid ? 'void_aircraft' : isInterstellar ? 'routes2' : 'routes');
                        }}
                        className="w-full py-2 text-base font-orbitron text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                      >
                        {language === 'pt' ? 'VOLTAR' : 'BACK'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'void_aircraft' && (
                <VoidAircraftTab />
              )}

              {activeTab === 'void_battle' && (
                <VoidBattleTab
                  isVoid={isVoid}
                  isRobotRepaired={isRobotRepaired}
                  setShowBattleShipUpgradeModal={setShowBattleShipUpgradeModal}
                  setShowRobotModal={setShowRobotModal}
                  isVoidWarActive={isVoidWarActive}
                  voidWarAlertActive={voidWarAlertActive}
                  setHasWonEliminateEnemiesRoute3={setHasWonEliminateEnemiesRoute3}
                  setVoidWarAlertActive={setVoidWarAlertActive}
                  setIsShaking={setIsShaking}
                  setIsFlashingRed={setIsFlashingRed}
                  setVoidWarRobotSpeaking={setVoidWarRobotSpeaking}
                  setShowRoute3Ending={setShowRoute3Ending}
                  setVoidAircraftAutoToggles={setVoidAircraftAutoToggles}
                  setVoidWarProgress={setVoidWarProgress}
                  voidWarProgress={voidWarProgress}
                  setShowVoidWarMap={setShowVoidWarMap}
                />
              )}

              {activeTab === 'void_war' && (
                <motion.div
                  key="void_war"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <VoidWarCore />
                </motion.div>
              )}

              {activeTab === 'colonies' && (
                <ColoniesTab 
                  addEarthYears={addEarthYears}
                  isColoniesOpenRef={isColoniesOpenRef}
                  handleBuildingComplete={handleBuildingComplete}
                  setEarthProjectBoostCount={setEarthProjectBoostCount}
                />
              )}

              {activeTab === 'void_earth' && (
                <VoidEarthTab />
              )}

              {activeTab === 'history' && (
                <HistoryTab />
              )}

            </AnimatePresence>

            {/* Void Map - Smart Standby (Always mounted to prevent video reload flicker) */}
            <div className={activeTab === 'void_map' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
              <motion.div
                key="void_map_persistent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: activeTab === 'void_map' ? 1 : 0, x: activeTab === 'void_map' ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col overflow-hidden"
              >
                <VoidMapTab />
              </motion.div>
            </div>
          </div>

          {/* Bottom Navigation for Mobile/Tablet */}
          <div className={`lg:hidden shrink-0 glass-panel ${isInterstellar ? 'neon-border-orange' : isVoid ? 'neon-border-purple' : 'neon-border-cyan'} rounded-xl flex justify-around items-center p-2 mb-2`}>
            {(isVoid || isEarth
              ? [
                  { id: 'void_aircraft', icon: Rocket, label: t('void_aircraft') },
                  { id: 'void_battle', icon: Crosshair, label: t('battle'), alert: isVoidWarActive, hide: isEarth },
                  { id: 'void_map', icon: MapIcon, label: t('void_map') },
                  { id: 'void_war', icon: Home, label: t('void_war'), hide: isEarth },
                  { id: 'colonies', icon: Building2, label: t('colonies'), hide: !isEarth },
                  { id: 'void_earth', icon: Globe, label: t('void_earth') },
                  { id: 'mini_games', icon: Gamepad2, label: t('mini_games'), hide: !isArcadeUnlocked },
                  { id: 'history', icon: HistoryIcon, label: t('history'), hide: isSpeedRun },
                  { id: 'exit', icon: LogOut, label: t('exit') }
                ]
              : [
                  { id: 'routes', icon: MapIcon, label: t('routes1' as any), hide: isInterstellar },
                  { id: 'routes2', icon: Globe, label: t('routes2' as any), hide: !isInterstellar || isSpeedRun },

                  { id: 'missions', icon: Trophy, label: t('missions' as any), hide: isSpeedRun },
                  { id: 'aircraft', icon: Rocket, label: t('aircraft' as any) },
                  { id: 'technology', icon: Cpu, label: t('technology' as any) },
                  { id: 'upgrades', icon: TrendingUp, label: t('upgrades' as any) },
                  { id: 'auto', icon: Cpu, label: t('autoTravel' as any) },
                  { id: 'mining', icon: Pickaxe, label: t('mining' as any) },
                  { id: 'mini_games', icon: Gamepad2, label: t('mini_games'), hide: !isArcadeUnlocked },
                  { id: 'history', icon: HistoryIcon, label: t('history' as any), hide: isSpeedRun },
                  { id: 'exit', icon: LogOut, label: t('exit' as any) }
                ]
            ).map(item => {
              if (item.hide) return null;
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playSfx('aba_click');
                    setActiveTab(item.id as any);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 transition-all rounded-lg relative ${
                    isActive 
                    ? (isInterstellar ? 'bg-orange-500/20 text-orange-400' : isVoid ? 'bg-purple-500/20 text-purple-100 drop-shadow-[0_0_15px_rgba(192,132,252,1)] neon-text-purple' : 'bg-cyan-500/20 text-cyan-400') 
                    : (isInterstellar ? 'text-orange-500/40' : isVoid ? 'text-purple-400/50' : 'text-cyan-500/40')
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-glow' : ''}`} />
                  <span className="text-[15px] font-orbitron uppercase tracking-tighter">{item.label}</span>
                  {(item.id === 'missions' && missions.some(m => m.completed && !m.claimed)) || (item.id === 'void_battle' && isVoidWarActive) && (
                    <span className={`absolute top-1 right-1 w-1.5 h-1.5 ${item.id === 'void_battle' ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-ping`} />
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>

      {/* Saving Overlay */}
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="max-w-md w-full px-8 space-y-8 text-center">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 rounded-full border-t-2 border-r-2 ${isInterstellar ? 'border-orange-500' : 'border-cyan-500'}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Save className={`w-10 h-10 ${isInterstellar ? 'text-orange-500' : 'text-cyan-500'} animate-pulse`} />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-orbitron font-black text-white tracking-tighter uppercase">
                  {language === 'pt' ? 'Salvando Progresso' : 'Saving Progress'}
                </h2>
                <p className="text-[14px] font-orbitron text-slate-400 uppercase tracking-widest">
                  {language === 'pt' ? 'Sincronizando dados com a rede neural...' : 'Syncing data with neural network...'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${saveProgress}%` }}
                    className={`h-full ${isInterstellar ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`}
                  />
                </div>
                <div className="flex justify-between text-base font-orbitron text-slate-500 uppercase tracking-widest">
                  <span>{saveProgress}%</span>
                  <span>{saveProgress === 100 ? (language === 'pt' ? 'Concluído' : 'Completed') : (language === 'pt' ? 'Processando...' : 'Processing...')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }
      `}</style>

      {/* Route 2 Info Modal */}
      <AnimatePresence>
        {showRoute2Info && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden glass-panel border-2 border-orange-500/50 p-10 rounded-3xl bg-gradient-to-br from-orange-500/20 via-black/90 to-orange-900/40 shadow-[0_0_100px_rgba(249,115,22,0.2)]"
            >
              <button 
                onClick={() => setShowRoute2Info(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center gap-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.5)] animate-pulse-glow">
                    <Globe className="w-12 h-12 text-orange-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-orbitron font-black text-orange-400 uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                    {t('routes2')}
                  </h3>
                  <div className="h-1 w-32 bg-orange-500/50 mx-auto rounded-full" />
                  <p className="text-xl text-orange-100 font-mono uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
                    {t('route2UnlockDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
                    <div className="text-orange-400 font-orbitron text-xs tracking-widest uppercase mb-1">Status</div>
                    <div className="text-white font-mono">{t('unlocked').toUpperCase()}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
                    <div className="text-orange-400 font-orbitron text-xs tracking-widest uppercase mb-1">Fase</div>
                    <div className="text-white font-mono">PROTOCOLO INTERESTELAR</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowRoute2Info(false);
                    setShowRoute2Confirm(true);
                  }}
                  className="group relative px-16 py-6 bg-orange-500 text-black font-orbitron font-black text-2xl rounded-2xl hover:bg-orange-400 transition-all shadow-[0_0_40px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 uppercase tracking-[0.3em] border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-4"
                >
                  <Rocket className="w-8 h-8" />
                  {t('startInterstellarProtocol')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {showRoute3Info && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden glass-panel border-2 border-purple-500/50 p-10 rounded-3xl bg-gradient-to-br from-purple-500/20 via-black/90 to-purple-900/40 shadow-[0_0_100px_rgba(168,85,247,0.2)]"
            >
              <button 
                onClick={() => setShowRoute3Info(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center gap-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse-glow">
                    <Zap className="w-12 h-12 text-purple-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-orbitron font-black text-purple-400 uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                    ROTA 3
                  </h3>
                  <div className="h-1 w-32 bg-purple-500/50 mx-auto rounded-full" />
                  <p className="text-xl text-purple-100 font-mono uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
                    {t('route3UnlockDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
                    <div className="text-purple-400 font-orbitron text-xs tracking-widest uppercase mb-1">Status</div>
                    <div className="text-white font-mono">{t('unlocked').toUpperCase()}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
                    <div className="text-purple-400 font-orbitron text-xs tracking-widest uppercase mb-1">Fase</div>
                    <div className="text-white font-mono">PROTOCOLO VAZIO</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowRoute3Info(false);
                    setShowRoute3Confirm(true);
                  }}
                  className="group relative px-16 py-6 bg-purple-600 text-white font-orbitron font-black text-2xl rounded-2xl hover:bg-purple-500 transition-all shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 uppercase tracking-[0.3em] border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-4"
                >
                  <Rocket className="w-8 h-8" />
                  {t('startVoidProtocol')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      {/* Epic Route 2 Confirmation Screen */}

      <AnimatePresence>
        {showRoute2Confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black overflow-hidden"
          >
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.5,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    y: [null, '110%'],
                    opacity: [null, 0]
                  }}
                  transition={{ 
                    duration: Math.random() * 10 + 5, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 5
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full"
                />
              ))}
              {/* Warp Lines */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`warp-${i}`}
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: -100,
                    opacity: 0,
                    height: 0
                  }}
                  animate={{ 
                    y: '110%',
                    opacity: [0, 0.5, 0],
                    height: [0, 200, 0]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 2
                  }}
                  className="absolute w-0.5 bg-orange-500/30 blur-[1px]"
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 w-full max-w-xl p-4 flex flex-col items-center"
            >
              {/* Energy Ring - Compact version */}
              <div className="relative w-24 h-24 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/20"
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.8, 0.4],
                    rotate: -360
                  }}
                  transition={{ 
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                  }}
                  className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-orange-400 border-l-transparent shadow-[0_0_25px_rgba(249,115,22,0.3)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <motion.h2 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-5xl font-orbitron font-black text-white mb-4 tracking-[0.5em] uppercase text-center relative"
              >
                <span className="relative z-10 neon-text-orange">ROTAS 2</span>
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
                />
              </motion.h2>

              <div className="space-y-2 text-center mb-6 w-full">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-orange-500 font-orbitron font-bold text-base tracking-[0.3em] uppercase mb-2"
                >
                  {t('systemUnlocked')}
                </motion.p>

                <div className="space-y-0.5 opacity-80">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-base md:text-[14px] font-orbitron uppercase tracking-widest text-slate-300"
                  >
                    {t('conqueredSolarSystem')}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-base md:text-[14px] font-orbitron uppercase tracking-widest text-slate-400"
                  >
                    {t('interstellarJourneyBegins')}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-base md:text-[14px] font-orbitron uppercase tracking-widest text-emerald-400 mt-2"
                  >
                    {t('pulsarShipReward')}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="py-2"
                >
                  <span className="text-red-500 font-orbitron font-black text-base md:text-[14px] tracking-[0.2em] uppercase border-y border-red-500/20 py-1 px-4">
                    {t('sacrificeRequired')}
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[15px] md:text-[14px] font-orbitron uppercase tracking-widest text-slate-500 max-w-xs mx-auto leading-relaxed"
                >
                  {t('legacyConversionDesc')}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-base md:text-[14px] font-orbitron font-bold uppercase tracking-[0.2em] text-orange-400/80"
                >
                  {language === 'pt' ? 'RUMO AO PRÃ“XIMO SALTO' : 'TOWARDS THE NEXT LEAP'}
                </motion.p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(249,115,22,0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playSfx('click');
                    setShowRoute2Confirm(false);
                    setShowRoute2Lore(true);
                    setLoreLineIndex(0);
                    setActiveBattle(null);
                  }}
                  className="w-full py-5 rounded-xl font-orbitron text-base bg-orange-600 text-black font-black shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:bg-orange-500 transition-all uppercase tracking-[0.4em] relative overflow-hidden group"
                >
                  <span className="relative z-10">{language === 'pt' ? 'INICIAR' : 'START'}</span>
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none"
                  />
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  onClick={() => setShowRoute2Confirm(false)}
                  className="w-full py-2 rounded-lg font-orbitron text-[15px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
                >
                  {t('cancel').toUpperCase()}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Run Win Modal */}
      <AnimatePresence>
        {showSpeedRunWinModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-slate-900 border-2 border-emerald-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30">
                <Trophy className="w-10 h-10 text-emerald-400" />
              </div>
              
              <h2 className="text-3xl font-orbitron font-bold text-white mb-2 uppercase tracking-tighter">
                SPEED RUN COMPLETE!
              </h2>
              
              <p className="text-slate-400 mb-8 font-medium">
                Congratulations, {playerName}! You&apos;ve mastered the galaxy in record time.
              </p>
              
              <div className="bg-black/40 rounded-xl p-6 mb-8 border border-white/5">
                <div className="text-[14px] text-slate-500 uppercase tracking-widest mb-1">Final Time</div>
                <div className="text-4xl font-orbitron font-bold text-emerald-400 tabular-nums">
                  {formatTime(speedRunTime)}
                </div>
              </div>
              
              <button
                onClick={() => onReturnToMenu()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] uppercase tracking-widest"
              >
                RETURN TO MENU
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} w-full max-w-md p-6 rounded-2xl space-y-6`}
              >
                <div className="text-center space-y-2">
                  <h2 className={`font-orbitron font-bold text-lg ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} uppercase tracking-widest`}>
                    {t('exportTitle')}
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'campaign', label: t('campaign'), desc: t('campaignDesc') },
                    { id: 'speedRun', label: t('exportSpeedRun'), desc: t('exportSpeedRunDesc') },
                    { id: 'secretCodes', label: t('secretCodes'), desc: t('secretCodesDesc') },
                    { id: 'achievements', label: t('achievements'), desc: t('achievementsDesc') },
                    { id: 'everything', label: t('everything'), desc: t('everythingDesc') }
                  ].map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => {
                        if (option.id === 'everything') {
                          const newValue = !exportOptions.everything;
                          setExportOptions({
                            campaign: newValue,
                            speedRun: newValue,
                            secretCodes: newValue,
                            achievements: newValue,
                            everything: newValue
                          });
                        } else {
                          setExportOptions(prev => ({
                            ...prev,
                            [option.id]: !prev[option.id as keyof typeof prev],
                            everything: false
                          }));
                        }
                      }}
                      className={`flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                        exportOptions[option.id as keyof typeof exportOptions]
                          ? (isInterstellar ? 'bg-orange-500/20 border-orange-500/50' : 'bg-cyan-500/20 border-cyan-500/50')
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${
                        exportOptions[option.id as keyof typeof exportOptions]
                          ? (isInterstellar ? 'bg-orange-500 border-orange-500' : 'bg-cyan-500 border-cyan-500')
                          : 'border-white/30'
                      }`}>
                        {exportOptions[option.id as keyof typeof exportOptions] && <CheckCircle2 size={12} className="text-black" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-[14px] font-orbitron font-bold ${exportOptions[option.id as keyof typeof exportOptions] ? 'text-white' : 'text-slate-400'}`}>
                          {option.label}
                        </p>
                        <p className="text-[15px] text-slate-500 font-mono uppercase tracking-widest">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-orbitron text-base uppercase tracking-widest rounded-lg transition-all border border-white/10"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={exportGameData}
                    className={`flex-1 py-3 ${isInterstellar ? 'bg-orange-500 hover:bg-orange-400' : 'bg-cyan-500 hover:bg-cyan-400'} text-black font-orbitron font-bold text-base uppercase tracking-widest rounded-lg transition-all shadow-lg`}
                  >
                    {t('exportButton')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {achievementNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-[1000] flex items-center gap-4 p-4 glass-panel neon-border-cyan bg-black/80 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)]"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 animate-pulse-glow">
              {(() => {
                const icons: any = { CheckCircle2, Coins, Sword, Bot, Globe, Cpu, Skull, Rocket, TrendingUp, Zap, HistoryIcon };
                const Icon = icons[achievementNotification.icon] || Trophy;
                return <Icon className="w-6 h-6 text-cyan-400" />;
              })()}
            </div>
            <div>
              <h4 className="text-base font-orbitron font-black text-cyan-400 uppercase tracking-[0.2em]">Conquista Desbloqueada!</h4>
              <p className="text-base font-orbitron font-bold text-white uppercase">{achievementNotification.name}</p>
              <p className="text-base text-slate-400 font-mono uppercase tracking-wider">{achievementNotification.description}</p>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <Trophy className="w-3 h-3 text-black" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route 2 Goals Modal */}
      <AnimatePresence>
        {showRoute2Goals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-4xl glass-panel ${isVoid ? 'neon-border-purple' : isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-2xl p-6 relative overflow-hidden flex flex-col max-h-[95vh]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${isVoid ? 'from-purple-500/5' : isInterstellar ? 'from-orange-500/5' : 'from-cyan-500/5'} to-transparent pointer-events-none`} />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className={`text-xl font-orbitron font-bold text-white tracking-widest uppercase ${isVoid ? 'neon-text-purple' : isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                    {isVoid ? t('projectEarthGoals') : isInterstellar ? t('route3Goals') : t('route2Goals')}
                  </h2>
                  <p className="text-base text-slate-500 font-mono uppercase tracking-widest">
                    {isVoid 
                      ? t('planetaryRestorationRequirements')
                      : isInterstellar 
                        ? t('galacticUnlockPath')
                        : t('interstellarUnlockPath')}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowRoute2Goals(false);
                    playSfx('close_window');
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 space-y-4 relative z-10">
                {(() => {
                  const goals = isVoid 
                    ? [
                      { id: 'energy', label: t('quantumCellsSent'), progress: earthReconstructionProgress.energy, current: (earthReconstructionProgress.energy || 0).toFixed(1) + '%', target: '100%' },
                      { id: 'minerals', label: t('compactedMineralCoresSent'), progress: earthReconstructionProgress.minerals, current: (earthReconstructionProgress.minerals || 0).toFixed(1) + '%', target: '100%' },
                      { id: 'tech', label: t('multifactorialDataCoresSent'), progress: earthReconstructionProgress.tech, current: (earthReconstructionProgress.tech || 0).toFixed(1) + '%', target: '100%' },
                      { id: 'food', label: t('colonizationRationsSent'), progress: earthReconstructionProgress.food, current: (earthReconstructionProgress.food || 0).toFixed(1) + '%', target: '100%' },
                      { id: 'meds', label: t('advancedMedicalKitsSent'), progress: earthReconstructionProgress.meds, current: (earthReconstructionProgress.meds || 0).toFixed(1) + '%', target: '100%' },
                    ]
                    : [
                      { id: 'techs', label: t('unlockAllTechs'), progress: (unlockedTechLevels[isInterstellar ? 'Interstellar' : 'Solar'] || 0) / (TECHNOLOGIES.filter(t => t.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length) * 100, current: unlockedTechLevels[isInterstellar ? 'Interstellar' : 'Solar'] || 0, target: TECHNOLOGIES.filter(t => t.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length },
                      { id: 'ships', label: t('buyAllShips'), progress: (Object.entries(ownedShips).filter(([k]) => k.startsWith(isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + Math.min(5, v), 0) / (SHIPS.filter(s => s.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5)) * 100, current: Object.entries(ownedShips).filter(([k]) => k.startsWith(isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + Math.min(5, v), 0), target: SHIPS.filter(s => s.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5 },
                      { id: 'upgrades', label: t('buyAllUpgrades'), progress: (Object.entries(techLevels).filter(([id]) => ROUTES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, levels]) => acc + Object.values(levels).reduce((a, b) => a + b, 0), 0) / (ROUTES.filter(r => r.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * UPGRADES.reduce((acc, u) => acc + u.tiers.length, 0))) * 100, current: Object.entries(techLevels).filter(([id]) => ROUTES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, levels]) => acc + Object.values(levels).reduce((a, b) => a + b, 0), 0), target: ROUTES.filter(r => r.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * UPGRADES.reduce((acc, u) => acc + u.tiers.length, 0) },
                      { id: 'auto', label: t('buyAllAutoSlots'), progress: (Object.entries(autoTravelSlots).filter(([id]) => ROUTES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0) / (ROUTES.filter(r => r.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5)) * 100, current: Object.entries(autoTravelSlots).filter(([id]) => ROUTES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0), target: ROUTES.filter(r => r.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5 },
                      { id: 'robots', label: t('buyAllRobots'), progress: (Object.entries(miningRobots).filter(([id]) => ORES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0) / (ORES.filter(o => o.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5)) * 100, current: Object.entries(miningRobots).filter(([id]) => ORES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0), target: ORES.filter(o => o.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5 },
                      { id: 'robotLevels', label: t('upgradeAllRobotsMax'), progress: (Object.entries(miningRobotLevels).filter(([id]) => ORES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0) / (ORES.filter(o => o.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5)) * 100, current: Object.entries(miningRobotLevels).filter(([id]) => ORES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0), target: ORES.filter(o => o.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 5 },
                      { id: 'compressions', label: t('upgradeRefinedCompression'), progress: (Object.entries(miningCompressionLevels).filter(([id]) => ORES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0) / (ORES.filter(o => o.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 10)) * 100, current: Object.entries(miningCompressionLevels).filter(([id]) => ORES_MAP.get(id)?.tier === (isInterstellar ? 'Interstellar' : 'Solar')).reduce((acc, [, v]) => acc + v, 0), target: ORES.filter(o => o.tier === (isInterstellar ? 'Interstellar' : 'Solar')).length * 10 },
                      { id: 'missions', label: `${t('missions')} ${language === 'pt' ? 'Concluídas' : 'Completed'}`, progress: Math.min(100, ((historyStats[isInterstellar ? 'Interstellar' : 'Solar']?.missionsCompleted || 0) / (isInterstellar ? 1000 : 100)) * 100), current: historyStats[isInterstellar ? 'Interstellar' : 'Solar']?.missionsCompleted || 0, target: isInterstellar ? 1000 : 100 },
                      { id: 'qc', label: `${t('reachQC')} ${isInterstellar ? '999 trilhÃµes' : '1 trilhão'} QC`, progress: Math.min(100, ((historyStats[isInterstellar ? 'Interstellar' : 'Solar']?.qcTotalAcquired || 0) / (isInterstellar ? 999000000000000 : 1000000000000)) * 100), current: formatValue(historyStats[isInterstellar ? 'Interstellar' : 'Solar']?.qcTotalAcquired || 0), target: formatValue(isInterstellar ? 999000000000000 : 1000000000000) },
                      { id: 'deliveries', label: `${t('total')} ${isInterstellar ? 9999 : 3000} ${t('deliveries')}`, progress: Math.min(100, ((historyStats[isInterstellar ? 'Interstellar' : 'Solar']?.deliveries || 0) / (isInterstellar ? 9999 : 3000)) * 100), current: historyStats[isInterstellar ? 'Interstellar' : 'Solar']?.deliveries || 0, target: isInterstellar ? 9999 : 3000 },
                    ];

                  return <EconomicGoals goals={goals as any} isInterstellar={isInterstellar} />;
                })()}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isInterstellar ? 'bg-orange-500' : 'bg-cyan-500'} animate-pulse`} />
                  <span className="text-[14px] text-slate-500 font-mono uppercase tracking-widest">
                    {language === 'pt' ? 'Sincronização em tempo real' : 'Real-time synchronization'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowRoute2Goals(false);
                    playSfx('close_window');
                  }}
                  className={`px-8 py-3 rounded-xl font-orbitron font-bold text-[14px] tracking-[0.2em] transition-all uppercase ${
                    isInterstellar ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-cyan-500 text-black hover:bg-cyan-400'
                  }`}
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Skill Map Modal */}
      <SkillMap 
        show={showSkillMap}
        onClose={() => {
          setShowSkillMap(false);
          playSfx('close_window');
        }}
        isInterstellar={isInterstellar}
        language={language}
        qc={qc}
        setQc={setQc}
        onUpgrade={handleSkillUpgrade}
        formatValue={formatValue}
        playSfx={playSfx}
        addLog={addLog}
        t={t}
        updateHistoryStats={updateHistoryStats}
        skills={[
          { 
            id: 'lendaria', 
            name: language === 'pt' ? 'Chance de Missão Lendária' : 'Legendary Mission Chance', 
            desc: language === 'pt' ? '+1% de chance por nível' : '+1% chance per level', 
            level: skillLendariaLevel[routeTier], 
            max: 15, 
            baseCost: routeTier === 'Solar' ? 5000 : 10000, 
            mult: 2.5,
            setter: (val: number) => setSkillLendariaLevel(prev => ({ ...prev, [routeTier]: val })),
            icon: Trophy,
            color: 'text-orange-400'
          },
          { 
            id: 'mitica', 
            name: language === 'pt' ? 'Chance de Missão Mítica' : 'Mythic Mission Chance', 
            desc: language === 'pt' ? '+1% de chance por nível' : '+1% chance per level', 
            level: skillMiticaLevel[routeTier], 
            max: 15, 
            baseCost: routeTier === 'Solar' ? 32500 : 50000, 
            mult: 3,
            setter: (val: number) => setSkillMiticaLevel(prev => ({ ...prev, [routeTier]: val })),
            icon: Zap,
            color: 'text-slate-300'
          },
          { 
            id: 'alien', 
            name: language === 'pt' ? 'Chance de Missão Alien' : 'Alien Mission Chance', 
            desc: language === 'pt' ? '+1% de chance por nível' : '+1% chance per level', 
            level: skillAlienLevel[routeTier], 
            max: 15, 
            baseCost: routeTier === 'Solar' ? 150000 : 250000, 
            mult: 4,
            setter: (val: number) => setSkillAlienLevel(prev => ({ ...prev, [routeTier]: val })),
            icon: Globe,
            color: 'text-green-400'
          },
          { 
            id: 'tempo', 
            name: language === 'pt' ? 'Tempo é dinheiro' : 'Time is Money', 
            desc: language === 'pt' ? '-1 entrega por nível (Base: 20)' : '-1 delivery per level (Base: 20)', 
            level: skillTempoDinheiroLevel[routeTier], 
            max: 15, 
            baseCost: routeTier === 'Solar' ? 9750 : 15000, 
            mult: 2.2,
            setter: (val: number) => setSkillTempoDinheiroLevel(prev => ({ ...prev, [routeTier]: val })),
            icon: Clock,
            color: 'text-cyan-400'
          },
          { 
            id: 'robos', 
            name: language === 'pt' ? 'RobÃ´s Olímpicos' : 'Olympic Robots', 
            desc: language === 'pt' ? '-1 pack por nível (Base: 10)' : '-1 pack per level (Base: 10)', 
            level: skillRobosOlimpicosLevel[routeTier], 
            max: 10, 
            baseCost: routeTier === 'Solar' ? 13000 : 20000, 
            mult: 2.8,
            setter: (val: number) => setSkillRobosOlimpicosLevel(prev => ({ ...prev, [routeTier]: val })),
            icon: Pickaxe,
            color: 'text-yellow-400'
        }
      ]}
    />

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-2xl p-8 text-center relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${isInterstellar ? 'from-orange-500/10' : 'from-cyan-500/10'} to-transparent pointer-events-none`} />
              
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6 animate-pulse" />
              
              <h2 className={`text-xl font-orbitron font-bold text-white mb-4 tracking-widest uppercase ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                {t('confirmReset')}
              </h2>
              
              <p className="text-[14px] font-orbitron text-slate-400 mb-8 leading-relaxed uppercase tracking-wider">
                {t('resetWarning') || 'This will permanently delete all your progress, ships, and upgrades. This action cannot be undone.'}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="py-3 rounded-lg font-orbitron text-base border border-white/10 text-white/60 hover:bg-white/5 transition-all uppercase tracking-widest"
                >
                  {t('cancel').toUpperCase()}
                </button>
                <button
                  onClick={async () => {
                    isResettingRef.current = true;
                    setIsLoaded(false);

                    // 1. Zerar todos os refs ANTES de qualquer outra coisa
                    qcRef.current = 100;
                    lastFlushedQcRef.current = 100;
                    aetherionRef.current = 0;
                    lastFlushedAetherionRef.current = 0;
                    miningWasteRef.current = 0;
                    lastFlushedWasteRef.current = 0;
                    solarEnergyRef.current = 0;
                    lastFlushedSolarRef.current = 0;
                    aetherionTubesRef.current = 0;
                    lastFlushedTubesRef.current = 0;
                    ownedShipsRef.current = {};
                    unlockedRouteIdsRef.current = [];
                    techLevelsRef.current = {};
                    unlockedTechLevelsRef.current = {};
                    autoTravelSlotsRef.current = {};
                    autoTravelActiveRef.current = {};
                    autoTravelDesiredRef.current = {};
                    miningRobotsRef.current = {};
                    miningRobotLevelsRef.current = {};
                    oresCollectedRef.current = {};
                    historyStatsRef.current = {};
                    battleLevelRef.current = 1;
                    routeTierRef.current = 'Solar';
                    pendingMissionProgressRef.current = {};

                    // 2. Resetar Redux
                    dispatch({ type: 'RESET_GAME' });

                    // 3. Apagar O SERVIDOR também â€” não só o localStorage
                    try {
                      await fetch('/api/save?key=time_travel_save', { method: 'DELETE' });
                      await fetch('/api/save?key=speed_run_save', { method: 'DELETE' });
                      await fetch('/api/save?key=colonies_data', { method: 'DELETE' });
                    } catch (e) {
                      console.warn('Server delete failed, continuing reset', e);
                    }

                    // 4. Apagar localStorage e sessionStorage completamente
                    localStorage.clear();
                    sessionStorage.clear();

                    // 5. Reload sem cache buster na URL
                    window.location.replace(window.location.origin + window.location.pathname);
                  }}
                  className="py-3 rounded-lg font-orbitron text-base bg-rose-600 text-white font-bold shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:bg-rose-500 transition-all uppercase tracking-widest"
                >
                  {t('reset').toUpperCase()}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {activeTutorial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} max-w-md w-full p-8 rounded-2xl relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${isInterstellar ? 'orange' : 'cyan'}-500 to-transparent`} />
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-16 h-16 rounded-full ${isInterstellar ? 'bg-orange-500/10 border-orange-500/30' : 'bg-cyan-500/10 border-cyan-500/30'} flex items-center justify-center border`}>
                  <Info className={`w-8 h-8 ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'}`} />
                </div>
                
                <div className="space-y-2">
                  <h2 className={`text-xl font-orbitron font-bold text-white uppercase tracking-widest ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                    {t(`tutorial${activeTutorial.charAt(0).toUpperCase() + activeTutorial.slice(1)}Title` as any)}
                  </h2>
                  <div className={`h-0.5 w-12 ${isInterstellar ? 'bg-orange-500/30' : 'bg-cyan-500/30'} mx-auto`} />
                </div>
                
                <p className="text-base text-slate-300 leading-relaxed font-inter">
                  {t(`tutorial${activeTutorial.charAt(0).toUpperCase() + activeTutorial.slice(1)}Desc` as any)}
                </p>
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span className="text-[14px] font-orbitron text-emerald-400 font-bold uppercase tracking-widest">
                    {activeTutorial === 'routes2' ? t('tutorialRoutes2Bonus') : t('tutorialBonus')}
                  </span>
                </div>
                
                <button
                  onClick={closeTutorial}
                  className={`w-full py-4 ${isInterstellar ? 'bg-orange-500 hover:bg-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]'} text-black font-orbitron font-bold text-[14px] tracking-[0.3em] rounded-xl transition-all active:scale-95 uppercase`}
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doom Protocol Info Modal */}
      <AnimatePresence>
        {showDoomProtocolInfo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-xl w-full overflow-hidden rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
            >
              {/* Cyberpunk Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-red-900/90" />
              <div className="absolute inset-0 bg-[url()] opacity-20 mix-blend-overlay" />
              
              {/* Animated Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                   animate={{ y: ["0%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-full h-1/4 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"
                />
              </div>

              <div className="relative p-8 space-y-6">
                {/* Header with Blinking Icon */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-12 h-12 rounded-xl bg-blue-500/30 border border-blue-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    >
                      <ShieldAlert className="w-6 h-6 text-blue-400" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] font-orbitron italic">
                        DOOM PROTOCOL
                      </h2>
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full" />
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDoomProtocolInfo(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="text-base text-blue-100 leading-relaxed font-inter font-medium drop-shadow-md space-y-3">
                    {language === 'pt' ? (
                      <>
                        <p className="text-blue-400 font-bold">Doom Protocol!</p>
                        <p>Um sistema de intervenção tática projetado para garantir superioridade em combate automático.</p>
                        <p>Ao contratar unidades especializadas, você aumenta drasticamente suas chances de vitória em confrontos pelo cosmos — seja em encontros aleatórios automáticos ou ao pular batalhas de radar.</p>
                        <p className="pt-2 border-t border-white/10">
                          <span className="text-purple-400 font-bold">O excesso de eficiência é recompensado:</span><br />
                          Toda chance de vitória que ultrapassar 100% é convertida em bônus adicionais sobre os recursos conquistados (apenas em resoluções automáticas).
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-blue-400 font-bold">Doom Protocol!</p>
                        <p>A tactical intervention system designed to ensure superiority in automatic combat.</p>
                        <p>By hiring specialized units, you drastically increase your victory chances in confrontations across the cosmos — in automatic random encounters or when skipping radar battles.</p>
                        <p className="pt-2 border-t border-white/10">
                          <span className="text-purple-400 font-bold">Excess efficiency is rewarded:</span><br />
                          Every victory chance exceeding 100% is converted into additional bonuses on conquered resources (automatic resolution only).
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <div className="h-1 bg-blue-500/50 rounded-full animate-pulse" />
                    <div className="h-1 bg-purple-500/50 rounded-full animate-pulse delay-75" />
                    <div className="h-1 bg-red-500/50 rounded-full animate-pulse delay-150" />
                  </div>
                </div>

                {/* Footer Button */}
                <button
                  onClick={() => setShowDoomProtocolInfo(false)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-orbitron font-black text-[14px] tracking-[0.4em] rounded-xl transition-all active:scale-95 uppercase shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-white/20"
                >
                  {language === 'pt' ? 'ENTENDIDO' : 'UNDERSTOOD'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Capture Info Modal */}
      <AnimatePresence>
        {showCaptureInfo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="relative max-w-xl w-full overflow-hidden rounded-3xl border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-red-900/90 to-yellow-900/90" />
              <div className="absolute inset-0  opacity-20 mix-blend-overlay" />
              
              <div className="relative p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/30 border border-orange-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] font-orbitron italic">
                        {language === 'pt' ? 'SISTEMA DE CAPTAÇÃO' : 'CAPTURE SYSTEM'}
                      </h2>
                      <div className="h-1 w-24 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-full" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowCaptureInfo(false);
                      playSfx('close_window');
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <p className="text-base text-slate-300 leading-relaxed">
                      {language === 'pt' 
                        ? 'O Sistema de Captação Interestelar é uma tecnologia avançada que permite extrair Quantum Credits (QC) diretamente do campo de batalha e de anomalias cósmicas.' 
                        : 'The Interstellar Capture System is an advanced technology that allows extracting Quantum Credits (QC) directly from the battlefield and cosmic anomalies.'}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-[14px] font-bold text-white uppercase">{language === 'pt' ? 'Bônus de Vitória' : 'Victory Bonus'}</p>
                          <p className="text-base text-slate-400">{language === 'pt' ? 'Aumenta massivamente os ganhos de QC em cada batalha vencida.' : 'Massively increases QC gains in each won battle.'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-[14px] font-bold text-white uppercase">{language === 'pt' ? 'Eficiência de Nódulo' : 'Node Efficiency'}</p>
                          <p className="text-base text-slate-400">{language === 'pt' ? 'Melhora a taxa de conversão de energia interestelar em créditos.' : 'Improves the conversion rate of interstellar energy into credits.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[14px] font-bold text-orange-400 uppercase tracking-widest">{language === 'pt' ? 'Status Atual' : 'Current Status'}</span>
                      <span className="text-[14px] font-mono text-white">LVL {captureLevel} / 10</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(captureLevel / 10) * 100}%` }}
                        className="h-full bg-gradient-to-r from-orange-600 to-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCaptureInfo(false);
                    playSfx('close_window');
                  }}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black text-base tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] uppercase"
                >
                  {language === 'pt' ? 'ENTENDIDO' : 'UNDERSTOOD'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setSelectedReward(null);
              playSfx('close_window');
            }}
          >
            <motion.div 
              className={`glass-panel p-8 rounded-3xl border ${selectedReward.color === 'emerald' ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]'} max-w-md w-full text-center space-y-6 relative overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Glow */}
              <div className={`absolute -top-24 -left-24 w-48 h-48 ${selectedReward.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-purple-500/10'} blur-[80px] rounded-full`} />
              <div className={`absolute -bottom-24 -right-24 w-48 h-48 ${selectedReward.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-purple-500/10'} blur-[80px] rounded-full`} />

              <div className={`w-20 h-20 rounded-2xl ${selectedReward.color === 'emerald' ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-purple-500/20 border-purple-500/40'} flex items-center justify-center mx-auto`}>
                <Star className={`w-10 h-10 ${selectedReward.color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'}`} />
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className={`text-base font-orbitron font-bold ${selectedReward.color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'} tracking-[0.3em] uppercase`}>
                  {language === "pt" ? `NÍVEL ${selectedReward.level} DESBLOQUEADO` : `LEVEL ${selectedReward.level} UNLOCKED`}
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {selectedReward.title}
                </h3>
                <div className="h-px w-12 bg-white/10 mx-auto my-4" />
                <p className="text-slate-300 text-base leading-relaxed font-medium">
                  {selectedReward.description}
                </p>

                {selectedReward.toggleable && (
                  <div className="pt-4 flex flex-col items-center gap-3">
                    <div className="text-base text-slate-500 uppercase font-bold tracking-widest">
                      {language === 'pt' ? 'Status da Melhoria' : 'Upgrade Status'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedReward.level === 30) setIsRetributionActive(!isRetributionActive);
                        if (selectedReward.level === 50) setIsFatigueActive(!isFatigueActive);
                        playSfx('toggle');
                      }}
                      className={`px-6 py-2 rounded-full border transition-all flex items-center gap-2 ${
                        (selectedReward.level === 30 ? isRetributionActive : isFatigueActive) 
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                          : "bg-white/5 border-white/10 text-slate-500"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${(selectedReward.level === 30 ? isRetributionActive : isFatigueActive) ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                      {(selectedReward.level === 30 ? isRetributionActive : isFatigueActive) 
                        ? (language === 'pt' ? 'ATIVADO' : 'ACTIVE') 
                        : (language === 'pt' ? 'DESATIVADO' : 'DISABLED')}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedReward(null);
                  playSfx('close_window');
                }}
                className={`w-full py-4 rounded-xl font-orbitron font-black text-[14px] tracking-[0.4em] transition-all active:scale-95 uppercase border ${selectedReward.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'} text-white`}
              >
                {language === 'pt' ? 'FECHAR' : 'CLOSE'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {foundBattle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-10 h-10 text-cyan-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {language === 'pt' ? 'Inimigo Detectado!' : 'Enemy Detected!'}
                </h3>
                <p className="text-slate-400 text-base">
                  {language === 'pt' 
                    ? 'Um sinal hostil foi localizado no setor. Prepare-se para o combate.' 
                    : 'A hostile signal has been located in the sector. Prepare for combat.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFoundBattle(null)}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 transition-all uppercase text-[14px]"
                >
                  {language === 'pt' ? 'Ignorar' : 'Ignore'}
                </button>
                <button
                  onClick={() => {
                    setActiveBattle(foundBattle);
                    setFoundBattle(null);
                  }}
                  className="py-3 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] uppercase text-[14px]"
                >
                  {language === 'pt' ? 'Atacar' : 'Attack'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      </AnimatePresence>

      <BattleOverlay
        activeBattle={activeBattle}
        routeTier={routeTier}
        language={language}
        t={t}
        formatValue={formatValue}
        finishBattle={finishBattle}
        resolveBattleVictory={resolveBattleVictory}
        resolveBattleDefeat={resolveBattleDefeat}
        setActiveBattle={setActiveBattle}
        playSfx={playSfx}
        stopSfx={stopSfx}
        addLog={addLog}
        voidResources={voidResources}
        shipLevel={shipLevel}
        battleLevel={battleLevel}
        privatePoliceLevel={privatePoliceLevel}
        getPoliceBonus={getPoliceBonus}
        ROUTES_MAP={ROUTES_MAP}
      />

      {/* Route 3 Confirmation Modal */}
      <AnimatePresence>
        {showRoute3Confirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full glass-panel border-2 border-purple-500/50 p-8 rounded-3xl space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  <Zap className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-3xl font-orbitron font-black text-purple-400 uppercase tracking-[0.3em]">
                  {t('startVoidProtocol')}
                </h2>
                <p className="text-base text-purple-200/60 font-mono uppercase tracking-widest leading-relaxed">
                  {language === 'pt' 
                    ? 'Ao avançar para a Era Sem Tempo, você deixará para trás seu império interestelar para enfrentar o desconhecido. Seus recursos serão resetados, mas uma nova tecnologia te aguarda.' 
                    : 'By advancing to the Timeless Era, you will leave behind your interstellar empire to face the unknown. Your resources will be reset, but a new technology awaits you.'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowRoute3Confirm(false);
                    setShowVoidLore(true);
                    setLoreLineIndex(0);
                    setActiveBattle(null);
                  }}
                  className="w-full py-5 bg-purple-600 text-white font-orbitron font-black text-xl rounded-xl hover:bg-purple-500 transition-all shadow-[0_0_40px_rgba(168,85,247,0.5)] uppercase tracking-[0.2em] border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
                >
                  {language === 'pt' ? 'EU ACEITO O DESAFIO' : 'I ACCEPT THE CHALLENGE'}
                </button>
                <button
                  onClick={() => setShowRoute3Confirm(false)}
                  className="w-full py-3 text-[14px] font-orbitron text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  {language === 'pt' ? 'AINDA NÃƒÆ’O ESTOU PRONTO' : 'I AM NOT READY YET'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Void Lore Screen */}
      <AnimatePresence>
        {showVoidLore && (
          <LoreScreen
            lines={VOID_LORE_LINES}
            currentIndex={loreLineIndex}
            onNext={() => {
              setLoreLineIndex(prev => prev + 1);
              playSfx('click');
            }}
            onComplete={startVoidTransition}
            language={language}
            theme="purple"
            completeText={language === 'pt' ? 'INICIAR ROTA 3' : 'START ROUTE 3'}
            videoSrc="/videos/bobby_blue/transition.webm"
          />
        )}
      </AnimatePresence>

      {/* Route 2 Lore Screen */}
      <AnimatePresence>
        {showRoute2Lore && (
          <LoreScreen
            lines={ROUTE2_LORE_LINES}
            currentIndex={loreLineIndex}
            onNext={() => {
              setLoreLineIndex(prev => prev + 1);
              playSfx('click');
            }}
            onComplete={() => {
              setShowRoute2Lore(false);
              startRoute2Transition();
            }}
            language={language}
            theme="orange"
            completeText={language === 'pt' ? 'INICIAR ROTA 2' : 'START ROUTE 2'}
            videoSrc="/videos/bobby_blue/transition.webm"
          />
        )}
      </AnimatePresence>

      {/* Void War Start Lore Screen */}
      <AnimatePresence>
        {voidWarRobotSpeaking && (
          <LoreScreen
            lines={language === 'pt' ? VOID_WAR_START_LORE.pt : VOID_WAR_START_LORE.en}
            currentIndex={loreLineIndex}
            onNext={() => {
              setLoreLineIndex(prev => prev + 1);
              playSfx('click');
            }}
            onComplete={() => {
              setVoidWarRobotSpeaking(false);
              setIsShaking(true);
              setIsFlashingRed(true);
              setVoidWarAlertActive(true);
              setShowInvasionAlertOverlay(true);
              
              setTimeout(() => {
                setIsShaking(false);
                setIsFlashingRed(false);
                setShowInvasionAlertOverlay(false);
              }, 3000);

              playSfx('alert_alert');
              setIsFirstInvasionBattle(true);
              addLog(language === 'pt' ? 'INVASÃƒO DETECTADA! Defenda a estrutura de reconstrução!' : 'INVASION DETECTED! Defend the reconstruction structure!', 'error');
            }}
            language={language}
            theme="purple"
            completeText={language === 'pt' ? 'DEFENDER TERRA' : 'DEFEND EARTH'}
            imageSrc="/images/bobby_blue/bobby_blue_fear.webp"
          />
        )}
      </AnimatePresence>

      {RestorationModal()}
      {RobotRepairModal()}
      {BattleShipUpgradeModal()}
      {VoidWarMap()}
      {FliperamasTutorialModal()}
      {showRoute3Ending && Route3EndingNarrativeModal()}
    </motion.div>
    </div>
  );
});

export const GameDashboard = memo((props: GameDashboardProps) => {
  return (
    <DashboardProvider language={props.language}>
      <DashboardContent {...props} />
    </DashboardProvider>
  );
});

export default GameDashboard;











