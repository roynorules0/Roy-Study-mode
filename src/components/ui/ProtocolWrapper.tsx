import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

interface ProtocolWrapperProps {
  children: React.ReactNode;
  protocolName: string;
  protocolColor?: string;
  status?: string;
  integrity?: number;
  className?: string;
}

export default function ProtocolWrapper({ 
  children, 
  protocolName, 
  protocolColor = "indigo",
  status = "SYNCHRONIZED",
  integrity = 98.4,
  className
}: ProtocolWrapperProps) {
  const getThemeColor = () => {
    switch (protocolColor) {
      case 'rose': return 'from-rose-500/20 to-rose-950/20 text-rose-400 border-rose-500/20';
      case 'emerald': return 'from-emerald-500/20 to-emerald-950/20 text-emerald-400 border-emerald-500/20';
      case 'amber': return 'from-amber-500/20 to-amber-950/20 text-amber-400 border-amber-500/20';
      case 'cyan': return 'from-cyan-500/20 to-cyan-950/20 text-cyan-400 border-cyan-500/20';
      default: return 'from-indigo-500/20 to-indigo-950/20 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className={cn("p-6 space-y-6 max-w-md mx-auto gpu", className)}>
      {/* Protocol HUD Header */}
      <section className={cn(
        "p-8 rounded-[3rem] bg-gradient-to-br border relative overflow-hidden space-y-6 shadow-2xl",
        getThemeColor()
      )}>
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Cpu size={120} />
         </div>

         <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
               <span className="text-[9px] font-black uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                 Protocol Status: {status}
               </span>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{protocolName}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl">
               <ShieldCheck size={28} />
            </div>
         </div>

         <div className="flex items-center justify-between pt-4 relative z-10">
            <div className="space-y-0.5">
               <div className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">System Integrity</div>
               <div className="flex gap-1.5 items-center">
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-3 h-1 rounded-full",
                          i < 5 ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-white/20"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-white italic">{integrity}%</span>
               </div>
            </div>
            <div className="text-right">
               <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Neural Sync</div>
               <div className="text-lg font-black italic tracking-tighter text-white">UP-LINK ACTIVE</div>
            </div>
         </div>
      </section>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.div>

      {/* Shared Footer Activity */}
      <footer className="p-6 rounded-[2.5rem] glass border border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
               <Activity size={18} />
            </div>
            <div>
               <div className="text-[8px] font-black uppercase tracking-widest opacity-30">Active Uplink</div>
               <div className="text-[10px] font-black italic uppercase italic">Neural Network Node-01</div>
            </div>
         </div>
         <div className="flex gap-1">
           {[...Array(3)].map((_, i) => (
             <motion.div 
               key={i}
               animate={{ opacity: [0.2, 1, 0.2] }}
               transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
               className="w-1 h-1 rounded-full bg-indigo-500"
             />
           ))}
         </div>
      </footer>
    </div>
  );
}
