import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Brain, 
  Sparkles, 
  Zap, 
  Plus, 
  Search, 
  Layout, 
  Camera,
  Layers,
  FlaskConical,
  Atom,
  Dna,
  History,
  Lightbulb,
  Activity,
  Award,
  Link as LinkIcon,
  ChevronRight,
  Monitor,
  Box,
  Target,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Shapes,
  Gamepad2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface MemoryObject {
  id: string;
  concept: string;
  type: 'Crystal' | 'Node' | 'Cube' | 'Portal';
  strength: number; // 0-100
  lastRecall: number;
  tags: string[];
}

interface MemoryLink {
  source: string;
  target: string;
  reason: string;
}

interface MindPalaceState {
  rooms: {
    [key: string]: {
      name: string;
      icon: React.ReactNode;
      objects: MemoryObject[];
    };
  };
  links: MemoryLink[];
  energy: number;
  xp: number;
  level: number;
}

const ROOM_TYPES = [
  { id: 'biology', name: 'Biology Biotech', icon: <Dna /> },
  { id: 'physics', name: 'Physics Arena', icon: <Atom /> },
  { id: 'chemistry', name: 'Chemistry Vault', icon: <FlaskConical /> },
  { id: 'formulas', name: 'Formula Chamber', icon: <Shapes /> },
  { id: 'revision', name: 'Revision Core', icon: <RefreshCcw /> }
];

