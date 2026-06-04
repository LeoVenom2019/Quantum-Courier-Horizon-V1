const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const distanceEl = document.getElementById('distance');
const hitsEl = document.getElementById('hits');
const windEl = document.getElementById('wind');
const statusEl = document.getElementById('status');
const drawButton = document.getElementById('drawButton');
const resetButton = document.getElementById('resetButton');
const powerFill = document.getElementById('powerFill');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 615;
const ARCHER_X = 145;
const ARCHER_Y = GROUND_Y - 92;
const TARGET_X = 980;
const GRAVITY = 0.28;
const BASE_ARROW_SPEED = 11.5;
const DISTANCE_STEP = 5;
const START_DISTANCE = 20;
const MAX_POWER = 100;

let distanceMeters = START_DISTANCE;
let hits = 0;
let wind = 0;
let isDrawing = false;
let drawPower = 0;
let drawDirection = 1;
let statusText = 'Puxe o arco';
let arrow = null;
let particles = [];
let floatingText = [];
let lastTime = 0;

const keys = {
  Space: false,
};

function resetRound(fullReset = false) {
  if (fullReset) {
    distanceMeters = START_DISTANCE;
    hits = 0;
  }
  arrow = null;
  particles = [];
  floatingText = [];
  drawPower = 0;
  isDrawing = false;
  drawDirection = 1;
  wind = Number(((Math.random() - 0.5) * Math.min(2.8, 0.4 + hits * 0.18)).toFixed(1));
  statusText = 'Puxe o arco';
  updateHud();
}

function updateHud() {
  distanceEl.textContent = `${distanceMeters}m`;
  hitsEl.textContent = hits;
  windEl.textContent = wind > 0 ? `+${wind}` : String(wind);
  statusEl.textContent = statusText;
  powerFill.style.width = `${drawPower}%`;
  drawButton.classList.toggle('is-drawing', isDrawing);
}

function startDrawing() {
  if (arrow) return;
  isDrawing = true;
  statusText = 'Segure...';
  updateHud();
}

function releaseArrow() {
  if (!isDrawing || arrow) return;
  isDrawing = false;

  const powerRatio = Math.max(0.08, drawPower / MAX_POWER);
  const distancePenalty = Math.min(0.44, (distanceMeters - START_DISTANCE) * 0.011);
  const speed = BASE_ARROW_SPEED * (0.72 + powerRatio * 1.22);
  const angle = -0.17 - powerRatio * (0.62 + distancePenalty);

  arrow = {
    x: ARCHER_X + 42,
    y: ARCHER_Y - 8,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: angle,
    stuck: false,
    age: 0,
  };

  statusText = 'Flecha lançada';
  drawPower = 0;
  updateHud();
}

function getApple() {
  const targetHeight = 170;
  const targetY = GROUND_Y - targetHeight;
  const bob = Math.sin(performance.now() / 500) * 3;
  return {
    x: TARGET_X + Math.min(145, (distanceMeters - START_DISTANCE) * 4.1),
    y: targetY + 36 + bob,
    radius: 15,
  };
}

function spawnBurst(x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 5.2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 38 + Math.random() * 24,
      maxLife: 62,
      size: 2 + Math.random() * 4,
      color,
    });
  }
}

function addFloatingText(text, x, y, color) {
  floatingText.push({ text, x, y, color, life: 70, maxLife: 70 });
}

function scoreHit() {
  const apple = getApple();
  hits++;
  distanceMeters += DISTANCE_STEP;
  spawnBurst(apple.x, apple.y, '#ef4444', 34);
  spawnBurst(apple.x, apple.y, '#facc15', 18);
  addFloatingText(`+${DISTANCE_STEP}m`, apple.x, apple.y - 38, '#facc15');
  arrow = null;
  drawPower = 0;
  statusText = 'Acertou a maçã';
  window.setTimeout(() => {
    if (!arrow) {
      wind = Number(((Math.random() - 0.5) * Math.min(2.8, 0.4 + hits * 0.18)).toFixed(1));
      statusText = 'Puxe o arco';
      updateHud();
    }
  }, 650);
  updateHud();
}

function missArrow(reason) {
  statusText = reason;
  addFloatingText('Errou', WIDTH / 2, 210, '#ef4444');
  arrow = null;
  drawPower = 0;
  updateHud();
}

function updateArrow() {
  if (!arrow) return;

  arrow.age++;
  arrow.vx += wind * 0.0035;
  arrow.vy += GRAVITY;
  arrow.x += arrow.vx;
  arrow.y += arrow.vy;
  arrow.rotation = Math.atan2(arrow.vy, arrow.vx);

  if (arrow.age % 2 === 0) {
    particles.push({
      x: arrow.x - Math.cos(arrow.rotation) * 28,
      y: arrow.y - Math.sin(arrow.rotation) * 28,
      vx: -0.2,
      vy: 0.12,
      life: 20,
      maxLife: 20,
      size: 1.3,
      color: 'rgba(226,232,240,0.75)',
    });
  }

  const apple = getApple();
  const tipX = arrow.x + Math.cos(arrow.rotation) * 32;
  const tipY = arrow.y + Math.sin(arrow.rotation) * 32;
  if (Math.hypot(tipX - apple.x, tipY - apple.y) <= apple.radius + 6) {
    scoreHit();
    return;
  }

  if (arrow.y > GROUND_Y + 18) {
    spawnBurst(arrow.x, GROUND_Y, '#94a3b8', 14);
    missArrow('Caiu antes');
    return;
  }

  if (arrow.x > WIDTH + 120 || arrow.y < -80) {
    missArrow('Passou longe');
  }
}

