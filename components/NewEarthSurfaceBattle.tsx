'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, X } from 'lucide-react';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';
import { NewEarthHelicopterBattle } from './NewEarthHelicopterBattle';

export type NewEarthSurfaceBattleSiteId = 'zona-glacial' | 'ruinas-europeias' | 'continente-esquecido';
export type NewEarthSurfaceBattleKind = 'tank' | 'helicopter';

type NewEarthSupplyReward = Partial<Record<'materials' | 'biomass' | 'tech' | 'defense' | 'food' | 'meds', number>>;

export type NewEarthSurfaceBattleVictoryPayload = {
  qcReward?: number;
  supplies?: NewEarthSupplyReward;
  specialDrop?: boolean;
};

interface NewEarthSurfaceBattleProps {
  language: 'en' | 'pt';
  siteId: NewEarthSurfaceBattleSiteId;
  battleKind: NewEarthSurfaceBattleKind;
  colonyName: string;
  defenseBattleLevel: number;
  background?: string;
  helicopterStats?: {
    speedBonus: number;
    gunDamageBonus: number;
    missileDamageBonus: number;
    startingMissiles: number;
    armorReduction: number;
    initialDrones: number;
  };
  tankStats?: {
    speedBonus: number;
    shotDamageBonus: number;
    shotSpeedBonus: number;
    armorReduction: number;
    rewardBonus: number;
  };
  onClose: () => void;
  onVictory: (payload?: NewEarthSurfaceBattleVictoryPayload) => void;
  onDefeat: () => void;
}

type Unit = {
  id: number;
  kind?: 'common' | 'elite' | 'boss';
  x: number;
  y: number;
  angle: number;
  turretAngle?: number;
  vx?: number;
  vy?: number;
  recoil?: number;
  speedNow?: number;
  lastTrack?: number;
  hitFlash?: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  radius: number;
};

type TankSpriteKind = 'player' | NonNullable<Unit['kind']>;

type TankSpriteConfig = {
  body: string;
  turret: string;
  bodyWidth: number;
  bodyHeight: number;
  turretWidth: number;
  turretHeight: number;
  turretPivotX: number;
  turretPivotY: number;
  turretAngleOffset: number;
  barrelLength: number;
};

type Shot = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  from: 'player' | 'enemy';
  visualType?: 'common' | 'elite' | 'boss';
  damage: number;
  life: number;
};

type EffectParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  drag?: number;
  growth?: number;
  rotation?: number;
  spin?: number;
  type?: 'spark' | 'smoke' | 'debris' | 'impact';
};

type Shockwave = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  decay: number;
  color: string;
  width: number;
};

type Glow = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color1: string;
  color2: string;
};

