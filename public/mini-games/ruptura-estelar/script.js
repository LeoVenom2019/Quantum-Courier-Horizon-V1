const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const statusElement = document.getElementById('status');
const finalScoreElement = document.getElementById('final-score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');
const exitBtn = document.getElementById('exit-btn');

// Game Constants
const WIDTH = 960;
const HEIGHT = 540;
const PLAYER_SPEED = 5.5;
const BULLET_SPEED = 14;
const BULLET_COOLDOWN_NORMAL = 12;
const BULLET_COOLDOWN_OVERDRIVE = 6;
const ENEMY_SPAWN_INTERVAL_MIN = 15;
const ENEMY_SPAWN_INTERVAL_MAX = 80;
const OVERDRIVE_THRESHOLD = 50; 
const BASE_OVERDRIVE_DURATION = 400; // frames

function getArcadePerks() {
    try {
        return JSON.parse(localStorage.getItem('qch_arcade_perks_ruptura-estelar') || '[]');
    } catch (error) {
        return [];
    }
}

function hasArcadePerk(perkId) {
    return getArcadePerks().some(perk => perk && perk.id === perkId);
}

const HAS_EMERGENCY_SHIELD = hasArcadePerk('stellar-rupture-shield-charge');
const HAS_SCORE_MULTIPLIER = hasArcadePerk('stellar-rupture-score-multiplier');
const SFX_BASE = '/assets/games/flipers_sfx';
const SFX = {
    playerShot: `${SFX_BASE}/ruptura_estelar_player_shot.ogg`,
    bossShot: `${SFX_BASE}/ruptura_estelar_boss_shot.ogg`,
    enemyExplosion: `${SFX_BASE}/ruptura_estelar_enemy_explosion.ogg`,
    playerExplosion: `${SFX_BASE}/ruptura_estelar_player_explosion.ogg`,
};
const audioCache = new Map();

function playSfx(path, volume = 0.55) {
    if (!path) return;

    try {
        if (!audioCache.has(path)) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audioCache.set(path, audio);
        }

        const sound = audioCache.get(path).cloneNode();
        sound.volume = volume;
        sound.play().catch(() => {});
    } catch (error) {
        // Audio can be blocked until user interaction; gameplay must keep running.
    }
}

// State
let score = 0;
let gameActive = false;
let overdriveValue = 0;
let overdriveActive = false;
let overdriveTimer = 0;
let spawnTimer = 0;
let difficultyFactor = 1;
let framesCount = 0;
let shakeTime = 0;
let screenFlash = 0;
let redFlash = 0; // Boss warning flash
let emergencyShieldCharges = HAS_EMERGENCY_SHIELD ? 1 : 0;

// New Systems
let playerLevel = 1;
let xp = 0;
let nextLevelXp = 500;
let comboCount = 0;
let comboTimer = 0;
const COMBO_MAX_TIME = 120; // 2 seconds at 60fps

let bossWarningTimer = 0;
let bossCounter = 0;
const BOSS_INTERVAL = 5000; // score threshold

let player = {
    x: 80,
    y: HEIGHT / 2,
    vx: 0,
    vy: 0,
    bulletCooldown: 0,
    width: 44,
    height: 32,
    pulse: 0
};

let bullets = [];
let enemyBullets = []; // Lasers from bosses
let enemies = [];
let particles = [];
let stars = [[], [], []]; // 3 layers for parallax

const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

// Colors
const COLOR_CYAN = '#06b6d4';
const COLOR_GOLD = '#f59e0b';
const COLOR_RED = '#ef4444';
const COLOR_PURPLE = '#a855f7';
const COLOR_BLUE = '#3b82f6';
const COLOR_BG = '#01040a';

