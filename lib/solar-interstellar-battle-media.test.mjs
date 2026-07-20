import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  SOLAR_INTERSTELLAR_BATTLE_MEDIA,
  getManualBattleResultAudio,
  isSolarInterstellarManualBattle,
  pickManualBattleTheme,
} from './solar-interstellar-battle-media.mjs';

test('enables the custom experience only for manual Solar and Interstellar battles', () => {
  assert.equal(isSolarInterstellarManualBattle('Solar', undefined), true);
  assert.equal(isSolarInterstellarManualBattle('Interstellar', 'manual-42'), true);
  assert.equal(isSolarInterstellarManualBattle('Solar', 'auto-42'), false);
  assert.equal(isSolarInterstellarManualBattle('Interstellar', 'auto-42'), false);
  assert.equal(isSolarInterstellarManualBattle('Void', undefined), false);
});

test('selects each chapter battle theme with an even two-way split', () => {
  assert.equal(
    pickManualBattleTheme('Solar', 0),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[0],
  );
  assert.equal(
    pickManualBattleTheme('Solar', 0.499999),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[0],
  );
  assert.equal(
    pickManualBattleTheme('Solar', 0.5),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[1],
  );
  assert.equal(
    pickManualBattleTheme('Interstellar', 0.999),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes[1],
  );
  assert.equal(pickManualBattleTheme('Void', 0), null);
});

test('maps victories per chapter and shares the defeat effect', () => {
  assert.equal(
    getManualBattleResultAudio('Solar', 'victory'),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.victoryTheme,
  );
  assert.equal(
    getManualBattleResultAudio('Interstellar', 'victory'),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.victoryTheme,
  );
  assert.equal(
    getManualBattleResultAudio('Solar', 'defeat'),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme,
  );
  assert.equal(
    getManualBattleResultAudio('Interstellar', 'defeat'),
    SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme,
  );
  assert.equal(getManualBattleResultAudio('Void', 'victory'), null);
});

test('keeps result audio out of the jukebox-eligible collection', () => {
  const jukeboxEligibleUrls = [
    ...SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes,
    ...SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes,
  ];

  assert.equal(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes.length, 2);
  assert.equal(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes.length, 2);
  assert.equal(jukeboxEligibleUrls.includes(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.victoryTheme), false);
  assert.equal(jukeboxEligibleUrls.includes(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.victoryTheme), false);
  assert.equal(jukeboxEligibleUrls.includes(SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme), false);
});

test('music library and preloader consume the central battle media catalog', async () => {
  const [musicData, assetPreloader] = await Promise.all([
    readFile(new URL('./music-data.ts', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(musicData, /solar-interstellar-battle-media\.mjs/);
  assert.match(assetPreloader, /solar-interstellar-battle-media\.mjs/);
});

test('BattleOverlay preserves the legacy result while delegating manual chapter battles', async () => {
  const battleOverlay = await readFile(
    new URL('../components/dashboard/BattleOverlay.tsx', import.meta.url),
    'utf8',
  );

  assert.match(battleOverlay, /isSolarInterstellarManualBattle/);
  assert.match(battleOverlay, /SolarInterstellarBattleExperience/);
  assert.match(battleOverlay, /activeBattle\.isVictory \|\| activeBattle\.isDefeat/);
});

test('new result HUD avoids expensive media and blur effects', async () => {
  const resultHud = await readFile(
    new URL('../components/dashboard/SolarInterstellarBattleExperience.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(resultHud, /backdrop-blur/);
  assert.doesNotMatch(resultHud, /filter:/);
  assert.doesNotMatch(resultHud, /<Image/);
  assert.doesNotMatch(resultHud, /<video/);
  assert.match(resultHud, /Solar/);
  assert.match(resultHud, /Interstellar/);
  assert.match(resultHud, /defeat/);
  assert.match(resultHud, /motion-reduce/);
});
