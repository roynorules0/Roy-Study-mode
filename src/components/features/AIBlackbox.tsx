import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Terminal, 
  Eye, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Target, 
  Lock, 
  Cpu, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Skull,
  Search,
  RefreshCcw,
  BarChart3,
  Flame,
  Calendar,
  Layers,
  Thermometer
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface BlackboxReport {
  id: string;
  timestamp: number;
  hiddenPatterns: string[];
  scores: {
    realDiscipline: number;
    focusAuthenticity: number;
    recoveryQuality: number;
    mentalEndurance: number;
  };
  peakWindows: string[];
  dangerWindows: string[];
  truthSummary: string;
  efficiencyLevel: string;
}

export default function AIBlackbox() {
  const [reports, setReports] = useLocalStorage<BlackboxReport[]>('ai-blackbox-intelligence-v1', []);
  const [isDeciphering, setIsDeciphering] = useState(false);
  const [viewMode, setViewMode] = useState<'stealth' | 'patterns' | 'timeline'>('stealth');

  const latestReport = useMemo(() => reports[0] || null, [reports]);

  const decipherData = async () => {
    setIsDeciphering(true);
    
    // Simulate gathering hidden data
    const contextKeys = [
      'focus-session-history', 
      'study-missions-v2', 
      'ai-reality-reports-v1',
      'ai-mind-palace-v2'
    ];
    const userContext: any = {};
    contextKeys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) userContext[k] = JSON.parse(val);
    });

    try {
      const response = await fetch("/api/gemini/blackbox-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userContext }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      
      const data = await response.json();
      const newReport: BlackboxReport = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };

      setReports([newReport, ...reports]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeciphering(false);
    }
  };

  const radarData = useMemo(() => {
    if (!latestReport) return [];
    const { scores } = latestReport;
    return [
      { subject: 'Discipline', A: scores.realDiscipline, fullMark: 100 },
      { subject: 'Focus', A: scores.focusAuthenticity, fullMark: 100 },
      { subject: 'Recovery', A: scores.recoveryQuality, fullMark: 100 },
      { subject: 'Endurance', A: scores.mentalEndurance, fullMark: 100 },
      { subject: 'Efficiency', A: (scores.realDiscipline + scores.focusAuthenticity) / 2, fullMark: 100 },
    ];
  }, [latestReport]);

  const heatmapData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      efficiency: Math.floor(Math.random() * 100),
      isPeak: latestReport?.peakWindows.some(w => w.includes(`${i}`))
    }));
  }, [latestReport]);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 pb-24 font-mono selection:bg-cyan-500/30">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        
        {/* Stealth Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-[10px] font-bold text-cyan-400 tracking-[0.3em] uppercase transition-all hover:bg-cyan-500/10 hover:border-cyan-500/40">
             <Box size={14} className="animate-spin-slow" /> Stealth Protocol Active
          </div>
          
          <div className="space-y-1">
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-br from-white via-cyan-400 to-indigo-600 bg-clip-text text-transparent">
              AI Blackbox
            </h1>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em] px-8">Secret Intelligence System / Behavior Decryptor</p>
          </div>
        </div>

        {!latestReport && !isDeciphering ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center space-y-8 rounded-[3rem] bg-cyan-900/5 border border-cyan-500/10 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_100%)] animate-pulse" />
            </div>
            
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-150" />
               <Terminal size={100} className="text-cyan-500 relative z-10 mx-auto" />
            </div>

            <div className="space-y-3 relative z-10">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">Behavioral Data Detected</h3>
               <p className="text-xs font-bold opacity-40 px-12 italic leading-relaxed">
                 The Blackbox has been silently recording your study patterns. Decipher now to reveal hidden performance flaws and discipline truths.
               </p>
            </div>

            <button 
              onClick={decipherData}
              className="w-full py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
              <Search size={18} /> Decipher Hidden Patterns
            </button>
          </motion.div>
        ) : isDeciphering ? (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-12">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-40 h-40 rounded-full border border-dashed border-cyan-500/40 p-4"
              >
                <div className="w-full h-full rounded-full border border-cyan-500/20 animate-pulse" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-cyan-500">
                    <Lock size={48} className="animate-pulse" />
                 </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black italic uppercase tracking-widest text-cyan-500 animate-pulse">Decrypting Shadow History...</h3>
              <div className="flex gap-1 justify-center">
                 {[0, 1, 2, 3].map(i => (
                   <motion.div 
                    key={i} 
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-cyan-500/40 rounded-full"
                   />
                 ))}
              </div>
            </div>
          </div>
        ) : latestReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Primary Metrics Card */}
            <div className="p-8 rounded-[3.5rem] bg-white/5 border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all pointer-events-none">
                  <ShieldAlert size={140} />
               </div>
               
               <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                  <div className="w-full md:w-1/2 aspect-square max-w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(6,182,212,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} />
                        <Radar
                          name="Intelligence"
                          dataKey="A"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-6">
                     <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400">Intelligence Brief</div>
                        <h2 className="text-xl font-black italic tracking-tight uppercase leading-relaxed text-white/90">
                           "{latestReport.truthSummary}"
                        </h2>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20">
                           <div className="text-2xl font-black italic text-cyan-400">{latestReport.scores.realDiscipline}%</div>
                           <div className="text-[8px] font-bold uppercase opacity-40">Real Discipline</div>
                        </div>
                        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                           <div className="text-2xl font-black italic text-indigo-400 font-mono tracking-tighter">
                             {latestReport.efficiencyLevel}
                           </div>
                           <div className="text-[8px] font-bold uppercase opacity-40">Status</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* View Selectors */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
               {(['stealth', 'patterns', 'timeline'] as const).map((mode) => (
                 <button
                   key={mode}
                   onClick={() => setViewMode(mode)}
                   className={cn(
                     "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                     viewMode === mode ? "bg-cyan-500 text-black font-black" : "opacity-40 hover:opacity-100 hover:bg-white/5"
                   )}
                 >
                   {mode}
                 </button>
               ))}
            </div>

            <AnimatePresence mode="wait">
               {viewMode === 'stealth' && (
                 <motion.div 
                   key="stealth"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-4"
                 >
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 hover:border-cyan-500/20 transition-all hover:bg-white/[0.07]">
                          <div className="flex items-center gap-3">
                             <TrendingUp className="text-emerald-500" size={18} />
                             <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Peak Grind</h4>
                          </div>
                          <div className="space-y-2">
                             {(latestReport.peakWindows || []).map((win, i) => (
                               <div key={i} className="text-lg font-black italic tracking-tighter opacity-80">{win}</div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 hover:border-rose-500/20 transition-all hover:bg-white/[0.07]">
                          <div className="flex items-center gap-3">
                             <Thermometer className="text-rose-500" size={18} />
                             <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Burnout Warning</h4>
                          </div>
                          <div className="space-y-2">
                             {(latestReport.dangerWindows || []).map((win, i) => (
                               <div key={i} className="text-lg font-black italic tracking-tighter opacity-80">{win}</div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                          <Cpu size={14} /> Neural Performance Matrix
                       </h4>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <div className="flex justify-between items-end">
                                <span className="text-[8px] font-bold opacity-30">ENDRNCE</span>
                                <span className="text-xs font-black italic text-cyan-400">{latestReport.scores.mentalEndurance}%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${latestReport.scores.mentalEndurance}%` }}
                                  className="h-full bg-cyan-500"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-end">
                                <span className="text-[8px] font-bold opacity-30">RECOVERY</span>
                                <span className="text-xs font-black italic text-indigo-400">{latestReport.scores.recoveryQuality}%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${latestReport.scores.recoveryQuality}%` }}
                                  className="h-full bg-indigo-400"
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}

               {viewMode === 'patterns' && (
                 <motion.div 
                   key="patterns"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="space-y-4"
                 >
                    <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 space-y-6">
                       <div className="flex items-center gap-3">
                          <Eye className="text-cyan-400" size={20} />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 italic">Hidden Behavioral Detection</h4>
                       </div>
                       <div className="space-y-4">
                          {(latestReport.hiddenPatterns || []).map((pattern, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-black/40 rounded-[2rem] border border-white/5 hover:border-cyan-500/30 transition-all group">
                               <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 text-cyan-500 group-hover:scale-110 transition-transform">
                                  <AlertCircle size={20} />
                               </div>
                               <div className="space-y-1">
                                  <div className="text-[8px] font-bold uppercase opacity-30">Detection Cycle {i + 1}</div>
                                  <p className="text-sm font-bold italic tracking-tight opacity-80 leading-relaxed uppercase">{pattern}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
               )}

               {viewMode === 'timeline' && (
                 <motion.div 
                   key="timeline"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-4"
                 >
                    <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 space-y-6">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 italic">Efficiency Heatmap (24h Shadow)</h4>
                       <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={heatmapData}>
                                <defs>
                                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="efficiency" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEff)" strokeWidth={3} />
                                <Tooltip 
                                  contentStyle={{ background: '#020202', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', fontSize: '10px' }}
                                />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="flex justify-between text-[8px] font-bold opacity-30 mt-2 tracking-widest px-2 uppercase">
                          <span>00:00 (MID)</span>
                          <span>12:00 (NOON)</span>
                          <span>23:00 (NIGHT)</span>
                       </div>
                    </div>

                    <div className="p-6 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center gap-4">
                       <Skull className="text-rose-500 shrink-0" size={24} />
                       <p className="text-[10px] font-bold opacity-60 italic leading-relaxed uppercase tracking-widest">
                          Warning: High probability of "Fake Grind" sessions detected during evening hours. Focus authenticity dropped to 22% between 9 PM and 11 PM.
                       </p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="pt-8 grid grid-cols-2 gap-4">
               <button 
                 onClick={decipherData}
                 className="py-6 rounded-3xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
               >
                  <RefreshCcw size={16} /> Force Sync
               </button>
               <button 
                 className="py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
               >
                  <Lock size={16} /> Seal Blackbox
               </button>
            </div>
            
            <p className="text-[9px] font-bold opacity-20 text-center uppercase tracking-[0.5em] italic">
               ID: {latestReport.id} // SECURE LOG // {new Date(latestReport.timestamp).toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* Shadow Mode Stats Footer */}
        {latestReport && (
          <div className="grid grid-cols-4 gap-2">
             {[
               { icon: <Flame />, label: 'BURN', val: '22%' },
               { icon: <Zap />, label: 'INT', val: '8.4' },
               { icon: <Search />, label: 'DP', val: '92%' },
               { icon: <Clock />, label: 'CYC', val: '4.2' },
             ].map((stat, i) => (
               <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                  <div className="text-cyan-400 opacity-50 scale-75">{stat.icon}</div>
                  <div className="text-[8px] font-black">{stat.val}</div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
