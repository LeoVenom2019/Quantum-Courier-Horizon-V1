const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const finalScoreElement = document.getElementById('final-score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = 4 * BLOCK_SIZE;
nextCanvas.height = 4 * BLOCK_SIZE;

function getArcadePerks() {
    try {
        return JSON.parse(localStorage.getItem('qch_arcade_perks_grid-collapse') || '[]');
    } catch (error) {
        return [];
    }
}

function hasArcadePerk(perkId) {
    return getArcadePerks().some(perk => perk && perk.id === perkId);
}

const HAS_LINE_BONUS = hasArcadePerk('grid-collapse-line-bonus');
const HAS_EXTRA_PREVIEW = hasArcadePerk('grid-collapse-next-piece-preview');
let nextCanvas2 = null;
let nextCtx2 = null;

if (HAS_EXTRA_PREVIEW && nextCanvas?.parentElement) {
    const preview = document.createElement('canvas');
    preview.id = 'nextCanvas2';
    preview.width = 4 * BLOCK_SIZE;
    preview.height = 4 * BLOCK_SIZE;
    preview.className = 'extra-preview-canvas';
    nextCanvas.parentElement.classList.add('has-extra-preview');
    nextCanvas.parentElement.appendChild(preview);
    nextCanvas2 = preview;
    nextCtx2 = preview.getContext('2d');
}

// Colors for Tetriminos
const COLORS = {
    I: '#00f2ff',
    J: '#0066ff',
    L: '#ff9900',
    O: '#ffff00',
    S: '#00ff00',
    T: '#9900ff',
    Z: '#ff0000',
    BOMB: '#ffffff',
    GOLD: '#fbbf24'
};

const SHAPES = {
    I: [[1, 1, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[0, 1, 0], [1, 1, 1]],
    Z: [[1, 1, 0], [0, 1, 1]],
    BOMB: [[2]], // 2 represents bomb
    GOLD: [[3]]  // 3 represents gold piece (multiplier)
};

let grid = createGrid();
let currentPiece = null;
let nextPiece = null;
let secondNextPiece = null;
let score = 0;
let level = 1;
let linesCleared = 0;
let gameOver = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Visuals
let particles = [];
let scoreFloaters = [];
let screenShake = 0;
let displayedScore = 0;
let lineFlash = []; // Array of {y, life, color}
let activeEvent = null; // {type: 'GRID COLLAPSE', life: 1.0}
const SFX_BASE = '/assets/games/flipers_sfx';
const SFX = {
    rotate: `${SFX_BASE}/grid_collapse_change.ogg`,
    drop: `${SFX_BASE}/grid_collapse_go_down.ogg`,
    explosion: `${SFX_BASE}/grid_collapse_explosion.ogg`,
    perfect: `${SFX_BASE}/grid_collapse_perfect.ogg`,
    misfit: `${SFX_BASE}/grid_collapse_misfit.ogg`,
    match: {
        1: `${SFX_BASE}/grid_collapse_match_1.ogg`,
        2: `${SFX_BASE}/grid_collapse_match_2.ogg`,
        3: `${SFX_BASE}/grid_collapse_match_3.ogg`,
        4: `${SFX_BASE}/grid_collapse_match_4.ogg`,
    },
};
const audioCache = new Map();

function playSfx(path, volume = 0.65) {
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

function createGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function getGhostPosition() {
    if (!currentPiece) return null;
    if (currentPiece.bombPhasing) {
        const phaseTargetY = findBombPhaseTargetY(currentPiece);
        return Number.isFinite(phaseTargetY) ? { x: currentPiece.pos.x, y: phaseTargetY } : null;
    }

    let ghost = {
        pos: { x: currentPiece.pos.x, y: currentPiece.pos.y },
        shape: currentPiece.shape
    };
    while (!collide(grid, ghost)) {
        ghost.pos.y++;
    }
    ghost.pos.y--;
    return ghost.pos;
}

function spawnPiece() {
    if (!nextPiece) {
        nextPiece = createRandomPiece();
    }
    if (HAS_EXTRA_PREVIEW && !secondNextPiece) {
        secondNextPiece = createRandomPiece();
    }
    currentPiece = nextPiece;
    nextPiece = HAS_EXTRA_PREVIEW ? secondNextPiece : createRandomPiece();
    secondNextPiece = HAS_EXTRA_PREVIEW ? createRandomPiece() : null;

    currentPiece.pos.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.pos.y = 0;

    if (collide(grid, currentPiece)) {
        handleGameOver();
    }
}

function createRandomPiece() {
    const types = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    // 5% chance for bomb, 5% for gold
    const specialRoll = Math.random();
    let type;
    if (specialRoll < 0.05) type = 'BOMB';
    else if (specialRoll < 0.1) type = 'GOLD';
    else type = types[Math.floor(Math.random() * types.length)];

    return {
        type,
        shape: SHAPES[type],
        pos: { x: 0, y: 0 }
    };
}

function collide(grid, piece) {
    const [m, o] = [piece.shape, piece.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function bombCanPhaseTo(piece, y) {
    const x = piece.pos.x;
    return x >= 0 &&
        x < COLS &&
        y >= 0 &&
        y < ROWS &&
        grid[y][x] === 0;
}

function findBombPhaseTargetY(piece) {
    for (let y = ROWS - 1; y > piece.pos.y; y--) {
        if (bombCanPhaseTo(piece, y)) {
            return y;
        }
    }

    return null;
}

function merge(grid, piece) {
    let createdHole = false;
    const pieceCells = new Set();
    
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const py = y + piece.pos.y;
                const px = x + piece.pos.x;
                grid[py][px] = piece.type;
                pieceCells.add(`${px},${py}`);
            }
        });
    });

    // Check for holes created directly below the piece
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const py = y + piece.pos.y;
                const px = x + piece.pos.x;
                if (py + 1 < ROWS && grid[py + 1][px] === 0 && !pieceCells.has(`${px},${py+1}`)) {
                    createdHole = true;
                }
            }
        });
    });

    if (createdHole) {
        screenShake = 12;
        spawnExplosion(piece.pos.x * BLOCK_SIZE + 45, piece.pos.y * BLOCK_SIZE + 15, '#ff4b2b', 15);
        playSfx(SFX.misfit, 0.68);
        spawnTextEffect("MISFIT", piece.pos.x * BLOCK_SIZE + 45, piece.pos.y * BLOCK_SIZE, '#ff3b30', {
            size: 23,
            shake: 3,
        });
    } else {
        playSfx(SFX.perfect, 0.72);
        spawnTextEffect("PERFECT", piece.pos.x * BLOCK_SIZE + 45, piece.pos.y * BLOCK_SIZE, '#22c55e', {
            size: 25,
        });
        screenShake = 3;
    }

    return { createdHole };
}

