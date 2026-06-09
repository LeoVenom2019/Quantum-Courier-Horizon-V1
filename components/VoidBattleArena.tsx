'use client';

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Shield, Target, MousePointer2, X } from 'lucide-react';

export interface VoidBattleProjectile {
  id: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  owner: 'player' | 'enemy';
  damage: number;
  isCrit?: boolean;
  vx: number;
  vy: number;
  type?: 'normal' | 'burst' | 'beam';
  speed?: number;
  size?: number;
  isSkyring?: boolean;
  trail?: { x: number; y: number }[];
  bossAttack?: 'acid' | 'fireball' | 'toxicMud' | 'darkRay' | 'moltenIron' | 'sonicWave' | 'darkBarrage' | 'abyssLaser' | 'godArc';
  dotDamagePerSecond?: number;
  dotDurationMs?: number;
}

export interface VoidBattleEnemy {
  id: string;
  type: 'Padrão' | 'Elite' | 'Boss';
  name?: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  damage: number;
  qc: number;
  lane?: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  image: string;
  assetBaseName?: string;
  enemyColor?: string;
  isExploding?: boolean;
  originalId?: string; // For asset lookup when id is unique per instance
  lastShot?: number;
  spriteSuffix?: string;
  previousSpriteSuffix?: string;
  spriteTransitionStartedAt?: number;
  shootSpriteUntil?: number;
}

export interface VoidBattleParticle {
  id: string;
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  vx: number;
  vy: number;
  life: number; // 1 to 0
  maxLife?: number;
  size: number;
  color: string;
  type: 'smoke' | 'impact' | 'spark' | 'ember' | 'fire' | 'bloom' | 'heat' | 'streak' | 'residue' | 'flash';
  blend?: GlobalCompositeOperation;
  growth?: number;
  blur?: number;
  friction?: number;
  gravity?: number;
  hasTrail?: boolean;
}

export interface VoidBattleDamageNumber {
  id: string;
  x: number;
  y: number;
  value: number;
  life: number; // 1 to 0
  isCrit: boolean;
  color: string;
  owner: 'player' | 'enemy';
}

export interface VoidBattleMeteor {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  size: number;
  type: 'meteorite' | 'meteor';
  imageIndex: number;
}

export interface VoidBattleState {
  enemies: VoidBattleEnemy[];
  playerX: number; // 0 to 100
  playerY: number; // 0 to 100
  projectiles: VoidBattleProjectile[];
  particles: VoidBattleParticle[];
  damageNumbers: VoidBattleDamageNumber[];
  lastEnemyMove: number;
  lastEnemyAttack: number;
  lastShot?: number;
  lastEnemyShot?: number;
  isGroupBattle?: boolean;
  playerImage: string;
  playerHp: number;
  playerMaxHp: number;
  playerShield: number;
  playerMaxShield: number;
  playerIsExploding?: boolean;
  explosionStart?: number;
  victoryExplosionStart?: number;
  abilities: {
    dodge: { lastUsed: number; cooldown: number };
    shield: { lastUsed: number; cooldown: number };
    burst: { lastUsed: number; cooldown: number };
    special: { lastUsed: number; cooldown: number; activeUntil: number };
  };
  dodgeActive?: boolean;
  keysPressed: Set<string>;
  locationId: number;
  enemyQueue?: VoidBattleEnemy[];
  totalRewardAccumulated?: number;
  finishTimer: number;
  zoomTarget: { x: number; y: number };
  isSlowMo: boolean;
  meteors: VoidBattleMeteor[];
  meteorEvent?: {
    active: boolean;
    startTime: number;
    lastSpawn: number;
    warningShown: boolean;
    extraEnemiesSpawned: number;
  };
  shake: { x: number; y: number; decay: number };
  frameCount: number;
  flashAlpha: number;
  flashColor?: string;
  shockwaves: any[];
  scars: any[];
  cameraPunch: { x: number; y: number; targetX: number; targetY: number };
  destroyedMeteors: number;
  destroyedMeteorites: number;
  specialEnergyBalls: any[];
  laserState: 'idle' | 'charge' | 'firing' | 'collapse';
  laserStateStart: number;
  laserImpactPos: { x: number; y: number };
  laserParticles: any[];
  laserArcs: any[];
  laserEmbers: any[];
  laserDistortionWaves: any[];
  laserBeamWidth: number;
  laserFlashAlpha: number;
  laserResidualBurnLife: number;
  laserLastDamageTick: number;
  playerShotDuckedUntil: number;
  fireballs: any[];
  trailParts: any[];
  burnZones: any[];
  playerDotEffects: any[];
  impactFlash: number;
  cinematicDarkness: number;
}

const BOSS_INTROS: Record<number, {
  name: string;
  video: string;
  power: string;
  attack: NonNullable<VoidBattleProjectile['bossAttack']>;
  damage: [number, number];
  dot?: { damage: [number, number]; durationMs: number };
}> = {
  1: {
    name: 'Devorador Alpha',
    video: '/assets/rota3/void/1/devorador_alpha.mp4',
    power: 'Cospe uma gosma verde que causa 100 a 150 de dano.',
    attack: 'acid',
    damage: [100, 150]
  },
  2: {
    name: 'Sanguessuga Estelar',
    video: '/assets/rota3/void/2/sanguessuga_estelar.mp4',
    power: 'Cospe uma bola de fogo que causa 120 a 170 de dano.',
    attack: 'fireball',
    damage: [120, 170]
  },
  3: {
    name: 'Colosso Amalgamado',
    video: '/assets/rota3/void/3/colosso_amalgamado.mp4',
    power: 'Joga uma gosma de lama venenosa que causa 150 a 200 de dano.',
    attack: 'toxicMud',
    damage: [150, 200]
  },
  4: {
    name: 'Kraken do Vazio',
    video: '/assets/rota3/void/4/kraken_do_vazio.mp4',
    power: 'Solta um raio de energia escuro que causa de 200 a 250 de dano.',
    attack: 'darkRay',
    damage: [200, 250]
  },
  5: {
    name: 'Besta-Titã de Ferro',
    video: '/assets/rota3/void/5/besta_titã_de_ferro.mp4',
    power: 'Solta uma bola de ferro derretido em chamas, que causa 200 a 250 de dano e um dano contínuo de 100 a 150 por segundo, durante 2 segundos.',
    attack: 'moltenIron',
    damage: [200, 250],
    dot: { damage: [100, 150], durationMs: 2000 }
  },
  6: {
    name: 'Horror Mutante',
    video: '/assets/rota3/void/6/horror_mutante.mp4',
    power: 'Solta uma onda sonora que causa de 300 a 350 de dano.',
    attack: 'sonicWave',
    damage: [300, 350]
  },
  7: {
    name: 'Verme-Rei do Vazio',
    video: '/assets/rota3/void/7/verme_rei_do_vazio.mp4',
    power: 'Solta uma rajada de energia escura que causa de 350 a 370 de dano.',
    attack: 'darkBarrage',
    damage: [350, 370]
  },
  8: {
    name: 'Predador Abissal',
    video: '/assets/rota3/void/8/predador_abissal.mp4',
    power: 'Solta um raio em forma de laser que causa de 370 a 400 de dano.',
    attack: 'abyssLaser',
    damage: [370, 400]
  },
  9: {
    name: 'O Deus-Monstro do Vazio',
    video: '/assets/rota3/void/9/deus_monstro_do_vazio.mp4',
    power: 'Solta um arco de laser e raio que causa de 400 a 450 de dano.',
    attack: 'godArc',
    damage: [400, 450]
  }
};

const randomInt = ([min, max]: [number, number]) => Math.floor(min + Math.random() * (max - min + 1));
const BOSS_SPRITE_FADE_MS = 110;
const BOSS_SHOOT_SPRITE_MS = 320;
const HELLFIRE_IMPACT_DAMAGE_MULTIPLIER = 6;
const HELLFIRE_BURN_TICK_DAMAGE_MULTIPLIER = 0.35;

const VoidBattleHUD = memo(function VoidBattleHUD({ hud, playerMaxHp, playerMaxShield, displayEnemy, t, isGroupBattle, routeTier }: any) {
  const isVoid = routeTier === 'Void';
  return (
    <div className="p-3 border-b border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
      <div className="space-y-1">
        <p className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest leading-none">{t('yourShip')}</p>
        <div className="flex gap-1.5">
          {isVoid && (
            <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(hud.playerShield / (playerMaxShield || 1)) * 100}%` }} />
            </div>
          )}
          <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(hud.playerHp / (playerMaxHp || 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="text-center">
         <div className={`text-[15px] font-orbitron font-bold ${isGroupBattle ? 'text-yellow-500' : 'text-red-500'} animate-pulse tracking-[0.2em] leading-none`}>
           {isGroupBattle ? t('groupBattle').toUpperCase() : t('realTimeCombat').toUpperCase()}
         </div>
      </div>

      <div className="space-y-1 text-right">
        <p className="text-[12px] font-orbitron text-white/40 uppercase tracking-widest leading-none max-w-[180px] truncate ml-auto">
          {isGroupBattle ? `${t('enemyGroup')} (${hud.enemiesAlive})` : `${hud.enemyName}`}
        </p>
        <div className="flex gap-1.5 justify-end">
          <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(hud.enemyHp / (displayEnemy.maxHp || 1)) * 100}%` }} />
          </div>
          {isVoid && (
            <div className="w-24 h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(hud.enemyShield / (displayEnemy.maxShield || 1)) * 100}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export interface VoidBattleArenaProps {
  initialEnemies: VoidBattleEnemy[];
  playerShipStats: any;
  voidResources: any;
  onBattleEnd: (status: 'won' | 'lost', result?: any) => void;
  onUpdateResources: (res: any) => void;
  playSfx: (id: string, options?: any) => void;
  stopSfx: (id: string) => void;
  t: (key: string) => string;
  language: string;
  addLog: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  formatValue: (val: number) => string;
  isGroupBattle: boolean;
  routeTier: string;
  locationId: number;
  battleLevel?: number;
  enemyQueue?: VoidBattleEnemy[];
  activeShipImage?: string;
  onExitBattle?: () => void;
  meteoriteRewardValue?: number;
  disableMeteorEvent?: boolean;
}

// Gerar estrelas uma única vez — 3 camadas de parallax
const STAR_LAYERS = [
  // Camada distante: pequenas, lentas
  Array.from({ length: 80 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.2 + 0.3,
    speed: 0.008 + Math.random() * 0.004,
    alpha: Math.random() * 0.4 + 0.2
  })),
  // Camada média
  Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.5,
    speed: 0.018 + Math.random() * 0.008,
    alpha: Math.random() * 0.5 + 0.3
  })),
  // Camada próxima: grandes, rápidas
  Array.from({ length: 15 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1,
    speed: 0.035 + Math.random() * 0.015,
    alpha: Math.random() * 0.6 + 0.4
  }))
];

const SOLAR_AMBIENT_PARTICLES = Array.from({ length: 54 }, (_, i) => ({
  x: (i * 37.17) % 100,
  y: (i * 61.83) % 100,
  size: 0.7 + ((i * 13) % 19) / 10,
  drift: 0.45 + ((i * 7) % 11) / 10,
  pulse: 0.6 + ((i * 5) % 13) / 10,
  alpha: 0.18 + ((i * 3) % 9) / 100,
  hue: i % 4
}));

