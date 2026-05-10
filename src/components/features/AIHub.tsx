import React, { memo } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  BrainCircuit, 
  Monitor, 
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
  Binary,
  Network,
  Telescope,
  ShieldCheck,
  Cloud,
  LayoutDashboard,
  BookOpen,
  Radar,
  Quote,
  Ghost,
  Lock,
  Palette
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIHubProps {
  onNavigate: (tab: string) => void;
  userStats: {
    level: number;
    xp: number;
    streak: number;
  };
}

const HUB_ITEMS = [
  { 
    id: 'smart_wallpaper', 
    label: 'Smart Wallpaper', 
    sub: 'Adaptive study atmosphere', 
    icon: <Palette className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20',
    isNew: true
  },
  { 
    id: 'study_lock', 
    label: 'Study Lock Mode', 
    sub: 'Ultra-focus immersion', 
    icon: <Lock className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20',
    isNew: true
  },
  { 
    id: 'leaderboard', 
    label: 'Live Leaderboard', 
    sub: 'Study rankings & streaks', 
    icon: <Trophy className="text-yellow-400" />,
    color: 'from-yellow-500/20 to-transparent',
    border: 'border-yellow-500/20',
    isNew: true
  },
  { 
    id: 'focus_pet', 
    label: 'Focus Pet', 
    sub: 'Virtual study companion', 
    icon: <Ghost className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20',
    isNew: true
  },
  { 
    id: 'topic_predictor', 
    label: 'Topic Predictor', 
    sub: 'Analyze exam probability', 
    icon: <Radar className="text-rose-500" />,
    color: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20',
    isNew: true
  },
  { 
    id: 'smart_routine', 
    label: 'Smart Routine', 
    sub: 'Adaptive daily planner', 
    icon: <Calendar className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20',
    isNew: true
  },
  { 
    id: 'formula_vault', 
    label: 'Formula Vault', 
    sub: 'Equation storage & recall', 
    icon: <Binary className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20',
    isNew: true
  },
  { 
    id: 'mistake_notebook', 
    label: 'Mistake Notebook', 
    sub: 'Eliminate repeating errors', 
    icon: <BookOpen className="text-rose-500" />,
    color: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20',
    isNew: true
  },
  { 
    id: 'mock_test', 
    label: 'Mock Generator', 
    sub: 'AI adaptive exam sim', 
    icon: <LayoutDashboard className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20',
    isNew: true
  },
  { 
    id: 'dream_tracker', 
    label: 'Dream Tracker', 
    sub: 'Progress to future goals', 
    icon: <Cloud className="text-fuchsia-400" />,
    color: 'from-fuchsia-500/20 to-transparent',
    border: 'border-fuchsia-500/20',
    isNew: true
  },
  { 
    id: 'knowledge_arena', 
    label: 'Knowledge Arena', 
    sub: 'Arena of neural combat', 
    icon: <Swords className="text-rose-500" />,
    color: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20',
    isNew: true
  },
  { 
    id: 'discipline_engine', 
    label: 'Discipline Engine', 
    sub: 'Habit transformation AI', 
    icon: <ShieldCheck className="text-rose-400" />,
    color: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20',
    isNew: true
  },
  { 
    id: 'time_machine', 
    label: 'Time Machine', 
    sub: 'Predictive study timeline', 
    icon: <Telescope className="text-cyan-400" />,
    color: 'from-cyan-500/20 to-transparent',
    border: 'border-cyan-500/20',
    isNew: true
  },
  { 
    id: 'second_brain', 
    label: 'Second Brain', 
    sub: 'Smart knowledge vault', 
    icon: <Network className="text-blue-400" />,
    color: 'from-blue-500/20 to-transparent',
    border: 'border-blue-500/20',
    isNew: true
  },
  { 
    id: 'reality_mode', 
    label: 'Reality Mode', 
    sub: 'Immersive focus worlds', 
    icon: <Zap className="text-yellow-400" />,
    color: 'from-yellow-500/20 to-transparent',
    border: 'border-yellow-500/20',
    isNew: true
  },
  { 
    id: 'memory_palace', 
    label: 'Memory Palace', 
    sub: 'Visual neural worlds', 
    icon: <Binary className="text-violet-400" />,
    color: 'from-violet-500/20 to-transparent',
    border: 'border-violet-500/20',
    isNew: true
  },
  { 
    id: 'companion', 
    label: 'Study Companion', 
    sub: 'Virtual neural partner', 
    icon: <Bot className="text-pink-400" />,
    color: 'from-pink-500/20 to-transparent',
    border: 'border-pink-500/20',
    isNew: true
  },
  { 
    id: 'life_balancer', 
    label: 'Life Balancer', 
    sub: 'Burnout prevention AI', 
    icon: <Wind className="text-emerald-400" />,
    color: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-500/20',
    isNew: true
  },
  { 
    id: 'war_room', 
    label: 'Exam War Room', 
    sub: 'Battle station mode', 
    icon: <Sword className="text-amber-400" />,
    color: 'from-amber-500/20 to-transparent',
    border: 'border-amber-500/20',
    isNew: true
  },
  { 
    id: 'missions', 
    label: 'AI Missions', 
    sub: 'Daily neural quests', 
    icon: <Trophy className="text-amber-500" />,
    color: 'from-amber-500/20 to-transparent',
    border: 'border-amber-500/20'
  },
  { 
    id: 'focus-room', 
    label: 'AI Focus Room', 
    sub: 'Immersive spaces', 
    icon: <Monitor className="text-cyan-400" />,
    color: 'from-cyan-500/20 to-transparent',
    border: 'border-cyan-500/20',
    isSpecial: true
  },
  { 
    id: 'avatar', 
    label: 'Study Avatar', 
    sub: 'Evolve your companion', 
    icon: <UserIcon className="text-rose-500" />,
    color: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20'
  },
  { 
    id: 'revision', 
    label: 'Revision Master', 
    sub: 'Memory optimization', 
    icon: <RotateCcw className="text-indigo-400" />,
    color: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20'
  },
  { 
    id: 'analyzer', 
    label: 'Study Analyzer', 
    sub: 'Neural performance', 
    icon: <Target className="text-rose-400" />,
    color: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20',
    isNew: true
  },
  { 
    id: 'revision_engine', 
    label: 'Revision Engine', 
    sub: 'Adaptive memory booster', 
    icon: <RotateCcw className="text-emerald-400" />,
    color: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-500/20',
    isNew: true
  },
  { 
    id: 'shield', 
    label: 'Focus Shield', 
    sub: 'Neural lock-in mode', 
    icon: <Shield className="text-blue-400" />,
    color: 'from-blue-500/20 to-transparent',
    border: 'border-blue-500/20',
    isNew: true
  },
  { 
    id: 'planner', 
    label: 'AI Planner', 
    sub: 'Dynamic schedules', 
    icon: <Calendar className="text-emerald-400" />,
    color: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-500/20'
  },
  { 
    id: 'motivation', 
    label: 'AI Motivation', 
    sub: 'Neural boost', 
    icon: <Quote className="text-pink-400" />,
    color: 'from-pink-500/20 to-transparent',
    border: 'border-pink-500/20'
  },
  { 
    id: 'memory-trainer', 
    label: 'Memory Trainer', 
    sub: 'Recall velocity', 
    icon: <Brain className="text-blue-400" />,
    color: 'from-blue-500/20 to-transparent',
    border: 'border-blue-500/20'
  },
  { 
    id: 'xplevels', 
    label: 'XP & Levels', 
    sub: 'Progression stats', 
    icon: <Target className="text-yellow-500" />,
    color: 'from-yellow-500/20 to-transparent',
    border: 'border-yellow-500/20'
  }
];

