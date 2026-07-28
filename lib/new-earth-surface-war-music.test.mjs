import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  NEW_EARTH_SURFACE_WAR_MUSIC,
  NEW_EARTH_SURFACE_WAR_TRACKS,
  pickNewEarthSurfaceWarTheme,
} from './new-earth-surface-war-music.mjs';

test('registers five helicopter and five tank themes as OGG assets', () => {
  assert.equal(NEW_EARTH_SURFACE_WAR_MUSIC.helicopter.length, 5);
  assert.equal(NEW_EARTH_SURFACE_WAR_MUSIC.tank.length, 5);
  assert.equal(NEW_EARTH_SURFACE_WAR_TRACKS.length, 10);
  assert.equal(new Set(NEW_EARTH_SURFACE_WAR_TRACKS.map(track => track.id)).size, 10);
  assert.equal(new Set(NEW_EARTH_SURFACE_WAR_TRACKS.map(track => track.title)).size, 10);
  NEW_EARTH_SURFACE_WAR_TRACKS.forEach(track => {
    assert.match(track.url, /^\/assets\/rota4\/themes_war\/[a-z0-9_]+\.ogg$/);
  });
});

test('selects evenly across each vehicle theme collection', () => {
  assert.equal(pickNewEarthSurfaceWarTheme('helicopter', 0), NEW_EARTH_SURFACE_WAR_MUSIC.helicopter[0]);
  assert.equal(pickNewEarthSurfaceWarTheme('helicopter', 0.999999), NEW_EARTH_SURFACE_WAR_MUSIC.helicopter[4]);
  assert.equal(pickNewEarthSurfaceWarTheme('tank', 0.4), NEW_EARTH_SURFACE_WAR_MUSIC.tank[2]);
});

test('keeps every surface-war track and briefing background present and preloaded', async () => {
  const briefingBackgrounds = [
    '/assets/rota4/new_land_assets/war_helicopters_cap4.webp',
    '/assets/rota4/new_land_assets/war_tanks_cap4.webp',
  ];
  const protectedUrls = [
    ...NEW_EARTH_SURFACE_WAR_TRACKS.map(track => track.url),
    ...briefingBackgrounds,
  ];

  await Promise.all(protectedUrls.map(url => access(new URL(`../public${url}`, import.meta.url))));

  const preloader = await readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8');
  assert.match(preloader, /NEW_EARTH_SURFACE_WAR_TRACKS\.map\(track => track\.url\)/);
  briefingBackgrounds.forEach(url => assert.match(preloader, new RegExp(url.replaceAll('/', '\\/'))));
});
