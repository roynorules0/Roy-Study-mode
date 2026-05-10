import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Settings2, 
  MessageSquare, 
  Zap, 
  Sparkles, 
  Bot, 
  ChevronRight, 
  Play, 
  Settings,
  Heart,
  Gamepad2,
  Anchor,
  Sword,
  Target
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CompanionState } from '../../types';

const PERSONALITIES = [
  { id: 'mentor', name: 'Strict Mentor', sub: 'Discipline focused', icon: '😤', color: 'bg-rose-500' },
  { id: 'friend', name: 'Chill Friend', sub: 'Vibe check buddy', icon: '😎', color: 'bg-blue-500' },
  { id: 'senpai', name: 'Anime Senpai', sub: 'Ganbare mode', icon: '🌸', color: 'bg-pink-500' },
  { id: 'coach', name: 'Elite Coach', sub: 'High energy', icon: '🔥', color: 'bg-orange-500' },
  { id: 'monk', name: 'Zen Monk', sub: 'Pure focus', icon: '🧘', color: 'bg-teal-500' },
  { id: 'rival', name: 'The Rival', sub: 'Competitive edge', icon: '⚡', color: 'bg-indigo-500' },
] as const;

export default function AIStudyCompanion() {
  const [companion, setCompanion] = useLocalStorage<CompanionState>('ai-companion-state', {
    personality: 'mentor',
    mood: 'motivated',
    lastMessage: 'Ready to grind, bhai?',
    isFloating: false,
    energy: 100
  });

  const selectPersonality = (id: typeof PERSONALITIES[number]['id']) => {
    setCompanion({
      ...companion,
      personality: id,
      lastMessage: id === 'mentor' ? "Padhai shuru karo, time waste nahi!" : "Chalo bro, let's start!"
    });
  };

  const toggleFloating = () => {
    setCompanion({ ...companion, isFloating: !companion.isFloating });
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 space-y-1">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Study Companion</h2>
        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
           <Bot size={10} className="text-indigo-400" /> Virtual Neural Partner
        </p>
      </header>

      {/* Main Companion Preview */}
      <section className="p-8 rounded-[2.5rem] glass border border-white/5 relative overflow-hidden flex flex-col items-center gap-6 text-center shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
         
         <div className="relative">
            <motion.div 
               animate={{ 
                 y: [0, -10, 0],
                 scale: [1, 1.05, 1],
                 rotate: [0, 2, -2, 0]
               }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className={cn(
                 "w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(255,255,255,0.05)] border-2 border-white/10 relative z-10",
                 PERSONALITIES.find(p => p.id === companion.personality)?.color
               )}
            >
               {PERSONALITIES.find(p => p.id === companion.personality)?.icon}
               
               {/* Pulsating Ring */}
               <motion.div 
                 animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 rounded-full border-4 border-white/20"
               />
            </motion.div>
         </div>

         <div className="space-y-2 relative z-10 w-full">
            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-indigo-400">
               Current Mood: {companion.mood}
            </div>
            <p className="text-sm font-bold italic opacity-80 leading-relaxed px-4">
               "{companion.lastMessage}"
            </p>
         </div>

         <button 
           onClick={toggleFloating}
           className={cn(
             "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
             companion.isFloating 
               ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
               : "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
           )}
         >
            {companion.isFloating ? "Deactivate Widget" : "Activate Floating Orb"}
         </button>
      </section>

      {/* Personality Grid */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Choose Personality</h3>
            <span className="text-[10px] font-black opacity-20 uppercase">Neural Cores</span>
         </div>
         <div className="grid grid-cols-2 gap-3">
            {PERSONALITIES.map(p => (
              <button
                key={p.id}
                onClick={() => selectPersonality(p.id)}
                className={cn(
                  "p-5 rounded-[2rem] glass border transition-all flex flex-col items-center gap-3 text-center group",
                  companion.personality === p.id ? "border-indigo-500/40 bg-indigo-500/5 scale-95" : "border-white/5 hover:border-white/10"
                )}
              >
                 <div className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-1 shadow-inner",
                   p.color,
                   companion.personality === p.id ? "scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                 )}>
                    {p.icon}
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase italic tracking-tighter">{p.name}</h4>
                    <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest mt-0.5">{p.sub}</p>
                 </div>
                 {companion.personality === p.id && (
                   <motion.div layoutId="core-active" className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shadow-[0_0_10px_#6366f1]" />
                 )}
              </button>
            ))}
         </div>
      </section>

      {/* Intelligence Settings */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
             <Settings size={12} /> Intelligence Protocols
          </div>
          <div className="space-y-2">
             {[
               { icon: <MessageSquare size={14} />, label: 'Hinglish Mode', active: true },
               { icon: <Zap size={14} />, label: 'Real-time Reaction', active: true },
               { icon: <Gamepad2 size={14} />, label: 'Gamified Rewards', active: true }
             ].map((set, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="text-indigo-400">{set.icon}</div>
                     <span className="text-[10px] font-black uppercase tracking-widest">{set.label}</span>
                  </div>
                  <div className="w-8 h-4 bg-indigo-600 rounded-full flex items-center justify-end px-1">
                     <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
               </div>
             ))}
          </div>
      </section>
    </div>
  );
}
