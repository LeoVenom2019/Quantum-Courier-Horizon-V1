import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Start Journey is shared by the intro, preloader and Solar jukebox', async () => {
  const [intro, musicData, preloader, page] = await Promise.all([
    readFile(new URL('../components/IntroNarrative.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./music-data.ts', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(musicData, /START_JOURNEY_TRACK/);
  assert.match(musicData, /\/assets\/rota1\/start_journey\.ogg/);
  assert.match(musicData, /playlist:\s*\[\s*START_JOURNEY_TRACK/);
  assert.match(preloader, /START_JOURNEY_TRACK\.url/);
  assert.match(intro, /new Audio\(START_JOURNEY_TRACK\.url\)/);
  assert.match(intro, /audio\.pause\(\);\s*audio\.currentTime = 0/);
  assert.match(intro, /showPlayerId \|\| !musicOn/);
  assert.match(page, /musicOn=\{masterMusicOn\}/);
  assert.match(page, /musicVolume=\{masterMusicVolume\}/);
});
