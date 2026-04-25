/**
 * The Robot Runner - QCH Mini-Game (Ultimate Arcade Edition)
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dangerOverlay = document.getElementById('danger-overlay');

// Game Config
const TILE_SIZE = 25;
const BOOST_MAX = 100;
const BOOST_DURATION = 2500;
const POWER_DURATION = 8000;
const GHOST_RESPAWN_TIME = 3000;

// Visual Effects State
const particles = [];
const trails = [];
let screenShake = 0;
let displayedScore = 0;
let gridOffset = 0;

// Themes
const THEMES = [
    { name: 'PHASE 01', wall: '#38bdf8', wallGlow: 'rgba(56, 189, 248, 0.8)', pellet: '#06b6d4', power: '#f43f5e', bg: '#050510' },
    { name: 'PHASE 02', wall: '#a855f7', wallGlow: 'rgba(168, 85, 247, 0.8)', pellet: '#ec4899', power: '#ef4444', bg: '#0b0015' },
    { name: 'PHASE 03', wall: '#10b981', wallGlow: 'rgba(16, 185, 129, 0.8)', pellet: '#fbbf24', power: '#ffffff', bg: '#000f08' }
];

// Maze Maps (0: empty, 1: wall, 2: pellet, 3: power pellet, 4: ghost spawn)
const LabyrinthMaps = [
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,2,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
        [0,0,0,1,2,1,0,0,4,0,4,0,0,1,2,1,0,0,0,0],
        [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0,4],
        [1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,2,2,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,2,1],
        [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,2,1],
        [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,2,1,2,1,1,2,1,1,1,2,1,1],
        [1,3,1,1,1,2,1,1,2,2,2,1,1,2,1,1,1,3,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1],
        [1,2,2,2,1,1,2,2,2,1,2,2,2,1,1,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,2,1,1],
        [1,2,2,2,2,1,0,4,0,1,0,4,0,1,2,2,2,2,2,1],
        [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1,1],
        [1,3,2,2,2,0,0,1,0,4,0,1,0,0,2,2,2,2,3,1],
        [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1,1],
        [1,3,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,3,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,3,1,1],
        [1,1,1,2,1,2,1,1,2,1,2,1,1,2,1,2,1,1,1,1],
        [1,2,2,2,2,2,1,1,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,2,2,2,1,2,2,2,2,1,1,1,2,1,1],
        [1,2,1,4,1,1,1,1,2,1,2,1,1,1,1,4,1,2,1,1],
        [1,2,1,0,1,2,2,2,2,0,2,2,2,2,1,0,1,2,1,1],
        [1,2,1,4,1,2,1,1,1,0,1,1,1,2,1,4,1,2,1,1],
        [1,2,1,1,1,2,1,0,0,0,0,0,1,2,1,1,1,2,1,1],
        [1,2,2,2,2,2,1,0,1,1,1,0,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,0,1,4,1,0,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,0,1,1,1,0,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,2,2,2,2,2,1,1,1,1,1,2,1,1],
        [1,2,2,2,2,2,2,2,1,1,1,2,2,2,2,2,2,2,2,1],
        [1,1,1,2,1,1,1,2,1,0,1,2,1,1,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,1,0,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1],
        [1,2,1,3,1,2,2,2,2,2,2,2,2,2,1,3,1,2,1,1],
        [1,2,2,2,2,2,1,1,1,1,1,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
];

// Classes
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 3 + 2;
    }
    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.size *= 0.95;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Game State
let currentPhase = 0;
let score = 0;
let gameState = 'MENU';
let startTime = 0;
let totalTime = 0;

// Player
const player = {
    x: 0, y: 0,
    gridX: 1, gridY: 10,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 0.12,
    boost: 0,
    isBoosting: false,
    boostTimer: 0,
    isPowered: false,
    powerTimer: 0,
    angle: 0
};

// Ghosts
let ghosts = [];
const ghostColors = [
    { base: '#FFFFFF', glow: '#FFFFFF', behavior: 'CHASE' },
    { base: '#fbbf24', glow: '#fbbf24', behavior: 'RANDOM' },
    { base: '#06b6d4', glow: '#06b6d4', behavior: 'AMBUSH' },
    { base: '#ec4899', glow: '#ec4899', behavior: 'CHASE' }
];

let ghostSpawnPoints = [];
let lastGhostSpawnTime = 0;
const GHOST_SPAWN_INTERVAL = 2000; // 2 seconds between spawns

// Initialize
function initLevel(phase) {
    currentPhase = phase % 3;
    const map = LabyrinthMaps[currentPhase];
    
    player.gridX = 1;
    player.gridY = 10;
    player.x = player.gridX * TILE_SIZE;
    player.y = player.gridY * TILE_SIZE;
    player.dir = { x: 0, y: 0 };
    player.nextDir = { x: 0, y: 0 };
    player.boost = 0;
    player.isBoosting = false;
    player.isPowered = false;

    ghosts = [];
    ghostSpawnPoints = [];
    lastGhostSpawnTime = 0;

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 4) {
                ghostSpawnPoints.push({ r, c });
            }
        }
    }

    canvas.width = map[0].length * TILE_SIZE;
    canvas.height = map.length * TILE_SIZE;
    document.getElementById('phase-display').innerText = THEMES[currentPhase].name;
}

function spawnGhost() {
    const phaseLimits = [2, 3, 4]; // Phase 1: 2 ghosts, Phase 2: 3 ghosts, Last Phase: 4 ghosts
    if (ghosts.length >= phaseLimits[currentPhase]) return;

    const MIN_SPAWN_DIST = 7;
    const validPoints = ghostSpawnPoints.filter(p => dist(p.c, p.r, player.gridX, player.gridY) >= MIN_SPAWN_DIST);
    
    if (validPoints.length === 0) return;

    const point = validPoints[Math.floor(Math.random() * validPoints.length)];
    const config = ghostColors[ghosts.length % ghostColors.length];

    ghosts.push({
        x: point.c * TILE_SIZE, y: point.r * TILE_SIZE,
        gridX: point.c, gridY: point.r,
        spawnX: point.c, spawnY: point.r,
        dir: { x: 0, y: 0 },
        color: config,
        speed: 0.05 + (currentPhase * 0.02),
        frightened: false,
        dead: false,
        respawnTimer: 0,
        behavior: config.behavior
    });
}

function update(dt) {
    if (gameState !== 'PLAYING') return;

    // Time factor for smooth movement
    const timeStep = dt / 16.67;

    // Trail creation
    if (player.dir.x !== 0 || player.dir.y !== 0) {
        trails.push({ x: player.x + TILE_SIZE/2, y: player.y + TILE_SIZE/2, life: 1.0 });
    }
    while (trails.length > 20) trails.shift();
    trails.forEach(t => t.life -= 0.05);

    // Particle update
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(timeStep);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Player logic
    handlePlayerMovement(timeStep);
    
    // Ghost logic
    handleGhostAI(timeStep);

    // Collision and collection logic (moved out of movement to ensure it runs even when stationary)
    checkGhostCollisions();
    checkItemCollection();

    // Scoring interpolation
    if (displayedScore < score) {
        displayedScore += Math.ceil((score - displayedScore) * 0.1);
        document.getElementById('score-display').innerText = displayedScore.toString().padStart(6, '0');
    }

    if (player.isBoosting) {
        player.boostTimer -= dt;
        if (player.boostTimer <= 0) player.isBoosting = false;
    }

    if (player.isPowered) {
        player.powerTimer -= dt;
        if (player.powerTimer <= 0) {
            player.isPowered = false;
            ghosts.forEach(g => g.frightened = false);
        }
    }

    if (screenShake > 0) screenShake -= 1;

    updateHUD(Date.now() - startTime);
}

function handlePlayerMovement(ts) {
    const baseSpeed = player.speed * TILE_SIZE;
    const moveSpeed = (player.isBoosting ? baseSpeed * 2.5 : baseSpeed) * ts;
    
    let remaining = moveSpeed;
    const epsilon = 0.01;

    while (remaining > 0) {
        const tx = player.gridX * TILE_SIZE;
        const ty = player.gridY * TILE_SIZE;
        
        // Are we precisely at the center of the current logical tile?
        const atX = Math.abs(player.x - tx) < epsilon;
        const atY = Math.abs(player.y - ty) < epsilon;

        if (atX && atY) {
            // Force exact alignment to prevent drift
            player.x = tx;
            player.y = ty;

            // 1. Process Input Buffer (Turning)
            if (player.nextDir.x !== 0 || player.nextDir.y !== 0) {
                // Can we turn in the requested direction?
                if (canMove(player.gridX + player.nextDir.x, player.gridY + player.nextDir.y)) {
                    player.dir = player.nextDir;
                    // Reset nextDir after applying (optional, but makes controls feel sharper)
                    // player.nextDir = { x: 0, y: 0 }; 
                }
            }

            // 2. Continuous Path Finding
            if (player.dir.x !== 0 || player.dir.y !== 0) {
                if (canMove(player.gridX + player.dir.x, player.gridY + player.dir.y)) {
                    // Logically update the grid position we are moving towards
                    player.gridX += player.dir.x;
                    player.gridY += player.dir.y;
                } else {
                    // Blocked by wall
                    player.dir = { x: 0, y: 0 };
                }
            }

            // If we are stopped, we can't consume more movement this frame
            if (player.dir.x === 0 && player.dir.y === 0) break;
        }

        // 3. Move towards the logical target (the center of gridX/gridY)
        const ntx = player.gridX * TILE_SIZE;
        const nty = player.gridY * TILE_SIZE;
        
        const dx = ntx - player.x;
        const dy = nty - player.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (remaining >= d) {
            player.x = ntx;
            player.y = nty;
            remaining -= d;
            // Immediate check for item collection at this step
            checkItemCollection();
        } else {
            // Move partially
            player.x += (dx / d) * remaining;
            player.y += (dy / d) * remaining;
            remaining = 0;
        }
    }

    if (player.dir.x !== 0 || player.dir.y !== 0) {
        player.angle = Math.atan2(player.dir.y, player.dir.x);
    }
}

function checkItemCollection() {
    const gx = Math.round(player.x / TILE_SIZE);
    const gy = Math.round(player.y / TILE_SIZE);
    const map = LabyrinthMaps[currentPhase];

    if (gy < 0 || gy >= map.length || gx < 0 || gx >= map[0].length) return;

    if (map[gy][gx] === 2) {
        map[gy][gx] = 0; score += 10; player.boost = Math.min(100, player.boost + 3);
        notifyParentOfScore();
        spawnParticles(player.x + TILE_SIZE/2, player.y + TILE_SIZE/2, THEMES[currentPhase].pellet, 5);
        updateBoostBar(); checkLevelWin();
    } else if (map[gy][gx] === 3) {
        map[gy][gx] = 0; score += 50; player.boost = Math.min(100, player.boost + 15);
        notifyParentOfScore();
        spawnParticles(player.x + TILE_SIZE/2, player.y + TILE_SIZE/2, THEMES[currentPhase].power, 15);
        player.isPowered = true; player.powerTimer = POWER_DURATION;
        ghosts.forEach(g => g.frightened = true);
        updateBoostBar(); checkLevelWin();
    }
}

function notifyParentOfScore() {
    window.parent.postMessage({ 
        type: 'SCORE_UPDATE', 
        gameId: 'robot-runner', 
        score: score 
    }, '*');
}

function checkGhostCollisions() {
    if (gameState !== 'PLAYING') return false;
    let collisionDetected = false;
    let isNear = false;

    ghosts.forEach(g => {
        if (g.dead) return;
        const d = dist(player.x, player.y, g.x, g.y);
        if (d < TILE_SIZE * 0.75) {
            if (player.isPowered) {
                g.dead = true; g.respawnTimer = GHOST_RESPAWN_TIME; score += 200;
                notifyParentOfScore();
                spawnParticles(g.x + TILE_SIZE/2, g.y + TILE_SIZE/2, '#FFFFFF', 30);
                screenShake = 10;
            } else { 
                gameState = 'GAMEOVER'; 
                notifyParentOfScore();
                document.getElementById('game-over').classList.remove('hidden');
                collisionDetected = true;
            }
        } else if (d < TILE_SIZE * 2) { isNear = true; }
    });

    if (isNear) dangerOverlay.classList.add('danger-active');
    else dangerOverlay.classList.remove('danger-active');

    return collisionDetected;
}

function canMove(gx, gy) {
    const map = LabyrinthMaps[currentPhase];
    if (gy < 0 || gy >= map.length || gx < 0 || gx >= map[0].length) return false;
    return map[gy][gx] !== 1;
}

function handleGhostAI(ts) {
    // Spawning logic
    if (Date.now() - lastGhostSpawnTime > GHOST_SPAWN_INTERVAL) {
        spawnGhost();
        lastGhostSpawnTime = Date.now();
    }

    ghosts.forEach(ghost => {
        if (ghost.dead) {
            ghost.respawnTimer -= 16 * ts;
            if (ghost.respawnTimer <= 0) {
                // Safety Check: Don't respawn on top of player or too close
                if (dist(ghost.spawnX, ghost.spawnY, player.gridX, player.gridY) > 6) {
                    ghost.dead = false;
                    ghost.x = ghost.spawnX * TILE_SIZE;
                    ghost.y = ghost.spawnY * TILE_SIZE;
                } else {
                    // Try again in 500ms
                    ghost.respawnTimer = 500;
                }
            }
            return;
        }

        const moveSpeed = ghost.speed * TILE_SIZE * ts;
        const atX = Math.abs(ghost.x % TILE_SIZE) < moveSpeed;
        const atY = Math.abs(ghost.y % TILE_SIZE) < moveSpeed;

        if (atX && atY) {
            const gx = Math.round(ghost.x / TILE_SIZE);
            const gy = Math.round(ghost.y / TILE_SIZE);
            ghost.gridX = gx;
            ghost.gridY = gy;
            ghost.x = gx * TILE_SIZE;
            ghost.y = gy * TILE_SIZE;

            const possible = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}].filter(d => 
                canMove(gx + d.x, gy + d.y) && !(d.x === -ghost.dir.x && d.y === -ghost.dir.y)
            );

            if (possible.length > 0) {
                if (player.isPowered) {
                    possible.sort((a,b) => dist(gx+b.x, gy+b.y, player.gridX, player.gridY) - dist(gx+a.x, gy+a.y, player.gridX, player.gridY));
                } else {
                    if (ghost.behavior === 'CHASE') {
                        possible.sort((a,b) => dist(gx+a.x, gy+a.y, player.gridX, player.gridY) - dist(gx+b.x, gy+b.y, player.gridX, player.gridY));
                    } else if (ghost.behavior === 'AMBUSH') {
                        const tx = player.gridX + player.dir.x * 2;
                        const ty = player.gridY + player.dir.y * 2;
                        possible.sort((a,b) => dist(gx+a.x, gy+a.y, tx, ty) - dist(gx+b.x, gy+b.y, tx, ty));
                    } else {
                        possible.sort(() => Math.random() - 0.5);
                    }
                }
                ghost.dir = possible[0];
            } else {
                ghost.dir = { x: -ghost.dir.x, y: -ghost.dir.y };
            }
        }
        ghost.x += ghost.dir.x * moveSpeed;
        ghost.y += ghost.dir.y * moveSpeed;
    });
}

function dist(x1, y1, x2, y2) { return Math.sqrt((x1-x2)**2 + (y1-y2)**2); }

function checkCollisions() {
    // This is now handled inside handlePlayerMovement for precision
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
}

function findSafeSpawn(map, px, py, minDist) {
    const valid = [];
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if ((map[r][c] === 0 || map[r][c] === 2) && dist(c, r, px, py) >= minDist) {
                valid.push({c, r});
            }
        }
    }
    return valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : null;
}

function checkLevelWin() {
    if (!LabyrinthMaps[currentPhase].flat().some(t => t === 2 || t === 3)) {
        gameState = 'LEVEL_COMPLETE'; totalTime += (Date.now() - startTime);
        if (currentPhase < 2) {
            document.getElementById('level-complete').classList.remove('hidden');
            document.getElementById('complete-title').innerText = `ROTA 4 - FASE ${currentPhase + 1} OK`;
        } else victory();
    }
}

function victory() {
    gameState = 'VICTORY'; document.getElementById('victory-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-time').innerText = formatTimer(totalTime);
    localStorage.setItem('robot_runner_high_score', score);
}

function updateHUD(elapsed) { document.getElementById('time-display').innerText = formatTimer(elapsed); }
function formatTimer(ms) { 
    const s = Math.floor(ms / 1000); 
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}.${Math.floor((ms%1000)/100)}`; 
}

function updateBoostBar() {
    const fill = document.getElementById('boost-fill');
    fill.style.width = player.boost + '%';
    document.getElementById('boost-percent').innerText = Math.round(player.boost) + '%';
}

function draw() {
    ctx.save();
    if (screenShake > 0) ctx.translate((Math.random()-0.5)*screenShake, (Math.random()-0.5)*screenShake);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const theme = THEMES[currentPhase];
    
    // Grid Background
    ctx.strokeStyle = theme.wall + '22'; ctx.lineWidth = 1;
    gridOffset = (gridOffset + 0.5) % 50;
    for (let i = -50; i < canvas.width + 50; i += 50) {
        ctx.beginPath(); ctx.moveTo(i + gridOffset, 0); ctx.lineTo(i + gridOffset, canvas.height); ctx.stroke();
    }
    for (let i = -50; i < canvas.height + 50; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i + gridOffset); ctx.lineTo(canvas.width, i + gridOffset); ctx.stroke();
    }

    // Walls & Pellets
    const map = LabyrinthMaps[currentPhase];
    const glowPulse = 5 + Math.sin(Date.now() / 200) * 5;
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const tile = map[r][c];
            const px = c * TILE_SIZE, py = r * TILE_SIZE;
            if (tile === 1) {
                ctx.fillStyle = theme.wall; ctx.shadowBlur = glowPulse; ctx.shadowColor = theme.wall;
                ctx.fillRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
            } else if (tile === 2) {
                const s = 3 + Math.sin(Date.now() / 150) * 1; ctx.shadowBlur = 5; ctx.shadowColor = theme.pellet;
                ctx.fillStyle = theme.pellet; ctx.beginPath(); ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, s, 0, Math.PI*2); ctx.fill();
            } else if (tile === 3) {
                const s = 6 + Math.sin(Date.now() / 100) * 2; ctx.shadowBlur = 15; ctx.shadowColor = theme.power;
                ctx.fillStyle = theme.power; ctx.beginPath(); ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, s, 0, Math.PI*2); ctx.fill();
            }
        }
    }
    ctx.shadowBlur = 0;

    // Trails
    trails.forEach(t => {
        ctx.globalAlpha = t.life * 0.3; ctx.fillStyle = player.isBoosting ? '#FFFFFF' : theme.wall;
        ctx.beginPath(); ctx.arc(t.x, t.y, TILE_SIZE/3, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Particles
    particles.forEach(p => p.draw(ctx));

    // Ghosts
    ghosts.forEach(g => {
        if (g.dead) return;
        ctx.save(); ctx.translate(g.x + TILE_SIZE/2, g.y + TILE_SIZE/2);
        const color = player.isPowered ? '#FF3333' : g.color.glow;
        ctx.shadowBlur = 15; ctx.shadowColor = color;
        
        ctx.fillStyle = player.isPowered ? '#440000' : (g.color.base === '#000000' ? '#111111' : g.color.base);
        ctx.beginPath(); ctx.arc(0, -3, TILE_SIZE/2.5, Math.PI, 0); 
        ctx.lineTo(TILE_SIZE/2.5, TILE_SIZE/2.5); ctx.lineTo(-TILE_SIZE/2.5, TILE_SIZE/2.5);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        
        // Eyes
        ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-5,-3, 3, 0, Math.PI*2); ctx.arc(5,-3, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5 + g.dir.x * 2, -3 + g.dir.y * 2, 1.5, 0, Math.PI*2); ctx.arc(5 + g.dir.x * 2, -3 + g.dir.y * 2, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    });

    // Player
    ctx.save(); ctx.translate(player.x + TILE_SIZE/2, player.y + TILE_SIZE/2); ctx.rotate(player.angle);
    const pColor = player.isBoosting ? '#FFFFFF' : '#38bdf8';
    ctx.shadowBlur = player.isBoosting? 20 : 10; ctx.shadowColor = pColor;
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = pColor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-TILE_SIZE/3, -TILE_SIZE/3, TILE_SIZE*0.66, TILE_SIZE*0.66, 6); ctx.fill(); ctx.stroke();
    if (player.isBoosting) {
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-TILE_SIZE/3, -TILE_SIZE/6); ctx.lineTo(-TILE_SIZE, 0); ctx.lineTo(-TILE_SIZE/3, TILE_SIZE/6); ctx.fill();
    }
    ctx.fillStyle = pColor; ctx.fillRect(TILE_SIZE/6, -TILE_SIZE/6, 5, 4); ctx.fillRect(TILE_SIZE/6, TILE_SIZE/12, 5, 4);
    ctx.restore();

    ctx.restore();
}

let lastTimestamp = 0;
function gameLoop(timestamp) {
    const dt = timestamp - lastTimestamp; lastTimestamp = timestamp;
    update(dt); draw(); requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': player.nextDir = {x:0, y:-1}; break;
        case 'a': case 'arrowleft': player.nextDir = {x:-1, y:0}; break;
        case 's': case 'arrowdown': player.nextDir = {x:0, y:1}; break;
        case 'd': case 'arrowright': player.nextDir = {x:1, y:0}; break;
        case ' ': 
            if (player.boost >= 100 && !player.isBoosting) { 
                player.boost = 0; player.isBoosting = true; player.boostTimer = BOOST_DURATION; updateBoostBar(); screenShake = 5;
            } 
            break;
    }
});

document.getElementById('start-btn').onclick = () => {
    document.getElementById('start-screen').classList.add('hidden');
    gameState = 'PLAYING'; score = 0; displayedScore = 0; totalTime = 0; startTime = Date.now(); initLevel(0);
};
document.getElementById('next-btn').onclick = () => {
    document.getElementById('level-complete').classList.add('hidden');
    gameState = 'PLAYING'; startTime = Date.now(); initLevel(currentPhase + 1);
};
document.getElementById('retry-btn').onclick = () => {
    document.getElementById('game-over').classList.add('hidden');
    gameState = 'PLAYING'; startTime = Date.now(); initLevel(currentPhase);
};
document.getElementById('exit-game-btn').onclick = () => {
    window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
};
document.getElementById('finish-btn').onclick = () => {
    window.parent.postMessage({ type: 'CLOSE_MINI_GAME', gameId: 'robot-runner', score: score }, '*');
};

initLevel(0); requestAnimationFrame(gameLoop);
