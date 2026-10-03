const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.join(__dirname, '..');
const installerDir = path.join(projectRoot, 'build', 'installer');
const backgroundPath = path.join(installerDir, 'space-background.png');
const launchBackgroundPath = path.join(installerDir, 'launch-sequence-background.png');
const logoPath = path.join(projectRoot, 'qch.png');
const shipPath = path.join(projectRoot, 'public', 'images', 'ships', 'battle', 'player-battle.webp');
const sequenceDir = path.join(installerDir, 'sequence');

const svg = (width, height, content) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${content}</svg>`,
);

const encodeBmp = ({ data, info }) => {
  const { width, height } = info;
  const rowStride = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowStride * height;
  const output = Buffer.alloc(54 + pixelBytes);

  output.write('BM', 0, 2, 'ascii');
  output.writeUInt32LE(output.length, 2);
  output.writeUInt32LE(54, 10);
  output.writeUInt32LE(40, 14);
  output.writeInt32LE(width, 18);
  output.writeInt32LE(height, 22);
  output.writeUInt16LE(1, 26);
  output.writeUInt16LE(24, 28);
  output.writeUInt32LE(pixelBytes, 34);
  output.writeInt32LE(3780, 38);
  output.writeInt32LE(3780, 42);

  for (let y = 0; y < height; y += 1) {
    const sourceRow = y * width * 3;
    const targetRow = 54 + (height - y - 1) * rowStride;
    for (let x = 0; x < width; x += 1) {
      const source = sourceRow + x * 3;
      const target = targetRow + x * 3;
      output[target] = data[source + 2];
      output[target + 1] = data[source + 1];
      output[target + 2] = data[source];
    }
  }

  return output;
};

const saveBmp = async (pipeline, outputPath) => {
  const raw = await pipeline.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  fs.writeFileSync(outputPath, encodeBmp(raw));
};

const createSidebar = async () => {
  const logo = await sharp(logoPath).resize(116, 116).png().toBuffer();
  const branding = svg(164, 314, `
    <rect width="164" height="314" fill="url(#shade)"/>
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#020617" stop-opacity="0.12"/>
        <stop offset="0.55" stop-color="#020617" stop-opacity="0.38"/>
        <stop offset="1" stop-color="#020617" stop-opacity="0.72"/>
      </linearGradient>
    </defs>
    <line x1="36" y1="171" x2="128" y2="171" stroke="#22d3ee" stroke-width="1" opacity="0.8"/>
    <text x="82" y="194" text-anchor="middle" fill="#ecfeff" font-family="Segoe UI, Arial" font-size="10" font-weight="600" letter-spacing="1">QUANTUM COURIER</text>
    <text x="82" y="214" text-anchor="middle" fill="#67e8f9" font-family="Segoe UI, Arial" font-size="17" font-weight="700" letter-spacing="2">HORIZON</text>
  `);

  await saveBmp(
    sharp(backgroundPath)
      .resize(164, 314, { fit: 'cover', position: 'centre' })
      .composite([
        { input: branding, left: 0, top: 0 },
        { input: logo, left: 24, top: 38 },
      ]),
    path.join(installerDir, 'installerSidebar.bmp'),
  );
};

const createHeader = async () => {
  const logo = await sharp(logoPath).resize(50, 50).png().toBuffer();
  const branding = svg(150, 57, `
    <rect width="150" height="57" fill="#020617" fill-opacity="0.72"/>
    <line x1="8" y1="46" x2="91" y2="46" stroke="#22d3ee" stroke-width="1" opacity="0.8"/>
    <text x="8" y="22" fill="#ecfeff" font-family="Segoe UI, Arial" font-size="8" font-weight="600" letter-spacing="0.7">QUANTUM COURIER</text>
    <text x="8" y="39" fill="#67e8f9" font-family="Segoe UI, Arial" font-size="14" font-weight="700" letter-spacing="1.5">HORIZON</text>
  `);

  await saveBmp(
    sharp(backgroundPath)
      .resize(150, 57, { fit: 'cover', position: 'south' })
      .composite([
        { input: branding, left: 0, top: 0 },
        { input: logo, left: 98, top: 3 },
      ]),
    path.join(installerDir, 'installerHeader.bmp'),
  );
};

const sequenceOverlay = ({ progress, returning = false }) => {
  const portalPulse = 0.56 + (Math.sin(progress * Math.PI * 3) + 1) * 0.12;
  const laserVisible = !returning && (progress === 0.3 || progress === 0.6);
  const sadFace = returning
    ? `<g transform="translate(74 88)" opacity="${0.72 + progress * 0.2}">
        <circle cx="0" cy="0" r="12" fill="#020617" fill-opacity="0.76" stroke="#67e8f9" stroke-width="1.5"/>
        <circle cx="-4" cy="-2" r="1.5" fill="#a5f3fc"/>
        <circle cx="4" cy="-2" r="1.5" fill="#a5f3fc"/>
        <path d="M -5 6 Q 0 1 5 6" fill="none" stroke="#a5f3fc" stroke-width="1.5" stroke-linecap="round"/>
      </g>`
    : '';

  return svg(500, 175, `
    <defs>
      <linearGradient id="hudShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#020617" stop-opacity="0"/>
        <stop offset="1" stop-color="#020617" stop-opacity="0.78"/>
      </linearGradient>
    </defs>
    <rect y="122" width="500" height="53" fill="url(#hudShade)"/>
    <circle cx="394" cy="77" r="${30 + progress * 5}" fill="none" stroke="#67e8f9" stroke-width="1" opacity="${portalPulse}"/>
    <circle cx="394" cy="77" r="${38 + progress * 7}" fill="none" stroke="#a78bfa" stroke-width="1" opacity="${portalPulse * 0.7}"/>
    <path d="M 18 145 H 482" stroke="#22d3ee" stroke-width="1" opacity="0.24"/>
    <path d="M 18 151 H ${18 + Math.round(progress * 464)}" stroke="#67e8f9" stroke-width="2" opacity="0.9"/>
    ${laserVisible ? '<path d="M 205 85 L 292 59" stroke="#a5f3fc" stroke-width="2"/><circle cx="296" cy="57" r="5" fill="#ffffff" opacity="0.85"/>' : ''}
    ${sadFace}
  `);
};

const createSequenceFrame = async ({ frame, returning }) => {
  const progress = frame / 10;
  const eased = progress * progress * (3 - 2 * progress);
  const shipWidth = Math.round(126 - progress * 22);
  const ship = await sharp(shipPath)
    .resize({ width: shipWidth })
    .flop(returning)
    .png()
    .toBuffer();
  const shipX = returning ? Math.round(345 - eased * 330) : Math.round(18 + eased * 330);
  const shipY = Math.round(45 + Math.sin(progress * Math.PI * 2) * 5 + progress * 7);
  const engineStart = returning ? shipX + shipWidth - 8 : Math.max(0, shipX - 74);
  const engineEnd = returning ? Math.min(500, shipX + shipWidth + 74) : shipX + 9;
  const trail = svg(500, 175, `
    <path d="M ${engineStart} ${shipY + 42} L ${engineEnd} ${shipY + 42}" stroke="#67e8f9" stroke-width="5" opacity="${0.34 + progress * 0.28}"/>
    <path d="M ${engineStart} ${shipY + 42} L ${engineEnd} ${shipY + 42}" stroke="#ffffff" stroke-width="1" opacity="0.78"/>
  `);
  const outputName = `${returning ? 'return' : 'launch'}-${String(frame).padStart(2, '0')}.bmp`;

  await saveBmp(
    sharp(launchBackgroundPath)
      .resize(500, 175, { fit: 'cover', position: 'centre' })
      .composite([
        { input: trail, left: 0, top: 0 },
        { input: ship, left: shipX, top: shipY },
        { input: sequenceOverlay({ progress, returning }), left: 0, top: 0 },
      ]),
    path.join(sequenceDir, outputName),
  );
};

const createSequenceFrames = async () => {
  fs.mkdirSync(sequenceDir, { recursive: true });
  const jobs = [];
  for (let frame = 0; frame <= 10; frame += 1) {
    jobs.push(createSequenceFrame({ frame, returning: false }));
    jobs.push(createSequenceFrame({ frame, returning: true }));
  }
  await Promise.all(jobs);
};

const createUninstallerSidebar = async () => {
  const ship = await sharp(shipPath).resize({ width: 128 }).flop().png().toBuffer();
  const farewell = svg(164, 314, `
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#020617" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#020617" stop-opacity="0.82"/>
      </linearGradient>
    </defs>
    <rect width="164" height="314" fill="url(#shade)"/>
    <circle cx="82" cy="109" r="16" fill="#020617" fill-opacity="0.82" stroke="#67e8f9" stroke-width="1.5"/>
    <circle cx="76" cy="105" r="2" fill="#a5f3fc"/>
    <circle cx="88" cy="105" r="2" fill="#a5f3fc"/>
    <path d="M 75 118 Q 82 110 89 118" fill="none" stroke="#a5f3fc" stroke-width="2" stroke-linecap="round"/>
    <line x1="34" y1="229" x2="130" y2="229" stroke="#22d3ee" stroke-width="1" opacity="0.72"/>
    <text x="82" y="252" text-anchor="middle" fill="#ecfeff" font-family="Segoe UI, Arial" font-size="9" font-weight="600" letter-spacing="1">RETURN SEQUENCE</text>
    <text x="82" y="272" text-anchor="middle" fill="#67e8f9" font-family="Segoe UI, Arial" font-size="14" font-weight="700" letter-spacing="1.4">OBRIGADO</text>
  `);

  await saveBmp(
    sharp(launchBackgroundPath)
      .resize(164, 314, { fit: 'cover', position: 'left' })
      .composite([
        { input: ship, left: 18, top: 126 },
        { input: farewell, left: 0, top: 0 },
      ]),
    path.join(installerDir, 'uninstallerSidebar.bmp'),
  );
};

(async () => {
  if (!fs.existsSync(launchBackgroundPath)) {
    throw new Error(`Missing launch sequence background: ${launchBackgroundPath}`);
  }
  await Promise.all([
    createSidebar(),
    createHeader(),
    createUninstallerSidebar(),
    createSequenceFrames(),
  ]);
  console.log('Generated premium NSIS Launch Sequence and Return Sequence assets.');
})();
