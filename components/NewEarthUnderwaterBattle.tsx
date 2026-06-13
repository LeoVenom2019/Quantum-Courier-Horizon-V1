'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { NEW_EARTH_SUBMARINE_DEPTH_STAGES } from '@/lib/new-earth-submarines';
import { NEW_EARTH_TREASURES_BY_RARITY, type NewEarthTreasure } from '@/lib/new-earth-treasures';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';

export type UnderwaterBattleSiteId = 'oceano-abissal' | 'cemiterio-navios';
type UnderwaterSubmarineColonyId = 'colony-2' | 'colony-4';
type PlayerSubmarineSpriteKey =
  | 'front'
  | 'back'
  | 'up'
  | 'down'
  | 'down_front'
  | 'down_back'
  | 'up_back'
  | 'up_front'
  | 'turn_1'
  | 'turn_2'
  | 'turn_3'
  | 'turn_back_1'
  | 'turn_back_2'
  | 'turn_back_3';

type PlayerSpriteVisualState = {
  key: PlayerSubmarineSpriteKey;
  turnFrom: 'front' | 'back' | null;
  turnTo: 'front' | 'back' | null;
  turnStartedAt: number;
  useBackTurnArc: boolean;
};

type EnemySubmarineSpriteSetId = 'enemy_submarine1' | 'enemy_submarine2' | 'enemy_submarine3';

type EnemyVisualState = PlayerSpriteVisualState & {
  spriteSetId: EnemySubmarineSpriteSetId;
};

interface NewEarthUnderwaterBattleProps {
  language: 'en' | 'pt';
  siteId: UnderwaterBattleSiteId;
  colonyId: UnderwaterSubmarineColonyId;
  colonyName: string;
  musicOn?: boolean;
  submarineStats: {
    maxDepth: number;
    hullResistance: number;
    treasurePotential: number;
    missileDamageBonus: number;
    missileSpeedBonus: number;
    speedBonus: number;
    oxygenSeconds?: number;
  };
  onVictory?: () => void;
  onDefeat?: () => void;
  onTreasureLoot?: (payload: TreasureRewardPayload) => void;
  defenseBattleLevel: number;
  onClose: () => void;
}

type VecEntity = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  visual: EnemyVisualState;
};

type PlayerEntity = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  angle: number;
  thrust: number;
  lastThrustAt: number;
};

type Shot = {
  id: number;
  from: 'player' | 'enemy';
  ownerId: string;
  targetId?: number | null;
  angle: number;
  speed: number;
  wakeSeed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  life: number;
  trail: { x: number; y: number }[];
  guideStrength: number;
  wobble: number;
  wobbleVel: number;
  launchAudio?: HTMLAudioElement | null;
};

type AimState = {
  x: number;
  y: number;
  inside: boolean;
  hoveredEnemyId: number | null;
  hoverStartedAt: number;
  lockedEnemyId: number | null;
  clickQueued: boolean;
};

type Bubble = {
  x: number;
  y: number;
  speed: number;
  radius: number;
  drift: number;
  wobble: number;
  depth: number;
  alpha: number;
  shine: number;
};

type TreasureRarity = 'normal' | 'rare' | 'legendary' | 'epic';

type TreasureRewardPayload = {
  type: string;
  amount: number;
  relic?: NewEarthTreasure;
};

type Treasure = {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulse: number;
  visible: boolean;
  hits: number;
  open: boolean;
  colorVariant: string;
  rarity: TreasureRarity;
  rewardPayload: TreasureRewardPayload;
};

type ImpactBurst = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  maxR: number;
  color: string;
  delay?: number;
};

type CombatParticle = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  r: number;
  type: 'bubble' | 'spark' | 'launch_ring' | 'debris';
  vx?: number;
  vy?: number;
  color?: string;
  maxR?: number;
  angle?: number;
  rotVel?: number;
};

type WakeBubble = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  alpha: number;
  wobblePhase: number;
  wobbleFreq: number;
};

type WakeVortex = {
  x: number;
  y: number;
  side: number;
  strength: number;
  life: number;
  maxLife: number;
  vx: number;
  angle: number;
};

type FloatingText = {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
};

type SpotlightParticle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  freq: number;
  alpha: number;
  type: number;
};

const WIDTH = 1280;
const HEIGHT = 720;
const PLAYER_ACCELERATION = 0.1;
const PLAYER_MAX_SPEED = 2.55;
const PLAYER_WATER_DRAG = 0.972;
const PLAYER_SHOT_SPEED = 4.4;
const PLAYER_TORPEDO_LOCK_MS = 1800;
const ENEMY_SHOT_SPEED = 2.4;
const NEXT_ENEMY_SPAWN_MIN_MS = 1500;
const NEXT_ENEMY_SPAWN_MAX_MS = 2500;
const MAX_ACTIVE_ENEMIES = 1;
const TARGET_KILLS = 3;
const DARKNESS_MULTIPLIER = 0.72;
const FOREGROUND_DEBRIS_COUNT = 18;
const PLAYER_SPRITE_TURN_FRAME_MS = 70;
const PLAYER_IDLE_BOB_AMPLITUDE = 3.5;
const UNDERWATER_SFX_BASE = '/assets/rota4/SFX_new_land';
const UNDERWATER_MYSTERY_SFX = [
  `${UNDERWATER_SFX_BASE}/abissal_sounds_1_mistery.ogg`,
  `${UNDERWATER_SFX_BASE}/abissal_sounds_2_mistery.ogg`,
  `${UNDERWATER_SFX_BASE}/abissal_sounds_3_mistery.ogg`,
];
const UNDERWATER_OCEAN_AMBIENT_SFX = [
  `${UNDERWATER_SFX_BASE}/submarine_ocean_sounds_1.ogg`,
  `${UNDERWATER_SFX_BASE}/submarine_ocean_sounds_2.ogg`,
];
const ENEMY_SUBMARINE_ENTER_SFX = `${UNDERWATER_SFX_BASE}/enemy_submarine_enter.ogg`;
const PLAYER_TORPEDO_LAUNCH_SFX = `${UNDERWATER_SFX_BASE}/player_torped_launcher.ogg`;
const PLAYER_TORPEDO_IMPACT_SFX = `${UNDERWATER_SFX_BASE}/player_torped_impact.ogg`;
const SUBMARINE_ENTER_SFX = `${UNDERWATER_SFX_BASE}/submarine_enter.ogg`;
const RADAR_SUBMARINE_SFX = `${UNDERWATER_SFX_BASE}/radar_submarine_1.ogg`;
const SUBMARINE_AIM_GREEN_SFX = `${UNDERWATER_SFX_BASE}/submarine_aim_green.ogg`;
const SUBMARINE_PLAYER_CONSTANT_SFX = `${UNDERWATER_SFX_BASE}/submarine_player_constant.ogg`;
const SUBMARINE_PLAYER_STOPPING_SFX = `${UNDERWATER_SFX_BASE}/submarine_player_stoping.ogg`;
const SUBMARINE_EXPLOSION_SFX = [
  `${UNDERWATER_SFX_BASE}/submarine_explosion1.ogg`,
  `${UNDERWATER_SFX_BASE}/submarine_explosion_2.ogg`,
  `${UNDERWATER_SFX_BASE}/submarine_explosion_3.ogg`,
];
const SUBMARINE_MOTION_SFX = [
  `${UNDERWATER_SFX_BASE}/submarine_motion_1.ogg`,
  `${UNDERWATER_SFX_BASE}/submarine_motion_2.ogg`,
];
const UNDERWATER_THEME_BASE = '/assets/rota4/themes_ocean';
const UNDERWATER_THEME_TRACKS: Record<UnderwaterBattleSiteId, string[]> = {
  'oceano-abissal': [
    `${UNDERWATER_THEME_BASE}/abyssal_whispers.ogg`,
    `${UNDERWATER_THEME_BASE}/bioluminescent_dreams.ogg`,
    `${UNDERWATER_THEME_BASE}/deep_sea_serenity.ogg`,
    `${UNDERWATER_THEME_BASE}/underwater_colors.ogg`,
  ],
  'cemiterio-navios': [
    `${UNDERWATER_THEME_BASE}/sunken_silence.ogg`,
    `${UNDERWATER_THEME_BASE}/ocean_floor_slumber.ogg`,
    `${UNDERWATER_THEME_BASE}/gentle_tides.ogg`,
    `${UNDERWATER_THEME_BASE}/floating_coral.ogg`,
  ],
};
const GAIA_NEPTUNE_SUBMARINE_BASE = '/assets/rota4/colonys/gaia/gaia_submarine_neptune';
const EDEN_POSEIDON_SUBMARINE_BASE = '/assets/rota4/colonys/eden/eden_submarine_poseidon';
const createSubmarineSpriteSet = (base: string, prefix: string): Record<PlayerSubmarineSpriteKey, string> => ({
  front: `${base}/${prefix}_front.webp`,
  back: `${base}/${prefix}_back.webp`,
  up: `${base}/${prefix}_up.webp`,
  down: `${base}/${prefix}_down.webp`,
  down_front: `${base}/${prefix}_down_front.webp`,
  down_back: `${base}/${prefix}_down_back.webp`,
  up_back: `${base}/${prefix}_up_back.webp`,
  up_front: `${base}/${prefix}_up_front.webp`,
  turn_1: `${base}/${prefix}_turn_1.webp`,
  turn_2: `${base}/${prefix}_turn_2.webp`,
  turn_3: `${base}/${prefix}_turn_3.webp`,
  turn_back_1: `${base}/${prefix}_turn_back_1.webp`,
  turn_back_2: `${base}/${prefix}_turn_back_2.webp`,
  turn_back_3: `${base}/${prefix}_turn_back_3.webp`,
});
const PLAYER_SUBMARINE_SPRITES: Record<UnderwaterSubmarineColonyId, Record<PlayerSubmarineSpriteKey, string> | null> = {
  'colony-4': createSubmarineSpriteSet(GAIA_NEPTUNE_SUBMARINE_BASE, 'gaia'),
  'colony-2': createSubmarineSpriteSet(EDEN_POSEIDON_SUBMARINE_BASE, 'eden'),
};
const ENEMY_SUBMARINE_SPRITES: Record<EnemySubmarineSpriteSetId, Record<PlayerSubmarineSpriteKey, string>> = {
  enemy_submarine1: createSubmarineSpriteSet('/assets/rota4/colonys/enemy_submarine1', 'enemy_submarine1'),
  enemy_submarine2: createSubmarineSpriteSet('/assets/rota4/colonys/enemy_submarine2', 'enemy_submarine2'),
  enemy_submarine3: createSubmarineSpriteSet('/assets/rota4/colonys/enemy_submarine3', 'enemy_submarine3'),
};
const imageCache = new Map<string, HTMLImageElement>();
const pickTreasureRelic = (rarity: TreasureRarity) => {
  if (rarity === 'normal') return undefined;
  const relics = NEW_EARTH_TREASURES_BY_RARITY[rarity];
  return relics[Math.floor(Math.random() * relics.length)];
};
const spotlightParticles: SpotlightParticle[] = Array.from({ length: 220 }, (_, index) => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  radius: 0.35 + Math.random() * 1.1,
  vx: -0.06 - Math.random() * 0.09,
  vy: (Math.random() - 0.5) * 0.04,
  phase: Math.random() * Math.PI * 2,
  freq: 0.006 + Math.random() * 0.008,
  alpha: 0.08 + Math.random() * 0.22,
  type: index % 5,
}));

const SITE_CONFIG: Record<UnderwaterBattleSiteId, {
  title: Record<'pt' | 'en', string>;
  subtitle: Record<'pt' | 'en', string>;
  backgrounds: string[];
  tone: string;
}> = {
  'oceano-abissal': {
    title: { pt: 'Oceano Abissal', en: 'Abyssal Ocean' },
    subtitle: { pt: 'Zona marítima profunda', en: 'Deep maritime zone' },
    backgrounds: NEW_EARTH_SUBMARINE_DEPTH_STAGES.map((_, index) => `/assets/rota4/new_land_assets/abyssal_ocean_new_land_system/abissal_${String(index + 1).padStart(2, '0')}.webp`),
    tone: 'from-cyan-950/80 via-blue-950/55 to-black',
  },
  'cemiterio-navios': {
    title: { pt: 'Cemitério de Navios', en: 'Ship Graveyard' },
    subtitle: { pt: 'Campo de destroços submerso', en: 'Submerged wreck field' },
    backgrounds: NEW_EARTH_SUBMARINE_DEPTH_STAGES.map((_, index) => `/assets/rota4/new_land_assets/ship_graveyard_new_land_system/graveyard_${String(index + 1).padStart(2, '0')}.webp`),
    tone: 'from-slate-950/85 via-cyan-950/45 to-black',
  },
};

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

const playUnderwaterSound = (src: string, volume = 0.72) => {
  if (typeof Audio === 'undefined') return null;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
  return audio;
};

const playLoopingUnderwaterSound = (src: string, volume = 0.45) => {
  if (typeof Audio === 'undefined') return null;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.loop = true;
  audio.play().catch(() => {});
  return audio;
};

const stopUnderwaterSound = (audio?: HTMLAudioElement | null) => {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
};

const playRandomUnderwaterSound = (srcs: string[], volume = 0.72) => {
  const src = srcs[Math.floor(Math.random() * srcs.length)];
  return src ? playUnderwaterSound(src, volume) : null;
};

type DirectionalPlayerSubmarineSpriteKey = Exclude<PlayerSubmarineSpriteKey, 'turn_1' | 'turn_2' | 'turn_3' | 'turn_back_1' | 'turn_back_2' | 'turn_back_3'>;

const getPlayerSpriteKeyFromAngle = (angle: number): DirectionalPlayerSubmarineSpriteKey => {
  const normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
  const degrees = normalized * 180 / Math.PI;
  if (degrees >= -22.5 && degrees < 22.5) return 'front';
  if (degrees >= 22.5 && degrees < 67.5) return 'down_front';
  if (degrees >= 67.5 && degrees < 112.5) return 'down';
  if (degrees >= 112.5 && degrees < 157.5) return 'down_back';
  if (degrees >= 157.5 || degrees < -157.5) return 'back';
  if (degrees >= -157.5 && degrees < -112.5) return 'up_back';
  if (degrees >= -112.5 && degrees < -67.5) return 'up';
  return 'up_front';
};

const getPlayerSubmarineSpriteKey = (
  visual: PlayerSpriteVisualState,
  targetKey: DirectionalPlayerSubmarineSpriteKey,
  time: number
): PlayerSubmarineSpriteKey => {
  const isOppositeHorizontalTurn =
    (visual.key === 'front' && targetKey === 'back') ||
    (visual.key === 'back' && targetKey === 'front');

  if (!visual.turnFrom && isOppositeHorizontalTurn) {
    visual.turnFrom = visual.key as 'front' | 'back';
    visual.turnTo = targetKey;
    visual.turnStartedAt = time;
    visual.useBackTurnArc = !visual.useBackTurnArc;
  }

  if (visual.turnFrom && visual.turnTo) {
    const frameIndex = Math.floor((time - visual.turnStartedAt) / PLAYER_SPRITE_TURN_FRAME_MS);
    const frames: PlayerSubmarineSpriteKey[] = visual.useBackTurnArc
      ? (visual.turnFrom === 'front'
        ? ['turn_back_3', 'turn_back_2', 'turn_back_1']
        : ['turn_back_1', 'turn_back_2', 'turn_back_3'])
      : (visual.turnFrom === 'front'
        ? ['turn_3', 'turn_1', 'turn_2']
        : ['turn_2', 'turn_1', 'turn_3']);

    if (frameIndex < frames.length) {
      visual.key = frames[Math.max(0, frameIndex)];
      return visual.key;
    }

    visual.key = visual.turnTo;
    visual.turnFrom = null;
    visual.turnTo = null;
    visual.turnStartedAt = 0;
    return visual.key;
  }

  visual.key = targetKey;
  return visual.key;
};

