import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Target, 
  Terminal,
  RefreshCw,
  Binary,
  Code,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface MatrixProps {
  performanceData: any;
}

const TRAINING_PROGRAMS = [
  { id: 'recall', name: 'Recall Acceleration', icon: <Binary size={16} />, color: 'emerald' },
  { id: 'formula', name: 'Formula Injection', icon: <Code size={16} />, color: 'emerald' },
  { id: 'pyq', name: 'PYQ Simulation', icon: <Target size={16} />, color: 'emerald' },
];

export default function AIMatrixMode({ performanceData }: MatrixProps) {
  const [syncing, setSyncing] = useState(false);
  const [activeDrill, setActiveDrill] = useState('Recall Acceleration');

  const xp = performanceData?.xp || 0;
  const streak = performanceData?.streak || 0;

  return (
    <ProtocolWrapper 
      protocolName="Deep Focus" 
      protocolColor="emerald" 
      integrity={Math.min(99.9, 85 + (streak * 0.8))}
      status={streak > 0 ? "COHERENCE_MAX" : "READY"}
    >
      <div className="space-y-6">
        {/* Efficiency Section */}
        <section className="p-8 rounded-[3.5rem] glass border border-emerald-500/10 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
           <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center text-emerald-400">
                 <Activity size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40">Visualizing Coherence</span>
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                 Status: {activeDrill}
              </h3>
              <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest leading-relaxed">
                Deep focus protocols engaged. Current effectiveness: {(85 + streak * 0.5).toFixed(1)}%. 
                All non-essential neural paths suppressed.
              </p>
           </div>
        </section>

        {/* Training Grid */}
        <div className="space-y-3">
           <h4 className="text-[10px] font-black uppercase tracking-widest opacity-20 px-2 text-white">Focus Drills</h4>
           <div className="grid grid-cols-1 gap-3">
              {TRAINING_PROGRAMS.map(prog => (
                <button 
                  key={prog.id}
                  onClick={() => setActiveDrill(prog.name)}
                  className={cn(
                    "p-5 rounded-[2rem] border flex items-center justify-between transition-all group",
                    activeDrill === prog.name 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-white/[0.01] border-white/5 text-white/40 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                       activeDrill === prog.name ? "bg-emerald-500 text-black shadow-lg" : "bg-white/5 text-white/40"
                     )}>
                        {React.cloneElement(prog.icon as React.ReactElement<any>, { size: 18 })}
                     </div>
                     <span className="text-xs font-black uppercase tracking-tighter">{prog.name}</span>
                  </div>
                  {activeDrill === prog.name && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* Sync Action */}
        <button 
          onClick={() => setSyncing(true)}
          className="w-full py-5 rounded-[2rem] bg-emerald-600 text-black font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-xs"
        >
          {syncing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
          Neural Recall Sync
        </button>
      </div>
    </ProtocolWrapper>
  );
}
