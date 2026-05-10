import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Flame, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Award,
  ZapOff,
  RefreshCw,
  Lightbulb,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AnalyticsData, StudySession, Task, StudyAnalysis, UserStats } from '../../types';
import { analyzeStudyData } from '../../services/analyzerService';
import { format } from 'date-fns';

interface SmartStudyAnalyzerProps {
  apiKey?: string;
  stats: UserStats;
  analytics: AnalyticsData[];
  tasks: Task[];
  sessions: StudySession[];
}

export default function SmartStudyAnalyzer({ apiKey, stats, analytics, tasks, sessions }: SmartStudyAnalyzerProps) {
  const [analysis, setAnalysis] = useLocalStorage<StudyAnalysis | null>('study-analysis-cache', null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async () => {
    if (!apiKey) {
      setError("Add Gemini API key in Settings to activate AI Hub features.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeStudyData(apiKey, stats, analytics, tasks, sessions);
      setAnalysis(result);
    } catch (err) {
      setError("AI was unable to process your study patterns right now.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto analyze only if cache is old (> 6 hours) or non-existent
    const sixHours = 6 * 60 * 60 * 1000;
    if (!analysis || (Date.now() - (analysis.lastAnalyzed || 0) > sixHours)) {
      if (apiKey && analytics.length > 0) {
        performAnalysis();
      }
    }
  }, [apiKey]);

  const recentData = useMemo(() => {
    return analytics.slice(-7).map(d => ({
      date: format(new Date(d.date), 'MMM dd'),
      intensity: d.intensityMinutes,
      score: d.focusScore
    }));
  }, [analytics]);

  if (!apiKey) {
    return (
      <div className="p-8 text-center glass rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center text-indigo-400">
           <Brain size={32} />
        </div>
        <h3 className="text-xl font-black uppercase italic tracking-tighter">AI Analyzer Locked</h3>
        <p className="text-xs opacity-50 px-4">Enter your Gemini API key in settings to unlock the deep neural analyzer.</p>
        <button 
          onClick={() => {/* Navigate to settings */}}
          className="px-6 py-3 bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
        >
          Open Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="flex justify-between items-end px-2">
         <div className="space-y-0.5">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Study Analyzer</h2>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
               <Sparkles size={10} className="text-purple-400" /> Neural Behavioral Suite
            </p>
         </div>
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
      </header>

      {isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2rem] glass border border-indigo-500/30 text-center space-y-4"
        >
           <div className="relative w-12 h-12 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-xl border-2 border-indigo-500 border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                 <Brain size={20} />
              </div>
           </div>
           <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Analyzing patterns...</p>
              <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Calculating neural velocity</p>
           </div>
        </motion.div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Main Insight Card */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20 group"
          >
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse" />
             
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                   <Brain size={12} /> Daily Neural Report
                </div>
                <h3 className="text-xl font-black italic tracking-tight leading-tight pr-6">
                   {analysis.todayReport}
                </h3>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                   <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
                      <div className="text-[8px] font-bold opacity-60 uppercase tracking-widest mb-1">Productivity</div>
                      <div className="text-lg font-black">{analysis.productivityScore}%</div>
                   </div>
                   <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
                      <div className="text-[8px] font-bold opacity-60 uppercase tracking-widest mb-1">Focus</div>
                      <div className="text-lg font-black">{analysis.focusQuality}%</div>
                   </div>
                   <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
                      <div className="text-[8px] font-bold opacity-60 uppercase tracking-widest mb-1">Discipline</div>
                      <div className="text-lg font-black">{analysis.disciplineLevel}</div>
                   </div>
                </div>
             </div>
          </motion.section>

          {/* Hinglish Insight (The "Bhai" advice) */}
          <section className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
             <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                   <Sparkles size={18} className="text-indigo-400" />
                </div>
                <div className="space-y-1">
                   <div className="text-[8px] font-black uppercase tracking-widest opacity-30">AI Deep Insight</div>
                   <p className="text-sm font-bold leading-relaxed italic text-white/90">
                      "{analysis.hinglishInsight}"
                   </p>
                </div>
             </div>
          </section>

          {/* Weak Subject Section */}
          <div className="grid grid-cols-1 gap-3">
             <div className="p-5 rounded-[2rem] glass border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={24} />
                   </div>
                   <div>
                      <div className="text-[8px] font-black uppercase tracking-widest opacity-30">Focus Needed</div>
                      <h4 className="font-black italic uppercase tracking-tighter text-sm text-rose-400">{analysis.weakestSubject}</h4>
                      <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{analysis.weakestChapter}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-xs font-black text-rose-500">WEAK AREA</div>
                   <div className="text-[8px] opacity-30 uppercase font-bold">Neural Lag detected</div>
                </div>
             </div>

             <div className="p-5 rounded-[2rem] glass border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                   <Target size={12} /> Revision Priority
                </div>
                <div className="flex flex-wrap gap-2">
                   {analysis.revisionPriority.map((item, idx) => (
                     <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                        {item}
                     </span>
                   ))}
                </div>
             </div>
          </div>

          {/* Performance Graph */}
          <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
             <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                   <TrendingUp size={14} className="text-indigo-400" /> Focus Trend
                </h3>
             </div>
             <div className="h-40 w-full opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={recentData}>
                      <defs>
                         <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <Area 
                         type="monotone" 
                         dataKey="score" 
                         stroke="#6366f1" 
                         fillOpacity={1} 
                         fill="url(#colorFocus)" 
                         strokeWidth={3}
                      />
                      <XAxis hide dataKey="date" />
                      <Tooltip 
                         contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>

          {/* Burnout & Predictions */}
          <div className="grid grid-cols-2 gap-3">
             <section className="p-5 rounded-[2rem] glass border border-white/5 space-y-3 relative overflow-hidden group">
                {analysis.burnoutRisk === 'high' && (
                   <motion.div 
                     animate={{ opacity: [0.1, 0.3, 0.1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-rose-500"
                   />
                )}
                <div className="relative z-10">
                   <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                      {analysis.burnoutRisk === 'low' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <ZapOff size={16} className="text-rose-500" />}
                   </div>
                   <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Burnout Risk</div>
                   <div className={cn(
                     "text-lg font-black uppercase italic tracking-tighter",
                     analysis.burnoutRisk === 'high' ? 'text-rose-500' : 'text-emerald-500'
                   )}>{analysis.burnoutRisk}</div>
                </div>
             </section>

             <section className="p-5 rounded-[2rem] glass border border-white/5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                   <Award size={16} className="text-indigo-400" />
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Ready Score</div>
                <div className="text-lg font-black uppercase italic tracking-tighter text-indigo-400">{analysis.examReadiness}%</div>
             </section>
          </div>

          <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                <Lightbulb size={12} /> AI Smart Recommendations
             </div>
             <div className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-colors">
                     <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <ArrowRight size={12} />
                     </div>
                     <p className="text-[10px] font-bold opacity-80 leading-tight">{rec}</p>
                  </div>
                ))}
             </div>
          </section>

          <footer className="text-center py-6">
             <div className="text-[8px] font-black uppercase tracking-[0.5em] opacity-10">Last Analyzed: {format(new Date(analysis.lastAnalyzed), 'MMM dd, hh:mm a')}</div>
          </footer>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
           <AlertTriangle size={32} className="text-rose-500 mx-auto" />
           <p className="text-xs font-bold text-rose-500">{error}</p>
           <button 
             onClick={performAnalysis}
             className="text-[10px] font-black uppercase tracking-[0.2em] underline"
           >
             Try Again
           </button>
        </div>
      )}

      {/* Prediction Banner */}
      {analysis && (
        <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
           </div>
           <p className="text-[10px] font-bold italic text-indigo-400">
              "AI Prediction: {analysis.prediction}"
           </p>
        </div>
      )}
    </div>
  );
}
