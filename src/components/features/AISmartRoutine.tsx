import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Clock, 
  Calendar, 
  Brain, 
  Activity, 
  Flame, 
  Target, 
  Sparkles, 
  ChevronRight, 
  Shield, 
  Moon, 
  Sun, 
  Coffee, 
  Dumbbell,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  History,
  BarChart3,
  Settings,
  CircleDashed,
  Timer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SmartRoutineState, RoutineSession, RoutineMode } from '../../types';
import { generateSmartRoutine, analyzeRoutineProductivity } from '../../services/routineService';

interface AISmartRoutineProps {
  apiKey?: string;
}

const MODE_CONFIG: Record<RoutineMode, { label: string; icon: any; color: string; bg: string }> = {
  Monk: { label: 'Monk Mode', icon: <Shield size={16} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  Balanced: { label: 'Balanced', icon: <Activity size={16} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Hardcore: { label: 'Hardcore', icon: <Flame size={16} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Exam Rush': { label: 'Exam Rush', icon: <Target size={16} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  Recovery: { label: 'Recovery', icon: <RotateCcw size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10' }
};

const SESSION_TYPE_CONFIG = {
  'deep-work': { icon: <Brain size={14} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  'revision': { icon: <RotateCcw size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'break': { icon: <Coffee size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'mock-test': { icon: <Target size={14} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  'recovery': { icon: <Activity size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'personal': { icon: <Sun size={14} />, color: 'text-white/60', bg: 'bg-white/5' }
};

export default function AISmartRoutine({ apiKey }: AISmartRoutineProps) {
  const [state, setState] = useLocalStorage<SmartRoutineState>('ai-smart-routine-v1', {
    routine: [
      { id: '1', startTime: '06:00', endTime: '08:00', label: 'Morning Deep Work', type: 'deep-work', subject: 'Physics', isCompleted: true },
      { id: '2', startTime: '08:30', endTime: '10:30', label: 'Inorganic Chem Boost', type: 'deep-work', subject: 'Chemistry', isCompleted: false },
      { id: '3', startTime: '11:00', endTime: '12:00', label: 'Rapid Revision', type: 'revision', isCompleted: false },
      { id: '4', startTime: '12:00', endTime: '13:00', label: 'Lunch & Reset', type: 'break', isCompleted: false },
      { id: '5', startTime: '14:00', endTime: '16:00', label: 'Maths Problem Set', type: 'deep-work', subject: 'Maths', isCompleted: false }
    ],
    mode: 'Balanced',
    preferences: {
      wakeUpTime: '06:00',
      sleepTime: '23:00',
      dailyGoals: ['Solve 50 Physics MCQs', 'Watch 2 Organic Lectures'],
      weakSubjects: ['Inorganic Chemistry', 'Calculus']
    },
    completionRate: 20,
    disciplineLevel: 68,
    aiFeedback: "Morning flow strong hai bhai, Inorganic session miss mat karna! 🔥",
    lastAnalysis: Date.now()
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = state.routine.length;
    const completed = state.routine.filter(s => s.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [state.routine]);

  // Find current session based on time
  const currentSession = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return state.routine.find(s => {
      const [startH, startM] = s.startTime.split(':').map(Number);
      const [endH, endM] = s.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  }, [state.routine]);

  const generateRoutine = async () => {
    if (!apiKey) return;
    setIsGenerating(true);
    try {
      const res = await generateSmartRoutine(apiKey, state.preferences, state.mode);
      setState({
        ...state,
        routine: res.routine,
        aiFeedback: res.aiFeedback,
        completionRate: 0,
        lastAnalysis: Date.now()
      });
      setShowSettings(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSession = (id: string) => {
    const newRoutine = state.routine.map(s => 
      s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const completed = newRoutine.filter(s => s.isCompleted).length;
    const rate = Math.round((completed / newRoutine.length) * 100);
    
    setState({
      ...state,
      routine: newRoutine,
      completionRate: rate,
      disciplineLevel: Math.min(100, Math.max(0, state.disciplineLevel + (newRoutine.find(s => s.id === id)?.isCompleted ? -5 : 5)))
    });
  };

  const optimizeRoutine = async () => {
    if (!apiKey || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await analyzeRoutineProductivity(apiKey, state);
      setState({
        ...state,
        aiFeedback: res.feedback,
        lastAnalysis: Date.now()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Smart Routine</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <Timer size={10} /> Neural Schedule Core
           </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={optimizeRoutine}
            disabled={isGenerating}
            className="p-3 rounded-2xl glass border border-white/5 text-indigo-400 active:scale-90 transition-all"
          >
             {isGenerating ? <CircleDashed size={18} className="animate-spin" /> : <Activity size={18} />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-2xl glass border border-white/5 text-white/40 active:scale-90 transition-all"
          >
             <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Status HUD */}
      <section className="p-8 rounded-[3.5rem] glass border border-indigo-500/10 relative overflow-hidden flex flex-col items-center">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <History size={120} />
         </div>

         <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center p-2 relative">
               <motion.div 
                 className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               />
               <div className="text-center">
                  <div className="text-4xl font-black italic tracking-tighter leading-none">{stats.rate}%</div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-1">Daily Sync</div>
               </div>
            </div>
         </div>

         <div className="text-center space-y-4 z-10 w-full px-4">
            <div className="p-4 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20">
               <p className="text-[10px] font-black italic uppercase italic tracking-tight leading-relaxed">
                  "{state.aiFeedback}"
               </p>
            </div>
         </div>
      </section>

      {/* Current Task Widget */}
      {currentSession && (
        <section className="mx-2 p-5 rounded-[2.2rem] bg-gradient-to-br from-indigo-600 to-indigo-900 border border-white/10 shadow-xl shadow-indigo-500/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={60} />
           </div>
           <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Clock size={16} />
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-white/60">Current Session</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 text-[8px] font-black uppercase text-white/80">
                 {currentSession.startTime} - {currentSession.endTime}
              </div>
           </div>
           <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-4">
              {currentSession.label}
           </h3>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleSession(currentSession.id)}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  currentSession.isCompleted ? "bg-emerald-500 text-black" : "bg-white text-black"
                )}
              >
                 {currentSession.isCompleted ? <CheckCircle2 size={12} /> : null}
                 {currentSession.isCompleted ? 'Completed' : 'Finish Session'}
              </button>
              <div className="text-[8px] font-black uppercase text-white/40">
                 Next: {state.routine[state.routine.indexOf(currentSession) + 1]?.label || 'Done'}
              </div>
           </div>
        </section>
      )}

      {/* Routine Roadmap */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Daily Temporal Map</h3>
            <div className="flex gap-1">
               {Object.entries(MODE_CONFIG).map(([mode, config]) => (
                 <button 
                   key={mode}
                   onClick={() => setState({ ...state, mode: mode as RoutineMode })}
                   className={cn(
                     "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                     state.mode === mode ? config.bg + " " + config.color : "bg-white/5 opacity-30"
                   )}
                 >
                    {config.icon}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-3 px-1">
            {state.routine.map((session, index) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-5 rounded-[2rem] glass border relative flex gap-4 transition-all",
                  session.id === currentSession?.id ? "border-indigo-500/30 scale-[1.02]" : "border-white/5",
                  session.isCompleted ? "opacity-40" : "opacity-100"
                )}
              >
                 <div className="flex flex-col items-center gap-1 min-w-[44px]">
                    <span className="text-[9px] font-black text-white/40">{session.startTime}</span>
                    <div className="flex-1 w-px bg-white/10 my-1" />
                    <span className="text-[9px] font-black text-white/40">{session.endTime}</span>
                 </div>

                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase w-fit",
                            SESSION_TYPE_CONFIG[session.type as keyof typeof SESSION_TYPE_CONFIG].bg,
                            SESSION_TYPE_CONFIG[session.type as keyof typeof SESSION_TYPE_CONFIG].color
                          )}>
                             {SESSION_TYPE_CONFIG[session.type as keyof typeof SESSION_TYPE_CONFIG].icon}
                             {session.type}
                          </div>
                          <h4 className="text-xs font-black italic uppercase tracking-tight">{session.label}</h4>
                          {session.subject && (
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{session.subject}</p>
                          )}
                       </div>
                       <button 
                         onClick={() => toggleSession(session.id)}
                         className={cn(
                           "p-3 rounded-xl transition-all",
                           session.isCompleted ? "text-emerald-500 bg-emerald-500/10" : "text-white/10 hover:bg-white/5 hover:text-white/30"
                         )}
                       >
                          <CheckCircle2 size={16} />
                       </button>
                    </div>
                 </div>

                 {session.id === currentSession?.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1">
                       <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                    </div>
                 )}
              </motion.div>
            ))}
         </div>
      </section>

      {/* Analytics Footer */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
               Discipline Bio-Link
            </div>
            <div className="flex gap-1 h-3 items-end">
               {Array.from({ length: 15 }).map((_, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ height: 2 }}
                   animate={{ height: Math.random() * 12 + 4 }}
                   transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                   className={cn(
                     "w-1 rounded-full",
                     i > 10 ? "bg-indigo-500 shadow-[0_0_8px_#6366f1]" : "bg-white/10"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none text-indigo-400">
               {state.disciplineLevel}
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Aura Stability</div>
         </div>
      </section>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-md"
          >
             <motion.div 
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               className="w-full max-w-md bg-[#0a0a0b] rounded-[3rem] border border-white/10 p-8 space-y-6"
             >
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Bio-Preferences</h3>
                   <button onClick={() => setShowSettings(false)} className="text-white/40"><RotateCcw size={20} /></button>
                </div>

                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[8px] font-black uppercase opacity-30 ml-2">Wake Up</label>
                         <input 
                           type="time" 
                           value={state.preferences.wakeUpTime}
                           onChange={(e) => setState({ ...state, preferences: { ...state.preferences, wakeUpTime: e.target.value }})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[8px] font-black uppercase opacity-30 ml-2">Sleep Target</label>
                         <input 
                           type="time" 
                           value={state.preferences.sleepTime}
                           onChange={(e) => setState({ ...state, preferences: { ...state.preferences, sleepTime: e.target.value }})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold" 
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase opacity-30 ml-2">Weak Subjects (CSV)</label>
                      <input 
                        type="text" 
                        placeholder="Physics, Organic..." 
                        value={state.preferences.weakSubjects.join(', ')}
                        onChange={(e) => setState({ ...state, preferences: { ...state.preferences, weakSubjects: e.target.value.split(',').map(s => s.trim()) }})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold" 
                      />
                   </div>
                </div>

                <button 
                  onClick={generateRoutine}
                  disabled={isGenerating}
                  className="w-full py-5 bg-indigo-600 rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                   {isGenerating ? <CircleDashed size={18} className="animate-spin" /> : <Sparkles size={18} />}
                   {isGenerating ? 'Recalculating...' : 'Construct New Routine'}
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
