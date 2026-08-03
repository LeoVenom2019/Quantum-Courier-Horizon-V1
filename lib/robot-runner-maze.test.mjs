import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const getRobotRunnerMaps = async () => {
  const source = await readFile(
    new URL('../public/mini-games/robot-runner/script.js', import.meta.url),
    'utf8',
  );
  const match = source.match(/const LabyrinthMaps = (\[[\s\S]*?\r?\n\]);\r?\n\r?\n\/\/ Classes/);

  assert.ok(match, 'Robot Runner maze maps should be present');
  return JSON.parse(match[1]);
};

const getReachableTiles = (map, start) => {
  const queue = [start];
  const visited = new Set([`${start.c},${start.r}`]);

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = current.c + dc;
      const r = current.r + dr;
      const key = `${c},${r}`;

      if (r < 0 || r >= map.length || c < 0 || c >= map[r].length) continue;
      if (map[r][c] === 1 || visited.has(key)) continue;

      visited.add(key);
      queue.push({ c, r });
    }
  }

  return visited;
};

test('every phase 2 ghost spawn can reach the playable maze', async () => {
  const maps = await getRobotRunnerMaps();
  const phaseTwo = maps[1];
  const reachable = getReachableTiles(phaseTwo, { c: 1, r: 10 });
  const spawnPoints = [];

  phaseTwo.forEach((row, r) => row.forEach((tile, c) => {
    if (tile === 4) spawnPoints.push({ c, r });
  }));

  assert.ok(spawnPoints.length > 0, 'phase 2 should contain ghost spawn points');
  for (const spawn of spawnPoints) {
    assert.ok(
      reachable.has(`${spawn.c},${spawn.r}`),
      `ghost spawn at column ${spawn.c}, row ${spawn.r} is trapped`,
    );
  }
});
