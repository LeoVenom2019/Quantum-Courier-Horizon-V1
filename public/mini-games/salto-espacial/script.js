const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');
const exitBtn = document.getElementById('exit-btn');

// Grid configuration
const COLS = 30;
const ROWS = 17;
const CELL_SIZE = 32;

// Colors
const COLOR_HEAD = '#06b6d4';
const COLOR_BG = '#000000';
const SOUND_DEAD = '/assets/games/flipers_sfx/snake_dead.ogg';

const SNAKE_COLOR_STAGES = [
    { minLength: 0, color: '#06b6d4', trail: 'rgba(6, 182, 212, 0.2)', body: [6, 182, 212] },
    { minLength: 9, color: '#10b981', trail: 'rgba(16, 185, 129, 0.22)', body: [16, 185, 129] },
    { minLength: 16, color: '#facc15', trail: 'rgba(250, 204, 21, 0.24)', body: [250, 204, 21] },
    { minLength: 25, color: '#ef4444', trail: 'rgba(239, 68, 68, 0.24)', body: [239, 68, 68] },
    { minLength: 35, color: '#d946ef', trail: 'rgba(217, 70, 239, 0.26)', body: [217, 70, 239] }
];

const FOOD_TYPES = [
    {
        id: 'solar',
        name: 'Nucleo Solar',
        color: '#facc15',
        glow: 'rgba(250, 204, 21, 0.9)',
        flash: 'rgba(250, 204, 21, 0.18)',
        sound: '/assets/games/flipers_sfx/snake_take_1.ogg',
        score: 100,
        growth: 1,
        weight: 72
    },
    {
        id: 'crimson',
        name: 'Nucleo Carmesim',
        color: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.95)',
        flash: 'rgba(239, 68, 68, 0.18)',
        sound: '/assets/games/flipers_sfx/snake_take_2.ogg',
        score: 200,
        growth: 2,
        weight: 20
    },
    {
        id: 'void',
        name: 'Nucleo do Vazio',
        color: '#d946ef',
        glow: 'rgba(217, 70, 239, 1)',
        flash: 'rgba(217, 70, 239, 0.18)',
        sound: '/assets/games/flipers_sfx/snake_take_3.ogg',
        score: 400,
        growth: 3,
        weight: 8
    }
];

let snake = [];
let food = null;
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let gameActive = false;
let lastTickTime = 0;
let tickSpeed = 160; 
let requestID = null;
let highScore = parseInt(localStorage.getItem('salto_espacial_high_score')) || 0;

// Visual systems
let stars = [];
let particles = [];
let foodPulse = 0;
const soundCache = new Map();

function createStars() {
    stars = [];
    for (let i = 0; i < 136; i++) {
        const layer = i % 4;
        const x = (i * 137 + layer * 29) % canvas.width;
        const y = (i * 89 + layer * 47) % canvas.height;
        const isAnchor = i % 17 === 0;
        stars.push({
            x,
            y,
            size: isAnchor ? 1.8 : 0.7 + layer * 0.22,
            opacity: isAnchor ? 0.72 : 0.16 + layer * 0.08,
            color: isAnchor ? '6, 182, 212' : '255, 255, 255'
        });
    }
}

function spawnParticle(x, y, color, speed = 1, life = 30) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4 * speed,
            vy: (Math.random() - 0.5) * 4 * speed,
            life: life,
            maxLife: life,
            color: color,
            size: Math.random() * 3
        });
    }
}

function init() {
    if (requestID) {
        cancelAnimationFrame(requestID);
        requestID = null;
    }
    createStars();
    particles = [];
    snake = [
        { x: 10, y: 8, px: 10, py: 8 },
        { x: 9, y: 8, px: 9, py: 8 },
        { x: 8, y: 8, px: 8, py: 8 }
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    tickSpeed = 160;
    updateScore(0);
    spawnFood();
    gameActive = true;
    overlay.classList.add('hidden');
    lastTickTime = performance.now();
    requestID = requestAnimationFrame(gameLoop);
}

function updateScore(newScore) {
    score = newScore;
    scoreElement.innerText = score.toString().padStart(5, '0');
    
    // Notify parent of score update
    window.parent.postMessage({ 
        type: 'SCORE_UPDATE', 
        gameId: 'salto-espacial', 
        score: score 
    }, '*');
}

function spawnFood() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS),
            type: pickFoodType()
        };
        const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!onSnake) break;
    }
    food = newFood;
}

function playSound(path, volume = 0.75) {
    if (!path) return;

    try {
        if (!soundCache.has(path)) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            soundCache.set(path, audio);
        }

        const sound = soundCache.get(path).cloneNode();
        sound.volume = volume;
        sound.play().catch(() => {});
    } catch (error) {
        // Audio can be blocked before user interaction; gameplay must continue.
    }
}

function spawnBurst(x, y, color, amount = 18, speed = 1.6, life = 36, size = 3) {
    for (let i = 0; i < amount; i++) {
        const angle = (Math.PI * 2 * i) / amount;
        const drift = 0.65 + Math.random() * 0.7;

        particles.push({
            x, y,
            vx: Math.cos(angle) * speed * drift,
            vy: Math.sin(angle) * speed * drift,
            life: life + Math.floor(Math.random() * 12),
            maxLife: life + 12,
            color,
            size: 1 + Math.random() * size
        });
    }
}

