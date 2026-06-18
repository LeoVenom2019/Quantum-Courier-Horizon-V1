'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, X } from 'lucide-react';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';

export type NewEarthSurfaceBattleSiteId = 'zona-glacial' | 'ruinas-europeias' | 'continente-esquecido';
export type NewEarthSurfaceBattleKind = 'tank' | 'helicopter';

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
  onClose: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

type Unit = {
  id: number;
  kind?: 'common' | 'elite' | 'boss';
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  radius: number;
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

const WIDTH = 960;
const HEIGHT = 540;
const PLAYER_HALF_MIN_Y = HEIGHT / 2 + 28;
const ENEMY_HALF_MAX_Y = HEIGHT / 2 - 28;
const HELICOPTER_PLAYER_HP = 500;
const HELICOPTER_PLAYER_DAMAGE = 100;
const HELICOPTER_TOTAL_WAVES = 10;

const HELICOPTER_ENEMY_STATS = {
  common: { hp: 200, shotDamage: 100, cooldown: 1250, radius: 28, colorScale: 1 },
  elite: { hp: 400, shotDamage: 150, cooldown: 950, radius: 34, colorScale: 1.16 },
  boss: { hp: 1000, shotDamage: 200, cooldown: 720, radius: 46, colorScale: 1.36 },
} as const;

const SURFACE_SFX = {
  playerShot: '/assets/rota4/battles/player/horizon/shoot_rt4.ogg',
  enemyCommonShot: '/audio/sfx/shoot_enemy.ogg',
  enemyEliteShot: '/audio/sfx/shoot_player.ogg',
  enemyBossShot: '/assets/rota4/battles/player/horizon/apocalipse_laser_impact.ogg',
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

const drawTank = (
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  color: string,
  dark: string,
  isPlayer: boolean
) => {
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(unit.angle);
  ctx.fillStyle = dark;
  ctx.fillRect(-18, -15, 36, 30);
  ctx.fillStyle = color;
  ctx.fillRect(-14, -20, 28, 40);
  ctx.fillStyle = dark;
  ctx.fillRect(-8, -11, 20, 22);
  ctx.fillStyle = isPlayer ? '#dcfce7' : '#fee2e2';
  ctx.fillRect(6, -4, 28, 8);
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
  onClose,
  onVictory,
  onDefeat,
}: NewEarthSurfaceBattleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2 });
  const shotRequestedRef = useRef(false);
  const endedRef = useRef(false);
  const handledIframeResultRef = useRef(false);
  const helicopterIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [result, setResult] = useState<'victory' | 'defeat' | ''>('');
  const [hud, setHud] = useState({ hp: 100, enemies: 0 });
  const theme = SITE_THEME[siteId];
  const enemyCount = battleKind === 'helicopter'
    ? HELICOPTER_TOTAL_WAVES
    : Math.min(12, 5 + Math.max(0, Math.floor(defenseBattleLevel / 2)));

  useEffect(() => {
    if (battleKind !== 'helicopter') return;
    handledIframeResultRef.current = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const detail = event.data as { type?: string; result?: string } | null;
      if (!detail || detail.type !== 'qch-helicopter-battle-result') return;
      if (handledIframeResultRef.current) return;

      if (detail.result === 'victory') {
        handledIframeResultRef.current = true;
        onVictory();
        return;
      }
      if (detail.result === 'defeat') {
        handledIframeResultRef.current = true;
        onDefeat();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [battleKind, onDefeat, onVictory]);

  useEffect(() => {
    if (battleKind !== 'helicopter') return;
    const controlKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', ' ']);
    const postInput = (event: KeyboardEvent, inputEvent: 'keydown' | 'keyup') => {
      const key = event.key.toLowerCase();
      if (!controlKeys.has(key)) return;
      event.preventDefault();
      helicopterIframeRef.current?.contentWindow?.postMessage({
        type: 'qch-helicopter-input',
        event: inputEvent,
        key,
      }, window.location.origin);
    };
    const down = (event: KeyboardEvent) => postInput(event, 'keydown');
    const up = (event: KeyboardEvent) => postInput(event, 'keyup');
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [battleKind]);

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
    let pendingResult: 'victory' | 'defeat' | '' = '';
    let pendingResultAt = 0;
    const player: Unit = {
      id: 0,
      x: WIDTH / 2,
      y: battleKind === 'helicopter' ? HEIGHT - 96 : HEIGHT / 2 + 120,
      angle: -Math.PI / 2,
      hp: battleKind === 'helicopter' ? HELICOPTER_PLAYER_HP : 100,
      maxHp: battleKind === 'helicopter' ? HELICOPTER_PLAYER_HP : 100,
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
    const enemies: Unit[] = battleKind === 'helicopter'
      ? [createHelicopterEnemy(0)]
      : Array.from({ length: enemyCount }, (_, index) => ({
          id: index + 1,
          x: 110 + (index % 5) * 175 + Math.random() * 32,
          y: 80 + Math.floor(index / 5) * 95 + Math.random() * 24,
          angle: Math.PI / 2,
          hp: 42,
          maxHp: 42,
          cooldown: 550 + Math.random() * 700,
          radius: 24,
        }));
    const shots: Shot[] = [];
    const particles: EffectParticle[] = [];
    const shockwaves: Shockwave[] = [];
    const glows: Glow[] = [];
    const streaks: Streak[] = [];
    const smokeRings: SmokeRing[] = [];
    const flashes: Flash[] = [];
    let screenShake = 0;

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
      addGlow(x, y, 76 * scale, colorWithAlpha(color, 0.72), 'rgba(255,90,40,0)', 0.32);
      addShockwave(x, y, 42 * scale, colorWithAlpha(color, 0.72), 3.2 * scale, 0.07);
      addBurst(x, y, [color, '#ffffff', '#facc15', '#fb923c'], 18 * scale, 7, scale, incomingAngle + Math.PI);
      for (let i = 0; i < Math.round(9 * scale); i++) {
        addStreak(x, y, incomingAngle + Math.PI + rand(-0.9, 0.9), rand(5, 15) * scale, pick(AAA_PALETTES.spark), rand(18, 52) * scale, rand(0.8, 2) * scale);
      }
      screenShake = Math.max(screenShake, 3.5 * scale);
    };

    const spawnEnemyExplosion = (enemy: Unit) => {
      const kind = enemy.kind || 'common';
      const explosionType = battleKind === 'helicopter' ? kind : 'common';
      const scale = explosionType === 'boss' ? 2.15 : explosionType === 'elite' ? 1.45 : 1.05;
      const palette = explosionType === 'boss' ? AAA_PALETTES.boss : explosionType === 'elite' ? AAA_PALETTES.elite : AAA_PALETTES.common;
      const glow = explosionType === 'boss' ? 'rgba(200,120,255,0.88)' : explosionType === 'elite' ? 'rgba(255,200,60,0.82)' : 'rgba(80,220,255,0.76)';
      screenShake = Math.max(screenShake, explosionType === 'boss' ? 18 : explosionType === 'elite' ? 11 : 6);
      addFlash(explosionType === 'boss' ? 'rgba(220,180,255,0.28)' : explosionType === 'elite' ? 'rgba(255,220,80,0.22)' : 'rgba(120,220,255,0.14)', 0.16, 0.95);
      addGlow(enemy.x, enemy.y, (explosionType === 'boss' ? 320 : explosionType === 'elite' ? 200 : 130) * scale, glow);
      addShockwave(enemy.x, enemy.y, 55 * scale, 'rgba(255,255,255,0.95)', 3.8 * scale, 0.07);
      addShockwave(enemy.x, enemy.y, 105 * scale, explosionType === 'boss' ? 'rgba(192,132,252,0.80)' : explosionType === 'elite' ? 'rgba(251,191,36,0.80)' : 'rgba(34,211,238,0.78)', 5.5 * scale, 0.044, 4);
      addShockwave(enemy.x, enemy.y, 168 * scale, 'rgba(200,60,40,0.40)', 8.5 * scale, 0.03, 8);
      addBurst(enemy.x, enemy.y, palette, explosionType === 'boss' ? 110 : explosionType === 'elite' ? 72 : 44, explosionType === 'boss' ? 15 : explosionType === 'elite' ? 11 : 8, scale);
      for (let i = 0; i < (explosionType === 'boss' ? 32 : explosionType === 'elite' ? 20 : 12); i++) {
        addStreak(enemy.x, enemy.y, (i / 32) * Math.PI * 2, rand(8, 22) * scale, pick(AAA_PALETTES.spark), rand(30, 80) * scale, rand(1, 3) * scale);
      }
      for (let i = 0; i < (explosionType === 'boss' ? 28 : explosionType === 'elite' ? 16 : 8); i++) {
        addDebris(enemy.x + rand(-28, 28), enemy.y + rand(-22, 22), scale, explosionType === 'boss' ? ['#c084fc', '#64748b', '#94a3b8', '#f0abfc'] : explosionType === 'elite' ? ['#f97316', '#94a3b8', '#64748b', '#facc15'] : ['#67e8f9', '#94a3b8', '#64748b']);
      }
      addSmoke(enemy.x, enemy.y, explosionType === 'boss' ? 30 : explosionType === 'elite' ? 18 : 10, scale);
      if (battleKind === 'helicopter') {
        playSurfaceSfx(explosionType === 'boss' ? SURFACE_SFX.eliteExplosion : explosionType === 'elite' ? SURFACE_SFX.eliteExplosion : pick([SURFACE_SFX.commonExplosionA, SURFACE_SFX.commonExplosionB]), explosionType === 'boss' ? 0.9 : 0.74);
      }
    };

    const addShot = (x: number, y: number, angle: number, from: Shot['from'], damage: number, speed: number, visualType: Shot['visualType'] = 'common') => {
      shots.push({
        id: nextId++,
        x: x + Math.cos(angle) * 28,
        y: y + Math.sin(angle) * 28,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        from,
        visualType,
        damage,
        life: 1200,
      });
    };

    const drawArena = (now: number) => {
      const palette = theme.palette;
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

      if (battleKind === 'tank') {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < 18; i++) {
          const x = (i * 137 + 53) % WIDTH;
          const y = (i * 89 + 41) % HEIGHT;
          ctx.fillRect(x, y, 42 + (i % 3) * 24, 12 + (i % 2) * 18);
        }
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(0, HEIGHT / 2 - 2, WIDTH, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(0, HEIGHT / 2 - 1, WIDTH, 1);
        ctx.font = '700 12px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.fillText(language === 'pt' ? 'ESPAÇO INIMIGO' : 'ENEMY AIRSPACE', 24, 30);
        ctx.fillText(language === 'pt' ? 'ESPAÇO DE ELYSIUM' : 'ELYSIUM AIRSPACE', 24, HEIGHT - 24);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 12 + Math.sin(now / 110) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const loop = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const dtScale = dt / 16.67;
      const keys = keysRef.current;
      const moveSpeed = (battleKind === 'tank' ? 2.1 : 3.2) * dtScale;
      let mx = 0;
      let my = 0;
      if (keys.a || keys.arrowleft) mx -= 1;
      if (keys.d || keys.arrowright) mx += 1;
      if (keys.w || keys.arrowup) my -= 1;
      if (keys.s || keys.arrowdown) my += 1;
      const mag = Math.hypot(mx, my) || 1;
      player.x += (mx / mag) * moveSpeed;
      player.y += (my / mag) * moveSpeed;
      player.x = clamp(player.x, 32, WIDTH - 32);
      player.y = battleKind === 'helicopter'
        ? clamp(player.y, PLAYER_HALF_MIN_Y, HEIGHT - 32)
        : clamp(player.y, 32, HEIGHT - 32);
      player.angle = battleKind === 'helicopter'
        ? -Math.PI / 2
        : Math.atan2(mouseRef.current.y - player.y, mouseRef.current.x - player.x);
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
          addShot(player.x, player.y, player.angle, 'player', 18, 10);
          player.cooldown = 340;
        }
      }
      shotRequestedRef.current = false;

      enemies.forEach((enemy, index) => {
        const enemyKind = enemy.kind || 'common';
        const enemyStats = HELICOPTER_ENEMY_STATS[enemyKind];
        const desiredY = battleKind === 'helicopter'
          ? (enemyKind === 'boss' ? 96 : enemyKind === 'elite' ? 82 : 70) + Math.sin(now / 850 + enemy.id) * 18
          : enemy.y + Math.sin(now / 600 + index) * 0.7;
        enemy.x += Math.sin(now / (enemyKind === 'boss' ? 760 : 520) + enemy.id * 1.7) * (battleKind === 'tank' ? 0.55 : enemyStats.colorScale * 2.2) * dtScale;
        enemy.y += (desiredY - enemy.y) * (battleKind === 'helicopter' ? 0.026 : 0.012) * dtScale;
        enemy.x = clamp(enemy.x, 34, WIDTH - 34);
        enemy.y = battleKind === 'helicopter'
          ? clamp(enemy.y, 32, ENEMY_HALF_MAX_Y)
          : clamp(enemy.y, 32, HEIGHT - 32);
        enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
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
            addShot(enemy.x, enemy.y, enemy.angle, 'enemy', 9, 6.5);
            enemy.cooldown = 1000 + Math.random() * 500;
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
            shots.splice(i, 1);
          }
        } else if (Math.hypot(player.x - shot.x, player.y - shot.y) < player.radius) {
          player.hp -= shot.damage;
          spawnProjectileImpact(shot.x, shot.y, shot.visualType === 'boss' ? '#e879f9' : shot.visualType === 'elite' ? '#fde68a' : '#ef4444', shot.visualType === 'boss' ? 1.55 : shot.visualType === 'elite' ? 1.25 : 1, Math.atan2(shot.vy, shot.vx));
          shots.splice(i, 1);
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
          const defeatedKind = enemies[i].kind || 'common';
          spawnEnemyExplosion(enemies[i]);
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
          }
        }
      }

      ctx.save();
      if (screenShake > 0.1) {
        ctx.translate(rand(-screenShake, screenShake), rand(-screenShake, screenShake));
        screenShake *= 0.88;
      }

      drawArena(now);
      const spin = now / 58;
      enemies.forEach(enemy => {
        const enemyKind = enemy.kind || 'common';
        const scale = battleKind === 'helicopter' ? HELICOPTER_ENEMY_STATS[enemyKind].colorScale : 1;
        if (battleKind === 'tank') {
          drawTank(ctx, enemy, theme.palette.enemy, theme.palette.enemyDark, false);
        } else {
          ctx.save();
          ctx.translate(enemy.x, enemy.y);
          ctx.scale(scale, scale);
          ctx.translate(-enemy.x, -enemy.y);
          drawHelicopter(ctx, enemy, theme.palette.enemy, theme.palette.enemyDark, false, spin);
          ctx.restore();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.58)';
        ctx.fillRect(enemy.x - 32, enemy.y - 42, 64, 5);
        ctx.fillStyle = theme.palette.enemy;
        ctx.fillRect(enemy.x - 32, enemy.y - 42, 64 * Math.max(0, enemy.hp / enemy.maxHp), 5);
        if (battleKind === 'helicopter') {
          ctx.font = '700 10px monospace';
          ctx.fillStyle = 'rgba(255,255,255,0.72)';
          ctx.textAlign = 'center';
          ctx.fillText(enemyKind.toUpperCase(), enemy.x, enemy.y - 48);
          ctx.textAlign = 'left';
        }
      });
      if (battleKind === 'tank') drawTank(ctx, player, theme.palette.player, theme.palette.playerDark, true);
      else drawHelicopter(ctx, player, theme.palette.player, theme.palette.playerDark, true, -spin);

      shots.forEach(shot => {
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
        const size = isBossShot ? 9 : isEliteShot ? 6.5 : isEnemy ? 5.4 : 4.8;
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
        enemies: battleKind === 'helicopter' ? Math.max(0, HELICOPTER_TOTAL_WAVES - helicopterWaveIndex) : enemies.length,
      });
      if (!endedRef.current && player.hp <= 0) {
        endedRef.current = true;
        spawnEnemyExplosion({
          ...player,
          kind: 'boss',
          radius: 42,
          hp: 0,
          maxHp: HELICOPTER_PLAYER_HP,
        });
        pendingResult = 'defeat';
        pendingResultAt = now + 900;
      }
      if (!endedRef.current && enemies.length === 0 && (battleKind !== 'helicopter' || helicopterWaveIndex >= HELICOPTER_TOTAL_WAVES)) {
        endedRef.current = true;
        pendingResult = 'victory';
        pendingResultAt = now + 900;
      }

      if (pendingResult && now >= pendingResultAt) {
        setResult(pendingResult);
        if (pendingResult === 'victory') onVictory();
        else onDefeat();
        return;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [battleKind, defenseBattleLevel, enemyCount, language, onDefeat, onVictory, theme]);

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
    const helicopterParams = new URLSearchParams({
      embedded: '1',
      speedBonus: String(helicopterStats?.speedBonus ?? 0),
      gunDamageBonus: String(helicopterStats?.gunDamageBonus ?? 0),
      missileDamageBonus: String(helicopterStats?.missileDamageBonus ?? 0),
      startingMissiles: String(helicopterStats?.startingMissiles ?? 1),
      armorReduction: String(helicopterStats?.armorReduction ?? 0),
      initialDrones: String(helicopterStats?.initialDrones ?? 0),
    });
    if (background) helicopterParams.set('background', background);

    return (
      <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/88 p-4 backdrop-blur-xl">
        <div className="relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.55)]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-5 py-3">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-cyan-100/70">
                {language === 'pt' ? 'Batalha aérea V3' : 'Air battle V3'}
              </p>
              <h2 className="font-orbitron text-xl font-black uppercase text-white">{theme.title[language]}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-white/10 bg-black/35 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200 md:block">
                {colonyName} / {language === 'pt' ? 'Protótipo V3 integrado' : 'Integrated V3 prototype'}
              </div>
              <PremiumCanvasButton type="button" tone="steel" onClick={onClose} className="h-10 w-10 rounded-full" contentClassName="text-slate-100">
                <X size={18} />
              </PremiumCanvasButton>
            </div>
          </div>

          <iframe
            ref={helicopterIframeRef}
            title={language === 'pt' ? 'Batalha de Helicópteros V3' : 'Helicopter Battle V3'}
            src={`/prototypes/qch_batalha_helicopteros_v3.html?${helicopterParams.toString()}`}
            className="min-h-0 flex-1 border-0 bg-black"
            allow="autoplay"
            onLoad={() => helicopterIframeRef.current?.focus()}
          />
        </div>
      </div>
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
                  ? (language === 'pt' ? 'A operação foi concluída. Esta primeira versão já está pronta para receber sprites animados.' : 'Operation complete. This first version is ready for animated sprites.')
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
