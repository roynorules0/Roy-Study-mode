import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Flame, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  Sparkles, 
  Lock, 
  LayoutDashboard,
  Timer,
  Award,
  CircleDashed,
  Activity,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DisciplineState, AnalyticsData } from '../../types';
import { getDisciplineCoaching } from '../../services/disciplineService';

interface AIDisciplineEngineProps {
  apiKey?: string;
  analytics: AnalyticsData[];
}

const RANKS = [
  { id: 'Beginner', min: 0, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  { id: 'Focused', min: 40, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'Consistent', min: 60, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'Elite', min: 80, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'Monk Mode', min: 90, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'Legendary', min: 95, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
] as const;

export default function AIDisciplineEngine({ apiKey, analytics }: AIDisciplineEngineProps) {
  const [discipline, setDiscipline] = useLocalStorage<DisciplineState>('ai-discipline-v1', {
    score: 74,
    stability: 88,
    rank: 'Consistent',
    habits: [
      { id: '1', name: '6 AM Wake Up', streak: 5, completedToday: true },
      { id: '2', name: 'Deep Work (2h)', streak: 12, completedToday: false },
      { id: '3', name: 'Formula Revision', streak: 8, completedToday: true },
    ],
    promises: ['Finish Chapter 4', 'No YouTube Shorts'],
    lastReview: Date.now()
  });

  const [coachMsg, setCoachMsg] = useState({
    text: "Consistent growth detected. Momentum break mat hone dena! 🔥",
    action: "Complete today's Deep Work goal.",
    status: 'stable'
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const syncDiscipline = async () => {
    if (!apiKey) return;
    setIsSyncing(true);
    try {
      const res = await getDisciplineCoaching(apiKey, discipline, analytics);
      setCoachMsg({ text: res.text, action: res.actionItem, status: res.status });
      // Calculate score based on habits (simple mock logic)
      const completedCount = discipline.habits.filter(h => h.completedToday).length;
      const newScore = Math.min(100, Math.floor((completedCount / discipline.habits.length) * 100));
      
      const newRank = RANKS.slice().reverse().find(r => newScore >= r.min)?.id || 'Beginner';
      
      setDiscipline({ ...discipline, score: newScore, rank: newRank as any });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleHabit = (id: string) => {
    setDiscipline({
      ...discipline,
      habits: discipline.habits.map(h => 
        h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h
      )
    });
  };

  const currentRank = RANKS.find(r => r.id === discipline.rank) || RANKS[0];

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Discipline Engine</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-rose-400">
              <ShieldCheck size={10} /> Neural Habit Regulation
           </p>
        </div>
        <button 
          onClick={syncDiscipline}
          disabled={isSyncing}
          className="p-3 rounded-2xl glass border border-white/5 text-rose-500 active:scale-90 transition-all"
        >
           {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <TrendingUp size={18} />}
        </button>
      </header>

      {/* Main Score & Rank Card */}
      <section className="p-8 rounded-[3rem] glass border border-rose-500/10 relative overflow-hidden flex flex-col items-center gap-6 shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <ShieldCheck size={120} />
         </div>

         <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
               <circle cx="50%" cy="50%" r="44%" className="stroke-white/5 fill-none" strokeWidth="8" />
               <motion.circle 
                 cx="50%" cy="50%" r="44%" 
                 className="stroke-rose-500 fill-none" 
                 strokeWidth="8" 
                 strokeLinecap="round"
                 initial={{ strokeDasharray: "100, 100", strokeDashoffset: 100 }}
                 animate={{ strokeDashoffset: 100 - discipline.score }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
               />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="text-4xl font-black italic tracking-tighter leading-none">{discipline.score}%</div>
               <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-1">Discipline</div>
            </div>
         </div>

         <div className="text-center space-y-2 z-10 w-full">
            <div className={cn(
               "inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-current transition-colors",
               currentRank.color,
               currentRank.bg
            )}>
               Rank: {discipline.rank}
            </div>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest pt-2">
               Stability: {discipline.stability}% | Trend: {coachMsg.status.toUpperCase()}
            </p>
         </div>
      </section>

      {/* AI Coach Feedback */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400">
                <Sparkles size={12} /> AI Consistency Coach
             </div>
             <Activity size={12} className="opacity-20" />
          </div>
          <div className="space-y-4">
             <p className="text-xs font-black italic uppercase tracking-tight leading-relaxed pr-4">
                "{coachMsg.text}"
             </p>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Next: {coachMsg.action}</span>
                </div>
                <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-all" />
             </div>
          </div>
      </section>

      {/* Habit Tracker */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Habit Chains</h3>
            <span className="text-[10px] font-black opacity-20 uppercase">Core Routines</span>
         </div>
         <div className="space-y-2">
            {discipline.habits.map(habit => (
              <button 
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={cn(
                  "w-full p-5 rounded-[2rem] glass border transition-all flex items-center justify-between group",
                  habit.completedToday ? "border-emerald-500/20 bg-emerald-500/5 opacity-60 scale-[0.98]" : "border-white/5"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      habit.completedToday ? "bg-emerald-500 text-white" : "bg-white/5 text-white/20 group-hover:bg-white/10"
                    )}>
                       {habit.completedToday ? <CheckCircle2 size={18} /> : <CircleDashed size={18} />}
                    </div>
                    <div className="text-left">
                       <h4 className="text-xs font-black uppercase italic tracking-tight">{habit.name}</h4>
                       <div className="flex items-center gap-2 mt-0.5">
                          <Flame size={10} className={habit.streak > 0 ? "text-orange-500" : "text-zinc-600"} />
                          <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{habit.streak} Day Streak</span>
                       </div>
                    </div>
                 </div>
                 {habit.completedToday && <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Done</span>}
              </button>
            ))}
         </div>
      </section>

      {/* Recovery & Accountability */}
      <section className="grid grid-cols-2 gap-3">
         <button className="p-6 rounded-[2.5rem] glass border border-white/5 flex flex-col items-center gap-3 text-center active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
               <AlertTriangle size={20} />
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-tight">Recovery Mode</h4>
               <p className="text-[8px] font-bold opacity-30 mt-0.5">Rebuild Momentum</p>
            </div>
         </button>
         <button className="p-6 rounded-[2.5rem] glass border border-white/5 flex flex-col items-center gap-3 text-center active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
               <Lock size={20} />
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-tight">Focus Lock</h4>
               <p className="text-[8px] font-bold opacity-30 mt-0.5">Minimal UI Only</p>
            </div>
         </button>
      </section>

      {/* Accountability Promises */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
             <Target size={12} className="text-rose-500" /> Daily Accountability
          </div>
          <div className="space-y-2">
             {discipline.promises.map((p, i) => (
               <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-tight opacity-70 italic">"{p}"</span>
               </div>
             ))}
             <button className="w-full py-3 rounded-xl border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                Add Promise
             </button>
          </div>
      </section>

      {/* Integrity HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30 text-rose-400">
               <ShieldCheck size={12} /> Neural Integrity
            </div>
            <div className="flex gap-1">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="w-6 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
               ))}
            </div>
         </div>
         <div className="text-right">
            <div className="text-3xl font-black italic tracking-tighter leading-none">A+</div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Consistency Rating</div>
         </div>
      </section>
    </div>
  );
}
