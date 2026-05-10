import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Flame, 
  Sparkles, 
  Zap, 
  Shield, 
  Star, 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  Clock,
  ChevronRight,
  Medal,
  Crown,
  Activity,
  CircleDashed,
  Search,
  Sword,
  BarChart3,
  Rocket
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LeaderboardUser, LeaderboardState } from '../../types';
import { getLeaderboardvibe } from '../../services/leaderboardService';

interface AILiveLeaderboardProps {
  apiKey?: string;
}

const RANK_CONFIG = {
  'Rookie': { icon: <Shield size={12} />, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  'Challenger': { icon: <Target size={12} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'Elite': { icon: <Zap size={12} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'Titan': { icon: <Flame size={12} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  'Legend': { icon: <Medal size={12} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  'Supreme Focus Master': { icon: <Crown size={12} />, color: 'text-rose-500', bg: 'bg-rose-500/10' }
};

const MOCK_USERS: LeaderboardUser[] = [
  { id: '1', name: 'Aryan_Elite', avatar: '🦊', xp: 4250, streak: 15, disciplineScore: 92, rank: 'Titan' },
  { id: '2', name: 'Ishita_Focus', avatar: '🐼', xp: 3890, streak: 12, disciplineScore: 88, rank: 'Titan' },
  { id: '3', name: 'Kabir_Grind', avatar: '🐱', xp: 3560, streak: 8, disciplineScore: 85, rank: 'Elite' },
  { id: 'currentUser', name: 'Ritik_User', avatar: '🐉', xp: 2450, streak: 7, disciplineScore: 78, rank: 'Challenger', isCurrentUser: true },
  { id: '4', name: 'Sara_Logic', avatar: '🦉', xp: 3120, streak: 10, disciplineScore: 82, rank: 'Elite' },
  { id: '5', name: 'Vikram_X', avatar: '🐺', xp: 2800, streak: 5, disciplineScore: 75, rank: 'Challenger' },
];

export default function AILiveLeaderboard({ apiKey }: AILiveLeaderboardProps) {
  const [state, setState] = useLocalStorage<LeaderboardState>('ai-leaderboard-v1', {
    users: MOCK_USERS,
    timeRange: 'weekly',
    lastUpdate: Date.now(),
    aiCommentary: "Top 10 grind mode activated 🔥 Leaderboard climb dangerous hone wala hai!"
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedUsers = useMemo(() => {
    return [...state.users]
      .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.xp - a.xp);
  }, [state.users, searchQuery]);

  const currentUser = useMemo(() => state.users.find(u => u.isCurrentUser), [state.users]);
  const currentUserRank = sortedUsers.findIndex(u => u.isCurrentUser) + 1;

  const syncLeaderboard = async () => {
    if (!apiKey) return;
    setIsSyncing(true);
    try {
      const res = await getLeaderboardvibe(apiKey, state);
      setState({ ...state, aiCommentary: res.commentary, lastUpdate: Date.now() });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Live Rankings</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-rose-500">
              <Sword size={10} /> Neural Arena Grid
           </p>
        </div>
        <button 
          onClick={syncLeaderboard}
          disabled={isSyncing}
          className="p-3 rounded-2xl glass border border-white/5 text-rose-500 active:scale-90 transition-all font-black text-[10px]"
        >
           {isSyncing ? <CircleDashed size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </header>

      {/* AI Commentary HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-rose-500/10 relative overflow-hidden flex gap-4 items-center">
         <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <Rocket size={24} className="animate-pulse" />
         </div>
         <div className="flex-1">
            <p className="text-[10px] font-black italic uppercase tracking-tight leading-relaxed text-rose-100">
               "{state.aiCommentary}"
            </p>
         </div>
      </section>

      {/* User Status Badge */}
      {currentUser && (
        <section className="mx-2 p-5 rounded-[2.2rem] bg-rose-600/20 border border-rose-500/30 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="text-3xl">{currentUser.avatar}</div>
              <div>
                 <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Your Position</div>
                 <div className="text-lg font-black italic uppercase tracking-tighter text-white">Rank #{currentUserRank}</div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Aura Boost</div>
              <div className="text-xs font-black text-rose-400">+{currentUser.disciplineScore}% Stability</div>
           </div>
        </section>
      )}

      {/* Range Select & Search */}
      <div className="space-y-4 px-2">
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['daily', 'weekly', 'monthly', 'global'] as const).map(range => (
              <button 
                key={range}
                onClick={() => setState({ ...state, timeRange: range })}
                className={cn(
                  "flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all",
                  state.timeRange === range ? "bg-white text-black" : "bg-white/5 text-white/40"
                )}
              >
                 {range}
              </button>
            ))}
         </div>
         <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter Competitors..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-[10px] font-black focus:outline-none focus:border-rose-500/50 transition-all placeholder:opacity-30 uppercase italic"
            />
         </div>
      </div>

      {/* Leaderboard Feed */}
      <section className="space-y-3">
         <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Elite Tier Candidates</h3>
            <Users size={14} className="opacity-20" />
         </div>

         <div className="space-y-3 px-1">
            {sortedUsers.map((user, i) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-4 rounded-[2rem] glass border relative flex items-center gap-4 transition-all",
                  user.isCurrentUser ? "border-rose-500/50 bg-rose-500/[0.05] shadow-[0_0_20px_rgba(244,63,94,0.1)]" : "border-white/5"
                )}
              >
                 <div className="flex flex-col items-center justify-center min-w-[32px]">
                    <div className={cn(
                      "text-xl font-black italic leading-none",
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-white/20"
                    )}>
                       {i + 1}
                    </div>
                    {i < 3 && <Medal size={12} className={cn("mt-1", i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-orange-400")} />}
                 </div>

                 <div className="text-3xl">{user.avatar}</div>

                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <div className="space-y-0.5">
                          <h4 className="text-xs font-black italic uppercase tracking-tight flex items-center gap-2">
                             {user.name}
                             {user.isCurrentUser && <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">YOU</span>}
                          </h4>
                          <div className={cn(
                            "flex items-center gap-1 text-[8px] font-black uppercase",
                            RANK_CONFIG[user.rank].color
                          )}>
                             {RANK_CONFIG[user.rank].icon}
                             {user.rank}
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-black text-rose-500 italic">{user.xp} XP</div>
                          <div className="text-[7px] font-black opacity-20 uppercase">Total Score</div>
                       </div>
                    </div>

                    <div className="flex gap-4 mt-2">
                       <div className="flex items-center gap-1 opacity-40">
                          <Flame size={10} className="text-orange-500" />
                          <span className="text-[8px] font-black">{user.streak}d Streak</span>
                       </div>
                       <div className="flex items-center gap-1 opacity-40">
                          <Activity size={10} className="text-indigo-400" />
                          <span className="text-[8px] font-black">{user.disciplineScore}% Perf.</span>
                       </div>
                    </div>
                 </div>

                 {i === 0 && (
                    <div className="absolute top-0 right-0 p-2">
                       <Crown size={12} className="text-yellow-400 animate-bounce" />
                    </div>
                 )}
              </motion.div>
            ))}
         </div>
      </section>

      {/* Global Events HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-rose-500/10 space-y-4 mx-1">
         <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 italic">
               <Globe size={12} className="text-rose-500" /> Global Pulse Events
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-[8px] font-black text-rose-500">LIVE</span>
         </div>
         
         <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Flame size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-tight text-white/80 italic">Midnight Grind Race</div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-0.5">ENDS IN 02:45:12</div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-rose-500">JOIN</span>
               <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
         </div>
      </section>

      {/* Performance Footer HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4 mx-1">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-rose-500">
               Arena Volatility
            </div>
            <div className="flex gap-1 h-4 items-end">
               {Array.from({ length: 15 }).map((_, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ height: 2 }}
                   animate={{ height: Math.random() * 16 + 4 }}
                   transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                   className={cn(
                     "w-1 rounded-full",
                     i > 10 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-white/10"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none text-rose-500">
               8,245
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Global Aspirants</div>
         </div>
      </section>
    </div>
  );
}
