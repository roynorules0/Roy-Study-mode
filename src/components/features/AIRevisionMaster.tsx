import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  RotateCcw, 
  ChevronRight, 
  Bookmark, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Target, 
  BarChart3, 
  Clock, 
  Calendar, 
  Plus, 
  Search,
  BookOpen,
  Trophy,
  History,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  ShieldCheck,
  Timer,
  LayoutGrid,
  CreditCard,
  Sword,
  MessageCircle,
  Quote
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Flashcard, SubjectMastery } from '../../types';
import { generateFlashcards, generateRevisionNotes } from '../../lib/gemini';
import { format, addDays, isPast, isToday } from 'date-fns';
import confetti from 'canvas-confetti';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface AIRevisionMasterProps {
  apiKey?: string;
  onXPGain?: (amount: number, reason: string) => void;
}

const HINGLISH_COACH = [
  "Ye chapter weak ho raha hai ⚠️ Thoda attention do!",
  "Revision timing perfect hai 🔥 Memory solid ho jayegi.",
  "Memory retention improve ho rahi hai 👑 Mastery level UP!",
  "Baaki sab toh theek hai, par formula yaad hai na? 😉",
  "Consistency hi real power hai, aaj ka revision khatam karo! 🚀",
  "Legendary recall speed unlocked! Beast mode ON ⚡"
];