function playTakeSound(foodType) {
    playSound(foodType.sound, 0.75);
}

function pickFoodType() {
    const totalWeight = FOOD_TYPES.reduce((total, type) => total + type.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const type of FOOD_TYPES) {
        roll -= type.weight;
        if (roll <= 0) return type;
    }

    return FOOD_TYPES[0];
}

function getSnakeColorStage() {
    let currentStage = SNAKE_COLOR_STAGES[0];

    for (const stage of SNAKE_COLOR_STAGES) {
        if (snake.length >= stage.minLength) currentStage = stage;
    }

    return currentStage;
}

function handleInput(e) {
    const key = e.key;
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && direction !== 'DOWN') nextDirection = 'UP';
    if ((key === 'ArrowDown' || key === 's' || key === 'S') && direction !== 'UP') nextDirection = 'DOWN';
    if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && direction !== 'RIGHT') nextDirection = 'LEFT';
    if ((key === 'ArrowRight' || key === 'd' || key === 'D') && direction !== 'LEFT') nextDirection = 'RIGHT';
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('salto_espacial_high_score', highScore.toString());
    }
}

function update() {
    if (!gameActive) return;

    direction = nextDirection;
    
    // 1. Store current positions as previous for interpolation
    for (let i = 0; i < snake.length; i++) {
        snake[i].px = snake[i].x;
        snake[i].py = snake[i].y;
    }

    const head = snake[0];
    let nextX = head.x;
    let nextY = head.y;

    if (direction === 'UP') nextY--;
    if (direction === 'DOWN') nextY++;
    if (direction === 'LEFT') nextX--;
    if (direction === 'RIGHT') nextX++;

    // Collision detection: Walls
    if (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS) {
        gameOver();
        return;
    }

    // Collision detection: Self
    if (snake.some(segment => segment.x === nextX && segment.y === nextY)) {
        gameOver();
        return;
    }

    // Food collection
    if (nextX === food.x && nextY === food.y) {
        const foodType = food.type || FOOD_TYPES[0];
        playTakeSound(foodType);
        updateScore(score + foodType.score);
        spawnParticle(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            foodType.color,
            1.5 + foodType.growth * 0.5,
            34 + foodType.growth * 8
        );
        spawnBurst(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            foodType.color,
            12 + foodType.growth * 8,
            1.2 + foodType.growth * 0.55,
            24 + foodType.growth * 8,
            2 + foodType.growth
        );
        
        // Add new head
        snake.unshift({ x: nextX, y: nextY, px: head.x, py: head.y });

        for (let i = 1; i < foodType.growth; i++) {
            const tail = snake[snake.length - 1];
            snake.push({ x: tail.x, y: tail.y, px: tail.px, py: tail.py });
        }

        spawnFood();
        
        // Collection flash
        ctx.fillStyle = foodType.flash;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (tickSpeed > 70) tickSpeed -= 1.5;
    } else {
        // Move all segments
        for (let i = snake.length - 1; i > 0; i--) {
            snake[i].x = snake[i-1].x;
            snake[i].y = snake[i-1].y;
        }
        snake[0].x = nextX;
        snake[0].y = nextY;
    }
}

