// Constants
const ROWS = 10;
const COLS = 10;
const TOTAL_MINES = 16;
const INITIAL_DISARMERS = 18;
const INITIAL_TIME = 240; // 4 minutes

function getArcadePerks() {
    try {
        return JSON.parse(localStorage.getItem('qch_arcade_perks_danger-zoom-zones') || '[]');
    } catch (error) {
        return [];
    }
}

function hasArcadePerk(perkId) {
    return getArcadePerks().some(perk => perk && perk.id === perkId);
}

const HAS_EXTRA_TIME = hasArcadePerk('danger-zoom-extra-time');
const HAS_ANTI_BOMB_SHIELD = hasArcadePerk('danger-zoom-forgive-error');
const SFX_BASE = '/assets/games/flipers_sfx';
const SFX = {
    bombExplosion: `${SFX_BASE}/danger_zoom_zones_bomb_explosion.ogg`,
    choose: `${SFX_BASE}/danger_zoom_zones_choose.ogg`,
    closeWindow: `${SFX_BASE}/danger_zoom_zones_close_window.ogg`,
    closeNoBomb: `${SFX_BASE}/danger_zoom_zones_close_nobomb.ogg`,
    disarm: `${SFX_BASE}/danger_zoom_zones_disarm.ogg`,
    firstClean: `${SFX_BASE}/danger_zoom_zones_firstclean.ogg`,
    noBomb: `${SFX_BASE}/danger_zoom_zones_no_bomb.ogg`,
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

// Game State
let grid = [];
let mines = [];
let timer = INITIAL_TIME;
let disarmers = INITIAL_DISARMERS;
let foundMines = 0;
let gameStatus = 'waiting'; // waiting, active, over
let timerInterval = null;
let currentCell = null;
let combo = 0;
let bestTime = '--:--';
let antiBombShieldCharges = HAS_ANTI_BOMB_SHIELD ? 1 : 0;

try {
    bestTime = localStorage.getItem('danger-zoom-best') || '--:--';
} catch (e) {
    console.warn("Storage access denied");
}

// DOM Elements
const gridContainer = document.getElementById('grid');
const timerDisplay = document.getElementById('timer');
const minesDisplay = document.getElementById('mines-count');
const disarmersDisplay = document.getElementById('disarm-kits');
const comboDisplay = document.getElementById('combo-count');
const modal = document.getElementById('action-modal');
const modalKits = document.getElementById('modal-kits');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('game-status');
const bestTimeDisplay = document.getElementById('best-time');
const currentTimeDisplay = document.getElementById('current-finish-time');
const restartBtn = document.getElementById('restart-btn');

function init() {
    if (!gridContainer || !timerDisplay) return;
    
    gridContainer.innerHTML = '';
    grid = [];
    mines = [];
    timer = INITIAL_TIME + (HAS_EXTRA_TIME ? 20 : 0);
    disarmers = INITIAL_DISARMERS;
    foundMines = 0;
    combo = 0;
    antiBombShieldCharges = HAS_ANTI_BOMB_SHIELD ? 1 : 0;
    gameStatus = 'waiting';
    updateDisplays();
    if (bestTimeDisplay) bestTimeDisplay.innerText = formatTime(bestTime);
    
    // Create Grid
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            cellEl.dataset.row = r;
            cellEl.dataset.col = c;
            cellEl.addEventListener('click', () => handleCellClick(r, c));
            gridContainer.appendChild(cellEl);
            
            grid[r][c] = {
                revealed: false,
                mine: false,
                disarmed: false,
                neighborCount: 0,
                el: cellEl
            };
        }
    }

    placeMines();
    calculateNeighbors();
    startSafeReveal();
}

function placeMines() {
    let placed = 0;
    while (placed < TOTAL_MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (!grid[r][c].mine) {
            grid[r][c].mine = true;
            mines.push({ r, c });
            placed++;
        }
    }
}

function calculateNeighbors() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].mine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) {
                        count++;
                    }
                }
            }
            grid[r][c].neighborCount = count;
        }
    }
}

function startSafeReveal() {
    // Find 4 areas with neighborCount = 0
    let safes = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!grid[r][c].mine && grid[r][c].neighborCount === 0) {
                safes.push({ r, c });
            }
        }
    }

    // Shuffle and pick 4
    safes.sort(() => Math.random() - 0.5);
    
    if (safes.length === 0) {
        // Fallback to any non-mine cell
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!grid[r][c].mine) safes.push({ r, c });
            }
        }
        safes.sort(() => Math.random() - 0.5);
    }
    
    const startSafes = safes.slice(0, 4);

    // Initial scan effect
    let delay = 0;
    startSafes.forEach((pos, idx) => {
        setTimeout(() => {
            revealCell(pos.r, pos.c);
            if (idx === startSafes.length - 1) {
                gameStatus = 'active';
                startTimer();
            }
        }, delay);
        delay += 300;
    });
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateDisplays();
        if (timer <= 0) endGame(false);
    }, 1000);
}

