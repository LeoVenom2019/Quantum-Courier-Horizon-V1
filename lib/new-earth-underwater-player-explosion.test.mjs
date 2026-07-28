import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const battleSourceUrl = new URL(
  '../components/NewEarthUnderwaterBattle.tsx',
  import.meta.url,
);
const dashboardSourceUrl = new URL(
  '../components/GameDashboard.tsx',
  import.meta.url,
);

test('animates the player submarine explosion before showing game over', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /phase: 'combat' as 'combat' \| 'exploration' \| 'player_exploding' \| 'defeat'/);
  assert.match(source, /playerExplosionEndsAt: 0/);
  assert.match(
    source,
    /spawnImpact\(state\.player\.x, state\.player\.y, '#f87171', true, 1\.45\)/,
  );
  assert.match(source, /state\.playerExplosionEndsAt = time \+ 1200/);
  assert.match(
    source,
    /state\.phase === 'player_exploding'[\s\S]*?time >= state\.playerExplosionEndsAt[\s\S]*?state\.phase = 'defeat'[\s\S]*?onDefeat\?\.\('hull'\)/,
  );
  assert.match(source, /state\.phase !== 'player_exploding'[\s\S]*?drawPlayerSpriteSubmarine/);
  assert.match(
    source,
    /drawIlluminatedBackground\(\s*ctx,\s*background,\s*visualPlayer,\s*time,\s*currentDepthIndex,\s*playerVisualKey,\s*state\.phase !== 'player_exploding' && state\.phase !== 'defeat',?\s*\)/,
  );
});

test('shows the requested defeat copy after the explosion', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /defeat: language === 'pt' \? 'Submarino explodido' : 'Submarine exploded'/);
  assert.match(source, /gameOver: 'GAME OVER'/);
  assert.match(source, /\{labels\.gameOver\}/);
  assert.match(source, /setPortalFeedback\(labels\.oxygenDepleted\)/);
  assert.match(
    source,
    /const \[defeatReason, setDefeatReason\] = useState<'hull' \| 'oxygen' \| null>\(null\)/,
  );
  assert.match(source, /setDefeatReason\('oxygen'\)[\s\S]*?onDefeat\?\.\('oxygen'\)/);
  assert.match(source, /setDefeatReason\('hull'\)[\s\S]*?onDefeat\?\.\('hull'\)/);
  assert.match(
    source,
    /defeatReason === 'oxygen' \? labels\.oxygenDepleted : labels\.defeat/,
  );
  assert.match(
    source,
    /\{defeatReason === 'hull' && \([\s\S]*?\{labels\.gameOver\}/,
  );
});

test('records that the submarine exploded', async () => {
  const source = await readFile(dashboardSourceUrl, 'utf8');

  assert.match(source, /Submarino explodiu durante a missão\./);
  assert.match(source, /Submarine exploded during the mission\./);
});
