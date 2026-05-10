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

export default function VideoPlayerView({ video, timeLeft, onResume, onPause, timerActive, onBack, onMetricsUpdate }: VideoPlayerViewProps) {
  const [isFocused, setIsFocused] = useState(true);
  const [showFocusCam, setShowFocusCam] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useLocalStorage<VideoNote[]>(`video-notes-${video.id}`, []);
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
  const [showPerfSettings, setShowPerfSettings] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const saveIntervalRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const lastFocusRef = useRef(true);
  const bufferTimerRef = useRef<any>(null);

  // Sync progress bar via direct DOM manipulation for performance
  useEffect(() => {
    const updateProgress = () => {
      if (playerRef.current && 
          typeof playerRef.current.getCurrentTime === 'function' && 
          typeof playerRef.current.getDuration === 'function') {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        
        setCurrentTime(current);
        setDuration(total);

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
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('yt-player-embed', {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          controls: 0, // CUSTOM CONTROLS UI
          origin: window.location.origin,
          disablekb: 1,
          fs: 0,
          hl: 'en',
          // Performance optimizations
          widget_referrer: window.location.href,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            const player = event.target;
            console.log("YouTube Player Ready", { videoId: video.id });
            
            // Apply data saver quality if enabled
            if (perfSettings.dataSaver) {
              player.setPlaybackQuality('small'); // 240p
            } else if (perfSettings.autoQuality) {
              player.setPlaybackQuality('auto');
            }

            player.playVideo();
            
            saveIntervalRef.current = setInterval(() => {
              if (playerRef.current && 
                  typeof playerRef.current.getCurrentTime === 'function' && 
                  typeof playerRef.current.getDuration === 'function') {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                if (total > 0) {
                  setVideoHistory(prev => ({
                    ...prev,
                    [video.id]: {
                      videoId: video.id,
                      lastTimestamp: current,
                      totalDurationAtLastSave: total,
                      playbackRate: typeof playerRef.current.getPlaybackRate === 'function' 
                        ? playerRef.current.getPlaybackRate() 
                        : 1,
                      updatedAt: Date.now()
                    }
                  }));
                }
              }
            }, 5000);
          },
          onStateChange: (event: any) => {
            console.log("YouTube Player State Change:", event.data);
            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log("Playback Started");
              setIsPlaying(true);
              setIsBuffering(false);
              clearTimeout(bufferTimerRef.current);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              console.log("Playback Paused");
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              console.log("Playback Buffering...");
              setIsBuffering(true);
              setBufferCount(prev => prev + 1);
              
              // If buffering for too long, suggest quality reduction
              bufferTimerRef.current = setTimeout(() => {
                if (perfSettings.autoQuality && !perfSettings.dataSaver) {
                   console.log("Low connection detected, dropping quality");
                   playerRef.current?.setPlaybackQuality('medium'); // Drop to 360p if stuck
                }
              }, 5000);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              console.log("Playback Ended");
              setIsPlaying(false);
            } else {
              setIsPlaying(false);
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            // Attempt to reload video if it fails
            if (event.data === 150 || event.data === 101) {
              // Video doesn't allow embedding or other fatal error
            }
          }
        }
      });
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
  }, []);

  const handleInteractionLayerTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = (e.currentTarget as any)._touchStartY;
    const startX = (e.currentTarget as any)._touchStartX;
    const deltaY = startY - touch.clientY;
    const deltaX = startX - touch.clientX;

    if (Math.abs(deltaY) > 20 && Math.abs(deltaY) > Math.abs(deltaX)) {
      (e.currentTarget as any)._isSwiping = true;
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

  const cycleRate = useCallback(() => {
    if (!playerRef.current) return;
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    playerRef.current.setPlaybackRate(nextRate);
  }, [playbackRate]);

  const wakeControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  }, []);

  // Auto hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying, showControls]);

  // Interaction Layer - Simplified and made non-blocking
  const InteractionLayer = useMemo(() => (
    <div 
      className="absolute inset-0 z-10 pointer-events-none flex"
      onMouseMove={wakeControls}
    >
       {/* Transparent zones for double tap - using pointer-events-auto carefully */}
       <div 
         className="h-full flex-1 pointer-events-auto cursor-pointer"
         onMouseDown={(e) => {
           const timer = setTimeout(handleLongPressStart, 500);
           (e.currentTarget as any)._longPressTimer = timer;
         }}
         onMouseUp={(e) => {
           clearTimeout((e.currentTarget as any)._longPressTimer);
           if (isLongPressing) handleLongPressEnd();
           else if (e.detail === 2) handleDoubleTap('left');
           else wakeControls();
         }}
         onMouseLeave={(e) => {
           clearTimeout((e.currentTarget as any)._longPressTimer);
           if (isLongPressing) handleLongPressEnd();
         }}
         onTouchStart={(e) => {
           const timer = setTimeout(handleLongPressStart, 500);
           (e.currentTarget as any)._longPressTimer = timer;
           wakeControls();
         }}
         onTouchEnd={(e) => {
           clearTimeout((e.currentTarget as any)._longPressTimer);
           if (isLongPressing) handleLongPressEnd();
         }}
       />
       <div 
         className="h-full flex-1 pointer-events-auto cursor-pointer"
         onMouseDown={(e) => {
           const timer = setTimeout(handleLongPressStart, 500);
           (e.currentTarget as any)._longPressTimer = timer;
         }}
         onMouseUp={(e) => {
           clearTimeout((e.currentTarget as any)._longPressTimer);
           if (isLongPressing) handleLongPressEnd();
           else if (e.detail === 2) handleDoubleTap('right');
           else wakeControls();
         }}
         onMouseLeave={(e) => {
           clearTimeout((e.currentTarget as any)._longPressTimer);
           if (isLongPressing) handleLongPressEnd();
         }}
         onTouchStart={(e) => {
           const timer = setTimeout(handleLongPressStart, 500);
           (e.currentTarget as any)._longPressTimer = timer;
           wakeControls();
         }}
         onTouchEnd={(e) => {
           clearTimeout((e.currentTarget as any)._longPressTimer);
           if (isLongPressing) handleLongPressEnd();
         }}
       />
    </div>
  ), [handleDoubleTap, wakeControls]); 

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-black text-white overflow-hidden gpu",
        perfSettings.performanceMode && "no-complex-animations"
      )}
    >
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

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent z-20">
        <button onClick={onBack} className="p-3 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center px-4 overflow-hidden">
           <div className="flex items-center justify-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <h4 className="text-[8px] font-bold uppercase tracking-widest opacity-40">Live Focus Session</h4>
           </div>
           <h4 className="text-xs font-black italic uppercase tracking-tighter truncate max-w-[200px] sm:max-w-md">{video.title}</h4>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => setShowPerfSettings(!showPerfSettings)}
             className={cn("p-3 rounded-xl transition-all glass", showPerfSettings && "bg-amber-500/20 text-amber-500 border-amber-500/30")}
          >
             <Gauge size={20} />
          </button>
          <button 
             onClick={() => setShowFocusCam(!showFocusCam)} 
             className={`p-3 rounded-xl transition-all ${showFocusCam ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'glass opacity-50'}`}
          >
            <Camera size={20} />
          </button>
          <button 
             onClick={() => setIsFocused(!isFocused)} 
             className={`p-3 rounded-xl transition-all ${isFocused ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'glass opacity-50'}`}
          >
            <Flame size={20} />
          </button>
        </div>
      </div>

      {/* Performance Settings Dropdown */}
      <AnimatePresence>
        {showPerfSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 right-4 w-64 glass rounded-[2rem] p-6 z-[120] border border-white/10 space-y-4 shadow-2xl"
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
                  onClick={() => setPerfSettings({ ...perfSettings, [item.id]: !perfSettings[item.id as keyof PlayerPerformanceSettings] })}
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
        <div 
          className={cn(
            "relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden glass shadow-2xl border border-white/5 bg-black transition-transform duration-500",
            isFocused ? "scale-100 sm:scale-105" : "scale-100"
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

          {/* CUSTOM CONTROLS OVERLAY */}
          <AnimatePresence>
            {showControls && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-8 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"
              >
                {/* Seek Bar Area */}
                <div 
                  className="w-full h-1.5 bg-white/10 rounded-full mb-6 cursor-pointer pointer-events-auto relative group/seek"
                  onClick={handleManualSeek}
                >
                  <div 
                    ref={progressBarRef}
                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-[width] duration-100 rounded-full"
                    style={{ width: '0%' }}
                  />
                  <div className="absolute -top-1 right-0 opacity-0 group-hover/seek:opacity-100 transition-opacity">
                     <div className="w-3.5 h-3.5 bg-white rounded-full shadow-lg" />
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between pointer-events-auto">
                   <div className="flex items-center gap-4 sm:gap-6">
                      <button 
                         onClick={togglePlay} 
                         className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                      >
                         {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                      </button>
                      
                      <div className="flex items-center gap-2">
                         <button onClick={toggleMute} className="text-white opacity-60 hover:opacity-100 transition-opacity">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                         </button>
                         <div className="text-xs font-black tabular-nums tracking-wider opacity-90">
                           <span className="text-white">{formatTime(currentTime)}</span>
                           <span className="text-white/40 mx-1.5">/</span>
                           <span className="text-white/60">{formatTime(duration)}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 sm:gap-4">
                      <button 
                        onClick={() => setShowJumpModal(true)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-2 group"
                      >
                        <JumpIcon size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Jump</span>
                      </button>

                      <button 
                        onClick={cycleRate}
                        className="w-14 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-[10px] font-black transition-colors"
                      >
                         {playbackRate}x
                      </button>

                      <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <Maximize size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

        {/* Lightweight Focus Feedback */}
        <AnimatePresence>
          {isFocused && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="absolute top-6 right-6 p-5 rounded-[2rem] glass backdrop-blur-2xl shadow-3xl z-50 flex items-center gap-5 border border-white/10"
            >
               <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                  <Clock size={24} />
               </div>
               <div className="pr-5">
                  <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Temporal Lock</div>
                  <FocusTimer timeLeft={timeLeft} />
               </div>
               <div className="pl-5 border-l border-white/10">
                  <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Lecture End</div>
                  <div className="text-xl font-black tabular-nums leading-none text-indigo-400">
                     {formatTime(duration - currentTime)}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Buffering warning */}
        {bufferCount > 2 && isBuffering && (
          <div className="absolute bottom-10 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 backdrop-blur-xl">
             <AlertTriangle size={14} /> Network Lag Detected - Auto-Optimizing Quality
          </div>
        )}
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

