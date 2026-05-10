import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  CloudRain, 
  Zap, 
  Moon, 
  Sun, 
  Headphones, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Coffee, 
  CloudLightning, 
  Navigation,
  Sparkles,
  ChevronLeft,
  Settings2,
  Clock,
  Skull,
  Activity,
  Award,
  Flame,
  Brain,
  Monitor,
  Library as LibraryIcon,
  Tent,
  Rocket,
  Wind
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { FocusRoomPreferences, FocusSessionStats, UserStats } from '../../types';

interface FocusRoomProps {
  timeLeft: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: (duration: number) => void;
  onExit: () => void;
  onXPGain?: (amount: number, reason: string) => void;
}

const ROOMS = [
  { id: 'cyber', name: 'Cyber Neon', icon: <Monitor size={20} />, bg: 'bg-[#050505]', accent: 'text-indigo-500', 
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
    overlay: 'bg-indigo-900/10' },
  { id: 'rain', name: 'Rain Study', icon: <CloudRain size={20} />, bg: 'bg-[#0a0a0f]', accent: 'text-blue-400',
    img: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80',
    overlay: 'bg-blue-900/10' },
  { id: 'anime', name: 'Anime Night', icon: <Navigation size={20} />, bg: 'bg-[#0f0a14]', accent: 'text-purple-400',
    img: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80',
    overlay: 'bg-purple-900/10' },
  { id: 'library', name: 'Silent Library', icon: <LibraryIcon size={20} />, bg: 'bg-[#0f0d0a]', accent: 'text-amber-600',
    img: 'https://images.unsplash.com/photo-1507733108721-c010c88883e3?auto=format&fit=crop&q=80',
    overlay: 'bg-amber-900/5' },
  { id: 'monk', name: 'Dark Monk', icon: <Tent size={20} />, bg: 'bg-[#050505]', accent: 'text-gray-400',
    img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80',
    overlay: 'bg-black/40' },
  { id: 'space', name: 'Deep Space', icon: <Rocket size={20} />, bg: 'bg-[#000005]', accent: 'text-cyan-400',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
    overlay: 'bg-cyan-900/10' }
];

const SOUNDS = [
  { id: 'rain', name: 'Steady Rain', icon: <CloudRain size={16} />, url: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'thunder', name: 'Deep Thunder', icon: <CloudLightning size={16} />, url: 'https://www.soundjay.com/nature/thunder-01.mp3' },
  { id: 'cafe', name: 'Paris Cafe', icon: <Coffee size={16} />, url: 'https://www.soundjay.com/ambient/cafe-ambience-1.mp3' },
  { id: 'whiteNoise', name: 'Static Noise', icon: <Wind size={16} />, url: 'https://www.soundjay.com/ambient/white-noise-1.mp3' },
  { id: 'typing', name: 'Mechanical', icon: <Activity size={16} />, url: 'https://www.soundjay.com/ambient/keyboard-typing-1.mp3' },
  { id: 'lofi', name: 'Lofi Beats', icon: <Headphones size={16} />, url: 'https://stream.zeno.fm/f3v5u8p7uunuv' }
];

const HINGLISH_FEEDBACK = [
  "Aaj ka focus dangerous tha 🔥",
  "Phone distraction kam karo ⚡",
  "Deep work level improve ho raha hai 👑",
  "Ek dum solid concentration hai. You're a beast!",
  "Consistency hi real secret hai, lage raho! 🚀",
  "Bas break mat lena, goal bohot paas hai."
];

