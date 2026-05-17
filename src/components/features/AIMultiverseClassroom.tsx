import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Map as MapIcon, 
  Zap, 
  Wind, 
  Flame, 
  Atom, 
  Beaker, 
  Library, 
  Trophy, 
  Coffee, 
  Rocket,
  ShieldAlert,
  ChevronRight,
  Monitor,
  Headphones,
  Settings2,
  Sparkles,
  Search,
  Ghost
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Classroom {
  id: string;
  name: string;
  icon: React.ReactNode;
  mentor: string;
  personality: string;
  boost: string;
  color: string;
  desc: string;
  multiplier: number;
}

const CLASSROOMS: Classroom[] = [
  { id: 'biology', name: 'Biology Research Lab', icon: <Beaker size={24} />, mentor: 'Dr. Bio-Synth', personality: 'Calm & Analytical', boost: 'Retention +25%', color: 'border-emerald-500 text-emerald-400', desc: 'Cellular growth and neural mapping environment.', multiplier: 1.2 },
  { id: 'physics', name: 'Physics Quantum Chamber', icon: <Atom size={24} />, mentor: 'Professor Quanta', personality: 'Logic Driven', boost: 'Logic +30%', color: 'border-cyan-500 text-cyan-400', desc: 'Gravitational focus and atomic precision zone.', multiplier: 1.4 },
  { id: 'monk', name: 'Silent Monk Library', icon: <Library size={24} />, mentor: 'Zen Master Aether', personality: 'Minimalist Zen', boost: 'Focus +50%', color: 'border-slate-400 text-slate-100', desc: 'Absolute silence. Deep work sanctuary.', multiplier: 1.8 },
  { id: 'exam', name: 'Hardcore Exam Arena', icon: <Trophy size={24} />, mentor: 'Coach Vulcan', personality: 'Aggressive Discipline', boost: 'Speed +20%', color: 'border-rose-500 text-rose-400', desc: 'Simulated high-pressure exam environment.', multiplier: 1.5 },
  { id: 'night', name: 'Night Grind Café', icon: <Coffee size={24} />, mentor: 'Echo-01', personality: 'Chill Lo-Fi', boost: 'Creativity +15%', color: 'border-amber-500 text-amber-400', desc: 'Late night vibes with virtual neon rain.', multiplier: 1.1 },
  { id: 'space', name: 'Deep Focus Space Station', icon: <Rocket size={24} />, mentor: 'Commander Void', personality: 'Cosmic Immersion', boost: 'Longevity +40%', color: 'border-indigo-500 text-indigo-400', desc: 'Zero-G study modules in the outer rim.', multiplier: 1.6 },
];

interface MentorSync {
  mentorDialogue: string;
  strategy: string;
  environmentPulse: string;
  peerComments: string[];
  multiplier: number;
  boost: string;
}

