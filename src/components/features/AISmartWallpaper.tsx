import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Zap, 
  Sparkles, 
  Wind, 
  Battery, 
  Monitor, 
  ChevronRight, 
  CircleDashed,
  Mountain,
  Ghost,
  CloudRain,
  Rocket,
  Aperture,
  Eye,
  Settings2,
  Clock,
  Layers,
  Flame,
  Sun,
  Moon,
  Library
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SmartWallpaperState } from '../../types';
import { getWallpaperReaction } from '../../services/wallpaperService';

interface AISmartWallpaperProps {
  apiKey?: string;
}

const THEMES = [
  { id: 'Morning', icon: <Sun size={18} />, desc: 'Calm sunrise focus room', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'Cyber Grind', icon: <Zap size={18} />, desc: 'Cyberpunk neon streaks', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'Anime Focus', icon: <Ghost size={18} />, desc: 'Stylized clouds & aura', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'Deep Space', icon: <Aperture size={18} />, desc: 'Nebula & star fields', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  { id: 'Elite Exam', icon: <Rocket size={18} />, desc: 'High-speed data streams', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'Rain Study', icon: <CloudRain size={18} />, desc: 'Calming rainy glass vibe', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'Recovery', icon: <Mountain size={18} />, desc: 'Low frequency breathing', color: 'text-white/40', bg: 'bg-white/5' }
] as const;

export default function AISmartWallpaper({ apiKey }: AISmartWallpaperProps) {
  const [state, setState] = useLocalStorage<SmartWallpaperState>('ai-smart-wallpaper-v1', {
    currentTheme: 'Cyber Grind',
    intensity: 80,
    speed: 50,
    isBatterySaver: false,
    isAutoSwitch: true,
    aiReaction: "Deep work atmosphere activated ⚡ Night grind visuals on deck.",
    lastUpdate: Date.now()
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleThemeChange = async (themeId: SmartWallpaperState['currentTheme']) => {
    const newState = { ...state, currentTheme: themeId, lastUpdate: Date.now() };
    setState(newState);
    
    if (apiKey) {
      setIsSyncing(true);
      try {
        const reaction = await getWallpaperReaction(apiKey, newState, 'change');
        setState(prev => ({ ...prev, aiReaction: reaction }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const toggleAutoSwitch = () => {
    setState({ ...state, isAutoSwitch: !state.isAutoSwitch });
  };

  const toggleBatterySaver = () => {
    setState({ ...state, isBatterySaver: !state.isBatterySaver });
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Atmosphere Engine</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-indigo-400">
              <Layers size={10} /> Neural Wallpaper v1
           </p>
        </div>
        <div className="p-3 rounded-2xl glass border border-white/5 text-indigo-400">
           {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <Palette size={18} />}
        </div>
      </header>

      {/* AI Atmosphere Commentary HUD */}
      <section className="p-8 rounded-[3.5rem] glass border border-indigo-500/10 relative overflow-hidden flex flex-col items-center">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-indigo-400">
            <Monitor size={120} />
         </div>

         <div className="text-center space-y-6 z-10 w-full px-4">
            <div className="p-4 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20">
               <p className="text-[10px] font-black italic uppercase tracking-tight leading-relaxed text-indigo-100 italic">
                  "{state.aiReaction}"
               </p>
            </div>
            <div className="flex justify-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", state.isAutoSwitch ? "bg-emerald-500" : "bg-rose-500")} />
                  <span className="text-[8px] font-black uppercase opacity-60">Adaptive: {state.isAutoSwitch ? 'ON' : 'OFF'}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                  <Battery size={10} className={cn(state.isBatterySaver ? "text-emerald-500" : "opacity-40")} />
                  <span className="text-[8px] font-black uppercase opacity-60">Saver: {state.isBatterySaver ? 'ON' : 'OFF'}</span>
               </div>
            </div>
         </div>
      </section>

      {/* Theme Selection Grid */}
      <section className="space-y-4 px-1">
         <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Study Mood Library</h3>
            <Settings2 size={14} className="opacity-20" />
         </div>

         <div className="grid grid-cols-1 gap-3">
            {THEMES.map((theme) => (
              <button 
                key={theme.id}
                onClick={() => handleThemeChange(theme.id as any)}
                className={cn(
                  "p-5 rounded-[2.5rem] glass border transition-all flex items-center gap-5 group text-left",
                  state.currentTheme === theme.id ? "border-indigo-500/50 bg-indigo-500/[0.05]" : "border-white/5"
                )}
              >
                 <div className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                   theme.bg,
                   theme.color,
                   state.currentTheme === theme.id ? "scale-110 shadow-lg" : "opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                 )}>
                    {theme.icon}
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xs font-black uppercase italic tracking-tight">{theme.id}</h4>
                    <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-0.5">{theme.desc}</p>
                 </div>
                 {state.currentTheme === theme.id && (
                    <motion.div layoutId="active-check">
                       <Sparkles size={14} className="text-indigo-400" />
                    </motion.div>
                 )}
              </button>
            ))}
         </div>
      </section>

      {/* Manual Overrides */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-6 mx-1">
         <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
               <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Aura Intensity</span>
               <span className="text-[10px] font-black italic">{state.intensity}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={state.intensity}
              onChange={(e) => setState({ ...state, intensity: Number(e.target.value) })}
              className="w-full accent-indigo-500 opacity-70"
            />
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
               <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Flow Velocity</span>
               <span className="text-[10px] font-black italic">{state.speed}%</span>
            </div>
            <input 
              type="range"
              min="10"
              max="100"
              value={state.speed}
              onChange={(e) => setState({ ...state, speed: Number(e.target.value) })}
              className="w-full accent-indigo-500 opacity-70"
            />
         </div>
      </section>

      {/* Global Config HUD */}
      <section className="grid grid-cols-2 gap-3 px-1">
          <button 
            onClick={toggleAutoSwitch}
            className={cn(
              "p-6 rounded-[2.5rem] glass border transition-all flex flex-col items-center gap-3",
              state.isAutoSwitch ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-white/5"
            )}
          >
             <Clock size={20} className={state.isAutoSwitch ? "text-emerald-500" : "opacity-30"} />
             <div className="text-[8px] font-black uppercase tracking-widest">Auto Transition</div>
          </button>
          <button 
             onClick={toggleBatterySaver}
             className={cn(
               "p-6 rounded-[2.5rem] glass border transition-all flex flex-col items-center gap-3",
               state.isBatterySaver ? "border-rose-500/20 bg-rose-500/[0.03]" : "border-white/5"
             )}
          >
             <Battery size={20} className={state.isBatterySaver ? "text-rose-500" : "opacity-30"} />
             <div className="text-[8px] font-black uppercase tracking-widest">Battery Saver</div>
          </button>
      </section>

      <div className="px-6 py-4 rounded-[2.2rem] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-between mx-1">
         <div className="flex items-center gap-3">
            <Eye size={16} className="text-indigo-400" />
            <div className="text-[10px] font-black uppercase italic text-white/90">Preview Mode Active</div>
         </div>
         <ChevronRight size={14} className="opacity-20" />
      </div>
    </div>
  );
}
