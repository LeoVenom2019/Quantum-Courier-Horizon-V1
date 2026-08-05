import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const DRONE_PATH = '/assets/rota4/battles/player/horizon/war_drone.webp';

test('uses the Horizon war drone in search-defense and direct battles', async () => {
  const [battle, colonies, preloader] = await Promise.all([
    readFile(new URL('../components/NewEarthDefenseBattle.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/ColonySystem.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  await access(new URL('../public' + DRONE_PATH, import.meta.url));

  assert.match(battle, /SUPPORT_DRONE_IMAGE.*player\/horizon\/war_drone\.webp/);
  assert.match(battle, /const droneImage = getImage\(SUPPORT_DRONE_IMAGE\)/);
  assert.match(battle, /drawSupportDrone\('damage'/);
  assert.match(battle, /drawSupportDrone\('defense'/);
  assert.equal((colonies.match(/<NewEarthDefenseBattle/g) || []).length, 2);
  assert.equal((colonies.match(/damageSupportDrone=\{horizonSkills\.damageDrone > 0\}/g) || []).length, 2);
  assert.equal((colonies.match(/defenseSupportDrone=\{horizonSkills\.defenseDrone > 0\}/g) || []).length, 2);
  assert.match(preloader, /player\/horizon\/war_drone\.webp/);
});
