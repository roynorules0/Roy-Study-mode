import { useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { generateStudyPlan } from '../../lib/gemini';
import { StudySession } from '../../types';
import { motion } from 'motion/react';
import { format12Hour } from '../../lib/dateUtils';

interface AIPlannerProps {
  sessions: StudySession[];
  setSessions: (sessions: StudySession[]) => void;
}

export default function AIPlanner({ sessions, setSessions }: AIPlannerProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateStudyPlan(prompt);
      setSessions(data.sessions);
      setPrompt("");
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
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

      <div className="space-y-4">
        <div className="relative">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "NEET Prep + 6 hours + night study mode + weekend focus"'
            className="w-full h-32 rounded-3xl glass p-6 focus:outline-none focus:ring-2 ring-indigo-500 transition-all resize-none text-sm leading-relaxed"
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
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
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
                className="p-4 rounded-2xl glass flex justify-between items-center group"
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
