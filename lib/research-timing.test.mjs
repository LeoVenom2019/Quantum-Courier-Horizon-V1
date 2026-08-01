import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const EXPECTED_SOLAR_TIMES = new Map([
  ['solar-1', 0],
  ['solar-2', 60_000],
  ['solar-3', 60_000],
  ['solar-4', 60_000],
  ['solar-5', 60_000],
  ['solar-6', 120_000],
  ['solar-7', 120_000],
  ['solar-8', 120_000],
  ['solar-9', 120_000],
]);

const EXPECTED_INTERSTELLAR_TIMES = new Map([
  ['inter-1', 0],
  ['inter-2', 60_000],
  ['inter-3', 60_000],
  ['inter-4', 60_000],
  ['inter-5', 120_000],
  ['inter-6', 120_000],
  ['inter-7', 120_000],
  ['inter-8', 120_000],
  ['inter-9', 120_000],
]);

const EXPECTED_EXTRACTION_IDS = [
  'ext-1',
  'ext-2',
  'ext-3',
  'ext-4',
  'ext-5',
  'ext-6',
  'ext-7',
  'ext-8',
  'ext-9',
];

const readArrayBody = (source, exportName) => {
  const declaration = source.indexOf(`export const ${exportName}`);
  assert.notEqual(declaration, -1, `missing ${exportName} declaration`);

  const start = source.indexOf('[', declaration);
  const end = source.indexOf('\n];', start);
  assert.notEqual(start, -1, `missing ${exportName} opening bracket`);
  assert.notEqual(end, -1, `missing ${exportName} closing bracket`);
  return source.slice(start + 1, end);
};

const readResearchTimes = (body) => {
  const entries = new Map();
  for (const match of body.matchAll(/\{([\s\S]*?)\n\s*\},?/g)) {
    const block = match[1];
    const id = block.match(/\bid:\s*'([^']+)'/)?.[1];
    const researchTime = block.match(/\bresearchTime:\s*(\d+)/)?.[1];
    if (id && researchTime) entries.set(id, Number(researchTime));
  }
  return entries;
};

test('keeps the approved Solar and Interstellar technology wait times', async () => {
  const source = await readFile(new URL('./game-data.ts', import.meta.url), 'utf8');
  const technologies = readResearchTimes(readArrayBody(source, 'TECHNOLOGIES'));

  for (const [id, expected] of [...EXPECTED_SOLAR_TIMES, ...EXPECTED_INTERSTELLAR_TIMES]) {
    assert.equal(technologies.get(id), expected, `${id} researchTime changed`);
  }
});

test('keeps every Interstellar extraction research at one minute', async () => {
  const source = await readFile(new URL('./game-data.ts', import.meta.url), 'utf8');
  const extractionPoints = readResearchTimes(readArrayBody(source, 'EXTRACTION_POINTS'));

  for (const id of EXPECTED_EXTRACTION_IDS) {
    assert.equal(extractionPoints.get(id), 60_000, `${id} must remain at one minute`);
  }
});

test('does not expose or implement research skipping', async () => {
  const sources = await Promise.all([
    readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/dashboard/DashboardProvider.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/dashboard/TechnologyTab.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./game-state/types.ts', import.meta.url), 'utf8'),
    readFile(new URL('./game-state/slices/progressionReducer.ts', import.meta.url), 'utf8'),
    readFile(new URL('./game-state/slices/miningReducer.ts', import.meta.url), 'utf8'),
  ]);
  const runtime = sources.join('\n');

  assert.doesNotMatch(runtime, /boostResearch|BOOST_RESEARCH|BOOST_EXTRACTION_RESEARCH|FINISH_EXTRACTION_RESEARCH/);
  assert.doesNotMatch(runtime, /researchTime\s*\*\s*\([^\n]*Interstellar[^\n]*0\.5/);
  assert.match(sources[0], /const researchTime = tech\.researchTime;/);
  assert.match(sources[2], /\/ tech\.researchTime\) \* 100/);
});