function rotate(matrix) {
    const rotated = matrix[0].map((_, index) => matrix.map(col => col[index]).reverse());
    return rotated;
}

function playerRotate() {
    if (currentPiece.type === 'BOMB') {
        toggleBombPhase();
        return;
    }

    const pos = currentPiece.pos.x;
    let offset = 1;
    const oldShape = currentPiece.shape;
    currentPiece.shape = rotate(currentPiece.shape);
    while (collide(grid, currentPiece)) {
        currentPiece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > currentPiece.shape[0].length) {
            currentPiece.shape = oldShape;
            currentPiece.pos.x = pos;
            return;
        }
    }
    playSfx(SFX.rotate, 0.55);
}

function toggleBombPhase() {
    if (currentPiece.bombPhasing) {
        if (collide(grid, currentPiece)) {
            playSfx(SFX.misfit, 0.55);
            spawnTextEffect("BLOCKED", currentPiece.pos.x * BLOCK_SIZE + 15, currentPiece.pos.y * BLOCK_SIZE, '#ff3b30', {
                size: 15,
                shake: 2,
            });
            return;
        }

        currentPiece.bombPhasing = false;
        playSfx(SFX.rotate, 0.55);
        return;
    }

    const targetY = findBombPhaseTargetY(currentPiece);
    if (targetY === null) {
        playSfx(SFX.misfit, 0.55);
        spawnTextEffect("BLOCKED", currentPiece.pos.x * BLOCK_SIZE + 15, currentPiece.pos.y * BLOCK_SIZE, '#ff3b30', {
            size: 15,
            shake: 2,
        });
        return;
    }

    currentPiece.bombPhasing = true;
    currentPiece.phaseTargetY = targetY;
    playSfx(SFX.rotate, 0.55);
    spawnTextEffect("PHASE", currentPiece.pos.x * BLOCK_SIZE + 15, currentPiece.pos.y * BLOCK_SIZE, '#ffffff', {
        size: 15,
    });
}