export default function AIMultiverseClassroom() {
  const [selectedRoom, setSelectedRoom] = useLocalStorage<string>('active_classroom', 'monk');
  const [isEntering, setIsEntering] = useState(false);
  const [mentorData, setMentorData] = useState<MentorSync | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const activeRoom = CLASSROOMS.find(r => r.id === selectedRoom) || CLASSROOMS[0];

  const syncMentor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/classroom-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          classroomId: activeRoom.id,
          userContext: {
            currentRoom: activeRoom.name,
            personality: activeRoom.personality
          }
        })
      });
      const data = await response.json();
      setMentorData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      syncMentor();
    }
  }, [selectedRoom]);

  const enterClassroom = (id: string) => {
    setIsEntering(true);
    setSelectedRoom(id);
    setShowMap(false);
    setTimeout(() => setIsEntering(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 font-mono overflow-hidden relative">
      
      {/* Dynamic Background Atmosphere */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-[3000ms] pointer-events-none",
        activeRoom.id === 'night' ? "opacity-20" : "opacity-0"
      )}>
         <div className="absolute inset-0 bg-[#0c0c0c] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      </div>

      <AnimatePresence>
        {isEntering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
               className="mb-8"
             >
                <Atom size={60} className="text-cyan-500" />
             </motion.div>
             <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Syncing Multiverse Connection...</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">Initializing {activeRoom.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                 <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h1 className="text-2xl font-black tracking-tighter text-white">AI MULTIVERSE <span className="text-blue-500 italic">CLASSROOM</span></h1>
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest mt-1">
                    <span className="text-emerald-400 flex items-center gap-1"><Zap size={12} /> XP MULTIPLIER: {activeRoom.multiplier}x</span>
                    <span className="opacity-20">|</span>
                    <span className="text-slate-500">REALM: {activeRoom.name}</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setShowMap(true)}
             className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
           >
              <MapIcon size={16} /> Switch Classroom
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Sidebar: Room Details & Mentors */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Mentor Profile */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 space-y-8 backdrop-blur-xl group overflow-hidden relative">
                 <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Mentor</h3>
                    <Settings2 className="w-4 h-4 text-slate-600" />
                 </div>

                 <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <div className={cn(
                      "w-24 h-24 rounded-[2rem] border flex items-center justify-center transition-all duration-1000",
                      activeRoom.color
                    )}>
                       {activeRoom.icon}
                    </div>
                    <div>
                       <h4 className="text-xl font-black italic text-white uppercase">{activeRoom.mentor}</h4>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeRoom.personality}</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 relative z-10">
                    <p className="text-sm font-medium italic text-slate-300 leading-relaxed">
                       "{mentorData?.mentorDialogue || 'Establishing link...'}"
                    </p>
                 </div>

                 <div className="space-y-3 relative z-10">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Focus Strategy</div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                       <ShieldAlert size={14} className="text-amber-500" />
                       <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                          {mentorData?.strategy || 'Analyzing...'}
                       </span>
                    </div>
                 </div>

                 {/* Background Glow */}
                 <div className={cn(
                   "absolute bottom-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full",
                   activeRoom.color.split(' ')[0].replace('border', 'bg')
                 )} />
              </div>

              {/* Classroom Bonuses */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 space-y-6">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Buffs</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Zap size={14} className="text-emerald-400" />
                          <span className="text-xs font-black text-white italic">{activeRoom.boost}</span>
                       </div>
                       <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Flame size={14} className="text-blue-400" />
                          <span className="text-xs font-black text-white italic">XP Mult: {activeRoom.multiplier}x</span>
                       </div>
                       <Trophy size={14} className="text-blue-500" />
                    </div>
                 </div>
              </div>

           </div>

           {/* Main Classroom View */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* Immersive HUD Area */}
              <div className={cn(
                "min-h-[500px] border rounded-[4rem] p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-[2000ms]",
                activeRoom.color.split(' ')[0], 
                "bg-gradient-to-br from-black via-slate-900/40 to-black"
              )}>
                 
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Atmosphere Pulse</div>
                       <div className="text-xs font-black text-white italic flex items-center gap-2">
                          <Wind className="w-3 h-3 text-cyan-400" /> {mentorData?.environmentPulse || 'Calibrating...'}
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <Headphones className="text-slate-600 hover:text-white cursor-pointer transition-colors" />
                       <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                          SYSTEM: STABLE
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 flex flex-col items-center justify-center text-center py-20">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 10, repeat: Infinity }}
                      className="opacity-20"
                    >
                       <Atom size={200} className={activeRoom.color.split(' ')[1]} />
                    </motion.div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                       <h2 className="text-[10vw] md:text-[6rem] font-black italic tracking-tighter text-white leading-none uppercase opacity-10 select-none">
                          STUDYING
                       </h2>
                       <div className="space-y-2">
                          <p className="text-sm font-black text-slate-500 uppercase tracking-[0.5em]">Active Focus Threshold</p>
                          <div className="text-4xl font-black text-white italic tabular-nums">94.2%</div>
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 grid grid-cols-3 gap-6">
                    <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center group hover:border-white/20 transition-all">
                       <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Cognitive Load</div>
                       <div className="text-lg font-black text-white italic">LIGHT</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center group hover:border-white/20 transition-all">
                       <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Alpha Waves</div>
                       <div className="text-lg font-black text-white italic">SYNCED</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center group hover:border-white/20 transition-all">
                       <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Peak Recovery</div>
                       <div className="text-lg font-black text-white italic">82%</div>
                    </div>
                 </div>

                 {/* HUD Overlays */}
                 <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
                 </div>
              </div>

              {/* Peer Activity Hub */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 space-y-8 overflow-hidden">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Users size={14} /> AI Study Peers
                    </h3>
                    <div className="flex -space-x-3">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#050505] flex items-center justify-center overflow-hidden">
                            <Ghost size={14} className="text-slate-600" />
                         </div>
                       ))}
                       <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#050505] flex items-center justify-center text-[8px] font-black text-white">+12</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(mentorData?.peerComments || []).map((comment, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-[11px] text-slate-400 font-medium leading-relaxed">
                         "{comment}"
                      </div>
                    ))}
                   {!mentorData && [...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
                    ))}
                 </div>
              </div>

           </div>

        </div>

      </div>

      {/* Multiverse Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
          >
             <div className="max-w-6xl w-full space-y-12">
                <div className="text-center space-y-2">
                   <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase underline decoration-blue-500/20">Classroom Multiverse</h2>
                   <p className="text-sm font-medium text-slate-500">Pick a reality to begin your focus session.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {CLASSROOMS.map((room) => (
                     <button
                        key={room.id}
                        onClick={() => enterClassroom(room.id)}
                        className={cn(
                          "relative p-8 rounded-[2.5rem] border transition-all duration-500 group text-left overflow-hidden",
                          selectedRoom === room.id ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                        )}
                     >
                        <div className="flex items-center justify-between mb-6">
                           <div className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                             room.color.split(' ')[0].replace('border', 'bg').replace('-400', '-500'),
                             "text-black"
                           )}>
                              {room.icon}
                           </div>
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{room.multiplier}x BOOST</div>
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-xl font-black italic text-white uppercase">{room.name}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed font-medium">{room.desc}</p>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                           Enter Realm <ChevronRight size={12} />
                        </div>

                        {/* Hover Overlay */}
                        <div className={cn(
                          "absolute -right-8 -bottom-8 w-24 h-24 blur-[40px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity",
                          room.color.split(' ')[0].replace('border', 'bg')
                        )} />
                     </button>
                   ))}
                </div>

                <div className="flex justify-center">
                   <button 
                     onClick={() => setShowMap(false)}
                     className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 hover:text-white transition-colors"
                   >
                      CLOSE MAP
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimally Floating HUD */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/90 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-full z-50 shadow-2xl"
      >
         <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3b82f6]" />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-slate-500">Multiverse Link</span>
               <span className="text-xs font-black italic text-white uppercase">{activeRoom.id}</span>
            </div>
         </div>
         <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <Search className="text-cyan-400" size={16} />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-slate-500">Active Boost</span>
               <span className="text-xs font-black italic text-white">{activeRoom.boost}</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-blue-400 group cursor-pointer" onClick={() => setShowMap(true)}>
            <MapIcon size={16} className="group-hover:scale-120 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Reality Selection</span>
         </div>
      </motion.div>

    </div>
  );
}
