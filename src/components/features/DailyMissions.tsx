import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Play, 
  Zap, 
  Target,
  Sparkles,
  ChevronRight,
  RefreshCcw,
  Star,
  Award,
  Lock,
  Skull,
  ShieldCheck,
  TrendingUp,
  Brain,
  Crown,
  Quote,
  Timer
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DailyMission, UserStats } from '../../types';
import { generateDailyMissions } from '../../lib/gemini';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface DailyMissionsProps {
  apiKey?: string;
  onXPGain?: (amount: number, reason: string) => void;
}

const HINGLISH_MOTIVATION = [
  "Aaj toh beast mode on tha 🔥",
  "Consistency hi real power hai ⚡",
  "Legendary discipline unlocked 👑",
  "Bas thoda aur, level up hone wala hai! ✨",
  "You are outperforming your yesterday. Mast! 🚀",
  "Padhai ka tempo ek dum solid hai! 💪",
  "Hard work pay off karega, keep going! 🎯"
];

export default function DailyMissions({ apiKey, onXPGain }: DailyMissionsProps) {
  const [missions, setMissions] = useLocalStorage<DailyMission[]>('study-missions-v2', []);
  const [userStats, setUserStats] = useLocalStorage<UserStats>('user-stats', {
    xp: 0,
    level: 1,
    streak: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [completedMission, setCompletedMission] = useState<DailyMission | null>(null);
  const [showBossAlert, setShowBossAlert] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const triggerConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  // Daily Reset & Generation Logic
  useEffect(() => {
    const checkAndGenerate = async () => {
      // If no missions or if the missions are from a different day
      if (missions.length === 0 || missions[0].date !== today) {
        setLoading(true);
        try {
          const result = await generateDailyMissions({ streak: userStats.streak, level: userStats.level }, apiKey);
          const newMissions = result.missions.map((m: any) => ({
            ...m,
            current: 0,
            completed: false,
            date: today
          }));
          setMissions(newMissions);
          
          if (newMissions.some((m: any) => m.difficulty === 'legendary')) {
            setShowBossAlert(true);
            setTimeout(() => setShowBossAlert(false), 5000);
          }

          // Streak break logic
          if (userStats.lastMissionDate) {
              const lastDate = new Date(userStats.lastMissionDate);
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
              
              if (userStats.lastMissionDate !== yesterdayStr && userStats.lastMissionDate !== today) {
                setUserStats(prev => ({ ...prev, streak: 0 }));
              }
          }
        } catch (error) {
          console.error("Failed to generate missions:", error);
          const fallback: DailyMission[] = [
            { id: '1', title: 'Deep Focus Ignite', description: 'Complete 1 Focus Session', type: 'focus', target: 1, current: 0, xp: 80, difficulty: 'easy', completed: false, date: today },
            { id: '2', title: 'Knowledge Sprint', description: 'Solve 15 Practice MCQs', type: 'mcq', target: 15, current: 0, xp: 180, difficulty: 'medium', completed: false, date: today },
            { id: '3', title: 'Revision Beast', description: 'Revise 1 long chapter', type: 'revision', target: 1, current: 0, xp: 250, difficulty: 'hard', completed: false, date: today },
            { id: '4', title: 'Discipline Master', description: 'Early morning session (before 7 AM)', type: 'discipline', target: 1, current: 0, xp: 400, difficulty: 'hard', completed: false, date: today },
            { id: '5', title: 'BOSS: The Marathon', description: '4 Focus Sessions + 50 MCQs', type: 'focus', target: 1, current: 0, xp: 800, difficulty: 'legendary', completed: false, date: today },
          ];
          setMissions(fallback);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAndGenerate();
  }, [apiKey, today]);

  const toggleMission = useCallback((id: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const newMissions = missions.map(m => {
      if (m.id === id) {
        onXPGain?.(m.xp, `Mission: ${m.title}`);
        setCompletedMission(m);
        setTimeout(() => setCompletedMission(null), 4000);
        return { ...m, completed: true, current: m.target };
      }
      return m;
    });

    setMissions(newMissions);

    // Check if all missions completed today for streak
    const allDone = newMissions.every(m => m.completed);
    if (allDone) {
       triggerConfetti();
       setUserStats(prev => ({
         ...prev,
         streak: prev.streak + 1,
         lastMissionDate: today
       }));
       onXPGain?.(100, "All Daily Missions Complete streak bonus!");
    } else {
       setUserStats(prev => ({
         ...prev,
         lastMissionDate: today
       }));
    }
  }, [missions, onXPGain, today, setMissions, setUserStats, triggerConfetti]);

  const progress = useMemo(() => {
    if (missions.length === 0) return 0;
    const completed = missions.filter(m => m.completed).length;
    return Math.round((completed / missions.length) * 100);
  }, [missions]);

  const missionsLeft = missions.filter(m => !m.completed).length;

  const MissionCard = memo(({ mission, onClick, idx }: { mission: DailyMission, onClick: () => void, idx: number }) => {
    const getDifficultyStyle = (diff: string) => {
      switch(diff) {
        case 'easy': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
        case 'medium': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
        case 'hard': return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
        case 'legendary': return 'text-purple-400 border-purple-500/40 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]';
        default: return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
      }
    };

    const getTypeIcon = (type: string) => {
      switch(type) {
        case 'mcq': return <Target size={20} />;
        case 'revision': return <Brain size={20} />;
        case 'lecture': return <Play size={20} />;
        case 'focus': return <Timer size={20} />;
        case 'discipline': return <ShieldCheck size={20} />;
        default: return <Sparkles size={20} />;
      }
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05, type: 'spring', damping: 25 }}
        onClick={onClick}
        className={cn(
          "relative p-4 rounded-[2rem] glass-light border transition-all duration-500 flex items-center gap-4 cursor-pointer group gpu overflow-hidden",
          mission.completed 
            ? "border-white/5 opacity-50 bg-white/[0.02]" 
            : `hover:bg-white/[0.04] active:scale-[0.98] ${mission.difficulty === 'legendary' ? 'border-purple-500/30' : 'border-white/10'}`
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl relative z-10",
          mission.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/70"
        )}>
           {mission.completed ? <CheckCircle2 size={24} /> : (
              mission.difficulty === 'legendary' ? <Skull size={24} className="text-purple-400 animate-pulse" /> : getTypeIcon(mission.type)
           )}
        </div>

        <div className="flex-1 space-y-0.5 relative z-10">
          <div className="flex items-center gap-2">
             <h4 className="font-black italic uppercase tracking-tighter text-sm">{mission.title}</h4>
             <div className={cn("text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest", getDifficultyStyle(mission.difficulty))}>
               {mission.difficulty}
             </div>
          </div>
          <p className="text-[10px] font-medium opacity-40 leading-snug line-clamp-1">{mission.description}</p>
          <div className="flex items-center gap-3 pt-1">
             <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="w-4 h-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                   <Zap size={8} className="text-yellow-500" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500/80">+{mission.xp} XP</span>
             </div>
             {mission.difficulty === 'legendary' && (
               <div className="flex items-center gap-1 text-purple-400 animate-pulse">
                  <Crown size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Boss</span>
               </div>
             )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 relative z-10">
           {mission.completed ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-500 opacity-60"
              >
                 <CheckCircle2 size={16} />
              </motion.div>
           ) : (
              <ChevronRight size={16} className="opacity-10 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
           )}
        </div>
      </motion.div>
    );
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 space-y-6">
        <div className="relative">
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={24} className="text-indigo-500 animate-pulse" />
           </div>
        </div>
        <div className="text-center space-y-1">
           <p className="text-lg font-black italic uppercase tracking-tighter text-white">Generating Neural Missions</p>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.5em] animate-pulse">Consulting Gemini AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-4 gpu">
      <header className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">AI Missions</h2>
            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
               <Timer size={8} /> {format(new Date(), 'EEEE, do MMMM')}
            </p>
          </div>
          <div className="relative group scale-90 origin-right">
             <div className="px-5 py-2 glass-light border border-orange-500/20 rounded-2xl flex items-center gap-2 relative z-10 transition-transform active:scale-95 cursor-default">
                <Flame size={16} className={cn("transition-colors", userStats.streak > 0 ? "text-orange-500" : "opacity-20")} />
                <div className="text-right">
                   <div className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none mb-0.5">Streak</div>
                   <div className="text-xl font-black italic leading-none">{userStats.streak}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Global Level Sync HUD */}
        <div className="p-6 rounded-[2.5rem] glass-light border border-white/5 space-y-4 relative overflow-hidden group">
          <div className="flex justify-between items-end relative z-10">
            <div className="space-y-1">
              <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] block">Neural Rank</span>
              <div className="text-3xl font-black italic uppercase tracking-tighter text-indigo-400">Level {userStats.level}</div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="flex items-center gap-1.5 justify-end opacity-40">
                 <Zap size={10} className="text-yellow-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Total XP</span>
              </div>
              <div className="text-xl font-black tabular-nums tracking-tighter text-white/90">{userStats.xp.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${(userStats.xp % 1000) / 10}%` }}
                transition={{ duration: 1.5, type: 'spring' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Momentum Display */}
      <section className="relative group">
         <div className="p-6 rounded-[3.5rem] bg-indigo-600 text-white relative shadow-2xl shadow-indigo-600/20 overflow-hidden border border-white/20">
            <div className="relative z-10 flex items-center justify-between gap-4">
               <div className="space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-2xl italic uppercase tracking-tighter flex items-center gap-2">
                       Momentum <Zap size={18} className="fill-yellow-400 text-yellow-400" />
                    </h3>
                    <p className="text-[8px] font-black opacity-60 uppercase tracking-[0.2em]">
                      {missionsLeft === 0 ? "Goal achieved! 🔥" : `${missionsLeft} units remaining`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 w-fit backdrop-blur-xl">
                     <Crown size={12} className="text-yellow-400" />
                     <span className="text-[8px] font-black uppercase tracking-widest">{userStats.streak > 5 ? "Elite Buff Active" : "+100 XP Completion Bonus"}</span>
                  </div>
               </div>

               <div className="shrink-0 relative">
                  <svg className="w-20 h-20 -rotate-90">
                     <circle 
                       cx="40" cy="40" r="36" 
                       fill="none" stroke="currentColor" strokeWidth="6" 
                       className="text-white/20"
                     />
                     <motion.circle 
                       cx="40" cy="40" r="36" 
                       fill="none" stroke="currentColor" strokeWidth="6" 
                       className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                       strokeDasharray="226" 
                       initial={{ strokeDashoffset: 226 }}
                       animate={{ strokeDashoffset: 226 * (1 - progress / 100) }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-lg font-black italic">{progress}%</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Boss Challenge Warning */}
      <AnimatePresence>
         {showBossAlert && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className="px-6 py-4 rounded-3xl bg-rose-600 text-white flex items-center gap-4 shadow-xl shadow-rose-600/30 border border-white/20 border-l-[12px]"
           >
              <Skull size={24} className="animate-pulse" />
              <div className="flex-1">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Critical Overload</div>
                 <div className="text-sm font-black italic uppercase tracking-tight">BOSS MISSION DETECTED: THE MARATHON</div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Missions Grid */}
      <section className="space-y-3">
         <div className="flex items-center gap-2 px-3">
            <Target size={12} className="text-indigo-400" />
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-30">Active Directives</h3>
         </div>
         <div className="grid gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
               {missions.map((mission, idx) => (
                 <MissionCard 
                   key={mission.id} 
                   mission={mission} 
                   idx={idx} 
                   onClick={() => toggleMission(mission.id)} 
                 />
               ))}
            </AnimatePresence>
         </div>
      </section>

      {/* Tech Operations */}
      <div className="grid grid-cols-2 gap-3 pb-4">
         <button 
           onClick={() => {
              setMissions([]);
              setUserStats(prev => ({ ...prev, streak: 0 }));
           }}
           className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2 group active:scale-95 transition-all opacity-20 hover:opacity-100"
         >
            <RefreshCcw size={16} className="text-indigo-400 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[8px] font-black uppercase tracking-widest">Reset System</span>
         </button>
         <button 
           className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2 group opacity-20 hover:opacity-100 transition-all pointer-events-none"
         >
            <Star size={16} className="text-yellow-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">Secret Ops</span>
         </button>
      </div>

      {/* Mission Completion Motivation Overlay */}
      <AnimatePresence>
        {completedMission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.8, y: 50 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 1.1, opacity: 0 }}
               className="p-12 rounded-[5rem] bg-indigo-600 text-white shadow-4xl text-center space-y-8 max-w-sm border border-white/20 relative overflow-hidden"
             >
                {/* Background Sparkles */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 opacity-10"
                >
                   <Sparkles className="w-full h-full" />
                </motion.div>

                <div className="relative z-10">
                   <motion.div 
                     initial={{ rotate: -180, scale: 0 }}
                     animate={{ rotate: 0, scale: 1 }}
                     transition={{ type: 'spring', damping: 10 }}
                     className="w-24 h-24 bg-white/20 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl border border-white/20"
                   >
                      <Award size={64} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                   </motion.div>
                </div>

                <div className="space-y-2 relative z-10">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Mission Alpha</h3>
                   <div className="text-5xl font-black text-yellow-400 drop-shadow-xl">+{completedMission.xp} XP</div>
                </div>

                <div className="relative z-10 px-6 py-4 bg-white/10 rounded-3xl border border-white/10">
                   <Quote className="w-6 h-6 text-white/20 mb-2 mx-auto" />
                   <p className="text-xl font-black italic tracking-tight text-white/95 leading-tight uppercase">
                      {HINGLISH_MOTIVATION[Math.floor(Math.random() * HINGLISH_MOTIVATION.length)]}
                   </p>
                </div>

                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[9px] font-black opacity-40 uppercase tracking-[0.5em] relative z-10"
                >
                  Continuity Established
                </motion.div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center py-12 space-y-2 opacity-20">
         <p className="text-[9px] font-black uppercase tracking-[0.6em]">Neural Engine Sync: 100%</p>
         <p className="text-[8px] font-bold uppercase tracking-widest tracking-widest">AI Mission Protocol v5.0.2</p>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