function lockCurrentPiece() {
    const fitData = merge(grid, currentPiece);
    
    // Impact visual
    if (fitData.createdHole) {
        // Error feedback
        spawnFlashEffect(currentPiece.pos.x, currentPiece.pos.y, '#ff4b2b', 0.4);
    } else {
        spawnFlashEffect(currentPiece.pos.x, currentPiece.pos.y, COLORS[currentPiece.type], 0.3);
    }

    // Check for special piece effects upon landing
    if (currentPiece.type === 'BOMB' && !currentPiece.bombPhasing) {
        triggerBomb(currentPiece.pos.x, currentPiece.pos.y);
    }
    
    arenaSweep(currentPiece.type);
    spawnPiece();
    updateScore();
}

function playerDrop() {
    if (currentPiece.bombPhasing) {
        currentPiece.pos.y++;

        if (currentPiece.pos.y >= currentPiece.phaseTargetY) {
            currentPiece.pos.y = currentPiece.phaseTargetY;
            lockCurrentPiece();
        }
    } else {
        currentPiece.pos.y++;
        if (collide(grid, currentPiece)) {
            currentPiece.pos.y--;
            lockCurrentPiece();
        } else {
            playSfx(SFX.drop, 0.5);
        }
    }

    dropCounter = 0;
}

function playerMove(dir) {
    if (currentPiece.bombPhasing) return;

    currentPiece.pos.x += dir;
    if (collide(grid, currentPiece)) {
        currentPiece.pos.x -= dir;
    }
}

function triggerBomb(x, y) {
    const radius = 2;
    playSfx(SFX.explosion, 0.8);
    spawnExplosion(x * BLOCK_SIZE + BLOCK_SIZE/2, y * BLOCK_SIZE + BLOCK_SIZE/2, '#fff', 40);
    screenShake = 20;

    for (let iy = y - radius; iy <= y + radius; iy++) {
        for (let ix = x - radius; ix <= x + radius; ix++) {
            if (grid[iy] && grid[iy][ix] !== undefined) {
                if (grid[iy][ix] !== 0) {
                    spawnExplosion(ix * BLOCK_SIZE + BLOCK_SIZE/2, iy * BLOCK_SIZE + BLOCK_SIZE/2, COLORS[grid[iy][ix]], 10);
                }
                grid[iy][ix] = 0;
            }
        }
    }
}

let gamePaused = false;

function arenaSweep(lastPieceType) {
    let linesInSweep = 0;
    let affectedY = [];
    
    outer: for (let y = grid.length - 1; y >= 0; --y) {
        for (let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x] === 0) {
                continue outer;
            }
        }
        linesInSweep++;
        affectedY.push(y);
    }

    if (linesInSweep > 0) {
        const isCollapse = linesInSweep === 4;
        
        if (isCollapse) {
            gamePaused = true;
            activeEvent = { type: 'GRID COLLAPSE', life: 2.0, color: COLORS[lastPieceType] };
            notifyArcadeAction('grid-collapse');
            screenShake = 30;

            // Sync colors of pieces in the lines to be cleared
            affectedY.forEach(y => {
                for(let x = 0; x < COLS; x++) {
                    grid[y][x] = lastPieceType; // Sincronização
                }
                lineFlash.push({y, life: 1.5, color: COLORS[lastPieceType]});
            });

            // Delay actual clearing for the effect to be visible
            setTimeout(() => {
                executeClearing(affectedY, linesInSweep, lastPieceType);
                gamePaused = false;
            }, 600);
        } else {
            executeClearing(affectedY, linesInSweep, lastPieceType);
        }
    }
}

