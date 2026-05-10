import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Timer, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  LayoutDashboard, 
  CircleDashed,
  Award,
  TrendingUp,
  Brain,
  Target,
  Trophy,
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MockTestState, MockTest, MockQuestion, TestResult } from '../../types';
import { generateMockTest, analyzeTestPerformance } from '../../services/mockTestService';

interface AIMockTestGeneratorProps {
  apiKey?: string;
}

export default function AIMockTestGenerator({ apiKey }: AIMockTestGeneratorProps) {
  const [testState, setTestState] = useLocalStorage<MockTestState>('ai-mock-tests-v1', {
    history: [],
    activeTest: null,
    overallRank: 'Aspirant',
    totalXp: 1250
  });

  const [view, setView] = useState<'lobby' | 'setup' | 'testing' | 'result'>('lobby');
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupConfig, setSetupConfig] = useState<{
    subject: string;
    mode: MockTest['mode'];
    difficulty: MockQuestion['difficulty'];
  }>({
    subject: 'Biology',
    mode: 'rapid',
    difficulty: 'medium'
  });

  // Active Test State
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState("");

  const startNewTest = async () => {
    if (!apiKey) return;
    setIsGenerating(true);
    try {
      const test = await generateMockTest(apiKey, setupConfig.subject, setupConfig.mode, setupConfig.difficulty);
      setActiveTest(test);
      setTimeLeft(test.timeLimit * 60);
      setCurrentQIndex(0);
      setAnswers({});
      setMarkedForReview(new Set());
      setView('testing');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (view === 'testing' && timeLeft > 0 && !isSubmitting) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && view === 'testing') {
      submitTest();
    }
  }, [view, timeLeft, isSubmitting]);

  const submitTest = async () => {
    if (!activeTest || isSubmitting) return;
    setIsSubmitting(true);

    let score = 0;
    const weakTopics: string[] = [];
    
    activeTest.questions.forEach(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) score += 4;
      else if (answers[q.id]) {
        score -= 1;
        weakTopics.push(q.difficulty);
      }
    });

    const result: TestResult = {
      testId: activeTest.id,
      score,
      accuracy: Math.floor((score / (activeTest.questions.length * 4)) * 100),
      timeTaken: (activeTest.timeLimit * 60) - timeLeft,
      weakTopics: Array.from(new Set(weakTopics)),
      rank: score > 30 ? 'Legend' : 'Steady',
      date: Date.now()
    };

    setLastResult(result);
    setTestState({
      ...testState,
      history: [result, ...testState.history],
      totalXp: testState.totalXp + score * 10
    });

    if (apiKey) {
      const analysis = await analyzeTestPerformance(apiKey, {
        subject: activeTest.subject,
        score: result.score,
        total: activeTest.totalMarks,
        weakTopics: result.weakTopics
      });
      setAiFeedback(analysis.feedback);
    }

    setView('result');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Mock Generator</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <FileText size={10} /> Neural Exam Simulator
           </p>
        </div>
        <div className="flex gap-2">
           <div className="text-right">
              <div className="text-[8px] font-black opacity-20 uppercase">Global Rank</div>
              <div className="text-[10px] font-black italic text-indigo-400">{testState.overallRank}</div>
           </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <section className="p-8 rounded-[3.5rem] glass border border-indigo-500/10 relative overflow-hidden flex flex-col items-center gap-6 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                   <Target size={120} />
                </div>
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                   <Brain size={48} className="animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">Enter Battle Room</h3>
                   <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest px-4">
                      AI-Powered adaptive mock tests for elite competitive preparation.
                   </p>
                </div>
                <button 
                  onClick={() => setView('setup')}
                  className="w-full py-4 bg-indigo-600 rounded-3xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                   Generate New Test
                </button>
             </section>

             {/* Stats HUD */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-1">
                   <div className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Total XP</div>
                   <div className="text-2xl font-black italic tracking-tighter">{testState.totalXp}</div>
                </div>
                <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-1">
                   <div className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Tests Taken</div>
                   <div className="text-2xl font-black italic tracking-tighter">{testState.history.length}</div>
                </div>
             </div>

             {/* Recent History */}
             <section className="space-y-4 px-2">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Previous Battles</h3>
                   <History size={14} className="opacity-20" />
                </div>
                <div className="space-y-3">
                   {testState.history.length === 0 ? (
                      <div className="py-10 text-center opacity-20 border border-dashed border-white/10 rounded-3xl">
                         <p className="text-[10px] font-black uppercase">No recent performance data</p>
                      </div>
                   ) : (
                      testState.history.slice(0, 3).map((h, i) => (
                        <div key={i} className="p-4 rounded-2xl glass border border-white/5 flex items-center justify-between">
                           <div className="space-y-1">
                              <h4 className="text-[10px] font-black uppercase opacity-60">Battle T-{i+1}</h4>
                              <div className="text-xs font-black italic">{h.score} Pts | {h.accuracy}% Acc</div>
                           </div>
                           <div className={cn(
                             "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                             h.accuracy > 70 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-500"
                           )}>
                              {h.rank}
                           </div>
                        </div>
                      ))
                   )}
                </div>
             </section>
          </motion.div>
        )}

        {view === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-8 rounded-[3.5rem] glass border border-indigo-500/20 space-y-8"
          >
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Test Lab</h3>
                <button onClick={() => setView('lobby')} className="text-[10px] font-black opacity-30 uppercase">Cancel</button>
             </div>

             <div className="space-y-6">
                {/* Subject */}
                <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Target Subject</label>
                   <div className="flex flex-wrap gap-2">
                      {['Biology', 'Physics', 'Chemistry', 'Maths'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setSetupConfig({ ...setupConfig, subject: s })}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                            setupConfig.subject === s ? "bg-indigo-600 text-white" : "bg-white/5 text-white/30"
                          )}
                        >
                           {s}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Mode */}
                <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Simulator Mode</label>
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'full', label: 'Full Syllabus' },
                        { id: 'rapid', label: 'Rapid Quiz' },
                        { id: 'pyq', label: 'PYQ Mode' },
                        { id: 'speed', label: 'Speed Challenge' }
                      ].map(m => (
                        <button 
                          key={m.id}
                          onClick={() => setSetupConfig({ ...setupConfig, mode: m.id as any })}
                          className={cn(
                            "p-4 rounded-2xl border text-[10px] font-black uppercase text-left transition-all",
                            setupConfig.mode === m.id ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/5 bg-white/5 text-white/30"
                          )}
                        >
                           {m.label}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Entropy Level</label>
                   <div className="flex gap-2">
                      {['easy', 'medium', 'hard', 'nightmare'].map(d => (
                        <button 
                          key={d}
                          onClick={() => setSetupConfig({ ...setupConfig, difficulty: d as any })}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all",
                            setupConfig.difficulty === d ? "bg-rose-600 text-white" : "bg-white/5 text-white/30"
                          )}
                        >
                           {d}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <button 
               onClick={startNewTest}
               disabled={isGenerating}
               className="w-full py-5 bg-indigo-600 rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isGenerating ? <CircleDashed className="animate-spin" size={18} /> : <Zap size={18} />}
                {isGenerating ? "Synthesizing Test..." : "Ignite Engine"}
             </button>
          </motion.div>
        )}

        {view === 'testing' && activeTest && (
          <motion.div 
            key="testing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-[500px]"
          >
             {/* Test HUD */}
             <div className="flex items-center justify-between px-2 mb-6">
                <div className="flex items-center gap-4">
                   <div className="text-center group">
                      <div className="text-[8px] font-black opacity-30 uppercase">Time Left</div>
                      <div className={cn(
                        "text-lg font-black italic tracking-tighter",
                        timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-indigo-400"
                      )}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </div>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="text-center">
                      <div className="text-[8px] font-black opacity-30 uppercase">Progress</div>
                      <div className="text-lg font-black italic tracking-tighter">
                         {currentQIndex + 1}/{activeTest.questions.length}
                      </div>
                   </div>
                </div>
                <button 
                  onClick={submitTest}
                  className="px-6 py-2 bg-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20"
                >
                   Finish Test
                </button>
             </div>

             {/* Question Palette */}
             <div className="flex gap-2 overflow-x-auto pb-4 px-2 scrollbar-hide">
                {activeTest.questions.map((q, i) => (
                  <button 
                    key={q.id}
                    onClick={() => setCurrentQIndex(i)}
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center border transition-all",
                      currentQIndex === i ? "border-indigo-500 bg-indigo-500 text-white" : 
                      answers[q.id] ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" :
                      markedForReview.has(q.id) ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-500" :
                      "border-white/5 bg-white/5 text-white/30"
                    )}
                  >
                     {i + 1}
                  </button>
                ))}
             </div>

             {/* Question Display */}
             <motion.div 
               key={currentQIndex}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex-1 p-8 rounded-[3rem] glass border border-white/5 space-y-6"
             >
                <div className="flex justify-between items-start">
                   <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[8px] font-black uppercase border border-indigo-500/10">
                      {activeTest.questions[currentQIndex].type}
                   </span>
                   <button 
                     onClick={() => {
                        const newMarked = new Set(markedForReview);
                        if (markedForReview.has(activeTest.questions[currentQIndex].id)) newMarked.delete(activeTest.questions[currentQIndex].id);
                        else newMarked.add(activeTest.questions[currentQIndex].id);
                        setMarkedForReview(newMarked);
                     }}
                     className={cn(
                       "flex items-center gap-1 text-[8px] font-black uppercase transition-all",
                       markedForReview.has(activeTest.questions[currentQIndex].id) ? "text-yellow-500" : "opacity-30"
                     )}
                   >
                      <Flag size={10} /> Mark Review
                   </button>
                </div>

                <h4 className="text-sm font-black italic uppercase tracking-tight leading-relaxed">
                   {activeTest.questions[currentQIndex].question}
                </h4>

                <div className="space-y-3 pt-4">
                   {activeTest.questions[currentQIndex].options?.map((opt, i) => (
                      <button 
                         key={i}
                         onClick={() => setAnswers({ ...answers, [activeTest.questions[currentQIndex].id]: opt })}
                         className={cn(
                           "w-full p-5 rounded-2xl border text-left text-xs font-bold transition-all relative overflow-hidden group",
                           answers[activeTest.questions[currentQIndex].id] === opt ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/5 bg-white/5 text-white/40"
                         )}
                      >
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black font-mono transition-all",
                              answers[activeTest.questions[currentQIndex].id] === opt ? "bg-indigo-500 text-white" : "bg-white/10 text-white/30 group-hover:bg-white/20"
                            )}>
                               {String.fromCharCode(65 + i)}
                            </div>
                            <span className="flex-1">{opt}</span>
                         </div>
                      </button>
                   ))}
                </div>
             </motion.div>

             {/* Footer Navigation */}
             <div className="flex justify-between items-center p-6 gap-4">
                <button 
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(currentQIndex - 1)}
                  className="flex-1 py-4 glass border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
                >
                   Previous
                </button>
                <button 
                  onClick={() => {
                     if (currentQIndex < activeTest.questions.length - 1) setCurrentQIndex(currentQIndex + 1);
                     else submitTest();
                  }}
                  className="flex-1 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                   {currentQIndex < activeTest.questions.length - 1 ? 'Next' : 'Submit'}
                </button>
             </div>
          </motion.div>
        )}

        {view === 'result' && lastResult && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
             <section className="p-8 rounded-[3.5rem] glass border border-emerald-500/10 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                   <Trophy size={160} />
                </div>
                
                <div className="space-y-2">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter">Battle Clear</h3>
                   <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                      Accuracy: {lastResult.accuracy}%
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 space-y-1">
                      <div className="text-[8px] font-black opacity-30 uppercase">Final Score</div>
                      <div className="text-2xl font-black italic text-indigo-400">{lastResult.score}</div>
                   </div>
                   <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 space-y-1">
                      <div className="text-[8px] font-black opacity-30 uppercase">Rank Tier</div>
                      <div className="text-2xl font-black italic text-fuchsia-400">{lastResult.rank}</div>
                   </div>
                </div>

                {aiFeedback && (
                   <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 text-left space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400">
                         <Sparkles size={14} /> AI Performance Coach
                      </div>
                      <p className="text-xs font-black italic uppercase italic tracking-tight leading-relaxed">
                         "{aiFeedback}"
                      </p>
                   </div>
                )}
             </section>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Mistake Deep-Scan</h3>
                {lastResult.weakTopics.length > 0 ? (
                   <div className="flex flex-wrap gap-2 px-2">
                      {lastResult.weakTopics.map(t => (
                        <span key={t} className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase border border-rose-500/20">
                           {t}
                        </span>
                      ))}
                   </div>
                ) : (
                   <div className="p-4 glass rounded-2xl flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase">Zero structural flaws detected</span>
                   </div>
                )}
             </div>

             <button 
               onClick={() => setView('lobby')}
               className="w-full py-5 glass border border-white/10 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
             >
                Return to Hub <ArrowRight size={18} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Connectivity UI */}
      {view === 'lobby' && (
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
           <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
                 Sim Integrity
              </div>
              <div className="flex gap-1">
                 {Array.from({ length: 12 }).map((_, i) => (
                   <div 
                     key={i} 
                     className={cn(
                       "w-1 h-3 rounded-full transition-all duration-1000",
                       Math.random() > 0.4 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/5"
                     )} 
                   />
                 ))}
              </div>
           </div>
           <div className="text-right flex flex-col justify-end">
              <div className="text-3xl font-black italic tracking-tighter leading-none text-white/80">99.9%</div>
              <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Calibration Ready</div>
           </div>
        </section>
      )}
    </div>
  );
}