const drawPlayerSpriteSubmarine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  time: number,
  visual: PlayerSpriteVisualState,
  sprites: Record<PlayerSubmarineSpriteKey, string>
) => {
  const targetKey = getPlayerSpriteKeyFromAngle(angle);
  const spriteKey = getPlayerSubmarineSpriteKey(visual, targetKey, time);
  const sprite = getImage(sprites[spriteKey]);

  if (!sprite?.complete || sprite.naturalWidth <= 0) {
    drawSubmarine(ctx, x, y, angle, 'rgba(8,145,178,0.94)', true, time);
    return;
  }

  const pulse = 0.82 + Math.sin(time * 0.018) * 0.18;
  const drawW = 118;
  const drawH = 82;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Draw glowing aura underneath
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 68);
  glow.addColorStop(0, `rgba(125,249,255,${0.16 * pulse})`);
  glow.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw submarine image
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowColor = 'rgba(34,211,238,0.72)';
  ctx.shadowBlur = 16 + pulse * 9;
  ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
};

const drawEnemySpriteSubmarine = (
  ctx: CanvasRenderingContext2D,
  enemy: VecEntity,
  angle: number,
  time: number
) => {
  const sprites = ENEMY_SUBMARINE_SPRITES[enemy.visual.spriteSetId];
  const spriteKey = getPlayerSubmarineSpriteKey(enemy.visual, getPlayerSpriteKeyFromAngle(angle), time);
  const sprite = getImage(sprites[spriteKey]);

  if (!sprite?.complete || sprite.naturalWidth <= 0) {
    drawSubmarine(ctx, enemy.x, enemy.y, angle, 'rgba(88,28,28,0.92)', false);
    return;
  }

  const drawW = 104;
  const drawH = 72;
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.shadowColor = 'rgba(248,113,113,0.48)';
  ctx.shadowBlur = 10;
  ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
};

