import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { NEW_EARTH_DROP_SFX, resolveNewEarthHelicopterDropSfx } from './new-earth-drop-sfx.mjs';

const publicDirectory = fileURLToPath(new URL('../public', import.meta.url));

test('routes helicopter pickups to their dedicated sounds', () => {
  assert.equal(resolveNewEarthHelicopterDropSfx('bossDrop'), NEW_EARTH_DROP_SFX.bossDocumentPickup);
  assert.equal(resolveNewEarthHelicopterDropSfx('drone'), NEW_EARTH_DROP_SFX.dronePickup);
  for (const type of ['hp', 'missile', 'shield']) {
    assert.equal(resolveNewEarthHelicopterDropSfx(type), NEW_EARTH_DROP_SFX.normalPickup);
  }
});

test('keeps every configured drop sound available under public assets', () => {
  for (const src of Object.values(NEW_EARTH_DROP_SFX)) {
    assert.equal(existsSync(`${publicDirectory}${src}`), true, `Missing drop SFX: ${src}`);
  }
});
