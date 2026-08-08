const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.join(__dirname, '..');
const installerDir = path.join(projectRoot, 'build', 'installer');
const backgroundPath = path.join(installerDir, 'space-background.png');
const logoPath = path.join(projectRoot, 'qch.png');

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

  const pipeline = sharp(backgroundPath)
    .resize(164, 314, { fit: 'cover', position: 'centre' })
    .composite([
      { input: branding, left: 0, top: 0 },
      { input: logo, left: 24, top: 38 },
    ]);

  await saveBmp(pipeline, path.join(installerDir, 'installerSidebar.bmp'));
};

const createHeader = async () => {
  const logo = await sharp(logoPath).resize(50, 50).png().toBuffer();
  const branding = svg(150, 57, `
    <rect width="150" height="57" fill="#020617" fill-opacity="0.72"/>
    <line x1="8" y1="46" x2="91" y2="46" stroke="#22d3ee" stroke-width="1" opacity="0.8"/>
    <text x="8" y="22" fill="#ecfeff" font-family="Segoe UI, Arial" font-size="8" font-weight="600" letter-spacing="0.7">QUANTUM COURIER</text>
    <text x="8" y="39" fill="#67e8f9" font-family="Segoe UI, Arial" font-size="14" font-weight="700" letter-spacing="1.5">HORIZON</text>
  `);

  const pipeline = sharp(backgroundPath)
    .resize(150, 57, { fit: 'cover', position: 'south' })
    .composite([
      { input: branding, left: 0, top: 0 },
      { input: logo, left: 98, top: 3 },
    ]);

  await saveBmp(pipeline, path.join(installerDir, 'installerHeader.bmp'));
};

(async () => {
  await Promise.all([createSidebar(), createHeader()]);
  console.log('Generated professional NSIS sidebar and header assets.');
})();
