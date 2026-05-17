import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Wind, 
  Zap, 
  Map as MapIcon, 
  Activity, 
  ShieldCheck, 
  Boxes, 
  Sparkles, 
  History,
  TrendingUp,
  CloudRain,
  Sun,
  Moon,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface CityState {
  cityLevel: number;
  energyPercent: number;
  stabilityIndex: number;
  evolutionStage: string;
  commentary: string;
  nextUpgrade: string;
  unlockedDistricts: string[];
  atmosphere: string;
}

interface CityEconomy {
  studyEnergy: number;
  neuralCoins: number;
  focusCrystals: number;
  disciplinePower: number;
}

const DISTRICT_DATA = [
  { id: 'bio', name: 'Biology Research Lab', color: 'bg-emerald-500', icon: '🧬', minLevel: 1 },
  { id: 'phys', name: 'Physics Reactor Core', color: 'bg-cyan-500', icon: '⚛️', minLevel: 3 },
  { id: 'chem', name: 'Chemistry Tower', color: 'bg-rose-500', icon: '🧪', minLevel: 2 },
  { id: 'rev', name: 'Revision Arena', color: 'bg-amber-500', icon: '🏟️', minLevel: 4 },
  { id: 'focus', name: 'Focus Power Plant', color: 'bg-violet-500', icon: '⚡', minLevel: 1 },
  { id: 'mem', name: 'Memory Library', color: 'bg-indigo-500', icon: '📚', minLevel: 5 },
];

