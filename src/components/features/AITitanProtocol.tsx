import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Flame, 
  Target, 
  Skull,
  Terminal,
  RefreshCw,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface TitanProps {
  titanContext?: any;
  performanceData?: any;
}

export default function AITitanProtocol({ performanceData }: TitanProps) {
  const [loading, setLoading] = useState(false);

  const [progress] = useLocalStorage<any>('titan_progress', {
    perfectDays: 0,
    missionsCompleted: 0,
    failureCount: 0,
    titanExp: 0,
    streakHistory: [30, 45, 40, 55, 60]
  });

  const getRankData = () => {
    const level = performanceData?.level || 1;
    if (level < 5) return { name: 'Recruit', color: 'text-slate-500' };
    if (level < 10) return { name: 'Warrior', color: 'text-orange-500' };
    if (level < 20) return { name: 'Elite Titan', color: 'text-rose-500' };
    return { name: 'Neural Commander', color: 'text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]' };
  };

  const rank = getRankData();
  const xp = performanceData?.xp || 0;
  const streak = performanceData?.streak || 0;

  return (
    <ProtocolWrapper 
      protocolName="Titan Protocol" 
      protocolColor="rose" 
      integrity={Math.min(99.9, 70 + streak)}
      status={streak > 0 ? "STREAK_SYNCED" : "NEURAL_STANDBY"}
    >
      <div className="space-y-6">
        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-[2rem] glass border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                 <Shield size={20} className="text-rose-400" />
                 <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Resilience</span>
              </div>
              <div className="space-y-1">
                 <div className="text-2xl font-black italic tracking-tighter">{(xp / 100).toFixed(1)}</div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }}
                    />
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-[2rem] glass border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                 <Flame size={20} className="text-orange-400" />
                 <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Aggression</span>
              </div>
              <div className="space-y-1">
                 <div className="text-2xl font-black italic tracking-tighter">{streak}x</div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-orange-500 shadow-[0_0_10px_#f97316]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, streak * 10)}%` }}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Commander's HUD */}
        <section className="p-8 rounded-[3rem] glass border border-white/5 relative overflow-hidden space-y-6">
           <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                 <Skull size={24} />
              </div>
              <div className="space-y-0.5">
                 <div className="text-[8px] font-black uppercase tracking-widest opacity-40">System Rank</div>
                 <h4 className={cn("text-xl font-black italic uppercase tracking-tighter", rank.color)}>{rank.name}</h4>
              </div>
           </div>

           <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400">
                    <Terminal size={14} /> Current Objective
                 </div>
                 <p className="text-sm font-bold text-white/90 leading-relaxed italic">
                   "Titan, your neural sync is at {(xp % 1000 / 10).toFixed(1)}%. Maintain focus to breach the Tier II barrier."
                 </p>
              </div>

              <button 
                onClick={() => setLoading(true)}
                className="w-full py-5 rounded-[2rem] bg-rose-600 text-white font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                Recalculate Survival Odds
              </button>
           </div>
        </section>

        {/* Performance Timeline */}
        <section className="space-y-4">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Combat History</h3>
              <Target size={16} className="text-rose-500 opacity-20" />
           </div>
           <div className="grid grid-cols-5 gap-2 h-16 pt-2">
              {progress.streakHistory.map((val: number, i: number) => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div className="w-full flex-1 relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className="w-full bg-rose-500/20 group-hover:bg-rose-500 rounded-t-md transition-colors"
                      />
                   </div>
                   <span className="text-[8px] font-black opacity-20 uppercase">T-{5-i}</span>
                </div>
              ))}
           </div>
        </section>
      </div>
    </ProtocolWrapper>
  );
}
