import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

test('keeps the selected Chapter 4 background paired from briefing to battle', async () => {
  const [colonySystem, battle, preloader] = await Promise.all([
    readFile(new URL('../components/ColonySystem.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/NewEarthDefenseBattle.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(colonySystem, /pickNewEarthBattleBackground/);
  assert.match(
    colonySystem,
    /setActiveBattleBackground\(pickNewEarthBattleBackground\(\)\)/,
  );
  assert.equal(
    colonySystem.match(/backgroundImage: `url\(\$\{selectedBattleBackground\.image\}\)`/g)?.length,
    2,
  );
  assert.equal(
    colonySystem.match(/battleBackground=\{selectedBattleBackground\}/g)?.length,
    2,
  );

  assert.match(battle, /battleBackground: NewEarthBattleBackground/);
  assert.match(battle, /backgroundVideoRef/);
  assert.match(battle, /backgroundVideo\.readyState >= 2/);
  assert.match(battle, /ctx\.drawImage\(backgroundVideo, 0, 0, WIDTH, HEIGHT\)/);
  assert.match(
    battle,
    /<video[\s\S]*?autoPlay[\s\S]*?loop[\s\S]*?muted[\s\S]*?playsInline/,
  );
  assert.match(preloader, /route4BattleBackgroundVideos/);
  assert.match(preloader, /asEntries\(route4BattleBackgroundVideos, 'video'\)/);

  const { NEW_EARTH_BATTLE_BACKGROUNDS } = await import('./route4-battle-backgrounds.mjs');
  assert.equal(NEW_EARTH_BATTLE_BACKGROUNDS.length, 11);
  assert.equal(new Set(NEW_EARTH_BATTLE_BACKGROUNDS.map(item => item.image)).size, 11);
  assert.equal(new Set(NEW_EARTH_BATTLE_BACKGROUNDS.map(item => item.video)).size, 11);

  for (const item of NEW_EARTH_BATTLE_BACKGROUNDS) {
    assert.equal(path.posix.dirname(item.image), path.posix.dirname(item.video));
    assert.equal(path.posix.basename(item.image, '.webp'), path.posix.basename(item.video, '.mp4'));
    await access(new URL(`../public${item.image}`, import.meta.url));
    await access(new URL(`../public${item.video}`, import.meta.url));
  }
});
