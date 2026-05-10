import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Search, 
  Target, 
  Sparkles, 
  ChevronRight, 
  CircleDashed,
  Flame,
  AlertTriangle,
  TrendingUp,
  Activity,
  ShieldAlert,
  BarChart3,
  Dna,
  Atom,
  Calculator,
  ScanHeart,
  Radar,
  Crosshair,
  Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { TopicPredictorState, PredictedTopic } from '../../types';
import { generateTopicPredictions } from '../../services/predictorService';

interface AITopicPredictorProps {
  apiKey?: string;
}

const PRIORITY_MAP = {
  'Critical': { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <Flame size={12} className="text-rose-500" /> },
  'Important': { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: <Zap size={12} className="text-orange-500" /> },
  'Moderate': { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Activity size={12} className="text-blue-500" /> },
  'Low Priority': { color: 'text-white/40', bg: 'bg-white/5', icon: <Sparkles size={12} className="text-white/40" /> }
};

const SUBJECT_CONFIG = {
  Physics: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: <Atom size={16} /> },
  Chemistry: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: <ScanHeart size={16} /> },
  Maths: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', icon: <Calculator size={16} /> },
  Biology: { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: <Dna size={16} /> }
};

export default function AITopicPredictor({ apiKey }: AITopicPredictorProps) {
  const [state, setState] = useLocalStorage<TopicPredictorState>('ai-topic-predictor-v1', {
    predictions: [
      {
        id: '1',
        name: 'Organic Reaction Mechanisms',
        subject: 'Chemistry',
        priority: 'Critical',
        probability: 98,
        urgency: 95,
        reason: 'Consistency in NEET/JEE patterns for last 5 years.',
        isWeakArea: true
      },
      {
        id: '2',
        name: 'Work, Energy & Power',
        subject: 'Physics',
        priority: 'Important',
        probability: 88,
        urgency: 72,
        reason: 'Foundation topic for heavy mechanics numericals.',
        isWeakArea: false
      }
    ],
    lastUpdate: Date.now(),
    aiInsights: "Organic Mechanics priority peak pe hai, logic-based retention avoid mat karo 🔥",
    riskMeter: 78,
    confidenceHeatmap: [
      { subject: 'Organic', score: 32 },
      { subject: 'Mechanics', score: 85 },
      { subject: 'Calculus', score: 64 },
      { subject: 'Inorganic', score: 91 }
    ]
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'predictions' | 'analytics'>('predictions');

  const filteredPredictions = useMemo(() => {
    return state.predictions.filter(p => filterSubject === 'All' || p.subject === filterSubject);
  }, [state.predictions, filterSubject]);

  const runMetaPrediction = async () => {
    if (!apiKey) return;
    setIsSyncing(true);
    try {
      const res = await generateTopicPredictions(apiKey, {}, filterSubject === 'All' ? 'Complete Syllabus' : filterSubject);
      setState({
        ...state,
        predictions: res.predictions,
        aiInsights: res.aiInsights,
        riskMeter: res.riskMeter,
        confidenceHeatmap: res.confidenceHeatmap,
        lastUpdate: Date.now()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Topic Predictor</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-rose-500">
              <Radar size={10} /> Probability Grid v2
           </p>
        </div>
        <button 
          onClick={runMetaPrediction}
          disabled={isSyncing}
          className="p-3 rounded-2xl glass border border-white/5 text-rose-500 active:scale-90 transition-all"
        >
           {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </header>

      {/* Main HUD: Risk Meter & AI Feedback */}
      <section className="p-8 rounded-[3.5rem] glass border border-rose-500/10 relative overflow-hidden flex flex-col items-center">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Gauge size={120} />
         </div>

         <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center p-2 relative">
               <motion.div 
                 className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 style={{ opacity: state.riskMeter / 100 }}
               />
               <div className="text-center">
                  <div className="text-4xl font-black italic tracking-tighter leading-none">{state.riskMeter}%</div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-1 text-rose-500">Total Study Risk</div>
               </div>
            </div>
         </div>

         <div className="text-center space-y-4 z-10 w-full px-4">
            <div className="p-4 rounded-[2rem] bg-rose-500/5 border border-rose-500/20">
               <p className="text-[10px] font-black italic uppercase tracking-tight leading-relaxed text-rose-100">
                  "{state.aiInsights}"
               </p>
            </div>
         </div>
      </section>

      {/* Fast Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl mx-2">
         <button 
           onClick={() => setActiveTab('predictions')}
           className={cn(
             "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest",
             activeTab === 'predictions' ? "bg-white text-black shadow-lg" : "text-white/40"
           )}
         >
            Predictions
         </button>
         <button 
           onClick={() => setActiveTab('analytics')}
           className={cn(
             "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest",
             activeTab === 'analytics' ? "bg-white text-black shadow-lg" : "text-white/40"
           )}
         >
            Heatmap
         </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'predictions' ? (
          <motion.div 
            key="predictions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
             {/* Filter Bar */}
             <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
                {['All', 'Physics', 'Chemistry', 'Maths', 'Biology'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setFilterSubject(s)}
                    className={cn(
                      "flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all",
                      filterSubject === s ? "bg-rose-500 text-white" : "bg-white/5 text-white/40"
                    )}
                  >
                     {s}
                  </button>
                ))}
             </div>

             {/* Predicted Feed */}
             <section className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Priority Matrix</h3>
                   <Crosshair size={14} className="opacity-20" />
                </div>
                
                <div className="space-y-4 px-1">
                   {filteredPredictions.map((topic, i) => (
                     <div key={topic.id} className={cn(
                       "p-6 rounded-[2.5rem] glass border relative overflow-hidden transition-all",
                       topic.priority === 'Critical' ? "border-rose-500/20 bg-rose-500/[0.03]" : "border-white/5"
                     )}>
                        <div className="flex justify-between items-start mb-4">
                           <div className="space-y-1">
                              <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase w-fit",
                                PRIORITY_MAP[topic.priority].bg,
                                PRIORITY_MAP[topic.priority].color
                              )}>
                                 {PRIORITY_MAP[topic.priority].icon}
                                 {topic.priority}
                              </div>
                              <h4 className="text-sm font-black italic uppercase tracking-tight">{topic.name}</h4>
                              <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">{topic.subject}</p>
                           </div>
                           <div className="text-right">
                              <div className="text-xl font-black italic text-rose-500 leading-none">{topic.probability}%</div>
                              <div className="text-[7px] font-black opacity-20 uppercase mt-1">Appear. Prob.</div>
                           </div>
                        </div>

                        <p className="text-[10px] font-black opacity-50 mb-6 leading-relaxed italic border-l-2 border-rose-500/20 pl-3">
                           "{topic.reason}"
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <div className="text-[8px] font-black opacity-20 uppercase">Urgency Score</div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${topic.urgency}%` }}
                                   className={cn(
                                     "h-full rounded-full",
                                     topic.urgency > 80 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-indigo-500"
                                   )}
                                 />
                              </div>
                           </div>
                           <div className="flex justify-end items-end">
                              {topic.isWeakArea && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase animate-pulse">
                                   <ShieldAlert size={10} /> Weak Breach
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </motion.div>
        ) : (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 px-2"
          >
             {/* Subject Heatmap */}
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Confidence Distribution</h3>
                   <BarChart3 size={14} className="opacity-20" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {state.confidenceHeatmap.map((item, i) => (
                     <div key={i} className="p-5 rounded-[2.5rem] glass border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="text-[10px] font-black uppercase tracking-tighter opacity-70 group-hover:opacity-100">{item.subject}</div>
                           <div className={cn(
                             "text-[10px] font-black",
                             item.score < 50 ? "text-rose-500" : "text-emerald-500"
                           )}>{item.score}%</div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${item.score}%` }}
                             className={cn(
                               "h-full rounded-full transition-all duration-1000",
                               item.score < 50 ? "bg-rose-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                             )}
                           />
                        </div>
                        <p className="text-[7px] font-black opacity-20 uppercase tracking-widest leading-none">
                           {item.score < 50 ? 'Critical Revision Needed' : 'Stable Retention'}
                        </p>
                     </div>
                   ))}
                </div>

                <div className="p-6 rounded-[2.5rem] glass border border-dashed border-rose-500/20 flex items-center gap-4 group">
                   <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Target size={24} className="group-hover:scale-125 transition-transform" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xs font-black uppercase italic tracking-tight">Exam Readiness Map</h4>
                      <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-1">AI analyzing daily mock deviations</p>
                   </div>
                   <ChevronRight size={16} className="opacity-20" />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connectivity HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4 mx-1">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-rose-500">
               Neural Prediction
            </div>
            <div className="flex gap-1 h-4 items-end">
               {Array.from({ length: 15 }).map((_, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ height: 2 }}
                   animate={{ height: Math.random() * 16 + 4 }}
                   transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse', delay: i * 0.04 }}
                   className={cn(
                     "w-1 rounded-full",
                     i > 10 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-white/10"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none text-rose-500">
               {state.predictions.length}
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Active High-Priority</div>
         </div>
      </section>
    </div>
  );
}
