import { GameStorage } from './game-storage';
import { COLONY_SAVE_STORAGE_KEYS, sanitizeSave, validateSave, type ModularSaveData } from './save-manager';
import {
  COMPLETE_SAVE_ACCEPT,
  COMPLETE_SAVE_FORMAT,
  COMPLETE_SAVE_FORMAT_VERSION,
  captureLocalStorageEntries,
  createBackupFilename,
  normalizeSaveEnvelope,
  parseSaveFileContents,
  TRANSIENT_SAVE_STORAGE_KEYS,
} from './save-backup-core.mjs';

const MAIN_SAVE_STORAGE_KEY = 'time_travel_save';
const SECRET_ALIEN_NAME_STORAGE_KEY = 'qch_secret_alien_name_unlocked';

type CompleteSavePackage = {
  export_format: string;
  format_version: number;
  export_date: string;
  save_version: string;
  time_travel_save: ModularSaveData;
  local_storage: Record<string, string>;
};

const readSupplementalStorage = async (mainSave: ModularSaveData) => {
  const entries = await Promise.all(
    COLONY_SAVE_STORAGE_KEYS.map(async key => [
      key,
      (await GameStorage.load(key)) ?? mainSave.colony_system.storage[key],
    ] as const)
  );
  return Object.fromEntries(entries);
};

export const buildCompleteSavePackage = async (mainSaveOverride?: ModularSaveData): Promise<CompleteSavePackage> => {
  const storedMainSave = mainSaveOverride ?? await GameStorage.load(MAIN_SAVE_STORAGE_KEY);
  if (!storedMainSave) throw new Error('There is no saved game to export');

  const baseMainSave = sanitizeSave(storedMainSave);
  const supplementalStorage = await readSupplementalStorage(baseMainSave);
  const mainSave = sanitizeSave({
    ...baseMainSave,
    colony_system: {
      ...baseMainSave.colony_system,
      storage: supplementalStorage,
    },
  });
  const localStorageEntries = captureLocalStorageEntries(window.localStorage) as Record<string, string>;

  localStorageEntries[MAIN_SAVE_STORAGE_KEY] = JSON.stringify(mainSave);
  for (const [key, value] of Object.entries(supplementalStorage)) {
    if (value !== undefined) localStorageEntries[key] = JSON.stringify(value);
  }
  localStorageEntries[SECRET_ALIEN_NAME_STORAGE_KEY] = String(mainSave.global.secretAlienNameUnlocked);

  return {
    export_format: COMPLETE_SAVE_FORMAT,
    format_version: COMPLETE_SAVE_FORMAT_VERSION,
    export_date: new Date().toISOString(),
    save_version: mainSave.version,
    time_travel_save: mainSave,
    local_storage: localStorageEntries,
  };
};

export const downloadCompleteSave = async (mainSaveOverride?: ModularSaveData) => {
  const backup = await buildCompleteSavePackage(mainSaveOverride);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = createBackupFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const restoreCompleteSave = async (fileContents: string): Promise<ModularSaveData> => {
  const rawData = parseSaveFileContents(fileContents);
  const { mainSaveCandidate, supplementalEntries, rawStorage, secretAlienNameUnlocked } = normalizeSaveEnvelope(
    rawData,
    COLONY_SAVE_STORAGE_KEYS,
  );
  const mainSave = sanitizeSave({
    ...mainSaveCandidate,
    global: {
      ...mainSaveCandidate.global,
      secretAlienNameUnlocked,
    },
    colony_system: {
      ...(mainSaveCandidate.colony_system || {}),
      storage: {
        ...(mainSaveCandidate.colony_system?.storage || {}),
        ...supplementalEntries,
      },
    },
  });

  if (!validateSave(mainSave)) throw new Error('Invalid or damaged game save');

  window.localStorage.clear();
  window.sessionStorage.clear();
  for (const [key, value] of Object.entries(rawStorage)) {
    if (key !== MAIN_SAVE_STORAGE_KEY && !TRANSIENT_SAVE_STORAGE_KEYS.has(key)) {
      window.localStorage.setItem(key, value);
    }
  }

  await GameStorage.save(mainSave, MAIN_SAVE_STORAGE_KEY);
  for (const key of COLONY_SAVE_STORAGE_KEYS) {
    const value = supplementalEntries[key];
    if (value !== undefined) await GameStorage.save(value, key);
  }

  window.localStorage.setItem(SECRET_ALIEN_NAME_STORAGE_KEY, String(secretAlienNameUnlocked));
  GameStorage.clearHardReset();

  const settingsRaw = rawStorage.qch_settings;
  if (settingsRaw) {
    try {
      await GameStorage.saveSettings(JSON.parse(settingsRaw));
    } catch {
      // The local raw value was already restored; AppData sync is best effort.
    }
  }

  return sanitizeSave(await GameStorage.load(MAIN_SAVE_STORAGE_KEY));
};

export { COMPLETE_SAVE_ACCEPT };
