import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Zap, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Star, 
  Dna,
  Cloud,
  Moon,
  Sun,
  Coffee,
  Waves,
  Gamepad2,
  Trophy,
  Ghost,
  Cat,
  Dog,
  Gamepad,
  Bot,
  CircleDashed,
  Coins
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { FocusPetState, FocusPet } from '../../types';
import { getPetReaction } from '../../services/petService';

interface AIFocusPetProps {
  apiKey?: string;
}

const PET_CONFIG = {
  fox: { icon: '🦊', label: 'Cyber Fox', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  panda: { icon: '🐼', label: 'Neon Panda', color: 'text-white', bg: 'bg-white/10' },
  cat: { icon: '🐱', label: 'Space Cat', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  owl: { icon: '🦉', label: 'Robot Owl', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  dragon: { icon: '🐉', label: 'Dragon Spirit', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
};

const STAGES = ['Baby', 'Active', 'Focused', 'Elite', 'Legendary'];

export default function AIFocusPet({ apiKey }: AIFocusPetProps) {
  const [state, setState] = useLocalStorage<FocusPetState>('ai-focus-pet-v1', {
    activePet: null,
    totalXpCoins: 150,
    lastInteraction: Date.now(),
    petMessage: "Mujhe ek starter pet choose karke adopt karo! 🦊"
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [showEvolutionEffect, setShowEvolutionEffect] = useState(false);

  const adoptPet = (type: FocusPet['type']) => {
    const newPet: FocusPet = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${PET_CONFIG[type].label}`,
      type,
      stage: 'Baby',
      xp: 0,
      level: 1,
      energy: 80,
      happiness: 90,
      mood: 'Happy',
      unlockedSkins: ['default'],
      activeSkin: 'default',
      environment: 'Cyber Room'
    };
    setState({ ...state, activePet: newPet, petMessage: `Welcome to the neural family! Let's study! 🔥` });
  };

  const handlePetInteraction = async (context: any = 'tap') => {
    if (!state.activePet || !apiKey || isSyncing) return;
    setIsSyncing(true);
    try {
      const msg = await getPetReaction(apiKey, state.activePet, context);
      setState({ ...state, petMessage: msg, lastInteraction: Date.now() });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const addXp = (amount: number) => {
    if (!state.activePet) return;
    const newXp = state.activePet.xp + amount;
    const levelThreshold = state.activePet.level * 100;
    
    let updatedPet = { ...state.activePet, xp: newXp };
    
    if (newXp >= levelThreshold) {
      updatedPet.level += 1;
      updatedPet.xp = 0;
      
      const stageIndex = STAGES.indexOf(updatedPet.stage);
      if (updatedPet.level % 5 === 0 && stageIndex < STAGES.length - 1) {
        updatedPet.stage = STAGES[stageIndex + 1] as any;
        setShowEvolutionEffect(true);
        setTimeout(() => setShowEvolutionEffect(false), 3000);
      }
    }
    
    setState({ ...state, activePet: updatedPet });
  };

  if (!state.activePet) {
    return (
      <div className="space-y-8 p-6 max-w-md mx-auto text-center">
        <header className="space-y-2">
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Choose your Avatar</h2>
           <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Select a neural companion to start your journey</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
           {(Object.keys(PET_CONFIG) as FocusPet['type'][]).map(type => (
             <motion.button 
               key={type}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => adoptPet(type)}
               className="p-8 rounded-[2.5rem] glass border border-white/5 flex flex-col items-center gap-4 group hover:border-indigo-500/30 transition-all"
             >
                <div className="text-5xl group-hover:scale-125 transition-transform duration-500 grayscale group-hover:grayscale-0">
                   {PET_CONFIG[type].icon}
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] font-black uppercase tracking-widest">{PET_CONFIG[type].label}</div>
                   <div className="w-12 h-0.5 bg-white/5 rounded-full mx-auto overflow-hidden">
                      <div className={cn("h-full", PET_CONFIG[type].bg.replace('/10', ''))} />
                   </div>
                </div>
             </motion.button>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Neural Link Active</span>
           </div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Focus Pet</h2>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/5">
           <Coins size={14} className="text-yellow-500" />
           <span className="text-xs font-black italic">{state.totalXpCoins}</span>
        </div>
      </header>

      {/* Main Pet Stage */}
      <section className="relative p-12 h-[380px] rounded-[3.5rem] glass border border-indigo-500/10 overflow-hidden flex flex-col items-center justify-center">
         {/* Background Effects */}
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-0 flex items-center justify-center"
            >
               <Dna size={300} className="text-indigo-400 opacity-20" />
            </motion.div>
         </div>

         {/* Pet Avatar */}
         <motion.div 
            onClick={() => handlePetInteraction('tap')}
            animate={{ 
               y: [0, -10, 0],
               scale: [1, 1.02, 1],
               rotate: [0, 1, -1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl relative cursor-pointer z-10 select-none group"
         >
            {PET_CONFIG[state.activePet.type].icon}
            
            <AnimatePresence>
              {isSyncing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-4 -right-4"
                >
                  <CircleDashed size={32} className="text-indigo-400 animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase text-indigo-400 tracking-[0.3em]"
            >
               Tap to Interact
            </motion.div>
         </motion.div>

         {/* Evolution Pulse */}
         <AnimatePresence>
            {showEvolutionEffect && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 2 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                 <Sparkles size={80} className="text-indigo-400 animate-spin" />
                 <div className="absolute text-xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    EVOLUTION!
                 </div>
              </motion.div>
            )}
         </AnimatePresence>

         {/* Pet Bubbles / Stats Overlay */}
         <div className="absolute bottom-10 left-10 space-y-2">
            <div className="p-3 rounded-2xl glass border border-white/5 flex items-center gap-2">
               <Zap size={14} className="text-indigo-400" />
               <span className="text-[10px] font-black italic">{state.activePet.level} Lvl</span>
            </div>
         </div>
         <div className="absolute bottom-10 right-10 space-y-2 text-right">
            <div className="p-3 rounded-2xl glass border border-white/5 flex items-center gap-2">
               <span className="text-[10px] font-black italic">{state.activePet.stage}</span>
               <TrendingUp size={14} className="text-emerald-400" />
            </div>
         </div>
      </section>

      {/* AI Message HUD */}
      <section className="px-2">
         <motion.div 
            key={state.petMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 relative"
         >
            <div className="absolute -top-3 left-8 w-6 h-6 bg-indigo-950 border-l border-t border-indigo-500/20 rotate-45" />
            <p className="text-[11px] font-black italic uppercase tracking-tight leading-relaxed text-indigo-100 flex items-center gap-3">
               <Flame size={14} className="text-indigo-400 shrink-0" />
               "{state.petMessage}"
            </p>
         </motion.div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-3 px-2">
         <div className="p-5 rounded-[2.2rem] glass border border-white/5 space-y-3">
            <div className="text-[8px] font-black uppercase opacity-30 tracking-widest flex items-center gap-2">
               <Shield size={10} /> Bio-Energy
            </div>
            <div className="flex items-end gap-2">
               <div className="text-2xl font-black italic leading-none">{state.activePet.energy}%</div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-indigo-500"
                 animate={{ width: `${state.activePet.energy}%` }}
               />
            </div>
         </div>
         <div className="p-5 rounded-[2.2rem] glass border border-white/5 space-y-3">
            <div className="text-[8px] font-black uppercase opacity-30 tracking-widest flex items-center gap-2">
               <Heart size={10} /> Mood Bond
            </div>
            <div className="flex items-end gap-2">
               <div className="text-2xl font-black italic leading-none">{state.activePet.happiness}%</div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-rose-500"
                 animate={{ width: `${state.activePet.happiness}%` }}
               />
            </div>
         </div>
      </section>

      {/* Growth Progress */}
      <section className="px-2 space-y-3">
         <div className="flex justify-between items-center text-[8px] font-black uppercase opacity-30 tracking-widest italic px-2">
            <span>Neural Maturity Progress</span>
            <span>{state.activePet.xp} / {state.activePet.level * 100} XP</span>
         </div>
         <div className="h-3 bg-white/5 rounded-full p-0.5 border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              animate={{ width: `${(state.activePet.xp / (state.activePet.level * 100)) * 100}%` }}
            />
         </div>
      </section>

      {/* Action Tray */}
      <section className="grid grid-cols-4 gap-3 px-2">
          <button 
            onClick={() => addXp(20)}
            className="flex flex-col items-center gap-2 p-4 rounded-3xl glass border border-white/5 active:scale-95 transition-all text-indigo-400 group"
          >
             <Star size={18} className="group-hover:fill-indigo-400 transition-all" />
             <span className="text-[7px] font-black uppercase">Play</span>
          </button>
          <button 
            onClick={() => {
              if (state.totalXpCoins >= 10 && state.activePet) {
                 setState({ ...state, totalXpCoins: state.totalXpCoins - 10, activePet: { ...state.activePet, energy: Math.min(100, state.activePet.energy + 15) } });
              }
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-3xl glass border border-white/5 active:scale-95 transition-all text-amber-400 group"
          >
             <Coffee size={18} className="group-hover:fill-amber-400 transition-all" />
             <span className="text-[7px] font-black uppercase">Feed</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-3xl glass border border-white/5 active:scale-95 transition-all text-fuchsia-400 group">
             <Ghost size={18} className="group-hover:fill-fuchsia-400 transition-all" />
             <span className="text-[7px] font-black uppercase">Skins</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-3xl glass border border-white/5 active:scale-95 transition-all text-white/40 group">
             <Trophy size={18} className="group-hover:text-white transition-all" />
             <span className="text-[7px] font-black uppercase">Goal</span>
          </button>
      </section>

      {/* Floating HUD Helper */}
      <div className="mx-2 p-5 rounded-[2.2rem] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
               <Bot size={16} />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase italic text-white/90">Focus Beast Mode</div>
               <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Complete sessions to activate</div>
            </div>
         </div>
         <ChevronRight size={16} className="text-white/20" />
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
