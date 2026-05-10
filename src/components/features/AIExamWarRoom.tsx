import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sword, 
  ShieldAlert, 
  Target, 
  Clock, 
  Flame, 
  AlertTriangle, 
  TrendingUp, 
  Skull,
  Radio,
  Trophy,
  ChevronRight,
  RefreshCw,
  Timer,
  Moon,
  Wind
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ExamWarRoomData, AnalyticsData, Task, UserStats } from '../../types';
import { generateWarStrategy } from '../../services/warRoomService';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

interface AIExamWarRoomProps {
  apiKey?: string;
  stats: UserStats;
  analytics: AnalyticsData[];
  tasks: Task[];
}

const EXAMS = [
  { id: 'neet', name: 'NEET 2026', date: '2026-05-04' },
  { id: 'jee', name: 'JEE Advanced', date: '2026-05-25' }
];

export default function AIExamWarRoom({ apiKey, stats, analytics, tasks }: AIExamWarRoomProps) {
  const [data, setData] = useLocalStorage<ExamWarRoomData | null>('war-room-data-v1', null);
  const [isActivating, setIsActivating] = useState(false);
  const [panicAlert, setPanicAlert] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);

  const countdowns = useMemo(() => {
    const now = new Date();
    return EXAMS.map(exam => {
      const target = new Date(exam.date);
      const days = differenceInDays(target, now);
      const hours = differenceInHours(target, now) % 24;
      const mins = differenceInMinutes(target, now) % 60;
      return { ...exam, days, hours, mins };
    });
  }, []);

  const activateWarMode = async () => {
    if (!apiKey) return;
    setIsActivating(true);
    try {
      const strategy = await generateWarStrategy(apiKey, stats, analytics, tasks);
      setData({
        isActive: true,
        exams: EXAMS,
        dailyTargets: strategy.dailyTargets || [],
        stamina: strategy.stamina || 80,
        combatPower: (stats.level * 10) + (stats.streak * 5),
        strategy: strategy.strategy || "Maintain high focus integrity.",
        lastAnalysis: Date.now()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsActivating(false);
    }
  };

  // Panic Detector Effect
  useEffect(() => {
    if (!data?.isActive) return;
    
    // Check for low focus or missed sessions
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayData = analytics.find(d => d.date === todayStr);
    
    if (!todayData || todayData.intensityMinutes < 30) {
      const timeout = setTimeout(() => {
        setPanicAlert("MISSION SLIPPING! Come back soldier 🔥 Intelligence reports decreasing discipline.");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [data?.isActive, analytics]);

  if (!data?.isActive) {
    return (
      <div className="p-8 text-center space-y-6 max-w-md mx-auto">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-20 h-20 bg-rose-500/10 rounded-full mx-auto flex items-center justify-center text-rose-500 border border-rose-500/20"
        >
           <Sword size={40} />
        </motion.div>
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Enter War Room</h2>
           <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mt-1">Tactical Command Center</p>
        </div>
        <p className="text-xs opacity-50 px-6 leading-relaxed">
          Transform your UI into a high-intensity battle station. AI will track your every move like a real commander.
        </p>
        <button 
          onClick={activateWarMode}
          disabled={isActivating}
          className="w-full py-4 bg-rose-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {isActivating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
          {isActivating ? "SYNOPSIS CALIBRATING..." : "ACTIVATE WAR MODE"}
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen pb-24 space-y-6 transition-all duration-700 gpu",
      isNightMode ? "bg-black text-rose-500" : "bg-zinc-950 text-white"
    )}>
      {/* Alert Overlay */}
      <AnimatePresence>
        {panicAlert && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-20 left-0 right-0 z-[100] px-4"
          >
             <div className="bg-rose-600 p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
                <AlertTriangle className="animate-pulse" />
                <p className="text-xs font-black uppercase italic leading-tight text-white">{panicAlert}</p>
                <button onClick={() => setPanicAlert(null)} className="ml-auto opacity-60"><Skull size={16} /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <header className="px-4 pt-6 flex justify-between items-end">
         <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
               <Radio size={12} className="animate-pulse" /> Strategic Command Active
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">WAR ROOM</h2>
         </div>
         <button 
           onClick={() => setIsNightMode(!isNightMode)}
           className="p-3 rounded-2xl glass border border-white/5"
         >
           {isNightMode ? <Wind size={20} /> : <Moon size={20} />}
         </button>
      </header>

      {/* Strategy Board */}
      <section className="px-4">
         <div className="p-6 rounded-[2.5rem] bg-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.2)] space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Sword size={80} /></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Tactical Strategy</h3>
            <p className="text-lg font-black italic leading-tight pr-12">"{data.strategy}"</p>
            <div className="flex gap-2 pt-2">
               <span className="px-2 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase">Level ${stats.level} Commander</span>
               <span className="px-2 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase">Streak: ${stats.streak}D</span>
            </div>
         </div>
      </section>

      {/* Countdown Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
         {countdowns.map(exam => (
           <div key={exam.id} className="p-5 rounded-[2rem] glass border border-white/5 space-y-3">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30">{exam.name}</div>
              <div className="flex items-end gap-1">
                 <span className="text-2xl font-black italic leading-none">{exam.days}</span>
                 <span className="text-[9px] font-bold opacity-40 uppercase mb-0.5">Days</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-rose-500 w-[60%]" />
              </div>
           </div>
         ))}
      </div>

      {/* Energy System */}
      <section className="px-4 grid grid-cols-2 gap-3">
         <div className="p-5 rounded-[2rem] glass border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
               <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Mental Stamina</div>
               <Flame size={14} className="text-orange-500" />
            </div>
            <div className="relative h-20 w-20 mx-auto">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="35" className="stroke-white/5 fill-none" strokeWidth="8" />
                  <circle cx="40" cy="40" r="35" className="stroke-orange-500 fill-none" strokeWidth="8" strokeDasharray="220" strokeDashoffset={220 - (220 * data.stamina / 100)} />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center font-black italic">{data.stamina}%</div>
            </div>
         </div>

         <div className="p-5 rounded-[2rem] glass border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
               <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Combat Power</div>
               <Zap size={14} className="text-rose-500" />
            </div>
            <div className="text-center py-4">
               <div className="text-4xl font-black italic tracking-tighter text-rose-500">{data.combatPower}</div>
               <div className="text-[8px] font-black uppercase opacity-30 mt-1">XP Adjusted Rank</div>
            </div>
         </div>
      </section>

      {/* Daily Combat Missions */}
      <section className="px-4 space-y-4">
         <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">War Targets</h3>
            <span className="text-[9px] font-black text-rose-500 italic">DAILY ROTATION</span>
         </div>
         <div className="space-y-2">
            {data.dailyTargets.map(target => (
              <div key={target.id} className="p-4 rounded-2xl glass border border-white/5 flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                      target.completed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-white/40"
                    )}>
                       {target.type === 'mcq' && <Target size={18} />}
                       {target.type === 'revision' && <RefreshCw size={18} />}
                       {target.type === 'mock' && <Trophy size={18} />}
                       {target.type === 'focus' && <Timer size={18} />}
                    </div>
                    <div>
                       <h4 className="text-xs font-black uppercase italic truncate max-w-[140px]">{target.text}</h4>
                       <div className="flex gap-1 h-1.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-full w-4 rounded-full bg-white/5 overflow-hidden">
                               <div className="h-full bg-rose-500 w-[20%]" />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs font-black italic">{target.current}/{target.target}</div>
                    <div className="text-[8px] font-black uppercase opacity-30">Progress</div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Emergency Recovery Mode */}
      <section className="px-4 pb-20">
         <div className="p-6 rounded-[2.5rem] glass border border-dashed border-rose-500/30 space-y-4 text-center">
            <div className="w-10 h-10 bg-rose-500/10 rounded-full mx-auto flex items-center justify-center text-rose-500">
               <ShieldAlert size={20} />
            </div>
            <div>
               <h4 className="text-sm font-black uppercase">Emergency Recovery</h4>
               <p className="text-[10px] opacity-40 px-6 font-bold mt-1">If productivity crashes, launch the emergency AI routine to restore focus.</p>
            </div>
            <button className="px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">
               Initiate Recovery
            </button>
         </div>
      </section>
    </div>
  );
}
