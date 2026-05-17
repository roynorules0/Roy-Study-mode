import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpCircle,
  Zap,
  Activity,
  Unplug,
  Sparkles,
  Mountain,
  Wind
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface AscensionProps {
  performanceData: any;
}

export default function AIAscensionMode({ performanceData }: AscensionProps) {
  const level = performanceData?.level || 1;
  const xp = performanceData?.xp || 0;

  return (
    <ProtocolWrapper 
      protocolName="Ascension Mode" 
      protocolColor="indigo" 
      integrity={Math.min(99.9, 88.5 + level)}
      status="TRANSITION_IN_PROGRESS"
    >
      <div className="space-y-6">
        {/* Ascension Visual HUD */}
        <section className="p-10 rounded-[3rem] glass border border-indigo-500/10 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent flex flex-col items-center text-center space-y-4">
           <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
             className="relative"
           >
              <Mountain className="text-indigo-400" size={48} />
              <motion.div 
                 animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-indigo-500 rounded-full blur-xl -z-10"
              />
           </motion.div>
           
           <div className="space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">
                 ASCEND TO LVL {level + 1}
              </h2>
              <p className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em]">
                 Clarity Status: Optimized
              </p>
           </div>
        </section>

        {/* Ascension Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Wind size={20} className="text-indigo-400 opacity-40" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-indigo-500/40 uppercase">Mental Clarity</div>
                 <div className="text-2xl font-black italic tracking-tighter">92.4%</div>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Sparkles size={20} className="text-indigo-400 opacity-40" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-indigo-500/40 uppercase">Aura Sync</div>
                 <div className="text-2xl font-black italic tracking-tighter">SYNCED</div>
              </div>
           </div>
        </div>

        {/* Global Progress */}
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
           <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30 tracking-widest px-2">
              <span>Evolution Mapping</span>
              <span>{(xp / 1000).toFixed(1)}%</span>
           </div>
           <div className="h-6 bg-white/5 rounded-full overflow-hidden p-1.5 border border-white/5">
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }}
                 className="h-full bg-gradient-to-r from-indigo-700 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-end px-2"
              >
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </motion.div>
           </div>
        </section>

        {/* Action Button */}
        <button 
          className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <ArrowUpCircle size={20} />
          Initialize Soul Sync
        </button>
      </div>
    </ProtocolWrapper>
  );
}
