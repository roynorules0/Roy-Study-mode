import { useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { generateStudyPlan, isGeminiAvailable } from '../../lib/gemini';
import { StudySession } from '../../types';
import { motion } from 'motion/react';
import { format12Hour } from '../../lib/dateUtils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AIPlannerProps {
  sessions: StudySession[];
  setSessions: (sessions: StudySession[]) => void;
  geminiApiKey?: string;
}

export default function AIPlanner({ sessions, setSessions, geminiApiKey }: AIPlannerProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string, type: 'warning' | 'error' } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateStudyPlan(prompt, geminiApiKey);
      setSessions(data.sessions);
      setPrompt("");
    } catch (err: any) {
      if (err.message === "GEMINI_API_KEY_MISSING") {
        setError({ 
          message: "Gemini API Key is missing. Please check your environment or add one in Settings.", 
          type: 'warning' 
        });
      } else {
        setError({ message: "Failed to generate plan. Please try again.", type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-orange-500" size={20} /> AI Study Planner
        </h2>
        <p className="text-sm opacity-60 mt-1">Generate a personalized study schedule instantly.</p>
      </header>

      {!isGeminiAvailable(geminiApiKey) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[11px] font-bold flex items-center gap-3">
          <AlertCircle size={16} />
          <span>GEMINI API KEY MISSING: some features may not work. Add a key in Settings.</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder='e.g., "NEET Prep + 6 hours + night study mode + weekend focus"'
            className="w-full h-32 rounded-3xl glass-light border border-white/5 p-6 focus:outline-none focus:ring-2 ring-indigo-500 transition-all resize-none text-sm leading-relaxed gpu"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="absolute bottom-4 right-4 bg-indigo-500 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </button>
        </div>

        {error && (
          <div className={cn(
            "p-6 rounded-3xl text-sm space-y-3",
            error.type === 'warning' ? "bg-amber-500/10 border border-amber-500/20 text-amber-600" : "bg-red-500/10 border border-red-500/20 text-red-500"
          )}>
            <p className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
               {error.type === 'warning' ? '⚠️ Configuration Required' : '❌ AI Error'}
            </p>
            <p className="opacity-90">{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest">Active Schedule</h3>
            {sessions.length > 0 && (
              <button 
                onClick={() => setSessions([])}
                className="text-xs text-red-500 font-bold"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {sessions.map((session, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={session.id} 
                className="p-4 rounded-2xl glass-light border border-white/5 flex justify-between items-center group gpu"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 rounded-full" style={{ backgroundColor: session.color }} />
                  <div>
                    <div className="font-bold text-sm">{session.title}</div>
                    <div className="text-xs opacity-50">{format12Hour(session.startTime)} - {format12Hour(session.endTime)}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {session.type}
                </div>
              </motion.div>
            ))}

            {sessions.length === 0 && !loading && (
              <div className="p-12 text-center glass rounded-[2.5rem] opacity-30">
                <Sparkles size={40} className="mx-auto mb-4" />
                <p className="text-sm">No schedule generated yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
