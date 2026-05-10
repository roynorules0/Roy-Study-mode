import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Moon, 
  Zap, 
  Wind, 
  Activity, 
  Sparkles, 
  Coffee, 
  Sun, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LifeBalanceData, AnalyticsData, StudySession } from '../../types';
import { analyzeLifeBalance } from '../../services/lifeBalanceService';
import { format } from 'date-fns';

interface AILifeBalancerProps {
  apiKey?: string;
  analytics: AnalyticsData[];
  sessions: StudySession[];
}

export default function AILifeBalancer({ apiKey, analytics, sessions }: AILifeBalancerProps) {
  const [balance, setBalance] = useLocalStorage<LifeBalanceData | null>('life-balance-cache', null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const performAnalysis = async () => {
    if (!apiKey) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeLifeBalance(apiKey, analytics, sessions);
      setBalance(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const sixHours = 6 * 60 * 60 * 1000;
    if (!balance || (Date.now() - (balance.lastAnalyzed || 0) > sixHours)) {
      if (apiKey && analytics.length > 0) {
        performAnalysis();
      }
    }
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div className="p-8 text-center glass rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center text-rose-400">
           <Heart size={32} />
        </div>
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Coach Locked</h3>
        <p className="text-xs opacity-50 px-4 leading-relaxed">Add your Gemini API key to activate the intelligent AI Life Balance system.</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-6 pb-24 max-w-md mx-auto px-1 gpu transition-all duration-700",
      isRecoveryMode && "grayscale-[0.5] opacity-90"
    )}>
      <header className="flex justify-between items-end px-2">
         <div className="space-y-0.5">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Life Balancer</h2>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
               <Activity size={10} className="text-emerald-400" /> Bio-PerformanceSync
            </p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setIsRecoveryMode(!isRecoveryMode)}
              className={cn(
                "p-2 rounded-xl border transition-all",
                isRecoveryMode ? "bg-emerald-500 text-white border-emerald-400" : "glass border-white/10"
              )}
            >
               <Wind size={16} />
            </button>
            <button 
              onClick={performAnalysis}
              disabled={isAnalyzing}
              className={cn(
                "p-2 rounded-xl glass border border-white/10 transition-all",
                isAnalyzing && "animate-spin opacity-50"
              )}
            >
              <RefreshCw size={16} />
            </button>
         </div>
      </header>

      {isAnalyzing && (
        <div className="p-6 rounded-[2rem] glass border border-emerald-500/30 text-center space-y-4">
           <div className="relative w-12 h-12 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-xl border-2 border-emerald-500 border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                 <Heart size={20} />
              </div>
           </div>
           <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Balancing Life Gears...</p>
        </div>
      )}

      {balance && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Balance Card */}
          <section className="grid grid-cols-1 gap-3">
             <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Brain size={120} /></div>
                <div className="relative z-10 flex justify-between items-start">
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Check</div>
                         <h3 className="text-lg font-black italic leading-tight">"{balance.hinglishAdvice}"</h3>
                      </div>
                      <div className="flex gap-4">
                         <div className="text-center">
                            <div className="text-xl font-black">{balance.healthScore}</div>
                            <div className="text-[7px] font-black uppercase opacity-60">Health</div>
                         </div>
                         <div className="w-px h-8 bg-white/10" />
                         <div className="text-center">
                            <div className="text-xl font-black">{balance.productivityBalance}</div>
                            <div className="text-[7px] font-black uppercase opacity-60">Balance</div>
                         </div>
                         <div className="w-px h-8 bg-white/10" />
                         <div className="text-center">
                            <div className="text-xl font-black">{balance.recoveryLevel}</div>
                            <div className="text-[7px] font-black uppercase opacity-60">Recovery</div>
                         </div>
                      </div>
                   </div>
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Zap size={32} />
                   </div>
                </div>
             </div>
          </section>

          {/* Sleep Intelligence */}
          <div className="grid grid-cols-2 gap-3">
             <section className="p-5 rounded-[2rem] glass border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30 text-emerald-400">
                   <Moon size={12} /> Sleep Hub
                </div>
                <div className="space-y-1">
                   <div className="text-xs font-black italic">{balance.bestSleepTime}</div>
                   <div className="text-[8px] font-black opacity-30 uppercase">Optimal Sleep</div>
                </div>
                <div className="space-y-1">
                   <div className="text-xs font-black italic">{balance.bestWakeTime}</div>
                   <div className="text-[8px] font-black opacity-30 uppercase">Optimal Wake</div>
                </div>
             </section>

             <section className="p-5 rounded-[2rem] glass border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30 text-orange-400">
                   <Zap size={12} /> Stress Flow
                </div>
                <div className="text-center py-2">
                   <div className={cn(
                     "text-3xl font-black italic tracking-tighter",
                     balance.stressLevel > 60 ? "text-rose-500" : "text-emerald-500"
                   )}>{balance.stressLevel}%</div>
                   <div className="text-[8px] font-black opacity-30 uppercase mt-1">Stress Density</div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     className={cn("h-full", balance.stressLevel > 60 ? "bg-rose-500" : "bg-emerald-500")}
                     animate={{ width: `${balance.stressLevel}%` }}
                   />
                </div>
             </section>
          </div>

          {/* Burnout Meter */}
          <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4 relative overflow-hidden">
             {balance.burnoutRisk === 'high' && (
                <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
             )}
             <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Burnout Monitor</h3>
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg",
                  balance.burnoutRisk === 'low' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                  balance.burnoutRisk === 'medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                  'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                )}>
                   {balance.burnoutRisk} RISK
                </div>
             </div>
             <p className="text-[10px] font-bold opacity-30 px-1 italic">"{balance.energyPrediction}"</p>
          </section>

          {/* Smart Recommendations */}
          <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                <Sparkles size={12} className="text-emerald-400" /> Life Balance Protocols
             </div>
             <div className="space-y-3">
                {balance.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-emerald-500/5 transition-all">
                     <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <ArrowRight size={14} />
                     </div>
                     <p className="text-[11px] font-bold opacity-80 leading-snug">{rec}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Life Timeline Mockups (Compact) */}
          <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Life Metrics Sync</h3>
             <div className="flex justify-around items-end h-20 gap-1 px-4">
                {[45, 78, 60, 95, 23, 67, 89, 45, 90, 34].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       className={cn(
                         "absolute bottom-0 left-0 right-0 rounded-t-lg transition-colors",
                         h > 80 ? "bg-emerald-500" : h > 50 ? "bg-indigo-500" : "bg-rose-500"
                       )}
                     />
                  </div>
                ))}
             </div>
             <div className="flex justify-between text-[7px] font-black uppercase opacity-20 px-2 tracking-widest">
                <span>00:00</span>
                <span>08:00</span>
                <span>16:00</span>
                <span>24:00</span>
             </div>
          </section>

          {/* Recovery Tools */}
          <div className="grid grid-cols-2 gap-3 pb-4">
             <button className="p-5 rounded-[2rem] glass border border-white/5 hover:bg-emerald-500/5 transition-all group flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Coffee size={24} />
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Quick Recharge</div>
             </button>
             <button className="p-5 rounded-[2rem] glass border border-white/5 hover:bg-indigo-500/5 transition-all group flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Sun size={24} />
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Breathing AI</div>
             </button>
          </div>
        </div>
      )}

      {balance && (
        <footer className="text-center py-4">
           <div className="text-[8px] font-black uppercase opacity-10 tracking-[0.5em]">Synchronized at {format(new Date(balance.lastAnalyzed), 'hh:mm a')}</div>
        </footer>
      )}
    </div>
  );
}
