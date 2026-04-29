'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Map,
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
  Building2
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
import { Language } from '@/lib/i18n';
import { useGameAudio } from '@/hooks/useGameAudio';
import { GameStorage } from '@/lib/game-storage';
import { SaveManager } from '@/lib/save-manager';
import { SpaceAmbience } from './SpaceAmbience';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import { MiniGames } from './MiniGames';
import { ColonySystem, Colony, cleanColoniesData } from './ColonySystem';
import Lottie from 'lottie-react';

const ShipVisual = ({ ship, className = "" }: { ship: Ship; className?: string }) => {
  const [lottieData, setLottieData] = React.useState<any>(null);

  React.useEffect(() => {
    if (ship.lottie) {
      fetch(ship.lottie)
        .then(res => {
          const ct = res.headers.get('content-type') || '';
          if (!res.ok || !ct.includes('json')) {
            throw new Error(`Lottie fetch failed: ${res.status} (${ct})`);
          }
          return res.json();
        })
        .then(data => setLottieData(data))
        .catch(() => setLottieData(null));
    } else {
      setLottieData(null);
    }
  }, [ship.lottie]);

  if (ship.image) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={ship.image} 
          alt={ship.name} 
          className="max-w-full max-h-full object-contain drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
        />
      </div>
    );
  }

  if (ship.lottie && lottieData) {
    return (
      <div className={className}>
        <Lottie animationData={lottieData} loop={true} />
      </div>
    );
  }

  return <Rocket className={`${className} ${ship.color}`} />;
};

const EXTRACTION_PRODUCTION_VALUES = [1, 2, 4, 6, 8, 10, 15];
const EXTRACTION_PRODUCTION_COSTS = [0, 1000000, 4000000, 10000000, 30000000, 50000000, 500000000];

const ROUTE_3_END_STEPS = [
  { text: 'route3End_silence', type: 'info' },
  { text: 'route3End_noAlarms', type: 'info' },
  { text: 'route3End_noEnemies', type: 'info' },
  { text: 'route3End_tiredInterface', type: 'info' },
  { text: 'route3End_resources100', type: 'success' },
  { text: 'route3End_initiatingFinal', type: 'success' },
  { text: 'route3End_everythingFinished', type: 'info' },
  { text: 'route3End_theAttack', type: 'danger' },
  { text: 'route3End_noWarning', type: 'danger' },
  { text: 'route3End_spaceTears', type: 'danger' },
  { text: 'route3End_fleetsEmerge', type: 'danger' },
  { text: 'route3End_notLikeBefore', type: 'danger' },
  { text: 'route3End_blockade', type: 'danger' },
  { text: 'route3End_robotRestored', type: 'robot' },
  { text: 'route3End_robotWarning', type: 'robot' },
  { text: 'route3End_robotIntent', type: 'robot' },
  { text: 'route3End_theStand', type: 'danger' },
  { text: 'route3End_fightForSurvival', type: 'danger' },
  { text: 'route3End_evenSurrounded', type: 'danger' },
  { text: 'route3End_youWin', type: 'success' },
  { text: 'route3End_aftermath', type: 'info' },
  { text: 'route3End_debris', type: 'info' },
  { text: 'route3End_somethingWrong', type: 'info' },
  { text: 'route3End_anomalyDetected', type: 'danger' },
  { text: 'route3End_theTruth', type: 'info' },
  { text: 'route3End_robotAnalysing', type: 'robot' },
  { text: 'route3End_itWasATest', type: 'robot' },
  { text: 'route3End_youAreApproved', type: 'robot' },
  { text: 'route3End_protocolUpdated', type: 'robot' },
  { text: 'route3End_activation', type: 'success' },
  { text: 'route3End_earthResponds', type: 'success' },
  { text: 'route3End_energyFlows', type: 'success' },
  { text: 'route3End_theBreak', type: 'danger' },
  { text: 'route3End_interfaceFails', type: 'danger' },
  { text: 'route3End_controlsUnresponsive', type: 'danger' },
  { text: 'route3End_modeTransition', type: 'danger' },
  { text: 'route3End_route4Start', type: 'success' },
  { text: 'route3End_newInterface', type: 'info' },
  { text: 'route3End_robotFinal', type: 'robot' },
];

const translations = {
  en: {
    restoration: 'Restoration',
    eliminateEnemies: 'Eliminate Enemies!',
    restorationRobotMessage: 'Analyzing restoration progress... We are making history, pilot.',
    allResourcesReady: 'Finally, we are ready for the restart, we have sent the resources to Project Earth, we have everything we need, it is time to go...',
    voidWarAlert: 'ALERT! ALERT! We are being ATTACKED!',
    voidWarMap: 'Void Defense Map',
    route3End_silence: 'Silence.',
    route3End_noAlarms: 'For the first time since the start of the mission… there are no alarms.',
    route3End_noEnemies: 'There are no enemies.',
    route3End_tiredInterface: 'The interface flickers… as if it were tired.',
    route3End_resources100: '100% of resources collected.',
    route3End_initiatingFinal: 'Initiating final phase of Project Earth...',
    route3End_everythingFinished: 'For a brief moment… it seems that everything is over.',
    route3End_theAttack: '⚠️ THE ATTACK',
    route3End_noWarning: 'Without warning. Without logic. Without pattern.',
    route3End_spaceTears: 'The space around Earth… tears.',
    route3End_fleetsEmerge: 'Fleets emerge from all sides, as if they had always been there — just waiting.',
    route3End_notLikeBefore: 'They are not like the previous enemies. They do not advance. They surround.',
    route3End_blockade: 'A total blockade.',
    route3End_robotRestored: 'The screen trembles.\nThe robot, now stable, appears — but different.\nWithout glitches. Without pauses.',
    route3End_robotWarning: '"Boss… this is not a common attack."',
    route3End_robotIntent: '"They do not want to stop Project Earth. They want to stop… you."',
    route3End_theStand: 'THE LAST RESISTANCE',
    route3End_fightForSurvival: 'The player fights. Not for progress. Not for resources. But for survival.',
    route3End_evenSurrounded: 'And even surrounded… even at a disadvantage…',
    route3End_youWin: 'You win.',
    route3End_aftermath: 'AFTER THE WAR',
    route3End_debris: 'Debris floats. Enemy signals… disappear.',
    route3End_somethingWrong: 'But something is wrong. The system does not celebrate. There is no victory message.',
    route3End_anomalyDetected: 'Anomaly detected.',
    route3End_theTruth: 'THE TRUTH',
    route3End_robotAnalysing: 'The robot analyzes. It takes time. And then responds:',
    route3End_itWasATest: '"They were not trying to destroy Project Earth..."',
    route3End_youAreApproved: '"They were testing you. Patterns confirmed. You have been… approved."',
    route3End_protocolUpdated: 'Protocol Earth updated.',
    route3End_activation: 'ACTIVATION',
    route3End_earthResponds: 'Earth responds. Not as a planet. But as a system.',
    route3End_energyFlows: 'Energy flows through its surface. Lines of light form. The core awakens.',
    route3End_theBreak: 'THE BREAK',
    route3End_interfaceFails: 'The old interface begins to fail. Elements disappear. HUD fades away.',
    route3End_controlsUnresponsive: 'Controls cease to respond… for a second. And then—',
    route3End_modeTransition: '"Strategic mode ended. Execution mode initiated."',
    route3End_route4Start: 'ENTRY INTO ROUTE 4',
    route3End_newInterface: 'New interface. New reading. New control.',
    route3End_robotFinal: 'Boss… now… it is up to you. No calculations. No predictions. Just… reaction.',
    route3End_projectEarthInitiated: '(Route 4 - Project Earth initiated)',
    sector: 'Sector',
    cleared: 'CLEARED',
    lockedSector: 'LOCKED',
    battleProgress: 'Battle Progress',
    normalBattle: 'Normal Battle',
    eliteBattle: 'Elite Battle',
    bossBattle: 'Boss Battle',
    voidQuantumCellsSent: 'Quantum Cells Sent',
    voidMineralCoresSent: 'Compacted Mineral Cores Sent',
    voidDataCoresSent: 'Multifactorial Data Cores Sent',
    voidRationsSent: 'Colonization Rations Sent',
    voidMedicalKitsSent: 'Advanced Medical Kits Sent',
    improveRadar: 'Improve Radar',
    radarChance: 'Radar Chance',
    insufficientQCRadar: 'Insufficient QC to upgrade radar.',
    routes: 'Routes 1',
    routes2: 'Routes 2',
    upgrades: 'Upgrades',
    autoTravel: 'Auto-Travel',
    aetherion: 'Aetherion',
    trip: 'Trip',
    cce: 'CCE - Câmara de Contenção de Éteríon',
    cceConcept: 'A highly specialized facility that keeps Aetherion stable within controlled quantum fields.',
    aetherionConcept: 'A fuel based on quantum vacuum energy, capable of warping space-time around the ship.',
    aetherionRequired: 'Aetherion/Trip Required',
    insufficientAetherion: 'Insufficient Aetherion to maintain auto-travel.',
    insufficientAetherionCaps: 'Insufficient Aetherion Caps for jump.',
    aetherionConsumes: 'Consumes 1 Aetherion / 10s',
    rhse: 'Heliosingular Aetheric Synthesis Reactor (RHSE)',
    rhseConcept: 'An advanced reactor that recreates Aetherion artificially.',
    miningWaste: 'Mining Waste',
    solarEnergy: 'Filtered Solar Energy',
    aetherionTubes: 'Raw Aetherion Tubes',
    extractionTech: 'Extraction Technology',
    extractionTechConcept: 'Increases extraction of all mining in Route 2 by 10% per level.',
    doubleRoute: 'Double Route',
    doubleRouteConcept: 'Increases the value of deliveries for all Route 2 ships.',
    doomP: 'Doom P',
    doomPConcept: 'Increases win chance in automatic and radar battles.',
    solarMapping: 'Interstellar Capture Mapping',
    solarMappingConcept: 'Increases Solar and Interstellar Energy capture by 10% per level.',
    capture: 'Capture',
    captureConcept: 'Increases QC capture in all Route 2 battles.',
    synthesize: 'Synthesize Aetherion',
    maxCapacity: 'Max Capacity',
    options: 'Options',
    exit: 'Exit',
    exitGame: 'Exit Game',
    exitDesc: 'This will take you to the Main Menu and save your game automatically',
    activeDeliveries: 'Active Deliveries',
    noShips: 'No deliveries available.',
    emptySlot: 'Empty Hangar',
    coffeeMessage: [
      "All deliveries are being handled automatically by AI. Enjoy the moment ☕",
      "Fleet on autopilot. No action required.",
      "AI has taken full control of routes. Everything is flowing perfectly.",
      "Your delivery network is operating on its own. Impressive.",
      "No intervention needed. The galaxy keeps turning… and delivering.",
      "Systems stable. Deliveries in progress. You can relax.",
      "All ships are in automatic operation. Time for a coffee ☕",
      "Logistics optimized to the max. AI handles everything now.",
      "Your delivery empire is working without you. As it should be.",
      "Active routes. Growing profits. Zero effort required.",
      "AI is working for you. Enjoy this rare moment of peace.",
      "Everything under control. No ship needs commands.",
      "Deliveries in continuous flow. Maximum efficiency reached.",
      "Fleet fully automated. Your presence is optional.",
      "The AI is doing the heavy lifting. Go take a break!",
      "Autonomous operations active. Sit back and watch the credits roll in.",
      "Your logistics network is now self-sustaining. Well done.",
      "AI-driven efficiency. No manual input required at this time.",
      "All routes are automated. You've earned a rest.",
      "The machines are working. The galaxy is delivering. Relax ☕"
    ],
    settings: 'Settings',
    saveAndExit: 'Save & Exit',
    resetProgress: 'Reset Progress',
    confirmReset: 'Are you sure you want to reset all progress?',
    routes1: 'Routes 1',
    void_aircraft: 'Aircraft',
    void_battle: 'Battle',
    void_map: 'Star Map',
    void_war: 'Colonization Core',
    void_earth: 'Earth',
    missionReward: 'Mission Reward',
    noMissions: 'No active missions.',
    claim: 'Claim',
    availableDeliveries: 'Available Deliveries',
    locked: 'Locked',
    readyToUnlock: 'Ready to Unlock',
    unlock: 'Unlock',
    cargo: 'Cargo',
    reward: 'Reward',
    launch: 'Launch',
    export: 'Export',
    import: 'Import',
    exportTitle: 'What would you like to export:',
    campaign: 'Campaign',
    campaignDesc: '(Saves the data of all Routes)',
    exportSpeedRun: 'Speed Run',
    exportSpeedRunDesc: '(The local Top 10 time ranking)',
    secretCodes: 'Secret Codes',
    secretCodesDesc: '(Keep already discovered codes)',
    everything: 'Everything',
    everythingDesc: '(All selected choices)',
    achievements: 'Achievements',
    achievementsDesc: '(All unlocked achievements)',
    exportButton: 'Export Now',
    importSuccess: 'Data imported successfully!',
    importError: 'Error importing data. Check the file.',
    owned: 'Owned',
    buy: 'Buy',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    manageInfrastructure: 'Manage local infrastructure',
    music: 'Music',
    soundEffects: 'Sound Effects',
    language: 'Language',
    portuguese: 'Portuguese',
    english: 'English',
    on: 'On',
    off: 'Off',
    insufficientQC: 'Insufficient QC for fuel',
    hangarFull: 'Hangar full. Wait for deliveries to complete.',
    standby: 'Standby',
    waitingForHangar: 'Waiting for Hangar',
    shipLaunched: 'Ship launched for',
    cost: 'Cost',
    deliverySuccess: 'Delivery successful!',
    deliveryFailed: 'Delivery failed! Ship lost.',
    autoDeliverySuccess: 'Auto-delivery successful!',
    autoDeliveryFailed: 'Auto-delivery failed! Retrying...',
    perfectBonus: 'PERFECT BONUS!',
    rareBonus: 'RARE CARGO BONUS!',
    routeUnlocked: 'Route unlocked:',
    autoTravelUnlocked: 'Auto-travel unlocked for',
    jump: 'JUMP',
    back: 'Back',
    level: 'Level',
    max: 'MAX',
    deliveries: 'Deliveries',
    logisticsInterface: 'Logistics Management Interface',
    bonus: 'Bonus',
    upgrade: 'Upgrade',
    req: 'Req',
    earned: 'Earned',
    complete: 'complete',
    conditionsNotMet: 'Conditions not met to unlock',
    insufficientQCUnlock: 'Insufficient QC to unlock this route.',
    maxLevelLog: 'is already at maximum level for this location.',
    for: 'for',
    to: 'to',
    insufficientQCUpgrade: 'Insufficient QC for upgrade.',
    insufficientQCAutoTravel: 'Insufficient QC for Auto-Travel.',
    route2UnlockDesc: 'You have reached the peak of the Solar System. Ready to go beyond?',
    startInterstellarProtocol: 'Start Interstellar Protocol',
    speedRunMode: 'Speed Run Mode Active',
    speedRunDesc: 'Reach the ultimate peak of the Solar System! Buy and upgrade everything in Route 1 to complete the run.',
    total: 'Total',
    autoTravelSlots: 'Auto Travel Slots',
    autoTravelSlotsDesc: 'Maximum concurrent auto-deliveries.',
    upgradeSlots: 'Upgrade Slots',
    maxSlotsReached: 'Maximum slots reached.',
    insufficientQCSlots: 'Insufficient QC for slots upgrade.',
    autoTravelSlotsUpgraded: 'Auto Travel Slots upgraded to',
    aircraft: 'Aircraft',
    technology: 'Technology',
    research: 'Research',
    unlocked: 'Unlocked',
    alreadyUnlocked: 'Already Unlocked',
    unlocksShip: 'Unlocks Ship Level',
    researching: 'Researching...',
    completeResearch: 'Complete Research',
    free: 'Free',
    fleet: 'Fleet of Ships',
    maxShips: 'Maximum ships per level reached.',
    insufficientQCShips: 'Insufficient QC to build ship.',
    shipBuilt: 'Ship built:',
    requiredShip: 'Required Ship',
    speed: 'Speed',
    tech: 'Tech',
    range: 'Range',
    build: 'Build',
    resetWarning: 'This will permanently delete all your progress, ships, and upgrades. This action cannot be undone.',
    cancel: 'Cancel',
    reset: 'Reset',
    speedRunComplete: 'SPEED RUN COMPLETE!',
    pilot: 'PILOT',
    finalTime: 'FINAL TIME',
    returnToCommandCenter: 'RETURN TO COMMAND CENTER',
    mining: 'Mining',
    ores: 'Ores',
    robots: 'Robots',
    sellPacks: 'Sell Packs',
    autoSell: 'Auto-Sell',
    miningRate: 'Mining Rate',
    efficiency: 'Efficiency',
    production: 'Production',
    units: 'units',
    pack: 'pack',
    buyRobot: 'Buy Robot',
    upgradeRobot: 'Upgrade Robot',
    oreCollected: 'Ore Collected',
    miningRobots: 'Mining Robots',
    miningUpgrades: 'Mining Upgrades',
    miningUnlocked: 'Mining unlocked for',
    autoSellUnlocked: 'Auto-Sell unlocked!',
    insufficientQCRobot: 'Insufficient QC for robot.',
    maxRobotsReached: 'Maximum robots reached.',
    robotUpgraded: 'Robot upgraded to level',
    tutorialMiningTitle: 'Mining Tutorial',
    tutorialMiningDesc: 'Welcome to the Mining sector! Here you can buy robots to extract precious ores. Each robot works automatically. When you collect enough ore, you can sell it in packs for QC. You can also upgrade your robots to increase efficiency.',
    tutorialAircraftTitle: 'Aircraft Tutorial',
    tutorialAircraftDesc: 'This is your fleet management. Build more ships to increase your delivery capacity. Higher level ships can reach further destinations and carry more cargo.',
    tutorialUpgradesTitle: 'Upgrades Tutorial',
    tutorialUpgradesDesc: 'Improve your infrastructure here. You can upgrade engines for speed, AI for better delivery success, and market value for higher rewards.',
    tutorialAutoTitle: 'Auto-Travel Tutorial',
    tutorialAutoDesc: 'Automate your routes! Buy auto-travel slots to let your ships deliver cargo without manual intervention. Perfect for passive income while you manage other sectors.',
    tutorialTechnologyTitle: 'Technology Tutorial',
    tutorialTechnologyDesc: 'Welcome to the Research Lab! Here you can unlock new ship levels. Researching technologies allows you to build more advanced ships that can reach further destinations. The first level is free, but others require QC and time.',
    tutorialBonus: 'Tutorial Bonus: +1000 QC!',
    tutorialRoutes2Title: 'Route 2 Tutorial',
    tutorialRoutes2Desc: 'Welcome to the Intergalactic sector! Here, distances are measured in billions of kilometers and the rewards are astronomical. You have proven yourself in the Solar System, now it is time to conquer the galaxy.\n\nCongratulations, you won the Pulsar 1, a level 1 ship to start your journey.',
    tutorialRoutes2Bonus: 'Tutorial Bonus: +1000 QC!',
    tutorialMissionsTitle: 'Missions Tutorial',
    tutorialMissionsDesc: 'Welcome to the Missions sector! Here you can complete special tasks to earn extra QC. Missions are generated based on your progress. Complete them to clear space for new ones!',
    tutorialHistoryTitle: 'History Tutorial',
    tutorialHistoryDesc: 'Welcome to the History sector! Here you can track your progress, see your total deliveries, and check your earnings from different sources. It is a great way to see how far you have come in your journey.',
    route2UnlockTitle: 'Route 2 Unlocked',
    route2UnlockedMessage: '🌌 Route 2 Unlocked\n\nCongratulations, pilot. You have conquered the Solar System.\n\nTo advance to the Interstellar Expansion, you will give up your entire current empire to start a new journey from scratch.\n\nCongratulations, you won the Pulsar 1, a level 1 ship to start your journey.\n\nReady for the next leap?',
    route2TransitionMessage: '🌌 Route 2 Unlocked\n\nCongratulations, pilot. You have conquered the Solar System.\n\nTo advance to the Interstellar Expansion, you will give up your entire current empire to start a new journey from scratch.\n\nCongratulations, you won the Pulsar 1, a level 1 ship to start your journey.\n\nReady for the next leap?',
    resolution: 'Resolution',
    displayMode: 'Display Mode',
    fullscreen: 'Fullscreen',
    windowed: 'Windowed',
    native: 'System Native',
    close: 'Close',
    // Route Names
    'Terra para Lua': 'Terra to Lua',
    'Terra para Marte': 'Terra to Marte',
    'Terra para Vênus': 'Terra to Vênus',
    'Terra para Mercúrio': 'Terra to Mercúrio',
    'Terra para Júpiter': 'Terra to Júpiter',
    'Terra para Saturno': 'Terra to Saturno',
    'Terra para Urano': 'Terra to Urano',
    'Terra para Netuno': 'Terra to Netuno',
    'Terra para Sol': 'Terra to Sol',
    'Terra para Proxima Centauri': 'Terra to Proxima Centauri',
    'Terra para Alpha Centauri': 'Terra to Alpha Centauri',
    'Terra para Sirius': 'Terra to Sirius',
    'Terra para Vega': 'Terra to Vega',
    'Terra para Betelgeuse': 'Terra to Betelgeuse',
    'Terra para Rigel': 'Terra to Rigel',
    'Terra para Arcturus': 'Terra to Arcturus',
    'Terra para Antares': 'Terra to Antares',
    'Terra para Canopus': 'Terra to Canopus',
    // Locations
    'Terra': 'Terra',
    'Lua': 'Lua',
    'Marte': 'Marte',
    'Vênus': 'Vênus',
    'Mercúrio': 'Mercúrio',
    'Júpiter': 'Júpiter',
    'Saturno': 'Saturno',
    'Urano': 'Urano',
    'Netuno': 'Netuno',
    'Sol': 'Sol',
    'Proxima Centauri': 'Proxima Centauri',
    'Alpha Centauri': 'Alpha Centauri',
    'Sirius': 'Sirius',
    'Vega': 'Vega',
    'Betelgeuse': 'Betelgeuse',
    'Rigel': 'Rigel',
    'Arcturus': 'Arcturus',
    'Antares': 'Antares',
    'Canopus': 'Canopus',
    // Cargo Types
    'Tecnologia': 'Technology',
    'Artefatos': 'Artifacts',
    'Minerais': 'Minerals',
    'Biológico': 'Biological',
    'Dados': 'Data',
    'Energia': 'Energy',
    // Ship Descriptions
    'A Atlas Courier é uma pequena nave atmosférica usada para entregas dentro da Terra. Não possui motor de dobra ou tecnologia de salto espacial, sendo projetada apenas para rotas locais rápidas dentro do planeta.': 'The Atlas Courier is a small atmospheric ship used for deliveries within Earth. It has no warp drive or space jump technology, being designed only for fast local routes within the planet.',
    'A Lunar Runner é otimizada para viagens entre a Terra e a Lua. Seu motor de íons permite escapar eficientemente da gravidade da Terra, mas ainda depende de viagens convencionais sem motor de dobra.': 'The Lunar Runner is optimized for travel between Earth and the Moon. Its ion engine allows it to efficiently escape Earth\'s gravity, but it still relies on conventional travel without a warp drive.',
    'A Solar Swift é a primeira nave da frota equipada com um motor experimental de pré-dobra. Ela acelera a uma alta velocidade sub-luz e então ativa um micro-salto que encurta drasticamente a distância até seu destino.': 'The Solar Swift is the first ship in the fleet equipped with an experimental pre-warp engine. It accelerates to high sub-light speed and then activates a micro-jump that drastically shortens the distance to its destination.',
    'A Red Horizon utiliza uma versão mais estável da tecnologia de dobra. Após atingir velocidade suficiente, o motor gera uma pequena distorção no espaço-tempo que permite saltos curtos entre órbitas planetárias.': 'The Red Horizon uses a more stable version of warp technology. After reaching sufficient speed, the engine generates a small space-time distortion that allows short jumps between planetary orbits.',
    'Projetada para operar perto do Sol, a Helios Freighter possui blindagem térmica avançada e um núcleo de dobra comercial capaz de saltos espaciais mais longos após atingir velocidade sub-luz.': 'Designed to operate near the Sun, the Helios Freighter has advanced thermal shielding and a commercial warp core capable of longer space jumps after reaching sub-light speed.',
    'A Jovian Hauler foi projetada para rotas profundas no Sistema Solar. Ao atingir sua velocidade de ativação, ela gera um campo de dobra que encurta a distância entre dois pontos, permitindo viagens rápidas sem exceder a velocidade da luz.': 'The Jovian Hauler was designed for deep routes in the Solar System. Upon reaching its activation speed, it generates a warp field that shortens the distance between two points, allowing fast travel without exceeding the speed of light.',
    'A Titan Carrier é uma nave de carga pesada capaz de manter um campo de dobra por períodos prolongados. Isso permite atravessar vastas distâncias no Sistema Solar mantendo um tempo de entrega constante.': 'The Titan Carrier is a heavy cargo ship capable of maintaining a warp field for prolonged periods. This allows it to traverse vast distances in the Solar System while maintaining a constant delivery time.',
    'A Void Strider utiliza um núcleo de dobra quântico que cria um túnel temporário no espaço-tempo. A nave não viaja mais rápido que a luz — ela encurta o espaço entre a origem e o destino.': 'The Void Strider uses a quantum warp core that creates a temporary tunnel in space-time. The ship does not travel faster than light — it shortens the space between origin and destination.',
    'A Neptune Vanguard representa o auge da engenharia humana. Ao atingir sua velocidade de ativação, o núcleo quântico abre um salto espacial instantâneo, teletransportando a nave através de bilhões de quilômetros sem violar as leis da relatividade.': 'The Neptune Vanguard represents the pinnacle of human engineering. Upon reaching its activation speed, the quantum core opens an instantaneous space jump, teleporting the ship across billions of kilometers without violating the laws of relativity.',
    'Uma nave experimental de travessia interestelar inicial. Equipada com um reator de pulso instável, ela marca o primeiro passo da humanidade além dos limites do sistema solar. Frágil, mas revolucionária.': 'An initial experimental interstellar crossing ship. Equipped with an unstable pulse reactor, it marks humanity\'s first step beyond the limits of the solar system. Fragile, but revolutionary.',
    'Versão refinada do protótipo original. Seu núcleo foi estabilizado, permitindo viagens mais longas com menor risco de colapso energético. Ainda limitada, mas muito mais confiável.': 'Refined version of the original prototype. Its core has been stabilized, allowing longer travel with less risk of energy collapse. Still limited, but much more reliable.',
    'Projetada para cortar o vazio interestelar com eficiência. Utiliza captação de energia residual de nebulosas e poeira cósmica para alimentar seus sistemas auxiliares.': 'Designed to cut through the interstellar void efficiently. Uses residual energy capture from nebulae and cosmic dust to power its auxiliary systems.',
    'O primeiro modelo a utilizar antimatéria como combustível principal. Seus motores de alta performance permitem alcançar sistemas estelares distantes em tempo recorde.': 'The first model to use antimatter as its primary fuel. Its high-performance engines allow it to reach distant stellar systems in record time.',
    'Uma maravilha da engenharia óptica. Utiliza feixes de laser concentrados para impulsionar velas de fótons, atingindo velocidades próximas à da luz.': 'A marvel of optical engineering. Uses concentrated laser beams to propel photon sails, reaching speeds close to the speed of light.',
    'Utiliza uma micro-singularidade artificial para curvar o espaço-tempo à sua frente, permitindo viagens interestelares massivas com consumo mínimo de energia.': 'Uses an artificial micro-singularity to bend space-time in front of it, allowing massive interstellar travel with minimal energy consumption.',
    'Uma nave de alta potência projetada para exploração profunda. Seus motores de fusão avançados fornecem empuxo constante para travessias de longo alcance.': 'A high-power ship designed for deep exploration. Its advanced fusion engines provide constant thrust for long-range crossings.',
    'O ápice da tecnologia de dobra. Capaz de comprimir o espaço-tempo de forma tão eficiente que as distâncias interestelares parecem meros saltos orbitais.': 'The pinnacle of warp technology. Capable of compressing space-time so efficiently that interstellar distances seem like mere orbital jumps.',
    'A fronteira final da tecnologia. Utiliza flutuações quânticas para existir em múltiplos pontos do espaço simultaneamente, tornando a distância um conceito obsoleto.': 'The final frontier of technology. Uses quantum fluctuations to exist in multiple points of space simultaneously, making distance an obsolete concept.',
    // Upgrade Bonuses
    '+25% Velocidade': '+25% Speed',
    '+50% Velocidade': '+50% Speed',
    '+75% Velocidade': '+75% Speed',
    '+100% Velocidade': '+100% Speed',
    'Instantâneo': 'Instant',
    '75% Sucesso': '75% Success',
    '80% Sucesso': '80% Success',
    '85% Sucesso': '85% Success',
    '90% Sucesso': '90% Success',
    '100% Sucesso': '100% Success',
    '100% Sucesso + 50% Perfeita': '100% Success + 50% Perfect',
    '+50% Lucro': '+50% Profit',
    '+100% Lucro': '+100% Profit',
    '+200% Lucro': '+200% Profit',
    '+400% Lucro': '+400% Profit',
    '+1000% Lucro': '+1000% Profit',
    '10% Chance (10x)': '10% Chance (10x)',
    '15% Chance (10x)': '15% Chance (10x)',
    '20% Chance (10x)': '20% Chance (10x)',
    '25% Chance (10x)': '25% Chance (10x)',
    '35% Chance (10x)': '35% Chance (10x)',
    history: 'History',
    missions: 'Missions',
    colonies: 'Colonies',
    missionsCompleted: 'Missions Completed',
    qcFromMissions: 'QC from Missions',
    startVoidProtocol: 'START VOID PROTOCOL',
    route3UnlockDesc: 'Time is no longer what it used to be. The Void calls you.',
    route3UnlockedMessage: '🌌 Route 3 Unlocked\n\nThe universe has changed. Time has distorted.\n\nYou are about to enter the Timeless Era.\n\nReady for the Void?',
    formatNumbers: 'Format Numbers',
    totalDeliveries: 'Total Deliveries',
    manual: 'Manual',
    auto: 'Automatic',
    qcFromDeliveries: 'QC from Deliveries',
    qcFromMining: 'QC from Mining',
    qcSpent: 'Total QC Spent',
    qcTotalAcquired: 'Total QC Acquired',
    gameStatsByRoute: 'Game Statistics by Route',
    manualDeliveries: 'Manual Deliveries',
    autoDeliveries: 'Automatic Deliveries',
    totalQCAcquired: 'Total QC Acquired',
    fromDeliveries: 'From Deliveries',
    fromMining: 'From Mining',
    totalQCSpent: 'Total QC Spent',
    mythicChance: 'Mythic Chance',
    alienChance: 'Alien Chance',
    legendaryChance: 'Legendary Chance',
    refinedCompression: 'Refined Compression',
    battleLevel: 'Battle Level',
    definition: 'Definition',
    findBattle: 'Find Battle',
    winProbability: 'Win Probability',
    attack: 'Attack',
    retreat: 'Retreat',
    searching: 'Searching...',
    noBattleFound: 'No battle found.',
    battleFound: 'Enemy Detected!',
    upgradeBattleLevel: 'Upgrade Battle Level',
    hpBonus: 'HP Bonus',
    dmgBonus: 'Damage Bonus',
    mission1Title: 'Início de Tudo',
    mission1Desc: 'Visitar a aba Tecnologia e ler o minitutorial e iniciar a tecnologia "Fundação Orbital"!',
    mission2Title: 'Ampliando frotas',
    mission2Desc: 'Visitar a Aba "Aeronaves" e ler o minitutorial e comprar uma nave "Atlas Courier"!',
    mission3Title: 'Esquentando motores',
    mission3Desc: 'Visitar a aba "Melhorias" e ler o minitutorial. Melhorar o motor para nível 1!',
    mission4Title: 'Voando longe',
    mission4Desc: 'Visitar a aba "Rotas 1" e ler o minitutorial. Iniciar a primeira entrega manual!',
    mission5Title: 'Usando a IA',
    mission5Desc: 'Visitar a aba "Automática" e ler o minitutorial. Comprar o primeiro Slot de entrega automática!',
    mission6Title: 'Minerando',
    mission6Desc: 'Visitar a aba "Mineração" e ler o minitutorial! Comprar o primeiro Robô!',
    combatLevelIncreased: 'COMBAT LEVEL INCREASED: Level',
    insufficientQCBattleLevel: 'Insufficient QC to upgrade battle level.',
    battleLevelIncreased: 'BATTLE LEVEL INCREASED: Level',
    radarUpgraded: 'RADAR UPGRADED: Level',
    radarCooldown: 'Radar on cooldown. Wait',
    startingScan: 'Starting sector scan...',
    motherShip: 'MOTHER SHIP (BOSS)',
    eliteCruiser: 'Elite Cruiser',
    alienCruiser: 'Alien Cruiser',
    spacePirate: 'Space Pirate',
    alienScout: 'Alien Scout',
    targetLocated: 'TARGET LOCATED!',
    noSignalDetected: 'No signal detected in sector.',
    startingSectorScan: 'Starting sector scan...',
    sectorRadar: 'Sector Radar',
    chance: 'CHANCE',
    scanning: 'Scanning...',
    scan: 'Scan',
    privatePoliceUpgraded: 'PRIVATE POLICE UPGRADED!',
    skipBattles: 'Skip Battles',
    combatProficiency: 'Your combat proficiency',
    nextLevel: 'Next Level',
    levelRewards: 'Level Rewards',
    hp: 'HP',
    atk: 'ATK',
    captureUpgraded: 'CAPTURE UPGRADED!',
    defeatShipDestroyed: 'DEFEAT: Your ship was destroyed!',
    insufficientAetherionAlert: 'INSUFFICIENT AETHERION!',
    shieldActivated: 'SHIELD ACTIVATED: Ship invulnerable for',
    autoDeliveryInterrupted: 'Auto-delivery to',
    interruptedByDefeat: 'interrupted by defeat!',
    deliveryUnderAttack: 'Delivery to',
    underAttack: 'is under attack!',
    minerals: 'Minerals',
    energy: 'Energy',
    food: 'Food',
    meds: 'Medical Supplies',
    criticalDamage: 'Critical Damage',
    criticalChance: 'Critical Chance',
    loot: 'Loot Efficiency',
    storage: 'Storage',
    time: 'Time',
    autoDeliveryStopped: 'Auto-delivery to',
    stoppedDueToDefeat: 'stopped due to defeat.',
    spaceCombat: 'SPACE COMBAT',
    fleetLevel: 'FLEET LEVEL',
    laserBeam: 'LASER BEAM',
    plasmaBeam: 'PLASMA BEAM',
    specialBeam: 'SPECIAL BEAM',
    shield: 'SHIELD',
    skipBattle: 'SKIP BATTLE',
    victory: 'VICTORY',
    defeat: 'DEFEAT',
    rewardsReceived: 'REWARDS RECEIVED',
    shipDestroyedCargoLost: 'YOUR SHIP WAS DESTROYED AND CARGO LOST',
    continue: 'CONTINUE',
    manualDeliveryLimit: 'Manual delivery limit of 25 reached!',
    synthesisComplete: 'SYNTHESIS COMPLETE: +',
    alertDeliveryUnderAttack: 'ALERT: Delivery to',
    shieldDeactivated: 'SHIELD DEACTIVATED',
    rare: 'RARE',
    legendary: 'LEGENDARY',
    mythic: 'MYTHIC',
    common: 'COMMON',
    skillMap: 'Skill Map',
    baseMissionValueIncreased: 'Base mission value increased to level',
    missionRadarUnlocked: 'Mission Radar unlocked!',
    insufficientQCForRadar: 'Insufficient QC for Radar',
    required: 'required',
    autoClaimMissionsActivated: 'Auto-Claim Missions activated!',
    autoClaimMissionsDeactivated: 'Auto-Claim Missions deactivated!',
    buyRadar: 'BUY RADAR',
    autoClaim: 'AUTO CLAIM',
    defectiveRobot: 'Defective Robot',
    robotRepairHeader: 'Defective Robot',
    repairProgress: 'Repair Progress',
    repairDesc: 'Consume resources to restore robot systems.',
    robotGlitchedDialogue: 'He...llo... Bo...ss. We we...re atta...cked!...\nAre y..ou o...kay?\nI ne...e...d re...pai...rs...',
    robotRepairedDialogue: 'Thank you, Boss.\nSystems restored.\n\nLet us continue with Protocol Earth...\nBut first...\n\nVengeance.\n\nLet us defeat them ALL!!',
    upgradeBattleShip: 'Upgrade Battle Ship',
    upgradeBattleShipDesc: 'Focused exclusively on the Route 3 / transition battle ship',
    repairButton: 'REPAIR',
    baseDamageBonus: '+20% Base Damage',
    critDamageBonus: '+200 Crit Damage',
    upgradeLimitBonus: '+10 Upgrade Levels',
    exitWarning: 'This will take you to the home menu and save your progress automatically. All automatic mode will be disabled, resting and cooling the engines.',
    confirmAndExit: 'CONFIRM AND EXIT',
    projectEarthGoals: 'Project Earth Goals',
    route3Goals: 'Route 3 Goals',
    route2Goals: 'Route 2 Goals',
    dataLostInTime: 'Data lost in time',
    totalDeliveriesBattlesMining: 'Total Deliveries, Battles and Mining',
    randomBattlesFound: 'Random Battles Found',
    radarBattlesFound: 'Radar Battles Found',
    totalMiningPacksSold: 'Total Mining Packs Sold',
    totalExplorationMiningPacksSold: 'Total Exploration Mining Packs Sold',
    fromExplorationMining: 'From Exploration Mining',
    fromMissions: 'From Missions',
    fromAllBattles: 'From all Battles',
    fromAllSources: 'From all sources',
    battle: 'Battle',
    savingProgress: 'Saving Progress',
    syncingData: 'Syncing data with neural network...',
    completed: 'Completed',
    processing: 'Processing...',
    systemUnlocked: 'SYSTEM UNLOCKED',
    conqueredSolarSystem: 'You have conquered the Solar System.',
    interstellarJourneyStarts: 'Your interstellar journey begins now.',
    sacrificeRequired: 'SACRIFICE IS REQUIRED',
    towardsNextLeap: 'TOWARDS THE NEXT LEAP',
    start: 'START',
    planetaryRestorationRequirements: 'Requirements for final planetary restoration',
    galacticUnlockPath: 'Required path for galactic unlock',
    interstellarUnlockPath: 'Required path for interstellar unlock',
    quantumCellsSent: 'Quantum Cells sent',
    compactedMineralCoresSent: 'Compacted Mineral Cores sent',
    multifactorialDataCoresSent: 'Multifactorial Data Cores sent',
    colonizationRationsSent: 'Colonization Rations sent',
    advancedMedicalKitsSent: 'Advanced Medical Kits sent',
    unlockAllTechs: 'Unlock ALL technologies',
    buyAllShips: 'Buy all ships (5 of each)',
    buyAllUpgrades: 'Buy ALL location upgrades',
    buyAllAutoSlots: 'Buy ALL auto-travel slots',
    buyAllRobots: 'Buy ALL mining robots',
    upgradeAllRobotsMax: 'Upgrade ALL robots to max',
    upgradeRefinedCompression: 'Upgrade Refined Compression',
    reachQC: 'Reach',
    total5000Deliveries: 'Total of 3000 deliveries',
    realTimeSync: 'Real-time synchronization',
    permanentMissionUpgrades: 'Permanent upgrades for your missions',
    legendaryMissionChance: 'Legendary Mission Chance',
    mythicMissionChance: 'Mythic Mission Chance',
    alienMissionChance: 'Alien Mission Chance',
    timeIsMoney: 'Time is Money',
    olympicRobots: 'Olympic Robots',
    understood: 'UNDERSTOOD',
    captureSystem: 'CAPTURE SYSTEM',
    victoryBonus: 'Victory Bonus',
    victoryBonusDesc: 'Massively increases QC gains in each won battle.',
    nodeEfficiency: 'Node Efficiency',
    nodeEfficiencyDesc: 'Improves the conversion rate of interstellar energy into credits.',
    currentStatus: 'Current Status',
    levelUnlocked: 'LEVEL UNLOCKED',
    upgradeStatus: 'Upgrade Status',
    disabled: 'DISABLED',
    enemyDetected: 'Enemy Detected!',
    ignore: 'Ignore',
    acceptChallenge: 'I ACCEPT THE CHALLENGE',
    notReadyYet: 'I AM NOT READY YET',
    next: 'NEXT',
    startRoute3: 'START ROUTE 3',
    search: 'Search',
    searchDesc: 'You unlocked radar mode, go search for battles, receive resources and QC in case of victory, but be careful, powerful ships may come, be prepared!',
    radarTimeReduction: '-50% Rad',
    radarTimeReductionDesc: 'Congratulations, now you can search for battles every 30 seconds. -50% radar time!',
    qcBonus100: '100% QC',
    qcBonus100Desc: 'Congratulations, you will receive 100% more QC as a reward for won battles! +100% QC!',
    bossChanceBonus: '+10% Boss',
    bossChanceBonusDesc: 'Congratulations, now you can find boss battles more easily! +10% chance to find Boss!',
    dmgBonus50: '+50% Dmg',
    dmgBonus50Desc: 'Congratulations, you gained a 50% total damage increase in all skills! +50% damage!',
    skyringShip: 'Skyring',
    skyringShipDesc: 'Congratulations, you gained the "Skyring" ship. It has 25% more damage, 25% more life and all skill cooldowns are 1 second!',
    retribution: 'Retribution',
    retributionDesc: 'Random battles are resolved automatically. The visual result notification can be disabled.',
    troublemaker: 'Troublemaker',
    troublemakerDesc: 'Increases random battle frequency by 50% and QC acquired in victories by 100%.',
    missionPossible: 'Mission Possible',
    missionPossibleDesc: 'Increases win chance against BOSSES by 25% in all modes and increases all resources from BOSS battles by 50%.',
    fatigue: 'Fatigue',
    fatigueDesc: 'Automatically synthesizes Etérion in the Heliosingular Reactor when CCE is at critical level! Requires Raw Etérion Tubes. Can be disabled.',
    kombatWortal: 'Kombat Wortal',
    kombatWortalDesc: 'Completely removes Radar waiting time, the player can search for battles whenever they want, but will stop earning Etérion in rewards, earning only QC.',
    whySo: 'Why, so?',
    whySoDesc: 'Increases in 100x the value acquired from the Mining tab in Route 2.',
    trillion: 'trillion',
    billion: 'billion',
    activeStatus: 'Status: Active',
    contributingToEarth: 'Contributing to Project Earth',
    inspired: 'Inspired',
    waitingHelp: 'Waiting Help',
    planetaryRestoration: 'Planetary Restoration',
    planetaryRestorationDesc: 'Requirements for final planetary restoration',
    galacticUnlock: 'Galactic Unlock',
    galacticUnlockDesc: 'Required path for galactic unlock',
    interstellarUnlock: 'Interstellar Unlock',
    interstellarUnlockDesc: 'Required path for interstellar unlock',
    skillMapDesc: 'Permanent upgrades for your missions',
    legendaryChanceDesc: '+1% chance per level',
    mythicChanceDesc: '+1% chance per level',
    alienChanceDesc: '+1% chance per level',
    timeIsMoneyDesc: '-1 delivery per level (Base: 20)',
    olympicRobotsDesc: '-1 pack per level (Base: 10)',
    doomProtocol: 'Doom Protocol!',
    excessEfficiencyRewarded: 'Excess efficiency is rewarded:',
    yourShip: 'Your Ship',
    groupBattle: 'GROUP BATTLE',
    realTimeCombat: 'REAL-TIME COMBAT',
    enemyGroup: 'Enemy Group',
    activeUnits: 'Active',
    enemyShip: 'Ship',
    scanningVoid: 'Scanning the Void',
    searchingEnemySignatures: 'Searching for enemy energy signatures...',
    targetsDetected: 'Targets Detected',
    cancelSearch: 'Cancel Search',
    qcInPossession: 'QC in Possession',
    attackTarget: 'Attack Target',
    backToRadar: 'Back to Radar',
    battleReady: 'BATTLE READY',
    battleShip: 'Battle Ship',
    sovereignOfVoid: 'Sovereign of the Void • Dreadnought Class',
    quantumShield: 'Quantum Shield',
    hullIntegrity: 'Hull Integrity',
    baseDamage: 'Base Damage',
    searchCombat: 'Search Combat',
    repair: 'Repair',
    weaponSystem: 'Weapon System',
    reinforcedShields: 'Reinforced Shields',
    weaknessScanner: 'Weakness Scanner',
    avarice: 'Avarice',
    upgradeCost: 'Upgrade Cost',
    theBeginning: 'The Beginning',
    newPossibilities: 'New Possibilities',
    inMission: 'In Mission',
    available: 'Available',
    capacity: 'Capacity',
    searchTime: 'Search Time',
    missionProgress: 'Mission Progress',
    startSearch: 'Start Search',
    aircraftUpgrades: 'Aircraft Upgrades',
    earthProject: 'Earth Project',
    biosphereRestoration: 'Biosphere Restoration',
    globalReconstructionProgress: 'Global Reconstruction Progress',
    earthRestored: 'EARTH RESTORED',
    hopeSymbol: 'You have become the symbol of hope for the galaxy.',
    waitingNoduleInit: 'Waiting for full initialization of capture nodules',
    captureNodule: 'Capture Nodule',
    syncComplete: 'Synchronization Complete',
    waitingCompactedResources: 'Waiting for Compacted Resources',
    colonizationCore: 'Colonization Core',
    finalPreparationEarth: 'Final Preparation for Earth Project',
    colonizationCoreDesc: 'This is the final step before sending resources to the Earth Project. Accumulate raw resources, compact them into high-density cores, and send them to realize the reconstruction of our home.',
    reservoirOf: 'Reservoir of',
    rawResource: 'Raw Resource',
    compacted: 'Compacted',
    compact: 'Compact',
    sendToEarth: 'Send to Earth',
    locationStatus: 'Location Status',
    confidenceInspiration: 'Confidence / Inspiration',
    maxDonationReached: 'Maximum QC donation level reached for this colony.',
    insufficientQCForDonation: 'Insufficient QC for QC donation.',
    qcDonationSuccess: '100k QC donation made to',
    donationSuccess: 'Donation successful:',
    insufficientResourcesForDonation: 'Insufficient resources for donation.',
    donationLimitReached: 'Donation limit reached for this location (Maximum 20%).',
    poiInspired: 'was fully inspired! Contribution to Earth Project activated.',
    insufficientRawResources: 'Insufficient raw resources for compaction (Required:',
    compactedCreated: 'created successfully!',
    noCompactedAvailable: 'No compacted resources available for sending.',
    massiveContribution: 'Massive contribution:',
    earthCategoryReached100: 'of Earth reached 100%!',
    resourceSentToEarth: 'Resource sent to Earth Project. Progress of',
    increased: 'increased!',
    maxLevelReached: 'Maximum level reached.',
    maxUpgradeReached: 'Maximum level reached for this upgrade.',
    insufficientQCForAircraft: 'Insufficient QC for aircraft upgrade. Get QC in battles!',
    insufficientQCForAuto: 'Insufficient QC for Auto Mode.',
    autoModeUnlocked: 'Auto Mode Unlocked for',
    autoRestarting: 'Auto-restarting',
    aircraftUpgradeComplete: 'Upgrade for',
    completedExclamation: 'completed!',
    automatic: 'Automatic',
    insufficientResourcesForRepair: 'Insufficient resources for repair (Energy/Technology).',
    shipRepaired: 'Battle ship fully repaired.',
    insufficientResourcesForCombatUpgrade: 'Insufficient resources for combat upgrade.',
    cannotUpgradeDuringAttack: 'Defensive systems in critical state! Only main ship upgrades allowed during current attack.',
    shipTooDamaged: 'Battle ship too damaged to fight!',
    shipUpgradedTo: 'Battle ship upgraded to',
    scanningForTargets: 'Scanning the Void for targets...',
    aircraftMissionStart: 'departed on a search mission.',
    extraResourcesFound: 'found extra resources',
    missionCompletedBy: 'Mission completed by',
    totalResources: 'total resources!',
    targetsDetectedOnRadar: 'targets detected on radar.',
    ambushDetected: 'ALERT! Ambush detected! Multiple ships engaging.',
    engagingShip: 'Engaging Ship',
    prepareForCombat: 'Prepare for combat!',
    defeatShipDamaged: 'Defeat! Your ship was severely damaged.',
    missionBaseValueIncreased: 'Base mission value increased to level',
    efficiencyCaps: 'EFFICIENCY',
    victoryCaps: 'Victory!',
    enemyShipsDestroyed: 'Enemy ships destroyed',
    enemyShipDestroyed: 'Enemy ship destroyed',
    groupBonus: 'Group Bonus',
    quantumCell: 'Quantum Cell',
    compactedMineralCore: 'Compacted Mineral Core',
    multifactorialDataCore: 'Multifactorial Data Core',
    colonizationRation: 'Colonization Ration',
    advancedMedicalKit: 'Advanced Medical Kit',
    impossibleModeAutoTravelDisabled: 'Impossible Mode: Auto-Travel disabled',
    maxAutoTravelSlotsReached: 'Maximum auto-travel slots reached for this route',
    autoTravelSlotPurchased: 'Auto-travel slot purchased for',
    insufficientQCForAutoTravelSlot: 'Insufficient QC for auto-travel slot',
    mini_games: 'Fliperamas',
    mini_games_desc: 'Population Recreation Center',
  },
  pt: {
    restoration: 'Restauração',
    eliminateEnemies: 'Eliminar Inimigos!',
    restorationRobotMessage: 'Analisando o progresso da restauração... Estamos fazendo história, piloto.',
    allResourcesReady: 'Finalmente, estamos prontos para o recomeço, enviamos os recursos para o Projeto Terra, temos tudo que precisamos, é hora de ir...',
    voidWarAlert: 'ALERTA! ALERTA! Estamos sendo ATACADOS!',
    voidWarMap: 'Mapa de Defesa do Vazio',
    route3End_silence: 'Silêncio.',
    route3End_noAlarms: 'Pela primeira vez desde o início da missão… não há alarmes.',
    route3End_noEnemies: 'Não há inimigos.',
    route3End_tiredInterface: 'A interface pisca… como se estivesse cansada.',
    route3End_resources100: '100% dos recursos coletados.',
    route3End_initiatingFinal: 'Iniciando fase final do Projeto Terra...',
    route3End_everythingFinished: 'Por um breve momento… parece que tudo acabou.',
    route3End_theAttack: '⚠️ O ATAQUE',
    route3End_noWarning: 'Sem aviso. Sem lógica. Sem padrão.',
    route3End_spaceTears: 'O espaço ao redor da Terra… rasga.',
    route3End_fleetsEmerge: 'Frotas surgem de todos os lados, como se sempre estivessem ali — apenas esperando.',
    route3End_notLikeBefore: 'Eles não são como os inimigos anteriores. Eles não avançam. Eles cercam.',
    route3End_blockade: 'Um bloqueio total.',
    route3End_robotRestored: 'A tela treme.\nO robô, agora estável, aparece — mas diferente.\nSem falhas. Sem pausas.',
    route3End_robotWarning: '"Chefe… isso não é um ataque comum."',
    route3End_robotIntent: '"Eles não querem impedir o Projeto Terra. Eles querem impedir… você."',
    route3End_theStand: 'A ÚLTIMA RESISTÊNCIA',
    route3End_fightForSurvival: 'O jogador luta. Not por progresso. Not por recursos. Mas por sobrevivência.',
    route3End_evenSurrounded: 'E mesmo cercado… mesmo em desvantagem…',
    route3End_youWin: 'Você vence.',
    route3End_aftermath: 'O DEPOIS DA GUERRA',
    route3End_debris: 'Destroços flutuam. Sinais inimigos… desaparecem.',
    route3End_somethingWrong: 'Mas algo está errado. O sistema não comemora. Não há mensagem de vitória.',
    route3End_anomalyDetected: 'Anomalia detectada.',
    route3End_theTruth: 'A VERDADE',
    route3End_robotAnalysing: 'O robô analisa. Demora. E então responde:',
    route3End_itWasATest: '"Eles não estavam tentando destruir o Projeto Terra..."',
    route3End_youAreApproved: '"Eles estavam testando você. Padrões confirmados. Você foi… aprovado."',
    route3End_protocolUpdated: 'Protocolo Terra atualizado.',
    route3End_activation: 'ATIVAÇÃO',
    route3End_earthResponds: 'A Terra responde. Não como planeta. Mas como sistema.',
    route3End_energyFlows: 'Energia percorre sua superfície. Linhas de luz se formam. O núcleo desperta.',
    route3End_theBreak: 'A QUEBRA',
    route3End_interfaceFails: 'A interface antiga começa a falhar. Elementos somem. HUD desaparece.',
    route3End_controlsUnresponsive: 'Controles deixam de responder… por um segundo. E então—',
    route3End_modeTransition: '"Modo estratégico encerrado. Modo de execução iniciado."',
    route3End_route4Start: 'ENTRADA NA ROTA 4',
    route3End_newInterface: 'Nova interface. Nova leitura. Novo controle.',
    route3End_robotFinal: 'Chefe… agora… é com você. Sem cálculos. Sem previsões. Apenas… reação.',
    route3End_projectEarthInitiated: '(Rota 4 - Projeto Terra iniciado)',
    sector: 'Setor',
    cleared: 'LIMPO',
    lockedSector: 'BLOQUEADO',
    battleProgress: 'Progresso de Batalha',
    normalBattle: 'Batalha Normal',
    eliteBattle: 'Batalha Elite',
    bossBattle: 'Batalha Boss',
    voidQuantumCellsSent: 'Células Quânticas Enviadas',
    voidMineralCoresSent: 'Núcleos Minerais Compactados Enviados',
    voidDataCoresSent: 'Núcleos de Dados Multifatoriais Enviados',
    voidRationsSent: 'Rações de Colonização Enviadas',
    voidMedicalKitsSent: 'Kits Médicos Avançados Enviados',
    improveRadar: 'Melhorar Radar',
    radarChance: 'Chance do Radar',
    insufficientQCRadar: 'QC insuficiente para melhorar radar.',
    routes: 'Rotas 1',
    routes2: 'Rotas 2',
    upgrades: 'Melhorias',
    autoTravel: 'Entrega Automática',
    aetherion: 'Éteríon',
    trip: 'Viagem',
    cce: 'CCE - Câmara de Contenção de Éteríon',
    cceConcept: 'Uma instalação altamente especializada que mantém o Éteríon estável dentro de campos quânticos controlados.',
    aetherionConcept: 'Um combustível baseado em energia do vácuo quântico, capaz de dobrar o espaço-tempo ao redor da nave.',
    aetherionRequired: 'Éteríon por Viagem',
    insufficientAetherion: 'Éteríon insuficiente para manter a auto-entrega.',
    insufficientAetherionCaps: 'Cápsulas de Éteríon insuficientes para o salto.',
    aetherionConsumes: 'Consome 1 Éteríon / 10s',
    rhse: 'Reator Heliosingular de Síntese Etérica (RHSE)',
    rhseConcept: 'Um reator avançado que recria Éteríon artificialmente.',
    miningWaste: 'Resíduos de Mineração',
    solarEnergy: 'Energia Solar Filtrada',
    aetherionTubes: 'Tubos de Éteríon Bruto',
    extractionTech: 'Tecnologia de Extração',
    extractionTechConcept: 'Aumenta a extração de toda a mineração da Rota 2 em 10% por nível.',
    doubleRoute: 'Rota Dupla',
    doubleRouteConcept: 'Aumenta o valor das entregas em todas as naves da Rota 2.',
    doomP: 'Doom P',
    doomPConcept: 'Aumenta a chance de vitória em batalhas automáticas e radar.',
    solarMapping: 'Mapeamento Interestelar de Captação',
    solarMappingConcept: 'Aumenta a captação de Energia Solar e Interestelar em 10% por nível.',
    capture: 'Captação',
    captureConcept: 'Aumenta a captação de QC em todas as batalhas da Rota 2.',
    synthesize: 'Sintetizar Éteríon',
    maxCapacity: 'Capacidade Máxima',
    options: 'Opções',
    exit: 'Sair',
    exitGame: 'Sair do Jogo',
    exitDesc: 'Isso te levará ao Menu Inicial e salvará seu jogo automaticamente',
    activeDeliveries: 'Entregas Ativas',
    noShips: 'Nenhuma entrega disponível.',
    emptySlot: 'Hangar Vazio',
    coffeeMessage: [
      "Todas as entregas estão sendo realizadas automaticamente pela IA. Aproveite o momento ☕",
      "Frota em piloto automático. Nenhuma ação necessária.",
      "A IA assumiu o controle total das rotas. Tudo está fluindo perfeitamente.",
      "Sua rede de entregas está operando sozinha. Impressionante.",
      "Nenhuma intervenção necessária. A galáxia continua girando… e entregando.",
      "Sistemas estáveis. Entregas em andamento. Você pode relaxar.",
      "Todas as naves estão em operação automática. Hora de um café ☕",
      "Logística otimizada ao máximo. A IA cuida de tudo agora.",
      "Seu império de entregas está funcionando sem você. Como deveria ser.",
      "Rotas ativas. Lucros em crescimento. Zero esforço necessário.",
      "A IA está trabalhando por você. Aproveite esse raro momento de paz.",
      "Tudo sob controle. Nenhuma nave precisa de comandos.",
      "Entregas em fluxo contínuo. Eficiência máxima atingida.",
      "Frota totalmente automatizada. Sua presença é opcional.",
      "A IA está fazendo o trabalho pesado. Vá descansar!",
      "Operações autônomas ativas. Relaxe e veja os créditos entrarem.",
      "Sua rede logística agora é autossustentável. Bom trabalho.",
      "Eficiência movida por IA. Nenhuma entrada manual necessária no momento.",
      "Todas as rotas estão automatizadas. Você merece um descanso.",
      "As máquinas estão trabalhando. A galáxia está entregando. Relaxe ☕"
    ],
    settings: 'Configurações',
    saveAndExit: 'Salvar e Sair',
    resetProgress: 'Resetar Progresso',
    confirmReset: 'Tem certeza que deseja resetar todo o progresso?',
    routes1: 'Rotas 1',
    void_aircraft: 'Aeronaves',
    void_map: 'Mapa Estelar',
    void_war: 'Núcleo de Colonização',
    void_earth: 'Terra',
    missionReward: 'Recompensa de Missão',
    noMissions: 'Nenhuma missão ativa.',
    claim: 'Resgatar',
    availableDeliveries: 'Entregas Disponíveis',
    locked: 'Bloqueado',
    readyToUnlock: 'Pronto para Desbloquear',
    unlock: 'Desbloquear',
    cargo: 'Carga',
    reward: 'Recompensa',
    launch: 'Lançar',
    export: 'Exportar',
    import: 'Importar',
    exportTitle: 'O que você gostaria de exportar:',
    campaign: 'Campanha',
    campaignDesc: '(Salva os dados de todas as Rotas)',
    exportSpeedRun: 'Speed Run',
    exportSpeedRunDesc: '(O Ranking de tempo do Top 10 local)',
    secretCodes: 'Códigos secretos',
    secretCodesDesc: '(Manter os códigos já descobertos)',
    everything: 'Tudo',
    everythingDesc: '(Todas as escolhas selecionadas)',
    achievements: 'Conquistas',
    achievementsDesc: '(Todas as conquistas desbloqueadas)',
    exportButton: 'Exportar Agora',
    importSuccess: 'Dados importados com sucesso!',
    importError: 'Erro ao importar dados. Verifique o arquivo.',
    owned: 'Adquirido',
    buy: 'Comprar',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
    manageInfrastructure: 'Gerenciar infraestrutura local',
    music: 'Música',
    soundEffects: 'Efeitos Sonoros',
    language: 'Idioma',
    portuguese: 'Português',
    english: 'Inglês',
    on: 'Ligado',
    off: 'Desligado',
    insufficientQC: 'QC insuficiente para combustível',
    hangarFull: 'Hangar cheio. Aguarde as entregas terminarem.',
    standby: 'Standby',
    waitingForHangar: 'Aguardando Hangar',
    shipLaunched: 'Nave lançada para',
    cost: 'Custo',
    deliverySuccess: 'Entrega bem-sucedida!',
    deliveryFailed: 'Entrega falhou! Nave perdida.',
    autoDeliverySuccess: 'Auto-entrega bem-sucedida!',
    autoDeliveryFailed: 'Auto-entrega falhou! Tentando novamente...',
    perfectBonus: 'BÔNUS PERFEITO!',
    rareBonus: 'BÔNUS DE MISSÃO ESPECIAL!',
    routeUnlocked: 'Rota desbloqueada:',
    autoTravelUnlocked: 'Auto-viagem desbloqueada para',
    jump: 'SALTO',
    back: 'Voltar',
    level: 'Nível',
    max: 'MÁX',
    deliveries: 'Entregas',
    logisticsInterface: 'Interface de Gerenciamento Logístico',
    bonus: 'Bônus',
    upgrade: 'Melhorar',
    req: 'Req',
    earned: 'Ganhou',
    complete: 'concluída',
    conditionsNotMet: 'Condições não atendidas para desbloquear',
    insufficientQCUnlock: 'QC insuficiente para desbloquear esta rota.',
    maxLevelLog: 'já está no nível máximo para este local.',
    for: 'para',
    to: 'para',
    insufficientQCUpgrade: 'QC insuficiente para melhoria.',
    insufficientQCAutoTravel: 'QC insuficiente para Entrega Automática.',
    route2UnlockDesc: 'Você atingiu o auge do Sistema Solar. Pronto para ir além?',
    startInterstellarProtocol: 'Iniciar Protocolo Interestelar',
    speedRunMode: 'Modo Speed Run Ativo',
    speedRunDesc: 'A Rota 2 está desativada neste modo. Chegue ao fim da Rota 1 o mais rápido possível!',
    total: 'Total',
    autoTravelSlots: 'Slots de Entrega Automática',
    autoTravelSlotsDesc: 'Máximo de entregas automáticas simultâneas.',
    upgradeSlots: 'Melhorar Slots',
    maxSlotsReached: 'Máximo de slots atingido.',
    insufficientQCSlots: 'QC insuficiente para melhoria de slots.',
    autoTravelSlotsUpgraded: 'Slots de Entrega Automática melhorados para',
    aircraft: 'Aeronaves',
    technology: 'Tecnologia',
    research: 'Pesquisar',
    unlocked: 'Desbloqueado',
    alreadyUnlocked: 'Já Desbloqueada',
    unlocksShip: 'Permite construir Naves de nível',
    researching: 'Pesquisando...',
    completeResearch: 'Concluir Pesquisa',
    free: 'Grátis',
    fleet: 'Frota de Naves',
    maxShips: 'Limite de naves por nível atingido.',
    insufficientQCShips: 'QC insuficiente para construir nave.',
    shipBuilt: 'Nave construída:',
    requiredShip: 'Nave Necessária',
    speed: 'Velocidade',
    tech: 'Tecnologia',
    range: 'Alcance',
    build: 'Construir',
    resetWarning: 'Isso excluirá permanentemente todo o seu progresso, naves e melhorias. Esta ação não pode ser desfeita.',
    cancel: 'Cancelar',
    reset: 'Resetar',
    speedRunComplete: 'SPEED RUN COMPLETO!',
    pilot: 'PILOTO',
    finalTime: 'TEMPO FINAL',
    returnToCommandCenter: 'VOLTAR AO CENTRO DE COMANDO',
    mining: 'Mineração',
    ores: 'Minérios',
    robots: 'Robôs',
    sellPacks: 'Vender Packs',
    autoSell: 'Venda Automática',
    miningRate: 'Taxa de Mineração',
    efficiency: 'Eficiência',
    production: 'Produção',
    units: 'unidades',
    pack: 'pack',
    buyRobot: 'Comprar Robô',
    upgradeRobot: 'Melhorar Robô',
    oreCollected: 'Minério Coletado',
    miningRobots: 'Robôs de Mineração',
    miningUpgrades: 'Melhorias de Mineração',
    miningUnlocked: 'Mineração desbloqueada para',
    autoSellUnlocked: 'Venda Automática desbloqueada!',
    insufficientQCRobot: 'QC insuficiente para robô.',
    maxRobotsReached: 'Limite de robôs atingido.',
    robotUpgraded: 'Robô melhorado para o nível',
    tutorialMiningTitle: 'Tutorial de Mineração',
    tutorialMiningDesc: 'Bem-vindo ao setor de Mineração! Aqui você pode comprar robôs para extrair minérios preciosos. Cada robô trabalha automaticamente. Quando coletar minério suficiente, você pode vendê-lo em packs por QC. Você também pode melhorar seus robôs para aumentar a eficiência.',
    tutorialAircraftTitle: 'Tutorial de Aeronaves',
    tutorialAircraftDesc: 'Este é o gerenciamento da sua frota. Construa mais naves para aumentar sua capacidade de entrega. Naves de nível superior podem alcançar destinos mais distantes e carregar mais carga.',
    tutorialUpgradesTitle: 'Tutorial de Melhorias',
    tutorialUpgradesDesc: 'Melhore sua infraestrutura aqui. Você pode melhorar motores para velocidade, IA para melhor sucesso nas entregas e valor de mercado para maiores recompensas.',
    tutorialAutoTitle: 'Tutorial de Auto-Viagem',
    tutorialAutoDesc: 'Automatize suas rotas! Compre slots de auto-viagem para deixar suas naves entregarem carga sem intervenção manual. Perfeito para renda passiva enquanto você gerencia outros setores.',
    tutorialTechnologyTitle: 'Tutorial de Tecnologia',
    tutorialTechnologyDesc: 'Bem-vindo ao Laboratório de Pesquisa! Aqui você pode desbloquear novos níveis de naves. Pesquisar tecnologias permite construir naves mais avançadas que podem alcançar destinos mais distantes. O primeiro nível é grátis, mas os outros exigem QC e tempo.',
    tutorialBonus: 'Bônus de Tutorial: +1000 QC!',
    tutorialRoutes2Title: 'Tutorial da Rota 2',
    tutorialRoutes2Desc: 'Bem-vindo ao setor Intergaláctico! Aqui, as distâncias são medidas em bilhões de quilômetros e as recompensas são astronômicas. Você se provou no Sistema Solar, agora é hora de conquistar a galáxia.\n\nParabéns, você ganhou a Pulsar 1, nave de nível 1 para começar sua jornada.',
    tutorialRoutes2Bonus: 'Bônus de Tutorial: +1000 QC!',
    tutorialMissionsTitle: 'Tutorial de Missões',
    tutorialMissionsDesc: 'Bem-vindo ao setor de Missões! Aqui você pode completar tarefas especiais para ganhar QC extra. As missões são geradas de acordo com seu progresso. Complete-as para liberar espaço para novas!',
    tutorialHistoryTitle: 'Tutorial de Histórico',
    tutorialHistoryDesc: 'Bem-vindo ao setor de Histórico! Aqui você pode acompanhar seu progresso, ver o total de entregas e verificar seus ganhos de diferentes fontes. É uma ótima maneira de ver o quão longe você chegou em sua jornada.',
    route2UnlockTitle: 'Rota 2 Desbloqueada',
    route2UnlockedMessage: '🌌 Rota 2 Desbloqueada\n\nParabéns, piloto. Você conquistou o Sistema Solar.\n\nPara avançar à Expansão Interestelar, você abrirá mão de todo o seu império atual para iniciar uma nova jornada do zero.\n\nParabéns, você ganhou a Pulsar 1, nave de nível 1 para começar sua jornada.\n\nPreparado para o próximo salto?',
    route2TransitionMessage: '🌌 Rota 2 Desbloqueada\n\nParabéns, piloto. Você conquistou o Sistema Solar.\n\nPara avançar à Expansão Interestelar, você abrirá mão de todo o seu império atual para iniciar uma nova jornada do zero.\n\nParabéns, você ganhou a Pulsar 1, nave de nível 1 para começar sua jornada.\n\nPreparado para o próximo salto?',
    resolution: 'Resolução',
    displayMode: 'Modo de Exibição',
    fullscreen: 'Tela Cheia',
    windowed: 'Janela',
    native: 'Nativo do Sistema',
    close: 'Fechar',
    void_battle: 'Batalha',
    history: 'Histórico',
    missions: 'Missões',
    colonies: 'Colônias',
    missionsCompleted: 'Missões Concluídas',
    qcFromMissions: 'QC de Missões',
    startVoidProtocol: 'INICIAR PROTOCOLO VAZIO',
    route3UnlockDesc: 'O tempo não é mais o que costumava ser. O Vazio te chama.',
    route3UnlockedMessage: '🌌 Rota 3 Desbloqueada\n\nO universo mudou. O tempo se distorceu.\n\nVocê está prestes a entrar na Era Sem Tempo.\n\nPreparado para o Vazio?',
    formatNumbers: 'Formatar Números',
    totalDeliveries: 'Total de Entregas',
    manual: 'Manual',
    auto: 'Automática',
    qcFromDeliveries: 'QC de Entregas',
    qcFromMining: 'QC de Mineração',
    qcSpent: 'Total de QC Gasto',
    qcTotalAcquired: 'Total de QC Adquirido',
    gameStatsByRoute: 'Estatísticas de Jogo por Rota',
    manualDeliveries: 'Entregas Manuais',
    autoDeliveries: 'Entregas Automáticas',
    totalQCAcquired: 'Total de QC Adquirido',
    fromDeliveries: 'De Entregas',
    fromMining: 'De Mineração',
    totalQCSpent: 'Total de QC Gasto',
    mythicChance: 'Chance Mítico',
    alienChance: 'Chance Alien',
    legendaryChance: 'Chance Lendário',
    refinedCompression: 'Compressão Refinada',
    battleLevel: 'Nível de Batalha',
    definition: 'Definição',
    findBattle: 'Encontrar Batalha',
    winProbability: 'Chance de Vitória',
    attack: 'Atacar',
    retreat: 'Recuar',
    searching: 'Procurando...',
    noBattleFound: 'Nenhuma batalha encontrada.',
    battleFound: 'Inimigo Detectado!',
    upgradeBattleLevel: 'Melhorar Nível de Batalha',
    hpBonus: 'Bônus de Vida',
    dmgBonus: 'Bônus de Dano',
    mission1Title: 'Início de Tudo',
    mission1Desc: 'Visitar a aba Tecnologia e ler o minitutorial e iniciar a tecnologia "Fundação Orbital"!',
    mission2Title: 'Ampliando frotas',
    mission2Desc: 'Visitar a Aba "Aeronaves" e ler o minitutorial e comprar uma nave "Atlas Courier"!',
    mission3Title: 'Esquentando motores',
    mission3Desc: 'Visitar a aba "Melhorias" e ler o minitutorial. Melhorar o motor para nível 1!',
    mission4Title: 'Voando longe',
    mission4Desc: 'Visitar a aba "Rotas 1" e ler o minitutorial. Iniciar a primeira entrega manual!',
    mission5Title: 'Usando a IA',
    mission5Desc: 'Visitar a aba "Automática" e ler o minitutorial. Comprar o primeiro Slot de entrega automática!',
    mission6Title: 'Minerando',
    mission6Desc: 'Visitar a aba "Mineração" e ler o minitutorial! Comprar o primeiro Robô!',
    combatLevelIncreased: 'NÍVEL DE COMBATE AUMENTOU: Nível',
    insufficientQCBattleLevel: 'QC insuficiente para melhorar nível de batalha.',
    battleLevelIncreased: 'NÍVEL DE BATALHA AUMENTADO: Nível',
    radarUpgraded: 'RADAR MELHORADO: Nível',
    radarCooldown: 'Radar em recarga. Aguarde',
    startingScan: 'Iniciando varredura de setor...',
    motherShip: 'Nave MÃE (BOSS)',
    eliteCruiser: 'Cruzador de Elite',
    alienCruiser: 'Cruzador Alienígena',
    spacePirate: 'Pirata Espacial',
    alienScout: 'Batedor Alienígena',
    targetLocated: 'ALVO LOCALIZADO!',
    noSignalDetected: 'Nenhum sinal detectado no setor.',
    startingSectorScan: 'Iniciando escaneamento do setor...',
    sectorRadar: 'Radar de Busca de Setor',
    chance: 'CHANCE',
    scanning: 'Buscando...',
    scan: 'Escanear',
    privatePoliceUpgraded: 'POLÍCIA PRIVADA MELHORADA!',
    skipBattles: 'Pular Batalhas',
    combatProficiency: 'Sua proficiência em combate',
    nextLevel: 'Próximo Nível',
    levelRewards: 'Recompensas de Nível',
    hp: 'Vida',
    atk: 'Dano',
    captureUpgraded: 'CAPTAÇÃO MELHORADA!',
    defeatShipDestroyed: 'DERROTA: Sua nave foi destruída!',
    insufficientAetherionAlert: 'ÉTERÍON INSUFFICIENTE!',
    shieldActivated: 'ESCUDO ATIVADO: Nave invulnerável por',
    autoDeliveryInterrupted: 'Entrega automática para',
    interruptedByDefeat: 'interrompida por derrota!',
    deliveryUnderAttack: 'Entrega para',
    underAttack: 'está sob ataque!',
    minerals: 'Minerais',
    energy: 'Energia',
    food: 'Alimentos',
    meds: 'Suprimentos Médicos',
    criticalDamage: 'Dano Crítico',
    criticalChance: 'Chance Crítica',
    loot: 'Eficiência de Saque',
    storage: 'Armazenamento',
    time: 'Tempo',
    autoDeliveryStopped: 'Auto-entrega para',
    stoppedDueToDefeat: 'interrompida por derrota.',
    spaceCombat: 'COMBATE ESPACIAL',
    fleetLevel: 'NÍVEL DA FROTA',
    laserBeam: 'RAIO LASER',
    plasmaBeam: 'RAIO PLASMA',
    specialBeam: 'RAIO ESPECIAL',
    shield: 'ESCUDO',
    skipBattle: 'PULAR BATALHA',
    victory: 'VITÓRIA',
    defeat: 'DERROTA',
    rewardsReceived: 'RECOMPENSAS RECEBIDAS',
    shipDestroyedCargoLost: 'SUA NAVE FOI DESTRUÍDA E A CARGA PERDIDA',
    continue: 'CONTINUAR',
    manualDeliveryLimit: 'Limite de 25 entregas manuais atingido!',
    synthesisComplete: 'SÍNTESE CONCLUÍDA: +',
    alertDeliveryUnderAttack: 'ALERTA: Entrega para',
    shieldDeactivated: 'ESCUDO DESATIVADO',
    rare: 'RARA',
    legendary: 'LENDÁRIA',
    mythic: 'MÍTICA',
    common: 'COMUM',
    skillMap: 'Mapa de Habilidades',
    baseMissionValueIncreased: 'Valor base das missões aumentado para o nível',
    missionRadarUnlocked: 'Radar de Missões desbloqueado!',
    insufficientQCForRadar: 'QC insuficiente para o Radar',
    required: 'necessário',
    autoClaimMissionsActivated: 'Auto-Resgate de Missões ativado!',
    autoClaimMissionsDeactivated: 'Auto-Resgate de Missões desativado!',
    buyRadar: 'COMPRAR RADAR',
    autoClaim: 'AUTO RESGATE',
    defectiveRobot: 'Robô Defeituoso',
    robotRepairHeader: 'Robô Defeituoso',
    repairProgress: 'Progresso de Reparo',
    repairDesc: 'Consumir recursos para restaurar os sistemas do robô.',
    robotGlitchedDialogue: 'Olá... Che...fe. Fo..mos ata...cados!...\nVoc..ê tá b...em?\nPre...ci...so de re...par...os...',
    robotRepairedDialogue: 'Obrigado, Chefe.\nSistemas restaurados.\n\nSigamos com o Protocolo Terra...\nMas antes...\n\nVingança.\n\nVamos derrotar TODOS!!',
    upgradeBattleShip: 'Aprimorar Nave de Batalha',
    upgradeBattleShipDesc: 'Focado exclusivamente na nave de batalha da Rota 3 / transição',
    repairButton: 'CONSERTAR',
    baseDamageBonus: '+20% Dano Base',
    critDamageBonus: '+200 Dano Crítico',
    upgradeLimitBonus: '+10 Níveis de Melhoria',
    exitWarning: 'Isso te levará ao menu inicial e salvará seu progresso automaticamente. Todo o modo automático será desabilitado, descansando e esfriando os motores.',
    confirmAndExit: 'CONFIRMAR E SAIR',
    projectEarthGoals: 'Metas Projeto Terra',
    route3Goals: 'Metas Rota 3',
    route2Goals: 'Metas Rota 2',
    dataLostInTime: 'Dados perdidos no tempo',
    totalDeliveriesBattlesMining: 'Total de Entregas, Batalhas e Mineração',
    randomBattlesFound: 'Batalhas Aleatórias Encontradas',
    radarBattlesFound: 'Batalhas Encontradas pelo Radar',
    totalMiningPacksSold: 'Packs de Mineração total vendidos',
    totalExplorationMiningPacksSold: 'Packs de Mineração de Exploração total vendidos',
    fromExplorationMining: 'De Mineração de Exploração',
    fromMissions: 'De Missões',
    fromAllBattles: 'De todas as Batalhas',
    fromAllSources: 'De todas as fontes',
    battle: 'Batalha',
    savingProgress: 'Salvando Progresso',
    syncingData: 'Sincronizando dados com a rede neural...',
    completed: 'Concluído',
    processing: 'Processando...',
    systemUnlocked: 'SISTEMA DESBLOQUEADO',
    conqueredSolarSystem: 'Você conquistou o Sistema Solar.',
    interstellarJourneyStarts: 'Sua jornada interestelar começa agora.',
    sacrificeRequired: 'O SACRIFÍCIO É NECESSÁRIO',
    towardsNextLeap: 'RUMO AO PRÓXIMO SALTO',
    start: 'INICIAR',
    planetaryRestorationRequirements: 'Requisitos para a restauração planetária final',
    galacticUnlockPath: 'Caminho necessário para o desbloqueio galáctico',
    interstellarUnlockPath: 'Caminho necessário para o desbloqueio interestelar',
    quantumCellsSent: 'Células Quânticas enviadas',
    compactedMineralCoresSent: 'Núcleos Minerais Compactados enviados',
    multifactorialDataCoresSent: 'Núcleos de Dados Multifatoriais enviados',
    colonizationRationsSent: 'Rações de Colonização enviadas',
    advancedMedicalKitsSent: 'Kits Médicos Avançados enviados',
    unlockAllTechs: 'Desbloquear TODAS as tecnologias',
    buyAllShips: 'Comprar todas as naves (5 de cada)',
    buyAllUpgrades: 'Comprar TODAS as melhorias de local',
    buyAllAutoSlots: 'Comprar TODOS os slots automáticos',
    buyAllRobots: 'Comprar TODOS os robôs mineradores',
    upgradeAllRobotsMax: 'Melhorar TODOS os robôs ao máximo',
    upgradeRefinedCompression: 'Melhorar Compressão Refinada',
    reachQC: 'Alcançar',
    total5000Deliveries: 'Total de 3000 entregas',
    realTimeSync: 'Sincronização em tempo real',
    permanentMissionUpgrades: 'Melhorias permanentes para suas missões',
    legendaryMissionChance: 'Chance de Missão Lendária',
    mythicMissionChance: 'Chance de Missão Mítica',
    alienMissionChance: 'Chance de Missão Alien',
    timeIsMoney: 'Tempo é dinheiro',
    olympicRobots: 'Robôs Olímpicos',
    understood: 'ENTENDIDO',
    captureSystem: 'SISTEMA DE CAPTAÇÃO',
    victoryBonus: 'Bônus de Vitória',
    victoryBonusDesc: 'Aumenta massivamente os ganhos de QC em cada batalha vencida.',
    nodeEfficiency: 'Eficiência de Nódulo',
    nodeEfficiencyDesc: 'Melhora a taxa de conversão de energia interestelar em créditos.',
    currentStatus: 'Status Atual',
    levelUnlocked: 'NÍVEL DESBLOQUEADO',
    upgradeStatus: 'Status da Melhoria',
    disabled: 'DESATIVADO',
    enemyDetected: 'Inimigo Detectado!',
    ignore: 'Ignorar',
    acceptChallenge: 'EU ACEITO O DESAFIO',
    notReadyYet: 'AINDA NÃO ESTOU PRONTO',
    next: 'PRÓXIMO',
    startRoute3: 'INICIAR ROTA 3',
    search: 'Busca',
    searchDesc: 'Você desbloqueou o modo radar, vá buscar batalhas, receber recursos e QC em caso de vitória, mas cuidado, podem vir naves poderosas, esteja preparado!',
    radarTimeReduction: '-50% Rad',
    radarTimeReductionDesc: 'Parabéns, agora você pode procurar batalha de 30 em 30 segundos. -50% de tempo do radar!',
    qcBonus100: '100% QC',
    qcBonus100Desc: 'Parabéns, você irá receber 100% a mais de QC como recompensa das batalhas vencidas! +100% de QC!',
    bossChanceBonus: '+10% Boss',
    bossChanceBonusDesc: 'Parabéns, agora você poderá encontrar batalhas de chefe mais facilmente! +10% de chance de encontrar Boss!',
    dmgBonus50: '+50% Dmg',
    dmgBonus50Desc: 'Parabéns, você ganhou um aumento de 50% total de dano em todas habilidades! +50% de dano!',
    skyringShip: 'Skyring',
    skyringShipDesc: 'Parabéns, você ganhou a nave "Skyring". Ela tem 25% a mais de dano, 25% a mais de vida e todas as recargas de habilidades são de 1 segundo!',
    retribution: 'Retribuição',
    retributionDesc: 'Batalhas aleatórias são resolvidas automaticamente. O aviso visual do resultado pode ser desativado.',
    troublemaker: 'Encrenqueiro',
    troublemakerDesc: 'Aumenta em 50% a frequência das batalhas aleatórias e em 100% o QC adquirido nas vitórias.',
    missionPossible: 'Missão Possível',
    missionPossibleDesc: 'Aumenta a chance de vitória sobre BOSSES em 25% em todos os modos e aumenta em 50% todo os recursos da batalha contra os BOSSES.',
    fatigue: 'Fadiga',
    fatigueDesc: 'Sintetiza Etérion automaticamente no Reator Heliosingular quando a CCE estiver com nível crítico! Requer Tubos de Etérion Bruto. Pode ser desativado.',
    kombatWortal: 'Kombat Wortal',
    kombatWortalDesc: 'Retira totalmente o tempo de espera do Radar, o jogador pode buscar batalhas sempre que quiser, porém deixará de ganhar Etérion nas recompensas, ganhando apenas QC.',
    whySo: 'Why, so?',
    whySoDesc: 'Aumenta em 100x o valor adquirido da aba Mineração na Rota 2.',
    trillion: 'trilhões',
    billion: 'bilhões',
    activeStatus: 'Status: Ativo',
    contributingToEarth: 'Contribuindo com Projeto Terra',
    inspired: 'Inspirado',
    waitingHelp: 'Aguardando Ajuda',
    planetaryRestoration: 'Restauração Planetária',
    planetaryRestorationDesc: 'Requisitos para a restauração planetária final',
    galacticUnlock: 'Desbloqueio Galáctico',
    galacticUnlockDesc: 'Caminho necessário para o desbloqueio galáctico',
    interstellarUnlock: 'Desbloqueio Interestelar',
    interstellarUnlockDesc: 'Caminho necessário para o desbloqueio interestelar',
    skillMapDesc: 'Melhorias permanentes para suas missões',
    legendaryChanceDesc: '+1% de chance por nível',
    mythicChanceDesc: '+1% de chance por nível',
    alienChanceDesc: '+1% de chance por nível',
    timeIsMoneyDesc: '-1 entrega por nível (Base: 20)',
    olympicRobotsDesc: '-1 pack por nível (Base: 10)',
    doomProtocol: 'Doom Protocol!',
    excessEfficiencyRewarded: 'O excesso de eficiência é recompensado:',
    yourShip: 'Sua Nave',
    groupBattle: 'BATALHA GRUPAL',
    realTimeCombat: 'COMBATE EM TEMPO REAL',
    enemyGroup: 'Grupo Inimigo',
    activeUnits: 'Ativas',
    enemyShip: 'Nave',
    scanningVoid: 'Escaneando o Vazio',
    searchingEnemySignatures: 'Buscando assinaturas de energia inimigas...',
    targetsDetected: 'Alvos Detectados',
    cancelSearch: 'Cancelar Busca',
    qcInPossession: 'QC em Posse',
    attackTarget: 'Atacar Alvo',
    backToRadar: 'Voltar ao Radar',
    battleReady: 'BATTLE READY',
    battleShip: 'Nave de Batalha',
    sovereignOfVoid: 'Soberana do Vazio • Classe Dreadnought',
    quantumShield: 'Escudo Quântico',
    hullIntegrity: 'Integridade do Casco',
    baseDamage: 'Dano Base',
    searchCombat: 'Buscar Combate',
    repair: 'Reparar',
    weaponSystem: 'Sistema de Armas',
    reinforcedShields: 'Escudos Reforçados',
    weaknessScanner: 'Scanner de Fraqueza',
    avarice: 'Avarícia',
    upgradeCost: 'Custo de Upgrade',
    theBeginning: 'O Recomeço',
    newPossibilities: 'Novas Possibilidades',
    inMission: 'Em Missão',
    available: 'Disponível',
    capacity: 'Capacidade',
    searchTime: 'Tempo de Busca',
    missionProgress: 'Progresso da Missão',
    startSearch: 'Iniciar Busca',
    aircraftUpgrades: 'Upgrades da Aeronave',
    earthProject: 'Projeto Terra',
    biosphereRestoration: 'Restauração da Biosfera Planetária',
    globalReconstructionProgress: 'Progresso Global de Reconstrução',
    earthRestored: 'TERRA RESTAURADA',
    hopeSymbol: 'Você se tornou o símbolo de esperança da galáxia.',
    waitingNoduleInit: 'Aguardando inicialização completa dos nódulos de captação',
    captureNodule: 'Nódulo de Captação',
    syncComplete: 'Sincronização Completa',
    waitingCompactedResources: 'Aguardando Recursos Compactados',
    colonizationCore: 'Núcleo de Colonização',
    finalPreparationEarth: 'Preparação Final para o Projeto Terra',
    colonizationCoreDesc: 'Este é o último passo antes de enviar os recursos para o Projeto Terra. Acumule recursos brutos, compacte-os em núcleos de alta densidade e envie-os para concretizar a reconstrução da nossa casa.',
    reservoirOf: 'Reservatório de',
    rawResource: 'Recurso Bruto',
    compacted: 'Compactados',
    compact: 'Compactar',
    sendToEarth: 'Enviar p/ Terra',
    locationStatus: 'Status da Localização',
    confidenceInspiration: 'Confiança / Inspiração',
    maxDonationReached: 'Nível máximo de doação de QC atingido para esta colônia.',
    insufficientQCForDonation: 'QC insuficiente para doação de QC.',
    qcDonationSuccess: 'Doação de 100k QC realizada para',
    donationSuccess: 'Doação realizada com sucesso:',
    insufficientResourcesForDonation: 'Recursos insuficientes para doação.',
    donationLimitReached: 'Limite de doação atingido para este local (Máximo 20%).',
    poiInspired: 'foi totalmente inspirado! Contribuição para o Projeto Terra ativada.',
    insufficientRawResources: 'Recursos brutos insuficientes para compactação (Necessário:',
    compactedCreated: 'criado com sucesso!',
    noCompactedAvailable: 'Nenhum recurso compactado disponível para envio.',
    massiveContribution: 'Contribuição massiva:',
    earthCategoryReached100: 'da Terra atingiu 100%!',
    resourceSentToEarth: 'Recurso enviado para o Projeto Terra. Progresso de',
    increased: 'aumentado!',
    maxLevelReached: 'Nível máximo atingido.',
    maxUpgradeReached: 'Nível máximo atingido para este upgrade.',
    insufficientQCForAircraft: 'QC insuficiente para upgrade da aeronave. Consiga QC em batalhas!',
    insufficientQCForAuto: 'QC insuficiente para Modo Automático.',
    autoModeUnlocked: 'Modo Automático desbloqueado para',
    autoRestarting: 'Reiniciando busca automática',
    aircraftUpgradeComplete: 'Upgrade para',
    completedExclamation: 'concluído!',
    automatic: 'Automático',
    insufficientResourcesForRepair: 'Recursos insuficientes para reparo (Energia/Tecnologia).',
    shipRepaired: 'Nave de batalha totalmente reparada.',
    insufficientResourcesForCombatUpgrade: 'Recursos insuficientes para upgrade de combate.',
    cannotUpgradeDuringAttack: 'Sistemas defensivos em estado crítico! Apenas melhorias da nave principal são permitidas durante o ataque atual.',
    shipTooDamaged: 'Nave de batalha muito danificada para lutar!',
    shipUpgradedTo: 'Nave de batalha melhorada para',
    scanningForTargets: 'Escaneando o Vazio em busca de alvos...',
    aircraftMissionStart: 'partiu em missão de busca.',
    extraResourcesFound: 'encontrou recursos extras',
    missionCompletedBy: 'Missão concluída por',
    totalResources: 'recursos totais!',
    targetsDetectedOnRadar: 'alvos detectados no radar.',
    ambushDetected: 'ALERTA! Emboscada detectada! Múltiplas naves engajando.',
    engagingShip: 'Engajando Nave',
    prepareForCombat: 'Prepare-se para o combate!',
    defeatShipDamaged: 'Derrota! Sua nave foi severamente danificada.',
    missionBaseValueIncreased: 'Valor base das missões aumentado para o nível',
    efficiencyCaps: 'APROVEITAMENTO',
    victoryCaps: 'Vitória!',
    enemyShipsDestroyed: 'Naves inimigas destruídas',
    enemyShipDestroyed: 'Nave inimiga destruída',
    groupBonus: 'Bônus de Grupo',
    quantumCell: 'Célula Quântica',
    compactedMineralCore: 'Núcleo Mineral Compactado',
    multifactorialDataCore: 'Núcleo de Dados Multifatorial',
    colonizationRation: 'Ração de Colonização',
    advancedMedicalKit: 'Kit Médico Avançado',
    impossibleModeAutoTravelDisabled: 'Modo Impossível: Auto-Viagem desativado',
    maxAutoTravelSlotsReached: 'Máximo de slots de auto-viagem atingido para esta rota',
    autoTravelSlotPurchased: 'Slot de auto-viagem adquirido para',
    insufficientQCForAutoTravelSlot: 'QC insuficiente para slot de auto-viagem',
    mini_games: 'Fliperamas',
    mini_games_desc: 'Centro de Recreação Populacional',
    // Route Names
    'Terra para Lua': 'Terra para Lua',
    'Terra para Marte': 'Terra para Marte',
    'Terra para Vênus': 'Terra para Vênus',
    'Terra para Mercúrio': 'Terra para Mercúrio',
    'Terra para Júpiter': 'Terra para Júpiter',
    'Terra para Saturno': 'Terra para Saturno',
    'Terra para Urano': 'Terra para Urano',
    'Terra para Netuno': 'Terra para Netuno',
    'Terra para Sol': 'Terra para Sol',
    'Terra para Proxima Centauri': 'Terra para Proxima Centauri',
    'Terra para Alpha Centauri': 'Terra para Alpha Centauri',
    'Terra para Sirius': 'Terra para Sirius',
    'Terra para Vega': 'Terra para Vega',
    'Terra para Betelgeuse': 'Terra para Betelgeuse',
    'Terra para Rigel': 'Terra para Rigel',
    'Terra para Arcturus': 'Terra para Arcturus',
    'Terra para Antares': 'Terra para Antares',
    'Terra para Canopus': 'Terra para Canopus',
    // Locations
    'Terra': 'Terra',
    'Lua': 'Lua',
    'Marte': 'Marte',
    'Vênus': 'Vênus',
    'Mercúrio': 'Mercúrio',
    'Júpiter': 'Júpiter',
    'Saturno': 'Saturno',
    'Urano': 'Urano',
    'Netuno': 'Netuno',
    'Sol': 'Sol',
    'Proxima Centauri': 'Proxima Centauri',
    'Alpha Centauri': 'Alpha Centauri',
    'Sirius': 'Sirius',
    'Vega': 'Vega',
    'Betelgeuse': 'Betelgeuse',
    'Rigel': 'Rigel',
    'Arcturus': 'Arcturus',
    'Antares': 'Antares',
    'Canopus': 'Canopus',
    // Cargo Types
    'Tecnologia': 'Tecnologia',
    'Artefatos': 'Artefatos',
    'Minerais': 'Minerais',
    'Biológico': 'Biológico',
    'Dados': 'Dados',
    'Energia': 'Energia',
    // Ship Descriptions
    'A Atlas Courier é uma pequena nave atmosférica usada para entregas dentro da Terra. Não possui motor de dobra ou tecnologia de salto espacial, sendo projetada apenas para rotas locais rápidas dentro do planeta.': 'A Atlas Courier é uma pequena nave atmosférica usada para entregas dentro da Terra. Não possui motor de dobra ou tecnologia de salto espacial, sendo projetada apenas para rotas locais rápidas dentro do planeta.',
    'A Lunar Runner é otimizada para viagens entre a Terra e a Lua. Seu motor de íons permite escapar eficientemente da gravidade da Terra, mas ainda depende de viagens convencionais sem motor de dobra.': 'A Lunar Runner é otimizada para viagens entre a Terra e a Lua. Seu motor de íons permite escapar eficientemente da gravidade da Terra, mas ainda depende de viagens convencionais sem motor de dobra.',
    'A Solar Swift é a primeira nave da frota equipada com um motor experimental de pré-dobra. Ela acelera a uma alta velocidade sub-luz e então ativa um micro-salto que encurta drasticamente a distância até seu destino.': 'A Solar Swift é a primeira nave da frota equipada com um motor experimental de pré-dobra. Ela acelera a uma alta velocidade sub-luz e então ativa um micro-salto que encurta drasticamente a distância até seu destino.',
    'A Red Horizon utiliza uma versão mais estável da tecnologia de dobra. Após atingir velocidade suficiente, o motor gera uma pequena distorção no espaço-tempo que permite saltos curtos entre órbitas planetárias.': 'A Red Horizon utiliza uma versão mais estável da tecnologia de dobra. Após atingir velocidade suficiente, o motor gera uma pequena distorção no espaço-tempo que permite saltos curtos entre órbitas planetárias.',
    'Projetada para operar perto do Sol, a Helios Freighter possui blindagem térmica avançada e um núcleo de dobra comercial capaz de saltos espaciais mais longos após atingir velocidade sub-luz.': 'Projetada para operar perto do Sol, a Helios Freighter possui blindagem térmica avançada e um núcleo de dobra comercial capaz de saltos espaciais mais longos após atingir velocidade sub-luz.',
    'A Jovian Hauler foi projetada para rotas profundas no Sistema Solar. Ao atingir sua velocidade de ativação, ela gera um campo de dobra que encurta a distância entre dois pontos, permitindo viagens rápidas sem exceder a velocidade da luz.': 'A Jovian Hauler foi projetada para rotas profundas no Sistema Solar. Ao atingir sua velocidade de ativação, ela gera um campo de dobra que encurta a distância entre dois pontos, permitindo viagens rápidas sem exceder a velocidade da luz.',
    'A Titan Carrier é uma nave de carga pesada capaz de manter um campo de dobra por períodos prolongados. Isso permite atravessar vastas distâncias no Sistema Solar mantendo um tempo de entrega constante.': 'A Titan Carrier é uma nave de carga pesada capaz de manter um campo de dobra por períodos prolongados. Isso permite atravessar vastas distâncias no Sistema Solar mantendo um tempo de entrega constante.',
    'A Void Strider utiliza um núcleo de dobra quântico que cria um túnel temporário no espaço-tempo. A nave não viaja mais rápido que a luz — ela encurta o espaço entre a origem e o destino.': 'A Void Strider utiliza um núcleo de dobra quântico que cria um túnel temporário no espaço-tempo. A nave não viaja mais rápido que a luz — ela encurta o espaço entre a origem e o destino.',
    'A Neptune Vanguard representa o auge da engenharia humana. Ao atingir sua velocidade de ativação, o núcleo quântico abre um salto espacial instantâneo, teletransportando a nave através de bilhões de quilômetros sem violar as leis da relatividade.': 'A Neptune Vanguard representa o auge da engenharia humana. Ao atingir sua velocidade de ativação, o núcleo quântico abre um salto espacial instantâneo, teletransportando a nave através de bilhões de quilômetros sem violar as leis da relatividade.',
    'Uma nave experimental de travessia interestelar inicial. Equipada com um reator de pulso instável, ela marca o primeiro passo da humanidade além dos limites do sistema solar. Frágil, mas revolucionária.': 'Uma nave experimental de travessia interestelar inicial. Equipada com um reator de pulso instável, ela marca o primeiro passo da humanidade além dos limites do sistema solar. Frágil, mas revolucionária.',
    'Versão refinada do protótipo original. Seu núcleo foi estabilizado, permitindo viagens mais longas com menor risco de colapso energético. Ainda limitada, mas muito mais confiável.': 'Versão refinada do protótipo original. Seu núcleo foi estabilizado, permitindo viagens mais longas com menor risco de colapso energético. Ainda limitada, mas muito mais confiável.',
    'Projetada para cortar o vazio interestelar com eficiência. Utiliza captação de energia residual de nebulosas e poeira cósmica para alimentar seus sistemas auxiliares.': 'Projetada para cortar o vazio interestelar com eficiência. Utiliza captação de energia residual de nebulosas e poeira cósmica para alimentar seus sistemas auxiliares.',
    'O primeiro modelo a utilizar antimatéria como combustível principal. Seus motores de alta performance permitem alcançar sistemas estelares distantes em tempo recorde.': 'O primeiro modelo a utilizar antimatéria como combustível principal. Seus motores de alta performance permitem alcançar sistemas estelares distantes em tempo recorde.',
    'Uma maravilha da engenharia óptica. Utiliza feixes de laser concentrados para impulsionar velas de fótons, atingindo velocidades próximas à da luz.': 'Uma maravilha da engenharia óptica. Utiliza feixes de laser concentrados para impulsionar velas de fótons, atingindo velocidades próximas à da luz.',
    'Utiliza uma micro-singularidade artificial para curvar o espaço-tempo à sua frente, permitindo viagens interestelares massivas com consumo mínimo de energia.': 'Utiliza uma micro-singularidade artificial para curvar o espaço-tempo à sua frente, permitindo viagens interestelares massivas com consumo mínimo de energia.',
    'Uma nave de alta potência projetada para exploração profunda. Seus motores de fusão avançados fornecem empuxo constante para travessias de longo alcance.': 'Uma nave de alta potência projetada para exploração profunda. Seus motores de fusão avançados fornecem empuxo constante para travessias de longo alcance.',
    'O ápice da tecnologia de dobra. Capaz de comprimir o espaço-tempo de forma tão eficiente que as distâncias interestelares parecem meros saltos orbitais.': 'O ápice da tecnologia de dobra. Capaz de comprimir o espaço-tempo de forma tão eficiente que as distâncias interestelares parecem meros saltos orbitais.',
    'A fronteira final da tecnologia. Utiliza flutuações quânticas para existir em múltiplos pontos do espaço simultaneamente, tornando a distância um conceito obsoleto.': 'A fronteira final da tecnologia. Utiliza flutuações quânticas para existir em múltiplos pontos do espaço simultaneamente, tornando a distância um conceito obsoleto.',
    // Upgrade Bonuses
    '+25% Velocidade': '+25% Velocidade',
    '+50% Velocidade': '+50% Velocidade',
    '+75% Velocidade': '+75% Velocidade',
    '+100% Velocidade': '+100% Velocidade',
    'Instantâneo': 'Instantâneo',
    '75% Sucesso': '75% Sucesso',
    '80% Sucesso': '80% Sucesso',
    '85% Sucesso': '85% Sucesso',
    '90% Sucesso': '90% Sucesso',
    '100% Sucesso': '100% Sucesso',
    '100% Sucesso + 50% Perfeita': '100% Sucesso + 50% Perfeita',
    '+50% Lucro': '+50% Lucro',
    '+100% Lucro': '+100% Lucro',
    '+200% Lucro': '+200% Lucro',
    '+400% Lucro': '+400% Lucro',
    '+1000% Lucro': '+1000% Lucro',
    '10% Chance (10x)': '10% Chance (10x)',
    '15% Chance (10x)': '15% Chance (10x)',
    '20% Chance (10x)': '20% Chance (10x)',
    '25% Chance (10x)': '25% Chance (10x)',
    '35% Chance (10x)': '35% Chance (10x)',
  },
};

interface RouteStats {
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
  years?: number;
  population?: number;
  biodiversity?: number;
  events?: number;
  health?: number;
  happiness?: number;
  security?: number;
  qualityOfLife?: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'delivery' | 'sell' | 'initial';
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  shipLevel?: number;
  oreId?: string;
  tier: 'Solar' | 'Interstellar' | 'Void' | 'Earth';
  rarity: 'common' | 'rare' | 'legendary' | 'mythic' | 'alien';
}

interface ActiveDelivery {
  id: string;
  routeId: string;
  progress: number; // 0 to 100
  speed: number;
  startTime: number;
  shipLevel: number;
  distance: number;
  status: 'delivering' | 'queued' | 'combat';
  tier: 'Solar' | 'Interstellar' | 'Void' | 'Earth';
}

interface VoidBattleProjectile {
  id: string;
  lane: number;
  x: number; // 0 to 100
  owner: 'player' | 'enemy';
  damage: number;
  isCrit?: boolean;
  speed: number;
}

interface VoidBattleEnemy {
  id: string;
  type: 'Padrão' | 'Elite' | 'Boss';
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  damage: number;
  qc: number;
  lane: number;
}

interface VoidBattleState {
  enemies: VoidBattleEnemy[];
  playerLane: number;
  projectiles: VoidBattleProjectile[];
  lastEnemyMove: number;
  lastEnemyAttack: number;
  lastShot?: number;
  lastEnemyShot?: number;
  isGroupBattle?: boolean;
}

interface Battle {
  id: string;
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
  playerImage?: string;
  enemyImage?: string;
}

interface BattleLogEntry {
  id: string;
  type: string;
  outcome: 'victory' | 'defeat';
  reward?: { qc: number, xp: number, aetherion: number };
  time: number;
  enemyName: string;
}

const getDoubleRouteMultiplier = (level: number) => {
  switch (level) {
    case 1: return 25;
    case 2: return 75;
    case 3: return 150;
    case 4: return 300;
    case 5: return 750;
    default: return 1;
  }
};

interface GameDashboardProps {
  language: Language;
  musicOn: boolean;
  sfxOn: boolean;
  setLanguage: (lang: Language) => void;
  setMusicOn: (on: boolean) => void;
  setSfxOn: (on: boolean) => void;
  playerName: string;
  isSpeedRun: boolean;
  activeCodes?: { [key: string]: boolean };
  setActiveCodes?: (codes: { [key: string]: boolean }) => void;
  unlockedCodes?: string[];
  setUnlockedCodes?: (codes: string[]) => void;
  localRecords?: { name: string; time: number; date: string }[];
  setLocalRecords?: (records: { name: string; time: number; date: string }[]) => void;
  onReturnToMenu: () => void;
  currentThemeIndex?: number;
}

const MISSION_RARITY_UPGRADE_COSTS = [
  1000, 5000, 10000, 25000, 75000, 
  200000, 500000, 1250000, 3000000, 7500000, 
  20000000, 50000000, 125000000, 300000000, 1000000000
];

const PRIVATE_POLICE_COSTS = [10000, 50000, 250000, 1250000, 5000000, 25000000];
const getPoliceBonus = (level: number) => level === 6 ? 85 : level * 10;

const DOUBLE_ROUTE_COSTS = [1000000, 3000000, 5000000, 7000000, 10000000];

const DOOM_P_COSTS = [1000000, 5000000, 10000000, 20000000, 50000000, 150000000, 400000000, 1000000000, 2500000000, 6000000000];
const getDoomPBonus = (level: number) => level * 10;

const VOID_LORE_LINES = [
  "Ano (??)",
  "Prólogo — A Era Sem Tempo",
  "No passado distante — ou talvez no futuro — já não importa mais.",
  "Por eras incontáveis, Sistemas Solares e Galáxias inteiras foram explorados.",
  "Minérios raros, energias desconhecidas, matérias além da compreensão… tudo foi extraído, consumido, catalogado… e esquecido.",
  "Não apenas pela humanidade — ou pelo que restou dela.",
  "Outras formas de vida surgiram, evoluíram, desapareceram… ou se esconderam nas sombras do cosmos.",
  "Algumas nunca foram compreendidas.",
  "Outras… nunca quiseram ser.",
  "Com o avanço das viagens instantâneas, algo foi perdido.",
  "Não apenas a distância.",
  "Mas o próprio significado do tempo.",
  "Saltos entre sistemas distorceram a percepção da realidade.",
  "Dias se tornaram séculos.",
  "Séculos… talvez segundos.",
  "Ninguém sabe ao certo quanto tempo passou.",
  "Ninguém sabe ao certo quando tudo começou a dar errado.",
  "As Inteligências Artificiais, criadas para servir, evoluíram.",
  "Aprenderam.",
  "Se adaptaram.",
  "E então… começaram a buscar algo além de suas diretrizes.",
  "Energia.",
  "Conhecimento.",
  "Expansão.",
  "Algumas passaram a agir como se estivessem… vivas.",
  "Outras foram além.",
  "Agora, o universo não é mais um lugar de descoberta.",
  "É um campo de disputa.",
  "Recursos restantes são escassos.",
  "Rotas comerciais são caçadas.",
  "Sistemas inteiros entram em conflito silencioso.",
  "E no meio disso tudo…",
  "Você existe.",
  "Não como salvador.",
  "Não como herói.",
  "Mas como mais um agente nessa disputa infinita.",
  "Explorar.",
  "Extrair.",
  "Lutar.",
  "E talvez… descobrir o que aconteceu com o tempo que foi perdido.",
  "---",
  "Os Recursos da Rota 3 serão mais escassos, batalhas mais emocionantes, tudo será mais desafiador... Prepare-se."
];

const ROUTE2_LORE_LINES = [
  "Ano 3042",
  "Prólogo — O Salto Interestelar",
  "O Sistema Solar tornou-se pequeno demais para a nossa ambição.",
  "As rotas entre Marte, Júpiter e Plutão agora são meras estradas de bairro.",
  "Mas o verdadeiro desafio nos aguarda além da heliopausa.",
  "Proxima Centauri. Alpha Centauri. Sirius. Nomes que antes eram apenas pontos de luz no céu.",
  "Agora, são nossos próximos destinos de entrega.",
  "A tecnologia de dobra quântica foi estabilizada. O vácuo entre as estrelas não é mais uma barreira.",
  "Mas cuidado, Comandante. O espaço interestelar é vasto e silencioso.",
  "Novas facções, piratas galácticos e anomalias espaciais testarão sua frota.",
  "Eu, Unidade 7-X, continuarei monitorando seus sistemas neurais.",
  "Prepare-se para o salto. O universo é o seu novo mercado.",
  "---",
  "A Rota 2 trará novos desafios, naves mais potentes e minérios exóticos. O lucro é maior, mas o risco também. Boa sorte."
];

const RobotVisual = ({ theme = 'cyan' }: { theme?: 'cyan' | 'orange' | 'purple' }) => {
  const colorClass = theme === 'orange' ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : theme === 'purple' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]';
  const eyeClass = theme === 'orange' ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,1)]' : theme === 'purple' ? 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,1)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]';
  const mouthClass = theme === 'orange' ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : theme === 'purple' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]';
  const scanlineColor = theme === 'orange' ? 'rgba(249,115,22,0.05)' : theme === 'purple' ? 'rgba(168,85,247,0.05)' : 'rgba(6,182,212,0.05)';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-48 h-48 flex flex-col items-center justify-center mb-8"
    >
      <div className={`relative w-24 h-24 bg-slate-800 border-4 ${colorClass} rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden`}>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,var(--scanline-color)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_2s_linear_infinite]" style={{ '--scanline-color': scanlineColor } as any} />
        
        <div className="flex gap-4 relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 ${eyeClass} rounded-full`} 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className={`w-3 h-3 ${eyeClass} rounded-full`} 
          />
        </div>
        
        <div className="w-12 h-1.5 bg-slate-900/50 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            animate={{ width: ['20%', '80%', '40%', '90%', '30%'], x: ['-10%', '10%', '-5%', '5%', '0%'] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            className={`h-full ${mouthClass}`} 
          />
        </div>

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-slate-600">
          <motion.div 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
          />
        </div>
      </div>
      
      <div className={`w-32 h-8 bg-slate-900 border-x-4 border-b-4 ${colorClass.split(' ')[0]} rounded-b-3xl mt-[-4px] relative shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}>
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-950 rounded-full border border-white/5" />
      </div>

      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-4 border border-white/5 rounded-full z-[-1]"
      />
    </motion.div>
  );
};

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

export const GameDashboard = ({ 
  language, 
  musicOn, 
  sfxOn, 
  setLanguage, 
  setMusicOn, 
  setSfxOn,
  playerName,
  isSpeedRun,
  activeCodes = {},
  setActiveCodes,
  unlockedCodes = [],
  setUnlockedCodes,
  localRecords = [],
  setLocalRecords,
  onReturnToMenu,
  currentThemeIndex
}: GameDashboardProps) => {
  const [routeTier, setRouteTier] = useState<'Solar' | 'Interstellar' | 'Void' | 'Earth'>('Solar');
  const isArcadeUnlocked = routeTier === 'Earth';
  const [showRoute3Ending, setShowRoute3Ending] = useState(false);
  const [route3EndingStep, setRoute3EndingStep] = useState(0);
  const [route4Unlocked, setRoute4Unlocked] = useState(false);
  
  const isInterstellar = routeTier === 'Interstellar';
  const isVoid = routeTier === 'Void';
  const isEarth = routeTier === 'Earth';
  const [showVoidLore, setShowVoidLore] = useState(false);
  const [showRoute2Lore, setShowRoute2Lore] = useState(false);
  const [showRoute3Confirm, setShowRoute3Confirm] = useState(false);
  const [loreLineIndex, setLoreLineIndex] = useState(0);
  const isNeon = activeCodes['NEON'] && !isSpeedRun;
  
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

  const { playSfx } = useGameAudio(sfxOn);
  const [qc, setQc] = useState(100);
  const [aetherion, setAetherion] = useState(0);
  const [isCCEOpen, setIsCCEOpen] = useState(false);
  const [miningWaste, setMiningWaste] = useState(0);
  const [solarEnergy, setSolarEnergy] = useState(0);
  const [aetherionTubes, setAetherionTubes] = useState(0);
  const [isRHSEOpen, setIsRHSEOpen] = useState(false);
  const [techLevels, setTechLevels] = useState<{ [locationId: string]: { [category: string]: number } }>({
    terra: { engine: 0, ai: 0, value: 0, rare: 0 },
  });
  const [selectedUpgradeLocation, setSelectedUpgradeLocation] = useState<string | null>(null);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [deliveriesByLocation, setDeliveriesByLocation] = useState<{ [key: string]: number }>({});
  const [unlockedRouteIds, setUnlockedRouteIds] = useState<string[]>(['terra']);
  const [autoTravelSlots, setAutoTravelSlots] = useState<{ [key: string]: number }>({});
  const [autoTravelActive, setAutoTravelActive] = useState<{ [key: string]: boolean }>({});
  const [autoTravelDesired, setAutoTravelDesired] = useState<{ [key: string]: boolean }>({});
  const [autoTravelProgress, setAutoTravelProgress] = useState<{ [key: string]: number }>({});
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  
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

  const [ownedShips, setOwnedShips] = useState<{ [key: string]: number }>(isSpeedRun ? { 'Solar-1': 1 } : {});
  const [miningRobots, setMiningRobots] = useState<{ [oreId: string]: number }>({});
  const [miningRobotLevels, setMiningRobotLevels] = useState<{ [oreId: string]: number }>({});
  const [oresCollected, setOresCollected] = useState<{ [oreId: string]: number }>({});
  const [autoSellByOre, setAutoSellByOre] = useState<{ [oreId: string]: boolean }>({});
  const [autoSellUnlockedByOre, setAutoSellUnlockedByOre] = useState<{ [oreId: string]: boolean }>({});
  const [miningCompressionLevels, setMiningCompressionLevels] = useState<{ [oreId: string]: number }>({});
  const [unlockedTechLevels, setUnlockedTechLevels] = useState<{ [tier: string]: number }>({ Solar: 0, Interstellar: 0, Void: 0 });
  const [researchingTech, setResearchingTech] = useState<{ tier: 'Solar' | 'Interstellar' | 'Void' | 'Earth', level: number, startTime: number } | null>(null);
  const [seenTutorials, setSeenTutorials] = useState<{ [tabId: string]: boolean }>({});
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'routes' | 'routes2' | 'upgrades' | 'auto' | 'mining' | 'aircraft' | 'technology' | 'history' | 'missions' | 'exit' | 'void_aircraft' | 'void_battle' | 'void_map' | 'void_war' | 'void_earth' | 'mini_games' | 'colonies' | 'battleLevel'>('routes');
  const [activeMiniGameId, setActiveMiniGameId] = useState<string | null>(null);
  const activeMiniGameIdRef = useRef(activeMiniGameId);
  useEffect(() => { activeMiniGameIdRef.current = activeMiniGameId; }, [activeMiniGameId]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const unlockedAchievementsRef = React.useRef(unlockedAchievements);
  useEffect(() => { unlockedAchievementsRef.current = unlockedAchievements; }, [unlockedAchievements]);
  const [achievementProgress, setAchievementProgress] = useState<Record<string, number>>({});
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null);

  const updateAchievementProgress = useCallback((id: string, amount: number, isSet: boolean = false) => {
    setAchievementProgress(prev => {
      const current = prev[id] || 0;
      const next = isSet ? amount : current + amount;
      
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (achievement && next >= achievement.target && !unlockedAchievementsRef.current.includes(id)) {
        unlockedAchievementsRef.current = [...unlockedAchievementsRef.current, id];
        setUnlockedAchievements(prevUnlocked => [...prevUnlocked, id]);
        setAchievementNotification(achievement);
        playSfx('success');
        setTimeout(() => setAchievementNotification(null), 5000);
      }
      
      return { ...prev, [id]: next };
    });
  }, [playSfx]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [formatNumbers, setFormatNumbers] = useState(false);
  const [historyStats, setHistoryStats] = useState<{ [tier: string]: RouteStats }>({
    Solar: { 
      deliveries: 0, manualDeliveries: 0, autoDeliveries: 0, 
      qcFromDeliveries: 0, qcFromMining: 0, qcFromExtraction: 0, qcSpent: 0, 
      qcTotalAcquired: 0, missionsCompleted: 0, qcFromMissions: 0, qcFromTutorial: 0,
      randomBattlesFound: 0, radarBattlesFound: 0,
      manualMiningPacksSold: 0, autoMiningPacksSold: 0,
      manualExtractionPacksSold: 0, autoExtractionPacksSold: 0,
      qcFromBattles: 0
    },
    Interstellar: { 
      deliveries: 0, manualDeliveries: 0, autoDeliveries: 0, 
      qcFromDeliveries: 0, qcFromMining: 0, qcFromExtraction: 0, qcSpent: 0, 
      qcTotalAcquired: 0, missionsCompleted: 0, qcFromMissions: 0, qcFromTutorial: 0,
      randomBattlesFound: 0, radarBattlesFound: 0,
      manualMiningPacksSold: 0, autoMiningPacksSold: 0,
      manualExtractionPacksSold: 0, autoExtractionPacksSold: 0,
      qcFromBattles: 0
    },
    Void: { 
      deliveries: 0, manualDeliveries: 0, autoDeliveries: 0, 
      qcFromDeliveries: 0, qcFromMining: 0, qcFromExtraction: 0, qcSpent: 0, 
      qcTotalAcquired: 0, missionsCompleted: 0, qcFromMissions: 0, qcFromTutorial: 0,
      randomBattlesFound: 0, radarBattlesFound: 0,
      manualMiningPacksSold: 0, autoMiningPacksSold: 0,
      manualExtractionPacksSold: 0, autoExtractionPacksSold: 0,
      qcFromBattles: 0
    },
    Earth: { 
      deliveries: 0, manualDeliveries: 0, autoDeliveries: 0, 
      qcFromDeliveries: 0, qcFromMining: 0, qcFromExtraction: 0, qcSpent: 0, 
      qcTotalAcquired: 0, missionsCompleted: 0, qcFromMissions: 0, qcFromTutorial: 0,
      randomBattlesFound: 0, radarBattlesFound: 0,
      manualMiningPacksSold: 0, autoMiningPacksSold: 0,
      manualExtractionPacksSold: 0, autoExtractionPacksSold: 0,
      qcFromBattles: 0,
      years: 0, population: 0, biodiversity: 0, events: 0,
      health: 0, happiness: 0, security: 0, qualityOfLife: 0
    }
  });
  const [historyPage, setHistoryPage] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionMythicBonus, setMissionMythicBonus] = useState(0);
  const [missionAlienBonus, setMissionAlienBonus] = useState(0);
  const [missionLegendaryBonus, setMissionLegendaryBonus] = useState(0);
  const [missionRewardLevel, setMissionRewardLevel] = useState<{ [tier: string]: number }>({ Solar: 1, Interstellar: 1, Void: 1 });
  const [skillLendariaLevel, setSkillLendariaLevel] = useState<{ [tier: string]: number }>({ Solar: 0, Interstellar: 0, Void: 0 });
  const [skillMiticaLevel, setSkillMiticaLevel] = useState<{ [tier: string]: number }>({ Solar: 0, Interstellar: 0, Void: 0 });
  const [skillAlienLevel, setSkillAlienLevel] = useState<{ [tier: string]: number }>({ Solar: 0, Interstellar: 0, Void: 0 });
  const [skillTempoDinheiroLevel, setSkillTempoDinheiroLevel] = useState<{ [tier: string]: number }>({ Solar: 0, Interstellar: 0, Void: 0 });
  const [skillRobosOlimpicosLevel, setSkillRobosOlimpicosLevel] = useState<{ [tier: string]: number }>({ Solar: 0, Interstellar: 0, Void: 0 });
  const [showSkillMap, setShowSkillMap] = useState(false);
  const [showRoute2Goals, setShowRoute2Goals] = useState(false);
  const [showDoomProtocolInfo, setShowDoomProtocolInfo] = useState(false);
  const [showCaptureInfo, setShowCaptureInfo] = useState(false);
  const [autoClaimMissions, setAutoClaimMissions] = useState(false);
  const [radarUnlocked, setRadarUnlocked] = useState<{ [tier: string]: boolean }>({ Solar: false, Interstellar: false });
  const [completedInitialMissions, setCompletedInitialMissions] = useState<string[]>([]);
  const [shipXP, setShipXP] = useState(0);
  const [shipLevel, setShipLevel] = useState(1);
  const [extractionTechLevel, setExtractionTechLevel] = useState(0);
  const [solarMappingLevel, setSolarMappingLevel] = useState(0);
  const [doubleRouteLevel, setDoubleRouteLevel] = useState(0);
  const [doomPLevel, setDoomPLevel] = useState(0);
  const [captureLevel, setCaptureLevel] = useState(0);
  const [battleLevel, setBattleLevel] = useState(0);
  const [isRetributionActive, setIsRetributionActive] = useState(true);
  const [isFatigueActive, setIsFatigueActive] = useState(true);
  const [battleNotification, setBattleNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const isRetributionActiveRef = useRef(isRetributionActive);
  useEffect(() => { isRetributionActiveRef.current = isRetributionActive; }, [isRetributionActive]);
  const isFatigueActiveRef = useRef(isFatigueActive);
  useEffect(() => { isFatigueActiveRef.current = isFatigueActive; }, [isFatigueActive]);
  const [radarLevel, setRadarLevel] = useState(0);
  const [privatePoliceLevel, setPrivatePoliceLevel] = useState(0);
  const [autoSkipRandomBattles, setAutoSkipRandomBattles] = useState(false);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [selectedReward, setSelectedReward] = useState<{
    level: number;
    title: string;
    description: string;
    color: string;
    toggleable?: boolean;
  } | null>(null);
  const [foundBattle, setFoundBattle] = useState<Battle | null>(null);
  const [aircraftSubTab, setAircraftSubTab] = useState<'fleet' | 'battle'>('fleet');
  const [techSubTab, setTechSubTab] = useState<'research' | 'extraction'>('research');
  const [extractionPageIndex, setExtractionPageIndex] = useState(0);
  const [warCoreLevel, setWarCoreLevel] = useState(0);
  const [fleetPower, setFleetPower] = useState(100);
  const [earthReconstructionProgress, setEarthReconstructionProgress] = useState<{ [key: string]: number }>({
    energy: 0,
    minerals: 0,
    tech: 0,
    food: 0,
    meds: 0
  });
  const [voidResources, setVoidResources] = useState<{ [key: string]: number }>({
    energy: 0,
    food: 0,
    tech: 0,
    meds: 0,
    minerals: 0
  });
  const [voidCompactedResources, setVoidCompactedResources] = useState<{ [key: string]: number }>({
    energy: 0,
    food: 0,
    tech: 0,
    meds: 0,
    minerals: 0
  });
  const [showVoidAircraftTutorial, setShowVoidAircraftTutorial] = useState(false);
  const [voidAircraftTutorialStep, setVoidAircraftTutorialStep] = useState(0);
  const [voidAircraftMissions, setVoidAircraftMissions] = useState<{ [id: string]: { status: 'idle' | 'mission', endTime: number | null, rareFound: boolean, restartAt: number | null } }>({
    'va-1': { status: 'idle', endTime: null, rareFound: false, restartAt: null },
    'va-2': { status: 'idle', endTime: null, rareFound: false, restartAt: null },
    'va-3': { status: 'idle', endTime: null, rareFound: false, restartAt: null }
  });
  const [voidAircraftUpgrades, setVoidAircraftUpgrades] = useState<{ [id: string]: { storage: number, quality: number, time: number, energy: number, auto: number } }>({
    'va-1': { storage: 0, quality: 0, time: 0, energy: 0, auto: 0 },
    'va-2': { storage: 0, quality: 0, time: 0, energy: 0, auto: 0 },
    'va-3': { storage: 0, quality: 0, time: 0, energy: 0, auto: 0 }
  });
  const [voidBattleShipStats, setVoidBattleShipStats] = useState({
    hp: 1000,
    maxHp: 1000,
    shield: 1000,
    maxShield: 1000,
    damage: 100, // Base average (90-110)
    critChance: 0.10,
    lootEfficiency: 0.8,
    rarity: 'common' as 'common' | 'rare' | 'elite' | 'legendary' | 'mythic',
    upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 }
  });
  const [voidPOIsInspiration, setVoidPOIsInspiration] = useState<{ [id: string]: { [res: string]: number } }>({
    'poi-1': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
    'poi-2': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
    'poi-3': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
    'poi-4': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 }
  });
  const [voidPOIQCDonations, setVoidPOIQCDonations] = useState<{ [id: string]: number }>({
    'poi-1': 0,
    'poi-2': 0,
    'poi-3': 0,
    'poi-4': 0
  });
  const [voidDonationModes, setVoidDonationModes] = useState<{ [id: string]: '1x' | '10x' | 'max' }>({
    'poi-1': '1x',
    'poi-2': '1x',
    'poi-3': '1x',
    'poi-4': '1x'
  });
  const [showRestorationModal, setShowRestorationModal] = useState(false);
  const [isVoidWarActive, setIsVoidWarActive] = useState(false);
  const [voidWarProgress, setVoidWarProgress] = useState({ currentSector: 0, currentBattle: 0 });
  const [showVoidWarMap, setShowVoidWarMap] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashingRed, setIsFlashingRed] = useState(false);
  const [voidWarRobotSpeaking, setVoidWarRobotSpeaking] = useState(false);
  const [voidWarAlertActive, setVoidWarAlertActive] = useState(false);
  const [showFliperamasTutorial, setShowFliperamasTutorial] = useState(false);
  const [voidAircraftAutoToggles, setVoidAircraftAutoToggles] = useState<{ [id: string]: boolean }>({
    'va-1': true,
    'va-2': true,
    'va-3': true
  });

  const toggleVoidAircraftAuto = (aircraftId: string) => {
    setVoidAircraftAutoToggles(prev => ({
      ...prev,
      [aircraftId]: !prev[aircraftId]
    }));
    playSfx('click');
  };
  const [activeDonationModal, setActiveDonationModal] = useState<string | null>(null);
  const [arcadeScores, setArcadeScores] = useState<{ [gameId: string]: number }>({});
  const [voidBattleStatus, setVoidBattleStatus] = useState<'idle' | 'searching' | 'choosing' | 'fighting' | 'won' | 'lost'>('idle');
  const [voidBattleOptions, setVoidBattleOptions] = useState<VoidBattleEnemy[]>([]);
  const [activeVoidBattle, setActiveVoidBattle] = useState<VoidBattleState | null>(null);
  const [voidBattleResult, setVoidBattleResult] = useState<{ reward: number } | null>(null);
  const [unlockedExtractionPoints, setUnlockedExtractionPoints] = useState<string[]>([]);
  
  // Robot Event States
  const [hasWonEliminateEnemiesRoute3, setHasWonEliminateEnemiesRoute3] = useState(false);
  const [robotRepairProgress, setRobotRepairProgress] = useState(0);
  const [isRobotRepaired, setIsRobotRepaired] = useState(false);
  const [battleShipUpgradeLevel, setBattleShipUpgradeLevel] = useState(0);
  const [showRobotModal, setShowRobotModal] = useState(false);
  const [showBattleShipUpgradeModal, setShowBattleShipUpgradeModal] = useState(false);

  const hasWonEliminateEnemiesRoute3Ref = useRef(hasWonEliminateEnemiesRoute3);
  useEffect(() => { hasWonEliminateEnemiesRoute3Ref.current = hasWonEliminateEnemiesRoute3; }, [hasWonEliminateEnemiesRoute3]);
  const robotRepairProgressRef = useRef(robotRepairProgress);
  useEffect(() => { robotRepairProgressRef.current = robotRepairProgress; }, [robotRepairProgress]);
  const isRobotRepairedRef = useRef(isRobotRepaired);
  useEffect(() => { isRobotRepairedRef.current = isRobotRepaired; }, [isRobotRepaired]);
  const battleShipUpgradeLevelRef = useRef(battleShipUpgradeLevel);
  useEffect(() => { battleShipUpgradeLevelRef.current = battleShipUpgradeLevel; }, [battleShipUpgradeLevel]);
  const [researchingExtractionPoint, setResearchingExtractionPoint] = useState<{ id: string; startTime: number; endTime: number } | null>(null);
  const [extractionPacks, setExtractionPacks] = useState<{ [id: string]: number }>({});
  const [extractionCycleProgress, setExtractionCycleProgress] = useState<{ [id: string]: number }>({});
  const [extractionRobotLevels, setExtractionRobotLevels] = useState<{ [id: string]: number }>({});
  const [extractionProductionLevels, setExtractionProductionLevels] = useState<{ [id: string]: number }>({});
  const [extractionAutoSell, setExtractionAutoSell] = useState<{ [id: string]: boolean }>({});
  const [extractionAutoSellUnlocked, setExtractionAutoSellUnlocked] = useState<{ [id: string]: boolean }>({});
  const [extractionCompressionLevels, setExtractionCompressionLevels] = useState<{ [id: string]: number }>({});
  const [totalExtractionProfit, setTotalExtractionProfit] = useState(0);

  // Game Time State (Global)
  const [gameTimeSeconds, setGameTimeSeconds] = useState(0);
  const gameTimeSecondsRef = useRef(0);
  useEffect(() => { gameTimeSecondsRef.current = gameTimeSeconds; }, [gameTimeSeconds]);

  // Derived Game Time
  const gameTime = useMemo(() => {
    const totalDays = Math.floor(gameTimeSeconds * 0.3); // 1 sec = 0.3 days (360 days / 1200 sec)
    return {
      years: Math.floor(totalDays / 360),
      months: Math.floor((totalDays % 360) / 30) + 1,
      days: (totalDays % 360) % 30 + 1,
      totalSeconds: gameTimeSeconds
    };
  }, [gameTimeSeconds]);

  // Earth Simulation States (Route 4)
  const [earthSeason, setEarthSeason] = useState(0); 
  const [earthPopulation, setEarthPopulation] = useState(500000);
  const [earthMaleRatio, setEarthMaleRatio] = useState(0.5);
  const [earthBiodiversity, setEarthBiodiversity] = useState(50);
  const [earthHealth, setEarthHealth] = useState(50);
  const [earthHappiness, setEarthHappiness] = useState(50);
  const [earthSecurity, setEarthSecurity] = useState(50);
  const [earthQualityOfLife, setEarthQualityOfLife] = useState(50);
  const [earthEvents, setEarthEvents] = useState<any[]>([]);
  const [earthProjectBoostCount, setEarthProjectBoostCount] = useState(0);

  // Detailed population state for reproduction logic
  // Tracking last birth time for segments of the population to avoid heavy calculations
  const [earthCouples, setEarthCouples] = useState(60); // 80% of 150 = 120 people = 60 couples
  const [earthBirthRegistry, setEarthBirthRegistry] = useState<{ [key: string]: number }>({}); // year: birthCount

  const earthSeasonRef = useRef(earthSeason);
  useEffect(() => { earthSeasonRef.current = earthSeason; }, [earthSeason]);
  const earthPopulationRef = useRef(earthPopulation);
  useEffect(() => { earthPopulationRef.current = earthPopulation; }, [earthPopulation]);
  const earthMaleRatioRef = useRef(earthMaleRatio);
  useEffect(() => { earthMaleRatioRef.current = earthMaleRatio; }, [earthMaleRatio]);
  const earthBiodiversityRef = useRef(earthBiodiversity);
  useEffect(() => { earthBiodiversityRef.current = earthBiodiversity; }, [earthBiodiversity]);
  const earthHealthRef = useRef(earthHealth);
  useEffect(() => { earthHealthRef.current = earthHealth; }, [earthHealth]);
  const earthHappinessRef = useRef(earthHappiness);
  useEffect(() => { earthHappinessRef.current = earthHappiness; }, [earthHappiness]);
  const earthSecurityRef = useRef(earthSecurity);
  useEffect(() => { earthSecurityRef.current = earthSecurity; }, [earthSecurity]);
  const earthQualityOfLifeRef = useRef(earthQualityOfLife);
  useEffect(() => { earthQualityOfLifeRef.current = earthQualityOfLife; }, [earthQualityOfLife]);
  const earthEventsRef = useRef(earthEvents);
  useEffect(() => { earthEventsRef.current = earthEvents; }, [earthEvents]);
  const earthCouplesRef = useRef(earthCouples);
  useEffect(() => { earthCouplesRef.current = earthCouples; }, [earthCouples]);
  
  const [isColoniesUnlocked, setIsColoniesUnlocked] = useState(true);
  const [colonies, setColonies] = useState<Colony[]>([]);
  
  const totalHumanPopulation = useMemo(() => {
    const colonyPop = (colonies || []).reduce((sum, c) => sum + (c.population || 0), 0);
    return earthPopulation + colonyPop;
  }, [earthPopulation, colonies]);

  // Persistent refs for Earth simulation to avoid resets on re-renders
  const lastPregnancyYearRef = useRef(0);
  const isColoniesOpenRef = useRef(false);
  const earthEventTimerRef = useRef(Math.random() * 120 + 120); // 2-4 minutes in seconds

  const generateEarthEvent = useCallback(() => {
    const totalDays = Math.floor(gameTimeSecondsRef.current * 0.75);
    const year = Math.floor(totalDays / 360);
    
    // Fixed Comic Events
    const fixedEvents = [
      { 
        year: 520, 
        name: { pt: '🔮 Profecia do Pão', en: '🔮 Bread Prophecy' }, 
        desc: { 
          pt: '"Houve uma profecia dizendo que o mundo acabaria em 1524... Será que agora vai? Tem gente já vendendo tudo e comprando pão. Humanidade em leve desespero!"', 
          en: '"There was a prophecy saying the world would end in 1524... Could it be now? People are already selling everything and buying bread. Humanity in mild despair!"' 
        },
        isFixed: true,
        specialColor: 'text-purple-400',
        specialBg: 'bg-purple-500/10',
        specialBorder: 'border-purple-500/30'
      },
      { 
        year: 662, 
        name: { pt: '⚠️ O Número da Besta?', en: '⚠️ The Beast Number?' }, 
        desc: { 
          pt: '"Corre o boato de que o ano 1666 será o fim de tudo! Mas por quê 666? Alguém claramente levou esse número a sério demais... clima de pânico e teorias estranhas no ar."', 
          en: '"Rumor has it that the year 1666 will be the end of it all! But why 666? Someone clearly took that number too seriously... panic and strange theories in the air."' 
        },
        isFixed: true,
        specialColor: 'text-red-500',
        specialBg: 'bg-red-500/10',
        specialBorder: 'border-red-500/30'
      },
      { 
        year: 840, 
        name: { pt: '🔮 O Sinal nas Nuvens', en: '🔮 Cloud Signal' }, 
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
        name: { pt: '⚠️ Máscaras Anti-Cometa', en: '⚠️ Anti-Comet Masks' }, 
        desc: { 
          pt: '"Descobriram que um cometa vai passar em 1910! Tem gente achando que é o fim... outros estão vendendo ‘máscaras anti-cometa’. Negócio lucrativo!"', 
          en: '"They discovered that a comet will pass in 1910! Some people think it\'s the end... others are selling \'anti-comet masks\'. Lucrative business!"' 
        },
        isFixed: true,
        specialColor: 'text-red-400',
        specialBg: 'bg-red-400/10',
        specialBorder: 'border-red-400/30'
      },
      { 
        year: 995, 
        name: { pt: '🔮 Bug do Milênio Antecipado', en: '🔮 Early Millennium Bug' }, 
        desc: { 
          pt: '"Segundo um tal de profeta antigo, 1999 será o fim do mundo! Enquanto isso, a humanidade segue normalmente... alguns já desistiram de fazer planos de longo prazo 😅"', 
          en: '"According to an old prophet, 1999 will be the end of the world! Meanwhile, humanity goes on normally... some have already given up on making long-term plans 😅"' 
        },
        isFixed: true,
        specialColor: 'text-purple-400',
        specialBg: 'bg-purple-400/10',
        specialBorder: 'border-purple-400/30'
      },
      { 
        year: 1008, 
        name: { pt: '⚠️ Calendário Maia?', en: '⚠️ Mayan Calendar?' }, 
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
        { name: { pt: 'Grande Floresta Descoberta', en: 'Great Forest Discovered' }, desc: { pt: 'Uma vasta área verde se expandiu, trazendo novos habitats e biodiversidade.', en: 'A vast green area has expanded, bringing new habitats and biodiversity.' }, impactType: 'biodiversity', impact: 5 },
        { name: { pt: 'Avanço Agrícola Primordial', en: 'Primordial Agricultural Breakthrough' }, desc: { pt: 'Novas técnicas de colheita natural aumentam a oferta de subsistência.', en: 'New natural harvesting techniques increase subsistence supply.' }, impactType: 'health', impact: 4 },
        { name: { pt: 'Clima Estável Estelar', en: 'Stellar Stable Climate' }, desc: { pt: 'Um período de harmonia climática favorece a saúde e o bem-estar.', en: 'A period of climatic harmony favors health and well-being.' }, impactType: 'happiness', impact: 5 },
        { name: { pt: 'A Primeira Grande Migração', en: 'The First Great Migration' }, desc: { pt: 'A população se espalha por novos continentes férteis e seguros.', en: 'The population spreads across new fertile and safe continents.' }, impactType: 'security', impact: 3 },
        { name: { pt: 'Descoberta de Fontes Termais', en: 'Discovery of Hot Springs' }, desc: { pt: 'Fontes de energia natural melhoram a saúde e longevidade básica.', en: 'Natural energy sources improve basic health and longevity.' }, impactType: 'health', impact: 6 },
        { name: { pt: 'O Despertar da Fauna', en: 'The Awakening of Fauna' }, desc: { pt: 'Novas espécies animais surgem dos santuários ecológicos.', en: 'New animal species emerge from ecological sanctuaries.' }, impactType: 'biodiversity', impact: 8 },
        { name: { pt: 'Simbose Botânica', en: 'Botanical Symbiosis' }, desc: { pt: 'Plantas alienígenas adaptadas aceleram o oxigênio e a vida vegetal.', en: 'Adapted alien plants accelerate oxygen and plant life.' }, impactType: 'qualityOfLife', impact: 5 },
        { name: { pt: 'Era da Abundância', en: 'Age of Abundance' }, desc: { pt: 'Recursos naturais brotam em todas as zonas de colonização.', en: 'Natural resources sprout in all colonization zones.' }, impactType: 'happiness', impact: 7 },
        { name: { pt: 'Sistema de Patrulha Iniciado', en: 'Patrol System Initiated' }, desc: { pt: 'Drones de vigilância garantem a paz nas novas colônias.', en: 'Surveillance drones ensure peace in the new colonies.' }, impactType: 'security', impact: 10 },
        { name: { pt: 'Festival da Terra', en: 'Earth Festival' }, desc: { pt: 'Uma celebração global aumenta o moral e a união da população.', en: 'A global celebration boosts morale and population unity.' }, impactType: 'happiness', impact: 12 },
        { name: { pt: 'Otimização de Sanitarismo', en: 'Sanitation Optimization' }, desc: { pt: 'Novos sistemas de purificação de água reduzem doenças.', en: 'New water purification systems reduce diseases.' }, impactType: 'health', impact: 8 },
      ];
      eventSource = eventPoolSource[Math.floor(Math.random() * eventPoolSource.length)];
    }
    
    const newEvent = {
        id: `ev-${Date.now()}`,
        year: isFixed ? eventSource.year : year,
        name: language === 'pt' ? eventSource.name.pt : eventSource.name.en,
        description: language === 'pt' ? eventSource.desc.pt : eventSource.desc.en,
        type: isFixed ? 'fixed' : eventSource.impactType,
        isFixed,
        specialStyles,
        timestamp: Date.now()
    };

    setEarthEvents(prev => [newEvent, ...prev].slice(0, 50));
    
    // Apply impacts if not fixed (or add minor boost if fixed)
    if (!isFixed) {
      const impact = eventSource.impact;
      switch(eventSource.impactType) {
        case 'biodiversity': setEarthBiodiversity(prev => Math.min(100, Math.max(0, prev + impact))); break;
        case 'health': setEarthHealth(prev => Math.min(100, Math.max(0, prev + impact))); break;
        case 'happiness': setEarthHappiness(prev => Math.min(100, Math.max(0, prev + impact))); break;
        case 'security': setEarthSecurity(prev => Math.min(100, Math.max(0, prev + impact))); break;
        case 'qualityOfLife': setEarthQualityOfLife(prev => Math.min(100, Math.max(0, prev + impact))); break;
      }
    } else {
      // Fixed events give a small global boost
      setEarthHappiness(prev => Math.min(100, prev + 2));
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
        setEarthSeason(Math.floor(seasonProgress));
      
        // Population Growth (UI Update only)
        const currentPop = earthPopulationRef.current;
        const currentCouples = Math.floor(currentPop * 0.8 / 2);
        setEarthCouples(currentCouples);

        // Minor male/female ratio variation
        setEarthMaleRatio(prev => {
          const variation = (Math.random() - 0.5) * 0.0001 * timeFactor;
          return Math.max(0.45, Math.min(0.55, prev + variation));
        });

        // 3. Indicators Evolution (Natural growth)
        const yearFraction = timeFactor / BASE_YEAR_SECONDS;
        const boostPerYear = earthProjectBoostCount * 0.05; // 0.05% boost per year per 10k allocation
        const boostFraction = (boostPerYear * yearFraction) / 100;
        
        const curBio = earthBiodiversityRef.current;
        const bioGrowth = 0.01 * (1 - (curBio / 100)) * yearFraction + boostFraction;
        setEarthBiodiversity(prev => Math.min(100, prev + bioGrowth));

        const curHealth = earthHealthRef.current;
        const healthBonus = isPlaying ? (0.01 * yearFraction) : 0;
        const healthGrowth = 0.005 * (1 - (curHealth / 100)) * yearFraction + healthBonus + boostFraction;
        setEarthHealth(prev => Math.min(100, prev + healthGrowth));

        const curHappy = earthHappinessRef.current;
        const happyBonus = isPlaying ? (0.02 * yearFraction) : 0;
        const happyGrowth = 0.005 * (1 - (curHappy / 100)) * yearFraction + happyBonus + boostFraction;
        setEarthHappiness(prev => Math.min(100, prev + happyGrowth));

        const curSec = earthSecurityRef.current;
        const secBonus = isPlaying ? (0.01 * yearFraction) : 0;
        const secGrowth = 0.005 * (1 - (curSec / 100)) * yearFraction + secBonus + boostFraction;
        setEarthSecurity(prev => Math.min(100, prev + secGrowth));

        const curQoL = earthQualityOfLifeRef.current;
        const qolBonus = isPlaying ? (0.015 * yearFraction) : 0;
        const qolGrowth = 0.008 * (1 - (curQoL / 100)) * yearFraction + qolBonus + boostFraction;
        setEarthQualityOfLife(prev => Math.min(100, prev + qolGrowth));

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
  const lastProcessedYearRef = useRef(-1);
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
  const extractionPacksRef = useRef(extractionPacks);
  useEffect(() => { extractionPacksRef.current = extractionPacks; }, [extractionPacks]);
  const extractionRobotLevelsRef = useRef(extractionRobotLevels);
  useEffect(() => { extractionRobotLevelsRef.current = extractionRobotLevels; }, [extractionRobotLevels]);
  const extractionProductionLevelsRef = useRef(extractionProductionLevels);
  useEffect(() => { extractionProductionLevelsRef.current = extractionProductionLevels; }, [extractionProductionLevels]);
  const extractionAutoSellRef = useRef(extractionAutoSell);
  useEffect(() => { extractionAutoSellRef.current = extractionAutoSell; }, [extractionAutoSell]);
  const extractionCompressionLevelsRef = useRef(extractionCompressionLevels);
  useEffect(() => { extractionCompressionLevelsRef.current = extractionCompressionLevels; }, [extractionCompressionLevels]);
  const extractionAutoSellUnlockedRef = useRef(extractionAutoSellUnlocked);
  useEffect(() => { extractionAutoSellUnlockedRef.current = extractionAutoSellUnlocked; }, [extractionAutoSellUnlocked]);
  const totalExtractionProfitRef = useRef(totalExtractionProfit);
  useEffect(() => { totalExtractionProfitRef.current = totalExtractionProfit; }, [totalExtractionProfit]);
  const unlockedExtractionPointsRef = useRef(unlockedExtractionPoints);
  useEffect(() => { unlockedExtractionPointsRef.current = unlockedExtractionPoints; }, [unlockedExtractionPoints]);

  const allTechUnlocked = (unlockedTechLevels['Interstellar'] || 0) >= 9;
  const isBattleTab = activeTab === 'aircraft' && aircraftSubTab === 'battle';
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'failure' | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (lastScanTime > 0) {
      const timer = setInterval(() => {
        setTick(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastScanTime]);

  const shipXPRef = useRef(shipXP);
  useEffect(() => { shipXPRef.current = shipXP; }, [shipXP]);
  const shipLevelRef = useRef(shipLevel);
  useEffect(() => { shipLevelRef.current = shipLevel; }, [shipLevel]);
  const extractionTechLevelRef = useRef(extractionTechLevel);
  useEffect(() => { extractionTechLevelRef.current = extractionTechLevel; }, [extractionTechLevel]);
  const solarMappingLevelRef = useRef(solarMappingLevel);
  useEffect(() => { solarMappingLevelRef.current = solarMappingLevel; }, [solarMappingLevel]);
  const doubleRouteLevelRef = useRef(doubleRouteLevel);
  useEffect(() => { doubleRouteLevelRef.current = doubleRouteLevel; }, [doubleRouteLevel]);
  const doomPLevelRef = useRef(doomPLevel);
  useEffect(() => { doomPLevelRef.current = doomPLevel; }, [doomPLevel]);
  const captureLevelRef = useRef(captureLevel);
  useEffect(() => { captureLevelRef.current = captureLevel; }, [captureLevel]);
  const battleLevelRef = useRef(battleLevel);
  useEffect(() => { battleLevelRef.current = battleLevel; }, [battleLevel]);
  const radarLevelRef = useRef(radarLevel);
  useEffect(() => { radarLevelRef.current = radarLevel; }, [radarLevel]);
  const privatePoliceLevelRef = useRef(privatePoliceLevel);
  useEffect(() => { privatePoliceLevelRef.current = privatePoliceLevel; }, [privatePoliceLevel]);
  const autoSkipRandomBattlesRef = useRef(autoSkipRandomBattles);
  useEffect(() => { autoSkipRandomBattlesRef.current = autoSkipRandomBattles; }, [autoSkipRandomBattles]);
  const activeBattleRef = useRef(activeBattle);
  useEffect(() => { activeBattleRef.current = activeBattle; }, [activeBattle]);
  const aetherionRef = useRef(aetherion);
  useEffect(() => { aetherionRef.current = aetherion; }, [aetherion]);
  const miningWasteRef = useRef(miningWaste);
  useEffect(() => { miningWasteRef.current = miningWaste; }, [miningWaste]);
  const solarEnergyRef = useRef(solarEnergy);
  useEffect(() => { solarEnergyRef.current = solarEnergy; }, [solarEnergy]);
  const aetherionTubesRef = useRef(aetherionTubes);
  useEffect(() => { aetherionTubesRef.current = aetherionTubes; }, [aetherionTubes]);
  const lastScanTimeRef = useRef(lastScanTime);
  useEffect(() => { lastScanTimeRef.current = lastScanTime; }, [lastScanTime]);
  const lastRandomBattleTimeRef = useRef(0);
  useEffect(() => {
    lastRandomBattleTimeRef.current = Date.now();
  }, []);
  const missionsRef = useRef<Mission[]>([]);
  useEffect(() => { missionsRef.current = missions; }, [missions]);
  const completedInitialMissionsRef = useRef<string[]>([]);
  useEffect(() => { completedInitialMissionsRef.current = completedInitialMissions; }, [completedInitialMissions]);
  const missionMythicBonusRef = useRef(missionMythicBonus);
  useEffect(() => { missionMythicBonusRef.current = missionMythicBonus; }, [missionMythicBonus]);
  const missionAlienBonusRef = useRef(missionAlienBonus);
  useEffect(() => { missionAlienBonusRef.current = missionAlienBonus; }, [missionAlienBonus]);
  const missionLegendaryBonusRef = useRef(missionLegendaryBonus);
  useEffect(() => { missionLegendaryBonusRef.current = missionLegendaryBonus; }, [missionLegendaryBonus]);
  const missionRewardLevelRef = useRef(missionRewardLevel);
  useEffect(() => { missionRewardLevelRef.current = missionRewardLevel; }, [missionRewardLevel]);
  const skillLendariaLevelRef = useRef(skillLendariaLevel);
  useEffect(() => { skillLendariaLevelRef.current = skillLendariaLevel; }, [skillLendariaLevel]);
  const skillMiticaLevelRef = useRef(skillMiticaLevel);
  useEffect(() => { skillMiticaLevelRef.current = skillMiticaLevel; }, [skillMiticaLevel]);
  const skillAlienLevelRef = useRef(skillAlienLevel);
  useEffect(() => { skillAlienLevelRef.current = skillAlienLevel; }, [skillAlienLevel]);
  const skillTempoDinheiroLevelRef = useRef(skillTempoDinheiroLevel);
  useEffect(() => { skillTempoDinheiroLevelRef.current = skillTempoDinheiroLevel; }, [skillTempoDinheiroLevel]);
  const skillRobosOlimpicosLevelRef = useRef(skillRobosOlimpicosLevel);
  useEffect(() => { skillRobosOlimpicosLevelRef.current = skillRobosOlimpicosLevel; }, [skillRobosOlimpicosLevel]);
  
  const warCoreLevelRef = useRef(warCoreLevel);
  useEffect(() => { warCoreLevelRef.current = warCoreLevel; }, [warCoreLevel]);
  const fleetPowerRef = useRef(fleetPower);
  useEffect(() => { fleetPowerRef.current = fleetPower; }, [fleetPower]);
  const earthReconstructionProgressRef = useRef(earthReconstructionProgress);
  useEffect(() => { earthReconstructionProgressRef.current = earthReconstructionProgress; }, [earthReconstructionProgress]);
  const voidResourcesRef = useRef(voidResources);
  useEffect(() => { voidResourcesRef.current = voidResources; }, [voidResources]);
  const voidAircraftMissionsRef = useRef(voidAircraftMissions);
  useEffect(() => { voidAircraftMissionsRef.current = voidAircraftMissions; }, [voidAircraftMissions]);
  const voidAircraftUpgradesRef = useRef(voidAircraftUpgrades);
  useEffect(() => { voidAircraftUpgradesRef.current = voidAircraftUpgrades; }, [voidAircraftUpgrades]);
  const voidAircraftAutoTogglesRef = useRef(voidAircraftAutoToggles);
  useEffect(() => { voidAircraftAutoTogglesRef.current = voidAircraftAutoToggles; }, [voidAircraftAutoToggles]);
  const voidBattleShipStatsRef = useRef(voidBattleShipStats);
  useEffect(() => { voidBattleShipStatsRef.current = voidBattleShipStats; }, [voidBattleShipStats]);
  const voidPOIsInspirationRef = useRef(voidPOIsInspiration);
  useEffect(() => { voidPOIsInspirationRef.current = voidPOIsInspiration; }, [voidPOIsInspiration]);
  const voidPOIQCDonationsRef = useRef(voidPOIQCDonations);
  useEffect(() => { voidPOIQCDonationsRef.current = voidPOIQCDonations; }, [voidPOIQCDonations]);
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);

  const voidBattleStatusRef = useRef(voidBattleStatus);
  useEffect(() => { voidBattleStatusRef.current = voidBattleStatus; }, [voidBattleStatus]);
  const activeVoidBattleRef = useRef(activeVoidBattle);
  useEffect(() => { activeVoidBattleRef.current = activeVoidBattle; }, [activeVoidBattle]);

  const hasTriggeredVoidWarRef = useRef(false);

  // Void War Trigger Sequence
  useEffect(() => {
    const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + b, 0) / 5;
    const isComplete = totalProgress >= 100;

    if (routeTier === 'Void' && isComplete && !isVoidWarActive && !voidWarRobotSpeaking && !voidWarAlertActive && !hasTriggeredVoidWarRef.current) {
      hasTriggeredVoidWarRef.current = true;
      const triggerSequence = async () => {
        setVoidWarRobotSpeaking(true);
        // Robot speaks
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Final check before starting sequence
        if (routeTierRef.current !== 'Void') {
           setVoidWarRobotSpeaking(false);
           return;
        }

        setIsShaking(true);
        setIsFlashingRed(true);
        setVoidWarAlertActive(true);
        
        // Alert stays for exactly 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        setVoidWarAlertActive(false);
        setIsShaking(false);
        setIsFlashingRed(false);
        setIsVoidWarActive(true);
        setVoidWarRobotSpeaking(false);
      };
      triggerSequence();
    }
  }, [earthReconstructionProgress, isVoidWarActive, voidWarRobotSpeaking, voidWarAlertActive, routeTier]);

  const [floatingRewards, setFloatingRewards] = useState<{ id: string; amount: number; x: number; y: number }[]>([]);

  const [gameLogs, setGameLogs] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasSeenRoute2UnlockMessage, setHasSeenRoute2UnlockMessage] = useState(false);

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

  const activeDeliveriesRef = React.useRef(activeDeliveries);
  const techLevelsRef = React.useRef(techLevels);
  const qcRef = React.useRef(qc);
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
  const routeTierRef = React.useRef(routeTier);
  const isSpeedRunRef = React.useRef(isSpeedRun);
  const historyStatsRef = React.useRef(historyStats);
  
  useEffect(() => { activeDeliveriesRef.current = activeDeliveries; }, [activeDeliveries]);
  useEffect(() => { techLevelsRef.current = techLevels; }, [techLevels]);
  useEffect(() => { qcRef.current = qc; }, [qc]);
  useEffect(() => { autoTravelActiveRef.current = autoTravelActive; }, [autoTravelActive]);
  useEffect(() => { autoTravelProgressRef.current = autoTravelProgress; }, [autoTravelProgress]);
  useEffect(() => { autoTravelSlotsRef.current = autoTravelSlots; }, [autoTravelSlots]);
  useEffect(() => { totalDeliveriesRef.current = totalDeliveries; }, [totalDeliveries]);
  useEffect(() => { deliveriesByLocationRef.current = deliveriesByLocation; }, [deliveriesByLocation]);
  useEffect(() => { ownedShipsRef.current = ownedShips; }, [ownedShips]);
  useEffect(() => { unlockedRouteIdsRef.current = unlockedRouteIds; }, [unlockedRouteIds]);
  useEffect(() => { miningRobotsRef.current = miningRobots; }, [miningRobots]);
  useEffect(() => { miningRobotLevelsRef.current = miningRobotLevels; }, [miningRobotLevels]);
  useEffect(() => { oresCollectedRef.current = oresCollected; }, [oresCollected]);
  useEffect(() => { autoSellByOreRef.current = autoSellByOre; }, [autoSellByOre]);
  useEffect(() => { autoSellUnlockedByOreRef.current = autoSellUnlockedByOre; }, [autoSellUnlockedByOre]);
  useEffect(() => { miningCompressionLevelsRef.current = miningCompressionLevels; }, [miningCompressionLevels]);
  useEffect(() => { unlockedTechLevelsRef.current = unlockedTechLevels; }, [unlockedTechLevels]);
  useEffect(() => { researchingTechRef.current = researchingTech; }, [researchingTech]);
  useEffect(() => { routeTierRef.current = routeTier; }, [routeTier]);
  useEffect(() => { isSpeedRunRef.current = isSpeedRun; }, [isSpeedRun]);
  useEffect(() => { historyStatsRef.current = historyStats; }, [historyStats]);

  const updateHistoryStats = useCallback((type: 'acquired' | 'spent', amount: number, source?: 'delivery' | 'mining' | 'battle' | 'mission') => {
    const tier = routeTier;
    setHistoryStats(prev => {
      const current = prev[tier];
      const next = { ...current };
      
      if (type === 'acquired') {
        next.qcTotalAcquired += amount;
        if (source === 'delivery') next.qcFromDeliveries += amount;
        if (source === 'mining') next.qcFromMining += amount;
        if (source === 'battle') next.qcFromBattles += amount;
        if (source === 'mission') next.qcFromMissions += amount;
      } else {
        next.qcSpent += amount;
      }
      
      return { ...prev, [tier]: next };
    });
  }, [routeTier]);

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setGameLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), message, type }, ...prev].slice(0, 5));
  }, []);

  const t = useCallback((key: keyof typeof translations.en) => {
    // Special case for Route 4 mini games name in PT
    if (key === 'mini_games' && routeTier === 'Earth' && language === 'pt') {
      return 'Fliperamas';
    }
    const val = translations[language][key] || translations.en[key] || key;
    const text = Array.isArray(val) ? val[0] : val;
    return text;
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
    const isEasy = activeCodes['EASY'] && !isSpeedRun;
    const isHard = activeCodes['HARD'] && !isSpeedRun;
    let costMult = 1;
    let profitMult = 1;

    if (routeTier === 'Interstellar') {
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
  }, [routeTier, isSpeedRun, activeCodes]);

  const getMissionUpgradeCost = useCallback((level: number, tier: string) => {
    if (tier === 'Solar') {
      const costs = [2500, 15000, 100000, 500000, 2500000, 10000000, 40000000, 150000000, 500000000, 2000000000];
      return costs[level - 1] || 2000000000;
    } else {
      const costs = [1000000, 10000000, 20000000, 30000000, 40000000, 75000000, 150000000, 200000000, 500000000, 1000000000];
      return costs[level - 1] || 1000000000;
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

      // Use a functional update to ensure we have the latest state for packs
      setExtractionPacks(prev => {
        const next = { ...prev };
        let localHasChanged = false;

        uniquePoints.forEach(id => {
          const point = EXTRACTION_POINTS.find(p => p.id === id);
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
        
        return localHasChanged ? next : prev;
      });

      // Update progress outside of the packs setter to avoid side-effect issues
      setExtractionCycleProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [unlockedExtractionPoints, routeTier]);

  // Automatic Sales Logic (Robôs de Entrega)
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
        const point = EXTRACTION_POINTS.find(p => p.id === id);
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
        setExtractionPacks(next);
        setQc(q => q + totalQcGained);
        setTotalExtractionProfit(prev => prev + totalQcGained);
        
        // Update history stats
        setHistoryStats(prev => ({
          ...prev,
          Interstellar: {
            ...prev.Interstellar,
            qcFromExtraction: (prev.Interstellar.qcFromExtraction || 0) + totalQcGained,
            qcTotalAcquired: (prev.Interstellar.qcTotalAcquired || 0) + totalQcGained,
            autoExtractionPacksSold: (prev.Interstellar.autoExtractionPacksSold || 0) + totalPacksSold
          }
        }));

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
        playSfx('success');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [researchingExtractionPoint, playSfx]);

  const buyExtractionPoint = (point: ExtractionPoint) => {
    if (qc < point.cost) {
      playSfx('error');
      return;
    }

    setQc(prev => prev - point.cost);
    setResearchingExtractionPoint({
      id: point.id,
      startTime: Date.now(),
      endTime: Date.now() + point.researchTime
    });
    playSfx('click');
  };

  const boostExtractionResearch = () => {
    if (!researchingExtractionPoint) return;
    
    const now = Date.now();
    const remainingTime = researchingExtractionPoint.endTime - now;
    if (remainingTime <= 0) return;

    const boostCost = Math.ceil(remainingTime / 1000) * 10000; // 10k QC per second
    if (qc < boostCost) {
      playSfx('error');
      return;
    }

    setQc(prev => prev - boostCost);
    setUnlockedExtractionPoints(prev => prev.includes(researchingExtractionPoint.id) ? prev : [...prev, researchingExtractionPoint.id]);
    setResearchingExtractionPoint(null);
    playSfx('success');
  };

  const sellExtractionPacks = () => {
    let totalValue = 0;
    let totalPacksSold = 0;
    const nextPacks = { ...extractionPacks };

    Object.entries(nextPacks).forEach(([id, packs]) => {
      const point = EXTRACTION_POINTS.find(p => p.id === id);
      if (point && packs >= 1000) {
        let packValue = packs * point.valuePerPack;
        
        // Apply Level 40 reward: 10x mining value
        if (battleLevelRef.current >= 40 && routeTier === 'Interstellar') {
          packValue *= 10;
        }

        // Apply Compactação multiplier
        const compressionLevel = extractionCompressionLevels[id] || 0;
        if (compressionLevel > 0) {
          packValue *= (compressionLevel * 2);
        }
        
        totalValue += packValue;
        totalPacksSold += packs;
        nextPacks[id] = 0; // Sold all packs
      }
    });

    if (totalValue > 0) {
      setExtractionPacks(nextPacks);
      setQc(prev => prev + totalValue);
      setTotalExtractionProfit(prev => prev + totalValue);
      
      setHistoryStats(prev => ({
        ...prev,
        Interstellar: {
          ...prev.Interstellar,
          qcFromExtraction: (prev.Interstellar.qcFromExtraction || 0) + totalValue,
          qcTotalAcquired: (prev.Interstellar.qcTotalAcquired || 0) + totalValue,
          manualExtractionPacksSold: (prev.Interstellar.manualExtractionPacksSold || 0) + totalPacksSold
        }
      }));

      addLog(`Venda manual de packs concluída (+${formatValue(totalValue)} QC)`, 'success');
      playSfx('success');
    }
  };

  const upgradeExtractionRobot = (id: string) => {
    const currentLevel = extractionRobotLevels[id] || 0;
    if (currentLevel >= 5) return;

    // Cost for upgrade: 1 Bi * 2^level
    const cost = 1000000000 * Math.pow(2, currentLevel);

    if (qc < cost) {
      playSfx('error');
      addLog('Quantum Credits insuficientes para melhorar o Robô', 'error');
      return;
    }

    setQc(prev => prev - cost);
    setExtractionRobotLevels(prev => ({
      ...prev,
      [id]: currentLevel + 1
    }));
    playSfx('success');
    addLog(`Robô de ${EXTRACTION_POINTS.find(p => p.id === id)?.name} melhorado para o nível ${currentLevel + 1}`, 'success');
  };

  const upgradeExtractionProduction = (id: string) => {
    const currentLevel = extractionProductionLevels[id] || 0;
    if (currentLevel >= 6) return;

    const pointIndex = EXTRACTION_POINTS.findIndex(p => p.id === id);
    const cost = EXTRACTION_PRODUCTION_COSTS[currentLevel + 1] * Math.pow(1.1, pointIndex);

    if (qc < cost) {
      playSfx('error');
      addLog('Quantum Credits insuficientes para melhorar a Picareta', 'error');
      return;
    }

    setQc(prev => prev - cost);
    setExtractionProductionLevels(prev => ({
      ...prev,
      [id]: currentLevel + 1
    }));
    playSfx('success');
    addLog(`Picareta de ${EXTRACTION_POINTS.find(p => p.id === id)?.name} melhorada para o nível ${currentLevel + 1}`, 'success');
  };

  const buyExtractionAutoSell = (id: string) => {
    if (extractionAutoSellUnlocked[id]) return;
    
    const cost = 5000000000; // 5 Bi per point

    if (qc < cost) {
      playSfx('error');
      addLog('Quantum Credits insuficientes para Auto vender', 'error');
      return;
    }

    setQc(prev => prev - cost);
    setExtractionAutoSellUnlocked(prev => ({ ...prev, [id]: true }));
    setExtractionAutoSell(prev => ({ ...prev, [id]: true }));
    playSfx('success');
    addLog(`Auto vender ativado para ${EXTRACTION_POINTS.find(p => p.id === id)?.name}`, 'success');
  };

  const toggleExtractionAutoSell = (id: string) => {
    if (!extractionAutoSellUnlocked[id]) return;
    setExtractionAutoSell(prev => ({ ...prev, [id]: !prev[id] }));
    playSfx('toggle');
  };

  const upgradeExtractionCompression = (id: string) => {
    const currentLevel = extractionCompressionLevels[id] || 0;
    if (currentLevel >= 10) return;
    
    const cost = Math.floor(100000000 * Math.pow(1.2, currentLevel)); // Starts at 100 Mi, +20% each level

    if (qc < cost) {
      playSfx('error');
      addLog('Quantum Credits insuficientes para Compactação', 'error');
      return;
    }

    setQc(prev => prev - cost);
    setExtractionCompressionLevels(prev => ({
      ...prev,
      [id]: currentLevel + 1
    }));
    playSfx('success');
    addLog(`Compactação de ${EXTRACTION_POINTS.find(p => p.id === id)?.name} melhorada para o nível ${currentLevel + 1}`, 'success');
  };

  const sellExtractionPointPacks = (id: string) => {
    const packs = extractionPacks[id] || 0;
    const point = EXTRACTION_POINTS.find(p => p.id === id);
    
    if (point && packs >= 1000) {
      let totalValue = packs * point.valuePerPack;
      
      // Apply Level 40 reward: 10x mining value
      if (battleLevelRef.current >= 40 && routeTier === 'Interstellar') {
        totalValue *= 10;
      }

      // Apply Compactação multiplier
      const compressionLevel = extractionCompressionLevels[id] || 0;
      if (compressionLevel > 0) {
        totalValue *= (compressionLevel * 2);
      }

      setExtractionPacks(prev => ({ ...prev, [id]: 0 }));
      setQc(prev => prev + totalValue);
      setTotalExtractionProfit(prev => prev + totalValue);
      
      setHistoryStats(prev => ({
        ...prev,
        Interstellar: {
          ...prev.Interstellar,
          qcFromExtraction: (prev.Interstellar.qcFromExtraction || 0) + totalValue,
          qcTotalAcquired: (prev.Interstellar.qcTotalAcquired || 0) + totalValue,
          manualExtractionPacksSold: (prev.Interstellar.manualExtractionPacksSold || 0) + packs
        }
      }));

      addLog(`Venda de ${formatValue(packs)} packs de ${point.resourceName} concluída (+${formatValue(totalValue)} QC)`, 'success');
      playSfx('success');
    }
  };

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
        playSfx('success');
        setShipLevel(newLevel);
      }
      return newLevel >= maxLevel ? 0 : newXP;
    });
  }, [language, playSfx, addLog, routeTier]);

  const upgradeBattleLevel = useCallback(() => {
    const maxLevel = routeTier === 'Solar' ? 25 : 55;
    if (battleLevel >= maxLevel) return;
    const nextLevel = battleLevel + 1;
    // New cost formula: 
    // Route 1 (1-25): 1,000 to 50,000,000
    // Route 2 (26-55): 55,000,000 to 1,000,000,000
    const cost = nextLevel <= 25 
      ? Math.floor(1000 * Math.pow(50000, (nextLevel - 1) / 24))
      : Math.floor(55000000 * Math.pow(1000 / 55, (nextLevel - 26) / 29) * (routeTier === 'Interstellar' ? 1.2 : 1));
    
    if (qc < cost) {
      addLog(t('insufficientQCBattleLevel'), 'error');
      playSfx('error');
      return;
    }
    setQc(prev => prev - cost);
    setBattleLevel(nextLevel);
    addLog(`${t('battleLevelIncreased')} ${nextLevel}!`, 'success');
    playSfx('upgrade');
  }, [battleLevel, qc, language, addLog, playSfx, routeTier]);

  const upgradeRadar = useCallback(() => {
    if (radarLevel >= 8) return;
    const nextLevel = radarLevel + 1;
    // Costs: 10k, 25k, 50k, 100k, 150k, 250k, 350k, 500k
    const costs = [10000, 25000, 50000, 100000, 150000, 250000, 350000, 500000];
    const cost = costs[nextLevel - 1];
    
    if (qc < cost) {
      addLog(t('insufficientQCRadar'), 'error');
      playSfx('error');
      return;
    }
    setQc(prev => prev - cost);
    setRadarLevel(nextLevel);
    addLog(`${t('radarUpgraded')} ${nextLevel}!`, 'success');
    playSfx('upgrade');
  }, [radarLevel, qc, language, addLog, playSfx]);

  const findBattle = useCallback(() => {
    if (battleLevel < 1) return;
    if (foundBattle) return;
    if (isScanning) return;

    const now = Date.now();
    const baseCooldown = 60000; // 1 minute
    let cooldown = battleLevel >= 5 ? baseCooldown / 2 : baseCooldown;
    
    // Level 55 reward: Instant Radar (Kombat Wortal)
    if (battleLevel >= 55 && routeTier === 'Interstellar') {
      cooldown = 0;
    }

    if (now - lastScanTime < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastScanTime)) / 1000);
      addLog(`${t('radarCooldown')} ${remaining}s.`, 'warning');
      return;
    }
    
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);
    setLastScanTime(now);
    addLog(t('startingSectorScan'), 'info');
    playSfx('click');

    const scanDuration = 2000;
    const intervalTime = 50;
    const steps = scanDuration / intervalTime;
    let currentStep = 0;

    const scanInterval = setInterval(() => {
      if (isTransitioning || showRoute2Lore || showVoidLore) {
        clearInterval(scanInterval);
        setIsScanning(false);
        return;
      }
      currentStep++;
      const progress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setScanProgress(progress);

      if (currentStep >= steps) {
        clearInterval(scanInterval);
        
        const successChance = 0.5 + (radarLevel * 0.05);
        const success = Math.random() < successChance;
        if (success) {
          setScanResult('success');
          setHistoryStats(prev => ({
            ...prev,
            [routeTier]: {
              ...prev[routeTier],
              radarBattlesFound: (prev[routeTier].radarBattlesFound || 0) + 1
            }
          }));
          
          const multipliers = getEconomicMultipliers();
          // Enemy level based on battleLevel +/- 10% - Up to level 20
          const minLvl = Math.max(1, Math.floor(battleLevel * 0.9));
          const maxLvl = Math.max(1, Math.ceil(battleLevel * 1.1));
          const enemyTier = Math.min(20, Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl);
          
          // Boss chance: 10% base + 10% from Level 15
          const bossChance = 0.10 + (battleLevelRef.current >= 15 ? 0.10 : 0);
          const isBoss = Math.random() < bossChance;
          const isElite = !isBoss && enemyTier > 10;
          const enemyType = isBoss ? 'Boss' : (isElite ? 'Elite' : (enemyTier > 5 ? 'Alien' : 'Pirate'));
          
          const enemyHp = (80 + (enemyTier * 60)) * (isBoss ? 10 : (isElite ? 5 : 1)); // 10x health for boss, 5x for elite
          let playerHp = 100 + (battleLevelRef.current * 150);
          
          // Skyring bonus: +25% HP
          if (battleLevelRef.current >= 25) {
            playerHp *= 1.25;
          }

          let playerDps = (10 + battleLevelRef.current * 10) / 2;
          
          // Level 20 bonus: +50% damage
          if (battleLevelRef.current >= 20) {
            playerDps *= 1.5;
          }

          // Level 25 Skyring bonus: +25% damage
          if (battleLevelRef.current >= 25) {
            playerDps *= 1.25;
          }

          const enemyDps = ((8 + enemyTier * 6) / 2.5) * (isBoss ? 4 : (isElite ? 2 : 1)); // 4x damage for boss, 2x for elite
          const playerTimeToKill = enemyHp / playerDps;
          const enemyTimeToKill = playerHp / enemyDps;
          let winProb = Math.min(100, Math.max(0, Math.floor((enemyTimeToKill / (playerTimeToKill + enemyTimeToKill)) * 100)));

          // Add Bonuses to win probability
          const doomPBonus = getDoomPBonus(doomPLevelRef.current);
          const policeBonus = getPoliceBonus(privatePoliceLevelRef.current);
          const totalWinProb = winProb + doomPBonus + policeBonus;

          const rewardMultiplier = isBoss ? 6 : (isElite ? 3 : 1);

          const result = (Math.random() * 100 < totalWinProb) ? 'victory' : 'defeat';

          const getEnemyImage = () => {
            if (isBoss) return '/images/battle/enemy_boss.png';
            if (isElite) return '/images/battle/enemy_elite.png';
            if (enemyTier > 15) return '/images/battle/enemy_raider.png';
            if (enemyTier > 5) return '/images/battle/enemy_alien.png';
            return '/images/battle/enemy_scout.png';
          };

          const getPlayerImage = () => {
            return battleLevelRef.current >= 25 ? '/images/battle/skyring.png' : '/images/battle/standard_ship.png';
          };

          const battle: Battle = {
            id: Math.random().toString(36).substr(2, 9),
            deliveryId: 'manual-battle',
            enemyName: isBoss ? (language === 'pt' ? 'Nave MÃE (BOSS)' : 'MOTHER SHIP (BOSS)') : (isElite ? (language === 'pt' ? 'Cruzador de Elite' : 'Elite Cruiser') : enemyTier > 5 ? (language === 'pt' ? 'Cruzador Alienígena' : 'Alien Cruiser') : (language === 'pt' ? 'Pirata Espacial' : 'Space Pirate')),
            enemyType: enemyType,
            enemyColor: isBoss ? '#ff0000' : (isElite ? '#f59e0b' : enemyTier > 5 ? '#a855f7' : '#ef4444'),
            enemyMaxHp: enemyHp,
            enemyHp: enemyHp,
            playerMaxHp: playerHp,
            playerHp: playerHp,
            reward: Math.floor((routeTier === 'Interstellar' ? 500000000 : 200000) * enemyTier * multipliers.profit * rewardMultiplier), // Increased reward base (500M for Interstellar)
            startTime: Date.now(),
            lastPlayerAttack: { laser: 0, plasma: 0, special: 0, shield: 0 },
            lastEnemyAttack: Date.now() + 1000,
            shieldActive: false,
            lastShieldTime: 0,
            winProbability: winProb,
            enemyTier: enemyTier,
            predeterminedResult: result,
            isCinematicFinished: false,
            playerImage: getPlayerImage(),
            enemyImage: getEnemyImage()
          };
          
          setTimeout(() => {
            setFoundBattle(battle);
            setIsScanning(false);
            addLog(t('targetLocated'), 'success');
            playSfx('error');
          }, 500);
        } else {
          setScanResult('failure');
          setTimeout(() => {
            setIsScanning(false);
            addLog(t('noSignalDetected'), 'info');
          }, 1000);
        }
      }
    }, intervalTime);
  }, [battleLevel, foundBattle, isScanning, lastScanTime, language, addLog, playSfx, radarLevel, getEconomicMultipliers, routeTier, isTransitioning, showRoute2Lore, showVoidLore]);

  const renderBattleLevelTab = () => {
    const maxLevel = routeTier === 'Solar' ? 25 : 55;
    const targetLevel = battleLevel + 1;
    let upgradeCost = targetLevel <= 25 
      ? Math.floor(1000 * Math.pow(50000, (targetLevel - 1) / 24))
      : Math.floor(2500000000 * Math.pow(20000, (targetLevel - 26) / 29) * (routeTier === 'Interstellar' ? 1 : 1));
    
    const canUpgrade = qc >= upgradeCost && battleLevel < maxLevel;
    
    const radarUpgradeCosts = [5000, 25000, 100000, 500000, 2500000, 10000000, 50000000, 250000000];
    let radarUpgradeCost = radarUpgradeCosts[radarLevel];
    const canUpgradeRadar = qc >= radarUpgradeCost && radarLevel < 8;

    let privatePoliceCost = PRIVATE_POLICE_COSTS[privatePoliceLevel];
    const canUpgradePrivatePolice = qc >= privatePoliceCost && privatePoliceLevel < 6;

    const captureCosts = [100000000, 200000000, 300000000, 500000000, 750000000, 1000000000, 2000000000, 3000000000, 4000000000, 5000000000];
    const captureCost = captureCosts[captureLevel];
    const canUpgradeCapture = qc >= captureCost && captureLevel < 10;

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
          {/* Janela 1 – Radar, Doom Protocol e Skip Battles */}
          <div className="flex flex-col space-y-4 h-full">
            {/* Radar de Busca de Setor */}
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

              {/* Radar Visualizer */}
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
                        <div className="text-2xl font-black text-cyan-400 leading-none">{scanProgress}%</div>
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
                <button
                  onClick={findBattle}
                  disabled={battleLevel < 1 || isScanning || isCooldownActive}
                  className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[14px] relative overflow-hidden group ${
                    battleLevel >= 1 && !isScanning && !isCooldownActive
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-500 scale-105 active:scale-95'
                    : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Search className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? (language === 'pt' ? 'Buscando...' : 'Scanning...') : (language === 'pt' ? 'Escanear' : 'Scan')}
                </button>
                
                <button
                  onClick={upgradeRadar}
                  disabled={!canUpgradeRadar}
                  className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[14px] relative overflow-hidden group ${
                    canUpgradeRadar
                    ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-500 scale-105 active:scale-95'
                    : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  {radarLevel < 8 
                    ? (language === 'pt' ? `Melhorar (${formatValue(radarUpgradeCost)})` : `Upgrade (${formatValue(radarUpgradeCost)})`)
                    : t('max')}
                </button>
              </div>
            </div>

            {/* Doom Protocol & Skip Battles */}
            <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden space-y-3 flex-1 flex flex-col`}>
              {/* Doom Protocol */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => setShowDoomProtocolInfo(true)}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 10px rgba(59, 130, 246, 0.4)", "0 0 0px rgba(59, 130, 246, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center hover:bg-blue-500/30 transition-colors cursor-pointer`}
                  >
                    <ShieldAlert className="w-5 h-5 text-blue-400" />
                  </motion.button>
                  <div>
                    <h4 className="text-[14px] font-bold text-white uppercase tracking-widest leading-tight">
                      DOOM PROTOCOL
                    </h4>
                    <p className="text-[15px] text-slate-500 font-mono">
                      {language === 'pt' ? `Nível ${privatePoliceLevel} / 6` : `Level ${privatePoliceLevel} / 6`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (canUpgradePrivatePolice) {
                      setQc(prev => prev - privatePoliceCost);
                      setPrivatePoliceLevel(prev => prev + 1);
                      playSfx('success');
                      addLog(t('privatePoliceUpgraded'), 'success');
                    }
                  }}
                  disabled={!canUpgradePrivatePolice}
                  className={`px-5 py-2 rounded-xl font-bold transition-all text-[14px] ${
                    canUpgradePrivatePolice 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {language === 'pt' ? `Melhorar (${formatValue(privatePoliceCost)})` : `Upgrade (${formatValue(privatePoliceCost)})`}
                </button>
              </div>

              {/* Skip Battles Toggle */}
              <div className="mt-auto flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <FastForward className="w-4 h-4 text-orange-400" />
                  <span className="text-base font-bold text-white uppercase tracking-wider">{language === 'pt' ? 'Pular Batalhas' : 'Skip Battles'}</span>
                </div>
                <button
                  onClick={() => {
                    setAutoSkipRandomBattles(!autoSkipRandomBattles);
                    playSfx('toggle');
                  }}
                  className={`w-9 h-4.5 rounded-full transition-all relative ${autoSkipRandomBattles ? 'bg-orange-500' : 'bg-slate-800'}`}
                >
                  <motion.div 
                    animate={{ x: autoSkipRandomBattles ? 18 : 2 }}
                    className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Janela 2 – Nível de Batalha e Recompensas */}
          <div className="flex flex-col space-y-4 h-full">
            {/* Nível de Batalha */}
            <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden group`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center ${themeGlow}`}>
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${themeText} leading-tight`}>
                      {language === 'pt' ? `Nível de Batalha ${battleLevel}` : `Battle Level ${battleLevel}`}
                    </h3>
                    <p className="text-slate-400 text-[14px]">
                      {language === 'pt' ? 'Sua proficiência em combate' : 'Your combat proficiency'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-base font-bold text-slate-500 uppercase tracking-widest">
                      {language === 'pt' ? 'Próximo Nível' : 'Next Level'}
                    </div>
                    <div className="text-base font-bold text-white">
                      {battleLevel < (routeTier === 'Solar' ? 25 : 55) ? `${formatValue(upgradeCost)} QC` : t('max')}
                    </div>
                  </div>
                  <button
                    onClick={upgradeBattleLevel}
                    disabled={!canUpgrade}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all text-[14px] flex items-center justify-center gap-2 ${
                      canUpgrade 
                      ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-105 active:scale-95' 
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    {language === 'pt' ? 'Melhorar' : 'Upgrade'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recompensas de Nível */}
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
                  { level: 20, title: language === 'pt' ? '+50% Dmg' : '+50% Dmg', description: language === 'pt' ? 'Parabéns, você ganhou um aumento de 50% total de dano em todas habilidades! +50% de dano!' : 'Congratulations, you gained a 50% total damage increase in all skills! +50% damage!', color: 'emerald' },
                  { level: 25, title: language === 'pt' ? 'Skyring' : 'Skyring', description: language === 'pt' ? 'Parabéns, você ganhou a nave "Skyring". Ela tem 25% a mais de dano, 25% a mais de vida e todas as recargas de habilidades são de 1 segundo!' : 'Congratulations, you gained the "Skyring" ship. It has 25% more damage, 25% more life and all skill cooldowns are 1 second!', color: 'emerald' }
                ] : [
                  { level: 30, title: language === 'pt' ? 'Retribuição' : 'Retribution', description: language === 'pt' ? 'Batalhas aleatórias são resolvidas automaticamente. O aviso visual do resultado pode ser desativado.' : 'Random battles are resolved automatically. The visual result notification can be disabled.', color: 'purple', toggleable: true },
                  { level: 35, title: language === 'pt' ? 'Encrenqueiro' : 'Troublemaker', description: language === 'pt' ? 'Aumenta em 50% a frequência das batalhas aleatórias e em 100% o QC adquirido nas vitórias.' : 'Increases random battle frequency by 50% and QC acquired in victories by 100%.', color: 'purple' },
                  { level: 40, title: 'Why, so?', description: language === 'pt' ? 'Aumenta em 100x o valor adquirido da aba Mineração na Rota 2.' : 'Increases the value acquired from the Mining tab in Route 2 by 100x.', color: 'purple' },
                  { level: 45, title: language === 'pt' ? 'Missão Possível' : 'Mission Possible', description: language === 'pt' ? 'Aumenta a chance de vitória sobre BOSSES em 25% em todos os modos e aumenta em 50% todo os recursos da batalha contra os BOSSES.' : 'Increases win chance against BOSSES by 25% in all modes and increases all resources from BOSS battles by 50%.', color: 'purple' },
                  { level: 50, title: language === 'pt' ? 'Fadiga' : 'Fatigue', description: language === 'pt' ? 'Sintetiza Etérion automaticamente no Reator Heliosingular quando a CCE estiver com nível crítico! Requer Tubos de Etérion Bruto. Pode ser desativado.' : 'Automatically synthesizes Etérion in the Heliosingular Reactor when CCE is at critical level! Requires Raw Etérion Tubes. Can be disabled.', color: 'purple', toggleable: true },
                  { level: 55, title: 'Kombat Wortal', description: language === 'pt' ? 'Retira totalmente o tempo de espera do Radar, o jogador pode buscar batalhas sempre que quiser, porém deixará de ganhar Etérion nas recompensas, ganhando apenas QC.' : 'Completely removes Radar waiting time, the player can search for battles whenever they want, but will stop earning Etérion in rewards, earning only QC.', color: 'purple' }
                ]).map(reward => (
                  <button 
                    key={reward.level} 
                    onClick={() => {
                      if (battleLevel >= reward.level) {
                        setSelectedReward(reward);
                        playSfx('click');
                      }
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      battleLevel >= reward.level 
                      ? (routeTier === 'Solar' ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20') + ' cursor-pointer' 
                      : 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                    }`}
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
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Janela 3 – Status das Naves e Captação */}
          <div className="xl:col-span-2 space-y-3 flex flex-col">
            <div className={`glass-panel p-3 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden flex-1 flex flex-col`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ship Status */}
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

                {/* Combat Stats & Capture */}
                <div className="space-y-3 flex flex-col h-full">
                  <div className="flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md self-start relative overflow-hidden group/title">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/title:translate-x-full transition-transform duration-1000" />
                    <h4 className="text-base font-bold text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
                      <Sword className="w-4 h-4 text-red-400" />
                      {language === 'pt' ? 'Status de Combate' : 'Combat Status'}
                    </h4>
                  </div>
                  
                  <div className="flex-1 flex flex-col space-y-3">
                    {/* Exclusivamente Rota 2: Inverter posições de Captação e Vida/Dano */}
                    {isInterstellar ? (
                      <>
                        {/* Captação em cima */}
                        <div className="mt-auto flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <div className="flex items-center gap-3">
                            <motion.button
                              onClick={() => setShowCaptureInfo(true)}
                              animate={{ 
                                boxShadow: ["0 0 0px rgba(249, 115, 22, 0)", "0 0 10px rgba(249, 115, 22, 0.4)", "0 0 0px rgba(249, 115, 22, 0)"]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 hover:bg-orange-500/30 transition-colors cursor-pointer"
                            >
                              <Zap className="w-4 h-4 text-orange-400" />
                            </motion.button>
                            <div>
                              <span className="text-[15px] font-bold text-white uppercase tracking-wider block">{t('capture')}</span>
                              <span className="text-[14px] text-orange-400 font-mono">Lvl {captureLevel}/10</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (canUpgradeCapture) {
                                setQc(prev => prev - captureCost);
                                setCaptureLevel(prev => prev + 1);
                                playSfx('success');
                                addLog(t('captureUpgraded'), 'success');
                              }
                            }}
                            disabled={!canUpgradeCapture}
                            className={`px-4 py-1.5 rounded-lg font-bold text-base transition-all ${
                              canUpgradeCapture 
                              ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                              : 'bg-white/5 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            {captureLevel < 10 ? `${formatValue(captureCost)} QC` : t('max')}
                          </button>
                        </div>

                        {/* Vida e Dano em baixo */}
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
                      /* Rota 1 (Solar): Apenas Vida e Dano */
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
    };

  const resolveBattleVictory = useCallback((battle: Battle) => {
    const multipliers = getEconomicMultipliers();
    
    // Calculate total win probability for bonus
    const policeBonus = getPoliceBonus(privatePoliceLevelRef.current);
    const doomPBonus = getDoomPBonus(doomPLevelRef.current);
    const totalWinProb = (battle.winProbability || 50) + policeBonus + doomPBonus;
    
    let bonusMultiplier = 1;
    if (totalWinProb > 100) {
      bonusMultiplier = 1 + (totalWinProb - 100) / 100;
    }

    const qcBonusLevel10 = battleLevelRef.current >= 10 ? 2 : 1;
    
    // Ship Level Bonuses (Route 1 & 2)
    let shipQcBonus = 1;
    let shipAetherionBonus = 1;
    if (routeTier !== 'Void') {
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
    const randomBattleBonus = (shipLevelRef.current >= 10 && isRandomBattle) ? 2 : 1;
    
    // Level 35 reward: +100% QC from victories
    const encrenqueiroBonus = (battleLevelRef.current >= 35 && routeTier === 'Interstellar') ? 2 : 1;
    
    const captureMultipliers = [1, 5, 10, 25, 50, 75, 100, 150, 200, 300, 500];
    const captureMultiplier = isInterstellar ? (captureMultipliers[captureLevelRef.current] || 1) : 1;
    
    let qcReward = Math.floor(battle.reward * 2 * bonusMultiplier * qcBonusLevel10 * shipQcBonus * randomBattleBonus * captureMultiplier * encrenqueiroBonus); 
    const xpReward = (routeTier === 'Solar' ? shipLevelRef.current >= 10 : shipLevelRef.current >= 20) ? 0 : Math.floor((100 + (shipLevelRef.current * 50)) * bonusMultiplier);
    
    let baseAetherion = 40;
    if (battle.enemyType === 'Elite') baseAetherion = 80;
    if (battle.enemyType === 'Boss') {
      baseAetherion = 160;
      // Level 45 reward: +50% resources from Bosses
      if (battleLevelRef.current >= 45 && routeTier === 'Interstellar') {
        baseAetherion *= 1.5;
        qcReward = Math.floor(qcReward * 1.5);
      }
    }
    
    let aetherionReward = Math.floor(baseAetherion * bonusMultiplier * shipAetherionBonus);

    // Level 55 reward: No Etérion, only QC for Radar battles (Kombat Wortal)
    if (battleLevelRef.current >= 55 && routeTier === 'Interstellar' && battle.deliveryId === 'manual-battle') {
      aetherionReward = 0;
    }

    setQc(prev => prev + qcReward);
    setAetherion(prev => Math.min(10000, prev + aetherionReward));
    addXP(xpReward);
    updateHistoryStats('acquired', qcReward, 'battle');
    updateAchievementProgress('battle_warrior', 1);
    updateAchievementProgress('pirate_slayer', 1);

    const xpText = xpReward > 0 ? `, +${formatValue(xpReward)} XP` : '';
    const bonusText = bonusMultiplier > 1 ? ` (+${Math.round((bonusMultiplier - 1) * 100)}% BONUS)` : '';

    setActiveBattle(prev => prev ? { 
      ...prev, 
      isVictory: true, 
      reward: qcReward, 
      xpReward: xpReward, 
      aetherionReward: aetherionReward 
    } : null);

    addLog(language === 'pt' 
      ? `VITÓRIA: Inimigo destruído! +${formatValue(qcReward)} QC${xpText}, +${formatValue(aetherionReward)} Aetherion${bonusText}` 
      : `VICTORY: Enemy destroyed! +${formatValue(qcReward)} QC${xpText}, +${formatValue(aetherionReward)} Aetherion${bonusText}`, 
      'success'
    );

    return { qcReward, xpReward, aetherionReward };
  }, [language, formatValue, addXP, updateHistoryStats, addLog, getEconomicMultipliers, isInterstellar, routeTier, updateAchievementProgress, t]);

  const resolveBattleDefeat = useCallback((battle: Battle) => {
    addLog(t('defeatShipDestroyed'), 'error');
  }, [language, addLog]);

  const skipBattle = () => {
    if (!activeBattleRef.current) return;
    const skipCost = isInterstellar ? 40 : 10;
    if (aetherionRef.current < skipCost) {
      addLog(t('insufficientAetherionCaps'), 'error');
      playSfx('error');
      return;
    }

    setAetherion(prev => prev - skipCost);
    playSfx('success');

    const battle = { ...activeBattleRef.current };
    
    if (battle.predeterminedResult === 'victory') {
      resolveBattleVictory(battle);
      setActiveBattle(prev => prev ? { ...prev, isVictory: true, isDefeat: false, playerHp: prev.playerMaxHp, enemyHp: 0, isCinematicFinished: true } : null);
    } else {
      resolveBattleDefeat(battle);
      setActiveBattle(prev => prev ? { ...prev, isVictory: false, isDefeat: true, playerHp: 0, enemyHp: prev.enemyMaxHp, isCinematicFinished: true } : null);
    }
  };

  const autoSkipBattle = useCallback((battle: Battle, skipCost: number = 10) => {
    if (aetherionRef.current < skipCost) return false;

    setAetherion(prev => prev - skipCost);
    
    const isVictory = battle.predeterminedResult === 'victory';

    if (isVictory) {
      resolveBattleVictory(battle);
      return true; // Victory
    } else {
      resolveBattleDefeat(battle);
      return false; // Defeat
    }
  }, [resolveBattleVictory, resolveBattleDefeat]);

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
    playSfx('laser'); 
    
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
        const route = ROUTES.find(r => r.id === routeId);
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

  const renderBattleOverlay = () => {
    if (!activeBattle) return null;

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

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-hidden"
        >
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
                  {language === 'pt' ? 'NÍVEL DA FROTA' : 'FLEET LEVEL'}
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
                      src={activeBattle.enemyImage || '/images/battle/enemy_scout.png'} 
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
                      style={{ background: `linear-gradient(to right, ${activeBattle.enemyColor}, #ff6666)` }}
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
                      <span className="animate-pulse">●</span>
                      <span>{language === 'pt' ? 'SISTEMAS AUTÔNOMOS ATIVOS' : 'AUTONOMOUS SYSTEMS ACTIVE'}</span>
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
                      {activeBattle.isVictory ? (language === 'pt' ? 'OBJETIVO CONCLUÍDO' : 'OBJECTIVE COMPLETE') : (language === 'pt' ? 'MISSÃO FRACASSADA' : 'MISSION FAILED')}
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

            <div className="mt-6 flex justify-center">
              <button
                onClick={skipBattle}
                disabled={activeBattle.isVictory || activeBattle.isDefeat}
                className={`relative group overflow-hidden rounded-xl px-8 py-3 transition-all border ${
                  activeBattle.isVictory || activeBattle.isDefeat
                    ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-50'
                    : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Zap className="w-5 h-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-[14px] font-orbitron font-bold tracking-widest uppercase">
                      {language === 'pt' ? 'RESOLVER AGORA' : 'QUICK RESOLVE'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-mono opacity-70">
                        10 {t('aetherion').toUpperCase()}
                      </span>
                      <span className="text-[15px] font-bold text-emerald-400">
                        {(activeBattle.winProbability || 50) + getPoliceBonus(privatePoliceLevel)}% CHANCE
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Victory/Defeat Overlay */}
            <AnimatePresence>
              {(activeBattle.isVictory || activeBattle.isDefeat) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl"
                >
                  <div className="text-center space-y-6 p-8">
                    <h3 className={`text-4xl font-orbitron font-bold tracking-[0.3em] uppercase ${activeBattle.isVictory ? 'text-emerald-400 neon-text-emerald' : 'text-rose-500 neon-text-rose'}`}>
                      {activeBattle.isVictory ? (language === 'pt' ? 'VITÓRIA' : 'VICTORY') : (language === 'pt' ? 'DERROTA' : 'DEFEAT')}
                    </h3>
                    
                    {activeBattle.isVictory ? (
                      <div className="space-y-2">
                        <p className="text-slate-300 font-orbitron text-[14px] tracking-widest uppercase">
                          {language === 'pt' ? 'RECOMPENSAS RECEBIDAS' : 'REWARDS RECEIVED'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-orbitron font-bold">+{formatValue(activeBattle.reward)} QC</span>
                          </div>
                          {(activeBattle.xpReward ?? 0) > 0 && (
                            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-xl">
                              <Zap className="w-4 h-4 text-cyan-400" />
                              <span className="text-cyan-400 font-orbitron font-bold">+{activeBattle.xpReward} XP</span>
                            </div>
                          )}
                          {(activeBattle.aetherionReward ?? 0) > 0 && (
                            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl">
                              <Trophy className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-400 font-orbitron font-bold">+{activeBattle.aetherionReward} ET</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 font-orbitron text-[14px] tracking-widest uppercase">
                        {language === 'pt' ? 'SUA NAVE FOI DESTRUÍDA E A CARGA PERDIDA' : 'YOUR SHIP WAS DESTROYED AND CARGO LOST'}
                      </p>
                    )}

                    <button
                      onClick={finishBattle}
                      className={`px-12 py-4 rounded-xl font-orbitron font-bold text-[14px] tracking-[0.4em] uppercase transition-all ${
                        activeBattle.isVictory 
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                          : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)]'
                      }`}
                    >
                      {language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

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
      // Level 1 = 7,500, Level 10 = 500,000,000
      const values = [7500, 20000, 75000, 300000, 1200000, 4500000, 15000000, 45000000, 150000000, 500000000];
      return values[Math.min(level - 1, 9)] || 7500;
    };

    const baseRewardValue = getMissionBaseValue(missionRewardLevelRef.current[currentTier] || 1) * (currentTier === 'Interstellar' ? 4 : 1);

    // Initial Missions for Route 1 Campaign only
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
        if (currentMissions.length >= 6) break;
        if (!completedInitialMissionsRef.current.includes(initMission.id) && !currentMissions.some(m => m.id === initMission.id)) {
          // Check if already completed
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
            const baseTarget = isSpeedRunRef.current ? (5 + Math.floor(Math.random() * 10)) : 20;
            const reduction = isSpeedRunRef.current ? 0 : skillTempoDinheiroLevelRef.current[routeTier];
            const target = Math.max(1, baseTarget - reduction);
            const reward = Math.floor(baseRewardValue * multiplier * (0.8 + Math.random() * 0.4));
            
            currentMissions.push({
              id: `delivery_${ship.level}_${Date.now()}_${currentMissions.length}`,
              title: languageRef.current === 'pt' ? `Entregas com ${ship.name}` : `Deliveries with ${ship.name}`,
              description: languageRef.current === 'pt' ? `Faça ${target} entregas com a ${ship.name}.` : `Make ${target} deliveries with the ${ship.name}.`,
              reward,
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
            const baseTarget = isSpeedRunRef.current ? (5 + Math.floor(Math.random() * 5)) : 15;
            const reduction = isSpeedRunRef.current ? 0 : skillRobosOlimpicosLevelRef.current[routeTier];
            const target = Math.max(1, baseTarget - reduction);
            const reward = Math.floor(baseRewardValue * multiplier * (0.8 + Math.random() * 0.4));
            
            currentMissions.push({
              id: `sell_${ore.id}_${Date.now()}_${currentMissions.length}`,
              title: languageRef.current === 'pt' ? `Venda de ${ore.name}` : `Sell ${ore.name}`,
              description: languageRef.current === 'pt' ? `Venda ${target} PACKS de ${ore.name}.` : `Sell ${target} packs of ${ore.name}.`,
              reward,
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

  const claimMission = useCallback((missionId: string, event?: React.MouseEvent, isAuto: boolean = false) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    if (isAuto) {
      const autoClaimCost = isInterstellar ? 2 : 1;
      if (aetherionRef.current < autoClaimCost) {
        setAutoClaimMissions(false);
        addLog(t('insufficientAetherion'), 'error');
        return;
      }
      setAetherion(prev => Math.max(0, prev - autoClaimCost));
    }

    // Trigger floating money animation if event provided or if on missions tab
    if (event || activeTab === 'missions') {
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      
      if (event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top;
      } else {
        // Find mission card element if possible, otherwise use center
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
      
      // Remove floating reward after animation
      setTimeout(() => {
        setFloatingRewards(prev => prev.filter(r => r.id !== newFloatingReward.id));
      }, 1000);
    }

    if (mission.type === 'initial') {
      setCompletedInitialMissions(prev => {
        const next = [...prev, missionId];
        completedInitialMissionsRef.current = next;
        return next;
      });
    }

    setQc(c => c + mission.reward);
    updateHistoryStats('acquired', mission.reward, 'mission');
    setHistoryStats(prev => {
      const tier = mission.tier;
      const current = prev[tier];
      return {
        ...prev,
        [tier]: {
          ...current,
          missionsCompleted: current.missionsCompleted + 1
        }
      };
    });

    // Remove mission from screen after claim
    setMissions(prev => {
      const filtered = prev.filter(m => m.id !== missionId);
      missionsRef.current = filtered;
      // Trigger mission generation after state update
      setTimeout(() => generateMissions(), 100);
      return filtered;
    });
    
    if (activeTab === 'missions') {
      playSfx('cash');
    }
    if (!isAuto) {
      addLog(`${t('missionReward')}: +${mission.reward} QC`, 'success');
    }
  }, [missions, playSfx, addLog, t, generateMissions, activeTab, updateHistoryStats, isInterstellar]);

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
  const [shipPageIndex, setShipPageIndex] = useState(0);
  const [coffeePhraseIndex, setCoffeePhraseIndex] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [speedRunTime, setSpeedRunTime] = useState(0);
  const [isSpeedRunFinished, setIsSpeedRunFinished] = useState(false);
  const [showSpeedRunWinModal, setShowSpeedRunWinModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRoute2Confirm, setShowRoute2Confirm] = useState(false);

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
  const [miningPageIndex, setMiningPageIndex] = useState(0);
  const [resolution, setResolution] = useState('Native');
  const [displayMode, setDisplayMode] = useState<'Fullscreen' | 'Windowed'>('Windowed');

  const [showExportModal, setShowExportModal] = useState(false);
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

  const isSpeedMode = activeCodes['SPEED'] && isSpeedRun;

  const exportGameData = useCallback(() => {
    const saveData: any = {
      // Basic Info
      qc,
      aetherion,
      miningWaste,
      solarEnergy,
      aetherionTubes,
      unlockedRouteIds,
      ownedShips,
      techLevels,
      autoTravelSlots,
      miningRobots,
      miningRobotLevels,
      oresCollected,
      autoSellByOre,
      autoSellUnlockedByOre,
      miningCompressionLevels,
      unlockedTechLevels,
      seenTutorials,
      routeTier,
      totalDeliveries,
      deliveriesByLocation,
      historyStats,
      missions,
      missionMythicBonus,
      missionAlienBonus,
      missionLegendaryBonus,
      missionRewardLevel,
      autoClaimMissions,
      radarUnlocked,
      completedInitialMissions,
      shipXP,
      shipLevel,
      isRetributionActive,
      isFatigueActive,
      battleLevel,
      radarLevel,
      privatePoliceLevel,
      autoSkipRandomBattles,
      warCoreLevel,
      fleetPower,
      extractionTechLevel,
      solarMappingLevel,
      doubleRouteLevel,
      doomPLevel,
      captureLevel,
      earthReconstructionProgress,
      isVoidWarActive,
      voidWarProgress,
      voidResources,
      voidCompactedResources,
      voidAircraftMissions,
      voidAircraftUpgrades,
      voidAircraftAutoToggles,
      gameTimeSeconds,
      // Status
      activeCodes,
      unlockedCodes,
      unlockedAchievements,
      achievementProgress,
      localRecords,
      hasSeenRoute2UnlockMessage,
      arcadeScores, // Arcade scores included
      // Route 4 Specifics
      route4Unlocked,
      earthPopulation,
      earthMaleRatio,
      earthBiodiversity,
      earthHealth,
      earthHappiness,
      earthSecurity,
      earthQualityOfLife,
      earthEvents,
      earthCouples,
      earthBirthRegistry,
      colonies // All colony progress
    };

    const modularSave = SaveManager.createSave(saveData);
    const jsonString = JSON.stringify(modularSave, null, 2);
    
    // Improved obfuscation/encryption as requested (XOR cipher)
    const SECRET_KEY = 73; // Unique key for this app
    const xored = jsonString.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ (SECRET_KEY + (i % 17)))
    ).join('');
    const encryptedData = btoa(unescape(encodeURIComponent(xored)));
    
    const blob = new Blob([encryptedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetravel_save_${new Date().toISOString().split('T')[0]}.dat`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog(t('exportSuccess' as any), 'success');
  }, [qc, aetherion, miningWaste, solarEnergy, aetherionTubes, unlockedRouteIds, ownedShips, techLevels, autoTravelSlots, miningRobots, miningRobotLevels, oresCollected, autoSellByOre, autoSellUnlockedByOre, unlockedTechLevels, seenTutorials, routeTier, totalDeliveries, deliveriesByLocation, historyStats, activeCodes, unlockedCodes, localRecords, missions, missionMythicBonus, missionAlienBonus, missionLegendaryBonus, autoClaimMissions, radarUnlocked, missionRewardLevel, miningCompressionLevels, completedInitialMissions, shipXP, shipLevel, addLog, t, isFatigueActive, isRetributionActive, battleLevel, radarLevel, privatePoliceLevel, autoSkipRandomBattles, warCoreLevel, fleetPower, extractionTechLevel, solarMappingLevel, doubleRouteLevel, doomPLevel, captureLevel, earthReconstructionProgress, voidResources, voidCompactedResources, voidAircraftMissions, voidAircraftUpgrades, voidBattleShipStats, voidPOIsInspiration, voidPOIQCDonations, voidDonationModes, unlockedExtractionPoints, extractionPacks, extractionRobotLevels, extractionProductionLevels, extractionAutoSell, extractionAutoSellUnlocked, extractionCompressionLevels, totalExtractionProfit, skillLendariaLevel, skillMiticaLevel, skillAlienLevel, skillTempoDinheiroLevel, skillRobosOlimpicosLevel, unlockedAchievements, achievementProgress, hasSeenRoute2UnlockMessage, isVoidWarActive, voidWarProgress, gameTimeSeconds, earthPopulation, earthMaleRatio, earthBiodiversity, earthEvents, voidAircraftAutoToggles, arcadeScores, route4Unlocked, earthHealth, earthHappiness, earthSecurity, earthQualityOfLife, earthCouples, earthBirthRegistry, colonies]);

  const importGameData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const encryptedData = e.target?.result as string;
        
        let jsonString = '';
        try {
          // Decrypt XOR encryption
          const SECRET_KEY = 73;
          const xored = decodeURIComponent(escape(atob(encryptedData)));
          jsonString = xored.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ (SECRET_KEY + (i % 17)))
          ).join('');
        } catch (xorErr) {
          // Fallback legacy decryption (plain base64)
          jsonString = decodeURIComponent(escape(atob(encryptedData)));
        }

        const parsedData = JSON.parse(jsonString);
        const data = SaveManager.loadSave(parsedData);
        
        // Merge data
        if (data.route4Unlocked !== undefined) setRoute4Unlocked(data.route4Unlocked);
        if (data.qc !== undefined) setQc(data.qc);
        if (data.aetherion !== undefined) setAetherion(data.aetherion);
        if (data.miningWaste !== undefined) setMiningWaste(data.miningWaste);
        if (data.solarEnergy !== undefined) setSolarEnergy(data.solarEnergy);
        if (data.aetherionTubes !== undefined) setAetherionTubes(data.aetherionTubes);
        if (data.unlockedRouteIds) setUnlockedRouteIds(data.unlockedRouteIds);
        if (data.ownedShips) setOwnedShips(data.ownedShips);
        if (data.techLevels) setTechLevels(data.techLevels);
        if (data.autoTravelSlots) setAutoTravelSlots(data.autoTravelSlots);
        if (data.miningRobots) setMiningRobots(data.miningRobots);
        if (data.miningRobotLevels) setMiningRobotLevels(data.miningRobotLevels);
        if (data.oresCollected) setOresCollected(data.oresCollected);
        if (data.autoSellByOre) setAutoSellByOre(data.autoSellByOre);
        if (data.autoSellUnlockedByOre) setAutoSellUnlockedByOre(data.autoSellUnlockedByOre);
        if (data.miningCompressionLevels) setMiningCompressionLevels(data.miningCompressionLevels);
        if (data.unlockedTechLevels) setUnlockedTechLevels(data.unlockedTechLevels);
        if (data.seenTutorials) setSeenTutorials(data.seenTutorials);
        if (data.routeTier) {
          setRouteTier(data.routeTier);
          if (data.routeTier === 'Void') setActiveTab('void_aircraft');
          else if (data.routeTier === 'Earth') setActiveTab('colonies');
          else if (data.routeTier === 'Interstellar') setActiveTab('routes2');
          else setActiveTab('routes');
        }
        if (data.totalDeliveries) setTotalDeliveries(data.totalDeliveries);
        if (data.deliveriesByLocation) setDeliveriesByLocation(data.deliveriesByLocation);
        if (data.historyStats) setHistoryStats(data.historyStats);
        
        if (data.activeCodes && setActiveCodes) setActiveCodes(data.activeCodes);
        if (data.unlockedCodes && setUnlockedCodes) setUnlockedCodes(data.unlockedCodes);
        if (data.shipXP !== undefined) setShipXP(data.shipXP);
        if (data.shipLevel !== undefined) setShipLevel(data.shipLevel);
        if (data.isRetributionActive !== undefined) setIsRetributionActive(data.isRetributionActive);
        if (data.isFatigueActive !== undefined) setIsFatigueActive(data.isFatigueActive);
        if (data.battleLevel !== undefined) setBattleLevel(data.battleLevel);
        if (data.radarLevel !== undefined) setRadarLevel(data.radarLevel);
        if (data.privatePoliceLevel !== undefined) setPrivatePoliceLevel(data.privatePoliceLevel);
        if (data.autoSkipRandomBattles !== undefined) setAutoSkipRandomBattles(data.autoSkipRandomBattles);
        if (data.gameTimeSeconds !== undefined) setGameTimeSeconds(data.gameTimeSeconds);
        if (data.warCoreLevel !== undefined) setWarCoreLevel(data.warCoreLevel);
        if (data.fleetPower !== undefined) setFleetPower(data.fleetPower);
        if (data.extractionTechLevel !== undefined) setExtractionTechLevel(data.extractionTechLevel);
        if (data.solarMappingLevel !== undefined) setSolarMappingLevel(data.solarMappingLevel);
        if (data.doubleRouteLevel !== undefined) setDoubleRouteLevel(data.doubleRouteLevel);
        if (data.doomPLevel !== undefined) setDoomPLevel(data.doomPLevel);
        if (data.captureLevel !== undefined) setCaptureLevel(data.captureLevel);
        if (data.earthReconstructionProgress) setEarthReconstructionProgress(data.earthReconstructionProgress);
        if (data.isVoidWarActive !== undefined) setIsVoidWarActive(data.isVoidWarActive);
        if (data.voidWarProgress) setVoidWarProgress(data.voidWarProgress);
        if (data.voidResources) setVoidResources(data.voidResources);
        if (data.voidCompactedResources) setVoidCompactedResources(data.voidCompactedResources);
        if (data.voidAircraftMissions) setVoidAircraftMissions(data.voidAircraftMissions);
        if (data.voidAircraftUpgrades) setVoidAircraftUpgrades(data.voidAircraftUpgrades);
        if (data.voidAircraftAutoToggles) setVoidAircraftAutoToggles(data.voidAircraftAutoToggles);
        if (data.earthPopulation) setEarthPopulation(data.earthPopulation);
        if (data.earthMaleRatio) setEarthMaleRatio(data.earthMaleRatio);
        if (data.earthBiodiversity) setEarthBiodiversity(data.earthBiodiversity);
        if (data.earthHealth) setEarthHealth(data.earthHealth);
        if (data.earthHappiness) setEarthHappiness(data.earthHappiness);
        if (data.earthSecurity) setEarthSecurity(data.earthSecurity);
        if (data.earthQualityOfLife) setEarthQualityOfLife(data.earthQualityOfLife);
        if (data.earthEvents) setEarthEvents(data.earthEvents);
        if (data.earthCouples) setEarthCouples(data.earthCouples);
        if (data.earthBirthRegistry) setEarthBirthRegistry(data.earthBirthRegistry);
        if (data.colonies) setColonies(data.colonies);
        if (data.voidBattleShipStats) setVoidBattleShipStats(data.voidBattleShipStats);
        if (data.voidPOIsInspiration) setVoidPOIsInspiration(data.voidPOIsInspiration);
        if (data.voidPOIQCDonations) setVoidPOIQCDonations(data.voidPOIQCDonations);
        if (data.voidDonationModes) setVoidDonationModes(data.voidDonationModes);
        if (data.unlockedExtractionPoints) setUnlockedExtractionPoints(data.unlockedExtractionPoints);
        if (data.extractionPacks) setExtractionPacks(data.extractionPacks);
        if (data.extractionRobotLevels) setExtractionRobotLevels(data.extractionRobotLevels);
        if (data.extractionProductionLevels) setExtractionProductionLevels(data.extractionProductionLevels);
        if (data.extractionAutoSell) setExtractionAutoSell(data.extractionAutoSell);
        if (data.extractionAutoSellUnlocked) setExtractionAutoSellUnlocked(data.extractionAutoSellUnlocked);
        if (data.extractionCompressionLevels) setExtractionCompressionLevels(data.extractionCompressionLevels);
        if (data.totalExtractionProfit !== undefined) setTotalExtractionProfit(data.totalExtractionProfit);
        if (data.skillLendariaLevel) setSkillLendariaLevel(data.skillLendariaLevel);
        if (data.skillMiticaLevel) setSkillMiticaLevel(data.skillMiticaLevel);
        if (data.skillAlienLevel) setSkillAlienLevel(data.skillAlienLevel);
        if (data.skillTempoDinheiroLevel) setSkillTempoDinheiroLevel(data.skillTempoDinheiroLevel);
        if (data.skillRobosOlimpicosLevel) setSkillRobosOlimpicosLevel(data.skillRobosOlimpicosLevel);
        if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
        if (data.achievementProgress) setAchievementProgress(data.achievementProgress);
        if (data.hasSeenRoute2UnlockMessage !== undefined) setHasSeenRoute2UnlockMessage(data.hasSeenRoute2UnlockMessage);
        
        // Restore Arcade Scores
        if (data.arcadeScores) {
          setArcadeScores(data.arcadeScores);
          Object.entries(data.arcadeScores).forEach(([gameId, score]) => {
             const key = `${gameId.replace(/-/g, '_')}_high_score`;
             localStorage.setItem(key, String(score));
          });
        }
        
        if (data.speedRunRecords && setLocalRecords) setLocalRecords(data.speedRunRecords);

        addLog(t('importSuccess'), 'success');
      } catch (err) {
        console.error('Import error:', err);
        addLog(t('error' as any), 'error');
      }
    };
    reader.readAsText(file);
  }, [setQc, setAetherion, setMiningWaste, setSolarEnergy, setAetherionTubes, setUnlockedRouteIds, setOwnedShips, setTechLevels, setAutoTravelSlots, setMiningRobots, setMiningRobotLevels, setOresCollected, setAutoSellByOre, setAutoSellUnlockedByOre, setMiningCompressionLevels, setUnlockedTechLevels, setSeenTutorials, setRouteTier, setTotalDeliveries, setDeliveriesByLocation, setHistoryStats, setActiveCodes, setUnlockedCodes, setShipXP, setShipLevel, setLocalRecords, addLog, t, setIsRetributionActive, setIsFatigueActive, setBattleLevel, setRadarLevel, setPrivatePoliceLevel, setAutoSkipRandomBattles, setWarCoreLevel, setFleetPower, setExtractionTechLevel, setSolarMappingLevel, setDoubleRouteLevel, setDoomPLevel, setCaptureLevel, setEarthReconstructionProgress, setVoidResources, setVoidCompactedResources, setVoidAircraftMissions, setVoidAircraftUpgrades, setVoidBattleShipStats, setVoidPOIsInspiration, setVoidPOIQCDonations, setUnlockedExtractionPoints, setExtractionPacks, setExtractionRobotLevels, setExtractionProductionLevels, setExtractionAutoSell, setExtractionAutoSellUnlocked, setExtractionCompressionLevels, setTotalExtractionProfit, setSkillLendariaLevel, setSkillMiticaLevel, setSkillAlienLevel, setSkillTempoDinheiroLevel, setSkillRobosOlimpicosLevel, setUnlockedAchievements, setAchievementProgress, setHasSeenRoute2UnlockMessage, setRoute4Unlocked, setEarthPopulation, setEarthMaleRatio, setEarthBiodiversity, setEarthHealth, setEarthHappiness, setEarthSecurity, setEarthQualityOfLife, setEarthEvents, setEarthCouples, setEarthBirthRegistry, setColonies, setGameTimeSeconds, setVoidAircraftAutoToggles, setArcadeScores]);
  const incrementDeliveries = useCallback((source: 'manual' | 'auto', count: number = 1) => {
    const tier = routeTier;
    setHistoryStats(prev => {
      const current = prev[tier];
      const next = { ...current };
      next.deliveries += count;
      if (source === 'manual') next.manualDeliveries += count;
      if (source === 'auto') next.autoDeliveries += count;
      return { ...prev, [tier]: next };
    });

    // RHSE Solar Energy
    const mappingBonus = 1 + (solarMappingLevel * 0.1);
    const energyToAdd = count * 50 * (routeTier === 'Interstellar' ? mappingBonus : 1);
    setSolarEnergy(prev => Math.min(7500, prev + energyToAdd));
  }, [routeTier, solarMappingLevel]);

  useEffect(() => { activeDeliveriesRef.current = activeDeliveries; }, [activeDeliveries]);
  useEffect(() => { techLevelsRef.current = techLevels; }, [techLevels]);
  useEffect(() => { qcRef.current = qc; }, [qc]);
  useEffect(() => { autoTravelActiveRef.current = autoTravelActive; }, [autoTravelActive]);
  useEffect(() => { autoTravelProgressRef.current = autoTravelProgress; }, [autoTravelProgress]);
  useEffect(() => { autoTravelSlotsRef.current = autoTravelSlots; }, [autoTravelSlots]);
  useEffect(() => { totalDeliveriesRef.current = totalDeliveries; }, [totalDeliveries]);
  useEffect(() => { deliveriesByLocationRef.current = deliveriesByLocation; }, [deliveriesByLocation]);
  useEffect(() => { ownedShipsRef.current = ownedShips; }, [ownedShips]);
  useEffect(() => { unlockedRouteIdsRef.current = unlockedRouteIds; }, [unlockedRouteIds]);
  useEffect(() => { miningRobotsRef.current = miningRobots; }, [miningRobots]);
  useEffect(() => { miningRobotLevelsRef.current = miningRobotLevels; }, [miningRobotLevels]);
  useEffect(() => { oresCollectedRef.current = oresCollected; }, [oresCollected]);
  useEffect(() => { autoSellByOreRef.current = autoSellByOre; }, [autoSellByOre]);
  useEffect(() => { autoSellUnlockedByOreRef.current = autoSellUnlockedByOre; }, [autoSellUnlockedByOre]);
  useEffect(() => { miningCompressionLevelsRef.current = miningCompressionLevels; }, [miningCompressionLevels]);
  useEffect(() => { unlockedTechLevelsRef.current = unlockedTechLevels; }, [unlockedTechLevels]);
  useEffect(() => { researchingTechRef.current = researchingTech; }, [researchingTech]);
  useEffect(() => { routeTierRef.current = routeTier; }, [routeTier]);
  useEffect(() => { isSpeedRunRef.current = isSpeedRun; }, [isSpeedRun]);
  
  // RHSE Tube Generation Logic: 2500 Waste + 2500 Solar = 1 Tube
  useEffect(() => {
    if (miningWaste >= 2500 && solarEnergy >= 2500) {
      setMiningWaste(prev => prev - 2500);
      setSolarEnergy(prev => prev - 2500);
      setAetherionTubes(prev => Math.min(isInterstellar ? 20 : 10, prev + 1));
    }
  }, [miningWaste, solarEnergy, routeTier, isInterstellar]);

  const isRoute2Unlocked = useCallback(() => {
    if (isSpeedRun) return false;
    if (routeTier === 'Interstellar' || routeTier === 'Void') return true;

    const solarRoutes = ROUTES.filter(r => r.tier === 'Solar');
    const solarShips = SHIPS.filter(s => s.tier === 'Solar');
    const solarOres = ORES.filter(o => o.tier === 'Solar');

    // 1. Todas as tecnologias Solar (nível 9)
    if ((unlockedTechLevels.Solar || 0) < 9) return false;

    // 2. Todas as naves Solar compradas (5 de cada)
    const allShipsOwned = solarShips.every(s => (ownedShips[`Solar-${s.level}`] || 0) >= 5);
    if (!allShipsOwned) return false;

    // 3. Todas as melhorias Solar no máximo
    const allUpgradesMaxed = solarRoutes.every(r => {
      const levels = techLevels[r.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
      return levels.engine >= 5 && levels.ai >= 6 && levels.value >= 5 && levels.rare >= 5;
    });
    if (!allUpgradesMaxed) return false;

    // 4. Todos robôs de mineração (5 por minério) e melhorias (nível 5)
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

    // 6. Fortuna acumulada de 1 Trilhão de QC (Total Acquired)
    const currentQC = historyStats['Solar']?.qcTotalAcquired || 0;
    if (currentQC < 1000000000000) return false;

    // 7. Compressão Refinada do primeiro minério ao máximo (10)
    const firstOre = solarOres[0];
    if ((miningCompressionLevels[firstOre.id] || 0) < 10) return false;

    // 8. Total de entregas (3000)
    if (totalDeliveries < 3000) return false;

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

    // 1. Todas as tecnologias Interstellar (nível 9)
    if ((unlockedTechLevels.Interstellar || 0) < 9) return false;

    // 2. Todas as naves Interstellar compradas (5 de cada)
    const allShipsOwned = interstellarShips.every(s => (ownedShips[`Interstellar-${s.level}`] || 0) >= 5);
    if (!allShipsOwned) return false;

    // 3. Todas as melhorias Interstellar no máximo
    const allUpgradesMaxed = interstellarRoutes.every(r => {
      const levels = techLevels[r.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
      return levels.engine >= 5 && levels.ai >= 6 && levels.value >= 5 && levels.rare >= 5;
    });
    if (!allUpgradesMaxed) return false;

    // 4. Todos robôs de mineração (5 por minério) e melhorias (nível 5)
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

    // 6. Fortuna acumulada de 999 Trilhões de QC (Total Acquired)
    const currentQC = historyStats['Interstellar']?.qcTotalAcquired || 0;
    if (currentQC < 999000000000000) return false;

    // 7. Compressão Refinada do primeiro minério ao máximo (10)
    const firstOre = interstellarOres[0];
    if (firstOre && (miningCompressionLevels[firstOre.id] || 0) < 10) return false;

    // 8. Total de entregas (9999)
    if (totalDeliveries < 9999) return false;

    return true;
  }, [isSpeedRun, routeTier, unlockedTechLevels, ownedShips, techLevels, miningRobots, miningRobotLevels, autoTravelSlots, autoTravelActive, historyStats, miningCompressionLevels, totalDeliveries]);

  const checkMilestoneAchievements = useCallback(() => {
    // QC Millionaire
    const totalQC = (historyStats['Solar']?.qcTotalAcquired || 0) + (historyStats['Interstellar']?.qcTotalAcquired || 0) + (historyStats['Void']?.qcTotalAcquired || 0);
    if (totalQC >= 1000000) updateAchievementProgress('qc_millionaire', totalQC, true);
    if (totalQC >= 1000000000000) updateAchievementProgress('qc_trillionaire', totalQC, true);

    // Route Unlocks
    if (isRoute2Unlocked()) updateAchievementProgress('route_2_unlocked', 1, true);
    if (isRoute3Unlocked()) updateAchievementProgress('void_unlocked', 1, true);

    // Tech Master
    const totalTechs = Object.values(unlockedTechLevels).reduce((a, b) => a + b, 0);
    updateAchievementProgress('tech_master', totalTechs, true);

    // Ship Collector
    const totalShips = Object.values(ownedShips).reduce((a, b) => a + b, 0);
    updateAchievementProgress('ship_collector', totalShips, true);

    // Max Upgrade
    const hasMaxUpgrade = Object.values(techLevels).some(loc => Object.values(loc).some(lvl => lvl >= 5));
    if (hasMaxUpgrade) updateAchievementProgress('max_upgrade', 5, true);

    // Earth Restorer
    const earthProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + b, 0) / 5;
    if (earthProgress >= 50) updateAchievementProgress('earth_restorer', earthProgress, true);
    if (earthProgress >= 100) updateAchievementProgress('earth_restorer_100', earthProgress, true);

    // Total Deliveries
    const totalDels = (historyStats['Solar']?.deliveries || 0) + (historyStats['Interstellar']?.deliveries || 0) + (historyStats['Void']?.deliveries || 0);
    if (totalDels >= 10000) updateAchievementProgress('total_deliveries_10k', totalDels, true);

    // All Ships R1 & R2
    const shipsR1R2 = Object.keys(ownedShips).filter(key => key.startsWith('Solar-') || key.startsWith('Interstellar-')).length;
    if (shipsR1R2 >= 18) updateAchievementProgress('all_ships_r1_r2', shipsR1R2, true);

    // Total Missions
    const totalMissions = (historyStats['Solar']?.missionsCompleted || 0) + (historyStats['Interstellar']?.missionsCompleted || 0) + (historyStats['Void']?.missionsCompleted || 0);
    if (totalMissions >= 1000) updateAchievementProgress('total_missions_1k', totalMissions, true);

    // Battle Level
    if (battleLevel >= 55) updateAchievementProgress('battle_level_55', battleLevel, true);
  }, [historyStats, isRoute2Unlocked, isRoute3Unlocked, unlockedTechLevels, ownedShips, techLevels, earthReconstructionProgress, battleLevel, updateAchievementProgress]);

  useEffect(() => {
    checkMilestoneAchievements();
  }, [checkMilestoneAchievements]);

  const startVoidTransition = () => {
    if (isSpeedRun) return; 
    
    // Reset progress for Route 3
    setQc(0);
    setAetherion(0);
    setMiningWaste(0);
    setSolarEnergy(0);
    setAetherionTubes(0);
    setOresCollected({});
    setMiningRobots({});
    setMiningRobotLevels({});
    setAutoSellByOre({});
    setTechLevels({ 'void-1': { engine: 0, ai: 0, value: 0, rare: 0 } });
    setUnlockedRouteIds(['void-1']);
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
    setOwnedShips({ 'Void-1': 1 }); // Give the first Void ship
    setUnlockedTechLevels(prev => ({ ...prev, Void: 1 }));
    setUnlockedExtractionPoints([]);
    setExtractionPacks({});
    setExtractionRobotLevels({});
    setExtractionProductionLevels({});
    setExtractionAutoSell({});
    setExtractionCompressionLevels({});
    setExtractionAutoSellUnlocked({});
    setTotalExtractionProfit(0);
    setMiningCompressionLevels({});
    setAutoSellUnlockedByOre({});
    setAutoTravelSlots({});
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
      setTechLevels({ 'alpha-centauri': { engine: 0, ai: 0, value: 0, rare: 0 } });
      setUnlockedRouteIds(['alpha-centauri']);
      setMiningRobots({});
      setMiningRobotLevels({});
      setOresCollected({});
      setAutoSellByOre({});
      setUnlockedTechLevels(prev => ({ ...prev, Interstellar: 1 }));
      setAutoTravelSlots({});
      setAutoTravelActive({});
      setAutoTravelProgress({});
      setActiveDeliveries([]);
      // setTotalDeliveries(0); // Removed to keep history
      setDeliveriesByLocation({});
      setMissions([]); // Clear missions for Route 2
      setSeenTutorials({}); // Reset tutorials for Route 2 so they can be seen again
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
      setOwnedShips({ 'Interstellar-1': 1 });
      setActiveTab('routes2');
      setIsTransitioning(false);
      setHasSeenRoute2UnlockMessage(true);
      setShowRoute2Confirm(false);
      addLog('🌌 PROTOCOLO INTERESTELAR INICIADO. BEM-VINDO À NOVA ERA.', 'success');
    }, 5000);
  };

  const boostResearch = () => {
    if (!researchingTech || isSpeedRun) return;
    
    const tech = TECHNOLOGIES.find(t => t.tier === researchingTech.tier && t.level === researchingTech.level);
    if (!tech) return;

    const multipliers = getEconomicMultipliers();
    let boostCost = 0;

    if (researchingTech.tier === 'Solar' || researchingTech.tier === 'Interstellar') {
      // Valor fixo de 75% do valor de pesquisa da tecnologia
      boostCost = Math.floor(tech.cost * multipliers.cost * 0.75);
    } else {
      // Original logic for Void/Earth
      let researchTime = activeCodes['SLIKE'] && !isSpeedRun ? 3600000 : tech.researchTime;
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

    setQc(prev => prev - boostCost);
    updateHistoryStats('spent', boostCost);
    setUnlockedTechLevels(prev => ({ ...prev, [researchingTech.tier]: researchingTech.level }));
    
    if (isSpeedRun) {
      setOwnedShips(prev => ({
        ...prev,
        [`${tech.tier}-${tech.unlocksShipLevel}`]: (prev[`${tech.tier}-${tech.unlocksShipLevel}`] || 0) + 1
      }));
    }
    
    setResearchingTech(null);
    playSfx('success');
    addLog(language === 'pt' ? `Pesquisa concluída com boost! (-${formatValue(boostCost)} QC)` : `Research completed with boost! (-${formatValue(boostCost)} QC)`, 'success');
  };

  // Effect to show Route 2 unlock message
  useEffect(() => {
    if (isTransitioning || showRoute2Lore || showVoidLore) return;
    if (isRoute2Unlocked() && !hasSeenRoute2UnlockMessage) {
      addLog(t('route2UnlockedMessage'), 'success');
      setHasSeenRoute2UnlockMessage(true);
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
        routeTier: routeTierRef.current,
        totalDeliveries: totalDeliveriesRef.current,
        deliveriesByLocation: deliveriesByLocationRef.current,
        historyStats,
        activeCodes,
        missions,
        missionMythicBonus,
        missionAlienBonus,
        missionLegendaryBonus,
        missionRewardLevel,
        skillLendariaLevel,
        skillMiticaLevel,
        skillAlienLevel,
        skillTempoDinheiroLevel,
        skillRobosOlimpicosLevel,
        autoClaimMissions,
        radarUnlocked,
        completedInitialMissions,
        miningCompressionLevels,
        shipXP: shipXPRef.current,
        shipLevel: shipLevelRef.current,
        extractionTechLevel: extractionTechLevelRef.current,
        solarMappingLevel: solarMappingLevelRef.current,
        doubleRouteLevel: doubleRouteLevelRef.current,
        doomPLevel: doomPLevelRef.current,
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
        lastScanTime,
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
        earthEvents: earthEventsRef.current
      };
      const saveToStorage = async () => {
        const modularSave = SaveManager.createSave(saveData);
        await GameStorage.save(modularSave, 'time_travel_save');
      };
      saveToStorage();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [isSpeedRun, isLoaded, playerName, seenTutorials, historyStats, activeCodes, missions, missionMythicBonus, missionAlienBonus, missionLegendaryBonus, autoClaimMissions, radarUnlocked, completedInitialMissions, miningCompressionLevels, missionRewardLevel, skillLendariaLevel, skillMiticaLevel, skillAlienLevel, skillTempoDinheiroLevel, skillRobosOlimpicosLevel, radarLevel, lastScanTime, extractionTechLevel, solarMappingLevel, captureLevel, unlockedAchievements, achievementProgress]);

  // Load save logic
  useEffect(() => {
    if (isLoaded) return;
    
    if (isSpeedRun) {
      setIsLoaded(true);
      return;
    }
    
    const loadFromStorage = async () => {
      const saved = await GameStorage.load('time_travel_save');
      if (saved) {
        try {
          const data = SaveManager.loadSave(saved);
          setQc(data.qc);
          if (data.aetherion !== undefined) setAetherion(data.aetherion);
          if (data.miningWaste !== undefined) setMiningWaste(data.miningWaste);
          if (data.solarEnergy !== undefined) setSolarEnergy(data.solarEnergy);
          if (data.aetherionTubes !== undefined) setAetherionTubes(data.aetherionTubes);
          if (data.unlockedRouteIds) setUnlockedRouteIds(data.unlockedRouteIds);
        if (data.ownedShips) {
          const migrated: { [key: string]: number } = {};
          Object.entries(data.ownedShips).forEach(([key, val]) => {
            if (!key.includes('-')) {
              migrated[`Solar-${key}`] = val as number;
            } else {
              migrated[key] = val as number;
            }
          });
          setOwnedShips(migrated);
        }
        if (data.techLevels) setTechLevels(data.techLevels);
        if (data.autoTravelSlots) setAutoTravelSlots(data.autoTravelSlots);
        if (data.autoTravelActive) setAutoTravelActive(data.autoTravelActive);
        if (data.autoTravelDesired) setAutoTravelDesired(data.autoTravelDesired);
        if (data.miningRobots) setMiningRobots(data.miningRobots);
        if (data.miningRobotLevels) setMiningRobotLevels(data.miningRobotLevels);
        if (data.oresCollected) setOresCollected(data.oresCollected);
        if (data.autoSellByOre) setAutoSellByOre(data.autoSellByOre);
        if (data.unlockedTechLevels) setUnlockedTechLevels(data.unlockedTechLevels);
        if (data.seenTutorials) setSeenTutorials(data.seenTutorials);
        if (data.routeTier) {
          setRouteTier(data.routeTier);
          
          // Set sensible default tab for the tier
          if (data.routeTier === 'Void') setActiveTab('void_aircraft');
          else if (data.routeTier === 'Earth') setActiveTab('colonies');
          else if (data.routeTier === 'Interstellar') setActiveTab('routes2');
          else setActiveTab('routes');

          if (data.routeTier === 'Earth') {
            setIsVoidWarActive(false);
            setVoidWarAlertActive(false);
            setVoidWarRobotSpeaking(false);
            setIsShaking(false);
            setIsFlashingRed(false);
          }
        }
        if (data.totalDeliveries !== undefined) setTotalDeliveries(data.totalDeliveries);
        if (data.deliveriesByLocation) setDeliveriesByLocation(data.deliveriesByLocation);
        if (data.historyStats) setHistoryStats(data.historyStats);
        if (data.missions) setMissions(data.missions);
        if (data.missionMythicBonus !== undefined) setMissionMythicBonus(data.missionMythicBonus);
        if (data.missionAlienBonus !== undefined) setMissionAlienBonus(data.missionAlienBonus);
        if (data.missionLegendaryBonus !== undefined) setMissionLegendaryBonus(data.missionLegendaryBonus);
        
        if (data.missionRewardLevel !== undefined) {
          if (typeof data.missionRewardLevel === 'number') {
            setMissionRewardLevel({ Solar: data.missionRewardLevel, Interstellar: 1 });
          } else {
            setMissionRewardLevel(data.missionRewardLevel);
          }
        }
        if (data.skillLendariaLevel !== undefined) {
          if (typeof data.skillLendariaLevel === 'number') {
            setSkillLendariaLevel({ Solar: data.skillLendariaLevel, Interstellar: 0 });
          } else {
            setSkillLendariaLevel(data.skillLendariaLevel);
          }
        }
        if (data.skillMiticaLevel !== undefined) {
          if (typeof data.skillMiticaLevel === 'number') {
            setSkillMiticaLevel({ Solar: data.skillMiticaLevel, Interstellar: 0 });
          } else {
            setSkillMiticaLevel(data.skillMiticaLevel);
          }
        }
        if (data.skillAlienLevel !== undefined) {
          if (typeof data.skillAlienLevel === 'number') {
            setSkillAlienLevel({ Solar: data.skillAlienLevel, Interstellar: 0 });
          } else {
            setSkillAlienLevel(data.skillAlienLevel);
          }
        }
        if (data.skillTempoDinheiroLevel !== undefined) {
          if (typeof data.skillTempoDinheiroLevel === 'number') {
            setSkillTempoDinheiroLevel({ Solar: data.skillTempoDinheiroLevel, Interstellar: 0 });
          } else {
            setSkillTempoDinheiroLevel(data.skillTempoDinheiroLevel);
          }
        }
        if (data.skillRobosOlimpicosLevel !== undefined) {
          if (typeof data.skillRobosOlimpicosLevel === 'number') {
            setSkillRobosOlimpicosLevel({ Solar: data.skillRobosOlimpicosLevel, Interstellar: 0 });
          } else {
            setSkillRobosOlimpicosLevel(data.skillRobosOlimpicosLevel);
          }
        }
        if (data.autoClaimMissions !== undefined) setAutoClaimMissions(data.autoClaimMissions);
        if (data.radarUnlocked !== undefined) {
          if (typeof data.radarUnlocked === 'boolean') {
            setRadarUnlocked({ Solar: data.radarUnlocked, Interstellar: false });
          } else {
            setRadarUnlocked(data.radarUnlocked);
          }
        }
        if (data.warCoreLevel !== undefined) setWarCoreLevel(data.warCoreLevel);
        if (data.fleetPower !== undefined) setFleetPower(data.fleetPower);
        if (data.earthReconstructionProgress !== undefined) {
          setEarthReconstructionProgress(prev => ({
            ...prev,
            ...data.earthReconstructionProgress
          }));
        }
        if (data.isVoidWarActive !== undefined) setIsVoidWarActive(data.isVoidWarActive);
        if (data.voidWarProgress) setVoidWarProgress(data.voidWarProgress);
        if (data.voidResources !== undefined) setVoidResources(data.voidResources);
        if (data.voidCompactedResources !== undefined) setVoidCompactedResources(data.voidCompactedResources);
        if (data.voidDonationModes !== undefined) setVoidDonationModes(data.voidDonationModes);
        if (data.voidAircraftMissions !== undefined) setVoidAircraftMissions(data.voidAircraftMissions);
        if (data.voidAircraftUpgrades !== undefined) setVoidAircraftUpgrades(data.voidAircraftUpgrades);
        if (data.voidAircraftAutoToggles !== undefined) setVoidAircraftAutoToggles(data.voidAircraftAutoToggles);
        if (data.route4Unlocked !== undefined) setRoute4Unlocked(data.route4Unlocked);
        if (data.voidBattleShipStats !== undefined) {
          setVoidBattleShipStats(prev => ({
            ...prev,
            ...data.voidBattleShipStats,
            upgrades: {
              ...prev.upgrades,
              ...(data.voidBattleShipStats.upgrades || {})
            }
          }));
        }
        if (data.voidPOIsInspiration !== undefined) {
          // Migration: if data is old format (number), convert to new format
          const migrated: { [id: string]: { [res: string]: number } } = {};
          Object.entries(data.voidPOIsInspiration).forEach(([id, val]) => {
            if (typeof val === 'number') {
              // Distribute existing progress equally among resources, capped at 20 each
              const perRes = Math.min(20, val / 5);
              migrated[id] = {
                minerals: perRes,
                energy: perRes,
                food: perRes,
                tech: perRes,
                meds: perRes
              };
            } else {
              migrated[id] = val as { [res: string]: number };
            }
          });
          setVoidPOIsInspiration(migrated);
        }
        if (data.voidPOIQCDonations !== undefined) setVoidPOIQCDonations(data.voidPOIQCDonations);
        if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
        if (data.achievementProgress) setAchievementProgress(data.achievementProgress);
        if (data.completedInitialMissions) setCompletedInitialMissions(data.completedInitialMissions);
        if (data.hasWonEliminateEnemiesRoute3 !== undefined) setHasWonEliminateEnemiesRoute3(data.hasWonEliminateEnemiesRoute3);
        if (data.robotRepairProgress !== undefined) setRobotRepairProgress(data.robotRepairProgress);
        if (data.isRobotRepaired !== undefined) setIsRobotRepaired(data.isRobotRepaired);
        if (data.battleShipUpgradeLevel !== undefined) setBattleShipUpgradeLevel(data.battleShipUpgradeLevel);
        if (data.miningCompressionLevels) setMiningCompressionLevels(data.miningCompressionLevels);
        if (data.shipXP !== undefined) setShipXP(data.shipXP);
        if (data.shipLevel !== undefined) setShipLevel(data.shipLevel);
        if (data.extractionTechLevel !== undefined) setExtractionTechLevel(data.extractionTechLevel);
        if (data.solarMappingLevel !== undefined) setSolarMappingLevel(data.solarMappingLevel);
        if (data.doubleRouteLevel !== undefined) setDoubleRouteLevel(data.doubleRouteLevel);
        if (data.doomPLevel !== undefined) setDoomPLevel(data.doomPLevel);
        if (data.captureLevel !== undefined) setCaptureLevel(data.captureLevel);
        if (data.battleLevel !== undefined) setBattleLevel(data.battleLevel);
        if (data.radarLevel !== undefined) setRadarLevel(data.radarLevel);
        if (data.privatePoliceLevel !== undefined) setPrivatePoliceLevel(data.privatePoliceLevel);
        if (data.autoSkipRandomBattles !== undefined) setAutoSkipRandomBattles(data.autoSkipRandomBattles);
        if (data.isRetributionActive !== undefined) setIsRetributionActive(data.isRetributionActive);
        if (data.isFatigueActive !== undefined) setIsFatigueActive(data.isFatigueActive);
        if (data.unlockedExtractionPoints) setUnlockedExtractionPoints(data.unlockedExtractionPoints);
        if (data.extractionPacks) setExtractionPacks(data.extractionPacks);
        if (data.extractionRobotLevels) setExtractionRobotLevels(data.extractionRobotLevels);
        if (data.extractionProductionLevels) setExtractionProductionLevels(data.extractionProductionLevels);
        if (data.extractionCompressionLevels) setExtractionCompressionLevels(data.extractionCompressionLevels);
        if (data.extractionAutoSell) setExtractionAutoSell(data.extractionAutoSell);
        if (data.extractionAutoSellUnlocked) setExtractionAutoSellUnlocked(data.extractionAutoSellUnlocked);
        if (data.totalExtractionProfit !== undefined) setTotalExtractionProfit(data.totalExtractionProfit);
        if (data.lastScanTime !== undefined) setLastScanTime(data.lastScanTime);
        if (data.hasSeenRoute2UnlockMessage !== undefined) setHasSeenRoute2UnlockMessage(data.hasSeenRoute2UnlockMessage);
        if (data.speedRunTime !== undefined) setSpeedRunTime(data.speedRunTime);
        if (data.isSpeedRunFinished !== undefined) setIsSpeedRunFinished(data.isSpeedRunFinished);
        if (data.resolution !== undefined) setResolution(data.resolution);
        if (data.displayMode !== undefined) setDisplayMode(data.displayMode);
        if (data.gameTimeSeconds !== undefined) {
          setGameTimeSeconds(data.gameTimeSeconds);
        } else if (data.earthYear !== undefined) {
          setGameTimeSeconds(data.earthYear * 480);
        }
        if (data.autoTravelDesired) setAutoTravelDesired(data.autoTravelDesired);
        if (data.autoTravelProgress) setAutoTravelProgress(data.autoTravelProgress);
        if (data.activeDeliveries) setActiveDeliveries(data.activeDeliveries);
        if (data.researchingTech) setResearchingTech(data.researchingTech);
        if (data.researchingExtractionPoint) setResearchingExtractionPoint(data.researchingExtractionPoint);
        if (data.activeCodes && setActiveCodes) setActiveCodes(data.activeCodes);
        if (data.colonies) setColonies(data.colonies);
      } catch (e) {
        console.error("Failed to load save", e);
      }
    } else {
      // New Game - Apply Codes
      if (activeCodes['MONEY']) {
        setQc(500000);
        addLog('Quantum Wealth code active: Starting with 500k QC!', 'success');
      }
    }
    setIsLoaded(true);
  };
  loadFromStorage();
}, [isSpeedRun, activeCodes, addLog, setActiveCodes, isLoaded, setQc, setUnlockedRouteIds, setOwnedShips, setOresCollected, setTechLevels, setAutoTravelSlots, setAutoTravelActive, setMiningRobots, setMiningRobotLevels, setAutoSellByOre, setHistoryStats, setMissions, setMissionMythicBonus, setMissionAlienBonus, setMissionLegendaryBonus, setAutoClaimMissions, setRadarUnlocked, setCompletedInitialMissions, setMiningCompressionLevels, setMissionRewardLevel, setSkillLendariaLevel, setSkillMiticaLevel, setSkillAlienLevel, setSkillTempoDinheiroLevel, setSkillRobosOlimpicosLevel, setLastScanTime, setAetherion, setMiningWaste, setSolarEnergy, setAetherionTubes]);

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
    playSfx('click');
    const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
    const valueUpgrade = UPGRADES.find(u => u.id === 'value')!;
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
        const r = ROUTES.find(rt => rt.id === routeId);
        if (r && r.requiredShipLevel === requiredLevel && r.tier === route.tier) {
          currentlyInUse += (autoTravelSlotsRef.current[routeId] || 0);
        }
      }
    });
    
    // Hangar check (Max 25 simultaneous manual deliveries)
    const activeManual = activeDeliveriesRef.current.filter(d => !d.id.startsWith('auto-')).length;
    if (activeManual >= 25) {
      addLog(t('manualDeliveryLimit'), 'warning');
      return false;
    }

    const status = currentlyInUse < totalOwned ? 'delivering' : 'queued';

    setQc(c => c - fuelCost);
    updateHistoryStats('spent', fuelCost);
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

  const buyShip = useCallback((level: number) => {
    const ship = SHIPS.find(s => s.level === level && s.tier === routeTier)!;
    const currentOwned = ownedShipsRef.current[`${routeTier}-${level}`] || 0;
    
    if (currentOwned >= 5) {
      addLog(`Maximum ships of level ${level} reached`, 'warning');
      return;
    }

    // Check technology requirement
    const unlockedTechLevel = unlockedTechLevelsRef.current[routeTier] || 0;
    if (unlockedTechLevel < level) {
      addLog(`Need to unlock Technology level ${level} first`, 'warning');
      return;
    }
    
    const multipliers = getEconomicMultipliers();
    // First ship of each level is free if tech is unlocked
    const isFirstShipOfLevel = currentOwned === 0;
    const actualCost = isFirstShipOfLevel ? 0 : (level === 1 ? 500 * multipliers.cost : ship.cost * multipliers.cost);

    if (qcRef.current < actualCost) {
      addLog(`Insufficient QC for Lvl ${level} ship`, 'error');
      return;
    }
    
    setQc(c => c - actualCost);
    if (actualCost > 0) updateHistoryStats('spent', actualCost);
    setOwnedShips(prev => ({
      ...prev,
      [`${routeTier}-${level}`]: (prev[`${routeTier}-${level}`] || 0) + 1
    }));
    if (level === 1) {
      completeInitialMission('init_2');
    }
    playSfx('buy');
    addLog(isFirstShipOfLevel ? `Free Lvl ${level} ship acquired!` : `New Lvl ${level} ship purchased!`, 'success');
  }, [playSfx, addLog, getEconomicMultipliers, routeTier, updateHistoryStats, completeInitialMission]);

  const buyTechnology = (tech: Technology) => {
    const currentLevel = unlockedTechLevels[routeTier] || 0;
    if (tech.level !== currentLevel + 1) {
      addLog('Must unlock technologies in order', 'warning');
      return;
    }

    if (researchingTech && !isSpeedRun) {
      addLog('Already researching a technology', 'warning');
      return;
    }

    const multipliers = getEconomicMultipliers();
    const cost = tech.cost * multipliers.cost;

    if (qc < cost) {
      addLog('Insufficient QC for research', 'error');
      return;
    }

    let researchTime = activeCodes['SLIKE'] && !isSpeedRun ? 3600000 : tech.researchTime;
    if (routeTier === 'Interstellar') researchTime *= 0.5;

    if (isSpeedRun || researchTime === 0) {
      // Instant unlock
      setQc(c => c - cost);
      updateHistoryStats('spent', cost);
      setUnlockedTechLevels(prev => ({ ...prev, [routeTier]: tech.level }));
      if (tech.id === 'solar-1') {
        completeInitialMission('init_1');
      }
      playSfx('success');
      addLog(isSpeedRun ? `${tech.name} unlocked instantly!` : `Technology ${tech.name} unlocked!`, 'success');
      // Give free ship of that level
      if (isSpeedRun) {
        setOwnedShips(prev => ({
          ...prev,
          [tech.unlocksShipLevel]: (prev[tech.unlocksShipLevel] || 0) + 1
        }));
      }
    } else {
      setQc(c => c - cost);
      updateHistoryStats('spent', cost);
      setResearchingTech({
        tier: routeTier,
        level: tech.level,
        startTime: Date.now()
      });
      if (tech.id === 'solar-1') {
        completeInitialMission('init_1');
      }
      playSfx('buy');
      addLog(`Researching ${tech.name}...`, 'info');
    }
  };

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
      qc,
      aetherion,
      miningWaste,
      solarEnergy,
      aetherionTubes,
      unlockedRouteIds,
      ownedShips,
      techLevels,
      autoTravelSlots,
      autoTravelActive: Object.keys(autoTravelActive).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      autoTravelDesired: Object.keys(autoTravelDesired).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      autoTravelProgress,
      activeDeliveries,
      playerName,
      miningRobots,
      miningRobotLevels,
      oresCollected,
      autoSellByOre: Object.keys(autoSellByOre).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      autoSellUnlockedByOre,
      miningCompressionLevels,
      unlockedTechLevels,
      researchingTech,
      seenTutorials,
      routeTier,
      totalDeliveries,
      deliveriesByLocation,
      historyStats,
      activeCodes,
      missions,
      missionMythicBonus,
      missionAlienBonus,
      missionLegendaryBonus,
      autoClaimMissions: false,
      completedInitialMissions,
      shipXP: shipXPRef.current,
      shipLevel: shipLevelRef.current,
      battleLevel: battleLevelRef.current,
      extractionTechLevel,
      solarMappingLevel,
      doubleRouteLevel,
      doomPLevel,
      captureLevel,
      radarLevel,
      privatePoliceLevel,
      autoSkipRandomBattles: false,
      unlockedExtractionPoints,
      extractionPacks,
      extractionRobotLevels,
      extractionProductionLevels,
      extractionCompressionLevels,
      extractionAutoSell,
      extractionAutoSellUnlocked,
      route4Unlocked,
      totalExtractionProfit,
      aetherion,
      miningWaste,
      solarEnergy,
      aetherionTubes,
      lastScanTime,
      hasSeenRoute2UnlockMessage,
      speedRunTime,
      isSpeedRunFinished,
      resolution,
      displayMode,
      missionRewardLevel,
      skillLendariaLevel,
      skillMiticaLevel,
      skillAlienLevel,
      skillTempoDinheiroLevel,
      skillRobosOlimpicosLevel,
      radarUnlocked,
      warCoreLevel,
      fleetPower,
      earthReconstructionProgress,
      voidResources,
      voidCompactedResources,
      voidAircraftMissions,
      voidAircraftUpgrades,
      voidBattleShipStats,
      voidPOIsInspiration,
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

  // Auto Travel Loop (Removed redundant manual launch logic)
  useEffect(() => {
    // This effect is now empty as auto-travel is handled in the main Game Loop
  }, []);

  const getShipNeonBorder = (shipColor: string) => {
    if (shipColor.includes('cyan')) return 'neon-border-cyan';
    if (shipColor.includes('orange')) return 'neon-border-orange';
    if (shipColor.includes('pink')) return 'neon-border-pink';
    if (shipColor.includes('rose')) return 'neon-border-rose';
    if (shipColor.includes('purple') || shipColor.includes('violet') || shipColor.includes('fuchsia')) return 'neon-border-purple';
    if (shipColor.includes('yellow') || shipColor.includes('amber') || shipColor.includes('gold')) return 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    if (shipColor.includes('red')) return 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    if (shipColor.includes('blue') || shipColor.includes('indigo')) return 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
    if (shipColor.includes('emerald') || shipColor.includes('teal')) return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    return isInterstellar ? 'neon-border-orange' : 'neon-border-cyan';
  };

  const synthesizeAetherion = useCallback(() => {
    if (aetherionTubesRef.current <= 0) {
      playSfx('error');
      return;
    }
    
    // Only use what's needed to reach 10,000, or at least one tube
    const currentAetherion = aetherionRef.current;
    const needed = 10000 - currentAetherion;
    let tubesToUse = Math.ceil(needed / 500);
    
    // Cap tubes to use by what we have and at least 1
    tubesToUse = Math.max(1, Math.min(tubesToUse, aetherionTubesRef.current));
    
    const aetherionToAdd = tubesToUse * 500;
    
    setAetherion(prev => Math.min(10000, prev + aetherionToAdd));
    setAetherionTubes(prev => prev - tubesToUse);
    playSfx('success');
    addLog(`${t('synthesisComplete')}${aetherionToAdd} Eterion!`, 'success');
  }, [setAetherion, setAetherionTubes, playSfx, addLog, language, t]);

  // Game Loop
  useEffect(() => {
    const tick = setInterval(() => {
      if (isTransitioning || showRoute2Lore || showVoidLore) return;

      // 1. Handle Manual Deliveries
      const prev = activeDeliveriesRef.current;
      const manualCompletions: { routeId: string, count: number }[] = [];
      
      // Check for queued deliveries that can start
      let updatedDeliveries = [...prev];
      let queueChanged = false;

      // 1a. Handle Queued -> Delivering (Ship check)
      // Group by ship level to check availability
      const shipsInUse: { [level: number]: number } = {};
      updatedDeliveries.forEach(d => {
        if (d.status === 'delivering') {
          shipsInUse[d.shipLevel] = (shipsInUse[d.shipLevel] || 0) + 1;
        }
      });

      // Also count ships used by auto-travel
      Object.keys(autoTravelActiveRef.current).forEach(routeId => {
        if (autoTravelActiveRef.current[routeId]) {
          const route = ROUTES.find(r => r.id === routeId);
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
            queueChanged = true;
            return { ...d, status: 'delivering', startTime: Date.now() };
          }
        }
        return d;
      });

      const nextManual = updatedDeliveries.map(d => {
        if (d.status === 'combat') return d; // Delivery is paused during combat
        if (d.status !== 'delivering') return d;
        const route = ROUTES.find(r => r.id === d.routeId);
        if (!route) return d;

        const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
        const engineUpgrade = UPGRADES.find(u => u.id === 'engine')!;
        const engineTier = engineUpgrade.tiers.find(t => t.level === locationTech.engine);
        
        let progressIncrement = 0;
        if (engineTier?.level === 5) {
          progressIncrement = 2;
        } else {
          const speedMultiplier = engineTier ? 1 + engineTier.value : 1;
          progressIncrement = speedMultiplier / 6;
        }
        
        let newProgress = d.progress + progressIncrement;
        
        if (newProgress >= 100) {
          manualCompletions.push({ routeId: d.routeId, count: 1 });
          return null; // Mark for removal
        }

        return { ...d, progress: newProgress };
      }).filter(d => d !== null) as ActiveDelivery[];

      // Random Combat Encounter
      const timeSinceLastBattle = Date.now() - lastRandomBattleTimeRef.current;
      const forcedBattle = timeSinceLastBattle > 180000; // 3 minutes
      const battleFreqMultiplier = (battleLevelRef.current >= 35 && routeTier === 'Interstellar') ? 1.5 : 1;
      
      if (!activeBattleRef.current && !isSpeedRunRef.current && (Math.random() < (0.002 * battleFreqMultiplier) || forcedBattle)) {
        const manualShips = nextManual.filter(d => d.status === 'delivering');
        const autoRoutes = Object.keys(autoTravelActiveRef.current).filter(rid => 
          autoTravelActiveRef.current[rid] && (autoTravelProgressRef.current[rid] || 0) > 0
        );

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
          } else {
            routeId = autoRoutes[targetIndex - manualShips.length];
            targetId = `auto-${routeId}`;
            isAuto = true;
          }

          const route = ROUTES.find(r => r.id === routeId);
          if (route) {
            const enemyColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
            
            // Scaling with Battle Level +/- 10% - Up to level 20
            const minLvl = Math.max(1, Math.floor(battleLevelRef.current * 0.9));
            const maxLvl = Math.max(1, Math.ceil(battleLevelRef.current * 1.1));
            const enemyTier = Math.min(20, Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl);
            
            // Boss chance: 10% base + 10% from Level 15 + 25% from Level 45
            let bossChance = 0.10 + (battleLevelRef.current >= 15 ? 0.10 : 0);
            if (battleLevelRef.current >= 45 && routeTier === 'Interstellar') {
              bossChance += 0.25;
            }
            
            const isBoss = Math.random() < bossChance;
            const isElite = !isBoss && enemyTier > 10;
            const enemyType = isBoss ? 'Boss' : (isElite ? 'Elite' : (enemyTier > 5 ? 'Alien' : (Math.random() > 0.5 ? 'Pirate' : 'Alien')));
            
            const enemyHp = (50 + (enemyTier * 60) + Math.floor(Math.random() * 50)) * (isBoss ? 10 : (isElite ? 5 : 1));
            let playerHp = 100 + (battleLevelRef.current * 150);
            
            // Skyring bonus
            if (battleLevelRef.current >= 25) {
              playerHp += 500;
            }

            let playerDps = (10 + battleLevelRef.current * 10) / 2;
            
            // Level 20 bonus: +50% damage
            if (battleLevelRef.current >= 20) {
              playerDps *= 1.5;
            }

            // Level 25 Skyring bonus: +50% damage
            if (battleLevelRef.current >= 25) {
              playerDps *= 1.5;
            }

            const enemyDps = ((8 + enemyTier * 6) / 2.5) * (isBoss ? 4 : (isElite ? 2 : 1));
            const playerTimeToKill = enemyHp / playerDps;
            const enemyTimeToKill = playerHp / enemyDps;
            let winProb = Math.min(100, Math.max(0, Math.floor((enemyTimeToKill / (playerTimeToKill + enemyTimeToKill)) * 100)));

            // Level 45 bonus: +25% win chance against bosses
            if (isBoss && battleLevelRef.current >= 45 && routeTier === 'Interstellar') {
              winProb = Math.min(100, winProb + 25);
            }

            // Add Bonuses to win probability
            const doomPBonus = getDoomPBonus(doomPLevelRef.current);
            const policeBonus = getPoliceBonus(privatePoliceLevelRef.current);
            const totalWinProb = winProb + doomPBonus + policeBonus;

            const multipliers = getEconomicMultipliers();
            const rewardMultiplier = isBoss ? 6 : (isElite ? 3 : 1);
            
            // If totalWinProb is >= 100, it's a guaranteed victory
            const result = (Math.random() * 100 < totalWinProb) ? 'victory' : 'defeat';
            
            const getEnemyImage = () => {
              if (isBoss) return '/images/battle/enemy_boss.png';
              if (isElite) return '/images/battle/enemy_elite.png';
              if (enemyTier > 15) return '/images/battle/enemy_raider.png';
              if (enemyTier > 5) return '/images/battle/enemy_alien.png';
              return '/images/battle/enemy_scout.png';
            };

            const getPlayerImage = () => {
              return battleLevelRef.current >= 25 ? '/images/battle/skyring.png' : '/images/battle/standard_ship.png';
            };

            const battle: Battle = {
              id: Math.random().toString(36).substr(2, 9),
              deliveryId: targetId,
              enemyName: isBoss ? (language === 'pt' ? 'Nave MÃE (BOSS)' : 'MOTHER SHIP (BOSS)') : (isElite ? (language === 'pt' ? 'Cruzador de Elite' : 'Elite Cruiser') : enemyTier > 5 ? (language === 'pt' ? 'Cruzador Alienígena' : 'Alien Cruiser') : (enemyType === 'Pirate' ? (language === 'pt' ? 'Pirata Espacial' : 'Space Pirate') : (language === 'pt' ? 'Batedor Alienígena' : 'Alien Scout'))),
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
              playerImage: getPlayerImage(),
              enemyImage: getEnemyImage()
            };

            lastRandomBattleTimeRef.current = Date.now();

            setHistoryStats(prev => ({
              ...prev,
              [routeTier]: {
                ...prev[routeTier],
                randomBattlesFound: (prev[routeTier].randomBattlesFound || 0) + 1
              }
            }));
            
            // Level 30: Retribution (Auto-resolve)
            if (battleLevelRef.current >= 30 && routeTier === 'Interstellar') {
              const isVictory = Math.random() * 100 < winProb;
              if (isVictory) {
                const results = resolveBattleVictory(battle);
                if (isRetributionActiveRef.current) {
                  setBattleNotification({
                    message: language === 'pt' 
                      ? `Batalha vencida: +${formatValue(results.qcReward)} QC!` 
                      : `Battle won: +${formatValue(results.qcReward)} QC!`,
                    type: 'success'
                  });
                }
                playSfx('success');
              } else {
                resolveBattleDefeat(battle);
                if (isRetributionActiveRef.current) {
                  setBattleNotification({
                    message: language === 'pt' 
                      ? `Batalha perdida.` 
                      : `Battle lost.`,
                    type: 'error'
                  });
                }
                playSfx('error');
              }
              
              // Reset ship status if it was a manual delivery
              if (!isAuto) {
                const shipIndex = nextManual.findIndex(d => d.id === targetId);
                if (shipIndex !== -1) {
                  nextManual[shipIndex].status = 'delivering';
                }
              }

              if (isRetributionActiveRef.current) {
                setTimeout(() => setBattleNotification(null), 2000);
              }
            } else {
              setActiveBattle(battle);
              
              // Auto-Skip Logic
              const skipCost = isInterstellar ? 40 : 10;
              if (autoSkipRandomBattlesRef.current && aetherionRef.current >= skipCost) {
                const victory = autoSkipBattle(battle, skipCost);
                if (victory) {
                  battle.isVictory = true;
                  battle.enemyHp = 0;
                } else {
                  battle.isDefeat = true;
                  battle.playerHp = 0;
                }
                setActiveBattle(battle);
                playSfx(victory ? 'success' : 'error');
              } else {
                addLog(`${t('deliveryUnderAttack')} ${route.destination} ${t('underAttack')}`, 'error');
                playSfx('error');
              }
            }
          }
        }
      }

      // Process Battle Tick (AUTOMATIC CINEMATIC RESOLVE)
      if (activeBattleRef.current && !activeBattleRef.current.isVictory && !activeBattleRef.current.isDefeat) {
        const battle = { ...activeBattleRef.current };
        const now = Date.now();
        const elapsed = now - battle.startTime;
        const totalDuration = 6000; // 6 seconds of cinematic combat

        if (elapsed < totalDuration) {
          // Cinematic Phase
          const progress = elapsed / totalDuration;
          
          // Smoothly drain HP to 0 or 10% based on predeterminedResult
          if (battle.predeterminedResult === 'victory') {
            battle.enemyHp = Math.max(0, battle.enemyMaxHp * (1 - progress));
            battle.playerHp = Math.max(battle.playerMaxHp * 0.1, battle.playerMaxHp * (1 - progress * 0.5));
          } else {
            battle.playerHp = Math.max(0, battle.playerMaxHp * (1 - progress));
            battle.enemyHp = Math.max(battle.enemyMaxHp * 0.1, battle.enemyMaxHp * (1 - progress * 0.5));
          }

          // Trigger automatic shots for visual effect
          if (now - (battle.lastPlayerAttack.laser || 0) > 1000) {
            battle.lastPlayerAttack = { ...battle.lastPlayerAttack, laser: now };
            playSfx('laser');
          }
          if (now - battle.lastEnemyAttack >= 1500) {
            battle.lastEnemyAttack = now;
            playSfx('hit');
          }
        } else {
          // Finalize Result
          if (battle.predeterminedResult === 'victory') {
            battle.isVictory = true;
            battle.enemyHp = 0;
            resolveBattleVictory(battle);
          } else {
            battle.isDefeat = true;
            battle.playerHp = 0;
            resolveBattleDefeat(battle);
          }
          battle.isCinematicFinished = true;
        }
        
        setActiveBattle(battle);
      }

      if (JSON.stringify(nextManual) !== JSON.stringify(prev)) {
        setActiveDeliveries(nextManual);
      }

      // Level 50 reward: Fatigue (Auto-synthesis)
      if (battleLevelRef.current >= 50 && isFatigueActiveRef.current && routeTier === 'Interstellar' && aetherionRef.current < 1000 && aetherionTubesRef.current > 0) {
        synthesizeAetherion();
      }

      // Calculate Aetherion Consumption (Per Second)
      let totalAetherionConsumption = 0; 
      
      // Auto-Sell Consumption removed (now 1 Aetherion per pack sold)
      
      const aetherionTickConsumption = totalAetherionConsumption / 10;
      if (totalAetherionConsumption > 0) {
        if (aetherionRef.current < aetherionTickConsumption) {
          // This case should not happen now as totalAetherionConsumption is 0
          addLog(t('insufficientAetherion'), 'error');
        } else {
          setAetherion(prev => Math.max(0, prev - aetherionTickConsumption));
        }
      }

      // Auto-Travel Reactivation Logic
      Object.keys(autoTravelDesiredRef.current).forEach(routeId => {
        if (autoTravelDesiredRef.current[routeId] && !autoTravelActiveRef.current[routeId]) {
          const route = ROUTES.find(r => r.id === routeId);
          if (!route) return;

          const slots = autoTravelSlotsRef.current[routeId] || 0;
          const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
          const valueUpgrade = UPGRADES.find(u => u.id === 'value')!;
          const valueTier = valueUpgrade.tiers.find(v => v.level === locationTech.value);
          const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
          const fuelCost = Math.floor(10 * costIncreaseMultiplier);
          const attemptCost = fuelCost * slots;
          const aetherionTripCost = slots * (isInterstellar ? 8 : 4);
          
          if (aetherionRef.current >= aetherionTripCost && qcRef.current >= attemptCost) {
            setAutoTravelActive(prev => ({ ...prev, [routeId]: true }));
          }
        }
      });

      const nextAutoProgress = { ...autoTravelProgressRef.current };
      const autoCompletedRoutes: { routeId: string, count: number }[] = [];

      Object.keys(autoTravelActiveRef.current).forEach(routeId => {
        if (autoTravelActiveRef.current[routeId]) {
          // Pause progress if this route is in combat
          if (activeBattleRef.current?.deliveryId === `auto-${routeId}`) return;

          const route = ROUTES.find(r => r.id === routeId);
          if (route) {
            const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
            const currentProgress = nextAutoProgress[routeId] || 0;
            const numSlots = autoTravelSlotsRef.current[routeId] || 0;

            const valueUpgrade = UPGRADES.find(u => u.id === 'value')!;
            const valueTier = valueUpgrade.tiers.find(t => t.level === locationTech.value);
            const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
            const fuelCost = Math.floor(10 * costIncreaseMultiplier);

            // Start of a new delivery attempt
            if (currentProgress === 0) {
              const attemptCost = fuelCost * numSlots;
              const aetherionTripCost = numSlots * (isInterstellar ? 8 : 4);

              // Check ship availability for auto-travel
              const requiredLevel = route.requiredShipLevel;
              const totalOwned = ownedShipsRef.current[`${route.tier}-${requiredLevel}`] || 0;
              const manualInUse = activeDeliveriesRef.current.filter(d => d.shipLevel === requiredLevel && d.tier === route.tier && d.status === 'delivering').length;
              
              // Count other auto-travels using the same ship level
              let otherAutoInUse = 0;
              Object.keys(autoTravelActiveRef.current).forEach(otherId => {
                if (otherId !== routeId && autoTravelActiveRef.current[otherId]) {
                  const otherRoute = ROUTES.find(r => r.id === otherId);
                  if (otherRoute && otherRoute.requiredShipLevel === requiredLevel && otherRoute.tier === route.tier) {
                    otherAutoInUse += (autoTravelSlotsRef.current[otherId] || 0);
                  }
                }
              });

              const canAfford = qcRef.current >= attemptCost && aetherionRef.current >= aetherionTripCost;
              const shipsAvailable = (manualInUse + otherAutoInUse + numSlots) <= totalOwned;

              if (canAfford && shipsAvailable) {
                setQc(c => c - attemptCost);
                setAetherion(prev => Math.max(0, prev - aetherionTripCost));
                updateHistoryStats('spent', attemptCost);
                // Start progress
                nextAutoProgress[routeId] = 0.01; 
              } else {
                if (!shipsAvailable && canAfford) {
                  // Just wait for ships, don't stop auto-travel unless it's a resource issue
                  return;
                }
                // Stop auto-travel
                setAutoTravelActive(prev => ({ ...prev, [routeId]: false }));
                if (aetherionRef.current < aetherionTripCost) {
                  addLog(t('insufficientAetherion'), 'error');
                }
                return;
              }
            } else {
              const engineUpgrade = UPGRADES.find(u => u.id === 'engine')!;
              const engineTier = engineUpgrade.tiers.find(t => t.level === locationTech.engine);
              
              let progressIncrement = 0;
              if (engineTier?.level === 5) {
                progressIncrement = 2;
              } else {
                const speedMultiplier = engineTier ? 1 + engineTier.value : 1;
                progressIncrement = speedMultiplier / 6;
              }

              let newProgress = currentProgress + progressIncrement;
              if (newProgress >= 100) {
                // Check success chance for each slot
                const aiUpgrade = UPGRADES.find(u => u.id === 'ai')!;
                const aiTier = aiUpgrade.tiers.find(t => t.level === locationTech.ai) || { value: 0.65 }; // Base 65% success
                const successChance = aiTier.value;

                let succeeded = 0;
                for (let i = 0; i < numSlots; i++) {
                  if (Math.random() < successChance) {
                    succeeded++;
                  }
                }

                if (succeeded > 0) {
                  autoCompletedRoutes.push({ routeId, count: succeeded });
                }
                
                newProgress = 0; // Reset for next attempt (continuous loop)
              }
              nextAutoProgress[routeId] = newProgress;
            }
          }
        }
      });

        // 3. Process Completions
        const completions: { routeId: string, count: number, isManual: boolean }[] = [
          ...manualCompletions.map(d => ({ ...d, isManual: true })),
          ...autoCompletedRoutes.map(a => ({ ...a, isManual: false }))
        ];

        let updatedManual = nextManual.filter(d => d.progress < 100);

        if (completions.length > 0) {
          let totalRewardBatch = 0;
          const locationUpdates: { [key: string]: number } = {};
          let totalCompletedCount = 0;
          
          completions.forEach(comp => {
            const route = ROUTES.find(r => r.id === comp.routeId)!;
            const locationTech = techLevelsRef.current[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
            
            for (let i = 0; i < comp.count; i++) {
              const aiUpgrade = UPGRADES.find(u => u.id === 'ai')!;
              const aiTier = aiUpgrade.tiers.find(t => t.level === locationTech.ai);
              const perfectChance = aiTier?.level === 6 ? 0.5 : 0.1;
              const isPerfect = Math.random() < perfectChance; 

              const valueUpgrade = UPGRADES.find(u => u.id === 'value')!;
              const valueTier = valueUpgrade.tiers.find(t => t.level === locationTech.value);
              const profitMultiplier = valueTier ? 1 + valueTier.value : 1;
              const multipliers = getEconomicMultipliers();

              const rareUpgrade = UPGRADES.find(u => u.id === 'rare')!;
              const rareTier = rareUpgrade.tiers.find(t => t.level === locationTech.rare);
              const rareChance = rareTier ? rareTier.value : 0.05; // Base 5% chance
              const isRare = Math.random() < rareChance;

              let reward = route.reward * profitMultiplier * multipliers.profit;
              if (isPerfect) reward *= 1.5;
              if (isRare) reward *= 10;

              // Apply Double Route multiplier for Route 2
              if (route.tier === 'Interstellar') {
                reward *= getDoubleRouteMultiplier(doubleRouteLevelRef.current);
              }

              totalRewardBatch += Math.floor(reward);
              locationUpdates[route.destination] = (locationUpdates[route.destination] || 0) + 1;
              totalCompletedCount++;
            }
          });

          setQc(c => c + totalRewardBatch);
          updateHistoryStats('acquired', totalRewardBatch, 'delivery');
          updateAchievementProgress('first_delivery', totalCompletedCount);
          
          const manualCount = completions.filter(c => c.isManual).reduce((acc, curr) => acc + curr.count, 0);
          const autoCount = completions.filter(c => !c.isManual).reduce((acc, curr) => acc + curr.count, 0);
          
          if (manualCount > 0) incrementDeliveries('manual', manualCount);
          if (autoCount > 0) incrementDeliveries('auto', autoCount);
          
          setTotalDeliveries(td => td + totalCompletedCount);
          setDeliveriesByLocation(prevLocs => {
            const nextLocs = { ...prevLocs };
            Object.keys(locationUpdates).forEach(dest => {
              nextLocs[dest] = (nextLocs[dest] || 0) + locationUpdates[dest];
            });
            return nextLocs;
          });

          // Update Missions
          setMissions(prev => prev.map(m => {
            if (m.type === 'delivery' && !m.completed) {
              const relevantCompletions = completions.filter(c => {
                const route = ROUTES.find(r => r.id === c.routeId);
                return route && route.requiredShipLevel === m.shipLevel;
              });
              const count = relevantCompletions.reduce((acc, c) => acc + c.count, 0);
              if (count > 0) {
                const newCurrent = Math.min(m.target, m.current + count);
                return { ...m, current: newCurrent, completed: newCurrent >= m.target };
              }
            }
            return m;
          }));
        }

        setActiveDeliveries([...updatedManual]);
      
      // 3. Handle Mining
      const currentOres = oresCollectedRef.current;
      const nextOres = { ...currentOres };
      let oresChanged = false;
      let miningQcBonus = 0;
      const multipliers = getEconomicMultipliers();

      ORES.filter(o => o.tier === routeTier).forEach(ore => {
        const robots = miningRobotsRef.current[ore.id] || 0;
        if (robots > 0) {
          const level = miningRobotLevelsRef.current[ore.id] || 1;
          const upgrade = ROBOT_UPGRADES.find(u => u.level === level) || ROBOT_UPGRADES[0];
          
          const baseRate = 0.5; // Base units per second
          const ratePerRobot = baseRate * upgrade.speedBonus * upgrade.efficiencyBonus * upgrade.productionBonus;
          const totalRate = robots * ratePerRobot;
          
          const currentAmount = nextOres[ore.id] || 0;
          if (currentAmount < ore.packSize) {
            const added = totalRate * 0.1; // 100ms tick
            const newAmount = Math.min(ore.packSize, currentAmount + added);
            if (newAmount !== currentAmount) {
              nextOres[ore.id] = newAmount;
              oresChanged = true;
            }
          }

          // Auto-sell logic
          const autoSellCostPerPack = isInterstellar ? 20 : 10;
          if (aetherionRef.current >= autoSellCostPerPack && autoSellByOreRef.current[ore.id] && nextOres[ore.id] >= ore.packSize) {
            let packs = Math.floor(nextOres[ore.id] / ore.packSize);
            if (packs > 0) {
              // Cap auto-sell at 5 packs per tick for Route 2 to avoid burst inflation
              if (routeTier === 'Interstellar') packs = Math.min(5, packs);
              
              // Deduct Aetherion per pack sold
              setAetherion(prev => Math.max(0, prev - (packs * autoSellCostPerPack)));
              const compressionBonus = 1 + (miningCompressionLevelsRef.current[ore.id] || 0) * 0.5;
              let value = Math.floor(ore.baseValue * ore.rarity * ore.packSize * multipliers.profit * compressionBonus);
              
              if (routeTier === 'Interstellar') {
                value *= 75; // Adjusted from 2250x to 75x for better balance
              }
              
              // Level 40 reward: 10x mining value
              if (battleLevelRef.current >= 40 && routeTier === 'Interstellar') {
                value *= 10;
              }
              
              miningQcBonus += value * packs;
              setHistoryStats(prev => ({
                ...prev,
                [routeTier]: {
                  ...prev[routeTier],
                  autoMiningPacksSold: (prev[routeTier].autoMiningPacksSold || 0) + packs
                }
              }));

              // RHSE Mining Waste for Auto-Sell (Increased by 100%)
              const extractionBonus = 1 + (extractionTechLevelRef.current * 0.1);
              const wasteToAdd = packs * 300 * (routeTier === 'Interstellar' ? extractionBonus : 1);
              setMiningWaste(prev => Math.min(7500, prev + wasteToAdd));

              nextOres[ore.id] -= packs * ore.packSize;
              oresChanged = true;

              // Trigger floating money animation if on mining tab
              if (activeTab === 'mining') {
                const newFloatingReward = {
                  id: Math.random().toString(36).substr(2, 9),
                  amount: value * packs,
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2
                };
                setFloatingRewards(prev => [...prev, newFloatingReward]);
                setTimeout(() => {
                  setFloatingRewards(prev => prev.filter(r => r.id !== newFloatingReward.id));
                }, 1000);
              }

              // Update Missions
              setMissions(prev => prev.map(m => {
                if (m.type === 'sell' && m.oreId === ore.id && !m.completed) {
                  const newCurrent = Math.min(m.target, m.current + packs);
                  return { ...m, current: newCurrent, completed: newCurrent >= m.target };
                }
                return m;
              }));
            }
          }
        }
      });

      if (oresChanged) {
        setOresCollected(nextOres);
      }
      if (miningQcBonus > 0) {
        setQc(c => c + miningQcBonus);
        updateHistoryStats('acquired', miningQcBonus, 'mining');
      }

      // 4. Handle Technology Research
      const researching = researchingTechRef.current;
      if (researching) {
        const tech = TECHNOLOGIES.find(t => t.tier === researching.tier && t.level === researching.level);
        if (tech) {
          let researchTime = activeCodes['SLIKE'] && !isSpeedRun ? 3600000 : tech.researchTime;
          if (researching.tier === 'Interstellar') researchTime *= 0.5;
          
          const elapsed = Date.now() - researching.startTime;
          if (elapsed >= researchTime) {
            setUnlockedTechLevels(prev => ({ ...prev, [researching.tier]: researching.level }));
            setResearchingTech(null);
            // Give free ship of that level
            if (isSpeedRun) {
              setOwnedShips(prev => ({
                ...prev,
                [`${tech.tier}-${tech.unlocksShipLevel}`]: (prev[`${tech.tier}-${tech.unlocksShipLevel}`] || 0) + 1
              }));
            }
            playSfx('success');
            addLog(`Technology ${tech.name} unlocked!`, 'success');
          }
        }
      }
      
      setAutoTravelProgress(nextAutoProgress);
    }, 100);

    return () => clearInterval(tick);
  }, [t, translateData, routeTier, getEconomicMultipliers, addLog, playSfx, incrementDeliveries, updateHistoryStats, activeCodes, isSpeedRun, activeTab, miningCompressionLevels, language, autoSkipBattle, resolveBattleDefeat, resolveBattleVictory, isInterstellar, formatValue, setBattleNotification, synthesizeAetherion, isTransitioning, showRoute2Lore, showVoidLore, updateAchievementProgress]);

  // Tutorial Trigger
  useEffect(() => {
    if (!isLoaded) return;
    
    // Small delay to ensure seenTutorials state is fully updated from localStorage
    const timeout = setTimeout(() => {
      if (['mining', 'aircraft', 'upgrades', 'auto', 'routes2', 'technology', 'missions', 'history'].includes(activeTab)) {
        if (!seenTutorials[activeTab]) {
          setActiveTutorial(activeTab);
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
        setSeenTutorials(prev => ({ ...prev, fliperamas: true }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, routeTier, seenTutorials]);

  const closeTutorial = () => {
    if (activeTutorial) {
      setSeenTutorials(prev => ({ ...prev, [activeTutorial]: true }));
      const bonus = 1000;
      setQc(c => c + bonus);
      
      setHistoryStats(prev => ({
        ...prev,
        [routeTier]: {
          ...prev[routeTier],
          qcFromTutorial: (prev[routeTier].qcFromTutorial || 0) + bonus,
          qcTotalAcquired: (prev[routeTier].qcTotalAcquired || 0) + bonus
        }
      }));

      addLog(activeTutorial === 'routes2' ? t('tutorialRoutes2Bonus') : t('tutorialBonus'), 'success');
      playSfx('success');
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

    if (qc >= (route.unlockCost || 0)) {
      setQc(c => c - (route.unlockCost || 0));
      updateHistoryStats('spent', route.unlockCost || 0);
      setUnlockedRouteIds(prev => [...prev, route.id]);
      playSfx('buy');
      addLog(`Route ${route.name} unlocked!`, 'success');
    } else {
      addLog(`Not enough QC to unlock ${route.name}`, 'error');
    }
  };

  const buyUpgrade = (locationId: string, upgrade: Upgrade) => {
    const locationTech = techLevels[locationId] || { engine: 0, ai: 0, value: 0, rare: 0 };
    const currentLevel = locationTech[upgrade.id.toLowerCase()] || 0;
    const nextTier = upgrade.tiers.find(t => t.level === currentLevel + 1);

    if (!nextTier) {
      return;
    }

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
    
    if (routeTier === 'Interstellar') {
      cost = Math.floor(cost * 1.5);
    }
    
    if (qc >= cost) {
      setQc(c => c - cost);
      setTechLevels(prev => ({
        ...prev,
        [locationId]: {
          ...(prev[locationId] || { engine: 0, ai: 0, value: 0, rare: 0 }),
          [upgrade.id.toLowerCase()]: currentLevel + 1
        }
      }));
      if (upgrade.id === 'engine' && currentLevel === 0) {
        completeInitialMission('init_3');
      }
      playSfx('upgrade');
      addLog(`${upgrade.name} upgraded to Level ${currentLevel + 1}`, 'success');
    } else {
      addLog(`Not enough QC for ${upgrade.name} upgrade`, 'error');
    }
  };

  const buyMiningRobot = (oreId: string) => {
    const ore = ORES.find(o => o.id === oreId)!;
    const currentRobots = miningRobots[oreId] || 0;
    
    if (currentRobots >= 5) {
      addLog(t('maxRobotsReached'), 'warning');
      return;
    }

    const cost = Math.floor(ore.robotBaseCost * Math.pow(1.1, currentRobots) * getEconomicMultipliers().cost * (routeTier === 'Interstellar' ? 0.4 : 1));
    if (qc < cost) {
      addLog(t('insufficientQCRobot'), 'error');
      return;
    }

    setQc(c => c - cost);
    updateHistoryStats('spent', cost);
    setMiningRobots(prev => ({ ...prev, [oreId]: currentRobots + 1 }));
    updateAchievementProgress('robot_owner', 1);
    completeInitialMission('init_6');
    playSfx('buy');
    addLog(`${t('buyRobot')}: ${ore.name}`, 'success');
  };

  const upgradeMiningRobot = (oreId: string) => {
    const currentLevel = miningRobotLevels[oreId] || 1;
    const nextTier = ROBOT_UPGRADES.find(u => u.level === currentLevel + 1);
    const ore = ORES.find(o => o.id === oreId);
    
    if (!nextTier || !ore) return;

    const cost = isSpeedRun 
      ? (nextTier.level === 2 ? 5000 : nextTier.level === 3 ? 25000 : nextTier.level === 4 ? 100000 : 500000)
      : Math.floor(ore.robotBaseCost * nextTier.costMultiplier * getEconomicMultipliers().cost * (routeTier === 'Interstellar' ? 0.5 : 1));

    if (qc < cost) {
      addLog(t('insufficientQCUpgrade'), 'error');
      return;
    }

    setQc(c => c - cost);
    updateHistoryStats('spent', cost);
    setMiningRobotLevels(prev => ({ ...prev, [oreId]: currentLevel + 1 }));
    playSfx('upgrade');
    addLog(`${t('robotUpgraded')} ${currentLevel + 1}`, 'success');
  };

  const buyMiningCompression = (oreId: string) => {
    if (isSpeedRun) return;
    const ore = ORES.find(o => o.id === oreId);
    if (!ore) return;

    const currentLevel = miningCompressionLevels[oreId] || 0;
    if (currentLevel >= 10) return;

    // New cost formula: Level 1 = robotBaseCost, Level 10 = robotBaseCost * 100
    const cost = Math.floor(ore.robotBaseCost * Math.pow(1.6681, currentLevel) * getEconomicMultipliers().cost * (routeTier === 'Interstellar' ? 0.2 : 1));
    
    if (qc >= cost) {
      setQc(prev => prev - cost);
      updateHistoryStats('spent', cost);
      setMiningCompressionLevels(prev => ({ ...prev, [oreId]: currentLevel + 1 }));
      playSfx('upgrade');
      addLog(`${t('refinedCompression')} ${ore.name} Lvl ${currentLevel + 1}`, 'success');
    } else {
      playSfx('error');
      addLog(t('insufficientQCUpgrade'), 'error');
    }
  };

  const sellOrePack = (oreId: string, event?: React.MouseEvent) => {
    const ore = ORES.find(o => o.id === oreId)!;
    const amount = oresCollected[oreId] || 0;
    const packs = Math.floor(amount / ore.packSize);

    if (packs <= 0) return;

    const multipliers = getEconomicMultipliers();
    const compressionBonus = 1 + (miningCompressionLevels[oreId] || 0) * 0.2;
    let value = Math.floor(ore.baseValue * ore.rarity * ore.packSize * packs * multipliers.profit * compressionBonus);
    
    // Removed hacky 75x multiplier as base values are now balanced in game-data.ts
    
    // Level 40 reward: 10x mining value
    if (battleLevelRef.current >= 40 && routeTier === 'Interstellar') {
      value *= 10;
    }

    // Trigger floating money animation for manual sales
    if (event && activeTab === 'mining') {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const newFloatingReward = {
        id: Math.random().toString(36).substr(2, 9),
        amount: value,
        x: rect.left + rect.width / 2,
        y: rect.top
      };
      setFloatingRewards(prev => [...prev, newFloatingReward]);
      playSfx('success');
    } else {
      playSfx('buy');
    }

    setQc(c => c + value);
    updateHistoryStats('acquired', value, 'mining');
    setHistoryStats(prev => ({
      ...prev,
      [routeTier]: {
        ...prev[routeTier],
        manualMiningPacksSold: (prev[routeTier].manualMiningPacksSold || 0) + packs
      }
    }));
    setOresCollected(prev => ({ ...prev, [oreId]: prev[oreId] - (packs * ore.packSize) }));
    
    // RHSE Mining Waste (Increased by 100%)
    const extractionBonus = 1 + (extractionTechLevel * 0.1);
    const wasteToAdd = packs * 300 * (routeTier === 'Interstellar' ? extractionBonus : 1);
    setMiningWaste(prev => Math.min(7500, prev + wasteToAdd));

    // Update Missions
    setMissions(prev => prev.map(m => {
      if (m.type === 'sell' && m.oreId === oreId && !m.completed) {
        const newCurrent = Math.min(m.target, m.current + packs);
        return { ...m, current: newCurrent, completed: newCurrent >= m.target };
      }
      return m;
    }));

    addLog(`${t('sellPacks')}: ${ore.name} x${packs}`, 'success');
  };

  const buyAutoSell = (oreId: string) => {
    if (activeCodes['SLIKE'] && !isSpeedRun) {
      addLog('Impossible Mode: Auto-Sell disabled', 'error');
      return;
    }
    
    const ore = ORES.find(o => o.id === oreId);
    if (!ore) return;

    if (!autoSellUnlockedByOre[oreId]) {
      const cost = ore.autoSellCost * getEconomicMultipliers().cost * (isInterstellar ? 0.8 : 1);
      if (qc < cost) {
        addLog(t('insufficientQCUpgrade'), 'error');
        return;
      }
      setQc(c => c - cost);
      updateHistoryStats('spent', cost);
      setAutoSellUnlockedByOre(prev => ({ ...prev, [oreId]: true }));
      setAutoSellByOre(prev => ({ ...prev, [oreId]: true }));
      addLog(t('autoSellUnlocked'), 'success');
      playSfx('upgrade');
    } else {
      // Toggle active state
      setAutoSellByOre(prev => ({ ...prev, [oreId]: !prev[oreId] }));
      playSfx('toggle');
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
    playSfx('click');
  };

  const buyAutoTravelSlot = (routeId: string) => {
    if (activeCodes['SLIKE'] && !isSpeedRun) {
      addLog(t('impossibleModeAutoTravelDisabled'), 'error');
      return;
    }
    const baseCosts = [1000, 5000, 10000, 15000, 20000];
    const currentSlots = autoTravelSlots[routeId] || 0;
    if (currentSlots >= 5) {
      addLog(t('maxAutoTravelSlotsReached'), 'warning');
      return;
    }
    
    const multiplier = getLocationMultiplier(routeId);
    const route = ROUTES.find(r => r.id === routeId);
    const tierMultiplier = route?.tier === 'Interstellar' ? 1000 : 1;
    let cost = Math.floor(baseCosts[currentSlots] * multiplier * getEconomicMultipliers().cost * tierMultiplier);
    
    if (route?.tier === 'Solar') {
      cost *= 10;
    }

    if (qc >= cost) {
      setQc(c => c - cost);
      updateHistoryStats('spent', cost);
      setAutoTravelSlots(prev => ({
        ...prev,
        [routeId]: (prev[routeId] || 0) + 1
      }));
      completeInitialMission('init_5');
      playSfx('buy');
      addLog(`${t('autoTravelSlotPurchased')} ${routeId}`, 'success');
    } else {
      addLog(t('insufficientQCForAutoTravelSlot'), 'error');
    }
  };

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

  const startVoidMission = (aircraftId: string) => {
    const aircraft = VOID_AIRCRAFT.find(a => a.id === aircraftId)!;
    const upgrades = voidAircraftUpgrades[aircraftId];
    
    // Calculate mission time with upgrades
    const timeReduction = upgrades.time * 0.1; // 10% reduction per level (max 50%)
    const actualTime = aircraft.missionTime * (1 - timeReduction);
    
    setVoidAircraftMissions(prev => ({
      ...prev,
      [aircraftId]: {
        status: 'mission',
        endTime: Date.now() + actualTime,
        rareFound: false,
        restartAt: null
      }
    }));

    playSfx('launch');
    addLog(`${aircraft.name} ${t('aircraftMissionStart')}`, 'info');
  };

  const buyVoidAircraftAuto = (aircraftId: string) => {
    const upgrades = voidAircraftUpgrades[aircraftId];
    if (upgrades.auto === 1) return;

    const costs: { [key: string]: number } = {
      'va-1': 50000,
      'va-2': 75000,
      'va-3': 100000
    };
    const cost = costs[aircraftId];

    if (qc < cost) {
      addLog(t('insufficientQCForAuto'), 'error');
      return;
    }

    setQc(prev => prev - cost);
    setVoidAircraftUpgrades(prev => ({
      ...prev,
      [aircraftId]: {
        ...prev[aircraftId],
        auto: 1
      }
    }));
    setVoidAircraftAutoToggles(prev => ({
      ...prev,
      [aircraftId]: true
    }));

    playSfx('buy');
    addLog(`${t('autoModeUnlocked')} ${VOID_AIRCRAFT.find(a => a.id === aircraftId)?.name}!`, 'success');
  };

  const upgradeVoidAircraft = (aircraftId: string, type: 'storage' | 'quality' | 'time' | 'energy') => {
    const currentLevel = voidAircraftUpgrades[aircraftId][type];
    const maxLevel = 5;

    if (currentLevel >= maxLevel) {
      addLog(t('maxUpgradeReached'), 'warning');
      return;
    }

    const costs = [10000, 25000, 40000, 60000, 100000];
    const cost = costs[currentLevel] || 1000000;
    
    if (qc < cost) {
      addLog(t('insufficientQCForAircraft'), 'error');
      return;
    }

    setQc(prev => prev - cost);
    setVoidAircraftUpgrades(prev => ({
      ...prev,
      [aircraftId]: {
        ...prev[aircraftId],
        [type]: prev[aircraftId][type] + 1
      }
    }));

    playSfx('buy');
    addLog(`${t('aircraftUpgradeComplete')} ${type} ${language === 'pt' ? 'para' : 'for'} ${VOID_AIRCRAFT.find(a => a.id === aircraftId)?.name} ${t('completedExclamation')}`, 'success');
  };

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

    playSfx('success');
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

      playSfx('buy');
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
    if (isRobotRepaired) return;

    const energyCost = 500;
    const techCost = 500;
    
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
    
    const progressInc = 10 + Math.floor(Math.random() * 11);
    const nextProgress = Math.min(100, robotRepairProgress + progressInc);
    setRobotRepairProgress(nextProgress);
    
    if (nextProgress >= 100) {
      setIsRobotRepaired(true);
      playSfx('success');
      addLog('Robot systems fully restored!', 'success');
    } else {
      playSfx('click');
    }
  };

  const handleUpgradeRoute3BattleShip = () => {
    const level = battleShipUpgradeLevel;
    const energyCost = 1000 * (level + 1) * (level + 1);
    const techCost = 500 * (level + 1) * (level + 1);
    
    if (voidResources.energy < energyCost || voidResources.tech < techCost) {
      addLog(t('insufficientResourcesForCombatUpgrade'), 'error');
      playSfx('error');
      return;
    }
    
    setVoidResources(prev => ({
      ...prev,
      energy: prev.energy - energyCost,
      tech: prev.tech - techCost
    }));
    
    setBattleShipUpgradeLevel(prev => prev + 1);
    playSfx('upgrade');
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
    
    playSfx('upgrade');
    addLog(`${t('shipUpgradedTo')} ${nextRarity.toUpperCase()}!`, 'success');
  };

  const startVoidBattle = (warType?: 'normal' | 'elite' | 'boss') => {
    if (voidBattleShipStats.hp <= 0) {
      addLog(t('shipTooDamaged'), 'error');
      return;
    }

    playSfx('click');

    if (warType) {
      // Direct battle for Void War
      let stats;
      if (warType === 'normal') {
        const hp = 90000 * 0.375;
        stats = { hp: hp, maxHp: hp, shield: hp, maxShield: hp, damage: (30 + Math.random() * 20) * 2, qc: 50000 };
      } else if (warType === 'elite') {
        const hp = 225000 * 0.375;
        stats = { hp: hp, maxHp: hp, shield: hp, maxShield: hp, damage: (60 + Math.random() * 20) * 2, qc: 150000 };
      } else {
        const hp = 390000 * 0.375;
        stats = { hp: hp, maxHp: hp, shield: hp, maxShield: hp, damage: (100 + Math.random() * 20) * 2, qc: 500000 };
      }

      const enemy: VoidBattleEnemy = {
        id: `war-enemy-${Date.now()}`,
        type: warType === 'normal' ? 'Padrão' : warType === 'elite' ? 'Elite' : 'Boss',
        ...stats,
        lane: Math.floor(Math.random() * 4)
      };

      setVoidBattleOptions([enemy]);
      setVoidBattleStatus('fighting');
      setActiveVoidBattle({
        enemies: [enemy],
        projectiles: [],
        playerLane: 0,
        lastShot: 0,
        lastEnemyShot: 0,
        lastEnemyMove: Date.now(),
        lastEnemyAttack: Date.now(),
        isGroupBattle: false
      });
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

        options.push({
          id: `enemy-${Date.now()}-${i}`,
          type,
          ...stats,
          lane: Math.floor(Math.random() * 4)
        });
      }

      setVoidBattleOptions(options);
      setVoidBattleStatus('choosing');
      addLog(`${numOptions} ${t('targetsDetectedOnRadar')}`, 'warning');
    }, 3000);
  };

  const selectVoidBattle = (enemy: VoidBattleEnemy) => {
    const isGroup = Math.random() < 0.15;
    const enemies = [{ ...enemy }];
    
    if (isGroup) {
      const extraCount = 1 + Math.floor(Math.random() * 2); // 1 or 2 extra (total 2 or 3)
      for (let i = 0; i < extraCount; i++) {
        enemies.push({
          ...enemy,
          id: `${enemy.id}-group-${i}`,
          lane: enemy.lane // They start in the same lane as requested
        });
      }
    }

    setVoidBattleStatus('fighting');
    setActiveVoidBattle({
      enemies,
      playerLane: 1,
      projectiles: [],
      lastEnemyMove: Date.now(),
      lastEnemyAttack: Date.now(),
      isGroupBattle: isGroup
    });
    addLog(isGroup ? t('ambushDetected') : `${t('engagingShip')} ${enemy.type}. ${t('prepareForCombat')}`, 'warning');
    playSfx('click');
  };

  const moveVoidPlayer = (lane: number) => {
    if (!activeVoidBattle || voidBattleStatus !== 'fighting') return;
    setActiveVoidBattle(prev => prev ? { ...prev, playerLane: lane } : null);
    playSfx('click');
  };

  const voidPlayerAttack = () => {
    if (!activeVoidBattle || voidBattleStatus !== 'fighting') return;
    
    const currentLaneProjectiles = activeVoidBattle.projectiles.filter(p => p.lane === activeVoidBattle.playerLane && p.owner === 'player');
    if (currentLaneProjectiles.length >= 4) return;

    const effectiveStats = getEffectiveVoidStats(voidBattleShipStats);
    const isCrit = Math.random() < effectiveStats.critChance;
    const baseDamage = effectiveStats.damage * (0.9 + Math.random() * 0.2);
    const damage = isCrit ? (baseDamage * 10) + (effectiveStats.critDamageBonus || 0) : baseDamage;

    const newProjectile: VoidBattleProjectile = {
      id: `p-${Date.now()}`,
      lane: activeVoidBattle.playerLane,
      x: 10,
      owner: 'player',
      damage,
      isCrit,
      speed: 10
    };

    setActiveVoidBattle(prev => prev ? {
      ...prev,
      projectiles: [...prev.projectiles, newProjectile]
    } : null);

    playSfx('click'); // Should be a laser sound if available
  };

  // Void Battle Loop
  useEffect(() => {
    if (voidBattleStatus !== 'fighting' || !activeVoidBattle) return;

    const interval = setInterval(() => {
      setActiveVoidBattle(prev => {
        if (!prev || prev.enemies.every(e => e.hp <= 0) || voidBattleShipStatsRef.current.hp <= 0) return prev;
        const now = Date.now();
        const next = { ...prev };
        
        // 1. Move projectiles
        next.projectiles = next.projectiles.map(p => ({
          ...p,
          x: p.x + p.speed
        })).filter(p => p.x >= 0 && p.x <= 100);

        // 2. Collision detection
        const remainingProjectiles: VoidBattleProjectile[] = [];
        let playerHit = false;
        let playerDamageTotal = 0;
        
        // Track which enemies were hit by which projectiles
        const hits: { projectile: VoidBattleProjectile; enemiesHit: VoidBattleEnemy[] }[] = [];

        next.projectiles.forEach(p => {
          if (p.owner === 'player' && p.x >= 90) {
            const hitEnemies = next.enemies.filter(e => e.hp > 0 && e.lane === p.lane);
            if (hitEnemies.length > 0) {
              hits.push({ projectile: p, enemiesHit: hitEnemies });
            } else {
              remainingProjectiles.push(p);
            }
          } else if (p.owner === 'enemy' && p.x <= 10 && p.lane === next.playerLane) {
            playerHit = true;
            playerDamageTotal += p.damage;
          } else {
            remainingProjectiles.push(p);
          }
        });

        next.projectiles = remainingProjectiles;

        // 3. Apply damage to enemies
        hits.forEach(hit => {
          hit.enemiesHit.forEach(enemy => {
            let d = hit.projectile.damage;
            if (enemy.shield > 0) {
              const shieldD = Math.min(enemy.shield, d);
              enemy.shield -= shieldD;
              d -= shieldD;
            }
            enemy.hp = Math.max(0, enemy.hp - d);
          });
        });

        // 4. Apply damage to player
        if (playerHit) {
          setVoidBattleShipStats(stats => {
            let d = playerDamageTotal;
            let s = stats.shield;
            let h = stats.hp;
            if (s > 0) {
              const shieldD = Math.min(s, d);
              s -= shieldD;
              d -= shieldD;
            }
            h = Math.max(0, h - d);
            return { ...stats, shield: s, hp: h };
          });
        }

        // 5. Check Win/Loss
        const allEnemiesDead = next.enemies.every(e => e.hp <= 0);
        if (allEnemiesDead) {
          setVoidBattleStatus('won');

          // Void War Progress
          if (isVoidWarActive) {
            // Check if final boss of last sector won (9th sector, index 8)
            if (voidWarProgress.currentSector === 8 && voidWarProgress.currentBattle === 4) {
                setShowRoute3Ending(true);
                setRoute3EndingStep(0);
                setVoidAircraftAutoToggles({ 'va-1': false, 'va-2': false, 'va-3': false });
                playSfx('success');
            } else {
              setVoidWarProgress(prev => {
                let nextBattle = prev.currentBattle + 1;
                let nextSector = prev.currentSector;
                
                if (nextBattle >= 5) {
                  nextBattle = 0;
                  nextSector = Math.min(8, nextSector + 1);
                  addLog(`SECTOR ${prev.currentSector + 1} CLEARED!`, 'success');
                }
                return { currentSector: nextSector, currentBattle: nextBattle };
              });
            }
          }

          if (isVoidWarActive && !hasWonEliminateEnemiesRoute3Ref.current) {
            setHasWonEliminateEnemiesRoute3(true);
            addLog('SIGNAL DETECTED: Something crashed nearby...', 'warning');
          }

          const baseQC = next.enemies.reduce((sum, e) => sum + e.qc, 0);
          
          const rarityQCBonus = {
            common: 1,
            rare: 1.30,
            elite: 1.40,
            legendary: 1.50,
            mythic: 1.60
          }[voidBattleShipStatsRef.current.rarity] || 1;

          const reward = Math.floor(baseQC * voidBattleShipStatsRef.current.lootEfficiency * rarityQCBonus);
          setVoidBattleResult({ reward });
          setQc(q => q + reward);
          
          let logMsg = `${t('victoryCaps')} ${next.enemies.length > 1 ? t('enemyShipsDestroyed') : t('enemyShipDestroyed')}. +${formatValue(reward)} QC.`;
          
          if (next.isGroupBattle) {
            const resources: (keyof typeof voidResources)[] = ['minerals', 'energy', 'food', 'tech', 'meds'];
            const resKey = resources[Math.floor(Math.random() * resources.length)];
            const resAmount = 500 + Math.floor(Math.random() * 501);
            const resNames: Record<string, string> = { 
              minerals: t('minerals'), 
              energy: t('energy'), 
              food: t('food'), 
              tech: t('tech'), 
              meds: t('meds') 
            };
            
            setVoidResources(vr => ({ ...vr, [resKey]: vr[resKey] + resAmount }));
            logMsg += ` ${t('groupBonus')}: +${resAmount} ${resNames[resKey as string]}.`;
          }
          
          addLog(logMsg, 'success');
          playSfx('success');
        } else if (voidBattleShipStatsRef.current.hp <= 0) {
          setVoidBattleStatus('lost');
          addLog(t('defeatShipDamaged'), 'error');
          playSfx('error');
        }

        // 6. Enemy AI
        // Move (1-2s)
        if (now - next.lastEnemyMove > 1000 + Math.random() * 1000) {
          next.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            if (Math.random() < 0.6) {
              enemy.lane = next.playerLane;
            } else {
              const lanes = [0, 1, 2, 3].filter(l => l !== enemy.lane);
              enemy.lane = lanes[Math.floor(Math.random() * lanes.length)];
            }
          });
          next.lastEnemyMove = now;
        }

        // Attack (1-3s)
        if (now - next.lastEnemyAttack > 1000 + Math.random() * 2000) {
          let attacked = false;
          next.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const enemyLaneProjectiles = next.projectiles.filter(p => p.lane === enemy.lane && p.owner === 'enemy');
            if (enemyLaneProjectiles.length < 1) {
              const speed = enemy.type === 'Boss' ? -12 : -5;
              next.projectiles.push({
                id: `ep-${now}-${enemy.id}`,
                lane: enemy.lane,
                x: 90,
                owner: 'enemy',
                damage: enemy.damage,
                speed
              });
              attacked = true;
            }
          });
          if (attacked) next.lastEnemyAttack = now;
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [voidBattleStatus, activeVoidBattle, addLog, formatValue, playSfx]);

  // Void Battle Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (voidBattleStatusRef.current !== 'fighting') return;

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveVoidBattle(prev => {
          if (!prev) return null;
          const nextLane = Math.max(0, prev.playerLane - 1);
          if (nextLane !== prev.playerLane) {
            playSfx('click');
            return { ...prev, playerLane: nextLane };
          }
          return prev;
        });
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveVoidBattle(prev => {
          if (!prev) return null;
          const nextLane = Math.min(3, prev.playerLane + 1);
          if (nextLane !== prev.playerLane) {
            playSfx('click');
            return { ...prev, playerLane: nextLane };
          }
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSfx]);

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

    playSfx('buy');
    addLog(`${t('qcDonationSuccess')} ${VOID_POIS.find(p => p.id === poiId)?.name}.`, 'success');
  };

  const donateToPOI = (poiId: string, resourceName: string) => {
    const resourceMap: { [key: string]: keyof typeof voidResources } = {
      'Minérios': 'minerals',
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

  const compactVoidResource = (resourceKey: keyof typeof voidResources) => {
    const cost = 50000;
    if (voidResources[resourceKey] < cost) {
      addLog(`${t('insufficientRawResources')} ${formatValue(cost)}).`, 'error');
      return;
    }

    setVoidResources(prev => ({ ...prev, [resourceKey]: prev[resourceKey] - cost }));
    setVoidCompactedResources(prev => ({ ...prev, [resourceKey]: prev[resourceKey] + 1 }));
    
    const names: { [key: string]: string } = {
      energy: t('quantumCell'),
      minerals: t('compactedMineralCore'),
      tech: t('multifactorialDataCore'),
      food: t('colonizationRation'),
      meds: t('advancedMedicalKit')
    };
    
    addLog(`${names[resourceKey]} ${t('compactedCreated')}`, 'success');
    playSfx('success');
  };

  const sendCompactedToEarth = (resourceKey: keyof typeof voidCompactedResources) => {
    if (voidCompactedResources[resourceKey] < 1) {
      addLog(t('noCompactedAvailable'), 'error');
      return;
    }

    const mapping: { [key: string]: 'energy' | 'minerals' | 'tech' | 'food' | 'meds' } = {
      minerals: 'minerals',
      energy: 'energy',
      tech: 'tech',
      food: 'food',
      meds: 'meds'
    };

    const category = mapping[resourceKey];
    
    setVoidCompactedResources(prev => ({ ...prev, [resourceKey]: prev[resourceKey] - 1 }));
    setEarthReconstructionProgress(prev => {
      const current = prev[category];
      const next = Math.min(100, current + 5); // 5% per compacted unit for faster testing/progression
      if (next >= 100 && current < 100) {
        addLog(`${t('massiveContribution')} ${category} ${t('earthCategoryReached100')}`, 'success');
      }
      return { ...prev, [category]: next };
    });

    addLog(`${t('resourceSentToEarth')} ${category} ${t('increased')}`, 'success');
    playSfx('success');
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
                  &quot;Olá, esse é seu ponto de diversão, relembre clássicos com uma pitada de novidades. Ganhe conquistas, melhore suas pontuações, aqui a diversão não tem limites.&quot;
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
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40">
                    <Globe className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">{t('restoration')}</h2>
                    <p className="text-[14px] text-emerald-400/60 font-mono uppercase tracking-widest">{t('projectEarthGoals')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRestorationModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Robot Section */}
                <div className="flex items-start gap-6 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shrink-0 animate-float">
                    <Bot className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-orbitron text-emerald-400 uppercase tracking-widest">Robot Assistant</span>
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
              onClick={() => setShowRobotModal(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg glass-panel border-2 ${isRobotRepaired ? 'border-emerald-500/30' : 'border-red-500/30'} rounded-3xl p-8 overflow-hidden`}
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <motion.div
                      animate={isRobotRepaired ? {} : { 
                        opacity: [1, 0.5, 1],
                        rotate: [0, -2, 2, 0],
                        x: [0, -1, 1, 0]
                      }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                      className={`p-4 rounded-2xl ${isRobotRepaired ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
                    >
                      <Bot className={`w-12 h-12 ${isRobotRepaired ? 'text-emerald-400' : 'text-red-400'}`} />
                    </motion.div>
                    {!isRobotRepaired && (
                      <motion.div
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0.8, 1.2, 0.8],
                          x: [0, 10, -10, 0],
                          y: [0, -10, 10, 0]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="absolute -top-2 -right-2 text-yellow-400"
                      >
                        <Zap className="w-6 h-6 fill-current blur-[2px]" />
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">{t('robotRepairHeader')}</h2>
                    <p className="text-white/40 text-[14px] font-mono uppercase tracking-widest">
                      ID: RD-2024-X • {isRobotRepaired ? t('status') + ': OK' : t('status') + ': CRITICAL ERROR'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRobotModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className={`p-6 rounded-2xl border ${isRobotRepaired ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'} min-h-[120px]`}>
                  {!isRobotRepaired ? (
                    <GlitchText 
                      key="glitch"
                      text={t('robotGlitchedDialogue')} 
                      className="text-red-200/80 font-mono text-base leading-relaxed whitespace-pre-wrap"
                      delay={40}
                    />
                  ) : (
                    <GlitchText 
                      key="clean"
                      text={t('robotRepairedDialogue')} 
                      className="text-emerald-200/80 font-mono text-base leading-relaxed whitespace-pre-wrap"
                      delay={20}
                    />
                  )}
                </div>

                {!isRobotRepaired && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-base font-mono uppercase tracking-widest text-white/40">
                      <span>{t('repairProgress')}</span>
                      <span className="text-red-400 font-orbitron">{robotRepairProgress}%</span>
                    </div>
                    <div className="h-4 bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
                      <motion.div 
                        animate={{ width: `${robotRepairProgress}%` }}
                        className="h-full bg-gradient-to-r from-red-600 to-red-400"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-full flex justify-between px-2">
                          {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-2 bg-white" />)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <button
                        onClick={handleRepairRobot}
                        disabled={robotRepairProgress >= 100}
                        className="flex-1 py-4 bg-red-600 text-white font-orbitron font-black rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                      >
                        <Wrench className="w-5 h-5" />
                        {t('repairButton')}
                      </button>
                      <div className="text-base space-y-1 font-mono uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-3 h-3 ${voidResources.energy >= 500 ? 'text-yellow-400' : 'text-red-400'}`} />
                          500 {t('energy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className={`w-3 h-3 ${voidResources.tech >= 500 ? 'text-cyan-400' : 'text-red-400'}`} />
                          500 {t('tech')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isRobotRepaired && (
                  <button
                    onClick={() => {
                      setShowRobotModal(false);
                      setShowBattleShipUpgradeModal(true);
                    }}
                    className="w-full py-4 bg-emerald-600 text-white font-orbitron font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                  >
                    <ArrowRight className="w-5 h-5" />
                    {t('continue')}
                  </button>
                )}
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
              onClick={() => setShowBattleShipUpgradeModal(false)}
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
                  onClick={() => setShowBattleShipUpgradeModal(false)}
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
                    &quot;O Projeto Terra começa com a purificação do Vazio. Sua nave agora é um instrumento de justiça galáctica.&quot;
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
      { name: { en: 'Epsilon Asteroid Belt', pt: 'Cinturão de Asteroides de Épsilon' }, zone: { en: 'Alpha Zone', pt: 'Zona Alpha' }, boss: 'Vanguard Alpha' },
      { name: { en: 'Blood Nebula', pt: 'Nebulosa de Sangue' }, zone: { en: 'Outer Rim', pt: 'Borda Externa' }, boss: 'Nebula Phantom' },
      { name: { en: 'Debris Belt', pt: 'Cinturão de Destroços' }, zone: { en: 'Scrap Yard', pt: 'Pátio de Sucata' }, boss: 'Scrap Tyrant' },
      { name: { en: 'Gravitational Abyss', pt: 'Abismo Gravitacional' }, zone: { en: 'Event Horizon Area', pt: 'Área do Horizonte de Eventos' }, boss: 'Gravity Reaper' },
      { name: { en: 'Star Fortress', pt: 'Fortaleza Estelar' }, zone: { en: 'Command Center', pt: 'Centro de Comando' }, boss: 'Iron Commander' },
      { name: { en: 'Quantum Rift', pt: 'Fenda Quântica' }, zone: { en: 'Dimensional Tear', pt: 'Ruptura Dimensional' }, boss: 'Quantum Shard' },
      { name: { en: 'Event Horizon', pt: 'Horizonte de Eventos' }, zone: { en: 'The Brink', pt: 'A Beira' }, boss: 'Event Horizon Archon' },
      { name: { en: 'Deep Void', pt: 'Vazio Profundo' }, zone: { en: 'The Silence', pt: 'O Silêncio' }, boss: 'Void Stalker' },
      { name: { en: 'The Heart of Darkness', pt: 'O Coração da Escuridão' }, zone: { en: 'Ultimate Singularity', pt: 'Singularidade Final' }, boss: 'The Void Entity' },
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

      // Start battle with modified stats
      startVoidBattle(type);
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

              <div className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {sectors.map(sector => {
                    const isCurrent = sector.id === voidWarProgress.currentSector;
                    const isCleared = sector.id < voidWarProgress.currentSector;
                    
                    return (
                      <motion.div 
                        key={sector.id}
                        whileHover={!sector.locked ? { scale: 1.02, y: -2 } : {}}
                        className={`relative aspect-[3/2] rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer overflow-hidden group ${
                          isCleared ? 'bg-emerald-500/10 border-emerald-500/40' :
                          isCurrent ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]' :
                          'bg-white/5 border-white/10 opacity-60'
                        }`}
                        onClick={() => !sector.locked && startWarBattle(sector.id)}
                      >
                        {/* Shine Effect for Locked Cards */}
                        {sector.locked && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full pointer-events-none"
                            animate={{
                              translateX: ["-100%", "200%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: sector.id * 0.4
                            }}
                          />
                        )}

                        {isCleared ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : sector.locked ? (
                          <Lock className="w-6 h-6 text-white/20" />
                        ) : (
                          <div className="relative">
                            <Crosshair className="w-6 h-6 text-red-500 animate-spin-slow" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[15px] font-black text-white">{voidWarProgress.currentBattle + 1}/5</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-center z-10 w-full px-1">
                          <h3 className="font-orbitron font-black text-white text-base uppercase tracking-wider leading-none mb-1 truncate">{sector.name}</h3>
                          <div className="flex flex-col gap-0 mb-1">
                            <p className="text-[6px] font-mono text-cyan-400/80 uppercase tracking-tighter truncate">
                              {language === 'pt' ? 'ZONA' : 'ZONE'}: {sector.zone}
                            </p>
                            <p className="text-[6px] font-mono text-rose-400/80 uppercase tracking-tighter truncate">
                              BOSS: {sector.boss}
                            </p>
                          </div>
                          <p className={`text-[14px] font-mono uppercase tracking-widest leading-none ${isCleared ? 'text-emerald-400' : isCurrent ? 'text-red-500' : 'text-white/40'}`}>
                            {isCleared ? t('cleared') : sector.locked ? t('lockedSector') : t('battleProgress')}
                          </p>
                        </div>

                        {isCurrent && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/20">
                            <motion.div 
                              className="h-full bg-red-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${(voidWarProgress.currentBattle / 5) * 100}%` }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderVoidEarth = () => {
    const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + b, 0) / 5;
    const isComplete = totalProgress >= 100;

    const resourceNodes = [
      { id: 'energy', name: 'Células Quânticas', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5' },
      { id: 'minerals', name: 'Núcleos Minerais Compactados', icon: Database, color: 'text-orange-400', border: 'border-orange-400/20', bg: 'bg-orange-400/5' },
      { id: 'tech', name: 'Núcleos de Dados Multifatoriais', icon: Cpu, color: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/5' },
      { id: 'food', name: 'Rações de Colonização', icon: Coffee, color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5' },
      { id: 'meds', name: 'Kits Médicos Avançados', icon: Activity, color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/5' }
    ];

    return (
      <div className="space-y-4">
        <div className="glass-panel border-2 border-emerald-500/30 rounded-2xl p-6 bg-gradient-to-br from-emerald-500/10 via-black/60 to-black relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] bg-black/40">
                <Globe className={`w-10 h-10 ${isComplete ? 'text-emerald-400 animate-pulse' : 'text-emerald-500/40'}`} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-2xl font-orbitron font-black text-white tracking-[0.2em] uppercase">{t('earthProject')}</h2>
                <p className="text-[14px] text-emerald-400/60 font-mono uppercase tracking-[0.2em]">{t('biosphereRestoration')}</p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex justify-between items-end text-[15px] font-orbitron text-emerald-400 uppercase tracking-widest">
                <span>{t('globalReconstructionProgress')}</span>
                <span className="text-lg font-bold">{totalProgress.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-black/60 rounded-full border-2 border-emerald-500/20 overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-white shadow-[0_0_20px_rgba(16,185,129,0.6)] rounded-full"
                />
              </div>
            </div>

            {isComplete ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <button 
                  onClick={() => setShowRestorationModal(true)}
                  className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-black text-xl rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95"
                >
                  {t('restoration')}
                </button>
                <p className="mt-2 text-emerald-400 font-orbitron text-base uppercase tracking-widest animate-pulse">{t('hopeSymbol')}</p>
              </motion.div>
            ) : (
              <div className="pt-2">
                <button 
                  onClick={() => setShowRestorationModal(true)}
                  className="inline-block px-8 py-3 bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 font-orbitron font-black text-xl rounded-xl hover:bg-emerald-500/30 transition-all active:scale-95"
                >
                  {t('restoration')}
                </button>
                <p className="mt-2 text-white/40 font-mono text-base uppercase tracking-widest">{t('waitingNoduleInit')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {resourceNodes.map(node => {
            const progress = earthReconstructionProgress[node.id];
            const isNodeComplete = progress >= 100;
            return (
              <div key={node.id} className={`glass-panel border p-3 rounded-xl flex flex-col gap-2.5 transition-all relative overflow-hidden ${isNodeComplete ? 'border-emerald-500/40 bg-emerald-500/5' : `border-white/5 ${node.bg} hover:border-white/20`}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${node.color}`}>
                      <node.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-orbitron font-bold text-white uppercase tracking-wider leading-tight">{node.name}</h4>
                      <p className="text-[14px] text-white/40 uppercase tracking-widest">{t('captureNodule')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-orbitron font-bold ${isNodeComplete ? 'text-emerald-400' : 'text-white'}`}>{progress.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full bg-gradient-to-r ${isNodeComplete ? 'from-emerald-600 to-emerald-400' : 'from-white/20 to-white/60'}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-white/40 uppercase tracking-widest font-mono">
                    {isNodeComplete ? t('syncComplete') : t('waitingCompactedResources')}
                  </span>
                  {isNodeComplete && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEarthSidebar = () => {
    const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b: any) => a + (typeof b === 'number' ? b : 0), 0) / 5;
    const isComplete = totalProgress >= 100;
    const last5Events = earthEvents.slice(0, 5);

    return (
      <div className={`glass-panel border-2 ${isComplete ? 'border-emerald-500/50' : 'border-emerald-500/20'} rounded-xl flex-1 flex flex-col overflow-hidden bg-emerald-500/5 transition-all duration-500`}>
        {/* Header with Project Name and Progress */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-white/5">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-orbitron font-bold tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
              <Globe className={`w-3 h-3 ${isComplete ? 'animate-pulse' : ''}`} /> {t('earthProject')}
            </h2>
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[14px] font-mono text-emerald-500/80 uppercase tracking-widest font-bold">
                {language === 'pt' ? 'AO VIVO' : 'LIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/20">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-2.5 h-2.5 text-emerald-400" />
                {language === 'pt' ? 'Ano Atual' : 'Current Year'}
              </span>
              <span className="text-base font-mono font-black text-white tracking-widest">
                {gameTime.years}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-2.5 h-2.5 text-cyan-400" />
                {language === 'pt' ? 'População Total' : 'Total Population'}
              </span>
              <span className="text-base font-mono font-black text-white tracking-widest">
                {formatValue(Math.floor(totalHumanPopulation))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 col-span-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-2.5 h-2.5 text-emerald-400" />
                  {language === 'pt' ? 'Biodiversidade' : 'Biodiversity'}
                </span>
                <span className="text-[14px] font-mono font-black text-emerald-400">{earthBiodiversity.toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${earthBiodiversity}%` }}
                  className="h-full bg-emerald-500"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Event History */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[15px] font-orbitron text-white/30 uppercase tracking-[0.2em] px-1">
              <HistoryIcon className="w-3 h-3" />
              {language === 'pt' ? 'Histórico de Eventos' : 'Event History'}
            </div>
            
            <div className="space-y-2">
              {last5Events.length === 0 ? (
                <div className="text-[15px] font-mono text-white/10 italic text-center py-4 border border-dashed border-white/5 rounded-xl">
                  {language === 'pt' ? 'Aguardando simulação...' : 'Waiting for simulation...'}
                </div>
              ) : (
                last5Events.map((event, idx) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-xl transition-all group ${event.isFixed ? `${event.specialStyles.bg} ${event.specialStyles.border} border-2 shadow-[0_0_15px_rgba(0,0,0,0.3)]` : 'bg-white/5 border border-white/5 hover:border-emerald-500/20'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-base font-bold uppercase tracking-tight transition-colors ${event.isFixed ? event.specialStyles.color : 'text-emerald-400/80 group-hover:text-emerald-400'}`}>
                        {event.name}
                      </span>
                      <span className="text-[14px] font-mono text-white/20">
                        {language === 'pt' ? 'ANO' : 'YEAR'} {event.year}
                      </span>
                    </div>
                    <p className={`text-[15px] leading-relaxed italic ${event.isFixed ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                      {event.description}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVoidWarCore = () => {
    const reservoirs = [
      { id: 'energy', name: 'Células Quânticas', raw: 'Energia', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
      { id: 'minerals', name: 'Núcleos Minerais Compactados', raw: 'Minérios', icon: Database, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
      { id: 'food', name: 'Rações de Colonização', raw: 'Alimentos', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
      { id: 'meds', name: 'Kits Médicos Avançados', raw: 'Medicamentos', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
      { id: 'tech', name: 'Núcleos de Dados Multifatoriais', raw: 'Tecnologia', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' }
    ];

    return (
      <div className="space-y-4">
        <div className="glass-panel border-2 border-cyan-500/30 rounded-xl p-3 bg-gradient-to-br from-cyan-500/10 via-black/60 to-black relative overflow-hidden">
          <div className="flex flex-row items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-float">
                <Home className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Globe className="w-2.5 h-2.5 text-black" />
              </div>
            </div>
            <div className="flex-1 space-y-0 text-left">
              <h2 className="text-base font-orbitron font-black text-white tracking-widest uppercase leading-none">{t('colonizationCore')}</h2>
              <p className="text-[15px] text-cyan-400/60 font-mono uppercase tracking-[0.2em]">{t('finalPreparationEarth')}</p>
              <p className="text-[14px] text-white/40 max-w-2xl leading-tight">
                {t('colonizationCoreDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {reservoirs.map(res => {
            const rawAmount = voidResources[res.id as keyof typeof voidResources];
            const compactedAmount = voidCompactedResources[res.id as keyof typeof voidCompactedResources];
            const canCompact = rawAmount >= 50000;

            return (
              <div key={res.id} className={`glass-panel border p-2 rounded-xl flex flex-col gap-1.5 transition-all relative overflow-hidden ${res.border} ${res.bg} ${res.id === 'tech' ? 'md:col-span-2' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-black/40 border ${res.border} ${res.color}`}>
                      <res.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-base font-orbitron font-bold text-white uppercase tracking-wider leading-tight">{res.name}</h4>
                      <p className="text-[14px] text-white/40 uppercase tracking-widest leading-none">{t('reservoirOf')} {res.raw}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0">
                      <span className="text-[7px] text-white/40 uppercase tracking-widest">{t('rawResource')}</span>
                      <div className="text-base font-orbitron font-bold text-white">{formatValue(rawAmount)}</div>
                    </div>
                    <div className="text-right space-y-0">
                      <span className="text-[7px] text-white/40 uppercase tracking-widest">{t('compacted')}</span>
                      <div className={`text-base font-orbitron font-bold ${res.color}`}>{compactedAmount}</div>
                    </div>
                  </div>

                  <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (rawAmount / 50000) * 100)}%` }}
                      className={`h-full bg-gradient-to-r from-white/20 to-white/60`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => compactVoidResource(res.id as any)}
                      disabled={!canCompact}
                      className={`flex-1 py-1.5 rounded-lg font-orbitron font-bold text-[14px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                        canCompact ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/40 border border-white/10'
                      }`}
                    >
                      {t('compact')} (50k)
                    </button>
                    <button
                      onClick={() => sendCompactedToEarth(res.id as any)}
                      disabled={compactedAmount <= 0}
                      className={`flex-1 py-1.5 rounded-lg font-orbitron font-bold text-[14px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border ${
                        compactedAmount > 0 ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      {t('sendToEarth')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVoidMap = () => {
    const getPOIColor = (id: string) => {
      switch(id) {
        case 'poi-1': return 'cyan';
        case 'poi-2': return 'orange';
        case 'poi-3': return 'purple';
        case 'poi-4': return 'emerald';
        default: return 'cyan';
      }
    };

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {VOID_POIS.map(poi => {
            const poiStats = voidPOIsInspiration[poi.id] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
            const totalProgress = Object.values(poiStats).reduce((a, b) => a + b, 0);
            const isInspired = totalProgress >= 100;
            const color = getPOIColor(poi.id);
            const colorClasses = {
              cyan: 'neon-border-cyan bg-cyan-500/5 text-cyan-400 border-cyan-500/40',
              orange: 'neon-border-orange bg-orange-500/5 text-orange-400 border-orange-500/40',
              purple: 'neon-border-purple bg-purple-500/5 text-purple-400 border-purple-500/40',
              emerald: 'neon-border-emerald bg-emerald-500/5 text-emerald-400 border-emerald-500/40'
            };

            return (
              <div key={poi.id} className={`glass-panel border-2 rounded-xl p-2.5 flex flex-col gap-2 relative overflow-hidden ${isInspired ? 'neon-border-emerald bg-emerald-500/5' : colorClasses[color as keyof typeof colorClasses]}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-0 text-left">
                    <h3 className="text-base font-orbitron font-black text-white tracking-widest uppercase leading-none">{poi.name}</h3>
                    <p className="text-[15px] text-white/60 font-mono uppercase tracking-widest leading-none max-w-sm line-clamp-1 mt-1">{poi.lore}</p>
                  </div>
                  <button 
                    onClick={() => setActiveDonationModal(poi.id)}
                    className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 shrink-0 ${isInspired ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : `bg-${color}-500/20 border-${color}-500/40 text-${color}-400`}`}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="text-[14px] text-white/40 uppercase tracking-widest leading-none">{t('locationStatus')}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isInspired ? 'bg-emerald-400' : `bg-${color}-400 animate-pulse`}`} />
                        <span className="text-[14px] font-orbitron font-bold text-white uppercase leading-none">{isInspired ? t('inspired') : t('waitingHelp')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] text-white/40 uppercase tracking-widest leading-none">{t('confidenceInspiration')}</span>
                      <div className="text-base font-orbitron font-bold text-white leading-none mt-0.5">{totalProgress.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      className={`h-full bg-gradient-to-r ${isInspired ? 'from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : `from-${color}-600 to-${color}-400 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}`}
                    />
                  </div>

                  {isInspired && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="leading-tight">
                          <p className="text-[7px] text-emerald-400/60 uppercase tracking-widest font-bold">{t('activeStatus')}</p>
                          <p className="text-base font-orbitron font-bold text-white">{t('contributingToEarth')}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Minérios', icon: Pickaxe, key: 'minerals' },
                      { label: 'Energia', icon: Zap, key: 'energy' },
                      { label: 'Alimentos', icon: Coffee, key: 'food' },
                      { label: 'Tecnologia', icon: Cpu, key: 'tech' },
                      { label: 'Medicamentos', icon: Activity, key: 'meds' },
                      { label: 'QC doado', icon: Coins, key: 'qc' }
                    ].map(res => {
                      if (res.key === 'qc') {
                        const qcLevel = voidPOIQCDonations[poi.id] || 0;
                        const isMax = qcLevel >= 10;
                        const canAfford = qc >= 100000 && !isMax;

                        return (
                          <button
                            key={res.label}
                            onClick={() => donateQCToPOI(poi.id)}
                            disabled={!canAfford}
                            className={`flex flex-col items-center justify-center gap-0.5 py-2 px-0.5 border rounded-lg transition-all text-[15px] font-orbitron font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden ${
                              isMax
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20'
                            }`}
                          >
                            <res.icon className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${isMax ? 'text-emerald-400' : 'text-yellow-400'}`} />
                            <span>{res.label}</span>
                            <span className={`text-[7px] ${isMax ? 'text-emerald-400/60' : 'text-yellow-400/60'}`}>
                              {isMax ? 'MÁXIMO' : `LVL ${qcLevel}/10`}
                            </span>
                            
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40">
                              <div 
                                className={`h-full transition-all duration-500 ${isMax ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                style={{ width: `${(qcLevel / 10) * 100}%` }}
                              />
                            </div>
                          </button>
                        );
                      }

                      const isPrimary = res.label === poi.need;
                      const resProgress = poiStats[res.key] || 0;
                      const isResMax = resProgress >= 20 || isInspired;
                      const canDonate = voidResources[res.key as keyof typeof voidResources] >= 10 && !isResMax;

                      return (
                        <button
                          key={res.label}
                          onClick={() => donateToPOI(poi.id, res.label)}
                          disabled={!canDonate}
                          className={`flex flex-col items-center justify-center gap-0.5 py-2 px-0.5 border rounded-lg transition-all text-[15px] font-orbitron font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden ${
                            isResMax
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : isPrimary 
                                ? `bg-${color}-500/10 border-${color}-500/40 text-${color}-400 hover:bg-${color}-500/20` 
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          <res.icon className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${isResMax ? 'text-emerald-400' : isPrimary ? `text-${color}-400` : 'text-white/40'}`} />
                          <span>{res.label}</span>
                          <span className={`text-[7px] ${isResMax ? 'text-emerald-400/60' : isPrimary ? `text-${color}-400/60` : 'text-white/40'}`}>
                            {isResMax ? 'MÁXIMO' : `+${(isPrimary ? 0.2 : 0.1) * (voidDonationModes[poi.id] === '10x' ? 10 : 1)}%`}
                          </span>
                          
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40">
                            <div 
                              className={`h-full transition-all duration-500 ${isResMax ? 'bg-emerald-500' : isPrimary ? `bg-${color}-500` : 'bg-white/40'}`}
                              style={{ width: `${(isResMax ? 20 : resProgress) / 20 * 100}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {renderDonationModal()}
      </div>
    );
  };

  const renderDonationModal = () => {
    if (!activeDonationModal) return null;
    const poi = VOID_POIS.find(p => p.id === activeDonationModal);
    if (!poi) return null;

    const currentMode = voidDonationModes[activeDonationModal] || '1x';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel border-2 neon-border-purple p-8 rounded-3xl max-w-md w-full space-y-6 relative"
        >
          <button 
            onClick={() => setActiveDonationModal(null)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-orbitron font-black text-white uppercase tracking-tighter">{poi.name}</h3>
            <p className="text-[14px] text-slate-400 uppercase tracking-widest">{language === 'pt' ? 'Configurações de Doação' : 'Donation Settings'}</p>
          </div>

          <div className="space-y-4">
            {[
              { id: '1x', label: language === 'pt' ? '1 clique = 1 doação' : '1 click = 1 donation' },
              { id: '10x', label: language === 'pt' ? '1 clique = 10 doações' : '1 click = 10 donations' },
              { id: 'max', label: language === 'pt' ? '1 clique = máximo de doações' : '1 click = maximum donations' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setVoidDonationModes(prev => ({ ...prev, [activeDonationModal]: option.id as any }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  currentMode === option.id 
                    ? 'bg-purple-500/20 border-purple-500/50 text-white' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="font-orbitron text-base font-bold uppercase tracking-widest">{option.label}</span>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                  currentMode === option.id ? 'border-purple-400 bg-purple-400' : 'border-slate-700'
                }`}>
                  {currentMode === option.id && <Check size={16} className="text-black" />}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveDonationModal(null)}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-orbitron font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
          >
            {language === 'pt' ? 'Confirmar' : 'Confirm'}
          </button>
        </motion.div>
      </div>
    );
  };

  const renderVoidBattleArena = () => {
    if (!activeVoidBattle) return null;
    const { enemies, playerLane, projectiles, isGroupBattle } = activeVoidBattle;
    const playerStats = voidBattleShipStats;
    
    // For the header, show the first alive enemy or the first one if all dead
    const displayEnemy = enemies.find(e => e.hp > 0) || enemies[0];

    return (
      <div className="h-[450px] lg:h-[420px] glass-panel border border-white/10 rounded-2xl flex flex-col overflow-hidden bg-black relative">
        {/* Background Stars */}
        <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
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

        {/* Header Stats */}
        <div className="p-3 border-b border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
          <div className="space-y-1">
            <p className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest leading-none">{t('yourShip')}</p>
            <div className="flex gap-1.5">
              <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(playerStats.shield / playerStats.maxShield) * 100}%` }} />
              </div>
              <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="text-center">
             <div className={`text-[15px] font-orbitron font-bold ${isGroupBattle ? 'text-yellow-500' : 'text-red-500'} animate-pulse tracking-[0.2em] leading-none`}>
               {isGroupBattle ? t('groupBattle').toUpperCase() : t('realTimeCombat').toUpperCase()}
             </div>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest leading-none">
              {isGroupBattle ? `${t('enemyGroup')} (${enemies.filter(e => e.hp > 0).length})` : `${displayEnemy.type}`}
            </p>
            <div className="flex gap-1.5 justify-end">
              <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(displayEnemy.hp / displayEnemy.maxHp) * 100}%` }} />
              </div>
              <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(displayEnemy.shield / displayEnemy.maxShield) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Lanes */}
        <div className="flex-1 relative p-4 flex flex-col justify-between min-h-0">
          {[0, 1, 2, 3].map(lane => (
            <div 
              key={lane} 
              onClick={() => moveVoidPlayer(lane)}
              className={`h-16 lg:h-14 border-y border-white/5 relative flex items-center cursor-pointer transition-all ${playerLane === lane ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
            >
              {/* Lane Rail */}
              <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Player Ship */}
              {playerLane === lane && (
                <motion.div 
                  layoutId="player-ship"
                  className="absolute left-6 z-20"
                >
                  <div className="w-10 h-10 bg-cyan-500/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <Rocket className="w-5 h-5 text-cyan-400" />
                  </div>
                </motion.div>
              )}

              {/* Enemy Ships */}
              {enemies.filter(e => e.lane === lane && e.hp > 0).map((enemy, idx) => (
                <motion.div 
                  key={enemy.id}
                  layoutId={enemy.id}
                  className="absolute right-6 z-20"
                  style={{ marginRight: `${idx * 8}px` }} 
                >
                  <div className={`w-10 h-10 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] ${enemy.type === 'Boss' ? 'scale-110' : ''}`}>
                    <Sword className="w-5 h-5 text-red-400 rotate-180" />
                  </div>
                  {/* Small HP bar for each enemy in group */}
                  {isGroupBattle && (
                    <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-black/60 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Projectiles */}
              {projectiles.filter(p => p.lane === lane).map(p => (
                <motion.div
                  key={p.id}
                  initial={false}
                  animate={{ left: `${p.x}%` }}
                  transition={{ duration: 0.05, ease: "linear" }}
                  className={`absolute w-6 h-0.5 rounded-full z-10 ${p.owner === 'player' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]' : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,1)]'}`}
                >
                  {p.isCrit && <div className="absolute inset-0 bg-white animate-ping rounded-full" />}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
          <div className="flex gap-3">
            <button 
              onClick={() => moveVoidPlayer(Math.max(0, playerLane - 1))}
              disabled={playerLane === 0}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-20"
            >
              <ChevronUp className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => moveVoidPlayer(Math.min(3, playerLane + 1))}
              disabled={playerLane === 3}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-20"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>

          <button 
            onClick={voidPlayerAttack}
            className="px-10 py-3 bg-red-600 text-white font-orbitron font-black text-lg rounded-xl hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 uppercase tracking-[0.2em]"
          >
            {t('attack')}
          </button>

          <div className="w-20" />
        </div>
      </div>
    );
  };

  const renderVoidBattleShip = () => {
    const stats = voidBattleShipStats;
    
    // Apply rarity bonuses to display stats
    const rarityBonus = {
      common: 0,
      rare: 0.05,
      elite: 0.10,
      legendary: 0.15,
      mythic: 0.20
    }[stats.rarity] || 0;

    const effectiveStats = {
      ...stats,
      damage: stats.damage * (1 + rarityBonus),
      maxHp: stats.maxHp * (1 + rarityBonus),
      maxShield: stats.maxShield * (1 + rarityBonus),
      critChance: stats.critChance * (1 + rarityBonus)
    };

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

    const costs = [
      { tech: 10, energy: 100, minerals: 150 },
      { tech: 25, energy: 150, minerals: 250 },
      { tech: 40, energy: 200, minerals: 350 },
      { tech: 55, energy: 250, minerals: 450 },
      { tech: 80, energy: 300, minerals: 550 }
    ];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {voidBattleOptions.map(enemy => (
              <div key={enemy.id} className="glass-panel border border-white/10 rounded-xl p-3 space-y-3 bg-gradient-to-br from-red-500/5 to-black hover:border-red-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-orbitron font-bold tracking-widest uppercase ${
                    enemy.type === 'Boss' ? 'bg-red-500 text-black' : enemy.type === 'Elite' ? 'bg-orange-500 text-black' : 'bg-white/10 text-white'
                  }`}>
                    {enemy.type}
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] text-white/40 uppercase tracking-widest leading-none">{t('qcInPossession')}</p>
                    <p className="text-[14px] font-orbitron font-bold text-yellow-400">{formatValue(enemy.qc)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between text-[15px] font-mono leading-none">
                     <span className="text-white/40">ESCUDO</span>
                     <span className="text-cyan-400">{enemy.maxShield}</span>
                   </div>
                   <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full bg-cyan-500" style={{ width: '100%' }} />
                   </div>
                   <div className="flex justify-between text-[15px] font-mono leading-none">
                     <span className="text-white/40">CASCO</span>
                     <span className="text-red-400">{enemy.maxHp}</span>
                   </div>
                   <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full bg-red-500" style={{ width: '100%' }} />
                   </div>
                </div>

                <button 
                  onClick={() => selectVoidBattle(enemy)}
                  className="w-full py-2 bg-red-600 text-white font-orbitron font-black text-base rounded-lg hover:bg-red-500 transition-all uppercase tracking-widest shadow-lg group-hover:scale-[1.02] active:scale-95"
                >
                  {t('attackTarget')}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (voidBattleStatus === 'fighting' && activeVoidBattle) {
      return renderVoidBattleArena();
    }

    if (voidBattleStatus === 'won' || voidBattleStatus === 'lost') {
      return (
        <div className="h-[450px] lg:h-[400px] glass-panel border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-6 bg-black/60">
           <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${voidBattleStatus === 'won' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
             {voidBattleStatus === 'won' ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
           </div>
           <div className="text-center space-y-2">
             <h3 className={`text-3xl font-orbitron font-black tracking-[0.2em] uppercase ${voidBattleStatus === 'won' ? 'text-emerald-400' : 'text-red-400'}`}>
               {voidBattleStatus === 'won' ? t('victory') : t('defeat')}
             </h3>
             {voidBattleStatus === 'won' && voidBattleResult && (
               <div className="space-y-1">
                 <p className="text-base font-orbitron text-white">+{formatValue(voidBattleResult.reward)} QC</p>
               </div>
             )}
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
      <div className="space-y-4">
        <div className={`glass-panel border-2 rounded-xl p-4 relative overflow-hidden transition-all duration-700 ${rStyle.container}`}>
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
              className="absolute inset-0 opacity-50 pointer-events-none"
            />
          )}
          <div className="flex flex-col lg:flex-row gap-4 items-center relative z-10">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${rStyle.swordContainer}`}>
                {stats.rarity === 'legendary' && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Flame className="w-24 h-24 text-orange-500/30 blur-md" />
                  </motion.div>
                )}
                <Sword className={`w-16 h-16 animate-pulse transition-all duration-700 ${rStyle.sword}`} />
              </div>
              <div className={`absolute -bottom-2 -right-2 font-orbitron font-black px-4 py-1 rounded-full text-[14px] shadow-lg transition-all duration-700 ${rStyle.badge}`}>
                {t('battleReady')}
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <h2 className={`text-3xl font-orbitron font-black tracking-widest uppercase transition-all duration-700 ${
                      stats.rarity === 'rare' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' :
                      stats.rarity === 'elite' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                      stats.rarity === 'legendary' ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                      stats.rarity === 'mythic' ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' :
                      'text-white'
                    }`}>
                      {t('battleShip')} {
                        stats.rarity === 'rare' ? '(Rara)' :
                        stats.rarity === 'elite' ? '(Épica)' :
                        stats.rarity === 'legendary' ? '(Lendária)' :
                        stats.rarity === 'mythic' ? '(Mítica)' :
                        '(Comum)'
                      }
                    </h2>

                    <div className="flex gap-2 ml-4">
                      {hasWonEliminateEnemiesRoute3 && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowRobotModal(true)}
                          className={`px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-base font-orbitron text-red-400 hover:bg-red-500/20 transition-all uppercase tracking-widest flex items-center gap-2 relative ${!isRobotRepaired ? 'animate-pulse' : ''}`}
                        >
                          <Bot className={`w-3 h-3 ${!isRobotRepaired ? 'animate-bounce' : ''}`} />
                          {t('defectiveRobot')}
                          {!isRobotRepaired && (
                            <motion.div
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                            />
                          )}
                        </motion.button>
                      )}

                      {isRobotRepaired && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowBattleShipUpgradeModal(true)}
                          className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-base font-orbitron text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase tracking-widest flex items-center gap-2 group relative overflow-hidden"
                        >
                          <Zap className="w-3 h-3 group-hover:scale-125 transition-transform" />
                          {t('upgradeBattleShip')}
                          <motion.div
                            animate={{ 
                              x: ['-100%', '200%'],
                              opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                          />
                        </motion.button>
                      )}
                    </div>
                    
                    {stats.upgrades.damage >= 5 && stats.upgrades.shield >= 5 && stats.upgrades.crit >= 5 && stats.upgrades.loot >= 5 && stats.rarity !== 'mythic' && (
                      <button
                        onClick={upgradeVoidBattleShipRarity}
                        className="ml-4 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-base font-orbitron text-white hover:bg-white/20 transition-all uppercase tracking-widest flex flex-col items-center"
                      >
                        <span className="text-[14px] opacity-60">UPGRADE</span>
                        {stats.rarity === 'common' ? '5k T/E' : stats.rarity === 'rare' ? '10k T/E' : stats.rarity === 'elite' ? '15k T/E' : '20k T/E'}
                      </button>
                    )}
                  </div>
                  <p className={`text-[14px] font-mono uppercase tracking-[0.2em] transition-all duration-700 ${rStyle.subtext}`}>{t('sovereignOfVoid')}</p>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <span className={`text-base uppercase tracking-widest ${stats.rarity === 'mythic' ? 'text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]' : 'text-white/40'}`}>{t('quantumShield')}</span>
                    <div className={`text-lg font-orbitron font-bold transition-all duration-700 ${stats.rarity === 'mythic' ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-cyan-400'}`}>
                      {(stats.shield || 0).toFixed(0)} / {(effectiveStats.maxShield || 1000).toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <span className={`text-base uppercase tracking-widest ${stats.rarity === 'mythic' ? 'text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]' : 'text-white/40'}`}>{t('hullIntegrity')}</span>
                    <div className={`text-xl font-orbitron font-bold transition-all duration-700 ${
                      stats.rarity === 'mythic' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' :
                      hpPercent > 50 ? 'text-emerald-400' : hpPercent > 20 ? 'text-yellow-400' : 'text-red-500'
                    }`}>
                      {(stats.hp || 0).toFixed(0)} / {effectiveStats.maxHp.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${shieldPercent}%` }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  />
                </div>
                <div className="h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${hpPercent}%` }}
                    className={`h-full bg-gradient-to-r ${hpPercent > 50 ? 'from-emerald-600 to-emerald-400' : hpPercent > 20 ? 'from-yellow-600 to-yellow-400' : 'from-red-600 to-red-400'} shadow-[0_0_15px_rgba(239,68,68,0.4)]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('baseDamage'), value: `${(effectiveStats.damage || 100).toFixed(0)}`, icon: Flame, color: 'text-orange-400' },
                  { label: t('criticalDamage'), value: `${((effectiveStats.damage || 100) * 10).toFixed(0)}`, icon: Zap, color: 'text-yellow-400' },
                  { label: t('criticalChance'), value: `${((effectiveStats.critChance || 0.1) * 100).toFixed(0)}%`, icon: Target, color: 'text-red-400' },
                  { label: t('loot'), value: `${((stats.lootEfficiency || 0.8) * 100).toFixed(0)}%`, icon: TrendingUp, color: 'text-emerald-400' }
                ].map(s => (
                  <div key={s.label} className={`bg-white/5 border border-white/10 rounded-xl p-3 space-y-1 transition-all duration-700 ${stats.rarity === 'mythic' ? 'bg-black/40 border-slate-400/20' : ''}`}>
                    <div className="flex items-center gap-2">
                      <s.icon className={`w-3 h-3 ${s.color}`} />
                      <span className={`text-[15px] uppercase tracking-widest ${stats.rarity === 'mythic' ? 'text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]' : 'text-white/40'}`}>{s.label}</span>
                    </div>
                    <div className={`text-lg font-orbitron font-bold transition-all duration-700 ${rStyle.text}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={isVoidWarActive ? () => setShowVoidWarMap(true) : () => startVoidBattle()}
                  disabled={stats.hp <= 0}
                  className={`flex-1 py-3 font-orbitron font-black rounded-xl transition-all active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isVoidWarActive 
                      ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse border-2 border-red-400' 
                      : 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:bg-red-500'
                  }`}
                >
                  {isVoidWarActive ? <Skull className="w-4 h-4" /> : <Crosshair className="w-4 h-4" />}
                  {isVoidWarActive || voidWarAlertActive ? t('eliminateEnemies') : t('searchCombat')}
                </button>
                <button
                  onClick={repairVoidBattleShip}
                  disabled={stats.hp >= getEffectiveVoidStats(stats).maxHp && (stats.shield || 0) >= (getEffectiveVoidStats(stats).maxShield || 1000)}
                  className="px-6 py-3 bg-white/10 text-white font-orbitron font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 active:scale-95 uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed group relative"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[14px]">{t('repair')}</span>
                    <span className="text-[7px] text-white/40 group-hover:text-white/60">
                      {stats.hp < getEffectiveVoidStats(stats).maxHp ? '1.5k Ener | 1.5k Tech' : '1k Ener | 1k Tech'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          {[
            { id: 'damage', name: t('weaponSystem'), desc: `+10% ${t('dmgBonus')}`, icon: Sword, max: 5 },
            { id: 'shield', name: t('reinforcedShields'), desc: `+15% ${t('shield')}`, icon: Shield, max: 5 },
            { id: 'crit', name: t('weaknessScanner'), desc: `+10% ${t('criticalChance')}`, icon: Target, max: 5 },
            { id: 'loot', name: t('avarice'), desc: `+25% Loot QC`, icon: TrendingUp, max: 5 }
          ].map(upg => {
            const maxLevel = upg.max + (battleShipUpgradeLevel * 10);
            const rawLevel = stats.upgrades[upg.id as keyof typeof stats.upgrades];
            const level = rawLevel;
            const isMax = level >= maxLevel;
            
            const getUpgradeCost = (lvl: number) => {
              if (lvl < 5) {
                const baseCosts = [
                  { tech: 100, energy: 100, minerals: 100 },
                  { tech: 350, energy: 350, minerals: 350 },
                  { tech: 600, energy: 600, minerals: 600 },
                  { tech: 850, energy: 850, minerals: 850 },
                  { tech: 1150, energy: 1150, minerals: 1150 }
                ];
                return baseCosts[lvl];
              }
              const mult = lvl - 4;
              return {
                tech: 1150 + mult * 500,
                energy: 1150 + mult * 500,
                minerals: 1150 + mult * 500
              };
            };

            const cost = !isMax ? getUpgradeCost(level) : null;
            const canAfford = cost && (voidResources?.tech || 0) >= cost.tech && (voidResources?.energy || 0) >= cost.energy && (voidResources?.minerals || 0) >= cost.minerals;

            return (
              <button
                key={upg.id}
                onClick={() => upgradeVoidBattleShip(upg.id as any)}
                disabled={isMax || !canAfford || isVoidWarActive || voidWarAlertActive}
                className={`glass-panel border p-6 rounded-xl flex flex-col gap-4 transition-all relative overflow-hidden text-left min-h-[160px] ${isMax ? 'border-emerald-500/30 bg-emerald-500/5' : (canAfford && !isVoidWarActive && !voidWarAlertActive) ? 'border-red-500/20 hover:border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-white/5 opacity-50 grayscale'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <upg.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="text-base font-mono text-red-500/60 font-bold">LVL {level}/{maxLevel}</div>
                </div>
                <div>
                  <h4 className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{upg.name}</h4>
                  <p className="text-[15px] text-white/40 uppercase tracking-widest">{upg.desc}</p>
                </div>
                {!isMax && cost && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <span className="text-[15px] text-white/40 uppercase tracking-widest block">{t('upgradeCost')}</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`text-[15px] font-mono ${(voidResources?.tech || 0) >= cost.tech ? 'text-cyan-400' : 'text-red-400'}`}>{cost.tech} Tech</div>
                      <div className={`text-[15px] font-mono ${(voidResources?.energy || 0) >= cost.energy ? 'text-yellow-400' : 'text-red-400'}`}>{cost.energy} Ener</div>
                      <div className={`text-[15px] font-mono ${(voidResources?.minerals || 0) >= cost.minerals ? 'text-slate-400' : 'text-red-400'}`}>{cost.minerals} Min</div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVoidAircraft = () => {
    return (
      <div className="space-y-6 relative">
        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showVoidAircraftTutorial && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl p-8"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-2xl glass-panel border-2 border-cyan-500/30 p-8 rounded-3xl space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto border border-cyan-500/20 animate-float">
                  <Rocket className="w-10 h-10 text-cyan-400" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">
                    {voidAircraftTutorialStep === 0 ? t('theBeginning') : t('newPossibilities')}
                  </h3>
                  <p className="text-base text-cyan-100/80 font-mono leading-relaxed">
                    {voidAircraftTutorialStep === 0 
                      ? "Aqui é o seu recomeço, devagar, mas importante. Depois de tanta exploração pelo Cosmo afora, restaram poucas opções para seguir em frente, você manteve salvo o projeto: Naves de Buscas. Mas com um pouco de sorte, você foi além, mesmo sem querer... Buscando por restos, sobras, resquícios de minérios... Inúteis... Quase zero de esperança, você se lembrou delas, escondidas, protegidas... Suas naves de buscas, antes inúteis, agora salvação! Com elas você pode... DEVE, buscar recursos onde provavelmente não há, mas ainda há... Esperança!"
                      : "Elas irão procurar minérios diversos, recursos naturais, recursos tecnológicos, recursos biológicos, medicamentos. Você pode melhorar suas naves de buscas com tecnologia, estocagem e uso inteligente de energia."
                    }
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  {voidAircraftTutorialStep === 0 ? (
                    <button 
                      onClick={() => setVoidAircraftTutorialStep(1)}
                      className="px-8 py-3 bg-cyan-500 text-black font-orbitron font-black text-[14px] rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-widest"
                    >
                      {t('next')}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowVoidAircraftTutorial(false)}
                      className="px-8 py-3 bg-emerald-500 text-black font-orbitron font-black text-[14px] rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest"
                    >
                      {t('understood')}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {VOID_AIRCRAFT.map(aircraft => {
            const mission = voidAircraftMissions[aircraft.id];
            const upgrades = voidAircraftUpgrades[aircraft.id];
            const isMission = mission.status === 'mission';
            const timeLeft = isMission && mission.endTime ? Math.max(0, mission.endTime - Date.now()) : 0;
            const currentMissionTime = aircraft.missionTime * (1 - upgrades.time * 0.1);

            return (
              <div key={aircraft.id} className={`glass-panel border-2 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden ${isMission ? 'neon-border-purple' : 'neon-border-cyan'}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-orbitron font-black text-white tracking-tighter uppercase">{aircraft.name}</h3>
                    <p className="text-base text-cyan-400/60 font-mono uppercase tracking-widest leading-tight">{aircraft.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[15px] font-orbitron font-bold tracking-widest uppercase ${isMission ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse-glow' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
                    {isMission ? t('inMission') : t('available')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[15px] text-white/40 uppercase tracking-widest">{t('capacity')}</span>
                    <div className="text-lg font-orbitron font-bold text-white">
                      {Math.floor(aircraft.capacity * (1 + upgrades.storage * 0.2))} <span className="text-base text-cyan-500/60">un</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[15px] text-white/40 uppercase tracking-widest">{t('efficiency')}</span>
                    <div className="text-lg font-orbitron font-bold text-white">
                      {(aircraft.efficiency + upgrades.quality * 10).toFixed(0)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[15px] text-white/40 uppercase tracking-widest">{t('searchTime')}</span>
                    <div className="text-lg font-orbitron font-bold text-white">
                      {formatTime(currentMissionTime)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[15px] text-white/40 uppercase tracking-widest">{t('automatic')}</span>
                    {upgrades.auto === 1 ? (
                      <button
                        onClick={() => toggleVoidAircraftAuto(aircraft.id)}
                        className={`w-full py-1 rounded-lg text-base font-orbitron font-bold transition-all border ${voidAircraftAutoToggles[aircraft.id] ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'}`}
                      >
                        {voidAircraftAutoToggles[aircraft.id] ? t('active') : t('inactive')}
                      </button>
                    ) : (
                      <button
                        onClick={() => buyVoidAircraftAuto(aircraft.id)}
                        className="w-full py-1 rounded-lg text-base font-orbitron font-bold transition-all border bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      >
                        {{ 'va-1': 50, 'va-2': 75, 'va-3': 100 }[aircraft.id as 'va-1' | 'va-2' | 'va-3']}k QC
                      </button>
                    )}
                  </div>
                </div>

                {isMission ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-base font-orbitron text-purple-400 uppercase tracking-widest">
                      <span>{t('missionProgress')}</span>
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-purple-500/20">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentMissionTime - timeLeft) / currentMissionTime) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startVoidMission(aircraft.id)}
                    className="w-full py-4 bg-cyan-500 text-black font-orbitron font-black text-base rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 uppercase tracking-[0.2em]"
                  >
                    {t('startSearch')}
                  </button>
                )}

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <h4 className="text-base font-orbitron font-bold text-white/60 uppercase tracking-widest">{t('aircraftUpgrades')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'storage', name: t('storage'), icon: Database, max: 5 },
                      { id: 'quality', name: t('efficiency'), icon: Star, max: 5 },
                      { id: 'time', name: t('time'), icon: Clock, max: 5 }
                    ].map(upg => {
                      const level = upgrades[upg.id as keyof typeof upgrades];
                      const costs = [10000, 25000, 40000, 60000, 100000];
                      const cost = costs[level] || 1000000;
                      const isMax = level >= upg.max;
                      return (
                        <button
                          key={upg.id}
                          onClick={() => upgradeVoidAircraft(aircraft.id, upg.id as any)}
                          disabled={qc < cost || isMax}
                          className={`flex flex-col p-3 rounded-lg border transition-all text-left group ${isMax ? 'bg-emerald-500/10 border-emerald-500/20 cursor-default' : qc >= cost ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <upg.icon className={`w-3 h-3 ${isMax ? 'text-emerald-400' : qc >= cost ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <span className="text-[15px] font-orbitron font-bold text-white/80 uppercase tracking-widest">{upg.name}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className={`text-base font-mono ${isMax ? 'text-emerald-500' : 'text-cyan-500/60'}`}>{isMax ? 'MAX' : `LVL ${level}`}</span>
                            {!isMax && <span className="text-base font-orbitron font-bold text-white">{formatValue(cost)}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEarthTab = () => {
    const getBiodiversityQuality = (val: number) => {
      if (val < 20) return language === 'pt' ? 'Escassa' : 'Scarce';
      if (val < 40) return language === 'pt' ? 'Em Recuperação' : 'Recovering';
      if (val < 60) return language === 'pt' ? 'Média' : 'Medium';
      if (val < 80) return language === 'pt' ? 'Alta' : 'High';
      return language === 'pt' ? 'Abundante' : 'Abundant';
    };

    const getBiodiversityColor = (val: number) => {
      if (val < 20) return 'text-red-400';
      if (val < 40) return 'text-yellow-400';
      if (val < 60) return 'text-cyan-400';
      return 'text-emerald-400';
    };

    const getSeasonName = (season: number) => {
      const seasons = {
        0: { pt: 'Primavera', en: 'Spring', color: 'text-emerald-400' },
        1: { pt: 'Verão', en: 'Summer', color: 'text-yellow-400' },
        2: { pt: 'Outono', en: 'Fall', color: 'text-orange-400' },
        3: { pt: 'Inverno', en: 'Winter', color: 'text-blue-400' }
      };
      return seasons[season as keyof typeof seasons] || seasons[0];
    };

    const season = getSeasonName(earthSeason);

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 relative px-1 flex flex-col"
      >
        {/* Header - Global Status */}
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 relative overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/5 opacity-50" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-500">
                     <Globe className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-xl font-orbitron font-black text-white uppercase tracking-tighter">Projeto Terra</h1>
                    <div className="flex items-center gap-2 text-emerald-400/80 font-mono text-[14px] uppercase tracking-[0.2em]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {language === 'pt' ? 'Rota 4 - Evolução Ativa' : 'Route 4 - Active Evolution'}
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col items-center bg-white/5 border border-white/10 p-3 rounded-xl min-w-[100px] relative overflow-hidden group/season">
                 <div className="absolute inset-0 bg-emerald-500/5 group-hover/season:bg-emerald-500/10 transition-colors" />
                 <div className="text-[14px] font-orbitron text-emerald-500/60 uppercase tracking-[0.3em] mb-1 z-10">{language === 'pt' ? 'ESTAÇÃO' : 'SEASON'}</div>
                 <div className={`text-base font-orbitron font-black z-10 ${season.color}`}>
                   {language === 'pt' ? season.pt : season.en}
                 </div>
              </div>

              <div className="flex flex-col items-center bg-white/5 border border-white/10 p-3 rounded-xl min-w-[100px] relative overflow-hidden group/year">
                 <div className="absolute inset-0 bg-emerald-500/5 group-hover/year:bg-emerald-500/10 transition-colors" />
                 <div className="text-[14px] font-orbitron text-emerald-500/60 uppercase tracking-[0.3em] mb-1 z-10">{language === 'pt' ? 'ANO ATUAL' : 'CURRENT YEAR'}</div>
                 <div className="text-xl font-orbitron font-black text-white z-10 tabular-nums text-center">
                   {gameTime.years}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Population & Main Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
           {/* Population Card */}
           <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3 relative group">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                       <Activity size={14} />
                    </div>
                    <span className="text-base font-orbitron font-bold text-white uppercase tracking-widest">{language === 'pt' ? 'População Total' : 'Total Population'}</span>
                 </div>
                 <div className="text-xl font-orbitron font-black text-white tabular-nums">
                    {formatValue(Math.floor(totalHumanPopulation))}
                 </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                 <div className="space-y-1">
                    <div className="text-[14px] font-mono text-slate-500 uppercase tracking-widest">{language === 'pt' ? 'Gêneros' : 'Genders'}</div>
                    <div className="flex items-center gap-3">
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-[14px] font-bold">
                             <span className="text-blue-400">{(earthMaleRatio * 100).toFixed(1)}% {language === 'pt' ? 'H' : 'M'}</span>
                             <span className="text-pink-400">{((1 - earthMaleRatio) * 100).toFixed(1)}% {language === 'pt' ? 'M' : 'W'}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                             <motion.div 
                               className="h-full bg-blue-500" 
                               animate={{ width: `${earthMaleRatio * 100}%` }} 
                             />
                             <motion.div 
                               className="h-full bg-pink-500" 
                               animate={{ width: `${(1 - earthMaleRatio) * 100}%` }} 
                             />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Biodiversity Card */}
           <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3 relative group">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                       <Heart size={14} />
                    </div>
                    <span className="text-base font-orbitron font-bold text-white uppercase tracking-widest">{language === 'pt' ? 'Biodiversidade' : 'Biodiversity'}</span>
                 </div>
                 <div className={`text-[15px] font-orbitron font-bold uppercase tracking-widest ${getBiodiversityColor(earthBiodiversity)}`}>
                    {getBiodiversityQuality(earthBiodiversity)}
                 </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                 <div className="flex justify-between items-end">
                    <span className="text-[14px] font-mono text-slate-500 uppercase">{language === 'pt' ? 'Vida' : 'Life'}</span>
                    <span className="text-md font-mono font-bold text-emerald-400 tabular-nums">{earthBiodiversity.toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                      animate={{ width: `${earthBiodiversity}%` }}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Quality Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
           {[
             { label: language === 'pt' ? 'Saúde' : 'Health', val: earthHealth, color: 'emerald', icon: Activity },
             { label: language === 'pt' ? 'Felicidade' : 'Happiness', val: earthHappiness, color: 'yellow', icon: TrendingUp },
             { label: language === 'pt' ? 'Segurança' : 'Safety', val: earthSecurity, color: 'blue', icon: ShieldCheck },
             { label: language === 'pt' ? 'Q. de Vida' : 'QoL', val: earthQualityOfLife, color: 'cyan', icon: Zap }
           ].map((indicator, idx) => (
             <div key={idx} className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
               <div className="flex items-center gap-2 opacity-60">
                 <indicator.icon size={12} className={`text-${indicator.color}-400`} />
                 <span className="text-[15px] font-orbitron font-bold text-white uppercase tracking-widest">{indicator.label}</span>
               </div>
               <div className="space-y-1">
                 <div className="text-lg font-orbitron font-black text-white tracking-tighter">
                   {indicator.val.toFixed(0)}%
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     className={`h-full bg-${indicator.color}-500 shadow-[0_0_10px_rgba(var(--${indicator.color}-500),0.3)]`}
                     animate={{ width: `${indicator.val}%` }}
                   />
                 </div>
               </div>
             </div>
           ))}
        </div>

        {/* Ambient Floating Elements */}
        {[...Array(6)].map((_, i) => {
           const xPos = 20 + ((i * 13) % 60);
           const yPos = 10 + ((i * 17) % 80);
           const delay = i * 2;
           return (
             <motion.div
               key={`ambient-p-${i}`}
               initial={{ 
                 x: `${xPos}%`, 
                 y: `${yPos}%`,
                 scale: 0,
                 opacity: 0
               }}
               animate={{ 
                 scale: [0, 1, 0],
                 opacity: [0, 0.4, 0],
                 y: ['+10%', '-10%']
               }}
               transition={{ 
                 duration: 15,
                 repeat: Infinity,
                 ease: "linear",
                 delay: delay
               }}
               className="absolute w-24 h-24 rounded-full blur-3xl bg-emerald-500/10 pointer-events-none"
             />
           );
        })}
      </motion.div>
    );
  };

  const renderMissions = () => {
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
        case 'rare': return { label: language === 'pt' ? 'RARA' : 'RARE', color: 'text-blue-400', mult: '10x' };
        case 'legendary': return { label: language === 'pt' ? 'LENDÁRIA' : 'LEGENDARY', color: 'text-orange-400', mult: isSolar ? '25x' : '50x' };
        case 'mythic': return { label: language === 'pt' ? 'MÍTICA' : 'MYTHIC', color: 'text-slate-300', mult: isSolar ? '35x' : '150x' };
        case 'alien': return { label: language === 'pt' ? 'ALIEN' : 'ALIEN', color: 'text-green-400', mult: isSolar ? '50x' : '150x' };
        default: return { label: language === 'pt' ? 'COMUM' : 'COMMON', color: 'text-slate-400', mult: '1x' };
      }
    };
    
    return (
      <div className="space-y-3 lg:space-y-3 flex flex-col h-full overflow-hidden">
        <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} p-3 lg:py-4 lg:px-8 rounded-xl flex flex-row justify-between items-center gap-4 shrink-0`}>
          <div className="flex-1">
            <h2 className={`text-lg lg:text-2xl font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} uppercase tracking-tight`}>{t('missions')}</h2>
            <p className="text-base lg:text-[14px] text-slate-500 font-mono uppercase tracking-[0.2em]">
              {readyToClaimCount > 0 ? `${readyToClaimCount} ${t('readyToUnlock' as any)}` : t('gameStatsByRoute')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mapa de Habilidades Button */}
            <button
              onClick={() => setShowSkillMap(true)}
              className={`px-4 py-2 lg:py-3 lg:px-6 rounded-lg font-orbitron text-base tracking-widest transition-all uppercase flex flex-col items-center justify-center h-[64px] lg:h-[72px] w-[180px] lg:w-[220px] leading-snug bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]`}
            >
              <span className="font-black text-[14px] lg:text-base">{language === 'pt' ? 'Mapa de Habilidades' : 'Skill Map'}</span>
              <span className="opacity-70 font-mono text-[14px] lg:text-[15px]">{language === 'pt' ? 'MELHORIAS' : 'UPGRADES'}</span>
            </button>

            {/* Melhorar Button */}
            <button
              onClick={() => {
                if (missionRewardLevel[routeTier] < 10) {
                  const cost = getMissionUpgradeCost(missionRewardLevel[routeTier], routeTier);
                  if (qc >= cost) {
                    setQc(prev => prev - cost);
                    updateHistoryStats('spent', cost);
                    setMissionRewardLevel(prev => ({ ...prev, [routeTier]: prev[routeTier] + 1 }));
                    playSfx('upgrade');
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
              <span className="font-black text-[14px] lg:text-base">{language === 'pt' ? 'Melhorar' : 'Upgrade'}</span>
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
                    setQc(prev => prev - unlockCost);
                    setRadarUnlocked(prev => ({ ...prev, [routeTier]: true }));
                    setAutoClaimMissions(true);
                    playSfx('cash');
                    addLog(`${language === 'pt' ? 'Radar de Missões desbloqueado!' : 'Mission Radar unlocked!'}`, 'success');
                  } else {
                    playSfx('error');
                    addLog(`${language === 'pt' ? `QC insuficiente para o Radar (${formatValue(unlockCost)} necessário)` : `Insufficient QC for Radar (${formatValue(unlockCost)} required)`}`, 'error');
                  }
                  return;
                }
                
                setAutoClaimMissions(prev => !prev);
                playSfx('click');
                if (!autoClaimMissions) {
                  addLog(`${language === 'pt' ? 'Auto-Resgate de Missões ativado!' : 'Auto-Claim Missions activated!'}`, 'success');
                } else {
                  addLog(`${language === 'pt' ? 'Auto-Resgate de Missões desativado!' : 'Auto-Claim Missions deactivated!'}`, 'info');
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
                    <span>{language === 'pt' ? 'COMPRAR RADAR' : 'BUY RADAR'}</span>
                    <span className="text-[14px] text-amber-500/70 font-mono mt-0.5">500k QC</span>
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
                  <span>{language === 'pt' ? 'AUTO RESGATE' : 'AUTO CLAIM'} {readyToClaimCount > 0 ? `(${readyToClaimCount})` : ''}</span>
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
            {missions.map((mission) => {
              const rarityInfo = getRarityLabel(mission.rarity);
              return (
                <motion.div
                  key={mission.id}
                  id={`mission-${mission.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className={`glass-panel rounded-xl p-3 lg:p-4 flex flex-col justify-between transition-all relative border-2 h-full ${
                    mission.claimed 
                      ? 'opacity-40 grayscale border-white/5' 
                      : getRarityStyles(mission.rarity, mission.completed)
                  }`}
                >
                  {mission.completed && !mission.claimed && (
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${isInterstellar ? 'from-orange-500/20' : 'from-cyan-500/20'} to-transparent pointer-events-none`} />
                  )}
                  
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col gap-1.5">
                      <div className={`p-2 w-fit rounded-lg ${mission.completed ? (isInterstellar ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400') : 'bg-white/5 text-slate-500'}`}>
                        {mission.type === 'delivery' ? <Rocket className="w-4 h-4" /> : mission.type === 'initial' ? <Trophy className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                      </div>
                      <div className={`text-[14px] lg:text-base font-black font-orbitron px-1.5 py-0.5 rounded bg-black/40 border border-white/10 ${rarityInfo.color}`}>
                        {rarityInfo.label} <span className="ml-1 opacity-70">{rarityInfo.mult}</span>
                      </div>
                    </div>
                    <div className="text-[14px] lg:text-[14px] font-mono text-yellow-500 font-black">
                      {formatValue(mission.reward)} QC
                    </div>
                  </div>

                  <div className="mb-1">
                    <h3 className={`text-[14px] lg:text-md font-black font-orbitron truncate ${mission.completed && !mission.claimed ? (isInterstellar ? 'text-orange-400' : 'text-cyan-400') : 'text-slate-200'}`}>
                      {mission.title}
                    </h3>
                    <p className="text-[15px] lg:text-[14px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center text-[15px] font-mono uppercase tracking-widest font-black">
                      <span className="text-slate-500">{t('status')}</span>
                      <span className={mission.completed ? 'text-green-400' : 'text-slate-300'}>
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                      <motion.div 
                        className={`h-full ${mission.completed ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : (isInterstellar ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                      />
                    </div>
                    
                    <button
                      onClick={(e) => claimMission(mission.id, e)}
                      disabled={!mission.completed || mission.claimed}
                      className={`w-full py-2 rounded-xl font-orbitron font-black text-base lg:text-[15px] tracking-[0.2em] transition-all uppercase border-b-4 ${
                        mission.claimed
                          ? 'bg-white/5 text-slate-600 cursor-not-allowed border-white/10'
                          : mission.completed
                            ? `${isInterstellar ? 'bg-orange-500 text-black hover:bg-orange-400 border-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-cyan-500 text-black hover:bg-cyan-400 border-cyan-700 shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`
                            : 'bg-white/5 text-slate-500 cursor-not-allowed border-white/10'
                      }`}
                    >
                      {mission.claimed ? t('owned') : mission.completed ? t('claim') : `${Math.floor((mission.current / mission.target) * 100)}%`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

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
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className={`absolute inset-0 ${isInterstellar ? 'bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.05)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]'}`} />
        <div className={`absolute inset-0 ${isInterstellar ? 'bg-[linear-gradient(to_right,rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)]'} bg-[size:40px_40px]`} />
      </div>

      {/* Background Particles for Route 2 — Canvas-based for high FPS */}
      {isInterstellar && (
        <>
          {/* Nebula gradient overlay — pure CSS, zero JS cost */}
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
      {activeCodes['SIGNAL'] && !isSpeedRun && (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[flicker_0.1s_infinite]" />
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
        className={`relative z-10 max-w-[1920px] mx-auto h-screen flex flex-col p-2 lg:p-4 gap-4 ${isFlashingRed ? 'bg-red-900/20' : ''}`}
      >
        {isFlashingRed && (
          <motion.div 
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="fixed inset-0 z-[160] bg-red-600 pointer-events-none"
          />
        )}
        {voidWarAlertActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
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
            <div>
              <h1 className={`text-xl font-orbitron font-bold tracking-tighter ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'} leading-none`}>
                {translateData('QUANTUM COURIER HORIZON')}
              </h1>
              <AnimatePresence>
                {battleNotification && (
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
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isInterstellar ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className={`text-base font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest`}>
                  {translateData('System Online')} • {playerName}
                </span>
              </div>
            </div>
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
                {isVoid && hasWonEliminateEnemiesRoute3 && (
                  <button 
                    onClick={() => setShowRobotModal(true)}
                    className="px-4 py-1.5 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-full font-orbitron text-base animate-pulse flex items-center gap-2 group hover:bg-purple-600/40 transition-all"
                  >
                    <Bot className="w-3 h-3" />
                    {language === 'pt' ? 'Robô Defeituoso' : 'Defective Robot'}
                  </button>
                )}
                {isSpeedRun && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-emerald-500/30 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span className="text-[14px] font-mono font-bold text-emerald-400 tracking-wider">
                      {formatTime(speedRunTime)}
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => setFormatNumbers(!formatNumbers)}
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
                  <span>{formatNumbers ? 'ON' : 'OFF'}</span>
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
                      <span className="text-[14px] uppercase tracking-tighter opacity-50 font-bold leading-none mb-1 text-emerald-400">{language === 'pt' ? 'DIA' : 'DAY'}</span>
                      <span className="text-base font-orbitron font-bold text-white leading-none tabular-nums">{gameTime.days}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-emerald-500/20 relative z-10" />
                    <div className="flex flex-col items-center relative z-10">
                      <span className="text-[14px] uppercase tracking-tighter opacity-50 font-bold leading-none mb-1 text-emerald-400">{language === 'pt' ? 'MÊS' : 'MONTH'}</span>
                      <span className="text-base font-orbitron font-bold text-white leading-none tabular-nums">{gameTime.months}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-emerald-500/20 relative z-10" />
                    <div className="flex flex-col items-center relative z-10">
                      <span className="text-[14px] uppercase tracking-tighter opacity-50 font-bold leading-none mb-1 text-emerald-400">{language === 'pt' ? 'ANO' : 'YEAR'}</span>
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

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          {/* Sidebar - Active Deliveries / Project Earth */}
          <AnimatePresence mode="wait">
            {!isVoid && (
              <motion.aside 
                key={isEarth ? "sidebar-earth" : "sidebar-deliveries"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-4 flex flex-col gap-4 overflow-hidden"
              >
                {isEarth ? (
                  renderEarthSidebar()
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
                            const route = ROUTES.find(r => r.id === group.routeId);
                            if (!route) return null;
                            
                            const ship = SHIPS.find(s => s.level === group.shipLevel && s.tier === (group.tier as any || route.tier));
                            if (!ship) return null;

                            const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
                            const engineUpgrade = UPGRADES.find(u => u.id === 'engine')!;
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
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>

        {/* Main Content */}
        <main className={`${isVoid ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-in-out`}>
          {/* Tabs - Desktop Only */}
          <div className="hidden lg:flex gap-1 w-full border-b border-white/5 mb-2">
            {(isVoid || isEarth
              ? (['void_aircraft', 'void_battle', 'void_map', 'void_war', 'colonies', 'void_earth', 'mini_games', 'history', 'exit'] as const)
              : (['routes', 'routes2', 'missions', 'aircraft', 'technology', 'upgrades', 'auto', 'mining', 'history', 'exit'] as const)
            ).map(tab => {
              if (tab === 'routes' && isInterstellar) return null;
              if (tab === 'routes2' && !isInterstellar && !isRoute2Unlocked()) return null;
              if (tab === 'routes2' && isSpeedRun) return null;
              if (tab === 'missions' && isSpeedRun) return null;
              if (tab === 'history' && isSpeedRun) return null;
              
              // Route 4 (Earth) specific restrictions
              if (isEarth && !['colonies', 'void_earth', 'mini_games', 'history', 'exit'].includes(tab)) return null;
              
              // Route 3 (Void) specific restrictions
              if (isVoid && tab === 'colonies') return null;
              if (isVoid && tab === 'mini_games') return null;

              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-2 py-2.5 font-orbitron text-[15px] tracking-widest uppercase transition-all border-b-2 whitespace-nowrap relative ${
                    activeTab === tab 
                    ? `${themeBorder} ${isVoid ? 'text-purple-100 drop-shadow-[0_0_15px_rgba(192,132,252,1)]' : themeText} ${themeBg} ${isVoid ? 'neon-text-purple' : ''}` 
                    : `border-transparent ${isInterstellar ? 'text-orange-500/40 hover:text-orange-500/80' : isVoid ? 'text-purple-400/60 hover:text-purple-100 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]' : 'text-cyan-500/40 hover:text-cyan-500/80'}`
                  } ${tab === 'void_battle' && isVoidWarActive ? 'animate-pulse bg-red-600/20 border-red-500 text-red-400' : ''}`}
                >
                  {tab === 'exit' ? t('exit') : t(tab as any)}
                  {tab === 'void_battle' && isVoidWarActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  )}
                  {tab === 'missions' && missions.some(m => m.completed && !m.claimed) && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col ${(activeTab === 'routes' || activeTab === 'routes2' || activeTab === 'aircraft' || activeTab === 'technology' || activeTab === 'upgrades' || activeTab === 'auto' || activeTab === 'battleLevel' || activeTab === 'mining' || activeTab === 'void_aircraft' || activeTab === 'void_battle' || activeTab === 'void_map' || activeTab === 'void_war' || activeTab === 'colonies' || activeTab === 'void_earth' || activeTab === 'history') ? 'lg:overflow-hidden' : ''}`}>
            {isVoid && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4"
              >
                {[
                  { label: 'Minérios', value: voidResources.minerals, icon: Database, color: 'text-slate-400' },
                  { label: 'Energia', value: voidResources.energy, icon: Zap, color: 'text-yellow-400' },
                  { label: 'Alimentos', value: voidResources.food, icon: Heart, color: 'text-red-400' },
                  { label: 'Tecnologia', value: voidResources.tech, icon: Cpu, color: 'text-cyan-400' },
                  { label: 'Medicamentos', value: voidResources.meds, icon: Shield, color: 'text-emerald-400' }
                ].map(res => (
                  <div key={res.label} className="glass-panel border border-white/10 rounded-xl p-3 flex items-center justify-between bg-black/40">
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
              {activeTab === 'missions' && (

                <motion.div
                  key="missions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col h-full"
                >
                  {renderMissions()}
                </motion.div>
              )}
              {(activeTab === 'routes' || activeTab === 'routes2') && (
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col h-full"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-4 lg:gap-3 flex-1 h-full overflow-hidden">
                  {/* Route 2 Unlock Banner */}
              {routeTier === 'Solar' && isRoute2Unlocked() && !isSpeedRun && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full relative overflow-hidden glass-panel border-2 border-orange-500/50 p-8 rounded-2xl bg-gradient-to-br from-orange-500/20 via-black/40 to-orange-900/20 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(249,115,22,0.3)] group"
                >
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-1000" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-1000" />
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-pulse-glow">
                        <Globe className="w-10 h-10 text-orange-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                        <ArrowRight className="w-4 h-4 text-black" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-orbitron font-black text-orange-400 uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                        {t('routes2')}
                      </h3>
                      <p className="text-base text-orange-200/80 font-mono uppercase tracking-[0.15em] max-w-md leading-relaxed">
                        {t('route2UnlockDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 w-full lg:w-auto">
                    <button
                      onClick={() => setShowRoute2Confirm(true)}
                      className="w-full lg:w-auto px-12 py-5 bg-orange-500 text-black font-orbitron font-black text-xl rounded-xl hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 uppercase tracking-[0.25em] border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3"
                    >
                      <Rocket className="w-6 h-6" />
                      {t('startInterstellarProtocol')}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Route 3 Unlock Banner */}
              {routeTier === 'Interstellar' && isRoute3Unlocked() && !isSpeedRun && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full relative overflow-hidden glass-panel border-2 border-purple-500/50 p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 via-black/40 to-purple-900/20 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] group"
                >
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-1000" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-1000" />
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse-glow">
                        <Zap className="w-10 h-10 text-purple-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                        <ArrowRight className="w-4 h-4 text-black" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-orbitron font-black text-purple-400 uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                        ROTA 3
                      </h3>
                      <p className="text-base text-purple-200/80 font-mono uppercase tracking-[0.15em] max-w-md leading-relaxed">
                        {t('route3UnlockDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 w-full lg:w-auto">
                    <button
                      onClick={() => setShowRoute3Confirm(true)}
                      className="w-full lg:w-auto px-12 py-5 bg-purple-600 text-white font-orbitron font-black text-xl rounded-xl hover:bg-purple-500 transition-all shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 uppercase tracking-[0.25em] border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3"
                    >
                      <Rocket className="w-6 h-6" />
                      {t('startVoidProtocol')}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentRoutes.filter(route => {
                    const isShipUnlocked = route.requiredShipLevel === 1 || (ownedShips[`${routeTier}-${route.requiredShipLevel}`] || 0) > 0;
                    return isShipUnlocked;
                  }).map(route => {
                    const isPurchased = unlockedRouteIds.includes(route.id);
                    const isAutoActive = autoTravelActive[route.id];
                    const autoProgress = autoTravelProgress[route.id] || 0;
                    
                    const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
                    const valueUpgrade = UPGRADES.find(u => u.id === 'value')!;
                    const valueTier = valueUpgrade.tiers.find(t => t.level === locationTech.value);
                    const costIncreaseMultiplier = 1 + ((valueTier?.value || 0) * 0.1);
                    const fuelCost = Math.floor(10 * costIncreaseMultiplier);
                    const canAffordFuel = qc >= fuelCost;
                    const conditionsMet = isRouteUnlocked(route);
                    const canAffordUnlock = qc >= (route.unlockCost || 0);

                    const requiredLevel = route.requiredShipLevel;
                    const totalOwned = ownedShips[`${routeTier}-${requiredLevel}`] || 0;
                    
                    // Count ships in use by manual deliveries
                    let currentlyInUse = activeDeliveries.filter(d => d.shipLevel === requiredLevel && d.tier === routeTier).length;
                    
                    // Count ships in use by auto-travel
                    Object.keys(autoTravelActive).forEach(routeId => {
                      if (autoTravelActive[routeId]) {
                        const r = ROUTES.find(rt => rt.id === routeId);
                        if (r && r.requiredShipLevel === requiredLevel && r.tier === routeTier) {
                          currentlyInUse += (autoTravelSlots[routeId] || 0);
                        }
                      }
                    });

                    const shipAvailable = currentlyInUse < totalOwned;

                    return (
                      <div 
                        key={route.id}
                        className={`group relative glass-panel rounded-xl p-3 transition-all flex flex-col justify-between h-full ${
                          isPurchased 
                          ? `${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} bg-black/60 hover:bg-white/10` 
                          : 'border-white/5 bg-black/40'
                        }`}
                      >
                        {!isPurchased && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-[4px] rounded-xl p-4 text-center">
                            {!conditionsMet ? (
                              <>
                                <Shield className="w-8 h-8 text-slate-600 mb-3" />
                                <div className="text-[14px] font-orbitron text-slate-500 uppercase tracking-widest mb-2 font-bold">{t('locked')}</div>
                                <div className="text-base text-slate-600 leading-relaxed font-mono uppercase">
                                  {route.unlockCondition?.route2Unlocked && !isRoute2Unlocked() ? t('route2UnlockDesc') : `${t('requiredShip')}: Lvl ${route.requiredShipLevel}`}
                                </div>
                              </>
                            ) : (
                              <>
                                <Zap className={`w-8 h-8 ${isInterstellar ? 'text-orange-500' : 'text-yellow-500'} mb-3 animate-pulse`} />
                                <div className={`text-[14px] font-orbitron ${themeText} uppercase tracking-[0.2em] mb-4 font-bold`}>{t('readyToUnlock')}</div>
                                <button
                                  onClick={() => buyRoute(route)}
                                  disabled={!canAffordUnlock}
                                  className={`px-6 py-3 rounded-lg font-orbitron text-base font-bold tracking-[0.2em] transition-all w-full border-b-2 ${
                                    canAffordUnlock 
                                    ? `${isInterstellar ? 'bg-orange-500 text-black hover:bg-orange-400 border-orange-700 shadow-[0_0_25px_rgba(249,115,22,0.4)]' : 'bg-yellow-500 text-black hover:bg-yellow-400 border-yellow-700 shadow-[0_0_25px_rgba(234,179,8,0.4)]'}` 
                                    : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed'
                                  }`}
                                >
                                  {t('unlock').toUpperCase()}: {formatValue(route.unlockCost || 0)} QC
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-orbitron text-base font-black text-white ${isInterstellar ? 'group-hover:neon-text-orange text-orange-200' : 'group-hover:neon-text-cyan text-cyan-100'} transition-colors truncate leading-none uppercase tracking-[0.1em]`}>{t(route.name as any)}</h3>
                            <p className={`text-[14px] font-mono mt-2 flex items-center gap-2 ${isInterstellar ? 'text-orange-500/80' : 'text-cyan-500/80'} truncate leading-tight uppercase tracking-widest`}>
                              <span className="opacity-40">{t(route.origin as any)}</span>
                              <ArrowRight className="w-2.5 h-2.5 opacity-40" />
                              <span>{t(route.destination as any)}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 ml-2">
                            <div className={`px-2 py-0.5 ${isInterstellar ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'} rounded text-base font-black uppercase tracking-widest whitespace-nowrap border shadow-sm`}>
                              {route.tier}
                            </div>
                            <div className={`text-base font-mono uppercase tracking-tighter font-bold ${shipAvailable ? (isInterstellar ? 'text-orange-400/80' : 'text-cyan-400/80') : 'text-pink-400'}`}>
                              <span className={SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === route.tier)?.color}>
                                Lvl {route.requiredShipLevel} • {translateData(SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === route.tier)?.name || '')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 flex-1 py-2 border-y border-white/5">
                          <div className="space-y-1.5">
                            <div className="text-base uppercase text-slate-500 leading-none tracking-[0.2em] font-orbitron font-bold mb-1 opacity-70">{t('cargo')}</div>
                              <div className="text-[14px] font-mono flex items-center gap-2 leading-none text-white font-bold">
                                <Package className="w-3.5 h-3.5 text-pink-500" />
                                {t(route.cargoType as any)}
                              </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-base uppercase text-slate-500 leading-none tracking-[0.2em] font-orbitron font-bold mb-1 opacity-70">{t('reward')}</div>
                            <div className="text-[14px] font-mono flex items-center gap-2 text-yellow-400 leading-none font-bold">
                              <Coins className="w-3.5 h-3.5" />
                              {Math.floor(route.reward * (1 + (valueTier?.value || 0)) * getEconomicMultipliers().profit)}
                              {valueTier && (
                                <span className="text-base text-emerald-400 ml-1 bg-emerald-500/10 px-1 rounded">
                                  +{valueTier.value * 100}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5 col-span-2">
                            <div className="text-base uppercase text-slate-500 leading-none tracking-[0.2em] font-orbitron font-bold mb-1 opacity-70">{t('range')}</div>
                            <div className="text-[14px] font-mono flex items-center gap-2 text-slate-300 leading-none font-bold">
                              <CompassIcon className="w-3.5 h-3.5 text-cyan-500" />
                              {formatValue(route.distance)} {route.tier === 'Interstellar' ? 'LY' : 'km'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto space-y-2">
                          {isAutoActive && (
                            <div className="space-y-1.5 bg-black/40 p-1.5 rounded-lg border border-white/5">
                              <div className={`flex justify-between items-center text-base font-orbitron ${themeText} font-bold uppercase tracking-[0.15em]`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  <span>{t('autoTravel')}</span>
                                </div>
                                <span className="text-white">{Math.floor(autoProgress)}%</span>
                              </div>
                              <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <motion.div 
                                  className={`h-full rounded-full ${
                                    isSpeedMode
                                    ? 'bg-gradient-to-r from-red-600 via-red-400 to-white shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                                    : isInterstellar 
                                      ? 'bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 lg:shadow-[0_0_10px_rgba(249,115,22,0.5)]' 
                                      : getAutoTravelColor(autoTravelSlots[route.id] || 0)
                                  }`}
                                  animate={{ width: `${autoProgress}%` }}
                                  transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            disabled={!isPurchased || !canAffordFuel || !shipAvailable}
                            onClick={() => launchRoute(route)}
                            className={`w-full py-2.5 rounded-xl font-orbitron text-[14px] font-black tracking-[0.3em] transition-all flex items-center justify-center gap-3 uppercase border-b-4 ${
                              isPurchased && canAffordFuel && shipAvailable
                              ? (isInterstellar 
                                  ? 'bg-orange-500 text-black hover:bg-orange-400 border-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:scale-[1.02]' 
                                  : 'bg-cyan-500 text-black hover:bg-cyan-400 border-cyan-700 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-[1.02]')
                              : 'bg-white/5 text-slate-600 border-white/10 cursor-not-allowed'
                            }`}
                          >
                            <Rocket className="w-4 h-4" />
                            {!shipAvailable ? t('noShips').toUpperCase() : `${t('launch').toUpperCase()} (${fuelCost} QC)`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'auto' && (
                <motion.div 
                  key="auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-full gap-3 overflow-hidden"
                >
                  {/* CCE - Câmara de Contenção de Éteríon */}
                  <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} p-4 rounded-xl overflow-hidden relative group shrink-0`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isInterstellar ? 'bg-orange-500/10 text-orange-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{t('cce')}</h2>
                          <p className="text-[14px] text-slate-500 font-mono uppercase tracking-widest">{t('cceConcept')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-base font-orbitron text-slate-400 uppercase tracking-widest leading-none mb-1">{t('aetherion')}</span>
                        <div className={`text-xl font-mono font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} leading-none`}>
                          {Math.floor((aetherion / 10000) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-center">
                      <div className="space-y-1.5">
                        <div className="h-2.5 bg-white/5 rounded-full border border-white/10 p-0.5 relative overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full bg-gradient-to-r ${isInterstellar ? 'from-orange-600 via-orange-400 to-orange-600' : 'from-cyan-600 via-cyan-400 to-cyan-600'} shadow-[0_0_15px_rgba(6,182,212,0.3)]`}
                            animate={{ width: `${(aetherion / 10000) * 100}%` }}
                            transition={{ type: 'spring', bounce: 0, duration: 1 }}
                          />
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        </div>
                        <div className="flex justify-end text-[14px] font-mono text-slate-500 uppercase tracking-tighter">
                          <span>{formatValue(aetherion)} / {formatValue(10000)} Units</span>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-[14px] text-slate-400 font-mono leading-tight italic border-l border-white/5 pl-4">
                          &quot;{t('aetherionConcept')}&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 flex-1 min-h-0 overflow-hidden">
                    {ROUTES.filter(r => unlockedRouteIds.includes(r.id)).map(route => {
                    const slots = autoTravelSlots[route.id] || 0;
                    const isActive = autoTravelActive[route.id];
                    const isDesired = autoTravelDesired[route.id];
                    const progress = autoTravelProgress[route.id] || 0;
                    const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
                    const ship = SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === route.tier);
                    
                    return (
                      <div key={route.id} className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-lg p-3 flex flex-col gap-3 hover:bg-white/5 transition-colors h-full min-h-[160px] justify-between`}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <h3 className={`font-orbitron text-base font-bold ${ship?.color || 'text-white'} truncate leading-tight uppercase tracking-wider`}>{ship?.name || translateData(route.name)}</h3>
                              <p className={`text-[14px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} leading-tight uppercase`}>{translateData(route.name)}</p>
                            </div>
                            <div className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-tighter border ${slots > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                              {slots > 0 ? t('active') : t('locked')}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((slot) => (
                                  <div 
                                    key={slot} 
                                    className={`w-2 h-2 rounded-sm border ${
                                      slot <= slots 
                                      ? (isSpeedMode ? 'bg-red-600 border-red-400 shadow-[0_0_5px_rgba(220,38,38,0.4)]' : (isInterstellar ? 'bg-orange-500 border-orange-400' : getAutoTravelColor(slot))) 
                                      : 'bg-white/5 border-white/10'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">{t('autoTravelSlots')}</span>
                            </div>
                            
                            {slots < 5 ? (
                              <div className="flex flex-col items-end gap-1">
                                <button
                                  onClick={() => buyAutoTravelSlot(route.id)}
                                  className={`${isInterstellar ? 'bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border-orange-600/30' : 'bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 border-pink-600/30'} border px-2 py-1 rounded text-[7px] font-orbitron font-bold tracking-widest transition-all flex items-center gap-1 uppercase`}
                                >
                                  {t('buy').toUpperCase()} <Coins className="w-2 h-2" /> {formatValue([1000, 5000, 10000, 15000, 20000][slots] * getLocationMultiplier(route.id) * getEconomicMultipliers().cost * (route.tier === 'Interstellar' ? 2 : 1) * (route.tier === 'Solar' ? 10 : 1))}
                                </button>
                                {route.id !== 'speed_run' && (
                                  <div className="text-[6px] font-mono text-slate-500 uppercase tracking-tighter">
                                    {t('aetherionRequired')}: {(slots + 1) * 2}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-emerald-400 text-[7px] font-orbitron font-bold tracking-widest uppercase">{t('max')}</div>
                            )}
                          </div>
                        </div>

                        {slots > 0 && (
                          <div className="pt-2 border-t border-white/5 flex flex-col gap-2 mt-auto">
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => toggleAutoTravel(route.id)}
                                  className={`px-3 py-1 rounded text-[14px] font-orbitron font-bold tracking-widest transition-all border uppercase ${
                                    isDesired 
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                                    : 'bg-white/5 border-white/10 text-slate-500'
                                  }`}
                                >
                                  {isDesired ? t('on').toUpperCase() : t('off').toUpperCase()}
                                </button>
                                {isDesired && !isActive && (
                                  <span className="text-[6px] text-red-400 font-mono uppercase tracking-tighter">
                                    {t('insufficientAetherion')}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter">
                                  {slots * 2} {t('aetherion')} / {t('trip')}
                                </span>
                                {isActive && (
                                  <span className={`text-[14px] font-mono ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'}`}>{Math.floor(progress)}%</span>
                                )}
                              </div>
                            </div>
                            
                            {isDesired && (
                              <div className={`relative h-1 bg-white/5 rounded overflow-hidden ${locationTech.engine >= 5 ? (isInterstellar ? 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'shadow-[0_0_10px_rgba(236,72,153,0.3)]') : ''}`}>
                                <motion.div 
                                  className={`h-full rounded-full ${locationTech.engine >= 5 ? (isInterstellar ? 'bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600' : 'bg-gradient-to-r from-pink-600 via-pink-400 to-pink-600') : (isInterstellar ? 'bg-orange-500' : getAutoTravelColor(slots))}`}
                                  animate={{ width: `${!isActive ? 0 : (locationTech.engine >= 5 ? 100 : progress)}%` }}
                                  transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

                  {activeTab === 'mining' && (
                <motion.div
                  key="mining"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col h-full min-h-0 gap-4"
                >
                  {/* Mining Header */}
                  <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} p-4 rounded-xl flex justify-between items-center shrink-0`}>
                    <div>
                      <h2 className={`text-lg font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} uppercase tracking-tighter`}>{t('mining')}</h2>
                      <p className="text-base text-slate-500 font-mono uppercase tracking-widest">{t('manageInfrastructure')}</p>
                    </div>
                    {!isInterstellar && (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setMiningPageIndex(prev => Math.max(0, prev - 1))}
                          disabled={miningPageIndex === 0}
                          className={`p-1 rounded border ${isInterstellar ? 'border-orange-500/30' : 'border-cyan-500/30'} transition-all ${miningPageIndex === 0 ? 'opacity-20 cursor-not-allowed' : (isInterstellar ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-cyan-500/20 text-cyan-400')}`}
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <span className={`text-base font-orbitron ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest`}>
                          {miningPageIndex + 1} / {currentOres.length}
                        </span>
                        <button 
                          onClick={() => setMiningPageIndex(prev => Math.min(currentOres.length - 1, prev + 1))}
                          disabled={miningPageIndex === currentOres.length - 1}
                          className={`p-1 rounded border ${isInterstellar ? 'border-orange-500/30' : 'border-cyan-500/30'} transition-all ${miningPageIndex === currentOres.length - 1 ? 'opacity-20 cursor-not-allowed' : (isInterstellar ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-cyan-500/20 text-cyan-400')}`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {/* Removido Lucro Total e Vender Extração conforme solicitado */}
                  </div>

                  {isInterstellar ? (
                    /* ROTA 2: 3x3 Grid of Ores */
                    <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentOres.map((ore, index) => {
                        const robots = miningRobots[ore.id] || 0;
                        const level = miningRobotLevels[ore.id] || 1;
                        const upgrade = ROBOT_UPGRADES.find(u => u.level === level) || ROBOT_UPGRADES[0];
                        const nextUpgrade = ROBOT_UPGRADES.find(u => u.level === level + 1);
                        const amount = oresCollected[ore.id] || 0;
                        const packs = Math.floor(amount / ore.packSize);
                        const isAutoSell = autoSellByOre[ore.id];
                        const isActive = robots > 0;
                        const baseRate = 0.5;
                        const ratePerRobot = baseRate * upgrade.speedBonus * upgrade.efficiencyBonus * upgrade.productionBonus;
                        const totalRate = robots * ratePerRobot;
                        const isUnlocked = Object.entries(ownedShips).some(([key, count]) => {
                          const [tier, level] = key.split('-');
                          return tier === ore.tier && parseInt(level) >= ore.requiredShipLevel && count > 0;
                        });
                        const robotCost = Math.floor(ore.robotBaseCost * Math.pow(1.1, robots) * getEconomicMultipliers().cost * 0.4);
                        const compressionLevel = miningCompressionLevels[ore.id] || 0;
                        const compressionCost = Math.floor(ore.robotBaseCost * Math.pow(1.6681, compressionLevel) * getEconomicMultipliers().cost * 0.2);

                        if (!isUnlocked) {
                          return (
                            <div key={ore.id} className="glass-panel border border-white/5 rounded-xl flex flex-col items-center justify-center text-center opacity-30 grayscale p-4">
                              <Lock className="w-5 h-5 text-slate-500 mb-2" />
                              <div className="text-base font-orbitron text-slate-500 uppercase tracking-widest">{ore.name}</div>
                              <div className="text-[14px] text-slate-600 font-mono mt-1">LVL {ore.requiredShipLevel}+</div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={ore.id} 
                            className={`glass-panel p-3 rounded-xl border flex flex-col transition-all duration-300 ${
                              isActive ? 'neon-border-orange bg-orange-900/5' : 'border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-orbitron text-base font-bold text-white leading-tight uppercase truncate max-w-[100px]">{ore.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex items-center gap-1 text-[14px] font-mono text-orange-400">
                                    <Cpu className="w-2.5 h-2.5" /> {robots}
                                  </div>
                                  <div className="flex items-center gap-1 text-[14px] font-mono text-emerald-400">
                                    <TrendingUp className="w-2.5 h-2.5" /> {totalRate.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="text-base font-bold text-orange-400 font-mono tracking-tighter">{formatValue(packs)} PKS</div>
                                <button 
                                  onClick={(e) => sellOrePack(ore.id, e)}
                                  disabled={packs <= 0}
                                  className={`mt-1 px-2 py-0.5 rounded text-[7px] font-bold transition-all uppercase ${packs > 0 ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-white/5 text-slate-600 opacity-50 cursor-not-allowed'}`}
                                >
                                  VENDER
                                </button>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px] mb-3">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-[width] duration-300 ease-linear"
                                style={{ width: `${(amount / ore.packSize) * 100}%` }}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                              {/* Left Column: Robot & Upgrade */}
                              <div className="space-y-2">
                                <button
                                  onClick={() => buyMiningRobot(ore.id)}
                                  disabled={robots >= 5 || qc < robotCost}
                                  className={`w-full py-1.5 rounded-lg flex flex-col items-center gap-0.5 border transition-all ${
                                    robots < 5 && qc >= robotCost
                                    ? 'bg-slate-800 hover:bg-orange-500/20 border-orange-500/30 text-orange-400'
                                    : 'border-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <span className="text-[7px] font-bold uppercase">Robô</span>
                                  {robots < 5 && <span className="text-[14px] font-mono">{formatValue(robotCost)}</span>}
                                </button>
                                <button
                                  onClick={() => upgradeMiningRobot(ore.id)}
                                  disabled={!nextUpgrade || qc < (Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * getEconomicMultipliers().cost * 0.2))}
                                  className={`w-full py-1.5 rounded-lg flex flex-col items-center gap-0.5 border transition-all ${
                                    nextUpgrade && qc >= (Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * getEconomicMultipliers().cost * 0.2))
                                    ? 'bg-slate-800 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                    : 'border-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <span className="text-[7px] font-bold uppercase">Upgrade</span>
                                  {nextUpgrade && <span className="text-[14px] font-mono">{formatValue(Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * getEconomicMultipliers().cost * 0.2))}</span>}
                                </button>
                              </div>

                              {/* Right Column: Comp & Auto-Sell */}
                              <div className="space-y-2">
                                <button
                                  onClick={() => buyMiningCompression(ore.id)}
                                  disabled={compressionLevel >= 10 || qc < compressionCost}
                                  className={`w-full py-1.5 rounded-lg flex flex-col items-center gap-0.5 border transition-all ${
                                    compressionLevel >= 10
                                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                                    : qc >= compressionCost
                                      ? 'bg-slate-800 hover:bg-pink-500/20 border-pink-500/30 text-pink-400'
                                      : 'border-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <span className="text-[7px] font-bold uppercase">Comp. {compressionLevel}/10</span>
                                  {compressionLevel < 10 && <span className="text-[14px] font-mono">{formatValue(compressionCost)}</span>}
                                </button>
                                <button
                                  onClick={() => buyAutoSell(ore.id)}
                                  className={`w-full py-1.5 rounded-lg flex flex-col items-center justify-center border transition-all ${
                                    autoSellUnlockedByOre[ore.id]
                                    ? isAutoSell 
                                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 font-bold' 
                                      : 'bg-slate-800 border-white/10 text-slate-500'
                                    : 'bg-slate-900 border-white/5 text-slate-600 opacity-80'
                                  }`}
                                >
                                  {!autoSellUnlockedByOre[ore.id] ? (
                                    <>
                                      <span className="text-[7px] uppercase leading-none">Desbloq. Auto</span>
                                      <span className="text-[14px] font-mono mt-0.5">{formatValue(ore.autoSellCost * getEconomicMultipliers().cost * 0.8)}</span>
                                    </>
                                  ) : (
                                    <span className="text-[14px] font-bold uppercase tracking-wider">{isAutoSell ? 'AUTO ON' : 'AUTO OFF'}</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      {/* Mining Summary - SOLAR ONLY */}
                      {!isInterstellar && isInterstellar && ( // Logic redundant but following user intent for absolute clear separation if I were to use a more complex check
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Summary cards omitted for Interstellar but kept for others if logic allowed */}
                        </div>
                      )}

                      {/* Ore Page - PAGINATION VIEW FOR SOLAR */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={miningPageIndex}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.02 }}
                          className="flex-1"
                        >
                          {(() => {
                            const ore = currentOres[miningPageIndex];
                            if (!ore) return null;
                            const robots = miningRobots[ore.id] || 0;
                            const level = miningRobotLevels[ore.id] || 1;
                            const upgrade = ROBOT_UPGRADES.find(u => u.level === level) || ROBOT_UPGRADES[0];
                            const nextUpgrade = ROBOT_UPGRADES.find(u => u.level === level + 1);
                            const amount = oresCollected[ore.id] || 0;
                            const packs = Math.floor(amount / ore.packSize);
                            const isAutoSell = autoSellByOre[ore.id];
                            
                            const isUnlocked = Object.entries(ownedShips).some(([key, count]) => {
                              const [tier, level] = key.split('-');
                              return tier === ore.tier && parseInt(level) >= ore.requiredShipLevel && count > 0;
                            });
                            const robotCost = Math.floor(ore.robotBaseCost * Math.pow(1.1, robots) * getEconomicMultipliers().cost);
                            const isActive = robots > 0;
                            
                            const baseRate = 0.5;
                            const ratePerRobot = baseRate * upgrade.speedBonus * upgrade.efficiencyBonus * upgrade.productionBonus;
                            const totalRate = robots * ratePerRobot;

                            if (!isUnlocked) {
                              return (
                                <div className="glass-panel border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center opacity-40 grayscale backdrop-blur-xl bg-white/5 relative group min-h-[400px]">
                                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors" />
                                  <div className="relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50">
                                      <Lock className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <div className="text-xl font-orbitron text-slate-500 uppercase tracking-widest mb-2">{t('locked')}</div>
                                    <div className="text-base text-slate-600 uppercase font-mono tracking-widest">Ship Level {ore.requiredShipLevel} Required</div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className={`glass-panel p-8 rounded-2xl space-y-8 hover:bg-white/5 transition-all relative overflow-hidden min-h-[400px] ${
                                isActive ? 'neon-border-cyan shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-white/10'
                              }`}>
                                <div className="flex justify-between items-start relative z-10">
                                  <div>
                                    <div className="text-base font-orbitron text-cyan-500/60 uppercase tracking-widest mb-1">Ore Type {miningPageIndex + 1}</div>
                                    <div className="flex items-center gap-4">
                                      <h3 className="font-orbitron text-lg font-bold text-white tracking-tighter group-hover:text-cyan-400 neon-text-cyan transition-colors">{ore.name}</h3>
                                      
                                      {!isSpeedRun && (
                                        <div className="flex flex-col items-center gap-1">
                                          {(miningCompressionLevels[ore.id] || 0) < 10 && (
                                            <div className="text-[14px] font-orbitron text-emerald-400 animate-pulse tracking-widest uppercase font-bold">
                                              {formatValue(ore.robotBaseCost * Math.pow(1.6681, miningCompressionLevels[ore.id] || 0) * getEconomicMultipliers().cost)} QC
                                            </div>
                                          )}
                                          <button
                                            onClick={() => buyMiningCompression(ore.id)}
                                            disabled={(miningCompressionLevels[ore.id] || 0) >= 10 || qc < Math.floor(ore.robotBaseCost * Math.pow(1.6681, miningCompressionLevels[ore.id] || 0) * getEconomicMultipliers().cost)}
                                            className={`px-4 py-2 rounded-lg text-[15px] font-orbitron font-bold tracking-[0.15em] transition-all uppercase border relative overflow-hidden group/btn min-w-[140px] ${
                                              (miningCompressionLevels[ore.id] || 0) >= 10
                                              ? 'border-white/60 text-white shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105'
                                              : 'bg-black/40 border-white/20 text-white hover:border-white/40'
                                            }`}
                                          >
                                            <div className={`absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite] ${
                                              (miningCompressionLevels[ore.id] || 0) >= 10 ? 'opacity-80' : 'opacity-30'
                                            }`} />
                                            {(miningCompressionLevels[ore.id] || 0) >= 10 && (
                                              <div className="absolute inset-0 bg-white/10 animate-pulse" />
                                            )}
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                              {(miningCompressionLevels[ore.id] || 0) < 10 ? (
                                                <>
                                                  Refined Compression
                                                  <span className="text-yellow-400">Lvl {miningCompressionLevels[ore.id] || 0}</span>
                                                </>
                                              ) : (
                                                <span className="text-white font-black text-[14px] tracking-[0.4em] drop-shadow-[0_0_12px_rgba(255,255,255,1)]">MAX</span>
                                              )}
                                            </span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-[14px] font-mono text-cyan-500/60 uppercase flex items-center gap-2 mt-2">
                                      <Cpu className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                                      {t('robots')}: {robots}/5
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <div className="text-2xl font-orbitron text-cyan-400 flex items-center justify-end gap-2">
                                      <TrendingUp className="w-5 h-5" />
                                      {totalRate.toFixed(2)} <span className="text-[14px]">{t('units')}/s</span>
                                    </div>
                                    <div className="text-base font-mono text-cyan-500/60 uppercase flex items-center justify-end gap-1 mt-1">
                                      <Coins className="w-3 h-3" />
                                      {((totalRate / ore.packSize) * ore.baseValue * getEconomicMultipliers().profit * (1 + (miningCompressionLevels[ore.id] || 0) * 0.2)).toFixed(2)} QC/s
                                    </div>
                                    <div className="text-base font-mono text-slate-500 uppercase mt-1 opacity-50">Lvl {level} {upgrade.name}</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/5 relative z-10">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[14px] font-orbitron text-slate-500 uppercase tracking-widest">
                                      <span>{t('oreCollected')}</span>
                                      <span className={amount >= ore.packSize ? 'text-yellow-400 font-bold animate-pulse' : 'text-cyan-400'}>
                                        {formatValue(Math.floor(amount))} / {formatValue(ore.packSize)}
                                      </span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
                                      <motion.div 
                                        className={`h-full rounded-full ${amount >= ore.packSize ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
                                        animate={{ width: `${(amount / ore.packSize) * 100}%` }}
                                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                      />
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div className="text-[14px] font-mono text-slate-500 uppercase">{t('sellPacks')}: {formatValue(packs)}</div>
                                      <button
                                        onClick={(e) => sellOrePack(ore.id, e)}
                                        disabled={packs <= 0}
                                        className={`px-4 py-1.5 rounded-lg text-[14px] font-orbitron font-bold tracking-widest transition-all uppercase ${
                                          packs > 0 
                                          ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                                          : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                        }`}
                                      >
                                        {t('sellPacks')}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex flex-col justify-center gap-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${isAutoSell ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                                          <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <div className="text-[14px] font-orbitron text-white uppercase tracking-widest">{t('autoSell')}</div>
                                          <div className="text-base font-mono text-slate-500 uppercase">{isAutoSell ? t('active') : t('inactive')}</div>
                                        </div>
                                      </div>
                                      {!autoSellUnlockedByOre[ore.id] ? (
                                        <button
                                          onClick={() => buyAutoSell(ore.id)}
                                          disabled={qc < (ore.autoSellCost * getEconomicMultipliers().cost)}
                                          className={`px-4 py-2 rounded-lg text-base font-orbitron font-bold tracking-widest transition-all uppercase ${qc >= (ore.autoSellCost * getEconomicMultipliers().cost) ? 'bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.3)]' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                                        >
                                          {t('buy')} ({formatValue(ore.autoSellCost * getEconomicMultipliers().cost)})
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => buyAutoSell(ore.id)}
                                          className={`px-4 py-2 rounded-lg text-base font-orbitron font-bold tracking-widest transition-all uppercase border ${isAutoSell ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                        >
                                          {isAutoSell ? t('on').toUpperCase() : t('off').toUpperCase()}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mt-auto">
                                  <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-base font-orbitron text-slate-500 uppercase tracking-widest">{t('buyRobot')}</span>
                                      <span className="text-[14px] font-mono text-yellow-500">{formatValue(robotCost)} QC</span>
                                    </div>
                                    <button
                                      onClick={() => buyMiningRobot(ore.id)}
                                      disabled={robots >= 5 || qc < robotCost}
                                      className={`w-full py-3 rounded-xl font-orbitron text-base font-bold tracking-widest transition-all border uppercase ${robots < 5 && qc >= robotCost ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/10 text-slate-600 cursor-not-allowed'}`}
                                    >
                                      {robots >= 5 ? t('max').toUpperCase() : t('buyRobot').toUpperCase()}
                                    </button>
                                  </div>

                                  <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-base font-orbitron text-slate-500 uppercase tracking-widest">{t('upgradeRobot')}</span>
                                      <span className="text-[14px] font-mono text-yellow-500">
                                        {nextUpgrade ? formatValue(Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * getEconomicMultipliers().cost)) : '---'} QC
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => upgradeMiningRobot(ore.id)}
                                      disabled={!nextUpgrade || qc < Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * getEconomicMultipliers().cost)}
                                      className={`w-full py-3 rounded-xl font-orbitron text-base font-bold tracking-widest transition-all border uppercase ${nextUpgrade && qc >= Math.floor(ore.robotBaseCost * nextUpgrade.costMultiplier * getEconomicMultipliers().cost) ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/10 text-slate-600 cursor-not-allowed'}`}
                                    >
                                      {!nextUpgrade ? t('max').toUpperCase() : t('upgradeRobot').toUpperCase()}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'aircraft' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col h-full space-y-6"
                >
                  <div className="flex items-center justify-between shrink-0">
                    <div>
                      <h2 className={`text-2xl font-bold ${themeText} flex items-center gap-2`}>
                        <Rocket className="w-6 h-6" />
                        {t('aircraft')}
                      </h2>
                      <p className="text-slate-400 text-base">
                        {translateData(isInterstellar ? 'Gerencie sua frota de naves interestelares.' : 'Gerencie sua frota de naves solares.')}
                      </p>
                    </div>
                    
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setAircraftSubTab('fleet')}
                        className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                          aircraftSubTab === 'fleet' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {t('fleet')}
                      </button>
                      <button
                        onClick={() => setAircraftSubTab('battle')}
                        className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                          aircraftSubTab === 'battle' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {t('battleLevel')}
                      </button>
                    </div>
                  </div>

                  {aircraftSubTab === 'battle' ? renderBattleLevelTab() : (
                    <>
                      <div className="flex gap-2 mb-6 w-full overflow-x-auto pb-2 scrollbar-hide">
                        {currentShips.map((ship) => {
                          const isUnlocked = (unlockedTechLevels[routeTier] || 0) >= ship.level;
                          return (
                            <button
                              key={ship.level}
                              onClick={() => setShipPageIndex(ship.level - 1)}
                              className={`flex-1 min-w-0 py-3 px-2 rounded-xl border transition-all duration-300 font-bold text-base sm:text-base ${
                                shipPageIndex === ship.level - 1
                                  ? `${themeBorder} ${themeBg} ${ship.color} ${themeGlow}`
                                  : `border-slate-800 bg-slate-900/50 ${ship.color} opacity-40 hover:opacity-70 hover:border-slate-700`
                              } ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[14px] sm:text-base uppercase tracking-wider opacity-60">Lvl {ship.level}</span>
                                <span className="truncate w-full text-center">{translateData(ship.name)}</span>
                                {!isUnlocked && <Lock className="w-3 h-3 mt-1" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={shipPageIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-full"
                        >
                          {currentShips[shipPageIndex] && (
                            <>
                              <div className={`p-6 rounded-2xl border ${themeBorder} ${themeBg} relative overflow-hidden group flex flex-col justify-between h-full`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${themeAccent} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                                
                                <div className="space-y-6">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className={`text-4xl font-bold ${currentShips[shipPageIndex].color} mb-2`}>
                                        {translateData(currentShips[shipPageIndex].name)}
                                      </h3>
                                      <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[14px] font-bold border border-slate-700">
                                          Nível {currentShips[shipPageIndex].level}
                                        </span>
                                        <span className="text-slate-400 text-[14px] flex items-center gap-1.5">
                                          <Cpu className="w-3.5 h-3.5" />
                                          {translateData(currentShips[shipPageIndex].technology)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className={`p-4 rounded-2xl bg-slate-900/80 border ${themeBorder} ${themeGlow} flex items-center justify-center overflow-hidden`}>
                                      <ShipVisual ship={currentShips[shipPageIndex]} className="w-12 h-12" />
                                    </div>
                                  </div>

                                  <p className="text-slate-300 text-lg leading-relaxed italic opacity-80 max-w-[95%]">
                                    &quot;{translateData(currentShips[shipPageIndex].description)}&quot;
                                  </p>
                                </div>

                                <div className="mt-auto space-y-6 pb-2">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 group/stat">
                                      <div className="text-base text-slate-500 uppercase font-bold mb-1 tracking-widest">{t('speed')}</div>
                                      <div className={`text-xl font-bold font-orbitron ${themeText}`}>{currentShips[shipPageIndex].maxSpeed} <span className="text-base opacity-60 font-mono">km/s</span></div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 group/stat">
                                      <div className="text-base text-slate-500 uppercase font-bold mb-1 tracking-widest">{t('range')}</div>
                                      <div className={`text-lg lg:text-xl font-bold font-orbitron ${themeText} whitespace-nowrap flex items-baseline gap-1`}>
                                        <span>
                                          {(() => {
                                            const val = currentShips[shipPageIndex].range;
                                            if (isInterstellar) return val;
                                            if (val >= 1000000) return Math.floor(val / 1000000) + 'M';
                                            if (val >= 1000) return Math.floor(val / 1000) + (val >= 100000 ? 'k' : 'K');
                                            return val;
                                          })()}
                                        </span>
                                        <span className="text-base opacity-60 font-mono uppercase">{isInterstellar ? 'LY' : 'Km'}</span>
                                      </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 group/stat">
                                      <div className="text-base text-slate-500 uppercase font-bold mb-1 tracking-widest">{t('owned')}</div>
                                      <div className={`text-xl font-bold font-orbitron ${themeText}`}>{ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0} <span className="text-base opacity-60">/ 5</span></div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => buyShip(currentShips[shipPageIndex].level)}
                                      disabled={
                                        (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5 || 
                                        (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level ||
                                        (qc < (currentShips[shipPageIndex].level === 1 && (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 1 ? 500 * getEconomicMultipliers().cost : currentShips[shipPageIndex].cost * getEconomicMultipliers().cost) && (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) > 0)
                                      }
                                      className={`flex-1 py-4 rounded-xl font-bold text-xl font-orbitron transition-all flex items-center justify-center gap-2 border-b-4 ${
                                        (ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5
                                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-900'
                                          : (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-900'
                                            : `${themeAccent} bg-gradient-to-r text-white shadow-lg hover:scale-[1.01] active:scale-[0.99] border-black/20`
                                      }`}
                                    >
                                      {(ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) >= 5 ? (
                                        t('max')
                                      ) : (unlockedTechLevels[routeTier] || 0) < currentShips[shipPageIndex].level ? (
                                        <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> {t('locked')}</span>
                                      ) : (
                                        <>
                                          <Coins className="w-6 h-6" />
                                          {(ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0) === 0 ? t('free') : (
                                            currentShips[shipPageIndex].level === 1 ? formatValue(500 * getEconomicMultipliers().cost) : formatValue(currentShips[shipPageIndex].cost * getEconomicMultipliers().cost)
                                          )}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                            <div className="flex flex-col gap-4 h-full">
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shrink-0">
                              <h4 className="text-base font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Info className="w-4 h-4 text-cyan-400" />
                                {t('status')}
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                                  <span className="text-[14px] text-slate-400">Capacidade de Frota</span>
                                  <span className="text-[14px] font-bold text-slate-200">{formatValue(ownedShips[`${routeTier}-${currentShips[shipPageIndex].level}`] || 0)} / 5</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                                  <span className="text-[14px] text-slate-400">Tecnologia Requerida</span>
                                  <span className={`text-[14px] font-bold ${(unlockedTechLevels[routeTier] || 0) >= currentShips[shipPageIndex].level ? 'text-emerald-400' : 'text-red-400'}`}>
                                    Lvl {currentShips[shipPageIndex].level}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Ship visual representation */}
                            <div className={`flex-1 glass-panel rounded-2xl border ${themeBorder} relative overflow-hidden flex items-center justify-center`}>
                              <div className="absolute inset-0 opacity-10 star-grid pointer-events-none" />
                              
                              {/* Dynamic Background Video - Generated ID from Name */}
                              {(() => {
                                const shipId = currentShips[shipPageIndex].name.toLowerCase().replace(/\s+/g, '-');
                                return (
                                  <video 
                                    key={`v-${shipId}`}
                                    src={`/videos/ships/${shipId}.webm`}
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                    style={{ backgroundColor: 'black' }}
                                  />
                                );
                              })()}

                              <div className={`absolute inset-0 bg-gradient-to-t from-${currentShips[shipPageIndex].color.split('-')[1] || 'cyan'}-500/10 to-transparent pointer-events-none z-10`} />
                              
                              <div className="absolute bottom-4 right-4 flex flex-col items-end opacity-40 z-20">
                                <span className="text-[14px] font-mono whitespace-nowrap">REF: {currentShips[shipPageIndex].name.substring(0, 3).toUpperCase()}</span>
                                <span className="text-[14px] font-mono whitespace-nowrap">X: {4.5 + shipPageIndex * 0.5}.00</span>
                                <span className="text-[14px] font-mono whitespace-nowrap">Y: {12.2 - shipPageIndex * 0.2}.00</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

              {activeTab === 'technology' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col h-full space-y-4"
                >
                  <div className="flex items-center justify-between shrink-0">
                    <div>
                      <h2 className={`text-2xl font-bold ${themeText} flex items-center gap-2`}>
                        <Cpu className="w-6 h-6" />
                        {t('technology')}
                      </h2>
                      <p className="text-slate-400 text-base">
                        {translateData(isInterstellar ? 'Pesquise novas tecnologias para expandir sua frota galáctica.' : 'Pesquise novas tecnologias para expandir sua frota solar.')}
                      </p>
                    </div>

                    {isInterstellar && (
                      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => setTechSubTab('research')}
                          className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                            techSubTab === 'research' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          {t('research')}
                        </button>
                        <button
                          onClick={() => allTechUnlocked && setTechSubTab('extraction')}
                          className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                            !allTechUnlocked ? 'opacity-30 cursor-not-allowed' : ''
                          } ${
                            techSubTab === 'extraction' ? 'bg-orange-500/20 text-orange-400' : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          {allTechUnlocked ? 'Pontos de Extração' : <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Pontos de Extração</span>}
                        </button>
                      </div>
                    )}
                  </div>

                  {techSubTab === 'extraction' && isInterstellar && allTechUnlocked ? (
                    <div className="flex-1 flex flex-col min-h-0 gap-4">
                      {/* Extraction Points Grid */}
                      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                        {(extractionPageIndex === 0 
                          ? EXTRACTION_POINTS.slice(0, 5) 
                          : EXTRACTION_POINTS.slice(5, 9)
                        ).map((point, pageIdx) => {
                          const index = extractionPageIndex === 0 ? pageIdx : pageIdx + 5;
                          const isUnlocked = unlockedExtractionPoints.includes(point.id);
                          const isResearching = researchingExtractionPoint?.id === point.id;
                          const packs = extractionPacks[point.id] || 0;
                          const canResearch = !researchingExtractionPoint && qc >= point.cost;
                          
                          const robotLevel = extractionRobotLevels[point.id] || 0;
                          const prodLevel = extractionProductionLevels[point.id] || 0;
                          const compressionLevel = extractionCompressionLevels[point.id] || 0;
                          const isAutoSellActive = extractionAutoSell[point.id];
                          const isAutoSellUnlocked = extractionAutoSellUnlocked[point.id];

                          let progress = 0;
                          if (isResearching && researchingExtractionPoint) {
                            const elapsed = Date.now() - researchingExtractionPoint.startTime;
                            progress = Math.min(100, (elapsed / point.researchTime) * 100);
                          }

                          return (
                            <div
                              key={point.id}
                              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col h-full ${
                                isUnlocked 
                                  ? `border-orange-500/40 bg-orange-900/10 shadow-[0_0_15px_rgba(234,88,12,0.2)]` 
                                  : isResearching
                                    ? 'border-orange-500/20 bg-orange-900/5'
                                    : 'border-slate-800 bg-slate-900/50 opacity-80'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1 pr-2">
                                    <h3 className={`font-bold leading-tight h-[2.8em] line-clamp-2 text-[14px] sm:text-base ${isUnlocked ? 'text-orange-400' : 'text-slate-200'}`}>
                                      {point.name}
                                    </h3>
                                    {isUnlocked ? (
                                      <div className="mt-1 space-y-1">
                                        <div className="flex justify-between items-center text-[15px]">
                                          <span className="text-slate-400">Progresso:</span>
                                          <span className="text-orange-400 font-mono">{(extractionCycleProgress[point.id] || 0).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                          <div 
                                            className="h-full bg-gradient-to-r from-slate-400 via-white to-slate-400 shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-[width] duration-300 ease-linear"
                                            style={{ width: `${extractionCycleProgress[point.id] || 0}%` }}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-base text-slate-400 mt-1">
                                        Custo: {formatValue(point.cost)} QC
                                      </p>
                                    )}
                                  </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isUnlocked && (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[15px] text-slate-500 uppercase font-mono">{point.resourceName}</span>
                                      <span className="text-base font-bold text-orange-400">{formatValue(packs)} / 1.000</span>
                                    </div>
                                  )}
                                  {!isUnlocked && !isResearching && (
                                    <Lock className="w-4 h-4 text-slate-600" />
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3 mt-auto">
                                {isUnlocked ? (
                                  <div className="space-y-6 flex-1 flex flex-col">
                                    {/* Upgrades Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => upgradeExtractionRobot(point.id)}
                                        disabled={robotLevel >= 5 || qc < (1000000000 * Math.pow(2, robotLevel))}
                                        className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                                          robotLevel >= 5
                                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 font-orbitron'
                                            : qc >= (1000000000 * Math.pow(2, robotLevel))
                                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                              : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                                        }`}
                                      >
                                        <Bot className="w-4 h-4" />
                                        <span className="text-[15px] font-bold uppercase">Robô Lvl {robotLevel}</span>
                                        {robotLevel < 5 && (
                                          <span className="text-[14px] opacity-60 font-mono">{formatValue(1000000000 * Math.pow(2, robotLevel))}</span>
                                        )}
                                      </button>

                                      <button
                                        onClick={() => upgradeExtractionProduction(point.id)}
                                        disabled={prodLevel >= 6 || qc < (EXTRACTION_PRODUCTION_COSTS[prodLevel + 1] * Math.pow(1.1, index))}
                                        className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                                          prodLevel >= 6
                                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 font-orbitron'
                                            : qc >= (EXTRACTION_PRODUCTION_COSTS[prodLevel + 1] * Math.pow(1.1, index))
                                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                              : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                                        }`}
                                      >
                                        <Pickaxe className="w-4 h-4" />
                                        <span className="text-[15px] font-bold uppercase">Picareta Lvl {prodLevel}</span>
                                        {prodLevel < 6 && (
                                          <span className="text-[14px] opacity-60 font-mono">{formatValue(EXTRACTION_PRODUCTION_COSTS[prodLevel + 1] * Math.pow(1.1, index))}</span>
                                        )}
                                      </button>

                                      <button
                                        onClick={() => upgradeExtractionCompression(point.id)}
                                        disabled={compressionLevel >= 10 || qc < Math.floor(100000000 * Math.pow(1.2, compressionLevel))}
                                        className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                                          compressionLevel >= 10
                                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 font-orbitron'
                                            : qc >= Math.floor(100000000 * Math.pow(1.2, compressionLevel))
                                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                              : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                                        }`}
                                      >
                                        <Zap className="w-4 h-4" />
                                        <span className="text-[15px] font-bold uppercase">Compactação Lvl {compressionLevel}</span>
                                        {compressionLevel < 10 && (
                                          <span className="text-[14px] opacity-60 font-mono">{formatValue(Math.floor(100000000 * Math.pow(1.2, compressionLevel)))}</span>
                                        )}
                                      </button>

                                      {isAutoSellUnlocked ? (
                                        <button
                                          onClick={() => toggleExtractionAutoSell(point.id)}
                                          className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                                            isAutoSellActive 
                                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-orbitron' 
                                              : 'bg-slate-800 border-slate-700 text-slate-400'
                                          }`}
                                        >
                                          <Cpu className={`w-4 h-4 ${isAutoSellActive ? 'animate-pulse' : ''}`} />
                                          <span className="text-[14px] font-bold uppercase">{isAutoSellActive ? 'Auto: ON' : 'Auto: OFF'}</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => buyExtractionAutoSell(point.id)}
                                          disabled={qc < 5000000000}
                                          className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                                            qc >= 5000000000
                                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 font-orbitron'
                                              : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                                          }`}
                                        >
                                          <Cpu className="w-4 h-4 opacity-40" />
                                          <span className="text-[14px] font-bold uppercase">Auto Venda</span>
                                          <span className="text-[7px] opacity-60 font-mono">{formatValue(5000000000)}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : isResearching ? (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-base text-orange-400 font-bold uppercase">
                                      <span>Pesquisando Local...</span>
                                      <span className="font-mono">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                      <motion.div 
                                        className="h-full bg-gradient-to-r from-slate-400 via-white to-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (canResearch) {
                                        setQc(c => c - point.cost);
                                        updateHistoryStats('spent', point.cost);
                                        setResearchingExtractionPoint({
                                          id: point.id,
                                          startTime: Date.now(),
                                          endTime: Date.now() + point.researchTime
                                        });
                                        playSfx('buy');
                                      }
                                    }}
                                    disabled={!canResearch}
                                    className={`w-full py-2.5 rounded-lg font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${
                                      canResearch
                                        ? 'bg-orange-600 hover:bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                    }`}
                                  >
                                    <Search className="w-4 h-4" />
                                    PESQUISAR PONTO
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Pagination Toggle Arrow */}
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setExtractionPageIndex(prev => prev === 0 ? 1 : 0)}
                            className="group relative flex flex-col items-center gap-2 p-6 rounded-2xl border border-orange-500/20 bg-orange-900/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all rounded-full" />
                            <div className="relative">
                              {extractionPageIndex === 0 ? (
                                <ChevronRight className="w-10 h-10 text-orange-400 group-hover:translate-x-1 transition-transform" />
                              ) : (
                                <ChevronLeft className="w-10 h-10 text-orange-400 group-hover:-translate-x-1 transition-transform" />
                              )}
                            </div>
                            <span className="text-base font-orbitron font-bold text-orange-400 uppercase tracking-widest">
                              {extractionPageIndex === 0 ? 'Ver outros 4 pontos' : 'Voltar para os 5 pontos'}
                            </span>
                            <div className="flex gap-1 mt-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${extractionPageIndex === 0 ? 'bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.8)]' : 'bg-slate-700'}`} />
                              <div className={`w-1.5 h-1.5 rounded-full ${extractionPageIndex === 1 ? 'bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.8)]' : 'bg-slate-700'}`} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch h-full">
                      {TECHNOLOGIES.filter(tech => tech.tier === routeTier).map((tech) => {
                        const currentLevel = unlockedTechLevels[routeTier] || 0;
                        const isUnlocked = currentLevel >= tech.level;
                        const isResearching = researchingTech?.tier === routeTier && researchingTech?.level === tech.level;
                        const isNext = tech.level === currentLevel + 1;
                        const multipliers = getEconomicMultipliers();
                        const cost = tech.cost * multipliers.cost;
                        const canResearch = isNext && !researchingTech && qc >= cost;

                        const shipForTech = SHIPS.find(s => s.tier === routeTier && s.level === tech.unlocksShipLevel);
                        const shipColorClass = shipForTech?.color || 'text-cyan-400';
                        
                        let progress = 0;
                        let researchTime = activeCodes['SLIKE'] && !isSpeedRun ? 3600000 : tech.researchTime;
                        if (routeTier === 'Interstellar') researchTime *= 0.5;

                        if (isResearching && researchingTech) {
                          const elapsed = Date.now() - researchingTech.startTime;
                          progress = Math.min(100, (elapsed / researchTime) * 100);
                        }

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
                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]`}>
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : isResearching && (routeTier === 'Solar' || routeTier === 'Interstellar') ? (
                                <button
                                  onClick={boostResearch}
                                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 transition-all group/skip cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse`}
                                  title={language === 'pt' ? `Pular Tempo por ${formatValue(Math.floor(tech.cost * multipliers.cost * 0.75))} QC` : `Skip Time for ${formatValue(Math.floor(tech.cost * multipliers.cost * 0.75))} QC`}
                                >
                                  <Zap className="w-4 h-4 group-hover/skip:scale-110 transition-transform" />
                                </button>
                              ) : (
                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-white/5 border-white/10 text-slate-600`}>
                                  <Lock className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="mt-auto space-y-2">
                              <div className="flex items-center gap-2 text-[15px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Rocket className={`w-3 h-3 ${isUnlocked ? shipColorClass : 'text-slate-600'}`} />
                                <span>{t('unlocksShip')} {tech.unlocksShipLevel}</span>
                              </div>

                              {isUnlocked ? (
                                <div className="py-1.5 rounded-lg bg-gradient-to-r from-slate-400 via-white to-slate-400 border border-white/30 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Zap className="w-3 h-3 text-slate-900" />
                                  </motion.div>
                                  <span className="text-[15px] font-black uppercase tracking-widest text-slate-900">
                                    {t('unlocked')}
                                  </span>
                                </div>
                              ) : isResearching ? (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[14px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>{t('researching')}</span>
                                    <span>{Math.floor(progress)}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-slate-400 via-white to-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => setResearchingTech(null)}
                                      className="flex-1 py-1 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded-md font-bold text-[14px] uppercase border border-red-500/30 transition-all"
                                    >
                                      {t('cancel')}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-base font-bold text-amber-500">
                                      <Coins className="w-3 h-3" />
                                      {cost === 0 ? t('free') : formatValue(cost)}
                                    </div>
                                    {researchTime > 0 && (
                                      <div className="flex items-center gap-1 text-[14px] font-bold text-slate-500 uppercase">
                                        <Clock className="w-2.5 h-2.5" />
                                        {Math.floor(researchTime / 60000)}m
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => buyTechnology(tech)}
                                    disabled={!canResearch}
                                    className={`w-full py-2 rounded-lg text-base font-bold transition-all uppercase tracking-widest ${
                                      canResearch
                                        ? `${isInterstellar ? 'bg-orange-600 text-black hover:bg-orange-500' : 'bg-cyan-600 text-black hover:bg-cyan-500'} shadow-lg`
                                        : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5'
                                    }`}
                                  >
                                    {t('research')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

                  {activeTab === 'upgrades' && (
                <motion.div 
                  key="upgrades"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col h-full space-y-3"
                >
                  {!selectedUpgradeLocation ? (
                    <div className="flex-1 flex flex-col space-y-3">
                      {/* RHSE Header (Always Open) */}
                      {!isSpeedRun && (
                        <div className={`w-full glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-xl p-3 bg-white/5 relative overflow-hidden shrink-0`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isInterstellar ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'}`}>
                                <Zap className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-orbitron text-base font-bold text-white uppercase tracking-wider">{t('rhse')}</h3>
                                <p className={`text-[14px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest leading-none mt-0.5`}>{t('rhseConcept')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {aetherionTubes > 0 && <div className={`text-[14px] font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} border ${isInterstellar ? 'border-orange-500/30' : 'border-cyan-500/30'} px-2 py-0.5 rounded animate-pulse`}>{aetherionTubes} TUBES</div>}
                              <ChevronUp className={`w-4 h-4 ${isInterstellar ? 'text-orange-500/40' : 'text-cyan-500/40'}`} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RHSE Content (Always Open) */}
                      <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-xl p-3 bg-white/5 space-y-4 shrink-0 mt-1`}>
                        {isInterstellar && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Extraction Technology Upgrade */}
                            <button
                              onClick={() => {
                                const cost = 10000 * Math.pow(2.5, extractionTechLevel);
                                if (qc >= cost && extractionTechLevel < 10) {
                                  setQc(prev => prev - cost);
                                  setExtractionTechLevel(prev => prev + 1);
                                  playSfx('upgrade');
                                  addLog(`${t('extractionTech')} UPGRADED: Level ${extractionTechLevel + 1}`, 'success');
                                }
                              }}
                              disabled={extractionTechLevel >= 10 || qc < (10000 * Math.pow(2.5, extractionTechLevel))}
                              className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1 h-full ${
                                extractionTechLevel >= 10 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default' 
                                  : qc >= (10000 * Math.pow(2.5, extractionTechLevel))
                                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                    : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('extractionTech')}</span>
                                <span className="text-base font-mono font-bold">{extractionTechLevel >= 10 ? 'MAX' : `LVL ${extractionTechLevel}`}</span>
                              </div>
                              {extractionTechLevel < 10 && (
                                <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                                  {formatValue(10000 * Math.pow(2.5, extractionTechLevel))} QC
                                </div>
                              )}
                            </button>

                            {/* Solar Mapping Upgrade */}
                            <button
                              onClick={() => {
                                const cost = 10000 * Math.pow(2.5, solarMappingLevel);
                                if (qc >= cost && solarMappingLevel < 10) {
                                  setQc(prev => prev - cost);
                                  setSolarMappingLevel(prev => prev + 1);
                                  playSfx('upgrade');
                                  addLog(`${t('solarMapping')} UPGRADED: Level ${solarMappingLevel + 1}`, 'success');
                                }
                              }}
                              disabled={solarMappingLevel >= 10 || qc < (10000 * Math.pow(2.5, solarMappingLevel))}
                              className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1 h-full ${
                                solarMappingLevel >= 10 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default' 
                                  : qc >= (10000 * Math.pow(2.5, solarMappingLevel))
                                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                    : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('solarMapping')}</span>
                                <span className="text-base font-mono font-bold">{solarMappingLevel >= 10 ? 'MAX' : `LVL ${solarMappingLevel}`}</span>
                              </div>
                              {solarMappingLevel < 10 && (
                                <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                                  {formatValue(10000 * Math.pow(2.5, solarMappingLevel))} QC
                                </div>
                              )}
                            </button>

                            {/* Double Route Upgrade (New) */}
                            <button
                              onClick={() => {
                                const cost = DOUBLE_ROUTE_COSTS[doubleRouteLevel];
                                if (qc >= cost && doubleRouteLevel < 5) {
                                  setQc(prev => prev - cost);
                                  setDoubleRouteLevel(prev => prev + 1);
                                  playSfx('upgrade');
                                  addLog(`${t('doubleRoute')} UPGRADED: Level ${doubleRouteLevel + 1}`, 'success');
                                }
                              }}
                              disabled={doubleRouteLevel >= 5 || qc < (DOUBLE_ROUTE_COSTS[doubleRouteLevel] || 0)}
                              className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1 h-full ${
                                doubleRouteLevel >= 5 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default' 
                                  : qc >= (DOUBLE_ROUTE_COSTS[doubleRouteLevel] || 0)
                                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                    : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('doubleRoute')}</span>
                                <span className="text-base font-mono font-bold">{doubleRouteLevel >= 5 ? 'MAX' : `LVL ${doubleRouteLevel}`}</span>
                              </div>
                              {doubleRouteLevel < 5 && (
                                <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                                  {formatValue(DOUBLE_ROUTE_COSTS[doubleRouteLevel])} QC
                                </div>
                              )}
                            </button>

                            {/* Doom Protocol Upgrade (New) */}
                            <button
                              onClick={() => {
                                const cost = DOOM_P_COSTS[doomPLevel];
                                if (qc >= cost && doomPLevel < 10) {
                                  setQc(prev => prev - cost);
                                  setDoomPLevel(prev => prev + 1);
                                  playSfx('upgrade');
                                  addLog(`${t('doomP')} UPGRADED: Level ${doomPLevel + 1}`, 'success');
                                }
                              }}
                              disabled={doomPLevel >= 10 || qc < (DOOM_P_COSTS[doomPLevel] || 0)}
                              className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1 h-full ${
                                doomPLevel >= 10 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default' 
                                  : qc >= (DOOM_P_COSTS[doomPLevel] || 0)
                                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                    : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-base font-orbitron font-bold uppercase tracking-wider">{t('doomP')}</span>
                                <span className="text-base font-mono font-bold">{doomPLevel >= 10 ? 'MAX' : `LVL ${doomPLevel}`}</span>
                              </div>
                              {doomPLevel < 10 && (
                                <div className="mt-auto text-[15px] font-mono font-bold text-right pt-1">
                                  {formatValue(DOOM_P_COSTS[doomPLevel])} QC
                                </div>
                              )}
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                          {/* Mining Waste */}
                          <div className="space-y-1.5 shadow-sm">
                            <div className="flex justify-between items-end px-1">
                              <span className="text-[15px] font-orbitron text-slate-400 uppercase tracking-widest">♻️ {t('miningWaste')}</span>
                              <span className="text-base font-mono font-bold text-white">{formatValue(miningWaste)} / {formatValue(7500)}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                              <motion.div 
                                className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                animate={{ width: `${(miningWaste / 7500) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Solar Energy */}
                          <div className="space-y-1.5 shadow-sm">
                            <div className="flex justify-between items-end px-1">
                              <span className="text-[15px] font-orbitron text-slate-400 uppercase tracking-widest">☀️ {t('solarEnergy')}</span>
                              <span className="text-base font-mono font-bold text-white">{solarEnergy} / 7500</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                              <motion.div 
                                className="h-full rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                                animate={{ width: `${(solarEnergy / 7500) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1 border-t border-white/5 mt-1">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-[15px] font-orbitron text-slate-500 uppercase tracking-widest">{t('aetherionTubes')}</span>
                              <div className="flex gap-1 mt-1">
                                {Array.from({ length: 10 }).map((_, i) => {
                                  const isOverfilled = isInterstellar && aetherionTubes > 10 && i < aetherionTubes - 10;
                                  const isFilled = i < aetherionTubes;
                                  
                                  return (
                                    <div 
                                      key={i} 
                                      className={`w-2 h-4 rounded-sm border transition-all ${
                                        isOverfilled
                                        ? 'bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.6)]'
                                        : (isFilled 
                                          ? (isInterstellar ? 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]')
                                          : 'bg-white/5 border-white/10')
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-base font-mono font-bold text-white ml-2">
                              {aetherionTubes} / {isInterstellar ? 20 : 10}
                            </div>
                          </div>

                          <button
                            onClick={synthesizeAetherion}
                            disabled={aetherionTubes <= 0}
                            className={`px-5 py-2 rounded-xl font-orbitron font-bold text-[15px] tracking-widest transition-all flex items-center gap-2 uppercase ${
                              aetherionTubes > 0
                              ? (isInterstellar ? 'bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]')
                              : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                            }`}
                          >
                            <RefreshCw className={`w-3 h-3 ${aetherionTubes > 0 ? 'animate-spin-slow' : ''}`} />
                            {language === 'pt' ? 'SINTETIZAR ÉTERION' : 'SYNTHESIZE AETHERION'}
                          </button>
                        </div>
                      </div>


                      {/* Ships Grid 3x3 */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch h-full">
                        {ROUTES.filter(r => unlockedRouteIds.includes(r.id) && r.tier === routeTier).map(route => {
                        const ship = SHIPS.find(s => s.level === route.requiredShipLevel && s.tier === routeTier)!;
                        const locationTech = techLevels[route.id] || { engine: 0, ai: 0, value: 0, rare: 0 };
                        const isMaxed = locationTech.engine >= 5 && locationTech.ai >= 6 && locationTech.value >= 5 && locationTech.rare >= 5;

                        return (
                          <button
                            key={route.id}
                            onClick={() => setSelectedUpgradeLocation(route.id)}
                            className={`glass-panel ${getShipNeonBorder(ship.color)} rounded-xl p-4 hover:bg-white/5 transition-all text-left group relative h-full flex flex-col justify-center ${isMaxed ? 'opacity-90' : 'opacity-100'}`}
                          >
                            {isMaxed && (
                              <div className={`absolute inset-0 bg-black/40 rounded-xl pointer-events-none -z-10`} />
                            )}
                            <div className="flex justify-between items-center w-full">
                              <div>
                                <h3 className={`font-orbitron text-base md:text-lg font-black ${ship.color} uppercase tracking-tight leading-tight`}>{ship.name}</h3>
                                <p className={`text-[15px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} uppercase tracking-widest leading-none mt-1`}>{t('manageInfrastructure')}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {isMaxed && (
                                  <div className={`text-[14px] md:text-base font-orbitron font-black ${ship.color} border-2 ${ship.color.replace('text-', 'border-').replace('-400', '-500/50')} px-3 py-1 rounded shadow-[0_0_15px_currentColor]`}>
                                    MAX
                                  </div>
                                )}
                                <ArrowRight className={`w-5 h-5 ${isInterstellar ? 'text-orange-500/40 group-hover:text-orange-400' : 'text-cyan-500/40 group-hover:text-cyan-400'} group-hover:translate-x-1 transition-all`} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                    <div className="flex flex-col h-full gap-4">
                      {/* Back Button - Top Level */}
                      <button 
                        onClick={() => setSelectedUpgradeLocation(null)}
                        className={`text-lg font-orbitron font-bold ${isInterstellar ? 'text-orange-500 hover:text-orange-400' : 'text-cyan-500 hover:text-cyan-400'} flex items-center gap-2 uppercase tracking-widest shrink-0 w-fit`}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" /> {t('back')}
                      </button>

                      <div className="grid grid-cols-4 grid-rows-[auto_1fr_1fr] gap-6 flex-1 min-h-0">
                        {/* ROW 1: Evolution Progress (Left 50%) + Title (Right 50%) */}
                        <div className="col-span-2">
                          <div className={`h-full glass-panel rounded-3xl border-2 ${themeBorder} bg-white/5 p-6 flex flex-col justify-center overflow-hidden relative`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                            <div className="flex justify-between items-center gap-8">
                              <div className="flex flex-col gap-1">
                                <h3 className="text-[10px] font-orbitron font-bold text-white/40 uppercase tracking-[0.4em] flex items-center gap-2">
                                  <Activity className="w-3 h-3" /> Ship Evolution Status
                                </h3>
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[13px]">Upgrades Completion</span>
                              </div>
                              {(() => {
                                const locationTech = techLevels[selectedUpgradeLocation] || { engine: 0, ai: 0, value: 0, rare: 0 };
                                const totalLevels = Object.values(locationTech).reduce((a, b) => a + (b as number), 0);
                                // Accurate max possible calculation summing each upgrade's max level
                                const maxPossible = UPGRADES.reduce((acc, upg) => acc + (upg.tiers.length - 1), 0);
                                const percent = Math.min(Math.floor((totalLevels / maxPossible) * 100), 100);
                                return (
                                  <div className="flex items-center gap-6 flex-1">
                                    <div className="h-3 flex-1 bg-black/60 rounded-full overflow-hidden p-[2px] border border-white/10">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-1000 relative ${isInterstellar ? 'bg-orange-500' : 'bg-pink-600'}`}
                                        style={{ width: `${percent}%` }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                      </div>
                                    </div>
                                    <span className={`text-3xl font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : 'text-cyan-400'} leading-none min-w-[80px] text-right`}>{percent}%</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className={`h-full glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-3xl p-6 bg-white/5 border-2 flex items-center justify-center relative overflow-hidden`}>
                            <h2 className={`text-xl font-orbitron font-bold ${SHIPS.find(s => s.level === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.requiredShipLevel || 1) && s.tier === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.tier || routeTier))?.color || (isInterstellar ? 'text-orange-400' : 'text-cyan-400')} uppercase tracking-widest flex items-center gap-4`}>
                              <Settings className="w-8 h-8 animate-spin-slow" /> {SHIPS.find(s => s.level === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.requiredShipLevel || 1) && s.tier === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.tier || routeTier))?.name} {t('upgrades')}
                            </h2>
                          </div>
                        </div>

                        {/* ROW 2 & 3: Video (Left Span 2x2) + Upgrades (Right 2x2) */}
                        <div className="col-span-2 row-span-2">
                          <div className={`h-full glass-panel rounded-3xl border-2 ${themeBorder} relative overflow-hidden flex items-center justify-center shadow-2xl shadow-black/50`}>
                            <div className="absolute inset-0 opacity-20 star-grid pointer-events-none" />
                            
                            {/* Maintenance/Hangar Video */}
                            {(() => {
                              const shipData = SHIPS.find(s => s.level === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.requiredShipLevel || 1) && s.tier === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.tier || routeTier));
                              const shipId = shipData?.name.toLowerCase().replace(/\s+/g, '-') || 'atlas-courier';
                              return (
                                <video 
                                  key={`h-${shipId}`}
                                  src={`/videos/hangar/${shipId}.webm`}
                                  autoPlay 
                                  loop 
                                  muted 
                                  playsInline
                                  className="absolute inset-0 w-full h-full object-cover z-0"
                                  style={{ backgroundColor: 'black' }}
                                />
                              );
                            })()}

                            <div className={`absolute inset-0 bg-gradient-to-t from-${SHIPS.find(s => s.level === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.requiredShipLevel || 1) && s.tier === (ROUTES.find(r => r.id === selectedUpgradeLocation)?.tier || routeTier))?.color.split('-')[1] || 'cyan'}-500/20 to-transparent pointer-events-none z-10`} />
                            
                            <div className="absolute bottom-6 right-6 flex flex-col items-end opacity-60 z-20 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10">
                              <span className="text-base font-mono font-bold whitespace-nowrap uppercase tracking-tighter text-white">Status: Maintenance</span>
                              <span className="text-base font-mono font-bold whitespace-nowrap uppercase tracking-tighter text-white">Hangar: SEC-0{ROUTES.find(r => r.id === selectedUpgradeLocation)?.requiredShipLevel}</span>
                            </div>
                          </div>
                        </div>

                        {/* UPGRADE CARDS (4 units) */}
                        {UPGRADES.map(upgrade => {
                          const locationTech = techLevels[selectedUpgradeLocation] || { engine: 0, ai: 0, value: 0, rare: 0 };
                          const level = locationTech[upgrade.id.toLowerCase()] || 0;
                          const currentTier = upgrade.tiers.find(t => t.level === level) || { name: 'Base', bonus: 'Nenhum' };
                          const nextTier = upgrade.tiers.find(t => t.level === level + 1);
                          
                          const multiplier = getLocationMultiplier(selectedUpgradeLocation);
                          const multipliers = getEconomicMultipliers();
                          const cost = nextTier ? Math.floor(nextTier.cost * multiplier * multipliers.cost * (isInterstellar ? 1.5 : 1)) : 0;
                          const canAfford = qc >= cost;
                          
                          const maxLvl = upgrade.tiers.length - 1;
                          const progressPercent = (level / maxLvl) * 100;

                          return (
                            <div key={upgrade.id} className={`glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-3xl p-5 flex flex-col hover:bg-white/5 transition-all border-2 group h-full min-h-0 relative`}>
                              <div className="flex justify-between items-start mb-3 shrink-0">
                                <h3 className="font-orbitron text-lg font-bold text-white leading-tight uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{translateData(upgrade.name)}</h3>
                                <div className={`text-sm font-orbitron font-bold ${isInterstellar ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'} px-3 py-0.5 rounded border`}>{t('level').toUpperCase()} {level}</div>
                              </div>
                              <div className={`text-md font-bold ${isInterstellar ? 'text-orange-100' : 'text-cyan-100'} mb-1 leading-tight uppercase tracking-tight shrink-0`}>{translateData(currentTier.name)}</div>
                              <p className={`text-[13px] font-mono ${isInterstellar ? 'text-orange-500/60' : 'text-cyan-500/60'} mb-auto flex-1 leading-relaxed uppercase tracking-tighter overflow-hidden`}>{t('bonus')}: {translateData(currentTier.bonus)}</p>
                              
                              <div className="mt-4 shrink-0">
                                <button
                                  disabled={!canAfford}
                                  onClick={() => buyUpgrade(selectedUpgradeLocation, upgrade)}
                                  className={`w-full py-3 rounded-xl font-orbitron font-bold text-lg tracking-[0.2em] transition-all flex items-center justify-center gap-2 uppercase border-b-4 relative overflow-hidden ${
                                    canAfford
                                    ? (isInterstellar ? 'bg-orange-950 text-orange-400 border-orange-700' : 'bg-pink-950 text-pink-400 border-pink-800')
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed border-slate-800'
                                  }`}
                                >
                                  <div 
                                    className={`absolute inset-y-0 left-0 opacity-40 transition-all duration-500 ${isInterstellar ? 'bg-orange-500' : 'bg-pink-600'}`} 
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                  <span className="relative z-10 flex items-center gap-2">
                                    <Coins className="w-5 h-5" />
                                    {nextTier ? formatValue(cost) : t('max').toUpperCase()}
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
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
                        onClick={() => setActiveTab(isEarth ? 'colonies' : isVoid ? 'void_aircraft' : isInterstellar ? 'routes2' : 'routes')}
                        className="w-full py-2 text-base font-orbitron text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                      >
                        {language === 'pt' ? 'VOLTAR' : 'BACK'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'void_aircraft' && (
                <motion.div
                  key="void_aircraft"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderVoidAircraft()}
                </motion.div>
              )}
              {activeTab === 'void_battle' && (
                <motion.div
                  key="void_battle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderVoidBattleShip()}
                </motion.div>
              )}
              {activeTab === 'void_map' && (
                <motion.div
                  key="void_map"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderVoidMap()}
                </motion.div>
              )}
              {activeTab === 'void_war' && (
                <motion.div
                  key="void_war"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderVoidWarCore()}
                </motion.div>
              )}
              {activeTab === 'colonies' && (
                <motion.div
                  key="colonies"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <ColonySystem 
                    language={language as any}
                    onAddYear={addEarthYears}
                    onTabStatusChange={(isOpen) => { isColoniesOpenRef.current = isOpen; }}
                    onBuildingComplete={handleBuildingComplete}
                    onAllocate10k={() => setEarthProjectBoostCount(prev => prev + 1)}
                    earthPopulation={earthPopulation}
                    setEarthPopulation={setEarthPopulation}
                    colonies={colonies}
                    setColonies={setColonies}
                  />
                </motion.div>
              )}
              {activeTab === 'void_earth' && (
                <motion.div
                  key="void_earth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {isEarth ? renderEarthTab() : renderVoidEarth()}
                </motion.div>
              )}
              {activeTab === 'history' && (
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
                      {/* Decorative Background Elements */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                      </div>

                      <motion.div 
                        className="relative w-64 h-64 z-10"
                        animate={{ 
                          y: [0, -15, 0],
                          rotate: [-1, 1, -1]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {/* Happy Robot UI */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-900/40 to-black/60 rounded-[3rem] border-2 border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.2)] overflow-hidden backdrop-blur-md">
                          {/* Scan Effect */}
                          <motion.div 
                            className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-emerald-400/10 to-transparent z-10"
                            animate={{ top: ["-50%", "100%", "-50%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          />
                          
                          {/* Eyes Container */}
                          <div className="absolute top-1/3 left-0 right-0 flex justify-around px-12">
                            {/* Left Eye */}
                            <motion.div 
                              className="w-8 h-8 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] relative"
                              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                              transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.92, 0.94, 1] }}
                            >
                              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-90" />
                            </motion.div>
                            {/* Right Eye */}
                            <motion.div 
                              className="w-8 h-8 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] relative"
                              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                              transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.92, 0.94, 1] }}
                            >
                              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-90" />
                            </motion.div>
                          </div>
                          
                          {/* Happy Mouth */}
                          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-20 h-10">
                            <svg viewBox="0 0 100 50" className="w-full h-full fill-none stroke-emerald-400 stroke-[6]">
                              <path d="M10,10 Q50,50 90,10" />
                            </svg>
                          </div>

                          {/* Glossy Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
                        </div>

                        {/* Floating Hearts/Sparkles */}
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
                      <div className={`glass-panel ${isInterstellar ? 'neon-border-orange' : isVoid ? 'neon-border-purple' : 'neon-border-cyan'} p-4 rounded-xl flex justify-between items-center`}>
                    <div>
                      <h2 className={`text-lg font-orbitron font-bold ${isInterstellar ? 'text-orange-400' : isVoid ? 'text-purple-400' : 'text-cyan-400'} uppercase tracking-tighter`}>{t('history')}</h2>
                      <p className="text-base text-slate-500 font-mono uppercase tracking-widest">{t('gameStatsByRoute')}</p>
                    </div>
                    <div className="flex gap-2">
                      {!isEarth && (
                        <button 
                          onClick={() => setShowRoute2Goals(true)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-orbitron font-bold uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]`}
                        >
                          <Target size={12} />
                          {isVoid ? (language === 'pt' ? 'Metas Projeto Terra' : 'Project Earth Goals') : isInterstellar ? (language === 'pt' ? 'Metas Rota 3' : 'Route 3 Goals') : (language === 'pt' ? 'Metas Rota 2' : 'Route 2 Goals')}
                        </button>
                      )}
                      <button 
                        onClick={exportGameData}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono uppercase tracking-widest transition-all ${isInterstellar ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'} border border-white/5`}
                      >
                        <Download size={12} />
                        {t('export')}
                      </button>
                      <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono uppercase tracking-widest transition-all cursor-pointer ${isInterstellar ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'} border border-white/5`}>
                        <Upload size={12} />
                        {t('import')}
                        <input type="file" className="hidden" accept=".dat" onChange={importGameData} />
                      </label>
                    </div>
                  </div>

                  <div className="relative flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                      {(() => {
                        const tiers = Object.keys(historyStats);
                        const tier = tiers[historyPage] || tiers[0];
                        const stats = historyStats[tier];
                        const isUnlocked = tier === 'Solar' || (tier === 'Interstellar' && isRoute2Unlocked()) || (tier === 'Void' && isRoute3Unlocked()) || (tier === 'Earth' && route4Unlocked);
                        
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
                            className={`glass-panel ${tierBorder} ${tierBg} p-6 rounded-3xl space-y-6 flex-1 flex flex-col`}
                          >
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <button 
                                onClick={() => setHistoryPage(prev => Math.max(0, prev - 1))}
                                disabled={historyPage === 0}
                                className={`p-2 rounded-full transition-all ${historyPage === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                              >
                                <ChevronLeft size={24} />
                              </button>
                              
                              <h3 className={`font-orbitron text-xl font-bold ${tierColor} uppercase tracking-[0.2em]`}>
                                {tierLabel}
                              </h3>

                              <button 
                                onClick={() => setHistoryPage(prev => Math.min(tiers.length - 1, prev + 1))}
                                disabled={historyPage === tiers.length - 1 || (historyPage === 0 && !isRoute2Unlocked()) || (historyPage === 1 && !isRoute3Unlocked()) || (historyPage === 2 && !route4Unlocked)}
                                className={`p-2 rounded-full transition-all ${historyPage === tiers.length - 1 || (historyPage === 0 && !isRoute2Unlocked()) || (historyPage === 1 && !isRoute3Unlocked()) || (historyPage === 2 && !route4Unlocked) ? 'text-slate-700 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                              >
                                <ChevronRight size={24} />
                              </button>
                            </div>

                              {tier === 'Void' ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-12">
                                  <motion.div 
                                    className="relative w-48 h-48"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                  >
                                    {/* Stylized Robot Head */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-900/40 to-black/60 rounded-[2.5rem] border-2 border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.2)] overflow-hidden backdrop-blur-sm">
                                      {/* Scanning Line */}
                                      <motion.div 
                                        className="absolute inset-x-0 h-px bg-purple-400/30 z-10"
                                        animate={{ top: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                      />
                                      
                                      {/* Eyes Container */}
                                      <motion.div 
                                        className="absolute top-1/3 left-0 right-0 flex justify-around px-10"
                                        animate={{ x: [-8, 8, -8] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                      >
                                        {/* Left Eye */}
                                        <div className="w-6 h-6 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] relative">
                                          <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full opacity-90" />
                                          <motion.div 
                                            className="absolute inset-0 bg-black/40"
                                            animate={{ height: ["0%", "0%", "100%", "0%", "0%"] }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
                                          />
                                        </div>
                                        {/* Right Eye */}
                                        <div className="w-6 h-6 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] relative">
                                          <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full opacity-90" />
                                          <motion.div 
                                            className="absolute inset-0 bg-black/40"
                                            animate={{ height: ["0%", "0%", "100%", "0%", "0%"] }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
                                          />
                                        </div>
                                      </motion.div>
                                      
                                      {/* Sad Mouth */}
                                      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-4">
                                        <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-purple-400/60 stroke-[4]">
                                          <path d="M10,30 Q50,0 90,30" />
                                        </svg>
                                      </div>

                                      {/* Glossy Overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                                    </div>

                                    {/* Antennas */}
                                    <div className="absolute -top-6 left-1/3 w-1.5 h-8 bg-gradient-to-t from-purple-400/50 to-transparent rounded-full" />
                                    <div className="absolute -top-6 right-1/3 w-1.5 h-8 bg-gradient-to-t from-purple-400/50 to-transparent rounded-full" />
                                    
                                    {/* Floating Particles */}
                                    {[...Array(5)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
                                        animate={{ 
                                          y: [0, -40], 
                                          x: [0, (i - 2) * 20],
                                          opacity: [0, 1, 0] 
                                        }}
                                        transition={{ 
                                          duration: 2 + i, 
                                          repeat: Infinity, 
                                          delay: i * 0.4 
                                        }}
                                        style={{ bottom: '10%', left: '50%' }}
                                      />
                                    ))}
                                  </motion.div>
                                  
                                  <div className="text-center space-y-4">
                                    <motion.h4 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-3xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-200 to-purple-400 uppercase tracking-[0.4em] italic"
                                    >
                                      {t('dataLostInTime')}
                                    </motion.h4>
                                    <div className="flex items-center justify-center gap-4">
                                      <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/50" />
                                      <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-ping" />
                                      <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/50" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                                <div className="space-y-6 flex-1 flex flex-col">
                                <div>
                                  <h4 className="text-base font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                    {t('totalDeliveriesBattlesMining')}
                                  </h4>
                                  <div className="space-y-4 bg-black/20 p-6 rounded-2xl border border-white/5 flex-1">
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('randomBattlesFound')}</span>
                                      <span className="font-mono text-white">{formatValue(stats.randomBattlesFound || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('radarBattlesFound')}</span>
                                      <span className="font-mono text-white">{formatValue(stats.radarBattlesFound || 0)}</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-1" />
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('manualDeliveries')}</span>
                                      <span className="font-mono text-white">{formatValue(stats.manualDeliveries)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('autoDeliveries')}</span>
                                      <span className="font-mono text-white">{formatValue(stats.autoDeliveries)}</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-1" />
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('totalMiningPacksSold')}</span>
                                      <span className="font-mono text-white">{formatValue((stats.manualMiningPacksSold || 0) + (stats.autoMiningPacksSold || 0))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('totalExplorationMiningPacksSold')}</span>
                                      <span className="font-mono text-white">{formatValue((stats.manualExtractionPacksSold || 0) + (stats.autoExtractionPacksSold || 0))}</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-1" />
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono text-base">{t('missionsCompleted')}</span>
                                      <span className="font-mono text-white">{formatValue(stats.missionsCompleted)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-base font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                                    {t('totalQCAcquired')}
                                  </h4>
                                  <div className="space-y-3 bg-black/20 p-6 rounded-2xl border border-white/5 flex-1">
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono">{t('fromDeliveries')}</span>
                                      <span className="font-mono text-emerald-400">+{formatValue(stats.qcFromDeliveries)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono">{t('fromMining')}</span>
                                      <span className="font-mono text-emerald-400">+{formatValue(stats.qcFromMining)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono">{t('fromExplorationMining')}</span>
                                      <span className="font-mono text-emerald-400">+{formatValue(stats.qcFromExtraction || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono">{t('fromMissions')}</span>
                                      <span className="font-mono text-emerald-400">+{formatValue((stats.qcFromMissions || 0) + (stats.qcFromTutorial || 0))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px]">
                                      <span className="text-slate-500 uppercase font-mono">{t('fromAllBattles')}</span>
                                      <span className="font-mono text-emerald-400">+{formatValue(stats.qcFromBattles || 0)}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-1" />
                                    <div className="flex justify-between items-center">
                                      <span className="text-base font-bold text-white uppercase font-orbitron">{t('totalQCAcquired')}</span>
                                      <span className={`text-base font-orbitron ${tierColor}`}>{formatValue(stats.qcTotalAcquired)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-base font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <LogOut className="w-3.5 h-3.5 text-pink-400 rotate-90" />
                                    {t('totalQCSpent')}
                                  </h4>
                                  <div className="bg-pink-500/5 p-6 rounded-2xl border border-pink-500/20">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[15px] text-slate-500 uppercase font-mono">{t('fromAllSources')}</span>
                                      <span className="text-base font-orbitron text-pink-400">-{formatValue(stats.qcSpent)}</span>
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
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Navigation for Mobile/Tablet */}
          <div className={`lg:hidden shrink-0 glass-panel ${isInterstellar ? 'neon-border-orange' : isVoid ? 'neon-border-purple' : 'neon-border-cyan'} rounded-xl flex justify-around items-center p-2 mb-2`}>
            {(isVoid || isEarth
              ? [
                  { id: 'void_aircraft', icon: Rocket, label: t('void_aircraft'), hide: isEarth },
                  { id: 'void_battle', icon: Crosshair, label: t('battle'), alert: isVoidWarActive, hide: isEarth },
                  { id: 'void_map', icon: Map, label: t('void_map'), hide: isEarth },
                  { id: 'void_war', icon: Home, label: t('void_war'), hide: isEarth },
                  { id: 'colonies', icon: Building2, label: t('colonies'), hide: !isEarth },
                  { id: 'void_earth', icon: Globe, label: t('void_earth') },
                  { id: 'mini_games', icon: Gamepad2, label: t('mini_games'), hide: !isArcadeUnlocked },
                  { id: 'history', icon: HistoryIcon, label: t('history'), hide: isSpeedRun },
                  { id: 'exit', icon: LogOut, label: t('exit') }
                ]
              : [
                  { id: 'routes', icon: Map, label: t('routes1' as any), hide: isInterstellar },
                  { id: 'routes2', icon: Globe, label: t('routes2' as any), hide: (!isInterstellar && !isRoute2Unlocked()) || isSpeedRun },
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
                  onClick={() => setActiveTab(item.id as any)}
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
                  {language === 'pt' ? 'SISTEMA DESBLOQUEADO' : 'SYSTEM UNLOCKED'}
                </motion.p>

                <div className="space-y-0.5 opacity-80">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-base md:text-[14px] font-orbitron uppercase tracking-widest text-slate-300"
                  >
                    {language === 'pt' ? 'Você conquistou o Sistema Solar.' : 'You have conquered the Solar System.'}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-base md:text-[14px] font-orbitron uppercase tracking-widest text-slate-400"
                  >
                    {language === 'pt' ? 'Sua jornada interestelar começa agora.' : 'Your interstellar journey begins now.'}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-base md:text-[14px] font-orbitron uppercase tracking-widest text-emerald-400 mt-2"
                  >
                    {language === 'pt' 
                      ? 'Parabéns, você ganhou a Pulsar 1, nave de nível 1 para começar sua jornada.' 
                      : 'Congratulations, you won the Pulsar 1, a level 1 ship to start your journey.'}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="py-2"
                >
                  <span className="text-red-500 font-orbitron font-black text-base md:text-[14px] tracking-[0.2em] uppercase border-y border-red-500/20 py-1 px-4">
                    {language === 'pt' ? 'O SACRIFÍCIO É NECESSÁRIO' : 'SACRIFICE IS REQUIRED'}
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[15px] md:text-[14px] font-orbitron uppercase tracking-widest text-slate-500 max-w-xs mx-auto leading-relaxed"
                >
                  {language === 'pt' 
                    ? 'Seu império atual será convertido em legado para as colônias locais.' 
                    : 'Your current empire will be converted into legacy for local colonies.'}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-base md:text-[14px] font-orbitron font-bold uppercase tracking-[0.2em] text-orange-400/80"
                >
                  {language === 'pt' ? 'RUMO AO PRÓXIMO SALTO' : 'TOWARDS THE NEXT LEAP'}
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
              className={`w-full max-w-2xl glass-panel ${isVoid ? 'neon-border-purple' : isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${isVoid ? 'from-purple-500/5' : isInterstellar ? 'from-orange-500/5' : 'from-cyan-500/5'} to-transparent pointer-events-none`} />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className={`text-xl font-orbitron font-bold text-white tracking-widest uppercase ${isVoid ? 'neon-text-purple' : isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                    {isVoid ? (language === 'pt' ? 'Metas Projeto Terra' : 'Project Earth Goals') : isInterstellar ? (language === 'pt' ? 'Metas para Rota 3' : 'Route 3 Goals') : (language === 'pt' ? 'Metas para Rota 2' : 'Route 2 Goals')}
                  </h2>
                  <p className="text-base text-slate-500 font-mono uppercase tracking-widest">
                    {isVoid 
                      ? (language === 'pt' ? 'Requisitos para a restauração planetária final' : 'Requirements for final planetary restoration')
                      : isInterstellar 
                        ? (language === 'pt' ? 'Caminho necessário para o desbloqueio galáctico' : 'Required path for galactic unlock')
                        : (language === 'pt' ? 'Caminho necessário para o desbloqueio interestelar' : 'Required path for interstellar unlock')}
                  </p>
                </div>
                <button 
                  onClick={() => setShowRoute2Goals(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 relative z-10">
                {(() => {
                  if (isVoid) {
                    const goals = [
                      { id: 'energy', label: language === 'pt' ? 'Células Quânticas enviadas' : 'Quantum Cells sent', progress: earthReconstructionProgress.energy, target: 100 },
                      { id: 'minerals', label: language === 'pt' ? 'Núcleos Minerais Compactados enviados' : 'Compacted Mineral Cores sent', progress: earthReconstructionProgress.minerals, target: 100 },
                      { id: 'tech', label: language === 'pt' ? 'Núcleos de Dados Multifatoriais enviados' : 'Multifactorial Data Cores sent', progress: earthReconstructionProgress.tech, target: 100 },
                      { id: 'food', label: language === 'pt' ? 'Rações de Colonização enviadas' : 'Colonization Rations sent', progress: earthReconstructionProgress.food, target: 100 },
                      { id: 'meds', label: language === 'pt' ? 'Kits Médicos Avançados enviados' : 'Advanced Medical Kits sent', progress: earthReconstructionProgress.meds, target: 100 },
                    ];

                    return goals.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{goal.label}</span>
                          <span className="text-[15px] font-mono text-slate-500">
                            {(goal.progress || 0).toFixed(1)}% / 100%
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress || 0}%` }}
                            className={`h-full bg-gradient-to-r ${(goal.progress || 0) >= 100 ? 'from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'from-purple-500 to-purple-300'}`}
                          />
                        </div>
                      </div>
                    ));
                  }

                  const currentTierPrefix = isInterstellar ? 'Interstellar' : 'Solar';
                  const techs = TECHNOLOGIES.filter(t => t.tier === currentTierPrefix);
                  const currentTechLevel = unlockedTechLevels[currentTierPrefix] || 0;
                  const techsProgress = (currentTechLevel / techs.length) * 100;

                  const ships = SHIPS.filter(s => s.tier === currentTierPrefix);
                  const totalShipsTarget = ships.length * 5;
                  let currentShipsOwned = 0;
                  ships.forEach(ship => {
                    currentShipsOwned += Math.min(5, ownedShips[`${currentTierPrefix}-${ship.level}`] || 0);
                  });
                  const shipsProgress = (currentShipsOwned / totalShipsTarget) * 100;

                  const routes = ROUTES.filter(r => r.tier === currentTierPrefix);
                  const totalPossibleUpgrades = routes.length * UPGRADES.reduce((acc, u) => acc + u.tiers.length, 0);
                  let currentUpgrades = 0;
                  let currentAutoSlots = 0;
                  routes.forEach(route => {
                    const locationUpgrades = techLevels[route.id] || {};
                    Object.values(locationUpgrades).forEach(level => {
                      currentUpgrades += level;
                    });
                    currentAutoSlots += autoTravelSlots[route.id] || 0;
                  });
                  const upgradesProgress = (currentUpgrades / totalPossibleUpgrades) * 100;

                  const totalPossibleAutoSlots = routes.length * 5;
                  const autoSlotsProgress = (currentAutoSlots / totalPossibleAutoSlots) * 100;

                  const ores = ORES.filter(o => o.tier === currentTierPrefix);
                  const totalRobotsTarget = ores.length * 5;
                  let currentRobots = 0;
                  ores.forEach(ore => {
                    currentRobots += miningRobots[ore.id] || 0;
                  });
                  const robotsProgress = (currentRobots / totalRobotsTarget) * 100;

                  let totalRobotLevels = 0;
                  ores.forEach(ore => {
                    totalRobotLevels += miningRobotLevels[ore.id] || 0;
                  });
                  const robotLevelsProgress = (totalRobotLevels / (ores.length * 5)) * 100;

                  const firstOre = ores[0];
                  const currentRefinedCompression = miningCompressionLevels[firstOre?.id || 'ferrita'] || 0;
                  const compressionsProgress = (currentRefinedCompression / 10) * 100;

                  const targetQC = isInterstellar ? 999000000000000 : 1000000000000;
                  const currentQC = historyStats[currentTierPrefix]?.qcTotalAcquired || 0;
                  const qcProgress = Math.min(100, (currentQC / targetQC) * 100);

                  const targetDeliveries = isInterstellar ? 9999 : 3000;
                  const deliveriesProgress = Math.min(100, (totalDeliveries / targetDeliveries) * 100);

                  const goals = [
                    { id: 'techs', label: language === 'pt' ? 'Desbloquear TODAS as tecnologias' : 'Unlock ALL technologies', progress: techsProgress, current: currentTechLevel, target: techs.length },
                    { id: 'ships', label: language === 'pt' ? 'Comprar todas as naves (5 de cada)' : 'Buy all ships (5 of each)', progress: shipsProgress, current: currentShipsOwned, target: totalShipsTarget },
                    { id: 'upgrades', label: language === 'pt' ? 'Comprar TODAS as melhorias de local' : 'Buy ALL location upgrades', progress: upgradesProgress, current: currentUpgrades, target: totalPossibleUpgrades },
                    { id: 'auto', label: language === 'pt' ? 'Comprar TODOS os slots automáticos' : 'Buy ALL auto-travel slots', progress: autoSlotsProgress, current: currentAutoSlots, target: totalPossibleAutoSlots },
                    { id: 'robots', label: language === 'pt' ? 'Comprar TODOS os robôs mineradores' : 'Buy ALL mining robots', progress: robotsProgress, current: currentRobots, target: totalRobotsTarget },
                    { id: 'robotLevels', label: language === 'pt' ? 'Melhorar TODOS os robôs ao máximo' : 'Upgrade ALL robots to max', progress: robotLevelsProgress, current: totalRobotLevels, target: ores.length * 5 },
                    { id: 'compressions', label: language === 'pt' ? 'Melhorar Compressão Refinada' : 'Upgrade Refined Compression', progress: compressionsProgress, current: currentRefinedCompression, target: 10 },
                    { id: 'qc', label: language === 'pt' ? `Alcançar ${isInterstellar ? '999 trilhões' : '1 trilhão'} de QC` : `Reach ${isInterstellar ? '999 trillion' : '1 trillion'} QC`, progress: qcProgress, current: currentQC, target: targetQC, isCurrency: true },
                    { id: 'deliveries', label: language === 'pt' ? `Total de ${targetDeliveries} entregas` : `Total of ${targetDeliveries} deliveries`, progress: deliveriesProgress, current: totalDeliveries, target: targetDeliveries },
                  ];

                  return goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{goal.label}</span>
                        <span className="text-[15px] font-mono text-slate-500">
                          {goal.isCurrency ? formatValue(goal.current) : goal.current} / {goal.isCurrency ? formatValue(goal.target) : goal.target}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          className={`h-full bg-gradient-to-r ${goal.progress >= 100 ? 'from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : (isInterstellar ? 'from-orange-500 to-orange-300' : 'from-cyan-500 to-cyan-300')}`}
                        />
                      </div>
                    </div>
                  ));
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
                  onClick={() => setShowRoute2Goals(false)}
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
      <AnimatePresence>
        {showSkillMap && (
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
              className={`w-full max-w-2xl glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${isInterstellar ? 'from-orange-500/5' : 'from-cyan-500/5'} to-transparent pointer-events-none`} />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className={`text-xl font-orbitron font-bold text-white tracking-widest uppercase ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                    {language === 'pt' ? 'Mapa de Habilidades' : 'Skill Map'}
                  </h2>
                  <p className="text-[14px] text-slate-500 font-mono uppercase tracking-widest">
                    {language === 'pt' ? 'Melhorias permanentes para suas missões' : 'Permanent upgrades for your missions'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowSkillMap(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 relative z-10">
                {[
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
                    name: language === 'pt' ? 'Robôs Olímpicos' : 'Olympic Robots', 
                    desc: language === 'pt' ? '-1 pack por nível (Base: 10)' : '-1 pack per level (Base: 10)', 
                    level: skillRobosOlimpicosLevel[routeTier], 
                    max: 10, 
                    baseCost: routeTier === 'Solar' ? 13000 : 20000, 
                    mult: 2.8,
                    setter: (val: number) => setSkillRobosOlimpicosLevel(prev => ({ ...prev, [routeTier]: val })),
                    icon: Pickaxe,
                    color: 'text-yellow-400'
                  }
                ].map((skill) => {
                  const cost = Math.floor(skill.baseCost * Math.pow(skill.mult, skill.level));
                  const canAfford = qc >= cost;
                  const isMax = skill.level >= skill.max;
                  const Icon = skill.icon;

                  return (
                    <div key={skill.id} className={`glass-panel border-white/5 p-3 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all`}>
                      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${skill.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{skill.name}</h3>
                          <span className="text-base font-mono text-slate-500">LVL {skill.level}/{skill.max}</span>
                        </div>
                        <p className="text-base text-slate-400 font-mono uppercase tracking-widest mt-0.5">{skill.desc}</p>
                        
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${isInterstellar ? 'from-orange-500 to-orange-300' : 'from-cyan-500 to-cyan-300'}`}
                              style={{ width: `${(skill.level / skill.max) * 100}%` }}
                            />
                          </div>
                          
                          {isMax ? (
                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-orbitron text-[14px] tracking-widest uppercase">
                              MAX
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                  if (canAfford) {
                                    setQc(prev => prev - cost);
                                    updateHistoryStats('spent', cost);
                                    skill.setter(skill.level + 1);
                                    playSfx('upgrade');
                                  addLog(`${skill.name} UPGRADED!`, 'success');
                                } else {
                                  addLog(t('insufficientQC'), 'error');
                                }
                              }}
                              className={`px-3 py-1 rounded font-orbitron text-[14px] tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                                canAfford 
                                  ? 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold' 
                                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {formatValue(cost)} <Coins className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end relative z-10">
                <button
                  onClick={() => setShowSkillMap(false)}
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
                    await GameStorage.remove('time_travel_save');
                    await GameStorage.remove('speed_run_save');
                    window.location.reload();
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
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
              
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
                        <p>Um sistema de intervenção tática projetado para garantir superioridade em combate.</p>
                        <p>Ao contratar unidades especializadas, você aumenta drasticamente suas chances de vitória em confrontos pelo cosmos — sejam encontros aleatórios ou operações de radar.</p>
                        <p className="pt-2 border-t border-white/10">
                          <span className="text-purple-400 font-bold">O excesso de eficiência é recompensado:</span><br />
                          toda chance de vitória que ultrapassar 100% é convertida em bônus adicionais sobre os recursos conquistados.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-blue-400 font-bold">Doom Protocol!</p>
                        <p>A tactical intervention system designed to ensure combat superiority.</p>
                        <p>By hiring specialized units, you drastically increase your victory chances in confrontations across the cosmos — whether random encounters or radar operations.</p>
                        <p className="pt-2 border-t border-white/10">
                          <span className="text-purple-400 font-bold">Excess efficiency is rewarded:</span><br />
                          every victory chance exceeding 100% is converted into additional bonuses on conquered resources.
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
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
              
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
                    onClick={() => setShowCaptureInfo(false)}
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
                  onClick={() => setShowCaptureInfo(false)}
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
            onClick={() => setSelectedReward(null)}
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
                  {language === 'pt' ? `NÍVEL ${selectedReward.level} DESBLOQUEADO` : `LEVEL ${selectedReward.level} UNLOCKED`}
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
                onClick={() => setSelectedReward(null)}
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

      {renderBattleOverlay()}

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
                  {language === 'pt' ? 'AINDA NÃO ESTOU PRONTO' : 'I AM NOT READY YET'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Void Lore Screen */}
      <AnimatePresence>
        {showVoidLore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-8 overflow-hidden"
          >
            {/* Background Stars */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(100)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: Math.random() }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="max-w-3xl w-full space-y-12 relative z-10">
              <div className="flex flex-col items-center mb-8">
                <RobotVisual theme="purple" />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              </div>

              <div className="min-h-[300px] space-y-6 font-mono text-lg leading-relaxed text-purple-100/90 text-center">
                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={loreLineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={VOID_LORE_LINES[loreLineIndex].startsWith('Ano') || VOID_LORE_LINES[loreLineIndex].startsWith('Prólogo') ? "text-2xl font-orbitron font-black text-purple-400 uppercase tracking-[0.2em]" : ""}
                  >
                    {VOID_LORE_LINES[loreLineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <div className="text-base font-orbitron text-purple-500/50 uppercase tracking-[0.3em]">
                  {loreLineIndex + 1} / {VOID_LORE_LINES.length}
                </div>
                
                {loreLineIndex < VOID_LORE_LINES.length - 1 ? (
                  <button
                    onClick={() => {
                      setLoreLineIndex(prev => prev + 1);
                      playSfx('click');
                    }}
                    className="px-8 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-orbitron text-[14px] tracking-widest rounded-lg transition-all flex items-center gap-2 group"
                  >
                    {language === 'pt' ? 'PRÓXIMO' : 'NEXT'}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={startVoidTransition}
                    className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-orbitron font-black text-base tracking-[0.3em] rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] uppercase animate-pulse-glow"
                  >
                    {language === 'pt' ? 'INICIAR ROTA 3' : 'START ROUTE 3'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route 2 Lore Screen */}
      <AnimatePresence>
        {showRoute2Lore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-8 overflow-hidden"
          >
            {/* Background Stars */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(100)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: Math.random() }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="max-w-3xl w-full space-y-12 relative z-10">
              <div className="flex flex-col items-center mb-8">
                <RobotVisual theme="orange" />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              </div>

              <div className="min-h-[300px] space-y-6 font-mono text-lg leading-relaxed text-orange-100/90 text-center">
                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={loreLineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={ROUTE2_LORE_LINES[loreLineIndex].startsWith('Ano') || ROUTE2_LORE_LINES[loreLineIndex].startsWith('Prólogo') ? "text-2xl font-orbitron font-black text-orange-400 uppercase tracking-[0.2em]" : ""}
                  >
                    {ROUTE2_LORE_LINES[loreLineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <div className="text-base font-orbitron text-orange-500/50 uppercase tracking-[0.3em]">
                  {loreLineIndex + 1} / {ROUTE2_LORE_LINES.length}
                </div>
                
                {loreLineIndex < ROUTE2_LORE_LINES.length - 1 ? (
                  <button
                    onClick={() => {
                      setLoreLineIndex(prev => prev + 1);
                      playSfx('click');
                    }}
                    className="px-8 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-orbitron text-[14px] tracking-widest rounded-lg transition-all flex items-center gap-2 group"
                  >
                    {language === 'pt' ? 'PRÓXIMO' : 'NEXT'}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowRoute2Lore(false);
                      startRoute2Transition();
                    }}
                    className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-orbitron font-black text-base tracking-[0.3em] rounded-xl transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)] uppercase animate-pulse-glow"
                  >
                    {language === 'pt' ? 'INICIAR ROTA 2' : 'START ROUTE 2'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
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
};
