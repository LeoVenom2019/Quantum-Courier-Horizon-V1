/**
 * GameStorage Module
 * 
 * This module handles all game data persistence.
 * Currently implemented using localStorage, but designed to be easily 
 * replaced with Firebase or any other backend service.
 */

import { COLONY_SAVE_STORAGE_KEYS, type ColonySaveStorageKey } from './save-manager';

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
  new_earth_museum_treasures: 'newEarthMuseumTreasures',
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

  if (key === 'new_earth_museum_treasures') {
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
  save: async (data: any, key: string = 'time_travel_save'): Promise<void> => {
    try {
      if (key === 'time_travel_save' && GameStorage.isResetBlocked()) {
        return;
      }

      // 1. Instant Save to LocalStorage
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);

      if (COLONY_SAVE_STORAGE_KEYS.includes(key as ColonySaveStorageKey)) {
        const mainSaveRaw = localStorage.getItem('time_travel_save');
        if (mainSaveRaw) {
          const supplementalKey = key as ColonySaveStorageKey;
          const mainSave = JSON.parse(mainSaveRaw);
          const previous = getSupplementalSaveFromMainSave(mainSave, supplementalKey);
          const merged = mergeSupplementalSaveValue(supplementalKey, data, previous);
          const legacyKey = SUPPLEMENTAL_LEGACY_KEYS[supplementalKey];

          mainSave.colony_system = mainSave.colony_system && typeof mainSave.colony_system === 'object'
            ? mainSave.colony_system
            : {};
          mainSave.colony_system.storage = mainSave.colony_system.storage && typeof mainSave.colony_system.storage === 'object'
            ? mainSave.colony_system.storage
            : {};
          mainSave.colony_system.storage[supplementalKey] = merged;
          if (legacyKey) mainSave.colony_system[legacyKey] = merged;
          localStorage.setItem('time_travel_save', JSON.stringify(mainSave));
        }
      }

      // 2. Background Sync to Server API (Cloud Save)
      // Only for main gameplay saves
      if (key === 'time_travel_save') {
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: serializedData,
          // Use 'keepalive' to ensure the request completes even if the page is closing
          keepalive: true 
        }).catch(err => {
          // Silent fail for background sync to not disrupt gameplay
          console.debug('GameStorage: Cloud sync deferred/failed', err);
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
  load: async (key: string = 'time_travel_save'): Promise<any | null> => {
    try {
      if (key === 'time_travel_save' && GameStorage.isResetBlocked()) {
        return null;
      }

      const isColonySupplementalKey = COLONY_SAVE_STORAGE_KEYS.includes(key as ColonySaveStorageKey);

      // 1. Try LocalStorage first
      const serializedData = localStorage.getItem(key);
      const parsedLocalData = serializedData ? JSON.parse(serializedData) : null;

      if (isColonySupplementalKey) {
        const mainSave = localStorage.getItem('time_travel_save');
        if (mainSave) {
          const supplemental = getSupplementalSaveFromMainSave(JSON.parse(mainSave), key as ColonySaveStorageKey);
          const merged = mergeSupplementalSaveValue(key as ColonySaveStorageKey, parsedLocalData, supplemental);
          if (merged !== null && merged !== undefined) {
            localStorage.setItem(key, JSON.stringify(merged));
            return merged;
          }
        }
      }

      if (serializedData) {
        return parsedLocalData;
      }

      // 2. Fallback to AppData API if LocalStorage is empty (ONLY for main save)
      if (key === 'time_travel_save') {
        console.log(`GameStorage: LocalStorage empty for ${key}, checking AppData fallback...`);
        const response = await fetch(`/api/save?key=${key}&t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log('GameStorage: Restored save from AppData!');
            // Repopulate localStorage for next time
            localStorage.setItem(key, JSON.stringify(result.data));
            return result.data;
          }
        }
      }

      if (isColonySupplementalKey) {
        const response = await fetch(`/api/save?key=time_travel_save&t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const result = await response.json();
          const supplemental = getSupplementalSaveFromMainSave(result.data, key as ColonySaveStorageKey);
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
      if (key === 'time_travel_save') {
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

