import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, 
  Shield, 
  Trophy, 
  Zap, 
  Flame, 
  Target, 
  Timer, 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  Swords,
  Crown,
  Medal,
  Dna,
  Binary,
  Cpu,
  ArrowUpRight,
  CircleDashed,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ArenaState, ArenaChallenge } from '../../types';
import { generateArenaChallenge } from '../../services/arenaService';

interface AIKnowledgeArenaProps {
  apiKey?: string;
}

const RANKS = [
  { id: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'Silver', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  { id: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'Elite', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'Legend', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
] as const;

export default function AIKnowledgeArena({ apiKey }: AIKnowledgeArenaProps) {
  const [arena, setArena] = useLocalStorage<ArenaState>('ai-knowledge-arena-v1', {
    rank: 'Silver',
    division: 'Div-II',
    prestigePoints: 450,
    totalBattles: 12,
    winStreak: 3,
    subjectMastery: {
      'Biology': 65,
      'Physics': 42,
      'Chemistry': 78
    },
    lastBattleDate: Date.now()
  });

  const [activeChallenge, setActiveChallenge] = useState<ArenaChallenge | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<'won' | 'lost' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentRank = RANKS.find(r => r.id === arena.rank) || RANKS[0];

  const startBattle = async (subject: string) => {
    if (!apiKey) return;
    setIsSearching(true);
    setBattleResult(null);
    setSelectedAnswer(null);
    try {
      const challenge = await generateArenaChallenge(apiKey, subject, 'medium');
      setActiveChallenge(challenge);
      setTimeLeft(30); // 30 second speed battle
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (battleResult || !activeChallenge) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === activeChallenge.correctAnswer;
    setBattleResult(isCorrect ? 'won' : 'lost');

    if (isCorrect) {
      setArena({
        ...arena,
        prestigePoints: arena.prestigePoints + activeChallenge.points,
        winStreak: arena.winStreak + 1,
        totalBattles: arena.totalBattles + 1,
        subjectMastery: {
          ...arena.subjectMastery,
          [activeChallenge.subject]: Math.min(100, (arena.subjectMastery[activeChallenge.subject] || 0) + 2)
        }
      });
    } else {
      setArena({
        ...arena,
        winStreak: 0,
        totalBattles: arena.totalBattles + 1
      });
    }
  };

  useEffect(() => {
    if (activeChallenge && !battleResult && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && activeChallenge && !battleResult) {
      setBattleResult('lost');
    }
  }, [activeChallenge, battleResult, timeLeft]);

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-1 gpu">
      <header className="px-2 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white font-mono">Knowledge Arena</h2>
           <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] flex items-center gap-2 text-rose-500">
              <Swords size={10} /> Neural Combat Grid
           </p>
        </div>
        <div className="text-right">
           <div className="text-[8px] font-black opacity-20 uppercase">Global Standing</div>
           <div className={cn("text-[10px] font-black italic uppercase", currentRank.color)}>{arena.rank} {arena.division}</div>
        </div>
      </header>

      {/* Hero Stats Card */}
      <section className={cn("p-8 rounded-[3.5rem] glass border relative overflow-hidden shadow-2xl", currentRank.border)}>
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Medal size={120} />
         </div>

         <div className="flex items-center gap-6 mb-8">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner", currentRank.bg)}>
               <Crown size={40} className={currentRank.color} />
            </div>
            <div className="space-y-1">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Battle Profile</div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter">{arena.rank}</h3>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(arena.prestigePoints % 1000) / 10}%` }}
                       className={cn("h-full", currentRank.bg.replace('10', '100'))} 
                     />
                  </div>
                  <span className="text-[8px] font-black opacity-40">{arena.prestigePoints % 1000}/1000 PP</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Battles', val: arena.totalBattles, icon: <Swords size={10} /> },
              { label: 'Streak', val: arena.winStreak, icon: <Flame size={10} />, color: 'text-orange-500' },
              { label: 'Prestige', val: arena.prestigePoints, icon: <Trophy size={10} />, color: 'text-yellow-500' }
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                 <div className="text-[7px] font-black uppercase opacity-30 tracking-widest flex items-center justify-center gap-1">
                    {stat.icon} {stat.label}
                 </div>
                 <div className={cn("text-xs font-black italic", stat.color)}>{stat.val}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Battle UI Overlay */}
      <AnimatePresence>
        {(isSearching || activeChallenge) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-[3rem] glass border border-rose-500/20 bg-black/60 backdrop-blur-3xl space-y-6 relative overflow-hidden"
          >
             {isSearching ? (
                <div className="py-20 text-center space-y-6">
                   <div className="relative">
                      <CircleDashed size={60} className="mx-auto text-rose-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Zap size={20} className="text-rose-400 animate-pulse" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-lg font-black italic uppercase italic tracking-tighter">Matchmaking...</h3>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Searching Neural Opponents</p>
                   </div>
                </div>
             ) : activeChallenge && (
                <>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                      <span className="flex items-center gap-2"><Target size={14} /> {activeChallenge.subject} Battle</span>
                      <span className={cn(
                        "flex items-center gap-2",
                        timeLeft < 10 && "text-rose-500 animate-pulse"
                      )}>
                         <Timer size={14} /> {timeLeft}s
                      </span>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-sm font-black italic uppercase tracking-tight leading-relaxed">
                         {activeChallenge.question}
                      </h3>
                      
                      <div className="space-y-2.5">
                         {activeChallenge.options?.map((opt, i) => (
                           <button 
                             key={i}
                             disabled={!!battleResult}
                             onClick={() => handleAnswer(opt)}
                             className={cn(
                               "w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between",
                               selectedAnswer === opt ? (
                                 opt === activeChallenge.correctAnswer ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-rose-500 bg-rose-500/10 text-rose-400"
                               ) : "border-white/10 hover:border-white/30"
                             )}
                           >
                              {opt}
                              {selectedAnswer === opt && (
                                opt === activeChallenge.correctAnswer ? <TrendingUp size={14} /> : <Zap size={14} />
                              )}
                           </button>
                         ))}
                      </div>
                   </div>

                   <AnimatePresence>
                      {battleResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-4 space-y-4"
                        >
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[10px] font-black uppercase opacity-60 leading-relaxed italic line-clamp-2">
                                 {activeChallenge.explanation}
                              </p>
                           </div>
                           <button 
                             onClick={() => { setActiveChallenge(null); setBattleResult(null); }}
                             className="w-full py-4 bg-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20"
                           >
                              Next Battle
                           </button>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Arena Select */}
      <section className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Arena Select</h3>
            <span className="text-[10px] font-black opacity-20 uppercase">Choose Topic</span>
         </div>
         <div className="grid grid-cols-2 gap-3">
            {Object.entries(arena.subjectMastery).map(([subject, mastery]) => (
              <button 
                key={subject}
                onClick={() => startBattle(subject)}
                className="p-5 rounded-[2.5rem] glass border border-white/5 text-left group hover:bg-rose-500/[0.03] transition-all relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Sword size={40} />
                 </div>
                 <div className="space-y-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-rose-400 group-hover:bg-rose-400/10 transition-all">
                       <Dna size={16} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black italic uppercase tracking-tight">{subject}</h4>
                       <div className="flex items-center gap-2 mt-1">
                          <div className="h-1 w-12 bg-white/10 rounded-full">
                             <div className="h-full bg-rose-500" style={{ width: `${mastery}%` }} />
                          </div>
                          <span className="text-[8px] font-black opacity-20 uppercase">{mastery}% Mastery</span>
                       </div>
                    </div>
                 </div>
              </button>
            ))}
            <button className="p-5 rounded-[2.5rem] glass border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-all">
               <Plus size={20} />
               <span className="text-[8px] font-black uppercase">Add Arena</span>
            </button>
         </div>
      </section>

      {/* Global Leaderboard HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4 relative overflow-hidden">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
            <Award size={12} className="text-yellow-500" /> Leaderboard Spotlight
         </div>
         <div className="space-y-4">
            {[
              { name: 'AXEL-7', rank: 'Legend', xp: '128k', me: false },
              { name: 'KIRA.VOID', rank: 'Diamond', xp: '94k', me: false },
              { name: 'YOU', rank: 'Silver', xp: '18k', me: true },
            ].map((player, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-3 rounded-2xl transition-all",
                player.me ? "bg-rose-500/10 border border-rose-500/20" : "bg-white/5 border border-white/5 opacity-60"
              )}>
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black opacity-40 font-mono">#{i + 1}</span>
                    <h5 className="text-[10px] font-black tracking-widest uppercase">{player.name}</h5>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black opacity-30 uppercase">{player.rank}</span>
                    <span className="text-[10px] font-black italic text-white/80">{player.xp}</span>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Combat Tech HUD */}
      <section className="p-6 rounded-[2.5rem] glass border border-white/5 grid grid-cols-2 gap-4">
         <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-rose-400">
               Neural Signal
            </div>
            <div className="flex gap-1">
               {Array.from({ length: 15 }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "w-1 h-4 rounded-full transition-all duration-500",
                     Math.random() > 0.5 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-white/5"
                   )} 
                 />
               ))}
            </div>
         </div>
         <div className="text-right flex flex-col justify-end">
            <div className="text-3xl font-black italic tracking-tighter leading-none">
               {arena.winStreak}x
            </div>
            <div className="text-[8px] font-black uppercase mt-1 opacity-20 tracking-widest">Strike Multiplier</div>
         </div>
      </section>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
