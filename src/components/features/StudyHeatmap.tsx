import { motion } from 'motion/react';
import { format, subDays, startOfToday, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, eachMonthOfInterval, startOfMonth } from 'date-fns';
import { HeatmapDay } from '../../types';
import { useState } from 'react';
import { Clock, CheckSquare, BookOpen, Calendar as CalendarIcon } from 'lucide-react';

interface StudyHeatmapProps {
  data: HeatmapDay[];
  onDayClick?: (date: string, stats: any) => void;
}

export default function StudyHeatmap({ data, onDayClick }: StudyHeatmapProps) {
  const today = startOfToday();
  const weeksToShow = 52; // Full year
  const daysToShow = weeksToShow * 7;
  const startDate = startOfWeek(subDays(today, daysToShow - 7));
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: today,
  });

  const months = eachMonthOfInterval({
    start: startDate,
    end: today
  });

  const getLevelColor = (level: number) => {
    switch (level) {
      case 3: return 'bg-emerald-500 shadow-sm shadow-emerald-500/20'; // High
      case 2: return 'bg-indigo-500 shadow-sm shadow-indigo-500/20';  // Med
      case 1: return 'bg-indigo-500/30';    // Low
      default: return 'bg-white/5'; // None
    }
  };

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const safeData = Array.isArray(data) ? data : [];
    return safeData.find(d => d.date === dateStr);
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full overflow-x-auto pb-4 no-scrollbar cursor-grab active:cursor-grabbing">
        <div className="flex flex-col gap-2 min-w-max">
          {/* Month labels */}
          <div className="flex text-[9px] font-black uppercase tracking-widest opacity-20 h-4 relative">
             {months.map((month, i) => {
               const monthStart = startOfMonth(month);
               const daysFromStart = eachDayOfInterval({ start: startDate, end: monthStart }).length - 1;
               const weekIndex = Math.floor(daysFromStart / 7);
               
               return (
                 <div 
                   key={i} 
                   className="absolute" 
                   style={{ left: `${weekIndex * 18}px` }}
                 >
                   {format(month, 'MMM')}
                 </div>
               );
             })}
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {calendarDays.map((day, i) => {
              const dayData = getDayData(day);
              const level = dayData?.level || 0;
              const dateStr = format(day, 'yyyy-MM-dd');
              
              return (
                <motion.div
                  key={dateStr}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (i % 7) * 0.01 + Math.floor(i/7) * 0.001 }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  onClick={() => onDayClick?.(dateStr, dayData)}
                  className={`w-3.5 h-3.5 rounded-[2px] ${getLevelColor(level)} transition-all cursor-pointer group relative hover:ring-2 ring-white/20`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-[10px] font-bold rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 backdrop-blur-md">
                    {format(day, 'MMM d, yyyy')} • {level === 0 ? 'No study' : `${dayData?.count || 0} mins`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-1">
        <div className="flex gap-2.5">
           {[0, 1, 2, 3].map(lvl => (
             <div key={lvl} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-[2px] ${getLevelColor(lvl)}`} />
             </div>
           ))}
           <span className="text-[10px] font-black opacity-20 uppercase tracking-widest pl-1">Less → More</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
          <CalendarIcon size={10} className="opacity-40" />
          <span className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em]">{weeksToShow} Weeks Productivity</span>
        </div>
      </div>
    </div>
  );
}