function draw(interp) {
    // Clear canvas with subtle trail
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawGrid();
    drawParticles();

    // Draw Food
    drawFood();

    // Draw Snake Trail (Rastro energético)
    drawSnake(interp);
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.035)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= COLS; x++) {
        if (x % 5 === 0) ctx.strokeStyle = 'rgba(6, 182, 212, 0.09)';
        else ctx.strokeStyle = 'rgba(6, 182, 212, 0.035)';
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        if (y % 5 === 0) ctx.strokeStyle = 'rgba(6, 182, 212, 0.09)';
        else ctx.strokeStyle = 'rgba(6, 182, 212, 0.035)';
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(canvas.width, y * CELL_SIZE);
        ctx.stroke();
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawFood() {
    if (!food) return;

    foodPulse += 0.05;
    const foodType = food.type || FOOD_TYPES[0];
    const breathe = Math.sin(foodPulse) * 3;
    const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 3 + breathe / 2;
    
    ctx.save();
    ctx.shadowBlur = 18 + breathe;
    ctx.shadowColor = foodType.color;
    ctx.strokeStyle = foodType.glow;
    ctx.lineWidth = foodType.growth;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 6, 0, Math.PI * 2);
    ctx.stroke();

    if (foodType.id === 'void') {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = foodPulse + (Math.PI / 2) * i;
            const px = centerX + Math.cos(angle) * (radius + 8);
            const py = centerY + Math.sin(angle) * (radius + 8);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    }

    ctx.fillStyle = foodType.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX - radius / 3, centerY - radius / 3, Math.max(2, radius / 5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawSnake(interp) {
    // Draw body segments with interpolation
    ctx.shadowBlur = 0;
    const colorStage = getSnakeColorStage();
    
    // Draw trail line
    ctx.beginPath();
    ctx.strokeStyle = colorStage.trail;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        const segX = (seg.px + (seg.x - seg.px) * interp) * CELL_SIZE + CELL_SIZE / 2;
        const segY = (seg.py + (seg.y - seg.py) * interp) * CELL_SIZE + CELL_SIZE / 2;
        
        if (i === 0) ctx.moveTo(segX, segY);
        else ctx.lineTo(segX, segY);
    }
    ctx.stroke();

    // Draw segment blocks
    for (let i = 1; i < snake.length; i++) {
        const seg = snake[i];
        const segX = (seg.px + (seg.x - seg.px) * interp) * CELL_SIZE;
        const segY = (seg.py + (seg.y - seg.py) * interp) * CELL_SIZE;
        
        // Energy Segment
        const opacity = Math.max(0.1, 1 - (i / snake.length));
        ctx.fillStyle = `rgba(${colorStage.body[0]}, ${colorStage.body[1]}, ${colorStage.body[2]}, ${opacity * 0.55})`;
        ctx.fillRect(segX + 6, segY + 6, CELL_SIZE - 12, CELL_SIZE - 12);
        
        // Core
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.fillRect(segX + CELL_SIZE/2 - 2, segY + CELL_SIZE/2 - 2, 4, 4);
    }

    // Draw Ship (Head)
    const head = snake[0];
    const headX = (head.px + (head.x - head.px) * interp) * CELL_SIZE;
    const headY = (head.py + (head.y - head.py) * interp) * CELL_SIZE;
    drawShip(headX, headY, direction, colorStage.color);
    
}

function drawShip(x, y, dir, shipColor = COLOR_HEAD) {
    ctx.save();
    ctx.translate(x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    
    if (dir === 'UP') ctx.rotate(0);
    if (dir === 'DOWN') ctx.rotate(Math.PI);
    if (dir === 'LEFT') ctx.rotate(-Math.PI / 2);
    if (dir === 'RIGHT') ctx.rotate(Math.PI / 2);

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = shipColor;
    ctx.fillStyle = shipColor;

    // Detailed ship shape
    ctx.beginPath();
    ctx.moveTo(0, -14); // Nose
    ctx.lineTo(-12, 8);  // Wing Left
    ctx.lineTo(-4, 4);   // Body Left
    ctx.lineTo(4, 4);    // Body Right
    ctx.lineTo(12, 8);   // Wing Right
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(0, -2, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Booster energy
    const pulse = Math.abs(Math.sin(Date.now() / 120)) * 3;
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10 + pulse;
    ctx.shadowColor = '#fff';
    ctx.fillRect(-6, 8, 3, 3 + pulse/2);
    ctx.fillRect(3, 8, 3, 3 + pulse/2);

    ctx.restore();
}

function animateDeathBurst(startTime) {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / 520);

    draw(1);
    ctx.fillStyle = `rgba(239, 68, 68, ${0.16 * (1 - progress)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (progress < 1) {
        requestAnimationFrame(() => animateDeathBurst(startTime));
    }
}

function gameOver() {
    const head = snake[0];
    const colorStage = getSnakeColorStage();

    gameActive = false;
    playSound(SOUND_DEAD, 0.85);

    if (head) {
        spawnBurst(
            head.x * CELL_SIZE + CELL_SIZE / 2,
            head.y * CELL_SIZE + CELL_SIZE / 2,
            colorStage.color,
            34,
            2.6,
            48,
            4
        );
        spawnBurst(
            head.x * CELL_SIZE + CELL_SIZE / 2,
            head.y * CELL_SIZE + CELL_SIZE / 2,
            '#ef4444',
            18,
            1.8,
            38,
            3
        );
        animateDeathBurst(performance.now());
    }

    finalScoreElement.innerText = score;
    setTimeout(() => {
        if (!gameActive) {
            const victory = score >= 5000;
            window.QCHArcadeResults.show({
                gameId: 'salto-espacial',
                victory,
                score,
                stats: [
                    { label: 'Final Score', value: score },
                    { label: 'Target', value: '5000' },
                ],
            });
        }
    }, 420);
    updateHighScore();
}

function gameLoop(currentTime) {
    if (!gameActive) {
        requestID = null;
        return;
    }

    requestID = requestAnimationFrame(gameLoop);

    let deltaTime = currentTime - lastTickTime;
    
    if (deltaTime >= tickSpeed) {
        update();
        lastTickTime += tickSpeed;

        if (currentTime - lastTickTime > tickSpeed) {
            lastTickTime = currentTime;
        }

        deltaTime = currentTime - lastTickTime;
    }
    
    const interp = Math.min(1, deltaTime / tickSpeed);
    draw(interp);
}

// Event Listeners
window.addEventListener('keydown', handleInput);

restartBtn.addEventListener('click', () => {
    init();
});

exitBtn.addEventListener('click', () => {
    window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
});

const exitGameBtn = document.getElementById('exit-game-btn');
if (exitGameBtn) {
    exitGameBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'CLOSE_MINI_GAME' }, '*');
    });
}

// Start game
init();