function executeClearing(affectedY, linesInSweep, lastPieceType) {
    let rowCount = 1;
    // We sort affectedY descending to splice correctly
    affectedY.sort((a,b) => b-a).forEach(y => {
        const color = linesInSweep === 4 ? COLORS[lastPieceType] : '#fff';
        
        // Spawn particles across the line
        for(let x = 0; x < COLS; x++) {
            spawnExplosion(x * BLOCK_SIZE + 15, y * BLOCK_SIZE + 15, color, 2 + linesInSweep);
        }

        // The grid might have shifted if we splice one by one. 
        // Actually, since we work on a copy of grid or just clear them:
        // Let's find the current row index of the row we marked
        // Wait, simpler: splice them all at once?
    });

    // Recalculate clearing since grid might have changed
    let cleared = 0;
    outerClearing: for (let y = grid.length - 1; y >= 0; --y) {
        let full = true;
        for (let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x] === 0) {
                full = false;
                break;
            }
        }

        if (full) {
            const row = grid.splice(y, 1)[0].fill(0);
            grid.unshift(row);
            ++y;
            cleared++;
            
            const points = rowCount * 100 + (HAS_LINE_BONUS ? 500 : 0);
            score += points;
            spawnScoreFloater(points, 150, (y-cleared) * BLOCK_SIZE);
            rowCount *= 2;
            
            applyRandomEffect();
        }
    }

    linesCleared += cleared;
    if (cleared > 0) {
        playSfx(SFX.match[Math.min(cleared, 4)], 0.7);
    }

    if (cleared > 0 && cleared < 4) {
        screenShake = 5 * cleared;
        if (cleared === 1) spawnTextEffect("SINGLE", canvas.width/2, canvas.height/2, '#fff');
        if (cleared === 2) spawnTextEffect("DOUBLE", canvas.width/2, canvas.height/2, '#00f2ff');
        if (cleared === 3) spawnTextEffect("TRIPLE", canvas.width/2, canvas.height/2, '#9900ff');
    }

    if (Math.floor(linesCleared / 10) >= level) {
        level++;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        spawnTextEffect("LEVEL UP", canvas.width/2, canvas.height/2, COLORS.GOLD);
    }
}

function applyRandomEffect() {
    const roll = Math.random();
    if (roll < 0.2) {
        // Multiplier
        score += 500;
        spawnTextEffect("BONUS +500", canvas.width/2, canvas.height/2, COLORS.GOLD);
    } else if (roll < 0.4) {
        // Slow down
        dropInterval += 100;
        spawnTextEffect("SYSTEM SLOW", canvas.width/2, canvas.height/2, COLORS.I);
    } else if (roll < 0.5) {
        // Clear area if needed, but here let's just do a big flash
        screenShake = 15;
    }
}

function updateScore() {
    // Score animation handled in draw loop
    levelElement.innerText = level.toString().padStart(2, '0');
    linesElement.innerText = linesCleared.toString().padStart(3, '0');
    
    // Notify parent of score update for persistence
    window.parent.postMessage({ 
        type: 'SCORE_UPDATE', 
        gameId: 'grid-collapse', 
        score: score 
    }, '*');
}

function notifyArcadeAction(actionId, amount = 1) {
    window.parent.postMessage({
        type: 'ARCADE_ACTION',
        gameId: 'grid-collapse',
        actionId,
        amount
    }, '*');
}

