// @ts-nocheck
'use client';
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';

type NewEarthHelicopterBattleStats = {
  speedBonus: number;
  gunDamageBonus: number;
  missileDamageBonus: number;
  startingMissiles: number;
  armorReduction: number;
  initialDrones: number;
};

interface NewEarthHelicopterBattleProps {
  language: 'en' | 'pt';
  title: string;
  colonyName: string;
  background?: string;
  helicopterStats?: Partial<NewEarthHelicopterBattleStats>;
  onClose: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export function NewEarthHelicopterBattle({
  language,
  title,
  colonyName,
  background,
  helicopterStats,
  onClose,
  onVictory,
  onDefeat,
}: NewEarthHelicopterBattleProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onVictoryRef = useRef(onVictory);
  const onDefeatRef = useRef(onDefeat);
  const speedBonus = helicopterStats?.speedBonus ?? 0;
  const gunDamageBonus = helicopterStats?.gunDamageBonus ?? 0;
  const missileDamageBonus = helicopterStats?.missileDamageBonus ?? 0;
  const startingMissiles = helicopterStats?.startingMissiles ?? 1;
  const armorReduction = helicopterStats?.armorReduction ?? 0;
  const initialDrones = helicopterStats?.initialDrones ?? 0;
  const continueLabel = language === 'pt' ? 'Continuar' : 'Continue';

  useEffect(() => {
    onVictoryRef.current = onVictory;
    onDefeatRef.current = onDefeat;
  }, [onDefeat, onVictory]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const WIDTH = 1280, HEIGHT = 720;
    const ENEMY_HALF_MAX_Y = HEIGHT / 2 - 22;
    const PLAYER_MAX_HP = 500;
    const TOTAL_WAVES = 10;

    const BACKGROUND_WEBP_SRC = background || '';
    const SHOW_GAMEPLAY_TEXT = false;

    const clampStat = (value, min, max, fallback = 0) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
    };
    const HELI_UPGRADES = {
      speedBonus: clampStat(speedBonus, 0, 50),
      gunDamageBonus: clampStat(gunDamageBonus, 0, 100),
      missileDamageBonus: clampStat(missileDamageBonus, 0, 100),
      startingMissiles: clampStat(startingMissiles, 1, 6, 1),
      armorReduction: clampStat(armorReduction, 0, 50),
      initialDrones: clampStat(initialDrones, 0, 5),
    };
    const playerSpeedMultiplier = 1 + HELI_UPGRADES.speedBonus / 100;
    const playerGunDamage = Math.round(18 * (1 + HELI_UPGRADES.gunDamageBonus / 100));
    const playerMissileDamage = Math.round(175 * (1 + HELI_UPGRADES.missileDamageBonus / 100));
    const droneGunDamage = Math.max(1, Math.round(playerGunDamage / 2));
    const DRONE_FORMATION_SLOTS = [
      { x: -160, y: -78, follow: 0.082, phase: 0.4 },
      { x: -92, y: -126, follow: 0.074, phase: 1.7 },
      { x: 92, y: -126, follow: 0.068, phase: 2.9 },
      { x: 160, y: -78, follow: 0.062, phase: 4.1 },
      { x: 0, y: -184, follow: 0.054, phase: 5.2 },
    ];
    const DRONE_FORMATION_BY_COUNT = [[], [4], [1, 2], [1, 2, 4], [0, 1, 2, 3], [0, 1, 2, 3, 4]];

    const ENEMY_STATS = {
      common: { hp: 240, shotDamage: 32, cooldown: 1050, radius: 28, label: 'COMUM', scale: 1, score: 100 },
      elite:  { hp: 520, shotDamage: 46, cooldown: 800,  radius: 36, label: 'ELITE', scale: 1.18, score: 250 },
      ace:    { hp: 700, shotDamage: 40, cooldown: 640,  radius: 40, label: 'ACE',   scale: 1.28, score: 400 },
      boss:   { hp: 3600, shotDamage:52, cooldown: 500,  radius: 68, label: 'BOSS',  scale: 1.9,  score: 2000 },
    };
    const BOSS_ROTOR_MAX_HP = 800;
    const BOSS_ROTOR_HIT_RADIUS = 46;
    const BOSS_CORE_HIT_RADIUS = 48;

    const SFX = {
      playerShot:   '/assets/rota4/battles/player/horizon/shoot_rt4.ogg',
      enemyShot:    '/audio/sfx/shoot_enemy.ogg',
      missile:      '/assets/rota4/SFX_new_land/helicopters_tanks/aether_shooting_missil.ogg',
      missileImpact: '/assets/rota4/SFX_new_land/helicopters_tanks/aether_missil_impact.ogg',
      explosionA:   '/assets/rota4/SFX_new_land/enemy_explosion_cap_4.ogg',
      explosionB:   '/assets/rota4/SFX_new_land/enemy_explosion_cap4_2.ogg',
      explosionElite:'/assets/rota4/SFX_new_land/explosion_elite_cap4.ogg',
      enemyCommonLoop: '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_comum_sound.ogg',
      enemyEliteLoop: '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_elite_sound.ogg',
      enemyBossLoop: '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_boss_sound.ogg',
      aetherLoop: '/assets/rota4/SFX_new_land/helicopters_tanks/helicopter_aether_sound.ogg',
      getDrone: '/assets/rota4/SFX_new_land/helicopters_tanks/get_drone_sound.ogg',
      droneExplosion: '/assets/rota4/SFX_new_land/helicopters_tanks/drone_explosion.ogg',
      enemyCommonFalling: '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_comum_before_exploding.ogg',
      enemyEliteFalling: '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_elite_before_exploding.ogg',
      enemyBossFalling: '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_boss_before_exploding.ogg',
      aetherFalling: '/assets/rota4/SFX_new_land/helicopters_tanks/aether_player_before_exploding.ogg',
    };

    // ─── canvas & DOM ─────────────────────────────────────────────────────────
    const canvas = root.querySelector('#battle');
    const ctx = canvas.getContext('2d');
    canvas.tabIndex = 0;
    const hpEl = root.querySelector('#playerHp');
    const shieldEl = root.querySelector('#shieldLabel');
    const shieldPill = root.querySelector('#shieldPill');
    const turboEl = root.querySelector('#turboLabel');
    const targetsEl = root.querySelector('#targetsLeft');
    const waveEl = root.querySelector('#waveLabel');
    const kindEl = root.querySelector('#enemyKind');
    const missileEl = root.querySelector('#missileLabel');
    const scoreEl = root.querySelector('#scoreLabel');
    const comboEl = root.querySelector('#comboLabel');
    const comboPill = root.querySelector('#comboPill');
    const overlay = root.querySelector('#overlay');
    const resultTitle = root.querySelector('#resultTitle');
    const resultText = root.querySelector('#resultText');
    const finalScore = root.querySelector('#finalScore');
    const finalCombo = root.querySelector('#finalCombo');
    const finalKills = root.querySelector('#finalKills');
    const restart = root.querySelector('#restart');
    let lastResult = '';
    restart.textContent = continueLabel;

    const keys = {};
    const mouse = { x: WIDTH / 2, y: HEIGHT / 2, down: false };
    const bg = new Image(); let hasBg = false;
    if (BACKGROUND_WEBP_SRC) { bg.onload = () => { hasBg = true; }; bg.src = BACKGROUND_WEBP_SRC; }
    const aetherBody = new Image(); let hasAetherBody = false;
    aetherBody.onload = () => { hasAetherBody = true; };
    aetherBody.src = '/assets/rota4/colonys/elysium/aether/aether_helicopter_body.webp';
    const aetherRotor = new Image(); let hasAetherRotor = false;
    aetherRotor.onload = () => { hasAetherRotor = true; };
    aetherRotor.src = '/assets/rota4/colonys/elysium/aether/helice.webp';
    const aetherMissile = new Image(); let hasAetherMissile = false;
    aetherMissile.onload = () => { hasAetherMissile = true; };
    aetherMissile.src = '/assets/rota4/colonys/elysium/aether/aether_missil.webp';
    const droneBody = new Image(); let hasDroneBody = false;
    droneBody.onload = () => { hasDroneBody = true; };
    droneBody.src = '/assets/rota4/colonys/elysium/aether/drone_player.webp';
    const droneRotor = new Image(); let hasDroneRotor = false;
    droneRotor.onload = () => { hasDroneRotor = true; };
    droneRotor.src = '/assets/rota4/colonys/elysium/aether/drone_helice.webp';
    const enemyCommonBodies = [
      '/assets/rota4/colonys/enemy_chopter/enemy_common_black_body.webp',
      '/assets/rota4/colonys/enemy_chopter/enemy_common_red_body.webp',
      '/assets/rota4/colonys/enemy_chopter/enemy_common_purple_body.webp',
    ].map(src => {
      const image = new Image();
      image.loaded = false;
      image.onload = () => { image.loaded = true; };
      image.src = src;
      return image;
    });
    const enemyCommonRotor = new Image(); let hasEnemyCommonRotor = false;
    enemyCommonRotor.onload = () => { hasEnemyCommonRotor = true; };
    enemyCommonRotor.src = '/assets/rota4/colonys/enemy_chopter/enemy_common_helice.webp';
    const enemyEliteBody = new Image(); let hasEnemyEliteBody = false;
    enemyEliteBody.onload = () => {
      hasEnemyEliteBody = true;
      enemyEliteBody.loaded = true;
    };
    enemyEliteBody.loaded = false;
    enemyEliteBody.src = '/assets/rota4/colonys/enemy_chopter/enemy_elite_body.webp';
    const enemyBossBody = new Image(); let hasEnemyBossBody = false;
    enemyBossBody.onload = () => {
      hasEnemyBossBody = true;
      enemyBossBody.loaded = true;
    };
    enemyBossBody.loaded = false;
    enemyBossBody.src = '/assets/rota4/colonys/enemy_chopter/enemy_boss_body.webp';

    // ─── utils ────────────────────────────────────────────────────────────────
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
    const lerp = (a, b, t) => a + (b - a) * t;
    const playSfx = (src, vol = 0.45) => { try { const a = new Audio(src); a.volume = vol; a.play().catch(()=>{}); } catch(_){} };
    const createLoop = (src, vol = 0.32) => {
      try {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0;
        audio.dataset.targetVolume = String(vol);
        return audio;
      } catch (_) {
        return null;
      }
    };
    const soundLoops = {
      aether: createLoop(SFX.aetherLoop, 0.28),
      common: createLoop(SFX.enemyCommonLoop, 0.18),
      elite: createLoop(SFX.enemyEliteLoop, 0.2),
      boss: createLoop(SFX.enemyBossLoop, 0.26),
    };
    const setLoop = (audio, active) => {
      if (!audio) return;
      const target = Number(audio.dataset.targetVolume || 0.25);
      audio.volume = lerp(audio.volume || 0, active ? target : 0, 0.08);
      if (active && audio.paused) audio.play().catch(()=>{});
      if (!active && audio.volume < 0.01 && !audio.paused) audio.pause();
    };
    const stopAllLoops = () => Object.values(soundLoops).forEach(audio => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });

    // ─── state ────────────────────────────────────────────────────────────────
    let raf, last, player, enemies, bullets, missiles, enemyShots;
    let particles, texts, clouds, drones, explosions, radio, powerups, mines;
    let crashers, playerCrash;
    let waveIndex, nextId, ended, pendingResult, pendingResultAt;
    let maxDroneCount, bossDropPending;
    let shake, flash, lock, camera, bgScroll;
    let score, combo, comboTimer, bestCombo, totalKills;
    let shockwaves; // AAA shockwave rings

    // ─── parallax terrain ────────────────────────────────────────────────────
    // Pre-generate mountain layers
    function genMountainLayer(seed, count, yBase, h, color) {
      const pts = [];
      let x = -80;
      const step = (WIDTH + 160) / count;
      for (let i = 0; i <= count + 1; i++) {
        pts.push({ x: x + Math.sin(seed + i * 2.3) * step * 0.4, y: yBase - Math.abs(Math.sin(seed * 1.7 + i * 1.4)) * h });
        x += step;
      }
      return { pts, color, yBase };
    }

