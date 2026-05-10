/**
 * GameStorage Module
 * 
 * This module handles all game data persistence.
 * Currently implemented using localStorage, but designed to be easily 
 * replaced with Firebase or any other backend service.
 */

export const GameStorage = {
  /**
   * Saves data to storage (localStorage + AppData Background).
   * @param data The data object to be saved.
   * @param key The storage key (defaults to 'time_travel_save').
   */
  save: async (data: any, key: string = 'time_travel_save'): Promise<void> => {
    try {
      // 1. Instant Save to LocalStorage
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);

      // 2. Background Save to AppData (via API)
      // We don't 'await' this to keep the UI snappy, 
      // but we log any errors if they happen.
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializedData,
      }).catch(err => console.error('Background Save failed:', err));

    } catch (error) {
      console.error('GameStorage: Error saving data', error);
      throw error;
    }
  },

  /**
   * Loads data from storage (Checks LocalStorage then AppData fallback).
   * @param key The storage key (defaults to 'time_travel_save').
   * @returns The parsed data or null if not found.
   */
  load: async (key: string = 'time_travel_save'): Promise<any | null> => {
    try {
      // 1. Try LocalStorage first
      const serializedData = localStorage.getItem(key);
      
      if (serializedData) {
        return JSON.parse(serializedData);
      }

      // 2. Fallback to AppData API if LocalStorage is empty (ONLY for main save)
      if (key === 'time_travel_save' || key === 'speed_run_save') {
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

      return null;
    } catch (error) {
      console.error('GameStorage: Error loading data', error);
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
    }).catch(() => {}); // Silent fail for logs
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
      console.error('GameStorage: Error saving settings', error);
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
        }).catch(err => console.error('Background Delete failed:', err));
      }
    } catch (error) {
      console.error('GameStorage: Error removing data', error);
      throw error;
    }
  }
};

