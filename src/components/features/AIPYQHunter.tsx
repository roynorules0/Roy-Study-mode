import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Search, 
  Flame, 
  ShieldCheck, 
  Zap, 
  History, 
  TrendingUp, 
  Layout, 
  Timer, 
  Brain, 
  ChevronRight, 
  ArrowRight, 
  Trophy,
  Filter,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Compass
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

interface PYQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  year: number;
  exam: string;
  subject: string;
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importance: 'High' | 'Critical' | 'Standard';
  repeatedTimes: number;
}

interface UserPYQHistory {
  solvedId: string;
  pyqId: string;
  isCorrect: boolean;
  timeTaken: number;
  timestamp: number;
}

const MOCK_PYQS: PYQ[] = [
  {
    id: 'pyq_1',
    question: "Calculate the equivalent resistance between point A and B in the provided infinite network cycle where each resistor is R.",
    options: ["R(1+√3)", "R(1+√5)/2", "2R", "R/√3"],
    correctAnswer: 1,
    year: 2023,
    exam: "JEE Mains",
    subject: "Physics",
    chapter: "Current Electricity",
    difficulty: "Medium",
    importance: "Critical",
    repeatedTimes: 5
  },
  {
    id: 'pyq_2',
    question: "Which of the following hormones is responsible for apical dominance in plants during early stages?",
    options: ["Auxin", "Gibberellin", "Cytokinin", "ABA"],
    correctAnswer: 0,
    year: 2022,
    exam: "NEET",
    subject: "Biology",
    chapter: "Plant Growth",
    difficulty: "Easy",
    importance: "High",
    repeatedTimes: 8
  },
  {
    id: 'pyq_3',
    question: "The major product formed in the reaction of 2-Bromobutane with NaOEt/EtOH is...",
    options: ["But-1-ene", "But-2-ene", "2-Ethoxybutane", "Butane"],
    correctAnswer: 1,
    year: 2021,
    exam: "NEET",
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    difficulty: "Hard",
    importance: "Critical",
    repeatedTimes: 4
  },
  {
    id: 'pyq_4',
    question: "In a Young's double slit experiment, the fringe width is found to be 0.4 mm. If the whole apparatus is immersed in water of refractive index 4/3, the new fringe width will be:",
    options: ["0.30 mm", "0.40 mm", "0.53 mm", "0.20 mm"],
    correctAnswer: 0,
    year: 2023,
    exam: "JEE Mains",
    subject: "Physics",
    chapter: "Wave Optics",
    difficulty: "Medium",
    importance: "High",
    repeatedTimes: 3
  },
  {
    id: 'pyq_5',
    question: "Which of the following is NOT a property of genetic code?",
    options: ["Non-overlapping", "Ambiguous", "Degenerate", "Universal"],
    correctAnswer: 1,
    year: 2020,
    exam: "NEET",
    subject: "Biology",
    chapter: "Genetics",
    difficulty: "Easy",
    importance: "Critical",
    repeatedTimes: 6
  },
  {
    id: 'pyq_6',
    question: "The IUPAC name of the complex [Co(NH3)5(CO3)]Cl is:",
    options: ["Pentaamminecarbonatocobalt(III) chloride", "Pentaamminecarbonatocobalt(II) chloride", "Pentaamminecobalt(III) carbonate chloride", "Carbonatopentaamminecobalt(III) chloride"],
    correctAnswer: 0,
    year: 2019,
    exam: "Boards",
    subject: "Chemistry",
    chapter: "Coordination Compounds",
    difficulty: "Medium",
    importance: "Standard",
    repeatedTimes: 2
  },
  {
    id: 'pyq_7',
    question: "An object is placed at a distance of 15 cm from a convex lens of focal length 10 cm. Find the magnification produced by the lens.",
    options: ["2", "-2", "1.5", "-1.5"],
    correctAnswer: 1,
    year: 2022,
    exam: "Boards",
    subject: "Physics",
    chapter: "Ray Optics",
    difficulty: "Easy",
    importance: "High",
    repeatedTimes: 3
  },
  {
    id: 'pyq_8',
    question: "What is the primary role of the enzyme DNA ligase in recombinant DNA technology?",
    options: ["Cleaving DNA", "Amplifying DNA", "Joining DNA fragments", "Denaturing DNA"],
    correctAnswer: 2,
    year: 2023,
    exam: "NEET",
    subject: "Biology",
    chapter: "Biotechnology",
    difficulty: "Easy",
    importance: "Critical",
    repeatedTimes: 7
  }
];

