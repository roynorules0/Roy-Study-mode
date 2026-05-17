import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Zap, 
  Shield, 
  Activity, 
  Wind, 
  Map as MapIcon, 
  Trophy, 
  Clock, 
  Eye, 
  TrendingUp, 
  Lock,
  Sparkles,
  RefreshCw,
  Target,
  User,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Timeline {
  name: string;
  description: string;
  status: string;
}

interface LifeResults {
  successProbability: number;
  dreamDistance: string;
  timelines: Timeline[];
  hinglishAlert: string;
  decisionImpact: string;
  lifeStats: {
    financial: number;
    health: number;
    confidence: number;
  };
}

interface LifeProgress {
  simulationsRun: number;
  lastSync: string;
  energyStats: {
    stamina: number;
    force: number;
    resistance: number;
  };
}

export default function AILifeSimulator() {
  const [results, setResults] = useLocalStorage<LifeResults>('life_sim_results', {
    successProbability: 35,
    dreamDistance: 'Infinite',
    timelines: [
      { name: 'Elite Vision', description: 'Maximum discipline leads to peak reality.', status: 'Locked' },
      { name: 'Standard Flow', description: 'Average effort, average results.', status: 'Active' },
      { name: 'Critical Burnout', description: 'High anxiety, low output cycle.', status: 'Risk High' }
    ],
    hinglishAlert: 'Simulation initialized. Need more discipline data for future prediction.',
    decisionImpact: 'Awaiting first focus session data...',
    lifeStats: { financial: 20, health: 60, confidence: 30 }
  });

  const [progress, setProgress] = useLocalStorage<LifeProgress>('life_sim_progress', {
    simulationsRun: 0,
    lastSync: 'None',
    energyStats: { stamina: 40, force: 30, resistance: 50 }
  });

  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/gemini/life-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userContext: progress,
          currentHabits: {
            studyHours: 4,
            focusScore: 72,
            consistency: 85
          }
        })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Life Simulation Link Failed');
      }

      if (data && !data.error) {
        setResults(prev => ({ ...prev, ...data }));
        setProgress(p => ({
          ...p,
          simulationsRun: (p.simulationsRun || 0) + 1,
          lastSync: new Date().toLocaleDateString()
        }));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Life Synchronization Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 overflow-hidden relative font-mono",
      isActive ? "bg-black text-white" : "bg-[#050505] text-slate-500"
    )}>
      
      {/* Background Ambience */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
             <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,var(--life-color)_0%,transparent_70%)] [--life-color:#0ea5e9]" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-6">
              <div className={cn(
                "p-5 rounded-[2.5rem] border transition-all duration-1000",
                isActive ? "bg-sky-500/10 border-sky-500/20 shadow-[0_0_40px_rgba(14,165,233,0.1)]" : "bg-slate-900/40 border-slate-800"
              )}>
                 <Clock className={cn("w-10 h-10", isActive ? "text-sky-400" : "text-slate-700")} />
              </div>
              <div>
                 <h1 className={cn(
                   "text-3xl font-black tracking-tighter transition-all uppercase",
                   isActive ? "text-white" : "text-slate-600"
                 )}>AI LIFE <span className="text-sky-500 italic">SIMULATOR</span></h1>
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest mt-1">
                    <span className={cn(
                      "flex items-center gap-1",
                      isActive ? "text-sky-400" : "text-slate-600"
                    )}>
                       <Activity className="w-3 h-3" /> LIFE ENGINE: {isActive ? 'SYNCED' : 'OFFLINE'}
                    </span>
                    <span className="opacity-20 text-slate-500">|</span>
                    <span className="text-slate-500">SIMS RUN: {progress.simulationsRun}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                   "px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl",
                   isActive 
                     ? "bg-rose-500 text-white border-rose-400 hover:bg-rose-600 shadow-rose-500/20" 
                     : "bg-sky-600 text-white border-sky-500 hover:bg-sky-500 shadow-sky-500/20"
                )}
              >
                {isActive ? 'EXIT SIMULATION' : 'INITIALIZE LIFE ENGINE'}
              </button>
           </div>
        </div>

        {isActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* Left Column: Life Energy & Stats */}
             <div className="lg:col-span-4 space-y-6">
                
                {/* Survival Energy */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 space-y-8 backdrop-blur-xl">
                   <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Life Energy Core</h3>
                      <Shield className="text-sky-500" size={16} />
                   </div>

                   <div className="space-y-6">
                      {[
                        { label: 'Mental Stamina', val: progress.energyStats.stamina, color: 'bg-sky-500' },
                        { label: 'Discipline Force', val: progress.energyStats.force, color: 'text-amber-400' },
                        { label: 'Burnout Resistance', val: progress.energyStats.resistance, color: 'bg-rose-500' },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                              <span className="text-slate-400">{stat.label}</span>
                              <span className="text-white">{stat.val}%</span>
                           </div>
                           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.val}%` }}
                                className={cn("h-full", stat.color.includes('bg') ? stat.color : 'bg-amber-500')}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* decision impact */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 space-y-6">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" /> Decision Impact
                   </h3>
                   <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                      <p className="text-xs font-medium italic text-slate-400 leading-relaxed">
                         "{results.decisionImpact}"
                      </p>
                      <div className="flex items-center gap-2 text-[8px] font-black text-rose-500 uppercase">
                         <TrendingUp size={10} className="rotate-180" /> Negative Drift Potential
                      </div>
                   </div>
                </div>

             </div>

             {/* Main Projection Hub */}
             <div className="lg:col-span-8 space-y-6">
                
                {/* Future Probability HUD */}
                <div className="bg-gradient-to-br from-slate-900 to-black border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group">
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                      
                      <div className="text-center md:text-left space-y-6 flex-1">
                         <div className="px-6 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 inline-block">
                            Projected Success
                         </div>
                         <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black italic tracking-tighter leading-none text-white uppercase">
                            {results.successProbability}% <span className="text-sky-500">PROBABILITY</span>
                         </h2>
                         <p className="text-lg italic font-black text-slate-300 max-w-xl">
                            "{results.hinglishAlert}"
                         </p>
                      </div>

                      <div className="w-48 h-48 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                         <div className="text-center">
                            <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Dream Life</div>
                            <div className="text-xl font-black text-white uppercase italic">{results.dreamDistance}</div>
                         </div>
                         {/* Animated Ring */}
                         <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="96"
                              cy="96"
                              r="88"
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeDasharray="552.92"
                              strokeDashoffset={552.92 - (552.92 * results.successProbability) / 100}
                              className="text-sky-500"
                            />
                         </svg>
                      </div>

                   </div>

                   <div className="mt-12 flex flex-col md:flex-row gap-4 relative z-10">
                      <button 
                        onClick={runSimulation}
                        disabled={loading}
                        className="flex-1 py-5 bg-sky-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> {loading ? 'RECALCULATING FUTURE...' : 'SYNC FUTURE TIMELINE'}
                      </button>
                      <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                         <Target size={18} /> Optimization Plan
                      </button>
                   </div>

                   {/* Background Elements */}
                   <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full -z-0" />
                </div>

                {/* Timelines Projection */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 space-y-8 backdrop-blur-xl">
                   <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Future Timelines</h3>
                      <MapIcon className="text-slate-600" size={16} />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {results.timelines.map((t, i) => (
                        <div key={i} className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-sky-500/20 transition-all group">
                           <div className="flex justify-between items-start">
                              <h4 className="text-sm font-black text-white italic uppercase">{t.name}</h4>
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                t.status === 'Likely' ? "bg-emerald-500/10 text-emerald-500" : t.status === 'Risk High' ? "bg-rose-500/10 text-rose-500" : "bg-sky-500/10 text-sky-500"
                              )}>
                                 <Wind size={12} />
                              </div>
                           </div>
                           <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                              {t.description}
                           </p>
                           <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[8px] font-black text-slate-600 uppercase">Probability</span>
                              <span className="text-[9px] font-black text-sky-400 uppercase">{t.status}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Self Comparison Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legacy Profile</h3>
                         <Trophy className="text-amber-500" size={16} />
                      </div>
                      <div className="space-y-4">
                         {[
                           { label: 'Financial Freedom', val: results.lifeStats.financial, color: 'bg-sky-500' },
                           { label: 'Health Integrity', val: results.lifeStats.health, color: 'bg-emerald-500' },
                           { label: 'Social Confidence', val: results.lifeStats.confidence, color: 'bg-blue-500' },
                         ].map((s, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[9px] font-bold uppercase">
                                 <span className="text-slate-500">{s.label}</span>
                                 <span className="text-white">{s.val}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full"><motion.div animate={{ width: `${s.val}%` }} className={cn("h-full rounded-full", s.color)} /></div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Curve</h3>
                         <TrendingUp className="text-emerald-500" size={16} />
                      </div>
                      <div className="flex flex-col items-center justify-center h-full pb-8">
                         <div className="w-24 h-24 rounded-full border-4 border-sky-500/20 flex items-center justify-center relative">
                            <Sparkles className="text-sky-400 animate-pulse" size={32} />
                            <motion.div 
                               animate={{ scale: [1, 1.2, 1] }} 
                               transition={{ duration: 4, repeat: Infinity }}
                               className="absolute inset-0 bg-sky-500/10 rounded-full blur-xl"
                            />
                         </div>
                         <div className="mt-4 text-center">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Trend</div>
                            <div className="text-lg font-black text-emerald-400 italic">UPWARD ASCENT</div>
                         </div>
                      </div>
                   </div>

                </div>

             </div>
          </div>
        ) : (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-12 max-w-2xl mx-auto py-12">
             <div className="relative group">
                <motion.div 
                   animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1] }}
                   transition={{ duration: 8, repeat: Infinity }}
                   className="absolute inset-0 bg-sky-500 rounded-full blur-[120px]"
                />
                <div className="w-32 h-32 bg-slate-900/50 border border-slate-800 rounded-[3rem] flex items-center justify-center relative z-10 group-hover:border-sky-500/50 transition-colors">
                   <Clock size={64} className="text-slate-800 group-hover:text-sky-500 transition-colors" />
                </div>
             </div>
             
             <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">REVEAL YOUR FUTURE</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                   AI-Life Simulator uses your study depth and consistency to architect your future trajectory. Every hour of focus today adds a pixel to your dream reality.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 hover:border-sky-500/20 transition-all text-center group">
                   <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Discipline Factor</div>
                   <div className="text-2xl font-black text-white group-hover:text-sky-400 transition-colors">STABLE</div>
                </div>
                <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 hover:border-sky-500/20 transition-all text-center group">
                   <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Legacy Health</div>
                   <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">OPTIMAL</div>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Mini Life HUD Widget */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/90 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-full z-50 shadow-2xl"
          >
             <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_15px_#0ea5e9]" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase text-slate-500">Success Factor</span>
                   <span className="text-xs font-black italic text-white uppercase">{results.successProbability}%</span>
                </div>
             </div>
             <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                <User className="text-white" size={16} />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase text-slate-500">Trajectory</span>
                   <span className="text-xs font-black italic text-white uppercase">UPWARD</span>
                </div>
             </div>
             <div className="flex items-center gap-2 text-sky-400 group cursor-pointer">
                <Eye size={16} className="group-hover:scale-120 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Future Log</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
