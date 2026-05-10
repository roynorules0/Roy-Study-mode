import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  CloudRain, 
  Moon, 
  Sun, 
  ShieldAlert, 
  Target, 
  Flame, 
  Wind, 
  Globe,
  Settings2,
  Play,
  Square,
  Monitor,
  Tent,
  Mountain,
  Rocket
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RealityModeState } from '../../types';

const ENVIRONMENTS = [
  { id: 'cyber', name: 'Cyber City Rain', sub: 'Neon reflection mode', icon: <Monitor size={20} />, color: 'from-fuchsia-500/20 to-transparent' },
  { id: 'anime', name: 'Anime Desk', sub: 'Midnight aesthetics', icon: <Tent size={20} />, color: 'from-blue-500/20 to-transparent' },
  { id: 'bunker', name: 'Exam Bunker', sub: 'High intensity survival', icon: <ShieldAlert size={20} />, color: 'from-orange-500/20 to-transparent' },
  { id: 'library', name: 'Silent Library', sub: 'Dust & paper vibes', icon: <Mountain size={20} />, color: 'from-emerald-500/20 to-transparent' },
  { id: 'space', name: 'Focus Chamber', sub: 'Zero-G deep work', icon: <Rocket size={20} />, color: 'from-indigo-500/20 to-transparent' },
] as const;

