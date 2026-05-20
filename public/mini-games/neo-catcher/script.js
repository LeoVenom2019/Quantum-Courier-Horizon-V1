/**
 * Neo Catcher - Game Logic
 */

// Game Constants
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 48;
const ITEM_SIZE = 24;
const PHASE_DURATION = 50000; // 50 seconds
const ACCEL_INTERVAL = 10000; // 10 seconds
const MAX_HEALTH = 100;
const HEAL_AMOUNT = 22;
const MAX_HEALS_PER_PHASE = 2;

function getArcadePerks() {
    try {
        return JSON.parse(localStorage.getItem('qch_arcade_perks_neo-catcher') || '[]');
    } catch (error) {
        return [];
    }
}

function hasArcadePerk(perkId) {
    return getArcadePerks().some(perk => perk && perk.id === perkId);
}

const HAS_CATCH_RANGE = hasArcadePerk('neo-catcher-catch-range');
const HAS_DAMAGE_DODGE = hasArcadePerk('neo-catcher-damage-dodge');
const BASE_CATCH_RANGE_BOOST = HAS_CATCH_RANGE ? 1.2 : 1.0;

const MISS_DAMAGE = {
    common: 4,
    blue: 6,
    purple: 8,
    rare: 10,
    black: 12
};

const PHASES = [
    { name: 'STREET', pt: 'RUA', minScore: 500, variant: 'default', bg: '#1a1a1a' },
    { name: 'BEACH', pt: 'PRAIA', minScore: 1200, variant: 'wind', bg: '#0ea5e9' },
    { name: 'BRIDGE', pt: 'PONTE', minScore: 2200, variant: 'irregular', bg: '#38bdf8' },
    { name: 'VOLCANO', pt: 'VULCÃO', minScore: 3500, variant: 'volcanic', bg: '#7f1d1d' }
];

const ITEMS = [
    { type: 'common', color: '#00f2ff', weight: 60, pts: 10, glow: false },
    { type: 'blue', color: '#3b82f6', weight: 15, pts: 25, glow: true },
    { type: 'purple', color: '#bc13fe', weight: 10, pts: 60, glow: true },
    { type: 'rare', color: '#fbbf24', weight: 10, pts: 100, glow: true },
    { type: 'black', color: '#111827', weight: 5, pts: 250, glow: true }
];

// Game State
let gameState = {
    active: false,
    phase: 0,
    score: 0,
    cumulativeScore: 0,
    health: MAX_HEALTH,
    phaseStartTime: 0,
    lastSpawnTime: 0,
    lastAccelTime: 0,
    combo: 0,
    multiplier: 1.0,
    highScore: parseInt(localStorage.getItem('neo_catcher_high_score')) || 0,
    speedFactor: 1.0,
    valueFactor: 1.0,
    items: [],
    particles: [],
    backgroundParticles: [], // Background decorations
    screenShake: 0,
    keys: {},
    // New states
    bonusSpawned: false,
    healsSpawned: 0,
    bombSpawned: false,
    immobilized: false,
    immobilizedTimer: 0,
    catchRangeBoost: BASE_CATCH_RANGE_BOOST,
    playerPulse: 0, // For collection feedback
    playerThrust: 0 // For movement feedback
};

// Player Object
const player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    speed: 8,
    targetX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const timerEl = document.getElementById('timer');
const comboEl = document.getElementById('combo-multiplier');
const healthFillEl = document.getElementById('health-fill');
const healthValueEl = document.getElementById('health-value');
const healthBoxEl = document.querySelector('.health-box');
const phaseNameEl = document.getElementById('phase-name');
const phaseNumberEl = document.getElementById('phase-number');
const overlay = document.getElementById('overlay');
const gameStatusEl = document.getElementById('game-status');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const exitBtn = document.getElementById('exit-btn');
const phaseResultsEl = document.getElementById('phase-results');
const finalResultsEl = document.getElementById('final-results');
const phaseScoreValEl = document.getElementById('phase-score-val');
const progressFillEl = document.getElementById('phase-progress-fill');
const announcementEl = document.getElementById('phase-announcement');
const phaseTitleEl = document.getElementById('phase-title');
const phaseDescEl = document.getElementById('phase-desc');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Initialize
function init() {
    highScoreEl.innerText = gameState.highScore.toString().padStart(5, '0');
    window.addEventListener('keydown', e => gameState.keys[e.code] = true);
    window.addEventListener('keyup', e => gameState.keys[e.code] = false);

    restartBtn.addEventListener('click', () => restartGame());
    nextBtn.addEventListener('click', () => nextPhase());
    exitBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
    });

    startPhase(0);
}

