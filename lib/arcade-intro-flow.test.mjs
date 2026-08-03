import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const SFX_PATH = '/assets/games/flipers_sfx/intro_fliper.ogg';

const readArcadeSources = async () => Promise.all([
  readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../components/ArcadeIntroOverlay.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../public/mini-games/shared/arcade-results.js', import.meta.url), 'utf8'),
]);

test('keeps the arcade launch SFX registered and preloaded', async () => {
  const [useSfx, preloader] = await Promise.all([
    readFile(new URL('../hooks/useSFX.ts', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  await access(new URL(`../public${SFX_PATH}`, import.meta.url));

  assert.match(useSfx, /\| 'intro_fliper'/);
  assert.match(useSfx, /intro_fliper: '\/assets\/games\/flipers_sfx\/intro_fliper\.ogg'/);
  assert.match(preloader, /'intro_fliper'/);
});

test('gates every arcade launch through its mandatory game briefing', async () => {
  const [dashboard] = await readArcadeSources();

  assert.match(dashboard, /pendingArcadeIntroGameId/);
  assert.match(dashboard, /setPendingArcadeIntroGameId\(id\)/);
  assert.doesNotMatch(dashboard, /qch_skip_arcade_intro/);
  assert.match(dashboard, /playSfx\('intro_fliper'/);
  assert.equal(dashboard.match(/await requestArcadeGameLaunch\(gameId\)/g)?.length, 1);
  assert.equal(dashboard.match(/await requestArcadeGameLaunch\(id\)/g)?.length, 1);
  assert.match(dashboard, /<ArcadeIntroOverlay/);
  assert.match(dashboard, /game=\{MINI_GAMES_CONFIG\.find/);
  assert.match(dashboard, /initialMusicEnabled=\{pendingArcadeMusicEnabled\}/);
  assert.match(dashboard, /onClose=\{closeArcadeIntro\}/);
  assert.match(dashboard, /const closeArcadeIntro = useCallback\(\(\) => \{\s*setPendingArcadeIntroGameId\(null\);\s*stopSfx\('intro_fliper'\);/);
  assert.match(dashboard, /stopSfx\('intro_fliper'\)/);
});

test('renders a specific tutorial and music confirmation for every arcade game', async () => {
  const [, overlay] = await readArcadeSources();
  const arcadeIds = [
    'salto-espacial',
    'ruptura-estelar',
    'danger-zoom-zones',
    'grid-collapse',
    'robot-runner',
    'neo-catcher',
  ];

  arcadeIds.forEach(id => assert.match(overlay, new RegExp(`'${id}'`)));
  assert.match(overlay, /src=\{game\.image\}/);
  assert.match(overlay, /tutorial\.controls\[language\]\.map/);
  assert.match(overlay, /initialMusicEnabled/);
  assert.match(overlay, /aria-pressed=\{musicEnabled\}/);
  assert.match(overlay, /aria-pressed=\{!musicEnabled\}/);
  assert.match(overlay, /Música ON/);
  assert.match(overlay, /Música OFF/);
  assert.match(overlay, /Confirmar e jogar/);
  assert.match(overlay, /onContinue\(musicEnabled\)/);
  assert.match(overlay, /onClick=\{onClose\}/);
  assert.match(overlay, /Fechar prévia do fliperama/);
});

test('arcade music never overwrites the chapter music preference', async () => {
  const [dashboard, , results] = await readArcadeSources();

  assert.match(dashboard, /qch_arcade_music_enabled_\$\{id\}/);
  assert.match(dashboard, /setActiveArcadeMusicEnabled\(musicEnabled\)/);
  assert.match(
    dashboard,
    /playPlaylist\(arcadeTheme\.playlist, \{ restart: true, loop: true, rememberPreference: false \}\)/,
  );
  assert.match(
    dashboard,
    /if \(!jukebox\.desiredIsPlaying\) \{\s*jukebox\.stop\(\{ rememberPreference: false \}\);\s*return;/,
  );
  assert.match(
    dashboard,
    /event\.data\.type === 'ARCADE_RESULT_SHOWN'[\s\S]*?setActiveArcadeMusicEnabled\(false\)[\s\S]*?jukebox\.stop\(\{ rememberPreference: false \}\)/,
  );
  assert.match(results, /isGameMusicEnabled\(gameId\)/);
  assert.match(dashboard, /qch_arcade_music_effective_\$\{activeMiniGameId\}/);
  assert.match(dashboard, /String\(activeArcadeMusicEnabled && musicOn\)/);
  assert.match(results, /qch_arcade_music_effective_\$\{gameId\}/);
  assert.match(results, /\? `<audio class="qch-result-audio"/);
});
