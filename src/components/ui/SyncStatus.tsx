import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, Cpu, ZapOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SyncStatus() {
  const [isSimulated, setIsSimulated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Check recent responses for _simulated flag
  // This is a simple heuristic: if any recent feature call returned _simulated, we show the indicator
  useEffect(() => {
    const handleSyncCheck = () => {
      // We check session storage or common feature storage for the flag
      // Most of our features use localStorage, so we can check if any of them have changed
      const commonKeys = [
        'ai-study-dna-v1',
        'ai-blackbox-intelligence-v1',
        'ai-reality-reports-v1',
        'ai-exam-history'
      ];
      
      let simulatedFound = false;
      for (const key of commonKeys) {
        const val = localStorage.getItem(key);
        if (val && val.includes('"_simulated":true')) {
          simulatedFound = true;
          break;
        }
      }
      setIsSimulated(simulatedFound);
    };

    handleSyncCheck();
    // Re-check periodically or on storage events
    window.addEventListener('storage', handleSyncCheck);
    const interval = setInterval(handleSyncCheck, 5000);
    
    return () => {
      window.removeEventListener('storage', handleSyncCheck);
      clearInterval(interval);
    };
  }, []);

  if (!isSimulated) return null;

  return (
    <div className="fixed top-24 right-4 z-[150]">
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative"
      >
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            "p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-rose-500/20 shadow-2xl flex items-center gap-3 group transition-all",
            showDetails ? "rounded-b-none" : ""
          )}
        >
          <div className="relative">
             <Cpu size={18} className="text-rose-500 animate-pulse" />
             <div className="absolute -top-1 -right-1">
                <ZapOff size={8} className="text-rose-400" />
             </div>
          </div>
          <div className="text-left">
             <div className="text-[8px] font-black uppercase text-rose-500/60 tracking-widest leading-none">Neural Link</div>
             <div className="text-[10px] font-black italic text-white uppercase tracking-tighter">Restricted</div>
          </div>
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 w-48 bg-black/90 backdrop-blur-2xl border border-rose-500/20 rounded-b-2xl p-4 shadow-2xl space-y-3"
            >
               <div className="flex items-center gap-2 text-rose-400">
                  <ShieldAlert size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Quota Active</span>
               </div>
               <p className="text-[10px] text-white/60 font-medium leading-relaxed italic">
                 "High neural traffic detected. System operating on local behavioral simulation mode. Full link restores soon."
               </p>
               <div className="pt-2 border-t border-white/5">
                 <div className="flex justify-between items-center text-[8px] font-black uppercase text-rose-500/40">
                    <span>Authenticity</span>
                    <span>84.2% (Simulated)</span>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