    let terrain = [];
    function buildTerrain() {
      terrain = [
        genMountainLayer(0.3, 8, HEIGHT * 0.42, 55, 'rgba(15,35,70,0.7)'),
        genMountainLayer(1.1, 12, HEIGHT * 0.46, 38, 'rgba(20,42,80,0.6)'),
        genMountainLayer(2.4, 16, HEIGHT * 0.50, 24, 'rgba(24,48,90,0.5)'),
        // city silhouette near division line
        genMountainLayer(5.1, 22, HEIGHT * 0.52, 15, 'rgba(30,55,100,0.45)'),
      ];
    }
    buildTerrain();

    // ─── wave blueprint ───────────────────────────────────────────────────────
    function waveKind(i) {
      if (i >= 9) return 'boss';
      if (i === 7 || i === 8) return 'ace';
      if (i === 4 || i === 6) return 'elite';
      return 'common';
    }

    // ─── reset ────────────────────────────────────────────────────────────────
    function reset() {
      cancelAnimationFrame(raf);
      player = {
        x: WIDTH/2, y: HEIGHT - 92,
        vx: 0, vy: 0, angle: -Math.PI/2, bank: 0,
        hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP, radius: 24,
        gunCd: 0, missileCd: 0, missiles: HELI_UPGRADES.startingMissiles, missileReload: 0,
        turbo: 100, inv: 0, shield: 0, shieldMax: 300,
      };
      waveIndex = 0; nextId = 1;
      enemies = []; bullets = []; missiles = []; enemyShots = [];
      particles = []; texts = []; explosions = [];
      crashers = []; playerCrash = null;
      drones = Array.from({ length: HELI_UPGRADES.initialDrones }, (_, index) => ({
        formationIndex: index,
        x: player.x,
        y: player.y - 90,
        hp: PLAYER_MAX_HP / 2,
        maxHp: PLAYER_MAX_HP / 2,
        cd: index * 90,
      }));
      normalizeDroneFormation();
      maxDroneCount = drones.length;
      radio = []; powerups = []; mines = []; shockwaves = [];
      clouds = createClouds();
      ended = false; pendingResult = ''; pendingResultAt = 0; bossDropPending = false;
      shake = 0; flash = 0;
      lock = { targetId: null, amount: 0, locked: false, beep: 0 };
      camera = { x: 0, y: 0 };
      bgScroll = 0;
      score = 0; combo = 1; comboTimer = 0; bestCombo = 1; totalKills = 0;
      spawnWave();
      pushRadio('Comando', 'Elysium, proteja a zona aérea de Nova Terra.');
      overlay.classList.remove('show');
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    // ─── clouds ───────────────────────────────────────────────────────────────
    function createClouds() {
      const list = [];
      for (let i = 0; i < 32; i++) {
        const layer = i % 3;
        list.push({
          x: rand(-120, WIDTH + 120), y: rand(0, HEIGHT * 0.52),
          w: rand(70, 200) * (1 + layer * 0.18), h: rand(10, 36) * (1 + layer * 0.1),
          speed: [0.1, 0.2, 0.35][layer],
          alpha: [0.05, 0.08, 0.12][layer], layer,
        });
      }
      return list;
    }

    // ─── spawn ────────────────────────────────────────────────────────────────
    function spawnWave() {
      const kind = waveKind(waveIndex);
      const stats = ENEMY_STATS[kind];
      const count = kind === 'boss' ? 1 : kind === 'ace' ? 2 : kind === 'elite' ? 2 : 1 + Math.floor(waveIndex / 3);
      for (let i = 0; i < count; i++) enemies.push(createEnemy(kind, i, count));
      if (waveIndex === 2 && drones.length === 0) {
        drones.push(
          { formationIndex: 0, x: player.x - 70, y: player.y - 80, hp: PLAYER_MAX_HP / 2, maxHp: PLAYER_MAX_HP / 2, cd: 0 },
          { formationIndex: 1, x: player.x + 70, y: player.y - 80, hp: PLAYER_MAX_HP / 2, maxHp: PLAYER_MAX_HP / 2, cd: 160 }
        );
        normalizeDroneFormation();
        maxDroneCount = Math.max(maxDroneCount, drones.length);
        pushRadio('Drone Alpha', 'Dois drones aliados entrando em formação.');
      }
      if (kind === 'boss') pushRadio('Comando', 'ALERTA: fortaleza aérea entrando no setor!');
    }

    function createEnemy(kind, i, count) {
      const stats = ENEMY_STATS[kind];
      const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 170;
      return {
        id: nextId++, kind,
        x: WIDTH/2 + spread, y: kind === 'boss' ? -180 : 76 + i * 18,
        baseX: WIDTH/2 + spread,
        hp: stats.hp, maxHp: stats.hp,
        radius: stats.radius, scale: stats.scale,
        angle: Math.PI/2, bank: 0,
        cd: 600 + i * 180,
        missileCd: kind === 'boss' ? 1400 : kind === 'ace' ? 2100 : 99999,
        patternCd: kind === 'boss' ? 1600 : 99999,
        diveCd: kind === 'ace' ? 4000 : kind === 'elite' ? 6000 : 99999,
        diving: false, diveTarget: 0,
        phase: rand(0, Math.PI * 2),
        alive: true,
        hitFlash: 0,
        spriteVariant: kind === 'common' ? Math.floor(Math.random() * enemyCommonBodies.length) : 0,
        behaviorPhase: Math.floor(rand(0, 3)),
        bossParts: kind === 'boss' ? {
          rotors: Array.from({ length: 4 }, () => ({ hp: BOSS_ROTOR_MAX_HP, maxHp: BOSS_ROTOR_MAX_HP, stoppedAngle: rand(0, Math.PI * 2) })),
          coreUnlocked: false,
        } : null,
      };
    }

    // ─── radio ────────────────────────────────────────────────────────────────
    function pushRadio(who, msg) {
      if (!SHOW_GAMEPLAY_TEXT) return;
      radio.unshift({ who, msg, life: 3400 });
      radio = radio.slice(0, 3);
    }

    // ─── text / particle helpers ──────────────────────────────────────────────
    function addText(x, y, text, color = '#fff', life = 800) {
      if (!SHOW_GAMEPLAY_TEXT) return;
      texts.push({ x, y, text, color, life, maxLife: life, vy: -0.55 });
    }

    function addParticle(x, y, vx, vy, size, color, life, type = 'spark') {
      particles.push({ x, y, vx, vy, size, color, life, maxLife: life, type, rot: rand(0, 6.28), spin: rand(-0.18, 0.18) });
    }

    function burst(x, y, color, count = 16, power = 5, smoke = true) {
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2), s = rand(power * 0.25, power);
        addParticle(x, y, Math.cos(a)*s, Math.sin(a)*s, rand(1.5, 5.5), pick([color,'#fff7ad','#fb923c','#facc15']), rand(420,900), 'spark');
      }
      if (smoke) {
        for (let i = 0; i < Math.floor(count * 0.45); i++)
          addParticle(x + rand(-12,12), y + rand(-8,8), rand(-1.2,1.2), rand(-1.4,-0.1), rand(8,22), 'rgba(110,118,128,0.3)', rand(900,1700), 'smoke');
      }
      // debris shards
      for (let i = 0; i < Math.floor(count * 0.3); i++) {
        const a = rand(0, Math.PI * 2), s = rand(power * 0.5, power * 1.4);
        addParticle(x, y, Math.cos(a)*s, Math.sin(a)*s - 2, rand(2, 6), pick(['#94a3b8','#64748b','#475569']), rand(600,1400), 'debris');
      }
    }

    function bigExplosion(x, y, scale = 1, color = '#f97316') {
      burst(x, y, color, 34 * scale, 9 * scale, true);
      for (let i = 0; i < Math.round(10 * scale); i++) {
        addParticle(x + rand(-16, 16) * scale, y + rand(-12, 12) * scale, rand(-2.8, 2.8) * scale, rand(-3.8, 0.6) * scale, rand(10, 24) * scale, 'rgba(72,76,84,0.36)', rand(900, 1700), 'smoke');
      }
      shake = Math.max(shake, 5 * scale);
      flash = Math.max(flash, 0.12 * scale);
    }

    function aaaExplosion(x, y, kind = 'common') {
      const type = kind === 'ace' ? 'elite' : kind;
      const scale = type === 'boss' ? 2.28 : type === 'elite' ? 1.52 : 1.08;
      const mainColor = type === 'boss' ? '#c084fc' : type === 'elite' ? '#facc15' : '#fb923c';
      const palette = type === 'boss'
        ? ['#f0abfc', '#c084fc', '#ffffff', '#fb923c', '#7c3aed']
        : type === 'elite'
          ? ['#fef08a', '#facc15', '#ffffff', '#fb923c', '#f97316']
          : ['#fff7ad', '#fb923c', '#facc15', '#ffffff', '#ef4444'];

      flash = Math.max(flash, type === 'boss' ? 0.38 : type === 'elite' ? 0.28 : 0.18);
      shake = Math.max(shake, type === 'boss' ? 18 : type === 'elite' ? 11 : 6);
      burst(x, y, mainColor, type === 'boss' ? 128 : type === 'elite' ? 82 : 52, type === 'boss' ? 16 : type === 'elite' ? 12 : 8.5, true);

      const flameCount = type === 'boss' ? 46 : type === 'elite' ? 30 : 18;
      for (let i = 0; i < flameCount; i++) {
        const a = rand(0, Math.PI * 2);
        const speed = rand(1.4, type === 'boss' ? 8.8 : 6.4) * scale;
        addParticle(
          x + rand(-22, 22) * scale,
          y + rand(-16, 16) * scale,
          Math.cos(a) * speed,
          Math.sin(a) * speed - rand(0.4, 2.4) * scale,
          rand(4, 13) * scale,
          pick(palette),
          rand(360, 920),
          'spark'
        );
      }

      const debrisCount = type === 'boss' ? 36 : type === 'elite' ? 22 : 12;
      for (let i = 0; i < debrisCount; i++) {
        const a = rand(0, Math.PI * 2);
        const speed = rand(7, 21) * scale;
        addParticle(x + rand(-28, 28), y + rand(-22, 22), Math.cos(a) * speed, Math.sin(a) * speed - 2, rand(3, 8) * scale, pick(['#94a3b8', '#cbd5e1', '#64748b', '#fb923c']), rand(740, 1600), 'debris');
      }

      const smokeCount = type === 'boss' ? 42 : type === 'elite' ? 26 : 15;
      for (let i = 0; i < smokeCount; i++) {
        addParticle(x + rand(-28, 28) * scale, y + rand(-20, 20) * scale, rand(-2.8, 2.8) * scale, rand(-4.2, 0.6) * scale, rand(14, 38) * scale, 'rgba(54,58,66,0.42)', rand(1000, 2100), 'smoke');
      }

      const streakCount = type === 'boss' ? 42 : type === 'elite' ? 26 : 16;
      for (let i = 0; i < streakCount; i++) {
        const a = (i / streakCount) * Math.PI * 2 + rand(-0.18, 0.18);
        const speed = rand(9, 24) * scale;
        addParticle(x, y, Math.cos(a) * speed, Math.sin(a) * speed, rand(2.5, 6) * scale, pick(palette), rand(420, 900), 'spark');
      }

      if (type === 'boss') {
        for (let i = 0; i < 10; i++) {
          window.setTimeout(() => {
            const ox = rand(-78, 78) * scale;
            const oy = rand(-50, 50) * scale;
            burst(x + ox, y + oy, pick(palette), 20, 9 * scale, true);
          }, 140 + i * 72);
        }
      } else if (type === 'elite') {
        for (let i = 0; i < 5; i++) {
          window.setTimeout(() => {
            const ox = rand(-38, 38) * scale;
            const oy = rand(-28, 28) * scale;
            burst(x + ox, y + oy, pick(palette), 12, 7 * scale, false);
          }, 120 + i * 70);
        }
      }
    }
    // ─── firing ───────────────────────────────────────────────────────────────
    function firePlayerGun() {
      if (player.gunCd > 0) return;
      const a = Math.atan2(mouse.y - player.y, mouse.x - player.x) + rand(-0.018, 0.018);
      bullets.push({ id: nextId++, x: player.x + Math.cos(a)*28, y: player.y + Math.sin(a)*28, vx: Math.cos(a)*13.5, vy: Math.sin(a)*13.5, damage: playerGunDamage, life: 760 });
      addParticle(player.x + rand(-8,8), player.y - 22, rand(-0.6,0.6), rand(0.8,1.8), rand(1.5,3), '#bae6fd', 200, 'spark');
      player.gunCd = 78;
      playSfx(SFX.playerShot, 0.18);
    }

    function firePlayerMissile() {
      if (!lock.locked || player.missileCd > 0 || player.missiles <= 0) return;
      const target = enemies.find(e => e.id === lock.targetId);
      if (!target) return;
      player.missiles--;
      player.missileCd = 650;
      player.missileReload = Math.max(player.missileReload, 2200);
      missiles.push({ id: nextId++, from: 'player', targetId: target.id, x: player.x, y: player.y - 32, vx: rand(-0.35,0.35), vy: -4.2, speed: 4.8, turn: 0.13, damage: playerMissileDamage, life: 5200, smokeCd: 0, guaranteed: true });
      addText(player.x, player.y - 46, 'MISSILE', '#bae6fd');
      playSfx(SFX.missile, 0.36);
    }

    function fireEnemyShot(enemy, angle, speed = 7.2, damage = null, kind = enemy.kind) {
      const stats = ENEMY_STATS[enemy.kind];
      enemyShots.push({ id: nextId++, x: enemy.x + Math.cos(angle)*34, y: enemy.y + Math.sin(angle)*34, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, damage: damage ?? stats.shotDamage, life: 2100, kind });
    }

    function fireEnemyMissile(enemy) {
      missiles.push({ id: nextId++, from: 'enemy', targetId: 'player', x: enemy.x, y: enemy.y + 34, vx: rand(-1,1), vy: 5.5, speed: enemy.kind === 'boss' ? 5.5 : 4.8, turn: enemy.kind === 'boss' ? 0.044 : 0.036, damage: enemy.kind === 'boss' ? 85 : 62, life: 3600, smokeCd: 0 });
      addText(enemy.x, enemy.y + 50, 'MISSILE!', '#fda4af', 900);
    }

    // NEW: predictive aiming shot
    function firePredictive(enemy) {
      const leadTime = dist(enemy, player) / 7.5;
      const px = player.x + player.vx * leadTime;
      const py = player.y + player.vy * leadTime;
      const a = Math.atan2(py - enemy.y, px - enemy.x);
      fireEnemyShot(enemy, a, 7.8, ENEMY_STATS[enemy.kind].shotDamage * 1.2, enemy.kind);
      addText(enemy.x, enemy.y + 50, 'AIM!', '#fca5a5', 500);
    }

    // NEW: place a mine
    function dropMine(x, y) {
      mines.push({ x, y, life: 8000, armed: 1200, r: 8, id: nextId++ });
    }

    // ─── boss patterns ────────────────────────────────────────────────────────
    function bossPattern(enemy) {
      const pattern = Math.floor(performance.now() / 2200) % 5;
      if (pattern === 0) {
        for (let i = -3; i <= 3; i++) fireEnemyShot(enemy, Math.PI/2 + i*0.16, 6.5, 42, 'boss');
        addText(enemy.x, enemy.y + 80, 'LEQUE', '#f0abfc');
      } else if (pattern === 1) {
        for (let i = 0; i < 12; i++) fireEnemyShot(enemy, Math.PI*2*(i/12), 4.8, 34, 'boss');
        addText(enemy.x, enemy.y + 80, 'ONDA DE CHOQUE', '#f0abfc');
      } else if (pattern === 2) {
        for (let x = 90; x <= WIDTH - 90; x += 90)
          enemyShots.push({ id: nextId++, x, y: enemy.y + 52, vx: 0, vy: 5.2, damage: 38, life: 2100, kind: 'boss' });
        addText(enemy.x, enemy.y + 80, 'MURALHA', '#f0abfc');
      } else if (pattern === 3) {
        // Spiral burst
        for (let i = 0; i < 16; i++) {
          const a = Math.PI*2*(i/16) + performance.now()*0.002;
          fireEnemyShot(enemy, a, 5.2, 28, 'boss');
        }
        addText(enemy.x, enemy.y + 80, 'ESPIRAL', '#f0abfc');
      } else {
        // Mine drop
        for (let i = 0; i < 4; i++) dropMine(enemy.x + rand(-120,120), HEIGHT/2 - rand(20,80));
        addText(enemy.x, enemy.y + 80, 'MINAS!', '#f0abfc');
      }
      shake = Math.max(shake, 3);
    }

    // ─── power-up drop ────────────────────────────────────────────────────────
    function tryDropPowerup(x, y, kind) {
      const roll = Math.random();
      let type;
      if (kind === 'boss') type = 'bossDrop';
      else if (kind === 'elite' || kind === 'ace') {
        type = roll < 0.35 ? 'hp' : roll < 0.6 ? 'missile' : roll < 0.8 ? 'shield' : 'drone';
      } else {
        if (roll > 0.72) type = roll > 0.9 ? 'missile' : 'hp';
        else return;
      }
      powerups.push({
        x,
        y: y + rand(-10,10),
        vy: type === 'bossDrop' ? 0 : 1.2,
        type,
        life: type === 'bossDrop' ? Infinity : 7000,
        id: nextId++,
        bob: rand(0, Math.PI*2),
      });
    }

    // ─── lock ─────────────────────────────────────────────────────────────────
    function updateLock(dt) {
      let best = null, bestD = 9999;
      for (const e of enemies) {
        const d = Math.hypot(mouse.x - e.x, mouse.y - e.y);
        if (d < e.radius + 54 && d < bestD) { best = e; bestD = d; }
      }
      if (best) {
        lock.targetId = best.id;
        lock.amount = clamp(lock.amount + dt * 0.0016, 0, 1);
        lock.locked = lock.amount >= 1;
        lock.beep -= dt;
        if (lock.beep <= 0 && lock.amount < 1) {
          lock.beep = lerp(420, 120, lock.amount);
          addText(best.x, best.y - 74, 'LOCK', '#fde68a', 240);
        }
      } else {
        lock.amount = clamp(lock.amount - dt * 0.0024, 0, 1);
        lock.locked = false;
        if (lock.amount <= 0) lock.targetId = null;
      }
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    function update(dt, dtScale, now) {
      if (ended) return;
      updateEngineLoops();

      if (playerCrash) {
        updateCrashes(dt, dtScale, now);
        updateParticles(dt, dtScale);
        updateShockwaves(dt, dtScale);
        explosions.forEach(e => { e.r = lerp(e.r, e.maxR, 0.16); e.life -= dt; });
        explosions = explosions.filter(e => e.life > 0);
        shake *= 0.88;
        flash = Math.max(0, flash - 0.025 * dtScale);
        return;
      }

      // Player movement
      const boost = (keys.shift && player.turbo > 0) ? 1.52 : 1;
      let mx = 0, my = 0;
      if (keys.a || keys.arrowleft)  mx -= 1;
      if (keys.d || keys.arrowright) mx += 1;
      if (keys.w || keys.arrowup)    my -= 1;
      if (keys.s || keys.arrowdown)  my += 1;
      const mag = Math.hypot(mx, my) || 1;
      const spd = 0.58 * boost * playerSpeedMultiplier;
      player.vx += (mx/mag) * spd * dtScale;
      player.vy += (my/mag) * spd * dtScale;
      player.vx *= 0.88; player.vy *= 0.88;
      player.x += player.vx * dtScale; player.y += player.vy * dtScale;
      player.x = clamp(player.x, 34, WIDTH - 34);
      player.y = clamp(player.y, 34, HEIGHT - 34);
      player.bank = lerp(player.bank, clamp(player.vx*5,-18,18), 0.12);
      player.angle = -Math.PI/2 + player.bank * 0.012;

      player.gunCd = Math.max(0, player.gunCd - dt);
      player.missileCd = Math.max(0, player.missileCd - dt);
      player.inv = Math.max(0, player.inv - dt);
      player.shield = Math.max(0, player.shield - dt * 0.5);

      if (boost > 1) player.turbo = Math.max(0, player.turbo - dt * 0.035);
      else player.turbo = Math.min(100, player.turbo + dt * 0.018);

      if (player.missileReload > 0) {
        player.missileReload -= dt;
        if (player.missileReload <= 0 && player.missiles < 2) {
          player.missiles++;
          addText(player.x, player.y - 40, '+MÍSSIL', '#bae6fd', 700);
          if (player.missiles < 2) player.missileReload = 2600;
        }
      }

      if (mouse.down) firePlayerGun();

      // combo decay
      if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) { combo = 1; }
      }

      bgScroll += (1.1 + Math.abs(player.vy) * 0.06) * dtScale;
      camera.x = lerp(camera.x, -player.vx * 2.2, 0.07);
      camera.y = lerp(camera.y, -player.vy * 1.5, 0.07);

      updateLock(dt);
      updateEnemies(dt, dtScale, now);
      updateDrones(dt, dtScale, now);
      updatePowerups(dt, dtScale, now);
      updateMines(dt, dtScale);
      updateBullets(dt, dtScale);
      updateMissiles(dt, dtScale);
      updateEnemyShots(dt, dtScale);
      updateParticles(dt, dtScale);
      updateShockwaves(dt, dtScale);
      updateCrashes(dt, dtScale, now);

      // wave advance
      if (enemies.length === 0 && crashers.length === 0 && !bossDropPending) {
        waveIndex++;
        bullets.length = 0; enemyShots.length = 0;
        missiles = missiles.filter(m => m.from === 'player');
        player.hp = Math.min(player.maxHp, player.hp + 40);
        player.missiles = Math.min(HELI_UPGRADES.startingMissiles, player.missiles + 1);
        if (waveIndex < TOTAL_WAVES) {
          pushRadio('Comando', `Onda ${waveIndex} eliminada. Próximo grupo chegando.`);
          spawnWave();
        } else {
          ended = true;
          pendingResult = 'victory';
          pendingResultAt = now + 900;
        }
      }

      if (player.hp <= 0) {
        startPlayerCrash(now);
      }

      radio.forEach(r => r.life -= dt);
      radio = radio.filter(r => r.life > 0);
      shake *= 0.88;
      flash = Math.max(0, flash - 0.025 * dtScale);
    }

    function updateEngineLoops() {
      const hasCommon = enemies.some(e => e.kind === 'common');
      const hasElite = enemies.some(e => e.kind === 'elite' || e.kind === 'ace');
      const hasBoss = enemies.some(e => e.kind === 'boss');
      setLoop(soundLoops.aether, !playerCrash && !ended);
      setLoop(soundLoops.common, hasCommon && !ended);
      setLoop(soundLoops.elite, hasElite && !ended);
      setLoop(soundLoops.boss, hasBoss && !ended);
    }

    function updateEnemies(dt, dtScale, now) {
      enemies.forEach(enemy => {
        const stats = ENEMY_STATS[enemy.kind];
        enemy.phase += 0.016 * dtScale;
        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

        // Behaviour patterns - switch every few seconds
        if (Math.floor(now / 3000) % 3 !== enemy.behaviorPhase) {
          // just let it drift naturally
        }

        const amp = enemy.kind === 'boss' ? 30 : 105;
        let desiredX = enemy.baseX + Math.sin(enemy.phase * (enemy.kind === 'boss' ? 0.42 : 1.2)) * amp;
        let desiredY = enemy.kind === 'boss'
          ? HEIGHT / 2 - 12 + Math.sin(enemy.phase * 0.55) * 7
          : 72 + Math.sin(enemy.phase * 1.5) * 24;

        // dive bomb behaviour for ace/elite
        if (enemy.kind === 'ace' || enemy.kind === 'elite') {
          enemy.diveCd -= dt;
          if (enemy.diving) {
            desiredY = HEIGHT / 2 - 30;
            desiredX = enemy.diveTarget;
            if (Math.abs(enemy.y - desiredY) < 15) {
              enemy.diving = false;
              enemy.diveCd = 3800 + rand(0, 1500);
              fireEnemyShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x), 9, stats.shotDamage * 1.6, enemy.kind);
              burst(enemy.x, enemy.y, '#f59e0b', 8, 4, false);
            }
          } else if (enemy.diveCd <= 0) {
            enemy.diving = true;
            enemy.diveTarget = player.x + rand(-80, 80);
            addText(enemy.x, enemy.y - 40, 'DIVE!', '#fbbf24', 800);
          }
        }

        const oldX = enemy.x;
        enemy.x = lerp(enemy.x, clamp(desiredX, 52, WIDTH-52), (enemy.kind === 'boss' ? 0.012 : 0.025) * dtScale);
        const maxEnemyY = enemy.kind === 'boss' ? HEIGHT / 2 + 4 : ENEMY_HALF_MAX_Y;
        enemy.y = lerp(enemy.y, clamp(desiredY, 36, maxEnemyY), enemy.diving ? 0.045 * dtScale : (enemy.kind === 'boss' ? 0.014 : 0.025) * dtScale);
        enemy.bank = lerp(enemy.bank, clamp((enemy.x - oldX)*6,-14,14), 0.08);
        enemy.angle = Math.PI/2 + enemy.bank * 0.012;

        enemy.cd -= dt; enemy.missileCd -= dt; enemy.patternCd -= dt;

        if (enemy.cd <= 0) {
          // Mix of direct and predictive fire
          const directAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          if (Math.random() < 0.35 && (enemy.kind !== 'common')) {
            firePredictive(enemy);
          } else if (enemy.kind === 'common') {
            fireEnemyShot(enemy, directAngle, 7.2);
          } else {
            fireEnemyShot(enemy, directAngle - 0.12, 7.1);
            fireEnemyShot(enemy, directAngle + 0.12, 7.1);
          }
          enemy.cd = stats.cooldown + rand(-120, 180);
          playSfx(SFX.enemyShot, 0.22);
        }
        if (enemy.missileCd <= 0) {
          fireEnemyMissile(enemy);
          enemy.missileCd = enemy.kind === 'boss' ? 2300 : 3400;
        }
        if (enemy.patternCd <= 0) {
          bossPattern(enemy);
          enemy.patternCd = 2500;
        }
      });
    }

    function updateDrones(dt, dtScale, now) {
      removeDestroyedDrones();
      normalizeDroneFormation();
      drones.forEach((d, index) => {
        const slot = DRONE_FORMATION_SLOTS[d.formationSlot ?? 4] || DRONE_FORMATION_SLOTS[4];
        const swayX = Math.sin(now / 520 + slot.phase) * 4;
        const swayY = Math.sin(now / 680 + slot.phase * 1.37) * 3;
        const targetX = clamp(player.x + slot.x + swayX, 28, WIDTH - 28);
        const targetY = clamp(player.y + slot.y + swayY, 28, HEIGHT - 28);
        const follow = clamp(slot.follow * dtScale * (1 - Math.min(index, 4) * 0.035), 0.018, 0.16);
        d.x = Number.isFinite(d.x) ? lerp(d.x, targetX, follow) : targetX;
        d.y = Number.isFinite(d.y) ? lerp(d.y, targetY, follow) : targetY;
        d.cd -= dt;
        if (d.cd <= 0 && enemies.length) {
          const a = -Math.PI / 2;
          bullets.push({ id: nextId++, x: d.x, y: d.y, vx: Math.cos(a)*10.5, vy: Math.sin(a)*10.5, damage: droneGunDamage, life: 780, drone: true });
          d.cd = 185;
        }
      });
    }

    function removeDestroyedDrones() {
      for (let i = drones.length - 1; i >= 0; i--) {
        const d = drones[i];
        if (d.hp > 0) continue;
        playSfx(SFX.droneExplosion, 0.62);
        burst(d.x, d.y, '#a7f3d0', 14, 5, true);
        shake = Math.max(shake, 2.5);
        drones.splice(i, 1);
      }
    }

    function normalizeDroneFormation() {
      const count = Math.min(drones.length, DRONE_FORMATION_SLOTS.length);
      const formation = DRONE_FORMATION_BY_COUNT[count] || DRONE_FORMATION_BY_COUNT[DRONE_FORMATION_BY_COUNT.length - 1];
      drones.forEach((drone, index) => {
        drone.formationIndex = index;
        drone.formationSlot = formation[index] ?? DRONE_FORMATION_SLOTS.length - 1;
      });
    }

    function updatePowerups(dt, dtScale, now) {
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (p.type === 'bossDrop') {
          p.x = clamp(p.x + Math.sin(now / 760 + p.id) * 0.18 * dtScale, 42, WIDTH - 42);
        } else {
          p.y += p.vy * dtScale;
          p.life -= dt;
        }
        p.bob += 0.04 * dtScale;
        if (p.y > HEIGHT - 20 || p.life <= 0) { powerups.splice(i, 1); continue; }
        if (dist(p, player) < (p.type === 'bossDrop' ? 42 : 28)) {
          applyPowerup(p.type);
          powerups.splice(i, 1);
        }
      }
    }

    function applyPowerup(type) {
      if (type === 'hp') {
        player.hp = Math.min(player.maxHp, player.hp + 120);
        addText(player.x, player.y - 50, '+120 HP', '#4ade80', 900);
        flash = 0.05;
      } else if (type === 'missile') {
        player.missiles = Math.min(HELI_UPGRADES.startingMissiles + 3, player.missiles + 2);
        addText(player.x, player.y - 50, '+2 MÍSSIL', '#bae6fd', 900);
      } else if (type === 'shield') {
        player.shield = player.shieldMax;
        addText(player.x, player.y - 50, 'ESCUDO!', '#a78bfa', 900);
      } else if (type === 'drone') {
        reviveDrone();
      } else if (type === 'bossDrop') {
        bossDropPending = false;
        ended = true;
        pendingResult = 'victory';
        pendingResultAt = performance.now() + 350;
        flash = Math.max(flash, 0.16);
        addText(player.x, player.y - 54, 'ARTEFATO COLETADO', '#f0abfc', 1100);
      }
    }

    function reviveDrone() {
      playSfx(SFX.getDrone, 0.68);
      if (drones.length >= maxDroneCount) {
        addText(player.x, player.y - 50, 'DRONES OK', '#a7f3d0', 900);
        return;
      }
      drones.push({
        formationIndex: drones.length,
        x: player.x,
        y: player.y - 64,
        hp: PLAYER_MAX_HP / 2,
        maxHp: PLAYER_MAX_HP / 2,
        cd: 90,
      });
      normalizeDroneFormation();
      addText(player.x, player.y - 50, 'DRONE REVIVIDO', '#a7f3d0', 900);
    }

    function updateMines(dt, dtScale) {
      for (let i = mines.length - 1; i >= 0; i--) {
        const m = mines[i];
        m.life -= dt; m.armed -= dt;
        if (m.life <= 0) { mines.splice(i, 1); continue; }
        if (m.armed <= 0 && dist(m, player) < m.r + player.radius) {
          const dmg = 70;
          if (player.shield > 0) {
            player.shield -= dmg * 2;
            addText(player.x, player.y - 40, 'ESCUDO -70', '#a78bfa', 600);
          } else if (player.inv <= 0) {
            player.hp -= dmg * (1 - HELI_UPGRADES.armorReduction / 100);
            player.inv = 300;
            shake = Math.max(shake, 5);
          }
          bigExplosion(m.x, m.y, 0.9, '#f59e0b');
          mines.splice(i, 1);
        }
      }
    }

    function getBossRotorLayout(u) {
      const body = hasEnemyBossBody ? enemyBossBody : enemyCommonBodies[2];
      const bodyRenderH = 248;
      const bodyRenderW = body.loaded && body.naturalHeight
        ? bodyRenderH * (body.naturalWidth / body.naturalHeight)
        : 174;
      const bodyHubX = 0.5;
      const bodyHubY = 0.34;
      const rotorPoints = [
        { x: 0.118, y: 0.088, spin: 1 },
        { x: 0.882, y: 0.088, spin: -1 },
        { x: 0.118, y: 0.765, spin: -1 },
        { x: 0.882, y: 0.765, spin: 1 },
      ];
      return { bodyRenderW, bodyRenderH, bodyHubX, bodyHubY, rotorPoints };
    }

    function bossLocalToWorld(u, lx, ly) {
      const scale = u.scale || 1;
      const rotation = u.angle - Math.PI / 2;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      return {
        x: u.x + (lx * cos - ly * sin) * scale,
        y: u.y + (lx * sin + ly * cos) * scale,
      };
    }

    function bossWorldToLocal(u, x, y) {
      const scale = u.scale || 1;
      const rotation = u.angle - Math.PI / 2;
      const dx = (x - u.x) / scale;
      const dy = (y - u.y) / scale;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      return {
        x: dx * cos - dy * sin,
        y: dx * sin + dy * cos,
      };
    }

    function bossRotorLocalPoint(u, rotorIndex) {
      const layout = getBossRotorLayout(u);
      const point = layout.rotorPoints[rotorIndex];
      return {
        x: (point.x - layout.bodyHubX) * layout.bodyRenderW,
        y: (point.y - layout.bodyHubY) * layout.bodyRenderH,
      };
    }

    function bossRotorWorldPoint(u, rotorIndex) {
      const local = bossRotorLocalPoint(u, rotorIndex);
      return bossLocalToWorld(u, local.x, local.y);
    }

    function bossRotorsDestroyed(u) {
      return !!u.bossParts && u.bossParts.rotors.every(part => part.hp <= 0);
    }

    function bossMissileAimPoint(u, missile) {
      if (!u || u.kind !== 'boss' || !u.bossParts || bossRotorsDestroyed(u)) return u;
      let best = null;
      u.bossParts.rotors.forEach((part, index) => {
        if (part.hp <= 0) return;
        const point = bossRotorWorldPoint(u, index);
        const distance = Math.hypot(point.x - missile.x, point.y - missile.y);
        if (!best || distance < best.distance) best = { ...point, distance };
      });
      return best || u;
    }

    function damageBossTarget(e, x, y, damage, sourceColor, isMissile = false) {
      if (e.kind !== 'boss' || !e.bossParts) return { hit: false, destroyed: false };
      const local = bossWorldToLocal(e, x, y);
      let closestRotor = null;
      e.bossParts.rotors.forEach((part, index) => {
        if (part.hp <= 0) return;
        const point = bossRotorLocalPoint(e, index);
        const distance = Math.hypot(local.x - point.x, local.y - point.y);
        if (!closestRotor || distance < closestRotor.distance) closestRotor = { part, index, point, distance };
      });

      if (closestRotor && closestRotor.distance <= BOSS_ROTOR_HIT_RADIUS) {
        closestRotor.part.hp = Math.max(0, closestRotor.part.hp - damage);
        e.hitFlash = Math.max(e.hitFlash || 0, 70);
        const worldPoint = bossRotorWorldPoint(e, closestRotor.index);
        burst(x, y, sourceColor, isMissile ? 8 : 5, isMissile ? 5 : 3, false);
        addText(worldPoint.x + rand(-10, 10), worldPoint.y - 12, `H${closestRotor.index + 1} -${damage}`, '#fbbf24', 620);
        if (closestRotor.part.hp <= 0) {
          closestRotor.part.hp = 0;
          closestRotor.part.stoppedAngle = rand(0, Math.PI * 2);
          addText(worldPoint.x - 22, worldPoint.y - 24, 'HÉLICE OFF', '#fb923c', 980);
          bigExplosion(worldPoint.x, worldPoint.y, 0.72, '#fb923c');
          if (bossRotorsDestroyed(e)) {
            e.bossParts.coreUnlocked = true;
            pushRadio('Comando', 'Hélices destruídas. Núcleo central vulnerável!');
            addText(e.x - 58, e.y + 12, 'NÚCLEO VULNERÁVEL', '#f0abfc', 1300);
          }
        }
        return { hit: true, destroyed: false };
      }

      const coreDistance = Math.hypot(local.x, local.y);
      if (coreDistance <= BOSS_CORE_HIT_RADIUS || Math.hypot(e.x - x, e.y - y) < e.radius * e.scale * 0.7) {
        if (!bossRotorsDestroyed(e)) {
          e.hitFlash = Math.max(e.hitFlash || 0, 42);
          addText(x + rand(-8, 8), y - 14, 'HÉLICES PRIMEIRO', '#93c5fd', 650);
          burst(x, y, '#93c5fd', 4, 2.6, false);
          return { hit: true, destroyed: false };
        }
        e.hp -= damage;
        e.hitFlash = Math.max(e.hitFlash || 0, 120);
        burst(x, y, sourceColor, isMissile ? 12 : 6, isMissile ? 6 : 3.6, false);
        addText(x + rand(-10, 10), y - 10, `NÚCLEO -${damage}`, '#f0abfc', 720);
        return { hit: true, destroyed: e.hp <= 0 };
      }

      return { hit: false, destroyed: false };
    }
    function updateBullets(dt, dtScale) {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dtScale; b.y += b.vy * dtScale; b.life -= dt;
        if (b.life <= 0 || b.x < -20 || b.x > WIDTH + 20 || b.y < -20 || b.y > HEIGHT + 20) { bullets.splice(i, 1); continue; }
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (e.kind === 'boss') {
            const bossHit = damageBossTarget(e, b.x, b.y, b.damage, b.drone ? '#a7f3d0' : '#67e8f9');
            if (bossHit.hit) {
              bullets.splice(i, 1);
              if (bossHit.destroyed) killEnemy(j);
              break;
            }
            continue;
          }
          if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius * e.scale * 0.7) {
            e.hp -= b.damage; e.hitFlash = 80;
            burst(b.x, b.y, b.drone ? '#a7f3d0' : '#67e8f9', b.drone ? 3 : 5, 3, false);
            // damage number
            addText(b.x + rand(-10,10), b.y - 10, `-${b.damage}`, b.drone ? '#a7f3d0' : '#fbbf24', 500);
            bullets.splice(i, 1);
            if (e.hp <= 0) killEnemy(j);
            break;
          }
        }
      }
    }

    function updateMissiles(dt, dtScale) {
      for (let i = missiles.length - 1; i >= 0; i--) {
        const m = missiles[i];
        const rawTarget = m.from === 'player' ? enemies.find(e => e.id === m.targetId) : player;
        const target = m.from === 'player' && rawTarget?.kind === 'boss' ? bossMissileAimPoint(rawTarget, m) : rawTarget;
        if (target) {
          const desired = angleTo(m, target);
          const current = Math.atan2(m.vy, m.vx);
          let delta = desired - current;
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          const next = current + clamp(delta, -m.turn * dtScale, m.turn * dtScale);
          const tracking = m.guaranteed ? 0.16 : 0.08;
          m.vx = lerp(m.vx, Math.cos(next)*m.speed, tracking);
          m.vy = lerp(m.vy, Math.sin(next)*m.speed, tracking);
        }
        m.x += m.vx * dtScale; m.y += m.vy * dtScale; m.life -= dt; m.smokeCd -= dt;
        if (m.smokeCd <= 0) {
          addParticle(m.x, m.y, rand(-0.45,0.45), rand(-0.45,0.45), rand(5,12), 'rgba(120,126,136,0.32)', 900, 'smoke');
          m.smokeCd = 40;
        }
        if (m.life <= 0 || m.x < -80 || m.x > WIDTH+80 || m.y < -80 || m.y > HEIGHT+80) { missiles.splice(i,1); continue; }
        if (m.from === 'player') {
          for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (e.kind === 'boss') {
              const bossHit = damageBossTarget(e, m.x, m.y, m.damage, '#38bdf8', true);
              if (bossHit.hit) {
                playSfx(SFX.missileImpact, 0.58);
                bigExplosion(m.x, m.y, 1.1, '#bae6fd');
                missiles.splice(i, 1);
                if (bossHit.destroyed) killEnemy(j);
                break;
              }
              continue;
            }
            const hitRadius = e.radius * e.scale * (m.guaranteed ? 1.42 : 0.75);
            if (Math.hypot(e.x - m.x, e.y - m.y) < hitRadius) {
              e.hp -= m.damage; e.hitFlash = 120;
              addText(m.x, m.y - 14, `-${m.damage}`, '#38bdf8', 700);
              playSfx(SFX.missileImpact, 0.58);
              bigExplosion(m.x, m.y, 1.1, '#bae6fd');
              missiles.splice(i, 1);
              if (e.hp <= 0) killEnemy(j);
              break;
            }
          }
        } else {
          if (Math.hypot(player.x - m.x, player.y - m.y) < player.radius + 12) {
            const dmg = m.damage;
            if (player.shield > 0) {
              player.shield -= dmg * 1.5;
              addText(player.x, player.y - 40, `ESCUDO -${dmg}`, '#a78bfa', 600);
              burst(m.x, m.y, '#a78bfa', 10, 5, false);
            } else if (player.inv <= 0) {
              player.hp -= dmg * (1 - HELI_UPGRADES.armorReduction / 100);
              player.inv = 420;
              bigExplosion(m.x, m.y, 1.25, '#fb7185');
            }
            missiles.splice(i, 1);
          }
        }
      }
    }

    function updateEnemyShots(dt, dtScale) {
      for (let i = enemyShots.length - 1; i >= 0; i--) {
        const s = enemyShots[i];
        s.x += s.vx * dtScale; s.y += s.vy * dtScale; s.life -= dt;
        if (s.life <= 0 || s.x < -20 || s.x > WIDTH+20 || s.y < -20 || s.y > HEIGHT+20) { enemyShots.splice(i,1); continue; }
        if (Math.hypot(player.x - s.x, player.y - s.y) < player.radius) {
          const dmg = s.damage;
          if (player.shield > 0) {
            player.shield -= dmg;
            addText(player.x, player.y - 40, `BLOQUEADO`, '#a78bfa', 500);
            burst(s.x, s.y, '#a78bfa', 6, 3, false);
          } else if (player.inv <= 0) {
            player.hp -= dmg * (1 - HELI_UPGRADES.armorReduction / 100);
            player.inv = 160;
            burst(s.x, s.y, s.kind === 'boss' ? '#e879f9' : '#fb7185', 8, 4, false);
            shake = Math.max(shake, 3);
          }
          enemyShots.splice(i, 1); continue;
        }
        for (const d of drones) {
          if (Math.hypot(d.x - s.x, d.y - s.y) < 16) {
            d.hp -= s.damage;
            burst(s.x, s.y, '#a7f3d0', 6, 3, false);
            enemyShots.splice(i, 1); break;
          }
        }
      }
    }

    function updateParticles(dt, dtScale) {
      particles.forEach(p => {
        p.x += p.vx * dtScale; p.y += p.vy * dtScale;
        p.vx *= p.type === 'smoke' ? 0.985 : 0.95;
        p.vy *= p.type === 'smoke' ? 0.985 : 0.95;
        if (p.type === 'debris') p.vy += 0.06 * dtScale;
        if (p.type === 'smoke') p.size += 0.06 * dtScale;
        p.rot += p.spin * dtScale; p.life -= dt;
      });
      particles = particles.filter(p => p.life > 0);
      texts.forEach(t => { t.y += t.vy * dtScale; t.life -= dt; });
      texts = texts.filter(t => t.life > 0);
      explosions.forEach(e => { e.r = lerp(e.r, e.maxR, 0.16); e.life -= dt; });
      explosions = explosions.filter(e => e.life > 0);
    }

    function updateShockwaves(dt, dtScale) {
      shockwaves.forEach(s => { s.r = lerp(s.r, s.maxR, 0.12); s.life -= dt; });
      shockwaves = shockwaves.filter(s => s.life > 0);
    }

    function fallingSoundFor(kind, isPlayer = false) {
      if (isPlayer) return SFX.aetherFalling;
      if (kind === 'boss') return SFX.enemyBossFalling;
      if (kind === 'elite' || kind === 'ace') return SFX.enemyEliteFalling;
      return SFX.enemyCommonFalling;
    }

    function startCrash(unit, isPlayer = false, now = performance.now()) {
      const kind = isPlayer ? 'player' : unit.kind;
      crashers.push({
        id: nextId++,
        isPlayer,
        kind,
        x: unit.x,
        y: unit.y,
        startX: unit.x,
        startY: unit.y,
        angle: unit.angle || (isPlayer ? -Math.PI / 2 : Math.PI / 2),
        scale: unit.scale || 1,
        spriteVariant: unit.spriteVariant || 0,
        life: 0,
        duration: 3000,
        finalX: unit.x + (isPlayer ? rand(-28, 28) : rand(-40, 40)),
        finalY: clamp(unit.y + (isPlayer ? -72 : 92), 42, HEIGHT - 42),
      });
      playSfx(fallingSoundFor(kind, isPlayer), isPlayer ? 0.78 : kind === 'boss' ? 0.82 : 0.7);
    }

    function startPlayerCrash(now) {
      if (playerCrash) return;
      playerCrash = true;
      player.hp = 0;
      player.shield = 0;
      stopAllLoops();
      bullets.length = 0;
      missiles.length = 0;
      enemyShots.length = 0;
      startCrash(player, true, now);
    }

    function updateCrashes(dt, dtScale, now) {
      for (let i = crashers.length - 1; i >= 0; i--) {
        const c = crashers[i];
        c.life += dt;
        const p = clamp(c.life / c.duration, 0, 1);
        c.x = lerp(c.startX, c.finalX, p);
        c.y = lerp(c.startY, c.finalY, p);
        if (c.kind !== 'boss') c.angle += 0.045 * dtScale * (c.isPlayer ? -1 : 1);
        if (Math.random() < 0.55) {
          addParticle(c.x + rand(-18, 18), c.y + rand(-16, 18), rand(-0.8, 0.8), rand(0.2, 1.4), rand(8, 18), 'rgba(45,48,54,0.42)', rand(900, 1700), 'smoke');
        }
        if (Math.random() < 0.24) {
          addParticle(c.x + rand(-14, 14), c.y + rand(-12, 16), rand(-0.5, 0.5), rand(-0.6, 0.4), rand(3, 8), pick(['#fb923c', '#facc15', '#ef4444']), rand(360, 720), 'spark');
        }
        if (p >= 1) finalizeCrash(i);
      }
    }

    function finalizeCrash(index) {
      const c = crashers[index];
      crashers.splice(index, 1);
      if (c.isPlayer) {
        aaaExplosion(c.x, c.y, 'elite');
        pendingResult = 'defeat';
        pendingResultAt = performance.now() + 900;
        ended = true;
        return;
      }

      aaaExplosion(c.x, c.y, c.kind);
      playSfx(c.kind === 'common' ? pick([SFX.explosionA, SFX.explosionB]) : SFX.explosionElite, c.kind === 'boss' ? 0.82 : 0.62);
      tryDropPowerup(c.x, c.y, c.kind);
      if (c.kind === 'boss') {
        bossDropPending = true;
        pushRadio('Comando', 'Boss abatido. Colete o núcleo antes de encerrar a operação.');
      }
    }

    // ─── KILL ENEMY ───────────────────────────────────────────────────────────
    function killEnemy(index) {
      const e = enemies[index];
      addText(e.x, e.y, e.kind === 'boss' ? '🔥 BOSS DOWN' : '+ HIT', '#fff7ad', 1100);
      aaaExplosion(e.x, e.y, e.kind);
      startCrash(e, false);

      // score & combo
      combo = Math.min(combo + 1, 16);
      comboTimer = 3200;
      bestCombo = Math.max(bestCombo, combo);
      const pts = ENEMY_STATS[e.kind].score * combo;
      score += pts;
      addText(e.x + rand(-20,20), e.y - 30, `+${pts}`, '#facc15', 900);
      totalKills++;

      enemies.splice(index, 1);
      if (lock.targetId === e.id) { lock.amount = 0; lock.locked = false; lock.targetId = null; }
    }

    // ─── DRAW ─────────────────────────────────────────────────────────────────
    function draw(now, dtScale) {
      ctx.save();
      const sx = shake > 0.1 ? rand(-shake, shake) : 0;
      const sy = shake > 0.1 ? rand(-shake, shake) : 0;
      ctx.translate(sx + camera.x, sy + camera.y);

      drawBackground(now);
      drawMines(now);
      enemies.forEach(e => drawHelicopter(e, false, now));
      drawCrashes(now);
      if (!playerCrash) {
        drawPlayerDamageTrail();
        drawHelicopter(player, true, now);
      }
      drawDrones();
      drawPowerups(now);
      drawProjectiles(now);
      drawParticles();
      drawShockwaves();
      drawExplosions();
      ctx.restore();

      drawHUDOverlay(now);

      if (flash > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.22, flash)})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
      }
    }

    function drawCrashes(now) {
      crashers.forEach(c => {
        const p = clamp(c.life / c.duration, 0, 1);
        const shrink = c.kind === 'boss' ? lerp(1, 0.72, p) : lerp(1, 0.48, p);
        const flicker = 0.88 + Math.sin(now / 90 + c.id) * 0.12;
        const unit = {
          id: c.id,
          kind: c.isPlayer ? 'common' : c.kind,
          x: c.x,
          y: c.y,
          angle: c.angle,
          scale: c.scale * shrink,
          spriteVariant: c.spriteVariant,
          hp: 1,
          maxHp: 0,
          radius: 1,
          hitFlash: 0,
        };
        ctx.save();
        ctx.globalAlpha = lerp(1, 0.72, p) * flicker;
        drawHelicopter(unit, c.isPlayer, now);
        ctx.restore();
      });
    }

    function drawBackground(now) {
      if (hasBg) {
        const imgRatio = bg.width / bg.height, cr = WIDTH / HEIGHT;
        let dw = WIDTH, dh = HEIGHT;
        if (imgRatio > cr) dw = HEIGHT * imgRatio; else dh = WIDTH / imgRatio;
        ctx.drawImage(bg, (WIDTH-dw)/2, (HEIGHT-dh)/2, dw, dh);
        return;
      }
      ctx.fillStyle = '#020617';
      ctx.fillRect(-30, -30, WIDTH + 60, HEIGHT + 60);
    }

    function drawTerrain() {
      terrain.forEach(layer => {
        ctx.beginPath();
        const pts = layer.pts;
        ctx.moveTo(pts[0].x, layer.yBase);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length-1].x, layer.yBase + 60);
        ctx.lineTo(pts[0].x, layer.yBase + 60);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });
    }

    function drawClouds(layerWanted) {
      clouds.forEach(c => {
        if ((layerWanted === 0 && c.layer === 2) || (layerWanted === 2 && c.layer !== 2)) return;
        ctx.fillStyle = `rgba(220,235,255,${c.alpha})`;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w, c.h, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawBoundary() {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, HEIGHT/2 - 2, WIDTH, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, HEIGHT/2 - 1, WIDTH, 1);
      if (SHOW_GAMEPLAY_TEXT) {
        ctx.font = '800 10px ui-monospace, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('SETOR HOSTIL', 22, 30);
        ctx.fillText('ZONA DE ELYSIUM', 22, HEIGHT - 22);
      }
    }

    function drawMines(now) {
      mines.forEach(m => {
        const armed = m.armed <= 0;
        const pulse = 0.5 + 0.5 * Math.sin(now * (armed ? 0.018 : 0.006));
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.globalAlpha = 0.85 + pulse * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        ctx.fillStyle = armed ? `rgba(251,191,36,${0.7+pulse*0.3})` : 'rgba(148,163,184,0.5)';
        ctx.fill();
        ctx.strokeStyle = armed ? '#fcd34d' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // spikes
        for (let s = 0; s < 8; s++) {
          const a = s * Math.PI / 4 + now * 0.001;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a)*m.r, Math.sin(a)*m.r);
          ctx.lineTo(Math.cos(a)*(m.r+5), Math.sin(a)*(m.r+5));
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    function drawDrones() {
      drones.forEach(d => {
        if (hasDroneBody) {
          drawAetherDrone(d, performance.now());
          return;
        }
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.fillStyle = '#a7f3d0';
        ctx.beginPath();
        ctx.moveTo(0,-10); ctx.lineTo(14,8); ctx.lineTo(0,3); ctx.lineTo(-14,8); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(167,243,208,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // health bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-16, 12, 32, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(-16, 12, 32 * clamp(d.hp/90,0,1), 4);
        ctx.restore();
      });
    }

    function drawAetherDrone(d, now) {
      const bodyRenderW = 48;
      const bodyRenderH = droneBody.naturalWidth && droneBody.naturalHeight
        ? bodyRenderW * (droneBody.naturalHeight / droneBody.naturalWidth)
        : 43;
      const rotorRenderW = 14;
      const rotorRenderH = droneRotor.naturalWidth && droneRotor.naturalHeight
        ? rotorRenderW * (droneRotor.naturalHeight / droneRotor.naturalWidth)
        : rotorRenderW;
      const rotorPoints = [
        { x: 0.10, y: 0.115, spin: 1 },
        { x: 0.902, y: 0.115, spin: -1 },
        { x: 0.092, y: 0.878, spin: -1 },
        { x: 0.902, y: 0.873, spin: 1 },
      ];

      ctx.save();
      ctx.translate(d.x, d.y);

      ctx.drawImage(droneBody, -bodyRenderW / 2, -bodyRenderH / 2, bodyRenderW, bodyRenderH);

      if (hasDroneRotor) {
        rotorPoints.forEach(point => {
          const rx = (point.x - 0.5) * bodyRenderW;
          const ry = (point.y - 0.5) * bodyRenderH;
          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate((now / 20) * point.spin);
          ctx.globalAlpha = 0.98;
          ctx.drawImage(droneRotor, -rotorRenderW / 2, -rotorRenderH / 2, rotorRenderW, rotorRenderH);
          ctx.restore();
        });
      }

      ctx.fillStyle = 'rgba(0,0,0,0.58)';
      ctx.fillRect(-16, bodyRenderH / 2 + 4, 32, 3);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-16, bodyRenderH / 2 + 4, 32 * clamp(d.hp / 90, 0, 1), 3);
      ctx.restore();
    }

    function drawPlayerDamageTrail() {
      const hpPct = player.hp / player.maxHp;
      if (hpPct > 0.65) return;
      const amount = hpPct < 0.25 ? 4 : 1;
      for (let i = 0; i < amount; i++) {
        addParticle(player.x + rand(-16,16), player.y + rand(8,18), rand(-0.4,0.4), rand(0.5,1.4), rand(4,10),
          hpPct < 0.25 ? 'rgba(251,146,60,0.5)' : 'rgba(100,116,139,0.32)', 420, hpPct < 0.25 ? 'spark' : 'smoke');
      }
    }

    // ─── HELICOPTER DRAW (detailed) ────────────────────────────────────────────
    function altitudeScaleFor(u, now, isPlayer = false) {
      const phase = (u.id || 0) * 1.31 + (isPlayer ? 0.8 : 0);
      const slow = Math.sin(now / (isPlayer ? 1550 : u.kind === 'boss' ? 2100 : 1700) + phase) * (isPlayer ? 0.012 : u.kind === 'boss' ? 0.007 : 0.01);
      const secondary = Math.sin(now / 2700 + phase * 0.73) * 0.004;
      return 1 + slow + secondary;
    }

    function drawHelicopter(u, isPlayer, now) {
      if (isPlayer && (hasAetherBody || hasAetherRotor)) {
        drawAetherHelicopter(u, now);
        return;
      }
      if (!isPlayer && u.kind === 'common') {
        const body = enemyCommonBodies[u.spriteVariant % enemyCommonBodies.length] || enemyCommonBodies[0];
        drawEnemySpriteHelicopter(u, now, body, 126, 130, 0.44);
        return;
      }
      if (!isPlayer && u.kind === 'elite') {
        drawEnemySpriteHelicopter(u, now, hasEnemyEliteBody ? enemyEliteBody : enemyCommonBodies[0], 154, 158, 0.43);
        return;
      }
      if (!isPlayer && u.kind === 'ace') {
        drawEnemySpriteHelicopter(u, now, hasEnemyEliteBody ? enemyEliteBody : enemyCommonBodies[2], 166, 170, 0.43);
        return;
      }
      if (!isPlayer && u.kind === 'boss') {
        drawEnemyBossHelicopter(u, now);
        return;
      }

      const hpPct = u.hp !== undefined && u.maxHp ? clamp(u.hp/u.maxHp,0,1) : 1;
      const color = isPlayer ? '#38bdf8' : (u.kind==='boss'?'#c084fc':u.kind==='elite'?'#f59e0b':u.kind==='ace'?'#fb7185':'#f43f5e');
      const dark = isPlayer ? '#075985' : (u.kind==='boss'?'#581c87':'#881337');
      const cockpit = isPlayer ? '#bae6fd' : '#fecdd3';
      const scale = u.scale || 1;

      ctx.save();
      ctx.translate(u.x, u.y);
      ctx.scale(scale, scale);
      ctx.rotate(u.angle);

      // ─ Tail boom
      ctx.fillStyle = dark;
      ctx.fillRect(-44, -3, 24, 6);
      // tail rotor
      const trSpin = now / 22;
      ctx.save();
      ctx.translate(-44, 0);
      ctx.rotate(trSpin);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0,-10); ctx.lineTo(0,10);
      ctx.moveTo(-10,0); ctx.lineTo(10,0);
      ctx.stroke();
      ctx.restore();

      // ─ Main rotor disc
      const spin = now / 36;
      ctx.save();
      ctx.rotate(spin);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.ellipse(0, 0, 46, 8, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 46, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.42)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-43,0); ctx.lineTo(43,0);
      ctx.moveTo(0,-43); ctx.lineTo(0,43);
      ctx.stroke();
      // Blade tips
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(43,0,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-43,0,4,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // ─ Fuselage body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, isPlayer ? 26 : 28, isPlayer ? 13 : 14, 0, 0, Math.PI*2);
      ctx.fill();

      // ─ Cockpit bump
      ctx.fillStyle = dark;
      ctx.fillRect(-10, -9, 26, 18);
      ctx.fillStyle = cockpit;
      ctx.beginPath();
      ctx.arc(8, 0, 9, -Math.PI*0.65, Math.PI*0.65);
      ctx.closePath();
      ctx.fill();
      // Cockpit reflection
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.ellipse(10, -3, 4, 3, -0.4, 0, Math.PI*2); ctx.fill();

      // ─ Nose
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(22, -5); ctx.lineTo(36, 0); ctx.lineTo(22, 5); ctx.closePath();
      ctx.fill();

      // ─ Skids
      ctx.strokeStyle = dark;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18,13); ctx.lineTo(20,13);
      ctx.moveTo(-18,-13); ctx.lineTo(20,-13);
      ctx.moveTo(-10,13); ctx.lineTo(-10,-13);
      ctx.moveTo(12,13); ctx.lineTo(12,-13);
      ctx.stroke();

      // ─ Weapon pods
      if (!isPlayer) {
        ctx.fillStyle = dark;
        ctx.fillRect(-8, 14, 18, 7);
        ctx.fillRect(-8, -21, 18, 7);
      } else {
        // Gun barrel
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(22, -2, 16, 4);
      }

      // ─ Damage smoke holes
      if (hpPct < 0.55) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.arc(-5, 4, 5, 0, Math.PI*2); ctx.fill();
      }
      if (hpPct < 0.28) {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.moveTo(-20,10); ctx.lineTo(-10,22); ctx.lineTo(-4,8); ctx.fill();
      }

      ctx.restore();

      // Shield bubble
      if (isPlayer && player.shield > 0) {
        const alpha = clamp(player.shield / player.shieldMax, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 42, 0, Math.PI*2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      drawHealthBar(u, isPlayer);
    }

    function drawAetherHelicopter(u, now) {
      const hpPct = u.hp !== undefined && u.maxHp ? clamp(u.hp/u.maxHp,0,1) : 1;
      const bodyRenderH = 196;
      const bodyRenderW = bodyRenderH * (796 / 1488);
      const bodyHubX = 0.5;
      const bodyHubY = 616 / 1488;
      const rotorRenderW = 224;
      const rotorRenderH = aetherRotor.naturalWidth && aetherRotor.naturalHeight
        ? rotorRenderW * (aetherRotor.naturalHeight / aetherRotor.naturalWidth)
        : rotorRenderW;
      const rotation = u.angle + Math.PI / 2;

      ctx.save();
      ctx.translate(u.x, u.y);
      const altitudeScale = altitudeScaleFor(u, now, true);
      ctx.scale(altitudeScale, altitudeScale);
      ctx.rotate(rotation);

      if (hasAetherBody) {
        ctx.drawImage(
          aetherBody,
          -bodyRenderW * bodyHubX,
          -bodyRenderH * bodyHubY,
          bodyRenderW,
          bodyRenderH
        );
      }

      if (hpPct < 0.55) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.arc(-6, 9, 5, 0, Math.PI*2); ctx.fill();
      }
      if (hpPct < 0.28) {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.moveTo(-20,12); ctx.lineTo(-11,25); ctx.lineTo(-4,10); ctx.fill();
      }

      if (hasAetherRotor) {
        ctx.save();
        ctx.rotate(now / 26);
        ctx.globalAlpha = 0.98;
        ctx.drawImage(aetherRotor, -rotorRenderW / 2, -rotorRenderH / 2, rotorRenderW, rotorRenderH);
        ctx.restore();
      }

      ctx.restore();

      if (player.shield > 0) {
        const alpha = clamp(player.shield / player.shieldMax, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 46, 0, Math.PI*2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      drawHealthBar(u, true);
    }

    function drawEnemySpriteHelicopter(u, now, body, bodyRenderH, rotorRenderW, bodyHubY) {
      const hpPct = u.hp !== undefined && u.maxHp ? clamp(u.hp/u.maxHp,0,1) : 1;
      const bodyRenderW = body.loaded && body.naturalHeight
        ? bodyRenderH * (body.naturalWidth / body.naturalHeight)
        : 60;
      const bodyHubX = 0.5;
      const rotorRenderH = enemyCommonRotor.naturalHeight && enemyCommonRotor.naturalWidth
        ? rotorRenderW * (enemyCommonRotor.naturalHeight / enemyCommonRotor.naturalWidth)
        : 130;
      const rotation = u.angle - Math.PI / 2;

      ctx.save();
      ctx.translate(u.x, u.y);
      const altitudeScale = altitudeScaleFor(u, now, false);
      ctx.scale((u.scale || 1) * altitudeScale, (u.scale || 1) * altitudeScale);
      ctx.rotate(rotation);

      if (body.loaded) {
        ctx.drawImage(
          body,
          -bodyRenderW * bodyHubX,
          -bodyRenderH * bodyHubY,
          bodyRenderW,
          bodyRenderH
        );
      }

      if (hpPct < 0.55) {
        ctx.fillStyle = 'rgba(0,0,0,0.54)';
        ctx.beginPath(); ctx.arc(-7, 9, 5, 0, Math.PI*2); ctx.fill();
      }
      if (hpPct < 0.28) {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.moveTo(13, 18); ctx.lineTo(22, 33); ctx.lineTo(29, 15); ctx.fill();
      }

      if (hasEnemyCommonRotor) {
        ctx.save();
        ctx.rotate(now / 23);
        ctx.globalAlpha = 0.98;
        ctx.drawImage(enemyCommonRotor, -rotorRenderW / 2, -rotorRenderH / 2, rotorRenderW, rotorRenderH);
        ctx.restore();
      }

      ctx.restore();
      drawHealthBar(u, false);
    }

    function drawBossPartBars(u) {
      if (!u.bossParts) return;
      u.bossParts.rotors.forEach((part, index) => {
        const point = bossRotorWorldPoint(u, index);
        const pct = clamp(part.hp / part.maxHp, 0, 1);
        const w = 48;
        const y = point.y - 31;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.68)';
        ctx.fillRect(point.x - w / 2 - 1, y - 1, w + 2, 7);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(point.x - w / 2, y, w, 5);
        ctx.fillStyle = pct > 0.5 ? '#facc15' : pct > 0.18 ? '#fb923c' : '#ef4444';
        ctx.fillRect(point.x - w / 2, y, w * pct, 5);
        ctx.fillStyle = part.hp <= 0 ? '#fb923c' : '#fff7ad';
        ctx.font = '700 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(part.hp <= 0 ? 'OFF' : `H${index + 1}`, point.x, y - 4);
        ctx.textAlign = 'left';
        ctx.restore();
      });

      const coreUnlocked = bossRotorsDestroyed(u);
      ctx.save();
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = coreUnlocked ? '#f0abfc' : 'rgba(186,230,253,0.78)';
      ctx.fillText(coreUnlocked ? 'NÚCLEO VULNERÁVEL' : 'NÚCLEO BLOQUEADO', u.x, u.y + 58);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    function drawBossRotorDamage(u, rotorIndex, rx, ry, now) {
      const part = u.bossParts?.rotors?.[rotorIndex];
      if (!part || part.hp > 0) return;
      const phase = now / 170 + rotorIndex * 1.73;
      const pulse = 0.78 + Math.sin(phase) * 0.18;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 5; i++) {
        const drift = (now / (38 + i * 11) + rotorIndex * 17 + i * 9) % 28;
        const sx = rx - 14 + Math.sin(phase + i) * 10 + i * 5;
        const sy = ry - 8 - drift;
        const size = (14 + i * 4) * (0.75 + pulse * 0.25);
        ctx.globalAlpha = Math.max(0, 0.34 - i * 0.035 - drift / 105);
        ctx.fillStyle = i < 2 ? 'rgba(20,24,31,0.82)' : 'rgba(83,92,104,0.58)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, size * 1.15, size * 0.72, Math.sin(phase + i) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.9;
      const flameX = rx + 11 + Math.sin(phase * 1.4) * 4;
      const flameY = ry + 15;
      const flameH = 30 + pulse * 12;
      const flameW = 15 + pulse * 7;
      const flame = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY + 8, flameH);
      flame.addColorStop(0, 'rgba(255,255,235,0.95)');
      flame.addColorStop(0.28, 'rgba(251,191,36,0.86)');
      flame.addColorStop(0.62, 'rgba(251,113,20,0.58)');
      flame.addColorStop(1, 'rgba(127,29,29,0)');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(flameX - flameW * 0.55, flameY + 4);
      ctx.quadraticCurveTo(flameX - flameW, flameY + flameH * 0.42, flameX - 2, flameY + flameH);
      ctx.quadraticCurveTo(flameX + flameW * 0.9, flameY + flameH * 0.35, flameX + flameW * 0.52, flameY + 1);
      ctx.quadraticCurveTo(flameX + 2, flameY + 11, flameX - flameW * 0.55, flameY + 4);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = 'rgba(7,10,16,0.78)';
      ctx.beginPath();
      ctx.arc(rx - 3, ry + 4, 17 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    function drawEnemyBossHelicopter(u, now) {
      const hpPct = u.hp !== undefined && u.maxHp ? clamp(u.hp/u.maxHp,0,1) : 1;
      const body = hasEnemyBossBody ? enemyBossBody : enemyCommonBodies[2];
      const layout = getBossRotorLayout(u);
      const bodyRenderH = layout.bodyRenderH;
      const bodyRenderW = layout.bodyRenderW;
      const bodyHubX = layout.bodyHubX;
      const bodyHubY = layout.bodyHubY;
      const rotorRenderW = 78;
      const rotorRenderH = enemyCommonRotor.naturalHeight && enemyCommonRotor.naturalWidth
        ? rotorRenderW * (enemyCommonRotor.naturalHeight / enemyCommonRotor.naturalWidth)
        : 78;
      const rotation = u.angle - Math.PI / 2;
      const rotorPoints = layout.rotorPoints;

      ctx.save();
      ctx.translate(u.x, u.y);
      const altitudeScale = altitudeScaleFor(u, now, false);
      ctx.scale((u.scale || 1) * altitudeScale, (u.scale || 1) * altitudeScale);
      ctx.rotate(rotation);

      if (body.loaded) {
        ctx.drawImage(
          body,
          -bodyRenderW * bodyHubX,
          -bodyRenderH * bodyHubY,
          bodyRenderW,
          bodyRenderH
        );
      }

      if (hpPct < 0.55) {
        ctx.fillStyle = 'rgba(0,0,0,0.54)';
        ctx.beginPath(); ctx.arc(-11, 18, 8, 0, Math.PI*2); ctx.fill();
      }
      if (hpPct < 0.28) {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.moveTo(22, 34); ctx.lineTo(34, 55); ctx.lineTo(44, 29); ctx.fill();
      }

      if (hasEnemyCommonRotor) {
        rotorPoints.forEach((point, index) => {
          const rx = (point.x - bodyHubX) * bodyRenderW;
          const ry = (point.y - bodyHubY) * bodyRenderH;
          const rotorHp = u.bossParts?.rotors?.[index]?.hp ?? 1;
          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate(rotorHp <= 0 ? (u.bossParts?.rotors?.[index]?.stoppedAngle || 0) : (now / 22) * point.spin);
          ctx.globalAlpha = rotorHp <= 0 ? 0.84 : 0.96;
          ctx.drawImage(enemyCommonRotor, -rotorRenderW / 2, -rotorRenderH / 2, rotorRenderW, rotorRenderH);
          ctx.restore();
          drawBossRotorDamage(u, index, rx, ry, now);
        });
      }

      if (u.bossParts && !bossRotorsDestroyed(u)) {
        ctx.save();
        ctx.strokeStyle = 'rgba(147,197,253,0.72)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, BOSS_CORE_HIT_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
      drawBossPartBars(u);
      drawHealthBar(u, false);
    }

    function drawHealthBar(u, isPlayer) {
      if (!u.maxHp) return;
      const w = isPlayer ? 58 : (u.kind === 'boss' ? 150 : 74);
      const y = isPlayer ? u.y + 40 : u.y - (u.kind === 'boss' ? 82 : 50);
      // bg
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(u.x - w/2 - 1, y - 1, w + 2, 8);
      // track
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(u.x - w/2, y, w, 6);
      // fill
      const pct = clamp(u.hp / u.maxHp, 0, 1);
      const barColor = isPlayer ? (pct > 0.5 ? '#38bdf8' : pct > 0.25 ? '#fbbf24' : '#f43f5e') :
                       (u.kind === 'boss' ? '#c084fc' : u.kind === 'elite' ? '#f59e0b' : '#f43f5e');
      ctx.fillStyle = barColor;
      ctx.fillRect(u.x - w/2, y, w * pct, 6);
      // shine
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(u.x - w/2, y, w * pct, 2);
    }

    function drawPowerups(now) {
      const icons = { hp: '❤', missile: '🚀', shield: '🛡', drone: '◆', bossDrop: '✦' };
      const colors = { hp: '#4ade80', missile: '#60a5fa', shield: '#a78bfa', drone: '#a7f3d0', bossDrop: '#f0abfc' };
      powerups.forEach(p => {
        const bob = Math.sin(p.bob) * 5;
        const radius = p.type === 'bossDrop' ? 26 : 16;
        const glowRadius = p.type === 'bossDrop' ? 38 : 22;
        ctx.save();
        ctx.translate(p.x, p.y + bob);
        // glow
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        g.addColorStop(0, colors[p.type] + '44');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, glowRadius, 0, Math.PI*2); ctx.fill();
        // ring
        ctx.strokeStyle = colors[p.type];
        ctx.lineWidth = p.type === 'bossDrop' ? 3 : 2;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.stroke();
        if (p.type === 'bossDrop') {
          ctx.rotate(now / 420);
          ctx.strokeStyle = 'rgba(255,255,255,0.72)';
          ctx.beginPath();
          ctx.moveTo(0, -34);
          ctx.lineTo(0, -24);
          ctx.moveTo(0, 24);
          ctx.lineTo(0, 34);
          ctx.moveTo(-34, 0);
          ctx.lineTo(-24, 0);
          ctx.moveTo(24, 0);
          ctx.lineTo(34, 0);
          ctx.stroke();
          ctx.rotate(-now / 420);
        }
        // icon
        ctx.font = p.type === 'bossDrop' ? '24px serif' : '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icons[p.type], 0, 1);
        ctx.restore();
      });
    }

    function drawProjectiles(now) {
      bullets.forEach(b => {
        const a = Math.atan2(b.vy, b.vx);
        ctx.save();
        // Glow
        ctx.shadowColor = b.drone ? '#a7f3d0' : '#38bdf8';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = b.drone ? '#a7f3d0' : '#bae6fd';
        ctx.lineWidth = b.drone ? 1.5 : 2.4;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - Math.cos(a)*18, b.y - Math.sin(a)*18);
        ctx.stroke();
        ctx.restore();
      });
      enemyShots.forEach(s => {
        const a = Math.atan2(s.vy, s.vx);
        ctx.save();
        ctx.shadowColor = s.kind === 'boss' ? '#e879f9' : '#fb7185';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = s.kind === 'boss' ? '#e879f9' : '#fb7185';
        ctx.lineWidth = s.kind === 'boss' ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(a)*18, s.y - Math.sin(a)*18);
        ctx.stroke();
        ctx.fillStyle = s.kind === 'boss' ? '#f0abfc' : '#fecdd3';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.kind === 'boss' ? 4.5 : 3.2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });
      missiles.forEach(m => {
        const a = Math.atan2(m.vy, m.vx);
        ctx.save();
        ctx.translate(m.x, m.y);
        const useAetherMissileSprite = m.from === 'player' && hasAetherMissile;
        ctx.rotate(useAetherMissileSprite ? a + Math.PI / 2 : a);
        ctx.shadowColor = m.from === 'player' ? '#38bdf8' : '#fb7185';
        ctx.shadowBlur = 8;
        if (useAetherMissileSprite) {
          const missileW = 18;
          const missileH = aetherMissile.naturalWidth && aetherMissile.naturalHeight
            ? missileW * (aetherMissile.naturalHeight / aetherMissile.naturalWidth)
            : 16;
          ctx.drawImage(aetherMissile, -missileW / 2, -missileH / 2, missileW, missileH);
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.moveTo(0, missileH / 2 - 3);
          ctx.lineTo(-6, missileH / 2 + 13);
          ctx.lineTo(0, missileH / 2 + 8);
          ctx.lineTo(6, missileH / 2 + 13);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = m.from === 'player' ? '#e0f2fe' : '#fecdd3';
          ctx.fillRect(-11,-3,22,6);
          ctx.fillStyle = m.from === 'player' ? '#38bdf8' : '#fb7185';
          ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(2,-6); ctx.lineTo(2,6); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fb923c';
          ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-24,-5); ctx.lineTo(-19,0); ctx.lineTo(-24,5); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      });
    }

    function drawParticles() {
      particles.forEach(p => {
        const alpha = clamp(p.life/p.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = p.type === 'smoke' ? alpha * 0.5 : alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.type === 'spark' || p.type === 'debris') ctx.fillRect(-p.size, -p.size*0.25, p.size*2, p.size*0.5);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      });
    }

    function drawShockwaves() {
      shockwaves.forEach(s => {
        const alpha = clamp(s.life / s.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha * 0.35;
        ctx.strokeStyle = s.color || 'rgba(255,255,255,0.8)';
        ctx.lineWidth = (s.width || 3) * alpha;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      });
    }

    function drawExplosions() {
      explosions.forEach(e => {
        const alpha = clamp(e.life/e.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r*0.55, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 3 * alpha;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI*2); ctx.stroke();
        if (!e.ring) {
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 7 * alpha;
          ctx.beginPath(); ctx.arc(e.x, e.y, e.r*1.42, 0, Math.PI*2); ctx.stroke();
        }
        ctx.restore();
      });
      texts.forEach(t => {
        const alpha = clamp(t.life/t.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '900 13px ui-monospace, monospace';
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });
    }

    function drawHUDOverlay(now) {
      // Lock indicator
      const target = enemies.find(e => e.id === lock.targetId);
      if (target) {
        const r = target.radius * target.scale + 22;
        ctx.save();
        ctx.translate(target.x + camera.x, target.y + camera.y);
        // animated bracket corners
        const c1 = lock.locked ? '#22c55e' : '#fde68a';
        ctx.strokeStyle = c1;
        ctx.lineWidth = 2.5;
        const bs = 14; // bracket size
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx2,sy2]) => {
          ctx.beginPath();
          ctx.moveTo(sx2*r, sy2*r + sy2*bs);
          ctx.lineTo(sx2*r, sy2*r);
          ctx.lineTo(sx2*r + sx2*bs, sy2*r);
          ctx.stroke();
        });
        // Lock ring
        ctx.strokeStyle = lock.locked ? '#bbf7d0' : '#fef3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r + 8, -Math.PI/2, -Math.PI/2 + Math.PI*2*lock.amount);
        ctx.stroke();
        if (SHOW_GAMEPLAY_TEXT) {
          ctx.font = '900 15px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = lock.locked ? '#bbf7d0' : '#fde68a';
          ctx.fillText(lock.locked ? '✦ LOCKED ✦' : 'LOCK', 0, -r - 14);
        }
        ctx.restore();
      }

      // Crosshair
      ctx.save();
      ctx.strokeStyle = 'rgba(226,232,240,0.7)';
      ctx.lineWidth = 1.5;
      const mx = mouse.x, my = mouse.y;
      ctx.beginPath();
      ctx.moveTo(mx-14,my); ctx.lineTo(mx-5,my);
      ctx.moveTo(mx+5,my); ctx.lineTo(mx+14,my);
      ctx.moveTo(mx,my-14); ctx.lineTo(mx,my-5);
      ctx.moveTo(mx,my+5); ctx.lineTo(mx,my+14);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
      ctx.restore();

      // In-game turbo bar
      if (player) {
        ctx.save();
        const tbx = 20, tby = HEIGHT - 18, tbw = 80;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(tbx - 1, tby - 8, tbw + 2, 7);
        const tpct = player.turbo / 100;
        ctx.fillStyle = tpct > 0.5 ? '#38bdf8' : tpct > 0.2 ? '#fbbf24' : '#f43f5e';
        ctx.fillRect(tbx, tby - 7, tbw * tpct, 5);
        ctx.restore();
      }

      // Combo flash text in center
      if (SHOW_GAMEPLAY_TEXT && combo >= 3) {
        const alpha = Math.min(1, comboTimer / 600);
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.font = `900 ${20 + combo * 1.5}px ui-monospace, monospace`;
        ctx.fillStyle = combo >= 8 ? '#fb923c' : '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText(`✦ ${combo}x COMBO ✦`, WIDTH/2, 60);
        ctx.restore();
      }

      // Radio messages
      if (SHOW_GAMEPLAY_TEXT) {
        let ry = 18;
        radio.forEach(r => {
          ctx.save();
          ctx.globalAlpha = clamp(r.life/700, 0, 1);
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(WIDTH - 390, ry, 370, 34);
          ctx.font = '900 10px ui-monospace, monospace';
          ctx.fillStyle = '#bae6fd';
          ctx.fillText(r.who.toUpperCase(), WIDTH - 378, ry + 13);
          ctx.font = '700 12px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.88)';
          ctx.fillText(r.msg, WIDTH - 378, ry + 28);
          ctx.restore();
          ry += 40;
        });
      }
    }

    // ─── RESULT ───────────────────────────────────────────────────────────────
    function showResult(result) {
      lastResult = result;
      stopAllLoops();
      if (result === 'victory') {
        onVictoryRef.current();
        return;
      }
      resultTitle.textContent = 'Derrota';
      resultTitle.style.color = '#fda4af';
      resultText.textContent = 'A força aérea de Elysium recuou para reorganização.';
      finalScore.textContent = score.toLocaleString();
      finalCombo.textContent = `x${bestCombo}`;
      finalKills.textContent = totalKills;
      overlay.classList.add('show');
    }

    // ─── GAME LOOP ────────────────────────────────────────────────────────────
    function loop(now) {
      const dt = Math.min(34, now - last);
      last = now;
      const dtScale = dt / 16.67;
      update(dt, dtScale, now);
      draw(now, dtScale);

      hpEl.textContent = Math.max(0, Math.ceil(player.hp));
      shieldEl.textContent = player.shield > 0 ? `${Math.ceil(clamp(player.shield/player.shieldMax,0,1)*100)}%` : '—';
      shieldPill.style.borderColor = player.shield > 0 ? 'rgba(167,139,250,0.5)' : '';
      turboEl.textContent = `${Math.ceil(player.turbo)}%`;
      targetsEl.textContent = Math.max(0, TOTAL_WAVES - waveIndex);
      waveEl.textContent = `${Math.min(TOTAL_WAVES, waveIndex + 1)}/${TOTAL_WAVES}`;
      kindEl.textContent = enemies[0] ? ENEMY_STATS[enemies[0].kind].label : '-';
      missileEl.textContent = player.missiles;
      scoreEl.textContent = score.toLocaleString();
      comboEl.textContent = `x${combo}`;
      comboPill.style.opacity = combo >= 2 ? '1' : '0.5';

      if (pendingResult && now >= pendingResultAt) { showResult(pendingResult); return; }
      raf = requestAnimationFrame(loop);
    }

    // ─── INPUT ────────────────────────────────────────────────────────────────
    function updateMouse(event) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * WIDTH;
      mouse.y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    }
    const movKeys = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' ']);
    function setInputKey(key, active) {
      const k = key.toLowerCase();
      if (!movKeys.has(k)) return;
      keys[k] = true;
      if (!active) {
        keys[k] = false;
        return;
      }
      if (k === ' ') { firePlayerMissile(); keys[' '] = false; }
    }
    const listenerController = new AbortController();
    const listenerOptions = { signal: listenerController.signal };

    window.addEventListener('keydown', ev => {
      const k = ev.key.toLowerCase();
      if (movKeys.has(k)) ev.preventDefault();
      setInputKey(k, true);
    }, listenerOptions);
    window.addEventListener('keyup', ev => {
      const k = ev.key.toLowerCase();
      if (movKeys.has(k)) ev.preventDefault();
      setInputKey(k, false);
    }, listenerOptions);
    canvas.addEventListener('mousemove', updateMouse, listenerOptions);
    canvas.addEventListener('mousedown', ev => {
      ev.preventDefault(); canvas.focus(); updateMouse(ev);
      if (ev.button === 2) firePlayerMissile();
      else mouse.down = true;
    }, listenerOptions);
    window.addEventListener('mouseup', () => { mouse.down = false; }, listenerOptions);
    canvas.addEventListener('contextmenu', ev => ev.preventDefault(), listenerOptions);
    restart.addEventListener('click', () => {
      if (lastResult) {
        onDefeatRef.current();
        return;
      }
      reset();
    }, listenerOptions);

    reset();

    return () => {
      listenerController.abort();
      cancelAnimationFrame(raf);
      stopAllLoops();
    };
  }, [armorReduction, background, continueLabel, gunDamageBonus, initialDrones, missileDamageBonus, speedBonus, startingMissiles]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/96 p-2 text-slate-100">
      <main className="flex h-[98vh] w-full max-w-[98vw] flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950 shadow-[0_0_42px_rgba(0,0,0,0.64)]">
        <header className="flex min-h-[68px] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-black/50 px-4 py-2">
          <div className="min-w-0">
            <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.34em] text-cyan-100/75">QCH / Nova Terra / {colonyName}</p>
            <h1 className="truncate text-[clamp(16px,2vw,24px)] font-black uppercase tracking-[0.08em] text-white">{title}</h1>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em]">
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center">HP <span id="playerHp">500</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center" id="shieldPill">Escudo <span id="shieldLabel">-</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center">Turbo <span id="turboLabel">100%</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center">Alvos <span id="targetsLeft">10</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center">Onda <span id="waveLabel">1/10</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center">Tipo <span id="enemyKind">COMUM</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1.5 text-center">Missil <span id="missileLabel">2</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-yellow-300/40 bg-yellow-300/10 px-2.5 py-1.5 text-center">Score <span id="scoreLabel">0</span></div>
            <div className="min-w-[82px] rounded-[10px] border border-orange-400/50 bg-orange-400/10 px-2.5 py-1.5 text-center text-orange-400" id="comboPill">Combo <span id="comboLabel">x1</span></div>
          </div>
          <PremiumCanvasButton
            type="button"
            onClick={onClose}
            tone="steel"
            className="h-10 w-10 shrink-0 rounded-full border border-cyan-300/25 bg-black/40 text-cyan-100 hover:bg-cyan-300/10"
            aria-label={language === 'pt' ? 'Fechar batalha' : 'Close battle'}
          >
            <X className="h-5 w-5" />
          </PremiumCanvasButton>
        </header>

        <section className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
          <canvas id="battle" width={1280} height={720} className="block h-full max-h-full max-w-full cursor-crosshair" />
          <div className="absolute inset-0 hidden items-center justify-center bg-black/75 p-6 [&.show]:flex" id="overlay">
            <div className="w-[min(580px,100%)] rounded-[20px] border border-white/15 bg-slate-950/95 p-8 text-center shadow-[0_0_40px_rgba(255,255,255,0.08)]">
              <h2 id="resultTitle" className="m-0 text-5xl font-black uppercase tracking-[0.08em]">Derrota</h2>
              <p id="resultText" className="mx-auto mt-3 max-w-[440px] text-sm font-bold leading-6 text-slate-300/90">Operacao concluida.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.1em]"><span id="finalScore" className="mb-0.5 block text-[22px] font-black text-white">0</span>Score Final</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.1em]"><span id="finalCombo" className="mb-0.5 block text-[22px] font-black text-white">x1</span>Melhor Combo</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.1em]"><span id="finalKills" className="mb-0.5 block text-[22px] font-black text-white">0</span>Abatidos</div>
              </div>
              <button type="button" id="restart" className="mt-5 h-12 w-full rounded-[14px] border border-white/15 bg-gradient-to-b from-rose-600 to-rose-800 font-black uppercase tracking-[0.2em] text-white">Continuar</button>
            </div>
          </div>
        </section>
        <div className="shrink-0 border-t border-white/10 bg-black/55 px-4 py-2 text-[11px] font-bold leading-5 text-slate-200/80">
          <strong className="mr-2.5 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/90">Controles</strong>
          WASD/setas movem - Clique seguro = metralhadora - Mire p/ LOCK - Botao direito ou Espaco = missil - Shift = turbo - Colete power-ups!
        </div>
      </main>
    </div>
  );
}
