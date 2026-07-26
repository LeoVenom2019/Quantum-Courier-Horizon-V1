import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const VIDEO_PATH = '/assets/games/fliper_intro.webm';
const SFX_PATH = '/assets/games/flipers_sfx/intro_fliper.ogg';

test('keeps the arcade intro media registered and preloaded', async () => {
  const [useSfx, preloader] = await Promise.all([
    readFile(new URL('../hooks/useSFX.ts', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  await Promise.all([
    access(new URL(`../public${VIDEO_PATH}`, import.meta.url)),
    access(new URL(`../public${SFX_PATH}`, import.meta.url)),
  ]);

  assert.match(useSfx, /\| 'intro_fliper'/);
  assert.match(useSfx, /intro_fliper: '\/assets\/games\/flipers_sfx\/intro_fliper\.ogg'/);
  assert.match(preloader, /'\/assets\/games\/fliper_intro\.webm'/);
  assert.match(preloader, /'intro_fliper'/);
});

test('gates every arcade launch through the optional intro', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(dashboard, /pendingArcadeIntroGameId/);
  assert.match(dashboard, /ARCADE_INTRO_SKIP_STORAGE_KEY/);
  assert.ok(dashboard.includes("window.localStorage.getItem(ARCADE_INTRO_SKIP_STORAGE_KEY) === 'true'"));
  assert.ok(dashboard.includes("window.localStorage.setItem(ARCADE_INTRO_SKIP_STORAGE_KEY, 'true')"));
  assert.match(dashboard, /playSfx\('intro_fliper'/);
  assert.equal(
    dashboard.match(/await requestArcadeGameLaunch\(gameId\)/g)?.length,
    1,
  );
  assert.equal(
    dashboard.match(/await requestArcadeGameLaunch\(id\)/g)?.length,
    1,
  );
  assert.match(dashboard, /<ArcadeIntroOverlay/);
  assert.match(dashboard, /stopSfx\('intro_fliper'\)/);
});

test('renders video controls and persists the do-not-show preference', async () => {
  const overlay = await readFile(
    new URL('../components/ArcadeIntroOverlay.tsx', import.meta.url),
    'utf8',
  );

  assert.match(overlay, /export const ARCADE_INTRO_SKIP_STORAGE_KEY = 'qch_skip_arcade_intro'/);
  assert.match(overlay, /src="\/assets\/games\/fliper_intro\.webm"/);
  assert.match(overlay, /autoPlay/);
  assert.match(overlay, /muted/);
  assert.match(overlay, /playsInline/);
  assert.match(overlay, /onEnded=\{handleContinue\}/);
  assert.match(overlay, /type="checkbox"/);
  assert.match(overlay, /Não mostrar novamente/);
});