function handleGameOver() {
    gameOver = true;
    gameActive = false;
    const finalScore = Number(score) || 0;
    const finalLines = Number(linesCleared) || 0;
    const finalLevel = Number(level) || 1;
    finalScoreElement.innerText = score.toString().padStart(5, '0');

    window.QCHArcadeResults.show({
        gameId: 'grid-collapse',
        victory: finalScore >= 15000,
        score: finalScore,
        stats: [
            { label: 'Final Data Score', value: finalScore },
            { label: 'Target', value: '15000' },
            { label: 'Lines', value: finalLines },
            { label: 'Level', value: finalLevel },
        ],
    });
}

function spawnScoreFloater(value, x, y) {
    scoreFloaters.push({
        value,
        x, y,
        life: 1.0,
        opacity: 1.0
    });
}

function spawnFlashEffect(x, y, color, life) {
    particles.push({
        type: 'flash',
        x: x * BLOCK_SIZE,
        y: y * BLOCK_SIZE,
        w: 4 * BLOCK_SIZE, // Approximate max piece width
        h: 4 * BLOCK_SIZE,
        color,
        life
    });
}

function spawnExplosion(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color,
            size: Math.random() * 4 + 1
        });
    }
}

function spawnTextEffect(text, x, y, color, options = {}) {
    // Simple enough for canvas draw
    particles.push({
        type: 'text',
        text,
        x, y,
        vy: -1,
        life: 1.5,
        color,
        size: options.size || 16,
        shake: options.shake || 0
    });
}

function drawBlock(ctx, x, y, type, size = BLOCK_SIZE, alpha = 1) {
    const color = COLORS[type] || '#fff';
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Gradient fill
    const grad = ctx.createLinearGradient(x * size, y * size, (x+1) * size, (y+1) * size);
    grad.addColorStop(0, color);
    grad.addColorStop(1, adjustColor(color, -40));
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = alpha > 0.5 ? 10 : 0;
    ctx.shadowColor = color;
    
    // Rounded block look
    const r = 4;
    const bx = x * size + 1;
    const by = y * size + 1;
    const bw = size - 2;
    const bh = size - 2;
    
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fill();
    
    // Gloss highlight
    if (alpha > 0.5) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Inner bevel highlight
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.moveTo(bx + 3, by + bh - 3);
        ctx.lineTo(bx + 3, by + 3);
        ctx.lineTo(bx + bw - 3, by + 3);
        ctx.stroke();
    }

    ctx.restore();
}