export default function AIRealityMode() {
  const [reality, setReality] = useLocalStorage<RealityModeState>('reality-mode-v1', {
    isActive: false,
    environment: 'cyber',
    intensity: 'calm',
    auraLevel: 45,
    activeMission: {
      id: 'm1',
      text: 'Survive 90 mins Deep Work',
      progress: 40,
      target: 90
    },
    atmosphere: {
      particles: true,
      rain: true,
      glow: true
    }
  });

  const toggleReality = () => {
    setReality(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const selectEnv = (id: RealityModeState['environment']) => {
    setReality(prev => ({ ...prev, environment: id }));
  };

  const updateSetting = (key: keyof RealityModeState['atmosphere']) => {
    setReality(prev => ({
      ...prev,
      atmosphere: { ...prev.atmosphere, [key]: !prev.atmosphere[key] }
    }));
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Reality Mode</h2>
        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-fuchsia-400">
           <Zap size={10} /> Immersive Neuro-Environment
        </p>
      </header>

      {/* Main Activation Card */}
      <section className={cn(
        "p-8 rounded-[2.5rem] glass border transition-all duration-700 relative overflow-hidden flex flex-col items-center gap-6 text-center shadow-2xl",
        reality.isActive ? "border-fuchsia-500/30 bg-fuchsia-500/5" : "border-white/5"
      )}>
         <div className={cn(
           "absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none transition-all",
           ENVIRONMENTS.find(e => e.id === reality.environment)?.color
         )} />

         <div className="relative">
            <motion.div 
              animate={reality.isActive ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 90, 180, 270, 360]
              } : {}}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={cn(
                "w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-1000",
                reality.isActive ? "border-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.3)] bg-fuchsia-100/10" : "border-white/10"
              )}
            >
               <div className={cn(
                 "w-12 h-12 rounded-full transition-all",
                 reality.isActive ? "bg-fuchsia-500 blur-sm" : "bg-white/10"
               )} />
            </motion.div>
            {reality.isActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -inset-10 pointer-events-none"
              >
                <div className="w-full h-full border border-fuchsia-500/20 rounded-full animate-ping" />
              </motion.div>
            )}
         </div>

         <div className="space-y-2 z-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">
               {reality.isActive ? "Reality Protocol: ON" : "Reality Protocol: Standby"}
            </h3>
            <p className="text-[10px] font-bold opacity-40 uppercase">
               Environment: {ENVIRONMENTS.find(e => e.id === reality.environment)?.name}
            </p>
         </div>

         <button 
           onClick={toggleReality}
           className={cn(
             "px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
             reality.isActive 
               ? "bg-rose-500 text-white shadow-rose-500/20" 
               : "bg-fuchsia-600 text-white shadow-fuchsia-600/20"
           )}
         >
            {reality.isActive ? "Terminate Reality" : "Initiate Reality"}
         </button>
      </section>

      {/* Stats HUD Card */}
      <section className="grid grid-cols-2 gap-3 px-1">
         {[
           { label: 'Intensity', val: reality.intensity.toUpperCase(), icon: <Flame size={12} className="text-orange-500" /> },
           { label: 'Aura Power', val: `${reality.auraLevel}%`, icon: <Zap size={12} className="text-yellow-400" /> },
           { label: 'Discipline', val: 'LEGENDARY', icon: <Target size={12} className="text-emerald-400" /> },
           { label: 'Environment', val: reality.environment.toUpperCase(), icon: <Globe size={12} className="text-blue-400" /> },
         ].map((stat, i) => (
           <div key={i} className="p-4 rounded-3xl glass border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-[8px] font-black opacity-30 uppercase tracking-widest">
                 {stat.icon} {stat.label}
              </div>
              <div className="text-xs font-black italic tracking-tighter">{stat.val}</div>
           </div>
         ))}
      </section>

      {/* Environment Selector */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Immersion Zones</h3>
            <span className="text-[10px] font-black opacity-20 uppercase">Environment Core</span>
         </div>
         <div className="grid grid-cols-1 gap-2">
            {ENVIRONMENTS.map(env => (
              <button
                key={env.id}
                onClick={() => selectEnv(env.id)}
                className={cn(
                  "p-4 rounded-2xl glass border flex items-center justify-between group transition-all",
                  reality.environment === env.id ? "border-fuchsia-500/50 bg-fuchsia-500/5" : "border-white/5"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      reality.environment === env.id ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/40" : "bg-white/5 opacity-40"
                    )}>
                      {env.icon}
                    </div>
                    <div className="text-left">
                       <h4 className="text-xs font-black uppercase italic tracking-tight">{env.name}</h4>
                       <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest leading-none mt-0.5">{env.sub}</p>
                    </div>
                 </div>
                 {reality.environment === env.id && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" />}
              </button>
            ))}
         </div>
      </section>

      {/* Atmospheric Controls */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
             <Settings2 size={12} /> Atmospheric Protocols
          </div>
          <div className="grid grid-cols-1 gap-2">
             {[
               { id: 'particles', label: 'Floating Particles', icon: <Zap size={14} /> },
               { id: 'rain', label: 'Dynamic Weather', icon: <CloudRain size={14} /> },
               { id: 'glow', label: 'Deep Focus Glow', icon: <Wind size={14} /> }
             ].map((set) => {
               const isActive = reality.atmosphere[set.id as keyof RealityModeState['atmosphere']];
               return (
                 <button 
                   key={set.id}
                   onClick={() => updateSetting(set.id as keyof RealityModeState['atmosphere'])}
                   className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                 >
                    <div className="flex items-center gap-3">
                       <div className="text-fuchsia-400">{set.icon}</div>
                       <span className="text-[10px] font-black uppercase tracking-widest">{set.label}</span>
                    </div>
                    <div className={cn(
                      "w-8 h-4 rounded-full flex items-center px-1 transition-colors",
                      isActive ? "bg-fuchsia-600 justify-end" : "bg-white/10 justify-start"
                    )}>
                       <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                    </div>
                 </button>
               );
             })}
          </div>
      </section>

      {/* Mission HUD */}
      {reality.activeMission && (
        <section className="p-6 rounded-[2.5rem] glass border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                 <Target size={12} /> Active Mission
              </div>
              <div className="text-[8px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase">XP BONUS 2X</div>
           </div>
           
           <div className="space-y-3">
              <h4 className="text-sm font-black italic uppercase tracking-tight">{reality.activeMission.text}</h4>
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[8px] font-black uppercase opacity-40 pr-1">
                    <span>Progress</span>
                    <span>{reality.activeMission.progress} / {reality.activeMission.target} Mins</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      animate={{ width: `${(reality.activeMission.progress / reality.activeMission.target) * 100}%` }}
                    />
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* AI Hub Entry Info */}
      <p className="text-center text-[8px] font-black opacity-20 uppercase tracking-[0.3em] pb-4">
         Reality synchronization stable
      </p>
    </div>
  );
}
