'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { BattleShipComputedStats, getHorizonXpForNextLevel, MAX_HORIZON_LEVEL } from '@/lib/colony-cards';

type DefenseSpecialId = 'apocalypse-laser' | 'hellfire-barrage' | 'special-slot-3' | 'special-slot-4';
type EnemyKind = 'common-ship' | 'elite-ship' | 'boss-ship' | 'monster-1' | 'monster-2';
type LaserState = 'idle' | 'charge' | 'firing' | 'collapse';
type HellfireSequence = {
  active: boolean;
  remaining: number;
  waitingForImpact: boolean;
};

interface NewEarthDefenseBattleProps {
  language: 'en' | 'pt';
  shipStats: BattleShipComputedStats;
  horizonLevel: number;
  defenseBattleLevel: number;
  horizonXp: number;
  horizonNextXp: number;
  specials: DefenseSpecialId[];
  trinityShotEnabled?: boolean;
  threatTitle: string;
  onVictory: (summary: BattleResultSummary) => void;
  onDefeat: () => void;
  onClose: () => void;
}

export interface BattleResultSummary {
  kills: number;
  xp: number;
  qc: number;
  levelUpSfxHandled?: boolean;
}

type EnemyStatus = {
  slowUntil?: number;
  shockedUntil?: number;
  burningUntil?: number;
  lastBurnTick?: number;
};

type Enemy = {
  id: number;
  kind: EnemyKind;
  level: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  width: number;
  height: number;
  damage: number;
  status: EnemyStatus;
  attackCooldown: number;
  image: string;
  frames?: string[];
  shootSound: string;
  screamSound?: string;
  screamAudio?: HTMLAudioElement | null;
  explosionSound?: string;
  frameOffset: number;
  xp: number;
  qc: number;
};

type Projectile = {
  id: number;
  from: 'player' | 'enemy';
  targetId?: number;
  special?: 'hellfire';
  sequence?: 'hellfire';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  crit: boolean;
  elemental: { ice: number; electric: number; fire: number };
  color: string;
  trinityShot?: boolean;
  size?: number;
  seed?: number;
  born?: number;
  phase?: number;
};

type FloatText = {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
};

type LaserParticle = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  life: number;
  speed: number;
  color: string;
};

type LaserEmber = {
  type?: 'ember' | 'smoke' | 'fire' | 'debris' | 'iceShard' | 'mist' | 'electric' | 'bolt';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife?: number;
  size: number;
  color: string;
  growth?: number;
  drag?: number;
  rotation?: number;
  spin?: number;
  endX?: number;
  endY?: number;
};

type Shockwave = {
  x: number;
  y: number;
  life: number;
  maxRadius: number;
  color: string;
  radius?: number;
  decay?: number;
  width?: number;
};

type EnemyBlueprint = {
  kind: EnemyKind;
  image: string;
  frames?: string[];
  shootSound: string;
  screamSound?: string;
  explosionSound?: string;
  hp: number;
  damage: number;
  speed: number;
  radius: number;
  width: number;
  height: number;
  xp: number;
  qc: number;
};

const WIDTH = 960;
const HEIGHT = 540;
const ASSET_BASE = '/assets/rota4/battles';

const BATTLE_BACKGROUNDS = [
  `${ASSET_BASE}/backgrounds/day/rt4_background_day.webp`,
  `${ASSET_BASE}/backgrounds/night/rt4_background_night.webp`,
  `${ASSET_BASE}/backgrounds/winter/rt4_background_winter.webp`,
];

const PLAYER_IMAGE = `${ASSET_BASE}/player/horizon/horizon.webp`;
const PLAYER_SOUNDS = {
  normal: `${ASSET_BASE}/player/horizon/shoot_rt4.ogg`,
  electric: `${ASSET_BASE}/player/horizon/eletric_shoot.ogg`,
  fire: `${ASSET_BASE}/player/horizon/fire_shoot.ogg`,
  ice: `${ASSET_BASE}/player/horizon/ice_shoot.ogg`,
  trinity: `${ASSET_BASE}/player/horizon/trina_shot.ogg`,
  apocalypseLaser: `${ASSET_BASE}/player/horizon/apocalipse_shot_rt4.ogg`,
  apocalypseLaserImpact: `${ASSET_BASE}/player/horizon/apocalipse_laser_impact.ogg`,
  apocalypseLaserLastExplosion: `${ASSET_BASE}/player/horizon/apocalipse_laser_last_explosion.ogg`,
  hellfireShoot: `${ASSET_BASE}/player/horizon/hellfire_barrage_shoot.ogg`,
  hellfireImpact: `${ASSET_BASE}/player/horizon/hellfire_barrage_impact.ogg`,
  horizonLevelUp: `${ASSET_BASE}/player/horizon/horizon_level_up.ogg`,
};

const COMMON_SHIP_IMAGES = [
  `${ASSET_BASE}/enemys/air_ships/enemy_rt4.webp`,
  `${ASSET_BASE}/enemys/air_ships/enemy_rt4_2.webp`,
  `${ASSET_BASE}/enemys/air_ships/enemy_rt4_3.webp`,
  `${ASSET_BASE}/enemys/air_ships/enemy_rt4_4.webp`,
];

const MONSTER_1_FRAMES = [
  `${ASSET_BASE}/enemys/monsters/monster 1/m1_neutral.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 1/m1_forward.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 1/m1_up.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 1/m1_down.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 1/m1_backward.webp`,
];

const MONSTER_2_FRAMES = [
  `${ASSET_BASE}/enemys/monsters/monster 2/m3_neutral.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m2_forward.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m4_up.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m2_down.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m2_backward.webp`,
];

const SPECIAL_LABEL: Record<DefenseSpecialId, Record<'en' | 'pt', string>> = {
  'apocalypse-laser': { en: 'Apocalypse Laser', pt: 'Apocalipse Laser' },
  'hellfire-barrage': { en: 'Hellfire Barrage', pt: 'Hellfire Barrage' },
  'special-slot-3': { en: 'Special 3', pt: 'Especial 3' },
  'special-slot-4': { en: 'Special 4', pt: 'Especial 4' },
};

const imageCache = new Map<string, HTMLImageElement>();
const audioCache = new Map<string, HTMLAudioElement>();
const activeAudioInstances = new Set<HTMLAudioElement>();

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getImage = (src: string) => {
  let image = imageCache.get(src);
  if (!image && typeof Image !== 'undefined') {
    image = new Image();
    image.src = src;
    imageCache.set(src, image);
  }
  return image;
};

const playSound = (src: string, volume = 0.55) => {
  if (typeof Audio === 'undefined') return null;
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    audioCache.set(src, audio);
  }
  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.volume = volume;
  activeAudioInstances.add(instance);
  instance.addEventListener('ended', () => activeAudioInstances.delete(instance), { once: true });
  instance.play().catch(() => {});
  return instance;
};

const stopBattleSound = (audio?: HTMLAudioElement | null) => {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  activeAudioInstances.delete(audio);
};

const stopAllBattleSounds = () => {
  activeAudioInstances.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudioInstances.clear();
};

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const isMonsterKind = (kind: EnemyKind) => kind === 'monster-1' || kind === 'monster-2';

const getDefenseDifficultyLabel = (level: number, language: 'en' | 'pt') => {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel <= 9) return language === 'pt' ? 'Normal' : 'Normal';
  if (safeLevel <= 19) return language === 'pt' ? 'Difícil' : 'Hard';
  if (safeLevel <= 29) return language === 'pt' ? 'Extremo' : 'Extreme';
  if (safeLevel <= 39) return language === 'pt' ? 'Pesadelo' : 'Nightmare';
  if (safeLevel <= 49) return language === 'pt' ? 'Insano' : 'Insane';
  if (safeLevel <= 59) return language === 'pt' ? 'Tormento' : 'Torment';
  if (safeLevel <= 69) return language === 'pt' ? 'Caos' : 'Chaos';
  const chaosRank = Math.floor((safeLevel - 70) / 10) + 1;
  return language === 'pt' ? `Caos ${chaosRank}` : `Chaos ${chaosRank}`;
};

const buildEnemyBlueprint = (kills: number, forceMonsterBoss: boolean): EnemyBlueprint => {
  const roll = Math.random();

  if (forceMonsterBoss) {
    const monsterOne = Math.random() > 0.5;
    return monsterOne
      ? {
          kind: 'monster-1',
          image: MONSTER_1_FRAMES[0],
          frames: MONSTER_1_FRAMES,
          shootSound: `${ASSET_BASE}/enemys/monsters/monster 1/shoot_m1.ogg`,
          screamSound: `${ASSET_BASE}/enemys/monsters/monster 1/scream_m1.ogg`,
          explosionSound: `${ASSET_BASE}/enemys/monsters/monster 1/explosion_m1.ogg`,
          hp: 2500 + kills * 52,
          damage: 126,
          speed: 0.48,
          radius: 58,
          width: 164,
          height: 130,
          xp: 520,
          qc: 72000,
        }
      : {
          kind: 'monster-2',
          image: MONSTER_2_FRAMES[0],
          frames: MONSTER_2_FRAMES,
          shootSound: `${ASSET_BASE}/enemys/monsters/monster 2/shoot_m2.ogg`,
          screamSound: `${ASSET_BASE}/enemys/monsters/monster 2/scream_m2.ogg`,
          explosionSound: `${ASSET_BASE}/enemys/monsters/monster 2/explosion_m2.ogg`,
          hp: 2700 + kills * 54,
          damage: 134,
          speed: 0.44,
          radius: 62,
          width: 172,
          height: 136,
          xp: 560,
          qc: 78000,
        };
  }

  if (kills >= 12 && roll > 0.93) {
    return {
      kind: 'boss-ship',
      image: `${ASSET_BASE}/enemys/air_ships/enemy_boss_rt4.webp`,
      shootSound: `${ASSET_BASE}/enemys/air_ships/shoot_enemy_boss_rt4.ogg`,
      hp: 980 + kills * 18,
      damage: 68,
      speed: 0.48,
      radius: 42,
      width: 122,
      height: 82,
      xp: 150,
      qc: 18000,
    };
  }

  if (roll > 0.82) {
    return {
      kind: 'elite-ship',
      image: `${ASSET_BASE}/enemys/air_ships/enemy_elite_rt4.webp`,
      shootSound: `${ASSET_BASE}/enemys/air_ships/shoot_enemy_elite_rt4.ogg`,
      hp: 520 + kills * 12,
      damage: 48,
      speed: 0.72,
      radius: 32,
      width: 92,
      height: 62,
      xp: 90,
      qc: 9500,
    };
  }

  return {
    kind: 'common-ship',
    image: pick(COMMON_SHIP_IMAGES),
    shootSound: `${ASSET_BASE}/enemys/air_ships/1_shoot_enemy_rt4.ogg`,
    hp: 260 + Math.floor(Math.random() * 120) + kills * 8,
    damage: 30 + Math.floor(Math.random() * 18),
    speed: 0.75 + Math.random() * 0.55 + kills * 0.012,
    radius: 24,
    width: 74,
    height: 50,
    xp: 45,
    qc: 4200,
  };
};

