'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { BattleShipComputedStats, getHorizonXpForNextLevel, MAX_HORIZON_LEVEL } from '@/lib/colony-cards';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';
import BattlePauseDialog from './BattlePauseDialog';

export type DefenseSpecialId = 'apocalypse-laser' | 'hellfire-barrage' | 'thor-oath' | 'special-slot-4';
type EnemyKind = 'common-ship' | 'elite-ship' | 'boss-ship' | 'monster-1' | 'monster-2';
type LaserState = 'idle' | 'charge' | 'firing' | 'collapse';
type ThorPhase = 'idle' | 'prelude' | 'small' | 'big' | 'ending' | 'collapse';
type HellfireSequence = {
  active: boolean;
  remaining: number;
  waitingForImpact: boolean;
};

type SpecialHudSnapshot = {
  now: number;
  effectActive: boolean;
  cooldowns: Record<string, number>;
};

const REGULAR_ENEMIES_BEFORE_FINAL_BOSS = 20;
const BOSS_BASE_HP_MULTIPLIER = 8;
const BOSS_ABSORB_SHIELD_MULTIPLIER = 5;

interface NewEarthDefenseBattleProps {
  language: 'en' | 'pt';
  shipStats: BattleShipComputedStats;
  horizonLevel: number;
  horizonMaxLevel?: number;
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
  bossesDefeated?: number;
  xp: number;
  qc: number;
  levelUpSfxHandled?: boolean;
  perfect?: boolean;
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
  shield: number;
  maxShield: number;
  speed: number;
  radius: number;
  width: number;
  height: number;
  damage: number;
  status: EnemyStatus;
  attackCooldown: number;
  image: string;
  frames?: string[];
  spriteSheet?: {
    src: string;
    columns: number;
    rows: number;
    frameCount: number;
    fps: number;
  };
  shootSound: string;
  screamSound?: string;
  screamAudio?: HTMLAudioElement | null;
  engineAudio?: HTMLAudioElement | null;
  explosionSound?: string;
  frameOffset: number;
  visualDx?: number;
  visualDy?: number;
  actionFrame?: number;
  actionFrameUntil?: number;
  visualState?: string;
  visualStateStart?: number;
  xp: number;
  qc: number;
};

type Projectile = {
  id: number;
  from: 'player' | 'enemy';
  visualType?: 'common' | 'elite' | 'boss';
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
  maxLife: number;
  size: number;
  shadowColor?: string;
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

type AaaFlash = {
  color: string;
  life: number;
  maxLife: number;
  intensity: number;
};

type AaaGlow = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color1: string;
  color2: string;
  decay: number;
};

type AaaStreak = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  width: number;
  color: string;
  drag: number;
};

type AaaSmokeRing = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  grow: number;
};

type AaaDebris = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  drag: number;
  gravity: number;
  bounces: number;
  maxBounces: number;
  trail: { x: number; y: number }[];
};

type BattleCinematic = {
  active: boolean;
  target: 'boss' | 'player' | '';
  x: number;
  y: number;
  start: number;
  duration: number;
};

type ThorPoint = { x: number; y: number };
type ThorBoltBranch = { fromIdx: number; side: number; endX: number; endY: number };

type ThorBolt = {
  anchors: { x1: number; y1: number; x2: number; y2: number };
  branches: ThorBoltBranch[];
  life: number;
  maxLife: number;
  width: number;
  color: string;
};

type ThorTornado = {
  x: number;
  y: number;
  radius: number;
  height: number;
  spin: number;
  kind: 'small' | 'big';
  alive: boolean;
  birthScale: number;
  seed: number;
  lastDir?: number;
  vx?: number;
  vy?: number;
};

type ThorCloud = {
  x: number; y: number; w: number; h: number; spd: number; alpha: number; swirl: number; layer: number;
};
type ThorRainDrop = {
  x: number; y: number; len: number; spd: number; alpha: number;
};
type ThorDebris = {
  x: number; y: number; vx: number; vy: number; sz: number; rot: number; vr: number; life: number; decay: number; color: string; target?: ThorTornado;
};
type ThorSpark = {
  x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string;
};
type ThorEnergyArc = {
  x: number; y: number; ex: number; ey: number; life: number; decay: number; color: string;
};
type ThorParticle = {
  x: number; y: number; vx: number; vy: number; life: number; decay?: number; color: string; type?: string;
  sz?: number;
  size?: number;
  maxLife?: number;
  drag?: number;
  growth?: number;
  rotation?: number;
  spin?: number;
};

type ThorRing = {
  x: number;
  y: number;
  radius: number;
  life: number;
  angle: number;
  color: string;
};

type BlizzardState = {
  active: boolean;
  start: number;
  duration: number;
  blocksSpawned: number;
  tickAccum: number;
  tickInterval: number;
  blockAccum: number;
  blockInterval: number;
  coverAlpha: number;
  windPhase: number;
  flashAlpha: number;
  shake: number;
};

type BlizzardSnowflake = {
  x: number; y: number; sz: number; spd: number; wx: number; alpha: number; phase: number; drift: number;
};

type BlizzardIceBlock = {
  x: number;
  y: number;
  sz: number;
  vy: number;
  exploded: boolean;
  explodeY: number;
  life: number;
  rot: number;
  facets: Array<{ ax: number; ay: number; bx: number; by: number; alpha: number }>;
};

type BlizzardShard = {
  x: number; y: number; vx: number; vy: number; sz: number; rot: number; vr: number; life: number; decay: number; color: string;
};

type BlizzardCrystal = {
  x: number; y: number; vx: number; vy: number; sz: number; rot: number; vr: number; life: number; decay: number; color: string;
};

type BlizzardSpark = {
  x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string;
};

type BlizzardShockwave = {
  x: number; y: number; radius: number; maxRadius: number; life: number; color: string; width: number; oval?: boolean;
};

type EnemyBlueprint = {
  kind: EnemyKind;
  image: string;
  frames?: string[];
  spriteSheet?: Enemy['spriteSheet'];
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
const AIRPLANE_ENEMY_ENGINE_SOUND = '/assets/rota4/SFX_new_land/airplane_enemys_sounds.ogg';
const AIRPLANE_PLAYER_ENGINE_SOUND = '/assets/rota4/SFX_new_land/airplane_player_sounds.ogg';
const ROUTE4_COMMON_ENEMY_EXPLOSION_SOUNDS = [
  '/assets/rota4/SFX_new_land/enemy_explosion_cap_4.ogg',
  '/assets/rota4/SFX_new_land/enemy_explosion_cap4_2.ogg',
];
const ROUTE4_ELITE_ENEMY_EXPLOSION_SOUND = '/assets/rota4/SFX_new_land/explosion_elite_cap4.ogg';
const ROUTE4_ENEMY_VARIANT_SHOT_SOUNDS = [
  '/audio/sfx/shoot_enemy.ogg',
  '/audio/sfx/shoot_player.ogg',
];

const BATTLE_BACKGROUNDS = [
  `${ASSET_BASE}/backgrounds/day/rt4_background_day.webp`,
  `${ASSET_BASE}/backgrounds/night/rt4_background_night.webp`,
  `${ASSET_BASE}/backgrounds/winter/rt4_background_winter.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_day_2.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_day_3.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_day_4.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_night_2.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_night_3.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_night_4.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_night_5.webp`,
  `${ASSET_BASE}/backgrounds/multiple/rt4_background_winter_2.webp`,
];
const RESULT_VICTORY_BACKGROUNDS = [
  '/assets/rota4/layout_cap4/bg_victory_battle_cap4_1.webp',
  '/assets/rota4/layout_cap4/bg_victory_battle_cap4_2.webp',
  '/assets/rota4/layout_cap4/bg_victory_battle_cap4_3.webp',
];
const RESULT_DEFEAT_BACKGROUND = '/assets/rota4/layout_cap4/bg_lose_battle_cap4_.webp';
const RESULT_MODAL_DELAY_MS = 1500;

const PLAYER_IMAGE = `${ASSET_BASE}/player/horizon/horizon.webp`;
const PLAYER_SPRITESHEET = `${ASSET_BASE}/player/horizon/horizon_12pos_spritesheet.webp`;
const PLAYER_SPRITE_FRAME_WIDTH = 370;
const PLAYER_SPRITE_FRAME_HEIGHT = 234;
const PLAYER_DRAW_WIDTH = 118;
const PLAYER_DRAW_HEIGHT = 75;
const PLAYER_IDLE_FRAMES = [0, 3];
const PLAYER_DESCEND_FRAMES = [11, 1, 2];
const PLAYER_ASCEND_FRAMES = [4, 5, 6, 7];
const PLAYER_ASCEND_RELEASE_FRAME = 8;
const PLAYER_BACK_FRAMES = [9, 10];
const PLAYER_FRAME_MS = 120;
const PLAYER_ASCEND_RELEASE_MS = 220;
const THOR_SPECIAL_SFX_BASE = '/assets/rota4/SFX_new_land/special thor';
const BLIZZARD_SPECIAL_SFX_BASE = '/assets/rota4/SFX_new_land/special blizzard';
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
  thorSpecial: `${THOR_SPECIAL_SFX_BASE}/thunder_special.ogg`,
  thorTornado: `${THOR_SPECIAL_SFX_BASE}/tornado_thor.ogg`,
  thorThunder: [
    `${THOR_SPECIAL_SFX_BASE}/thunder_a.ogg`,
    `${THOR_SPECIAL_SFX_BASE}/thunder_b.ogg`,
    `${THOR_SPECIAL_SFX_BASE}/thunder_c.ogg`,
  ],
  blizzardSpecial: `${BLIZZARD_SPECIAL_SFX_BASE}/blizard_special.ogg`,
  blizzardIceExplosions: [
    `${BLIZZARD_SPECIAL_SFX_BASE}/ice_explosion_1.ogg`,
    `${BLIZZARD_SPECIAL_SFX_BASE}/ice_explosion_2.ogg`,
    `${BLIZZARD_SPECIAL_SFX_BASE}/ice_explosion_3.ogg`,
    `${BLIZZARD_SPECIAL_SFX_BASE}/ice_explosion_4.ogg`,
  ],
};

const randomThorThunderSfx = () => (
  PLAYER_SOUNDS.thorThunder[Math.floor(Math.random() * PLAYER_SOUNDS.thorThunder.length)]
);

const playBlizzardExplosionSfx = () => {
  const sfx = pick(PLAYER_SOUNDS.blizzardIceExplosions);
  playSound(sfx, 1);
  window.setTimeout(() => playSound(sfx, 0.72), 18);
};

