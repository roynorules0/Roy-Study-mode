import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Search, 
  Plus, 
  Bookmark, 
  BookmarkCheck, 
  RotateCcw, 
  Flame, 
  Target, 
  Sparkles, 
  ChevronRight, 
  Cpu, 
  Layers, 
  Binary, 
  Compass,
  ArrowRight,
  CircleDashed,
  Pin,
  Clock,
  Dna,
  Atom,
  Calculator,
  ScanHeart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { FormulaVaultState, FormulaItem } from '../../types';
import { generateFormulaMnemonic, getFormulaVibe } from '../../services/formulaService';

interface AIFormulaVaultProps {
  apiKey?: string;
}

const SUBJECT_CONFIG = {
  Physics: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Atom size={16} /> },
  Chemistry: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <ScanHeart size={16} /> },
  Maths: { color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', icon: <Calculator size={16} /> },
  Biology: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <Dna size={16} /> }
};

export default function AIFormulaVault({ apiKey }: AIFormulaVaultProps) {
  const [vault, setVault] = useLocalStorage<FormulaVaultState>('ai-formula-vault-v1', {
    formulas: [
      {
        id: '1',
        name: 'Gauss Law',
        formula: 'Φ = Q / ε₀',
        subject: 'Physics',
        chapter: 'Electrostatics',
        difficulty: 'medium',
        isPinned: true,
        revisionCount: 12,
        lastRevised: Date.now() - 43200000,
        mnemonic: 'Flux is Q over epsilon naught. Simple logic.'
      },
      {
        id: '2',
        name: 'Quadratic Formula',
        formula: 'x = [-b ± √(b² - 4ac)] / 2a',
        subject: 'Maths',
        chapter: 'Quadratic Equations',
        difficulty: 'easy',
        isPinned: false,
        revisionCount: 5,
        lastRevised: Date.now() - 86400000
      }
    ],
    lastSync: Date.now(),
    aiInsights: "Physics formulas weak retention me ja rahe hain, Daily Flash active karo 🔥"
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<FormulaItem['subject'] | 'All'>('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [view, setView] = useState<'list' | 'flash'>('list');
  const [flashIndex, setFlashIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredFormulas = useMemo(() => {
    return vault.formulas.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           f.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'All' || f.subject === filterSubject;
      return matchesSearch && matchesSubject;
    }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [vault.formulas, searchQuery, filterSubject]);

  const syncVibe = async () => {
    if (!apiKey) return;
    setIsSyncing(true);
    try {
      const res = await getFormulaVibe(apiKey, vault);
      setVault({ ...vault, aiInsights: res.insight, lastSync: Date.now() });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const togglePin = (id: string) => {
    setVault({
      ...vault,
      formulas: vault.formulas.map(f => f.id === id ? { ...f, isPinned: !f.isPinned } : f)
    });
  };

  const updateRevision = (id: string) => {
    setVault({
      ...vault,
      formulas: vault.formulas.map(f => 
        f.id === id ? { ...f, revisionCount: f.revisionCount + 1, lastRevised: Date.now() } : f
      )
    });
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Formula Vault</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <Binary size={10} /> Neural Equation Core
           </p>
        </div>
        <button 
          onClick={syncVibe}
          disabled={isSyncing}
          className="p-3 rounded-2xl glass border border-white/5 text-indigo-400 active:scale-90 transition-all"
        >
           {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
             {/* AI Insights HUD */}
             <section className="p-6 rounded-[2.5rem] glass border border-indigo-500/10 relative overflow-hidden flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                   <Cpu size={24} className="animate-pulse" />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black italic uppercase italic tracking-tight leading-relaxed text-indigo-100">
                      "{vault.aiInsights}"
                   </p>
                </div>
             </section>

             {/* Search & Tabs */}
             <div className="space-y-4 px-2">
                <div className="relative">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                   <input 
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search Formulas..."
                     className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:opacity-30"
                   />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                   {['All', 'Physics', 'Chemistry', 'Maths', 'Biology'].map(s => (
                     <button 
                       key={s}
                       onClick={() => setFilterSubject(s as any)}
                       className={cn(
                         "flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all",
                         filterSubject === s ? "bg-white text-black" : "bg-white/5 text-white/40"
                       )}
                     >
                        {s}
                     </button>
                   ))}
                </div>
             </div>

             {/* Quick Actions */}
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setView('flash')}
                  className="p-5 rounded-[2.2rem] glass border border-indigo-500/10 flex flex-col items-center justify-center gap-2 group hover:bg-indigo-500/5 transition-all"
                >
                   <RotateCcw size={20} className="text-indigo-400 group-hover:rotate-180 transition-all duration-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Flash Mode</span>
                </button>
                <button className="p-5 rounded-[2.2rem] glass border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all">
                   <Plus size={20} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Add Equation</span>
                </button>
             </div>

             {/* Formula List */}
             <section className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Stored Mechanisms</h3>
                   <Layers size={14} className="opacity-20" />
                </div>
                <div className="space-y-3">
                   {filteredFormulas.map(formula => (
                     <div key={formula.id} className={cn(
                       "p-6 rounded-[2.5rem] glass border relative group transition-all",
                       formula.isPinned ? "border-indigo-500/20 bg-indigo-500/[0.03]" : "border-white/5"
                     )}>
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", SUBJECT_CONFIG[formula.subject].bg, SUBJECT_CONFIG[formula.subject].color)}>
                                 {SUBJECT_CONFIG[formula.subject].icon}
                              </div>
                              <div className="space-y-0.5">
                                 <h4 className="text-sm font-black italic uppercase tracking-tight">{formula.name}</h4>
                                 <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">{formula.chapter}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => togglePin(formula.id)}
                             className={cn("p-2 transition-all", formula.isPinned ? "text-indigo-400" : "text-white/10 group-hover:text-white/30")}
                           >
                              <Pin size={14} className={formula.isPinned ? "fill-indigo-400" : ""} />
                           </button>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 text-center font-mono text-xs font-bold text-white/90">
                           {formula.formula}
                        </div>

                        <div className="flex justify-between items-center mt-6">
                           <div className="flex gap-4">
                              <div className="flex items-center gap-1.5 opacity-30">
                                 <Clock size={10} />
                                 <span className="text-[8px] font-black uppercase">x{formula.revisionCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-30">
                                 <Flame size={10} className="text-orange-500" />
                                 <span className="text-[8px] font-black uppercase">{Math.floor((Date.now() - formula.lastRevised)/86400000)}d ago</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => updateRevision(formula.id)}
                             className="text-[9px] font-black uppercase text-indigo-400 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                           >
                              Revise <ArrowRight size={10} />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </motion.div>
        ) : (
          <motion.div 
            key="flash"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
             <div className="flex justify-between items-center px-2">
                <button 
                  onClick={() => { setView('list'); setShowAnswer(false); }}
                  className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2"
                >
                   <RotateCcw size={12} /> Exit Flash
                </button>
                <div className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">
                   Mode: Recall Sync
                </div>
             </div>

             <div className="relative h-[400px] perspective-1000">
                <motion.div 
                  className="w-full h-full p-8 rounded-[3.5rem] glass border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden"
                  animate={{ rotateY: showAnswer ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                      <Compass size={160} />
                   </div>

                   {!showAnswer ? (
                     <div className="space-y-4">
                        <div className={cn("w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4", SUBJECT_CONFIG[vault.formulas[flashIndex].subject].bg, SUBJECT_CONFIG[vault.formulas[flashIndex].subject].color)}>
                           {SUBJECT_CONFIG[vault.formulas[flashIndex].subject].icon}
                        </div>
                        <h3 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">
                           {vault.formulas[flashIndex].name}
                        </h3>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                           {vault.formulas[flashIndex].subject} • {vault.formulas[flashIndex].chapter}
                        </p>
                        <p className="text-[8px] font-black opacity-20 uppercase mt-12">Tap to Reveal Engine</p>
                     </div>
                   ) : (
                     <div className="rotate-y-180 space-y-8">
                        <div className="space-y-2">
                           <div className="text-[9px] font-black opacity-30 uppercase tracking-widest">Solution Matrix</div>
                           <div className="text-2xl font-mono font-black italic tracking-tight text-white/90 p-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
                              {vault.formulas[flashIndex].formula}
                           </div>
                        </div>

                        {vault.formulas[flashIndex].mnemonic && (
                          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 max-w-[240px]">
                             <p className="text-[10px] font-black uppercase text-indigo-400 italic leading-relaxed">
                                "{vault.formulas[flashIndex].mnemonic}"
                             </p>
                          </div>
                        )}
                        <p className="text-[8px] font-black opacity-20 uppercase">Tap to Reset Perspective</p>
                     </div>
                   )}
                </motion.div>
             </div>

             <div className="flex gap-4 px-2">
                <button 
                  onClick={() => {
                    setFlashIndex((prev) => (prev > 0 ? prev - 1 : vault.formulas.length - 1));
                    setShowAnswer(false);
                  }}
                  className="flex-1 py-5 glass border border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                >
                   Previous
                </button>
                <button 
                  onClick={() => {
                    setFlashIndex((prev) => (prev < vault.formulas.length - 1 ? prev + 1 : 0));
                    setShowAnswer(false);
                    updateRevision(vault.formulas[flashIndex].id);
                  }}
                  className="flex-1 py-5 bg-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                   Next Concept
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connectivity HUD */}
      {view === 'list' && (
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
           <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
                 Neural Sync
              </div>
              <div className="flex gap-1 h-3 items-end">
                 {Array.from({ length: 15 }).map((_, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ height: 2 }}
                     animate={{ height: Math.random() * 12 + 2 }}
                     transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                     className={cn(
                       "w-1 rounded-full",
                       i % 3 === 0 ? "bg-indigo-500 shadow-[0_0_8px_#6366f1]" : "bg-white/10"
                     )} 
                   />
                 ))}
              </div>
           </div>
           <div className="text-right flex flex-col justify-end">
              <div className="text-3xl font-black italic tracking-tighter leading-none text-white/80">
                 {vault.formulas.length}
              </div>
              <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Active Units</div>
           </div>
        </section>
      )}
    </div>
  );
}