const VoidBattleArena = memo(function VoidBattleArena({
  initialEnemies,
  playerShipStats,
  voidResources,
  onBattleEnd,
  onUpdateResources,
  playSfx,
  stopSfx,
  t,
  language,
  addLog,
  formatValue,
  isGroupBattle,
  routeTier,
  locationId,
  battleLevel,
  enemyQueue,
  activeShipImage,
  onExitBattle,
  meteoriteRewardValue = 0,
  disableMeteorEvent = false
}: VoidBattleArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const isBossEncounter = initialEnemies.some(enemy => enemy.type === 'Boss')
    || (enemyQueue || []).some(enemy => enemy.type === 'Boss');
  const bossIntro = routeTier === 'Void' && isBossEncounter ? BOSS_INTROS[locationId] : undefined;
  const [showBossIntro, setShowBossIntro] = useState(Boolean(bossIntro));
  const [meteorEventEnabled] = useState(() => (
    routeTier === 'Void'
      && !disableMeteorEvent
      && !isBossEncounter
      && initialEnemies.length > 0
      && Math.random() < 0.3
  ));
  const battleEnemies = meteorEventEnabled ? [initialEnemies[0]] : initialEnemies;
  const battleEnemyQueue = meteorEventEnabled ? [] : (enemyQueue || []);
  const battleIsGroupBattle = meteorEventEnabled ? false : isGroupBattle;
  const meteoriteQcValue = Math.max(0, Math.floor(meteoriteRewardValue || 0));
  const meteorQcValue = meteoriteQcValue * 3;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game state in a ref for zero-latency updates
  const gameRef = useRef<VoidBattleState>({
    enemies: battleEnemies.map(e => ({ ...e, isExploding: false })),
    playerX: 10,
    playerY: 50,
    projectiles: [],
    particles: [],
    lastEnemyMove: Date.now(),
    lastEnemyAttack: Date.now(),
    isGroupBattle: battleIsGroupBattle,
    playerImage: routeTier === 'Void'
      ? (playerShipStats.rarity === 'mythic' ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player-battle.webp')
      : (activeShipImage || '/images/battle/standard_ship.webp'),
    playerHp: playerShipStats.hp,
    playerMaxHp: playerShipStats.maxHp,
    playerShield: playerShipStats.shield,
    playerMaxShield: playerShipStats.maxShield,
    finishTimer: 0,
    abilities: {
      dodge: { lastUsed: 0, cooldown: 3000 },
      shield: { lastUsed: 0, cooldown: 15000 },
      burst: { lastUsed: 0, cooldown: 35000 },
      special: { lastUsed: 0, cooldown: 50000, activeUntil: 0 }
    },
    keysPressed: new Set<string>(),
    damageNumbers: [],
    locationId,
    enemyQueue: [...battleEnemyQueue],
    zoomTarget: { x: 50, y: 50 },
    isSlowMo: false,
    meteors: [],
    shake: { x: 0, y: 0, decay: 0.82 },
    frameCount: 0,
    flashAlpha: 0,
    shockwaves: [],
    scars: [],
    cameraPunch: { x: 0, y: 0, targetX: 0, targetY: 0 },
    destroyedMeteors: 0,
    destroyedMeteorites: 0,
    specialEnergyBalls: [],
    laserState: 'idle',
    laserStateStart: 0,
    laserImpactPos: { x: 0, y: 0 },
    laserParticles: [],
    laserArcs: [],
    laserEmbers: [],
    laserDistortionWaves: [],
    laserBeamWidth: 0,
    laserFlashAlpha: 0,
    laserResidualBurnLife: 0,
    laserLastDamageTick: 0,
    playerShotDuckedUntil: 0,
    meteorEvent: meteorEventEnabled ? {
      active: true,
      startTime: Date.now() + 500, // Começa quase imediatamente
      lastSpawn: 0,
      warningShown: false,
      extraEnemiesSpawned: 0
    } : {
      active: false,
      startTime: 0,
      lastSpawn: 0,
      warningShown: false,
      extraEnemiesSpawned: 0
    },
    fireballs: [],
    trailParts: [],
    burnZones: [],
    playerDotEffects: [],
    impactFlash: 0,
    cinematicDarkness: 0
  });

  const voidResourcesRef = useRef(voidResources);
  useEffect(() => { voidResourcesRef.current = voidResources; }, [voidResources]);
  const playerShipStatsRef = useRef(playerShipStats);
  useEffect(() => { playerShipStatsRef.current = playerShipStats; }, [playerShipStats]);

  interface VoidBattleHudState {
    playerHp: number;
    playerShield: number;
    enemyHp: number;
    enemyShield: number;
    enemyType: string;
    enemyName: string;
    enemiesAlive: number;
    dodgeCooldown: number;
    shieldCooldown: number;
    burstCooldown: number;
    specialCooldown: number;
    specialActive: boolean;
    playerIsExploding: boolean;
    meteorEventActive: boolean;
    meteorEventStartTime: number;
  }

  // HUD state updated at a lower frequency
  const [hud, setHud] = useState<VoidBattleHudState>({
    playerHp: playerShipStats.hp,
    playerShield: playerShipStats.shield,
    enemyHp: battleEnemies[0].hp,
    enemyShield: battleEnemies[0].shield,
    enemyType: battleEnemies[0].type,
    enemyName: battleEnemies[0].name || battleEnemies[0].type,
    enemiesAlive: battleEnemies.length,
    dodgeCooldown: 0,
    shieldCooldown: 0,
    burstCooldown: 0,
    specialCooldown: 0,
    specialActive: false,
    playerIsExploding: false,
    meteorEventActive: false,
    meteorEventStartTime: 0
  });

  // Image assets cache
  const assetsRef = useRef<Record<string, HTMLImageElement>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const battleAssetKey = JSON.stringify({
    locationId,
    routeTier,
    activeShipImage: activeShipImage || '',
    playerRarity: playerShipStats.rarity || 'common',
    enemies: [...battleEnemies, ...battleEnemyQueue].map(enemy => ({
      id: enemy.id,
      type: enemy.type,
      image: enemy.image,
      assetBaseName: enemy.assetBaseName || '',
    })),
  });

  // Load Images (Sprites)
  useEffect(() => {
    let cancelled = false;
    setAssetsLoaded(false);

    const loadImage = (id: string, src: string, fallbackSrc?: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!cancelled) assetsRef.current[id] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`[VoidBattleArena] Failed to load asset: ${id} from ${src}`);
          if (fallbackSrc) {
            const fImg = new Image();
            fImg.onload = () => {
              if (!cancelled) assetsRef.current[id] = fImg;
              resolve();
            };
            fImg.onerror = () => { 
              console.error(`[VoidBattleArena] Critical: Failed to load fallback for ${id}`);
              resolve(); 
            };
            fImg.src = fallbackSrc;
          } else {
            resolve();
          }
        };
        img.src = src;
      });
    };

    const locKey = locationId === 0 ? 'zero' : locationId;
    const isMythic = playerShipStats.rarity === 'mythic';
    const isVoid = routeTier === 'Void';

    const imagesToLoad: { id: string, src: string, fallback?: string }[] = [
      { id: 'player_neutral', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player_battle_neutral.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_up', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_up.webp' : '/images/ships/battle/player_battle_up.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_down', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_down.webp' : '/images/ships/battle/player_battle_down.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_forward', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_forward.webp' : '/images/ships/battle/player_battle_neutral.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'solar_background_1', src: '/assets/rota1/battle/layer_background1.webp' },
      { id: 'interstellar_background_1', src: '/assets/rota2/battle/layer_background1.webp' },
      {
        id: 'bg_layer_1',
        src: isVoid
          ? `/assets/rota3/void/${locKey}/bg_layer_${locKey}.webp`
          : (routeTier === 'Solar' ? '/assets/rota1/battle/bg_layer.webp' : '/assets/rota2/battle/bg_layer.webp'),
        fallback: `/assets/rota3/void/zero/bg_layer_zero.webp`
      },
      // Meteor Shower Assets
      { id: 'meteorite1', src: isVoid ? '/images/battle/void/meteorite1.webp' : '/images/battle/solar/meteorite1.webp' },
      { id: 'meteorite2', src: isVoid ? '/images/battle/void/meteorite2.webp' : '/images/battle/solar/meteorite2.webp' },
      { id: 'meteor1', src: isVoid ? '/images/battle/void/meteor1.webp' : '/images/battle/solar/meteor1.webp' },
      { id: 'meteor2', src: isVoid ? '/images/battle/void/meteor2.webp' : '/images/battle/solar/meteor2.webp' }
    ];

    const allPotentialEnemies = [...battleEnemies, ...battleEnemyQueue];
    allPotentialEnemies.forEach(e => {
      if (routeTier === 'Void') {
        let baseName = e.assetBaseName || 'boss';
        if (!e.assetBaseName && e.type === 'Padrão') {
          const match = e.image.match(/common-(\d+)/);
          const num = match ? match[1] : '1';
          baseName = `monster-common-${num}`;
        } else if (!e.assetBaseName && e.type === 'Elite') {
          baseName = 'monster-elite';
        }

        const hasDirectionalSprites = e.type === 'Boss';
        const assetLocKey = hasDirectionalSprites ? locKey : 'zero';
        const baseSrc = `/assets/rota3/void/${assetLocKey}/${baseName}`;
        const fallbackBaseSrc = `/assets/rota3/void/zero/${baseName}`;

        if (hasDirectionalSprites) {
          const hasShootSprite = routeTier === 'Void' && locationId === 5;
          imagesToLoad.push(
            { id: `${e.id}_neutral`, src: `${baseSrc}_neutral.webp`, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_up`, src: `${baseSrc}_up.webp`, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_down`, src: `${baseSrc}_down.webp`, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_forward`, src: `${baseSrc}_forward.webp`, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_backward`, src: `${baseSrc}_backward.webp`, fallback: `${fallbackBaseSrc}_neutral.webp` },
            ...(hasShootSprite ? [{ id: `${e.id}_shoot`, src: `${baseSrc}_shoot.webp`, fallback: `${baseSrc}_neutral.webp` }] : [])
          );
        } else {
          const neutralSrc = `${baseSrc}_neutral.webp`;
          imagesToLoad.push(
            { id: `${e.id}_neutral`, src: neutralSrc, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_up`, src: neutralSrc, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_down`, src: neutralSrc, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_forward`, src: neutralSrc, fallback: `${fallbackBaseSrc}_neutral.webp` },
            { id: `${e.id}_backward`, src: neutralSrc, fallback: `${fallbackBaseSrc}_neutral.webp` }
          );
        }
      } else {
        // For Solar and Interstellar, use the ship image directly for all states
        imagesToLoad.push(
          { id: `${e.id}_neutral`, src: e.image },
          { id: `${e.id}_up`, src: e.image },
          { id: `${e.id}_down`, src: e.image },
          { id: `${e.id}_forward`, src: e.image },
          { id: `${e.id}_backward`, src: e.image }
        );
      }
    });

    Promise.all(imagesToLoad.map(imgData => loadImage(imgData.id, imgData.src, imgData.fallback)))
      .then(() => {
        if (!cancelled) setAssetsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [battleAssetKey]);

  // Load and Prepare Video Background
  useEffect(() => {
    setVideoReady(false);
    const locKey = locationId === 0 ? 'zero' : locationId;
    const video = document.createElement('video');
    video.src = routeTier === 'Void'
      ? `/assets/rota3/void/${locKey}/background_battle_${locKey}.mp4`
      : (routeTier === 'Solar' ? '/assets/rota1/battle/background_battle.mp4' : '/assets/rota2/battle/background_battle.mp4');
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    const handleReady = () => setVideoReady(true);
    video.addEventListener('canplay', handleReady);
    video.addEventListener('loadeddata', handleReady);

    video.play().catch(e => console.warn('Video playback blocked or failed:', e));
    videoRef.current = video;

    return () => {
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('loadeddata', handleReady);
      video.pause();
      video.src = '';
      video.load();
    };
  }, [locationId, routeTier]);

  // Boss Entry Scream Logic
  useEffect(() => {
    const locKey = locationId === 0 ? 'zero' : locationId;
    const screamId = `boss_scream_${locKey}`;

    if (routeTier === 'Void' && initialEnemies.some(e => e.type === 'Boss')) {
      const timer = setTimeout(() => {
        playSfx(screamId, { loop: true });
      }, 500);

      return () => {
        clearTimeout(timer);
        stopSfx(screamId);
      };
    }
  }, [locationId, initialEnemies, routeTier, playSfx, stopSfx]);

  // Ability Handlers
  const bezier = (p0: number, p1: number, p2: number, t: number) => {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
  };

  const triggerAbility = useCallback((type: 'dodge' | 'shield' | 'burst' | 'special') => {
    if (routeTier !== 'Void') return; // Abilities only in Void
    const s = gameRef.current;
    const now = Date.now();

    if (type === 'dodge' && now - s.abilities.dodge.lastUsed < s.abilities.dodge.cooldown) return;
    if (type === 'shield' && now - s.abilities.shield.lastUsed < s.abilities.shield.cooldown) return;
    if (type === 'burst' && now - s.abilities.burst.lastUsed < s.abilities.burst.cooldown) return;
    if (type === 'special' && now - s.abilities.special.lastUsed < s.abilities.special.cooldown) return;

    if (type === 'dodge') {
      s.abilities.dodge.lastUsed = now;
      s.dodgeActive = true;
      playSfx('dodge');
      setTimeout(() => { gameRef.current.dodgeActive = false; }, 400);
    } else if (type === 'shield') {
      if (voidResourcesRef.current.energy < 500) { addLog(t('notEnoughEnergy'), 'error'); return; }
      onUpdateResources({ ...voidResourcesRef.current, energy: voidResourcesRef.current.energy - 500 });
      s.abilities.shield.lastUsed = now;
      s.playerShield = Math.min(s.playerMaxShield, s.playerShield + (s.playerMaxShield * 0.4));
      playSfx('level_up');
    } else if (type === 'burst') {
      if (s.laserState !== 'idle') return; // Bloqueia se o laser estiver ativo
      if (voidResourcesRef.current.tech < 500) { addLog(t('notEnoughEnergy'), 'error'); return; }
      onUpdateResources({ ...voidResourcesRef.current, tech: voidResourcesRef.current.tech - 500 });
      s.abilities.burst.lastUsed = now;

      const count = 5;
      const cWidth = canvasRef.current?.width || 800;
      const cHeight = canvasRef.current?.height || 500;
      const baseOX = (s.playerX / 100) * cWidth + 40;
      const baseOY = (s.playerY / 100) * cHeight;
      const dirs = ['up', 'forward', 'down'];

      for(let i = 0; i < count; i++) {
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          let ox = baseOX, oy = baseOY;
          if (dir === 'up') { ox -= 10; oy -= 28; }
          else if (dir === 'forward') { ox += 10; }
          else { ox -= 10; oy += 28; }

          // Localizar inimigo mais próximo
          const target = s.enemies.reduce<VoidBattleEnemy | null>((closest, en) => {
            if (en.hp <= 0) return closest;
            if (!closest) return en;

            const closestDistance = Math.hypot((closest.x / 100) * cWidth - ox, (closest.y / 100) * cHeight - oy);
            const enemyDistance = Math.hypot((en.x / 100) * cWidth - ox, (en.y / 100) * cHeight - oy);
            return enemyDistance < closestDistance ? en : closest;
          }, null);

          const tx = target ? (target.x / 100) * cWidth : cWidth + 200;
          const ty = target ? (target.y / 100) * cHeight : oy + (Math.random() - 0.5) * 200;
          const dist = Math.hypot(tx - ox, ty - oy);

          // Viagem entre 35 e 65 frames
          const travelFrames = Math.max(35, Math.min(65, dist / 12));
          const speed = 1 / travelFrames;

          s.fireballs.push({
              id: `hb-${now}-${i}`,
              ox, oy, tx, ty,
              targetId: target?.id,
              x: ox, y: oy,
              t: 0,
              speed,
              arcBend: (dir === 'up' ? -1 : dir === 'down' ? 1 : 0) * (40 + Math.random() * 50) + (Math.random() - 0.5) * 30,
              size: 22 + Math.random() * 12,
              life: 1,
              done: false,
              readyAt: now + (i * 120) // Mesma base clock do loop
          });
      }
      s.playerShotDuckedUntil = now + 4500;
      playSfx('big_energy_explosion_2', { volume: 1.0, category: 'player' });
    } else if (type === 'special') {
      if (s.fireballs.length > 0) return; // Bloqueia se HB estiver em curso
      s.abilities.special.lastUsed = now;
      s.laserState = 'charge';
      s.laserStateStart = now;
      s.laserFlashAlpha = 1.0;
      s.laserParticles = [];
      s.laserArcs = [];
      s.laserEmbers = [];
      s.laserResidualBurnLife = 0;
      s.laserLastDamageTick = 0;

      // Initial Charge Particles
      const startX = (s.playerX / 100) * (canvasRef.current?.width || 0) + 120;
      const startY = (s.playerY / 100) * (canvasRef.current?.height || 0);
      for(let i = 0; i < 150; i++) {
        s.laserParticles.push({
          x: startX + (Math.random() - 0.5) * 600,
          y: startY + (Math.random() - 0.5) * 600,
          targetX: startX, targetY: startY,
          size: 2 + Math.random() * 6,
          life: 1, speed: 0.02 + Math.random() * 0.03,
          color: ['#ff00ff', '#ff3355', '#00ffff', '#ffffff'][Math.floor(Math.random() * 4)]
        });
      }
      s.playerShotDuckedUntil = now + 6500;
      playSfx('big_energy_explosion_', { volume: 1.0, category: 'player' });
    }
  }, [onUpdateResources, addLog, t, playSfx, routeTier]);

  const triggerAttack = useCallback((targetX: number, targetY: number) => {
    const s = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const now = Date.now();
    if (s.lastShot && now - s.lastShot < 200) return;

    const cWidth = canvas.width;
    const cHeight = canvas.height;

    // Player position in pixels
    const px = (s.playerX / 100) * cWidth;
    const py = (s.playerY / 100) * cHeight;
    // Vector to target in arena percentage units. Projectiles are stored as 0-100 coordinates.
    const targetPercentX = (targetX / cWidth) * 100;
    const targetPercentY = (targetY / cHeight) * 100;
    const dx = targetPercentX - s.playerX;
    const dy = targetPercentY - s.playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) return;

    // Normalize and set speed
    const critChance = Math.max(0, Math.min(1, playerShipStats.critChance ?? 0.1));
    const criticalDamage = playerShipStats.criticalDamage
      ?? ((playerShipStats.damage * (playerShipStats.critDamageMultiplier ?? 2)) + (playerShipStats.critDamageBonus || 0));
    const isCrit = Math.random() < critChance;
    const speed = isCrit ? 6.5 : 4.5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    const isMythic = playerShipStats.rarity === 'mythic';
    const isSkyring = activeShipImage?.includes('skyring');
    s.projectiles.push({
      id: `pp-${now}`,
      x: s.playerX + 5,
      y: s.playerY,
      owner: 'player',
      damage: isCrit ? criticalDamage : playerShipStats.damage,
      vx,
      vy,
      isCrit,
      size: isSkyring ? 2.0 : (isMythic ? 1.6 : 1),
      isSkyring,
      trail: []
    });
    s.lastShot = now;
    const isShotDucked = now < (s.playerShotDuckedUntil || 0);
    playSfx('shoot_player', { volume: isShotDucked ? 0.16 : 0.8, category: 'player' });

    // Muzzle flash particles
    const particleCount = isMythic ? 15 : 5;
    for (let i = 0; i < particleCount; i++) {
      s.particles.push({
        id: `mf-${now}-${i}`,
        x: s.playerX + 6,
        y: s.playerY + (Math.random() - 0.5) * 2,
        vx: 1 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 1,
        life: 0.3,
        size: isMythic ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
        color: isMythic ? '#a855f7' : '#22d3ee',
        type: 'spark'
      });
    }
  }, [playSfx, playerShipStats, activeShipImage]);

  useEffect(() => {
    if (!assetsLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      gameRef.current.keysPressed.add(key);
      if (e.key.toLowerCase() === 'r') triggerAbility('shield');
      if (e.key.toLowerCase() === 'f') triggerAbility('burst');
      if (e.key.toLowerCase() === 'c') triggerAbility('special');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keysPressed.delete(e.key.toLowerCase());
    };
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      triggerAttack(x, y);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);

    let animId: number;
    let battleFinished = false;
    let lastTime = Date.now();

    const createImpactEffect = (x: number, y: number, color: string, impactAngle = 0, impactForce = 1, targetType: 'ship' | 'meteor' | 'meteorite' = 'ship', particleMultiplier = 1) => {
      const s = gameRef.current;
      const now = Date.now();
      const variant = Math.random(); // 0-0.33: Ball, 0.33-0.66: Debris, 0.66-1.0: Electric/Dust

      // 0ms: Flash + Core Punch
      s.flashAlpha = 0.25;

      // Micro-shake direcional (oposto ao tiro) - 1.5x
      const pushDir = impactAngle + Math.PI;
      s.cameraPunch.targetX = Math.cos(pushDir) * 9 * impactForce;
      s.cameraPunch.targetY = Math.sin(pushDir) * 9 * impactForce;
      setTimeout(() => { s.cameraPunch.targetX = 0; s.cameraPunch.targetY = 0; }, 60);

      // Impact Scar & Ring - Standard Scale, High Intensity
      s.scars.push({
        x, y, life: 1.0,
        size: 9 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2
      });

      s.shockwaves.push({
        x, y, radius: 3, alpha: 0.5, thickness: 6, speed: 12,
        color: targetType === 'ship' ? '216, 180, 254' : '200, 200, 200'
      });

      // Core Flash Particle - Smaller & Electric Purple
      s.particles.push({
        id: `flash-${Date.now()}-${Math.random()}`,
        x, y, vx: 0, vy: 0, life: 0.15, maxLife: 0.15, size: 6,
        color: targetType === 'ship' ? '#d8b4fe' : '#fff', type: 'flash', blend: 'lighter'
      });

      // Staggered Impact Events
      const spawnImpactParts = (count: number, isStreak: boolean) => {
        const finalCount = Math.ceil(count * particleMultiplier);
        const spread = 0.5;
        for (let i = 0; i < finalCount; i++) {
          const isDirectional = Math.random() < 0.7;
          const pAngle = isDirectional ? impactAngle + (Math.random() - 0.5) * spread : Math.random() * Math.PI * 2;
          const speed = (isStreak ? 14 : 6) + Math.random() * 15;

          let pColor = '#fff';
          if (targetType === 'ship') {
            pColor = isStreak ? '#fff' : (Math.random() > 0.6 ? '#a855f7' : '#22d3ee');
          } else {
            pColor = Math.random() > 0.5 ? '#94a3b8' : '#fb923c'; // Dust / Meteor colors
          }

          s.particles.push({
            id: `imp-${Date.now()}-${i}-${isStreak}-${Math.random()}`,
            x, y,
            vx: Math.cos(pAngle) * speed,
            vy: Math.sin(pAngle) * speed,
            life: isStreak ? 0.3 : 0.6,
            maxLife: isStreak ? 0.3 : 0.6,
            size: isStreak ? 1.2 : 1.5,
            color: pColor,
            type: isStreak ? 'streak' : 'impact',
            blend: isStreak ? 'lighter' : 'source-over',
            friction: 0.96
          });
        }
      };

      spawnImpactParts(6, true);
      spawnImpactParts(4, false);

      setTimeout(() => {
        // Variant Logic for diverse visuals
        if (variant > 0.4) { // 60% chance of dust/particles instead of just smoke
          for (let i = 0; i < Math.ceil(5 * particleMultiplier); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 10;
            s.particles.push({
              id: `debris-${Date.now()}-${i}-${Math.random()}`,
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.5, maxLife: 0.5,
              size: 1 + Math.random() * 2,
              color: targetType === 'ship' ? '#d8b4fe' : '#94a3b8',
              type: 'impact', friction: 0.94
            });
          }
        } else {
          // Smoke Puff - Smaller & Electric/Dusty
          for (let i = 0; i < Math.ceil(3 * particleMultiplier); i++) {
            s.particles.push({
              id: `imp-smoke-${Date.now()}-${i}-${Math.random()}`,
              x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
              life: 0.6, maxLife: 0.6, size: 2 + Math.random() * 3,
              color: targetType === 'ship' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(148, 163, 184, 0.4)',
              type: 'smoke', gravity: -0.02
            });
          }
        }
      }, 40);

      setTimeout(() => {
        // Energy Residue (Electric) - Only on 50% of impacts or for Ships
        if (variant < 0.5 || targetType === 'ship') {
          s.particles.push({
            id: `imp-res-${Date.now()}-${Math.random()}`,
            x, y, vx: 0, vy: 0, life: 0.6, maxLife: 0.6, size: 8,
            color: targetType === 'ship' ? '#d8b4fe' : '#94a3b8',
            type: 'residue', blend: 'screen'
          });
        }
      }, 60);
    };

    const triggerShake = (intensity = 7) => {
      const s = gameRef.current;
      s.cameraPunch.targetX = (Math.random() - 0.5) * intensity;
      s.cameraPunch.targetY = (Math.random() - 0.5) * intensity;

      // Simulação de Recoil / Settle via timeouts (fiel ao protótipo)
      setTimeout(() => {
        s.cameraPunch.targetX = -s.cameraPunch.targetX * 0.6;
        s.cameraPunch.targetY = -s.cameraPunch.targetY * 0.6;
      }, 40);

      setTimeout(() => {
        s.cameraPunch.targetX = 0;
        s.cameraPunch.targetY = 0;
      }, 120);
    };

    const createExplosionEffect = (x: number, y: number, color: string) => {
      const s = gameRef.current;
      const biasAngle = Math.random() * Math.PI * 2;

      // 0ms: Flash + Core Punch
      s.flashAlpha = 0.45;
      s.flashColor = '216, 180, 254'; // Light Purple Flash
      triggerShake(routeTier === 'Void' ? 50 : 36);

      // Shockwave - Electric Cyan
      s.shockwaves.push({
        x, y, radius: 12, alpha: 0.6, thickness: 25, speed: 28,
        color: '34, 211, 238'
      });

      // Heat Core - Electric Variant
      for(let i=0; i<3; i++) {
        s.particles.push({
          id: `heat-${Date.now()}-${i}-${Math.random()}`,
          x, y, vx: 0, vy: 0, life: 1.0, maxLife: 1.0, size: 25, growth: 4,
          color: '#c084fc', type: 'heat', blend: 'screen'
        });
      }

      // Bloom Effect (HDR Look - Simplificado) - Faster Expansion
      s.particles.push({
        id: `bloom-${Date.now()}-${Math.random()}`,
        x, y, vx: 0, vy: 0, life: 0.8, maxLife: 0.8, size: 80, growth: 12,
        color: '#fff', type: 'bloom', blend: 'lighter'
      });

      // Staggered Events (Versão React/Arena)
      const spawnSparks = (count: number, maxSpeed: number, isCore: boolean) => {
        for (let i = 0; i < count; i++) {
          const useBias = Math.random() > 0.4;
          const angle = useBias ? biasAngle + (Math.random() - 0.5) * 1.5 : Math.random() * Math.PI * 2;
          const speed = (isCore ? 5 : 2) + Math.random() * maxSpeed;
          const size = Math.random() > 0.8 ? 4 : 2;
          s.particles.push({
            id: `spark-${Date.now()}-${i}-${isCore}-${Math.random()}`,
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.8,
            maxLife: 0.5 + Math.random() * 0.8,
            size,
            color: Math.random() > 0.2 ? (isCore ? '#fff' : color) : '#fb923c',
            type: 'spark',
            blend: 'lighter',
            hasTrail: speed > 6,
            friction: 0.94
          });
        }
      };

      // 0ms: Fast Core - 3x Velocity & Distance
      spawnSparks(40, 45, true);

      // Delayed Particles - 3x Velocity & Distance
      setTimeout(() => spawnSparks(50, 35, false), 20);

      setTimeout(() => {
        // Embers (Electric Sparks)
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3.0 + Math.random() * 12;
          s.particles.push({
            id: `ember-${Date.now()}-${i}-${Math.random()}`,
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 2.5 + Math.random() * 1.5,
            maxLife: 2.5 + Math.random() * 1.5,
            size: 1.2,
            color: Math.random() > 0.5 ? '#a855f7' : '#22d3ee',
            type: 'ember',
            blend: 'lighter',
            gravity: -0.01,
            friction: 0.96,
            hasTrail: true
          });
        }
      }, 40);

      setTimeout(() => {
        // Smoke (Electric Fog)
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 14;
          const grey = 20 + Math.random() * 20;
          s.particles.push({
            id: `smoke-${Date.now()}-${i}-${Math.random()}`,
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.2 + Math.random() * 1.0,
            maxLife: 1.2 + Math.random() * 1.0,
            size: 6 + Math.random() * 8,
            color: `rgba(168, 85, 247, 0.25)`,
            type: 'smoke',
            growth: 0.3,
            friction: 0.94,
            gravity: -0.02
          });
        }
      }, 70);

      // Secondary Reaction (Micro explosion offset)
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        spawnSparks(15, 6, false);
        s.shockwaves.push({
          x: x + offsetX, y: y + offsetY, radius: 2, alpha: 0.4, thickness: 5, speed: 6,
          color: '239, 100, 50'
        });
      }, 110);
    };

    const createDamageNumber = (x: number, y: number, value: number, isCrit: boolean, owner: 'player' | 'enemy') => {
      const s = gameRef.current;
      s.damageNumbers.push({
        id: `dn-${Date.now()}-${Math.random()}`,
        x, y,
        value: Math.floor(value),
        life: 1.0,
        isCrit,
        color: owner === 'player' ? (isCrit ? '#fcd34d' : '#22d3ee') : '#ef4444',
        owner
      });
    };

    const pickFireColorHB = (r: number): string => {
      if (r < 0.2) return 'rgba(255,255,200,1)';
      if (r < 0.5) return 'rgba(255,180,20,1)';
      if (r < 0.8) return 'rgba(255,80,0,1)';
      return 'rgba(200,30,0,1)';
    };

    const applyPlayerDamageToEnemy = (enemy: VoidBattleEnemy, damage: number) => {
      let remainingDamage = damage;
      if (enemy.shield > 0) {
        const shieldDamage = Math.min(enemy.shield, remainingDamage);
        enemy.shield -= shieldDamage;
        remainingDamage -= shieldDamage;
      }
      if (remainingDamage > 0) {
        enemy.hp = Math.max(0, enemy.hp - remainingDamage);
      }
      createDamageNumber(enemy.x, enemy.y - 10, damage, false, 'player');
    };

    const findNearestLivingEnemy = (state: VoidBattleState, x: number, y: number, width: number, height: number) => {
      return state.enemies.reduce<VoidBattleEnemy | null>((closest, enemy) => {
        if (enemy.hp <= 0) return closest;
        if (!closest) return enemy;

        const closestDistance = Math.hypot((closest.x / 100) * width - x, (closest.y / 100) * height - y);
        const enemyDistance = Math.hypot((enemy.x / 100) * width - x, (enemy.y / 100) * height - y);
        return enemyDistance < closestDistance ? enemy : closest;
      }, null);
    };

    const spawnHBImpact = (x: number, y: number) => {
      const s = gameRef.current;
      const now = Date.now();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cWidth = canvas.width;
      const cHeight = canvas.height;

      s.shake = { x: 20, y: 20, decay: 0.80 };
      s.impactFlash = 1;
      s.cinematicDarkness = 0.7;

      // Burst de partículas (usa o sistema de particles existente do projeto)
      for (let i = 0; i < 160; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 10;
        const smoke = i > 110;
        const col = pickFireColorHB(Math.random());
        s.particles.push({
          id: `hb-imp-${now}-${i}-${Math.random()}`,
          // Converter pixels → % para o sistema de partículas do projeto
          x: (x / cWidth) * 100,
          y: (y / cHeight) * 100,
          vx: (Math.cos(angle) * spd / cWidth) * 100,
          vy: (Math.sin(angle) * spd / cHeight) * 100,
          life: smoke ? 0.8 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5,
          maxLife: 1,
          size: smoke ? 3 + Math.random() * 5 : Math.random() < 0.15 ? 3 + Math.random() * 5 : 1 + Math.random() * 2,
          color: smoke ? `rgba(255,120,30,0.5)` : col,
          type: smoke ? 'smoke' : 'spark',
          blend: 'lighter',
          friction: 0.93,
          gravity: smoke ? -0.005 : 0.002,
        });
      }

      // Burn Zone — gravar em pixels
      s.burnZones.push({
        x,       // pixels
        y,       // pixels
        life: 1,
        startTime: now,
        duration: 3500,
        radius: (60 + Math.random() * 25) * (cWidth / 800), // escala com canvas
      });

      // Dano imediato nos inimigos próximos
      const SPLASH_PX = 90 * (cWidth / 800);
      const immDmg = playerShipStatsRef.current.damage * HELLFIRE_IMPACT_DAMAGE_MULTIPLIER;

      s.enemies.forEach(en => {
        if (en.hp <= 0) return;
        const ex = (en.x / 100) * cWidth;
        const ey = (en.y / 100) * cHeight;
        const d = Math.hypot(ex - x, ey - y);
        if (d > SPLASH_PX) return;
        const falloff = d < 5 ? 1 : (1 - d / SPLASH_PX);
        const dmg = Math.floor(immDmg * falloff);
        applyPlayerDamageToEnemy(en, dmg);
      });
    };

    const loop = () => {
      const s = gameRef.current;
      const now = Date.now();
      const deltaTime = Math.min(2, (now - lastTime) / 16.66);
      lastTime = now;
      if (showBossIntro) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(loop);
        return;
      }
      s.frameCount = (s.frameCount || 0) + 1;

      let effectiveDelta = deltaTime;

      if (s.isSlowMo || s.laserState === 'charge' || s.laserState === 'collapse') {
        const slowFactor = s.laserState !== 'idle' ? 0.35 : Math.max(0.2, 1 - (s.finishTimer / 2000));
        effectiveDelta *= slowFactor;
      }
      const cWidth = canvas.width;
      const cHeight = canvas.height;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cWidth, cHeight);

      // Screen Shake & Camera Punch
      ctx.save();
      ctx.translate(s.shake.x + s.cameraPunch.x, s.shake.y + s.cameraPunch.y);
      s.shake.x *= s.shake.decay;
      s.shake.y *= s.shake.decay;
      if (Math.abs(s.shake.x) < 0.1) s.shake.x = 0;
      if (Math.abs(s.shake.y) < 0.1) s.shake.y = 0;

      // Background Stars — parallax de 3 camadas
      STAR_LAYERS.forEach((layer, li) => {
        layer.forEach(star => {
          star.x -= star.speed;
          if (star.x < 0) {
            star.x = 100;
            star.y = Math.random() * 100;
          }
          ctx.globalAlpha = star.alpha;
          ctx.fillStyle = li === 2 ? '#a5f3fc' : 'white';
          ctx.beginPath();
          ctx.arc((star.x / 100) * cWidth, (star.y / 100) * cHeight, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      ctx.globalAlpha = 1.0;

      const drawParallaxLayer = (imgId: string, speed: number, scale = 1, floatIntensity = 0) => {
        const img = assetsRef.current[imgId];
        if (img) {
          const drawW = cWidth * scale;
          const drawH = cHeight * scale;
          const offset = (now * speed) % drawW;
          const yFloat = floatIntensity > 0 ? Math.sin(now / 1500) * floatIntensity : 0;
          const baseY = (cHeight - drawH) / 2;
          for (let x = -offset; x < cWidth; x += drawW) {
            ctx.drawImage(img, x, baseY + yFloat, drawW, drawH);
          }
        }
      };

      const drawImageCover = (img: HTMLImageElement) => {
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        if (!sourceWidth || !sourceHeight) {
          ctx.drawImage(img, 0, 0, cWidth, cHeight);
          return;
        }

        const sourceRatio = sourceWidth / sourceHeight;
        const canvasRatio = cWidth / cHeight;
        let sx = 0;
        let sy = 0;
        let sw = sourceWidth;
        let sh = sourceHeight;

        if (sourceRatio > canvasRatio) {
          sw = sourceHeight * canvasRatio;
          sx = (sourceWidth - sw) / 2;
        } else {
          sh = sourceWidth / canvasRatio;
          sy = (sourceHeight - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cWidth, cHeight);
      };

      const drawImageCoverScaled = (
        img: HTMLImageElement,
        scale: number,
        offsetX = 0,
        offsetY = 0,
        alpha = 1
      ) => {
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        if (!sourceWidth || !sourceHeight) return;

        const sourceRatio = sourceWidth / sourceHeight;
        const canvasRatio = cWidth / cHeight;
        let drawW = cWidth;
        let drawH = cHeight;

        if (sourceRatio > canvasRatio) {
          drawH = cHeight;
          drawW = cHeight * sourceRatio;
        } else {
          drawW = cWidth;
          drawH = cWidth / sourceRatio;
        }

        drawW *= scale;
        drawH *= scale;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          img,
          (cWidth - drawW) / 2 + offsetX,
          (cHeight - drawH) / 2 + offsetY,
          drawW,
          drawH
        );
        ctx.restore();
      };

      const drawSolarAmbientEffects = () => {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const sunPulse = 0.65 + Math.sin(now / 2800) * 0.18;
        const sunX = cWidth * 0.52 + Math.sin(now / 9000) * cWidth * 0.015;
        const sunY = cHeight * 0.78 + Math.cos(now / 11000) * cHeight * 0.012;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, cWidth * 0.28);
        sunGlow.addColorStop(0, `rgba(255, 226, 153, ${0.18 * sunPulse})`);
        sunGlow.addColorStop(0.22, `rgba(94, 234, 212, ${0.08 * sunPulse})`);
        sunGlow.addColorStop(0.62, `rgba(56, 189, 248, ${0.035 * sunPulse})`);
        sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, cWidth, cHeight);

        SOLAR_AMBIENT_PARTICLES.forEach((particle, index) => {
          const time = now / (5200 + index * 37);
          const x = ((particle.x + Math.sin(time) * particle.drift + now * 0.00075) % 100) / 100 * cWidth;
          const y = ((particle.y + Math.cos(time * 0.9) * particle.drift) % 100) / 100 * cHeight;
          const pulse = 0.55 + Math.sin(now / (900 + particle.pulse * 400) + index) * 0.45;
          const radius = particle.size * (1.2 + pulse * 1.6) * (cWidth / 1920);
          const color = particle.hue === 0
            ? '125, 211, 252'
            : particle.hue === 1
              ? '250, 204, 21'
              : particle.hue === 2
                ? '45, 212, 191'
                : '255, 255, 255';

          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 7);
          glow.addColorStop(0, `rgba(${color}, ${particle.alpha + pulse * 0.18})`);
          glow.addColorStop(0.25, `rgba(${color}, ${particle.alpha * 0.55})`);
          glow.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${0.28 + pulse * 0.35})`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.8, radius * 0.55), 0, Math.PI * 2);
          ctx.fill();
        });

        const sweepX = (0.5 + Math.sin(now / 12000) * 0.18) * cWidth;
        const sweep = ctx.createLinearGradient(sweepX - cWidth * 0.24, 0, sweepX + cWidth * 0.24, cHeight);
        sweep.addColorStop(0, 'rgba(255,255,255,0)');
        sweep.addColorStop(0.5, 'rgba(125,211,252,0.055)');
        sweep.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sweep;
        ctx.fillRect(0, 0, cWidth, cHeight);

        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.22;
        const vignette = ctx.createRadialGradient(cWidth * 0.5, cHeight * 0.52, cHeight * 0.22, cWidth * 0.5, cHeight * 0.52, cWidth * 0.72);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, cWidth, cHeight);
        ctx.restore();
      };

      const drawVideoCover = (video: HTMLVideoElement) => {
        const sourceWidth = video.videoWidth;
        const sourceHeight = video.videoHeight;
        if (!sourceWidth || !sourceHeight) {
          ctx.drawImage(video, 0, 0, cWidth, cHeight);
          return;
        }

        const sourceRatio = sourceWidth / sourceHeight;
        const canvasRatio = cWidth / cHeight;
        let sx = 0;
        let sy = 0;
        let sw = sourceWidth;
        let sh = sourceHeight;

        if (sourceRatio > canvasRatio) {
          sw = sourceHeight * canvasRatio;
          sx = (sourceWidth - sw) / 2;
        } else {
          sh = sourceWidth / canvasRatio;
          sy = (sourceHeight - sh) / 2;
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cWidth, cHeight);
      };

      if (routeTier === 'Void') {
        if (videoReady && videoRef.current) {
          drawVideoCover(videoRef.current);
        }
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.filter = 'brightness(1.0)';
        drawParallaxLayer('bg_layer_1', 0.06, 0.75, 15);
        ctx.restore();
        ctx.save();
        // Cinematic Zoom logic removed (No Zoom constraint)
        ctx.globalAlpha = Math.max(0, 0.03 * Math.sin(now / 1500));
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(0, 0, cWidth, cHeight);
        ctx.restore();
      } else {
        // Simple parallax for other routes
        if (routeTier === 'Solar' || routeTier === 'Interstellar') {
          const bgId = routeTier === 'Solar' ? 'solar_background_1' : 'interstellar_background_1';
          const bg = assetsRef.current[bgId];
          if (bg) {
            drawImageCover(bg);
          } else if (videoReady && videoRef.current) {
            ctx.save();
            ctx.filter = 'brightness(0.75)';
            drawVideoCover(videoRef.current);
            ctx.restore();
          }
          if (routeTier === 'Solar') drawSolarAmbientEffects();
        } else if (videoReady && videoRef.current) {
          drawVideoCover(videoRef.current);
        }
        if (routeTier === 'Solar') {
          const solarLayer = assetsRef.current.bg_layer_1;
          if (solarLayer) {
            const layerOffsetX = Math.sin(now / 8500) * cWidth * 0.035;
            const layerOffsetY = Math.cos(now / 11000) * cHeight * 0.018;
            drawImageCoverScaled(solarLayer, 0.76, layerOffsetX, layerOffsetY, 0.82);
          }
        } else {
          drawParallaxLayer('bg_layer_1', 0.04, 0.8, 0);
        }
      }

      // Special Ability Logic (Mega Laser)
      if (s.laserState !== 'idle' && !s.playerIsExploding) {
          const laserY = (s.playerY / 100) * cHeight;
      // =========================================================
      // APOCALYPSE LASER — CINEMATIC ULTIMATE VFX (NO ZOOM)
      // =========================================================
      const CHARGE_DURATION = 1200;
      const FIRING_DURATION = 1400; // Total length of the firing sequence
      const COLLAPSE_DURATION = 2500; // Much longer for residual effects
      const LASER_DAMAGE_TICK_MS = 200;
      const LASER_DAMAGE_PER_TICK = playerShipStats.damage * 4.0;
      const LASER_COLORS = ["#ff00ff", "#ff3355", "#00ffff", "#ffffff"];

      const getLaserStart = () => ({ x: (s.playerX / 100) * cWidth + 120, y: (s.playerY / 100) * cHeight });
      const getLaserEnd = () => {
          const start = getLaserStart();
          const hitEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs((e.y / 100) * cHeight - start.y) < 90);
          if (hitEnemies.length > 0) {
              const furthest = [...hitEnemies].sort((a, b) => b.x - a.x)[0];
              return { x: (furthest.x / 100) * cWidth, y: (furthest.y / 100) * cHeight };
          }
          return { x: Math.min(cWidth * 0.95, (s.playerX + 90) / 100 * cWidth), y: start.y };
      };

      // RENDER & UPDATE LOGIC
      const start = getLaserStart();
      const end = s.laserImpactPos.x !== 0 ? s.laserImpactPos : getLaserEnd();

      const elapsed = now - s.laserStateStart;

      // UPDATE STATE TRANSITIONS
      if (s.laserState === 'charge' && elapsed > CHARGE_DURATION) {
          s.laserState = 'firing';
          s.laserStateStart = now;
          s.laserFlashAlpha = 1.2; // BLINDING FLASH AT START
          s.shake.x = 45; s.shake.y = 45; // Camera suffered!
          s.laserImpactPos = { x: end.x, y: end.y };
          s.laserLastDamageTick = now - LASER_DAMAGE_TICK_MS;
          s.shockwaves.push({ x: start.x, y: start.y, radius: 50, alpha: 1, speed: 25, thickness: 15, color: '#fff' });
      } else if (s.laserState === 'firing' && elapsed > FIRING_DURATION) {
          s.laserState = 'collapse';
          s.laserStateStart = now;
          s.laserFlashAlpha = 1.5; // Final impact flash
          s.laserResidualBurnLife = 1.0;
          s.shake.x = 60; s.shake.y = 60; // Peak impact
          // Final Burst Damage
          s.enemies.forEach(e => {
              const dist = Math.hypot((e.x / 100) * cWidth - s.laserImpactPos.x, (e.y / 100) * cHeight - s.laserImpactPos.y);
              if (dist < 400) {
                  const totalDmg = playerShipStats.damage * 15;
                  if (e.shield > 0) {
                      const sDmg = Math.min(e.shield, totalDmg);
                      e.shield -= sDmg;
                      const rem = totalDmg - sDmg;
                      if (rem > 0) e.hp = Math.max(0, e.hp - rem);
                  } else { e.hp = Math.max(0, e.hp - totalDmg); }
                  createDamageNumber(e.x, e.y - 20, totalDmg, true, 'player');
              }
          });
          // GIANT IMPACT SHOCKWAVE
          s.shockwaves.push({ x: s.laserImpactPos.x, y: s.laserImpactPos.y, radius: 20, alpha: 1, speed: 15, thickness: 30, color: '#fb923c' });
          s.shockwaves.push({ x: s.laserImpactPos.x, y: s.laserImpactPos.y, radius: 40, alpha: 0.8, speed: 20, thickness: 10, color: '#fff' });

          // MASSIVE EXPLOSION PARTICLES + SMOKE
          for(let i = 0; i < 200; i++) {
              s.laserEmbers.push({
                  x: s.laserImpactPos.x, y: s.laserImpactPos.y,
                  vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50,
                  life: 1.0 + Math.random(), size: 2 + Math.random() * 15,
                  color: i % 5 === 0 ? 'rgba(80,80,80,0.6)' : LASER_COLORS[Math.floor(Math.random() * 4)]
              });
          }
      } else if (s.laserState === 'collapse' && elapsed > COLLAPSE_DURATION) {
          s.laserState = 'idle';
      }

      if (s.laserState === 'charge') {
          // Emotional Sequence: Darkness & Suction
          ctx.save(); ctx.fillStyle = `rgba(0,0,0,${0.3 + (elapsed / CHARGE_DURATION) * 0.5})`; ctx.fillRect(0,0,cWidth,cHeight); ctx.restore();

          s.laserParticles.forEach(p => {
              p.x += (p.targetX - p.x) * p.speed * 1.5;
              p.y += (p.targetY - p.y) * p.speed * 1.5;
              p.life -= 0.005 * deltaTime;
          });
          s.laserParticles = s.laserParticles.filter(p => p.life > 0);

          // RENDER CHARGE
          s.laserParticles.forEach(p => {
              ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
              ctx.shadowBlur = 40; ctx.shadowColor = p.color;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
              ctx.restore();
          });
          const p = elapsed / CHARGE_DURATION;
          const r = 20 + Math.sin(now * 0.025) * 10 + p * 150;
          const g = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, r);
          g.addColorStop(0, '#fff'); g.addColorStop(0.3, '#ff00ff'); g.addColorStop(0.6, '#4f46e5'); g.addColorStop(1, 'transparent');
          ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(start.x, start.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();

          s.shake.x = Math.random() * 3 * p; s.shake.y = Math.random() * 3 * p; // Slow build up shake
      }

      if (s.laserState === 'firing') {
          // Global Darkness (Peak Contrast)
          ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(0,0,cWidth,cHeight); ctx.restore();

          // Violent Instability
          s.laserBeamWidth = 55 + Math.sin(now * 0.08) * 15 + Math.random() * 10;
          if (Math.random() < 0.15) s.laserFlashAlpha = 0.1 + Math.random() * 0.3;

          // Render Beam Layers (Core focus)
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              // Turbulence segments
              const segments = 6;
              ctx.moveTo(start.x, start.y);
              for(let j=1; j<=segments; j++) {
                const tx = start.x + (end.x - start.x) * (j/segments);
                const ty = start.y + (Math.random() - 0.5) * 20;
                ctx.lineTo(tx, ty);
              }
              ctx.strokeStyle = LASER_COLORS[i % 4]; ctx.shadowColor = LASER_COLORS[i % 4];
              ctx.shadowBlur = 30 + i * 40; ctx.globalAlpha = 0.15 - i * 0.02;
              ctx.lineWidth = s.laserBeamWidth + (i * 70); ctx.stroke();
          }
          // ULTRA BRIGHT THIN CORE
          ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 150;
          ctx.lineWidth = 10 + Math.random() * 15; ctx.stroke();

          // ENERGY STREAMS (Violent Jitter)
          for (let i = 0; i < 6; i++) {
              ctx.beginPath(); ctx.strokeStyle = i % 2 === 0 ? "#fff" : "#00ffff";
              ctx.lineWidth = 1 + Math.random() * 3; ctx.globalAlpha = 0.8;
              let x = start.x; let y = start.y; ctx.moveTo(x, y);
              while (x < end.x) {
                  x += 30; y = start.y + Math.sin(x * 0.03 + now * 0.02 + i) * (20 + Math.random() * 20);
                  ctx.lineTo(x, y);
              }
              ctx.stroke();
          }
          ctx.restore();

          // ── ORIGIN ORB (muzzle flash) ──
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const orbPulse = 1 + Math.sin(now * 0.015) * 0.25 + Math.random() * 0.1;
          const orbR = (55 + s.laserBeamWidth * 0.55) * orbPulse;
          const orbG = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, orbR);
          orbG.addColorStop(0, 'rgba(255,255,255,1)');
          orbG.addColorStop(0.15,'rgba(200,160,255,0.95)');
          orbG.addColorStop(0.4, 'rgba(79,70,229,0.7)');
          orbG.addColorStop(0.75,'rgba(255,0,255,0.3)');
          orbG.addColorStop(1, 'transparent');
          ctx.fillStyle = orbG;
          ctx.beginPath(); ctx.arc(start.x, start.y, orbR, 0, Math.PI * 2); ctx.fill();
          // Spinning rings around origin
          const orbAngle = now * 0.004;
          for(let i = 0; i < 3; i++) {
              const a = orbAngle + (i * Math.PI * 2 / 3);
              const rx = start.x + Math.cos(a) * (orbR * 0.7);
              const ry = start.y + Math.sin(a) * (orbR * 0.28);
              ctx.fillStyle = i % 2 === 0 ? 'rgba(255,0,255,0.8)' : 'rgba(0,255,255,0.8)';
              ctx.beginPath(); ctx.arc(rx, ry, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();

          // ── IMPACT ORB (hit point) ──
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const impPulse = 1 + Math.sin(now * 0.02 + 1.5) * 0.3 + Math.random() * 0.15;
          const impR = (70 + s.laserBeamWidth * 0.6) * impPulse;
          const impG = ctx.createRadialGradient(end.x, start.y, 0, end.x, start.y, impR);
          impG.addColorStop(0, 'rgba(255,255,255,1)');
          impG.addColorStop(0.1, 'rgba(255,220,100,0.95)');
          impG.addColorStop(0.35,'rgba(255,51,85,0.75)');
          impG.addColorStop(0.7, 'rgba(79,70,229,0.35)');
          impG.addColorStop(1, 'transparent');
          ctx.fillStyle = impG;
          ctx.beginPath(); ctx.arc(end.x, start.y, impR, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          // ── CONTINUOUS IMPACT RINGS ──
          ctx.save();
          const ringCount = 3;
          const ringCycle = 600;
          for(let i = 0; i < ringCount; i++) {
              const phase = ((now + i * (ringCycle / ringCount)) % ringCycle) / ringCycle;
              const rr = 60 + phase * 280;
              const alpha = (1 - phase) * 0.7;
              ctx.beginPath(); ctx.arc(end.x, start.y, rr, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(255,180,80,${alpha})`;
              ctx.lineWidth = (1 - phase) * 12 + 1;
              ctx.stroke();
          }
          ctx.restore();

          // Damage Logic
          if (now - s.laserLastDamageTick >= LASER_DAMAGE_TICK_MS) {
            s.laserLastDamageTick = now;
            s.enemies.forEach(e => {
                const ex = (e.x / 100) * cWidth;
                if (e.hp > 0 && Math.abs((e.y / 100) * cHeight - start.y) < 90 && ex > (start.x - 50) && ex < end.x + 50) {
                    let remainingDamage = LASER_DAMAGE_PER_TICK;
                    if (e.shield > 0) {
                        const shieldDamage = Math.min(e.shield, remainingDamage);
                        e.shield -= shieldDamage;
                        remainingDamage -= shieldDamage;
                    }
                    if (remainingDamage > 0) {
                        e.hp = Math.max(0, e.hp - remainingDamage);
                    }
                    createDamageNumber(e.x, e.y - 15, LASER_DAMAGE_PER_TICK, true, 'player');
                }
            });
          }

          s.shake.x = 15 + Math.random() * 15; s.shake.y = 15 + Math.random() * 15;
      }

      if (s.laserState === 'collapse') {
          const p = elapsed / COLLAPSE_DURATION;
          const r = 500 + p * 1500;

          // RESIDUAL BEAM (Fades out)
          if (p < 0.35) {
              const beamAlpha = (1 - p / 0.35) * 0.6;
              ctx.save(); ctx.globalCompositeOperation = 'lighter';
              ctx.globalAlpha = beamAlpha;
              ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, start.y);
              ctx.strokeStyle = '#ff00ff'; ctx.shadowBlur = 120; ctx.shadowColor = '#ff00ff'; ctx.lineWidth = 8 + Math.random() * 10; ctx.stroke();
              ctx.restore();
          }

          // GIANT IMPACT GLOW
          const g = ctx.createRadialGradient(end.x, end.y, 20, end.x, end.y, r);
          g.addColorStop(0, "#fff"); g.addColorStop(0.2, "#ff3355"); g.addColorStop(0.5, "#ef4444"); g.addColorStop(1, "transparent");
          ctx.save(); ctx.globalAlpha = (1 - p) * 0.8; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(end.x, end.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();

          // HUGE RESIDUAL BURN MARK
          if (s.laserResidualBurnLife > 0) {
              ctx.save(); ctx.globalAlpha = s.laserResidualBurnLife * 0.6;
              const burnSize = 500 * (1 + (1 - s.laserResidualBurnLife) * 0.5);
              const bg = ctx.createRadialGradient(end.x, end.y, 50, end.x, end.y, burnSize);
              bg.addColorStop(0, "rgba(255,255,255,0.9)"); bg.addColorStop(0.2, "rgba(255,100,0,0.7)"); bg.addColorStop(0.5, "rgba(100,0,0,0.4)"); bg.addColorStop(1, "transparent");
              ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(end.x, end.y, burnSize, 0, Math.PI * 2); ctx.fill(); ctx.restore();
              s.laserResidualBurnLife -= 0.002 * deltaTime;
          }

          // COLLAPSE IMPACT RINGS
          ctx.save();
          const numCollapseRings = 5;
          for(let i = 0; i < numCollapseRings; i++) {
              const delay = i * 0.12;
              const rp = Math.max(0, (p - delay) / (1 - delay));
              if(rp > 0) {
                  const rr = 80 + rp * (600 + i * 150);
                  const alpha = (1 - rp) * (0.8 - i * 0.12);
                  if(alpha > 0) {
                      const ringColors = ['255,255,255','255,180,60','255,51,85','79,70,229','0,200,255'];
                      ctx.beginPath(); ctx.arc(end.x, end.y, rr, 0, Math.PI * 2);
                      ctx.strokeStyle = `rgba(${ringColors[i % 5]},${alpha})`;
                      ctx.lineWidth = (1 - rp) * 20 + 2; ctx.stroke();
                  }
              }
          }
          ctx.restore();
      }

      // UPDATE ARCS & EMBERS
      s.laserArcs.forEach(a => { a.life -= 0.03 * deltaTime; });
      s.laserArcs = s.laserArcs.filter(a => a.life > 0);
      s.laserEmbers.forEach(e => { e.x += e.vx; e.y += e.vy; e.life -= 0.015 * deltaTime; });
      s.laserEmbers = s.laserEmbers.filter(e => e.life > 0);

      // RENDER ARCS & EMBERS
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      s.laserArcs.forEach(a => {
          ctx.beginPath(); ctx.strokeStyle = "#fff"; ctx.shadowColor = "#00ffff"; ctx.shadowBlur = 30; ctx.globalAlpha = a.life; ctx.lineWidth = 3;
          let x = start.x; let y = start.y + a.offset; ctx.moveTo(x, y);
          while (x < end.x) { x += 50; y += (Math.random() - 0.5) * 80; ctx.lineTo(x, y); }
          ctx.stroke();
      });
      s.laserEmbers.forEach(e => {
          ctx.beginPath(); ctx.globalAlpha = e.life; ctx.fillStyle = e.color; ctx.shadowBlur = 20; ctx.shadowColor = e.color;
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();

      // SCREEN FLASH
      if (s.laserFlashAlpha > 0.01) {
          ctx.save(); ctx.fillStyle = `rgba(255,255,255,${s.laserFlashAlpha})`; ctx.fillRect(0,0,cWidth,cHeight); ctx.restore();
          s.laserFlashAlpha *= 0.88;
      }

      // Update Energy Balls
      s.specialEnergyBalls = s.specialEnergyBalls.filter(ball => {
          ball.life -= 0.016 * deltaTime;
          if (now - ball.lastTick >= 500) {
              ball.lastTick = now;
              s.enemies.forEach(e => {
                  const ex = (e.x / 100) * cWidth;
                  const ey = (e.y / 100) * cHeight;
                  const dist = Math.hypot(ex - ball.x, ey - ball.y);
                  if (dist < 150) {
                      const totalDmg = ball.damage;
                      if (e.shield > 0) {
                          const sDmg = Math.min(e.shield, totalDmg);
                          e.shield -= sDmg;
                          const rem = totalDmg - sDmg;
                          if (rem > 0) e.hp = Math.max(0, e.hp - totalDmg);
                      } else {
                          e.hp = Math.max(0, e.hp - totalDmg);
                      }
                      createImpactEffect(ex, ey, '#fb923c', 0, 2, 'ship');
                      createDamageNumber(e.x, e.y - 20, totalDmg, true, 'player');
                  }
              });
          }
          // Visuals
          ctx.save(); ctx.globalAlpha = ball.life / 6;
          ctx.fillStyle = '#d946ef'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 40 + Math.sin(now * 0.01) * 10, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          return ball.life > 0;
      });
      }

      const moveSpeed = 1.1 * effectiveDelta;
      if (s.keysPressed.has('w') || s.keysPressed.has('arrowup')) s.playerY = Math.max(5, s.playerY - moveSpeed);
      if (s.keysPressed.has('s') || s.keysPressed.has('arrowdown')) s.playerY = Math.min(95, s.playerY + moveSpeed);
      if (s.keysPressed.has('a') || s.keysPressed.has('arrowleft')) s.playerX = Math.max(5, s.playerX - moveSpeed);
      if (s.keysPressed.has('d') || s.keysPressed.has('arrowright')) s.playerX = Math.min(45, s.playerX + moveSpeed);

      if (now % 3 === 0) {
        if (!s.playerIsExploding) {
          const pDmgFactor = 1.0 + (1.0 - s.playerHp / s.playerMaxHp) * 1.5;
          const isSkyring = activeShipImage?.includes('skyring');
          // Skyring base smoke is more frequent and detailed
          const smokeCount = (Math.random() < pDmgFactor ? Math.ceil(pDmgFactor) : Math.floor(pDmgFactor)) * (isSkyring ? 2 : 1);
          for (let i = 0; i < smokeCount; i++) {
            s.particles.push({
              id: `pe-${now}-p-${i}-${Math.random()}`,
              x: s.playerX - 4.5,
              y: s.playerY + (Math.random() - 0.5) * 1.5,
              vx: (isSkyring ? -0.8 - Math.random() * 0.8 : -0.4 - Math.random() * 0.4) * pDmgFactor,
              vy: (Math.random() - 0.5) * 0.2 * pDmgFactor,
              life: 1.0,
              size: (isSkyring ? 4 + Math.random() * 5 : 3 + Math.random() * 4) * (pDmgFactor > 1.8 ? 1.4 : 1.0),
              color: pDmgFactor > 2.0 ? 'rgba(80, 80, 80, 0.5)' : (isSkyring ? 'rgba(34, 211, 238, 0.6)' : 'rgba(34, 211, 238, 0.4)'),
              type: 'smoke'
            });
          }
        }

        const isMythic = playerShipStats.rarity === 'mythic';
        if (isMythic && !s.playerIsExploding) {
          for (let i = 0; i < 6; i++) {
            s.particles.push({
              id: `fire-${now}-${i}-${Math.random()}`,
              x: s.playerX - 7,
              y: s.playerY + (Math.random() - 0.5) * 3,
              vx: -3 - Math.random() * 2,
              vy: (Math.random() - 0.5) * 1,
              life: 0.5,
              size: 8 + Math.random() * 10,
              color: Math.random() > 0.5 ? '#f472b6' : '#8b5cf6',
              type: 'smoke'
            });
          }
        }

        const isSkyring = activeShipImage?.includes('skyring');



        // Cinematic Overlays
        if (s.impactFlash > 0.01) {
            ctx.save(); ctx.fillStyle = `rgba(255, 140, 20, ${s.impactFlash * 0.22})`; ctx.fillRect(0, 0, cWidth, cHeight); ctx.restore();
            s.impactFlash *= 0.82;
        }
        if (s.cinematicDarkness > 0.01) {
            ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${s.cinematicDarkness * 0.35})`; ctx.fillRect(0, 0, cWidth, cHeight); ctx.restore();
            s.cinematicDarkness *= 0.92;
        }
        if (isSkyring && !s.playerIsExploding) {
          // Layer 1: Core Heat - Very fast white/yellow sparks at the nozzle
          for (let i = 0; i < 3; i++) {
            s.particles.push({
              id: `sky-core-${now}-${i}`,
              x: s.playerX - 3,
              y: s.playerY + (Math.random() - 0.5) * 1,
              vx: -8 - Math.random() * 6,
              vy: (Math.random() - 0.5) * 1,
              life: 0.3,
              size: 2 + Math.random() * 3,
              color: Math.random() > 0.5 ? '#fff' : '#fef08a', // white or yellow-200
              type: 'spark'
            });
          }

          // Layer 2: Plasma Exhaust - Multi-colored vibrant flow
          for (let i = 0; i < 5; i++) {
            const colorType = Math.random();
            s.particles.push({
              id: `sky-plasma-${now}-${i}`,
              x: s.playerX - 4,
              y: s.playerY + (Math.random() - 0.5) * 2.5,
              vx: -4 - Math.random() * 4,
              vy: (Math.random() - 0.5) * 1.2,
              life: 0.5 + Math.random() * 0.3,
              size: 6 + Math.random() * 10,
              color: colorType > 0.6 ? 'rgba(249, 115, 22, 0.8)' : (colorType > 0.3 ? 'rgba(168, 85, 247, 0.7)' : 'rgba(192, 38, 211, 0.6)'), // Orange, Purple, Fuchsia
              type: 'smoke'
            });
          }

          // Layer 3: Dissipating Smoke - Large, slow, transparent purple/grey
          if (now % 2 === 0) {
            for (let i = 0; i < 2; i++) {
              s.particles.push({
                id: `sky-dissipation-${now}-${i}`,
                x: s.playerX - 10 - Math.random() * 5,
                y: s.playerY + (Math.random() - 0.5) * 6,
                vx: -1 - Math.random() * 1.5,
                vy: (Math.random() - 0.5) * 0.8,
                life: 0.8,
                size: 15 + Math.random() * 20,
                color: Math.random() > 0.5 ? 'rgba(75, 85, 99, 0.3)' : 'rgba(126, 34, 206, 0.2)', // slate-600 or purple-700
                type: 'smoke'
              });
            }
          }
        }

        s.enemies.forEach(e => {
          if (e.hp > 0) {
            const isMonster = routeTier === 'Void';
            const eDmgFactor = 1.0 + (1.0 - e.hp / e.maxHp) * 1.5;
            const smokeCount = Math.random() < eDmgFactor ? Math.ceil(eDmgFactor) : Math.floor(eDmgFactor);
            for (let i = 0; i < smokeCount; i++) {
              s.particles.push({
                id: `pe-${now}-e-${e.id}-${i}-${Math.random()}`,
                x: e.x + 5.5,
                y: e.y + (Math.random() - 0.5) * (isMonster ? 4 : 2),
                vx: (0.4 + Math.random() * 0.4) * eDmgFactor,
                vy: (Math.random() - 0.5) * 0.2 * eDmgFactor,
                life: isMonster ? 0.6 : 1.0,
                size: (isMonster ? 2 + Math.random() * 3 : 4 + Math.random() * 5) * (eDmgFactor > 1.8 ? 1.4 : 1.0),
                color: isMonster
                  ? (eDmgFactor > 2.0 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(74, 222, 128, 0.3)')
                  : (eDmgFactor > 2.0 ? 'rgba(60, 60, 60, 0.5)' : 'rgba(239, 68, 68, 0.4)'),
                type: 'smoke'
              });
            }
          }
        });
      }      if (s.playerHp > 0 || (s.playerIsExploding && now - (s.explosionStart || 0) < 1500)) {
        s.projectiles = s.projectiles.filter(p => {
          p.x += (p.vx || 0) * effectiveDelta;
          p.y += (p.vy || 0) * effectiveDelta;

          if (!p.trail) p.trail = [];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 7) p.trail.shift();

          // Skyring Neon Smoke Trail
          if (p.isSkyring && s.frameCount % 2 === 0) {
            s.particles.push({
              id: `sky-trail-${now}-${Math.random()}`,
              x: p.x - (p.vx || 0) * 0.5,
              y: p.y - (p.vy || 0) * 0.5,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              life: 0.5,
              size: 3 + Math.random() * 4,
              color: Math.random() > 0.5 ? 'rgba(251, 146, 60, 0.6)' : 'rgba(168, 85, 247, 0.6)',
              type: 'smoke'
            });
          }

          if (p.x < -10 || p.x > 110 || p.y < -10 || p.y > 110) return false;

          let hit = false;
          if (p.owner === 'player') {
            for (let j = 0; j < s.enemies.length; j++) {
              const enemy = s.enemies[j];
              if (enemy.hp > 0 && Math.abs(p.x - enemy.x) < 6 && Math.abs(p.y - enemy.y) < 10) {
                let d = p.damage;
                if (enemy.shield > 0) {
                  const sD = Math.min(enemy.shield, d);
                  enemy.shield -= sD;
                  d -= sD;
                }
                enemy.hp = Math.max(0, enemy.hp - d);
                const impactAngle = Math.atan2(p.vy || 0, p.vx || 0);
                createImpactEffect(p.x, p.y, p.isCrit ? '#fcd34d' : '#22d3ee', impactAngle, 1.0, 'ship', 1.5);
                createDamageNumber(enemy.x, enemy.y - 10, p.damage, p.isCrit || false, 'player');
                  if (enemy.hp <= 0 && !enemy.isExploding) {
                    enemy.isExploding = true;
                    createExplosionEffect(enemy.x, enemy.y, '#ef4444');
                    const locKey = locationId === 0 ? 'zero' : locationId;
                    if (routeTier === 'Void') {
                      if (enemy.type === 'Boss') {
                        stopSfx(`boss_scream_${locKey}`);
                        playSfx(`boss_explosion_${locKey}`);
                      } else {
                        playSfx('alien_explosion_zero');
                      }
                    } else {
                      playSfx('enemy_explosion');
                    }
                  }
                hit = true;
                break;
              }
            }
          } else {
            if (Math.abs(p.x - s.playerX) < 4 && Math.abs(p.y - s.playerY) < 7) {
              let d = p.damage;
              if (s.playerShield > 0) {
                const sD = Math.min(s.playerShield, d);
                s.playerShield -= sD;
                d -= sD;
              }
              s.playerHp = Math.max(0, s.playerHp - d);
              triggerShake(d > 100 ? 12 : 8);
              const impactAngle = Math.atan2(p.vy || 0, p.vx || 0);
              createImpactEffect(p.x, p.y, '#ef4444', impactAngle, 1.2, 'ship');
              createDamageNumber(s.playerX, s.playerY - 10, p.damage, false, 'enemy');
              if (p.dotDamagePerSecond && p.dotDurationMs) {
                s.playerDotEffects.push({
                  damagePerSecond: p.dotDamagePerSecond,
                  endsAt: now + p.dotDurationMs,
                  nextTick: now + 1000,
                  ticksRemaining: Math.max(1, Math.round(p.dotDurationMs / 1000))
                });
              }
              if (s.playerHp <= 0 && !s.playerIsExploding) {
                s.playerIsExploding = true;
                s.explosionStart = now;
                triggerShake(25);
                createExplosionEffect(s.playerX, s.playerY, '#22d3ee');
                playSfx('error');
              }
              hit = true;
            }
          }
          return !hit;
        });

        // METEOR SHOWER LOGIC
        if (s.meteorEvent?.active) {
          const eventElapsed = now - s.meteorEvent.startTime;
          if (eventElapsed > 0 && eventElapsed < 25000) {
            // Warning Message
            if (!s.meteorEvent.warningShown) {
              s.meteorEvent.warningShown = true;
              addLog(language === 'pt' ? 'CUIDADO: CHUVA DE METEORITOS À FRENTE!' : 'WARNING: METEOR SHOWER AHEAD!', 'warning');
              playSfx('alert_alert');
            }

            // Spawn Meteors
            const spawnInterval = 600 + Math.random() * 400; // ms
            if (now - s.meteorEvent.lastSpawn > spawnInterval) {
              s.meteorEvent.lastSpawn = now;
              const isLarge = Math.random() < 0.3; // 30% chance for large meteor
              const type = isLarge ? 'meteor' : 'meteorite';
              const size = isLarge ? 12 + Math.random() * 6 : 6 + Math.random() * 3;
              const hp = isLarge ? 3 + Math.floor(Math.random() * 2) : 1;

              // Speed: 25% slower base for Large, 10% slower for Small
              const baseSpeed = routeTier === 'Void' ? 1.0 : 1.2;
              const meteorSpeed = (baseSpeed * (isLarge ? 0.35 : 0.9)) * (0.8 + Math.random() * 0.4);

              s.meteors.push({
                id: `meteor-${now}-${Math.random()}`,
                x: 105,
                y: 5 + Math.random() * 90,
                vx: -meteorSpeed * effectiveDelta,
                vy: (Math.random() - 0.5) * 0.1 * effectiveDelta,
                hp,
                maxHp: hp,
                size,
                type,
                imageIndex: Math.floor(Math.random() * 2) + 1
              });

            }
          }
        }

        // Update Meteors
        s.meteors = s.meteors.filter(m => {
          m.x += m.vx * effectiveDelta;
          m.y += m.vy * effectiveDelta;

          // Add smoke trail based on frameCount
          if (s.frameCount % 3 === 0) {
            const isMeteor = m.type === 'meteor';
            s.particles.push({
              id: `meteor-trail-${now}-${Math.random()}`,
              x: m.x - m.vx * 0.5,
              y: m.y - m.vy * 0.5,
              vx: -m.vx * 0.2 + (Math.random() - 0.5) * 0.2,
              vy: (Math.random() - 0.5) * 0.2,
              life: isMeteor ? 1.0 : 0.6,
              size: (m.size / 2) + Math.random() * 4,
              color: isMeteor ? 'rgba(251, 146, 60, 0.4)' : 'rgba(148, 163, 184, 0.3)',
              type: 'smoke'
            });
          }

          if (m.x < -15) return false;

          // Collision with Player Projectiles
          for (let i = 0; i < s.projectiles.length; i++) {
            const p = s.projectiles[i];
            if (p.owner === 'player' && Math.abs(p.x - m.x) < m.size/2 + 2 && Math.abs(p.y - m.y) < m.size/2 + 2) {
              const isCrit = p.isCrit ?? false;
              const dmg = isCrit ? 2 : 1;
              m.hp -= dmg;
              p.x = 200; // Marcar para remoção no próximo loop do projétil
              playSfx('click');
              createImpactEffect(m.x, m.y, '#fff', 0, 1, m.type === 'meteor' ? 'meteor' : 'meteorite');
              createDamageNumber(m.x, m.y - 10, dmg, isCrit, 'player');

                if (m.hp <= 0) {
                  if (m.type === 'meteor') s.destroyedMeteors++;
                  else s.destroyedMeteorites++;

                  createExplosionEffect(m.x, m.y, '#fbbf24');
                  playSfx('enemy_explosion');
                  const meteorReward = m.type === 'meteor' ? meteorQcValue : meteoriteQcValue;
                  s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + meteorReward;
                  return false;
                }
            }
          }

          // Collision with Player Ship
          if (!s.playerIsExploding && Math.abs(m.x - s.playerX) < 4 + m.size/3 && Math.abs(m.y - s.playerY) < 6 + m.size/3) {
            const damage = m.type === 'meteor' ? 200 : 100;
            if (s.playerShield > 0) {
              s.playerShield -= Math.min(s.playerShield, damage);
            } else {
              s.playerHp = Math.max(0, s.playerHp - damage);
            }
            triggerShake(damage > 150 ? 15 : 10);
            createExplosionEffect(m.x, m.y, '#ef4444');
            playSfx('error');

            if (s.playerHp <= 0 && !s.playerIsExploding) {
              s.playerIsExploding = true;
              s.explosionStart = now;
              triggerShake(25);
              createExplosionEffect(s.playerX, s.playerY, '#22d3ee');
            }
            return false;
          }

          return true;
        });

        for (let j = 0; j < s.enemies.length; j++) {
          const enemy = s.enemies[j];
          if (enemy.hp <= 0) continue;

          const oldX = enemy.x;
          const oldY = enemy.y;

          const dy = s.playerY - enemy.y;
          const trackingSpeed = (enemy.type === 'Boss' ? 0.05 : 0.03) * deltaTime;
          enemy.y += dy * trackingSpeed;

          enemy.x = 80 + Math.sin(now / 1200) * 8;

          // Calculate movement vectors for sprite selection
          enemy.vx = enemy.x - oldX;
          enemy.vy = enemy.y - oldY;
        }

        // Enemy Attack — Com IA de mira real e lastShot
        s.enemies.forEach(enemy => {
          if (enemy.hp <= 0) return;
          if (now - (enemy.lastShot || 0) > 2500) {
            enemy.lastShot = now;
            const dx = s.playerX - enemy.x;
            const dy = s.playerY - enemy.y;
            const dist = Math.hypot(dx, dy) || 1;
            const bossConfig = routeTier === 'Void' && enemy.type === 'Boss' ? BOSS_INTROS[locationId] : undefined;
            const projectileDamage = bossConfig ? randomInt(bossConfig.damage) : enemy.damage;
            if (bossConfig?.attack === 'moltenIron' && locationId === 5) {
              enemy.shootSpriteUntil = now + BOSS_SHOOT_SPRITE_MS;
            }

            s.projectiles.push({
              id: `ep-${now}-${enemy.id}`,
              x: enemy.x - 5,
              y: enemy.y,
              owner: 'enemy',
              damage: projectileDamage,
              vx: (dx / dist) * (bossConfig?.attack === 'abyssLaser' || bossConfig?.attack === 'godArc' ? 4.8 : 3),
              vy: (dy / dist) * (bossConfig?.attack === 'abyssLaser' || bossConfig?.attack === 'godArc' ? 4.8 : 3),
              bossAttack: bossConfig?.attack,
              dotDamagePerSecond: bossConfig?.dot ? randomInt(bossConfig.dot.damage) : undefined,
              dotDurationMs: bossConfig?.dot?.durationMs,
              trail: []
            });

            if (routeTier === 'Void') {
              const locKey = locationId === 0 ? 'zero' : locationId;
              if (enemy.type === 'Boss') playSfx(`shoot_boss_${locKey}`);
              else if (enemy.type === 'Elite') playSfx('shoot_elite_zero');
              else playSfx('shoot_monster_zero');
            } else {
              playSfx('shoot_enemy');
            }
          }
        });
        s.lastEnemyAttack = now;

        s.playerDotEffects = s.playerDotEffects.filter(dot => {
          if (dot.ticksRemaining <= 0) return false;
          if (now >= dot.nextTick) {
            const dmg = dot.damagePerSecond;
            if (s.playerShield > 0) {
              const shieldDamage = Math.min(s.playerShield, dmg);
              s.playerShield -= shieldDamage;
              s.playerHp = Math.max(0, s.playerHp - (dmg - shieldDamage));
            } else {
              s.playerHp = Math.max(0, s.playerHp - dmg);
            }
            createDamageNumber(s.playerX, s.playerY - 13, dmg, false, 'enemy');
            dot.ticksRemaining -= 1;
            dot.nextTick += 1000;
            if (s.playerHp <= 0 && !s.playerIsExploding) {
              s.playerIsExploding = true;
              s.explosionStart = now;
              triggerShake(25);
              createExplosionEffect(s.playerX, s.playerY, '#22d3ee');
              playSfx('error');
            }
          }
          return dot.ticksRemaining > 0 && now < dot.endsAt + 1000;
        });

        // Screen Effects Update
        s.flashAlpha *= 0.88;
        s.cameraPunch.x += (s.cameraPunch.targetX - s.cameraPunch.x) * 0.3;
        s.cameraPunch.y += (s.cameraPunch.targetY - s.cameraPunch.y) * 0.3;

        // Shockwaves & Scars Update
        s.shockwaves = s.shockwaves.filter(sw => {
          sw.radius += sw.speed;
          sw.speed *= 0.92;
          sw.alpha *= 0.88;
          sw.thickness *= 0.95;
          return sw.alpha > 0.01;
        });
        s.scars = s.scars.filter(scar => {
          scar.life -= 0.01 * effectiveDelta;
          return scar.life > 0;
        });

        // Particle Update — Enhanced Physics
        s.particles = s.particles.filter(p => {
          p.prevX = p.x;
          p.prevY = p.y;
          p.vx *= (p.friction || 0.96);
          p.vy *= (p.friction || 0.96);
          p.vy += (p.gravity || 0);
          p.x += p.vx * effectiveDelta * 0.15;
          p.y += p.vy * effectiveDelta * 0.15;
          p.size += (p.growth || 0) * effectiveDelta;
          p.life -= (p.type === 'ember' ? 0.005 : 0.02) * effectiveDelta;
          return p.life > 0 && p.size > 0.1;
        });

        // Limite de Partículas (Performance AAA)
        const MAX_PARTICLES = 250;
        if (s.particles.length > MAX_PARTICLES) {
          s.particles.splice(0, s.particles.length - MAX_PARTICLES);
        }

        // Damage Numbers Update
        const remainingDN: VoidBattleDamageNumber[] = [];
        for (let i = 0; i < s.damageNumbers.length; i++) {
          const dn = s.damageNumbers[i];
          dn.y -= 0.3 * deltaTime;
          dn.life -= 0.02 * deltaTime;
          if (dn.life > 0) remainingDN.push(dn);
        }
        s.damageNumbers = remainingDN;
      }

      // ── HELLFIRE BARRAGE: Trail Particles ──
      if (s.trailParts.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        s.trailParts = s.trailParts.filter(p => {
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.vy -= 0.05 * deltaTime;
          p.life -= p.decay * deltaTime;
          if (p.life <= 0) return false;

          const px2 = (p.x / 100) * cWidth;
          const py2 = (p.y / 100) * cHeight;
          const a = p.life * (p.smoke ? 0.20 : 0.65);
          ctx.globalAlpha = a;

          if (p.smoke) {
            const sg = ctx.createRadialGradient(px2, py2, 0, px2, py2, p.size * p.life * 0.5 * (cWidth / 800));
            sg.addColorStop(0, `rgba(255,120,20,${p.life * 0.5})`);
            sg.addColorStop(1, 'transparent');
            ctx.fillStyle = sg;
          } else {
            ctx.fillStyle = p.color;
          }
          const r = Math.max(0.5, p.size * p.life * (cWidth / 800));
          ctx.beginPath();
          ctx.arc(px2, py2, r, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });
        ctx.restore();
      }

      // ── HELLFIRE BARRAGE: Burn Zones ──
      s.burnZones = s.burnZones.filter(bz => {
        const age = now - bz.startTime;
        bz.life = Math.max(0, 1 - age / bz.duration);
        if (bz.life <= 0) return false;

        const bx = bz.x; // já em pixels (gravado no spawnHBImpact)
        const by = bz.y;
        const flicker = 0.85 + Math.sin(now * 0.018 + bx * 0.005) * 0.15;
        const r = bz.radius * flicker;

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0,    `rgba(255,210,60,${bz.life * 0.9})`);
        g.addColorStop(0.3,  `rgba(255,100,10,${bz.life * 0.75})`);
        g.addColorStop(0.65, `rgba(180,20,0,${bz.life * 0.5})`);
        g.addColorStop(1,    'transparent');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dano contínuo aos inimigos na zona (a cada 20 frames)
        if (s.frameCount % 20 === 0) {
          s.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const ex = (en.x / 100) * cWidth;  // ← FIX 3: converter para pixels
            const ey = (en.y / 100) * cHeight;
            const d = Math.hypot(ex - bx, ey - by);
            if (d < bz.radius) {
              const dmg = playerShipStatsRef.current.damage * HELLFIRE_BURN_TICK_DAMAGE_MULTIPLIER * deltaTime;
              applyPlayerDamageToEnemy(en, dmg);
              // Add visible damage number for DoT
            }
          });
        }
        return true;
      });

      // ── HELLFIRE BARRAGE: Fireballs ──
      if (s.fireballs.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        s.fireballs = s.fireballs.filter(fb => {
          // FIX 1 aplicado: deltaTime sem divisão por 16
          if (now < fb.readyAt) return true;

          let target = s.enemies.find(en => en.id === fb.targetId && en.hp > 0);
          if (!target) {
            target = findNearestLivingEnemy(s, fb.x, fb.y, cWidth, cHeight) || undefined;
            fb.targetId = target?.id;
          }

          if (target) {
            fb.tx = (target.x / 100) * cWidth;
            fb.ty = (target.y / 100) * cHeight;
          }

          fb.t += fb.speed * deltaTime;  // ← CORRETO

          const cx = (fb.ox + fb.tx) / 2;
          const cy = (fb.oy + fb.ty) / 2 + fb.arcBend;
          fb.x = bezier(fb.ox, cx, fb.tx, fb.t);
          fb.y = bezier(fb.oy, cy, fb.ty, fb.t);

          const hitDistance = target ? Math.hypot((target.x / 100) * cWidth - fb.x, (target.y / 100) * cHeight - fb.y) : Infinity;
          if (fb.t >= 1 || hitDistance < Math.max(34, fb.size * 1.25)) {
            // Impacto individual: cada bola recalcula o alvo vivo e explode onde ele está agora.
            spawnHBImpact(target ? (target.x / 100) * cWidth : fb.tx, target ? (target.y / 100) * cHeight : fb.ty);
            return false;
          }

          // Trail a cada frame
          const isSpark = Math.random() < 0.32;
          s.trailParts.push({
            x: (fb.x / cWidth) * 100,
            y: (fb.y / cHeight) * 100,
            vx: (Math.random() - 0.5) * 0.08,
            vy: -0.06 - Math.random() * 0.12,
            life: 1,
            decay: isSpark ? 0.055 + Math.random() * 0.06 : 0.015 + Math.random() * 0.018,
            size: isSpark ? (2 + Math.random() * 4) * (800 / cWidth) : (8 + Math.random() * 18) * (800 / cWidth),
            smoke: !isSpark && Math.random() < 0.42,
            color: pickFireColorHB(Math.random()),
          });

          // Desenhar bola
          const pulse = 1 + Math.sin(now * 0.018 + fb.x * 0.003) * 0.18;
          const r = fb.size * pulse;

          const halo = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, r * 3);
          halo.addColorStop(0,   'rgba(255,150,20,0)');
          halo.addColorStop(0.4, 'rgba(255,70,0,0.13)');
          halo.addColorStop(1,   'transparent');
          ctx.globalAlpha = 0.75;
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(fb.x, fb.y, r * 3, 0, Math.PI * 2); ctx.fill();

          const cg = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, r);
          cg.addColorStop(0,    'rgba(255,255,210,1)');
          cg.addColorStop(0.18, 'rgba(255,185,35,1)');
          cg.addColorStop(0.5,  'rgba(255,65,0,0.95)');
          cg.addColorStop(0.85, 'rgba(160,15,0,0.7)');
          cg.addColorStop(1,    'transparent');
          ctx.globalAlpha = 1;
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(fb.x, fb.y, r, 0, Math.PI * 2); ctx.fill();

          // Núcleo branco
          ctx.fillStyle = 'rgba(255,255,220,0.95)';
          ctx.beginPath(); ctx.arc(fb.x, fb.y, r * 0.22, 0, Math.PI * 2); ctx.fill();

          return true;
        });
        ctx.restore();
      }

      // Draw Player with Dynamic Tilting
      if (!s.playerIsExploding) {
        let activePlayerId = 'player_neutral';
        if (s.keysPressed.has('w') || s.keysPressed.has('arrowup')) activePlayerId = 'player_up';
        else if (s.keysPressed.has('s') || s.keysPressed.has('arrowdown')) activePlayerId = 'player_down';
        else if (s.keysPressed.has('d') || s.keysPressed.has('arrowright')) activePlayerId = 'player_forward';

        const pImg = assetsRef.current[activePlayerId] || assetsRef.current['player_neutral'];
        if (pImg) {
          ctx.save();
          const isMythic = playerShipStats.rarity === 'mythic';
          const isSkyring = activeShipImage?.includes('skyring');
          const baseWidth = 110;
          let imgW = isMythic ? baseWidth * 1.15 : baseWidth;

          // Increase size by 20% for Skyring in Routes 1 & 2
          if (isSkyring && routeTier !== 'Void') {
            imgW *= 1.20;
          }

          const imgH = pImg.height * (imgW / pImg.width);
          ctx.drawImage(pImg, (s.playerX / 100) * cWidth - imgW/2, (s.playerY / 100) * cHeight - imgH/2, imgW, imgH);
          ctx.restore();
        }
      } else {
        // Player Explosion
        const elapsed = now - (s.explosionStart || 0);
        if (elapsed < 1500) {
          ctx.beginPath();
          ctx.arc((s.playerX / 100) * cWidth, (s.playerY / 100) * cHeight, (elapsed / 1500) * 80, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, ${1 - elapsed / 1500})`;
          ctx.fill();
        }
      }

      // Draw Meteors — PNG Original
      s.meteors.forEach(m => {
        const mImg = assetsRef.current[`${m.type}${m.imageIndex}`];
        if (mImg) {
          const x = (m.x / 100) * cWidth;
          const y = (m.y / 100) * cHeight;
          const imgW = (m.size / 100) * cWidth;
          const imgH = mImg.height * (imgW / mImg.width);

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((now / 800) * (m.type === 'meteor' ? 1 : 1.5));
          ctx.drawImage(mImg, -imgW/2, -imgH/2, imgW, imgH);
          ctx.restore();

          if (m.type === 'meteor' && m.hp < m.maxHp) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x - 20, y + imgH/2 + 5, 40, 3);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(x - 20, y + imgH/2 + 5, 40 * (m.hp / m.maxHp), 3);
          }
        }
      });

      // Draw Enemies — PNG Original
      s.enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          let x = (enemy.x / 100) * cWidth;
          let y = (enemy.y / 100) * cHeight;
          const assetId = enemy.originalId || enemy.id;
          let spriteSuffix = '_neutral';
          if (enemy.type === 'Boss' && routeTier === 'Void') {
            const shootImg = assetsRef.current[`${assetId}_shoot`];
            if (now < (enemy.shootSpriteUntil || 0) && shootImg && shootImg.width > 0) {
              spriteSuffix = '_shoot';
            } else {
              const vx = enemy.vx || 0;
              const vy = enemy.vy || 0;
              const absX = Math.abs(vx);
              const absY = Math.abs(vy);

              if (absY > absX && absY > 0.02) spriteSuffix = vy < 0 ? '_up' : '_down';
              else if (absX > 0.02) spriteSuffix = vx < 0 ? '_forward' : '_backward';
            }

            if (!enemy.spriteSuffix) enemy.spriteSuffix = spriteSuffix;
            if (enemy.spriteSuffix !== spriteSuffix) {
              enemy.previousSpriteSuffix = enemy.spriteSuffix;
              enemy.spriteSuffix = spriteSuffix;
              enemy.spriteTransitionStartedAt = now;
            }
          } else if (Math.abs(enemy.vy || 0) > 0.05) {
            spriteSuffix = (enemy.vy || 0) < 0 ? '_up' : '_down';
          }
          const eImg = assetsRef.current[`${assetId}${spriteSuffix}`] || assetsRef.current[`${assetId}_neutral`];

          if (eImg && eImg.width > 0) {
            if (routeTier === 'Void') {
              let baseSize = 128;
              if (enemy.type === 'Boss') baseSize *= 3.0;
              else if (enemy.type === 'Elite') baseSize *= 1.25;
              const imgW = baseSize;
              const imgH = eImg.height * (imgW / eImg.width);
              if (enemy.type !== 'Boss') {
                y += Math.sin(now / 400 + enemy.y) * 10;
                x += Math.cos(now / 600 + enemy.x) * 5;
              }

              ctx.save();
              ctx.globalAlpha = 0.3;
              ctx.filter = 'blur(15px)';
              ctx.fillStyle = enemy.type === 'Padrão' ? '#a855f7' : '#f43f5e';
              ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
              ctx.restore();

              if (enemy.type === 'Boss') {
                const previousImg = enemy.previousSpriteSuffix
                  ? assetsRef.current[`${assetId}${enemy.previousSpriteSuffix}`]
                  : undefined;
                const transitionStartedAt = enemy.spriteTransitionStartedAt || 0;
                const fadeProgress = transitionStartedAt
                  ? Math.min(1, (now - transitionStartedAt) / BOSS_SPRITE_FADE_MS)
                  : 1;

                if (previousImg && previousImg.width > 0 && fadeProgress < 1) {
                  ctx.save();
                  ctx.globalAlpha = 1 - fadeProgress;
                  ctx.drawImage(previousImg, x - imgW/2, y - imgH/2, imgW, imgH);
                  ctx.restore();

                  ctx.save();
                  ctx.globalAlpha = fadeProgress;
                  ctx.drawImage(eImg, x - imgW/2, y - imgH/2, imgW, imgH);
                  ctx.restore();
                } else {
                  ctx.drawImage(eImg, x - imgW/2, y - imgH/2, imgW, imgH);
                  enemy.previousSpriteSuffix = undefined;
                  enemy.spriteTransitionStartedAt = undefined;
                }
              } else {
                ctx.drawImage(eImg, x - imgW/2, y - imgH/2, imgW, imgH);
              }
            } else {
              // PNG Original para Rotas 1 e 2
              const imgW = 110;
              const imgH = eImg.height * (imgW / eImg.width);
              ctx.save();
              ctx.translate(x, y);
              ctx.drawImage(eImg, -imgW/2, -imgH/2, imgW, imgH);
              ctx.restore();
            }
          } else if (enemy.hp > 0) {
            // Fallback visualization if image is missing
            ctx.save();
            ctx.fillStyle = enemy.enemyColor || '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
            // Pulse effect
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 30 + Math.sin(now / 200) * 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(x - 20, y + 25, 40, 4);
          ctx.fillStyle = routeTier === 'Void' ? '#a855f7' : '#ef4444';
          ctx.fillRect(x - 20, y + 25, 40 * (enemy.hp / enemy.maxHp), 4);
        }
      });
      s.projectiles.forEach(p => {
        const isMonsterShot = p.owner === 'enemy' && routeTier === 'Void';
        const isCrit = p.isCrit ?? false;
        const isPlayer = p.owner === 'player';
        const color = isCrit ? '#FFD700' : (isPlayer ? '#22d3ee' : '#ef4444');
        const px = (p.x / 100) * cWidth;
        const py = (p.y / 100) * cHeight;

        // Trilha de luz escalada (Otimizada)
        const baseRadius = cWidth * 0.004;
        if (p.trail) {
          p.trail.forEach((pos, ti) => {
            const progress = ti / p.trail!.length;
            ctx.globalAlpha = progress * (isPlayer ? 0.3 : 0.2);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc((pos.x / 100) * cWidth, (pos.y / 100) * cHeight, baseRadius * progress * (isPlayer ? 1.1 : 1), 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.globalAlpha = 1;

        if (p.isSkyring) {
          const pw = 30 * (p.size || 1);
          const ph = 8 * (p.size || 1);
          ctx.save();
          // shadowBlur é caro, removido para performance em loop
          ctx.fillStyle = 'rgba(251, 146, 60, 0.4)';
          ctx.beginPath(); ctx.ellipse(px, py, pw/2 + 5, ph/2 + 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(px - pw/2, py);
          for(let i=1; i<=5; i++) ctx.lineTo(px - pw/2 + (pw/5)*i, py + (Math.random()-0.5)*6);
          ctx.stroke();
          ctx.restore();
        } else if (isMonsterShot) {
          const angle = Math.atan2((p.vy || 0) * cHeight, (p.vx || 0) * cWidth);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          if (p.bossAttack) ctx.scale(2, 2);
          ctx.globalCompositeOperation = 'lighter';

          if (p.bossAttack === 'acid') {
            ctx.fillStyle = 'rgba(74,222,128,0.9)';
            ctx.beginPath(); ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#dcfce7'; ctx.beginPath(); ctx.arc(-4, -3, 3, 0, Math.PI * 2); ctx.fill();
          } else if (p.bossAttack === 'fireball') {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
            g.addColorStop(0, '#fff7ad'); g.addColorStop(0.35, '#fb923c'); g.addColorStop(1, 'rgba(220,38,38,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
          } else if (p.bossAttack === 'toxicMud') {
            ctx.fillStyle = 'rgba(101,67,33,0.95)';
            ctx.beginPath(); ctx.ellipse(0, 0, 17, 10, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(132,204,22,0.9)'; ctx.beginPath(); ctx.arc(5, -2, 4, 0, Math.PI * 2); ctx.fill();
          } else if (p.bossAttack === 'darkRay') {
            ctx.strokeStyle = '#581c87'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(20, 0); ctx.stroke();
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2; ctx.stroke();
          } else if (p.bossAttack === 'moltenIron') {
            ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(-4, -3, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.stroke();
          } else if (p.bossAttack === 'sonicWave') {
            ctx.strokeStyle = 'rgba(103,232,249,0.9)';
            for (let i = 0; i < 3; i++) {
              ctx.beginPath(); ctx.arc(-i * 9, 0, 10 + i * 7, -0.9, 0.9); ctx.stroke();
            }
          } else if (p.bossAttack === 'darkBarrage') {
            ctx.fillStyle = '#111827';
            for (let i = 0; i < 4; i++) {
              ctx.beginPath(); ctx.arc(-i * 9, (i % 2 ? -5 : 5), 6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.5; ctx.stroke();
          } else if (p.bossAttack === 'abyssLaser') {
            const g = ctx.createLinearGradient(-36, 0, 28, 0);
            g.addColorStop(0, 'rgba(14,165,233,0)'); g.addColorStop(0.45, '#38bdf8'); g.addColorStop(1, '#ffffff');
            ctx.fillStyle = g; ctx.fillRect(-36, -4, 64, 8);
          } else if (p.bossAttack === 'godArc') {
            ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-10, -20, 20, 0); ctx.stroke();
            ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 6; ctx.globalAlpha = 0.55; ctx.stroke();
          } else {
            ctx.fillStyle = '#4ade80';
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#bbf7d0'; ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        } else if (isPlayer) {
          const angle = Math.atan2((p.vy || 0) * cHeight, (p.vx || 0) * cWidth);
          const length = (isCrit ? 30 : 22) * (p.size || 1);
          const width = (isCrit ? 5 : 3.5) * (p.size || 1);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(-length * 0.25, 0, length * 0.75, width * 1.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          const gradient = ctx.createLinearGradient(-length, 0, length * 0.35, 0);
          gradient.addColorStop(0, 'rgba(34,211,238,0)');
          gradient.addColorStop(0.35, color);
          gradient.addColorStop(1, '#ffffff');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(-length, -width / 2, length * 1.35, width, width / 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
          if (isCrit) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill(); }
        }
      });

      // Draw Shockwaves
      s.shockwaves.forEach(sw => {
        ctx.save();
        ctx.beginPath();
        ctx.arc((sw.x / 100) * cWidth, (sw.y / 100) * cHeight, (sw.radius / 100) * cWidth, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha})`;
        ctx.lineWidth = sw.thickness;
        // blur removido do loop, muito pesado para web
        ctx.stroke();
        ctx.restore();
      });

      // Draw Impact Scars
      s.scars.forEach(scar => {
        const sx = (scar.x / 100) * cWidth;
        const sy = (scar.y / 100) * cHeight;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(scar.rotation);
        ctx.globalAlpha = scar.life * 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(0, 0, scar.size, scar.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Energy Crack (Neon lines inside the scar)
        ctx.globalAlpha = scar.life * 0.15;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-scar.size/2, 0);
        ctx.lineTo(scar.size/2, 0);
        ctx.stroke();
        ctx.restore();
      });

      // Draw Particles — Otimizado (Single Pass para Performance)
      s.particles.forEach(p => {
        const px = (p.x / 100) * cWidth;
        const py = (p.y / 100) * cHeight;
        const alpha = Math.max(0, p.life / (p.maxLife || 1));

        ctx.save();
        if (p.blend) ctx.globalCompositeOperation = p.blend;
        ctx.globalAlpha = alpha;

        if (p.type === 'smoke' || p.type === 'heat' || p.type === 'residue' || p.type === 'bloom') {
          // Simplificado: Sem filter blur no loop principal (causa lag)
          ctx.fillStyle = p.color;
          if (p.type === 'smoke') ctx.globalAlpha = alpha * 0.4;
          else if (p.type === 'heat' || p.type === 'bloom') ctx.globalAlpha = alpha * 0.15;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sparks, Embers & Streaks - Otimizado com fillRect
          if (p.hasTrail && alpha > 0.1 && p.prevX && p.prevY) {
            ctx.beginPath();
            ctx.moveTo((p.prevX / 100) * cWidth, (p.prevY / 100) * cHeight);
            ctx.lineTo(px, py);
            ctx.lineWidth = p.size * 0.8;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = alpha * 0.6;
            ctx.stroke();
          }

          ctx.fillStyle = p.color;
          // fillRect é muito mais rápido que arc para partículas pequenas
          ctx.fillRect(px - p.size/2, py - p.size/2, p.size, p.size);
        }
        ctx.restore();
      });

      // Draw Flash Frame
      if (s.flashAlpha > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(${s.flashColor || '255, 255, 255'}, ${s.flashAlpha})`;
        ctx.fillRect(0, 0, cWidth, cHeight);
        ctx.restore();
      }

      // Draw Damage Numbers
      s.damageNumbers.forEach(dn => {
        const x = (dn.x / 100) * cWidth;
        const y = (dn.y / 100) * cHeight;
        ctx.save();
        ctx.globalAlpha = dn.life;
        ctx.fillStyle = dn.color;
        ctx.font = `bold ${dn.isCrit ? '24px' : '16px'} Orbitron`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = dn.color;
        ctx.fillText(dn.value.toString(), x, y);
        if (dn.isCrit) {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.strokeText(dn.value.toString(), x, y);
        }
        ctx.restore();
      });

      // Win/Loss detection
      if (!battleFinished) {
        const allEnemiesDead = s.enemies.every(e => e.hp <= 0);
        const isMeteorSurvivalEvent = Boolean(s.meteorEvent?.active);
        const meteorEventRunning = Boolean(s.meteorEvent?.active && now - s.meteorEvent.startTime < 25000);

        if (allEnemiesDead) {
          if (isMeteorSurvivalEvent && meteorEventRunning) {
            // In meteor events, the single enemy is only the opener.
            // After it dies, the player survives the shower and earns QC from destroyed rocks.
          } else if (!isMeteorSurvivalEvent && s.enemyQueue && s.enemyQueue.length > 0) {
             s.enemies.forEach(e => { s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (e.qc || 0); });
             const nextEnemy = s.enemyQueue.shift();
             if (nextEnemy) {
               s.enemies = [{ ...nextEnemy, isExploding: false }];
               s.lastEnemyAttack = now;
             }
          } else {
            if (!s.victoryExplosionStart) {
              s.victoryExplosionStart = now;
              if (!isMeteorSurvivalEvent) {
                s.enemies.forEach(e => { s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (e.qc || 0); });
              }
              s.enemies.forEach(e => { e.qc = 0; });

              if (routeTier === 'Void') {
                // Zoom activation removed
              }
            }
            const endDelay = routeTier === 'Void' ? 3500 : 1500;
            if (now - s.victoryExplosionStart > endDelay) {
              battleFinished = true;
              onBattleEnd('won', {
                reward: s.totalRewardAccumulated || 0,
                playerHp: s.playerHp,
                playerShield: s.playerShield,
                destroyedMeteors: s.destroyedMeteors,
                destroyedMeteorites: s.destroyedMeteorites,
                isMeteorEventReward: isMeteorSurvivalEvent,
                meteoriteRewardValue: meteoriteQcValue,
                meteorRewardValue: meteorQcValue,
                meteoriteRewardTotal: s.destroyedMeteorites * meteoriteQcValue,
                meteorRewardTotal: s.destroyedMeteors * meteorQcValue
              });
            }
          }
        } else if (s.playerHp <= 0) {
          if (routeTier === 'Void') {
             // Zoom activation removed
          }
          const endDelay = routeTier === 'Void' ? 3500 : 1500;
          if (now - (s.explosionStart || 0) > endDelay) {
            battleFinished = true;
            onBattleEnd('lost', {
              reward: 0,
              playerHp: 0,
              playerShield: 0
            });
          }
        }
      }

      ctx.restore(); // [/SHAKE] — Fim do contexto de tremor
      if (!battleFinished) animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const hudInterval = setInterval(() => {
      const s = gameRef.current;
      const now = Date.now();
      const displayEnemy = s.enemies.find(e => e.hp > 0) || s.enemies[0];
      setHud({
        playerHp: s.playerHp,
        playerShield: s.playerShield,
        enemyHp: displayEnemy.hp,
        enemyShield: displayEnemy.shield,
        enemyType: displayEnemy.type,
        enemyName: displayEnemy.name || displayEnemy.type,
        enemiesAlive: s.enemies.filter(e => e.hp > 0).length,
        dodgeCooldown: Math.max(0, (s.abilities.dodge.lastUsed + s.abilities.dodge.cooldown - now) / 1000),
        shieldCooldown: Math.max(0, (s.abilities.shield.lastUsed + s.abilities.shield.cooldown - now) / 1000),
        burstCooldown: Math.max(0, (s.abilities.burst.lastUsed + s.abilities.burst.cooldown - now) / 1000),
        specialCooldown: Math.max(0, (s.abilities.special.lastUsed + s.abilities.special.cooldown - now) / 1000),
        specialActive: now < s.abilities.special.activeUntil,
        playerIsExploding: !!s.playerIsExploding,
        meteorEventActive: s.meteorEvent?.active || false,
        meteorEventStartTime: s.meteorEvent?.startTime || 0
      });
    }, 100);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(hudInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [assetsLoaded, triggerAttack, onBattleEnd, playSfx, stopSfx, dimensions, routeTier, triggerAbility, playerShipStats, locationId, videoReady, showBossIntro, activeShipImage, addLog, initialEnemies, language, meteoriteQcValue, meteorQcValue]);

  if (!assetsLoaded) {
    return (
      <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center bg-[#050510]">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="mt-6 font-orbitron text-white/60 uppercase tracking-[0.3em] animate-pulse">{t('loadingBattleAssets')}...</p>
      </div>
    );
  }

  const displayEnemy = gameRef.current.enemies.find(e => e.hp > 0) || gameRef.current.enemies[0];

  return (
    <div ref={containerRef} className="fixed inset-0 z-[20000] flex flex-col relative overflow-hidden bg-black">
      <VoidBattleHUD
        hud={hud}
        playerMaxHp={gameRef.current.playerMaxHp}
        playerMaxShield={gameRef.current.playerMaxShield}
        displayEnemy={displayEnemy}
        t={t}
        isGroupBattle={battleIsGroupBattle}
        routeTier={routeTier}
      />

      {onExitBattle && (
        <button
          type="button"
          onClick={onExitBattle}
          className="absolute top-20 right-6 z-[20010] flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-950/70 px-4 py-2 font-orbitron text-[12px] font-black uppercase tracking-widest text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.25)] backdrop-blur-md transition-all hover:border-red-400 hover:bg-red-900/90 hover:text-white"
        >
          <X className="h-4 w-4" />
          {language === 'pt' ? 'Sair da Batalha' : 'Exit Battle'}
        </button>
      )}

      {showBossIntro && bossIntro && displayEnemy && (
        <div className="absolute inset-0 z-[20050] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-3xl border-2 border-red-500/40 bg-black shadow-[0_0_80px_rgba(239,68,68,0.25)] lg:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.75fr)]"
          >
            <div className="relative flex min-h-[260px] items-center justify-center bg-black p-4 lg:min-h-[560px]">
              <video
                src={bossIntro.video}
                autoPlay
                loop
                muted
                playsInline
                className="aspect-video w-full max-w-full rounded-2xl object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/80" />
              <div className="absolute bottom-5 left-5 rounded-xl border border-red-500/30 bg-black/65 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-red-300">
                {language === 'pt' ? `Setor ${locationId} - alvo boss confirmado` : `Sector ${locationId} - boss target confirmed`}
              </div>
            </div>

            <div className="relative flex flex-col justify-between gap-6 border-t border-red-500/20 bg-gradient-to-br from-red-950/30 via-black to-black p-7 lg:border-l lg:border-t-0">
              <div className="space-y-5">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.45em] text-red-400/70">
                    {language === 'pt' ? 'Entidade hostil de classe boss' : 'Boss-class hostile entity'}
                  </p>
                  <h2 className="font-orbitron text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]">
                    {bossIntro.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-red-500/20 bg-white/5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">HP</p>
                    <p className="font-orbitron text-2xl font-black text-red-300">{Math.floor(displayEnemy.maxHp)}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{language === 'pt' ? 'Escudo' : 'Shield'}</p>
                    <p className="font-orbitron text-2xl font-black text-cyan-300">{Math.floor(displayEnemy.maxShield)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-red-400">
                    {language === 'pt' ? 'Poder detectado' : 'Detected power'}
                  </p>
                  <p className="text-base font-bold leading-relaxed text-red-100/90">{bossIntro.power}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBossIntro(false)}
                className="w-full rounded-2xl bg-red-600 px-6 py-4 font-orbitron text-sm font-black uppercase tracking-[0.35em] text-white shadow-[0_0_30px_rgba(220,38,38,0.35)] transition-all hover:bg-red-500 active:scale-[0.98]"
              >
                {language === 'pt' ? 'Iniciar confronto' : 'Start encounter'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="flex-1 w-full h-full bg-transparent touch-none z-10"
      />

      {/* Meteor Shower Warning Overlay */}
      {hud.meteorEventActive && (Date.now() - hud.meteorEventStartTime > 0) && (Date.now() - hud.meteorEventStartTime < 5000) && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-4 pointer-events-none w-full px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-8 py-4 bg-red-600/20 border-2 border-red-500 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.5)]"
          >
            <h2 className="text-xl md:text-3xl font-orbitron font-black text-white text-center tracking-[0.3em] uppercase animate-pulse">
              {language === 'pt' ? 'CUIDADO: CHUVA DE METEORITOS À FRENTE!' : 'WARNING: METEOR SHOWER AHEAD!'}
            </h2>
          </motion.div>
        </div>
      )}

      {playerShipStats.rarity === 'mythic' && (
        <div className="absolute bottom-6 left-6 z-30 flex gap-6 items-end pointer-events-none">
          {/* MEGA LASER */}
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${hud.specialActive ? 'border-pink-500 bg-pink-500/20 shadow-[0_0_25px_rgba(236,72,153,0.6)] scale-110' : 'border-white/20 bg-black/40'}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.9]">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                    <circle
                      cx="32" cy="32" r="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-pink-500 transition-all duration-300"
                      strokeDasharray={188.5}
                      strokeDashoffset={188.5 * ((hud.specialCooldown || 0) / 50)}
                    />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-white font-orbitron text-xl font-bold drop-shadow-md">C</span>
                  {hud.specialCooldown > 0 && !hud.specialActive && (
                    <span className="text-[10px] text-pink-400 font-orbitron">{Math.ceil(hud.specialCooldown)}s</span>
                  )}
                </div>
            </div>
            <p className="text-[10px] font-orbitron text-white/50 uppercase tracking-[0.2em] font-bold drop-shadow-md">MEGA LASER</p>
          </div>

          {/* HELLFIRE BARRAGE */}
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${hud.burstCooldown > 0 ? 'border-white/20 bg-black/40' : 'border-orange-500 bg-orange-500/20 shadow-[0_0_25px_rgba(249,115,22,0.6)] scale-110'}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.9]">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                    <circle
                      cx="32" cy="32" r="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-orange-500 transition-all duration-300"
                      strokeDasharray={188.5}
                      strokeDashoffset={188.5 * ((hud.burstCooldown || 0) / 35)}
                    />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-white font-orbitron text-xl font-bold drop-shadow-md">F</span>
                  {hud.burstCooldown > 0 && (
                    <span className="text-[10px] text-orange-400 font-orbitron">{Math.ceil(hud.burstCooldown)}s</span>
                  )}
                </div>
            </div>
            <p className="text-[10px] font-orbitron text-white/50 uppercase tracking-[0.2em] font-bold drop-shadow-md">HB BARRAGE</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8 items-center pointer-events-none z-20">
        <div className="flex flex-col items-center gap-2 opacity-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
           <div className="px-4 py-2 rounded-xl border-2 border-white/40 flex items-center justify-center font-orbitron font-black text-white bg-black/80 shadow-[0_0_15px_rgba(255,255,255,0.2)] text-sm tracking-widest">W A S D</div>
           <span className="text-[10px] font-orbitron font-bold tracking-[0.2em] text-white uppercase bg-black/40 px-2 py-0.5 rounded-full">{language === 'pt' ? 'Movimentar' : 'Movement'}</span>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-100 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
           <div className="w-12 h-12 rounded-xl border-2 border-cyan-500/60 flex items-center justify-center bg-black/80 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
             <MousePointer2 className="w-6 h-6 text-cyan-400" />
           </div>
           <span className="text-[10px] font-orbitron font-bold tracking-[0.2em] text-cyan-400 uppercase bg-black/40 px-2 py-0.5 rounded-full">{language === 'pt' ? 'Mirar e Atirar' : 'Aim and Shoot'}</span>
        </div>
      </div>
    </div>
  );
});

export default VoidBattleArena;