function handleCellClick(r, c) {
    if (gameStatus !== 'active' || grid[r][c].revealed || grid[r][c].disarmed) return;
    
    currentCell = { r, c };
    modalKits.innerText = disarmers;
    modal.classList.remove('hidden');
    playSfx(SFX.choose, 0.58);
}

function revealCell(r, c, options = {}) {
    if (gameStatus === 'over' || r < 0 || r >= ROWS || c < 0 || c >= COLS || grid[r][c].revealed || grid[r][c].disarmed) return;

    const cell = grid[r][c];
    cell.revealed = true;
    cell.el.classList.add('revealed', 'ripple');
    
    if (cell.mine) {
        if (antiBombShieldCharges > 0) {
            antiBombShieldCharges--;
            cell.disarmed = true;
            cell.el.classList.add('disarmed', 'ripple');
            cell.el.innerHTML = '🛡';
            foundMines++;
            spawnTextEffect("ANTI-BOMB SHIELD", cell.el);
            updateDisplays();
            if (foundMines === TOTAL_MINES) endGame(true);
            return;
        }
        cell.el.classList.add('mine');
        cell.el.innerHTML = '💣';
        disarmers = Math.max(0, disarmers - 1);
        timer = Math.max(0, timer - 20);
        combo = 0;
        spawnExplosionEffect(r, c);
        foundMines++;
        updateDisplays();
        if (foundMines === TOTAL_MINES) {
            endGame(true);
        } else if (disarmers <= 0) {
            endGame(false);
        }
        return;
    } else {
        if (options.manualNoBomb) {
            playSfx(SFX.closeNoBomb, 0.64);
        }
        if (cell.neighborCount > 0) {
            cell.el.innerText = cell.neighborCount;
            cell.el.dataset.val = cell.neighborCount;
        } else {
            if (!options.cascadeSoundPlayed) {
                playSfx(SFX.firstClean, 0.62);
                options.cascadeSoundPlayed = true;
            }
            // Cascade
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    revealCell(r + dr, c + dc, options);
                }
            }
        }
    }
    updateDisplays();
    if (foundMines === TOTAL_MINES) endGame(true);
}

function disarmCell(r, c) {
    if (gameStatus === 'over') return;
    if (disarmers <= 0) {
        endGame(false);
        return;
    }
    
    disarmers--;
    const cell = grid[r][c];
    
    if (cell.mine) {
        playSfx(SFX.disarm, 0.72);
        cell.disarmed = true;
        cell.el.classList.add('disarmed', 'ripple');
        cell.el.innerHTML = '⚡';
        foundMines++;
        notifyArcadeAction('perfect-bomb-disarm');
        timer += 20;
        combo++;
        
        if (combo >= 4) spawnTextEffect("CHAIN DISARM", cell.el);
    } else {
        playSfx(SFX.noBomb, 0.68);
        combo = 0;
        revealCell(r, c);
    }
    
    updateDisplays();
    if (foundMines === TOTAL_MINES) {
        endGame(true);
    } else if (disarmers <= 0) {
        endGame(false);
    }
}

function updateDisplays() {
    if (!timerDisplay || !minesDisplay || !disarmersDisplay || !comboDisplay) return;

    const timeVal = formatTime(timer);
    if (timerDisplay.innerText !== timeVal) {
        timerDisplay.innerText = timeVal;
        triggerBump(timerDisplay);
    }
    
    // Notify parent of progress/score update
    if (gameStatus === 'active') {
        window.parent.postMessage({ 
            type: 'SCORE_UPDATE', 
            gameId: 'danger-zoom-zones', 
            score: timer 
        }, '*');
    }
    
    const minesVal = (TOTAL_MINES - foundMines).toString();
    if (minesDisplay.innerText !== minesVal) {
        minesDisplay.innerText = minesVal;
        triggerBump(minesDisplay);
    }
    
    const disarmVal = disarmers.toString();
    if (disarmersDisplay.innerText !== disarmVal) {
        disarmersDisplay.innerText = disarmVal;
        triggerBump(disarmersDisplay);
    }
    
    const comboVal = combo.toString();
    if (comboDisplay.innerText !== comboVal) {
        comboDisplay.innerText = comboVal;
        triggerBump(comboDisplay);
    }
    
    if (timer <= 30) {
        timerDisplay.style.color = 'var(--color-red)';
    } else {
        timerDisplay.style.color = 'var(--color-accent)';
    }
}

