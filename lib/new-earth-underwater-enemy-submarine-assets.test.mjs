import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const battleSourceUrl = new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url);
const preloaderSourceUrl = new URL('./asset-preloader.ts', import.meta.url);

test('uses the FBX render for enemies while retaining every original sprite set as fallback', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /const ENEMY_SUBMARINE_FBX_RENDER = '\/assets\/rota4\/enemy-submarines\/enemy-submarine-fbx-render\.png'/);
  assert.match(source, /enemy_submarine1: createSubmarineSpriteSet/);
  assert.match(source, /enemy_submarine2: createSubmarineSpriteSet/);
  assert.match(source, /enemy_submarine3: createSubmarineSpriteSet/);
  assert.match(source, /const fallbackSprite = getImage\(sprites\[spriteKey\]\)/);
  assert.match(source, /if \(trialSprite\?\.complete && trialSprite\.naturalWidth > 0\)/);
  assert.match(source, /ctx\.drawImage\(fallbackSprite/);
});

test('keeps the trial submarine upright while changing direction', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /const facesRight = Math\.cos\(angle\) >= 0/);
  assert.match(
    source,
    /const uprightPitch = clamp\([\s\S]*?Math\.atan2\(Math\.sin\(angle\), Math\.abs\(Math\.cos\(angle\)\)\),[\s\S]*?-0\.42,[\s\S]*?0\.42/,
  );
  assert.match(source, /ctx\.rotate\(uprightPitch\)/);
  assert.match(source, /ctx\.scale\(facesRight \? -1 : 1, 1\)/);
  assert.doesNotMatch(source, /ctx\.rotate\(angle\);[\s\S]{0,500}ENEMY_SUBMARINE_FBX_SOURCE_CROP/);
});

test('preloads the trial enemy submarine render', async () => {
  const source = await readFile(preloaderSourceUrl, 'utf8');
  assert.match(source, /\/assets\/rota4\/enemy-submarines\/enemy-submarine-fbx-render\.png/);
});

test('renders every enemy submarine, including the boss, twenty percent larger', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /const ENEMY_SUBMARINE_VISUAL_SCALE = 1\.2/);
  assert.match(
    source,
    /const sizeMultiplier = \(enemy\.isBoss \? BOSS_SIZE_MULTIPLIER : 1\) \* ENEMY_SUBMARINE_VISUAL_SCALE/,
  );
});