function initBackgroundParticles() {
    gameState.backgroundParticles = [];
    for (let i = 0; i < 40; i++) {
        gameState.backgroundParticles.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1,
            alpha: Math.random() * 0.5 + 0.2
        });
    }
}

function startPhase(phaseIdx) {
    gameState.active = true;
    gameState.phase = phaseIdx;
    gameState.score = 0; // Phase score
    gameState.phaseStartTime = Date.now();
    gameState.lastAccelTime = Date.now();
    gameState.speedFactor = 1.0 + (phaseIdx * 0.2);
    gameState.valueFactor = 1.0 + (phaseIdx * 0.1);
    gameState.items = [];
    gameState.combo = 0;
    gameState.multiplier = 1.0;
    gameState.bonusSpawned = false;
    gameState.healsSpawned = 0;
    gameState.bombSpawned = false;
    gameState.immobilized = false;
    gameState.immobilizedTimer = 0;
    gameState.catchRangeBoost = BASE_CATCH_RANGE_BOOST;
    
    initBackgroundParticles();
    
    updateUI();
    overlay.classList.add('hidden');
    
    // Announcement
    announcementEl.classList.remove('hidden');
    phaseTitleEl.innerText = `PHASE ${phaseIdx + 1}`;
    phaseDescEl.innerText = PHASES[phaseIdx].name;
    
    setTimeout(() => announcementEl.classList.add('hidden'), 3000);
    
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameState.cumulativeScore = 0;
    gameState.health = MAX_HEALTH;
    startPhase(0);
}

function nextPhase() {
    if (gameState.phase < PHASES.length - 1) {
        startPhase(gameState.phase + 1);
    }
}

function updateUI() {
    const currentScoreStr = (gameState.cumulativeScore + gameState.score).toString().padStart(5, '0');
    if (scoreEl.innerText !== currentScoreStr) {
        scoreEl.innerText = currentScoreStr;
        scoreEl.style.transform = 'scale(1.1)';
        setTimeout(() => scoreEl.style.transform = 'scale(1)', 100);
    }
    
    comboEl.innerText = `x${gameState.multiplier.toFixed(1)}`;
    if (gameState.multiplier > 1.0) {
        comboEl.style.color = 'var(--color-gold)';
        comboEl.style.textShadow = `0 0 ${10 * gameState.multiplier}px var(--color-gold)`;
    } else {
        comboEl.style.color = '#fff';
        comboEl.style.textShadow = '0 0 10px var(--color-accent)';
    }

    phaseNameEl.innerText = PHASES[gameState.phase].name;
    phaseNumberEl.innerText = `${(gameState.phase + 1).toString().padStart(2, '0')}/04`;
    const healthPercent = Math.max(0, Math.min(100, gameState.health));
    healthFillEl.style.width = `${healthPercent}%`;
    healthValueEl.innerText = `${Math.round(healthPercent)}%`;
    healthBoxEl.classList.toggle('low', healthPercent <= 30);
    
    const remaining = Math.max(0, Math.ceil((PHASE_DURATION - (Date.now() - gameState.phaseStartTime)) / 1000));
    timerEl.innerText = remaining;
    
    if (remaining <= 10) {
        timerEl.style.color = 'var(--color-red)';
        timerEl.style.textShadow = `0 0 ${15 + Math.sin(Date.now() / 100) * 10}px var(--color-red)`;
    } else {
        timerEl.style.color = '#fff';
        timerEl.style.textShadow = '0 0 10px var(--color-accent)';
    }
}

