import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getPirateSlayerProgress } from './pirate-slayer-progress.mjs';

test('counts manual chapter 1 and 2 victories plus every supported chapter 4 battle', () => {
  assert.equal(getPirateSlayerProgress({
    chapter1ManualVictories: 10,
    chapter2ManualVictories: 11,
    chapter4LandDefenseVictories: 12,
    chapter4SeaDefenseVictories: 13,
    chapter4DirectBattleVictories: 14,
  }), 60);
});

test('does not expose chapter 3 victories as eligible progress', () => {
  assert.equal(getPirateSlayerProgress({
    chapter1ManualVictories: 1,
    chapter2ManualVictories: 2,
    chapter3Victories: 999,
    chapter4DirectBattleVictories: 3,
  }), 6);
});

test('normalizes invalid saved counters without reducing progress', () => {
  assert.equal(getPirateSlayerProgress({
    chapter1ManualVictories: -4,
    chapter2ManualVictories: Number.NaN,
    chapter4LandDefenseVictories: 2.9,
  }), 2);
});

test('records manual progress only for played chapter 1 and 2 victories', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    dashboard,
    /if \(countsAsManualBattle && \(routeTierRef\.current === 'Solar' \|\| routeTierRef\.current === 'Interstellar'\)\) \{[\s\S]*?updateHistoryStats\('manual_battle_win'/,
  );
  assert.match(
    dashboard,
    /<BattleOverlay[\s\S]*?resolveBattleVictory=\{\(battle\) => resolveBattleVictory\(battle, true\)\}/,
  );
});

test('keeps the existing Pirate Slayer description', async () => {
  const gameData = await readFile(new URL('./game-data.ts', import.meta.url), 'utf8');

  assert.match(
    gameData,
    /id: 'pirate_slayer', name: 'Dizimador de Piratas', description: 'Vença 50 batalhas contra piratas\.'/,
  );
});
