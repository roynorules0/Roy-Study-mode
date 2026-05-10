import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Map as MapIcon, 
  Brain, 
  Sparkles, 
  Zap, 
  ChevronRight, 
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
  MoreVertical,
  Activity,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MemoryRoom, MemoryPalaceItem } from '../../types';
import { generateMemoryAssociations } from '../../services/memoryPalaceService';

interface AIMemoryPalaceProps {
  apiKey?: string;
}

const ROOMS: Partial<MemoryRoom>[] = [
  { id: 'bio', name: 'Biology Lab', subject: 'Biology', theme: 'lab' },
  { id: 'phys', name: 'Physics Arena', subject: 'Physics', theme: 'arena' },
  { id: 'chem', name: 'Chemistry Vault', subject: 'Chemistry', theme: 'vault' },
  { id: 'med', name: 'Anatomy Hall', subject: 'Medicine', theme: 'hall' },
  { id: 'zen', name: 'Zen Monastery', subject: 'General', theme: 'monastery' }
];

export default function AIMemoryPalace({ apiKey }: AIMemoryPalaceProps) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [userRooms, setUserRooms] = useLocalStorage<MemoryRoom[]>('memory-palace-v1', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  
  // New Item State
  const [newConcept, setNewConcept] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const currentRoom = useMemo(() => {
    return userRooms.find(r => r.id === activeRoomId);
  }, [userRooms, activeRoomId]);

  const handleCreateRoom = (roomDef: Partial<MemoryRoom>) => {
    if (userRooms.find(r => r.id === roomDef.id)) {
      setActiveRoomId(roomDef.id!);
      return;
    }
    const newRoom: MemoryRoom = {
      id: roomDef.id!,
      name: roomDef.name!,
      subject: roomDef.subject!,
      theme: roomDef.theme!,
      items: []
    };
    setUserRooms([...userRooms, newRoom]);
    setActiveRoomId(newRoom.id);
  };

  const addItemToRoom = async () => {
    if (!apiKey || !newConcept || !activeRoomId) return;
    setIsGenerating(true);
    try {
      const assoc = await generateMemoryAssociations(apiKey, newConcept, newTopic);
      const newItem: MemoryPalaceItem = {
        id: Math.random().toString(36).substr(2, 9),
        topic: newTopic || 'General',
        concept: newConcept,
        visualHook: assoc.visualHook!,
        mnemonic: assoc.mnemonic!,
        content: assoc.content!,
        strength: 100,
        lastRecall: Date.now()
      };

      setUserRooms(userRooms.map(r => {
        if (r.id === activeRoomId) {
          return { ...r, items: [newItem, ...r.items] };
        }
        return r;
      }));
      setNewConcept('');
      setNewTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateRecall = (roomId: string, itemId: string) => {
    setUserRooms(userRooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          items: r.items.map(item => {
            if (item.id === itemId) {
              return { ...item, strength: Math.min(100, item.strength + 20), lastRecall: Date.now() };
            }
            return item;
          })
        };
      }
      return r;
    }));
  };

  return (
    <div className={cn(
      "space-y-6 pb-24 max-w-md mx-auto px-1 gpu transition-all duration-700",
      isNightMode ? "bg-black text-indigo-100" : "bg-transparent text-white"
    )}>
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Memory Palace</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <MapIcon size={10} /> Spatial Intelligence System
           </p>
        </div>
        <button 
          onClick={() => setIsNightMode(!isNightMode)}
          className="p-2 rounded-xl glass border border-white/10"
        >
          <Camera size={16} />
        </button>
      </header>

      {!activeRoomId ? (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Choose Blueprint</h3>
             <span className="text-[10px] font-black opacity-20 uppercase">Neural Zones</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             {ROOMS.map(room => (
               <button 
                 key={room.id}
                 onClick={() => handleCreateRoom(room)}
                 className="p-6 rounded-[2.5rem] glass border border-white/5 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.05] transition-all"
               >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all",
                    room.theme === 'lab' ? 'bg-emerald-500/10' : 
                    room.theme === 'arena' ? 'bg-orange-500/10' : 
                    room.theme === 'vault' ? 'bg-indigo-500/10' : 'bg-pink-500/10'
                  )}>
                     {room.theme === 'lab' && <FlaskConical size={24} />}
                     {room.theme === 'arena' && <Activity size={24} />}
                     {room.theme === 'vault' && <Layers size={24} />}
                     {room.theme === 'monastery' && <Box size={24} />}
                     {room.theme === 'hall' && <Atom size={24} />}
                  </div>
                  <div>
                     <h4 className="text-xs font-black uppercase italic tracking-tighter">{room.name}</h4>
                     <p className="text-[8px] font-bold opacity-30 uppercase mt-0.5">{room.subject}</p>
                  </div>
               </button>
             ))}
          </div>

          {userRooms.length > 0 && (
            <div className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                  <Award size={12} className="text-indigo-400" /> Active Fortresses
               </div>
               <div className="space-y-2">
                  {userRooms.map(room => (
                    <button 
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-4">
                          <span className="text-xs font-black italic">{room.items.length} Icons</span>
                          <span className="text-[10px] font-black opacity-30 uppercase">{room.name}</span>
                       </div>
                       <ChevronRight size={14} className="opacity-0 group-hover:opacity-40" />
                    </button>
                  ))}
               </div>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
           {/* Room Controls */}
           <div className="flex items-center gap-4 px-2">
              <button 
                onClick={() => setActiveRoomId(null)}
                className="p-3 rounded-2xl glass border border-white/5 text-indigo-400"
              >
                 <MapIcon size={20} />
              </button>
              <div className="flex-1">
                 <h3 className="text-xl font-black italic tracking-tighter uppercase">{currentRoom?.name}</h3>
                 <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{currentRoom?.subject}</p>
              </div>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              </div>
           </div>

           {/* Input Section */}
           <div className="p-6 rounded-[2.5rem] glass border border-indigo-500/10 space-y-4 shadow-2xl">
              <div className="space-y-3">
                 <input 
                   placeholder="Complex Concept (e.g. Action Potential)"
                   value={newConcept}
                   onChange={e => setNewConcept(e.target.value)}
                   className="w-full p-4 bg-white/5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500/50"
                 />
                 <input 
                   placeholder="Topic/Chapter"
                   value={newTopic}
                   onChange={e => setNewTopic(e.target.value)}
                   className="w-full p-4 bg-white/5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500/50"
                 />
              </div>
              <button 
                onClick={addItemToRoom}
                disabled={isGenerating || !newConcept}
                className={cn(
                  "w-full py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all",
                  (isGenerating || !newConcept) && "opacity-50 grayscale"
                )}
              >
                 {isGenerating ? <Sparkles size={16} className="animate-spin" /> : <Plus size={16} />}
                 {isGenerating ? "Building Neuro-Association..." : "Add to Palace"}
              </button>
           </div>

           {/* Objects Grid */}
           <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Interactive Objects</h4>
                 <div className="text-[10px] font-black italic text-indigo-400">SYNC: READY</div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-2">
                 {currentRoom?.items.map(item => (
                   <motion.div 
                     layout
                     key={item.id}
                     className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4 group relative overflow-hidden"
                   >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Brain size={80} />
                      </div>
                      
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase italic text-indigo-400 p-1 px-2 border border-indigo-500/20 bg-indigo-500/5 rounded">{item.topic}</span>
                            <h5 className="text-lg font-black uppercase italic tracking-tighter mt-1">{item.concept}</h5>
                         </div>
                         <div className="text-right">
                            <div className="text-[9px] font-black opacity-30 uppercase">Strength</div>
                            <div className="text-sm font-black italic text-emerald-400">{item.strength}%</div>
                         </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-300">
                            <Camera size={10} /> Visual Hook
                         </div>
                         <p className="text-xs font-bold leading-relaxed pr-4 font-mono text-indigo-100/90 italic">
                            "{item.visualHook}"
                         </p>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-orange-400 opacity-60">
                               <Lightbulb size={10} /> Mnemonic
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-tight text-orange-400/80 italic">
                               {item.mnemonic}
                            </p>
                         </div>
                         <button 
                           onClick={() => updateRecall(activeRoomId, item.id)}
                           className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                         >
                            <Zap size={20} fill="currentColor" />
                         </button>
                      </div>

                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           className="h-full bg-indigo-500"
                           animate={{ width: `${item.strength}%` }}
                         />
                      </div>
                   </motion.div>
                 ))}

                 {currentRoom?.items.length === 0 && (
                   <div className="py-20 text-center space-y-4 opacity-20">
                      <Layout size={40} className="mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Palace room is empty</p>
                   </div>
                 )}
              </div>
           </div>
        </section>
      )}

      {/* Stats Summary (Persistent) */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
         <div className="space-y-3">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-30 text-indigo-400">
               <Brain size={12} /> Neural Grid
            </div>
            <div className="flex flex-wrap gap-1">
               {Array.from({ length: 24 }).map((_, i) => (
                 <div key={i} className="w-2.5 h-2.5 rounded-sm bg-white/10" />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none">0.8s</div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Avg Recall Delay</div>
         </div>
      </section>
    </div>
  );
}
