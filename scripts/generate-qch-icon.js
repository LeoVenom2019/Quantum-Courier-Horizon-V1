const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.join(__dirname, '..');
const sourcePath = path.join(projectRoot, 'qchico.jpeg');
const pngPath = path.join(projectRoot, 'qch.png');
const icoPath = path.join(projectRoot, 'qch.ico');

// Bounds of the luminous circular border in the 2048 x 2048 source artwork.
const crop = { left: 260, top: 246, width: 1524, height: 1524 };
const sizes = [16, 24, 32, 48, 64, 128, 256];

const circleMask = size => Buffer.from(
  `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
  `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>` +
  '</svg>',
);

const createPng = size => sharp(sourcePath)
  .extract(crop)
  .resize(size, size, { kernel: sharp.kernel.lanczos3 })
  .ensureAlpha()
  .composite([{ input: circleMask(size), blend: 'dest-in' }])
  .png({ compressionLevel: 9 })
  .toBuffer();

const createIco = images => {
  const headerSize = 6;
  const entrySize = 16;
  let imageOffset = headerSize + entrySize * images.length;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(imageOffset, 12);
    imageOffset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(image => image.data)]);
};

(async () => {
  const images = await Promise.all(sizes.map(async size => ({ size, data: await createPng(size) })));
  const largest = images.find(image => image.size === 256);

  fs.writeFileSync(pngPath, largest.data);
  fs.writeFileSync(icoPath, createIco(images));
  console.log(`Generated ${path.basename(icoPath)} with sizes: ${sizes.join(', ')} px`);
})();
