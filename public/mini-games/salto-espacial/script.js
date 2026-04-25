const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');
const exitBtn = document.getElementById('exit-btn');
const statusElement = document.getElementById('game-status');

// Grid configuration
const COLS = 30;
const ROWS = 17;
const CELL_SIZE = 32;

// Colors
const COLOR_HEAD = '#06b6d4';
const COLOR_BODY = 'rgba(6, 182, 212, 0.4)';
const COLOR_FOOD = '#10b981';
const COLOR_BG = '#01040a';

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

function createStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            opacity: Math.random(),
            pulseSpeed: 0.02 + Math.random() * 0.05
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
    statusElement.innerText = 'ACTIVE';
    statusElement.className = 'status-active';
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
            y: Math.floor(Math.random() * ROWS)
        };
        const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!onSnake) break;
    }
    food = newFood;
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
        updateScore(score + 100);
        spawnParticle(food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2, COLOR_FOOD, 2, 40);
        spawnFood();
        
        // Add new head
        snake.unshift({ x: nextX, y: nextY, px: head.x, py: head.y });
        
        // Collection flash
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
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
        star.opacity += star.pulseSpeed;
        if (star.opacity > 1 || star.opacity < 0.2) star.pulseSpeed *= -1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= COLS; x++) {
        if (x % 5 === 0) ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        else ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        if (y % 5 === 0) ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        else ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
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
    foodPulse += 0.05;
    const breathe = Math.sin(foodPulse) * 3;
    
    ctx.save();
    ctx.shadowBlur = 15 + breathe;
    ctx.shadowColor = COLOR_FOOD;
    ctx.fillStyle = COLOR_FOOD;
    
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3 + breathe / 2,
        0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
}

function drawSnake(interp) {
    // Draw body segments with interpolation
    ctx.shadowBlur = 0;
    
    // Draw trail line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
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
        ctx.fillStyle = `rgba(6, 182, 212, ${opacity * 0.5})`;
        ctx.fillRect(segX + 6, segY + 6, CELL_SIZE - 12, CELL_SIZE - 12);
        
        // Core
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.fillRect(segX + CELL_SIZE/2 - 2, segY + CELL_SIZE/2 - 2, 4, 4);
    }

    // Draw Ship (Head)
    const head = snake[0];
    const headX = (head.px + (head.x - head.px) * interp) * CELL_SIZE;
    const headY = (head.py + (head.y - head.py) * interp) * CELL_SIZE;
    drawShip(headX, headY, direction);
    
    // Speed Particles (Exhaust)
    if (Math.random() > 0.5) {
        let ex, ey;
        if (direction === 'UP') { ex = headX + CELL_SIZE/2; ey = headY + CELL_SIZE; }
        else if (direction === 'DOWN') { ex = headX + CELL_SIZE/2; ey = headY; }
        else if (direction === 'LEFT') { ex = headX + CELL_SIZE; ey = headY + CELL_SIZE/2; }
        else { ex = headX; ey = headY + CELL_SIZE/2; }
        
        particles.push({
            x: ex, y: ey,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 15,
            maxLife: 15,
            color: 'rgba(6, 182, 212, 0.5)',
            size: Math.random() * 2
        });
    }
}

function drawShip(x, y, dir) {
    ctx.save();
    ctx.translate(x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    
    if (dir === 'UP') ctx.rotate(0);
    if (dir === 'DOWN') ctx.rotate(Math.PI);
    if (dir === 'LEFT') ctx.rotate(-Math.PI / 2);
    if (dir === 'RIGHT') ctx.rotate(Math.PI / 2);

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLOR_HEAD;
    ctx.fillStyle = COLOR_HEAD;

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
    const pulse = Math.abs(Math.sin(Date.now() / 100)) * 5;
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10 + pulse;
    ctx.shadowColor = '#fff';
    ctx.fillRect(-6, 8, 3, 3 + pulse/2);
    ctx.fillRect(3, 8, 3, 3 + pulse/2);

    ctx.restore();
}

function gameOver() {
    gameActive = false;
    finalScoreElement.innerText = score;
    overlay.classList.remove('hidden');
    statusElement.innerText = 'OFFLINE';
    statusElement.className = 'status-danger';
    updateHighScore();
    
    // Final score update on game over
    window.parent.postMessage({ 
        type: 'GAME_COMPLETE', 
        gameId: 'salto-espacial', 
        score: score 
    }, '*');
}

function gameLoop(currentTime) {
    if (!gameActive) {
        requestID = null;
        return;
    }

    requestID = requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastTickTime;
    
    if (deltaTime >= tickSpeed) {
        update();
        lastTickTime = currentTime;
    }
    
    // Draw with interp progress
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
