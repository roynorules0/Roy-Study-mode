import React, { useMemo, memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Zap, 
  Trophy, 
  Shield, 
  Star, 
  Glasses, 
  Crown, 
  Sparkles,
  Timer,
  ChevronRight,
  Lock,
  Check,
  Brain,
  Ghost,
  Swords,
  Target,
  Quote,
  MessageCircle,
  Gift,
  Heart,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { UserStats, AnalyticsData, StudyAvatar as IStudyAvatar, DailyQuest } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';

interface StudyAvatarViewProps {
  stats: UserStats;
  analytics: AnalyticsData[];
  onXPGain?: (xp: number, reason: string) => void;
}

const REPLIES = {
  happy: ["Feeling productive! 😄", "Aaj ka din mast hai! 🔥", "Doing great, let's keep going!"],
  focused: ["Focus mode: Ultra! ⚡", "Ek dum concentration mast hai. 🔥", "Legendary focus sessions!"],
  sleepy: ["Thoda sleepy feel ho raha hai... 😴", "Break le lo, dimag thak gaya hai.", "Battery low... need recharge."],
  angry: ["Focus where? Focus where?! 😤", "Consistency kidhar gayi? ⚠️", "Don't break the streak!"],
  motivated: ["Sky is the limit! 🚀", "Kal aur better karenge! ⚡", "Improvement is permanent."],
  'burned-out': ["Brain overcharge 🥲", "Mental exhaustion is real.", "Take a walk, refocus later."]
};

const HINGLISH_ADDONS = [
  "Aaj ka focus mast tha 🔥",
  "Consistency maintain karo, king 👑",
  "Bas thoda aur, you got this!",
  "Legendary streak active hai!",
  "Padhai aur passion, donon saath saath! ✨"
];

const StudyAvatarView = ({ stats, analytics, onXPGain }: StudyAvatarViewProps) => {
  const [avatar, setAvatar] = useLocalStorage<IStudyAvatar>('study-avatar-v3', {
    name: 'Astro',
    stage: 'dormant',
    mood: 'focused',
    unlockedAccessories: [],
    activeAccessories: [],
    disciplineScore: 0,
    totalXp: 0,
    level: 1
  });

  const [quests, setQuests] = useLocalStorage<DailyQuest[]>('avatar-quests-v2', [
    { id: 'focus_60', title: 'Deep Focus', description: '60 mins of focus', target: 60, current: 0, rewardXp: 200, completed: false, icon: 'timer' },
    { id: 'streak_save', title: 'Daily Lock', description: 'Complete 2 tasks', target: 2, current: 0, rewardXp: 150, completed: false, icon: 'target' },
    { id: 'rev_master', title: 'Revision Guru', description: 'Watch 2 study videos', target: 2, current: 0, rewardXp: 100, completed: false, icon: 'brain' }
  ]);

  const [reactionText, setReactionText] = useState(avatar.lastReaction || "Systems initialized. Let's study! 🔥");
  const [tapScale, setTapScale] = useState(1);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const safeAnalytics = Array.isArray(analytics) ? analytics : [];
  const todayData = safeAnalytics.find(d => d.date === todayStr);
  const dailyMinutes = todayData?.intensityMinutes || 0;
  const tasksCompleted = todayData?.tasksCompleted || 0;
  const lecturesWatched = todayData?.lecturesWatched || 0;

  // Sync quests with actual analytics
  useEffect(() => {
    if (!Array.isArray(analytics)) return;
    setQuests(prev => {
      let hasChanged = false;
      const next = prev.map(q => {
        if (q.completed) return q;
        let current = q.current;
        if (q.id === 'focus_60') current = Math.min(q.target, dailyMinutes);
        if (q.id === 'streak_save') current = Math.min(q.target, tasksCompleted);
        if (q.id === 'rev_master') current = Math.min(q.target, lecturesWatched);
        
        if (current === q.current) return q;
        
        hasChanged = true;
        const newlyCompleted = current >= q.target;
        return { ...q, current, completed: newlyCompleted };
      });
      return hasChanged ? next : prev;
    });
  }, [dailyMinutes, tasksCompleted, lecturesWatched, setQuests, analytics]);

  // Effect to handle XP rewards for newly completed quests
  const [rewardedQuests, setRewardedQuests] = useLocalStorage<string[]>('rewarded-quests-v1', []);

  useEffect(() => {
    if (!Array.isArray(quests)) return;
    const newlyCompleted = quests.filter(q => q.completed && !rewardedQuests.includes(q.id));
    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach(q => {
        onXPGain?.(q.rewardXp, `Quest: ${q.title}`);
      });
      setRewardedQuests(prev => [...prev, ...newlyCompleted.map(q => q.id)]);
    }
  }, [quests, rewardedQuests, onXPGain, setRewardedQuests]);

  // Evolution & Mood Logic
  const currentAvatarState = useMemo(() => {
    let stage: IStudyAvatar['stage'] = 'dormant';
    if (stats.level >= 25 || stats.streak >= 30) stage = 'legendary';
    else if (stats.level >= 15 || stats.streak >= 15) stage = 'elite';
    else if (stats.level >= 8 || stats.streak >= 7) stage = 'disciplined';
    else if (stats.level >= 3) stage = 'focused';

    let mood: IStudyAvatar['mood'] = 'focused';
    const totalWeeklyMinutes = safeAnalytics.slice(-7).reduce((acc, curr) => acc + curr.intensityMinutes, 0);
    
    if (dailyMinutes === 0 && stats.streak > 0) mood = 'angry';
    else if (dailyMinutes < 30) mood = 'sleepy';
    else if (dailyMinutes > 240) mood = 'burned-out';
    else if (dailyMinutes > 120) mood = 'motivated';
    else mood = 'happy';

    const disciplineScore = Math.min(100, (stats.streak * 4) + (todayData?.focusScore || 0) + (stats.level * 2));

    return { stage, mood, disciplineScore };
  }, [stats.level, stats.streak, dailyMinutes, todayData?.focusScore, safeAnalytics]);

  // Sync state changes with reaction
  useEffect(() => {
    if (currentAvatarState.mood !== avatar.mood) {
      const msgs = REPLIES[currentAvatarState.mood];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setReactionText(randomMsg);
      setAvatar(prev => ({ 
        ...prev, 
        mood: currentAvatarState.mood, 
        stage: currentAvatarState.stage, 
        disciplineScore: currentAvatarState.disciplineScore,
        lastReaction: randomMsg
      }));
    }
  }, [currentAvatarState.mood, currentAvatarState.stage, currentAvatarState.disciplineScore, avatar.mood, setAvatar]);

  const handleTapAvatar = useCallback(() => {
    const combined = [...REPLIES[currentAvatarState.mood], ...HINGLISH_ADDONS];
    const random = combined[Math.floor(Math.random() * combined.length)];
    setReactionText(random);
    setTapScale(0.9);
    setTimeout(() => setTapScale(1), 100);
  }, [currentAvatarState.mood]);

  const toggleAccessory = (acc: string) => {
    setAvatar(prev => ({
      ...prev,
      activeAccessories: prev.activeAccessories.includes(acc) 
        ? prev.activeAccessories.filter(a => a !== acc)
        : [...prev.activeAccessories, acc]
    }));
  };

  const getStageIcon = (stage: string) => {
    switch(stage) {
      case 'dormant': return <Ghost className="text-white/20 w-32 h-32" />;
      case 'focused': return <Target className="text-indigo-400 w-32 h-32" />;
      case 'disciplined': return <Shield className="text-emerald-500 w-32 h-32" />;
      case 'elite': return <Swords className="text-amber-500 w-32 h-32" />;
      case 'legendary': return <Star className="text-yellow-400 w-32 h-32" />;
      default: return <Brain className="w-32 h-32" />;
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😄';
      case 'focused': return '🔥';
      case 'sleepy': return '😴';
      case 'angry': return '😤';
      case 'motivated': return '⚡';
      case 'burned-out': return '🥲';
      default: return '🙂';
    }
  };

  const allAccessories = [
    { id: 'glasses', name: 'Focus Specs', icon: <Glasses size={18} />, level: 3 },
    { id: 'crown', name: 'Streak King', icon: <Crown size={18} />, streak: 5 },
    { id: 'neon', name: 'Cyber Aura', icon: <Cpu size={18} />, xp: 3000 },
    { id: 'shield', name: 'Focus Shield', icon: <Shield size={18} />, level: 12 },
    { id: 'flame', name: 'Blaze Aura', icon: <Flame size={18} />, streak: 15 },
  ];

  const levelProgress = (stats.xp % 1000) / 10;

  return (
    <div className="space-y-8 pb-24 max-w-2xl mx-auto px-4 gpu">
      <header className="flex justify-between items-end pt-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Study Avatar</h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2">
            <Cpu size={10} /> Neural Link: {currentAvatarState.stage}
          </p>
        </div>
        <div className="text-right group">
           <div className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:text-indigo-400 transition-colors">Neural Level</div>
           <div className="text-5xl font-black italic text-indigo-500 leading-none shadow-indigo-500/20 drop-shadow-lg">{stats.level}</div>
        </div>
      </header>

      {/* Main Center Stage */}
      <section className="relative flex flex-col items-center pt-8">
         {/* XP Progress Bar */}
         <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-12 border border-white/5 p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full"
            />
         </div>

         {/* Avatar Visualizer */}
         <div 
           className="relative cursor-pointer tap-highlight-none" 
           onClick={handleTapAvatar}
           style={{ transform: `scale(${tapScale})`, transition: 'transform 0.1s' }}
         >
            {/* Dynamic Aura Effects */}
            <AnimatePresence>
               {avatar.activeAccessories.includes('neon') && (
                 <motion.div 
                   animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.1, 0.25, 0.1],
                   }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="absolute inset-0 bg-indigo-500/30 rounded-[5rem] blur-[80px] -z-10"
                 />
               )}
               {avatar.activeAccessories.includes('flame') && (
                 <motion.div 
                   animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="absolute inset-0 bg-orange-500/20 rounded-full blur-[60px] -z-20"
                 />
               )}
            </AnimatePresence>

            {/* Main Avatar Container */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "w-64 h-64 rounded-[4.5rem] flex flex-col items-center justify-center relative glass-light border border-white/10 shadow-3xl overflow-hidden gpu",
                currentAvatarState.mood === 'burned-out' && "grayscale contrast-125 opacity-40",
                currentAvatarState.mood === 'motivated' && "border-indigo-400/40 bg-indigo-500/10 shadow-[inner_0_0_50px_rgba(99,102,241,0.2)]",
                currentAvatarState.mood === 'angry' && "border-rose-500/40 bg-rose-500/10 shadow-[inner_0_0_60px_rgba(244,63,94,0.15)]"
              )}
            >
               {/* Headgear Slot */}
               <div className="absolute top-10 pointer-events-none z-20">
                  {avatar.activeAccessories.includes('crown') && (
                    <motion.div 
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -50, opacity: 1 }}
                      className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                    >
                      <Crown size={48} fill="currentColor" />
                    </motion.div>
                  )}
               </div>

               {/* Body Gear Slot */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-30">
                  {avatar.activeAccessories.includes('glasses') && (
                    <Glasses size={80} className="text-white" />
                  )}
               </div>

               {/* Stage Manifestation */}
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentAvatarState.stage}
                    initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.3, opacity: 0, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {getStageIcon(currentAvatarState.stage)}
                  </motion.div>
               </AnimatePresence>

               {/* Mood Expression Bubble */}
               <div className="absolute bottom-6 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 flex items-center gap-3 shadow-2xl">
                  <span className="text-2xl drop-shadow-md">{getMoodEmoji(currentAvatarState.mood)}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">{currentAvatarState.mood}</span>
               </div>
            </motion.div>
         </div>

         {/* AI Response Interaction */}
         <motion.div 
           key={reactionText}
           initial={{ opacity: 0, y: 20, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           className="mt-12 w-full max-w-sm text-center p-8 rounded-[3rem] glass-light border border-white/5 relative bg-white/[0.02] shadow-2xl"
         >
            <Quote className="absolute -top-4 -left-2 text-indigo-500/20 w-10 h-10" />
            <p className="text-xl font-black italic tracking-tight leading-tight text-white/95 drop-shadow-sm">{reactionText}</p>
            <div className="flex items-center justify-center gap-4 mt-6 opacity-20">
               <div className="h-[1px] flex-1 bg-white" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap">Neural OS v3.0</span>
               <div className="h-[1px] flex-1 bg-white" />
            </div>
         </motion.div>
      </section>

      {/* Primary Vitals Grid */}
      <section className="grid grid-cols-2 gap-4">
         <div className="p-8 rounded-[3rem] glass-light border border-white/5 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp size={40} />
            </div>
            <div className="flex items-center gap-2 opacity-30">
               <Shield size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Evolution</span>
            </div>
            <div className="text-2xl font-black italic uppercase tracking-tighter text-indigo-400 leading-none">
               {currentAvatarState.stage}
            </div>
         </div>
         <div className="p-8 rounded-[3rem] glass-light border border-white/5 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Flame size={40} />
            </div>
            <div className="flex items-center gap-2 opacity-30">
               <Target size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Discipline</span>
            </div>
            <div className="text-2xl font-black italic uppercase tracking-tighter text-emerald-400 leading-none">
               {currentAvatarState.disciplineScore}%
            </div>
         </div>
      </section>

      {/* Daily Neural Quests */}
      <section className="space-y-6">
         <div className="flex justify-between items-center px-4">
            <h3 className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3">
               <Gift size={16} className="text-rose-500 animate-pulse" /> Daily Neural Quests
            </h3>
            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest text-indigo-400 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">Refreshes in 4h</span>
         </div>
         <div className="space-y-3">
            {quests.map(q => (
               <div key={q.id} className="p-6 rounded-[2.5rem] glass-light border border-white/5 flex items-center gap-6 group hover:bg-white/[0.04] transition-all gpu">
                  <div className={cn(
                    "w-16 h-16 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:scale-105",
                    q.completed ? "bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10" : "bg-white/5 text-white/30"
                  )}>
                     {q.icon === 'timer' && <Timer size={28} />}
                     {q.icon === 'target' && <Target size={28} />}
                     {q.icon === 'brain' && <Brain size={28} />}
                  </div>
                  <div className="flex-1 space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-widest leading-none text-white/90">{q.title}</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                           <Zap size={10} className="text-indigo-400" />
                           <span className="text-[10px] font-black text-indigo-400">+{q.rewardXp} XP</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                           <motion.div 
                             className={cn("h-full rounded-full", q.completed ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-indigo-500")}
                             initial={{ width: 0 }}
                             animate={{ width: `${(q.current / q.target) * 100}%` }}
                           />
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{q.description}</span>
                           <span className="text-[10px] font-black opacity-50 uppercase tracking-widest tabular-nums">{q.current}/{q.target}</span>
                        </div>
                     </div>
                  </div>
                  {q.completed ? (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                       <Check size={20} strokeWidth={3} />
                    </motion.div>
                  ) : (
                     <ChevronRight size={18} className="opacity-10" />
                  )}
               </div>
            ))}
         </div>
      </section>

      {/* Advanced Customization Slots */}
      <section className="space-y-6">
         <h3 className="font-black text-xs uppercase tracking-[0.3em] px-4 flex items-center gap-3">
            <Sparkles size={16} className="text-amber-500" /> Neural Gear Sync
         </h3>
         <div className="grid grid-cols-1 gap-3">
            {allAccessories.map(acc => {
               const unlocked = (acc.level && stats.level >= acc.level) || 
                                (acc.streak && stats.streak >= acc.streak) || 
                                (acc.xp && stats.xp >= acc.xp);
               const active = avatar.activeAccessories.includes(acc.id);

               return (
                 <button 
                   key={acc.id}
                   onClick={() => unlocked && toggleAccessory(acc.id)}
                   disabled={!unlocked}
                   className={cn(
                     "p-6 rounded-[2.5rem] glass-light border transition-all flex items-center gap-6 group gpu tap-highlight-none",
                     unlocked ? "border-white/10 active:scale-[0.98] hover:bg-white/[0.04]" : "opacity-30 grayscale border-dashed border-white/10 cursor-not-allowed"
                   )}
                 >
                    <div className={cn(
                      "w-14 h-14 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:rotate-6",
                      active ? "bg-indigo-500 text-white shadow-indigo-500/20" : "bg-white/5 text-white/40"
                    )}>
                       {acc.icon}
                    </div>
                    <div className="flex-1 text-left space-y-0.5">
                       <div className="text-[13px] font-black uppercase tracking-widest text-white/90">{acc.name}</div>
                       <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                          {unlocked ? (active ? 'De-Link Gear' : 'Establish Neural Link') : 'LOCKED - Requirements Needed'}
                       </div>
                    </div>
                    {unlocked ? (
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                        active ? "bg-indigo-500 border-indigo-500 text-white shadow-lg" : "border-white/10 group-hover:border-white/20"
                      )}>
                         {active && <Check size={16} strokeWidth={3} />}
                      </div>
                    ) : (
                      <div className="bg-black/20 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/5">
                         <Lock size={12} className="opacity-40" />
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60 tabular-nums">
                            {acc.level ? `LVL ${acc.level}` : acc.streak ? `${acc.streak}D` : `${acc.xp} XP`}
                         </span>
                      </div>
                    )}
                 </button>
               );
            })}
         </div>
      </section>

      {/* Tech Footer */}
      <footer className="text-center pb-12 flex flex-col items-center gap-4">
         <div className="h-[1px] w-12 bg-white/10" />
         <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.6em] opacity-40">Neural Study Core OS v3.4.1</p>
            <p className="text-[8px] font-bold opacity-10 uppercase tracking-widest">Cloud Persistency: Enabled • Encryption: RSA-2048</p>
         </div>
      </footer>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default memo(StudyAvatarView);
