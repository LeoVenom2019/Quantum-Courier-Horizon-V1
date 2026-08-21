import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const ambientBirdsSource = new URL('./new-earth-ambient-birds.ts', import.meta.url);

test('uses the Chapter 4 animated bird spritesheet as non-interactive canvas scenery', async () => {
  const source = await readFile(ambientBirdsSource, 'utf8');

  assert.match(source, /bird-flight-spritesheet\.png/);
  assert.match(source, /const FRAME_SEQUENCE = \[0, 1, 2, 1\]/);
  assert.match(source, /ctx\.drawImage\(/);
  assert.doesNotMatch(source, /collision|damage|hitbox|projectile/i);
  await access(new URL('./public/assets/rota4/ambient-birds/bird-flight-spritesheet.png', root));
});

test('draws birds in direct, search-defense, helicopter and tank battles only through Chapter 4 components', async () => {
  for (const component of [
    'NewEarthDefenseBattle.tsx',
    'NewEarthHelicopterBattle.tsx',
    'NewEarthSurfaceBattle.tsx',
  ]) {
    const source = await readFile(new URL(`./components/${component}`, root), 'utf8');
    assert.match(source, /drawNewEarthAmbientBirds/);
    assert.match(source, /preloadNewEarthAmbientBirds/);
  }
});
