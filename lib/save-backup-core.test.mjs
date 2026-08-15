import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMPLETE_SAVE_FORMAT,
  captureLocalStorageEntries,
  createBackupFilename,
  normalizeSaveEnvelope,
  parseSaveFileContents,
} from './save-backup-core.mjs';

test('complete backup round-trip preserves every raw local storage entry', () => {
  const values = new Map([
    ['time_travel_save', JSON.stringify({ version: '1.4.0', global: { qc: 987654 }, colony_system: { storage: {} } })],
    ['new_earth_museum_treasures', JSON.stringify({ recovered: Array.from({ length: 100 }, (_, index) => index) })],
    ['new_earth_war_intel', JSON.stringify({ helicopter: 20, tank: 20 })],
    ['qch_meta_achievements', JSON.stringify({ unlocked: ['museum_complete'] })],
    ['robot_runner_high_score', '424242'],
    ['qch_reset_until', '9999999999999'],
  ]);
  const storage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; },
  };
  const localStorageEntries = captureLocalStorageEntries(storage);
  const text = JSON.stringify({
    export_format: COMPLETE_SAVE_FORMAT,
    time_travel_save: JSON.parse(values.get('time_travel_save')),
    local_storage: localStorageEntries,
  });
  const normalized = normalizeSaveEnvelope(parseSaveFileContents(text), [
    'new_earth_museum_treasures',
    'new_earth_war_intel',
  ]);

  assert.equal(normalized.mainSaveCandidate.global.qc, 987654);
  assert.equal(normalized.supplementalEntries.new_earth_museum_treasures.recovered.length, 100);
  assert.deepEqual(normalized.supplementalEntries.new_earth_war_intel, { helicopter: 20, tank: 20 });
  assert.equal(normalized.rawStorage.robot_runner_high_score, '424242');
  assert.equal(normalized.rawStorage.qch_meta_achievements, values.get('qch_meta_achievements'));
  assert.equal('qch_reset_until' in normalized.rawStorage, false);
});

test('legacy JSON packages remain importable', () => {
  const raw = {
    time_travel_save: { version: '1.3.0', global: { qc: 123 }, colony_system: { storage: { colonies_data: [1] } } },
    colonies_data: [1, 2],
    qch_secret_alien_name_unlocked: true,
  };
  const normalized = normalizeSaveEnvelope(raw, ['colonies_data']);

  assert.equal(normalized.mainSaveCandidate.global.qc, 123);
  assert.deepEqual(normalized.supplementalEntries.colonies_data, [1, 2]);
  assert.equal(normalized.secretAlienNameUnlocked, true);
});

test('legacy encrypted dat saves remain importable', () => {
  const raw = { version: '1.2.0', global: { qc: 321 }, colony_system: { storage: {} } };
  const json = JSON.stringify(raw);
  const xored = json
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ (73 + (index % 17))))
    .join('');
  const encrypted = Buffer.from(xored, 'utf8').toString('base64');

  assert.deepEqual(parseSaveFileContents(encrypted), raw);
});

test('backup filename uses the single qch extension', () => {
  assert.equal(createBackupFilename(new Date('2026-08-15T12:34:56.789Z')), 'qch_save_2026-08-15_12-34-56-789.qch');
});
