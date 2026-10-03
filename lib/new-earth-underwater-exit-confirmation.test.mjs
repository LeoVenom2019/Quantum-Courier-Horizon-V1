import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('requires confirmation from both underwater exploration exit controls', async () => {
  const source = await readFile(
    new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /const \[isExitConfirmationOpen, setIsExitConfirmationOpen\] = useState\(false\)/);
  assert.equal(
    source.match(/onClick=\{requestExitConfirmation\}/g)?.length,
    2,
  );
  assert.match(source, /Confirmar saída/);
  assert.match(source, /Sair para a superfície/);
  assert.match(
    source,
    /const confirmExitToSurface = \(\) => \{[\s\S]*?onClose\(\);[\s\S]*?\};/,
  );
});

test('offers an optional return to the surface at the final underwater portal', async () => {
  const source = await readFile(
    new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /const \[isFinalPortalConfirmationOpen, setIsFinalPortalConfirmationOpen\] = useState\(false\)/);
  assert.match(source, /Você já explorou a área, deseja voltar para a superfície\?/);
  assert.match(source, /else if \(!finalPortalPromptDismissedRef\.current\)/);
  assert.match(source, /const cancelFinalPortalExit = \(\) => \{[\s\S]*?setIsPaused\(false\);[\s\S]*?\};/);
  assert.match(source, /const confirmFinalPortalExit = \(\) => \{[\s\S]*?onClose\(\);[\s\S]*?\};/);
});
