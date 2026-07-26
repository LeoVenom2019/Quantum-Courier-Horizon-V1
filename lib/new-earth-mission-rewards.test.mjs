import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const BOOSTED_MISSION_IDS = [
  'surface-win-european-ruins',
  'surface-win-elysium-airspace',
  'surface-helicopter-glacial-radar-sweep',
  'surface-helicopter-forgotten-blockade',
  'surface-helicopter-escort-breaker',
  'surface-tank-european-supply-line',
  'surface-tank-siege-column',
  'surface-tank-bunker-silence',
  'submarine-win-abyssal',
  'submarine-treasure-3',
];

test('quadruples QC for tank, helicopter and submarine missions', async () => {
  const source = await readFile(new URL('./new-earth-missions.ts', import.meta.url), 'utf8');

  assert.match(source, /NEW_EARTH_FEATURED_MISSION_QC_MULTIPLIER = 4/);
  for (const id of BOOSTED_MISSION_IDS) {
    const start = source.indexOf(`id: '${id}'`);
    assert.notEqual(start, -1, `missing mission ${id}`);
    const block = source.slice(start, start + 1400);
    assert.match(block, /qc: scaleFeaturedNewEarthMissionQcReward\(/, `${id} must use the 4x reward scaler`);
  }
});

test('quadruples only mythic battle or political card upgrade missions', async () => {
  const [missions, colonySystem] = await Promise.all([
    readFile(new URL('./new-earth-missions.ts', import.meta.url), 'utf8'),
    readFile(new URL('../components/ColonySystem.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(colonySystem, /rarity: card\.rarity/);
  assert.match(colonySystem, /cardClass: isBattleCard\(card\) \? 'battle' : 'political'/);
  assert.match(missions, /card\.rarity === 'mythic'/);
  assert.match(missions, /card\.cardClass === 'battle' \|\| card\.cardClass === 'political'/);
  assert.match(missions, /isFeaturedNewEarthMission\(defaultMission\)/);
  assert.match(missions, /defaultMission\.qcRewardMultiplier !== NEW_EARTH_FEATURED_MISSION_QC_MULTIPLIER/);
});