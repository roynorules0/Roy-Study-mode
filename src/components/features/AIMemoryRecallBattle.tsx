import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Zap, 
  Timer as TimerIcon, 
  Trophy, 
  Gamepad2, 
  RotateCcw, 
  X, 
  Flame, 
  Target, 
  AlertCircle,
  Skull,
  Timer,
  ZapOff,
  Medal,
  ChevronRight,
  Sparkles,
  BarChart3,
  Dna
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type GameMode = 'blitz' | 'survival' | 'sudden_death' | 'ncert_sniper';
type Rank = 'Beginner Brain' | 'Fast Thinker' | 'Recall Master' | 'Memory Titan' | 'Neural Beast';

interface RecallQuestion {
  id: string;
  type: 'formula' | 'definition' | 'diagram' | 'ncert_line' | 'fact';
  question: string;
  answer: string;
  options?: string[];
  context?: string;
}

interface RecallSession {
  id: string;
  timestamp: number;
  mode: GameMode;
  score: number;
  accuracy: number;
  avgTime: number;
  bestStreak: number;
  weakTopics: string[];
}

const GAME_MODES = [
  { id: 'blitz', label: '30s Blitz', icon: <TimerIcon />, desc: 'Rapid fire memory storm', time: 30 },
  { id: 'survival', label: 'Survival', icon: <Flame />, desc: 'Wrong answer = Game Over', time: 10 },
  { id: 'ncert_sniper', label: 'NCERT Sniper', icon: <Target />, desc: 'Precision recall on lines', time: 15 },
  { id: 'sudden_death', label: 'Sudden Death', icon: <Skull />, desc: '1 second thinking limit', time: 1 }
];

