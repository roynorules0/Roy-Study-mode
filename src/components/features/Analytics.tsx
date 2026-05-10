import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { AnalyticsData, HeatmapDay, SubjectStats, PredictionStats } from '../../types';
import { TrendingUp, Target, Clock, Zap, AlertTriangle, Brain, Calendar, PieChart as PieIcon, ArrowRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo } from 'react';
import StudyHeatmap from './StudyHeatmap';

interface AnalyticsProps {
  data: AnalyticsData[];
}

const mockAnalytics: AnalyticsData[] = [
  { date: '2024-05-01', hours: 4, sessions: 5, tasksCompleted: 8, lecturesWatched: 2, focusScore: 85, intensityMinutes: 240 },
  { date: '2024-05-02', hours: 6, sessions: 8, tasksCompleted: 12, lecturesWatched: 3, focusScore: 92, intensityMinutes: 360 },
  { date: '2024-05-03', hours: 2, sessions: 3, tasksCompleted: 4, lecturesWatched: 1, focusScore: 60, intensityMinutes: 120 },
  { date: '2024-05-04', hours: 7, sessions: 10, tasksCompleted: 15, lecturesWatched: 5, focusScore: 95, intensityMinutes: 420 },
  { date: '2024-05-05', hours: 5, sessions: 7, tasksCompleted: 10, lecturesWatched: 2, focusScore: 80, intensityMinutes: 300 },
  { date: '2024-05-06', hours: 8, sessions: 12, tasksCompleted: 18, lecturesWatched: 6, focusScore: 98, intensityMinutes: 480 },
  { date: '2024-05-07', hours: 3, sessions: 4, tasksCompleted: 6, lecturesWatched: 1, focusScore: 70, intensityMinutes: 180 },
];

const mockHeatmap: HeatmapDay[] = Array.from({ length: 112 }).map((_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 10),
  level: Math.floor(Math.random() * 4) as any
}));

const mockSubjects: SubjectStats[] = [
  { name: 'Physics', minutesStudied: 1240, tasksDone: 45, lastStudied: Date.now() - 3600000 },
  { name: 'Chemistry', minutesStudied: 980, tasksDone: 32, lastStudied: Date.now() - 86400000 },
  { name: 'Biology', minutesStudied: 1560, tasksDone: 58, lastStudied: Date.now() - 172800000 },
  { name: 'Mathematics', minutesStudied: 840, tasksDone: 28, lastStudied: Date.now() - 432000000 },
];

const mockPrediction: PredictionStats = {
  completionPercentage: 74,
  estimatedCompletionDate: 'June 15, 2024',
  riskLevel: 'medium'
};

