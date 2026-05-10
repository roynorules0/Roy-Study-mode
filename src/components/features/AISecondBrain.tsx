import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Search, 
  Plus, 
  Zap, 
  Link as LinkIcon, 
  Tag, 
  Bookmark, 
  FileText, 
  Hash, 
  MoreVertical, 
  ChevronRight, 
  ArrowUpRight,
  Sparkles,
  Command,
  Mic,
  Camera,
  Trash2,
  Maximize2,
  Network
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { BrainNote } from '../../types';
import { processBrainNote } from '../../services/secondBrainService';

interface AISecondBrainProps {
  apiKey?: string;
}

export default function AISecondBrain({ apiKey }: AISecondBrainProps) {
  const [notes, setNotes] = useLocalStorage<BrainNote[]>('ai-second-brain-v1', []);
  const [isCapturing, setIsCapturing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);
  
  // Quick Capture State
  const [rawContent, setRawContent] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const handleCapture = async () => {
    if (!rawContent.trim() || !apiKey) return;
    setIsProcessing(true);
    try {
      const processed = await processBrainNote(apiKey, rawContent, notes);
      const newNote: BrainNote = {
        id: Math.random().toString(36).substr(2, 9),
        title: processed.suggestedTitle,
        content: rawContent,
        type: processed.type,
        tags: processed.tags,
        priority: processed.priority,
        createdAt: Date.now(),
        linkedNoteIds: processed.linkedNoteIds,
        summary: processed.summary
      };
      setNotes([newNote, ...notes]);
      setRawContent('');
      setIsCapturing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Second Brain</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <Network size={10} /> Neural Knowledge Vault
           </p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 rounded-xl glass border border-white/5 opacity-40">
              <Network size={16} />
           </button>
        </div>
      </header>

      {/* Search & Quick Action */}
      <div className="flex gap-2 px-1">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
               placeholder="Search Neural Network..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500/30 transition-all"
            />
         </div>
         <button 
           onClick={() => setIsCapturing(true)}
           className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 active:scale-90 transition-all"
         >
            <Plus size={24} />
         </button>
      </div>

      {/* Quick Capture Overlay */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 rounded-[2.5rem] glass border border-indigo-500/20 shadow-2xl space-y-4"
          >
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                <span>Capture Thought</span>
                <button onClick={() => setIsCapturing(false)}>Cancel</button>
             </div>
             <textarea 
               autoFocus
               placeholder="Write or paste your knowledge here..."
               value={rawContent}
               onChange={e => setRawContent(e.target.value)}
               className="w-full h-32 bg-transparent text-xs font-bold leading-relaxed resize-none border-none outline-none scrollbar-hide"
             />
             <div className="flex items-center justify-between pt-2">
                <div className="flex gap-4 opacity-40">
                   <Mic size={18} />
                   <Camera size={18} />
                </div>
                <button 
                  onClick={handleCapture}
                  disabled={isProcessing || !rawContent.trim()}
                  className={cn(
                    "px-6 py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    (isProcessing || !rawContent.trim()) && "opacity-50"
                  )}
                >
                   {isProcessing ? <Sparkles size={14} className="animate-spin" /> : <Zap size={14} />}
                   {isProcessing ? "Connecting Neurons..." : "Save to Brain"}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Library */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Knowledge Nodes</h3>
            <span className="text-[10px] font-black opacity-20 uppercase">{notes.length} Total</span>
         </div>

         <div className="space-y-3">
            {filteredNotes.length === 0 ? (
               <div className="py-20 text-center opacity-20 space-y-4">
                  <Brain size={48} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase">No knowledge nodes found</p>
               </div>
            ) : (
               filteredNotes.map((note) => (
                 <motion.div 
                   layout
                   key={note.id}
                   className={cn(
                     "p-5 rounded-[2.5rem] glass border transition-all group relative overflow-hidden",
                     note.priority === 'high' ? "border-orange-500/20 bg-orange-500/[0.02]" : "border-white/5"
                   )}
                 >
                    {/* Priority Indicator */}
                    {note.priority === 'high' && (
                       <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                          <Zap size={60} className="text-orange-500" fill="currentColor" />
                       </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-[7px] font-black uppercase px-2 py-0.5 rounded-full",
                               note.type === 'formula' ? 'bg-indigo-500/20 text-indigo-400' :
                               note.type === 'concept' ? 'bg-emerald-500/20 text-emerald-400' :
                               note.type === 'doubt' ? 'bg-rose-500/20 text-rose-500' : 'bg-white/10 text-white/40'
                             )}>
                                {note.type}
                             </span>
                             {note.priority === 'high' && (
                               <span className="text-[7px] font-black uppercase bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">High Priority</span>
                             )}
                          </div>
                          <h4 className="text-sm font-black italic uppercase tracking-tight pr-8">{note.title}</h4>
                       </div>
                       <button 
                         onClick={() => deleteNote(note.id)}
                         className="p-1 opacity-0 group-hover:opacity-20 hover:!opacity-100 transition-opacity text-rose-500"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>

                    <p className="text-[10px] font-bold opacity-40 line-clamp-2 leading-relaxed mb-4">
                       {note.content}
                    </p>

                    {note.summary && (
                       <div className="p-3 mb-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-start">
                          <Sparkles size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-black uppercase tracking-tight text-indigo-100/60 leading-tight">
                             {note.summary}
                          </p>
                       </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                       {note.tags.map((tag, i) => (
                         <span key={i} className="text-[8px] font-black uppercase opacity-30 px-2 py-1 bg-white/5 rounded-lg">
                            {tag}
                         </span>
                       ))}
                       {note.linkedNoteIds.length > 0 && (
                         <div className="flex items-center gap-1 text-[8px] font-black uppercase text-indigo-400 px-2 py-1 bg-indigo-500/10 rounded-lg">
                            <LinkIcon size={8} /> {note.linkedNoteIds.length} Neural Links
                         </div>
                       )}
                    </div>

                    <button className="absolute bottom-5 right-5 p-3 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                       <ArrowUpRight size={14} />
                    </button>
                 </motion.div>
               ))
            )}
         </div>
      </section>

      {/* Focus Note Mode (Minimal Preview) */}
      <section className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/5 space-y-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
               <FileText size={14} /> Focus Note Mode
            </div>
            <Maximize2 size={12} className="opacity-20" />
         </div>
         <div className="space-y-2">
            <h3 className="text-lg font-black italic uppercase italic tracking-tighter">Enter Deep Think...</h3>
            <p className="text-[10px] font-bold opacity-40 uppercase leading-relaxed">
               Distraction free environment for high quality knowledge synthesis & neural capturing.
            </p>
         </div>
         <button className="w-full py-4 glass border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-white/5 transition-all">
            Open Meditation Lab
         </button>
      </section>

      {/* Brain Stats HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
               Connectivity Grid
            </div>
            <div className="flex flex-wrap gap-1">
               {Array.from({ length: 20 }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "w-2.5 h-2.5 rounded-sm transition-all duration-1000",
                     Math.random() > 0.7 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/5"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none">
               {notes.reduce((acc, n) => acc + n.linkedNoteIds.length, 0)}
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Active Links</div>
         </div>
      </section>
    </div>
  );
}