export default function AIHub({ onNavigate, userStats }: AIHubProps) {
  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-4 gpu">
      <header className="space-y-1">
         <h2 className="text-4xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">AI Hub</h2>
         <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2">
            <BrainCircuit size={10} className="text-indigo-400" /> Neural Control Center
         </p>
      </header>

      {/* Hero Stats Card */}
      <section className="p-6 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group shadow-xl shadow-indigo-600/20">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap size={120} strokeWidth={3} />
         </div>
         
         <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="space-y-0.5">
               <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Neural Rank</div>
               <div className="text-3xl font-black italic tracking-tighter leading-none">Level {userStats.level}</div>
            </div>
            <div className="text-right">
               <div className="flex items-center gap-1.5 justify-end text-orange-400">
                  <Flame size={16} fill="currentColor" className="animate-pulse" />
                  <span className="text-2xl font-black italic tracking-tighter">{userStats.streak}</span>
               </div>
               <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Streak</div>
            </div>
         </div>

         <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center px-1">
               <span className="text-[8px] font-black opacity-60 uppercase tracking-[0.2em]">{userStats.xp} XP</span>
               <span className="text-[8px] font-black opacity-60 uppercase tracking-[0.2em]">Next: 1000</span>
            </div>
            <div className="h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div 
                className="h-full bg-gradient-to-r from-white/40 to-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${(userStats.xp % 1000) / 10}%` }}
                transition={{ duration: 1.5, type: 'spring' }}
              />
            </div>
         </div>
      </section>

      {/* Hub Grid */}
      <div className="grid grid-cols-2 gap-3">
         {HUB_ITEMS.map((item, idx) => (
           <motion.button
             key={item.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: idx * 0.03 }}
             onClick={() => {
                if (item.id === 'memory-trainer') onNavigate('revision');
                else if (item.id === 'motivation') onNavigate('avatar');
                else onNavigate(item.id);
             }}
             className={cn(
               "p-5 rounded-[2rem] bg-white/[0.02] border flex flex-col items-start gap-3 text-left group hover:bg-white/[0.04] active:scale-95 transition-all relative overflow-hidden",
               item.border
             )}
           >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", item.color)} />
              
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform relative z-10 shadow-lg">
                 {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
              </div>

              <div className="relative z-10 space-y-0.5 w-full">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                       <h3 className="font-black italic uppercase tracking-tighter text-sm leading-none truncate">{item.label}</h3>
                       {item.isNew && (
                         <span className="px-1 py-0.5 bg-rose-500 text-[6px] font-black rounded flex-shrink-0 animate-pulse">NEW</span>
                       )}
                    </div>
                    <ChevronRight size={14} className="opacity-10 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
                 </div>
                 <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{item.sub}</p>
              </div>

              {item.isSpecial && (
                <div className="absolute top-4 right-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </div>
              )}
           </motion.button>
         ))}
      </div>

      <footer className="text-center py-10 space-y-2 opacity-20 border-t border-white/5 mx-6">
         <p className="text-[8px] font-black uppercase tracking-[0.5em]">Neural Standby</p>
         <p className="text-[7px] font-bold uppercase tracking-widest">Roy Study Suite v9.0</p>
      </footer>
    </div>
  );
}
