import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  RotateCcw, 
  RotateCw, 
  Play, 
  Pause, 
  Settings2, 
  StickyNote, 
  Flame, 
  X, 
  Clock,
  FastForward,
  Camera,
  Activity,
  Zap,
  ShieldCheck,
  Signal,
  Gauge,
  MonitorOff,
  Plus,
  ChevronRight,
  Maximize,
  Minimize,
  FastForward as SpeedIcon,
  Timer,
  Hash as JumpIcon,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Volume2,
  VolumeX,
  Music,
  Monitor,
  Layout,
  BookMarked,
  List,
  EyeOff,
  Sparkles,
  MousePointer2,
  Lock,
  Unlock,
  AppWindow,
  Info,
  Layers,
  Move,
} from 'lucide-react';
import { YouTubeVideo, VideoNote, WatchHistory, PlayerPerformanceSettings } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import FocusCam from './FocusCam';
import { cn } from '../../lib/utils';

interface VideoPlayerViewProps {
  video: YouTubeVideo;
  timeLeft: number;
  onResume: () => void;
  onPause: () => void;
  syncTime: (time: number) => void;
  timerActive: boolean;
  onBack: () => void;
  onMetricsUpdate?: (metrics: any) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

// Optimization: Sub-components logic separation
const FocusTimer = memo(({ timeLeft }: { timeLeft: number }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="text-xl font-black tabular-nums leading-none">
      {minutes}:{String(seconds).padStart(2, '0')}
    </div>
  );
});

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};

interface AmbientAudio {
  id: string;
  name: string;
  url: string;
}

const AMBIENT_SOUNDS: AmbientAudio[] = [
  { id: 'rain', name: 'Rain', url: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'cafe', name: 'Cafe', url: 'https://www.soundjay.com/ambient/cafe-ambience-1.mp3' },
  { id: 'storm', name: 'Storm', url: 'https://www.soundjay.com/nature/thunder-01.mp3' }
];

interface FloatingWidgetConfig {
  x: number | string;
  y: number | string;
  size: 'small' | 'compact' | 'expanded';
  opacity: number;
  isMinimized: boolean;
}

