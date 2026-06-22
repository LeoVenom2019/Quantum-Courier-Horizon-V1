/**
 * GameStorage Module
 * 
 * This module handles all game data persistence.
 * Currently implemented using localStorage, but designed to be easily 
 * replaced with Firebase or any other backend service.
 */

import { COLONY_SAVE_STORAGE_KEYS, sanitizeSave, validateSave, type ColonySaveStorageKey } from './save-manager';


const MAIN_SAVE_KEY = 'time_travel_save';
const LAST_VALID_BACKUP_KEY = 'time_travel_save_backup_last_valid';
const CORRUPTED_BACKUP_KEY = 'time_travel_save_backup_corrupted';
const HARD_RESET_MARKER_KEY = 'qch_hard_reset_at';
const isDev = () => typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
const devLog = (...args: any[]) => {
  if (isDev()) console.info('[GameStorage]', ...args);
};

const readJson = (key: string): any | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw);
};

const writeJson = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const backupLastValidMainSave = () => {
  try {
    const current = readJson(MAIN_SAVE_KEY);
    if (current && validateSave(current)) {
      writeJson(LAST_VALID_BACKUP_KEY, sanitizeSave(current));
    }
  } catch {
    // Existing save is unreadable; the new write path still proceeds with sanitized data.
  }
};

const backupCorruptedMainSave = (raw: string | null) => {
  if (!raw) return;
  try {
    localStorage.setItem(CORRUPTED_BACKUP_KEY, raw);
  } catch {}
};

const loadLastValidBackup = (): any | null => {
  try {
    const backup = readJson(LAST_VALID_BACKUP_KEY);
    if (backup && validateSave(backup)) {
      devLog('restored last valid backup save');
      return sanitizeSave(backup);
    }
  } catch {}
  return null;
};
const SUPPLEMENTAL_LEGACY_KEYS: Partial<Record<ColonySaveStorageKey, string>> = {
  colonies_data: 'colonies',
  colony_cards_data: 'ownedCardIds',
  colony_card_levels: 'cardLevels',
  colony_search_upgrade_levels: 'searchUpgradeLevels',
  colony_active_search: 'activeSearches',
  colony_search_threat_bonus: 'searchThreatBonus',
  route4_search_battle_cycle: 'route4SearchBattleCycle',
  horizon_ship_xp: 'horizonShipXp',
  route4_defense_battle_level: 'defenseBattleLevel',
  battle_cards_loadout: 'battleLoadout',
  battle_card_legendary_pity: 'legendaryBattleCardPity',
  colony_supplies_data: 'supplies',
  defense_special_loadout: 'defenseSpecialLoadout',
  colony_defense_threats: 'pendingDefenseThreats',
  arcade_card_reward_milestones: 'arcadeCardRewardMilestones',
  new_earth_missions: 'newEarthMissions',
  new_earth_submarines: 'newEarthSubmarines',
  new_earth_helicopters: 'newEarthHelicopters',
  new_earth_tanks: 'newEarthTanks',
  new_earth_surface_battles: 'newEarthSurfaceBattles',
  new_earth_museum_treasures: 'newEarthMuseumTreasures',
  new_earth_war_intel: 'newEarthWarIntel',
  new_earth_achievement_metrics: 'newEarthAchievementMetrics',
  route4_qc_reset_done: 'route4QcResetDone',
};

const mergeSupplementalSaveValue = (key: ColonySaveStorageKey, localValue: any, mainValue: any): any => {
  if (mainValue === null || mainValue === undefined) return localValue;
  if (localValue === null || localValue === undefined) return mainValue;

  if (key === 'colony_cards_data') {
    const merged = new Set<string>();
    if (Array.isArray(mainValue)) mainValue.forEach(id => typeof id === 'string' && merged.add(id));
    if (Array.isArray(localValue)) localValue.forEach(id => typeof id === 'string' && merged.add(id));
    return Array.from(merged);
  }

  if (key === 'route4_defense_battle_level') {
    return Math.max(1, Math.floor(Number(localValue) || 1), Math.floor(Number(mainValue) || 1));
  }

  if (key === 'route4_qc_reset_done') {
    return Boolean(localValue) || Boolean(mainValue);
  }

  if (key === 'route4_search_battle_cycle') {
    const localCycle = Math.max(0, Math.floor(Number(localValue?.cycle) || 0));
    const mainCycle = Math.max(0, Math.floor(Number(mainValue?.cycle) || 0));
    if (mainCycle > localCycle) return mainValue;
    if (localCycle > mainCycle) return localValue;
    const nextBattleIndex = Math.max(
      0,
      Math.floor(Number(localValue?.nextBattleIndex) || 0),
      Math.floor(Number(mainValue?.nextBattleIndex) || 0)
    );
    return {
      cycle: localCycle,
      nextBattleIndex: Math.min(5, nextBattleIndex),
    };
  }

  if (key === 'colony_card_levels') {
    const merged: Record<string, number> = { ...(mainValue || {}) };
    Object.entries(localValue || {}).forEach(([cardId, level]) => {
      merged[cardId] = Math.max(Number(merged[cardId]) || 0, Number(level) || 0);
    });
    return merged;
  }

  if (key === 'new_earth_museum_treasures' || key === 'new_earth_war_intel' || key === 'new_earth_achievement_metrics' || key === 'new_earth_helicopters' || key === 'new_earth_tanks' || key === 'new_earth_surface_battles') {
    return {
      ...(mainValue && typeof mainValue === 'object' ? mainValue : {}),
      ...(localValue && typeof localValue === 'object' ? localValue : {}),
    };
  }

  return localValue;
};

