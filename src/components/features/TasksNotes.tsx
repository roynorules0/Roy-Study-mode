import { useState } from 'react';
import { Plus, Check, Trash2, StickyNote, ListTodo, Pin } from 'lucide-react';
import { Task, Note } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface TasksNotesProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  onTaskComplete?: () => void;
}

export default function TasksNotes({ tasks, setTasks, notes, setNotes, onTaskComplete }: TasksNotesProps) {
  const [activeView, setActiveView] = useState<'tasks' | 'notes'>('tasks');
  const [input, setInput] = useState("");

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

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activeView === 'tasks' ? (
            tasks.map(task => (
              <motion.div 
                layout
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 rounded-2xl glass flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={clsx(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                      task.completed ? "bg-green-500 border-green-500 text-white" : "border-indigo-500/30"
                    )}
                  >
                    {task.completed && <Check size={14} />}
                  </button>
                  <span className={clsx(
                    "font-medium text-sm truncate",
                    task.completed && "line-through opacity-50"
                  )}>{task.text}</span>
                </div>
                <button 
                  onClick={() => deleteItem(task.id, 'task')}
                  className="p-2 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          ) : (
            notes.map(note => (
              <motion.div 
                layout
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-3xl glass space-y-2 group"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-indigo-500">{note.title}</h4>
                  <button onClick={() => deleteItem(note.id, 'note')} className="opacity-0 group-hover:opacity-100 p-1 text-red-500"><Trash2 size={14} /></button>
                </div>
                <p className="text-sm opacity-70 line-clamp-3 leading-relaxed">{note.content}</p>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
                  <span className="text-[10px] opacity-30 font-bold uppercase tracking-wider">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <Pin size={12} className="opacity-20" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