function initBackground() {
    stars = [[], [], []];
    // Layer 1: Small & Fast
    for (let i = 0; i < 80; i++) {
        stars[0].push({ x: Math.random() * WIDTH, y: Math.random() * HEIGHT, size: 0.8, speed: 4 });
    }
    // Layer 2: Medium & Mid-speed
    for (let i = 0; i < 50; i++) {
        stars[1].push({ x: Math.random() * WIDTH, y: Math.random() * HEIGHT, size: 1.5, speed: 2 });
    }
    // Layer 3: Large, Slow & Glowing
    for (let i = 0; i < 20; i++) {
        stars[2].push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: 2.5,
            speed: 0.8,
            pulse: Math.random() * Math.PI,
            pulseSpeed: 0.05 + Math.random() * 0.05
        });
    }
}

function init() {
    score = 0;
    gameActive = true;
    overdriveValue = 0;
    overdriveActive = false;
    overdriveTimer = 0;
    spawnTimer = 0;
    difficultyFactor = 1;
    framesCount = 0;
    shakeTime = 0;
    screenFlash = 0;
    redFlash = 0;
    emergencyShieldCharges = HAS_EMERGENCY_SHIELD ? 1 : 0;
    
    playerLevel = 1;
    xp = 0;
    nextLevelXp = 500;
    comboCount = 0;
    comboTimer = 0;
    bossWarningTimer = 0;
    bossCounter = 0;

    player.x = 80;
    player.y = HEIGHT / 2;
    player.vx = 0;
    player.vy = 0;
    player.bulletCooldown = 0;
    player.pulse = 0;
    
    bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    
    updateScore(0);
    updateStatus();
    initBackground();
    
    overlay.classList.add('hidden');
    requestAnimationFrame(gameLoop);
}

function updateScore(val) {
    score = val;
    scoreElement.innerText = score.toLocaleString('pt-BR', { minimumIntegerDigits: 5, useGrouping: true });
    
    // Notify parent of score update
    window.parent.postMessage({ 
        type: 'SCORE_UPDATE', 
        gameId: 'ruptura-estelar', 
        score: score 
    }, '*');
}

function updateStatus() {
    let levelText = `NÍVEL ${playerLevel} ${playerLevel === 4 ? 'MAX' : ''}`;
    const shieldText = emergencyShieldCharges > 0 ? ' - ESCUDO 1' : '';
    if (overdriveActive) {
        statusElement.innerText = `OVERDRIVE ACTIVE - ${levelText}${shieldText}`;
        statusElement.className = 'status-overdrive active';
        
        // Dynamic color for overdrive status text
        if (playerLevel === 1) statusElement.style.color = COLOR_GOLD;
        else if (playerLevel === 2) statusElement.style.color = COLOR_CYAN;
        else if (playerLevel === 3) statusElement.style.color = COLOR_RED;
        else if (playerLevel === 4) {
             statusElement.style.color = '#fff';
             statusElement.style.textShadow = '0 0 10px #fff, 0 0 20px #000';
        }
    } else if (overdriveValue >= OVERDRIVE_THRESHOLD) {
        statusElement.innerText = `OVERDRIVE READY - ${levelText}${shieldText}`;
        statusElement.className = 'status-overdrive ready';
        statusElement.style.color = '';
        statusElement.style.textShadow = '';
    } else {
        statusElement.innerText = `SISTEMA NORMAL - ${levelText}${shieldText}`;
        statusElement.className = 'status-normal';
        statusElement.style.color = '';
        statusElement.style.textShadow = '';
    }
}

