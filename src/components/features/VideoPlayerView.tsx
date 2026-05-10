import { useState, useRef, useEffect, memo, useCallback } from 'react';
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
  Activity
} from 'lucide-react';
import { YouTubeVideo, VideoNote, WatchHistory } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import FocusCam from './FocusCam';

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

// Refined Timer component to prevent full-player re-renders
const FocusTimer = memo(({ timeLeft }: { timeLeft: number }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="text-xl font-black tabular-nums leading-none">
      {minutes}:{String(seconds).padStart(2, '0')}
    </div>
  );
});

export default function VideoPlayerView({ video, timeLeft, onResume, onPause, timerActive, onBack, onMetricsUpdate }: VideoPlayerViewProps) {
  const [isFocused, setIsFocused] = useState(true);
  const [showFocusCam, setShowFocusCam] = useState(true);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useLocalStorage<VideoNote[]>(`video-notes-${video.id}`, []);
  const [videoHistory, setVideoHistory] = useLocalStorage<Record<string, WatchHistory>>('study-video-progress', {});
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState<WatchHistory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [watchProgress, setWatchProgress] = useState(0);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveIntervalRef = useRef<any>(null);
  const lastFocusRef = useRef(true);

  const handleFocusChange = useCallback((isFocusedCam: boolean) => {
    if (autoPauseEnabled && !isFocusedCam && isPlaying && lastFocusRef.current) {
      playerRef.current?.pauseVideo();
      onPause();
    }
    lastFocusRef.current = isFocusedCam;
  }, [autoPauseEnabled, isPlaying, onPause]);

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
      
      playerRef.current = new window.YT.Player('yt-player-embed', {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          controls: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            const player = event.target;
            player.playVideo();
            
            // Start progress tracking interval
            saveIntervalRef.current = setInterval(() => {
              if (playerRef.current && 
                  typeof playerRef.current.getCurrentTime === 'function' && 
                  typeof playerRef.current.getDuration === 'function') {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                if (total > 0) {
                  setWatchProgress((current / total) * 100);
                  
                  // Auto save every 5 seconds
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
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
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
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [video.id]);

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

  const seekTo = (seconds: number) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black text-white overflow-hidden"
    >
      {/* Resume Prompt Overlay */}
      <AnimatePresence>
        {showResumePrompt && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <div className="max-w-sm w-full glass rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl border border-white/10">
               <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <Play size={40} fill="currentColor" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-black">Resume Lecture?</h3>
                 <p className="text-sm opacity-60">You were at {Math.floor((savedProgress?.lastTimestamp || 0) / 60)}:00 previously. Continue from there?</p>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleResume(true)}
                    className="w-full h-14 rounded-2xl bg-indigo-500 text-white font-bold hover:scale-105 transition-transform"
                  >
                    Resume from {Math.floor((savedProgress?.lastTimestamp || 0) / 60)}:{String(Math.floor((savedProgress?.lastTimestamp || 0) % 60)).padStart(2, '0')}
                  </button>
                  <button 
                    onClick={() => handleResume(false)}
                    className="w-full h-14 rounded-2xl bg-white/5 font-bold hover:bg-white/10 transition-colors"
                  >
                    Start Over
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
           <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5 truncate">Studying</h4>
           <h4 className="text-xs font-bold truncate max-w-[200px] sm:max-w-md">{video.title}</h4>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => setShowFocusCam(!showFocusCam)} 
             className={`p-3 rounded-xl transition-all ${showFocusCam ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'glass opacity-50'}`}
             title="Focus Cam"
          >
            <Camera size={20} />
          </button>
          <button 
             onClick={() => setIsFocused(!isFocused)} 
             className={`p-3 rounded-xl transition-all ${isFocused ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'glass opacity-50'}`}
             title="Distraction Free"
          >
            <Flame size={20} />
          </button>
        </div>
      </div>

      {/* Focus Cam Overlay */}
      <AnimatePresence>
        {showFocusCam && (
          <FocusCam 
            onFocusChange={handleFocusChange}
            onMetricsUpdate={handleMetrics}
            autoPause={autoPauseEnabled}
          />
        )}
      </AnimatePresence>

      {/* Video Content Container */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-2 sm:p-8 pointer-events-auto">
        <div className="relative w-full max-w-5xl aspect-video rounded-2xl sm:rounded-3xl overflow-hidden glass shadow-2xl border border-white/5 bg-black pointer-events-auto">
           <div id="yt-player-embed" ref={containerRef} className="w-full h-full pointer-events-auto" />
           
           {/* Progress overlay */}
           <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
              <motion.div 
                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${watchProgress}%` }}
              />
           </div>
        </div>

        {/* Floating Timer */}
        <AnimatePresence>
          {isFocused && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="absolute top-6 right-6 p-4 rounded-2xl glass backdrop-blur-xl shadow-2xl z-50 flex items-center gap-4 border border-white/10"
            >
               <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Clock size={20} />
               </div>
               <div className="pr-2">
                  <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest leading-none mb-1">Session Left</div>
                  <FocusTimer timeLeft={timeLeft} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notes Area */}
      <AnimatePresence>
        {!isFocused && (
          <motion.div 
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="h-[35vh] bg-neutral-900 border-t border-white/5 p-6 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto space-y-6 pb-12">
               <div className="flex items-center gap-2 mb-4">
                  <StickyNote size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Study Notes</span>
               </div>
               
               <div className="relative group">
                  <input 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Take a quick note..."
                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 ring-indigo-500 outline-none text-sm transition-all"
                  />
                  <button 
                    onClick={addNote}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    <StickyNote size={18} />
                  </button>
               </div>

               <div className="grid gap-2">
                  {notes.map(note => (
                    <button 
                      key={note.id} 
                      onClick={() => seekTo(note.timestamp)}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors text-left"
                    >
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{note.timeLabel}</span>
                          <p className="text-sm font-medium opacity-90">{note.text}</p>
                       </div>
                    </button>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-10 opacity-20 text-[10px] font-bold uppercase tracking-widest">Your study notes will appear here.</div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