function spawnItem() {
    const now = Date.now();
    const elapsed = now - gameState.phaseStartTime;
    const progress = elapsed / PHASE_DURATION;
    
    let itemType;
    
    // Check if we should spawn BONUS (exactly 1 per phase, usually around middle)
    if (!gameState.bonusSpawned && progress > 0.4 && Math.random() > 0.95) {
        itemType = { type: 'bonus', color: '#10b981', pts: 0, glow: true, weight: 0 };
        gameState.bonusSpawned = true;
    }
    else if (gameState.healsSpawned < MAX_HEALS_PER_PHASE && progress > 0.18 && Math.random() > 0.965) {
        itemType = { type: 'heal', color: '#22c55e', pts: 0, glow: true, weight: 0 };
        gameState.healsSpawned++;
    } 
    // Check if we should spawn BOMB (exactly 1 per phase, usually second half)
    else if (!gameState.bombSpawned && progress > 0.6 && Math.random() > 0.95) {
        itemType = { type: 'bomb', color: '#ff4b2b', pts: 0, glow: true, weight: 0 };
        gameState.bombSpawned = true;
    }
    else {
        // Weighted random for regular items
        const totalWeight = ITEMS.reduce((acc, item) => acc + item.weight, 0);
        let random = Math.random() * totalWeight;
        for (const item of ITEMS) {
            if (random < item.weight) {
                itemType = item;
                break;
            }
            random -= item.weight;
        }
    }

    if (!itemType) itemType = ITEMS[0];

    const item = {
        x: Math.random() * (CANVAS_WIDTH - ITEM_SIZE - 20) + 10,
        y: -ITEM_SIZE,
        type: itemType.type,
        color: itemType.color,
        pts: Math.floor((itemType.pts || 0) * gameState.valueFactor),
        speed: (3 + Math.random() * 2) * gameState.speedFactor,
        size: ITEM_SIZE,
        vx: 0, // Horizontal velocity
        wiggle: 0,
        wiggleTimer: 0,
        glow: itemType.glow
    };

    // Phase variants
    if (PHASES[gameState.phase].variant === 'wind') {
        item.vx = 1.5; // Initial push
    } else if (PHASES[gameState.phase].variant === 'irregular') {
        item.wiggle = 2;
    } else if (PHASES[gameState.phase].variant === 'volcanic') {
        item.speed *= 1.2;
        if (item.type === 'rare' || item.type === 'black') item.pts *= 1.5;
    }

    gameState.items.push(item);
}

function gameLoop() {
    if (!gameState.active) return;

    const now = Date.now();
    const elapsed = now - gameState.phaseStartTime;

    if (elapsed >= PHASE_DURATION) {
        endPhase();
        return;
    }

    // Difficulty scaling every 10s
    if (now - gameState.lastAccelTime >= ACCEL_INTERVAL) {
        gameState.speedFactor *= 1.05;
        gameState.valueFactor *= 1.1;
        gameState.lastAccelTime = now;
        spawnParticles(CANVAS_WIDTH/2, 50, '#ff4b2b', 20); // Visual cue
    }

    // Spawning logic
    const spawnRate = 1000 / (1 + gameState.phase * 0.5 + (elapsed / 10000));
    if (now - gameState.lastSpawnTime > spawnRate) {
        spawnItem();
        gameState.lastSpawnTime = now;
    }

    update();
    draw();
    updateUI();

    if (gameState.screenShake > 0) gameState.screenShake *= 0.9;

    requestAnimationFrame(gameLoop);
}

