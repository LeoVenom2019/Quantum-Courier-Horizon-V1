import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [titleScreen, mainMenu, underwaterBattle, electronMain, electronPreload] = await Promise.all([
  readFile(new URL('../components/TitleScreen.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../components/MainMenuExitPortal.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../electron/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../electron/preload.js', import.meta.url), 'utf8'),
]);

const page = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('main menu reuses the underwater portal renderer for the exit button', () => {
  assert.match(underwaterBattle, /export const drawDeepPortal/);
  assert.match(mainMenu, /import \{ drawDeepPortal \} from '@\/components\/NewEarthUnderwaterBattle'/);
  assert.match(mainMenu, /drawDeepPortal\(context, canvas\.width, canvas\.height/);
  assert.match(mainMenu, /aria-label=\{copy\.exit\}/);
  assert.doesNotMatch(titleScreen, /drawDeepPortal|Você deseja voltar para a realidade/);
  assert.match(page, /!showSplash && !showTitleScreen[\s\S]*<MainMenuExitPortal language=\{language\}/);
});

test('exit confirmation offers quitting or staying on the title screen', () => {
  assert.match(mainMenu, /Você deseja voltar para a realidade\?/);
  assert.match(mainMenu, /Sair do jogo/);
  assert.match(mainMenu, /Continuar no menu inicial/);
  assert.match(mainMenu, /window\.qchDesktop\.app\.quit\(\)/);
});

test('desktop bridge exposes and handles the quit channel', () => {
  assert.match(electronPreload, /ipcRenderer\.send\('qch-app:quit'\)/);
  assert.match(electronMain, /ipcMain\.on\('qch-app:quit'/);
  assert.match(electronMain, /app\.quit\(\)/);
});