function spawnEnemy(isBoss = false) {
    if (isBoss) {
        const types = [
            { type: 'boss1', color: COLOR_RED, health: 60, behavior: 'aggressive' },
            { type: 'boss2', color: COLOR_BLUE, health: 80, behavior: 'burst' },
            { type: 'boss3', color: COLOR_PURPLE, health: 70, behavior: 'oscillate' }
        ];
        const config = types[Math.floor(Math.random() * types.length)];
        
        enemies.push({
            x: WIDTH + 120,
            y: Math.random() * (HEIGHT - 200) + 100,
            width: 100,
            height: 100,
            speed: 1.5,
            type: config.type,
            color: config.color,
            hp: config.health * difficultyFactor,
            maxHp: config.health * difficultyFactor,
            oscillation: Math.random() * Math.PI,
            oscillationSpeed: 0.02,
            pulseRoll: 0,
            visualFlash: 0,
            isBoss: true,
            behavior: config.behavior,
            shootCooldown: 120,
            burstCount: 0,
            burstTimer: 0,
            entryMode: true
        });
        return;
    }

    const typeRoll = Math.random();
    let type = 'basic';
    let color = COLOR_RED;
    let size = 26;
    let speed = 3.5 + Math.random() * 2;
    let hp = 1;

    if (typeRoll > 0.85) {
        type = 'kamikaze';
        color = '#ff4400';
        speed = 5.5 + Math.random() * 3;
    } else if (typeRoll > 0.65) {
        type = 'tank';
        color = '#aa0000';
        size = 42;
        speed = 2.2;
        hp = 3;
    }

    enemies.push({
        x: WIDTH + 50,
        y: Math.random() * (HEIGHT - 120) + 60,
        width: size,
        height: size,
        speed: speed * difficultyFactor,
        type: type,
        color: color,
        hp: hp,
        maxHp: hp,
        oscillation: Math.random() * Math.PI * 2,
        oscillationSpeed: 0.05 + Math.random() * 0.1,
        pulseRoll: Math.random() * Math.PI,
        visualFlash: 0,
        isBoss: false
    });
}

function spawnExplosion(x, y, color, count = 30, explosive = false) {
    // 2x particles as requested (base was 15, so 30)
    // Level 4 explosive shots have 2.5x intensity (30 * 2.5 = 75)
    let finalCount = explosive ? count * 2.5 : count;

    for (let i = 0; i < finalCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const force = (explosive ? 4 : 2) + Math.random() * (explosive ? 15 : 10);
        particles.push({
            x, y,
            vx: Math.cos(angle) * force,
            vy: Math.sin(angle) * force,
            life: 15 + Math.random() * 20,
            maxLife: 35,
            size: (1 + Math.random() * 5) * (explosive ? 1.5 : 1),
            color: color,
            isTrail: false
        });
    }
    screenFlash = explosive ? 10 : 5;
    shakeTime = explosive ? 15 : 8;
}

function spawnTrail(x, y, color, isOverdrive) {
    // 2x trail as requested
    for (let i = 0; i < 2; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: -3 - Math.random() * 5,
            vy: (Math.random() - 0.5) * 2,
            life: isOverdrive ? 35 : 25,
            maxLife: isOverdrive ? 35 : 25,
            size: (2 + Math.random() * 7) * (isOverdrive ? 1.6 : 1),
            color: color,
            isTrail: true
        });
    }
}

function handleInput() {
    let dx = 0;
    let dy = 0;
    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 0.6;
    if (keys.d || keys.ArrowRight) dx += 0.8;

    player.vx = dx * PLAYER_SPEED;
    player.vy = dy * PLAYER_SPEED;

    player.x += player.vx;
    player.y += player.vy;
    
    player.x = Math.max(25, Math.min(WIDTH / 2.5, player.x));
    player.y = Math.max(50, Math.min(HEIGHT - 50, player.y));
}

