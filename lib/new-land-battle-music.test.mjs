import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  NEW_LAND_BATTLE_MUSIC,
  pickNewLandBattleTheme,
} from './new-land-battle-music.mjs';

test('registers the four New Land battle themes as OGG files', () => {
  assert.deepEqual(NEW_LAND_BATTLE_MUSIC.themes, [
    '/audio/new_land/battle_theme_new_land_01.ogg',
    '/audio/new_land/battle_theme_new_land_02.ogg',
    '/audio/new_land/battle_theme_new_land_03.ogg',
    '/audio/new_land/battle_theme_new_land_04.ogg',
  ]);
});

test('selects each New Land theme in an equal 25 percent interval', () => {
  assert.equal(pickNewLandBattleTheme(0), NEW_LAND_BATTLE_MUSIC.themes[0]);
  assert.equal(pickNewLandBattleTheme(0.249999), NEW_LAND_BATTLE_MUSIC.themes[0]);
  assert.equal(pickNewLandBattleTheme(0.25), NEW_LAND_BATTLE_MUSIC.themes[1]);
  assert.equal(pickNewLandBattleTheme(0.5), NEW_LAND_BATTLE_MUSIC.themes[2]);
  assert.equal(pickNewLandBattleTheme(0.75), NEW_LAND_BATTLE_MUSIC.themes[3]);
  assert.equal(pickNewLandBattleTheme(0.999999), NEW_LAND_BATTLE_MUSIC.themes[3]);
});

test('jukebox, preloader and ColonySystem consume the central catalog', async () => {
  const [musicData, preloader, colonySystem] = await Promise.all([
    readFile(new URL('./music-data.ts', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
    readFile(new URL('../components/ColonySystem.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(musicData, /new-land-battle-music\.mjs/);
  assert.match(preloader, /NEW_LAND_BATTLE_MUSIC\.themes/);
  assert.match(colonySystem, /pickNewLandBattleTheme/);
});

test('search-defense and direct battles expose independent persisted music controls', async () => {
  const colonySystem = await readFile(
    new URL('../components/ColonySystem.tsx', import.meta.url),
    'utf8',
  );

  assert.match(colonySystem, /searchDefensePreferenceKey/);
  assert.match(colonySystem, /directPreferenceKey/);
  assert.match(colonySystem, /Defense battle briefing/);
  assert.match(colonySystem, /defenseBattleStarted/);
});