export default function AIMindPalace() {
  const [palace, setPalace] = useLocalStorage<MindPalaceState>('ai-mind-palace-v2', {
    rooms: {
      biology: { name: 'Biology Biotech', icon: <Dna />, objects: [] },
      physics: { name: 'Physics Arena', icon: <Atom />, objects: [] },
      formulas: { name: 'Formula Chamber', icon: <Shapes />, objects: [] }
    },
    links: [],
    energy: 100,
    xp: 0,
    level: 1
  });

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newConcept, setNewConcept] = useState('');
  const [commentary, setCommentary] = useState("AI Mind Palace online. Neural organization system ready. 🔥");
  const [viewMode, setViewMode] = useState<'palace' | 'stats' | 'recall'>('palace');

  const activeRoomData = activeRoom ? palace.rooms[activeRoom] : null;

  const addObject = () => {
    if (!newConcept || !activeRoom) return;
    
    const types: ('Crystal' | 'Node' | 'Cube' | 'Portal')[] = ['Crystal', 'Node', 'Cube', 'Portal'];
    const newObj: MemoryObject = {
      id: Math.random().toString(36).substr(2, 9),
      concept: newConcept,
      type: types[Math.floor(Math.random() * types.length)],
      strength: 100,
      lastRecall: Date.now(),
      tags: [activeRoom]
    };

    setPalace({
      ...palace,
      rooms: {
        ...palace.rooms,
        [activeRoom]: {
          ...palace.rooms[activeRoom],
          objects: [newObj, ...palace.rooms[activeRoom].objects]
        }
      },
      xp: palace.xp + 50
    });
    setNewConcept('');
    setCommentary(`${newConcept} memory object created. Neural integrity 100%. ⚡`);
  };

  const syncLinks = async () => {
    setIsAnalyzing(true);
    setCommentary("Analyzing neural patterns for concept linking... 🧬");
    
    const allObjects = Object.values(palace.rooms).flatMap(r => r.objects);
    
    try {
      const response = await fetch("/api/gemini/mind-palace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "link-concepts",
          userContext: allObjects.map(o => o.concept) 
        }),
      });

      if (!response.ok) throw new Error("Link failure");
      const data = await response.json();
      
      setPalace({
        ...palace,
        links: [...palace.links, ...data.links].slice(-10)
      });
      setCommentary("Memory links established. Brain sync stability improved. ⚡");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recallObject = (objId: string) => {
    if (!activeRoom) return;
    
    const updatedObjects = palace.rooms[activeRoom].objects.map(o => {
      if (o.id === objId) {
        return { ...o, strength: Math.min(100, o.strength + 10), lastRecall: Date.now() };
      }
      return o;
    });

    setPalace({
      ...palace,
      rooms: {
        ...palace.rooms,
        [activeRoom]: {
          ...palace.rooms[activeRoom],
          objects: updatedObjects
        }
      },
      xp: palace.xp + 20,
      energy: Math.max(0, palace.energy - 5)
    });
    setCommentary("Recall pathway stabilized. Memory trace reinforced. 👑");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 pb-24 font-sans selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Layout size={300} strokeWidth={0.5} className="text-indigo-500" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Brain size={12} fill="currentColor" /> Neural Architecture Engine
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-br from-white via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            AI Mind Palace
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Digital brain organization & memory mastery</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
             <div className="text-xl font-black italic tracking-tighter text-indigo-400">LVL {palace.level}</div>
             <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Synapse Tier</div>
          </div>
          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
             <div className="text-xl font-black italic tracking-tighter text-amber-500">{palace.energy}%</div>
             <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Brain Energy</div>
          </div>
          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
             <div className="text-xl font-black italic tracking-tighter text-cyan-400">{palace.xp}</div>
             <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Neural XP</div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="p-6 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 relative overflow-hidden backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                 <Sparkles size={24} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1">Palace Architect Guide</div>
                 <p className="text-sm font-bold text-white/80 italic leading-relaxed animate-pulse">
                   "{commentary}"
                 </p>
              </div>
           </div>
        </div>

        {!activeRoom ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Digital Mind Rooms</h3>
                <Plus size={14} className="opacity-20" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {ROOM_TYPES.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className="p-8 rounded-[3rem] bg-white/5 border border-white/5 flex flex-col items-center gap-4 group hover:bg-white/10 transition-all text-center"
                  >
                     <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        {React.isValidElement(room.icon) && React.cloneElement(room.icon as React.ReactElement<any>, { size: 32 })}
                     </div>
                     <div>
                        <h4 className="text-sm font-black italic uppercase tracking-tighter">{room.name}</h4>
                        <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">{palace.rooms[room.id]?.objects.length || 0} Objects</p>
                     </div>
                  </button>
                ))}
             </div>

             {/* Links Feed */}
             <div className="p-8 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/10 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                      <LinkIcon size={12} /> Recent Neural Links
                   </h4>
                   <button onClick={syncLinks} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">
                      Re-Sync Palace
                   </button>
                </div>
                <div className="space-y-3">
                   {palace.links.length > 0 ? palace.links.slice(0, 3).map((link, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-white/5 flex items-center justify-between border border-white/5 group">
                        <div className="flex items-center gap-3">
                           <div className="text-xs font-black italic tracking-tighter opacity-80">{link.source}</div>
                           <ChevronRight size={14} className="text-indigo-400" />
                           <div className="text-xs font-black italic tracking-tighter opacity-80">{link.target}</div>
                        </div>
                        <div className="text-[8px] font-black uppercase opacity-20 group-hover:opacity-60 transition-opacity">
                           {link.reason.substring(0, 20)}...
                        </div>
                     </div>
                   )) : (
                     <div className="text-center py-6 text-[10px] font-black uppercase opacity-20 italic">No neural links established yet.</div>
                   )}
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
             <div className="flex items-center gap-4">
                <button onClick={() => setActiveRoom(null)} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-indigo-400">
                   <Home size={20} />
                </button>
                <div className="flex-1">
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{activeRoomData?.name}</h2>
                   <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{activeRoomData?.objects.length} Neural Objects</p>
                </div>
                <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
             </div>

             <div className="p-6 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                <div className="space-y-3">
                   <input 
                     placeholder="New Concept (e.g. Krebs Cycle)"
                     value={newConcept}
                     onChange={e => setNewConcept(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && addObject()}
                     className="w-full p-4 bg-black/40 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500/50"
                   />
                </div>
                <button 
                  onClick={addObject}
                  className="w-full py-4 bg-indigo-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                >
                   <Plus size={16} /> Link Memory Object
                </button>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Spatial Memory Map</h4>
                   <Shapes size={14} className="opacity-20" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {activeRoomData?.objects.map((obj) => (
                     <motion.div 
                        layout
                        key={obj.id}
                        className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 group relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform pointer-events-none">
                           {obj.type === 'Crystal' && <Sparkles size={80} />}
                           {obj.type === 'Node' && <Activity size={80} />}
                           {obj.type === 'Cube' && <Box size={80} />}
                           {obj.type === 'Portal' && <Zap size={80} />}
                        </div>
                        
                        <div className="flex justify-between items-start">
                           <div className="space-y-2">
                              <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-widest text-indigo-400 inline-block">
                                 {obj.type} Memory Object
                              </div>
                              <h3 className="text-xl font-black italic tracking-tighter uppercase mix-blend-difference">{obj.concept}</h3>
                           </div>
                           <div className="text-right">
                              <div className="text-[9px] font-black opacity-30 uppercase">Neural Power</div>
                              <div className="text-lg font-black italic text-emerald-400">{obj.strength}%</div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${obj.strength}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                              />
                           </div>
                           <button 
                             onClick={() => recallObject(obj.id)}
                             className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-black shadow-lg shadow-indigo-500/20 hover:scale-110 active:scale-90 transition-all shrink-0"
                           >
                              <Zap size={20} fill="currentColor" />
                           </button>
                        </div>

                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-30 italic">
                           <span>Last Recall: {new Date(obj.lastRecall).toLocaleTimeString()}</span>
                           <span>Decay Rank: {obj.strength > 80 ? 'ELITE' : 'STABLE'}</span>
                        </div>
                     </motion.div>
                   ))}

                   {activeRoomData?.objects.length === 0 && (
                     <div className="py-20 text-center space-y-4 opacity-20">
                        <Monitor size={48} className="mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Neural core empty</p>
                     </div>
                   )}
                </div>
             </div>
          </motion.div>
        )}

        {/* Bottom Menu / Stats Section */}
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 space-y-6">
           <div className="flex justify-between items-center">
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Neuro-Sync Status</div>
                 <h4 className="text-xl font-black italic uppercase tracking-tighter">Memory Evolution</h4>
              </div>
              <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group">
                    <TrendingUp size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                 </button>
                 <button className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group">
                    <Gamepad2 size={18} className="group-hover:rotate-12 transition-transform" />
                 </button>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
                    <ShieldCheck size={12} /> Recall Stability
                 </div>
                 <div className="text-2xl font-black italic tracking-tighter">88%</div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[88%] h-full bg-indigo-400" />
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30 text-emerald-400">
                    <Award size={12} /> Rank Progress
                 </div>
                 <div className="text-2xl font-black italic tracking-tighter">Gold II</div>
                 <div className="text-[8px] font-black uppercase opacity-20">340 XP to next tier</div>
              </div>
           </div>
        </div>

        <p className="text-[10px] font-bold opacity-30 text-center uppercase tracking-widest">
           Neural environment version: 2.0.4 - Premium Sync Active
        </p>
      </div>
    </div>
  );
}
