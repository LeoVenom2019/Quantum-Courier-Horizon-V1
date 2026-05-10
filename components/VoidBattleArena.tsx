'use client';

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Shield, Target, MousePointer2 } from 'lucide-react';

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
  isExploding?: boolean;
  originalId?: string; // For asset lookup when id is unique per instance
  lastShot?: number;
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
}

const VoidBattleHUD = memo(({ hud, playerMaxHp, playerMaxShield, displayEnemy, t, isGroupBattle, routeTier }: any) => {
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
        <p className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest leading-none">
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
  enemyQueue?: VoidBattleEnemy[];
  activeShipImage?: string;
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

const VoidBattleArena = memo(({ 
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
  enemyQueue,
  activeShipImage
}: VoidBattleArenaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

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
    enemies: initialEnemies.map(e => ({ ...e, isExploding: false })),
    playerX: 10,
    playerY: 50,
    projectiles: [],
    particles: [],
    lastEnemyMove: Date.now(),
    lastEnemyAttack: Date.now(),
    isGroupBattle,
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
      burst: { lastUsed: 0, cooldown: 8000 },
      special: { lastUsed: 0, cooldown: 15000, activeUntil: 0 }
    },
    keysPressed: new Set<string>(),
    damageNumbers: [],
    locationId,
    enemyQueue: [...(enemyQueue || [])],
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
    meteorEvent: Math.random() < 0.6 ? {
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
    }
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
    enemyHp: initialEnemies[0].hp,
    enemyShield: initialEnemies[0].shield,
    enemyType: initialEnemies[0].type,
    enemyName: initialEnemies[0].name || initialEnemies[0].type,
    enemiesAlive: initialEnemies.length,
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

  // Load Images (Sprites)
  useEffect(() => {
    const loadImage = (id: string, src: string, fallbackSrc?: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => { assetsRef.current[id] = img; resolve(); };
        img.onerror = () => { 
          if (fallbackSrc) {
            const fImg = new Image();
            fImg.src = fallbackSrc;
            fImg.onload = () => { assetsRef.current[id] = fImg; resolve(); };
            fImg.onerror = () => { resolve(); };
          } else {
            resolve(); 
          }
        };
      });
    };

    const locKey = locationId === 0 ? 'zero' : locationId;
    const isMythic = playerShipStats.rarity === 'mythic';
    const isVoid = routeTier === 'Void';
    
    const imagesToLoad: { id: string, src: string, fallback?: string }[] = [
      { id: 'player_neutral', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp' : '/images/ships/battle/player_battle_neutral.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_up', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_up.webp' : '/images/ships/battle/player_battle_up.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_down', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_down.webp' : '/images/ships/battle/player_battle_down.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
      { id: 'player_forward', src: isVoid ? (isMythic ? '/assets/rota3/void/mitic_eclipse/mitic_eclipse_foward.webp' : '/images/ships/battle/player_battle_neutral.webp') : (activeShipImage || '/images/battle/standard_ship.webp') },
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

    const allPotentialEnemies = [...initialEnemies, ...(enemyQueue || [])];
    allPotentialEnemies.forEach(e => {
      if (routeTier === 'Void') {
        let baseName = 'boss';
        if (e.type === 'Padrão') {
          const match = e.image.match(/common-(\d+)/);
          const num = match ? match[1] : '1';
          baseName = `monster-common-${num}`;
        } else if (e.type === 'Elite') {
          baseName = 'monster-elite';
        }
        
        const baseSrc = `/assets/rota3/void/${locKey}/${baseName}`;
        const fallbackBaseSrc = `/assets/rota3/void/zero/${baseName}`;
        
        imagesToLoad.push(
          { id: `${e.id}_neutral`, src: `${baseSrc}_neutral.webp`, fallback: `${fallbackBaseSrc}_neutral.webp` },
          { id: `${e.id}_up`, src: `${baseSrc}_up.webp`, fallback: `${fallbackBaseSrc}_up.webp` },
          { id: `${e.id}_down`, src: `${baseSrc}_down.webp`, fallback: `${fallbackBaseSrc}_down.webp` },
          { id: `${e.id}_forward`, src: `${baseSrc}_forward.webp`, fallback: `${fallbackBaseSrc}_forward.webp` },
          { id: `${e.id}_backward`, src: `${baseSrc}_backward.webp`, fallback: `${fallbackBaseSrc}_backward.webp` }
        );
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
      .then(() => setAssetsLoaded(true));
  }, [locationId, initialEnemies, activeShipImage, enemyQueue, playerShipStats.rarity, routeTier]);

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
      if (voidResourcesRef.current.tech < 500) { addLog(t('notEnoughTech'), 'error'); return; }
      onUpdateResources({ ...voidResourcesRef.current, tech: voidResourcesRef.current.tech - 500 });
      s.abilities.burst.lastUsed = now;
      const spread = [-20, -10, 0, 10, 20];
      spread.forEach((offset, idx) => {
        s.projectiles.push({
          id: `p-burst-${idx}-${now}`,
          x: s.playerX + 5,
          y: s.playerY + offset,
          owner: 'player',
          damage: playerShipStatsRef.current.damage * 0.5,
          vx: 5.5,
          vy: 0,
          type: 'burst'
        });
      });
      playSfx('shoot_player');
    } else if (type === 'special') {
      s.abilities.special.lastUsed = now;
      s.abilities.special.activeUntil = now + 3000;
      playSfx('laser_up');
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
    // Vector to target
    const dx = targetX - px;
    const dy = targetY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 1) return;

    // Normalize and set speed
    const isCrit = Math.random() * 100 < (playerShipStats.critChance || 8);
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
      damage: isCrit ? playerShipStats.damage * 2 : playerShipStats.damage,
      vx,
      vy,
      isCrit,
      size: isSkyring ? 2.0 : (isMythic ? 1.6 : 1),
      isSkyring,
      trail: []
    });
    s.lastShot = now;
    playSfx('shoot_player');

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
  }, [playSfx, playerShipStats]);

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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      triggerAttack(x, y);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);

    let animId: number;
    let battleFinished = false;
    let lastTime = Date.now();

    const createImpactEffect = (x: number, y: number, color: string, impactAngle = 0, impactForce = 1, targetType: 'ship' | 'meteor' | 'meteorite' = 'ship') => {
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
        const spread = 0.5;
        for (let i = 0; i < count; i++) {
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
          for (let i = 0; i < 5; i++) {
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
          for (let i = 0; i < 3; i++) {
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

    const loop = () => {
      const s = gameRef.current;
      const now = Date.now();
      const deltaTime = Math.min(2, (now - lastTime) / 16.66);
      lastTime = now;
      s.frameCount = (s.frameCount || 0) + 1;
      
      let effectiveDelta = deltaTime;
      
      if (s.isSlowMo) {
        s.finishTimer += deltaTime * 16.66;
        const slowFactor = Math.max(0.2, 1 - (s.finishTimer / 2000));
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

      if (routeTier === 'Void') {
        if (videoReady && videoRef.current) {
          ctx.drawImage(videoRef.current, 0, 0, cWidth, cHeight);
        }
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.filter = 'brightness(1.0)';
        drawParallaxLayer('bg_layer_1', 0.06, 0.75, 15); 
        ctx.restore();
        ctx.save();
        if (s.isSlowMo) {
          const zoomProgress = Math.min(1, s.finishTimer / 2500);
          const zoomScale = 1 + zoomProgress * 0.8;
          const targetPx = (s.zoomTarget.x / 100) * cWidth;
          const targetPy = (s.zoomTarget.y / 100) * cHeight;
          ctx.translate(cWidth / 2, cHeight / 2);
          ctx.scale(zoomScale, zoomScale);
          ctx.translate(-targetPx, -targetPy);
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, 0.03 * Math.sin(now / 1500));
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(0, 0, cWidth, cHeight);
        ctx.restore();
      } else {
        // Simple parallax for other routes
        if (videoReady && videoRef.current) {
          if (routeTier === 'Solar') {
            ctx.save();
            ctx.filter = 'brightness(0.75)';
            ctx.drawImage(videoRef.current, 0, 0, cWidth, cHeight);
            ctx.restore();
          } else {
            ctx.drawImage(videoRef.current, 0, 0, cWidth, cHeight);
          }
        }
        drawParallaxLayer('bg_layer_1', routeTier === 'Solar' ? 0 : 0.04, 0.8, routeTier === 'Solar' ? 8 : 0);
      }

      // Special Ability Logic (Mega Laser)
      const isSpecialActive = now < s.abilities.special.activeUntil;
      if (isSpecialActive && !s.playerIsExploding) {
          const laserY = (s.playerY / 100) * cHeight;
          const laserStartX = (s.playerX / 100) * cWidth + (playerShipStats.rarity === 'mythic' ? 40 : 20);
          
          ctx.save();
          // 1. OUTER GLOW (Pulsing)
          ctx.shadowBlur = 30 + Math.sin(now / 100) * 15;
          ctx.shadowColor = '#a855f7';
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
          ctx.lineWidth = 40 + Math.sin(now / 50) * 10;
          ctx.beginPath();
          ctx.moveTo(laserStartX, laserY);
          ctx.lineTo(cWidth, laserY);
          ctx.stroke();

          // 2. MAIN NEON BEAM
          ctx.strokeStyle = '#d946ef';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.moveTo(laserStartX, laserY);
          ctx.lineTo(cWidth, laserY);
          ctx.stroke();

          // 3. CORE BEAM
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 5 + Math.sin(now / 30) * 3;
          ctx.beginPath();
          ctx.moveTo(laserStartX, laserY);
          ctx.lineTo(cWidth, laserY);
          ctx.stroke();

          // 4. ENERGY WAVES (Oscillating neon lines)
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = laserStartX; x < cWidth; x += 15) {
              const yOffset = Math.sin((x + now * 0.8) / 30) * 20;
              if (x === laserStartX) ctx.moveTo(x, laserY + yOffset);
              else ctx.lineTo(x, laserY + yOffset);
          }
          ctx.stroke();
          ctx.restore();

          // 5. INTERNAL PARTICLES (High velocity sparks)
          if (now % 2 === 0) {
              for (let i = 0; i < 4; i++) {
                  s.particles.push({
                      id: `laser-p-${now}-${i}-${Math.random()}`,
                      x: (laserStartX / cWidth) * 100 + Math.random() * 80,
                      y: (laserY / cHeight) * 100 + (Math.random() - 0.5) * 2.5,
                      vx: 6 + Math.random() * 6,
                      vy: (Math.random() - 0.5) * 0.3,
                      life: 0.5,
                      size: 2 + Math.random() * 4,
                      color: Math.random() > 0.5 ? '#fff' : '#f472b6',
                      type: 'spark'
                  });
              }
          }
          
          // Apply 1.5x damage per second (distributed per frame)
          const damagePerTick = (playerShipStats.damage * 1.5) / 60;
          s.enemies.forEach(e => {
            if (e.hp > 0 && Math.abs((e.y / 100) * cHeight - laserY) < 50) {
                e.hp = Math.max(0, e.hp - damagePerTick * effectiveDelta);
                if (now % 4 === 0) {
                    createImpactEffect((e.x / 100) * cWidth, (e.y / 100) * cHeight, '#fff', 0, 1, 'ship');
                    createDamageNumber(e.x, e.y - 15, damagePerTick * 60, false, 'player');
                }
            }
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
                createImpactEffect(p.x, p.y, p.isCrit ? '#fcd34d' : '#22d3ee', impactAngle, 1.0, 'ship');
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
              
              // Spawn extra enemies during event (max 3 extra)
              if (s.meteorEvent.extraEnemiesSpawned < 3 && Math.random() < 0.15) {
                const enemyToClone = initialEnemies[Math.floor(Math.random() * initialEnemies.length)];
                if (enemyToClone) {
                   s.enemies.push({
                     ...enemyToClone,
                     id: `extra-${now}-${Math.random()}`,
                     originalId: enemyToClone.id,
                     x: 105,
                     y: 10 + Math.random() * 80,
                     hp: enemyToClone.hp * 0.5,
                     maxHp: enemyToClone.maxHp * 0.5,
                     vx: -0.2 - Math.random() * 0.2
                   });
                   s.meteorEvent.extraEnemiesSpawned++;
                }
              }
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
                  s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (m.type === 'meteor' ? 50 : 20);
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
            
            s.projectiles.push({
              id: `ep-${now}-${enemy.id}`,
              x: enemy.x - 5,
              y: enemy.y,
              owner: 'enemy',
              damage: enemy.damage,
              vx: (dx / dist) * 3,
              vy: (dy / dist) * 3,
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
          if (Math.abs(enemy.vy || 0) > 0.05) spriteSuffix = (enemy.vy || 0) < 0 ? '_up' : '_down';
          const eImg = assetsRef.current[`${assetId}${spriteSuffix}`] || assetsRef.current[`${assetId}_neutral`];

          if (eImg) {
            if (routeTier === 'Void') {
              let baseSize = 128;
              if (enemy.type === 'Boss') baseSize *= 1.4;
              else if (enemy.type === 'Elite') baseSize *= 1.25;
              const imgW = baseSize;
              const imgH = eImg.height * (imgW / eImg.width);
              y += Math.sin(now / 400 + enemy.y) * 10;
              x += Math.cos(now / 600 + enemy.x) * 5;
              
              ctx.save();
              ctx.globalAlpha = 0.3;
              ctx.filter = 'blur(15px)';
              ctx.fillStyle = enemy.type === 'Padrão' ? '#a855f7' : '#f43f5e';
              ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
              ctx.restore();
              ctx.drawImage(eImg, x - imgW/2, y - imgH/2, imgW, imgH);
            } else {
              // PNG Original para Rotas 1 e 2
              const imgW = 110;
              const imgH = eImg.height * (imgW / eImg.width);
              ctx.save();
              ctx.translate(x, y);
              ctx.drawImage(eImg, -imgW/2, -imgH/2, imgW, imgH);
              ctx.restore();
            }
          }
          
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(x - 20, y + 25, 40, 4);
          ctx.fillStyle = routeTier === 'Void' ? '#a855f7' : '#ef4444';
          ctx.fillRect(x - 20, y + 25, 40 * (enemy.hp / enemy.maxHp), 4);
        }
      });

      // Draw Projectiles — Com trilhas e glow seletivo
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
          ctx.fillStyle = '#4ade80';
          ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#bbf7d0'; ctx.beginPath(); ctx.arc(px - 2, py - 2, 3, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(px, py, isPlayer ? 4 : 3.5, 0, Math.PI * 2); ctx.fill();
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

        if (allEnemiesDead) {
          if (s.enemyQueue && s.enemyQueue.length > 0) {
             s.enemies.forEach(e => { s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (e.qc || 0); });
             const nextEnemy = s.enemyQueue.shift();
             if (nextEnemy) {
               s.enemies = [{ ...nextEnemy, isExploding: false }];
               s.lastEnemyAttack = now; 
             }
          } else if (s.meteorEvent?.active && (now - s.meteorEvent.startTime < 25000)) {
             // Caso meteoritos ativos e sem fila, respawna um inimigo aleatório do pool inicial
             s.enemies.forEach(e => { s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (e.qc || 0); });
             const enemyTemplate = initialEnemies[Math.floor(Math.random() * initialEnemies.length)];
             if (enemyTemplate) {
               s.enemies = [{ 
                 ...enemyTemplate, 
                 id: `respawn-${now}-${Math.random()}`,
                 hp: enemyTemplate.hp * 0.7, // Um pouco mais fraco para manter o ritmo
                 maxHp: enemyTemplate.maxHp * 0.7,
                 x: 105,
                 isExploding: false 
               }];
               s.lastEnemyAttack = now;
             }
          } else {
            if (!s.victoryExplosionStart) {
              s.victoryExplosionStart = now;
              s.enemies.forEach(e => { s.totalRewardAccumulated = (s.totalRewardAccumulated || 0) + (e.qc || 0); });
              s.enemies.forEach(e => { e.qc = 0; });

              if (routeTier === 'Void') {
                s.isSlowMo = true;
                s.zoomTarget = { x: 80, y: 50 }; 
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
                destroyedMeteorites: s.destroyedMeteorites
              });
            }
          }
        } else if (s.playerHp <= 0) {
          if (routeTier === 'Void' && !s.isSlowMo) {
            s.isSlowMo = true;
            s.zoomTarget = { x: s.playerX, y: s.playerY };
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
      ctx.restore(); // END CINEMATIC ZOOM
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
  }, [assetsLoaded, triggerAttack, onBattleEnd, playSfx, stopSfx, dimensions, routeTier, triggerAbility, playerShipStats, locationId, videoReady]);

  if (!assetsLoaded) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#050510]">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="mt-6 font-orbitron text-white/60 uppercase tracking-[0.3em] animate-pulse">{t('loadingBattleAssets')}...</p>
      </div>
    );
  }

  const displayEnemy = gameRef.current.enemies.find(e => e.hp > 0) || gameRef.current.enemies[0];

  return (
    <div ref={containerRef} className="fixed inset-0 z-[300] flex flex-col relative overflow-hidden bg-black">
      <VoidBattleHUD 
        hud={hud} 
        playerMaxHp={gameRef.current.playerMaxHp} 
        playerMaxShield={gameRef.current.playerMaxShield}
        displayEnemy={displayEnemy}
        t={t}
        isGroupBattle={isGroupBattle}
        routeTier={routeTier}
      />

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
        <div className="absolute bottom-6 left-6 z-30 flex flex-col items-center gap-2 pointer-events-none">
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
                    strokeDashoffset={188.5 * ((hud.specialCooldown || 0) / 15)} 
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