export default function FocusRoom({ 
  timeLeft, 
  isActive, 
  onPause, 
  onResume, 
  onReset, 
  onExit,
  onXPGain
}: FocusRoomProps) {
  const [prefs, setPrefs] = useLocalStorage<FocusRoomPreferences>('focus-room-prefs', {
    currentRoom: 'cyber',
    ambientSounds: {
      rain: 0,
      thunder: 0,
      cafe: 0,
      whiteNoise: 0,
      typing: 0,
      lofi: 0
    },
    deepWorkMode: false,
    unlockedRooms: ['cyber', 'rain', 'anime', 'library']
  });

  const [sessionHistory, setSessionHistory] = useLocalStorage<FocusSessionStats[]>('focus-session-history', []);
  const [userStats, setUserStats] = useLocalStorage<UserStats>('user-stats', { xp: 0, level: 1, streak: 0 });
  
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const [focusPulse, setFocusPulse] = useState(1);

  // Audio Refs
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    SOUNDS.forEach(s => {
      if (!audioRefs.current[s.id]) {
        const audio = new Audio(s.url);
        audio.loop = true;
        audioRefs.current[s.id] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach(a => a.pause());
    };
  }, []);

  // Update volumes
  useEffect(() => {
    Object.entries(prefs.ambientSounds).forEach(([id, vol]) => {
      const audio = audioRefs.current[id];
      if (audio) {
        audio.volume = isMuted ? 0 : vol / 100;
        if (vol > 0 && isActive && !isMuted) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
    });
  }, [prefs.ambientSounds, isActive, isMuted]);

  // Focus Detector
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isActive) {
        setWarningCount(prev => prev + 1);
        setShowWarning("Distraction detected! Stay locked in ⚠️");
        setTimeout(() => setShowWarning(null), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive]);

  const currentRoom = useMemo(() => ROOMS.find(r => r.id === prefs.currentRoom) || ROOMS[0], [prefs.currentRoom]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSoundChange = (id: string, vol: number) => {
    setPrefs(prev => ({
      ...prev,
      ambientSounds: { ...prev.ambientSounds, [id]: vol }
    }));
  };

  const toggleDeepWork = () => {
    setPrefs(prev => ({ ...prev, deepWorkMode: !prev.deepWorkMode }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("fixed inset-0 z-[1000] flex flex-col font-sans text-white overflow-hidden gpu", currentRoom.bg)}
    >
      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={prefs.currentRoom}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 bg-cover bg-center grayscale contrast-[1.2] brightness-50"
          style={{ backgroundImage: `url(${currentRoom.img})` }}
        />
      </AnimatePresence>

      <div className={cn("absolute inset-0 z-[1] pointer-events-none transition-colors duration-1000", currentRoom.overlay)} />

      {/* Floating Particles/FX */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-white/20 rounded-full blur-[2px]"
          />
        ))}
      </div>

      {/* Header HUD */}
      {!prefs.deepWorkMode && (
        <header className="relative z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onExit} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Neural Link</div>
              <div className="text-sm font-black italic uppercase tracking-tighter text-indigo-400">{currentRoom.name}</div>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn("p-3 rounded-2xl glass transition-all border", showSettings ? "bg-indigo-500 border-indigo-400" : "bg-white/5 border-white/10")}
            >
              <Settings2 size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Main Focus Stage */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-rose-600/90 backdrop-blur-xl border border-rose-400/50 flex items-center gap-3 shadow-2xl z-[100]"
            >
              <Skull size={18} className="text-white animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">{showWarning}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative mb-8"
        >
          {/* Animated Timer Ring */}
          <svg className="w-72 h-72 -rotate-90">
             <circle 
               cx="144" cy="144" r="130" 
               fill="none" stroke="currentColor" strokeWidth="2" 
               className="text-white/10"
             />
             <motion.circle 
               cx="144" cy="144" r="130" 
               fill="none" stroke="currentColor" strokeWidth="6" 
               className={cn("transition-colors duration-1000", currentRoom.accent)} 
               strokeDasharray="816" 
               initial={{ strokeDashoffset: 816 }}
               animate={{ strokeDashoffset: 816 * (timeLeft / (25 * 60)) }}
               transition={{ duration: 1, ease: 'linear' }}
               strokeLinecap="round"
               style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <motion.div 
              id="focus-timer-text"
              className="text-[5.5rem] font-black italic tracking-tighter tabular-nums leading-none drop-shadow-2xl"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="flex items-center gap-2 mt-1 opacity-40">
               <Brain size={12} />
               <span className="text-[9px] font-black uppercase tracking-[0.4em]">Synapse Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-5">
           <button 
             onClick={isActive ? onPause : onResume}
             className={cn(
               "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-2",
               isActive 
                ? "bg-rose-500/10 border-rose-500 text-rose-500" 
                : "bg-indigo-500 border-indigo-400 text-white hover:scale-110 active:scale-95"
             )}
           >
             {isActive ? <VolumeX size={28} /> : <Zap size={28} fill="currentColor" />}
           </button>
           
           <button 
             onClick={toggleDeepWork}
             className={cn(
               "h-14 px-6 rounded-full font-black uppercase tracking-[0.3em] text-[9px] transition-all border",
               prefs.deepWorkMode 
                ? "bg-white text-black border-white" 
                : "bg-white/5 border-white/10 hover:bg-white/10"
             )}
           >
             {prefs.deepWorkMode ? "EXIT DEEP" : "ENTER DEEP"}
           </button>
        </div>

        {/* Dynamic Insight Banner */}
        <AnimatePresence>
          {!prefs.deepWorkMode && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 p-6 rounded-[2.5rem] glass-light border border-white/5 max-w-sm w-full flex items-center gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div className="text-left space-y-1">
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Neural Insight</div>
                <div className="text-sm font-black italic tracking-tight text-white/90">
                  {warningCount === 0 ? "Perfect Focus Active 🔥" : `Avoid distractions. Level 👑`}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0a] rounded-t-[4rem] border-t border-white/10 p-8 pt-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            
            <div className="space-y-10">
              {/* Room Selection */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 px-4">Neural Environments</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ROOMS.map(room => (
                    <button 
                      key={room.id}
                      onClick={() => setPrefs(prev => ({ ...prev, currentRoom: room.id as any }))}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-3 group relative overflow-hidden",
                        prefs.currentRoom === room.id 
                          ? "bg-indigo-500/10 border-indigo-500 shadow-lg" 
                          : "bg-white/5 border-transparent hover:bg-white/10"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-2xl", prefs.currentRoom === room.id ? "bg-indigo-500 text-white" : "bg-white/5 opacity-40")}>
                        {room.icon}
                      </div>
                      <div className="relative z-10 text-left">
                        <div className="text-[11px] font-black uppercase tracking-tight">{room.name}</div>
                        <div className="text-[9px] opacity-30 font-bold uppercase">Linked Environment</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Sound Mix Selection */}
              <section className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Audio Link Mixer</h3>
                  <button onClick={() => setIsMuted(!isMuted)} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
                <div className="grid gap-3">
                  {SOUNDS.map(sound => (
                    <div key={sound.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-6">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all", (prefs.ambientSounds as any)[sound.id] > 0 ? "bg-indigo-500 text-white" : "bg-white/10 opacity-30")}>
                        {sound.icon}
                      </div>
                      <div className="flex-1 space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black uppercase tracking-widest">{sound.name}</span>
                            <span className="text-[10px] font-bold opacity-30 tabular-nums">{(prefs.ambientSounds as any)[sound.id]}%</span>
                         </div>
                         <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           value={(prefs.ambientSounds as any)[sound.id]} 
                           onChange={(e) => handleSoundChange(sound.id, parseInt(e.target.value))}
                           className="w-full h-1.5 bg-white/5 rounded-full accent-indigo-500 appearance-none"
                         />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
              >
                Confirm Calibration
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 p-8 flex justify-center items-center gap-6 opacity-20 pointer-events-none">
         <p className="text-[10px] font-black uppercase tracking-[0.6em]">Astro Core v4.2.0 • Immersive Focus Sync</p>
      </footer>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