function update() {
    // Screen shake
    if (gameState.screenShake < 0.1) gameState.screenShake = 0;

    // Immobilization logic
    if (gameState.immobilized) {
        gameState.immobilizedTimer -= 16.67; // Approx ms per frame
        if (gameState.immobilizedTimer <= 0) {
            gameState.immobilized = false;
        }
    }

    // Player movement
    if (!gameState.immobilized) {
        if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
            player.x -= player.speed;
            gameState.playerThrust = -1;
        } else if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
            player.x += player.speed;
            gameState.playerThrust = 1;
        } else {
            gameState.playerThrust *= 0.8;
        }
    }

    // Boundaries
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x));

    // Items update
    const effectiveWidth = PLAYER_WIDTH * gameState.catchRangeBoost;
    const offset = (effectiveWidth - PLAYER_WIDTH) / 2;

    for (let i = gameState.items.length - 1; i >= 0; i--) {
        const item = gameState.items[i];
        
        // Physics
        item.y += item.speed;
        
        // Initial move
        item.x += item.vx;
        
        // Apply wiggle if present
        if (item.wiggle) {
            item.wiggleTimer += 0.1;
            item.x += Math.sin(item.wiggleTimer) * item.wiggle;
        }
        
        // Wall Bounce Logic (Applied after all movements)
        if (item.x <= 0) {
            item.x = 0;
            item.vx = Math.abs(item.vx) || 1.0; // Ensure it moves right
            if (item.vx < 1) item.vx = 1; // Minimum bounce force
        } else if (item.x + item.size >= CANVAS_WIDTH) {
            item.x = CANVAS_WIDTH - item.size;
            item.vx = -Math.abs(item.vx) || -1.0; // Ensure it moves left
            if (item.vx > -1) item.vx = -1; // Minimum bounce force
        }

        // Collision Check
        if (item.y + item.size > player.y && 
            item.y < player.y + PLAYER_HEIGHT &&
            item.x + item.size > (player.x - offset) &&
            item.x < (player.x + PLAYER_WIDTH + offset)) {
            
            // Captured
            collectItem(item);
            gameState.items.splice(i, 1);
            continue;
        }

        // Out of bounds
        if (item.y > CANVAS_HEIGHT) {
            missItem(item);
            gameState.items.splice(i, 1);
        }
    }

    // Particles update
    if (gameState.playerPulse > 0) gameState.playerPulse -= 0.05;

    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) gameState.particles.splice(i, 1);
    }

    // Background particles update
    gameState.backgroundParticles.forEach(p => {
        p.y += p.speed;
        if (p.y > CANVAS_HEIGHT) {
            p.y = -10;
            p.x = Math.random() * CANVAS_WIDTH;
        }
    });

    // Item trails
    gameState.items.forEach(item => {
        if (!item.trail) item.trail = [];
        item.trail.push({ x: item.x + item.size / 2, y: item.y + item.size / 2, life: 1.0 });
        if (item.trail.length > 8) item.trail.shift();
        item.trail.forEach(t => t.life -= 0.1);
    });
}

function collectItem(item) {
    gameState.screenShake = 8;
    gameState.playerPulse = 1.0;
    
    // Scale count based on combo
    const comboBonus = Math.min(20, Math.floor(gameState.combo / 2));
    
    if (item.type === 'bomb') {
        gameState.immobilized = true;
        gameState.immobilizedTimer = 2000;
        gameState.combo = 0;
        gameState.multiplier = 1.0;
        spawnParticles(player.x + PLAYER_WIDTH/2, player.y + PLAYER_HEIGHT/2, '#ff4b2b', 40);
        createScorePopup(player.x, player.y - 20, "STUNNED!", '#ff4b2b');
        return;
    }

    if (item.type === 'bonus') {
        gameState.catchRangeBoost += 0.1;
        spawnParticles(player.x + PLAYER_WIDTH/2, player.y + PLAYER_HEIGHT/2, '#10b981', 40);
        createScorePopup(player.x, player.y - 20, "RANGE UP!", '#10b981');
        return;
    }

    if (item.type === 'heal') {
        const before = gameState.health;
        gameState.health = Math.min(MAX_HEALTH, gameState.health + HEAL_AMOUNT);
        spawnParticles(player.x + PLAYER_WIDTH/2, player.y + PLAYER_HEIGHT/2, '#22c55e', 48);
        createScorePopup(player.x, player.y - 20, `+${Math.round(gameState.health - before)} LIFE`, '#22c55e');
        return;
    }

    gameState.combo++;
    gameState.multiplier = 1.0 + (Math.floor(gameState.combo / 5) * 0.1);
    
    const points = Math.floor(item.pts * gameState.multiplier);
    gameState.score += points;
    
    // Double particles as requested
    const pCount = (item.type === 'rare' || item.type === 'black') ? 60 : 30 + comboBonus;
    spawnParticles(item.x + item.size/2, item.y + item.size/2, item.color, pCount);
    
    const scale = 1.0 + (gameState.multiplier - 1.0);
    createScorePopup(item.x, item.y, `+${points}`, item.color, scale);

    // Persist score update
    window.parent.postMessage({ 
        type: 'SCORE_UPDATE', 
        gameId: 'neo-catcher', 
        score: gameState.cumulativeScore + gameState.score 
    }, '*');
}