export default function AIPYQHunter() {
  const [history, setHistory] = useLocalStorage<UserPYQHistory[]>('ai-pyq-history', []);
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('ai-pyq-bookmarks', []);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'hunt' | 'analyze' | 'practice'>('hunt');
  const [selectedExam, setSelectedExam] = useState("All");
  const [activeQuestion, setActiveQuestion] = useState<PYQ | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  // AI Predictor Insights (Dynamic Hinglish)
  const aiInsights = useMemo(() => {
    if (searchQuery.toLowerCase().includes('organic')) {
      return { msg: "Organic PYQ priority high hai ⚡, patterns overlap ho rahe hain!", priority: 'critical' };
    }
    if (searchQuery.toLowerCase().includes('cell')) {
      return { msg: "Cell chapter se direct NCERT lines repeat ho rahi hain 🔥", priority: 'high' };
    }
    const insights = [
      { msg: "Ye concept baar baar exam me aa raha hai 🔥", priority: 'high' },
      { msg: "Physics numericals dangerous important hain 👑, formulas revise karo!", priority: 'critical' },
      { msg: "Biology selection trends show NCERT focus is back ⚡", priority: 'medium' }
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }, [searchQuery]);

  // Filtered PYQs
  const filteredPYQs = useMemo(() => {
    return MOCK_PYQS.filter(p => {
      const qLower = p.question.toLowerCase();
      const cLower = p.chapter.toLowerCase();
      const sLower = p.subject.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = query === "" || 
                            qLower.includes(query) || 
                            cLower.includes(query) || 
                            sLower.includes(query);
                            
      const matchesExam = selectedExam === "All" || p.exam === selectedExam;
      return matchesSearch && matchesExam;
    });
  }, [searchQuery, selectedExam]);

  // Pattern Prediction Logic
  const patternStats = useMemo(() => {
    const subjects = ['Physics', 'Chemistry', 'Biology'];
    return subjects.map(s => {
      const subjectQuestions = MOCK_PYQS.filter(q => q.subject === s);
      const avgRepetition = subjectQuestions.reduce((acc, q) => acc + q.repeatedTimes, 0) / (subjectQuestions.length || 1);
      return { subject: s, weightage: Math.min(100, avgRepetition * 15) };
    });
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = history.length;
    const correct = history.filter(h => h.isCorrect).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const xp = (correct * 50) + (total * 10);
    
    // Simple streak: consecutive correct answers in history
    let currentStreak = 0;
    for (const h of history) {
      if (h.isCorrect) currentStreak++;
      else break;
    }

    const mastery = Math.round(accuracy * 0.8 + (Math.min(total, 100) / 100) * 20);
    
    return { total, accuracy, streak: currentStreak, xp, mastery };
  }, [history]);

  const handleSolve = (pyq: PYQ, selectedOption: number) => {
    const isCorrect = selectedOption === pyq.correctAnswer;
    const newEntry: UserPYQHistory = {
      solvedId: Math.random().toString(36).substr(2, 9),
      pyqId: pyq.id,
      isCorrect,
      timeTaken: 15,
      timestamp: Date.now()
    };
    setHistory([newEntry, ...history]);
    setShowSolution(true);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const runScanner = () => {
    setScannerActive(true);
    setTimeout(() => setScannerActive(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black/90 p-4 sm:p-8 space-y-8 font-sans overflow-x-hidden pb-24">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 shadow-xl shadow-indigo-600/20 flex items-center justify-center">
                <Target className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">PYQ Hunter</h1>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] mt-2">AI Neural Pattern Extraction • v2.1</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="px-5 py-3 rounded-2xl glass border border-white/5 flex items-center gap-4">
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black uppercase opacity-30">Neural XP</span>
                 <span className="text-xl font-black text-indigo-400">{stats.xp}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black uppercase opacity-30">Streak</span>
                 <span className="text-xl font-black text-amber-400">{stats.streak}x</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black uppercase opacity-30">Mastery</span>
                 <span className="text-xl font-black text-emerald-400">{stats.mastery}%</span>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation Sub-Header */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
         {[
           { id: 'hunt', label: 'PYQ Scanner', icon: <Search size={16} /> },
           { id: 'analyze', label: 'Pattern Predictor', icon: <Brain size={16} /> },
           { id: 'practice', label: 'Combat Mode', icon: <Zap size={16} /> }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={cn(
               "px-6 py-4 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all border",
               activeTab === tab.id 
                 ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20" 
                 : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
             )}
           >
             {tab.icon}
             <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
           </button>
         ))}
      </div>

      <AnimatePresence mode='wait'>
        {activeTab === 'hunt' && (
          <motion.div 
            key="hunt" 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
             {/* Search & Filters */}
             <div className="lg:col-span-1 space-y-6">
                <div className="p-8 rounded-[2.5rem] glass border border-white/10 bg-white/[0.02] space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xs font-black italic uppercase tracking-[0.3em] text-white/40">Filters</h3>
                         {searchQuery && (
                           <button onClick={() => setSearchQuery("")} className="text-[9px] font-black uppercase text-indigo-400">Clear</button>
                         )}
                      </div>
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                         <input 
                           type="text" 
                           placeholder="Search chapter or topic..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white border border-white/5 outline-none focus:border-indigo-500 transition-all"
                         />
                      </div>
                      <button 
                        onClick={runScanner}
                        disabled={scannerActive}
                        className={cn(
                          "w-full py-3 rounded-xl border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          scannerActive ? "bg-indigo-600 text-white animate-pulse" : "bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10"
                        )}
                      >
                         <Target size={14} />
                         {scannerActive ? "Neural Scanning..." : "Run AI Topic Scanner"}
                      </button>
                   </div>

                   <div className="space-y-3">
                      <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Select Exam</span>
                      <div className="grid grid-cols-2 gap-2">
                         {["All", "NEET", "JEE Mains", "Boards"].map(exam => (
                           <button 
                             key={exam}
                             onClick={() => setSelectedExam(exam)}
                             className={cn(
                               "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                               selectedExam === exam ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/5 text-white/30"
                             )}
                           >
                             {exam}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                         <Sparkles className="text-indigo-400 shrink-0" size={16} />
                         <p className="text-[10px] font-black uppercase text-indigo-400/80 leading-relaxed tracking-wider">
                           {aiInsights.msg}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="p-8 rounded-[2.5rem] glass border border-white/5 bg-white/[0.02]">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Subject Statistics</h3>
                   <div className="space-y-5">
                      {patternStats.map(s => (
                        <div key={s.subject} className="space-y-2">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                              <span className="text-white/60">{s.subject}</span>
                              <span className="text-white">{Math.round(s.weightage)}%</span>
                           </div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.weightage}%` }}
                                className={cn("h-full rounded-full", s.subject === 'Physics' ? "bg-indigo-500" : s.subject === 'Chemistry' ? "bg-sky-500" : "bg-emerald-500")}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* PYQ List */}
             <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-white">Extracted PYQs</h3>
                      {scannerActive && (
                        <div className="flex items-center gap-1">
                           <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                           <span className="text-[8px] font-black uppercase text-indigo-400">AI Searching...</span>
                        </div>
                      )}
                   </div>
                   <span className="text-[10px] font-bold text-white/40">{filteredPYQs.length} Matches Found</span>
                </div>

                {filteredPYQs.length === 0 ? (
                  <div className="p-20 text-center space-y-4 rounded-[3rem] border border-white/5 bg-white/[0.01]">
                     <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Search className="text-white/20" size={32} />
                     </div>
                     <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">No Results Found</h4>
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Try checking "All" exams or changing filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPYQs.map((pyq, i) => {
                      const isSolved = history.some(h => h.pyqId === pyq.id);
                      const isCorrect = history.find(h => h.pyqId === pyq.id)?.isCorrect;
                      const isBookmarked = bookmarks.includes(pyq.id);

                      return (
                        <motion.div 
                          key={pyq.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "group p-8 rounded-[3rem] glass border transition-all flex flex-col justify-between relative overflow-hidden",
                            isSolved ? (isCorrect ? "bg-emerald-500/[0.02] border-emerald-500/20" : "bg-rose-500/[0.02] border-rose-500/20") : "bg-white/[0.01] border-white/5 hover:bg-white/[0.04]"
                          )}
                        >
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                      pyq.importance === 'Critical' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                                    )}>
                                      {pyq.importance} Priority
                                    </div>
                                    {isSolved && (
                                       <div className={cn(
                                         "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                         isCorrect ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                       )}>
                                          {isCorrect ? "Mastered" : "Fix Error"}
                                       </div>
                                    )}
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => toggleBookmark(pyq.id)}
                                      className={cn("transition-colors", isBookmarked ? "text-amber-400" : "text-white/20 hover:text-white")}
                                    >
                                       <Lock size={14} fill={isBookmarked ? "currentColor" : "none"} />
                                    </button>
                                    <span className="text-[10px] font-black text-white/20">{pyq.exam} • {pyq.year}</span>
                                 </div>
                              </div>
                              <p className="text-sm font-bold text-white/80 leading-relaxed group-hover:text-white transition-colors">
                                 {pyq.question}
                              </p>

                              <div className="flex flex-wrap gap-2 pt-2">
                                 {["physics", pyq.chapter.toLowerCase(), "repeated x" + pyq.repeatedTimes].map(t => (
                                   <span key={t} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 text-white/30 rounded-md">
                                      {t}
                                   </span>
                                 ))}
                              </div>
                           </div>

                           <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className={cn(
                                   "w-2 h-2 rounded-full",
                                   pyq.difficulty === 'Easy' ? "bg-emerald-500" : pyq.difficulty === 'Medium' ? "bg-amber-500" : "bg-rose-500"
                                 )} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{pyq.difficulty}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setActiveQuestion(pyq);
                                  setShowSolution(false);
                                }}
                                className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                              >
                                 {isSolved ? "Attempt Again" : "Solve Now"}
                              </button>
                           </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
             </div>
          </motion.div>
        )}

        {activeTab === 'analyze' && (
          <motion.div 
            key="analyze"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
             <div className="lg:col-span-2 space-y-8">
                <div className="p-8 rounded-[3rem] glass border border-white/5 bg-white/[0.02]">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Pattern Recognition Engine</h3>
                         <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Historical Analysis of {selectedExam === "All" ? "Combined Exams" : selectedExam}</p>
                      </div>
                      <TrendingUp className="text-indigo-400" size={24} />
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[
                           { name: '2019', val: 40 },
                           { name: '2020', val: 65 },
                           { name: '2021', val: 55 },
                           { name: '2022', val: 89 },
                           { name: '2023', val: 72 },
                           { name: '2024', val: 95 },
                         ]}>
                            <defs>
                               <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                      {[
                        { label: 'Repeat Rate', val: selectedExam === 'NEET' ? '32%' : '24%', icon: <Flame size={14} className="text-rose-400" /> },
                        { label: 'High Yield', val: '12 Topics', icon: <Zap size={14} className="text-indigo-400" /> },
                        { label: 'Confidence', val: '89.4%', icon: <ShieldCheck size={14} className="text-emerald-400" /> }
                      ].map(x => (
                        <div key={x.label} className="text-center space-y-1">
                           <div className="flex items-center justify-center gap-1">
                              {x.icon}
                              <span className="text-xs font-black text-white">{x.val}</span>
                           </div>
                           <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">{x.label}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-8 rounded-[3.5rem] glass border border-white/5 bg-white/[0.01]">
                   <h3 className="text-xs font-black italic uppercase tracking-[0.3em] text-white/50 mb-8">Concept High Performance Map</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {MOCK_PYQS.filter(q => selectedExam === 'All' || q.exam === selectedExam).slice(0, 8).map((q, i) => (
                        <div key={q.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                           <div className={cn("absolute inset-0 opacity-10", i % 2 === 0 ? "bg-indigo-500" : "bg-sky-500")} />
                           <div className="text-[11px] font-black uppercase text-white relative z-10 text-center">{q.chapter}</div>
                           <div className="flex items-center gap-1 relative z-10">
                              <Flame size={12} className={cn(q.importance === 'Critical' ? "text-rose-500" : "text-amber-500")} />
                              <span className="text-[10px] font-black text-white/60">{q.repeatedTimes}x Repeats</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                <div className="p-8 rounded-[3rem] glass border border-indigo-500/20 bg-indigo-500/[0.02]">
                   <div className="flex items-center gap-3 mb-6">
                      <Layout className="text-indigo-400" size={18} />
                      <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Pattern Alerts</h3>
                   </div>
                   <div className="space-y-4">
                      {[
                        { title: "NTA Numerical Shift", sub: "Calculative physics focus increasing", tag: "Alert" },
                        { title: "Organic Repeat Cycle", sub: "Benzene derivatives matched pattern", tag: "Hot" },
                        { title: "Direct NCERT Lines", sub: "Biology statement questions high", tag: "Trend" }
                      ].map(alert => (
                        <div key={alert.title} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2 group hover:border-indigo-500/30 transition-all">
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md">{alert.tag}</span>
                              <ArrowRight size={12} className="text-white/20 group-hover:text-white transition-colors" />
                           </div>
                           <h4 className="text-[11px] font-black text-white/90">{alert.title}</h4>
                           <p className="text-[9px] font-medium text-white/40">{alert.sub}</p>
                        </div>
                      ))}
                   </div>
                   <button className="w-full mt-6 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:bg-white/5 transition-all">
                      Predict Next Cycle
                   </button>
                </div>

                <div className="p-8 rounded-[3rem] glass border border-white/5 bg-white/[0.02]">
                   <h3 className="text-[10px] font-black italic uppercase tracking-widest opacity-40 mb-6">Subject Balance</h3>
                   <div className="space-y-4">
                      {[
                        { l: "Phy", v: 75, c: "#6366f1" },
                        { l: "Che", v: 40, c: "#0ea5e9" },
                        { l: "Bio", v: 90, c: "#10b981" }
                      ].map(s => (
                        <div key={s.l} className="flex items-center gap-4">
                           <span className="text-[9px] font-black uppercase text-white/40 w-10">{s.l}</span>
                           <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.v}%` }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: s.c }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'practice' && (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-12"
          >
             <div className="space-y-4">
                <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40">
                   <Zap className="text-white" size={40} />
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-tight">PYQ Combat Hub</h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">Initialize High Precision Combat Drill</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
                {[
                  { id: 'rapid', label: 'Rapid PYQ Attack', icon: <Flame size={24} />, sub: '30 Qs in 15 Minutes', query: 'JEE' },
                  { id: 'weak', label: 'Rescue Session', icon: <AlertCircle size={24} />, sub: 'Rescue your mistakes', query: 'Critical' },
                  { id: 'marathon', label: '20 Year Marathon', icon: <History size={24} />, sub: 'Full pattern coverage', query: '' }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => {
                      setSearchQuery(mode.query);
                      setActiveTab('hunt');
                      runScanner();
                    }}
                    className="p-10 rounded-[3rem] glass bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all group flex flex-col items-center gap-6"
                  >
                     <div className="p-5 rounded-3xl bg-white/5 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                        {mode.icon}
                     </div>
                     <div className="space-y-2">
                        <div className="text-xl font-black uppercase text-white italic tracking-tighter">{mode.label}</div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{mode.sub}</p>
                     </div>
                  </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solving Overlay */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="max-w-2xl w-full glass rounded-[3.5rem] p-10 space-y-10 shadow-huge border border-white/10 bg-[#0a0a0a]"
             >
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Combat Sync Mode</div>
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{activeQuestion.chapter}</h3>
                   </div>
                   <button onClick={() => {
                     setActiveQuestion(null);
                     setShowSolution(false);
                   }} className="p-3 rounded-full hover:bg-white/10 transition-colors">
                      <ArrowRight size={20} className="rotate-180 text-white/40" />
                   </button>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                   <p className="text-lg font-bold text-white leading-relaxed">
                      {activeQuestion.question}
                   </p>
                </div>

                {!showSolution ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {activeQuestion.options.map((opt, i) => (
                       <button 
                         key={i}
                         onClick={() => handleSolve(activeQuestion, i)}
                         className="p-6 rounded-[2rem] bg-white/5 border border-white/10 text-white/80 hover:bg-indigo-600 hover:border-indigo-400 hover:text-white text-left font-bold transition-all relative group"
                       >
                          <span className="absolute top-2 right-4 text-4xl font-black opacity-[0.03] group-hover:opacity-10">{String.fromCharCode(65 + i)}</span>
                          <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Option {String.fromCharCode(65 + i)}</div>
                          <div className="text-sm tracking-tight">{opt}</div>
                       </button>
                     ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                     <div className={cn(
                       "p-8 rounded-[2.5rem] border flex items-center justify-between",
                       history[0]?.isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                     )}>
                        <div className="flex items-center gap-6">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center",
                             history[0]?.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                           )}>
                              {history[0]?.isCorrect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">
                                 {history[0]?.isCorrect ? "Perfect Extract!" : "Neural Mismatch"}
                              </h4>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                 Correct Answer: {String.fromCharCode(65 + activeQuestion.correctAnswer)}
                              </p>
                           </div>
                        </div>
                        <button 
                          onClick={() => toggleBookmark(activeQuestion.id)}
                          className={cn("p-4 rounded-2xl transition-all", bookmarks.includes(activeQuestion.id) ? "bg-amber-400 text-black" : "bg-white/5 text-white/40")}
                        >
                           <Lock size={20} fill={bookmarks.includes(activeQuestion.id) ? "currentColor" : "none"} />
                        </button>
                     </div>

                     <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                           <Sparkles size={16} className="text-indigo-400" />
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-white/60">AI Neural Solution</h5>
                        </div>
                        <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                           "The pattern suggests that {activeQuestion.chapter} often tests this fundamental concept. To fix this in memory, remember the relation: {activeQuestion.options[activeQuestion.correctAnswer]}"
                        </p>
                     </div>

                     <button 
                       onClick={() => {
                         setActiveQuestion(null);
                         setShowSolution(false);
                       }}
                       className="w-full py-5 rounded-[2rem] bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5 hover:scale-[0.98] transition-all"
                     >
                        Next Extraction
                     </button>
                  </motion.div>
                )}

                {!showSolution && (
                   <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <Timer size={14} className="text-indigo-400" />
                         <span className="text-xs font-black tabular-nums text-white/60">00:15 / 00:45</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex items-center gap-2">
                         <TrendingUp size={14} className="text-emerald-400" />
                         <span className="text-xs font-black text-white/60">Accuracy Buffer: High</span>
                      </div>
                   </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results HUD Float */}
      {history.length > 0 && !activeQuestion && (
        <motion.div 
           initial={{ y: 100 }}
           animate={{ y: 24 }}
           className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 hidden sm:block"
        >
           <div className="p-6 rounded-[2.5rem] glass border border-white/10 bg-indigo-500/20 backdrop-blur-2xl shadow-2xl flex items-center justify-between mb-2">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Trophy className="text-amber-400" size={24} />
                 </div>
                 <div>
                    <div className="text-xs font-black uppercase text-white/80 tracking-widest">PYQ Mastery Score</div>
                    <div className="text-2xl font-black italic tracking-tighter text-white">Elite Hunter</div>
                 </div>
              </div>
              <button 
                onClick={() => setActiveTab('analyze')}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                 <ArrowRight size={20} />
              </button>
           </div>
        </motion.div>
      )}
    </div>
  );
}
