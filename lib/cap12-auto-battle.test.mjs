import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getCap12DisplayedWinChance,
  getCap12TotalWinChance,
  rollCap12AutomaticBattle,
} from './cap12-auto-battle.mjs';

test('uses the same bonuses for displayed and resolved automatic battle chance', () => {
  assert.equal(getCap12TotalWinChance(93, 10, 0), 103);
  assert.equal(getCap12DisplayedWinChance(93, 10, 0), 100);
});

test('guarantees victory at one hundred percent or above', () => {
  assert.equal(rollCap12AutomaticBattle(100, () => 0.999999), 'victory');
  assert.equal(rollCap12AutomaticBattle(185, () => 0.999999), 'victory');
});

test('keeps probabilistic outcomes below one hundred percent', () => {
  assert.equal(rollCap12AutomaticBattle(93, () => 0.92), 'victory');
  assert.equal(rollCap12AutomaticBattle(93, () => 0.94), 'defeat');
});

test('skip toggle resolves immediately for free and chapter battles share the wave experience', async () => {
  const [dashboard, overlay] = await Promise.all([
    readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/dashboard/BattleOverlay.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(dashboard, /if \(autoSkipRandomBattlesRef\.current\)/);
  assert.match(dashboard, /if \(!autoSkipRandomBattles \|\| !underAttackBattle\) return/);
  assert.match(dashboard, /const victory = autoSkipBattle\(battle\)/);
  assert.match(dashboard, /battle\.predeterminedResult === 'victory'/);
  assert.doesNotMatch(dashboard, /autoSkipBattle\(battle,\s*(?:10|40|skipCost)/);
  assert.match(overlay, /if \(isSolarInterstellarBattle\(routeTier\)\)/);
  assert.doesNotMatch(overlay, /const enemies: VoidBattleEnemy\[\] = \[\{/);
});