function adjustColor(hex, amt) {
    let usePound = false;
    if (hex[0] === "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Score animation
    let scoreReached = displayedScore >= score;
    if (displayedScore < score) {
        let diff = score - displayedScore;
        displayedScore += Math.ceil(diff * 0.1);
        scoreElement.innerText = displayedScore.toString().padStart(5, '0');
        scoreElement.style.textShadow = `0 0 20px var(--color-accent)`;
    } else {
        scoreElement.style.textShadow = `0 0 10px var(--color-accent)`;
    }

    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }

    // Grid (Subtle lines on top of CSS grid for depth)
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.03)';
    ctx.lineWidth = 1;
    for(let i=0; i<=COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for(let i=0; i<=ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }

    // Line Flashes
    lineFlash = lineFlash.filter(lf => lf.life > 0);
    lineFlash.forEach(lf => {
        ctx.fillStyle = lf.color || `rgba(255, 255, 255, ${lf.life})`;
        ctx.globalAlpha = lf.life * 0.5;
        ctx.fillRect(0, lf.y * BLOCK_SIZE, canvas.width, BLOCK_SIZE);
        lf.life -= 0.05;
    });
    ctx.globalAlpha = 1.0;

    // Ghost Piece
    const ghostPos = getGhostPosition();
    if (ghostPos && currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, x + ghostPos.x, y + ghostPos.y, currentPiece.type, BLOCK_SIZE, 0.1);
                }
            });
        });
    }

    // Grid Stack
    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Soft glow behind pieces
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = COLORS[value];
                drawBlock(ctx, x, y, value);
                ctx.restore();
            }
        });
    });

    // Current Piece
    if (currentPiece) {
        const pieceAlpha = currentPiece.bombPhasing ? 0.35 : 1;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, x + currentPiece.pos.x, y + currentPiece.pos.y, currentPiece.type, BLOCK_SIZE, pieceAlpha);
                }
            });
        });
    }

    // Event Banner
    if (activeEvent) {
        activeEvent.life -= 0.02;
        if (activeEvent.life <= 0) {
            activeEvent = null;
        } else {
            ctx.save();
            ctx.fillStyle = activeEvent.color;
            ctx.shadowBlur = 30;
            ctx.shadowColor = activeEvent.color;
            ctx.globalAlpha = Math.min(1.0, activeEvent.life);
            ctx.font = '900 32px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(activeEvent.type, canvas.width / 2, canvas.height / 2);
            ctx.restore();
        }
    }

    // Particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.life -= 0.02;
        if (p.type === 'text') {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.font = `900 ${p.size}px Orbitron`;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            const shakeX = p.shake ? (Math.random() - 0.5) * p.shake * p.life : 0;
            const shakeY = p.shake ? (Math.random() - 0.5) * p.shake * p.life : 0;
            ctx.fillText(p.text, p.x + shakeX, p.y + shakeY);
            p.y += p.vy;
        } else if (p.type === 'flash') {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
        } else {
            p.x += p.vx;
            p.y += p.vy;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
    });

    // Score Floaters
    scoreFloaters = scoreFloaters.filter(s => s.life > 0);
    scoreFloaters.forEach(s => {
        s.life -= 0.02;
        // Glide to HUD (Right panel score box is at approx canvas.width + 100, etc)
        // Since canvas and HUD are in same coord space in standard browser? 
        // No, canvas is relative. Let's just glide them up and out.
        s.y -= 2;
        s.x += (canvas.width - s.x) * 0.05;
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = '900 14px Orbitron';
        ctx.globalAlpha = s.life;
        ctx.fillText(`+${s.value}`, s.x, s.y);
    });

    ctx.restore();
    ctx.globalAlpha = 1;

    drawPreviewPiece(nextCtx, nextCanvas, nextPiece);
    if (HAS_EXTRA_PREVIEW && nextCtx2 && nextCanvas2) {
        drawPreviewPiece(nextCtx2, nextCanvas2, secondNextPiece);
    }
}

function drawPreviewPiece(targetCtx, targetCanvas, piece) {
    targetCtx.fillStyle = '#111';
    targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    targetCtx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
    targetCtx.lineWidth = 2;
    targetCtx.strokeRect(5, 5, targetCanvas.width - 10, targetCanvas.height - 10);

    if (!piece) return;

    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                let ox = 1;
                let oy = 1;
                if (piece.type === 'I') oy = 1.5;
                if (piece.type === 'O') ox = 1;
                drawBlock(targetCtx, x + ox, y + oy, piece.type, BLOCK_SIZE * 0.7);
            }
        });
    });
}

function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    if (!gamePaused) {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
    }

    draw();
    requestAnimationFrame(update);
}

// Input
document.addEventListener('keydown', event => {
    if (gameOver || gamePaused) return;
    
    // ASDW implementation
    if (event.key.toUpperCase() === 'A') {
        playerMove(-1);
    } else if (event.key.toUpperCase() === 'D') {
        playerMove(1);
    } else if (event.key.toUpperCase() === 'S') {
        playerDrop();
    } else if (event.key.toUpperCase() === 'W' || event.key === 'ArrowUp') {
        playerRotate();
    }
});

restartBtn.addEventListener('click', () => {
    grid = createGrid();
    score = 0;
    level = 1;
    linesCleared = 0;
    gameOver = false;
    dropInterval = 1000;
    updateScore();
    overlay.classList.add('hidden');
    spawnPiece();
    lastTime = performance.now();
    requestAnimationFrame(update);
});

const exitBtn = document.getElementById('exit-btn');
exitBtn.addEventListener('click', () => {
    window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
});

// Start
spawnPiece();
updateScore();
requestAnimationFrame(update);
