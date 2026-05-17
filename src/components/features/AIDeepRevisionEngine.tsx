import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  History, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Timer,
  ChevronRight,
  Flame,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RevisionTopic {
  id: string;
  name: string;
  strength: number; // 0-100
  lastRevised: number;
  nextRevision: number;
  retentionLevel: 'weak' | 'stable' | 'mastered';
  mistakesCount: number;
  recallSpeed: number; // in seconds
  revisionCount: number;
  tags: string[];
}

interface RevisionMission {
  id: string;
  title: string;
  type: 'flash' | 'recall' | 'battle' | 'ncert';
  topicId: string;
  priority: 'low' | 'medium' | 'high';
  reward: number;
}

export default function AIDeepRevisionEngine() {
  const [topics, setTopics] = useLocalStorage<RevisionTopic[]>('ai-deep-revision-topics', [
    {
      id: '1',
      name: 'Organic Chemistry: Hydrocarbons',
      strength: 45,
      lastRevised: Date.now() - 48 * 3600000,
      nextRevision: Date.now() + 2 * 3600000,
      retentionLevel: 'weak',
      mistakesCount: 12,
      recallSpeed: 4.5,
      revisionCount: 3,
      tags: ['Chemistry', 'Mistakes High']
    },
    {
      id: '2',
      name: 'Physics: Rotation Mechanics',
      strength: 78,
      lastRevised: Date.now() - 24 * 3600000,
      nextRevision: Date.now() + 72 * 3600000,
      retentionLevel: 'stable',
      mistakesCount: 4,
      recallSpeed: 2.1,
      revisionCount: 5,
      tags: ['Physics', 'Formula Mastered']
    },
    {
      id: '3',
      name: 'Biology: Cell Cycle',
      strength: 92,
      lastRevised: Date.now() - 12 * 3600000,
      nextRevision: Date.now() + 120 * 3600000,
      retentionLevel: 'mastered',
      mistakesCount: 1,
      recallSpeed: 1.2,
      revisionCount: 8,
      tags: ['Biology', 'Memory Locked']
    }
  ]);

  const [activeRecall, setActiveRecall] = useState<{ active: boolean; topic: RevisionTopic | null }>({ active: false, topic: null });
  const [recallValue, setRecallValue] = useState("");
  const [currentView, setCurrentView] = useState<'dashboard' | 'recall'>('dashboard');

  // AI Insights Generator (Hinglish Support)
  const insights = useMemo(() => {
    const weakTopics = topics.filter(t => t.retentionLevel === 'weak');
    const forgetRisk = topics.find(t => t.nextRevision < Date.now());

    if (forgetRisk) return { msg: `${forgetRisk.name} forget hone wala hai 😴, revive karo!`, type: 'urgent' };
    if (weakTopics.length > 0) return { msg: `Organic weak ho raha hai ⚠️, quick revision zaroori hai 🔥`, type: 'warning' };
    return { msg: "Memory retention improve ho rahi hai ⚡, streak active rakho!", type: 'success' };
  }, [topics]);

  // Memory Decay Data for Graph
  const decayData = useMemo(() => {
    const points = [];
    for (let i = 0; i < 7; i++) {
        const time = i * 24;
        const retention = 100 * Math.exp(-0.05 * i);
        points.push({ time: `${i}d`, retention: Math.round(retention) });
    }
    return points;
  }, []);

  const handleRecallComplete = () => {
    if (!activeRecall.topic) return;
    
    const updatedTopics = topics.map(t => {
      if (t.id === activeRecall.topic?.id) {
        const newStrength = Math.min(100, t.strength + 15);
        const newLevel: 'weak' | 'stable' | 'mastered' = newStrength > 80 ? 'mastered' : newStrength > 50 ? 'stable' : 'weak';
        
        return {
          ...t,
          strength: newStrength,
          lastRevised: Date.now(),
          nextRevision: Date.now() + (t.revisionCount * 24 * 3600000), // Adaptive scheduling
          revisionCount: t.revisionCount + 1,
          retentionLevel: newLevel
        };
      }
      return t;
    });

    setTopics(updatedTopics);
    setActiveRecall({ active: false, topic: null });
    setCurrentView('dashboard');
    setRecallValue("");
  };

  return (
    <div className="min-h-screen bg-black/90 p-4 sm:p-8 space-y-8 font-sans overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="space-y-2 relative">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Brain className="text-white" size={20} />
             </div>
             <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Deep Revision Engine</h1>
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] ml-1">AI Neural Memory Core • v4.0.2</p>
        </div>

        {/* AI Insight Pill */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "px-6 py-3 rounded-2xl glass border flex items-center gap-4 max-w-md",
            insights.type === 'urgent' ? "border-rose-500/30 text-rose-400" : "border-indigo-500/30 text-indigo-400"
          )}
        >
          <Sparkles size={16} className="animate-pulse shrink-0" />
          <p className="text-[11px] font-black uppercase tracking-wider leading-relaxed">{insights.msg}</p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {currentView === 'dashboard' ? (
          <motion.div 
             key="dashboard"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Memory Analytics Panel */}
            <div className="lg:col-span-2 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Overall Retention', value: '84%', icon: <Activity className="text-emerald-400" />, sub: 'Improving consistently' },
                    { label: 'Focus Score', value: '92', icon: <Target className="text-indigo-400" />, sub: 'Mental clarity high' },
                    { label: 'Revision Streak', value: '12 Days', icon: <Flame className="text-rose-400" />, sub: 'Top 2% student' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-[2rem] glass bg-white/[0.03] border border-white/5 space-y-3"
                    >
                       <div className="flex justify-between items-start">
                          <div className="p-3 rounded-2xl bg-white/5">{stat.icon}</div>
                          <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">{stat.label}</span>
                       </div>
                       <div>
                          <div className="text-2xl font-black text-white">{stat.value}</div>
                          <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{stat.sub}</div>
                       </div>
                    </motion.div>
                  ))}
               </div>

               {/* Memory Decay Graph */}
               <div className="p-8 rounded-[2.5rem] glass border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Neural Decay Projection</h3>
                        <p className="text-[10px] font-bold opacity-30 uppercase">Predicted Forgetting Speed Index</p>
                     </div>
                     <History size={20} className="text-white/20" />
                  </div>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={decayData}>
                           <defs>
                              <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                           <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                           <YAxis hide />
                           <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                           />
                           <Area type="monotone" dataKey="retention" stroke="#6366f1" fillOpacity={1} fill="url(#colorRet)" strokeWidth={3} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Topic List */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-xs font-black italic uppercase tracking-[0.3em] text-white/60">Knowledge Archive</h3>
                     <span className="text-[10px] font-bold text-indigo-400">Total: {topics.length} Units</span>
                  </div>
                  {topics.map((topic, i) => (
                    <motion.div 
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-3xl glass border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all group"
                    >
                       <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border-2",
                            topic.retentionLevel === 'mastered' ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                            topic.retentionLevel === 'stable' ? "border-amber-500/20 bg-amber-500/10 text-amber-400" :
                            "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          )}>
                             {topic.strength}%
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{topic.name}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                {topic.tags.map(tag => (
                                  <span key={tag} className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30 tracking-widest">{tag}</span>
                                ))}
                                <span className="text-[8px] font-bold text-indigo-400/60 uppercase tracking-widest">• Next: {new Date(topic.nextRevision).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => {
                           setActiveRecall({ active: true, topic });
                           setCurrentView('recall');
                         }}
                         className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-500 transition-all text-white/20 hover:text-white"
                       >
                          <ChevronRight size={18} />
                       </button>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* AI Revision Missions Panel */}
            <div className="space-y-8">
               <div className="p-8 rounded-[3rem] glass border border-indigo-500/20 bg-indigo-500/[0.02]">
                  <div className="flex items-center gap-3 mb-8">
                     <TrendingUp className="text-indigo-400" size={18} />
                     <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Revision Missions</h3>
                  </div>
                  <div className="space-y-4">
                     {[
                       { id: 'm1', title: 'Flash Revision: Bio', type: 'flash', priority: 'high', reward: 50 },
                       { id: 'm2', title: 'NCERT Recovery Power', type: 'ncert', priority: 'medium', reward: 120 },
                       { id: 'm3', title: 'Weak Topic Battle', type: 'battle', priority: 'low', reward: 200 }
                     ].map(mission => (
                       <div key={mission.id} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                          <div className="flex items-center justify-between">
                             <div className={cn(
                               "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                               mission.priority === 'high' ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                             )}>
                               {mission.priority} Priority
                             </div>
                             <span className="text-[9px] font-bold text-amber-400">+{mission.reward} XP</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                             <div className="text-[11px] font-black uppercase text-white/90">{mission.title}</div>
                             <button className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500 transition-colors">
                                <ArrowRight size={14} className="text-white" />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>

                  <button className="w-full mt-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] transition-all text-indigo-400 border border-indigo-500/10">
                     Unlock Daily Missions
                  </button>
               </div>

               {/* Memory Health Index */}
               <div className="p-8 rounded-[3rem] glass border border-white/5 bg-white/[0.02] space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black italic uppercase tracking-widest opacity-40">Memory Health System</h3>
                    <div className="text-2xl font-black italic tracking-tighter mt-2 text-emerald-400">Stable • 91.2%</div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-white/5">
                     {[
                       { label: 'Retention Level', value: 'Advanced', color: 'text-indigo-400' },
                       { label: 'Forget Risk', value: 'Very Low', color: 'text-emerald-400' },
                       { label: 'Recall Speed', value: '1.4s (avg)', color: 'text-amber-400' }
                     ].map(item => (
                       <div key={item.label} className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.label}</span>
                          <span className={cn("text-[10px] font-black uppercase", item.color)}>{item.value}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
             key="recall"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="max-w-2xl mx-auto py-12"
          >
            <div className="text-center space-y-12">
               <div className="space-y-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-indigo-500 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40">
                     <RotateCcw className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Neural Recall Round</h2>
                  <p className="text-xs font-bold text-indigo-400/60 uppercase tracking-[0.3em]">Deep Revising: {activeRecall.topic?.name}</p>
               </div>

               {/* Recall Stage */}
               <div className="p-12 rounded-[4rem] glass border border-white/10 bg-white/[0.03] space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                     <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="h-full bg-indigo-500"
                        onAnimationComplete={handleRecallComplete}
                     />
                  </div>

                  <div className="space-y-2">
                     <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Challenge</div>
                     <div className="text-2xl font-black text-white leading-tight">Summarize the core mechanism of {activeRecall.topic?.name.split(':')[1] || activeRecall.topic?.name} in 3 key points.</div>
                  </div>

                  <textarea 
                    value={recallValue}
                    onChange={(e) => setRecallValue(e.target.value)}
                    placeholder="Lock your neural memory here..."
                    className="w-full h-48 bg-black/40 rounded-3xl p-6 text-sm font-medium text-white border border-white/5 outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-white/10"
                  />

                  <div className="flex gap-4">
                     <button 
                       onClick={() => setCurrentView('dashboard')}
                       className="flex-1 py-5 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:bg-white/10"
                     >
                        Abort
                     </button>
                     <button 
                       onClick={handleRecallComplete}
                       className="flex-1 py-5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                     >
                        Confirm Sync
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
