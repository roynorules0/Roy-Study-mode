import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Award, 
  Star, 
  Zap, 
  History, 
  ChevronRight,
  ShieldCheck,
  Sword,
  Crown,
  Target,
  BarChart,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { UserStats, AnalyticsData } from '../../types';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface XPLevelsProps {
  stats: UserStats;
  analytics: AnalyticsData[];
}

export default function XPLevels({ stats, analytics }: XPLevelsProps) {
  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Beginner';
    if (level < 10) return 'Focus Warrior';
    return 'NEET Beast';
  };

  const currentLevelProgress = (stats.xp % 1000) / 10;
  const xpToNextLevel = 1000 - (stats.xp % 1000);

  // Weekly summary
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyXP = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = analytics.find(d => d.date === dateStr);
    return {
      date: format(date, 'EEE'),
      xp: dayData ? (dayData.sessions * 10) + (dayData.tasksCompleted * 5) + (dayData.lecturesWatched * 5) : 0
    };
  });

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">XP & Levels</h2>
            <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em]">Your Discipline Journey</p>
          </div>
          <div className="flex -space-x-2">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-indigo-500 flex items-center justify-center text-white">
                  <Award size={18} />
                </div>
             ))}
          </div>
        </div>

        {/* Level Card */}
        <div className="p-8 rounded-[3rem] bg-indigo-600 text-white relative shadow-2xl shadow-indigo-600/30 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-8">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-20 h-20 bg-white/20 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-md">
                      <h3 className="text-4xl font-black italic">{stats.level}</h3>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Current Rank</div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter">{getLevelTitle(stats.level)}</h4>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Total XP</div>
                   <div className="text-2xl font-black italic">{stats.xp}</div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Level Progress</span>
                   <span className="text-sm font-bold">{Math.floor(currentLevelProgress)}%</span>
                </div>
                <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${currentLevelProgress}%` }}
                     className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                     transition={{ duration: 1.5, ease: "easeOut" }}
                   />
                </div>
                <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                  {xpToNextLevel} XP remaining for Level {stats.level + 1}
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Flame className="text-orange-500" />} 
          label="Day Streak" 
          value={`${stats.streak}d`} 
          sub="Consistency is key" 
        />
        <StatCard 
          icon={<Zap className="text-yellow-500" />} 
          label="Power Level" 
          value={(stats.xp / 100).toFixed(1)} 
          sub="Based on total XP" 
        />
      </div>

      {/* Weekly XP Summary */}
      <section className="p-8 rounded-[2.5rem] glass border border-white/5 space-y-6">
         <div className="flex justify-between items-center">
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60 flex items-center gap-2">
              <TrendingUp size={16} /> Weekly Activity
            </h3>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">+420 XP gained</span>
         </div>
         <div className="flex items-end justify-between h-32 gap-2 pt-4">
            {weeklyXP.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (day.xp / 200) * 100)}%` }}
                    className="w-full bg-indigo-500/20 rounded-t-lg group-hover:bg-indigo-500 transition-colors"
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.xp}
                  </div>
                </div>
                <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{day.date}</span>
              </div>
            ))}
         </div>
      </section>

      {/* Achievements Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-sm uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" /> Milestone Rewards
          </h3>
        </div>
        <div className="space-y-3">
           <AchievementItem 
             title="Focus Novice" 
             desc="Complete 10 focus sessions" 
             unlocked={stats.xp >= 100}
             target={10}
             current={Math.floor(stats.xp / 10)}
           />
           <AchievementItem 
             title="Early Bird" 
             desc="Solve 50 MCQs in morning" 
             unlocked={false}
             target={50}
             current={12}
           />
           <AchievementItem 
             title="Lecture Master" 
             desc="Watch 20 study lectures" 
             unlocked={false}
             target={20}
             current={5}
           />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-[2rem] glass border border-white/5 space-y-2 relative overflow-hidden"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-black italic tracking-tighter">{value}</div>
      <div>
        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">{label}</div>
        <div className="text-[9px] opacity-20 font-bold uppercase tracking-tight">{sub}</div>
      </div>
    </motion.div>
  );
}

function AchievementItem({ title, desc, unlocked, target, current }: { title: string, desc: string, unlocked: boolean, target: number, current: number }) {
  const progress = Math.min(100, (current / target) * 100);

  return (
    <div className={cn(
      "p-5 rounded-[2rem] glass border transition-all duration-500 flex items-center gap-5",
      unlocked ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/5 opacity-50"
    )}>
       <div className={cn(
         "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg",
         unlocked ? "bg-indigo-500 text-white" : "bg-white/5 text-white/20"
       )}>
          {unlocked ? <Crown size={28} /> : <ShieldCheck size={28} />}
       </div>
       <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
             <h4 className="font-black italic uppercase tracking-tighter text-sm">{title}</h4>
             {unlocked && <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Unlocked</span>}
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">{desc}</p>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn("h-full", unlocked ? "bg-indigo-500" : "bg-white/20")}
             />
          </div>
       </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