export default function Analytics({ data }: AnalyticsProps) {
  const activeData = data.length > 0 ? data : mockAnalytics;
  
  // Real heatmap data from the analytics history
  const heatmapData: HeatmapDay[] = useMemo(() => {
    // Start with last 112 days
    const days = Array.from({ length: 112 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStats = data.find(d => d.date === dateStr);
      let level: 0 | 1 | 2 | 3 = 0;
      
      if (dayStats) {
        if (dayStats.intensityMinutes > 300) level = 3;
        else if (dayStats.intensityMinutes > 120) level = 2;
        else if (dayStats.intensityMinutes > 0) level = 1;
      } else {
        // Fallback to random for demo if no data yet (optional, but let's keep it real)
        // level = Math.floor(Math.random() * 4) as any;
      }
      
      return {
        date: dateStr,
        count: dayStats?.intensityMinutes || 0,
        level
      };
    });
    return days;
  }, [data]);

  const isConsistencyLow = activeData.length > 0 && activeData[activeData.length - 1].hours < 2;

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-black tracking-tight">Performance Hub</h2>
           <p className="text-sm opacity-50 font-medium">Deep analysis of your discipline 🧠</p>
        </div>
        <div className="flex -space-x-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
             </div>
           ))}
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Clock className="text-indigo-500" />} 
          label="Study Hours" 
          value="42.5h" 
          sub="Total this week"
        />
        <StatCard 
          icon={<Zap className="text-orange-500" />} 
          label="Focus sessions" 
          value="48" 
          sub="Across all topics"
        />
        <StatCard 
          icon={<Award className="text-emerald-500" />} 
          label="Discipline" 
          value="8.4" 
          sub="Out of 10 score"
        />
        <StatCard 
          icon={<Target className="text-rose-500" />} 
          label="Tasks Done" 
          value="124" 
          sub="78% completion"
        />
      </div>

      {/* Heatmap Section */}
      <section className="p-8 rounded-[2.5rem] glass space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Calendar size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5"><Brain size={18} className="text-indigo-400" /></div>
              Study Consistency Map
            </h3>
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-white/5">
              112 Days
            </span>
          </div>
          <StudyHeatmap data={heatmapData} />
        </div>
      </section>

      {/* Discipline Warning */}
      <AnimatePresence>
        {isConsistencyLow && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 overflow-hidden"
          >
             <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0">
                <AlertTriangle size={24} className="animate-pulse" />
             </div>
             <div>
                <h4 className="font-bold text-rose-500 uppercase tracking-widest text-xs">⚠️ Discipline Falling</h4>
                <p className="text-sm opacity-70">Focus time dropped by 45% compared to yesterday. Take a quick break and restart.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity Graph */}
        <section className="p-8 rounded-[2.5rem] glass space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest opacity-60">
              <TrendingUp size={16} /> Productivity Peaks
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, opacity: 0.3 }} 
                  tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ borderRadius: '24px', border: 'none', background: '#121212', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                />
                <Bar dataKey="intensityMinutes" radius={[12, 12, 12, 12]}>
                  {activeData.map((d, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={d.intensityMinutes > 300 ? '#10b981' : d.intensityMinutes > 180 ? '#f59e0b' : '#ef4444'} 
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Prediction System */}
        <section className="p-8 rounded-[2.5rem] glass space-y-6 flex flex-col justify-between">
           <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest opacity-60 flex items-center gap-2">
                 <Target size={16} /> Progress Velocity
              </h3>
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-full border-8 border-indigo-500/10 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                       <circle 
                         cx="48" cy="48" r="40" 
                         fill="none" stroke="currentColor" strokeWidth="8" 
                         className="text-indigo-500" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - mockPrediction.completionPercentage / 100)} 
                         strokeLinecap="round"
                       />
                    </svg>
                    <span className="text-xl font-black">{mockPrediction.completionPercentage}%</span>
                 </div>
                 <div className="space-y-1">
                    <div className="text-xs font-bold opacity-40 uppercase tracking-widest">Syllabus Completion</div>
                    <div className="text-lg font-bold">Estimated Date</div>
                    <div className="text-sm text-indigo-400 font-bold">{mockPrediction.estimatedCompletionDate}</div>
                 </div>
              </div>
           </div>
           <div className={`p-4 rounded-2xl flex items-center gap-3 ${mockPrediction.riskLevel === 'low' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{mockPrediction.riskLevel} Risk Detected in delay</span>
           </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Time Analysis */}
         <section className="p-8 rounded-[2.5rem] glass space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest opacity-60 flex items-center gap-2">
              <Clock size={16} /> Daily Active Windows
            </h3>
            <div className="space-y-4">
               <TimeInsight label="Best Focus Window" value="3 AM - 7 AM" color="bg-indigo-500" />
               <TimeInsight label="Weakest Study day" value="Sunday" color="bg-rose-500" />
               <TimeInsight label="Peak Distraction" value="7 PM - 9 PM" color="bg-orange-500" />
               <TimeInsight label="Avg. Focus Duration" value="52 Minutes" color="bg-emerald-500" />
            </div>
         </section>

         {/* Subject Performance */}
         <section className="p-8 rounded-[2.5rem] glass space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest opacity-60 flex items-center gap-2">
              <PieIcon size={16} /> Subject Mastery
            </h3>
            <div className="space-y-3">
               {mockSubjects.map(subject => (
                 <div key={subject.name} className="p-4 rounded-2xl bg-white/5 flex items-center justify-between border border-transparent hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-8 rounded-full ${subject.minutesStudied > 1200 ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                       <div>
                          <div className="text-sm font-bold">{subject.name}</div>
                          <div className="text-[10px] opacity-40 font-bold uppercase">{Math.floor(subject.minutesStudied / 60)}h Studied</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-bold opacity-60">{subject.tasksDone} Tasks</div>
                    </div>
                 </div>
               ))}
            </div>
         </section>
      </div>

      {/* Smart Productivity Insights */}
      <section className="p-8 rounded-[3rem] bg-indigo-600 text-white relative shadow-2xl shadow-indigo-600/30 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                 <Brain size={20} />
              </div>
              <h3 className="font-bold">Smart Productivity AI Insights</h3>
           </div>
           
           <div className="grid gap-4">
              <InsightItem text="Your focus is 24% higher during morning hours compared to evening." />
              <InsightItem text="High correlation detected between 'Biology' watch time and task completion." />
              <InsightItem text="streak of 4 days detected. Maintain for 3 more days to reach 'Expert' tier." />
           </div>

           <button className="w-full h-14 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center gap-2 font-bold text-sm backdrop-blur-md hover:bg-white/30 transition-all">
              Unlock Detailed AI Analysis <ArrowRight size={18} />
           </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-[2rem] glass space-y-2 border border-white/5"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
      <div>
        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{label}</div>
        <div className="text-[9px] opacity-30 font-medium">{sub}</div>
      </div>
    </motion.div>
  );
}

function TimeInsight({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
       <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-lg ${color.replace('bg-', 'shadow-')}`} />
          <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-sm font-black">{value}</span>
    </div>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
       <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
          <Zap size={12} fill="currentColor" />
       </div>
       <p className="text-xs font-medium leading-relaxed opacity-90">{text}</p>
    </div>
  );
}