type Streak = {
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

type SmokeRing = {
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

type Flash = {
  color: string;
  life: number;
  maxLife: number;
  intensity: number;
};

type ShellCasing = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  life: number;
};

type MuzzleFlash = {
  x: number;
  y: number;
  angle: number;
  life: number;
  maxLife: number;
  scale: number;
};

type DestroyedTank = {
  x: number;
  y: number;
  angle: number;
  kind: NonNullable<Unit['kind']>;
  burn: number;
};

type TankBossDrop = {
  id: number;
  x: number;
  y: number;
  phase: number;
};

const WIDTH = 960;
const HEIGHT = 540;
const ENEMY_HALF_MAX_Y = HEIGHT / 2 - 28;
const HELICOPTER_PLAYER_HP = 500;
const HELICOPTER_PLAYER_DAMAGE = 100;
const HELICOPTER_TOTAL_WAVES = 10;
const TANK_PLAYER_HP = 320;
const TANK_PLAYER_DAMAGE = 52;
const TANK_TOTAL_WAVES = 10;

const HELICOPTER_ENEMY_STATS = {
  common: { hp: 200, shotDamage: 100, cooldown: 1250, radius: 28, colorScale: 1 },
  elite: { hp: 400, shotDamage: 150, cooldown: 950, radius: 34, colorScale: 1.16 },
  boss: { hp: 1000, shotDamage: 200, cooldown: 720, radius: 46, colorScale: 1.36 },
} as const;

const TANK_ENEMY_STATS = {
  common: { hp: 120, shotDamage: 18, cooldown: 1400, radius: 28, colorScale: 1, speed: 0.62, range: 210 },
  elite: { hp: 280, shotDamage: 30, cooldown: 1100, radius: 36, colorScale: 1.2, speed: 0.68, range: 245 },
  boss: { hp: 720, shotDamage: 46, cooldown: 880, radius: 50, colorScale: 1.48, speed: 0.52, range: 280 },
} as const;

const TANK_SPRITES: Record<TankSpriteKind, TankSpriteConfig> = {
  player: {
    body: '/assets/rota4/colonys/genesis/aether_tank/1tank_player_body.webp',
    turret: '/assets/rota4/colonys/genesis/aether_tank/1tank_player_turret.webp',
    bodyWidth: 88,
    bodyHeight: 39,
    turretWidth: 94,
    turretHeight: 33,
    turretPivotX: 33,
    turretPivotY: 16.5,
    turretAngleOffset: 0,
    barrelLength: 52,
  },
  common: {
    body: '/assets/rota4/colonys/enemy_tank/tank_enemy_comum_body.webp',
    turret: '/assets/rota4/colonys/enemy_tank/tank_enemy_comum_turret.webp',
    bodyWidth: 90,
    bodyHeight: 40,
    turretWidth: 98,
    turretHeight: 32,
    turretPivotX: 56,
    turretPivotY: 16,
    turretAngleOffset: Math.PI,
    barrelLength: 52,
  },
  elite: {
    body: '/assets/rota4/colonys/enemy_tank/tank_enemy_elite_body.webp',
    turret: '/assets/rota4/colonys/enemy_tank/tank_enemy_elite_turret.webp',
    bodyWidth: 102,
    bodyHeight: 43,
    turretWidth: 116,
    turretHeight: 38,
    turretPivotX: 66,
    turretPivotY: 19,
    turretAngleOffset: Math.PI,
    barrelLength: 60,
  },
  boss: {
    body: '/assets/rota4/colonys/enemy_tank/tank_enemy_boss_body.webp',
    turret: '/assets/rota4/colonys/enemy_tank/tank_enemy_boss_turret.webp',
    bodyWidth: 118,
    bodyHeight: 51,
    turretWidth: 130,
    turretHeight: 45,
    turretPivotX: 73,
    turretPivotY: 22.5,
    turretAngleOffset: Math.PI,
    barrelLength: 72,
  },
};

const SURFACE_SFX = {
  playerShot: '/assets/rota4/SFX_new_land/helicopters_tanks/tank_shoot_player.ogg',
  enemyCommonShot: '/assets/rota4/SFX_new_land/helicopters_tanks/tank_enemy_comum_shoot.ogg',
  enemyEliteShot: '/assets/rota4/SFX_new_land/helicopters_tanks/tank_enemy_elite_shoot.ogg',
  enemyBossShot: '/assets/rota4/SFX_new_land/helicopters_tanks/tank_boss_shooting.ogg',
  tankRunning: '/assets/rota4/SFX_new_land/helicopters_tanks/tank_player_running.ogg',
  tankStopping: '/assets/rota4/SFX_new_land/helicopters_tanks/tank_player_stoping.ogg',
  commonExplosionA: '/assets/rota4/SFX_new_land/enemy_explosion_cap_4.ogg',
  commonExplosionB: '/assets/rota4/SFX_new_land/enemy_explosion_cap4_2.ogg',
  eliteExplosion: '/assets/rota4/SFX_new_land/explosion_elite_cap4.ogg',
};

const AAA_PALETTES = {
  common: ['#67e8f9', '#22d3ee', '#e0f2fe', '#60a5fa', '#bae6fd'],
  elite: ['#facc15', '#f97316', '#fff7ed', '#fb7185', '#fde68a'],
  boss: ['#c084fc', '#a855f7', '#f0abfc', '#ffffff', '#fb7185', '#e879f9'],
  fire: ['#fb7185', '#fb923c', '#facc15', '#ffffff', '#fcd34d'],
  laser: ['#22d3ee', '#e879f9', '#ffffff', '#f0abfc', '#a5f3fc'],
  spark: ['#ffffff', '#fef9c3', '#fde68a'],
} as const;

const SITE_THEME: Record<NewEarthSurfaceBattleSiteId, {
  title: Record<'pt' | 'en', string>;
  subtitle: Record<'pt' | 'en', string>;
  palette: {
    ground: string;
    grid: string;
    player: string;
    playerDark: string;
    enemy: string;
    enemyDark: string;
    accent: string;
  };
}> = {
  'ruinas-europeias': {
    title: { pt: 'Ruínas Européias', en: 'European Ruins' },
    subtitle: { pt: 'Genesis - avanço terrestre', en: 'Genesis - ground assault' },
    palette: {
      ground: '#26251f',
      grid: 'rgba(244, 228, 181, 0.12)',
      player: '#34d399',
      playerDark: '#047857',
      enemy: '#f97316',
      enemyDark: '#7c2d12',
      accent: '#facc15',
    },
  },
  'zona-glacial': {
    title: { pt: 'Zona Glacial', en: 'Glacial Zone' },
    subtitle: { pt: 'Elysium - superioridade aérea', en: 'Elysium - aerial superiority' },
    palette: {
      ground: '#122232',
      grid: 'rgba(186, 230, 253, 0.16)',
      player: '#38bdf8',
      playerDark: '#075985',
      enemy: '#f43f5e',
      enemyDark: '#881337',
      accent: '#e0f2fe',
    },
  },
  'continente-esquecido': {
    title: { pt: 'Continente Esquecido', en: 'Forgotten Continent' },
    subtitle: { pt: 'Elysium - contenção aérea', en: 'Elysium - aerial containment' },
    palette: {
      ground: '#1f2a1f',
      grid: 'rgba(187, 247, 208, 0.13)',
      player: '#a3e635',
      playerDark: '#3f6212',
      enemy: '#fb7185',
      enemyDark: '#881337',
      accent: '#fde68a',
    },
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

const getHelicopterAltitudeBob = (unit: Unit, now: number, isPlayer = false) => {
  const phase = unit.id * 1.618 + (isPlayer ? 0.7 : 0);
  const amplitude = isPlayer ? 3.2 : unit.kind === 'boss' ? 2.4 : unit.kind === 'elite' ? 3 : 3.5;
  return Math.sin(now / 1120 + phase) * amplitude + Math.sin(now / 1780 + phase * 0.7) * 0.9;
};

const colorWithAlpha = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const value = Number.parseInt(hex.length === 3 ? hex.split('').map(char => char + char).join('') : hex, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
  if (!rgbaMatch) return color;
  const [r, g, b] = rgbaMatch[1].split(',').map(part => part.trim());
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const playSurfaceSfx = (src: string, volume = 0.55) => {
  if (typeof Audio === 'undefined') return;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => undefined);
};

const getHelicopterWaveKind = (waveIndex: number): NonNullable<Unit['kind']> => {
  if (waveIndex >= 9) return 'boss';
  if (waveIndex >= 8) return 'elite';
  return 'common';
};

const getTankWaveKind = (waveIndex: number): NonNullable<Unit['kind']> => {
  if (waveIndex >= 9) return 'boss';
  if (waveIndex >= 8) return 'elite';
  return 'common';
};

const drawTank = (
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  color: string,
  dark: string,
  isPlayer: boolean
) => {
  const kind = unit.kind || 'common';
  const bodyScale = kind === 'boss' ? 1.38 : kind === 'elite' ? 1.16 : 1;
  const trackColor = isPlayer ? '#064e3b' : kind === 'boss' ? '#3b0764' : kind === 'elite' ? '#7c2d12' : dark;
  const turretColor = isPlayer ? color : kind === 'boss' ? '#c084fc' : kind === 'elite' ? '#facc15' : color;
  const barrelColor = isPlayer ? '#dcfce7' : kind === 'boss' ? '#f5d0fe' : kind === 'elite' ? '#fff7ed' : '#fee2e2';

  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(unit.angle);
  ctx.scale(bodyScale, bodyScale);

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(-24, -19, 48, 38);
  ctx.fillStyle = trackColor;
  ctx.fillRect(-22, -18, 44, 10);
  ctx.fillRect(-22, 8, 44, 10);
  ctx.fillStyle = color;
  ctx.fillRect(-17, -15, 34, 30);
  ctx.strokeStyle = colorWithAlpha('#ffffff', isPlayer ? 0.36 : kind === 'common' ? 0.18 : 0.32);
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-17, -15, 34, 30);

  ctx.fillStyle = turretColor;
  ctx.beginPath();
  ctx.roundRect(-10, -10, 22, 20, 6);
  ctx.fill();
  ctx.fillStyle = barrelColor;
  ctx.beginPath();
  ctx.roundRect(5, -3.5, kind === 'boss' ? 38 : kind === 'elite' ? 34 : 29, 7, 3);
  ctx.fill();

  if (kind !== 'common' && !isPlayer) {
    ctx.strokeStyle = kind === 'boss' ? 'rgba(216,180,254,0.86)' : 'rgba(253,230,138,0.82)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, kind === 'boss' ? 20 : 17, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
};

const drawHelicopter = (
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  color: string,
  dark: string,
  isPlayer: boolean,
  spin: number
) => {
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(unit.angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.fillRect(-8, -7, 22, 14);
  ctx.fillStyle = color;
  ctx.fillRect(-35, -4, 19, 8);
  ctx.fillStyle = isPlayer ? '#e0f2fe' : '#ffe4e6';
  ctx.fillRect(15, -3, 20, 6);
  ctx.rotate(spin);
  ctx.strokeStyle = 'rgba(255,255,255,0.72)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-38, 0);
  ctx.lineTo(38, 0);
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 38);
  ctx.stroke();
  ctx.restore();
};

export default function NewEarthSurfaceBattle({
  language,
  siteId,
  battleKind,
  colonyName,
  defenseBattleLevel,
  background,
  helicopterStats,
  tankStats,
  onClose,
  onVictory,
  onDefeat,
}: NewEarthSurfaceBattleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2 });
  const shotRequestedRef = useRef(false);
  const endedRef = useRef(false);
  const onVictoryRef = useRef(onVictory);
  const onDefeatRef = useRef(onDefeat);
  const [result, setResult] = useState<'victory' | 'defeat' | ''>('');
  const [hud, setHud] = useState({ hp: 100, enemies: 0 });
  const theme = SITE_THEME[siteId];
  const tankSpeedBonus = tankStats?.speedBonus || 0;
  const tankShotDamageBonus = tankStats?.shotDamageBonus || 0;
  const tankShotSpeedBonus = tankStats?.shotSpeedBonus || 0;
  const tankArmorReduction = tankStats?.armorReduction || 0;
  const enemyCount = battleKind === 'helicopter'
    ? HELICOPTER_TOTAL_WAVES
    : TANK_TOTAL_WAVES;


  useEffect(() => {
    if (battleKind === 'helicopter') return;
    const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (movementKeys.has(key)) event.preventDefault();
      keysRef.current[key] = true;
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (movementKeys.has(key)) event.preventDefault();
      keysRef.current[key] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [battleKind]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let nextId = 1;
    let helicopterWaveIndex = 0;
    let tankWaveIndex = 0;
    let pendingResult: 'victory' | 'defeat' | '' = '';
    let pendingResultAt = 0;
    const tankSpriteImages = Object.entries(TANK_SPRITES).reduce((images, [kind, sprite]) => {
      images[kind as TankSpriteKind] = {
        body: new Image(),
        turret: new Image(),
      };
      images[kind as TankSpriteKind].body.src = sprite.body;
      images[kind as TankSpriteKind].turret.src = sprite.turret;
      return images;
    }, {} as Record<TankSpriteKind, { body: HTMLImageElement; turret: HTMLImageElement }>);
    const tankBackgroundImage = new Image();
    let isTankBackgroundLoaded = false;
    if (background) {
      tankBackgroundImage.onload = () => {
        isTankBackgroundLoaded = true;
      };
      tankBackgroundImage.src = background;
    }
    const player: Unit = {
      id: 0,
      x: WIDTH / 2,
      y: battleKind === 'helicopter' ? HEIGHT - 96 : HEIGHT / 2 + 120,
      angle: -Math.PI / 2,
      turretAngle: -Math.PI / 2,
      vx: 0,
      vy: 0,
      recoil: 0,
      speedNow: 0,
      lastTrack: 0,
      hitFlash: 0,
      hp: battleKind === 'helicopter' ? HELICOPTER_PLAYER_HP : TANK_PLAYER_HP,
      maxHp: battleKind === 'helicopter' ? HELICOPTER_PLAYER_HP : TANK_PLAYER_HP,
      cooldown: 0,
      radius: battleKind === 'tank' ? 24 : 22,
    };
    const createHelicopterEnemy = (waveIndex: number): Unit => {
      const kind = getHelicopterWaveKind(waveIndex);
      const stats = HELICOPTER_ENEMY_STATS[kind];
      return {
        id: waveIndex + 1,
        kind,
        x: WIDTH / 2,
        y: kind === 'boss' ? 92 : 76,
        angle: Math.PI / 2,
        hp: stats.hp,
        maxHp: stats.hp,
        cooldown: 650,
        radius: stats.radius,
      };
    };
    const createTankEnemy = (waveIndex: number): Unit => {
      const kind = getTankWaveKind(waveIndex);
      const stats = TANK_ENEMY_STATS[kind];
      const side = waveIndex % 4;
      const entryPoints = [
        { x: 118 + rand(-18, 18), y: 86 + rand(-18, 18) },
        { x: WIDTH - 118 + rand(-18, 18), y: 92 + rand(-18, 18) },
        { x: 142 + rand(-24, 24), y: HEIGHT - 118 + rand(-18, 18) },
        { x: WIDTH - 142 + rand(-24, 24), y: HEIGHT - 118 + rand(-18, 18) },
      ];
      const point = kind === 'boss' ? { x: WIDTH / 2, y: 92 } : entryPoints[side];
      return {
        id: waveIndex + 1,
        kind,
        x: point.x,
        y: point.y,
        angle: Math.PI / 2,
        turretAngle: Math.PI / 2,
        vx: 0,
        vy: 0,
        recoil: 0,
        speedNow: 0,
        lastTrack: 0,
        hitFlash: 0,
        hp: stats.hp + Math.max(0, defenseBattleLevel - 1) * (kind === 'boss' ? 18 : kind === 'elite' ? 10 : 4),
        maxHp: stats.hp + Math.max(0, defenseBattleLevel - 1) * (kind === 'boss' ? 18 : kind === 'elite' ? 10 : 4),
        cooldown: 1000 + Math.random() * 400,
        radius: stats.radius,
      };
    };
    const enemies: Unit[] = battleKind === 'helicopter'
      ? [createHelicopterEnemy(0)]
      : [createTankEnemy(0)];
    const shots: Shot[] = [];
    const particles: EffectParticle[] = [];
    const shockwaves: Shockwave[] = [];
    const glows: Glow[] = [];
    const streaks: Streak[] = [];
    const smokeRings: SmokeRing[] = [];
    const flashes: Flash[] = [];
    const shells: ShellCasing[] = [];
    const muzzleFlashes: MuzzleFlash[] = [];
    const destroyedTanks: DestroyedTank[] = [];
    const tankBossDrops: TankBossDrop[] = [];
    let screenShake = 0;
    const tankRunningAudio = typeof Audio !== 'undefined' ? new Audio(SURFACE_SFX.tankRunning) : null;
    if (tankRunningAudio) {
      tankRunningAudio.loop = true;
      tankRunningAudio.volume = 0.26;
    }
    let tankWasMoving = false;

    const setTankMovementSfx = (moving: boolean) => {
      if (battleKind !== 'tank') return;
      if (moving === tankWasMoving) return;
      tankWasMoving = moving;
      if (moving) {
        if (!tankRunningAudio) return;
        tankRunningAudio.currentTime = 0;
        tankRunningAudio.play().catch(() => undefined);
        return;
      }
      if (tankRunningAudio) {
        tankRunningAudio.pause();
        tankRunningAudio.currentTime = 0;
      }
      playSurfaceSfx(SURFACE_SFX.tankStopping, 0.44);
    };

    const rotateToward = (angle: number, target: number, amount: number) => {
      let diff = target - angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return angle + diff * amount;
    };

    const getTankScale = (unit: Unit, isPlayer = false) => {
      if (isPlayer) return 1;
      return TANK_ENEMY_STATS[unit.kind || 'common'].colorScale;
    };

    const barrelTip = (unit: Unit, isPlayer = false) => {
      const kind: TankSpriteKind = isPlayer ? 'player' : unit.kind || 'common';
      const sprite = TANK_SPRITES[kind];
      const scale = getTankScale(unit, isPlayer);
      const angle = unit.turretAngle ?? unit.angle;
      const recoil = unit.recoil || 0;
      return {
        x: unit.x + Math.cos(angle) * (sprite.barrelLength * scale - recoil),
        y: unit.y + Math.sin(angle) * (sprite.barrelLength * scale - recoil),
      };
    };

    const pushTankParticle = (particle: EffectParticle) => {
      if (particles.length >= 96) particles.splice(0, 18);
      particles.push(particle);
    };

    const spawnTankDust = (x: number, y: number, vxBase: number, vyBase: number, scale = 1) => {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.08, 0.52) * scale;
      pushTankParticle({
        x: x + rand(-6, 6) * scale,
        y: y + rand(-4, 4) * scale,
        vx: vxBase * 0.18 + Math.cos(angle) * speed,
        vy: vyBase * 0.18 + Math.sin(angle) * speed,
        life: rand(0.28, 0.62),
        maxLife: 0.62,
        size: rand(1.8, 4.6) * scale,
        color: `rgba(${Math.round(rand(118, 150))}, ${Math.round(rand(100, 126))}, ${Math.round(rand(78, 98))}, 0.62)`,
        drag: 0.91,
        growth: 0.012,
        type: 'impact',
      });
    };

    const addTankTrackDust = (unit: Unit) => {
      const back = -24;
      const x = unit.x + Math.cos(unit.angle) * back + rand(-12, 12);
      const y = unit.y + Math.sin(unit.angle) * back + rand(-12, 12);
      spawnTankDust(x, y, -(unit.vx || 0) * 0.2, -(unit.vy || 0) * 0.2, (unit.kind === 'boss' ? 1.1 : 0.8));
    };

    const fireTankMuzzle = (unit: Unit, isPlayer = false) => {
      const tip = barrelTip(unit, isPlayer);
      const scale = getTankScale(unit, isPlayer);
      muzzleFlashes.push({ x: tip.x, y: tip.y, angle: unit.turretAngle ?? unit.angle, life: 0.12, maxLife: 0.12, scale });
      addBurst(tip.x, tip.y, ['#fff8e8', '#fde68a', '#f97316'], isPlayer ? 4 : 5, 4 * scale, 0.6, unit.turretAngle ?? unit.angle);
      addSmoke(tip.x, tip.y, isPlayer ? 1 : 2, 0.45 * scale);
    };

    const ejectTankCasing = (unit: Unit) => {
      const angle = unit.turretAngle ?? unit.angle;
      const perp = angle - Math.PI / 2;
      shells.push({
        x: unit.x + Math.cos(angle) * 4 + Math.cos(perp) * 10,
        y: unit.y + Math.sin(angle) * 4 + Math.sin(perp) * 10,
        vx: Math.cos(perp) * rand(2.5, 5.5) + rand(-0.6, 0.6),
        vy: Math.sin(perp) * rand(2.5, 5.5) + rand(-0.6, 0.6),
        rotation: rand(0, Math.PI * 2),
        spin: rand(-0.4, 0.4),
        life: 1,
      });
      if (shells.length > 80) shells.shift();
    };

    const addGlow = (x: number, y: number, maxRadius: number, color1: string, color2 = 'rgba(255,80,40,0)', life = 0.55) => {
      glows.push({ x, y, radius: 0, maxRadius, life, maxLife: life, color1, color2 });
    };

    const addShockwave = (x: number, y: number, maxRadius: number, color: string, width = 4, decay = 0.05, radius = 3) => {
      shockwaves.push({ x, y, radius, maxRadius, life: 1, decay, color, width });
    };

    const addFlash = (color: string, life = 0.16, intensity = 0.85) => {
      flashes.push({ color, life, maxLife: life, intensity: clamp(intensity, 0, 1) });
    };

    const addStreak = (x: number, y: number, angle: number, speed: number, color: string, length = rand(18, 55), width = rand(1, 2.5)) => {
      streaks.push({
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

    const addSmokeRing = (x: number, y: number, scale = 1) => {
      const life = rand(1, 1.9);
      smokeRings.push({
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

    const addBurst = (x: number, y: number, palette: readonly string[], count: number, power: number, scale = 1, coneAngle?: number) => {
      for (let i = 0; i < Math.round(count); i++) {
        const spread = coneAngle === undefined ? Math.PI * 2 : 1.42;
        const angle = coneAngle === undefined ? rand(0, Math.PI * 2) : coneAngle + rand(-spread, spread);
        const speed = rand(power * 0.3, power) * scale;
        particles.push({
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
          type: 'spark',
        });
      }
    };

    const addSmoke = (x: number, y: number, count: number, scale = 1) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + rand(-22, 22) * scale,
          y: y + rand(-18, 18) * scale,
          vx: rand(-2.5, 2.5) * scale,
          vy: rand(-3.2, 0.8) * scale,
          life: rand(0.8, 1.8),
          maxLife: 1.8,
          size: rand(12, 34) * scale,
          color: 'rgba(90,95,105,0.42)',
          drag: 0.975,
          growth: rand(0.12, 0.36),
          type: 'smoke',
        });
        addSmokeRing(x + rand(-12, 12) * scale, y + rand(-8, 8) * scale, scale);
      }
    };

    const addDebris = (x: number, y: number, scale = 1, palette: readonly string[] = ['#94a3b8', '#cbd5e1', '#64748b', '#f97316']) => {
      const life = rand(1.2, 2.8);
      particles.push({
        x,
        y,
        vx: rand(-13, 13) * scale,
        vy: rand(-17, -3) * scale,
        life,
        maxLife: life,
        size: rand(2, 7) * scale,
        color: pick(palette),
        drag: 0.985,
        rotation: rand(0, Math.PI * 2),
        spin: rand(-0.32, 0.32),
        type: 'debris',
      });
    };

    const spawnProjectileImpact = (x: number, y: number, color: string, scale = 1, incomingAngle = -Math.PI / 2) => {
      if (battleKind === 'tank') {
        addShockwave(x, y, 36 * scale, 'rgba(240,236,228,0.62)', 2.2 * scale, 0.09, 4);
        addBurst(x, y, ['#fff8e8', '#fde68a', '#f97316'], 6 * scale, 5 * scale, 0.7, incomingAngle + Math.PI);
        addSmoke(x, y, 2, 0.45 * scale);
        screenShake = Math.max(screenShake, scale > 1.25 ? 8 : scale > 1.05 ? 5 : 3);
        return;
      }
      addGlow(x, y, 76 * scale, colorWithAlpha(color, 0.72), 'rgba(255,90,40,0)', 0.32);
      addShockwave(x, y, 42 * scale, colorWithAlpha(color, 0.72), 3.2 * scale, 0.07);
      addBurst(x, y, [color, '#ffffff', '#facc15', '#fb923c'], 18 * scale, 7, scale, incomingAngle + Math.PI);
      for (let i = 0; i < Math.round(9 * scale); i++) {
        addStreak(x, y, incomingAngle + Math.PI + rand(-0.9, 0.9), rand(5, 15) * scale, pick(AAA_PALETTES.spark), rand(18, 52) * scale, rand(0.8, 2) * scale);
      }
      screenShake = Math.max(screenShake, 3.5 * scale);
    };

    const spawnEnemyExplosion = (enemy: Unit) => {
      const explosionType = enemy.kind || 'common';
      const scale = explosionType === 'boss' ? 2.15 : explosionType === 'elite' ? 1.45 : 1.05;
      const palette = explosionType === 'boss' ? AAA_PALETTES.boss : explosionType === 'elite' ? AAA_PALETTES.elite : AAA_PALETTES.fire;
      screenShake = Math.max(screenShake, explosionType === 'boss' ? 18 : explosionType === 'elite' ? 11 : 6);
      addFlash(explosionType === 'boss' ? 'rgba(220,180,255,0.22)' : explosionType === 'elite' ? 'rgba(255,220,80,0.18)' : 'rgba(255,120,40,0.13)', 0.15, 0.72);
      window.setTimeout(() => addFlash('rgba(255,120,40,0.10)', 0.18, 0.48), 45);
      addBurst(enemy.x, enemy.y, palette, explosionType === 'boss' ? 132 : explosionType === 'elite' ? 84 : 54, explosionType === 'boss' ? 15 : explosionType === 'elite' ? 11 : 8, scale);
      const flameCount = explosionType === 'boss' ? 50 : explosionType === 'elite' ? 32 : 20;
      for (let i = 0; i < flameCount; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(1.8, explosionType === 'boss' ? 8.8 : 6.6) * scale;
        particles.push({
          x: enemy.x + rand(-24, 24) * scale,
          y: enemy.y + rand(-18, 18) * scale,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - rand(0.5, 2.6) * scale,
          life: rand(0.34, 0.92),
          maxLife: 0.92,
          size: rand(3.5, 12) * scale,
          color: pick(palette),
          drag: rand(0.92, 0.97),
          growth: rand(-0.02, 0.05),
          rotation: rand(0, Math.PI),
          spin: rand(-0.2, 0.2),
          type: 'spark',
        });
      }
      const streakCount = explosionType === 'boss' ? 42 : explosionType === 'elite' ? 26 : 16;
      for (let i = 0; i < streakCount; i++) {
        addStreak(enemy.x, enemy.y, (i / streakCount) * Math.PI * 2 + rand(-0.18, 0.18), rand(9, 24) * scale, pick(AAA_PALETTES.spark), rand(26, 72) * scale, rand(0.8, 2.6) * scale);
      }
      for (let i = 0; i < (explosionType === 'boss' ? 36 : explosionType === 'elite' ? 22 : 12); i++) {
        addDebris(enemy.x + rand(-32, 32), enemy.y + rand(-24, 24), scale, explosionType === 'boss' ? ['#c084fc', '#64748b', '#94a3b8', '#f0abfc', '#fb923c'] : explosionType === 'elite' ? ['#f97316', '#94a3b8', '#64748b', '#facc15'] : ['#fb923c', '#94a3b8', '#64748b']);
      }
      addSmoke(enemy.x, enemy.y, explosionType === 'boss' ? 42 : explosionType === 'elite' ? 26 : 15, scale);
      if (explosionType === 'boss') {
        for (let i = 0; i < 10; i++) {
          window.setTimeout(() => {
            const ox = rand(-78, 78) * scale;
            const oy = rand(-50, 50) * scale;
            addBurst(enemy.x + ox, enemy.y + oy, AAA_PALETTES.fire, 20, 8.5, scale * 0.72);
            addSmoke(enemy.x + ox, enemy.y + oy, 5, scale * 0.65);
          }, 140 + i * 72);
        }
      } else if (explosionType === 'elite') {
        for (let i = 0; i < 5; i++) {
          window.setTimeout(() => {
            const ox = rand(-38, 38) * scale;
            const oy = rand(-28, 28) * scale;
            addBurst(enemy.x + ox, enemy.y + oy, AAA_PALETTES.fire, 12, 6.5, scale * 0.55);
          }, 120 + i * 70);
        }
      }
      if (battleKind === 'tank') {
        destroyedTanks.push({
          x: enemy.x,
          y: enemy.y,
          angle: enemy.angle + rand(-0.55, 0.55),
          kind: explosionType,
          burn: explosionType === 'boss' ? 1.05 : explosionType === 'elite' ? 0.75 : 0.45,
        });
        if (destroyedTanks.length > 8) destroyedTanks.shift();
      }
      playSurfaceSfx(explosionType === 'boss' ? SURFACE_SFX.eliteExplosion : explosionType === 'elite' ? SURFACE_SFX.eliteExplosion : pick([SURFACE_SFX.commonExplosionA, SURFACE_SFX.commonExplosionB]), explosionType === 'boss' ? 0.9 : 0.74);
    };
    const spawnTankBossDrop = (x: number, y: number) => {
      tankBossDrops.push({ id: nextId++, x: clamp(x, 54, WIDTH - 54), y: clamp(y, 54, HEIGHT - 54), phase: rand(0, Math.PI * 2) });
      addGlow(x, y, 88, 'rgba(240,171,252,0.55)', 'rgba(168,85,247,0)', 0.8);
      addShockwave(x, y, 92, 'rgba(240,171,252,0.68)', 3, 0.04, 6);
    };

    const addShot = (x: number, y: number, angle: number, from: Shot['from'], damage: number, speed: number, visualType: Shot['visualType'] = 'common') => {
      const offset = battleKind === 'tank' ? 40 : 28;
      shots.push({
        id: nextId++,
        x: x + Math.cos(angle) * offset,
        y: y + Math.sin(angle) * offset,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        from,
        visualType,
        damage,
        life: 1200,
      });
    };

    const drawTankUnit = (unit: Unit, isPlayer: boolean) => {
      const kind: TankSpriteKind = isPlayer ? 'player' : unit.kind || 'common';
      const sprite = TANK_SPRITES[kind];
      const images = tankSpriteImages[kind];
      const bodyReady = images.body.complete && images.body.naturalWidth > 0;
      const turretReady = images.turret.complete && images.turret.naturalWidth > 0;
      const scale = getTankScale(unit, isPlayer);
      if (!bodyReady || !turretReady) {
        drawTank(ctx, unit, isPlayer ? theme.palette.player : theme.palette.enemy, isPlayer ? theme.palette.playerDark : theme.palette.enemyDark, isPlayer);
        return;
      }

      ctx.save();
      ctx.translate(unit.x, unit.y);
      ctx.rotate(unit.angle);
      ctx.scale(scale, scale);
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-sprite.bodyWidth * 0.48 + 4, -sprite.bodyHeight * 0.34 + 7, sprite.bodyWidth * 0.96, sprite.bodyHeight * 0.62);
      ctx.globalAlpha = 1;
      ctx.drawImage(images.body, -sprite.bodyWidth / 2, -sprite.bodyHeight / 2, sprite.bodyWidth, sprite.bodyHeight);
      if ((unit.hitFlash || 0) > 0) {
        ctx.globalAlpha = (unit.hitFlash || 0) * 0.32;
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-sprite.bodyWidth / 2, -sprite.bodyHeight / 2, sprite.bodyWidth, sprite.bodyHeight);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(unit.x, unit.y);
      ctx.rotate((unit.turretAngle ?? unit.angle) + sprite.turretAngleOffset);
      ctx.scale(scale, scale);
      ctx.translate(-(unit.recoil || 0), 0);
      ctx.drawImage(images.turret, -sprite.turretPivotX, -sprite.turretPivotY, sprite.turretWidth, sprite.turretHeight);
      ctx.restore();

      if (!isPlayer && kind !== 'common') {
        ctx.save();
        ctx.strokeStyle = kind === 'boss' ? 'rgba(216,180,254,0.72)' : 'rgba(253,230,138,0.68)';
        ctx.lineWidth = kind === 'boss' ? 2.4 : 1.8;
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, kind === 'boss' ? 35 : 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawArena = (now: number) => {
      const palette = theme.palette;
      if (battleKind === 'tank') {
        if (isTankBackgroundLoaded) {
          ctx.drawImage(tankBackgroundImage, 0, 0, WIDTH, HEIGHT);
        } else {
          ctx.fillStyle = palette.ground;
          ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
      } else {
        ctx.fillStyle = palette.ground;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.strokeStyle = palette.grid;
        ctx.lineWidth = 1;
        for (let x = 0; x < WIDTH; x += 48) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, HEIGHT);
          ctx.stroke();
        }
        for (let y = 0; y < HEIGHT; y += 48) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(WIDTH, y);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(0, HEIGHT / 2 - 2, WIDTH, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(0, HEIGHT / 2 - 1, WIDTH, 1);
        ctx.font = '700 12px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.fillText(language === 'pt' ? 'ESPAÇO INIMIGO' : 'ENEMY AIRSPACE', 24, 30);
        ctx.fillText(language === 'pt' ? 'ESPAÇO DE ELYSIUM' : 'ELYSIUM AIRSPACE', 24, HEIGHT - 24);
      }

      if (battleKind === 'tank') {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const ready = player.cooldown <= 0;
        const gap = 10;
        const length = 18;
        const bracket = 12;
        const bracketLeg = 5;
        ctx.save();
        ctx.strokeStyle = ready ? 'rgba(220,200,100,0.92)' : 'rgba(200,90,90,0.8)';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(mx - gap - length, my);
        ctx.lineTo(mx - gap, my);
        ctx.moveTo(mx + gap, my);
        ctx.lineTo(mx + gap + length, my);
        ctx.moveTo(mx, my - gap - length);
        ctx.lineTo(mx, my - gap);
        ctx.moveTo(mx, my + gap);
        ctx.lineTo(mx, my + gap + length);
        ctx.moveTo(mx - bracket, my - bracket + bracketLeg);
        ctx.lineTo(mx - bracket, my - bracket);
        ctx.lineTo(mx - bracket + bracketLeg, my - bracket);
        ctx.moveTo(mx + bracket - bracketLeg, my - bracket);
        ctx.lineTo(mx + bracket, my - bracket);
        ctx.lineTo(mx + bracket, my - bracket + bracketLeg);
        ctx.moveTo(mx + bracket, my + bracket - bracketLeg);
        ctx.lineTo(mx + bracket, my + bracket);
        ctx.lineTo(mx + bracket - bracketLeg, my + bracket);
        ctx.moveTo(mx - bracket + bracketLeg, my + bracket);
        ctx.lineTo(mx - bracket, my + bracket);
        ctx.lineTo(mx - bracket, my + bracket - bracketLeg);
        ctx.stroke();
        ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 12 + Math.sin(now / 110) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const drawDestroyedTanks = () => {
      destroyedTanks.forEach(tank => {
        const scale = tank.kind === 'boss' ? 1.42 : tank.kind === 'elite' ? 1.18 : 1;
        ctx.save();
        ctx.translate(tank.x, tank.y);
        ctx.rotate(tank.angle);
        ctx.scale(scale, scale);
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = '#0e0c0a';
        ctx.beginPath();
        ctx.roundRect(-22, -16, 44, 32, 3);
        ctx.fill();
        if (tank.burn > 0.2) {
          ctx.globalAlpha = Math.min(0.7, tank.burn * 0.35);
          ctx.fillStyle = `rgba(220,90,20,${Math.min(0.6, tank.burn * 0.3)})`;
          ctx.fillRect(-10, -8, 22, 16);
        }
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#2a2420';
        ctx.fillRect(-18, -12, 15, 10);
        ctx.fillRect(6, -10, 12, 8);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#1a1614';
        ctx.beginPath();
        ctx.roundRect(4, 8, 18, 12, 3);
        ctx.fill();
        ctx.restore();
        tank.burn *= 0.992;
      });
    };

    const drawShells = (localDtScale: number) => {
      shells.forEach(shell => {
        shell.x += shell.vx * localDtScale;
        shell.y += shell.vy * localDtScale;
        shell.vx *= 0.93;
        shell.vy *= 0.93;
        shell.rotation += shell.spin * localDtScale;
        shell.life -= 0.009 * localDtScale;
        ctx.save();
        ctx.translate(shell.x, shell.y);
        ctx.rotate(shell.rotation);
        ctx.globalAlpha = Math.max(0, shell.life);
        ctx.fillStyle = '#c8952a';
        ctx.fillRect(-5, -1.7, 11, 3.4);
        ctx.fillStyle = '#6a3e10';
        ctx.fillRect(4.5, -1.7, 2, 3.4);
        ctx.restore();
      });
      for (let i = shells.length - 1; i >= 0; i--) if (shells[i].life <= 0) shells.splice(i, 1);
    };

    const drawMuzzleFlashes = (localDtScale: number) => {
      muzzleFlashes.forEach(flash => {
        const alpha = Math.max(0, flash.life / flash.maxLife);
        const scale = flash.scale || 1;
        ctx.save();
        ctx.translate(flash.x, flash.y);
        ctx.rotate(flash.angle);
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(44 * scale, -10 * scale);
        ctx.lineTo(62 * scale, 0);
        ctx.lineTo(44 * scale, 10 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = alpha * 0.95;
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30 * scale, -6 * scale);
        ctx.lineTo(44 * scale, 0);
        ctx.lineTo(30 * scale, 6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(-7 * scale, -7 * scale, 14 * scale, 14 * scale);
        ctx.restore();
        flash.life -= 0.028 * localDtScale;
      });
      for (let i = muzzleFlashes.length - 1; i >= 0; i--) if (muzzleFlashes[i].life <= 0) muzzleFlashes.splice(i, 1);
    };

    const loop = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const dtScale = dt / 16.67;
      const keys = keysRef.current;
      let mx = 0;
      let my = 0;
      if (keys.a || keys.arrowleft) mx -= 1;
      if (keys.d || keys.arrowright) mx += 1;
      if (keys.w || keys.arrowup) my -= 1;
      if (keys.s || keys.arrowdown) my += 1;
      const mag = Math.hypot(mx, my) || 1;
      if (battleKind === 'helicopter') {
        const moveSpeed = 3.2 * dtScale;
        player.x += (mx / mag) * moveSpeed;
        player.y += (my / mag) * moveSpeed;
        player.x = clamp(player.x, 32, WIDTH - 32);
        player.y = clamp(player.y, 32, HEIGHT - 32);
        player.angle = -Math.PI / 2;
      } else {
        const accel = 2.4 * (1 + tankSpeedBonus / 100);
        if (mx || my) {
          player.vx = lerp(player.vx || 0, (mx / mag) * accel, 0.18);
          player.vy = lerp(player.vy || 0, (my / mag) * accel, 0.18);
        } else {
          player.vx = (player.vx || 0) * 0.78;
          player.vy = (player.vy || 0) * 0.78;
        }
        const previousPlayerX = player.x;
        const previousPlayerY = player.y;
        player.x = clamp(player.x + (player.vx || 0) * dtScale, 36, WIDTH - 36);
        player.y = clamp(player.y + (player.vy || 0) * dtScale, 36, HEIGHT - 36);
        player.speedNow = Math.hypot(player.x - previousPlayerX, player.y - previousPlayerY);
        setTankMovementSfx(player.speedNow > 0.08);
        if (player.speedNow > 0.1) {
          player.angle = rotateToward(player.angle, Math.atan2(player.vy || 0, player.vx || 0), 0.12);
        }
        player.turretAngle = Math.atan2(mouseRef.current.y - player.y, mouseRef.current.x - player.x);
        player.recoil = (player.recoil || 0) * 0.8;
        if (player.speedNow > 0.05) {
          player.lastTrack = (player.lastTrack || 0) - dtScale;
          if (player.lastTrack <= 0) {
            player.lastTrack = 10;
            addTankTrackDust(player);
          }
          spawnTankDust(
            player.x - Math.cos(player.angle) * 28,
            player.y - Math.sin(player.angle) * 28,
            -(player.vx || 0) * 0.2,
            -(player.vy || 0) * 0.2,
            0.75
          );
        }
      }
      player.cooldown = Math.max(0, player.cooldown - dt);

      if (shotRequestedRef.current && player.cooldown <= 0) {
        if (battleKind === 'helicopter') {
          const activeEnemy = enemies[0];
          if (activeEnemy && Math.hypot(activeEnemy.x - mouseRef.current.x, activeEnemy.y - mouseRef.current.y) <= activeEnemy.radius + 18) {
            activeEnemy.hp -= HELICOPTER_PLAYER_DAMAGE;
            playSurfaceSfx(SURFACE_SFX.playerShot, 0.52);
            spawnProjectileImpact(activeEnemy.x, activeEnemy.y, '#22d3ee', 1.08, -Math.PI / 2);
            shots.push({
              id: nextId++,
              x: activeEnemy.x,
              y: activeEnemy.y,
              vx: 0,
              vy: 0,
              from: 'player',
              damage: 0,
              life: 120,
            });
            player.cooldown = 240;
          }
        } else {
          playSurfaceSfx(SURFACE_SFX.playerShot, 0.46);
          const shotAngle = player.turretAngle ?? player.angle;
          const tip = barrelTip(player, true);
          addShot(tip.x - Math.cos(shotAngle) * 36, tip.y - Math.sin(shotAngle) * 36, shotAngle, 'player', Math.round(TANK_PLAYER_DAMAGE * (1 + tankShotDamageBonus / 100)), 11.2 * (1 + tankShotSpeedBonus / 100), 'common');
          player.recoil = 12;
          fireTankMuzzle(player, true);
          ejectTankCasing(player);
          screenShake = Math.max(screenShake, 4.5);
          addFlash('rgba(255,248,208,0.04)', 0.08, 0.8);
          player.cooldown = 380;
        }
      }
      shotRequestedRef.current = false;

      enemies.forEach((enemy) => {
        const enemyKind = enemy.kind || 'common';
        const enemyStats = battleKind === 'helicopter'
          ? HELICOPTER_ENEMY_STATS[enemyKind]
          : TANK_ENEMY_STATS[enemyKind];
        const distanceToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (battleKind === 'helicopter') {
          const desiredY = (enemyKind === 'boss' ? 96 : enemyKind === 'elite' ? 82 : 70) + Math.sin(now / 850 + enemy.id) * 18;
          enemy.x += Math.sin(now / (enemyKind === 'boss' ? 760 : 520) + enemy.id * 1.7) * enemyStats.colorScale * 2.2 * dtScale;
          enemy.y += (desiredY - enemy.y) * 0.026 * dtScale;
          enemy.x = clamp(enemy.x, 34, WIDTH - 34);
          enemy.y = clamp(enemy.y, 32, ENEMY_HALF_MAX_Y);
          enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.turretAngle = enemy.angle;
        } else {
          const tankStats = TANK_ENEMY_STATS[enemyKind];
          const previousX = enemy.x;
          const previousY = enemy.y;
          const toPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          const advance = distanceToPlayer > tankStats.range
            ? tankStats.speed
            : distanceToPlayer < tankStats.range - 70 ? -0.32 : 0.05;
          const flank = Math.sin(now / (enemyKind === 'boss' ? 800 : 570) + enemy.id * 1.9) * 0.48;
          const targetVx = Math.cos(toPlayer) * advance + Math.cos(toPlayer + Math.PI / 2) * flank;
          const targetVy = Math.sin(toPlayer) * advance + Math.sin(toPlayer + Math.PI / 2) * flank;
          enemy.vx = lerp(enemy.vx || 0, targetVx, 0.14);
          enemy.vy = lerp(enemy.vy || 0, targetVy, 0.14);
          enemy.x = clamp(enemy.x + (enemy.vx || 0) * dtScale, 40, WIDTH - 40);
          enemy.y = clamp(enemy.y + (enemy.vy || 0) * dtScale, 40, HEIGHT - 40);
          enemy.speedNow = Math.hypot(enemy.x - previousX, enemy.y - previousY);
          if (enemy.speedNow > 0.05) {
            enemy.angle = rotateToward(enemy.angle, Math.atan2(enemy.vy || 0, enemy.vx || 0), 0.1);
          }
          enemy.turretAngle = rotateToward(enemy.turretAngle ?? enemy.angle, toPlayer, 0.06);
          enemy.recoil = (enemy.recoil || 0) * 0.8;
          if ((enemy.hitFlash || 0) > 0) enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - 0.06 * dtScale);
          if (enemy.speedNow > 0.04) {
            enemy.lastTrack = (enemy.lastTrack || 0) - dtScale;
            if (enemy.lastTrack <= 0) {
              enemy.lastTrack = enemyKind === 'boss' ? 9 : 12;
              addTankTrackDust(enemy);
            }
            if (Math.random() < 0.4) {
              spawnTankDust(
                enemy.x - Math.cos(enemy.angle) * 30,
                enemy.y - Math.sin(enemy.angle) * 30,
                -(enemy.vx || 0) * 0.2,
                -(enemy.vy || 0) * 0.2,
                enemyKind === 'boss' ? 1.2 : 0.8
              );
            }
          }
        }
        enemy.cooldown -= dt;
        if (enemy.cooldown <= 0) {
          if (battleKind === 'helicopter') {
            playSurfaceSfx(enemyKind === 'boss' ? SURFACE_SFX.enemyBossShot : enemyKind === 'elite' ? SURFACE_SFX.enemyEliteShot : SURFACE_SFX.enemyCommonShot, enemyKind === 'boss' ? 0.64 : 0.5);
            addShot(enemy.x, enemy.y, Math.PI / 2, 'enemy', enemyStats.shotDamage, enemyKind === 'boss' ? 8.8 : 7.6, enemyKind);
            if (enemyKind !== 'common') {
              addShot(enemy.x - 20, enemy.y + 4, Math.PI / 2 + 0.16, 'enemy', enemyStats.shotDamage, 7.2, enemyKind);
              addShot(enemy.x + 20, enemy.y + 4, Math.PI / 2 - 0.16, 'enemy', enemyStats.shotDamage, 7.2, enemyKind);
            }
            enemy.cooldown = enemyStats.cooldown;
          } else {
            playSurfaceSfx(enemyKind === 'boss' ? SURFACE_SFX.enemyBossShot : enemyKind === 'elite' ? SURFACE_SFX.enemyEliteShot : SURFACE_SFX.enemyCommonShot, enemyKind === 'boss' ? 0.52 : 0.42);
            const shotAngle = enemy.turretAngle ?? enemy.angle;
            const tip = barrelTip(enemy, false);
            const shotX = tip.x - Math.cos(shotAngle) * 38;
            const shotY = tip.y - Math.sin(shotAngle) * 38;
            const tankStats = TANK_ENEMY_STATS[enemyKind];
            if (enemyKind === 'elite' || enemyKind === 'boss') {
              const sideAngle = shotAngle + Math.PI / 2;
              const spread = enemyKind === 'boss' ? 12 : 9;
              const speed = enemyKind === 'boss' ? 7.2 : 7;
              addShot(shotX + Math.cos(sideAngle) * spread, shotY + Math.sin(sideAngle) * spread, shotAngle, 'enemy', tankStats.shotDamage, speed, enemyKind);
              addShot(shotX - Math.cos(sideAngle) * spread, shotY - Math.sin(sideAngle) * spread, shotAngle, 'enemy', tankStats.shotDamage, speed, enemyKind);
            } else {
              addShot(shotX, shotY, shotAngle, 'enemy', tankStats.shotDamage, 6.4, enemyKind);
            }
            enemy.recoil = enemyKind === 'boss' ? 15 : 10;
            fireTankMuzzle(enemy, false);
            ejectTankCasing(enemy);
            screenShake = Math.max(screenShake, enemyKind === 'boss' ? 8 : 4);
            enemy.cooldown = tankStats.cooldown + Math.random() * 350;
          }
        }
      });

      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        shot.x += shot.vx * dtScale;
        shot.y += shot.vy * dtScale;
        shot.life -= dt;
        if (shot.life <= 0 || shot.x < -20 || shot.x > WIDTH + 20 || shot.y < -20 || shot.y > HEIGHT + 20) {
          shots.splice(i, 1);
          continue;
        }
        if (shot.damage <= 0) continue;
        if (shot.from === 'player') {
          const target = enemies.find(enemy => Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < enemy.radius);
          if (target) {
            target.hp -= shot.damage;
            target.hitFlash = 1;
            const targetKind = target.kind || 'common';
            spawnProjectileImpact(
              shot.x,
              shot.y,
              targetKind === 'boss' ? '#e879f9' : targetKind === 'elite' ? '#fde68a' : '#22d3ee',
              targetKind === 'boss' ? 1.4 : targetKind === 'elite' ? 1.18 : 0.96,
              Math.atan2(shot.vy, shot.vx)
            );
            shots.splice(i, 1);
          }
        } else if (Math.hypot(player.x - shot.x, player.y - shot.y) < player.radius) {
          player.hp -= battleKind === 'tank' ? shot.damage * Math.max(0.1, 1 - tankArmorReduction / 100) : shot.damage;
          spawnProjectileImpact(shot.x, shot.y, shot.visualType === 'boss' ? '#e879f9' : shot.visualType === 'elite' ? '#fde68a' : '#ef4444', shot.visualType === 'boss' ? 1.55 : shot.visualType === 'elite' ? 1.25 : 1, Math.atan2(shot.vy, shot.vx));
          shots.splice(i, 1);
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
          const defeatedEnemy = enemies[i];
          const defeatedKind = defeatedEnemy.kind || 'common';
          spawnEnemyExplosion(defeatedEnemy);
          enemies.splice(i, 1);
          if (battleKind === 'helicopter') {
            helicopterWaveIndex += 1;
            shots.length = 0;
            if (helicopterWaveIndex < HELICOPTER_TOTAL_WAVES) {
              enemies.push(createHelicopterEnemy(helicopterWaveIndex));
            } else if (!endedRef.current && defeatedKind === 'boss') {
              endedRef.current = true;
              pendingResult = 'victory';
              pendingResultAt = now + 1050;
            }
          } else {
            tankWaveIndex += 1;
            shots.length = 0;
            if (tankWaveIndex < TANK_TOTAL_WAVES) {
              enemies.push(createTankEnemy(tankWaveIndex));
            } else if (!endedRef.current && defeatedKind === 'boss') {
              spawnTankBossDrop(defeatedEnemy.x, defeatedEnemy.y);
            }
          }
        }
      }

      ctx.save();
      if (screenShake > 0.1) {
        ctx.translate(rand(-screenShake, screenShake), rand(-screenShake, screenShake));
        screenShake *= 0.88;
      }

      drawArena(now);
      if (battleKind === 'tank') drawDestroyedTanks();
      const spin = now / 58;
      enemies.forEach(enemy => {
        const enemyKind = enemy.kind || 'common';
        const scale = battleKind === 'helicopter' ? HELICOPTER_ENEMY_STATS[enemyKind].colorScale : 1;
        let enemyVisualY = enemy.y;
        if (battleKind === 'tank') {
          drawTankUnit(enemy, false);
        } else {
          enemyVisualY = enemy.y + getHelicopterAltitudeBob(enemy, now);
          const visualEnemy = { ...enemy, y: enemyVisualY };
          ctx.save();
          ctx.translate(enemy.x, enemyVisualY);
          ctx.scale(scale, scale);
          ctx.translate(-enemy.x, -enemyVisualY);
          drawHelicopter(ctx, visualEnemy, theme.palette.enemy, theme.palette.enemyDark, false, spin);
          ctx.restore();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.58)';
        ctx.fillRect(enemy.x - 32, enemyVisualY - 42, 64, 5);
        ctx.fillStyle = theme.palette.enemy;
        ctx.fillRect(enemy.x - 32, enemyVisualY - 42, 64 * Math.max(0, enemy.hp / enemy.maxHp), 5);
        if (battleKind === 'helicopter' || enemyKind !== 'common') {
          ctx.font = '700 10px monospace';
          ctx.fillStyle = 'rgba(255,255,255,0.72)';
          ctx.textAlign = 'center';
          ctx.fillText(enemyKind.toUpperCase(), enemy.x, enemyVisualY - 48);
          ctx.textAlign = 'left';
        }
      });
      if (battleKind === 'tank') drawTankUnit(player, true);
      else drawHelicopter(ctx, { ...player, y: player.y + getHelicopterAltitudeBob(player, now, true) }, theme.palette.player, theme.palette.playerDark, true, -spin);

      shots.forEach(shot => {
        if (battleKind === 'tank') {
          const angle = Math.atan2(shot.vy, shot.vx);
          const isEnemy = shot.from === 'enemy';
          const length = isEnemy ? 14 : 18;
          shot.life -= 0;
          ctx.save();
          ctx.translate(shot.x, shot.y);
          ctx.rotate(angle);
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = isEnemy ? '#c06020' : '#6080c0';
          ctx.fillRect(-length, -1.5, length, 3);
          ctx.globalAlpha = 1;
          ctx.fillStyle = isEnemy ? '#ffe090' : '#ddeeff';
          ctx.fillRect(-4, -2, length + 6, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(2, -1.5, 5, 3);
          ctx.restore();
          return;
        }
        if (battleKind === 'helicopter' && shot.from === 'player' && shot.damage === 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = theme.palette.accent;
          ctx.lineWidth = 3;
          ctx.globalAlpha = Math.max(0.18, shot.life / 120);
          ctx.beginPath();
          ctx.moveTo(player.x, player.y - 28);
          ctx.lineTo(shot.x, shot.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = theme.palette.accent;
          ctx.beginPath();
          ctx.arc(shot.x, shot.y, 12 * Math.max(0.25, shot.life / 120), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return;
        }

        const angle = Math.atan2(shot.vy, shot.vx);
        const isEnemy = shot.from === 'enemy';
        const isBossShot = shot.visualType === 'boss';
        const isEliteShot = shot.visualType === 'elite';
        const coreColor = isBossShot ? '#e879f9' : isEliteShot ? '#fde68a' : isEnemy ? '#ef4444' : '#22d3ee';
        const glowColor = isBossShot ? 'rgba(168,85,247,0.6)' : isEliteShot ? 'rgba(251,191,36,0.6)' : isEnemy ? 'rgba(239,68,68,0.52)' : 'rgba(34,211,238,0.48)';
        const commonEnemyShotSize = 5.4;
        const size = isBossShot ? commonEnemyShotSize * 2 : isEliteShot ? 6.5 : isEnemy ? commonEnemyShotSize : 4.8;
        const pulse = 1 + Math.sin(now / 70 + shot.id) * 0.12;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(shot.x, shot.y);
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

        ctx.strokeStyle = colorWithAlpha('#ffffff', isBossShot ? 0.55 : 0.35);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 2.8 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      ctx.fillStyle = 'rgba(0,0,0,0.58)';
      ctx.fillRect(player.x - 26, player.y + 34, 52, 5);
      ctx.fillStyle = theme.palette.player;
      ctx.fillRect(player.x - 26, player.y + 34, 52 * Math.max(0, player.hp / player.maxHp), 5);

      if (battleKind === 'tank') {
        drawShells(dtScale);
        drawMuzzleFlashes(dtScale);
      }

      glows.forEach(glow => {
        glow.radius = Math.min(glow.maxRadius, glow.radius + glow.maxRadius * 0.13);
        glow.life -= 0.026 * dtScale;
        const alpha = Math.max(0, glow.life / glow.maxLife);
        const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.radius);
        gradient.addColorStop(0, colorWithAlpha(glow.color1, 0.55 * alpha));
        gradient.addColorStop(0.42, colorWithAlpha(glow.color1, 0.22 * alpha));
        gradient.addColorStop(1, glow.color2);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, glow.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      for (let i = glows.length - 1; i >= 0; i--) if (glows[i].life <= 0) glows.splice(i, 1);

      shockwaves.forEach(wave => {
        const progress = 1 - wave.life;
        const radius = wave.radius + (wave.maxRadius - wave.radius) * progress;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, wave.life);
        ctx.strokeStyle = wave.color;
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = Math.max(1, wave.width * wave.life);
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        wave.life -= wave.decay * dtScale;
      });
      for (let i = shockwaves.length - 1; i >= 0; i--) if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);

      particles.forEach(particle => {
        particle.x += particle.vx * dtScale;
        particle.y += particle.vy * dtScale;
        particle.vx *= particle.drag || 0.95;
        particle.vy = particle.vy * (particle.drag || 0.95) + (particle.type === 'debris' ? 0.035 : particle.type === 'smoke' ? -0.018 : 0);
        particle.size = Math.max(0.1, particle.size + (particle.growth || 0));
        particle.rotation = (particle.rotation || 0) + (particle.spin || 0);
        particle.life -= (particle.type === 'smoke' ? 0.018 : 0.035) * dtScale;
        const alpha = Math.max(0, particle.life / particle.maxLife);
        ctx.save();
        ctx.globalCompositeOperation = particle.type === 'smoke' || particle.type === 'debris' ? 'source-over' : 'lighter';
        ctx.globalAlpha = particle.type === 'smoke' ? alpha * 0.18 : alpha;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        if (particle.rotation && particle.type !== 'smoke') {
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.fillRect(-particle.size * 0.55, -particle.size * 0.22, particle.size * 1.1, particle.size * 0.44);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);

      smokeRings.forEach(ring => {
        ring.x += ring.vx * dtScale;
        ring.y += ring.vy * dtScale;
        ring.radius += ring.grow * 0.06 * dtScale;
        ring.life -= 0.022 * dtScale;
        const alpha = Math.max(0, ring.life / ring.maxLife);
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha * 0.42;
        ctx.strokeStyle = colorWithAlpha(ring.color, 0.28 * alpha);
        ctx.lineWidth = Math.max(1, 7 * alpha);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      for (let i = smokeRings.length - 1; i >= 0; i--) if (smokeRings[i].life <= 0) smokeRings.splice(i, 1);

      streaks.forEach(streak => {
        streak.x += streak.vx * dtScale;
        streak.y += streak.vy * dtScale;
        streak.vx *= streak.drag;
        streak.vy *= streak.drag;
        streak.life -= 0.026 * dtScale;
        const alpha = Math.max(0, streak.life / streak.maxLife);
        const angle = Math.atan2(streak.vy, streak.vx);
        const tailX = streak.x - Math.cos(angle) * streak.length;
        const tailY = streak.y - Math.sin(angle) * streak.length;
        const gradient = ctx.createLinearGradient(streak.x, streak.y, tailX, tailY);
        gradient.addColorStop(0, colorWithAlpha(streak.color, alpha));
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(0.5, streak.width * alpha);
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();
      });
      for (let i = streaks.length - 1; i >= 0; i--) if (streaks[i].life <= 0) streaks.splice(i, 1);

      ctx.restore();

      flashes.forEach(flash => {
        flash.life -= 0.035 * dtScale;
        const alpha = Math.max(0, flash.life / flash.maxLife) * flash.intensity;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = colorWithAlpha(flash.color, alpha);
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
      });
      for (let i = flashes.length - 1; i >= 0; i--) if (flashes[i].life <= 0) flashes.splice(i, 1);

      setHud({
        hp: Math.max(0, Math.ceil(player.hp)),
        enemies: battleKind === 'helicopter'
          ? Math.max(0, HELICOPTER_TOTAL_WAVES - helicopterWaveIndex)
          : Math.max(0, TANK_TOTAL_WAVES - tankWaveIndex),
      });
      if (!endedRef.current && player.hp <= 0) {
        endedRef.current = true;
        spawnEnemyExplosion({
          ...player,
          kind: 'boss',
          radius: 42,
          hp: 0,
          maxHp: player.maxHp,
        });
        pendingResult = 'defeat';
        pendingResultAt = now + 900;
      }
      if (!endedRef.current && enemies.length === 0 && (
        (battleKind === 'helicopter' && helicopterWaveIndex >= HELICOPTER_TOTAL_WAVES)
        || (battleKind === 'tank' && tankWaveIndex >= TANK_TOTAL_WAVES)
      )) {
        endedRef.current = true;
        pendingResult = 'victory';
        pendingResultAt = now + 900;
      }

      if (pendingResult && now >= pendingResultAt) {
        setResult(pendingResult);
        if (pendingResult === 'victory') onVictoryRef.current(battleKind === 'tank' ? { specialDrop: true } : undefined);
        else onDefeatRef.current();
        return;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (tankRunningAudio) {
        tankRunningAudio.pause();
        tankRunningAudio.currentTime = 0;
      }
    };
  }, [background, battleKind, defenseBattleLevel, enemyCount, language, tankArmorReduction, tankShotDamageBonus, tankShotSpeedBonus, tankSpeedBonus, theme]);

  const updateMouse = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  if (battleKind === 'helicopter') {
    return (
      <NewEarthHelicopterBattle
        language={language}
        title={theme.title[language]}
        colonyName={colonyName}
        background={background}
        helicopterStats={helicopterStats}
        onClose={onClose}
        onVictory={onVictory}
        onDefeat={onDefeat}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/88 p-4 backdrop-blur-xl">
      <div className="relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.55)]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-5 py-3">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-cyan-100/70">
              {battleKind === 'tank'
                ? (language === 'pt' ? 'Batalha terrestre' : 'Ground battle')
                : (language === 'pt' ? 'Batalha aérea tática' : 'Tactical air battle')}
            </p>
            <h2 className="font-orbitron text-xl font-black uppercase text-white">{theme.title[language]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-white/10 bg-black/35 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200 md:block">
              {colonyName} / HP {hud.hp} / {language === 'pt' ? 'Alvos' : 'Targets'} {hud.enemies}
            </div>
            <PremiumCanvasButton type="button" tone="steel" onClick={onClose} className="h-10 w-10 rounded-full" contentClassName="text-slate-100">
              <X size={18} />
            </PremiumCanvasButton>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onMouseMove={updateMouse}
            onMouseDown={(event) => {
              event.preventDefault();
              updateMouse(event);
              shotRequestedRef.current = true;
            }}
            className="block h-full max-h-full w-auto max-w-full cursor-crosshair"
          />
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-xs font-semibold text-slate-100">
            <div className="flex items-center gap-2 font-mono uppercase tracking-[0.22em] text-cyan-100/80">
              <Crosshair size={14} />
              {theme.subtitle[language]}
            </div>
            <p className="mt-2 text-slate-300">
              {language === 'pt'
                ? 'Movimento: WASD ou setas. Mira: mouse. Atirar: clique.'
                : 'Move: WASD or arrows. Aim: mouse. Fire: click.'}
            </p>
          </div>
        </div>

        {result && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/72 p-6">
            <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950/92 p-7 text-center shadow-[0_0_50px_rgba(255,255,255,0.12)]">
              <p className={`font-orbitron text-4xl font-black uppercase ${result === 'victory' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {result === 'victory'
                  ? (language === 'pt' ? 'Vitória' : 'Victory')
                  : (language === 'pt' ? 'Derrota' : 'Defeat')}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-300">
                {result === 'victory'
                  ? (language === 'pt' ? 'A operação foi concluída e as rotas da Nova Terra foram atualizadas.' : 'Operation complete and New Earth routes were updated.')
                  : (language === 'pt' ? 'A equipe recuou para reorganizar o ataque.' : 'The team retreated to regroup.')}
              </p>
              <PremiumCanvasButton type="button" tone={result === 'victory' ? 'green' : 'red'} onClick={onClose} className="mt-6 h-12 w-full">
                {language === 'pt' ? 'Continuar' : 'Continue'}
              </PremiumCanvasButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

