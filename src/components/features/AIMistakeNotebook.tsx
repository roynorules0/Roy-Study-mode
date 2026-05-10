import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  AlertTriangle, 
  Zap, 
  Flame, 
  Target, 
  ShieldAlert, 
  Activity, 
  History, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  Brain,
  Search,
  Filter,
  ArrowUpRight,
  CircleDashed,
  Crosshair
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MistakeState, Mistake, MistakeCategory } from '../../types';
import { analyzeMistakes } from '../../services/mistakeService';

interface AIMistakeNotebookProps {
  apiKey?: string;
}

const CATEGORY_MAP: Record<MistakeCategory, { label: string; color: string; bg: string }> = {
  conceptual: { label: 'Conceptual', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  silly: { label: 'Silly Mistake', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  formula: { label: 'Formula Error', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  time: { label: 'Time Pressure', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  guessing: { label: 'Guessing', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
  revision: { label: 'Revision Gap', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

export default function AIMistakeNotebook({ apiKey }: AIMistakeNotebookProps) {
  const [mistakeState, setMistakeState] = useLocalStorage<MistakeState>('ai-mistakes-v1', {
    mistakes: [
      {
        id: '1',
        questionText: 'What is the work done in a circular path?',
        subject: 'Physics',
        chapter: 'Work, Energy & Power',
        category: 'conceptual',
        userAnswer: 'Force x Distance',
        correctAnswer: 'Zero',
        explanation: 'Work done is zero because force is perpendicular to displacement.',
        frequency: 2,
        lastOccurred: Date.now() - 86400000,
        isRecovered: false
      },
      {
        id: '2',
        questionText: 'Molar mass of Na2CO3?',
        subject: 'Chemistry',
        chapter: 'Mole Concept',
        category: 'silly',
        userAnswer: '104',
        correctAnswer: '106',
        explanation: 'Calculated wrong atomic mass of Na. Na=23 (2*23=46), C=12, O=16(3*16=48). 46+12+48=106.',
        frequency: 1,
        lastOccurred: Date.now() - 172800000,
        isRecovered: false
      }
    ],
    confidenceScore: 68,
    lastAnalysis: Date.now(),
    hinglishFeedback: "Calculations tight rakho bhai, minor errors impact rank seriously 🔥 Weak concepts identified."
  });

  const [activeMistake, setActiveMistake] = useState<Mistake | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<MistakeCategory | 'all'>('all');
  const [recoveryMissions, setRecoveryMissions] = useState<string[]>([
    "Solve 15 Physics circular motion problems",
    "Revise atomic masses of common elements",
    "Repeat WPE formula drill"
  ]);

  const filteredMistakes = useMemo(() => {
    return mistakeState.mistakes.filter(m => filter === 'all' || m.category === filter);
  }, [mistakeState.mistakes, filter]);

  const stats = useMemo(() => {
    const subjects: Record<string, number> = {};
    mistakeState.mistakes.forEach(m => {
      subjects[m.subject] = (subjects[m.subject] || 0) + 1;
    });
    return Object.entries(subjects).sort((a,b) => b[1] - a[1]);
  }, [mistakeState.mistakes]);

  const syncAnalysis = async () => {
    if (!apiKey) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeMistakes(apiKey, mistakeState);
      setMistakeState({
        ...mistakeState,
        confidenceScore: res.confidenceScore,
        hinglishFeedback: res.hinglishFeedback,
        lastAnalysis: Date.now()
      });
      setRecoveryMissions(res.recoveryMissions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRecovered = (id: string) => {
    setMistakeState({
      ...mistakeState,
      mistakes: mistakeState.mistakes.map(m => 
        m.id === id ? { ...m, isRecovered: !m.isRecovered } : m
      )
    });
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Mistake Notebook</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-rose-500">
              <ShieldAlert size={10} /> Neural Error Log
           </p>
        </div>
        <button 
          onClick={syncAnalysis}
          disabled={isAnalyzing}
          className="p-3 rounded-2xl glass border border-white/5 text-rose-500 active:scale-90 transition-all"
        >
           {isAnalyzing ? <CircleDashed size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </header>

      {/* Main HUD Card */}
      <section className="p-8 rounded-[3.5rem] glass border border-rose-500/10 relative overflow-hidden shadow-2xl flex flex-col items-center">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Activity size={120} />
         </div>

         <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center p-2 relative">
               <motion.div 
                 className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               />
               <div className="text-center">
                  <div className="text-4xl font-black italic tracking-tighter leading-none">{mistakeState.confidenceScore}%</div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-1">Concept Stability</div>
               </div>
            </div>
         </div>

         <div className="text-center space-y-4 z-10 w-full px-4">
            <div className="p-4 rounded-[2rem] bg-rose-500/5 border border-rose-500/20">
               <p className="text-[10px] font-black italic uppercase italic tracking-tight leading-relaxed">
                  "{mistakeState.hinglishFeedback}"
               </p>
            </div>
         </div>
      </section>

      {/* Error Heatmap / Stats */}
      <section className="grid grid-cols-2 gap-3 px-2">
         {stats.slice(0, 2).map(([sub, count]) => (
           <div key={sub} className="p-5 rounded-[2.2rem] glass border border-white/5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                 <Zap size={30} />
              </div>
              <div className="text-[8px] font-black uppercase opacity-30 tracking-widest">{sub} Risk</div>
              <div className="flex items-end gap-2">
                 <div className="text-2xl font-black italic leading-none">{count}</div>
                 <span className="text-[9px] font-black opacity-20 uppercase mb-0.5">Errors</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full mt-2">
                 <div className="h-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" style={{ width: `${Math.min(100, count * 20)}%` }} />
              </div>
           </div>
         ))}
      </section>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
         <button 
           onClick={() => setFilter('all')}
           className={cn(
             "flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all",
             filter === 'all' ? "bg-white text-black" : "bg-white/5 text-white/40"
           )}
         >
            All
         </button>
         {(Object.keys(CATEGORY_MAP) as MistakeCategory[]).map(cat => (
           <button 
             key={cat}
             onClick={() => setFilter(cat)}
             className={cn(
               "flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border",
               filter === cat ? `${CATEGORY_MAP[cat].bg} ${CATEGORY_MAP[cat].color} border-white/20` : "bg-white/5 text-white/40 border-transparent"
             )}
           >
              {CATEGORY_MAP[cat].label}
           </button>
         ))}
      </div>

      {/* Mistake Feed */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Error Archive</h3>
            <span className="text-[10px] font-black opacity-20 uppercase font-mono">{filteredMistakes.length} Logs</span>
         </div>

         <div className="space-y-4">
            {filteredMistakes.map((mistake) => (
              <motion.div 
                key={mistake.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-6 rounded-[2.5rem] glass border relative overflow-hidden transition-all",
                  mistake.isRecovered ? "border-emerald-500/20 opacity-60" : "border-white/5"
                )}
              >
                 <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                       <span className={cn(
                         "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                         CATEGORY_MAP[mistake.category].bg,
                         CATEGORY_MAP[mistake.category].color
                       )}>
                          {CATEGORY_MAP[mistake.category].label}
                       </span>
                       <h4 className="text-sm font-black italic uppercase tracking-tight">{mistake.subject} • {mistake.chapter}</h4>
                    </div>
                    {mistake.frequency > 1 && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 animate-pulse">
                         <ShieldAlert size={12} /> Repeated x{mistake.frequency}
                      </div>
                    )}
                 </div>

                 <p className="text-xs font-black opacity-60 mb-6 leading-relaxed">
                    {mistake.questionText}
                 </p>

                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                       <div className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-1">Your Answer</div>
                       <div className="text-[10px] font-black text-rose-400 uppercase line-clamp-1">{mistake.userAnswer}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                       <div className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-1">Correct</div>
                       <div className="text-[10px] font-black text-emerald-400 uppercase line-clamp-1">{mistake.correctAnswer}</div>
                    </div>
                 </div>

                 <AnimatePresence>
                   {!mistake.isRecovered && (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                     >
                        <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 mb-4">
                           <p className="text-[10px] font-bold opacity-60 uppercase leading-relaxed italic">
                              "{mistake.explanation}"
                           </p>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="flex gap-2">
                    <button 
                      onClick={() => toggleRecovered(mistake.id)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        mistake.isRecovered ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                      )}
                    >
                       {mistake.isRecovered ? <CheckCircle2 size={12} /> : null}
                       {mistake.isRecovered ? 'Recovered' : 'Mark as Fixed'}
                    </button>
                    <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white/40">
                       <ArrowUpRight size={16} />
                    </button>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Recovery Missions HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-rose-500/10 space-y-4">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
            <Crosshair size={12} className="text-rose-500" /> Recovery Missions
         </div>
         <div className="space-y-3">
            {recoveryMissions.map((mission, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 text-[10px] font-black font-mono">
                       {i+1}
                    </div>
                    <span className="text-[10px] font-black uppercase italic tracking-tight opacity-70 group-hover:opacity-100">{mission}</span>
                 </div>
                 <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
         </div>
      </section>

      {/* Performance Footer HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-rose-400">
               Error Intensity
            </div>
            <div className="flex gap-1 items-end h-8">
               {Array.from({ length: 15 }).map((_, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ height: i * 2 }}
                   animate={{ height: Math.random() * 24 + 4 }}
                   transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                   className={cn(
                     "w-1 rounded-full transition-all duration-500",
                     i > 10 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-white/10"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none text-rose-500">
               {mistakeState.mistakes.filter(m => !m.isRecovered).length}
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Active Breaches</div>
         </div>
      </section>
    </div>
  );
}
