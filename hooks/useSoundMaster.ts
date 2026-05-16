'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameStorage } from '@/lib/game-storage';

export interface SoundSettings {
  masterMusicOn: boolean;
  masterMusicVolume: number;
  masterSfxOn: boolean;
  masterSfxVolume: number;
  // Multi-channel categories
  uiVolume: number;
  playerVolume: number;
  enemyVolume: number;
  ambientVolume: number;
}

const DEFAULT_SETTINGS: SoundSettings = {
  masterMusicOn: true,
  masterMusicVolume: 0.5,
  masterSfxOn: true,
  masterSfxVolume: 0.7, // Increased default master SFX
  uiVolume: 0.6,
  playerVolume: 1.0,   // Player is the protagonist
  enemyVolume: 0.7,
  ambientVolume: 0.8,
};

// Custom event for sound settings changes
const SOUND_SETTINGS_CHANGED_EVENT = 'qch_sound_settings_changed';

export function useSoundMaster() {
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await GameStorage.loadSettings();
      if (saved && saved.masterMusicOn !== undefined) {
        setSettings({ ...DEFAULT_SETTINGS, ...saved });
      } else {
        // Migration from old simple settings if they exist
        const oldMusic = localStorage.getItem('musicOn');
        const oldSfx = localStorage.getItem('sfxOn');
        if (oldMusic !== null || oldSfx !== null) {
          const migrated = {
            ...DEFAULT_SETTINGS,
            masterMusicOn: oldMusic !== 'false',
            masterSfxOn: oldSfx !== 'false',
          };
          setSettings(migrated);
          GameStorage.saveSettings(migrated);
        }
      }
      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };

    window.addEventListener(SOUND_SETTINGS_CHANGED_EVENT, handleSettingsChange);
    return () => window.removeEventListener(SOUND_SETTINGS_CHANGED_EVENT, handleSettingsChange);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Schedule side effects for after the state update
      setTimeout(() => {
        // Save to storage
        GameStorage.saveSettings(updated);
        
        // Notify other instances
        const event = new CustomEvent(SOUND_SETTINGS_CHANGED_EVENT, { detail: updated });
        window.dispatchEvent(event);
      }, 0);
      
      return updated;
    });
  }, []);

  return {
    ...settings,
    updateSettings,
    isLoaded
  };
}
