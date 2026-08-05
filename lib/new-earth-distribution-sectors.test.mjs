import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('uses the colony effective sector values throughout the Distribution Center', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );
  const colonySystem = await readFile(
    new URL('../components/ColonySystem.tsx', import.meta.url),
    'utf8',
  );

  assert.match(dashboard, /NEW_EARTH_DISTRIBUTION_SECTOR_MAX = 105;/);
  assert.match(
    dashboard,
    /calculateNewEarthSectors\(selectedDistributionColony, newEarthCardLevels\)/,
  );
  assert.match(
    dashboard,
    /calculateNewEarthSectors\(colony, newEarthCardLevels\)/,
  );
  assert.match(
    dashboard,
    /const currentEffectiveSectorValue = Number\(calculateNewEarthSectors\(colony, newEarthCardLevels\)\[sector\]/,
  );
  assert.match(
    dashboard,
    /const fullSectorScore = colonies\.reduce\(\(total, colony\) => \{\s*const effectiveSectors = calculateNewEarthSectors\(colony, newEarthCardLevels\);[\s\S]*?Number\(effectiveSectors\[sector\][\s\S]*?>= 100/,
  );
  assert.doesNotMatch(
    dashboard,
    /fullSectorScore[\s\S]{0,300}colony\.sectors\?\.\[sector\]/,
  );
  assert.match(
    dashboard,
    /\[sector\]: currentRawSectorValue \+ appliedSectorGain/,
  );
  assert.doesNotMatch(
    dashboard,
    /next\[sector\] = Math\.min\(100, Math\.max\(0, next\[sector\] \+ passive\.allSectorBonus!\)\)/,
  );
  assert.doesNotMatch(
    dashboard,
    /next\[effect\.sector\] = Math\.min\(100, Math\.max\(0, next\[effect\.sector\] \+ effect\.value\)\)/,
  );
  assert.doesNotMatch(
    colonySystem,
    /\[reward\.colonyBonus!\.sector\]: Math\.min\(\s*100,/,
  );
  assert.doesNotMatch(
    colonySystem,
    /\[sentimentSector\]: Math\.min\(\s*100,/,
  );
  assert.doesNotMatch(
    colonySystem,
    /next\[(?:sector|effect\.sector)\] = Math\.min\(100,/,
  );
});