export const NewEarthDefenseBattle: React.FC<NewEarthDefenseBattleProps> = ({
  language,
  shipStats,
  horizonLevel,
  defenseBattleLevel,
  horizonXp,
  horizonNextXp,
  specials,
  trinityShotEnabled = false,
  threatTitle,
  onVictory,
  onDefeat,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const backgroundRef = useRef(pick(BATTLE_BACKGROUNDS));
  const keysRef = useRef<Record<string, boolean>>({});
  const controlsRef = useRef({ specialOne: 0, specialTwo: 0 });
  const horizonProgressRef = useRef({ level: horizonLevel, currentXp: horizonXp, nextXp: horizonNextXp });
  const levelUpSfxHandledRef = useRef(false);
  const stateRef = useRef({
    player: { x: 120, y: HEIGHT / 2, hp: shipStats.health, shield: shipStats.shield },
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    floats: [] as FloatText[],
    lastShot: 0,
    lastSpawn: 0,
    kills: 0,
    earnedXp: 0,
    earnedQc: 0,
    nextId: 1,
    ended: false,
    specialCooldowns: {} as Record<string, number>,
    monsterSpawned: false,
    monsterDefeated: false,
    laserState: 'idle' as LaserState,
    laserStateStart: 0,
    laserImpactPos: { x: 0, y: 0 },
    laserParticles: [] as LaserParticle[],
    laserEmbers: [] as LaserEmber[],
    impactParticles: [] as LaserEmber[],
    backgroundParticles: [] as LaserEmber[],
    shockwaves: [] as Shockwave[],
    laserBeamWidth: 0,
    laserFlashAlpha: 0,
    laserResidualBurnLife: 0,
    laserLastDamageTick: 0,
    laserShake: 0,
    hellfireSequence: { active: false, remaining: 0, waitingForImpact: false } as HellfireSequence,
    hellfireParticles: [] as LaserEmber[],
    hellfireShockwaves: [] as Shockwave[],
    hellfireFlashAlpha: 0,
    hellfireBannerLife: 0,
    hellfireShake: 0,
    hellfireLaunchIndex: 0,
    trinityParticles: [] as LaserEmber[],
    trinityShockwaves: [] as Shockwave[],
    trinityShake: 0,
  });
  const currentDefenseBattleLevel = Math.max(1, Math.floor(defenseBattleLevel || 1));
  const [hud, setHud] = useState({
    hp: shipStats.health,
    shield: shipStats.shield,
    kills: 0,
    earnedXp: 0,
    earnedQc: 0,
    enemies: 0,
    ended: false,
    result: '' as 'victory' | 'defeat' | '',
  });
  const [horizonHud, setHorizonHud] = useState({ level: horizonLevel, currentXp: horizonXp, nextXp: horizonNextXp });
  const [result, setResult] = useState<'victory' | 'defeat' | ''>('');

  const t = (en: string, pt: string) => language === 'pt' ? pt : en;
  const difficultyLabel = getDefenseDifficultyLabel(currentDefenseBattleLevel, language);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;
      keysRef.current[event.code.toLowerCase()] = true;
      if ([' ', 'q', 'e', 'c', 'f'].includes(event.key.toLowerCase()) || ['keyc', 'keyf'].includes(event.code.toLowerCase())) event.preventDefault();
    };
    const up = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
      keysRef.current[event.code.toLowerCase()] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    state.player.hp = shipStats.health;
    state.player.shield = shipStats.shield;
    state.enemies = [];
    state.projectiles = [];
    state.floats = [];
    state.kills = 0;
    state.earnedXp = 0;
    state.earnedQc = 0;
    state.lastShot = 0;
    state.lastSpawn = 0;
    state.ended = false;
    state.monsterSpawned = false;
    state.monsterDefeated = false;
    state.laserState = 'idle';
    state.laserStateStart = 0;
    state.laserImpactPos = { x: 0, y: 0 };
    state.laserParticles = [];
    state.laserEmbers = [];
    state.impactParticles = [];
    state.backgroundParticles = [];
    state.shockwaves = [];
    state.laserBeamWidth = 0;
    state.laserFlashAlpha = 0;
    state.laserResidualBurnLife = 0;
    state.laserLastDamageTick = 0;
    state.laserShake = 0;
    state.hellfireSequence = { active: false, remaining: 0, waitingForImpact: false };
    state.hellfireParticles = [];
    state.hellfireShockwaves = [];
    state.hellfireFlashAlpha = 0;
    state.hellfireBannerLife = 0;
    state.hellfireShake = 0;
    state.hellfireLaunchIndex = 0;
    state.trinityParticles = [];
    state.trinityShockwaves = [];
    state.trinityShake = 0;
    horizonProgressRef.current = { level: horizonLevel, currentXp: horizonXp, nextXp: horizonNextXp };
    levelUpSfxHandledRef.current = false;
    setHorizonHud({ level: horizonLevel, currentXp: horizonXp, nextXp: horizonNextXp });

    const spawnFloat = (x: number, y: number, text: string, color: string) => {
      state.floats.push({ id: state.nextId++, x, y, text, color, life: 45 });
    };

    const awardHorizonXp = (amount: number) => {
      const safeAmount = Math.max(0, Math.floor(amount));
      if (safeAmount <= 0) return;

      let { level, currentXp, nextXp } = horizonProgressRef.current;
      currentXp += safeAmount;
      let leveledUp = false;

      while (level < MAX_HORIZON_LEVEL && nextXp > 0 && currentXp >= nextXp) {
        currentXp -= nextXp;
        level += 1;
        nextXp = level >= MAX_HORIZON_LEVEL ? 0 : getHorizonXpForNextLevel(level);
        leveledUp = true;
      }

      const nextProgress = { level, currentXp, nextXp };
      horizonProgressRef.current = nextProgress;
      setHorizonHud(nextProgress);

      if (leveledUp) {
        levelUpSfxHandledRef.current = true;
        playSound(PLAYER_SOUNDS.horizonLevelUp, 0.78);
      }
    };

    const spawnParticle = (
      x: number,
      y: number,
      color: string,
      speed = 2,
      life = 0.8,
      size = 3,
      bucket: LaserEmber[] = state.impactParticles
    ) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.35 + Math.random() * 0.9);
      bucket.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life,
        size: Math.max(0.8, size * (0.45 + Math.random() * 0.9)),
        color,
      });
    };

    const drawGlowCircle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha = 1
    ) => {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color);
      glow.addColorStop(0.45, color.replace('1)', `${0.22 * alpha})`));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawLightning = (
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      color: string,
      width = 2,
      chaos = 18,
      segments = 7
    ) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t + (Math.random() - 0.5) * chaos;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const drawShockwave = (ctx: CanvasRenderingContext2D, wave: Shockwave) => {
      const progress = 1 - wave.life;
      const radius = (wave.radius || 0) + wave.maxRadius * progress;
      ctx.globalAlpha = Math.max(0, wave.life) * 0.75;
      ctx.strokeStyle = wave.color;
      ctx.shadowColor = wave.color;
      ctx.lineWidth = Math.max(1, (wave.width || 8) * wave.life);
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawEnergyRing = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha = 1
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.45, radius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const spawnSmokeParticle = (x: number, y: number, vx = 0, vy = 0, size = 14, life = 70) => {
      if (state.hellfireParticles.length > 320) return;
      state.hellfireParticles.push({
        type: 'smoke',
        x,
        y,
        vx: vx + rand(-0.55, 0.55),
        vy: vy + rand(-0.55, 0.55),
        life,
        maxLife: life,
        size: rand(size * 0.65, size * 1.35),
        growth: rand(0.2, 0.52),
        drag: rand(0.965, 0.988),
        color: Math.random() > 0.42 ? 'rgba(24,24,28,1)' : 'rgba(58,45,38,1)',
      });
    };

    const spawnEmberParticle = (x: number, y: number, vx = 0, vy = 0, size = 3, life = 38) => {
      if (state.hellfireParticles.length > 340) return;
      const colors = ['#ffcc66', '#fb923c', '#ef4444', '#f97316', '#ffd166'];
      state.hellfireParticles.push({
        type: 'ember',
        x,
        y,
        vx: vx + rand(-0.7, 0.7),
        vy: vy + rand(-0.7, 0.7),
        life,
        maxLife: life,
        size: rand(size * 0.55, size * 1.5),
        growth: -0.025,
        drag: rand(0.935, 0.974),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const spawnFireBurst = (x: number, y: number, power = 1, dying = false) => {
      state.hellfireShockwaves.push(
        { x, y, radius: 12, maxRadius: 148 * power, life: 1, decay: 0.034, color: 'rgba(251,146,60,0.88)', width: 8 },
        { x, y, radius: 4, maxRadius: 94 * power, life: 1, decay: 0.046, color: 'rgba(255,220,120,0.66)', width: 5 },
        { x, y, radius: 18, maxRadius: 190 * power, life: 1, decay: 0.026, color: 'rgba(127,29,29,0.52)', width: 12 }
      );

      const emberCount = dying ? 48 : 30;
      const fireCount = dying ? 26 : 16;
      const smokeCount = dying ? 30 : 22;
      const debrisCount = dying ? 12 : 8;

      for (let i = 0; i < emberCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const force = rand(3.4, 13.4) * power;
        spawnEmberParticle(x, y, Math.cos(angle) * force, Math.sin(angle) * force, rand(2.3, 6.5), rand(26, 58));
      }
      for (let i = 0; i < fireCount; i++) {
        if (state.hellfireParticles.length > 340) break;
        const angle = Math.random() * Math.PI * 2;
        const force = rand(1.7, 8.5) * power;
        state.hellfireParticles.push({
          type: 'fire',
          x,
          y,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          life: rand(28, 52),
          maxLife: 52,
          size: rand(5, 13),
          growth: -0.06,
          drag: 0.94,
          color: ['#ffdd88', '#fb923c', '#f97316', '#ef4444'][Math.floor(Math.random() * 4)],
        });
      }
      for (let i = 0; i < smokeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const force = rand(0.9, 5.8) * power;
        spawnSmokeParticle(x, y, Math.cos(angle) * force, Math.sin(angle) * force, rand(12, 28), rand(62, 110));
      }
      for (let i = 0; i < debrisCount; i++) {
        if (state.hellfireParticles.length > 340) break;
        const angle = Math.random() * Math.PI * 2;
        const force = rand(2.2, 9.2) * power;
        state.hellfireParticles.push({
          type: 'debris',
          x,
          y,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          life: rand(36, 74),
          maxLife: 74,
          size: rand(2, 5),
          growth: -0.01,
          drag: 0.965,
          color: 'rgba(16,16,20,1)',
        });
      }
    };

    const drawFireball = (ctx: CanvasRenderingContext2D, projectile: Projectile, now: number) => {
      const seed = projectile.seed || 0;
      const baseSize = projectile.size || 11;
      const angle = Math.atan2(projectile.vy, projectile.vx);
      const pulse = 1 + Math.sin(now / 75 + seed) * 0.08;
      const core = baseSize * pulse;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const aura = ctx.createRadialGradient(projectile.x, projectile.y, 0, projectile.x, projectile.y, core * 4.2);
      aura.addColorStop(0, 'rgba(255,220,120,0.62)');
      aura.addColorStop(0.24, 'rgba(251,146,60,0.42)');
      aura.addColorStop(0.58, 'rgba(239,68,68,0.22)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, core * 4.2, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(projectile.x - Math.cos(angle) * 2, projectile.y - Math.sin(angle) * 2, 0, projectile.x, projectile.y, core * 1.95);
      body.addColorStop(0, 'rgba(255,238,180,0.88)');
      body.addColorStop(0.22, 'rgba(255,180,70,0.95)');
      body.addColorStop(0.62, 'rgba(249,115,22,0.92)');
      body.addColorStop(1, 'rgba(127,29,29,0.46)');
      ctx.fillStyle = body;
      ctx.shadowColor = '#fb923c';
      ctx.beginPath();
      for (let i = 0; i < 18; i++) {
        const theta = (Math.PI * 2 * i) / 18;
        const deform = 1 + Math.sin(now / 95 + seed + i * 1.8) * 0.12;
        const px = projectile.x + Math.cos(theta) * core * 1.62 * deform;
        const py = projectile.y + Math.sin(theta) * core * 1.36 * deform;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,245,210,0.82)';
      ctx.shadowColor = '#fff2b8';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, core * 0.38, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 7; i++) {
        const flameAngle = angle + Math.PI + rand(-0.86, 0.86);
        const length = rand(core * 1.25, core * 2.9);
        ctx.strokeStyle = i % 2 ? 'rgba(239,68,68,0.7)' : 'rgba(251,146,60,0.76)';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.lineWidth = rand(2.1, 4.6);
        ctx.beginPath();
        ctx.moveTo(projectile.x + Math.cos(flameAngle) * core * 0.7, projectile.y + Math.sin(flameAngle) * core * 0.7);
        ctx.quadraticCurveTo(
          projectile.x + Math.cos(flameAngle) * length * 0.65 + rand(-8, 8),
          projectile.y + Math.sin(flameAngle) * length * 0.65 + rand(-8, 8),
          projectile.x + Math.cos(flameAngle) * length,
          projectile.y + Math.sin(flameAngle) * length
        );
        ctx.stroke();
      }
      ctx.restore();
    };

    const pushTrinityParticle = (particle: LaserEmber) => {
      if (state.trinityParticles.length > 240) return;
      state.trinityParticles.push(particle);
    };

    const drawIceShard = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color = '#67e8f9') => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.46, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.46, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const spawnTrinityTrail = (projectile: Projectile) => {
      const backAngle = Math.atan2(-projectile.vy, -projectile.vx);
      const sideAngle = backAngle + Math.PI / 2;
      const seed = projectile.seed || 0;

      if (Math.random() > 0.46) {
        const spread = rand(-8, 8);
        pushTrinityParticle({
          type: 'fire',
          x: projectile.x + Math.cos(backAngle) * rand(10, 22) + Math.cos(sideAngle) * spread,
          y: projectile.y + Math.sin(backAngle) * rand(10, 22) + Math.sin(sideAngle) * spread,
          vx: Math.cos(backAngle) * rand(1.2, 3.8) + rand(-0.45, 0.45),
          vy: Math.sin(backAngle) * rand(1.2, 3.8) + rand(-0.45, 0.45),
          life: rand(0.34, 0.62),
          maxLife: 0.62,
          size: rand(2, 5),
          growth: -0.04,
          drag: 0.94,
          color: Math.random() > 0.5 ? '#fb923c' : '#ef4444',
        });
      }

      if (Math.random() > 0.56) {
        pushTrinityParticle({
          type: Math.random() > 0.62 ? 'iceShard' : 'mist',
          x: projectile.x + Math.cos(backAngle) * rand(8, 20) + Math.cos(sideAngle) * rand(-10, 10),
          y: projectile.y + Math.sin(backAngle) * rand(8, 20) + Math.sin(sideAngle) * rand(-10, 10),
          vx: Math.cos(backAngle) * rand(0.5, 2.1) + rand(-0.35, 0.35),
          vy: Math.sin(backAngle) * rand(0.5, 2.1) + rand(-0.35, 0.35),
          life: rand(0.32, 0.58),
          maxLife: 0.58,
          size: rand(2.2, 6),
          growth: Math.random() > 0.5 ? 0.06 : -0.015,
          drag: 0.955,
          color: Math.random() > 0.4 ? '#67e8f9' : '#22d3ee',
          rotation: rand(0, Math.PI),
          spin: rand(-0.12, 0.12),
        });
      }

      if (Math.random() > 0.72) {
        const length = rand(10, 26);
        const angle = backAngle + rand(-0.9, 0.9);
        pushTrinityParticle({
          type: 'bolt',
          x: projectile.x + rand(-5, 5),
          y: projectile.y + rand(-5, 5),
          endX: projectile.x + Math.cos(angle) * length,
          endY: projectile.y + Math.sin(angle) * length,
          vx: Math.cos(backAngle) * 0.7,
          vy: Math.sin(backAngle) * 0.7,
          life: rand(0.12, 0.22),
          maxLife: 0.22,
          size: rand(1, 1.8),
          drag: 0.92,
          color: Math.random() > 0.45 ? '#facc15' : '#fde047',
        });
      }

      if (Math.random() > 0.7) {
        pushTrinityParticle({
          type: 'smoke',
          x: projectile.x + Math.cos(backAngle) * rand(12, 24) + Math.sin(seed) * 2,
          y: projectile.y + Math.sin(backAngle) * rand(12, 24),
          vx: Math.cos(backAngle) * rand(0.35, 1.2) + rand(-0.25, 0.25),
          vy: Math.sin(backAngle) * rand(0.35, 1.2) + rand(-0.25, 0.25),
          life: rand(0.38, 0.7),
          maxLife: 0.7,
          size: rand(4, 9),
          growth: 0.12,
          drag: 0.965,
          color: Math.random() > 0.5 ? 'rgba(51,65,85,1)' : 'rgba(71,85,105,1)',
        });
      }
    };

    const spawnTrinityImpact = (x: number, y: number, destroyed = false) => {
      const power = destroyed ? 1.2 : 1;
      state.trinityShake = Math.max(state.trinityShake, destroyed ? 8 : 5.5);
      state.trinityShockwaves.push(
        { x, y, radius: 8, maxRadius: 96 * power, life: 1, decay: 0.05, color: 'rgba(250,204,21,0.84)', width: 5 },
        { x, y, radius: 12, maxRadius: 132 * power, life: 1, decay: 0.04, color: 'rgba(34,211,238,0.68)', width: 4 },
        { x, y, radius: 18, maxRadius: 170 * power, life: 1, decay: 0.033, color: 'rgba(251,146,60,0.58)', width: 8 }
      );

      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 34 + rand(-0.08, 0.08);
        const speed = rand(2.2, 8.5) * power;
        pushTrinityParticle({
          type: 'fire',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(0.48, 0.9),
          maxLife: 0.9,
          size: rand(3, 8),
          growth: -0.055,
          drag: 0.94,
          color: i % 2 ? '#fb923c' : '#ef4444',
        });
      }
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(1.6, 6.8) * power;
        pushTrinityParticle({
          type: 'iceShard',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(0.54, 0.95),
          maxLife: 0.95,
          size: rand(4, 10),
          drag: 0.955,
          color: i % 2 ? '#67e8f9' : '#cffafe',
          rotation: rand(0, Math.PI),
          spin: rand(-0.18, 0.18),
        });
      }
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = rand(18, 52) * power;
        pushTrinityParticle({
          type: 'bolt',
          x,
          y,
          endX: x + Math.cos(angle) * length,
          endY: y + Math.sin(angle) * length,
          vx: 0,
          vy: 0,
          life: rand(0.14, 0.34),
          maxLife: 0.34,
          size: rand(1.2, 2.6),
          color: i % 2 ? '#facc15' : '#67e8f9',
        });
      }
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(0.6, 3.2) * power;
        pushTrinityParticle({
          type: 'mist',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(0.52, 0.95),
          maxLife: 0.95,
          size: rand(10, 24),
          growth: 0.22,
          drag: 0.97,
          color: 'rgba(103,232,249,1)',
        });
      }
    };

    const drawTrinityProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile, now: number) => {
      const angle = Math.atan2(projectile.vy, projectile.vx);
      const phase = projectile.phase || 0;
      const age = now - (projectile.born || now);
      const pulse = Math.sin(now / 48 + phase);
      const length = 42 + pulse * 4;
      const core = 8.8 + pulse * 0.7;

      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.rotate(angle);
      ctx.globalCompositeOperation = 'lighter';

      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.26;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.shadowColor = '#facc15';
      ctx.fillStyle = 'rgba(250,204,21,0.58)';
      ctx.beginPath();
      ctx.moveTo(length + 12, 0);
      ctx.bezierCurveTo(24, -14 - pulse * 2, -20, -11, -30, 0);
      ctx.bezierCurveTo(-20, 11, 24, 14 + pulse * 2, length + 12, 0);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(length + 6, 0);
      ctx.bezierCurveTo(26, -7, -12, -5, -24, 0);
      ctx.bezierCurveTo(-12, 5, 26, 7, length + 6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = 'rgba(250,204,21,0.86)';
      ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, core, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,236,140,0.7)';
      ctx.beginPath();
      ctx.arc(0, 0, core * 0.48, 0, Math.PI * 2);
      ctx.fill();

      const orbitColors = ['#fb923c', '#67e8f9', '#facc15'];
      orbitColors.forEach((color, index) => {
        ctx.save();
        ctx.rotate(index * 2.1 + now / (145 - index * 20) + phase);
        ctx.globalAlpha = 0.72;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24 + index * 3, 7 + index, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      for (let i = 0; i < 3; i++) {
        const crystalAngle = now / 160 + phase + i * 1.26;
        drawIceShard(ctx, Math.cos(crystalAngle) * 19, Math.sin(crystalAngle) * 10, 3.2, crystalAngle, i % 2 ? '#67e8f9' : '#cffafe');
      }

      for (let i = 0; i < 4; i++) {
        const flameAngle = Math.PI + rand(-0.75, 0.75);
        ctx.strokeStyle = i % 2 ? 'rgba(239,68,68,0.72)' : 'rgba(251,146,60,0.76)';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.lineWidth = rand(1.8, 3.4);
        ctx.beginPath();
        ctx.moveTo(-8, Math.sin(age / 80 + i) * 5);
        ctx.quadraticCurveTo(-20 + rand(-4, 4), Math.sin(age / 70 + i) * 12, Math.cos(flameAngle) * 26, Math.sin(flameAngle) * 12);
        ctx.stroke();
      }

      ctx.restore();

      if (Math.random() > 0.58) {
        const i = Math.floor(now / 48) % 3;
        const angleA = angle + rand(-1.35, 1.35);
        const radius = rand(8, 18);
        const sx = projectile.x + Math.cos(angleA) * radius;
        const sy = projectile.y + Math.sin(angleA) * radius;
        const ex = projectile.x + Math.cos(angleA + rand(-0.7, 0.7)) * rand(18, 34);
        const ey = projectile.y + Math.sin(angleA + rand(-0.7, 0.7)) * rand(18, 34);
        drawLightning(ctx, sx, sy, ex, ey, i % 2 ? 'rgba(250,204,21,0.86)' : 'rgba(103,232,249,0.76)', 1.1, 9, 4);
      }
    };

    const playerShootSound = () => {
      if (trinityShotEnabled) return PLAYER_SOUNDS.trinity;
      const elemental = shipStats.elementalDamage;
      if (elemental.electric > 0) return PLAYER_SOUNDS.electric;
      if (elemental.fire > 0) return PLAYER_SOUNDS.fire;
      if (elemental.ice > 0) return PLAYER_SOUNDS.ice;
      return PLAYER_SOUNDS.normal;
    };

    const projectileColor = () => {
      if (trinityShotEnabled) return '#facc15';
      const elemental = shipStats.elementalDamage;
      if (elemental.electric > 0) return '#7dd3fc';
      if (elemental.fire > 0) return '#fb923c';
      if (elemental.ice > 0) return '#67e8f9';
      return '#ffffff';
    };

    const spawnEnemy = () => {
      if (state.kills >= 19 && state.monsterSpawned) return;
      const forceMonsterBoss = state.kills >= 19 && !state.monsterSpawned;
      const blueprint = buildEnemyBlueprint(state.kills, forceMonsterBoss);
      if (isMonsterKind(blueprint.kind)) state.monsterSpawned = true;
      const level = horizonLevel + 1 + Math.floor(Math.random() * 3);
      const levelScale = 1 + Math.max(0, level - 1) * 0.06;
      const bossScale = isMonsterKind(blueprint.kind) ? 1.25 : 1;
      const battleLevelScale = 1 + Math.max(0, currentDefenseBattleLevel - 1) * 0.1;
      const rewardScale = battleLevelScale;
      const scaledHp = Math.round(blueprint.hp * levelScale * bossScale * battleLevelScale);
      const scaledDamage = Math.round(blueprint.damage * levelScale * bossScale * battleLevelScale);
      const enemy: Enemy = {
        id: state.nextId++,
        kind: blueprint.kind,
        level,
        x: WIDTH + blueprint.width,
        y: 80 + Math.random() * (HEIGHT - 160),
        hp: scaledHp,
        maxHp: scaledHp,
        speed: blueprint.speed,
        radius: blueprint.radius,
        width: blueprint.width,
        height: blueprint.height,
        damage: scaledDamage,
        status: {},
        attackCooldown: performance.now() + 900 + Math.random() * 900,
        image: blueprint.image,
        frames: blueprint.frames,
        shootSound: blueprint.shootSound,
        screamSound: blueprint.screamSound,
        explosionSound: blueprint.explosionSound,
        frameOffset: Math.random() * 10,
        xp: Math.round(blueprint.xp * rewardScale),
        qc: Math.round(blueprint.qc * rewardScale),
      };
      if (blueprint.screamSound) enemy.screamAudio = playSound(blueprint.screamSound, 0.72);
      state.enemies.push(enemy);
    };

    const damagePlayer = (damage: number) => {
      const p = state.player;
      if (p.shield > 0) {
        const shieldDamage = Math.min(p.shield, damage);
        p.shield -= shieldDamage;
        p.hp -= Math.max(0, damage - shieldDamage);
      } else {
        p.hp -= damage;
      }
    };

    const createSpecialDamagePayload = (baseMultiplier: number, extraElemental: Partial<Projectile['elemental']> = {}) => {
      const crit = Math.random() * 100 < shipStats.critChance;
      const damage = shipStats.damage * baseMultiplier;
      return {
        damage,
        crit,
        elemental: {
          ice: Math.round((shipStats.elementalDamage.ice + (extraElemental.ice || 0)) * baseMultiplier),
          electric: Math.round((shipStats.elementalDamage.electric + (extraElemental.electric || 0)) * baseMultiplier),
          fire: Math.round((shipStats.elementalDamage.fire + (extraElemental.fire || 0)) * baseMultiplier),
        },
      };
    };

    const applyElementalDamage = (
      enemy: Enemy,
      elementalDamage: Projectile['elemental'],
      now: number,
      showFloats = true
    ) => {
      let total = 0;

      if (elementalDamage.ice > 0) {
        const elemental = elementalDamage.ice * (enemy.status.slowUntil && enemy.status.slowUntil > now ? 1 + shipStats.conditionalBonuses.bonusDamageVsSlowPercent / 100 : 1);
        enemy.hp -= elemental;
        total += elemental;
        enemy.status.slowUntil = now + 2600;
        if (showFloats) spawnFloat(enemy.x + 16, enemy.y, `${Math.round(elemental)}`, '#67e8f9');
      }

      if (elementalDamage.electric > 0) {
        const elemental = elementalDamage.electric * (enemy.status.shockedUntil && enemy.status.shockedUntil > now ? 1 + shipStats.conditionalBonuses.bonusDamageVsShockedPercent / 100 : 1);
        enemy.hp -= elemental;
        total += elemental;
        enemy.status.shockedUntil = now + 2300;
        if (showFloats) spawnFloat(enemy.x + 16, enemy.y + 16, `${Math.round(elemental)}`, '#facc15');
      }

      if (elementalDamage.fire > 0) {
        const elemental = elementalDamage.fire * (enemy.status.burningUntil && enemy.status.burningUntil > now ? 1 + shipStats.conditionalBonuses.bonusDamageVsBurningPercent / 100 : 1);
        enemy.hp -= elemental;
        total += elemental;
        enemy.status.burningUntil = now + 3200;
        enemy.status.lastBurnTick = now;
        if (showFloats) spawnFloat(enemy.x + 16, enemy.y - 8, `${Math.round(elemental)}`, '#fb923c');
      }

      return total;
    };

    const damageEnemy = (enemy: Enemy, projectile: Projectile) => {
      const now = performance.now();
      let baseDamage = projectile.damage;
      if (projectile.crit) baseDamage *= shipStats.critMultiplier;

      enemy.hp -= baseDamage;
      if (projectile.special === 'hellfire') {
        spawnFloat(enemy.x - 28, enemy.y - 30, `CRIT ${Math.round(baseDamage)}`, '#ffcc66');
      } else {
        spawnFloat(enemy.x, enemy.y - 22, `${Math.round(baseDamage)}`, projectile.crit ? '#facc15' : '#ffffff');
      }

      applyElementalDamage(enemy, projectile.elemental, now);

      if (projectile.trinityShot) {
        spawnTrinityImpact(enemy.x, enemy.y, enemy.hp <= 0);
      }

      if (projectile.special === 'hellfire') {
        const enemyDestroyed = enemy.hp <= 0;
        playSound(PLAYER_SOUNDS.hellfireImpact, enemyDestroyed ? 0.72 : 0.62);
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const force = rand(2.4, 6.5);
          spawnEmberParticle(enemy.x, enemy.y, Math.cos(angle) * force, Math.sin(angle) * force, rand(1.6, 3.8), rand(18, 36));
        }
        spawnFireBurst(enemy.x, enemy.y, enemyDestroyed ? 1.28 : 1.06, enemyDestroyed);
        state.hellfireShake = Math.max(state.hellfireShake, enemyDestroyed ? 12 : 9);
      }
    };

    const fireShot = (target?: Enemy) => {
      const now = performance.now();
      if (now - state.lastShot < 230) return;
      state.lastShot = now;

      const crit = Math.random() * 100 < shipStats.critChance;
      const elemental = shipStats.elementalDamage;
      const targetDx = target ? target.x - (state.player.x + 34) : 1;
      const targetDy = target ? target.y - state.player.y : 0;
      const targetLength = Math.max(1, Math.sqrt(targetDx * targetDx + targetDy * targetDy));
      const speed = 9.5;
      playSound(playerShootSound(), 0.48);
      if (trinityShotEnabled) {
        const muzzleX = state.player.x + 38;
        const muzzleY = state.player.y;
        state.trinityShake = Math.max(state.trinityShake, 3.2);
        state.trinityShockwaves.push(
          { x: muzzleX, y: muzzleY, radius: 4, maxRadius: 38, life: 1, decay: 0.08, color: 'rgba(250,204,21,0.82)', width: 2.2 },
          { x: muzzleX + 10, y: muzzleY, radius: 2, maxRadius: 24, life: 0.9, decay: 0.085, color: 'rgba(103,232,249,0.62)', width: 1.4 }
        );
        for (let i = 0; i < 12; i++) {
          const backAngle = Math.atan2(targetDy, targetDx) + Math.PI + rand(-0.55, 0.55);
          const particleSpeed = rand(1, 3.8);
          pushTrinityParticle({
            type: i % 3 === 0 ? 'iceShard' : i % 3 === 1 ? 'fire' : 'electric',
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(backAngle) * particleSpeed,
            vy: Math.sin(backAngle) * particleSpeed,
            life: rand(0.34, 0.74),
            maxLife: 0.74,
            size: rand(1.4, 4.8),
            growth: i % 3 === 1 ? -0.035 : 0,
            drag: 0.92,
            color: i % 3 === 0 ? '#67e8f9' : i % 3 === 1 ? '#fb923c' : '#facc15',
            rotation: rand(0, Math.PI),
            spin: rand(-0.14, 0.14),
          });
        }
      }
      state.projectiles.push({
        id: state.nextId++,
        from: 'player',
        targetId: target?.id,
        x: state.player.x + 34,
        y: state.player.y,
        vx: (targetDx / targetLength) * speed,
        vy: (targetDy / targetLength) * speed,
        damage: shipStats.damage,
        crit,
        elemental: { ...elemental },
        color: projectileColor(),
        trinityShot: trinityShotEnabled,
        size: trinityShotEnabled ? 10 : undefined,
        seed: trinityShotEnabled ? Math.random() * 1000 : undefined,
        born: trinityShotEnabled ? now : undefined,
        phase: trinityShotEnabled ? Math.random() * Math.PI * 2 : undefined,
      });
    };

    const fireEnemyShot = (enemy: Enemy) => {
      const now = performance.now();
      if (enemy.attackCooldown > now) return;
      const shocked = enemy.status.shockedUntil && enemy.status.shockedUntil > now;
      const skip = shocked && Math.random() * 100 < shipStats.conditionalBonuses.shockedEnemySkipChance;
      const baseCooldown = enemy.kind === 'boss-ship' ? 1050 : enemy.kind.includes('monster') ? 945 : 1550;
      enemy.attackCooldown = now + baseCooldown + Math.random() * (enemy.kind.includes('monster') ? 350 : 500);
      if (skip) {
        spawnFloat(enemy.x - 14, enemy.y - 24, 'FAIL', '#7dd3fc');
        return;
      }
      playSound(enemy.shootSound, enemy.kind === 'boss-ship' ? 0.62 : 0.46);
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const speed = enemy.kind === 'boss-ship' ? 5.1 : enemy.kind.includes('monster') ? 4.5 : 4.8;
      const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;
      const damage = enemy.damage * (slowed ? 1 - shipStats.conditionalBonuses.slowEnemyDamageReductionPercent / 100 : 1);

      state.projectiles.push({
        id: state.nextId++,
        from: 'enemy',
        targetId: undefined,
        x: enemy.x - enemy.width * 0.34,
        y: enemy.y,
        vx: (dx / length) * speed,
        vy: (dy / length) * speed,
        damage,
        crit: false,
        elemental: { ice: 0, electric: 0, fire: 0 },
        color: enemy.kind === 'boss-ship' ? '#f97316' : enemy.kind.includes('monster') ? '#a855f7' : '#ef4444',
      });
    };

    const getLaserStart = () => ({ x: state.player.x + 56, y: state.player.y });

    const getLaserEnd = () => {
      const start = getLaserStart();
      return { x: WIDTH * 0.96, y: start.y };
    };

    const distanceToSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
      const dx = bx - ax;
      const dy = by - ay;
      const lengthSq = dx * dx + dy * dy;
      if (lengthSq === 0) return Math.hypot(px - ax, py - ay);
      const tValue = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
      const x = ax + tValue * dx;
      const y = ay + tValue * dy;
      return Math.hypot(px - x, py - y);
    };

    const applyLaserDamageTick = () => {
      const now = performance.now();
      const start = getLaserStart();
      const end = getLaserEnd();
      let hitCount = 0;
      let totalDamage = 0;
      state.enemies.forEach(enemy => {
        const distance = distanceToSegment(enemy.x, enemy.y, start.x, start.y, end.x, end.y);
        if (enemy.hp > 0 && distance < (isMonsterKind(enemy.kind) ? 145 : 105)) {
          const payload = createSpecialDamagePayload(1.6);
          const baseDamage = payload.crit ? payload.damage * shipStats.critMultiplier : payload.damage;
          enemy.hp -= baseDamage;
          const elementalDamage = applyElementalDamage(enemy, payload.elemental, now, hitCount < 2 || isMonsterKind(enemy.kind));
          const laserDamage = baseDamage + elementalDamage;
          hitCount += 1;
          totalDamage += laserDamage;
          for (let i = 0; i < 8; i++) {
            spawnParticle(enemy.x, enemy.y, ['#f0abfc', '#22d3ee', '#ff3355', '#ffffff'][i % 4], 3.2, 0.62, 3.2);
          }
          if (hitCount <= 3 || isMonsterKind(enemy.kind)) {
            spawnFloat(enemy.x, enemy.y - 34, `${payload.crit ? 'CRIT ' : ''}${Math.round(laserDamage)}`, payload.crit ? '#facc15' : '#f0abfc');
          }
        }
      });
      if (hitCount > 0) {
        playSound(PLAYER_SOUNDS.apocalypseLaserImpact, Math.min(0.72, 0.42 + hitCount * 0.08));
      }
      if (hitCount > 3) {
        spawnFloat(end.x - 120, end.y - 48, `${hitCount} HITS · ${Math.round(totalDamage)}`, '#ffffff');
      }
    };

    const launchHellfireOrb = () => {
      const aliveEnemies = state.enemies.filter(enemy => enemy.hp > 0);
      const target = aliveEnemies.sort((a, b) => a.x - b.x)[0];
      const launchIndex = state.hellfireLaunchIndex++;
      const launchSpread = launchIndex * 0.62;
      const startX = state.player.x + 22 + Math.sin(launchSpread) * 12;
      const startY = state.player.y - 34 + Math.cos(launchSpread * 1.35) * 22;
      const targetX = target ? target.x : WIDTH * 0.9;
      const targetY = target ? target.y + Math.sin(launchSpread * 1.9) * 18 : state.player.y;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const speed = 7.1;
      const damagePayload = createSpecialDamagePayload(1.8, { fire: 25 });
      playSound(PLAYER_SOUNDS.hellfireShoot, 0.62);
      state.projectiles.push({
        id: state.nextId++,
        from: 'player',
        targetId: target?.id,
        special: 'hellfire',
        sequence: 'hellfire',
        x: startX,
        y: startY,
        vx: (dx / length) * speed,
        vy: (dy / length) * speed,
        damage: damagePayload.damage,
        crit: damagePayload.crit,
        elemental: damagePayload.elemental,
        color: '#fb923c',
        size: 10.5 + Math.random() * 2.5,
        seed: Math.random() * 1000,
      });
      state.hellfireShake = Math.max(state.hellfireShake, 5);
      state.hellfireSequence.waitingForImpact = true;
    };

    const triggerSpecial = (index: number) => {
      const specialId = specials[index];
      if (!specialId || specialId.startsWith('special-slot')) return;
      const now = performance.now();
      const cooldown = Math.max(5500, 16000 * (1 - shipStats.specialCooldownReductionPercent / 100));
      if ((state.specialCooldowns[specialId] || 0) > now) return;
      if (specialId === 'apocalypse-laser' && state.laserState !== 'idle') return;
      state.specialCooldowns[specialId] = now + cooldown;

      if (specialId === 'apocalypse-laser') {
        const start = getLaserStart();
        playSound(PLAYER_SOUNDS.apocalypseLaser, 0.72);
        state.laserState = 'charge';
        state.laserStateStart = now;
        state.laserImpactPos = { x: 0, y: 0 };
        state.laserFlashAlpha = 0.42;
        state.laserResidualBurnLife = 0;
        state.laserLastDamageTick = 0;
        state.laserParticles = [];
        state.laserEmbers = [];
        state.backgroundParticles = [];
        state.shockwaves = [];
        state.laserShake = 8;
        spawnFloat(start.x + 78, start.y - 62, 'APOCALIPSE LASER', '#f0abfc');
        for (let i = 0; i < 56; i++) {
          state.laserParticles.push({
            x: start.x + (Math.random() - 0.5) * 520,
            y: start.y + (Math.random() - 0.5) * 420,
            targetX: start.x,
            targetY: start.y,
            size: 1.4 + Math.random() * 4.2,
            life: 1,
            speed: 0.02 + Math.random() * 0.032,
            color: ['#ff00ff', '#ff3355', '#00ffff', '#ffffff', '#f0abfc'][Math.floor(Math.random() * 5)],
          });
        }
        for (let i = 0; i < 34; i++) {
          state.backgroundParticles.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            vx: -0.25 - Math.random() * 0.9,
            vy: (Math.random() - 0.5) * 0.55,
            life: 0.45 + Math.random() * 0.45,
            size: 0.8 + Math.random() * 2,
            color: ['rgba(34,211,238,0.8)', 'rgba(217,70,239,0.8)', 'rgba(255,255,255,0.65)'][Math.floor(Math.random() * 3)],
          });
        }
      }

      if (specialId === 'hellfire-barrage') {
        if (state.hellfireSequence.active) return;
        state.hellfireSequence = { active: true, remaining: 5, waitingForImpact: false };
        state.hellfireFlashAlpha = 0.24;
        state.hellfireBannerLife = 95;
        state.hellfireShake = Math.max(state.hellfireShake, 7);
        state.hellfireLaunchIndex = 0;
        spawnFloat(state.player.x + 76, state.player.y - 58, 'HELLFIRE BARRAGE', '#ffcc66');
        launchHellfireOrb();
      }
    };

    const drawImageOrFallback = (ctx: CanvasRenderingContext2D, src: string, x: number, y: number, width: number, height: number, fallback: () => void) => {
      const image = getImage(src);
      if (image?.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        return;
      }
      fallback();
    };

    const updateLaserSpecial = (now: number) => {
      if (state.laserState === 'idle') return;
      const chargeDuration = 900;
      const firingDuration = 3000;
      const collapseDuration = 1700;
      const elapsed = now - state.laserStateStart;

      if (state.laserState === 'charge' && elapsed > chargeDuration) {
        state.laserState = 'firing';
        state.laserStateStart = now;
        state.laserFlashAlpha = 0.28;
        state.laserImpactPos = { x: 0, y: 0 };
        state.laserLastDamageTick = now - 1000;
        state.laserShake = 18;
        return;
      }

      if (state.laserState === 'firing' && now - state.laserLastDamageTick >= 1000) {
        state.laserLastDamageTick = now;
        applyLaserDamageTick();
      }

      if (state.laserState === 'firing' && elapsed > firingDuration) {
        state.laserState = 'collapse';
        state.laserStateStart = now;
        playSound(PLAYER_SOUNDS.apocalypseLaserLastExplosion, 0.82);
        state.laserFlashAlpha = 0.38;
        state.laserResidualBurnLife = 1;
        const start = getLaserStart();
        const end = getLaserEnd();
        state.laserImpactPos = end;
        state.laserShake = 26;
        state.shockwaves.push({ x: end.x, y: end.y, life: 1, maxRadius: 720, color: 'rgba(210,240,255,0.58)' });
        state.shockwaves.push({ x: end.x, y: end.y, life: 1, maxRadius: 520, color: 'rgba(34,211,238,0.72)' });
        for (let i = 0; i < 72; i++) {
          const color = i % 6 === 0
            ? 'rgba(30,30,36,0.72)'
            : ['#ff00ff', '#ff3355', '#00ffff', '#ffffff', '#fb923c'][Math.floor(Math.random() * 5)];
          spawnParticle(end.x, end.y, color, 6 + Math.random() * 7, 1 + Math.random() * 0.9, 2 + Math.random() * 9, state.laserEmbers);
        }
        return;
      }

      if (state.laserState === 'collapse' && elapsed > collapseDuration) {
        state.laserState = 'idle';
        state.laserParticles = [];
        state.laserEmbers = [];
        state.shockwaves = [];
        state.backgroundParticles = [];
        state.laserShake = 0;
      }
    };

    const drawLaserSpecial = (ctx: CanvasRenderingContext2D) => {
      if (state.laserState === 'idle') return;
      const now = performance.now();
      const start = getLaserStart();
      const end = state.laserState === 'collapse' && state.laserImpactPos.x !== 0 ? state.laserImpactPos : getLaserEnd();
      const elapsed = now - state.laserStateStart;
      const laserColors = ['#ff00ff', '#ff3355', '#00ffff', '#ffffff'];

      if (state.laserState === 'charge') {
        const progress = Math.min(1, elapsed / 900);
        ctx.save();
        ctx.fillStyle = `rgba(0,0,0,${0.18 + progress * 0.54})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.globalCompositeOperation = 'lighter';
        state.laserParticles.forEach((particle, index) => {
          const arm = index % 2 === 0 ? 1 : -1;
          const angle = now / 155 + index * 0.22 * arm;
          const radius = (1 - progress) * (190 + (index % 12) * 9) + 24;
          particle.targetX = start.x - 12 + Math.cos(angle) * radius;
          particle.targetY = start.y + Math.sin(angle) * radius * 0.55;
          particle.x += (particle.targetX - particle.x) * particle.speed * (1 + progress * 1.4);
          particle.y += (particle.targetY - particle.y) * particle.speed * (1 + progress * 1.4);
          particle.life *= 0.992;
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        for (let i = 0; i < 3; i++) {
          const ringRadius = 28 + i * 22 + Math.sin(now / 90 + i) * 4 + progress * 28;
          drawEnergyRing(ctx, start.x + 26 + i * 5, start.y, ringRadius, i % 2 ? '#00ffff' : '#ff00ff', 0.55 + progress * 0.32);
        }

        for (let i = 0; i < 7; i++) {
          const sx = (i / 6) * WIDTH;
          const sy = (i % 2 === 0 ? 30 : HEIGHT - 30) + Math.sin(now / 180 + i) * 42;
          drawLightning(ctx, sx, sy, start.x + 34, start.y, i % 2 ? 'rgba(34,211,238,0.34)' : 'rgba(217,70,239,0.34)', 1, 22, 5);
        }

        ctx.globalAlpha = 0.2 + progress * 0.24;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(start.x - 80 + i * 26, start.y - 44 + Math.sin(now / 120 + i) * 8);
          ctx.quadraticCurveTo(start.x + 8, start.y + Math.sin(now / 80 + i) * 18, start.x + 74, start.y + Math.cos(now / 90 + i) * 14);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        drawGlowCircle(ctx, start.x + 45, start.y, 110 + progress * 55, 'rgba(255,0,255,1)', 0.55);
        drawGlowCircle(ctx, start.x + 45, start.y, 70 + progress * 35, 'rgba(34,211,238,1)', 0.6);

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let i = 0; i < 7; i++) {
          ctx.fillRect(0, (i * 79 + (now / 18) % 79) % HEIGHT, WIDTH, 1);
        }
        ctx.fillStyle = 'rgba(240,171,252,0.9)';
        ctx.font = '900 34px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#d946ef';
        ctx.fillText('APOCALIPSE LASER', WIDTH / 2, 92);
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(WIDTH / 2 - 190, 112, 380, 7);
        ctx.fillStyle = '#f0abfc';
        ctx.fillRect(WIDTH / 2 - 190, 112, 380 * progress, 7);
        ctx.restore();
      }

      if (state.laserState === 'firing') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.52)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        const beamFlicker = Math.sin(now * 0.075) * 5 + Math.random() * 3;
        state.laserBeamWidth = 34 + beamFlicker;
        ctx.globalCompositeOperation = 'lighter';

        const layers = [
          { color: 'rgba(239,68,68,0.2)', width: 128, blur: 28 },
          { color: 'rgba(34,211,238,0.43)', width: 66, blur: 22 },
          { color: 'rgba(217,70,239,0.72)', width: 32, blur: 16 },
          { color: 'rgba(210,240,255,0.42)', width: 4, blur: 10 },
        ];
        layers.forEach((layer, layerIndex) => {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          for (let j = 1; j <= 9; j++) {
            const tx = start.x + (end.x - start.x) * (j / 9);
            const ty = start.y + Math.sin(now / 55 + j * 1.7 + layerIndex) * (8 - layerIndex * 1.4);
            ctx.lineTo(tx, ty);
          }
          ctx.strokeStyle = layer.color;
          ctx.shadowColor = layer.color;
          ctx.globalAlpha = layerIndex === 3 ? 0.58 : 0.86;
          ctx.lineWidth = layer.width + beamFlicker * (1.25 - layerIndex * 0.26);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

        const coreThreads = [
          { color: 'rgba(34,211,238,0.82)', width: 2.8, offset: -9, speed: 52 },
          { color: 'rgba(217,70,239,0.74)', width: 2.4, offset: 8, speed: 46 },
          { color: 'rgba(255,120,190,0.52)', width: 1.6, offset: -3, speed: 38 },
          { color: 'rgba(120,245,255,0.48)', width: 1.4, offset: 4, speed: 34 },
        ];
        coreThreads.forEach((thread, threadIndex) => {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y + thread.offset);
          for (let j = 1; j <= 13; j++) {
            const tx = start.x + (end.x - start.x) * (j / 13);
            const ty = start.y + thread.offset + Math.sin(now / thread.speed + j * 1.45 + threadIndex * 1.7) * 7;
            ctx.lineTo(tx, ty);
          }
          ctx.strokeStyle = thread.color;
          ctx.shadowColor = thread.color;
          ctx.globalAlpha = 0.88;
          ctx.lineWidth = thread.width;
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

        for (let i = 0; i < 5; i++) {
          const t = 0.14 + i * 0.095;
          const bx = start.x + (end.x - start.x) * t;
          const by = start.y + Math.sin(now / 70 + i) * 18;
          const length = 46 + Math.random() * 70;
          drawLightning(ctx, bx, by, bx + length, by + (Math.random() - 0.5) * 90, i % 2 ? '#00ffff' : '#ff00ff', 1.4, 28, 5);
        }

        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.12 - i * 0.015;
          ctx.strokeStyle = laserColors[i % laserColors.length];
          ctx.shadowColor = laserColors[i % laserColors.length];
          ctx.lineWidth = 18 + i * 30;
          ctx.beginPath();
          ctx.moveTo(start.x - 14 - i * 9, start.y + Math.sin(now / 120 + i) * 12);
          ctx.lineTo(end.x - i * 26, end.y + Math.cos(now / 100 + i) * 26);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        const orbRadius = 48 + state.laserBeamWidth * 0.34;
        const orb = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, orbRadius);
        orb.addColorStop(0, 'rgba(220,245,255,0.82)');
        orb.addColorStop(0.22, 'rgba(34,211,238,0.58)');
        orb.addColorStop(0.55, 'rgba(217,70,239,0.34)');
        orb.addColorStop(1, 'transparent');
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(start.x, start.y, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        drawGlowCircle(ctx, end.x, end.y, 120 + Math.random() * 36, 'rgba(255,51,85,1)', 0.62);
        for (let i = 0; i < 4; i++) {
          drawEnergyRing(ctx, end.x, end.y, 42 + i * 18 + Math.sin(now / 80 + i) * 6, i % 2 ? '#00ffff' : '#ff00ff', 0.34);
        }
        ctx.restore();
      }

      if (state.laserState === 'collapse') {
        const p = Math.min(1, elapsed / 1700);
        const radius = 120 + p * 680;
        const glow = ctx.createRadialGradient(end.x, end.y, 10, end.x, end.y, radius);
        glow.addColorStop(0, 'rgba(220,245,255,0.82)');
        glow.addColorStop(0.2, '#ff3355');
        glow.addColorStop(0.55, 'rgba(239,68,68,0.45)');
        glow.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = (1 - p) * 0.78;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(end.x, end.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        state.shockwaves.forEach(wave => {
          drawShockwave(ctx, wave);
          wave.life -= 0.018;
        });
        state.shockwaves = state.shockwaves.filter(wave => wave.life > 0);
        state.laserEmbers.forEach(ember => {
          ember.x += ember.vx;
          ember.y += ember.vy;
          ember.vx *= ember.color.includes('30,30,36') ? 0.985 : 0.955;
          ember.vy *= ember.color.includes('30,30,36') ? 0.985 : 0.955;
          ember.life -= ember.color.includes('30,30,36') ? 0.008 : 0.018;
          ctx.globalAlpha = Math.max(0, ember.life);
          ctx.shadowColor = ember.color;
          ctx.fillStyle = ember.color;
          ctx.beginPath();
          ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
          ctx.fill();
        });
        state.laserEmbers = state.laserEmbers.filter(ember => ember.life > 0);
        ctx.restore();
      }

      if (state.laserFlashAlpha > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(210,240,255,${state.laserFlashAlpha})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
        state.laserFlashAlpha *= 0.84;
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      ctx.save();
      if (state.laserShake > 0.1 || state.hellfireShake > 0.1 || state.trinityShake > 0.1) {
        const shake = Math.max(state.laserShake, state.hellfireShake, state.trinityShake);
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        state.laserShake *= 0.88;
        state.hellfireShake *= 0.88;
        state.trinityShake *= 0.88;
      }

      const background = getImage(backgroundRef.current);
      if (background?.complete && background.naturalWidth > 0) {
        ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
      } else {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      const laserActive = state.laserState !== 'idle';
      ctx.fillStyle = laserActive ? 'rgba(29, 3, 39, 0.38)' : 'rgba(2, 6, 23, 0.42)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = laserActive ? 'rgba(34, 211, 238, 0.18)' : 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1;
      const now = performance.now();
      for (let x = 0; x < WIDTH; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 120, HEIGHT);
        ctx.stroke();
      }
      if (laserActive) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        state.backgroundParticles.forEach(particle => {
          particle.x += particle.vx - 0.7;
          particle.y += particle.vy;
          particle.life -= 0.006;
          if (particle.x < -20) particle.x = WIDTH + 20;
          ctx.globalAlpha = Math.max(0, particle.life);
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
        state.backgroundParticles = state.backgroundParticles.filter(particle => particle.life > 0);
        ctx.restore();
      }

      if (state.hellfireFlashAlpha > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(251,146,60,${state.hellfireFlashAlpha})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
        state.hellfireFlashAlpha *= 0.88;
      }

      if (state.hellfireBannerLife > 0) {
        ctx.save();
        const alpha = Math.min(1, state.hellfireBannerLife / 35);
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.font = '900 34px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(255,210,130,0.94)';
        ctx.shadowColor = '#fb923c';
        ctx.fillText('HELLFIRE BARRAGE', WIDTH / 2, 92);
        ctx.font = '700 11px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.fillText('INCENDIARY HOMING STRIKE', WIDTH / 2, 112);
        ctx.restore();
        state.hellfireBannerLife -= 1;
      }

      const p = state.player;
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      drawImageOrFallback(ctx, PLAYER_IMAGE, p.x, p.y, 104, 64, () => {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(-20, -20);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-20, 20);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      state.projectiles.forEach(projectile => {
        ctx.shadowColor = projectile.color;
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        if (projectile.special === 'hellfire') {
          drawFireball(ctx, projectile, now);
          return;
        } else if (projectile.trinityShot && projectile.from === 'player') {
          return;
        } else if (projectile.from === 'player') {
          ctx.roundRect(projectile.x, projectile.y - 3, 26, 6, 3);
        } else {
          ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
        }
        ctx.fill();
      });

      ctx.save();
      state.hellfireShockwaves.forEach(wave => {
        ctx.globalCompositeOperation = 'lighter';
        drawShockwave(ctx, wave);
        wave.life -= wave.decay || 0.035;
      });
      state.hellfireShockwaves = state.hellfireShockwaves.filter(wave => wave.life > 0);
      ctx.restore();

      ctx.save();
      state.hellfireParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= particle.drag || 1;
        particle.vy *= particle.drag || 1;
        if (particle.type === 'smoke') particle.vy -= 0.018;
        if (particle.type === 'debris') particle.vy += 0.035;
        particle.size = Math.max(0.1, particle.size + (particle.growth || 0));
        particle.life -= 1;
        const alpha = Math.max(0, particle.life / (particle.maxLife || particle.life || 1));
        ctx.save();
        if (particle.type === 'smoke') {
          ctx.globalAlpha = alpha * 0.16;
          ctx.fillStyle = particle.color.replace('1)', '0.62)');
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalCompositeOperation = particle.type === 'debris' ? 'source-over' : 'lighter';
          ctx.globalAlpha = alpha;
          ctx.shadowColor = particle.color;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      state.hellfireParticles = state.hellfireParticles.filter(particle => particle.life > 0).slice(-340);
      ctx.restore();

      ctx.save();
      state.trinityShockwaves.forEach(wave => {
        ctx.globalCompositeOperation = 'lighter';
        drawShockwave(ctx, wave);
        wave.life -= wave.decay || 0.04;
      });
      state.trinityShockwaves = state.trinityShockwaves.filter(wave => wave.life > 0);
      ctx.restore();

      ctx.save();
      state.trinityParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= particle.drag || 0.95;
        particle.vy *= particle.drag || 0.95;
        if (particle.type === 'debris') particle.vy += 0.035;
        if (particle.type === 'mist' || particle.type === 'smoke') particle.vy -= 0.01;
        particle.rotation = (particle.rotation || 0) + (particle.spin || 0);
        particle.size = Math.max(0.1, particle.size + (particle.growth || 0));
        particle.life -= 0.032;
        const alpha = Math.max(0, particle.life / (particle.maxLife || 1));

        ctx.save();
        if (particle.type === 'bolt') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = alpha;
          drawLightning(
            ctx,
            particle.x,
            particle.y,
            particle.endX || particle.x + particle.vx * 8,
            particle.endY || particle.y + particle.vy * 8,
            particle.color,
            particle.size,
            8,
            4
          );
        } else if (particle.type === 'iceShard') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = alpha;
          drawIceShard(ctx, particle.x, particle.y, particle.size, particle.rotation || 0, particle.color);
        } else if (particle.type === 'mist' || particle.type === 'smoke') {
          ctx.globalAlpha = alpha * (particle.type === 'mist' ? 0.14 : 0.1);
          ctx.fillStyle = particle.color.replace('1)', particle.type === 'mist' ? '0.5)' : '0.38)');
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = alpha;
          ctx.shadowColor = particle.color;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      state.trinityParticles = state.trinityParticles.filter(particle => particle.life > 0).slice(-240);
      ctx.restore();

      state.projectiles.forEach(projectile => {
        if (projectile.special === 'hellfire') drawFireball(ctx, projectile, now);
        if (projectile.trinityShot && projectile.from === 'player') drawTrinityProjectile(ctx, projectile, now);
      });

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      state.impactParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        particle.life -= 0.035;
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      state.impactParticles = state.impactParticles.filter(particle => particle.life > 0);
      ctx.restore();

      state.enemies.forEach(enemy => {
        const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;
        const shocked = enemy.status.shockedUntil && enemy.status.shockedUntil > now;
        const burning = enemy.status.burningUntil && enemy.status.burningUntil > now;
        const frame = enemy.frames ? enemy.frames[Math.floor((now / 135 + enemy.frameOffset) % enemy.frames.length)] : enemy.image;

        ctx.save();
        ctx.shadowColor = burning ? '#f97316' : shocked ? '#38bdf8' : slowed ? '#a5f3fc' : '#ef4444';
        drawImageOrFallback(ctx, frame, enemy.x, enemy.y, enemy.width, enemy.height, () => {
          ctx.fillStyle = ctx.shadowColor;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        ctx.fillStyle = '#111827';
        ctx.fillRect(enemy.x - 34, enemy.y - enemy.height / 2 - 14, 68, 4);
        ctx.fillStyle = enemy.kind === 'boss-ship' ? '#f97316' : enemy.kind === 'elite-ship' ? '#eab308' : '#22c55e';
        ctx.fillRect(enemy.x - 34, enemy.y - enemy.height / 2 - 14, 68 * Math.max(0, enemy.hp / enemy.maxHp), 4);
        ctx.textAlign = 'start';
      });

      state.floats.forEach(float => {
        ctx.globalAlpha = Math.max(0, float.life / 45);
        ctx.fillStyle = float.color;
        ctx.shadowColor = float.text.includes('CRIT') ? '#fb923c' : 'transparent';
        ctx.font = float.text.includes('CRIT') ? '900 18px Orbitron, sans-serif' : 'bold 14px monospace';
        ctx.fillText(float.text, float.x, float.y);
        ctx.globalAlpha = 1;
      });

      drawLaserSpecial(ctx);
      ctx.restore();
    };

    const handleCanvasClick = (event: MouseEvent) => {
      if (state.ended) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = ((event.clientX - rect.left) / rect.width) * WIDTH;
      const clickY = ((event.clientY - rect.top) / rect.height) * HEIGHT;
      const target = state.enemies
        .filter(enemy => enemy.hp > 0)
        .map(enemy => {
          const dx = enemy.x - clickX;
          const dy = enemy.y - clickY;
          return { enemy, distance: Math.sqrt(dx * dx + dy * dy) };
        })
        .filter(item => item.distance <= item.enemy.radius + 70)
        .sort((a, b) => a.distance - b.distance)[0]?.enemy;

      if (target) fireShot(target);
    };

    const loop = () => {
      if (state.ended) return;
      const now = performance.now();
      const keys = keysRef.current;
      const p = state.player;

      if (keys.w || keys.arrowup) p.y -= 4.5;
      if (keys.s || keys.arrowdown) p.y += 4.5;
      if (keys.a || keys.arrowleft) p.x -= 4.5;
      if (keys.d || keys.arrowright) p.x += 4.5;
      p.x = clamp(p.x, 60, WIDTH * 0.45);
      p.y = clamp(p.y, 45, HEIGHT - 45);

      if (keys[' ']) fireShot();
      if (keys.q || keys.keyc) triggerSpecial(0);
      if (keys.e || keys.keyf) triggerSpecial(1);
      if (controlsRef.current.specialOne > 0) {
        controlsRef.current.specialOne -= 1;
        triggerSpecial(0);
      }
      if (controlsRef.current.specialTwo > 0) {
        controlsRef.current.specialTwo -= 1;
        triggerSpecial(1);
      }
      updateLaserSpecial(now);
      if (state.hellfireSequence.active && !state.hellfireSequence.waitingForImpact && state.hellfireSequence.remaining > 0) {
        launchHellfireOrb();
      }
      if (state.hellfireSequence.active && state.hellfireSequence.remaining <= 0 && !state.hellfireSequence.waitingForImpact) {
        state.hellfireSequence.active = false;
      }

      if (now - state.lastSpawn > Math.max(700, 1500 - state.kills * 18)) {
        state.lastSpawn = now;
        spawnEnemy();
      }

      state.enemies.forEach(enemy => {
        const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;
        const minEnemyX = WIDTH * 0.5;
        if (enemy.x > minEnemyX) {
          enemy.x = Math.max(minEnemyX, enemy.x - enemy.speed * (slowed ? 0.45 : 1));
        }
        enemy.y += Math.sin(now / 420 + enemy.frameOffset) * (enemy.kind.includes('monster') ? 0.75 : 0.35);
        enemy.y = clamp(enemy.y, 52, HEIGHT - 52);
        fireEnemyShot(enemy);

        if (enemy.status.burningUntil && enemy.status.burningUntil > now && now - (enemy.status.lastBurnTick || 0) > 650) {
          const burn = shipStats.damage * (shipStats.conditionalBonuses.burningDamageOverTimePercent / 100);
          enemy.hp -= burn;
          enemy.status.lastBurnTick = now;
          if (burn > 0) spawnFloat(enemy.x, enemy.y - 8, `${Math.round(burn)}`, '#fb923c');
        }

        const dx = enemy.x - p.x;
        const dy = enemy.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.radius + 28) {
          const shocked = enemy.status.shockedUntil && enemy.status.shockedUntil > now;
          const skip = shocked && Math.random() * 100 < shipStats.conditionalBonuses.shockedEnemySkipChance;
          if (!skip) {
            const damage = enemy.damage * (slowed ? 1 - shipStats.conditionalBonuses.slowEnemyDamageReductionPercent / 100 : 1);
            damagePlayer(damage);
          }
          enemy.hp = 0;
        }
      });

      state.projectiles.forEach(projectile => {
        if (projectile.from === 'player' && projectile.targetId) {
          const target = state.enemies.find(enemy => enemy.id === projectile.targetId && enemy.hp > 0);
          if (target) {
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const speed = projectile.special === 'hellfire' ? Math.max(7.5, Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy)) : Math.max(8.5, Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy));
            const desiredVx = (dx / length) * speed;
            const desiredVy = (dy / length) * speed;
            projectile.vx = projectile.vx * (projectile.special === 'hellfire' ? 0.86 : 0.88) + desiredVx * (projectile.special === 'hellfire' ? 0.14 : 0.12);
            projectile.vy = projectile.vy * (projectile.special === 'hellfire' ? 0.86 : 0.88) + desiredVy * (projectile.special === 'hellfire' ? 0.14 : 0.12);
          }
        }
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        if (projectile.trinityShot && projectile.from === 'player') {
          spawnTrinityTrail(projectile);
        }

        if (projectile.special === 'hellfire') {
          const backAngle = Math.atan2(-projectile.vy, -projectile.vx);
          if (Math.random() > 0.1) {
            const offset = rand(8, 20);
            spawnSmokeParticle(
              projectile.x + Math.cos(backAngle) * offset,
              projectile.y + Math.sin(backAngle) * offset,
              Math.cos(backAngle) * rand(0.6, 2.5),
              Math.sin(backAngle) * rand(0.6, 2.5),
              rand(8, 18),
              rand(44, 82)
            );
          }
          if (Math.random() > 0.16) {
            spawnEmberParticle(
              projectile.x + Math.cos(backAngle) * rand(5, 15),
              projectile.y + Math.sin(backAngle) * rand(5, 15),
              Math.cos(backAngle) * rand(1.2, 4.4),
              Math.sin(backAngle) * rand(1.2, 4.4),
              rand(1.8, 4.4),
              rand(20, 44)
            );
          }
        }

        if (projectile.from === 'player') {
          state.enemies.forEach(enemy => {
            const dx = enemy.x - projectile.x;
            const dy = enemy.y - projectile.y;
            if (enemy.hp > 0 && Math.sqrt(dx * dx + dy * dy) < enemy.radius + (projectile.special === 'hellfire' ? 16 : 10)) {
              damageEnemy(enemy, projectile);
              if (projectile.sequence === 'hellfire') {
                state.hellfireSequence.remaining -= 1;
                state.hellfireSequence.waitingForImpact = false;
              }
              projectile.x = WIDTH + 999;
            }
          });
        } else {
          const dx = p.x - projectile.x;
          const dy = p.y - projectile.y;
          if (Math.sqrt(dx * dx + dy * dy) < 34) {
            damagePlayer(projectile.damage);
            projectile.x = -999;
          }
        }
      });

      state.enemies = state.enemies.filter(enemy => {
        if (enemy.hp <= 0) {
          state.kills += 1;
          state.earnedXp += enemy.xp;
          awardHorizonXp(enemy.xp);
          state.earnedQc += enemy.qc;
          if (isMonsterKind(enemy.kind)) {
            state.monsterDefeated = true;
            stopBattleSound(enemy.screamAudio);
          }
          if (enemy.explosionSound) playSound(enemy.explosionSound, 0.68);
          return false;
        }
        return enemy.x > -90;
      });
      state.projectiles = state.projectiles.filter(projectile => projectile.x < WIDTH + 80 && projectile.x > -80 && projectile.y > -80 && projectile.y < HEIGHT + 80);
      if (state.hellfireSequence.waitingForImpact && !state.projectiles.some(projectile => projectile.sequence === 'hellfire')) {
        state.hellfireSequence.waitingForImpact = false;
        state.hellfireSequence.remaining = Math.max(0, state.hellfireSequence.remaining - 1);
      }
      state.floats = state.floats
        .map(float => ({ ...float, y: float.y - 0.55, life: float.life - 1 }))
        .filter(float => float.life > 0);

      if (p.hp <= 0) {
        state.ended = true;
        stopAllBattleSounds();
        setHud({ hp: 0, shield: Math.max(0, p.shield), kills: state.kills, earnedXp: state.earnedXp, earnedQc: state.earnedQc, enemies: state.enemies.length, ended: true, result: 'defeat' });
        setResult('defeat');
        return;
      }

      if (state.kills >= 20 && state.monsterDefeated) {
        state.ended = true;
        stopAllBattleSounds();
        const victoryRewardScale = 1 + Math.max(0, currentDefenseBattleLevel - 1) * 0.1;
        const victoryXp = Math.round(450 * victoryRewardScale);
        const victoryQc = Math.round(35000 * victoryRewardScale);
        state.earnedXp += victoryXp;
        awardHorizonXp(victoryXp);
        state.earnedQc += victoryQc;
        setHud({ hp: p.hp, shield: p.shield, kills: state.kills, earnedXp: state.earnedXp, earnedQc: state.earnedQc, enemies: state.enemies.length, ended: true, result: 'victory' });
        setResult('victory');
        return;
      }

      draw();
      setHud({ hp: p.hp, shield: p.shield, kills: state.kills, earnedXp: state.earnedXp, earnedQc: state.earnedQc, enemies: state.enemies.length, ended: false, result: '' });
      rafRef.current = requestAnimationFrame(loop);
    };

    const canvas = canvasRef.current;
    canvas?.addEventListener('click', handleCanvasClick);
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      state.ended = true;
      canvas?.removeEventListener('click', handleCanvasClick);
      stopAllBattleSounds();
    };
  }, [shipStats, specials, horizonLevel, trinityShotEnabled, currentDefenseBattleLevel]);

  const finishResult = () => {
    if (result === 'victory') {
      onVictory({ kills: hud.kills, xp: hud.earnedXp, qc: hud.earnedQc, levelUpSfxHandled: levelUpSfxHandledRef.current });
      return;
    }
    if (result === 'defeat') {
      onDefeat();
    }
  };

  const xpPercent = horizonHud.nextXp > 0 ? Math.min(100, (horizonHud.currentXp / horizonHud.nextXp) * 100) : 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-3 backdrop-blur-xl">
      <div className="relative grid h-[94vh] w-[97vw] grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-cyan-300/25 bg-slate-950 shadow-[0_0_80px_rgba(34,211,238,0.2)]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-black/50 px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300">{t('New Earth Aerial Defense', 'Defesa Aérea da Nova Terra')}</p>
            <h3 className="truncate font-orbitron text-lg font-black uppercase text-white">{threatTitle}</h3>
          </div>
          <div className="hidden w-[480px] rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-2 lg:block">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-200">{t('Battle Level', 'Nível da Batalha')}</p>
                <p className="font-orbitron text-sm font-black uppercase text-white">
                  {currentDefenseBattleLevel}
                  <span className="ml-2 text-[10px] text-cyan-200">{difficultyLabel}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-amber-200">HORIZON LVL {horizonHud.level}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-amber-100">+{hud.earnedXp} XP</p>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/55">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-300 to-emerald-300" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} disabled={Boolean(result)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative min-h-0 overflow-hidden bg-black">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="h-full w-full" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-cyan-300/20 bg-black/55 px-4 py-3 backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">{t('Objective', 'Objetivo')}</p>
              <p className="mt-1 font-orbitron text-sm font-black uppercase text-white">{t('Neutralize 19 ships and the final monster boss', 'Neutralize 19 naves e o monstro boss final')}</p>
            </div>

            {!result && (
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-zinc-300 backdrop-blur-md">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{t('Movement', 'Movimento')}</p>
                  <p className="mt-1 font-orbitron text-[12px] font-black uppercase text-white">{t('WASD · click target · C/F specials', 'WASD · clique no alvo · C/F especiais')}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { controlsRef.current.specialOne += 1; }}
                    className="h-16 w-36 rounded-2xl border border-fuchsia-300/40 bg-fuchsia-300/15 px-3 font-orbitron text-[11px] font-black uppercase tracking-[0.16em] text-fuchsia-100 transition-all hover:bg-fuchsia-300 hover:text-black active:scale-95"
                  >
                    <span className="block text-[9px] opacity-65">C</span>
                    {SPECIAL_LABEL[specials[0]]?.[language] || t('Special 1', 'Especial 1')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { controlsRef.current.specialTwo += 1; }}
                    className="h-16 w-36 rounded-2xl border border-orange-300/40 bg-orange-300/15 px-3 font-orbitron text-[11px] font-black uppercase tracking-[0.16em] text-orange-100 transition-all hover:bg-orange-300 hover:text-black active:scale-95"
                  >
                    <span className="block text-[9px] opacity-65">F</span>
                    {SPECIAL_LABEL[specials[1]]?.[language] || t('Special 2', 'Especial 2')}
                  </button>
                </div>
              </div>
            )}

            {result && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/78 p-6 backdrop-blur-sm">
                <div className={`w-full max-w-2xl rounded-[2rem] border p-8 text-center shadow-[0_0_70px_rgba(255,255,255,0.12)] ${
                  result === 'victory'
                    ? 'border-emerald-300/40 bg-emerald-950/35'
                    : 'border-rose-400/40 bg-rose-950/35'
                }`}>
                  <p className={`font-mono text-[10px] uppercase tracking-[0.45em] ${result === 'victory' ? 'text-emerald-200' : 'text-rose-200'}`}>
                    {result === 'victory' ? t('Defense Complete', 'Defesa Concluída') : t('Defense Failed', 'Defesa Fracassou')}
                  </p>
                  <h2 className={`mt-3 font-orbitron text-5xl font-black uppercase tracking-tight ${result === 'victory' ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {result === 'victory' ? t('Victory', 'Vitória') : t('Defeat', 'Derrota')}
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-300">
                    {result === 'victory'
                      ? t('The threat was neutralized and the expedition corridor is safe again.', 'A ameaça foi neutralizada e o corredor da expedição está seguro novamente.')
                      : t('The Horizon was forced to retreat. The threat remains registered for another defense attempt.', 'A Horizon foi forçada a recuar. A ameaça permanece registrada para outra tentativa de defesa.')}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">{t('Targets', 'Alvos')}</p>
                      <p className="mt-1 font-orbitron text-2xl font-black text-white">{hud.kills} / 20</p>
                    </div>
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">XP</p>
                      <p className="mt-1 font-orbitron text-2xl font-black text-white">+{hud.earnedXp}</p>
                    </div>
                    <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-yellow-200">QC</p>
                      <p className="mt-1 font-orbitron text-2xl font-black text-white">+{hud.earnedQc.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">{t('Hull', 'Vida')}</p>
                      <p className="mt-1 font-orbitron text-2xl font-black text-white">{Math.ceil(hud.hp)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={finishResult}
                    className={`mt-7 w-full rounded-2xl px-5 py-4 font-orbitron text-sm font-black uppercase tracking-[0.25em] text-black transition-all ${
                      result === 'victory' ? 'bg-emerald-300 hover:bg-emerald-200' : 'bg-rose-300 hover:bg-rose-200'
                    }`}
                  >
                    {t('Continue', 'Continuar')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="border-l border-white/10 bg-black/55 p-4">
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-200">{t('Hull', 'Vida')}</p>
                <p className="font-orbitron text-xl font-black text-white">{Math.ceil(hud.hp)}</p>
              </div>
              <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-sky-200">{t('Shield', 'Escudo')}</p>
                <p className="font-orbitron text-xl font-black text-white">{Math.ceil(hud.shield)}</p>
              </div>
              <div className="rounded-xl border border-red-300/20 bg-red-300/10 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-red-200">{t('Targets', 'Alvos')}</p>
                <p className="font-orbitron text-xl font-black text-white">{hud.kills} / 20</p>
              </div>
              <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-amber-200">Horizon XP</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-amber-100">LVL {horizonHud.level}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/55">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-300 to-emerald-300" style={{ width: `${xpPercent}%` }} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300">+{hud.earnedXp} XP · +{hud.earnedQc.toLocaleString()} QC</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{t('Controls', 'Controles')}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-300">WASD · {t('Click target', 'Clique no alvo')} · C · F</p>
                <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">{t('Projectiles curve slightly toward the selected enemy.', 'Os disparos fazem uma leve curva até o inimigo selecionado.')}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{t('Specials', 'Especiais')}</p>
                <div className="mt-2 space-y-1">
                  {specials.slice(0, 2).map((special, index) => (
                    <p key={special} className="font-mono text-[10px] uppercase tracking-widest text-zinc-300">
                      {index === 0 ? 'C' : 'F'} · {SPECIAL_LABEL[special]?.[language] || special}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewEarthDefenseBattle;