export default function AIRevisionMaster({ apiKey, onXPGain }: AIRevisionMasterProps) {
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('ai-flashcards', []);
  const [mastery, setMastery] = useLocalStorage<SubjectMastery[]>('ai-subject-mastery', [
    { subject: 'Biology', masteryScore: 75, retentionRate: 80, accuracyRate: 90, lastRevisionDate: Date.now() },
    { subject: 'Physics', masteryScore: 45, retentionRate: 50, accuracyRate: 60, lastRevisionDate: Date.now() },
    { subject: 'Chemistry', masteryScore: 60, retentionRate: 70, accuracyRate: 75, lastRevisionDate: Date.now() }
  ]);
  const [notes, setNotes] = useLocalStorage<any[]>('ai-revision-notes', []);
  
  const [view, setView] = useState<'home' | 'srs' | 'flashcards' | 'battle' | 'notes' | 'stats'>('home');
  const [loading, setLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentSubject, setCurrentSubject] = useState('');
  
  // Flashcard View State
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);

  // Battle Mode State
  const [battleTimer, setBattleTimer] = useState(0);
  const [battleScore, setBattleScore] = useState(0);
  const [isBattleActive, setIsBattleActive] = useState(false);

  // Filter cards due for review
  const duoCards = useMemo(() => {
    return flashcards.filter(card => {
      if (!card.nextReview) return true;
      return isPast(new Date(card.nextReview)) || isToday(new Date(card.nextReview));
    });
  }, [flashcards]);

  const handleGenerateCards = async () => {
    if (!currentTopic || !currentSubject || !apiKey) return;
    setLoading(true);
    try {
      const result = await generateFlashcards(currentTopic, currentSubject, apiKey);
      const newConfigs = result.flashcards.map((f: any) => ({
        ...f,
        id: Math.random().toString(36).substr(2, 9),
        subject: currentSubject,
        interval: 0,
        reps: 0,
        easeFactor: 2.5,
        nextReview: Date.now()
      }));
      setFlashcards(prev => [...prev, ...newConfigs]);
      setActiveCards(newConfigs);
      setView('flashcards');
      onXPGain?.(50, `Created Flashcards for ${currentTopic}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSRSReview = (cardId: string, rating: number) => {
    // rating: 1 (forgot), 3 (medium), 5 (easy)
    setFlashcards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      
      let nextInterval = card.interval;
      let nextEaseFactor = card.easeFactor;
      let nextReps = card.reps;

      if (rating >= 3) {
        if (nextReps === 0) nextInterval = 1;
        else if (nextReps === 1) nextInterval = 3; // Customized for student needs
        else nextInterval = Math.round(nextInterval * nextEaseFactor);
        
        nextReps++;
        nextEaseFactor = nextEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
      } else {
        nextReps = 0;
        nextInterval = 1;
        nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.2);
      }

      const nextReview = addDays(new Date(), nextInterval).getTime();

      return {
        ...card,
        interval: nextInterval,
        easeFactor: nextEaseFactor,
        reps: nextReps,
        nextReview,
        lastReviewed: Date.now()
      };
    }));

    if (view === 'battle') {
      if (rating >= 3) setBattleScore(p => p + 10);
      else setBattleScore(p => Math.max(0, p - 5));
    }

    // Move to next card
    if (currentCardIdx < activeCards.length - 1) {
      setCurrentCardIdx(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session Complete
      onXPGain?.(20 * activeCards.length, "SRS Review Session Complete");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      setView('home');
      setCurrentCardIdx(0);
      setIsFlipped(false);
    }
  };

  const startBattle = () => {
    const battlePool = flashcards.length > 5 ? flashcards.sort(() => 0.5 - Math.random()).slice(0, 10) : flashcards;
    if (battlePool.length === 0) return;
    setActiveCards(battlePool);
    setIsBattleActive(true);
    setBattleScore(0);
    setBattleTimer(30);
    setView('battle');
  };

  useEffect(() => {
    let interval: any;
    if (isBattleActive && battleTimer > 0) {
      interval = setInterval(() => setBattleTimer(p => p - 1), 1000);
    } else if (battleTimer === 0 && isBattleActive) {
      setIsBattleActive(false);
      onXPGain?.(battleScore * 2, "Revision Battle Reward");
    }
    return () => clearInterval(interval);
  }, [isBattleActive, battleTimer, battleScore]);

  const StatsHUD = () => (
    <div className="grid grid-cols-2 gap-4">
       <div 
          onClick={() => setView('stats')}
          className="p-6 rounded-[2.5rem] glass-blue border border-blue-500/10 space-y-2 relative overflow-hidden group cursor-pointer"
       >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Brain size={80} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-40">System Retention</div>
          <div className="text-3xl font-black italic tracking-tighter">84.2%</div>
          <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black">
             <TrendingUp size={12} /> +2.4% THIS WEEK
          </div>
       </div>
       <div 
          onClick={() => setView('stats')}
          className="p-6 rounded-[2.5rem] glass-orange border border-orange-500/10 space-y-2 relative overflow-hidden group cursor-pointer"
       >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Timer size={80} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Recall Velocity</div>
          <div className="text-3xl font-black italic tracking-tighter">2.4s</div>
          <div className="flex items-center gap-1.5 text-orange-500 text-[10px] font-black">
             <Clock size={12} /> ELITE SPEED
          </div>
       </div>
    </div>
  );

  const MemoryInsight = () => {
    const data = [
      { name: 'Retained', value: 85, color: '#6366f1' },
      { name: 'Forgetting', value: 15, color: '#f43f5e' }
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="p-8 rounded-[3rem] glass border border-white/5 space-y-8">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Subject Mastery</h3>
              <BarChart3 size={16} className="text-indigo-400" />
           </div>
           
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={mastery}>
                    <XAxis dataKey="subject" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', fontFamily: 'Inter' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="masteryScore" radius={[10, 10, 10, 10]}>
                       {mastery.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#f43f5e' : '#10b981'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-3 gap-3">
              {mastery.map((m, i) => (
                <div key={i} className="text-center space-y-1">
                   <div className="text-lg font-black italic tracking-tighter">{m.masteryScore}%</div>
                   <div className="text-[8px] font-black uppercase tracking-widest opacity-30">{m.subject}</div>
                </div>
              ))}
           </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
           <div className="p-8 rounded-[3rem] glass border border-white/5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Weakest Topics</div>
              <div className="space-y-3">
                 {['Organic...', 'Newtonian...', 'Cell Div...'].map((t, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold opacity-60 line-clamp-1">{t}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="p-8 rounded-[3rem] glass border border-white/5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Heatmap</div>
              <div className="grid grid-cols-7 gap-1">
                 {[...Array(21)].map((_, i) => (
                   <div key={i} className={cn("aspect-square rounded-sm", i % 3 === 0 ? "bg-indigo-500/40" : i % 5 === 0 ? "bg-indigo-500" : "bg-white/5")} />
                 ))}
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest opacity-20 text-center">Consistent Streak</div>
           </div>
        </section>

        <button 
          onClick={() => setView('home')}
          className="w-full py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-24 max-w-2xl mx-auto px-4 gpu">
      {/* View Header */}
      {view !== 'home' ? (
        <header className="flex items-center gap-4">
           <button onClick={() => setView('home')} className="p-3 bg-white/5 rounded-2xl">
              <ChevronRight size={20} className="rotate-180" />
           </button>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">
             {view === 'flashcards' && "Flashcard Session"}
             {view === 'srs' && "Smart Revision"}
             {view === 'battle' && "Recall Battle"}
             {view === 'notes' && "AI Notes Lab"}
             {view === 'stats' && "Memory Analytics"}
           </h2>
        </header>
      ) : (
        <header className="space-y-2">
           <h2 className="text-5xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">Revision Master</h2>
           <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2">
              <BrainCircuit size={12} /> Spaced Repetition Protocol active
           </p>
        </header>
      )}

      {view === 'home' && (
        <div className="space-y-10">
          <StatsHUD />

          {/* AI Coach Floating Message */}
          <section className="p-6 rounded-[2.5rem] glass-light border border-white/10 flex items-center gap-6 relative overflow-hidden group">
             <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
               <BrainCircuit size={28} className="animate-pulse" />
             </div>
             <div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Neural Coach Roy</div>
                <p className="text-sm font-black italic uppercase tracking-tight text-white/90">
                   {HINGLISH_COACH[Math.floor(Math.random() * HINGLISH_COACH.length)]}
                </p>
             </div>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
               className="absolute -right-10 -bottom-10 opacity-[0.03]"
             >
                <LayoutGrid size={150} />
             </motion.div>
          </section>

          {/* Operations Grid */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => {
                 if (duoCards.length > 0) {
                    setActiveCards(duoCards);
                    setView('flashcards');
                    setCurrentCardIdx(0);
                 }
               }}
               className="p-8 rounded-[3rem] glass-indigo border border-indigo-500/20 flex flex-col items-center gap-4 group active:scale-95 transition-all text-center"
             >
                <div className="w-16 h-16 rounded-[1.75rem] bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                   <RotateCcw size={32} />
                </div>
                <div>
                   <div className="text-lg font-black italic uppercase tracking-tighter">Review Due</div>
                   <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">{duoCards.length} Cards Pending</div>
                </div>
             </button>

             <button 
               onClick={startBattle}
               className="p-8 rounded-[3rem] glass-rose border border-rose-500/20 flex flex-col items-center gap-4 group active:scale-95 transition-all text-center"
             >
                <div className="w-16 h-16 rounded-[1.75rem] bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/20 group-hover:-rotate-12 transition-transform">
                   <Sword size={32} />
                </div>
                <div>
                   <div className="text-lg font-black italic uppercase tracking-tighter">Recall Battle</div>
                   <div className="text-[10px] font-black opacity-40 uppercase tracking-widest text-rose-400">Timed Challenge</div>
                </div>
             </button>
          </div>

          {/* Generate New Flashcards */}
          <section className="p-10 rounded-[3rem] glass border border-white/5 space-y-6">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Neural Synthesis</h3>
                <Sparkles size={16} className="text-yellow-400" />
             </div>
             
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-4">Subject</label>
                      <input 
                        value={currentSubject}
                        onChange={e => setCurrentSubject(e.target.value)}
                        placeholder="Biology, Physics..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-4">Topic</label>
                      <input 
                        value={currentTopic}
                        onChange={e => setCurrentTopic(e.target.value)}
                        placeholder="Genetics, Motion..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                   </div>
                </div>
                <button 
                  onClick={handleGenerateCards}
                  disabled={loading || !currentTopic || !currentSubject}
                  className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                   {loading ? <RotateCcw size={20} className="animate-spin" /> : <Plus size={20} />}
                   {loading ? "Neural Mapping..." : "Synthesize Flashcards"}
                </button>
             </div>
          </section>

          {/* Quick List of All Topics */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 px-4">
                <LayoutGrid size={16} className="text-emerald-400" />
                <h3 className="font-black text-xs uppercase tracking-[0.3em] opacity-40">Knowledge Base</h3>
             </div>
             <div className="grid gap-3">
                {Array.from(new Set(flashcards.map(c => `${c.subject} - ${c.question.split(' ')[0]}...`))).slice(0, 4).map((topic, i) => (
                  <div key={i} className="p-5 rounded-[2rem] glass-light border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <BookOpen size={18} />
                       </div>
                       <div className="text-sm font-black italic tracking-tight">{topic}</div>
                    </div>
                    <ChevronRight size={18} className="opacity-10 group-hover:opacity-40 transition-opacity" />
                  </div>
                ))}
             </div>
          </section>
        </div>
      )}

      {view === 'stats' && <MemoryInsight />}

      {(view === 'flashcards' || view === 'battle') && activeCards.length > 0 && (
        <div className="space-y-12 h-full flex flex-col justify-center py-6 min-h-[60vh]">
          {view === 'battle' && isBattleActive && (
             <div className="flex justify-between items-center px-4">
                <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                   <Clock size={16} className="text-rose-500" />
                   <span className="text-lg font-black tabular-nums">{battleTimer}s</span>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                   <Trophy size={16} className="text-indigo-500" />
                   <span className="text-lg font-black tabular-nums">{battleScore} PTS</span>
                </div>
             </div>
          )}

          <div className="relative perspective-1000 w-full aspect-[4/5] max-w-sm mx-auto">
            <motion.div 
               animate={{ rotateY: isFlipped ? 180 : 0 }}
               transition={{ type: 'spring', damping: 20, stiffness: 100 }}
               className="w-full h-full relative preserve-3d cursor-pointer"
               onClick={() => setIsFlipped(!isFlipped)}
            >
               {/* Front */}
               <div className="absolute inset-0 backface-hidden p-10 rounded-[4rem] glass border-2 border-white/10 flex flex-col items-center justify-center text-center space-y-6 shadow-3xl">
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-12 h-1 invisible">
                     <Brain size={48} className="opacity-10" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{activeCards[currentCardIdx].subject}</div>
                  <h3 className="text-2xl font-black italic tracking-tighter leading-tight">
                    {activeCards[currentCardIdx].question}
                  </h3>
                  <div className="pt-8">
                     <div className="px-5 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest opacity-40">Tap to reveal</div>
                  </div>
               </div>

               {/* Back */}
               <div className="absolute inset-0 backface-hidden p-10 rounded-[4rem] bg-indigo-600 text-white flex flex-col items-center justify-center text-center space-y-6 shadow-3xl rotate-y-180 border-2 border-white/20">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">The Knowledge</div>
                  <p className="text-xl font-bold tracking-tight leading-relaxed">
                    {activeCards[currentCardIdx].answer}
                  </p>
               </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="text-center text-[10px] font-black uppercase tracking-[0.6em] opacity-20">
               Neural Card {currentCardIdx + 1} of {activeCards.length}
            </div>

            <AnimatePresence mode="wait">
              {isFlipped ? (
                <motion.div 
                   key="controls"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 20 }}
                   className="flex justify-center gap-4"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSRSReview(activeCards[currentCardIdx].id, 1); }}
                    className="flex-1 py-5 rounded-[2.5rem] bg-rose-500 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform"
                  >
                     Forgot
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSRSReview(activeCards[currentCardIdx].id, 3); }}
                    className="flex-1 py-5 rounded-[2.5rem] bg-indigo-800 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform border border-white/10"
                  >
                     Medium
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSRSReview(activeCards[currentCardIdx].id, 5); }}
                    className="flex-1 py-5 rounded-[2.5rem] bg-emerald-500 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform"
                  >
                     Easy
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                   key="prompt"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="text-center"
                >
                   <div className="flex items-center justify-center gap-3 opacity-20 mt-4">
                      <LayoutGrid size={16} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Swipe to bookmark</span>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {view === 'battle' && !isBattleActive && battleScore > 0 && (
         <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="p-12 rounded-[5rem] bg-indigo-600 text-white text-center space-y-8 shadow-4xl shadow-indigo-600/30"
         >
            <div className="w-32 h-32 bg-white/20 rounded-[3rem] shadow-inner mx-auto flex items-center justify-center">
               <Trophy size={64} className="text-yellow-400 drop-shadow-lg" />
            </div>
            <div className="space-y-2">
               <h3 className="text-4xl font-black italic uppercase tracking-tighter">Battle Report</h3>
               <p className="text-6xl font-black italic text-yellow-400">{battleScore}</p>
               <p className="text-xs uppercase tracking-widest opacity-60">Total Recall Points</p>
            </div>
            <button 
              onClick={() => setView('home')}
              className="w-full py-6 rounded-[2.5rem] bg-white text-indigo-600 font-black uppercase tracking-widest shadow-2xl"
            >
               Return to Base
            </button>
         </motion.div>
      )}

      <footer className="text-center py-12 space-y-2 opacity-20">
         <p className="text-[9px] font-black uppercase tracking-[0.6em]">Neural Recall Protocol v7.4.1</p>
         <p className="text-[8px] font-bold uppercase tracking-widest">Roy Spaced Repetition Engine</p>
      </footer>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .glass-indigo { background: rgba(99, 102, 241, 0.05); }
        .glass-rose { background: rgba(244, 63, 94, 0.05); }
        .glass-blue { background: rgba(59, 130, 246, 0.05); }
        .glass-orange { background: rgba(249, 115, 22, 0.05); }
      `}</style>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
