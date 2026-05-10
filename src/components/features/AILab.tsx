import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  BookOpen, 
  Loader2, 
  Send,
  Trophy,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Camera,
  Clipboard,
  Share2,
  ChevronRight,
  X,
  Languages,
  Target,
  FlaskConical,
  Beaker,
  History,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  solveDoubt, 
  generateMotivation, 
  generateRevisionQuiz, 
  generateRevisionNotes,
  isGeminiAvailable 
} from '../../lib/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RevisionNotePoints = memo(({ points }: { points: string[] }) => (
  <div className="space-y-3">
    {points.map((p, i) => (
      <div key={i} className="flex gap-4 text-sm font-medium opacity-80 leading-relaxed">
        <span className="text-emerald-500 shrink-0">•</span>
        <p>{p}</p>
      </div>
    ))}
  </div>
));

RevisionNotePoints.displayName = 'RevisionNotePoints';

const QuizQuestion = memo(({ q, i, userAnswers, setUserAnswers, showResults }: { 
  q: any, i: number, userAnswers: Record<number, number>, setUserAnswers: (a: any) => void, showResults: boolean 
}) => {
  return (
    <div 
      className="glass-light rounded-[2.5rem] p-8 space-y-6 relative border border-white/5 gpu"
    >
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-black tracking-tight leading-tight opacity-90 pr-8">{i + 1}. {q.question}</h4>
      </div>
      <div className="grid gap-3">
         {q.options.map((opt: string, optIdx: number) => {
           const isSelected = userAnswers[i] === optIdx;
           const isCorrect = optIdx === q.correctIndex;
           
           return (
             <button
               key={optIdx}
               disabled={showResults}
               onClick={() => setUserAnswers({ ...userAnswers, [i]: optIdx })}
               className={cn(
                 "w-full p-5 rounded-2xl text-left text-sm font-bold transition-all flex items-center justify-between group tap-highlight-none",
                 isSelected && !showResults ? "bg-indigo-500 text-white shadow-xl translate-x-2" : "bg-white/5",
                 showResults && isCorrect ? "bg-emerald-500 text-white" : "",
                 showResults && isSelected && !isCorrect ? "bg-rose-500 text-white" : ""
               )}
             >
               <div className="flex gap-4 items-center">
                 <span className="text-[10px] opacity-40 font-mono">{String.fromCharCode(65 + optIdx)}</span>
                 {opt}
               </div>
               {showResults && isCorrect && <CheckCircle2 size={18} />}
               {!showResults && !isSelected && <ChevronRight size={16} className="opacity-0 active:opacity-100 -translate-x-2 active:translate-x-0 transition-all" />}
             </button>
           );
         })}
      </div>
      {showResults && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 text-xs opacity-70 leading-relaxed italic"
        >
          <span className="font-black uppercase tracking-[0.2em] text-[9px] block mb-2 text-indigo-500">Explanation</span>
          {q.explanation}
        </motion.div>
      )}
    </div>
  );
});

QuizQuestion.displayName = 'QuizQuestion';

// Typing Animation Component
const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 5);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

interface AILabProps {
  geminiApiKey?: string;
  theme: 'day' | 'night';
}

