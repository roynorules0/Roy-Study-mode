import React from 'react';
import { motion } from 'motion/react';
import { 
  Moon,
  Zap,
  Activity,
  Shield,
  EyeOff,
  Ghost,
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProtocolWrapper from '../ui/ProtocolWrapper';

interface ShadowProps {
  performanceData: any;
}

export default function AIShadowMode({ performanceData }: ShadowProps) {
  const streak = performanceData?.streak || 0;

  return (
    <ProtocolWrapper 
      protocolName="Shadow Mode" 
      protocolColor="slate" 
      integrity={Math.min(99.9, 95 + streak/2)}
      status="STEALTH_PROTOCOLS_ACTIVE"
    >
      <div className="space-y-6">
        {/* Stealth HUD */}
        <section className="p-10 rounded-[3rem] glass border border-slate-500/10 relative overflow-hidden bg-gradient-to-br from-slate-900 to-transparent flex flex-col items-center text-center space-y-6">
           <div className="relative">
              <Ghost className="text-slate-400" size={48} />
              <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute inset-0 bg-slate-500 rounded-full blur-2xl -z-10"
              />
           </div>
           
           <div className="space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">
                 SHADOW DOMAIN
              </h2>
              <p className="text-[10px] font-black text-slate-500/50 uppercase tracking-[0.2em]">
                 Distraction Suppression: 100%
              </p>
           </div>
        </section>

        {/* Tactical Parameters */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <EyeOff size={20} className="text-slate-500 opacity-40" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-slate-500/40 uppercase">Ghost Protocol</div>
                 <div className="text-2xl font-black italic tracking-tighter">ACTIVE</div>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
              <Lock size={20} className="text-slate-500 opacity-40" />
              <div className="space-y-1">
                 <div className="text-[8px] font-black text-slate-500/40 uppercase">Environment</div>
                 <div className="text-2xl font-black italic tracking-tighter">SECURED</div>
              </div>
           </div>
        </div>

        {/* Primary Action */}
        <button 
          className="w-full py-5 rounded-[2rem] bg-slate-800 text-white font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/5"
        >
          <Moon size={20} />
          Go Dark
        </button>

        {/* Stealth Meter */}
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
           <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30 tracking-widest px-2">
              <span>Stealth Focus Consistency</span>
              <span>Elite Level</span>
           </div>
           <div className="flex gap-1 h-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={cn("flex-1 rounded-full", i < 10 ? "bg-slate-400" : "bg-slate-800")} />
              ))}
           </div>
        </section>
      </div>
    </ProtocolWrapper>
  );
}
