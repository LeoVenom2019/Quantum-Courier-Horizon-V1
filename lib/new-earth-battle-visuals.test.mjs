import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('does not render diagonal stripes over Chapter 4 defense battles', async () => {
  const battleSource = await readFile(
    new URL('../components/NewEarthDefenseBattle.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(
    battleSource,
    /for \(let x = 0; x < WIDTH; x \+= 48\) \{[\s\S]*?ctx\.lineTo\(x - 120, HEIGHT\);[\s\S]*?\}/,
  );
});
