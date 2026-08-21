'use client';

import React, { useRef, useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Shield, Target, MousePointer2, X } from 'lucide-react';
import BattlePauseDialog from './BattlePauseDialog';
import type { BattleSpriteSheet } from '@/lib/battle-sprites';
import { PASSIVE_SHOT_DAMAGE_TIERS, rollPassiveShotDamageForRoute } from '@/lib/passive-shot-damage.mjs';
import {
  buildSolarInterstellarEnemyVolley,
  getSolarInterstellarEnemyFireConfig,
  SOLAR_INTERSTELLAR_FIRE_PERFORMANCE,
} from '@/lib/solar-interstellar-enemy-fire.mjs';

export type PassiveShotDamageTier = 'common' | 'brutal' | 'insane' | 'divine';

type SolarInterstellarEnemyShot = {
  angleOffset: number;
  speed: number;
  color: string;
  size: number;
  special: boolean;
};

export interface VoidBattleProjectile {
  id: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  owner: 'player' | 'enemy';
  damage: number;
  isCrit?: boolean;
  passiveDamageTier?: PassiveShotDamageTier;
  passiveDamageMultiplier?: number;
  vx: number;
  vy: number;
  type?: 'normal' | 'burst' | 'beam';
  speed?: number;
  size?: number;
  isSkyring?: boolean;
  projectileColor?: string;
  isSpecialEnemyShot?: boolean;
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
  spriteSheet?: BattleSpriteSheet;
  assetBaseName?: string;
  enemyColor?: string;
  isExploding?: boolean;
  originalId?: string; // For asset lookup when id is unique per instance
  lastShot?: number;
  lastSpecialShot?: number;
  spriteSuffix?: string;
  previousSpriteSuffix?: string;
  spriteTransitionStartedAt?: number;
  shootSpriteUntil?: number;
  assetLocationId?: number;
  visualScale?: number;
  spawnX?: number;
  movementPhase?: number;
  trackingOffsetY?: number;
  spawnDelayMs?: number;
  spawnWithNext?: boolean;
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
  passiveDamageTier?: PassiveShotDamageTier;
  sizeMultiplier?: number;
  durationMultiplier?: number;
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
  enemyQueueNextSpawnAt?: number;
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
  hellfireQueue: any[];
  hellfireNextLaunchAt: number;
  hellfireHitStopUntil?: number;
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
const BATTLE_SPRITE_BASE_WIDTH = 110;
const VOID_ENEMY_RENDER_WIDTH: Record<VoidBattleEnemy['type'], number> = {
  'Padrão': BATTLE_SPRITE_BASE_WIDTH,
  Elite: 136,
  Boss: 262,
};
const BOSS_SHOOT_SPRITE_MS = 320;
const HELLFIRE_IMPACT_DAMAGE_MULTIPLIER = 6;
const HELLFIRE_BURN_TICK_DAMAGE_MULTIPLIER = 0.35;
const HELLFIRE_SHOT_COUNT = 7;
const HELLFIRE_FINISHER_INDEX = HELLFIRE_SHOT_COUNT - 1;
const HELLFIRE_LAUNCH_INTERVAL = 150;
const HELLFIRE_CHARGE_MS = 280;
const HELLFIRE_FINISHER_SIZE_MULT = 1.9;
const HELLFIRE_FINISHER_DMG_MULT = 2.2;
const HELLFIRE_FINISHER_SHAKE = 18;
const HELLFIRE_NORMAL_SHAKE = 6;
const HELLFIRE_HITSTOP_MS = 90;
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
           {String(hud.enemyName || hud.enemyType || '').toUpperCase()}
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
  activeShipSpriteSheet?: BattleSpriteSheet;
  onExitBattle?: () => void;
  meteoriteRewardValue?: number;
  disableMeteorEvent?: boolean;
  enableBossIntro?: boolean;
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


const getSpriteFrameIndex = (
  sheet: BattleSpriteSheet,
  now: number,
  state: 'neutral' | 'up' | 'down' | 'forward' | 'backward' = 'neutral',
) => {
  if (sheet.directional) {
    const row = Math.floor(now / 520) % sheet.rows;
    const frameByState = state === 'up' ? 2 : state === 'down' ? 6 : state === 'forward' ? 4 : 0;
    return row * sheet.columns + frameByState;
  }

  const fps = sheet.fps || 12;
  return Math.floor(now / (1000 / fps)) % sheet.frameCount;
};

const drawSpriteSheetFrame = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sheet: BattleSpriteSheet,
  frameIndex: number,
  x: number,
  y: number,
  width: number,
  flipX = false,
) => {
  const frame = Math.max(0, Math.min(sheet.frameCount - 1, frameIndex));
  const sx = (frame % sheet.columns) * sheet.frameWidth;
  const sy = Math.floor(frame / sheet.columns) * sheet.frameHeight;
  const height = sheet.frameHeight * (width / sheet.frameWidth);

  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);
  ctx.drawImage(image, sx, sy, sheet.frameWidth, sheet.frameHeight, -width / 2, -height / 2, width, height);
  ctx.restore();
};
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
  activeShipSpriteSheet,
  onExitBattle,
  meteoriteRewardValue = 0,
  disableMeteorEvent = false,
  enableBossIntro = true
}: VoidBattleArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const isBossEncounter = useMemo(() => (
    initialEnemies.some(enemy => enemy.type === 'Boss')
      || (enemyQueue || []).some(enemy => enemy.type === 'Boss')
  ), [enemyQueue, initialEnemies]);
  const bossIntro = routeTier === 'Void' && enableBossIntro && isBossEncounter ? BOSS_INTROS[locationId] : undefined;
  const [showBossIntro, setShowBossIntro] = useState(Boolean(bossIntro));
  const [meteorEventEnabled] = useState(() => (
    routeTier === 'Void'
      && !disableMeteorEvent
      && !isBossEncounter
      && initialEnemies.length > 0
      && Math.random() < 0.3
  ));
  const battleEnemies = useMemo(() => (
    meteorEventEnabled ? [initialEnemies[0]] : initialEnemies
  ), [initialEnemies, meteorEventEnabled]);
  const battleEnemyQueue = useMemo(() => (
    meteorEventEnabled ? [] : (enemyQueue || [])
  ), [enemyQueue, meteorEventEnabled]);
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
    enemies: battleEnemies.map(e => ({ ...e, spawnX: e.x, movementPhase: Math.random() * Math.PI * 2, isExploding: false })),
    playerX: 10,
    playerY: 50,
    projectiles: [],
    particles: [],
    lastEnemyMove: Date.now(),
    lastEnemyAttack: Date.now(),
    isGroupBattle: battleIsGroupBattle,
    playerImage: routeTier === 'Void'
      ? (playerShipStats.rarity === 'mythic' ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player-battle.webp')
      : (activeShipSpriteSheet?.image || activeShipImage || '/images/battle/standard_ship.webp'),
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
    enemyQueueNextSpawnAt: undefined,
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
    hellfireQueue: [],
    hellfireNextLaunchAt: 0,
    hellfireHitStopUntil: 0,
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
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const battleAssetKey = JSON.stringify({
    locationId,
    routeTier,
    activeShipImage: activeShipImage || '',
    activeShipSpriteSheet: activeShipSpriteSheet ? `${activeShipSpriteSheet.image}:${activeShipSpriteSheet.frameWidth}x${activeShipSpriteSheet.frameHeight}` : '',
    playerRarity: playerShipStats.rarity || 'common',
    enemies: [...battleEnemies, ...battleEnemyQueue].map(enemy => ({
      id: enemy.id,
      type: enemy.type,
      image: enemy.image,
      spriteSheet: enemy.spriteSheet ? `${enemy.spriteSheet.image}:${enemy.spriteSheet.frameWidth}x${enemy.spriteSheet.frameHeight}` : '',
      assetBaseName: enemy.assetBaseName || '',
    })),
  });

  // Load Images (Sprites)
  useEffect(() => {
    let cancelled = false;
    setAssetsLoaded(false);

    const loadImage = (id: string, src: string, fallbackSrc?: string): Promise<void> => {
      return new Promise((resolve) => {
        const cacheDecodedImage = (image: HTMLImageElement) => {
          const cacheAndResolve = () => {
            if (!cancelled) assetsRef.current[id] = image;
            resolve();
          };
          void image.decode().catch(() => undefined).then(cacheAndResolve);
        };
        const img = new Image();
        img.onload = () => cacheDecodedImage(img);
        img.onerror = () => {
          console.warn(`[VoidBattleArena] Failed to load asset: ${id} from ${src}`);
          if (fallbackSrc) {
            const fImg = new Image();
            fImg.onload = () => cacheDecodedImage(fImg);
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
      { id: 'player_neutral', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player_battle_neutral.webp') : (activeShipSpriteSheet?.image || activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_up', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_up.webp' : '/images/ships/battle/player_battle_up.webp') : (activeShipSpriteSheet?.image || activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_down', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_down.webp' : '/images/ships/battle/player_battle_down.webp') : (activeShipSpriteSheet?.image || activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_forward', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_forward.webp' : '/images/ships/battle/player_battle_neutral.webp') : (activeShipSpriteSheet?.image || activeShipImage || '/images/battle/standard_ship.webp') },
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
        const enemyLocKey = e.assetLocationId === 0 ? 'zero' : (e.assetLocationId || locKey);
        const assetLocKey = hasDirectionalSprites ? enemyLocKey : 'zero';
        const baseSrc = `/assets/rota3/void/${assetLocKey}/${baseName}`;
        const fallbackBaseSrc = `/assets/rota3/void/zero/${baseName}`;

        if (hasDirectionalSprites) {
          const hasShootSprite = routeTier === 'Void' && e.assetLocationId === 5;
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
        const enemySpriteImage = e.spriteSheet?.image || e.image;
        imagesToLoad.push(
          { id: `${e.id}_neutral`, src: enemySpriteImage },
          { id: `${e.id}_up`, src: enemySpriteImage },
          { id: `${e.id}_down`, src: enemySpriteImage },
          { id: `${e.id}_forward`, src: enemySpriteImage },
          { id: `${e.id}_backward`, src: enemySpriteImage }
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
  }, [activeShipImage, activeShipSpriteSheet, battleAssetKey, battleEnemies, battleEnemyQueue, locationId, playerShipStats.rarity, routeTier]);

  // Load and Prepare Video Background
  useEffect(() => {
    setVideoReady(false);
    const locKey = locationId === 0 ? 'zero' : locationId;
    const videoSource = routeTier === 'Void'
      ? `/assets/rota3/void/${locKey}/background_battle_${locKey}.mp4`
      : routeTier === 'Solar'
        ? '/assets/rota1/battle/background_battle.mp4'
        : undefined;
    if (!videoSource) {
      videoRef.current = null;
      return;
    }
    const video = document.createElement('video');
    video.src = videoSource;
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
    const openingBoss = initialEnemies.find(enemy => enemy.type === 'Boss');
    if (routeTier !== 'Void' || !openingBoss || showBossIntro) return;

    const openingLocation = openingBoss.assetLocationId ?? locationId;
    const locKey = openingLocation === 0 ? 'zero' : openingLocation;
    const screamId = `boss_scream_${locKey}`;
    const timer = window.setTimeout(() => {
      playSfx(screamId, { loop: true });
    }, 500);

    return () => {
      window.clearTimeout(timer);
      stopSfx(screamId);
    };
  }, [locationId, initialEnemies, routeTier, playSfx, showBossIntro, stopSfx]);

  useEffect(() => {
    return () => {
      ['zero', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(locKey => {
        stopSfx(`boss_scream_${locKey}`);
      });
    };
  }, [stopSfx]);
  useEffect(() => {
    const engineSfx = 'player_airship_effect_sound';

    if (routeTier !== 'Void' || !assetsLoaded || showBossIntro || isPaused) {
      stopSfx(engineSfx);
      return;
    }

    playSfx(engineSfx, {
      loop: true,
      volume: 0.45,
      category: 'player',
      exclusiveKey: 'void-player-airship-engine'
    });

    return () => stopSfx(engineSfx);
  }, [assetsLoaded, isPaused, playSfx, routeTier, showBossIntro, stopSfx]);

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
      if (playerShipStats.rarity !== 'mythic') return;
      if (s.fireballs.length > 0 || s.hellfireQueue.length > 0) return;
      if (s.laserState !== 'idle') return; // Bloqueia se o laser estiver ativo
      if (voidResourcesRef.current.tech < 500) { addLog(t('notEnoughEnergy'), 'error'); return; }
      onUpdateResources({ ...voidResourcesRef.current, tech: voidResourcesRef.current.tech - 500 });
      s.abilities.burst.lastUsed = now;

      const dirs = ['up', 'forward', 'down'];
      s.fireballs = [];
      s.hellfireQueue = Array.from({ length: HELLFIRE_SHOT_COUNT }, (_, index) => ({
        id: `hb-${now}-${index}`,
        dir: dirs[index % dirs.length],
        arcSeed: Math.random(),
        size: 22 + Math.random() * 12,
        isFinisher: index === HELLFIRE_FINISHER_INDEX,
      }));
      s.hellfireNextLaunchAt = now + HELLFIRE_CHARGE_MS;
      s.flashAlpha = Math.max(s.flashAlpha, 0.4);
      s.flashColor = '255, 170, 80';
      s.cameraPunch.targetX += (Math.random() - 0.5) * 8;
      s.cameraPunch.targetY += (Math.random() - 0.5) * 8;
      window.setTimeout(() => {
        const current = gameRef.current;
        current.cameraPunch.targetX *= 0.2;
        current.cameraPunch.targetY *= 0.2;
      }, HELLFIRE_CHARGE_MS);

      s.playerShotDuckedUntil = now + 8500;
      playSfx('big_energy_explosion_2', { volume: 1.0, category: 'player' });
    } else if (type === 'special') {
      if (playerShipStats.rarity !== 'mythic') return;
      if (s.fireballs.length > 0 || s.hellfireQueue.length > 0) return; // Bloqueia se HB estiver em curso
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
  }, [onUpdateResources, addLog, t, playSfx, routeTier, playerShipStats.rarity]);

  const triggerAttack = useCallback((targetX: number, targetY: number) => {
    if (isPausedRef.current) return;
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
    const passiveDamage = rollPassiveShotDamageForRoute(
      isCrit ? criticalDamage : playerShipStats.damage,
      routeTier
    );
    s.projectiles.push({
      id: `pp-${now}`,
      x: s.playerX + 5,
      y: s.playerY,
      owner: 'player',
      damage: passiveDamage.damage,
      vx,
      vy,
      isCrit,
      passiveDamageTier: passiveDamage.tier as PassiveShotDamageTier,
      passiveDamageMultiplier: passiveDamage.multiplier,
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
  }, [playSfx, playerShipStats, activeShipImage, routeTier]);

  useEffect(() => {
    if (!assetsLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let isMouseFiring = false;
    const mouseAim = { x: canvas.width, y: canvas.height / 2 };

    const updateMouseAim = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseAim.x = (e.clientX - rect.left) * scaleX;
      mouseAim.y = (e.clientY - rect.top) * scaleY;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPaused(prev => {
          const next = !prev;
          isPausedRef.current = next;
          if (next) gameRef.current.keysPressed.clear();
          return next;
        });
        return;
      }
      if (isPausedRef.current) return;
      const key = e.code === 'Space' ? 'space' : e.key.toLowerCase();
      if (key === 'space') e.preventDefault();
      gameRef.current.keysPressed.add(key);
      if (e.key.toLowerCase() === 'r') triggerAbility('shield');
      if (e.key.toLowerCase() === 'f') triggerAbility('burst');
      if (e.key.toLowerCase() === 'c') triggerAbility('special');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.code === 'Space' ? 'space' : e.key.toLowerCase();
      if (key === 'space') e.preventDefault();
      gameRef.current.keysPressed.delete(key);
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || isPausedRef.current) return;
      updateMouseAim(e);
      isMouseFiring = true;
      triggerAttack(mouseAim.x, mouseAim.y);
    };
    const handleMouseMove = (e: MouseEvent) => updateMouseAim(e);
    const stopMouseFiring = () => { isMouseFiring = false; };
    const resetHeldControls = () => {
      isMouseFiring = false;
      gameRef.current.keysPressed.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mouseup', stopMouseFiring);
    window.addEventListener('blur', resetHeldControls);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);

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

    const createExplosionEffect = (x: number, y: number, color: string, isBoss = false) => {
      const s = gameRef.current;
      const now = Date.now();
      const isVoidExplosion = routeTier === 'Void';
      const intensity = isVoidExplosion ? (isBoss ? 1.35 : 1.25) : 1;
      const biasAngle = Math.random() * Math.PI * 2;

      // Screen punctuation uses solid overlays only; no blur/filter is applied.
      s.flashAlpha = Math.max(s.flashAlpha, isBoss ? 0.95 : (isVoidExplosion ? 0.62 : 0.45));
      s.flashColor = isBoss ? '255, 225, 170' : (isVoidExplosion ? '216, 180, 254' : '255, 255, 255');
      s.impactFlash = Math.max(s.impactFlash, isBoss ? 1.25 : (isVoidExplosion ? 0.62 : 0.3));
      s.cinematicDarkness = Math.max(s.cinematicDarkness, isBoss ? 0.82 : (isVoidExplosion ? 0.34 : 0.15));
      triggerShake(isBoss ? 88 : (isVoidExplosion ? 58 : 36));
      s.cameraPunch.targetX += (Math.random() - 0.5) * (isBoss ? 34 : 18);
      s.cameraPunch.targetY += (Math.random() - 0.5) * (isBoss ? 28 : 14);

      const pushShockwave = (
        radius: number,
        alpha: number,
        thickness: number,
        speed: number,
        waveColor: string,
        offsetX = 0,
        offsetY = 0,
      ) => {
        s.shockwaves.push({
          x: x + offsetX,
          y: y + offsetY,
          radius,
          alpha,
          thickness,
          speed,
          color: waveColor,
        });
      };

      pushShockwave(isBoss ? 5 : 8, isBoss ? 0.95 : 0.74, isBoss ? 34 : 24, isBoss ? 36 : 29, isBoss ? '255, 235, 200' : '34, 211, 238');
      pushShockwave(isBoss ? 12 : 15, isBoss ? 0.78 : 0.52, isBoss ? 16 : 10, isBoss ? 24 : 18, isBoss ? '239, 68, 68' : '192, 132, 252');
      if (isBoss) {
        pushShockwave(2, 0.72, 7, 48, '255, 150, 55');
      }

      const coreCount = Math.round((isBoss ? 8 : 4) * intensity);
      for (let i = 0; i < coreCount; i++) {
        s.particles.push({
          id: `heat-${now}-${i}-${Math.random()}`,
          x: x + (Math.random() - 0.5) * (isBoss ? 4 : 2),
          y: y + (Math.random() - 0.5) * (isBoss ? 5 : 2),
          vx: 0,
          vy: 0,
          life: isBoss ? 1.4 : 1,
          maxLife: isBoss ? 1.4 : 1,
          size: (isBoss ? 34 : 24) + Math.random() * 12,
          growth: isBoss ? 7 : 4,
          color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#fb923c' : '#c084fc',
          type: 'heat',
          blend: 'screen',
        });
      }

      s.particles.push({
        id: `bloom-${now}-${Math.random()}`,
        x,
        y,
        vx: 0,
        vy: 0,
        life: isBoss ? 1.15 : 0.85,
        maxLife: isBoss ? 1.15 : 0.85,
        size: isBoss ? 145 : (isVoidExplosion ? 96 : 80),
        growth: isBoss ? 20 : 13,
        color: '#fff',
        type: 'bloom',
        blend: 'lighter',
      });

      const spawnSparks = (count: number, maxSpeed: number, isCore: boolean, originX = x, originY = y) => {
        for (let i = 0; i < Math.round(count * intensity); i++) {
          const useBias = Math.random() > 0.42;
          const angle = useBias ? biasAngle + (Math.random() - 0.5) * 1.65 : Math.random() * Math.PI * 2;
          const speed = (isCore ? 6 : 2) + Math.random() * maxSpeed;
          const largeFragment = Math.random() > 0.82;
          s.particles.push({
            id: `spark-${Date.now()}-${i}-${isCore}-${Math.random()}`,
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: (largeFragment ? 1.15 : 0.55) + Math.random() * (isBoss ? 1.25 : 0.8),
            maxLife: (largeFragment ? 1.15 : 0.55) + Math.random() * (isBoss ? 1.25 : 0.8),
            size: largeFragment ? (isBoss ? 6 : 4) : 2,
            color: Math.random() > 0.22 ? (isCore ? '#fff' : color) : '#fb923c',
            type: 'spark',
            blend: 'lighter',
            hasTrail: speed > 6,
            friction: largeFragment ? 0.965 : 0.94,
            gravity: largeFragment ? 0.025 : 0,
          });
        }
      };

      spawnSparks(isBoss ? 72 : 46, isBoss ? 58 : 44, true);
      window.setTimeout(() => spawnSparks(isBoss ? 84 : 54, isBoss ? 44 : 34, false), isBoss ? 45 : 25);

      window.setTimeout(() => {
        const emberCount = Math.round((isBoss ? 46 : 24) * intensity);
        for (let i = 0; i < emberCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3 + Math.random() * (isBoss ? 19 : 13);
          s.particles.push({
            id: `ember-${Date.now()}-${i}-${Math.random()}`,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: (isBoss ? 3.5 : 2.5) + Math.random() * 1.8,
            maxLife: (isBoss ? 3.5 : 2.5) + Math.random() * 1.8,
            size: isBoss && i % 5 === 0 ? 2.4 : 1.2,
            color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#f97316' : '#22d3ee',
            type: 'ember',
            blend: 'lighter',
            gravity: 0.015,
            friction: 0.965,
            hasTrail: true,
          });
        }
      }, 55);

      window.setTimeout(() => {
        const smokeCount = Math.round((isBoss ? 32 : 18) * intensity);
        for (let i = 0; i < smokeCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3 + Math.random() * (isBoss ? 17 : 12);
          s.particles.push({
            id: `smoke-${Date.now()}-${i}-${Math.random()}`,
            x: x + (Math.random() - 0.5) * (isBoss ? 7 : 3),
            y: y + (Math.random() - 0.5) * (isBoss ? 8 : 3),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: (isBoss ? 2.1 : 1.35) + Math.random() * 1.2,
            maxLife: (isBoss ? 2.1 : 1.35) + Math.random() * 1.2,
            size: (isBoss ? 9 : 6) + Math.random() * (isBoss ? 15 : 9),
            color: isBoss ? 'rgba(70, 35, 45, 0.48)' : 'rgba(95, 60, 130, 0.34)',
            type: 'smoke',
            growth: isBoss ? 0.55 : 0.34,
            friction: 0.95,
            gravity: -0.025,
          });
        }
      }, 90);

      const secondaryBursts = isBoss ? 5 : (isVoidExplosion ? 2 : 1);
      for (let burst = 0; burst < secondaryBursts; burst++) {
        window.setTimeout(() => {
          const distance = isBoss ? 3 + Math.random() * 8 : 2 + Math.random() * 4;
          const angle = biasAngle + burst * 2.17 + Math.random() * 0.8;
          const burstX = x + Math.cos(angle) * distance;
          const burstY = y + Math.sin(angle) * distance;
          pushShockwave(2, isBoss ? 0.68 : 0.42, isBoss ? 9 : 5, isBoss ? 15 : 8, burst % 2 === 0 ? '255, 125, 45' : '192, 132, 252', burstX - x, burstY - y);
          spawnSparks(isBoss ? 24 : 14, isBoss ? 22 : 9, false, burstX, burstY);
          s.flashAlpha = Math.max(s.flashAlpha, isBoss ? 0.34 : 0.18);
          if (isBoss) triggerShake(24 - burst * 2);
        }, 130 + burst * (isBoss ? 115 : 90));
      }

      window.setTimeout(() => {
        s.cameraPunch.targetX *= 0.18;
        s.cameraPunch.targetY *= 0.18;
      }, isBoss ? 850 : 360);
    };

    const triggerEnemyDestruction = (enemy: VoidBattleEnemy) => {
      if (enemy.hp > 0 || enemy.isExploding) return;
      enemy.isExploding = true;
      const isBoss = enemy.type === 'Boss';
      createExplosionEffect(enemy.x, enemy.y, isBoss ? '#f97316' : '#ef4444', isBoss);

      const enemyLocation = enemy.assetLocationId ?? locationId;
      const locKey = enemyLocation === 0 ? 'zero' : enemyLocation;
      if (routeTier === 'Void') {
        if (isBoss) {
          stopSfx(`boss_scream_${locKey}`);
          playSfx(`boss_explosion_${locKey}`);
        } else {
          playSfx('alien_explosion_zero');
        }
      } else {
        playSfx('enemy_explosion');
      }
    };
    const createDamageNumber = (
      x: number,
      y: number,
      value: number,
      isCrit: boolean,
      owner: 'player' | 'enemy',
      passiveDamageTier: PassiveShotDamageTier = 'common'
    ) => {
      const s = gameRef.current;
      const playerDamageColor = passiveDamageTier === 'brutal'
        ? '#ff1744'
        : passiveDamageTier === 'insane'
          ? '#00b7ff'
          : '#ffffff';
      const numberPresentation = PASSIVE_SHOT_DAMAGE_TIERS[passiveDamageTier];
      s.damageNumbers.push({
        id: `dn-${Date.now()}-${Math.random()}`,
        x, y,
        value: Math.floor(value),
        life: 1.0,
        isCrit,
        color: owner === 'player' ? playerDamageColor : '#ef4444',
        owner,
        passiveDamageTier: owner === 'player' ? passiveDamageTier : undefined,
        sizeMultiplier: owner === 'player' ? numberPresentation.numberSizeMultiplier : 1,
        durationMultiplier: owner === 'player' ? numberPresentation.numberDurationMultiplier : 1,
      });
    };

    const pickFireColorHB = (r: number): string => {
      if (r < 0.2) return 'rgba(255,255,200,1)';
      if (r < 0.5) return 'rgba(255,180,20,1)';
      if (r < 0.8) return 'rgba(255,80,0,1)';
      return 'rgba(200,30,0,1)';
    };

    const applyPlayerDamageToEnemy = (enemy: VoidBattleEnemy, baseDamage: number, isCrit = false) => {
      const passiveDamage = rollPassiveShotDamageForRoute(baseDamage, routeTier);
      const damage = passiveDamage.damage;
      let remainingDamage = damage;
      if (enemy.shield > 0) {
        const shieldDamage = Math.min(enemy.shield, remainingDamage);
        enemy.shield -= shieldDamage;
        remainingDamage -= shieldDamage;
      }
      if (remainingDamage > 0) {
        enemy.hp = Math.max(0, enemy.hp - remainingDamage);
      }
      createDamageNumber(enemy.x, enemy.y - 10, damage, isCrit, 'player', passiveDamage.tier as PassiveShotDamageTier);
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

    const spawnHBImpact = (x: number, y: number, isFinisher: boolean = false, dmgMult: number = 1) => {
      const s = gameRef.current;
      const now = Date.now();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cWidth = canvas.width;
      const cHeight = canvas.height;
      const impactScale = cWidth / 800;
      const impactXPercent = (x / cWidth) * 100;
      const impactYPercent = (y / cHeight) * 100;

      s.shake = { x: isFinisher ? 32 : 20, y: isFinisher ? 32 : 20, decay: isFinisher ? 0.74 : 0.80 };
      s.impactFlash = isFinisher ? 1.35 : 1;
      s.cinematicDarkness = isFinisher ? 0.86 : 0.7;
      s.flashAlpha = Math.max(s.flashAlpha, isFinisher ? 0.85 : 0.32);
      s.flashColor = isFinisher ? '255, 230, 180' : '255, 160, 70';

      const shake = isFinisher ? HELLFIRE_FINISHER_SHAKE : HELLFIRE_NORMAL_SHAKE;
      s.cameraPunch.targetX += (Math.random() - 0.5) * shake;
      s.cameraPunch.targetY += (Math.random() - 0.5) * shake;
      window.setTimeout(() => {
        const current = gameRef.current;
        current.cameraPunch.targetX *= 0.25;
        current.cameraPunch.targetY *= 0.25;
      }, isFinisher ? 120 : 70);

      for (let i = 0; i < (isFinisher ? 230 : 160); i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (2 + Math.random() * 10) * (isFinisher ? 1.25 : 1);
        const smoke = i > (isFinisher ? 150 : 110);
        const col = pickFireColorHB(Math.random());
        s.particles.push({
          id: `hb-imp-${now}-${i}-${Math.random()}`,
          x: impactXPercent,
          y: impactYPercent,
          vx: (Math.cos(angle) * spd / cWidth) * 100,
          vy: (Math.sin(angle) * spd / cHeight) * 100,
          life: smoke ? 0.8 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5,
          maxLife: 1,
          size: smoke ? 3 + Math.random() * 6 : Math.random() < 0.15 ? 3 + Math.random() * 6 : 1 + Math.random() * 2.5,
          color: smoke ? `rgba(255,120,30,0.5)` : col,
          type: smoke ? 'smoke' : 'spark',
          blend: 'lighter',
          friction: 0.93,
          gravity: smoke ? -0.005 : 0.002,
        });
      }

      s.burnZones.push({
        x,
        y,
        life: 1,
        startTime: now,
        duration: isFinisher ? 4800 : 3500,
        radius: (isFinisher ? 95 + Math.random() * 30 : 60 + Math.random() * 25) * impactScale,
        finisher: isFinisher,
      });

      s.shockwaves.push({
        x: impactXPercent,
        y: impactYPercent,
        radius: isFinisher ? 7 : 4,
        alpha: isFinisher ? 0.82 : 0.58,
        thickness: isFinisher ? 13 : 7,
        speed: isFinisher ? 18 : 12,
        color: isFinisher ? '255, 190, 90' : '255, 140, 40',
      });
      s.shockwaves.push({
        x: impactXPercent,
        y: impactYPercent,
        radius: isFinisher ? 3 : 2,
        alpha: isFinisher ? 0.62 : 0.36,
        thickness: isFinisher ? 5 : 3,
        speed: isFinisher ? 28 : 18,
        color: '255, 245, 220',
      });

      s.scars.push({
        x: impactXPercent,
        y: impactYPercent,
        life: isFinisher ? 1.35 : 1,
        size: (isFinisher ? 34 : 20) * impactScale,
        rotation: Math.random() * Math.PI * 2,
      });

      const emberCount = isFinisher ? 34 : 14;
      for (let i = 0; i < emberCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (0.3 + Math.random() * 0.9) * (isFinisher ? 1.4 : 1);
        s.trailParts.push({
          x: impactXPercent,
          y: impactYPercent,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.15,
          life: 0.9 + Math.random() * 0.8,
          decay: 0.02 + Math.random() * 0.015,
          size: 1.5 + Math.random() * 3,
          color: '#ffcf7a',
          ember: true,
        });
      }

      if (isFinisher) {
        s.hellfireHitStopUntil = now + HELLFIRE_HITSTOP_MS;
      }

      playSfx(isFinisher ? 'big_energy_explosion_2' : 'big_energy_explosion_', {
        volume: isFinisher ? 1.0 : 0.42,
        category: 'player',
      });

      const SPLASH_PX = (isFinisher ? 130 : 90) * impactScale;
      const immDmg = playerShipStatsRef.current.damage * HELLFIRE_IMPACT_DAMAGE_MULTIPLIER * dmgMult;

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
      if (isPausedRef.current) {
        lastTime = Date.now();
        animId = requestAnimationFrame(loop);
        return;
      }

      const s = gameRef.current;
      const now = Date.now();
      let deltaTime = Math.min(2, (now - lastTime) / 16.66);
      lastTime = now;
      if (s.hellfireHitStopUntil && now < s.hellfireHitStopUntil) {
        deltaTime *= 0.15;
      }
      if (showBossIntro) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(loop);
        return;
      }
      if (isMouseFiring || s.keysPressed.has('space')) {
        triggerAttack(mouseAim.x, mouseAim.y);
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
          const interstellarLayer = assetsRef.current.bg_layer_1;
          if (interstellarLayer) {
            const layerOffsetX = Math.sin(now / 10500) * cWidth * 0.025;
            const layerOffsetY = Math.cos(now / 12500) * cHeight * 0.012;
            drawImageCoverScaled(interstellarLayer, 0.86, layerOffsetX, layerOffsetY, 0.86);
          }
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
                  applyPlayerDamageToEnemy(e, playerShipStats.damage * 15, true);
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
                    applyPlayerDamageToEnemy(e, LASER_DAMAGE_PER_TICK, true);
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
                      applyPlayerDamageToEnemy(e, ball.damage, true);
                      createImpactEffect(ex, ey, '#fb923c', 0, 2, 'ship');
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

      if (s.frameCount % 3 === 0) {
        if (!s.playerIsExploding) {
          const pDmgFactor = 1.0 + (1.0 - s.playerHp / s.playerMaxHp) * 1.5;
          const isSkyring = activeShipImage?.includes('skyring');
          // Skyring base smoke is more frequent and detailed
          const skyringSmokeMultiplier = isSkyring && routeTier !== 'Interstellar' ? 2 : 1;
          const smokeCount = (Math.random() < pDmgFactor ? Math.ceil(pDmgFactor) : Math.floor(pDmgFactor)) * skyringSmokeMultiplier;
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
        const isInterstellarSkyring = isSkyring && routeTier === 'Interstellar';
        const shouldEmitSkyringExhaust = !isInterstellarSkyring
          || s.frameCount % SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringExhaustIntervalFrames === 0;



        // Cinematic Overlays
        if (s.impactFlash > 0.01) {
            ctx.save(); ctx.fillStyle = `rgba(255, 140, 20, ${s.impactFlash * 0.22})`; ctx.fillRect(0, 0, cWidth, cHeight); ctx.restore();
            s.impactFlash *= 0.82;
        }
        if (s.cinematicDarkness > 0.01) {
            ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${s.cinematicDarkness * 0.35})`; ctx.fillRect(0, 0, cWidth, cHeight); ctx.restore();
            s.cinematicDarkness *= 0.92;
        }
        if (isSkyring && !s.playerIsExploding && shouldEmitSkyringExhaust) {
          const coreParticleCount = isInterstellarSkyring
            ? SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringCoreParticles
            : 3;
          const plasmaParticleCount = isInterstellarSkyring
            ? SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringPlasmaParticles
            : 5;
          // Layer 1: Core Heat - Very fast white/yellow sparks at the nozzle
          for (let i = 0; i < coreParticleCount; i++) {
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
          for (let i = 0; i < plasmaParticleCount; i++) {
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
          const shouldEmitDissipation = isInterstellarSkyring
            ? s.frameCount % SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringDissipationIntervalFrames === 0
            : now % 2 === 0;
          if (shouldEmitDissipation) {
            const dissipationParticleCount = isInterstellarSkyring ? 1 : 2;
            for (let i = 0; i < dissipationParticleCount; i++) {
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

        const isSolarInterstellarBattle = routeTier === 'Solar' || routeTier === 'Interstellar';
        const enemyProjectilePressure = isSolarInterstellarBattle
          ? s.projectiles.reduce((count, projectile) => count + (projectile.owner === 'enemy' ? 1 : 0), 0)
          : 0;
        const damageSmokeFrameInterval = enemyProjectilePressure > SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.highProjectilePressure ? 4 : 2;
        if (!isSolarInterstellarBattle || s.frameCount % damageSmokeFrameInterval === 0) s.enemies.forEach(e => {
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
          const trailPointLimit = p.owner === 'enemy' && routeTier !== 'Void'
            ? SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.enemyTrailPoints
            : 7;
          if (p.trail.length > trailPointLimit) p.trail.shift();

          // Skyring Neon Smoke Trail
          const skyringProjectileTrailInterval = routeTier === 'Interstellar'
            ? SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringProjectileTrailIntervalFrames
            : 2;
          if (p.isSkyring && s.frameCount % skyringProjectileTrailInterval === 0) {
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
                createDamageNumber(
                  enemy.x,
                  enemy.y - 10,
                  p.damage,
                  p.isCrit || false,
                  'player',
                  p.passiveDamageTier || 'common'
                );
                triggerEnemyDestruction(enemy);
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
              
              // Player ship hit: smoke burst
              for (let i = 0; i < 3; i++) {
                s.particles.push({
                  id: `player-hit-smoke-${now}-${Math.random()}`,
                  x: p.x + (Math.random() * 4 - 2),
                  y: p.y + (Math.random() * 4 - 2),
                  vx: (Math.random() * 2 - 1),
                  vy: (Math.random() * 2 - 1),
                  life: 0.8 + Math.random() * 0.5,
                  size: 8 + Math.random() * 6,
                  color: 'rgba(180, 180, 180, 0.6)',
                  type: 'smoke'
                });
              }
              
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
              const dmg = (isCrit ? 2 : 1) * (p.passiveDamageMultiplier || 1);
              m.hp -= dmg;
              p.x = 200; // Marcar para remoção no próximo loop do projétil
              playSfx('click');
              createImpactEffect(m.x, m.y, '#fff', 0, 1, m.type === 'meteor' ? 'meteor' : 'meteorite');
              createDamageNumber(m.x, m.y - 10, dmg, isCrit, 'player', p.passiveDamageTier || 'common');

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

        const movementEnemyProjectilePressure = routeTier === 'Solar' || routeTier === 'Interstellar'
          ? s.projectiles.reduce((count, projectile) => count + (projectile.owner === 'enemy' ? 1 : 0), 0)
          : 0;
        for (let j = 0; j < s.enemies.length; j++) {
          const enemy = s.enemies[j];
          if (enemy.hp <= 0) continue;

          const oldX = enemy.x;
          const oldY = enemy.y;

          const dy = Math.max(8, Math.min(92, s.playerY + (enemy.trackingOffsetY || 0))) - enemy.y;
          const trackingSpeed = (enemy.type === 'Boss' ? 0.05 : 0.03) * deltaTime;
          enemy.y += dy * trackingSpeed;

          enemy.x = (enemy.spawnX ?? 80) + Math.sin(now / 1200 + (enemy.movementPhase || 0)) * 8;

          // Calculate movement vectors for sprite selection
          enemy.vx = enemy.x - oldX;
          enemy.vy = enemy.y - oldY;

          // Enemy engine smoke trail (non-bosses only)
          const enemyEngineSmokeThreshold = movementEnemyProjectilePressure > SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.highProjectilePressure
            ? 0.82
            : 0.45;
          if (enemy.type !== 'Boss' && Math.random() > enemyEngineSmokeThreshold) {
            s.particles.push({
              id: `enemy-smoke-${now}-${Math.random()}`,
              x: enemy.x + 3,
              y: enemy.y + (Math.random() * 2 - 1),
              vx: 0.5 + Math.random() * 0.5,
              vy: (Math.random() - 0.5) * 0.2,
              life: 0.5 + Math.random() * 0.3,
              size: 5 + Math.random() * 3,
              color: 'rgba(180, 180, 180, 0.4)',
              type: 'smoke'
            });
          }
        }

        // Player engine smoke trail
        if (s.playerHp > 0 && Math.random() > 0.35) {
          s.particles.push({
            id: `player-smoke-${now}-${Math.random()}`,
            x: s.playerX - 3,
            y: s.playerY + (Math.random() * 2 - 1),
            vx: - (0.5 + Math.random() * 0.5),
            vy: (Math.random() - 0.5) * 0.2,
            life: 0.5 + Math.random() * 0.4,
            size: 6 + Math.random() * 4,
            color: 'rgba(200, 200, 200, 0.5)',
            type: 'smoke'
          });
          if (Math.random() > 0.65) {
            s.particles.push({
              id: `player-ember-${now}-${Math.random()}`,
              x: s.playerX - 2.5,
              y: s.playerY + (Math.random() * 1.5 - 0.75),
              vx: - (1.0 + Math.random()),
              vy: (Math.random() - 0.5) * 0.5,
              life: 0.3 + Math.random() * 0.2,
              size: 2 + Math.random() * 2,
              color: 'rgba(255, 150, 50, 0.8)',
              type: 'ember'
            });
          }
        }

        // Enemy Attack — Com IA de mira real e padrões próprios por capítulo
        s.enemies.forEach(enemy => {
          if (enemy.hp <= 0) return;

          if (routeTier === 'Solar' || routeTier === 'Interstellar') {
            const fireConfig = getSolarInterstellarEnemyFireConfig(enemy.type);
            const fireVolley = (special: boolean) => {
              const volley: SolarInterstellarEnemyShot[] = buildSolarInterstellarEnemyVolley({
                enemyType: enemy.type,
                routeTier,
                special,
              });
              const aimAngle = Math.atan2(s.playerY - enemy.y, s.playerX - enemy.x);

              volley.forEach((shot, shotIndex) => {
                const angle = aimAngle + shot.angleOffset;
                s.projectiles.push({
                  id: `ep-${now}-${enemy.id}-${special ? 'special' : 'regular'}-${shotIndex}-${Math.random()}`,
                  x: enemy.x - 5,
                  y: enemy.y,
                  owner: 'enemy',
                  damage: enemy.damage,
                  vx: Math.cos(angle) * shot.speed,
                  vy: Math.sin(angle) * shot.speed,
                  size: shot.size,
                  projectileColor: shot.color,
                  isSpecialEnemyShot: shot.special,
                  trail: [],
                });
              });
              if (now - (s.lastEnemyShot || 0) >= SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.sfxCooldownMs) {
                s.lastEnemyShot = now;
                playSfx('shoot_enemy');
              }
            };

            const specialIntervalMs = 'specialIntervalMs' in fireConfig
              ? fireConfig.specialIntervalMs
              : undefined;
            if (enemy.lastShot === undefined) {
              enemy.lastShot = now + Math.random() * SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.staggerWindowMs;
            }

            let firedSpecialVolley = false;
            if (enemy.type !== 'Padrão' && specialIntervalMs) {
              if (enemy.lastSpecialShot === undefined) {
                enemy.lastSpecialShot = now + Math.random() * SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.staggerWindowMs;
              } else if (now - enemy.lastSpecialShot >= specialIntervalMs) {
                enemy.lastSpecialShot = now;
                fireVolley(true);
                firedSpecialVolley = true;
                enemy.lastShot = now;
              }
            }

            if (!firedSpecialVolley && now - enemy.lastShot >= fireConfig.regularIntervalMs) {
              enemy.lastShot = now;
              fireVolley(false);
            }
            return;
          }

          const enemyShotInterval = 2500;
          if (now - (enemy.lastShot || 0) > enemyShotInterval) {
            enemy.lastShot = now;
            const dx = s.playerX - enemy.x;
            const dy = s.playerY - enemy.y;
            const dist = Math.hypot(dx, dy) || 1;
            const bossLocationId = enemy.assetLocationId ?? locationId;
            const bossConfig = routeTier === 'Void' && enemy.type === 'Boss' ? BOSS_INTROS[bossLocationId] : undefined;
            const projectileDamage = bossConfig ? randomInt(bossConfig.damage) : enemy.damage;
            if (bossConfig?.attack === 'moltenIron' && bossLocationId === 5) {
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

            const locKey = locationId === 0 ? 'zero' : locationId;
            if (enemy.type === 'Boss') playSfx(`shoot_boss_${locKey}`);
            else if (enemy.type === 'Elite') playSfx('shoot_elite_zero');
            else playSfx('shoot_monster_zero');
          }
        });
        if (routeTier === 'Solar' || routeTier === 'Interstellar') {
          let enemyProjectileOverflow = s.projectiles.reduce(
            (count, projectile) => count + (projectile.owner === 'enemy' ? 1 : 0),
            0
          ) - SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.maxActiveEnemyProjectiles;
          if (enemyProjectileOverflow > 0) {
            s.projectiles = s.projectiles.filter(projectile => {
              if (projectile.owner !== 'enemy' || enemyProjectileOverflow <= 0) return true;
              enemyProjectileOverflow -= 1;
              return false;
            });
          }
        }
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
        const activeEnemyProjectiles = routeTier === 'Solar' || routeTier === 'Interstellar'
          ? s.projectiles.reduce((count, projectile) => count + (projectile.owner === 'enemy' ? 1 : 0), 0)
          : 0;
        const MAX_PARTICLES = routeTier === 'Solar' || routeTier === 'Interstellar'
          ? (activeEnemyProjectiles > SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.highProjectilePressure
              ? SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.highPressureParticleBudget
              : SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.particleBudget)
          : 250;
        if (s.particles.length > MAX_PARTICLES) {
          s.particles.splice(0, s.particles.length - MAX_PARTICLES);
        }

        // Damage Numbers Update
        const remainingDN: VoidBattleDamageNumber[] = [];
        for (let i = 0; i < s.damageNumbers.length; i++) {
          const dn = s.damageNumbers[i];
          dn.y -= 0.3 * deltaTime;
          dn.life -= (0.02 / (dn.durationMultiplier || 1)) * deltaTime;
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
          p.vy -= (p.ember ? 0.09 : 0.05) * deltaTime;
          p.life -= p.decay * deltaTime;
          if (p.life <= 0) return false;

          const px2 = (p.x / 100) * cWidth;
          const py2 = (p.y / 100) * cHeight;
          const flicker = p.ember ? (0.7 + Math.sin(now * 0.03 + px2) * 0.3) : 1;
          const a = p.life * (p.smoke ? 0.20 : p.ember ? 0.85 * flicker : 0.65);
          ctx.globalAlpha = Math.max(0, a);

          if (p.smoke) {
            const sg = ctx.createRadialGradient(px2, py2, 0, px2, py2, p.size * p.life * 0.5 * (cWidth / 800));
            sg.addColorStop(0, `rgba(255,120,20,${p.life * 0.5})`);
            sg.addColorStop(1, 'transparent');
            ctx.fillStyle = sg;
          } else if (p.ember) {
            const eg = ctx.createRadialGradient(px2, py2, 0, px2, py2, p.size * p.life * 1.4 * (cWidth / 800));
            eg.addColorStop(0, 'rgba(255,230,150,0.95)');
            eg.addColorStop(0.5, 'rgba(255,120,20,0.6)');
            eg.addColorStop(1, 'transparent');
            ctx.fillStyle = eg;
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

        const bx = bz.x;
        const by = bz.y;
        const flicker = 0.85 + Math.sin(now * 0.018 + bx * 0.005) * 0.15;
        const r = bz.radius * flicker;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `rgba(255,225,120,${bz.life * 0.95})`);
        g.addColorStop(0.28, `rgba(255,210,60,${bz.life * 0.9})`);
        g.addColorStop(0.5, `rgba(255,100,10,${bz.life * 0.75})`);
        g.addColorStop(0.75, `rgba(180,20,0,${bz.life * 0.5})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = bz.life * 0.35;
        ctx.strokeStyle = `rgba(255,180,80,${bz.life * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, r * (1.05 + Math.sin(now * 0.01) * 0.03), 0, Math.PI * 2);
        ctx.stroke();

        if (bz.finisher) {
          const core = ctx.createRadialGradient(bx, by, 0, bx, by, r * 0.35);
          core.addColorStop(0, `rgba(255,255,220,${bz.life * 0.8})`);
          core.addColorStop(1, 'transparent');
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(bx, by, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (Math.random() < (bz.finisher ? 0.5 : 0.25)) {
          s.trailParts.push({
            x: ((bx + (Math.random() - 0.5) * r) / cWidth) * 100,
            y: ((by + (Math.random() - 0.5) * r * 0.4) / cHeight) * 100,
            vx: (Math.random() - 0.5) * 0.1,
            vy: -0.12 - Math.random() * 0.1,
            life: 0.8 + Math.random() * 0.6,
            decay: 0.015,
            size: 1 + Math.random() * 1.5,
            color: '#ffcf7a',
            ember: true,
          });
        }

        if (s.frameCount % 20 === 0) {
          s.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const ex = (en.x / 100) * cWidth;
            const ey = (en.y / 100) * cHeight;
            const d = Math.hypot(ex - bx, ey - by);
            if (d < bz.radius) {
              const dmg = playerShipStatsRef.current.damage * HELLFIRE_BURN_TICK_DAMAGE_MULTIPLIER * deltaTime;
              applyPlayerDamageToEnemy(en, dmg);
            }
          });
        }
        return true;
      });
      // ── HELLFIRE BARRAGE: Fireballs ──
      if (s.fireballs.length === 0 && s.hellfireQueue.length > 0 && now >= s.hellfireNextLaunchAt) {
        const nextHellfire = s.hellfireQueue.shift();
        const dir = nextHellfire.dir || 'forward';
        const isFinisher = !!nextHellfire.isFinisher;
        let ox = (s.playerX / 100) * cWidth + 40;
        let oy = (s.playerY / 100) * cHeight;
        if (dir === 'up') { ox -= 10; oy -= 28; }
        else if (dir === 'forward') { ox += 10; }
        else { ox -= 10; oy += 28; }

        const target = findNearestLivingEnemy(s, ox, oy, cWidth, cHeight);
        const tx = target ? (target.x / 100) * cWidth : cWidth + 200;
        const ty = target ? (target.y / 100) * cHeight : oy + (Math.random() - 0.5) * 200;
        const dist = Math.hypot(tx - ox, ty - oy);
        const travelFrames = Math.max(35, Math.min(65, dist / 12)) * (isFinisher ? 1.15 : 1);
        const speed = 1 / travelFrames;

        s.fireballs.push({
          id: nextHellfire.id,
          ox, oy, tx, ty,
          targetId: target?.id,
          x: ox, y: oy,
          t: 0,
          speed,
          arcBend: (dir === 'up' ? -1 : dir === 'down' ? 1 : 0) * (40 + (nextHellfire.arcSeed || 0) * 50) + (Math.random() - 0.5) * 30,
          size: (nextHellfire.size || 26) * (isFinisher ? HELLFIRE_FINISHER_SIZE_MULT : 1),
          life: 1,
          done: false,
          readyAt: now,
          isFinisher,
          dmgMult: isFinisher ? HELLFIRE_FINISHER_DMG_MULT : 1,
          wobbleSeed: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
        });
        s.hellfireNextLaunchAt = now + HELLFIRE_LAUNCH_INTERVAL;
      }

      if (s.fireballs.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        s.fireballs = s.fireballs.filter(fb => {
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

          fb.t += fb.speed * deltaTime;

          const cx = (fb.ox + fb.tx) / 2;
          const cy = (fb.oy + fb.ty) / 2 + fb.arcBend;
          fb.x = bezier(fb.ox, cx, fb.tx, fb.t);
          fb.y = bezier(fb.oy, cy, fb.ty, fb.t);

          const wobble = Math.sin(fb.t * 14 + fb.wobbleSeed) * (fb.isFinisher ? 5 : 3);
          const drawX = fb.x + wobble;
          const drawY = fb.y;
          fb.rot += 0.25 * deltaTime;

          const hitDistance = target ? Math.hypot((target.x / 100) * cWidth - fb.x, (target.y / 100) * cHeight - fb.y) : Infinity;
          if (fb.t >= 1 || hitDistance < Math.max(34, fb.size * 1.25)) {
            if (target) {
              spawnHBImpact((target.x / 100) * cWidth, (target.y / 100) * cHeight, fb.isFinisher, fb.dmgMult);
            }
            return false;
          }

          const R = fb.size * (cWidth / 800);
          const coreR = R * 0.38;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          const halo = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, R * 1.8);
          halo.addColorStop(0, fb.isFinisher ? 'rgba(255,160,40,0.55)' : 'rgba(255,120,20,0.35)');
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(drawX, drawY, R * 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(fb.rot);
          const corona = ctx.createRadialGradient(0, 0, coreR * 0.3, 0, 0, R);
          corona.addColorStop(0, 'rgba(255,220,140,0.95)');
          corona.addColorStop(0.45, 'rgba(255,110,20,0.9)');
          corona.addColorStop(1, 'rgba(180,20,0,0)');
          ctx.fillStyle = corona;
          ctx.beginPath();
          ctx.arc(0, 0, R, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.fillStyle = fb.isFinisher ? 'rgba(255,255,240,1)' : 'rgba(255,245,220,0.95)';
          ctx.beginPath();
          ctx.arc(drawX, drawY, coreR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          const emitCount = fb.isFinisher ? 3 : 1;
          for (let e = 0; e < emitCount; e++) {
            const roll = Math.random();
            const isSpark = roll < 0.42;
            const isEmber = !isSpark && roll < 0.5;
            s.trailParts.push({
              x: (drawX / cWidth) * 100,
              y: (drawY / cHeight) * 100,
              vx: (Math.random() - 0.5) * (isSpark ? 0.4 : 0.15),
              vy: (Math.random() - 0.5) * (isSpark ? 0.4 : 0.15) - (isEmber ? 0.08 : 0),
              life: isEmber ? 1.2 + Math.random() * 0.6 : (isSpark ? 0.5 + Math.random() * 0.4 : 0.8 + Math.random() * 0.4),
              decay: isEmber ? 0.012 : (isSpark ? 0.045 : 0.022),
              size: isEmber ? 1 + Math.random() * 1.5 : (isSpark ? 1.5 + Math.random() * 2 : 3 + Math.random() * 5),
              color: isSpark ? (Math.random() < 0.5 ? '#fff3c4' : '#ffb84d') : '#ff7a1a',
              smoke: !isSpark && !isEmber,
              ember: isEmber,
            });
          }

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
          const baseWidth = BATTLE_SPRITE_BASE_WIDTH;
          let imgW = isMythic ? baseWidth * 1.15 : baseWidth;

          // Increase size by 20% for Skyring in Routes 1 & 2
          if (isSkyring && routeTier !== 'Void') {
            imgW *= 1.20;
          }
          if (activeShipSpriteSheet && routeTier !== 'Void') {
            const playerState = activePlayerId.replace('player_', '') as 'neutral' | 'up' | 'down' | 'forward' | 'backward';
            imgW *= activeShipSpriteSheet.scale || 1;
            drawSpriteSheetFrame(
              ctx,
              pImg,
              activeShipSpriteSheet,
              getSpriteFrameIndex(activeShipSpriteSheet, now, playerState),
              (s.playerX / 100) * cWidth,
              (s.playerY / 100) * cHeight,
              imgW,
            );
          } else {
            const imgH = pImg.height * (imgW / pImg.width);
            ctx.drawImage(pImg, (s.playerX / 100) * cWidth - imgW/2, (s.playerY / 100) * cHeight - imgH/2, imgW, imgH);
          }
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
              const imgW = VOID_ENEMY_RENDER_WIDTH[enemy.type] * (enemy.visualScale || 1);
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
              const enemySheet = enemy.spriteSheet;
              const imgW = 110 * (enemySheet?.scale || 1) * (enemy.visualScale || 1);
              ctx.save();
              ctx.translate(x, y);
              if (enemySheet) {
                const enemyState = spriteSuffix.replace('_', '') as 'neutral' | 'up' | 'down' | 'forward' | 'backward';
                drawSpriteSheetFrame(
                  ctx,
                  eImg,
                  enemySheet,
                  getSpriteFrameIndex(enemySheet, now, enemyState),
                  0,
                  0,
                  imgW,
                );
              } else {
                const imgH = eImg.height * (imgW / eImg.width);
                ctx.drawImage(eImg, -imgW/2, -imgH/2, imgW, imgH);
              }
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
      const enemyShotBodyBatches = new Map<string, Path2D>();
      const enemyShotHaloBatches = new Map<string, Path2D>();
      const enemyShotCoreBatch = new Path2D();
      let hasEnemyShotCores = false;
      s.projectiles.forEach(p => {
        const isMonsterShot = p.owner === 'enemy' && routeTier === 'Void';
        const isCrit = p.isCrit ?? false;
        const isPlayer = p.owner === 'player';
        const color = isCrit ? '#FFD700' : (isPlayer ? '#22d3ee' : (p.projectileColor || '#ef4444'));
        const px = (p.x / 100) * cWidth;
        const py = (p.y / 100) * cHeight;

        // Trilha de luz escalada (Otimizada)
        const baseRadius = cWidth * 0.004;
        if (p.trail?.length) {
          if (isPlayer || isMonsterShot) {
            p.trail.forEach((pos, ti) => {
              const progress = ti / p.trail!.length;
              ctx.globalAlpha = progress * (isPlayer ? 0.3 : 0.2);
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc((pos.x / 100) * cWidth, (pos.y / 100) * cHeight, baseRadius * progress * (isPlayer ? 1.1 : (p.size || 1)), 0, Math.PI * 2);
              ctx.fill();
            });
          } else if (p.trail.length > 1) {
            const trailStart = p.trail[0];
            const trailEnd = p.trail[p.trail.length - 1];
            ctx.globalAlpha = 0.22;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1.5, baseRadius * (p.size || 1));
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo((trailStart.x / 100) * cWidth, (trailStart.y / 100) * cHeight);
            ctx.lineTo((trailEnd.x / 100) * cWidth, (trailEnd.y / 100) * cHeight);
            ctx.stroke();
          }
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
          const enemyShotRadius = 3.5 * (p.size || 1);
          let bodyBatch = enemyShotBodyBatches.get(color);
          if (!bodyBatch) {
            bodyBatch = new Path2D();
            enemyShotBodyBatches.set(color, bodyBatch);
          }
          bodyBatch.arc(px, py, enemyShotRadius, 0, Math.PI * 2);
          if (p.isSpecialEnemyShot) {
            let haloBatch = enemyShotHaloBatches.get(color);
            if (!haloBatch) {
              haloBatch = new Path2D();
              enemyShotHaloBatches.set(color, haloBatch);
            }
            haloBatch.arc(px, py, enemyShotRadius * 1.75, 0, Math.PI * 2);
            enemyShotCoreBatch.arc(px, py, enemyShotRadius * 0.38, 0, Math.PI * 2);
            hasEnemyShotCores = true;
          }
        }
      });
      ctx.globalAlpha = 0.22;
      enemyShotHaloBatches.forEach((path, batchColor) => {
        ctx.fillStyle = batchColor;
        ctx.fill(path);
      });
      ctx.globalAlpha = 1;
      enemyShotBodyBatches.forEach((path, batchColor) => {
        ctx.fillStyle = batchColor;
        ctx.fill(path);
      });
      if (hasEnemyShotCores) {
        ctx.fillStyle = '#ffffff';
        ctx.fill(enemyShotCoreBatch);
      }

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
        const sizeMultiplier = dn.sizeMultiplier || 1;
        ctx.save();
        ctx.globalAlpha = dn.life;
        if (dn.owner === 'player' && dn.passiveDamageTier === 'divine') {
          const hue = (now / 5 + dn.x * 3) % 360;
          const rgbGradient = ctx.createLinearGradient(x - 28 * sizeMultiplier, y, x + 28 * sizeMultiplier, y);
          rgbGradient.addColorStop(0, `hsl(${hue} 100% 62%)`);
          rgbGradient.addColorStop(0.5, `hsl(${(hue + 120) % 360} 100% 68%)`);
          rgbGradient.addColorStop(1, `hsl(${(hue + 240) % 360} 100% 62%)`);
          ctx.fillStyle = rgbGradient;
          ctx.shadowColor = `hsl(${(hue + 120) % 360} 100% 65%)`;
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = dn.color;
          ctx.shadowColor = dn.color;
          ctx.shadowBlur = 10;
        }
        const baseFontSize = dn.isCrit ? 24 : 16;
        ctx.font = `bold ${baseFontSize * sizeMultiplier}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.fillText(dn.value.toString(), x, y);
        if (dn.isCrit) {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.strokeText(dn.value.toString(), x, y);
        }
        ctx.restore();
      });

      // Ensure special-ability kills receive the same visual destruction sequence.
      s.enemies.forEach(triggerEnemyDestruction);

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
            const queuedEnemy = s.enemyQueue[0];
            const spawnDelayMs = Math.max(0, queuedEnemy?.spawnDelayMs || 0);
            if (!s.enemyQueueNextSpawnAt) {
              s.enemies.forEach(e => {
                s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (e.qc || 0);
                e.qc = 0;
              });
              s.enemyQueueNextSpawnAt = now + spawnDelayMs;
              s.projectiles = [];
              s.cinematicDarkness = Math.max(s.cinematicDarkness, 0.32);
              if (routeTier === 'Void' && queuedEnemy.type === 'Boss') {
                const nextLocation = queuedEnemy.assetLocationId ?? locationId;
                const nextLocKey = nextLocation === 0 ? 'zero' : nextLocation;
                playSfx(`boss_scream_${nextLocKey}`, { loop: true });
              }
            }
            if (now >= s.enemyQueueNextSpawnAt) {
              const nextEnemy = s.enemyQueue.shift();
              if (nextEnemy) {
                const pairedEnemy = nextEnemy.spawnWithNext ? s.enemyQueue.shift() : undefined;
                s.enemies = [nextEnemy, pairedEnemy]
                  .filter((enemy): enemy is VoidBattleEnemy => Boolean(enemy))
                  .map(enemy => ({ ...enemy, spawnX: enemy.x, movementPhase: Math.random() * Math.PI * 2, isExploding: false }));
                s.lastEnemyAttack = now;
                s.flashAlpha = Math.max(s.flashAlpha, nextEnemy.visualScale && nextEnemy.visualScale < 1 ? 0.2 : 0.5);
                s.flashColor = nextEnemy.visualScale && nextEnemy.visualScale < 1 ? '190, 90, 255' : '255, 170, 80';

              }
              s.enemyQueueNextSpawnAt = undefined;
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
                enemiesDefeated: battleEnemies.length + battleEnemyQueue.length,
                totalEnemies: battleEnemies.length + battleEnemyQueue.length,
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
              enemiesDefeated: Math.max(0, battleEnemies.length + battleEnemyQueue.length - (s.enemyQueue?.length || 0) - s.enemies.filter(enemy => enemy.hp > 0).length),
              totalEnemies: battleEnemies.length + battleEnemyQueue.length,
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
      window.removeEventListener('mouseup', stopMouseFiring);
      window.removeEventListener('blur', resetHeldControls);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [assetsLoaded, triggerAttack, onBattleEnd, playSfx, stopSfx, dimensions, routeTier, triggerAbility, playerShipStats, locationId, videoReady, showBossIntro, activeShipImage,
  activeShipSpriteSheet, addLog, initialEnemies, language, meteoriteQcValue, meteorQcValue, battleEnemies.length, battleEnemyQueue.length]);
  const handlePauseReturn = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    gameRef.current.keysPressed.clear();
    if (onExitBattle) {
      onExitBattle();
      return;
    }
    onBattleEnd('lost', {
      reward: 0,
      playerHp: 0,
      playerShield: 0
    });
  }, [onBattleEnd, onExitBattle]);

  // Void battles still use the explicit loading gate because their directional
  // sprite sets vary by location. Chapter 1/2 assets are preloaded globally, so
  // keeping their arena mounted avoids a one-frame loading-screen flash in Electron.
  if (!assetsLoaded && routeTier === 'Void') {
    return (
      <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center bg-[#050510]">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="mt-6 font-orbitron text-white/60 uppercase tracking-[0.3em] animate-pulse">{t('loadingBattleAssets')}...</p>
      </div>
    );
  }

  const displayEnemy = gameRef.current.enemies.find(e => e.hp > 0) || gameRef.current.enemies[0];
  const bossIntroDisplayEnemy = [...gameRef.current.enemies, ...(gameRef.current.enemyQueue || [])]
    .find(enemy => enemy.type === 'Boss' && (enemy.assetLocationId ?? locationId) === locationId && (enemy.visualScale || 1) >= 1)
    || displayEnemy;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[20000] flex flex-col relative overflow-hidden bg-black">
      {!assetsLoaded && routeTier !== 'Void' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${routeTier === 'Solar'
              ? '/assets/rota1/battle/layer_background1.webp'
              : '/assets/rota2/battle/layer_background1.webp'}')`,
          }}
        />
      )}
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

      {isPaused && (
        <BattlePauseDialog
          language={language}
          onContinue={() => {
            isPausedRef.current = false;
            setIsPaused(false);
          }}
          onReturn={handlePauseReturn}
        />
      )}

      {showBossIntro && bossIntro && bossIntroDisplayEnemy && (
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
                    <p className="font-orbitron text-2xl font-black text-red-300">{Math.floor(bossIntroDisplayEnemy.maxHp)}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{language === 'pt' ? 'Escudo' : 'Shield'}</p>
                    <p className="font-orbitron text-2xl font-black text-cyan-300">{Math.floor(bossIntroDisplayEnemy.maxShield)}</p>
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
           <span className="text-[10px] font-orbitron font-bold tracking-[0.2em] text-cyan-400 uppercase bg-black/40 px-2 py-0.5 rounded-full">{language === 'pt' ? 'Segure Mouse ou Espaço' : 'Hold Mouse or Space'}</span>
        </div>
      </div>
    </div>
  );
});

export default VoidBattleArena;
