import { motion } from 'motion/react';
import { format, subDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';
import { HeatmapDay } from '../../types';

interface StudyHeatmapProps {
  data: HeatmapDay[];
}

export default function StudyHeatmap({ data }: StudyHeatmapProps) {
  const today = startOfToday();
  const daysToShow = 7 * 16; // 16 weeks
  const startDate = subDays(today, daysToShow - 1);
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: today,
  });

  const getLevelColor = (level: number) => {
    switch (level) {
      case 3: return 'bg-emerald-500 shadow-sm shadow-emerald-500/20'; // High
      case 2: return 'bg-yellow-500 shadow-sm shadow-yellow-500/20';  // Med
      case 1: return 'bg-rose-500 shadow-sm shadow-rose-500/20';    // Low
      default: return 'bg-white/5'; // None
    }
  };

  const getDayData = (date: Date) => {
    return data.find(d => isSameDay(new Date(d.date), date));
  };

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex flex-col gap-1.5 min-w-max">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {calendarDays.map((day, i) => {
            const dayData = getDayData(day);
            const level = dayData?.level || 0;
            
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.002 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className={`w-3.5 h-3.5 rounded-sm ${getLevelColor(level)} transition-colors cursor-pointer group relative`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-[10px] font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                  {format(day, 'MMM d')}: {level === 0 ? 'No study' : `${level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'} focus`}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center px-1 mt-2">
          <div className="flex gap-2">
             {[0, 1, 2, 3].map(lvl => (
               <div key={lvl} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-sm ${getLevelColor(lvl)}`} />
                  <span className="text-[8px] font-bold opacity-30 uppercase tracking-tighter">
                    {lvl === 0 ? 'None' : lvl === 1 ? 'Low' : lvl === 2 ? 'Med' : 'High'}
                  </span>
               </div>
             ))}
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Consistency Map</p>
        </div>
      </div>
    </div>
  );
}
