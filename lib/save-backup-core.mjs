export const COMPLETE_SAVE_FORMAT = 'qch-complete-save';
export const COMPLETE_SAVE_FORMAT_VERSION = 2;
export const COMPLETE_SAVE_EXTENSION = '.qch';
export const COMPLETE_SAVE_ACCEPT = '.qch,.json,.dat,application/json';

const LEGACY_SAVE_SECRET_KEY = 73;

export const TRANSIENT_SAVE_STORAGE_KEYS = new Set([
  'time_travel_save_backup_last_valid',
  'time_travel_save_backup_corrupted',
  'qch_reset_until',
  'qch_hard_reset_at',
]);

const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const decodeLegacyDatSave = encryptedData => {
  const binary = atob(encryptedData.trim());
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const decoded = new TextDecoder().decode(bytes);
  const decrypted = decoded
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ (LEGACY_SAVE_SECRET_KEY + (index % 17))))
    .join('');

  return JSON.parse(decrypted);
};

export const parseSaveFileContents = fileContents => {
  try {
    return JSON.parse(fileContents);
  } catch {
    return decodeLegacyDatSave(fileContents);
  }
};

export const captureLocalStorageEntries = storage => {
  const entries = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || TRANSIENT_SAVE_STORAGE_KEYS.has(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return entries;
};

const parseStoredValue = value => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const normalizeSaveEnvelope = (rawData, supplementalKeys) => {
  if (!isRecord(rawData)) throw new Error('Invalid save file');

  const isCompleteBackup = rawData.export_format === COMPLETE_SAVE_FORMAT;
  const rawStorage = isCompleteBackup && isRecord(rawData.local_storage)
    ? Object.fromEntries(
        Object.entries(rawData.local_storage)
          .filter(([key, value]) => !TRANSIENT_SAVE_STORAGE_KEYS.has(key) && typeof value === 'string')
      )
    : {};

  const storedMainSave = parseStoredValue(rawStorage.time_travel_save);
  const mainSaveCandidate = rawData.time_travel_save ?? storedMainSave ?? rawData;
  if (!isRecord(mainSaveCandidate)) throw new Error('Save file does not contain game progress');

  const embeddedStorage = isRecord(mainSaveCandidate.colony_system?.storage)
    ? mainSaveCandidate.colony_system.storage
    : {};
  const supplementalEntries = Object.fromEntries(
    supplementalKeys.map(key => {
      const rawStoredValue = Object.prototype.hasOwnProperty.call(rawStorage, key)
        ? parseStoredValue(rawStorage[key])
        : undefined;
      const value = rawStoredValue !== undefined
        ? rawStoredValue
        : Object.prototype.hasOwnProperty.call(rawData, key)
          ? rawData[key]
          : embeddedStorage[key];
      return [key, value];
    })
  );

  return {
    mainSaveCandidate,
    supplementalEntries,
    rawStorage,
    secretAlienNameUnlocked: Boolean(
      parseStoredValue(rawStorage.qch_secret_alien_name_unlocked)
      ?? rawData.qch_secret_alien_name_unlocked
      ?? rawData.timeTravelSecretAlienNameUnlocked
      ?? mainSaveCandidate.global?.secretAlienNameUnlocked
    ),
  };
};

export const createBackupFilename = (date = new Date()) => {
  const stamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
  return `qch_save_${stamp}${COMPLETE_SAVE_EXTENSION}`;
};