function missItem(item) {
    // Reset combo growth but don't reset score
    gameState.combo = 0;
    gameState.multiplier = 1.0;
    const damage = MISS_DAMAGE[item.type] || 0;
    if (damage <= 0) return;

    if (HAS_DAMAGE_DODGE && Math.random() < 0.2) {
        gameState.screenShake = Math.max(gameState.screenShake, 4);
        createScorePopup(item.x, CANVAS_HEIGHT - 28, 'DANO EVITADO', '#67e8f9', 0.9);
        return;
    }

    gameState.health = Math.max(0, gameState.health - damage);
    gameState.screenShake = Math.max(gameState.screenShake, 6);
    createScorePopup(item.x, CANVAS_HEIGHT - 28, `-${damage} LIFE`, '#ff4b2b');

    if (gameState.health <= 0) {
        finishByDeath();
    }
}

function endPhase() {
    gameState.active = false;
    gameState.cumulativeScore += gameState.score;
    const passed = true;
    
    overlay.classList.remove('hidden');
    phaseResultsEl.classList.remove('hidden');
    phaseScoreValEl.innerText = gameState.score;
    progressFillEl.style.width = '100%';
    
    const pbContainer = document.querySelector('.progress-bar-bg');
    if (passed) {
        pbContainer.classList.remove('danger');
        gameStatusEl.innerText = gameState.phase === 3 ? 'SYSTEM RESTORED' : 'PHASE COMPLETE';
        gameStatusEl.style.color = 'var(--color-green)';
        
        if (gameState.phase === 3) {
            // Victory
            showFinalResults(true);
        } else {
            nextBtn.classList.remove('hidden');
            restartBtn.classList.add('hidden');
        }
    } else {
        pbContainer.classList.add('danger');
        gameStatusEl.innerText = 'PHASE FAILED';
        gameStatusEl.style.color = 'var(--color-red)';
        showFinalResults(false);
    }

    // Save high score if applicable
    if (gameState.cumulativeScore > gameState.highScore) {
        gameState.highScore = gameState.cumulativeScore;
        localStorage.setItem('neo_catcher_high_score', gameState.highScore);
        highScoreEl.innerText = gameState.highScore.toString().padStart(5, '0');
    }

    window.parent.postMessage({ 
        type: 'SCORE_UPDATE', 
        gameId: 'neo-catcher', 
        score: gameState.cumulativeScore 
    }, '*');
}

function finishByDeath() {
    if (!gameState.active) return;
    gameState.active = false;
    const totalScore = gameState.cumulativeScore + gameState.score;
    if (totalScore > gameState.highScore) {
        gameState.highScore = totalScore;
        localStorage.setItem('neo_catcher_high_score', gameState.highScore);
        highScoreEl.innerText = gameState.highScore.toString().padStart(5, '0');
    }
    window.parent.postMessage({
        type: 'SCORE_UPDATE',
        gameId: 'neo-catcher',
        score: totalScore
    }, '*');
    showFinalResults(false, totalScore);
}

function showFinalResults(victory, overrideScore) {
    phaseResultsEl.classList.add('hidden');
    finalResultsEl.classList.remove('hidden');
    const finalScore = overrideScore ?? gameState.cumulativeScore;
    document.getElementById('final-score').innerText = finalScore;
    
    nextBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');

    window.QCHArcadeResults.show({
        gameId: 'neo-catcher',
        victory,
        score: finalScore,
        stats: [
            { label: 'Total Score', value: finalScore },
            { label: 'Phase', value: `${gameState.phase + 1}/4` },
            { label: 'Life', value: `${Math.round(gameState.health)}%` },
            { label: 'Record', value: gameState.highScore },
        ],
    });
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        gameState.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color
        });
    }
}

let popups = [];
function createScorePopup(x, y, text, color = '#fff', scale = 1.0) {
    popups.push({ x, y, text, color, life: 1.0, scale });
}

