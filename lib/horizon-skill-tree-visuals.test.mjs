import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('does not render the decorative vertical line over the elemental skill cards', async () => {
  const modal = await readFile(
    new URL('../components/HorizonSkillTreeModal.tsx', import.meta.url),
    'utf8',
  );

  assert.match(modal, /Branch 02/);
  assert.match(modal, /Arsenal Elemental/);
  assert.doesNotMatch(
    modal,
    /absolute bottom-5 left-8 top-16 w-px bg-gradient-to-b from-sky-300\/40 via-violet-300\/25 to-transparent/,
  );
});