export default function AILab({ geminiApiKey, theme }: AILabProps) {
  const [activeTool, setActiveTool] = useState<'doubts' | 'motivation' | 'revision'>('doubts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doubt Solver State
  const [question, setQuestion] = useState("");
  const [doubtResult, setDoubtResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Motivation State
  const [motivationData, setMotivationData] = useState<any>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Revision State
  const [revisionTopic, setRevisionTopic] = useState("");
  const [revisionSubject, setRevisionSubject] = useState("");
  const [revMode, setRevMode] = useState<'quick' | 'detailed'>('quick');
  const [revType, setRevType] = useState<'notes' | 'quiz'>('notes');
  const [revisionNotes, setRevisionNotes] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSolveDoubt = async () => {
    if (!question.trim() && !selectedImage) return;
    setLoading(true);
    setError(null);
    setDoubtResult(null);
    try {
      const res = await solveDoubt(question, selectedImage || undefined, undefined, geminiApiKey);
      setDoubtResult(res);
    } catch (err: any) {
      setError(err.message === "GEMINI_API_KEY_MISSING" ? "API Key Missing" : "Failed to solve doubt.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateMotivation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateMotivation(geminiApiKey);
      setMotivationData(res);
      setQuoteIndex(0);
    } catch (err: any) {
      setError(err.message === "GEMINI_API_KEY_MISSING" ? "API Key Missing" : "Failed to generate motivation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevisionAction = async () => {
    if (!revisionTopic.trim() || !revisionSubject.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      if (revType === 'quiz') {
        const res = await generateRevisionQuiz(revisionTopic, revisionSubject, geminiApiKey);
        setQuiz(res);
        setRevisionNotes(null);
        setUserAnswers({});
        setShowResults(false);
      } else {
        const res = await generateRevisionNotes(revisionTopic, revisionSubject, revMode, geminiApiKey);
        setRevisionNotes(res);
        setQuiz(null);
      }
    } catch (err: any) {
      setError(err.message === "GEMINI_API_KEY_MISSING" ? "API Key Missing" : "Failed to generate revision resources.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shareQuote = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Motivational Quote', text });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Sharing failed:', err);
        }
      }
    } else {
      copyToClipboard(text);
    }
  };

  // Swipe logic for cards
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-10, 10]);
  const opacity = useTransform(x, [-150, -100, 100, 150], [0, 1, 1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      setQuoteIndex((prev) => (prev + 1) % motivationData.quotes.length);
    } else if (info.offset.x < -100) {
      setQuoteIndex((prev) => (prev - 1 + motivationData.quotes.length) % motivationData.quotes.length);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <BrainCircuit className="text-indigo-500" size={28} /> AI Study Lab
          </h2>
          <p className="text-xs opacity-50 font-medium uppercase tracking-[0.2em] mt-1">Experimental AI Tools for NEET/JEE</p>
        </div>
      </header>

      {!isGeminiAvailable(geminiApiKey) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[11px] font-bold flex items-center gap-3 glass"
        >
          <AlertCircle size={16} />
          <span>GEMINI API KEY MISSING: Some features may not work. Configure in Settings.</span>
        </motion.div>
      )}

      {/* Main Tools Ribbon */}
      <div className="flex gap-2 p-1.5 rounded-[2rem] bg-white/5 glass-light border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'doubts', label: 'Doubt Solver', icon: MessageSquare, color: 'text-indigo-500' },
          { id: 'motivation', label: 'Motivation', icon: Zap, color: 'text-amber-500' },
          { id: 'revision', label: 'Revision', icon: BookOpen, color: 'text-emerald-500' }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
              activeTool === tool.id 
                ? "bg-white text-black shadow-2xl scale-[1.02]" 
                : "opacity-40 hover:opacity-100 bg-white/5"
            )}
          >
            <tool.icon size={16} className={cn(activeTool === tool.id ? "text-indigo-600" : tool.color)} />
            {tool.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTool === 'doubts' && (
          <motion.div 
            key="doubts" 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="relative group gpu">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question or upload an image..."
                className="w-full h-40 rounded-[2.5rem] glass-light border border-white/5 p-8 focus:ring-4 ring-indigo-500/20 outline-none transition-all text-sm leading-relaxed resize-none shadow-inner"
              />
              
              <div className="absolute bottom-6 left-6 flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-3 rounded-2xl transition-all border border-white/10",
                    selectedImage ? "bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10 opacity-60"
                  )}
                >
                  <Camera size={20} />
                </button>
                {selectedImage && (
                  <div className="relative group">
                    <img src={selectedImage} className="w-12 h-12 rounded-xl object-cover border border-white/20" alt="Quick view" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 scale-0 group-hover:scale-100 transition-transform"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={handleSolveDoubt}
                disabled={loading || (!question.trim() && !selectedImage)}
                className="absolute bottom-6 right-6 bg-indigo-500 text-white px-8 h-14 rounded-2xl font-black uppercase tracking-tighter shadow-2xl shadow-indigo-500/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} /> Solve Doubt</>}
              </button>
            </div>

            {error && (
              <div className="p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-3 glass">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {doubtResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-light border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden gpu"
              >
                <div className="absolute top-0 right-0 p-8">
                  <button 
                    onClick={() => copyToClipboard(doubtResult.explanation)}
                    className="p-3 bg-white/5 rounded-2xl opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <Clipboard size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2">
                    <Send size={10} /> Explanation
                  </span>
                  <div className="text-base leading-relaxed opacity-90 font-medium tracking-tight">
                    <TypingText text={doubtResult.explanation} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2">
                    <Target size={10} /> Step by Step
                  </span>
                  <div className="space-y-3">
                    {doubtResult.steps.map((step: string, i: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <span className="font-mono text-indigo-500 font-black text-xl italic">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-sm font-medium opacity-80 pt-1">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Foundational Concept</span>
                      <span className="text-lg font-black tracking-tighter italic uppercase">{doubtResult.keyConcept}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTool === 'motivation' && (
          <motion.div 
            key="motivation"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 relative"
          >
            {motivationData ? (
              <div className="w-full relative h-[350px] gpu">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={quoteIndex}
                    style={{ x, rotate, opacity }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 glass-light rounded-[4rem] border-2 border-indigo-500/20 shadow-2xl space-y-8 cur-grab active:cursor-grabbing"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                      <Trophy size={32} />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black italic uppercase leading-none tracking-tighter">
                          "{motivationData.quotes[quoteIndex].english}"
                        </h3>
                        <p className="text-lg font-bold opacity-40 italic tracking-tight">
                          {motivationData.quotes[quoteIndex].hinglish}
                        </p>
                      </div>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">— {motivationData.quotes[quoteIndex].author}</p>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => copyToClipboard(motivationData.quotes[quoteIndex].english)} className="p-4 rounded-2xl bg-white/5 hover:bg-white text-black transition-all flex items-center gap-2 font-bold text-xs">
                        <Clipboard size={14} /> Copy
                      </button>
                      <button onClick={() => shareQuote(motivationData.quotes[quoteIndex].english)} className="p-4 rounded-2xl bg-white/5 hover:bg-white text-black transition-all flex items-center gap-2 font-bold text-xs">
                        <Share2 size={14} /> Share
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2">
                  {motivationData.quotes.map((_: any, i: number) => (
                    <div key={i} className={cn("h-1 rounded-full transition-all", i === quoteIndex ? "w-8 bg-indigo-500" : "w-1 bg-white/20")} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto animate-pulse">
                  <Zap size={40} className="text-amber-500" />
                </div>
                <div className="space-y-2 max-w-xs transition-all">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Feeling Drained?</h3>
                  <p className="text-sm opacity-40 font-medium">Get a curated dose of Hinglish & English motivation cards.</p>
                </div>
              </div>
            )}

            <div className="pt-8">
              <button 
                onClick={handleGenerateMotivation}
                disabled={loading}
                className="px-10 h-16 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-tighter shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : motivationData ? <><History size={18} /> New Pack</> : <><RefreshCw size={18} /> Energize Me</>}
              </button>
            </div>
            
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          </motion.div>
        )}

        {activeTool === 'revision' && (
          <motion.div 
            key="revision"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="glass rounded-[3rem] p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Subject</label>
                  <div className="relative">
                    <FlaskConical size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      type="text" 
                      value={revisionSubject}
                      onChange={(e) => setRevisionSubject(e.target.value)}
                      placeholder="e.g. Biology"
                      className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold tracking-tight focus:bg-white/10 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Topic</label>
                  <div className="relative">
                    <Target size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input 
                      type="text" 
                      value={revisionTopic}
                      onChange={(e) => setRevisionTopic(e.target.value)}
                      placeholder="e.g. Cell Cycle"
                      className="w-full h-14 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold tracking-tight focus:bg-white/10 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-white/5 rounded-2xl p-1 flex gap-1">
                  <button onClick={() => setRevType('notes')} className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest", revType === 'notes' ? "bg-white text-black shadow-lg" : "opacity-40")}>Notes</button>
                  <button onClick={() => setRevType('quiz')} className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest", revType === 'quiz' ? "bg-white text-black shadow-lg" : "opacity-40")}>Quiz</button>
                </div>
                {revType === 'notes' && (
                  <div className="flex-1 bg-white/5 rounded-2xl p-1 flex gap-1">
                    <button onClick={() => setRevMode('quick')} className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest", revMode === 'quick' ? "bg-white text-black shadow-lg" : "opacity-40")}>Quick</button>
                    <button onClick={() => setRevMode('detailed')} className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest", revMode === 'detailed' ? "bg-white text-black shadow-lg" : "opacity-40")}>Pro</button>
                  </div>
                )}
              </div>

              <button 
                onClick={handleRevisionAction}
                disabled={loading || !revisionTopic.trim() || !revisionSubject.trim()}
                className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={20} /> Generate Mastery {revType === 'quiz' ? 'Quiz' : 'Notes'}</>}
              </button>
            </div>

            {revisionNotes && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">{revisionNotes.title}</h3>
                  <button onClick={() => setRevisionNotes(null)} className="p-2 opacity-30 hover:opacity-100"><X size={20} /></button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* High Yield Points */}
                  <div className="glass rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <Target size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">High Yield Points</span>
                    </div>
                    <div className="space-y-3">
                      {revisionNotes.points.map((p: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm font-medium opacity-80 leading-relaxed">
                          <span className="text-emerald-500 shrink-0">•</span>
                          <p>{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Formulas / Tricks */}
                    {revisionNotes.formulas && revisionNotes.formulas.length > 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-500">
                          <FlaskConical size={20} />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Key Formulas</span>
                        </div>
                        <div className="space-y-2">
                           {revisionNotes.formulas.map((f: string, i: number) => (
                             <div key={i} className="p-3 bg-white/5 rounded-xl font-mono text-xs opacity-90 border border-white/5">{f}</div>
                           ))}
                        </div>
                      </div>
                    )}

                    {revisionNotes.tricks && revisionNotes.tricks.length > 0 && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500">
                          <Zap size={20} />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Memory Tricks</span>
                        </div>
                        <div className="space-y-2">
                           {revisionNotes.tricks.map((t: string, i: number) => (
                             <div key={i} className="text-sm font-bold opacity-80 flex gap-3">
                               <CheckCircle2 size={14} className="shrink-0 pt-1" />
                               {t}
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Keywords & Pro Tip */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-8 glass rounded-[2rem] space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Keywords to Recall</span>
                    <div className="flex flex-wrap gap-2">
                       {revisionNotes.keywords.map((k: string, i: number) => (
                         <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest border border-white/5">{k}</span>
                       ))}
                    </div>
                  </div>
                  <div className="p-8 bg-indigo-500 rounded-[2rem] shadow-2xl text-white space-y-2">
                    <div className="flex items-center gap-2 opacity-60">
                      <Beaker size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mastery Tip</span>
                    </div>
                    <p className="text-base font-black italic tracking-tight">{revisionNotes.proTip}</p>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={handleRevisionAction}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Generate More Points <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {quiz && (
              <div className="space-y-6">
                {quiz.questions.map((q: any, i: number) => (
                  <QuizQuestion 
                    key={i} 
                    q={q} 
                    i={i} 
                    userAnswers={userAnswers} 
                    setUserAnswers={setUserAnswers} 
                    showResults={showResults} 
                  />
                ))}

                <AnimatePresence>
                  {!showResults && Object.keys(userAnswers).length === quiz.questions.length && (
                    <motion.button 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowResults(true)}
                      className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm"
                    >
                      Analyze My Score
                    </motion.button>
                  )}
                </AnimatePresence>
                
                {showResults && (
                   <div className="flex justify-center pt-4">
                     <button 
                       onClick={handleRevisionAction}
                       className="px-8 h-12 glass border border-emerald-500/30 text-emerald-500 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                     >
                       <RefreshCw size={14} /> New Practice Set
                     </button>
                   </div>
                )}
              </div>
            )}
            
            {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
