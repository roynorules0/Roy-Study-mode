import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Atom, 
  Zap, 
  Activity, 
  Trophy,
  RefreshCw,
  Target,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface QuantumProps {
  performanceData: any;
}

export default function AIQuantumMode({ performanceData }: QuantumProps) {
  const [syncing, setSyncing] = useState(false);
  const xp = performanceData?.xp || 0;

  return (
    <ProtocolWrapper 
      protocolName="Quantum Engine" 
      protocolColor="cyan" 
      integrity={92.4}
      status="Coherence Levels Normal"
    >
      <div className="space-y-6">
        {/* Quantum Pulse HUD */}
        <section className="p-8 rounded-[3rem] glass border border-cyan-500/10 relative overflow-hidden bg-gradient-to-br from-cyan-500/5 to-transparent text-center">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute inset-0 bg-cyan-500 rounded-full blur-[100px] -z-10"
           />
           <div className="space-y-4">
              <Sparkles className="mx-auto text-cyan-400" size={24} />
              <div className="text-4xl font-black italic tracking-tighter text-white tabular-nums">
                 {(xp / 50).toFixed(2)} Q-SYNC
              </div>
              <p className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-widest leading-relaxed">
                Adapting neural frequency based on mental fatigue markers.
              </p>
           </div>
        </section>

        {/* Adaptive Parameters */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Brain size={20} className="text-white opacity-40" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-cyan-500/40 uppercase">Coherence</div>
                 <div className="text-2xl font-black italic tracking-tighter">94%</div>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Zap size={20} className="text-white opacity-40" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-cyan-500/40 uppercase">Recall PWR</div>
                 <div className="text-2xl font-black italic tracking-tighter">BOOSTED</div>
              </div>
           </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setSyncing(true)}
          className="w-full py-5 rounded-[2rem] bg-cyan-500 text-black font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {syncing ? <RefreshCw className="animate-spin" size={20} /> : <Atom size={20} />}
          Quantum Re-Coherence
        </button>

        {/* History Log */}
        <section className="p-6 rounded-[2rem] glass border border-white/5 space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Coherence History</h3>
              <Target size={12} className="opacity-20" />
           </div>
           <div className="flex items-end gap-2 h-10">
              {[60, 45, 80, 70, 90, 85, 95].map((v, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${v}%` }}
                     className="absolute bottom-0 inset-x-0 bg-cyan-500/30"
                   />
                </div>
              ))}
           </div>
        </section>
      </div>
    </ProtocolWrapper>
  );
}
