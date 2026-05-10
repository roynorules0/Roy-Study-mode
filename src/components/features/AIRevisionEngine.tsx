import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  RotateCcw, 
  History, 
  TrendingUp, 
  Target, 
  Clock, 
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  LayoutGrid,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateRevisionContent, generateRevisionQuiz } from '../../services/revisionService';
import { RevisionItem } from '../../types';
import { format, addDays, isAfter } from 'date-fns';

interface AIRevisionEngineProps {
  apiKey?: string;
}

const MODES = [
  { id: 'rapid', label: '1m Rapid Recall', icon: <Zap size={14} /> },
  { id: 'burst', label: '5m Burst', icon: <TrendingUp size={14} /> },
  { id: 'exam', label: 'Exam Mode', icon: <Target size={14} /> },
  { id: 'formula', label: 'Formula Attack', icon: <Lightbulb size={14} /> }
];

export default function AIRevisionEngine({ apiKey }: AIRevisionEngineProps) {
  const [items, setItems] = useLocalStorage<RevisionItem[]>('ai-revision-vault', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeItem, setActiveItem] = useState<RevisionItem | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const handleGenerate = async () => {
    if (!apiKey || !topic || !subject) return;
    setIsGenerating(true);
    try {
      const content = await generateRevisionContent(apiKey, topic, subject, difficulty);
      const newItem: RevisionItem = {
        id: Math.random().toString(36).substr(2, 9),
        topic,
        subject,
        summary: content.summary || '',
        points: content.points || [],
        formulas: content.formulas || [],
        mnemonics: content.mnemonics || [],
        retentionScore: 100,
        lastRevised: Date.now(),
        nextRevision: addDays(new Date(), 1).getTime(),
        interval: 1
      };
      setItems([newItem, ...items]);
      setActiveItem(newItem);
      setTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualRevise = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nextInt = Math.ceil(item.interval * 2);
        return {
          ...item,
          lastRevised: Date.now(),
          nextRevision: addDays(new Date(), nextInt).getTime(),
          interval: nextInt,
          retentionScore: Math.min(100, item.retentionScore + 5)
        };
      }
      return item;
    }));
  };

  const pendingRevisions = useMemo(() => {
    return items.filter(item => isAfter(new Date(), new Date(item.nextRevision)));
  }, [items]);

  const speakSummary = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 space-y-1">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Revision Engine</h2>
        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
           <RotateCcw size={10} className="text-indigo-400" /> Adaptive Spaced Repetition
        </p>
      </header>

      {/* Quick Input */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
        <div className="space-y-3">
           <input 
             value={topic}
             onChange={e => setTopic(e.target.value)}
             placeholder="Topic Name (e.g. Capacitor)"
             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/50 transition-colors"
           />
           <div className="flex gap-2">
             <input 
               value={subject}
               onChange={e => setSubject(e.target.value)}
               placeholder="Subject"
               className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/50"
             />
             <select 
               value={difficulty}
               onChange={e => setDifficulty(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-2xl px-4 text-[10px] font-black uppercase outline-none"
             >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
             </select>
           </div>
        </div>
        <button 
           onClick={handleGenerate}
           disabled={isGenerating || !topic || !subject}
           className={cn(
             "w-full py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
             (isGenerating || !topic || !subject) ? "opacity-50 grayscale" : "hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-600/20"
           )}
        >
           {isGenerating ? <RotateCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
           {isGenerating ? "Synthesizing Memory..." : "Generate AI Revision"}
        </button>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
         <div className="p-5 rounded-[2rem] glass border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
               <History size={20} />
            </div>
            <div>
               <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Pending</div>
               <div className="text-lg font-black">{pendingRevisions.length} Units</div>
            </div>
         </div>
         <div className="p-5 rounded-[2rem] glass border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <CheckCircle2 size={20} />
            </div>
            <div>
               <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Mastered</div>
               <div className="text-lg font-black">{items.filter(i => i.interval > 7).length} Topic</div>
            </div>
         </div>
      </div>

      {/* Active Content Viewer */}
      <AnimatePresence>
        {activeItem && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] glass-heavy flex flex-col p-6 overflow-y-auto"
          >
             <div className="max-w-md mx-auto w-full space-y-6 pb-20">
                <header className="flex justify-between items-start">
                   <div>
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-black rounded uppercase tracking-widest border border-indigo-500/20">{activeItem.subject}</span>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter mt-1">{activeItem.topic}</h3>
                   </div>
                   <button onClick={() => setActiveItem(null)} className="p-2 rounded-full bg-white/5 border border-white/10">
                      <Plus className="rotate-45" />
                   </button>
                </header>

                <div className="space-y-4">
                   {/* Summary Section */}
                   <div className="p-6 rounded-[2rem] bg-indigo-600 text-white space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20"><Brain size={40} /></div>
                      <div className="flex justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Insight Summary</h4>
                        <button onClick={() => speakSummary(activeItem.summary)} className="opacity-60 hover:opacity-100"><Volume2 size={16} /></button>
                      </div>
                      <p className="text-sm font-bold leading-relaxed italic pr-8">"{activeItem.summary}"</p>
                   </div>

                   {/* Modes List */}
                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {MODES.map(mode => (
                        <button key={mode.id} className="shrink-0 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                           {mode.icon} {mode.label}
                        </button>
                      ))}
                   </div>

                   {/* Key Points */}
                   <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-30">Critical Points</h4>
                      <div className="space-y-3">
                         {activeItem.points.map((p, i) => (
                           <div key={i} className="flex gap-4">
                              <span className="text-indigo-500 font-black italic">0{i+1}</span>
                              <p className="text-xs font-bold opacity-80">{p}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Formulas & Mnemonics */}
                   <div className="grid grid-cols-1 gap-4">
                      {activeItem.formulas.length > 0 && (
                        <div className="p-6 rounded-[2.5rem] glass border border-white/10 bg-indigo-400/[0.03]">
                            <h4 className="text-xs font-black uppercase tracking-widest opacity-30 mb-4">Formula Vault</h4>
                            <div className="flex flex-wrap gap-2">
                               {activeItem.formulas.map((f, i) => (
                                 <code key={i} className="px-3 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl font-mono text-[10px] font-bold border border-indigo-500/20">{f}</code>
                               ))}
                            </div>
                        </div>
                      )}
                      {activeItem.mnemonics.length > 0 && (
                        <div className="p-6 rounded-[2.5rem] glass border border-orange-500/10 bg-orange-400/[0.03]">
                            <h4 className="text-xs font-black uppercase tracking-widest opacity-30 mb-4 text-orange-400">Memory Hooks</h4>
                            <div className="space-y-2">
                               {activeItem.mnemonics.map((m, i) => (
                                 <div key={i} className="flex items-center gap-3 text-xs font-black italic text-orange-400/80">
                                    <Lightbulb size={14} className="text-orange-500" /> {m}
                                 </div>
                               ))}
                            </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs space-y-2">
                   <button 
                     onClick={() => handleManualRevise(activeItem.id)}
                     className="w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-2"
                   >
                      <CheckCircle2 size={16} /> Mark as Revised
                   </button>
                </div>
             </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Revision List (Vault) */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Memory Vault</h3>
            <span className="text-[10px] font-black text-indigo-500 italic">{items.length} SAVED</span>
         </div>
         
         <div className="space-y-3">
            {items.map(item => (
              <motion.div 
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={cn(
                  "p-5 rounded-[2rem] glass border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-all",
                  isAfter(new Date(), new Date(item.nextRevision)) && "border-indigo-500/20 bg-indigo-500/[0.02]"
                )}
              >
                 <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 relative overflow-hidden">
                       <BookOpen size={20} className="relative z-10" />
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                    </div>
                    <div className="min-w-0">
                       <h4 className="font-black italic uppercase tracking-tighter text-sm truncate">{item.topic}</h4>
                       <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black opacity-30 uppercase">{item.subject}</span>
                         <div className="w-1 h-1 rounded-full bg-white/10" />
                         <span className="text-[8px] font-black text-indigo-400 uppercase">Revise in {Math.max(1, Math.round((item.nextRevision - Date.now()) / (1000 * 60 * 60 * 24)))} Days</span>
                       </div>
                    </div>
                 </div>
                 <ChevronRight size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </motion.div>
            ))}

            {items.length === 0 && (
              <div className="py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center text-white/5">
                    <Brain size={32} />
                 </div>
                 <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">Vault is empty</p>
              </div>
            )}
         </div>
      </section>

      {/* Heatmap-style visualizer */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
         <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Retention Heatmap</h3>
         <div className="flex flex-wrap gap-1">
            {Array.from({ length: 48 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-3 h-3 rounded-sm",
                  i < items.length ? "bg-indigo-500" : "bg-white/5"
                )} 
                title={items[i]?.topic || 'Empty cell'}
              />
            ))}
         </div>
         <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-20">
            <span>Low Engagement</span>
            <span>Mastered</span>
         </div>
      </section>
    </div>
  );
}
