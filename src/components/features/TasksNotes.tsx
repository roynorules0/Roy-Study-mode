import React, { useState, memo } from 'react';
import { Plus, Check, Trash2, StickyNote, ListTodo, Pin, Sparkles, Loader2, X, AlertCircle } from 'lucide-react';
import { Task, Note } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { summarizeNotes, isGeminiAvailable } from '../../lib/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TasksNotesProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  onTaskComplete?: () => void;
  geminiApiKey?: string;
}

export default function TasksNotes({ tasks, setTasks, notes, setNotes, onTaskComplete, geminiApiKey }: TasksNotesProps) {
  const [activeView, setActiveView] = useState<'tasks' | 'notes'>('tasks');
  const [input, setInput] = useState("");
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{ id: string, summary: string, bulletPoints: string[] } | null>(null);

  const handleSummarize = async (note: Note) => {
    setSummarizingId(note.id);
    try {
      const result = await summarizeNotes(note.content, geminiApiKey);
      setSummaryData({ id: note.id, ...result });
    } catch (error) {
      console.error("Summarization failed:", error);
    } finally {
      setSummarizingId(null);
    }
  };

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: input,
      completed: false,
      createdAt: Date.now()
    };
    setTasks([newTask, ...tasks]);
    setInput("");
  };

  const addNote = () => {
    if (!input.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: input.split('\n')[0].slice(0, 20),
      content: input,
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setInput("");
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed && onTaskComplete) {
      onTaskComplete();
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteItem = (id: string, type: 'task' | 'note') => {
    if (type === 'task') {
      setTasks(tasks.filter(t => t.id !== id));
    } else {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 rounded-[1.5rem] bg-indigo-500/5 glass">
        <button 
          onClick={() => { setActiveView('tasks'); setInput(""); }}
          className={clsx(
            "flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
            activeView === 'tasks' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "opacity-50"
          )}
        >
          <ListTodo size={18} /> Tasks
        </button>
        <button 
          onClick={() => { setActiveView('notes'); setInput(""); }}
          className={clsx(
            "flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
            activeView === 'notes' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "opacity-50"
          )}
        >
          <StickyNote size={18} /> Notes
        </button>
      </div>

      <div className="relative">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeView === 'tasks' ? "Add a new study goal..." : "Brainstorm some notes..."}
          className="w-full h-24 rounded-3xl glass p-4 pr-16 focus:outline-none focus:ring-2 ring-indigo-500 transition-all text-sm resize-none"
        />
        <button 
          onClick={activeView === 'tasks' ? addTask : addNote}
          className="absolute right-4 bottom-4 w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {activeView === 'notes' && !isGeminiAvailable(geminiApiKey) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[11px] font-bold flex items-center gap-3">
          <AlertCircle size={16} />
          <span>AI Summarizer requires a Gemini Key. Check Settings.</span>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {activeView === 'tasks' ? (
            tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                toggleTask={toggleTask} 
                deleteItem={deleteItem} 
              />
            ))
          ) : (
            notes.map(note => (
              <NoteItem 
                key={note.id} 
                note={note} 
                handleSummarize={handleSummarize} 
                deleteItem={deleteItem}
                summarizingId={summarizingId}
                summaryData={summaryData}
                setSummaryData={setSummaryData}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const TaskItem = memo(({ task, toggleTask, deleteItem }: { task: Task, toggleTask: (id: string) => void, deleteItem: (id: string, type: 'task' | 'note') => void }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="p-4 rounded-2xl glass-light border border-white/5 flex items-center justify-between group gpu tap-highlight-none"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={() => toggleTask(task.id)}
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
            task.completed ? "bg-green-500 border-green-500 text-white" : "border-indigo-500/30"
          )}
        >
          {task.completed && <Check size={14} />}
        </button>
        <span className={cn(
          "font-medium text-sm truncate",
          task.completed && "line-through opacity-50"
        )}>{task.text}</span>
      </div>
      <button 
        onClick={() => deleteItem(task.id, 'task')}
        className="p-2 opacity-40 active:opacity-100 transition-opacity text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
});

TaskItem.displayName = 'TaskItem';

const NoteItem = memo(({ note, handleSummarize, deleteItem, summarizingId, summaryData, setSummaryData }: { 
  note: Note, 
  handleSummarize: (n: Note) => void, 
  deleteItem: (id: string, type: 'task' | 'note') => void,
  summarizingId: string | null,
  summaryData: any,
  setSummaryData: (d: any) => void
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-3xl glass-light border border-white/5 space-y-2 group gpu"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-indigo-500">{note.title}</h4>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleSummarize(note)}
            disabled={summarizingId === note.id}
            className="p-2 opacity-60 active:opacity-100 transition-opacity text-indigo-500 disabled:opacity-30"
          >
            {summarizingId === note.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </button>
          <button onClick={() => deleteItem(note.id, 'note')} className="opacity-40 active:opacity-100 p-2 text-red-500 transition-opacity"><Trash2 size={16} /></button>
        </div>
      </div>
      <p className="text-sm opacity-70 line-clamp-3 leading-relaxed">{note.content}</p>
      
      <AnimatePresence>
        {summaryData?.id === note.id && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 relative overflow-hidden"
          >
            <button 
              onClick={() => setSummaryData(null)}
              className="absolute top-2 right-2 p-1 opacity-40 hover:opacity-100"
            >
              <X size={12} />
            </button>
            <div className="flex items-center gap-2 text-indigo-500">
              <Sparkles size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Summary</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-80">{summaryData.summary}</p>
            <div className="space-y-1">
              {summaryData.bulletPoints.map((bp: string, i: number) => (
                <div key={i} className="flex gap-2 text-[10px] opacity-60">
                  <span className="text-indigo-500">•</span>
                  <span>{bp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
        <span className="text-[10px] opacity-30 font-bold uppercase tracking-wider">{new Date(note.updatedAt).toLocaleDateString()}</span>
        <Pin size={12} className="opacity-20" />
      </div>
    </motion.div>
  );
});

NoteItem.displayName = 'NoteItem';
