import React, { memo } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Dna,
  Eye,
  Moon,
  Snowflake,
  Activity,
  Flame, 
  BrainCircuit, 
  Monitor, 
  Terminal,
  Calendar,
  Sparkles,
  ChevronRight,
  User as UserIcon,
  Zap,
  Target,
  Shield,
  RotateCcw,
  Sword,
  Swords,
  Wind,
  Bot,
  Brain,
  Network,
  Telescope,
  ShieldCheck,
  Headphones,
  FileText,
  Cloud,
  LayoutDashboard,
  BookOpen,
  Radar,
  Quote,
  Ghost,
  Lock,
  Palette,
  Stethoscope,
  Crown,
  Building2,
  Users,
  Binary,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIHubProps {
  onNavigate: (tab: string) => void;
  userStats: {
    level: number;
    xp: number;
    streak: number;
  };
  isCompactMode?: boolean;
}

const CORE_SYSTEMS = [
  { id: 'focus-room', label: 'AI Focus Room', sub: 'Deep focus environments', icon: <Monitor className="text-cyan-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'revision', label: 'Revision Master', sub: 'Neural recall optimization', icon: <RotateCcw className="text-indigo-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'ai_pyq_hunter', label: 'PYQ Hunter', sub: 'Pattern extraction engine', icon: <Target className="text-emerald-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'ai_voice_coach', label: 'Voice Coach', sub: 'Neural study mentor', icon: <Headphones className="text-sky-400" />, category: 'CORE', status: 'BETA' },
  { id: 'analyzer', label: 'Study Analyzer', sub: 'Performance tracking', icon: <Radar className="text-rose-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'mock_test', label: 'Mock Generator', sub: 'Adaptive test creation', icon: <LayoutDashboard className="text-indigo-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'planner', label: 'AI Planner', sub: 'Dynamic task management', icon: <Calendar className="text-emerald-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'smart_routine', label: 'Smart Routine', sub: 'Adaptive daily system', icon: <Clock className="text-indigo-400" />, category: 'CORE', status: 'BETA' },
  { id: 'xplevels', label: 'XP & Levels', sub: 'Progression dashboard', icon: <Trophy className="text-yellow-500" />, category: 'CORE', status: 'WORKING' },
  { id: 'shield', label: 'Focus Shield', sub: 'Distraction suppression', icon: <Shield className="text-blue-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'formula_vault', label: 'Formula Vault', sub: 'Neural equation lock', icon: <Binary className="text-indigo-400" />, category: 'CORE', status: 'WORKING' },
  { id: 'mistake_notebook', label: 'Mistake Notes', sub: 'Error elimination', icon: <BookOpen className="text-rose-500" />, category: 'CORE', status: 'WORKING' },
];

const ELITE_MODES = [
  { id: 'elite_hub:grind', label: 'Hardcore Grind', sub: 'Unbreakable sessions', icon: <Flame className="text-rose-500" />, category: 'ELITE', status: 'WORKING' },
  { id: 'elite_hub:focus', label: 'Deep Focus', sub: 'Coherence maximization', icon: <Activity className="text-cyan-400" />, category: 'ELITE', status: 'WORKING' },
  { id: 'elite_hub:monk', label: 'Silent Monk', sub: 'Total stimulus isolation', icon: <Moon className="text-slate-400" />, category: 'ELITE', status: 'WORKING' },
  { id: 'elite_hub:neural', label: 'Neural Sync', sub: 'In-flow stimulation', icon: <Zap className="text-amber-400" />, category: 'ELITE', status: 'WORKING' },
  { id: 'elite_hub:peak', label: 'Peak Performance', sub: 'Elite cognitive state', icon: <Crown className="text-white" />, category: 'ELITE', status: 'BETA' },
  { id: 'elite_hub:recovery', label: 'Recovery Mode', sub: 'Neural cool-down', icon: <Wind className="text-emerald-400" />, category: 'ELITE', status: 'WORKING' },
];

const EXPERIMENTAL_LABS = [
  { id: 'ai_dream_city', label: 'Dream City', sub: 'Visual motivation sim', icon: <Building2 className="text-cyan-400" />, category: 'LAB', status: 'EXPERIMENTAL' },
  { id: 'memory_palace', label: 'Memory Palace', sub: 'Spatial learning engine', icon: <Binary className="text-violet-400" />, category: 'LAB', status: 'EXPERIMENTAL' },
  { id: 'ai_multiverse_classroom', label: 'Multiverse Class', sub: 'Context shifted study', icon: <Users className="text-emerald-400" />, category: 'LAB', status: 'BETA' },
  { id: 'companion', label: 'Study Companion', sub: 'AI neural feedback', icon: <Bot className="text-pink-400" />, category: 'LAB', status: 'WORKING' },
  { id: 'focus_pet', label: 'Focus Pet', sub: 'Gamified engagement', icon: <Ghost className="text-indigo-400" />, category: 'LAB', status: 'BETA' },
  { id: 'time_machine', label: 'Time Machine', sub: 'Timeline projections', icon: <Telescope className="text-cyan-400" />, category: 'LAB', status: 'EXPERIMENTAL' },
  { id: 'second_brain', label: 'Second Brain', sub: 'Persistent external memory', icon: <Network className="text-blue-400" />, category: 'LAB', status: 'BETA' },
];

export default function AIHub({ onNavigate, userStats, isCompactMode }: AIHubProps) {
  const [activeCategory, setActiveCategory] = React.useState<'CORE' | 'ELITE' | 'LAB'>('CORE');

  const getItems = () => {
    switch(activeCategory) {
      case 'CORE': return CORE_SYSTEMS;
      case 'ELITE': return ELITE_MODES;
      case 'LAB': return EXPERIMENTAL_LABS;
      default: return CORE_SYSTEMS;
    }
  };

  const getCategoryStyles = () => {
    switch(activeCategory) {
      case 'CORE': return "from-indigo-600/10 via-slate-900/60 to-slate-950";
      case 'ELITE': return "from-rose-600/10 via-slate-900/60 to-slate-950";
      case 'LAB': return "from-cyan-600/10 via-slate-900/60 to-slate-950";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'WORKING': return '✅';
      case 'BETA': return '⚠️';
      case 'EXPERIMENTAL': return '🧪';
      case 'OFFLINE': return '❌';
      default: return '';
    }
  };

  return (
    <div className={cn("min-h-screen pb-32 transition-colors duration-700", getCategoryStyles())}>
      <div className="max-w-md mx-auto px-4 pt-8 space-y-8">
        <header className="space-y-2">
           <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">AI Hub</h2>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest opacity-40">STABLE-X9</div>
           </div>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
              <BrainCircuit size={10} className="text-indigo-400" /> Neural Control Center
           </p>
        </header>

        {/* Category Switcher */}
        <div className="flex p-1.5 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 relative z-20">
          {[
            { id: 'CORE', label: 'Core' },
            { id: 'ELITE', label: 'Elite Hub' },
            { id: 'LAB', label: 'Labs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={cn(
                "flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10",
                activeCategory === cat.id ? "text-white" : "text-white/30 hover:text-white/60"
              )}
            >
              {activeCategory === cat.id && (
                <motion.div 
                  layoutId="active-cat"
                  className={cn(
                    "absolute inset-0 rounded-full z-[-1] shadow-2xl",
                    cat.id === 'CORE' ? "bg-indigo-600 shadow-indigo-600/40" : 
                    cat.id === 'ELITE' ? "bg-rose-600 shadow-rose-600/40" : 
                    "bg-cyan-600 shadow-cyan-600/40"
                  )}
                />
              )}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Hero Stats Card */}
        <section className={cn(
          "p-8 rounded-[3rem] relative overflow-hidden group shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 glass border border-white/10",
        )}>
           <div className={cn(
             "absolute inset-0 opacity-10 transition-colors duration-700",
             activeCategory === 'CORE' ? "bg-indigo-600" :
             activeCategory === 'ELITE' ? "bg-rose-600" : "bg-cyan-600"
           )} />
           
           <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="space-y-0.5">
                 <div className="text-[9px] font-black uppercase tracking-widest opacity-40">System Efficiency</div>
                 <div className="text-4xl font-black italic tracking-tighter leading-none text-white">LVL {userStats.level}</div>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-1.5 justify-end text-white">
                    <Flame size={18} fill="currentColor" className="animate-pulse text-orange-500" />
                    <span className="text-3xl font-black italic tracking-tighter">{userStats.streak}d</span>
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest opacity-40 text-white">Real Streak</div>
              </div>
           </div>

           <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center px-1">
                 <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] text-white">EXP PROGRESS</span>
                 <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] text-white">{(userStats.xp % 1000) / 10}%</span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                <motion.div 
                  className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userStats.xp % 1000) / 10}%` }}
                  transition={{ duration: 1.5, type: 'spring' }}
                />
              </div>
           </div>
        </section>

        {/* Hub Grid */}
        <div className={cn(
          "grid gap-4 transition-all duration-500",
          isCompactMode ? "grid-cols-3" : "grid-cols-2"
        )}>
           {getItems().map((item, idx) => (
             <motion.button
               key={item.id}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.02 }}
               onClick={() => {
                  if (item.status === 'OFFLINE') return;
                  onNavigate(item.id);
                }}
               className={cn(
                 "p-5 rounded-[2.5rem] bg-white/[0.02] border flex flex-col items-start gap-5 text-left group hover:bg-white/[0.05] active:scale-95 transition-all relative overflow-hidden",
                 isCompactMode && "p-3.5 rounded-[1.8rem] gap-2",
                 activeCategory === 'CORE' ? "border-indigo-500/10" :
                 activeCategory === 'ELITE' ? "border-rose-500/10" : "border-cyan-500/10",
                 (item.status === 'OFFLINE' || item.status === 'COMING SOON') && "opacity-40 grayscale pointer-events-none"
               )}
             >
                <div className="flex justify-between items-start w-full relative z-10">
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                    isCompactMode && "w-8 h-8 rounded-xl",
                    activeCategory === 'CORE' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                    activeCategory === 'ELITE' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
                    "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  )}>
                     {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: isCompactMode ? 16 : 22 })}
                  </div>
                  {!isCompactMode && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[7px] font-black tracking-widest",
                      item.status === 'WORKING' ? "bg-emerald-500/20 text-emerald-400" :
                      item.status === 'BETA' ? "bg-amber-500/20 text-amber-400" :
                      item.status === 'EXPERIMENTAL' ? "bg-cyan-500/20 text-cyan-400" :
                      "bg-rose-500/20 text-rose-400"
                    )}>
                      {getStatusIcon(item.status)} {item.status}
                    </div>
                  )}
                </div>

                <div className="relative z-10 space-y-1 w-full">
                   <h3 className={cn(
                     "font-black italic uppercase tracking-tighter truncate text-white/90",
                     isCompactMode ? "text-[9px]" : "text-sm leading-none"
                   )}>{item.label}</h3>
                   {!isCompactMode && (
                      <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest truncate leading-tight">{item.sub}</p>
                   )}
                </div>
             </motion.button>
           ))}
        </div>

        <footer className="text-center py-10 space-y-2 opacity-10 border-t border-white/5 mx-6">
           <p className="text-[8px] font-black uppercase tracking-[0.5em]">Neural Standby</p>
           <p className="text-[7px] font-bold uppercase tracking-widest">Roy Study Suite Nexus v9.0</p>
        </footer>
      </div>
    </div>
  );
}
