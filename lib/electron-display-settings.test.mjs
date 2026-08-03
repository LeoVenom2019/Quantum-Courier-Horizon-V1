import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readDisplaySources = async () => Promise.all([
  readFile(new URL('../electron/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../electron/preload.js', import.meta.url), 'utf8'),
  readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
]);

test('desktop window exposes only the constrained display bridge', async () => {
  const [main, preload] = await readDisplaySources();

  assert.match(main, /preload: path\.join\(__dirname, 'preload\.js'\)/);
  assert.match(main, /contextIsolation: true/);
  assert.match(main, /nodeIntegration: false/);
  assert.match(main, /ipcMain\.handle\('qch-display:get-state'/);
  assert.match(main, /ipcMain\.handle\('qch-display:apply'/);
  assert.match(main, /Object\.prototype\.hasOwnProperty\.call\(WINDOWED_RESOLUTIONS/);
  assert.match(preload, /contextBridge\.exposeInMainWorld\('qchDesktop'/);
  assert.match(preload, /ipcRenderer\.invoke\('qch-display:apply'/);
});

test('supports native fullscreen, shortcut synchronization and window presets', async () => {
  const [main, , page] = await readDisplaySources();
  const presets = ['1280x720', '1366x768', '1440x900', '1600x900', '1920x1080'];

  presets.forEach(preset => {
    assert.match(main, new RegExp("'" + preset + "'"));
    assert.match(page, new RegExp("'" + preset + "'"));
  });

  assert.match(main, /mainWindow\.setFullScreen\(true\)/);
  assert.match(main, /mainWindow\.setSize\(size\[0\], size\[1\], true\)/);
  assert.match(main, /mainWindow\.setFullScreen\(!mainWindow\.isFullScreen\(\)\)/);
  assert.match(main, /qch-display:changed/);
  assert.match(page, /TELA CHEIA NATIVA/);
  assert.match(page, /Resolução da janela/);
  assert.match(page, /DISPLAY_SETTINGS_STORAGE_KEY/);
  assert.match(page, /displayApi\.onChanged/);
});
