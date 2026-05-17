import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Zap, 
  Target,
  Shield,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface LegendProps {
  performanceData: any;
}

export default function AILegendMode({ performanceData }: LegendProps) {
  const streak = performanceData?.streak || 0;
  const level = performanceData?.level || 1;

  return (
    <ProtocolWrapper 
      protocolName="Legend Mode" 
      protocolColor="amber" 
      integrity={Math.min(99.9, 90 + level)}
      status="LEGENDARY_STATUS_CONFIRMED"
    >
      <div className="space-y-6">
        {/* Hall of Fame HUD */}
        <section className="p-8 rounded-[3rem] glass border border-amber-500/10 relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent flex flex-col items-center text-center space-y-4">
           <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Crown className="text-amber-500" size={32} />
           </div>
           
           <div className="space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">
                 THE {streak >= 10 ? 'ETERNAL' : 'RISING'} LEGEND
              </h2>
              <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em]">
                 Level {level} Elite Status
              </p>
           </div>
        </section>

        {/* Legend Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Flame size={20} className="text-amber-500" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-amber-500/40 uppercase">Day Streak</div>
                 <div className="text-2xl font-black italic tracking-tighter">{streak} DAYS</div>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Star size={20} className="text-amber-500" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-amber-500/40 uppercase">Prestige</div>
                 <div className="text-2xl font-black italic tracking-tighter">RANK {(level / 10).toFixed(0)}</div>
              </div>
           </div>
        </div>

        {/* Milestone Tracker */}
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
           <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/30 tracking-widest px-2">
              <span>Current Progress</span>
              <span>Next Milestone</span>
           </div>
           <div className="space-y-2">
              <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(streak % 7) * 14.2}%` }}
                   className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                 />
              </div>
              <div className="flex justify-between text-[10px] font-black italic text-amber-500/60 uppercase">
                 <span>{streak} Days</span>
                 <span>7 Day Reward</span>
              </div>
           </div>
        </section>

        {/* Legendary Perks */}
        <div className="grid grid-cols-3 gap-2">
           {[
             { label: 'Priority', icon: <Zap size={10} /> },
             { label: 'Protection', icon: <Shield size={10} /> },
             { label: 'Boost', icon: <Flame size={10} /> },
           ].map((p, i) => (
             <div key={i} className="py-3 px-1 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center gap-1">
                <div className="text-amber-500">{p.icon}</div>
                <span className="text-[7px] font-black uppercase text-amber-500/40">{p.label}</span>
             </div>
           ))}
        </div>
      </div>
    </ProtocolWrapper>
  );
}
