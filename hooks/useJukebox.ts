import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameStorage } from '@/lib/game-storage';
import { ROUTE_THEMES, ARCADE_THEMES, Track } from '@/lib/music-data';
import { useSoundMaster } from './useSoundMaster';

export type { Track };

export const LANDING_BGM: Track = { 
  id: 'landing', 
  title: 'Galactic Horizon (Landing BGM)', 
  url: '/audio/bgm_landing.ogg',
  origin: 'System'
};

const isAbortAudioError = (error: unknown) => (
  error instanceof DOMException && error.name === 'AbortError'
);

const isPlaybackGateError = (error: unknown) => (
  error instanceof DOMException && error.name === 'NotAllowedError'
);

const reportAudioError = (label: string, error: unknown) => {
  if (isAbortAudioError(error)) return;
  if (isPlaybackGateError(error)) {
    console.debug(`[Jukebox] ${label}: waiting for user audio gesture`);
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[Jukebox] ${label}:`, message);
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
  const [desiredIsPlaying, setDesiredIsPlaying] = useState(true);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingGesturePlaybackRef = useRef(false);

  const requestPlayback = useCallback((label: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play()
      .then(() => {
        pendingGesturePlaybackRef.current = false;
        console.log(`[Jukebox] Playback started successfully`);
      })
      .catch(error => {
        if (isPlaybackGateError(error)) {
          pendingGesturePlaybackRef.current = true;
        }
        reportAudioError(label, error);
      });
  }, []);

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
        if (saved.desiredIsPlaying !== undefined) setDesiredIsPlaying(Boolean(saved.desiredIsPlaying));
        if (saved.currentTrackIndex !== undefined && saved.currentTrackIndex < fullPlaylist.length) {
          console.log(`[Jukebox] Restoring track index: ${saved.currentTrackIndex}`);
          setCurrentTrackIndex(saved.currentTrackIndex);
        }
      }
      setIsLoaded(true);
      console.log(`[Jukebox] Engine loaded with ${fullPlaylist.length} tracks`);
    };
    loadSettings();
  }, [fullPlaylist.length]);

  // Save settings when they change
  useEffect(() => {
    if (!isLoaded) return;
    GameStorage.save({
      isLoop,
      isShuffle,
      desiredIsPlaying,
      currentTrackIndex
    }, 'jukebox_settings');
  }, [isLoop, isShuffle, desiredIsPlaying, currentTrackIndex, isLoaded]);

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
      setDesiredIsPlaying(false);
    } else {
      requestPlayback('Manual playback failed');
      setIsPlaying(true);
      setDesiredIsPlaying(true);
    }
  }, [isPlaying, playlist.length, requestPlayback]);

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
    setDesiredIsPlaying(true);
  }, [currentTrackIndex, isShuffle, playlist.length]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    setDesiredIsPlaying(true);
  }, [currentTrackIndex, playlist.length]);

  const setTrack = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setDesiredIsPlaying(true);
    }
  }, [playlist.length]);

  // Handle track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isLoop) {
        audio.currentTime = 0;
        audio.play().catch(error => reportAudioError('Loop playback failed', error));
      } else {
        playNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isLoop, playNext]);

  const playPlaylist = useCallback((newPlaylist: Track[], options: { restart?: boolean; loop?: boolean; rememberPreference?: boolean } = {}) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(0);
    if (typeof options.loop === 'boolean') setIsLoop(options.loop);
    if (options.restart && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(true);
    if (options.rememberPreference !== false) {
      setDesiredIsPlaying(true);
    }
  }, []);

  const setLibraryTrack = useCallback((index: number) => {
    if (index >= 0 && index < fullPlaylist.length) {
      setPlaylist(fullPlaylist);
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setDesiredIsPlaying(true);
    }
  }, [fullPlaylist]);

  const stop = useCallback((options: { rememberPreference?: boolean } = {}) => {
    setIsPlaying(false);
    if (options.rememberPreference !== false) {
      setDesiredIsPlaying(false);
    }
    pendingGesturePlaybackRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const retryAfterGesture = () => {
      if (!pendingGesturePlaybackRef.current) return;
      requestPlayback('Gesture playback retry failed');
    };

    window.addEventListener('pointerdown', retryAfterGesture, true);
    window.addEventListener('keydown', retryAfterGesture, true);

    return () => {
      window.removeEventListener('pointerdown', retryAfterGesture, true);
      window.removeEventListener('keydown', retryAfterGesture, true);
    };
  }, [isPlaying, requestPlayback]);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && isLoaded && playlist[currentTrackIndex]) {
      const newUrl = playlist[currentTrackIndex].url;
      const currentSrc = audioRef.current.src;
      
      console.log(`[Jukebox] Attempting to play: ${playlist[currentTrackIndex].title} (${newUrl})`);
      
      // Only change src if it's different
      if (!currentSrc.endsWith(newUrl)) {
        console.log(`[Jukebox] Source change detected. Loading new track...`);
        audioRef.current.src = newUrl;
        audioRef.current.load();
      }
      
      if (isPlaying) {
        requestPlayback('Playback failed');
      } else {
        audioRef.current.pause();
        console.log(`[Jukebox] Playback paused`);
      }
    }
  }, [currentTrackIndex, playlist, isPlaying, isLoaded, requestPlayback]);

  return useMemo(() => ({
    playlist,
    libraryPlaylist: fullPlaylist,
    currentTrackIndex,
    isPlaying,
    desiredIsPlaying,
    volume: masterMusicVolume,
    isLoop,
    isShuffle,
    setVolume: () => {}, // Managed by SoundMaster
    setIsLoop,
    setIsShuffle,
    setPlaylist,
    setCurrentTrackIndex,
    setTrack,
    setLibraryTrack,
    setIsPlaying: (next: boolean) => {
      setIsPlaying(next);
      setDesiredIsPlaying(next);
    },
    playPlaylist,
    stop,
    togglePlay,
    playNext,
    playPrev,
    isEmpty: playlist.length === 0,
    currentTrack: playlist[currentTrackIndex]
  }), [
    playlist, 
    fullPlaylist,
    currentTrackIndex, 
    isPlaying, 
    desiredIsPlaying,
    masterMusicVolume, 
    isLoop, 
    isShuffle, 
    playPlaylist, 
    stop,
    togglePlay, 
    playNext, 
    playPrev, 
    setTrack,
    setLibraryTrack
  ]);
}
