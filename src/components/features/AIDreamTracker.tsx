import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Heart, 
  Compass, 
  Plus, 
  ChevronRight, 
  Star, 
  FastForward,
  Trophy,
  Activity,
  CircleDashed,
  Award,
  Milestone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DreamTrackerState, AnalyticsData, DreamGoal } from '../../types';
import { getDreamInsights } from '../../services/dreamService';

interface AIDreamTrackerProps {
  apiKey?: string;
  analytics: AnalyticsData[];
}

export default function AIDreamTracker({ apiKey, analytics }: AIDreamTrackerProps) {
  const [dreamState, setDreamState] = useLocalStorage<DreamTrackerState>('ai-dream-tracker-v1', {
    goals: [
      { id: '1', title: 'AIIMS Delhi', targetDate: '2027-05-01', category: 'college', progress: 45, motivation: 'To save lives and lead medicine' },
      { id: '2', title: 'Top 100 Rank', targetDate: '2026-12-01', category: 'rank', progress: 68, motivation: 'To prove my discipline and strategy' },
    ],
    dreamEnergy: 82,
    lastSync: Date.now(),
    futureInsights: [
      "AIIMS dream aur close aa raha hai 🔥",
      "Consistency future build kar rahi hai ⚡",
      "Your focus velocity is in elite tier 👑"
    ]
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'visualization'>('goals');

  const syncInsights = async () => {
    if (!apiKey) return;
    setIsSyncing(true);
    try {
      const res = await getDreamInsights(apiKey, dreamState, analytics);
      setDreamState({
        ...dreamState,
        lastSync: Date.now(),
        futureInsights: res.insights
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Dream Tracker</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-fuchsia-400">
              <Cloud size={10} /> Neural Goal Architect
           </p>
        </div>
        <button 
          onClick={syncInsights}
          disabled={isSyncing}
          className="p-3 rounded-2xl glass border border-white/5 text-fuchsia-500 active:scale-90 transition-all"
        >
           {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </header>

      {/* Dream HUD Card */}
      <section className="p-8 rounded-[3.5rem] glass border border-fuchsia-500/10 relative overflow-hidden shadow-2xl flex flex-col items-center">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Heart size={120} />
         </div>

         <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center p-2 relative">
               <motion.div 
                 className="absolute inset-0 rounded-full border-4 border-fuchsia-500 border-t-transparent"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               />
               <div className="text-center">
                  <div className="text-4xl font-black italic tracking-tighter leading-none">{dreamState.dreamEnergy}%</div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-1">Dream Energy</div>
               </div>
            </div>
         </div>

         <div className="text-center space-y-2 z-10 w-full px-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400">
               Next Milestone: Rank Stability Alpha
            </div>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest pt-2">
               Last Sync: {Math.floor((Date.now() - dreamState.lastSync)/60000)}m ago
            </p>
         </div>
      </section>

      {/* Tab Switcher */}
      <div className="flex p-1.5 glass rounded-3xl gap-1 mx-2">
         {['goals', 'visualization'].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={cn(
                  "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-white/10 text-white shadow-xl" : "text-white/20 hover:text-white/40"
               )}
            >
               {tab}
            </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'goals' ? (
          <motion.div 
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Core Ambitions</h3>
                <button className="text-[10px] font-black text-fuchsia-400 flex items-center gap-1">
                   <Plus size={10} /> Add Dream
                </button>
             </div>

             <div className="space-y-3">
               {dreamState.goals.map(goal => (
                 <div key={goal.id} className="p-5 rounded-[2.5rem] glass border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-3">
                       <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                             {goal.category}
                          </span>
                          <h4 className="text-sm font-black italic uppercase tracking-tight">{goal.title}</h4>
                       </div>
                       <Trophy size={14} className="opacity-20 text-yellow-500" />
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black opacity-30 uppercase">
                             <span>Goal Readiness</span>
                             <span>{goal.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${goal.progress}%` }}
                               className="h-full bg-gradient-to-r from-fuchsia-600 to-indigo-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]"
                             />
                          </div>
                       </div>
                       <p className="text-[10px] font-bold opacity-40 italic uppercase leading-tight line-clamp-2">
                          "{goal.motivation}"
                       </p>
                    </div>
                    
                    <button className="absolute bottom-5 right-5 p-3 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                       <ChevronRight size={14} />
                    </button>
                 </div>
               ))}
             </div>

             {/* AI Motivation Feed */}
             <div className="space-y-3 mt-8">
               <h3 className="text-xs font-black uppercase tracking-widest px-2 opacity-40">Neural Motive Stream</h3>
               {dreamState.futureInsights.map((insight, i) => (
                 <div key={i} className="px-5 py-4 rounded-2xl glass border border-white/5 flex items-center gap-4 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" />
                    <p className="text-[10px] font-black uppercase tracking-tight text-white/70 italic group-hover:text-white transition-colors">
                       "{insight}"
                    </p>
                 </div>
               ))}
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="visualization"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
             <div className="p-8 rounded-[3rem] glass border border-white/5 bg-gradient-to-br from-fuchsia-500/20 to-transparent relative overflow-hidden min-h-[300px] flex flex-col justify-end gap-4 shadow-inner">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                   <FastForward size={160} />
                </div>
                
                <div className="space-y-1">
                   <span className="text-[10px] font-black uppercase text-fuchsia-400 px-3 py-1 bg-white/5 border border-white/5 rounded-full">Future Self Sync</span>
                   <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">Achievement Simulation</h3>
                </div>
                
                <p className="text-[11px] font-black uppercase opacity-40 leading-relaxed max-w-[200px]">
                   At current discipline velocity, your reach to elite colleges is Tier-1 alpha.
                </p>
                
                <div className="grid grid-cols-2 gap-3 pt-4">
                   <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-1">Success Prob</div>
                      <div className="text-xs font-black italic text-emerald-400">92.4%</div>
                   </div>
                   <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-1">Reality Gap</div>
                      <div className="text-xs font-black italic text-rose-400">-12.5%</div>
                   </div>
                </div>
             </div>

             <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                   <Milestone size={12} className="text-fuchsia-400" /> Timeline Evolution
                </div>
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                   {[
                     { label: 'Current Level', status: 'Active', color: 'bg-fuchsia-500 shadow-[0_0_8px_#d946ef]' },
                     { label: 'Syllabus Mastery', status: 'Predicted', color: 'bg-white/20' },
                     { label: 'Final Achievement', status: 'End Goal', color: 'bg-white/5' }
                   ].map((step, i) => (
                     <div key={i} className="relative flex items-center justify-between">
                        <div className={cn("absolute -left-[20px] w-3 h-3 rounded-full border-2 border-[#0a0a0a] z-10", step.color)} />
                        <span className="text-[10px] font-black uppercase opacity-60 italic">{step.label}</span>
                        <span className="text-[8px] font-black uppercase opacity-20">{step.status}</span>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purpose Reminder HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 flex items-center justify-between bg-white/[0.01]">
         <div className="space-y-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30 text-fuchsia-400">
               <Heart size={12} /> Purpose Core
            </div>
            <div className="text-xl font-black italic uppercase italic tracking-tighter text-white opacity-90">
               Why did you start?
            </div>
         </div>
         <div className="text-right">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
               <Compass size={24} className="animate-spin" />
            </div>
         </div>
      </section>

      {/* Performance Stats HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-fuchsia-400">
               Goal Connection
            </div>
            <div className="flex gap-1 flex-wrap">
               {Array.from({ length: 12 }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "w-3 h-3 rounded-sm transition-all duration-1000",
                     Math.random() > 0.4 ? "bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" : "bg-white/5"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none">
               A++
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Future Potential</div>
         </div>
      </section>
    </div>
  );
}
