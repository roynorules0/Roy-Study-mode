import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Telescope, 
  History, 
  TrendingUp, 
  Clock, 
  Zap, 
  FastForward,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Target,
  Award,
  CircleDashed,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AnalyticsData, TimeMachineData } from '../../types';
import { projectFuture } from '../../services/timeMachineService';

interface AITimeMachineProps {
  apiKey?: string;
  analytics: AnalyticsData[];
}

export default function AITimeMachine({ apiKey, analytics }: AITimeMachineProps) {
  const [timeState, setTimeState] = useLocalStorage<TimeMachineData>('ai-time-machine-v1', {
    lastSync: Date.now(),
    pastMilestones: [
      { id: '1', date: '2026-05-01', title: 'Legendary 10h Session', xp: 500, type: 'hours' },
      { id: '2', date: '2026-05-05', title: '7 Day Streak Bonus', xp: 1000, type: 'streak' },
      { id: '3', date: '2026-05-08', title: 'Biology Mastery Alpha', xp: 300, type: 'mastery' },
    ],
    projections: {
      syllabusCompletionDays: 42,
      readinessScore: 68,
      futureConsistency: 85,
      burnoutRisk: 'low',
      estimatedRankImprovement: 'Top 500 Entry'
    },
    futureInsights: [
      "Future productivity stability detected 🔥",
      "Syllabus completion timeline optimal hai ⚡",
      "Next 7 days consistency is critical 👑"
    ]
  });

  const [isProjecting, setIsProjecting] = useState(false);

  const handleProjection = async () => {
    if (!apiKey) return;
    setIsProjecting(true);
    try {
      const result = await projectFuture(apiKey, analytics);
      setTimeState({
        ...timeState,
        lastSync: Date.now(),
        projections: {
          syllabusCompletionDays: result.syllabusCompletionDays,
          readinessScore: result.readinessScore,
          futureConsistency: result.futureConsistency,
          burnoutRisk: result.burnoutRisk as any,
          estimatedRankImprovement: result.estimatedRankImprovement
        },
        futureInsights: result.insights
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProjecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Time Machine</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-cyan-400">
              <Telescope size={10} /> Neural Timeline Simulator
           </p>
        </div>
        <div className="text-right">
           <div className="text-[8px] font-black opacity-20 uppercase">Last Sync</div>
           <div className="text-[10px] font-black italic opacity-40">T-{Math.floor((Date.now() - timeState.lastSync)/60000)}m ago</div>
        </div>
      </header>

      {/* Projection HUD */}
      <section className="p-8 rounded-[3rem] glass border border-cyan-500/10 relative overflow-hidden space-y-6 shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Fingerprint size={120} />
         </div>

         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Future Sync Active</span>
               <h3 className="text-xl font-black italic uppercase tracking-tighter">Temporal Outlook</h3>
            </div>
            <button 
              onClick={handleProjection}
              disabled={isProjecting}
              className={cn(
                "p-4 rounded-2xl bg-cyan-600 text-white shadow-lg active:scale-90 transition-all",
                isProjecting && "animate-pulse"
              )}
            >
               {isProjecting ? <CircleDashed size={20} className="animate-spin" /> : <FastForward size={20} />}
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { label: 'Syllabus Comp', val: `${timeState.projections.syllabusCompletionDays} Days`, color: 'text-cyan-400' },
              { label: 'Consistency', val: `${timeState.projections.futureConsistency}%`, color: 'text-emerald-400' },
              { label: 'Exam Readiness', val: `${timeState.projections.readinessScore}%`, color: 'text-orange-400' },
              { label: 'Burnout Risk', val: timeState.projections.burnoutRisk.toUpperCase(), color: timeState.projections.burnoutRisk === 'low' ? 'text-emerald-400' : 'text-rose-400' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <div className="text-[7px] font-black uppercase opacity-30 tracking-[0.2em]">{stat.label}</div>
                 <div className={cn("text-xs font-black italic tracking-tight", stat.color)}>{stat.val}</div>
              </div>
            ))}
         </div>

         <div className="p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-500/20 to-transparent">
            <div className="flex items-center gap-2 text-[8px] font-black opacity-30 uppercase tracking-widest mb-1.5">
               <Target size={12} className="text-cyan-400" /> Projected Outcome
            </div>
            <div className="text-lg font-black italic uppercase italic tracking-tighter text-white">
               {timeState.projections.estimatedRankImprovement}
            </div>
         </div>
      </section>

      {/* AI Futuristic Insights */}
      <section className="space-y-3">
         {timeState.futureInsights.map((insight, i) => (
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             key={i} 
             className="px-5 py-3 rounded-2xl glass border border-white/5 flex items-center gap-4 group hover:bg-white/[0.02] transition-all"
           >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]" />
              <p className="text-[10px] font-black uppercase tracking-tight text-white/70 italic group-hover:text-white transition-colors">
                 "{insight}"
              </p>
           </motion.div>
         ))}
      </section>

      {/* Interactive Timeline */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Temporal Records</h3>
            <span className="text-[10px] font-black opacity-20 uppercase">Past & Present</span>
         </div>

         <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500/40 before:via-white/10 before:to-transparent">
            {timeState.pastMilestones.map((ms, i) => (
              <div key={ms.id} className="relative">
                 <div className={cn(
                   "absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] z-10 transition-all",
                   i === 0 ? "bg-cyan-500 shadow-[0_0_10px_#22d3ee]" : "bg-white/20"
                 )} />
                 
                 <div className="glass border border-white/5 p-5 rounded-[2rem] space-y-2 group hover:border-cyan-500/20 transition-all">
                    <div className="flex justify-between items-start">
                       <span className="text-[8px] font-black opacity-20 uppercase tracking-[0.2em]">{ms.date}</span>
                       <div className="flex items-center gap-1 text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase">
                          +{ms.xp} XP
                       </div>
                    </div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight">{ms.title}</h4>
                    <div className="flex items-center gap-4 text-[7px] font-black opacity-30 uppercase tracking-[0.2em]">
                       <span className="flex items-center gap-1 text-emerald-400"><Zap size={8} /> STABLE</span>
                       <span>TYPE: {ms.type}</span>
                    </div>
                 </div>
              </div>
            ))}

            {/* Empty Future Node */}
            <div className="relative opacity-20">
               <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] bg-white/10 z-10" />
               <div className="glass border-dashed border border-white/20 p-5 rounded-[2rem] flex items-center justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Upcoming Milestone Detected...</p>
               </div>
            </div>
         </div>
      </section>

      {/* Rewards & Badges */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
             <Award size={12} className="text-yellow-500" /> Milestone Unlocked
          </div>
          <div className="flex gap-3">
             {[
               { icon: <Clock size={16} />, color: 'bg-indigo-500/20 text-indigo-400' },
               { icon: <Zap size={16} />, color: 'bg-emerald-500/20 text-emerald-400' },
               { icon: <TrendingUp size={16} />, color: 'bg-cyan-500/20 text-cyan-400' }
             ].map((badge, i) => (
               <div key={i} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", badge.color)}>
                  {badge.icon}
               </div>
             ))}
          </div>
      </section>

      {/* Stats Summary */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30 text-cyan-400">
               <Cpu size={12} /> Sync Integrity
            </div>
            <div className="flex gap-1">
               {Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="w-4 h-1 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]" />
               ))}
            </div>
         </div>
         <div className="text-right">
            <div className="text-3xl font-black italic tracking-tighter leading-none">99.8%</div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Future Correlation</div>
         </div>
      </section>
    </div>
  );
}