export default function AIDreamCity() {
  const [cityData, setCityData] = useLocalStorage<CityState>('city_state', {
    cityLevel: 1,
    energyPercent: 50,
    stabilityIndex: 60,
    evolutionStage: 'NEURAL_VILLAGE',
    commentary: 'City startup sequence active. Start studying to evolve.',
    nextUpgrade: 'Biology Research Lab',
    unlockedDistricts: ['Focus Power Plant'],
    atmosphere: 'Clear Sky'
  });

  const [economy, setEconomy] = useLocalStorage<CityEconomy>('city_economy', {
    studyEnergy: 100,
    neuralCoins: 50,
    focusCrystals: 10,
    disciplinePower: 40
  });

  const [loading, setLoading] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);

  const evolveCity = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/city-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cityContext: cityData,
          userStats: economy
        })
      });
      const data = await response.json();
      setCityData(data);
      
      // Bonus economy growth on sync
      setEconomy(prev => ({
        ...prev,
        neuralCoins: prev.neuralCoins + 10,
        studyEnergy: Math.min(500, prev.studyEnergy + 20)
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pulse effect based on energy
  const energyOpacity = cityData.energyPercent / 100;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 font-mono overflow-hidden relative">
      
      {/* City Atmosphere Overlay */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-all duration-[3000ms]",
        cityData.atmosphere === 'Neon Rain' ? "bg-blue-500/5" : "bg-transparent"
      )} />

      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-[linear-gradient(to_top,#0a0a0a_0%,transparent_100%)] pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          transform: 'perspective(1000px) rotateX(60deg) translateY(100px) scale(2)',
          transformOrigin: 'bottom'
        }} 
      />

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
        
        {/* City HUD Top */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem]">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                 <Building2 className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                 <h1 className="text-2xl font-black tracking-tighter text-white">AI DREAM <span className="text-cyan-400 italic">CITY</span></h1>
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest mt-1">
                    <span className="text-emerald-400 flex items-center gap-1"><Zap size={12} /> LVL {cityData.cityLevel}</span>
                    <span className="opacity-20">|</span>
                    <span className="text-slate-500">{cityData.evolutionStage.replace('_', ' ')}</span>
                 </div>
              </div>
           </div>

           <div className="flex gap-8 px-8 border-x border-white/5">
              {[
                { label: 'Energy', val: cityData.energyPercent, icon: Zap, color: 'text-amber-400' },
                { label: 'Stability', val: cityData.stabilityIndex, icon: ShieldCheck, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                   <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</div>
                   <div className={cn("text-xl font-black italic flex items-center justify-center gap-2", stat.color)}>
                      <stat.icon size={16} />
                      {stat.val}%
                   </div>
                </div>
              ))}
           </div>

           <button 
             onClick={evolveCity}
             disabled={loading}
             className="px-8 py-3 bg-cyan-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
           >
              {loading ? 'CALCULATING EVOLUTION...' : 'SYNC CITY CORE'}
           </button>
        </div>

        {/* Visual City Skyline (SVG Representation) */}
        <div className="relative h-[400px] w-full bg-slate-900/20 rounded-[3rem] border border-white/5 overflow-hidden group">
           <div className="absolute inset-0 flex items-end justify-center gap-2 px-12 pt-20">
              {DISTRICT_DATA.map((dist, i) => {
                const isActive = cityData.unlockedDistricts.includes(dist.name);
                const height = 40 + (i * 10) + (isActive ? 30 : 0);
                return (
                  <motion.div
                    key={dist.id}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={cn(
                      "flex-1 rounded-t-3xl border-t border-x relative transition-all duration-1000",
                      isActive ? `${dist.color}/10 border-${dist.color.split('-')[1]}-500/30` : "bg-slate-900/40 border-slate-800"
                    )}
                    style={{ 
                      boxShadow: isActive ? `0 -10px 40px -10px var(--tw-shadow-color)` : 'none',
                      ['--tw-shadow-color' as any]: isActive ? `rgba(${dist.color === 'bg-emerald-500' ? '16,185,129' : '6,182,212'}, 0.2)` : 'transparent'
                    }}
                  >
                     {isActive && (
                       <div className="absolute inset-x-0 top-4 flex justify-center">
                          <span className="text-2xl">{dist.icon}</span>
                       </div>
                     )}
                     {/* Window Lights */}
                     <div className="grid grid-cols-2 gap-2 p-4 mt-12">
                        {[...Array(6)].map((_, j) => (
                          <div 
                            key={j} 
                            className={cn(
                              "h-1 rounded-full transition-all duration-1000",
                              isActive && Math.random() > 0.3 ? dist.color : "bg-slate-800"
                            )}
                            style={{ opacity: isActive ? energyOpacity : 0.1 }}
                          />
                        ))}
                     </div>

                     <div className="absolute bottom-4 inset-x-0 text-center">
                        <div className={cn(
                          "text-[8px] font-black uppercase tracking-tighter",
                          isActive ? "text-white" : "text-slate-600"
                        )}>
                           {dist.name.split(' ')[0]}
                        </div>
                     </div>
                  </motion.div>
                );
              })}
           </div>

           {/* Floating HUD over Skyline */}
           <div className="absolute top-8 left-8 space-y-4">
              <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Growth Phase</div>
                 <div className="text-xs font-black text-white italic">{cityData.evolutionStage}</div>
              </div>
              <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Next Target</div>
                 <div className="text-xs font-black text-cyan-400 italic">{cityData.nextUpgrade}</div>
              </div>
           </div>

           {/* Commentary Bubble */}
           <motion.div 
             key={cityData.commentary}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="absolute top-8 right-8 max-w-xs text-right"
           >
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 italic text-sm text-white/80 leading-relaxed font-medium">
                 "{cityData.commentary}"
              </div>
           </motion.div>

           {/* Atmospheric Effects */}
           {cityData.atmosphere === 'Neon Rain' && (
              <div className="absolute inset-0 pointer-events-none">
                 {[...Array(20)].map((_, i) => (
                   <motion.div
                     key={i}
                     initial={{ y: -20, opacity: 0 }}
                     animate={{ y: 500, opacity: [0, 0.5, 0] }}
                     transition={{ duration: 1, repeat: Infinity, delay: Math.random() * 2 }}
                     className="absolute w-[1px] h-10 bg-cyan-400"
                     style={{ left: `${Math.random() * 100}%` }}
                   />
                 ))}
              </div>
           )}
        </div>

        {/* Economy and Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Economy Matrix */}
           <div className="lg:col-span-4 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                 <Database size={14} /> City Economy
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Study Energy', val: economy.studyEnergy, color: 'text-amber-400', icon: Zap },
                   { label: 'Neural Coins', val: economy.neuralCoins, color: 'text-cyan-400', icon: Boxes },
                   { label: 'Focus Crystals', val: economy.focusCrystals, color: 'text-violet-400', icon: Sparkles },
                   { label: 'Discipline Pwr', val: economy.disciplinePower, color: 'text-emerald-400', icon: ShieldCheck },
                 ].map((item, i) => (
                   <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                      <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">{item.label}</div>
                      <div className={cn("text-xl font-black italic flex items-center gap-2", item.color)}>
                         <item.icon size={14} />
                         {item.val}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl space-y-2">
                 <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Status</div>
                 <p className="text-xs font-bold leading-relaxed text-slate-300 italic">
                    City stability is at {cityData.stabilityIndex}%. Focus districts are operational but require more Neural Coins for Level 2 expansion.
                 </p>
              </div>
           </div>

           {/* Districts Activation Board */}
           <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Urban Districts</h3>
                 <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"><Sun size={14} /></button>
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"><Moon size={14} /></button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {DISTRICT_DATA.map((dist) => {
                   const isUnlocked = cityData.unlockedDistricts.includes(dist.name);
                   const canUnlock = cityData.cityLevel >= dist.minLevel;
                   return (
                     <div 
                        key={dist.id}
                        className={cn(
                          "p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group",
                          isUnlocked ? "bg-slate-900/60 border-white/10" : "bg-slate-900/20 border-white/5 grayscale opacity-60"
                        )}
                     >
                        <div className="flex items-start justify-between relative z-10">
                           <div className="flex items-center gap-4">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl", isUnlocked ? dist.color : "bg-slate-800")}>
                                 {dist.icon}
                              </div>
                              <div>
                                 <h4 className={cn("text-sm font-black italic", isUnlocked ? "text-white" : "text-slate-500")}>{dist.name}</h4>
                                 <div className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">
                                    {isUnlocked ? 'Functional District' : `Unlocks at LVL ${dist.minLevel}`}
                                 </div>
                              </div>
                           </div>
                           {isUnlocked && <Activity className="text-emerald-500 animate-pulse" size={14} />}
                        </div>
                        
                        {isUnlocked ? (
                          <div className="mt-6 flex items-center gap-4 relative z-10">
                             <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className={cn("h-full", dist.color)} style={{ width: '65%' }} />
                             </div>
                             <span className="text-[10px] font-black text-white">65% CAP</span>
                          </div>
                        ) : (
                          <button 
                            disabled={!canUnlock}
                            className={cn(
                              "mt-6 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              canUnlock ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-900 text-slate-700 cursor-not-allowed"
                            )}
                          >
                             {canUnlock ? 'INITIALIZE DISTRICT' : 'LEVEL INSUFFICIENT'}
                          </button>
                        )}

                        {/* Background Glow */}
                        {isUnlocked && (
                          <div className={cn("absolute -right-8 -bottom-8 w-24 h-24 blur-[40px] opacity-20 rounded-full", dist.color)} />
                        )}
                     </div>
                   );
                 })}
              </div>
           </div>

        </div>

      </div>

      {/* Mini City Floating HUD */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/90 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-full z-50 shadow-2xl"
      >
         <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_15px_#06b6d4]" />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-slate-500">City Integrity</span>
               <span className="text-xs font-black italic text-white">LVL {cityData.cityLevel} | {cityData.evolutionStage}</span>
            </div>
         </div>
         <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <Activity className="text-emerald-500" size={16} />
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-slate-500">Neural Energy</span>
               <span className="text-xs font-black italic text-white">{cityData.energyPercent}%</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-cyan-400 group cursor-pointer">
            <MapIcon size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Scan</span>
         </div>
      </motion.div>

    </div>
  );
}