function notifyArcadeAction(actionId, amount = 1) {
    window.parent.postMessage({
        type: 'ARCADE_ACTION',
        gameId: 'danger-zoom-zones',
        actionId,
        amount
    }, '*');
}

function triggerBump(el) {
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth; // Trigger reflow
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
}

function formatTime(seconds) {
    if (typeof seconds === 'string') return seconds;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function endGame(win) {
    gameStatus = 'over';
    clearInterval(timerInterval);
    if (overlay) overlay.classList.add('hidden');
    const remainingTime = Math.max(0, timer);
    const currentFinish = formatTime(remainingTime);
    
    if (win) {
        statusText.innerText = 'MISSION ACCOMPLISHED';
        statusText.style.color = 'var(--color-green)';
        statusText.style.textShadow = '0 0 20px var(--color-green)';
        
        currentTimeDisplay.innerText = currentFinish;

        if (bestTime === '--:--' || remainingTime > parseTime(bestTime)) {
            bestTime = currentFinish;
            try {
                localStorage.setItem('danger-zoom-best', bestTime);
            } catch (e) {}
        }
        if (bestTimeDisplay) bestTimeDisplay.innerText = formatTime(bestTime);
    } else {
        statusText.innerText = 'CRITICAL FAILURE';
        statusText.style.color = 'var(--color-red)';
        statusText.style.textShadow = '0 0 20px var(--color-red)';
        if (currentTimeDisplay) currentTimeDisplay.innerText = currentFinish;
    }

    window.QCHArcadeResults.show({
        gameId: 'danger-zoom-zones',
        victory: win,
        score: remainingTime,
        stats: [
            { label: 'Tempo Restante', value: currentFinish },
            { label: 'Bombas Desarmadas', value: `${foundMines}/${TOTAL_MINES}` },
            { label: 'Kits', value: disarmers },
        ],
    });
}

function parseTime(timeStr) {
    if (!timeStr || timeStr === '--:--') return -1;
    const [m, s] = timeStr.split(':').map(Number);
    return m * 60 + s;
}

// Effects
function spawnExplosionEffect(r, c) {
    playSfx(SFX.bombExplosion, 0.78);
    gridContainer.classList.add('shake');
    setTimeout(() => gridContainer.classList.remove('shake'), 400);
}

function spawnTextEffect(text, el) {
    const floater = document.createElement('div');
    floater.innerText = text;
    floater.style.position = 'absolute';
    floater.style.color = 'var(--color-accent)';
    floater.style.fontWeight = '900';
    floater.style.fontSize = '12px';
    floater.style.pointerEvents = 'none';
    floater.style.zIndex = '100';
    floater.style.top = '-20px';
    floater.style.left = '50%';
    floater.style.transform = 'translateX(-50%)';
    floater.style.whiteSpace = 'nowrap';
    floater.style.animation = 'floatText 1s forwards';
    el.appendChild(floater);
}

// Styles for floatText
const style = document.createElement('style');
style.innerHTML = `
@keyframes floatText {
    0% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, -30px); opacity: 0; }
}
`;
document.head.appendChild(style);

// Modal Controls
const modalCloseBtn = document.getElementById('modal-close');
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        playSfx(SFX.closeWindow, 0.55);
    });
}

const btnDisarm = document.getElementById('btn-disarm');
if (btnDisarm) {
    btnDisarm.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (currentCell) disarmCell(currentCell.r, currentCell.c);
    });
}

const btnReveal = document.getElementById('btn-reveal');
if (btnReveal) {
    btnReveal.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (currentCell) revealCell(currentCell.r, currentCell.c, { manualNoBomb: true });
    });
}

// Particles Background
function createBigBang() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    const count = 50;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        container.appendChild(star);
    }
}

window.addEventListener('keydown', (e) => {
    if (!modal || modal.classList.contains('hidden')) return;
    if (e.key.toUpperCase() === 'S') {
        modal.classList.add('hidden');
        if (currentCell) disarmCell(currentCell.r, currentCell.c);
    } else if (e.key.toUpperCase() === 'N') {
        modal.classList.add('hidden');
        if (currentCell) revealCell(currentCell.r, currentCell.c, { manualNoBomb: true });
    } else if (e.key === 'Escape') {
        modal.classList.add('hidden');
        playSfx(SFX.closeWindow, 0.55);
    }
});

if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        if (overlay) overlay.classList.add('hidden');
        init();
    });
}

const exitBtn = document.getElementById('exit-btn');
if (exitBtn) {
    exitBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
    });
}

// Start
createBigBang();
init();