export default function AIMemoryRecallBattle({ apiKey }: { apiKey: string }) {
  const [gameState, setGameState] = useState<'lobby' | 'loading' | 'active' | 'summary'>('lobby');
  const [selectedMode, setSelectedMode] = useState<GameMode>('blitz');
  const [inputTopic, setInputTopic] = useState('');
  const [questions, setQuestions] = useState<RecallQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useLocalStorage<RecallSession[]>('recall-history', []);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'combo', msg: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [commentary, setCommentary] = useState('');
  
  // Game metrics
  const [startTime, setStartTime] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [weakDetection, setWeakDetection] = useState<Record<string, number>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState === 'active') {
       if (stamina <= 0) {
          setCommentary("Neural fatigue detected! Battle interrupted.");
          endGame();
          return;
       }
       const interval = setInterval(() => {
          setStamina(prev => Math.max(0, prev - 0.5));
       }, 100);
       return () => clearInterval(interval);
    }
  }, [gameState, stamina]);

  const getRank = (avgScore: number): Rank => {
    if (avgScore > 2000) return 'Neural Beast';
    if (avgScore > 1500) return 'Memory Titan';
    if (avgScore > 1000) return 'Recall Master';
    if (avgScore > 500) return 'Fast Thinker';
    return 'Beginner Brain';
  };

  const startBattle = async () => {
    if (!inputTopic) return;
    setGameState('loading');
    setLoadingStep("Connecting to Neural Core...");
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      setLoadingStep("Synthesizing Rapid Recall Rounds...");
      
      const prompt = `
        You are "Memory Master AI". Generate 10 rapid-fire NEET/JEE recall questions for the topic: ${inputTopic}.
        Mode: ${selectedMode}.
        
        Question Types (Mix them):
        - Formula recall (e.g., "Force equation?")
        - Definition (e.g., "What is Osmosis?")
        - NCERT Line finish (e.g., "Mitochondria is the ____ of the cell")
        - Fact check (e.g., "Year of discovery of nucleus?")

        Return RAW JSON:
        [{ "id": "1", "type": "formula", "question": "...", "answer": "...", "options": ["...", "...", "..."], "context": "Topic Name" }]
      `;

      const response: any = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      const responseText = response.text || "";
      const cleanedJson = responseText.replace(/```json|```/g, '').trim();
      const generated = JSON.parse(cleanedJson);
      
      setQuestions(generated);
      setGameState('active');
      setCurrentIdx(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setReactionTimes([]);
      setWeakDetection({});
      setStamina(100);
      setTimeLeft(GAME_MODES.find(m => m.id === selectedMode)?.time || 10);
      setStartTime(Date.now());
      
      setCommentary("Taiyaar ho? Battle shuru! ⚡");
    } catch (err) {
      console.error(err);
      setGameState('lobby');
    }
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'active') return;
    
    const currentQ = questions[currentIdx];
    const isRight = answer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();
    const timeTaken = (Date.now() - startTime) / 1000;
    setReactionTimes(prev => [...prev, timeTaken]);

    if (isRight) {
      const speedBonus = Math.max(0, (10 - timeTaken) * 50);
      const comboBonus = streak * 100;
      const basePoints = 500;
      const points = Math.round(basePoints + speedBonus + comboBonus);
      
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, streak + 1));
      setIsCorrect(true);
      setFeedback({ type: 'success', msg: `+${points} XP` });
      
      // Hinglish Commentary
      if (streak + 1 >= 5) setCommentary("Neural beast mode active! 🔥");
      else if (timeTaken < 2) setCommentary("Recall speed dangerous hai! ⚡");
      else setCommentary("Sahi pakde hain! Keep it up.");

      if (streak + 1 >= 3) {
         setFeedback({ type: 'combo', msg: `${streak + 1}X COMBO!` });
      }

    } else {
      setStreak(0);
      setIsCorrect(false);
      setFeedback({ type: 'error', msg: `WRONG! Ans: ${currentQ.answer}` });
      setCommentary("Oh no! Recall me error aaya. Focus!");
      
      // Detect weak topic
      setWeakDetection(prev => ({
        ...prev,
        [currentQ.context || 'General']: (prev[currentQ.context || 'General'] || 0) + 1
      }));

      if (selectedMode === 'survival' || selectedMode === 'sudden_death') {
        endGame();
        return;
      }
    }

    setTimeout(() => {
      setIsCorrect(null);
      setFeedback(null);
      nextQuestion();
    }, 1200);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(GAME_MODES.find(m => m.id === selectedMode)?.time || 10);
      setStartTime(Date.now());
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameState('summary');
    const avgTime = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b) / reactionTimes.length : 0;
    const accuracy = questions.length > 0 ? Math.round((score / (questions.length * 1000)) * 100) : 0;
    
    const session: RecallSession = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      mode: selectedMode,
      score,
      accuracy,
      avgTime,
      bestStreak,
      weakTopics: Object.keys(weakDetection)
    };
    
    setHistory([session, ...history]);
  };

  useEffect(() => {
    if (gameState === 'active' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'active' && timeLeft === 0) {
      handleAnswer(''); // Timeout is wrong answer
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState]);

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 pb-24 font-sans overflow-x-hidden selection:bg-cyan-500/30">
      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto space-y-8 pt-8"
          >
            <div className="text-center space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Gamepad2 size={12} /> Neural Combat System
               </div>
               <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-br from-white via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                  Recall<br/>Battle
               </h1>
               <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Train your brain for instant response</p>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Brain size={120} />
               </div>
               
               <div className="space-y-4 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Battle Topic</label>
                     <input 
                        value={inputTopic}
                        onChange={(e) => setInputTopic(e.target.value)}
                        placeholder="e.g. Thermodynamics, Cell Cycle..."
                        className="w-full p-5 rounded-3xl bg-black/40 border border-white/5 focus:border-cyan-500/50 outline-none transition-all placeholder:opacity-20 font-bold"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     {GAME_MODES.map((mode) => (
                       <button
                         key={mode.id}
                         onClick={() => setSelectedMode(mode.id as GameMode)}
                         className={cn(
                           "p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all",
                           selectedMode === mode.id 
                             ? "bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20" 
                             : "bg-white/5 border-white/5 hover:border-white/10 opacity-60"
                         )}
                       >
                          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", selectedMode === mode.id ? "bg-black/20" : "bg-white/5")}>
                             {mode.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tighter">{mode.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <button 
                onClick={startBattle}
                disabled={!inputTopic}
                className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
               >
                 <Zap size={18} fill="currentColor" /> Initialize Combat
               </button>
            </div>

            {history.length > 0 && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Previous Battles</h3>
                    <BarChart3 size={14} className="opacity-20" />
                 </div>
                 <div className="space-y-3">
                    {history.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                               <Trophy size={18} />
                            </div>
                            <div>
                               <div className="text-sm font-black italic uppercase tracking-tighter">{session.score} PTS</div>
                               <div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{session.mode} • {session.accuracy}% Acc</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-xs font-black text-cyan-400 italic">#{getRank(session.score)}</div>
                            <div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{new Date(session.timestamp).toLocaleDateString()}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'loading' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center"
          >
             <div className="relative mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-500/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Brain size={48} className="text-cyan-400 animate-pulse" />
                </div>
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">Loading Neural Core</h2>
                <p className="text-xs font-bold opacity-40 uppercase tracking-[0.3em]">{loadingStep}</p>
             </div>
          </motion.div>
        )}

        {gameState === 'active' && currentQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col p-6"
          >
             {/* HUD Top */}
             <div className="flex justify-between items-start mb-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                         <Flame size={20} fill="currentColor" className="animate-bounce" />
                      </div>
                      <div>
                         <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Brain Streak</div>
                         <div className="text-xl font-black italic tracking-tighter leading-none">{streak}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                         <Trophy size={20} />
                      </div>
                      <div>
                         <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Current Score</div>
                         <div className="text-xl font-black italic tracking-tighter leading-none">{score}</div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                   <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 rotate-[-90deg]">
                         <circle 
                           cx="48" cy="48" r="40" 
                           fill="transparent" 
                           stroke="rgba(255,255,255,0.05)" 
                           strokeWidth="8"
                         />
                         <motion.circle 
                           cx="48" cy="48" r="40" 
                           fill="transparent" 
                           stroke="currentColor" 
                           strokeWidth="8"
                           strokeDasharray={251}
                           initial={{ strokeDashoffset: 0 }}
                           animate={{ strokeDashoffset: 251 - (timeLeft / (GAME_MODES.find(m => m.id === selectedMode)?.time || 10)) * 251 }}
                           className={cn(
                             timeLeft < 5 ? "text-rose-500" : "text-cyan-400",
                             "transition-colors"
                           )}
                         />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                         <span className={cn("text-3xl font-black tabular-nums tracking-tighter", timeLeft < 5 && "text-rose-500 animate-pulse")}>{timeLeft}</span>
                         <span className="text-[8px] font-black uppercase opacity-40 tracking-wider">SEC</span>
                      </div>
                   </div>
                   
                   <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <motion.div 
                        animate={{ width: `${stamina}%` }}
                        className={cn(
                          "h-full rounded-full transition-colors",
                          stamina > 50 ? "bg-cyan-400" : stamina > 20 ? "bg-amber-400" : "bg-rose-500"
                        )}
                      />
                   </div>
                   <span className="text-[7px] font-black uppercase tracking-widest opacity-30">Brain Energy</span>
                </div>
             </div>

             {/* Question Area */}
             <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-lg mx-auto w-full">
                <div className="text-center space-y-6 w-full">
                   <div className="flex items-center justify-center gap-2">
                      <div className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-full">
                         {currentQuestion.type.replace('_', ' ')}
                      </div>
                      <div className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-full">
                         Round {currentIdx + 1} / {questions.length}
                      </div>
                   </div>
                   
                   <motion.h2 
                     key={currentIdx}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-3xl font-black italic tracking-tight leading-tight uppercase"
                   >
                      {currentQuestion.question}
                   </motion.h2>

                   {currentQuestion.context && (
                     <p className="text-xs font-bold text-cyan-400 opacity-60 uppercase tracking-[0.2em]">Topic: {currentQuestion.context}</p>
                   )}
                </div>

                <div className="w-full space-y-3">
                   {currentQuestion.options ? (
                     <div className="grid grid-cols-1 gap-3 w-full">
                        {currentQuestion.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            className={cn(
                              "w-full p-6 rounded-3xl border text-left font-bold text-lg transition-all",
                              isCorrect === null ? "bg-white/5 border-white/10 hover:bg-white/10" :
                              opt === currentQuestion.answer ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20" :
                              "opacity-20"
                            )}
                          >
                             {opt}
                          </button>
                        ))}
                     </div>
                   ) : (
                     <div className="space-y-4 w-full">
                        <input 
                           autoFocus
                           value={userAnswer}
                           onChange={(e) => setUserAnswer(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleAnswer(userAnswer)}
                           placeholder="Type your answer neural-speed..."
                           className="w-full p-8 rounded-[2.5rem] bg-white/5 border-2 border-white/5 focus:border-cyan-500/50 outline-none transition-all placeholder:opacity-20 text-center text-3xl font-black italic tracking-tighter"
                        />
                        <button 
                          onClick={() => handleAnswer(userAnswer)}
                          className="w-full py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase tracking-widest"
                        >
                           Submit Pulse
                        </button>
                     </div>
                   )}
                </div>
             </div>

             {/* Feedback / Commentary */}
             <div className="mt-auto pt-8">
                <AnimatePresence>
                   {feedback && (
                     <motion.div 
                       initial={{ opacity: 0, y: 20, scale: 0.8 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: -20, scale: 0.8 }}
                       className={cn(
                         "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] px-10 py-5 rounded-[2.5rem] shadow-2xl text-center pointer-events-none",
                         feedback.type === 'success' ? "bg-emerald-500 text-black" : 
                         feedback.type === 'combo' ? "bg-orange-500 text-white" :
                         "bg-rose-600 text-white"
                       )}
                     >
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
                           {feedback.type === 'success' ? 'Neural Link Success' : 'Neural Glitch'}
                        </div>
                        <div className="text-3xl font-black italic tracking-tighter uppercase">{feedback.msg}</div>
                     </motion.div>
                   )}
                </AnimatePresence>

                <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Sparkles size={40} />
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Brain size={24} className="text-indigo-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1">Neural Commentary</div>
                      <p className="text-sm font-bold text-white/80 italic line-clamp-1">"{commentary}"</p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {gameState === 'summary' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-8 pt-8"
          >
             <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-cyan-500 mx-auto flex items-center justify-center shadow-2xl shadow-cyan-500/40 relative">
                   <Medal size={48} className="text-black" />
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                     className="absolute inset-[-12px] rounded-full border-2 border-dashed border-cyan-500/30"
                   />
                </div>
                <div className="space-y-1">
                   <h2 className="text-4xl font-black italic tracking-tighter uppercase">Battle Complete</h2>
                   <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Neural Rank: {getRank(score)} reached!</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                   <div className="text-3xl font-black italic tracking-tighter text-cyan-400">{score}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Final Score</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                   <div className="text-3xl font-black italic tracking-tighter text-orange-500">{bestStreak}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Best Streak</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                   <div className="text-3xl font-black italic tracking-tighter text-indigo-400">{Math.round((reactionTimes.reduce((a, b) => a+b, 0) / reactionTimes.length) * 100) / 100}s</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Avg Reaction</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                   <div className="flex items-center gap-1 text-cyan-400 font-black italic text-xl">
                      <Target size={16} /> {Math.round((score / (questions.length * 1000)) * 100)}%
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Efficiency</div>
                </div>
             </div>

             {Object.keys(weakDetection).length > 0 && (
               <div className="p-6 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 space-y-4">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="text-rose-500" size={24} />
                     <h4 className="text-xs font-black uppercase tracking-widest">Weak Points Detected</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {Object.entries(weakDetection).map(([topic, count]) => (
                       <div key={topic} className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[10px] font-bold text-rose-300">
                          {topic} ({count} fails)
                       </div>
                     ))}
                  </div>
                  <p className="text-[10px] font-bold opacity-60 text-rose-200 mt-2 italic">Recovering these in next training round...</p>
               </div>
             )}

             <div className="space-y-3">
                <button 
                  onClick={() => setGameState('lobby')}
                  className="w-full py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                   <RotateCcw size={18} /> New Battle
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 rounded-3xl bg-white/5 text-white font-black uppercase tracking-widest text-xs border border-white/10"
                >
                   Return to Hub
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