const playRoute4EnemyExplosionSfx = (enemy: Pick<Enemy, 'kind' | 'explosionSound'>) => {
  if (enemy.explosionSound) {
    playSound(enemy.explosionSound, isMonsterKind(enemy.kind) ? 1 : 0.82);
    if (isMonsterKind(enemy.kind)) {
      window.setTimeout(() => playSound(enemy.explosionSound!, 0.58), 85);
    }
    return;
  }

  if (enemy.kind === 'elite-ship') {
    playSound(ROUTE4_ELITE_ENEMY_EXPLOSION_SOUND, 0.78);
    return;
  }

  if (enemy.kind === 'common-ship') {
    playSound(pick(ROUTE4_COMMON_ENEMY_EXPLOSION_SOUNDS), 0.74);
  }
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

const MONSTER_1_MOTION_SPRITESHEET = `${ASSET_BASE}/enemys/monsters/monster 1/m1_8pos_spritesheet.webp`;
const MONSTER_1_FRAME_MS = 115;
const MONSTER_1_ASCEND_FRAMES = [3, 4, 5, 6];
const MONSTER_1_DESCEND_FRAME = 7;
const MONSTER_1_FORWARD_FRAME = 1;
const MONSTER_1_SHOOT_FRAME = 2;
const MONSTER_1_NEUTRAL_FRAME = 0;

const MONSTER_2_FRAMES = [
  `${ASSET_BASE}/enemys/monsters/monster 2/m3_neutral.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m2_forward.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m4_up.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m2_down.webp`,
  `${ASSET_BASE}/enemys/monsters/monster 2/m2_backward.webp`,
];

const MONSTER_2_MOTION_SPRITESHEET = `${ASSET_BASE}/enemys/monsters/monster 2/boss1_spritesheet_30fps_motion_6x6.png`;

const SPECIAL_LABEL: Record<DefenseSpecialId, Record<'en' | 'pt', string>> = {
  'apocalypse-laser': { en: 'Horizon Laser', pt: 'Horizon Laser' },
  'hellfire-barrage': { en: 'Horizon Barrage', pt: 'Horizon Barrage' },
  'thor-oath': { en: 'Thor Oath', pt: 'Juramento de Thor' },
  'special-slot-4': { en: 'Blizzard', pt: 'Blizzard' },
};

const HORIZON_LASER_DAMAGE_INTERVAL = 1000 / 3;
const HORIZON_LASER_DAMAGE_RADIUS = 72;
const HORIZON_LASER_DAMAGE_MULTIPLIER = 3.7;
const HORIZON_LASER_FINAL_EXPLOSION_MULTIPLIER = 30;
const HORIZON_BARRAGE_DAMAGE_MULTIPLIER = 3.6;
const HORIZON_BARRAGE_AREA_DAMAGE_MULTIPLIER = 2;
const HORIZON_SPECIAL_BASE_COOLDOWN = 60000;
const HORIZON_SPECIAL_MIN_COOLDOWN = 3000;

const getHorizonSpecialCooldownDuration = (reductionPercent: number) => {
  const reduction = Math.max(0, Math.min(90, reductionPercent || 0));
  return Math.max(HORIZON_SPECIAL_MIN_COOLDOWN, HORIZON_SPECIAL_BASE_COOLDOWN * (1 - reduction / 100));
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

const getSequenceFrame = (frames: number[], startedAt: number, now: number, loop = true) => {
  if (frames.length === 0) return 0;
  const elapsedFrames = Math.max(0, Math.floor((now - startedAt) / PLAYER_FRAME_MS));
  const index = loop ? elapsedFrames % frames.length : Math.min(frames.length - 1, elapsedFrames);
  return frames[index];
};

const getPlayerFrameIndex = (
  keys: Record<string, boolean>,
  now: number,
  spriteState: React.MutableRefObject<{
    movement: string;
    startedAt: number;
    wasMovingUp: boolean;
    ascendReleaseUntil: number;
  }>
) => {
  const movingUp = Boolean(keys.w || keys.arrowup);
  const movingDown = Boolean(keys.s || keys.arrowdown);
  const movingBack = Boolean(keys.a || keys.arrowleft);
  const state = spriteState.current;
  let movement = 'idle';

  if (movingBack) movement = 'back';
  else if (movingUp) movement = 'ascend';
  else if (movingDown) movement = 'descend';
  else if (state.wasMovingUp) movement = 'ascend-release';

  if (movement !== state.movement) {
    state.movement = movement;
    state.startedAt = now;
    if (movement === 'ascend-release') {
      state.ascendReleaseUntil = now + PLAYER_ASCEND_RELEASE_MS;
    }
  }

  state.wasMovingUp = movingUp;

  if (movement === 'ascend') return getSequenceFrame(PLAYER_ASCEND_FRAMES, state.startedAt, now, false);
  if (movement === 'descend') return getSequenceFrame(PLAYER_DESCEND_FRAMES, state.startedAt, now);
  if (movement === 'back') return getSequenceFrame(PLAYER_BACK_FRAMES, state.startedAt, now);
  if (movement === 'ascend-release' && now < state.ascendReleaseUntil) return PLAYER_ASCEND_RELEASE_FRAME;
  if (movement === 'ascend-release') {
    state.movement = 'idle';
    state.startedAt = now;
  }

  return getSequenceFrame(PLAYER_IDLE_FRAMES, state.startedAt, now);
};

const getMonster1FrameIndex = (enemy: Enemy, now: number) => {
  if (enemy.actionFrame !== undefined && (enemy.actionFrameUntil || 0) > now) {
    return enemy.actionFrame;
  }

  const visualDx = enemy.visualDx || 0;
  const visualDy = enemy.visualDy || 0;
  let state = 'neutral';

  if (visualDy < -0.18) state = 'ascend';
  else if (visualDy > 0.18) state = 'descend';
  else if (visualDx < -0.08) state = 'forward';

  if (enemy.visualState !== state) {
    enemy.visualState = state;
    enemy.visualStateStart = now;
  }

  if (state === 'ascend') {
    return getSequenceFrame(MONSTER_1_ASCEND_FRAMES, enemy.visualStateStart || now, now, false);
  }

  if (state === 'descend') return MONSTER_1_DESCEND_FRAME;
  if (state === 'forward') return MONSTER_1_FORWARD_FRAME;
  return MONSTER_1_NEUTRAL_FRAME;
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

const playLoopSound = (src: string, volume = 0.55) => {
  if (typeof Audio === 'undefined') return null;
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    audioCache.set(src, audio);
  }
  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.volume = volume;
  instance.loop = true;
  activeAudioInstances.add(instance);
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

const stopLoopingBattleSounds = () => {
  activeAudioInstances.forEach(audio => {
    if (!audio.loop) return;
    audio.pause();
    audio.currentTime = 0;
    activeAudioInstances.delete(audio);
  });
};

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const isMonsterKind = (kind: EnemyKind) => kind === 'monster-1' || kind === 'monster-2';
const enemyShotSoundFor = (enemy: Enemy) => (
  enemy.kind === 'common-ship' || enemy.kind === 'elite-ship'
    ? pick(ROUTE4_ENEMY_VARIANT_SHOT_SOUNDS)
    : enemy.shootSound
);

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
          image: MONSTER_1_MOTION_SPRITESHEET,
          spriteSheet: {
            src: MONSTER_1_MOTION_SPRITESHEET,
            columns: 8,
            rows: 1,
            frameCount: 8,
            fps: 10,
          },
          shootSound: `${ASSET_BASE}/enemys/monsters/monster 1/shoot_m1.ogg`,
          screamSound: `${ASSET_BASE}/enemys/monsters/monster 1/scream_m1.ogg`,
          explosionSound: `${ASSET_BASE}/enemys/monsters/monster 1/explosion_m1.ogg`,
          hp: Math.round((2500 + kills * 52) * BOSS_BASE_HP_MULTIPLIER),
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
          image: MONSTER_2_MOTION_SPRITESHEET,
          spriteSheet: {
            src: MONSTER_2_MOTION_SPRITESHEET,
            columns: 6,
            rows: 6,
            frameCount: 30,
            fps: 30,
          },
          shootSound: `${ASSET_BASE}/enemys/monsters/monster 2/shoot_m2.ogg`,
          screamSound: `${ASSET_BASE}/enemys/monsters/monster 2/scream_m2.ogg`,
          explosionSound: `${ASSET_BASE}/enemys/monsters/monster 2/explosion_m2.ogg`,
          hp: Math.round((2700 + kills * 54) * BOSS_BASE_HP_MULTIPLIER),
          damage: 134,
          speed: 0.44,
          radius: 62,
          width: 172,
          height: 136,
          xp: 560,
          qc: 78000,
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
  horizonMaxLevel = MAX_HORIZON_LEVEL,
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
  const playerSpriteRef = useRef({
    movement: 'idle',
    startedAt: 0,
    wasMovingUp: false,
    ascendReleaseUntil: 0,
  });
  const stateRef = useRef({
    player: { x: 120, y: HEIGHT / 2, hp: shipStats.health, shield: shipStats.shield },
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    floats: [] as FloatText[],
    lastShot: 0,
    lastSpawn: 0,
    kills: 0,
    regularEnemiesSpawned: 0,
    regularEnemiesDefeated: 0,
    earnedXp: 0,
    earnedQc: 0,
    nextId: 1,
    ended: false,
    specialCooldowns: {} as Record<string, number>,
    monsterSpawned: false,
    monsterDefeated: false,
    bossesDefeated: 0,
    laserState: 'idle' as LaserState,
    laserStateStart: 0,
    laserImpactPos: { x: 0, y: 0 },
    laserParticles: [] as LaserParticle[],
    laserEmbers: [] as LaserEmber[],
    impactParticles: [] as LaserEmber[],
    aaaFlashes: [] as AaaFlash[],
    aaaGlows: [] as AaaGlow[],
    aaaStreaks: [] as AaaStreak[],
    aaaSmokeRings: [] as AaaSmokeRing[],
    aaaDebris: [] as AaaDebris[],
    aaaShake: 0,
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
    thorPhase: 'idle' as ThorPhase,
    thorPhaseStart: 0,
    thorStart: 0,
    thorLastUpdate: 0,
    thorNextBolt: 0,
    thorNextFarBolt: 0,
    thorTickSmall: 0,
    thorTickBig: 0,
    thorColumn: 0,
    thorDarkness: 0,
    thorFinalDone: false,
    thorSmallTornados: [] as ThorTornado[],
    thorBigTornado: null as ThorTornado | null,
    thorBolts: [] as ThorBolt[],
    thorFarBolts: [] as ThorBolt[],
    thorParticles: [] as ThorParticle[],
    thorDebris: [] as ThorDebris[],
    thorSparks: [] as ThorSpark[],
    thorEnergyArcs: [] as ThorEnergyArc[],
    thorClouds: [] as ThorCloud[],
    thorRainDrops: [] as ThorRainDrop[],
    thorShockwaves: [] as Shockwave[],
    thorRings: [] as ThorRing[],
    thorFlashAlpha: 0,
    thorShake: 0,
    blizzard: {
      active: false,
      start: 0,
      duration: 8000,
      blocksSpawned: 0,
      tickAccum: 0,
      tickInterval: 1000,
      blockAccum: 0,
      blockInterval: 2000,
      coverAlpha: 0,
      windPhase: 0,
      flashAlpha: 0,
      shake: 0,
    } as BlizzardState,
    blizzardIceBlocks: [] as BlizzardIceBlock[],
    blizzardSnowflakes: [] as BlizzardSnowflake[],
    blizzardShards: [] as BlizzardShard[],
    blizzardCrystals: [] as BlizzardCrystal[],
    blizzardSparks: [] as BlizzardSpark[],
    blizzardShockwaves: [] as BlizzardShockwave[],
    pendingResult: '' as 'victory' | 'defeat' | '',
    pendingResultAt: 0,
    cinematic: { active: false, target: '', x: WIDTH / 2, y: HEIGHT / 2, start: 0, duration: RESULT_MODAL_DELAY_MS } as BattleCinematic,
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
  const [specialHud, setSpecialHud] = useState<SpecialHudSnapshot>({ now: 0, effectActive: false, cooldowns: {} });
  const [result, setResult] = useState<'victory' | 'defeat' | ''>('');
  const [resultVisible, setResultVisible] = useState(false);
  const [resultBackground, setResultBackground] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const t = (en: string, pt: string) => language === 'pt' ? pt : en;
  const difficultyLabel = getDefenseDifficultyLabel(currentDefenseBattleLevel, language);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResultVisible(false);
      if (!result) {
        setResultBackground('');
        return;
      }

      setResultBackground(result === 'victory' ? pick(RESULT_VICTORY_BACKGROUNDS) : RESULT_DEFEAT_BACKGROUND);
      setResultVisible(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [result]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !result) {
        event.preventDefault();
        setIsPaused(prev => {
          const next = !prev;
          isPausedRef.current = next;
          if (next) keysRef.current = {};
          return next;
        });
        return;
      }
      if (isPausedRef.current) return;
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
  }, [result]);

  useEffect(() => {
    const state = stateRef.current;
    state.player.hp = shipStats.health;
    state.player.shield = shipStats.shield;
    state.enemies = [];
    state.projectiles = [];
    state.floats = [];
    state.kills = 0;
    state.regularEnemiesSpawned = 0;
    state.regularEnemiesDefeated = 0;
    state.earnedXp = 0;
    state.earnedQc = 0;
    state.lastShot = 0;
    state.lastSpawn = 0;
    state.ended = false;
    state.monsterSpawned = false;
    state.monsterDefeated = false;
    state.bossesDefeated = 0;
    state.laserState = 'idle';
    state.laserStateStart = 0;
    state.laserImpactPos = { x: 0, y: 0 };
    state.laserParticles = [];
    state.laserEmbers = [];
    state.impactParticles = [];
    state.aaaFlashes = [];
    state.aaaGlows = [];
    state.aaaStreaks = [];
    state.aaaSmokeRings = [];
    state.aaaDebris = [];
    state.aaaShake = 0;
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
    state.thorPhase = 'idle';
    state.thorPhaseStart = 0;
    state.thorStart = 0;
    state.thorLastUpdate = 0;
    state.thorNextBolt = 0;
    state.thorNextFarBolt = 0;
    state.thorTickSmall = 0;
    state.thorTickBig = 0;
    state.thorColumn = 0;
    state.thorDarkness = 0;
    state.thorFinalDone = false;
    state.thorSmallTornados = [];
    state.thorBigTornado = null;
    state.thorBolts = [];
    state.thorFarBolts = [];
    state.thorParticles = [];
    state.thorDebris = [];
    state.thorSparks = [];
    state.thorEnergyArcs = [];
    
    state.thorClouds = [];
    for (let i = 0; i < 42; i++) {
      state.thorClouds.push({
        x: Math.random() * 960,
        y: 4 + Math.random() * 180,
        w: 100 + Math.random() * 300,
        h: 28 + Math.random() * 44,
        spd: 2 + Math.random() * 9,
        alpha: 0.04 + Math.random() * 0.1,
        swirl: Math.random() * Math.PI * 2,
        layer: i % 3
      });
    }
    
    state.thorRainDrops = [];
    for (let i = 0; i < 180; i++) {
      state.thorRainDrops.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        len: 6 + Math.random() * 14,
        spd: 8 + Math.random() * 8,
        alpha: 0.04 + Math.random() * 0.09
      });
    }

    state.thorShockwaves = [];
    state.thorRings = [];
    state.thorFlashAlpha = 0;
    state.thorShake = 0;
    state.blizzard = {
      active: false,
      start: 0,
      duration: 8000,
      blocksSpawned: 0,
      tickAccum: 0,
      tickInterval: 1000,
      blockAccum: 0,
      blockInterval: 2000,
      coverAlpha: 0,
      windPhase: 0,
      flashAlpha: 0,
      shake: 0,
    };
    state.blizzardIceBlocks = [];
    state.blizzardSnowflakes = [];
    for (let i = 0; i < 320; i++) {
      state.blizzardSnowflakes.push({
        x: WIDTH * 0.5 + Math.random() * WIDTH * 0.5,
        y: Math.random() * HEIGHT,
        sz: 0.8 + Math.random() * 3,
        spd: 1.2 + Math.random() * 3,
        wx: -2.2 + Math.random() * 1.8,
        alpha: 0.12 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        drift: 0.8 + Math.random() * 1.6,
      });
    }
    state.blizzardShards = [];
    state.blizzardCrystals = [];
    state.blizzardSparks = [];
    state.blizzardShockwaves = [];
    state.pendingResult = '';
    state.pendingResultAt = 0;
    state.cinematic = { active: false, target: '', x: WIDTH / 2, y: HEIGHT / 2, start: 0, duration: RESULT_MODAL_DELAY_MS };
    horizonProgressRef.current = { level: horizonLevel, currentXp: horizonXp, nextXp: horizonNextXp };
    levelUpSfxHandledRef.current = false;
    window.setTimeout(() => setHorizonHud({ level: horizonLevel, currentXp: horizonXp, nextXp: horizonNextXp }), 0);
    playLoopSound(AIRPLANE_PLAYER_ENGINE_SOUND, 0.42);

    const spawnFloat = (x: number, y: number, text: string, color: string, options?: { life?: number; size?: number; shadowColor?: string }) => {
      const life = (options?.life ?? 45) + 6;
      state.floats.push({
        id: state.nextId++,
        x,
        y,
        text,
        color,
        life,
        maxLife: life,
        size: options?.size ?? (text.includes('CRIT') ? 18 : 14),
        shadowColor: options?.shadowColor,
      });
    };

    const updateSpecialHud = (now: number) => {
      const effectActive = state.laserState !== 'idle'
        || state.hellfireSequence.active
        || state.thorPhase !== 'idle'
        || state.blizzard.active
        || state.blizzard.coverAlpha > 0.01
        || state.blizzardIceBlocks.length > 0
        || state.blizzardShockwaves.length > 0;
      setSpecialHud({ now, effectActive, cooldowns: { ...state.specialCooldowns } });
    };

    const awardHorizonXp = (amount: number) => {
      const safeAmount = Math.max(0, Math.floor(amount));
      if (safeAmount <= 0) return;


  const safeHorizonMaxLevel = Math.max(1, Math.min(MAX_HORIZON_LEVEL, Math.floor(Number(horizonMaxLevel) || MAX_HORIZON_LEVEL)));
      let { level, currentXp, nextXp } = horizonProgressRef.current;
      if (level >= safeHorizonMaxLevel) {
        horizonProgressRef.current = { level: safeHorizonMaxLevel, currentXp: 0, nextXp: 0 };
        setHorizonHud(horizonProgressRef.current);
        return;
      }

      currentXp += safeAmount;
      let leveledUp = false;

      while (level < safeHorizonMaxLevel && nextXp > 0 && currentXp >= nextXp) {
        currentXp -= nextXp;
        level += 1;
        nextXp = level >= safeHorizonMaxLevel ? 0 : getHorizonXpForNextLevel(level);
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

    const aaaPalettes = {
      common: ['#67e8f9', '#22d3ee', '#e0f2fe', '#60a5fa', '#bae6fd'],
      elite: ['#facc15', '#f97316', '#fff7ed', '#fb7185', '#fde68a'],
      boss: ['#c084fc', '#a855f7', '#f0abfc', '#ffffff', '#fb7185', '#e879f9'],
      fire: ['#fb7185', '#fb923c', '#facc15', '#ffffff', '#fcd34d'],
      laser: ['#22d3ee', '#e879f9', '#ffffff', '#f0abfc', '#a5f3fc'],
      spark: ['#ffffff', '#fef9c3', '#fde68a'],
    };

    const colorWithAlpha = (color: string, alpha: number) => {
      const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
      if (!rgbaMatch) return color;
      const [r, g, b] = rgbaMatch[1].split(',').map(part => part.trim());
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const addAaaTrauma = (amount: number) => {
      state.aaaShake = Math.max(state.aaaShake, amount);
    };

    const addAaaFlash = (color: string, life = 0.18, intensity = 1) => {
      state.aaaFlashes.push({ color, life, maxLife: life, intensity: clamp(intensity, 0, 1) });
    };

    const addAaaGlow = (
      x: number,
      y: number,
      maxRadius: number,
      color1: string,
      color2 = 'rgba(255,80,40,0)',
      life = 0.55,
      decay = 1
    ) => {
      state.aaaGlows.push({ x, y, radius: 0, maxRadius, life, maxLife: life, color1, color2, decay });
    };

    const addAaaShockwave = (
      x: number,
      y: number,
      maxRadius: number,
      color: string,
      width = 4,
      decay = 0.05,
      radius = 3
    ) => {
      state.hellfireShockwaves.push({ x, y, radius, maxRadius, life: 1, decay, color, width });
    };

    const addAaaStreak = (x: number, y: number, angle: number, speed: number, color: string, length = rand(18, 55), width = rand(1, 2.5)) => {
      state.aaaStreaks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.1, 0.28),
        maxLife: 0.28,
        length,
        width,
        color,
        drag: 0.92,
      });
    };

    const addAaaSmokeRing = (x: number, y: number, scale = 1) => {
      const life = rand(1, 1.9);
      state.aaaSmokeRings.push({
        x,
        y,
        vx: rand(-0.8, 0.8) * scale,
        vy: rand(-1.8, -0.35) * scale,
        radius: rand(12, 34) * scale,
        life,
        maxLife: life,
        color: 'rgba(80,90,100,0.26)',
        grow: rand(7, 22) * scale,
      });
    };

    const addAaaDebris = (x: number, y: number, scale = 1, palette: string[] = ['#94a3b8', '#cbd5e1', '#64748b', '#f97316']) => {
      const life = rand(1.2, 2.8);
      state.aaaDebris.push({
        x,
        y,
        vx: rand(-13, 13) * scale,
        vy: rand(-17, -3) * scale,
        life,
        maxLife: life,
        size: rand(2, 7) * scale,
        color: pick(palette),
        rotation: rand(0, Math.PI * 2),
        spin: rand(-0.32, 0.32),
        drag: 0.985,
        gravity: 0.38,
        bounces: 0,
        maxBounces: Math.floor(rand(0, 3)),
        trail: [],
      });
    };

    const addAaaBurst = (x: number, y: number, palette: string[], count: number, power: number, scale = 1, coneAngle?: number) => {
      const finalCount = Math.round(count);
      for (let i = 0; i < finalCount; i++) {
        const spread = coneAngle === undefined ? Math.PI * 2 : 1.42;
        const angle = coneAngle === undefined ? rand(0, Math.PI * 2) : coneAngle + rand(-spread, spread);
        const speed = rand(power * 0.3, power) * scale;
        state.impactParticles.push({
          x: x + rand(-8, 8) * scale,
          y: y + rand(-8, 8) * scale,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(0.36, 1.1),
          maxLife: 1.1,
          size: rand(1.8, 7) * scale,
          drag: rand(0.928, 0.972),
          growth: rand(-0.01, 0.035),
          rotation: rand(0, Math.PI),
          spin: rand(-0.24, 0.24),
          color: pick(palette),
        });
      }
    };

    const addAaaSmoke = (x: number, y: number, count: number, scale = 1) => {
      for (let i = 0; i < count; i++) {
        spawnSmokeParticle(
          x + rand(-22, 22) * scale,
          y + rand(-18, 18) * scale,
          rand(-2.5, 2.5) * scale,
          rand(-3.2, 0.8) * scale,
          rand(18, 44) * scale,
          rand(58, 122)
        );
        addAaaSmokeRing(x + rand(-12, 12) * scale, y + rand(-8, 8) * scale, scale);
      }
    };

    const addAaaMetalSparks = (x: number, y: number, count: number, incomingAngle: number, power: number, scale = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = incomingAngle + Math.PI + rand(-0.9, 0.9);
        const speed = rand(power * 0.5, power * 1.4) * scale;
        addAaaStreak(x, y, angle, speed, pick(aaaPalettes.spark), rand(20, 60) * scale, rand(0.8, 2) * scale);
      }
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
    const easeInOut = (value: number) => value * value * (3 - 2 * value);

    const createThorTornado = (index: number, kind: 'small' | 'big' = 'small'): ThorTornado => {
      if (kind === 'big') {
        return {
          x: WIDTH * 0.72,
          y: HEIGHT * 0.52,
          radius: 138,
          height: 360,
          spin: Math.random() * Math.PI * 2,
          kind,
          alive: true,
          birthScale: 0.05,
          seed: rand(0, 10),
          lastDir: 0,
        };
      }
      return {
        x: WIDTH * (0.58 + index * 0.13),
        y: HEIGHT * (0.45 + Math.sin(index * 1.7) * 0.16),
        radius: 54 + index * 8,
        height: 220 + index * 20,
        spin: Math.random() * Math.PI * 2,
        kind,
        alive: true,
        birthScale: 0.05,
        seed: rand(0, 10),
        vx: rand(-40, 40),
        vy: rand(-60, 60),
        lastDir: 0,
      };
    };

    const buildLightningPoints = (x1: number, y1: number, x2: number, y2: number, depth = 0): ThorPoint[] => {
      const points: ThorPoint[] = [{ x: x1, y: y1 }];
      const segments = 10 + Math.floor(Math.random() * 8);
      for (let i = 1; i < segments; i++) {
        const progress = i / segments;
        const baseX = x1 + (x2 - x1) * progress;
        const baseY = y1 + (y2 - y1) * progress;
        const chaos = (1 - Math.abs(0.5 - progress)) * (54 - depth * 13);
        points.push({ x: baseX + rand(-chaos * 0.5, chaos * 0.5), y: baseY + rand(-chaos * 0.5, chaos * 0.5) });
      }
      points.push({ x: x2, y: y2 });
      return points;
    };

    const createThorBoltAnchors = (x1: number, y1: number, x2: number, y2: number, depth = 0): ThorBoltBranch[] => {
      const branches: ThorBoltBranch[] = [];
      const segments = 12;
      if (depth >= 3) return branches;
      for (let i = 2; i < segments - 2; i += 2) {
        const branchChance = depth === 0 ? 0.62 : depth === 1 ? 0.36 : 0.16;
        if (Math.random() < branchChance) {
          const progress = i / segments;
          const bx = x1 + (x2 - x1) * progress;
          const by = y1 + (y2 - y1) * progress;
          const side = Math.random() < 0.5 ? -1 : 1;
          const endX = bx + side * rand(28, 80);
          const endY = by + rand(22, 90);
          branches.push({ fromIdx: i, side, endX, endY });
          createThorBoltAnchors(bx, by, endX, endY, depth + 1).forEach(branch => branches.push(branch));
        }
      }
      return branches;
    };

    const spawnThorRing = (x: number, y: number, radius: number, color: string) => {
      state.thorRings.push({ x, y, radius, life: 1, angle: Math.random() * Math.PI, color });
    };

    const spawnThorShockwave = (x: number, y: number, color: string, maxRadius: number) => {
      state.thorShockwaves.push({ x, y, life: 1, maxRadius, color, decay: 0.035, width: 6 });
    };

    const spawnThorBurst = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(1.2, 8.6);
        state.thorParticles.push({
          type: i % 6 === 0 ? 'debris' : 'electric',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.58 + Math.random() * 0.55,
          maxLife: 1,
          size: rand(1.2, i % 6 === 0 ? 6.4 : 4.2),
          color,
          drag: i % 6 === 0 ? 0.975 : 0.94,
          growth: i % 6 === 0 ? -0.015 : -0.02,
          rotation: Math.random() * Math.PI * 2,
          spin: rand(-0.2, 0.2),
        });
      }
    };

    const spawnBlizzardBurst = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(1.4, 7.5);
        state.blizzardSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: rand(0.015, 0.04),
          color,
        });
      }
    };

    const spawnBlizzardShards = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(2, 12);
        state.blizzardShards.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - rand(1, 4),
          sz: rand(3, 18),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.22, 0.22),
          life: 1,
          decay: rand(0.008, 0.022),
          color: Math.random() < 0.6 ? 'rgba(186,230,253,0.88)' : Math.random() < 0.5 ? 'rgba(147,197,253,0.78)' : 'rgba(255,255,255,0.90)',
        });
      }
    };

    const spawnBlizzardCrystal = (x: number, y: number) => {
      const angle = rand(0, Math.PI * 2);
      state.blizzardCrystals.push({
        x: x + Math.cos(angle) * rand(0, 180),
        y: y + Math.sin(angle) * rand(0, 140),
        vx: rand(-1.4, 1.4),
        vy: rand(-0.6, 0.6),
        sz: rand(1.2, 5.5),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.06, 0.06),
        life: 1,
        decay: rand(0.004, 0.012),
        color: Math.random() < 0.5 ? 'rgba(186,230,253,' : 'rgba(147,197,253,',
      });
    };

    const spawnBlizzardShockwave = (x: number, y: number, color: string, maxRadius: number, oval = false) => {
      state.blizzardShockwaves.push({ x, y, radius: 4, maxRadius, life: 1, color, width: rand(2, 5), oval });
    };

    const applyBlizzardDamage = (multiplier: number, x: number, y: number, radius: number, label: string, color: string) => {
      const now = performance.now();
      const payload = createSpecialDamagePayload(multiplier, { ice: 36 });
      let hitCount = 0;
      state.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        if (Math.hypot(enemy.x - x, enemy.y - y) > radius + enemy.radius) return;
        const baseDamage = payload.crit ? payload.damage * shipStats.critMultiplier : payload.damage;
        damageEnemyHull(enemy, baseDamage);
        const elementalDamage = applyElementalDamage(enemy, payload.elemental, now, hitCount < 2 || isMonsterKind(enemy.kind));
        enemy.status.slowUntil = now + 4200;
        hitCount += 1;
        if (hitCount <= 5 || isMonsterKind(enemy.kind)) {
          spawnFloat(enemy.x + rand(-16, 16), enemy.y - 26, `${label} ${Math.round(baseDamage + elementalDamage)}`, color);
        }
        if (enemy.hp <= 0) spawnBlizzardBurst(enemy.x, enemy.y, 'rgba(147,197,253,0.88)', 28);
      });
      return hitCount;
    };

    const applyBlizzardTick = () => {
      const now = performance.now();
      const payload = createSpecialDamagePayload(1.0, { ice: 44 });
      state.enemies.forEach(enemy => {
        if (enemy.hp <= 0 || enemy.x <= WIDTH * 0.5) return;
        const baseDamage = payload.crit ? payload.damage * shipStats.critMultiplier : payload.damage;
        damageEnemyHull(enemy, baseDamage);
        const elementalDamage = applyElementalDamage(enemy, payload.elemental, now, false);
        enemy.status.slowUntil = now + 4600;
        spawnFloat(enemy.x + rand(-18, 18), enemy.y - 22, `-${Math.round(baseDamage + elementalDamage)} ICE`, '#bae6fd');
        if (enemy.hp <= 0) spawnBlizzardBurst(enemy.x, enemy.y, 'rgba(147,197,253,0.88)', 28);
      });
    };

    const spawnBlizzardIceBlock = () => {
      const size = rand(44, 76);
      state.blizzardIceBlocks.push({
        x: rand(WIDTH * 0.54, WIDTH - 60),
        y: -size,
        sz: size,
        vy: rand(2.2, 3.8),
        exploded: false,
        explodeY: rand(HEIGHT * 0.28, HEIGHT * 0.58),
        life: 1,
        rot: rand(-0.18, 0.18),
        facets: Array.from({ length: 6 }, () => ({
          ax: rand(-0.5, 0.5),
          ay: rand(-0.5, 0.5),
          bx: rand(-0.5, 0.5),
          by: rand(-0.5, 0.5),
          alpha: rand(0.18, 0.52),
        })),
      });
    };

    const explodeBlizzardIceBlock = (block: BlizzardIceBlock) => {
      block.exploded = true;
      const { x, y } = block;
      playBlizzardExplosionSfx();
      state.blizzard.shake = Math.max(state.blizzard.shake, 28);
      state.blizzard.flashAlpha = Math.max(state.blizzard.flashAlpha, 0.52);
      spawnBlizzardShockwave(x, y, 'rgba(147,197,253,1)', WIDTH * 0.5);
      spawnBlizzardShockwave(x, y, 'rgba(186,230,253,1)', WIDTH * 0.38, true);
      spawnBlizzardShards(x, y, 72);
      spawnBlizzardBurst(x, y, 'rgba(147,197,253,0.88)', 48);
      spawnBlizzardBurst(x, y, 'rgba(255,255,255,0.92)', 28);
      for (let i = 0; i < 24; i++) spawnBlizzardCrystal(x, y);
      applyBlizzardDamage(0.525, x, y, 90, 'GELO', '#bae6fd');
      applyBlizzardDamage(0.2625, x, y, WIDTH * 0.5, 'AREA', '#93c5fd');
    };

    const applyThorDamage = (multiplier: number, x: number, y: number, radius: number, label: string, color: string) => {
      const now = performance.now();
      const payload = createSpecialDamagePayload(multiplier, { electric: 44 });
      let hitCount = 0;
      state.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const distance = Math.hypot(enemy.x - x, enemy.y - y);
        if (distance > radius + enemy.radius) return;
        const baseDamage = payload.crit ? payload.damage * shipStats.critMultiplier : payload.damage;
        damageEnemyHull(enemy, baseDamage);
        const elementalDamage = applyElementalDamage(enemy, payload.elemental, now, hitCount < 2 || isMonsterKind(enemy.kind));
        hitCount += 1;
        if (hitCount <= 4 || isMonsterKind(enemy.kind)) {
          spawnFloat(enemy.x + rand(-12, 12), enemy.y - 30, `${label} ${Math.round(baseDamage + elementalDamage)}`, color);
        }
        spawnThorBurst(enemy.x, enemy.y, color, enemy.hp <= 0 ? 18 : 8);
      });
      return hitCount;
    };

    const spawnThorBolt = (now: number, empowered = false, isFinal = false) => {
      const aliveEnemies = state.enemies.filter(enemy => enemy.hp > 0);
      const target = pick(aliveEnemies);
      const endX = target ? target.x + rand(-24, 24) : rand(WIDTH * 0.58, WIDTH * 0.94);
      const endY = target ? target.y : rand(96, HEIGHT - 86);
      const startX = clamp(endX + rand(-180, 180), WIDTH * 0.5, WIDTH - 22);
      state.thorBolts.push({
        anchors: { x1: startX, y1: -18, x2: endX, y2: endY },
        branches: createThorBoltAnchors(startX, -18, endX, endY),
        life: isFinal ? 30 : empowered ? 21 : 14,
        maxLife: isFinal ? 30 : empowered ? 21 : 14,
        width: isFinal ? 7.8 : empowered ? 4.8 : 3,
        color: isFinal ? '#ffffff' : empowered ? '#fde68a' : '#93c5fd',
      });
      const hits = applyThorDamage(isFinal ? 6.8 : empowered ? 2.4 : 1.7, endX, endY, isFinal ? 285 : 165, isFinal ? 'SUPER' : 'RAIO', isFinal ? '#ffffff' : '#fde68a');
      spawnThorBurst(endX, endY, isFinal ? '#ffffff' : '#fde68a', isFinal ? 68 : empowered ? 36 : 22);
      spawnThorShockwave(endX, endY, isFinal ? 'rgba(255,255,255,0.9)' : 'rgba(253,230,138,0.82)', isFinal ? 360 : 230);
      state.thorShake = Math.max(state.thorShake, isFinal ? 36 : empowered ? 24 : 14);
      state.thorFlashAlpha = Math.max(state.thorFlashAlpha, isFinal ? 0.78 : empowered ? 0.52 : 0.34);
      if (hits > 0 || isFinal) playSound(randomThorThunderSfx(), isFinal ? 0.9 : 0.72);
      state.thorNextBolt = now + (empowered ? rand(340, 740) : rand(480, 980));
    };

    const spawnThorFarBolt = (now: number) => {
      const x1 = rand(WIDTH * 0.42, WIDTH);
      const x2 = x1 + rand(-110, 110);
      const y2 = rand(60, 200);
      state.thorFarBolts.push({
        anchors: { x1, y1: 0, x2, y2 },
        branches: [],
        life: 10,
        maxLife: 10,
        width: 1.5,
        color: '#93c5fd',
      });
      state.thorFlashAlpha = Math.max(state.thorFlashAlpha, 0.07);
      state.thorNextFarBolt = now + rand(360, 860);
    };

    const isEnemyInThorTornado = (enemy: Enemy, tornado: ThorTornado) => {
      const dx = enemy.x - tornado.x;
      const dy = enemy.y - tornado.y;
      const rx = tornado.radius * (tornado.kind === 'big' ? 1.28 : 1.1);
      const ry = tornado.height * 0.46;
      return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
    };

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

    const spawnProjectileImpact = (x: number, y: number, color: string, scale = 1, incomingAngle?: number) => {
      const isHellfire = color.includes('251,146,60') || color.includes('fb923c') || color.includes('f97316');
      const isCritical = color.includes('facc15') || color.includes('250,204,21');
      const palette = isHellfire ? aaaPalettes.fire : isCritical ? aaaPalettes.elite : aaaPalettes.common;
      const impactScale = scale * (isHellfire ? 1.32 : isCritical ? 1.18 : 1);
      const coneAngle = Number.isFinite(incomingAngle) ? incomingAngle! + Math.PI : Math.random() * Math.PI * 2;

      addAaaTrauma(isHellfire ? 8.5 * scale : isCritical ? 6.4 * scale : 4.2 * scale);
      addAaaFlash(isHellfire ? 'rgba(255,80,30,0.22)' : isCritical ? 'rgba(255,220,40,0.18)' : 'rgba(80,220,255,0.12)', 0.14, 0.8);
      addAaaGlow(x, y, (isHellfire ? 170 : isCritical ? 130 : 90) * impactScale, isHellfire ? 'rgba(255,80,40,0.90)' : isCritical ? 'rgba(250,204,21,0.90)' : 'rgba(80,220,255,0.80)', 'rgba(255,80,40,0)', 0.32);
      addAaaShockwave(x, y, 28 * impactScale, 'rgba(255,255,255,0.88)', 2.8 * impactScale, 0.102);
      addAaaShockwave(x, y, 58 * impactScale, color, 5 * impactScale, 0.07, 4);
      addAaaShockwave(x, y, 90 * impactScale, 'rgba(255,255,255,0.20)', 2 * impactScale, 0.042, 5);
      addAaaBurst(x, y, palette, isHellfire ? 54 : isCritical ? 34 : 28, isHellfire ? 11 : 8, impactScale, coneAngle);
      addAaaMetalSparks(x, y, isCritical ? 20 : isHellfire ? 16 : 10, incomingAngle ?? 0, 14, impactScale);

      for (let i = 0; i < (isHellfire ? 12 : 6); i++) {
        addAaaDebris(x, y, impactScale * 0.72, isHellfire ? aaaPalettes.fire : ['#94a3b8', '#64748b', '#e2e8f0']);
      }
      if (isHellfire) addAaaSmoke(x, y, 10, impactScale);

      state.hellfireShockwaves.push(
        { x, y, radius: 2, maxRadius: 42 * scale, life: 1, decay: 0.082, color: 'rgba(255,255,255,0.68)', width: 2.5 * scale },
        { x, y, radius: 4, maxRadius: 72 * scale, life: 1, decay: 0.058, color, width: 4 * scale }
      );

      for (let i = 0; i < Math.round(16 * scale); i++) {
        const angle = coneAngle + rand(-0.9, 0.9);
        const speed = rand(2.2, 7.2) * scale;
        state.impactParticles.push({
          x: x + rand(-4, 4),
          y: y + rand(-4, 4),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(0.42, 0.92),
          size: rand(1.8, 4.8) * scale,
          color: i % 5 === 0 ? '#ffffff' : color,
        });
      }

      for (let i = 0; i < Math.round(5 * scale); i++) {
        spawnSmokeParticle(
          x + rand(-8, 8),
          y + rand(-8, 8),
          rand(-1.6, 1.6),
          rand(-1.4, 0.8),
          rand(8, 18) * scale,
          rand(36, 76)
        );
      }
    };

    const spawnPlayerImpact = (x: number, y: number, projectile: Projectile) => {
      const angle = Math.atan2(projectile.vy, projectile.vx);
      const scale = projectile.color === '#f97316' ? 1.45 : 1.12;
      spawnProjectileImpact(x, y, projectile.color || '#ef4444', scale, angle);
      state.hellfireShake = Math.max(state.hellfireShake, 5 * scale);
      addAaaTrauma(5.5 * scale);
      state.laserFlashAlpha = Math.max(state.laserFlashAlpha || 0, 0.14 * scale);

      for (let i = 0; i < Math.round(8 * scale); i++) {
        spawnEmberParticle(
          x + rand(-7, 7),
          y + rand(-7, 7),
          rand(-3.6, 3.6),
          rand(-3.4, 2.2),
          rand(1.8, 4.8),
          rand(20, 42)
        );
      }
    };

    const spawnEnemyDeathExplosion = (enemy: Enemy) => {
      const bossScale = enemy.kind === 'boss-ship' ? 2.15 : isMonsterKind(enemy.kind) ? 2.55 : enemy.kind === 'elite-ship' ? 1.45 : 1.05;
      const color = enemy.kind === 'boss-ship' ? 'rgba(251,146,60,0.9)' : isMonsterKind(enemy.kind) ? 'rgba(168,85,247,0.86)' : 'rgba(34,211,238,0.72)';
      const explosionType = enemy.kind === 'boss-ship' || isMonsterKind(enemy.kind) ? 'boss' : enemy.kind === 'elite-ship' ? 'elite' : 'common';
      const palette = explosionType === 'boss' ? aaaPalettes.boss : explosionType === 'elite' ? aaaPalettes.elite : aaaPalettes.common;
      const aaaScale = explosionType === 'boss' ? bossScale * 1.08 : bossScale;
      addAaaTrauma(explosionType === 'boss' ? 18 : explosionType === 'elite' ? 11 : 6);
      addAaaFlash(explosionType === 'boss' ? 'rgba(220,180,255,0.28)' : explosionType === 'elite' ? 'rgba(255,220,80,0.22)' : 'rgba(120,220,255,0.14)', 0.14, 0.95);
      window.setTimeout(() => addAaaFlash('rgba(255,120,40,0.10)', 0.22, 0.6), 40);
      addAaaGlow(enemy.x, enemy.y, (explosionType === 'boss' ? 320 : explosionType === 'elite' ? 200 : 130) * aaaScale, explosionType === 'boss' ? 'rgba(200,120,255,0.88)' : explosionType === 'elite' ? 'rgba(255,200,60,0.82)' : 'rgba(80,220,255,0.76)');
      window.setTimeout(() => addAaaGlow(enemy.x, enemy.y, (explosionType === 'boss' ? 260 : explosionType === 'elite' ? 160 : 100) * aaaScale, 'rgba(255,120,40,0.55)', 'rgba(255,60,20,0)', 0.68), 55);
      addAaaShockwave(enemy.x, enemy.y, 55 * aaaScale, 'rgba(255,255,255,0.95)', 3.8 * aaaScale, 0.07);
      addAaaShockwave(enemy.x, enemy.y, 105 * aaaScale, explosionType === 'boss' ? 'rgba(192,132,252,0.80)' : explosionType === 'elite' ? 'rgba(251,191,36,0.80)' : 'rgba(34,211,238,0.78)', 5.5 * aaaScale, 0.044, 4);
      addAaaShockwave(enemy.x, enemy.y, 168 * aaaScale, 'rgba(200,60,40,0.40)', 8.5 * aaaScale, 0.03, 8);
      addAaaShockwave(enemy.x, enemy.y, 240 * aaaScale, 'rgba(255,255,255,0.18)', 2 * aaaScale, 0.022, 10);
      addAaaBurst(enemy.x, enemy.y, palette, explosionType === 'boss' ? 110 : explosionType === 'elite' ? 72 : 44, explosionType === 'boss' ? 15 : explosionType === 'elite' ? 11 : 8, aaaScale);

      const sparkCount = explosionType === 'boss' ? 32 : explosionType === 'elite' ? 20 : 12;
      for (let i = 0; i < sparkCount; i++) {
        addAaaStreak(enemy.x, enemy.y, (i / sparkCount) * Math.PI * 2, rand(8, 22) * aaaScale, pick(aaaPalettes.spark), rand(30, 80) * aaaScale, rand(1, 3) * aaaScale);
      }

      const debrisPalette = explosionType === 'boss'
        ? ['#c084fc', '#64748b', '#94a3b8', '#f0abfc']
        : explosionType === 'elite'
          ? ['#f97316', '#94a3b8', '#64748b', '#facc15']
          : ['#67e8f9', '#94a3b8', '#64748b'];
      for (let i = 0; i < (explosionType === 'boss' ? 28 : explosionType === 'elite' ? 16 : 8); i++) {
        addAaaDebris(enemy.x + rand(-enemy.width * 0.18, enemy.width * 0.18), enemy.y + rand(-enemy.height * 0.18, enemy.height * 0.18), aaaScale, debrisPalette);
      }
      addAaaSmoke(enemy.x, enemy.y, explosionType === 'boss' ? 30 : explosionType === 'elite' ? 18 : 10, aaaScale);

      if (explosionType === 'boss') {
        for (let i = 0; i < 10; i++) {
          window.setTimeout(() => {
            const dx = rand(-110, 110);
            const dy = rand(-70, 70);
            addAaaShockwave(enemy.x + dx, enemy.y + dy, rand(40, 85), 'rgba(251,113,133,0.62)', 3.2, 0.068);
            addAaaGlow(enemy.x + dx, enemy.y + dy, 90, 'rgba(255,100,30,0.72)', 'rgba(255,60,0,0)', 0.28);
            addAaaBurst(enemy.x + dx, enemy.y + dy, aaaPalettes.fire, 20, 8, 0.7);
            addAaaTrauma(3.5);
          }, i * 48 + 30);
        }
        window.setTimeout(() => addAaaShockwave(enemy.x, enemy.y, 380, 'rgba(192,132,252,0.28)', 14, 0.012), 120);
      } else if (explosionType === 'elite') {
        for (let i = 0; i < 5; i++) {
          window.setTimeout(() => {
            const dx = rand(-60, 60);
            const dy = rand(-42, 42);
            addAaaShockwave(enemy.x + dx, enemy.y + dy, rand(28, 58), 'rgba(251,191,36,0.58)', 2.5, 0.072);
            addAaaBurst(enemy.x + dx, enemy.y + dy, aaaPalettes.fire, 10, 6, 0.6);
          }, i * 60 + 20);
        }
      }

      state.hellfireShockwaves.push(
        { x: enemy.x, y: enemy.y, radius: 10, maxRadius: 88 * bossScale, life: 1, decay: 0.05, color: 'rgba(255,255,255,0.72)', width: 4 * bossScale },
        { x: enemy.x, y: enemy.y, radius: 18, maxRadius: 132 * bossScale, life: 1, decay: 0.034, color, width: 6 * bossScale },
        { x: enemy.x, y: enemy.y, radius: 24, maxRadius: 184 * bossScale, life: 1, decay: 0.026, color: 'rgba(127,29,29,0.42)', width: 9 * bossScale }
      );

      for (let i = 0; i < Math.round(34 * bossScale); i++) {
        spawnParticle(
          enemy.x + rand(-enemy.width * 0.2, enemy.width * 0.2),
          enemy.y + rand(-enemy.height * 0.2, enemy.height * 0.2),
          i % 7 === 0 ? '#ffffff' : i % 3 === 0 ? '#facc15' : enemy.kind.includes('monster') ? '#c084fc' : '#fb923c',
          rand(2.5, 8.5) * Math.min(1.6, bossScale),
          rand(0.55, 1.25),
          rand(2.4, 6.6),
          state.impactParticles
        );
      }

      for (let i = 0; i < Math.round(10 * bossScale); i++) {
        spawnSmokeParticle(
          enemy.x + rand(-enemy.width * 0.36, enemy.width * 0.36),
          enemy.y + rand(-enemy.height * 0.36, enemy.height * 0.36),
          rand(-3.2, 3.2),
          rand(-3.4, 1.4),
          rand(18, 42) * Math.min(1.5, bossScale),
          rand(72, 138)
        );
      }

      if (enemy.kind === 'boss-ship' || isMonsterKind(enemy.kind)) {
        state.hellfireShake = Math.max(state.hellfireShake, 18);
        state.laserFlashAlpha = Math.max(state.laserFlashAlpha || 0, 0.26);
      }
    };

    const startBattleCinematic = (target: BattleCinematic['target'], x: number, y: number, now: number) => {
      state.cinematic = {
        active: true,
        target,
        x: clamp(x, 80, WIDTH - 80),
        y: clamp(y, 70, HEIGHT - 70),
        start: now,
        duration: RESULT_MODAL_DELAY_MS,
      };
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
      const shouldSpawnFinalBoss = state.regularEnemiesDefeated >= REGULAR_ENEMIES_BEFORE_FINAL_BOSS && !state.monsterSpawned;
      if (!shouldSpawnFinalBoss && state.regularEnemiesSpawned >= REGULAR_ENEMIES_BEFORE_FINAL_BOSS) return;
      if (shouldSpawnFinalBoss && state.monsterSpawned) return;

      const forceMonsterBoss = shouldSpawnFinalBoss;
      const blueprint = buildEnemyBlueprint(state.kills, forceMonsterBoss);
      if (isMonsterKind(blueprint.kind)) state.monsterSpawned = true;
      else state.regularEnemiesSpawned += 1;
      const level = horizonLevel + 1 + Math.floor(Math.random() * 3);
      const levelScale = 1 + Math.max(0, level - 1) * 0.06;
      const bossScale = isMonsterKind(blueprint.kind) ? 1.25 : 1;
      const battleLevelScale = 1 + Math.max(0, currentDefenseBattleLevel - 1) * 0.1;
      const rewardScale = battleLevelScale;
      const scaledHp = Math.round(blueprint.hp * levelScale * bossScale * battleLevelScale);
      const scaledDamage = Math.round(blueprint.damage * levelScale * bossScale * battleLevelScale);
      const isBossLike = blueprint.kind === 'boss-ship' || isMonsterKind(blueprint.kind);
      const absorbShield = isBossLike ? Math.round(scaledHp * BOSS_ABSORB_SHIELD_MULTIPLIER) : 0;
      const enemy: Enemy = {
        id: state.nextId++,
        kind: blueprint.kind,
        level,
        x: WIDTH + blueprint.width,
        y: 80 + Math.random() * (HEIGHT - 160),
        hp: scaledHp,
        maxHp: scaledHp,
        shield: absorbShield,
        maxShield: absorbShield,
        speed: blueprint.speed,
        radius: blueprint.radius,
        width: blueprint.width,
        height: blueprint.height,
        damage: scaledDamage,
        status: {},
        attackCooldown: performance.now() + 900 + Math.random() * 900,
        image: blueprint.image,
        frames: blueprint.frames,
        spriteSheet: blueprint.spriteSheet,
        shootSound: blueprint.shootSound,
        screamSound: blueprint.screamSound,
        explosionSound: blueprint.explosionSound,
        frameOffset: Math.random() * 10,
        xp: Math.round(blueprint.xp * rewardScale),
        qc: Math.round(blueprint.qc * rewardScale),
      };
      if (blueprint.screamSound) enemy.screamAudio = playSound(blueprint.screamSound, 0.72);
      if (enemy.kind === 'common-ship' || enemy.kind === 'elite-ship') {
        enemy.engineAudio = playLoopSound(AIRPLANE_ENEMY_ENGINE_SOUND, enemy.kind === 'elite-ship' ? 0.34 : 0.28);
      }
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

    const damageEnemyHull = (enemy: Enemy, damage: number) => {
      if (damage <= 0) return 0;
      let remainingDamage = damage;
      if (enemy.shield > 0) {
        const shieldDamage = Math.min(enemy.shield, remainingDamage);
        enemy.shield -= shieldDamage;
        remainingDamage -= shieldDamage;
      }
      if (remainingDamage > 0) enemy.hp -= remainingDamage;
      return remainingDamage;
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
        damageEnemyHull(enemy, elemental);
        total += elemental;
        enemy.status.slowUntil = now + 2600;
        if (showFloats) spawnFloat(enemy.x + 16, enemy.y, `${Math.round(elemental)}`, '#67e8f9');
      }

      if (elementalDamage.electric > 0) {
        const elemental = elementalDamage.electric * (enemy.status.shockedUntil && enemy.status.shockedUntil > now ? 1 + shipStats.conditionalBonuses.bonusDamageVsShockedPercent / 100 : 1);
        damageEnemyHull(enemy, elemental);
        total += elemental;
        enemy.status.shockedUntil = now + 2300;
        if (showFloats) spawnFloat(enemy.x + 16, enemy.y + 16, `${Math.round(elemental)}`, '#facc15');
      }

      if (elementalDamage.fire > 0) {
        const elemental = elementalDamage.fire * (enemy.status.burningUntil && enemy.status.burningUntil > now ? 1 + shipStats.conditionalBonuses.bonusDamageVsBurningPercent / 100 : 1);
        damageEnemyHull(enemy, elemental);
        total += elemental;
        enemy.status.burningUntil = now + 3200;
        enemy.status.lastBurnTick = now;
        if (showFloats) spawnFloat(enemy.x + 16, enemy.y - 8, `${Math.round(elemental)}`, '#fb923c');
      }

      return total;
    };

    const rollPlayerDamageVariant = (baseDamage: number, crit: boolean) => {
      if (!crit) {
        if (Math.random() < 0.15) {
          const multiplier = 1.05 + Math.random() * 0.1;
          return {
            damage: baseDamage * multiplier,
            color: '#9ca3af',
            size: 15.4,
            life: 45,
            shadowColor: 'rgba(156,163,175,0.5)',
          };
        }
        return {
          damage: baseDamage,
          color: '#ffffff',
          size: 14,
          life: 45,
          shadowColor: 'transparent',
        };
      }

      const roll = Math.random();
      if (roll < 0.1) {
        const multiplier = 1.2 + Math.random() * 0.2;
        return {
          damage: baseDamage * multiplier,
          color: '#38bdf8',
          size: 24.3,
          life: 75,
          shadowColor: 'rgba(56,189,248,0.8)',
        };
      }
      if (roll < 0.25) {
        const multiplier = 1.05 + Math.random() * 0.15;
        return {
          damage: baseDamage * multiplier,
          color: '#ef4444',
          size: 21.6,
          life: 63,
          shadowColor: 'rgba(239,68,68,0.8)',
        };
      }
      return {
        damage: baseDamage,
        color: '#fb923c',
        size: 20.7,
        life: 45,
        shadowColor: 'rgba(251,146,60,0.7)',
      };
    };

    const damageEnemy = (enemy: Enemy, projectile: Projectile) => {
      const now = performance.now();
      let baseDamage = projectile.damage;
      if (projectile.crit) baseDamage *= shipStats.critMultiplier;
      const damageVariant = rollPlayerDamageVariant(baseDamage, projectile.crit);
      baseDamage = damageVariant.damage;

      damageEnemyHull(enemy, baseDamage);
      if (projectile.special === 'hellfire') {
        spawnFloat(enemy.x - 28, enemy.y - 30, `${Math.round(baseDamage)}`, damageVariant.color, {
          life: damageVariant.life,
          size: damageVariant.size,
          shadowColor: damageVariant.shadowColor,
        });
      } else {
        spawnFloat(enemy.x, enemy.y - 22, `${Math.round(baseDamage)}`, damageVariant.color, {
          life: damageVariant.life,
          size: damageVariant.size,
          shadowColor: damageVariant.shadowColor,
        });
      }

      applyElementalDamage(enemy, projectile.elemental, now);

      spawnProjectileImpact(
        enemy.x,
        enemy.y,
        projectile.special === 'hellfire' ? 'rgba(251,146,60,0.86)' : projectile.crit ? '#facc15' : projectile.color,
        projectile.special === 'hellfire' ? 1.25 : projectile.crit ? 1.18 : 0.95,
        Math.atan2(projectile.vy, projectile.vx)
      );

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
      if (enemy.kind === 'monster-1') {
        enemy.actionFrame = MONSTER_1_SHOOT_FRAME;
        enemy.actionFrameUntil = now + 180;
      }
      playSound(enemyShotSoundFor(enemy), enemy.kind === 'boss-ship' ? 0.62 : 0.46);
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const speed = enemy.kind === 'boss-ship' ? 5.1 : enemy.kind.includes('monster') ? 4.5 : 4.8;
      if (Math.random() > 0.3) {
        spawnParticle(enemy.x - 30, enemy.y + (Math.random() * 12 - 6), 'rgba(180, 180, 180, 0.6)', 1.5, 0.5, 3.5, state.backgroundParticles);
      }
      const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;
      const damage = enemy.damage * (slowed ? 1 - shipStats.conditionalBonuses.slowEnemyDamageReductionPercent / 100 : 1);

      state.projectiles.push({
        id: state.nextId++,
        from: 'enemy',
        visualType: enemy.kind === 'boss-ship' || enemy.kind.includes('monster') ? 'boss' : enemy.kind === 'elite-ship' ? 'elite' : 'common',
        targetId: undefined,
        x: enemy.x - enemy.width * 0.34,
        y: enemy.y,
        vx: (dx / length) * speed,
        vy: (dy / length) * speed,
        damage,
        crit: false,
        elemental: { ice: 0, electric: 0, fire: 0 },
        color: enemy.kind === 'boss-ship' ? '#f97316' : enemy.kind.includes('monster') ? '#a855f7' : enemy.kind === 'elite-ship' ? '#facc15' : '#ef4444',
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
        const laserContactRadius = HORIZON_LASER_DAMAGE_RADIUS + enemy.radius;
        if (enemy.hp > 0 && distance <= laserContactRadius) {
          const payload = createSpecialDamagePayload(HORIZON_LASER_DAMAGE_MULTIPLIER);
          const baseDamage = payload.crit ? payload.damage * shipStats.critMultiplier : payload.damage;
          damageEnemyHull(enemy, baseDamage);
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
      const damagePayload = createSpecialDamagePayload(HORIZON_BARRAGE_DAMAGE_MULTIPLIER, { fire: 25 });
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
      if (!specialId) return;
      const now = performance.now();
      const cooldown = getHorizonSpecialCooldownDuration(shipStats.specialCooldownReductionPercent);
      const anySpecialActive = state.laserState !== 'idle'
        || state.hellfireSequence.active
        || state.thorPhase !== 'idle'
        || state.blizzard.active
        || state.blizzard.coverAlpha > 0.01
        || state.blizzardIceBlocks.length > 0
        || state.blizzardShockwaves.length > 0;
      if ((state.specialCooldowns[specialId] || 0) > now) return;
      if (anySpecialActive) return;
      state.specialCooldowns[specialId] = now + cooldown;
      window.dispatchEvent(new CustomEvent('qch:new-earth-achievement-metric', {
        detail: { type: 'special-used', specialId, amount: 1 },
      }));

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
        spawnFloat(start.x + 78, start.y - 62, 'HORIZON LASER', '#f0abfc');
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
        state.hellfireSequence = { active: true, remaining: 6, waitingForImpact: false };
        state.hellfireFlashAlpha = 0.24;
        state.hellfireBannerLife = 95;
        state.hellfireShake = Math.max(state.hellfireShake, 7);
        state.hellfireLaunchIndex = 0;
        spawnFloat(state.player.x + 76, state.player.y - 58, 'HORIZON BARRAGE', '#ffcc66');
        launchHellfireOrb();
      }

      if (specialId === 'thor-oath') {
        state.thorPhase = 'prelude';
        state.thorPhaseStart = now;
        state.thorStart = now;
        state.thorLastUpdate = now;
        state.thorNextBolt = now + 1180;
        state.thorNextFarBolt = now + 120;
        state.thorTickSmall = 0;
        state.thorTickBig = 0;
        state.thorColumn = 0;
        state.thorDarkness = 0;
        state.thorFinalDone = false;
        state.thorSmallTornados = [];
        state.thorBigTornado = null;
        state.thorBolts = [];
        state.thorFarBolts = [];
        state.thorParticles = [];
        state.thorShockwaves = [];
        state.thorRings = [];
        state.thorFlashAlpha = 0.32;
        state.thorShake = 12;
        spawnFloat(state.player.x + 78, state.player.y - 62, 'JURAMENTO DE THOR', '#fde68a');
        playSound(PLAYER_SOUNDS.thorSpecial, 0.88);
        playSound(PLAYER_SOUNDS.thorTornado, 0.78);
      }

      if (specialId === 'special-slot-4') {
        state.blizzard = {
          active: true,
          start: now,
          duration: 8000,
          blocksSpawned: 1,
          tickAccum: 0,
          tickInterval: 1000,
          blockAccum: 0,
          blockInterval: 2000,
          coverAlpha: 0,
          windPhase: 0,
          flashAlpha: 0.22,
          shake: 7,
        };
        state.blizzardIceBlocks = [];
        state.blizzardShards = [];
        state.blizzardCrystals = [];
        state.blizzardSparks = [];
        state.blizzardShockwaves = [];
        state.enemies.forEach(enemy => {
          if (enemy.x > WIDTH * 0.5) enemy.status.slowUntil = now + 4200;
        });
        spawnFloat(state.player.x + 78, state.player.y - 62, 'BLIZZARD', '#bae6fd');
        playSound(PLAYER_SOUNDS.blizzardSpecial, 0.6);
        spawnBlizzardIceBlock();
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

    const drawSpriteSheetOrFallback = (
      ctx: CanvasRenderingContext2D,
      enemy: Enemy,
      now: number,
      fallback: () => void
    ) => {
      const sheet = enemy.spriteSheet;
      if (!sheet) {
        const frame = enemy.frames ? enemy.frames[Math.floor((now / 135 + enemy.frameOffset) % enemy.frames.length)] : enemy.image;
        drawImageOrFallback(ctx, frame, enemy.x, enemy.y, enemy.width, enemy.height, fallback);
        return;
      }

      const image = getImage(sheet.src);
      if (!image?.complete || image.naturalWidth <= 0) {
        fallback();
        return;
      }

      const frameIndex = enemy.kind === 'monster-1'
        ? getMonster1FrameIndex(enemy, now)
        : Math.floor((now / (1000 / sheet.fps) + enemy.frameOffset) % sheet.frameCount);
      const frameWidth = image.naturalWidth / sheet.columns;
      const frameHeight = image.naturalHeight / sheet.rows;
      const sx = (frameIndex % sheet.columns) * frameWidth;
      const sy = Math.floor(frameIndex / sheet.columns) * frameHeight;

      ctx.drawImage(
        image,
        sx,
        sy,
        frameWidth,
        frameHeight,
        enemy.x - enemy.width / 2,
        enemy.y - enemy.height / 2,
        enemy.width,
        enemy.height
      );
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
        state.laserLastDamageTick = now - HORIZON_LASER_DAMAGE_INTERVAL;
        state.laserShake = 18;
        return;
      }

      if (state.laserState === 'firing' && now - state.laserLastDamageTick >= HORIZON_LASER_DAMAGE_INTERVAL) {
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
        const finalExplosionRadius = 400;
        const finalExplosionPayload = createSpecialDamagePayload(HORIZON_LASER_FINAL_EXPLOSION_MULTIPLIER);
        state.enemies.forEach(enemy => {
          const distance = Math.hypot(enemy.x - end.x, enemy.y - end.y);
          if (enemy.hp <= 0 || distance > finalExplosionRadius + enemy.radius) return;
          const baseDamage = finalExplosionPayload.crit
            ? finalExplosionPayload.damage * shipStats.critMultiplier
            : finalExplosionPayload.damage;
          damageEnemyHull(enemy, baseDamage);
          const elementalDamage = applyElementalDamage(enemy, finalExplosionPayload.elemental, now, isMonsterKind(enemy.kind));
          const totalDamage = baseDamage + elementalDamage;
          spawnFloat(
            enemy.x + (Math.random() * 24 - 12),
            enemy.y - 28,
            `${finalExplosionPayload.crit ? 'CRIT ' : ''}${Math.round(totalDamage)} EXP`,
            finalExplosionPayload.crit ? '#facc15' : '#f0abfc',
            { life: 78, size: finalExplosionPayload.crit ? 23 : 18, shadowColor: 'rgba(240,171,252,0.75)' }
          );
        });
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

        const updateThorSpecial = (now: number, dt: number) => {
      if (state.thorPhase === 'idle') return;
      const age = now - state.thorPhaseStart;
      state.thorFlashAlpha *= 0.86;

      if (state.thorPhase === 'prelude') {
        const progress = Math.min(1, age / 1200);
        state.thorDarkness = easeInOut(progress) * 0.66;
        state.thorColumn = clamp((age - 480) / 700, 0, 1);
        state.thorShake = Math.max(state.thorShake, 3 + state.thorDarkness * 11);
        if (now >= state.thorNextFarBolt) spawnThorFarBolt(now);
        if (age >= 1200) {
          state.thorPhase = 'small';
          state.thorPhaseStart = now;
          state.thorSmallTornados = [createThorTornado(0), createThorTornado(1), createThorTornado(2)];
          state.thorNextBolt = now + 200;
          state.thorShake = 20;
          state.thorFlashAlpha = 0.48;
          spawnThorRing(WIDTH * 0.71, HEIGHT * 0.5, 56, 'rgba(103,232,249,1)');
          playSound(randomThorThunderSfx(), 0.72);
        }
      } else if (state.thorPhase === 'small') {
        if (now >= state.thorNextBolt) spawnThorBolt(now, true);
        state.thorTickSmall += dt;
        while (state.thorTickSmall >= 650) {
          state.thorTickSmall -= 650;
          state.thorSmallTornados.forEach(tornado => {
            const hit = state.enemies.some(enemy => enemy.hp > 0 && isEnemyInThorTornado(enemy, tornado));
            if (hit) {
              applyThorDamage(0.675, tornado.x, tornado.y, tornado.radius * 1.25, 'TORNADO', '#7dd3fc');
              spawnThorShockwave(tornado.x, tornado.y, 'rgba(125,211,252,0.8)', 130);
            }
          });
        }
        if (age >= 4000) {
          state.thorPhase = 'big';
          state.thorPhaseStart = now;
          state.thorSmallTornados.forEach(tornado => { tornado.alive = false; });
          state.thorBigTornado = createThorTornado(0, 'big');
          state.thorColumn = 0.58;
          state.thorShake = 28;
          state.thorFlashAlpha = 0.62;
          spawnThorRing(WIDTH * 0.72, HEIGHT * 0.52, 96, 'rgba(253,230,138,1)');
          playSound(randomThorThunderSfx(), 0.78);
        }
      } else if (state.thorPhase === 'big') {
        if (now >= state.thorNextBolt) spawnThorBolt(now, true);
        state.thorTickBig += dt;
        while (state.thorTickBig >= 500) {
          state.thorTickBig -= 500;
          if (state.thorBigTornado) {
            const hit = state.enemies.some(enemy => enemy.hp > 0 && isEnemyInThorTornado(enemy, state.thorBigTornado as ThorTornado));
            if (hit) {
              applyThorDamage(0.95, state.thorBigTornado.x, state.thorBigTornado.y, state.thorBigTornado.radius * 1.45, 'MEGA', '#fde68a');
              spawnThorShockwave(state.thorBigTornado.x, state.thorBigTornado.y, 'rgba(253,230,138,0.82)', 190);
            }
          }
        }
        if (age >= 4000) {
          state.thorPhase = 'ending';
          state.thorPhaseStart = now;
          if (state.thorBigTornado) state.thorBigTornado.alive = false;
        }
      } else if (state.thorPhase === 'ending') {
        state.thorDarkness = Math.max(0, 0.52 * (1 - age / 1700));
        if (!state.thorFinalDone && age > 240) {
          state.thorFinalDone = true;
          spawnThorBolt(now, true, true);
        }
        if (age >= 1800) {
          state.thorPhase = 'idle';
          state.thorSmallTornados = [];
          state.thorBigTornado = null;
          state.thorBolts = [];
          state.thorFarBolts = [];
          state.thorParticles = [];
          state.thorDebris = [];
          state.thorSparks = [];
          state.thorEnergyArcs = [];
          state.thorShockwaves = [];
          state.thorRings = [];
          state.thorDarkness = 0;
          state.thorColumn = 0;
          state.thorFlashAlpha = 0;
          state.thorShake = 0;
        }
      }

      const activeTornados = state.thorPhase === 'small'
        ? state.thorSmallTornados.filter(t => t.alive)
        : (state.thorBigTornado && state.thorBigTornado.alive ? [state.thorBigTornado] : []);

      activeTornados.forEach((tornado, index) => {
        tornado.spin += (tornado.kind === 'big' ? 0.0072 : 0.0092) * dt;
        tornado.birthScale = clamp(tornado.birthScale + dt / 400, 0, 1);
        tornado.lastDir = (tornado.lastDir || 0) + dt;

        if (tornado.kind === 'small') {
          if ((tornado.lastDir || 0) > 260 + rand(0, 240)) {
             tornado.vx = (tornado.vx || 0) + rand(-120, 120);
             tornado.vy = (tornado.vy || 0) + rand(-150, 150);
             tornado.lastDir = 0;
          }
          tornado.vx = (tornado.vx || 0) + Math.sin(now / 205 + tornado.seed) * 4.6;
          tornado.vy = (tornado.vy || 0) + Math.cos(now / 165 + tornado.seed) * 5.4;
          tornado.vx *= 0.988;
          tornado.vy *= 0.986;
          tornado.x += tornado.vx * dt / 1000;
          tornado.y += tornado.vy * dt / 1000;
        } else {
          tornado.x = WIDTH * 0.76 + Math.sin(now / 740) * 90 + Math.sin(now / 254) * 24;
          tornado.y = HEIGHT * 0.5 + Math.sin(now / 510) * 132 + Math.cos(now / 305) * 22;
        }
        
        tornado.x = clamp(tornado.x, WIDTH * 0.52 + tornado.radius * 0.25, WIDTH - 36 - tornado.radius * 0.12);
        tornado.y = clamp(tornado.y, 72, HEIGHT - 40);

        for (let i = 0; i < (tornado.kind === 'big' ? 2 : 1); i++) {
          const side = Math.random() < 0.5 ? -1 : 1;
          state.thorDebris.push({
            x: tornado.x + side * rand(tornado.radius * 1.1, tornado.radius * 2.2),
            y: tornado.y + rand(-tornado.height * 0.4, tornado.height * 0.42),
            vx: rand(-1.2, 1.2),
            vy: rand(-2.4, 0.6),
            sz: rand(1.5, tornado.kind === 'big' ? 8 : 5),
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.18, 0.18),
            life: 1,
            decay: rand(0.006, 0.018),
            target: tornado,
            color: Math.random() < 0.7 ? 'rgba(148,163,184,0.72)' : 'rgba(253,230,138,0.78)'
          });
        }

        const pChance = tornado.kind === 'big' ? 0.97 : 0.72;
        if (Math.random() < pChance) {
          const n = tornado.kind === 'big' ? 5 : 2;
          for (let i = 0; i < n; i++) {
            const a = rand(0, Math.PI * 2);
            const rim = tornado.radius * rand(0.4, 1.28);
            state.thorParticles.push({
              x: tornado.x + Math.cos(a) * rim,
              y: tornado.y + rand(-tornado.height * 0.4, tornado.height * 0.4),
              vx: Math.cos(a + Math.PI / 2) * rand(0.8, 3),
              vy: rand(-3.2, -0.7),
              sz: rand(0.8, tornado.kind === 'big' ? 5.2 : 3.2),
              life: 0.82,
              decay: rand(0.011, 0.028),
              color: Math.random() < 0.55 ? 'rgba(186,230,253,0.78)' : 'rgba(253,230,138,0.78)'
            });
          }
        }

        if (tornado.kind === 'big' && Math.random() < 0.16) {
          const a = rand(0, Math.PI * 2);
          state.thorSparks.push({
            x: tornado.x + Math.cos(a) * tornado.radius * rand(0.2, 1),
            y: tornado.y + rand(-tornado.height * 0.4, tornado.height * 0.28),
            vx: Math.cos(a) * rand(1, 5),
            vy: Math.sin(a) * rand(1, 5),
            life: 1,
            decay: rand(0.04, 0.09),
            color: 'rgba(253,230,138,1)'
          });
        }

        if (Math.random() < (tornado.kind === 'big' ? 0.22 : 0.08)) {
          const angle = rand(0, Math.PI * 2);
          state.thorEnergyArcs.push({
            x: tornado.x,
            y: tornado.y,
            ex: tornado.x + Math.cos(angle) * rand(30, 90),
            ey: tornado.y + Math.sin(angle) * rand(20, 60),
            life: 1,
            decay: rand(0.06, 0.14),
            color: tornado.kind === 'big' ? 'rgba(253,230,138,' : 'rgba(103,232,249,'
          });
        }
      });
      
      const wind = state.thorPhase === 'prelude' ? 2.6 : state.thorPhase === 'big' ? 8.8 : 5.4;
      for (const c of state.thorClouds) {
        c.swirl += dt * 0.0006;
        c.x -= (c.spd + wind * 4) * dt / 1000;
        const cx = WIDTH * 0.72;
        c.y += Math.sin(now / 560 + c.swirl) * 0.1 * wind;
        c.x += (cx - c.x) * 0.0005 * wind;
        if (c.x + c.w < -80) {
          c.x = WIDTH + rand(0, 180);
          c.y = 4 + rand(0, 180);
        }
      }
      for (const r of state.thorRainDrops) {
        r.y += r.spd; r.x -= r.spd * 0.18;
        if (r.y > HEIGHT + 20) { r.y = -10; r.x = rand(0, WIDTH); }
      }

      const boltDecay = Math.max(0.55, dt / 16.67);
      state.thorBolts.forEach(bolt => { bolt.life -= boltDecay; });
      state.thorFarBolts.forEach(bolt => { bolt.life -= boltDecay * 0.9; });
      state.thorBolts = state.thorBolts.filter(bolt => bolt.life > 0);
      state.thorFarBolts = state.thorFarBolts.filter(bolt => bolt.life > 0);

      for (let i = state.thorShockwaves.length - 1; i >= 0; i--) {
        const wave = state.thorShockwaves[i];
        wave.life -= wave.decay ?? 0.035;
        if (wave.life <= 0) state.thorShockwaves.splice(i, 1);
      }

      for (let i = state.thorRings.length - 1; i >= 0; i--) {
        const ring = state.thorRings[i];
        ring.life -= 0.028;
        ring.radius += 0.9;
        ring.angle += 0.008;
        if (ring.life <= 0) state.thorRings.splice(i, 1);
      }

      for (let i = state.thorDebris.length - 1; i >= 0; i--) {
        const d = state.thorDebris[i];
        if (d.target && d.target.alive) {
          const dx = d.target.x - d.x;
          const dy = d.target.y - d.y;
          const dist = Math.max(14, Math.hypot(dx, dy));
          const pull = d.target.kind === 'big' ? 0.30 : 0.19;
          d.vx += (dx / dist) * pull;
          d.vy += (dy / dist) * pull - 0.02;
        }
        d.x += d.vx; d.y += d.vy; d.rot += d.vr;
        d.vx *= 0.982; d.vy *= 0.982; d.life -= d.decay;
        if (d.life <= 0 || d.y < -80) state.thorDebris.splice(i, 1);
      }
      for (let i = state.thorSparks.length - 1; i >= 0; i--) {
        const s = state.thorSparks[i];
        s.x += s.vx; s.y += s.vy; s.vx *= 0.93; s.vy *= 0.93; s.life -= s.decay;
        if (s.life <= 0) state.thorSparks.splice(i, 1);
      }
      for (let i = state.thorEnergyArcs.length - 1; i >= 0; i--) {
        const e = state.thorEnergyArcs[i];
        e.life -= e.decay;
        if (e.life <= 0) state.thorEnergyArcs.splice(i, 1);
      }

      state.thorParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.984;
        particle.vy *= 0.984;
        particle.life -= particle.decay || 0.018;
      });
      state.thorParticles = state.thorParticles.filter(p => p.life > 0).slice(-360);
    };

    const updateBlizzardSpecial = (now: number, dt: number) => {
      const blizzard = state.blizzard;
      if (blizzard.active) {
        const age = now - blizzard.start;
        blizzard.windPhase += dt * 0.001;
        if (age < 800) blizzard.coverAlpha = easeInOut(age / 800) * 0.72;
        else if (age > blizzard.duration - 800) blizzard.coverAlpha = easeInOut(Math.max(0, 1 - (age - (blizzard.duration - 800)) / 800)) * 0.72;
        else blizzard.coverAlpha = 0.72;

        blizzard.tickAccum += dt;
        while (blizzard.tickAccum >= blizzard.tickInterval) {
          blizzard.tickAccum -= blizzard.tickInterval;
          applyBlizzardTick();
          for (let i = 0; i < 8; i++) {
            state.blizzardSparks.push({
              x: rand(WIDTH * 0.5, WIDTH),
              y: rand(0, HEIGHT),
              vx: rand(-2, -0.4),
              vy: rand(0.2, 1.2),
              life: 1,
              decay: rand(0.08, 0.18),
              color: 'rgba(186,230,253,0.88)',
            });
          }
        }

        blizzard.blockAccum += dt;
        while (blizzard.blockAccum >= blizzard.blockInterval && blizzard.blocksSpawned < 4) {
          blizzard.blockAccum -= blizzard.blockInterval;
          blizzard.blocksSpawned += 1;
          spawnBlizzardIceBlock();
        }

        if (age >= blizzard.duration) {
          blizzard.active = false;
          blizzard.coverAlpha = 0;
        }
      } else {
        blizzard.coverAlpha = Math.max(0, blizzard.coverAlpha - 0.025);
      }

      if (blizzard.active || blizzard.coverAlpha > 0.01) {
        for (const snow of state.blizzardSnowflakes) {
          const speed = Math.max(0.25, blizzard.coverAlpha * 1.4);
          snow.x += snow.wx * speed * dt / 16;
          snow.y += snow.spd * speed * dt / 16;
          snow.phase += dt * 0.003 * snow.drift;
          if (snow.y > HEIGHT + 10) { snow.y = -10; snow.x = rand(WIDTH * 0.5, WIDTH + 60); }
          if (snow.x < WIDTH * 0.5 - 20) { snow.x = WIDTH + rand(0, 60); snow.y = rand(0, HEIGHT); }
        }
      }

      for (let i = state.blizzardIceBlocks.length - 1; i >= 0; i--) {
        const block = state.blizzardIceBlocks[i];
        if (block.exploded) {
          block.life -= 0.06;
          if (block.life <= 0) state.blizzardIceBlocks.splice(i, 1);
          continue;
        }
        block.vy += 0.12;
        block.y += block.vy;
        if (block.y >= block.explodeY) explodeBlizzardIceBlock(block);
        if (block.y > HEIGHT + 100) state.blizzardIceBlocks.splice(i, 1);
      }

      for (let i = state.blizzardShockwaves.length - 1; i >= 0; i--) {
        const wave = state.blizzardShockwaves[i];
        wave.radius += (wave.maxRadius - wave.radius) * 0.072 + 4.6;
        wave.life -= 0.028;
        if (wave.life <= 0 || wave.radius > wave.maxRadius) state.blizzardShockwaves.splice(i, 1);
      }

      for (let i = state.blizzardShards.length - 1; i >= 0; i--) {
        const shard = state.blizzardShards[i];
        shard.x += shard.vx;
        shard.y += shard.vy;
        shard.vy += 0.09;
        shard.vx *= 0.982;
        shard.vy *= 0.982;
        shard.rot += shard.vr;
        shard.life -= shard.decay;
        if (shard.life <= 0) state.blizzardShards.splice(i, 1);
      }

      for (let i = state.blizzardCrystals.length - 1; i >= 0; i--) {
        const crystal = state.blizzardCrystals[i];
        crystal.x += crystal.vx;
        crystal.y += crystal.vy;
        crystal.rot += crystal.vr;
        crystal.life -= crystal.decay;
        if (crystal.life <= 0) state.blizzardCrystals.splice(i, 1);
      }

      for (let i = state.blizzardSparks.length - 1; i >= 0; i--) {
        const spark = state.blizzardSparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.93;
        spark.vy *= 0.93;
        spark.life -= spark.decay;
        if (spark.life <= 0) state.blizzardSparks.splice(i, 1);
      }

      blizzard.shake *= 0.88;
      blizzard.flashAlpha *= 0.84;
    };

    const drawThorBoltPath = (ctx: CanvasRenderingContext2D, points: ThorPoint[]) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    };

    const drawThorLightning = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      [...state.thorFarBolts, ...state.thorBolts].forEach(bolt => {
        const alpha = Math.pow(clamp(bolt.life / bolt.maxLife, 0, 1), 1.45);
        const isFar = state.thorFarBolts.includes(bolt);
        const legacyBolt = bolt as ThorBolt & { paths?: ThorPoint[][]; anchors?: ThorBolt['anchors'] };
        const livePaths: ThorPoint[][] = [];
        if (legacyBolt.anchors) {
          const { x1, y1, x2, y2 } = legacyBolt.anchors;
          const mainPath = buildLightningPoints(x1, y1, x2, y2, 0);
          livePaths.push(mainPath);
          if (!isFar) {
            bolt.branches.forEach(branch => {
              const idx = Math.min(branch.fromIdx, mainPath.length - 1);
              const origin = mainPath[idx];
              livePaths.push(buildLightningPoints(origin.x, origin.y, branch.endX, branch.endY, 1));
            });
          }
        } else if (legacyBolt.paths) {
          livePaths.push(...legacyBolt.paths);
        }
        const passes = isFar
          ? [{ color: `rgba(147,197,253,${0.34 * alpha})`, width: 1.5 }]
          : [
              { color: bolt.color === '#ffffff' ? `rgba(180,220,255,${0.28 * alpha})` : bolt.color === '#fde68a' ? `rgba(253,230,138,${0.28 * alpha})` : `rgba(147,197,253,${0.28 * alpha})`, width: bolt.width + 7 },
              { color: `rgba(255,255,255,${0.96 * alpha})`, width: bolt.width + 2.8 },
              { color: bolt.color === '#ffffff' ? `rgba(255,255,255,${0.9 * alpha})` : bolt.color === '#fde68a' ? `rgba(253,230,138,${0.88 * alpha})` : `rgba(147,197,253,${0.84 * alpha})`, width: bolt.width },
              { color: `rgba(103,232,249,${0.52 * alpha})`, width: 0.8 },
            ];
        passes.forEach(pass => {
          ctx.strokeStyle = pass.color;
          ctx.lineWidth = pass.width;
          livePaths.forEach(path => drawThorBoltPath(ctx, path));
        });
      });
      ctx.restore();
    };

    const drawThorTornado = (ctx: CanvasRenderingContext2D, tornado: ThorTornado, now: number) => {
      const scale = easeInOut(clamp(tornado.birthScale, 0, 1));
      const isBig = tornado.kind === 'big';
      const R = tornado.radius;
      const H = tornado.height;
      const ph = tornado.spin;

      ctx.save();
      ctx.translate(tornado.x, tornado.y);
      ctx.scale(scale, scale);
      ctx.globalCompositeOperation = 'lighter';

      // 1. External halo.
      const halo = ctx.createRadialGradient(0, 0, R * 0.08, 0, 0, R * 2.1);
      halo.addColorStop(0, isBig ? 'rgba(253,230,138,0.22)' : 'rgba(125,211,252,0.14)');
      halo.addColorStop(0.44, 'rgba(56,189,248,0.08)');
      halo.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 2.1, H * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Inner core for the large tornado.
      if (isBig) {
        const core = ctx.createRadialGradient(0, -38, 0, 0, -38, R * 0.88);
        core.addColorStop(0, 'rgba(255,255,255,0.24)');
        core.addColorStop(0.3, 'rgba(253,230,138,0.22)');
        core.addColorStop(0.7, 'rgba(167,139,250,0.10)');
        core.addColorStop(1, 'rgba(253,230,138,0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(0, -38, R * 0.88, H * 0.44, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Helicoidal layers with two interlaced spirals.
      const LAYERS = isBig ? 36 : 18;
      for (let i = 0; i < LAYERS; i++) {
        const p = i / (LAYERS - 1);
        const y = H * 0.48 - p * H;
        const w = R * (0.22 + p * 1.12);
        const h = 7 + p * (isBig ? 26 : 15);
        const spinA = ph + p * 10 + Math.sin(now / 148 + i) * 0.52;
        const xA = Math.sin(spinA) * w * 0.42;
        const alpha = 0.10 + p * (isBig ? 0.36 : 0.28);

        ctx.strokeStyle = isBig
          ? `rgba(253,230,138,${alpha})`
          : `rgba(125,211,252,${alpha})`;
        ctx.lineWidth = isBig ? 4.4 : 2.4;
        ctx.beginPath();
        ctx.ellipse(xA, y, w, h, Math.sin(spinA) * 0.22, 0, Math.PI * 2);
        ctx.stroke();

        const spinB = ph + p * 10 + Math.PI + Math.sin(now / 148 + i) * 0.52;
        const xB = Math.sin(spinB) * w * 0.42;
        ctx.strokeStyle = isBig
          ? `rgba(255,245,180,${alpha * 0.58})`
          : `rgba(186,230,253,${alpha * 0.62})`;
        ctx.lineWidth = isBig ? 2.8 : 1.6;
        ctx.beginPath();
        ctx.ellipse(xB, y, w * 0.74, h * 0.72, Math.sin(spinB) * 0.22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(226,232,240,${alpha * 0.32})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(xA * 0.8, y, w * 0.7, Math.PI * 0.1, Math.PI * 1.22);
        ctx.stroke();

        if (isBig && i % 4 === 0) {
          ctx.strokeStyle = `rgba(253,230,138,${alpha * 0.38})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(xA, y);
          ctx.lineTo(xA * 0.3, y + H * 0.04 * (p < 0.5 ? 1 : -1));
          ctx.stroke();
        }
      }

      // 4. Orbital particles.
      const ORB_N = isBig ? 68 : 36;
      for (let i = 0; i < ORB_N; i++) {
        const p = (i / ORB_N * 1.7 + now / (isBig ? 740 : 700) + tornado.seed) % 1;
        const angle = ph * 1.9 + i * 1.88;
        const orbR = R * (0.20 + p * 1.10);
        const y = H * 0.48 - p * H;
        const x = Math.cos(angle + p * 7.6) * orbR;
        const sz = i % 3 === 0 ? 3.8 : i % 3 === 1 ? 2.2 : 1.2;
        const col = i % 4 === 0 ? 'rgba(253,230,138,0.94)'
          : i % 4 === 1 ? 'rgba(186,230,253,0.68)'
            : i % 4 === 2 ? 'rgba(167,139,250,0.58)'
              : 'rgba(226,232,240,0.46)';

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, sz * (isBig ? 1 : 0.72), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(x, y, sz * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Base cone.
      ctx.globalCompositeOperation = 'source-over';
      const cone = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      cone.addColorStop(0, 'rgba(2,6,23,0)');
      cone.addColorStop(0.7, 'rgba(0,0,8,0.28)');
      cone.addColorStop(1, 'rgba(0,0,8,0.58)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(-R * 0.15, H * 0.48);
      ctx.quadraticCurveTo(0, H * 0.60, R * 0.15, H * 0.48);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawThorSpecial = (ctx: CanvasRenderingContext2D) => {
      if (state.thorPhase === 'idle') return;
      const now = performance.now();
      ctx.save();

      if (state.thorDarkness > 0.01) {
        ctx.fillStyle = `rgba(0,0,0,${state.thorDarkness})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      const columnIntensity = state.thorPhase === 'prelude'
        ? state.thorColumn
        : state.thorPhase === 'small'
          ? Math.max(0, 1 - (now - state.thorPhaseStart) / 1300)
          : state.thorPhase === 'big'
            ? 0.42
            : 0;
      if (columnIntensity > 0.01) {
        const x = WIDTH * 0.72;
        ctx.globalCompositeOperation = 'screen';
        const column = ctx.createLinearGradient(x, 0, x, HEIGHT);
        column.addColorStop(0, `rgba(255,255,255,${0.46 * columnIntensity})`);
        column.addColorStop(0.18, `rgba(103,232,249,${0.3 * columnIntensity})`);
        column.addColorStop(0.68, `rgba(253,230,138,${0.18 * columnIntensity})`);
        column.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = column;
        ctx.beginPath();
        ctx.moveTo(x - 86 * columnIntensity, 0);
        ctx.lineTo(x + 90 * columnIntensity, 0);
        ctx.lineTo(x + 42 * columnIntensity, HEIGHT);
        ctx.lineTo(x - 36 * columnIntensity, HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.55 * columnIntensity})`;
        ctx.fillRect(x - 7 * columnIntensity, 0, 14 * columnIntensity, HEIGHT);
      }

      ctx.globalCompositeOperation = 'lighter';
      state.thorShockwaves.forEach(wave => drawShockwave(ctx, wave));
      state.thorRings.forEach(ring => {
        ctx.globalAlpha = Math.max(0, ring.life);
        ctx.strokeStyle = ring.color.replace('1)', `${0.44 * ring.life})`);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(ring.x, ring.y, ring.radius * 1.62, ring.radius * 0.44, ring.angle, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.22 * ring.life})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(ring.x, ring.y, ring.radius * 1.22, ring.radius * 0.32, -ring.angle * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      if (state.thorPhase === 'small') state.thorSmallTornados.filter(tornado => tornado.alive).forEach(tornado => drawThorTornado(ctx, tornado, now));
      if ((state.thorPhase === 'big' || state.thorPhase === 'ending') && state.thorBigTornado) drawThorTornado(ctx, state.thorBigTornado, now);

      state.thorParticles.forEach(particle => {
        const alpha = Math.max(0, particle.life / (particle.maxLife || 1));
        const particleSize = particle.size ?? particle.sz ?? 2;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = particle.type === 'debris' ? 'source-over' : 'lighter';
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation || 0);
        ctx.fillStyle = particle.color;
        if (particle.type === 'debris') {
          ctx.fillRect(-particleSize / 2, -particleSize / 2, particleSize, particleSize * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, particleSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(-particleSize * 0.2, -particleSize * 0.2, particleSize * 0.32, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      drawThorLightning(ctx);

      if (state.thorFlashAlpha > 0.01) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(219,234,254,${state.thorFlashAlpha})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(1,3,9,0.72)';
      ctx.strokeStyle = 'rgba(253,230,138,0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(18, 118, 330, 46, 7);
      ctx.fill();
      ctx.stroke();
      ctx.font = '900 14px Orbitron, sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.fillText('JURAMENTO DE THOR', 34, 147);
      ctx.restore();
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
        ctx.fillText('HORIZON LASER', WIDTH / 2, 92);
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

    const drawBlizzardSpecial = (ctx: CanvasRenderingContext2D, now: number) => {
      const blizzard = state.blizzard;
      const active = blizzard.active || blizzard.coverAlpha > 0.01 || state.blizzardIceBlocks.length > 0 || state.blizzardShockwaves.length > 0;
      if (!active) return;
      const alpha = blizzard.coverAlpha;

      ctx.save();
      if (alpha > 0.01) {
        const veil = ctx.createLinearGradient(WIDTH * 0.5, 0, WIDTH, 0);
        veil.addColorStop(0, 'rgba(56,130,180,0)');
        veil.addColorStop(0.08, `rgba(56,130,180,${alpha * 0.18})`);
        veil.addColorStop(0.5, `rgba(30,100,160,${alpha * 0.28})`);
        veil.addColorStop(1, `rgba(10,50,120,${alpha * 0.38})`);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = veil;
        ctx.fillRect(WIDTH * 0.5, 0, WIDTH * 0.5, HEIGHT);

        for (let layer = 0; layer < 4; layer++) {
          const phase = blizzard.windPhase * (1 + layer * 0.3) + layer * 1.1;
          const yOff = Math.sin(phase * 0.7 + layer) * 28;
          const layerAlpha = alpha * (0.06 + layer * 0.022);
          const fog = ctx.createLinearGradient(WIDTH * 0.5, 0, WIDTH, 0);
          fog.addColorStop(0, 'rgba(147,197,253,0)');
          fog.addColorStop(0.12, `rgba(147,197,253,${layerAlpha})`);
          fog.addColorStop(0.6 + Math.sin(phase) * 0.15, `rgba(186,230,253,${layerAlpha * 1.4})`);
          fog.addColorStop(1, `rgba(147,197,253,${layerAlpha * 0.8})`);
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = fog;
          ctx.beginPath();
          ctx.ellipse(WIDTH * 0.76, HEIGHT * 0.5 + yOff, WIDTH * 0.38, HEIGHT * (0.42 + layer * 0.06), 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.lineCap = 'round';
        for (let i = 0; i < 22; i++) {
          const progress = ((now * 0.0008 + i * 0.37 + Math.sin(i * 1.3) * 0.5) % 1);
          const x = WIDTH * 0.5 + progress * WIDTH * 0.55;
          const y = (i / 22) * HEIGHT + Math.sin(blizzard.windPhase + i * 0.8) * 28;
          const len = 28 + ((i * 19) % 52);
          const windAlpha = alpha * (0.08 + Math.sin(i * 0.7 + blizzard.windPhase) * 0.04) * (1 - Math.abs(progress - 0.5) * 1.6);
          if (windAlpha <= 0) continue;
          ctx.strokeStyle = `rgba(186,230,253,${windAlpha})`;
          ctx.lineWidth = 0.6 + (i % 5) * 0.12;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - len * 0.9, y + len * 0.22);
          ctx.stroke();
        }

        ctx.globalCompositeOperation = 'lighter';
        state.blizzardSnowflakes.forEach(snow => {
          const pulse = 0.78 + Math.sin(now * 0.002 + snow.phase) * 0.22;
          const snowAlpha = snow.alpha * alpha * pulse;
          if (snowAlpha < 0.01) return;
          ctx.globalAlpha = snowAlpha;
          ctx.fillStyle = 'rgba(186,230,253,1)';
          ctx.beginPath();
          ctx.arc(snow.x, snow.y, snow.sz, 0, Math.PI * 2);
          ctx.fill();
          if (snow.sz > 2.8) {
            ctx.strokeStyle = `rgba(186,230,253,${snowAlpha * 0.6})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(snow.x - snow.sz * 1.6, snow.y);
            ctx.lineTo(snow.x + snow.sz * 1.6, snow.y);
            ctx.moveTo(snow.x, snow.y - snow.sz * 1.6);
            ctx.lineTo(snow.x, snow.y + snow.sz * 1.6);
            ctx.moveTo(snow.x - snow.sz, snow.y - snow.sz);
            ctx.lineTo(snow.x + snow.sz, snow.y + snow.sz);
            ctx.moveTo(snow.x + snow.sz, snow.y - snow.sz);
            ctx.lineTo(snow.x - snow.sz, snow.y + snow.sz);
            ctx.stroke();
          }
        });
        ctx.globalAlpha = 1;
      }

      ctx.globalCompositeOperation = 'lighter';
      state.blizzardShockwaves.forEach(wave => {
        const waveAlpha = Math.max(0, wave.life);
        ctx.globalAlpha = waveAlpha;
        ctx.strokeStyle = wave.color.replace('1)', `${0.44 * waveAlpha})`);
        ctx.lineWidth = wave.width + 1;
        ctx.beginPath();
        if (wave.oval) ctx.ellipse(wave.x, wave.y, wave.radius, wave.radius * 0.62, 0, 0, Math.PI * 2);
        else ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.22 * waveAlpha})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        if (wave.oval) ctx.ellipse(wave.x, wave.y, wave.radius * 0.68, wave.radius * 0.42, 0, 0, Math.PI * 2);
        else ctx.arc(wave.x, wave.y, wave.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      state.blizzardIceBlocks.forEach(block => {
        if (block.exploded) return;
        ctx.save();
        ctx.translate(block.x, block.y);
        ctx.rotate(block.rot + block.vy * 0.01);
        const size = block.sz;
        const points = [
          [-size * 0.52, -size * 0.44],
          [size * 0.48, -size * 0.5],
          [size * 0.54, size * 0.38],
          [size * 0.18, size * 0.52],
          [-size * 0.46, size * 0.46],
          [-size * 0.58, size * 0.08],
        ];
        const face = ctx.createLinearGradient(-size * 0.5, -size * 0.5, size * 0.5, size * 0.5);
        face.addColorStop(0, 'rgba(186,230,253,0.82)');
        face.addColorStop(0.38, 'rgba(147,197,253,0.64)');
        face.addColorStop(0.7, 'rgba(96,165,250,0.52)');
        face.addColorStop(1, 'rgba(30,80,160,0.44)');
        ctx.fillStyle = face;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(186,230,253,0.72)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        block.facets.forEach(facet => {
          ctx.strokeStyle = `rgba(255,255,255,${facet.alpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(facet.ax * size, facet.ay * size);
          ctx.lineTo(facet.bx * size, facet.by * size);
          ctx.stroke();
        });
        ctx.restore();
      });

      state.blizzardShards.forEach(shard => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, shard.life);
        ctx.translate(shard.x, shard.y);
        ctx.rotate(shard.rot);
        const size = shard.sz;
        ctx.fillStyle = shard.color;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.5, -size * 0.28);
        ctx.lineTo(size * 0.5, size * 0.28);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.5, size * 0.28);
        ctx.lineTo(-size * 0.5, -size * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      state.blizzardCrystals.forEach(crystal => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, crystal.life * 0.88);
        ctx.translate(crystal.x, crystal.y);
        ctx.rotate(crystal.rot);
        ctx.strokeStyle = `${crystal.color}0.82)`;
        ctx.lineWidth = Math.max(0.4, crystal.sz * 0.28);
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let arm = 0; arm < 6; arm++) {
          const angle = (arm / 6) * Math.PI * 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * crystal.sz * 1.4, Math.sin(angle) * crystal.sz * 1.4);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.beginPath();
        ctx.arc(0, 0, crystal.sz * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.lineCap = 'round';
      state.blizzardSparks.forEach(spark => {
        ctx.globalAlpha = Math.max(0, spark.life);
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(spark.x - spark.vx * 5, spark.y - spark.vy * 5);
        ctx.stroke();
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (blizzard.flashAlpha > 0.01) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(186,230,253,${blizzard.flashAlpha})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      if (blizzard.active) {
        const elapsed = Math.min(1, (now - blizzard.start) / blizzard.duration);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(1,3,9,0.72)';
        ctx.strokeStyle = 'rgba(125,211,252,0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(18, 118, 330, 46, 7);
        ctx.fill();
        ctx.stroke();
        ctx.font = '900 14px Orbitron, sans-serif';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('BLIZZARD', 34, 147);
        ctx.fillStyle = 'rgba(56,189,248,0.22)';
        ctx.fillRect(160, 137, 154, 5);
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(160, 137, 154 * elapsed, 5);
      }
      ctx.restore();
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      ctx.save();
      const cinematic = state.cinematic;
      const visualTimeScale = cinematic.active ? 0.32 : 1;

      if (state.laserShake > 0.1 || state.hellfireShake > 0.1 || state.trinityShake > 0.1 || state.thorShake > 0.1 || state.blizzard.shake > 0.1 || state.aaaShake > 0.1) {
        const shake = Math.max(state.laserShake, state.hellfireShake, state.trinityShake, state.thorShake, state.blizzard.shake, state.aaaShake);
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        state.laserShake *= 0.88;
        state.hellfireShake *= 0.88;
        state.trinityShake *= 0.88;
        state.thorShake *= 0.88;
        state.blizzard.shake *= 0.88;
        state.aaaShake *= 0.88;
      }

      const background = getImage(backgroundRef.current);
      if (background?.complete && background.naturalWidth > 0) {
        ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
      } else {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      const laserActive = state.laserState !== 'idle';
      const thorActive = state.thorPhase !== 'idle';
      const blizzardActive = state.blizzard.active || state.blizzard.coverAlpha > 0.01;
      ctx.fillStyle = laserActive
        ? 'rgba(29, 3, 39, 0.38)'
        : thorActive
          ? 'rgba(1, 3, 12, 0.36)'
          : blizzardActive
            ? 'rgba(3, 10, 24, 0.42)'
            : 'rgba(2, 6, 23, 0.42)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = laserActive || thorActive || blizzardActive ? 'rgba(34, 211, 238, 0.18)' : 'rgba(34, 211, 238, 0.08)';
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
        ctx.fillText('HORIZON BARRAGE', WIDTH / 2, 92);
        ctx.font = '700 11px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.fillText('INCENDIARY HOMING STRIKE', WIDTH / 2, 112);
        ctx.restore();
        state.hellfireBannerLife -= 1;
      }

      ctx.save();
      state.aaaFlashes.forEach(flash => {
        const alpha = Math.max(0, flash.life / flash.maxLife) * flash.intensity;
        ctx.fillStyle = colorWithAlpha(flash.color, alpha);
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        flash.life -= 0.035 * visualTimeScale;
      });
      state.aaaFlashes = state.aaaFlashes.filter(flash => flash.life > 0).slice(-10);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      state.aaaGlows.forEach(glow => {
        const ease = 1 - Math.max(0, glow.life / glow.maxLife);
        glow.radius += (glow.maxRadius - glow.radius) * 0.22;
        const alpha = Math.max(0, glow.life / glow.maxLife);
        const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, Math.max(1, glow.radius));
        gradient.addColorStop(0, colorWithAlpha(glow.color1, 0.82 * alpha));
        gradient.addColorStop(0.42, colorWithAlpha(glow.color1, 0.26 * alpha));
        gradient.addColorStop(1, glow.color2);
        ctx.globalAlpha = 0.9 + ease * 0.08;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, Math.max(1, glow.radius), 0, Math.PI * 2);
        ctx.fill();
        glow.life -= 0.032 * glow.decay * visualTimeScale;
      });
      state.aaaGlows = state.aaaGlows.filter(glow => glow.life > 0).slice(-26);
      ctx.restore();

      const p = state.player;
      const playerFrameIndex = getPlayerFrameIndex(keysRef.current, now, playerSpriteRef);
      const playerSpritesheet = getImage(PLAYER_SPRITESHEET);
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      if (playerSpritesheet?.complete && playerSpritesheet.naturalWidth > 0) {
        ctx.drawImage(
          playerSpritesheet,
          playerFrameIndex * PLAYER_SPRITE_FRAME_WIDTH,
          0,
          PLAYER_SPRITE_FRAME_WIDTH,
          PLAYER_SPRITE_FRAME_HEIGHT,
          p.x - PLAYER_DRAW_WIDTH / 2,
          p.y - PLAYER_DRAW_HEIGHT / 2,
          PLAYER_DRAW_WIDTH,
          PLAYER_DRAW_HEIGHT
        );
      } else {
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
      }
      ctx.restore();

      state.projectiles.forEach(projectile => {
        if (projectile.special === 'hellfire') {
          drawFireball(ctx, projectile, now);
          return;
        } else if (projectile.trinityShot && projectile.from === 'player') {
          return;
        }

        const angle = Math.atan2(projectile.vy, projectile.vx);
        const isEnemy = projectile.from === 'enemy';
        const isBossShot = projectile.visualType === 'boss';
        const isEliteShot = projectile.visualType === 'elite';
        const coreColor = isBossShot ? '#e879f9' : isEliteShot ? '#fde68a' : projectile.color;
        const glowColor = isBossShot ? 'rgba(168,85,247,0.6)' : isEliteShot ? 'rgba(251,191,36,0.6)' : isEnemy ? 'rgba(239,68,68,0.52)' : 'rgba(34,211,238,0.48)';
        const size = isBossShot ? 9 : isEliteShot ? 6.5 : isEnemy ? 5.4 : 4.8;
        const pulse = 1 + Math.sin(now / 70 + projectile.id) * 0.12;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(projectile.x, projectile.y);
        ctx.rotate(angle);

        const trail = ctx.createLinearGradient(-42, 0, 8, 0);
        trail.addColorStop(0, 'rgba(0,0,0,0)');
        trail.addColorStop(0.42, glowColor);
        trail.addColorStop(1, colorWithAlpha(glowColor, 0.08));
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.ellipse(-22, 0, isBossShot ? 42 : 28, size * 1.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = coreColor;
        ctx.shadowBlur = isBossShot ? 24 : 16;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 2.1 * pulse, size * 1.08 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = isBossShot ? 30 : 18;
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        if (isEnemy) {
          ctx.ellipse(0, 0, size * 1.25, size * 0.72, 0, 0, Math.PI * 2);
        } else {
          ctx.roundRect(-3, -3, 26, 6, 3);
        }
        ctx.fill();

        ctx.strokeStyle = colorWithAlpha(coreColor.startsWith('#') ? 'rgba(255,255,255,0.9)' : coreColor, isBossShot ? 0.55 : 0.35);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 2.8 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      ctx.save();
      state.hellfireShockwaves.forEach(wave => {
        ctx.globalCompositeOperation = 'lighter';
        drawShockwave(ctx, wave);
        wave.life -= (wave.decay || 0.035) * visualTimeScale;
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
        particle.life -= 1 * visualTimeScale;
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
        wave.life -= (wave.decay || 0.04) * visualTimeScale;
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
        particle.life -= 0.032 * visualTimeScale;
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
        particle.vx *= particle.drag || 0.95;
        particle.vy = particle.vy * (particle.drag || 0.95) + (particle.type === 'debris' ? 0.035 : 0);
        particle.size = Math.max(0.1, particle.size + (particle.growth || 0));
        particle.rotation = (particle.rotation || 0) + (particle.spin || 0);
        particle.life -= 0.035 * visualTimeScale;
        const alpha = Math.max(0, particle.life / (particle.maxLife || 1));
        ctx.globalAlpha = alpha;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        if (particle.rotation) {
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.fillRect(-particle.size * 0.55, -particle.size * 0.22, particle.size * 1.1, particle.size * 0.44);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      state.impactParticles = state.impactParticles.filter(particle => particle.life > 0);
      ctx.restore();

      ctx.save();
      state.aaaSmokeRings.forEach(ring => {
        ring.x += ring.vx;
        ring.y += ring.vy;
        ring.radius += ring.grow * 0.06;
        ring.life -= 0.022 * visualTimeScale;
        const alpha = Math.max(0, ring.life / ring.maxLife);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha * 0.42;
        ctx.strokeStyle = colorWithAlpha(ring.color, 0.28 * alpha);
        ctx.lineWidth = Math.max(1, 7 * alpha);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
      });
      state.aaaSmokeRings = state.aaaSmokeRings.filter(ring => ring.life > 0).slice(-80);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      state.aaaStreaks.forEach(streak => {
        streak.x += streak.vx;
        streak.y += streak.vy;
        streak.vx *= streak.drag;
        streak.vy *= streak.drag;
        streak.life -= 0.026 * visualTimeScale;
        const alpha = Math.max(0, streak.life / streak.maxLife);
        const angle = Math.atan2(streak.vy, streak.vx);
        const tailX = streak.x - Math.cos(angle) * streak.length;
        const tailY = streak.y - Math.sin(angle) * streak.length;
        const gradient = ctx.createLinearGradient(streak.x, streak.y, tailX, tailY);
        gradient.addColorStop(0, colorWithAlpha(streak.color.startsWith('#') ? 'rgba(255,255,255,0.95)' : streak.color, alpha));
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(0.5, streak.width * alpha);
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      });
      state.aaaStreaks = state.aaaStreaks.filter(streak => streak.life > 0).slice(-140);
      ctx.restore();

      ctx.save();
      state.aaaDebris.forEach(debris => {
        debris.trail.push({ x: debris.x, y: debris.y });
        if (debris.trail.length > 8) debris.trail.shift();
        debris.x += debris.vx;
        debris.y += debris.vy;
        debris.vx *= debris.drag;
        debris.vy = debris.vy * debris.drag + debris.gravity;
        debris.rotation += debris.spin;
        debris.life -= 0.018 * visualTimeScale;
        if (debris.y > HEIGHT * 0.9 && debris.bounces < debris.maxBounces) {
          debris.y = HEIGHT * 0.9;
          debris.vy *= -0.42;
          debris.vx *= 0.72;
          debris.bounces += 1;
        }
        const alpha = Math.max(0, debris.life / debris.maxLife);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        if (debris.trail.length > 1) {
          ctx.strokeStyle = colorWithAlpha('rgba(251,146,60,0.34)', 0.24 * alpha);
          ctx.lineWidth = Math.max(1, debris.size * 0.42);
          ctx.beginPath();
          ctx.moveTo(debris.trail[0].x, debris.trail[0].y);
          debris.trail.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        }
        ctx.translate(debris.x, debris.y);
        ctx.rotate(debris.rotation);
        ctx.fillStyle = debris.color;
        ctx.fillRect(-debris.size / 2, -debris.size / 2, debris.size, debris.size * 0.62);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      });
      state.aaaDebris = state.aaaDebris.filter(debris => debris.life > 0).slice(-120);
      ctx.restore();

      state.enemies.forEach(enemy => {
        const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;
        const shocked = enemy.status.shockedUntil && enemy.status.shockedUntil > now;
        const burning = enemy.status.burningUntil && enemy.status.burningUntil > now;

        ctx.save();
        ctx.shadowColor = burning ? '#f97316' : shocked ? '#38bdf8' : slowed ? '#a5f3fc' : '#ef4444';
        drawSpriteSheetOrFallback(ctx, enemy, now, () => {
          ctx.fillStyle = ctx.shadowColor;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        if (enemy.maxShield > 0 && enemy.shield > 0) {
          ctx.fillStyle = 'rgba(15,23,42,0.9)';
          ctx.fillRect(enemy.x - 34, enemy.y - enemy.height / 2 - 22, 68, 4);
          ctx.fillStyle = isMonsterKind(enemy.kind) ? '#c084fc' : '#38bdf8';
          ctx.fillRect(enemy.x - 34, enemy.y - enemy.height / 2 - 22, 68 * Math.max(0, enemy.shield / enemy.maxShield), 4);
        }
        ctx.fillStyle = '#111827';
        ctx.fillRect(enemy.x - 34, enemy.y - enemy.height / 2 - 14, 68, 4);
        ctx.fillStyle = enemy.kind === 'boss-ship' ? '#f97316' : enemy.kind === 'elite-ship' ? '#eab308' : '#22c55e';
        ctx.fillRect(enemy.x - 34, enemy.y - enemy.height / 2 - 14, 68 * Math.max(0, enemy.hp / enemy.maxHp), 4);
        ctx.textAlign = 'start';
      });

      state.floats.forEach(float => {
        ctx.globalAlpha = Math.max(0, float.life / float.maxLife);
        ctx.fillStyle = float.color;
        ctx.shadowColor = float.shadowColor || 'transparent';
        ctx.shadowBlur = float.shadowColor && float.shadowColor !== 'transparent' ? 12 : 0;
        ctx.font = float.size > 16 ? `900 ${float.size}px Orbitron, sans-serif` : `bold ${float.size}px monospace`;
        ctx.fillText(float.text, float.x, float.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      drawThorSpecial(ctx);
      drawBlizzardSpecial(ctx, now);
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
      if (isPausedRef.current) {
        draw();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const now = performance.now();
      if (state.pendingResult) {
        draw();
        if (now >= state.pendingResultAt) {
          state.ended = true;
          setResult(state.pendingResult);
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const thorDt = state.thorLastUpdate > 0 ? Math.min(60, now - state.thorLastUpdate) : 16.67;
      state.thorLastUpdate = now;
      const keys = keysRef.current;
      const p = state.player;
      const timeScale = state.cinematic.active ? 0.28 : 1;

      if (keys.w || keys.arrowup) p.y -= 4.5 * timeScale;
      if (keys.s || keys.arrowdown) p.y += 4.5 * timeScale;
      if (keys.a || keys.arrowleft) p.x -= 4.5 * timeScale;
      if (keys.d || keys.arrowright) p.x += 4.5 * timeScale;
      p.x = clamp(p.x, 60, WIDTH * 0.45);
      p.y = clamp(p.y, 45, HEIGHT - 45);

      // Player engine smoke trail
      if (Math.random() > 0.35) {
        const trailOffset = rand(-6, 6);
        spawnSmokeParticle(
          p.x - 36,
          p.y + trailOffset,
          rand(-1.8, -0.5),
          rand(-0.3, 0.3),
          rand(7, 16),
          rand(55, 90)
        );
      }
      if (Math.random() > 0.65) {
        spawnEmberParticle(
          p.x - 30,
          p.y + rand(-4, 4),
          rand(-2.5, -1.0),
          rand(-0.5, 0.5),
          rand(1.5, 3.5),
          rand(18, 34)
        );
      }

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
      updateThorSpecial(now, thorDt);
      updateBlizzardSpecial(now, thorDt);
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
        const previousX = enemy.x;
        const previousY = enemy.y;
        if (enemy.x > minEnemyX) {
          enemy.x = Math.max(minEnemyX, enemy.x - enemy.speed * (slowed ? 0.45 : 1) * timeScale);
        }
        enemy.y += Math.sin(now / 420 + enemy.frameOffset) * (enemy.kind.includes('monster') ? 0.75 : 0.35) * timeScale;
        enemy.y = clamp(enemy.y, 52, HEIGHT - 52);
        enemy.visualDx = enemy.x - previousX;
        enemy.visualDy = enemy.y - previousY;
        // Enemy engine smoke trail (non-bosses only)
        if (!enemy.kind.includes('monster') && Math.random() > 0.45) {
          spawnSmokeParticle(
            enemy.x + 32,
            enemy.y + rand(-6, 6),
            rand(0.4, 1.8),
            rand(-0.3, 0.3),
            rand(5, 12),
            rand(40, 70)
          );
        }
        if (!enemy.kind.includes('monster') && Math.random() > 0.72) {
          spawnEmberParticle(
            enemy.x + 28,
            enemy.y + rand(-4, 4),
            rand(0.8, 2.8),
            rand(-0.4, 0.4),
            rand(1.2, 2.8),
            rand(14, 28)
          );
        }
        fireEnemyShot(enemy);

        if (enemy.status.burningUntil && enemy.status.burningUntil > now && now - (enemy.status.lastBurnTick || 0) > 650) {
          const burn = shipStats.damage * (shipStats.conditionalBonuses.burningDamageOverTimePercent / 100);
          damageEnemyHull(enemy, burn);
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
        projectile.x += projectile.vx * timeScale;
        projectile.y += projectile.vy * timeScale;

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
        } else if (projectile.from === 'enemy' && Math.random() > 0.38) {
          const backAngle = Math.atan2(-projectile.vy, -projectile.vx);
          const bossLike = projectile.visualType === 'boss';
          const eliteLike = projectile.visualType === 'elite';
          state.impactParticles.push({
            x: projectile.x + Math.cos(backAngle) * rand(4, 12),
            y: projectile.y + Math.sin(backAngle) * rand(4, 12),
            vx: Math.cos(backAngle) * rand(0.4, 1.4) + rand(-0.45, 0.45),
            vy: Math.sin(backAngle) * rand(0.4, 1.4) + rand(-0.45, 0.45),
            life: 0.24,
            maxLife: 0.32,
            size: rand(1.2, bossLike ? 3.6 : 2.6),
            drag: 0.88,
            color: bossLike ? pick(['#c084fc', '#e879f9', '#fb923c']) : eliteLike ? pick(['#facc15', '#fde68a', '#fb923c']) : pick(['#ef4444', '#fb7185', '#fca5a5']),
          });
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
                const explosionRadius = 140;
                const areaDamage = shipStats.damage * HORIZON_BARRAGE_AREA_DAMAGE_MULTIPLIER;
                state.enemies.forEach(otherEnemy => {
                  if (otherEnemy !== enemy && otherEnemy.hp > 0) {
                    const odx = otherEnemy.x - enemy.x;
                    const ody = otherEnemy.y - enemy.y;
                    if (Math.sqrt(odx * odx + ody * ody) < explosionRadius + otherEnemy.radius) {
                      damageEnemyHull(otherEnemy, areaDamage);
                      spawnFloat(otherEnemy.x + (Math.random() * 20 - 10), otherEnemy.y - 20, `${Math.round(areaDamage)} AREA`, '#fb923c');
                    }
                  }
                });
              }
              projectile.x = WIDTH + 999;
            }
          });
        } else {
          const dx = p.x - projectile.x;
          const dy = p.y - projectile.y;
          if (Math.sqrt(dx * dx + dy * dy) < 34) {
            damagePlayer(projectile.damage);
            spawnPlayerImpact(projectile.x, projectile.y, projectile);
            projectile.x = -999;
          }
        }
      });

      state.enemies = state.enemies.filter(enemy => {
        if (enemy.hp <= 0) {
          state.kills += 1;
          if (isMonsterKind(enemy.kind)) state.bossesDefeated += 1;
          else state.regularEnemiesDefeated += 1;
          const canGainHorizonXp = horizonProgressRef.current.level < Math.max(1, Math.min(MAX_HORIZON_LEVEL, Math.floor(Number(horizonMaxLevel) || MAX_HORIZON_LEVEL)));
          if (canGainHorizonXp) state.earnedXp += enemy.xp;
          awardHorizonXp(enemy.xp);
          state.earnedQc += enemy.qc;
          spawnEnemyDeathExplosion(enemy);
          if (isMonsterKind(enemy.kind)) {
            state.monsterDefeated = true;
            startBattleCinematic('boss', enemy.x, enemy.y, now);
            stopBattleSound(enemy.screamAudio);
          }
          stopBattleSound(enemy.engineAudio);
          playRoute4EnemyExplosionSfx(enemy);
          return false;
        }
        const staysOnScreen = enemy.x > -90;
        if (!staysOnScreen) stopBattleSound(enemy.engineAudio);
        return staysOnScreen;
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
        startBattleCinematic('player', p.x, p.y, now);
        spawnEnemyDeathExplosion({
          id: -1,
          kind: 'boss-ship',
          level: 1,
          x: p.x,
          y: p.y,
          hp: 0,
          maxHp: 1,
          shield: 0,
          maxShield: 0,
          speed: 0,
          radius: 34,
          width: PLAYER_DRAW_WIDTH,
          height: PLAYER_DRAW_HEIGHT,
          damage: 0,
          status: {},
          attackCooldown: 0,
          image: PLAYER_IMAGE,
          shootSound: '',
          frameOffset: 0,
          xp: 0,
          qc: 0,
        });
        playSound(pick(ROUTE4_COMMON_ENEMY_EXPLOSION_SOUNDS), 0.82);
        stopLoopingBattleSounds();
        setHud({ hp: 0, shield: Math.max(0, p.shield), kills: state.regularEnemiesDefeated, earnedXp: state.earnedXp, earnedQc: state.earnedQc, enemies: state.enemies.length, ended: true, result: 'defeat' });
        state.pendingResult = 'defeat';
        state.pendingResultAt = now + RESULT_MODAL_DELAY_MS;
        draw();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (state.regularEnemiesDefeated >= REGULAR_ENEMIES_BEFORE_FINAL_BOSS && state.monsterDefeated) {
        stopLoopingBattleSounds();
        const victoryRewardScale = 1 + Math.max(0, currentDefenseBattleLevel - 1) * 0.1;
        const victoryXp = Math.round(450 * victoryRewardScale);
        const victoryQc = Math.round(35000 * victoryRewardScale);
        const canGainHorizonXp = horizonProgressRef.current.level < Math.max(1, Math.min(MAX_HORIZON_LEVEL, Math.floor(Number(horizonMaxLevel) || MAX_HORIZON_LEVEL)));
        if (canGainHorizonXp) state.earnedXp += victoryXp;
        awardHorizonXp(victoryXp);
        state.earnedQc += victoryQc;
        setHud({ hp: p.hp, shield: p.shield, kills: state.regularEnemiesDefeated, earnedXp: state.earnedXp, earnedQc: state.earnedQc, enemies: state.enemies.length, ended: true, result: 'victory' });
        state.pendingResult = 'victory';
        state.pendingResultAt = now + RESULT_MODAL_DELAY_MS;
        draw();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      updateSpecialHud(now);
      draw();
      setHud({ hp: p.hp, shield: p.shield, kills: state.regularEnemiesDefeated, earnedXp: state.earnedXp, earnedQc: state.earnedQc, enemies: state.enemies.length, ended: false, result: '' });
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
  }, [shipStats, specials, horizonLevel, horizonXp, horizonNextXp, horizonMaxLevel, trinityShotEnabled, currentDefenseBattleLevel]);

  const finishResult = () => {
    if (result === 'victory') {
      onVictory({
        kills: hud.kills,
        bossesDefeated: stateRef.current.bossesDefeated,
        xp: hud.earnedXp,
        qc: hud.earnedQc,
        levelUpSfxHandled: levelUpSfxHandledRef.current,
        perfect: stateRef.current.player.hp >= shipStats.health && stateRef.current.player.shield >= shipStats.shield,
      });
      return;
    }
    if (result === 'defeat') {
      onDefeat();
    }
  };

  const returnFromPause = () => {
    isPausedRef.current = false;
    setIsPaused(false);
    keysRef.current = {};
    setResult('defeat');
    onDefeat();
    onClose();
  };
  const safeHorizonMaxLevel = Math.max(1, Math.min(MAX_HORIZON_LEVEL, Math.floor(Number(horizonMaxLevel) || MAX_HORIZON_LEVEL)));
  const isHorizonAtMaxLevel = horizonHud.level >= safeHorizonMaxLevel || horizonHud.nextXp <= 0;
  const xpPercent = isHorizonAtMaxLevel ? 100 : Math.min(100, (horizonHud.currentXp / horizonHud.nextXp) * 100);
  const getSpecialButtonState = (specialId?: DefenseSpecialId) => {
    const remainingMs = specialId ? Math.max(0, (specialHud.cooldowns[specialId] || 0) - specialHud.now) : 0;
    const cooldownSeconds = Math.ceil(remainingMs / 1000);
    return {
      disabled: !specialId || specialHud.effectActive || remainingMs > 0,
      label: !specialId
        ? t('Empty', 'Vazio')
        : remainingMs > 0
        ? `${cooldownSeconds}s`
        : specialHud.effectActive
          ? t('Active', 'Ativo')
          : t('Ready', 'Pronto'),
    };
  };
  const specialOneButton = getSpecialButtonState(specials[0]);
  const specialTwoButton = getSpecialButtonState(specials[1]);

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
                {!isHorizonAtMaxLevel && (
                  <p className="font-mono text-[9px] uppercase tracking-widest text-amber-100">+{hud.earnedXp} XP</p>
                )}
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/55">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-300 to-emerald-300" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
          <div className="flex justify-end">
            <PremiumCanvasButton
              type="button"
              onClick={onClose}
              disabled={Boolean(result)}
              tone="steel"
              className="h-10 w-10 rounded-xl"
              contentClassName="text-zinc-200"
            >
              <X size={18} />
            </PremiumCanvasButton>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative min-h-0 overflow-hidden bg-black">
            {isPaused && (
              <BattlePauseDialog
                language={language}
                onContinue={() => {
                  isPausedRef.current = false;
                  setIsPaused(false);
                }}
                onReturn={returnFromPause}
              />
            )}
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="h-full w-full" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-cyan-300/20 bg-black/55 px-4 py-3 backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">{t('Objective', 'Objetivo')}</p>
              <p className="mt-1 font-orbitron text-sm font-black uppercase text-white">{t('Neutralize 20 enemies and the final boss', 'Neutralize 20 inimigos e o boss final')}</p>
            </div>

            {!result && (
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-zinc-300 backdrop-blur-md">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{t('Movement', 'Movimento')}</p>
                  <p className="mt-1 font-orbitron text-[12px] font-black uppercase text-white">{t('WASD · click target · C/F specials', 'WASD · clique no alvo · C/F especiais')}</p>
                </div>

                <div className="flex items-center gap-3">
                  <PremiumCanvasButton
                    type="button"
                    onClick={() => { controlsRef.current.specialOne += 1; }}
                    disabled={specialOneButton.disabled}
                    tone="purple"
                    className="h-16 w-36 rounded-2xl"
                    contentClassName="flex-col px-3 text-[11px] font-black uppercase tracking-[0.16em] text-fuchsia-100"
                  >
                    <span className="block text-[9px] opacity-65">C</span>
                    <span>{SPECIAL_LABEL[specials[0]]?.[language] || t('Special 1', 'Especial 1')}</span>
                    <span className="mt-0.5 block font-mono text-[9px] tracking-widest opacity-70">{specialOneButton.label}</span>
                  </PremiumCanvasButton>
                  <PremiumCanvasButton
                    type="button"
                    onClick={() => { controlsRef.current.specialTwo += 1; }}
                    disabled={specialTwoButton.disabled}
                    tone="orange"
                    className="h-16 w-36 rounded-2xl"
                    contentClassName="flex-col px-3 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100"
                  >
                    <span className="block text-[9px] opacity-65">F</span>
                    <span>{SPECIAL_LABEL[specials[1]]?.[language] || t('Special 2', 'Especial 2')}</span>
                    <span className="mt-0.5 block font-mono text-[9px] tracking-widest opacity-70">{specialTwoButton.label}</span>
                  </PremiumCanvasButton>
                </div>
              </div>
            )}

            {result && resultVisible && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/78 p-6 backdrop-blur-sm">
                <div
                  className={`relative flex aspect-video w-[min(92vw,1120px)] max-h-[88vh] flex-col justify-center overflow-hidden rounded-[2rem] border bg-cover bg-center p-10 text-center shadow-[0_0_90px_rgba(255,255,255,0.14)] ${
                  result === 'victory'
                    ? 'border-emerald-300/40 bg-emerald-950/35'
                    : 'border-rose-400/40 bg-rose-950/35'
                }`}
                  style={{ backgroundImage: resultBackground ? `url(${resultBackground})` : undefined }}
                >
                  <div className="absolute inset-0 bg-black/50" />
                  <div className={`absolute inset-0 ${
                    result === 'victory'
                      ? 'bg-gradient-to-b from-emerald-950/30 via-black/10 to-emerald-950/55'
                      : 'bg-gradient-to-b from-rose-950/35 via-black/15 to-rose-950/60'
                  }`} />
                  <div className="relative z-10 mx-auto flex w-full max-w-[940px] flex-col">
                    <p className={`font-mono text-[10px] uppercase tracking-[0.45em] ${result === 'victory' ? 'text-emerald-200' : 'text-rose-200'}`}>
                      {result === 'victory' ? t('Defense Complete', 'Defesa Concluída') : t('Defense Failed', 'Defesa Fracassou')}
                    </p>
                    <h2 className={`mt-3 font-orbitron text-6xl font-black uppercase tracking-tight ${result === 'victory' ? 'text-emerald-300' : 'text-rose-400'}`}>
                      {result === 'victory' ? t('Victory', 'Vitória') : t('Defeat', 'Derrota')}
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-relaxed text-zinc-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                      {result === 'victory'
                        ? t('The threat was neutralized and the expedition corridor is safe again.', 'A ameaça foi neutralizada e o corredor da expedição está seguro novamente.')
                        : t('The Horizon was forced to retreat. The threat remains registered for another defense attempt.', 'A Horizon foi forçada a recuar. A ameaça permanece registrada para outra tentativa de defesa.')}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-sm">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">{t('Targets', 'Alvos')}</p>
                        <p className="mt-2 font-orbitron text-3xl font-black text-white">{hud.kills} / 20</p>
                      </div>
                      {!isHorizonAtMaxLevel && (
                        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/15 p-5 backdrop-blur-sm">
                          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">XP</p>
                          <p className="mt-2 font-orbitron text-3xl font-black text-white">+{hud.earnedXp}</p>
                        </div>
                      )}
                      <div className="rounded-2xl border border-yellow-300/25 bg-yellow-300/15 p-5 backdrop-blur-sm">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-yellow-200">QC</p>
                        <p className="mt-2 font-orbitron text-3xl font-black text-white">+{hud.earnedQc.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-sm">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">{t('Hull', 'Vida')}</p>
                        <p className="mt-2 font-orbitron text-3xl font-black text-white">{Math.ceil(hud.hp)}</p>
                      </div>
                    </div>
                    <PremiumCanvasButton
                      type="button"
                      onClick={finishResult}
                      tone={result === 'victory' ? 'green' : 'red'}
                      className="mx-auto mt-8 h-16 w-full max-w-[760px] rounded-2xl"
                      contentClassName="px-5 text-sm font-black uppercase tracking-[0.25em] text-white"
                    >
                      {t('Continue', 'Continuar')}
                    </PremiumCanvasButton>
                  </div>
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
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300">
                  {isHorizonAtMaxLevel ? `+${hud.earnedQc.toLocaleString()} QC` : `+${hud.earnedXp} XP · +${hud.earnedQc.toLocaleString()} QC`}
                </p>
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
