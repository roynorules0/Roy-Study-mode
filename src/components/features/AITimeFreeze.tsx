import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Timer as TimerIcon, 
  Infinity as InfinityIcon, 
  Shield, 
  Flame, 
  Sparkles, 
  ArrowLeft,
  Lock,
  Unlock,
  Activity,
  History,
  Trophy,
  Snowflake,
  Wind,
  CloudMoon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface FreezeSession {
  id: string;
  duration: number; // in seconds
  timestamp: number;
  mode: string;
  focusDepth: number; // 0-100
  efficiency: number;
}

const MODES = [
  { id: 'monk', label: 'Monk Mode', duration: 45 * 60, desc: 'Pure isolation focus', color: 'from-blue-600 to-indigo-600' },
  { id: 'deep', label: '90m Deep Work', duration: 90 * 60, desc: 'Maximum cognitive load', color: 'from-indigo-600 to-purple-600' },
  { id: 'blitz', label: 'Ultra Focus', duration: 25 * 60, desc: 'Rapid execution burst', color: 'from-cyan-600 to-blue-600' },
  { id: 'marathon', label: 'Marathon', duration: 120 * 60, desc: 'Endurance study session', color: 'from-slate-600 to-slate-900' }
];

export default function AITimeFreeze() {
  const [isActive, setIsActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration);
  const [gameState, setGameState] = useState<'lobby' | 'active' | 'summary'>('lobby');
  const [history, setHistory] = useLocalStorage<FreezeSession[]>('ai-time-freeze-history', []);
  const [commentary, setCommentary] = useState('');
  const [flowState, setFlowState] = useState(0); // 0-100
  const [startTime, setStartTime] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startFreeze = () => {
    setIsActive(true);
    setGameState('active');
    setTimeLeft(selectedMode.duration);
    setStartTime(Date.now());
    setFlowState(0);
    setDistractionCount(0);
    setCommentary("Time freeze successful! Ab sirf focus exist karta hai. ⚡");
  };

  const endFreeze = useCallback((completed: boolean = true) => {
    setIsActive(false);
    setGameState('summary');
    if (timerRef.current) clearInterval(timerRef.current);

    if (completed) {
      const elapsed = selectedMode.duration;
      const focusDepth = Math.max(0, 100 - (distractionCount * 10));
      const newSession: FreezeSession = {
        id: Math.random().toString(36).substr(2, 9),
        duration: elapsed,
        timestamp: Date.now(),
        mode: selectedMode.label,
        focusDepth,
        efficiency: Math.round((focusDepth + (flowState / 1.5)) / 2)
      };
      setHistory([newSession, ...history]);
      setCommentary("Deep work state complete. Massive productivity gain detected! 👑");
    } else {
      setCommentary("Session interrupted. Neural focus broken. ⚠️");
    }
  }, [selectedMode, history, distractionCount, flowState, setHistory]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        // Slowly increase flow state during active session if not distracted
        setFlowState(prev => Math.min(100, prev + 0.1));
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      endFreeze(true);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, endFreeze]);

  // Handle visibility change as distraction detector
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setDistractionCount(prev => prev + 1);
        setFlowState(prev => Math.max(0, prev - 10));
        setCommentary("Distraction detected! Stay in the zone. ⚠️");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "min-h-screen bg-[#050505] text-white p-4 pb-24 font-sans transition-all duration-1000",
      isActive ? "bg-black" : "bg-[#050505]"
    )}>
      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto space-y-8 pt-8"
          >
            <div className="text-center space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Snowflake size={12} /> Neural Immersion
               </div>
               <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-br from-white via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  Time<br/>Freeze
               </h1>
               <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Ultra-immersive deep work simulator</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {MODES.map((mode) => (
                 <button
                   key={mode.id}
                   onClick={() => setSelectedMode(mode)}
                   className={cn(
                     "p-6 rounded-[2.5rem] border text-left transition-all relative overflow-hidden group",
                     selectedMode.id === mode.id 
                       ? "bg-blue-600/10 border-blue-500/50" 
                       : "bg-white/5 border-white/5 opacity-60"
                   )}
                 >
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <TimerIcon size={80} />
                   </div>
                   <div className="flex justify-between items-start mb-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedMode.id === mode.id ? "bg-blue-500 text-black shadow-lg shadow-blue-500/40" : "bg-white/5")}>
                         <Zap size={24} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest opacity-40">{Math.floor(mode.duration / 60)} MIN</span>
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">{mode.label}</h3>
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{mode.desc}</p>
                 </button>
               ))}
            </div>

            <button 
              onClick={startFreeze}
              className="w-full py-6 rounded-3xl bg-blue-500 text-black font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
               Activate Time Freeze
            </button>

            {history.length > 0 && (
              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest opacity-40 px-2 flex items-center gap-2">
                   <History size={14} /> Focus Archive
                 </h3>
                 <div className="space-y-3">
                    {history.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                               <Wind size={18} />
                            </div>
                            <div>
                               <div className="text-sm font-black italic uppercase tracking-tighter">{Math.floor(session.duration / 60)}m {session.mode}</div>
                               <div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{new Date(session.timestamp).toLocaleDateString()}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-xs font-black text-blue-400 italic">{session.efficiency}% Score</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'active' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
             {/* Background Particles (Subtle) */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      y: [-20, window.innerHeight + 20],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: Math.random() * 5 + 5, 
                      repeat: Infinity, 
                      ease: 'linear',
                      delay: Math.random() * 5
                    }}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{ left: `${Math.random() * 100}%`, top: -20 }}
                  />
                ))}
             </div>

             <div className="relative space-y-12 max-w-lg w-full">
                <div className="space-y-4">
                   <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.3em]"
                   >
                      <Lock size={14} /> Time Freeze Active
                   </motion.div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter opacity-40">Reality is suspended</h2>
                </div>

                <div className="relative flex items-center justify-center">
                   <motion.div 
                    animate={{ scale: [1, 1.02, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute w-96 h-96 bg-blue-500 rounded-full blur-[100px]"
                   />
                   <div className="text-[clamp(4rem,30vw,12rem)] font-black italic tracking-tighter leading-none tabular-nums select-none opacity-80 mix-blend-overlay">
                      {formatTime(timeLeft)}
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-center justify-center gap-12">
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Flow Depth</div>
                        <div className="text-3xl font-black italic text-blue-400">{Math.round(flowState)}%</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Distractions</div>
                        <div className="text-3xl font-black italic text-rose-500">{distractionCount}</div>
                      </div>
                   </div>

                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                         <Sparkles size={24} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                         <div className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1">AI Focus Stream</div>
                         <p className="text-sm font-bold text-white/80 italic animate-pulse">"{commentary}"</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => endFreeze(false)}
                  className="px-8 py-4 rounded-3xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all"
                >
                   Release Reality
                </button>
             </div>
          </motion.div>
        )}

        {gameState === 'summary' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-8 pt-8"
          >
             <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-[2rem] bg-blue-500 mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40 relative rotate-3">
                   <Trophy size={48} className="text-black -rotate-3" />
                </div>
                <div className="space-y-1">
                   <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Session Impact</h2>
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Neural focus archived</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                   <div className="text-3xl font-black italic tracking-tighter text-blue-400">{Math.floor(selectedMode.duration / 60)}m</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Time Frozen</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                   <div className="text-3xl font-black italic tracking-tighter text-cyan-400">{Math.max(0, 100 - (distractionCount * 10))}%</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Focus Depth</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                   <div className="text-3xl font-black italic tracking-tighter text-indigo-400">{Math.round(flowState)}%</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Flow Integration</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                   <div className="flex items-center gap-1 text-emerald-400 font-black italic text-xl">
                      <Shield size={16} /> ELITE
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</div>
                </div>
             </div>

             <div className="p-6 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                <div className="flex items-center gap-3">
                   <Activity className="text-indigo-400" size={24} />
                   <h4 className="text-xs font-black uppercase tracking-widest">Session Commentary</h4>
                </div>
                <p className="text-sm font-bold text-white/80 italic leading-relaxed">
                  "{commentary}"
                </p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[9px] font-bold text-indigo-300">#NeuralGains</span>
                   <span className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[9px] font-bold text-indigo-300">#MonkSession</span>
                </div>
             </div>

             <div className="space-y-3">
                <button 
                  onClick={() => setGameState('lobby')}
                  className="w-full py-6 rounded-3xl bg-blue-500 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                   New Session
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 rounded-3xl bg-white/5 text-white font-black uppercase tracking-widest text-[9px] border border-white/10"
                >
                   Return to Reality
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
