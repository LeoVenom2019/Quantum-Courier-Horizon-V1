/**
 * GameStorage Module
 * 
 * This module handles all game data persistence.
 * Currently implemented using localStorage, but designed to be easily 
 * replaced with Firebase or any other backend service.
 */

export const GameStorage = {
  /**
   * Saves data to storage.
   * @param data The data object to be saved.
   * @param key The storage key (defaults to 'time_travel_save').
   */
  save: async (data: any, key: string = 'time_travel_save'): Promise<void> => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('GameStorage: Error saving data', error);
      throw error;
    }
  },

  /**
   * Loads data from storage.
   * @param key The storage key (defaults to 'time_travel_save').
   * @returns The parsed data or null if not found.
   */
  load: async (key: string = 'time_travel_save'): Promise<any | null> => {
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) return null;
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('GameStorage: Error loading data', error);
      return null;
    }
  },

  /**
   * Removes data from storage.
   * @param key The storage key (defaults to 'time_travel_save').
   */
  remove: async (key: string = 'time_travel_save'): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('GameStorage: Error removing data', error);
      throw error;
    }
  }
};
