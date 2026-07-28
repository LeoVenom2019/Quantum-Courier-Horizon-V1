import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  ROUTE4_ELITE_SHIP_IMAGES,
  pickRoute4EliteShipImage,
} from './route4-elite-ship-visuals.mjs';

test('registers both Route 4 elite ship sprites', async () => {
  assert.deepEqual(ROUTE4_ELITE_SHIP_IMAGES, [
    '/assets/rota4/battles/enemys/air_ships/enemy_elite_rt4.webp',
    '/assets/rota4/battles/enemys/air_ships/enemy_elite2_rt4.webp',
  ]);
  await Promise.all(
    ROUTE4_ELITE_SHIP_IMAGES.map(url => access(new URL(`../public${url}`, import.meta.url))),
  );
});

test('selects each elite visual across an equal 50 percent interval', () => {
  assert.equal(pickRoute4EliteShipImage(0), ROUTE4_ELITE_SHIP_IMAGES[0]);
  assert.equal(pickRoute4EliteShipImage(0.499999), ROUTE4_ELITE_SHIP_IMAGES[0]);
  assert.equal(pickRoute4EliteShipImage(0.5), ROUTE4_ELITE_SHIP_IMAGES[1]);
  assert.equal(pickRoute4EliteShipImage(0.999999), ROUTE4_ELITE_SHIP_IMAGES[1]);
});

test('battle generator and preloader consume the shared elite visual catalog', async () => {
  const [battle, preloader] = await Promise.all([
    readFile(new URL('../components/NewEarthDefenseBattle.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(battle, /pickRoute4EliteShipImage\(\)/);
  assert.match(preloader, /\.\.\.ROUTE4_ELITE_SHIP_IMAGES/);
  assert.doesNotMatch(battle + preloader, /enemy_boss_rt4\.webp/);
});