export default function VideoPlayerView({ video, timeLeft, onResume, onPause, syncTime, timerActive, onBack, onMetricsUpdate }: VideoPlayerViewProps) {
  const [isFocused, setIsFocused] = useState(true);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [showFocusCam, setShowFocusCam] = useState(true);
  const [showAmbientMixer, setShowAmbientMixer] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showPerfSettings, setShowPerfSettings] = useState(false);
  const [activeAmbiance, setActiveAmbiance] = useState<string | null>(null);
  const [ambianceVolume, setAmbianceVolume] = useState(50);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useLocalStorage<VideoNote[]>(`video-notes-${video.id}`, []);
  const [currentSessionStart] = useState(Date.now());
  
  const [widgetConfig, setWidgetConfig] = useLocalStorage<FloatingWidgetConfig>('focus-widget-config', {
    x: 'calc(100% - 180px)',
    y: 100,
    size: 'compact',
    opacity: 100,
    isMinimized: false
  });
  const [focusStats, setFocusStats] = useState({
    sessionLength: 0,
    pauseCount: 0,
    streak: 1
  });
  const [videoHistory, setVideoHistory] = useLocalStorage<Record<string, WatchHistory>>('study-video-progress', {});
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState<WatchHistory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [watchProgress, setWatchProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [jumpTime, setJumpTime] = useState({ h: '0', m: '0', s: '0' });
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'fwd' | 'rew', visible: boolean }>({ type: 'fwd', visible: false });
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [volume, setVolume] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [swipeIndicator, setSwipeIndicator] = useState<{ type: 'volume' | 'brightness', value: number, visible: boolean }>({ type: 'volume', value: 100, visible: false });
  
  const [audioProfile, setAudioProfile] = useState<'standard' | 'bass' | 'vocal' | 'boost'>('standard');
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  
  // Performance states
  const [perfSettings, setPerfSettings] = useLocalStorage<PlayerPerformanceSettings>('yt-perf-settings', {
    autoQuality: true,
    dataSaver: false,
    performanceMode: true,
    lowLatency: true,
    autoPauseEnabled: false
  });
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferCount, setBufferCount] = useState(0);

  const playerRef = useRef<any>(null);
  const ambianceAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activeAmbiance) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === activeAmbiance);
      if (sound) {
        if (ambianceAudioRef.current) ambianceAudioRef.current.pause();
        ambianceAudioRef.current = new Audio(sound.url);
        ambianceAudioRef.current.loop = true;
        ambianceAudioRef.current.volume = ambianceVolume / 100;
        ambianceAudioRef.current.play().catch(e => console.warn("Ambience play blocked", e));
      }
    } else {
      ambianceAudioRef.current?.pause();
    }
    return () => ambianceAudioRef.current?.pause();
  }, [activeAmbiance]);

  useEffect(() => {
    if (ambianceAudioRef.current) {
      ambianceAudioRef.current.volume = ambianceVolume / 100;
    }
  }, [ambianceVolume]);
  // Optimization: Direct DOM refs for high-frequency updates
  const progressBarRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveIntervalRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const lastFocusRef = useRef(true);
  const bufferTimerRef = useRef<any>(null);

  const wakeControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  }, []);
  useEffect(() => {
    let lastSecond = -1;
    const updateProgress = () => {
      if (playerRef.current && 
          typeof playerRef.current.getCurrentTime === 'function' && 
          typeof playerRef.current.getDuration === 'function') {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        const currentInt = Math.floor(current);
        const rate = playerRef.current.getPlaybackRate?.() || 1;
        
        // Only update state once per second to reduce re-renders
        if (currentInt !== lastSecond) {
          setCurrentTime(current);
          setDuration(total);
          lastSecond = currentInt;
          
          if (currentTimeRef.current) {
            currentTimeRef.current.innerText = formatTime(current);
          }
          if (durationRef.current) {
            durationRef.current.innerText = formatTime(total);
          }

          // INTELLIGENT SYNC: Update global focus timer
          // Real-world seconds remaining = (Total Video Seconds - Current Video Seconds) / Playback Rate
          const remainingRealTime = Math.ceil((total - current) / rate);
          if (remainingRealTime >= 0) {
            syncTime(remainingRealTime);
          }
        }

        if (total > 0 && progressBarRef.current) {
          const percent = (current / total) * 100;
          progressBarRef.current.style.width = `${percent}%`;
        }
      }
      if (isPlaying) {
        requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  // Notify Background Engine/App level about streaming state
  useEffect(() => {
    if (perfSettings.performanceMode) {
      document.body.classList.add('is-streaming-video');
      return () => document.body.classList.remove('is-streaming-video');
    }
  }, [perfSettings.performanceMode]);

  // Handle visibility changes for unrequested pauses
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !perfSettings.autoPauseEnabled) {
        // If we came back to the tab and auto-pause is OFF, make sure we keep playing if we were playing
        if (isPlaying && playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [perfSettings.autoPauseEnabled, isPlaying]);

  const handleFocusChange = useCallback((isFocusedCam: boolean) => {
    if (perfSettings.autoPauseEnabled && !isFocusedCam && isPlaying && lastFocusRef.current) {
      playerRef.current?.pauseVideo();
      onPause();
    }
    lastFocusRef.current = isFocusedCam;
  }, [perfSettings.autoPauseEnabled, isPlaying, onPause]);

  const handleMetrics = useCallback((metrics: any) => {
    if (onMetricsUpdate) onMetricsUpdate(metrics);
  }, [onMetricsUpdate]);

  useEffect(() => {
    // Auto-resume timer when video player opens in focus mode
    if (!timerActive) {
      onResume();
    }

    // Check for saved progress
    if (videoHistory[video.id]) {
      setSavedProgress(videoHistory[video.id]);
      setShowResumePrompt(true);
    }

    // Load YouTube API if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!containerRef.current) return;
      
      // Destroy existing player if any to prevent memory leaks
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Player destroy failed", e);
        }
      }

      const playerOptions = {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          controls: 0,
          origin: window.location.origin,
          disablekb: 1,
          fs: 0,
          hl: 'en',
          widget_referrer: window.location.href,
          enablejsapi: 1,
          cc_load_policy: 0,
          playsinline: 1
        },
        events: {
          onReady: (event: any) => {
            const player = event.target;
            playerRef.current = player;
            
            if (perfSettings.dataSaver) player.setPlaybackQuality('small');
            else if (perfSettings.autoQuality) player.setPlaybackQuality('auto');

            // Handle immediate play if not showing resume prompt
            if (!showResumePrompt) {
              player.playVideo();
            }

            // Sync initial duration if available
            const total = player.getDuration();
            if (total > 0) {
              setDuration(total);
              syncTime(Math.ceil(total / (player.getPlaybackRate() || 1)));
            }
            
            saveIntervalRef.current = setInterval(() => {
              if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                if (total > 0) {
                  setVideoHistory((prev: Record<string, WatchHistory>) => ({
                    ...prev,
                    [video.id]: {
                      videoId: video.id,
                      lastTimestamp: current,
                      totalDurationAtLastSave: total,
                      playbackRate: playerRef.current.getPlaybackRate?.() || 1,
                      updatedAt: Date.now()
                    }
                  }));
                }
              }
            }, 3000); // More frequent saves for premium feel
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsBuffering(false);
              clearTimeout(bufferTimerRef.current);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              setIsBuffering(true);
              setBufferCount(prev => prev + 1);
              bufferTimerRef.current = setTimeout(() => {
                if (perfSettings.autoQuality) playerRef.current?.setPlaybackQuality('medium');
              }, 4000);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              // AUTO SESSION COMPLETE
              if (onMetricsUpdate) {
                onMetricsUpdate({ 
                  lecturesWatched: 1, 
                  sessionComplete: true,
                  focusScore: 50 
                });
              }
            }
          }
        }
      };

      playerRef.current = new window.YT.Player('yt-player-embed', playerOptions);
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [video.id]); // Optimization: Only re-init when video ID changes

  const handleResume = (shouldResume: boolean) => {
    if (shouldResume && savedProgress && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(savedProgress.lastTimestamp, true);
      if (typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(savedProgress.playbackRate || 1);
      }
    }
    setShowResumePrompt(false);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const time = playerRef.current?.getCurrentTime() || 0;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;
    const newNote: VideoNote = {
      id: Date.now().toString(),
      videoId: video.id,
      timestamp: time,
      timeLabel,
      text: noteText
    };
    setNotes([newNote, ...notes]);
    setNoteText("");
  };

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  // Stable Player Root - NEVER RE-RENDERS
  const PlayerRoot = useMemo(() => (
    <div id="yt-player-embed" ref={containerRef} className="w-full h-full" />
  ), []);

  const togglePlay = useCallback(() => {
    console.log("Toggle Play Pressed", { player: !!playerRef.current, state: playerRef.current?.getPlayerState?.() });
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') {
      console.warn("Player not ready for togglePlay");
      return;
    }
    const state = playerRef.current.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      console.log("Pausing Video");
      playerRef.current.pauseVideo();
    } else {
      console.log("Playing Video");
      playerRef.current.playVideo();
    }
  }, []);

  const handleManualSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedValue = (x / rect.width) * duration;
    seekTo(clickedValue);
  }, [duration, seekTo]);

  const handleDoubleTap = useCallback((side: 'left' | 'right') => {
    if (!playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    const jump = side === 'left' ? -10 : 10;
    
    setSeekFeedback({ type: side === 'left' ? 'rew' : 'fwd', visible: true });
    setTimeout(() => setSeekFeedback(prev => ({ ...prev, visible: false })), 600);
    
    seekTo(Math.max(0, Math.min(duration, current + jump)));
  }, [duration, seekTo]);

  const handlePrecisionJump = useCallback(() => {
    const h = parseInt(jumpTime.h) || 0;
    const m = parseInt(jumpTime.m) || 0;
    const s = parseInt(jumpTime.s) || 0;
    const totalSeconds = (h * 3600) + (m * 60) + s;
    seekTo(Math.min(totalSeconds, duration));
    setShowJumpModal(false);
  }, [jumpTime, duration, seekTo]);

  const handleLongPressStart = useCallback(() => {
    if (!playerRef.current) return;
    setIsLongPressing(true);
    playerRef.current.setPlaybackRate(2);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (!playerRef.current) return;
    setIsLongPressing(false);
    playerRef.current.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    const vol = Math.max(0, Math.min(100, newVol));
    setVolume(vol);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(vol);
    }
    setSwipeIndicator({ type: 'volume', value: vol, visible: true });
    setTimeout(() => setSwipeIndicator(prev => ({ ...prev, visible: false })), 1000);
  }, []);

  const handleBrightnessChange = useCallback((newBri: number) => {
    const bri = Math.max(20, Math.min(100, newBri));
    setBrightness(bri);
    setSwipeIndicator({ type: 'brightness', value: bri, visible: true });
    setTimeout(() => setSwipeIndicator(prev => ({ ...prev, visible: false })), 1000);
  }, []);

  const handleInteractionLayerTouchStart = useCallback((e: React.TouchEvent) => {
    wakeControls();
    const touch = e.touches[0];
    (e.currentTarget as any)._touchStartY = touch.clientY;
    (e.currentTarget as any)._touchStartX = touch.clientX;
    (e.currentTarget as any)._isSwiping = false;
    
    // Setup long press for speed
    const timer = setTimeout(() => {
      if (!(e.currentTarget as any)._isSwiping) {
        handleLongPressStart();
      }
    }, 500);
    (e.currentTarget as any)._longPressTimer = timer;
  }, [handleLongPressStart, wakeControls]);

  const handleInteractionLayerTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = (e.currentTarget as any)._touchStartY;
    const startX = (e.currentTarget as any)._touchStartX;
    const deltaY = startY - touch.clientY;
    const deltaX = startX - touch.clientX;

    if (Math.abs(deltaY) > 20 || Math.abs(deltaX) > 20) {
      (e.currentTarget as any)._isSwiping = true;
      clearTimeout((e.currentTarget as any)._longPressTimer);
    }

    if (Math.abs(deltaY) > 20 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeft = touch.clientX < rect.left + rect.width / 2;
      const change = (deltaY / rect.height) * 100;

      if (isLeft) {
        handleBrightnessChange(brightness + change);
      } else {
        handleVolumeChange(volume + change);
      }
      (e.currentTarget as any)._touchStartY = touch.clientY;
    }
  }, [brightness, volume, handleBrightnessChange, handleVolumeChange]);

  const handleInteractionLayerTouchEnd = useCallback((e: React.TouchEvent) => {
    clearTimeout((e.currentTarget as any)._longPressTimer);
    if (isLongPressing) {
      handleLongPressEnd();
    } else {
      const now = Date.now();
      const lastTap = (e.currentTarget as any)._lastTap || 0;
      const tapDuration = now - lastTap;
      
      if (tapDuration < 300 && tapDuration > 0) {
        // Double tap
        const touch = e.changedTouches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const isLeft = touch.clientX < rect.left + rect.width / 2;
        handleDoubleTap(isLeft ? 'left' : 'right');
        (e.currentTarget as any)._lastTap = 0; // Reset
      } else {
        (e.currentTarget as any)._lastTap = now;
        wakeControls();
      }
    }
  }, [isLongPressing, handleLongPressEnd, handleDoubleTap, wakeControls]);

  const cycleRate = useCallback(() => {
    if (!playerRef.current) return;
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    playerRef.current.setPlaybackRate(nextRate);
  }, [playbackRate]);

  // Auto hide controls faster on Android/Performance
  useEffect(() => {
    if (isPlaying && showControls) {
      const delay = perfSettings.performanceMode ? 1500 : 2500;
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), delay);
    }
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying, showControls, perfSettings.performanceMode]);

  // Interaction Layer - Pure non-blocking gestural system
  const InteractionLayer = useMemo(() => (
    <div 
      className="absolute inset-0 z-10 pointer-events-auto cursor-none"
      onMouseMove={wakeControls}
      onTouchStart={handleInteractionLayerTouchStart}
      onTouchMove={handleInteractionLayerTouchMove}
      onTouchEnd={handleInteractionLayerTouchEnd}
      onMouseDown={(e) => {
        const timer = setTimeout(handleLongPressStart, 400);
        (e.currentTarget as any)._longPressTimer = timer;
      }}
      onMouseUp={(e) => {
        clearTimeout((e.currentTarget as any)._longPressTimer);
        if (isLongPressing) handleLongPressEnd();
        else {
          const rect = e.currentTarget.getBoundingClientRect();
          const isLeft = e.clientX < rect.left + rect.width / 2;
          if (e.detail === 2) {
            handleDoubleTap(isLeft ? 'left' : 'right');
          } else {
            wakeControls();
          }
        }
      }}
      onMouseLeave={() => {
        clearTimeout((InteractionLayer as any)._longPressTimer);
        if (isLongPressing) handleLongPressEnd();
      }}
    />
  ), [handleDoubleTap, wakeControls, handleInteractionLayerTouchStart, handleInteractionLayerTouchMove, handleInteractionLayerTouchEnd, handleLongPressStart, handleLongPressEnd, isLongPressing]); 

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-black text-white overflow-hidden gpu",
        perfSettings.performanceMode && "no-blur no-animations"
      )}
      style={{
        // Strict performance overrides
        '--backdrop-blur': perfSettings.performanceMode ? '0px' : '12px',
        '--glow-opacity': perfSettings.performanceMode || !isCinemaMode ? '0' : '0.2'
      } as any}
    >
      {/* Global Performance Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-blur * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
        .no-animations * { transition: none !important; animation: none !important; }
        .glass { background: rgba(0,0,0,0.8) !important; border: 1px solid rgba(255,255,255,0.05) !important; }
        .glass-modern { background: rgba(10,10,10,0.95) !important; border: 1px solid rgba(255,255,255,0.05) !important; }
      `}} />
      {/* Floating Smart Focus Widget */}
      <AnimatePresence>
        {isFocused && (
          <motion.div 
            drag
            dragMomentum={false}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              // Snap to edges logic
              const x = info.point.x;
              const y = info.point.y;
              const windowWidth = window.innerWidth;
              const windowHeight = window.innerHeight;
              
              // Calculate nearest horizontal edge
              let finalX = x;
              const threshold = 100; // Snap threshold
              if (x < threshold) finalX = 20;
              else if (x > windowWidth - threshold - 160) finalX = windowWidth - 180;
              
              setWidgetConfig(prev => ({ ...prev, x: finalX, y }));
            }}
            initial={false}
            animate={{ 
              x: typeof widgetConfig.x === 'string' ? 0 : widgetConfig.x, 
              y: typeof widgetConfig.y === 'string' ? 0 : widgetConfig.y,
              opacity: isPlaying ? widgetConfig.opacity / 100 * 0.7 : widgetConfig.opacity / 100,
              scale: isPlaying ? 0.95 : 1
            }}
            style={{
              position: 'fixed',
              top: typeof widgetConfig.y === 'string' ? widgetConfig.y : 0,
              left: typeof widgetConfig.x === 'string' ? widgetConfig.x : 0,
              zIndex: 200,
              touchAction: 'none'
            }}
            className={cn(
              "group/widget flex flex-col items-center gap-2 p-2 rounded-[2rem] border border-white/5 shadow-2xl transition-all duration-500",
              widgetConfig.size === 'small' ? "w-24" : "w-40",
              widgetConfig.isMinimized ? "h-12 bg-black/40" : "bg-black/80 backdrop-blur-md"
            )}
          >
             {/* Drag Handle & Toggle */}
             <div className="flex items-center justify-between w-full px-2 opacity-0 group-hover/widget:opacity-100 transition-opacity">
                <div className="cursor-grab active:cursor-grabbing p-1 opacity-40">
                   <Move size={10} />
                </div>
                <button 
                  onClick={() => setWidgetConfig(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  {widgetConfig.isMinimized ? <Plus size={10} /> : <Minimize size={10} />}
                </button>
             </div>

             {!widgetConfig.isMinimized && (
               <div className="flex flex-col items-center text-center p-2 pt-0 w-full">
                  <div className={cn(
                    "text-indigo-400 font-black tabular-nums transition-all",
                    widgetConfig.size === 'small' ? "text-base" : (timeLeft > 3600 ? "text-xl" : "text-3xl")
                  )}>
                    {formatTime(timeLeft)}
                  </div>
                  
                  {widgetConfig.size !== 'small' && (
                    <div className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 mt-1">Focus Loop</div>
                  )}

                  {/* Expanded Controls */}
                  <div className="h-0 group-hover/widget:h-auto overflow-hidden opacity-0 group-hover/widget:opacity-100 transition-all space-y-2 mt-4 w-full">
                     <div className="grid grid-cols-2 gap-1">
                        <button 
                          onClick={() => setWidgetConfig(prev => ({ ...prev, size: prev.size === 'small' ? 'compact' : 'small' }))}
                          className="p-1.5 bg-white/5 rounded-lg flex items-center justify-center"
                        >
                           <Maximize size={10} />
                        </button>
                        <button 
                          onClick={() => setWidgetConfig(prev => ({ ...prev, opacity: prev.opacity === 30 ? 100 : 30 }))}
                          className="p-1.5 bg-white/5 rounded-lg flex items-center justify-center"
                        >
                           <Layers size={10} />
                        </button>
                     </div>
                     <div className="w-full h-px bg-white/5" />
                     <div className="flex justify-between items-center px-1">
                        <span className="text-[6px] font-black uppercase tracking-widest opacity-30">Opacity</span>
                        <input 
                          type="range" 
                          min="30" 
                          max="100" 
                          step="10"
                          value={widgetConfig.opacity}
                          onChange={(e) => setWidgetConfig(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                          className="w-12 h-0.5 bg-white/10 rounded-full appearance-none accent-indigo-500"
                        />
                     </div>
                  </div>
               </div>
             )}

             {widgetConfig.isMinimized && (
                <div className="text-[10px] font-black tabular-nums text-indigo-400">
                  {formatTime(timeLeft)}
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResumePrompt && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <div className="max-w-sm w-full glass rounded-[3rem] p-8 text-center space-y-6 shadow-2xl border border-white/10">
               <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <Play size={40} fill="currentColor" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-black italic tracking-tighter uppercase">Resume Session?</h3>
                 <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest leading-relaxed">
                   Progress detected at {Math.floor((savedProgress?.lastTimestamp || 0) / 60)}:{String(Math.floor((savedProgress?.lastTimestamp || 0) % 60)).padStart(2, '0')}.
                 </p>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleResume(true)}
                    className="w-full h-16 rounded-[1.5rem] bg-indigo-500 text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform text-xs"
                  >
                    Continue Learning
                  </button>
                  <button 
                    onClick={() => handleResume(false)}
                    className="w-full h-16 rounded-[1.5rem] bg-white/5 font-black uppercase tracking-widest hover:bg-white/10 transition-colors text-xs"
                  >
                    Start From Scratch
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!perfSettings.performanceMode && isCinemaMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          >
            <motion.div 
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 70%)'
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] blur-[120px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLockedIn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-3 px-6 py-3 glass-modern rounded-full border border-indigo-500/20 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Locked In • Mission Active</span>
            <button 
              onClick={() => setIsLockedIn(false)}
              className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <Unlock size={14} className="opacity-40" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 px-6 bg-gradient-to-b from-black/95 via-black/20 to-transparent z-[30] transition-all duration-500 ease-in-out",
        (isCinemaMode || isLockedIn) && "opacity-0 pointer-events-none -translate-y-4"
      )}>
        <button onClick={onBack} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95 shadow-lg border border-white/5">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center max-w-[50%]">
           <h4 className="text-[10px] font-black italic uppercase tracking-tighter truncate w-full text-center">{video.title}</h4>
           <div className="flex items-center gap-2 opacity-30">
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              <span className="text-[7px] font-black uppercase tracking-widest">{video.channelTitle} • Cinematic Engine</span>
           </div>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => setShowChapters(!showChapters)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", showChapters && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30")}
             title="Chapters"
          >
             <List size={18} />
          </button>
          <button 
             onClick={() => setShowMoments(!showMoments)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", showMoments && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30")}
             title="Study Moments"
          >
             <BookMarked size={18} />
          </button>
          <button 
             onClick={() => setShowPerfSettings(!showPerfSettings)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", showPerfSettings && "bg-amber-500/20 text-amber-500 border-amber-500/30")}
             title="Performance"
          >
             <Gauge size={18} />
          </button>
          <button 
             onClick={() => setIsMiniPlayer(!isMiniPlayer)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", isMiniPlayer && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30")}
             title="Mini Player"
          >
             <AppWindow size={18} />
          </button>
          <button 
             onClick={() => setShowAmbientMixer(!showAmbientMixer)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", activeAmbiance && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30")}
          >
             <Volume2 size={18} />
          </button>
          <button 
             onClick={() => setIsCinemaMode(!isCinemaMode)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", isCinemaMode && "bg-amber-500/20 text-amber-500 border-amber-500/30")}
          >
             <Monitor size={18} />
          </button>
          <button 
             onClick={() => setIsLockedIn(!isLockedIn)}
             className={cn("p-2.5 rounded-xl transition-all glass-modern border border-white/5", isLockedIn && "bg-rose-500/20 text-rose-400 border-rose-500/30")}
          >
             <Lock size={18} />
          </button>
          <button 
             onClick={() => setShowFocusCam(!showFocusCam)} 
             className={cn("p-2.5 rounded-xl transition-all", showFocusCam ? 'bg-indigo-500 text-white shadow-lg border border-indigo-400' : 'glass-modern opacity-50 border border-white/5')}
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      {/* Ambient Audio Mixer */}
      <AnimatePresence>
        {showAmbientMixer && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 right-4 w-64 glass-modern rounded-[2rem] p-6 z-[120] border border-white/10 space-y-4 shadow-2xl"
          >
             <div className="flex items-center justify-between mb-2">
                <Music size={16} className="text-indigo-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Atmosphere Sync</h3>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
               {AMBIENT_SOUNDS.map(sound => (
                 <button 
                    key={sound.id}
                    onClick={() => setActiveAmbiance(activeAmbiance === sound.id ? null : sound.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-[9px] font-black uppercase tracking-tighter",
                      activeAmbiance === sound.id ? "bg-indigo-500 text-white border-indigo-400" : "bg-white/5 border-white/5 opacity-40"
                    )}
                 >
                   {sound.name}
                 </button>
               ))}
             </div>

             {activeAmbiance && (
               <div className="space-y-2 pt-2 border-t border-white/5">
                 <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                   <span>Ambient Gain</span>
                   <span>{ambianceVolume}%</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={ambianceVolume}
                   onChange={(e) => setAmbianceVolume(parseInt(e.target.value))}
                   className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500"
                 />
               </div>
             )}

             {/* Audio Profiles */}
             <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Studiosonic Link</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'bass', label: 'Deep Bass' },
                    { id: 'vocal', label: 'Clear Vocal' },
                    { id: 'boost', label: 'Voice Boost' }
                  ].map(profile => (
                    <button 
                      key={profile.id}
                      onClick={() => setAudioProfile(profile.id as any)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all",
                        audioProfile === profile.id ? "bg-amber-500 text-black border-amber-400 font-black" : "bg-white/5 border-white/5 opacity-40 hover:opacity-100"
                      )}
                    >
                      {profile.label}
                    </button>
                  ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removed Focus Sync HUD (Giant Floating Timer) as requested */}

      <AnimatePresence>
        {showPerfSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 right-24 w-64 glass-modern rounded-[2rem] p-6 z-[120] border border-white/10 space-y-4 shadow-2xl"
          >
             <div className="flex items-center gap-3 mb-2">
                <Settings2 size={16} className="text-amber-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Stream Optimization</h3>
             </div>
             
             {[
               { id: 'autoQuality', label: 'Auto Quality', sub: 'Adjust based on speed', icon: <Signal size={14} /> },
               { id: 'dataSaver', label: 'Data Saver', sub: 'Low Quality (240p)', icon: <Activity size={14} /> },
               { id: 'performanceMode', label: 'Perf Mode', sub: 'Reduce UI Load', icon: <Zap size={14} /> },
               { id: 'autoPauseEnabled', label: 'Auto Pause Features', sub: 'Smart session control', icon: <Pause size={14} /> },
               { id: 'lowLatency', label: 'Low Latency', sub: 'Fast Buffer Tech', icon: <Gauge size={14} /> }
             ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setPerfSettings({ ...perfSettings, [item.id as keyof PlayerPerformanceSettings]: !perfSettings[item.id as keyof PlayerPerformanceSettings] })}
                  className="w-full flex items-center justify-between group"
                >
                   <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", perfSettings[item.id as keyof PlayerPerformanceSettings] ? "bg-amber-500/20 text-amber-500" : "bg-white/5 opacity-40")}>
                         {item.icon}
                      </div>
                      <div className="text-left">
                         <div className="text-[10px] font-bold uppercase tracking-tight">{item.label}</div>
                         <div className="text-[7px] font-bold tracking-widest opacity-30 uppercase">{item.sub}</div>
                      </div>
                   </div>
                   <div className={cn("w-2 h-2 rounded-full", perfSettings[item.id as keyof PlayerPerformanceSettings] ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-white/10")} />
                </button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Optimized Overlay System */}
      <AnimatePresence>
        {showChapters && !perfSettings.performanceMode && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute top-20 left-4 bottom-28 w-72 bg-zinc-950/90 rounded-[2rem] p-6 z-[100] border border-white/5 shadow-2xl overflow-y-auto"
          >
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <List size={20} className="text-indigo-400" />
                   <h3 className="text-sm font-black italic uppercase tracking-widest">Chapters</h3>
                </div>
                <button onClick={() => setShowChapters(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <X size={18} />
                </button>
             </div>
             
             <div className="space-y-3">
                {[
                  { time: 0, label: "Introduction" },
                  { time: duration * 0.2, label: "Core Concepts" },
                  { time: duration * 0.5, label: "Detailed Analysis" },
                  { time: duration * 0.8, label: "Summary & Review" }
                ].map((chapter, i) => (
                  <button 
                    key={i}
                    onClick={() => seekTo(chapter.time)}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-indigo-400 group-hover:scale-110 transition-transform">{formatTime(chapter.time)}</span>
                       <span className="text-xs font-bold opacity-80">{chapter.label}</span>
                    </div>
                    {currentTime >= chapter.time && (currentTime < (i < 3 ? (duration * (i === 0 ? 0.2 : i === 1 ? 0.5 : 0.8)) : duration)) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Moments/Bookmarks Overlay */}
      <AnimatePresence>
        {showMoments && !perfSettings.performanceMode && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-20 right-4 bottom-28 w-72 bg-zinc-950/90 rounded-[2rem] p-6 z-[100] border border-white/5 shadow-2xl overflow-y-auto"
          >
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <BookMarked size={20} className="text-amber-400" />
                   <h3 className="text-sm font-black italic uppercase tracking-widest">Bookmarks</h3>
                </div>
                <button onClick={() => setShowMoments(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <X size={18} />
                </button>
             </div>

             <div className="space-y-4">
                <div className="relative">
                   <input 
                     value={noteText}
                     onChange={(e) => setNoteText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addNote()}
                     className="w-full h-12 bg-white/5 rounded-xl border border-white/10 px-4 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all placeholder:opacity-40"
                     placeholder="New study moment..."
                   />
                   <button onClick={addNote} className="absolute right-2 top-2 bottom-2 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                     <Plus size={16} />
                   </button>
                </div>

                <div className="space-y-2">
                   {notes.map(note => (
                     <button 
                       key={note.id}
                       onClick={() => seekTo(note.timestamp)}
                       className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-500/10 transition-all text-left"
                     >
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-[10px] font-black text-indigo-400">{note.timeLabel}</span>
                           <div className="w-1 h-1 rounded-full bg-white/20" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">Moment Saved</span>
                        </div>
                        <p className="text-[11px] font-medium opacity-70 italic truncate">"{note.text}"</p>
                     </button>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFocusCam && (
          <FocusCam 
            onFocusChange={handleFocusChange}
            onMetricsUpdate={handleMetrics}
            autoPause={perfSettings.autoPauseEnabled}
          />
        )}
      </AnimatePresence>

      {/* Main Player Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-2 sm:p-12 overflow-hidden bg-zinc-950">
        <motion.div 
          layout
          drag={isMiniPlayer}
          dragConstraints={containerRef}
          className={cn(
            "relative rounded-3xl overflow-hidden glass shadow-2xl border border-white/5 bg-black transition-all duration-500 ease-in-out",
            isMiniPlayer ? "fixed bottom-8 left-8 w-80 aspect-video z-[180] shadow-[0_32px_128px_rgba(0,0,0,0.8)] border-indigo-500/30" : "w-full max-w-5xl aspect-video",
            isFocused && !isMiniPlayer && "scale-100 sm:scale-105"
          )}
          onMouseEnter={wakeControls}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <div className="w-full h-full bg-black relative select-none">
            {PlayerRoot}
            
            {/* Interaction Layer */}
            {InteractionLayer}

            {/* Brightness Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-[15] bg-black transition-opacity duration-300"
              style={{ opacity: 1 - (brightness / 100) }}
            />

            {/* Swipe HUD */}
            <AnimatePresence>
              {swipeIndicator.visible && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute top-1/2 left-10 -translate-y-1/2 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center gap-3 z-50 pointer-events-none"
                >
                  {swipeIndicator.type === 'volume' ? <Volume2 size={20} className="text-indigo-400" /> : <MonitorOff size={20} className="text-amber-400" />}
                  <div className="w-1.5 h-32 bg-white/10 rounded-full relative overflow-hidden">
                      <div 
                        className={cn("absolute bottom-0 left-0 right-0 transition-all duration-200", swipeIndicator.type === 'volume' ? 'bg-indigo-500' : 'bg-amber-500')} 
                        style={{ height: `${swipeIndicator.value}%` }} 
                      />
                  </div>
                  <span className="text-[10px] font-black">{Math.round(swipeIndicator.value)}%</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Long Press 2x HUD */}
            <AnimatePresence>
              {isLongPressing && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 z-50 pointer-events-none"
                >
                  <SpeedIcon size={14} className="text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">2x Speed Active</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Double Tap Animations */}
            <AnimatePresence>
              {seekFeedback.visible && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 p-10 bg-white/10 backdrop-blur-md rounded-full pointer-events-none z-30",
                    seekFeedback.type === 'rew' ? 'left-10' : 'right-10'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                      {seekFeedback.type === 'rew' ? <RotateCcw size={32} /> : <RotateCw size={32} />}
                      <span className="text-xs font-black">{seekFeedback.type === 'rew' ? '-10s' : '+10s'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {isBuffering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-30"
              >
                <div className="flex flex-col items-center gap-4">
                  <Zap className="text-indigo-400 animate-pulse" size={40} />
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Buffering Strategy Active...</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PREMIUM CUSTOM CONTROLS HUD */}
          <AnimatePresence>
            {showControls && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-10 pointer-events-none"
              >
                {/* Floating Control Island */}
                <div className="max-w-2xl mx-auto glass rounded-[2.5rem] p-4 sm:p-6 border border-white/10 shadow-2xl pointer-events-auto flex flex-col gap-4">
                  {/* Progress Bar - Thinner for performance visibility */}
                  <div 
                    className="group/seek relative w-full h-1 bg-white/10 rounded-full cursor-pointer transition-all hover:h-1.5"
                    onClick={handleManualSeek}
                    onMouseMove={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const time = (x / rect.width) * duration;
                       setHoverTime(time);
                       setHoverX(x);
                    }}
                    onMouseLeave={() => setHoverTime(null)}
                  >
                    {/* Hover Time Bubble */}
                    <AnimatePresence>
                      {hoverTime !== null && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -40, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.8 }}
                          className="absolute glass-modern px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-black shadow-2xl pointer-events-none"
                          style={{ left: hoverX, transform: 'translateX(-50%)' }}
                        >
                           {formatTime(hoverTime)}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                    <div 
                      ref={progressBarRef}
                      className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] relative transition-[width] duration-100 rounded-full"
                      style={{ width: '0%' }}
                    >
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover/seek:scale-100 transition-transform border-4 border-indigo-500" />
                    </div>
                  </div>

                  {/* Main HUD Row */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <button 
                           onClick={togglePlay} 
                           className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95 shadow-lg border border-white/5"
                        >
                           {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>
                        
                        <div className="flex flex-col">
                           <div className="text-[10px] font-black tabular-nums tracking-widest text-indigo-400">
                             <span ref={currentTimeRef}>{formatTime(currentTime)}</span> <span className="opacity-30 mx-1">/</span> <span ref={durationRef}>{formatTime(duration)}</span>
                           </div>
                           <div className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30">Synapse Progress</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setShowJumpModal(true)}
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all group"
                        >
                          <JumpIcon size={16} className="group-hover:rotate-12 transition-transform" />
                        </button>

                        <button 
                          onClick={toggleMute}
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                        >
                           {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-1" />

                        <button 
                          onClick={cycleRate}
                          className="px-4 h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black transition-all border border-indigo-500/20 uppercase tracking-widest"
                        >
                           {playbackRate}x
                        </button>

                        <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                          <Maximize size={16} />
                        </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        
        {/* Precision Jump Modal */}
        <AnimatePresence>
          {showJumpModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            >
              <div className="max-w-md w-full glass rounded-[3rem] p-10 space-y-8 shadow-2xl border border-white/10">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Precision Jump</h3>
                       <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Target Exact Neural Memory</p>
                    </div>
                    <button onClick={() => setShowJumpModal(false)} className="p-2 rounded-full hover:bg-white/10 mb-4 transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="flex items-center justify-center gap-4">
                    {[
                      { key: 'h', label: 'HR' },
                      { key: 'm', label: 'MIN' },
                      { key: 's', label: 'SEC' }
                    ].map(unit => (
                      <div key={unit.key} className="flex flex-col items-center gap-2">
                         <input 
                           type="text"
                           value={jumpTime[unit.key as keyof typeof jumpTime]}
                           onChange={(e) => setJumpTime({...jumpTime, [unit.key]: e.target.value.replace(/\D/g, '').slice(0, 2)})}
                           className="w-20 h-24 rounded-[1.5rem] bg-white/5 border border-white/10 text-center text-3xl font-black outline-none focus:border-indigo-500 focus:ring-1 ring-indigo-500 transition-all"
                           placeholder="00"
                         />
                         <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{unit.label}</span>
                      </div>
                    ))}
                 </div>

                 <button 
                   onClick={handlePrecisionJump}
                   className="w-full h-16 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-transform"
                 >
                    Coordinate Locked • JUMP
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Lightweight Focus Feedback - REMOVED for Floating Widget */}
        
        {/* Buffering warning */}
        {bufferCount > 2 && isBuffering && (
          <div className="absolute bottom-10 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 backdrop-blur-xl">
             <AlertTriangle size={14} /> Network Lag Detected - Auto-Optimizing Quality
          </div>
        )}
        </motion.div>
      </div>

      <AnimatePresence>
        {!isFocused && (
          <motion.div 
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="h-[35vh] bg-[#050505] border-t border-white/5 p-6 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto space-y-6 pb-12">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <StickyNote size={18} className="text-indigo-400" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Lecture Annotation Vault</span>
                  </div>
                  <div className="text-[8px] font-black opacity-20 uppercase tracking-widest">{notes.length} Fragments Saved</div>
               </div>
               
               <div className="relative group">
                  <input 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Capture insight at current timestamp..."
                    className="w-full h-16 pl-8 pr-16 rounded-[1.5rem] bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 ring-indigo-500 outline-none text-xs font-bold transition-all placeholder:opacity-30 italic"
                  />
                  <button 
                    onClick={addNote}
                    className="absolute right-3 top-3 bottom-3 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Plus size={20} />
                  </button>
               </div>

               <div className="grid gap-3">
                  {notes.map(note => (
                    <button 
                      key={note.id} 
                      onClick={() => seekTo(note.timestamp)}
                      className="p-5 rounded-[1.8rem] bg-white/[0.03] border border-white/5 flex items-center gap-5 hover:bg-white/5 transition-all text-left group"
                    >
                       <div className="w-12 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px] group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          {note.timeLabel}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold opacity-90 truncate italic">"{note.text}"</p>
                       </div>
                       <ChevronRight size={16} className="opacity-10" />
                    </button>
                  ))}
                  {notes.length === 0 && (
                    <div className="py-16 flex flex-col items-center opacity-10">
                       <MonitorOff size={40} className="mb-4" />
                       <div className="text-[10px] font-black uppercase tracking-widest text-center">Neural data empty. Start taking notes.</div>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const AlertTriangle = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

