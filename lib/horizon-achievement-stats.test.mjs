import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('keeps Horizon skill-tree bonuses in the canonical achievement stats', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(dashboard, /normalizeHorizonSkills/);
  assert.match(dashboard, /newEarthHorizonSkills/);
  assert.match(
    dashboard,
    /calculateBattleShipStats\([\s\S]*?newEarthHorizonSkills[\s\S]*?\)/,
  );
  assert.match(
    dashboard,
    /updateAchievementProgress\('ne_horizon_crit_90', newEarthAchievementHorizonStats\.critChance, true\)/,
  );
});

test('reactively synchronizes Horizon skill-tree changes with achievements', async () => {
  const [dashboard, colonySystem] = await Promise.all([
    readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/ColonySystem.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(dashboard, /GameStorage\.load\('horizon_skill_tree'\)/);
  assert.match(dashboard, /addEventListener\('qch:horizon-skills-updated'/);
  assert.match(dashboard, /removeEventListener\('qch:horizon-skills-updated'/);
  assert.match(
    colonySystem,
    /dispatchEvent\(new CustomEvent\('qch:horizon-skills-updated', \{ detail: horizonSkills \}\)\)/,
  );
});
test('calculates Horizon level achievements against the unlocked level 100 cap', async () => {
  const [dashboard, gameData] = await Promise.all([
    readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./game-data.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(
    gameData,
    /id: 'ne_horizon_level_100'[\s\S]*?target: 100/,
  );
  assert.match(
    dashboard,
    /const horizonLevel = getHorizonLevelFromXp\(newEarthHorizonXp, MAX_HORIZON_LEVEL\)\.level/,
  );
  assert.match(
    dashboard,
    /const savedHorizonProgress = getHorizonLevelFromXp\(newEarthHorizonXp, MAX_HORIZON_LEVEL\)/,
  );
  assert.match(
    dashboard,
    /updateAchievementProgress\('ne_horizon_level_100', savedHorizonProgress\.level, true\)/,
  );
});