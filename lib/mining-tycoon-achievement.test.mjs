import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Mining Tycoon counts manual and automatic mining and extraction sales', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );
  const calculation = dashboard.match(
    /const totalPacksSold = Object\.values\(historyStats\)\.reduce\(\(acc, curr\) =>([\s\S]*?), 0\);/,
  )?.[1] || '';

  assert.match(calculation, /curr\.manualMiningPacksSold/);
  assert.match(calculation, /curr\.autoMiningPacksSold/);
  assert.match(calculation, /curr\.manualExtractionPacksSold/);
  assert.match(calculation, /curr\.autoExtractionPacksSold/);
  assert.match(dashboard, /updateAchievementProgress\('mining_tycoon', totalPacksSold, true\)/);
});

test('manual and automatic extraction sales feed their own history counters', async () => {
  const [dashboard, provider] = await Promise.all([
    readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/dashboard/DashboardProvider.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(dashboard, /field: 'autoExtractionPacksSold', amount: totalPacksSold/);
  assert.match(provider, /field: 'manualExtractionPacksSold', amount: packs/);
});
