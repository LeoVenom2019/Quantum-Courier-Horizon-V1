import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const battleSourceUrl = new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url);
const preloaderSourceUrl = new URL('./asset-preloader.ts', import.meta.url);

test('keeps ambient fauna decorative and outside combat state', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');
  const stateBlock = source.match(/const stateRef = useRef\(\{([\s\S]*?)\n  \}\);/)?.[1] || '';

  assert.doesNotMatch(stateBlock, /fauna|fish|whale/i);
  assert.match(source, /const drawDistantWhale =/);
  assert.match(source, /const drawDistantBloop =/);
  assert.match(source, /const drawAmbientFish =/);
  assert.match(
    source,
    /drawIlluminatedBackground\([\s\S]*?drawDistantWhale\(ctx, time, currentDepthIndex, siteId\);[\s\S]*?drawDistantBloop\(ctx, time, currentDepthIndex, siteId\);[\s\S]*?drawWaterOverlay\([\s\S]*?drawAmbientFish\(ctx, time, currentDepthIndex, siteId\);[\s\S]*?drawOceanBubbles/,
  );
});

test('reduces fauna with depth and reserves the whale for the distant upper layer', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /if \(depthIndex > 0\) return;/);
  assert.match(source, /const densityByDepth = \[8, 6, 4, 2, 1\];/);
  assert.match(source, /const farLayer = index % 3 === 0 \|\| depthIndex >= 3;/);
  assert.match(source, /const bob = Math\.sin\(/);
  assert.match(source, /if \(depthIndex < 3\) return;/);
  assert.match(source, /const BLOOP_ANIMATION_DURATION_MS = 4125;/);
  assert.match(source, /const nextFrame = \(currentFrame \+ 1\) % BLOOP_FRAME_COUNT/);
});

test('preloads every ambient fauna image used by the underwater canvas', async () => {
  const source = await readFile(preloaderSourceUrl, 'utf8');

  for (const asset of [
    '/assets/rota4/fauna/whale-humpback-source.png',
    '/assets/rota4/fauna/tuna-render.png',
    '/assets/rota4/fauna/bluegill-source.png',
    '/assets/rota4/fauna/goldfish-source.jpeg',
    '/assets/rota4/fauna/bloop/bloop-swim-spritesheet.png',
  ]) {
    assert.match(source, new RegExp(asset.replaceAll('/', '\\/').replace('.', '\\.')));
  }
});
