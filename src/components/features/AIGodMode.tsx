import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Flame, 
  Trophy, 
  ChevronRight, 
  Terminal,
  RefreshCw,
  Crown,
  Compass,
  Target
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface GodModeProps {
  userHistory: any;
}

const REALITY_MODES = [
  { id: 'monk', name: 'Monk Mode', icon: <Target size={16} />, color: 'bg-emerald-500' },
  { id: 'shadow', name: 'Shadow Mode', icon: <Compass size={16} />, color: 'bg-slate-700' },
  { id: 'legend', name: 'Legend Mode', icon: <Crown size={16} />, color: 'bg-amber-500' },
];

export default function AIGodMode({ userHistory }: GodModeProps) {
  const [syncing, setSyncing] = useState(false);
  const [activeReality, setActiveReality] = useState('Monk Mode');

  const xp = userHistory?.xp || 0;
  const streak = userHistory?.streak || 0;

  return (
    <ProtocolWrapper 
      protocolName="God Mode" 
      protocolColor="white" 
      integrity={Math.min(99.9, 85 + (streak * 2))}
      status={streak > 3 ? "DIVINE_STREAK" : "Neural Link Optimal"}
    >
      <div className="space-y-6">
        {/* Divine Insights HUD */}
        <section className="p-8 rounded-[3rem] glass border border-white/10 relative overflow-hidden space-y-6 bg-gradient-to-br from-white/5 to-transparent">
           <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Neural Overseer</h3>
              <Crown size={16} className="text-white" />
           </div>
           
           <p className="text-xl font-black italic uppercase italic tracking-tighter text-white leading-tight">
             "Your discipline purity is at {(xp / 1000).toFixed(1)}%. Transition to {activeReality} to optimize focus vectors."
           </p>

           <div className="grid grid-cols-3 gap-2">
              {REALITY_MODES.map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setActiveReality(mode.name)}
                  className={cn(
                    "p-3 rounded-2xl border text-[8px] font-black uppercase tracking-widest transition-all",
                    activeReality === mode.name 
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  {mode.name}
                </button>
              ))}
           </div>
        </section>

        {/* Global Control Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-[2rem] glass border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                 <Zap size={20} className="text-white" />
                 <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Power</span>
              </div>
              <div className="space-y-1">
                 <div className="text-2xl font-black italic tracking-tighter">LVL {userHistory?.level}</div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white shadow-[0_0_10px_#fff]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }}
                    />
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-[2rem] glass border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                 <Trophy size={20} className="text-white" />
                 <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Streak</span>
              </div>
              <div className="space-y-1">
                 <div className="text-2xl font-black italic tracking-tighter">{streak}d</div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white shadow-[0_0_10px_#fff]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, streak * 5)}%` }}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Master Command Button */}
        <button 
          onClick={() => setSyncing(true)}
          className="w-full py-6 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all"
        >
          {syncing ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
          Synchronize Divine Order
        </button>

        {/* Neural Activity Graph (Real Data Placeholder) */}
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Neural Stability History</h3>
              <Terminal size={12} className="opacity-20" />
           </div>
           <div className="flex items-end gap-1 h-12">
              {[70, 85, 60, 95, 80, 75, 90].map((val, i) => (
                <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative group">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${val}%` }}
                     className="absolute inset-0 bg-white/20 group-hover:bg-white transition-all rounded-t-sm"
                   />
                </div>
              ))}
           </div>
        </section>
      </div>
    </ProtocolWrapper>
  );
}
