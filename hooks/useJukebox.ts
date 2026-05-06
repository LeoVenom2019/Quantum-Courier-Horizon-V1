import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameStorage } from '@/lib/game-storage';
import { ROUTE_THEMES, ARCADE_THEMES } from '@/lib/music-data';
import { useSoundMaster } from './useSoundMaster';

export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: string;
  origin?: string;
}

export const LANDING_BGM: Track = { 
  id: 'landing', 
  title: 'Galactic Horizon (Landing BGM)', 
  url: '/audio/bgm_landing.ogg',
  origin: 'System'
};

export function useJukebox(onPlayStateChange?: (isPlaying: boolean) => void) {
  const { masterMusicOn, masterMusicVolume } = useSoundMaster();
  
  // Create a master playlist from all sources
  const fullPlaylist = useMemo(() => {
    const tracks: Track[] = [LANDING_BGM];
    
    // Add Route themes
    Object.values(ROUTE_THEMES).forEach(route => {
      route.playlist.forEach(track => {
        tracks.push({ ...track, origin: route.name });
      });
    });
    
    // Add Arcade themes (if they have tracks)
    Object.values(ARCADE_THEMES).forEach(arcade => {
      arcade.playlist.forEach(track => {
        tracks.push({ ...track, origin: arcade.name });
      });
    });
    
    return tracks;
  }, []);

  const [playlist, setPlaylist] = useState<Track[]>(fullPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await GameStorage.load('jukebox_settings');
      if (saved) {
        if (saved.isLoop !== undefined) setIsLoop(saved.isLoop);
        if (saved.isShuffle !== undefined) setIsShuffle(saved.isShuffle);
        if (saved.currentTrackIndex !== undefined && saved.currentTrackIndex < fullPlaylist.length) {
          setCurrentTrackIndex(saved.currentTrackIndex);
        }
      }
      setIsLoaded(true);
    };
    loadSettings();
  }, [fullPlaylist.length]);

  // Save settings when they change
  useEffect(() => {
    if (!isLoaded) return;
    GameStorage.save({
      isLoop,
      isShuffle,
      currentTrackIndex
    }, 'jukebox_settings');
  }, [isLoop, isShuffle, currentTrackIndex, isLoaded]);

  // Sync volume with master
  useEffect(() => {
    if (audioRef.current) {
      // If master music is off, mute the audio but don't stop playback (so it remains in sync/ready)
      audioRef.current.volume = masterMusicOn ? masterMusicVolume : 0;
    }
  }, [masterMusicVolume, masterMusicOn]);

  // Notify parent of play state
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  const togglePlay = useCallback(() => {
    if (playlist.length === 0 || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [isPlaying, playlist.length]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    let nextIndex = currentTrackIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }
    
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  }, [currentTrackIndex, isShuffle, playlist.length]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  }, [currentTrackIndex, playlist.length]);

  const setTrack = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  }, [playlist.length]);

  // Handle track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isLoop) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isLoop, playNext]);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && isLoaded && playlist[currentTrackIndex]) {
      const newUrl = playlist[currentTrackIndex].url;
      // Only change src if it's different
      if (!audioRef.current.src.endsWith(newUrl)) {
        audioRef.current.src = newUrl;
        audioRef.current.load();
      }
      
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Jukebox playback error", e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex, playlist, isPlaying, isLoaded]);

  return {
    playlist,
    currentTrackIndex,
    isPlaying,
    volume: masterMusicVolume,
    isLoop,
    isShuffle,
    setVolume: () => {}, // Managed by SoundMaster
    setIsLoop,
    setIsShuffle,
    setPlaylist,
    setCurrentTrackIndex,
    setTrack,
    togglePlay,
    playNext,
    playPrev,
    isEmpty: playlist.length === 0,
    currentTrack: playlist[currentTrackIndex]
  };
}
