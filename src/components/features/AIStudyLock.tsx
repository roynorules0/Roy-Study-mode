import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Flame, 
  Timer, 
  Target, 
  Sparkles, 
  Zap, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  History,
  CircleDashed,
  ArrowRight,
  ChevronRight,
  Award,
  Maximize2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { StudyLockState } from '../../types';
import { getLockCoachResponse } from '../../services/lockService';

interface AIStudyLockProps {
  apiKey?: string;
}

export default function AIStudyLock({ apiKey }: AIStudyLockProps) {
  const [state, setState] = useLocalStorage<StudyLockState>('ai-study-lock-v1', {
    isActive: false,
    startTime: null,
    durationMinutes: 45,
    goal: 'Biology Plant Physiology Revision',
    focusScore: 95,
    completedSessions: 8,
    totalFocusTime: 420,
    aiCoaching: "Mission complete hone tak focus mode active hai 🔥"
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [inputGoal, setInputGoal] = useState(state.goal);
  const [inputDuration, setInputDuration] = useState(state.durationMinutes);
  const [distractionCount, setDistractionCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.isActive && state.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.startTime!) / 1000);
        const remaining = (state.durationMinutes * 60) - elapsed;
        
        if (remaining <= 0) {
          completeSession();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      timerRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [state.isActive]);

  // Simulated distraction detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && state.isActive) {
        setDistractionCount(prev => prev + 1);
        handleAIResponse('distraction');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isActive]);

  const handleAIResponse = async (context: any) => {
    if (!apiKey) return;
    try {
      const res = await getLockCoachResponse(apiKey, state, context);
      setState(prev => ({ ...prev, aiCoaching: res }));
    } catch (err) {
      console.error(err);
    }
  };

  const startLock = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const newState = {
      ...state,
      isActive: true,
      startTime: Date.now(),
      goal: inputGoal,
      durationMinutes: inputDuration
    };
    setState(newState);
    setTimeLeft(inputDuration * 60);
    await handleAIResponse('activation');
    setIsSyncing(false);
  };

  const completeSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => ({
      ...prev,
      isActive: false,
      startTime: null,
      completedSessions: prev.completedSessions + 1,
      totalFocusTime: prev.totalFocusTime + prev.durationMinutes
    }));
    await handleAIResponse('completion');
  };

  const emergencyUnlock = async () => {
    if (window.confirm("Discipline penalty will be applied (XP & Aura damage). Sure?")) {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(prev => ({
        ...prev,
        isActive: false,
        startTime: null,
        focusScore: Math.max(0, prev.focusScore - 15)
      }));
      await handleAIResponse('emergency');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Study Lock Mode</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <ShieldAlert size={10} /> Distraction Shield v4
           </p>
        </div>
        <div className="flex gap-2">
           <div className="p-3 rounded-2xl glass border border-white/5 text-indigo-400 font-black text-xs">
              {state.focusScore}% Aura
           </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!state.isActive ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 px-1"
          >
             {/* Configuration Card */}
             <section className="p-8 rounded-[3.5rem] glass border border-indigo-500/10 space-y-8">
                <div className="size-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20">
                   <Lock size={32} className="text-indigo-400" />
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase opacity-30 ml-4 tracking-[0.2em]">Mission Objective</label>
                      <input 
                        type="text"
                        value={inputGoal}
                        onChange={(e) => setInputGoal(e.target.value)}
                        placeholder="Enter Study Goal..."
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-xs font-bold focus:outline-none focus:border-indigo-500/50 transition-all italic"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase opacity-30 ml-4 tracking-[0.2em]">Temporal Lock (Minutes)</label>
                      <div className="flex gap-2">
                         {[25, 45, 60, 90].map(min => (
                           <button 
                             key={min}
                             onClick={() => setInputDuration(min)}
                             className={cn(
                               "flex-1 py-3 rounded-xl text-[10px] font-black transition-all",
                               inputDuration === min ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 text-white/40"
                             )}
                           >
                              {min}m
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={startLock}
                  disabled={isSyncing}
                  className="w-full py-6 bg-indigo-600 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                   {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                   Engage Focus Lock
                </button>
             </section>

             {/* Stats Footer */}
             <div className="grid grid-cols-2 gap-3">
                <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-2">
                   <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Successful Syncs</div>
                   <div className="text-2xl font-black italic">{state.completedSessions}</div>
                </div>
                <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-2">
                   <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Total Focus hrs</div>
                   <div className="text-2xl font-black italic">{Math.round(state.totalFocusTime / 60)}h</div>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black p-6 flex flex-col items-center justify-center space-y-12"
          >
             {/* Immersion Background */}
             <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500 rounded-full blur-[150px]" />
                <div className="grid grid-cols-10 gap-1 opacity-20 h-full w-full">
                   {Array.from({ length: 100 }).map((_, i) => (
                      <motion.div 
                         key={i}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: Math.random() }}
                         transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.01 }}
                         className="aspect-square bg-indigo-400/10 rounded-sm"
                      />
                   ))}
                </div>
             </div>

             {/* HUD Header */}
             <div className="w-full flex justify-between items-start z-10">
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Shield Active</span>
                   </div>
                   <h3 className="text-xs font-black opacity-40 uppercase tracking-widest">Distraction Level: {distractionCount} Critical</h3>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Goal Status</div>
                   <div className="text-[10px] font-black italic uppercase text-indigo-400">{state.goal}</div>
                </div>
             </div>

             {/* Timer Matrix */}
             <div className="relative group z-10 py-12">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full group-hover:scale-125 transition-all duration-700" />
                <motion.div 
                   className="text-[120px] font-black italic tracking-tighter leading-none text-white transition-all"
                   animate={{ scale: [1, 1.02, 1] }}
                   transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                   {formatTime(timeLeft)}
                </motion.div>
                <div className="text-center text-[10px] font-black opacity-20 uppercase tracking-[1em] mt-4 ml-4">Temporal Lock</div>
             </div>

             {/* AI Coach HUD */}
             <motion.div 
                key={state.aiCoaching}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl z-10 w-full max-w-sm text-center"
             >
                <div className="flex justify-center gap-2 mb-4">
                   <Sparkles size={16} className="text-indigo-400" />
                   <div className="text-[8px] font-black uppercase tracking-widest opacity-30">Neural Coach Feedback</div>
                </div>
                <p className="text-sm font-black italic uppercase tracking-tight leading-relaxed text-indigo-100">
                   "{state.aiCoaching}"
                </p>
             </motion.div>

             {/* Emergency Exit */}
             <div className="z-10 flex flex-col items-center gap-6">
                <div className="flex gap-4">
                   <div className="flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/5">
                      <Activity size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black italic uppercase">{state.focusScore}% Stability</span>
                   </div>
                </div>
                <button 
                   onClick={emergencyUnlock}
                   className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-rose-500 transition-colors"
                >
                   Emergency Post-Halt Unlock
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistence Grid */}
      {!state.isActive && (
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4 mx-1">
           <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
                 Shield Integrity
              </div>
              <div className="flex gap-1 h-4 items-end">
                 {Array.from({ length: 15 }).map((_, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ height: 2 }}
                     animate={{ height: Math.random() * 16 + 4 }}
                     transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.08 }}
                     className={cn(
                       "w-1 rounded-full",
                       i > 10 ? "bg-indigo-500 shadow-[0_0_8px_#6366f1]" : "bg-white/10"
                     )} 
                   />
                 ))}
              </div>
           </div>
           <div className="text-right flex flex-col justify-end">
              <div className="text-3xl font-black italic tracking-tighter leading-none text-white/80">
                 {state.completedSessions}
              </div>
              <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Validated Logs</div>
           </div>
        </section>
      )}

      {/* Rewards HUD */}
      {!state.isActive && (
        <section className="px-1 space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 italic">
                 <Award size={12} className="text-indigo-400" /> Discipline Rewards
              </h3>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="p-5 rounded-[2.2rem] glass border border-white/5 flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Zap size={20} />
                 </div>
                 <div>
                    <div className="text-[9px] font-black uppercase tracking-tight text-white/80">XP Multiplier</div>
                    <div className="text-[7px] font-black opacity-20 uppercase mt-0.5">X2 Focus Passive</div>
                 </div>
              </div>
              <div className="p-5 rounded-[2.2rem] glass border border-white/5 flex items-center gap-4 group opacity-40">
                 <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 border border-white/10">
                    <History size={20} />
                 </div>
                 <div>
                    <div className="text-[9px] font-black uppercase tracking-tight">Focus Badge</div>
                    <div className="text-[7px] font-black opacity-30 mt-0.5">UNLOCKED AT 50H</div>
                 </div>
              </div>
           </div>
        </section>
      )}
    </div>
  );
}
