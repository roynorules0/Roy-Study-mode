import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { AnalyticsData, HeatmapDay, SubjectStats, PredictionStats, Task, StudySession } from '../../types';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Zap, 
  AlertTriangle, 
  Brain, 
  Calendar, 
  PieChart as PieIcon, 
  ArrowRight, 
  Award,
  Flame,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useMemo, useState, memo } from 'react';
import StudyHeatmap from './StudyHeatmap';
import { format, isSameDay, subDays, differenceInDays, startOfDay } from 'date-fns';

interface AnalyticsProps {
  data: AnalyticsData[];
  tasks?: Task[];
  sessions?: StudySession[];
}

export default function Analytics({ data, tasks = [], sessions = [] }: AnalyticsProps) {
  const [selectedDay, setSelectedDay] = useState<{ date: string, stats: any, subjects?: string[] } | null>(null);

  const safeData = Array.isArray(data) ? data : [];

  const stats = useMemo(() => {
    if (!safeData.length) return {
      totalHours: 0,
      bestDay: null,
      streak: 0,
      longestStreak: 0,
      weeklyConsistency: 0,
      monthlyProgress: 0
    };

    // Total hours
    const totalMinutes = safeData.reduce((acc, d) => acc + d.intensityMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Best Day
    const sortedByIntensity = [...safeData].sort((a, b) => b.intensityMinutes - a.intensityMinutes);
    const bestDay = sortedByIntensity[0];

    // Streak Logic
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Day set for quick lookup
    const activeDaysSet = new Set(safeData.filter(d => d.intensityMinutes > 0).map(d => d.date));
    
    // Current streak
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    let currentCheck = startOfDay(new Date());
    if (!activeDaysSet.has(todayStr) && activeDaysSet.has(yesterdayStr)) {
      currentCheck = subDays(currentCheck, 1);
    }
    
    if (activeDaysSet.has(format(currentCheck, 'yyyy-MM-dd'))) {
      for (let i = 0; i < 365; i++) {
        if (activeDaysSet.has(format(subDays(currentCheck, i), 'yyyy-MM-dd'))) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Longest streak
    const allDays = [...safeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentL = 0;
    for (let i = 0; i < allDays.length; i++) {
      if (allDays[i].intensityMinutes > 0) {
        currentL++;
        longestStreak = Math.max(longestStreak, currentL);
      } else {
        currentL = 0;
      }
    }

    // Weekly Consistency (last 7 days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    const daysStudied = last7Days.filter(date => activeDaysSet.has(date)).length;
    const weeklyConsistency = Math.round((daysStudied / 7) * 100);

    // Monthly Progress
    const thisMonth = new Date().getMonth();
    const thisMonthHours = safeData
      .filter(d => new Date(d.date).getMonth() === thisMonth)
      .reduce((acc, d) => acc + d.intensityMinutes, 0) / 60;
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthHours = safeData
      .filter(d => new Date(d.date).getMonth() === lastMonth.getMonth())
      .reduce((acc, d) => acc + d.intensityMinutes, 0) / 60;
    
    const monthlyProgress = lastMonthHours === 0 ? 100 : Math.round(((thisMonthHours - lastMonthHours) / lastMonthHours) * 100);

    return {
      totalHours,
      bestDay,
      streak: currentStreak,
      longestStreak,
      weeklyConsistency,
      monthlyProgress
    };
  }, [safeData]);

  // Heatmap data covering 1 year
  const heatmapData: HeatmapDay[] = useMemo(() => {
    const days = Array.from({ length: 364 }).map((_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayStats = safeData.find(d => d.date === dateStr);
      
      let level: 0 | 1 | 2 | 3 = 0;
      if (dayStats) {
        if (dayStats.intensityMinutes > 300) level = 3;
        else if (dayStats.intensityMinutes > 120) level = 2;
        else if (dayStats.intensityMinutes > 0) level = 1;
      }
      
      return {
        date: dateStr,
        count: dayStats?.intensityMinutes || 0,
        level,
        raw: dayStats
      };
    });
    return days.reverse();
  }, [safeData]);

  const activeData = safeData.slice(-7); // Last 7 days for charts

  const isConsistencyLow = stats.weeklyConsistency < 50;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center px-2">
        <div>
           <h2 className="text-xl font-black tracking-tight uppercase italic">Cognitive Hub</h2>
           <p className="text-[10px] opacity-50 font-medium uppercase tracking-widest mt-0.5">Real-time Intelligence</p>
        </div>
      </header>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          icon={<Clock className="text-indigo-400" size={20} />} 
          label="Mastery" 
          value={`${stats.totalHours}h`} 
          sub="Total focus"
        />
        <StatCard 
          icon={<Flame className="text-orange-500" size={20} />} 
          label="Streak" 
          value={`${stats.streak}d`} 
          sub={`Best: ${stats.longestStreak}d`}
        />
        <StatCard 
          icon={<Target className="text-emerald-500" size={20} />} 
          label="Weekly" 
          value={`${stats.weeklyConsistency}%`} 
          sub="7-day logic"
        />
        <StatCard 
          icon={<TrendingUp className={stats.monthlyProgress >= 0 ? "text-emerald-500" : "text-rose-500"} size={20} />} 
          label="Growth" 
          value={`${stats.monthlyProgress > 0 ? '+' : ''}${stats.monthlyProgress}%`} 
          sub="Vs last month"
        />
      </div>

      {/* Heatmap Section */}
      <section className="p-5 rounded-[2rem] glass-light border border-white/5 space-y-6 relative overflow-hidden gpu">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-0.5">
              <h3 className="font-black text-sm flex items-center gap-2 uppercase italic tracking-tighter text-white/80">
                <Calendar className="text-indigo-500" size={16} /> 
                Momentum Map
              </h3>
              <p className="text-[8px] font-black opacity-20 uppercase tracking-[0.3em]">Historical Data</p>
            </div>
          </div>

          <div className="scale-95 origin-left">
            <StudyHeatmap 
              data={heatmapData} 
              onDayClick={(date, dayData) => {
                const dayTasks = tasks.filter(t => format(new Date(t.createdAt), 'yyyy-MM-dd') === date);
                const daySubjects = Array.from(new Set(dayTasks.map(t => t.text.split(' ')[0]))).slice(0, 3);
                setSelectedDay({ date, stats: dayData, subjects: daySubjects });
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div 
                key={selectedDay.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-white/5 border border-white/10 rounded-3xl grid grid-cols-2 gap-4 relative"
              >
                <div className="space-y-1">
                  <span className="text-[8px] font-black opacity-30 uppercase tracking-widest block">Date</span>
                  <div className="text-xs font-black italic uppercase tracking-tighter text-indigo-400">
                    {format(new Date(selectedDay.date), 'MMM dd, yyyy')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[8px] font-black opacity-30 uppercase tracking-widest block">Stats</span>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-white/30" />
                      <span className="font-black text-sm">{(selectedDay.stats?.count / 60 || 0).toFixed(1)}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="font-black text-sm">{selectedDay.stats?.raw?.tasksCompleted || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-2">
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-all border border-white/10"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Consistency Insight */}
      <AnimatePresence>
        {isConsistencyLow && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-4 rounded-[1.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 overflow-hidden"
          >
             <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                <AlertTriangle size={20} className="animate-pulse" />
             </div>
             <div className="space-y-0.5">
                <h4 className="font-black text-rose-500 uppercase tracking-widest text-[9px] leading-none mb-1">Momentum Critically Low</h4>
                <p className="text-[10px] font-medium opacity-70 leading-tight line-clamp-2">Drop detected. Aim for 15 mins today to resume flow.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="p-6 rounded-[2rem] glass-light border border-white/5 space-y-6 gpu">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest opacity-40 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" /> Study Velocity
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData.length ? activeData : ([{ date: 'No Data', intensityMinutes: 0 }] as any)}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fontWeight: 900, opacity: 0.2 }} 
                  tickFormatter={(val: string) => val === 'No Data' ? val : format(new Date(val), 'MMM d')}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', background: '#000', padding: '12px' }}
                />
                <Bar dataKey="intensityMinutes" radius={[4, 4, 0, 0]}>
                  {activeData.map((d, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={d.intensityMinutes > 300 ? '#10b981' : d.intensityMinutes > 120 ? '#6366f1' : '#4f46e5'} 
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Smart Motivational Insights */}
        <section className="p-6 rounded-[2rem] bg-indigo-600 text-white relative shadow-xl shadow-indigo-600/20 overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                   <Brain size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm italic uppercase tracking-tighter">AI Study Insights</h3>
                  <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest leading-none">Neural analysis</p>
                </div>
             </div>
             
             <div className="space-y-3">
                {stats.streak > 0 ? (
                  <InsightItem text={`Current streak: ${stats.streak} days. Flow state active.`} />
                ) : (
                  <InsightItem text="Consistency builds confidence. Start today." />
                )}
                
                <InsightItem text={stats.weeklyConsistency > 80 ? "Discipline: TOP-TIER. You are outpacing most users." : "Focus on choosing what you want most over now."} />
             </div>

             <div className="pt-2">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-indigo-200" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Next Tier: PRO STUDYER</span>
                  </div>
                  <ChevronRight size={12} className="opacity-40" />
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const StatCard = memo(({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) => {
  return (
    <div 
      className="p-4 rounded-3xl glass-light space-y-2 border border-white/5 relative overflow-hidden gpu"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1 shadow-inner">
        {icon}
      </div>
      <div className="text-2xl font-black tabular-nums tracking-tighter italic leading-none">{value}</div>
      <div className="space-y-0.5">
        <div className="text-[9px] font-black opacity-40 uppercase tracking-widest">{label}</div>
        <div className="text-[7px] opacity-30 font-bold uppercase tracking-widest truncate">{sub}</div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

const InsightItem = memo(({ text }: { text: string }) => {
  return (
    <div 
      className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 glass-light gpu"
    >
       <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
          <Zap size={10} fill="currentColor" />
       </div>
       <p className="text-[10px] font-bold leading-tight opacity-90">{text}</p>
    </div>
  );
});

InsightItem.displayName = 'InsightItem';