const drawNeptuneTurnLightImpact = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  time: number,
  visual: PlayerSpriteVisualState
) => {
  if (!visual.turnFrom || !visual.turnTo) return;

  const elapsed = time - visual.turnStartedAt;
  const frameIndex = Math.floor(elapsed / PLAYER_SPRITE_TURN_FRAME_MS);
  const frameProgress = (elapsed % PLAYER_SPRITE_TURN_FRAME_MS) / PLAYER_SPRITE_TURN_FRAME_MS;
  const pulse = Math.sin(frameProgress * Math.PI);
  if (pulse <= 0) return;

  const isCameraImpact = visual.key === 'turn_1' && frameIndex === 1;
  const isBackgroundImpact = visual.key === 'turn_back_2' && frameIndex === 1;
  if (!isCameraImpact && !isBackgroundImpact) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  if (isCameraImpact) {
    const radius = 150 + pulse * 90;
    const cameraFlash = ctx.createRadialGradient(x, y - 2, 6, x, y - 2, radius);
    cameraFlash.addColorStop(0, `rgba(224,242,254,${0.38 * pulse})`);
    cameraFlash.addColorStop(0.28, `rgba(125,249,255,${0.18 * pulse})`);
    cameraFlash.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = cameraFlash;
    ctx.beginPath();
    ctx.arc(x, y - 2, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(186,230,253,${0.1 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 2, 52 + pulse * 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (isBackgroundImpact) {
    const targetX = x + Math.cos(angle + Math.PI) * 260;
    const targetY = y + Math.sin(angle + Math.PI) * 42 - 4;
    const radius = 118 + pulse * 72;
    const backgroundFlash = ctx.createRadialGradient(targetX, targetY, 8, targetX, targetY, radius);
    backgroundFlash.addColorStop(0, `rgba(186,230,253,${0.28 * pulse})`);
    backgroundFlash.addColorStop(0.34, `rgba(34,211,238,${0.13 * pulse})`);
    backgroundFlash.addColorStop(1, 'rgba(8,145,178,0)');
    ctx.fillStyle = backgroundFlash;
    ctx.beginPath();
    ctx.arc(targetX, targetY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(224,242,254,${0.08 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(targetX, targetY, radius * 0.58, radius * 0.18, Math.sin(time * 0.006) * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawSubmarine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  isPlayer: boolean,
  tick = 0
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = isPlayer ? 'rgba(165,243,252,0.92)' : 'rgba(248,113,113,0.86)';
  ctx.shadowColor = isPlayer ? 'rgba(34,211,238,0.75)' : 'rgba(248,113,113,0.65)';
  ctx.shadowBlur = isPlayer ? 18 + Math.sin(tick * 0.012) * 4 : 12;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, isPlayer ? 34 : 30, isPlayer ? 13 : 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = isPlayer ? 'rgba(34,211,238,0.78)' : 'rgba(127,29,29,0.85)';
  ctx.fillRect(-6, -22, 14, 16);
  ctx.strokeRect(-6, -22, 14, 16);

  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(-51, -13);
  ctx.lineTo(-45, 0);
  ctx.lineTo(-51, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(224,242,254,0.82)';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(10 + i * 12, -1, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isPlayer) {
    const pulse = 0.8 + Math.sin(tick * 0.018) * 0.2;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(125,249,255,${0.18 * pulse})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(26 + i * 7, -1, 5 + i * 6, 2 + i * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
};

const propellerWakeBubbles: WakeBubble[] = [];
const propellerWakeVortices: WakeVortex[] = [];
let propellerWakeVortexToggle = 1;
let propellerWakeVortexCooldown = 0;

const drawPropellerWake = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity,
  time: number
) => {
  const speed = Math.hypot(player.vx, player.vy);
  const thrustPower = Math.max(player.thrust, Math.min(1, speed / 3.4) * 0.55);
  const wakeTime = time * 0.06;
  const angle = player.angle;
  const propellerYOffset = 12;
  const rearX = player.x - Math.cos(angle) * 52;
  const rearY = player.y - Math.sin(angle) * 28 + propellerYOffset;
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);
  const backX = -Math.cos(angle);
  const backY = -Math.sin(angle);

  if (thrustPower >= 0.04) {
    const jetSpeed = 2.8 + thrustPower * 4.2;

    for (let i = 0; i < 6; i++) {
      const spread = (Math.random() - 0.5) * 6;
      const jitter = (Math.random() - 0.5) * 0.5;
      propellerWakeBubbles.push({
        x: rearX + perpX * spread + (Math.random() - 0.5) * 3,
        y: rearY + perpY * spread + (Math.random() - 0.5) * 3,
        vx: backX * (jetSpeed + jitter) + (Math.random() - 0.5) * 0.4,
        vy: backY * (jetSpeed + jitter) + perpY * jitter * 0.3,
        radius: 0.6 + Math.random() * 1.4,
        life: 55 + Math.random() * 35,
        maxLife: 90,
        alpha: 0.55 + Math.random() * 0.35,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleFreq: 0.04 + Math.random() * 0.04,
      });
    }

    for (let i = 0; i < 5; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const radial = 8 + Math.random() * 18;
      const speed2 = jetSpeed * 0.4 + Math.random() * 1.2;
      propellerWakeBubbles.push({
        x: rearX + perpX * side * radial + (Math.random() - 0.5) * 4,
        y: rearY + perpY * side * radial + (Math.random() - 0.5) * 4,
        vx: backX * speed2 + perpX * side * (0.15 + Math.random() * 0.25),
        vy: backY * speed2 + perpY * side * (0.15 + Math.random() * 0.25),
        radius: 0.4 + Math.random() * 1.8,
        life: 40 + Math.random() * 50,
        maxLife: 90,
        alpha: 0.25 + Math.random() * 0.25,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleFreq: 0.04 + Math.random() * 0.04,
      });
    }

    for (let i = 0; i < 4; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const radial = 4 + Math.random() * 28;
      propellerWakeBubbles.push({
        x: rearX + perpX * side * radial,
        y: rearY + perpY * side * radial,
        vx: backX * (0.5 + Math.random() * 0.8),
        vy: backY * (0.5 + Math.random() * 0.8),
        radius: 0.18 + Math.random() * 0.55,
        life: 20 + Math.random() * 30,
        maxLife: 50,
        alpha: 0.18 + Math.random() * 0.22,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleFreq: 0.04 + Math.random() * 0.04,
      });
    }

    propellerWakeVortexCooldown--;
    if (propellerWakeVortexCooldown <= 0) {
      const side = propellerWakeVortexToggle;
      const radial = 14 + Math.random() * 6;
      const life = 90 + Math.floor(Math.random() * 40);
      propellerWakeVortices.push({
        x: rearX + perpX * side * radial,
        y: rearY + perpY * side * radial,
        side,
        strength: (0.6 + thrustPower * 1.2) * side,
        life,
        maxLife: life,
        vx: backX * (0.8 + Math.random() * 0.6),
        angle: 0,
      });
      propellerWakeVortexToggle *= -1;
      propellerWakeVortexCooldown = 9 + Math.floor(Math.random() * 5);
    }
  }

  for (let i = propellerWakeBubbles.length - 1; i >= 0; i--) {
    const bubble = propellerWakeBubbles[i];
    bubble.x += bubble.vx;
    bubble.y += bubble.vy + Math.sin(wakeTime * bubble.wobbleFreq + bubble.wobblePhase) * 0.12;
    bubble.vy *= 0.995;
    bubble.vx *= 0.992;
    bubble.life--;
    bubble.radius *= 0.9985;
    if (bubble.life <= 0 || bubble.radius <= 0.2) propellerWakeBubbles.splice(i, 1);
  }

  for (let i = propellerWakeVortices.length - 1; i >= 0; i--) {
    const vortex = propellerWakeVortices[i];
    vortex.x += vortex.vx;
    vortex.angle += vortex.strength * 0.08;
    vortex.life--;
    vortex.strength *= 0.987;
    if (vortex.life <= 0 || Math.abs(vortex.strength) <= 0.3) propellerWakeVortices.splice(i, 1);
  }

  if (propellerWakeBubbles.length > 260) propellerWakeBubbles.splice(0, propellerWakeBubbles.length - 260);
  if (propellerWakeVortices.length > 32) propellerWakeVortices.splice(0, propellerWakeVortices.length - 32);

  if (thrustPower < 0.04 && propellerWakeBubbles.length === 0 && propellerWakeVortices.length === 0) return;

  if (thrustPower >= 0.04) {
    const jetLength = 95 + thrustPower * 130;
    const jetWidth = 18 + thrustPower * 30;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const gradient = ctx.createRadialGradient(
      rearX,
      rearY,
      2,
      rearX - Math.cos(angle) * jetLength * 0.45,
      rearY - Math.sin(angle) * jetLength * 0.45,
      jetLength
    );
    gradient.addColorStop(0, `rgba(200,235,255,${0.22 * thrustPower})`);
    gradient.addColorStop(0.12, `rgba(130,210,252,${0.14 * thrustPower})`);
    gradient.addColorStop(0.38, `rgba(56,189,248,${0.07 * thrustPower})`);
    gradient.addColorStop(0.68, `rgba(14,165,233,${0.025 * thrustPower})`);
    gradient.addColorStop(1, 'rgba(2,14,26,0)');

    ctx.translate(rearX, rearY);
    ctx.rotate(angle + Math.PI);
    ctx.beginPath();
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const x = progress * jetLength;
      const halfWidth = jetWidth * (0.12 + 0.88 * Math.sqrt(progress) * (1 - progress * 0.25));
      const turbulence = Math.sin(wakeTime * 0.015 + progress * 11.3) * 3.5 * progress
        + Math.sin(wakeTime * 0.008 + progress * 23.7 + 1.4) * 1.8 * progress;
      if (i === 0) ctx.moveTo(0, -halfWidth * 0.18);
      ctx.lineTo(x, -halfWidth + turbulence);
    }
    for (let i = steps; i >= 0; i--) {
      const progress = i / steps;
      const x = progress * jetLength;
      const halfWidth = jetWidth * (0.12 + 0.88 * Math.sqrt(progress) * (1 - progress * 0.25));
      const turbulence = Math.sin(wakeTime * 0.014 + progress * 10.1 + 2.3) * 3.8 * progress
        + Math.sin(wakeTime * 0.007 + progress * 19.5) * 2.1 * progress;
      ctx.lineTo(x, halfWidth + turbulence);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const coreGradient = ctx.createRadialGradient(rearX, rearY, 0, rearX, rearY, 28 + thrustPower * 14);
    coreGradient.addColorStop(0, `rgba(240,252,255,${0.48 * thrustPower})`);
    coreGradient.addColorStop(0.3, `rgba(147,230,253,${0.28 * thrustPower})`);
    coreGradient.addColorStop(0.7, `rgba(56,189,248,${0.1 * thrustPower})`);
    coreGradient.addColorStop(1, 'rgba(14,165,233,0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(rearX, rearY, 28 + thrustPower * 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const vortex of propellerWakeVortices) {
    const fade = vortex.life / vortex.maxLife;
    const radius = (10 + Math.abs(vortex.strength) * 12) * fade;
    if (radius < 1) continue;
    const vortexGradient = ctx.createRadialGradient(vortex.x, vortex.y, 0, vortex.x, vortex.y, radius);
    vortexGradient.addColorStop(0, `rgba(103,232,249,${0.18 * fade * Math.abs(vortex.strength) / 2})`);
    vortexGradient.addColorStop(0.5, `rgba(56,189,248,${0.09 * fade})`);
    vortexGradient.addColorStop(1, 'rgba(14,165,233,0)');
    ctx.fillStyle = vortexGradient;
    ctx.beginPath();
    ctx.arc(vortex.x, vortex.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(186,230,253,${0.13 * fade})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(vortex.x, vortex.y, radius * 0.62, vortex.angle, vortex.angle + Math.PI * 1.4 * vortex.side);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const bubble of propellerWakeBubbles) {
    const fade = bubble.life / bubble.maxLife;
    const alpha = bubble.alpha * fade * fade;
    if (alpha < 0.01) continue;
    if (bubble.radius > 0.9) {
      const bubbleGradient = ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        0,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      bubbleGradient.addColorStop(0, `rgba(255,255,255,${alpha * 0.85})`);
      bubbleGradient.addColorStop(0.45, `rgba(180,230,252,${alpha * 0.55})`);
      bubbleGradient.addColorStop(0.8, `rgba(56,189,248,${alpha * 0.25})`);
      bubbleGradient.addColorStop(1, `rgba(14,165,233,${alpha * 0.05})`);
      ctx.fillStyle = bubbleGradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(200,240,255,${alpha * 0.35})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(200,238,255,${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  if (thrustPower >= 0.04) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(rearX, rearY);
    ctx.rotate(angle);
    const propellerRadius = 13 + thrustPower * 6;
    const propellerAlpha = 0.28 + thrustPower * 0.18;
    ctx.strokeStyle = `rgba(200,240,255,${propellerAlpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, propellerRadius * 0.35, propellerRadius, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(200,240,255,${propellerAlpha * 0.5})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(0, 0, propellerRadius, propellerRadius * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};

const drawTorpedoWake = (
  ctx: CanvasRenderingContext2D,
  shot: Shot,
  time: number
) => {
  const isPlayer = shot.from === 'player';
  const wakeLength = isPlayer ? 72 : 34;
  const wakeWidth = isPlayer ? 11 : 5;
  const pulse = isPlayer
    ? 0.72 + Math.sin(time * 0.024 + shot.wakeSeed) * 0.22
    : 0.75 + Math.sin(time * 0.026 + shot.wakeSeed) * 0.2;

  ctx.save();
  ctx.translate(
    shot.x - Math.cos(shot.angle) * (isPlayer ? 13 : 10),
    shot.y - Math.sin(shot.angle) * (isPlayer ? 13 : 10)
  );
  ctx.rotate(shot.angle + Math.PI);
  ctx.globalCompositeOperation = 'screen';

  const wake = ctx.createLinearGradient(0, 0, wakeLength, 0);
  wake.addColorStop(0, `rgba(224,242,254,${(isPlayer ? 0.24 : 0.16) * pulse})`);
  wake.addColorStop(0.22, isPlayer ? `rgba(125,249,255,${0.15 * pulse})` : `rgba(34,211,238,${0.08 * pulse})`);
  wake.addColorStop(0.6, `rgba(34,211,238,${0.06 * pulse})`);
  wake.addColorStop(1, 'rgba(14,165,233,0)');
  ctx.fillStyle = wake;
  ctx.beginPath();
  ctx.moveTo(0, -wakeWidth * 0.5);
  ctx.bezierCurveTo(wakeLength * 0.26, -wakeWidth, wakeLength * 0.7, -wakeWidth * 0.54, wakeLength, -wakeWidth * 0.1);
  ctx.bezierCurveTo(wakeLength * 0.66, wakeWidth * 0.5, wakeLength * 0.2, wakeWidth * 0.88, 0, wakeWidth * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(224,242,254,${(isPlayer ? 0.13 : 0.1) * pulse})`;
  ctx.lineWidth = isPlayer ? 0.65 : 0.8;
  const rings = isPlayer ? 5 : 4;
  for (let i = 0; i < rings; i++) {
    const progress = i / (rings - 1);
    ctx.beginPath();
    ctx.ellipse(
      10 + progress * wakeLength * 0.74,
      Math.sin(time * 0.015 + i * 1.5 + shot.wakeSeed) * wakeWidth * progress * 0.65,
      (2.2 + progress * 9) * pulse,
      (0.9 + progress * 2.4) * pulse,
      Math.sin(time * 0.011 + i) * 0.42,
      0,
      Math.PI * 1.5
    );
    ctx.stroke();
  }

  if (isPlayer) {
    const streak = ctx.createLinearGradient(0, 0, wakeLength * 0.48, 0);
    streak.addColorStop(0, `rgba(255,255,255,${0.3 * pulse})`);
    streak.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = streak;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wakeLength * 0.18, Math.sin(time * 0.02 + shot.wakeSeed) * 1.4, wakeLength * 0.38, 0, wakeLength * 0.48, 0);
    ctx.stroke();
  }

  ctx.restore();
};

const drawTorpedoTrail = (
  ctx: CanvasRenderingContext2D,
  shot: Shot
) => {
  if (shot.from !== 'player' || shot.trail.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  shot.trail.forEach((point, index) => {
    const progress = (index + 1) / shot.trail.length;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.7 * progress, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(125,249,255,${progress * 0.45})`;
    ctx.fill();
  });
  ctx.restore();
};

const drawTorpedo = (
  ctx: CanvasRenderingContext2D,
  shot: Shot,
  time: number
) => {
  drawTorpedoWake(ctx, shot, time);
  drawTorpedoTrail(ctx, shot);

  const isPlayer = shot.from === 'player';
  const length = isPlayer ? 30 : 20;
  const width = isPlayer ? 7.5 : 5;
  const pulse = 0.82 + Math.sin(time * 0.02 + shot.id) * 0.13;

  ctx.save();
  ctx.translate(shot.x, shot.y);
  ctx.rotate(shot.angle);
  ctx.shadowColor = isPlayer ? 'rgba(125,249,255,0.65)' : 'rgba(248,113,113,0.48)';
  ctx.shadowBlur = isPlayer ? 10 : 5;

  const body = ctx.createLinearGradient(-length * 0.5, 0, length * 0.5, 0);
  body.addColorStop(0, isPlayer ? 'rgba(28,38,56,0.97)' : 'rgba(69,26,26,0.94)');
  body.addColorStop(0.33, isPlayer ? 'rgba(200,212,224,0.99)' : 'rgba(248,113,113,0.88)');
  body.addColorStop(0.63, isPlayer ? 'rgba(145,160,182,0.97)' : 'rgba(127,29,29,0.94)');
  body.addColorStop(1, isPlayer ? 'rgba(12,20,40,0.96)' : 'rgba(30,41,59,0.95)');
  ctx.fillStyle = body;
  ctx.strokeStyle = isPlayer ? 'rgba(224,242,254,0.82)' : 'rgba(254,202,202,0.7)';
  ctx.lineWidth = isPlayer ? 0.75 : 1;
  ctx.beginPath();
  ctx.moveTo(length * 0.5, 0);
  ctx.quadraticCurveTo(length * 0.3, -width * 0.78, -length * 0.28, -width * 0.7);
  ctx.lineTo(-length * 0.5, 0);
  ctx.quadraticCurveTo(-length * 0.28, width * 0.7, length * 0.3, width * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isPlayer ? `rgba(125,249,255,${0.5 * pulse})` : `rgba(254,202,202,${0.34 * pulse})`;
  ctx.beginPath();
  ctx.ellipse(isPlayer ? length * 0.37 : -length * 0.44, 0, isPlayer ? 3.8 : 3.6, isPlayer ? width * 0.52 : width * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isPlayer) {
    const engineGlow = ctx.createRadialGradient(-length * 0.43, 0, 0, -length * 0.43, 0, width * 0.78);
    engineGlow.addColorStop(0, `rgba(56,189,248,${0.68 * pulse})`);
    engineGlow.addColorStop(0.5, `rgba(14,165,233,${0.3 * pulse})`);
    engineGlow.addColorStop(1, 'rgba(14,165,233,0)');
    ctx.fillStyle = engineGlow;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.ellipse(-length * 0.43, 0, width * 0.82, width * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = isPlayer ? 'rgba(14,165,233,0.72)' : 'rgba(127,29,29,0.82)';
  for (const sign of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-length * 0.2, sign * width * 0.6);
    ctx.lineTo(-length * 0.43, sign * width * 1.5);
    ctx.lineTo(-length * 0.06, sign * width * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  if (shot.targetId) {
    ctx.beginPath();
    ctx.arc(0, 0, width * 1.35, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(253,224,71,${0.32 + pulse * 0.22})`;
    ctx.lineWidth = 0.55;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
};

const drawTargetingReticle = (
  ctx: CanvasRenderingContext2D,
  aim: AimState,
  time: number
) => {
  if (!aim.inside) return;

  const lockProgress = aim.hoveredEnemyId ? clamp((time - aim.hoverStartedAt) / PLAYER_TORPEDO_LOCK_MS, 0, 1) : 0;
  const locked = !!aim.lockedEnemyId;
  const color = locked ? 'rgba(34,197,94,0.96)' : 'rgba(248,113,113,0.9)';
  const faintColor = locked ? 'rgba(74,222,128,0.22)' : 'rgba(248,113,113,0.18)';
  const radius = 28 + Math.sin(time * 0.008) * 2;

  ctx.save();
  ctx.translate(aim.x, aim.y);
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = faintColor;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lockProgress);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-radius - 9, 0);
  ctx.lineTo(-radius + 7, 0);
  ctx.moveTo(radius - 7, 0);
  ctx.lineTo(radius + 9, 0);
  ctx.moveTo(0, -radius - 9);
  ctx.lineTo(0, -radius + 7);
  ctx.moveTo(0, radius - 7);
  ctx.lineTo(0, radius + 9);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, locked ? 3.2 : 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawTargetLockReticle = (
  ctx: CanvasRenderingContext2D,
  enemy: VecEntity,
  aim: AimState,
  shots: Shot[],
  time: number
) => {
  const isLocked = aim.hoveredEnemyId === enemy.id;
  const isTracked = shots.some(shot => shot.targetId === enemy.id);
  if (!isLocked && !isTracked) return;

  const progress = isLocked ? clamp((time - aim.hoverStartedAt) / PLAYER_TORPEDO_LOCK_MS, 0, 1) : 1;
  const pulse = 0.55 + Math.sin(time * 0.06) * 0.35;
  const outerRadius = enemy.radius + 14 + Math.sin(time * 0.04) * 2.5;
  const innerRadius = enemy.radius + 6;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.globalCompositeOperation = 'screen';

  if (isTracked) {
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(253,224,71,${0.12 + pulse * 0.08})`;
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.strokeStyle = `rgba(253,224,71,${isTracked ? 0.95 : 0.55 + pulse * 0.35})`;
  ctx.lineWidth = isTracked ? 1.4 : 1;
  ctx.stroke();

  if (isTracked) {
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(253,224,71,${0.2 + pulse * 0.15})`;
    ctx.lineWidth = 0.6;
    ctx.setLineDash([2, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(angle => {
    ctx.save();
    ctx.rotate(angle);
    ctx.strokeStyle = `rgba(253,224,71,${isTracked ? 0.92 : 0.45 + pulse * 0.4})`;
    ctx.lineWidth = isTracked ? 1.6 : 1;
    ctx.shadowColor = 'rgba(253,224,71,0.5)';
    ctx.shadowBlur = isTracked ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(outerRadius, -outerRadius * 0.38);
    ctx.lineTo(outerRadius, -outerRadius);
    ctx.lineTo(outerRadius * 0.38, -outerRadius);
    ctx.stroke();
    ctx.restore();
  });

  if (isLocked && progress >= 1) {
    ctx.fillStyle = `rgba(253,224,71,${0.7 + pulse * 0.25})`;
    ctx.font = '500 10px var(--font-sans)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOCK', 0, -outerRadius - 10);
  }

  if (isTracked) {
    ctx.beginPath();
    ctx.moveTo(-6, -outerRadius - 2);
    ctx.lineTo(0, -outerRadius + 6);
    ctx.lineTo(6, -outerRadius - 2);
    ctx.fillStyle = `rgba(253,224,71,${0.7 + pulse * 0.2})`;
    ctx.fill();
  }

  ctx.restore();
};

const drawGuidanceLine = (
  ctx: CanvasRenderingContext2D,
  shot: Shot,
  enemies: VecEntity[],
  time: number
) => {
  if (!shot.targetId) return;
  const target = enemies.find(enemy => enemy.id === shot.targetId);
  if (!target) return;

  const pulse = 0.3 + Math.sin(time * 0.045) * 0.2;
  ctx.save();
  ctx.setLineDash([3, 9]);
  ctx.strokeStyle = `rgba(253,224,71,${pulse * 0.3})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(shot.x, shot.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

const drawLaunchBar = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity,
  time: number
) => {
  if (player.cooldown <= 0) return;

  const pulse = 0.72 + Math.sin(time * 0.002) * 0.2;
  const cooldownProgress = player.cooldown / 600;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = 'rgba(12,20,40,0.7)';
  ctx.fillRect(-20, 48, 40, 4);
  ctx.fillStyle = `rgba(34,211,238,${0.65 + pulse * 0.25})`;
  ctx.fillRect(-20, 48, 40 * (1 - cooldownProgress), 4);
  ctx.restore();
};

const drawImpactBurst = (
  ctx: CanvasRenderingContext2D,
  burst: ImpactBurst
) => {
  if (burst.delay && burst.delay > 0) return;
  const alpha = burst.life / burst.maxLife;
  const radius = burst.maxR * (1 - alpha);
  const isWhite = burst.color === '#ffffff';

  ctx.save();
  ctx.translate(burst.x, burst.y);
  ctx.globalCompositeOperation = 'screen';

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0, radius), 0, Math.PI * 2);
  ctx.strokeStyle = isWhite ? `rgba(255,255,255,${alpha * 0.5})` : `rgba(125,249,255,${alpha * 0.62})`;
  ctx.lineWidth = 2.8 * alpha;
  ctx.stroke();

  if (radius > 8) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0, radius * 0.52), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.38})`;
    ctx.lineWidth = 1.4 * alpha;
    ctx.stroke();
  }

  if (alpha > 0.6) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0, radius * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(alpha - 0.6) * 2 * 0.8})`;
    ctx.fill();
  }

  ctx.restore();
};

const drawCombatParticles = (
  ctx: CanvasRenderingContext2D,
  particles: CombatParticle[]
) => {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    if (particle.type === 'bubble') {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r * (0.35 + alpha * 0.65), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(186,230,253,${alpha * 0.5})`;
      ctx.lineWidth = 0.65;
      ctx.stroke();
      ctx.fillStyle = `rgba(224,242,254,${alpha * 0.1})`;
      ctx.fill();
      ctx.restore();
    } else if (particle.type === 'spark') {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      let color = '125,211,252';
      if (particle.color === '#ffffff') color = '255,255,255';
      if (particle.color === '#f87171') color = '248,113,113';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${alpha * 0.88})`;
      ctx.fill();
      ctx.restore();
    } else if (particle.type === 'launch_ring') {
      const radius = (particle.maxR || 0) * (1 - alpha);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0, radius), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125,249,255,${alpha * 0.45})`;
      ctx.lineWidth = 1.8 * alpha;
      ctx.stroke();
    } else if (particle.type === 'debris') {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.angle || 0);
      ctx.fillStyle = `rgba(180,60,60,${alpha * 0.85})`;
      ctx.beginPath();
      ctx.rect(-particle.r * 0.5, -particle.r * 0.25, particle.r, particle.r * 0.5);
      ctx.fill();
      ctx.restore();
    }
  });
};

const drawDeepPortal = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  labels: { portal: string }
) => {
  const x = width - 150;
  const y = height / 2;
  const t = time;

  const hash = (n: number) => { let h = Math.sin(n)*43758.5453; return h - Math.floor(h); };

  // Outer Aura
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const pulse = 0.5 + Math.sin(t*0.0018)*0.4;
  const halo = ctx.createRadialGradient(x, y, 80, x, y, 260);
  halo.addColorStop(0, `rgba(34,211,238,${0.12+pulse*0.06})`);
  halo.addColorStop(0.3, `rgba(168,85,247,${0.06+pulse*0.04})`);
  halo.addColorStop(0.65, `rgba(251,191,36,${0.035})`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - 260, y - 260, 520, 520);
  ctx.restore();

  // Portal Void
  ctx.save();
  const rx = 72, ry = 130;
  ctx.globalCompositeOperation = 'source-over';
  const void1 = ctx.createRadialGradient(x, y, 0, x, y, ry*0.9);
  void1.addColorStop(0, 'rgba(0,2,12,1)');
  void1.addColorStop(0.4, 'rgba(1,4,20,1)');
  void1.addColorStop(0.7, 'rgba(8,47,73,0.96)');
  void1.addColorStop(1, 'rgba(2,6,23,0.8)');
  ctx.fillStyle = void1;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // Void Nebula
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath(); ctx.ellipse(x, y, 72, 130, 0, 0, Math.PI*2); ctx.clip();
  for(let i=0; i<4; i++){
    const angle = t*0.0004*(i%2===0?1:-0.7) + i*1.57;
    const ox = Math.cos(angle)*18, oy = Math.sin(angle)*30;
    const colors = [
      ['rgba(34,211,238,0.18)', 'rgba(0,0,0,0)'],
      ['rgba(168,85,247,0.14)', 'rgba(0,0,0,0)'],
      ['rgba(251,191,36,0.16)', 'rgba(0,0,0,0)'],
      ['rgba(125,211,252,0.12)', 'rgba(0,0,0,0)'],
    ];
    const ng = ctx.createRadialGradient(x+ox, y+oy, 5, x+ox, y+oy, 70);
    ng.addColorStop(0, colors[i][0]); ng.addColorStop(1, colors[i][1]);
    ctx.fillStyle = ng; 
    ctx.fillRect(x - 100, y - 160, 200, 320);
  }
  ctx.restore();

  // Void Stars
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath(); ctx.ellipse(x, y, 72, 130, 0, 0, Math.PI*2); ctx.clip();
  for(let i=0; i<80; i++){
    const tx = (hash(i*5.1)*2-1)*68;
    const ty = (hash(i*3.7)*2-1)*125;
    const drift = 0.000025*(i%7+1);
    const sx = x + tx*Math.cos(t*drift+i) - ty*Math.sin(t*drift*0.3+i)*0.08;
    const sy = y + ty*Math.cos(t*drift*0.4+i) + tx*Math.sin(t*drift*0.2+i)*0.05;
    const br = 0.3 + hash(i*9.2)*0.55 + Math.sin(t*0.002+i*2.1)*0.12;
    const sr = 0.4 + hash(i*1.8)*0.9;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI*2);
    ctx.fillStyle = `rgba(224,242,254,${br})`; ctx.fill();
  }
  ctx.restore();

  // Core Glow
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const pulseCore = 0.5 + Math.sin(t*0.0025)*0.4;
  const surge = 0.5 + Math.sin(t*0.007)*0.5;
  const g1 = ctx.createRadialGradient(x, y, 2, x, y, 55);
  g1.addColorStop(0, `rgba(224,242,254,${0.15+surge*0.1})`);
  g1.addColorStop(0.3, `rgba(34,211,238,${0.12+pulseCore*0.08})`);
  g1.addColorStop(0.65, `rgba(168,85,247,${0.08+pulseCore*0.04})`);
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.beginPath(); ctx.ellipse(x, y, 58, 105, 0, 0, Math.PI*2); ctx.fill();
  
  const g2 = ctx.createRadialGradient(x, y, 0, x, y, 18);
  g2.addColorStop(0, `rgba(255,255,255,${0.25+surge*0.2})`);
  g2.addColorStop(0.5, `rgba(251,191,36,${0.12+pulseCore*0.08})`);
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.beginPath(); ctx.ellipse(x, y, 20, 36, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // Lightning Bolts
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const numBolts = 3;
  for(let b=0; b<numBolts; b++){
    const phase = t*0.004 + b*2.09;
    if(Math.sin(phase) > 0.55){
      const alpha = (Math.sin(phase)-0.55)*2.2;
      const startAngle = hash(Math.floor(t/200)*7+b*13)*Math.PI*2;
      const ex = x + Math.cos(startAngle)*72;
      const ey = y + Math.sin(startAngle)*130;
      ctx.strokeStyle = `rgba(34,211,238,${alpha*0.9})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x, y);
      const steps = 5;
      for(let s=1; s<=steps; s++){
        const prog = s/steps;
        const tx = x + (ex-x)*prog;
        const ty = y + (ey-y)*prog;
        const jx = (Math.random()-0.5)*22*(1-prog);
        const jy = (Math.random()-0.5)*22*(1-prog);
        ctx.lineTo(tx+jx, ty+jy);
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  // Energy Rings
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const rings = [
    {rx: 76, ry: 136, spd: 0.0006, color: 'rgba(34, 211, 238, ', lw: 2.2, phase: 0},
    {rx: 84, ry: 148, spd: -0.0004, color: 'rgba(168, 85, 247, ', lw: 1.5, phase: 2.1},
    {rx: 92, ry: 162, spd: 0.00025, color: 'rgba(251, 191, 36, ', lw: 1.0, phase: 4.3},
    {rx: 68, ry: 122, spd: -0.0008, color: 'rgba(125, 211, 252, ', lw: 1.0, phase: 1.1},
  ];
  rings.forEach((r, i) => {
    const wobX = Math.sin(t*r.spd*2.3+r.phase)*4;
    const wobY = Math.sin(t*r.spd*1.7+r.phase+1)*7;
    const rot = t*r.spd+r.phase*0.1;
    const ringPulse = 0.55 + Math.sin(t*0.002+i*1.8)*0.35;
    ctx.save();
    ctx.translate(x+wobX, y+wobY); ctx.rotate(rot);
    ctx.strokeStyle = r.color + (0.35+ringPulse*0.45) + ')';
    ctx.lineWidth = r.lw;
    ctx.beginPath(); ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();

  // Edge Streams
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for(let i=0; i<14; i++){
    const side = i%2===0 ? -1 : 1;
    const baseY = y - 120 + Math.floor(i/2)*40;
    const sRx = 72 + Math.sin(i*1.3)*8;
    const startX = x + side*sRx;
    const wave = Math.sin(t*0.003+i*0.9)*12;
    const alpha = 0.08 + Math.sin(t*0.0025+i*1.7)*0.07;
    const endX = x + side*(sRx+28+wave);
    const colors = [
      `rgba(34,211,238,${alpha})`,
      `rgba(168,85,247,${alpha})`,
      `rgba(251,191,36,${alpha*0.8})`,
    ];
    ctx.strokeStyle = colors[i%3];
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(startX, baseY); ctx.lineTo(endX, baseY+wave*0.5); ctx.stroke();
  }
  ctx.restore();

  // Floating Particles
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for(let i=0; i<36; i++){
    const orbit_r = 88 + hash(i*4.1)*24;
    const orbit_ry = 155 + hash(i*2.7)*28;
    const speed = 0.0004*(0.7+hash(i*6.3)*0.8)*(i%2===0?1:-1);
    const angle = t*speed + i*0.4;
    const depth = Math.sin(angle);
    const px2 = x + Math.cos(angle)*orbit_r;
    const py2 = y + Math.sin(angle)*orbit_ry;
    const inPortal = Math.abs(px2-x)<70 && Math.abs(py2-y)<128;
    if(!inPortal){
      const size = 0.7 + (1+depth)*0.7;
      const alpha = (0.18 + hash(i*5.8)*0.4)*(0.5+depth*0.45);
      const colors = [
        `rgba(34,211,238,${alpha})`,
        `rgba(168,85,247,${alpha})`,
        `rgba(251,191,36,${alpha})`,
        `rgba(125,211,252,${alpha*0.7})`,
      ];
      ctx.beginPath(); ctx.arc(px2, py2, size, 0, Math.PI*2);
      ctx.fillStyle = colors[i%4];
      ctx.fill();
    }
  }
  ctx.restore();

};

const drawWaterOverlay = (ctx: CanvasRenderingContext2D, tick: number, bubbles: Bubble[]) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, 'rgba(8,47,73,0.22)');
  gradient.addColorStop(0.48, 'rgba(6,78,98,0.16)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) {
    const y = HEIGHT * (0.18 + i * 0.19) + Math.sin(tick * 0.0007 + i) * 18;
    const fog = ctx.createLinearGradient(0, y - 42, WIDTH, y + 42);
    fog.addColorStop(0, 'rgba(14,116,144,0)');
    fog.addColorStop(0.38, `rgba(34,211,238,${0.018 + i * 0.004})`);
    fog.addColorStop(0.68, `rgba(125,211,252,${0.012 + i * 0.003})`);
    fog.addColorStop(1, 'rgba(14,116,144,0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, y - 48, WIDTH, 96);
  }
  ctx.restore();

  const foregroundShade = ctx.createRadialGradient(WIDTH * 0.52, HEIGHT * 0.42, HEIGHT * 0.18, WIDTH * 0.52, HEIGHT * 0.5, WIDTH * 0.78);
  foregroundShade.addColorStop(0, 'rgba(0,0,0,0)');
  foregroundShade.addColorStop(0.64, 'rgba(0,0,0,0.08)');
  foregroundShade.addColorStop(1, 'rgba(0,0,0,0.48)');
  ctx.fillStyle = foregroundShade;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const drawOceanBubbles = (
  ctx: CanvasRenderingContext2D,
  bubbles: Bubble[],
  time: number
) => {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  bubbles.forEach(bubble => {
    const baseRadius = bubble.radius;
    const pulse = 0.92 + Math.sin(time * 0.003 + bubble.drift) * 0.08;
    const radius = baseRadius * pulse;
    const alpha = bubble.alpha * (0.55 + bubble.depth * 0.65);

    const gradient = ctx.createRadialGradient(
      bubble.x - radius * 0.35,
      bubble.y - radius * 0.45,
      radius * 0.1,
      bubble.x,
      bubble.y,
      radius
    );

    gradient.addColorStop(0, `rgba(240,249,255,${alpha * 0.75})`);
    gradient.addColorStop(0.18, `rgba(186,230,253,${alpha * 0.35})`);
    gradient.addColorStop(0.58, `rgba(56,189,248,${alpha * 0.12})`);
    gradient.addColorStop(1, `rgba(14,165,233,${alpha * 0.03})`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(224,242,254,${alpha * 0.9})`;
    ctx.lineWidth = Math.max(0.6, radius * 0.075);
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,255,255,${alpha * bubble.shine})`;
    ctx.beginPath();
    ctx.arc(
      bubble.x - radius * 0.32,
      bubble.y - radius * 0.34,
      Math.max(0.7, radius * 0.18),
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (radius > 3.5) {
      ctx.strokeStyle = `rgba(186,230,253,${alpha * 0.55})`;
      ctx.lineWidth = Math.max(0.5, radius * 0.06);
      ctx.beginPath();
      ctx.arc(
        bubble.x + radius * 0.08,
        bubble.y + radius * 0.08,
        radius * 0.62,
        Math.PI * 0.18,
        Math.PI * 0.72
      );
      ctx.stroke();
    }

    if (radius > 6) {
      ctx.fillStyle = `rgba(125,211,252,${alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(
        bubble.x + radius * 0.32,
        bubble.y - radius * 0.18,
        radius * 0.09,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });

  ctx.restore();
};

const drawFallbackBackground = (ctx: CanvasRenderingContext2D) => {
  const fallback = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  fallback.addColorStop(0, '#082f49');
  fallback.addColorStop(0.48, '#064e62');
  fallback.addColorStop(1, '#020617');
  ctx.fillStyle = fallback;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const drawForegroundDebris = (ctx: CanvasRenderingContext2D, time: number) => {
  ctx.save();
  ctx.globalAlpha = 0.34;

  for (let i = 0; i < FOREGROUND_DEBRIS_COUNT; i++) {
    const x = ((i * 197 + time * 0.018) % (WIDTH + 220)) - 110;
    const y = (i * 83 + Math.sin(time * 0.0008 + i) * 32) % HEIGHT;
    const radius = 18 + (i % 5) * 9;
    const debris = ctx.createRadialGradient(x, y, 2, x, y, radius);
    debris.addColorStop(0, 'rgba(8,47,73,0.32)');
    debris.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = debris;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawLightConePath = (
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  angle: number,
  length: number,
  width: number,
  time = 0,
  turbulence = 1
) => {
  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);
  const sideX = -Math.sin(angle);
  const sideY = Math.cos(angle);
  const segments = 32;
  const beamHalfWidth = (progress: number) => width * (0.04 + 0.96 * progress);

  ctx.beginPath();
  ctx.moveTo(originX + sideX * 3, originY + sideY * 3);

  for (let i = 1; i <= segments; i++) {
    const progress = i / segments;
    const distance = progress * length;
    const halfWidth = beamHalfWidth(progress);
    const turbulenceOffset = (
      Math.sin(time * 0.0028 + progress * 9.1) * 7.5 +
      Math.sin(time * 0.0051 + progress * 17.3 + 1.2) * 4.2 +
      Math.sin(time * 0.0017 + progress * 5.7 + 2.8) * 9.8
    ) * turbulence * Math.sin(progress * Math.PI);

    ctx.lineTo(
      originX + forwardX * distance + sideX * (halfWidth + turbulenceOffset),
      originY + forwardY * distance + sideY * (halfWidth + turbulenceOffset)
    );
  }

  const capX = originX + forwardX * (length + 34);
  const capY = originY + forwardY * (length + 34);
  ctx.quadraticCurveTo(
    capX,
    capY,
    originX + forwardX * length - sideX * beamHalfWidth(1),
    originY + forwardY * length - sideY * beamHalfWidth(1)
  );

  for (let i = segments; i >= 1; i--) {
    const progress = i / segments;
    const distance = progress * length;
    const halfWidth = beamHalfWidth(progress);
    const turbulenceOffset = (
      Math.sin(time * 0.0031 + progress * 8.6 + 3.1) * 8.2 +
      Math.sin(time * 0.0044 + progress * 19.1) * 3.8 +
      Math.sin(time * 0.0019 + progress * 6.2 + 1.5) * 10.1
    ) * turbulence * Math.sin(progress * Math.PI);

    ctx.lineTo(
      originX + forwardX * distance - sideX * (halfWidth + turbulenceOffset),
      originY + forwardY * distance - sideY * (halfWidth + turbulenceOffset)
    );
  }

  ctx.lineTo(originX - sideX * 3, originY - sideY * 3);
  ctx.closePath();
};

const drawSubmergedBeamDetail = (
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  angle: number,
  beamLength: number,
  beamWidth: number,
  time: number,
  depthIntensity: number,
  speed: number
) => {
  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);
  const sideX = -Math.sin(angle);
  const sideY = Math.cos(angle);
  const flicker = 0.88
    + Math.sin(time * 0.017) * 0.05
    + Math.sin(time * 0.041) * 0.025
    + Math.sin(time * 0.097) * 0.012;
  const beamHalfWidth = (progress: number) => beamWidth * (0.04 + 0.96 * progress);

  ctx.save();
  drawLightConePath(ctx, originX, originY, angle, beamLength, beamWidth, time, 0.8);
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';

  const beerGradient = ctx.createLinearGradient(
    originX,
    originY,
    originX + forwardX * beamLength,
    originY + forwardY * beamLength
  );
  beerGradient.addColorStop(0, `rgba(235,252,255,${0.38 * flicker * depthIntensity})`);
  beerGradient.addColorStop(0.04, `rgba(190,245,255,${0.32 * flicker * depthIntensity})`);
  beerGradient.addColorStop(0.15, `rgba(130,230,252,${0.22 * flicker * depthIntensity})`);
  beerGradient.addColorStop(0.35, `rgba(70,200,240,${0.13 * flicker * depthIntensity})`);
  beerGradient.addColorStop(0.58, `rgba(34,160,210,${0.07 * flicker * depthIntensity})`);
  beerGradient.addColorStop(0.78, `rgba(20,120,180,${0.032 * flicker * depthIntensity})`);
  beerGradient.addColorStop(1, 'rgba(8,60,120,0)');
  ctx.fillStyle = beerGradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < 6; i++) {
    const laneOffset = -0.32 + i * 0.128;
    const lanePhase = Math.sin(time * 0.0014 + i * 1.73) * 0.06;
    const lane = laneOffset + lanePhase;
    const rayAlpha = (0.018 + i * 0.003) * flicker * depthIntensity;
    const start = beamLength * 0.04;
    const end = beamLength * (0.78 + Math.sin(time * 0.0009 + i) * 0.07);
    const offsetNear = lane * beamWidth * 0.06;
    const offsetFar = lane * beamWidth * 0.88;
    const ray = ctx.createLinearGradient(
      originX + forwardX * start + sideX * offsetNear,
      originY + forwardY * start + sideY * offsetNear,
      originX + forwardX * end + sideX * offsetFar,
      originY + forwardY * end + sideY * offsetFar
    );
    ray.addColorStop(0, `rgba(210,248,255,${rayAlpha * 1.6})`);
    ray.addColorStop(0.4, `rgba(100,220,245,${rayAlpha})`);
    ray.addColorStop(1, 'rgba(34,170,220,0)');
    ctx.strokeStyle = ray;
    ctx.lineWidth = 8 + i * 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(originX + forwardX * start + sideX * offsetNear, originY + forwardY * start + sideY * offsetNear);
    ctx.quadraticCurveTo(
      originX + forwardX * (end * 0.45) + sideX * (lane * beamWidth * 0.4 + Math.sin(time * 0.002 + i) * 16),
      originY + forwardY * (end * 0.45) + sideY * (lane * beamWidth * 0.4 + Math.sin(time * 0.002 + i) * 16),
      originX + forwardX * end + sideX * offsetFar,
      originY + forwardY * end + sideY * offsetFar
    );
    ctx.stroke();
  }

  spotlightParticles.forEach(particle => {
    particle.x += particle.vx + speed * 0.01;
    particle.y += particle.vy + Math.sin(time * particle.freq + particle.phase) * 0.03;
    if (particle.x < -5) particle.x = WIDTH + 5;
    if (particle.y < -5) particle.y = HEIGHT + 5;
    if (particle.y > HEIGHT + 5) particle.y = -5;

    const dx = particle.x - originX;
    const dy = particle.y - originY;
    const projection = dx * forwardX + dy * forwardY;
    const lateral = dx * sideX + dy * sideY;
    if (projection < 0 || projection > beamLength) return;

    const progress = projection / beamLength;
    const halfWidth = beamHalfWidth(progress) * 1.12;
    const lateralNorm = lateral / halfWidth;
    if (Math.abs(lateralNorm) >= 1) return;

    const lateralFactor = 1 - Math.abs(lateralNorm);
    const beamFalloff = Math.exp(-progress * 2.2) * lateralFactor * lateralFactor;
    const shimmer = 0.5 + 0.5 * Math.sin(time * particle.freq + particle.phase);
    const lit = beamFalloff * shimmer * flicker * depthIntensity;
    if (lit < 0.01) return;

    if (particle.type === 0) {
      ctx.fillStyle = `rgba(220,248,255,${particle.alpha * lit * 1.4})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 1.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const particleGlow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 2.2);
      particleGlow.addColorStop(0, `rgba(240,252,255,${particle.alpha * lit})`);
      particleGlow.addColorStop(1, 'rgba(180,240,255,0)');
      ctx.fillStyle = particleGlow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  for (let i = 0; i < 9; i++) {
    const progress = 0.12 + i * 0.095;
    const distance = beamLength * progress;
    const sway = Math.sin(time * 0.0018 + i * 2.1) * beamWidth * 0.22;
    const x = originX + forwardX * distance + sideX * sway;
    const y = originY + forwardY * distance + sideY * sway;
    const radius = 30 + i * 8 + Math.sin(time * 0.003 + i) * 8;
    const decayAlpha = Math.exp(-progress * 1.8) * 0.025 * flicker * depthIntensity;
    const patch = ctx.createRadialGradient(x, y, 2, x, y, radius);
    patch.addColorStop(0, `rgba(150,238,255,${decayAlpha})`);
    patch.addColorStop(0.5, `rgba(70,200,240,${decayAlpha * 0.5})`);
    patch.addColorStop(1, 'rgba(30,150,210,0)');
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 5; i++) {
    const progress = 0.25 + i * 0.14;
    const distance = beamLength * progress;
    const sway = Math.sin(time * 0.0016 + i * 3.3 + 1.1) * beamWidth * 0.32;
    const x = originX + forwardX * distance + sideX * sway;
    const y = originY + forwardY * distance + sideY * sway;
    const shadowRadius = 28 + i * 5;
    const shadowAlpha = 0.11 * Math.exp(-progress * 1.4);
    const deadZone = ctx.createRadialGradient(x, y, 2, x, y, shadowRadius);
    deadZone.addColorStop(0, `rgba(0,0,0,${shadowAlpha})`);
    deadZone.addColorStop(0.6, `rgba(0,0,0,${shadowAlpha * 0.4})`);
    deadZone.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = deadZone;
    ctx.beginPath();
    ctx.arc(x, y, shadowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawIlluminatedBackground = (
  ctx: CanvasRenderingContext2D,
  background: HTMLImageElement | undefined,
  player: { x: number; y: number; vx: number; vy: number; angle: number },
  time: number,
  depthIndex: number,
  spriteKey: PlayerSubmarineSpriteKey = 'front'
) => {
  if (!background?.complete || background.naturalWidth <= 0) {
    drawFallbackBackground(ctx);
    return;
  }

  const darkness = ([18, 15, 12, 10, 8][depthIndex] ?? 12) * DARKNESS_MULTIPLIER;
  const depthIntensity = 1 - depthIndex * 0.07;
  const speed = Math.hypot(player.vx, player.vy);
  const beamTime = time * 0.1425;
  const angle = player.angle + Math.sin(beamTime * 0.0055) * 0.014;
  const lampOffsets: Record<PlayerSubmarineSpriteKey, { x: number; y: number }> = {
    front: { x: 18, y: -34 },
    back: { x: -18, y: -34 },
    up: { x: 0, y: -42 },
    down: { x: 0, y: -26 },
    down_front: { x: 13, y: -30 },
    down_back: { x: -13, y: -30 },
    up_back: { x: -13, y: -38 },
    up_front: { x: 13, y: -38 },
    turn_1: { x: 0, y: -39 },
    turn_2: { x: 10, y: -36 },
    turn_3: { x: -10, y: -36 },
    turn_back_1: { x: 0, y: -39 },
    turn_back_2: { x: -10, y: -36 },
    turn_back_3: { x: 10, y: -36 },
  };
  const lampOffset = lampOffsets[spriteKey] || lampOffsets.front;
  const originX = player.x + lampOffset.x;
  const originY = player.y + lampOffset.y;
  const breath = 1
    + Math.sin(beamTime * 0.0026) * 0.048
    + Math.sin(beamTime * 0.0071) * 0.018;
  const beamLength = (520 + depthIndex * 34) * breath;
  const beamWidth = (104 + depthIndex * 10) * (1 + Math.sin(beamTime * 0.0038) * 0.038);
  const flicker = (0.88
    + Math.sin(beamTime * 0.017) * 0.05
    + Math.sin(beamTime * 0.041) * 0.025
    + Math.sin(beamTime * 0.097) * 0.012) * depthIntensity;
  const attenuation = ctx.createLinearGradient(originX, originY, originX + Math.cos(angle) * beamLength, originY + Math.sin(angle) * beamLength);
  attenuation.addColorStop(0, 'rgba(0,0,0,0)');
  attenuation.addColorStop(0.14, 'rgba(0,12,20,0.035)');
  attenuation.addColorStop(0.36, 'rgba(0,18,28,0.16)');
  attenuation.addColorStop(0.66, 'rgba(0,18,28,0.48)');
  attenuation.addColorStop(0.86, 'rgba(0,12,22,0.76)');
  attenuation.addColorStop(1, 'rgba(0,8,14,0.94)');

  ctx.save();
  ctx.filter = `brightness(${darkness}%) saturate(82%) contrast(108%)`;
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  ctx.restore();

  ctx.save();
  drawLightConePath(ctx, originX, originY, angle, beamLength, beamWidth, beamTime, 0.8);
  ctx.clip();
  ctx.globalAlpha = clamp(flicker * 0.88, 0.44, 0.78);
  ctx.filter = 'brightness(105%) saturate(118%) contrast(104%)';
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.fillStyle = attenuation;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'blur(22px)';
  drawLightConePath(ctx, originX, originY, angle, beamLength * 0.92, beamWidth * 1.18, beamTime, 0.55);
  const softGlow = ctx.createRadialGradient(originX, originY, 16, originX, originY, beamLength);
  softGlow.addColorStop(0, `rgba(160,240,255,${0.12 * flicker})`);
  softGlow.addColorStop(0.25, `rgba(80,200,240,${0.075 * flicker})`);
  softGlow.addColorStop(0.6, `rgba(40,160,210,${0.032 * flicker})`);
  softGlow.addColorStop(1, 'rgba(8,145,178,0)');
  ctx.fillStyle = softGlow;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'blur(3px)';
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(96,165,250,${0.08 * depthIntensity})`;
  drawLightConePath(ctx, originX - Math.sin(angle) * 1.5, originY + Math.cos(angle) * 1.5, angle, beamLength * 0.98, beamWidth * 1.008, beamTime + 180, 0.9);
  ctx.stroke();
  ctx.strokeStyle = `rgba(103,232,249,${0.11 * depthIntensity})`;
  drawLightConePath(ctx, originX + Math.sin(angle) * 1.5, originY - Math.cos(angle) * 1.5, angle, beamLength * 0.97, beamWidth * 0.995, beamTime, 1);
  ctx.stroke();
  ctx.restore();

  drawSubmergedBeamDetail(ctx, originX, originY, angle, beamLength, beamWidth, beamTime, depthIntensity, speed);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const coreGlow = ctx.createRadialGradient(originX, originY, 4, originX, originY, 96);
  coreGlow.addColorStop(0, `rgba(255,255,255,${0.58 * flicker})`);
  coreGlow.addColorStop(0.08, `rgba(220,250,255,${0.45 * flicker})`);
  coreGlow.addColorStop(0.22, `rgba(150,235,255,${0.24 * flicker * depthIntensity})`);
  coreGlow.addColorStop(0.5, `rgba(60,190,230,${0.08 * flicker * depthIntensity})`);
  coreGlow.addColorStop(1, 'rgba(20,120,180,0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(originX, originY, 96, 0, Math.PI * 2);
  ctx.fill();

  for (let ring = 0; ring < 3; ring++) {
    const radius = 18 + ring * 14 + Math.sin(beamTime * 0.012 + ring) * 2;
    const alpha = (0.12 - ring * 0.035) * flicker * depthIntensity;
    ctx.strokeStyle = `rgba(200,245,255,${alpha})`;
    ctx.lineWidth = 1.2 - ring * 0.3;
    ctx.beginPath();
    ctx.arc(originX, originY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 2; i++) {
    const flareDistance = 28 + i * 20 + Math.sin(beamTime * 0.009 + i) * 3;
    const x = originX + Math.cos(angle) * flareDistance;
    const y = originY + Math.sin(angle) * flareDistance;
    const radius = 12 + i * 6;
    const flare = ctx.createRadialGradient(x, y, 0, x, y, radius);
    flare.addColorStop(0, `rgba(180,242,255,${(0.16 - i * 0.05) * flicker * depthIntensity})`);
    flare.addColorStop(1, 'rgba(80,200,240,0)');
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

export default function NewEarthUnderwaterBattle({
  language,
  siteId,
  colonyId,
  colonyName,
  musicOn = true,
  submarineStats,
  onVictory,
  onDefeat,
  onTreasureLoot,
  onClose,
}: NewEarthUnderwaterBattleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const aimRef = useRef<AimState>({
    x: WIDTH / 2,
    y: HEIGHT / 2,
    inside: false,
    hoveredEnemyId: null,
    hoverStartedAt: 0,
    lockedEnemyId: null,
    clickQueued: false,
  });
  const frameRef = useRef<number | null>(null);
  const activeLaunchAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());
  const playerConstantMotorAudioRef = useRef<HTMLAudioElement | null>(null);
  const underwaterThemeAudioRef = useRef<HTMLAudioElement | null>(null);
  const radarAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    playUnderwaterSound(SUBMARINE_ENTER_SFX, 0.8);
    return () => {
      if (radarAudioRef.current) stopUnderwaterSound(radarAudioRef.current);
    };
  }, []);
  const mysteryRolledDepthsRef = useRef<Set<number>>(new Set());
  const nextMysteryRollAtRef = useRef(0);
  const ambientRolledDepthsRef = useRef<Set<number>>(new Set());
  const nextAmbientRollAtRef = useRef(0);
  const lastMoveDirectionRef = useRef<string | null>(null);
  const lastMotionSfxAtRef = useRef(0);
  const stoppingSfxArmedRef = useRef(false);
  const stoppingSfxPlayedRef = useRef(false);
  const lastStoppingSfxAtRef = useRef(0);
  const playerExplosionPlayedRef = useRef(false);
  const playerSpriteVisualRef = useRef<PlayerSpriteVisualState>({
    key: 'front',
    turnFrom: null,
    turnTo: null,
    turnStartedAt: 0,
    useBackTurnArc: false,
  });
  const [mounted, setMounted] = useState(false);
  const stateRef = useRef({
    player: { x: 145, y: HEIGHT / 2, vx: 0, vy: 0, hp: 100, maxHp: 100, cooldown: 0, angle: 0, thrust: 0, lastThrustAt: 0 } as PlayerEntity,
    enemies: [] as VecEntity[],
    shots: [] as Shot[],
    impacts: [] as ImpactBurst[],
    combatParticles: [] as CombatParticle[],
    bubbles: [] as Bubble[],
    treasures: [] as Treasure[],
    floatingTexts: [] as FloatingText[],
    nextEnemySpawnAt: 0,
    nextId: 1,
    kills: 0,
    phase: 'combat' as 'combat' | 'exploration' | 'defeat',
    victoryHandled: false,
  });
  const [status, setStatus] = useState<'fighting' | 'exploration' | 'defeat'>('fighting');
  const [kills, setKills] = useState(0);
  const [hull, setHull] = useState(100);
  const [treasuresFound, setTreasuresFound] = useState(0);
  const [oxygenPercent, setOxygenPercent] = useState(100);
  const [currentDepthMeters, setCurrentDepthMeters] = useState(0);
  const [portalFeedback, setPortalFeedback] = useState<string | null>(null);
  const portalFeedbackRef = useRef<string | null>(null);
  const oxygenRemainingMsRef = useRef(0);
  const oxygenInitializedRef = useRef(false);
  const lastHudUpdateAtRef = useRef(0);
  const [currentDepthIndex, setCurrentDepthIndex] = useState(0);
  const site = SITE_CONFIG[siteId];
  const maxDepth = submarineStats.maxDepth;
  const playerMaxHp = Math.round(100 * (1 + submarineStats.hullResistance / 100));
  const playerMaxSpeed = PLAYER_MAX_SPEED * (1 + submarineStats.speedBonus / 100);
  const playerShotSpeed = PLAYER_SHOT_SPEED * (1 + submarineStats.missileSpeedBonus / 100);
  const playerShotDamage = 16 * (1 + submarineStats.missileDamageBonus / 100);
  const treasureTotal = clamp(Math.floor(submarineStats.treasurePotential), 3, 8);
  const oxygenReserveMs = Math.max(45000, Math.round((submarineStats.oxygenSeconds || 75) * 1000));
  const unlockedDepthIndex = useMemo(() => (
    NEW_EARTH_SUBMARINE_DEPTH_STAGES.reduce((highest, depth, index) => (
      maxDepth >= depth ? index : highest
    ), 0)
  ), [maxDepth]);
  const depthMeters = NEW_EARTH_SUBMARINE_DEPTH_STAGES[currentDepthIndex];
  const nextDepthMeters = NEW_EARTH_SUBMARINE_DEPTH_STAGES[currentDepthIndex + 1];
  const backgroundSrc = site.backgrounds[currentDepthIndex] || site.backgrounds[0];

  const labels = useMemo(() => ({
    close: language === 'pt' ? 'Fechar' : 'Close',
    hp: language === 'pt' ? 'Casco' : 'Hull',
    kills: language === 'pt' ? 'Alvos' : 'Targets',
    controls: language === 'pt' ? 'WASD ou setas movem · Mouse mira · Clique dispara' : 'WASD or arrows move · Mouse aims · Click fires',
    exploration: language === 'pt' ? 'Área liberada para exploração' : 'Area cleared for exploration',
    defeat: language === 'pt' ? 'Submarino perdido' : 'Submarine lost',
    treasures: language === 'pt' ? 'Tesouros' : 'Treasures',
    depth: language === 'pt' ? 'Profundidade' : 'Depth',
    maxDepth: language === 'pt' ? 'Capacidade' : 'Capacity',
    oxygen: language === 'pt' ? 'Oxigênio' : 'Oxygen',
    power: language === 'pt' ? 'Energia' : 'Power',
    missionStatus: language === 'pt' ? 'Status da Missão' : 'Mission Status',
    objective: language === 'pt' ? 'Objetivo' : 'Objective',
    locateAnomaly: language === 'pt' ? 'Localize e abra tesouros' : 'Locate and open treasures',
    currentDepth: language === 'pt' ? 'Profundidade Atual' : 'Current Depth',
    surface: language === 'pt' ? 'Sair para a superfície' : 'Return to surface',
    oxygenCritical: language === 'pt' ? 'Oxigênio crítico. Retorne à superfície.' : 'Oxygen critical. Return to surface.',
    oxygenDepleted: language === 'pt' ? 'Oxigênio esgotado' : 'Oxygen depleted',
    portal: language === 'pt' ? 'Portal Profundo' : 'Deep Portal',
    finalDepth: language === 'pt' ? 'Limite explorado deste setor.' : 'Sector depth limit explored.',
  }), [language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    oxygenInitializedRef.current = false;
    setCurrentDepthIndex(0);
  }, [siteId, colonyId]);

  const updateAimFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    aimRef.current.x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    aimRef.current.y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    aimRef.current.inside = true;
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    updateAimFromPointer(event);
  };

  const handleCanvasPointerLeave = () => {
    aimRef.current.inside = false;
    aimRef.current.hoveredEnemyId = null;
    aimRef.current.lockedEnemyId = null;
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    updateAimFromPointer(event);
    aimRef.current.clickQueued = true;
  };

  useEffect(() => {
    stopUnderwaterSound(underwaterThemeAudioRef.current);
    underwaterThemeAudioRef.current = null;

    if (!musicOn) return;

    const tracks = UNDERWATER_THEME_TRACKS[siteId];
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    underwaterThemeAudioRef.current = playLoopingUnderwaterSound(track, 0.28);

    return () => {
      stopUnderwaterSound(underwaterThemeAudioRef.current);
      underwaterThemeAudioRef.current = null;
    };
  }, [musicOn, siteId]);

  useEffect(() => {
    const state = stateRef.current;
    Object.assign(state, {
      player: { x: 145, y: HEIGHT / 2, vx: 0, vy: 0, hp: playerMaxHp, maxHp: playerMaxHp, cooldown: 0, angle: 0, thrust: 0, lastThrustAt: 0 },
      enemies: [],
      shots: [],
      impacts: [],
      combatParticles: [],
      nextEnemySpawnAt: 0,
      nextId: 1,
      kills: 0,
      phase: 'combat' as const,
      victoryHandled: false,
    });
    state.bubbles = Array.from({ length: 86 }, (_, index) => {
      const rareBig = index % 17 === 0;
      const medium = index % 5 === 0;

      return {
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        speed: rareBig
          ? 0.09 + Math.random() * 0.14
          : medium
            ? 0.16 + Math.random() * 0.28
            : 0.24 + Math.random() * 0.52,
        radius: rareBig
          ? 7 + Math.random() * 9
          : medium
            ? 3 + Math.random() * 4
            : 1 + Math.random() * 2.4,
        drift: Math.random() * Math.PI * 2,
        wobble: 0.4 + Math.random() * 1.8,
        depth: rareBig ? 0.85 + Math.random() * 0.15 : Math.random(),
        alpha: rareBig
          ? 0.28 + Math.random() * 0.16
          : 0.12 + Math.random() * 0.18,
        shine: 0.5 + Math.random() * 0.5,
      };
    });
    state.treasures = Array.from({ length: treasureTotal }, (_, index) => {
      const angle = (index / treasureTotal) * Math.PI * 2;
      const distance = 180 + Math.random() * 120;
      
      const r = Math.random();
      let rarity: Treasure['rarity'] = 'normal';
      let variantSuffix = '';
      if (r < 0.05) {
        rarity = 'epic';
        variantSuffix = '4';
      } else if (r < 0.15) {
        rarity = 'legendary';
        variantSuffix = '2';
      } else if (r < 0.30) {
        rarity = 'rare';
        variantSuffix = '3';
      } else {
        rarity = 'normal';
        variantSuffix = Math.random() > 0.5 ? '' : '5';
      }

      let rewardType = 'qc';
      let rewardAmount = 0;

      if (rarity === 'normal') {
        const types = ['qc', 'biomassa', 'materiais', 'techParts', 'defCores', 'food', 'meds'];
        rewardType = types[Math.floor(Math.random() * types.length)];
        
        if (rewardType === 'qc') {
          const minQC = 200_000;
          const commonMaxQC = 1_000_000;
          const hardMaxQC = 1_500_000;
          const commonRoll = Math.pow(Math.random(), 1.28);
          const rolledQC = Math.random() < 0.86
            ? minQC + commonRoll * (commonMaxQC - minQC)
            : commonMaxQC + Math.random() * (hardMaxQC - commonMaxQC);
          rewardAmount = Math.min(hardMaxQC, Math.max(minQC, Math.round(rolledQC)));
        } else {
          rewardAmount = Math.round(40 + Math.floor(Math.pow(Math.random(), 2) * 110));
        }
      }
      const relic = pickTreasureRelic(rarity);

      return {
        id: stateRef.current.nextId++,
        x: WIDTH / 2 + Math.cos(angle) * distance,
        y: HEIGHT / 2 + Math.sin(angle) * distance,
        radius: 14 + Math.random() * 4,
        collected: false,
        pulse: Math.random() * Math.PI * 2,
        visible: false,
        hits: 0,
        open: false,
        colorVariant: variantSuffix,
        rarity,
        rewardPayload: relic
          ? { type: 'relic', amount: 1, relic }
          : { type: rewardType, amount: rewardAmount },
      };
    });
    portalFeedbackRef.current = null;
    playerSpriteVisualRef.current = {
      key: 'front',
      turnFrom: null,
      turnTo: null,
      turnStartedAt: 0,
      useBackTurnArc: false,
    };
    activeLaunchAudiosRef.current.forEach(stopUnderwaterSound);
    activeLaunchAudiosRef.current.clear();
    Object.assign(aimRef.current, {
      hoveredEnemyId: null,
      hoverStartedAt: 0,
      lockedEnemyId: null,
      clickQueued: false,
    });
    stopUnderwaterSound(playerConstantMotorAudioRef.current);
    playerConstantMotorAudioRef.current = null;
    lastMoveDirectionRef.current = null;
    lastMotionSfxAtRef.current = 0;
    nextMysteryRollAtRef.current = 0;
    nextAmbientRollAtRef.current = 0;
    stoppingSfxArmedRef.current = false;
    stoppingSfxPlayedRef.current = false;
    lastStoppingSfxAtRef.current = 0;
    playerExplosionPlayedRef.current = false;
    setStatus('fighting');
    setHull(playerMaxHp);
    setKills(0);
    setTreasuresFound(0);
    if (!oxygenInitializedRef.current) {
      oxygenInitializedRef.current = true;
      oxygenRemainingMsRef.current = oxygenReserveMs;
    }
    lastHudUpdateAtRef.current = 0;
    setOxygenPercent(Math.max(0, Math.min(100, Math.round((oxygenRemainingMsRef.current / oxygenReserveMs) * 100))));
    setCurrentDepthMeters(NEW_EARTH_SUBMARINE_DEPTH_STAGES[currentDepthIndex]);
    setPortalFeedback(null);
  }, [currentDepthIndex, oxygenReserveMs, playerMaxHp, siteId, treasureTotal]);

  useEffect(() => {
    mysteryRolledDepthsRef.current.clear();
    nextMysteryRollAtRef.current = 0;
    ambientRolledDepthsRef.current.clear();
    nextAmbientRollAtRef.current = 0;
  }, [siteId, colonyId]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(event.key)) {
        event.preventDefault();
      }
      keysRef.current.add(event.key.toLowerCase());
    };
    const up = (event: KeyboardEvent) => keysRef.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const background = getImage(backgroundSrc);
    let lastTime = performance.now();
    const getNextEnemySpawnDelay = () => (
      NEXT_ENEMY_SPAWN_MIN_MS + Math.random() * (NEXT_ENEMY_SPAWN_MAX_MS - NEXT_ENEMY_SPAWN_MIN_MS)
    );

    const spawnEnemy = () => {
      const state = stateRef.current;
      if (state.enemies.length >= MAX_ACTIVE_ENEMIES) return;
      const side = Math.floor(Math.random() * 4);
      const spawn = [
        { x: -40, y: Math.random() * HEIGHT },
        { x: WIDTH + 40, y: Math.random() * HEIGHT },
        { x: Math.random() * WIDTH, y: -40 },
        { x: Math.random() * WIDTH, y: HEIGHT + 40 },
      ][side];
      const targetX = 120 + Math.random() * 520;
      const targetY = 90 + Math.random() * 360;
      const dx = targetX - spawn.x;
      const dy = targetY - spawn.y;
      const len = Math.hypot(dx, dy) || 1;
      const enemyId = state.nextId++;
      const spriteSetId = `enemy_submarine${((enemyId - 1) % 3) + 1}` as EnemySubmarineSpriteSetId;
      state.enemies.push({
        id: enemyId,
        x: spawn.x,
        y: spawn.y,
        vx: (dx / len) * (0.45 + Math.random() * 0.38),
        vy: (dy / len) * (0.45 + Math.random() * 0.38),
        radius: 25,
        hp: 32,
        maxHp: 32,
        cooldown: 900 + Math.random() * 1100,
        visual: {
          key: getPlayerSpriteKeyFromAngle(Math.atan2(dy, dx)),
          turnFrom: null,
          turnTo: null,
          turnStartedAt: 0,
          useBackTurnArc: Math.random() > 0.5,
          spriteSetId,
        },
      });
      playUnderwaterSound(ENEMY_SUBMARINE_ENTER_SFX, 0.5);
    };
    spawnEnemy();

    const spawnLaunchBubbles = (x: number, y: number, angle: number) => {
      const state = stateRef.current;
      for (let i = 0; i < 20; i++) {
        const particleAngle = angle + Math.PI + (Math.random() - 0.5) * 1.4;
        const speed = 0.9 + Math.random() * 3.2;
        state.combatParticles.push({
          x,
          y,
          vx: Math.cos(particleAngle) * speed,
          vy: Math.sin(particleAngle) * speed,
          life: 28 + Math.random() * 38,
          maxLife: 66,
          r: 1.4 + Math.random() * 3.2,
          type: 'bubble',
        });
      }
      state.combatParticles.push({ x, y, r: 4, maxR: 55, life: 20, maxLife: 20, type: 'launch_ring' });
    };

    const spawnImpact = (x: number, y: number, color: '#7dd3fc' | '#f87171' | '#fcd34d', isKill: boolean) => {
      const state = stateRef.current;
      const burstCount = isKill ? 3 : 1;
      for (let burst = 0; burst < burstCount; burst++) {
        const bx = x + (isKill ? (Math.random() - 0.5) * 30 : 0);
        const by = y + (isKill ? (Math.random() - 0.5) * 30 : 0);

        state.impacts.push({ x: bx, y: by, life: 32, maxLife: 32, maxR: isKill ? 90 : 65, color });
        state.impacts.push({ x: bx, y: by, life: 22, maxLife: 22, maxR: isKill ? 50 : 36, color: '#ffffff', delay: burst * 4 });

        for (let i = 0; i < (isKill ? 55 : 36); i++) {
          const particleAngle = Math.random() * Math.PI * 2;
          const speed = (isKill ? 2.5 : 1.8) + Math.random() * 5.5;
          state.combatParticles.push({
            x: bx,
            y: by,
            vx: Math.cos(particleAngle) * speed,
            vy: Math.sin(particleAngle) * speed,
            life: 20 + Math.random() * 50,
            maxLife: 70,
            r: 0.7 + Math.random() * 2.8,
            type: 'spark',
            color: Math.random() > 0.6 ? '#ffffff' : color,
          });
        }

        for (let i = 0; i < (isKill ? 28 : 16); i++) {
          const particleAngle = Math.random() * Math.PI * 2;
          const speed = 0.4 + Math.random() * 2.2;
          state.combatParticles.push({
            x: bx,
            y: by,
            vx: Math.cos(particleAngle) * speed,
            vy: Math.sin(particleAngle) * speed - 0.5,
            life: 40 + Math.random() * 65,
            maxLife: 105,
            r: 2.2 + Math.random() * 5,
            type: 'bubble',
          });
        }

        if (isKill) {
          for (let i = 0; i < 8; i++) {
            const particleAngle = Math.random() * Math.PI * 2;
            state.combatParticles.push({
              x: bx,
              y: by,
              vx: Math.cos(particleAngle) * 1.4,
              vy: Math.sin(particleAngle) * 1.4,
              life: 55 + Math.random() * 55,
              maxLife: 110,
              r: 3 + Math.random() * 7,
              type: 'debris',
              angle: Math.random() * Math.PI * 2,
              rotVel: (Math.random() - 0.5) * 0.18,
            });
          }
        }
      }
    };

    const shootPlayer = (target: VecEntity | null, locked: boolean) => {
      const state = stateRef.current;
      if (state.player.cooldown > 0) return;
      if (state.shots.some(shot => shot.ownerId === 'player')) return;
      if (!target) return;
      state.player.cooldown = 600;
      const willGuide = locked;
      const aim = aimRef.current;
      const baseAngle = Math.atan2((willGuide ? target.y : aim.y) - state.player.y, (willGuide ? target.x : aim.x) - state.player.x);
      const aimOffset = willGuide ? 0 : (Math.random() > 0.5 ? 1 : -1) * (0.08 + Math.random() * 0.18);
      const shotAngle = baseAngle + aimOffset;
      const speed = playerShotSpeed * 0.54;
      const launchAudio = playUnderwaterSound(PLAYER_TORPEDO_LAUNCH_SFX, 0.68);
      if (launchAudio) {
        activeLaunchAudiosRef.current.add(launchAudio);
        launchAudio.addEventListener('ended', () => activeLaunchAudiosRef.current.delete(launchAudio), { once: true });
      }
      state.shots.push({
        id: state.nextId++,
        from: 'player',
        ownerId: 'player',
        targetId: willGuide ? target.id : null,
        angle: shotAngle,
        speed,
        wakeSeed: Math.random() * 1000,
        x: state.player.x + Math.cos(shotAngle) * 42,
        y: state.player.y + Math.sin(shotAngle) * 24,
        vx: Math.cos(shotAngle) * speed,
        vy: Math.sin(shotAngle) * speed,
        damage: playerShotDamage,
        radius: 7,
        life: 300,
        trail: [],
        guideStrength: willGuide ? 0.038 : 0,
        wobble: 0,
        wobbleVel: 0,
        launchAudio,
      });
      spawnLaunchBubbles(state.player.x + Math.cos(shotAngle) * 40, state.player.y + Math.sin(shotAngle) * 24, shotAngle);
    };

    const loop = (time: number) => {
      const state = stateRef.current;
      const delta = Math.min(40, time - lastTime);
      lastTime = time;
      const step = delta / 16.67;

      if (state.phase !== 'defeat') {
        const keys = keysRef.current;
        let mx = 0;
        let my = 0;
        if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
        if (keys.has('d') || keys.has('arrowright')) mx += 1;
        if (keys.has('w') || keys.has('arrowup')) my -= 1;
        if (keys.has('s') || keys.has('arrowdown')) my += 1;
        const magnitude = Math.hypot(mx, my) || 1;
        if (mx !== 0 || my !== 0) {
          const ax = mx / magnitude;
          const ay = my / magnitude;
          const moveDirection = `${Math.sign(mx)}:${Math.sign(my)}`;
          if (lastMoveDirectionRef.current !== moveDirection && time - lastMotionSfxAtRef.current > 260) {
            playRandomUnderwaterSound(SUBMARINE_MOTION_SFX, 0.42);
            lastMotionSfxAtRef.current = time;
          }
          if (!playerConstantMotorAudioRef.current || playerConstantMotorAudioRef.current.paused) {
            playerConstantMotorAudioRef.current = playLoopingUnderwaterSound(SUBMARINE_PLAYER_CONSTANT_SFX, 0.32);
          }
          lastMoveDirectionRef.current = moveDirection;
          stoppingSfxArmedRef.current = true;
          stoppingSfxPlayedRef.current = false;
          state.player.angle = Math.atan2(ay, ax);
          state.player.vx += ax * PLAYER_ACCELERATION * step;
          state.player.vy += ay * PLAYER_ACCELERATION * step;
          state.player.thrust = clamp(state.player.thrust + 0.14 * step, 0, 1);
          state.player.lastThrustAt = time;
        } else {
          lastMoveDirectionRef.current = null;
          stopUnderwaterSound(playerConstantMotorAudioRef.current);
          playerConstantMotorAudioRef.current = null;
          state.player.thrust *= Math.pow(0.9, step);
        }
        const currentSpeed = Math.hypot(state.player.vx, state.player.vy);
        if (currentSpeed > playerMaxSpeed) {
          state.player.vx = (state.player.vx / currentSpeed) * playerMaxSpeed;
          state.player.vy = (state.player.vy / currentSpeed) * playerMaxSpeed;
        }
        const drag = Math.pow(PLAYER_WATER_DRAG, step);
        state.player.vx *= drag;
        state.player.vy *= drag;
        if (Math.hypot(state.player.vx, state.player.vy) < 0.015) {
          state.player.vx = 0;
          state.player.vy = 0;
        }
        const driftSpeed = Math.hypot(state.player.vx, state.player.vy);
        if (
          mx === 0 &&
          my === 0 &&
          stoppingSfxArmedRef.current &&
          !stoppingSfxPlayedRef.current &&
          driftSpeed > 0.06 &&
          driftSpeed < 0.46 &&
          time - lastStoppingSfxAtRef.current > 900
        ) {
          playUnderwaterSound(SUBMARINE_PLAYER_STOPPING_SFX, 0.46);
          stoppingSfxPlayedRef.current = true;
          lastStoppingSfxAtRef.current = time;
        }
        if (driftSpeed === 0) {
          stoppingSfxArmedRef.current = false;
        }
        state.player.x += state.player.vx * step;
        state.player.y += state.player.vy * step;
        if (state.player.x < 42 || state.player.x > WIDTH - 42) {
          state.player.x = clamp(state.player.x, 42, WIDTH - 42);
          state.player.vx *= -0.22;
        }
        if (state.player.y < 48 || state.player.y > HEIGHT - 42) {
          state.player.y = clamp(state.player.y, 48, HEIGHT - 42);
          state.player.vy *= -0.22;
        }
        state.player.cooldown = Math.max(0, state.player.cooldown - delta);

        const depthRangeStart = currentDepthIndex === 0 ? 0 : NEW_EARTH_SUBMARINE_DEPTH_STAGES[currentDepthIndex - 1];
        const depthRangeEnd = NEW_EARTH_SUBMARINE_DEPTH_STAGES[currentDepthIndex];
        const verticalFactor = clamp((state.player.y - 48) / Math.max(1, HEIGHT - 90), 0, 1);
        const motionFactor = clamp(Math.hypot(state.player.vx, state.player.vy) / Math.max(0.1, playerMaxSpeed), 0, 1);
        const simulatedDepth = Math.round(depthRangeStart + (depthRangeEnd - depthRangeStart) * (0.28 + verticalFactor * 0.64 + Math.sin(time * 0.0016) * 0.015));
        const drainMultiplier = 1 + currentDepthIndex * 0.08 + motionFactor * 0.12;
        oxygenRemainingMsRef.current = Math.max(0, oxygenRemainingMsRef.current - delta * drainMultiplier);

        if (time - lastHudUpdateAtRef.current > 140) {
          lastHudUpdateAtRef.current = time;
          setCurrentDepthMeters(clamp(simulatedDepth, 0, depthRangeEnd));
          setOxygenPercent(Math.max(0, Math.min(100, Math.round((oxygenRemainingMsRef.current / oxygenReserveMs) * 100))));
        }

        if (oxygenRemainingMsRef.current <= 0) {
          if (!playerExplosionPlayedRef.current) {
            playerExplosionPlayedRef.current = true;
            playRandomUnderwaterSound(SUBMARINE_EXPLOSION_SFX, 0.72);
          }
          stopUnderwaterSound(playerConstantMotorAudioRef.current);
          playerConstantMotorAudioRef.current = null;
          state.phase = 'defeat';
          setStatus('defeat');
          setPortalFeedback(labels.oxygenDepleted);
          onDefeat?.();
        }

        if (state.phase === 'defeat') {
          frameRef.current = requestAnimationFrame(loop);
          return;
        }

        if (!ambientRolledDepthsRef.current.has(currentDepthIndex)) {
          if (nextAmbientRollAtRef.current === 0) {
            nextAmbientRollAtRef.current = time + 900 + Math.random() * 8500;
          }
          if (time >= nextAmbientRollAtRef.current) {
            ambientRolledDepthsRef.current.add(currentDepthIndex);
            if (Math.random() < 0.2) {
              playRandomUnderwaterSound(UNDERWATER_OCEAN_AMBIENT_SFX, 0.48);
            }
            nextAmbientRollAtRef.current = time + 18000 + Math.random() * 22000;
          }
        } else {
          if (nextAmbientRollAtRef.current > 0 && time >= nextAmbientRollAtRef.current) {
            playRandomUnderwaterSound(UNDERWATER_OCEAN_AMBIENT_SFX, 0.38);
            nextAmbientRollAtRef.current = time + 18000 + Math.random() * 22000;
          }
        }

        if (state.phase === 'combat') {
          if (
            state.nextEnemySpawnAt > 0 &&
            time >= state.nextEnemySpawnAt &&
            state.enemies.length < MAX_ACTIVE_ENEMIES &&
            state.kills < TARGET_KILLS
          ) {
            state.nextEnemySpawnAt = 0;
            spawnEnemy();
          }

          const aim = aimRef.current;
          const hoveredEnemy = aim.inside
            ? state.enemies.find(enemy => Math.hypot(enemy.x - aim.x, enemy.y - aim.y) <= enemy.radius + 24) || null
            : null;
          if (hoveredEnemy) {
            if (aim.hoveredEnemyId !== hoveredEnemy.id) {
              aim.hoveredEnemyId = hoveredEnemy.id;
              aim.hoverStartedAt = time;
              aim.lockedEnemyId = null;
              stopUnderwaterSound(radarAudioRef.current);
              radarAudioRef.current = playLoopingUnderwaterSound(RADAR_SUBMARINE_SFX, 0.5);
            } else if (time - aim.hoverStartedAt >= PLAYER_TORPEDO_LOCK_MS) {
              if (aim.lockedEnemyId !== hoveredEnemy.id) {
                aim.lockedEnemyId = hoveredEnemy.id;
                stopUnderwaterSound(radarAudioRef.current);
                radarAudioRef.current = null;
                playUnderwaterSound(SUBMARINE_AIM_GREEN_SFX, 0.7);
              }
            }
          } else {
            if (aim.hoveredEnemyId !== null) {
              aim.hoveredEnemyId = null;
              aim.hoverStartedAt = 0;
              aim.lockedEnemyId = null;
              stopUnderwaterSound(radarAudioRef.current);
              radarAudioRef.current = null;
            }
          }
          if (aim.clickQueued) {
            aim.clickQueued = false;
            if (hoveredEnemy) {
              shootPlayer(hoveredEnemy, aim.lockedEnemyId === hoveredEnemy.id);
            }
          }

          state.enemies.forEach(enemy => {
            const dx = state.player.x - enemy.x;
            const dy = state.player.y - enemy.y;
            const len = Math.hypot(dx, dy) || 1;
            enemy.vx += (dx / len) * 0.012 * step;
            enemy.vy += (dy / len) * 0.012 * step;
            const speed = Math.hypot(enemy.vx, enemy.vy) || 1;
            const maxSpeed = 1.02;
            enemy.vx = (enemy.vx / speed) * Math.min(maxSpeed, speed);
            enemy.vy = (enemy.vy / speed) * Math.min(maxSpeed, speed);
            enemy.x += enemy.vx * step;
            enemy.y += enemy.vy * step;
            enemy.cooldown -= delta;
            if (enemy.cooldown <= 0 && !state.shots.some(shot => shot.ownerId === `enemy:${enemy.id}`)) {
              enemy.cooldown = 1350 + Math.random() * 900;
              state.shots.push({
                id: state.nextId++,
                from: 'enemy',
                ownerId: `enemy:${enemy.id}`,
                targetId: null,
                angle: Math.atan2(dy, dx),
                speed: ENEMY_SHOT_SPEED,
                wakeSeed: Math.random() * 1000,
                x: enemy.x - 20,
                y: enemy.y,
                vx: (dx / len) * ENEMY_SHOT_SPEED,
                vy: (dy / len) * ENEMY_SHOT_SPEED,
                damage: 9,
                radius: 4,
                life: 190,
                trail: [],
                guideStrength: 0,
                wobble: 0,
                wobbleVel: 0,
              });
            }
          });
        } else if (state.phase === 'exploration') {
          const aim = aimRef.current;
          const hoveredTreasure = aim.inside
            ? state.treasures.find(treasure => !treasure.open && Math.hypot(treasure.x - aim.x, treasure.y - aim.y) <= treasure.radius + 32) || null
            : null;
            
          if (hoveredTreasure) {
            if (aim.hoveredEnemyId !== hoveredTreasure.id) {
              aim.hoveredEnemyId = hoveredTreasure.id;
              aim.hoverStartedAt = time;
              aim.lockedEnemyId = null;
              stopUnderwaterSound(radarAudioRef.current);
              radarAudioRef.current = playLoopingUnderwaterSound(RADAR_SUBMARINE_SFX, 0.5);
            } else if (time - aim.hoverStartedAt >= PLAYER_TORPEDO_LOCK_MS) {
              if (aim.lockedEnemyId !== hoveredTreasure.id) {
                aim.lockedEnemyId = hoveredTreasure.id;
                hoveredTreasure.visible = true;
                stopUnderwaterSound(radarAudioRef.current);
                radarAudioRef.current = null;
                playUnderwaterSound(SUBMARINE_AIM_GREEN_SFX, 0.7);
              }
            }
          } else {
            if (aim.hoveredEnemyId !== null) {
              aim.hoveredEnemyId = null;
              aim.hoverStartedAt = 0;
              aim.lockedEnemyId = null;
              stopUnderwaterSound(radarAudioRef.current);
              radarAudioRef.current = null;
            }
          }

          if (aim.clickQueued) {
            aim.clickQueued = false;
            if (hoveredTreasure && aim.lockedEnemyId === hoveredTreasure.id) {
              shootPlayer(hoveredTreasure as any, true);
            }
          }
        }

        state.shots.forEach(shot => {
          if (shot.from === 'player' && shot.targetId && shot.guideStrength > 0) {
            const target = state.phase === 'combat' ? state.enemies.find(enemy => enemy.id === shot.targetId) : state.treasures.find(t => t.id === shot.targetId);
            if (target) {
              const desiredAngle = Math.atan2(target.y - shot.y, target.x - shot.x);
              const angleDelta = Math.atan2(Math.sin(desiredAngle - shot.angle), Math.cos(desiredAngle - shot.angle));
              shot.angle += angleDelta * shot.guideStrength * step;
              shot.vx = Math.cos(shot.angle) * shot.speed;
              shot.vy = Math.sin(shot.angle) * shot.speed;
            } else {
              shot.targetId = null;
            }
          } else {
            shot.angle = Math.atan2(shot.vy, shot.vx);
          }
          if (shot.from === 'player') {
            shot.wobbleVel += (Math.random() - 0.5) * 0.002 * step;
            shot.wobbleVel *= Math.pow(0.92, step);
            shot.wobble += shot.wobbleVel * step;
            shot.angle += shot.wobble * 0.01;
            shot.vx = Math.cos(shot.angle) * shot.speed;
            shot.vy = Math.sin(shot.angle) * shot.speed;
          }
          shot.x += shot.vx * step;
          shot.y += shot.vy * step;
          if (shot.from === 'player') {
            shot.trail.push({ x: shot.x, y: shot.y });
            if (shot.trail.length > 24) shot.trail.shift();
          }
          shot.life -= step;
        });

        state.shots = state.shots.filter(shot => {
          if (shot.life <= 0 || shot.x < -60 || shot.x > WIDTH + 60 || shot.y < -60 || shot.y > HEIGHT + 60) {
            return false;
          }
          if (shot.from === 'player' && state.phase === 'combat') {
            const target = state.enemies.find(enemy => Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < enemy.radius + shot.radius);
            if (target) {
              target.hp -= shot.damage;
              spawnImpact(shot.x, shot.y, '#7dd3fc', false);
              if (target.hp <= 0) {
                spawnImpact(target.x, target.y, '#f87171', true);
              }
              stopUnderwaterSound(shot.launchAudio);
              if (shot.launchAudio) activeLaunchAudiosRef.current.delete(shot.launchAudio);
              playUnderwaterSound(PLAYER_TORPEDO_IMPACT_SFX, 0.72);
              return false;
            }
          } else if (shot.from === 'player' && state.phase === 'exploration') {
            const target = state.treasures.find(treasure => treasure.visible && !treasure.open && Math.hypot(treasure.x - shot.x, treasure.y - shot.y) < treasure.radius + shot.radius);
            if (target) {
              target.hits += 1;
              spawnImpact(shot.x, shot.y, '#fcd34d', false);
              if (target.hits >= 1) {
                target.open = true;
                spawnImpact(target.x, target.y, '#fcd34d', true);
              }
              stopUnderwaterSound(shot.launchAudio);
              if (shot.launchAudio) activeLaunchAudiosRef.current.delete(shot.launchAudio);
              playUnderwaterSound(PLAYER_TORPEDO_IMPACT_SFX, 0.72);
              return false;
            }
          } else if (state.phase === 'combat' && Math.hypot(state.player.x - shot.x, state.player.y - shot.y) < 28 + shot.radius) {
            state.player.hp -= shot.damage;
            spawnImpact(shot.x, shot.y, '#f87171', false);
            setHull(Math.max(0, Math.round(state.player.hp)));
            return false;
          }
          return true;
        });

        if (state.phase === 'combat') {
          const before = state.enemies.length;
          const destroyedEnemies = state.enemies.filter(enemy => enemy.hp <= 0);
          destroyedEnemies.forEach(() => playRandomUnderwaterSound(SUBMARINE_EXPLOSION_SFX, 0.76));
          state.enemies = state.enemies.filter(enemy => enemy.hp > 0);
          if (state.enemies.length !== before) {
            state.kills += before - state.enemies.length;
            setKills(state.kills);
            state.nextEnemySpawnAt = state.kills < TARGET_KILLS ? time + getNextEnemySpawnDelay() : 0;
            Object.assign(aimRef.current, {
              hoveredEnemyId: null,
              hoverStartedAt: 0,
              lockedEnemyId: null,
              clickQueued: false,
            });
          }

          if (state.kills >= TARGET_KILLS) {
            state.phase = 'exploration';
            state.enemies = [];
            state.shots = [];
            setStatus('exploration');
            if (!state.victoryHandled) {
              state.victoryHandled = true;
              onVictory?.();
            }
          } else if (state.player.hp <= 0) {
            if (!playerExplosionPlayedRef.current) {
              playerExplosionPlayedRef.current = true;
              playRandomUnderwaterSound(SUBMARINE_EXPLOSION_SFX, 0.86);
            }
            stopUnderwaterSound(playerConstantMotorAudioRef.current);
            playerConstantMotorAudioRef.current = null;
            state.phase = 'defeat';
            setStatus('defeat');
            onDefeat?.();
          }
        }

        if (state.phase === 'exploration') {
          if (!mysteryRolledDepthsRef.current.has(currentDepthIndex)) {
            if (nextMysteryRollAtRef.current === 0) {
              nextMysteryRollAtRef.current = time + 2200 + Math.random() * 11000;
            }
            if (time >= nextMysteryRollAtRef.current) {
              mysteryRolledDepthsRef.current.add(currentDepthIndex);
              nextMysteryRollAtRef.current = 0;
              const mysteryChance = Math.min(0.17, 0.05 + currentDepthIndex * 0.03);
              if (Math.random() < mysteryChance) {
                playRandomUnderwaterSound(UNDERWATER_MYSTERY_SFX, 0.54);
              }
            }
          }
          let collected = false;
          state.treasures.forEach(treasure => {
            treasure.pulse += 0.045 * step;
            const dx = state.player.x - treasure.x;
            const dy = state.player.y - treasure.y;
            const distSq = dx * dx + dy * dy;
            if (!treasure.collected && treasure.open && distSq < (28 + treasure.radius + 20) ** 2) {
              treasure.collected = true;
              collected = true;
              if (onTreasureLoot) {
                onTreasureLoot(treasure.rewardPayload);
              }
              if (treasure.rewardPayload.relic) {
                state.floatingTexts.push({
                  x: treasure.x,
                  y: treasure.y - treasure.radius - 34,
                  text: treasure.rewardPayload.relic.name,
                  color: treasure.rarity === 'legendary' ? '#f87171' : treasure.rarity === 'epic' ? '#c084fc' : '#60a5fa',
                  life: 150,
                  maxLife: 150
                });
              } else if (treasure.rarity === 'normal' && treasure.rewardPayload.amount > 0) {
                const isQc = treasure.rewardPayload.type === 'qc';
                const color = isQc ? '#fbbf24' : '#6ee7b7';
                let text = `+${treasure.rewardPayload.amount}`;
                if (!isQc) {
                  const labelsMap: Record<string, string> = {
                    biomassa: 'Biomassa', materiais: 'Materiais', techParts: 'Peças Tec',
                    defCores: 'Núcleos Def', food: 'Comida', meds: 'Insumos Méd'
                  };
                  text += ` ${labelsMap[treasure.rewardPayload.type] || treasure.rewardPayload.type}`;
                } else {
                  text += ' QC';
                }
                state.floatingTexts.push({
                  x: treasure.x,
                  y: treasure.y - treasure.radius - 30,
                  text,
                  color,
                  life: 120, // 2 seconds at 60fps
                  maxLife: 120
                });
              }
            }
          });
          if (collected) {
            setTreasuresFound(state.treasures.filter(treasure => treasure.collected).length);
          }
          const isAtDeepPortal = state.player.x > WIDTH - 160 && state.player.y > HEIGHT * 0.36 && state.player.y < HEIGHT * 0.64;
          let nextPortalFeedback: string | null = null;
          if (isAtDeepPortal) {
            if (nextDepthMeters && currentDepthIndex < unlockedDepthIndex) {
              setCurrentDepthIndex(current => Math.min(current + 1, unlockedDepthIndex));
              nextPortalFeedback = null;
            } else if (nextDepthMeters) {
              nextPortalFeedback = language === 'pt'
                ? `Melhore o submarino para alcançar ${nextDepthMeters.toLocaleString('pt-BR')} m.`
                : `Upgrade the submarine to reach ${nextDepthMeters.toLocaleString('en-US')} m.`;
            } else {
              nextPortalFeedback = labels.finalDepth;
            }
          }
          if (portalFeedbackRef.current !== nextPortalFeedback) {
            portalFeedbackRef.current = nextPortalFeedback;
            setPortalFeedback(nextPortalFeedback);
          }
        }
      }

      state.bubbles.forEach(bubble => {
        const depthSpeed = 0.65 + bubble.depth * 0.65;
        bubble.y -= bubble.speed * depthSpeed * step;
        bubble.x += Math.sin(time * 0.0012 * bubble.wobble + bubble.drift)
          * (0.12 + bubble.depth * 0.22)
          * step;
        bubble.x += Math.sin(time * 0.00045 + bubble.y * 0.012 + bubble.drift) * 0.045 * step;

        if (bubble.y < -bubble.radius - 16) {
          bubble.y = HEIGHT + bubble.radius + Math.random() * 40;
          bubble.x = Math.random() * WIDTH;
          bubble.drift = Math.random() * Math.PI * 2;
        }

        if (bubble.x < -20) bubble.x = WIDTH + 20;
        if (bubble.x > WIDTH + 20) bubble.x = -20;
      });
      state.impacts.forEach(impact => {
        if (impact.delay && impact.delay > 0) {
          impact.delay -= step;
          return;
        }
        impact.life -= step;
      });
      state.impacts = state.impacts.filter(impact => impact.life > 0);
      state.combatParticles.forEach(particle => {
        particle.life -= step;
        if (particle.vx !== undefined && particle.vy !== undefined) {
          particle.x += particle.vx * step;
          particle.y += particle.vy * step;
          particle.vx *= Math.pow(0.93, step);
          particle.vy *= Math.pow(0.93, step);
        }
        if (particle.type === 'debris') {
          particle.angle = (particle.angle || 0) + (particle.rotVel || 0) * step;
        }
      });
      state.combatParticles = state.combatParticles.filter(particle => particle.life > 0);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const playerSpeed = Math.hypot(state.player.vx, state.player.vy);
      const idleBobStrength = clamp(1 - playerSpeed / 0.72, 0, 1) * (1 - state.player.thrust);
      const idleBobY = Math.sin(time * 0.0024) * PLAYER_IDLE_BOB_AMPLITUDE * idleBobStrength
        + Math.sin(time * 0.0041 + 1.7) * 1.2 * idleBobStrength;
      const visualPlayer: PlayerEntity = {
        ...state.player,
        y: state.player.y + idleBobY,
      };
      const playerVisualKey = playerSpriteVisualRef.current.key;

      drawIlluminatedBackground(ctx, background, visualPlayer, time, currentDepthIndex, playerVisualKey);
      drawWaterOverlay(ctx, time, state.bubbles);
      drawOceanBubbles(ctx, state.bubbles, time);
      drawForegroundDebris(ctx, time);

      if (state.phase === 'exploration') {
        const firstHiddenTreasureId = state.treasures.find(t => !t.collected && !t.visible)?.id;

        state.treasures.forEach(treasure => {
          if (treasure.collected) return;
          
          let alpha = 1.0;
          if (!treasure.visible) {
            if (treasure.id === firstHiddenTreasureId) {
              const blink = Math.abs(Math.sin(time * 0.003));
              alpha = 0.05 + blink * 0.35;
            } else {
              return;
            }
          }
          
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(treasure.x, treasure.y);
          
          if (!treasure.open) {
            const img = getImage(`/assets/rota4/treasures/treasure_closed${treasure.colorVariant}.webp`);
            if (img) {
              const drawScale = 0.165; 
              ctx.scale(drawScale, drawScale);
              ctx.drawImage(img, -img.width / 2, -img.height / 2);
            }
          } else {
            const img = getImage(`/assets/rota4/treasures/treasure_open${treasure.colorVariant}.webp`);
            if (img) {
              const drawScale = 0.165; 
              ctx.save();
              ctx.scale(drawScale, drawScale);
              ctx.drawImage(img, -img.width / 2, -img.height / 2);
              ctx.restore();
            }
            
            const pulse = Math.sin(treasure.pulse) * 0.25 + 0.75;
            
            let glowColor = 'rgba(251,191,36,0.95)';
            let fillCol = 'rgba(251,191,36,0.92)';
            let strokeCol = 'rgba(254,243,199,0.95)';
            if (treasure.rarity === 'rare') {
              glowColor = 'rgba(59,130,246,0.95)';
              fillCol = 'rgba(59,130,246,0.92)';
              strokeCol = 'rgba(191,219,254,0.95)';
            } else if (treasure.rarity === 'legendary') {
              glowColor = 'rgba(239,68,68,0.95)';
              fillCol = 'rgba(239,68,68,0.92)';
              strokeCol = 'rgba(254,202,202,0.95)';
            } else if (treasure.rarity === 'epic') {
              glowColor = 'rgba(168,85,247,0.95)';
              fillCol = 'rgba(168,85,247,0.92)';
              strokeCol = 'rgba(233,213,255,0.95)';
            }

            const relic = treasure.rewardPayload.relic;
            if (relic) {
              const relicImage = getImage(relic.src);
              if (relicImage?.complete && relicImage.naturalWidth > 0) {
                const bob = Math.sin(treasure.pulse) * 3;
                const maxRelicSize = 50;
                const scale = Math.min(maxRelicSize / relicImage.width, maxRelicSize / relicImage.height);
                const drawWidth = relicImage.width * scale;
                const drawHeight = relicImage.height * scale;
                ctx.save();
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 22 * pulse;
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(
                  relicImage,
                  -drawWidth / 2,
                  -treasure.radius - 48 - drawHeight / 2 + bob,
                  drawWidth,
                  drawHeight
                );
                ctx.restore();
              }
            }

            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 18 * pulse;
            ctx.fillStyle = fillCol;
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -treasure.radius - 20);
            ctx.lineTo(10, -treasure.radius - 10);
            ctx.lineTo(0, -treasure.radius);
            ctx.lineTo(-10, -treasure.radius - 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        });

        drawDeepPortal(ctx, WIDTH, HEIGHT, time, labels);
      }

      state.enemies.forEach(enemy => drawTargetLockReticle(ctx, enemy, aimRef.current, state.shots, time));
      if (state.phase === 'exploration') {
        state.treasures.forEach(treasure => {
          if (treasure.visible && !treasure.open && aimRef.current.hoveredEnemyId === treasure.id) {
            drawTargetLockReticle(ctx, treasure as any, aimRef.current, state.shots, time);
          }
        });
      }

      state.shots.forEach(shot => {
        const targets = state.phase === 'combat' ? state.enemies : state.treasures;
        drawGuidanceLine(ctx, shot, targets as any, time);
        drawTorpedo(ctx, shot, time);
      });

      // Update and draw floating texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.life -= step;
        ft.y -= 0.5 * step;
        
        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
          continue;
        }

        const alpha = Math.min(1, ft.life / 20); // Fade out in the last 20 frames
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      state.impacts.forEach(burst => drawImpactBurst(ctx, burst));

      state.enemies.forEach(enemy => {
        drawEnemySpriteSubmarine(ctx, enemy, Math.atan2(enemy.vy, enemy.vx), time);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(enemy.x - 24, enemy.y - 30, 48, 4);
        ctx.fillStyle = 'rgba(248,113,113,0.9)';
        ctx.fillRect(enemy.x - 24, enemy.y - 30, 48 * Math.max(0, enemy.hp / enemy.maxHp), 4);
      });

      drawPropellerWake(ctx, visualPlayer, time);

      const playerSprites = PLAYER_SUBMARINE_SPRITES[colonyId];
      if (playerSprites) {
        drawNeptuneTurnLightImpact(ctx, visualPlayer.x, visualPlayer.y, visualPlayer.angle, time, playerSpriteVisualRef.current);
        drawPlayerSpriteSubmarine(ctx, visualPlayer.x, visualPlayer.y, visualPlayer.angle, time, playerSpriteVisualRef.current, playerSprites);
      } else {
        drawSubmarine(ctx, visualPlayer.x, visualPlayer.y, visualPlayer.angle, 'rgba(8,145,178,0.94)', true, time);
      }
      // drawLaunchBar(ctx, visualPlayer, time);
      drawCombatParticles(ctx, state.combatParticles);
      drawTargetingReticle(ctx, aimRef.current, time);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [backgroundSrc, colonyId, currentDepthIndex, labels.finalDepth, labels.oxygenDepleted, labels.portal, language, mounted, nextDepthMeters, onDefeat, onTreasureLoot, onVictory, oxygenReserveMs, playerMaxSpeed, playerShotDamage, playerShotSpeed, unlockedDepthIndex]);

  useEffect(() => () => {
    activeLaunchAudiosRef.current.forEach(stopUnderwaterSound);
    activeLaunchAudiosRef.current.clear();
    stopUnderwaterSound(playerConstantMotorAudioRef.current);
    playerConstantMotorAudioRef.current = null;
    stopUnderwaterSound(underwaterThemeAudioRef.current);
    underwaterThemeAudioRef.current = null;
  }, []);

  const hp = Math.max(0, hull);
  const hpPercent = Math.max(0, Math.min(100, Math.round((hp / Math.max(1, playerMaxHp)) * 100)));
  const powerPercent = Math.max(0, Math.min(100, Math.round(64 + submarineStats.speedBonus * 0.9 + submarineStats.missileSpeedBonus * 0.45)));
  const oxygenCritical = status !== 'defeat' && oxygenPercent <= 18;
  const formattedCurrentDepth = currentDepthMeters.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US');
  const formattedStageDepth = depthMeters.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US');

  if (!mounted) return null;

  const overlay = (
    <div className="fixed inset-0 z-[1450] flex items-center justify-center bg-black/88 p-5 backdrop-blur-xl">
      <div className={`relative grid w-full max-w-[104rem] grid-cols-1 overflow-hidden rounded-3xl border border-cyan-300/30 bg-gradient-to-br ${site.tone} shadow-[0_0_90px_rgba(34,211,238,0.22)] xl:grid-cols-[minmax(0,1280px)_340px]`}>
        <PremiumCanvasButton
          type="button"
          onClick={onClose}
          tone="steel"
          className="absolute right-5 top-5 z-30 h-10 w-10 rounded-full"
          contentClassName="text-cyan-100"
          aria-label={labels.close}
        >
          <X size={18} />
        </PremiumCanvasButton>

        <div className="relative aspect-video min-h-0 bg-black">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="h-full w-full cursor-crosshair"
            onPointerMove={handleCanvasPointerMove}
            onPointerLeave={handleCanvasPointerLeave}
            onPointerDown={handleCanvasPointerDown}
          />
          <div className="pointer-events-none absolute left-5 top-5 w-[250px] border border-cyan-200/35 bg-slate-950/55 px-4 py-3 shadow-[0_0_26px_rgba(34,211,238,0.18)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/75">{labels.oxygen}</p>
              <span className={`font-orbitron text-lg font-black ${oxygenCritical ? 'text-red-200' : 'text-cyan-50'}`}>{oxygenPercent}%</span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">{language === 'pt' ? 'Reserva restante' : 'Remaining reserve'}</p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-sm border border-cyan-100/20 bg-black/58">
              <div
                className={`h-full transition-[width] duration-200 ${oxygenCritical ? 'bg-red-400' : 'bg-cyan-300'}`}
                style={{ width: `${oxygenPercent}%` }}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute left-5 top-[150px] flex gap-3 border border-cyan-200/25 bg-slate-950/45 px-3 py-3 shadow-[0_0_24px_rgba(34,211,238,0.14)] backdrop-blur-sm">
            <div className="flex h-[172px] w-3 items-end overflow-hidden rounded-sm border border-cyan-100/25 bg-black/65">
              <div
                className={`mt-auto w-full ${oxygenCritical ? 'bg-gradient-to-t from-red-400 to-cyan-300' : 'bg-cyan-300'}`}
                style={{ height: `${Math.max(6, oxygenPercent)}%` }}
              />
            </div>
            <div className="w-[170px] space-y-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/62">{labels.hp}</p>
                <p className="font-orbitron text-2xl font-black leading-none text-cyan-50">{hpPercent}%</p>
                <div className="mt-1.5 h-1.5 overflow-hidden bg-black/55">
                  <div className="h-full bg-cyan-300" style={{ width: `${hpPercent}%` }} />
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/62">{labels.currentDepth}</p>
                <p className="font-orbitron text-2xl font-black leading-none text-cyan-50">{formattedCurrentDepth}m</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/62">{labels.power}</p>
                <p className="font-orbitron text-2xl font-black leading-none text-cyan-50">{powerPercent}%</p>
                <div className="mt-1.5 h-1.5 overflow-hidden bg-black/55">
                  <div className="h-full bg-cyan-300" style={{ width: `${powerPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute right-5 top-[88px] w-[330px] border border-cyan-200/35 bg-slate-950/50 px-4 py-3 shadow-[0_0_26px_rgba(34,211,238,0.16)] backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">{labels.missionStatus}</p>
            <div className="mt-2 flex items-start gap-2">
              <span className="mt-1 h-3 w-3 rounded-full border border-cyan-200 bg-cyan-400/35 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">{labels.objective}</p>
                <p className="font-orbitron text-sm font-black uppercase leading-tight text-white">{labels.locateAnomaly}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/55">
                  {formattedStageDepth}m · {treasuresFound}/{treasureTotal}
                </p>
              </div>
            </div>
          </div>

          {oxygenCritical && (
            <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-xl border border-red-300/35 bg-red-950/72 px-5 py-3 font-orbitron text-xs font-black uppercase tracking-[0.16em] text-red-100 shadow-[0_0_26px_rgba(248,113,113,0.22)]">
              {labels.oxygenCritical}
            </div>
          )}
          {status === 'defeat' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/42">
              <div className="rounded-2xl border border-cyan-300/35 bg-slate-950/88 px-8 py-6 text-center shadow-[0_0_40px_rgba(34,211,238,0.24)]">
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-200">{site.title[language]}</p>
                <h3 className="mt-2 font-orbitron text-4xl font-black uppercase text-white">
                  {labels.defeat}
                </h3>
              </div>
            </div>
          )}
          {portalFeedback && (
            <div className="absolute bottom-5 right-5 max-w-sm rounded-xl border border-cyan-300/30 bg-slate-950/85 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100">
              {portalFeedback}
            </div>
          )}
        </div>

        <aside className="flex min-h-[720px] flex-col justify-between border-t border-cyan-300/15 bg-black/38 p-6 xl:border-l xl:border-t-0">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-cyan-200/70">{site.subtitle[language]}</p>
            <h2 className="mt-2 font-orbitron text-3xl font-black uppercase leading-tight text-white">{site.title[language]}</h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-50/72">
              {language === 'pt'
                ? `${colonyName} enviou um submarino de ataque para operar em profundidade extrema.`
                : `${colonyName} deployed an attack submarine for extreme-depth operations.`}
            </p>
            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-black/24 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">{labels.depth}</p>
              <p className="mt-2 font-orbitron text-2xl font-black text-white">{depthMeters.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')} m</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/55">
                {labels.maxDepth}: {maxDepth.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')} m
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">{labels.hp}</p>
              <p className="mt-2 font-orbitron text-3xl font-black text-white">{hpPercent}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/55">
                <div className="h-full bg-cyan-300" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-red-300/20 bg-red-300/8 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-red-200/70">{labels.kills}</p>
              <p className="mt-2 font-orbitron text-3xl font-black text-white">{kills} / {TARGET_KILLS}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-200/70">{labels.treasures}</p>
              <p className="mt-2 font-orbitron text-3xl font-black text-white">{treasuresFound} / {treasureTotal}</p>
            </div>
          </div>

          <PremiumCanvasButton
            type="button"
            onClick={onClose}
            tone="cyan"
            className="h-12 rounded-2xl"
            contentClassName="px-4 text-[12px] font-black uppercase tracking-[0.22em] text-white"
          >
            {labels.surface}
          </PremiumCanvasButton>
        </aside>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
