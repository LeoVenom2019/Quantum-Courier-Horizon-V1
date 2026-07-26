import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const EXPECTED_SFX = {
  direct_battle_cap4_open: '/audio/sfx/direct_battle_cap4_open.ogg',
  level_up_dif_cap4: '/audio/sfx/level_up_dif_cap4.ogg',
  open_skill_tree_cap4: '/audio/sfx/open_skill_tree_cap4.ogg',
  close_skill_tree_cap4: '/audio/sfx/close_skill_tree_cap4.ogg',
};

test('keeps all Chapter 4 interaction SFX files and registrations', async () => {
  const [useSfx, preloader] = await Promise.all([
    readFile(new URL('../hooks/useSFX.ts', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  await Promise.all(Object.entries(EXPECTED_SFX).map(async ([id, src]) => {
    await access(new URL(`../public${src}`, import.meta.url));
    assert.match(useSfx, new RegExp(`\\| '${id}'`));
    assert.match(useSfx, new RegExp(`${id}: '${src}'`));
    assert.match(preloader, new RegExp(`'${src}'`));
  }));
});

test('maps each Chapter 4 interaction to its dedicated SFX', async () => {
  const colonySystem = await readFile(
    new URL('../components/ColonySystem.tsx', import.meta.url),
    'utf8',
  );

  assert.match(colonySystem, /playSfx\?\.\('direct_battle_cap4_open'\)/);
  assert.match(colonySystem, /playSfx\?\.\('level_up_dif_cap4'\)/);
  assert.match(colonySystem, /playSfx\?\.\('open_skill_tree_cap4'\)/);
  assert.match(colonySystem, /playSfx\?\.\('close_skill_tree_cap4'\)/);
  assert.match(colonySystem, /onClose=\{closeHorizonSkillTree\}/);
});