function fireAuto() {
    if (player.bulletCooldown <= 0) {
        const cooldown = overdriveActive ? BULLET_COOLDOWN_OVERDRIVE : BULLET_COOLDOWN_NORMAL;
        player.bulletCooldown = cooldown;
        const bX = player.x + 20;
        const bY = player.y;
        const isExplosive = playerLevel === 4;
        playSfx(SFX.playerShot, overdriveActive ? 0.315 : 0.375);
        
        // Multi-shot based on Level and Overdrive
        if (overdriveActive) {
            // Level-based OD patterns
            if (playerLevel === 1) {
                // OD Yellow (Pattern 1)
                bullets.push({ x: bX, y: bY, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
            } else if (playerLevel === 2) {
                // OD Cyan (4 shots)
                bullets.push({ x: bX, y: bY - 12, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY - 4, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY + 4, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY + 12, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
            } else if (playerLevel === 3) {
                // OD Red (5 shots)
                bullets.push({ x: bX, y: bY - 16, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY - 8, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY + 8, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY + 16, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
            } else if (playerLevel === 4) {
                // OD Black (5 explosive shots)
                bullets.push({ x: bX, y: bY - 16, w: 30, h: 8, speed: BULLET_SPEED, explosive: true });
                bullets.push({ x: bX, y: bY - 8, w: 30, h: 8, speed: BULLET_SPEED, explosive: true });
                bullets.push({ x: bX, y: bY, w: 30, h: 8, speed: BULLET_SPEED, explosive: true });
                bullets.push({ x: bX, y: bY + 8, w: 30, h: 8, speed: BULLET_SPEED, explosive: true });
                bullets.push({ x: bX, y: bY + 16, w: 30, h: 8, speed: BULLET_SPEED, explosive: true });
            }
        } else {
            // Normal shooting patterns
            if (playerLevel === 1) {
                bullets.push({ x: bX, y: bY, w: 24, h: 6, speed: BULLET_SPEED, explosive: false });
            } else if (playerLevel === 2) {
                bullets.push({ x: bX, y: bY - 8, w: 18, h: 5, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY + 8, w: 18, h: 5, speed: BULLET_SPEED, explosive: false });
            } else if (playerLevel === 3) {
                bullets.push({ x: bX, y: bY - 12, w: 18, h: 5, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY, w: 18, h: 5, speed: BULLET_SPEED, explosive: false });
                bullets.push({ x: bX, y: bY + 12, w: 18, h: 5, speed: BULLET_SPEED, explosive: false });
            } else if (playerLevel === 4) {
                bullets.push({ x: bX, y: bY - 12, w: 24, h: 6, speed: BULLET_SPEED, explosive: true });
                bullets.push({ x: bX, y: bY, w: 24, h: 6, speed: BULLET_SPEED, explosive: true });
                bullets.push({ x: bX, y: bY + 12, w: 24, h: 6, speed: BULLET_SPEED, explosive: true });
            }
        }
        
        // Muzzle flash particles
        for(let i=0; i<3; i++) {
            particles.push({
                x: bX, y: bY,
                vx: 5 + Math.random() * 5,
                vy: (Math.random() - 0.5) * 4,
                life: 10, maxLife: 10, size: 4, color: '#fff', isTrail: false
            });
        }
    }
}

function update() {
    framesCount++;
    difficultyFactor = 1 + framesCount / 9000;
    player.pulse += 0.1;

    handleInput();
    fireAuto();

    // Evolution System
    if (playerLevel < 4 && xp >= nextLevelXp) {
        xp -= nextLevelXp;
        playerLevel++;
        nextLevelXp = playerLevel === 4 ? 0 : playerLevel * 1000 + 500;
        screenFlash = 20;
        updateStatus();
    }

    // Boss Warning & Spawning
    if (bossWarningTimer > 0) {
        bossWarningTimer--;
        redFlash = Math.sin(framesCount * 0.2) * 20; // Pulsing red warning
        shakeTime = 5;
        if (bossWarningTimer === 0) {
            spawnEnemy(true);
            // Chance for dual bosses as score increases
            if (score > 10000 && Math.random() > 0.5) {
                setTimeout(() => spawnEnemy(true), 1000);
            }
            redFlash = 0;
        }
    } else if (score >= bossCounter + BOSS_INTERVAL) {
        bossCounter += BOSS_INTERVAL;
        bossWarningTimer = 180; // 3 seconds
    }

    // Parallax Stars
    stars.forEach((layer, idx) => {
        layer.forEach(s => {
            s.x -= s.speed * (overdriveActive ? 1.8 : 1);
            if (s.x < -10) s.x = WIDTH + 10;
            if (idx === 2) s.pulse += s.pulseSpeed;
        });
    });

    // Combo System
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) comboCount = 0;
    }

    // Player Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.speed;
        if (b.x > WIDTH + 50) bullets.splice(i, 1);
    }

    // Enemy Lasers (Bosses)
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.x += eb.vx;
        eb.y += eb.vy;
        
        // Beam collision (slightly larger hitbox for lasers to feel fair/dangerous)
        if (checkCollision({ x: eb.x, y: eb.y, width: 30, height: 12 }, player)) {
            spawnExplosion(player.x, player.y, COLOR_CYAN, 50);
            if (!absorbPlayerHit(player.x, player.y)) gameOver();
            enemyBullets.splice(i, 1);
            continue;
        }

        if (eb.x < -100 || eb.x > WIDTH + 100 || eb.y < -100 || eb.y > HEIGHT + 100) {
            enemyBullets.splice(i, 1);
        }
    }

    // Enemies & Bosses
    const activeBosses = enemies.filter(en => en.isBoss).length;
    spawnTimer--;
    if (spawnTimer <= 0 && bossWarningTimer === 0) {
        // Slow down normal spawns if bosses are present
        const spawnDelay = activeBosses > 0 ? ENEMY_SPAWN_INTERVAL_MAX * 1.5 : 0;
        spawnEnemy();
        spawnTimer = Math.max(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX - (framesCount / 150) + spawnDelay);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.pulseRoll += 0.1;
        if (e.visualFlash > 0) e.visualFlash--;

        if (e.isBoss) {
            // Boss Movement Logic
            if (e.entryMode) {
                e.x -= e.speed * 2;
                if (e.x < WIDTH - 150) e.entryMode = false;
            } else {
                if (e.behavior === 'oscillate') {
                    e.oscillation += e.oscillationSpeed;
                    e.y = HEIGHT / 2 + Math.sin(e.oscillation) * (HEIGHT / 3);
                } else if (e.behavior === 'burst') {
                    e.x -= 0.2; // Slow back movement
                    e.oscillation += e.oscillationSpeed * 0.5;
                    e.y += Math.sin(e.oscillation) * 1.2;
                } else if (e.behavior === 'aggressive') {
                    const dy = player.y - e.y;
                    e.y += Math.sign(dy) * 1.5;
                    e.oscillation += 0.05;
                    e.x += Math.cos(e.oscillation) * 0.5;
                }
            }

            // Boss Shooting Logic
            e.shootCooldown--;
            if (e.shootCooldown <= 0 && !e.entryMode) {
                e.visualFlash = 5; // Flash before shot
                
                if (e.behavior === 'burst') {
                    if (e.burstTimer <= 0) {
                        spawnBossLaser(e);
                        e.burstCount++;
                        e.burstTimer = 10; // Rapid fire
                        if (e.burstCount >= 3) {
                            e.burstCount = 0;
                            e.shootCooldown = 150;
                        }
                    } else {
                        e.burstTimer--;
                    }
                } else {
                    spawnBossLaser(e);
                    e.shootCooldown = e.behavior === 'aggressive' ? 80 : 120;
                }
            }
        } else if (e.type === 'kamikaze') {
            e.x -= e.speed;
            const dy = (player.y - e.y);
            e.y += Math.sign(dy) * 2.2;
        } else if (e.type === 'tank') {
            e.x -= e.speed;
            e.oscillation += e.oscillationSpeed;
            e.y += Math.sin(e.oscillation) * 1.8;
        } else {
            e.x -= e.speed;
        }

        if (e.x < -150) enemies.splice(i, 1);

        if (checkCollision(player, e)) {
            if (absorbPlayerHit(e.x, e.y)) {
                playSfx(SFX.enemyExplosion, 0.68);
                spawnExplosion(e.x, e.y, e.color, 22);
                enemies.splice(i, 1);
                continue;
            }
            gameOver();
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.abs(b.x - e.x) < (b.w + e.width)/2 && Math.abs(b.y - e.y) < (b.h + e.height)/2) {
                bullets.splice(j, 1);
                
                // Explosive bullets effect
                if (b.explosive) {
                    if (e.isBoss) e.hp -= 5; // Bosses resist explosive insta-kill
                    else e.hp = 0;
                } else {
                    e.hp--;
                }
                
                e.visualFlash = 3;
                
                if (e.hp <= 0) {
                    comboCount++;
                    comboTimer = COMBO_MAX_TIME;
                    const comboBonus = comboCount * 20;

                    playSfx(SFX.enemyExplosion, e.isBoss ? 0.82 : 0.7);
                    spawnExplosion(e.x, e.y, e.color, 30, b.explosive || e.isBoss);
                    enemies.splice(i, 1);
                    
                    const killScore = (e.isBoss ? 2000 : 100) + comboBonus;
                    addKillScore(killScore);
                    xp += e.isBoss ? 500 : 50;
                    
                    if (!overdriveActive) {
                        overdriveValue += e.isBoss ? 20 : 2.5;
                        if (overdriveValue >= OVERDRIVE_THRESHOLD) activateOverdrive();
                        updateStatus();
                    }
                    break;
                }
            }
        }
    }

    // Overdrive timer
    if (overdriveActive) {
        overdriveTimer--;
        if (overdriveTimer <= 0) deactivateOverdrive();
    }

    // Trail
    if (framesCount % 2 === 0) {
        let odColor = COLOR_GOLD;
        if (overdriveActive) {
            if (playerLevel === 2) odColor = COLOR_CYAN;
            else if (playerLevel === 3) odColor = COLOR_RED;
            else if (playerLevel === 4) odColor = '#444'; // Blackish for Level 4
        }
        spawnTrail(player.x - 20, player.y, odColor, overdriveActive);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }

    if (shakeTime > 0) shakeTime--;
    if (screenFlash > 0) screenFlash--;
    if (player.bulletCooldown > 0) player.bulletCooldown--;
}

function checkCollision(a, b) {
    // Reduced margin for more accurate hit detection (was 10)
    const margin = 4;
    const ax = a.x;
    const ay = a.y;
    const bx = b.x;
    const by = b.y;
    
    // Support both .width/.height and .w/.h
    const aw = a.width || a.w || 0;
    const ah = a.height || a.h || 0;
    const bw = b.width || b.w || 0;
    const bh = b.height || b.h || 0;

    return ax - aw/2 + margin < bx + bw/2 - margin &&
           ax + aw/2 - margin > bx - bw/2 + margin &&
           ay - ah/2 + margin < by + bh/2 - margin &&
           ay + ah/2 - margin > by - bh/2 + margin;
}

function activateOverdrive() {
    overdriveActive = true;
    
    // Level-based OD duration bonus
    let duration = BASE_OVERDRIVE_DURATION;
    if (playerLevel === 2) duration += 120; // +2s approx (60fps)
    else if (playerLevel === 3) duration += 180; // +3s approx
    else if (playerLevel === 4) duration += 180;

    overdriveTimer = duration;
    overdriveValue = 0;
    screenFlash = 15;
    shakeTime = 30;
    updateStatus();
}

function deactivateOverdrive() {
    overdriveActive = false;
    updateStatus();
}

function spawnBossLaser(e) {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    const speed = 7; // Similar to kamikaze
    playSfx(SFX.bossShot, 0.58);
    enemyBullets.push({
        x: e.x - e.width/2,
        y: e.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: e.color
    });
}

function draw() {
    ctx.save();
    
    // Shake effect
    if (shakeTime > 0) {
        ctx.translate((Math.random()-0.5)*shakeTime, (Math.random()-0.5)*shakeTime);
    }

    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Stars
    stars.forEach((layer, idx) => {
        layer.forEach(s => {
            let alpha = 0.5 + Math.random() * 0.5;
            if (idx === 2) {
                alpha = 0.4 + Math.sin(s.pulse) * 0.3;
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#fff';
            }
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
            ctx.shadowBlur = 0;
        });
    });

    // Particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        if (p.isTrail) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life/p.maxLife), 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
    });
    ctx.globalAlpha = 1;

    // Bullets (Player)
    bullets.forEach(b => {
        let bColor = '#fff';
        if (overdriveActive) {
            if (playerLevel === 1) bColor = COLOR_GOLD;
            else if (playerLevel === 2) bColor = COLOR_CYAN;
            else if (playerLevel === 3) bColor = COLOR_RED;
            else if (playerLevel === 4) bColor = '#fff'; 
        } else if (playerLevel === 4) {
             bColor = '#fff';
        }

        if (b.explosive) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = overdriveActive ? '#fff' : COLOR_CYAN;
            ctx.fillStyle = bColor;
            ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
            
            if (overdriveActive && playerLevel === 4) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(b.x - b.w/2 - 4, b.y - b.h/2 - 4, b.w + 8, b.h + 8);
            }
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = bColor;
            ctx.fillStyle = bColor;
            ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
        }
        ctx.shadowBlur = 0;
    });

    // Enemy Bullets (Boss Lasers)
    enemyBullets.forEach(eb => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = eb.color;
        ctx.fillStyle = eb.color;
        
        // Laser beam shape
        const angle = Math.atan2(eb.vy, eb.vx);
        ctx.save();
        ctx.translate(eb.x, eb.y);
        ctx.rotate(angle);
        ctx.fillRect(-15, -3, 30, 6);
        // Core
        ctx.fillStyle = '#fff';
        ctx.fillRect(-10, -1, 20, 2);
        ctx.restore();
        
        ctx.shadowBlur = 0;
    });

    // Enemies
    enemies.forEach(e => {
        const pulse = Math.sin(e.pulseRoll) * (e.isBoss ? 10 : 4);
        const color = e.visualFlash > 0 ? '#fff' : e.color;
        ctx.fillStyle = color;
        ctx.shadowBlur = (e.isBoss ? 40 : 15) + pulse;
        ctx.shadowColor = e.color;
        
        ctx.beginPath();
        if (e.isBoss) {
            if (e.behavior === 'aggressive') {
                // Aggressive (Triangle/V-Shape)
                ctx.moveTo(e.x - e.width/2 - pulse, e.y - e.height/2);
                ctx.lineTo(e.x + e.width/2 + pulse, e.y);
                ctx.lineTo(e.x - e.width/2 - pulse, e.y + e.height/2);
                ctx.lineTo(e.x - e.width/4, e.y);
            } else if (e.behavior === 'burst') {
                // Burst (Octagon/Shield)
                for (let i = 0; i < 8; i++) {
                    const ang = (i / 8) * Math.PI * 2;
                    const r = e.width/2 + pulse;
                    const px = e.x + Math.cos(ang) * r;
                    const py = e.y + Math.sin(ang) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
            } else {
                // Oscillate (Diamond/Spiky)
                ctx.moveTo(e.x, e.y - e.height/2 - pulse);
                ctx.lineTo(e.x + e.width/2 + pulse, e.y);
                ctx.lineTo(e.x, e.y + e.height/2 + pulse);
                ctx.lineTo(e.x - e.width/2 - pulse, e.y);
            }
            ctx.closePath();
        } else if (e.type === 'kamikaze') {
            ctx.moveTo(e.x + e.width/2 + pulse, e.y);
            ctx.lineTo(e.x - e.width/2, e.y - (e.height/2 + pulse));
            ctx.lineTo(e.x - e.width/4, e.y);
            ctx.lineTo(e.x - e.width/2, e.y + (e.height/2 + pulse));
        } else if (e.type === 'tank') {
            ctx.arc(e.x, e.y, (e.width/2 + pulse/2), 0, Math.PI * 2);
        } else {
            const s = e.width + pulse;
            ctx.fillRect(e.x - s/2, e.y - s/2, s, s);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Player
    drawPlayer();

    // UI: Combo
    if (comboCount > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(`${comboCount}X COMBO`, WIDTH/2, HEIGHT - 50);
        ctx.fillStyle = COLOR_CYAN;
        ctx.fillRect(WIDTH/2 - 50, HEIGHT - 40, (comboTimer/COMBO_MAX_TIME) * 100, 4);
    }

    // Boss Warning Overlay
    if (bossWarningTimer > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + (Math.sin(framesCount * 0.2) + 1) * 0.1})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = COLOR_RED;
        ctx.font = 'bold 30px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('AVISO: INIMIGO GIGANTE SE APROXIMANDO', WIDTH/2, HEIGHT/2);
    }

    // Screen Flash
    if (screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash * 0.15})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    ctx.restore();
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    
    let shipColor = COLOR_CYAN;
    if (overdriveActive) {
        if (playerLevel === 1) shipColor = COLOR_GOLD;
        else if (playerLevel === 2) shipColor = COLOR_CYAN;
        else if (playerLevel === 3) shipColor = COLOR_RED;
        else if (playerLevel === 4) shipColor = '#111'; // Black Level 4
    }
    
    const pulse = Math.sin(player.pulse) * 4;

    if (emergencyShieldCharges > 0) {
        ctx.save();
        ctx.globalAlpha = 0.58 + Math.sin(framesCount * 0.08) * 0.16;
        ctx.strokeStyle = COLOR_CYAN;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 42 + pulse, 30 + pulse * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = COLOR_CYAN;
        ctx.beginPath();
        ctx.ellipse(0, 0, 46 + pulse, 33 + pulse * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    ctx.shadowBlur = (overdriveActive ? (playerLevel === 4 ? 40 : 30) : 20) + pulse;
    ctx.shadowColor = shipColor === '#111' ? '#fff' : shipColor;
    ctx.fillStyle = shipColor;

    // Ship Body
    ctx.beginPath();
    ctx.moveTo(22, 0); 
    ctx.lineTo(-22, -18); 
    ctx.lineTo(-12, 0); 
    ctx.lineTo(-22, 18); 
    ctx.closePath();
    ctx.fill();

    // Reflections for Black Overdrive
    if (overdriveActive && playerLevel === 4) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Aura pulse for level 4
        ctx.beginPath();
        ctx.arc(0, 0, 40 + pulse * 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Engineering Core / Engine
    const eSize = (overdriveActive ? (playerLevel === 4 ? 40 : 30) : 15) + Math.random() * 10;
    const grad = ctx.createLinearGradient(-40, 0, -10, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(1, shipColor === '#111' ? '#fff' : shipColor);
    ctx.fillStyle = grad;
    ctx.fillRect(-22 - eSize, -10, eSize, 20);

    ctx.restore();
}

function gameOver() {
    if (!gameActive) return;
    playSfx(SFX.playerExplosion, 0.82);
    gameActive = false;
    finalScoreElement.innerText = score.toLocaleString('pt-BR');
    localStorage.setItem('ruptura_estelar_high_score', Math.max(score, parseInt(localStorage.getItem('ruptura_estelar_high_score')) || 0).toString());

    window.QCHArcadeResults.show({
        gameId: 'ruptura-estelar',
        victory: score >= 5000,
        score,
        stats: [
            { label: 'Score Final', value: score },
            { label: 'Alvo', value: '5000' },
        ],
    });
}

function addKillScore(baseScore) {
    const multiplier = HAS_SCORE_MULTIPLIER ? 1.5 : 1;
    updateScore(score + Math.round(baseScore * multiplier));
}

function absorbPlayerHit(x = player.x, y = player.y) {
    if (emergencyShieldCharges <= 0) return false;

    emergencyShieldCharges--;
    screenFlash = 4;
    shakeTime = 10;
    spawnExplosion(x, y, COLOR_CYAN, 28);
    updateStatus();
    return true;
}

function gameLoop() {
    if (!gameActive) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });
restartBtn.addEventListener('click', init);
exitBtn.addEventListener('click', () => { window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*'); });

const exitGameBtn = document.getElementById('exit-game-btn');
if (exitGameBtn) {
    exitGameBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
    });
}

init();