function draw() {
    ctx.save();
    if (gameState.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * gameState.screenShake, (Math.random() - 0.5) * gameState.screenShake);
    }
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background variation based on phase
    drawBackground();

    // Draw Background Particles
    gameState.backgroundParticles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Item Trails
    gameState.items.forEach(item => {
        if (item.trail) {
            item.trail.forEach(t => {
                ctx.globalAlpha = t.life * 0.3;
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc(t.x, t.y, item.size / 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    });
    ctx.globalAlpha = 1.0;

    // Draw Items
    gameState.items.forEach(item => {
        ctx.fillStyle = item.color;
        
        if (item.glow) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        if (item.type === 'common' || item.type === 'blue' || item.type === 'purple' || item.type === 'black') {
            ctx.fillRect(item.x, item.y, item.size, item.size);
        } else if (item.type === 'bomb') {
             // Unique bomb appearance
            ctx.fillStyle = '#ff4b2b';
            ctx.beginPath();
            ctx.arc(item.x + item.size/2, item.y + item.size/2, item.size/2, 0, Math.PI * 2);
            ctx.fill();
            // Fuse
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(item.x + item.size/2, item.y);
            ctx.lineTo(item.x + item.size, item.y - 5);
            ctx.stroke();
        } else if (item.type === 'heal') {
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(item.x + item.size/2, item.y + item.size/2, item.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ecfdf5';
            ctx.fillRect(item.x + item.size/2 - 3, item.y + 5, 6, item.size - 10);
            ctx.fillRect(item.x + 5, item.y + item.size/2 - 3, item.size - 10, 6);
        } else if (item.type === 'bonus') {
            // Bonus item appearance
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(item.x + item.size/2, item.y + item.size/2, item.size/2, 0, Math.PI * 2);
            ctx.fill();
            // Plus sign
            ctx.fillStyle = '#fff';
            ctx.fillRect(item.x + item.size/2 - 2, item.y + 4, 4, item.size - 8);
            ctx.fillRect(item.x + 4, item.y + item.size/2 - 2, item.size - 8, 4);
        } else {
            // Rare items are diamond shaped
            ctx.beginPath();
            ctx.moveTo(item.x + item.size/2, item.y);
            ctx.lineTo(item.x + item.size, item.y + item.size/2);
            ctx.lineTo(item.x + item.size/2, item.y + item.size);
            ctx.lineTo(item.x, item.y + item.size/2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    });

    // Draw Player (Robot)
    drawPlayer();

    // Draw Particles
    gameState.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1.0;

    // Draw Popups
    for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        const fontSize = Math.floor(16 * p.scale);
        ctx.font = `bold ${fontSize}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillText(p.text, p.x + ITEM_SIZE/2, p.y);
        ctx.shadowBlur = 0;
        p.y -= 1.5;
        p.life -= 0.02;
        if (p.life <= 0) popups.splice(i, 1);
    }
    ctx.globalAlpha = 1.0;
    ctx.restore(); // Restore from world/shake state
    
    ctx.textAlign = 'start';
}

function drawBackground() {
    const phase = PHASES[gameState.phase];
    const now = Date.now();
    
    // Base color with slight vertical gradient shift
    const baseGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    baseGrad.addColorStop(0, phase.bg);
    baseGrad.addColorStop(1, '#000000');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle Grid with parallax shift
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridOffset = (now / 50) % 50;
    
    ctx.beginPath();
    for(let i = -50; i < CANVAS_WIDTH + 50; i += 50) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
    }
    for(let i = -50; i < CANVAS_HEIGHT + 50; i += 50) {
        ctx.moveTo(0, i + gridOffset);
        ctx.lineTo(CANVAS_WIDTH, i + gridOffset);
    }
    ctx.stroke();
    
    // Phase-specific patterns
    if (phase.variant === 'volcanic') {
        // Lava at bottom pulse
        const lavaIntensity = 0.6 + Math.sin(now / 500) * 0.4;
        const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 60, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(255, 75, 43, ${lavaIntensity * 0.8})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);
        
        // Heat distortion
        ctx.fillStyle = 'rgba(255, 75, 43, 0.05)';
        for(let i = 0; i < 8; i++) {
            const x = (now / 30 + i * 80) % CANVAS_WIDTH;
            const h = 100 + Math.random() * 50;
            ctx.fillRect(x, CANVAS_HEIGHT - h, 2, h);
        }
    } else if (phase.variant === 'wind') {
        // Digital "Wind" streaks
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
        for(let i = 0; i < 20; i++) {
            const x = (i * 30 + now / 2) % CANVAS_WIDTH;
            const len = 40 + Math.random() * 60;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - 30, len);
            ctx.stroke();
        }
    } else if (phase.variant === 'irregular') {
        // Floating "Data" clusters (Nodes)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for(let i = 0; i < 5; i++) {
            const x = (now / 100 + i * 150) % (CANVAS_WIDTH + 200) - 100;
            const y = (Math.sin(now / 1000 + i) * 100) + 200;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Collection Pulse
    if (gameState.playerPulse > 0) {
        ctx.strokeStyle = varToHex('--color-accent');
        ctx.globalAlpha = gameState.playerPulse;
        ctx.lineWidth = 2;
        ctx.strokeRect(-gameState.playerPulse * 20, -gameState.playerPulse * 20, PLAYER_WIDTH + gameState.playerPulse * 40, PLAYER_HEIGHT + gameState.playerPulse * 40);
        ctx.globalAlpha = 1.0;
    }

    // Immobilized / Stunned effect
    if (gameState.immobilized) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4b2b';
        // Draw some static/electricity
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for(let i = 0; i < 3; i++) {
           ctx.beginPath();
           ctx.moveTo(Math.random() * PLAYER_WIDTH, -10);
           ctx.lineTo(Math.random() * PLAYER_WIDTH, PLAYER_HEIGHT + 10);
           ctx.stroke();
        }
    }

    // Catch range indicator (faint glow)
    if (gameState.catchRangeBoost > 1.0) {
        const effectiveWidth = PLAYER_WIDTH * gameState.catchRangeBoost;
        const offset = (effectiveWidth - PLAYER_WIDTH) / 2;
        ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + Math.sin(Date.now() / 300) * 0.05})`;
        ctx.fillRect(-offset, 0, effectiveWidth, PLAYER_HEIGHT);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-offset, 0, effectiveWidth, PLAYER_HEIGHT);
        ctx.setLineDash([]);
    }

    // Robot body
    ctx.fillStyle = gameState.immobilized ? '#4a5568' : '#1e293b';
    ctx.strokeStyle = gameState.immobilized ? '#ff4b2b' : varToHex('--color-accent');
    ctx.lineWidth = 2;
    
    // Chassis
    roundRect(ctx, 0, 10, PLAYER_WIDTH, PLAYER_HEIGHT - 20, 5, true, true);
    
    // Head/Sensor
    ctx.fillStyle = gameState.immobilized ? '#2d3748' : '#0f172a';
    roundRect(ctx, 12, 0, PLAYER_WIDTH - 24, 15, 3, true, true);
    
    // Eye/Core
    ctx.fillStyle = gameState.immobilized ? '#ff4b2b' : varToHex('--color-accent');
    const eyeWidth = (PLAYER_WIDTH - 30);
    ctx.shadowBlur = gameState.immobilized ? 15 : 10;
    ctx.shadowColor = gameState.immobilized ? '#ff4b2b' : varToHex('--color-accent');
    
    if (gameState.immobilized) {
        // Red flashing eye
        if (Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.fillRect(15, 5, eyeWidth, 4);
        }
    } else {
        ctx.fillRect(15 + (Math.sin(Date.now() / 200) * 2), 5, eyeWidth, 4);
    }
    
    // Wheels
    ctx.fillStyle = '#000';
    ctx.shadowBlur = 0;
    ctx.fillRect(5, PLAYER_HEIGHT - 12, 12, 8);
    ctx.fillRect(PLAYER_WIDTH - 17, PLAYER_HEIGHT - 12, 12, 8);

    // Thruster / Glow at bottom
    if (!gameState.immobilized) {
        const glowSize = 5 + Math.sin(Date.now() / 50) * 3;
        const thrustOffset = gameState.playerThrust * 10;
        
        ctx.fillStyle = varToHex('--color-accent');
        ctx.shadowBlur = 15;
        ctx.shadowColor = varToHex('--color-accent');
        ctx.globalAlpha = 0.6;
        // Central thruster
        ctx.fillRect(PLAYER_WIDTH / 2 - 10 - thrustOffset, PLAYER_HEIGHT - 5, 20, glowSize);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function varToHex(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

init();
