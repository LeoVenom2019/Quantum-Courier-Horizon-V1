export const NEW_EARTH_BIRD_SPRITESHEET = '/assets/rota4/ambient-birds/bird-flight-spritesheet.png';

type AmbientBirdOptions = {
  flockCount?: number;
  opacity?: number;
  speed?: number;
  verticalBand?: readonly [number, number];
};

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 96;
const FRAME_SEQUENCE = [0, 1, 2, 1] as const;
let birdSpriteSheet: HTMLImageElement | null = null;

const getBirdSpriteSheet = () => {
  if (typeof Image === 'undefined') return null;
  if (!birdSpriteSheet) {
    birdSpriteSheet = new Image();
    birdSpriteSheet.src = NEW_EARTH_BIRD_SPRITESHEET;
  }
  return birdSpriteSheet;
};

export const preloadNewEarthAmbientBirds = () => {
  getBirdSpriteSheet();
};

export const drawNewEarthAmbientBirds = (
  ctx: CanvasRenderingContext2D,
  now: number,
  width: number,
  height: number,
  options: AmbientBirdOptions = {},
) => {
  const spriteSheet = getBirdSpriteSheet();
  if (!spriteSheet?.complete || spriteSheet.naturalWidth <= 0) return;

  const flockCount = Math.max(1, Math.floor(options.flockCount ?? 2));
  const opacity = Math.max(0, Math.min(1, options.opacity ?? 0.48));
  const speed = Math.max(0.01, options.speed ?? 0.055);
  const [minBand, maxBand] = options.verticalBand ?? [0.08, 0.34];
  const travelPadding = 260;
  const travelWidth = width + travelPadding * 2;

  for (let flockIndex = 0; flockIndex < flockCount; flockIndex += 1) {
    const direction = flockIndex % 2 === 0 ? 1 : -1;
    const phaseOffset = flockIndex * (travelWidth / flockCount + 317);
    const progress = ((now * speed + phaseOffset) % travelWidth + travelWidth) % travelWidth;
    const leadX = direction > 0 ? progress - travelPadding : width + travelPadding - progress;
    const verticalProgress = flockCount <= 1 ? 0.5 : flockIndex / (flockCount - 1);
    const leadY = height * (minBand + (maxBand - minBand) * verticalProgress)
      + Math.sin(now * 0.0011 + flockIndex * 2.3) * 7;
    const birdCount = 3 + (flockIndex % 3);

    for (let birdIndex = 0; birdIndex < birdCount; birdIndex += 1) {
      const row = Math.ceil(birdIndex / 2);
      const side = birdIndex === 0 ? 0 : birdIndex % 2 === 0 ? 1 : -1;
      const spacing = 26 + flockIndex * 3;
      const x = leadX - direction * row * spacing;
      const y = leadY + side * row * 14 + Math.sin(now * 0.002 + birdIndex * 1.7) * 2.5;
      if (x < -80 || x > width + 80) continue;

      const frameStep = Math.floor(now / 115 + birdIndex * 0.8 + flockIndex) % FRAME_SEQUENCE.length;
      const frame = FRAME_SEQUENCE[frameStep];
      const scale = 0.82 + ((birdIndex + flockIndex) % 3) * 0.12;
      const drawWidth = 38 * scale;
      const drawHeight = drawWidth * (FRAME_HEIGHT / FRAME_WIDTH);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(direction, 1);
      ctx.rotate(Math.sin(now * 0.0007 + birdIndex) * 0.035);
      ctx.globalAlpha = opacity * (0.84 + scale * 0.12);
      ctx.shadowColor = 'rgba(226,232,240,0.46)';
      ctx.shadowBlur = 2.5;
      ctx.drawImage(
        spriteSheet,
        frame * FRAME_WIDTH,
        0,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight,
      );
      ctx.restore();
    }
  }
};
