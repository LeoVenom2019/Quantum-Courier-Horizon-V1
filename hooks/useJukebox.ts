import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStorage } from '@/lib/game-storage';

export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: string;
}

export const INITIAL_PLAYLIST: Track[] = [
  { id: '1', title: 'Galactic Horizon (Landing BGM)', url: '/audio/bgm_landing.ogg' }
];

export function useJukebox(onPlayStateChange?: (isPlaying: boolean) => void) {
  const [playlist, setPlaylist] = useState<Track[]>(INITIAL_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
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
        if (saved.volume !== undefined) setVolume(saved.volume);
        if (saved.isLoop !== undefined) setIsLoop(saved.isLoop);
        if (saved.isShuffle !== undefined) setIsShuffle(saved.isShuffle);
        if (saved.currentTrackIndex !== undefined && saved.currentTrackIndex < INITIAL_PLAYLIST.length) {
          setCurrentTrackIndex(saved.currentTrackIndex);
        }
      }
      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (!isLoaded) return;
    GameStorage.save({
      volume,
      isLoop,
      isShuffle,
      currentTrackIndex
    }, 'jukebox_settings');
  }, [volume, isLoop, isShuffle, currentTrackIndex, isLoaded]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && isLoaded && playlist[currentTrackIndex]) {
      // Only change src if it's different to prevent resetting playing track
      if (!audioRef.current.src.endsWith(playlist[currentTrackIndex].url)) {
        audioRef.current.src = playlist[currentTrackIndex].url;
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

  return {
    playlist,
    currentTrackIndex,
    isPlaying,
    volume,
    isLoop,
    isShuffle,
    setVolume,
    setIsLoop,
    setIsShuffle,
    togglePlay,
    playNext,
    playPrev,
    isEmpty: playlist.length === 0,
    currentTrack: playlist[currentTrackIndex]
  };
}