const getSupplementalSaveFromMainSave = (mainSave: any, key: ColonySaveStorageKey): any | null => {
  if (!mainSave || typeof mainSave !== 'object') return null;

  const colonySystem = mainSave.colony_system;
  if (!colonySystem || typeof colonySystem !== 'object') return null;

  if (colonySystem.storage && Object.prototype.hasOwnProperty.call(colonySystem.storage, key)) {
    return colonySystem.storage[key];
  }

  const legacyKey = SUPPLEMENTAL_LEGACY_KEYS[key];

  if (key === 'colonies_data' && Array.isArray(mainSave.earth_reconstruction?.colonies)) {
    return mainSave.earth_reconstruction.colonies;
  }

  return legacyKey && Object.prototype.hasOwnProperty.call(colonySystem, legacyKey)
    ? colonySystem[legacyKey]
    : null;
};

export const GameStorage = {
  isResetBlocked: (): boolean => {
    try {
      const resetUntil = Number(localStorage.getItem('qch_reset_until') || 0);
      return resetUntil > Date.now();
    } catch {
      return false;
    }
  },

  markReset: (durationMs: number = 5000): void => {
    try {
      localStorage.setItem('qch_reset_until', String(Date.now() + durationMs));
    } catch {}
  },


  markHardReset: (): void => {
    try {
      localStorage.setItem(HARD_RESET_MARKER_KEY, String(Date.now()));
    } catch {}
  },

  clearHardReset: (): void => {
    try {
      localStorage.removeItem(HARD_RESET_MARKER_KEY);
    } catch {}
  },

  hasHardReset: (): boolean => {
    try {
      return Boolean(localStorage.getItem(HARD_RESET_MARKER_KEY));
    } catch {
      return false;
    }
  },
  /**
   * Saves data to storage (localStorage + AppData Background).
   * @param data The data object to be saved.
   * @param key The storage key (defaults to 'time_travel_save').
   */
  /**
   * Saves data to storage (localStorage + AppData Background).
   * @param data The data object to be saved.
   * @param key The storage key (defaults to 'time_travel_save').
   */
  save: async (data: any, key: string = MAIN_SAVE_KEY): Promise<void> => {
    try {
      if (key === MAIN_SAVE_KEY && GameStorage.isResetBlocked()) {
        return;
      }

      const dataToPersist = key === MAIN_SAVE_KEY ? sanitizeSave(data) : data;
      if (key === MAIN_SAVE_KEY) backupLastValidMainSave();

      const serializedData = JSON.stringify(dataToPersist);
      localStorage.setItem(key, serializedData);

      if (key === MAIN_SAVE_KEY && validateSave(dataToPersist)) {
        writeJson(LAST_VALID_BACKUP_KEY, dataToPersist);
        GameStorage.clearHardReset();
      }

      if (COLONY_SAVE_STORAGE_KEYS.includes(key as ColonySaveStorageKey)) {
        const mainSaveRaw = localStorage.getItem(MAIN_SAVE_KEY);
        if (mainSaveRaw) {
          const supplementalKey = key as ColonySaveStorageKey;
          const mainSave = sanitizeSave(JSON.parse(mainSaveRaw));
          const previous = getSupplementalSaveFromMainSave(mainSave, supplementalKey);
          const merged = mergeSupplementalSaveValue(supplementalKey, dataToPersist, previous);
          const legacyKey = SUPPLEMENTAL_LEGACY_KEYS[supplementalKey];

          const colonySystem = mainSave.colony_system as Record<string, any>;
          colonySystem.storage = colonySystem.storage && typeof colonySystem.storage === 'object'
            ? colonySystem.storage
            : {};
          colonySystem.storage[supplementalKey] = merged;
          if (legacyKey) colonySystem[legacyKey] = merged;
          const sanitizedMainSave = sanitizeSave(mainSave);
          localStorage.setItem(MAIN_SAVE_KEY, JSON.stringify(sanitizedMainSave));
          writeJson(LAST_VALID_BACKUP_KEY, sanitizedMainSave);
        }
      }

      if (key === MAIN_SAVE_KEY) {
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToPersist),
          keepalive: true
        }).catch(err => {
          if (isDev()) console.debug('GameStorage: Cloud sync deferred/failed', err);
        });
      }

    } catch (error) {
      console.warn('GameStorage: local save failed', error);
    }
  },

  /**
   * Loads data from storage (Checks LocalStorage then AppData fallback).
   * @param key The storage key (defaults to 'time_travel_save').
   * @returns The parsed data or null if not found.
   */
  load: async (key: string = MAIN_SAVE_KEY): Promise<any | null> => {
    try {
      if (key === MAIN_SAVE_KEY && GameStorage.isResetBlocked()) {
        return null;
      }

      const isColonySupplementalKey = COLONY_SAVE_STORAGE_KEYS.includes(key as ColonySaveStorageKey);
      const serializedData = localStorage.getItem(key);
      let parsedLocalData: any = null;

      try {
        parsedLocalData = serializedData ? JSON.parse(serializedData) : null;
      } catch (error) {
        if (key === MAIN_SAVE_KEY) {
          backupCorruptedMainSave(serializedData);
          const backup = loadLastValidBackup();
          if (backup) return backup;
        }
        throw error;
      }

      if (key === MAIN_SAVE_KEY && parsedLocalData) {
        const sanitizedLocalData = sanitizeSave(parsedLocalData);
        writeJson(MAIN_SAVE_KEY, sanitizedLocalData);
        writeJson(LAST_VALID_BACKUP_KEY, sanitizedLocalData);
        devLog('loaded save', { version: sanitizedLocalData.version });
        return sanitizedLocalData;
      }

      // FIX: Always try to resolve supplemental keys from the embedded main save BEFORE
      // falling through to the cloud fetch. This is critical for import/restore flows
      // where localStorage was just cleared: the main save is already written but the
      // individual supplemental keys haven't been written yet (or were just cleared).
      if (isColonySupplementalKey) {
        const mainSaveRaw = localStorage.getItem(MAIN_SAVE_KEY);
        if (mainSaveRaw) {
          try {
            const mainSave = sanitizeSave(JSON.parse(mainSaveRaw));
            const supplemental = getSupplementalSaveFromMainSave(mainSave, key as ColonySaveStorageKey);
            const merged = mergeSupplementalSaveValue(key as ColonySaveStorageKey, parsedLocalData, supplemental);
            if (merged !== null && merged !== undefined) {
              // Write resolved value back to localStorage so subsequent reads are fast
              localStorage.setItem(key, JSON.stringify(merged));
              return merged;
            }
          } catch {
            // Corrupt main save - fall through to cloud fetch
          }
        }

        if (serializedData && !mainSaveRaw) {
          devLog(`Ignoring orphan supplemental save for ${key}; main save is missing`);
        }
      }

      if (serializedData && !isColonySupplementalKey) {
        return parsedLocalData;
      }

      if (key === MAIN_SAVE_KEY) {
        if (GameStorage.hasHardReset()) {
          devLog('hard reset marker present; skipping AppData fallback');
          return null;
        }

        devLog(`LocalStorage empty for ${key}, checking AppData fallback...`);
        const response = await fetch(`/api/save?key=${key}&t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const sanitized = sanitizeSave(result.data);
            localStorage.setItem(key, JSON.stringify(sanitized));
            writeJson(LAST_VALID_BACKUP_KEY, sanitized);
            return sanitized;
          }
        }
      }

      if (isColonySupplementalKey) {
        if (GameStorage.hasHardReset()) {
          devLog('hard reset marker present; skipping supplemental AppData fallback');
          return null;
        }

        const response = await fetch(`/api/save?key=time_travel_save&t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const result = await response.json();
          const sanitizedMain = result.data ? sanitizeSave(result.data) : null;
          const supplemental = sanitizedMain ? getSupplementalSaveFromMainSave(sanitizedMain, key as ColonySaveStorageKey) : null;
          const merged = mergeSupplementalSaveValue(key as ColonySaveStorageKey, parsedLocalData, supplemental);
          if (merged !== null && merged !== undefined) {
            localStorage.setItem(key, JSON.stringify(merged));
            return merged;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('GameStorage: fallback load failed', error);
      if (key === MAIN_SAVE_KEY) return loadLastValidBackup();
      return null;
    }
  },
  /**
   * Logs a game event to the background log file.
   */
  log: (event: string, details: any = {}, playerName: string = '', isCrash: boolean = false): void => {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, details, playerName, isCrash }),
    }).catch(() => { }); // Silent fail for logs
  },


  /**
   * Saves player settings to Roaming AppData.
   */
  saveSettings: async (settings: any): Promise<void> => {
    try {
      localStorage.setItem('qch_settings', JSON.stringify(settings));
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.warn('GameStorage: settings save failed', error);
    }
  },

  /**
   * Loads player settings from Roaming AppData.
   */
  loadSettings: async (): Promise<any | null> => {
    try {
      const local = localStorage.getItem('qch_settings');
      if (local) return JSON.parse(local);

      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        return result.data || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Removes data from storage.
   */
  remove: async (key: string = 'time_travel_save'): Promise<void> => {
    try {
      localStorage.removeItem(key);

      // If it's the main save, also clear from AppData backend
      if (key === MAIN_SAVE_KEY) {
        GameStorage.markHardReset();
        await fetch(`/api/save?t=${Date.now()}`, {
          method: 'DELETE',
          cache: 'no-store'
        }).catch(() => {});
      }
    } catch (error) {
      console.warn('GameStorage: remove failed', error);
    }
  }
};