function update(dt) {
  if (isDrawing) {
    drawPower += drawDirection * dt * 0.09;
    if (drawPower >= MAX_POWER) {
      drawPower = MAX_POWER;
      drawDirection = -1;
    } else if (drawPower <= 8) {
      drawPower = 8;
      drawDirection = 1;
    }
  }

  updateArrow();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.035;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingText.length - 1; i >= 0; i--) {
    const item = floatingText[i];
    item.y -= 0.45;
    item.life--;
    if (item.life <= 0) floatingText.splice(i, 1);
  }

  updateHud();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#172554');
  sky.addColorStop(0.48, '#0f766e');
  sky.addColorStop(1, '#164e63');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 70; i++) {
    const x = (i * 173 + 31) % WIDTH;
    const y = (i * 79 + 17) % 260;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#052e2b';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  for (let x = 0; x <= WIDTH; x += 80) {
    ctx.lineTo(x, 390 + Math.sin(x * 0.018) * 26);
  }
  ctx.lineTo(WIDTH, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  ctx.fillStyle = 'rgba(250,204,21,0.28)';
  ctx.fillRect(0, GROUND_Y, WIDTH, 4);
}

function drawArcher() {
  ctx.save();
  ctx.translate(ARCHER_X, ARCHER_Y);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -42, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(0, 26);
  ctx.lineTo(-18, 58);
  ctx.moveTo(0, 26);
  ctx.lineTo(22, 58);
  ctx.moveTo(0, -8);
  ctx.lineTo(34, -22);
  ctx.moveTo(0, -8);
  ctx.lineTo(-22, 10);
  ctx.stroke();

  const pull = isDrawing ? 14 + drawPower * 0.28 : 10;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(39, -17, 48, -1.15, 1.15);
  ctx.stroke();

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(58, -62);
  ctx.quadraticCurveTo(24 - pull, -17, 58, 28);
  ctx.stroke();

  if (isDrawing) {
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(24 - pull, -17);
    ctx.lineTo(72, -17);
    ctx.stroke();
  }

  ctx.restore();
}

function drawArrow() {
  if (!arrow) return;

  ctx.save();
  ctx.translate(arrow.x, arrow.y);
  ctx.rotate(arrow.rotation);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(32, 0);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(26, -6);
  ctx.lineTo(26, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-42, -8);
  ctx.lineTo(-36, 0);
  ctx.lineTo(-42, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTarget() {
  const apple = getApple();
  const trunkX = apple.x + 22;
  const targetBaseY = GROUND_Y;

  ctx.fillStyle = '#713f12';
  ctx.fillRect(trunkX - 12, apple.y + 20, 24, targetBaseY - apple.y - 20);
  ctx.fillStyle = '#422006';
  ctx.fillRect(trunkX - 6, apple.y + 20, 12, targetBaseY - apple.y - 20);

  ctx.strokeStyle = 'rgba(226,232,240,0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(trunkX - 46, apple.y + 56);
  ctx.lineTo(trunkX + 46, apple.y + 56);
  ctx.stroke();

  ctx.fillStyle = '#ef4444';
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#ef4444';
  ctx.beginPath();
  ctx.arc(apple.x, apple.y, apple.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(apple.x + 8, apple.y - 15, 9, 4, -0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawAimGuide() {
  if (!isDrawing || arrow) return;
  const powerRatio = Math.max(0.08, drawPower / MAX_POWER);
  const distancePenalty = Math.min(0.44, (distanceMeters - START_DISTANCE) * 0.011);
  const speed = BASE_ARROW_SPEED * (0.72 + powerRatio * 1.22);
  const angle = -0.17 - powerRatio * (0.62 + distancePenalty);
  let x = ARCHER_X + 42;
  let y = ARCHER_Y - 8;
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;

  ctx.save();
  ctx.fillStyle = 'rgba(250,204,21,0.45)';
  for (let i = 0; i < 38; i++) {
    vx += wind * 0.0035;
    vy += GRAVITY;
    x += vx * 2.8;
    y += vy * 2.8;
    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawFloatingText() {
  floatingText.forEach(item => {
    ctx.globalAlpha = Math.max(0, item.life / item.maxLife);
    ctx.fillStyle = item.color;
    ctx.font = '900 28px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(item.text, item.x, item.y);
  });
  ctx.globalAlpha = 1;
}

function drawDistanceMarkers() {
  ctx.save();
  ctx.strokeStyle = 'rgba(226,232,240,0.16)';
  ctx.fillStyle = 'rgba(226,232,240,0.52)';
  ctx.font = '700 11px JetBrains Mono';
  for (let i = 0; i <= 7; i++) {
    const x = ARCHER_X + 120 + i * 120;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x, GROUND_Y + 16);
    ctx.stroke();
    ctx.fillText(`${START_DISTANCE + i * 5}m`, x - 14, GROUND_Y + 34);
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawDistanceMarkers();
  drawAimGuide();
  drawTarget();
  drawArcher();
  drawArrow();
  drawParticles();
  drawFloatingText();
}

function loop(time) {
  const dt = Math.min(34, time - lastTime || 16.67);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

drawButton.addEventListener('mousedown', startDrawing);
drawButton.addEventListener('mouseup', releaseArrow);
drawButton.addEventListener('mouseleave', () => {
  if (isDrawing) releaseArrow();
});

resetButton.addEventListener('click', () => resetRound(true));

window.addEventListener('keydown', event => {
  if (event.code === 'Space' && !keys.Space) {
    event.preventDefault();
    keys.Space = true;
    startDrawing();
  }
});

window.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    event.preventDefault();
    keys.Space = false;
    releaseArrow();
  }
});

resetRound(true);
requestAnimationFrame(loop);
